import { createHash } from "node:crypto";
import type {
  PracticalConcept,
  PracticalQuestion,
  PracticalSourceRef,
  PracticalStudyCategoryId,
  PracticalVisualAid,
} from "@/lib/domain/practical-types";
import { isLearnerVisiblePracticalQuestion } from "@/lib/content/learner-visibility";

type WrittenQuestionExcerpt = {
  id: string;
  lessonId: string;
  stem: string;
  answerText: string;
  explanation: string;
  sourceLabel: string;
  contentStatus: string;
  verification?: {
    sourceUrls: string[];
    note: string;
    reviewedAt: string;
  };
};

type BuildInput = {
  existingQuestions: PracticalQuestion[];
  concepts: PracticalConcept[];
  visualAids: PracticalVisualAid[];
  writtenQuestions: WrittenQuestionExcerpt[];
};

type TheorySeed = {
  id: string;
  title: string;
  stem: string;
  modelAnswer: string;
  answerDefinition: string;
  memoryTip: string;
  requiredKeywords: string[];
  conceptId: string;
  writtenSourceQuestionIds: string[];
  promptOptions?: string[];
  examFormat?: PracticalQuestion["examFormat"];
  traps?: string[];
};

type FormulaSeed = {
  id: string;
  title: string;
  stem: string;
  modelAnswer: string;
  calculation: string[];
  unit: string;
  answerDefinition: string;
  memoryTip: string;
  requiredKeywords: string[];
  conceptId: string;
  writtenSourceQuestionIds: string[];
  traps?: string[];
};

const OFFICIAL_SURGE_SOURCE: PracticalSourceRef = {
  sourceKind: "official_reference",
  ncsCode: "US-DOE-CAS-SOURCEBOOK-V3",
  documentTitle:
    "U.S. Department of Energy, Improving Compressed Air System Performance",
  version: "Version 3",
  pdfPage: 13,
  printedPage: 9,
  figureNumber: null,
  performanceCriteria:
    "원심 압축기의 최소 안정 유량, 역류 운전, 압력·유량 맥동과 진동",
  sourceFileHash:
    "3280284235b8daef10f7d9e6a21aada90d7b804b805cc9ef842903aeca009c22",
  sourceUrl:
    "https://www.energy.gov/sites/default/files/2016/03/f30/Improving%20Compressed%20Air%20Sourcebook%20version%203.pdf",
};

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, "");
}

function conceptById(concepts: PracticalConcept[], id: string) {
  const concept = concepts.find((candidate) => candidate.id === id);
  if (!concept) throw new Error(`선별 예상문제 개념 누락: ${id}`);
  return concept;
}

function writtenById(
  writtenQuestions: WrittenQuestionExcerpt[],
  id: string,
) {
  const question = writtenQuestions.find((candidate) => candidate.id === id);
  if (!question || question.contentStatus !== "published") {
    throw new Error(`선별 예상문제 필기 근거 누락: ${id}`);
  }
  return question;
}

function writtenEvidenceSource(
  writtenQuestions: WrittenQuestionExcerpt[],
  id: string,
): PracticalSourceRef {
  const question = writtenById(writtenQuestions, id);
  const sourceUrl =
    question.verification?.sourceUrls[0] ?? question.sourceLabel;
  const evidenceRecord = JSON.stringify({
    id: question.id,
    stem: question.stem,
    answerText: question.answerText,
    explanation: question.explanation,
    sourceUrl,
    reviewedAt: question.verification?.reviewedAt ?? null,
  });
  return {
    sourceKind: "written_question_bank",
    ncsCode: `WRITTEN-${question.id}`,
    documentTitle: `필기 문제은행 검증 근거 ${question.id}`,
    version:
      question.verification?.reviewedAt?.slice(0, 10) ?? "검증일 확인 필요",
    pdfPage: null,
    printedPage: null,
    figureNumber: null,
    performanceCriteria: `${question.id} 정답·해설과 연결 원문 URL 검증`,
    sourceFileHash: createHash("sha256")
      .update(evidenceRecord)
      .digest("hex"),
    sourceUrl,
  };
}

function evidenceSources(
  concept: PracticalConcept,
  writtenQuestionIds: string[],
  writtenQuestions: WrittenQuestionExcerpt[],
) {
  return [
    ...writtenQuestionIds
      .slice(0, 1)
      .map((id) => writtenEvidenceSource(writtenQuestions, id)),
    ...concept.ncsSources.slice(0, 1),
  ];
}

function rubric(questionId: string, labels: string[]) {
  return labels.slice(0, 4).map((label, index) => ({
    id: `${questionId}-r${index + 1}`,
    label,
    points: 1,
  }));
}

function baseQuestion(input: {
  id: string;
  category: PracticalStudyCategoryId;
  title: string;
  stem: string;
  modelAnswer: string;
  answerDefinition: string;
  memoryTip: string;
  concept: PracticalConcept;
  requiredKeywords: string[];
  writtenSourceQuestionIds: string[];
  sourceOverride: PracticalSourceRef[];
  calculation?: string[];
  unit?: string | null;
  promptOptions?: string[];
  examFormat?: PracticalQuestion["examFormat"];
  traps?: string[];
}): PracticalQuestion {
  const requiredKeywords = unique(input.requiredKeywords);
  return {
    id: input.id,
    kind: "predicted",
    title: input.title,
    formatLabel:
      input.category === "formula_calculation"
        ? "필기 공식 발췌·계산"
        : input.examFormat === "sequence"
          ? "이론 체계·순서"
          : "필기 핵심 정의",
    stem: input.stem,
    promptOptions: input.promptOptions,
    modelAnswer: input.modelAnswer,
    answerDefinition: input.answerDefinition,
    memoryTip: input.memoryTip,
    requiredKeywords,
    acceptedAnswers: unique([input.modelAnswer, ...requiredKeywords]),
    calculation: input.calculation ?? [],
    unit: input.unit ?? null,
    rubric: rubric(input.id, requiredKeywords),
    traps: (input.traps ?? input.concept.traps).slice(0, 3),
    conceptIds: [input.concept.id],
    primaryStudyCategoryId: input.category,
    studyCategoryIds: [input.category],
    ncsSources: input.sourceOverride,
    visualAidId: null,
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "검증된 필기 문제은행의 정의·공식·판단 기준을 실기 필답형 단답·계산 형식으로 발췌·변환한 예상문제이며 실제 기출 회차를 뜻하지 않는다.",
    writtenSourceQuestionIds: input.writtenSourceQuestionIds,
    reviewNote:
      "숫자만 바꾼 반복 생성은 사용하지 않았다. 하나의 정의·법칙·계산식 계열당 한 문항만 선별하고 연결 필기 문항과 공개 근거를 함께 기록했다.",
    examFormat: input.examFormat,
    examEvidenceStatus: "predicted_related",
  };
}

