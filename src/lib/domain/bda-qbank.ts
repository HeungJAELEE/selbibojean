export type BdaQbankSource = {
  id: string;
  sourceType?: string;
  evidenceGradeDefault?: string;
  name?: string;
  url?: string;
  collectionStatus?: string;
  allowedUse?: string;
  reliabilityNote?: string;
  officialProblemClaimAllowed?: string;
  lastCheckedAt?: string;
  notes?: string;
};

export type BdaQbankConcept = {
  id: string;
  subjectNo?: number;
  subjectName?: string;
  majorArea?: string;
  subArea?: string;
  name?: string;
  definition?: string;
  formulaOrRule?: string;
  examNotes?: string;
  commonTraps?: string;
  practicalLink?: string;
  sourceId?: string;
  validationStatus?: string;
  validatorNote?: string;
};

export type BdaConceptEnrichment = {
  conceptId: string;
  overview: string;
  examFocus: string[];
  decisionSteps: string[];
  comparisonRows: Array<{
    label: string;
    core: string;
    distinction: string;
  }>;
  practicalSteps: string[];
  finalChecklist: string[];
};

export type BdaQbankLearningItem = {
  id: string;
  platform?: string;
  sourceSetType?: string;
  examRound?: string;
  sourceItemNo?: string;
  subjectNo?: number;
  subjectName?: string;
  topicSummary?: string;
  paraphrasedLearningPrompt?: string;
  answerCore?: string;
  independentExplanation?: string;
  conceptIds: string[];
  questionMode?: string;
  technicalValidationStatus?: string;
  validationNote?: string;
  reviewPriority?: string;
  sourceId?: string;
  sourceUrl?: string;
  sourceType?: string;
  evidenceGrade?: string;
  reconstructionStatus?: string;
  reviewStatus?: string;
  approvalStatus?: string;
  updatedAt?: string;
};

export type BdaQbankLearningChoice = {
  id: string;
  order: number;
  text: string;
};

export type PublicBdaQbankLearningItem = Pick<
  BdaQbankLearningItem,
  | "id"
  | "platform"
  | "sourceSetType"
  | "examRound"
  | "sourceItemNo"
  | "topicSummary"
  | "paraphrasedLearningPrompt"
  | "questionMode"
  | "technicalValidationStatus"
  | "reviewStatus"
  | "evidenceGrade"
  | "conceptIds"
> & {
  questionStem: string;
  choices: BdaQbankLearningChoice[];
  practiceNotice: string;
};

export type BdaQbankLearningFeedback = {
  itemId: string;
  isCorrect: boolean;
  selectedChoice: BdaQbankLearningChoice;
  correctChoice: BdaQbankLearningChoice;
  answerCore: string;
  independentExplanation?: string;
  technicalValidationStatus?: string;
  reviewStatus?: string;
  evidenceGrade?: string;
  notice: string;
};

export type BdaQbankInventoryStatus =
  | "linked_learning_item"
  | "held_topic_unavailable";

export type BdaQbankInventoryPublicationStatus = "metadata_only" | "held";

export type BdaQbankInventoryItem = {
  id: string;
  platform?: string;
  sourceId?: string;
  examYear?: number;
  examRoundLabel?: string;
  examRoundNo?: number;
  examStage?: string;
  sourceSetType?: string;
  sourceItemNo?: string;
  sourceRoundRegisteredCount?: number;
  officialExpectedCount?: number;
  rawCountDelta?: number;
  countStatus?: string;
  subjectNoInferred?: number;
  subjectNameInferred?: string;
  sourcePageUrl?: string;
  sourceLocator?: string;
  sourceType?: string;
  evidenceGrade?: string;
  officialProblemClaimAllowed?: string;
  answerStatus?: string;
  reconstructionStatus?: string;
  dedupStatus?: string;
  copyrightUse?: string;
  collectedAt?: string;
  notes?: string;
  topicSummary?: string;
  paraphrasedLearningPrompt?: string;
  answerCore?: string;
  conceptIds: string[];
  questionMode?: string;
  technicalValidationStatus?: string;
  validationNote?: string;
  topicExtractedAt?: string;
  transformTargetId?: string;
  inventoryStatus: BdaQbankInventoryStatus;
  publicationStatus: BdaQbankInventoryPublicationStatus;
  holdReason?: string;
  rightsStatus: "metadata_only";
};

