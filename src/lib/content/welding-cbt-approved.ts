import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
  type WeldingCbtAnswerReviewEntry,
} from "@/data/source/welding-cbt-answer-review";
import { isIndependentlyAcceptedWeldingCbtQuestion } from "@/data/source/welding-cbt-independent-review-gates";
import {
  WELDING_CBT_LESSON_PROJECTION,
} from "@/data/source/welding-cbt-lesson-projection";
import type { WeldingCbtAggregateTopicKey } from "@/data/source/welding-cbt-lesson-taxonomy";
import { weldingCbtLeafLessons } from "@/lib/content/welding-cbt-leaf-lessons";
import type {
  ApprovedCalculationFeedback,
  Choice,
  GeneratedContent,
  Lesson,
  LessonBlock,
  Question,
} from "@/lib/domain/types";

const SUBJECT_ID = "subject-2";
const REVIEWED_AT = "2026-08-02T14:59:59.000Z";

type WeldingCbtRecord = (typeof rawWeldingCbtBank.records)[number];
type PublishableWeldingCbtAnswerReview = WeldingCbtAnswerReviewEntry & {
  reviewStatus: "approved";
  primaryLeafLessonId: string;
  conceptBinding: NonNullable<WeldingCbtAnswerReviewEntry["conceptBinding"]>;
  answerExplanation: string;
  solutionSteps: string[];
  keyRule: string;
  choiceFeedback: NonNullable<WeldingCbtAnswerReviewEntry["choiceFeedback"]>;
  reviewer: string;
  reviewedAt: string;
};

type WeldingPart =
  | "용접 기초"
  | "아크·특수용접"
  | "결함·검사·이음"
  | "산업안전";

type WeldingTopic = {
  key: string;
  part: WeldingPart;
  title: string;
  groupId: string;
  aliases: string[];
  summary: [string, string, string];
  definition: string;
  principle: string;
  examPoint: string;
  trap: string;
};

type WeldingCurationRule = {
  key: string;
  part: WeldingPart;
  topicKey: "foundation" | "arc" | "gas" | "defects" | "safety";
  pattern: RegExp;
  limit: number;
};

const NON_SAFETY_RULE_LIMIT = 20;

