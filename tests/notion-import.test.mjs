import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const appGeneratedRoot = path.join(projectRoot, "app", "generated");
const publicRoot = path.join(projectRoot, "public");
const publicGeneratedRoot = path.join(publicRoot, "generated");
const topicRoot = path.join(publicGeneratedRoot, "topics");
const notionImageRoot = path.join(publicRoot, "notion-images");

const allowedBlockTypes = new Set([
  "paragraph",
  "heading",
  "list",
  "quote",
  "callout",
  "code",
  "table",
  "image",
  "divider",
]);

const imageExtensions = new Set([".jpg", ".png", ".svg"]);

async function listFilesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
    }),
  );
  return nested.flat().sort();
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function flattenCatalogTopics(catalog) {
  return catalog.subjects.flatMap((subject) =>
    subject.chapters.flatMap((chapter) => chapter.topics),
  );
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function assertOptionalString(value, label) {
  assert.ok(value === undefined || typeof value === "string", `${label} must be a string`);
}

function assertBlock(block, topicId, blockIndex) {
  const label = `${topicId} block ${blockIndex}`;
  assert.ok(block && typeof block === "object", `${label} must be an object`);
  assert.ok(allowedBlockTypes.has(block.type), `${label} has unsupported type: ${block.type}`);

  switch (block.type) {
    case "paragraph":
    case "quote":
      assert.equal(typeof block.text, "string", `${label}.text must be a string`);
      break;
    case "heading":
      assert.equal(typeof block.text, "string", `${label}.text must be a string`);
      assert.ok(Number.isInteger(block.level), `${label}.level must be an integer`);
      assert.ok(block.level >= 1 && block.level <= 6, `${label}.level must be between 1 and 6`);
      break;
    case "list":
      assert.ok(Array.isArray(block.items), `${label}.items must be an array`);
      assert.ok(block.items.every((item) => typeof item === "string"), `${label}.items must contain strings`);
      assert.ok(
        block.ordered === undefined || typeof block.ordered === "boolean",
        `${label}.ordered must be a boolean`,
      );
      break;
    case "callout":
      assert.equal(typeof block.text, "string", `${label}.text must be a string`);
      assertOptionalString(block.icon, `${label}.icon`);
      break;
    case "code":
      assert.equal(typeof block.text, "string", `${label}.text must be a string`);
      assertOptionalString(block.language, `${label}.language`);
      break;
    case "table":
      assert.ok(Array.isArray(block.rows), `${label}.rows must be an array`);
      assert.ok(
        block.rows.every(
          (row) => Array.isArray(row) && row.every((cell) => typeof cell === "string"),
        ),
        `${label}.rows must contain string cells`,
      );
      assert.ok(
        block.headers === undefined ||
          (Array.isArray(block.headers) && block.headers.every((header) => typeof header === "string")),
        `${label}.headers must contain strings`,
      );
      assertOptionalString(block.caption, `${label}.caption`);
      break;
    case "image":
      assert.equal(typeof block.src, "string", `${label}.src must be a string`);
      assert.equal(typeof block.alt, "string", `${label}.alt must be a string`);
      assertOptionalString(block.caption, `${label}.caption`);
      assertOptionalString(block.sourceUrl, `${label}.sourceUrl`);
      assert.ok(
        ["cleared", "unknown", "link-only"].includes(block.rightsStatus),
        `${label}.rightsStatus is invalid`,
      );
      assert.ok(Number.isInteger(block.width) && block.width > 0, `${label}.width must be positive`);
      assert.ok(Number.isInteger(block.height) && block.height > 0, `${label}.height must be positive`);
      break;
    case "divider":
      break;
    default:
      assert.fail(`${label} was not validated`);
  }
}

function publicPathFromUrl(urlPath) {
  assert.match(urlPath, /^\/generated\/topics\/[a-z0-9-]+\.json$/);
  const resolved = path.resolve(publicRoot, urlPath.slice(1).replaceAll("/", path.sep));
  const relative = path.relative(publicRoot, resolved);
  assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
  return resolved;
}

const importDataPromise = (async () => {
  const catalogPath = path.join(appGeneratedRoot, "notion-catalog.json");
  const searchIndexPath = path.join(publicGeneratedRoot, "search-index.json");
  const [catalog, searchIndex, topicFiles] = await Promise.all([
    readJson(catalogPath),
    readJson(searchIndexPath),
    listFilesRecursively(topicRoot),
  ]);
  const topicJsonFiles = topicFiles.filter((filePath) => path.extname(filePath) === ".json");
  const payloads = await Promise.all(
    topicJsonFiles.map(async (filePath) => ({ filePath, payload: await readJson(filePath) })),
  );
  return {
    catalog,
    catalogTopics: flattenCatalogTopics(catalog),
    payloads,
    searchIndex,
    topicJsonFiles,
  };
})();

test("Notion catalog preserves the complete source inventory", async () => {
  const { catalog, catalogTopics } = await importDataPromise;

  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.stats.headings, 556);
  assert.equal(catalog.stats.tables, 49);
  assert.equal(catalog.stats.images, 125);
  assert.equal(catalog.stats.topics, 70);
  assert.equal(catalogTopics.length, catalog.stats.topics);
  assertUnique(catalogTopics.map((topic) => topic.id), "catalog topic ids");
});

