"use client";

import { useState } from "react";
import type { PracticeFeedback, PublicQuestion } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { PracticeFeedbackPanel } from "@/components/practice-feedback";

export function SingleQuestion({ question }: { question: PublicQuestion }) {
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, choiceId: choice, selfRating: "unsure", attemptKind: "initial" }),
      });
      const result = await response.json() as PracticeFeedback & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "채점하지 못했습니다.");
      setFeedback(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "채점하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 md:p-9">
      <p className="text-sm font-bold text-[#16697a]">{question.id}</p>
      {(question.provenance.reconstructed || question.provenance.historical) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          {question.provenance.reconstructed && <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">원문 근거 학습용 재구성</span>}
          {question.provenance.historical && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">과거 시험 맥락</span>}
        </div>
      )}
      <h1 className="mt-5 text-2xl font-extrabold leading-relaxed">{question.stem}</h1>
      <div className="mt-7 grid gap-3">
        {question.choices.map((item) => (
          <button
            key={item.id}
            disabled={Boolean(feedback)}
            onClick={() => setChoice(item.id)}
            className={cn(
              "rounded-xl border p-4 text-left",
              choice === item.id ? "border-[#16697a] bg-[#eaf7f6]" : "border-slate-200",
              feedback && item.id === feedback.correctChoice.id && "border-emerald-500 bg-emerald-50",
            )}
          >
            {item.order}. {item.text}
          </button>
        ))}
      </div>
      {!feedback && (
        <button disabled={!choice || loading} onClick={submit} className="mt-7 w-full rounded-xl bg-[#173957] p-4 font-extrabold text-white disabled:opacity-40">
          {loading ? "채점 중…" : "답안 제출"}
        </button>
      )}
      {feedback && <PracticeFeedbackPanel feedback={feedback} lessonHref={feedback.lesson.href} />}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}
