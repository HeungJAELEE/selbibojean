import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import {
  bdaCodeLabs,
  getBdaCodeLab,
} from "@/data/source/bda-practical-content";

type Props = { params: Promise<{ labId: string }> };

export function generateStaticParams() {
  return bdaCodeLabs.map((lab) => ({ labId: lab.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { labId } = await params;
  const lab = getBdaCodeLab(labId);
  return { title: lab?.title ?? "실기 코드" };
}

export default async function BdaCodeLabPage({ params }: Props) {
  const { labId } = await params;
  const lab = getBdaCodeLab(labId);
  if (!lab) notFound();

  const index = bdaCodeLabs.findIndex((item) => item.id === lab.id);
  const previous = bdaCodeLabs[index - 1];
  const next = bdaCodeLabs[index + 1];

  return (
    <main className="page-wrap pb-16">
      <div className="py-8">
        <Link
          href="/bda/practical"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0f766e]"
        >
          <ArrowLeft size={16} /> 실기 코드 목차
        </Link>
      </div>

      <article className="mx-auto max-w-5xl">
        <header className="card overflow-hidden">
          <div className="h-2 bg-[#0f766e]" />
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf8f5] px-3 py-1 text-xs font-black text-[#0f766e]">
                Lab {lab.order}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {lab.category}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#142f4b] sm:text-4xl">
              {lab.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              {lab.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {lab.concepts.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-6 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-[#0f766e]" />
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-[#0f766e]">
                Practice task
              </p>
              <h2 className="mt-1 text-xl font-black text-[#142f4b]">
                연습 과제
              </h2>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-[#edf8f5] p-5 font-bold leading-8 text-[#142f4b]">
            {lab.task}
          </p>
        </section>

        <section className="mt-6 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ListChecks className="text-blue-700" />
            <h2 className="text-xl font-black text-[#142f4b]">
              코드를 작성하는 순서
            </h2>
          </div>
          <ol className="mt-6 grid gap-3">
            {lab.steps.map((step, stepIndex) => (
              <li
                key={step}
                className="flex items-start gap-4 rounded-xl bg-slate-50 p-4"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-black text-white">
                  {stepIndex + 1}
                </span>
                <span className="pt-0.5 leading-7 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1f33] shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
            <span className="flex items-center gap-2 font-black">
              <Code2 size={18} className="text-teal-300" /> Python
            </span>
            <span className="text-xs text-slate-400">검증 가능한 기본 패턴</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-slate-100 sm:p-7 sm:text-sm">
            <code>{lab.code}</code>
          </pre>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-700" />
              <h2 className="text-lg font-black text-[#142f4b]">결과 확인</h2>
            </div>
            <ul className="mt-5 grid gap-3">
              {lab.expected.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-amber-700" />
              <h2 className="text-lg font-black text-amber-950">
                시험 함정·누수 점검
              </h2>
            </div>
            <ul className="mt-5 grid gap-3">
              {lab.traps.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-amber-950">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-600" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="코드 랩 이동">
          {previous ? (
            <Link
              href={`/bda/practical/${previous.id}`}
              className="card flex items-center gap-3 p-4 font-bold text-slate-700"
            >
              <ArrowLeft size={17} />
              <span>
                <small className="block text-slate-400">이전 코드</small>
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/bda/practical/${next.id}`}
              className="card flex items-center justify-end gap-3 p-4 text-right font-bold text-slate-700"
            >
              <span>
                <small className="block text-slate-400">다음 코드</small>
                {next.title}
              </span>
              <ArrowRight size={17} />
            </Link>
          ) : null}
        </nav>
      </article>
    </main>
  );
}
