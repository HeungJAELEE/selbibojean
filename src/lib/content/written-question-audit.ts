import { z } from "zod";

import type { GeneratedContent, Question } from "@/lib/domain/types";

export const AUDIT_DISPOSITIONS = [
  "verified",
  "cbt_corrected",
  "held_answer_conflict",
  "held_asset_missing",
  "held_source_missing",
] as const;

export const EVIDENCE_LEVELS = ["primary", "dual_secondary"] as const;

export const ASSET_STATUSES = [
  "not_required",
  "self_authored",
  "available",
  "missing",
] as const;

export const AUDIT_SCOPES = ["review_queue", "high_risk_public"] as const;

export const writtenQuestionAuditEntrySchema = z
  .object({
    questionId: z.string().min(1),
    scope: z.enum(AUDIT_SCOPES),
    sourceContentStatus: z.enum([
      "draft",
      "in_review",
      "published",
      "archived",
    ]),
    auditDisposition: z.enum(AUDIT_DISPOSITIONS),
    evidenceLevel: z.enum(EVIDENCE_LEVELS).nullable(),
    cbtAnswer: z.string().min(1).nullable(),
    verifiedAnswer: z.string().min(1).nullable(),
    evidenceUrls: z.array(z.url()),
    reviewNote: z.string().min(1),
    nextAction: z.string().min(1),
    assetStatus: z.enum(ASSET_STATUSES),
    reviewRationale: z.string().min(1).optional(),
    reviewChoiceFeedback: z
      .array(
        z.object({
          choiceId: z.string().min(1),
          verdict: z.enum(["correct", "incorrect"]),
          rationale: z.string().min(1),
        }),
      )
      .length(4)
      .optional(),
    reviewedAt: z.iso.datetime(),
  })
  .superRefine((entry, context) => {
    const isVerified =
      entry.auditDisposition === "verified" ||
      entry.auditDisposition === "cbt_corrected";

    if (isVerified && entry.evidenceLevel === null) {
      context.addIssue({
        code: "custom",
        path: ["evidenceLevel"],
        message: "검증 완료 문제는 근거 등급이 필요합니다.",
      });
    }
    if (isVerified && entry.verifiedAnswer === null) {
      context.addIssue({
        code: "custom",
        path: ["verifiedAnswer"],
        message: "검증 완료 문제는 확정 답안이 필요합니다.",
      });
    }
    if (isVerified && entry.evidenceUrls.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["evidenceUrls"],
        message: "검증 완료 문제는 근거 URL이 필요합니다.",
      });
    }
    if (
      entry.auditDisposition === "cbt_corrected" &&
      entry.cbtAnswer === entry.verifiedAnswer
    ) {
      context.addIssue({
        code: "custom",
        path: ["verifiedAnswer"],
        message: "CBT 보정 문제는 공개답과 검증답이 달라야 합니다.",
      });
    }
    if (
      entry.auditDisposition === "held_asset_missing" &&
      entry.assetStatus !== "missing"
    ) {
      context.addIssue({
        code: "custom",
        path: ["assetStatus"],
        message: "필수 시각자료 누락 문제는 assetStatus=missing이어야 합니다.",
      });
    }
    if (
      isVerified &&
      entry.reviewChoiceFeedback &&
      entry.reviewChoiceFeedback.filter(
        (feedback) => feedback.verdict === "correct",
      ).length !== 1
    ) {
      context.addIssue({
        code: "custom",
        path: ["reviewChoiceFeedback"],
        message: "검증된 단일선택 문제는 정답 선택지 판단이 정확히 하나여야 합니다.",
      });
    }
  });

export const writtenQuestionAuditManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: z.iso.datetime(),
    sourceGeneratedAt: z.iso.datetime(),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    counts: z.object({
      reviewQueueExpected: z.number().int().nonnegative(),
      reviewQueueAudited: z.number().int().nonnegative(),
      highRiskPublicAudited: z.number().int().nonnegative(),
      verified: z.number().int().nonnegative(),
      cbtCorrected: z.number().int().nonnegative(),
      held: z.number().int().nonnegative(),
    }),
    entries: z.array(writtenQuestionAuditEntrySchema),
  })
  .superRefine((manifest, context) => {
    const ids = manifest.entries.map((entry) => entry.questionId);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["entries"],
        message: "감사 매니페스트에 중복 questionId가 있습니다.",
      });
    }

    const reviewQueueAudited = manifest.entries.filter(
      (entry) => entry.scope === "review_queue",
    ).length;
    const highRiskPublicAudited = manifest.entries.filter(
      (entry) => entry.scope === "high_risk_public",
    ).length;
    const verified = manifest.entries.filter(
      (entry) => entry.auditDisposition === "verified",
    ).length;
    const cbtCorrected = manifest.entries.filter(
      (entry) => entry.auditDisposition === "cbt_corrected",
    ).length;
    const held = manifest.entries.length - verified - cbtCorrected;

    const expectedCounts = {
      reviewQueueAudited,
      highRiskPublicAudited,
      verified,
      cbtCorrected,
      held,
    };
    for (const [key, expected] of Object.entries(expectedCounts)) {
      const actual = manifest.counts[key as keyof typeof expectedCounts];
      if (actual !== expected) {
        context.addIssue({
          code: "custom",
          path: ["counts", key],
          message: `기록값 ${actual}과 실제 집계 ${expected}가 다릅니다.`,
        });
      }
    }
    if (manifest.counts.reviewQueueExpected !== reviewQueueAudited) {
      context.addIssue({
        code: "custom",
        path: ["counts", "reviewQueueExpected"],
        message: "고정 감사목록의 검수대기 문제 수가 예상값과 다릅니다.",
      });
    }
  });