const TOPICS: Record<WeldingCbtAggregateTopicKey, WeldingTopic> = {
  foundation: {
    key: "foundation",
    part: "용접 기초",
    title: "용접 기초",
    groupId: "s2-g01",
    aliases: ["용접 분류", "용접 이음", "용접기", "용접봉", "직류 극성", "용접 입열"],
    summary: [
      "융접·압접·납땜은 모재 용융 여부와 압력 사용 여부로 구분합니다.",
      "교류·직류 용접기, 극성, 용접봉과 입열은 실제 작동 조건으로 연결합니다.",
      "재료·제도 전 범위를 가져오지 않고 설비보전 2과목의 직접 학습목표만 다룹니다.",
    ],
    definition:
      "용접 기초는 접합 원리, 이음과 자세, 용접 전원, 전극·용접봉, 극성, 입열과 변형처럼 다른 용접 공정을 이해하기 위한 공통 판단기준입니다.",
    principle:
      "모재가 녹는가 → 압력을 쓰는가 → 전극과 전원은 무엇인가 → 열이 어디에 집중되는가 → 입열과 냉각이 변형·조직에 어떤 영향을 주는가 순으로 판단합니다.",
    examPoint:
      "용접 분류, 이음·자세, 교류·직류 용접기, 정극성·역극성, 피복 용접봉, 아크 쏠림, 입열과 잔류응력을 묻는 문제가 반복됩니다.",
    trap:
      "공정 이름만 보고 분류하거나, 정극성·역극성의 연결을 바꾸고, 용접봉·피복제의 모든 재료 문제를 2과목 핵심으로 보는 선택지를 주의합니다.",
  },
  arc: {
    key: "arc",
    part: "아크·특수용접",
    title: "아크용접",
    groupId: "s2-g02",
    aliases: ["피복아크용접", "TIG", "MIG", "MAG", "CO₂ 용접", "FCAW", "서브머지드 용접"],
    summary: [
      "열원, 전극의 소모 여부, 보호 방식과 전원 특성을 함께 비교합니다.",
      "SMAW·TIG·MIG/MAG·CO₂·FCAW·SAW를 전극과 차폐 방식으로 구분합니다.",
      "문제의 긍정형·부정형과 적용 재료·자세·능률 조건을 끝까지 확인합니다.",
    ],
    definition:
      "아크용접은 전극과 모재 사이의 아크열로 접합하며, 전극의 소모 여부와 가스·플럭스 차폐 방식에 따라 공정 특성이 달라집니다.",
    principle:
      "열원 → 전극 또는 용가재 → 차폐 방식 → 금속이행과 용입 → 적용 조건의 순서로 비교합니다. TIG의 비소모성 텅스텐 전극과 MIG·MAG의 연속 소모성 와이어를 구분합니다.",
    examPoint:
      "전극 형태, 보호가스·플럭스, 극성, 용접 자세, 용입과 용착속도, 적용 재질을 바꾸어 묻는 문제가 반복됩니다.",
    trap:
      "TIG의 전극과 MIG의 와이어를 바꾸거나, 가스 차폐 공정은 바람의 영향을 받지 않는다고 단정하는 보기는 틀리기 쉽습니다.",
  },
  gas: {
    key: "gas",
    part: "아크·특수용접",
    title: "가스절단·특수용접",
    groupId: "s2-g03",
    aliases: ["가스용접", "가스절단", "산소절단", "특수용접", "납땜"],
    summary: [
      "연료가스와 산소의 역할, 불꽃 종류와 절단 원리를 구분합니다.",
      "압력·가스 조합·팁 상태와 역화 방지 조건을 함께 확인합니다.",
      "저항·마찰·전자빔·초음파 등 특수용접의 에너지원과 적용을 비교합니다.",
    ],
    definition:
      "가스용접·절단은 연료가스의 연소열 또는 산소와 금속의 산화반응을 이용하며, 특수용접은 전기저항·마찰·고에너지 빔·초음파 등 서로 다른 에너지원으로 접합합니다.",
    principle:
      "가스절단은 예열 후 고순도 산소를 분사해 금속을 산화시키고 산화물을 제거합니다. 특수용접은 에너지 발생 위치와 압력 적용 여부, 모재의 용융 여부를 기준으로 비교합니다.",
    examPoint:
      "불꽃 조정, 가스의 성질, 절단 가능 재료, 역화 원인, 특수용접의 원리와 적용 대상을 자주 묻습니다.",
    trap:
      "가스절단을 단순 용융으로 설명하거나 모든 금속이 같은 조건에서 산소절단된다고 보는 선택지를 주의합니다.",
  },
  defects: {
    key: "defects",
    part: "결함·검사·이음",
    title: "용접결함·검사",
    groupId: "s2-g04",
    aliases: ["언더컷", "오버랩", "기공", "슬래그", "균열", "비파괴검사"],
    summary: [
      "결함의 모양과 발생 위치를 먼저 구분합니다.",
      "전류·속도·각도·청소·차폐 조건을 원인과 대책으로 연결합니다.",
      "표면·내부 결함과 검사법의 검출 범위를 구분합니다.",
    ],
    definition:
      "용접결함은 용접부의 형상·연속성·건전성을 해치는 불연속이며, 검사는 표면과 내부의 결함을 목적에 맞는 방법으로 확인하는 과정입니다.",
    principle:
      "결함은 관찰 형상 → 위치 → 공정 조건 → 직접 원인 → 재발 방지 대책 순으로 진단합니다. 검사법은 방사선·초음파·자분·침투처럼 적용 재료와 검출 위치가 다릅니다.",
    examPoint:
      "결함 설명으로 명칭을 고르거나 원인·대책을 연결하고, 비파괴검사법의 적용 범위를 비교하는 문제가 자주 출제됩니다.",
    trap:
      "언더컷과 오버랩의 형상을 반대로 설명하거나, 모든 비파괴검사가 내부 결함을 동일하게 검출한다고 보는 선택지를 주의합니다.",
  },
  safety: {
    key: "safety",
    part: "산업안전",
    title: "산업안전",
    groupId: "s2-g05",
    aliases: ["감전", "화재", "가스용기", "보호구", "환기", "안전표지", "기계안전"],
    summary: [
      "전격·화재·폭발·가스·흄·유해광선과 기계 위험을 사고 경로별로 구분합니다.",
      "위험원 제거·격리와 공학적 방호를 보호구보다 먼저 적용합니다.",
      "CBT에서 직접 확인된 안전 문항은 연도 중복을 제거한 뒤 모두 이 대주제에 포함합니다.",
    ],
    definition:
      "산업안전은 용접 작업의 감전·화재·폭발·가스·유해광선·흄 위험뿐 아니라 회전체·연삭기·압력설비 등 작업장 위험을 작업 전·중·후에 통제하는 지식입니다.",
    principle:
      "위험원 확인 → 에너지 차단·격리 → 환기·차광·접지·방호장치 → 작업허가와 감시 → 적합한 보호구 → 이상 시 작업중지 순으로 판단합니다.",
    examPoint:
      "전격방지, 보호구와 안전표지, 화재·소화, 가스용기·역화, 환기·밀폐공간, 회전체·연삭·압력설비 안전이 반복됩니다.",
    trap:
      "보호구 하나로 모든 위험이 제거된다고 보거나, 누설을 불꽃으로 검사하고 산소를 환기에 쓰며 회전체에 장갑을 가까이 대는 보기는 위험한 오답입니다.",
  },
};

