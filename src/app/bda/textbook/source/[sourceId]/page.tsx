import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Archive, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import {
  getBdaNotionSnapshot,
  getBdaNotionSnapshots,
  getBdaTextbookSubject,
  sanitizeNotionSnapshot,
} from "@/lib/content/bda-notion-snapshot-repository";

export function generateStaticParams() {
  return getBdaNotionSnapshots().map((snapshot) => ({ sourceId: snapshot.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sourceId: string }>;
}): Promise<Metadata> {
  const { sourceId } = await params;
  const snapshot = getBdaNotionSnapshot(sourceId);
  return {
    title: snapshot?.title ?? "이관 원천 스냅샷",
    description: "Notion에서 사이트 내부로 이관한 원천 이론 스냅샷입니다.",
  };
}

export default async function BdaTextbookSourcePage({
  params,
}: {
  params: Promise<{ sourceId: string }>;
}) {
  const { sourceId } = await params;
  const snapshot = getBdaNotionSnapshot(sourceId);
  if (!snapshot) notFound();

  const subject = getBdaTextbookSubject(snapshot.subjectId);
  const migrated = sanitizeNotionSnapshot(snapshot);

  return (
    <main className="page-wrap pb-16 pt-8">
      <Link href={`/bda/textbook/${snapshot.subjectId}`} className="inline-flex items-center gap-2 text-sm font-black text-teal-800 hover:underline">
        <ArrowLeft size={16} /> {subject?.title ?? "통합 개념서"}
      </Link>

      <header className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="flex items-center gap-2 text-slate-500"><Archive size={17} /><span className="text-xs font-black uppercase tracking-[.16em]">Migrated source snapshot</span></div>
        <h1 className="mt-3 text-3xl font-black text-[#142f4b] sm:text-4xl">{snapshot.title}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          원천 페이지 전체를 사이트 내부에 보존한 스냅샷입니다. 대표 교재와 중복되는 내용도 누락 검증과 상세 학습을 위해 유지합니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{snapshot.revision}</span>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">서버 내부 이관 완료</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">정답보호 {migrated.hiddenExerciseCount}개</span>
        </div>
      </header>

      <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <ShieldCheck className="mt-1 shrink-0" />
        <p>연습문제·정답 토글은 원천에 보존했지만, 정답 검수와 제출 후 공개 구조가 완료되기 전에는 본문에서 제외합니다.</p>
      </aside>

      <article className="card mt-6 p-6 sm:p-9">
        <MarkdownContent content={migrated.content} />
      </article>
    </main>
  );
}
