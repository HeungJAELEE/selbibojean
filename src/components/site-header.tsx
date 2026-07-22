import Link from "next/link";
import { BookOpenCheck, Menu, Search } from "lucide-react";

const navItems = [
  ["이론", "/written/theory"],
  ["문제풀이", "/written/practice"],
  ["복습", "/written/review"],
  ["학습현황", "/progress"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-wrap flex h-18 items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight" aria-label="설비마스터 홈">
          <span className="grid size-10 place-items-center rounded-xl bg-[#173957] text-white"><BookOpenCheck size={21} /></span>
          <span>설비마스터</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="주 메뉴">
          {navItems.map(([label, href]) => <Link key={href} href={href} className="hover:text-[#16697a]">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/search" className="grid size-10 place-items-center rounded-xl border border-slate-200" aria-label="검색"><Search size={18} /></Link>
          <Link href="/login" className="rounded-xl bg-[#173957] px-4 py-2.5 text-sm font-bold text-white">로그인</Link>
          <button className="grid size-10 place-items-center rounded-xl border border-slate-200 md:hidden" aria-label="메뉴 열기"><Menu size={19} /></button>
        </div>
      </div>
    </header>
  );
}

