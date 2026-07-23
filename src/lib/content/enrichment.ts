import { getGroupGuide } from "@/lib/content/group-guides";
import { findKoreanLanguageIssues, quoteWithJosa } from "@/lib/content/korean";
import type {
  ChoiceFeedback,
  ContentQuality,
  LessonBlock,
  LessonBlockKind,
  Question,
} from "@/lib/domain/types";

export const GENERIC_CONTENT_PATTERNS = [
  "정답의 판단 기준과 일치합니다",
  "정답의 핵심 조건과 일치하지 않습니다",
  "문제의 표현과 분리해 이해합니다",
  "검수 단계에서 확인합니다",
  "정의·조건·적용 범위 중 적어도 하나",
  "관련 용어가 포함되어 있어 정답처럼 보일 수 있습니다",
] as const;

type FeedbackInput = {
  stem: string;
  choiceText: string;
  correctText: string;
  correct: boolean;
  explanation: string;
  choiceEvidence?: string;
  concept: string;
  groupId: string;
  groupTitle: string;
};

type TheoryEvidence = {
  title: string;
  body: string;
  score: number;
} | null;

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sentence(value: string) {
  const clean = compact(value).replace(/[.。]+$/g, "");
  return clean ? `${clean}.` : "";
}

function withoutRepeatedSubject(value: string, subject: string) {
  const escaped = subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(new RegExp(`^${escaped}\\s*(?:은|는|이|가)\\s*`), "");
}

function tableCell(value: string) {
  return compact(value).replace(/\|/g, "\\|");
}

function isNegativeStem(stem: string) {
  return /아닌 것은|옳지 않은|틀린 것은|잘못된|적합하지 않은|거리가 먼/.test(stem);
}

function sharedCategory(choiceText: string, correctText: string) {
  const suffixes = [
    "밸브",
    "용접",
    "베어링",
    "센서",
    "유량계",
    "압축기",
    "펌프",
    "윤활유",
    "그리스",
    "공차",
    "진동",
    "소음",
    "보전",
    "검사",
    "처리",
    "제어",
    "회로",
    "이음",
  ];
  const suffix = suffixes.find((item) => choiceText.includes(item) || correctText.includes(item));
  if (suffix) return `두 표현 모두 ${quoteWithJosa(suffix, "과/와")} 연결되어 같은 계열의 답처럼 보일 수 있습니다.`;
  if (/\d|%|mm|cm|MPa|Pa|Hz|rpm|℃|°C|dB/i.test(`${choiceText} ${correctText}`)) {
    return "수치·단위가 함께 제시되어 계산식이나 기준값의 일부처럼 보이기 쉽습니다.";
  }
  if (/원인|고장|불량|누설|마모|파손|열화|진단|점검/.test(`${choiceText} ${correctText}`)) {
    return "같은 고장·점검 범주에서 함께 접하는 표현이라 직접 원인과 연관 증상을 혼동하기 쉽습니다.";
  }
  return "같은 세부항목군에서 함께 학습하는 용어이므로 대상·조건을 끝까지 확인하지 않으면 정답처럼 보일 수 있습니다.";
}

