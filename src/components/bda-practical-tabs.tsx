"use client";

import Link from "next/link";
import {
  Braces,
  ClipboardCheck,
  Files,
  FlaskConical,
  ShieldCheck,
  Table2,
  SquareTerminal,
} from "lucide-react";
import type { KeyboardEvent } from "react";
import type { BdaPracticalTab } from "@/lib/domain/bda-course-curriculum";

const tabs = [
  { id: "overview", label: "시험 안내", shortLabel: "안내", icon: ClipboardCheck },
  { id: "foundations", label: "Python 기초", shortLabel: "기초", icon: SquareTerminal },
  { id: "type1", label: "유형 1", shortLabel: "유형1", icon: Table2 },
  { id: "type2", label: "유형 2", shortLabel: "유형2", icon: Braces },
  { id: "type3", label: "유형 3", shortLabel: "유형3", icon: FlaskConical },
  { id: "submission", label: "제출·검수", shortLabel: "제출", icon: ShieldCheck },
  { id: "course-library", label: "원본 자료실", shortLabel: "자료", icon: Files },
] as const satisfies ReadonlyArray<{
  id: BdaPracticalTab;
  label: string;
  shortLabel: string;
  icon: typeof ClipboardCheck;
}>;

export function BdaPracticalTabs({
  activeTab,
}: {
  activeTab: BdaPracticalTab;
}) {
  function moveFocus(
    event: KeyboardEvent<HTMLAnchorElement>,
    currentIndex: number,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const tabList = event.currentTarget.closest('[role="tablist"]');
    const candidates = Array.from(
      tabList?.querySelectorAll<HTMLAnchorElement>('[role="tab"]') ?? [],
    );
    if (candidates.length === 0) return;

    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? candidates.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % candidates.length
            : (currentIndex - 1 + candidates.length) % candidates.length;
    candidates[nextIndex]?.focus();
  }

  return (
    <div className="overflow-x-auto rounded-t-2xl border-b border-slate-200">
      <div
        role="tablist"
        aria-label="실기 학습 영역"
        className="grid min-w-[56rem] grid-cols-7"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const selected = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              id={`tab-${tab.id}`}
              href={`/bda/practical?tab=${tab.id}`}
              role="tab"
              aria-label={tab.label}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onKeyDown={(event) => moveFocus(event, index)}
              className={`flex min-h-16 min-w-32 items-center justify-center gap-2 border-b-3 px-4 text-sm font-black transition ${
                selected
                  ? "border-[#0f766e] bg-[#edf8f5] text-[#0f5f59]"
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-[#142f4b]"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
