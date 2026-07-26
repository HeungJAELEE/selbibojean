import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  PracticalExamEvidence,
  PracticalExamEvidenceFormat,
  PracticalWrittenCoverageItem,
  PracticalWrittenGovernanceHold,
  PracticalWrittenGovernanceManifest,
} from "../src/lib/domain/practical-execution-types";
import type {
  PracticalContent,
  PracticalQuestion,
  PracticalStudyCategoryId,
} from "../src/lib/domain/practical-types";
import { isPublishablePracticalQuestion } from "../src/lib/domain/practical";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "src",
  "data",
  "generated",
  "practical-content.json",
);
const outputPath = path.join(
  root,
  "src",
  "data",
  "generated",
  "practical-written-governance.json",
);

const categoryFormat: Record<
  PracticalStudyCategoryId,
  PracticalExamEvidenceFormat
> = {
  visual_identification: "image",
  formula_calculation: "calculation",
  theory_concept: "definition",
  work_procedure: "sequence",
};

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function questionFormats(question: PracticalQuestion) {
  const text = `${question.title} ${question.formatLabel} ${question.stem}`;
  const formats: PracticalExamEvidenceFormat[] = [
    categoryFormat[question.primaryStudyCategoryId],
  ];
  if (/도면/.test(text)) formats.push("drawing");
  if (/기호/.test(text)) formats.push("symbol");
  if (/계산|구하/.test(text)) formats.push("calculation");
  if (/순서|절차/.test(text)) formats.push("sequence");
  if (/연결|매칭|짝/.test(text)) formats.push("matching");
  if (/고장|원인|진단|대책/.test(text)) formats.push("diagnosis");
  return unique(formats);
}

function occurrenceQuestionNumber(value: string) {
  const matched = value.match(/\d+/);
  return matched ? Number(matched[0]) : null;
}

function reconstructionConfidence(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "A") return "high" as const;
  if (normalized === "B" || normalized === "C") return "medium" as const;
  return "held" as const;
}

function evidenceForQuestion(
  question: PracticalQuestion,
  content: PracticalContent,
): PracticalExamEvidence {
  const occurrence = question.occurrence;
  return {
    id: `evidence:${question.id}`,
    status:
      question.kind === "past" ? "past_reconstructed" : "predicted_related",
    variantOfEvidenceId: null,
    conceptIds: unique(question.conceptIds),
    taskIds: [],
    questionIds: [question.id],
    sessions:
      question.kind === "past" && occurrence
        ? [
            {
              year: occurrence.year,
              round: occurrence.round,
              questionNo: occurrenceQuestionNumber(
                occurrence.questionNumber,
              ),
              sourceType: occurrence.sourceType.includes("공식")
                ? "official"
                : "blog_reconstruction",
              confidence: reconstructionConfidence(
                occurrence.reconstructionConfidence,
              ),
              sourceUrl: occurrence.sourceUrl || null,
              sourceArtifactId: `practical-source:${content.report.sourceSha256}`,
              sourceFileHash: content.report.sourceSha256,
              capturedAt: content.report.generatedAt,
            },
          ]
        : [],
    formats: questionFormats(question),
    learningKeywords: unique([
      question.title,
      question.formatLabel,
      ...question.conceptIds,
    ]).filter(Boolean),
    gradingRequiredKeywords: unique(question.requiredKeywords),
  };
}

function supplementalEvidence(content: PracticalContent) {
  return content.concepts
    .filter((concept) => concept.contentRole === "supplemental")
    .map<PracticalExamEvidence>((concept) => ({
      id: `evidence:ncs-supplement:${concept.id}`,
      status: "ncs_supplement",
      variantOfEvidenceId: null,
      conceptIds: [concept.id],
      taskIds: [],
      questionIds: unique(concept.relatedPredictedQuestionIds),
      sessions: [],
      formats: unique(
        concept.relatedPredictedQuestionIds
          .map((questionId) =>
            content.questions.find((question) => question.id === questionId),
          )
          .filter((question): question is PracticalQuestion => Boolean(question))
          .flatMap(questionFormats),
      ),
      learningKeywords: unique([
        concept.title,
        ...concept.requiredKeywords,
      ]),
      gradingRequiredKeywords: [],
    }));
}

