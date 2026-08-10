import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

import generatedContent from "../src/data/generated/content.json";
import {
  cbtExamTracksByKey,
  type CbtExamTrackKey,
} from "../src/data/source/cbt-exam-tracks";
import { normalizeCbtExactText } from "../src/lib/content/cbt-source-audit";
import type { GeneratedContent } from "../src/lib/domain/types";

type Variant = GeneratedContent["variants"][number];

export type CapturedQuestion = {
  questionNumber: number;
  stem: string;
  choices: string[];
  answerIndex: number | null;
  imageUrls: string[];
};

export type QuestionAudit = {
  externalId: string;
  canonicalId: string;
  questionNumber: number | null;
  sourceUrl: string;
  status:
    | "exact"
    | "normalized_exact"
    | "stem_mismatch"
    | "choices_mismatch"
    | "stem_and_choices_mismatch"
    | "answer_mismatch"
    | "source_question_missing"
    | "source_unreachable";
  stemFidelity: "exact" | "normalized_exact" | "mismatch" | "unreachable";
  choicesFidelity: "exact" | "normalized_exact" | "mismatch" | "unreachable";
  answerMatches: boolean | null;
  source: CapturedQuestion | null;
  current: {
    stem: string;
    choices: string[];
    answerIndex: number | null;
  };
};

export type RoundAudit = {
  sessionLabel: string;
  sourceUrl: string;
  sourceHost: string;
  expectedVariantCount: number;
  capturedQuestionCount: number | null;
  pageTitle: string | null;
  status: "audited" | "unreachable" | "unsupported";
  error: string | null;
  counts: Record<QuestionAudit["status"], number>;
  questions: QuestionAudit[];
};

export type QuestionLinkageSource = Pick<
  GeneratedContent,
  "questions" | "conceptGroups" | "lessons" | "variants"
>;

export type MismatchReviewQueueEntry = {
  reviewKeySha256: string;
  matchKey: {
    qualificationKey: CbtExamTrackKey;
    roundUrl: string;
    questionNumber: number | null;
    stemSha256: string;
    choicesSha256: string;
    hashBasis: "source_exact" | "current_fallback";
  };
  externalId: string;
  canonicalId: string;
  sessionLabel: string;
  statuses: {
    stem: QuestionAudit["stemFidelity"];
    choices: QuestionAudit["choicesFidelity"];
    answer:
      | "exact"
      | "mismatch"
      | "source_answer_missing"
      | "current_answer_missing"
      | "unreachable";
    image:
      | "not_required"
      | "source_image_present_review_pending"
      | "source_image_present_reviewed_required"
      | "source_image_missing"
      | "unreachable";
  };
  currentHashes: {
    stemSha256: string;
    choicesSha256: string;
  };
  sourceHashes: {
    stemSha256: string | null;
    choicesSha256: string | null;
  };
  conceptKeywords: string[];
  lessonLinkage: {
    subjectId: string | null;
    conceptGroupId: string | null;
    conceptId: string | null;
    lessonId: string | null;
    lessonAnchor: string | null;
    href: string | null;
  };
  source: CapturedQuestion | null;
  current: QuestionAudit["current"];
};

export type MismatchReviewQueue = {
  formatVersion: 1;
  generatedAt: string;
  qualificationKey: CbtExamTrackKey;
  identityContract: {
    fields: [
      "qualificationKey",
      "roundUrl",
      "questionNumber",
      "stemSha256",
      "choicesSha256",
    ];
    textHashPolicy: string;
    replacementPolicy: string;
  };
  entryCount: number;
  summary: {
    stemMismatch: number;
    choicesMismatch: number;
    answerMismatch: number;
    imageReviewRequired: number;
    unreachable: number;
  };
  entries: MismatchReviewQueueEntry[];
};

const content = generatedContent as GeneratedContent;
const outputRoot = path.resolve(
  process.cwd(),
  process.env.CBT_ROUND_AUDIT_OUT ??
    "outputs/source-restored-choices-20260805/cbt-round-audit",
);

if (isMainModule()) {
  await runAudit();
}

