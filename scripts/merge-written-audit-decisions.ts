import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { GeneratedContent } from "../src/lib/domain/types";
import {
  parseWrittenQuestionAuditManifest,
  type WrittenQuestionAuditEntry,
} from "../src/lib/content/written-question-audit";
import { mergeApprovedWeldingProcessContent } from "../src/lib/content/welding-process-approved";
import { mergeApprovedWeldingSafetyContent } from "../src/lib/content/welding-safety-approved";
import { normalizeCanonicalTaxonomy } from "../src/lib/content/taxonomy-normalization";

type ReviewFeedback = {
  choiceId?: string;
  choiceIndex?: number;
  verdict: "correct" | "incorrect";
  rationale: string;
};

type ReviewEntry = {
  questionId: string;
  proposedDisposition: WrittenQuestionAuditEntry["auditDisposition"];
  cbtAnswer: string | null;
  verifiedAnswer: string | null;
  evidenceLevel: string | null;
  evidenceUrls: string[];
  rationale: string;
  choiceFeedback: ReviewFeedback[];
  reviewNote: string;
  nextAction: string;
  assetStatus: WrittenQuestionAuditEntry["assetStatus"];
};

type ReviewFile = {
  generatedAt?: string;
  entries: ReviewEntry[];
};

const reviewUrls = [
  new URL("../docs/audit-work/subject12-review.json", import.meta.url),
  new URL("../docs/audit-work/subject34-review.json", import.meta.url),
  new URL("../docs/audit-work/welding-safety-review.json", import.meta.url),
];
const decisionsUrl = new URL(
  "../src/data/generated/written-question-audit-decisions.json",
  import.meta.url,
);
const manifestUrl = new URL(
  "../src/data/generated/written-question-audit.json",
  import.meta.url,
);
const sourceUrl = new URL("../src/data/generated/content.json", import.meta.url);

const manifest = parseWrittenQuestionAuditManifest(
  JSON.parse(readFileSync(manifestUrl, "utf8")),
);
const source = JSON.parse(
  readFileSync(sourceUrl, "utf8"),
) as GeneratedContent;
const content = mergeApprovedWeldingProcessContent(
  mergeApprovedWeldingSafetyContent(normalizeCanonicalTaxonomy(source)),
);
const questionById = new Map(
  content.questions.map((question) => [question.id, question]),
);
const auditedIds = new Set(
  manifest.entries.map((entry) => entry.questionId),
);

function normalizeEvidenceLevel(
  level: string | null,
): WrittenQuestionAuditEntry["evidenceLevel"] {
  if (!level) return null;
  if (level === "dual_secondary") return "dual_secondary";
  if (
    level === "official_primary" ||
    level === "manufacturer_primary" ||
    level === "primary"
  ) {
    return "primary";
  }
  throw new Error(`지원하지 않는 근거 등급입니다: ${level}`);
}

function normalizeAnswerText(value: string | null) {
  return value?.replace(/^[①②③④]\s*/, "").trim() ?? null;
}

function cleanRationale(value: string) {
  return value
    .replace(
      /\s*The four options were checked against[\s\S]*$/,
      "",
    )
    .replace(
      /\s*The CBT wording and the cited higher-level technical source support the stored answer\.[\s\S]*$/,
      "",
    )
    .replace(
      /^This option conflicts with the controlling safety action:\s*/,
      "이 보기는 핵심 안전조치와 반대됩니다. ",
    )
    .trim();
}

function reviewCopy(
  disposition: WrittenQuestionAuditEntry["auditDisposition"],
  reviewNote: string,
  nextAction: string,
) {
  if (disposition === "verified") {
    return {
      reviewNote:
        "정답·풀이·네 선택지를 공식·표준·제조사 또는 독립 기술근거와 대조해 공개 승인했습니다.",
      nextAction: "근거 개정 여부를 정기적으로 재검토합니다.",
    };
  }
  if (disposition === "cbt_corrected") {
    return {
      reviewNote:
        "CBT 공개답과 상위 기술근거가 달라 검증 답으로 보정했습니다.",
      nextAction:
        "답안 제출 후 CBT 공개답과 검증 답의 차이 및 근거를 함께 표시합니다.",
    };
  }
  if (disposition === "held_asset_missing") {
    return {
      reviewNote:
        reviewNote ||
        "정답 판정에 필요한 원문 그림·도면을 확보하지 못했습니다.",
      nextAction:
        nextAction ||
        "원문 시각자료를 확보해 보기와 정답을 다시 대조합니다.",
    };
  }
  if (disposition === "held_answer_conflict") {
    return {
      reviewNote:
        reviewNote ||
        "CBT 공개답과 기술근거 또는 단일선택 문제 구조 사이의 충돌이 남았습니다.",
      nextAction:
        nextAction ||
        "상위 근거 또는 복수정답 구조를 확보하기 전까지 공개하지 않습니다.",
    };
  }
  return {
    reviewNote:
      reviewNote ||
      "법령·표준·제조사 조건을 확정할 신뢰 가능한 근거가 부족합니다.",
    nextAction:
      nextAction ||
      "적용 장비와 조건에 맞는 공식 또는 제조사 근거를 확보합니다.",
  };
}