function theorySeeds(): TheorySeed[] {
  return [
    {
      id: "EXP-BAL-DEF-SURGING",
      title: "서징의 정의",
      stem: "서징이란 무엇인가?",
      modelAnswer:
        "서징은 원심 압축기가 저유량 불안정 영역에서 운전될 때 압력과 유량이 크게 주기적으로 변하고 역류가 생길 수 있는 불안정 현상이다.",
      answerDefinition:
        "저유량 불안정 영역에서 압력·유량이 주기적으로 변하고 역류 운전이 생길 수 있는 현상이다.",
      memoryTip: "서징은 ‘저유량 → 역류 → 압력·유량 맥동’으로 기억한다.",
      requiredKeywords: ["저유량 불안정 영역", "압력·유량 맥동", "역류"],
      conceptId: "PCON-SUP-003",
      writtenSourceQuestionIds: ["U-1324"],
    },
    {
      id: "EXP-BAL-DEF-ABBE",
      title: "아베의 원리",
      stem: "아베의 원리란 무엇인가?",
      modelAnswer:
        "정밀 길이측정에서 측정하려는 치수의 축과 기준 눈금축을 같은 직선 위에 배치하여 오프셋과 각도오차의 결합으로 생기는 측정오차를 줄이는 원리이다.",
      answerDefinition:
        "측정축과 기준 눈금축을 일치시켜 작은 기울어짐이 길이오차로 확대되는 것을 줄이는 원리이다.",
      memoryTip: "재는 축과 읽는 축을 한 줄로 맞춘다.",
      requiredKeywords: ["측정축", "기준 눈금축", "같은 직선", "아베 오차"],
      conceptId: "PCON-037",
      writtenSourceQuestionIds: ["U-073"],
      traps: [
        "눈금의 분해능이 높다는 사실만으로 아베 원리를 만족한다고 판단하지 않는다.",
        "두 축이 평행해도 서로 떨어져 있으면 아베 오프셋이 남는다.",
      ],
    },
    {
      id: "EXP-BAL-DEF-BOYLE",
      title: "보일의 법칙",
      stem: "보일의 법칙이란 무엇인가?",
      modelAnswer:
        "일정한 온도에서 일정량 기체의 압력은 체적에 반비례하며 P₁V₁=P₂V₂가 성립한다.",
      answerDefinition: "등온과정에서 압력과 체적의 곱은 일정하다.",
      memoryTip: "온도 일정: 압력↑ 체적↓, PV 일정.",
      requiredKeywords: ["온도 일정", "압력", "체적", "반비례"],
      conceptId: "PCON-SUP-003",
      writtenSourceQuestionIds: ["U-117"],
    },
    {
      id: "EXP-BAL-DEF-CHARLES",
      title: "샤를의 법칙",
      stem: "샤를의 법칙이란 무엇인가?",
      modelAnswer:
        "일정한 압력에서 일정량 기체의 체적은 절대온도에 비례하며 V₁/T₁=V₂/T₂가 성립한다.",
      answerDefinition: "정압과정에서 체적과 절대온도의 비는 일정하다.",
      memoryTip: "압력 일정: 절대온도↑ 체적↑.",
      requiredKeywords: ["압력 일정", "체적", "절대온도", "비례"],
      conceptId: "PCON-SUP-003",
      writtenSourceQuestionIds: ["U-806"],
    },
    {
      id: "EXP-BAL-DEF-BERNOULLI",
      title: "베르누이 정리",
      stem: "베르누이 정리란 무엇인가?",
      modelAnswer:
        "정상 유동하는 이상유체의 한 유선에서 압력수두·속도수두·위치수두의 합이 일정하다는 에너지보존 관계이다.",
      answerDefinition:
        "유체의 압력·속도·높이 사이의 기계적 에너지보존 관계이다.",
      memoryTip: "압력수두 + 속도수두 + 위치수두 = 일정.",
      requiredKeywords: ["정상 유동", "압력수두", "속도수두", "위치수두"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-133"],
    },
    {
      id: "EXP-BAL-DEF-CONTINUITY",
      title: "연속의 법칙",
      stem: "유체의 연속의 법칙이란 무엇인가?",
      modelAnswer:
        "정상 유동에서 질량유량이 각 단면에서 일정하다는 질량보존 법칙이며, 비압축성 유체는 A₁V₁=A₂V₂로 나타낸다.",
      answerDefinition:
        "유로 단면이 달라도 정상상태의 질량유량은 보존된다는 법칙이다.",
      memoryTip: "관이 좁아지면 속도가 빨라진다: AV 일정.",
      requiredKeywords: ["질량보존", "정상 유동", "A₁V₁=A₂V₂"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-896"],
    },
    {
      id: "EXP-BAL-DEF-REYNOLDS",
      title: "레이놀즈수",
      stem: "레이놀즈수란 무엇인가?",
      modelAnswer:
        "레이놀즈수는 유체의 관성력과 점성력의 비를 나타내며 배관 유동이 층류인지 난류인지 판단하는 무차원수이다.",
      answerDefinition: "관성력/점성력으로 유동상태를 구분하는 무차원수이다.",
      memoryTip: "Re = 관성력 ÷ 점성력, 층류·난류 판정.",
      requiredKeywords: ["관성력", "점성력", "무차원수", "층류·난류"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-402"],
    },
    {
      id: "EXP-BAL-DEF-CAVITATION",
      title: "캐비테이션",
      stem: "펌프의 캐비테이션이란 무엇인가?",
      modelAnswer:
        "펌프 흡입부 압력이 유체의 포화증기압보다 낮아져 기포가 생기고, 고압부에서 기포가 붕괴하며 소음·진동·침식을 일으키는 현상이다.",
      answerDefinition:
        "저압부에서 생긴 증기기포가 고압부에서 붕괴하는 현상이다.",
      memoryTip: "압력↓ → 기포 발생 → 붕괴 → 소음·진동·침식.",
      requiredKeywords: ["포화증기압", "기포 발생", "기포 붕괴", "침식"],
      conceptId: "PCON-SUP-006",
      writtenSourceQuestionIds: ["U-781"],
    },
    {
      id: "EXP-BAL-DEF-WATER-HAMMER",
      title: "수격작용",
      stem: "수격작용이란 무엇인가?",
      modelAnswer:
        "배관의 유체속도가 밸브 급폐쇄 등으로 급격히 변할 때 압력파가 발생하여 순간적인 압력상승과 충격·소음을 일으키는 현상이다.",
      answerDefinition:
        "유속의 급변으로 배관 안에 큰 압력파가 발생하는 현상이다.",
      memoryTip: "급정지한 물의 운동에너지가 압력파로 바뀐다.",
      requiredKeywords: ["유속 급변", "압력파", "순간 압력상승", "충격"],
      conceptId: "PCON-SUP-006",
      writtenSourceQuestionIds: ["U-203"],
    },
    {
      id: "EXP-BAL-DEF-RESONANCE",
      title: "공진",
      stem: "공진이란 무엇인가?",
      modelAnswer:
        "가진주파수가 계의 고유진동수와 일치하거나 가까워질 때 진폭이 크게 증가하는 현상이다.",
      answerDefinition:
        "가진주파수와 고유진동수가 일치하여 진폭이 커지는 현상이다.",
      memoryTip: "가진주파수 = 고유진동수 → 진폭 급증.",
      requiredKeywords: ["가진주파수", "고유진동수", "일치", "진폭 증가"],
      conceptId: "PCON-010",
      writtenSourceQuestionIds: ["U-RES-001"],
    },
    {
      id: "EXP-BAL-DEF-HYSTERESIS",
      title: "히스테리시스",
      stem: "센서의 히스테리시스란 무엇인가?",
      modelAnswer:
        "같은 입력값에서도 입력이 증가할 때와 감소할 때 센서 출력 또는 동작점이 서로 다르게 나타나는 이력 특성이다.",
      answerDefinition:
        "입력의 증가·감소 방향에 따라 같은 입력에서 출력이 달라지는 특성이다.",
      memoryTip: "올라갈 때와 내려갈 때의 동작점 차이.",
      requiredKeywords: ["같은 입력", "증가·감소 방향", "출력 차이", "이력"],
      conceptId: "PCON-SUP-014",
      writtenSourceQuestionIds: ["U-010"],
    },
    {
      id: "EXP-BAL-DEF-PITTING",
      title: "피팅",
      stem: "기어의 피팅이란 무엇인가?",
      modelAnswer:
        "반복되는 헤르츠 접촉응력으로 기어 치면에 작은 구멍 모양의 박리가 생기는 표면피로 손상이다.",
      answerDefinition:
        "반복 접촉응력에 의해 치면에 작은 박리구멍이 생기는 손상이다.",
      memoryTip: "피팅은 ‘작은 점 모양 박리’이다.",
      requiredKeywords: ["반복 접촉응력", "표면피로", "작은 박리구멍"],
      conceptId: "PCON-SUP-035",
      writtenSourceQuestionIds: ["U-161"],
    },
    {
      id: "EXP-BAL-DEF-SPALLING",
      title: "스폴링",
      stem: "기어의 스폴링이란 무엇인가?",
      modelAnswer:
        "반복 접촉피로로 표면 또는 표면 아래 균열이 성장하여 피팅보다 크고 불규칙한 조각이 떨어져 나가는 손상이다.",
      answerDefinition: "접촉피로 균열로 큰 조각이 박리되는 손상이다.",
      memoryTip: "피팅은 작은 구멍, 스폴링은 큰 조각 박리.",
      requiredKeywords: ["접촉피로", "균열 성장", "큰 조각 박리"],
      conceptId: "PCON-SUP-035",
      writtenSourceQuestionIds: ["U-388"],
    },
    {
      id: "EXP-BAL-DEF-SCORING",
      title: "스코어링",
      stem: "기어의 스코어링이란 무엇인가?",
      modelAnswer:
        "고하중·고온 또는 윤활불량으로 유막이 파괴되어 기어 치면이 국부 용착되고 미끄럼 방향으로 긁히는 손상이다.",
      answerDefinition:
        "유막파괴와 국부 용착으로 치면이 긁히는 손상이다.",
      memoryTip: "스코어링은 유막이 깨져 ‘긁히고 달라붙는’ 손상.",
      requiredKeywords: ["유막파괴", "국부 용착", "긁힘", "윤활불량"],
      conceptId: "PCON-SUP-035",
      writtenSourceQuestionIds: ["U-100"],
    },
    ...weldingDefectSeeds(),
    ...maintenanceTheorySeeds(),
  ];
}

function weldingDefectSeeds(): TheorySeed[] {
  const shared = {
    conceptId: "PCON-044",
    writtenSourceQuestionIds: ["U-931"],
  };
  return [
    {
      ...shared,
      id: "EXP-BAL-DEF-UNDERCUT",
      title: "용접 언더컷",
      stem: "용접결함 중 언더컷이란 무엇인가?",
      modelAnswer:
        "용접비드의 토우를 따라 모재가 파여 홈이 생기고 그 홈이 용착금속으로 충분히 채워지지 않은 결함이다.",
      answerDefinition: "비드 토우의 모재가 홈처럼 파인 결함이다.",
      memoryTip: "언더컷은 비드 가장자리가 ‘깎여 나간 홈’.",
      requiredKeywords: ["비드 토우", "모재", "홈", "미충전"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-OVERLAP",
      title: "용접 오버랩",
      stem: "용접결함 중 오버랩이란 무엇인가?",
      modelAnswer:
        "용착금속이 모재 표면 위로 흘러 겹쳐졌지만 그 경계가 모재와 충분히 융합되지 않은 결함이다.",
      answerDefinition: "용착금속이 융합되지 않은 채 모재 위로 겹친 결함이다.",
      memoryTip: "오버랩은 붙지 않고 ‘덮여 겹친’ 금속.",
      requiredKeywords: ["용착금속", "모재 표면", "겹침", "미융합"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-POROSITY",
      title: "용접 기공",
      stem: "용접결함 중 기공이란 무엇인가?",
      modelAnswer:
        "용접금속이 응고할 때 빠져나오지 못한 가스가 내부 또는 표면에 둥근 공동으로 남은 결함이다.",
      answerDefinition: "응고 중 갇힌 가스가 공동으로 남은 결함이다.",
      memoryTip: "기공은 용접금속 안에 갇힌 가스방울.",
      requiredKeywords: ["가스", "응고", "공동", "용접금속"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-SLAG-INCLUSION",
      title: "슬래그 혼입",
      stem: "용접결함 중 슬래그 혼입이란 무엇인가?",
      modelAnswer:
        "용접 중 생긴 슬래그가 제거되지 못하고 용접금속 내부나 패스 사이에 갇혀 남은 결함이다.",
      answerDefinition: "슬래그가 용접금속이나 패스 사이에 갇힌 결함이다.",
      memoryTip: "패스 사이 청소를 빼먹으면 슬래그가 안에 남는다.",
      requiredKeywords: ["슬래그", "용접금속 내부", "패스 사이", "혼입"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-LACK-PENETRATION",
      title: "용입불량",
      stem: "용접결함 중 용입불량이란 무엇인가?",
      modelAnswer:
        "용접금속이 이음부 루트까지 충분히 도달하지 못하여 요구된 이음 두께 전체가 용융·결합되지 않은 결함이다.",
      answerDefinition: "용접금속이 루트까지 충분히 도달하지 못한 결함이다.",
      memoryTip: "용입불량은 깊이가 부족해 루트까지 못 들어간 상태.",
      requiredKeywords: ["용접금속", "루트", "도달 부족", "용입"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-LACK-FUSION",
      title: "융합불량",
      stem: "용접결함 중 융합불량이란 무엇인가?",
      modelAnswer:
        "용접금속과 모재 또는 인접한 용접 패스 사이가 충분히 녹아 결합되지 않은 결함이다.",
      answerDefinition:
        "용접금속과 모재 또는 패스 사이가 충분히 융합되지 않은 결함이다.",
      memoryTip: "용입은 ‘깊이’, 융합은 ‘경계가 붙었는지’를 본다.",
      requiredKeywords: ["용접금속", "모재", "패스 사이", "미융합"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-CRATER",
      title: "용접 크레이터",
      stem: "용접결함 중 크레이터란 무엇인가?",
      modelAnswer:
        "용접을 끝낼 때 아크를 급히 끊어 용융금속이 충분히 보충되지 못하고 비드 끝에 오목하게 남은 부분이다.",
      answerDefinition: "비드 끝단이 충분히 채워지지 않아 오목하게 남은 결함이다.",
      memoryTip: "크레이터는 용접 끝의 ‘분화구’.",
      requiredKeywords: ["비드 끝", "아크 종료", "미충전", "오목함"],
    },
    {
      ...shared,
      id: "EXP-BAL-DEF-WELD-CRACK",
      title: "용접균열",
      stem: "용접결함 중 용접균열이란 무엇인가?",
      modelAnswer:
        "용접부의 응고·냉각 또는 사용 중 발생한 인장응력과 취약한 조직 때문에 용접금속이나 열영향부가 갈라진 결함이다.",
      answerDefinition:
        "용접금속 또는 열영향부가 응력과 취약조직으로 갈라진 결함이다.",
      memoryTip: "균열은 응력 + 취약조직 + 온도조건을 함께 본다.",
      requiredKeywords: ["용접금속", "열영향부", "인장응력", "갈라짐"],
    },
  ];
}

function maintenanceTheorySeeds(): TheorySeed[] {
  const maintenanceConcept = "PCON-029";
  return [
    {
      id: "EXP-BAL-DEF-BM",
      title: "사후보전(BM)",
      stem: "사후보전(BM)이란 무엇인가?",
      modelAnswer:
        "설비가 고장나거나 유해한 성능저하가 발생한 뒤 수리·교환하여 요구 기능을 회복하는 보전방식이다.",
      answerDefinition: "고장 발생 후 기능을 복구하는 보전이다.",
      memoryTip: "BM은 Breakdown 뒤에 Maintenance.",
      requiredKeywords: ["고장 후", "수리·교환", "기능 회복"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-883"],
    },
    {
      id: "EXP-BAL-DEF-PM",
      title: "예방보전(PM)",
      stem: "예방보전(PM)이란 무엇인가?",
      modelAnswer:
        "고장·정지·성능저하를 사전에 막기 위해 계획한 점검·정비·수리·교환을 실시하는 보전의 총칭이다.",
      answerDefinition: "고장이 나기 전에 계획적으로 실시하는 보전이다.",
      memoryTip: "PM은 고장 ‘전’에 점검·정비.",
      requiredKeywords: ["고장 전", "계획", "점검", "정비"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-579"],
    },
    {
      id: "EXP-BAL-DEF-TBM",
      title: "시간기준보전(TBM)",
      stem: "시간기준보전(TBM)이란 무엇인가?",
      modelAnswer:
        "달력시간·운전시간·작동횟수·생산량 등 미리 정한 주기에 따라 점검·수리·교환하는 예방보전 방식이다.",
      answerDefinition: "미리 정한 시간·횟수 주기로 실시하는 보전이다.",
      memoryTip: "TBM의 T는 Time, 정해진 주기.",
      requiredKeywords: ["정해진 주기", "운전시간", "횟수", "수리·교환"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-966"],
    },
    {
      id: "EXP-BAL-DEF-CBM",
      title: "상태기준보전(CBM)",
      stem: "상태기준보전(CBM)이란 무엇인가?",
      modelAnswer:
        "진동·온도·오일 등 설비 상태를 직접 감시하고 측정값이나 열화상태가 기준에 도달했을 때 정비하는 방식이다.",
      answerDefinition: "측정한 현재 상태를 기준으로 정비시점을 정하는 보전이다.",
      memoryTip: "CBM의 C는 Condition, 현재 상태가 기준.",
      requiredKeywords: ["상태감시", "진동·온도·오일", "판정기준", "정비시점"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-922"],
    },
    {
      id: "EXP-BAL-DEF-PDM",
      title: "예지보전(PdM)",
      stem: "예지보전(PdM)이란 무엇인가?",
      modelAnswer:
        "상태 데이터의 열화 추세와 진단모델을 이용해 고장시점이나 잔여수명을 예측하고 필요한 정비시점을 정하는 보전이다.",
      answerDefinition:
        "상태의 추세로 미래 고장시점·잔여수명을 예측하는 보전이다.",
      memoryTip: "CBM은 현재 기준, PdM은 미래 시점 예측.",
      requiredKeywords: ["상태 데이터", "열화 추세", "고장시점", "잔여수명"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-922", "U-163"],
    },
    {
      id: "EXP-BAL-DEF-CM",
      title: "개량보전(CM)",
      stem: "개량보전(CM)이란 무엇인가?",
      modelAnswer:
        "반복고장과 정비 불편의 원인을 제거하도록 기존 설비의 구조·부품·재질·작업방법을 개선하여 신뢰성·보전성·안전성을 높이는 활동이다.",
      answerDefinition: "기존 설비를 개선해 고장과 보전부담을 줄이는 보전이다.",
      memoryTip: "CM은 고친 뒤 끝이 아니라 구조를 Change.",
      requiredKeywords: ["기존 설비", "구조·부품 개선", "신뢰성", "보전성"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-828", "U-1309"],
    },
    {
      id: "EXP-BAL-DEF-MP",
      title: "보전예방(MP)",
      stem: "보전예방(MP)이란 무엇인가?",
      modelAnswer:
        "설비의 설계·제작·도입 단계부터 고장이 적고 점검·수리가 쉬운 구조가 되도록 과거 보전정보를 반영하는 활동이다.",
      answerDefinition:
        "설비를 만들고 들여오는 단계부터 고장과 보전부담을 예방하는 활동이다.",
      memoryTip: "개량보전은 기존 설비, 보전예방은 새 설비의 설계단계.",
      requiredKeywords: ["설계·도입 단계", "고장 감소", "정비 용이", "보전정보 반영"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-163"],
    },
    {
      id: "EXP-BAL-DEF-PRODUCTIVE",
      title: "생산보전",
      stem: "생산보전이란 무엇인가?",
      modelAnswer:
        "설비의 취득부터 운전·보전·폐기까지 전 생애주기비용을 줄이고 생산성과 설비효율을 높이도록 보전방식을 경제적으로 조합하는 활동이다.",
      answerDefinition:
        "설비 전 생애의 비용과 생산성을 함께 최적화하는 보전이다.",
      memoryTip: "생산보전은 LCC와 생산성을 함께 본다.",
      requiredKeywords: ["전 생애주기", "생애주기비용", "생산성", "설비효율"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-365"],
    },
    {
      id: "EXP-BAL-DEF-TPM",
      title: "종합적 생산보전(TPM)",
      stem: "종합적 생산보전(TPM)이란 무엇인가?",
      modelAnswer:
        "설비종합효율을 높이고 재해·고장·불량과 손실을 줄이기 위해 최고경영층부터 현장 운전원까지 전원이 참여하는 설비관리 활동이다.",
      answerDefinition:
        "전원참가로 설비종합효율과 손실제로를 추구하는 활동이다.",
      memoryTip: "TPM = 전원참가 + 설비종합효율 + 손실제로.",
      requiredKeywords: ["전원참가", "설비종합효율", "고장·불량", "손실제로"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-1004"],
    },
    {
      id: "EXP-BAL-DEF-MAINTENANCE-HISTORY",
      title: "설비보전 발전순서",
      stem: "다음 보전방식을 설비보전의 역사적 발전순서에 맞게 배열하시오.",
      promptOptions: [
        "종합적 생산보전(TPM)",
        "개량보전(CM)",
        "예방보전(PM)",
        "보전예방(MP)",
        "생산보전",
      ],
      modelAnswer:
        "예방보전(PM) → 생산보전 → 개량보전(CM) → 보전예방(MP) → 종합적 생산보전(TPM)",
      answerDefinition:
        "기출 분류는 예방 중심에서 생산성·설비개선·설계단계 예방·전원참가 체계로 확장되는 흐름을 묻는다.",
      memoryTip: "예-생-개-보-TPM.",
      requiredKeywords: ["예방보전", "생산보전", "개량보전", "보전예방", "TPM"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-1309"],
      examFormat: "sequence",
    },
    {
      id: "EXP-BAL-DEF-BATHTUB",
      title: "욕조곡선",
      stem: "설비 신뢰성의 욕조곡선이란 무엇인가?",
      modelAnswer:
        "시간에 따른 고장률이 초기고장기에는 감소하고 우발고장기에는 거의 일정하며 마모고장기에는 증가하는 욕조 모양의 고장률 곡선이다.",
      answerDefinition:
        "초기 감소·우발 일정·마모 증가의 세 구간으로 나타내는 고장률 곡선이다.",
      memoryTip: "초기 ↓, 우발 —, 마모 ↑.",
      requiredKeywords: ["초기고장기", "우발고장기", "마모고장기", "고장률"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-768", "U-963", "U-1246"],
    },
    {
      id: "EXP-BAL-DEF-MTBF-MTTR",
      title: "MTBF와 MTTR",
      stem: "MTBF와 MTTR의 뜻을 각각 쓰시오.",
      modelAnswer:
        "MTBF는 수리 가능한 설비의 고장과 다음 고장 사이 평균 운전시간이고, MTTR은 고장난 설비를 수리하여 복구하는 데 걸리는 평균시간이다.",
      answerDefinition:
        "MTBF는 고장 사이 평균시간, MTTR은 평균수리시간이다.",
      memoryTip: "BF는 Between Failures, TR은 To Repair.",
      requiredKeywords: ["평균고장간격", "평균수리시간", "운전시간", "복구시간"],
      conceptId: maintenanceConcept,
      writtenSourceQuestionIds: ["U-148", "U-226"],
    },
  ];
}

function formulaSeeds(): FormulaSeed[] {
  return [
    {
      id: "EXP-BAL-CALC-BOYLE",
      title: "보일 법칙 체적 계산",
      stem:
        "온도가 일정한 기체의 압력이 200 kPa에서 500 kPa로 변한다. 처음 체적이 0.30 m³일 때 나중 체적을 구하시오.",
      modelAnswer: "0.12 m³",
      calculation: ["P₁V₁=P₂V₂", "V₂=200×0.30/500=0.12 m³"],
      unit: "m³",
      answerDefinition: "등온과정에서는 압력과 체적의 곱이 일정하다.",
      memoryTip: "압력이 2.5배면 체적은 1/2.5배.",
      requiredKeywords: ["P₁V₁=P₂V₂", "0.12 m³"],
      conceptId: "PCON-SUP-003",
      writtenSourceQuestionIds: ["U-117"],
    },
    {
      id: "EXP-BAL-CALC-CHARLES",
      title: "샤를 법칙 체적 계산",
      stem:
        "압력이 일정한 기체의 체적이 300 K에서 2.0 L이다. 온도가 450 K가 되면 체적을 구하시오.",
      modelAnswer: "3.0 L",
      calculation: ["V₁/T₁=V₂/T₂", "V₂=2.0×450/300=3.0 L"],
      unit: "L",
      answerDefinition: "정압과정에서는 체적이 절대온도에 비례한다.",
      memoryTip: "섭씨가 아니라 절대온도 K를 쓴다.",
      requiredKeywords: ["V₁/T₁=V₂/T₂", "절대온도", "3.0 L"],
      conceptId: "PCON-SUP-003",
      writtenSourceQuestionIds: ["U-806"],
    },
    {
      id: "EXP-BAL-CALC-CONTINUITY",
      title: "연속방정식 유속 계산",
      stem:
        "비압축성 유체가 지름 50 mm 관에서 2 m/s로 흐르다가 지름 25 mm 관으로 들어간다. 작은 관의 평균유속을 구하시오.",
      modelAnswer: "8 m/s",
      calculation: [
        "A₁V₁=A₂V₂",
        "V₂=(D₁/D₂)²V₁=(50/25)²×2=8 m/s",
      ],
      unit: "m/s",
      answerDefinition: "비압축성 정상유동에서는 체적유량 Q=AV가 일정하다.",
      memoryTip: "지름이 절반이면 면적은 1/4, 속도는 4배.",
      requiredKeywords: ["A₁V₁=A₂V₂", "면적비", "8 m/s"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-896"],
    },
    {
      id: "EXP-BAL-CALC-TORRICELLI",
      title: "토리첼리 유출량 계산",
      stem:
        "수면과 출구의 높이차가 5 m이고 출구면적이 0.001 m²이다. 중력가속도를 9.81 m/s²로 할 때 이상 유출량을 구하시오.",
      modelAnswer: "0.00990 m³/s",
      calculation: [
        "v=√(2gh)=√(2×9.81×5)=9.90 m/s",
        "Q=Av=0.001×9.90=0.00990 m³/s",
      ],
      unit: "m³/s",
      answerDefinition: "토리첼리 정리는 위치수두를 유출속도로 바꾼다.",
      memoryTip: "먼저 속도 √(2gh), 다음 유량 A×v.",
      requiredKeywords: ["v=√(2gh)", "Q=Av", "0.00990 m³/s"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-344"],
    },
    {
      id: "EXP-BAL-CALC-REYNOLDS",
      title: "레이놀즈수 계산",
      stem:
        "밀도 1000 kg/m³, 평균유속 2 m/s, 관지름 0.05 m, 점도 0.001 Pa·s인 유체의 레이놀즈수를 구하시오.",
      modelAnswer: "100,000",
      calculation: ["Re=ρVD/μ", "Re=1000×2×0.05/0.001=100,000"],
      unit: "무차원",
      answerDefinition: "레이놀즈수는 관성력과 점성력의 비이다.",
      memoryTip: "밀도·속도·지름은 분자, 점도는 분모.",
      requiredKeywords: ["Re=ρVD/μ", "100,000", "무차원"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-402"],
    },
    {
      id: "EXP-BAL-CALC-RMS",
      title: "진동 피크값의 실효값 계산",
      stem:
        "정현파 진동속도의 피크값이 14.14 mm/s일 때 실효값 RMS를 구하시오.",
      modelAnswer: "10.00 mm/s RMS",
      calculation: ["RMS=Peak/√2", "14.14/√2=10.00 mm/s RMS"],
      unit: "mm/s RMS",
      answerDefinition: "정현파의 실효값은 피크값의 1/√2이다.",
      memoryTip: "정현파 RMS는 피크의 약 0.707배.",
      requiredKeywords: ["RMS=Peak/√2", "10.00 mm/s RMS"],
      conceptId: "PCON-010",
      writtenSourceQuestionIds: ["U-RMS-001"],
    },
    {
      id: "EXP-BAL-CALC-GMF",
      title: "기어 맞물림주파수 계산",
      stem:
        "잇수 48개인 기어가 1200 rpm으로 회전할 때 기어 맞물림주파수 GMF를 구하시오.",
      modelAnswer: "960 Hz",
      calculation: ["회전주파수=1200/60=20 Hz", "GMF=48×20=960 Hz"],
      unit: "Hz",
      answerDefinition: "GMF는 기어 잇수와 회전주파수의 곱이다.",
      memoryTip: "rpm을 60으로 나눈 뒤 잇수를 곱한다.",
      requiredKeywords: ["회전주파수", "잇수×회전주파수", "960 Hz"],
      conceptId: "PCON-SUP-033",
      writtenSourceQuestionIds: ["U-011"],
    },
    {
      id: "EXP-BAL-CALC-BEARING-LIFE",
      title: "볼베어링 기본정격수명 계산",
      stem:
        "볼베어링의 기본동정격하중 C가 30 kN, 등가동하중 P가 10 kN일 때 기본정격수명 L10을 백만 회전 단위로 구하시오.",
      modelAnswer: "27 백만 회전",
      calculation: ["L10=(C/P)³", "L10=(30/10)³=27 백만 회전"],
      unit: "백만 회전",
      answerDefinition: "볼베어링 수명지수는 3이다.",
      memoryTip: "볼은 3제곱, 롤러는 10/3제곱.",
      requiredKeywords: ["L10=(C/P)³", "27 백만 회전"],
      conceptId: "PCON-SUP-035",
      writtenSourceQuestionIds: ["U-077"],
    },
    {
      id: "EXP-BAL-CALC-AVAILABILITY",
      title: "설비 가용도 계산",
      stem:
        "MTBF가 180시간, MTTR이 20시간인 수리 가능한 설비의 정상상태 가용도를 구하시오.",
      modelAnswer: "90%",
      calculation: ["A=MTBF/(MTBF+MTTR)", "A=180/(180+20)×100=90%"],
      unit: "%",
      answerDefinition: "가용도는 운전 가능한 시간의 비율이다.",
      memoryTip: "고장 사이 시간 ÷ (고장 사이 시간 + 수리시간).",
      requiredKeywords: ["MTBF", "MTTR", "A=MTBF/(MTBF+MTTR)", "90%"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-201"],
    },
    {
      id: "EXP-BAL-CALC-TIME-RATE",
      title: "시간가동률 계산",
      stem:
        "부하시간이 480분이고 고장·준비 등 정지시간이 48분일 때 시간가동률을 구하시오.",
      modelAnswer: "90%",
      calculation: [
        "가동시간=480-48=432분",
        "시간가동률=432/480×100=90%",
      ],
      unit: "%",
      answerDefinition: "시간가동률은 부하시간 중 실제 가동 가능한 시간의 비율이다.",
      memoryTip: "부하시간에서 정지시간을 먼저 뺀다.",
      requiredKeywords: ["부하시간", "정지시간", "90%"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-178"],
    },
    {
      id: "EXP-BAL-CALC-SPRING",
      title: "직렬 스프링 등가강성 계산",
      stem:
        "강성이 각각 300 N/mm와 600 N/mm인 두 스프링을 직렬 연결했을 때 등가강성을 구하시오.",
      modelAnswer: "200 N/mm",
      calculation: [
        "keq=k₁k₂/(k₁+k₂)",
        "keq=300×600/(300+600)=200 N/mm",
      ],
      unit: "N/mm",
      answerDefinition: "직렬 스프링은 변위가 합해져 등가강성이 작아진다.",
      memoryTip: "직렬 등가강성은 가장 작은 강성보다도 작다.",
      requiredKeywords: ["keq=k₁k₂/(k₁+k₂)", "200 N/mm"],
      conceptId: "PCON-SUP-033",
      writtenSourceQuestionIds: ["U-221"],
    },
    {
      id: "EXP-BAL-CALC-NATURAL-FREQUENCY",
      title: "질량-스프링계 고유진동수 계산",
      stem:
        "질량 5 kg, 스프링강성 20,000 N/m인 비감쇠 1자유도계의 고유진동수를 구하시오.",
      modelAnswer: "10.07 Hz",
      calculation: [
        "fn=(1/2π)√(k/m)",
        "fn=(1/2π)√(20000/5)=10.07 Hz",
      ],
      unit: "Hz",
      answerDefinition: "고유진동수는 강성의 제곱근에 비례하고 질량의 제곱근에 반비례한다.",
      memoryTip: "k는 위, m은 아래, 전체에 제곱근.",
      requiredKeywords: ["fn=(1/2π)√(k/m)", "10.07 Hz"],
      conceptId: "PCON-SUP-033",
      writtenSourceQuestionIds: ["U-416"],
    },
    {
      id: "EXP-BAL-CALC-ACCELERATION",
      title: "진동속도에서 가속도 계산",
      stem:
        "주파수 50 Hz인 정현파 진동의 속도 피크값이 0.02 m/s일 때 가속도 피크값을 구하시오.",
      modelAnswer: "6.28 m/s²",
      calculation: ["a=2πfv", "a=2π×50×0.02=6.28 m/s²"],
      unit: "m/s²",
      answerDefinition: "정현파에서 가속도 피크값은 각주파수와 속도 피크값의 곱이다.",
      memoryTip: "속도에서 가속도로 갈 때 2πf를 곱한다.",
      requiredKeywords: ["a=2πfv", "6.28 m/s²"],
      conceptId: "PCON-010",
      writtenSourceQuestionIds: ["U-417"],
    },
    {
      id: "EXP-BAL-CALC-SOUND-POWER",
      title: "점음원 음향파워 계산",
      stem:
        "자유공간의 점음원에서 거리 2 m 지점의 음의 세기가 0.5 W/m²일 때 음향파워를 구하시오.",
      modelAnswer: "25.13 W",
      calculation: ["W=4πr²I", "W=4π×2²×0.5=25.13 W"],
      unit: "W",
      answerDefinition: "점음원의 에너지는 구면 4πr²에 퍼진다.",
      memoryTip: "구의 면적 4πr² × 음의 세기.",
      requiredKeywords: ["W=4πr²I", "25.13 W"],
      conceptId: "PCON-SUP-033",
      writtenSourceQuestionIds: ["U-340"],
    },
    {
      id: "EXP-BAL-CALC-PUMP-POWER",
      title: "펌프 수동력 계산",
      stem:
        "양정 50 m, 유량 50 m³/min, 물의 비중량 1000 kgf/m³일 때 펌프 수동력을 구하시오.",
      modelAnswer: "약 555.6 PS",
      calculation: [
        "수동력 PS=γQH/4500",
        "1000×50×50/4500=555.6 PS",
      ],
      unit: "PS",
      answerDefinition: "펌프 수동력은 단위시간에 유체에 전달한 위치에너지이다.",
      memoryTip: "kgf·m³/min 단위식의 분모는 4500.",
      requiredKeywords: ["γQH/4500", "555.6 PS"],
      conceptId: "PCON-SUP-006",
      writtenSourceQuestionIds: ["U-376"],
    },
    {
      id: "EXP-BAL-CALC-SPINDLE",
      title: "스핀들 이송거리 계산",
      stem:
        "스핀들 리드가 5 mm이고 모터가 144° 회전했을 때 이송거리를 구하시오.",
      modelAnswer: "2.0 mm",
      calculation: ["S=h×a/360", "S=5×144/360=2.0 mm"],
      unit: "mm",
      answerDefinition: "한 바퀴 360° 회전할 때 리드만큼 이동한다.",
      memoryTip: "리드 × 회전각/360.",
      requiredKeywords: ["S=h×a/360", "2.0 mm"],
      conceptId: "PCON-SUP-027",
      writtenSourceQuestionIds: ["U-559"],
    },
    {
      id: "EXP-BAL-CALC-OHM",
      title: "옴의 법칙 전류 계산",
      stem:
        "24 V 전원에 12 Ω 저항을 연결했을 때 흐르는 전류를 구하시오.",
      modelAnswer: "2 A",
      calculation: ["V=IR", "I=V/R=24/12=2 A"],
      unit: "A",
      answerDefinition: "옴의 법칙은 전압·전류·저항의 관계 V=IR이다.",
      memoryTip: "전류는 전압을 저항으로 나눈다.",
      requiredKeywords: ["V=IR", "I=V/R", "2 A"],
      conceptId: "PCON-SUP-040",
      writtenSourceQuestionIds: ["U-634"],
    },
    {
      id: "EXP-BAL-CALC-NYQUIST",
      title: "나이퀴스트 샘플링시간 계산",
      stem:
        "측정신호의 최대주파수가 1000 Hz일 때 앨리어싱을 피하기 위한 최대 샘플링시간 Δt를 구하시오.",
      modelAnswer: "0.0005 s 이하",
      calculation: ["fs≥2fmax", "Δt≤1/(2fmax)=1/2000=0.0005 s"],
      unit: "s",
      answerDefinition: "샘플링주파수는 신호 최대주파수의 두 배 이상이어야 한다.",
      memoryTip: "두 배 이상으로 찍고, 시간은 그 역수 이하.",
      requiredKeywords: ["fs≥2fmax", "Δt≤1/(2fmax)", "0.0005 s"],
      conceptId: "PCON-SUP-040",
      writtenSourceQuestionIds: ["U-865"],
    },
    {
      id: "EXP-BAL-CALC-OEE",
      title: "설비종합효율(OEE) 계산",
      stem:
        "시간가동률 90%, 성능가동률 95%, 양품률 98%일 때 설비종합효율 OEE를 구하시오.",
      modelAnswer: "83.79%",
      calculation: ["OEE=0.90×0.95×0.98×100", "OEE=83.79%"],
      unit: "%",
      answerDefinition: "OEE는 시간가동률·성능가동률·양품률의 곱이다.",
      memoryTip: "세 비율을 소수로 바꿔 곱한 뒤 100을 곱한다.",
      requiredKeywords: ["시간가동률", "성능가동률", "양품률", "83.79%"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-1203"],
    },
    {
      id: "EXP-BAL-CALC-PHASE",
      title: "두 진동신호 위상차 계산",
      stem:
        "주파수 50 Hz인 두 정현파 신호의 시간차가 0.002 s일 때 위상차를 구하시오.",
      modelAnswer: "36°",
      calculation: ["φ=360fΔt", "φ=360×50×0.002=36°"],
      unit: "°",
      answerDefinition: "한 주기 1/f가 360°이므로 시간차를 각도로 환산할 수 있다.",
      memoryTip: "360 × 주파수 × 시간차.",
      requiredKeywords: ["φ=360fΔt", "36°"],
      conceptId: "PCON-010",
      writtenSourceQuestionIds: ["U-1240"],
    },
    {
      id: "EXP-BAL-CALC-SLIP",
      title: "유도전동기 슬립 계산",
      stem:
        "동기속도 1500 rpm인 유도전동기가 1440 rpm으로 회전할 때 슬립을 백분율로 구하시오.",
      modelAnswer: "4%",
      calculation: ["s=(Ns-N)/Ns×100", "s=(1500-1440)/1500×100=4%"],
      unit: "%",
      answerDefinition: "슬립은 동기속도와 실제속도의 차이를 동기속도로 나눈 값이다.",
      memoryTip: "동기속도에서 실제속도를 뺀다.",
      requiredKeywords: ["s=(Ns-N)/Ns×100", "4%"],
      conceptId: "PCON-SUP-036",
      writtenSourceQuestionIds: ["U-1035"],
    },
    {
      id: "EXP-BAL-CALC-FAILURE-RATE",
      title: "설비 고장률 계산",
      stem:
        "설비가 총 3000시간 운전하는 동안 6회 고장났을 때 시간당 고장률을 구하시오.",
      modelAnswer: "0.002 회/시간",
      calculation: ["고장률=고장횟수/총 가동시간", "λ=6/3000=0.002 회/시간"],
      unit: "회/시간",
      answerDefinition: "고장률은 단위 운전시간당 발생한 고장횟수이다.",
      memoryTip: "고장횟수를 총 가동시간으로 나눈다.",
      requiredKeywords: ["고장횟수", "총 가동시간", "0.002 회/시간"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-590"],
    },
    {
      id: "EXP-BAL-CALC-REPAIR-RATE",
      title: "수리율 계산",
      stem:
        "평균수리시간 MTTR이 8시간인 설비의 시간당 수리율 μ를 구하시오.",
      modelAnswer: "0.125 회/시간",
      calculation: ["μ=1/MTTR", "μ=1/8=0.125 회/시간"],
      unit: "회/시간",
      answerDefinition: "지수분포를 가정하면 수리율은 평균수리시간의 역수이다.",
      memoryTip: "수리율은 MTTR의 역수.",
      requiredKeywords: ["μ=1/MTTR", "0.125 회/시간"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-226"],
    },
    {
      id: "EXP-BAL-CALC-PROPORTIONAL-BAND",
      title: "비례대와 비례게인 계산",
      stem:
        "비례대 PB가 20%인 비례제어기의 비례게인 Kc를 구하시오.",
      modelAnswer: "5",
      calculation: ["Kc=100/PB", "Kc=100/20=5"],
      unit: "무차원",
      answerDefinition: "비례게인과 비례대(%)는 서로 역비례한다.",
      memoryTip: "PB가 작을수록 Kc는 커진다.",
      requiredKeywords: ["Kc=100/PB", "5"],
      conceptId: "PCON-SUP-040",
      writtenSourceQuestionIds: ["U-817"],
    },
    {
      id: "EXP-BAL-CALC-DEMAND-FACTOR",
      title: "수요율 계산",
      stem:
        "총 설비용량이 500 kW이고 최대수요전력이 400 kW일 때 수요율을 구하시오.",
      modelAnswer: "80%",
      calculation: ["수요율=최대수요전력/총 설비용량×100", "400/500×100=80%"],
      unit: "%",
      answerDefinition: "수요율은 설치용량 중 실제 최대수요가 차지한 비율이다.",
      memoryTip: "최대수요를 총 설비용량으로 나눈다.",
      requiredKeywords: ["최대수요전력", "총 설비용량", "80%"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-831"],
    },
    {
      id: "EXP-BAL-CALC-PRODUCTIVITY",
      title: "생산성 계산",
      stem:
        "300 인·시간을 투입해 제품 1200개를 생산했을 때 노동생산성을 구하시오.",
      modelAnswer: "4 개/인·시간",
      calculation: ["생산성=산출량/투입량", "1200/300=4 개/인·시간"],
      unit: "개/인·시간",
      answerDefinition: "생산성은 투입 대비 산출의 효율이다.",
      memoryTip: "산출량을 투입량으로 나눈다.",
      requiredKeywords: ["산출량", "투입량", "4 개/인·시간"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-868"],
    },
    {
      id: "EXP-BAL-CALC-LOAD-FACTOR",
      title: "부하율 계산",
      stem:
        "일정기간의 평균부하가 300 kW이고 최대부하가 500 kW일 때 부하율을 구하시오.",
      modelAnswer: "60%",
      calculation: ["부하율=평균부하/최대부하×100", "300/500×100=60%"],
      unit: "%",
      answerDefinition: "부하율은 평균부하가 최대부하에 얼마나 가까운지 나타낸다.",
      memoryTip: "평균을 최대로 나눈다.",
      requiredKeywords: ["평균부하", "최대부하", "60%"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-767"],
    },
    {
      id: "EXP-BAL-CALC-PERT",
      title: "PERT 기대시간 계산",
      stem:
        "PERT에서 낙관시간 4일, 최빈시간 7일, 비관시간 16일일 때 기대시간을 구하시오.",
      modelAnswer: "8일",
      calculation: ["te=(a+4m+b)/6", "te=(4+4×7+16)/6=8일"],
      unit: "일",
      answerDefinition: "PERT 기대시간은 최빈시간에 4의 가중치를 둔 가중평균이다.",
      memoryTip: "낙관 1, 최빈 4, 비관 1.",
      requiredKeywords: ["te=(a+4m+b)/6", "8일"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-1005"],
    },
    {
      id: "EXP-BAL-CALC-ABSOLUTE-PRESSURE",
      title: "절대압력 계산",
      stem:
        "게이지압력이 250 kPa이고 대기압이 101.325 kPa일 때 절대압력을 구하시오.",
      modelAnswer: "351.325 kPa",
      calculation: [
        "절대압력=대기압+게이지압력",
        "101.325+250=351.325 kPa",
      ],
      unit: "kPa",
      answerDefinition: "양의 게이지압력은 대기압을 기준으로 한 압력이다.",
      memoryTip: "절대압력은 대기압을 더한다.",
      requiredKeywords: ["대기압", "게이지압력", "351.325 kPa"],
      conceptId: "PCON-032",
      writtenSourceQuestionIds: ["U-1052"],
    },
    {
      id: "EXP-BAL-CALC-PERFORMANCE-RATE",
      title: "성능가동률 계산",
      stem:
        "속도가동률이 95%이고 실질가동률이 92%일 때 성능가동률을 구하시오.",
      modelAnswer: "87.4%",
      calculation: ["성능가동률=속도가동률×실질가동률", "0.95×0.92×100=87.4%"],
      unit: "%",
      answerDefinition: "성능가동률은 속도손실과 순간정지손실을 함께 반영한다.",
      memoryTip: "나누지 말고 두 가동률을 곱한다.",
      requiredKeywords: ["속도가동률", "실질가동률", "87.4%"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-769"],
    },
    {
      id: "EXP-BAL-CALC-UNIT-MAINTENANCE-COST",
      title: "제품 단위당 보전비 계산",
      stem:
        "총보전비가 18,000,000원이고 생산량이 60,000개일 때 제품 단위당 보전비를 구하시오.",
      modelAnswer: "300 원/개",
      calculation: ["단위당 보전비=총보전비/생산량", "18,000,000/60,000=300 원/개"],
      unit: "원/개",
      answerDefinition: "제품 단위당 보전비는 생산량 한 단위에 배부되는 보전비이다.",
      memoryTip: "총보전비를 생산량으로 나눈다.",
      requiredKeywords: ["총보전비", "생산량", "300 원/개"],
      conceptId: "PCON-029",
      writtenSourceQuestionIds: ["U-650"],
    },
    {
      id: "EXP-BAL-CALC-WAVE-FREQUENCY",
      title: "파장으로 주파수 계산",
      stem:
        "음속이 340 m/s이고 파장이 0.68 m일 때 주파수를 구하시오.",
      modelAnswer: "500 Hz",
      calculation: ["v=fλ", "f=v/λ=340/0.68=500 Hz"],
      unit: "Hz",
      answerDefinition: "파동속도는 주파수와 파장의 곱이다.",
      memoryTip: "주파수는 속도를 파장으로 나눈다.",
      requiredKeywords: ["v=fλ", "500 Hz"],
      conceptId: "PCON-SUP-033",
      writtenSourceQuestionIds: ["U-042"],
    },
  ];
}

function buildTheoryQuestions(
  concepts: PracticalConcept[],
  writtenQuestions: WrittenQuestionExcerpt[],
) {
  return theorySeeds().map((seed) => {
    const concept = conceptById(concepts, seed.conceptId);
    const sources =
      seed.id === "EXP-BAL-DEF-SURGING"
        ? [OFFICIAL_SURGE_SOURCE, ...concept.ncsSources.slice(0, 1)]
        : evidenceSources(
            concept,
            seed.writtenSourceQuestionIds,
            writtenQuestions,
          );
    seed.writtenSourceQuestionIds.forEach((id) =>
      writtenById(writtenQuestions, id),
    );
    return baseQuestion({
      ...seed,
      category: "theory_concept",
      concept,
      sourceOverride: sources,
      examFormat: seed.examFormat ?? "definition",
    });
  });
}

function buildFormulaQuestions(
  concepts: PracticalConcept[],
  writtenQuestions: WrittenQuestionExcerpt[],
) {
  return formulaSeeds().map((seed) => {
    const concept = conceptById(concepts, seed.conceptId);
    seed.writtenSourceQuestionIds.forEach((id) =>
      writtenById(writtenQuestions, id),
    );
    return baseQuestion({
      ...seed,
      category: "formula_calculation",
      concept,
      sourceOverride: evidenceSources(
        concept,
        seed.writtenSourceQuestionIds,
        writtenQuestions,
      ),
      examFormat: "calculation",
    });
  });
}

function buildBrakeLiningQuestion(
  concepts: PracticalConcept[],
  writtenQuestions: WrittenQuestionExcerpt[],
) {
  const concept = conceptById(concepts, "PCON-SUP-030");
  const canonical = [
    "설비를 정지·고정하고 유압·회전 위험을 제거한다.",
    "마찰재의 잔량·균열·편마모·오염·체결상태를 확인한다.",
    "드럼·디스크와 작동부의 손상·간극·누설 상태를 확인한다.",
    "제조사 기준에 따라 교환·조정한 뒤 제동시험과 기록을 수행한다.",
  ];
  const promptOptions = [canonical[2], canonical[0], canonical[3], canonical[1]];
  const labelByStep = ["(나)", "(라)", "(가)", "(다)"];
  return baseQuestion({
    id: "EXP-BAL-PROC-BRAKE-LINING",
    category: "work_procedure",
    title: "브레이크 라이닝·패드 점검 순서",
    stem:
      "다음 보기를 브레이크 라이닝·패드의 안전한 점검과 교환 판단 순서에 맞게 배열하시오.",
    promptOptions,
    modelAnswer: `${labelByStep.join(" → ")}\n${canonical.join(" → ")}`,
    answerDefinition:
      "브레이크 라이닝·패드는 에너지 차단 후 마찰재와 상대면·작동부를 함께 점검하고 기준에 따라 조치·시험한다.",
    memoryTip: "정지·격리 → 마찰재 → 상대면·작동부 → 조치·시험.",
    concept,
    requiredKeywords: ["정지·격리", "마찰재 점검", "상대면·작동부", "제동시험"],
    writtenSourceQuestionIds: ["U-660"],
    sourceOverride: evidenceSources(concept, ["U-660"], writtenQuestions),
    examFormat: "sequence",
    traps: [
      "그림 판독 문제가 아니라 제시된 문장 보기의 순서를 맞추는 문제이다.",
      "마찰재만 보고 드럼·디스크와 작동부 상태를 생략하지 않는다.",
    ],
  });
}

function assertCuratedQuality(
  existingQuestions: PracticalQuestion[],
  additions: PracticalQuestion[],
) {
  const existingPrompts = new Set(
    existingQuestions.map((question) => normalize(question.stem)),
  );
  const additionPrompts = additions.map((question) => normalize(question.stem));
  const duplicateExisting = additions.find((question) =>
    existingPrompts.has(normalize(question.stem)),
  );
  if (duplicateExisting) {
    throw new Error(`기존 문항과 중복된 선별 예상문제: ${duplicateExisting.id}`);
  }
  if (new Set(additionPrompts).size !== additionPrompts.length) {
    throw new Error("선별 예상문제 안에 동일한 질문 문장이 있습니다.");
  }

  const formulaTitles = additions
    .filter(
      (question) =>
        question.primaryStudyCategoryId === "formula_calculation",
    )
    .map((question) => question.title);
  if (new Set(formulaTitles).size !== formulaTitles.length) {
    throw new Error("동일 계산식 계열이 숫자만 바뀌어 반복되었습니다.");
  }
  if (
    additions.some((question) => /^시각자료 판독 \d+$/.test(question.title))
  ) {
    throw new Error("일련번호형 시각자료 패딩 문항은 공개할 수 없습니다.");
  }
  if (
    additions.some(
      (question) =>
        !question.answerDefinition ||
        !question.memoryTip ||
        !question.writtenSourceQuestionIds?.length ||
        !isLearnerVisiblePracticalQuestion(question),
    )
  ) {
    throw new Error("선별 예상문제의 정의·암기팁·필기 근거가 불완전합니다.");
  }
}

export function buildBalancedPracticalPredictedQuestions({
  existingQuestions,
  concepts,
  writtenQuestions,
}: BuildInput) {
  const additions = [
    ...buildTheoryQuestions(concepts, writtenQuestions),
    ...buildFormulaQuestions(concepts, writtenQuestions),
    buildBrakeLiningQuestion(concepts, writtenQuestions),
  ];
  assertCuratedQuality(existingQuestions, additions);
  return additions;
}
