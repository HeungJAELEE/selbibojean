import { execFileSync } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import type { GeneratedContent } from "../src/lib/domain/types";

const root = process.cwd();
const EXPECTED_SITE_ID = "appgprj_6a5cf5715fe4819189a1843f8cd3f749";
const REQUIRED_ROUTES = [
  "src/app/page.tsx",
  "src/app/written/theory/page.tsx",
  "src/app/written/practice/page.tsx",
  "src/app/written/review/page.tsx",
  "src/app/admin/review/welding-safety/page.tsx",
];

function fail(message: string): never {
  throw new Error(`배포 준비 검증 실패: ${message}`);
}

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8")) as T;
}

async function assertFile(relativePath: string) {
  await access(path.join(root, relativePath)).catch(() => fail(`필수 파일 누락: ${relativePath}`));
}

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { cwd: root })
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

for (const route of REQUIRED_ROUTES) await assertFile(route);
await assertFile("dist/server/index.js");
await assertFile("dist/.openai/hosting.json");
await assertFile("dist/server/wrangler.json");
await assertFile("dist/client/data/content-manifest.json");

const sourceHosting = await readJson<{ project_id?: string }>(".openai/hosting.json");
const builtHosting = await readJson<{ project_id?: string }>("dist/.openai/hosting.json");
if (sourceHosting.project_id !== EXPECTED_SITE_ID) {
  fail(`Sites project_id가 승인된 기존 프로젝트와 다름: ${String(sourceHosting.project_id)}`);
}
if (builtHosting.project_id !== sourceHosting.project_id) {
  fail("빌드 산출물의 hosting.json이 소스 설정과 다름");
}

const wrangler = await readJson<{
  assets?: { binding?: string; run_worker_first?: boolean | string[] };
}>("dist/server/wrangler.json");
if (wrangler.assets?.binding !== "ASSETS") fail("Cloudflare ASSETS 바인딩 누락");
const workerFirst = wrangler.assets?.run_worker_first;
if (
  workerFirst !== true
  && (!Array.isArray(workerFirst) || !workerFirst.includes("/data/*"))
) {
  fail("정답 데이터 경로 /data/*가 Worker 우선처리 대상으로 설정되지 않음");
}

const workerSource = await readFile(path.join(root, "worker", "index.ts"), "utf8");
if (!workerSource.includes('url.pathname.startsWith("/data/")')) {
  fail("Worker의 정적 정답 데이터 직접 접근 차단 로직 누락");
}

const contentPath = path.join(root, "src", "data", "generated", "content.json");
const contentSize = (await stat(contentPath)).size;
if (contentSize < 1_000_000) fail("생성 콘텐츠 원본이 비정상적으로 작음");

const tracked = trackedFiles();
const forbiddenTracked = tracked.filter((file) =>
  /(^|\/)\.env($|\.)/.test(file) && file !== ".env.example"
  || /\.(xlsx|xls|hwp)$/i.test(file)
  || file.startsWith("public/data/"),
);
if (forbiddenTracked.length) {
  fail(`민감 원본 또는 공개 금지 자산이 Git 추적 중: ${forbiddenTracked.join(", ")}`);
}

await access(path.join(root, "public", "data", "content-manifest.json"))
  .then(() => fail("정답 포함 가능 자산이 public/data에 남아 있음"))
  .catch((error: unknown) => {
    if (error instanceof Error && error.message.startsWith("배포 준비 검증 실패:")) throw error;
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  });

const clientDirectory = path.join(root, "dist", "client");
const clientFiles = execFileSync(
  process.platform === "win32" ? "powershell.exe" : "find",
  process.platform === "win32"
    ? [
        "-NoProfile",
        "-Command",
        `Get-ChildItem -LiteralPath '${clientDirectory.replaceAll("'", "''")}' -Recurse -File | ForEach-Object { $_.FullName }`,
      ]
    : [clientDirectory, "-type", "f"],
  { cwd: root },
)
  .toString("utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => /\.(?:js|json|html|txt)$/i.test(file))
  // dist/client/data는 Worker가 /data/* 요청을 선점해 외부 접근을 차단하는
  // 서버 런타임 자산이다. 실제 브라우저 번들·HTML의 누출만 별도로 검사한다.
  .filter((file) => !path.relative(clientDirectory, file).replaceAll("\\", "/").startsWith("data/"));

// 문제 ID는 클라이언트에 노출될 수 있지만 정답·해설 본문은 제출 전 번들에
// 포함되면 안 된다. 공개 문제에서 가장 길고 식별력이 높은 정답·해설 문자열을
// 표본으로 골라 정적 산출물 전체를 검사한다.
const baseContent = JSON.parse(await readFile(contentPath, "utf8")) as GeneratedContent;
const runtime = buildRuntimeContent(baseContent);
const sensitiveSamples = [
  ...runtime.questions
    .filter((question) => question.contentStatus === "published")
    .flatMap((question) => [question.answerText, question.explanation]),
]
  .map((value) => value.trim())
  .filter((value) => value.length >= 48)
  .sort((a, b) => b.length - a.length)
  .filter((value, index, values) => values.indexOf(value) === index)
  .slice(0, 40);

if (sensitiveSamples.length < 10) {
  fail("클라이언트 정답 비노출 검사에 필요한 식별 문자열 표본이 부족함");
}

const answerLeakFiles = new Set<string>();
for (const file of clientFiles) {
  const body = await readFile(file, "utf8");
  if (sensitiveSamples.some((sample) => body.includes(sample))) {
    answerLeakFiles.add(path.relative(root, file));
  }
}
if (answerLeakFiles.size) {
  fail(`정답·해설 문자열이 클라이언트 산출물에 포함됨: ${[...answerLeakFiles].join(", ")}`);
}

console.log(
  [
    "PASS: 배포 준비 정적 검증",
    `Sites project ${EXPECTED_SITE_ID}`,
    "정답 자산 /data/* 직접 접근 차단",
    "클라이언트 정답·해설 표본 비노출",
    "원본 엑셀·HWP·환경파일 Git 미추적",
  ].join(" · "),
);
