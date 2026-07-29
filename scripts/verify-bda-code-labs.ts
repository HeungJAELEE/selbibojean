import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { bdaCodeLabs } from "../src/data/source/bda-practical-content";

const python = process.env.BDA_PYTHON ?? "python";
const errors: string[] = [];

function runPython(args: string[], cwd?: string) {
  return spawnSync(python, args, {
    cwd,
    encoding: "utf8",
    timeout: 120_000,
  });
}

const version = runPython(["--version"]);
if (version.error || version.status !== 0) {
  throw new Error(
    `Python runtime unavailable: ${version.error?.message ?? version.stderr}`,
  );
}

const runtimeFixtures: Record<string, Record<string, string>> = {
  "exam-runtime-check": {},
  "pandas-filter-sort": {
    "data.csv": [
      "id,age,status,score",
      "1,31,active,88",
      "2,44,active,91",
      "3,30,active,91",
      "4,51,inactive,99",
      "5,37,active,73",
      "6,29,active,100",
      "7,60,active,82",
      "8,48,active,79",
    ].join("\n"),
  },
  "merge-pivot-reshape": {
    "orders.csv": [
      "customer_id,month,sales",
      "1,1,100",
      "2,1,200",
      "1,2,150",
      "3,2,50",
    ].join("\n"),
    "customers.csv": [
      "customer_id,region",
      "1,서울",
      "2,부산",
      "3,서울",
    ].join("\n"),
  },
  "classification-pipeline": {
    "train.csv": [
      "id,target,age,income,segment",
      ...Array.from({ length: 40 }, (_, index) => {
        const target = index % 2;
        return `${index + 1},${target},${22 + (index % 25)},${3000 + index * 120},${target ? "B" : "A"}`;
      }),
    ].join("\n"),
  },
  "model-metric-audit": {},
  "mean-tests": {
    "data.csv": [
      "score,before,after,group",
      "65,60,64,A",
      "68,62,66,A",
      "71,68,72,A",
      "74,70,75,A",
      "77,73,78,A",
      "80,75,82,A",
      "72,66,71,B",
      "75,69,74,B",
      "78,72,79,B",
      "81,76,83,B",
      "84,79,85,B",
      "87,82,88,B",
    ].join("\n"),
  },
  "submission-single-column-audit": {
    "train.csv": [
      "id,target,age,income,segment",
      ...Array.from({ length: 30 }, (_, index) => {
        const target = index % 2;
        return `${index + 1},${target},${25 + (index % 20)},${2800 + index * 150},${target ? "B" : "A"}`;
      }),
    ].join("\n"),
    "test.csv": [
      "id,age,income,segment",
      "101,31,3900,A",
      "102,42,5200,B",
      "103,36,4500,A",
    ].join("\n"),
  },
};

const tempRoot = await mkdtemp(path.join(tmpdir(), "bda-code-labs-"));

try {
  for (const lab of bdaCodeLabs) {
    if (
      !lab.inputSchema.length ||
      !lab.preCodeChecks.length ||
      !lab.conceptIds.length ||
      lab.steps.length < 4 ||
      lab.traps.length < 3 ||
      lab.expected.length < 3
    ) {
      errors.push(`${lab.id}: incomplete learning contract`);
    }

    const labDirectory = path.join(tempRoot, lab.id);
    await mkdir(labDirectory, { recursive: true });
    const codePath = path.join(labDirectory, `${lab.id}.py`);
    await writeFile(codePath, `${lab.code}\n`, "utf8");

    const syntax = runPython(
      [
        "-c",
        "import ast,pathlib,sys; ast.parse(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))",
        codePath,
      ],
      labDirectory,
    );
    if (syntax.error || syntax.status !== 0) {
      errors.push(
        `${lab.id}: Python syntax failed: ${syntax.error?.message ?? syntax.stderr}`,
      );
      continue;
    }

    const fixture = runtimeFixtures[lab.id];
    if (fixture) {
      for (const [fileName, content] of Object.entries(fixture)) {
        await writeFile(path.join(labDirectory, fileName), `${content}\n`, "utf8");
      }
      const runtime = runPython([codePath], labDirectory);
      if (runtime.error || runtime.status !== 0) {
        errors.push(
          `${lab.id}: runtime fixture failed: ${runtime.error?.message ?? runtime.stderr}`,
        );
      }
      if (lab.validation.status !== "runtime-verified") {
        errors.push(`${lab.id}: runtime fixture exists but status is not runtime-verified`);
      }
    } else if (lab.validation.status !== "syntax-verified") {
      errors.push(`${lab.id}: expected syntax-verified status`);
    }
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

if (errors.length) {
  throw new Error(`BDA code-lab verification failed:\n- ${errors.join("\n- ")}`);
}

console.log(
  `BDA code labs PASS: ${bdaCodeLabs.length} syntax-verified, ${Object.keys(runtimeFixtures).length} runtime fixtures, Python ${`${version.stdout}${version.stderr}`.trim()}.`,
);
