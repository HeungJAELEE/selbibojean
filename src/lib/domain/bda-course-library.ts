import { createHash } from "node:crypto";
import { z } from "zod";

export const bdaCourseDomains = [
  "python-foundations",
  "data-handling",
  "sql",
  "statistics",
  "machine-learning",
  "deep-learning",
  "generative-ai",
  "data-engineering",
  "project",
  "research",
  "general",
] as const;

export const bdaCourseRoles = [
  "lecture",
  "notebook",
  "code",
  "dataset",
  "database",
  "project",
  "report",
  "image",
  "archive",
  "reference",
] as const;

export const bdaPracticalTracks = [
  "prerequisite",
  "type1",
  "type2",
  "type3",
  "submission",
  "supplementary",
  "manual-review",
] as const;

export const bdaCourseDomainSchema = z.enum(bdaCourseDomains);
export const bdaCourseRoleSchema = z.enum(bdaCourseRoles);
export const bdaPracticalTrackSchema = z.enum(bdaPracticalTracks);

export const bdaCourseNotebookMetaSchema = z.object({
  totalCells: z.number().int().nonnegative(),
  codeCells: z.number().int().nonnegative(),
  markdownCells: z.number().int().nonnegative(),
  firstHeading: z.string().min(1).optional(),
});

export const bdaCourseCsvMetaSchema = z.object({
  columnCount: z.number().int().nonnegative(),
  columns: z.array(z.string()),
  approximateLineCount: z.number().int().nonnegative(),
  truncatedColumns: z.boolean(),
});

export const bdaCourseLibraryItemSchema = z.object({
  id: z.string().regex(/^course_[a-f0-9]{16}$/),
  relativePath: z.string().min(1),
  fileName: z.string().min(1),
  title: z.string().min(1),
  extension: z.string().regex(/^\.[a-z0-9_]+$/),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  sourceGroup: z.enum([
    "foundation-course",
    "ai-practice-course",
    "dataset-library",
    "research-library",
    "mini-project",
    "other",
  ]),
  week: z.number().int().min(1).max(4).nullable(),
  domain: bdaCourseDomainSchema,
  role: bdaCourseRoleSchema,
  practicalTrack: bdaPracticalTrackSchema,
  examRelevance: z.enum(["core", "supporting", "supplementary", "manual-review"]),
  handling: z.enum(["metadata-only", "review-before-use", "exclude-runtime"]),
  reviewFlags: z.array(
    z.enum([
      "copyright-review",
      "privacy-review",
      "data-leakage-review",
      "generated-binary",
      "archive-review",
      "large-file",
      "unknown-format",
    ]),
  ),
  duplicateOf: z.string().regex(/^course_[a-f0-9]{16}$/).optional(),
  firstMeaningfulLine: z.string().min(1).optional(),
  notebook: bdaCourseNotebookMetaSchema.optional(),
  csv: bdaCourseCsvMetaSchema.optional(),
});

export const bdaCourseLibrarySchema = z.object({
  formatVersion: z.literal(1),
  generatedAt: z.string().datetime(),
  sourceLabel: z.string().min(1),
  policy: z.object({
    sourceBinariesIncluded: z.literal(false),
    absolutePathsIncluded: z.literal(false),
    publicDownloadEnabled: z.literal(false),
    storageMode: z.literal("metadata-only"),
  }),
  stats: z.object({
    totalFiles: z.number().int().nonnegative(),
    totalBytes: z.number().int().nonnegative(),
    duplicateFiles: z.number().int().nonnegative(),
    reviewRequiredFiles: z.number().int().nonnegative(),
    byExtension: z.record(z.string(), z.number().int().nonnegative()),
    byDomain: z.record(bdaCourseDomainSchema, z.number().int().nonnegative()),
    byRole: z.record(bdaCourseRoleSchema, z.number().int().nonnegative()),
    byPracticalTrack: z.record(
      bdaPracticalTrackSchema,
      z.number().int().nonnegative(),
    ),
    byRelevance: z.record(
      z.enum(["core", "supporting", "supplementary", "manual-review"]),
      z.number().int().nonnegative(),
    ),
  }),
  items: z.array(bdaCourseLibraryItemSchema),
});

export type BdaCourseDomain = z.infer<typeof bdaCourseDomainSchema>;
export type BdaCourseRole = z.infer<typeof bdaCourseRoleSchema>;
export type BdaPracticalTrack = z.infer<typeof bdaPracticalTrackSchema>;
export type BdaCourseLibraryItem = z.infer<typeof bdaCourseLibraryItemSchema>;
export type BdaCourseLibrary = z.infer<typeof bdaCourseLibrarySchema>;

