import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE } from "@/data/source/written-subject-four-memory-guide";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import { WRITTEN_SUBJECT_THREE_MEMORY_GUIDE } from "@/data/source/written-subject-three-memory-guide";
import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE } from "@/data/source/written-subject-two-memory-guide";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableLesson } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const PRIVATE_SOURCE_URL_PATTERN =
  /https?:\/\/(?:(?:(?:www\.)?notion\.(?:so|site))|app\.notion\.com)\//iu;

describe("written theory private source boundary", () => {
  it.each([
    "https://notion.site/private",
    "https://www.notion.so/private",
    "https://app.notion.com/p/private",
  ])("recognizes private Notion source URL variants: %s", (sourceUrl) => {
    expect(sourceUrl).toMatch(PRIVATE_SOURCE_URL_PATTERN);
  });

  it("does not expose private Notion URLs in learner-facing theory data", () => {
    const content = buildRuntimeContent(generatedContent as GeneratedContent);
    const learnerFacingData = {
      lessons: content.lessons.filter(isPublishableLesson),
      memoryGuides: [
        WRITTEN_SUBJECT_ONE_MEMORY_GUIDE,
        WRITTEN_SUBJECT_TWO_MEMORY_GUIDE,
        WRITTEN_SUBJECT_THREE_MEMORY_GUIDE,
        WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE,
      ],
    };

    expect(JSON.stringify(learnerFacingData)).not.toMatch(
      PRIVATE_SOURCE_URL_PATTERN,
    );
  });
});
