import { CheckCircle2, Dumbbell } from "lucide-react";

import { InlineQuestionToggle } from "@/components/single-question";
import type { PublicQuestion } from "@/lib/domain/types";

export type LessonPracticeItem = PublicQuestion;

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
          <h2 className="mt-1 text-xl font-extrabold">
            모의고사 {questions.length}문제 풀기
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            각 문항을 눌러 보기를 선택하고 같은 화면에서 채점하세요. 제출 후 정답 근거,
            모든 보기의 설명과 복습할 개념까지 이어집니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {questions.map((question, index) => (
          <InlineQuestionToggle
            key={question.id}
            question={question}
            index={index}
          />
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-slate-300">
        <CheckCircle2 size={14} className="shrink-0 text-[#8dd5ce]" />
        검수된 공개 문제만 표시하며, 답을 제출하기 전에는 정답과 해설을 전송하지 않습니다.
      </p>
    </section>
  );
}
