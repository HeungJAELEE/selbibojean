import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  Library,
  ShieldCheck,
} from "lucide-react";
import { bdaExamBlueprint } from "@/data/source/bda-exam-blueprint";
import { getBdaContent } from "@/lib/content/bda-repository";
import { getBdaNotionMigrationStats } from "@/lib/content/bda-notion-snapshot-repository";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "필기 총정리",
  description:
    "빅데이터분석기사 필기 4과목의 통합 개념서, 40개 개념 지도, 183개 학습문제를 한 흐름으로 학습합니다.",
};

export default function BdaWrittenOverviewPage() {
  const content = getBdaContent();
  const qbank = getBdaQbank();
  const migration = getBdaNotionMigrationStats();
  const blueprint = bdaExamBlueprint.written;

  return (
    <main className="page-wrap pb-16 pt-8 sm:pt-10">
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-l-8 border-[#0f766e] p-6 sm:p-9">
          <p className="eyebrow">필기 학습 대시보드</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-[#142f4b] sm:text-4xl">
            이론·개념·문제를 4과목 기준으로 다시 묶었습니다.
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            Notion 이관 이론과 문제은행 v0.4를 같은 과목·개념 ID로 연결했습니다.
            공식 시험은 과목별 20문항, 총 {blueprint.totalQuestions}문항이며
            시험 시간은 {blueprint.durationMinutes}분입니다.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <SummaryStat value={migration.pageCount} label="이관 원천 페이지" />
            <SummaryStat value={qbank.stats.conceptCount} label="정규화 개념" />
            <SummaryStat value={qbank.stats.learningItemCount} label="학습 재구성" />
          </div>
        </div>
      </header>

      <section className="mt-7 grid gap-3 lg:grid-cols-3">
        <StudyRoute
          href="/bda/textbook"
          icon={Library}
          title="통합 개념서"
          description="Notion 이론·표·도식·보강 설명을 과목별 교재로 읽습니다."
        />
        <StudyRoute
          href="/bda/concepts"
          icon={BookOpenText}
          title="40개 개념 지도"
          description="정의·판단 기준·함정·연결 문제를 개념 단위로 확인합니다."
        />
        <StudyRoute
          href="/bda/bank"
          icon={BrainCircuit}
          title="학습 문제은행"
          description="출처와 검수 상태가 보이는 재구성 문제를 풀고 취약 개념으로 돌아갑니다."
        />
      </section>

      <section className="mt-10" aria-labelledby="written-subjects-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">4과목 학습 순서</p>
            <h2
              id="written-subjects-title"
              className="mt-2 text-2xl font-black text-[#142f4b] sm:text-3xl"
            >
              과목별 범위와 현재 연결 상태
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            40개 개념은 상위 학습 단위입니다. 실제 문항의 세부 주제는 통합
            개념서와 연결 문제에서 더 작은 단위로 보강합니다.
          </p>
        </div>

        <div className="mt-6 grid gap-5">
          {blueprint.subjects.map((subject) => {
            const localSubject = content.subjects.find(
              (item) => item.id === subject.id,
            );
            const lessonCount = content.lessons.filter(
              (item) => item.subjectId === subject.id,
            ).length;
            const conceptCount = qbank.concepts.filter(
              (item) => item.subjectNo === subject.order,
            ).length;
            const learningItemCount = qbank.learningItems.filter(
              (item) => item.subjectNo === subject.order,
            ).length;

            return (
              <article
                key={subject.id}
                id={`subject-${subject.order}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="grid lg:grid-cols-[13rem_minmax(0,1fr)_17rem]">
                  <header
                    className="p-5 text-white sm:p-6"
                    style={{
                      backgroundColor: localSubject?.accent ?? "#153a59",
                    }}
                  >
                    <p className="text-sm font-black text-white/75">
                      제{subject.order}과목
                    </p>
                    <h3 className="mt-2 text-xl font-black leading-7">
                      {subject.title}
                    </h3>
                    <p className="mt-5 text-sm font-bold text-white/80">
                      {subject.questionCount}문항
                    </p>
                  </header>

                  <div className="p-5 sm:p-6">
                    <h4 className="font-black text-[#142f4b]">공식 주요 영역</h4>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {subject.focusAreas.map((area) => (
                        <li
                          key={area}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                        >
                          {area}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {localSubject?.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
                    <dl className="grid grid-cols-3 gap-2 text-center">
                      <Count label="레슨" value={lessonCount} />
                      <Count label="개념" value={conceptCount} />
                      <Count label="연결 문제" value={learningItemCount} />
                    </dl>
                    <Link
                      href={`/bda/concepts#subject-${subject.order}`}
                      className="mt-5 flex min-h-11 items-center justify-between rounded-xl bg-[#153a59] px-4 text-sm font-black text-white"
                    >
                      과목 학습 시작 <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" />
        <p>
          <strong>문제 표기 원칙:</strong> 공개 복원자료와 자체 제작 문제를 공식
          기출·공식 정답으로 표시하지 않습니다. 답안과 해설은 제출 뒤에만
          공개하며, 미검수 항목은 학습 화면에 자동 승격하지 않습니다.
        </p>
      </aside>
    </main>
  );
}

function SummaryStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <strong className="block text-2xl font-black tabular-nums text-[#142f4b]">
        {value.toLocaleString("ko-KR")}
      </strong>
      <span className="mt-1 block text-xs font-bold text-slate-500">{label}</span>
    </div>
  );
}

function StudyRoute({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Library;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf8f5] text-[#0f766e]">
        <Icon size={20} />
      </span>
      <span>
        <strong className="flex items-center gap-2 text-lg text-[#142f4b]">
          {title}
          <ArrowRight
            size={16}
            className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0f766e]"
          />
        </strong>
        <span className="mt-2 block text-sm leading-6 text-slate-600">
          {description}
        </span>
      </span>
    </Link>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-black tabular-nums text-[#142f4b]">
        {value.toLocaleString("ko-KR")}
      </dd>
    </div>
  );
}
