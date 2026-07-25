import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getBdaSourcePracticeQuestion,
  gradeBdaSourcePractice,
} from "@/lib/content/bda-source-practice-repository";

const submissionSchema = z.object({
  questionId: z.string().trim().min(1),
  choiceId: z.string().trim().min(1).optional(),
  response: z.string().trim().min(1).max(2_000).optional(),
});

export async function POST(request: Request) {
  const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "문제와 답안을 확인한 뒤 다시 제출해 주세요." },
      { status: 400 },
    );
  }

  const question = getBdaSourcePracticeQuestion(parsed.data.questionId);
  if (!question) {
    return NextResponse.json(
      { error: "검수된 원천 문제를 찾지 못했습니다." },
      { status: 404 },
    );
  }

  const feedback = gradeBdaSourcePractice(
    parsed.data.questionId,
    parsed.data.choiceId,
    parsed.data.response,
  );
  if (!feedback) {
    return NextResponse.json(
      { error: "선택지 또는 직접 작성한 답안을 먼저 제출해 주세요." },
      { status: 400 },
    );
  }

  return NextResponse.json(feedback, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
