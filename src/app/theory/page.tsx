import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  RotateCcw,
  Target,
  Wrench,
} from "lucide-react";
import {
  TheoryModeTabs,
  type TheoryMode,
} from "@/components/theory-mode-tabs";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import {
  getPracticalContent,
  getPracticalTextbookSubjects,
  practicalConceptsByTextbookSubject,
} from "@/lib/content/practical-repository";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";

export const metadata: Metadata = {
  title: "이론 학습",
  description:
    "설비보전기사 이론을 필기 객관식 또는 실기 필답 관점으로 전환해 학습합니다.",
};

export default async function UnifiedTheoryPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ mode: requestedMode }, content, practical, practicalSubjects] =
    await Promise.all([
      searchParams,
      getContent(),
      getPracticalContent(),
      getPracticalTextbookSubjects(),
    ]);
  const mode: TheoryMode =
    requestedMode === "practical" ? "practical" : "written";

  return (
    <div className="page-wrap pb-16">
      <PageHeading
        eyebrow="Theory learning"
        title="같은 이론을 시험 방식에 맞춰 학습합니다"
        description="필기와 실기의 원리는 이어지지만 답을 만드는 방식은 다릅니다. 필기 중심에서는 선택지 함정과 오답 복습을, 실기·필답 중심에서는 기출 키워드와 작업 순서를 앞에 배치합니다."
      />

      <TheoryModeTabs mode={mode} />

      {mode === "written" ? (
        <WrittenTheoryMode content={content} />
      ) : (
        <PracticalTheoryMode
          practical={practical}
          subjects={practicalSubjects}
        />
      )}
    </div>
  );
}