function holdDisposition(
  disposition: string,
): PracticalWrittenGovernanceHold["disposition"] {
  if (
    disposition === "held_asset_missing" ||
    disposition === "held_source_missing" ||
    disposition === "held_answer_conflict" ||
    disposition === "held_visual_asset" ||
    disposition === "held_source_or_standard"
  ) {
    return disposition;
  }
  return "held_source_missing";
}

function questionHold(
  question: PracticalQuestion,
): PracticalWrittenGovernanceHold {
  const disposition = holdDisposition(question.auditDisposition);
  const fallback =
    disposition === "held_asset_missing"
      ? "정답 판정에 필요한 원본 이미지가 확인되지 않았다."
      : disposition === "held_answer_conflict"
        ? "복원답과 기술 근거의 충돌이 해결되지 않았다."
        : "공개 정답을 확정할 신뢰 가능한 원문 근거가 부족하다.";
  return {
    id: `hold:question:${question.id}`,
    sourceKind: "question",
    sourceId: question.id,
    disposition,
    rationale: question.reviewNote.trim() || fallback,
    nextAction:
      disposition === "held_asset_missing"
        ? "NCS 원문 페이지·그림번호와 시험 캡처의 정답 결정요소를 대조한다."
        : disposition === "held_answer_conflict"
          ? "상위 공식 근거 또는 독립 전문자료로 답안 충돌을 재검수한다."
          : "NCS·Q-Net·공식 기술자료에서 직접 근거를 추가 확보한다.",
  };
}

function coverageItems(content: PracticalContent): PracticalWrittenCoverageItem[] {
  const publicQuestions = content.questions.filter(
    isPublishablePracticalQuestion,
  );
  return content.ncsCoverage.documents.map((document) => {
    const visualAids = content.visualAids.filter(
      (visualAid) => visualAid.ncsCode === document.ncsCode,
    );
    const publicVisualIds = visualAids
      .filter((visualAid) => visualAid.publicUseStatus === "public")
      .map((visualAid) => visualAid.id);
    const heldVisual = document.heldItems.some(
      (item) => item.disposition === "held_visual_asset",
    );
    const assessmentIds = publicQuestions
      .filter((question) =>
        question.ncsSources.some(
          (source) => source.ncsCode === document.ncsCode,
        ),
      )
      .map((question) => question.id);
    const heldAssessment = content.questions.some(
      (question) =>
        !isPublishablePracticalQuestion(question) &&
        question.ncsSources.some(
          (source) => source.ncsCode === document.ncsCode,
        ),
    );

    return {
      id: `coverage:ncs:${document.ncsCode}`,
      ncsCode: document.ncsCode,
      documentTitle: document.documentTitle,
      deliverables: [
        {
          kind: "theory",
          status: document.conceptIds.length > 0 ? "published" : "held",
          linkedIds: unique(document.conceptIds),
          disposition:
            document.conceptIds.length > 0 ? null : "held_source_or_standard",
          rationale:
            document.conceptIds.length > 0
              ? "NCS 원문 위치와 연결된 필답형 개념을 공개한다."
              : "연결 가능한 필답형 개념이 아직 검증되지 않았다.",
          nextAction:
            document.conceptIds.length > 0
              ? null
              : "NCS 수행내용과 기존 필답형 개념의 직접 연결을 검수한다.",
        },
        publicVisualIds.length > 0
          ? {
              kind: "visual",
              status: "published",
              linkedIds: unique(publicVisualIds),
              disposition: null,
              rationale: "출처·그림번호·이용조건이 확인된 NCS 시각자료다.",
              nextAction: null,
            }
          : {
              kind: "visual",
              status: heldVisual ? "held" : "draft",
              linkedIds: [],
              disposition: heldVisual ? "held_visual_asset" : null,
              rationale: heldVisual
                ? "원본 그림 또는 공개 이용조건 검증이 남아 있다."
                : "필답 판단에 필요한 공개 시각자료가 아직 연결되지 않았다.",
              nextAction:
                "NCS 원문 페이지·그림번호·권리상태를 확인한 뒤 별도 승인한다.",
            },
        assessmentIds.length > 0
          ? {
              kind: "assessment",
              status: "published",
              linkedIds: unique(assessmentIds),
              disposition: null,
              rationale: "검증 완료된 필답형 기출복원 또는 출제예상 문제다.",
              nextAction: null,
            }
          : {
              kind: "assessment",
              status: heldAssessment ? "held" : "draft",
              linkedIds: [],
              disposition: heldAssessment ? "needs_source" : null,
              rationale: heldAssessment
                ? "연결 문제는 있으나 정답·자산·출처 검수가 끝나지 않았다."
                : "필답형 문제 연결이 아직 없다.",
              nextAction:
                "필답형 원문 근거와 답안 검수를 마친 문제만 연결한다.",
            },
        {
          kind: "task",
          status: "not_applicable",
          linkedIds: [],
          disposition: null,
          rationale:
            "이번 단계는 필답형 전용이며 공유압·유압·용접 작업형 과제는 사용자 지시에 따라 제외한다.",
          nextAction: null,
        },
        {
          kind: "record",
          status: "not_applicable",
          linkedIds: [],
          disposition: null,
          rationale:
            "이번 단계는 필답형 Evidence·Coverage 정리이며 작업 수행기록은 생성하지 않는다.",
          nextAction: null,
        },
      ],
    };
  });
}

