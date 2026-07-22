import { describe, expect, it } from "vitest";
import { mapConceptGroup } from "@/lib/domain/catalog";

describe("concept group mapping", () => {
  it("maps pneumatic and hydraulic comparison to shared-fluid fundamentals", () => {
    const result = mapConceptGroup(
      1,
      "공압·유압 비교",
      "공기압과 유압의 일반적 특성에 관한 설명으로 옳지 않은 것은?",
      "유압은 비압축성 유체를 사용한다.",
    );
    expect(result.group.id).toBe("s1-g01");
    expect(result.confidence).toBe("override");
  });

  it("maps the Abbe principle to measurement rather than the screw group", () => {
    const result = mapConceptGroup(
      3,
      "아베 원리",
      "측정축과 기준눈금축을 일치시키는 아베의 원리를 만족하는 측정기는?",
      "외측 마이크로미터는 측정선과 나사축이 일직선상에 있다.",
      "블록게이지 하이트게이지 외측 마이크로미터 버니어캘리퍼스",
    );
    expect(result.group.id).toBe("s3-g01");
    expect(result.confidence).toBe("override");
  });

  it("does not treat the syllable in spindle as a standalone pin keyword", () => {
    const result = mapConceptGroup(
      3,
      "측정 오차",
      "스핀들 이동축과 측정축을 일치시키는 이유는?",
      "마이크로미터의 스핀들을 기준으로 측정한다.",
    );
    expect(result.group.id).toBe("s3-g01");
  });
});