const CURATION_RULES: readonly WeldingCurationRule[] = [
  {
    key: "safety-electric",
    part: "산업안전",
    topicKey: "safety",
    pattern:
      /안전(?!율)|감전|전격|자동전격|안전홀더|전기적\s*재해|보호접지/i,
    limit: Number.POSITIVE_INFINITY,
  },
  {
    key: "safety-ppe-fire-sign",
    part: "산업안전",
    topicKey: "safety",
    pattern:
      /보호구|차광|유해광선|화재|폭발|소화기|연소\s*3요소|안전.?보건표지|지시표지|경고표지|금지표지|안내표지/i,
    limit: Number.POSITIVE_INFINITY,
  },
  {
    key: "safety-gas-handling",
    part: "산업안전",
    topicKey: "safety",
    pattern:
      /(?:가스|산소|아세틸렌).*(?:용기|취급|누설|역류|역화|인화|폭발|압력\s*조정기)|(?:용기|토치|조정기).*(?:주의|취급)|수봉식\s*안전기/i,
    limit: Number.POSITIVE_INFINITY,
  },
  {
    key: "safety-ventilation-workplace",
    part: "산업안전",
    topicKey: "safety",
    pattern:
      /환기|흄|중독|밀폐|작업장|설치장소|작업\s*환경|재해|위험|화기작업/i,
    limit: Number.POSITIVE_INFINITY,
  },
  {
    key: "defects",
    part: "결함·검사·이음",
    topicKey: "defects",
    pattern:
      /용접.*결함|결함.*용접|언더컷|오버랩|기공|피트|슬래그\s*혼입|균열|용입\s*불량|융합\s*불량|스패터|용락|아크\s*스트라이크/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "inspection",
    part: "결함·검사·이음",
    topicKey: "defects",
    pattern: /비파괴|탐상|방사선\s*투과|초음파\s*탐상|자분\s*탐상|침투\s*탐상|와전류\s*탐상/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "joint-symbol",
    part: "결함·검사·이음",
    topicKey: "defects",
    pattern:
      /용접\s*기호|필릿.*(?:각장|목두께)|개선.*(?:홈|각도)|홈\s*용접|현장\s*용접|온둘레\s*용접/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "arc-process",
    part: "아크·특수용접",
    topicKey: "arc",
    pattern:
      /피복\s*아크|TIG|GTAW|MIG|MAG|GMAW|CO₂|탄산가스|FCAW|플럭스\s*코어|서브머지드|SAW/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "gas-cutting",
    part: "아크·특수용접",
    topicKey: "gas",
    pattern:
      /가스\s*용접|가스\s*절단|산소\s*절단|절단\s*불꽃|중성\s*불꽃|산화\s*불꽃|탄화\s*불꽃/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "pressure-special",
    part: "아크·특수용접",
    topicKey: "gas",
    pattern:
      /저항\s*용접|점\s*용접|심\s*용접|프로젝션\s*용접|플래시\s*버트|마찰\s*용접|냉간\s*압접|초음파\s*용접|전자빔|레이저|플라즈마|테르밋|일렉트로\s*슬래그/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "classification-joints",
    part: "용접 기초",
    topicKey: "foundation",
    pattern:
      /융접|압접|납땜|용접.*(?:분류|이음|자세)|맞대기\s*이음|겹치기\s*이음/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "power-polarity",
    part: "용접 기초",
    topicKey: "foundation",
    pattern:
      /교류.*용접기|직류.*용접기|정극성|역극성|극성|아크.*(?:전압|길이|쏠림)|자기\s*쏠림/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "electrode",
    part: "용접 기초",
    topicKey: "foundation",
    pattern: /용접봉|피복제|저수소계/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
  {
    key: "heat-distortion",
    part: "용접 기초",
    topicKey: "foundation",
    pattern:
      /용접\s*입열|용접\s*변형|잔류응력|역변형|후퇴법|대칭법|스킵법|응력\s*제거/i,
    limit: NON_SAFETY_RULE_LIMIT,
  },
];

function ruleForRecord(record: WeldingCbtRecord) {
  return CURATION_RULES.find((rule) => rule.pattern.test(record.stem));
}

function lessonId(topic: WeldingTopic) {
  return `lesson-welding-cbt-${topic.key}`;
}

function conceptId(topic: WeldingTopic) {
  return `concept-welding-cbt-${topic.key}`;
}

function lessonBlocks(topic: WeldingTopic): LessonBlock[] {
  return [
    {
      id: "summary",
      kind: "summary",
      title: "핵심 정리",
      body: topic.summary.map((line, index) => `${index + 1}. ${line}`).join("\n"),
      order: 1,
    },
    {
      id: "definition",
      kind: "definition",
      title: "정의와 범위",
      body: topic.definition,
      order: 2,
    },
    {
      id: "principle",
      kind: "principle",
      title: "이해를 위한 배경",
      body: topic.principle,
      order: 3,
    },
    {
      id: "exam-point",
      kind: "exam_point",
      title: "시험에 자주 나오는 유형",
      body: topic.examPoint,
      order: 4,
    },
    {
      id: "trap",
      kind: "trap",
      title: "대표 오답 함정",
      body: topic.trap,
      order: 5,
    },
    {
      id: "source",
      kind: "source",
      title: "출처와 보충 범위",
      body:
        "문제와 보기는 CBTBank에 남아 있는 과거 공개 시험의 원문 복원·대조 자료를 의미 변경 없이 사용했습니다. 해설·오답 비교·개념 연결은 외부 사이트 해설을 복제하지 않고 이 교재에서 별도로 보충했습니다. 이미지가 필요한 문항은 이용 권리와 정확한 시각자료가 확인될 때까지 공개하지 않습니다.",
      order: 6,
    },
  ];
}

function buildLesson(topic: WeldingTopic, relatedQuestionIds: string[]): Lesson {
  const blocks = lessonBlocks(topic);
  const substantiveCharacters = blocks
    .map((block) => `${block.title}${block.body}`.replace(/\s+/g, ""))
    .join("").length;
  return {
    id: lessonId(topic),
    subjectId: SUBJECT_ID,
    conceptGroupId: topic.groupId,
    conceptId: conceptId(topic),
    title: topic.title,
    aliases: topic.aliases,
    summary: topic.summary,
    blocks,
    relatedQuestionIds,
    coverageStatus: "covered",
    contentStatus: "published",
    sourceNeeded: false,
    reviewedAt: REVIEWED_AT,
    contentRole: "exam_linked",
    publication: { readiness: "ready", blockers: [] },
    quality: {
      tier: "core",
      substantiveCharacters,
      genericPhraseMatches: [],
      languageIssueMatches: [],
      sourceLinked: true,
      passed: true,
    },
  };
}

function buildChoices(
  record: WeldingCbtRecord,
  review: PublishableWeldingCbtAnswerReview,
): Choice[] {
  const feedbackByChoiceIndex = new Map(
    review.choiceFeedback.map((feedback) => [
      feedback.choiceIndex,
      feedback,
    ]),
  );
  if (
    feedbackByChoiceIndex.size !== record.choices.length
    || review.choiceFeedback.length !== record.choices.length
  ) {
    throw new Error(
      `${record.externalId}: 승인 답안의 선택지 피드백이 원문 선택지 exact-set과 일치하지 않습니다.`,
    );
  }
  return record.choices.map((text, index) => {
    const feedback = feedbackByChoiceIndex.get(index);
    if (!feedback) {
      throw new Error(
        `${record.externalId}: ${index + 1}번 선택지의 승인 피드백이 없습니다.`,
      );
    }
    if (
      (index === record.correctIndex && feedback.relation !== "supports")
      || (index !== record.correctIndex && feedback.relation === "supports")
    ) {
      throw new Error(
        `${record.externalId}: ${index + 1}번 선택지의 승인 관계가 복원 정답과 일치하지 않습니다.`,
      );
    }
    return {
      id: `${record.canonicalId}-c${index + 1}`,
      order: index + 1,
      text,
      feedback: {
        rationale: feedback.rationale,
        plausibleReason: feedback.plausibleReason,
        incorrectPoint: feedback.incorrectPoint,
        keyRule: feedback.keyRule,
        differenceFromCorrect: feedback.differenceFromCorrect,
      },
    };
  });
}

function buildReviewedExplanation(
  review: PublishableWeldingCbtAnswerReview,
) {
  return [
    review.answerExplanation,
    ...review.solutionSteps,
    review.keyRule,
  ].join("\n\n");
}

const CALCULATION_FORMULA_LABEL_PATTERN =
  /(?:공식|계산식|입열식|식을|법칙|줄열|질량 감소량)/u;
const CALCULATION_SYMBOLIC_FORMULA_PATTERN =
  /(?:[A-Za-zη][A-Za-z0-9η₁₂²]*\s*=\s*[A-Za-zη\d]|I²Rt)/u;
const CALCULATION_OPERATOR_PATTERN = /[=×÷*/+\-]/u;
const CALCULATION_SUBSTITUTION_LABEL_PATTERN =
  /(?:대입|계산|곱|나눠|환산)/u;
const CALCULATION_INPUT_VALUE_PATTERN =
  /\d[\d,.]*\s*(?:kJ\/cm|J\/cm|kgf\/cm²|L\/kg|cm\/min|s\/min|cal|J|L|A|V|kg|Ω|mm|cm|s|%)(?![A-Za-z/²])/gu;
const CALCULATION_RESULT_VALUE_PATTERN =
  /([\d,.]+\s*(kJ\/cm|J\/cm|cal|L|A|V|kg|mm|cm|s|%))(?![A-Za-z/²])/gu;
const CALCULATION_RESULT_PREFIX_PATTERN =
  /(?:최종\s*)?(?:계산\s*)?결과(?:는|가)?\s*$/u;
const CALCULATION_RESULT_SUFFIX_PATTERN =
  /^(?:을|를|이|가|으로|로)?\s*(?:얻|선택|정답|이므로|입니다|이다)/u;

function calculationValueCount(text: string) {
  return [...text.matchAll(CALCULATION_INPUT_VALUE_PATTERN)].length;
}

function calculationFormulaScore(text: string) {
  if (
    !CALCULATION_FORMULA_LABEL_PATTERN.test(text)
    || (
      !CALCULATION_SYMBOLIC_FORMULA_PATTERN.test(text)
      && !CALCULATION_OPERATOR_PATTERN.test(text)
    )
  ) {
    return 0;
  }
  return 20
    + (CALCULATION_SYMBOLIC_FORMULA_PATTERN.test(text) ? 6 : 0)
    + (/\[[^\]]+\]/u.test(text) ? 2 : 0)
    - Math.min(calculationValueCount(text), 5);
}

