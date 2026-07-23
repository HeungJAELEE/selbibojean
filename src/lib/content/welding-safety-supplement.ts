import { z } from "zod";

const cellValueSchema = z.union([z.string(), z.number(), z.null()]);
export const weldingSafetyRawRowSchema = z.record(z.string(), cellValueSchema);
export type WeldingSafetyRawRow = z.infer<typeof weldingSafetyRawRowSchema>;

export const weldingSafetyBlockerSchema = z.enum([
  "answer_unverified",
  "authoritative_source_required",
  "choice_feedback_required",
  "duplicate_candidate",
  "theory_link_required",
]);
export type WeldingSafetyBlocker = z.infer<typeof weldingSafetyBlockerSchema>;

export const weldingSafetyCategoryFamilySchema = z.enum([
  "감전·전기설비",
  "보호구·광선·열·비산",
  "화기작업·화재·폭발",
  "가스용기·조정기·호스",
  "용접흄·환기·질식",
  "장비점검·작업관리",
]);
export type WeldingSafetyCategoryFamily = z.infer<typeof weldingSafetyCategoryFamilySchema>;

export const weldingSafetyReviewQuestionSchema = z.object({
  id: z.string().min(1),
  sourceQuestionId: z.string().min(1),
  sourceDataType: z.string(),
  sourceBatch: z.literal(33),
  sourceSheet: z.string().min(1),
  sourceRow: z.number().int().positive(),
  sourceRound: z.string(),
  pattern: z.string(),
  category: z.string().min(1),
  categoryFamily: weldingSafetyCategoryFamilySchema,
  safetyCode: z.string(),
  concept: z.string(),
  qualificationLevel: z.string(),
  difficulty: z.string(),
  stem: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  answer: z.string().min(1),
  correctChoiceIndex: z.number().int().min(0).max(3),
  rationale: z.string(),
  nearestExistingQuestion: z.string(),
  duplicateDecision: z.string(),
  siteDuplicateQuestionId: z.string().nullable(),
  cbtSourceUrl: z.string(),
  authoritativeSourceUrl: z.string(),
  originalVerificationStatus: z.string(),
  originalApprovalStatus: z.string(),
  reviewPriority: z.number().int().positive().nullable(),
  reviewInstructions: z.string(),
  publicationStatus: z.literal("blocked"),
  blockers: z.array(weldingSafetyBlockerSchema).min(1),
});
export type WeldingSafetyReviewQuestion = z.infer<typeof weldingSafetyReviewQuestionSchema>;

export const weldingSafetyReviewLessonSchema = z.object({
  id: z.string().min(1),
  sourceLessonId: z.string().min(1),
  sourceBatch: z.literal(33),
  sourceSheet: z.string().min(1),
  sourceRow: z.number().int().positive(),
  safetyCode: z.string(),
  category: z.string(),
  title: z.string().min(1),
  objective: z.string(),
  requiredDetails: z.string(),
  examTraps: z.string(),
  relatedQuestions: z.string(),
  originalReviewStatus: z.string(),
  publicationStatus: z.literal("blocked"),
  blockers: z.array(weldingSafetyBlockerSchema).min(1),
});
export type WeldingSafetyReviewLesson = z.infer<typeof weldingSafetyReviewLessonSchema>;

export const weldingSafetySourceRoundSchema = z.object({
  sequence: z.number().int().positive(),
  examDate: z.string().min(1),
  qualification: z.string().min(1),
  collectionStatus: z.string().min(1),
  newQuestionCount: z.number().int().nonnegative(),
  reviewedPatterns: z.string(),
  sourceUrl: z.string(),
  nextAction: z.string(),
  scopeRestriction: z.string(),
});
export type WeldingSafetySourceRound = z.infer<typeof weldingSafetySourceRoundSchema>;

