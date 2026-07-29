import { describe, expect, it } from "vitest";
import {
  bdaCodeLabs,
  getBdaCodeLabsForTask,
} from "@/data/source/bda-practical-content";
import rawQbank from "@/data/source/bda-qbank-v04.json";

describe("BDA 실기 유형별 코드 교재", () => {
  it("유형 1·2·3과 제출을 포함한 16개 코드 레슨을 제공한다", () => {
    expect(bdaCodeLabs).toHaveLength(16);
    const tracks = new Set(bdaCodeLabs.map((lab) => lab.track));
    expect(tracks).toEqual(
      new Set([
        "overview",
        "foundations",
        "type1",
        "type2",
        "type3",
        "submission",
      ]),
    );
    expect(new Set(bdaCodeLabs.map((lab) => lab.id)).size).toBe(
      bdaCodeLabs.length,
    );
  });

  it("모든 코드 레슨에 과제·출력 계약·함정·검토 근거가 있다", () => {
    for (const lab of bdaCodeLabs) {
      expect(lab.task.length).toBeGreaterThan(10);
      expect(lab.inputSchema.length).toBeGreaterThan(0);
      expect(lab.outputContract.length).toBeGreaterThan(10);
      expect(lab.preCodeChecks.length).toBeGreaterThanOrEqual(3);
      expect(lab.conceptIds.length).toBeGreaterThan(0);
      expect(lab.steps.length).toBeGreaterThanOrEqual(4);
      expect(lab.code.length).toBeGreaterThan(80);
      expect(lab.expected.length).toBeGreaterThanOrEqual(3);
      expect(lab.traps.length).toBeGreaterThanOrEqual(3);
      expect(["syntax-verified", "runtime-verified"]).toContain(
        lab.validation.status,
      );
      expect(lab.validation.basis.length).toBeGreaterThan(0);
    }
  });

  it("모든 코드랩을 실제 개념 ID에 연결하고 유형별 사전 판단을 포함한다", () => {
    const conceptIds = new Set(rawQbank.concepts.map((concept) => concept.id));

    for (const lab of bdaCodeLabs) {
      for (const conceptId of lab.conceptIds) {
        expect(conceptIds.has(conceptId)).toBe(true);
      }
      if (lab.track === "type1") {
        expect(lab.preCodeChecks.join(" ")).toContain("경계");
        expect(lab.preCodeChecks.join(" ")).toContain("반올림");
      }
      if (lab.track === "type2") {
        expect(lab.preCodeChecks.join(" ")).toContain("누수");
        expect(lab.preCodeChecks.join(" ")).toContain("확률");
      }
      if (lab.track === "type3") {
        expect(lab.preCodeChecks.join(" ")).toContain("귀무");
        expect(lab.preCodeChecks.join(" ")).toContain("통계량");
      }
    }
  });

  it("58개 실기 과제를 같은 유형의 코드랩에 빠짐없이 연결한다", () => {
    for (const task of rawQbank.practicalTasks) {
      const labs = getBdaCodeLabsForTask(
        task.practicalType,
        task.conceptIds,
      );
      expect(labs.length).toBeGreaterThan(0);
      expect(
        labs.every((lab) =>
          task.practicalType === "유형1"
            ? lab.track === "type1"
            : task.practicalType === "유형2"
              ? ["type2", "submission"].includes(lab.track)
              : lab.track === "type3",
        ),
      ).toBe(true);
    }
  });

  it("40개 개념 모두 적어도 하나의 실기 코드랩과 연결한다", () => {
    const linkedConceptIds = new Set(
      bdaCodeLabs.flatMap((lab) => lab.conceptIds),
    );
    expect(linkedConceptIds.size).toBe(40);
    for (const concept of rawQbank.concepts) {
      expect(linkedConceptIds.has(concept.id)).toBe(true);
    }
  });

  it("유형 2 제출 예시는 예측 열 1개와 index 제외 규칙을 지킨다", () => {
    const submission = bdaCodeLabs.find(
      (lab) => lab.id === "submission-single-column-audit",
    );
    expect(submission).toBeDefined();
    expect(submission?.outputContract).toContain("target 열 1개");
    expect(submission?.code).toContain('list(check.columns) == ["target"]');
    expect(submission?.code).toContain('to_csv("result.csv", index=False)');
    expect(submission?.code).toContain("model.fit(X_train, y_train)");
    expect(submission?.code).toContain('pd.read_csv("result.csv")');
    expect(submission?.code).not.toContain('"id": test_id');
  });
});
