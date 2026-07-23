import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  GitCompareArrows,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { LessonPracticeSet, type LessonPracticeItem } from "@/components/lesson-practice-set";
import { MarkdownContent } from "@/components/markdown-content";
import { PastExamExamples } from "@/components/past-exam-examples";
import { QuestionTrapReview } from "@/components/question-trap-review";
import {
  getLessonFamily,
  getLessonFamilyHref,
  isPidFamily,
  type LessonFamily,
} from "@/lib/content/lesson-families";
import { getPastExamExamplesForLessons } from "@/lib/content/past-exam-examples";
import { getContent } from "@/lib/content/repository";
import { isPublishableQuestion } from "@/lib/domain/practice";

type FamilyParams = {
  groupId: string;
  familyId: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<FamilyParams>;
}): Promise<Metadata> {
  const { groupId, familyId } = await params;
  const content = await getContent();
  const family = getLessonFamily(content, groupId, familyId);
  return { title: family ? `${family.label} 통합 레슨` : "통합 레슨" };
}

export default async function LessonFamilyPage({
  params,
}: {
  params: Promise<FamilyParams>;
}) {
  const { groupId, familyId } = await params;
  const content = await getContent();
  const family = getLessonFamily(content, groupId, familyId);
  if (!family) notFound();

  const group = content.conceptGroups.find((candidate) => candidate.id === groupId);
  const subject = content.subjects.find((candidate) => candidate.id === group?.subjectId);
  if (!group || !subject) notFound();

  const lessonIds = family.lessons.map((lesson) => lesson.id);
  const pastExamExamples = getPastExamExamplesForLessons(content, lessonIds);
  const practiceQuestions = selectFamilyPracticeQuestions(content, family, 3);
  const pid = isPidFamily(groupId, familyId);

  return (
    <div className="page-wrap grid gap-8 py-10 lg:grid-cols-[230px_1fr_260px]">
      <aside className="hidden h-fit lg:block">
        <Link href="/written/theory" className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <ArrowLeft size={16} /> 이론 목차
        </Link>
        <nav className="mt-7 border-l border-slate-200 pl-4" aria-label="통합 레슨 내부 목차">
          <a href="#related-terms" className="block py-2 text-sm font-bold text-[#16697a]">1. 관련 용어</a>
          <a href="#umbrella" className="block py-2 text-sm font-bold text-[#16697a]">2. 포괄 개념·원리</a>
          <a href="#comparison" className="block py-2 text-sm font-bold text-[#16697a]">3. 개념별 차이</a>
          <a href="#field-application" className="block py-2 text-sm font-bold text-[#16697a]">4. 실무 적용</a>
          <a href="#question-traps" className="block py-2 text-sm font-bold text-[#16697a]">5. 실제 문항 함정</a>
          <a href="#detail-lessons" className="block py-2 text-sm font-bold text-[#16697a]">6. 세부 개념</a>
          {pastExamExamples.length > 0 && <a href="#past-exams" className="block py-2 text-sm font-bold text-[#16697a]">7. 실제 기출 원문</a>}
          {practiceQuestions.length > 0 && <a href="#practice-set" className="block py-2 text-sm font-bold text-[#16697a]">8. 실전 유사 문제</a>}
        </nav>
      </aside>

      <article className="card p-6 md:p-10">
        <p className="eyebrow">제{subject.code}과목 · {group.title}</p>
        <h1 className="display mt-4 text-4xl font-bold md:text-5xl">{family.label}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
          흩어진 {family.lessons.length}개 세부 개념을 하나의 판단 흐름으로 묶었습니다.
          용어를 먼저 비교한 뒤 원리, 현장 상황, 실제 문항 순서로 학습합니다.
        </p>

        <section id="related-terms" className="mt-8 scroll-mt-28">
          <SectionTitle icon={<BookOpenCheck size={19} />} eyebrow="Start here" title="관련 용어·유사 용어 먼저 보기" />
          <div className="mt-4 flex flex-wrap gap-2">
            {family.relatedTerms.map((term) => (
              <span key={term} className="rounded-full border border-[#b9d9d7] bg-[#f2fbfa] px-3 py-2 text-sm font-extrabold text-[#16697a]">
                {term}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            같은 묶음에 있다는 것은 서로 바꾸어 쓸 수 있다는 뜻이 아닙니다. 각 용어가 무엇을 입력으로 보고,
            어떤 효과와 부작용을 만드는지 아래에서 분리합니다.
          </p>
        </section>

        <section id="umbrella" className="mt-10 scroll-mt-28">
          <SectionTitle icon={<Lightbulb size={19} />} eyebrow="Big picture" title="포괄 개념과 작동 원리" />
          <div className="prose-learning mt-4 rounded-2xl bg-[#eaf7f6] p-5 md:p-6">
            <h3 className="!mt-0">이 묶음이 다루는 범위</h3>
            <MarkdownContent content={family.scope} />
            <h3>작동 원리</h3>
            <MarkdownContent content={family.mechanism} />
          </div>
        </section>

        <section id="comparison" className="mt-10 scroll-mt-28">
          <SectionTitle icon={<GitCompareArrows size={19} />} eyebrow="Compare" title="개념별 역할과 차이" />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead className="bg-[#173957] text-white">
                <tr>
                  <th className="px-4 py-3">구분</th>
                  <th className="px-4 py-3">무엇을 보는가</th>
                  <th className="px-4 py-3">역할</th>
                  <th className="px-4 py-3">주요 효과</th>
                  <th className="px-4 py-3">주의점</th>
                </tr>
              </thead>
              <tbody>
                {family.comparison.map((item) => (
                  <tr key={item.term} className="border-t border-slate-200 align-top">
                    <th className="bg-slate-50 px-4 py-4 font-extrabold text-[#173957]">{item.term}</th>
                    <td className="px-4 py-4 leading-6">{item.input}</td>
                    <td className="px-4 py-4 leading-6">{item.role}</td>
                    <td className="px-4 py-4 leading-6">{item.effect}</td>
                    <td className="px-4 py-4 leading-6 text-slate-600">{item.caution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="field-application" className="mt-10 scroll-mt-28">
          <SectionTitle icon={<Wrench size={19} />} eyebrow="Field application" title="증상에서 출발하는 실무 적용" />
          {family.fieldCases.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {family.fieldCases.map((item, index) => (
                <article key={item.focus} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-[#8f3f0a] text-xs font-black text-white">{index + 1}</span>
                    <h3 className="font-extrabold text-[#173957]">{item.issue}</h3>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm leading-6 md:grid-cols-[110px_1fr]">
                    <dt className="font-extrabold text-[#16697a]">우선 검토</dt>
                    <dd>{item.focus}</dd>
                    <dt className="font-extrabold text-[#16697a]">확인·조정</dt>
                    <dd>{item.action}</dd>
                    <dt className="font-extrabold text-[#16697a]">주의</dt>
                    <dd className="text-slate-600">{item.caution}</dd>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {family.decisionSteps.map((step, index) => (
                <article key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="grid size-7 place-items-center rounded-full bg-[#16697a] text-xs font-black text-white">{index + 1}</span>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#173957]">{step}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <QuestionTrapReview questions={family.trapQuestions} pid={pid} />

        <section id="detail-lessons" className="mt-10 scroll-mt-28">
          <SectionTitle icon={<CheckCircle2 size={19} />} eyebrow="Deep dive" title="세부 개념으로 들어가기" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {family.lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/written/theory/${lesson.id}`}
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-[#6fb5b1] hover:bg-[#f2fbfa]"
              >
                <span className="font-extrabold text-[#173957]">{lesson.title}</span>
                <span className="mt-2 line-clamp-2 block text-sm leading-6 text-slate-600">{lesson.summary[0]}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#16697a]">
                  정의·공식·세부 근거 보기 <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <PastExamExamples examples={pastExamExamples} />
        <LessonPracticeSet questions={practiceQuestions} />
      </article>

      <aside className="card h-fit p-5">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="text-[#16697a]" size={19} />
          <h2 className="font-extrabold">통합 학습 묶음</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          세부 개념 {family.lessons.length}개, 실제 문항 함정 {family.trapQuestions.length}개,
          실제 기출 원문 {pastExamExamples.length}개를 한 흐름으로 연결합니다.
        </p>
        <Link
          href={getLessonFamilyHref(groupId, familyId)}
          aria-current="page"
          className="mt-4 block rounded-xl bg-[#eaf7f6] px-4 py-3 text-sm font-extrabold text-[#16697a]"
        >
          {family.label}
        </Link>
      </aside>
    </div>
  );
}

function SectionTitle({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#173957] text-white">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-extrabold text-[#173957]">{title}</h2>
      </div>
    </div>
  );
}

function selectFamilyPracticeQuestions(
  content: Awaited<ReturnType<typeof getContent>>,
  family: LessonFamily,
  limit: number,
): LessonPracticeItem[] {
  const lessonIds = new Set(family.lessons.map((lesson) => lesson.id));
  const preferred = family.trapQuestions;
  const remaining = content.questions.filter(
    (question) =>
      lessonIds.has(question.lessonId)
      && isPublishableQuestion(question)
      && !preferred.some((candidate) => candidate.id === question.id),
  );

  return [...preferred, ...remaining].slice(0, limit).map((question) => ({
    id: question.id,
    stem: question.stem,
    scope: "lesson",
  }));
}
