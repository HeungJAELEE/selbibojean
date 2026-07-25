"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import type {
  BdaSourcePracticeFeedback,
  PublicBdaSourcePracticeBlock,
  PublicBdaSourcePracticeQuestion,
} from "@/lib/domain/bda-source-practice";
import { cn } from "@/lib/utils";

function SourceQuestion({
  question,
  number,
}: {
  question: PublicBdaSourcePracticeQuestion;
  number: number;
}) {
  const [choiceId, setChoiceId] = useState("");
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] =
    useState<BdaSourcePracticeFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const apiResponse = await fetch("/api/bda/source-practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          choiceId: choiceId || undefined,
          response: response || undefined,
        }),
      });
      const result = (await apiResponse.json()) as BdaSourcePracticeFeedback & {
        error?: string;
      };
      if (!apiResponse.ok) {
        throw new Error(result.error ?? "채점 결과를 불러오지 못했습니다.");
      }
      setFeedback(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "채점 결과를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setChoiceId("");
    setResponse("");
    setFeedback(null);
    setError("");
  }

  const canSubmit =
    question.mode === "multiple_choice"
      ? Boolean(choiceId)
      : Boolean(response.trim());

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
        <span className="rounded-full bg-[#173957] px-2.5 py-1 text-white">
          원천 연습 {number}
        </span>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-800">
          {question.reviewStatus}
        </span>
        {question.reviewDisposition !== "source_verified" ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
            {question.reviewDisposition === "corrected"
              ? "오류 보정"
              : "빈칸 보강"}
          </span>
        ) : null}
      </div>

      <h5 className="mt-3 text-base font-black leading-7 text-[#173957] sm:text-lg">
        {question.stem}
      </h5>

      {question.mode === "multiple_choice" ? (
        <div
          className="mt-4 grid gap-2.5"
          role="radiogroup"
          aria-label={`원천 연습문제 ${number} 보기`}
        >
          {question.choices.map((choice) => {
            const selected = choiceId === choice.id;
            const correct =
              feedback?.correctChoice?.id === choice.id;
            const wrong =
              feedback?.selectedChoice?.id === choice.id &&
              feedback.isCorrect === false;
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={Boolean(feedback)}
                onClick={() => setChoiceId(choice.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                  selected
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-200 hover:border-slate-400",
                  correct && "border-emerald-500 bg-emerald-50",
                  wrong && "border-rose-400 bg-rose-50",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-xs font-black">
                  {choice.order}
                </span>
                <span className="pt-0.5 text-sm leading-6 text-slate-800">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <label className="mt-4 block">
          <span className="text-xs font-black text-slate-600">
            먼저 자신의 답을 적어보세요
          </span>
          <textarea
            value={response}
            disabled={Boolean(feedback)}
            onChange={(event) => setResponse(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="핵심 용어나 판단 근거를 입력한 뒤 제출하세요."
          />
        </label>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {question.practiceNotice}
      </p>

      {!feedback ? (
        <button
          type="button"
          disabled={!canSubmit || loading}
          onClick={submit}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173957] px-4 py-3 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          {loading ? "검수 답안 확인 중…" : "답안 제출 후 해설 보기"}
        </button>
      ) : (
        <section
          className={cn(
            "mt-4 rounded-2xl border p-4",
            feedback.isCorrect === false
              ? "border-rose-200 bg-rose-50"
              : "border-emerald-200 bg-emerald-50",
          )}
          aria-live="polite"
        >
          <div className="flex items-center gap-2 font-black text-slate-900">
            {feedback.isCorrect === false ? (
              <XCircle size={18} className="text-rose-700" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-700" />
            )}
            {feedback.isCorrect === null
              ? "검수 답안과 비교하세요."
              : feedback.isCorrect
                ? "정답입니다."
                : "선택한 답을 다시 확인하세요."}
          </div>
          <div className="mt-3 rounded-xl bg-white/85 p-4">
            <p className="text-xs font-black uppercase tracking-[.12em] text-teal-800">
              검수 답안
            </p>
            <p className="mt-2 font-bold leading-7 text-slate-900">
              {feedback.correctChoice
                ? `${feedback.correctChoice.order}번 · ${feedback.correctChoice.text}`
                : feedback.answerText}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {feedback.explanation}
            </p>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            {feedback.notice} · 근거등급 {feedback.evidenceGrade}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-black text-teal-900"
          >
            <RotateCcw size={14} /> 답안 숨기고 다시 풀기
          </button>
        </section>
      )}

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function BdaSourcePracticeBlock({
  block,
}: {
  block: PublicBdaSourcePracticeBlock;
}) {
  return (
    <details
      className="group my-7 overflow-hidden rounded-2xl border border-teal-200 bg-[#f4fbfa]"
      data-testid={`source-practice-${block.id}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-[#173957] [&::-webkit-details-marker]:hidden sm:px-5">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-800">
            <FileCheck2 size={18} />
          </span>
          <span>
            <strong className="block">검수 완료 원천 연습문제</strong>
            <small className="mt-0.5 block font-medium text-slate-600">
              실제 문제 {block.questions.length}개 · 제출 후 정답 공개
            </small>
          </span>
        </span>
        <ChevronDown className="shrink-0 transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-teal-100 p-3 sm:p-5">
        <p className="mb-4 text-xs leading-5 text-slate-600">
          {block.auditNote}
        </p>
        <div className="grid gap-4">
          {block.questions.map((question, index) => (
            <SourceQuestion
              key={question.id}
              question={question}
              number={index + 1}
            />
          ))}
        </div>
      </div>
    </details>
  );
}
