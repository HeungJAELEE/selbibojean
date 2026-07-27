import "server-only";

import rawPracticalContent from "@/data/generated/practical-content.json";
import {
  PRACTICAL_WRITTEN_EXAM_CARD_SEEDS,
} from "@/data/source/practical-written-exam-cards";
import {
  getPracticalTextbookPlacement,
  getPracticalTextbookStudyType as getPracticalTextbookStudyTypeRecord,
  getPracticalTextbookSubject as getPracticalTextbookSubjectRecord,
  practicalTextbookPlacementByConceptId,
  practicalTextbookStudyTypes,
  practicalTextbookSubjects,
  type PracticalTextbookStudyTypeId,
  type PracticalTextbookSubjectId,
} from "@/data/source/practical-textbook-taxonomy";
import type {
  PracticalConcept,
  PracticalContent,
  PracticalNcsCoverage,
  PracticalQuestion,
  PracticalStudyCategoryId,
  PracticalVisualAid,
  PracticalWrittenExamCard,
  PracticalWrittenExamCardFormat,
} from "@/lib/domain/practical-types";
import {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";

export {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";

const content = rawPracticalContent as PracticalContent;

const keywordSlug = (keyword: string) =>
  encodeURIComponent(keyword.trim().replace(/\s+/g, "-"));

function inferExamFormat(
  question: PracticalQuestion,
): PracticalWrittenExamCardFormat {
  if (question.visualAidId) return "image";
  if (/계산|추력|토크|틈새|OEE|면적|힘/.test(question.title)) {
    return "calculation";
  }
  if (/순서|단계|스텝|LOTO/.test(question.title)) return "sequence";
  if (/원인|손상|고장|록|오버랩/.test(question.title)) return "diagnosis";
  if (/도면|투상|기호|공차/.test(question.title)) return "drawing";
  if (/종류|용도|특징|성능/.test(question.title)) return "matching";
  return "definition";
}

function uniqueSourceRefs(conceptIds: Set<string>) {
  return content.concepts
    .filter((concept) => conceptIds.has(concept.id))
    .flatMap((concept) => concept.ncsSources)
    .filter(
      (source, index, sources) =>
        sources.findIndex(
          (candidate) =>
            candidate.ncsCode === source.ncsCode &&
            candidate.pdfPage === source.pdfPage &&
            candidate.figureNumber === source.figureNumber,
        ) === index,
    );
}

const seededPracticalWrittenExamCards: PracticalWrittenExamCard[] =
  PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.map((seed) => {
    const linkedConceptIds = new Set([
      ...seed.conceptIds,
      ...seed.supplementalConceptIds,
    ]);
    const linkedQuestions = content.questions.filter((question) =>
      [...seed.pastQuestionIds, ...seed.predictedQuestionIds].includes(
        question.id,
      ),
    );
    const mappedVisuals = linkedQuestions
      .filter((question) => question.visualAidId)
      .map((question) => ({
        questionId: question.id,
        visualAidId: question.visualAidId!,
        role: "recognition" as const,
      }));
    const visualAidIds = [...new Set(mappedVisuals.map((item) => item.visualAidId))]
      .filter((visualAidId) => {
        const visual = content.visualAids.find((item) => item.id === visualAidId);
        return visual?.publicUseStatus === "public";
      });

    return {
      ...seed,
      visualAidIds,
      recognitionVisualAidIds: visualAidIds,
      pastQuestionVisualMappings: mappedVisuals.filter((mapping) =>
        seed.pastQuestionIds.includes(mapping.questionId),
      ),
      sourceRefs: uniqueSourceRefs(linkedConceptIds),
    };
  });

const seededPastQuestionIds = new Set(
  seededPracticalWrittenExamCards.flatMap((card) => card.pastQuestionIds),
);

const uncoveredPastQuestions = content.questions
  .filter(
    (question) =>
      question.kind === "past" &&
      isPublishablePracticalQuestion(question) &&
      !seededPastQuestionIds.has(question.id),
  );

const generatedPastExamCards: PracticalWrittenExamCard[] =
  uncoveredPastQuestions
  .filter(
    (question, index, questions) =>
      questions.findIndex(
        (candidate) =>
          candidate.title === question.title &&
          candidate.conceptIds.join("|") === question.conceptIds.join("|"),
      ) === index,
  )
  .map((question) => {
    const samePastQuestions = uncoveredPastQuestions.filter(
      (candidate) =>
        candidate.title === question.title &&
        candidate.conceptIds.join("|") === question.conceptIds.join("|"),
    );
    const format = inferExamFormat(question);
    const relatedPredicted = content.questions
      .filter(
        (candidate) =>
          candidate.kind === "predicted" &&
          isPublishablePracticalQuestion(candidate) &&
          candidate.conceptIds.some((conceptId) =>
            question.conceptIds.includes(conceptId),
          ),
      )
      .slice(0, 3);
    const visualAidIds = question.visualAidId ? [question.visualAidId] : [];
    const keywordLinks = question.requiredKeywords.slice(0, 5).map((keyword) => ({
      slug: keywordSlug(keyword),
      label: keyword,
    }));

    return {
      id: `PWEC-${question.id}`,
      slug: question.title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\p{L}\p{N}-]/gu, ""),
      title: question.title,
      conceptIds: question.conceptIds,
      supplementalConceptIds: [],
      evidenceIds: samePastQuestions.map((item) => `evidence:${item.id}`),
      primaryFormat: format,
      secondaryFormats: [],
      format,
      questionPattern: question.stem,
      directAnswer: question.modelAnswer,
      studyKeywords: question.requiredKeywords.slice(0, 5),
      keywordLinks,
      answerSkeleton:
        question.calculation.length > 0
          ? question.calculation.slice(0, 4)
          : question.rubric.map((item) => item.label).slice(0, 4),
      recognitionPoints:
        question.requiredKeywords.length > 0
          ? question.requiredKeywords
              .slice(0, 3)
              .map((keyword) => `문제 조건에서 ‘${keyword}’ 단서를 찾습니다.`)
          : ["요구 동사와 조건을 먼저 표시합니다."],
      reasoningSummary: [
        "문제에서 요구한 명칭·조건·관계를 답안 키워드와 연결합니다.",
        "기출 답안을 외운 뒤 숫자·순서·설비가 바뀐 예상문제로 다시 확인합니다.",
      ],
      commonWrongAnswers: question.traps.slice(0, 3),
      variationAxes: [
        "수치와 단위 변경",
        "요구 항목 수 변경",
        "정의와 적용 사례 결합",
        "인접 개념과 비교",
      ],
      pastQuestionIds: samePastQuestions.map((item) => item.id),
      variantQuestionIds: relatedPredicted.slice(0, 1).map((item) => item.id),
      predictedQuestionIds: relatedPredicted.map((item) => item.id),
      predictedExamples: [],
      visualAidIds,
      recognitionVisualAidIds: visualAidIds,
      pastQuestionVisualMappings: question.visualAidId
        ? [
            {
              questionId: question.id,
              visualAidId: question.visualAidId,
              role: "recognition",
            },
          ]
        : [],
      sequenceSteps:
        format === "sequence"
          ? question.rubric.map((item, index) => ({
              id: `${question.id}-STEP-${index + 1}`,
              label: item.label,
              safetyCritical: /안전|차단|잠금|잔압/.test(item.label),
            }))
          : [],
      contentStatus: "published",
      sourceRefs: uniqueSourceRefs(new Set(question.conceptIds)),
    };
  });

