import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  Camera,
  ClipboardCheck,
  FileQuestion,
  ListOrdered,
  RotateCcw,
  ScanSearch,
  Target,
  Wrench,
} from "lucide-react";
import { PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS } from "@/data/source/practical-written-exam-cards";
import {
  TheoryModeTabs,
  type TheoryMode,
} from "@/components/theory-mode-tabs";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import {
  getPracticalContent,
  getPracticalTextbookSubjects,
  getPracticalWrittenExamCards,
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
  const [
    { mode: requestedMode },
    content,
    practical,
    practicalSubjects,
    practicalExamCards,
  ] =
    await Promise.all([
      searchParams,
      getContent(),
      getPracticalContent(),
      getPracticalTextbookSubjects(),
      getPracticalWrittenExamCards(),
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
          examCards={practicalExamCards}
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
  examCards,
}: {
  practical: Awaited<ReturnType<typeof getPracticalContent>>;
  subjects: ReturnType<typeof getPracticalTextbookSubjects>;
  examCards: Awaited<ReturnType<typeof getPracticalWrittenExamCards>>;
}) {
  const questionById = new Map(
    practical.questions.map((question) => [question.id, question]),
  );
  const cardSummaries = examCards
    .map((card) => {
      const sessions = card.pastQuestionIds
        .map((questionId) => questionById.get(questionId)?.occurrence)
        .filter((occurrence) => occurrence !== null && occurrence !== undefined);
      const latestSession = sessions
        .slice()
        .sort(
          (left, right) =>
            right.year - left.year || right.round - left.round,
        )[0];
      return { card, sessions, latestSession };
    })
    .sort(
      (left, right) =>
        right.sessions.length - left.sessions.length ||
        (right.latestSession?.year ?? 0) - (left.latestSession?.year ?? 0) ||
        (right.latestSession?.round ?? 0) - (left.latestSession?.round ?? 0),
    );
  const formatGroups = [
    {
      id: "visual",
      title: "사진·명칭형",
      description: "형상과 배치 단서를 찾아 정확한 명칭을 씁니다.",
      formats: ["image", "matching"] as const,
      icon: Camera,
    },
    {
      id: "definition",
      title: "정의형",
      description: "현상명과 성립조건을 한 문장 답안으로 만듭니다.",
      formats: ["definition"] as const,
      icon: FileQuestion,
    },
    {
      id: "calculation",
      title: "계산형",
      description: "공식 선택, 단위, 계산과정, 최종값을 함께 씁니다.",
      formats: ["calculation"] as const,
      icon: Calculator,
    },
    {
      id: "sequence",
      title: "순서형",
      description: "안전·준비·작업·완료 확인의 선후관계를 배열합니다.",
      formats: ["sequence"] as const,
      icon: ListOrdered,
    },
    {
      id: "drawing-symbol",
      title: "도면·기호형",
      description: "지시선·기호·투상·회로의 기준 위치를 판독합니다.",
      formats: ["drawing", "symbol"] as const,
      icon: ScanSearch,
    },
    {
      id: "diagnosis",
      title: "원인·대책형",
      description: "현상과 원인을 구분하고 점검·조치까지 연결합니다.",
      formats: ["diagnosis"] as const,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <LearningFlow
        eyebrow="필답형 시험카드"
        title="실제 기출 유형에서 시작해 답안을 완성합니다"
        steps={[
          ["1", "기출 유형", "어떤 사진·문장·수치가 실제로 반복됐는지 먼저 봅니다."],
          ["2", "판별 단서", "사진 형상, 요구동사, 공식 조건에서 정답 단서를 찾습니다."],
          ["3", "바로 쓰는 답", "핵심어 5개 이내와 답안 골격으로 직접 써 봅니다."],
          ["4", "변형·예상", "숫자·사진·표현이 바뀐 문제와 NCS 예상문제로 확장합니다."],
        ]}
      />

      <section className="mt-12" aria-labelledby="recent-exam-card-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">최근 기출에서 반복된 유형</p>
            <h2
              id="recent-exam-card-title"
              className="mt-2 text-2xl font-extrabold"
            >
              먼저 완성한 대표 필답 시험카드 10개
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-500">
            실제 복원 Evidence 기준 정렬
          </p>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          단순 개념 수가 아니라 실제 회차 Evidence 수와 최근 회차를 기준으로
          정렬했습니다. 회차가 없는 카드는 NCS 기반 예상으로 별도 표시합니다.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cardSummaries.map(({ card, sessions }) => (
            <Link
              key={card.id}
              data-testid={`practical-written-exam-card-link-${card.id}`}
              href={`/practical/written/theory/${card.conceptIds[0]}#exam-card-${card.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#16697a]"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                <span className="rounded-full bg-[#edf5f8] px-2.5 py-1 text-[#173957]">
                  {PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS[card.format]}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 ${
                    sessions.length > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {sessions.length > 0
                    ? `필답 기출 ${sessions.length}회`
                    : "필답 예상"}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold">{card.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {card.directAnswer}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {card.studyKeywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-[#16697a]">
                시험카드 열기 <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="practical-format-title">
        <p className="eyebrow">출제 형식별 공부</p>
        <h2 id="practical-format-title" className="mt-2 text-2xl font-extrabold">
          사진·정의·계산·순서·도면·진단으로 찾아보기
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {formatGroups.map((group) => {
            const matchingCards = examCards.filter((card) =>
              (group.formats as readonly string[]).includes(card.format),
            );
            const Icon = group.icon;
            return (
              <article
                key={group.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f8] text-[#173957]">
                    <Icon size={18} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">
                    대표카드 {matchingCards.length}
                  </span>
                </div>
                <h3 className="mt-4 font-extrabold">{group.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {group.description}
                </p>
                {matchingCards.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {matchingCards.slice(0, 3).map((card) => (
                      <Link
                        key={card.id}
                        href={`/practical/written/theory/${card.conceptIds[0]}#exam-card-${card.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#16697a] hover:text-[#16697a]"
                      >
                        {card.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs font-bold text-amber-700">
                    대표 기출카드 검수 후 연결 예정
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="practical-subjects-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">필답 이론 4과목</p>
            <h2
              id="practical-subjects-title"
              className="mt-2 text-2xl font-extrabold"
            >
            시험카드 이후 필요한 NCS 보충이론
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
