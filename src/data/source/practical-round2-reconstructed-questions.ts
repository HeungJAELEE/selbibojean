import type {
  PracticalQuestion,
  PracticalSourceRef,
  PracticalStudyCategoryId,
  PracticalWrittenExamCardFormat,
} from "@/lib/domain/practical-types";
import type { AuditDisposition } from "@/lib/domain/types";
import { NCS_SOURCE_REGISTRY } from "./practical-source-registry";

const ROUND2_REFERENCE_URL =
  "https://blog.naver.com/bjs2236/224350755723";

type NcsCode = keyof typeof NCS_SOURCE_REGISTRY;

function ncsSource(
  code: NcsCode,
  pdfPage: number,
  printedPage: number,
  performanceCriteria: string,
): PracticalSourceRef {
  const source = NCS_SOURCE_REGISTRY[code];
  return {
    ncsCode: code,
    documentTitle: source.title,
    version: source.version,
    pdfPage,
    printedPage,
    figureNumber: null,
    performanceCriteria,
    sourceFileHash: source.hash,
    sourceUrl: source.sourceUrl,
  };
}

type ReconstructedQuestionInput = {
  id: string;
  questionNumber: string;
  title: string;
  formatLabel: string;
  stem: string;
  promptOptions?: string[];
  modelAnswer: string;
  answerDefinition?: string;
  memoryTip: string;
  requiredKeywords: string[];
  acceptedAnswers?: string[];
  calculation?: string[];
  unit?: string | null;
  traps: string[];
  conceptIds: string[];
  category: PracticalStudyCategoryId;
  secondaryCategories?: PracticalStudyCategoryId[];
  source: PracticalSourceRef;
  visualAidId?: string | null;
  writtenSourceQuestionIds?: string[];
  examFormat: PracticalWrittenExamCardFormat;
  confidence: "A" | "B" | "C";
  reviewNote: string;
  auditDisposition?: AuditDisposition;
};

function reconstructed(
  input: ReconstructedQuestionInput,
): PracticalQuestion {
  const auditDisposition = input.auditDisposition ?? "verified";
  return {
    id: input.id,
    kind: "past",
    title: input.title,
    formatLabel: input.formatLabel,
    stem: input.stem,
    promptOptions: input.promptOptions,
    modelAnswer: input.modelAnswer,
    answerDefinition: input.answerDefinition,
    memoryTip: input.memoryTip,
    requiredKeywords: input.requiredKeywords,
    acceptedAnswers: input.acceptedAnswers ?? [input.modelAnswer],
    calculation: input.calculation ?? [],
    unit: input.unit ?? null,
    rubric: input.requiredKeywords.slice(0, 5).map((keyword, index) => ({
      id: `${input.id}-r${index + 1}`,
      label: keyword,
      points: 1,
    })),
    traps: input.traps,
    conceptIds: input.conceptIds,
    primaryStudyCategoryId: input.category,
    studyCategoryIds: [
      input.category,
      ...(input.secondaryCategories ?? []),
    ],
    ncsSources: [input.source],
    visualAidId: input.visualAidId ?? null,
    label: "practical_exam",
    auditDisposition,
    contentStatus:
      auditDisposition === "verified" || auditDisposition === "cbt_corrected"
        ? "published"
        : "in_review",
    occurrence: {
      year: 2026,
      round: 2,
      questionNumber: input.questionNumber,
      sourceType: "응시자 복원 블로그",
      sourceUrl: ROUND2_REFERENCE_URL,
      reconstructionConfidence: input.confidence,
    },
    predictedBasis: null,
    writtenSourceQuestionIds: input.writtenSourceQuestionIds,
    reviewNote: input.reviewNote,
    examFormat: input.examFormat,
    examCardIds: [],
    visualAidIds: input.visualAidId ? [input.visualAidId] : [],
    sequenceItemIds: [],
    variantOfQuestionId: null,
    examEvidenceStatus: "past_reconstructed",
  };
}

/**
 * 2026년 2회 응시자 복원 문항 1~9.
 *
 * 문항 번호·형식·보기는 사용자가 지정한 복원 글을 기준으로 맞췄다.
 * 답안 충돌은 NCS·기계요소·송풍기 상사법칙 등 독립 기술근거로 교정했다.
 * 시험지 원본 그림 대신 같은 판독조건을 갖춘 자체 제작 SVG만 사용한다.
 */
