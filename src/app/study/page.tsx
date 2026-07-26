import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Wrench } from "lucide-react";
import { UNIFIED_LEARNING_CONCEPTS } from "@/data/source/unified-learning-concepts";

export const metadata: Metadata = {
  title: "통합 학습 파일럿",
  description:
    "같은 설비보전 개념을 필기 객관식과 실기 필답·작업 관점으로 연결합니다.",
};

export default function StudyIndexPage() {
  return (
    <div className="page-wrap py-12">
      <section className="overflow-hidden rounded-3xl bg-[#173957] p-7 text-white md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-200">
          Integrated learning pilot
        </p>
        <h1 className="display mt-3 text-4xl font-bold md:text-5xl">
          같은 개념을 필기와 실기로 이어서 학습
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
          기존 필기 레슨과 실기 개념·문제·수행과제는 그대로 유지합니다.
          이 화면은 중복 콘텐츠를 새로 만드는 대신, 같은 개념의 학습 경로를
          하나의 브리지로 연결하는 1차 파일럿입니다.
        </p>
        <div className="mt-7 grid gap-3 text-sm md:grid-cols-3">
          <PilotPrinciple
            title="통합"
            text="공통원리와 필기·실기 차이를 먼저 봅니다."
          />
          <PilotPrinciple
            title="필기"
            text="구분·판정·공식·객관식 함정을 집중합니다."
          />
          <PilotPrinciple
            title="실기"
            text="사진·순서·진단·안전·수행과제로 연결합니다."
          />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="pilot-concepts-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">대표 개념 5개</p>
            <h2 id="pilot-concepts-heading" className="mt-2 text-3xl font-extrabold">
              먼저 검증하는 통합 개념
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-500">
            기존 ID·URL 유지 · 진행률 분리 · 정답 비노출 유지
          </p>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {UNIFIED_LEARNING_CONCEPTS.map((concept) => (
            <Link
              key={concept.id}
              href={`/study/${concept.id}`}
              className="card group flex min-h-72 flex-col p-6 transition hover:-translate-y-1 hover:border-[#16697a]"
            >
              <div className="flex flex-wrap gap-2 text-xs font-extrabold">
                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">
                  통합
                </span>
                <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800">
                  필기 {concept.writtenLessonIds.length}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">
                  실기 {concept.practicalConceptIds.length}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold">{concept.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                {concept.summary}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-extrabold text-[#16697a]">
                통합 학습 시작
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function PilotPrinciple({ title, text }: { title: string; text: string }) {
  const Icon = title === "실기" ? Wrench : BookOpen;
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <div className="flex items-center gap-2 font-extrabold">
        <Icon size={17} />
        {title}
      </div>
      <p className="mt-2 leading-6 text-slate-200">{text}</p>
    </div>
  );
}
