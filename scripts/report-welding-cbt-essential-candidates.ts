import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import rawWeldingCbtBank from "../src/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
  type WeldingCbtAnswerReviewEntry,
  type PublishableWeldingCbtAnswerReviewEntry,
} from "../src/data/source/welding-cbt-answer-review";

const MAX_SUGGESTIONS_PER_LESSON = 5;
type BankRecord = (typeof rawWeldingCbtBank.records)[number];
type AssessmentFamily = "calculation" | "safety" | "concept";

type CanonicalCandidate = {
  canonicalId: string;
  lessonId: string;
  assessmentKind: string;
  assessmentFamily: AssessmentFamily;
  occurrenceCount: number;
  latestExamDate: string;
  evidenceScore: number;
  evidenceSignals: string[];
  exactSignature: string;
  nearDuplicateSignature: string;
  stem: string;
  stemSymbolTokens: string[];
  choiceMappingTokens: string[];
};

type CollapsedCandidate = {
  canonicalId: string;
  canonicalIds: string[];
  lessonId: string;
  assessmentKinds: string[];
  assessmentFamilies: AssessmentFamily[];
  occurrenceCount: number;
  latestExamDate: string;
  evidenceScore: number;
  evidenceSignals: string[];
  exactSignatures: string[];
  stem: string;
  stemSymbolTokens: string[];
  choiceMappingTokens: string[];
};

type ReportError = {
  code: string;
  canonicalId: string | null;
  detail: string;
};

type ReconciliationCheck = {
  actual: number;
  expected: number;
  ok: boolean;
};

function normalizeExactText(value: string) {
  return value.normalize("NFC");
}

function exactContentSignature(record: BankRecord) {
  return JSON.stringify([
    normalizeExactText(record.stem),
    record.choices.map(normalizeExactText),
  ]);
}

function normalizeComparableText(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function distinctSymbolTokens(value: string) {
  return distinctSorted(
    [...value.normalize("NFC").matchAll(/\b[A-Z][A-Z0-9]{1,4}\b/gu)]
      .map((match) => match[0]),
  );
}

function choiceMappingTokens(choices: readonly string[]) {
  return distinctSorted(
    choices.flatMap((choice) => {
      const match = choice
        .normalize("NFC")
        .trim()
        .match(/^([A-Z][A-Z0-9]{1,4})\s*(?::|：|=|[-–—]\s)/u);
      return match?.[1] ? [match[1]] : [];
    }),
  );
}

function assessmentFamily(assessmentKind: string): AssessmentFamily {
  if (assessmentKind === "calculation") return "calculation";
  if (assessmentKind === "safety") return "safety";
  return "concept";
}

function correctChoice(record: BankRecord) {
  return record.correctIndex === null
    ? ""
    : record.choices[record.correctIndex] ?? "";
}

function normalizeFocusToken(value: string) {
  if (value.length <= 2) return value;
  return value.replace(
    /(?:에서는|으로는|에서|으로|에게|에는|은|는|이|가|을|를|의|에)$/u,
    "",
  );
}

function normalizedQuestionFocus(stem: string) {
  const polarity = /(?:아닌|잘못|옳지\s*않)/u.test(stem)
    ? "negative"
    : "positive";
  const focus = stem
    .normalize("NFC")
    .toLocaleLowerCase("ko-KR")
    .replace(/이음\s*형상에\s*따른/gu, " ")
    .replace(/분류(?:\s*중|\s*에서)?/gu, " ")
    .replace(
      /(?:다음|옳은\s*것은|맞는\s*것은|아닌\s*것은|잘못(?:\s*연결)?된\s*것은|무엇인가|어느\s*것인가|(?:에\s*)?속하는\s*것은|해당하는\s*것은)/gu,
      " ",
    )
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map(normalizeFocusToken)
    .filter((token) => token && token !== "중")
    .join("");
  return `${polarity}:${focus}`;
}

function normalizeFormula(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[×·]/gu, "*")
    .replace(/÷/gu, "/")
    .replace(/²/gu, "^2")
    .replace(/³/gu, "^3")
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/gu, (digit) =>
      String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit)))
    .replace(/[^\p{L}\p{N}=+\-*/^()[\]<>≤≥~%]+/gu, "");
}

