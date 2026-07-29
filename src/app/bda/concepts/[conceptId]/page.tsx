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
import { BdaLearningItemPractice } from "@/components/bda-learning-item-practice";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import {
  bdaNotionSourcePages,
  getBdaNotionModulesForConcept,
} from "@/data/source/bda-notion-library";
import {
  getBdaQbank,
  getBdaQbankConceptDetail,
  toPublicBdaQbankLearningItem,
} from "@/lib/content/bda-qbank-repository";
import { getBdaLearningItemPublicationDecision } from "@/lib/content/bda-learning-practice";

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
  if (!detail || !detail.enrichment || !detail.integratedTheory) notFound();

  const {
    concept,
    enrichment,
    integratedTheory,
    relatedItems,
    gradeableRelatedItems,
    heldRelatedItems,
    relatedTopics,
    relatedPracticalTasks,
  } = detail;
  const notionModules = getBdaNotionModulesForConcept(conceptId);
  const sourcePage = integratedTheory.sourcePageId
    ? bdaNotionSourcePages.find((page) => page.id === integratedTheory.sourcePageId)
    : undefined;
  const codeLabs = bdaCodeLabs.filter(
    (lab) =>
      integratedTheory.codeLabIds.includes(lab.id) ||
      lab.conceptIds.includes(conceptId),
  );
  const publicRelatedItems = gradeableRelatedItems.map(
    toPublicBdaQbankLearningItem,
  );

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
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              연결 학습 항목 {relatedItems.length}개
            </span>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1.5">
              채점 가능 {gradeableRelatedItems.length}개
            </span>
            {heldRelatedItems.length ? (
              <span className="rounded-full bg-amber-300/20 px-3 py-1.5">
                재검수 HOLD {heldRelatedItems.length}개
              </span>
            ) : null}
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

            <section className="overflow-hidden rounded-3xl border border-teal-200 bg-[#f0fbf8]">
              <div className="border-b border-teal-200 bg-teal-100/70 px-5 py-4 sm:px-6">
                <p className="text-xs font-black uppercase tracking-[.14em] text-teal-800">Integrated theory</p>
                <h2 className="mt-1 text-2xl font-black text-[#143b43]">통합 개념서 기반 심화 학습</h2>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-base leading-8 text-slate-800">{integratedTheory.learningSummary}</p>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <article className="rounded-2xl border border-teal-100 bg-white p-4">
                    <h3 className="font-black text-teal-950">반드시 연결할 규칙</h3>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                      {integratedTheory.mustKnow.map((rule) => (
                        <li key={rule} className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0 text-teal-700" />{rule}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="font-black text-amber-950">문제에서 걸러낼 함정</h3>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-950">
                      {integratedTheory.examTraps.map((trap) => (
                        <li key={trap} className="flex gap-2"><ShieldCheck size={16} className="mt-1 shrink-0 text-amber-700" />{trap}</li>
                      ))}
                    </ul>
                  </article>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                  {integratedTheory.sourceSections.map((section) => (
                    <span key={section} className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-teal-950">{section}</span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {sourcePage ? (
                    <Link href={`/bda/textbook/${sourcePage.subjectId}`} className="inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 py-2 text-sm font-black text-teal-900 hover:bg-teal-50">
                      통합 개념서에서 전체 이론 <ExternalLink size={15} />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-black text-blue-900">실기 확장: 유형별 코드·검수 보강</span>
                  )}
                  {integratedTheory.practiceQuestionIds.map((questionId) => (
                    <Link key={questionId} href={`/bda/written/practice/${questionId}`} className="inline-flex items-center gap-2 rounded-xl bg-[#173957] px-3 py-2 text-sm font-black text-white hover:bg-[#0f766e]">
                      확인문제 {questionId} <ArrowRight size={15} />
                    </Link>
                  ))}
                  {codeLabs.map((lab) => (
                    <Link key={lab.id} href={`/bda/practical/${lab.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-[#173957] hover:bg-slate-50">
                      <Code2 size={15} /> 코드 레슨: {lab.title}
                    </Link>
                  ))}
                </div>
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

            {notionModules.length ? (
              <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <p className="eyebrow text-teal-700">Source trail</p>
                <h2 className="mt-2 text-xl font-black text-teal-950">추가 원천·연결 모듈</h2>
                <p className="mt-2 text-xs leading-5 text-teal-900">핵심 내용은 본문에 통합했습니다. 여기서는 원천을 더 깊게 확인할 때만 이어 보세요.</p>
                <div className="mt-4 grid gap-2">
                  {notionModules.map((module) => (
                    <Link key={module.id} href={`/bda/textbook/${module.subjectId}`} className="rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm font-black text-teal-950 hover:bg-teal-100">
                      {module.title}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 p-5">
              <p className="eyebrow">Linked topics</p>
              <h2 className="mt-2 text-xl font-black text-[#142f4b]">문제은행에서 확인된 모든 주제</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">학습용 재구성 항목의 주제 요약이며, 아래 연결 문제에서 질문과 보기 4개를 함께 제공합니다.</p>
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
          <div>
            <p className="eyebrow">Learning bank</p>
            <h2 className="mt-2 text-2xl font-black text-[#142f4b]">
              검수 통과 연결 문제 {publicRelatedItems.length}개
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              이동하지 않고 각 문제를 펼쳐 질문과 보기 4개를 확인한 뒤 바로
              제출할 수 있습니다.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {publicRelatedItems.map((item, index) => (
              <details
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white"
              >
                <summary className="cursor-pointer list-none p-4 transition hover:bg-teal-50 [&::-webkit-details-marker]:hidden sm:p-5">
                  <p className="text-xs font-black text-[#0f766e]">
                    문제 {index + 1} · {item.id} · {item.platform} ·{" "}
                    {item.technicalValidationStatus}
                  </p>
                  <h3 className="mt-1 font-black leading-7 text-[#142f4b]">
                    {item.questionStem}
                  </h3>
                </summary>
                <div className="border-t border-slate-200 p-4 sm:p-5">
                  <BdaLearningItemPractice item={item} />
                </div>
              </details>
            ))}
          </div>
          {heldRelatedItems.length ? (
            <details className="mt-6 rounded-2xl border border-amber-200 bg-amber-50">
              <summary className="cursor-pointer list-none p-4 font-black text-amber-950 [&::-webkit-details-marker]:hidden sm:p-5">
                재검수 대기 항목 {heldRelatedItems.length}개 확인
                <span className="mt-1 block text-xs font-medium leading-5 text-amber-800">
                  출처·주제 연결은 보존하지만 정답 검수가 끝나기 전에는
                  선택지와 채점 기능을 제공하지 않습니다.
                </span>
              </summary>
              <div className="grid gap-2 border-t border-amber-200 p-4 sm:p-5">
                {heldRelatedItems.map((item) => {
                  const decision =
                    getBdaLearningItemPublicationDecision(item);
                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-amber-200 bg-white p-4"
                    >
                      <p className="text-xs font-black text-amber-800">
                        {item.id} · {item.platform} ·{" "}
                        {item.technicalValidationStatus ?? "미검수"}
                      </p>
                      <h3 className="mt-1 font-black text-[#142f4b]">
                        {item.topicSummary}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {decision.reason}
                      </p>
                    </article>
                  );
                })}
              </div>
            </details>
          ) : null}
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