test("every catalog topic resolves to one matching payload and search entry", async () => {
  const { catalog, catalogTopics, payloads, searchIndex, topicJsonFiles } = await importDataPromise;

  assert.equal(topicJsonFiles.length, catalog.stats.topics);
  assert.equal(payloads.length, catalog.stats.topics);
  assert.equal(searchIndex.schemaVersion, 1);
  assert.ok(Array.isArray(searchIndex.topics));
  assert.equal(searchIndex.topics.length, catalog.stats.topics);

  const metadataById = new Map(catalogTopics.map((topic) => [topic.id, topic]));
  const payloadById = new Map(payloads.map(({ payload }) => [payload.id, payload]));
  const searchById = new Map(searchIndex.topics.map((entry) => [entry.id, entry]));

  assert.equal(metadataById.size, catalogTopics.length);
  assert.equal(payloadById.size, payloads.length);
  assert.equal(searchById.size, searchIndex.topics.length);
  assert.deepEqual([...payloadById.keys()].sort(), [...metadataById.keys()].sort());
  assert.deepEqual([...searchById.keys()].sort(), [...metadataById.keys()].sort());

  for (const topic of catalogTopics) {
    const expectedContentUrl = `/generated/topics/${topic.id}.json`;
    const expectedFile = publicPathFromUrl(expectedContentUrl);
    const payload = payloadById.get(topic.id);
    const searchEntry = searchById.get(topic.id);

    assert.ok(payload, `${topic.id} payload is missing`);
    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.id, topic.id);
    assert.equal(payload.title, topic.title);
    assert.equal(path.resolve(expectedFile), path.resolve(topicRoot, `${topic.id}.json`));
    assert.ok(Array.isArray(payload.blocks), `${topic.id}.blocks must be an array`);
    assert.ok(payload.blocks.length > 0, `${topic.id} must not be an empty learning document`);

    assert.ok(searchEntry, `${topic.id} search entry is missing`);
    assert.equal(searchEntry.title, topic.title);
    assert.equal(typeof searchEntry.normalizedText, "string");
    assert.ok(Array.isArray(searchEntry.sections), `${topic.id} search sections must be an array`);
  }
});

