import { z } from "zod";

const commonActivityShape = {
  id: z.string().min(1),
  groupId: z.string().min(1),
  familyId: z.string().min(1),
  goal: z.string().min(20),
  prompt: z.string().min(20),
  hints: z.array(z.string().min(15)).min(2).max(3),
  gradingPolicy: z.literal("exploration:no-answer"),
  sourceRefs: z.array(z.string().min(1)).min(1),
  questionIds: z
    .array(z.string().regex(/^(?:U-\d+|WELD-PROC-\d{3})$/u))
    .min(1),
  status: z.literal("published"),
  version: z.number().int().positive(),
};

const accumulatorActivitySchema = z.object({
  ...commonActivityShape,
  type: z.literal("accumulator-pressure"),
  config: z.object({
    minRatio: z.number().positive(),
    maxRatio: z.number().positive(),
    initialRatio: z.number().positive(),
    step: z.number().positive(),
  }).refine(
    ({ minRatio, maxRatio, initialRatio }) =>
      minRatio < initialRatio && initialRatio < maxRatio,
    "초기 압력비는 최소값과 최대값 사이여야 합니다.",
  ),
});

const pidActivitySchema = z.object({
  ...commonActivityShape,
  type: z.literal("pid-effects"),
  config: z.object({
    min: z.literal(0),
    max: z.literal(100),
    step: z.number().int().positive(),
    initial: z.object({
      kp: z.number().min(0).max(100),
      ki: z.number().min(0).max(100),
      kd: z.number().min(0).max(100),
    }),
  }),
});

const weldingOptionSchema = z.object({
  id: z.enum([
    "fusion",
    "pressure",
    "brazing",
    "smaw",
    "gtaw",
    "gmaw",
    "fcaw",
    "saw",
  ]),
  label: z.string().min(1),
  baseMetal: z.string().min(1),
  pressure: z.string().min(1),
  filler: z.string().min(1),
  principle: z.string().min(15),
  examples: z.array(z.string().min(1)).min(2),
  examTrap: z.string().min(15),
});

const weldingActivitySchema = z.object({
  ...commonActivityShape,
  type: z.literal("welding-classification"),
  config: z
    .object({
      initialOptionId: weldingOptionSchema.shape.id,
      options: z.array(weldingOptionSchema).min(3).max(5),
    })
    .superRefine(({ initialOptionId, options }, context) => {
      const optionIds = options.map((option) => option.id);

      if (!optionIds.includes(initialOptionId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialOptionId"],
          message: "초기 선택 항목은 options에 포함되어야 합니다.",
        });
      }

      if (new Set(optionIds).size !== optionIds.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "용접 비교 항목 ID는 중복될 수 없습니다.",
        });
      }
    }),
});

export const textbookActivitySchema = z.discriminatedUnion("type", [
  accumulatorActivitySchema,
  pidActivitySchema,
  weldingActivitySchema,
]);

export type TextbookActivity = z.infer<typeof textbookActivitySchema>;

