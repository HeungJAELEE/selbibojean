import type { Metadata } from "next";
import { BrainCircuit, ShieldAlert } from "lucide-react";
import { BdaQuestionBank } from "@/components/bda-question-bank";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "학습 문제은행",
  description: "v0.4의 학습 재구성 183건을 개념·과목·출처·검수 상태로 탐색합니다.",
};

export default async function BdaBankPage({
  searchParams,
}: {
  searchParams: Promise<{ concept?: string }>;
}) {
  const qbank = getBdaQbank();
  const { concept } = await searchParams;
  const initialConceptId = qbank.concepts.some((item) => item.id === concept)
    ? concept
    : undefined;

  return (
    <main className="page-wrap pb-16">
      <header className="py-10 sm:py-14">
        <p className="eyebrow">Paraphrased learning bank</p>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-black text-[#142f4b]">
          <BrainCircuit className="text-[#0f766e]" /> 학습 문제은행
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          v0.4에서 상세 확인된 183개 항목입니다. 원문·선지를 복제하지 않고, 출처를 유지한 학습용 질문과
          독립 해설을 분리해 관리합니다.
        </p>
      </header>

      <aside className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <ShieldAlert className="mt-0.5 shrink-0 text-amber-700" />
        <p>
          <strong>표시 원칙:</strong> 이 목록은 공식 기출 원문·공식 정답이 아닙니다. `source_type`,
          `evidence_grade`, 기술 검토 상태를 각 항목에 유지하며, 미검수·초안 항목을 확정 답으로 표시하지 않습니다.
        </p>
      </aside>

      <section className="mt-8">
        <BdaQuestionBank
          items={qbank.learningItems}
          concepts={qbank.concepts}
          initialConceptId={initialConceptId}
        />
      </section>
    </main>
  );
}
