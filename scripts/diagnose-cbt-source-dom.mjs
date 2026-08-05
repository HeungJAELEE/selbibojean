import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const cheerioPath = process.env.CBT_CHEERIO_PATH;
if (!cheerioPath) throw new Error("CBT_CHEERIO_PATH is required");
const { load } = await import(pathToFileURL(cheerioPath).href);

const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const samples = [
  "https://cbtbank.kr/exam/de20080907",
  "https://www.comcbt.com/xe/webhaesul/9635925",
  "https://www.comcbt.com/xe/cet/5708822",
];

for (const sourceUrl of samples) {
  const variant = content.variants.find((item) => item.sourceUrl === sourceUrl);
  if (!variant) {
    console.log(JSON.stringify({ sourceUrl, error: "variant_not_found" }));
    continue;
  }

  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; SelbiSourceAudit/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  const html = await response.text();
  const $ = load(html);
  const needle = normalize(variant.stem).slice(0, 24);
  const matches = [];

  $("body *").each((_, element) => {
    if (matches.length >= 8) return;
    const ownText = normalize($(element).clone().children().remove().end().text());
    const fullText = normalize($(element).text());
    if (!fullText.includes(needle)) return;
    matches.push(describeElement($, element));
  });

  const numberedCandidates = [];
  $("body *").each((_, element) => {
    if (numberedCandidates.length >= 40) return;
    const ownText = normalize($(element).clone().children().remove().end().text());
    const fullText = normalize($(element).text());
    if (!/^1\s*[.)번]\s*/.test(ownText) && !/^1\s*[.)번]\s*/.test(fullText)) return;
    if (fullText.length > 1800) return;
    numberedCandidates.push(describeElement($, element));
  });

  const classCounts = new Map();
  $("[class]").each((_, element) => {
    for (const token of String($(element).attr("class") || "").split(/\s+/).filter(Boolean)) {
      classCounts.set(token, (classCounts.get(token) || 0) + 1);
    }
  });

  const structuralCandidates = [];
  $("[class*='question'], [id*='question'], [class*='exam'], [id*='exam'], [class*='quiz'], [id*='quiz'], [class*='choice'], [id*='choice'], table, iframe").each((_, element) => {
    if (structuralCandidates.length >= 80) return;
    const fullText = normalize($(element).text());
    const fragment = $.html(element);
    if (element.tagName === "table" && !/[1-4]\s*[.)번]/.test(fullText)) return;
    structuralCandidates.push({
      ...describeElement($, element),
      attrs: element.attribs || {},
      html: fragment.slice(0, 2200),
    });
  });

  const answerHints = [];
  $("[class*='answer'], [id*='answer'], [data-answer], [data-correct], input, script").each((_, element) => {
    if (answerHints.length >= 50) return;
    const fragment = $.html(element);
    if (!/(answer|correct|dap|정답|ans|good|right)/i.test(fragment)) return;
    answerHints.push(fragment.slice(0, 1400));
  });

  const rawContexts = [];
  for (const pattern of ["1.", "1)", "문제", "정답", "answer", "correct", "good"] ) {
    let offset = 0;
    while (rawContexts.length < 50) {
      const index = html.toLowerCase().indexOf(pattern.toLowerCase(), offset);
      if (index < 0) break;
      rawContexts.push({ pattern, index, html: html.slice(Math.max(0, index - 350), index + 1600) });
      offset = index + pattern.length;
    }
  }

  console.log(`\n=== ${sourceUrl} ===`);
  console.log(JSON.stringify({
    status: response.status,
    finalUrl: response.url,
    htmlLength: html.length,
    title: normalize($("title").text()),
    externalId: variant.externalId,
    currentNeedle: needle,
    classCounts: [...classCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80),
    matchCount: matches.length,
    matches,
    numberedCandidates,
    structuralCandidates,
    answerHints,
    rawContexts,
  }, null, 2));
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

function describeElement($, element) {
  const ownText = normalize($(element).clone().children().remove().end().text());
  const fullText = normalize($(element).text());
  return {
    tag: element.tagName || element.name || null,
    id: $(element).attr("id") || null,
    class: $(element).attr("class") || null,
    ownText: ownText.slice(0, 500),
    fullText: fullText.slice(0, 1500),
    parent: describe($(element).parent()),
  };
}

function describe(node) {
  if (!node?.length) return null;
  return {
    tag: node[0]?.tagName || node[0]?.name || null,
    id: node.attr("id") || null,
    class: node.attr("class") || null,
  };
}