const domainRules: Array<[BdaCourseDomain, RegExp]> = [
  ["sql", /(?:\bsql\b|서브쿼리|집합연산|계층형질의|데이터베이스|dml|ddl|join)/i],
  ["statistics", /(?:통계|가설검정|확률|분포|추정|anova|t-?test|카이제곱|상관|회귀분석)/i],
  ["data-handling", /(?:전처리|데이터처리|데이터분석|pandas|numpy|eda|시각화|결측|이상치|시계열)/i],
  ["deep-learning", /(?:딥러닝|pytorch|tensorflow|cnn|rnn|lstm|신경망|이미지분류)/i],
  ["generative-ai", /(?:생성형|llm|langchain|rag|프롬프트|transformer|gpt)/i],
  ["machine-learning", /(?:머신러닝|machine.?learning|분류|클러스터|군집|앙상블|random.?forest|xgboost|lightgbm|모델링)/i],
  ["python-foundations", /(?:파이썬|python|라이브러리|자료형|조건문|반복문|함수|클래스)/i],
  ["data-engineering", /(?:리눅스|네트워크|운영체제|파이프라인|etl|서버|보안|api|웹.?서비스)/i],
  ["research", /(?:논문|paper|research|연구)/i],
  ["project", /(?:프로젝트|project|발표|결과보고|최종보고|팀[-_ ]?\d+)/i],
];

export function normalizeCoursePath(value: string) {
  return value.replaceAll("\\", "/").normalize("NFC");
}

export function makeCourseItemId(relativePath: string) {
  const digest = createHash("sha256")
    .update(normalizeCoursePath(relativePath).toLocaleLowerCase("ko"))
    .digest("hex")
    .slice(0, 16);
  return `course_${digest}`;
}

export function cleanCourseTitle(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension
    .normalize("NFC")
    .replace(/\[(?:강의|수업)\s*자료\]/gi, "")
    .replace(/(?:-|_)?Exported$/i, "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || withoutExtension.normalize("NFC") || fileName.normalize("NFC");
}

export function classifyCourseSourceGroup(relativePath: string) {
  const [root = ""] = normalizeCoursePath(relativePath).split("/");
  if (/^AI실무기본_[1-4]주차$/.test(root)) return "ai-practice-course" as const;
  if (/^[1-4]주차$/.test(root)) return "foundation-course" as const;
  if (root === "dataset") return "dataset-library" as const;
  if (root === "논문관련") return "research-library" as const;
  if (/^미니프로젝트/.test(root)) return "mini-project" as const;
  return "other" as const;
}

export function extractCourseWeek(relativePath: string) {
  const root = normalizeCoursePath(relativePath).split("/")[0] ?? "";
  const matched = root.match(/(?:AI실무기본_)?([1-4])주차/);
  return matched ? Number(matched[1]) : null;
}

export function classifyCourseDomain(relativePath: string): BdaCourseDomain {
  const normalized = normalizeCoursePath(relativePath);
  const sourceGroup = classifyCourseSourceGroup(normalized);

  for (const [domain, pattern] of domainRules) {
    if (pattern.test(normalized)) return domain;
  }
  if (sourceGroup === "dataset-library") return "data-handling";
  if (sourceGroup === "research-library") return "research";
  if (sourceGroup === "mini-project") return "project";
  return "general";
}

export function classifyCourseRole(
  relativePath: string,
  extension: string,
): BdaCourseRole {
  const normalized = normalizeCoursePath(relativePath);
  if (extension === ".ipynb") return "notebook";
  if ([".py", ".sql", ".html"].includes(extension)) return "code";
  if ([".csv", ".json", ".xlsx"].includes(extension)) return "dataset";
  if (extension === ".db") return "database";
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) return "image";
  if ([".zip", ".tar", ".gz"].includes(extension)) return "archive";
  if ([".pptx", ".docx"].includes(extension)) {
    return /보고|발표|프로젝트|최종/.test(normalized) ? "report" : "lecture";
  }
  if (extension === ".pdf") {
    return /보고|발표|프로젝트|최종/.test(normalized) ? "report" : "lecture";
  }
  if (/프로젝트|project/.test(normalized)) return "project";
  return "reference";
}

