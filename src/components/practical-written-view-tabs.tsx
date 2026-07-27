"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type PracticalWrittenTheoryView =
  | "subject-summary"
  | "concept"
  | "exam-type";

const STORAGE_KEY = "seolbi-practical-written-theory-view-v2";
const buildHref = (
  basePath: string,
  mode: boolean,
  view: PracticalWrittenTheoryView,
) => `${basePath}?${mode ? "mode=practical&" : ""}view=${view}`;

export function PracticalWrittenViewTabs({
  view,
  basePath = "/practical/written/theory",
  mode = false,
}: {
  view: PracticalWrittenTheoryView;
  basePath?: string;
  mode?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.has("view")) return;
    const storedView = readStoredPracticalWrittenView();
    if (storedView !== view) {
      router.replace(buildHref(basePath, mode, storedView));
    }
  }, [basePath, mode, router, searchParams, view]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view);
  }, [view]);

  return (
    <nav
      aria-label="실기 필답형 학습 보기"
      className="mt-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 lg:grid-cols-3"
      data-testid="practical-written-view-tabs"
    >
      <Link
        href={buildHref(basePath, mode, "subject-summary")}
        aria-current={view === "subject-summary" ? "page" : undefined}
        className={`rounded-xl px-5 py-4 text-center text-sm font-extrabold ${
          view === "subject-summary"
            ? "bg-[#173957] text-white"
            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
        }`}
      >
        과목별 핵심요약
        <span className="mt-1 block text-xs font-medium opacity-80">
          시험 방향 → 한 줄 정답 → 대표 문제
        </span>
      </Link>
      <Link
        href={buildHref(basePath, mode, "concept")}
        aria-current={view === "concept" ? "page" : undefined}
        className={`rounded-xl px-5 py-4 text-center text-sm font-extrabold ${
          view === "concept"
            ? "bg-[#173957] text-white"
            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
        }`}
      >
        개념별 학습
        <span className="mt-1 block text-xs font-medium opacity-80">
          30초 이해 → 비교 → 기출 적용
        </span>
      </Link>
      <Link
        href={buildHref(basePath, mode, "exam-type")}
        aria-current={view === "exam-type" ? "page" : undefined}
        className={`rounded-xl px-5 py-4 text-center text-sm font-extrabold ${
          view === "exam-type"
            ? "bg-[#173957] text-white"
            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
        }`}
      >
        기출 유형별 학습
        <span className="mt-1 block text-xs font-medium opacity-80">
          사진·계산·순서 등 8유형 직접 풀기
        </span>
      </Link>
    </nav>
  );
}

export function readStoredPracticalWrittenView(): PracticalWrittenTheoryView {
  if (typeof window === "undefined") return "subject-summary";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "concept" || stored === "exam-type"
    ? stored
    : "subject-summary";
}
