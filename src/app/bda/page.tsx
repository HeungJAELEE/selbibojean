import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Code2,
  Database,
  ShieldCheck,
} from "lucide-react";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import { bdaNotionModules } from "@/data/source/bda-notion-library";
import { getBdaContent } from "@/lib/content/bda-repository";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export default function BdaHomePage() {
  const content = getBdaContent();
  const qbank = getBdaQbank();

  return (
    <main className="pb-16">
      <section className="relative overflow-hidden bg-[#102d47] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#5eead4_0,transparent_28%),radial-gradient(circle_at_80%_10%,#60a5fa_0,transparent_25%)]" />
        <div className="page-wrap relative grid gap-10 py-14 lg:grid-cols-[1.3fr_.7fr] lg:items-center lg:py-20">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-teal-100">개인 학습용</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">v0.4 문제은행 이관</span>
            </div>
            <p className="mt-7 text-sm font-black uppercase tracking-[.22em] text-teal-200">Big Data Analysis Engineer</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              개념을 이해하고,
              <br />
              근거와 검수 상태까지 확인합니다.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              이론·학습 문제·실기 코드·출처 메타데이터를 한 흐름으로 연결했습니다. 회차 복원자료는 공식 문제나
              공식 정답으로 표시하지 않고, 출처와 신뢰등급을 보존한 학습용 재구성으로 관리합니다.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              <Cta href="/bda/concepts" label="40개 개념 지도" primary />
              <Cta href="/bda/notion" label={`Notion 이론 ${bdaNotionModules.length}개`} />
              <Cta href="/bda/bank" label="183개 학습 문제은행" />
              <Cta href="/bda/practical/bank" label="58개 실기 과제" />
              <Cta href="/bda/sources" label="출처·검수 현황" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat value={qbank.stats.conceptCount} label="정규화 개념" />
            <Stat value={qbank.stats.learningItemCount} label="학습 재구성" />
            <Stat value={qbank.stats.sourceInventoryCount} label="출처 인벤토리" />
            <Stat value={qbank.stats.practicalTaskCount} label="실기 과제" />
          </div>
        </div>
      </section>

      <section className="page-wrap py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Theory and practice</p>
            <h2 className="mt-2 text-3xl font-black text-[#142f4b]">필기 4과목 학습 흐름</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            기존의 상세 이론 20개 레슨은 유지하고, v0.4의 C001~C040 개념 지도와 연결해 보강했습니다.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.subjects.map((subject) => {
            const lessonCount = content.lessons.filter((item) => item.subjectId === subject.id).length;
            const conceptCount = qbank.concepts.filter((item) => item.subjectNo === subject.order).length;
            return (
              <Link key={subject.id} href={`/bda/concepts#subject-${subject.order}`} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-xl text-xl font-black text-white" style={{ backgroundColor: subject.accent }}>{subject.order}</span>
                  <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
                </div>
                <p className="mt-5 text-xs font-black text-slate-500">제{subject.order}과목</p>
                <h3 className="mt-1 text-xl font-black text-[#142f4b]">{subject.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{subject.description}</p>
                <div className="mt-5 flex gap-2 text-xs font-bold">
                  <span className="rounded-full bg-slate-100 px-3 py-1">상세 레슨 {lessonCount}</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">개념 {conceptCount}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-wrap">
        <div className="rounded-3xl bg-[#edf8f5] p-6 sm:p-9">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature icon={BookMarked} title="개념과 문항 연결" text="C001~C040 개념에서 연결된 학습 재구성 항목으로 이동합니다." />
            <Feature icon={ShieldCheck} title="검수 상태 공개" text="개념 일치·표현 검토·법령 최신성 등 현재 상태를 가리지 않습니다." />
            <Feature icon={Database} title="출처 위치 보존" text="수집 대장과 출처 URL을 보존하되 제3자 원문·선지는 복제하지 않습니다." />
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <p><strong>현재 이관 범위:</strong> v0.4의 587개 출처 인벤토리, 183개 학습 재구성, 40개 개념, 58개 실기 과제, 68개 우선 검수 항목입니다. 나머지 원시 인벤토리의 주제·정답 검증은 완료로 표기하지 않습니다.</p>
          </div>
        </div>
      </section>

      <section className="page-wrap mt-10">
        <Link href="/bda/practical" className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
          <span className="flex items-center gap-3"><Code2 className="text-[#0f766e]" /><span><strong className="block text-[#142f4b]">기초 Python 코드 실습</strong><span className="text-sm text-slate-600">별도 검증 코드 레슨 {bdaCodeLabs.length}개도 계속 이용할 수 있습니다.</span></span></span>
          <ArrowRight className="text-slate-400" />
        </Link>
      </section>
    </main>
  );
}

function Cta({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return <Link href={href} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black ${primary ? "bg-teal-300 text-[#102d47]" : "border border-white/30 bg-white/10 text-white"}`}>{label} <ArrowRight size={16} /></Link>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><strong className="text-3xl font-black text-teal-200">{value}</strong><span className="mt-2 block text-sm text-slate-200">{label}</span></div>;
}

function Feature({ icon: Icon, title, text }: { icon: typeof BookMarked; title: string; text: string }) {
  return <div className="rounded-2xl bg-white p-5"><Icon className="text-[#0f766e]" /><h3 className="mt-4 font-black text-[#142f4b]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}
