import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readXlsxFile from "read-excel-file/node";

type Cell = string | number | boolean | Date | null | undefined;
type SheetRow = Cell[];

const expectedHash = "5348b5a84dc2fc3d3f591705ce966e6433e90edc9abcce90475af69917c81c62";
const inputPath = process.argv[2];
const outputPath =
  process.argv[3] ?? "src/data/source/bda-qbank-v04.json";

if (!inputPath) {
  throw new Error(
    "Usage: tsx scripts/import-bda-qbank-v04.ts <BDA_QBank_Concept_v0_4.xlsx> [output.json]",
  );
}

function text(value: Cell) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function number(value: Cell) {
  const parsed = Number(text(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function list(value: Cell) {
  const raw = text(value);
  return raw
    ? raw
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function toRows(data: SheetRow[]) {
  const [headers, ...body] = data;
  if (!headers) return [];
  const keys = headers.map((value) => text(value) ?? "");
  return body
    .filter((cells) => cells.some((cell) => text(cell) !== null))
    .map((cells) =>
      Object.fromEntries(keys.map((key, index) => [key, cells[index]])),
    );
}

function requireSheet(
  sheets: Array<{ name: string; data: SheetRow[] }>,
  name: string,
) {
  const sheet = sheets.find((item) => item.name === name);
  if (!sheet) throw new Error(`Required sheet not found: ${name}`);
  return toRows(sheet.data);
}

function compact<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === null || value === undefined || value === "") return false;
      return !Array.isArray(value) || value.length > 0;
    }),
  ) as T;
}

const workbookBytes = await readFile(inputPath);
const sourceHash = createHash("sha256").update(workbookBytes).digest("hex");
if (sourceHash !== expectedHash) {
  throw new Error(
    `Workbook SHA-256 mismatch. Expected ${expectedHash}, got ${sourceHash}.`,
  );
}

// `getSheets` is implemented by read-excel-file/node, but is absent from the
// package's generic numeric-cell TypeScript overload.
// @ts-expect-error runtime option supplied by read-excel-file/node
const sheets = (await readXlsxFile(inputPath, { getSheets: true })).map(
  ({ sheet, data }) => ({ name: sheet, data: data as SheetRow[] }),
);

const sources = requireSheet(sheets, "출처관리").map((row) =>
  compact({
    id: text(row.source_id),
    sourceType: text(row.source_type),
    evidenceGradeDefault: text(row.evidence_grade_default),
    name: text(row.source_name),
    url: text(row.source_url_or_file_ref),
    collectionStatus: text(row.collection_status),
    allowedUse: text(row.allowed_use),
    reliabilityNote: text(row.reliability_note),
    officialProblemClaimAllowed: text(row.official_problem_claim_allowed),
    lastCheckedAt: text(row.last_checked_at),
    notes: text(row.notes),
  }),
);

const concepts = requireSheet(sheets, "개념서_이론").map((row) =>
  compact({
    id: text(row.concept_id),
    subjectNo: number(row.subject_no),
    subjectName: text(row.subject_name),
    majorArea: text(row.major_area),
    subArea: text(row.sub_area),
    name: text(row.concept_name),
    definition: text(row.definition),
    formulaOrRule: text(row.formula_or_rule),
    examNotes: text(row.exam_notes),
    commonTraps: text(row.common_traps),
    practicalLink: text(row.practical_link),
    sourceId: text(row.source_id),
    validationStatus: text(row.validation_status),
    validatorNote: text(row.validator_note),
  }),
);

const learningItems = requireSheet(sheets, "필기_학습재구성_통합").map((row) =>
  compact({
    id: text(row.learning_item_id),
    platform: text(row.platform),
    sourceSetType: text(row.source_set_type),
    examRound: text(row.exam_round),
    sourceItemNo: text(row.source_item_no),
    subjectNo: number(row.subject_no),
    subjectName: text(row.subject_name),
    topicSummary: text(row.topic_summary),
    paraphrasedLearningPrompt: text(row.paraphrased_learning_prompt),
    answerCore: text(row.answer_core),
    independentExplanation: text(row.independent_explanation),
    conceptIds: list(row.concept_ids),
    questionMode: text(row.question_mode),
    technicalValidationStatus: text(row.technical_validation_status),
    validationNote: text(row.validation_note),
    reviewPriority: text(row.review_priority),
    sourceId: text(row.source_id),
    sourceUrl: text(row.source_url),
    sourceType: text(row.source_type),
    evidenceGrade: text(row.evidence_grade),
    reconstructionStatus: text(row.reconstruction_status),
    reviewStatus: text(row.review_status),
    approvalStatus: text(row.approval_status),
    updatedAt: text(row.updated_at),
  }),
);

