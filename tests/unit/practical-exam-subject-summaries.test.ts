import { describe, expect, it } from "vitest";
import {
  EXAM_SUBJECT_CHEAT_SHEETS,
  getExamSubjectCheatSheet,
} from "@/data/source/practical-exam-subject-summaries";
import { getExamTerm } from "@/data/source/exam-terms";

describe("practical exam subject cheat sheets", () => {
  it("keeps all four subjects inside the low-density contract", () => {
    expect(EXAM_SUBJECT_CHEAT_SHEETS.map((item) => item.subjectId)).toEqual([
      "subject-1",
      "subject-2",
      "subject-3",
      "subject-4",
    ]);

    for (const summary of EXAM_SUBJECT_CHEAT_SHEETS) {
      expect(summary.sharedCore.length).toBeGreaterThanOrEqual(8);
      expect(summary.sharedCore.length).toBeLessThanOrEqual(12);
      expect(summary.practicalWritten.mustMemorize.length).toBeGreaterThanOrEqual(
        3,
      );
      expect(summary.practicalWritten.mustMemorize.length).toBeLessThanOrEqual(5);
      expect(
        summary.practicalWritten.representativeQuestionIds.length,
      ).toBeLessThanOrEqual(3);
      expect(summary.formulas.length).toBeLessThanOrEqual(3);
    }
  });

  it("stores evidence relationships instead of Korean display labels", () => {
    for (const item of EXAM_SUBJECT_CHEAT_SHEETS.flatMap(
      (summary) => summary.sharedCore,
    )) {
      expect(item.evidence).toEqual(
        expect.objectContaining({
          evidenceIds: expect.any(Array),
          writtenQuestionIds: expect.any(Array),
          practicalQuestionIds: expect.any(Array),
          ncsSourceRefs: expect.any(Array),
        }),
      );
      expect(item.evidence).not.toHaveProperty("label");
      expect(item.evidence).not.toHaveProperty("labels");
    }
  });

  it("curates subject 3 around bearings, fits, and gear damage", () => {
    const summary = getExamSubjectCheatSheet("subject-3");
    const body = summary?.sharedCore
      .map((item) => `${item.cue} ${item.answer}`)
      .join(" ");

    expect(body).toContain("구름베어링");
    expect(body).toContain("끼워맞춤");
    expect(body).toContain("피팅(피칭)");
    expect(body).toContain("스코어링(스코링)");
    expect(body).toContain("기어 록(물림 고착)");
  });

  it("uses the official six-loss names in subject 4", () => {
    const summary = getExamSubjectCheatSheet("subject-4");
    const body = summary?.sharedCore
      .map((item) => `${item.cue} ${item.answer}`)
      .join(" ");

    for (const label of [
      "고장",
      "작업준비·조정",
      "일시정지·공운전",
      "속도저하",
      "공정불량·수정",
      "초기수율",
    ]) {
      expect(body).toContain(label);
    }
  });
});

describe("exam term normalization", () => {
  it("keeps representative terms and accepted aliases together", () => {
    expect(getExamTerm("gear-pitting")).toEqual(
      expect.objectContaining({
        canonicalLabel: "피팅",
        acceptedAliases: expect.arrayContaining(["피칭"]),
        displayLabel: "피팅(피칭)",
      }),
    );
    expect(getExamTerm("gear-scoring")).toEqual(
      expect.objectContaining({
        canonicalLabel: "스코어링",
        acceptedAliases: expect.arrayContaining(["스코링"]),
      }),
    );
    expect(getExamTerm("vernier-main-scale")).toEqual(
      expect.objectContaining({
        canonicalLabel: "주척",
        acceptedAliases: expect.arrayContaining(["본척"]),
      }),
    );
  });
});
