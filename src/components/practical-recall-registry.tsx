import Image from "next/image";
import type { PublicPracticalRecallRegistryEntry } from "@/data/source/practical-question-recall-evidence";

const statusStyles: Record<
  PublicPracticalRecallRegistryEntry["status"],
  string
> = {
  linked_existing: "border-slate-200 bg-slate-100 text-slate-700",
  learning_verified: "border-emerald-200 bg-emerald-50 text-emerald-800",
  evidence_reviewed: "border-teal-200 bg-teal-50 text-teal-800",
  answer_resolved: "border-blue-200 bg-blue-50 text-blue-800",
  answer_conflict: "border-red-200 bg-red-50 text-red-800",
  asset_required: "border-amber-200 bg-amber-50 text-amber-900",
};

export function PracticalRecallRegistry({
  entries,
}: {
  entries: PublicPracticalRecallRegistryEntry[];
}) {
  const groups = [...new Set(entries.map((entry) => entry.occurrenceLabel))];
  const visibleStatuses = (
    [
      ["linked_existing", "기존문항 연결"],
      ["learning_verified", "응시자 복원·개념 보강"],
      ["evidence_reviewed", "근거 검토 완료"],
      ["answer_resolved", "정답 교정 완료"],
      ["answer_conflict", "정답 충돌"],
      ["asset_required", "원그림 필요"],
    ] as const
  ).filter(([status]) => entries.some((entry) => entry.status === status));

  return (
    <section
      aria-labelledby="recall-registry-title"
      className="mt-10"
      data-testid="practical-recall-registry"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="max-w-3xl">
          <p className="eyebrow">출제 이력</p>
          <h2
            id="recall-registry-title"
            className="mt-2 text-balance text-2xl font-black text-[#173957]"
          >
            복원 기출 등록부
          </h2>
          <p className="mt-3 text-pretty leading-7 text-slate-600">
            공식 PDF나 NCS locator가 없더라도 응시자 기록에서 출제가 확인된
            항목은 응시자 복원 기출로 등록했습니다. 원문·보기·사진이 빠진
            경우에도 출제 이력과 학습 개념은 보존하되, 정답 충돌이나
            원그림이 필요한 문제만 별도로 보류합니다. 외부 이미지는
            출처·이용조건과 시험 원사진이 아니라는 경계를 함께 표시합니다.
          </p>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          aria-label="복원 기출 상태 설명"
        >
          {visibleStatuses.map(([status, label]) => (
            <span
              key={status}
              className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusStyles[status]}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {groups.map((group) => {
          const groupEntries = entries.filter(
            (entry) => entry.occurrenceLabel === group,
          );
          return (
            <section key={group} aria-labelledby={`registry-${group}`}>
              <div className="mb-3 flex items-end justify-between gap-4">
                <h3
                  id={`registry-${group}`}
                  className="text-xl font-black text-[#173957]"
                >
                  {group}
                </h3>
                <p className="text-sm font-bold text-slate-500">
                  {groupEntries.length}개 항목
                </p>
              </div>

              <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {groupEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-b border-slate-100 p-4 last:border-b-0 md:p-5"
                    data-testid="practical-recall-registry-item"
                  >
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {entry.questionLabel ? (
                            <span className="text-sm font-extrabold text-[#16697a]">
                              {entry.questionLabel}
                            </span>
                          ) : null}
                          <h4 className="text-base font-black text-slate-900">
                            {entry.topic}
                          </h4>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {entry.limitation}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusStyles[entry.status]}`}
                      >
                        {entry.statusLabel}
                      </span>
                    </div>

                    <details className="mt-3">
                      <summary className="w-fit cursor-pointer rounded-md text-sm font-extrabold text-[#16697a] outline-none focus-visible:ring-2 focus-visible:ring-[#16697a] focus-visible:ring-offset-2">
                        등록 근거·개념 보강 보기
                      </summary>
                      <div className="mt-3 rounded-xl bg-slate-50 p-4">
                        {entry.learningPoint || entry.memoryTip ? (
                          <div className="mb-4 grid gap-3 md:grid-cols-2">
                            {entry.learningPoint ? (
                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                                <p className="text-xs font-black text-blue-800">
                                  핵심
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {entry.learningPoint}
                                </p>
                              </div>
                            ) : null}
                            {entry.memoryTip ? (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs font-black text-amber-900">
                                  암기팁
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {entry.memoryTip}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {entry.conceptTitle ? (
                          <section className="mb-4 rounded-xl border border-teal-200 bg-white p-4">
                            <p className="text-xs font-black text-[#16697a]">
                              복원 기출 개념 보강
                            </p>
                            <h5 className="mt-1 text-base font-black text-slate-900">
                              {entry.conceptTitle}
                            </h5>
                            {entry.conceptDefinition ? (
                              <div className="mt-3">
                                <p className="text-xs font-black text-slate-500">
                                  정의
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {entry.conceptDefinition}
                                </p>
                              </div>
                            ) : null}
                            {entry.conceptBackground ? (
                              <div className="mt-3">
                                <p className="text-xs font-black text-slate-500">
                                  이해를 위한 배경
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {entry.conceptBackground}
                                </p>
                              </div>
                            ) : null}
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              {entry.examCoverage.length > 0 ? (
                                <div>
                                  <p className="text-xs font-black text-[#16697a]">
                                    관련 출제 유형
                                  </p>
                                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700">
                                    {entry.examCoverage.map((coverage) => (
                                      <li key={coverage}>• {coverage}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                              {entry.keyRules.length > 0 ? (
                                <div>
                                  <p className="text-xs font-black text-[#16697a]">
                                    정답을 가르는 기준
                                  </p>
                                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700">
                                    {entry.keyRules.map((rule) => (
                                      <li key={rule}>• {rule}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                            {entry.traps.length > 0 ? (
                              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs font-black text-amber-900">
                                  대표 오답 함정
                                </p>
                                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700">
                                  {entry.traps.map((trap) => (
                                    <li key={trap}>• {trap}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {entry.residualRisk ? (
                              <p className="mt-3 text-xs leading-5 text-slate-500">
                                남은 경계: {entry.residualRisk}
                              </p>
                            ) : null}
                          </section>
                        ) : null}

                        {entry.referenceVisual ? (
                          <figure className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
                            <div className="flex min-h-52 items-center justify-center rounded-lg bg-slate-50 p-3">
                              <Image
                                src={entry.referenceVisual.src}
                                alt={entry.referenceVisual.alt}
                                width={960}
                                height={720}
                                unoptimized
                                className="h-auto max-h-[32rem] w-full object-contain"
                              />
                            </div>
                            <figcaption className="mt-3 text-sm leading-6 text-slate-600">
                              <span className="font-black text-slate-800">
                                {entry.referenceVisual.caption}
                              </span>
                              <span className="mt-1 block">
                                {entry.referenceVisual.usageBoundary}
                              </span>
                              <span className="mt-1 block text-xs">
                                출처:{" "}
                                <a
                                  href={entry.referenceVisual.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-extrabold text-[#16697a] underline decoration-[#16697a]/40 underline-offset-4"
                                >
                                  {entry.referenceVisual.sourceTitle}
                                </a>{" "}
                                · 이용조건: {entry.referenceVisual.license}
                              </span>
                              {entry.referenceVisual.modificationNote ? (
                                <span className="mt-1 block text-xs">
                                  가공:{" "}
                                  {entry.referenceVisual.modificationNote}
                                </span>
                              ) : null}
                            </figcaption>
                          </figure>
                        ) : null}

                        <ul className="flex flex-wrap gap-2">
                          {entry.evidenceLabels.map((label) => (
                            <li
                              key={label}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700"
                            >
                              {label}
                            </li>
                          ))}
                        </ul>
                        {entry.sourceLinks.length > 0 ? (
                          <ul className="mt-3 space-y-2 text-sm">
                            {entry.sourceLinks.map((source) => (
                              <li
                                key={source.url}
                                className="rounded-lg border border-slate-200 bg-white p-3"
                              >
                                <span className="mb-1 block text-xs font-black text-slate-500">
                                  {source.authorityLabel}
                                </span>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-extrabold text-[#16697a] underline decoration-[#16697a]/40 underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16697a]"
                                >
                                  {source.title}
                                </a>
                                {source.supports ? (
                                  <p className="mt-1 leading-6 text-slate-600">
                                    {source.supports}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
