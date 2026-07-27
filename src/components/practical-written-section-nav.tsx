import Link from "next/link";

const sections = [
  { href: "/practical/written/theory?view=concept", label: "개념별 학습" },
  { href: "/practical/written/theory?view=exam-type", label: "기출 유형별" },
  { href: "/practical/written/past", label: "기출복원" },
  { href: "/practical/written/predicted", label: "기출변형·필답예상" },
  {
    href: "/practical/written/theory?view=exam-type#all-exam-cards-title",
    label: "필수암기카드",
  },
  { href: "/practical/mock", label: "모의고사" },
] as const;

export function PracticalWrittenSectionNav() {
  return (
    <nav
      aria-label="실기 필답형 학습 구역"
      className="mt-5 flex gap-2 overflow-x-auto pb-2"
    >
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-400 hover:text-teal-800"
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