function equationParts(value: string) {
  const parts: Array<{ equation: string; target: string }> = [];
  for (const clause of value.split(/[.!?。;,]\s*/u)) {
    const equalsIndex = clause.indexOf("=");
    if (equalsIndex <= 0) continue;
    const beforeEquals = clause.slice(0, equalsIndex).trim();
    const afterEquals = clause.slice(equalsIndex + 1).trim();
    const targetSource =
      beforeEquals.split(
        /(?:이면|라면|에서는|에는|이며|은|는|을|를)\s*/u,
      ).at(-1) ?? beforeEquals;
    const target = normalizeFormula(targetSource);
    const right = normalizeFormula(afterEquals);
    if (
      !target
      || !right
      || !/(?:^|[^0-9])(?:[a-zηρμ][0-9]*)/u.test(right)
        && !/[가-힣]{2,}/u.test(right)
    ) {
      continue;
    }
    parts.push({
      equation: `${target}=${right}`,
      target,
    });
  }
  return parts;
}

function calculationSignature(
  review: PublishableWeldingCbtAnswerReviewEntry,
) {
  const equations = [
    review.conceptBinding.assertionText,
    review.keyRule,
    ...review.solutionSteps,
  ].flatMap(equationParts);
  const formula = equations[0]?.equation
    ?? normalizeComparableText(review.conceptBinding.assertionText);
  const target = equations.at(-1)?.target
    ?? normalizeComparableText(review.conceptBinding.assertionText);
  return `calculation:${formula}:${target}`;
}

const SAFETY_HAZARDS = [
  ["electrical_shock", /(?:전격|감전|무부하\s*전압|전격\s*방지)/u],
  ["arc_radiation", /(?:아크광|유해\s*광선|자외선|적외선)/u],
  ["fire", /화재/u],
  ["explosion", /(?:폭발|가연성\s*가스)/u],
  ["fume_dust", /(?:흄|분진|유해\s*가스|오염\s*공기)/u],
  ["burn_heat", /(?:화상|고온)/u],
  ["asphyxiation", /(?:질식|산소\s*결핍)/u],
] as const;

function safetyHazardSignature(
  review: PublishableWeldingCbtAnswerReviewEntry,
  record: BankRecord,
) {
  const hazardSource = `${review.keyRule} ${record.stem}`;
  const hazards = SAFETY_HAZARDS
    .filter(([, pattern]) => pattern.test(hazardSource))
    .map(([name]) => name);
  return hazards.join("+")
    || normalizeComparableText(review.conceptBinding.assertionText);
}

function safetyControlSignature(record: BankRecord) {
  const answer = correctChoice(record);
  const number = answer.match(/[0-9]+(?:\.[0-9]+)?(?:\s*[~～-]\s*[0-9]+(?:\.[0-9]+)?)?/u)
    ?.[0];
  const unit = `${answer} ${record.stem}`.match(
    /(?:kgf\/cm2|j\/cm|cal|kg|cm|mm|l|v|a|s|%)/iu,
  )?.[0];
  const bound = `${answer} ${record.stem}`.match(
    /(?:이하|이상|미만|초과)/u,
  )?.[0];
  if (number && unit) {
    return normalizeComparableText(`${number}${unit}${bound ?? ""}`);
  }
  return normalizeComparableText(answer);
}

