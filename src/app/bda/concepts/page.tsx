import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Code2, ShieldCheck } from "lucide-react";
import {
  getBdaQbankConceptItems,
  getBdaQbankSubjects,
} from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "개념 지도",
  description: "문제은행 v0.4의 40개 개념을 출제 포인트·판단 순서·실기 연결까지 확장한 학습 지도입니다.",
};

export default function BdaConceptsPage() {
  const subjects = getBdaQbankSubjects();

  return (
    <main className="page-wrap pb-16">
      <header className="py-10 sm:py-14">
        <p className="eyebrow">C001–C040 expanded theory map</p>
        <h1 className="mt-3 text-4xl font-black text-[#142f4b]">개념 지도</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          문제은행의 모든 학습 재구성 항목을 C001~C040에 대조했습니다. 카드에서는 빠른 요약을 보고,
          상세 개념에서는 출제 포인트·판단 순서·비교표·실기 적용·연결된 모든 주제를 확인할 수 있습니다.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-sm leading-7 text-teal-950">
        <strong>이번 보강:</strong> 183개 학습 재구성 항목은 모두 개념에 연결되어 있습니다. MapReduce·HDFS·NoSQL,
        CRISP-DM·SEMMA·WBS, 검정 종류, 딥러닝·앙상블, 제출 파일·데이터누수처럼 한 줄 요약에 묶였던 주제도
        각 상세 개념 안에서 별도 판단 기준으로 확장했습니다.
      </section>

      <div className="grid gap-8">
        {subjects.map((subject) => (
          <section
            id={`subject-${subject.subjectNo}`}
            key={subject.subjectNo}
            className="card scroll-mt-24 overflow-hidden"
          >
            <header className="bg-[#173957] p-6 text-white sm:p-7">
              <p className="text-xs font-black tracking-[.16em] text-teal-200">SUBJECT {subject.subjectNo}</p>
              <h2 className="mt-2 text-2xl font-black">{subject.subjectName}</h2>
              <p className="mt-2 text-sm text-slate-200">{subject.concepts.length}개 확장 개념 모듈</p>
            </header>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {subject.concepts.map((concept) => {
                const relatedCount = getBdaQbankConceptItems(concept.id).length;
                return (
                  <article key={concept.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-black text-teal-800">{concept.id}</span>
                        <h3 className="mt-3 text-xl font-black text-[#142f4b]">{concept.name}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{concept.majorArea} · {concept.subArea}</p>
                      </div>
                      <BookOpenText className="shrink-0 text-[#0f766e]" />
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{concept.definition}</p>
                    {concept.formulaOrRule ? (
                      <p className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm leading-6 text-teal-950"><strong>핵심 규칙</strong> · {concept.formulaOrRule}</p>
                    ) : null}
                    {concept.commonTraps ? (
                      <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm leading-6 text-amber-950"><strong>혼동 포인트</strong> · {concept.commonTraps}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-600">연결 학습 항목 {relatedCount}개</span>
                      {concept.practicalLink ? <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-800"><Code2 size={13} /> {concept.practicalLink}</span> : null}
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800"><ShieldCheck size={13} /> {concept.validationStatus}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link href={`/bda/concepts/${concept.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#173957] px-3 py-2 text-sm font-black text-white hover:bg-[#0f766e]">상세 개념 학습 <ArrowRight size={15} /></Link>
                      <Link href={`/bda/bank?concept=${concept.id}`} className="inline-flex items-center gap-1.5 text-sm font-black text-[#0f766e] hover:underline">연결 문제 {relatedCount}개 <ArrowRight size={15} /></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
