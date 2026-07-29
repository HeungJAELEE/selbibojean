import {
  WRITTEN_WELDING_DEFECTS,
  type WrittenWeldingDefect,
} from "@/data/source/written-welding-defects";
import { buildChoiceFeedback, choiceFeedbackPasses } from "@/lib/content/enrichment";
import type {
  Choice,
  GeneratedContent,
  Lesson,
  LessonBlock,
  Question,
} from "@/lib/domain/types";

const REVIEWED_AT = "2026-07-29T00:00:00.000Z";
const SUBJECT_ID = "subject-2";
const GROUP_ID = "s2-g02";
const THEORY_SOURCE = "private-editorial-source";
const ACTUAL_CBT_SOURCE = "https://cbtbank.kr/exam/np20090726";

type DefectQuestionDefinition = {
  id: string;
  lessonId: string;
  stem: string;
  choices: [string, string, string, string];
  choiceEvidence: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  errorReason: Question["errorReason"];
};

type ActualDefectQuestionDefinition = DefectQuestionDefinition & {
  externalId: string;
  year: number;
  sessionLabel: string;
  questionNumber: number;
  conceptAlias: string;
  answer: string;
};

function defectBlocks(
  defect: WrittenWeldingDefect,
  questionIds: string[],
): LessonBlock[] {
  const comparison = [
    "| 구분 | 판단 기준 |",
    "|---|---|",
    `| 결함 분류 | ${defect.category} |`,
    `| 눈에 보이는 형상 | ${defect.appearance} |`,
    `| 대표 원인 | ${defect.causes} |`,
    `| 예방·수정 | ${defect.prevention} |`,
    `| 가까운 결함과 구분 | ${defect.distinction} |`,
  ].join("\n");

  return [
    {
      id: "summary",
      kind: "summary",
      title: "핵심 3줄",
      body: [
        `1. **형상:** ${defect.appearance}`,
        `2. **원인:** ${defect.causes}`,
        `3. **구분:** ${defect.distinction}`,
      ].join("\n"),
      order: 1,
    },
    {
      id: "definition",
      kind: "definition",
      title: `${defect.label}은 무엇인가`,
      body: `${defect.appearance}\n\n- **분류:** ${defect.category}\n- **대표 원인:** ${defect.causes}\n- **한 줄 구분:** ${defect.distinction}`,
      order: 2,
    },
    {
      id: "principle",
      kind: "principle",
      title: "발생 원리",
      body: `${defect.mechanism}\n\n결함 문제는 이름만 외우기보다 **형상 → 발생 위치 → 직접 원인 → 예방·수정 방법** 순으로 연결해야 보기의 원인과 결함명이 서로 바뀐 함정을 걸러낼 수 있습니다.`,
      order: 3,
    },
    {
      id: "comparison",
      kind: "structure",
      title: "형상·원인·대책 비교",
      body: comparison,
      order: 4,
    },
    {
      id: "selection",
      kind: "selection",
      title: "예방과 수정",
      body: `1. 결함의 실제 위치와 형상을 먼저 확인합니다.\n2. ${defect.causes}\n3. ${defect.prevention}\n4. 승인된 용접절차서의 재료·두께·전류·전압·속도·소모재 조건과 대조합니다.\n5. 보수 후에는 같은 검사법 또는 절차가 지정한 방법으로 재검사합니다.`,
      order: 5,
    },
    {
      id: "diagnosis",
      kind: "diagnosis",
      title: "사진·외관·비파괴검사에서 찾는 법",
      body: `${defect.inspection}\n\n**판독 순서**\n1. 표면에 열린 결함인지 내부 결함인지 나눕니다.\n2. 둥근 점·불규칙 개재물·직선형 불연속·가장자리 홈·돌출 중 어느 형상인지 봅니다.\n3. ${defect.distinction}\n4. 한 장의 사진이나 방사선 영상만으로 깊이와 실제 크기를 단정하지 않고 촬영·검사 조건을 함께 확인합니다.`,
      order: 6,
    },
    {
      id: "exam-point",
      kind: "exam_point",
      title: "시험에 자주 출제되는 유형",
      body: `${defect.examPattern}\n\n- **정의 식별형:** 결함의 모양을 설명하고 명칭을 고릅니다.\n- **원인 연결형:** 전류·속도·아크길이·청소·수분·구속 조건을 결함과 짝짓습니다.\n- **대책 선택형:** 원인의 반대 조치가 아니라 실제 발생 메커니즘을 끊는 조치를 고릅니다.\n- **사진·검사형:** VT·RT·UT 등의 형상 단서로 비슷한 결함을 구분합니다.`,
      order: 7,
    },
    {
      id: "trap",
      kind: "trap",
      title: "오답 함정",
      body: `- ${defect.distinction}\n- 원인 하나가 여러 결함에 영향을 줄 수 있으므로 전류만 보고 확정하지 말고 형상과 위치를 함께 봅니다.\n- 검사 영상의 밝고 어두움은 촬영 방식과 조건에 따라 달라질 수 있으므로 형상·위치 단서를 우선합니다.\n- **한 줄 암기:** ${defect.memory}`,
      order: 8,
    },
    {
      id: "source",
      kind: "source",
      title: "출처와 검토 상태",
      body: `- 사용자 원문: 통합본_제2과목_용접_및_안전관리, ‘용접 일반 결함 및 불량 원인’과 결함 판독 표\n- NCS 보충 원칙: 사용자 원문의 결함명·출제 문장을 보존하고 용입/융합, 기공/피트, 고온/저온균열처럼 구분이 필요한 부분만 표준 용어로 보충\n- 원본: ${THEORY_SOURCE}\n- 실제 CBT 연결: ${defect.actualQuestionIds.length ? defect.actualQuestionIds.join(", ") : "직접 일치 문항 검수 중"}\n- 실전 유사문제: ${questionIds.join(", ")}\n- 최근 검토일: 2026-07-29\n- 상태: 실제 CBT와 원문 근거 실전 유사문제를 구분해 공개`,
      order: 9,
    },
  ];
}