export const weldingSafetyReviewDatasetSchema = z.object({
  schemaVersion: z.literal(2),
  batch: z.literal(33),
  status: z.enum(["source_missing", "imported"]),
  sourceFile: z.string().nullable(),
  sourceSha256: z.string().nullable(),
  sourceReportFile: z.string().nullable(),
  sourceReportSha256: z.string().nullable(),
  sourceQuestionSheet: z.string().nullable(),
  sourceLessonSheet: z.string().nullable(),
  sourceReviewSheet: z.string().nullable(),
  sourceRoundSheet: z.string().nullable(),
  generatedAt: z.string().nullable(),
  expected: z.object({
    questions: z.literal(283),
    lessons: z.literal(30),
    reviewQueueEntries: z.literal(150),
    rounds: z.literal(25),
    completedRounds: z.literal(25),
  }),
  counts: z.object({
    importedQuestions: z.number().int().nonnegative(),
    importedLessons: z.number().int().nonnegative(),
    importedReviewQueueEntries: z.number().int().nonnegative(),
    importedRounds: z.number().int().nonnegative(),
    completedRounds: z.number().int().nonnegative(),
    siteDuplicateCandidates: z.number().int().nonnegative(),
    missingAuthoritativeSources: z.number().int().nonnegative(),
    excludedRows: z.number().int().nonnegative(),
    duplicateRows: z.number().int().nonnegative(),
    invalidRows: z.number().int().nonnegative(),
  }),
  questions: z.array(weldingSafetyReviewQuestionSchema),
  lessons: z.array(weldingSafetyReviewLessonSchema),
  rounds: z.array(weldingSafetySourceRoundSchema),
  warnings: z.array(z.string()),
});
export type WeldingSafetyReviewDataset = z.infer<typeof weldingSafetyReviewDatasetSchema>;

const headerAliases = {
  sourceQuestionId: ["문항ID", "신규ID", "문제ID"],
  sourceDataType: ["자료구분", "자료 구분"],
  sourceRound: ["출처회차", "출처 회차", "회차", "CBT 회차"],
  pattern: ["출제패턴", "출제 패턴", "패턴"],
  category: ["안전분류", "안전 분류", "분류", "세부분류"],
  safetyCode: ["안전코드", "안전 코드"],
  concept: ["개념", "세부개념"],
  qualificationLevel: ["자격 참조수준", "자격참조수준", "참조수준", "자격"],
  difficulty: ["난이도"],
  stem: ["문제", "문항", "질문"],
  choice1: ["보기①", "보기 ①", "선택지①", "선택지 ①"],
  choice2: ["보기②", "보기 ②", "선택지②", "선택지 ②"],
  choice3: ["보기③", "보기 ③", "선택지③", "선택지 ③"],
  choice4: ["보기④", "보기 ④", "선택지④", "선택지 ④"],
  answer: ["정답", "답"],
  rationale: ["근거", "해설", "정답근거", "정답 근거"],
  nearestExistingQuestion: [
    "가장 가까운 기존문제",
    "가장 가까운 기존 문제",
    "기존관련ID",
    "기존문제",
  ],
  duplicateDecision: ["중복판정", "자동판정"],
  cbtSourceUrl: ["CBT출처URL", "CBT URL", "CBT 출처", "CBT출처", "출처", "출처URL"],
  authoritativeSourceUrl: [
    "현행검증URL",
    "현행 안전검증 출처",
    "현행안전검증출처",
    "공식검증출처",
  ],
  reviewStatus: ["검증상태", "검수상태", "검수 상태", "초안상태"],
  approvalStatus: ["승인상태", "승인 상태"],
  reviewPriority: ["우선순위"],
  reviewInstructions: ["검수지침", "검수 지침"],
  sourceLessonId: ["보강ID", "레슨ID"],
  lessonCategory: ["대분류", "안전분류"],
  lessonTitle: ["보강주제", "보강 주제", "레슨 제목", "제목"],
  lessonObjective: ["핵심정의·학습목표", "핵심 정의·학습 목표", "학습목표"],
  lessonDetails: ["필수 세부항목", "필수세부항목", "필수 항목"],
  lessonTraps: ["시험함정·주의", "시험 함정·주의", "주의사항"],
  lessonQuestions: ["연결문제", "연결 문제", "관련문제"],
  roundSequence: ["순번"],
  roundDate: ["시행일"],
  roundQualification: ["종목"],
  roundStatus: ["수집상태"],
  roundNewQuestionCount: ["최종 신규문항"],
  roundPatterns: ["확인한 안전패턴"],
  roundSourceUrl: ["CBT URL"],
  roundNextAction: ["다음작업"],
  roundScopeRestriction: ["범위제한"],
} as const;

function asText(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalizeHeader(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, "").toLocaleLowerCase("ko");
}

