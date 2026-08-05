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
    const tag = element.tagName || element.name;
    const id = $(element).attr("id") || null;
    const cls = $(element).attr("class") || null;
    matches.push({
      tag,
      id,
      class: cls,
      ownText: ownText.slice(0, 240),
      fullText: fullText.slice(0, 600),
      html: $.html(element).slice(0, 1800),
      parent: describe($(element).parent()),
    });
  });

  const answerHints = [];
  $("[class*='answer'], [id*='answer'], [data-answer], [data-correct], input, script").each((_, element) => {
    if (answerHints.length >= 30) return;
    const fragment = $.html(element);
    if (!/(answer|correct|dap|정답|ans)/i.test(fragment)) return;
    answerHints.push(fragment.slice(0, 700));
  });

  console.log(`\n=== ${sourceUrl} ===`);
  console.log(JSON.stringify({
    status: response.status,
    finalUrl: response.url,
    htmlLength: html.length,
    title: normalize($("title").text()),
    externalId: variant.externalId,
    needle,
    matchCount: matches.length,
    matches,
    answerHints,
  }, null, 2));
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

function describe(node) {
  if (!node?.length) return null;
  return {
    tag: node[0]?.tagName || node[0]?.name || null,
    id: node.attr("id") || null,
    class: node.attr("class") || null,
  };
}
