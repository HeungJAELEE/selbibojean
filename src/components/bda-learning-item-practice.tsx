"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import type {
  BdaQbankLearningFeedback,
  PublicBdaQbankLearningItem,
} from "@/lib/domain/bda-qbank";

export function BdaLearningItemPractice({
  item,
}: {
  item: PublicBdaQbankLearningItem;
}) {
  const [attempt, setAttempt] = useState("");
  const [feedback, setFeedback] =
    useState<BdaQbankLearningFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, attempt }),
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
    setAttempt("");
    setFeedback(null);
    setError("");
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <label
        htmlFor={`attempt-${item.id}`}
        className="text-sm font-black text-[#142f4b]"
      >
        내 답안 정리
      </label>
      <textarea
        id={`attempt-${item.id}`}
        value={attempt}
        onChange={(event) => setAttempt(event.target.value)}
        disabled={Boolean(feedback)}
        rows={3}
        placeholder="핵심 개념과 판단 근거를 먼저 적어 보세요."
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
      />

      {!feedback ? (
        <button
          type="button"
          disabled={!attempt.trim() || loading}
          onClick={submit}
          className="mt-3 w-full rounded-xl bg-[#142f4b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "확인 중…" : "내 답안 제출 · 정답 핵심 확인"}
        </button>
      ) : (
        <section
          className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-teal-950">
            <CheckCircle2 size={18} />
            <h4 className="font-black">학습용 정답 핵심</h4>
          </div>
          <p className="mt-3 leading-7 text-teal-950">
            {feedback.answerCore}
          </p>
          {feedback.independentExplanation ? (
            <div className="mt-3 rounded-xl bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[.12em] text-[#0f766e]">
                독립 해설
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {feedback.independentExplanation}
              </p>
            </div>
          ) : null}
          <p className="mt-3 text-xs leading-5 text-teal-900">
            {feedback.notice}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            <span>기술 검토: {feedback.technicalValidationStatus ?? "미확정"}</span>
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
