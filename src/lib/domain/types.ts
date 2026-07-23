export const CONTENT_STATUSES = ["draft", "in_review", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const COVERAGE_STATUSES = ["covered", "partial", "missing", "blocked"] as const;
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

export const SELF_RATINGS = ["unknown", "unsure", "known"] as const;
export type SelfRating = (typeof SELF_RATINGS)[number];

export const ERROR_REASONS = [
  "개념 혼동",
  "부정형 문장",
  "단위 오류",
  "공식 적용",
  "조건 누락",
  "과거 기준",
  "용어 혼동",
  "단순 실수",
] as const;
export type ErrorReason = (typeof ERROR_REASONS)[number];

export type PublicationBlocker =
  | "incomplete"
  | "answer_unverified"
  | "mapping_unverified"
  | "asset_required"
  | "answer_conflict"
  | "authoritative_source_required"
  | "high_risk_source"
  | "content_quality"
  | "lesson_source_needed";

export type PublicationAssessment = {
  readiness: "ready" | "review" | "blocked";
  blockers: PublicationBlocker[];
};

export type VerificationRiskTag =
  | "asset_required"
  | "answer_conflict"
  | "authoritative_source_required"
  | "historical_context"
  | "editorial_reconstruction";

export type QuestionVerification = {
  status: "verified" | "blocked";
  method:
    | "workbook_confirmed"
    | "source_backed_reconstruction"
    | "authoritative_source_verified"
    | "manual_source_required";
  variantCount: number;
  sourceUrls: string[];
  riskTags: VerificationRiskTag[];
  note: string;
  reviewedAt: string;
};

export const AUDIT_DISPOSITIONS = [
  "verified",
  "cbt_corrected",
  "held_answer_conflict",
  "held_asset_missing",
  "held_source_missing",
] as const;
export type AuditDisposition = (typeof AUDIT_DISPOSITIONS)[number];

export const EVIDENCE_LEVELS = ["primary", "dual_secondary"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const ASSET_STATUSES = [
  "not_required",
  "self_authored",
  "available",
  "missing",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export type QuestionAudit = {
  questionId?: string;
  scope?: "review_queue" | "high_risk_public";
  sourceContentStatus?: ContentStatus;
  auditDisposition: AuditDisposition;
  evidenceLevel: EvidenceLevel | null;
  cbtAnswer: string | null;
  verifiedAnswer: string | null;
  evidenceUrls: string[];
  reviewNote: string;
  assetStatus: AssetStatus;
  nextAction: string;
  reviewRationale?: string;
  reviewChoiceFeedback?: Array<{
    choiceId: string;
    verdict: "correct" | "incorrect";
    rationale: string;
  }>;
  reviewedAt?: string;
};

export type Subject = {
  id: string;
  code: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
};

export type ConceptGroup = {
  id: string;
  subjectId: string;
  order: number;
  title: string;
  keywords: string[];
};

export type ChoiceFeedback = {
  rationale: string;
  plausibleReason: string;
  incorrectPoint: string | null;
  keyRule: string;
  differenceFromCorrect: string | null;
};

export type ContentQuality = {
  tier: "compact" | "standard" | "core";
  substantiveCharacters: number;
  genericPhraseMatches: string[];
  languageIssueMatches: string[];
  sourceLinked: boolean;
  passed: boolean;
};

export type Choice = {
  id: string;
  order: number;
  text: string;
  feedback: ChoiceFeedback;
};

export type Question = {
  id: string;
  canonicalNumber: number;
  subjectId: string;
  conceptGroupId: string;
  conceptId: string;
  lessonId: string;
  lessonAnchor: string;
  stem: string;
  choices: Choice[];
  correctChoiceId: string;
  answerText: string;
  explanation: string;
  errorReason: ErrorReason;
  sourceLabel: string;
  reviewStatus: string;
  contentStatus: ContentStatus;
  publication?: PublicationAssessment;
  verification?: QuestionVerification;
  audit?: QuestionAudit;
  validation: {
    answer: boolean;
    explanation: boolean;
    choiceFeedback: boolean;
    theoryLink: boolean;
    contentQuality: boolean;
  };
};

export type PublicQuestion = Omit<
  Question,
  "choices" | "correctChoiceId" | "answerText" | "explanation" | "errorReason" | "validation" | "reviewStatus" | "publication" | "verification" | "audit"
> & {
  choices: Array<Pick<Choice, "id" | "order" | "text">>;
  provenance: {
    reconstructed: boolean;
    historical: boolean;
    original: boolean;
    exam?: {
      externalId: string;
      year: number;
      sessionLabel: string;
      questionNumber: number | null;
      sourceUrl: string;
    };
  };
};

export type PracticeFeedback = {
  isCorrect: boolean;
  selectedChoice: Pick<Choice, "id" | "text"> & ChoiceFeedback;
  correctChoice: Pick<Choice, "id" | "text">;
  explanation: string;
  errorReason: ErrorReason | null;
  selfRating: SelfRating;
  lesson: { id: string; anchor: string; href: string };
  conceptSupport: {
    title: string;
    summary: string[];
    blocks: Array<Pick<LessonBlock, "id" | "kind" | "title" | "body">>;
  } | null;
  otherChoices: Array<Pick<Choice, "id" | "text"> & ChoiceFeedback & { isCorrect: boolean }>;
  answerAudit?: {
    auditDisposition: "cbt_corrected";
    cbtAnswer: string;
    verifiedAnswer: string;
    evidenceUrls: string[];
    reviewNote: string;
  };
};

export type LessonBlockKind =
  | "summary"
  | "definition"
  | "purpose"
  | "structure"
  | "principle"
  | "formula"
  | "selection"
  | "pros_cons"
  | "diagnosis"
  | "safety"
  | "exam_point"
  | "trap"
  | "source";

export type LessonBlock = {
  id: string;
  kind: LessonBlockKind;
  title: string;
  body: string;
  order: number;
};

export type Lesson = {
  id: string;
  subjectId: string;
  conceptGroupId: string;
  conceptId: string;
  title: string;
  aliases: string[];
  summary: string[];
  blocks: LessonBlock[];
  relatedQuestionIds: string[];
  coverageStatus: CoverageStatus;
  contentStatus: ContentStatus;
  sourceNeeded: boolean;
  reviewedAt: string | null;
  contentRole?: "exam_linked" | "supplemental";
  visualAidId?: string;
  publication?: PublicationAssessment;
  quality: ContentQuality;
};

export type ImportReport = {
  generatedAt: string;
  sourceFile: string;
  sourceSha256: string;
  rows: {
    originals: number;
    canonicalQuestions: number;
    mappings: number;
    backlog: number;
  };
  expected: {
    originals: number;
    canonicalQuestions: number;
    mappings: number;
    backlog: number;
  };
  exactMatch: boolean;
  uniqueConcepts: number;
  canonicalConcepts: number;
  numberOnlyAnswers: number;
  reviewStatusCount: number;
  publishedQuestionCount: number;
  reviewQuestionCount: number;
  blockedQuestionCount: number;
  publication: {
    ready: number;
    review: number;
    blocked: number;
    blockerCounts: Record<PublicationBlocker, number>;
  };
  verification: {
    verified: number;
    blocked: number;
    workbookConfirmed: number;
    sourceBackedReconstruction: number;
    authoritativeSourceVerified: number;
    manualSourceRequired: number;
    riskCounts: Record<VerificationRiskTag, number>;
  };
  coverage: Record<CoverageStatus, number>;
  quality: {
    lessonPassed: number;
    lessonFailed: number;
    choiceFeedbackPassed: number;
    choiceFeedbackFailed: number;
    genericPhraseMatches: number;
    languageIssueMatches: number;
  };
  groupQuality: Array<{
    groupId: string;
    title: string;
    lessonCount: number;
    lessonPassed: number;
    publishedLessonCount: number;
    publishedLessonPassed: number;
    questionCount: number;
    publishedQuestionCount: number;
    choiceFeedbackCount: number;
    choiceFeedbackPassed: number;
  }>;
  warnings: string[];
};

export type GeneratedContent = {
  formatVersion: 2;
  subjects: Subject[];
  conceptGroups: ConceptGroup[];
  questions: Question[];
  lessons: Lesson[];
  variants: Array<{
    externalId: string;
    canonicalId: string;
    relationship: string;
    year: number | null;
    sessionLabel: string;
    questionNumber: number | null;
    conceptAlias: string;
    subjectCode: number;
    stem: string;
    choices: string[];
    answer: string;
    explanation: string;
    sourceUrl: string;
    reviewStatus: string;
    verificationNote: string;
  }>;
  backlog: Array<Record<string, string | number | null>>;
  report: ImportReport;
};