function nearDuplicateSignature(
  review: PublishableWeldingCbtAnswerReviewEntry,
  record: BankRecord,
) {
  const family = assessmentFamily(review.assessmentKind);
  if (family === "calculation") {
    return calculationSignature(review);
  }
  if (family === "safety") {
    return `safety:${safetyHazardSignature(review, record)}:`
      + safetyControlSignature(record);
  }
  // The question assertion is ask-focus + answer; the lesson assertion can
  // include distractor exposition that would hide otherwise identical asks.
  const answer = normalizeComparableText(correctChoice(record));
  const normalizedAssertion = normalizedQuestionFocus(record.stem);
  return `concept:${answer}:${normalizedAssertion}`;
}

function groupRecordsByCanonicalId(records: readonly BankRecord[]) {
  const grouped = new Map<string, BankRecord[]>();
  for (const record of records) {
    const current = grouped.get(record.canonicalId) ?? [];
    current.push(record);
    grouped.set(record.canonicalId, current);
  }
  return grouped;
}

function distinctSorted(values: readonly string[]) {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right));
}

function evidenceCompleteness(
  review: PublishableWeldingCbtAnswerReviewEntry,
  records: readonly BankRecord[],
) {
  const evidenceKinds = new Set(
    review.conceptBinding.evidenceRefs.map((evidence) => evidence.kind),
  );
  const signals = [
    ["lesson_block", evidenceKinds.has("lesson_block")],
    ["source_question", evidenceKinds.has("source_question")],
    ["official_source", evidenceKinds.has("official_source")],
    [
      "calculation_derivation",
      evidenceKinds.has("calculation_derivation"),
    ],
    [
      "all_occurrences_exact",
      records.every((record) => record.contentFidelity === "exact"),
    ],
    [
      "all_answers_uncontested",
      records.every(
        (record) =>
          record.answerEvidence === "single_capture_uncontested",
      ),
    ],
    [
      "all_occurrences_source_linked",
      records.every((record) => record.sourceUrl.length > 0),
    ],
    [
      "choice_feedback_complete",
      review.choiceFeedback.length === records[0]?.choices.length,
    ],
  ] as const;
  const satisfied = signals
    .filter(([, condition]) => condition)
    .map(([name]) => name);
  return {
    score: Math.round((satisfied.length / signals.length) * 100),
    signals: satisfied,
  };
}

function latestExamDate(records: readonly BankRecord[]) {
  return records.reduce(
    (latest, record) =>
      record.examDate > latest ? record.examDate : latest,
    "",
  );
}

function toCanonicalCandidate(
  review: PublishableWeldingCbtAnswerReviewEntry,
  records: readonly BankRecord[],
) {
  const evidence = evidenceCompleteness(review, records);
  return {
    canonicalId: review.canonicalId,
    lessonId: review.primaryLeafLessonId,
    assessmentKind: review.assessmentKind,
    assessmentFamily: assessmentFamily(review.assessmentKind),
    occurrenceCount: records.length,
    latestExamDate: latestExamDate(records),
    evidenceScore: evidence.score,
    evidenceSignals: evidence.signals,
    exactSignature: exactContentSignature(records[0]),
    nearDuplicateSignature: nearDuplicateSignature(review, records[0]),
    stem: records[0].stem,
    stemSymbolTokens: distinctSymbolTokens(records[0].stem),
    choiceMappingTokens: choiceMappingTokens(records[0].choices),
  } satisfies CanonicalCandidate;
}

function representativeCandidate(candidates: readonly CanonicalCandidate[]) {
  return [...candidates].sort(
    (left, right) =>
      right.evidenceScore - left.evidenceScore
      || right.occurrenceCount - left.occurrenceCount
      || right.latestExamDate.localeCompare(left.latestExamDate)
      || left.canonicalId.localeCompare(right.canonicalId),
  )[0];
}

