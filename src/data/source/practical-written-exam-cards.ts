import type {
  PracticalWrittenExamCard,
  PracticalWrittenExamCardFormat,
} from "@/lib/domain/practical-types";
import { PRACTICAL_TASK_SEQUENCE_SEEDS } from "./practical-task-sequences";

export type PracticalWrittenExamCardSeed = Omit<
  PracticalWrittenExamCard,
  "sourceRefs"
>;

type LegacyPracticalWrittenExamCardSeed = Omit<
  PracticalWrittenExamCardSeed,
  | "slug"
  | "primaryFormat"
  | "secondaryFormats"
  | "variantQuestionIds"
  | "keywordLinks"
  | "visualAidIds"
  | "recognitionVisualAidIds"
  | "pastQuestionVisualMappings"
  | "sequenceSteps"
  | "contentStatus"
> &
  Partial<
    Pick<
      PracticalWrittenExamCardSeed,
      "visualAidIds" | "recognitionVisualAidIds" | "sequenceSteps"
    >
  >;

const keywordSlug = (keyword: string) =>
  encodeURIComponent(keyword.trim().replace(/\s+/g, "-"));

const card = (
  value: LegacyPracticalWrittenExamCardSeed,
): PracticalWrittenExamCardSeed => ({
  ...value,
  slug: value.id.toLowerCase().replace(/^pwec-/, "").replace(/_/g, "-"),
  primaryFormat: value.format,
  secondaryFormats: [],
  variantQuestionIds: value.predictedQuestionIds.slice(0, 1),
  keywordLinks: value.studyKeywords.map((keyword) => ({
    slug: keywordSlug(keyword),
    label: keyword,
  })),
  visualAidIds: value.visualAidIds ?? [],
  recognitionVisualAidIds: value.recognitionVisualAidIds ?? [],
  pastQuestionVisualMappings: [],
  sequenceSteps:
    value.sequenceSteps ??
    (value.format === "sequence"
      ? value.answerSkeleton.map((label, index) => ({
          id: `${value.id}-STEP-${index + 1}`,
          label,
          safetyCritical:
            /안전|차단|잠금|잔압|보호구/.test(label),
          visualFrameIds: [],
          answerPhrase: label,
        }))
      : []),
  contentStatus: "published",
});

export const PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS: Record<
  PracticalWrittenExamCardFormat,
  string
> = {
  image: "사진·명칭형",
  drawing: "도면형",
  symbol: "기호형",
  calculation: "계산형",
  definition: "정의형",
  sequence: "순서형",
  matching: "연결형",
  diagnosis: "원인·대책형",
};

/**
 * 최근 복원문제에서 반복되거나, 사용자가 우선 완성을 지정한 대표 10개
 * 필답 유형이다. 실제 회차가 확인되지 않은 오버랩은 예상형으로 명시한다.
 */
