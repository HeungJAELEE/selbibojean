import { readFile, writeFile } from "node:fs/promises";

const sourcePath = "scripts/reconstruct-cbt-sources.mjs";
const outputPath = "/tmp/reconstruct-cbt-sources-exact.mjs";
let source = await readFile(sourcePath, "utf8");

source = replaceOnce(
  source,
  "return exactText(choice.text());",
  "return exactNodeText(choice, $);",
);
source = replaceOnce(
  source,
  'stem: exactText(title.text()).replace(/^\\.\\s*/, ""),',
  'stem: exactNodeText(title, $).replace(/^\\.\\s*/, ""),',
);
source = replaceOnce(
  source,
  "function exactText(value) {",
  `function exactNodeText(node, $) {
  const clone = node.clone();
  clone.find("br").replaceWith("\\n");
  clone.find("sup").each((_, element) => {
    const value = exactText($(element).text());
    $(element).replaceWith(value ? \`^{\${value}}\` : "");
  });
  clone.find("sub").each((_, element) => {
    const value = exactText($(element).text());
    $(element).replaceWith(value ? \`_{\${value}}\` : "");
  });
  clone.find("script, style, button, input").remove();
  return exactText(clone.text());
}

function exactText(value) {`,
);

await writeFile(outputPath, source, "utf8");
console.log(`Prepared source-semantic reconstruction script: ${outputPath}`);

function replaceOnce(value, search, replacement) {
  const first = value.indexOf(search);
  if (first < 0) throw new Error(`Required reconstruction patch target was not found: ${search}`);
  if (value.indexOf(search, first + search.length) >= 0) {
    throw new Error(`Reconstruction patch target was not unique: ${search}`);
  }
  return `${value.slice(0, first)}${replacement}${value.slice(first + search.length)}`;
}