const featuredPredictedCardFormats = new Map<
  string,
  PracticalWrittenExamCardFormat
>([
  ["EXP-M04", "drawing"],
  ["EXP-S02", "symbol"],
]);

const featuredPredictedExamCards: PracticalWrittenExamCard[] = [
  ...featuredPredictedCardFormats,
].flatMap(([questionId, format]) => {
  const question = content.questions.find(
    (candidate) =>
      candidate.id === questionId &&
      candidate.kind === "predicted" &&
      isPublishablePracticalQuestion(candidate),
  );
  if (!question) return [];
  const keywordLinks = question.requiredKeywords.slice(0, 5).map((keyword) => ({
    slug: keywordSlug(keyword),
    label: keyword,
  }));
  return [
    {
      id: `PWEC-${question.id}`,
      slug: question.title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\p{L}\p{N}-]/gu, ""),
      title: question.title,
      conceptIds: question.conceptIds,
      evidenceIds: [`evidence:${question.id}`],
      primaryFormat: format,
      secondaryFormats: [],
      format,
      questionPattern: question.stem,
      directAnswer: question.modelAnswer,
      studyKeywords: question.requiredKeywords.slice(0, 5),
      keywordLinks,
      answerSkeleton:
        question.calculation.length > 0
          ? question.calculation.slice(0, 4)
          : question.rubric.map((item) => item.label).slice(0, 4),
      recognitionPoints: [
        "기호·지시선이 가리키는 정확한 위치를 먼저 확인합니다.",
        "명칭만 쓰지 말고 적용 의미나 요구 행동을 함께 씁니다.",
        "시험 원그림이 필요한 기출복원과 자체 예상문제를 구분합니다.",
      ],
      reasoningSummary: [
        "원그림이 없는 복원문제를 흉내 내지 않고 NCS 근거가 있는 예상문제로 연습합니다.",
      ],
      commonWrongAnswers: question.traps.slice(0, 3),
      variationAxes: ["기호 위치 변경", "항목 수 변경", "명칭·의미 결합"],
      pastQuestionIds: [],
      variantQuestionIds: [],
      predictedQuestionIds: [question.id],
      predictedExamples: [],
      visualAidIds: [],
      recognitionVisualAidIds: [],
      pastQuestionVisualMappings: [],
      sequenceSteps: [],
      contentStatus: "published",
      supplementalConceptIds: [],
      sourceRefs: uniqueSourceRefs(new Set(question.conceptIds)),
    },
  ];
});

