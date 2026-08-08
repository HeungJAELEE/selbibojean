import Link from "next/link";

const sections = [
  {
    id: "home",
    href: "/practical/written",
    label: "필답 홈",
  },
  {
    id: "subjects",
    href: "/practical/written/theory?view=concept",
    label: "과목별·NCS",
  },
  {
    id: "exam-types",
    href: "/practical/written/theory?view=exam-type",
    label: "기출 유형별",
  },
  {
    id: "past",
    href: "/practical/written/past",
    label: "기출복원",
  },
  {
    id: "predicted",
    href: "/practical/written/predicted",
    label: "예상문제",
  },
  {
    id: "mock",
    href: "/practical/mock",
    label: "모의고사",
  },
] as const;

export type PracticalWrittenSection =
  | "home"
  | "subjects"
  | "exam-types"
  | "past"
  | "predicted"
  | "mock";

export function PracticalWrittenSectionNav({
  activeSection,
}: {
  activeSection: PracticalWrittenSection;
}) {
  return (
    <nav
      aria-label="필답 학습 메뉴"
      className="mt-5 flex max-w-full gap-2 overflow-x-auto pb-2"
      data-testid="practical-written-section-nav"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-bold transition ${
              isActive
                ? "border-[#173957] bg-[#173957] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-800"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
