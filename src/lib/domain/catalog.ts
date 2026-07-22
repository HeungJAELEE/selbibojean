import type { ConceptGroup, Subject } from "./types";

export const subjects: Subject[] = [
  {
    id: "subject-1",
    code: 1,
    title: "설비진단 및 계측",
    shortTitle: "설비진단·계측",
    description: "공유압, 전기·전자, 센서와 자동제어의 기초를 다룹니다.",
    color: "#16697a",
  },
  {
    id: "subject-2",
    code: 2,
    title: "설비용접",
    shortTitle: "설비용접",
    description: "용접법, 결함·검사와 작업 안전을 다룹니다.",
    color: "#b45309",
  },
  {
    id: "subject-3",
    code: 3,
    title: "기계요소 및 보전",
    shortTitle: "기계요소·보전",
    description: "기계요소, 가공, 배관과 구동설비 보전을 다룹니다.",
    color: "#4d7c0f",
  },
  {
    id: "subject-4",
    code: 4,
    title: "설비관리 및 윤활",
    shortTitle: "설비관리·윤활",
    description: "상태감시, 신뢰성, 보전관리와 윤활을 다룹니다.",
    color: "#6d28d9",
  },
];

type GroupSeed = [string, string[]];

const groupSeeds: Record<number, GroupSeed[]> = {
  1: [
    ["공유압 기초", ["공유압", "공압·유압 비교", "공압과 유압", "유압 특성", "공압 특성", "파스칼", "연속의 법칙", "레이놀즈", "베르누이", "Darcy", "보일 법칙", "샤를의 법칙", "비중", "비체적", "대기압", "압력 SI", "압력 단위", "힘 관계식", "유압장치 특징", "유압유 고점도", "작동유 과열", "에어레이션", "유압작동유 역할", "힘의 단위", "SI 기본단위"]],
    ["유압 동력원과 액추에이터", ["유압펌프", "유압모터", "실린더", "액추에이터", "베인펌프", "피스톤펌프", "기어펌프", "용적식 펌프", "로브펌프", "트로코이드펌프", "오일탱크", "유압탱크", "어큐뮬레이터", "유압 부속"]],
    ["유압 제어밸브", ["유압밸브", "릴리프", "감압", "시퀀스"]],
    ["유압·공압 제어밸브", ["방향제어", "체크밸브", "셔틀", "밸브"]],
    ["유량·속도제어", ["유량제어", "미터인", "미터아웃", "속도제어", "오리피스", "유출유량"]],
    ["액추에이터", ["단동", "복동", "로드", "실린더"]],
    ["압축공기 발생·처리", ["압축공기", "공기압축기", "공기탱크", "드레인", "에어드라이어", "FRL"]],
    ["공압 회로·시스템", ["공압", "공기압", "회로", "캐스케이드"]],
    ["전기·전자 기초", ["전압", "전류", "저항", "반도체", "유도전동기", "동기전동기", "교류전동기", "유도기전력", "변압기", "가동철편형", "단상", "3상"]],
    ["센서·신호변환", ["센서", "변환기", "브리지", "열전대", "광전", "엔코더", "인코더", "퍼텐쇼미터", "싱크로", "홀 효과", "자기 검출"]],
    ["자동제어 이론", ["피드백", "제어", "전달함수", "라플라스", "응답", "나이키스트", "비례게인", "비례대", "보드선도", "로우패스", "필터"]],
    ["PLC·전기·산업자동화", ["PLC", "시퀀스", "래더", "릴레이", "자동화", "AGV", "스테핑", "스텝모터", "티칭", "플레이백", "논리", "접점", "네트워크", "컨베이어", "핸들링", "배타적 OR"]],
  ],
  2: [
    ["용접 기초", ["용접", "용융", "모재", "용가재"]],
    ["아크용접", ["아크", "피복", "전극", "용접봉"]],
    ["가스·특수용접", ["가스용접", "산소", "아세틸렌", "TIG", "MIG", "서브머지드", "플라즈마", "테르밋", "전자빔", "레이저 용접"]],
    ["용접결함·검사", ["용접결함", "균열", "언더컷", "비파괴", "검사"]],
    ["용접·작업안전", ["용접안전", "역화", "화재", "보호구", "환기", "안전장치", "원형톱"]],
  ],
  3: [
    ["도면·측정·공차", ["도면", "공차", "끼워맞춤", "측정", "아베 원리", "아베의 원리", "마이크로미터", "버니어캘리퍼스", "하이트게이지", "블록게이지", "표면거칠기", "한계게이지", "제도"]],
    ["기계재료·열처리", ["재료", "강", "주철", "열처리", "담금질"]],
    ["나사·볼트·키·핀", ["나사", "볼트", "키", "핀", "와셔"]],
    ["축·커플링·클러치", ["축", "커플링", "클러치", "스플라인"]],
    ["베어링", ["베어링", "축받이", "저널", "구름"]],
    ["기어·감속기", ["기어", "치차", "감속기", "모듈", "백래시"]],
    ["동력전달요소", ["벨트", "체인", "로프", "스프로킷", "동력전달", "브레이크", "마찰차", "래칫", "고무스프링"]],
    ["기계가공·공구", ["선반", "밀링", "연삭", "드릴", "절삭", "공구", "금긋기", "탭", "래핑", "스크레이퍼", "보링", "줄 작업", "도금", "접착제"]],
    ["배관·밸브·이음", ["배관", "관이음", "플랜지", "밸브", "패킹", "메커니컬실", "씰재", "PTFE", "수격"]],
    ["펌프·송풍기·압축기", ["펌프", "송풍기", "압축기", "캐비테이션", "양정"]],
    ["전동기·구동설비 보전", ["전동기", "모터", "구동", "절연", "브러시"]],
    ["작업·조립·정비작업", ["조립", "정비", "분해", "공구", "중심맞춤", "점검 체크리스트", "방청윤활유"]],
  ],
  4: [
    ["계측 기초·신호처리", ["계측", "오차", "정밀도", "감도", "신호", "저항 측정", "정전용량", "오실로스코프", "RMS", "앨리어싱", "브리지", "클램프형", "변류기", "동전형", "1차 지연", "시간상수", "광학식 인코더", "회전수 광학"]],
    ["진동 기초", ["진동", "주파수", "진폭", "고유진동", "공진", "방진", "스프링 합성", "파동", "동적배율"]],
    ["회전체 진동진단", ["회전체", "불평형", "불정렬", "축정렬", "진동진단", "베어링결함", "미끄럼·구름베어링", "기어 피팅", "기어 스폴링", "기어 리징", "가속도센서", "오일휩", "오일월", "오일휠", "oil whip", "oil whirl"]],
    ["소음·음향", ["소음", "음압", "데시벨", "음향", "주파수분석", "마스킹", "흡음", "음속", "잔향음장", "회절", "파면", "음선", "종파"]],
    ["온도·압력·유량계측", ["온도계", "압력계", "유량계", "열전대", "오리피스", "압력·유량 변환기", "변위 센서", "변위센서", "스프링 변환기", "레벨계", "온도센서", "압력센서", "압력검출", "측온저항체", "백금 측온", "회전수 측정"]],
    ["상태감시·설비진단", ["상태감시", "설비진단", "트렌드", "열화", "고장진단", "상대판정", "지능기술", "오일 분석", "간이진단", "페로그래피", "SOAP"]],
    ["설비관리·보전방법", ["설비관리", "보전", "예방보전", "사후보전", "개량보전", "개별사전대체", "설비대장", "설비 분류", "설비망", "수리공사", "고장대책", "설비 기호", "관리설비", "기능설비", "니모닉"]],
    ["신뢰성·보전성", ["신뢰도", "신뢰성", "고장률", "MTBF", "MTTR", "보전도", "FMECA", "사용신뢰성", "생애주기", "우발고장", "초기고장기"]],
    ["TPM·자주보전·예방보전", ["TPM", "자주보전", "계획보전", "종합효율", "PM분석", "설비 로스", "6대 로스", "9대 로스", "만성로스", "불량·수정로스", "속도저하로스", "치명결점", "히스토그램", "QC 도구", "파레토도", "특성요인도", "관리도", "가동률", "성능가동률", "품질불량"]],
    ["공장계획·생산·프로젝트", ["공장계획", "생산", "공정", "프로젝트", "PERT", "재주문점", "설비배치", "CRAFT", "상비", "사용고발주", "예비공사", "예비품", "복책법", "검사구", "공사관리", "공사 완급", "설비계획", "부대설비", "치공구", "의사결정"]],
    ["설비경제성·원가", ["경제성", "원가", "감가상각", "투자", "손익", "견적", "연평균", "연간비용", "제조간접비"]],
    ["에너지·열관리", ["에너지", "열관리", "열효율", "연소", "보온", "부등률", "부하율", "수요율", "열전도"]],
    ["윤활 기초·물성", ["윤활", "점도", "유막", "마찰", "유동점", "작동유 성질", "중화가", "파라핀계", "위험물 석유류", "API 비중"]],
    ["윤활유·그리스·첨가제", ["윤활유", "그리스", "첨가제", "기유", "주도", "플러싱유", "기어유", "압축기 내부유"]],
    ["급유법·윤활관리", ["급유", "윤활관리", "오일링", "그리스윤활", "오염", "수분관리"]],
  ],
};

