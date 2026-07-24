import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import { getBdaContent } from "@/lib/content/bda-repository";

export default function BdaHomePage() {
  const content = getBdaContent();

  return (
    <main className="pb-16">
      <section className="relative overflow-hidden bg-[#102d47] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#5eead4_0,transparent_28%),radial-gradient(circle_at_80%_10%,#60a5fa_0,transparent_25%)]" />
        <div className="page-wrap relative grid gap-10 py-14 lg:grid-cols-[1.3fr_.7fr] lg:items-center lg:py-20">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-teal-100">
                개인 학습용 BETA
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">
                Notion 이론 연동
              </span>
            </div>
            <p className="mt-7 text-sm font-black uppercase tracking-[.22em] text-teal-200">
              Big Data Analysis Engineer
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              개념을 읽고,
              <br />
              바로 문제로 확인하세요.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              정리해 둔 4과목 이론을 학습 단위로 재구성했습니다. 공식 기출을
              가장하지 않고, 출처와 검수 상태가 분명한 학습 콘텐츠부터
              확장합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/bda/written/theory"
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 py-4 font-black text-[#102d47]"
              >
                필기 이론 시작 <ArrowRight size={18} />
              </Link>
              <Link
                href="/bda/written/practice"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-4 font-black text-white"
              >
                개념 문제 풀기
              </Link>
              <Link
                href="/bda/practical"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-4 font-black text-white"
              >
                실기 코드 학습
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [content.subjects.length, "필기 과목"],
              [content.lessons.length, "핵심 레슨"],
              [content.questions.length, "검수 문제"],
              [bdaCodeLabs.length, "실기 코드 랩"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
              >
                <strong className="text-3xl font-black text-teal-200">
                  {value}
                </strong>
                <span className="mt-2 block text-sm text-slate-200">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Written subjects</p>
            <h2 className="mt-2 text-3xl font-black text-[#142f4b]">
              필기 4과목 학습 지도
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            과목마다 5개의 출발 레슨을 제공합니다. 세부 Notion 원문은 출처
            링크로 남겨 이후 전체 단원 단위로 확장할 수 있습니다.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.subjects.map((subject) => {
            const lessonCount = content.lessons.filter(
              (item) => item.subjectId === subject.id,
            ).length;
            const questionCount = content.questions.filter(
              (item) => item.subjectId === subject.id,
            ).length;
            return (
              <Link
                key={subject.id}
                href={`/bda/written/theory#${subject.id}`}
                className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="grid size-12 place-items-center rounded-xl text-xl font-black text-white"
                    style={{ backgroundColor: subject.accent }}
                  >
                    {subject.order}
                  </span>
                  <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
                </div>
                <p className="mt-5 text-xs font-black text-slate-500">
                  제{subject.order}과목
                </p>
                <h3 className="mt-1 text-xl font-black text-[#142f4b]">
                  {subject.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {subject.description}
                </p>
                <div className="mt-5 flex gap-2 text-xs font-bold">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    레슨 {lessonCount}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    문제 {questionCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-wrap">
        <div className="rounded-3xl bg-[#edf8f5] p-6 sm:p-9">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BookMarked,
                title: "이론과 문제 연결",
                text: "문제를 푼 뒤 관련 레슨의 시험 함정으로 바로 돌아갑니다.",
              },
              {
                icon: ShieldCheck,
                title: "정답 선공개 방지",
                text: "제출 전 화면과 API 응답에는 정답·해설을 포함하지 않습니다.",
              },
              {
                icon: Database,
                title: "출처·상태 관리",
                text: "사용자 제공 이론과 자체 제작 문제를 구분하고 근거등급을 기록합니다.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-5">
                <Icon className="text-[#0f766e]" />
                <h3 className="mt-4 font-black text-[#142f4b]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Sparkles className="mt-0.5 shrink-0" size={18} />
            <p>
              <strong>현재 범위:</strong> Notion 이론을 바탕으로 만든 초기
              20개 레슨과 자체 제작 8문제입니다. 대화에서 언급된 엑셀
              문제은행은 원본 파일을 확인한 뒤 별도 수입·중복검수 단계로
              연결합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="page-wrap mt-10">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <CheckCircle2 className="shrink-0 text-emerald-600" />
          <p className="text-sm leading-6 text-slate-700">
            시험 명칭과 4과목 구조는 공식 범위를 따르지만, 현재 문제는 모두
            <strong> 공식 기출이 아닌 출제기준·이론 기반 학습문제</strong>입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
