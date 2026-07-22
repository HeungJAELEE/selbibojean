import { describe, expect, it } from "vitest";
import { findKoreanLanguageIssues, quoteWithJosa, withJosa } from "@/lib/content/korean";

describe("Korean postpositions", () => {
  it("chooses particles from the final pronounced syllable", () => {
    expect(quoteWithJosa("외측 마이크로미터", "이/가")).toBe("‘외측 마이크로미터’가");
    expect(quoteWithJosa("홀 센서", "과/와")).toBe("‘홀 센서’와");
    expect(quoteWithJosa("수격작용", "은/는")).toBe("‘수격작용’은");
    expect(withJosa("오일휩", "으로/로")).toBe("오일휩으로");
  });

  it("detects mismatched quoted particles and awkward generated phrases", () => {
    const issues = findKoreanLanguageIssues("정답 ‘외측 마이크로미터’이 맞는지 판단규칙을 확인한다.");
    expect(issues.map((issue) => issue.expression)).toEqual([
      "‘외측 마이크로미터’이",
      "판단규칙",
    ]);
  });
});