test("topic payloads use only supported blocks and preserve every table and image", async () => {
  const { payloads } = await importDataPromise;
  let tableCount = 0;
  let headerTableCount = 0;
  let imageCount = 0;

  for (const { payload } of payloads) {
    payload.blocks.forEach((block, blockIndex) => {
      assertBlock(block, payload.id, blockIndex);
      if (block.type === "table") {
        tableCount += 1;
        if (block.headers?.length) headerTableCount += 1;
      }
      if (block.type === "image") imageCount += 1;
    });
  }

  assert.equal(tableCount, 49);
  assert.equal(headerTableCount, 49);
  assert.equal(imageCount, 125);
});

test("generated JSON contains no signed URLs, private Notion wrapper, or local paths", async () => {
  const generatedFiles = [
    ...(await listFilesRecursively(appGeneratedRoot)),
    ...(await listFilesRecursively(publicGeneratedRoot)),
  ].filter((filePath) => path.extname(filePath) === ".json");

  const forbiddenPatterns = [
    ["AWS signed query", /X-Amz-/i],
    ["AWS security token", /Security-Token/i],
    ["AWS object URL", /amazonaws\.com/i],
    ["Notion temporary object host", /prod-files-secure/i],
    ["Notion ancestor wrapper", /<ancestor-path/i],
    ["Notion properties wrapper", /<properties/i],
    ["private workspace label", /Personal Space/i],
    ["unresolved Notion mention", /<mention-page/i],
    ["file URL", /file:\/\//i],
    ["Windows absolute path", /\b[A-Za-z]:[\\/]/],
    ["Unix local absolute path", /(?:^|["'\s])\/(?:Users|home|tmp|private\/tmp|var\/tmp|mnt|workspace)\//im],
    ["raw display-math delimiter", /\$\$/],
    ["raw TeX fraction", /\\frac\{/],
  ];

  for (const filePath of generatedFiles) {
    const source = await readFile(filePath, "utf8");
    for (const [label, pattern] of forbiddenPatterns) {
      assert.doesNotMatch(source, pattern, `${label} leaked into ${path.relative(projectRoot, filePath)}`);
    }
  }
});

test("approved source images are published one-to-one with safe local paths", async () => {
  const { payloads } = await importDataPromise;
  const imageBlocks = payloads.flatMap(({ payload }) =>
    payload.blocks.filter((block) => block.type === "image"),
  );
  const publicImageFiles = (await listFilesRecursively(notionImageRoot)).filter((filePath) =>
    imageExtensions.has(path.extname(filePath).toLowerCase()),
  );

  assert.equal(imageBlocks.length, 125);
  assert.equal(publicImageFiles.length, 125);
  assertUnique(imageBlocks.map((image) => image.src), "published image sources");

  const imageSources = new Set();
  for (const image of imageBlocks) {
    assert.equal(image.rightsStatus, "cleared");
    assert.match(image.src, /^\/notion-images\/[0-9a-f]{64}\.(?:svg|png|jpg)$/);
    assert.ok(image.alt && image.alt !== "Notion 원문 이미지", `${image.src} needs contextual alt text`);
    assert.ok(image.caption && image.caption !== "Notion 원문 이미지", `${image.src} needs a caption`);
    imageSources.add(image.src);
  }

  for (const filePath of publicImageFiles) {
    const publicUrl = `/${path.relative(publicRoot, filePath).split(path.sep).join("/")}`;
    assert.ok(imageSources.has(publicUrl), `${publicUrl} is not referenced by one approved block`);
    const bytes = await readFile(filePath);
    const digest = createHash("sha256").update(bytes).digest("hex");
    assert.equal(path.basename(filePath, path.extname(filePath)), digest, `${publicUrl} filename must match its bytes`);
    if (path.extname(filePath).toLowerCase() === ".svg") {
      const svg = bytes.toString("utf8");
      assert.doesNotMatch(
        svg,
        /<\s*(?:script|foreignObject)\b|\son[a-z]+\s*=|javascript:|<!DOCTYPE|<!ENTITY|(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/)/i,
        `${publicUrl} contains active or external SVG content`,
      );
    }
  }
});
