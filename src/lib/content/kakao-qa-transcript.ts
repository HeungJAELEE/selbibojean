import { createHash } from "node:crypto";

export const KAKAO_QA_CATEGORIES = [
  "exam_recall",
  "answer_conflict",
  "test_center_report",
  "equipment_report",
  "practical_supply",
  "official_resource",
  "training_resource",
  "study_tip",
  "visual_asset_missing",
  "commercial_link",
  "job_link",
] as const;

export type KakaoQaCategory = (typeof KAKAO_QA_CATEGORIES)[number];

export const KAKAO_QA_BLOCKERS = [
  "manual_context_review_required",
  "authoritative_source_required",
  "current_source_verification_required",
  "answer_conflict",
  "asset_required",
  "public_paraphrase_required",
  "time_sensitive_schedule",
  "external_resource_review_required",
  "commercial_link_excluded",
  "job_link_excluded",
] as const;

export type KakaoQaBlocker = (typeof KAKAO_QA_BLOCKERS)[number];

export type KakaoQaReviewPriority = "high" | "medium" | "low";

export type ParsedKakaoMessage = {
  occurredOn: string;
  timeLabel: string;
  text: string;
  sourceLineStart: number;
  sourceLineEnd: number;
};

export type ParsedKakaoTranscript = {
  sourceSavedAt: string | null;
  sourceLineCount: number;
  dateHeaderCount: number;
  startDate: string | null;
  endDate: string | null;
  systemLineCount: number;
  orphanLineCount: number;
  messages: ParsedKakaoMessage[];
};

export type KakaoQaCandidate = {
  candidateId: string;
  occurredOn: string;
  timeLabel: string;
  sourceLineStart: number;
  sourceLineEnd: number;
  textSha256: string;
  excerpt: string;
  redactions: string[];
  categories: KakaoQaCategory[];
  priority: KakaoQaReviewPriority;
  externalLinks: string[];
  publicationStatus: "held";
  evidenceClass: "unverified_user_report";
  blockers: KakaoQaBlocker[];
  targetOwners: string[];
};

export type KakaoQaExternalLink = {
  url: string;
  host: string;
  occurrenceCount: number;
  linkClass:
    | "official"
    | "training_provider"
    | "video"
    | "community"
    | "commerce"
    | "job"
    | "owned_site"
    | "other";
  reviewStatus: "held";
  blockers: KakaoQaBlocker[];
};

export type KakaoQaReviewDataset = {
  schemaVersion: 1;
  source: {
    sourceFile: string;
    sourceSha256: string;
    sourceSavedAt: string | null;
    classification: "confidential_group_chat";
    rawTranscriptCopied: false;
    speakerIdentityRetained: false;
  };
  summary: {
    sourceLineCount: number;
    dateHeaderCount: number;
    startDate: string | null;
    endDate: string | null;
    parsedMessageCount: number;
    systemLineCount: number;
    orphanLineCount: number;
    candidateCount: number;
    immediatePublicationCount: 0;
    attachmentPlaceholderCount: number;
    uniqueExternalLinkCount: number;
    externalLinkOccurrenceCount: number;
    redactedCandidateCount: number;
    categoryCounts: Record<KakaoQaCategory, number>;
    priorityCounts: Record<KakaoQaReviewPriority, number>;
    blockerCounts: Partial<Record<KakaoQaBlocker, number>>;
    linkClassCounts: Record<KakaoQaExternalLink["linkClass"], number>;
  };
  missingVisualsByDate: Array<{ occurredOn: string; count: number }>;
  externalLinks: KakaoQaExternalLink[];
  candidates: KakaoQaCandidate[];
};

const MONTHS: Record<string, string> = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

const MESSAGE_START =
  /^\[[^\]\r\n]{1,100}\]\s+\[([^\]\r\n]{1,32})\]\s?(.*)$/u;