const practicalWrittenExamCards: PracticalWrittenExamCard[] = [
  ...seededPracticalWrittenExamCards,
  ...generatedPastExamCards,
  ...featuredPredictedExamCards,
];

for (const question of content.questions) {
  const linkedCards = practicalWrittenExamCards.filter((card) =>
    [
      ...card.pastQuestionIds,
      ...card.variantQuestionIds,
      ...card.predictedQuestionIds,
    ].includes(question.id),
  );
  const primaryCard = linkedCards[0];
  if (!primaryCard) continue;
  question.examFormat = primaryCard.primaryFormat;
  question.examCardIds = linkedCards.map((card) => card.id);
  question.visualAidIds = [
    ...new Set([question.visualAidId, ...primaryCard.visualAidIds].filter(Boolean)),
  ] as string[];
  question.sequenceItemIds = primaryCard.sequenceSteps.map((step) => step.id);
  question.variantOfQuestionId = primaryCard.variantQuestionIds.includes(
    question.id,
  )
    ? primaryCard.pastQuestionIds[0] ?? null
    : null;
  question.examEvidenceStatus =
    question.kind === "past"
      ? "past_reconstructed"
      : primaryCard.variantQuestionIds.includes(question.id)
        ? "past_variant"
        : question.conceptIds.some((conceptId) => conceptId.startsWith("PCON-SUP-"))
          ? "ncs_supplement"
          : "predicted_related";
}

export type PracticalWrittenEvidenceCoverage = {
  questionId: string;
  status: "card_linked" | "held";
  cardId: string | null;
  holdReason: string | null;
};

const practicalWrittenEvidenceCoverage: PracticalWrittenEvidenceCoverage[] =
  content.questions
    .filter((question) => question.kind === "past")
    .map((question) => {
      const card = practicalWrittenExamCards.find((candidate) =>
        candidate.pastQuestionIds.includes(question.id),
      );
      return card
        ? {
            questionId: question.id,
            status: "card_linked" as const,
            cardId: card.id,
            holdReason: null,
          }
        : {
            questionId: question.id,
            status: "held" as const,
            cardId: null,
            holdReason:
              question.reviewNote ||
              "원문·시각자료·현행 기준이 확인되기 전까지 공개하지 않습니다.",
          };
    });

export async function getPracticalContent() {
  return content;
}

export async function getPracticalNcsCoverage(): Promise<PracticalNcsCoverage> {
  return content.ncsCoverage;
}

export async function getPracticalWrittenExamCards() {
  return practicalWrittenExamCards;
}

export async function getPracticalWrittenExamCardBySlug(slug: string) {
  return practicalWrittenExamCards.find((card) => card.slug === slug);
}

export async function getPracticalWrittenExamCardsByFormat(
  format: PracticalWrittenExamCardFormat,
) {
  return practicalWrittenExamCards.filter(
    (card) =>
      card.primaryFormat === format || card.secondaryFormats.includes(format),
  );
}

export async function getPracticalWrittenEvidenceCoverage() {
  return practicalWrittenEvidenceCoverage;
}

export async function getPracticalWrittenKeywordIndex() {
  const keywords = new Map<
    string,
    { slug: string; label: string; cardIds: string[]; questionIds: string[] }
  >();
  for (const card of practicalWrittenExamCards) {
    for (const keyword of card.keywordLinks) {
      const existing = keywords.get(keyword.slug) ?? {
        slug: keyword.slug,
        label: keyword.label,
        cardIds: [],
        questionIds: [],
      };
      existing.cardIds.push(card.id);
      existing.questionIds.push(
        ...card.pastQuestionIds,
        ...card.variantQuestionIds,
        ...card.predictedQuestionIds,
      );
      keywords.set(keyword.slug, existing);
    }
  }
  return [...keywords.values()].map((item) => ({
    ...item,
    cardIds: [...new Set(item.cardIds)],
    questionIds: [...new Set(item.questionIds)],
  }));
}

