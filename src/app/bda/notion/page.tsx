import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  FileStack,
  Link2,
} from "lucide-react";
import {
  BDA_NOTION_HUB_URL,
  bdaNotionModules,
  bdaNotionPracticeQuestions,
  bdaNotionSourcePages,
} from "@/data/source/bda-notion-library";
import { getBdaContent } from "@/lib/content/bda-repository";

export const metadata: Metadata = {
  title: "Notion 보강 이론 지도",
  description:
    "사용자 제공 Notion 하위 페이지의 내용을 빅데이터분석기사 개념·이론·자체 제작 확인문제와 연결한 학습 지도입니다.",
};

const revisionLabel = {
  final: "최종본",
  current: "정리본",
  integration: "통합 이력",
} as const;

const revisionClass = {
  final: "bg-emerald-100 text-emerald-800",
  current: "bg-sky-100 text-sky-800",
  integration: "bg-slate-100 text-slate-700",
} as const;

export default function BdaNotionLibraryPage() {
  const content = getBdaContent();

  return (
    <main className="page-wrap pb-16 pt-8">
      <header className="overflow-hidden rounded-3xl bg-[#173957] p-7 text-white shadow-[0_16px_42px_rgb(18_38_58_/_0.16)] sm:p-10">
        <p className="text-xs font-black tracking-[.16em] text-teal-200">
          USER-PROVIDED NOTION LIBRARY
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-3xl font-black sm:text-5xl">Notion 보강 이론 지도</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-100">
              사용자 제공 학습 허브의 하위 페이지를 모두 출처로 보존하고, 중복된 통합본은
              하나의 학습 모듈로 정리했습니다. 각 모듈에서 40개 개념, 상세 이론, 자체 제작
              확인문제로 바로 이동할 수 있습니다.
            </p>
          </div>
          <a
            href={BDA_NOTION_HUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-black text-[#102d47] hover:bg-teal-200"
          >
            원천 허브 열기 <ExternalLink size={16} />
          </a>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Stat value={bdaNotionSourcePages.length} label="하위 페이지 출처" />
          <Stat value={bdaNotionModules.length} label="중복 제거 학습 모듈" />
          <Stat value={bdaNotionPracticeQuestions.length} label="추가 확인문제" />
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-5 sm:p-6">
        <div className="flex gap-3">
          <Link2 className="mt-0.5 shrink-0 text-teal-700" size={20} />
          <div>
            <h2 className="font-black text-teal-950">연결 원칙</h2>
            <p className="mt-2 text-sm leading-7 text-teal-950">
              Notion 원천은 <strong>user_provided</strong> 출처로 관리합니다. 확인문제는 원문을
              복제하지 않은 <strong>self_authored</strong> 문제이며, 답안과 해설은 제출 후에만
              제공됩니다. 최종본은 학습 모듈의 기준으로, 이전 통합본은 누락 확인용 근거로 유지합니다.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-9">
        {content.subjects.map((subject) => {
          const modules = bdaNotionModules.filter((module) => module.subjectId === subject.id);
          const sourcePages = bdaNotionSourcePages.filter((source) => source.subjectId === subject.id);

          return (
            <section key={subject.id} className="card overflow-hidden">
              <header className="p-6 text-white sm:p-8" style={{ backgroundColor: subject.accent }}>
                <p className="text-xs font-black tracking-[.14em] text-white/75">SUBJECT {subject.order}</p>
                <h2 className="mt-2 text-2xl font-black">{subject.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/85">{subject.description}</p>
              </header>

              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_.34fr]">
                <div className="grid gap-4">
                  {modules.map((module) => {
                    const source = bdaNotionSourcePages.find((item) => item.id === module.sourcePageId);
                    return (
                      <article id={module.id} key={module.id} className="scroll-mt-24 rounded-2xl border border-slate-200 p-5">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[.12em] text-[#0f766e]">Notion module</p>
                            <h3 className="mt-1 text-xl font-black text-[#142f4b]">{module.title}</h3>
                          </div>
                          <a
                            href={source?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-black text-slate-600 hover:text-[#0f766e] hover:underline"
                          >
                            {source?.title} <ExternalLink size={14} />
                          </a>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{module.summary}</p>
                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] font-black uppercase tracking-[.12em] text-slate-500">원천 단락</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{module.sourceSections.join(" · ")}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {module.conceptIds.map((conceptId) => (
                            <Link
                              key={conceptId}
                              href={`/bda/concepts/${conceptId}`}
                              className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-900 hover:bg-teal-100"
                            >
                              {conceptId} 개념 보기
                            </Link>
                          ))}
                          <Link
                            href={`/bda/written/theory/${module.lessonId}`}
                            className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-900 hover:bg-blue-100"
                          >
                            연결 이론
                          </Link>
                          {module.questionIds.map((questionId) => (
                            <Link
                              key={questionId}
                              href={`/bda/written/practice/${questionId}`}
                              className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100"
                            >
                              확인문제
                            </Link>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <aside className="rounded-2xl bg-slate-50 p-5">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-slate-500">
                    <FileStack size={15} /> Source pages
                  </p>
                  <ul className="mt-4 grid gap-3">
                    {sourcePages.map((source) => (
                      <li key={source.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-black ${revisionClass[source.revision]}`}>
                            {revisionLabel[source.revision]}
                          </span>
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0f766e]">
                            <ExternalLink size={15} />
                          </a>
                        </div>
                        <p className="mt-2 text-sm font-black leading-5 text-[#142f4b]">{source.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{source.use}</p>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Next step</p>
            <h2 className="mt-2 text-2xl font-black text-[#142f4b]">개념을 읽고 바로 확인하기</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              추가된 확인문제는 모두 사용자 제공 Notion 학습 범위를 바탕으로 새로 작성했습니다.
              공식 기출 원문·공식 정답으로 표시하지 않습니다.
            </p>
          </div>
          <Link href="/bda/written/practice" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173957] px-5 py-3 text-sm font-black text-white hover:bg-[#0f766e]">
            확인문제 풀기 <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <strong className="text-2xl font-black text-teal-200">{value}</strong>
      <span className="mt-1 block text-xs font-bold text-slate-100">{label}</span>
    </div>
  );
}
