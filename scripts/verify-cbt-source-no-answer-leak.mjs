import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scopeArgument = process.argv.find((argument) => argument.startsWith("--scope="));
const scope = scopeArgument?.split("=")[1] ?? "all";
if (!["source", "build", "all"].includes(scope)) {
  throw new Error(`Unknown CBT source leak verification scope: ${scope}`);
}

const dataset = JSON.parse(
  await readFile(
    path.join(root, "src/data/generated/cbt-source-reconstruction.json"),
    "utf8",
  ),
);
const content = JSON.parse(
  await readFile(path.join(root, "src/data/generated/content.json"), "utf8"),
);
const failures = [];

if (scope === "source" || scope === "all") {
  await verifySourceBoundary();
}
if (scope === "build" || scope === "all") {
  await verifyClientBuild();
}

if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exit(1);
}
console.log(
  `CBT source answer-leak verification passed (${scope}; records=${dataset.records.length}).`,
);

async function verifySourceBoundary() {
  const repositoryPath = path.join(
    root,
    "src/lib/content/cbt-source-reconstruction.ts",
  );
  const repositorySource = await readFile(repositoryPath, "utf8");
  if (!/^import\s+["']server-only["'];/m.test(repositorySource)) {
    failures.push("CBT reconstruction repository is not marked server-only");
  }

  const sourceFiles = (await walk(path.join(root, "src"))).filter((file) =>
    [".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(path.extname(file)),
  );
  const forbiddenImport =
    /(?:cbt-source-reconstruction|generated\/cbt-source-reconstruction\.json)/;
  for (const file of sourceFiles) {
    const source = await readFile(file, "utf8");
    if (!/^\s*["']use client["'];/m.test(source)) continue;
    if (forbiddenImport.test(source)) {
      failures.push(
        `client module imports CBT reconstruction answers: ${relative(file)}`,
      );
    }
  }

  const publicDirectory = path.join(root, "public");
  for (const file of await walk(publicDirectory)) {
    if (/cbt-source-reconstruction/i.test(path.basename(file))) {
      failures.push(`CBT reconstruction ledger is public: ${relative(file)}`);
    }
  }

  if (
    dataset.records.some(
      (record) =>
        record.publicationStatus !== "hold" ||
        record.answerEvidence !== "unknown",
    )
  ) {
    failures.push(
      "unreviewed source reconstruction contains a publishable or evidenced answer",
    );
  }
}

async function verifyClientBuild() {
  const clientDirectory = path.join(root, "dist/client");
  if (!(await exists(clientDirectory))) {
    failures.push("dist/client is missing; run the production build first");
    return;
  }
  const clientFiles = (await walk(clientDirectory)).filter((file) =>
    new Set([".js", ".mjs", ".cjs", ".json", ".html", ".map", ".txt"]).has(
      path.extname(file),
    ),
  );
  const identitySentinels = dataset.records
    .slice(0, 80)
    .flatMap((record) => [
      record.source.sourceIdentitySha256,
      record.source.registeredIdentitySha256,
    ]);
  const answerSentinels = buildUniqueSourceAnswerSentinels().slice(0, 120);
  const sentinels = [...identitySentinels, ...answerSentinels];

  for (const file of clientFiles) {
    const fileStats = await stat(file);
    if (fileStats.size > 25_000_000) continue;
    const text = normalize(await readFile(file, "utf8"));
    const leaked = sentinels.find((sentinel) => text.includes(normalize(sentinel)));
    if (leaked) {
      failures.push(
        `CBT reconstruction answer sentinel leaked into client build: ${relative(file)}`,
      );
    }
  }
}

function buildUniqueSourceAnswerSentinels() {
  const existingChoiceTexts = new Set(
    [
      ...content.questions.flatMap((question) =>
        question.choices.map((choice) => normalize(choice.text)),
      ),
      ...content.variants.flatMap((variant) =>
        variant.choices.map((choice) => normalize(choice)),
      ),
    ],
  );
  return [
    ...new Set(
      dataset.records.flatMap((record) => {
        const answerIndex = record.source.answerIndex;
        if (!Number.isInteger(answerIndex)) return [];
        const answer = record.source.exactChoices[answerIndex];
        const normalized = normalize(answer);
        if (normalized.length < 32 || existingChoiceTexts.has(normalized)) return [];
        return [answer];
      }),
    ),
  ];
}

async function exists(target) {
  return access(target).then(
    () => true,
    () => false,
  );
}

async function walk(directory) {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(target) : [target];
      }),
    )
  ).flat();
}

function relative(target) {
  return path.relative(root, target).replaceAll("\\", "/");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
