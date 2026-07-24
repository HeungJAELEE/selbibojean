import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, ShieldAlert } from "lucide-react";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "실기 과제은행",
  description: "v0.4에서 관리하는 58개 실기 과제의 학습 요약, 누수·개인정보 점검, 검수 상태입니다.",
};

export default function BdaPracticalBankPage() {
  const qbank = getBdaQbank();
  const grouped = qbank.practicalTasks.reduce<Record<string, typeof qbank.practicalTasks>>((result, task) => {
    const key = task.practicalType ?? "기타";
    (result[key] ??= []).push(task);
    return result;
  }, {});

  return (
    <main className="page-wrap pb-16">
      <header className="py-10 sm:py-14">
        <p className="eyebrow">Practical task bank</p>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-black text-[#142f4b]"><Code2 className="text-[#0f766e]" /> 실기 과제은행</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">v0.4가 관리하는 58개 실기 과제입니다. 각 과제는 데이터셋·타깃·출력 형식·코드 점검·누수·개인정보 조건을 분리해 기록합니다.</p>
      </header>

      <aside className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950"><ShieldAlert className="mt-0.5 shrink-0 text-amber-700" /><p><strong>신뢰도 표기:</strong> 공개 복원·자체 제작·코드 생성 항목의 근거등급과 검수 상태는 서로 다릅니다. `정답/코드 미검증`과 `초안`을 실제 채점기준 또는 확정 답으로 취급하지 마세요.</p></aside>

      <div className="mt-8 grid gap-8">
        {Object.entries(grouped).map(([type, tasks]) => (
          <section key={type}>
            <div className="flex items-end justify-between"><div><p className="eyebrow">{type}</p><h2 className="mt-2 text-2xl font-black text-[#142f4b]">{type} 과제 {tasks.length}개</h2></div></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <Link key={task.id} href={`/bda/practical/bank/${task.id}`} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-800">{task.id}</span><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" /></div>
                  <h3 className="mt-4 text-lg font-black text-[#142f4b]">{task.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{task.promptSummary}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{task.difficulty}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{task.answerStatus}</span></div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
