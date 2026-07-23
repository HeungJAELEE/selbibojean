"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, ClipboardList, RotateCcw } from "lucide-react";
import type { Subject } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const SESSION_PREFIX = "seolbi:practice:";
const RATIOS = [0, 25, 50, 75, 100] as const;

type Allocation = {
  subjectId: string;
  enabled: boolean;
  count: number;
};

export function WrittenMockSetup({ subjects, availableBySubject }: { subjects: Subject[]; availableBySubject: Record<string, number> }) {
  const router = useRouter();
  const [allocations, setAllocations] = useState<Allocation[]>(
    subjects.map((subject) => ({ subjectId: subject.id, enabled: true, count: Math.min(20, availableBySubject[subject.id] ?? 0) })),
  );
  const [originalRatio, setOriginalRatio] = useState<(typeof RATIOS)[number]>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enabledAllocations = allocations.filter((allocation) => allocation.enabled);
  const totalCount = useMemo(
    () => enabledAllocations.reduce((total, allocation) => total + allocation.count, 0),
    [enabledAllocations],
  );
  const standardTotal = subjects.reduce((total, subject) => total + Math.min(20, availableBySubject[subject.id] ?? 0), 0);
  const standardReady = standardTotal === subjects.length * 20;

  async function startMock(standard: boolean) {
    const selected = standard
      ? subjects.map((subject) => ({ subjectId: subject.id, count: 20 }))
      : enabledAllocations.map(({ subjectId, count }) => ({ subjectId, count }));
    if (selected.length === 0) {
      setError("한 과목 이상 선택해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "mock",
          subjectAllocations: selected,
          count: selected.reduce((total, allocation) => total + allocation.count, 0),
          originalRatio,
        }),
      });
      const session = await response.json() as { sessionId?: string; error?: string };
      if (!response.ok || !session.sessionId) throw new Error(session.error ?? "모의고사를 시작하지 못했습니다.");
      localStorage.setItem(`${SESSION_PREFIX}${session.sessionId}`, JSON.stringify(session));
      router.push(`/written/practice/random?resume=${session.sessionId}&index=0`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "모의고사를 시작하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function updateAllocation(subjectId: string, update: Partial<Allocation>) {
    setAllocations((items) => items.map((item) => item.subjectId === subjectId ? { ...item, ...update } : item));
  }

  return (
    <div className="grid gap-6 pb-16">
      <section className="card overflow-hidden border-[#173957]">
        <div className="grid gap-6 bg-[#173957] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#8dd5ce]">Standard written mock</p>
            <h2 className="mt-2 text-2xl font-extrabold">실전형 80문제 구성</h2>
            <p className="mt-3 leading-7 text-slate-200">시험 형식은 4과목을 각각 20문제씩 구성합니다. 현재 공개 검수를 통과한 문제는 총 {standardTotal}개이며 같은 문제는 한 시험에서 중복되지 않습니다.</p>
            {!standardReady && <p className="mt-3 rounded-xl bg-amber-300/15 px-4 py-3 text-sm font-bold text-amber-100">제2과목을 포함한 부족 문제를 검수·보강하면 자동으로 80문제 구성이 활성화됩니다.</p>}
          </div>
          <button type="button" onClick={() => startMock(true)} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-[#8f3f0a] px-6 py-4 font-extrabold text-white disabled:opacity-50">
            {loading ? "구성 중…" : standardReady ? "80문제 시작" : `검수 완료 ${standardTotal}문제 시작`} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="custom-mock-title">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]"><ClipboardList size={21} /></span>
          <div><p className="eyebrow">Custom mock</p><h2 id="custom-mock-title" className="mt-1 text-2xl font-extrabold">커스텀 필기 모의고사</h2><p className="mt-2 text-sm leading-6 text-slate-600">응시할 과목과 과목별 문제 수, 실제 기출 비율을 직접 선택합니다.</p></div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {subjects.map((subject) => {
            const allocation = allocations.find((item) => item.subjectId === subject.id);
            if (!allocation) return null;
            const availableCount = availableBySubject[subject.id] ?? 0;
            const countOptions = [...new Set([5, 10, 15, 20, Math.min(20, availableCount)])]
              .filter((count) => count > 0 && count <= availableCount)
              .sort((left, right) => left - right);
            return (
              <div key={subject.id} className={cn("rounded-2xl border p-4", allocation.enabled ? "border-[#6fb5b1] bg-[#f2fbfa]" : "border-slate-200 bg-slate-50")}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={allocation.enabled} onChange={(event) => updateAllocation(subject.id, { enabled: event.target.checked })} className="mt-1 size-5 accent-[#16697a]" />
                  <span><strong className="block text-[#173957]">제{subject.code}과목 · {subject.shortTitle}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{subject.description}</span></span>
                </label>
                <label className="mt-4 grid gap-2 text-sm font-bold">문제 수
                  <select aria-label={`제${subject.code}과목 문제 수`} disabled={!allocation.enabled} value={allocation.count} onChange={(event) => updateAllocation(subject.id, { count: Number(event.target.value) })} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-50">
                    {countOptions.map((count) => <option key={count} value={count}>{count}문제</option>)}
                  </select>
                  <span className="text-xs font-medium text-slate-500">검수 완료 {availableCount}문제</span>
                </label>
              </div>
            );
          })}
        </div>

        <fieldset className="mt-7">
          <legend className="text-sm font-extrabold">실제 기출 비율</legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {RATIOS.map((ratio) => (
              <label key={ratio} className={cn("relative cursor-pointer overflow-hidden rounded-xl border px-3 py-3 text-center text-sm font-bold", originalRatio === ratio ? "border-[#16697a] bg-[#eaf7f6] text-[#135c69]" : "border-slate-200")}>
                <input type="radio" name="mock-original-ratio" value={ratio} checked={originalRatio === ratio} onChange={() => setOriginalRatio(ratio)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                <span className="pointer-events-none relative">{ratio}%</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><strong className="text-lg text-[#173957]">총 {totalCount}문제</strong><p className="mt-1 text-sm text-slate-500">선택 과목 {enabledAllocations.length}개 · 실제 기출 목표 {Math.round(totalCount * originalRatio / 100)}문제</p></div>
          <button type="button" onClick={() => startMock(false)} disabled={loading || totalCount === 0} className="flex items-center justify-center gap-2 rounded-xl bg-[#173957] px-6 py-4 font-extrabold text-white disabled:opacity-40">
            커스텀 모의고사 시작 <ArrowRight size={18} />
          </button>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/written/practice/random?mode=weak" className="card flex items-center gap-4 p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><BookOpenCheck size={19} /></span><span><strong className="block">취약 영역 집중 학습</strong><span className="mt-1 block text-sm text-slate-500">과목별로 많이 틀린 개념의 다른 문제를 풉니다.</span></span></Link>
        <Link href="/written/review" className="card flex items-center gap-4 p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><RotateCcw size={19} /></span><span><strong className="block">오답노트·복습</strong><span className="mt-1 block text-sm text-slate-500">오답과 복습 예정 문제를 다시 확인합니다.</span></span></Link>
      </section>
    </div>
  );
}
