import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type {
  PracticalContent,
  PracticalStudyCategoryId,
} from "@/lib/domain/practical-types";
import { isLearnerVisiblePracticalQuestion } from "@/lib/content/learner-visibility";
import { isPublishablePracticalQuestion } from "@/lib/domain/practical";

const content = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ),
) as PracticalContent;

const balanced = content.questions.filter((question) =>
  question.id.startsWith("EXP-BAL-"),
);
const publicPredicted = content.questions.filter(
  (question) =>
    question.kind === "predicted" &&
    isPublishablePracticalQuestion(question) &&
    isLearnerVisiblePracticalQuestion(question),
);

function countFor(categoryId: PracticalStudyCategoryId) {
  return publicPredicted.filter(
    (question) => question.primaryStudyCategoryId === categoryId,
  ).length;
}

describe("curated practical predicted question bank", () => {
  it("replaces forced 60-per-type padding with the reviewed topic distribution", () => {
    expect({
      visual_identification: countFor("visual_identification"),
      formula_calculation: countFor("formula_calculation"),
      theory_concept: countFor("theory_concept"),
      work_procedure: countFor("work_procedure"),
    }).toEqual({
      visual_identification: 19,
      formula_calculation: 45,
      theory_concept: 60,
      work_procedure: 58,
    });
    expect(balanced).toHaveLength(67);
    expect(
      balanced.filter(
        (question) =>
          question.primaryStudyCategoryId === "visual_identification",
      ),
    ).toHaveLength(0);
  });

  it("adds the missing measurement, maintenance and defect definitions", () => {
    const theory = balanced.filter(
      (question) => question.primaryStudyCategoryId === "theory_concept",
    );
    expect(theory).toHaveLength(34);

    expect(
      content.questions.find((question) => question.id === "EXP-BAL-DEF-ABBE"),
    ).toMatchObject({
      title: "아베의 원리",
      stem: "아베의 원리란 무엇인가?",
      writtenSourceQuestionIds: ["U-073"],
      answerDefinition:
        "측정축과 기준 눈금축을 일치시켜 작은 기울어짐이 길이오차로 확대되는 것을 줄이는 원리이다.",
      memoryTip: "재는 축과 읽는 축을 한 줄로 맞춘다.",
    });
    expect(
      content.questions.find((question) => question.id === "EXP-BAL-DEF-TBM"),
    ).toMatchObject({
      stem: "시간기준보전(TBM)이란 무엇인가?",
      writtenSourceQuestionIds: ["U-966"],
    });
    expect(
      content.questions.find(
        (question) => question.id === "EXP-BAL-DEF-MAINTENANCE-HISTORY",
      ),
    ).toMatchObject({
      examFormat: "sequence",
      promptOptions: [
        "종합적 생산보전(TPM)",
        "개량보전(CM)",
        "예방보전(PM)",
        "보전예방(MP)",
        "생산보전",
      ],
      writtenSourceQuestionIds: ["U-1309"],
    });

    for (const id of [
      "EXP-BAL-DEF-BM",
      "EXP-BAL-DEF-PM",
      "EXP-BAL-DEF-TBM",
      "EXP-BAL-DEF-CBM",
      "EXP-BAL-DEF-PDM",
      "EXP-BAL-DEF-CM",
      "EXP-BAL-DEF-MP",
      "EXP-BAL-DEF-PRODUCTIVE",
      "EXP-BAL-DEF-TPM",
      "EXP-BAL-DEF-UNDERCUT",
      "EXP-BAL-DEF-OVERLAP",
      "EXP-BAL-DEF-POROSITY",
      "EXP-BAL-DEF-SLAG-INCLUSION",
      "EXP-BAL-DEF-LACK-PENETRATION",
      "EXP-BAL-DEF-LACK-FUSION",
      "EXP-BAL-DEF-CRATER",
    ]) {
      expect(
        content.questions.find((question) => question.id === id),
        id,
      ).toBeDefined();
    }
  });

  it("uses one prompt per formula family and covers the written-bank calculation range", () => {
    const calculations = balanced.filter(
      (question) => question.primaryStudyCategoryId === "formula_calculation",
    );
    expect(calculations).toHaveLength(32);
    expect(new Set(calculations.map((question) => question.title)).size).toBe(
      calculations.length,
    );

    for (const title of [
      "보일 법칙 체적 계산",
      "샤를 법칙 체적 계산",
      "연속방정식 유속 계산",
      "레이놀즈수 계산",
      "기어 맞물림주파수 계산",
      "볼베어링 기본정격수명 계산",
      "설비 가용도 계산",
      "질량-스프링계 고유진동수 계산",
      "펌프 수동력 계산",
      "설비종합효율(OEE) 계산",
      "유도전동기 슬립 계산",
      "PERT 기대시간 계산",
    ]) {
      expect(
        calculations.some((question) => question.title === title),
        title,
      ).toBe(true);
    }
    expect(
      calculations.every(
        (question) =>
          question.calculation.length >= 1 &&
          Boolean(question.unit) &&
          question.stem.endsWith("구하시오.") &&
          Boolean(question.answerDefinition) &&
          Boolean(question.memoryTip),
      ),
    ).toBe(true);
  });

  it("keeps the brake lining item as a textual sequence rather than an image task", () => {
    const brake = content.questions.find(
      (question) => question.id === "EXP-BAL-PROC-BRAKE-LINING",
    );
    expect(brake).toMatchObject({
      title: "브레이크 라이닝·패드 점검 순서",
      visualAidId: null,
      examFormat: "sequence",
      promptOptions: [
        "드럼·디스크와 작동부의 손상·간극·누설 상태를 확인한다.",
        "설비를 정지·고정하고 유압·회전 위험을 제거한다.",
        "제조사 기준에 따라 교환·조정한 뒤 제동시험과 기록을 수행한다.",
        "마찰재의 잔량·균열·편마모·오염·체결상태를 확인한다.",
      ],
      writtenSourceQuestionIds: ["U-660"],
    });
  });

  it("enforces unique stems, reviewed sources and the no-generic-visual-padding rule", () => {
    expect(
      publicPredicted.some((question) =>
        /^시각자료 판독 \d+$/.test(question.title),
      ),
    ).toBe(false);
    expect(
      balanced.every(
        (question) =>
          isPublishablePracticalQuestion(question) &&
          question.occurrence === null &&
          question.examEvidenceStatus === "predicted_related" &&
          Boolean(question.answerDefinition) &&
          Boolean(question.memoryTip) &&
          Boolean(question.writtenSourceQuestionIds?.length),
      ),
    ).toBe(true);
    expect(new Set(balanced.map((question) => question.id)).size).toBe(
      balanced.length,
    );
    const promptKeys = balanced.map(
      (question) =>
        `${question.stem.replace(/\s+/g, "")}|${
          question.promptOptions?.join("|") ?? ""
        }`,
    );
    expect(new Set(promptKeys).size).toBe(promptKeys.length);
    expect(
      balanced.some((question) =>
        question.ncsSources.some(
          (source) => source.sourceKind === "written_question_bank",
        ),
      ),
    ).toBe(true);
  });
});
