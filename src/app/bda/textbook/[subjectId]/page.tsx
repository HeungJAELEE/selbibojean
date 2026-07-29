import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, BookOpenCheck, ListTree, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { extractMarkdownOutline, type MarkdownOutlineItem } from "@/lib/markdown-outline";
import {
  getBdaSourcePracticeAudit,
  getPublicBdaSourcePracticeBlocks,
} from "@/lib/content/bda-source-practice-repository";
import {
  bdaTextbookSubjects,
  getBdaCanonicalSnapshot,
  getBdaTextbookSubject,
  getBdaTextbookSubjectSnapshots,
  sanitizeNotionSnapshot,
} from "@/lib/content/bda-notion-snapshot-repository";

export function generateStaticParams() {
  return bdaTextbookSubjects.map((subject) => ({ subjectId: subject.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}): Promise<Metadata> {
  const { subjectId } = await params;
  const subject = getBdaTextbookSubject(subjectId);
  return {
    title: subject ? `${subject.order}과목 ${subject.title}` : "통합 개념서",
    description: subject?.description,
  };
}

export default async function BdaTextbookSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = getBdaTextbookSubject(subjectId);
  const canonical = getBdaCanonicalSnapshot(subjectId);
  if (!subject || !canonical) notFound();

  const snapshots = getBdaTextbookSubjectSnapshots(subjectId);
  const supplements = snapshots.filter((snapshot) => snapshot.id !== canonical.id);
  const migrated = sanitizeNotionSnapshot(canonical);
  const sourcePracticeBlocks = getPublicBdaSourcePracticeBlocks(canonical.id);
  const sourcePracticeQuestionCount = sourcePracticeBlocks.reduce(
    (sum, block) => sum + block.questions.length,
    0,
  );
  const sourcePracticeAudit = getBdaSourcePracticeAudit();
  const outline = extractMarkdownOutline(migrated.content);

  return (
    <main className="page-wrap overflow-x-clip pb-16 pt-6 sm:pt-8">
      <Link href="/bda/textbook" className="inline-flex items-center gap-2 text-sm font-black text-teal-800 hover:underline">
        <ArrowLeft size={16} /> 통합 개념서
      </Link>

      <header className="soft-grid mt-5 overflow-hidden rounded-[28px] bg-[#173957] p-6 text-white shadow-[0_24px_70px_rgb(23_57_87_/_0.18)] sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-teal-200">{subject.order}과목 · 통합 교재</p>
        <h1 className="mt-3 break-keep text-[clamp(2rem,8vw,3rem)] font-black leading-[1.14] tracking-[-.04em]">{subject.title}</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-200">{subject.description}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/10 px-3 py-1.5">대표 원천: {canonical.title}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">보강 스냅샷 {supplements.length}개</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            검수 공개 원천문제 {sourcePracticeQuestionCount}개
          </span>
        </div>
        <nav aria-label="과목 바로가기" className="mt-7 grid grid-cols-2 gap-2 border-t border-white/10 pt-5 sm:flex">
          {bdaTextbookSubjects.map((item) => (
            <Link
              key={item.id}
              href={`/bda/textbook/${item.id}`}
              aria-current={item.id === subject.id ? "page" : undefined}
              className={item.id === subject.id
                ? "rounded-xl bg-teal-200 px-3 py-2 text-center text-xs font-black text-[#12364f]"
                : "rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-bold text-slate-100 transition hover:bg-white/20"}
            >
              {item.order}과목
            </Link>
          ))}
        </nav>
      </header>

      <details className="card mt-5 p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-black text-[#173957]">
          <ListTree size={18} className="text-teal-700" /> 이 페이지 빠른 목차
        </summary>
        <OutlineLinks outline={outline} />
      </details>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="card min-w-0 overflow-hidden p-5 sm:p-9">
          <div className="mb-7 flex items-center gap-3 border-b border-slate-200 pb-5">
            <BookOpenCheck className="text-teal-700" />
            <div>
              <p className="eyebrow">Full migrated theory</p>
              <h2 className="mt-1 text-2xl font-black text-[#142f4b]">전체 이론·표·도식</h2>
            </div>
          </div>
          <MarkdownContent
            content={migrated.content}
            sourcePracticeBlocks={sourcePracticeBlocks}
          />
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
            <div className="flex items-center gap-2">
              <ListTree size={17} className="text-teal-700" />
              <h2 className="font-black text-[#142f4b]">이 페이지 목차</h2>
            </div>
            <OutlineLinks outline={outline} />
          </section>

          <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <p className="eyebrow text-teal-700">Integrated map</p>
            <h2 className="mt-2 text-lg font-black text-teal-950">개념·문제로 연결</h2>
            <div className="mt-4 grid gap-2">
              <Link href={`/bda/concepts#subject-${subject.order}`} className="flex items-center justify-between rounded-xl bg-[#173957] px-3 py-2.5 text-sm font-black text-white">
                개념지도 <ArrowRight size={15} />
              </Link>
              <Link href="/bda/written/practice" className="flex items-center justify-between rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm font-black text-teal-950">
                검증 확인문제 <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <Archive size={17} className="text-slate-500" />
              <h2 className="font-black text-[#142f4b]">보강 원천 스냅샷</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">최종본과 겹치더라도 누락 없이 이관한 정리본·통합본입니다.</p>
            <div className="mt-4 grid gap-2">
              {supplements.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700"
                >
                  {snapshot.title}
                  <span className="mt-1 block text-xs font-medium text-slate-500">
                    중복·누락 대조용 내부 메타데이터
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <ShieldCheck size={18} />
            <p className="mt-2">
              <strong>제출 후 공개:</strong> 검수한 원천 문제는 모두 본문 토글에서
              풀 수 있습니다. 정답·해설은 답안을 제출한 뒤에만 표시합니다.
            </p>
            <p className="mt-2 text-xs">
              전체 원천 블록 {sourcePracticeAudit.sourceBlockCount}개 · 검수 공개{" "}
              {sourcePracticeAudit.publishedBlockCount}개 · 보류{" "}
              {sourcePracticeAudit.heldBlockCount}개
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function OutlineLinks({ outline }: { outline: MarkdownOutlineItem[] }) {
  return (
    <nav aria-label="교재 장 목차" className="mt-4 grid max-h-[46vh] gap-1.5 overflow-y-auto pr-1">
      {outline.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="group grid grid-cols-[1.5rem_1fr] gap-2 rounded-lg px-2 py-2 text-sm leading-5 text-slate-600 transition hover:bg-teal-50 hover:text-teal-900"
        >
          <span className="font-black text-teal-700">{String(index + 1).padStart(2, "0")}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
