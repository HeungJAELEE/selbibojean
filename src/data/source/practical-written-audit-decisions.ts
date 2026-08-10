import type { AuditDisposition } from "../../lib/domain/types";

export type PracticalWrittenAuditDecision = {
  disposition: AuditDisposition;
  note: string;
  modelAnswer?: string;
  requiredKeywords?: string[];
  acceptedAnswers?: string[];
  traps?: string[];
  evidenceUrls: string[];
};

const NCS_DRIVE_MAINTENANCE =
  "https://drive.google.com/file/d/1D1mnd6vEYqnVvHy1J894vjpGv6_qoBzV/view";
const NCS_DRIVE_ASSEMBLY =
  "https://drive.google.com/file/d/1E_-Y6dLCjPBTOReDk4RAQ9Xetohp0gc6/view";
const KOSHA_PROTECTIVE_EQUIPMENT =
  "https://miis.kosha.or.kr/oshci/busi/viewProtectionFees.do";
const KOSHA_SAFETY_EDUCATION =
  "https://360vr.kosha.or.kr/eduDutyInfo?search=true";
const SKF_SPHERICAL_ROLLER_BEARINGS =
  "https://cdn.skfmediahub.skf.com/api/public/0901d1968027f7c9/pdf_preview_medium/0901d1968027f7c9_pdf_preview_medium.pdf";
const SKF_SPHERICAL_ROLLER_OVERVIEW =
  "https://evolution.skf.com/en/spherical-roller-bearings-the-bearing-for-all-seasons/";
const REXNORD_GEAR_COUPLING_MANUAL =
  "https://www.rexnord.com/contentitems/techlibrary/documents/couplings/cp3-012_manual";
const KOREAN_SAFETY_SIGN_RULE =
  "https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000207172";
const RECONSTRUCTION_2025_ROUND_2_PART_2 =
  "https://blog.naver.com/moru-1/223952223215";
const RECONSTRUCTION_2025_ROUND_1 =
  "https://blog.naver.com/moru-1/223848831284";
const RECONSTRUCTION_2025_ROUND_2_PART_1 =
  "https://blog.naver.com/moru-1/223951709068";
const RECONSTRUCTION_2025_ROUND_3 =
  "https://blog.naver.com/moru-1/224072357786";
const RECONSTRUCTION_2026_ROUND_1 =
  "https://blog.naver.com/moru-1/224275574425";

export const PRACTICAL_WRITTEN_AUDIT_DECISIONS: Record<
  string,
  PracticalWrittenAuditDecision
