import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { Choice, Question } from "@/lib/domain/types";

type ChoiceExplanation = {
  meaning: string;
  whyWrong: string;
};

const CORRECT_RULE_OVERRIDES: Record<string, string> = {
  "U-727":
    "윤활성은 마찰을 줄이고 미끄러움을 높이는 성질입니다. 접착면에서는 접착제가 피착재를 충분히 적시고 결합하는 것을 방해해 접착강도를 낮출 수 있으므로, 구조용 접착제의 요구 성질로 보기 어렵습니다.",
};

const CURATED_CHOICE_EXPLANATIONS: Record<string, Record<string, ChoiceExplanation>> = {
  "U-727": {
    "U-727-c1": {
      meaning: "접착부가 인장·전단·박리 하중을 받아도 분리되지 않고 버티는 능력입니다.",
      whyWrong:
        "구조용 접착제는 부재 사이의 하중을 전달해야 하므로 접착강도는 핵심 요구 성능입니다. 이 문항은 ‘갖추어야 할 성질로 보기 어려운 것’을 고르는 부정형이므로 접착강도를 고르면 안 됩니다.",
    },
    "U-727-c3": {
      meaning: "사용 온도와 기름·세정제·약품에 노출되어도 접착층이 쉽게 열화되지 않는 성질입니다.",
      whyWrong:
        "설비 환경에서 접착 성능을 오래 유지하는 데 필요한 내환경성이므로 구조용 접착제가 갖추어야 할 성질입니다. 따라서 제외 대상이 아닙니다.",
    },
    "U-727-c4": {
      meaning:
        "정해진 혼합·도포·온도 조건에서 접착제가 균일하게 경화하고, 미경화나 과도한 수축으로 성능이 흔들리지 않는 성질입니다.",
      whyWrong:
        "접착층의 강도와 장기 신뢰성을 확보하는 데 필요한 성질이므로 구조용 접착제가 갖추어야 합니다. 따라서 제외 대상이 아닙니다.",
    },
  },
};

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
                <p><strong>정답 판단 기준:</strong> {question.answerText} — {getCorrectRule(question)}</p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {wrongChoices.map((choice) => {
                  const explanation = getChoiceExplanation(question, choice, pid);
                  return (
                    <div key={choice.id} className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
                      <p className="flex items-center gap-2 font-extrabold text-rose-900">
                        <XCircle size={15} /> “{choice.text}”
                      </p>
                      <p className="mt-3 text-xs font-black text-[#16697a]">이 보기의 뜻</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{explanation.meaning}</p>
                      <p className="mt-3 border-t border-rose-100 pt-3 text-xs font-black text-rose-800">왜 오답인가</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{explanation.whyWrong}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getChoiceExplanation(question: Question, choice: Choice, pid: boolean): ChoiceExplanation {
  const curated = CURATED_CHOICE_EXPLANATIONS[question.id]?.[choice.id];
  if (curated) return curated;
  if (pid) return explainPidChoice(choice.text, question.answerText);

  const specificReason = cleanWrongReason(
    choice.feedback.incorrectPoint,
    choice.feedback.differenceFromCorrect,
  );
  const genericFeedback = isGenericFeedback(specificReason);
  const negativeQuestion = isNegativeQuestion(question.stem);

  return {
    meaning: getChoiceMeaning(choice, genericFeedback),
    whyWrong: genericFeedback
      ? negativeQuestion
        ? `이 문항은 ‘해당하지 않는 것’을 고르는 부정형입니다. ‘${choice.text}’은(는) 질문에서 요구한 정상 성질·기능에 포함되므로 고르면 안 됩니다. 제외 대상은 ‘${question.answerText}’입니다.`
        : `질문의 핵심 조건에는 ‘${cleanRule(question.explanation)}’가 필요합니다. ‘${choice.text}’은(는) 이 직접 조건을 충족하지 않으므로 정답이 아닙니다.`
      : specificReason,
  };
}

function getChoiceMeaning(choice: Choice, genericFeedback: boolean) {
  const rationale = cleanRationale(choice.feedback.rationale);
  if (!genericFeedback && rationale.length > 20) return rationale;
  return `‘${choice.text}’은(는) 이 문항의 대상과 관련된 성질·기능이지만, 질문의 긍정·부정 조건까지 확인해 역할을 판단해야 합니다.`;
}

function explainPidChoice(choice: string, correctAnswer: string): ChoiceExplanation {
  const normalized = choice.toLocaleUpperCase("ko").replace(/\s+/g, "");
  const correct = correctAnswer.toLocaleUpperCase("ko").replace(/\s+/g, "");

  if (/비례|P동작|P제어/.test(normalized)) {
    return {
      meaning: "P 동작은 현재 편차의 크기에 비례해 즉시 조작량을 만듭니다.",
      whyWrong: correct.includes("P") || correct.includes("비례")
        ? "이 문항에서는 현재 편차 자체가 판단 기준입니다."
        : "편차의 누적이나 변화율을 묻는 문항이므로 현재 편차만 보는 P 동작은 정답이 아닙니다.",
    };
  }
  if (/적분|I동작|I제어/.test(normalized)) {
    return {
      meaning: "I 동작은 편차를 시간에 따라 누적해 정상상태 편차를 제거합니다.",
      whyWrong: correct.includes("I") || correct.includes("적분")
        ? "이 문항에서는 누적된 편차가 판단 기준입니다."
        : "현재 편차나 편차의 변화율을 묻는 문항이므로 누적값을 사용하는 I 동작은 정답이 아닙니다.",
    };
  }
  if (/미분|D동작|D제어/.test(normalized)) {
    return {
      meaning: "D 동작은 편차가 변하는 속도에 반응해 급격한 변화와 오버슈트를 억제합니다.",
      whyWrong: correct.includes("D") || correct.includes("미분")
        ? "이 문항에서는 편차의 변화율이 판단 기준입니다."
        : "현재값 또는 누적값을 묻는 문항이므로 변화율을 사용하는 D 동작은 정답이 아닙니다.",
    };
  }
  if (/ON-?OFF/.test(normalized)) {
    return {
      meaning: "ON-OFF 동작은 편차가 기준을 넘는지에 따라 출력을 켜짐과 꺼짐 두 상태로 전환합니다.",
      whyWrong: "편차에 비례하거나 누적·미분한 연속 조작량을 만드는 제어동작이 아니므로 정답이 아닙니다.",
    };
  }
  if (/증폭기/.test(normalized)) {
    return {
      meaning: "증폭기는 입력 신호의 형태를 유지하면서 신호 크기를 키우는 장치입니다.",
      whyWrong: "편차를 시간에 따라 누적해 정상상태 편차를 제거하는 제어동작 자체가 아니므로 정답이 아닙니다.",
    };
  }
  return {
    meaning: `‘${choice}’은(는) 자동제어 계통에서 사용하는 별도의 장치 또는 동작입니다.`,
    whyWrong: `이 문항에서 요구하는 ‘${correctAnswer}’의 편차 처리 방식과 다르므로 정답이 아닙니다.`,
  };
}

function cleanWrongReason(incorrectPoint: string | null, difference: string | null) {
  const source = incorrectPoint || difference || "정답이 요구하는 대상·조건·기능과 일치하지 않습니다.";
  return source
    .replace(/^‘[^’]+’은\(는\) 관련 용어이지만,\s*/u, "")
    .replace(/^‘[^’]+’은\(는\) ‘[^’]+’과 대상·기능·적용 조건이 다릅니다\.\s*/u, "");
}

function cleanRationale(rationale: string) {
  return rationale
    .replace(/^‘[^’]+’은\(는\) 관련 용어이지만,\s*/u, "")
    .replace(/질문이 요구하는 조건에 직접 답하는 보기는 ‘[^’]+’입니다\.?$/u, "")
    .trim();
}

function isGenericFeedback(reason: string) {
  return reason.length < 25
    || /대상·기능·적용 조건이 다릅니다|같은 판단 기준을 충족하지 않습니다|정답이 요구하는 대상·조건·기능/u.test(reason);
}

function isNegativeQuestion(stem: string) {
  return /아닌|아니|옳지\s*않|않는|않은|되지\s*않|보기\s*어려운|거리가\s*먼|부적절|잘못된|가장\s*적은|제외|없는/u.test(stem);
}

function getCorrectRule(question: Question) {
  return CORRECT_RULE_OVERRIDES[question.id] ?? cleanRule(question.explanation);
}

function cleanRule(explanation: string) {
  return explanation.trim().replace(/\s+/g, " ");
}
