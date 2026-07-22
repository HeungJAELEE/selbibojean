"use client";

import Link from "next/link";
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
  return (
    <section
      className={cn(
        "mt-7 overflow-hidden rounded-2xl border",
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

        <div className="mt-5 rounded-xl bg-white/80 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">선택한 보기</p>
          <p className="mt-2 font-extrabold text-[#173957]">{feedback.selectedChoice.text}</p>
          <MarkdownContent content={feedback.selectedChoice.rationale} compact />
        </div>

        {!feedback.isCorrect && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FeedbackTerm title="왜 그럴듯해 보였나" body={feedback.selectedChoice.plausibleReason} />
            <FeedbackTerm title="실제로 틀린 지점" body={feedback.selectedChoice.incorrectPoint ?? "판단 조건을 다시 확인해 주세요."} />
            <FeedbackTerm title="정답을 가르는 핵심 규칙" body={feedback.selectedChoice.keyRule} />
            <FeedbackTerm title="정답 보기와의 차이" body={feedback.selectedChoice.differenceFromCorrect ?? "정답 보기의 적용 조건이 문제의 요구와 직접 대응합니다."} />
          </div>
        )}

        <div className="mt-5 border-t border-current/10 pt-5">
          <p className="text-sm font-extrabold">전체 해설</p>
          <MarkdownContent content={feedback.explanation} compact />
        </div>
      </div>

      {feedback.conceptSupport && (
        <div className="border-y border-[#b9d7d9] bg-[#eaf7f6] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 shrink-0 text-[#16697a]" size={21} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#16697a]">바로 읽는 관련 개념</p>
              <h4 className="mt-1 text-lg font-extrabold text-[#173957]">{feedback.conceptSupport.title}</h4>
            </div>
          </div>
          <ol className="mt-4 grid gap-2">
            {feedback.conceptSupport.summary.map((line, index) => (
              <li key={`${index}-${line}`} className="flex gap-3 text-sm font-semibold leading-6 text-[#294a58]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#16697a] text-xs text-white">{index + 1}</span>
                {line}
              </li>
            ))}
          </ol>
          <div className="mt-5 grid gap-3">
            {feedback.conceptSupport.blocks.map((block) => (
              <details key={block.id} open={block.id === feedback.lesson.anchor} className="rounded-xl border border-[#cce1e2] bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-extrabold text-[#173957]">
                  {block.title}<ChevronDown size={17} />
                </summary>
                <MarkdownContent content={block.body} compact />
              </details>
            ))}
          </div>
          {!feedback.isCorrect && (
            <Link href={lessonHref} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#173957] px-5 py-3.5 font-extrabold text-white">
              <BookOpen size={18} />개념 전체를 이해하고 재도전하기
            </Link>
          )}
        </div>
      )}

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
              <MarkdownContent content={choice.rationale} compact />
              {!choice.isCorrect && (
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <FeedbackTerm title="혼동 이유" body={choice.plausibleReason} />
                  <FeedbackTerm title="구분 기준" body={choice.incorrectPoint ?? choice.keyRule} />
                </div>
              )}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}

function FeedbackTerm({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-white/75 p-4">
      <p className="text-sm font-extrabold text-[#173957]">{title}</p>
      <MarkdownContent content={body} compact />
    </div>
  );
}
