import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Braces, CheckCircle2, Code2, Database, ShieldCheck } from "lucide-react";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "실기 코드 학습",
  description: "실기 과제은행, 데이터 누수 점검, Python 코드 레슨을 함께 봅니다.",
};

export default function BdaPracticalPage() {
  const qbank = getBdaQbank();
  return (
    <main className="page-wrap pb-16 pt-10">
      <section className="overflow-hidden rounded-3xl bg-[#102d47] p-7 text-white sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-teal-200">Practical Python</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">실기 코드는 외우기보다<br /><span className="text-teal-200">검증 절차로 익힙니다.</span></h1>
            <p className="mt-5 max-w-2xl leading-8 text-slate-200">데이터 확인부터 전처리, 모델 평가, 제출 파일 검증까지. v0.4의 과제 메타데이터와 별도 Python 레슨을 연결했습니다.</p>
            <Link href="/bda/practical/bank" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3.5 text-sm font-black text-[#102d47]">58개 실기 과제은행 <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Database />} value={String(qbank.stats.practicalTaskCount)} label="실기 과제" />
            <Stat icon={<Braces />} value={String(qbank.codeSnippets.length)} label="자체 제작 코드 스니펫" />
            <Stat icon={<Code2 />} value={String(bdaCodeLabs.length)} label="코드 레슨" />
            <Stat icon={<ShieldCheck />} value="3" label="누수·개인정보 점검" />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <strong>학습용 코드 안내:</strong> 여기의 과제와 스니펫은 공식 채점기준이나 특정 회차의 공식 답안이 아닙니다. 파일명, 열 이름, 출력 조건, 패키지 버전은 각 과제의 검수 메타데이터를 먼저 확인하세요.
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Code curriculum</p><h2 className="mt-2 text-3xl font-black text-[#142f4b]">기초 Python 코드 레슨</h2></div><Link href="/bda/practical/bank" className="text-sm font-black text-[#0f766e] hover:underline">과제은행 보기 →</Link></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {bdaCodeLabs.map((lab) => (
            <Link key={lab.id} href={`/bda/practical/${lab.id}`} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-[#173957] font-black text-white">{lab.order}</span><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" /></div>
              <h3 className="mt-5 text-xl font-black text-[#142f4b]">{lab.title}</h3><p className="mt-3 leading-7 text-slate-600">{lab.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">{lab.concepts.slice(0, 4).map((concept) => <span key={concept} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{concept}</span>)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-[#edf8f5] p-6 sm:p-8"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-700" /><h2 className="text-xl font-black text-[#142f4b]">공통 검증 순서</h2></div><ol className="mt-5 grid gap-3 sm:grid-cols-2">{["shape·열 이름·결측치를 먼저 확인합니다.", "목표 변수와 식별자·누수 가능 열을 분리합니다.", "전처리기는 학습 데이터에서만 fit 합니다.", "제출 파일의 행 수·열·index를 다시 읽어 검증합니다."].map((item, index) => <li key={item} className="flex gap-3 rounded-xl bg-white p-4"><span className="font-black text-[#0f766e]">{index + 1}</span><span className="text-sm font-bold leading-6 text-slate-700">{item}</span></li>)}</ol></section>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><span className="text-teal-200">{icon}</span><strong className="mt-5 block text-3xl font-black">{value}</strong><span className="mt-1 block text-xs text-slate-300">{label}</span></div>;
}