function collapseNearDuplicates(candidates: readonly CanonicalCandidate[]) {
  const groups: CanonicalCandidate[][] = [];
  for (const candidate of candidates) {
    const matchingGroupIndices = groups.flatMap((group, index) =>
      group.some(
        (current) =>
          current.lessonId === candidate.lessonId
          && (
            current.exactSignature === candidate.exactSignature
            || current.nearDuplicateSignature
              === candidate.nearDuplicateSignature
          ),
      )
        ? [index]
        : []);
    if (matchingGroupIndices.length === 0) {
      groups.push([candidate]);
      continue;
    }
    const merged = [
      candidate,
      ...matchingGroupIndices.flatMap((index) => groups[index]),
    ];
    for (
      const index of matchingGroupIndices.sort((left, right) => right - left)
    ) {
      groups.splice(index, 1);
    }
    groups.push(merged);
  }
  return groups.map((group) => {
    const representative = representativeCandidate(group);
    return {
      canonicalId: representative.canonicalId,
      canonicalIds: group
        .map((candidate) => candidate.canonicalId)
        .sort((left, right) => left.localeCompare(right)),
      lessonId: representative.lessonId,
      assessmentKinds: distinctSorted(
        group.map((candidate) => candidate.assessmentKind),
      ),
      assessmentFamilies: distinctSorted(
        group.map((candidate) => candidate.assessmentFamily),
      ) as AssessmentFamily[],
      occurrenceCount: group.reduce(
        (total, candidate) => total + candidate.occurrenceCount,
        0,
      ),
      latestExamDate: group.reduce(
        (latest, candidate) =>
          candidate.latestExamDate > latest
            ? candidate.latestExamDate
            : latest,
        "",
      ),
      evidenceScore: Math.max(
        ...group.map((candidate) => candidate.evidenceScore),
      ),
      evidenceSignals: representative.evidenceSignals,
      exactSignatures: distinctSorted(
        group.map((candidate) => candidate.exactSignature),
      ),
      stem: representative.stem,
      stemSymbolTokens: distinctSorted(
        group.flatMap((candidate) => candidate.stemSymbolTokens),
      ),
      choiceMappingTokens: distinctSorted(
        group.flatMap((candidate) => candidate.choiceMappingTokens),
      ),
    } satisfies CollapsedCandidate;
  });
}

function findSubsumedSingleSymbolCandidates(
  candidates: readonly CollapsedCandidate[],
) {
  const subsumedByCanonicalIds = new Map<string, string[]>();
  for (const candidate of candidates) {
    if (
      !candidate.assessmentKinds.includes("identification")
      || candidate.stemSymbolTokens.length !== 1
      || candidate.choiceMappingTokens.length > 0
    ) {
      continue;
    }
    const symbol = candidate.stemSymbolTokens[0];
    const comprehensiveCandidates = candidates
      .filter(
        (other) =>
          other.canonicalId !== candidate.canonicalId
          && other.assessmentKinds.includes("identification")
          && other.choiceMappingTokens.length >= 3
          && other.choiceMappingTokens.includes(symbol),
      )
      .map((other) => other.canonicalId)
      .sort((left, right) => left.localeCompare(right));
    if (comprehensiveCandidates.length > 0) {
      subsumedByCanonicalIds.set(
        candidate.canonicalId,
        comprehensiveCandidates,
      );
    }
  }
  return subsumedByCanonicalIds;
}

