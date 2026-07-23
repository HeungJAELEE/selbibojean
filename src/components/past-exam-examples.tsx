"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { PastExamExample, PastExamFormat } from "@/lib/content/past-exam-examples";
import type { PracticeFeedback } from "@/lib/domain/types";
import { MarkdownContent } from "@/components/markdown-content";
import { cn } from "@/lib/utils";

const CHOICE_MARKS = ["①", "②", "③", "④", "⑤"];
const FORMAT_LABELS: Record<PastExamFormat, string> = {
  calculation: "계산·적용형",
  diagnosis: "사례·진단형",
  negative: "부정형 판별",
  concept: "개념·구분형",
};

export function PastExamExamples({
  examples,
  initialCount = 3,
  batchSize = 3,
  examFirst = false,
}: {
  examples: PastExamExample[];
  initialCount?: number;
  batchSize?: number;
  examFirst?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  if (examples.length === 0) return null;
  const visibleExamples = examples.slice(0, visibleCount);
  const remainingCount = Math.max(examples.length - visibleCount, 0);

  return (
    <section id="past-exams" className="mt-9 scroll-mt-28 rounded-2xl border border-[#b9d9d7] bg-[#f2fbfa] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#16697a] text-white">
          <History size={19} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">
            {examFirst ? "Step 1 · Past exam practice" : "Past exam practice"}
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">기출 문제 풀기</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {examFirst
              ? `실제 CBT 문장을 읽고 보기를 선택하세요. 답안을 제출하면 정오답과 풀이가 같은 화면에 바로 열립니다. 처음 ${Math.min(initialCount, examples.length)}개부터 보여주며 정답은 제출 전까지 전송하지 않습니다.`
              : `개념을 확인했다면 실제 CBT 문제를 바로 풀어보세요. 답안을 제출하면 페이지 이동 없이 정오답과 풀이가 열립니다. 처음 ${Math.min(initialCount, examples.length)}개부터 보여주며 정답은 제출 전까지 전송하지 않습니다.`}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {visibleExamples.map((example, index) => (
          <PastExamQuestionCard
            key={example.externalId}
            example={example}
            initiallyOpen={index === 0}
          />
        ))}
      </div>

      {examples.length > initialCount && (
        <div className="mt-5 flex justify-center">
          {remainingCount > 0 ? (
            <button
              type="button"
              data-testid="past-exam-more"
              onClick={() => setVisibleCount((count) => Math.min(count + batchSize, examples.length))}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#6fb5b1] bg-white px-5 py-3 text-sm font-extrabold text-[#16697a] sm:w-auto"
            >
              기출 {Math.min(remainingCount, batchSize)}개 더 보기
              <ChevronDown size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisibleCount(initialCount)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 sm:w-auto"
            >
              처음 {Math.min(initialCount, examples.length)}개만 보기
              <ChevronUp size={17} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function PastExamQuestionCard({
  example,
  initiallyOpen,
}: {
  example: PastExamExample;
  initiallyOpen: boolean;
}) {
  const [selectedChoiceId, setSelectedChoiceId] = useState("");
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitAnswer() {
    if (!selectedChoiceId || feedback) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: example.canonicalId,
          choiceId: selectedChoiceId,
          selfRating: "unsure",
          attemptKind: "initial",
        }),
      });
      const result = await response.json() as PracticeFeedback & { error?: string };
      if (!response.ok) throw new Error(result.error);
      setFeedback(result);
      window.setTimeout(() => {
        document.getElementById(`past-exam-feedback-${example.externalId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "답안을 채점하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    setSelectedChoiceId("");
    setFeedback(null);
    setError("");
  }

  return (
    <details
      open={initiallyOpen}
      data-testid={`past-exam-${example.externalId}`}
      className="group rounded-xl border border-slate-200 bg-white px-4 py-3 open:border-[#6fb5b1]"
    >
      <summary className="cursor-pointer list-none marker:hidden">
        <span className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-[#173957] px-2.5 py-1 text-white">실제 기출</span>
          <span className="rounded-full bg-[#fff2e8] px-2.5 py-1 text-[#8f3f0a]">{FORMAT_LABELS[example.format]}</span>
          <span className="text-slate-500">{formatExamLabel(example)}</span>
        </span>
        <span className="mt-3 block pr-5 font-extrabold leading-7 text-[#173957]">{example.stem}</span>
        <span className="mt-2 block text-xs font-bold text-[#16697a] group-open:hidden">문제 풀기</span>
      </summary>

      {!feedback && (
        <fieldset className="mt-4 grid gap-2 border-t border-slate-100 pt-4" disabled={loading}>
          <legend className="sr-only">{example.stem} 보기 선택</legend>
          {example.choices.map((choice, choiceIndex) => {
            const choiceId = example.choiceIds[choiceIndex];
            const selected = selectedChoiceId === choiceId;
            return (
              <button
                key={`${example.externalId}-${choiceId}`}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedChoiceId(choiceId)}
                className={cn(
                  "flex w-full gap-3 rounded-xl border px-3 py-3 text-left text-sm leading-6 transition",
                  selected ? "border-[#16697a] bg-[#eaf7f6] ring-1 ring-[#16697a]" : "border-slate-200 bg-slate-50 hover:border-slate-400",
                )}
              >
                <span className="font-bold text-[#16697a]">{CHOICE_MARKS[choiceIndex] ?? choiceIndex + 1}</span>
                <span>{choice}</span>
              </button>
            );
          })}
        </fieldset>
      )}

      {!feedback && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <a
            href={example.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#16697a]"
          >
            원문 출처 <ArrowUpRight size={13} />
          </a>
          <button
            type="button"
            data-testid={`past-exam-submit-${example.externalId}`}
            onClick={submitAnswer}
            disabled={!selectedChoiceId || loading}
            className="rounded-lg bg-[#173957] px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "채점 중…" : "정답 확인"}
          </button>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

      {feedback && (
        <div id={`past-exam-feedback-${example.externalId}`} data-testid={`past-exam-feedback-${example.externalId}`}>
          <section
            className={cn(
              "mt-5 rounded-2xl border p-5",
              feedback.isCorrect ? "border-emerald-200 bg-emerald-50/80" : "border-red-200 bg-red-50/80",
            )}
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-lg font-extrabold">
              {feedback.isCorrect
                ? <CheckCircle2 className="text-emerald-700" size={21} />
                : <XCircle className="text-red-700" size={21} />}
              {feedback.isCorrect ? "정답입니다" : "오답입니다"}
            </div>

            <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-xl bg-white/85 p-4">
                <dt className="text-xs font-extrabold text-slate-500">내가 고른 답</dt>
                <dd className="mt-2 font-extrabold text-[#173957]">{feedback.selectedChoice.text}</dd>
              </div>
              <div className="rounded-xl bg-white/85 p-4">
                <dt className="text-xs font-extrabold text-slate-500">정답</dt>
                <dd className="mt-2 font-extrabold text-emerald-800">{feedback.correctChoice.text}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl bg-white/85 p-4">
              <h4 className="font-extrabold text-[#173957]">전체 해설</h4>
              <MarkdownContent content={feedback.explanation} compact />
            </div>

            {!feedback.isCorrect && (
              <div className="mt-4 rounded-xl bg-white/85 p-4">
                <h4 className="font-extrabold text-red-800">왜 틀렸는지</h4>
                <MarkdownContent
                  content={feedback.selectedChoice.incorrectPoint ?? feedback.selectedChoice.keyRule}
                  compact
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-4">
              <a
                href={`/written/theory/${feedback.lesson.id}#${feedback.lesson.anchor}`}
                className="text-sm font-bold text-[#16697a]"
              >
                관련 개념 자세히 보기
              </a>
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                <RotateCcw size={16} /> 정답 숨기고 다시 풀기
              </button>
            </div>
          </section>
        </div>
      )}
    </details>
  );
}

function formatExamLabel(example: PastExamExample) {
  const number = example.questionNumber ? ` · ${example.questionNumber}번` : "";
  return `${example.year}년 ${example.sessionLabel}${number}`;
}