function calculationSubstitutionScore(text: string) {
  const numberCount = [...text.matchAll(/\d[\d,.]*/gu)].length;
  const valueCount = calculationValueCount(text);
  const hasOperator = CALCULATION_OPERATOR_PATTERN.test(text);
  const hasLabel = CALCULATION_SUBSTITUTION_LABEL_PATTERN.test(text);
  if (numberCount < 2 || valueCount < 1 || (!hasOperator && !hasLabel)) {
    return 0;
  }
  return Math.min(valueCount, 4) * 3
    + Math.min(numberCount, 5)
    + (hasOperator ? 3 : 0)
    + (text.includes("대입") ? 5 : 0)
    + (hasLabel ? 2 : 0);
}

function uniqueHighestCalculationText(
  values: readonly string[],
  score: (value: string) => number,
) {
  const ranked = [...new Set(values)]
    .map((value) => ({ value, score: score(value) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);
  if (!ranked[0] || ranked[0].score === ranked[1]?.score) return undefined;
  return ranked[0].value;
}

function parseApprovedCalculationResult(solutionSteps: readonly string[]) {
  const matches = solutionSteps.flatMap((step) =>
    [...step.matchAll(CALCULATION_RESULT_VALUE_PATTERN)].flatMap((match) => {
      const start = match.index ?? 0;
      const prefix = step.slice(Math.max(0, start - 24), start);
      const suffix = step.slice(start + match[0].length, start + match[0].length + 24);
      return CALCULATION_RESULT_PREFIX_PATTERN.test(prefix)
        || CALCULATION_RESULT_SUFFIX_PATTERN.test(suffix)
        ? [{ result: match[1], unit: match[2] }]
        : [];
    }),
  );
  return matches.length === 1 ? matches[0] : undefined;
}

function buildApprovedCalculation(
  review: PublishableWeldingCbtAnswerReview,
): ApprovedCalculationFeedback | undefined {
  if (review.assessmentKind !== "calculation") return undefined;
  const formula = uniqueHighestCalculationText(
    [...review.solutionSteps, review.answerExplanation],
    calculationFormulaScore,
  );
  const substitution = formula
    ? uniqueHighestCalculationText(
        review.solutionSteps.filter((step) => step !== formula),
        calculationSubstitutionScore,
      )
    : undefined;
  const parsedResult = parseApprovedCalculationResult(review.solutionSteps);
  if (!formula || !substitution || !parsedResult) return undefined;

  return {
    formula,
    substitution,
    result: parsedResult.result,
    unit: parsedResult.unit,
  };
}

function errorReasonForAssessment(
  assessmentKind: WeldingCbtAnswerReviewEntry["assessmentKind"],
): Question["errorReason"] {
  switch (assessmentKind) {
    case "calculation":
      return "공식 적용";
    case "identification":
      return "용어 혼동";
    case "safety":
    case "application":
      return "조건 누락";
    case "definition":
    case "principle":
      return "개념 혼동";
  }
}

function buildQuestion(
  record: WeldingCbtRecord,
  targetLesson: Lesson,
  review: PublishableWeldingCbtAnswerReview,
  canonicalNumber: number,
): Question {
  const choices = buildChoices(record, review);
  const correctChoice = choices[record.correctIndex ?? -1];
  if (!correctChoice) {
    throw new Error(`${record.externalId}: 정답 선택지를 찾을 수 없습니다.`);
  }
  return {
    id: record.canonicalId,
    canonicalNumber,
    subjectId: SUBJECT_ID,
    conceptGroupId: targetLesson.conceptGroupId,
    conceptId: targetLesson.conceptId,
    lessonId: targetLesson.id,
    lessonAnchor: review.conceptBinding.lessonBlockId,
    stem: record.stem,
    choices,
    correctChoiceId: correctChoice.id,
    answerText: correctChoice.text,
    explanation: buildReviewedExplanation(review),
    errorReason: errorReasonForAssessment(review.assessmentKind),
    sourceLabel: "CBT 원문 복원·대조 출처",
    shufflePolicy: "all",
    reviewStatus: `답안 검토 승인 · ${review.reviewer}`,
    contentStatus: "published",
    publication: { readiness: "ready", blockers: [] },
    verification: {
      status: "verified",
      method: "source_backed_reconstruction",
      variantCount: 0,
      sourceUrls: [],
      riskTags: ["historical_context"],
      note:
        "원문·보기·복원 정답과 문항별 답안 해설, 선택지 피드백, 이론 assertion 연결을 검토한 승인 문항입니다.",
      reviewedAt: review.reviewedAt,
    },
    audit: {
      questionId: record.canonicalId,
      scope: "high_risk_public",
      sourceContentStatus: "published",
      auditDisposition: "verified",
      evidenceLevel: null,
      cbtAnswer: correctChoice.text,
      verifiedAnswer: correctChoice.text,
      evidenceUrls: [],
      reviewNote:
        review.essentialRationale ?? review.keyRule,
      assetStatus: "not_required",
      nextAction: "승인 답안 digest와 원문 링크 상태를 정기 재확인",
      reviewedAt: review.reviewedAt,
    },
    approvedReview: {
      directSolution: review.answerExplanation,
      conceptBinding: {
        assertionText: review.conceptBinding.assertionText,
        href: `/written/theory/${targetLesson.id}#${review.conceptBinding.lessonBlockId}`,
      },
      calculation: buildApprovedCalculation(review),
    },
    validation: {
      answer: review.reviewStatus === "approved",
      explanation: review.reviewStatus === "approved",
      choiceFeedback: review.reviewStatus === "approved",
      theoryLink: review.reviewStatus === "approved",
      contentQuality: review.reviewStatus === "approved",
    },
  };
}

function isPublishableAnswerReview(
  entry: WeldingCbtAnswerReviewEntry,
): entry is PublishableWeldingCbtAnswerReview {
  if (
    !isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId)
    || !isWeldingCbtAnswerReviewPublishable(entry)
    || entry.reviewStatus !== "approved"
    || !entry.primaryLeafLessonId
    || !entry.conceptBinding
    || !entry.answerExplanation
    || entry.solutionSteps.length === 0
    || !entry.keyRule
    || !entry.choiceFeedback
    || !entry.reviewer
    || !entry.reviewedAt
  ) {
    return false;
  }
  return entry.assessmentKind !== "calculation"
    || buildApprovedCalculation(entry) !== undefined;
}

function resolveReviewedTargetLesson(
  record: WeldingCbtRecord,
  review: PublishableWeldingCbtAnswerReview,
  targetLessonById: ReadonlyMap<string, Lesson>,
) {
  if (review.contentDigest !== record.canonicalFingerprint) {
    throw new Error(
      `${record.externalId}: 승인 답안 digest가 원문 canonical fingerprint와 다릅니다.`,
    );
  }
  if (
    review.primaryLeafLessonId !== review.conceptBinding.lessonId
  ) {
    throw new Error(
      `${record.externalId}: 승인 답안의 primary lesson과 concept binding lesson이 다릅니다.`,
    );
  }
  const targetLesson = targetLessonById.get(review.primaryLeafLessonId);
  if (
    !targetLesson
    || targetLesson.id !== review.conceptBinding.lessonId
    || targetLesson.contentStatus !== "published"
    || targetLesson.publication?.readiness !== "ready"
    || !targetLesson.quality.passed
  ) {
    throw new Error(
      `${record.externalId}: 승인 답안의 세부 레슨이 공개 준비 상태가 아닙니다: ${review.primaryLeafLessonId}`,
    );
  }
  const targetBlock = targetLesson.blocks.find(
    (block) => block.id === review.conceptBinding.lessonBlockId,
  );
  const targetBlockEvidenceRef =
    `${review.conceptBinding.lessonId}#${review.conceptBinding.lessonBlockId}`;
  if (
    !targetBlock
    || !review.conceptBinding.assertionText.trim()
    || !review.conceptBinding.evidenceRefs.some(
      (evidence) =>
        evidence.kind === "lesson_block"
        && evidence.ref === targetBlockEvidenceRef,
    )
  ) {
    throw new Error(
      `${record.externalId}: 승인 답안의 lesson block 또는 evidence ref 연결이 유효하지 않습니다.`,
    );
  }
  return targetLesson;
}

function sourceApprovedRecords() {
  return rawWeldingCbtBank.records.filter(
    (record) =>
      record.auditResolution === "approved" &&
      record.contentFidelity === "exact" &&
      record.answerEvidence === "single_capture_uncontested" &&
      record.assetStatus === "not_required" &&
      record.correctIndex !== null,
  );
}

function buildWeldingCbtCuration() {
  const sourceApproved = sourceApprovedRecords();
  const representativeByCanonicalId = new Map<string, WeldingCbtRecord>();

  for (const record of sourceApproved) {
    const current = representativeByCanonicalId.get(record.canonicalId);
    if (
      !current ||
      record.examDate > current.examDate ||
      (record.examDate === current.examDate &&
        record.questionNumber < current.questionNumber)
    ) {
      representativeByCanonicalId.set(record.canonicalId, record);
    }
  }

  const eligibleByRule = new Map<string, WeldingCbtRecord[]>();
  const ruleByCanonicalId = new Map<string, WeldingCurationRule>();
  for (const record of representativeByCanonicalId.values()) {
    const rule = ruleForRecord(record);
    if (!rule) continue;
    const current = eligibleByRule.get(rule.key) ?? [];
    current.push(record);
    eligibleByRule.set(rule.key, current);
    ruleByCanonicalId.set(record.canonicalId, rule);
  }

  const selectedCanonicalIds = new Set<string>();
  for (const rule of CURATION_RULES) {
    const candidates = [...(eligibleByRule.get(rule.key) ?? [])].sort(
      (left, right) =>
        right.examDate.localeCompare(left.examDate) ||
        left.questionNumber - right.questionNumber ||
        left.canonicalId.localeCompare(right.canonicalId),
    );
    const selected = Number.isFinite(rule.limit)
      ? candidates.slice(0, rule.limit)
      : candidates;
    for (const record of selected) {
      selectedCanonicalIds.add(record.canonicalId);
    }
  }

  return {
    sourceApproved,
    eligibleByRule,
    ruleByCanonicalId,
    selectedCanonicalIds,
    records: sourceApproved.filter((record) =>
      selectedCanonicalIds.has(record.canonicalId),
    ),
  };
}

export function getWeldingCbtProjectionCandidates() {
  const curation = buildWeldingCbtCuration();
  const representativeByCanonicalId = new Map<string, WeldingCbtRecord>();

  for (const record of curation.records) {
    const current = representativeByCanonicalId.get(record.canonicalId);
    if (
      !current
      || record.examDate > current.examDate
      || (
        record.examDate === current.examDate
        && record.questionNumber < current.questionNumber
      )
    ) {
      representativeByCanonicalId.set(record.canonicalId, record);
    }
  }

  return [...representativeByCanonicalId.values()]
    .map((record) => {
      const rule = curation.ruleByCanonicalId.get(record.canonicalId);
      if (!rule) {
        throw new Error(
          `${record.externalId}: 선별된 용접 CBT 문항의 대주제 연결이 없습니다.`,
        );
      }
      return {
        canonicalId: record.canonicalId,
        contentDigest: record.canonicalFingerprint,
        aggregateTopicKey: rule.topicKey,
        stem: record.stem,
        choices: record.choices,
      };
    })
    .sort((left, right) => left.canonicalId.localeCompare(right.canonicalId));
}

export function getWeldingCbtProjectionClosure() {
  const candidates = getWeldingCbtProjectionCandidates();
  const candidateById = new Map(
    candidates.map((candidate) => [candidate.canonicalId, candidate]),
  );
  const projectionById = new Map(
    WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
      entry.canonicalId,
      entry,
    ]),
  );
  const answerReviewById = new Map(
    WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [
      entry.canonicalId,
      entry,
    ]),
  );

  const approvedExact = candidates.filter((candidate) => {
    const entry = projectionById.get(candidate.canonicalId);
    return Boolean(
      entry
      && entry.reviewStatus === "approved"
      && entry.primaryLeafLessonId
      && entry.contentDigest === candidate.contentDigest
      && entry.aggregateTopicKey === candidate.aggregateTopicKey,
    );
  });
  const reviewedHolds = candidates.filter((candidate) => {
    const entry = projectionById.get(candidate.canonicalId);
    return Boolean(
      entry
      && entry.reviewStatus === "hold"
      && entry.primaryLeafLessonId === null
      && entry.reasonCodes.length > 0
      && entry.contentDigest === candidate.contentDigest
      && entry.aggregateTopicKey === candidate.aggregateTopicKey,
    );
  });
  const proposed = candidates.filter(
    (candidate) => !projectionById.has(candidate.canonicalId),
  );
  const staleEntries = WELDING_CBT_LESSON_PROJECTION.entries.filter((entry) => {
    const candidate = candidateById.get(entry.canonicalId);
    return !candidate || candidate.contentDigest !== entry.contentDigest;
  });
  const matchingAnswerReviews = candidates.flatMap((candidate) => {
    const entry = answerReviewById.get(candidate.canonicalId);
    return entry && entry.contentDigest === candidate.contentDigest
      ? [entry]
      : [];
  });
  const missingAnswerReviews = candidates.filter((candidate) => {
    const entry = answerReviewById.get(candidate.canonicalId);
    return !entry || entry.contentDigest !== candidate.contentDigest;
  });
  const staleAnswerReviews = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
    (entry) => {
      const candidate = candidateById.get(entry.canonicalId);
      return !candidate || candidate.contentDigest !== entry.contentDigest;
    },
  );
  const answerReviewApprovedCount = matchingAnswerReviews.filter(
    (entry) => entry.reviewStatus === "approved",
  ).length;
  const answerReviewHoldCount = matchingAnswerReviews.filter(
    (entry) => entry.reviewStatus === "hold",
  ).length;
  const answerReviewPendingCount = matchingAnswerReviews.filter(
    (entry) => entry.reviewStatus === "pending",
  ).length;
  const safetyCandidates = candidates.filter(
    (candidate) => candidate.aggregateTopicKey === "safety",
  );
  const safetyIds = new Set(
    safetyCandidates.map((candidate) => candidate.canonicalId),
  );

  return {
    bankTotal: candidates.length,
    approvedExactOneCount: approvedExact.length,
    reviewedProjectionHoldCount: reviewedHolds.length,
    proposedCount: proposed.length,
    staleCount: staleEntries.length,
    answerReviewApprovedCount,
    answerReviewHoldCount,
    answerReviewPendingCount,
    missingAnswerReviewCount: missingAnswerReviews.length,
    staleAnswerReviewCount: staleAnswerReviews.length,
    unreviewedAmbiguousCount: answerReviewPendingCount,
    unreviewedUnclassifiedCount: missingAnswerReviews.length,
    safetyBankTotal: safetyCandidates.length,
    safetyApprovedExactOneCount: approvedExact.filter((candidate) =>
      safetyIds.has(candidate.canonicalId),
    ).length,
    safetyReviewedProjectionHoldCount: reviewedHolds.filter((candidate) =>
      safetyIds.has(candidate.canonicalId),
    ).length,
  };
}

