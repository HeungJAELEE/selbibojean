import type { AuditDisposition, ContentStatus, SelfRating } from "./types";

export type PracticalLabel = "practical_exam" | "predicted_exam";
/**
 * `exam_linked`는 복원·예상문제와 연결된 실기 개념이고,
 * `supplemental`은 NCS 원문에 근거하지만 현재 문제 통계에는 넣지 않는 보강 이론이다.
 */
export type PracticalConceptContentRole = "exam_linked" | "supplemental";
export type PracticalQuestionKind = "past" | "predicted";
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

/**
 * PracticalConcept를 그대로 노출하지 않고, 실제 필답 답안 작성에 필요한
 * 내용만 첫 화면에 재조립한 학습자용 시험카드다.
 */
export type PracticalWrittenExamCard = {
  id: string;
  title: string;
  conceptIds: string[];
  evidenceIds: string[];
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
  predictedQuestionIds: string[];
  /** 중앙 문제은행에 아직 없는 안전한 카드 전용 예상문제 문장이다. */
  predictedExamples: string[];
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
