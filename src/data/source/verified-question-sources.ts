export type VerifiedQuestionSource = {
  title: string;
  publisher: string;
  url: string;
  checkedAt: string;
  note: string;
};

/**
 * 현행 표준이나 제조사 안전지침 확인이 필요한 문제 중 공식 원문으로
 * 정답 조건을 직접 확인한 항목만 기록합니다. 단순 검색 결과나 문제은행
 * 해설은 이 목록에 넣지 않습니다.
 */
export const VERIFIED_QUESTION_SOURCES: Record<string, VerifiedQuestionSource> = {
  "U-253": {
    title: "Hydraulic Piston Accumulators — Maintenance Instructions",
    publisher: "Parker Hannifin",
    url: "https://www.parker.com/content/dam/Parker-com/Literature/Global-Accumulator-Division/Catalogs---Bulletins/Maintenance---CE-Piston%27s.pdf",
    checkedAt: "2026-07-23",
    note: "제조사 지침에서 어큐뮬레이터 예충전에 질소 같은 불활성가스를 사용하고 산소와 공장 압축공기를 사용하지 말라고 명시합니다.",
  },
  "U-1122": {
    title: "ISO 3448:1992 — Industrial liquid lubricants — ISO viscosity classification",
    publisher: "International Organization for Standardization",
    url: "https://www.iso.org/standard/8774.html",
    checkedAt: "2026-07-23",
    note: "ISO 3448이 유압유를 포함한 산업용 액상 윤활유의 ISO 점도 분류 체계임을 확인했습니다.",
  },
  "U-1264": {
    title: "ISO 4406:2021 — Method for coding the level of contamination by solid particles",
    publisher: "International Organization for Standardization",
    url: "https://www.iso.org/standard/79716.html",
    checkedAt: "2026-07-23",
    note: "ISO 4406이 유압유의 고체 입자 오염 수준을 코드로 나타내는 현행 국제표준임을 확인했습니다.",
  },
  "U-1340": {
    title: "NLGI Grease Glossary",
    publisher: "National Lubricating Grease Institute",
    url: "https://www.nlgi.org/wp-content/uploads/2022/02/NLGI-Grease-Glossary.pdf",
    checkedAt: "2026-07-23",
    note: "NLGI 등급·번호가 25℃ 혼화주도를 기준으로 그리스의 굳기를 분류하는 수치 체계임을 확인했습니다.",
  },
};