export const conceptGroups: ConceptGroup[] = Object.entries(groupSeeds).flatMap(([subjectCode, groups]) =>
  groups.map(([title, keywords], index) => ({
    id: `s${subjectCode}-g${String(index + 1).padStart(2, "0")}`,
    subjectId: `subject-${subjectCode}`,
    order: index + 1,
    title,
    keywords,
  })),
);

export function getSubject(subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getConceptGroup(groupId: string) {
  return conceptGroups.find((group) => group.id === groupId);
}

const conceptGroupOverrides: Record<number, Array<{ pattern: RegExp; groupId: string }>> = {
  1: [
    { pattern: /공압[·\s/]*(?:과|및)?[·\s/]*유압.*(?:비교|특성)|유압[·\s/]*(?:과|및)?[·\s/]*공압.*(?:비교|특성)/i, groupId: "s1-g01" },
  ],
  3: [
    { pattern: /아베(?:의)?\s*원리|애비(?:의)?\s*원리/i, groupId: "s3-g01" },
  ],
};

function keywordMatchScore(text: string, keyword: string, weight: number) {
  const normalizedKeyword = keyword.toLowerCase();
  if (!text.includes(normalizedKeyword)) return 0;
  if ([...normalizedKeyword.replace(/\s/g, "")].length <= 1) {
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const standalone = new RegExp(`(^|[^가-힣a-z0-9])${escaped}($|[^가-힣a-z0-9])`, "i").test(text);
    return standalone ? weight : 0;
  }
  return [...normalizedKeyword].length * weight;
}

export function mapConceptGroup(subjectCode: number, ...texts: Array<string | null | undefined>) {
  const candidates = conceptGroups.filter((group) => group.subjectId === `subject-${subjectCode}`);
  const conceptText = (texts[0] ?? "").toLowerCase();
  const stemText = (texts[1] ?? "").toLowerCase();
  const contextText = texts.slice(2).filter(Boolean).join(" ").toLowerCase();
  const override = conceptGroupOverrides[subjectCode]?.find(({ pattern }) => pattern.test(conceptText));
  if (override) {
    const group = candidates.find((candidate) => candidate.id === override.groupId) ?? candidates[0];
    return { group, confidence: "override", score: 10_000, margin: 10_000 } as const;
  }

  const ranked = candidates.map((candidate) => {
    const score = candidate.keywords.reduce((total, keyword) => {
      return total +
        keywordMatchScore(conceptText, keyword, 100) +
        keywordMatchScore(stemText, keyword, 10) +
        keywordMatchScore(contextText, keyword, 1);
    }, 0);
    return { group: candidate, score };
  }).sort((a, b) => b.score - a.score || a.group.order - b.group.order);

  const best = ranked[0];
  const margin = best.score - (ranked[1]?.score ?? 0);
  const hasConceptSignal = best.group.keywords.some((keyword) => keywordMatchScore(conceptText, keyword, 100) > 0);
  const confidence = best.score <= 0 ? "fallback" : hasConceptSignal || margin >= 20 ? "keyword" : "weak";

  return { group: best.group, confidence, score: best.score, margin } as const;
}