async function runAudit() {
  const qualificationKey = resolveQualificationKey();
  const grouped = groupVariants(content.variants);
  const rounds: RoundAudit[] = [];

  await mkdir(path.join(outputRoot, "rounds"), { recursive: true });

  for (const [sourceUrl, variants] of grouped) {
    const audit = await auditRound(sourceUrl, variants);
    rounds.push(audit);
    const roundName = roundFileName(
      variants[0]?.sessionLabel ?? "unknown",
      sourceUrl,
    );
    await writeFile(
      path.join(outputRoot, "rounds", `${roundName}.json`),
      `${JSON.stringify(audit, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `${audit.sessionLabel}: ${audit.status}; exact=${
        audit.counts.exact + audit.counts.normalized_exact
      }, mismatch=${
        audit.counts.stem_mismatch +
        audit.counts.choices_mismatch +
        audit.counts.stem_and_choices_mismatch +
        audit.counts.answer_mismatch
      }, missing=${audit.counts.source_question_missing}`,
    );
  }

  rounds.sort(
    (left, right) =>
      Number.parseInt(right.sessionLabel, 10) -
        Number.parseInt(left.sessionLabel, 10) ||
      left.sessionLabel.localeCompare(right.sessionLabel, "ko"),
  );

  const generatedAt = new Date().toISOString();
  const report = {
    formatVersion: 1,
    generatedAt,
    sourceContentSha256: sha256(JSON.stringify(content.variants)),
    normalizationPolicy:
      "Unicode NFC, line endings, and meaningless whitespace only",
    roundCount: rounds.length,
    variantCount: content.variants.length,
    summary: summarize(rounds),
    rounds,
  };
  const mismatchQueue = buildMismatchReviewQueue(
    rounds,
    content,
    qualificationKey,
    generatedAt,
  );

  await writeFile(
    path.join(outputRoot, "cbt-round-fidelity-audit.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputRoot, "gpt-review-manifest.json"),
    `${JSON.stringify(buildGptReviewManifest(rounds), null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputRoot, "mismatch-review-queue.json"),
    `${JSON.stringify(mismatchQueue, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputRoot, "mismatch-review-queue.jsonl"),
    mismatchQueue.entries.map((entry) => JSON.stringify(entry)).join("\n") +
      (mismatchQueue.entries.length > 0 ? "\n" : ""),
    "utf8",
  );
  await writeFile(
    path.join(outputRoot, "mismatch-review-queue.md"),
    buildMismatchQueueMarkdown(mismatchQueue),
    "utf8",
  );

  console.log(
    `CBT round audit -> ${path.join(outputRoot, "cbt-round-fidelity-audit.json")}`,
  );
  console.log(
    `Mismatch review queue -> ${path.join(outputRoot, "mismatch-review-queue.json")}`,
  );
}

async function auditRound(
  sourceUrl: string,
  variants: Variant[],
): Promise<RoundAudit> {
  const url = new URL(sourceUrl);
  const base: Omit<
    RoundAudit,
    "status" | "error" | "capturedQuestionCount" | "pageTitle" | "questions"
  > = {
    sessionLabel: variants[0]?.sessionLabel ?? "unknown",
    sourceUrl,
    sourceHost: url.hostname,
    expectedVariantCount: variants.length,
    counts: emptyCounts(),
  };

  if (!isCbtBankHost(url.hostname)) {
    const questions = variants.map((variant) =>
      unreachableAudit(variant, "source_unreachable"),
    );
    return {
      ...base,
      status: "unsupported",
      error: "This source host does not expose a server-rendered exam-box document.",
      capturedQuestionCount: null,
      pageTitle: null,
      counts: countStatuses(questions),
      questions,
    };
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; SeolbiSourceAudit/1.0; source fidelity review)",
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html, { url: sourceUrl });
    const document = dom.window.document;
    const captured = parseCbtBankQuestions(document, sourceUrl);
    if (!captured.size) {
      throw new Error("No .exam-box questions found");
    }

    const questions = variants.map((variant) =>
      compareVariant(variant, captured.get(variant.questionNumber ?? -1) ?? null),
    );
    return {
      ...base,
      status: "audited",
      error: null,
      capturedQuestionCount: captured.size,
      pageTitle: normalizeCbtExactText(document.title) || null,
      counts: countStatuses(questions),
      questions,
    };
  } catch (error) {
    const questions = variants.map((variant) =>
      unreachableAudit(variant, "source_unreachable"),
    );
    return {
      ...base,
      status: "unreachable",
      error: error instanceof Error ? error.message : String(error),
      capturedQuestionCount: null,
      pageTitle: null,
      counts: countStatuses(questions),
      questions,
    };
  }
}

function parseCbtBankQuestions(
  document: Document,
  sourceUrl: string,
): Map<number, CapturedQuestion> {
  const questions = new Map<number, CapturedQuestion>();
  for (const box of document.querySelectorAll<HTMLElement>(".exam-box")) {
    const rawNumber =
      box.getAttribute("question-num") ??
      box.id.match(/-(\d+)$/)?.[1] ??
      "";
    const questionNumber = Number.parseInt(rawNumber, 10);
    if (!Number.isFinite(questionNumber)) continue;

    const title = box.querySelector<HTMLElement>(".exam-title");
    const choiceList = box.querySelector<HTMLOListElement>(
      ".question-choice ol",
    );
    const choices = [
      ...box.querySelectorAll<HTMLElement>(".question-choice li"),
    ].map((choice) => normalizeCbtExactText(choice.textContent ?? ""));
    const answerNumber = Number.parseInt(
      choiceList?.getAttribute("correct") ?? "",
      10,
    );
    const imageUrls = [
      ...(title?.querySelectorAll<HTMLImageElement>("img") ?? []),
      ...box.querySelectorAll<HTMLImageElement>(".question-choice img"),
    ]
      .map((image) => image.getAttribute("src"))
      .filter((value): value is string => Boolean(value))
      .map((value) => new URL(value, sourceUrl).toString());

    questions.set(questionNumber, {
      questionNumber,
      stem: stripQuestionNumber(
        normalizeCbtExactText(title?.textContent ?? ""),
        questionNumber,
      ),
      choices,
      answerIndex:
        Number.isFinite(answerNumber) && answerNumber > 0
          ? answerNumber - 1
          : null,
      imageUrls: [...new Set(imageUrls)],
    });
  }
  return questions;
}

function compareVariant(
  variant: Variant,
  source: CapturedQuestion | null,
): QuestionAudit {
  const currentAnswerIndex = parseVariantAnswerIndex(variant);
  if (!source) {
    return {
      ...auditIdentity(variant),
      status: "source_question_missing",
      stemFidelity: "unreachable",
      choicesFidelity: "unreachable",
      answerMatches: null,
      source: null,
      current: currentPayload(variant, currentAnswerIndex),
    };
  }

  const stemFidelity = fidelity(source.stem, variant.stem);
  const choicesFidelity = fidelityList(source.choices, variant.choices);
  const answerMatches =
    source.answerIndex !== null &&
    currentAnswerIndex !== null &&
    source.answerIndex === currentAnswerIndex;

  let status: QuestionAudit["status"];
  if (!answerMatches) status = "answer_mismatch";
  else if (stemFidelity === "mismatch" && choicesFidelity === "mismatch") {
    status = "stem_and_choices_mismatch";
  } else if (stemFidelity === "mismatch") status = "stem_mismatch";
  else if (choicesFidelity === "mismatch") status = "choices_mismatch";
  else if (
    stemFidelity === "normalized_exact" ||
    choicesFidelity === "normalized_exact"
  ) {
    status = "normalized_exact";
  } else {
    status = "exact";
  }

  return {
    ...auditIdentity(variant),
    status,
    stemFidelity,
    choicesFidelity,
    answerMatches,
    source,
    current: currentPayload(variant, currentAnswerIndex),
  };
}

function unreachableAudit(
  variant: Variant,
  status: "source_unreachable",
): QuestionAudit {
  const answerIndex = parseVariantAnswerIndex(variant);
  return {
    ...auditIdentity(variant),
    status,
    stemFidelity: "unreachable",
    choicesFidelity: "unreachable",
    answerMatches: null,
    source: null,
    current: currentPayload(variant, answerIndex),
  };
}

function auditIdentity(variant: Variant) {
  return {
    externalId: variant.externalId,
    canonicalId: variant.canonicalId,
    questionNumber: variant.questionNumber,
    sourceUrl: variant.sourceUrl,
  };
}

function currentPayload(variant: Variant, answerIndex: number | null) {
  return {
    stem: variant.stem,
    choices: variant.choices,
    answerIndex,
  };
}

function groupVariants(variants: Variant[]) {
  const result = new Map<string, Variant[]>();
  for (const variant of variants) {
    const sourceUrl = normalizeSourceUrl(variant.sourceUrl);
    const current = result.get(sourceUrl) ?? [];
    current.push(variant);
    current.sort(
      (left, right) =>
        (left.questionNumber ?? Number.MAX_SAFE_INTEGER) -
        (right.questionNumber ?? Number.MAX_SAFE_INTEGER),
    );
    result.set(sourceUrl, current);
  }
  return [...result.entries()].sort((left, right) =>
    left[0].localeCompare(right[0]),
  );
}

function normalizeSourceUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

function parseVariantAnswerIndex(variant: Variant) {
  const circled = ["①", "②", "③", "④", "⑤"];
  const bySymbol = circled.findIndex((symbol) =>
    variant.answer.trim().startsWith(symbol),
  );
  if (bySymbol >= 0) return bySymbol;
  const byNumber = variant.answer.trim().match(/^([1-5])/);
  if (byNumber) return Number.parseInt(byNumber[1], 10) - 1;

  const normalizedAnswer = normalizeForAnswer(
    variant.answer.replace(/^[①②③④⑤1-5][.)]?\s*/, ""),
  );
  const matches = variant.choices
    .map((choice, index) => ({ index, text: normalizeForAnswer(choice) }))
    .filter(
      (choice) =>
        choice.text === normalizedAnswer ||
        choice.text.includes(normalizedAnswer) ||
        normalizedAnswer.includes(choice.text),
    );
  return matches.length === 1 ? matches[0].index : null;
}

function fidelity(
  captured: string,
  candidate: string,
): "exact" | "normalized_exact" | "mismatch" {
  if (captured === candidate) return "exact";
  return normalizeCbtExactText(captured) === normalizeCbtExactText(candidate)
    ? "normalized_exact"
    : "mismatch";
}

function fidelityList(
  captured: string[],
  candidate: string[],
): "exact" | "normalized_exact" | "mismatch" {
  if (
    captured.length === candidate.length &&
    captured.every((choice, index) => choice === candidate[index])
  ) {
    return "exact";
  }
  if (
    captured.length === candidate.length &&
    captured.every(
      (choice, index) =>
        normalizeCbtExactText(choice) ===
        normalizeCbtExactText(candidate[index]),
    )
  ) {
    return "normalized_exact";
  }
  return "mismatch";
}

function stripQuestionNumber(value: string, questionNumber: number) {
  return value.replace(
    new RegExp(`^${questionNumber}\\s*[.)번]?\\s*`),
    "",
  );
}

function normalizeForAnswer(value: string) {
  return normalizeCbtExactText(value)
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[\s·ㆍ,.?()[\]{}'"/\\_-]+/g, "");
}

function isCbtBankHost(hostname: string) {
  return (
    hostname === "cbtbank.kr" ||
    hostname === "www.cbtbank.kr" ||
    hostname === "cbtbank.co.kr" ||
    hostname === "www.cbtbank.co.kr"
  );
}

function emptyCounts(): Record<QuestionAudit["status"], number> {
  return {
    exact: 0,
    normalized_exact: 0,
    stem_mismatch: 0,
    choices_mismatch: 0,
    stem_and_choices_mismatch: 0,
    answer_mismatch: 0,
    source_question_missing: 0,
    source_unreachable: 0,
  };
}

function countStatuses(questions: QuestionAudit[]) {
  const counts = emptyCounts();
  for (const question of questions) counts[question.status] += 1;
  return counts;
}

function summarize(rounds: RoundAudit[]) {
  const counts = emptyCounts();
  for (const round of rounds) {
    for (const [status, count] of Object.entries(round.counts)) {
      counts[status as QuestionAudit["status"]] += count;
    }
  }
  return {
    ...counts,
    auditedRounds: rounds.filter((round) => round.status === "audited").length,
    unsupportedRounds: rounds.filter((round) => round.status === "unsupported")
      .length,
    unreachableRounds: rounds.filter((round) => round.status === "unreachable")
      .length,
    mismatchQuestions:
      counts.stem_mismatch +
      counts.choices_mismatch +
      counts.stem_and_choices_mismatch +
      counts.answer_mismatch,
  };
}

export function buildMismatchReviewQueue(
  rounds: RoundAudit[],
  sourceContent: QuestionLinkageSource,
  qualificationKey: CbtExamTrackKey,
  generatedAt: string,
): MismatchReviewQueue {
  const variantByExternalId = new Map(
    sourceContent.variants.map((variant) => [variant.externalId, variant]),
  );
  const questionById = new Map(
    sourceContent.questions.map((question) => [question.id, question]),
  );
  const conceptGroupById = new Map(
    sourceContent.conceptGroups.map((group) => [group.id, group]),
  );
  const lessonById = new Map(
    sourceContent.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const entries: MismatchReviewQueueEntry[] = [];

  for (const round of rounds) {
    const roundUrl = normalizeSourceUrl(round.sourceUrl);
    for (const questionAudit of round.questions) {
      const variant = variantByExternalId.get(questionAudit.externalId);
      const imageStatus = classifyImageStatus(questionAudit, variant);
      const needsReview =
        (questionAudit.status !== "exact" &&
          questionAudit.status !== "normalized_exact") ||
        imageStatus !== "not_required";
      if (!needsReview) continue;

      const sourceStemSha256 = questionAudit.source
        ? hashNormalizedText(questionAudit.source.stem)
        : null;
      const sourceChoicesSha256 = questionAudit.source
        ? hashNormalizedChoices(questionAudit.source.choices)
        : null;
      const currentStemSha256 = hashNormalizedText(questionAudit.current.stem);
      const currentChoicesSha256 = hashNormalizedChoices(
        questionAudit.current.choices,
      );
      const hashBasis = questionAudit.source
        ? "source_exact"
        : "current_fallback";
      const matchKey = {
        qualificationKey,
        roundUrl,
        questionNumber: questionAudit.questionNumber,
        stemSha256: sourceStemSha256 ?? currentStemSha256,
        choicesSha256: sourceChoicesSha256 ?? currentChoicesSha256,
        hashBasis,
      } satisfies MismatchReviewQueueEntry["matchKey"];
      const canonicalQuestion = questionById.get(questionAudit.canonicalId);
      const conceptGroup = canonicalQuestion
        ? conceptGroupById.get(canonicalQuestion.conceptGroupId)
        : null;
      const lesson = canonicalQuestion
        ? lessonById.get(canonicalQuestion.lessonId)
        : null;

      entries.push({
        reviewKeySha256: sha256(JSON.stringify(matchKey)),
        matchKey,
        externalId: questionAudit.externalId,
        canonicalId: questionAudit.canonicalId,
        sessionLabel: round.sessionLabel,
        statuses: {
          stem: questionAudit.stemFidelity,
          choices: questionAudit.choicesFidelity,
          answer: classifyAnswerStatus(questionAudit),
          image: imageStatus,
        },
        currentHashes: {
          stemSha256: currentStemSha256,
          choicesSha256: currentChoicesSha256,
        },
        sourceHashes: {
          stemSha256: sourceStemSha256,
          choicesSha256: sourceChoicesSha256,
        },
        conceptKeywords: uniqueNonEmpty([
          variant?.conceptAlias,
          conceptGroup?.title,
          ...(conceptGroup?.keywords ?? []),
          lesson?.title,
          ...(lesson?.aliases ?? []),
        ]),
        lessonLinkage: canonicalQuestion
          ? {
              subjectId: canonicalQuestion.subjectId,
              conceptGroupId: canonicalQuestion.conceptGroupId,
              conceptId: canonicalQuestion.conceptId,
              lessonId: canonicalQuestion.lessonId,
              lessonAnchor: canonicalQuestion.lessonAnchor,
              href: `/written/theory/${canonicalQuestion.lessonId}#${canonicalQuestion.lessonAnchor}`,
            }
          : {
              subjectId: null,
              conceptGroupId: null,
              conceptId: null,
              lessonId: null,
              lessonAnchor: null,
              href: null,
            },
        source: questionAudit.source,
        current: questionAudit.current,
      });
    }
  }

  entries.sort(
    (left, right) =>
      left.matchKey.roundUrl.localeCompare(right.matchKey.roundUrl) ||
      (left.matchKey.questionNumber ?? Number.MAX_SAFE_INTEGER) -
        (right.matchKey.questionNumber ?? Number.MAX_SAFE_INTEGER) ||
      left.externalId.localeCompare(right.externalId),
  );

  return {
    formatVersion: 1,
    generatedAt,
    qualificationKey,
    identityContract: {
      fields: [
        "qualificationKey",
        "roundUrl",
        "questionNumber",
        "stemSha256",
        "choicesSha256",
      ],
      textHashPolicy:
        "SHA-256 over Unicode NFC text with normalized line endings and meaningless whitespace only; choices preserve original order.",
      replacementPolicy:
        "Never replace by year alone. Match the full identity contract; preserve exact and normalized-exact source content.",
    },
    entryCount: entries.length,
    summary: {
      stemMismatch: entries.filter(
        (entry) => entry.statuses.stem === "mismatch",
      ).length,
      choicesMismatch: entries.filter(
        (entry) => entry.statuses.choices === "mismatch",
      ).length,
      answerMismatch: entries.filter(
        (entry) => entry.statuses.answer === "mismatch",
      ).length,
      imageReviewRequired: entries.filter(
        (entry) =>
          entry.statuses.image !== "not_required" &&
          entry.statuses.image !== "unreachable",
      ).length,
      unreachable: entries.filter(
        (entry) =>
          entry.statuses.stem === "unreachable" ||
          entry.statuses.choices === "unreachable",
      ).length,
    },
    entries,
  };
}