export function mergeApprovedWeldingCbtContent(
  content: GeneratedContent,
): GeneratedContent {
  const curation = buildWeldingCbtCuration();
  const closure = getWeldingCbtProjectionClosure();
  if (
    closure.bankTotal !== 525
    || closure.approvedExactOneCount + closure.reviewedProjectionHoldCount
      !== closure.bankTotal
    || closure.proposedCount !== 0
    || closure.staleCount !== 0
    || closure.answerReviewApprovedCount
      + closure.answerReviewHoldCount
      + closure.answerReviewPendingCount
      !== closure.bankTotal
    || closure.missingAnswerReviewCount !== 0
    || closure.staleAnswerReviewCount !== 0
    || closure.unreviewedUnclassifiedCount !== 0
    || closure.safetyBankTotal !== 341
    || closure.safetyApprovedExactOneCount
      + closure.safetyReviewedProjectionHoldCount
      !== closure.safetyBankTotal
  ) {
    throw new Error(
      `용접 CBT 세부 레슨 투영 원장이 닫히지 않았습니다: ${JSON.stringify(closure)}`,
    );
  }
  const answerReviewByCanonicalId = new Map(
    WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [
      entry.canonicalId,
      entry,
    ]),
  );
  const projectionByCanonicalId = new Map(
    WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
      entry.canonicalId,
      entry,
    ]),
  );
  const approved = curation.records.filter((record) => {
    const review = answerReviewByCanonicalId.get(record.canonicalId);
    const projection = projectionByCanonicalId.get(record.canonicalId);
    const rule = curation.ruleByCanonicalId.get(record.canonicalId);
    return Boolean(
      review
      && review.contentDigest === record.canonicalFingerprint
      && isPublishableAnswerReview(review)
      && projection?.reviewStatus === "approved"
      && projection.contentDigest === record.canonicalFingerprint
      && projection.primaryLeafLessonId === review.primaryLeafLessonId
      && projection.aggregateTopicKey === rule?.topicKey,
    );
  });
  const byCanonicalId = new Map<string, WeldingCbtRecord[]>();
  for (const record of approved) {
    const current = byCanonicalId.get(record.canonicalId) ?? [];
    current.push(record);
    byCanonicalId.set(record.canonicalId, current);
  }

  const existingQuestionIds = new Set(content.questions.map((question) => question.id));
  const existingLessonIds = new Set(content.lessons.map((lesson) => lesson.id));
  const existingVariantIds = new Set(content.variants.map((variant) => variant.externalId));
  const duplicateLeafLesson = weldingCbtLeafLessons.find((lesson) =>
    existingLessonIds.has(lesson.id),
  );
  if (duplicateLeafLesson) {
    throw new Error(
      `용접 CBT 세부 레슨 ID가 기존 레슨과 충돌합니다: ${duplicateLeafLesson.id}`,
    );
  }
  const lessonsWithNewLeaves = [...content.lessons, ...weldingCbtLeafLessons];
  const targetLessonById = new Map(
    lessonsWithNewLeaves.map((lesson) => [lesson.id, lesson]),
  );
  const duplicateQuestion = [...byCanonicalId.keys()].find((id) =>
    existingQuestionIds.has(id),
  );
  if (duplicateQuestion) {
    throw new Error(`용접 CBT 문항 ID가 기존 문항과 충돌합니다: ${duplicateQuestion}`);
  }
  const duplicateLesson = Object.values(TOPICS)
    .map(lessonId)
    .find((id) => existingLessonIds.has(id));
  if (duplicateLesson) {
    throw new Error(`용접 CBT 레슨 ID가 기존 레슨과 충돌합니다: ${duplicateLesson}`);
  }

  const maxCanonicalNumber = content.questions.reduce(
    (maximum, question) => Math.max(maximum, question.canonicalNumber),
    0,
  );
  const orderedGroups = [...byCanonicalId.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const questions = orderedGroups.map(([, records], index) => {
    const representative = [...records].sort(
      (left, right) =>
        right.examDate.localeCompare(left.examDate) ||
        left.questionNumber - right.questionNumber,
    )[0];
    const review = answerReviewByCanonicalId.get(representative.canonicalId);
    const projection = projectionByCanonicalId.get(representative.canonicalId);
    if (
      !review
      || !isPublishableAnswerReview(review)
      || !projection
      || projection.reviewStatus !== "approved"
    ) {
      throw new Error(
        `${representative.externalId}: 공개 가능한 승인 답안 검토가 없습니다.`,
      );
    }
    const targetLesson = resolveReviewedTargetLesson(
      representative,
      review,
      targetLessonById,
    );
    const question = buildQuestion(
      representative,
      targetLesson,
      review,
      maxCanonicalNumber + index + 1,
    );
    const sourceUrls = [...new Set(records.map((record) => record.sourceUrl))];
    return {
      ...question,
      verification: question.verification
        ? {
            ...question.verification,
            variantCount: records.length,
            sourceUrls,
          }
        : undefined,
      audit: question.audit
        ? { ...question.audit, evidenceUrls: sourceUrls }
        : undefined,
    };
  });
  const importedQuestionIdsByLesson = new Map<string, string[]>();
  const reviewedWeldingLessonIds = new Set<string>(
    WELDING_CBT_LESSON_PROJECTION.entries.flatMap((entry) =>
      entry.primaryLeafLessonId ? [entry.primaryLeafLessonId] : [],
    ),
  );
  const essentialQuestions = questions
    .flatMap((question) => {
      const review = answerReviewByCanonicalId.get(question.id);
      return review
        && isPublishableAnswerReview(review)
        && review.essentialRank !== null
        ? [{ question, rank: review.essentialRank }]
        : [];
    })
    .sort(
      (left, right) =>
        left.question.lessonId.localeCompare(right.question.lessonId)
        || left.rank - right.rank
        || left.question.id.localeCompare(right.question.id),
    );
  for (const { question } of essentialQuestions) {
    const current = importedQuestionIdsByLesson.get(question.lessonId) ?? [];
    if (current.length >= 5) continue;
    current.push(question.id);
    importedQuestionIdsByLesson.set(question.lessonId, current);
  }
  const fineLessons = lessonsWithNewLeaves.map((lesson) => {
    const importedIds = importedQuestionIdsByLesson.get(lesson.id) ?? [];
    if (reviewedWeldingLessonIds.has(lesson.id)) {
      return {
        ...lesson,
        relatedQuestionIds: importedIds,
      };
    }
    if (importedIds.length === 0) return lesson;
    return {
      ...lesson,
      relatedQuestionIds: [
        ...new Set([...lesson.relatedQuestionIds, ...importedIds]),
      ],
    };
  });
  const overviewLessons = Object.values(TOPICS).map((topic) =>
    buildLesson(topic, []),
  );

  const variants = approved
    .map((record) => {
      if (existingVariantIds.has(record.externalId)) {
        throw new Error(
          `용접 CBT 회차 문항 ID가 기존 variant와 충돌합니다: ${record.externalId}`,
        );
      }
      const review = answerReviewByCanonicalId.get(record.canonicalId);
      if (!review || !isPublishableAnswerReview(review)) {
        throw new Error(
          `${record.externalId}: 공개 가능한 승인 답안 검토가 없습니다.`,
        );
      }
      const targetLesson = resolveReviewedTargetLesson(
        record,
        review,
        targetLessonById,
      );
      return {
        externalId: record.externalId,
        canonicalId: record.canonicalId,
        relationship: "historical_exam_reproduction",
        year: record.year,
        sessionLabel: record.sessionLabel,
        questionNumber: record.questionNumber,
        conceptAlias: targetLesson.title,
        subjectCode: 2,
        stem: record.stem,
        choices: record.choices,
        answer: `${(record.correctIndex ?? 0) + 1}. ${record.choices[record.correctIndex ?? 0]}`,
        explanation: buildReviewedExplanation(review),
        sourceUrl: record.sourceUrl,
        reviewStatus: `답안 검토 승인 · ${review.reviewer}`,
        verificationNote:
          "원문·보기·복원 정답과 문항별 풀이·선택지 피드백·이론 assertion을 승인 검토에서 확인했습니다.",
        shufflePolicy: "all" as const,
      };
    })
    .sort(
      (left, right) =>
        (left.year ?? 0) - (right.year ?? 0) ||
        left.externalId.localeCompare(right.externalId),
    );

  return {
    ...content,
    questions: [...content.questions, ...questions],
    lessons: [...fineLessons, ...overviewLessons],
    variants: [...content.variants, ...variants],
  };
}

