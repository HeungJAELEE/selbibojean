export const bdaExamBlueprint = {
  written: {
    durationMinutes: 120,
    totalQuestions: 80,
    method: "객관식 4지선다",
    subjects: [
      {
        id: "bda-s1",
        order: 1,
        title: "빅데이터 분석기획",
        questionCount: 20,
        focusAreas: [
          "빅데이터의 이해",
          "데이터 분석 계획",
          "데이터 수집 및 저장 계획",
        ],
      },
      {
        id: "bda-s2",
        order: 2,
        title: "빅데이터 탐색",
        questionCount: 20,
        focusAreas: ["데이터 전처리", "데이터 탐색", "통계기법 이해"],
      },
      {
        id: "bda-s3",
        order: 3,
        title: "빅데이터 모델링",
        questionCount: 20,
        focusAreas: ["분석모형 설계", "분석기법 적용"],
      },
      {
        id: "bda-s4",
        order: 4,
        title: "빅데이터 결과 해석",
        questionCount: 20,
        focusAreas: ["분석모형 평가 및 개선", "분석결과 해석 및 활용"],
      },
    ],
  },
  practical: {
    durationMinutes: 180,
    score: 100,
    method: "통합형(필답형·작업형), CBT",
    subject: "빅데이터 분석 실무",
    officialCapabilities: [
      "데이터 수집",
      "데이터 정제",
      "데이터 변환",
      "분석모형 선택",
      "분석모형 구축",
      "분석모형 평가",
      "분석결과 해석 및 활용",
    ],
    experienceTracks: [
      {
        id: "type1",
        label: "유형 1",
        title: "데이터 처리 결과 계산",
        output:
          "코드로 계산한 뒤 별도 답안 화면에 지시된 형식으로 값을 입력",
      },
      {
        id: "type2",
        label: "유형 2",
        title: "예측 모델과 CSV 생성",
        output:
          "지시된 이름의 CSV에 요구된 예측 열 1개만 저장하고 index 열은 제외",
      },
      {
        id: "type3",
        label: "유형 3",
        title: "통계 검정과 회귀 추론",
        output:
          "소문항 순서대로 통계량·p값·계수 등 요구값을 별도 답안 화면에 입력",
      },
    ],
    environmentRules: [
      "문제별로 Python 또는 R을 선택한다.",
      "제공 패키지는 회차마다 달라질 수 있으므로 코딩 화면에서 먼저 확인한다.",
      "코드는 줄 단위가 아니라 전체 실행하며 실행 시간은 1분으로 제한된다.",
      "시험 중 패키지를 추가로 설치할 수 없다.",
      "유형 1·3은 별도 답안 화면, 유형 2는 마지막 제출 코드가 만든 CSV가 채점 대상이다.",
    ],
  },
  sources: [
    {
      label: "한국데이터산업진흥원 빅데이터분석기사 시험안내",
      url: "https://www.dataq.or.kr/www/sub/a_07.do",
      sourceType: "official_scope",
    },
    {
      label: "빅데이터분석기사 실기 체험환경 가이드(2024-11)",
      url: "https://kr.object.gov-ncloudstorage.com/dataq/dataq-9th/%5BK-DATA%5D%20%EB%B9%85%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B6%84%EC%84%9D%EA%B8%B0%EC%82%AC%20%EC%8B%A4%EA%B8%B0%20%EC%B2%B4%ED%97%98%ED%99%98%EA%B2%BD%20%EA%B0%80%EC%9D%B4%EB%93%9C_202411%20%281%29.pdf",
      sourceType: "official_sample",
    },
  ],
} as const;
