import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { StudyModeSwitch } from "@/components/study-mode-switch";
import {
  getUnifiedLearningConcept,
  UNIFIED_LEARNING_CONCEPTS,
} from "@/data/source/unified-learning-concepts";
import {
  getPracticalWorkTask,
} from "@/data/source/practical-work-tasks";
import {
  getPracticalConcept,
} from "@/lib/content/practical-repository";
import { getLesson } from "@/lib/content/repository";
import { isPublishableLesson } from "@/lib/domain/practice";

export function generateStaticParams() {
  return UNIFIED_LEARNING_CONCEPTS.map((concept) => ({
    conceptId: concept.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}): Promise<Metadata> {
  const { conceptId } = await params;
  const concept = getUnifiedLearningConcept(conceptId);
  return {
    title: concept ? `${concept.title} 통합 학습` : "통합 학습",
    description: concept?.summary,
  };
}

export default async function UnifiedStudyConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const bridge = getUnifiedLearningConcept(conceptId);
  if (!bridge) notFound();

  const writtenLessons = (
    await Promise.all(bridge.writtenLessonIds.map((lessonId) => getLesson(lessonId)))
  ).filter(
    (lesson): lesson is NonNullable<typeof lesson> =>
      Boolean(lesson && isPublishableLesson(lesson)),
  );
  const practicalConcepts = (
    await Promise.all(
      bridge.practicalConceptIds.map((practicalConceptId) =>
        getPracticalConcept(practicalConceptId),
      ),
    )
  ).filter(
    (concept): concept is NonNullable<typeof concept> =>
      Boolean(concept?.contentStatus === "published"),
  );
  const workTasks = bridge.practicalTaskIds
    .map((taskId) => getPracticalWorkTask(taskId))
    .filter((task): task is NonNullable<typeof task> => Boolean(task));
  const relatedConcepts = bridge.relatedConceptIds
    .map((id) => getUnifiedLearningConcept(id))
    .filter((concept): concept is NonNullable<typeof concept> => Boolean(concept));

  return (
    <div className="page-wrap max-w-6xl py-10">
      <Link
        href="/study"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-[#16697a]"
      >
        <ArrowLeft size={16} /> 통합 학습 파일럿
      </Link>

      <div className="mt-5">
        <StudyModeSwitch concept={bridge} currentMode="integrated" />
      </div>

      <header className="mt-7 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-sky-50 p-7 md:p-10">
        <p className="eyebrow">필기·실기 공통 개념</p>
        <h1 className="display mt-3 text-4xl font-bold md:text-6xl">
          {bridge.title}
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-700">
          {bridge.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {bridge.learningNature.map((nature) => (
            <span
              key={nature}
              className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-extrabold text-teal-800"
            >
              {learningNatureLabel(nature)}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <LearningPerspective
          icon={<BookOpenCheck size={21} />}
          eyebrow="필기에서는"
          title="구분·판정·공식과 객관식 함정"
          items={bridge.writtenFocus}
          tone="written"
        />
        <LearningPerspective
          icon={<Wrench size={21} />}
          eyebrow="실기에서는"
          title="식별·답안·순서·진단과 수행"
          items={bridge.practicalFocus}
          tone="practical"
        />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">이번에 기억할 것</p>
        <h2 className="mt-2 text-2xl font-extrabold">핵심 3~5개만 먼저 고정</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {bridge.memoryPoints.map((point, index) => (
            <li key={point} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#173957] text-sm font-black text-white">
                {index + 1}
              </span>
              <span className="text-sm font-semibold leading-7 text-slate-700">
                {point}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <article className="rounded-3xl border border-sky-200 bg-sky-50 p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
            필기 연결
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            기존 필기 레슨과 문제
          </h2>
          {writtenLessons.length > 0 ? (
            <>
              <div className="mt-6 grid gap-3">
                {writtenLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/written/theory/${lesson.id}`}
                    className="rounded-2xl border border-sky-200 bg-white p-4 hover:border-sky-600"
                  >
                    <strong>{lesson.title}</strong>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {lesson.summary[0]}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {bridge.writtenQuestionIds.slice(0, 2).map((questionId) => (
                  <Link
                    key={questionId}
                    href={`/written/practice/${questionId}`}
                    className="rounded-full bg-[#173957] px-4 py-2 text-sm font-extrabold text-white"
                  >
                    필기 문제 {questionId}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-sky-300 bg-white p-5 text-sm leading-7 text-slate-600">
              직접 연결된 필기 레슨은 없습니다. 실기 전용 개념으로 유지하며
              억지로 필기 항목을 생성하지 않습니다.
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
            실기 연결
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            기존 실기 이론·기출·예상
          </h2>
          <div className="mt-6 grid gap-3">
            {practicalConcepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/practical/written/theory/${concept.id}`}
                className="rounded-2xl border border-amber-200 bg-white p-4 hover:border-amber-600"
              >
                <strong>{concept.title}</strong>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {concept.definition}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
                    기출 {concept.relatedPastQuestionIds.length}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
                    예상 {concept.relatedPredictedQuestionIds.length}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {bridge.practicalQuestionIds[0] ? (
            <Link
              href={`/practical/written/question/${bridge.practicalQuestionIds[0]}`}
              className="mt-5 inline-flex rounded-full bg-[#8f3f0a] px-4 py-2 text-sm font-extrabold text-white"
            >
              실기 문제 1개 먼저 풀기
            </Link>
          ) : null}
        </article>
      </section>

      {workTasks.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-teal-700 text-white">
              <ClipboardCheck size={21} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                관련 작업형
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">
                이론을 실제 수행과제로 연결
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {workTasks.map((task) => (
              <Link
                key={task.id}
                href={`/practical/work/${task.slug}`}
                className="rounded-2xl border border-teal-200 bg-white p-5 hover:border-teal-700"
              >
                <p className="text-xs font-extrabold text-teal-700">
                  {task.ncsCode} · {task.estimatedMinutes}분
                </p>
                <h3 className="mt-2 font-extrabold">{task.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {task.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">근거와 진행률</p>
        <h2 className="mt-2 text-2xl font-extrabold">
          합쳐 보이되 원본과 학습기록은 분리
        </h2>
        <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">
          <Metric label="필기 레슨" value={`${writtenLessons.length}개`} />
          <Metric label="실기 개념" value={`${practicalConcepts.length}개`} />
          <Metric
            label="실기 근거"
            value={`${bridge.practicalEvidenceIds.length}건`}
          />
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          이 브리지는 기존 레슨·문제·NCS 근거·공개상태를 바꾸지 않습니다.
          필기 진도와 실기 진도도 각각의 기존 저장 구조에서 별도로 관리합니다.
        </p>
      </section>

      {relatedConcepts.length > 0 ? (
        <nav className="mt-8 border-t border-slate-200 pt-6" aria-label="관련 통합 개념">
          <p className="text-sm font-extrabold text-slate-500">다음 통합 개념</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedConcepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/study/${concept.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold hover:border-[#16697a] hover:text-[#16697a]"
              >
                {concept.title} <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function LearningPerspective({
  icon,
  eyebrow,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  items: string[];
  tone: "written" | "practical";
}) {
  const toneClasses =
    tone === "written"
      ? "border-sky-200 bg-sky-50 text-sky-800"
      : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <article className={`rounded-3xl border p-6 md:p-8 ${toneClasses}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]">
        {icon}
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-extrabold text-slate-900">{title}</h2>
      <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="font-black">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-slate-500">{label}</p>
      <strong className="mt-1 block text-xl text-[#173957]">{value}</strong>
    </div>
  );
}

function learningNatureLabel(nature: string) {
  const labels: Record<string, string> = {
    understand: "이해",
    distinguish: "구분",
    memorize: "암기",
    practice: "연습",
    perform: "수행",
  };
  return labels[nature] ?? nature;
}
