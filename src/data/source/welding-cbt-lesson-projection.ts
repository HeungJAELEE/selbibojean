import { z } from "zod";

import rawProjection from "@/data/source/welding-cbt-lesson-projection.json";
import {
  WELDING_CBT_AGGREGATE_LESSON_IDS,
  WELDING_CBT_LEAF_TARGETS,
  WELDING_CBT_TAXONOMY_VERSION,
  type WeldingCbtAggregateTopicKey,
  type WeldingCbtLeafLessonId,
} from "@/data/source/welding-cbt-lesson-taxonomy";

const aggregateTopicKeys = [
  "foundation",
  "arc",
  "gas",
  "defects",
  "safety",
] as const satisfies readonly WeldingCbtAggregateTopicKey[];

const entrySchema = z
  .object({
    canonicalId: z.string().regex(/^wcbt-[0-9a-f-]{36}$/u),
    contentDigest: z.string().regex(/^[0-9a-f]{64}$/u),
    aggregateTopicKey: z.enum(aggregateTopicKeys),
    reviewStatus: z.enum(["approved", "hold"]),
    primaryLeafLessonId: z.string().nullable(),
    reasonCodes: z.array(z.string().min(1)),
  })
  .superRefine((entry, context) => {
    if (entry.reviewStatus === "approved") {
      if (
        !entry.primaryLeafLessonId
        || !(entry.primaryLeafLessonId in WELDING_CBT_LEAF_TARGETS)
      ) {
        context.addIssue({
          code: "custom",
          path: ["primaryLeafLessonId"],
          message: "승인 행에는 공개 가능한 세부 레슨 ID가 하나 필요합니다.",
        });
      }
      if (entry.reasonCodes.includes("review-fallback")) {
        context.addIssue({
          code: "custom",
          path: ["reasonCodes"],
          message: "기계적 fallback 분류는 검토 완료 원장에 남길 수 없습니다.",
        });
      }
    }
    if (
      entry.reviewStatus === "hold"
      && (entry.primaryLeafLessonId !== null || entry.reasonCodes.length === 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "HOLD 행은 공개 레슨 없이 구체적인 사유를 가져야 합니다.",
      });
    }
  });

const projectionSchema = z
  .object({
    version: z.literal(1),
    taxonomyVersion: z.literal(WELDING_CBT_TAXONOMY_VERSION),
    reviewedAt: z.iso.datetime(),
    reviewer: z.string().min(1),
    entries: z.array(entrySchema),
  })
  .superRefine((projection, context) => {
    const seen = new Set<string>();
    for (const [index, entry] of projection.entries.entries()) {
      if (seen.has(entry.canonicalId)) {
        context.addIssue({
          code: "custom",
          path: ["entries", index, "canonicalId"],
          message: `중복 canonicalId: ${entry.canonicalId}`,
        });
      }
      seen.add(entry.canonicalId);
    }
  });

const parsedProjection = projectionSchema.parse(rawProjection);

export const WELDING_CBT_LESSON_PROJECTION = {
  ...parsedProjection,
  entries: parsedProjection.entries.map((entry) => ({
    ...entry,
    primaryLeafLessonId: entry.primaryLeafLessonId as WeldingCbtLeafLessonId | null,
  })),
};

export { WELDING_CBT_AGGREGATE_LESSON_IDS };
