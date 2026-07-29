import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArrowRight, BookOpenText, ImageIcon, Network, Table2 } from "lucide-react";
import {
  bdaTextbookSubjects,
  getBdaNotionMigrationStats,
  getBdaTextbookSubjectSnapshots,
} from "@/lib/content/bda-notion-snapshot-repository";

export const metadata: Metadata = {
  title: "통합 개념서",
  description: "사용자 제공 이론 전체를 사이트 내부 학습 구조로 통합한 빅데이터분석기사 개념서입니다.",
};

export default function BdaTextbookPage() {
  const stats = getBdaNotionMigrationStats();

  return (
    <main className="page-wrap pb-16 pt-10">
      <header className="overflow-hidden rounded-3xl bg-[#102d47] p-7 text-white sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.2em] text-teal-200">Complete textbook migration</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">외부 원문 없이 학습 가능한<br /><span className="text-teal-200">통합 개념서</span></h1>
        <p className="mt-5 max-w-3xl leading-8 text-slate-200">
          하위 17개 페이지의 이론·표·도식을 사이트 내부에 보존했습니다. 최종본은 과목별 대표 교재로,
          정리본·통합본은 누락 확인과 심화 학습을 위한 원천 스냅샷으로 구분했습니다.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat icon={<Archive />} value={String(stats.pageCount)} label="이관 페이지" />
          <Stat icon={<BookOpenText />} value={`${Math.round(stats.characterCount / 10000)}만`} label="원천 이론 글자" />
          <Stat icon={<Table2 />} value={String(stats.tableCount)} label="이관 표" />
          <Stat icon={<Network />} value={String(stats.diagramCount)} label="Mermaid 도식" />
          <Stat icon={<ImageIcon />} value={String(stats.imageCount)} label="업로드 이미지" />
        </div>
      </header>

      <aside className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <strong>이관 판정:</strong> 원천 페이지에는 별도 업로드 이미지 블록이 없었습니다. 화면에서 그림처럼 보이던
        자료는 표 280개와 Mermaid 도식 55개였으며, 이를 표와 실제 다이어그램으로 재구성했습니다.
        연습문제·정답 토글 100개는 모두 문제 구조와 답안을 재검수해 교재
        본문에 인라인 문제로 연결했습니다. 정답과 해설은 제출 뒤에만
        표시합니다.
      </aside>

      <section className="mt-10">
        <p className="eyebrow">Four subjects</p>
        <h2 className="mt-2 text-3xl font-black text-[#142f4b]">과목별 통합 이론</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {bdaTextbookSubjects.map((subject) => {
            const subjectSnapshots = getBdaTextbookSubjectSnapshots(subject.id);
            return (
              <Link
                key={subject.id}
                href={`/bda/textbook/${subject.id}`}
                className="card group p-6 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#173957] text-lg font-black text-white">{subject.order}</span>
                  <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-700" />
                </div>
                <h3 className="mt-5 text-2xl font-black text-[#142f4b]">{subject.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{subject.description}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">대표 최종본 1개</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">원천 스냅샷 {subjectSnapshots.length}개</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-teal-100 bg-[#edf8f5] p-6 sm:p-8">
        <p className="eyebrow">Learning route</p>
        <h2 className="mt-2 text-2xl font-black text-[#142f4b]">개념서 → 개념지도 → 문제 → 실기 코드</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/bda/concepts" className="rounded-xl bg-[#173957] px-4 py-3 text-sm font-black text-white">C001~C040 개념지도</Link>
          <Link href="/bda/written/practice" className="rounded-xl border border-teal-300 bg-white px-4 py-3 text-sm font-black text-teal-900">검증 확인문제</Link>
          <Link href="/bda/practical" className="rounded-xl border border-teal-300 bg-white px-4 py-3 text-sm font-black text-teal-900">실기 Python 코드</Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <span className="text-teal-200">{icon}</span>
      <strong className="mt-4 block text-2xl font-black">{value}</strong>
      <span className="mt-1 block text-xs text-slate-300">{label}</span>
    </div>
  );
}
