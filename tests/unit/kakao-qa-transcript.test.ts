import { describe, expect, it } from "vitest";

import {
  buildKakaoQaReviewDataset,
  parseKakaoQaTranscript,
  sanitizeKakaoQaExternalUrl,
} from "@/lib/content/kakao-qa-transcript";

const source = `설비보전기사 준비방 님과 카카오톡 대화
저장한 날짜 : 2026-07-28 11:04:23

--------------- Monday, February 23, 2026 ---------------
[실명은저장되면안됨] [오전 9:10] 울산 시험장에서 용접기 장비가 교류였고 접촉불량이 있었습니다.
여러 줄로 이어진 제보입니다.
[다른사용자] [오전 9:11] 정답은 1번 아닌가요? AI 답과 달라요.
[다른사용자] [오전 9:12] 사진
[다른사용자] [오전 9:13] 교육 신청 https://dream.kopo.ac.kr/home/edcpblanc/detail.do?utm_source=chat
[다른사용자] [오전 9:14] 준비물 문의 연락처 010  1234  5678, qa@example.com, @홍길동 보안경이 필요합니다.
메시지가 삭제되었습니다.
강제퇴장사용자님을 내보냈습니다.

--------------- Tuesday, February 24, 2026 ---------------
[다른사용자] [오후 1:00] 용접 보안경은 시험장 제공 여부를 확인하고 준비해야 하나요?
`;

describe("Kakao Q&A private review import", () => {
  it("parses multiline messages without retaining speaker identity", () => {
    const transcript = parseKakaoQaTranscript(source);

    expect(transcript.sourceSavedAt).toBe("2026-07-28T11:04:23+09:00");
    expect(transcript.dateHeaderCount).toBe(2);
    expect(transcript.startDate).toBe("2026-02-23");
    expect(transcript.endDate).toBe("2026-02-24");
    expect(transcript.systemLineCount).toBe(2);
    expect(transcript.messages).toHaveLength(6);
    expect(transcript.messages[0].text).toContain("여러 줄로 이어진 제보");
    expect(transcript.messages[0]).not.toHaveProperty("speaker");
    expect(JSON.stringify(transcript.messages)).not.toContain(
      "실명은저장되면안됨",
    );
  });

  it("creates only held candidates and redacts direct identifiers", () => {
    const transcript = parseKakaoQaTranscript(source);
    const dataset = buildKakaoQaReviewDataset({
      transcript,
      sourceFile: "설비보전Q&A.txt",
      sourceSha256: "a".repeat(64),
    });

    expect(dataset.summary.immediatePublicationCount).toBe(0);
    expect(dataset.summary.attachmentPlaceholderCount).toBe(1);
    expect(
      dataset.candidates.every(
        (candidate) =>
          candidate.publicationStatus === "held" &&
          candidate.evidenceClass === "unverified_user_report",
      ),
    ).toBe(true);
    expect(
      dataset.candidates.some((candidate) =>
        candidate.categories.includes("answer_conflict"),
      ),
    ).toBe(true);
    expect(
      dataset.candidates.some((candidate) =>
        candidate.categories.includes("test_center_report"),
      ),
    ).toBe(true);
    const redacted = dataset.candidates.find((candidate) =>
      candidate.redactions.includes("phone"),
    );
    expect(redacted?.excerpt).toContain("[연락처 삭제]");
    expect(redacted?.excerpt).toContain("[이메일 삭제]");
    expect(redacted?.excerpt).toContain("[호칭 삭제]");
    expect(JSON.stringify(dataset)).not.toContain("010  1234  5678");
    expect(JSON.stringify(dataset)).not.toContain("qa@example.com");
    expect(JSON.stringify(dataset)).not.toContain("실명은저장되면안됨");
  });

  it("normalizes tracking and opaque query parameters without changing content URLs", () => {
    expect(
      sanitizeKakaoQaExternalUrl(
        "https://www.youtube.com/watch?v=abc123&si=tracking&t=30s",
      ),
    ).toBe("https://www.youtube.com/watch?t=30s&v=abc123");
    expect(
      sanitizeKakaoQaExternalUrl(
        "https://cafe.naver.com/example/123?art=aaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbb.cccccccccccccccccccc&utm_source=chat",
      ),
    ).toBe("https://cafe.naver.com/example/123");
  });

  it("is idempotent for the same transcript and checksum", () => {
    const transcript = parseKakaoQaTranscript(source);
    const input = {
      transcript,
      sourceFile: "설비보전Q&A.txt",
      sourceSha256: "b".repeat(64),
    };

    expect(buildKakaoQaReviewDataset(input)).toEqual(
      buildKakaoQaReviewDataset(input),
    );
  });
});
