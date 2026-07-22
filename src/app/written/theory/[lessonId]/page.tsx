import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck, RotateCcw } from "lucide-react";
import { getContent, getLesson } from "@/lib/content/repository";
import { getConceptGroup, getSubject } from "@/lib/domain/catalog";
import { isPublishableQuestion } from "@/lib/domain/practice";
import { MarkdownContent } from "@/components/markdown-content";

export default async function LessonPage({ params, searchParams }: { params: Promise<{ lessonId: string }>; searchParams: Promise<{ returnTo?: string }> }) {
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);
  const lesson = await getLesson(lessonId);
  if (!lesson || lesson.contentStatus !== "published") notFound();
  const content = await getContent();
  const subject = getSubject(lesson.subjectId); const group = getConceptGroup(lesson.conceptGroupId);
  const related = content.questions.filter((question)=>lesson.relatedQuestionIds.includes(question.id)&&isPublishableQuestion(question)).slice(0,8);
  return <div className="page-wrap grid gap-8 py-10 lg:grid-cols-[240px_1fr_260px]">
    <aside className="hidden h-fit lg:block"><Link href="/written/theory" className="flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/>이론 목차</Link><nav className="mt-7 border-l border-slate-200 pl-4" aria-label="레슨 내부 목차">{lesson.blocks.map((block)=><a key={block.id} href={`#${block.id}`} className="block py-2 text-sm text-slate-500 hover:text-[#16697a]">{block.title}</a>)}</nav></aside>
    <article className="card p-6 md:p-10"><p className="eyebrow">제{subject?.code}과목 · {group?.title}</p><h1 className="display mt-4 text-4xl font-bold md:text-5xl">{lesson.title}</h1><div className="mt-7 grid gap-3 rounded-2xl bg-[#eaf7f6] p-5">{lesson.summary.map((line,index)=><p key={line} className="flex gap-3 text-sm font-semibold leading-6"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#16697a] text-xs text-white">{index+1}</span>{line}</p>)}</div><div className="prose-learning">{lesson.blocks.filter((block)=>block.kind!=="summary").map((block)=><section key={block.id}><h2 id={block.id}>{block.title}</h2><MarkdownContent content={block.body}/></section>)}</div>{query.returnTo&&<Link href={query.returnTo} className="mt-10 flex items-center justify-center gap-2 rounded-xl bg-[#8f3f0a] px-5 py-4 font-extrabold text-white"><RotateCcw size={18}/>문제로 돌아가 정답 숨기고 재도전</Link>}</article>
    <aside className="card h-fit p-5"><div className="flex items-center gap-2"><BookOpenCheck className="text-[#16697a]" size={19}/><h2 className="font-extrabold">관련 공개 문제</h2></div><div className="mt-4 grid gap-2">{related.map((question)=><Link key={question.id} href={`/written/practice/${question.id}`} className="rounded-xl border border-slate-200 p-3 text-sm hover:border-[#16697a]"><span className="font-bold text-[#16697a]">{question.id}</span><span className="mt-1 line-clamp-2 block text-slate-600">{question.stem}</span></Link>)}{related.length===0&&<p className="text-sm text-slate-600">검수 완료된 관련 문제가 없습니다.</p>}</div></aside>
  </div>;
}