const DATE_HEADER =
  /^-{5,}\s+[A-Za-z]+,\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})\s+-{5,}$/u;
const SAVED_AT =
  /^저장한 날짜\s*:\s*(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s*$/mu;
const SYSTEM_LINE =
  /^(?:메시지가 삭제되었습니다\.|.+님이 (?:들어왔습니다|나갔습니다)\.|.+님을 내보냈습니다\.)$/u;
const URL_PATTERN = /https?:\/\/[^\s<>\]\)]+/giu;
const EMAIL_PATTERN =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;
const PHONE_PATTERN =
  /(?<!\d)(?:(?:\+?82[-.\s]*)?0(?:1[016789]|2|[3-6][1-5])[-.\s]*\d{3,4}[-.\s]*\d{4})(?!\d)/gu;
const HANDLE_PATTERN = /(^|\s)@[^\s,;:!?]{1,40}/gu;
const ATTACHMENT_PLACEHOLDER =
  /^(?:사진|동영상|파일|음성메시지|연락처)(?:\s*\d+장)?$/u;

const OFFICIAL_HOSTS = new Set([
  "www.q-net.or.kr",
  "q-net.or.kr",
  "dream.kopo.ac.kr",
  "sanhak.kopo.ac.kr",
  "www.kopo.ac.kr",
  "opinion.lawmaking.go.kr",
]);
const TRAINING_PROVIDER_HOST_SUFFIXES = [
  ".korchamhrd.net",
  ".kopo.ac.kr",
];
const VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);
const COMMUNITY_HOSTS = new Set([
  "blog.naver.com",
  "m.blog.naver.com",
  "cafe.naver.com",
  "m.cafe.naver.com",
  "bjs2236.tistory.com",
  "naver.me",
]);
const COMMERCE_HOSTS = new Set([
  "link.coupang.com",
  "m.shoppinghow.kakao.com",
  "yes01.co.kr",
  "m.chazra09.kr",
]);
const JOB_HOST_FRAGMENTS = [
  "career.",
  "recruit.",
  "recruiter.co.kr",
  "technician-talent-",
];
const OWNED_SITE_HOSTS = new Set([
  "seolbi-learning-platform.pages.dev",
  "seolbi-learning-platform.three-net.workers.dev",
]);
const TRACKING_PARAMETER =
  /^(?:utm_.+|si|style|g_st|recommendTrackingCode|referrerAllArticles|tc|pp)$/iu;

