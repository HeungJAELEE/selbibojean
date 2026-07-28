"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type {
  PracticalReveal,
  PublicPracticalQuestion,
} from "@/lib/domain/practical-types";
import type { SelfRating } from "@/lib/domain/types";

const subscribeToHydration = () => () => {};
const getClientHydrationState = () => true;
const getServerHydrationState = () => false;

export function PracticalWrittenQuestion({
  question,
}: {
  question: PublicPracticalQuestion;
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<PracticalReveal | null>(null);
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationState,
    getServerHydrationState,
  );

  async function reveal(selfRating: SelfRating = "unknown") {
    setLoading(true);
    setError("");
    const response = await fetch("/api/practical/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        answer,
        selfRating,
      }),
    });
    const payload = (await response.json().catch(() => null)) as
      | PracticalReveal
      | { error?: string }
      | null;
    setLoading(false);
    if (!response.ok || !payload || !("modelAnswer" in payload)) {
      setError(payload && "error" in payload ? payload.error ?? "답안을 불러오지 못했습니다." : "답안을 불러오지 못했습니다.");
      return;
    }
    setFeedback(payload);
  }

  function saveRating(selfRating: SelfRating) {
    if (!feedback) return;
    const record = {
      questionId: question.id,
      selfScore: Number(score || 0),
      selfRating,
      attemptedAt: new Date().toISOString(),
    };
    const key = "seolbi-practical-attempts";
    const current = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    localStorage.setItem(key, JSON.stringify([...current, record].slice(-500)));
    setFeedback({ ...feedback, selfRating });
  }

  function retry() {
    setAnswer("");
    setFeedback(null);
    setScore("");
    setError("");
  }

  return (
    <section
      className="card p-6 md:p-8"
      aria-busy={!isHydrated}
      data-hydrated={isHydrated ? "true" : "false"}
    >
      {question.promptOptions && question.promptOptions.length > 0 ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="font-extrabold text-[#173957]">보기</p>
          <ol className="mt-3 space-y-2 text-sm leading-6">
            {question.promptOptions.map((option, index) => (
              <li key={option} className="flex gap-3">
                <span className="font-black text-[#16697a]">
                  {["가", "나", "다", "라", "마", "바"][index] ?? index + 1}.
                </span>
                <span>{option}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      <label
        htmlFor="practical-answer"
        className="text-sm font-extrabold text-[#173957]"
      >
        직접 답안을 작성해 보세요
      </label>
      <textarea
        id="practical-answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        rows={7}
        disabled={Boolean(feedback) || !isHydrated}
        placeholder="공식, 작업순서, 필수 단위와 안전조치를 함께 적으세요."
        className="mt-3 w-full rounded-xl border border-slate-300 p-4 leading-7 outline-none focus:border-[#16697a] focus:ring-2 focus:ring-[#16697a]/20 disabled:bg-slate-50"
      />
      {!feedback ? (
        <button
          type="button"
          disabled={!isHydrated || loading || answer.trim().length === 0}
          onClick={() => reveal()}
          className="mt-4 rounded-xl bg-[#173957] px-5 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "채점 기준 불러오는 중…" : "답안 제출"}
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {feedback ? (
        <div data-testid="practical-answer-feedback" className="mt-8 space-y-6 border-t border-slate-200 pt-7">
          <div>
            <p className="eyebrow">모범답안</p>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-800">
              {feedback.modelAnswer}
            </p>
          </div>
          {feedback.answerDefinition ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
              <p className="font-extrabold text-[#173957]">핵심 정의</p>
              <p className="mt-2 leading-7 text-slate-700">
                {feedback.answerDefinition}
              </p>
            </div>
          ) : null}
          {feedback.memoryTip ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
              <p className="font-extrabold text-[#173957]">암기팁</p>
              <p className="mt-2 leading-7 text-slate-700">
                {feedback.memoryTip}
              </p>
            </div>
          ) : null}
          {feedback.calculation.length > 0 ? (
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="font-extrabold">계산·적용조건</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
                {feedback.calculation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              {feedback.unit ? (
                <p className="mt-3 text-sm font-bold text-[#16697a]">
                  필수 단위: {feedback.unit}
                </p>
              ) : null}
            </div>
          ) : null}
          <div>
            <p className="font-extrabold">필수키워드</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {feedback.requiredKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-[#eaf7f6] px-3 py-1.5 text-sm font-bold text-[#16697a]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-extrabold">부분점수 기준</p>
            <ul className="mt-3 space-y-2">
              {feedback.rubric.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 text-sm"
                >
                  <span>{item.label}</span>
                  <strong>{item.points}점</strong>
                </li>
              ))}
            </ul>
          </div>
          {feedback.traps.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-extrabold text-amber-900">오답 함정</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">
                {feedback.traps.map((trap) => (
                  <li key={trap}>{trap}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {feedback.sourceLinks.length > 0 ? (
            <div
              data-testid="practical-answer-sources"
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="font-extrabold text-[#173957]">근거 자료</p>
              <ul className="mt-3 space-y-3 text-sm leading-6">
                {feedback.sourceLinks.map((source) => (
                  <li key={`${source.href}-${source.page}`}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-extrabold text-[#16697a] underline decoration-[#16697a]/30 underline-offset-4"
                    >
                      {source.label}
                    </a>
                    <span className="ml-2 text-slate-600">{source.page}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-4 rounded-xl bg-[#173957] p-5 text-white md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <label htmlFor="self-score" className="font-extrabold">
                자기점수
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="self-score"
                  type="number"
                  min="0"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  className="w-24 rounded-lg bg-white px-3 py-2 font-bold text-slate-900"
                />
                <span className="text-sm text-slate-200">점</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                ["unknown", "모름"],
                ["unsure", "헷갈림"],
                ["known", "앎"],
              ] as const).map(([rating, label]) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => saveRating(rating)}
                  className={`rounded-lg px-4 py-2 text-sm font-extrabold ${
                    feedback.selfRating === rating
                      ? "bg-[#8dd5ce] text-[#173957]"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.conceptLinks.map((concept) => (
              <Link
                key={concept.id}
                href={concept.href}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-extrabold text-[#16697a]"
              >
                관련 개념: {concept.title}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={retry}
            className="rounded-xl border border-[#173957] px-5 py-3 text-sm font-extrabold text-[#173957]"
          >
            답안 지우고 다시 풀기
          </button>
        </div>
      ) : null}
    </section>
  );
}
