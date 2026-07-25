import { describe, expect, it, vi } from "vitest";
import {
  getBdaSourcePracticeAudit,
  getBdaSourcePracticeQuestion,
  getPublicBdaSourcePracticeBlocks,
  gradeBdaSourcePractice,
} from "@/lib/content/bda-source-practice-repository";

vi.mock("server-only", () => ({}));

describe("BDA source practice publication", () => {
  it("publishes every canonical source exercise block after review", () => {
    const audit = getBdaSourcePracticeAudit();
    expect(audit.heldBlockIds).toEqual([]);
    expect(audit).toMatchObject({
      sourceBlockCount: 100,
      publishedBlockCount: 100,
      heldBlockCount: 0,
    });
    expect(audit.publishedQuestionCount).toBe(109);
  });

  it("keeps answer material out of the public lesson payload", () => {
    const serialized = JSON.stringify(
      ["s1-final", "s2-final", "s3-final", "s4-final"].flatMap(
        getPublicBdaSourcePracticeBlocks,
      ),
    );

    expect(serialized).not.toContain("correctChoiceId");
    expect(serialized).not.toContain("answerText");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("reviewNote");
  });

  it("corrects the DIKW marker conflict and reveals answer 3 only after submit", () => {
    const publicBlock = getPublicBdaSourcePracticeBlocks("s1-final").find(
      (block) => block.id === "s1-final-b001",
    );
    const question = publicBlock?.questions[0];

    expect(question).toBeDefined();
    expect(question?.choices).toHaveLength(4);
    expect(question?.choices.map((choice) => choice.text).join(" ")).not.toContain("✅");

    const feedback = gradeBdaSourcePractice(
      question!.id,
      question!.choices[2].id,
    );
    expect(feedback?.isCorrect).toBe(true);
    expect(feedback?.correctChoice?.order).toBe(3);
  });

  it("publishes corrected lift calculation as option 3 and 1.67", () => {
    const question = getBdaSourcePracticeQuestion("s3-final-b027-q1");
    expect(question?.reviewDisposition).toBe("corrected");

    const feedback = gradeBdaSourcePractice(
      question!.id,
      question!.choices[2].id,
    );
    expect(feedback?.correctChoice?.order).toBe(3);
    expect(feedback?.answerText).toBe("1.67");
  });

  it("publishes structurally complete and reviewed questions only", () => {
    const blocks = ["s1-final", "s2-final", "s3-final", "s4-final"].flatMap(
      getPublicBdaSourcePracticeBlocks,
    );
    const questions = blocks.flatMap((block) => block.questions);

    expect(questions.length).toBeGreaterThanOrEqual(100);
    for (const question of questions) {
      expect(question.stem.length).toBeGreaterThan(5);
      expect(question.reviewStatus).toBe("검수 완료");
      expect(question.stem).not.toMatch(/\[\[|<details|<summary>/);
      const privateQuestion = getBdaSourcePracticeQuestion(question.id);
      expect(privateQuestion?.answerText.length).toBeGreaterThan(0);
      expect(privateQuestion?.explanation.length).toBeGreaterThan(10);
      if (question.mode === "multiple_choice") {
        expect(question.choices, question.id).toHaveLength(4);
        expect(new Set(question.choices.map((choice) => choice.text)).size).toBe(
          question.choices.length,
        );
        expect(
          question.choices.some(
            (choice) => choice.id === privateQuestion?.correctChoiceId,
          ),
        ).toBe(true);
        expect(question.choices.map((choice) => choice.text).join(" ")).not.toMatch(
          /(?:정답|해설)\s*[:：]/,
        );
      }
    }
  });
});
