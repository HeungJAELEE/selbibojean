/**
 * 실기 필답형 교재용 분류.
 *
 * 기존 `PracticalStudyCategoryId`는 문제풀이 분류이고, 이 파일은 NCS 원문을
 * 읽는 순서를 위한 교재 분류다. 문제 통계나 공개 상태에는 영향을 주지 않는다.
 */

export const practicalTextbookSubjects = [
  {
    id: "subject-1",
    code: "제1과목",
    title: "공유압 및 자동제어",
    description:
      "공압·유압의 힘과 유량, 센서, 밸브와 회로를 NCS 작업 기준으로 정리합니다.",
  },
  {
    id: "subject-2",
    code: "제2과목",
    title: "용접 및 안전관리",
    description:
      "용접 결함·검사와 작업 전후 안전조치를 답안 키워드와 순서 중심으로 정리합니다.",
  },
  {
    id: "subject-3",
    code: "제3과목",
    title: "기계설비 일반",
    description:
      "기계요소, 측정, 도면 해독, 조립·분해를 명칭·판독·작업순서로 정리합니다.",
  },
  {
    id: "subject-4",
    code: "제4과목",
    title: "설비진단 및 관리",
    description:
      "상태감시, 점검, 고장진단과 보전관리를 현장 판단 순서로 정리합니다.",
  },
] as const;

export type PracticalTextbookSubjectId =
  (typeof practicalTextbookSubjects)[number]["id"];

export type PracticalTextbookSubject =
  (typeof practicalTextbookSubjects)[number];

export const practicalTextbookStudyTypes = [
  {
    id: "definition",
    title: "개념 정의·특징",
    description: "무엇인지, 어떤 역할을 하는지, 답안에서 구분할 핵심 특징을 정리합니다.",
  },
  {
    id: "formula",
    title: "계산 공식",
    description:
      "NCS 원문에서 식·변수·단위·적용조건을 함께 확인한 계산만 정리합니다.",
  },
  {
    id: "procedure",
    title: "순서 맞추기",
    description: "점검·분해·조립·안전조치의 선후관계를 작업 흐름으로 정리합니다.",
  },
  {
    id: "visual",
    title: "그림 맞추기",
    description:
      "이미지는 후순위로 두고, 지금은 NCS 원문 위치와 명칭·구성요소 식별 기준을 글로 정리합니다.",
  },
  {
    id: "drawing",
    title: "도면·기호 맞추기",
    description: "투상·단면·주석·회로기호를 읽는 순서와 판독 기준을 정리합니다.",
  },
  {
    id: "diagnosis_safety",
    title: "기타: 선정·판정·진단·안전·관리",
    description:
      "선정·비교·판정, 점검·결함추적, 안전·품질기준, 기록·계획·모델링을 정리합니다.",
  },
] as const;

export type PracticalTextbookStudyTypeId =
  (typeof practicalTextbookStudyTypes)[number]["id"];

export type PracticalTextbookStudyType =
  (typeof practicalTextbookStudyTypes)[number];

export type PracticalTextbookSourceEvidence =
  | "direct"
  | "related"
  | "review_required";

export type PracticalTextbookPlacement = {
  subjectId: PracticalTextbookSubjectId;
  studyTypeIds: PracticalTextbookStudyTypeId[];
  /** NCS 쪽수가 직접적인 개념 근거인지, 관련 학습근거인지, 재검토 대상인지 */
  sourceEvidence: PracticalTextbookSourceEvidence;
};

/**
 * 원본 엑셀의 `관련과목` 표기가 ID와 한글명으로 섞여 있어, 이 교재 목차에서는
 * 개념의 실제 학습영역을 기준으로 고정한다. 특히 센서·유압 회로는 제1과목에 둔다.
 */
export const practicalTextbookPlacementByConceptId: Record<
  string,
  PracticalTextbookPlacement
