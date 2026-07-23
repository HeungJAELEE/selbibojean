import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell } from "lucide-react";

export type LessonPracticeItem = {
  id: string;
  stem: string;
  scope: "lesson" | "group";
};

export function LessonPracticeSet({ questions }: { questions: LessonPracticeItem[] }) {
  if (questions.length === 0) return null;

  return (
    <section
      id="practice-set"
      data-testid="lesson-practice-set"
      className="mt-9 scroll-mt-28 rounded-2xl bg-[#173957] p-5 text-white md:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-[#8dd5ce]">
          <Dumbbell size={20} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#8dd5ce]">Step 3 · Exam practice</p>
          <h2 className="mt-1 text-xl font-extrabold">실전 유사 문제 풀기</h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            개념과 실제 기출 표현을 확인했다면 이제 직접 답을 고르세요. 제출 후 정답 근거, 모든 보기의 설명,
            오답 원인과 복습할 개념까지 이어집니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {questions.map((question, index) => (
          <Link
            key={question.id}
            href={`/written/practice/${question.id}`}
            className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/8 p-4 transition hover:border-[#8dd5ce] hover:bg-white/12"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#8f3f0a] text-sm font-black">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#8dd5ce]">
                <span>{question.scope === "lesson" ? "이 개념 직접 적용" : "같은 세부항목군 확장"}</span>
                <span className="text-slate-200">{question.id}</span>
              </span>
              <span className="mt-1 line-clamp-2 block text-sm font-bold leading-6 text-white">{question.stem}</span>
            </span>
            <ArrowRight className="shrink-0 text-[#8dd5ce] transition group-hover:translate-x-1" size={18} />
          </Link>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-slate-300">
        <CheckCircle2 size={14} className="shrink-0 text-[#8dd5ce]" />
        검수된 공개 문제만 표시하며, 답을 제출하기 전에는 정답과 해설을 전송하지 않습니다.
      </p>
    </section>
  );
}
