import type { AuditDisposition, ContentStatus, SelfRating } from "./types";

export type PracticalLabel = "practical_exam" | "predicted_exam";
/**
 * `exam_linked`는 복원·예상문제와 연결된 실기 개념이고,
 * `supplemental`은 NCS 원문에 근거하지만 현재 문제 통계에는 넣지 않는 보강 이론이다.
 */
export type PracticalConceptContentRole = "exam_linked" | "supplemental";
export type PracticalQuestionKind = "past" | "predicted";
export type ExamContentTopic =
  | "welding_theory"
  | "welding_symbol"
  | "welding_defect"
  | "welding_safety"
  | "welding_calculation"
  | "nondestructive_testing"
  | "general_safety"
  | "other";
export type LearnerVisibility =
  | "learner_public"
  | "internal_reference_only";
export type LearnerContentPolicy = {
  topic: ExamContentTopic;
  visibility: LearnerVisibility;
};
export type ExamEvidenceDisplayKind =
  | "practical_past"
  | "practical_variant"
  | "practical_predicted"
  | "written_frequent"
  | "ncs_supplement";

export type PracticalExamRepresentativeQuestion = {
  id: string;
  title: string;
  stem: string;
  evidenceKinds: ExamEvidenceDisplayKind[];
  occurrence:
    | {
        year: number;
        round: number;
      }
    | null;
  visual:
    | {
        id: string;
        title: string;
        imagePaths: string[];
        altText: string;
      }
    | null;
};
export type PracticalStudyCategoryId =
  | "visual_identification"
  | "formula_calculation"
  | "theory_concept"
  | "work_procedure";
export type PracticalAssetRights =
  | "education_use_with_attribution"
  | "self_authored"
  | "third_party_permission_required"
  | "unknown";

export type PracticalSourceRef = {
  ncsCode: string;
  documentTitle: string;
  version: string;
  pdfPage: number | null;
  printedPage: number | null;
  figureNumber: string | null;
  performanceCriteria: string;
  sourceFileHash: string;
  sourceUrl: string;
};

export type PracticalWrittenExamCardFormat =
  | "image"
  | "drawing"
  | "symbol"
  | "calculation"
  | "definition"
  | "sequence"
  | "matching"
  | "diagnosis";

export type PracticalWrittenExamCardContentStatus =
  | "published"
  | "held"
  | "draft";

export type PracticalWrittenKeywordLink = {
  slug: string;
  label: string;
};

export type PracticalWrittenVisualRole =
  | "recognition"
  | "procedure"
  | "formula"
  | "comparison";

export type PracticalWrittenVisualMapping = {
  questionId: string;
  visualAidId: string;
  role: PracticalWrittenVisualRole;
};

export type PracticalVisualUsage =
  | "past_exam_prompt"
  | "variant_exam_prompt"
  | "recognition"
  | "sequence_step"
  | "normal_fault_compare"
  | "concept_explanation"
  | "summary_diagram";

export type PracticalVisualOriginType =
  | "ncs_original"
  | "ncs_crop"
  | "ncs_redraw"
  | "official_external"
  | "self_authored"
  | "ai_generated";

export type PracticalVisualTechnicalReviewStatus =
  | "draft"
  | "review_required"
  | "verified"
  | "held";

export type PracticalVisualFrame = {
  id: string;
  path: string;
  promptAltText: string;
  learningAltText: string;
  captionBeforeAnswer: string | null;
  captionAfterAnswer: string | null;
  outputAssetHash: string;
};

export type PublicPracticalSequenceFrame = {
  /** Opaque token used only for one question's public solve flow. */
  id: string;
  imageUrl: string;
  promptAltText: string;
  captionBeforeAnswer: string | null;
};

export type PublicPracticalSequenceVisualAid = {
  layout: "grid" | "horizontal-portrait-strip";
  frames: PublicPracticalSequenceFrame[];
};

export type PracticalWrittenSequenceStep = {
  id: string;
  label: string;
  safetyCritical?: boolean;
  visualFrameIds: string[];
  checkpoint?: string;
  wrongAction?: string;
  answerPhrase?: string;
};

/**
 * PracticalConcept를 그대로 노출하지 않고, 실제 필답 답안 작성에 필요한
 * 내용만 첫 화면에 재조립한 학습자용 시험카드다.
 */
