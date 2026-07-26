import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  PracticalCoverageEntityRegistry,
  PracticalWrittenGovernanceManifest,
} from "../src/lib/domain/practical-execution-types";
import type { PracticalContent } from "../src/lib/domain/practical-types";
import { isPublishablePracticalQuestion } from "../src/lib/domain/practical";
import {
  countPracticalActualOccurrences,
  validatePracticalCoverageDeliverables,
  validatePracticalExamEvidenceGraph,
} from "../src/lib/validation/practical-execution";
import { PRACTICAL_WRITTEN_AUDIT_DECISIONS } from "../src/data/source/practical-written-audit-decisions";

const root = process.cwd();
const [content, manifest] = await Promise.all([
  readFile(
    path.join(root, "src/data/generated/practical-content.json"),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalContent),
  readFile(
    path.join(
      root,
      "src/data/generated/practical-written-governance.json",
    ),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalWrittenGovernanceManifest),
]);
const errors: string[] = [];
const questionIds = new Set(content.questions.map((question) => question.id));
const conceptIds = new Set(content.concepts.map((concept) => concept.id));
const visualIds = new Set(content.visualAids.map((visualAid) => visualAid.id));

if (manifest.scope !== "practical_written_only") {
  errors.push("필답형 전용 범위 표기가 누락되었습니다.");
}
if (manifest.sourceSha256 !== content.report.sourceSha256) {
  errors.push("필답 Governance 매니페스트가 현재 원본과 일치하지 않습니다.");
}

for (const issue of validatePracticalExamEvidenceGraph(manifest.evidence)) {
  errors.push(`Evidence ${issue.entityId}: ${issue.code}`);
}
for (const evidence of manifest.evidence) {
  if (evidence.taskIds.length > 0) {
    errors.push(`작업형 과제 연결 금지 위반: ${evidence.id}`);
  }
  if (evidence.questionIds.some((id) => !questionIds.has(id))) {
    errors.push(`존재하지 않는 필답 문제 연결: ${evidence.id}`);
  }
  if (evidence.conceptIds.some((id) => !conceptIds.has(id))) {
    errors.push(`존재하지 않는 필답 개념 연결: ${evidence.id}`);
  }
  const questionId = evidence.questionIds[0];
  const decision = questionId
    ? PRACTICAL_WRITTEN_AUDIT_DECISIONS[questionId]
    : undefined;
  if (
    decision?.disposition === "cbt_corrected" &&
    evidence.sourceRefs.length < 2
  ) {
    errors.push(`CBT 교정 근거가 부족합니다: ${evidence.id}`);
  }
}

const expectedEvidence = {
  pastReconstructed: content.report.rows.past,
  pastVariant: 0,
  predictedRelated: content.report.rows.predicted,
  ncsSupplement: content.report.rows.supplementalConcepts,
};
if (JSON.stringify(manifest.report.evidence) !== JSON.stringify(expectedEvidence)) {
  errors.push("필답 Evidence 상태별 수량이 원본과 다릅니다.");
}
if (countPracticalActualOccurrences(manifest.evidence) !== content.report.rows.past) {
  errors.push("기출복원 출제횟수에 예상·변형문제가 섞였습니다.");
}
if (
  manifest.report.publication.past !== content.report.publication.past ||
  manifest.report.publication.predicted !==
    content.report.publication.predicted ||
  manifest.report.publication.held !== content.report.publication.held
) {
  errors.push("필답 공개·보류 수량이 원본 보고서와 다릅니다.");
}

const registry: PracticalCoverageEntityRegistry = {
  theory: conceptIds,
  visual: visualIds,
  assessment: questionIds,
  task: new Set(),
  record: new Set(),
};
for (const item of manifest.coverage) {
  for (const issue of validatePracticalCoverageDeliverables(
    item.deliverables,
    registry,
  )) {
    errors.push(`Coverage ${item.id}: ${issue.code}`);
  }
  for (const kind of ["task", "record"] as const) {
    const deliverable = item.deliverables.find((entry) => entry.kind === kind);
    if (
      !deliverable ||
      deliverable.status !== "not_applicable" ||
      deliverable.linkedIds.length > 0
    ) {
      errors.push(`작업형 산출물 범위 제외 위반: ${item.id}/${kind}`);
    }
  }
}
if (manifest.coverage.length !== content.ncsCoverage.summary.totalDocuments) {
  errors.push("NCS 문서별 필답 Coverage 수가 일치하지 않습니다.");
}

const publicQuestionIds = new Set(
  content.questions
    .filter(isPublishablePracticalQuestion)
    .map((question) => question.id),
);
const publishedAssessmentIds = new Set(
  manifest.coverage.flatMap((item) =>
    item.deliverables
      .filter(
        (deliverable) =>
          deliverable.kind === "assessment" &&
          deliverable.status === "published",
      )
      .flatMap((deliverable) => deliverable.linkedIds),
  ),
);
if (
  [...publishedAssessmentIds].some((id) => !publicQuestionIds.has(id))
) {
  errors.push("보류 필답 문제가 published Coverage에 연결되었습니다.");
}

const heldQuestionIds = new Set(
  content.questions
    .filter((question) => question.auditDisposition.startsWith("held_"))
    .map((question) => question.id),
);
const recordedHeldQuestionIds = new Set(
  manifest.holds
    .filter((hold) => hold.sourceKind === "question")
    .map((hold) => hold.sourceId),
);
if (
  heldQuestionIds.size !== recordedHeldQuestionIds.size ||
  [...heldQuestionIds].some((id) => !recordedHeldQuestionIds.has(id))
) {
  errors.push("필답 보류 문제 목록이 완전하지 않습니다.");
}

if (errors.length > 0) {
  errors.forEach((error) => console.error(`FAIL: ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `PASS: 필답 Evidence ${manifest.evidence.length}개, NCS Coverage ${manifest.coverage.length}개, 공개 ${manifest.report.publication.past + manifest.report.publication.predicted}개, 보류 ${manifest.report.publication.held}개.`,
  );
}