export function buildMismatchQueueMarkdown(queue: MismatchReviewQueue) {
  const roundCounts = new Map<
    string,
    {
      sessionLabel: string;
      count: number;
      stem: number;
      choices: number;
      answer: number;
      image: number;
    }
  >();
  for (const entry of queue.entries) {
    const current = roundCounts.get(entry.matchKey.roundUrl) ?? {
      sessionLabel: entry.sessionLabel,
      count: 0,
      stem: 0,
      choices: 0,
      answer: 0,
      image: 0,
    };
    current.count += 1;
    if (entry.statuses.stem === "mismatch") current.stem += 1;
    if (entry.statuses.choices === "mismatch") current.choices += 1;
    if (entry.statuses.answer === "mismatch") current.answer += 1;
    if (entry.statuses.image !== "not_required") current.image += 1;
    roundCounts.set(entry.matchKey.roundUrl, current);
  }

  const rows = [...roundCounts.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(
      ([roundUrl, counts]) =>
        `| ${counts.sessionLabel} | ${roundUrl} | ${counts.count} | ${counts.stem} | ${counts.choices} | ${counts.answer} | ${counts.image} |`,
    );

  return `# CBT 회차 원문 불일치 재검토 큐

- 자격 키: \`${queue.qualificationKey}\`
- 생성 시각: ${queue.generatedAt}
- 재검토 문항: ${queue.entryCount}
- 식별 계약: 자격 키 + 회차 URL + 문항번호 + 원문 지문 SHA-256 + 원문 보기 SHA-256
- 치환 규칙: 연도만으로 치환하지 않으며, 원문 일치 문항은 보존한다.

## 상태 요약

| 지문 불일치 | 보기 불일치 | 정답 불일치 | 이미지 검토 필요 | 접근 불가 |
|---:|---:|---:|---:|---:|
| ${queue.summary.stemMismatch} | ${queue.summary.choicesMismatch} | ${queue.summary.answerMismatch} | ${queue.summary.imageReviewRequired} | ${queue.summary.unreachable} |

## 회차별 큐

| 회차 | 원문 URL | 큐 | 지문 | 보기 | 정답 | 이미지 |
|---|---|---:|---:|---:|---:|---:|
${rows.join("\n")}

상세 레코드는 \`mismatch-review-queue.json\`과 \`mismatch-review-queue.jsonl\`을 사용한다.
`;
}

function buildGptReviewManifest(rounds: RoundAudit[]) {
  return {
    formatVersion: 1,
    reviewContract: {
      transport: "ChatGPT UI Pro",
      unit: "one exam round per request",
      scope:
        "Only questions whose source and current values differ, plus source-unreachable questions.",
      requiredReturnFields: [
        "externalId",
        "sourceExactStem",
        "sourceExactChoices",
        "sourceAnswerIndex",
        "directSolution",
        "formulaUnitSubstitutionWhenApplicable",
        "choiceByChoiceReasons",
        "conceptAndLessonMapping",
        "missingTheorySupplement",
        "imageRequirement",
        "answerConflictOrMultipleAnswerRisk",
      ],
    },
    rounds: rounds.map((round) => ({
      sessionLabel: round.sessionLabel,
      sourceUrl: round.sourceUrl,
      sourceStatus: round.status,
      reviewQuestionIds: round.questions
        .filter(
          (question) =>
            question.status !== "exact" &&
            question.status !== "normalized_exact",
        )
        .map((question) => question.externalId),
      packetPath: `rounds/${roundFileName(
        round.sessionLabel,
        round.sourceUrl,
      )}.json`,
    })),
  };
}

function classifyAnswerStatus(
  audit: QuestionAudit,
): MismatchReviewQueueEntry["statuses"]["answer"] {
  if (!audit.source) return "unreachable";
  if (audit.source.answerIndex === null) return "source_answer_missing";
  if (audit.current.answerIndex === null) return "current_answer_missing";
  return audit.source.answerIndex === audit.current.answerIndex
    ? "exact"
    : "mismatch";
}

function classifyImageStatus(
  audit: QuestionAudit,
  variant: Variant | undefined,
): MismatchReviewQueueEntry["statuses"]["image"] {
  if (!audit.source) return "unreachable";
  if (audit.source.imageUrls.length > 0) {
    return variant?.sourceReview?.imageRequirement === "required"
      ? "source_image_present_reviewed_required"
      : "source_image_present_review_pending";
  }
  return variant?.sourceReview?.imageRequirement === "source_image_missing"
    ? "source_image_missing"
    : "not_required";
}

function hashNormalizedText(value: string) {
  return sha256(normalizeCbtExactText(value));
}

function hashNormalizedChoices(choices: string[]) {
  return sha256(JSON.stringify(choices.map(normalizeCbtExactText)));
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))] as string[];
}

function safeFileName(value: string) {
  return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_");
}

function roundFileName(sessionLabel: string, sourceUrl: string) {
  const url = new URL(sourceUrl);
  const sourceKey =
    url.pathname.split("/").filter(Boolean).at(-1) ?? url.hostname;
  return safeFileName(`${sourceKey}-${sessionLabel}`);
}

function resolveQualificationKey(): CbtExamTrackKey {
  const value =
    process.env.CBT_ROUND_AUDIT_QUALIFICATION_KEY ??
    "facility-maintenance-engineer-current";
  if (!cbtExamTracksByKey.has(value as CbtExamTrackKey)) {
    throw new Error(
      `Unknown CBT_ROUND_AUDIT_QUALIFICATION_KEY: ${value}`,
    );
  }
  return value as CbtExamTrackKey;
}

function isMainModule() {
  const entryPath = process.argv[1];
  return Boolean(
    entryPath &&
      path.resolve(entryPath) === path.resolve(fileURLToPath(import.meta.url)),
  );
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