export function buildChoiceFeedback(input: FeedbackInput): ChoiceFeedback {
  const rule = sentence(input.explanation) || `${input.concept}의 정의와 적용 조건을 기준으로 판단합니다.`;
  const comparisonRule = sentence(withoutRepeatedSubject(input.explanation, input.correctText)) || rule;
  const choiceEvidence = sentence(withoutRepeatedSubject(input.choiceEvidence ?? "", input.choiceText));
  if (input.correct) {
    const rationale = isNegativeStem(input.stem)
      ? `${quoteWithJosa(input.choiceText, "은/는")} 이 문항에서 ‘옳지 않은 것’으로 골라야 하는 보기입니다. ${rule}`
      : `${quoteWithJosa(input.choiceText, "이/가")} 질문의 요구에 직접 답합니다. ${rule}`;
    return {
      rationale,
      plausibleReason: `문제의 핵심어가 정답 보기의 기능·조건과 직접 연결되어 가장 타당하게 보입니다.`,
      incorrectPoint: null,
      keyRule: `핵심 판단 기준은 다음과 같습니다. ${rule}`,
      differenceFromCorrect: null,
    };
  }

  const negative = isNegativeStem(input.stem);
  const incorrectPoint = negative
      ? choiceEvidence
        ? `${quoteWithJosa(input.choiceText, "은/는")} 다음 근거에 따라 실제로 성립합니다. ${choiceEvidence} 따라서 ‘옳지 않은 것’을 찾는 이 문항의 정답으로 고를 수 없습니다.`
        : `${quoteWithJosa(input.choiceText, "은/는")} ${quoteWithJosa(input.concept, "과/와")} 관련해 실제로 성립하는 설명입니다. 따라서 ‘옳지 않은 것’을 찾는 이 문항의 정답으로 고를 수 없습니다.`
      : choiceEvidence
        ? `${quoteWithJosa(input.choiceText, "은/는")} 다음 조건을 설명하는 별개의 개념입니다. ${choiceEvidence} 이 문항이 요구하는 직접 근거는 ${rule}`
        : `${quoteWithJosa(input.choiceText, "은/는")} ${quoteWithJosa(input.correctText, "과/와")} 대상·기능·적용 조건이 다릅니다. 정답을 판단하는 직접 근거는 ${rule}`;
  return {
    rationale: negative
      ? `${quoteWithJosa(input.choiceText, "은/는")} 문항이 찾는 예외가 아니라 ${input.groupTitle}에서 성립하는 설명입니다.`
      : `${quoteWithJosa(input.choiceText, "은/는")} 관련 용어이지만, 질문이 요구하는 조건에 직접 답하는 보기는 ‘${input.correctText}’입니다.`,
    plausibleReason: choiceEvidence
      ? `‘${input.choiceText}’ 자체는 기술적으로 성립하는 설명과 연결되므로, 문항이 묻는 대상까지 확인하지 않으면 정답처럼 보일 수 있습니다.`
      : sharedCategory(input.choiceText, input.correctText),
    incorrectPoint,
    keyRule: `핵심 판단 기준은 다음과 같습니다. ${rule}`,
    differenceFromCorrect: choiceEvidence
      ? `정답 ${quoteWithJosa(input.correctText, "은/는")} ${comparisonRule} 반면 ${quoteWithJosa(input.choiceText, "은/는")} ${choiceEvidence} 두 보기는 적용 대상과 판단 조건이 서로 다릅니다.`
      : `정답 ${quoteWithJosa(input.correctText, "은/는")} ${comparisonRule} 반면 ${quoteWithJosa(input.choiceText, "은/는")} 같은 판단 기준을 충족하지 않습니다.`,
  };
}

export function choiceFeedbackPasses(feedback: ChoiceFeedback, correct: boolean) {
  const values = [feedback.rationale, feedback.plausibleReason, feedback.keyRule];
  if (!correct) values.push(feedback.incorrectPoint ?? "", feedback.differenceFromCorrect ?? "");
  const minimums = correct ? [35, 18, 24] : [35, 18, 35, 24, 45];
  return values.every((value, index) => compact(value).length >= minimums[index]) &&
    !GENERIC_CONTENT_PATTERNS.some((pattern) => values.some((value) => value.includes(pattern))) &&
    findKoreanLanguageIssues(values.join("\n")).length === 0;
}

export function lessonAnchorForQuestion(question: Pick<Question, "stem" | "errorReason" | "conceptGroupId">) {
  if (question.errorReason === "공식 적용" || question.errorReason === "단위 오류") return "formula";
  if (question.errorReason === "부정형 문장") return "trap";
  if (/원인|고장|진단|점검|누설|파손|마모|이상|불량/.test(question.stem) || ["s3-g05", "s3-g06", "s3-g07", "s3-g09", "s3-g10", "s3-g11", "s4-g03", "s4-g06", "s4-g15"].includes(question.conceptGroupId)) {
    return "diagnosis";
  }
  return "principle";
}

