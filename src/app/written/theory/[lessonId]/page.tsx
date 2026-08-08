import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpenCheck, RotateCcw } from "lucide-react";
import { ConceptVisualAid } from "@/components/concept-visual-aid";
import { ContentRoleBadge } from "@/components/content-role-badge";
import { LessonExamTypes } from "@/components/lesson-exam-types";
import { LessonPracticeSet, type LessonPracticeItem } from "@/components/lesson-practice-set";
import { MarkdownContent } from "@/components/markdown-content";
import { PastExamExamples } from "@/components/past-exam-examples";
import { QuestionTrapReview } from "@/components/question-trap-review";
import { SupplementalVisualAid } from "@/components/supplemental-visual-aid";
import { WrittenLessonVisuals } from "@/components/written-lesson-visuals";
import {
  getLessonFamilyForLesson,
  getLessonTrapQuestions,
  isPidFamily,
} from "@/lib/content/lesson-families";
import {
  getPastExamExamples,
  getPastExamPatternSummary,
} from "@/lib/content/past-exam-examples";
import { getContent, getLesson } from "@/lib/content/repository";
import { getConceptGroup, getSubject } from "@/lib/domain/catalog";
import {
  isPublishableLesson,
  isPublishableQuestion,
  safePracticeReturnTo,
  toPublicQuestion,
} from "@/lib/domain/practice";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);
  return {
    title:
      lesson && isPublishableLesson(lesson)
        ? `${lesson.title} | 설비보전기사 마스터북`
        : "이론 레슨",
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);
  const lesson = await getLesson(lessonId);
  if (!lesson || !isPublishableLesson(lesson)) notFound();
  const returnTo = safePracticeReturnTo(query.returnTo);

  const content = await getContent();
  const subject = getSubject(lesson.subjectId);
  const group = getConceptGroup(lesson.conceptGroupId);
  const pastExamExamples = getPastExamExamples(content, lesson.id, 5);
  const practiceQuestions = selectPracticeQuestions(
    content,
    lesson.id,
    lesson.relatedQuestionIds,
    5,
  );
  const examPatternSummary = getPastExamPatternSummary(content, lesson.id);
  const authoredExamPoints = getAuthoredExamPoints(lesson);
  const family = getLessonFamilyForLesson(content, lesson.id);
  const useFamilyProcessVisual =
    family?.groupId === "s2-g02" && family.id === "process";
  const trapQuestions = getLessonTrapQuestions(content, lesson.id, 3);
  const definition = getDefinition(lesson);
  const principleKinds = lesson.id.startsWith("lesson-welding-process-")
    || lesson.title === "CO₂ 아크용접"
    ? ["principle", "structure", "selection", "diagnosis", "formula", "pros_cons", "safety"]
    : ["principle", "selection", "formula", "pros_cons", "safety"];
  const principleBlocks = lesson.blocks.filter((block) =>
    principleKinds.includes(block.kind),
  );

  return (
    <div className="page-wrap grid gap-8 py-10 lg:grid-cols-[240px_1fr_260px]">
      <aside className="hidden h-fit lg:block" aria-label="이론 목차 탐색">
        <Link href="/written/theory" className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <ArrowLeft size={16} /> 이론 목차
        </Link>
        <nav className="mt-7 border-l border-slate-200 pl-4" aria-label="레슨 내부 목차">
          <a href="#definition" className="block py-2 text-sm font-bold text-[#16697a]">1. 정의</a>
          <a href="#written-lesson-visuals-title" className="block py-2 text-sm font-bold text-[#16697a]">2. 그림·도해</a>
          <a href="#principle" className="block py-2 text-sm font-bold text-[#16697a]">3. 이해 배경</a>
          <a href="#exam-types" className="block py-2 text-sm font-bold text-[#16697a]">4. 자주 출제되는 유형</a>
          {pastExamExamples.length > 0 && (
            <a href="#past-exams" className="block py-2 text-sm font-bold text-[#16697a]">5. CBT 기출</a>
          )}
          {trapQuestions.length > 0 && (
            <a href="#question-traps" className="block py-2 text-sm font-bold text-[#16697a]">6. 시험 함정</a>
          )}
          {practiceQuestions.length > 0 && (
            <a href="#practice-set" className="block py-2 text-sm font-bold text-[#16697a]">7. 실전 유사 문제</a>
          )}
        </nav>
      </aside>

      <article className="card min-w-0 p-6 md:p-10">
        <Link href="/written/theory" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 lg:hidden">
          <ArrowLeft size={16} /> 이론 목차
        </Link>
        <p className="eyebrow">제{subject?.code}과목 · {group?.title}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="display break-words text-4xl font-bold [overflow-wrap:anywhere] md:text-5xl">
            {lesson.title}
          </h1>
          <ContentRoleBadge contentRole={lesson.contentRole} className="px-3 py-1 text-xs" />
        </div>

        {lesson.id.startsWith("welding-safety-b33-") && (
          <figure className="mt-7 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
            <Image
              src="/images/welding-safety/welding-safety-overview.png"
              alt="용접기 전원 격리, 가스용기 고정, 화재감시, 국소배기, 보호구, 밀폐공간 감시를 여섯 장면으로 정리한 용접 안전 그림"
              width={1536}
              height={1024}
              className="h-auto w-full"
              priority={false}
            />
            <figcaption className="px-4 py-3 text-sm leading-6 text-amber-950">
              용접 안전은 한 가지 보호구가 아니라 전원 격리, 가스설비 점검, 화재감시,
              발생원 환기, 개인보호구와 밀폐공간 감시를 함께 적용해야 합니다.
            </figcaption>
          </figure>
        )}

        <section
          id="definition"
          className="min-w-0 max-w-full overflow-hidden scroll-mt-28"
        >
          <p className="mt-9 text-xs font-black uppercase tracking-[.14em] text-[#16697a]">Step 1 · Definition</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">정의</h2>
          <div className="mt-4 rounded-2xl border-l-4 border-[#16697a] bg-[#eaf7f6] p-5">
            <MarkdownContent content={definition} compact />
          </div>
        </section>

        {lesson.visualAidId && (
          <SupplementalVisualAid visualAidId={lesson.visualAidId} />
        )}
        {useFamilyProcessVisual ? (
          <section
            id="written-lesson-visuals-title"
            className="mt-7 scroll-mt-28"
            data-testid="written-lesson-visuals"
          >
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">
              Visual learning
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#173957]">
              그림·표로 공정 차이 먼저 이해하기
            </h2>
            <ConceptVisualAid family={family} />
          </section>
        ) : (
          <WrittenLessonVisuals lesson={lesson} />
        )}

        <section id="principle" className="mt-9 scroll-mt-28">
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">Step 2 · Background</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">정의를 이해하기 위한 배경</h2>
          <div className="prose-learning mt-4">
            {principleBlocks.map((block) => (
              <section key={block.id}>
                <h3>{normalizePrincipleTitle(block.title)}</h3>
                <MarkdownContent content={cleanPrincipleBody(block.body)} />
              </section>
            ))}
            {principleBlocks.length === 0 && (
              <p className="text-sm leading-7 text-slate-700">{lesson.summary[1] ?? lesson.summary[0]}</p>
            )}
          </div>
        </section>

        <LessonExamTypes
          summary={examPatternSummary}
          authoredPoints={authoredExamPoints}
        />
        <PastExamExamples examples={pastExamExamples} initialCount={5} />
        <QuestionTrapReview
          questions={trapQuestions}
          pid={Boolean(family && isPidFamily(family.groupId, family.id))}
        />
        <LessonPracticeSet questions={practiceQuestions} />

        {returnTo && (
          <Link
            href={returnTo}
            className="mt-10 flex items-center justify-center gap-2 rounded-xl bg-[#8f3f0a] px-5 py-4 font-extrabold text-white"
          >
            <RotateCcw size={18} /> 문제로 돌아가 정답 숨기고 재도전
          </Link>
        )}
      </article>

      <aside className="card h-fit p-5" aria-label="레슨 학습 정보">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="text-[#16697a]" size={19} />
          <h2 className="font-extrabold">이 레슨 학습 순서</h2>
        </div>
        <ol className="mt-4 grid gap-3 text-sm">
          <LearningStep number="1" title="정의와 이해 배경" text="정의, 그림·도해와 실제 용도·작동 배경을 먼저 확인합니다." />
          <LearningStep number="2" title="CBT 기출" text={`${pastExamExamples.length}개 CBT 원문에서 개념의 출제 방식을 확인합니다.`} />
          <LearningStep number="3" title="시험 함정" text={`${trapQuestions.length}개 문제를 정답 노출 없이 먼저 판단합니다.`} />
          <LearningStep number="4" title="실전 유사 문제" text={`${practiceQuestions.length}개 문제를 직접 풀고 채점합니다.`} />
        </ol>
      </aside>
    </div>
  );
}