function rotatedOptions(
  defectIndex: number,
  correctIndex: number,
  select: (defect: WrittenWeldingDefect) => string,
) {
  const current = WRITTEN_WELDING_DEFECTS[defectIndex];
  const distractors = [1, 2, 4].map(
    (offset) =>
      WRITTEN_WELDING_DEFECTS[
        (defectIndex + offset) % WRITTEN_WELDING_DEFECTS.length
      ],
  );
  const optionDefects = [...distractors];
  optionDefects.splice(correctIndex, 0, current);
  return {
    choices: optionDefects.map(select) as [string, string, string, string],
    optionDefects,
  };
}

function questionDefinitionsForDefect(
  defect: WrittenWeldingDefect,
  defectIndex: number,
): DefectQuestionDefinition[] {
  const firstNumber = defectIndex * 5 + 1;
  const id = (offset: number) =>
    `WELD-DEF-${String(firstNumber + offset).padStart(3, "0")}`;
  const correctIndices = [
    defectIndex % 4,
    (defectIndex + 1) % 4,
    (defectIndex + 2) % 4,
    (defectIndex + 3) % 4,
    defectIndex % 4,
  ];
  const appearanceOptions = rotatedOptions(
    defectIndex,
    correctIndices[0],
    (item) => item.label,
  );
  const causeOptions = rotatedOptions(
    defectIndex,
    correctIndices[1],
    (item) => item.label,
  );
  const distinctionOptions = rotatedOptions(
    defectIndex,
    correctIndices[2],
    (item) => item.label,
  );
  const preventionOptions = rotatedOptions(
    defectIndex,
    correctIndices[3],
    (item) => item.prevention,
  );
  const inspectionOptions = rotatedOptions(
    defectIndex,
    correctIndices[4],
    (item) => item.inspection,
  );

  return [
    {
      id: id(0),
      lessonId: defect.id,
      stem: `${defect.appearance} 이 설명에 해당하는 용접 결함은?`,
      choices: appearanceOptions.choices,
      choiceEvidence: appearanceOptions.optionDefects.map(
        (item) => `${item.label}: ${item.appearance}`,
      ) as [string, string, string, string],
      correctIndex: correctIndices[0],
      explanation: `${defect.label}은 ${defect.appearance}`,
      errorReason: "개념 혼동",
    },
    {
      id: id(1),
      lessonId: defect.id,
      stem: `${defect.causes} 이 조건에서 형상까지 함께 확인해야 할 대표 결함은?`,
      choices: causeOptions.choices,
      choiceEvidence: causeOptions.optionDefects.map(
        (item) => `${item.label}의 대표 원인은 ${item.causes}입니다.`,
      ) as [string, string, string, string],
      correctIndex: correctIndices[1],
      explanation: `${defect.label}은(는) ${defect.causes}과 직접 연결해 판단합니다. 전류 조건 하나만으로 확정하지 않고 ${defect.appearance}`,
      errorReason: "조건 누락",
    },
    {
      id: id(2),
      lessonId: defect.id,
      stem: `${defect.distinction} 위 구분 기준이 설명하는 결함은?`,
      choices: distinctionOptions.choices,
      choiceEvidence: distinctionOptions.optionDefects.map(
        (item) => `${item.label}의 구분 기준은 다음과 같습니다. ${item.distinction}`,
      ) as [string, string, string, string],
      correctIndex: correctIndices[2],
      explanation: `${defect.label}을 비슷한 결함과 구분하는 핵심은 다음과 같습니다. ${defect.distinction}`,
      errorReason: "용어 혼동",
    },
    {
      id: id(3),
      lessonId: defect.id,
      stem: `${defect.label}의 재발을 줄이기 위한 조치로 가장 적절한 것은?`,
      choices: preventionOptions.choices,
      choiceEvidence: preventionOptions.optionDefects.map(
        (item) =>
          `${item.prevention} 이 조치는 ${item.label}의 대표 예방·수정 조건입니다.`,
      ) as [string, string, string, string],
      correctIndex: correctIndices[3],
      explanation: `${defect.label}은(는) 발생 원인인 ${defect.causes}을(를) 끊도록 다음 조치를 적용합니다. ${defect.prevention}`,
      errorReason: "조건 누락",
    },
    {
      id: id(4),
      lessonId: defect.id,
      stem: `${defect.label}을 확인할 때의 형상·검사 연결로 가장 적절한 것은?`,
      choices: inspectionOptions.choices,
      choiceEvidence: inspectionOptions.optionDefects.map(
        (item) =>
          `${item.inspection} 이 설명은 ${item.label}의 대표 확인 방법입니다.`,
      ) as [string, string, string, string],
      correctIndex: correctIndices[4],
      explanation: `${defect.label}의 검사에서는 다음 형상과 적용 조건을 함께 확인합니다. ${defect.inspection}`,
      errorReason: "개념 혼동",
    },
  ];
}

