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

export const PUBLICATION_BLOCKERS = [
  "incomplete",
  "answer_unverified",
  "mapping_unverified",
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
  "high_risk_source",
  "content_quality",
  "lesson_source_needed",
] as const;
export type PublicationBlocker = (typeof PUBLICATION_BLOCKERS)[number];

export type PublicationAssessment = {
  readiness: "ready" | "review" | "blocked";
  blockers: PublicationBlocker[];
};

export const VERIFICATION_RISK_TAGS = [
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
  "historical_context",
  "editorial_reconstruction",
] as const;
export type VerificationRiskTag = (typeof VERIFICATION_RISK_TAGS)[number];

export const QUESTION_VERIFICATION_METHODS = [
  "workbook_confirmed",
  "source_backed_reconstruction",
  "authoritative_source_verified",
  "manual_source_required",
] as const;
export type QuestionVerificationMethod =
  (typeof QUESTION_VERIFICATION_METHODS)[number];

export type QuestionVerification = {
  status: "verified" | "blocked";
  method: QuestionVerificationMethod;
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
  "held_runtime_validation",
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
  shufflePolicy?: "all" | "none" | "except_fixed";
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

export const REVIEWED_CBT_VARIANT_STATES = [
  "unreviewed",
  "candidate",
  "published",
  "choice_conflict",
  "hold",
] as const;
export type ReviewedCbtVariantState =
  (typeof REVIEWED_CBT_VARIANT_STATES)[number];

export type ReviewedCbtVariantRecord = {
  externalId: string;
  currentCanonicalId: string;
  canonicalId: string;
  year: number | null;
  sessionLabel: string;
  questionNumber: number | null;
  source: {
    textAuthority: string;
    captureAuthority: string;
    answerAuthority: string;
    displayLabel: string;
    registeredSourceUrl: string;
    resolvedSourceUrl: string;
    questionNumber: number;
    stemSha256: string;
    orderedChoicesSha256: string;
    registeredIdentitySha256: string;
    resolvedIdentitySha256: string;
  };
  stem: string;
  choices: string[];
  sourceAnswerIndex: number | null;
  reviewedAnswerIndex: number | null;
  sourceAnswerText: string;
  reviewedAnswerText: string;
  choiceIdMapping: string[];
  variantSpecificFeedbackRequired?: true;
  directSolution: string;
  formulaUnitSubstitution:
    | string
    | {
        formula: string;
        units: string;
        substitution: string;
        result: string;
      }
    | null;
  presentationNormalization?: {
    applied: true;
    authority: "user_approved_minimal_normalization";
    rawStem: string;
    rawChoices: string[];
    rawStemSha256: string;
    rawOrderedChoicesSha256: string;
    normalizedStem: string;
    normalizedChoices: string[];
    normalizedStemSha256: string;
    normalizedOrderedChoicesSha256: string;
    reasonCodes: string[];
    note: string;
    sourceTextPreserved: true;
  };
  choiceConflict?: {
    label: "선택지 충돌";
    conflictType: string;
    choiceIndices: number[];
    reason: string;
    scoringPolicy: "non_scoring";
    sourceAnswerTreatment: string;
  };
  choiceByChoiceReasons: Array<{
    choiceIndex: number;
    choiceText: string;
    evaluation: string;
    reason: string;
  }>;
  theoryLink: {
    canonicalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    conceptId: string;
    canonicalStem: string;
  } | null;
  conceptKeywords: string[];
  review: {
    verdict: "ACCEPT" | "REVISE" | "CHOICE_ISSUE" | "HOLD";
    issueLabel?: "선택지 충돌" | "필수 이미지 확인" | "정답키 충돌";
    scoringDisposition: string;
    sourceAnswerAgreement: string | null;
    answerEvidence: string | null;
    answerConfidence: string | null;
    theoryLinkStatus: string | null;
    holdReasons: string[];
    answerConflictOrMultipleAnswerRisk: string | null;
    runtimeStatus: Exclude<ReviewedCbtVariantState, "unreviewed">;
    publicationBlockers: string[];
    reviewedAt: string;
  };
  migration: {
    mappingClass: string;
    canonicalAction: string;
    theoryAction: string;
    runtimeDisposition: string;
    confidence: string;
    duplicateCanonicalCluster: boolean;
    preserveExternalId: boolean;
    preserveRegisteredSourceUrl: boolean;
    preserveQuestionNumber: boolean;
  };
};

export type ReviewedCbtTheoryLessonAddition = {
  lesson: Lesson;
  directExternalIds: string[];
  rationale: string;
  sourceAuthority:
    | "authoritative_source"
    | "exam_reconstruction_with_source_needed";
};

export type ReviewedCbtCanonicalQuestionChange = {
  action: "add" | "replace";
  question: Question;
  previousQuestionSha256: string | null;
  previousQuestionHashBasis?: "content_json_full_question_contract";
  affectedExternalIds: string[];
  rationale: string;
};

export type ReviewedCbtVariantManifest = {
  formatVersion: 1;
  generatedAt: string;
  mappingRunId: string;
  migrationPolicy: {
    sourceTextClassification: string;
    sourceCaptureClassification: string;
    sourceAnswerDisplayLabel: string;
    preserveExternalId: boolean;
    preserveRegisteredSourceUrl: boolean;
    preserveQuestionNumber: boolean;
    preSubmitAnswerExposureAllowed: boolean;
    runtimePublicationRequiresStatus: "published";
    normalizedPresentationPreservesRawSource: boolean;
    choiceConflictScoringAllowed: boolean;
    imageReviewQueueRequiredForImageHolds: boolean;
  };
  holdResolutionPolicy: {
    decisionAuthority: string;
    decidedAt: string;
    imageVerificationQueueCount: number;
    normalizedAndRegisteredCount: number;
    choiceConflictNonScoringCount: number;
    lowContextRegisteredCount: number;
    learnerPublicationStillRequiresStatus: "published";
  };
  publicationRelease?: {
    releaseId: string;
    decisionAuthority: "user_explicit_approval";
    approvedAt: string;
    sourceState: "candidate";
    targetState: "published";
    reviewedRecordCount: number;
    publishedCount: number;
    holdCount: number;
    choiceConflictCount: number;
    promotedExternalIdsSha256: string;
    sourceTextContractsSha256: string;
    ignoredLegacyPublicationBlockers: string[];
    preservedExcludedStates: Array<"hold" | "choice_conflict">;
  };
  batches: Array<{
    batchId: string;
    reviewSessions: string[];
    externalIdRanges: string[];
    recordCount: number;
    candidateCount: number;
    choiceConflictCount: number;
    holdCount: number;
    normalizationCount: number;
    imageReviewCount: number;
    lowContextRegistrationCount: number;
    variantSpecificFeedbackCount?: number;
    canonicalTheoryRepairs: string[];
    theoryLessonAdditionIds?: string[];
    canonicalQuestionChangeIds?: string[];
    holdResolution: {
      imageVerificationQueue: string[];
      normalizedAndRegistered: string[];
      choiceConflictNonScoring: string[];
      lowContextRegistered: string[];
      answerKeyCorrectionPending?: string[];
      theoryTaxonomyRepairPending?: string[];
    };
    sourceFiles: Array<{ path: string; sha256: string }>;
  }>;
  theoryLessonAdditionsSha256?: string;
  theoryLessonAdditions?: ReviewedCbtTheoryLessonAddition[];
  canonicalQuestionChangesSha256?: string;
  canonicalQuestionChanges?: ReviewedCbtCanonicalQuestionChange[];
  recordsSha256: string;
  records: ReviewedCbtVariantRecord[];
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
    shufflePolicy?: "all" | "none" | "except_fixed";
    reviewState?: ReviewedCbtVariantState;
    reviewed?: ReviewedCbtVariantRecord;
  }>;
  backlog: Array<Record<string, string | number | null>>;
  report: ImportReport;
};
