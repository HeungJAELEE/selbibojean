import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Code2,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";
import {
  getBdaQbank,
  getBdaQbankConceptDetail,
} from "@/lib/content/bda-qbank-repository";

export function generateStaticParams() {
  return getBdaQbank().concepts.map((concept) => ({ conceptId: concept.id }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}): Promise<Metadata> {
  return params.then(({ conceptId }) => {
    const detail = getBdaQbankConceptDetail(conceptId);
    return {
      title: detail?.concept.name ?? "개념 학습",
      description: detail
        ? `${detail.concept.name}의 출제 포인트, 판단 순서, 비교표, 실기 적용을 학습합니다.`
        : undefined,
    };
  });
}

export default async function BdaConceptDetailPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const detail = getBdaQbankConceptDetail(conceptId);
  if (!detail || !detail.enrichment) notFound();

  const { concept, enrichment, relatedItems, relatedTopics, relatedPracticalTasks } = detail;

  return (
    <main className="page-wrap pb-16 pt-8">
      <Link
        href="/bda/concepts"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] hover:underline"
      >
        <ArrowLeft size={16} /> 개념 지도로
      </Link>

      <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_36px_rgb(18_38_58_/_0.08)]">
        <header className="bg-[#173957] p-7 text-white sm:p-10">
          <p className="text-xs font-black tracking-[.16em] text-teal-200">
            {concept.id} · {concept.subjectNo}과목 · {concept.majorArea}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">{concept.name}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-100">{enrichment.overview}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/10 px-3 py-1.5">연결 학습 항목 {relatedItems.length}개</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">출제 주제 {relatedTopics.length}개</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">검증 상태 {concept.validationStatus}</span>
          </div>
        </header>

        <div className="grid gap-7 p-6 sm:p-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-9">
            <section>
              <SectionTitle icon={BookOpenCheck} eyebrow="Core concept" title="개념의 범위와 핵심 규칙" />
              <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">{concept.definition}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Callout label="핵심 규칙" text={concept.formulaOrRule} tone="teal" />
                <Callout label="자주 틀리는 지점" text={concept.commonTraps} tone="amber" />
              </div>
            </section>

            <section>
              <SectionTitle icon={Lightbulb} eyebrow="Decision order" title="문제에서 판단하는 순서" />
              <ol className="mt-4 grid gap-3">
                {enrichment.decisionSteps.map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#0f766e] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm font-medium leading-7 text-slate-700">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <SectionTitle icon={ShieldCheck} eyebrow="Compare" title="헷갈리는 개념 바로 구분" />
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[620px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black text-slate-600">
                    <tr><th className="px-4 py-3">구분</th><th className="px-4 py-3">핵심</th><th className="px-4 py-3">판별 포인트</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrichment.comparisonRows.map((row) => (
                      <tr key={row.label} className="align-top">
                        <th className="px-4 py-4 font-black text-[#142f4b]">{row.label}</th>
                        <td className="px-4 py-4 leading-6 text-slate-700">{row.core}</td>
                        <td className="px-4 py-4 leading-6 text-slate-700">{row.distinction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <SectionTitle icon={Code2} eyebrow="Practical link" title="실기·코드에 적용하는 방법" />
              <ul className="mt-4 grid gap-3">
                {enrichment.practicalSteps.map((step) => (
                  <li key={step} className="flex gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm leading-7 text-teal-950">
                    <CheckCircle2 size={17} className="mt-1 shrink-0 text-teal-700" />
                    {step}
                  </li>
                ))}
              </ul>
              {relatedPracticalTasks.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedPracticalTasks.map((task) => (
                    <Link key={task.id} href={`/bda/practical/bank/${task.id}`} className="rounded-full bg-[#173957] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0f766e]">
                      {task.id} · {task.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 p-5">
              <p className="eyebrow">Exam coverage</p>
              <h2 className="mt-2 text-xl font-black text-[#142f4b]">이 개념에서 다루는 출제 포인트</h2>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
                {enrichment.examFocus.map((focus) => <li key={focus} className="rounded-xl bg-slate-50 px-3 py-2">{focus}</li>)}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <p className="eyebrow">Linked topics</p>
              <h2 className="mt-2 text-xl font-black text-[#142f4b]">문제은행에서 확인된 모든 주제</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">학습용 재구성 항목의 주제 요약입니다. 원문·선지는 표시하지 않습니다.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedTopics.length ? relatedTopics.map((topic) => <span key={topic} className="rounded-full bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-900">{topic}</span>) : <p className="text-sm text-slate-500">필기 연결 항목은 없으며 실기 과제로 보강합니다.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="eyebrow text-amber-700">Final check</p>
              <h2 className="mt-2 text-xl font-black text-amber-950">시험 전 마지막 점검</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-amber-950">
                {enrichment.finalChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0" />{item}</li>)}
              </ul>
            </section>

            {concept.practicalLink ? (
              <Link href="/bda/practical" className="flex items-center justify-between rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-[#142f4b] hover:bg-slate-50">
                <span>코드 학습으로 연결</span><ExternalLink size={16} />
              </Link>
            ) : null}
          </aside>
        </div>

        <section className="border-t border-slate-200 p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Learning bank</p><h2 className="mt-2 text-2xl font-black text-[#142f4b]">연결 학습 재구성 {relatedItems.length}개</h2></div>
            <Link href={`/bda/bank?concept=${concept.id}`} className="inline-flex items-center gap-2 text-sm font-black text-[#0f766e] hover:underline">이 개념으로 문제 풀기 <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {relatedItems.map((item) => (
              <Link key={item.id} href={`/bda/bank/${item.id}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-300 hover:bg-teal-50">
                <p className="text-xs font-black text-slate-500">{item.id} · {item.platform} · {item.technicalValidationStatus}</p>
                <h3 className="mt-1 font-black text-[#142f4b]">{item.topicSummary}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.paraphrasedLearningPrompt}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: typeof BookOpenCheck;
  eyebrow: string;
  title: string;
}) {
  return <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#0f766e]"><Icon size={16} /> {eyebrow}</p><h2 className="mt-2 text-2xl font-black text-[#142f4b]">{title}</h2></div>;
}

function Callout({
  label,
  text,
  tone,
}: {
  label: string;
  text?: string;
  tone: "teal" | "amber";
}) {
  const className = tone === "teal" ? "border-teal-100 bg-teal-50 text-teal-950" : "border-amber-100 bg-amber-50 text-amber-950";
  return <div className={`rounded-2xl border p-4 text-sm leading-6 ${className}`}><strong>{label}</strong><p className="mt-1 whitespace-pre-wrap">{text ?? "추가 확인 필요"}</p></div>;
}