export async function getPracticalWrittenExamCardsForConcept(
  conceptId: string,
) {
  return practicalWrittenExamCards.filter((card) =>
    card.conceptIds.includes(conceptId),
  );
}

export async function getPracticalQuestion(questionId: string) {
  return content.questions.find((question) => question.id === questionId);
}

export async function getPublicPracticalQuestion(questionId: string) {
  const question = await getPracticalQuestion(questionId);
  return question && isPublishablePracticalQuestion(question)
    ? toPublicPracticalQuestion(question)
    : undefined;
}

export async function getPracticalConcept(
  conceptId: string,
): Promise<PracticalConcept | undefined> {
  return content.concepts.find((concept) => concept.id === conceptId);
}

export async function getPracticalStudyCategory(
  categoryId: PracticalStudyCategoryId,
) {
  return content.studyCategories.find(
    (category) => category.id === categoryId,
  );
}

export async function getPracticalVisualAid(
  visualAidId: string | null,
): Promise<PracticalVisualAid | undefined> {
  return visualAidId
    ? content.visualAids.find((visualAid) => visualAid.id === visualAidId)
    : undefined;
}

export async function getPublicPracticalVisualAid(
  visualAidId: string | null,
  use: "prompt" | "theory" = "theory",
): Promise<PracticalVisualAid | undefined> {
  const visualAid = await getPracticalVisualAid(visualAidId);
  if (!visualAid || visualAid.publicUseStatus !== "public") return undefined;
  if (use === "prompt" && visualAid.examMatchStatus !== "exact_source") {
    return undefined;
  }
  return visualAid;
}

export function publicPracticalQuestions(kind?: "past" | "predicted") {
  return content.questions.filter(
    (question) =>
      isPublishablePracticalQuestion(question) &&
      (!kind || question.kind === kind),
  );
}

export function publicPracticalQuestionsByCategory(
  categoryId: PracticalStudyCategoryId,
  kind?: "past" | "predicted",
) {
  return publicPracticalQuestions(kind).filter(
    (question) => question.primaryStudyCategoryId === categoryId,
  );
}

export function practicalConceptsByCategory(
  categoryId: PracticalStudyCategoryId,
) {
  const category = content.studyCategories.find(
    (item) => item.id === categoryId,
  );
  const conceptIds = new Set(category?.conceptIds ?? []);
  return content.concepts.filter(
    (concept) =>
      concept.contentStatus === "published" && conceptIds.has(concept.id),
  );
}

/**
 * 실기 문제풀이 분류와 분리된, NCS 교재용 과목·학습유형 조회 함수다.
 * 원본 엑셀의 subjectLabel은 표기가 혼재되어 있으므로 이곳에서는 검토한
 * PCON 배치표를 단일 기준으로 사용한다.
 */
export function getPracticalTextbookSubjects() {
  return practicalTextbookSubjects;
}

export function getPracticalTextbookStudyTypes() {
  return practicalTextbookStudyTypes;
}

export function getPracticalTextbookSubject(subjectId: string) {
  return getPracticalTextbookSubjectRecord(subjectId);
}

export function getPracticalTextbookStudyType(studyTypeId: string) {
  return getPracticalTextbookStudyTypeRecord(studyTypeId);
}

export function getPracticalTextbookPlacementForConcept(conceptId: string) {
  return getPracticalTextbookPlacement(conceptId);
}

export function practicalConceptsByTextbookSubject(
  subjectId: PracticalTextbookSubjectId,
) {
  return content.concepts.filter((concept) => {
    const placement = practicalTextbookPlacementByConceptId[concept.id];
    return concept.contentStatus === "published" && placement?.subjectId === subjectId;
  });
}

export function practicalConceptsByTextbookSubjectAndType(
  subjectId: PracticalTextbookSubjectId,
  studyTypeId: PracticalTextbookStudyTypeId,
) {
  return practicalConceptsByTextbookSubject(subjectId).filter((concept) => {
    const placement = practicalTextbookPlacementByConceptId[concept.id];
    if (!placement?.studyTypeIds.includes(studyTypeId)) return false;

    // 계산 공식은 실제 식과 단위·적용조건을 가진 항목만 노출한다.
    return studyTypeId !== "formula" || concept.formula.some((item) => item.includes("="));
  });
}

export function practicalTextbookTypeCount(
  subjectId: PracticalTextbookSubjectId,
  studyTypeId: PracticalTextbookStudyTypeId,
) {
  return practicalConceptsByTextbookSubjectAndType(subjectId, studyTypeId).length;
}