function readField(row: WeldingSafetyRawRow, aliases: readonly string[]) {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), asText(value)]),
  );
  for (const alias of aliases) {
    const value = normalized.get(normalizeHeader(alias));
    if (value !== undefined) return value;
  }
  return "";
}

export function normalizeWeldingSafetyStem(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[①②③④]/g, "")
    .replace(/[^가-힣a-z0-9]+/gi, "")
    .trim();
}

export function normalizeWeldingSafetyCategory(
  category: string,
): WeldingSafetyCategoryFamily {
  if (category.includes("감전") || category.includes("전기설비")) return "감전·전기설비";
  if (category.includes("보호구") || category.includes("광선")) return "보호구·광선·열·비산";
  if (category.includes("화기") || category.includes("화재")) return "화기작업·화재·폭발";
  if (category.includes("가스용기") || category.includes("조정기")) {
    return "가스용기·조정기·호스";
  }
  if (category.includes("흄") || category.includes("환기") || category.includes("질식")) {
    return "용접흄·환기·질식";
  }
  return "장비점검·작업관리";
}

const excludedTopicPatterns = [
  /절단\s*(?:속도|산소|압력|팁|토치|면|품질|조건|홈)/,
  /가스\s*절단/,
  /산소\s*절단/,
  /가우징/,
  /금속\s*상태도/,
  /상태도/,
  /합금\s*성분/,
  /금속\s*조직/,
  /용접\s*야금/,
  /소재\s*(?:시험|성질)/,
  /재료\s*시험/,
];

export function isExcludedWeldingTopic(row: WeldingSafetyRawRow) {
  const searchable = Object.values(row).map(asText).join(" ");
  return excludedTopicPatterns.some((pattern) => pattern.test(searchable));
}

export function parseWeldingSafetyAnswer(answer: string, choices: string[]) {
  const symbols = ["①", "②", "③", "④"];
  const symbolIndex = symbols.findIndex((symbol) => answer.startsWith(symbol) || answer === symbol);
  if (symbolIndex >= 0) return symbolIndex;
  const numberMatch = answer.match(/^\s*([1-4])(?:[.)\s]|$)/);
  if (numberMatch) return Number(numberMatch[1]) - 1;
  const answerText = answer.replace(/^[①②③④1-4][.)]?\s*/, "").trim();
  if (!answerText) return -1;
  return choices.findIndex(
    (choice) =>
      choice === answerText ||
      choice.includes(answerText) ||
      answerText.includes(choice),
  );
}

function questionBlockers(
  row: WeldingSafetyRawRow,
  siteDuplicateQuestionId: string | null,
) {
  const blockers: WeldingSafetyBlocker[] = [
    "answer_unverified",
    "authoritative_source_required",
    "choice_feedback_required",
    "theory_link_required",
  ];
  if (siteDuplicateQuestionId) blockers.push("duplicate_candidate");
  return blockers;
}

type BuildDatasetInput = {
  questionRows: WeldingSafetyRawRow[];
  lessonRows: WeldingSafetyRawRow[];
  reviewRows: WeldingSafetyRawRow[];
  roundRows: WeldingSafetyRawRow[];
  existingQuestions?: Array<{ id: string; stem: string }>;
  sourceFile: string;
  sourceSha256: string;
  sourceReportFile: string;
  sourceReportSha256: string;
  questionSheet: string;
  lessonSheet: string;
  reviewSheet: string;
  roundSheet: string;
  generatedAt: string;
};

