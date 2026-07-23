import { describe, expect, it } from "vitest";
import {
  assessQuestionPublication,
  canVerifyFromWorkbookSource,
  classifyVerificationRisks,
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
    "현행 ISO 규격 확인",
    "제조사 운전범위 우선",
    "과거 법령·현행 위험물 기준 별도 확인",
  ])("requires an authoritative source for current or product-specific claims: %s", (status) => {
    expect(requiresAuthoritativeSource({ status, stem: "일반 문제", explanation: "충분한 근거 설명" })).toBe(true);
  });

  it("distinguishes reconstructed text from unresolved image and answer conflicts", () => {
    expect(classifyVerificationRisks({
      status: "이미지형 재구성",
      stem: "기호를 판독할 때 확인할 항목은?",
      choices: ["포트 수", "도장색", "배관 길이", "제조일"],
      answer: "포트 수",
      explanation: "기호의 포트와 위치 수를 판독한다.",
    })).toEqual(["editorial_reconstruction"]);
    expect(classifyVerificationRisks({
      status: "이미지형/부분복원",
      stem: "원문 수식 이미지 보기에서 옳은 것은?",
      explanation: "원문 이미지 확인이 필요하다.",
    })).toContain("asset_required");
    expect(classifyVerificationRisks({
      status: "복수정답·최종답안 확인필요",
      stem: "옳은 것은?",
      explanation: "원문 선택지와 답안 충돌이 있다.",
    })).toContain("answer_conflict");
  });

  it("accepts a complete low-risk reconstruction backed by an original source URL", () => {
    expect(canVerifyFromWorkbookSource({
      complete: true,
      sourceUrls: ["https://example.com/original"],
      riskTags: ["editorial_reconstruction"],
    })).toBe(true);
  });

  it("marks complete, confirmed, low-risk content ready", () => {
    expect(assessQuestionPublication({
      complete: true,
      answerConfirmed: true,
      mappingReliable: true,
      contentQuality: true,
      lessonSourceNeeded: false,
    })).toEqual({ readiness: "ready", blockers: [] });
  });

  it("keeps a confirmed safety item blocked until an authoritative source is linked", () => {
    const result = assessQuestionPublication({
      complete: true,
      answerConfirmed: true,
      mappingReliable: true,
      authoritativeSourceRequired: true,
      contentQuality: true,
      lessonSourceNeeded: false,
    });
    expect(result.readiness).toBe("blocked");
    expect(result.blockers).toContain("authoritative_source_required");
  });
});
