import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LessonExamTypes } from "@/components/lesson-exam-types";
import { LessonPracticeSet } from "@/components/lesson-practice-set";
import { PastExamExamples } from "@/components/past-exam-examples";
import generatedContent from "@/data/generated/content.json";
import type {
  PastExamExample,
  PastExamPatternSummary,
} from "@/lib/content/past-exam-examples";
import { getPastExamPatternSummary } from "@/lib/content/past-exam-examples";
import type { GeneratedContent, LessonBlock } from "@/lib/domain/types";
import {
  isPublishableQuestion,
  toPublicQuestion,
} from "@/lib/domain/practice";
import { buildRuntimeContent } from "@/lib/content/runtime-content";

const pastExam: PastExamExample = {
  externalId: "2024-1-Q01",
  canonicalId: "U-001",
  year: 2024,
  sessionLabel: "1회",
  questionNumber: 1,
  stem: "공압장치의 일반적인 장점으로 옳은 것은?",
  choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
  choiceIds: ["c1", "c2", "c3", "c4"],
  sourceUrl: "https://example.com/source",
  format: "concept",
};
const content = generatedContent as GeneratedContent;
const runtimeContent = buildRuntimeContent(content);

describe("lesson learning structure", () => {
  it("counts every verified direct variant when calculating lesson frequency", () => {
    const specificGravity = getPastExamPatternSummary(
      content,
      "lesson-1o82821",
    );
    const weldingClassification = getPastExamPatternSummary(
      content,
      "lesson-1ec09vl",
    );

    expect(specificGravity).toMatchObject({
      total: 1,
      patterns: [{ format: "concept", count: 1, percentage: 100 }],
    });
    expect(weldingClassification).toMatchObject({
      total: 2,
      patterns: [
        { format: "negative", count: 2, percentage: 100 },
      ],
    });
    expect(
      getPastExamPatternSummary(content, "lesson-1pa2qba"),
    ).toMatchObject({
      total: 2,
      patterns: [
        {
          format: "calculation",
          count: 2,
          percentage: 100,
          representativeAnswer: "te=(a+4m+b)/6",
          representativeExplanation:
            "PERT는 최빈시간에 4의 가중치를 주어 베타분포의 기대시간을 계산한다.",
        },
      ],
    });
  });

  it("combines authored exam points with direct past-exam frequency", () => {
    const summary: PastExamPatternSummary = {
      total: 3,
      patterns: [
        {
          format: "negative",
          count: 2,
          percentage: 67,
          representative: { ...pastExam, format: "negative" },
          representativeAnswer: "대표 정답 A",
          representativeExplanation: "대표 해설 A",
        },
        {
          format: "concept",
          count: 1,
          percentage: 33,
          representative: pastExam,
          representativeAnswer: "대표 정답 B",
          representativeExplanation: "대표 해설 B",
        },
      ],
    };
    const authoredPoint: LessonBlock = {
      id: "exam-point",
      kind: "exam_point",
      title: "시험 포인트",
      body: "- 모재를 녹이면 융접으로 분류합니다.",
      order: 8,
    };
    render(
      <LessonExamTypes
        summary={summary}
        authoredPoints={[authoredPoint]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "시험에 자주 출제되는 유형" }),
    ).toBeVisible();
    expect(screen.getByText("미리 정리한 시험 포인트")).toBeVisible();
    expect(screen.getByText(/모재를 녹이면 융접/)).toBeVisible();
    expect(screen.getByText("2건 · 67%")).toBeVisible();
    expect(screen.getByText("대표 정답 A")).toBeVisible();
    expect(screen.getByText("대표 해설 A")).toBeVisible();
    expect(screen.getAllByText(/공압장치의 일반적인 장점/)).toHaveLength(2);
  });

  it("separates actual CBT questions from five mock questions", () => {
    render(
      <>
        <PastExamExamples examples={Array.from({ length: 5 }, (_, index) => ({
          ...pastExam,
          externalId: `2024-1-Q0${index + 1}`,
          questionNumber: index + 1,
        }))} initialCount={5} />
        <LessonPracticeSet
          questions={content.questions
            .filter(isPublishableQuestion)
            .slice(0, 5)
            .map(toPublicQuestion)}
        />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "실제 CBT 기출 5문제 풀기" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "모의고사 5문제 풀기" }),
    ).toBeVisible();
    expect(screen.getAllByText("문제와 보기 펼치기")).toHaveLength(5);
    expect(screen.queryByRole("link", { name: /모의 문제/ })).toBeNull();
  });

  it("replaces generic group principles with concept-specific learning backgrounds", () => {
    const specificGravity = runtimeContent.lessons.find(
      (lesson) => lesson.id === "lesson-1o82821",
    );
    const pneumaticFeatures = runtimeContent.lessons.find(
      (lesson) => lesson.id === "lesson-ql41oa",
    );
    const pert = runtimeContent.lessons.find(
      (lesson) => lesson.id === "lesson-1pa2qba",
    );

    const specificGravityBackground = specificGravity?.blocks.find(
      (block) => block.kind === "principle",
    );
    const pneumaticBackground = pneumaticFeatures?.blocks.find(
      (block) => block.kind === "principle",
    );
    const pertBackground = pert?.blocks.find(
      (block) => block.kind === "principle",
    );

    expect(specificGravityBackground).toMatchObject({
      title: "의미·용도와 계산 배경",
    });
    expect(specificGravityBackground?.body).toContain("기준물질의 밀도");
    expect(specificGravityBackground?.body).toContain("언제 사용하는가");
    expect(specificGravityBackground?.body).not.toContain(
      "유량은 액추에이터의 이동속도",
    );

    expect(pneumaticBackground?.body).toContain("공기는 비가연성");
    expect(pneumaticBackground?.body).not.toContain("리미트 신호");

    expect(pertBackground?.body).toContain("최빈시간에 4의 가중치");
    expect(pertBackground?.body).not.toContain("기어메시 주파수");
  });
});