export function buildWeldingSafetyReviewDataset(input: BuildDatasetInput): WeldingSafetyReviewDataset {
  const warnings: string[] = [];
  const questions: WeldingSafetyReviewQuestion[] = [];
  const lessons: WeldingSafetyReviewLesson[] = [];
  const rounds: WeldingSafetySourceRound[] = [];
  const seenStems = new Set<string>();
  const seenSourceQuestionIds = new Set<string>();
  let excludedRows = 0;
  let duplicateRows = 0;
  let invalidRows = 0;
  let siteDuplicateCandidates = 0;

  const existingQuestionByStem = new Map(
    (input.existingQuestions ?? []).map((question) => [
      normalizeWeldingSafetyStem(question.stem),
      question.id,
    ]),
  );
  const reviewByQuestionId = new Map(
    input.reviewRows.flatMap((row) => {
      const id = readField(row, headerAliases.sourceQuestionId);
      return id ? [[id, row] as const] : [];
    }),
  );

  input.questionRows.forEach((candidate, index) => {
    const parsedRow = weldingSafetyRawRowSchema.safeParse(candidate);
    if (!parsedRow.success) {
      invalidRows += 1;
      warnings.push(`${input.questionSheet} ${index + 2}행: 셀 형식을 읽지 못했습니다.`);
      return;
    }
    const row = parsedRow.data;
    if (isExcludedWeldingTopic(row)) {
      excludedRows += 1;
      return;
    }
    const stem = readField(row, headerAliases.stem);
    const choices = [
      readField(row, headerAliases.choice1),
      readField(row, headerAliases.choice2),
      readField(row, headerAliases.choice3),
      readField(row, headerAliases.choice4),
    ];
    const answer = readField(row, headerAliases.answer);
    const category = readField(row, headerAliases.category) || "용접 안전·기타";
    const sourceQuestionId =
      readField(row, headerAliases.sourceQuestionId) || `ROW-${index + 2}`;
    const reviewRow = reviewByQuestionId.get(sourceQuestionId);
    const normalizedStem = normalizeWeldingSafetyStem(stem);
    const correctChoiceIndex = parseWeldingSafetyAnswer(answer, choices);
    const siteDuplicateQuestionId = existingQuestionByStem.get(normalizedStem) ?? null;

    if (!stem || choices.some((choice) => !choice) || !answer || correctChoiceIndex < 0) {
      invalidRows += 1;
      warnings.push(`${input.questionSheet} ${index + 2}행: 문제·보기·정답 연결이 불완전합니다.`);
      return;
    }
    if (seenStems.has(normalizedStem) || seenSourceQuestionIds.has(sourceQuestionId)) {
      duplicateRows += 1;
      warnings.push(`${input.questionSheet} ${index + 2}행: 같은 문제 문장이 이미 있어 제외했습니다.`);
      return;
    }
    seenStems.add(normalizedStem);
    seenSourceQuestionIds.add(sourceQuestionId);
    if (siteDuplicateQuestionId) siteDuplicateCandidates += 1;

    questions.push(
      weldingSafetyReviewQuestionSchema.parse({
        id: `welding-safety-b33-${sourceQuestionId.toLocaleLowerCase("en")}`,
        sourceQuestionId,
        sourceDataType: readField(row, headerAliases.sourceDataType),
        sourceBatch: 33,
        sourceSheet: input.questionSheet,
        sourceRow: index + 2,
        sourceRound: readField(row, headerAliases.sourceRound),
        pattern: readField(row, headerAliases.pattern),
        category,
        categoryFamily: normalizeWeldingSafetyCategory(category),
        safetyCode: readField(row, headerAliases.safetyCode),
        concept: readField(row, headerAliases.concept),
        qualificationLevel: readField(row, headerAliases.qualificationLevel),
        difficulty: readField(row, headerAliases.difficulty),
        stem,
        choices,
        answer,
        correctChoiceIndex,
        rationale: readField(row, headerAliases.rationale),
        nearestExistingQuestion:
          readField(reviewRow ?? row, headerAliases.nearestExistingQuestion),
        duplicateDecision: readField(reviewRow ?? row, headerAliases.duplicateDecision),
        siteDuplicateQuestionId,
        cbtSourceUrl: readField(row, headerAliases.cbtSourceUrl),
        authoritativeSourceUrl: readField(row, headerAliases.authoritativeSourceUrl),
        originalVerificationStatus: readField(row, headerAliases.reviewStatus),
        originalApprovalStatus: readField(row, headerAliases.approvalStatus),
        reviewPriority: reviewRow
          ? Number(readField(reviewRow, headerAliases.reviewPriority)) || null
          : null,
        reviewInstructions: reviewRow
          ? readField(reviewRow, headerAliases.reviewInstructions)
          : "",
        publicationStatus: "blocked",
        blockers: questionBlockers(row, siteDuplicateQuestionId),
      }),
    );
  });

  input.lessonRows.forEach((candidate, index) => {
    const parsedRow = weldingSafetyRawRowSchema.safeParse(candidate);
    if (!parsedRow.success) {
      invalidRows += 1;
      warnings.push(`${input.lessonSheet} ${index + 2}행: 레슨 셀 형식을 읽지 못했습니다.`);
      return;
    }
    const row = parsedRow.data;
    const title = readField(row, headerAliases.lessonTitle);
    const sourceLessonId =
      readField(row, headerAliases.sourceLessonId) || `ROW-${index + 2}`;
    if (!title) {
      invalidRows += 1;
      warnings.push(`${input.lessonSheet} ${index + 2}행: 보강주제가 없습니다.`);
      return;
    }
    lessons.push(
      weldingSafetyReviewLessonSchema.parse({
        id: `welding-safety-b33-${sourceLessonId.toLocaleLowerCase("en")}`,
        sourceLessonId,
        sourceBatch: 33,
        sourceSheet: input.lessonSheet,
        sourceRow: index + 2,
        safetyCode: readField(row, headerAliases.safetyCode),
        category: readField(row, headerAliases.lessonCategory),
        title,
        objective: readField(row, headerAliases.lessonObjective),
        requiredDetails: readField(row, headerAliases.lessonDetails),
        examTraps: readField(row, headerAliases.lessonTraps),
        relatedQuestions: readField(row, headerAliases.lessonQuestions),
        originalReviewStatus: readField(row, headerAliases.reviewStatus),
        publicationStatus: "blocked",
        blockers: ["authoritative_source_required", "theory_link_required"],
      }),
    );
  });

  input.roundRows.forEach((candidate, index) => {
    const parsedRow = weldingSafetyRawRowSchema.safeParse(candidate);
    if (!parsedRow.success) {
      invalidRows += 1;
      warnings.push(`${input.roundSheet} ${index + 2}행: 회차 셀 형식을 읽지 못했습니다.`);
      return;
    }
    const row = parsedRow.data;
    const sequence = Number(readField(row, headerAliases.roundSequence));
    const examDate = readField(row, headerAliases.roundDate);
    if (!Number.isInteger(sequence) || sequence <= 0 || !examDate) {
      invalidRows += 1;
      warnings.push(`${input.roundSheet} ${index + 2}행: 회차 번호 또는 시행일이 없습니다.`);
      return;
    }
    rounds.push(
      weldingSafetySourceRoundSchema.parse({
        sequence,
        examDate,
        qualification: readField(row, headerAliases.roundQualification),
        collectionStatus: readField(row, headerAliases.roundStatus),
        newQuestionCount:
          Number(readField(row, headerAliases.roundNewQuestionCount)) || 0,
        reviewedPatterns: readField(row, headerAliases.roundPatterns),
        sourceUrl: readField(row, headerAliases.roundSourceUrl),
        nextAction: readField(row, headerAliases.roundNextAction),
        scopeRestriction: readField(row, headerAliases.roundScopeRestriction),
      }),
    );
  });

  const completedRounds = rounds.filter(
    (round) => round.collectionStatus === "안전패턴 검토완료",
  ).length;
  const missingAuthoritativeSources = questions.filter(
    (question) => !question.authoritativeSourceUrl,
  ).length;

  return weldingSafetyReviewDatasetSchema.parse({
    schemaVersion: 2,
    batch: 33,
    status: "imported",
    sourceFile: input.sourceFile,
    sourceSha256: input.sourceSha256,
    sourceReportFile: input.sourceReportFile,
    sourceReportSha256: input.sourceReportSha256,
    sourceQuestionSheet: input.questionSheet,
    sourceLessonSheet: input.lessonSheet,
    sourceReviewSheet: input.reviewSheet,
    sourceRoundSheet: input.roundSheet,
    generatedAt: input.generatedAt,
    expected: {
      questions: 283,
      lessons: 30,
      reviewQueueEntries: 150,
      rounds: 25,
      completedRounds: 25,
    },
    counts: {
      importedQuestions: questions.length,
      importedLessons: lessons.length,
      importedReviewQueueEntries: reviewByQuestionId.size,
      importedRounds: rounds.length,
      completedRounds,
      siteDuplicateCandidates,
      missingAuthoritativeSources,
      excludedRows,
      duplicateRows,
      invalidRows,
    },
    questions,
    lessons,
    rounds,
    warnings,
  });
}