export const PRACTICAL_WRITTEN_EXAM_CARD_SEEDS: PracticalWrittenExamCardSeed[] = [
  card({
    id: "PWEC-BEARING-IDENTIFICATION",
    title: "구름베어링 4종 사진 식별",
    conceptIds: ["PCON-004"],
    evidenceIds: [
      "evidence:P-2025-1-Q04",
      "evidence:P-2025-2-Q01-2",
      "evidence:EXP-B01",
    ],
    format: "image",
    questionPattern:
      "사진의 전동체 형상과 궤도륜 방향을 보고 베어링 명칭을 순서대로 쓴다.",
    directAnswer:
      "원통 롤러베어링, 테이퍼 롤러베어링, 스러스트 볼베어링, 스러스트 니들 롤러베어링이다.",
    studyKeywords: [
      "원통 롤러",
      "테이퍼 롤러",
      "스러스트 볼",
      "스러스트 니들",
    ],
    answerSkeleton: [
      "(가) 원통 롤러베어링",
      "(나) 테이퍼 롤러베어링",
      "(다) 스러스트 볼베어링",
      "(라) 스러스트 니들 롤러베어링",
    ],
    recognitionPoints: [
      "곧은 원통 롤러는 큰 반경하중을 받는다.",
      "경사진 테이퍼 롤러는 반경·축방향 복합하중을 받는다.",
      "스러스트형은 와셔 사이 전동체가 축방향 하중을 받는다.",
    ],
    reasoningSummary: [
      "볼인지 롤러인지 먼저 구분하고 롤러가 곧은지 경사진지 본다.",
      "내·외륜보다 와셔가 마주 보는 형상이면 스러스트형으로 판단한다.",
    ],
    commonWrongAnswers: [
      "테이퍼 롤러를 자동조심 롤러로 쓰기",
      "스러스트 볼과 스러스트 니들의 전동체를 바꾸기",
      "사진 순서와 답안 순서를 다르게 쓰기",
    ],
    variationAxes: [
      "사진 순서 변경",
      "자동조심 롤러베어링 추가",
      "허용 하중 특징 연결",
      "구성요소 명칭 결합",
    ],
    pastQuestionIds: ["P-2025-1-Q04", "P-2025-2-Q01-2"],
    predictedQuestionIds: ["EXP-B01", "EXP-B02", "EXP-B06"],
    predictedExamples: [
      "사진 4종의 명칭과 주로 받는 하중 방향을 함께 쓰시오.",
      "자동조심 롤러베어링의 식별 단서 2가지를 쓰시오.",
    ],
    visualAidIds: [
      "ncs-bearing-four-types",
      "ncs-spherical-roller-bearing",
    ],
    recognitionVisualAidIds: [
      "ncs-bearing-four-types",
      "ncs-spherical-roller-bearing",
    ],
    supplementalConceptIds: ["PCON-036", "PCON-SUP-035"],
  }),
  card({
    id: "PWEC-BEARING-INDUCTION-HEATING",
    title: "베어링 유도가열 조립순서",
    conceptIds: ["PCON-006"],
    evidenceIds: [
      "evidence:P-2025-1-Q06",
      "evidence:EXP-B03",
      "evidence:EXP-D01",
    ],
    format: "sequence",
    questionPattern:
      "유도가열기 사용 순서를 배열하고 탈자와 신속 장착의 목적을 쓴다.",
    directAnswer:
      "치수확인 → 요크선택 → 온도센서 부착 → 목표온도 설정 → 가열·탈자 → 보호구 착용 → 신속 장착·밀착 순이다. 탈자는 잔류자기를 제거하기 위한 것이다.",
    studyKeywords: ["치수확인", "온도센서", "목표온도", "탈자", "신속 장착"],
    answerSkeleton: [
      "준비: 베어링·축 치수와 가열기 상태를 확인한다.",
      "가열: 요크와 센서를 설치하고 지정 목표온도로 균일 가열한다.",
      "완료: 탈자 후 보호구를 착용하고 축 어깨까지 신속히 밀착한다.",
    ],
    recognitionPoints: [
      "온도센서는 내륜 온도를 대표하는 위치에 둔다.",
      "가열 후 냉각되기 전에 축에 직각으로 삽입한다.",
      "직화와 전동체를 통한 타격은 사용하지 않는다.",
    ],
    reasoningSummary: [
      "가열은 억지끼워맞춤 내륜을 팽창시켜 조립력을 줄이는 과정이다.",
      "탈자·보호구·밀착 확인까지 써야 장착순서가 완결된다.",
    ],
    commonWrongAnswers: [
      "직화로 베어링 한쪽만 가열하기",
      "가열 직후 외륜을 망치로 타격하기",
      "탈자와 최종 밀착 확인을 빼기",
    ],
    variationAxes: [
      "순서 배열",
      "탈자 목적",
      "가열 후 간극 확인",
      "압입과 가열조립 비교",
    ],
    pastQuestionIds: ["P-2025-1-Q06"],
    predictedQuestionIds: ["EXP-B03", "EXP-D01"],
    predictedExamples: [
      "가열조립과 냉간 압입에서 힘을 가하는 링을 비교하시오.",
      "가열 후 축 어깨에 밀착되지 않았을 때 조치 순서를 쓰시오.",
    ],
    visualAidIds: ["diagram-bearing-induction-heating-sequence"],
    sequenceSteps: [
      {
        id: "PWEC-BEARING-INDUCTION-HEATING-STEP-1",
        label: "베어링·축 치수와 가열기 상태를 확인한다.",
        visualFrameIds: [
          "diagram-bearing-induction-heating-sequence--check",
        ],
        checkpoint: "끼워맞춤 대상과 가열 가능 베어링인지 확인",
        wrongAction: "밀봉형·그리스 봉입형 베어링을 조건 확인 없이 가열",
        answerPhrase: "치수·상태 확인",
      },
      {
        id: "PWEC-BEARING-INDUCTION-HEATING-STEP-2",
        label: "온도센서를 설치하고 지정 목표온도까지 균일하게 가열한다.",
        visualFrameIds: [
          "diagram-bearing-induction-heating-sequence--heat",
        ],
        checkpoint: "온도센서 접촉과 균일 가열 확인",
        wrongAction: "직화로 한쪽만 가열",
        answerPhrase: "온도센서 설치·균일 가열",
      },
      {
        id: "PWEC-BEARING-INDUCTION-HEATING-STEP-3",
        label:
          "보호구를 착용해 신속히 삽입하고 어깨부 밀착·냉각 상태를 확인한다.",
        safetyCritical: true,
        visualFrameIds: [
          "diagram-bearing-induction-heating-sequence--fit",
        ],
        checkpoint: "축 어깨부 밀착과 냉각 후 고정 상태 확인",
        wrongAction: "가열 후 방치하거나 전동체를 타격",
        answerPhrase: "신속 삽입·밀착·냉각 확인",
      },
    ],
    supplementalConceptIds: ["PCON-036"],
  }),
  card({
    id: "PWEC-SENSOR-HYSTERESIS",
    title: "센서 히스테리시스",
    conceptIds: ["PCON-011"],
    evidenceIds: [
      "evidence:P-2025-2-Q02",
      "evidence:EXP-SUP-014",
    ],
    format: "definition",
    questionPattern:
      "입력이 증가할 때와 감소할 때 같은 입력값에서 출력이 달라지는 현상의 명칭과 뜻을 쓴다.",
    directAnswer:
      "히스테리시스는 입력을 증가시킬 때와 감소시킬 때 같은 입력값에서도 센서 출력 또는 동작점이 다르게 나타나는 현상이다.",
    studyKeywords: ["입력 증가", "입력 감소", "같은 입력값", "출력 차이", "동작점"],
    answerSkeleton: [
      "명칭: 히스테리시스",
      "조건: 입력의 증가 과정과 감소 과정",
      "현상: 같은 입력값에서 출력 또는 동작점이 서로 다름",
    ],
    recognitionPoints: [
      "왕복 입력에서 상승곡선과 하강곡선이 일치하지 않는다.",
      "반복성은 같은 방향 반복값의 흩어짐이고 히스테리시스와 다르다.",
      "분해능은 구별 가능한 최소 입력변화이므로 별개다.",
    ],
    reasoningSummary: [
      "문제에 증가·감소·복귀·동작점 차이가 함께 나오면 히스테리시스를 우선 판단한다.",
      "원인 추정 전에 현상의 정의를 정확히 쓰는 것이 채점의 핵심이다.",
    ],
    commonWrongAnswers: [
      "분해능 또는 감도라고 답하기",
      "단순 반복오차로만 설명하기",
      "입력 방향 조건을 빼기",
    ],
    variationAxes: [
      "정의형",
      "상승·하강 그래프 판독",
      "동작점·복귀점 계산",
      "반복성·분해능 비교",
    ],
    pastQuestionIds: ["P-2025-2-Q02"],
    predictedQuestionIds: ["EXP-SUP-014"],
    predictedExamples: [
      "동작점과 복귀점이 주어졌을 때 히스테리시스 폭을 구하시오.",
      "히스테리시스와 반복성의 차이를 2문장으로 쓰시오.",
    ],
    supplementalConceptIds: ["PCON-SUP-014"],
  }),
  card({
    id: "PWEC-WELDING-OVERLAP",
    title: "용접 오버랩 판정과 방지",
    conceptIds: ["PCON-044"],
    evidenceIds: ["evidence:EXP-W01"],
    format: "diagnosis",
    questionPattern:
      "비드 가장자리의 용착금속이 모재와 융합되지 않고 겹쳐진 결함을 식별하고 원인·방지대책을 쓴다.",
    directAnswer:
      "오버랩은 용착금속이 모재 표면에 융합되지 않은 채 비드 가장자리 밖으로 겹쳐진 결함이다. 전류·속도·운봉각과 용융지 크기를 조정해 방지한다.",
    studyKeywords: ["용착금속", "비드 가장자리", "미융합", "운봉각", "용융지"],
    answerSkeleton: [
      "정의: 용착금속이 모재와 융합되지 않고 가장자리에 겹침",
      "원인: 부적절한 전류·속도·각도와 과대한 용융지",
      "대책: 조건과 운봉을 조정하고 결함부는 기준에 따라 제거·보수",
    ],
    recognitionPoints: [
      "비드 토우가 홈처럼 파였으면 언더컷이다.",
      "금속이 흘러 덮였지만 경계가 융합되지 않았으면 오버랩이다.",
      "사진만으로 허용 여부를 단정하지 않고 적용 기준을 확인한다.",
    ],
    reasoningSummary: [
      "오버랩은 모재가 깎인 결함이 아니라 용착금속이 덮인 미융합 형상이다.",
      "원인과 대책은 전류 하나로 통일하지 말고 속도·각도·용융지까지 연결한다.",
    ],
    commonWrongAnswers: [
      "언더컷 정의를 쓰기",
      "대책을 전류 증가 하나로만 쓰기",
      "결함 위에 그대로 덧살용접한다고 쓰기",
    ],
    variationAxes: [
      "언더컷과 사진 비교",
      "원인·대책 서술",
      "보수 여부 판단",
      "수평자세 상·하부 결함",
    ],
    pastQuestionIds: [],
    predictedQuestionIds: ["EXP-W01"],
    predictedExamples: [
      "오버랩과 언더컷의 외관 차이와 각각의 방지대책을 쓰시오.",
      "오버랩 발견 후 제거·재검사·보수 순서를 쓰시오.",
    ],
    supplementalConceptIds: ["PCON-046", "PCON-SUP-019"],
  }),
  card({
    id: "PWEC-HYDRAULIC-CYLINDER-FORCE",
    title: "복동 유압실린더 전진·후진 추력",
    conceptIds: ["PCON-025"],
    evidenceIds: [
      "evidence:P-2025-3-Q08",
      "evidence:EXP-H01",
      "evidence:EXP-C02",
    ],
    format: "calculation",
    questionPattern:
      "실린더 내경·로드지름·압력·효율로 전진력과 후진력을 계산한다.",
    directAnswer:
      "전진은 피스톤 전면적을, 후진은 로드 단면적을 뺀 환상면적을 사용한다. F전=PπD²/4, F후=Pπ(D²-d²)/4이며 효율이 주어지면 각각 η를 곱한다.",
    studyKeywords: ["전면적", "환상면적", "압력", "효율", "단위변환"],
    answerSkeleton: [
      "전진 유효면적 A전=πD²/4",
      "후진 유효면적 A후=π(D²-d²)/4",
      "F=P×A×η를 적용하고 N 또는 kN으로 정리",
    ],
    recognitionPoints: [
      "로드가 있는 후진측 유효면적이 더 작다.",
      "MPa와 mm²를 쓰면 결과 단위는 N으로 바로 정리할 수 있다.",
      "효율이 없으면 이론추력, 있으면 마지막에 한 번만 곱한다.",
    ],
    reasoningSummary: [
      "전진·후진 차이는 압력이 아니라 압력이 작용하는 유효면적에서 생긴다.",
      "공식보다 먼저 어느 면적을 쓰는지 그림에 표시하면 실수를 줄일 수 있다.",
    ],
    commonWrongAnswers: [
      "후진에도 전면적을 사용하기",
      "로드지름을 피스톤지름에서 직접 빼기",
      "효율을 두 번 곱하거나 단위를 생략하기",
    ],
    variationAxes: [
      "효율 유무",
      "N·kN 단위",
      "전진·후진 비교",
      "필요 압력 역산",
    ],
    pastQuestionIds: ["P-2025-3-Q08"],
    predictedQuestionIds: ["EXP-H01", "EXP-C02"],
    predictedExamples: [
      "목표 후진추력이 주어졌을 때 필요한 압력을 구하시오.",
      "같은 압력에서 로드지름 변화가 후진력에 미치는 영향을 설명하시오.",
    ],
    supplementalConceptIds: ["PCON-032"],
  }),
  card({
    id: "PWEC-LOTO-SEQUENCE",
    title: "LOTO 기본순서",
    conceptIds: ["PCON-017"],
    evidenceIds: [
      "evidence:P-2025-2-Q09",
      "evidence:EXP-S01",
      "evidence:EXP-S03",
    ],
    format: "sequence",
    questionPattern:
      "정비 전 잠금·표찰과 잔류에너지 제거·무에너지 확인까지 순서대로 쓴다.",
    directAnswer:
      "통보 → 정상정지 → 에너지원 식별·차단 → 개인 잠금·표찰 → 잔류에너지 제거 → 무에너지 상태 검증 → 작업 순이다.",
    studyKeywords: ["통보", "에너지 격리", "잠금·표찰", "잔류에너지", "무에너지 검증"],
    answerSkeleton: [
      "설비와 작업자에게 정비 사실을 통보하고 정상정지한다.",
      "모든 에너지원을 식별·차단한 뒤 개인 잠금장치와 표찰을 부착한다.",
      "잔류에너지를 제거하고 무에너지를 검증한 뒤 작업한다.",
    ],
    recognitionPoints: [
      "정지버튼은 에너지 격리가 아니다.",
      "전기뿐 아니라 유압·공압·중력·탄성·열에너지도 확인한다.",
      "작업 전 압력계 0·시험조작 등으로 실제 격리를 검증한다.",
    ],
    reasoningSummary: [
      "차단과 잠금 사이, 잠금과 작업 사이에 빠진 단계가 없는지 본다.",
      "잔류에너지 제거 후 검증이 없으면 안전절차가 완결되지 않는다.",
    ],
    commonWrongAnswers: [
      "전원 스위치만 끄고 완료라고 쓰기",
      "표찰만 붙이고 개인 잠금을 생략하기",
      "잔압·중력하중 확인 없이 작업하기",
    ],
    variationAxes: [
      "7단계 배열",
      "유압 잔압 사례",
      "공압 저장에너지 사례",
      "복구·재가동 절차",
    ],
    pastQuestionIds: ["P-2025-2-Q09"],
    predictedQuestionIds: ["EXP-S01", "EXP-S03"],
    predictedExamples: [
      "유압설비 정비 전 잔류에너지 제거 방법을 포함해 LOTO를 쓰시오.",
      "LOTO 해제와 재가동 전 확인사항을 쓰시오.",
    ],
    supplementalConceptIds: ["PCON-043"],
  }),
  card({
    id: "PWEC-VERNIER-READING",
    title: "버니어캘리퍼스 눈금 판독",
    conceptIds: ["PCON-014"],
    evidenceIds: [
      "evidence:P-2025-2-Q05",
      "evidence:EXP-M01",
    ],
    format: "calculation",
    questionPattern:
      "버니어 0선 직전의 주척값과 일치눈금×최소눈금을 더해 측정값을 구한다.",
    directAnswer:
      "측정값은 주척(본척)값 + (버니어 일치눈금 번호 × 최소눈금)이다. 예를 들어 주척 37 mm, 7번째 일치, 최소눈금 0.05 mm이면 37.35 mm이다.",
    studyKeywords: ["주척값", "0선", "일치눈금", "최소눈금", "mm"],
    answerSkeleton: [
      "주척: 버니어 0선이 지난 마지막 주척값을 읽는다.",
      "버니어: 일치하는 눈금번호×최소눈금을 계산한다.",
      "두 값을 더하고 mm 단위를 쓴다.",
    ],
    recognitionPoints: [
      "주척은 버니어 0선의 왼쪽 값을 읽는다.",
      "일치눈금 번호 자체가 아니라 최소눈금을 곱한다.",
      "영점오차가 제시되면 마지막에 보정한다.",
    ],
    reasoningSummary: [
      "주척과 버니어 값을 분리해 적은 뒤 합산하면 자리수 실수를 줄인다.",
      "이미지 해상도가 낮으면 눈금 순서를 추정하지 않고 검수된 도식을 사용한다.",
    ],
    commonWrongAnswers: [
      "일치눈금 7을 0.7 mm로 더하기",
      "버니어 0선 오른쪽 주척값을 읽기",
      "최종값의 mm 단위를 빼기",
    ],
    variationAxes: [
      "최소눈금 0.05·0.02 mm",
      "영점오차 보정",
      "내측·깊이 측정",
      "눈금 이미지 변경",
    ],
    pastQuestionIds: ["P-2025-2-Q05"],
    predictedQuestionIds: ["EXP-M01"],
    predictedExamples: [
      "최소눈금 0.02 mm인 버니어의 눈금을 판독하시오.",
      "영점오차 +0.03 mm가 있을 때 보정 측정값을 구하시오.",
    ],
    visualAidIds: ["ncs-vernier-reading"],
    recognitionVisualAidIds: ["ncs-vernier-reading"],
    supplementalConceptIds: ["PCON-SUP-001"],
  }),
  card({
    id: "PWEC-GEAR-SURFACE-DAMAGE",
    title: "기어 피팅(피칭)·스폴링·스코어링(스코링)",
    conceptIds: ["PCON-018"],
    evidenceIds: [
      "evidence:P-2025-2-Q10",
      "evidence:EXP-G03",
      "evidence:EXP-D03",
    ],
    format: "diagnosis",
    questionPattern:
      "치면 모양을 보고 손상명을 쓰고, 대표 원인과 대책을 연결한다.",
    directAnswer:
      "피팅(피칭)은 접촉피로에 의한 작은 점상공, 스폴링은 피로가 진행된 큰 조각 박리, 스코어링(스코링)은 윤활막 파괴와 미끄럼으로 생긴 긁힘·용착 손상이다.",
    studyKeywords: ["점상공", "큰 박리", "윤활막 파괴", "미끄럼", "용착"],
    answerSkeleton: [
      "피팅: 작은 점상공 — 반복 접촉피로",
      "스폴링: 큰 조각 박리 — 피로 손상 진행",
      "스코어링: 긁힘·용착 — 윤활막 파괴와 미끄럼",
    ],
    recognitionPoints: [
      "작고 다수인 구멍은 피팅으로 본다.",
      "넓고 깊게 떨어진 조각은 스폴링으로 본다.",
      "미끄럼 방향의 줄과 용착 흔적은 스코어링으로 본다.",
    ],
    reasoningSummary: [
      "손상 크기와 진행방향을 먼저 보고 윤활·하중·정렬 조건을 연결한다.",
      "모든 손상을 단순 마모라고 쓰지 않고 표면형상과 발생기구를 함께 쓴다.",
    ],
    commonWrongAnswers: [
      "피팅과 스폴링을 크기 구분 없이 바꾸기",
      "스코어링을 단순 긁힘으로만 쓰기",
      "대책을 기어 교환 하나로 끝내기",
    ],
    variationAxes: [
      "사진 순서 변경",
      "손상명만 쓰기",
      "원인·대책 비교",
      "윤활·백래시 조건 결합",
    ],
    pastQuestionIds: ["P-2025-2-Q10"],
    predictedQuestionIds: ["EXP-G03", "EXP-D03"],
    predictedExamples: [
      "세 손상의 표면모양·주원인·대책을 표로 비교하시오.",
      "윤활막 파괴와 과도한 미끄럼으로 생기는 손상명과 대책을 쓰시오.",
    ],
    visualAidIds: ["diagram-gear-damage"],
    recognitionVisualAidIds: ["diagram-gear-damage"],
    supplementalConceptIds: ["PCON-SUP-035"],
  }),
  card({
    id: "PWEC-TPM-AUTONOMOUS-MAINTENANCE",
    title: "TPM 자주보전 7스텝",
    conceptIds: ["PCON-020"],
    evidenceIds: ["evidence:P-2025-3-Q03"],
    format: "sequence",
    questionPattern:
      "자주보전의 뜻과 초기청소부터 자주관리 정착까지 7단계를 순서대로 쓴다.",
    directAnswer:
      "초기청소 → 발생원·곤란개소 대책 → 청소·급유 기준 작성 → 총점검 → 자주점검 → 표준화 → 자주관리 철저(자율관리) 순이다.",
    studyKeywords: ["초기청소", "발생원 대책", "청소·급유 기준", "총점검", "표준화"],
    answerSkeleton: [
      "1~2단계: 초기청소, 발생원·곤란개소 대책",
      "3~5단계: 청소·급유 기준, 총점검, 자주점검",
      "6~7단계: 표준화, 자주관리 철저",
    ],
    recognitionPoints: [
      "초기청소는 단순 미화가 아니라 결함을 발견하는 점검활동이다.",
      "발생원을 제거한 뒤 임시기준과 점검역량을 만든다.",
      "표준화 후 자주관리 정착으로 마무리한다.",
    ],
    reasoningSummary: [
      "청소에서 시작해 원인 제거·기준 작성·기능 교육·표준화로 발전하는 흐름이다.",
      "단계명 일부가 교재마다 다르면 문제에서 제시한 용어 체계를 우선한다.",
    ],
    commonWrongAnswers: [
      "초기청소를 마지막 단계에 두기",
      "총점검과 자주점검 순서를 바꾸기",
      "계획보전 단계를 자주보전에 섞기",
    ],
    variationAxes: [
      "7단계 배열",
      "단계별 목적 연결",
      "초기청소의 의미",
      "계획보전과 구분",
    ],
    pastQuestionIds: ["P-2025-3-Q03"],
    predictedQuestionIds: [],
    predictedExamples: [
      "자주보전 7스텝을 순서대로 쓰고 1단계의 목적을 설명하시오.",
      "총점검과 자주점검의 차이를 쓰시오.",
    ],
    visualAidIds: ["diagram-autonomous-maintenance-7-steps"],
    supplementalConceptIds: ["PCON-029"],
  }),
  card({
    id: "PWEC-OEE-CALCULATION",
    title: "설비종합효율 OEE 계산",
    conceptIds: ["PCON-030"],
    evidenceIds: [
      "evidence:P-2026-1-Q05",
      "evidence:EXP-C03",
    ],
    format: "calculation",
    questionPattern:
      "시간가동률·성능가동률·양품률을 각각 구한 뒤 곱해 OEE를 계산한다.",
    directAnswer:
      "OEE=시간가동률×성능가동률×양품률이다. 각 비율을 소수로 곱한 뒤 마지막에 백분율로 바꾼다.",
    studyKeywords: ["시간가동률", "성능가동률", "양품률", "세 비율의 곱", "%"],
    answerSkeleton: [
      "시간가동률=(부하시간-정지시간)/부하시간",
      "성능가동률=(이상 CT×총생산량)/가동시간",
      "양품률=양품수/총생산량, OEE=세 비율의 곱",
    ],
    recognitionPoints: [
      "가동시간은 부하시간에서 정지시간을 뺀 값이다.",
      "성능가동률의 분모와 분자 시간단위를 맞춘다.",
      "백분율끼리 곱할 때는 소수로 변환하거나 100²로 나눈다.",
    ],
    reasoningSummary: [
      "세 비율을 한 식에 바로 넣기보다 각각 계산·검산한다.",
      "양품수와 총생산량, 이상 CT와 실제 가동시간을 섞지 않는다.",
    ],
    commonWrongAnswers: [
      "정지시간을 빼지 않고 시간가동률 계산하기",
      "세 백분율을 그대로 곱하고 %를 붙이기",
      "양품률 분모에 양품수를 넣기",
    ],
    variationAxes: [
      "정지시간 변경",
      "이상 CT 단위 변경",
      "불량수로 양품수 역산",
      "목표 OEE 역산",
    ],
    pastQuestionIds: ["P-2026-1-Q05"],
    predictedQuestionIds: ["EXP-C03"],
    predictedExamples: [
      "정지시간과 불량수가 주어졌을 때 OEE를 구하시오.",
      "목표 OEE와 두 비율이 주어졌을 때 필요한 양품률을 구하시오.",
    ],
    visualAidIds: ["diagram-oee-six-losses"],
    supplementalConceptIds: ["PCON-029"],
  }),
  card({
    id: "PWEC-GEAR-COUPLING-SEQUENCE",
    title: "기어 커플링 측정·조립 4단계",
    conceptIds: ["PCON-033"],
    evidenceIds: ["evidence:EXP-VIS-GEAR-COUPLING-01"],
    format: "sequence",
    questionPattern:
      "섞여 있는 네 작업 장면을 측정·위치 맞춤·조립·그리스 주입 순서로 배열한다.",
    directAnswer:
      "같은 조건으로 간격 측정 → 허브 위치 일치 → 슬리브·플랜지 조립 → 그리스 주입 순이다.",
    studyKeywords: ["간격 측정", "위치 일치", "슬리브 조립", "볼트 체결", "그리스 주입"],
    answerSkeleton: [
      "양쪽 허브의 간격을 같은 조건으로 측정한다.",
      "측정값과 축 중심에 맞춰 허브 위치를 일치시킨다.",
      "슬리브와 플랜지를 조립·체결한다.",
      "지정 그리스를 주입하고 플러그를 체결한다.",
    ],
    recognitionPoints: [
      "간격 측정 장면에는 허브 사이에 측정공구와 GAP 표시가 보인다.",
      "조립 장면은 슬리브가 닫히고 플랜지 볼트가 체결된 상태다.",
      "그리스 주입은 기계적 조립이 끝난 뒤 마지막에 실시한다.",
    ],
    reasoningSummary: [
      "측정과 정렬로 조립 위치를 먼저 확정한 뒤 체결과 윤활을 완료한다.",
      "문제 사진의 번호가 바뀌어도 장면의 작업 목적을 보면 순서를 복원할 수 있다.",
    ],
    commonWrongAnswers: [
      "간격 측정 전에 슬리브를 완전히 체결하기",
      "그리스 주입을 위치 맞춤보다 먼저 실시하기",
      "조립 후 플러그 재체결을 빼기",
    ],
    variationAxes: [
      "사진 순서 변경",
      "단계명 연결",
      "그리스 주입 시점",
      "측정·정렬 이유",
    ],
    pastQuestionIds: [],
    predictedQuestionIds: ["EXP-VIS-GEAR-COUPLING-01"],
    predictedExamples: [
      "사진 4장을 조립 순서대로 배열하고 각 단계의 목적을 쓰시오.",
    ],
    visualAidIds: ["ncs-gear-coupling-sequence"],
    sequenceSteps: [
      {
        id: "PWEC-GEAR-COUPLING-SEQUENCE-STEP-1",
        label: "양쪽 허브의 간격을 같은 조건에서 측정한다.",
        visualFrameIds: [
          "ncs-gear-coupling-sequence--gear-coupling-measure",
        ],
        checkpoint: "양쪽 측정 기준과 허브 간격이 동일한지 확인",
        wrongAction: "측정값 없이 슬리브를 먼저 체결",
        answerPhrase: "동일 조건 간격 측정",
      },
      {
        id: "PWEC-GEAR-COUPLING-SEQUENCE-STEP-2",
        label: "측정값과 축 중심에 맞춰 허브 위치를 일치시킨다.",
        visualFrameIds: [
          "ncs-gear-coupling-sequence--gear-coupling-align",
        ],
        checkpoint: "편심·편각과 축간거리가 허용범위인지 확인",
        wrongAction: "억지로 볼트를 조여 오정렬을 보정",
        answerPhrase: "허브 위치 일치",
      },
      {
        id: "PWEC-GEAR-COUPLING-SEQUENCE-STEP-3",
        label: "슬리브와 플랜지를 맞추고 볼트를 체결한다.",
        visualFrameIds: [
          "ncs-gear-coupling-sequence--gear-coupling-assemble",
        ],
        checkpoint: "치형 물림과 볼트 구멍 정렬 확인",
        wrongAction: "치형이 어긋난 상태에서 볼트를 강제 체결",
        answerPhrase: "슬리브·플랜지 조립",
      },
      {
        id: "PWEC-GEAR-COUPLING-SEQUENCE-STEP-4",
        label: "지정 그리스를 주입하고 플러그를 재체결한다.",
        visualFrameIds: [
          "ncs-gear-coupling-sequence--gear-coupling-grease",
        ],
        checkpoint: "반대쪽 구멍으로 그리스가 나오는지와 플러그 체결 확인",
        wrongAction: "윤활 없이 시운전하거나 플러그를 열린 채 둠",
        answerPhrase: "그리스 주입·플러그 체결",
      },
    ],
    supplementalConceptIds: ["PCON-022"],
  }),
  card({
    id: "PWEC-TAPERED-BEARING-ASSEMBLY",
    title: "테이퍼 롤러베어링 조립·간극조정 5단계",
    conceptIds: ["PCON-036"],
    evidenceIds: ["evidence:EXP-VIS-TAPERED-BEARING-01"],
    format: "sequence",
    questionPattern:
      "섞여 있는 사진을 콘 삽입부터 다이얼 게이지 측정·간극조정·잠금 순서로 배열한다.",
    directAnswer:
      "안쪽 콘 삽입 → 허브·커버 조립 → 다이얼 게이지 설치·영점 → 간극 측정·조정 → 로크 와셔 고정·커버 복구 순이다.",
    studyKeywords: ["콘 삽입", "허브 조립", "다이얼 게이지", "축방향 간극", "로크 와셔"],
    answerSkeleton: [
      "안쪽 콘을 삽입하고 허브 커버와 축을 조립한다.",
      "다이얼 게이지를 설치하고 영점을 맞춘다.",
      "허브를 앞뒤로 흔들어 축방향 간극을 읽는다.",
      "제작사 규정값에 맞게 조정 너트를 조이거나 푼다.",
      "로크 와셔로 고정하고 그리스·커버를 복구한 뒤 재확인한다.",
    ],
    recognitionPoints: [
      "콘 삽입은 측정 전에 완료되는 조립 단계다.",
      "다이얼 게이지 설치 뒤 허브를 흔들어 최대 이동량을 읽는다.",
      "규정 간극에 맞춘 뒤에만 로크 와셔와 커버로 최종 고정한다.",
    ],
    reasoningSummary: [
      "측정 가능한 상태로 먼저 조립하고, 영점·측정·조정·고정 순서로 마무리한다.",
      "특정 간극값은 장비마다 다르므로 문제 조건이나 제작사 기준을 우선한다.",
    ],
    commonWrongAnswers: [
      "게이지를 설치하기 전에 조정 너트를 최종 고정하기",
      "허브를 흔들지 않고 한 지점 눈금만 읽기",
      "간극 조정 뒤 로크 와셔 고정과 재측정을 빼기",
    ],
    variationAxes: [
      "사진 순서 변경",
      "영점 설정 단계",
      "간극 과소·과대 결과",
      "잠금·재확인 절차",
    ],
    pastQuestionIds: [],
    predictedQuestionIds: ["EXP-VIS-TAPERED-BEARING-01"],
    predictedExamples: [
      "사진 5장을 순서대로 배열하고 간극이 너무 좁을 때의 결과를 쓰시오.",
    ],
    visualAidIds: ["ncs-tapered-bearing-assembly-sequence"],
    sequenceSteps: [
      {
        id: "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-1",
        label: "규정 그리스를 도포한 안쪽 콘을 허브에 삽입한다.",
        visualFrameIds: [
          "ncs-tapered-bearing-assembly-sequence--tapered-bearing-inner-cone",
        ],
        checkpoint: "콘 방향, 청결, 그리스 도포 상태 확인",
        wrongAction: "오염된 콘을 반대 방향으로 강제 삽입",
        answerPhrase: "안쪽 콘 삽입",
      },
      {
        id: "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-2",
        label: "허브 커버를 체결하고 허브를 축에 삽입한다.",
        visualFrameIds: [
          "ncs-tapered-bearing-assembly-sequence--tapered-bearing-hub-cover",
        ],
        checkpoint: "커버 볼트 대각선 토크와 허브 삽입 상태 확인",
        wrongAction: "커버 볼트를 한쪽부터 완전히 조임",
        answerPhrase: "허브·커버 조립",
      },
      {
        id: "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-3",
        label: "다이얼 게이지를 설치하고 영점을 맞춘다.",
        visualFrameIds: [
          "ncs-tapered-bearing-assembly-sequence--tapered-bearing-dial-gauge",
        ],
        checkpoint: "게이지 고정, 측정자 접촉, 영점 복귀 확인",
        wrongAction: "게이지가 흔들리는 상태에서 영점을 맞춤",
        answerPhrase: "다이얼 게이지 설치·영점",
      },
      {
        id: "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-4",
        label: "허브를 앞뒤로 흔들어 간극을 측정하고 규정값으로 조정한다.",
        visualFrameIds: [
          "ncs-tapered-bearing-assembly-sequence--tapered-bearing-clearance-adjust",
        ],
        checkpoint: "최대 이동량과 제작사 규정 간극 비교",
        wrongAction: "규정값 확인 없이 조정 너트를 과도하게 조임",
        answerPhrase: "축방향 간극 측정·조정",
      },
      {
        id: "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-5",
        label: "로크 와셔로 너트를 고정하고 그리스·커버를 복구한다.",
        visualFrameIds: [
          "ncs-tapered-bearing-assembly-sequence--tapered-bearing-lock-cover",
        ],
        checkpoint: "잠금 상태, 커버 대각선 체결, 간극 재확인",
        wrongAction: "너트 잠금 없이 커버만 조립",
        answerPhrase: "로크 와셔 고정·커버 복구",
      },
    ],
    supplementalConceptIds: ["PCON-004"],
  }),
  card({
    id: "PWEC-BEARING-DAMAGE-IDENTIFICATION",
    title: "베어링 손상 사진 8종 판별",
    conceptIds: ["PCON-SUP-035"],
    evidenceIds: ["evidence:EXP-VIS-BEARING-DAMAGE-01"],
    format: "image",
    questionPattern:
      "사진의 표면 형상과 손상 위치를 보고 각 베어링 손상명을 쓰시오.",
    directAnswer:
      "(가) 파손, (나) 폴스 브리넬링·프레팅, (다) 녹·부식, (라) 플레이킹, (마) 전식, (바) 눌린 자국, (사) 용착, (아) 긁힘",
    studyKeywords: [
      "박리·긁힘",
      "파손·압흔",
      "폴스 브리넬링",
      "용착·전식",
      "녹·부식",
    ],
    answerSkeleton: [
      "(가) 파손",
      "(나) 폴스 브리넬링·프레팅",
      "(다) 녹·부식",
      "(라) 플레이킹",
      "(마) 전식",
      "(바) 눌린 자국",
      "(사) 용착",
      "(아) 긁힘",
    ],
    recognitionPoints: [
      "표면 박리·길게 난 홈·국부 압흔처럼 결정적인 손상 형상을 먼저 본다.",
      "전동체 간격을 따라 반복되는 자국은 폴스 브리넬링·프레팅을 의심한다.",
      "전류 흔적, 접촉면 용착, 갈색 산화 변색을 서로 구분한다.",
    ],
    reasoningSummary: [
      "손상 위치를 확인한 뒤 박리, 선형 홈, 압흔, 변색의 순서로 외형을 좁혀 간다.",
      "명칭을 쓴 뒤 원인이나 대책을 묻는 변형에서는 윤활·설치·전류·수분 조건을 연결한다.",
    ],
    commonWrongAnswers: [
      "플레이킹과 눌린 자국을 모두 표면 파손으로만 적는 답",
      "폴스 브리넬링을 전식으로 적는 답",
      "용착과 녹·부식을 변색만 보고 구분하지 않는 답",
    ],
    variationAxes: [
      "사진 배열 순서 변경",
      "손상명 대신 원인 쓰기",
      "손상명과 방지대책 연결",
      "비슷한 손상 사진 2개 비교",
    ],
    pastQuestionIds: [],
    predictedQuestionIds: ["EXP-VIS-BEARING-DAMAGE-01"],
    predictedExamples: [
      "사진의 베어링 손상명을 쓰고 각 손상의 대표 원인을 한 가지씩 쓰시오.",
    ],
    visualAidIds: ["ncs-bearing-damage-identification"],
    recognitionVisualAidIds: ["ncs-bearing-damage-identification"],
    supplementalConceptIds: ["PCON-004"],
  }),
  card({
    id: "PWEC-RT-FILM-DEFECT-IDENTIFICATION",
    title: "RT 필름 용접결함 6종 판독",
    conceptIds: ["PCON-044", "PCON-045"],
    evidenceIds: ["evidence:EXP-VIS-RT-FILM-01"],
    format: "image",
    questionPattern:
      "방사선투과 필름의 지시 모양과 위치를 보고 용접결함명을 쓰시오.",
    directAnswer:
      "(가) 균열, (나) 융합 불량, (다) 기공, (라) 언더컷, (마) 슬래그 섞임, (바) 용입 부족",
    studyKeywords: [
      "선형 지시",
      "원형 지시",
      "중심선 결함",
      "경계부 결함",
      "지시 위치",
    ],
    answerSkeleton: [
      "(가) 균열",
      "(나) 융합 불량",
      "(다) 기공",
      "(라) 언더컷",
      "(마) 슬래그 섞임",
      "(바) 용입 부족",
    ],
    recognitionPoints: [
      "둥근 점, 불규칙 선, 중심선, 비드 경계 중 어디에 지시가 있는지 본다.",
      "균열은 가늘고 방향성이 있는 불규칙 선형 지시로 판별한다.",
      "용입 부족은 중심선, 융합 불량은 모재·패스 경계의 선형 지시를 본다.",
    ],
    reasoningSummary: [
      "먼저 지시가 점인지 선인지 구분하고, 다음으로 중심선·경계부·분산 위치를 확인한다.",
      "결함명을 쓴 뒤 원인·보수방법을 묻는 변형에서는 용접조건과 제거·재검사 절차를 연결한다.",
    ],
    commonWrongAnswers: [
      "용입 부족과 융합 불량을 모두 용입 불량으로 적는 답",
      "둥근 기공과 불규칙한 슬래그 지시를 구분하지 않는 답",
      "비드 경계의 언더컷을 중심선 결함으로 판독하는 답",
    ],
    variationAxes: [
      "필름 배열 순서 변경",
      "결함명과 발생 원인 연결",
      "표면·내부 결함 구분",
      "적절한 비파괴검사법 선택",
    ],
    pastQuestionIds: [],
    predictedQuestionIds: ["EXP-VIS-RT-FILM-01"],
    predictedExamples: [
      "RT 필름에서 선형 지시와 원형 지시를 구분하고 해당 결함명을 쓰시오.",
    ],
    visualAidIds: ["ncs-rt-film-defect-identification"],
    recognitionVisualAidIds: ["ncs-rt-film-defect-identification"],
    supplementalConceptIds: [],
  }),
  card({
    id: "PWEC-BRAKE-PAD-LINING-INSPECTION",
    title: "브레이크 패드·라이닝 점검 사진 4종",
    conceptIds: ["PCON-SUP-030"],
    evidenceIds: ["evidence:EXP-VIS-BRAKE-PAD-LINING-01"],
    format: "image",
    questionPattern:
      "사진의 점검 위치와 측정 도구를 보고 브레이크액, 패드 표면, 패드 두께, 라이닝 슈 치수 점검을 구분한다.",
    directAnswer:
      "(가) 패드 잔여 두께 측정, (나) 라이닝 슈 두께·폭 측정, (다) 브레이크액 수위·오염 확인, (라) 패드 표면·웨어 인디케이터 확인이다.",
    studyKeywords: [
      "브레이크액",
      "웨어 인디케이터",
      "패드 잔여 두께",
      "라이닝 슈",
      "제조사 기준",
    ],
    answerSkeleton: [
      "(가) 패드 잔여 두께 측정",
      "(나) 라이닝 슈 두께·폭 측정",
      "(다) 브레이크액 수위·오염 확인",
      "(라) 패드 표면·웨어 인디케이터 확인",
    ],
    recognitionPoints: [
      "캘리퍼나 두께 측정 위치가 보이면 패드 잔여 두께 점검으로 판단한다.",
      "곡면 라이닝 슈의 두께와 폭을 재는 장면은 드럼 브레이크 점검이다.",
      "리저버 수위·오일 색과 패드 마찰면의 균열·편마모를 구분한다.",
    ],
    reasoningSummary: [
      "사진에서 먼저 부품 형상과 측정 도구를 찾고 점검 대상을 좁힌다.",
      "이 네 사진은 고정 작업순서가 아니라 서로 다른 상태·치수 점검 항목이다.",
    ],
    commonWrongAnswers: [
      "브레이크액 확인을 패드 마모 측정이라고 쓰는 답",
      "패드 두께와 라이닝 슈 폭을 구분하지 않는 답",
      "사진을 근거 없이 고정 작업순서로 배열하는 답",
    ],
    variationAxes: [
      "사진 배열 순서 변경",
      "점검 항목과 판정 기준 연결",
      "디스크·드럼 브레이크 구분",
      "이상 상태와 후속 조치 연결",
    ],
    pastQuestionIds: [],
    predictedQuestionIds: ["EXP-VIS-BRAKE-PAD-LINING-01"],
    predictedExamples: [
      "사진별 점검 항목을 쓰고 교체 판단 시 확인할 기준을 한 가지씩 쓰시오.",
    ],
    visualAidIds: ["ncs-brake-pad-lining-inspection"],
    recognitionVisualAidIds: ["ncs-brake-pad-lining-inspection"],
    supplementalConceptIds: [],
  }),
  ...PRACTICAL_TASK_SEQUENCE_SEEDS.map((sequence) =>
    card({
      id: sequence.examCardId,
      title: sequence.title,
      conceptIds: sequence.conceptIds,
      evidenceIds: [`evidence:${sequence.questionId}`],
      format: "sequence",
      questionPattern: sequence.questionPattern,
      directAnswer: sequence.directAnswer,
      studyKeywords: sequence.studyKeywords,
      answerSkeleton: sequence.frames.map((frame) => frame.caption),
      recognitionPoints: sequence.frames.slice(0, 3).map(
        (frame) => `${frame.answerPhrase}: ${frame.checkpoint}`,
      ),
      reasoningSummary: [
        "앞 단계가 다음 단계의 작업조건을 만든다는 흐름으로 순서를 복원한다.",
        "사진의 공구·고정상태·측정장치를 보고 준비, 작업, 검사 단계를 구분한다.",
      ],
      commonWrongAnswers: sequence.frames
        .slice(0, 3)
        .map((frame) => frame.wrongAction),
      variationAxes: [
        "사진 제시 순서 변경",
        "일부 단계명 가림",
        "중간 점검 단계 선택",
        "잘못된 작업 장면 판별",
      ],
      pastQuestionIds: sequence.pastOccurrence ? [sequence.questionId] : [],
      predictedQuestionIds: sequence.pastOccurrence ? [] : [sequence.questionId],
      predictedExamples: [
        `${sequence.title} 사진을 올바른 작업 순서로 배열하고 마지막 확인사항을 쓰시오.`,
      ],
      visualAidIds: [sequence.id],
      sequenceSteps: sequence.frames.map((frame, index) => ({
        id: `${sequence.examCardId}-STEP-${index + 1}`,
        label: frame.caption,
        safetyCritical: /안전|차단|잠금|고정|보호/.test(frame.caption),
        visualFrameIds: [`${sequence.id}--${frame.id}`],
        checkpoint: frame.checkpoint,
        wrongAction: frame.wrongAction,
        answerPhrase: frame.answerPhrase,
      })),
      supplementalConceptIds: [],
    }),
  ),
];