const TARGET_OWNERS: Record<KakaoQaCategory, string[]> = {
  exam_recall: [
    "src/data/source/practical-written-exam-cards.ts",
    "src/data/source/practical-task-sequences.ts",
  ],
  answer_conflict: ["docs/audit-work/"],
  test_center_report: ["src/data/source/practical-test-centers.ts"],
  equipment_report: ["src/data/source/practical-equipment-models.ts"],
  practical_supply: ["src/data/source/practical-candidate-supplies.ts"],
  official_resource: ["src/data/source/practical-source-registry.ts"],
  training_resource: ["src/data/source/practical-source-registry.ts"],
  study_tip: ["manual_editorial_review"],
  visual_asset_missing: ["work/visual-staging/"],
  commercial_link: ["excluded_from_public_content"],
  job_link: ["excluded_from_exam_content"],
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function toIsoDate(month: string, day: string, year: string) {
  const monthNumber = MONTHS[month];
  if (!monthNumber) return null;
  return `${year}-${monthNumber}-${day.padStart(2, "0")}`;
}

function extractSavedAt(value: string) {
  const match = value.match(SAVED_AT);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
}

export function parseKakaoQaTranscript(value: string): ParsedKakaoTranscript {
  const normalized = value.replace(/^\uFEFF/u, "").replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");
  const messages: ParsedKakaoMessage[] = [];
  const dates: string[] = [];
  let currentDate: string | null = null;
  let currentMessage: ParsedKakaoMessage | null = null;
  let systemLineCount = 0;
  let orphanLineCount = 0;

  const flushMessage = () => {
    if (!currentMessage) return;
    const text = currentMessage.text.trim();
    if (text) messages.push({ ...currentMessage, text });
    currentMessage = null;
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const dateMatch = line.match(DATE_HEADER);
    if (dateMatch) {
      flushMessage();
      currentDate = toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]);
      if (currentDate) dates.push(currentDate);
      return;
    }

    const messageMatch = line.match(MESSAGE_START);
    if (messageMatch) {
      flushMessage();
      if (!currentDate) {
        orphanLineCount += 1;
        return;
      }
      currentMessage = {
        occurredOn: currentDate,
        timeLabel: messageMatch[1].trim(),
        text: messageMatch[2],
        sourceLineStart: lineNumber,
        sourceLineEnd: lineNumber,
      };
      return;
    }

    if (SYSTEM_LINE.test(line.trim())) {
      flushMessage();
      systemLineCount += 1;
      return;
    }

    if (currentMessage) {
      currentMessage.text += `\n${line}`;
      currentMessage.sourceLineEnd = lineNumber;
      return;
    }

    if (currentDate && line.trim()) orphanLineCount += 1;
  });
  flushMessage();

  return {
    sourceSavedAt: extractSavedAt(normalized),
    sourceLineCount: lines.length,
    dateHeaderCount: dates.length,
    startDate: dates.at(0) ?? null,
    endDate: dates.at(-1) ?? null,
    systemLineCount,
    orphanLineCount,
    messages,
  };
}

