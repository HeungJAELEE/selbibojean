"use client";

import { useRef, useState } from "react";
import { ChevronDown, ExternalLink, RotateCcw } from "lucide-react";
import type { PracticeFeedback, PublicQuestion } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { PracticeFeedbackPanel } from "@/components/practice-feedback";
import { buildLessonReturnHref } from "@/lib/domain/practice";

export function SingleQuestion({ question }: { question: PublicQuestion }) {
  return (
    <div className="card p-6 md:p-9">
      <p className="text-sm font-bold text-[#16697a]">검수 완료 문제</p>
      <ProvenanceBadges question={question} />
      <h1 className="mt-5 text-2xl font-extrabold leading-relaxed">
        {question.stem}
      </h1>
      <QuestionAnswerForm
        question={question}
        lessonHref={(feedback) =>
          buildLessonReturnHref(
            feedback.lesson.href,
            `/written/practice/${question.id}`,
          )
        }
      />
    </div>
  );
}

export function InlineQuestionToggle({
  question,
  index,
}: {
  question: PublicQuestion;
  index: number;
}) {
  return (
    <details
      data-testid={`inline-cbt-question-${question.id}`}
      className="group/question overflow-hidden rounded-lg border border-white/20 bg-white/8 open:border-teal-200 open:bg-white"
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 p-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200 [&::-webkit-details-marker]:hidden">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#8f3f0a] text-xs font-black">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-sm font-bold leading-6 group-open/question:line-clamp-none group-open/question:text-[#173957]">
            {question.stem}
          </span>
          <span className="mt-1 block text-xs font-semibold text-teal-200 group-open/question:hidden">
            문제와 보기 펼치기
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="mt-1 shrink-0 text-teal-200 transition-transform group-open/question:rotate-180 group-open/question:text-[#16697a]"
        />
      </summary>
      <div className="border-t border-slate-200 bg-white p-4 text-slate-900">
        <ProvenanceBadges question={question} />
        <QuestionAnswerForm
          question={question}
          compact
          lessonHref={(feedback) => feedback.lesson.href}
        />
        {question.provenance.exam?.sourceUrl ? (
          <a
            href={question.provenance.exam.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-500 underline underline-offset-4"
          >
            기출 근거 확인
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </details>
  );
}

function QuestionAnswerForm({
  question,
  compact = false,
  lessonHref,
}: {
  question: PublicQuestion;
  compact?: boolean;
  lessonHref: (feedback: PracticeFeedback) => string;
}) {
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pendingAttemptId = useRef<string | null>(null);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const clientAttemptId = pendingAttemptId.current ?? crypto.randomUUID();
      pendingAttemptId.current = clientAttemptId;
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientAttemptId,
          questionId: question.id,
          questionVariantExternalId: question.provenance.exam?.externalId,
          choiceId: choice,
          selfRating: "unsure",
          attemptKind: "initial",
        }),
      });
      const result = (await response.json()) as PracticeFeedback & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "채점하지 못했습니다.");
      }
      setFeedback(result);
      pendingAttemptId.current = null;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "채점하지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    pendingAttemptId.current = null;
    setChoice("");
    setFeedback(null);
    setError("");
  }

  return (
    <>
      {!feedback ? (
        <>
          <div
            className={cn("grid gap-3", compact ? "mt-4" : "mt-7")}
            role="group"
            aria-label={`${question.stem} 보기`}
          >
            {question.choices.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={choice === item.id}
                onClick={() => { pendingAttemptId.current = null; setChoice(item.id); }}
                className={cn(
                  "rounded-xl border p-4 text-left text-sm leading-6",
                  choice === item.id
                    ? "border-[#16697a] bg-[#eaf7f6] ring-1 ring-[#16697a]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-400",
                )}
              >
                <strong className="mr-2 text-[#16697a]">{item.order}.</strong>
                {item.text}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-testid={`inline-cbt-submit-${question.id}`}
            disabled={!choice || loading}
            onClick={submit}
            className={cn(
              "rounded-xl bg-[#173957] font-extrabold text-white disabled:opacity-40",
              compact ? "mt-4 w-full px-4 py-3" : "mt-7 w-full p-4",
            )}
          >
            {loading ? "채점 중…" : "답안 제출"}
          </button>
        </>
      ) : (
        <div data-testid={`inline-cbt-feedback-${question.id}`}>
          <PracticeFeedbackPanel
            feedback={feedback}
            lessonHref={lessonHref(feedback)}
          />
          <button
            type="button"
            onClick={retry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            <RotateCcw size={15} aria-hidden="true" />
            정답 숨기고 다시 풀기
          </button>
        </div>
      )}
      {error ? (
        <p
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}

function ProvenanceBadges({ question }: { question: PublicQuestion }) {
  if (
    !question.provenance.reconstructed &&
    !question.provenance.historical &&
    !question.provenance.original
  ) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
      {question.provenance.original ? (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
          원문 기출
        </span>
      ) : null}
      {question.provenance.exam ? (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {question.provenance.exam.year}년{" "}
          {question.provenance.exam.sessionLabel}
          {question.provenance.exam.questionNumber
            ? ` · ${question.provenance.exam.questionNumber}번`
            : ""}
        </span>
      ) : null}
      {question.provenance.reconstructed ? (
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">
          원문 근거 학습용 재구성
        </span>
      ) : null}
      {question.provenance.historical ? (
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
          과거 시험 맥락
        </span>
      ) : null}
    </div>
  );
}
