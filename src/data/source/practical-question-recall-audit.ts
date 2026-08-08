export type PracticalQuestionRecallBlocker =
  | "held_asset_missing"
  | "held_source_missing"
  | "held_answer_conflict";

export type PracticalQuestionRecallClassification =
  | "duplicate_no_add"
  | "adjacent_existing_hold"
  | "learning_source_verified"
  | "linked_learning_verified"
  | "source_review_completed_hold"
  | "asset_hold"
  | "answer_resolved_reconstructed"
  | "answer_conflict_hold";

export type PracticalQuestionRecallAuditItem = {
  id: string;
  group: "priority_2026_round2" | "may_10_2026";
  recallNumber: number | null;
  topic: string;
  sourceCandidateIds: string[];
  sourceLineRanges: string[];
  classification: PracticalQuestionRecallClassification;
  blockers: PracticalQuestionRecallBlocker[];
  relatedContentIds: string[];
  nextEvidence: string[];
  publicationStatus: "registered_reconstructed";
  evidenceClass: "unverified_user_report";
};

const MAY_10_SOURCE = {
  sourceCandidateIds: ["KQA-79B3F318E2C00249"],
  sourceLineRanges: ["20093-20243"],
} as const;

function may10(
  recallNumber: number,
  topic: string,
  classification: PracticalQuestionRecallClassification,
  blockers: PracticalQuestionRecallBlocker[],
  relatedContentIds: string[],
  nextEvidence: string[],
): PracticalQuestionRecallAuditItem {
  return {
    id: `recall:2026-05-10:${recallNumber}`,
    group: "may_10_2026",
    recallNumber,
    topic,
    sourceCandidateIds: [...MAY_10_SOURCE.sourceCandidateIds],
    sourceLineRanges: [...MAY_10_SOURCE.sourceLineRanges],
    classification,
    blockers,
    relatedContentIds,
    nextEvidence,
    publicationStatus: "registered_reconstructed",
    evidenceClass: "unverified_user_report",
  };
}

