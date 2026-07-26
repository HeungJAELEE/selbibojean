"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type {
  StudyMode,
  UnifiedLearningConcept,
} from "@/lib/domain/unified-learning";
import { getUnifiedModeHref } from "@/data/source/unified-learning-concepts";

const STORAGE_KEY = "seolbi-study-mode-v1";
const MODE_CHANGE_EVENT = "seolbi-study-mode-change";

const labels: Record<StudyMode, string> = {
  integrated: "통합",
  written: "필기",
  practical: "실기",
};

export function StudyModeSwitch({
  concept,
  currentMode,
}: {
  concept: UnifiedLearningConcept;
  currentMode: StudyMode;
}) {
  const rememberedMode = useSyncExternalStore(
    subscribeToStudyMode,
    readStoredStudyMode,
    () => null,
  );

  function remember(mode: StudyMode) {
    window.localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new Event(MODE_CHANGE_EVENT));
  }

  return (
    <nav
      aria-label={`${concept.title} 학습 모드`}
      data-testid="study-mode-switch"
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#16697a]">
            학습 관점
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {concept.title}
            {rememberedMode && rememberedMode !== currentMode ? (
              <span className="ml-2 font-medium text-slate-400">
                최근 선택: {labels[rememberedMode]}
              </span>
            ) : null}
          </p>
        </div>
        <div className="inline-grid grid-cols-3 rounded-xl bg-slate-100 p-1">
          {(["integrated", "written", "practical"] as const).map((mode) => {
            const href = getUnifiedModeHref(concept, mode);
            const active = mode === currentMode;
            const className = `rounded-lg px-3 py-2 text-sm font-extrabold transition ${
              active
                ? "bg-[#173957] text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-[#173957]"
            }`;

            if (!href) {
              return (
                <span
                  key={mode}
                  aria-disabled="true"
                  className="cursor-not-allowed rounded-lg px-3 py-2 text-sm font-bold text-slate-300"
                  title="직접 연결된 학습자료가 없습니다."
                >
                  {labels[mode]}
                </span>
              );
            }

            return (
              <Link
                key={mode}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => remember(mode)}
                className={className}
              >
                {labels[mode]}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function subscribeToStudyMode(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(MODE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(MODE_CHANGE_EVENT, onStoreChange);
  };
}

function readStoredStudyMode(): StudyMode | null {
  const storedMode = window.localStorage.getItem(STORAGE_KEY);
  return storedMode === "integrated" ||
    storedMode === "written" ||
    storedMode === "practical"
    ? storedMode
    : null;
}
