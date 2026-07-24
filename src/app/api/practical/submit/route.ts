import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPracticalConcept,
  getPracticalQuestion,
  isPublishablePracticalQuestion,
} from "@/lib/content/practical-repository";
import type { PracticalReveal } from "@/lib/domain/practical-types";
import { SELF_RATINGS } from "@/lib/domain/types";

const schema = z.object({
  questionId: z.string().min(1).max(80),
  answer: z.string().trim().min(1).max(10000),
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

  const concepts = (
    await Promise.all(question.conceptIds.map((id) => getPracticalConcept(id)))
  ).filter((concept) => Boolean(concept));
  const feedback: PracticalReveal = {
    questionId: question.id,
    modelAnswer: question.modelAnswer,
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
      label: `NCS ${source.documentTitle}`,
      href: source.sourceUrl,
      page: `PDF p.${source.pdfPage ?? "확인 중"}${
        source.figureNumber ? ` · ${source.figureNumber}` : ""
      }`,
    })),
    selfRating: parsed.data.selfRating,
  };
  return NextResponse.json(feedback);
}
