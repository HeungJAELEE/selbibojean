/**
 * 2026-07-26 v3 계약 도입 직전 공개 실기 데이터의 ID 집합 기준선이다.
 * 신규 공개분이 생기더라도 기존 ID 보존 여부를 먼저 검토하고, 승인된
 * 변경이력과 함께 이 기준선을 명시적으로 갱신해야 한다.
 */
export const PRACTICAL_BASELINE_MANIFEST = {
  sourceCommit: "691ab4065b176e72932d67d8e248434d844e9dc1",
  capturedAt: "2026-07-26T00:00:00+09:00",
  sets: {
    questions: {
      count: 128,
      sortedIdsSha256:
        "655d528a73db2eafd70ccef9adc0214d666acfcbfbe89cf08bed5d4d16d56b6f",
    },
    concepts: {
      count: 89,
      sortedIdsSha256:
        "f4ef818d5520a934949e3a18b16e3f58f4b88ca74ba8db6a48173da255249963",
    },
    visualAids: {
      count: 28,
      sortedIdsSha256:
        "99a40422783dd3cf64767790ca3e7a69ce8af84c2b2d5883e89d17fec02d8680",
    },
  },
} as const;
