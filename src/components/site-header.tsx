"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenCheck, Menu, Search, X } from "lucide-react";

const navItems = [
  ["이론 보기", "/written/theory"],
  ["필기 모의고사", "/written/mock"],
  ["실기 모의고사", "/practical/mock"],
  ["오답·복습", "/written/review"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-wrap flex min-h-18 items-center justify-between gap-2 py-2 sm:gap-5">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-black tracking-tight sm:gap-3" aria-label="설비보전기사 마스터북 홈">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#173957] text-white sm:size-10"><BookOpenCheck size={21} /></span>
          <span className="min-w-0 text-sm leading-tight sm:text-base">
            <span className="block whitespace-nowrap">설비보전기사</span>
            <span className="block whitespace-nowrap text-xs text-[#16697a] sm:inline sm:text-base sm:text-inherit"> 마스터북</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-xs font-semibold text-slate-600 md:flex lg:gap-7 lg:text-sm" aria-label="주 메뉴">
          {navItems.map(([label, href]) => <Link key={href} href={href} className="hover:text-[#16697a]">{label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/search" className="hidden size-10 place-items-center rounded-xl border border-slate-200 sm:grid" aria-label="검색"><Search size={18} /></Link>
          <Link href="/login" className="rounded-xl bg-[#173957] px-3 py-2.5 text-xs font-bold text-white sm:px-4 sm:text-sm">로그인</Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-slate-200 md:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden" aria-label="모바일 주 메뉴">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-[#173957]">
                {label}
              </Link>
            ))}
            <Link href="/search" onClick={() => setMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#173957]">
              <Search size={16} /> 통합 검색
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
