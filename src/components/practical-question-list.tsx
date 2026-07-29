import Link from "next/link";
import type { PublicPracticalQuestion } from "@/lib/domain/practical-types";
import { PracticalLabelBadges } from "./practical-label-badges";
import { PracticalStudyCategoryBadge } from "./practical-study-category-badge";

export function PracticalQuestionList({
  questions,
}: {
  questions: PublicPracticalQuestion[];
}) {
  return (
    <div className="mt-8 grid gap-4">
      {questions.map((question, index) => {
        const occurrenceLabel = question.occurrence
          ? `${question.occurrence.year}년 ${question.occurrence.round}회`
          : null;
        return (
          <Link
            key={question.id}
            href={`/practical/written/question/${question.id}`}
            className="card grid gap-4 p-5 transition hover:border-[#16697a] md:grid-cols-[auto_1fr_auto] md:items-center"
          >
            <span className="grid min-h-10 min-w-10 place-items-center rounded-xl bg-slate-100 px-2 text-sm font-black text-slate-600">
              {question.occurrence?.questionNumber ?? index + 1}
            </span>
            <span>
              {occurrenceLabel ? (
                <span className="mb-2 block text-xs font-extrabold text-[#8f3f0a]">
                  {occurrenceLabel} · {question.occurrence?.questionNumber}
                </span>
              ) : null}
              <span className="flex flex-wrap items-center gap-2">
                <strong className="text-lg">{question.title}</strong>
                <PracticalLabelBadges labels={[question.label]} />
                <PracticalStudyCategoryBadge
                  categoryId={question.primaryStudyCategoryId}
                />
                {question.visualAidId ? (
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                    문제 그림
                  </span>
                ) : null}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                {question.stem}
              </span>
            </span>
            <span className="text-sm font-extrabold text-[#16697a]">풀기 →</span>
          </Link>
        );
      })}
    </div>
  );
}
