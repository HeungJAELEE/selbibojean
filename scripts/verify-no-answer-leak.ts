import { createHash } from "node:crypto";
import {
  access,
  readFile,
  readdir,
  stat,
} from "node:fs/promises";
import path from "node:path";
import practicalContent from "../src/data/generated/practical-content.json";
import writtenContent from "../src/data/generated/content.json";
import {
  findForbiddenPreSubmitFields,
  normalizeAnswerSentinel,
  uniqueAnswerSentinels,
} from "../src/lib/security/answer-leak";
import {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "../src/lib/domain/practical";
import type { PracticalContent } from "../src/lib/domain/practical-types";

type VerificationScope = "source" | "build" | "all";
type Finding = {
  code: string;
  file: string;
  detail: string;
};

const root = process.cwd();
const scopeArgument = process.argv.find((argument) =>
  argument.startsWith("--scope="),
);
const scope = (scopeArgument?.split("=")[1] ?? "all") as VerificationScope;
if (!["source", "build", "all"].includes(scope)) {
  throw new Error(`Unknown answer-leak verification scope: ${scope}`);
}

const findings: Finding[] = [];
const textExtensions = new Set([".js", ".mjs", ".cjs", ".json"]);
const manifestNamePattern = /(answer|solution|rubric|grading).*\.(json|js)$/i;
const forbiddenImportPattern =
  /from\s+["'][^"']*(practical-repository|generated\/practical-content\.json|generated\/practical-written-governance\.json|server-answer)[^"']*["']/;
const unsafeCodePatterns = [
  { code: "dynamic_eval", value: "eval" + "(" },
  { code: "dynamic_function", value: "new " + "Function(" },
  { code: "dynamic_function", value: "Function" + "(" },
];

async function exists(target: string) {
  return access(target).then(
    () => true,
    () => false,
  );
}

async function walk(directory: string): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    }),
  );
  return files.flat();
}

function relative(target: string) {
  return path.relative(root, target).replaceAll("\\", "/");
}

function sentinelId(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

async function scanJsonFile(file: string) {
  const raw = await readFile(file, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  for (const finding of findForbiddenPreSubmitFields(parsed)) {
    findings.push({
      code: "forbidden_public_field",
      file: relative(file),
      detail: `${finding.field} at ${finding.path}`,
    });
  }
}

async function verifySourceContracts(content: PracticalContent) {
  for (const question of content.questions.filter(
    isPublishablePracticalQuestion,
  )) {
    const publicQuestion = toPublicPracticalQuestion(question);
    for (const finding of findForbiddenPreSubmitFields(publicQuestion)) {
      findings.push({
        code: "pre_submit_dto_leak",
        file: `question:${question.id}`,
        detail: finding.field,
      });
    }
  }

  const publicFiles = await walk(path.join(root, "public"));
  for (const file of publicFiles) {
    if (manifestNamePattern.test(path.basename(file))) {
      findings.push({
        code: "public_answer_manifest",
        file: relative(file),
        detail: "answer-like manifest path",
      });
    }
    if (path.extname(file) === ".json") await scanJsonFile(file);
  }
  if (await exists(path.join(root, "public", "data"))) {
    findings.push({
      code: "server_answer_asset_in_public",
      file: "public/data",
      detail: "server runtime content must not remain under public/",
    });
  }

  const sourceFiles = [
    ...(await walk(path.join(root, "src"))),
    ...(await walk(path.join(root, "scripts"))),
  ].filter((file) => [".ts", ".tsx", ".mjs"].includes(path.extname(file)));
  for (const file of sourceFiles) {
    if (relative(file) === "scripts/verify-no-answer-leak.ts") continue;
    const source = await readFile(file, "utf8");
    if (
      source.includes('"use client"') &&
      forbiddenImportPattern.test(source)
    ) {
      findings.push({
        code: "client_imports_server_answers",
        file: relative(file),
        detail: "client component imports a server-only answer owner",
      });
    }
    for (const pattern of unsafeCodePatterns) {
      if (source.includes(pattern.value)) {
        findings.push({
          code: pattern.code,
          file: relative(file),
          detail: "dynamic code execution is forbidden",
        });
      }
    }
  }
}

async function verifyClientBuild(content: PracticalContent) {
  const clientDirectory = path.join(root, "dist", "client");
  if (!(await exists(clientDirectory))) {
    findings.push({
      code: "client_build_missing",
      file: "dist/client",
      detail: "run npm run build before full answer-leak verification",
    });
    return;
  }
  const clientFiles = (await walk(clientDirectory)).filter((file) =>
    textExtensions.has(path.extname(file)),
  );
  for (const file of clientFiles) {
    if (manifestNamePattern.test(path.basename(file))) {
      findings.push({
        code: "client_answer_manifest",
        file: relative(file),
        detail: "answer-like manifest path",
      });
    }
    if (path.extname(file) === ".json") await scanJsonFile(file);
  }

  const sentinels = uniqueAnswerSentinels(
    [
      ...content.questions.flatMap((question) => [
        question.modelAnswer,
        ...question.acceptedAnswers,
        ...question.calculation,
      ]),
      ...writtenContent.questions.flatMap((question) => [
        question.answerText,
        question.explanation,
      ]),
    ],
  );
  for (const file of clientFiles) {
    const fileStats = await stat(file);
    if (fileStats.size > 25_000_000) continue;
    const normalized = normalizeAnswerSentinel(await readFile(file, "utf8"));
    for (const sentinel of sentinels) {
      if (normalized.includes(sentinel)) {
        findings.push({
          code: "answer_sentinel_in_client",
          file: relative(file),
          detail: `question answer sentinel ${sentinelId(sentinel)}`,
        });
      }
    }
  }
}

const content = practicalContent as PracticalContent;
if (scope === "source" || scope === "all") {
  await verifySourceContracts(content);
}
if (scope === "build" || scope === "all") {
  await verifyClientBuild(content);
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(
      `FAIL [${finding.code}] ${finding.file}: ${finding.detail}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log(
    `PASS: 답안 유출 검사 완료 (${scope}; 공개 DTO·JSON·클라이언트 번들·동적 코드 실행).`,
  );
}