function WrittenTheoryMode({
  content,
}: {
  content: Awaited<ReturnType<typeof getContent>>;
}) {
  const lessons = content.lessons.filter(isPublishableLesson);
  const questions = content.questions.filter(isPublishableQuestion);

  return (
    <>
      <LearningFlow
        eyebrow="필기 중심 학습"
        title="개념을 이해한 다음 선택지 함정을 제거합니다"
        steps={[
          ["1", "개념 이해", "정의·원리·공식과 비슷한 용어의 차이를 먼저 봅니다."],
          ["2", "실제 함정", "단위, 조건 누락, 반대 개념과 자주 섞이는 오답을 확인합니다."],
          ["3", "문제풀이", "관련 CBT 문제를 풀고 제출 후 선택지별 해설을 확인합니다."],
          ["4", "오답 복습", "틀린 이유를 이론 위치와 연결하고 다른 문제로 다시 확인합니다."],
        ]}
      />

      <section className="mt-12" aria-labelledby="written-subjects-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">4개 필기 과목</p>
            <h2
              id="written-subjects-title"
              className="mt-2 text-2xl font-extrabold"
            >
              과목별 개념과 문제를 이어서 학습
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-500">
            이론 {lessons.length.toLocaleString()} · 문제{" "}
            {questions.length.toLocaleString()}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.subjects.map((subject) => {
            const subjectLessons = lessons.filter(
              (lesson) => lesson.subjectId === subject.id,
            );
            const subjectQuestions = questions.filter(
              (question) => question.subjectId === subject.id,
            );
            const groupCount = content.conceptGroups.filter(
              (group) => group.subjectId === subject.id,
            ).length;
            return (
              <Link
                key={subject.id}
                href="/written/theory"
                className="card group p-6 transition hover:-translate-y-0.5 hover:border-[#16697a]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    <BookOpen size={19} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">
                    이론 {subjectLessons.length} · 문제 {subjectQuestions.length}
                  </span>
                </div>
                <p className="mt-5 text-xs font-black text-[#16697a]">
                  제{subject.code}과목 · 개념군 {groupCount}
                </p>
                <h3 className="mt-1 text-xl font-extrabold">{subject.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {subject.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
                  개념부터 시작 <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <ActionCard
          href="/written/theory"
          icon={<BookOpen />}
          title="필기 이론 목차"
          text="개념 묶음에서 차이와 함정을 이해하고 세부 레슨으로 내려갑니다."
        />
        <ActionCard
          href="/written/practice/random"
          icon={<ClipboardCheck />}
          title="랜덤 문제로 확인"
          text="범위와 문제 수를 정해 CBT 문제를 중복 없이 풉니다."
        />
        <ActionCard
          href="/written/review"
          icon={<RotateCcw />}
          title="오답·취약 개념"
          text="틀린 문제와 복습 예정 문제를 연결 이론과 함께 다시 봅니다."
        />
      </section>
    </>
  );
}

function PracticalTheoryMode({
  practical,
  subjects,
}: {
  practical: Awaited<ReturnType<typeof getPracticalContent>>;
  subjects: ReturnType<typeof getPracticalTextbookSubjects>;
}) {
  const priorityConcepts = practical.concepts
    .filter((concept) => concept.contentStatus === "published")
    .map((concept) => ({
      concept,
      past: concept.relatedPastQuestionIds.length,
      predicted: concept.relatedPredictedQuestionIds.length,
    }))
    .sort(
      (left, right) =>
        right.past * 10 +
        right.predicted -
        (left.past * 10 + left.predicted),
    )
    .slice(0, 12);

  return (
    <>
      <LearningFlow
        eyebrow="실기·필답 중심 학습"
        title="기출에서 요구하는 답안과 실제 작업까지 연결합니다"
        steps={[
          ["1", "개념 이해", "명칭·원리·공식·도면과 적용조건을 먼저 정리합니다."],
          ["2", "기출 키워드", "실제 복원문제의 요구동사와 채점에 필요한 핵심어를 확인합니다."],
          ["3", "답안 작성", "기출복원과 NCS 기반 예상문제에 직접 답을 작성합니다."],
          ["4", "작업 적용", "안전·공구·순서·측정·판정·진단 과제로 확장합니다."],
        ]}
      />

      <section className="mt-12" aria-labelledby="practical-subjects-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">필답 이론 4과목</p>
            <h2
              id="practical-subjects-title"
              className="mt-2 text-2xl font-extrabold"
            >
              NCS 이론을 출제 형태로 묶어서 학습
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-500">
            공개 개념 {practical.report.publication.concepts} · NCS 보강{" "}
            {practical.report.publication.supplementalConcepts}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => {
            const concepts = practicalConceptsByTextbookSubject(subject.id);
            const conceptIds = new Set(concepts.map((concept) => concept.id));
            const pastCount = practical.questions.filter(
              (question) =>
                question.kind === "past" &&
                question.contentStatus === "published" &&
                question.conceptIds.some((id) => conceptIds.has(id)),
            ).length;
            const predictedCount = practical.questions.filter(
              (question) =>
                question.kind === "predicted" &&
                question.contentStatus === "published" &&
                question.conceptIds.some((id) => conceptIds.has(id)),
            ).length;
            return (
              <Link
                key={subject.id}
                href={`/practical/written/theory/subject/${subject.id}`}
                className="card group p-6 transition hover:-translate-y-0.5 hover:border-[#8f3f0a]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-[#8f3f0a]">
                    <Wrench size={19} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">
                    기출 {pastCount} · 예상 {predictedCount}
                  </span>
                </div>
                <p className="mt-5 text-xs font-black text-[#8f3f0a]">
                  {subject.code} · 이론 {concepts.length}
                </p>
                <h3 className="mt-1 text-xl font-extrabold">{subject.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {subject.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#8f3f0a]">
                  필답 이론 시작 <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="exam-priority-title">
        <p className="eyebrow">기출 연결 우선</p>
        <h2 id="exam-priority-title" className="mt-2 text-2xl font-extrabold">
          먼저 볼 가능성 높은 필답 개념
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          기출복원 연결 수를 우선하고 NCS 기반 예상문제 연결을 함께 표시합니다.
          예상문제는 실제 기출횟수에 포함하지 않습니다.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {priorityConcepts.map(({ concept, past, predicted }) => (
            <Link
              key={concept.id}
              href={`/practical/written/theory/${concept.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#16697a]"
            >
              <div className="flex flex-wrap gap-2 text-xs font-extrabold">
                {past > 0 ? (
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
                    필답 기출 {past}
                  </span>
                ) : null}
                {predicted > 0 ? (
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">
                    필답 예상 {predicted}
                  </span>
                ) : null}
                {concept.contentRole === "supplemental" ? (
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                    NCS 보강
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 font-extrabold">{concept.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {concept.learningGoals[0] ?? concept.definition}
              </p>
              {concept.traps[0] ? (
                <p className="mt-3 flex gap-2 text-xs leading-5 text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {concept.traps[0]}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <ActionCard
          href="/practical/written/theory"
          icon={<BookOpen />}
          title="필답 이론 목차"
          text="정의·공식·순서·그림·도면·진단으로 나눠 NCS 이론을 봅니다."
        />
        <ActionCard
          href="/practical/mock"
          icon={<Target />}
          title="필답 모의고사"
          text="기출복원과 NCS 기반 예상문제를 혼합해 답안을 작성합니다."
        />
        <ActionCard
          href="/practical/info"
          icon={<Wrench />}
          title="실기 관련 정보"
          text="공압·유압·용접 수행과제와 수험 준비 팁을 확인합니다."
        />
      </section>
    </>
  );
}

function LearningFlow({
  eyebrow,
  title,
  steps,
}: {
  eyebrow: string;
  title: string;
  steps: Array<[string, string, string]>;
}) {
  return (
    <section className="mt-10 rounded-3xl bg-slate-50 p-6 md:p-8">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{title}</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map(([number, label, text]) => (
          <div key={number} className="rounded-2xl bg-white p-5">
            <span className="grid size-8 place-items-center rounded-full bg-[#173957] text-sm font-black text-white">
              {number}
            </span>
            <h3 className="mt-4 font-extrabold">{label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="card group p-6 hover:border-[#16697a]">
      <span className="grid size-10 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
        {icon}
      </span>
      <h3 className="mt-5 font-extrabold">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
        시작하기 <ArrowRight size={14} />
      </span>
    </Link>
  );
}
