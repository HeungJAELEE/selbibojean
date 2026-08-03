import { WELDING_CBT_GPT_BATCH_01_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-01-independent-review";
import { WELDING_CBT_GPT_BATCH_02_A_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-02-independent-review-a";
import { WELDING_CBT_GPT_BATCH_02_B_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-02-independent-review-b";
import { WELDING_CBT_GPT_BATCH_02_C_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-02-independent-review-c";

export type WeldingCbtIndependentApprovalDecision = {
  reasons: readonly string[];
};

export type WeldingCbtIndependentHoldDecision = {
  reasons: readonly string[];
};

const WELDING_CBT_GPT_BATCH_01_APPROVAL_DECISIONS = Object.fromEntries(
  WELDING_CBT_GPT_BATCH_01_APPROVED_IDS.map((canonicalId) => [
    canonicalId,
    {
      reasons: [
        "gpt_pro_approved_with_conditions: 문제·보기·복원 정답은 보존하고, 구체 풀이·보기별 오답 근거·동일 레슨 카테고리 연결을 확인했습니다.",
      ],
    },
  ]),
) as Record<string, WeldingCbtIndependentApprovalDecision>;

/**
 * CBT 복원 문제·보기, 기존 KOSHA·법령 앵커, ChatGPT Pro의 적대적 검토,
 * 그리고 저장소 품질 게이트를 함께 통과한 안전 문항이다.
 *
 * 이 결정은 CBTBank나 ChatGPT를 공식 발행기관으로 표시하지 않는다.
 * 학습자 화면에서는 CBTBank를 과거 공개 CBT의 복원·대조 출처로만 표시한다.
 */
export const WELDING_CBT_INDEPENDENT_APPROVAL_DECISIONS = {
  ...WELDING_CBT_GPT_BATCH_01_APPROVAL_DECISIONS,
  "wcbt-090f8987-d07c-4aae-8a13-bfbcba5bdc4b": {
    reasons: [
      "gpt_pro_confirmed: 면장갑은 용접 열·스패터에 대응하는 방열 보호구로 볼 수 없어 1번이 단일 오답입니다.",
    ],
  },
  "wcbt-12da4754-2357-4368-84ca-e21194d72c71": {
    reasons: [
      "gpt_pro_confirmed: 수냉식 TIG 토치를 냉각수 탱크에 담그는 행위는 전격방지대책이 아니며 제조사 냉각 절차를 우선한다는 조건을 포함합니다.",
    ],
  },
  "wcbt-14586fff-063c-4789-9c62-b4168996fc32": {
    reasons: [
      "gpt_pro_confirmed: 슬래그 접촉은 대표적으로 화상·비산물 위험이며 통전부 접촉에 의한 감전 원인과 구분됩니다.",
    ],
  },
  "wcbt-164cdf70-275d-473f-a669-04c30cda93e8": {
    reasons: [
      "gpt_pro_confirmed: 투명 커버 플레이트는 스패터·긁힘으로부터 차광 필터를 보호하는 교환용 보호판입니다.",
    ],
  },
  "wcbt-1c57aad6-b6bb-46e8-9c2f-e70566d4e189": {
    reasons: [
      "gpt_pro_conditional_accept: 정상 설비 상태에서 작업자가 직접 취급하는 노출 충전부라는 출제 조건과 비정상 상태에서는 위험도 순위가 달라질 수 있음을 해설에 명시했습니다.",
    ],
  },
  "wcbt-25867beb-2201-4b4f-9cc6-61568ba0c04d": {
    reasons: [
      "gpt_pro_confirmed: 가연성인 수소를 고압 호스 청소에 사용하는 4번은 단일 오답이며 더운물은 화염·끓는 물이 아닌 안전한 온수로 한정합니다.",
    ],
  },
  "wcbt-3b1ab86a-05b8-4009-8c18-b790ecb386f0": {
    reasons: [
      "gpt_pro_confirmed: 실내 용접 흄에는 발생원 가까이의 국소배기 또는 충분한 기계환기가 필요합니다.",
    ],
  },
  "wcbt-4068b5c0-c9b8-43b2-a449-51777e52adc2": {
    reasons: [
      "gpt_pro_conditional_accept: 절연 파손 홀더의 즉시 사용 중지와 함께 자동전격방지기의 법적 적용범위·일반 권고 및 A형·B형의 표준 지위를 분리했습니다.",
    ],
  },
  "wcbt-4346c5cd-a267-476e-8733-c5c0a5f88360": {
    reasons: [
      "gpt_pro_confirmed: 젖은 작업복·장갑·신발은 감전 위험을 높이므로 착용해도 된다는 1번이 단일 오답입니다.",
    ],
  },
  "wcbt-4925dffa-26cb-46db-9d75-e84bd59e1e1d": {
    reasons: [
      "gpt_pro_confirmed: 전원 차단 전 감전자를 맨손으로 잡아당기는 3번은 구조자의 2차 감전을 일으킬 수 있는 단일 오답입니다.",
    ],
  },
  "wcbt-4b9b72f8-4957-4028-bd1c-bc8157976a8e": {
    reasons: [
      "gpt_pro_confirmed: 자동전격방지기는 비용접 상태의 2차 무부하전압을 낮추는 감전방지 장치이며 법적 설치 의무범위와 일반 안전 기능을 분리했습니다.",
    ],
  },
  "wcbt-5328eb9a-d28d-4752-9ce3-35ec0c6e2675": {
    reasons: [
      "gpt_pro_confirmed: 비안전형 홀더의 직접 위험은 전격이며 과거 용어를 현행 B형 홀더와 동일시하지 않습니다.",
    ],
  },
} as const satisfies Record<string, WeldingCbtIndependentApprovalDecision>;

const WELDING_CBT_LEGACY_INDEPENDENT_PUBLICATION_IDS = [
  "wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c",
  "wcbt-49ddc1c2-05f9-454e-a01a-21440d2f4a92",
  "wcbt-4533db22-25e9-48ab-8060-a0559a855a21",
  "wcbt-b37a80db-aab9-4a62-bcd3-c06e960f18b8",
  "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb",
  "wcbt-9cff516f-6a55-4733-b433-983aa311c95b",
  "wcbt-f010c9fd-72f1-46a1-9d54-3240600fb2e7",
  "wcbt-54d3be8c-ff5f-4757-82e6-d78cec05728c",
  "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
  "wcbt-493b2168-1ef8-40e4-b986-92db667cd95d",
  "wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4",
  "wcbt-1b11cff7-3ebd-4fbe-96ab-f31e4a9d9355",
  "wcbt-25599af8-aa0e-47e3-9b8b-51dc27f60bc8",
  "wcbt-2e3af0f9-d9ee-4606-887b-a305525d6e79",
  "wcbt-353e2c66-db3e-41e5-935b-8dd443ef736a",
  "wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c",
  "wcbt-3ff084f2-2dbd-4d0d-825a-eee98c7175ca",
  "wcbt-54b1baf9-7574-493b-b616-6caa2db72509",
  "wcbt-6c1607b3-09d3-429f-b911-7a6d2f5f7418",
  "wcbt-7d98f9f8-8c72-49cc-b81a-6c1b13d5ae2b",
  "wcbt-c67f0293-11ab-4da5-9b2f-06accefc995e",
  "wcbt-e630bc06-fe6f-4eb4-9f04-77e97ceb8d4a",
  "wcbt-edfc5be7-c962-4213-a46d-1d207583c478",
  "wcbt-fffecb03-9c1c-4f9c-9caf-0821b5f0d224",
  "wcbt-50ea9e7d-008c-45e1-a35c-21ad26b026cc",
  "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe",
] as const;

/**
 * Previously held records whose question, four choices, reconstructed answer,
 * and lesson evidence were rechecked as a single-answer conventional exam
 * item. These IDs had no contrary answer source or missing required asset.
 */
export const WELDING_CBT_CONVENTIONAL_EXAM_APPROVED_IDS = [
  "wcbt-01fc477e-07c3-415a-b6fd-7b9b6272ec56",
  "wcbt-21c03b1e-efc8-4451-beb0-281436267893",
  "wcbt-39d3434f-93e6-43af-92af-d8fa5e7b1401",
  "wcbt-54512c61-a0a5-4069-8454-408808fb6884",
  "wcbt-58dc1504-10b8-4b86-888c-f8b6f89665cc",
  "wcbt-5ab4d74f-bf01-4d1b-8c95-8f31f086cf0d",
  "wcbt-5f1c3bdf-7069-46e7-a669-a5f30ebe7e2a",
  "wcbt-67c9f16f-e263-42bd-b3c5-e63836025fbe",
  "wcbt-7146bf9e-a336-4d68-bf23-9834c2003f93",
  "wcbt-9b5fbee6-490d-4332-a009-eabb40fcafb5",
  "wcbt-9b83fd23-5e95-4ccb-bf5e-3b5f67f62ea6",
  "wcbt-ccf97e42-9263-4a09-acef-32df7eb9b34c",
  "wcbt-dd389161-8ff4-4984-8b5f-dc86347413e8",
  "wcbt-e34e9863-3071-4160-badd-429e396e7c1c",
  "wcbt-e82f878f-d67c-47cc-9afe-5f06f05207e4",
  "wcbt-f2780053-6468-4757-b3d9-1688a5f19728",
  "wcbt-f7042fb6-cd59-4f0d-8d7f-a79c6ee076be",
] as const;

/**
 * Exact source-review IDs that may pass the independent-publication gate.
 * Batch 02-A/B/C retain their own review artifacts; the final identifier
 * completes the approved population after the A/B ordinal overlap.
 */
export const WELDING_CBT_INDEPENDENT_PUBLICATION_IDS = [
  ...Object.keys(WELDING_CBT_INDEPENDENT_APPROVAL_DECISIONS),
  ...WELDING_CBT_LEGACY_INDEPENDENT_PUBLICATION_IDS,
  ...WELDING_CBT_GPT_BATCH_02_A_APPROVED_IDS,
  ...WELDING_CBT_GPT_BATCH_02_B_APPROVED_IDS,
  ...WELDING_CBT_GPT_BATCH_02_C_APPROVED_IDS,
  "wcbt-fcc15073-28c6-48bb-b735-8ee30957ed8b",
  ...WELDING_CBT_CONVENTIONAL_EXAM_APPROVED_IDS,
] as const;

export const WELDING_CBT_INDEPENDENT_HOLD_DECISIONS: Readonly<
  Record<string, WeldingCbtIndependentHoldDecision>
> = {};

export const WELDING_CBT_INDEPENDENT_REVIEWER =
  "codex-gpt-pro-assisted-independent-safety-review";
export const WELDING_CBT_INDEPENDENT_REVIEWED_AT =
  "2026-08-03T11:10:00.000Z";
