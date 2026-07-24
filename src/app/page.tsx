import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  RotateCcw,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getContent } from "@/lib/content/repository";
import {
  getPracticalContent,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";

export default async function HomePage() {
  const [content, practical] = await Promise.all([
    getContent(),
    getPracticalContent(),
  ]);
  const publicQuestions = content.questions.filter(isPublishableQuestion).length;
  const publicLessons = content.lessons.filter(isPublishableLesson).length;
  const practicalPast = publicPracticalQuestions("past").length;
  const practicalPredicted = publicPracticalQuestions("predicted").length;
  return (
    <>
      <section className="soft-grid bg-[#173957] py-18 text-white md:py-24">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="eyebrow !text-[#8dd5ce]">설비보전기사 마스터북</p>
            <h1 className="display mt-5 text-5xl font-bold leading-[1.06] md:text-7xl">
              이론에서 문제까지
              <br />
              <span className="text-[#8dd5ce]">근거로 연결합니다.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              필기 이론·객관식과 NCS 원문 기반 실기 기출복원·출제예상을 한
              사이트에서 학습하고, 제출 후 모범답안과 채점 기준으로
              복습합니다.
            </p>
            <div
              data-testid="primary-learning-paths"
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <PrimaryLink href="/written/theory">필기 이론</PrimaryLink>
              <PrimaryLink href="/written/mock" strong>
                필기 모의고사
              </PrimaryLink>
              <PrimaryLink href="/practical">실기 학습</PrimaryLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat
              value={publicQuestions.toLocaleString()}
              label="검증된 필기 문제"
              icon={<ClipboardCheck />}
            />
            <Stat
              value={publicLessons.toLocaleString()}
              label="공개 필기 레슨"
              icon={<Layers3 />}
            />
            <Stat
              value={practicalPast.toLocaleString()}
              label="실기 기출복원"
              icon={<FileCheck2 />}
            />
            <Stat
              value={practicalPredicted.toLocaleString()}
              label="실기 출제예상"
              icon={<Sparkles />}
            />
          </div>
        </div>
      </section>
      <section className="page-wrap py-16">
        <p className="eyebrow">학습 경로</p>
        <h2 className="display mt-3 text-3xl font-bold md:text-4xl">
          시험 단계에 맞춰 시작하세요
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <ActionCard
            href="/written/theory"
            icon={<BookOpen />}
            title="필기 이론"
            text="현행 과목과 세부 개념을 공식·오답 함정·관련 문제까지 연결해 학습합니다."
            action="이론 목차"
          />
          <ActionCard
            href="/written/mock"
            icon={<FileCheck2 />}
            title="필기 문제풀이"
            text="검증 완료 문제만 풀고, 답안 제출 후 선택지별 해설과 연결 이론을 확인합니다."
            action="필기 시작"
          />
          <ActionCard
            href="/practical"
            icon={<Wrench />}
            title="실기 학습"
            text={`기출복원 ${practicalPast}문제, 출제예상 ${practicalPredicted}문제, 실기 개념 ${practical.report.rows.concepts}개를 제공합니다.`}
            action="실기 시작"
          />
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-slate-600">
            오답과 취약 개념을 바로 복습할 수 있습니다.
          </span>
          <span className="flex flex-wrap gap-2">
            <Link
              href="/written/practice/random"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-[#16697a]"
            >
              <Sparkles size={15} /> 랜덤 문제
            </Link>
            <Link
              href="/written/review"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-[#8f3f0a]"
            >
              <RotateCcw size={15} /> 오답·복습
            </Link>
          </span>
        </div>
      </section>
    </>
  );
}

function PrimaryLink({
  href,
  children,
  strong = false,
}: {
  href: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-extrabold text-white ${
        strong
          ? "bg-[#8f3f0a]"
          : "border border-white/30 bg-white/10"
      }`}
    >
      {children} <ArrowRight size={18} />
    </Link>
  );
}

function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur">
      <div className="text-[#8dd5ce]">{icon}</div>
      <p className="mt-6 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  text,
  action,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="card group p-7 transition hover:-translate-y-1 hover:border-[#16697a]"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
        {icon}
      </span>
      <h3 className="mt-7 text-xl font-extrabold">{title}</h3>
      <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-6 flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
        {action}
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