export const PRACTICAL_ROUND2_RECONSTRUCTED_QUESTIONS: PracticalQuestion[] = [
  reconstructed({
    id: "P-2026-2-Q01",
    questionNumber: "Q1",
    title: "개회로·폐회로 제어",
    formatLabel: "제어방식 2종 쓰기",
    stem:
      "자동제어 시스템을 작동시키는 핵심적인 두 가지 제어방식의 명칭을 쓰시오.",
    modelAnswer: "개회로 제어(Open-loop), 폐회로 제어(Closed-loop)",
    answerDefinition:
      "개회로 제어는 출력 피드백 없이 정해진 입력에 따라 작동하고, 폐회로 제어는 출력 피드백으로 목표값과의 오차를 보정한다.",
    memoryTip: "개회로는 되돌아오는 신호가 없고, 폐회로는 출력이 입력 쪽으로 돌아온다.",
    requiredKeywords: ["개회로 제어", "폐회로 제어"],
    acceptedAnswers: [
      "개회로 제어와 폐회로 제어",
      "Open-loop control, Closed-loop control",
    ],
    traps: [
      "개회로와 폐회로 중 하나만 쓰지 않는다.",
      "시퀀스 제어와 피드백 제어를 개회로·폐회로의 동의어로 쓰지 않는다.",
    ],
    conceptIds: ["PCON-SUP-004"],
    category: "theory_concept",
    source: ncsSource(
      "1503010204",
      42,
      30,
      "자동제어 방식과 피드백의 기본 관계",
    ),
    examFormat: "definition",
    confidence: "B",
    reviewNote:
      "복원 글에 혼재한 분류 표현을 분리했다. 이 문항의 확정 답안은 피드백 유무에 따른 개회로·폐회로이며 시퀀스·피드백 분류는 허용 답안으로 사용하지 않는다.",
  }),
  reconstructed({
    id: "P-2026-2-Q02",
    questionNumber: "Q2",
    title: "M18×2 암나사 반지름 계산",
    formatLabel: "지문 조건에 따른 a·b 반지름 계산",
    stem:
      "호칭이 M18×2인 암나사에서 a는 암나사 골지름의 반지름, b는 바깥지름의 반지름을 나타낸다. a와 b에 들어갈 값을 쓰시오.",
    promptOptions: ["7 mm, 9 mm", "8 mm, 9 mm", "16 mm, 18 mm"],
    modelAnswer: "a=8 mm, b=9 mm",
    answerDefinition:
      "M18의 바깥지름 반지름은 18÷2=9 mm이고, M18×2 기본 암나사 골지름 15.835 mm의 반지름은 약 7.92 mm이므로 정수 보기에서는 8 mm이다.",
    memoryTip: "M18 바깥지름의 반은 9, 암나사 골지름의 반은 약 8이다.",
    requiredKeywords: ["a=8 mm", "b=9 mm"],
    acceptedAnswers: ["8 mm, 9 mm", "a 8, b 9", "a=8 mm, b=9 mm"],
    calculation: [
      "b=18÷2=9 mm",
      "a=15.835÷2=7.9175 mm≈8 mm",
    ],
    unit: "mm",
    traps: [
      "지름값 16·18을 반지름 답란에 그대로 쓰지 않는다.",
      "피치 2 mm를 바깥지름에서 단순히 한 번만 빼 골지름으로 확정하지 않는다.",
    ],
    conceptIds: ["PCON-012", "PCON-021"],
    category: "formula_calculation",
    secondaryCategories: ["theory_concept"],
    source: ncsSource(
      "1502010511",
      75,
      63,
      "미터 암나사 도면의 지름과 반지름 판독",
    ),
    examFormat: "calculation",
    confidence: "B",
    reviewNote:
      "원시험 도면 없이도 풀 수 있도록 a와 b가 가리키는 지름 경계를 지문에 명시했다. 16·18은 지름값이고, 문제에서 요구하는 반지름 정답은 8·9로 확정했다.",
    auditDisposition: "verified",
  }),
  reconstructed({
    id: "P-2026-2-Q03",
    questionNumber: "Q3",
    title: "송풍기 동력 상사법칙",
    formatLabel: "회전수 변화에 따른 동력 계산",
    stem:
      "같은 송풍기가 동일 유체·효율 조건에서 380 rpm일 때 5.5 hp를 소비한다. 회전수를 500 rpm으로 높일 때 필요한 동력을 송풍기 상사법칙으로 구하시오.",
    modelAnswer: "약 12.53 hp",
    answerDefinition:
      "같은 송풍기의 동력은 회전수의 세제곱에 비례한다.",
    memoryTip: "송풍기 상사법칙은 풍량 1제곱, 압력 2제곱, 동력 3제곱이다.",
    requiredKeywords: ["동력은 회전수의 세제곱에 비례", "500/380", "12.53 hp"],
    acceptedAnswers: ["12.53 hp", "약 12.53마력", "12.5 hp"],
    calculation: [
      "P₂/P₁=(N₂/N₁)³",
      "P₂=5.5×(500/380)³=12.53 hp",
    ],
    unit: "hp",
    traps: [
      "토크 일정이라는 별도 조건을 임의로 붙여 회전수의 1제곱 비례식으로 계산하지 않는다.",
      "7.24 hp는 송풍기 상사법칙이 아니라 토크 일정 가정의 결과다.",
    ],
    conceptIds: ["PCON-SUP-003"],
    category: "formula_calculation",
    source: ncsSource(
      "1503010201",
      25,
      13,
      "회전기계 운전조건 변화와 송풍기 동력 상사법칙",
    ),
    examFormat: "calculation",
    confidence: "A",
    reviewNote:
      "지문에 같은 송풍기·동일 유체·동일 효율 조건과 회전수 변화를 명시했다. 이 조건에서는 송풍기 상사법칙의 동력 세제곱 비례를 적용해 12.53 hp로 확정한다.",
    auditDisposition: "verified",
  }),
  reconstructed({
    id: "P-2026-2-Q04",
    questionNumber: "Q4",
    title: "SEMS 볼트 식별",
    formatLabel: "사진·구조를 보고 명칭 쓰기",
    stem:
      "평와셔와 스프링와셔가 볼트에서 빠지지 않도록 미리 조립된 체결품의 명칭을 쓰시오.",
    modelAnswer: "SEMS 볼트(와셔 조립 볼트)",
    answerDefinition:
      "SEMS 볼트는 볼트에 평와셔·스프링와셔 등을 이탈하지 않게 미리 조립한 체결품이다.",
    memoryTip: "SEMS는 볼트와 와셔가 한 세트로 붙어 다닌다.",
    requiredKeywords: ["SEMS 볼트", "와셔 사전 조립", "와셔 이탈 방지"],
    acceptedAnswers: ["SEMS 볼트", "샘스 볼트", "와셔 조립 볼트"],
    traps: [
      "와셔를 현장에서 따로 끼운 일반 볼트와 혼동하지 않는다.",
      "플랜지 볼트처럼 머리 형상만 보고 판단하지 않는다.",
    ],
    conceptIds: ["PCON-021"],
    category: "visual_identification",
    source: ncsSource(
      "1503010120",
      42,
      30,
      "볼트·와셔 체결부품의 구조와 조립",
    ),
    visualAidId: "licensed-sems-bolt",
    examFormat: "image",
    confidence: "B",
    reviewNote:
      "복원 글의 Q4에는 실제 SEMS 볼트 사진이 제시된다. 원시험 사진을 복제하지 않고, 평와셔·스프링와셔가 미리 조립된 구조를 판독할 수 있는 CC BY-SA 동등 실사를 사용한다. 문제 화면에 원시험 이미지와 동일하지 않음을 표시한다.",
    auditDisposition: "verified",
  }),
  reconstructed({
    id: "P-2026-2-Q05",
    questionNumber: "Q5",
    title: "적하급유법 분류",
    formatLabel: "보기에서 적하급유법 모두 고르기",
    stem:
      "다음 보기에서 적하급유법에 해당하는 것을 모두 고르시오.",
    promptOptions: [
      "강제순환급유법",
      "패드급유법",
      "사이펀급유법",
      "유환급유법",
      "바늘급유법",
      "비말급유법",
      "가시적하급유법",
      "손급유법",
      "심지급유법",
      "유욕급유법",
    ],
    modelAnswer: "사이펀급유법, 바늘급유법, 가시적하급유법",
    answerDefinition:
      "적하급유는 기름을 방울 단위로 떨어뜨려 마찰면에 공급하며, 보기에서는 사이펀·바늘·가시적하 방식이 해당한다.",
    memoryTip: "적하는 ‘방울이 보이거나, 바늘로 조절하거나, 사이펀으로 떨어뜨리는’ 방식이다.",
    requiredKeywords: ["사이펀급유법", "바늘급유법", "가시적하급유법"],
    acceptedAnswers: [
      "사이펀급유법, 바늘급유법, 가시적하급유법",
      "사이펀·바늘·가시적하",
    ],
    traps: [
      "유욕·비말·유환처럼 회전부가 기름을 퍼 올리는 방식을 포함하지 않는다.",
      "보기의 선택지 순서를 바꿔도 세 방식이 모두 있어야 한다.",
    ],
    conceptIds: ["PCON-SUP-032"],
    category: "theory_concept",
    source: ncsSource(
      "1505010108",
      71,
      59,
      "구동장치 윤활과 적하급유 방식 분류",
    ),
    visualAidId: "diagram-drip-lubrication",
    examFormat: "matching",
    confidence: "B",
    reviewNote:
      "복원 글의 Q5 보기 10개와 복수선택 형식을 그대로 반영했다. 도식은 적하 구조를 이해시키는 보조자료이며 선택지 정답을 노출하지 않는다.",
  }),
  reconstructed({
    id: "P-2026-2-Q06",
    questionNumber: "Q6",
    title: "연삭숫돌 시운전과 덮개",
    formatLabel: "빈칸 3개 쓰기",
    stem:
      "연삭기 안전관리에서 작업 시작 전 연삭숫돌의 시운전 시간 ①, 숫돌 교체 후 시운전 시간 ②, 숫돌 파편의 비산을 막는 안전장치 ③을 각각 쓰시오.",
    modelAnswer: "① 1분 이상, ② 3분 이상, ③ 덮개",
    answerDefinition:
      "연삭숫돌은 작업 시작 전 1분 이상, 교체 후 3분 이상 시운전하고 파편 비산을 막는 덮개를 갖춘다.",
    memoryTip: "연삭 안전 숫자는 시작 1, 교체 3, 파편은 덮개다.",
    requiredKeywords: ["1분 이상", "3분 이상", "덮개"],
    acceptedAnswers: [
      "1분, 3분, 덮개",
      "① 1분 이상 ② 3분 이상 ③ 덮개",
    ],
    traps: [
      "작업 시작 전과 숫돌 교체 후 시간을 바꾸지 않는다.",
      "보호안경은 개인보호구이고, 문항이 묻는 기계 안전장치는 덮개다.",
    ],
    conceptIds: ["PCON-SUP-043"],
    category: "work_procedure",
    source: ncsSource(
      "1503010122",
      25,
      13,
      "회전공구 사용 전 시운전과 방호조치",
    ),
    visualAidId: "diagram-grinding-wheel-safety",
    examFormat: "definition",
    confidence: "A",
    reviewNote:
      "복원 글의 Q6 빈칸 ①~③을 그대로 반영했다. 기존 초안에 있던 지름 5 cm 조건은 이 문항 기준에 없으므로 제거했다.",
  }),
  reconstructed({
    id: "P-2026-2-Q07",
    questionNumber: "Q7",
    title: "아베의 원리",
    formatLabel: "측정원리 정의",
    stem: "아베의 원리를 설명하시오.",
    modelAnswer:
      "정밀한 길이 측정에서는 측정하려는 길이의 축과 기준 눈금의 축을 측정방향과 같은 직선 위에 배치해야 한다.",
    answerDefinition:
      "측정축과 기준 눈금축의 오프셋을 없애 각도 오차가 길이 오차로 확대되는 것을 줄이는 원리다.",
    memoryTip: "재는 축과 읽는 축을 한 줄로 맞춘다.",
    requiredKeywords: ["측정 대상의 축", "기준 눈금의 축", "같은 직선", "측정방향"],
    acceptedAnswers: [
      "측정 대상과 기준 눈금을 측정방향의 동일선상에 배치한다.",
      "측정축과 표준자의 눈금축을 일직선상에 둔다.",
    ],
    traps: [
      "두 축이 단순히 평행하기만 하면 된다고 쓰지 않는다.",
      "시차오차의 일반 정의로 대신하지 않는다.",
    ],
    conceptIds: ["PCON-037"],
    category: "theory_concept",
    source: ncsSource(
      "1502010504",
      87,
      75,
      "정밀 길이측정에서 측정축과 기준축의 배치",
    ),
    visualAidId: "diagram-abbe-principle-exam",
    writtenSourceQuestionIds: ["U-073"],
    examFormat: "definition",
    confidence: "A",
    reviewNote:
      "복원 글에서 Q7로 확인된 정의형 문항이다. 도식은 동일선 배치와 오프셋 배치를 비교하는 자체 제작 개념도다.",
  }),
  reconstructed({
    id: "P-2026-2-Q08",
    questionNumber: "Q8",
    title: "서징 현상",
    formatLabel: "현상 정의",
    stem: "서징 현상(Surging)을 간단히 설명하시오.",
    modelAnswer:
      "펌프·송풍기·압축기가 불안정 운전영역에서 작동할 때 압력과 유량이 주기적으로 변동하고 역류·진동·소음이 나타나는 현상이다.",
    answerDefinition:
      "유량과 압력이 주기적으로 맥동하며 장치가 불안정해지는 운전 현상이다.",
    memoryTip: "저유량 불안정 영역에서 압력·유량이 맥동한다.",
    requiredKeywords: ["불안정 운전영역", "압력·유량의 주기적 변동", "진동·소음 또는 역류"],
    acceptedAnswers: [
      "압력과 유량이 주기적으로 변동하는 맥동 현상",
      "저유량 영역에서 압력·유량이 맥동하며 진동과 소음이 생기는 현상",
    ],
    traps: [
      "기포가 생겨 붕괴하는 캐비테이션과 혼동하지 않는다.",
      "진동만 언급하고 압력·유량의 주기적 변동을 빠뜨리지 않는다.",
    ],
    conceptIds: ["PCON-SUP-003"],
    category: "theory_concept",
    source: ncsSource(
      "1503010215",
      16,
      4,
      "펌프·송풍기·압축기의 불안정 운전과 서징",
    ),
    writtenSourceQuestionIds: ["U-1324"],
    examFormat: "definition",
    confidence: "A",
    reviewNote:
      "복원 글에서 Q8로 확인된 정의형 문항이다. 필기 이론의 정의와 회전기계 운전 근거를 대조해 답안을 보완했다.",
  }),
  reconstructed({
    id: "P-2026-2-Q09",
    questionNumber: "Q9",
    title: "브레이크 라이닝 교체순서",
    formatLabel: "글로 제시된 작업순서 배열",
    stem:
      "다음 보기의 브레이크 라이닝 교체 작업을 올바른 순서로 배열하시오.",
    promptOptions: [
      "① 라이닝 위의 압력 해제 너트를 풀고 조정 굴대를 꺼낸다.",
      "② 설치 위치에 새 라이닝을 정확히 끼운다.",
      "③ 프레셔 백과 배플을 재설정하고 연결 볼트를 조인다.",
      "④ 라이닝을 붙잡고 브레이크 드럼을 따라 꺼낸다.",
      "⑤ 브레이크를 완전히 해제한다.",
    ],
    modelAnswer: "⑤ → ① → ④ → ② → ③",
    answerDefinition:
      "브레이크를 완전히 해제한 뒤 조정부를 풀어 기존 라이닝을 제거하고, 새 라이닝 장착 후 프레셔 백·배플과 연결 볼트를 복구한다.",
    memoryTip: "해제 → 조정부 분리 → 구품 제거 → 신품 장착 → 재설정·체결.",
    requiredKeywords: ["⑤-①-④-②-③", "완전 해제", "기존 라이닝 제거", "새 라이닝 장착", "재설정·체결"],
    acceptedAnswers: [
      "5-1-4-2-3",
      "⑤ → ① → ④ → ② → ③",
      "완전 해제-조정부 분리-라이닝 제거-새 라이닝 장착-재설정·체결",
    ],
    traps: [
      "사진 순서문제로 바꾸지 않는다. 이 복원문항은 글 보기의 순서를 맞추는 문제다.",
      "새 라이닝을 끼운 뒤 기존 라이닝을 제거하는 순서로 쓰지 않는다.",
      "재설정·연결 볼트 체결을 새 라이닝 장착보다 먼저 하지 않는다.",
    ],
    conceptIds: ["PCON-SUP-030"],
    category: "work_procedure",
    source: ncsSource(
      "1505010108",
      153,
      141,
      "브레이크 라이닝 분해·교체·복구 절차",
    ),
    examFormat: "sequence",
    confidence: "B",
    reviewNote:
      "사용자 제보와 복원 글을 따라 사진형이 아닌 글 순서형으로 구성했다. 복원 글의 공개답 ②-④-⑤-③-①은 보기의 작업 논리와 충돌하므로 보기 문장을 기준으로 ⑤-①-④-②-③으로 교정했다.",
    auditDisposition: "cbt_corrected",
  }),
];