function shortened(value: string, maximum = 360) {
  const clean = compact(value);
  return clean.length > maximum ? `${clean.slice(0, maximum - 1).trim()}…` : clean;
}

function practicalInspectionCase(
  concept: string,
  groupTitle: string,
  questions: Question[],
  decisionSteps: string[],
) {
  const primary = questions[0];
  const diagnosis = questions.some((question) => /원인|고장|진단|점검|누설|파손|마모|이상|불량/.test(question.stem));
  const safety = questions.some((question) => /안전|보호구|화재|폭발|방호|작업 전/.test(question.stem));
  const calculation = questions.some((question) => question.errorReason === "공식 적용" || question.errorReason === "단위 오류");
  const situation = safety
    ? `${groupTitle} 작업을 시작하기 전에 ${concept}의 적용 조건과 위험요인을 확인해야 하는 상황`
    : diagnosis
      ? `운전 중 ${concept}와 관련된 이상 징후가 나타나 원인을 좁혀야 하는 상황`
      : calculation
        ? `${concept}의 운전값이나 선정값을 계산하고 현장 조건에 맞는지 검산해야 하는 상황`
        : `${groupTitle} 설비에서 ${concept}의 적용 여부를 판단하거나 점검해야 하는 상황`;
  const directEvidence = shortened(primary?.explanation || `${concept}의 정의와 적용 조건을 기준으로 판단합니다.`, 420);

  return [
    `**현장 상황**`,
    situation,
    "",
    `**점검 순서**`,
    ...decisionSteps.map((step, index) => `${index + 1}. ${step}`),
    `4. 확인한 결과를 설비의 정상 기준, 도면, 작업표준 또는 제조사 자료와 대조해 기록합니다.`,
    "",
    `**판정 예시**`,
    `${directEvidence} 따라서 명칭이 비슷하다는 이유만으로 결론을 내리지 않고, 실제 대상·기능·조건이 모두 일치할 때만 ${concept}에 해당한다고 판정합니다.`,
    "",
    `> **실무 주의:** 법령·안전·설정값이 관련된 작업은 이 학습 예시만으로 결정하지 않고 최신 법령, 승인된 작업표준과 제조사 매뉴얼을 우선합니다.`,
  ].join("\n");
}

function trapChoiceExamples(questions: Question[]) {
  const candidates = questions.flatMap((question) =>
    question.choices
      .filter((choice) => choice.id !== question.correctChoiceId)
      .map((choice) => ({ question, choice })),
  );
  const unique = candidates.filter(
    ({ choice }, index) => candidates.findIndex((candidate) => compact(candidate.choice.text) === compact(choice.text)) === index,
  );
  const selected = unique.slice(0, 3);
  const hasNegativeQuestion = selected.some(({ question }) => isNegativeStem(question.stem));

  if (selected.length === 0) {
    return "연결된 문제에서 검증된 오답 보기를 찾지 못했습니다. 임의의 함정 보기는 만들지 않습니다.";
  }

  return [
    "아래 문장은 이 레슨에 연결된 문제에서 실제로 사용된 오답 보기입니다. 문장 자체만 외우지 말고, 왜 그럴듯하며 어느 조건에서 틀리는지 함께 확인합니다.",
    ...selected.flatMap(({ question, choice }, index) => {
      const feedback = choice.feedback;
      return [
        "",
        `### 함정 보기 ${index + 1}`,
        `> **“${choice.text}”**`,
        "",
        `- **문항 맥락:** ${shortened(question.stem, 220)}`,
        `- **왜 그럴듯한가:** ${shortened(feedback.plausibleReason, 320)}`,
        `- **틀린 부분:** ${shortened(feedback.incorrectPoint || feedback.rationale, 420)}`,
        `- **판단 기준:** ${shortened(feedback.keyRule, 420)}`,
      ];
    }),
    ...(hasNegativeQuestion
      ? [
          "",
          `> 부정형 문항에서는 기술적으로 옳은 보기가 오히려 오답 선택지가 됩니다. 문제의 ‘옳지 않은 것’, ‘아닌 것’, ‘거리가 먼 것’을 먼저 표시한 뒤 판단합니다.`,
        ]
      : []),
  ].join("\n");
}

