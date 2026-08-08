import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const cheerioPath = process.env.CBT_CHEERIO_PATH;
if (!cheerioPath) throw new Error("CBT_CHEERIO_PATH is required");
const { load } = await import(pathToFileURL(cheerioPath).href);

const outputDir = "artifacts/cbt-source-inventory";
await mkdir(outputDir, { recursive: true });
const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const groups = new Map();

for (const variant of content.variants) {
  const group = groups.get(variant.sourceUrl) ?? {
    sourceUrl: variant.sourceUrl,
    year: variant.year,
    sessionLabel: variant.sessionLabel,
    externalIds: [],
    questionNumbers: [],
  };
  group.externalIds.push(variant.externalId);
  group.questionNumbers.push(variant.questionNumber);
  groups.set(variant.sourceUrl, group);
}

const results = [];
for (const group of [...groups.values()].sort((a, b) => String(a.externalIds[0]).localeCompare(String(b.externalIds[0])))) {
  const startedAt = Date.now();
  let response;
  let html = "";
  let error = null;
  try {
    response = await fetchWithRetry(group.sourceUrl, 3);
    html = await response.text();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  if (!response) {
    results.push({
      ...groupSummary(group),
      status: "unreachable",
      error,
      elapsedMs: Date.now() - startedAt,
    });
    continue;
  }

  const $ = load(html);
  const examBoxes = $(".exam-box");
  const directQuestions = examBoxes.map((_, box) => {
    const root = $(box);
    const numberText = normalize(root.find(".exam-number, .exam-no").first().text());
    const id = root.attr("id") || null;
    const numberFromId = id?.match(/-(\d+)$/)?.[1] ?? null;
    const number = Number(numberText || numberFromId);
    const choices = root.find(".question-choice li").map((_, item) => ({
      text: normalize($(item).clone().find("script, style").remove().end().text()),
      correct: $(item).hasClass("correct"),
      images: $(item).find("img").map((_, img) => absoluteUrl($(img).attr("src"), response.url)).get(),
    })).get();
    return {
      number: Number.isFinite(number) ? number : null,
      id,
      stem: normalize(root.find(".exam-title").first().clone().find(".exam-number, .exam-no").remove().end().text()),
      choices,
      images: root.find(".exam-title img, .question-image img, img.question-image").map((_, img) => absoluteUrl($(img).attr("src"), response.url)).get(),
    };
  }).get();

  const attachments = $("a[href]").map((_, anchor) => {
    const href = absoluteUrl($(anchor).attr("href"), response.url);
    const text = normalize($(anchor).text());
    const title = normalize($(anchor).attr("title"));
    if (!href) return null;
    const combined = `${href} ${text} ${title}`;
    if (!/(\.pdf(?:$|[?#])|\.hwp(?:$|[?#])|\.hwpx(?:$|[?#])|download|file_srl|document_srl|webhaesul|\/xe\/cet\/)/i.test(combined)) return null;
    return { href, text, title };
  }).get().filter(Boolean);

  const article = $(".xe_content, [class*='document_'], .rd_body, .document_content").first();
  const articleText = normalize(article.text());
  const images = article.find("img").map((_, img) => absoluteUrl($(img).attr("src"), response.url)).get().filter(Boolean);

  results.push({
    ...groupSummary(group),
    status: response.ok ? "reachable" : "http_error",
    httpStatus: response.status,
    finalUrl: response.url,
    title: normalize($("title").text()),
    htmlLength: html.length,
    parserHint: directQuestions.length ? "cbtbank_exam_box" : article.length ? "article_or_attachment" : "unknown",
    directQuestionCount: directQuestions.length,
    directQuestionNumbers: directQuestions.map((item) => item.number),
    directQuestionPreview: directQuestions.slice(0, 2),
    articleText: articleText.slice(0, 5000),
    articleImages: images.slice(0, 100),
    attachments: uniqueBy(attachments, (item) => item.href).slice(0, 200),
    elapsedMs: Date.now() - startedAt,
    error,
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  sourceUrlCount: results.length,
  expectedVariantCount: content.variants.length,
  reachable: results.filter((item) => item.status === "reachable").length,
  unreachable: results.filter((item) => item.status === "unreachable").length,
  directHtmlSources: results.filter((item) => item.directQuestionCount > 0).length,
  attachmentSources: results.filter((item) => item.attachments?.length > 0 && item.directQuestionCount === 0).length,
  results,
};
await writeFile(`${outputDir}/inventory.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  sourceUrlCount: summary.sourceUrlCount,
  expectedVariantCount: summary.expectedVariantCount,
  reachable: summary.reachable,
  unreachable: summary.unreachable,
  directHtmlSources: summary.directHtmlSources,
  attachmentSources: summary.attachmentSources,
}));

function groupSummary(group) {
  const numbers = group.questionNumbers.filter(Number.isFinite);
  return {
    sourceUrl: group.sourceUrl,
    year: group.year,
    sessionLabel: group.sessionLabel,
    expectedVariantCount: group.externalIds.length,
    firstExternalId: group.externalIds[0],
    lastExternalId: group.externalIds.at(-1),
    minQuestionNumber: numbers.length ? Math.min(...numbers) : null,
    maxQuestionNumber: numbers.length ? Math.max(...numbers) : null,
  };
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
        signal: AbortSignal.timeout(30000),
      });
      if (response.status >= 500 && attempt < attempts) {
        await sleep(750 * attempt);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(750 * attempt);
    }
  }
  throw lastError ?? new Error(`Unable to fetch ${url}`);
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

function absoluteUrl(value, base) {
  if (!value) return null;
  try {
    return new URL(value, base).href;
  } catch {
    return null;
  }
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