export type BdaQbankPracticalTask = {
  id: string;
  examPart?: string;
  practicalType?: string;
  sourceType?: string;
  evidenceGrade?: string;
  sourceId?: string;
  title?: string;
  datasetId?: string;
  datasetFilename?: string;
  targetOrAnswer?: string;
  promptSummary?: string;
  expectedOutputFormat?: string;
  metricOrScoring?: string;
  keySolutionSteps?: string;
  requiredCodeChecks?: string;
  dataLeakageChecks?: string;
  privacyChecks?: string;
  conceptIds: string[];
  difficulty?: string;
  reviewStatus?: string;
  approvalStatus?: string;
  answerStatus?: string;
  updatedAt?: string;
  licenseNote?: string;
};

export type BdaQbankPracticalMetadata = {
  taskId?: string;
  datasetId?: string;
  datasetFilename?: string;
  datasetHash?: string;
  datasetSchema?: string;
  trainTestStructure?: string;
  targetColumn?: string;
  expectedOutput?: string;
  verifiedCode?: string;
  runtimeResult?: string;
  packageVersionEvidence?: string;
  randomSeed?: string;
  leakageRisk?: string;
  privacyRisk?: string;
  scoringAssumption?: string;
  sourceId?: string;
  sourceType?: string;
  evidenceGrade?: string;
  reviewStatus?: string;
  notes?: string;
};

export type BdaQbankCodeSnippet = {
  id: string;
  language?: string;
  sourceType?: string;
  sourceId?: string;
  purpose?: string;
  codeText?: string;
  validated?: string;
  linkedTaskIds: string[];
  leakageGuard?: string;
  notes?: string;
};

export type BdaQbankRound = {
  id: string;
  examYear?: number;
  examRound?: string;
  examStage?: string;
  examDate?: string;
  roundStatus?: string;
  sourceId?: string;
  collectionStatus?: string;
  publicSourceCount?: number;
  reconstructedItemCount?: number;
  bestEvidenceGrade?: string;
  reconstructionConfidence?: string;
  legacyFlag?: string;
  nextAction?: string;
  notes?: string;
  writtenSourceInventoryCount?: number;
  writtenInventoryStatus?: string;
  writtenAnswerVerifiedCount?: number;
  writtenDedupCompletedCount?: number;
};

export type BdaQbankCoverage = {
  conceptId?: string;
  conceptName?: string;
  subjectNo?: number;
  youngjinCount?: number;
  newbtCount?: number;
  totalLearningItemCount?: number;
  firstReviewPassCount?: number;
  reviewAttentionCount?: number;
  representativeItemId?: string;
  coverageStatus?: string;
  nextAction?: string;
};

export type BdaQbankReviewQueueItem = {
  id?: string;
  platform?: string;
  sourceSetType?: string;
  examRound?: string;
  sourceItemNo?: string;
  subjectName?: string;
  topicSummary?: string;
  technicalValidationStatus?: string;
  validationNote?: string;
  reviewPriority?: string;
  sourceUrl?: string;
  neededReview?: string;
  currentAnswerStatus?: string;
  reviewStatus?: string;
};

export type BdaQbankConceptLink = {
  conceptId?: string;
  itemId?: string;
  itemType?: string;
  relationType?: string;
  strength?: string;
  note?: string;
};

export type BdaQbank = {
  formatVersion: string;
  sourceSnapshotDate: string;
  sourceWorkbook: { fileName: string; sha256: string; usage: string };
  safetyNotice: string;
  stats: {
    sourceInventoryCount: number;
    learningItemCount: number;
    conceptCount: number;
    practicalTaskCount: number;
    reviewPriorityCount: number;
    sourceCount: number;
    linkedInventoryCount: number;
    heldInventoryCount: number;
  };
  sources: BdaQbankSource[];
  concepts: BdaQbankConcept[];
  learningItems: BdaQbankLearningItem[];
  inventory: BdaQbankInventoryItem[];
  practicalTasks: BdaQbankPracticalTask[];
  practicalMetadata: BdaQbankPracticalMetadata[];
  codeSnippets: BdaQbankCodeSnippet[];
  rounds: BdaQbankRound[];
  coverage: BdaQbankCoverage[];
  reviewQueue: BdaQbankReviewQueueItem[];
  conceptLinks: BdaQbankConceptLink[];
};
