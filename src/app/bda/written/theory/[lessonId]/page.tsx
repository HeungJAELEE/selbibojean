import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Target,
  TriangleAlert,
} from "lucide-react";
import {
  getBdaContent,
  getBdaLesson,
  getBdaSubject,
} from "@/lib/content/bda-repository";

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
  const firstQuestionId = lesson.questionIds[0];

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
            <a
              href={lesson.sourceRefs[0].url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e]"
            >
              Notion 원자료 <ExternalLink size={15} />
            </a>
          </div>
        </section>

        {firstQuestionId ? (
          <Link
            href={`/bda/written/practice/${firstQuestionId}`}
            className="mt-6 flex items-center justify-between rounded-2xl bg-[#0f766e] p-5 font-black text-white"
          >
            이 개념 문제로 확인하기 <ArrowRight />
          </Link>
        ) : null}

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
