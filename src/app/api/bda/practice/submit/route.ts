import { NextResponse } from "next/server";
import { getBdaQuestion } from "@/lib/content/bda-repository";
import { bdaSubmitSchema, gradeBdaQuestion } from "@/lib/domain/bda";

export async function POST(request: Request) {
  const parsed = bdaSubmitSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "문제와 선택지를 확인해 주세요." },
      { status: 400 },
    );
  }

  const question = getBdaQuestion(parsed.data.questionId);
  if (!question) {
    return NextResponse.json(
      { error: "현재 공개된 문제가 아닙니다." },
      { status: 404 },
    );
  }

  if (!question.choices.some((choice) => choice.id === parsed.data.choiceId)) {
    return NextResponse.json(
      { error: "유효한 선택지가 아닙니다." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    gradeBdaQuestion(question, parsed.data.choiceId),
  );
}
