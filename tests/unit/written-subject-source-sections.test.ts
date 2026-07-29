import { describe, expect, it } from "vitest";
import {
  getWrittenSubjectNotionBody,
  type WrittenSubjectCode,
} from "@/data/source/written-subject-notion-bodies";
import {
  splitWrittenSubjectSourceBody,
  splitWrittenSubjectSourceTopics,
} from "@/data/source/written-subject-source-sections";

const EXPECTED_PART_LABELS: Record<WrittenSubjectCode, string[]> = {
  1: ["Part 1.", "Part 2.", "Part 3.", "Part 4."],
  2: ["Part 1.", "Part 2.", "Part 4."],
  3: [
    "Part 1.",
    "Part 2.",
    "Part 3.",
    "Part 4.",
    "Part 5.",
    "Part 7.",
    "Part 8.",
  ],
  4: ["Part 1.", "Part 2.", "Part 3.", "Part 3.", "Part 4.", "Part 5."],
};

describe("written subject source sections", () => {
  it("preserves the source part sequence, including missing and duplicate numbers", () => {
    for (const subjectCode of [1, 2, 3, 4] as const) {
      const source = getWrittenSubjectNotionBody(subjectCode);
      expect(source).not.toBeNull();

      const sections = splitWrittenSubjectSourceBody(
        subjectCode,
        source?.body ?? "",
      );

      expect(sections).toHaveLength(EXPECTED_PART_LABELS[subjectCode].length);
      expect(sections.map((section) => section.label)).toEqual(
        EXPECTED_PART_LABELS[subjectCode].map((prefix) =>
          expect.stringContaining(prefix),
        ),
      );
      expect(sections.every((section) => section.body.length > 0)).toBe(true);
    }
  });

  it("keeps every non-whitespace source character after sectioning", () => {
    for (const subjectCode of [1, 2, 3, 4] as const) {
      const source = getWrittenSubjectNotionBody(subjectCode);
      const sections = splitWrittenSubjectSourceBody(
        subjectCode,
        source?.body ?? "",
      );
      const original = (source?.body ?? "").replace(/\s/g, "");
      const reconstructed = sections
        .map((section) => section.body)
        .join("")
        .replace(/\s/g, "");

      expect(reconstructed).toBe(original);
    }
  });

  it("keeps representative late source topics inside the embedded sections", () => {
    const subjectOne = splitWrittenSubjectSourceBody(
      1,
      getWrittenSubjectNotionBody(1)?.body ?? "",
    );
    const subjectFour = splitWrittenSubjectSourceBody(
      4,
      getWrittenSubjectNotionBody(4)?.body ?? "",
    );

    expect(subjectOne.at(-1)?.body).toContain("네트워크 구성 형태");
    expect(subjectFour.map((section) => section.body).join("\n")).toContain(
      "자주 보전 (Self-Maintenance) 전개 7단계",
    );
  });

  it("separates each numbered source heading into its own learning block", () => {
    for (const subjectCode of [1, 2, 3, 4] as const) {
      const source = getWrittenSubjectNotionBody(subjectCode);
      const sections = splitWrittenSubjectSourceBody(
        subjectCode,
        source?.body ?? "",
      );

      for (const section of sections) {
        const outline = splitWrittenSubjectSourceTopics(
          section.id,
          section.body,
        );
        const reconstructed = [outline.intro]
          .concat(outline.topics.map((topic) => topic.body))
          .join("")
          .replace(/\s/g, "");

        expect(reconstructed).toBe(section.body.replace(/\s/g, ""));
        expect(outline.topics.every((topic) => topic.label.length > 0)).toBe(
          true,
        );
      }
    }
  });

  it("exposes the requested sensor, valve, and arc-welding topics as separate blocks", () => {
    const subjectOneTopics = splitWrittenSubjectSourceBody(
      1,
      getWrittenSubjectNotionBody(1)?.body ?? "",
    ).flatMap((section) =>
      splitWrittenSubjectSourceTopics(section.id, section.body).topics.map(
        (topic) => topic.label,
      ),
    );
    const subjectTwoTopics = splitWrittenSubjectSourceBody(
      2,
      getWrittenSubjectNotionBody(2)?.body ?? "",
    ).flatMap((section) =>
      splitWrittenSubjectSourceTopics(section.id, section.body).topics.map(
        (topic) => topic.label,
      ),
    );

    expect(subjectOneTopics).toEqual(
      expect.arrayContaining([
        expect.stringContaining("2.4 유량 제어 밸브"),
        expect.stringContaining("2.4 압력 센서 및 압력계"),
        expect.stringContaining("3.3 센서의 성능 평가 용어"),
      ]),
    );
    expect(subjectTwoTopics).toEqual(
      expect.arrayContaining([
        expect.stringContaining("3.1 용접 종류 핵심 비교표"),
        expect.stringContaining("3.2 TIG 용접"),
        expect.stringContaining("3.3 MIG 용접"),
        expect.stringContaining("3.4 이산화탄소"),
        expect.stringContaining("3.5 서브머지드"),
      ]),
    );
  });
});