function uniqueEvidence(questions: Question[]) {
  return [...new Set(questions.map((question) => sentence(question.explanation)).filter(Boolean))];
}

function genericMatches(blocks: LessonBlock[]) {
  const text = blocks.map((block) => `${block.title} ${block.body}`).join("\n");
  return GENERIC_CONTENT_PATTERNS.filter((pattern) => text.includes(pattern));
}

function languageIssueMatches(blocks: LessonBlock[]) {
  const text = blocks.map((block) => `${block.title}\n${block.body}`).join("\n");
  return [...new Set(findKoreanLanguageIssues(text).map((issue) => issue.expression))];
}

function substantiveCharacters(blocks: LessonBlock[]) {
  return blocks
    .filter((block) => block.kind !== "source")
    .map((block) => `${block.title}${block.body}`.replace(/[#>*`|_\-\[\]()]/g, "").replace(/\s+/g, ""))
    .join("").length;
}

function qualityTier(questions: Question[], preferredBlock: LessonBlockKind, evidence: TheoryEvidence): ContentQuality["tier"] {
  if (evidence || questions.length >= 2 || ["formula", "diagnosis", "safety"].includes(preferredBlock)) return "core";
  if (questions[0]?.choices.length >= 4) return "standard";
  return "compact";
}

export function assessLessonQuality(
  blocks: LessonBlock[],
  summary: string[],
  tier: ContentQuality["tier"],
  sourceLinked: boolean,
): ContentQuality {
  const characters = substantiveCharacters(blocks);
  const matches = genericMatches(blocks);
  const languageIssues = languageIssueMatches(blocks);
  const requiredCharacters = tier === "core" ? 1000 : tier === "standard" ? 700 : 500;
  const requiredKinds = ["definition", "principle", "exam_point", "trap", "source"];
  const kinds = new Set(blocks.map((block) => block.kind));
  const summaryIsUseful = summary.length === 3 && new Set(summary.map(compact)).size === 3 && summary.every((line) => compact(line).length >= 24);
  return {
    tier,
    substantiveCharacters: characters,
    genericPhraseMatches: [...matches],
    languageIssueMatches: languageIssues,
    sourceLinked,
    passed:
      characters >= requiredCharacters &&
      matches.length === 0 &&
      languageIssues.length === 0 &&
      summaryIsUseful &&
      requiredKinds.every((kind) => kinds.has(kind as LessonBlockKind)),
  };
}

export function buildEvidenceLesson({
  concept,
  groupId,
  groupTitle,
  questions,
  theoryEvidence,
  sourceNeeded,
}: {
  concept: string;
  groupId: string;
  groupTitle: string;
  questions: Question[];
  theoryEvidence: TheoryEvidence;
  sourceNeeded: boolean;
}) {
  const guide = getGroupGuide(groupId);
  const evidence = uniqueEvidence(questions);
  const primary = questions[0];
  const sourceUrls = [...new Set(questions.flatMap((question) =>
    question.verification?.sourceUrls.length
      ? question.verification.sourceUrls
      : /^https?:\/\//.test(question.sourceLabel)
        ? [question.sourceLabel]
        : [],
  ))].slice(0, 5);
  const correctText = primary?.answerText || concept;
  const sourceExcerpt = theoryEvidence?.body
    ? theoryEvidence.body
        .replace(/\*+/g, "")
        .replace(/(?:대조\s*)?원문\s*:\s*/g, "")
        .split(/\n{2,}/)
        .filter((paragraph) => paragraph.includes(concept) || paragraph.includes(correctText))
        .slice(0, 3)
        .join("\n\n")
        .slice(0, 1600) || theoryEvidence.body.slice(0, 1200)
    : `이 레슨의 직접 판단근거는 대표문제의 확정 정답과 근거에서 시작합니다. ${evidence.join(" ")}`;
  const summaryClarifiers = [
    `${concept}의 핵심 정의와 적용 대상을 함께 기억합니다.`,
    `${groupTitle}의 판단 순서에 따라 조건을 대입합니다.`,
    `비슷한 용어와 바꾸어 쓰지 않도록 차이를 확인합니다.`,
  ];
  const summary = [
    evidence[0] || `${concept}의 정의와 적용 범위를 구분합니다.`,
    theoryEvidence ? sourceExcerpt.split(/(?<=[.!?다요])\s+/)[0] : `${guide.decisionSteps[0]} ${guide.decisionSteps[1]}`,
    guide.trap,
  ].map((line, index) => {
    const clean = compact(line).slice(0, 260);
    return clean.length >= 24 ? clean : `${clean} ${summaryClarifiers[index]}`.trim();
  });
  summary.forEach((line, index) => {
    if (summary.indexOf(line) !== index) summary[index] = `${line} ${summaryClarifiers[index]}`;
  });

  const preferredKind: LessonBlockKind = ["formula", "diagnosis", "selection", "safety"].includes(guide.preferredBlock)
    ? guide.preferredBlock
    : "selection";
  const needsDiagnosis = questions.some((question) => /원인|고장|진단|점검|누설|파손|마모|이상|불량/.test(question.stem));
  const needsFormula = questions.some((question) => question.errorReason === "공식 적용" || question.errorReason === "단위 오류");
  const needsSafety = questions.some((question) => /안전|보호구|화재|폭발|방호|작업 전/.test(question.stem));
  const blocks: LessonBlock[] = [
    {
      id: "summary",
      kind: "summary",
      title: "핵심 3줄",
      body: summary.map((line, index) => `${index + 1}. ${line}`).join("\n"),
      order: 1,
    },
    {
      id: "definition",
      kind: "definition",
      title: "개념의 범위와 정의",
      body: `${sourceExcerpt}\n\n> **범위 확인:** ${guide.scope}`,
      order: 2,
    },
    {
      id: "purpose",
      kind: "purpose",
      title: "왜 이 개념을 구분하는가",
      body: `${quoteWithJosa(concept, "은/는")} ${groupTitle} 문제에서 장치 선정, 계산 조건 또는 고장 판단의 기준이 됩니다. 비슷한 명칭만 외우면 적용 대상과 직접 원인을 혼동하기 쉬우므로 **정의 → 작동 원리 → 적용 조건 → 확인 방법**의 순서로 구분해야 합니다.\n\n${guide.scope}`,
      order: 3,
    },
    {
      id: "principle",
      kind: "principle",
      title: "작동 원리와 판단 기준",
      body: `${guide.mechanism}\n\n**이 문제군의 직접 근거**\n\n${evidence.map((item) => `- ${item}`).join("\n")}`,
      order: 4,
    },
    {
      id: "structure",
      kind: "structure",
      title: "개념의 위치와 연결관계",
      body: `| 구분 | 내용 |\n|---|---|\n| 세부항목군 | ${tableCell(groupTitle)} |\n| 현재 개념 | ${tableCell(concept)} |\n| 대표 정답 | ${tableCell(correctText)} |\n| 연결 문제 | ${questions.map((question) => question.id).join(", ")} |\n\n상위 항목군의 공통원리를 이해한 뒤 현재 개념의 고유한 대상·조건·기능을 분리합니다.`,
      order: 5,
    },
    {
      id: preferredKind,
      kind: preferredKind,
      title:
        preferredKind === "formula"
          ? "공식·단위·조건 확인"
          : preferredKind === "diagnosis"
            ? "증상에서 원인으로 좁히기"
            : preferredKind === "safety"
              ? "안전과 작업 전 확인"
              : "선정과 적용 조건",
      body: `1. ${guide.decisionSteps[0]}\n2. ${guide.decisionSteps[1]}\n3. ${guide.decisionSteps[2]}\n\n조건이나 단위가 제시된 경우에는 생략하지 말고 정답 문장에 다시 대입해 확인합니다.`,
      order: 6,
    },
    {
      id: "field-case",
      kind: "diagnosis",
      title: "실무 점검 예시",
      body: practicalInspectionCase(concept, groupTitle, questions, guide.decisionSteps),
      order: 7,
    },
    {
      id: "exam-point",
      kind: "exam_point",
      title: "시험에서 판단하는 순서",
      body: `- 문제의 긍정형·부정형을 먼저 표시합니다.\n- ${guide.decisionSteps.join("\n- ")}\n- 마지막으로 ${quoteWithJosa(correctText, "이/가")} 문제에서 요구한 조건을 모두 충족하는지 확인합니다.`,
      order: 8,
    },
    {
      id: "trap",
      kind: "trap",
      title: "시험에서 자주 나오는 실제 함정 보기",
      body: trapChoiceExamples(questions),
      order: 9,
    },
    {
      id: "memory",
      kind: "exam_point",
      title: "한 줄 암기",
      body: `**${concept}:** ${compact(evidence[0] || guide.decisionSteps[2])}`,
      order: 10,
    },
    {
      id: "source",
      kind: "source",
      title: "출처와 검토 상태",
      body: [
        `- 문제 근거: 27차 정규화 대표문제 ${questions.map((question) => question.id).join(", ")}`,
        theoryEvidence
          ? `- 이론 근거: 설비보전기사 필기 이론 최종 정리본(2025–2028) — ‘${theoryEvidence.title}’`
          : "- 이론 상태: 문제 근거에서 도출한 보강안이며 독립 이론 출처 대조가 추가로 필요합니다.",
        ...sourceUrls.map((url, index) => `- 원문 출처 ${index + 1}: ${url}`),
        `- 공개 상태: ${sourceNeeded ? "출처·기술 검수 전까지 검토 대기" : "확정 문제와 연결된 공개 후보"}`,
      ].join("\n"),
      order: 12,
    },
  ];

  if (preferredKind !== "diagnosis" && needsDiagnosis) {
    blocks.splice(6, 0, {
      id: "diagnosis",
      kind: "diagnosis",
      title: "점검할 때의 연결 순서",
      body: `현장형 문제에서는 **현상 → 직접 원인 → 확인 방법 → 대책** 순으로 정리합니다. ${guide.decisionSteps.join(" ")} 단순히 같은 분야의 용어라는 이유로 직접 원인으로 확정하지 않습니다.`,
      order: 7,
    });
  }
  if (preferredKind !== "formula" && needsFormula) {
    blocks.splice(4, 0, {
      id: "formula",
      kind: "formula",
      title: "수치·단위 문제 확인",
      body: "수치가 없는 개념문제라도 단위, 기준온도, 압력의 기준, 이상·이하·초과·미만 같은 경계조건이 숨어 있는지 확인합니다. 공식이 필요한 문제는 기호의 뜻과 단위를 먼저 적고 계산 뒤 차원을 검산합니다.",
      order: 5,
    });
  }
  if (preferredKind !== "safety" && needsSafety) {
    blocks.splice(blocks.findIndex((block) => block.id === "source"), 0, {
      id: "safety",
      kind: "safety",
      title: "현행 기준과 안전 확인",
      body: `안전 관련 수치와 작업 절차는 문제의 출제 시점과 현재 기준이 다를 수 있습니다. 시험에서는 제시된 조건과 출제 기준을 따르고, 실무에서는 최신 법령·승인도서·제조사 매뉴얼을 우선합니다. ${concept}에 수치 조건이 있다면 적용 연도와 기준 문서를 함께 기록합니다.`,
      order: 11,
    });
  }
  blocks.forEach((block, index) => {
    block.order = index + 1;
  });

  const sourceLinked = Boolean(theoryEvidence) || questions.some((question) => question.contentStatus === "published");
  const tier = qualityTier(questions, guide.preferredBlock, theoryEvidence);
  return { summary, blocks, quality: assessLessonQuality(blocks, summary, tier, sourceLinked) };
}