export type PracticalWrittenExamCard = {
  id: string;
  slug: string;
  title: string;
  conceptIds: string[];
  evidenceIds: string[];
  primaryFormat: PracticalWrittenExamCardFormat;
  secondaryFormats: PracticalWrittenExamCardFormat[];
  /** @deprecated primaryFormat을 사용한다. */
  format: PracticalWrittenExamCardFormat;
  questionPattern: string;
  directAnswer: string;
  studyKeywords: string[];
  answerSkeleton: string[];
  recognitionPoints: string[];
  reasoningSummary: string[];
  commonWrongAnswers: string[];
  variationAxes: string[];
  pastQuestionIds: string[];
  variantQuestionIds: string[];
  predictedQuestionIds: string[];
  /** 중앙 문제은행에 아직 없는 안전한 카드 전용 예상문제 문장이다. */
  predictedExamples: string[];
  keywordLinks: PracticalWrittenKeywordLink[];
  visualAidIds: string[];
  recognitionVisualAidIds: string[];
  pastQuestionVisualMappings: PracticalWrittenVisualMapping[];
  sequenceSteps: PracticalWrittenSequenceStep[];
  contentStatus: PracticalWrittenExamCardContentStatus;
  supplementalConceptIds: string[];
  sourceRefs: PracticalSourceRef[];
};

/**
 * NCS 원문을 그대로 복제하지 않고, 어떤 학습 레슨에 반영했는지와
 * 원문 그림·수치표·표준 해석 때문에 보류한 범위를 함께 추적한다.
 */
export type PracticalNcsCoverageDisposition =
  | "held_source_or_standard"
  | "held_visual_asset"
  | "outside_practical_scope";

export type PracticalNcsCoverageHold = {
  id: string;
  ncsCode: string;
  title: string;
  pdfPages: string;
  printedPages: string;
  figureNumbers: string[];
  disposition: PracticalNcsCoverageDisposition;
  rationale: string;
  nextAction: string;
};

export type PracticalNcsCoverageDocument = {
  ncsCode: string;
  documentTitle: string;
  version: string;
  sourceUrl: string;
  sourceFileHash: string;
  conceptIds: string[];
  sourceReferenceCount: number;
  heldItems: PracticalNcsCoverageHold[];
  status: "covered" | "covered_with_holds" | "held";
};

export type PracticalNcsCoverageSummary = {
  totalDocuments: number;
  accountedDocuments: number;
  uniqueLessonCount: number;
  sourceReferenceCount: number;
  heldItems: number;
};

export type PracticalNcsCoverage = {
  summary: PracticalNcsCoverageSummary;
  documents: PracticalNcsCoverageDocument[];
};

export type PracticalVisualAid = {
  id: string;
  title: string;
  imagePaths: string[];
  frames: PracticalVisualFrame[];
  /**
   * 문제 화면에서만 사용하는 프레임 순서다.
   * 학습 화면은 `frames`의 정순서를 유지한다.
   */
  promptFrameIds?: string[];
  promptLabels?: string[];
  promptAltTexts?: string[];
  altText: string;
  caption: string;
  sourceLabel: string;
  ncsCode: string;
  pdfPage: number;
  printedPage: number;
  figureNumber: string;
  sourceFileHash: string;
  examMatchStatus: "exact_source" | "concept_source" | "self_authored";
  rightsStatus: PracticalAssetRights;
  publicUseStatus: "public" | "internal_only" | "held";
  originType: PracticalVisualOriginType;
  usageTypes: PracticalVisualUsage[];
  answerCritical: boolean;
  derivedFromVisualAidId: string | null;
  sourcePageImageHash: string | null;
  outputAssetHash: string;
  technicalReviewStatus: PracticalVisualTechnicalReviewStatus;
  technicalReviewedAt: string | null;
  technicalReviewer: string | null;
  visualReviewNote: string;
};

