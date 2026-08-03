"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BookOpen, CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import type { PracticeFeedback } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/markdown-content";

export function PracticeFeedbackPanel({
  feedback,
  lessonHref,
}: {
  feedback: PracticeFeedback;
  lessonHref: string;
}) {
  const feedbackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    feedbackRef.current?.focus();
  }, []);

  return (
    <section
      ref={feedbackRef}
      tabIndex={-1}
      className={cn(
        "mt-7 overflow-hidden rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-[#16697a] focus-visible:ring-offset-2",
        feedback.isCorrect ? "border-emerald-200 bg-emerald-50/70" : "border-red-200 bg-red-50/70",
      )}
      aria-live="polite"
    >
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-3">
          {feedback.isCorrect ? <CheckCircle2 className="text-emerald-700" /> : <XCircle className="text-red-700" />}
          <h3 className="text-lg font-extrabold">
            {feedback.isCorrect ? "정답입니다" : `${feedback.errorReason ?? "오답"}으로 분류했어요`}
          </h3>
        </div>

        {feedback.approvedReview ? (
          <div className="mt-5 grid gap-4" data-testid="approved-review-feedback">
            <div className="rounded-xl bg-white/80 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">정답 풀이</p>
              <p className="mt-2 font-extrabold text-[#173957]">{feedback.correctChoice.text}</p>
              <MarkdownContent content={feedback.approvedReview.directSolution} compact />
            </div>

            {feedback.approvedReview.calculation && (
              <dl className="grid gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 text-sm sm:grid-cols-2">
                <CalculationTerm title="공식" body={feedback.approvedReview.calculation.formula} />
                <CalculationTerm title="대입" body={feedback.approvedReview.calculation.substitution} />
                <CalculationTerm title="결과" body={feedback.approvedReview.calculation.result} />
                <CalculationTerm title="단위" body={feedback.approvedReview.calculation.unit} />
              </dl>
            )}

            <div className="rounded-xl bg-white/80 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">선택한 보기 판단</p>
              <p className="mt-2 font-extrabold text-[#173957]">{feedback.selectedChoice.text}</p>
              <MarkdownContent content={feedback.approvedReview.selectedChoiceReason} compact />
            </div>

            <div className="rounded-xl border border-[#b9d7d9] bg-[#eaf7f6] p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 shrink-0 text-[#16697a]" size={20} />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#16697a]">연결 개념</p>
                  <MarkdownContent content={feedback.approvedReview.conceptBinding.assertionText} compact />
                </div>
              </div>
              <Link href={lessonHref} className="mt-4 inline-flex items-center gap-2 font-extrabold text-[#173957] underline underline-offset-4">
                개념에서 확인하기
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
            data-testid="pending-review-feedback"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              정답 보기
            </p>
            <p className="mt-2 font-extrabold text-[#173957]">
              {feedback.correctChoice.text}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-amber-950">
              {feedback.feedbackNotice}
            </p>
          </div>
        )}

        {feedback.answerAudit && (
          <aside
            data-testid="cbt-answer-correction"
            className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
          >
            <p className="text-sm font-extrabold">CBT 공개답과 기술근거 불일치</p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-amber-800">CBT 공개답</dt>
                <dd className="mt-1">{feedback.answerAudit.cbtAnswer}</dd>
              </div>
              <div>
                <dt className="font-bold text-amber-800">검증된 정답</dt>
                <dd className="mt-1">{feedback.answerAudit.verifiedAnswer}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6">{feedback.answerAudit.reviewNote}</p>
            {feedback.answerAudit.evidenceUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {feedback.answerAudit.evidenceUrls.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    검증 근거 {index + 1}
                  </a>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      <details className="bg-white p-5 md:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-extrabold text-[#173957]">
          다른 보기까지 비교하기<ChevronDown size={18} />
        </summary>
        <div className="mt-4 grid gap-4">
          {feedback.otherChoices.map((choice) => (
            <article key={choice.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-[#173957]">{choice.text}</strong>
                {choice.isCorrect && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">정답 보기</span>}
              </div>
              {feedback.feedbackQuality === "approved_direct" && (
                <MarkdownContent content={choice.rationale} compact />
              )}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}

function CalculationTerm({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <dt className="font-extrabold text-[#173957]">{title}</dt>
      <dd className="mt-1 leading-6 text-slate-700">{body}</dd>
    </div>
  );
}
