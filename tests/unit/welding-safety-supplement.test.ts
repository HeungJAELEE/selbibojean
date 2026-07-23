import { describe, expect, it } from "vitest";

import {
  buildWeldingSafetyReviewDataset,
  isExcludedWeldingTopic,
  normalizeWeldingSafetyCategory,
  parseWeldingSafetyAnswer,
} from "@/lib/content/welding-safety-supplement";

const choices = ["즉시 전원을 차단한다.", "맨손으로 분리한다.", "물을 뿌린다.", "작업을 계속한다."];

describe("welding safety supplemental import", () => {
  it("maps circled and text answers to a choice", () => {
    expect(parseWeldingSafetyAnswer("①", choices)).toBe(0);
    expect(parseWeldingSafetyAnswer("① 즉시 전원을 차단한다.", choices)).toBe(0);
    expect(parseWeldingSafetyAnswer("즉시 전원을 차단한다.", choices)).toBe(0);
  });

  it("excludes cutting-process and metallurgy rows but keeps cylinder safety", () => {
    expect(isExcludedWeldingTopic({ 문제: "절단산소 압력의 기준은?" })).toBe(true);
    expect(isExcludedWeldingTopic({ 문제: "금속 상태도의 공석점은?" })).toBe(true);
    expect(isExcludedWeldingTopic({ 문제: "산소용기에 기름을 묻히면 안 되는 이유는?" })).toBe(false);
    expect(normalizeWeldingSafetyCategory("가스용기·조정기·역화")).toBe(
      "가스용기·조정기·호스",
    );
  });

  it("imports only complete, unique questions and blocks publication", () => {
    const validRow = {
      문항ID: "WS33-Q001",
      출처회차: "2018년 8월 19일",
      안전분류: "감전·전기설비",
      문제: "감전자를 발견했을 때 가장 먼저 할 조치는?",
      "보기①": choices[0],
      "보기②": choices[1],
      "보기③": choices[2],
      "보기④": choices[3],
      정답: "①",
      근거: "구조자의 2차 감전을 막기 위해 전원을 우선 차단한다.",
      "CBT 출처": "https://example.com/cbt",
    };
    const dataset = buildWeldingSafetyReviewDataset({
      questionRows: [
        validRow,
        { ...validRow },
        {
          ...validRow,
          문제: "절단팁 번호를 고르는 기준은?",
        },
        {
          ...validRow,
          문제: "보기 하나가 빠진 불완전 문항",
          "보기④": "",
        },
      ],
      lessonRows: [
        {
          보강주제: "감전 구조와 응급조치",
          "핵심정의·학습목표": "전원 차단과 구조자의 안전을 설명한다.",
          "필수 세부항목": "전원 차단, 절연 분리, 신고",
          "시험함정·주의": "맨손으로 접촉하지 않는다.",
          연결문제: "감전 구조",
        },
      ],
      reviewRows: [
        {
          신규ID: "WS33-Q001",
          우선순위: 1,
          검수지침: "공식 출처와 정답을 확인한다.",
        },
      ],
      roundRows: [
        {
          순번: 1,
          시행일: "2018-08-19",
          종목: "용접산업기사",
          수집상태: "안전패턴 검토완료",
          "최종 신규문항": 1,
        },
      ],
      sourceFile: "설비보전기사_용접안전_전용문제은행_33차.xlsx",
      sourceSha256: "abc123",
      sourceReportFile: "설비보전기사_용접안전_전용문제은행_33차_보고서.md",
      sourceReportSha256: "def456",
      questionSheet: "안전문제_통합_283",
      lessonSheet: "안전이론_레슨_30",
      reviewSheet: "검수대기_150",
      roundSheet: "CBT_전회차_완료현황",
      generatedAt: "2026-07-23T00:00:00.000Z",
    });

    expect(dataset.counts).toEqual({
      importedQuestions: 1,
      importedLessons: 1,
      importedReviewQueueEntries: 1,
      importedRounds: 1,
      completedRounds: 1,
      siteDuplicateCandidates: 0,
      missingAuthoritativeSources: 1,
      excludedRows: 1,
      duplicateRows: 1,
      invalidRows: 1,
    });
    expect(dataset.questions[0].correctChoiceIndex).toBe(0);
    expect(dataset.questions[0].publicationStatus).toBe("blocked");
    expect(dataset.questions[0].blockers).toEqual(
      expect.arrayContaining([
        "authoritative_source_required",
        "choice_feedback_required",
        "theory_link_required",
      ]),
    );
    expect(dataset.lessons[0].publicationStatus).toBe("blocked");
    expect(dataset.rounds[0].collectionStatus).toBe("안전패턴 검토완료");
  });
});
