import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPracticalConcept,
  getPracticalQuestion,
  getPracticalVisualAid,
  isPublishablePracticalQuestion,
} from "@/lib/content/practical-repository";
import type { PracticalReveal } from "@/lib/domain/practical-types";
import { isCorrectSequence } from "@/lib/practical-sequence";
import {
  resolvePracticalSequenceFrameTokens,
  toPracticalSequenceFrameTokens,
} from "@/lib/practical-sequence-server";
import { SELF_RATINGS } from "@/lib/domain/types";

const schema = z.object({
  questionId: z.string().min(1).max(80),
  answer: z.string().trim().min(1).max(10000),
  sequenceFrameIds: z.array(z.string().min(1).max(160)).max(12).optional(),
  selfRating: z.enum(SELF_RATINGS).default("unknown"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "문제 식별값을 확인해 주세요." },
      { status: 400 },
    );
  }
  const question = await getPracticalQuestion(parsed.data.questionId);
  if (!question || !isPublishablePracticalQuestion(question)) {
    return NextResponse.json(
      { error: "현재 공개된 실기 문제가 아닙니다." },
      { status: 404 },
    );
  }

  let sequenceResult: PracticalReveal["sequenceResult"];
  if (parsed.data.sequenceFrameIds) {
    const visualAid = await getPracticalVisualAid(question.visualAidId);
    const canonicalIds = (visualAid?.frames ?? []).map((frame) => frame.id);
    const submittedCanonicalIds = visualAid
      ? resolvePracticalSequenceFrameTokens(
          question.id,
          visualAid,
          parsed.data.sequenceFrameIds,
        )
      : null;
    if (
      question.examFormat !== "sequence" ||
      !visualAid ||
      canonicalIds.length < 2 ||
      !submittedCanonicalIds
    ) {
      return NextResponse.json(
        { error: "사진 순서 항목을 다시 확인해 주세요." },
        { status: 400 },
      );
    }
    const correctFrameIds = toPracticalSequenceFrameTokens(
      question.id,
      visualAid,
      canonicalIds,
    );
    if (!correctFrameIds) {
      return NextResponse.json(
        { error: "사진 순서 구성을 확인해 주세요." },
        { status: 500 },
      );
    }
    sequenceResult = {
      isCorrect: isCorrectSequence(submittedCanonicalIds, canonicalIds),
      correctFrameIds,
      frameFeedback: visualAid.frames.map((frame, index) => ({
        frameId: correctFrameIds[index],
        learningAltText: frame.learningAltText,
        captionAfterAnswer: frame.captionAfterAnswer,
      })),
    };
  }

  const concepts = (
    await Promise.all(question.conceptIds.map((id) => getPracticalConcept(id)))
  ).filter((concept) => Boolean(concept));
  const feedback: PracticalReveal = {
    questionId: question.id,
    modelAnswer: question.modelAnswer,
    answerDefinition: question.answerDefinition,
    memoryTip: question.memoryTip,
    requiredKeywords: question.requiredKeywords,
    acceptedAnswers: question.acceptedAnswers,
    calculation: question.calculation,
    unit: question.unit,
    rubric: question.rubric,
    traps: question.traps,
    conceptLinks: concepts.map((concept) => ({
      id: concept!.id,
      title: concept!.title,
      href: `/practical/written/theory/${concept!.id}`,
    })),
    sourceLinks: question.ncsSources.map((source) => ({
      label:
        source.sourceKind === "official_reference" ||
        source.sourceKind === "written_question_bank"
          ? source.documentTitle
          : `NCS ${source.documentTitle}`,
      href: source.sourceUrl,
      page:
        source.sourceKind === "written_question_bank"
          ? "필기 기출·해설 근거"
          : `${
              source.sourceKind === "official_reference" ? "공식 근거" : "PDF"
            } p.${source.pdfPage ?? "확인 중"}${
              source.figureNumber ? ` · ${source.figureNumber}` : ""
            }`,
    })),
    selfRating: parsed.data.selfRating,
    sequenceResult,
  };
  return NextResponse.json(feedback);
}