export type PracticalVisualCropSpec = {
  id: string;
  sourcePdfId: string;
  sourcePdfSha256: string;
  pdfPage: number;
  printedPage: number | null;
  figureNumber: string | null;
  renderDpi: 300 | 600;
  pageRotation: 0 | 90 | 180 | 270;
  crop: {
    unit: "normalized";
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputVisualAidId: string;
  outputFormat: "webp" | "png" | "svg";
};

export type PracticalVisualRequirement = "V0" | "V1" | "V2" | "V3";

export type PracticalVisualCoverageItem = {
  id: string;
  conceptIds: string[];
  examCardIds: string[];
  questionIds: string[];
  sequenceStepIds: string[];
  visualRequirement: PracticalVisualRequirement;
  visualAidIds: string[];
  status: "ready" | "held" | "not_required";
  rationale: string;
};

export type PracticalRubricItem = {
  id: string;
  label: string;
  points: number;
};

export type PracticalQuestion = {
  id: string;
  kind: PracticalQuestionKind;
  title: string;
  /** 문제를 풀기 전에 보이는 학습·출제 형태 요약이다. 정답은 포함하지 않는다. */
  formatLabel: string;
  stem: string;
  modelAnswer: string;
  requiredKeywords: string[];
  acceptedAnswers: string[];
  calculation: string[];
  unit: string | null;
  rubric: PracticalRubricItem[];
  traps: string[];
  conceptIds: string[];
  primaryStudyCategoryId: PracticalStudyCategoryId;
  studyCategoryIds: PracticalStudyCategoryId[];
  ncsSources: PracticalSourceRef[];
  visualAidId: string | null;
  label: PracticalLabel;
  auditDisposition: AuditDisposition;
  contentStatus: ContentStatus;
  occurrence:
    | {
        year: number;
        round: number;
        questionNumber: string;
        sourceType: string;
        sourceUrl: string;
        reconstructionConfidence: string;
      }
    | null;
  predictedBasis: string | null;
  reviewNote: string;
  examFormat?: PracticalWrittenExamCardFormat;
  examCardIds?: string[];
  visualAidIds?: string[];
  sequenceItemIds?: string[];
  variantOfQuestionId?: string | null;
  examEvidenceStatus?:
    | "past_reconstructed"
    | "past_variant"
    | "predicted_related"
    | "ncs_supplement";
};

export type PracticalStudyCategory = {
  id: PracticalStudyCategoryId;
  title: string;
  shortTitle: string;
  description: string;
  ncsLearningFlow: string[];
  examMethods: string[];
  questionIds: string[];
  conceptIds: string[];
};

export type PublicPracticalQuestion = Omit<
  PracticalQuestion,
  "modelAnswer" | "requiredKeywords" | "acceptedAnswers" | "calculation" | "rubric" | "traps" | "reviewNote"
>;

export type PracticalConcept = {
  id: string;
  title: string;
  contentRole: PracticalConceptContentRole;
  labels: PracticalLabel[];
  subjectLabel: string;
  groupLabel: string;
  learningGoals: string[];
  definition: string;
  principle: string;
  components: string[];
  procedure: string[];
  formula: string[];
  diagnosis: string[];
  safety: string[];
  examFormats: string[];
  requiredKeywords: string[];
  traps: string[];
  relatedPastQuestionIds: string[];
  relatedPredictedQuestionIds: string[];
  existingLessonId: string | null;
  theoryTreatment: string;
  visualAidIds: string[];
  ncsSources: PracticalSourceRef[];
  ncsLearningPoints: string[];
  sourceReviewNote: string;
  contentStatus: ContentStatus;
};

export type PracticalReveal = {
  questionId: string;
  modelAnswer: string;
  requiredKeywords: string[];
  acceptedAnswers: string[];
  calculation: string[];
  unit: string | null;
  rubric: PracticalRubricItem[];
  traps: string[];
  conceptLinks: Array<{ id: string; title: string; href: string }>;
  sourceLinks: Array<{
    label: string;
    href: string;
    page: string;
  }>;
  selfRating: SelfRating;
  sequenceResult?: {
    isCorrect: boolean;
    correctFrameIds: string[];
    frameFeedback: Array<{
      frameId: string;
      learningAltText: string;
      captionAfterAnswer: string | null;
    }>;
  };
};

export type PracticalImportReport = {
  generatedAt: string;
  sourceFile: string;
  sourceSha256: string;
  rows: {
    past: number;
    predicted: number;
    /** 원본 실기 준비 워크북에서 읽은 출제예상 행 수 */
    workbookPredicted: number;
    /** NCS 원문 근거를 붙여 별도 매니페스트로 보강한 자체 예상문항 수 */
    authoredPredicted: number;
    concepts: number;
    supplementalConcepts: number;
    ncsDocuments: number;
    visualAids: number;
  };
  publication: {
    past: number;
    predicted: number;
    concepts: number;
    supplementalConcepts: number;
    held: number;
    heldByDisposition: Record<string, number>;
  };
  ncsCoverage: PracticalNcsCoverageSummary;
  exactMatch: boolean;
  warnings: string[];
};

export type PracticalContent = {
  formatVersion: 1;
  generatedAt: string;
  questions: PracticalQuestion[];
  concepts: PracticalConcept[];
  studyCategories: PracticalStudyCategory[];
  visualAids: PracticalVisualAid[];
  ncsCoverage: PracticalNcsCoverage;
  report: PracticalImportReport;
};
