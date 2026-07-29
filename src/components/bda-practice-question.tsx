"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type {
  BdaPracticeFeedback,
  PublicBdaQuestion,
} from "@/lib/domain/bda";
import { cn } from "@/lib/utils";

const subscribeToHydration = () => () => {};

export function BdaPracticeQuestion({
  question,
  headingAs: QuestionHeading = "h3",
}: {
  question: PublicBdaQuestion;
  headingAs?: "h1" | "h3" | "h4";
}) {
  const [choiceId, setChoiceId] = useState("");
  const [feedback, setFeedback] = useState<BdaPracticeFeedback | null>(null);
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
      const response = await fetch("/api/bda/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, choiceId }),
      });
      const result = (await response.json()) as BdaPracticeFeedback & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "채점하지 못했습니다.");
      }
      setFeedback(result);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "채점하지 못했습니다.",
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
    <article className="card overflow-hidden">
      <header className="border-b border-slate-200 bg-slate-50 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#dff6f1] px-3 py-1 text-[#0f766e]">
            자체 제작
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
            개념 확인문제
          </span>
        </div>
        <QuestionHeading className="mt-5 text-xl font-black leading-relaxed text-[#142f4b] sm:text-2xl">
          {question.stem}
        </QuestionHeading>
      </header>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3" role="group" aria-label="문제 보기">
          {question.choices.map((choice) => {
            const correctAfterSubmit =
              feedback && choice.id === feedback.correctChoice.id;
            const wrongSelection =
              feedback &&
              choice.id === feedback.selectedChoice.id &&
              !feedback.isCorrect;

            return (
              <button
                key={choice.id}
                type="button"
                disabled={!hydrated || Boolean(feedback)}
                aria-pressed={choiceId === choice.id}
                onClick={() => setChoiceId(choice.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                  choiceId === choice.id
                    ? "border-[#0f766e] bg-[#effaf7]"
                    : "border-slate-200 hover:border-slate-400",
                  correctAfterSubmit && "border-emerald-500 bg-emerald-50",
                  wrongSelection && "border-rose-400 bg-rose-50",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-sm font-black">
                  {choice.order}
                </span>
                <span className="pt-0.5 leading-6">{choice.text}</span>
              </button>
            );
          })}
        </div>

        {!feedback ? (
          <button
            type="button"
            disabled={!hydrated || !choiceId || loading}
            onClick={submit}
            className="mt-6 w-full rounded-xl bg-[#142f4b] p-4 font-black text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "채점 중…" : "답안 제출"}
          </button>
        ) : (
          <section
            className={cn(
              "mt-6 rounded-2xl border p-5 sm:p-6",
              feedback.isCorrect
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50",
            )}
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              {feedback.isCorrect ? (
                <CheckCircle2 className="text-emerald-700" />
              ) : (
                <XCircle className="text-rose-700" />
              )}
              <h2 className="text-lg font-black">
                {feedback.isCorrect ? "정답입니다." : "다시 확인해 보세요."}
              </h2>
            </div>
            <p className="mt-4 leading-7 text-slate-700">
              {feedback.selectedChoice.feedback}
            </p>
            <div className="mt-4 rounded-xl bg-white/80 p-4">
              <p className="text-sm font-black text-[#0f766e]">정답 해설</p>
              <p className="mt-2 leading-7 text-slate-700">
                {feedback.explanation}
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white/85 p-4">
              <p className="text-sm font-black text-[#0f766e]">
                선택지별 근거
              </p>
              <ol className="mt-3 grid gap-3">
                {question.choices.map((choice) => {
                  const detail =
                    choice.id === feedback.selectedChoice.id
                      ? feedback.selectedChoice
                      : feedback.otherChoices.find(
                          (candidate) => candidate.id === choice.id,
                        );
                  const isCorrect =
                    choice.id === feedback.correctChoice.id;
                  return (
                    <li
                      key={choice.id}
                      className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                    >
                      <p className="font-black text-[#142f4b]">
                        {choice.order}번 · {isCorrect ? "정답 근거" : "오답 근거"}
                        {choice.id === feedback.selectedChoice.id
                          ? " · 내가 선택"
                          : ""}
                      </p>
                      <p className="mt-1">
                        {detail?.feedback ??
                          "이 보기의 적용 범위를 정답 해설과 비교하세요."}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={feedback.lesson.href}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#142f4b] px-4 py-3 font-bold text-white"
              >
                연결 이론 복습 <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={reset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700"
              >
                <RotateCcw size={16} /> 다시 풀기
              </button>
            </div>
          </section>
        )}

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
