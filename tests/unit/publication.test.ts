import { describe, expect, it } from "vitest";
import {
  assessQuestionPublication,
  isConfirmedAnswerStatus,
  requiresAuthoritativeSource,
} from "@/lib/content/publication";

describe("publication policy", () => {
  it.each([
    "확정",
    "원문개념·A형 확정답안 학습용 재구성",
    "B형 확정답안·학습용 재구성",
    "B형 원문·최종답안 확인",
    "원문·정답 확인",
  ])("accepts an explicitly confirmed answer status: %s", (status) => {
    expect(isConfirmedAnswerStatus(status)).toBe(true);
  });

  it("does not treat a learning reconstruction as answer confirmation", () => {
    expect(isConfirmedAnswerStatus("원문개념·보기 학습용 재구성")).toBe(false);
  });

  it.each([
    "과거 KS 규격 문항",
    "보호구 선택 문제",
    "원문 이미지 확인 필요",
    "공개해설 충돌·기술원리 기준",
    "복수정답·B형 최종 확정답안",
  ])("blocks high-risk or unresolved evidence: %s", (status) => {
    expect(requiresAuthoritativeSource({ status, stem: "일반 문제", explanation: "충분한 근거 설명" })).toBe(true);
  });

  it("marks complete, confirmed, low-risk content ready", () => {
    expect(assessQuestionPublication({
      complete: true,
      answerConfirmed: true,
      mappingReliable: true,
      highRisk: false,
      contentQuality: true,
      lessonSourceNeeded: false,
    })).toEqual({ readiness: "ready", blockers: [] });
  });

  it("keeps a confirmed safety item blocked until an authoritative source is linked", () => {
    const result = assessQuestionPublication({
      complete: true,
      answerConfirmed: true,
      mappingReliable: true,
      highRisk: true,
      contentQuality: true,
      lessonSourceNeeded: false,
    });
    expect(result.readiness).toBe("blocked");
    expect(result.blockers).toContain("high_risk_source");
  });
});
