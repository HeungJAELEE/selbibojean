import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, BookOpenCheck, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
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

  return (
    <main className="page-wrap pb-16 pt-8">
      <Link href="/bda/textbook" className="inline-flex items-center gap-2 text-sm font-black text-teal-800 hover:underline">
        <ArrowLeft size={16} /> 통합 개념서
      </Link>

      <header className="mt-5 overflow-hidden rounded-3xl bg-[#173957] p-7 text-white sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-teal-200">Subject {subject.order} · canonical textbook</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">{subject.title}</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-200">{subject.description}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/10 px-3 py-1.5">대표 원천: {canonical.title}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">보강 스냅샷 {supplements.length}개</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">정답보호 제외 블록 {migrated.hiddenExerciseCount}개</span>
        </div>
      </header>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="card min-w-0 p-6 sm:p-9">
          <div className="mb-7 flex items-center gap-3 border-b border-slate-200 pb-5">
            <BookOpenCheck className="text-teal-700" />
            <div>
              <p className="eyebrow">Full migrated theory</p>
              <h2 className="mt-1 text-2xl font-black text-[#142f4b]">전체 이론·표·도식</h2>
            </div>
          </div>
          <MarkdownContent content={migrated.content} />
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
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
                <Link key={snapshot.id} href={`/bda/textbook/source/${snapshot.id}`} className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-900">
                  {snapshot.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <ShieldCheck size={18} />
            <p className="mt-2"><strong>답안 보호:</strong> 원천 연습문제와 정답은 서버 스냅샷에 보존되지만, 검수 전에는 이 화면에 전달하지 않습니다.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
