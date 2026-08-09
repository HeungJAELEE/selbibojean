import { mergeApprovedCompressorContent } from "@/lib/content/compressor-approved";
import { mergeApprovedWeldingDefectContent } from "@/lib/content/welding-defect-approved";
import { mergeApprovedWeldingProcessContent } from "@/lib/content/welding-process-approved";
import { mergeApprovedWeldingSafetyContent } from "@/lib/content/welding-safety-approved";
import { mergeApprovedWeldingCbtContent } from "@/lib/content/welding-cbt-approved";
import { normalizeCanonicalTaxonomy } from "@/lib/content/taxonomy-normalization";
import { notionGapWrittenLessons } from "@/lib/content/notion-gap-written-lessons";
import { refineLessonUnderstandingBackground } from "@/lib/content/lesson-understanding-background";
import { supplementalWrittenLessons } from "@/lib/content/supplemental-written-lessons";
import { applyWrittenQuestionAuditManifest } from "@/lib/content/written-question-audit";
import { mergeReviewedCbtVariants } from "@/lib/content/reviewed-cbt-variants";
import rawWrittenQuestionAudit from "@/data/generated/written-question-audit.json";
import type { GeneratedContent } from "@/lib/domain/types";

export function buildRuntimeContent(content: GeneratedContent) {
  return buildRuntimeContentBeforeDirectFeedback(content);
}

export function buildRuntimeContentBeforeDirectFeedback(
  content: GeneratedContent,
) {
  return mergeApprovedWeldingCbtContent(
    applyWrittenQuestionAuditManifest(
      mergeSupplementalWrittenLessons(
        mergeApprovedWeldingDefectContent(
          mergeApprovedWeldingProcessContent(
            mergeApprovedWeldingSafetyContent(
              mergeApprovedCompressorContent(
                refineLessonUnderstandingBackground(
                  normalizeCanonicalTaxonomy(
                    mergeReviewedCbtVariants(content),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      rawWrittenQuestionAudit,
    ),
  );
}

function mergeSupplementalWrittenLessons(content: GeneratedContent): GeneratedContent {
  const supplementalLessons = [
    ...supplementalWrittenLessons,
    ...notionGapWrittenLessons,
  ];
  const existingIds = new Set(content.lessons.map((lesson) => lesson.id));
  const supplementalIds = new Set<string>();
  const duplicate = supplementalLessons.find(
    (lesson) =>
      existingIds.has(lesson.id) ||
      (supplementalIds.has(lesson.id) ? true : !supplementalIds.add(lesson.id)),
  );
  if (duplicate) {
    throw new Error(`보강용 레슨 ID가 기존 콘텐츠와 충돌합니다: ${duplicate.id}`);
  }

  return {
    ...content,
    lessons: [
      ...content.lessons.map((lesson) => ({
        ...lesson,
        contentRole: lesson.contentRole ?? ("exam_linked" as const),
      })),
      ...supplementalLessons,
    ],
  };
}
