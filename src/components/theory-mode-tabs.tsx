import Link from "next/link";
import { BookOpen, Wrench } from "lucide-react";

export type TheoryMode = "written" | "practical";

export function TheoryModeTabs({ mode }: { mode: TheoryMode }) {
  const tabs = [
    {
      id: "written" as const,
      label: "필기 중심",
      description: "개념 이해 → 객관식 함정 → 문제풀이 → 오답복습",
      icon: BookOpen,
    },
    {
      id: "practical" as const,
      label: "실기·필답 중심",
      description: "개념 이해 → 기출 키워드 → 답안작성 → 작업 적용",
      icon: Wrench,
    },
  ];

  return (
    <nav
      aria-label="이론 학습 모드"
      className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-2"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = mode === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/theory?mode=${tab.id}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-2xl border p-5 transition ${
              active
                ? "border-[#16697a] bg-[#173957] text-white shadow-sm"
                : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
            }`}
          >
            <span className="flex items-center gap-2 text-lg font-extrabold">
              <Icon size={20} />
              {tab.label}
            </span>
            <span
              className={`mt-2 block text-sm leading-6 ${
                active ? "text-slate-200" : "text-slate-500"
              }`}
            >
              {tab.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
