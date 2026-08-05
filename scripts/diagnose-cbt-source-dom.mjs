import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const cheerioPath = process.env.CBT_CHEERIO_PATH;
if (!cheerioPath) throw new Error("CBT_CHEERIO_PATH is required");
const { load } = await import(pathToFileURL(cheerioPath).href);

const outputDir = "artifacts/cbt-dom-diagnostic";
await mkdir(outputDir, { recursive: true });

const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const samples = [
  "https://cbtbank.kr/exam/de20080907",
  "https://www.comcbt.com/xe/webhaesul/9635925",
  "https://www.comcbt.com/xe/cet/5708822",
];
const reports = [];

for (const [sampleIndex, sourceUrl] of samples.entries()) {
  const variant = content.variants.find((item) => item.sourceUrl === sourceUrl);
  if (!variant) {
    reports.push({ sourceUrl, error: "variant_not_found" });
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
  const filePrefix = `${sampleIndex + 1}-${new URL(sourceUrl).hostname.replace(/[^a-z0-9]+/gi, "-")}`;
  await writeFile(`${outputDir}/${filePrefix}.html`, html, "utf8");

  const classCounts = new Map();
  $("[class]").each((_, element) => {
    for (const token of String($(element).attr("class") || "").split(/\s+/).filter(Boolean)) {
      classCounts.set(token, (classCounts.get(token) || 0) + 1);
    }
  });

  const keywordElements = [];
  $("[class*='question'], [id*='question'], [class*='exam'], [id*='exam'], [class*='quiz'], [id*='quiz'], [class*='choice'], [id*='choice'], [class*='answer'], [id*='answer'], [class*='document'], [id*='document'], [class*='content'], [id*='content'], table, iframe").each((_, element) => {
    if (keywordElements.length >= 160) return;
    const text = normalize($(element).text());
    if (element.tagName === "table" && text.length < 20) return;
    keywordElements.push({
      tag: element.tagName || element.name || null,
      id: $(element).attr("id") || null,
      class: $(element).attr("class") || null,
      attrs: element.attribs || {},
      text: text.slice(0, 2200),
      html: $.html(element).slice(0, 5000),
      parent: describe($(element).parent()),
    });
  });

  const numberedElements = [];
  $("body *").each((_, element) => {
    if (numberedElements.length >= 100) return;
    const ownText = normalize($(element).clone().children().remove().end().text());
    const fullText = normalize($(element).text());
    const candidate = ownText || fullText;
    if (!/(^|\s)(1|01)\s*[.)번:]\s*/.test(candidate)) return;
    if (fullText.length < 10 || fullText.length > 3500) return;
    numberedElements.push({
      tag: element.tagName || element.name || null,
      id: $(element).attr("id") || null,
      class: $(element).attr("class") || null,
      ownText: ownText.slice(0, 1000),
      fullText: fullText.slice(0, 3000),
      html: $.html(element).slice(0, 6000),
      parent: describe($(element).parent()),
    });
  });

  const scripts = $("script")
    .map((_, element) => ({
      src: $(element).attr("src") || null,
      text: normalize($(element).text()).slice(0, 3000),
    }))
    .get()
    .filter((entry) => entry.src || /(answer|correct|question|exam|quiz|정답|문제)/i.test(entry.text))
    .slice(0, 100);

  reports.push({
    sourceUrl,
    status: response.status,
    finalUrl: response.url,
    title: normalize($("title").text()),
    htmlFile: `${filePrefix}.html`,
    htmlLength: html.length,
    externalId: variant.externalId,
    currentStemPrefix: normalize(variant.stem).slice(0, 80),
    classCounts: [...classCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 100),
    iframes: $("iframe").map((_, element) => element.attribs || {}).get(),
    forms: $("form").map((_, element) => ({ attrs: element.attribs || {}, text: normalize($(element).text()).slice(0, 1000) })).get().slice(0, 30),
    keywordElements,
    numberedElements,
    scripts,
  });
}

await writeFile(`${outputDir}/diagnostic.json`, `${JSON.stringify(reports, null, 2)}\n`, "utf8");
console.log(`CBT DOM diagnostic artifact written: ${reports.length} pages`);

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
