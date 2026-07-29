import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getBdaLearningPractice,
  getBdaQbankLearningItem,
} from "@/lib/content/bda-qbank-repository";
import type { BdaQbankLearningFeedback } from "@/lib/domain/bda-qbank";

const submitSchema = z.object({
  itemId: z.string().min(1).max(120),
  choiceId: z.string().min(1).max(180),
});

export async function POST(request: Request) {
  const parsed = submitSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "문제와 선택한 보기를 확인해 주세요." },
      { status: 400 },
    );
  }

  const item = getBdaQbankLearningItem(parsed.data.itemId);
  const practice = getBdaLearningPractice(parsed.data.itemId);
  if (!item) {
    return NextResponse.json(
      { error: "연결된 학습문제를 찾지 못했습니다." },
      { status: 404 },
    );
  }
  if (!practice) {
    return NextResponse.json(
      { error: "이 항목은 정답 재검수 중이라 현재 채점할 수 없습니다." },
      { status: 409 },
    );
  }
  const selectedChoice = practice.publicItem.choices.find(
    (choice) => choice.id === parsed.data.choiceId,
  );
  const correctChoice = practice.publicItem.choices.find(
    (choice) => choice.id === practice.correctChoiceId,
  );
  if (!selectedChoice || !correctChoice) {
    return NextResponse.json(
      { error: "이 문제에 포함된 보기 중 하나를 선택해 주세요." },
      { status: 400 },
    );
  }

  const feedback: BdaQbankLearningFeedback = {
    itemId: item.id,
    isCorrect: selectedChoice.id === correctChoice.id,
    selectedChoice,
    correctChoice,
    answerCore: correctChoice.text,
    independentExplanation:
      practice.explanationOverride ||
      item.independentExplanation?.trim() ||
      practice.publicItem.practiceNotice,
    technicalValidationStatus: item.technicalValidationStatus,
    reviewStatus: item.reviewStatus,
    evidenceGrade: item.evidenceGrade,
    notice:
      "공식 정답이 아니라 현재 근거등급과 검수상태에 따른 학습용 정답 핵심입니다.",
  };

  return NextResponse.json(feedback);
}