const questionDefinitions = WRITTEN_WELDING_DEFECTS.flatMap(
  questionDefinitionsForDefect,
);

const actualQuestionDefinitions: ActualDefectQuestionDefinition[] = [
  {
    id: "WELD-ACTUAL-2009-Q51",
    externalId: "welding-engineer-2009-3-q51",
    lessonId: "lesson-welding-defect-crack",
    year: 2009,
    sessionLabel: "제3회 용접기사 필기",
    questionNumber: 51,
    conceptAlias: "수소의 영향·은점",
    stem: "용접금속에서 수소의 영향이 아닌 것은?",
    choices: ["언더비드 크랙", "은점", "선상조직", "석출경화"],
    choiceEvidence: [
      "확산성 수소는 열영향부의 언더비드 크랙과 연결됩니다.",
      "은점은 파단면에 나타나는 수소 관련 결함입니다.",
      "선상조직은 용접금속 속 수소의 영향으로 분류됩니다.",
      "석출경화는 합금 원소의 석출에 따른 경화로, 이 문항에서 묻는 수소의 영향이 아닙니다.",
    ],
    correctIndex: 3,
    answer: "④ 석출경화",
    explanation:
      "언더비드 크랙, 은점, 선상조직은 용접금속의 수소 영향과 연결됩니다. 석출경화는 과포화 고용체에서 석출물이 생겨 경화되는 현상이므로 정답은 ④입니다.",
    errorReason: "개념 혼동",
  },
  {
    id: "WELD-ACTUAL-2009-Q54",
    externalId: "welding-engineer-2009-3-q54",
    lessonId: "lesson-welding-defect-crack",
    year: 2009,
    sessionLabel: "제3회 용접기사 필기",
    questionNumber: 54,
    conceptAlias: "은점(Fish eye)",
    stem: "은점(fish eye)에 관한 설명 중 틀린 것은?",
    choices: [
      "용착 금속이 인장 또는 굽힘으로 파단 될 때 파면에 나타나는 원형의 결함이다.",
      "은점 생성의 주요 원인은 수소의 석출취화이다.",
      "용착 금속의 인장강도에는 거의 영향이 없으나 연신은 감소시킨다.",
      "불순물 S, P의 편석에 의한 것이다.",
    ],
    choiceEvidence: [
      "은점은 인장·굽힘 파단면에서 밝은 원형 흔적으로 관찰됩니다.",
      "은점의 핵심 원인은 용접금속 속 수소에 의한 취화입니다.",
      "은점은 연성을 저하시켜 연신 감소와 연결됩니다.",
      "황·인의 편석은 응고 중 고온균열과 연결되는 설명으로 은점의 직접 원인이 아닙니다.",
    ],
    correctIndex: 3,
    answer: "④ 불순물 S, P의 편석에 의한 것이다.",
    explanation:
      "은점은 파단면에 나타나는 밝은 원형 흔적으로 수소 취화와 관련되고 연신을 감소시킵니다. 황(S)·인(P)의 편석은 고온균열 쪽 원인이므로 정답은 ④입니다.",
    errorReason: "용어 혼동",
  },
];

