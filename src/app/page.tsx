import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Gauge, Layers3, RotateCcw, Sparkles } from "lucide-react";
import { getContent } from "@/lib/content/repository";

export default async function HomePage() {
  const content = await getContent();
  const publicQuestions = content.questions.filter((question) => question.contentStatus === "published").length;
  const publicLessons = content.lessons.filter((lesson) => lesson.contentStatus === "published").length;
  return (
    <>
      <section className="soft-grid bg-[#173957] py-18 text-white md:py-24">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div><p className="eyebrow !text-[#8dd5ce]">설비보전기사 통합 학습</p><h1 className="display mt-5 text-5xl font-bold leading-[1.06] md:text-7xl">문제를 맞히는 데서<br /><span className="text-[#8dd5ce]">이해하는 데까지.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">이론, 문제, 오답 원인과 복습 시점을 하나의 흐름으로 연결했습니다. 틀린 문제는 관련 개념의 정확한 블록으로 돌아가 다시 이해할 수 있습니다.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/written/practice/random" className="flex items-center gap-2 rounded-xl bg-[#8f3f0a] px-6 py-4 font-extrabold text-white">랜덤 20문제 시작 <ArrowRight size={18} /></Link><Link href="/written/theory" className="rounded-xl border border-white/30 bg-white/10 px-6 py-4 font-extrabold text-white">이론 목차 보기</Link></div></div>
          <div className="grid grid-cols-2 gap-4"><Stat value={content.report.rows.canonicalQuestions.toLocaleString()} label="대표 문제" icon={<ClipboardCheck />} /><Stat value={content.report.uniqueConcepts.toLocaleString()} label="원문 개념 별칭" icon={<Layers3 />} /><Stat value="44" label="세부항목군" icon={<Gauge />} /><Stat value={publicQuestions.toLocaleString()} label="검수 완료 공개" icon={<Sparkles />} /></div>
        </div>
      </section>
      <section className="page-wrap py-16">
        <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">오늘의 학습</p><h2 className="display mt-3 text-3xl font-bold md:text-4xl">짧게 시작하고, 정확히 복습하세요</h2></div><p className="hidden text-sm text-slate-500 md:block">공개 이론 {publicLessons}개 · 공개 문제 {publicQuestions}개</p></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3"><ActionCard href="/written/theory" icon={<BookOpen />} title="필기 이론" text="44개 세부항목군과 정규 개념 레슨을 순서대로 학습합니다." action="목차 열기" /><ActionCard href="/written/practice/random" icon={<Sparkles />} title="랜덤 문제" text="과목·세부항목군·오답·복습 범위를 골라 중복 없이 풉니다." action="문제 설정" /><ActionCard href="/written/review" icon={<RotateCcw />} title="오늘의 복습" text="오답과 자기평가를 기준으로 지금 복습할 문제를 모읍니다." action="복습 확인" /></div>
      </section>
      <section className="page-wrap pb-8"><div className="card grid overflow-hidden lg:grid-cols-[.85fr_1.15fr]"><div className="bg-[#eaf7f6] p-8 md:p-12"><p className="eyebrow">오답 이해 루프</p><h2 className="display mt-4 text-3xl font-bold">틀린 이유를 알고<br />같은 문제로 돌아옵니다.</h2><p className="mt-5 leading-7 text-slate-600">선택지가 그럴듯했던 이유, 틀린 조건, 핵심 판단 규칙을 확인한 다음 연결된 이론 블록을 읽고 정답을 숨긴 상태로 재도전합니다.</p></div><ol className="grid gap-0 bg-white p-6 md:grid-cols-3 md:p-10">{[["01","채점","선택지별 근거 확인"],["02","이론 이동","정의·공식·함정 앵커"],["03","재도전","최초 시도와 별도 기록"]].map(([number,title,text]) => <li key={number} className="border-b border-slate-200 p-5 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><span className="text-sm font-black text-[#8f3f0a]">{number}</span><h3 className="mt-4 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></li>)}</ol></div></section>
    </>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur"><div className="text-[#8dd5ce]">{icon}</div><p className="mt-6 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-slate-300">{label}</p></div>; }
function ActionCard({ href, icon, title, text, action }: { href: string; icon: React.ReactNode; title: string; text: string; action: string }) { return <Link href={href} className="card group p-7 transition hover:-translate-y-1 hover:border-[#16697a]"><span className="grid size-12 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">{icon}</span><h3 className="mt-7 text-xl font-extrabold">{title}</h3><p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">{text}</p><span className="mt-6 flex items-center gap-2 text-sm font-extrabold text-[#16697a]">{action}<ArrowRight size={16} className="transition group-hover:translate-x-1" /></span></Link>; }
