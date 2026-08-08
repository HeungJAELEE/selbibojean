import "server-only";

import rawPracticalContent from "@/data/generated/practical-content.json";
import rawPracticalWrittenGovernance from "@/data/generated/practical-written-governance.json";
import type { ExamSummaryEvidence } from "@/data/source/practical-exam-subject-summaries";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import {
  PRACTICAL_VISUAL_COVERAGE,
  visualAidIdsForQuestion,
} from "@/data/source/practical-visual-coverage";
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
  ExamEvidenceDisplayKind,
  PracticalExamRepresentativeQuestion,
  PracticalNcsCoverage,
  PracticalQuestion,
  PublicPracticalQuestion,
  PracticalStudyCategoryId,
  PracticalVisualAid,
  PracticalVisualUsage,
  PracticalWrittenExamCard,
  PracticalWrittenExamCardFormat,
} from "@/lib/domain/practical-types";
import {
  canUsePracticalVisualAid,
  learnerVisiblePracticalVisualAid,
} from "@/lib/domain/practical-visual-policy";
import type { PracticalWrittenGovernanceManifest } from "@/lib/domain/practical-execution-types";
import {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";
import {
  isLearnerVisiblePracticalConcept,
  isLearnerVisiblePracticalQuestion,
  isLearnerVisiblePracticalWrittenExamCard,
} from "@/lib/content/learner-visibility";

export {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";

const content = {
  ...(rawPracticalContent as PracticalContent),
  visualAids: PRACTICAL_VISUAL_AIDS,
} satisfies PracticalContent;
const writtenGovernance =
  rawPracticalWrittenGovernance as PracticalWrittenGovernanceManifest;

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
    const visualAidIds = [
      ...new Set([
        ...seed.visualAidIds,
        ...mappedVisuals.map((item) => item.visualAidId),
      ]),
    ]
      .filter((visualAidId) => {
        const visual = content.visualAids.find((item) => item.id === visualAidId);
        return visual ? learnerVisiblePracticalVisualAid(visual) : false;
      });

    return {
      ...seed,
      visualAidIds,
      recognitionVisualAidIds: [
        ...new Set([
          ...seed.recognitionVisualAidIds,
          ...mappedVisuals.map((item) => item.visualAidId),
        ]),
      ].filter((visualAidId) => visualAidIds.includes(visualAidId)),
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
              visualFrameIds: [],
              answerPhrase: item.label,
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
  return practicalWrittenExamCards.filter(
    isLearnerVisiblePracticalWrittenExamCard,
  );
}

export async function getPracticalWrittenExamCardBySlug(slug: string) {
  return practicalWrittenExamCards.find(
    (card) =>
      card.slug === slug &&
      isLearnerVisiblePracticalWrittenExamCard(card),
  );
}

export async function getPracticalWrittenExamCardsByFormat(
  format: PracticalWrittenExamCardFormat,
) {
  return practicalWrittenExamCards.filter(
    (card) =>
      isLearnerVisiblePracticalWrittenExamCard(card) &&
      (card.primaryFormat === format || card.secondaryFormats.includes(format)),
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
  for (const card of practicalWrittenExamCards.filter(
    isLearnerVisiblePracticalWrittenExamCard,
  )) {
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
  if (!isLearnerVisiblePracticalConcept({ id: conceptId })) return [];
  return practicalWrittenExamCards.filter(
    (card) =>
      isLearnerVisiblePracticalWrittenExamCard(card) &&
      card.conceptIds.includes(conceptId),
  );
}

export async function getPracticalQuestion(questionId: string) {
  return content.questions.find((question) => question.id === questionId);
}

export async function getPublicPracticalQuestion(questionId: string) {
  const question = await getPracticalQuestion(questionId);
  return question &&
    isPublishablePracticalQuestion(question) &&
    isLearnerVisiblePracticalQuestion(question)
    ? toPublicPracticalQuestion(question)
    : undefined;
}

export async function getPracticalConcept(
  conceptId: string,
): Promise<PracticalConcept | undefined> {
  const concept = content.concepts.find((item) => item.id === conceptId);
  if (!concept) return undefined;
  const coverageVisualAidIds = PRACTICAL_VISUAL_COVERAGE.filter(
    (item) => item.status === "ready" && item.conceptIds.includes(conceptId),
  ).flatMap((item) => item.visualAidIds);
  return {
    ...concept,
    visualAidIds: [
      ...new Set([...(concept.visualAidIds ?? []), ...coverageVisualAidIds]),
    ],
  };
}

export async function getPublicPracticalConcept(
  conceptId: string,
): Promise<PracticalConcept | undefined> {
  const concept = await getPracticalConcept(conceptId);
  return concept &&
    concept.contentStatus === "published" &&
    isLearnerVisiblePracticalConcept(concept)
    ? concept
    : undefined;
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
  use: "prompt" | "theory" | PracticalVisualUsage = "theory",
): Promise<PracticalVisualAid | undefined> {
  const visualAid = await getPracticalVisualAid(visualAidId);
  if (!visualAid) return undefined;
  if (use === "theory") {
    return learnerVisiblePracticalVisualAid(visualAid) ? visualAid : undefined;
  }
  const usage = use === "prompt" ? "past_exam_prompt" : use;
  return canUsePracticalVisualAid(visualAid, usage)
    ? visualAid
    : undefined;
}

export async function getPublicPracticalQuestionVisualAids(
  question: Pick<
    PublicPracticalQuestion,
    "id" | "visualAidId" | "visualAidIds"
  >,
  use: "prompt" | PracticalVisualUsage,
): Promise<PracticalVisualAid[]> {
  const visualAidIds = visualAidIdsForQuestion(question.id, [
    question.visualAidId,
    ...(question.visualAidIds ?? []),
  ]);
  const visualAids = await Promise.all(
    visualAidIds.map((visualAidId) =>
      getPublicPracticalVisualAid(visualAidId, use),
    ),
  );

  return visualAids.filter(
    (visualAid): visualAid is PracticalVisualAid => Boolean(visualAid),
  );
}

export function deriveExamEvidenceDisplayKinds(
  evidence: ExamSummaryEvidence,
): ExamEvidenceDisplayKind[] {
  const kinds = new Set<ExamEvidenceDisplayKind>();
  const practicalQuestionIds = new Set(evidence.practicalQuestionIds);
  const explicitEvidenceIds = new Set(evidence.evidenceIds);
  const evidenceItems = writtenGovernance.evidence.filter(
    (item) =>
      explicitEvidenceIds.has(item.id) ||
      item.questionIds.some((questionId) =>
        practicalQuestionIds.has(questionId),
      ),
  );

  for (const item of evidenceItems) {
    if (item.status === "past_reconstructed") kinds.add("practical_past");
    if (item.status === "past_variant") kinds.add("practical_variant");
    if (item.status === "predicted_related") kinds.add("practical_predicted");
    if (item.status === "ncs_supplement") kinds.add("ncs_supplement");
  }

  if (evidence.writtenQuestionIds.length > 0) kinds.add("written_frequent");
  if (evidence.ncsSourceRefs.length > 0) kinds.add("ncs_supplement");

  return [...kinds];
}

function representativeQuestionPriority(
  question: PracticalExamRepresentativeQuestion,
) {
  if (question.evidenceKinds.includes("practical_past")) return 0;
  if (question.evidenceKinds.includes("practical_variant")) return 1;
  if (question.evidenceKinds.includes("practical_predicted")) return 2;
  if (question.evidenceKinds.includes("written_frequent")) return 3;
  return 4;
}

/**
 * 과목 요약용 문제는 공개 가능한 문항만 사용하며 최대 3개로 제한한다.
 * 라벨은 저장된 한국어 문자열이 아니라 Evidence 관계에서 파생한다.
 */
export function getPublicPracticalExamRepresentativeQuestions(
  questionIds: string[],
): PracticalExamRepresentativeQuestion[] {
  const requestedOrder = new Map(
    questionIds.map((questionId, index) => [questionId, index]),
  );

  return content.questions
    .filter(
      (question) =>
        requestedOrder.has(question.id) &&
        isPublishablePracticalQuestion(question) &&
        isLearnerVisiblePracticalQuestion(question),
    )
    .map((question) => {
      const evidenceIds = writtenGovernance.evidence
        .filter((item) => item.questionIds.includes(question.id))
        .map((item) => item.id);
      const evidenceKinds = deriveExamEvidenceDisplayKinds({
        evidenceIds,
        writtenQuestionIds: [],
        practicalQuestionIds: [question.id],
        ncsSourceRefs: [],
      });
      if (evidenceKinds.length === 0) {
        evidenceKinds.push(
          question.kind === "past"
            ? "practical_past"
            : "practical_predicted",
        );
      }
      const visual = question.visualAidId
        ? content.visualAids.find(
            (item) =>
              item.id === question.visualAidId &&
              item.publicUseStatus === "public" &&
              item.examMatchStatus === "exact_source",
          )
        : undefined;

      return {
        id: question.id,
        title: question.title,
        stem: question.stem,
        evidenceKinds,
        occurrence: question.occurrence
          ? {
              year: question.occurrence.year,
              round: question.occurrence.round,
            }
          : null,
        visual: visual
          ? {
              id: visual.id,
              title: visual.title,
              imagePaths: visual.imagePaths,
              altText: visual.altText,
            }
          : null,
      };
    })
    .sort((left, right) => {
      const byEvidence =
        representativeQuestionPriority(left) -
        representativeQuestionPriority(right);
      if (byEvidence !== 0) return byEvidence;
      return (
        (requestedOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (requestedOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER)
      );
    })
    .slice(0, 3);
}

export function publicPracticalQuestions(kind?: "past" | "predicted") {
  return content.questions.filter(
    (question) =>
      isPublishablePracticalQuestion(question) &&
      isLearnerVisiblePracticalQuestion(question) &&
      (!kind || question.kind === kind),
  );
}

export function publicPracticalConcepts(
  contentRole?: PracticalConcept["contentRole"],
) {
  return content.concepts.filter(
    (concept) =>
      concept.contentStatus === "published" &&
      isLearnerVisiblePracticalConcept(concept) &&
      (!contentRole || concept.contentRole === contentRole),
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
      concept.contentStatus === "published" &&
      isLearnerVisiblePracticalConcept(concept) &&
      conceptIds.has(concept.id),
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
    return (
      concept.contentStatus === "published" &&
      isLearnerVisiblePracticalConcept(concept) &&
      placement?.subjectId === subjectId
    );
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