// This inventory deliberately excludes the workbook's raw-text-storage field.
// The website is an index of source locations and learning reconstructions, not
// a copy of third-party question wording or answer choices.
const inventory = requireSheet(sheets, "필기_전회차_소스인벤토리").map((row) =>
  compact({
    id: text(row.inventory_id),
    platform: text(row.platform),
    sourceId: text(row.source_id),
    examYear: number(row.exam_year),
    examRoundLabel: text(row.exam_round_label),
    examRoundNo: number(row.exam_round_no),
    examStage: text(row.exam_stage),
    sourceSetType: text(row.source_set_type),
    sourceItemNo: text(row.source_item_no),
    sourceRoundRegisteredCount: number(row.source_round_registered_count),
    officialExpectedCount: number(row.official_expected_count),
    rawCountDelta: number(row.raw_count_delta),
    countStatus: text(row.count_status),
    subjectNoInferred: number(row.subject_no_inferred),
    subjectNameInferred: text(row.subject_name_inferred),
    sourcePageUrl: text(row.source_page_url),
    sourceLocator: text(row.source_locator),
    sourceType: text(row.source_type),
    evidenceGrade: text(row.evidence_grade),
    officialProblemClaimAllowed: text(row.official_problem_claim_allowed),
    answerStatus: text(row.answer_status),
    reconstructionStatus: text(row.reconstruction_status),
    dedupStatus: text(row.dedup_status),
    copyrightUse: text(row.copyright_use),
    collectedAt: text(row.collected_at),
    notes: text(row.notes),
    topicSummary: text(row.topic_summary),
    paraphrasedLearningPrompt: text(row.paraphrased_learning_prompt),
    answerCore: text(row.answer_core),
    conceptIds: list(row.concept_ids_extracted),
    questionMode: text(row.question_mode),
    technicalValidationStatus: text(row.technical_validation_status),
    validationNote: text(row.validation_note),
    topicExtractedAt: text(row.topic_extracted_at),
    transformTargetId: text(row.transform_target_id),
  }),
);

const practicalTasks = requireSheet(sheets, "실기_과제은행").map((row) =>
  compact({
    id: text(row.task_id),
    examPart: text(row.exam_part),
    practicalType: text(row.practical_type),
    sourceType: text(row.source_type),
    evidenceGrade: text(row.evidence_grade),
    sourceId: text(row.source_id),
    title: text(row.task_title),
    datasetId: text(row.dataset_id),
    datasetFilename: text(row.dataset_filename),
    targetOrAnswer: text(row.target_or_answer),
    promptSummary: text(row.task_prompt_summary),
    expectedOutputFormat: text(row.expected_output_format),
    metricOrScoring: text(row.metric_or_scoring),
    keySolutionSteps: text(row.key_solution_steps),
    requiredCodeChecks: text(row.required_code_checks),
    dataLeakageChecks: text(row.data_leakage_checks),
    privacyChecks: text(row.privacy_checks),
    conceptIds: list(row.concept_ids),
    difficulty: text(row.difficulty),
    reviewStatus: text(row.review_status),
    approvalStatus: text(row.approval_status),
    answerStatus: text(row.answer_status),
    updatedAt: text(row.updated_at),
    licenseNote: text(row.license_note),
  }),
);

const practicalMetadata = requireSheet(sheets, "데이터셋_코드").map((row) =>
  compact({
    taskId: text(row.task_id),
    datasetId: text(row.dataset_id),
    datasetFilename: text(row.dataset_filename),
    datasetHash: text(row.dataset_hash),
    datasetSchema: text(row.dataset_schema),
    trainTestStructure: text(row.train_test_structure),
    targetColumn: text(row.target_column),
    expectedOutput: text(row.expected_output),
    verifiedCode: text(row.verified_code),
    runtimeResult: text(row.runtime_result),
    packageVersionEvidence: text(row.package_version_evidence),
    randomSeed: text(row.random_seed),
    leakageRisk: text(row.leakage_risk),
    privacyRisk: text(row.privacy_risk),
    scoringAssumption: text(row.scoring_assumption),
    sourceId: text(row.source_id),
    sourceType: text(row.source_type),
    evidenceGrade: text(row.evidence_grade),
    reviewStatus: text(row.review_status),
    notes: text(row.notes),
  }),
);

const codeSnippets = requireSheet(sheets, "코드스니펫").map((row) =>
  compact({
    id: text(row.code_id),
    language: text(row.language),
    sourceType: text(row.source_type),
    sourceId: text(row.source_id),
    purpose: text(row.purpose),
    codeText: text(row.code_text),
    validated: text(row.validated),
    linkedTaskIds: list(row.linked_task_ids),
    leakageGuard: text(row.leakage_guard),
    notes: text(row.notes),
  }),
);

