export type JosaPair = "은/는" | "이/가" | "을/를" | "과/와" | "으로/로";

const JOSA: Record<JosaPair, readonly [withBatchim: string, withoutBatchim: string]> = {
  "은/는": ["은", "는"],
  "이/가": ["이", "가"],
  "을/를": ["을", "를"],
  "과/와": ["과", "와"],
  "으로/로": ["으로", "로"],
};

function lastPronouncedCharacter(value: string) {
  return [...value.normalize("NFC")].reverse().find((character) => /[가-힣A-Za-z0-9]/.test(character)) ?? "";
}

function batchimInfo(value: string) {
  const character = lastPronouncedCharacter(value);
  const code = character.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jongseong = (code - 0xac00) % 28;
    return { hasBatchim: jongseong !== 0, isRieul: jongseong === 8 };
  }

  if (/\d/.test(character)) {
    const hasBatchim = /[013678]/.test(character);
    return { hasBatchim, isRieul: /[178]/.test(character) };
  }

  return { hasBatchim: false, isRieul: false };
}

export function withJosa(value: string, pair: JosaPair) {
  const { hasBatchim, isRieul } = batchimInfo(value);
  const [withBatchim, withoutBatchim] = JOSA[pair];
  const particle = pair === "으로/로" && isRieul ? withoutBatchim : hasBatchim ? withBatchim : withoutBatchim;
  return `${value}${particle}`;
}

export function quoteWithJosa(value: string, pair: JosaPair) {
  return withJosa(`‘${value}’`, pair);
}

export type KoreanLanguageIssue = {
  expression: string;
  expected: string;
};

const QUOTED_JOSA = /‘([^’]+)’(은|는|이|가|을|를|과|와|으로|로)/g;
const REPEATED_QUOTED_SUBJECT = /‘([^’]+)’(?:은|는|이|가)\s+\1(?:은|는|이|가)/g;
const PARTICLE_TO_PAIR: Record<string, JosaPair> = {
  은: "은/는",
  는: "은/는",
  이: "이/가",
  가: "이/가",
  을: "을/를",
  를: "을/를",
  과: "과/와",
  와: "과/와",
  으로: "으로/로",
  로: "으로/로",
};

export function findKoreanLanguageIssues(value: string) {
  const issues: KoreanLanguageIssue[] = [];
  for (const match of value.matchAll(QUOTED_JOSA)) {
    const [, noun, actual] = match;
    const pair = PARTICLE_TO_PAIR[actual];
    const expected = withJosa(noun, pair).slice(noun.length);
    if (actual !== expected) issues.push({ expression: match[0], expected: `‘${noun}’${expected}` });
  }

  for (const match of value.matchAll(REPEATED_QUOTED_SUBJECT)) {
    issues.push({ expression: match[0], expected: "같은 주어를 한 번만 사용" });
  }

  for (const awkward of ["판단규칙", "에어빼기한다", "이 질문의 대상과 정확히 일치하는지"]) {
    if (value.includes(awkward)) issues.push({ expression: awkward, expected: "자연스러운 기술 문장으로 수정" });
  }
  return issues;
}