export type WrittenQuestionAuditEntry = z.infer<
  typeof writtenQuestionAuditEntrySchema
>;
export type WrittenQuestionAuditManifest = z.infer<
  typeof writtenQuestionAuditManifestSchema
>;

const HIGH_RISK_PUBLIC_PATTERN =
  /(법령|산업안전|안전보건|KS(?:\s|\b)|ISO(?:\s|\b)|규격|제조사|현행\s*기준|현행\s*확인|안전\s*중요)/i;
const HIGH_RISK_TAGS = new Set([
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
]);

export function isHighRiskPublicQuestion(question: Question) {
  if (question.contentStatus !== "published") return false;

  const tagged = question.verification?.riskTags.some((tag) =>
    HIGH_RISK_TAGS.has(tag),
  );
  const textual = HIGH_RISK_PUBLIC_PATTERN.test(
    [question.reviewStatus, question.stem, question.explanation].join(" "),
  );
  return Boolean(tagged || textual);
}

export function parseWrittenQuestionAuditManifest(value: unknown) {
  return writtenQuestionAuditManifestSchema.parse(value);
}

/**
 * Applies reviewed audit metadata without mutating the workbook-derived
 * snapshot. Publication gating remains the responsibility of the central
 * practice/publication policy.
 */
export function applyWrittenQuestionAuditManifest(
  content: GeneratedContent,
  manifestInput: unknown,
): GeneratedContent {
  const manifest = parseWrittenQuestionAuditManifest(manifestInput);
  const auditByQuestionId = new Map(
    manifest.entries.map((entry) => [entry.questionId, entry]),
  );
  const acceptedAudit = (questionId: string) => {
    const audit = auditByQuestionId.get(questionId);
    return (
      audit?.auditDisposition === "verified" ||
      audit?.auditDisposition === "cbt_corrected"
    );
  };
  const questionIdsByLessonId = new Map<string, string[]>();
  for (const question of content.questions) {
    questionIdsByLessonId.set(question.lessonId, [
      ...(questionIdsByLessonId.get(question.lessonId) ?? []),
      question.id,
    ]);
  }
  const publicLessonIds = new Set(
    content.lessons
      .filter((lesson) => {
        const alreadyPublic =
          lesson.contentStatus === "published" &&
          lesson.publication?.readiness === "ready" &&
          lesson.coverageStatus === "covered" &&
          lesson.quality.passed &&
          !lesson.sourceNeeded;
        const hasAcceptedQuestion = (
          questionIdsByLessonId.get(lesson.id) ?? []
        ).some(acceptedAudit);
        return (
          alreadyPublic ||
          (hasAcceptedQuestion && lesson.quality.passed)
        );
      })
      .map((lesson) => lesson.id),
  );

  const questions = content.questions.map((question) => {
    const audit = auditByQuestionId.get(question.id);
    if (!audit) return question;

    const accepted =
      audit.auditDisposition === "verified" ||
      audit.auditDisposition === "cbt_corrected";
    if (!accepted || !publicLessonIds.has(question.lessonId)) {
      return { ...question, audit };
    }

    const verifiedChoice =
      audit.auditDisposition === "cbt_corrected" && audit.verifiedAnswer
        ? question.choices.find(
            (choice) => choice.text.trim() === audit.verifiedAnswer?.trim(),
          )
        : question.choices.find(
            (choice) => choice.id === question.correctChoiceId,
          );
    if (!verifiedChoice) {
      throw new Error(
        `${question.id}의 검증 답안을 선택지와 연결할 수 없습니다.`,
      );
    }
    const reviewedFeedback = new Map(
      audit.reviewChoiceFeedback?.map((feedback) => [
        feedback.choiceId,
        feedback,
      ]) ?? [],
    );
    if (
      audit.reviewChoiceFeedback &&
      question.choices.some((choice) => !reviewedFeedback.has(choice.id))
    ) {
      throw new Error(
        `${question.id}의 감사 선택지 해설이 현재 선택지 네 개와 일치하지 않습니다.`,
      );
    }

    return {
      ...question,
      choices: question.choices.map((choice) => {
        const reviewed = reviewedFeedback.get(choice.id);
        if (!reviewed) return choice;

        const isCorrect = choice.id === verifiedChoice.id;
        return {
          ...choice,
          feedback: {
            ...choice.feedback,
            rationale: reviewed.rationale,
            incorrectPoint: isCorrect ? null : reviewed.rationale,
            keyRule:
              audit.reviewRationale ??
              choice.feedback.keyRule,
            differenceFromCorrect: isCorrect
              ? null
              : reviewed.rationale,
          },
        };
      }),
      correctChoiceId: verifiedChoice.id,
      answerText: verifiedChoice.text,
      explanation: audit.reviewRationale ?? question.explanation,
      contentStatus: "published" as const,
      publication: {
        readiness: "ready" as const,
        blockers: [],
      },
      verification: {
        status: "verified" as const,
        method:
          audit.evidenceLevel === "primary"
            ? ("authoritative_source_verified" as const)
            : ("source_backed_reconstruction" as const),
        variantCount: question.verification?.variantCount ?? 1,
        sourceUrls: audit.evidenceUrls,
        riskTags: question.verification?.riskTags.filter(
          (tag) =>
            tag !== "answer_conflict" &&
            tag !== "asset_required" &&
            tag !== "authoritative_source_required",
        ) ?? [],
        note: audit.reviewNote,
        reviewedAt: audit.reviewedAt,
      },
      audit,
      validation: {
        ...question.validation,
        theoryLink: true,
      },
    };
  });

  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const lessons = content.lessons.map((lesson) => {
    const linkedQuestionIds = questionIdsByLessonId.get(lesson.id) ?? [];
    const auditedQuestions = linkedQuestionIds
      .map((questionId) => questionById.get(questionId))
      .filter(
        (question): question is Question =>
          Boolean(question?.audit),
      );
    if (auditedQuestions.length === 0) return lesson;

    const acceptedQuestions = auditedQuestions.filter(
      (question) =>
        question.audit?.auditDisposition === "verified" ||
        question.audit?.auditDisposition === "cbt_corrected",
    );
    if (
      !publicLessonIds.has(lesson.id) ||
      acceptedQuestions.length === 0
    ) {
      return lesson;
    }
    const acceptedIds = new Set(
      acceptedQuestions.map((question) => question.id),
    );
    const auditedIds = new Set(
      auditedQuestions.map((question) => question.id),
    );
    const relatedQuestionIds = [
      ...new Set([...lesson.relatedQuestionIds, ...linkedQuestionIds]),
    ].filter(
      (questionId) =>
        !auditedIds.has(questionId) || acceptedIds.has(questionId),
    );
    const evidenceUrls = [
      ...new Set(
        acceptedQuestions.flatMap(
          (question) => question.audit?.evidenceUrls ?? [],
        ),
      ),
    ];
    const sourceBody = [
      "감사 승인 근거:",
      ...evidenceUrls.map((url) => `- ${url}`),
      `- 최종 검수일: ${acceptedQuestions[0].audit?.reviewedAt ?? lesson.reviewedAt}`,
    ].join("\n");
    const hasSourceBlock = lesson.blocks.some(
      (block) => block.kind === "source",
    );
    const blocks = [
      ...lesson.blocks.map((block) => {
        if (block.kind === "exam_point") {
          return {
            ...block,
            body: acceptedQuestions
              .map(
                (question) =>
                  `- **${question.id}** ${question.stem}\n  - 판단 기준: ${
                    question.audit?.reviewRationale ??
                    question.explanation
                  }`,
              )
              .join("\n"),
          };
        }
        if (block.kind === "source") {
          return {
            ...block,
            body: `${block.body}\n\n${sourceBody}`,
          };
        }
        return block;
      }),
      ...(!hasSourceBlock
        ? [
            {
              id: "audit-source",
              kind: "source" as const,
              title: "검증 근거",
              body: sourceBody,
              order: lesson.blocks.length + 1,
            },
          ]
        : []),
    ];

    return {
      ...lesson,
      blocks,
      relatedQuestionIds,
      coverageStatus: "covered" as const,
      contentStatus: "published" as const,
      sourceNeeded: false,
      quality: {
        ...lesson.quality,
        sourceLinked: true,
      },
      publication: {
        readiness: "ready" as const,
        blockers: [],
      },
    };
  });

  return {
    ...content,
    questions,
    lessons,
  };
}
