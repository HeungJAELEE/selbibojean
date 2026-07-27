import Link from "next/link";
import {
  getExamSubjectLens,
  type ExamSubjectCheatSheet,
  type ExamSubjectLensId,
} from "@/data/source/practical-exam-subject-summaries";
import type { PracticalTextbookSubject } from "@/data/source/practical-textbook-taxonomy";
import {
  PracticalExamRepresentativeQuestions,
  type PracticalExamRepresentativeQuestion,
} from "@/components/practical-exam-representative-questions";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";
import type { PracticalVisualAid } from "@/lib/domain/practical-types";

export function PracticalExamSubjectCheatSheet({
  subject,
  summary,
  questions,
  visualAids = [],
  lensId = "practicalWritten",
}: {
  subject: PracticalTextbookSubject;
  summary: ExamSubjectCheatSheet | undefined;
  questions: PracticalExamRepresentativeQuestion[];
  visualAids?: PracticalVisualAid[];
  lensId?: ExamSubjectLensId;
}) {
  if (!summary) {
    return (
      <section
        className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6"
        data-testid="practical-exam-subject-summary-pending"
      >
        <p className="text-xs font-black tracking-[.14em] text-amber-800">
          요약 검수 중
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-amber-950">
          {subject.title} 핵심요약은 다음 단계에서 제공합니다
        </h2>
        <p className="mt-3 text-sm leading-7 text-amber-900">
          검수되지 않은 자동 요약을 대신 보여주지 않습니다. 현재는 기존 개념
          목차에서 공개 완료된 이론을 확인할 수 있습니다.
        </p>
        <Link
          href={`/practical/written/theory/subject/${subject.id}`}
          className="mt-5 inline-flex rounded-lg bg-amber-900 px-4 py-2 text-sm font-extrabold text-white"
        >
          기존 개념 목차 보기
        </Link>
      </section>
    );
  }

  const lens = getExamSubjectLens(summary, lensId);

  return (
    <div
      className="mt-6 grid gap-5"
      data-testid={`practical-exam-subject-summary-${subject.id}`}
    >
      <section className="rounded-2xl bg-[#173957] p-6 text-white md:p-7">
        <p className="text-xs font-black tracking-[.14em] text-teal-200">
          시험 직전 핵심요약
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          {subject.code} {subject.title}
        </h2>
        <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-slate-100">
          {lens.examDirection}
        </p>
        <ol className="mt-5 grid gap-2 md:grid-cols-3">
          {lens.priorities.map((priority, index) => (
            <li
              key={priority}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm leading-6"
            >
              <strong className="mr-2 text-teal-200">{index + 1}순위</strong>
              {priority}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[.14em] text-[#8f3f0a]">
              한 줄 정답
            </p>
            <h3 className="mt-1 text-xl font-extrabold">
              문제에서 이 말이 보이면 이렇게 연결
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {summary.sharedCore.length}개
          </span>
        </div>
        <dl className="mt-4 divide-y divide-slate-100">
          {summary.sharedCore.map((fact) => (
            <div
              key={`${fact.conceptId}-${fact.cue}`}
              className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <dt>
                <Link
                  href={`/practical/written/theory/${fact.conceptId}`}
                  className="font-extrabold text-[#16697a] underline decoration-slate-300 underline-offset-4"
                >
                  {fact.cue}
                </Link>
              </dt>
              <dd className="text-sm font-medium leading-6 text-slate-700">
                {fact.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {visualAids.length > 0 ? (
        <section
          className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 md:p-6"
          data-testid={`practical-subject-summary-visuals-${subject.id}`}
        >
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[.14em] text-teal-800">
              그림으로 30초 확인
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-950">
              글보다 빠른 핵심 구조만 봅니다
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              과목 요약에는 최대 3개만 노출합니다. 실제 기출 원본과 자체
              학습 도식은 출처·용도를 구분해 표시합니다.
            </p>
          </div>
          <div
            className={`mt-4 grid gap-4 ${
              visualAids.length > 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {visualAids.slice(0, 3).map((visualAid) => (
              <PracticalVisualAidFigure
                key={visualAid.id}
                visualAid={visualAid}
                density="compact"
              />
            ))}
          </div>
        </section>
      ) : null}

      {summary.quickComparisons.length > 0 || summary.formulas.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {summary.quickComparisons.length > 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black tracking-[.14em] text-[#16697a]">
                빠른 비교
              </p>
              <div className="mt-3 grid gap-3">
                {summary.quickComparisons.map((comparison) => (
                  <div key={comparison.title}>
                    <h3 className="text-sm font-extrabold text-slate-950">
                      {comparison.title}
                    </h3>
                    <dl className="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-3">
                      {comparison.rows.map((row) => (
                        <div
                          key={`${comparison.title}-${row.label}`}
                          className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr]"
                        >
                          <dt className="text-sm font-extrabold text-slate-900">
                            {row.label}
                          </dt>
                          <dd className="text-sm leading-6 text-slate-600">
                            {row.distinction}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {summary.formulas.length > 0 ? (
            <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <p className="text-xs font-black tracking-[.14em] text-sky-800">
                필수 공식
              </p>
              <div className="mt-3 grid gap-3">
                {summary.formulas.slice(0, 3).map((formula) => (
                  <Link
                    key={formula.label}
                    href={`/practical/written/theory/${formula.conceptId}`}
                    className="rounded-xl border border-sky-200 bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
                  >
                    <strong className="text-sm text-sky-950">
                      {formula.label}
                    </strong>
                    <code className="mt-2 block whitespace-normal rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold leading-6 text-white">
                      {formula.formula}
                    </code>
                    <span className="mt-2 block text-xs leading-5 text-slate-600">
                      {formula.note}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
          <p className="text-xs font-black tracking-[.14em] text-amber-800">
            이것만 암기
          </p>
          <ol className="mt-3 space-y-3 text-sm font-bold leading-6 text-amber-950">
            {lens.mustMemorize.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="text-amber-700">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
        <PracticalExamRepresentativeQuestions questions={questions} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/practical/written/theory?view=concept"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700"
        >
          전체 개념 목차
        </Link>
        <Link
          href="/practical/written/theory?view=exam-type"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700"
        >
          기출 유형별 학습
        </Link>
      </div>
    </div>
  );
}