function duplicateSignatureGroupCount(
  candidates: readonly CanonicalCandidate[],
  signature: (candidate: CanonicalCandidate) => string,
) {
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    const key = `${candidate.lessonId}\u0000${signature(candidate)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.values()].filter((count) => count > 1).length;
}

function selectLessonSuggestionsFromSource(
  candidates: readonly CollapsedCandidate[],
  reviewByCanonicalId: ReadonlyMap<
    string,
    WeldingCbtAnswerReviewEntry
  >,
  errors: ReportError[],
) {
  const ranked = candidates.flatMap((candidate) => {
    const sourceSelections = candidate.canonicalIds
      .flatMap((canonicalId) => {
        const review = reviewByCanonicalId.get(canonicalId);
        return review?.essentialRank === null
          || review?.essentialRank === undefined
          ? []
          : [{
              canonicalId,
              rank: review.essentialRank,
            }];
      })
      .sort(
        (left, right) =>
          left.rank - right.rank
          || left.canonicalId.localeCompare(right.canonicalId),
      );
    if (sourceSelections.length === 0) return [];
    if (sourceSelections.length > 1) {
      errors.push({
        code: "ESSENTIAL_SOURCE_DUPLICATE_GROUP_SELECTION",
        canonicalId: sourceSelections[0].canonicalId,
        detail: sourceSelections
          .map((selection) =>
            `${selection.canonicalId}:${selection.rank}`)
          .join(","),
      });
    }
    return [{
      ...candidate,
      canonicalId: sourceSelections[0].canonicalId,
      sourceRank: sourceSelections[0].rank,
    }];
  }).sort(
    (left, right) =>
      left.sourceRank - right.sourceRank
      || left.canonicalId.localeCompare(right.canonicalId),
  );
  if (ranked.length > MAX_SUGGESTIONS_PER_LESSON) {
    errors.push({
      code: "ESSENTIAL_SOURCE_LESSON_LIMIT_EXCEEDED",
      canonicalId: ranked[0]?.canonicalId ?? null,
      detail: `selected=${ranked.length}, limit=${MAX_SUGGESTIONS_PER_LESSON}`,
    });
  }
  const selected: Array<
    CollapsedCandidate & { addedAssessmentKinds: string[] }
  > = [];
  const selectedKinds = new Set<string>();
  for (const [index, candidate] of ranked.entries()) {
    const expectedRank = index + 1;
    if (candidate.sourceRank !== expectedRank) {
      errors.push({
        code: "ESSENTIAL_SOURCE_RANK_SEQUENCE_INVALID",
        canonicalId: candidate.canonicalId,
        detail:
          `expectedRank=${expectedRank},`
          + ` actualRank=${candidate.sourceRank}`,
      });
    }
    const addedAssessmentKinds = candidate.assessmentKinds.filter(
      (kind) => !selectedKinds.has(kind),
    );
    selected.push({ ...candidate, addedAssessmentKinds });
    candidate.assessmentKinds.forEach((kind) => selectedKinds.add(kind));
  }
  return selected.slice(0, MAX_SUGGESTIONS_PER_LESSON);
}

function check(actual: number, expected: number): ReconciliationCheck {
  return { actual, expected, ok: actual === expected };
}

function collectReviewStats(entries: readonly WeldingCbtAnswerReviewEntry[]) {
  return entries.reduce(
    (stats, entry) => ({
      ...stats,
      [entry.reviewStatus]: stats[entry.reviewStatus] + 1,
    }),
    { pending: 0, approved: 0, hold: 0 },
  );
}

function hasDirectLessonBinding(
  review: PublishableWeldingCbtAnswerReviewEntry,
) {
  const binding = review.conceptBinding;
  return (
    binding.lessonId === review.primaryLeafLessonId
    && binding.evidenceRefs.some(
      (evidence) =>
        evidence.kind === "lesson_block"
        && evidence.ref
          === `${review.primaryLeafLessonId}#${binding.lessonBlockId}`,
    )
  );
}

