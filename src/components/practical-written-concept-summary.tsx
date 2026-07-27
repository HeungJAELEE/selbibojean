import type { PracticalConcept } from "@/lib/domain/practical-types";

export function PracticalWrittenConceptSummary({
  concept,
}: {
  concept: PracticalConcept;
}) {
  return (
    <section
      data-testid="practical-written-concept-summary"
      className="mt-8 grid gap-5"
    >
      <div className="rounded-3xl bg-[#173957] p-6 text-white md:p-8">
        <p className="text-xs font-black uppercase tracking-[.14em] text-teal-200">
          30초 이해
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">30초 개념 요약</h2>
        <p className="mt-4 max-w-4xl text-base font-bold leading-8 text-white">
          {concept.definition}
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-200">
          {concept.principle}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h3 className="font-extrabold text-sky-950">헷갈리는 개념 비교</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {(concept.traps.length > 0
              ? concept.traps
              : ["정의의 적용조건과 단위를 빼지 않습니다."]
            )
              .slice(0, 3)
              .map((trap) => (
                <li key={trap} className="rounded-xl bg-white px-4 py-3">
                  × {trap}
                </li>
              ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-extrabold text-amber-950">시험에 쓰는 핵심어</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {concept.requiredKeywords.slice(0, 6).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-950"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-amber-900">
            아래 기출카드에서 답을 가리고 먼저 작성한 뒤, 제출 후 모범답안과
            부분점수 기준을 비교하세요.
          </p>
        </section>
      </div>
    </section>
  );
}
