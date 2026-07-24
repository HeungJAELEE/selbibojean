import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { ContentRoleBadge } from "@/components/content-role-badge";
import { PageHeading } from "@/components/page-heading";
import { PracticalLabelBadges } from "@/components/practical-label-badges";
import { getContent } from "@/lib/content/repository";
import {
  getPracticalContent,
  isPublishablePracticalQuestion,
} from "@/lib/content/practical-repository";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const [content, practical] = await Promise.all([
    getContent(),
    getPracticalContent(),
  ]);
  const lessons = query
    ? content.lessons
        .filter(
          (lesson) =>
            isPublishableLesson(lesson) &&
            `${lesson.title} ${lesson.aliases.join(" ")} ${lesson.blocks
              .map((block) => block.body)
              .join(" ")}`
              .toLowerCase()
              .includes(query),
        )
        .slice(0, 30)
    : [];
  const questions = query
    ? content.questions
        .filter(
          (question) =>
            isPublishableQuestion(question) &&
            question.stem.toLowerCase().includes(query),
        )
        .slice(0, 30)
    : [];
  const practicalConcepts = query
    ? practical.concepts
        .filter((concept) =>
          `${concept.title} ${concept.definition} ${concept.principle} ${concept.requiredKeywords.join(" ")}`
            .toLowerCase()
            .includes(query),
        )
        .slice(0, 30)
    : [];
  const practicalQuestions = query
    ? practical.questions
        .filter(
          (question) =>
            isPublishablePracticalQuestion(question) &&
            `${question.title} ${question.stem}`.toLowerCase().includes(query),
        )
        .slice(0, 30)
    : [];

  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="Search"
        title="통합 검색"
        description="공개 완료된 필기 이론·문제와 실기 개념·문제만 검색합니다. 보류 콘텐츠는 결과에서 제외됩니다."
      />
      <form className="card flex gap-3 p-4">
        <Search className="ml-2 self-center text-slate-400" />
        <input
          name="q"
          defaultValue={q}
          className="min-w-0 flex-1 bg-transparent p-2 outline-none"
          placeholder="예: 베어링, LOTO, 어큐뮬레이터, MTBF"
          autoFocus
        />
        <button className="rounded-xl bg-[#173957] px-5 py-3 font-bold text-white">
          검색
        </button>
      </form>
      {query ? (
        <div className="mt-8 grid gap-7 md:grid-cols-2">
          <Results title={`필기 이론 ${lessons.length}건`}>
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/written/theory/${lesson.id}`}
                className="block border-b border-slate-100 py-4"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <strong>{lesson.title}</strong>
                  <ContentRoleBadge contentRole={lesson.contentRole} />
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-slate-500">
                  {lesson.summary.join(" ")}
                </span>
              </Link>
            ))}
          </Results>
          <Results title={`필기 문제 ${questions.length}건`}>
            {questions.map((question) => (
              <Link
                key={question.id}
                href={`/written/practice/${question.id}`}
                className="block border-b border-slate-100 py-4"
              >
                <strong className="text-[#16697a]">{question.id}</strong>
                <span className="mt-1 line-clamp-2 block text-sm text-slate-500">
                  {question.stem}
                </span>
              </Link>
            ))}
          </Results>
          <Results title={`실기 개념 ${practicalConcepts.length}건`}>
            {practicalConcepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/practical/written/theory/${concept.id}`}
                className="block border-b border-slate-100 py-4"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <strong>{concept.title}</strong>
                  <PracticalLabelBadges labels={concept.labels} />
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-slate-500">
                  {concept.definition}
                </span>
              </Link>
            ))}
          </Results>
          <Results title={`실기 문제 ${practicalQuestions.length}건`}>
            {practicalQuestions.map((question) => (
              <Link
                key={question.id}
                href={`/practical/written/question/${question.id}`}
                className="block border-b border-slate-100 py-4"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="text-[#16697a]">{question.title}</strong>
                  <PracticalLabelBadges labels={[question.label]} />
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-slate-500">
                  {question.stem}
                </span>
              </Link>
            ))}
          </Results>
        </div>
      ) : null}
    </div>
  );
}

function Results({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="font-extrabold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
