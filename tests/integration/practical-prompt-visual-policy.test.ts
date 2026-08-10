import { describe, expect, it, vi } from "vitest";
import {
  isApprovedReconstructedPastPromptVisualMapping,
} from "@/data/source/practical-visual-coverage";
import {
  getPracticalContent,
  getPracticalWrittenExamCards,
  getPublicPracticalQuestionVisualAids,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";

vi.mock("server-only", () => ({}));

const reconstructedPastPromptMappings = new Map([
  ["P-2025-1-Q05", "diagram-third-angle-projection-problem"],
  ["P-2025-1-Q09", "diagram-ghs-pictograms-problem"],
  ["P-2025-2-Q03", "diagram-bracket-drawing-annotations"],
  ["P-2025-2-Q05", "diagram-vernier-48-2"],
  ["P-2025-3-Q04", "diagram-thread-profiles"],
  ["P-2025-3-Q05", "diagram-shaft-misalignment"],
  ["P-2025-3-Q07", "diagram-dial-vblock"],
  ["P-2026-1-Q03", "diagram-drive-unit-section-labels"],
  ["P-2026-1-Q09", "diagram-external-gear-pump-drawing"],
]);

describe("full practical prompt visual pool", () => {
  it("renders only the nine approved self-authored reconstructions for past prompts", async () => {
    const questions = publicPracticalQuestions();
    const exposedReconstructedPairs: string[] = [];

    expect(questions).toHaveLength(261);

    for (const question of questions) {
      const usage =
        question.kind === "past"
          ? "past_exam_prompt"
          : "variant_exam_prompt";
      const visualAids = await getPublicPracticalQuestionVisualAids(
        question,
        usage,
      );

      expect(
        visualAids.every((visualAid) => visualAid.originType !== "ai_generated"),
        question.id,
      ).toBe(true);

      if (question.kind !== "past") continue;
      for (const visualAid of visualAids.filter(
        (item) => item.originType === "self_authored",
      )) {
        expect(
          isApprovedReconstructedPastPromptVisualMapping(
            question.id,
            visualAid.id,
          ),
          `${question.id}/${visualAid.id}`,
        ).toBe(true);
        exposedReconstructedPairs.push(`${question.id}/${visualAid.id}`);
      }
    }

    expect(exposedReconstructedPairs.sort()).toEqual(
      [...reconstructedPastPromptMappings]
        .map(([questionId, visualAidId]) => `${questionId}/${visualAidId}`)
        .sort(),
    );

    for (const [questionId, visualAidId] of reconstructedPastPromptMappings) {
      const question = questions.find((item) => item.id === questionId);
      expect(question, questionId).toBeDefined();
      await expect(
        getPublicPracticalQuestionVisualAids(
          question!,
          "past_exam_prompt",
        ),
      ).resolves.toMatchObject([{ id: visualAidId }]);
    }
  });

  it("keeps drip lubrication on SUP-032 and out of the limit-switch variant", async () => {
    const questions = publicPracticalQuestions();
    const past = questions.find((item) => item.id === "P-2026-2-Q05");
    const limitSwitch = questions.find((item) => item.id === "EXP-SUP-039");
    const content = await getPracticalContent();
    const cards = await getPracticalWrittenExamCards();
    const lubricationConcept = content.concepts.find(
      (item) => item.id === "PCON-SUP-032",
    );
    const limitSwitchConcept = content.concepts.find(
      (item) => item.id === "PCON-SUP-039",
    );

    expect(past?.conceptIds).toEqual(["PCON-SUP-032"]);
    expect(limitSwitch?.conceptIds).toEqual(["PCON-SUP-039"]);
    expect(lubricationConcept).toMatchObject({
      labels: ["practical_exam", "predicted_exam"],
      relatedPastQuestionIds: ["P-2026-2-Q05"],
      visualAidIds: ["diagram-drip-lubrication"],
    });
    expect(limitSwitchConcept).toMatchObject({
      labels: ["predicted_exam"],
      relatedPastQuestionIds: [],
      visualAidIds: [],
    });
    await expect(
      getPublicPracticalQuestionVisualAids(
        limitSwitch!,
        "variant_exam_prompt",
      ),
    ).resolves.not.toEqual(
      expect.arrayContaining([{ id: "diagram-drip-lubrication" }]),
    );
    expect(
      cards.some(
        (card) =>
          card.pastQuestionIds.includes("P-2026-2-Q05") &&
          card.variantQuestionIds.includes("EXP-SUP-039"),
      ),
    ).toBe(false);
    expect(
      cards
        .filter((card) =>
          card.predictedQuestionIds.includes("EXP-SUP-039"),
        )
        .some((card) =>
          card.visualAidIds.includes("diagram-drip-lubrication"),
        ),
    ).toBe(false);
  });
});