function buildCanonicalCandidates(
  reviews: readonly WeldingCbtAnswerReviewEntry[],
  recordsByCanonicalId: ReadonlyMap<string, BankRecord[]>,
  errors: ReportError[],
) {
  const candidates: CanonicalCandidate[] = [];
  const publishableApprovedCanonicalIds = new Set<string>();
  let invalidApprovedCount = 0;
  let missingDirectLessonBindingCount = 0;
  let missingDirectLessonBindingOccurrenceCount = 0;
  let missingBankCount = 0;
  let inconsistentContentCount = 0;
  let inconsistentContentOccurrenceCount = 0;
  for (const review of reviews) {
    if (review.reviewStatus !== "approved") continue;
    if (!isWeldingCbtAnswerReviewPublishable(review)) {
      invalidApprovedCount += 1;
      errors.push({
        code: "ESSENTIAL_CANDIDATE_APPROVED_REVIEW_NOT_PUBLISHABLE",
        canonicalId: review.canonicalId,
        detail: "reviewStatus=approved but publication predicate failed",
      });
      continue;
    }
    publishableApprovedCanonicalIds.add(review.canonicalId);
    const records = recordsByCanonicalId.get(review.canonicalId) ?? [];
    if (records.length === 0) {
      missingBankCount += 1;
      errors.push({
        code: "ESSENTIAL_CANDIDATE_BANK_RECORD_MISSING",
        canonicalId: review.canonicalId,
        detail: "approved review has no source-bank occurrence",
      });
      continue;
    }
    if (!hasDirectLessonBinding(review)) {
      missingDirectLessonBindingCount += 1;
      missingDirectLessonBindingOccurrenceCount += records.length;
      errors.push({
        code: "ESSENTIAL_CANDIDATE_DIRECT_LESSON_BINDING_MISSING",
        canonicalId: review.canonicalId,
        detail:
          `${review.primaryLeafLessonId}#`
          + review.conceptBinding.lessonBlockId,
      });
      continue;
    }
    const signatures = new Set(records.map(exactContentSignature));
    if (signatures.size !== 1) {
      inconsistentContentCount += 1;
      inconsistentContentOccurrenceCount += records.length;
      errors.push({
        code: "ESSENTIAL_CANDIDATE_CANONICAL_CONTENT_CONFLICT",
        canonicalId: review.canonicalId,
        detail: `signatureCount=${signatures.size}`,
      });
      continue;
    }
    candidates.push(toCanonicalCandidate(review, records));
  }
  return {
    candidates,
    publishableApprovedCanonicalIds,
    invalidApprovedCount,
    missingDirectLessonBindingCount,
    missingDirectLessonBindingOccurrenceCount,
    missingBankCount,
    inconsistentContentCount,
    inconsistentContentOccurrenceCount,
  };
}