function buildChoices(
  definition: DefectQuestionDefinition,
  concept: string,
): Choice[] {
  const correctText = definition.choices[definition.correctIndex];
  return definition.choices.map((text, index) => {
    const correct = index === definition.correctIndex;
    return {
      id: `${definition.id}-c${index + 1}`,
      order: index + 1,
      text,
      feedback: buildChoiceFeedback({
        stem: definition.stem,
        choiceText: text,
        correctText,
        correct,
        explanation: definition.explanation,
        choiceEvidence: definition.choiceEvidence[index],
        concept,
        groupId: GROUP_ID,
        groupTitle: "아크용접",
      }),
    };
  });
}

function buildQuestion(
  definition: DefectQuestionDefinition,
  canonicalNumber: number,
): Question {
  const defect = WRITTEN_WELDING_DEFECTS.find(
    (item) => item.id === definition.lessonId,
  );
  if (!defect) throw new Error(`${definition.id}의 연결 레슨을 찾지 못했습니다.`);
  const choices = buildChoices(definition, defect.title);
  const feedbackPassed = choices.every((choice, index) =>
    choiceFeedbackPasses(choice.feedback, index === definition.correctIndex),
  );

  return {
    id: definition.id,
    canonicalNumber,
    subjectId: SUBJECT_ID,
    conceptGroupId: GROUP_ID,
    conceptId: defect.conceptId,
    lessonId: defect.id,
    lessonAnchor: "exam-point",
    stem: definition.stem,
    choices,
    correctChoiceId: choices[definition.correctIndex].id,
    answerText: choices[definition.correctIndex].text,
    explanation: definition.explanation,
    errorReason: definition.errorReason,
    sourceLabel: THEORY_SOURCE,
    reviewStatus: "사용자 결함 원문·NCS 구분 기준·선택지 피드백 검수 완료",
    contentStatus: feedbackPassed ? "published" : "in_review",
    publication: {
      readiness: feedbackPassed ? "ready" : "blocked",
      blockers: feedbackPassed ? [] : ["content_quality"],
    },
    verification: {
      status: feedbackPassed ? "verified" : "blocked",
      method: "source_backed_reconstruction",
      variantCount: 1,
      sourceUrls: [THEORY_SOURCE],
      riskTags: ["editorial_reconstruction"],
      note:
        "사용자 제2과목 원문의 결함 정의·원인·대책·판독 기준을 보존하고 NCS 용어로 충돌 부분만 보완한 실전 유사문제입니다. 실제 CBT 원문으로 표시하지 않습니다.",
      reviewedAt: REVIEWED_AT,
    },
    validation: {
      answer: true,
      explanation: definition.explanation.trim().length >= 20,
      choiceFeedback: feedbackPassed,
      theoryLink: true,
      contentQuality: feedbackPassed,
    },
  };
}

