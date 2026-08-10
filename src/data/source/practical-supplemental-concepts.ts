import type { PracticalConcept } from "@/lib/domain/practical-types";
import { PRACTICAL_NCS_COVERAGE_CONCEPTS } from "./practical-ncs-coverage-concepts";
import { PRACTICAL_NCS_UNIT_REINFORCEMENT_CONCEPTS } from "./practical-ncs-unit-reinforcements";
import { NCS_SOURCE_REGISTRY } from "./practical-source-registry";

/**
 * 문제 원문 행에는 없지만 NCS 학습모듈에서 식·단위·적용조건을 직접 확인한
 * 실기 보강 이론이다. 기출·복원·예상 문제 수와 출제 빈도에는 포함하지 않는다.
 */
const PRACTICAL_FOUNDATION_SUPPLEMENTAL_CONCEPTS: PracticalConcept[] = [
  {
    id: "PCON-SUP-001",
    title: "공압실린더 출력",
    contentRole: "supplemental",
    labels: [],
    subjectLabel: "subject-1",
    groupLabel: "s1-g06",
    learningGoals: [
      "공압실린더 전진·후진의 유효면적을 구분한다.",
      "압력, 단면적, 손실조건을 같은 단위계에서 적용해 출력을 계산한다.",
    ],
    definition:
      "공압실린더 출력은 공급 압력이 피스톤의 유효 단면적에 작용해 생기는 직선 추력이다. 전진은 피스톤 전체 면적을, 후진은 로드 단면적을 제외한 환상면적을 사용한다.",
    principle:
      "NCS 원문은 실린더 출력이 공기압 P와 피스톤 단면적 A의 곱이라고 설명한다. 로드가 있는 쪽은 유효면적이 작으므로 같은 압력에서는 후진 이론출력이 전진보다 작다.",
    components: [
      "튜브 내경 D: 전진 면적을 정하는 기준 치수",
      "로드 외경 d: 후진 면적에서 빼는 치수",
      "사용 압력 P: 게이지압인지 절대압인지 문제 조건을 먼저 확인",
      "유효면적 A: 전진은 원면적, 후진은 환상면적",
      "추력계수 μ: 패킹 마찰 등 실제 조건을 반영할 때만 적용",
    ],
    procedure: [
      "문제가 전진·후진 중 어느 운동을 묻는지 확인한다.",
      "D와 d, P의 단위를 하나의 단위계로 통일한다.",
      "전진은 πD²/4, 후진은 π(D²−d²)/4로 유효면적을 계산한다.",
      "이론출력 F=P×A를 구한 뒤, 손실 또는 효율이 주어진 경우에만 반영한다.",
      "답의 힘 단위와 반올림 조건을 마지막에 확인한다.",
    ],
    formula: [
      "전진 이론출력 F₊ = (πD²/4) × P",
      "후진 이론출력 F₋ = {π(D²−d²)/4} × P",
      "실제 출력 Factual = Fideal × μ",
      "D·d를 cm, P를 kgf/cm²로 쓰면 F는 kgf로 계산된다.",
      "SI 단위에서는 P[MPa]=N/mm², A[mm²]이므로 F[N]=P×A이다.",
    ],
    diagnosis: [
      "전·후진 속도나 힘이 예상보다 작으면 공급압력, 누설, 배기저항, 패킹 마찰을 함께 점검한다.",
      "계산값과 실제값을 비교할 때는 문제에서 제시한 손실조건과 현장 부하를 혼동하지 않는다.",
    ],
    safety: [
      "정비 전에는 공급공기를 차단하고 잔압을 배기한 뒤 움직이는 부하를 지지한다.",
      "실린더의 돌출부·링크 주변은 협착 위험이 있으므로 가압 상태에서 손을 넣지 않는다.",
    ],
    examFormats: [
      "전진·후진 출력 계산",
      "로드 유무에 따른 유효면적 비교",
      "압력·지름 변경 시 출력 증감 판단",
    ],
    requiredKeywords: ["전진면적", "후진 환상면적", "압력×면적", "단위 통일"],
    traps: [
      "후진 계산에서도 전진 면적을 그대로 쓰지 않는다.",
      "지름비를 그대로 힘비로 쓰지 않고 면적비(지름비의 제곱)를 사용한다.",
      "NCS의 kgf·cm 단위식과 SI의 MPa·mm² 단위식을 한 식에서 섞지 않는다.",
      "손실률이 없는데 임의의 효율을 가정하지 않는다.",
    ],
    relatedPastQuestionIds: [],
    relatedPredictedQuestionIds: [],
    existingLessonId: null,
    theoryTreatment: "실기 보강 레슨 (+보강용)",
    visualAidIds: [],
    ncsSources: [
      {
        ncsCode: "1503010201",
        documentTitle: NCS_SOURCE_REGISTRY["1503010201"].title,
        version: NCS_SOURCE_REGISTRY["1503010201"].version,
        pdfPage: 23,
        printedPage: 11,
        figureNumber: null,
        performanceCriteria: "공압실린더 출력의 결정요소와 압력·단면적 관계",
        sourceFileHash: NCS_SOURCE_REGISTRY["1503010201"].hash,
        sourceUrl: NCS_SOURCE_REGISTRY["1503010201"].sourceUrl,
      },
      {
        ncsCode: "1503010201",
        documentTitle: NCS_SOURCE_REGISTRY["1503010201"].title,
        version: NCS_SOURCE_REGISTRY["1503010201"].version,
        pdfPage: 24,
        printedPage: 12,
        figureNumber: "그림 1-4",
        performanceCriteria: "공압실린더 전진·후진 출력과 실린더 직경 선정",
        sourceFileHash: NCS_SOURCE_REGISTRY["1503010201"].hash,
        sourceUrl: NCS_SOURCE_REGISTRY["1503010201"].sourceUrl,
      },
      {
        ncsCode: "1503010201",
        documentTitle: NCS_SOURCE_REGISTRY["1503010201"].title,
        version: NCS_SOURCE_REGISTRY["1503010201"].version,
        pdfPage: 25,
        printedPage: 13,
        figureNumber: null,
        performanceCriteria: "공압실린더 출력 계산 예제",
        sourceFileHash: NCS_SOURCE_REGISTRY["1503010201"].hash,
        sourceUrl: NCS_SOURCE_REGISTRY["1503010201"].sourceUrl,
      },
    ],
    ncsLearningPoints: [
      "NCS는 실린더의 이론출력을 압력과 유효 단면적으로 설명하고, 로드가 있는 후진 방향에서는 면적이 달라짐을 다룬다.",
      "NCS 예제는 내경 32 mm, 로드 12 mm, 압력 5 kgf/cm² 조건에서 전진 출력을 계산하는 방식으로 단위와 면적 적용을 확인한다.",
    ],
    sourceReviewNote:
      "NCS PDF p.24의 전진·후진 식은 그림 안에 있어 추출 텍스트에서 기호 일부가 누락된다. p.23의 ‘출력=압력×단면적’ 설명과 p.25의 수치 예제를 함께 대조해 텍스트 식으로 정리했으며, 실제 출력 보정에는 NCS 표기인 추력계수 μ를 사용했다. 이 항목은 NCS 원문 기반 보강 이론이며 실기 기출·예상 통계에는 포함하지 않는다.",
    contentStatus: "published",
  },
  {
    id: "PCON-SUP-002",
    title: "탄소당량(Ceq)",
    contentRole: "supplemental",
    labels: [],
    subjectLabel: "subject-2",
    groupLabel: "s2-g01",
    learningGoals: [
      "WES와 IIW 탄소당량식의 적용 대상을 구분한다.",
      "탄소당량을 용접성·열영향부 경화·예열 검토와 연결한다.",
    ],
    definition:
      "탄소당량(Ceq)은 강재 또는 용접금속의 합금원소 함량을 탄소에 대한 등가량으로 환산한 값이다. 탄소와 합금원소가 열영향부의 경화능과 저온균열 감수성에 미치는 영향을 한 값으로 비교할 때 사용한다.",
    principle:
      "탄소당량이 커질수록 일반적으로 경화능과 냉각 시 마르텐사이트 형성 경향이 커져 용접성 검토, 예열·후열 조건, 수소저감 대책의 중요성이 높아진다. 단, 실제 WPS 조건과 모재 두께·구속도·수소량을 함께 보아야 한다.",
    components: [
      "C, Mn, Si, Ni, Cr, Mo, V, Cu의 질량분율(%)",
      "적용식: WES 또는 IIW 등 문제·규격이 지정한 식",
      "모재 두께와 구속도: 예열 조건을 결정할 때 함께 보는 조건",
      "WPS/PQR: 실제 작업조건의 최종 기준",
    ],
    procedure: [
      "문제 또는 WPS에서 요구한 탄소당량식을 먼저 확인한다.",
      "각 원소의 질량분율(%)을 식의 해당 항에 대입한다.",
      "괄호 안 원소의 합과 분모를 정확히 계산한다.",
      "계산값을 용접성·예열 검토의 보조지표로 해석하고, 두께·구속도·수소 조건을 별도로 확인한다.",
    ],
    formula: [
      "WES Ceq = C + Mn/6 + Si/24 + Ni/40 + Cr/5 + Mo/4 + V/14",
      "IIW Ceq = C + Mn/6 + (Cr + Mo + V)/5 + (Ni + Cu)/15",
      "각 원소 기호에는 강재 조성의 질량분율(%)을 대입한다.",
    ],
    diagnosis: [
      "Ceq만으로 균열 여부를 단정하지 말고 수소량, 냉각속도, 모재 두께, 구속도와 예열 조건을 함께 평가한다.",
      "서로 다른 식으로 계산한 값을 같은 기준값에 기계적으로 비교하지 않는다.",
    ],
    safety: [
      "예열·층간온도·후열 조건은 NCS의 일반 학습표보다 해당 WPS와 현장 품질 절차를 우선한다.",
      "고장력강 또는 중요 구조물의 용접조건은 임의로 변경하지 않는다.",
    ],
    examFormats: [
      "탄소당량 계산",
      "WES·IIW 식의 구성원소 비교",
      "용접성·예열 검토의 판단근거 서술",
    ],
    requiredKeywords: ["탄소당량", "용접성", "열영향부", "예열", "저온균열"],
    traps: [
      "WES 식과 IIW 식의 분모·포함 원소를 섞지 않는다.",
      "Ceq를 단순한 탄소 함량으로 오해하지 않는다.",
      "NCS의 일반적 임계값을 WPS보다 우선하는 현장 기준으로 사용하지 않는다.",
    ],
    relatedPastQuestionIds: [],
    relatedPredictedQuestionIds: [],
    existingLessonId: null,
    theoryTreatment: "실기 보강 레슨 (+보강용)",
    visualAidIds: [],
    ncsSources: [
      {
        ncsCode: "1601050111",
        documentTitle: NCS_SOURCE_REGISTRY["1601050111"].title,
        version: NCS_SOURCE_REGISTRY["1601050111"].version,
        pdfPage: 16,
        printedPage: 4,
        figureNumber: null,
        performanceCriteria: "용접부 온도 관리와 탄소당량을 이용한 용접성·예열 검토",
        sourceFileHash: NCS_SOURCE_REGISTRY["1601050111"].hash,
        sourceUrl: NCS_SOURCE_REGISTRY["1601050111"].sourceUrl,
      },
    ],
    ncsLearningPoints: [
      "NCS는 탄소당량을 용접성 평가, 열영향부 최고경도 추정, 용접재료 선택, 예열·후열 처리 검토와 저온균열 감수성 평가에 활용한다고 설명한다.",
      "NCS 원문에는 WES 및 IIW 탄소당량식이 함께 제시되어 있으므로 문제에서 지정한 식을 따라야 한다.",
    ],
    sourceReviewNote:
      "NCS PDF p.16의 WES·IIW 식을 원문 그대로 텍스트화했다. p.17의 탄소당량 구간과 예열 온도는 학습모듈의 일반 설명이므로, 실제 작업에서는 WPS·PQR·적용 규격의 조건을 우선한다. 이 항목은 NCS 원문 기반 보강 이론이며 실기 기출·예상 통계에는 포함하지 않는다.",
    contentStatus: "published",
  },
];

/**
 * 출제복원 46개에만 갇히지 않도록, NCS 11종에서 수행내용·쪽수를 직접 대조한
 * 교재 보강 레슨을 함께 내보낸다. 이 항목은 실제 출제횟수나 기출통계에 합산하지 않는다.
 */
export const PRACTICAL_SUPPLEMENTAL_CONCEPTS: PracticalConcept[] = [
  ...PRACTICAL_FOUNDATION_SUPPLEMENTAL_CONCEPTS,
  ...PRACTICAL_NCS_COVERAGE_CONCEPTS,
  ...PRACTICAL_NCS_UNIT_REINFORCEMENT_CONCEPTS,
];
