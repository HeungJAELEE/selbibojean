import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const cheerioPath = process.env.CBT_CHEERIO_PATH;
if (!cheerioPath) throw new Error("CBT_CHEERIO_PATH is required");
const { load } = await import(pathToFileURL(cheerioPath).href);

const GENERATED_PATH = "src/data/generated/cbt-source-reconstruction.json";
const AUDIT_DIR = "docs/audit-work/cbt-source-reconstruction";
const VISUAL_CUE = /그림|도면|회로도|사진|이미지|도시(?:한|된)|다음\s*회로|아래\s*회로|파형|기호/i;
const SOURCE_URL_OVERRIDES = new Map([
  ["https://www.comcbt.com/xe/cet/5708822", "https://cbtbank.kr/exam/de20090830"],
  ["https://www.comcbt.com/xe/webhaesul/9635925", "https://cbtbank.kr/exam/de20160508"],
  ["https://www.comcbt.com/xe/webhaesul/9658829", "https://cbtbank.kr/exam/de20200926"],
  ["https://www.comcbt.com/xe/webhaesul/9659405", "https://cbtbank.kr/exam/de20210307"],
  ["https://www.comcbt.com/xe/webhaesul/9630928", "https://cbtbank.kr/exam/de20210515"],
  ["https://www.comcbt.com/xe/webhaesul/8162917", "https://cbtbank.kr/exam/de20210912"],
  ["https://www.comcbt.com/xe/webhaesul/9620121", "https://cbtbank.kr/exam/cet20220305"],
  ["https://www.comcbt.com/xe/webhaesul/9620123", "https://cbtbank.kr/exam/cet20220424"],
]);

await mkdir(AUDIT_DIR, { recursive: true });
const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const questionsById = new Map(content.questions.map((question) => [question.id, question]));
const variantsBySource = groupBy(content.variants, (variant) => variant.sourceUrl);
const observedAt = new Date().toISOString();
const sessions = [];
const records = [];
const imageUrls = new Set();