function trimUrlPunctuation(value: string) {
  return value.replace(/[.,!?'";:]+$/gu, "");
}

function looksLikeOpaqueToken(value: string) {
  return value.length > 240 || /^[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./u.test(value);
}

export function sanitizeKakaoQaExternalUrl(rawValue: string) {
  const candidate = trimUrlPunctuation(rawValue.trim());
  if (!candidate || candidate.length > 2_048) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.username = "";
    url.password = "";
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    for (const [name, value] of [...url.searchParams.entries()]) {
      if (TRACKING_PARAMETER.test(name) || looksLikeOpaqueToken(value)) {
        url.searchParams.delete(name);
      }
    }
    url.searchParams.sort();
    return url.toString();
  } catch {
    return null;
  }
}

function extractExternalLinks(value: string) {
  return [
    ...new Set(
      [...value.matchAll(URL_PATTERN)]
        .map((match) => sanitizeKakaoQaExternalUrl(match[0]))
        .filter((url): url is string => Boolean(url)),
    ),
  ];
}

function redactExcerpt(value: string) {
  const redactions = new Set<string>();
  let redacted = value;
  if (URL_PATTERN.test(redacted)) {
    URL_PATTERN.lastIndex = 0;
    redacted = redacted.replace(URL_PATTERN, "[외부 링크]");
    redactions.add("url");
  }
  URL_PATTERN.lastIndex = 0;
  if (EMAIL_PATTERN.test(redacted)) {
    EMAIL_PATTERN.lastIndex = 0;
    redacted = redacted.replace(EMAIL_PATTERN, "[이메일 삭제]");
    redactions.add("email");
  }
  EMAIL_PATTERN.lastIndex = 0;
  if (PHONE_PATTERN.test(redacted)) {
    PHONE_PATTERN.lastIndex = 0;
    redacted = redacted.replace(PHONE_PATTERN, "[연락처 삭제]");
    redactions.add("phone");
  }
  PHONE_PATTERN.lastIndex = 0;
  if (HANDLE_PATTERN.test(redacted)) {
    HANDLE_PATTERN.lastIndex = 0;
    redacted = redacted.replace(HANDLE_PATTERN, "$1[호칭 삭제]");
    redactions.add("handle");
  }
  HANDLE_PATTERN.lastIndex = 0;
  redacted = redacted.replace(/\s+/gu, " ").trim();
  if (redacted.length > 320) {
    redacted = `${redacted.slice(0, 317).trimEnd()}…`;
    redactions.add("length");
  }
  return {
    excerpt: redacted || "외부 링크 또는 첨부 자료 공유",
    redactions: [...redactions].sort(),
  };
}

function classifyLink(url: string): KakaoQaExternalLink["linkClass"] {
  const host = new URL(url).hostname;
  if (OWNED_SITE_HOSTS.has(host)) return "owned_site";
  if (OFFICIAL_HOSTS.has(host)) return "official";
  if (TRAINING_PROVIDER_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return "training_provider";
  }
  if (VIDEO_HOSTS.has(host)) return "video";
  if (COMMUNITY_HOSTS.has(host)) return "community";
  if (COMMERCE_HOSTS.has(host)) return "commerce";
  if (JOB_HOST_FRAGMENTS.some((fragment) => host.includes(fragment))) {
    return "job";
  }
  return "other";
}

function classifyMessage(
  message: ParsedKakaoMessage,
  externalLinks: string[],
): KakaoQaCategory[] {
  const text = message.text.replace(URL_PATTERN, " ").replace(/\s+/gu, " ").trim();
  URL_PATTERN.lastIndex = 0;
  const categories = new Set<KakaoQaCategory>();
  const linkClasses = new Set(externalLinks.map(classifyLink));

  if (
    /(?:시험|필기|실기).{0,45}(?:나왔|나온|출제|기억|복원|봤는데|보았는데)|(?:나왔|출제된).{0,24}(?:문제|그림)|(?:복원|기출).{0,24}(?:문제|문항)/u.test(
      text,
    )
  ) {
    categories.add("exam_recall");
  }
  if (
    /(?:정답|답).{0,24}(?:[1-4]번|다르|틀리|갈리|상충)|[1-4]번.{0,16}(?:맞|아닌|같|정답)|(?:지피티|챗지피티|제미나이|AI).{0,24}(?:틀리|다르|정답|답)/iu.test(
      text,
    )
  ) {
    categories.add("answer_conflict");
  }
  if (
    /(?:시험장|고사장).{0,48}(?:장비|감독|주차|건물|시설|용접|유압|공압|불량|좋|별로|어디)|(?:울산|순천|인천|남대구|포항|공주|아산|부산|성남|청주|구미|제주|익산|충주).{0,36}(?:시험|응시|시험장|고사장)/u.test(
      text,
    )
  ) {
    categories.add("test_center_report");
  }
  if (
    /(?:용접기|유압\s*설비|공압\s*설비|V-AMT|PLC|시퀀스|장비\s*모델|접촉불량|교류\s*용접|직류\s*용접).{0,52}(?:시험|장비|불량|설정|사용|작동|모델|교류|직류|고장)|(?:시험장|고사장).{0,36}(?:용접기|유압|공압|V-AMT|PLC|장비)/iu.test(
      text,
    )
  ) {
    categories.add("equipment_report");
  }
  if (
    /(?:준비물|용접봉|보안경|용접면|용접\s*해머|슬래그\s*해머|와이어\s*브러시|용접\s*브러시|플라이어|가죽\s*장갑|앞치마|각반).{0,48}(?:준비|필수|제공|구매|가져|착용|필요|시험)/u.test(
      text,
    )
  ) {
    categories.add("practical_supply");
  }
  if (
    /(?:교육|수강|학원|꿈드림|공작소|실습|연습).{0,48}(?:신청|일정|과정|교육|수강|추천|비용|국비|연습)|(?:신청|모집).{0,32}(?:교육|과정|수강)/u.test(
      text,
    ) ||
    linkClasses.has("training_provider")
  ) {
    categories.add("training_resource");
  }
  if (
    /(?:공부|회독|기출|교재|책|노하우|암기|학습).{0,52}(?:추천|해야|보세요|충분|기간|합격|외우|도움)|(?:합격|공부).{0,32}(?:노하우|방법|기간)/u.test(
      text,
    )
  ) {
    categories.add("study_tip");
  }
  if (linkClasses.has("official")) categories.add("official_resource");
  if (linkClasses.has("commerce")) categories.add("commercial_link");
  if (linkClasses.has("job")) categories.add("job_link");
  if (ATTACHMENT_PLACEHOLDER.test(text)) {
    categories.add("visual_asset_missing");
  }
  return KAKAO_QA_CATEGORIES.filter((category) => categories.has(category));
}

function priorityFor(categories: KakaoQaCategory[]): KakaoQaReviewPriority {
  if (
    categories.includes("exam_recall") ||
    categories.includes("answer_conflict") ||
    categories.includes("official_resource")
  ) {
    return "high";
  }
  if (
    categories.includes("test_center_report") ||
    categories.includes("equipment_report") ||
    categories.includes("practical_supply") ||
    categories.includes("training_resource")
  ) {
    return "medium";
  }
  return "low";
}

function blockersFor(
  categories: KakaoQaCategory[],
  externalLinks: string[],
): KakaoQaBlocker[] {
  const blockers = new Set<KakaoQaBlocker>([
    "manual_context_review_required",
    "public_paraphrase_required",
  ]);
  const linkClasses = new Set(externalLinks.map(classifyLink));
  if (
    categories.some((category) =>
      [
        "exam_recall",
        "answer_conflict",
        "test_center_report",
        "equipment_report",
        "practical_supply",
        "study_tip",
      ].includes(category),
    )
  ) {
    blockers.add("authoritative_source_required");
  }
  if (categories.includes("official_resource")) {
    blockers.add("current_source_verification_required");
  }
  if (categories.includes("answer_conflict")) blockers.add("answer_conflict");
  if (categories.includes("visual_asset_missing")) blockers.add("asset_required");
  if (categories.includes("training_resource")) {
    blockers.add("time_sensitive_schedule");
  }
  if (
    linkClasses.has("video") ||
    linkClasses.has("community") ||
    linkClasses.has("other")
  ) {
    blockers.add("external_resource_review_required");
  }
  if (categories.includes("commercial_link")) {
    blockers.add("commercial_link_excluded");
  }
  if (categories.includes("job_link")) blockers.add("job_link_excluded");
  return KAKAO_QA_BLOCKERS.filter((blocker) => blockers.has(blocker));
}

function targetOwnersFor(categories: KakaoQaCategory[]) {
  return [
    ...new Set(categories.flatMap((category) => TARGET_OWNERS[category])),
  ].sort();
}

function linkBlockers(
  linkClass: KakaoQaExternalLink["linkClass"],
): KakaoQaBlocker[] {
  if (linkClass === "official") {
    return [
      "manual_context_review_required",
      "current_source_verification_required",
    ];
  }
  if (linkClass === "training_provider") {
    return [
      "manual_context_review_required",
      "current_source_verification_required",
      "time_sensitive_schedule",
    ];
  }
  if (linkClass === "commerce") {
    return ["manual_context_review_required", "commercial_link_excluded"];
  }
  if (linkClass === "job") {
    return ["manual_context_review_required", "job_link_excluded"];
  }
  if (linkClass === "owned_site") return ["manual_context_review_required"];
  return [
    "manual_context_review_required",
    "external_resource_review_required",
  ];
}

function isStandaloneAttachment(message: ParsedKakaoMessage) {
  return ATTACHMENT_PLACEHOLDER.test(message.text.trim());
}

export function buildKakaoQaReviewDataset({
  transcript,
  sourceFile,
  sourceSha256,
}: {
  transcript: ParsedKakaoTranscript;
  sourceFile: string;
  sourceSha256: string;
}): KakaoQaReviewDataset {
  if (!/^[a-f0-9]{64}$/iu.test(sourceSha256)) {
    throw new Error("sourceSha256는 64자리 SHA-256이어야 합니다.");
  }
  if (transcript.dateHeaderCount === 0 || transcript.messages.length === 0) {
    throw new Error("카카오톡 날짜 헤더 또는 메시지를 찾지 못했습니다.");
  }

  const missingVisualsByDateMap = new Map<string, number>();
  const linkOccurrences = new Map<string, number>();
  const duplicateIds = new Map<string, number>();
  const candidates: KakaoQaCandidate[] = [];

  for (const message of transcript.messages) {
    const externalLinks = extractExternalLinks(message.text);
    for (const url of externalLinks) {
      linkOccurrences.set(url, (linkOccurrences.get(url) ?? 0) + 1);
    }

    if (isStandaloneAttachment(message)) {
      missingVisualsByDateMap.set(
        message.occurredOn,
        (missingVisualsByDateMap.get(message.occurredOn) ?? 0) + 1,
      );
      continue;
    }

    const categories = classifyMessage(message, externalLinks);
    if (categories.length === 0) continue;
    const redacted = redactExcerpt(message.text);
    const baseId = sha256(
      [
        message.occurredOn,
        message.timeLabel,
        message.text.replace(/\s+/gu, " ").trim(),
      ].join("|"),
    ).slice(0, 16);
    const duplicateOrdinal = duplicateIds.get(baseId) ?? 0;
    duplicateIds.set(baseId, duplicateOrdinal + 1);
    const candidateId =
      duplicateOrdinal === 0
        ? `KQA-${baseId.toUpperCase()}`
        : `KQA-${baseId.toUpperCase()}-${duplicateOrdinal + 1}`;

    candidates.push({
      candidateId,
      occurredOn: message.occurredOn,
      timeLabel: message.timeLabel,
      sourceLineStart: message.sourceLineStart,
      sourceLineEnd: message.sourceLineEnd,
      textSha256: sha256(message.text),
      excerpt: redacted.excerpt,
      redactions: redacted.redactions,
      categories,
      priority: priorityFor(categories),
      externalLinks,
      publicationStatus: "held",
      evidenceClass: "unverified_user_report",
      blockers: blockersFor(categories, externalLinks),
      targetOwners: targetOwnersFor(categories),
    });
  }

  const externalLinks = [...linkOccurrences.entries()]
    .map(([url, occurrenceCount]): KakaoQaExternalLink => {
      const linkClass = classifyLink(url);
      return {
        url,
        host: new URL(url).hostname,
        occurrenceCount,
        linkClass,
        reviewStatus: "held",
        blockers: linkBlockers(linkClass),
      };
    })
    .sort((left, right) =>
      left.linkClass.localeCompare(right.linkClass) ||
      left.host.localeCompare(right.host) ||
      left.url.localeCompare(right.url),
    );

  const categoryCounts = Object.fromEntries(
    KAKAO_QA_CATEGORIES.map((category) => [category, 0]),
  ) as Record<KakaoQaCategory, number>;
  const priorityCounts: Record<KakaoQaReviewPriority, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  const blockerCounts: Partial<Record<KakaoQaBlocker, number>> = {};
  for (const candidate of candidates) {
    for (const category of candidate.categories) categoryCounts[category] += 1;
    priorityCounts[candidate.priority] += 1;
    for (const blocker of candidate.blockers) {
      blockerCounts[blocker] = (blockerCounts[blocker] ?? 0) + 1;
    }
  }
  const linkClassCounts = {
    official: 0,
    training_provider: 0,
    video: 0,
    community: 0,
    commerce: 0,
    job: 0,
    owned_site: 0,
    other: 0,
  } satisfies Record<KakaoQaExternalLink["linkClass"], number>;
  for (const link of externalLinks) linkClassCounts[link.linkClass] += 1;

  const dataset: KakaoQaReviewDataset = {
    schemaVersion: 1,
    source: {
      sourceFile,
      sourceSha256: sourceSha256.toLowerCase(),
      sourceSavedAt: transcript.sourceSavedAt,
      classification: "confidential_group_chat",
      rawTranscriptCopied: false,
      speakerIdentityRetained: false,
    },
    summary: {
      sourceLineCount: transcript.sourceLineCount,
      dateHeaderCount: transcript.dateHeaderCount,
      startDate: transcript.startDate,
      endDate: transcript.endDate,
      parsedMessageCount: transcript.messages.length,
      systemLineCount: transcript.systemLineCount,
      orphanLineCount: transcript.orphanLineCount,
      candidateCount: candidates.length,
      immediatePublicationCount: 0,
      attachmentPlaceholderCount: [...missingVisualsByDateMap.values()].reduce(
        (sum, count) => sum + count,
        0,
      ),
      uniqueExternalLinkCount: externalLinks.length,
      externalLinkOccurrenceCount: externalLinks.reduce(
        (sum, link) => sum + link.occurrenceCount,
        0,
      ),
      redactedCandidateCount: candidates.filter(
        (candidate) => candidate.redactions.length > 0,
      ).length,
      categoryCounts,
      priorityCounts,
      blockerCounts,
      linkClassCounts,
    },
    missingVisualsByDate: [...missingVisualsByDateMap.entries()]
      .map(([occurredOn, count]) => ({ occurredOn, count }))
      .sort((left, right) => left.occurredOn.localeCompare(right.occurredOn)),
    externalLinks,
    candidates,
  };
  validateKakaoQaReviewDataset(dataset);
  return dataset;
}

export function validateKakaoQaReviewDataset(dataset: KakaoQaReviewDataset) {
  const ids = new Set<string>();
  for (const candidate of dataset.candidates) {
    if (ids.has(candidate.candidateId)) {
      throw new Error(`중복 후보 ID: ${candidate.candidateId}`);
    }
    ids.add(candidate.candidateId);
    if (candidate.publicationStatus !== "held") {
      throw new Error(`공개 가능한 상태로 생성된 후보: ${candidate.candidateId}`);
    }
    if (candidate.excerpt.length > 320) {
      throw new Error(`발췌 길이 제한 초과: ${candidate.candidateId}`);
    }
    if (EMAIL_PATTERN.test(candidate.excerpt) || PHONE_PATTERN.test(candidate.excerpt)) {
      EMAIL_PATTERN.lastIndex = 0;
      PHONE_PATTERN.lastIndex = 0;
      throw new Error(
        `개인정보 미삭제 후보: ${candidate.candidateId} (line ${candidate.sourceLineStart})`,
      );
    }
    EMAIL_PATTERN.lastIndex = 0;
    PHONE_PATTERN.lastIndex = 0;
  }
  if (
    dataset.summary.candidateCount !== dataset.candidates.length ||
    dataset.summary.uniqueExternalLinkCount !== dataset.externalLinks.length
  ) {
    throw new Error("검토 데이터 수량 대사가 일치하지 않습니다.");
  }
  if (
    dataset.summary.immediatePublicationCount !== 0 ||
    dataset.source.rawTranscriptCopied ||
    dataset.source.speakerIdentityRetained
  ) {
    throw new Error("비공개·비식별 기본 계약을 위반했습니다.");
  }
}

const CATEGORY_LABELS: Record<KakaoQaCategory, string> = {
  exam_recall: "시험 복원 후보",
  answer_conflict: "정답 상충",
  test_center_report: "시험장 제보",
  equipment_report: "장비 제보",
  practical_supply: "준비물",
  official_resource: "공식 링크",
  training_resource: "교육·훈련",
  study_tip: "학습 팁",
  visual_asset_missing: "누락 시각자료",
  commercial_link: "상업 링크",
  job_link: "채용 링크",
};

const LINK_CLASS_LABELS: Record<KakaoQaExternalLink["linkClass"], string> = {
  official: "공식",
  training_provider: "교육기관",
  video: "영상",
  community: "블로그·커뮤니티",
  commerce: "상업",
  job: "채용",
  owned_site: "기존 사이트",
  other: "기타",
};

export function renderKakaoQaReviewMarkdown(dataset: KakaoQaReviewDataset) {
  const categoryRows = KAKAO_QA_CATEGORIES.map(
    (category) =>
      `| ${CATEGORY_LABELS[category]} | ${dataset.summary.categoryCounts[category].toLocaleString("ko-KR")} |`,
  ).join("\n");
  const linkRows = (
    Object.keys(LINK_CLASS_LABELS) as KakaoQaExternalLink["linkClass"][]
  )
    .map(
      (linkClass) =>
        `| ${LINK_CLASS_LABELS[linkClass]} | ${dataset.summary.linkClassCounts[linkClass].toLocaleString("ko-KR")} |`,
    )
    .join("\n");

  return `# 설비보전 Q&A 비공개 검토 큐

> 상태: **HOLD** — 자동 공개 승격 0건

원본 단체대화는 복제하지 않았고, 발화자 식별자는 보존하지 않았습니다. 후보는 익명화된 짧은 발췌와 원문 체크섬·라인 포인터만 포함합니다.

## 수집 대사

| 항목 | 결과 |
| --- | ---: |
| 원본 SHA-256 | \`${dataset.source.sourceSha256}\` |
| 저장 시각 | ${dataset.source.sourceSavedAt ?? "미확인"} |
| 날짜 범위 | ${dataset.summary.startDate ?? "미확인"} ~ ${dataset.summary.endDate ?? "미확인"} |
| 원본 줄 | ${dataset.summary.sourceLineCount.toLocaleString("ko-KR")} |
| 파싱 메시지 | ${dataset.summary.parsedMessageCount.toLocaleString("ko-KR")} |
| 검토 후보 | ${dataset.summary.candidateCount.toLocaleString("ko-KR")} |
| 첨부 누락 표시 | ${dataset.summary.attachmentPlaceholderCount.toLocaleString("ko-KR")} |
| 외부 링크 | ${dataset.summary.uniqueExternalLinkCount.toLocaleString("ko-KR")}개 고유 / ${dataset.summary.externalLinkOccurrenceCount.toLocaleString("ko-KR")}회 |
| 즉시 공개 가능 | 0 |

## 후보 분류

| 분류 | 건수 |
| --- | ---: |
${categoryRows}

## 외부 링크 분류

| 분류 | 고유 링크 |
| --- | ---: |
${linkRows}

## 승격 위치

| 후보 | 검토 통과 후 소유 파일 |
| --- | --- |
| 시험장 제보 | \`src/data/source/practical-test-centers.ts\`의 과거·사용자 제보 후보 |
| 장비 제보 | \`src/data/source/practical-equipment-models.ts\` |
| 준비물 | \`src/data/source/practical-candidate-supplies.ts\` |
| 시험 복원 | \`practical-written-exam-cards.ts\`; 시각 순서형은 \`practical-task-sequences.ts\` |
| 공식·교육 링크 | \`src/data/source/practical-source-registry.ts\` |
| 정답 상충 | \`docs/audit-work/\`에서 공식 근거 확인 전 유지 |

## 공개 전 필수 Gate

1. 대화 발췌는 직접 인용하지 않고 편집자가 사실 중심으로 다시 씁니다.
2. 정답·수치·안전·장비 정보는 Q-Net/NCS/제조사 등 권위 출처와 대조합니다.
3. "사진"·"파일" 표시는 실제 첨부 원본과 이용 권한을 별도로 확보합니다.
4. 교육 일정은 현재 페이지를 재확인하고, 상업·채용 링크는 시험 학습 콘텐츠에서 제외합니다.
5. 검토 완료 항목만 기존 공개 selector 계약으로 승격합니다.
`;
}