const decisionByQuestionId = new Map<
  string,
  Partial<WrittenQuestionAuditEntry> &
    Pick<WrittenQuestionAuditEntry, "questionId" | "auditDisposition">
>();
let latestGeneratedAt = "2026-07-24T00:00:00.000Z";

for (const reviewUrl of reviewUrls) {
  if (!existsSync(reviewUrl)) continue;

  const review = JSON.parse(
    readFileSync(reviewUrl, "utf8"),
  ) as ReviewFile;
  if (review.generatedAt) {
    const normalized = new Date(review.generatedAt).toISOString();
    if (normalized > latestGeneratedAt) latestGeneratedAt = normalized;
  }

  for (const item of review.entries) {
    if (!auditedIds.has(item.questionId)) {
      throw new Error(
        `고정 감사목록에 없는 검수 결과입니다: ${item.questionId}`,
      );
    }
    const question = questionById.get(item.questionId);
    if (!question) {
      throw new Error(`문제를 찾을 수 없습니다: ${item.questionId}`);
    }
    if (item.choiceFeedback.length !== 4) {
      throw new Error(
        `${item.questionId}의 선택지 해설은 정확히 4개여야 합니다.`,
      );
    }
    const normalizedFeedback = item.choiceFeedback.map(
      (feedback, index) => {
        const choice =
          (feedback.choiceId
            ? question.choices.find(
                (candidate) => candidate.id === feedback.choiceId,
              )
            : undefined) ??
          question.choices[
            typeof feedback.choiceIndex === "number"
              ? feedback.choiceIndex
              : index
          ];
        if (!choice) {
          throw new Error(
            `${item.questionId}의 ${index + 1}번 선택지 해설을 현재 선택지와 연결할 수 없습니다.`,
          );
        }
        return {
          choiceId: choice.id,
          verdict: feedback.verdict,
          rationale: cleanRationale(feedback.rationale),
        };
      },
    );
    const feedbackIds = new Set(
      normalizedFeedback.map((feedback) => feedback.choiceId),
    );
    if (
      question.choices.some((choice) => !feedbackIds.has(choice.id)) ||
      feedbackIds.size !== question.choices.length
    ) {
      throw new Error(
        `${item.questionId}의 선택지 해설 ID가 현재 문제와 일치하지 않습니다.`,
      );
    }

    const accepted =
      item.proposedDisposition === "verified" ||
      item.proposedDisposition === "cbt_corrected";
    const matchingChoice = accepted
      ? question.choices.find(
          (choice) =>
            choice.text.trim() ===
            normalizeAnswerText(item.verifiedAnswer),
        )
      : undefined;
    if (accepted && !matchingChoice) {
      throw new Error(
        `${item.questionId}의 검증 정답이 현재 선택지에 없습니다: ${item.verifiedAnswer}`,
      );
    }
    const correctVerdicts = normalizedFeedback.filter(
      (feedback) => feedback.verdict === "correct",
    );
    if (
      accepted &&
      (correctVerdicts.length !== 1 ||
        correctVerdicts[0].choiceId !== matchingChoice?.id)
    ) {
      throw new Error(
        `${item.questionId}의 검증 정답과 선택지별 판정이 일치하지 않습니다.`,
      );
    }

    const copy = reviewCopy(
      item.proposedDisposition,
      item.reviewNote,
      item.nextAction,
    );
    decisionByQuestionId.set(item.questionId, {
      questionId: item.questionId,
      auditDisposition: item.proposedDisposition,
      evidenceLevel: accepted
        ? normalizeEvidenceLevel(item.evidenceLevel)
        : null,
      cbtAnswer: item.cbtAnswer,
      verifiedAnswer: accepted
        ? normalizeAnswerText(item.verifiedAnswer)
        : null,
      evidenceUrls: item.evidenceUrls,
      reviewNote: copy.reviewNote,
      nextAction: copy.nextAction,
      assetStatus: item.assetStatus,
      reviewRationale: accepted
        ? cleanRationale(item.rationale)
        : undefined,
      reviewChoiceFeedback: accepted
        ? normalizedFeedback
        : undefined,
      reviewedAt: latestGeneratedAt,
    });
  }
}

const entries = [...decisionByQuestionId.values()];

writeFileSync(
  fileURLToPath(decisionsUrl),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      reviewedAt: latestGeneratedAt,
      entries: entries.sort((left, right) =>
        left.questionId.localeCompare(right.questionId, "en", {
          numeric: true,
        }),
      ),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

process.stdout.write(
  `감사 결정 ${entries.length}건을 병합했습니다 (${reviewUrls.filter((url) => existsSync(url)).length}개 검수 파일).\n`,
);