function buildActualQuestion(
  definition: ActualDefectQuestionDefinition,
  canonicalNumber: number,
): Question {
  const defect = WRITTEN_WELDING_DEFECTS.find(
    (item) => item.id === definition.lessonId,
  );
  if (!defect) throw new Error(`${definition.id}의 연결 레슨을 찾지 못했습니다.`);
  const choices = buildChoices(definition, defect.title);
  const feedbackPassed = choices.every((choice, index) =>
    choiceFeedbackPasses(choice.feedback, index === definition.correctIndex),
  );

  return {
    id: definition.id,
    canonicalNumber,
    subjectId: SUBJECT_ID,
    conceptGroupId: GROUP_ID,
    conceptId: defect.conceptId,
    lessonId: defect.id,
    lessonAnchor: "exam-point",
    stem: definition.stem,
    choices,
    correctChoiceId: choices[definition.correctIndex].id,
    answerText: choices[definition.correctIndex].text,
    explanation: definition.explanation,
    errorReason: definition.errorReason,
    sourceLabel: `${definition.year}년 ${definition.sessionLabel} ${definition.questionNumber}번`,
    reviewStatus: "교차 자격 실제 CBT 원문·정답 대조 완료",
    contentStatus: feedbackPassed ? "published" : "in_review",
    publication: {
      readiness: feedbackPassed ? "ready" : "blocked",
      blockers: feedbackPassed ? [] : ["content_quality"],
    },
    verification: {
      status: feedbackPassed ? "verified" : "blocked",
      method: "source_backed_reconstruction",
      variantCount: 1,
      sourceUrls: [ACTUAL_CBT_SOURCE],
      riskTags: ["historical_context"],
      note:
        "2009년 7월 26일 시행된 제3회 용접기사 필기 원문과 정답을 대조했습니다. 설비보전기사 직접 기출이 아니라 용접결함 학습을 위한 교차 자격 실제 CBT입니다.",
      reviewedAt: REVIEWED_AT,
    },
    validation: {
      answer: true,
      explanation: definition.explanation.trim().length >= 20,
      choiceFeedback: feedbackPassed,
      theoryLink: true,
      contentQuality: feedbackPassed,
    },
  };
}

function buildActualVariants(): GeneratedContent["variants"] {
  return actualQuestionDefinitions.map((definition) => ({
    externalId: definition.externalId,
    canonicalId: definition.id,
    relationship: "교차 자격 실제 CBT",
    year: definition.year,
    sessionLabel: definition.sessionLabel,
    questionNumber: definition.questionNumber,
    conceptAlias: definition.conceptAlias,
    subjectCode: 2,
    stem: definition.stem,
    choices: [...definition.choices],
    answer: definition.answer,
    explanation: definition.explanation,
    sourceUrl: ACTUAL_CBT_SOURCE,
    reviewStatus: "용접기사 원문·정답 대조",
    verificationNote:
      "2009년 제3회 용접기사 실제 CBT입니다. 설비보전기사 직접 기출로 오인하지 않도록 교차 자격 기출로 표시합니다.",
  }));
}

function buildLesson(
  defect: WrittenWeldingDefect,
  questionIds: string[],
): Lesson {
  const blocks = defectBlocks(defect, questionIds);
  const substantiveCharacters = blocks
    .filter((block) => block.kind !== "source")
    .map((block) => `${block.title}${block.body}`.replace(/\s+/g, ""))
    .join("").length;

  return {
    id: defect.id,
    subjectId: SUBJECT_ID,
    conceptGroupId: GROUP_ID,
    conceptId: defect.conceptId,
    title: defect.title,
    aliases: defect.aliases,
    summary: [
      defect.appearance,
      defect.mechanism,
      defect.distinction,
    ],
    blocks,
    relatedQuestionIds: [...questionIds, ...defect.actualQuestionIds],
    coverageStatus: "covered",
    contentStatus: "published",
    sourceNeeded: false,
    reviewedAt: REVIEWED_AT,
    publication: { readiness: "ready", blockers: [] },
    quality: {
      tier: "core",
      substantiveCharacters,
      genericPhraseMatches: [],
      languageIssueMatches: [],
      sourceLinked: true,
      passed: substantiveCharacters >= 900,
    },
  };
}

