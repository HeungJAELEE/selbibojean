export const PRACTICAL_QUALIFICATION_OVERVIEW = {
  operator: "한국산업인력공단",
  relatedDepartments: "대학 및 전문대학의 기계 관련학과",
  writtenSubjects: [
    "공유압 및 자동제어",
    "용접 및 안전관리",
    "기계설비 일반",
    "설비진단 및 관리",
  ],
  practicalSubject: "설비보전 심화 실무",
  writtenMethod: "객관식 4지 택일형 · 과목당 20문항 · 과목당 30분",
  practicalMethod:
    "필답형 40점(1시간) + 작업형 공압 20점·유압 20점·용접 20점(총 2시간 40분)",
  writtenPass:
    "과목당 40점 이상이며 전 과목 평균 60점 이상",
  practicalPass:
    "100점 만점 중 60점 이상. 작업형 과제 중 실격 사항에 해당하면 전체 실격",
  qualificationUrl:
    "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1837",
} as const;

export type PracticalPublicProblem = {
  id: string;
  category: "pneumatic" | "hydraulic" | "welding";
  qualification: "engineer" | "industrial_engineer";
  qualificationLabel: "설비보전기사" | "설비보전산업기사";
  taskLabel: string;
  fileName: string;
  downloadUrl: string;
  articleUrl: string;
  appliedFrom: string;
  note: string;
};

const ENGINEER_ARTICLE_URL =
  "https://www.q-net.or.kr/cst006.do?artlSeq=5209398&brdId=Q006&gSite=Q&id=cst00602";
const INDUSTRIAL_ENGINEER_ARTICLE_URL =
  "https://www.q-net.or.kr/cst006.do?artlSeq=5209399&brdId=Q006&code=1204&gId=&gSite=Q&id=cst00602";

function qNetDownloadUrl({
  filePath,
  fileName,
  fileSeq,
  articleSeq,
}: {
  filePath: string;
  fileName: string;
  fileSeq: string;
  articleSeq: string;
}) {
  const query = new URLSearchParams({
    id: "cst00602s01",
    gSite: "Q",
    gId: "",
    fileCode: "R001",
    filePath,
    fileName,
    fileSeq,
    artlSeq: articleSeq,
    href: "0",
  });

  return `https://www.q-net.or.kr/cst006.do?${query.toString()}`;
}

