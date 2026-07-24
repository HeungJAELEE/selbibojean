import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getBdaQbank,
  getBdaQbankPracticalTask,
} from "@/lib/content/bda-qbank-repository";

export function generateStaticParams() {
  return getBdaQbank().practicalTasks.map((task) => ({ taskId: task.id }));
}

export function generateMetadata({ params }: { params: Promise<{ taskId: string }> }): Promise<Metadata> {
  return params.then(({ taskId }) => ({ title: getBdaQbankPracticalTask(taskId)?.title ?? "실기 과제" }));
}

export default async function BdaPracticalTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = getBdaQbankPracticalTask(taskId);
  if (!task) notFound();
  const qbank = getBdaQbank();
  const metadata = qbank.practicalMetadata.find((item) => item.taskId === task.id);
  const snippets = qbank.codeSnippets.filter((snippet) => snippet.linkedTaskIds.includes(task.id));
  const concepts = task.conceptIds.map((id) => qbank.concepts.find((concept) => concept.id === id)).filter(Boolean);

  return (
    <main className="page-wrap pb-16 pt-8">
      <Link href="/bda/practical/bank" className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] hover:underline"><ArrowLeft size={16} /> 실기 과제은행으로</Link>
      <article className="mt-5 card overflow-hidden">
        <header className="bg-[#173957] p-7 text-white sm:p-9"><p className="text-xs font-black tracking-[.15em] text-teal-200">{task.id} · {task.practicalType} · 근거등급 {task.evidenceGrade}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{task.title}</h1><div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/10 px-3 py-1">{task.sourceType}</span><span className="rounded-full bg-white/10 px-3 py-1">검수: {task.reviewStatus}</span><span className="rounded-full bg-white/10 px-3 py-1">답안: {task.answerStatus}</span></div></header>
        <div className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <section><p className="eyebrow">Task summary</p><h2 className="mt-2 text-xl font-black text-[#142f4b]">학습용 과제 요약</h2><p className="mt-4 rounded-2xl bg-slate-50 p-5 leading-8 text-slate-800">{task.promptSummary}</p></section>
            <section className="mt-7"><p className="eyebrow">Expected workflow</p><h2 className="mt-2 text-xl font-black text-[#142f4b]">풀이·코드 점검</h2><div className="mt-4 grid gap-3"><Info title="핵심 단계" text={task.keySolutionSteps} /><Info title="필수 코드 점검" text={task.requiredCodeChecks} /><Info title="데이터 누수 점검" text={task.dataLeakageChecks} tone="amber" /><Info title="개인정보 점검" text={task.privacyChecks} tone="amber" /></div></section>
            {snippets.length ? <section className="mt-7"><p className="eyebrow">Self-authored code</p><h2 className="mt-2 text-xl font-black text-[#142f4b]">연결 코드 스니펫</h2><div className="mt-4 grid gap-4">{snippets.map((snippet) => <article key={snippet.id} className="overflow-hidden rounded-2xl border border-slate-200"><header className="flex items-center justify-between bg-slate-50 px-4 py-3 text-sm"><strong className="text-[#142f4b]">{snippet.purpose}</strong><span className="font-mono text-xs text-slate-500">{snippet.id} · {snippet.validated}</span></header><pre className="overflow-x-auto bg-[#102d47] p-4 text-xs leading-6 text-teal-100"><code>{snippet.codeText}</code></pre><p className="border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-600"><strong>누수 방지:</strong> {snippet.leakageGuard ?? "별도 확인 필요"}</p></article>)}</div></section> : null}
          </div>
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 p-5 text-sm leading-6"><h2 className="flex items-center gap-2 font-black text-[#142f4b]"><Database size={17} className="text-[#0f766e]" /> 데이터·출력</h2><dl className="mt-4 grid gap-3 text-slate-600"><div><dt className="font-bold text-slate-800">데이터셋</dt><dd>{task.datasetFilename ?? "미확인"}</dd></div><div><dt className="font-bold text-slate-800">타깃 또는 답</dt><dd>{task.targetOrAnswer ?? "미확정"}</dd></div><div><dt className="font-bold text-slate-800">예상 출력</dt><dd>{task.expectedOutputFormat ?? "미확정"}</dd></div><div><dt className="font-bold text-slate-800">평가 가정</dt><dd>{task.metricOrScoring ?? "미확정"}</dd></div></dl></section>
            {metadata ? <section className="rounded-2xl border border-slate-200 p-5 text-sm leading-6"><h2 className="font-black text-[#142f4b]">실행 근거</h2><dl className="mt-4 grid gap-3 text-slate-600"><div><dt className="font-bold text-slate-800">데이터 해시</dt><dd>{metadata.datasetHash ?? "미기록"}</dd></div><div><dt className="font-bold text-slate-800">런타임 결과</dt><dd>{metadata.runtimeResult ?? "미검증"}</dd></div><div><dt className="font-bold text-slate-800">패키지 버전</dt><dd>{metadata.packageVersionEvidence ?? "미기록"}</dd></div><div><dt className="font-bold text-slate-800">난수 시드</dt><dd>{metadata.randomSeed ?? "미기록"}</dd></div></dl></section> : null}
            <section className="rounded-2xl border border-slate-200 p-5"><h2 className="font-black text-[#142f4b]">연결 개념</h2><div className="mt-3 flex flex-wrap gap-2">{concepts.map((concept) => <Link key={concept!.id} href={`/bda/concepts#${concept!.id}`} className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 hover:underline">{concept!.id} · {concept!.name}</Link>)}</div></section>
            <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950"><ShieldCheck size={15} className="shrink-0" />이 과제의 표기 상태는 공식 출제·채점 근거가 아니라 현재 수집·검수 기록입니다.</p>
          </aside>
        </div>
      </article>
    </main>
  );
}

function Info({ title, text, tone = "slate" }: { title: string; text?: string; tone?: "slate" | "amber" }) {
  return <div className={`rounded-xl p-4 text-sm leading-6 ${tone === "amber" ? "border border-amber-100 bg-amber-50 text-amber-950" : "bg-slate-50 text-slate-700"}`}><strong className="block text-[#142f4b]">{title}</strong><p className="mt-1 whitespace-pre-wrap">{text ?? "미기록"}</p></div>;
}