for (const [registeredSourceUrl, variants] of [...variantsBySource.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  const resolvedSourceUrl = SOURCE_URL_OVERRIDES.get(registeredSourceUrl) ?? registeredSourceUrl;
  const response = await fetchWithRetry(resolvedSourceUrl, 3);
  const html = await response.text();
  const pageSha256 = sha256(html);
  const $ = load(html);
  const pageTitle = exactText($("title").text());
  const pageExamDate = parseExamDate(pageTitle, resolvedSourceUrl);
  const examTrackKey = pageTitle.includes("설비보전기사(구)")
    ? "facility-maintenance-engineer-legacy"
    : pageTitle.includes("설비보전기사")
      ? "facility-maintenance-engineer-current"
      : null;
  const capture = extractCbtBankQuestions($, response.url);
  const sourceByNumber = new Map(capture.questions.map((question) => [question.questionNumber, question]));
  const currentQuestionNumbers = variants.map((variant) => variant.questionNumber).filter(Number.isFinite);
  const duplicateCurrentQuestionNumbers = duplicates(currentQuestionNumbers);
  const missingCurrentQuestionNumbers = unique(currentQuestionNumbers).filter((number) => !sourceByNumber.has(number));
  const selectedRecords = [];

  for (const variant of variants) {
    const canonical = questionsById.get(variant.canonicalId);
    const source = sourceByNumber.get(variant.questionNumber);
    const currentAnswerIndex = parseAnswerIndex(variant.answer, variant.choices);
    const stableChoice = deriveStableChoiceIds(variant, canonical, currentAnswerIndex);
    const holdReasons = [];

    if (!canonical) holdReasons.push("canonical_question_missing");
    if (!Number.isFinite(variant.questionNumber)) holdReasons.push("question_number_missing");
    if (!source) holdReasons.push("source_question_missing");
    if (!stableChoice.choiceIds) holdReasons.push("stable_choice_mapping_missing");
    if (source && source.choices.length !== variant.choices.length) holdReasons.push("choice_count_mismatch");
    if (source && source.answerIndex === null) holdReasons.push("source_answer_conflict_or_missing");

    const sourceAnswerChoiceId =
      source?.answerIndex !== null && stableChoice.choiceIds
        ? stableChoice.choiceIds[source.answerIndex] ?? null
        : null;
    const answerAlignmentStatus = !canonical || !source || source.answerIndex === null || !stableChoice.choiceIds
      ? "unknown"
      : sourceAnswerChoiceId === canonical.correctChoiceId
        ? "match"
        : "conflict";
    if (answerAlignmentStatus === "conflict") holdReasons.push("source_answer_canonical_conflict");

    const allImages = source ? [...source.stemImageUrls, ...source.choiceImageUrls.flat()] : [];
    for (const imageUrl of allImages) imageUrls.add(imageUrl);
    const sourceImageCue = source ? VISUAL_CUE.test(source.stem) : false;
    const canonicalAssetRequired = canonical?.publication?.blockers?.includes("asset_required") ?? false;
    const imageRequirement = allImages.length
      ? "required"
      : sourceImageCue || canonicalAssetRequired
        ? "source_image_missing"
        : "none";
    if (imageRequirement === "source_image_missing") holdReasons.push("source_image_missing");

    const sourceStemSha256 = source ? sha256(source.stem) : null;
    const sourceChoicesSha256 = source ? sha256(JSON.stringify(source.choices)) : null;
    const currentStemSha256 = sha256(exactText(variant.stem));
    const currentChoicesSha256 = sha256(JSON.stringify(variant.choices.map(exactText)));
    const sourceIdentitySha256 = source && sourceStemSha256 && sourceChoicesSha256
      ? sha256([response.url, String(variant.questionNumber), sourceStemSha256, sourceChoicesSha256].join("\u0000"))
      : null;
    const registeredIdentitySha256 = source && sourceStemSha256 && sourceChoicesSha256
      ? sha256([registeredSourceUrl, String(variant.questionNumber), sourceStemSha256, sourceChoicesSha256].join("\u0000"))
      : null;

    const record = {
      externalId: variant.externalId,
      canonicalId: variant.canonicalId,
      relationship: variant.relationship,
      year: variant.year,
      sessionLabel: variant.sessionLabel,
      questionNumber: variant.questionNumber,
      registeredSourceUrl,
      resolvedSourceUrl: response.url,
      sourceUrlResolution: registeredSourceUrl === response.url
        ? "registered_url"
        : SOURCE_URL_OVERRIDES.has(registeredSourceUrl)
          ? "explicit_same_exam_mirror_override"
          : "redirect",
      sourceAuthority: "mirror_capture",
      sourceDisplayLabel: "복원 정답",
      pageTitle,
      pageExamDate,
      examTrackKey,
      trackIdentityStatus: examTrackKey ? "matched" : "ambiguous",
      observedAt,
      sourcePageSha256: pageSha256,
      sourceCaptureStatus: source ? "captured" : "missing",
      source: source ? {
        exactStem: source.stem,
        exactChoices: source.choices,
        answerIndex: source.answerIndex,
        answerIndicesObserved: source.answerIndicesObserved,
        stemImageUrls: source.stemImageUrls,
        choiceImageUrls: source.choiceImageUrls,
        stemSha256: sourceStemSha256,
        orderedChoicesSha256: sourceChoicesSha256,
        sourceIdentitySha256,
        registeredIdentitySha256,
      } : null,
      current: {
        stemSha256: currentStemSha256,
        orderedChoicesSha256: currentChoicesSha256,
        answerIndex: currentAnswerIndex >= 0 ? currentAnswerIndex : null,
        stemFidelity: source ? classifyTextFidelity(source.stem, variant.stem) : "unreachable",
        choicesFidelity: source ? classifyChoicesFidelity(source.choices, variant.choices) : "unreachable",
        answerMatchesSource: source?.answerIndex !== null && currentAnswerIndex >= 0
          ? source.answerIndex === currentAnswerIndex
          : null,
      },
      stableChoiceIds: stableChoice.choiceIds,
      stableChoiceMappingStatus: stableChoice.status,
      canonicalCorrectChoiceId: canonical?.correctChoiceId ?? null,
      sourceAnswerChoiceId,
      answerAlignmentStatus,
      answerEvidence: "unknown",
      imageRequirement,
      imageStatus: allImages.length ? "pending_reachability_check" : imageRequirement === "none" ? "not_required" : "missing",
      resolution: holdReasons.length ? "hold" : "restored_candidate",
      holdReasons: unique(holdReasons),
    };
    records.push(record);
    selectedRecords.push(record);
  }

  sessions.push({
    sessionKey: `${variants[0]?.year ?? "unknown"}-${variants[0]?.sessionLabel ?? "unknown"}`,
    registeredSourceUrl,
    resolvedSourceUrl: response.url,
    sourceUrlResolution: registeredSourceUrl === response.url
      ? "registered_url"
      : SOURCE_URL_OVERRIDES.has(registeredSourceUrl)
        ? "explicit_same_exam_mirror_override"
        : "redirect",
    sourceAuthority: "mirror_capture",
    pageTitle,
    pageExamDate,
    examTrackKey,
    observedAt,
    sourcePageSha256: pageSha256,
    expectedVariantCount: variants.length,
    sourceQuestionCount: capture.questions.length,
    sourceQuestionNumbers: capture.questions.map((question) => question.questionNumber),
    selectedQuestionNumbers: currentQuestionNumbers,
    duplicateSelectedQuestionNumbers: duplicateCurrentQuestionNumbers,
    missingSelectedQuestionNumbers: missingCurrentQuestionNumbers,
    selectedCapturedCount: selectedRecords.filter((record) => record.sourceCaptureStatus === "captured").length,
    restoredCandidateCount: selectedRecords.filter((record) => record.resolution === "restored_candidate").length,
    holdCount: selectedRecords.filter((record) => record.resolution === "hold").length,
  });
}

const imageObservations = await mapWithConcurrency([...imageUrls].sort(), 10, inspectImage);
const imageByUrl = new Map(imageObservations.map((item) => [item.url, item]));
for (const record of records) {
  const urls = record.source
    ? [...record.source.stemImageUrls, ...record.source.choiceImageUrls.flat()]
    : [];
  if (!urls.length) continue;
  const observations = urls.map((url) => imageByUrl.get(url)).filter(Boolean);
  record.source.imageObservations = observations;
  if (observations.length !== urls.length || observations.some((item) => !item.reachable)) {
    record.imageStatus = "unreachable";
    record.resolution = "hold";
    record.holdReasons = unique([...record.holdReasons, "source_image_unreachable"]);
  } else {
    record.imageStatus = "complete";
  }
}

const dataset = {
  formatVersion: 1,
  generatedAt: observedAt,
  sourcePolicy: "historical_exam_mirror_capture_reconstruction",
  sourceAuthority: "mirror_capture",
  answerDisplayLabel: "복원 정답",
  sourceCounts: {
    canonicalQuestions: content.questions.length,
    variants: content.variants.length,
    sessions: sessions.length,
    registeredSourceUrls: variantsBySource.size,
    resolvedSourceUrls: new Set(sessions.map((session) => session.resolvedSourceUrl)).size,
    sourceQuestionsCaptured: sessions.reduce((sum, session) => sum + session.sourceQuestionCount, 0),
    selectedQuestionsCaptured: records.filter((record) => record.sourceCaptureStatus === "captured").length,
    restoredCandidates: records.filter((record) => record.resolution === "restored_candidate").length,
    holds: records.filter((record) => record.resolution === "hold").length,
    sourceImages: imageUrls.size,
    reachableSourceImages: imageObservations.filter((item) => item.reachable).length,
  },
  sourceUrlOverrides: Object.fromEntries(SOURCE_URL_OVERRIDES),
  sessions,
  records,
};

const holdReasonCounts = countValues(records.flatMap((record) => record.holdReasons));
const summary = {
  generatedAt: observedAt,
  ...dataset.sourceCounts,
  holdReasonCounts,
  fidelity: {
    stem: countValues(records.map((record) => record.current.stemFidelity)),
    choices: countValues(records.map((record) => record.current.choicesFidelity)),
    answers: countValues(records.map((record) => String(record.current.answerMatchesSource))),
  },
  sessions,
};
const mismatchQueue = records.filter((record) =>
  record.resolution === "hold"
  || record.current.stemFidelity === "mismatch"
  || record.current.choicesFidelity === "mismatch"
  || record.current.answerMatchesSource === false,
);

await writeFile(GENERATED_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
await writeFile(`${AUDIT_DIR}/session-summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(
  `${AUDIT_DIR}/mismatch-queue.jsonl`,
  `${mismatchQueue.map((record) => JSON.stringify(record)).join("\n")}\n`,
  "utf8",
);
console.log(JSON.stringify(dataset.sourceCounts));

function extractCbtBankQuestions($, baseUrl) {
  const questions = $(".exam-box").map((_, box) => {
    const root = $(box);
    const title = root.find(".exam-title").first().clone();
    const numberText = exactText(title.find(".exam-number, .exam-no").first().text());
    const numberFromId = root.attr("id")?.match(/-(\d+)$/)?.[1] ?? null;
    title.find(".exam-number, .exam-no, script, style").remove();
    const questionNumber = Number(numberText || numberFromId);
    const list = root.find(".question-choice ol, .question-choice ul").first();
    const items = list.find(":scope > li");
    const choices = items.map((_, item) => {
      const choice = $(item).clone();
      choice.find("script, style, button, input").remove();
      return exactText(choice.text());
    }).get();
    const classIndices = items.map((index, item) => $(item).hasClass("correct") ? index : null).get().filter(Number.isInteger);
    const attrValue = Number(list.attr("correct"));
    const attrIndex = Number.isInteger(attrValue) && attrValue >= 1 ? attrValue - 1 : null;
    const answerIndicesObserved = unique([
      ...classIndices,
      ...(attrIndex !== null ? [attrIndex] : []),
    ]).sort((left, right) => left - right);
    const answerIndex = answerIndicesObserved.length === 1 ? answerIndicesObserved[0] : null;
    const stemImageUrls = imageUrlsFrom(title, $, baseUrl);
    const choiceImageUrls = items.map((_, item) => imageUrlsFrom($(item), $, baseUrl)).get();
    return {
      questionNumber: Number.isFinite(questionNumber) ? questionNumber : null,
      stem: exactText(title.text()).replace(/^\.\s*/, ""),
      choices,
      answerIndex,
      answerIndicesObserved,
      stemImageUrls,
      choiceImageUrls,
    };
  }).get();
  return { questions };
}

function deriveStableChoiceIds(variant, canonical, currentAnswerIndex) {
  if (!canonical || variant.choices.length !== canonical.choices.length) {
    return { choiceIds: null, status: "unavailable" };
  }
  const mapped = variant.choices.map((choice) =>
    canonical.choices.find((candidate) => normalizeChoice(candidate.text) === normalizeChoice(choice)),
  );
  if (mapped.every(Boolean) && new Set(mapped.map((choice) => choice.id)).size === mapped.length) {
    return { choiceIds: mapped.map((choice) => choice.id), status: "current_text_match" };
  }
  const positionalIds = canonical.choices
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((choice) => choice.id);
  if (
    currentAnswerIndex >= 0
    && positionalIds[currentAnswerIndex] === canonical.correctChoiceId
    && positionalIds.length === variant.choices.length
  ) {
    return { choiceIds: positionalIds, status: "position_answer_verified" };
  }
  return { choiceIds: null, status: "unavailable" };
}

function parseAnswerIndex(answer, choices) {
  const circled = ["①", "②", "③", "④", "⑤"];
  const bySymbol = circled.findIndex((symbol) => String(answer).trim().startsWith(symbol));
  if (bySymbol >= 0) return bySymbol;
  const number = String(answer).trim().match(/^([1-5])/);
  if (number) return Number(number[1]) - 1;
  const normalizedAnswer = normalizeChoice(String(answer).replace(/^[①②③④⑤1-5][.)]?\s*/, ""));
  return choices.findIndex((choice) => {
    const normalizedChoice = normalizeChoice(choice);
    return normalizedChoice === normalizedAnswer
      || normalizedChoice.includes(normalizedAnswer)
      || normalizedAnswer.includes(normalizedChoice);
  });
}

function classifyTextFidelity(source, current) {
  if (source === current) return "exact";
  return exactText(source) === exactText(current) ? "normalized_exact" : "mismatch";
}

function classifyChoicesFidelity(source, current) {
  if (JSON.stringify(source) === JSON.stringify(current)) return "exact";
  return JSON.stringify(source.map(exactText)) === JSON.stringify(current.map(exactText))
    ? "normalized_exact"
    : "mismatch";
}

function exactText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .trim();
}

function normalizeChoice(value) {
  return exactText(value)
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[\s·ㆍ,.?()\[\]{}'"/\\_-]+/g, "");
}

function imageUrlsFrom(root, $, baseUrl) {
  return unique(root.find("img").map((_, image) => {
    const source = $(image).attr("src") || $(image).attr("data-src") || $(image).attr("data-original");
    if (!source) return null;
    try {
      return new URL(source, baseUrl).href;
    } catch {
      return null;
    }
  }).get().filter(Boolean));
}

async function inspectImage(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "user-agent": "Mozilla/5.0 (compatible; SelbiSourceAudit/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    const body = response.ok ? Buffer.from(await response.arrayBuffer()) : Buffer.alloc(0);
    return {
      url,
      finalUrl: response.url,
      status: response.status,
      reachable: response.ok && body.length > 0,
      contentType: response.headers.get("content-type"),
      contentLength: body.length,
      sha256: body.length ? sha256(body) : null,
    };
  } catch (error) {
    return {
      url,
      finalUrl: null,
      status: null,
      reachable: false,
      contentType: null,
      contentLength: 0,
      sha256: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchWithRetry(url, attempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; SelbiSourceAudit/1.0)",
          accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok && response.status >= 500 && attempt < attempts) {
        await sleep(1000 * attempt);
        continue;
      }
      if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000 * attempt);
    }
  }
  throw lastError ?? new Error(`Unable to fetch ${url}`);
}

function parseExamDate(title, url) {
  const fromTitle = title.match(/(20\d{2}|19\d{2})[-년.]\s*(\d{1,2})[-월.]\s*(\d{1,2})/);
  if (fromTitle) return `${fromTitle[1]}-${String(fromTitle[2]).padStart(2, "0")}-${String(fromTitle[3]).padStart(2, "0")}`;
  const fromUrl = url.match(/(20\d{2}|19\d{2})(\d{2})(\d{2})/);
  return fromUrl ? `${fromUrl[1]}-${fromUrl[2]}-${fromUrl[3]}` : null;
}

function groupBy(values, keyFn) {
  const result = new Map();
  for (const value of values) {
    const key = keyFn(value);
    const bucket = result.get(key) ?? [];
    bucket.push(value);
    result.set(key, bucket);
  }
  return result;
}

function unique(values) {
  return [...new Set(values)];
}

function duplicates(values) {
  const seen = new Set();
  const duplicated = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicated.add(value);
    seen.add(value);
  }
  return [...duplicated].sort((left, right) => left - right);
}

function countValues(values) {
  return values.reduce((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const result = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      result[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length || 1) }, worker));
  return result;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