export const PRACTICAL_PRIORITY_RECALL_AUDIT: PracticalQuestionRecallAuditItem[] =
  [
    {
      id: "recall:2026-round2:m18-drawing",
      group: "priority_2026_round2",
      recallNumber: null,
      topic: "M18×2.0 도면 판독",
      sourceCandidateIds: [
        "KQA-ADBF37E6BBE8F6D5",
        "KQA-721345A7D56115E7",
        "KQA-F626834381544E87",
        "KQA-E3CF37CE130C3F03",
      ],
      sourceLineRanges: ["37576", "37922", "37930-37932", "40934"],
      classification: "answer_resolved_reconstructed",
      blockers: ["held_asset_missing"],
      relatedContentIds: [],
      nextEvidence: [
        "문제 전체 문장",
        "치수가 보이는 원본 도면",
        "공식 답안 또는 적용 제도 표준",
      ],
      publicationStatus: "registered_reconstructed",
      evidenceClass: "unverified_user_report",
    },
    {
      id: "recall:2026-round2:blower-power",
      group: "priority_2026_round2",
      recallNumber: null,
      topic: "송풍기 동력 계산 조건",
      sourceCandidateIds: ["KQA-48DB7F2F623AE432"],
      sourceLineRanges: ["37250"],
      classification: "answer_resolved_reconstructed",
      blockers: [],
      relatedContentIds: [],
      nextEvidence: [
        "문제 전체 문장과 보기",
        "회전수·토크·풍량·압력 중 고정 조건",
        "요구 단위",
      ],
      publicationStatus: "registered_reconstructed",
      evidenceClass: "unverified_user_report",
    },
    {
      id: "recall:2026-round2:sems-bolt",
      group: "priority_2026_round2",
      recallNumber: null,
      topic: "SEMS 볼트 실물 판별",
      sourceCandidateIds: [],
      sourceLineRanges: [],
      classification: "answer_resolved_reconstructed",
      blockers: [],
      relatedContentIds: ["P-2026-2-Q04"],
      nextEvidence: [
        "원시험 사진과 완전히 같은 제품·촬영각도",
        "문제 전체 문장과 보기",
      ],
      publicationStatus: "registered_reconstructed",
      evidenceClass: "unverified_user_report",
    },
    {
      id: "recall:2026-round2:grinding-wheel",
      group: "priority_2026_round2",
      recallNumber: null,
      topic: "연삭숫돌 시험운전·덮개",
      sourceCandidateIds: [],
      sourceLineRanges: [],
      classification: "learning_source_verified",
      blockers: [],
      relatedContentIds: [],
      nextEvidence: [
        "실제 문제 전체 문장과 보기",
        "출제 당시 적용 법령 확인",
      ],
      publicationStatus: "registered_reconstructed",
      evidenceClass: "unverified_user_report",
    },
    {
      id: "recall:2026-round2:drip-lubrication",
      group: "priority_2026_round2",
      recallNumber: null,
      topic: "적하급유법 복수 선택",
      sourceCandidateIds: [],
      sourceLineRanges: [],
      classification: "learning_source_verified",
      blockers: ["held_asset_missing"],
      relatedContentIds: [],
      nextEvidence: ["문제 전체 문장", "사진 또는 선택지 전체", "선택 개수"],
      publicationStatus: "registered_reconstructed",
      evidenceClass: "unverified_user_report",
    },
    {
      id: "recall:2026-round2:brake-lining",
      group: "priority_2026_round2",
      recallNumber: null,
      topic: "브레이크 라이닝 교체 순서",
      sourceCandidateIds: [],
      sourceLineRanges: [],
      classification: "learning_source_verified",
      blockers: [],
      relatedContentIds: [
        "PWEC-BRAKE-PAD-LINING-INSPECTION",
        "EXP-VIS-BRAKE-PAD-LINING-01",
      ],
      nextEvidence: ["단계별 문장 보기 전체", "보기의 배열과 요구 순서"],
      publicationStatus: "registered_reconstructed",
      evidenceClass: "unverified_user_report",
    },
  ];

