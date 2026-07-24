import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { getBdaContent } from "@/lib/content/bda-repository";

export const metadata: Metadata = { title: "필기 이론" };

export default function BdaTheoryPage() {
  const content = getBdaContent();

  return (
    <main className="page-wrap pb-16">
      <header className="py-10 sm:py-14">
        <p className="eyebrow">Theory map</p>
        <h1 className="mt-3 text-4xl font-black text-[#142f4b]">필기 이론</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Notion 최종본의 큰 흐름을 20개 핵심 레슨으로 압축했습니다. 각
          레슨에는 학습목표, 핵심정리, 시험 함정과 원자료 링크가 있습니다.
        </p>
      </header>

      <div className="grid gap-8">
        {content.subjects.map((subject) => {
          const lessons = content.lessons
            .filter((item) => item.subjectId === subject.id)
            .sort((a, b) => a.order - b.order);
          return (
            <section
              key={subject.id}
              id={subject.id}
              className="card scroll-mt-32 overflow-hidden"
            >
              <header
                className="border-b border-slate-200 p-6 text-white sm:p-8"
                style={{ backgroundColor: subject.accent }}
              >
                <p className="text-sm font-black text-white/75">
                  제{subject.order}과목
                </p>
                <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-2xl font-black">{subject.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                      {subject.description}
                    </p>
                  </div>
                  <a
                    href={subject.sourceRefs[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold"
                  >
                    Notion 원자료 <ExternalLink size={15} />
                  </a>
                </div>
              </header>
              <ol className="divide-y divide-slate-200">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/bda/written/theory/${lesson.id}`}
                      className="group flex items-start gap-4 p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
                        style={{ backgroundColor: subject.accent }}
                      >
                        {lesson.order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-lg text-[#142f4b]">
                          {lesson.title}
                        </strong>
                        <span className="mt-2 block text-sm leading-6 text-slate-600">
                          {lesson.summary}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-1.5">
                          {lesson.relatedTerms.slice(0, 3).map((term) => (
                            <span
                              key={term}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                            >
                              {term}
                            </span>
                          ))}
                        </span>
                      </span>
                      <ArrowRight className="mt-2 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <BookOpen className="mt-0.5 shrink-0 text-blue-700" />
        <p className="text-sm leading-6 text-blue-950">
          이 페이지는 원자료 전체를 복제한 교재가 아니라 학습 순서를 만드는
          1차 구조화본입니다. 세부 표·예시·공식은 원자료 대조 후 점진적으로
          보강합니다.
        </p>
      </div>
    </main>
  );
}