const textbookActivities = z.array(textbookActivitySchema).parse([
  {
    id: "activity-s1-g02-accumulator-pressure-v1",
    groupId: "s1-g02",
    familyId: "accumulator",
    type: "accumulator-pressure",
    goal:
      "봉입가스 압력과 계통 압력의 상대관계로 작동유의 유입 가능성과 에너지 저장 방향을 설명할 수 있다.",
    prompt:
      "계통 압력에 대한 봉입가스 압력의 비를 바꾸면서 가스와 작동유가 어느 방향으로 움직이는지 확인하세요.",
    hints: [
      "가스는 압축되지만 작동유는 거의 압축되지 않는다는 차이부터 확인하세요.",
      "작동유가 들어가려면 계통 압력이 봉입가스 압력보다 높아야 합니다.",
    ],
    gradingPolicy: "exploration:no-answer",
    sourceRefs: [
      "lesson:lesson-1p4lwku",
      "lesson:lesson-sttpqh",
      "question:U-253",
      "question:U-554",
    ],
    questionIds: ["U-253", "U-334", "U-490", "U-554", "U-620"],
    status: "published",
    version: 1,
    config: {
      minRatio: 0.2,
      maxRatio: 1.2,
      initialRatio: 0.8,
      step: 0.05,
    },
  },
  {
    id: "activity-s1-g11-pid-effects-v1",
    groupId: "s1-g11",
    familyId: "action",
    type: "pid-effects",
    goal:
      "P·I·D 각 항이 현재 편차, 누적 편차, 변화율 중 무엇에 반응하며 어떤 부작용을 만드는지 비교할 수 있다.",
    prompt:
      "세 항의 상대적인 크기를 바꾸고 응답속도, 정상편차, 오버슈트와 측정 잡음에 미치는 정성적 경향을 비교하세요.",
    hints: [
      "현재값·누적값·변화 속도 중 각 항이 어떤 정보를 사용하는지 먼저 구분하세요.",
      "정상편차 제거에는 I가, 급격한 변화의 제동에는 D가 기여하지만 각각 적분 포화와 잡음 민감도라는 대가가 있습니다.",
    ],
    gradingPolicy: "exploration:no-answer",
    sourceRefs: [
      "lesson:lesson-1mrxdrs",
      "lesson:lesson-ci3c1r",
      "lesson:lesson-bx3sdi",
      "question:U-030",
      "question:U-683",
      "question:U-556",
    ],
    questionIds: ["U-030", "U-683", "U-556"],
    status: "published",
    version: 1,
    config: {
      min: 0,
      max: 100,
      step: 5,
      initial: { kp: 45, ki: 25, kd: 20 },
    },
  },
  {
    id: "activity-s2-g01-welding-classification-v1",
    groupId: "s2-g01",
    familyId: "classification",
    type: "welding-classification",
    goal:
      "공정 이름이 아니라 모재 용융, 가압력, 용가재의 상태를 근거로 융접·압접·납땜을 구분할 수 있다.",
    prompt:
      "세 분류를 차례로 선택해 모재가 녹는지, 압력이 핵심인지, 무엇이 용융되는지를 비교하세요.",
    hints: [
      "전기나 열을 사용한다는 공통점보다 모재가 실제로 녹는지를 먼저 확인하세요.",
      "저항용접은 접촉저항열이 생기지만 전극의 가압력을 함께 쓰므로 압접 계열입니다.",
    ],
    gradingPolicy: "exploration:no-answer",
    sourceRefs: [
      "lesson:lesson-1ec09vl",
      "lesson:lesson-8czxhf",
      "question:U-081",
      "question:U-520",
    ],
    questionIds: ["U-081", "U-364", "U-453", "U-520"],
    status: "published",
    version: 1,
    config: {
      initialOptionId: "fusion",
      options: [
        {
          id: "fusion",
          label: "융접",
          baseMetal: "접합부 모재를 녹인다.",
          pressure: "주된 결합 수단이 아니다.",
          filler: "공정에 따라 사용하거나 생략한다.",
          principle: "녹은 모재와 필요 시 더한 용가재가 응고하면서 연속된 이음부를 만든다.",
          examples: ["피복아크용접", "TIG·MIG/MAG", "서브머지드아크용접"],
          examTrap: "전기를 쓴다는 이유만으로 저항용접까지 융접에 포함하는 보기가 자주 나온다.",
        },
        {
          id: "pressure",
          label: "압접",
          baseMetal: "완전히 녹일 필요가 없다.",
          pressure: "열과 함께 가압력이 핵심이다.",
          filler: "보통 별도 용가재를 쓰지 않는다.",
          principle: "접촉부를 가열하거나 소성변형시키고 압력을 가해 원자 간 결합을 만든다.",
          examples: ["저항점용접", "마찰용접", "단접"],
          examTrap: "저항열로 접합부가 가열되므로 융접이라고 판단하면 U-081 유형에서 틀린다.",
        },
        {
          id: "brazing",
          label: "납땜",
          baseMetal: "모재는 녹이지 않는다.",
          pressure: "주된 결합 수단이 아니다.",
          filler: "모재보다 융점이 낮은 용가재만 녹인다.",
          principle: "녹은 용가재가 젖음과 모세관 작용으로 이음 틈에 퍼진 뒤 굳어 접합한다.",
          examples: ["경납땜", "연납땜"],
          examTrap: "모재와 용가재가 함께 녹는다고 제시하면 틀린 설명이다.",
        },
      ],
    },
  },
  {
    id: "activity-s2-g02-welding-process-v1",
    groupId: "s2-g02",
    familyId: "process",
    type: "welding-classification",
    goal:
      "전극이 봉·텅스텐·솔리드 와이어·플럭스코어드와이어 중 무엇인지와 보호 방식이 가스·피복·플럭스 중 무엇인지로 다섯 아크용접 공정을 구분할 수 있다.",
    prompt:
      "SMAW·GTAW·GMAW·FCAW·SAW를 차례로 선택하고 전극의 소모 여부와 형태, 보호가스 또는 플럭스의 위치를 비교하세요.",
    hints: [
      "먼저 전극이 소모되는지, 봉인지 연속 와이어인지, 텅스텐인지 확인하세요.",
      "그다음 보호 성분이 피복 봉, 외부 가스, 와이어 내부 플럭스, 아크 위 입상 플럭스 중 어디에 있는지 구분하세요.",
    ],
    gradingPolicy: "exploration:no-answer",
    sourceRefs: [
      "question:WELD-PROC-001",
      "question:WELD-PROC-002",
      "question:WELD-PROC-003",
      "question:WELD-PROC-004",
      "question:WELD-PROC-005",
    ],
    questionIds: [
      "WELD-PROC-001",
      "WELD-PROC-002",
      "WELD-PROC-003",
      "WELD-PROC-004",
      "WELD-PROC-005",
    ],
    status: "published",
    version: 1,
    config: {
      initialOptionId: "smaw",
      options: [
        {
          id: "smaw",
          label: "SMAW",
          baseMetal: "전극과 모재 사이의 아크열로 접합부를 녹인다.",
          pressure: "가압력은 주된 결합 수단이 아니다.",
          filler: "피복제가 입혀진 짧은 소모성 봉 전극이 녹아 용가재가 된다.",
          principle: "전극 피복제가 분해되며 보호가스를 만들고, 응고 뒤에는 슬래그로 용융지를 보호한다.",
          examples: ["피복아크용접", "수동금속아크용접"],
          examTrap: "비소모성 텅스텐 전극이나 연속 송급 와이어를 피복 봉 전극과 혼동하지 않는다.",
        },
        {
          id: "gtaw",
          label: "GTAW·TIG",
          baseMetal: "텅스텐 전극과 모재 사이의 아크열로 접합부를 녹인다.",
          pressure: "가압력은 주된 결합 수단이 아니다.",
          filler: "비소모성 텅스텐 전극을 쓰며, 용가재가 필요하면 별도의 용가봉을 넣는다.",
          principle: "주로 아르곤이나 헬륨 계열의 불활성 보호가스로 전극과 용융지를 차폐한다.",
          examples: ["TIG용접", "가스텅스텐아크용접"],
          examTrap: "전극이 비소모성이라는 말은 용가재를 절대 사용하지 않는다는 뜻이 아니다.",
        },
        {
          id: "gmaw",
          label: "GMAW",
          baseMetal: "와이어 전극과 모재 사이의 아크열로 접합부를 녹인다.",
          pressure: "가압력은 주된 결합 수단이 아니다.",
          filler: "연속 송급되는 소모성 솔리드 와이어가 전극과 용가재 역할을 함께 한다.",
          principle: "MIG는 불활성가스, MAG·CO₂용접은 활성가스 계열의 외부 보호가스를 사용한다.",
          examples: ["MIG용접", "MAG·CO₂용접"],
          examTrap: "MIG와 MAG는 모두 연속 소모성 와이어를 쓰며 보호가스의 활성 여부로 구분한다.",
        },
        {
          id: "fcaw",
          label: "FCAW",
          baseMetal: "관상 와이어 전극과 모재 사이의 아크열로 접합부를 녹인다.",
          pressure: "가압력은 주된 결합 수단이 아니다.",
          filler: "내부에 플럭스가 충전된 연속 소모성 관상 와이어를 사용한다.",
          principle: "외부 가스를 함께 쓰는 가스차폐형과 와이어 속 플럭스로 보호하는 자체보호형이 있다.",
          examples: ["플럭스코어드아크용접", "자체보호형 FCAW"],
          examTrap: "FCAW의 플럭스는 와이어 안에 있고, SAW의 입상 플럭스는 와이어 밖에서 아크를 덮는다.",
        },
        {
          id: "saw",
          label: "SAW",
          baseMetal: "와이어 전극과 모재 사이의 아크열로 접합부를 녹인다.",
          pressure: "가압력은 주된 결합 수단이 아니다.",
          filler: "연속 송급되는 소모성 와이어 전극을 사용한다.",
          principle: "용접선 앞에 공급한 입상 플럭스가 아크와 용융지를 위에서 덮어 차폐한다.",
          examples: ["서브머지드아크용접", "잠호용접"],
          examTrap: "입상 플럭스 아래에 아크가 잠기는 특징을 외부 보호가스만 쓰는 GMAW와 혼동하지 않는다.",
        },
      ],
    },
  },
]);

export function getTextbookActivity(groupId: string, familyId: string) {
  return textbookActivities.find(
    (activity) => activity.groupId === groupId && activity.familyId === familyId,
  );
}

export function getTextbookActivities() {
  return textbookActivities;
}
