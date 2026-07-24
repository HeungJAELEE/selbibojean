import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, ShieldCheck } from "lucide-react";
import {
  getBdaSubject,
  getPublishedBdaQuestions,
} from "@/lib/content/bda-repository";

export const metadata: Metadata = { title: "개념 확인문제" };

export default function BdaPracticePage() {
  const questions = getPublishedBdaQuestions();

  return (
    <main className="page-wrap pb-16">
      <header className="py-10 sm:py-14">
        <p className="eyebrow">Concept practice</p>
        <h1 className="mt-3 text-4xl font-black text-[#142f4b]">
          개념 확인문제
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Notion 이론을 정확히 이해했는지 확인하는 자체 제작 문제입니다.
          정답과 해설은 답안을 제출한 뒤에만 공개됩니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {questions.map((question, index) => {
          const subject = getBdaSubject(question.subjectId);
          return (
            <Link
              key={question.id}
              href={`/bda/written/practice/${question.id}`}
              className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="grid size-11 place-items-center rounded-xl font-black text-white"
                  style={{ backgroundColor: subject?.accent ?? "#0f766e" }}
                >
                  {index + 1}
                </span>
                <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
              </div>
              <p className="mt-5 text-xs font-black text-slate-500">
                제{subject?.order}과목 · {subject?.shortTitle}
              </p>
              <h2 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-[#142f4b]">
                {question.stem}
              </h2>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#0f766e]">
                <BrainCircuit size={15} /> 자체 제작 · 검수 완료
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />
        <p className="text-sm leading-6 text-emerald-950">
          이 문제들은 공식 기출 원문이나 공식 정답이 아닙니다. 현재 이론
          범위에 맞춰 독립적으로 작성하고 개념·오답 근거를 검수한
          학습문제입니다.
        </p>
      </div>
    </main>
  );
}