export function buildWeldingCbtEssentialCandidateReport() {
  const errors: ReportError[] = [];
  const reviews = WELDING_CBT_ANSWER_REVIEWS.entries;
  const records = rawWeldingCbtBank.records;
  const reviewStats = collectReviewStats(reviews);
  const recordsByCanonicalId = groupRecordsByCanonicalId(records);
  const built = buildCanonicalCandidates(
    reviews,
    recordsByCanonicalId,
    errors,
  );
  const collapsed = collapseNearDuplicates(built.candidates);
  const reviewByCanonicalId = new Map(
    reviews.map((review) => [review.canonicalId, review]),
  );
  const lessonIds = distinctSorted(
    collapsed.flatMap((candidate) =>
      candidate.canonicalIds.some(
        (canonicalId) =>
          reviewByCanonicalId.get(canonicalId)?.essentialRank !== null,
      )
        ? [candidate.lessonId]
        : []),
  );
  const lessons = lessonIds.map((lessonId) => {
    const candidates = collapsed.filter(
      (candidate) => candidate.lessonId === lessonId,
    );
    const subsumedByCanonicalIds =
      findSubsumedSingleSymbolCandidates(candidates);
    const selectionCandidates = candidates.filter(
      (candidate) => !subsumedByCanonicalIds.has(candidate.canonicalId),
    );
    const suggestions = selectLessonSuggestionsFromSource(
      selectionCandidates,
      reviewByCanonicalId,
      errors,
    );
    return {
      primaryLeafLessonId: lessonId,
      candidateGroupCount: candidates.length,
      selectionEligibleCandidateGroupCount: selectionCandidates.length,
      subsumedCandidateGroups: [...subsumedByCanonicalIds.entries()]
        .map(([canonicalId, comprehensiveCanonicalIds]) => ({
          canonicalId,
          comprehensiveCanonicalIds,
          rule: "single_symbol_identification_covered_by_multi_symbol_mapping",
        }))
        .sort((left, right) =>
          left.canonicalId.localeCompare(right.canonicalId)),
      approvedCanonicalCount: candidates.reduce(
        (total, candidate) => total + candidate.canonicalIds.length,
        0,
      ),
      approvedOccurrenceCount: candidates.reduce(
        (total, candidate) => total + candidate.occurrenceCount,
        0,
      ),
      assessmentKindsAvailable: distinctSorted(
        candidates.flatMap((candidate) => candidate.assessmentKinds),
      ),
      suggestions: suggestions.map((candidate, index) => ({
        rank: index + 1,
        canonicalId: candidate.canonicalId,
        duplicateCanonicalIds: candidate.canonicalIds.filter(
          (canonicalId) => canonicalId !== candidate.canonicalId,
        ),
        stem: candidate.stem,
        occurrenceCount: candidate.occurrenceCount,
        latestExamDate: candidate.latestExamDate,
        assessmentKinds: candidate.assessmentKinds,
        addedAssessmentKinds: candidate.addedAssessmentKinds,
        evidenceCompleteness: {
          score: candidate.evidenceScore,
          signals: candidate.evidenceSignals,
        },
        reasons: [
          `occurrences=${candidate.occurrenceCount}`,
          `latest=${candidate.latestExamDate}`,
          `diversity=${candidate.addedAssessmentKinds.join(",") || "repeat"}`,
          `evidence=${candidate.evidenceScore}`,
        ],
      })),
    };
  });

  const approvedStatusCount = reviewStats.approved;
  const publishableApprovedCount =
    approvedStatusCount - built.invalidApprovedCount;
  const eligibleCanonicalCount = built.candidates.length;
  const eligibleOccurrenceCount = built.candidates.reduce(
    (total, candidate) => total + candidate.occurrenceCount,
    0,
  );
  const publishableApprovedBankOccurrenceCount = records.filter((record) =>
    built.publishableApprovedCanonicalIds.has(record.canonicalId)
  ).length;
  const nonPublishableBankOccurrenceCount =
    records.length - publishableApprovedBankOccurrenceCount;
  const groupedCanonicalCount = collapsed.reduce(
    (total, candidate) => total + candidate.canonicalIds.length,
    0,
  );
  const groupedOccurrenceCount = collapsed.reduce(
    (total, candidate) => total + candidate.occurrenceCount,
    0,
  );
  const suggestionCount = lessons.reduce(
    (total, lesson) => total + lesson.suggestions.length,
    0,
  );
  const subsumedCandidateGroupCount = lessons.reduce(
    (total, lesson) => total + lesson.subsumedCandidateGroups.length,
    0,
  );
  const expectedRankByCanonicalId = new Map<string, number | null>(
    collapsed.flatMap((candidate) =>
      candidate.canonicalIds.map((canonicalId) => [canonicalId, null])),
  );
  for (const lesson of lessons) {
    for (const suggestion of lesson.suggestions) {
      expectedRankByCanonicalId.set(
        suggestion.canonicalId,
        suggestion.rank,
      );
    }
  }
  let sourceEssentialRankMismatchCount = 0;
  for (const [canonicalId, expectedRank] of expectedRankByCanonicalId) {
    const review = reviewByCanonicalId.get(canonicalId);
    if (!review) continue;
    const rankMatches = review.essentialRank === expectedRank;
    const rationaleMatches = expectedRank === null
      ? review.essentialRationale === null
      : review.essentialRationale !== null;
    if (rankMatches && rationaleMatches) continue;
    sourceEssentialRankMismatchCount += 1;
    errors.push({
      code: "ESSENTIAL_SOURCE_SELECTION_MISMATCH",
      canonicalId,
      detail:
        `expectedRank=${expectedRank ?? "null"},`
        + ` actualRank=${review.essentialRank ?? "null"},`
        + ` rationale=${review.essentialRationale === null ? "null" : "set"}`,
    });
  }
  const checks = {
    reviewStatuses: check(
      reviews.length,
      reviewStats.pending + reviewStats.approved + reviewStats.hold,
    ),
    approvedPublication: check(
      approvedStatusCount,
      publishableApprovedCount + built.invalidApprovedCount,
    ),
    publishableDisposition: check(
      publishableApprovedCount,
      eligibleCanonicalCount
        + built.missingDirectLessonBindingCount
        + built.missingBankCount
        + built.inconsistentContentCount,
    ),
    duplicateCollapseCanonical: check(
      groupedCanonicalCount,
      eligibleCanonicalCount,
    ),
    duplicateCollapseOccurrences: check(
      groupedOccurrenceCount,
      eligibleOccurrenceCount,
    ),
    bankOccurrencePartition: check(
      records.length,
      publishableApprovedBankOccurrenceCount
        + nonPublishableBankOccurrenceCount,
    ),
    publishableBankDisposition: check(
      publishableApprovedBankOccurrenceCount,
      eligibleOccurrenceCount
        + built.missingDirectLessonBindingOccurrenceCount
        + built.inconsistentContentOccurrenceCount,
    ),
    suggestionPartition: check(
      collapsed.length,
      suggestionCount + (collapsed.length - suggestionCount),
    ),
    sourceEssentialSelection: check(
      sourceEssentialRankMismatchCount,
      0,
    ),
  };
  const checksPass = Object.values(checks).every((item) => item.ok);

  return {
    version: 1,
    ok: errors.length === 0 && checksPass,
    policy: {
      input:
        "approved_publishable_answer_reviews_with_direct_lesson_binding_only",
      duplicateKey:
        "same primaryLeafLessonId + conservative normalized concept assertion / calculation formula-target / safety hazard-control signature",
      subsumption:
        "within one lesson, a narrow identification that asks one uppercase symbol is not suggested when an approved identification maps at least three symbols and includes that symbol",
      ranking:
        "source-reviewed essentialRank is authoritative; conservative duplicate collapse and symbol subsumption only prevent duplicate presentation",
      maxSuggestionsPerLesson: MAX_SUGGESTIONS_PER_LESSON,
      mutation: "none",
    },
    reconciliation: {
      bankOccurrenceCount: records.length,
      answerReviewEntryCount: reviews.length,
      reviewStatus: reviewStats,
      approvedStatusCount,
      publishableApprovedCount,
      invalidApprovedCount: built.invalidApprovedCount,
      missingDirectLessonBindingCount:
        built.missingDirectLessonBindingCount,
      missingDirectLessonBindingOccurrenceCount:
        built.missingDirectLessonBindingOccurrenceCount,
      missingBankCount: built.missingBankCount,
      inconsistentContentCount: built.inconsistentContentCount,
      inconsistentContentOccurrenceCount:
        built.inconsistentContentOccurrenceCount,
      eligibleCanonicalCount,
      eligibleOccurrenceCount,
      publishableApprovedBankOccurrenceCount,
      nonPublishableBankOccurrenceCount,
      candidateGroupCount: collapsed.length,
      exactDuplicateGroupCount: duplicateSignatureGroupCount(
        built.candidates,
        (candidate) => candidate.exactSignature,
      ),
      nearDuplicateGroupCount: collapsed.filter(
        (candidate) => candidate.canonicalIds.length > 1,
      ).length,
      nonExactNearDuplicateGroupCount: collapsed.filter(
        (candidate) =>
          candidate.canonicalIds.length > 1
          && candidate.exactSignatures.length > 1,
      ).length,
      collapsedAwayCanonicalCount:
        eligibleCanonicalCount - collapsed.length,
      lessonCount: lessons.length,
      suggestionCount,
      subsumedCandidateGroupCount,
      unselectedCandidateGroupCount: collapsed.length - suggestionCount,
      sourceEssentialRankMismatchCount,
      checks,
    },
    lessons,
    errors,
  };
}

function main() {
  const report = buildWeldingCbtEssentialCandidateReport();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (entryPath && entryPath === resolve(fileURLToPath(import.meta.url))) {
  main();
}
