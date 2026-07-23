import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "../src/lib/domain/practice";
import type { GeneratedContent } from "../src/lib/domain/types";
import { parseWrittenQuestionAuditManifest } from "../src/lib/content/written-question-audit";

const contentUrl = new URL("../src/data/generated/content.json", import.meta.url);
const auditUrl = new URL(
  "../src/data/generated/written-question-audit.json",
  import.meta.url,
);
const outputUrl = new URL(
  "../docs/audit-work/written-question-audit-final-report.md",
  import.meta.url,
);

const base = JSON.parse(
  readFileSync(contentUrl, "utf8"),
) as GeneratedContent;
const runtime = buildRuntimeContent(base);
const audit = parseWrittenQuestionAuditManifest(
  JSON.parse(readFileSync(auditUrl, "utf8")),
);
const questionById = new Map(
  runtime.questions.map((question) => [question.id, question]),
);

const dispositions = [
  "verified",
  "cbt_corrected",
  "held_answer_conflict",
  "held_asset_missing",
  "held_source_missing",
] as const;
const dispositionLabels: Record<(typeof dispositions)[number], string> = {
  verified: "검증 완료",
  cbt_corrected: "CBT 정답 보정",
  held_answer_conflict: "정답 충돌 보류",
  held_asset_missing: "필수 이미지 누락",
  held_source_missing: "공식·제조사 근거 부족",
};

const subjectIds = [
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
] as const;
const subjectLabels: Record<(typeof subjectIds)[number], string> = {
  "subject-1": "제1과목 공유압 및 자동제어",
  "subject-2": "제2과목 용접 및 안전관리",
  "subject-3": "제3과목 기계설비 일반",
  "subject-4": "제4과목 설비진단 및 관리",
};

function count(
  subjectId: string,
  disposition: (typeof dispositions)[number],
) {
  return audit.entries.filter(
    (entry) =>
      questionById.get(entry.questionId)?.subjectId === subjectId &&
      entry.auditDisposition === disposition,
  ).length;
}

const heldSections = dispositions
  .filter((disposition) => disposition.startsWith("held_"))
  .map((disposition) => {
    const entries = audit.entries.filter(
      (entry) => entry.auditDisposition === disposition,
    );
    return [
      `### ${dispositionLabels[disposition]} · ${entries.length}문제`,
      "",
      entries
        .map(
          (entry) =>
            `- \`${entry.questionId}\` — ${entry.reviewNote} 다음 조치: ${entry.nextAction}`,
        )
        .join("\n"),
    ].join("\n");
  })
  .join("\n\n");

const subjectTable = [
  "| 과목 | 감사대상 | 검증완료 | CBT 보정 | 정답충돌 | 이미지누락 | 근거부족 |",
  "|---|---:|---:|---:|---:|---:|---:|",
  ...subjectIds.map((subjectId) => {
    const values = dispositions.map((disposition) =>
      count(subjectId, disposition),
    );
    return `| ${subjectLabels[subjectId]} | ${values.reduce((sum, value) => sum + value, 0)} | ${values[0]} | ${values[1]} | ${values[2]} | ${values[3]} | ${values[4]} |`;
  }),
].join("\n");

const publishedWelding = runtime.questions.filter(
  (question) =>
    question.id.startsWith("welding-safety-b33-") &&
    isPublishableQuestion(question),
).length;
const heldWelding = runtime.questions.filter(
  (question) =>
    question.id.startsWith("welding-safety-b33-") &&
    question.audit?.auditDisposition.startsWith("held_"),
).length;

const report = `# 필기 문제 직접 풀이·근거 감사 최종 보고서

검수일: ${audit.generatedAt}

## 결과

| 항목 | 수량 |
|---|---:|
| 고정 감사목록 | ${audit.entries.length} |
| 기존 검수대기 | ${audit.counts.reviewQueueAudited} |
| 고위험 공개문제 재감사 | ${audit.counts.highRiskPublicAudited} |
| 검증 완료 | ${audit.counts.verified} |
| CBT 정답 보정 | ${audit.counts.cbtCorrected} |
| 공개 보류 | ${audit.counts.held} |
| 런타임 공개 문제 | ${runtime.questions.filter(isPublishableQuestion).length} |
| 런타임 공개 레슨 | ${runtime.lessons.filter(isPublishableLesson).length} |
| 용접안전 공개/보류 | ${publishedWelding} / ${heldWelding} |

${subjectTable}

## 적용 원칙

- 저장소에 실제 존재하는 문제·보기만 검수했다.
- 정답, 전체 풀이, 네 선택지별 판정, 이론 연결, 근거 URL이 모두 확인된 문제만 공개했다.
- 그림·도면이 답에 필수인데 원본이 없으면 추정하지 않았다.
- 법령·표준·제조사 조건은 적용 범위를 확정하지 못하면 보류했다.
- 보류 문제는 검색·랜덤·모의고사·직접 문제 경로에서 차단한다.
- 답안과 해설은 제출 전 API 응답에 포함하지 않는다.

## 보류 상세

${heldSections}
`;

writeFileSync(fileURLToPath(outputUrl), report, "utf8");
process.stdout.write(
  `감사 보고서 생성: 검증 ${audit.counts.verified}, 보류 ${audit.counts.held}, 공개 문제 ${runtime.questions.filter(isPublishableQuestion).length}\n`,
);
