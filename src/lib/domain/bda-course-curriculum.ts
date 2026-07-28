import { z } from "zod";
import {
  bdaCourseDomainSchema,
  bdaCourseRoleSchema,
  bdaPracticalTrackSchema,
  type BdaCourseLibraryItem,
} from "@/lib/domain/bda-course-library";

export const bdaPracticalTabs = [
  "overview",
  "foundations",
  "type1",
  "type2",
  "type3",
  "submission",
  "course-library",
] as const;

export const bdaPracticalTabSchema = z.enum(bdaPracticalTabs);

export const bdaCourseModuleSchema = z.object({
  id: z.string().regex(/^module-[a-z0-9-]+$/),
  order: z.number().int().positive(),
  tab: bdaPracticalTabSchema,
  label: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  examScope: z.enum(["core", "supporting", "supplementary"]),
  estimatedMinutes: z.number().int().positive(),
  conceptIds: z.array(z.string().regex(/^C\d{3}$/)).min(1),
  learningGoals: z.array(z.string().min(1)).min(2),
  examDecisions: z.array(z.string().min(1)).min(3),
  workflow: z
    .array(
      z.object({
        label: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(3),
  codeLabIds: z.array(z.string().min(1)),
  resourceTracks: z.array(bdaPracticalTrackSchema).min(1),
  resourceDomains: z.array(bdaCourseDomainSchema).min(1),
  preferredRoles: z.array(bdaCourseRoleSchema).min(1),
  resourceKeywords: z.array(z.string().min(1)),
});

export const bdaCourseCurriculumSchema = z
  .array(bdaCourseModuleSchema)
  .min(8);

export type BdaPracticalTab = z.infer<typeof bdaPracticalTabSchema>;
export type BdaCourseModule = z.infer<typeof bdaCourseModuleSchema>;

const relevanceScore = {
  core: 0,
  supporting: 1,
  supplementary: 2,
  "manual-review": 3,
} as const;

export function isBdaPracticalTab(value: string | undefined): value is BdaPracticalTab {
  return bdaPracticalTabSchema.safeParse(value).success;
}

export function selectCourseResources(
  module: BdaCourseModule,
  items: BdaCourseLibraryItem[],
  limit = 8,
) {
  const keywordPattern =
    module.resourceKeywords.length > 0
      ? new RegExp(module.resourceKeywords.map(escapeRegExp).join("|"), "i")
      : undefined;
  const roleRank = new Map(
    module.preferredRoles.map((role, index) => [role, index]),
  );

  return items
    .filter((item) => item.handling !== "exclude-runtime")
    .filter(
      (item) =>
        module.resourceTracks.includes(item.practicalTrack) ||
        module.resourceDomains.includes(item.domain) ||
        Boolean(keywordPattern?.test(`${item.title} ${item.relativePath}`)),
    )
    .filter((item) => !item.duplicateOf)
    .sort((left, right) => {
      const domainDifference =
        Number(!module.resourceDomains.includes(left.domain)) -
        Number(!module.resourceDomains.includes(right.domain));
      if (domainDifference !== 0) return domainDifference;

      const relevanceDifference =
        relevanceScore[left.examRelevance] - relevanceScore[right.examRelevance];
      if (relevanceDifference !== 0) return relevanceDifference;

      const leftRole = roleRank.get(left.role) ?? 99;
      const rightRole = roleRank.get(right.role) ?? 99;
      if (leftRole !== rightRole) return leftRole - rightRole;

      return left.relativePath.localeCompare(right.relativePath, "ko", {
        numeric: true,
      });
    })
    .slice(0, limit);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
