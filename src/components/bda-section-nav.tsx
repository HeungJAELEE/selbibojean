import Link from "next/link";
import {
  BarChart3,
  BookOpenText,
  BrainCircuit,
  Code2,
  Database,
  Home,
} from "lucide-react";

const links = [
  { href: "/bda", label: "학습 홈", icon: Home },
  { href: "/bda/concepts", label: "개념 지도", icon: BookOpenText },
  { href: "/bda/bank", label: "문제은행", icon: BrainCircuit },
  { href: "/bda/practical", label: "실기 코드", icon: Code2 },
  { href: "/bda/sources", label: "수집 현황", icon: Database },
] as const;

export function BdaSectionNav({ homeHref = "/bda" }: { homeHref?: string }) {
  return (
    <div className="border-b border-slate-200 bg-[#f7fbff]">
      <div className="page-wrap flex min-h-14 flex-wrap items-center justify-between gap-2 py-2">
        <Link href={homeHref} className="flex items-center gap-2 font-black text-[#142f4b]">
          <span className="grid size-8 place-items-center rounded-lg bg-[#0f766e] text-white">
            <BarChart3 size={17} />
          </span>
          <span className="hidden sm:inline">빅데이터분석기사</span>
          <span className="rounded-full bg-teal-100 px-2 py-1 text-[10px] font-black text-teal-800">
            개인 학습
          </span>
        </Link>
        <nav aria-label="빅데이터분석기사 학습 메뉴" className="flex flex-wrap items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#0f766e] sm:px-3 sm:text-sm"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
