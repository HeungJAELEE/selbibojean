"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type {
  BdaQbankLearningFeedback,
  PublicBdaQbankLearningItem,
} from "@/lib/domain/bda-qbank";
import { cn } from "@/lib/utils";

const subscribeToHydration = () => () => {};

export function BdaLearningItemPractice({
  item,
}: {
  item: PublicBdaQbankLearningItem;
}) {
  const [choiceId, setChoiceId] = useState("");
  const [feedback, setFeedback] =
    useState<BdaQbankLearningFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, choiceId }),
      });
      const result = (await response.json()) as BdaQbankLearningFeedback & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "해설을 불러오지 못했습니다.");
      }
      setFeedback(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "해설을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setChoiceId("");
    setFeedback(null);
    setError("");
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
        <p className="text-xs font-black uppercase tracking-[.12em] text-[#0f766e]">
          실전형 재구성 문제
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          학습 목표 · {item.paraphrasedLearningPrompt}
        </p>
        <h4 className="mt-3 text-lg font-black leading-8 text-[#142f4b]">
          {item.questionStem}
        </h4>
      </div>

      <div className="mt-4 grid gap-3" role="radiogroup" aria-label="문제 보기">
        {item.choices.map((choice) => {
          const isSelected = choiceId === choice.id;
          const isCorrectAfterSubmit =
            feedback && choice.id === feedback.correctChoice.id;
          const isWrongSelection =
            feedback &&
            choice.id === feedback.selectedChoice.id &&
            !feedback.isCorrect;

          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!hydrated || Boolean(feedback)}
              onClick={() => setChoiceId(choice.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                isSelected
                  ? "border-[#0f766e] bg-[#effaf7]"
                  : "border-slate-200 bg-white hover:border-slate-400",
                isCorrectAfterSubmit && "border-emerald-500 bg-emerald-50",
                isWrongSelection && "border-rose-400 bg-rose-50",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-sm font-black">
                {choice.order}
              </span>
              <span className="pt-0.5 leading-6 text-slate-800">
                {choice.text}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {item.practiceNotice}
      </p>

      {!feedback ? (
        <button
          type="button"
          disabled={!hydrated || !choiceId || loading}
          onClick={submit}
          className="mt-3 w-full rounded-xl bg-[#142f4b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "채점 중…" : "선택한 보기 제출"}
        </button>
      ) : (
        <section
          className={cn(
            "mt-4 rounded-2xl border p-4",
            feedback.isCorrect
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50",
          )}
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-slate-900">
            {feedback.isCorrect ? (
              <CheckCircle2 size={18} className="text-emerald-700" />
            ) : (
              <XCircle size={18} className="text-rose-700" />
            )}
            <h4 className="font-black">
              {feedback.isCorrect ? "정답입니다." : "다시 확인해 보세요."}
            </h4>
          </div>
          <p className="mt-3 leading-7 text-slate-800">
            <strong>정답 {feedback.correctChoice.order}번</strong> ·{" "}
            {feedback.correctChoice.text}
          </p>
          {feedback.independentExplanation ? (
            <div className="mt-3 rounded-xl bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[.12em] text-[#0f766e]">
                정답 해설
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {feedback.independentExplanation}
              </p>
            </div>
          ) : null}
          <div className="mt-3 rounded-xl border border-slate-200 bg-white/85 p-4">
            <p className="text-xs font-black uppercase tracking-[.12em] text-[#0f766e]">
              선택지별 근거
            </p>
            <ol className="mt-3 grid gap-3">
              {feedback.choiceFeedback
                .slice()
                .sort((left, right) => left.choice.order - right.choice.order)
                .map((choiceFeedback) => (
                  <li
                    key={choiceFeedback.choice.id}
                    className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                  >
                    <p className="font-black text-[#142f4b]">
                      {choiceFeedback.choice.order}번 ·{" "}
                      {choiceFeedback.isCorrect ? "정답 근거" : "오답 근거"}
                      {choiceFeedback.isSelected ? " · 내가 선택" : ""}
                    </p>
                    <p className="mt-1">{choiceFeedback.rationale}</p>
                  </li>
                ))}
            </ol>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            {feedback.notice}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            <span>
              기술 검토: {feedback.technicalValidationStatus ?? "미확정"}
            </span>
            <span>검수: {feedback.reviewStatus ?? "미검수"}</span>
            <span>근거등급: {feedback.evidenceGrade ?? "C"}</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-white px-4 py-2 text-sm font-black text-teal-900"
          >
            <RotateCcw size={15} /> 다시 풀기
          </button>
        </section>
      )}

      {error ? (
        <p
          className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