const content = JSON.parse(
  await readFile(sourcePath, "utf8"),
) as PracticalContent;
const evidence = [
  ...content.questions.map((question) =>
    evidenceForQuestion(question, content),
  ),
  ...supplementalEvidence(content),
];
const coverage = coverageItems(content);
const holds: PracticalWrittenGovernanceHold[] = [
  ...content.questions
    .filter((question) => question.auditDisposition.startsWith("held_"))
    .map(questionHold),
  ...content.ncsCoverage.documents.flatMap((document) =>
    document.heldItems
      .filter(
        (item) =>
          item.disposition === "held_visual_asset" ||
          item.disposition === "held_source_or_standard",
      )
      .map((item) => ({
        id: `hold:ncs:${item.id}`,
        sourceKind: "ncs_coverage" as const,
        sourceId: item.id,
        disposition: holdDisposition(item.disposition),
        rationale: item.rationale,
        nextAction: item.nextAction,
      })),
  ),
];

const statusCount = (status: PracticalExamEvidence["status"]) =>
  evidence.filter((item) => item.status === status).length;
const coverageLinks = (
  kind: "theory" | "visual" | "assessment" | "task" | "record",
) =>
  coverage
    .flatMap((item) => item.deliverables)
    .filter((deliverable) => deliverable.kind === kind)
    .reduce((total, deliverable) => total + deliverable.linkedIds.length, 0);

const manifest: PracticalWrittenGovernanceManifest = {
  formatVersion: 1,
  generatedAt: content.report.generatedAt,
  sourceSha256: content.report.sourceSha256,
  scope: "practical_written_only",
  evidence,
  coverage,
  holds,
  report: {
    evidence: {
      pastReconstructed: statusCount("past_reconstructed"),
      pastVariant: statusCount("past_variant"),
      predictedRelated: statusCount("predicted_related"),
      ncsSupplement: statusCount("ncs_supplement"),
    },
    publication: {
      past: content.report.publication.past,
      predicted: content.report.publication.predicted,
      held: content.report.publication.held,
    },
    coverage: {
      ncsDocuments: coverage.length,
      publishedTheoryLinks: coverageLinks("theory"),
      publishedAssessmentLinks: coverageLinks("assessment"),
      publishedVisualLinks: coverageLinks("visual"),
      excludedTaskDeliverables: coverage.filter((item) =>
        item.deliverables.some(
          (deliverable) =>
            deliverable.kind === "task" &&
            deliverable.status === "not_applicable",
        ),
      ).length,
      excludedRecordDeliverables: coverage.filter((item) =>
        item.deliverables.some(
          (deliverable) =>
            deliverable.kind === "record" &&
            deliverable.status === "not_applicable",
        ),
      ).length,
    },
  },
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `PASS: 필답 Evidence ${evidence.length}개, NCS Coverage ${coverage.length}개, 보류 ${holds.length}개를 생성했습니다.`,
);
