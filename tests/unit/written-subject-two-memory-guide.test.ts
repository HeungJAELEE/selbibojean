import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectTwoMemoryGuideLessonTitles,
  WRITTEN_SUBJECT_TWO_MEMORY_GUIDE,
  WRITTEN_SUBJECT_TWO_SOURCE_BOUNDARY,
} from "@/data/source/written-subject-two-memory-guide";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableLesson } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

describe("written subject two memory guide", () => {
  it("keeps the integrated guide at eighteen distinct memory bundles", () => {
    expect(WRITTEN_SUBJECT_TWO_MEMORY_GUIDE).toHaveLength(18);
    expect(
      new Set(WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.map((bundle) => bundle.id)).size,
    ).toBe(18);
    expect(
      new Set(WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.map((bundle) => bundle.part)),
    ).toEqual(
      new Set(["용접 기초", "아크·특수용접", "결함·검사·이음", "산업안전"]),
    );
  });

  it("preserves contextualized traps without adding welding calculation formulas", () => {
    for (const bundle of WRITTEN_SUBJECT_TWO_MEMORY_GUIDE) {
      expect(bundle.facts.length).toBeGreaterThanOrEqual(5);
      expect(bundle.traps.length).toBeGreaterThanOrEqual(3);
      expect("formulas" in bundle).toBe(false);
      for (const trap of bundle.traps) {
        expect(trap.statement.trim().length).toBeGreaterThan(10);
        expect(trap.correction.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("links every curated detail title to an existing public subject-two lesson", () => {
    const publicSubjectTwoTitles = new Set(
      content.lessons
        .filter(
          (lesson) =>
            lesson.subjectId === "subject-2" && isPublishableLesson(lesson),
        )
        .map((lesson) => lesson.title),
    );

    const linkedTitles = getSubjectTwoMemoryGuideLessonTitles();
    expect(linkedTitles.length).toBeGreaterThanOrEqual(40);
    expect(new Set(linkedTitles).size).toBe(linkedTitles.length);
    expect(
      linkedTitles.filter((title) => !publicSubjectTwoTitles.has(title)),
    ).toEqual([]);
  });

  it("용접결함 표의 아홉 행을 각각 대응하는 소주제로 연결한다", () => {
    const bundle = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.find(
      (item) => item.id === "weld-defects",
    );

    expect(bundle?.facts.map((fact) => fact.cue)).toEqual([
      "언더컷",
      "오버랩",
      "기공",
      "슬래그 혼입",
      "용입 불량",
      "스패터",
      "용락",
      "은점·균열",
      "아크 스트라이크",
    ]);
    expect(bundle?.detailLessonTitles).toEqual([
      "언더컷 결함",
      "오버랩 결함",
      "기공·피트 결함",
      "슬래그 혼입 결함",
      "용입 불량·융합 불량 결함",
      "스패터 결함",
      "용락 결함",
      "용접 균열·은점 결함",
      "아크 스트라이크 결함",
    ]);
  });

  it("아크용접 비교표의 여섯 행을 각각 실제 소주제로 연결한다", () => {
    const bundle = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.find(
      (item) => item.id === "shielded-high-efficiency",
    );

    expect(bundle?.facts.map((fact) => fact.cue)).toEqual([
      "TIG",
      "MIG",
      "CO₂ 용접",
      "FCAW",
      "서브머지드",
      "차폐 조건",
    ]);
    expect(bundle?.detailLessonTitles).toEqual([
      "TIG용접(GTAW)",
      "MIG·MAG·CO₂용접(GMAW)",
      "CO₂ 아크용접",
      "플럭스코어드아크용접(FCAW)",
      "서브머지드아크용접(SAW)",
      "아크용접 차폐 조건",
    ]);
  });

  it("keeps the four safety-sign categories and representative actions together", () => {
    const bundle = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.find(
      (item) => item.id === "safety-sign-fire-details",
    );
    const fourCategories = bundle?.facts.find(
      (fact) =>
        fact.id === "s2-safety-sign-fire-details-four-categories",
    );

    expect(fourCategories?.answer).toContain("금지는 하지 말아야 할 행동");
    expect(fourCategories?.answer).toContain("경고는 주의할 위험");
    expect(fourCategories?.answer).toContain("지시는 반드시 해야 할 행동");
    expect(fourCategories?.answer).toContain("안내는 비상구·구호설비");
    expect(
      bundle?.traps.some((trap) => trap.statement.includes("비상구 위치")),
    ).toBe(true);
  });

  it("keeps the private source URL and unverified statutory numbers out of the guide", () => {
    const serializedGuide = JSON.stringify(WRITTEN_SUBJECT_TWO_MEMORY_GUIDE);

    expect(serializedGuide).not.toContain("notion.site");
    expect(WRITTEN_SUBJECT_TWO_SOURCE_BOUNDARY).toContain("현행 법령");
    for (const unverifiedValue of ["1.05배", "95% 이하", "98% 이하", "130kPa", "1.8m 이상"]) {
      expect(serializedGuide).not.toContain(unverifiedValue);
    }
  });
});