const rounds = requireSheet(sheets, "회차관리").map((row) =>
  compact({
    id: text(row.round_stage_id),
    examYear: number(row.exam_year),
    examRound: text(row.exam_round),
    examStage: text(row.exam_stage),
    examDate: text(row.exam_date),
    roundStatus: text(row.round_status),
    sourceId: text(row.source_id),
    collectionStatus: text(row.collection_status),
    publicSourceCount: number(row.public_source_count),
    reconstructedItemCount: number(row.reconstructed_item_count),
    bestEvidenceGrade: text(row.best_evidence_grade),
    reconstructionConfidence: text(row.reconstruction_confidence),
    legacyFlag: text(row.legacy_flag),
    nextAction: text(row.next_action),
    notes: text(row.notes),
    writtenSourceInventoryCount: number(row.written_source_inventory_count),
    writtenInventoryStatus: text(row.written_inventory_status),
    writtenAnswerVerifiedCount: number(row.written_answer_verified_count),
    writtenDedupCompletedCount: number(row.written_dedup_completed_count),
  }),
);

const coverage = requireSheet(sheets, "필기_개념커버리지").map((row) =>
  compact({
    conceptId: text(row.concept_id),
    conceptName: text(row.concept_name),
    subjectNo: number(row.subject_no),
    youngjinCount: number(row.youngjin_count),
    newbtCount: number(row.newbt_count),
    totalLearningItemCount: number(row.total_learning_item_count),
    firstReviewPassCount: number(row.first_review_pass_count),
    reviewAttentionCount: number(row.review_attention_count),
    representativeItemId: text(row.representative_item_id),
    coverageStatus: text(row.coverage_status),
    nextAction: text(row.next_action),
  }),
);

const reviewQueue = requireSheet(sheets, "필기_검수우선순위").map((row) =>
  compact({
    id: text(row.learning_item_id),
    platform: text(row.platform),
    sourceSetType: text(row.source_set_type),
    examRound: text(row.exam_round),
    sourceItemNo: text(row.source_item_no),
    subjectName: text(row.subject_name),
    topicSummary: text(row.topic_summary),
    technicalValidationStatus: text(row.technical_validation_status),
    validationNote: text(row.validation_note),
    reviewPriority: text(row.review_priority),
    sourceUrl: text(row.source_url),
    neededReview: text(row.needed_review),
    currentAnswerStatus: text(row.current_answer_status),
    reviewStatus: text(row.review_status),
  }),
);

const conceptLinks = requireSheet(sheets, "이론_문제연결").map((row) =>
  compact({
    conceptId: text(row.concept_id),
    itemId: text(row.item_id),
    itemType: text(row.item_type),
    relationType: text(row.relation_type),
    strength: text(row.strength),
    note: text(row.note),
  }),
);

const governedInventory = inventory.map((item) => {
  const isLinked =
    Boolean(item.transformTargetId) &&
    Array.isArray(item.conceptIds) &&
    item.conceptIds.length > 0;

  return {
    ...compact({
      ...item,
      inventoryStatus: isLinked
        ? "linked_learning_item"
        : "held_topic_unavailable",
      publicationStatus: isLinked ? "metadata_only" : "held",
      holdReason: isLinked
        ? null
        : "원문·주제 미확보로 개념·정답·중복 판정 불가",
      dedupStatus: isLinked ? item.dedupStatus : "원문미확보·대조보류",
      rightsStatus: "metadata_only",
    }),
    conceptIds: item.conceptIds ?? [],
  };
});

const output = {
  formatVersion: "BDA_QBank_v0.4",
  sourceSnapshotDate: "2026-07-24",
  sourceWorkbook: {
    fileName: path.basename(inputPath),
    sha256: sourceHash,
    usage: "user_provided_workbook_import",
  },
  safetyNotice:
    "This site stores source metadata and paraphrased learning material. It does not label reconstructed material as official exam questions or official answers.",
  stats: {
    sourceInventoryCount: governedInventory.length,
    learningItemCount: learningItems.length,
    conceptCount: concepts.length,
    practicalTaskCount: practicalTasks.length,
    reviewPriorityCount: reviewQueue.length,
    sourceCount: sources.length,
    linkedInventoryCount: governedInventory.filter(
      (item) => item.inventoryStatus === "linked_learning_item",
    ).length,
    heldInventoryCount: governedInventory.filter(
      (item) => item.inventoryStatus === "held_topic_unavailable",
    ).length,
  },
  sources,
  concepts,
  learningItems,
  inventory: governedInventory,
  practicalTasks,
  practicalMetadata,
  codeSnippets,
  rounds,
  coverage,
  reviewQueue,
  conceptLinks,
};

const expectedCounts = {
  sourceInventoryCount: 587,
  learningItemCount: 183,
  conceptCount: 40,
  practicalTaskCount: 58,
  reviewPriorityCount: 68,
  linkedInventoryCount: 183,
  heldInventoryCount: 404,
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  const actual = output.stats[key as keyof typeof output.stats];
  if (actual !== expected) {
    throw new Error(`Unexpected ${key}: expected ${expected}, got ${actual}`);
  }
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  `Imported BDA QBank v0.4: ${output.stats.sourceInventoryCount} inventory, ${output.stats.learningItemCount} learning items, ${output.stats.conceptCount} concepts, ${output.stats.practicalTaskCount} practical tasks.`,
);
