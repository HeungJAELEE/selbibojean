import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PracticalSequenceQuestion } from "@/components/practical-sequence-question";
import type {
  PublicPracticalSequenceVisualAid,
  PublicPracticalQuestion,
} from "@/lib/domain/practical-types";

const question = {
  id: "sequence-question",
  kind: "predicted",
  title: "버니어캘리퍼스 점검·측정·판독 3단계",
  formatLabel: "사진을 끌어 올바른 작업순서로 배열",
  stem: "사진을 올바른 작업순서로 배열하시오.",
  conceptIds: ["PCON-014"],
  primaryStudyCategoryId: "work_procedure",
  studyCategoryIds: ["work_procedure", "visual_identification"],
  ncsSources: [],
  visualAidId: "sequence-visual",
  label: "predicted_exam",
  auditDisposition: "verified",
  contentStatus: "published",
  occurrence: null,
  predictedBasis: "NCS 작업 장면 기반",
  examFormat: "sequence",
  examCardIds: [],
  visualAidIds: ["sequence-visual"],
  sequenceItemIds: ["step-1", "step-2"],
  unit: null,
  variantOfQuestionId: null,
  examEvidenceStatus: "ncs_supplement",
} satisfies PublicPracticalQuestion;

const visualAid = {
  layout: "grid",
  frames: [
    {
      id: "opaque-step-a",
      imageUrl:
        "/api/practical/sequence-frame/sequence-question/opaque-step-a",
      promptAltText: "작업 순서를 판단하기 위한 첫 번째 장면",
      captionBeforeAnswer: null,
    },
    {
      id: "opaque-step-b",
      imageUrl:
        "/api/practical/sequence-frame/sequence-question/opaque-step-b",
      promptAltText: "작업 순서를 판단하기 위한 두 번째 장면",
      captionBeforeAnswer: "공작물을 측정면에 바르게 물린다.",
    },
  ],
} satisfies PublicPracticalSequenceVisualAid;

describe("practical sequence question", () => {
  it("shows the task context and a learner-safe action description before submission", () => {
    render(
      <PracticalSequenceQuestion
        question={question}
        visualAid={visualAid}
        initialFrameIds={["opaque-step-b", "opaque-step-a"]}
      />,
    );

    expect(screen.getByText("정렬할 작업")).toBeInTheDocument();
    expect(screen.getByText(question.title)).toBeInTheDocument();
    expect(
      screen.getByText("공작물을 측정면에 바르게 물린다."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("작업 순서를 판단하기 위한 첫 번째 장면"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("측정면을 청소하고 0점을 확인한다."),
    ).not.toBeInTheDocument();
  });

  it("uses a horizontal large-card strip for the portrait drive-unit sequence", () => {
    const { container } = render(
      <PracticalSequenceQuestion
        question={{
          ...question,
          title: "기계 구동장치 조립 공정 5단계",
        }}
        visualAid={{
          ...visualAid,
          layout: "horizontal-portrait-strip",
        }}
        initialFrameIds={["opaque-step-b", "opaque-step-a"]}
      />,
    );

    const sequence = container.querySelector(
      '[data-layout="horizontal-portrait-strip"]',
    );
    expect(sequence).not.toBeNull();
    expect(sequence).toHaveAttribute(
      "data-layout",
      "horizontal-portrait-strip",
    );
    expect(sequence).toHaveClass("overflow-x-auto");
  });
});
