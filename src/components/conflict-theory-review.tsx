import { AlertTriangle } from "lucide-react";

import type { ConflictTheoryReviewItem } from "@/lib/content/conflict-theory-review";

const REVIEW_LABEL = "조건부 참고·비채점 검토 문항";

export function ConflictTheoryReview({
  items,
}: {
  items: ConflictTheoryReviewItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      id="conflict-review"
      aria-labelledby="conflict-review-title"
      data-testid="conflict-theory-review"
      className="mt-9 scroll-mt-28 border-l-4 border-amber-500 bg-amber-50 p-5 md:p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-amber-700"
          size={22}
        />
        <div className="min-w-0">
          <p className="text-xs font-black tracking-[.08em] text-amber-800">
            검토 전용 · 채점 없음
          </p>
          <h2
            id="conflict-review-title"
            className="mt-1 text-xl font-extrabold text-[#173957] [text-wrap:balance]"
          >
            {REVIEW_LABEL}
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-6 text-slate-700">
            공식 근거가 일부 부족하거나 공개 답안과 기술 근거가 일치하지 않는 문항을
            참고용으로 공개합니다. 답을 선택하거나 제출하지 않으며
            연습·모의고사·오답 통계에는 포함되지 않습니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            data-testid={`conflict-review-${item.id}`}
            className="border border-amber-200 bg-white p-4 md:p-5"
          >
            <p className="text-xs font-extrabold text-amber-800">
              {REVIEW_LABEL}
            </p>
            <h3 className="mt-3 font-extrabold leading-7 text-[#173957] [text-wrap:balance]">
              {item.stem}
            </h3>
            <ol className="mt-4 grid gap-2" aria-label={`${item.stem} 보기`}>
              {item.choices.map((choice, index) => (
                <li
                  key={choice.id}
                  className="flex gap-3 border-t border-slate-100 pt-2 text-sm leading-6 text-slate-700 first:border-t-0 first:pt-0"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-bold text-slate-500"
                  >
                    {index + 1}.
                  </span>
                  <span>{choice.text}</span>
                </li>
              ))}
            </ol>
            <dl className="mt-4 border-t border-amber-100 pt-4 text-sm leading-6">
              <dt className="font-extrabold text-amber-900">검토 사유</dt>
              <dd className="mt-1 text-slate-700">{item.reason}</dd>
            </dl>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
              정답과 해설은 검토가 끝나기 전까지 공개하지 않습니다.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
