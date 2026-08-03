/**
 * A caller-owned projection of an approved question and its already-reviewed
 * curation metadata. `canonicalId`, `duplicateGroupId`, and `essentialRank`
 * are optional because not every approved question source supplies them.
 */
export type PracticeQuestionDeduplicationCandidate = {
  id: string;
  lessonId: string;
  stem: string;
  choices: readonly string[];
  canonicalId?: string;
  duplicateGroupId?: string;
  essentialRank?: number | null;
};

export type PracticeQuestionDeduplicationOptions = {
  count: number | "all";
  seed: number;
  lessonTargets?: Readonly<Record<string, number>>;
};

class DisjointSet {
  private readonly parents: number[];

  constructor(size: number) {
    this.parents = Array.from({ length: size }, (_, index) => index);
  }

  find(index: number): number {
    const parent = this.parents[index];
    if (parent === index) return index;
    const root = this.find(parent);
    this.parents[index] = root;
    return root;
  }

  join(left: number, right: number) {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot !== rightRoot) this.parents[rightRoot] = leftRoot;
  }
}

function normalized(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

function nonEmptyToken(prefix: string, value: string | undefined) {
  const token = value ? normalized(value) : "";
  return token ? `${prefix}:${token}` : null;
}

function exactContentToken(candidate: PracticeQuestionDeduplicationCandidate) {
  const stem = normalized(candidate.stem);
  const choices = candidate.choices.map(normalized).sort().join("\u0001");
  return `content:${stem}\u0000${choices}`;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function essentialRank(candidate: PracticeQuestionDeduplicationCandidate) {
  return candidate.essentialRank ?? Number.POSITIVE_INFINITY;
}

/**
 * Selects a deterministic, session-safe subset without altering candidate IDs.
 * Equivalence is deliberately limited to an explicit duplicate group, an
 * approved canonical ID, or exact normalized stem and unordered choice text.
 */
export function selectDeduplicatedPracticeQuestions<
  T extends PracticeQuestionDeduplicationCandidate,
>(
  candidates: readonly T[],
  options: PracticeQuestionDeduplicationOptions,
): T[] {
  const maximum =
    options.count === "all"
      ? candidates.length
      : Math.max(0, Math.floor(options.count));
  if (maximum === 0 || candidates.length === 0) return [];

  const groups = new DisjointSet(candidates.length);
  const firstIndexByToken = new Map<string, number>();
  for (const [index, candidate] of candidates.entries()) {
    const tokens = [
      `id:${candidate.id}`,
      nonEmptyToken("canonical", candidate.canonicalId),
      nonEmptyToken("duplicate", candidate.duplicateGroupId),
      exactContentToken(candidate),
    ].filter((token): token is string => token !== null);
    for (const token of tokens) {
      const previous = firstIndexByToken.get(token);
      if (previous === undefined) firstIndexByToken.set(token, index);
      else groups.join(previous, index);
    }
  }

  const ordered = (indices: readonly number[]) =>
    [...indices].sort(
      (left, right) =>
        essentialRank(candidates[left]) - essentialRank(candidates[right]) ||
        stableHash(`${options.seed}:${candidates[left].id}`) -
          stableHash(`${options.seed}:${candidates[right].id}`) ||
        left - right,
    );
  const selected: T[] = [];
  const selectedGroups = new Set<number>();
  const select = (index: number) => {
    const group = groups.find(index);
    if (selectedGroups.has(group) || selected.length >= maximum) return;
    selectedGroups.add(group);
    selected.push(candidates[index]);
  };

  const requestedLessons = new Set(
    candidates
      .map((candidate) => candidate.lessonId)
      .filter((lessonId) => (options.lessonTargets?.[lessonId] ?? 0) > 0),
  );
  for (const lessonId of requestedLessons) {
    const target = Math.max(
      0,
      Math.floor(options.lessonTargets?.[lessonId] ?? 0),
    );
    const before = selected.length;
    for (const index of ordered(
      candidates.flatMap((candidate, index) =>
        candidate.lessonId === lessonId ? [index] : [],
      ),
    )) {
      if (selected.length - before >= target) break;
      select(index);
    }
  }

  for (const index of ordered(candidates.map((_, index) => index)))
    select(index);
  return selected;
}