export function classifyExamRelevance(
  practicalTrack: BdaPracticalTrack,
  role: BdaCourseRole,
) {
  if (role === "archive") return "manual-review" as const;
  if (["type1", "type2", "type3", "submission"].includes(practicalTrack)) {
    return "core" as const;
  }
  if (practicalTrack === "prerequisite") {
    return "supporting" as const;
  }
  if (practicalTrack === "supplementary") {
    return "supplementary" as const;
  }
  return "manual-review" as const;
}

export function classifyPracticalTrack(
  relativePath: string,
  domain: BdaCourseDomain,
  role: BdaCourseRole,
): BdaPracticalTrack {
  if (role === "archive") return "manual-review";

  const normalized = normalizeCoursePath(relativePath);
  const sourceGroup = classifyCourseSourceGroup(normalized);
  const fileName = normalized.split("/").at(-1) ?? normalized;

  if (/\.ds_store$/i.test(fileName)) return "manual-review";
  if (
    sourceGroup === "mini-project" ||
    sourceGroup === "research-library" ||
    [
      "sql",
      "deep-learning",
      "generative-ai",
      "data-engineering",
      "project",
      "research",
    ].includes(domain)
  ) {
    return "supplementary";
  }
  if (
    /(?:^|[_-])(?:sample_)?submission(?:\.|[_-])|result\.csv|data.?leakage|데이터.?누수/i.test(
      fileName,
    )
  ) {
    return "submission";
  }
  if (
    /(?:가설검정|통계적추론|t-?test|anova|분산.?분석|카이제곱|chi.?square|오즈비|odds.?ratio|로지스틱.?회귀|ols|statsmodels)/i.test(
      normalized,
    )
  ) {
    return "type3";
  }
  if (
    /(?:분류예제|회귀예제|분류.?모델|회귀.?모델|평가지표|교차검증|random.?forest|decision.?tree|xgboost|lightgbm|sklearn|scikit|ml_프로젝트)/i.test(
      normalized,
    )
  ) {
    return "type2";
  }
  if (
    /(?:pandas|numpy|데이터.?처리|데이터.?탐색|전처리|결측|이상치|groupby|merge|pivot|시계열|datetime|문자열|eda|벡터화)/i.test(
      normalized,
    )
  ) {
    return "type1";
  }
  if (
    /(?:머신러닝을위한수학|선형대수|선형.?변환|행렬|벡터.?공간|고윳값|고유벡터|특이값|미분|경사하강|베이지안|확률의.?기초|linear[_ -]?algebra|matrix|vector|eigen|svd)/i.test(
      normalized,
    )
  ) {
    return "supplementary";
  }
  if (/(?:시각화|matplotlib|seaborn|viz[_-])/i.test(normalized)) {
    return "supplementary";
  }
  if (
    /(?:머신러닝|machine.?learning|분류|회귀|앙상블|모델링)/i.test(
      normalized,
    )
  ) {
    return "type2";
  }
  if (domain === "statistics") return "type3";
  if (domain === "data-handling") return "type1";
  if (domain === "python-foundations") return "prerequisite";
  return "manual-review";
}

export function classifyCourseHandling(
  role: BdaCourseRole,
  extension: string,
) {
  if ([".pyc", ".ds_store"].includes(extension)) return "exclude-runtime" as const;
  if (["dataset", "database", "archive"].includes(role)) {
    return "review-before-use" as const;
  }
  return "metadata-only" as const;
}

export function buildCourseReviewFlags(input: {
  role: BdaCourseRole;
  extension: string;
  bytes: number;
}) {
  const flags = new Set<BdaCourseLibraryItem["reviewFlags"][number]>();
  if (["lecture", "report", "image"].includes(input.role)) {
    flags.add("copyright-review");
  }
  if (["dataset", "database"].includes(input.role)) {
    flags.add("privacy-review");
    flags.add("data-leakage-review");
  }
  if (input.role === "archive") flags.add("archive-review");
  if (input.extension === ".pyc") flags.add("generated-binary");
  if (input.bytes >= 100 * 1024 * 1024) flags.add("large-file");
  if (
    ![
      ".ipynb",
      ".csv",
      ".pdf",
      ".py",
      ".sql",
      ".png",
      ".jpg",
      ".jpeg",
      ".pptx",
      ".txt",
      ".md",
      ".db",
      ".json",
      ".zip",
      ".xlsx",
      ".docx",
      ".toml",
      ".html",
      ".pyc",
      ".ds_store",
    ].includes(input.extension)
  ) {
    flags.add("unknown-format");
  }
  return [...flags].sort();
}