function getDefinition(lesson: Awaited<ReturnType<typeof getLesson>>) {
  if (!lesson) return "";
  const authoredDefinition = lesson.blocks.find(
    (block) => block.kind === "definition" && block.title !== "개념의 범위와 정의",
  );
  if (authoredDefinition) return authoredDefinition.body;
  return lesson.summary[0]
    ?? lesson.blocks.find((block) => block.kind === "definition")?.body
    ?? "";
}

function getAuthoredExamPoints(
  lesson: NonNullable<Awaited<ReturnType<typeof getLesson>>>,
) {
  return lesson.blocks.filter(
    (block) =>
      block.kind === "exam_point"
      && !["시험에서 판단하는 순서", "한 줄 암기"].includes(block.title),
  );
}

function cleanPrincipleBody(body: string) {
  return body.split(/\n\n\*\*이 문제군의 직접 근거\*\*/u)[0].trim();
}

function normalizePrincipleTitle(title: string) {
  return title === "작동 원리와 판단 기준"
    ? "정의를 이해하기 위한 배경"
    : title;
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
  relatedQuestionIds: string[],
  limit: number,
): LessonPracticeItem[] {
  const publicQuestions = content.questions.filter(isPublishableQuestion);
  const direct = publicQuestions.filter(
    (question) => question.lessonId === lessonId || relatedQuestionIds.includes(question.id),
  );

  return direct
    .slice(0, limit)
    .map(toPublicQuestion);
}