> = {
  "PCON-001": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "drawing"],
    sourceEvidence: "related",
  },
  "PCON-002": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-003": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-004": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "visual", "procedure"],
    sourceEvidence: "direct",
  },
  "PCON-005": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "drawing"],
    sourceEvidence: "related",
  },
  "PCON-006": {
    subjectId: "subject-3",
    studyTypeIds: ["procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-007": {
    subjectId: "subject-3",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-008": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-009": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-010": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-011": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-012": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "drawing"],
    sourceEvidence: "related",
  },
  "PCON-013": {
    subjectId: "subject-3",
    studyTypeIds: ["procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "review_required",
  },
  "PCON-014": {
    subjectId: "subject-3",
    studyTypeIds: ["formula", "visual", "procedure"],
    sourceEvidence: "direct",
  },
  "PCON-015": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "review_required",
  },
  "PCON-016": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-017": {
    subjectId: "subject-2",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-018": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-019": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "formula", "drawing"],
    sourceEvidence: "direct",
  },
  "PCON-020": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "review_required",
  },
  "PCON-021": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "visual", "drawing"],
    sourceEvidence: "review_required",
  },
  "PCON-022": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    sourceEvidence: "related",
  },
  "PCON-023": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "visual", "drawing"],
    sourceEvidence: "related",
  },
  "PCON-024": {
    subjectId: "subject-3",
    studyTypeIds: ["visual", "procedure"],
    sourceEvidence: "related",
  },
  "PCON-025": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "formula", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-026": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "review_required",
  },
  "PCON-027": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "visual", "drawing"],
    sourceEvidence: "review_required",
  },
  "PCON-028": {
    subjectId: "subject-3",
    studyTypeIds: ["visual", "drawing"],
    sourceEvidence: "review_required",
  },
  "PCON-029": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-030": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "review_required",
  },
  "PCON-031": {
    subjectId: "subject-3",
    studyTypeIds: ["visual", "procedure"],
    sourceEvidence: "related",
  },
  "PCON-032": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "formula"],
    sourceEvidence: "direct",
  },
  "PCON-033": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "visual", "drawing"],
    sourceEvidence: "review_required",
  },
  "PCON-034": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    sourceEvidence: "review_required",
  },
  "PCON-035": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-036": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-037": {
    subjectId: "subject-3",
    studyTypeIds: ["formula", "visual", "procedure"],
    sourceEvidence: "direct",
  },
  "PCON-038": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "drawing"],
    sourceEvidence: "direct",
  },
  "PCON-039": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-040": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-041": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-042": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-043": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-044": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-045": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-046": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-001": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "formula", "procedure"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-002": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "formula", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-003": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-004": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-005": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-006": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-007": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-008": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-009": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-010": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-011": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-012": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-013": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-014": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-015": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-016": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-017": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-018": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "formula", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-019": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-020": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "visual", "drawing"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-021": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-022": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-023": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "drawing", "procedure"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-024": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "drawing", "visual"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-025": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "formula", "procedure", "visual"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-026": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "formula", "procedure", "visual"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-027": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "visual", "drawing"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-028": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-029": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-030": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-031": {
    subjectId: "subject-3",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-032": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-033": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-034": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-035": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-036": {
    subjectId: "subject-4",
    studyTypeIds: ["definition", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-037": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-038": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-039": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-040": {
    subjectId: "subject-1",
    studyTypeIds: ["definition", "procedure", "visual", "drawing", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-041": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-042": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
  "PCON-SUP-043": {
    subjectId: "subject-2",
    studyTypeIds: ["definition", "procedure", "visual", "diagnosis_safety"],
    sourceEvidence: "direct",
  },
};

export function getPracticalTextbookSubject(
  subjectId: string,
) {
  return practicalTextbookSubjects.find((subject) => subject.id === subjectId);
}

export function getPracticalTextbookStudyType(studyTypeId: string) {
  return practicalTextbookStudyTypes.find((type) => type.id === studyTypeId);
}

export function getPracticalTextbookPlacement(conceptId: string) {
  return practicalTextbookPlacementByConceptId[conceptId];
}
