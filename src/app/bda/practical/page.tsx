import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  ShieldCheck,
} from "lucide-react";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";

export const metadata: Metadata = {
  title: "실기 코드 학습",
  description:
    "데이터 작업, 모델링, 통계 검정과 제출 검수를 Python 코드로 연습합니다.",
};

const categoryStyle = {
  "데이터 작업": "bg-teal-100 text-teal-800",
  모델링: "bg-blue-100 text-blue-800",
  "통계 검정": "bg-violet-100 text-violet-800",
  "제출·검수": "bg-amber-100 text-amber-900",
} as const;

export default function BdaPracticalPage() {
  return (
    <main className="page-wrap pb-16 pt-10">
      <section className="overflow-hidden rounded-3xl bg-[#102d47] p-7 text-white sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-teal-200">
              Practical Python
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              실기 코드는 암기보다
              <br />
              <span className="text-teal-200">검증 순서로 익힙니다.</span>
            </h1>
            <p className="mt-5 max-w-2xl leading-8 text-slate-200">
              데이터 확인부터 전처리, 모델 평가, 통계 검정과 제출 파일
              검수까지 재사용 가능한 기본 패턴을 단계별로 정리했습니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Database />} value="2" label="데이터 작업" />
            <Stat icon={<Braces />} value="2" label="모델링" />
            <Stat icon={<Code2 />} value="1" label="통계 검정" />
            <Stat icon={<ShieldCheck />} value="1" label="제출·검수" />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <strong>학습용 코드 안내:</strong> 아래 코드는 특정 회차 공식 정답이나
        채점기준이 아니라, 공개적으로 검증 가능한 pandas·scikit-learn·SciPy
        사용법을 바탕으로 만든 실기 유형 연습 코드입니다. 실제 문항에서는
        파일명, 열 이름, 평가척도와 출력 조건을 먼저 확인하세요.
      </section>

      <section className="mt-10">
        <div>
          <p className="eyebrow">Code curriculum</p>
          <h2 className="mt-2 text-3xl font-black text-[#142f4b]">
            실기 코드 학습 순서
          </h2>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {bdaCodeLabs.map((lab) => (
            <Link
              key={lab.id}
              href={`/bda/practical/${lab.id}`}
              className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#173957] font-black text-white">
                    {lab.order}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${categoryStyle[lab.category]}`}
                  >
                    {lab.category}
                  </span>
                </div>
                <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
              </div>
              <h3 className="mt-5 text-xl font-black text-[#142f4b]">
                {lab.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-600">{lab.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {lab.concepts.slice(0, 4).map((concept) => (
                  <span
                    key={concept}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-[#edf8f5] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-700" />
          <h2 className="text-xl font-black text-[#142f4b]">
            모든 코드에서 지킬 공통 순서
          </h2>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "shape·열 이름·자료형·결측을 먼저 확인합니다.",
            "목표변수와 식별자, 누수 가능 열을 입력에서 분리합니다.",
            "전처리기는 학습 데이터에서만 fit합니다.",
            "출력 파일의 열 순서·행 수·index를 다시 읽어 검증합니다.",
          ].map((item, index) => (
            <li key={item} className="flex gap-3 rounded-xl bg-white p-4">
              <span className="font-black text-[#0f766e]">{index + 1}</span>
              <span className="text-sm font-bold leading-6 text-slate-700">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <span className="text-teal-200">{icon}</span>
      <strong className="mt-5 block text-3xl font-black">{value}</strong>
      <span className="mt-1 block text-xs text-slate-300">{label}</span>
    </div>
  );
}
