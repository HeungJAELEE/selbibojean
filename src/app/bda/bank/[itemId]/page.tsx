import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getBdaQbank,
  getBdaQbankLearningItem,
} from "@/lib/content/bda-qbank-repository";

export function generateStaticParams() {
  return getBdaQbank().learningItems.map((item) => ({ itemId: item.id }));
}

export function generateMetadata({ params }: { params: Promise<{ itemId: string }> }): Promise<Metadata> {
  return params.then(({ itemId }) => {
    const item = getBdaQbankLearningItem(itemId);
    return { title: item?.topicSummary ?? "학습 항목" };
  });
}

export default async function BdaBankItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = getBdaQbankLearningItem(itemId);
  if (!item) notFound();
  const qbank = getBdaQbank();
  const concepts = item.conceptIds
    .map((id) => qbank.concepts.find((concept) => concept.id === id))
    .filter(Boolean);

  return (
    <main className="page-wrap pb-16 pt-8">
      <Link href="/bda/bank" className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] hover:underline">
        <ArrowLeft size={16} /> 학습 문제은행으로
      </Link>

      <article className="mt-5 card overflow-hidden">
        <header className="bg-[#173957] p-7 text-white sm:p-9">
          <p className="text-xs font-black tracking-[.15em] text-teal-200">
            {item.subjectNo}과목 · {item.subjectName} · {item.platform}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{item.topicSummary}</h1>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/10 px-3 py-1">{item.sourceSetType}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">검토: {item.technicalValidationStatus}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">근거등급: {item.evidenceGrade}</span>
          </div>
        </header>
        <div className="grid gap-6 p-6 sm:p-9 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <section>
              <p className="eyebrow">Learning prompt</p>
              <h2 className="mt-2 text-xl font-black text-[#142f4b]">학습용 재구성 질문</h2>
              <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-base leading-8 text-slate-800">
                {item.paraphrasedLearningPrompt}
              </p>
            </section>
            <section className="mt-7">
              <p className="eyebrow">Independent review</p>
              <h2 className="mt-2 text-xl font-black text-[#142f4b]">정답 핵심과 독립 해설</h2>
              <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-sm leading-7 text-teal-950">
                <p><strong>정답 핵심</strong> · {item.answerCore ?? "미확정"}</p>
                {item.independentExplanation ? <p className="mt-3"><strong>독립 해설</strong> · {item.independentExplanation}</p> : null}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                이 표기는 원 출처의 공식 정답을 뜻하지 않으며, 현재 검수 상태의 학습용 핵심입니다.
              </p>
            </section>
          </div>
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-black text-[#142f4b]">연결 개념</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {concepts.map((concept) => (
                  <Link key={concept!.id} href={`/bda/concepts#${concept!.id}`} className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 hover:underline">
                    {concept!.id} · {concept!.name}
                  </Link>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 p-5 text-sm leading-6">
              <h2 className="font-black text-[#142f4b]">검수 메타데이터</h2>
              <dl className="mt-3 grid gap-2 text-slate-600">
                <div><dt className="font-bold text-slate-800">문제 유형</dt><dd>{item.questionMode}</dd></div>
                <div><dt className="font-bold text-slate-800">재구성</dt><dd>{item.reconstructionStatus}</dd></div>
                <div><dt className="font-bold text-slate-800">검수 상태</dt><dd>{item.reviewStatus} · {item.approvalStatus}</dd></div>
                {item.validationNote ? <div><dt className="font-bold text-slate-800">검수 메모</dt><dd>{item.validationNote}</dd></div> : null}
              </dl>
            </section>
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-[#142f4b] hover:bg-slate-50">
                출처 위치 열기 <ExternalLink size={15} />
              </a>
            ) : null}
            <p className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900"><ShieldCheck size={15} className="shrink-0" />원문·선지를 저장하지 않은 재구성 항목입니다.</p>
          </aside>
        </div>
      </article>
    </main>
  );
}