> = {
  "P-2025-1-Q02": {
    disposition: "verified",
    note:
      "복원 원문은 측정방법의 서술이 아니라 빈칸 ① 측정항목과 ② 측정기를 요구한다. 응답 형식을 원문 요구에 맞췄다.",
    modelAnswer: "① 백래시, ② 다이얼 게이지",
    requiredKeywords: ["백래시", "다이얼 게이지"],
    acceptedAnswers: [
      "① 백래시, ② 다이얼 게이지",
      "백래시 / 다이얼게이지",
    ],
    traps: ["측정 절차만 쓰고 측정항목과 측정기 명칭을 빠뜨림"],
    evidenceUrls: [RECONSTRUCTION_2025_ROUND_1],
  },
  "P-2025-1-Q08": {
    disposition: "verified",
    note:
      "복원 원문의 A~I 선택지를 보존하고, 문항이 요구한 선택 기호로 답하도록 응답 형식을 맞췄다.",
    modelAnswer: "A, B, D, F, G, I",
    requiredKeywords: ["A", "B", "D", "F", "G", "I"],
    acceptedAnswers: ["A, B, D, F, G, I", "A·B·D·F·G·I"],
    traps: ["선택 기호 대신 임의로 재작성한 특징 문장만 제출"],
    evidenceUrls: [RECONSTRUCTION_2025_ROUND_1],
  },
  "P-2025-1-Q09": {
    disposition: "verified",
    note:
      "복원 배열과 자체 도식의 가~아 위치를 대조해 각 GHS 그림문자의 명칭과 의미를 답하도록 구체화했다.",
    modelAnswer:
      "가 폭발성, 나 인화성, 다 산화성, 라 고압가스, 마 부식성, 바 급성독성, 사 건강유해성, 아 환경유해성",
    requiredKeywords: [
      "폭발성",
      "인화성",
      "산화성",
      "고압가스",
      "부식성",
      "급성독성",
      "건강유해성",
      "환경유해성",
    ],
    acceptedAnswers: [
      "가 폭발성, 나 인화성, 다 산화성, 라 고압가스, 마 부식성, 바 급성독성, 사 건강유해성, 아 환경유해성",
    ],
    traps: [
      "그림문자 전체를 GHS라고만 쓰고 개별 명칭을 적지 않음",
      "산화성·인화성 또는 급성독성·건강유해성을 서로 바꿈",
    ],
    evidenceUrls: [KOREAN_SAFETY_SIGN_RULE, RECONSTRUCTION_2025_ROUND_1],
  },
  "P-2025-2-Q04": {
    disposition: "verified",
    note:
      "복원 원문의 (1)~(4) 배열과 설명 a~d를 유지했다. NCS 원문에서 스냅링 플라이어와 베어링 풀러 실사를 확인하고, NCS에 같은 판독 사진이 없는 후크 스패너와 소켓 렌치만 퍼블릭도메인 실사로 보완했다. 원시험 사진과 동일하지 않은 동등 식별자료임을 문제 화면에 표시한다.",
    modelAnswer: "(1)-b, (2)-d, (3)-a, (4)-c",
    requiredKeywords: ["(1)-b", "(2)-d", "(3)-a", "(4)-c"],
    acceptedAnswers: ["1-b, 2-d, 3-a, 4-c"],
    traps: ["공구 명칭을 문제 본문에 먼저 노출", "실사 대신 식별하기 어려운 자체 도식 사용"],
    evidenceUrls: [
      RECONSTRUCTION_2025_ROUND_2_PART_1,
      NCS_DRIVE_MAINTENANCE,
      NCS_DRIVE_ASSEMBLY,
      "https://commons.wikimedia.org/wiki/File:Cl%C3%A9_%C3%A0_ergot.jpg",
      "https://commons.wikimedia.org/wiki/File:Socket_wrench_set.jpg",
    ],
  },
  "P-2025-2-Q01-1": {
    disposition: "verified",
    note:
      "복원 정답의 (다) 배열을 유지하고 NCS 원문에 있는 원통 롤러·테이퍼 롤러·자동조심 롤러·스러스트 볼 베어링 실사를 같은 4지 형식으로 재배열했다. 원시험 사진과 동일하지 않은 NCS 동등 식별자료임을 문제 화면에 표시한다.",
    modelAnswer: "다",
    requiredKeywords: ["다"],
    acceptedAnswers: ["다", "(다)"],
    evidenceUrls: [
      RECONSTRUCTION_2025_ROUND_2_PART_1,
      NCS_DRIVE_MAINTENANCE,
      SKF_SPHERICAL_ROLLER_BEARINGS,
    ],
  },
  "P-2025-2-Q01-2": {
    disposition: "cbt_corrected",
    note:
      "NCS 원문과 SKF 기술자료를 대조해 자동조심 롤러베어링의 조심성, 큰 방사하중·일부 축하중 수용, 정렬오차 허용을 확인했다. 복원 선택지의 '고속회전에 적합'은 범용 특징으로 채택하지 않는다.",
    modelAnswer:
      "자동조심 롤러베어링은 (다)이다. 외륜 궤도면이 구면이고 자동조심성이 있어 축과 하우징의 약간의 정렬오차를 허용한다.",
    requiredKeywords: [
      "(다)",
      "외륜 궤도면이 구면",
      "조심성",
      "약간의 정렬오차 허용",
    ],
    acceptedAnswers: [
      "(다), 외륜 궤도면이 구면이고 자동조심성이 있어 정렬오차를 허용한다.",
      "다 / b, c, f",
    ],
    traps: ["고속회전에 적합하다고 범용 특징으로 단정"],
    evidenceUrls: [
      NCS_DRIVE_MAINTENANCE,
      SKF_SPHERICAL_ROLLER_BEARINGS,
      SKF_SPHERICAL_ROLLER_OVERVIEW,
    ],
  },
  "P-2025-2-Q08": {
    disposition: "verified",
    note:
      "복원 원문의 네 호흡보호구와 설명 a~d 연결 구조를 보존했다. 원시험 사진을 복제하지 않고 권리가 확인된 방진·방독·송기·전동식 호흡보호구 실사를 같은 순서의 동등 식별자료로 연결했다.",
    modelAnswer:
      "(가)-b, (나)-a, (다)-d, (라)-c",
    requiredKeywords: [
      "(가)-b",
      "(나)-a",
      "(다)-d",
      "(라)-c",
    ],
    acceptedAnswers: [
      "가-b, 나-a, 다-d, 라-c",
      "방진-b, 방독-a, 송기-d, 전동식-c",
    ],
    traps: [
      "방독마스크를 산소결핍 장소의 공기 공급식 보호구로 설명",
      "전동식 호흡보호구와 송기마스크의 공기 공급원을 동일하게 설명",
    ],
    evidenceUrls: [
      KOSHA_PROTECTIVE_EQUIPMENT,
      KOSHA_SAFETY_EDUCATION,
      "https://commons.wikimedia.org/wiki/File:Dust_mask.jpg",
      "https://commons.wikimedia.org/wiki/File:Air-Purifying_Respirator.jpg",
      "https://commons.wikimedia.org/wiki/File:%D0%A8%D0%BB%D0%B0%D0%BD%D0%B3%D0%BE%D0%B2%D1%8B%D0%B9_%D1%80%D0%B5%D1%81%D0%BF%D0%B8%D1%80%D0%B0%D1%82%D0%BE%D1%80_%D1%81_%D0%BF%D0%BE%D0%BB%D0%BD%D0%BE%D0%BB%D0%B8%D1%86%D0%B5%D0%B2%D0%BE%D0%B9_%D0%BC%D0%B0%D1%81%D0%BA%D0%BE%D0%B9.JPG",
      "https://commons.wikimedia.org/wiki/File:Portable_powered_HEPA_respirator.jpg",
    ],
  },
  "P-2025-2-Q10": {
    disposition: "verified",
    note:
      "2025년 2회 복원 글의 Q10 문장형 정의와 NCS 기어 손상 근거를 대조했다. 블로그 이미지를 복제하지 않고 점상공·넓은 박리·미끄럼 긁힘을 자체 도식으로 재구성했다.",
    modelAnswer:
      "(가) 피팅: 반복 접촉피로로 작은 점상 홈이 생기는 손상, (나) 스폴링: 표면이 비교적 넓고 깊게 조각나 박리되는 손상, (다) 스코어링: 윤활막 파괴와 미끄럼으로 긁힘·융착·뜯김이 생기는 손상",
    requiredKeywords: ["피팅-점상 홈", "스폴링-넓고 깊은 박리", "스코어링-긁힘·융착"],
    acceptedAnswers: [
      "피팅: 점상 홈, 스폴링: 넓고 깊은 박리, 스코어링: 윤활막 파괴에 따른 긁힘·융착",
    ],
    traps: ["피팅과 스폴링을 모두 같은 크기의 박리로 설명", "스코어링을 단순 부식으로 설명"],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE, RECONSTRUCTION_2025_ROUND_2_PART_2],
  },
  "P-2025-3-Q02": {
    disposition: "verified",
    note:
      "2025년 3회 복원 글에서 네 도안의 순서와 명칭을 확인했다. 현행 산업안전보건법 시행규칙 별표 6과 대조하고 같은 순서의 공식 안전표지를 사용한다.",
    modelAnswer:
      "(가) 보안경 착용, (나) 보안면 착용, (다) 방진마스크 착용, (라) 매달린 물체 경고",
    requiredKeywords: ["보안경 착용", "보안면 착용", "방진마스크 착용", "매달린 물체 경고"],
    acceptedAnswers: [
      "보안경 착용, 보안면 착용, 방진마스크 착용, 매달린 물체 경고",
    ],
    traps: ["청력보호구 착용과 혼동", "낙하물 경고라고만 쓰고 매달린 물체 도안을 구분하지 않음"],
    evidenceUrls: [KOREAN_SAFETY_SIGN_RULE, RECONSTRUCTION_2025_ROUND_3],
  },
  "P-2025-3-Q09": {
    disposition: "verified",
    note:
      "NCS 운반하역기계 구동장치 정비의 브레이크액 요구성능을 직접 대조했다. 원문에서 확인되지 않은 고무·금속 적합성과 산화안정성은 답안에서 제외했다.",
    modelAnswer:
      "b, c, f, g, h",
    requiredKeywords: [
      "b",
      "c",
      "f",
      "g",
      "h",
    ],
    acceptedAnswers: [
      "b, c, f, g, h",
      "b·c·f·g·h",
    ],
    traps: [
      "NCS 원문에서 확인되지 않은 고무·금속 적합성 또는 산화안정성을 필수 답안으로 채택",
      "비점과 인화점의 높고 낮음을 반대로 작성",
    ],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE],
  },
  "P-2026-1-Q02": {
    disposition: "verified",
    note:
      "2026년 1회 복원 글의 a~f 도안 배열을 확인하고 현행 산업안전보건법 시행규칙 별표 6과 대조했다. 동일 순서의 공식 안전표지를 사용한다.",
    modelAnswer:
      "금지표지: a 출입금지, c 보행금지. 경고표지: b 인화성물질 경고, e 고압전기 경고. 지시표지: d 보안면 착용, f 귀마개 등 청력보호구 착용.",
    requiredKeywords: [
      "a-출입금지",
      "c-보행금지",
      "b-인화성물질 경고",
      "e-고압전기 경고",
      "d-보안면 착용",
      "f-청력보호구 착용",
    ],
    acceptedAnswers: [
      "a 출입금지, c 보행금지, b 인화성물질 경고, e 고압전기 경고, d 보안면 착용, f 청력보호구 착용",
    ],
    traps: ["금지·경고·지시 분류만 쓰고 각 기호와 명칭을 빠뜨림"],
    evidenceUrls: [KOREAN_SAFETY_SIGN_RULE, RECONSTRUCTION_2026_ROUND_1],
  },
  "P-2025-2-Q07": {
    disposition: "verified",
    note:
      "복원 글의 Q7은 베어링 급유 문제가 아니라 브레이크 오일이 과열·기화되어 제동력이 저하되는 현상을 묻는다. 문항과 답안을 베이퍼 로크로 바로잡았다.",
    modelAnswer:
      "베이퍼 로크(vapor lock): 브레이크 오일이 마찰열로 기화해 배관에 기포가 생기고 압력 전달이 끊겨 제동력이 급격히 저하되는 현상",
    requiredKeywords: ["베이퍼 로크", "브레이크 오일 기화", "기포", "제동력 저하"],
    acceptedAnswers: [
      "베이퍼 로크",
      "브레이크액이 기화해 기포가 생기고 제동력이 저하되는 베이퍼 로크 현상",
    ],
    traps: ["윤활유 공급이 끊기는 베어링 급유 현상으로 설명", "캐비테이션과 혼동"],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE, RECONSTRUCTION_2025_ROUND_2_PART_2],
  },
  "P-2026-1-Q09": {
    disposition: "verified",
    note:
      "2026년 1회 복원 글의 외접기어펌프 도면과 표시된 공차 프레임을 판독했다. 장치·기어·세 기하공차·Ø44G7/h6 끼워맞춤을 자체 도면에 재구성했다.",
    modelAnswer:
      "외접기어펌프, 평기어, (가) 평행도, (나) 원통도, (다) 동심도, Ø44G7/h6는 헐거운 끼워맞춤",
    requiredKeywords: ["외접기어펌프", "평기어", "평행도", "원통도", "동심도", "헐거운 끼워맞춤"],
    acceptedAnswers: [
      "외접기어펌프 / 평기어 / 평행도·원통도·동심도 / 헐거운 끼워맞춤",
    ],
    traps: ["내접기어펌프로 판독", "G7/h6를 억지 끼워맞춤으로 판정"],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE, RECONSTRUCTION_2026_ROUND_1],
  },
  "P-2026-1-Q08": {
    disposition: "cbt_corrected",
    note:
      "NCS 원문과 Rexnord 기어 커플링 정비자료를 대조했다. 큰 토크 전달과 편심·편각 허용은 유지하되, 복원 해설의 '정기 윤활 불필요'는 제거하고 윤활·씰·치면 점검을 반영했다.",
    modelAnswer:
      "기어 커플링이다. 특징은 ① 큰 토크를 전달한다. ② 약간의 편심과 편각을 허용한다. ③ 축방향 이동을 허용한다.",
    requiredKeywords: [
      "기어 커플링",
      "큰 토크 전달",
      "편심·편각 허용",
      "축방향 이동 허용",
    ],
    acceptedAnswers: [
      "기어 커플링 / 큰 토크 전달 / 편심·편각 허용 / 축방향 이동 허용",
    ],
    traps: ["정기 윤활이 불필요하다고 설명"],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE, REXNORD_GEAR_COUPLING_MANUAL],
  },
  "P-2026-1-Q10": {
    disposition: "verified",
    note:
      "원문은 연선을 눌러 두께를 재는 작업의 명칭을 요구한다. Plastigage는 유사 목적의 별도 측정재이므로 허용 답안에서 분리했다.",
    modelAnswer: "저널베어링 간극 측정",
    requiredKeywords: ["저널베어링", "간극 측정"],
    acceptedAnswers: ["저널베어링 간극 측정", "연선법에 의한 저널베어링 간극 측정"],
    traps: [
      "연선 압착 절차만 길게 쓰고 작업명 누락",
      "연선 대신 Plastigage를 사용한다고 바꾸어 씀",
    ],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE, RECONSTRUCTION_2026_ROUND_1],
  },
};
