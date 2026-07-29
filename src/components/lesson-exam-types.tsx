import { Calculator, CheckCircle2, Search, Shapes } from "lucide-react";

import {
  type PastExamFormat,
  type PastExamPatternSummary,
} from "@/lib/content/past-exam-examples";
import { MarkdownContent } from "@/components/markdown-content";
import type { LessonBlock } from "@/lib/domain/types";

const FORMAT_META: Record<
  PastExamFormat,
  {
    label: string;
    description: string;
    icon: typeof Calculator;
  }
> = {
  calculation: {
    label: "계산·적용형",
    description: "공식에 조건과 단위를 대입해 값을 구하는 유형",
    icon: Calculator,
  },
  diagnosis: {
    label: "사례·진단형",
    description: "증상·조건을 보고 원인, 조치 또는 적용 대상을 고르는 유형",
    icon: Search,
  },
  negative: {
    label: "부정형 판별",
    description: "옳지 않은 것, 해당하지 않는 것처럼 반대 조건을 찾는 유형",
    icon: CheckCircle2,
  },
  concept: {
    label: "개념·구분형",
    description: "정의, 특징, 용도와 비슷한 용어의 차이를 묻는 유형",
    icon: Shapes,
  },
};

export function LessonExamTypes({
  summary,
  authoredPoints,
}: {
  summary: PastExamPatternSummary;
  authoredPoints: LessonBlock[];
}) {
  if (summary.total === 0 && authoredPoints.length === 0) return null;

  return (
    <section
      id="exam-types"
      data-testid="lesson-exam-types"
      className="mt-9 scroll-mt-28"
    >
      <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">
        Exam patterns
      </p>
      <h2 className="mt-1 text-xl font-extrabold text-[#173957]">
        시험에 자주 출제되는 유형
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        이 소주제에 직접 연결된 검증 기출 {summary.total}건을 집계했습니다.
        같은 중주제의 보충 문제와 모의문제는 비중 계산에서 제외합니다.
      </p>

      {authoredPoints.length > 0 ? (
        <section className="mt-4 rounded-2xl border border-[#b9d9d7] bg-[#f2fbfa] p-5">
          <h3 className="font-extrabold text-[#173957]">미리 정리한 시험 포인트</h3>
          <div className="mt-3 grid gap-4">
            {authoredPoints.map((point) => (
              <div key={point.id}>
                {authoredPoints.length > 1 ? (
                  <h4 className="text-sm font-extrabold text-[#16697a]">
                    {point.title}
                  </h4>
                ) : null}
                <MarkdownContent content={point.body} compact />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {summary.patterns.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {summary.patterns.map((pattern) => {
          const meta = FORMAT_META[pattern.format];
          const Icon = meta.icon;
          return (
            <article
              key={pattern.format}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e1f2f0] text-[#16697a]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-[#173957]">{meta.label}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#16697a]">
                      {pattern.count}건 · {pattern.percentage}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {meta.description}
                  </p>
                </div>
              </div>
              <div
                role="progressbar"
                aria-label={`${meta.label} 기출 비중`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pattern.percentage}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
              >
                <span
                  className="block h-full rounded-full bg-[#16697a]"
                  style={{ width: `${pattern.percentage}%` }}
                />
              </div>
              <p className="mt-3 border-t border-slate-200 pt-3 text-sm font-bold leading-6 text-slate-700">
                대표 기출 · {pattern.representative.year}년{" "}
                {pattern.representative.sessionLabel}
                {pattern.representative.questionNumber
                  ? ` ${pattern.representative.questionNumber}번`
                  : ""}
                <span className="mt-1 block font-semibold text-slate-600">
                  {pattern.representative.stem}
                </span>
              </p>
              <div className="mt-3 rounded-xl border border-[#b9d9d7] bg-white p-4">
                <p className="text-xs font-black tracking-[.1em] text-[#16697a]">
                  대표 정답
                </p>
                <p className="mt-2 font-extrabold leading-6 text-[#173957]">
                  {pattern.representativeAnswer}
                </p>
                {pattern.representativeExplanation ? (
                  <>
                    <p className="mt-3 text-xs font-black tracking-[.1em] text-slate-500">
                      핵심 해설
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      {pattern.representativeExplanation}
                    </p>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
        </div>
      ) : null}
    </section>
  );
}
