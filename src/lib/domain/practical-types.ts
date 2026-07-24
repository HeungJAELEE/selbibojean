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
  report: PracticalImportReport;
};
