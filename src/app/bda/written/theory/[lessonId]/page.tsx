import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Scale,
  Target,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import {
  getBdaContent,
  getBdaLesson,
  getPublishedBdaQuestions,
  getBdaSubject,
} from "@/lib/content/bda-repository";
import {
  getBdaLessonLearningItems,
  toPublicBdaQbankLearningItem,
} from "@/lib/content/bda-qbank-repository";
import { isBdaLearningItemGradeable } from "@/lib/content/bda-learning-practice";
import { toPublicBdaQuestion } from "@/lib/domain/bda";
import { BdaLinkedPracticeSet } from "@/components/bda-linked-practice-set";

type Props = { params: Promise<{ lessonId: string }> };

export function generateStaticParams() {
  return getBdaContent().lessons.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getBdaLesson(lessonId);
  return { title: lesson?.title ?? "이론 레슨" };
}

export default async function BdaLessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = getBdaLesson(lessonId);
  if (!lesson) notFound();
  const subject = getBdaSubject(lesson.subjectId);
  if (!subject) notFound();

  const siblings = getBdaContent()
    .lessons.filter((item) => item.subjectId === subject.id)
    .sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((item) => item.id === lesson.id);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const verifiedQuestions = getPublishedBdaQuestions()
    .filter((question) => question.lessonId === lesson.id)
    .map(toPublicBdaQuestion);
  const lessonLearningItems = getBdaLessonLearningItems(lesson.id);
  const learningItems = lessonLearningItems
    .filter(isBdaLearningItemGradeable)
    .map(toPublicBdaQbankLearningItem);
  const heldLearningCount =
    lessonLearningItems.length - learningItems.length;

  return (
    <main className="page-wrap pb-16">
      <div className="py-8">
        <Link
          href={`/bda/written/theory#${subject.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0f766e]"
        >
          <ArrowLeft size={16} /> 이론 목차
        </Link>
      </div>

      <article className="mx-auto max-w-4xl">
        <header className="card overflow-hidden">
          <div
            className="h-2"
            style={{ backgroundColor: subject.accent }}
            aria-hidden="true"
          />
          <div className="p-6 sm:p-9">
            <p className="text-sm font-black" style={{ color: subject.accent }}>
              제{subject.order}과목 · {subject.title}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[#142f4b] sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              {lesson.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {lesson.relatedTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-6 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Target className="text-[#0f766e]" />
            <h2 className="text-xl font-black text-[#142f4b]">학습 목표</h2>
          </div>
          <ul className="mt-5 grid gap-3">
            {lesson.learningGoals.map((goal) => (
              <li key={goal} className="flex items-start gap-3 text-slate-700">
                <CheckCircle2
                  size={18}
                  className="mt-1 shrink-0 text-emerald-600"
                />
                <span className="leading-7">{goal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="text-[#0f766e]" />
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-[#0f766e]">
                Step 1 · Concept
              </p>
              <h2 className="mt-1 text-xl font-black text-[#142f4b]">
                개념의 범위와 정의
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 text-[15px] leading-8 text-slate-700">
            {lesson.conceptDefinition.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border-l-4 border-[#0f766e] bg-[#edf8f5] p-5">
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#0f766e]">
              한 줄 암기
            </p>
            <p className="mt-2 font-black leading-7 text-[#142f4b]">
              {lesson.memoryLine}
            </p>
          </div>
        </section>

        <section className="mt-6 card overflow-hidden">
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Workflow className="text-[#0f766e]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[.15em] text-[#0f766e]">
                  Concept map
                </p>
                <h2 className="mt-1 text-xl font-black text-[#142f4b]">
                  문제에서 판단하는 순서
                </h2>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8">
            {lesson.decisionSteps.map((step, stepIndex) => (
              <div
                key={step.label}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-[#142f4b] text-sm font-black text-white">
                  {stepIndex + 1}
                </span>
                <h3 className="mt-4 font-black text-[#142f4b]">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
                {stepIndex < lesson.decisionSteps.length - 1 ? (
                  <ArrowRight className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 text-[#0f766e] sm:block" />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="text-amber-600" />
            <h2 className="text-xl font-black text-[#142f4b]">핵심 정리</h2>
          </div>
          <ol className="mt-6 grid gap-4">
            {lesson.keyPoints.map((point, pointIndex) => (
              <li
                key={point}
                className="flex items-start gap-4 rounded-xl bg-slate-50 p-4"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#142f4b] text-sm font-black text-white">
                  {pointIndex + 1}
                </span>
                <span className="pt-0.5 leading-7 text-slate-700">{point}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 card overflow-hidden">
          <div className="flex items-center gap-3 p-6 sm:p-8">
            <Scale className="text-blue-700" />
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-blue-700">
                Compare
              </p>
              <h2 className="mt-1 text-xl font-black text-[#142f4b]">
                개념별 역할과 차이
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#173957] text-white">
                <tr>
                  <th className="px-5 py-4">구분</th>
                  <th className="px-5 py-4">핵심 기준</th>
                  <th className="px-5 py-4">언제 쓰는가</th>
                  <th className="px-5 py-4">실제 함정</th>
                </tr>
              </thead>
              <tbody>
                {lesson.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-200 align-top">
                    <th className="bg-slate-50 px-5 py-5 font-black text-[#142f4b]">
                      {row.label}
                    </th>
                    <td className="px-5 py-5 leading-6 text-slate-700">{row.core}</td>
                    <td className="px-5 py-5 leading-6 text-slate-700">{row.use}</td>
                    <td className="px-5 py-5 leading-6 text-slate-700">{row.trap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ListChecks className="text-[#0f766e]" />
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-[#0f766e]">
                Exam checklist
              </p>
              <h2 className="mt-1 text-xl font-black text-[#142f4b]">
                시험장에서 확인할 것
              </h2>
            </div>
          </div>
          <ol className="mt-6 grid gap-3">
            {lesson.examChecklist.map((item, itemIndex) => (
              <li
                key={item}
                className="flex items-center gap-4 rounded-xl bg-[#edf8f5] p-4"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0f766e] text-sm font-black text-white">
                  {itemIndex + 1}
                </span>
                <span className="font-bold leading-7 text-[#142f4b]">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="exam-traps"
          className="mt-6 scroll-mt-32 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <TriangleAlert className="text-amber-700" />
            <h2 className="text-xl font-black text-amber-950">시험 함정</h2>
          </div>
          <ul className="mt-5 grid gap-3">
            {lesson.examTraps.map((trap) => (
              <li key={trap} className="flex items-start gap-3 text-amber-950">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-600" />
                <span className="leading-7">{trap}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl bg-[#173957] p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-teal-200" />
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-teal-200">
                Step 3 · Exam practice
              </p>
              <h2 className="mt-1 text-xl font-black">이 개념을 문제로 확인</h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
            개념과 판단 기준을 확인했다면 정답이 노출되지 않은 상태에서 직접
            선택하고, 제출 뒤 선택지별 근거와 오답 원인을 확인하세요.
          </p>
          <BdaLinkedPracticeSet
            verifiedQuestions={verifiedQuestions}
            learningItems={learningItems}
            heldLearningCount={heldLearningCount}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[.15em] text-slate-500">
            Source & review
          </p>
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-[#142f4b]">
                {lesson.sourceRefs[0].label}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                사용자 제공 · 근거등급 {lesson.sourceRefs[0].evidenceGrade} ·
                검토 {lesson.sourceRefs[0].reviewedAt}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              원천 URL 비공개 · 사이트 이관본 기준
            </span>
          </div>
        </section>

        <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="레슨 이동">
          {previous ? (
            <Link
              href={`/bda/written/theory/${previous.id}`}
              className="card flex items-center gap-3 p-4 font-bold text-slate-700"
            >
              <ArrowLeft size={17} />
              <span>
                <small className="block text-slate-400">이전 레슨</small>
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/bda/written/theory/${next.id}`}
              className="card flex items-center justify-end gap-3 p-4 text-right font-bold text-slate-700"
            >
              <span>
                <small className="block text-slate-400">다음 레슨</small>
                {next.title}
              </span>
              <ArrowRight size={17} />
            </Link>
          ) : null}
        </nav>
      </article>
    </main>
  );
}