export const PRACTICAL_MAY_10_RECALL_AUDIT: PracticalQuestionRecallAuditItem[] = [
  may10(
    1,
    "용접 일반 성질",
    "linked_learning_verified",
    [],
    ["U-364"],
    ["정확한 문제 문장과 보기"],
  ),
  may10(
    2,
    "TIG 용접 재료",
    "learning_source_verified",
    [],
    [],
    ["공식 교재 또는 표준", "정확한 문제 문장과 보기"],
  ),
  may10(
    3,
    "아크 온도",
    "learning_source_verified",
    [],
    [],
    ["온도 범위와 측정 조건", "공식 교재 또는 표준"],
  ),
  may10(
    4,
    "고온 용접 작업 보호구",
    "learning_source_verified",
    [],
    [],
    ["작업 조건", "현행 공식 안전 근거"],
  ),
  may10(
    5,
    "라멜라 테어",
    "learning_source_verified",
    [],
    [],
    ["권위 있는 용접 결함 자료", "정확한 문제 문장과 보기"],
  ),
  may10(
    6,
    "인장·압력단 균열",
    "answer_resolved_reconstructed",
    [],
    [],
    ["정확한 문제 문장", "결함 위치가 보이는 도면", "공식 근거"],
  ),
  may10(
    7,
    "안전율 계산",
    "learning_source_verified",
    [],
    [],
    ["공식·하중·재료 조건", "요구 단위"],
  ),
  may10(
    8,
    "2 m 이상 고소작업 보호구",
    "learning_source_verified",
    [],
    [],
    ["출제 당시 적용 법령", "작업 조건"],
  ),
  may10(
    9,
    "균열 깊이 비파괴검사",
    "linked_learning_verified",
    [],
    ["EXP-W02", "U-223"],
    ["검사 대상과 결함 방향", "적용 범위를 확인할 공식 근거"],
  ),
  may10(
    10,
    "수동 조작 제어기호",
    "learning_source_verified",
    ["held_asset_missing"],
    [],
    ["원본 기호 이미지", "문제 전체 문장과 보기"],
  ),
  may10(11, "점원", "linked_learning_verified", [], ["U-340"], ["추가 문항 작성 금지"]),
  may10(12, "지그의 목적", "linked_learning_verified", [], ["U-651"], ["추가 문항 작성 금지"]),
  may10(
    13,
    "예방보전",
    "linked_learning_verified",
    [],
    ["U-063", "U-579"],
    ["추가 문항 작성 금지"],
  ),
  may10(
    14,
    "혐기성 접착제",
    "linked_learning_verified",
    [],
    ["U-241"],
    ["추가 문항 작성 금지"],
  ),
  may10(
    15,
    "왕복동식·원심식 압축기 비교",
    "linked_learning_verified",
    [],
    ["U-087"],
    ["정확한 문제를 확보하기 전 새 문항 작성 금지"],
  ),
  may10(
    16,
    "공압의 단점",
    "linked_learning_verified",
    [],
    ["U-162"],
    ["추가 문항 작성 금지"],
  ),
  may10(
    17,
    "커플링 윤활",
    "linked_learning_verified",
    [],
    ["U-1168"],
    ["커플링 형식", "지정 윤활제", "정확한 문제 문장과 보기"],
  ),
  may10(
    18,
    "커플링 면 점검 공구",
    "linked_learning_verified",
    [],
    ["U-782"],
    ["추가 문항 작성 금지"],
  ),
  may10(
    19,
    "그리스 선정",
    "linked_learning_verified",
    [],
    ["U-789", "U-295"],
    ["정확한 선택지와 운전 조건"],
  ),
  may10(
    20,
    "NLGI 주도",
    "linked_learning_verified",
    [],
    ["U-789", "U-295"],
    ["기존 문항군과 중복 여부 유지"],
  ),
  may10(
    21,
    "구조적 손상과 마모의 연결",
    "linked_learning_verified",
    [],
    ["U-319"],
    ["정확한 문제 문장과 보기"],
  ),
  may10(
    22,
    "그리스 공급과 기어 손상",
    "answer_resolved_reconstructed",
    [],
    ["U-100", "U-1207"],
    ["정확한 문제 문장과 보기", "공식 윤활·손상 근거"],
  ),
  may10(
    33,
    "유욕급유가 아닌 방식",
    "linked_learning_verified",
    [],
    ["U-294", "U-893"],
    ["정확한 선택지와 판정 근거"],
  ),
  may10(
    34,
    "설비 경제성 평가",
    "linked_learning_verified",
    [],
    ["U-069"],
    ["추가 문항 작성 금지"],
  ),
  may10(
    35,
    "용접기 사용률 계산",
    "learning_source_verified",
    [],
    [],
    ["공식 사용률 정의", "문제 전체 조건과 요구 단위"],
  ),
  may10(
    36,
    "전하의 SI 단위",
    "linked_learning_verified",
    [],
    ["U-302"],
    ["추가 문항 작성 금지"],
  ),
  may10(
    37,
    "분무급유의 장점",
    "answer_resolved_reconstructed",
    [],
    ["U-107"],
    ["냉각 효과 주장에 대한 공식 근거", "정확한 문제 문장과 보기"],
  ),
  may10(
    38,
    "윤활유 내부 열화와 외부 오염물",
    "linked_learning_verified",
    [],
    ["U-323", "U-389", "U-673"],
    ["정확한 분류 기준", "문제 전체 문장과 보기"],
  ),
];

export const PRACTICAL_QUESTION_RECALL_AUDIT = [
  ...PRACTICAL_PRIORITY_RECALL_AUDIT,
  ...PRACTICAL_MAY_10_RECALL_AUDIT,
];
