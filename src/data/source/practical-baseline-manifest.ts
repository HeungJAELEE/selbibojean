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
      changedAt: "2026-07-29T22:30:00+09:00",
      scope: "visualAids+publication",
      summary:
        "원시험 사진을 복제하지 않고 NCS 원문 실사를 우선 재배열해 자동조심 롤러베어링 식별문항을 보강했다. 정비 공구는 NCS 풀러·스냅링 플라이어와 퍼블릭도메인 후크 스패너·소켓 렌치를 조합하고, SEMS 볼트는 CC BY-SA 동등 실사를 연결해 3문항을 검증 공개로 승격했다. 모든 동등 자료에는 원시험 이미지와 동일하지 않다는 고지를 표시한다.",
    },
    {
      changedAt: "2026-07-29T21:00:00+09:00",
      scope: "visualAids+publication",
      summary:
        "안전표지 자체 SVG 2묶음을 산업안전보건법 시행규칙 별표 6 공식 표지로 교체하고, 호흡보호구 4종의 권리 확인된 실사를 연결해 2025년 2회 Q08을 HOLD에서 검증 공개로 승격했다.",
    },
    {
      changedAt: "2026-07-29T19:00:00+09:00",
      scope: "visualAids+publication",
      summary:
        "측정기 3종 자작 SVG를 CC0·퍼블릭도메인 실사 묶음으로 교체했다. 원문·보기·정답 또는 재사용권이 충족되지 않은 공구·호흡보호구·M18·송풍기·SEMS·타이어커플링 6문항은 공개에서 HOLD 처리했다.",
    },
    {
      changedAt: "2026-07-28T23:49:00+09:00",
      scope: "questions+visualAids",
      summary:
        "사용자 지정 2025년 1·2·3회 및 2026년 1·2회 복원 글을 문항 기준으로 대조해 2026년 2회 Q1~Q9를 추가하고, 공개 기출을 회차별 10개씩 총 50개로 맞췄다. 제3자 이미지는 복제하지 않고 그림 의존 문항용 자체 SVG 13종을 추가했다.",
    },
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
      count: 236,
      sortedIdsSha256:
        "c1bbc2b86a32751313f6eae15180136a52fe748b03f8326dd923c91d4a308897",
    },
    concepts: {
      count: 89,
      sortedIdsSha256:
        "f4ef818d5520a934949e3a18b16e3f58f4b88ca74ba8db6a48173da255249963",
    },
    visualAids: {
      count: 88,
      sortedIdsSha256:
        "708f54504185b93b6e89a6029537d3eb0d655d7f2beb1eb08d5eea89128f30c8",
    },
  },
} as const;
