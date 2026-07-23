import { mergeApprovedWeldingProcessContent } from "@/lib/content/welding-process-approved";
import { mergeApprovedWeldingSafetyContent } from "@/lib/content/welding-safety-approved";
import { normalizeCanonicalTaxonomy } from "@/lib/content/taxonomy-normalization";
import { supplementalWrittenLessons } from "@/lib/content/supplemental-written-lessons";
import { applyWrittenQuestionAuditManifest } from "@/lib/content/written-question-audit";
import rawWrittenQuestionAudit from "@/data/generated/written-question-audit.json";
import type { GeneratedContent } from "@/lib/domain/types";

export function buildRuntimeContent(content: GeneratedContent) {
  return applyWrittenQuestionAuditManifest(
    mergeSupplementalWrittenLessons(
      mergeApprovedWeldingProcessContent(
        mergeApprovedWeldingSafetyContent(normalizeCanonicalTaxonomy(content)),
      ),
    ),
    rawWrittenQuestionAudit,
  );
}

function mergeSupplementalWrittenLessons(content: GeneratedContent): GeneratedContent {
  const existingIds = new Set(content.lessons.map((lesson) => lesson.id));
  const duplicate = supplementalWrittenLessons.find((lesson) => existingIds.has(lesson.id));
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
      ...supplementalWrittenLessons,
    ],
  };
}
