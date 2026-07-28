import { describe, expect, it } from "vitest";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";

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
      expect(lab.outputContract.length).toBeGreaterThan(10);
      expect(lab.steps.length).toBeGreaterThanOrEqual(4);
      expect(lab.code.length).toBeGreaterThan(80);
      expect(lab.traps.length).toBeGreaterThanOrEqual(3);
      expect(lab.validation.status).toBe("pattern-reviewed");
      expect(lab.validation.basis.length).toBeGreaterThan(0);
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
    expect(submission?.code).not.toContain('"id": test_id');
  });
});
