import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { ContentRoleBadge } from "@/components/content-role-badge";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import { isPublishableLesson, isPublishableQuestion } from "@/lib/domain/practice";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const content = await getContent();
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

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Search"
        title="통합 검색"
        description="검수 후 공개된 이론과 문제만 검색합니다. 보강용 이론은 검색되지만 기출 통계에는 포함하지 않습니다."
      />
      <form className="card flex gap-3 p-4">
        <Search className="ml-2 self-center text-slate-400" />
        <input
          name="q"
          defaultValue={q}
          className="min-w-0 flex-1 bg-transparent p-2 outline-none"
          placeholder="예: 캐비테이션, MTBF, 미터아웃"
          autoFocus
        />
        <button className="rounded-xl bg-[#173957] px-5 py-3 font-bold text-white">검색</button>
      </form>
      {query && (
        <div className="mt-8 grid gap-7 md:grid-cols-2">
          <Results title={`이론 ${lessons.length}건`}>
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
          <Results title={`문제 ${questions.length}건`}>
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
        </div>
      )}
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
