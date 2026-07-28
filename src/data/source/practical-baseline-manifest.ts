/**
 * 2026-07-26 v3 계약 도입 직전 공개 실기 데이터의 ID 집합 기준선이다.
 * 신규 공개분이 생기더라도 기존 ID 보존 여부를 먼저 검토하고, 승인된
 * 변경이력과 함께 이 기준선을 명시적으로 갱신해야 한다.
 */
export const PRACTICAL_BASELINE_MANIFEST = {
  sourceCommit: "9df7d9420f2e3fd7d6b7535b0871bd6043f306c8",
  capturedAt: "2026-07-28T12:34:00+09:00",
  changeHistory: [
    {
      changedAt: "2026-07-28T18:22:00+09:00",
      scope: "questions",
      summary:
        "유형별 60개 수량 패딩을 철회하고 일련번호형 시각자료 41개와 동일 공식 숫자변형을 제거했다. 필기 문제은행 근거로 아베의 원리·보전방식·결함 정의 34개, 서로 다른 계산식 32개, 브레이크 라이닝 텍스트 순서형 1개를 선별했다.",
    },
    {
      changedAt: "2026-07-28T17:45:00+09:00",
      scope: "questions",
      summary:
        "필기 문제은행 발췌·변환을 중심으로 실기 필답형 네 유형의 학습자 공개 예상문제를 유형별 60개로 균형화하고 정의·계산조건·시각판독·텍스트 순서형 품질계약을 추가",
    },
    {
      changedAt: "2026-07-28T12:34:00+09:00",
      scope: "visualAids",
      summary:
        "NCS 교재에만 있던 브레이크 균열·마모·오염 상태 사진 6장을 정답 라벨 없이 개념 학습용 시각자료 1묶음으로 추가",
    },
  ],
  sets: {
    questions: {
      count: 227,
      sortedIdsSha256:
        "289c5c60c4e33244f31f20f7a2553ee5eba7dad381cc21ba38ed76140ca321ac",
    },
    concepts: {
      count: 89,
      sortedIdsSha256:
        "f4ef818d5520a934949e3a18b16e3f58f4b88ca74ba8db6a48173da255249963",
    },
    visualAids: {
      count: 70,
      sortedIdsSha256:
        "0e768a02a4811952303b0876f0c881f572d0278317b58262feb82dbdeb5f5db6",
    },
  },
} as const;
