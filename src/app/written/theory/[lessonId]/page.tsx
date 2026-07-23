import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, Layers3, RotateCcw } from "lucide-react";
import { LessonPracticeSet, type LessonPracticeItem } from "@/components/lesson-practice-set";
import { MarkdownContent } from "@/components/markdown-content";
import { PastExamExamples } from "@/components/past-exam-examples";
import { QuestionTrapReview } from "@/components/question-trap-review";
import {
  getLessonFamilyForLesson,
  getLessonFamilyHref,
  getLessonTrapQuestions,
  isPidFamily,
  shouldReplaceWithFamilySection,
} from "@/lib/content/lesson-families";
import { getPastExamExamples } from "@/lib/content/past-exam-examples";
import { getContent, getLesson } from "@/lib/content/repository";
import { getConceptGroup, getSubject } from "@/lib/domain/catalog";
import { isPublishableQuestion } from "@/lib/domain/practice";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);
  const lesson = await getLesson(lessonId);
  if (!lesson || lesson.contentStatus !== "published") notFound();

  const content = await getContent();
  const subject = getSubject(lesson.subjectId);
  const group = getConceptGroup(lesson.conceptGroupId);
  const pastExamExamples = getPastExamExamples(content, lesson.id);
  const practiceQuestions = selectPracticeQuestions(content, lesson.id, lesson.conceptGroupId, lesson.relatedQuestionIds, 3);
  const family = getLessonFamilyForLesson(content, lesson.id);
  const trapQuestions = getLessonTrapQuestions(content, lesson.id);
  const visibleBlocks = lesson.blocks.filter(
    (block) => block.kind !== "summary" && !shouldReplaceWithFamilySection(block),
  );

  return (
    <div className="page-wrap grid gap-8 py-10 lg:grid-cols-[240px_1fr_260px]">
      <aside className="hidden h-fit lg:block">
        <Link href="/written/theory" className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <ArrowLeft size={16} /> 이론 목차
        </Link>
        <nav className="mt-7 border-l border-slate-200 pl-4" aria-label="레슨 내부 목차">
          {family && <a href="#family" className="block py-2 text-sm font-bold text-[#16697a]">1. 관련 개념 묶음</a>}
          <a href="#concept" className="block py-2 text-sm font-bold text-[#16697a]">{family ? "2" : "1"}. 개념 이해</a>
          {visibleBlocks
            .map((block) => (
              <a key={block.id} href={`#${block.id}`} className="block py-2 pl-3 text-sm text-slate-500 hover:text-[#16697a]">
                {block.title}
              </a>
            ))}
          {trapQuestions.length > 0 && (
            <a href="#trap" className="block py-2 text-sm font-bold text-[#16697a]">문항별 함정</a>
          )}
          {pastExamExamples.length > 0 && (
            <a href="#past-exams" className="block py-2 text-sm font-bold text-[#16697a]">실제 기출 원문</a>
          )}
          {practiceQuestions.length > 0 && (
            <a href="#practice-set" className="block py-2 text-sm font-bold text-[#16697a]">실전 유사 문제</a>
          )}
        </nav>
      </aside>

      <article className="card p-6 md:p-10">
        <p className="eyebrow">제{subject?.code}과목 · {group?.title}</p>
        <h1 className="display mt-4 text-4xl font-bold md:text-5xl">{lesson.title}</h1>

        {family && (
          <section id="family" data-testid="lesson-family-overview" className="mt-7 scroll-mt-28 rounded-2xl border border-[#b9d9d7] bg-[#f2fbfa] p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#16697a] text-white">
                <Layers3 size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">Related concepts first</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#173957]">먼저 함께 구분할 용어</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {family.relatedTerms.map((term) => (
                    <span key={term} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
                      {term}
                    </span>
                  ))}
                </div>
                <Link
                  href={getLessonFamilyHref(family.groupId, family.id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#173957] px-4 py-2 text-sm font-extrabold text-white"
                >
                  {family.label} 전체를 묶어서 비교 <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section id="concept" className="scroll-mt-28">
          <p className="mt-7 text-xs font-black uppercase tracking-[.14em] text-[#16697a]">Step 1 · Concept</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">개념부터 이해하기</h2>
          <div className="mt-4 grid gap-3 rounded-2xl bg-[#eaf7f6] p-5">
            {lesson.summary.map((line, index) => (
              <p key={line} className="flex gap-3 text-sm font-semibold leading-6">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#16697a] text-xs text-white">
                  {index + 1}
                </span>
                {line}
              </p>
            ))}
          </div>
          <div className="prose-learning">
            {visibleBlocks
              .map((block) => (
                <section key={block.id}>
                  <h2 id={block.id}>{block.title}</h2>
                  <MarkdownContent content={block.body} />
                </section>
              ))}
          </div>
        </section>

        {trapQuestions.length > 0 && (
          <div id="trap" className="scroll-mt-28">
            <QuestionTrapReview
              questions={trapQuestions}
              pid={Boolean(family && isPidFamily(family.groupId, family.id))}
            />
          </div>
        )}
        <PastExamExamples examples={pastExamExamples} />
        <LessonPracticeSet questions={practiceQuestions} />

        {query.returnTo && (
          <Link
            href={query.returnTo}
            className="mt-10 flex items-center justify-center gap-2 rounded-xl bg-[#8f3f0a] px-5 py-4 font-extrabold text-white"
          >
            <RotateCcw size={18} /> 문제로 돌아가 정답 숨기고 재도전
          </Link>
        )}
      </article>

      <aside className="card h-fit p-5">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="text-[#16697a]" size={19} />
          <h2 className="font-extrabold">이 레슨 학습 순서</h2>
        </div>
        <ol className="mt-4 grid gap-3 text-sm">
          <LearningStep number="1" title="개념 이해" text="정의·원리·공식·오답 함정을 먼저 정리합니다." />
          <LearningStep number="2" title="실제 기출 원문" text={`${pastExamExamples.length}개 원문으로 CBT 표현을 확인합니다.`} />
          <LearningStep number="3" title="실전 유사 문제" text={`${practiceQuestions.length}개 문제를 직접 풀고 채점합니다.`} />
        </ol>
      </aside>
    </div>
  );
}

function LearningStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <li className="flex gap-3 rounded-xl bg-slate-50 p-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#16697a] text-xs font-black text-white">{number}</span>
      <span>
        <strong className="block text-[#173957]">{title}</strong>
        <span className="mt-1 block leading-5 text-slate-500">{text}</span>
      </span>
    </li>
  );
}

function selectPracticeQuestions(
  content: Awaited<ReturnType<typeof getContent>>,
  lessonId: string,
  conceptGroupId: string,
  relatedQuestionIds: string[],
  limit: number,
): LessonPracticeItem[] {
  const publicQuestions = content.questions.filter(isPublishableQuestion);
  const direct = publicQuestions.filter(
    (question) => question.lessonId === lessonId || relatedQuestionIds.includes(question.id),
  );
  const extended = publicQuestions.filter(
    (question) => question.conceptGroupId === conceptGroupId && !direct.some((candidate) => candidate.id === question.id),
  );

  return [...direct, ...extended].slice(0, limit).map((question) => ({
    id: question.id,
    stem: question.stem,
    scope: question.lessonId === lessonId ? "lesson" : "group",
  }));
}