export function getApprovedWeldingDefectContent(
  baseCanonicalNumber = 350_000,
) {
  const mockQuestions = questionDefinitions.map((definition, index) =>
    buildQuestion(definition, baseCanonicalNumber + index + 1),
  );
  const actualQuestions = actualQuestionDefinitions.map((definition, index) =>
    buildActualQuestion(
      definition,
      baseCanonicalNumber + mockQuestions.length + index + 1,
    ),
  );
  const questionIdsByLessonId = new Map<string, string[]>();
  for (const question of mockQuestions) {
    const current = questionIdsByLessonId.get(question.lessonId) ?? [];
    current.push(question.id);
    questionIdsByLessonId.set(question.lessonId, current);
  }
  const lessons = WRITTEN_WELDING_DEFECTS.map((defect) =>
    buildLesson(defect, questionIdsByLessonId.get(defect.id) ?? []),
  );
  return {
    questions: [...mockQuestions, ...actualQuestions],
    lessons,
    variants: buildActualVariants(),
  };
}

export function mergeApprovedWeldingDefectContent(
  content: GeneratedContent,
): GeneratedContent {
  const supplement = getApprovedWeldingDefectContent();
  const existingQuestionIds = new Set(
    content.questions.map((question) => question.id),
  );
  const existingLessonIds = new Set(content.lessons.map((lesson) => lesson.id));
  const existingVariantIds = new Set(
    content.variants.map((variant) => variant.externalId),
  );
  const questions = supplement.questions.filter(
    (question) => !existingQuestionIds.has(question.id),
  );
  const lessons = supplement.lessons.filter(
    (lesson) => !existingLessonIds.has(lesson.id),
  );
  const variants = supplement.variants.filter(
    (variant) => !existingVariantIds.has(variant.externalId),
  );
  const publishedQuestionCount = questions.filter(
    (question) => question.contentStatus === "published",
  ).length;
  const publishedLessonCount = lessons.filter(
    (lesson) => lesson.contentStatus === "published",
  ).length;
  const choiceFeedbackCount = questions.reduce(
    (total, question) => total + question.choices.length,
    0,
  );
  const sourceBackedQuestionCount = questions.filter(
    (question) =>
      question.verification?.method === "source_backed_reconstruction",
  ).length;
  const editorialReconstructionCount = questions.filter((question) =>
    question.verification?.riskTags.includes("editorial_reconstruction"),
  ).length;
  const historicalContextCount = questions.filter((question) =>
    question.verification?.riskTags.includes("historical_context"),
  ).length;

  return {
    ...content,
    questions: [...content.questions, ...questions],
    lessons: [...content.lessons, ...lessons],
    variants: [...content.variants, ...variants],
    report: {
      ...content.report,
      publishedQuestionCount:
        content.report.publishedQuestionCount + publishedQuestionCount,
      publication: {
        ...content.report.publication,
        ready: content.report.publication.ready + publishedQuestionCount,
      },
      verification: {
        ...content.report.verification,
        verified:
          content.report.verification.verified + publishedQuestionCount,
        sourceBackedReconstruction:
          content.report.verification.sourceBackedReconstruction +
          sourceBackedQuestionCount,
        riskCounts: {
          ...content.report.verification.riskCounts,
          editorial_reconstruction:
            content.report.verification.riskCounts.editorial_reconstruction +
            editorialReconstructionCount,
          historical_context:
            content.report.verification.riskCounts.historical_context +
            historicalContextCount,
        },
      },
      coverage: {
        ...content.report.coverage,
        covered: content.report.coverage.covered + publishedLessonCount,
      },
      quality: {
        ...content.report.quality,
        lessonPassed:
          content.report.quality.lessonPassed + publishedLessonCount,
        choiceFeedbackPassed:
          content.report.quality.choiceFeedbackPassed + choiceFeedbackCount,
      },
      groupQuality: content.report.groupQuality.map((group) =>
        group.groupId === GROUP_ID
          ? {
              ...group,
              lessonCount: group.lessonCount + lessons.length,
              lessonPassed: group.lessonPassed + publishedLessonCount,
              publishedLessonCount:
                group.publishedLessonCount + publishedLessonCount,
              publishedLessonPassed:
                group.publishedLessonPassed + publishedLessonCount,
              questionCount: group.questionCount + questions.length,
              publishedQuestionCount:
                group.publishedQuestionCount + publishedQuestionCount,
              choiceFeedbackCount:
                group.choiceFeedbackCount + choiceFeedbackCount,
              choiceFeedbackPassed:
                group.choiceFeedbackPassed + choiceFeedbackCount,
            }
          : group,
      ),
    },
  };
}
