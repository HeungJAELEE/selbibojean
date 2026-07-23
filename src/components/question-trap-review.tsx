import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "@/lib/domain/types";

export function QuestionTrapReview({
  questions,
  pid = false,
}: {
  questions: Question[];
  pid?: boolean;
}) {
  if (questions.length === 0) return null;

  return (
    <section
      id="question-traps"
      data-testid="question-trap-review"
      className="mt-9 scroll-mt-28 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-600 text-white">
          <AlertTriangle size={19} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-amber-800">Exam traps</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">시험 문항으로 보는 실제 함정</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            질문을 먼저 읽고 각 보기가 무엇을 설명하는지 분리합니다. 단순히 “정답과 다르다”가 아니라,
            그 보기가 어느 개념에는 맞지만 이 질문에는 왜 틀리는지 확인합니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {questions.map((question, index) => {
          const wrongChoices = question.choices.filter((choice) => choice.id !== question.correctChoiceId);
          return (
            <article
              key={question.id}
              data-testid={`trap-question-${question.id}`}
              className="rounded-xl border border-amber-200 bg-white p-4 md:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[#173957] px-2.5 py-1 text-xs font-black text-white">
                  문항 {index + 1} · {question.id}
                </span>
                <Link
                  href={`/written/practice/${question.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#16697a]"
                >
                  직접 풀기 <ArrowRight size={13} />
                </Link>
              </div>
              <h3 className="mt-3 text-base font-extrabold leading-7 text-[#173957]">{question.stem}</h3>
              <div className="mt-3 flex gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-900">
                <CheckCircle2 className="mt-1 shrink-0" size={16} />
                <p><strong>정답 판단 기준:</strong> {question.answerText} — {cleanRule(question.explanation)}</p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {wrongChoices.map((choice) => (
                  <div key={choice.id} className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
                    <p className="flex items-center gap-2 font-extrabold text-rose-900">
                      <XCircle size={15} /> “{choice.text}”
                    </p>
                    <p className="mt-2 text-xs font-black text-rose-800">왜 틀렸는가</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {pid ? explainPidChoice(choice.text, question.answerText) : cleanWrongReason(choice.feedback.incorrectPoint, choice.feedback.differenceFromCorrect)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function explainPidChoice(choice: string, correctAnswer: string) {
  const normalized = choice.toLocaleUpperCase("ko").replace(/\s+/g, "");
  const correct = correctAnswer.toLocaleUpperCase("ko").replace(/\s+/g, "");

  if (/비례|P동작|P제어/.test(normalized)) {
    return `P 동작은 현재 편차의 크기에 비례해 즉시 반응합니다. ${correct.includes("P") || correct.includes("비례") ? "이 질문에서는 현재 편차 자체가 판단 기준입니다." : "편차의 누적이나 변화율을 묻는 이 질문의 기준과 다릅니다."}`;
  }
  if (/적분|I동작|I제어/.test(normalized)) {
    return `I 동작은 편차를 시간에 따라 누적해 정상상태 편차를 제거합니다. ${correct.includes("I") || correct.includes("적분") ? "이 질문에서는 누적된 편차가 판단 기준입니다." : "현재 편차나 편차의 변화율을 묻는 이 질문의 기준과 다릅니다."}`;
  }
  if (/미분|D동작|D제어/.test(normalized)) {
    return `D 동작은 편차가 변하는 속도에 반응해 급격한 변화와 오버슈트를 억제합니다. ${correct.includes("D") || correct.includes("미분") ? "이 질문에서는 변화율이 판단 기준입니다." : "현재값 또는 누적값을 묻는 이 질문의 기준과 다릅니다."}`;
  }
  if (/ON-?OFF/.test(normalized)) {
    return "ON-OFF 동작은 편차가 기준을 넘는지에 따라 출력을 두 상태로 전환합니다. 편차에 비례하거나 누적·미분한 연속 조작량을 만드는 동작이 아닙니다.";
  }
  if (/증폭기/.test(normalized)) {
    return "증폭기는 신호 크기를 키우는 장치일 뿐, 편차를 시간에 따라 누적해 정상상태 편차를 제거하는 제어동작 자체가 아닙니다.";
  }
  return `‘${choice}’은(는) ${correctAnswer}이 설명하는 편차의 기준과 다른 대상·기능을 나타냅니다.`;
}

function cleanWrongReason(incorrectPoint: string | null, difference: string | null) {
  const source = incorrectPoint || difference || "정답이 요구하는 대상·조건·기능과 일치하지 않습니다.";
  return source
    .replace(/^‘[^’]+’은\(는\) 관련 용어이지만,\s*/u, "")
    .replace(/^‘[^’]+’은\(는\) ‘[^’]+’과 대상·기능·적용 조건이 다릅니다\.\s*/u, "");
}

function cleanRule(explanation: string) {
  return explanation.trim().replace(/\s+/g, " ");
}