export const PRACTICAL_PUBLIC_PROBLEMS: readonly PracticalPublicProblem[] = [
  {
    id: "engineer-pneumatic-2026",
    category: "pneumatic",
    qualification: "engineer",
    qualificationLabel: "설비보전기사",
    taskLabel: "제1과제 · 공기압시스템 진단 및 구성",
    fileName: "[1과제] 공기압시스템 진단 및 구성_260508수정.pdf",
    downloadUrl: qNetDownloadUrl({
      filePath: "bbs/Q006/Q006_2256837",
      fileName: "[1과제] 공기압시스템 진단 및 구성_260508수정.pdf",
      fileSeq: "2256837",
      articleSeq: "5209398",
    }),
    articleUrl: ENGINEER_ARTICLE_URL,
    appliedFrom: "2026년 정기 기사 제2회부터",
    note: "기사 응시자는 이 자료를 우선 확인합니다.",
  },
  {
    id: "engineer-hydraulic-2026",
    category: "hydraulic",
    qualification: "engineer",
    qualificationLabel: "설비보전기사",
    taskLabel: "제2과제 · 유압시스템 진단 및 구성",
    fileName: "[2과제] 유압시스템 진단 및 구성_260508수정.pdf",
    downloadUrl: qNetDownloadUrl({
      filePath: "bbs/Q006/Q006_2256838",
      fileName: "[2과제] 유압시스템 진단 및 구성_260508수정.pdf",
      fileSeq: "2256838",
      articleSeq: "5209398",
    }),
    articleUrl: ENGINEER_ARTICLE_URL,
    appliedFrom: "2026년 정기 기사 제2회부터",
    note: "기사 응시자는 이 자료를 우선 확인합니다.",
  },
  {
    id: "engineer-welding-2026",
    category: "welding",
    qualification: "engineer",
    qualificationLabel: "설비보전기사",
    taskLabel: "제3과제 · 보수 용접 및 누수 시험",
    fileName: "[3과제] 보수 용접 및 누수 시험_260508수정.pdf",
    downloadUrl: qNetDownloadUrl({
      filePath: "bbs/Q006/Q006_2256839",
      fileName: "[3과제] 보수 용접 및 누수 시험_260508수정.pdf",
      fileSeq: "2256839",
      articleSeq: "5209398",
    }),
    articleUrl: ENGINEER_ARTICLE_URL,
    appliedFrom: "2026년 정기 기사 제2회부터",
    note: "기사 응시자는 이 자료를 우선 확인합니다.",
  },
  {
    id: "industrial-pneumatic-2026",
    category: "pneumatic",
    qualification: "industrial_engineer",
    qualificationLabel: "설비보전산업기사",
    taskLabel: "참고 · 공기압시스템 설계 및 구성",
    fileName: "[1과제] 공기압시스템 설계 및 구성_260508 수정.pdf",
    downloadUrl: qNetDownloadUrl({
      filePath: "bbs/Q006/Q006_2256840",
      fileName: "[1과제] 공기압시스템 설계 및 구성_260508 수정.pdf",
      fileSeq: "2256840",
      articleSeq: "5209399",
    }),
    articleUrl: INDUSTRIAL_ENGINEER_ARTICLE_URL,
    appliedFrom: "2026년 정기 기사 제2회부터",
    note: "사용자가 제공한 PDF와 동일한 산업기사 자료입니다. 기사 과제와 혼동하지 않습니다.",
  },
  {
    id: "industrial-hydraulic-2026",
    category: "hydraulic",
    qualification: "industrial_engineer",
    qualificationLabel: "설비보전산업기사",
    taskLabel: "참고 · 유압시스템 설계 및 구성",
    fileName: "[2과제] 유압시스템 설계 및 구성_260508 수정.pdf",
    downloadUrl: qNetDownloadUrl({
      filePath: "bbs/Q006/Q006_2256841",
      fileName: "[2과제] 유압시스템 설계 및 구성_260508 수정.pdf",
      fileSeq: "2256841",
      articleSeq: "5209399",
    }),
    articleUrl: INDUSTRIAL_ENGINEER_ARTICLE_URL,
    appliedFrom: "2026년 정기 기사 제2회부터",
    note: "사용자가 제공한 PDF와 동일한 산업기사 자료입니다. 기사 과제와 혼동하지 않습니다.",
  },
  {
    id: "industrial-welding-2026",
    category: "welding",
    qualification: "industrial_engineer",
    qualificationLabel: "설비보전산업기사",
    taskLabel: "참고 · 가스 절단 및 용접",
    fileName: "[3과제] 가스 절단 및 용접_260508 수정.pdf",
    downloadUrl: qNetDownloadUrl({
      filePath: "bbs/Q006/Q006_2256842",
      fileName: "[3과제] 가스 절단 및 용접_260508 수정.pdf",
      fileSeq: "2256842",
      articleSeq: "5209399",
    }),
    articleUrl: INDUSTRIAL_ENGINEER_ARTICLE_URL,
    appliedFrom: "2026년 정기 기사 제2회부터",
    note: "사용자가 제공한 PDF와 동일한 산업기사 자료입니다. 기사 과제와 혼동하지 않습니다.",
  },
] as const;

export const PRACTICAL_SUPPLIES_OFFICIAL_URL =
  "https://www.q-net.or.kr/rcv013.do?id=rcv01314&&gSite=Q&gId=&JM_CD=1837&JM_FLD_NM=%EC%84%A4%EB%B9%84%EB%B3%B4%EC%A0%84%EA%B8%B0%EC%82%AC&SELFLD_CD=00&SERIES_CD=03&IMPL_ID=PL2024556072&sel_yy=2024&hh=1&gyul=03";