export function getWeldingCbtImportSummary() {
  const curation = buildWeldingCbtCuration();
  return {
    ...rawWeldingCbtBank,
    records: undefined,
    approvedOccurrenceCount: curation.sourceApproved.length,
    curatedOccurrenceCount: curation.records.length,
  };
}

export function getWeldingCbtCurationSummary() {
  const curation = buildWeldingCbtCuration();
  const rules = CURATION_RULES.map((rule) => {
    const eligible = curation.eligibleByRule.get(rule.key) ?? [];
    const publishedCanonicalCount = eligible.filter((record) =>
      curation.selectedCanonicalIds.has(record.canonicalId),
    ).length;
    return {
      key: rule.key,
      part: rule.part,
      limit: rule.limit,
      eligibleCanonicalCount: eligible.length,
      publishedCanonicalCount,
    };
  });
  const safetyRules = rules.filter((rule) => rule.part === "산업안전");

  return {
    sourceApprovedOccurrenceCount: curation.sourceApproved.length,
    sourceApprovedCanonicalCount: new Set(
      curation.sourceApproved.map((record) => record.canonicalId),
    ).size,
    publishedOccurrenceCount: curation.records.length,
    publishedCanonicalCount: curation.selectedCanonicalIds.size,
    safety: {
      eligibleCanonicalCount: safetyRules.reduce(
        (total, rule) => total + rule.eligibleCanonicalCount,
        0,
      ),
      publishedCanonicalCount: safetyRules.reduce(
        (total, rule) => total + rule.publishedCanonicalCount,
        0,
      ),
    },
    rules,
  };
}
