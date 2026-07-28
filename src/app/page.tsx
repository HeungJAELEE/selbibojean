import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
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
              이론을 필기 또는 실기 관점으로 전환해 학습하고, CBT 필기
              모의고사와 기출·NCS 예상 필답 모의고사, 공압·유압·용접
              수행정보까지 한 흐름으로 이어갑니다.
            </p>
            <div
              data-testid="primary-learning-paths"
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <PrimaryLink href="/theory">이론 학습</PrimaryLink>
              <PrimaryLink href="/written/mock" strong>
                필기 모의고사
              </PrimaryLink>
              <PrimaryLink href="/practical/mock">필답 모의고사</PrimaryLink>
              <PrimaryLink href="/practical/info">실기 정보</PrimaryLink>
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
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <ActionCard
            href="/theory"
            icon={<BookOpen />}
            title="이론"
            text="필기 중심과 실기·필답 중심을 전환하며 개념·함정·기출 키워드를 학습합니다."
            action="학습 모드 선택"
          />
          <ActionCard
            href="/written/mock"
            icon={<FileCheck2 />}
            title="필기 모의고사"
            text="CBT 자료를 기반으로 실전 80문제 또는 과목·문제 수를 정한 랜덤 문제를 풉니다."
            action="CBT 시작"
          />
          <ActionCard
            href="/practical/mock"
            icon={<FileText />}
            title="필답 모의고사"
            text={`기출복원 ${practicalPast}문제와 NCS 기반 출제예상 ${practicalPredicted}문제를 혼합해 답안을 작성합니다.`}
            action="필답 시작"
          />
          <ActionCard
            href="/practical/info"
            icon={<Wrench />}
            title="실기 관련 정보"
            text={`공압·유압·용접 작업과 수험 준비 팁을 ${practical.report.rows.concepts}개 실기 개념과 연결합니다.`}
            action="실기 정보 보기"
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
        <p className="mt-5 text-center text-sm text-slate-600">
          건의사항은{" "}
          <a
            href="https://blog.naver.com/heung891025/224357527404"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#16697a] underline decoration-[#16697a]/40 underline-offset-4 hover:decoration-[#16697a] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16697a] focus-visible:ring-offset-2"
          >
            여기에 댓글로 남겨주세요
          </a>
          .
        </p>
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
