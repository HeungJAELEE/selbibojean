import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { quoteWithJosa } from "@/lib/content/korean";
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
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">연결 문제로 확인하는 시험 함정</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            아래에서는 문제와 보기만 미리 보여 줍니다. 정답·해설·보기별 근거는 답을 제출한 뒤에만
            공개되므로, 먼저 직접 판단하고 풀이 화면에서 확인하세요.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {questions.map((question, index) => {
          const reconstructed = question.verification?.riskTags.includes("editorial_reconstruction") ?? false;
          return (
            <article
              key={question.id}
              data-testid={`trap-question-${question.id}`}
              className="rounded-xl border border-amber-200 bg-white p-4 md:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[#173957] px-2.5 py-1 text-xs font-black text-white">
                  {reconstructed ? "학습용 재구성" : "검증 문제"} {index + 1}
                </span>
                <Link
                  href={`/written/practice/${question.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#16697a]"
                >
                  직접 풀기 <ArrowRight size={13} />
                </Link>
              </div>
              <h3 className="mt-3 text-base font-extrabold leading-7 text-[#173957]">{question.stem}</h3>
              <ol className="mt-4 grid gap-2 md:grid-cols-2">
                {question.choices.map((choice, choiceIndex) => (
                  <li
                    key={choice.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
                  >
                    <span className="mr-2 font-black text-[#16697a]">{choiceIndex + 1}</span>
                    {choice.text}
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function getChoiceExplanation(question: Question, choice: Choice, pid: boolean): ChoiceExplanation {
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
        ? `이 문항은 ‘해당하지 않는 것’을 고르는 부정형입니다. ${quoteWithJosa(choice.text, "은/는")} 질문에서 요구한 정상 성질·기능에 포함되므로 고르면 안 됩니다. 제외 대상은 ‘${question.answerText}’입니다.`
        : `질문의 핵심 조건에는 ‘${cleanRule(question.explanation)}’가 필요합니다. ${quoteWithJosa(choice.text, "은/는")} 이 직접 조건을 충족하지 않으므로 정답이 아닙니다.`
      : specificReason,
  };
}

function getChoiceMeaning(choice: Choice, genericFeedback: boolean) {
  const rationale = cleanRationale(choice.feedback.rationale);
  if (!genericFeedback && rationale.length > 20) return rationale;
  return CHOICE_MEANING_OVERRIDES[choice.text]
    ?? `${quoteWithJosa(choice.text, "은/는")} 이 문항과 같은 분야에 등장하지만, 질문의 긍정·부정 조건까지 확인해 역할을 판단해야 합니다.`;
}

const CHOICE_MEANING_OVERRIDES: Record<string, string> = {
  "질소": "질소는 유압유와 쉽게 반응하지 않아 어큐뮬레이터의 봉입가스로 사용하는 기체입니다.",
  "제조사가 허용한 불활성가스": "제조사가 사용을 승인한 불활성가스는 작동유와의 반응 위험을 줄이는 충전가스 조건을 뜻합니다.",
  "규정 압력의 건조 질소": "수분을 제거한 건조 질소를 지정된 봉입압력으로 충전한다는 정상 취급 조건입니다.",
  "냉각기": "냉각기는 작동유의 열을 외부로 방출해 유온 상승을 억제하는 장치입니다.",
  "여과기": "여과기는 작동유 속 입자성 오염물을 걸러 밸브와 펌프의 마모·고착을 줄이는 장치입니다.",
  "오일탱크": "오일탱크는 작동유를 저장하고 기포 분리·침전·방열을 돕지만, 압축가스로 압력에너지를 축적하지는 않습니다.",
  "맥동압 제거": "어큐뮬레이터가 펌프 토출의 주기적인 압력 변동을 받아들여 맥동을 줄이는 실제 기능입니다.",
  "서지압 흡수": "어큐뮬레이터가 밸브 급폐 등으로 생긴 순간 압력 상승을 받아들여 충격을 완화하는 실제 기능입니다.",
  "압력에너지 저장": "작동유가 봉입가스를 압축할 때 에너지를 저장하고, 압력이 낮아질 때 다시 방출하는 핵심 기능입니다.",
  "용접·천공 등 임의가공을 하지 않는다.": "어큐뮬레이터는 압력을 저장하는 용기이므로 몸체의 용접·천공은 강도와 안전성을 훼손할 수 있어 금지하는 취급 원칙입니다.",
  "펌프측 역류방지 체크밸브를 고려한다.": "펌프 정지나 압력 변화 때 저장된 작동유가 펌프 쪽으로 역류하지 않도록 회로 조건에 맞춰 검토하는 설치 원칙입니다.",
  "충격원 가까운 유효 위치에 설치한다.": "충격파가 배관으로 퍼지기 전에 압력 변동을 받아들이도록 발생원 가까운 유효 위치에 설치한다는 원칙입니다.",
  "대용량 에너지 저장만": "대용량 에너지 저장은 일반 어큐뮬레이터의 용도일 수 있지만, 배관에 직접 연결되는 인라인형의 대표 목적을 ‘저장만’으로 한정한 표현입니다.",
  "온도를 일정하게 유지": "작동유 온도 조절은 냉각기·히터와 온도제어 계통의 역할이며 인라인형 어큐뮬레이터의 대표 기능이 아닙니다.",
  "스프링식 저압용으로만 사용": "스프링식은 어큐뮬레이터의 한 구조형식이지만, 인라인형을 스프링식·저압용으로 한정하는 설명은 구조와 용도를 혼동한 것입니다.",
  "TIG용접": "TIG용접은 비소모성 텅스텐 전극의 아크열로 모재를 녹여 접합하는 융접입니다.",
  "피복아크용접": "피복아크용접은 피복 용접봉과 모재 사이의 아크열로 모재를 녹여 접합하는 융접입니다.",
  "서브머지드아크용접": "서브머지드아크용접은 입상 플럭스 아래에서 아크를 발생시켜 모재를 녹이는 융접입니다.",
  "열변형과 잔류응력이 발생할 수 있다.": "용접부의 국부 가열·냉각과 수축 구속 때문에 열변형과 잔류응력이 생길 수 있다는 정상 설명입니다.",
  "품질검사가 어렵고 수축·변형이 생길 수 있다.": "용접 내부 결함은 겉으로 확인하기 어렵고 응고·냉각 수축으로 형상 변형이 생길 수 있다는 정상 설명입니다.",
  "용접사 기량이 품질에 영향을 준다.": "수동 용접에서는 아크 길이·속도·각도 같은 작업자의 조작이 용입과 결함 발생에 영향을 준다는 정상 설명입니다.",
  "가시아크라 작업상태를 확인하기 쉽다.": "CO₂ 아크용접은 플럭스가 아크를 덮지 않아 아크와 용융지 상태를 관찰하기 쉽다는 특징입니다.",
  "전류밀도가 높아 용입과 속도가 크다.": "CO₂ 아크용접은 높은 전류밀도를 사용할 수 있어 깊은 용입과 빠른 용접속도를 얻는다는 특징입니다.",
  "용제를 쓰지 않아 슬래그 처리가 적다.": "보호가스를 사용하는 CO₂ 아크용접은 플럭스 사용 공정에 비해 슬래그 제거 작업이 적다는 특징입니다.",
  "용접전류가 매우 작다.": "저항용접은 접촉부에서 충분한 저항열을 짧은 시간에 만들기 위해 큰 전류를 사용하는 공정입니다.",
  "반드시 용가재를 사용한다.": "저항용접은 겹친 모재 자체의 접촉부를 가열·가압해 접합하므로 일반적으로 별도의 용가재가 필수 조건이 아닙니다.",
  "모든 작업을 수동으로만 해야 한다.": "저항용접은 전류·통전시간·가압력을 장비로 제어하기 쉬워 자동화와 대량생산에 적합한 공정입니다.",
};

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

export function getCorrectRule(question: Question) {
  return CORRECT_RULE_OVERRIDES[question.id] ?? cleanRule(question.explanation);
}

function cleanRule(explanation: string) {
  return explanation.trim().replace(/\s+/g, " ");
}
