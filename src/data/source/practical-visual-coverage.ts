import type { PracticalVisualCoverageItem } from "@/lib/domain/practical-types";
import { PRACTICAL_TASK_SEQUENCE_SEEDS } from "./practical-task-sequences";

export const PRACTICAL_VISUAL_COVERAGE: PracticalVisualCoverageItem[] = [
  {
    id: "visual-coverage-bearing-identification",
    conceptIds: ["PCON-004"],
    examCardIds: ["PWEC-BEARING-IDENTIFICATION"],
    questionIds: ["P-2025-1-Q04", "P-2025-2-Q01-2", "EXP-B01"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-bearing-four-types"],
    status: "ready",
    rationale: "형상 식별이 정답을 결정하므로 실물 사진이 필수다.",
  },
  {
    id: "visual-coverage-bearing-heating",
    conceptIds: ["PCON-006"],
    examCardIds: ["PWEC-BEARING-INDUCTION-HEATING"],
    questionIds: ["P-2025-1-Q06", "EXP-B03", "EXP-D01"],
    sequenceStepIds: [
      "PWEC-BEARING-INDUCTION-HEATING-STEP-2",
      "PWEC-BEARING-INDUCTION-HEATING-STEP-3",
    ],
    visualRequirement: "V2",
    visualAidIds: ["diagram-bearing-induction-heating-sequence"],
    status: "ready",
    rationale:
      "시험 원본 사진을 복제하지 않은 자체 절차 도식으로 치수 확인, 센서 설치·균일 가열, 신속 장착의 선후관계를 검수했다.",
  },
  {
    id: "visual-coverage-spherical-roller-bearing",
    conceptIds: ["PCON-004"],
    examCardIds: ["PWEC-BEARING-IDENTIFICATION"],
    questionIds: ["P-2025-2-Q01-1", "P-2025-2-Q01-2", "EXP-B02"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-spherical-roller-bearing"],
    status: "ready",
    rationale:
      "배럴형 롤러와 구면 외륜 궤도가 자동조심 롤러베어링의 결정적 식별 단서다.",
  },
  {
    id: "visual-coverage-bearing-thermal-assembly-reference",
    conceptIds: ["PCON-006"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-bearing-heating"],
    status: "ready",
    rationale:
      "오일 배스와 가열 조립 사진은 열팽창 조립 원리 설명에만 사용하고 유도가열기 순서 정답에는 사용하지 않는다.",
  },
  {
    id: "visual-coverage-tapered-bearing-disassembly",
    conceptIds: ["PCON-013", "PCON-036"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-tapered-bearing-disassembly"],
    status: "ready",
    rationale:
      "잠금부품과 지정 공구의 위치를 보여 주므로 베어링 분해와 정비 공구 개념 설명에 사용한다.",
  },
  {
    id: "visual-coverage-vernier-reading",
    conceptIds: ["PCON-014"],
    examCardIds: ["PWEC-VERNIER-READING"],
    questionIds: ["P-2025-2-Q05", "EXP-M01"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-vernier-reading"],
    status: "ready",
    rationale:
      "주척 기준값과 버니어 일치눈금을 실제 눈금 확대 사진에서 구분하게 한다.",
  },
  {
    id: "visual-coverage-accumulator-safety-circuit",
    conceptIds: ["PCON-040"],
    examCardIds: [],
    questionIds: ["P-2025-1-Q08", "EXP-H04A", "EXP-H04B"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-accumulator-safety-circuit"],
    status: "ready",
    rationale:
      "차단밸브·방출밸브·안전밸브·압력계의 배치를 통해 정비 전 격리와 잔압 방출 경로를 설명한다.",
  },
  {
    id: "visual-coverage-gear-damage",
    conceptIds: ["PCON-018"],
    examCardIds: ["PWEC-GEAR-SURFACE-DAMAGE"],
    questionIds: ["P-2025-2-Q10", "EXP-G03", "EXP-D03"],
    sequenceStepIds: [],
    visualRequirement: "V2",
    visualAidIds: ["diagram-gear-damage"],
    status: "ready",
    rationale:
      "검증된 자체 도식으로 점상공, 큰 조각 박리, 미끄럼 방향의 긁힘·용착 흔적을 구분한다.",
  },
  {
    id: "visual-coverage-gear-coupling-sequence",
    conceptIds: ["PCON-033"],
    examCardIds: ["PWEC-GEAR-COUPLING-SEQUENCE"],
    questionIds: ["EXP-VIS-GEAR-COUPLING-01"],
    sequenceStepIds: [
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-1",
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-2",
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-3",
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-4",
    ],
    visualRequirement: "V2",
    visualAidIds: ["ncs-gear-coupling-sequence"],
    status: "ready",
    rationale:
      "측정·위치 맞춤·조립·윤활의 선후관계를 원문 도해와 직접 연결한다.",
  },
  {
    id: "visual-coverage-tapered-bearing-assembly",
    conceptIds: ["PCON-036"],
    examCardIds: ["PWEC-TAPERED-BEARING-ASSEMBLY"],
    questionIds: ["EXP-VIS-TAPERED-BEARING-01"],
    sequenceStepIds: [
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-1",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-2",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-3",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-4",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-5",
    ],
    visualRequirement: "V2",
    visualAidIds: ["ncs-tapered-bearing-assembly-sequence"],
    status: "ready",
    rationale:
      "조립·영점·측정·조정·잠금 단계가 서로 다른 사진으로 구분된다.",
  },
  {
    id: "visual-coverage-photoelectric-switch-example",
    conceptIds: ["PCON-SUP-012"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-photoelectric-switch-example"],
    status: "ready",
    rationale:
      "NCS 원문 제품 사진에서 광학창·표시부·케이블을 확인한다. 세부 검출방식은 외형이 아니라 별도 광로 배치로 판단하도록 범위를 제한한다.",
  },
  {
    id: "visual-coverage-proximity-sensor-installation-spacing",
    conceptIds: ["PCON-SUP-011"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-proximity-sensor-installation-spacing"],
    status: "ready",
    rationale:
      "검출거리·설정거리와 매입형·돌출형 설치, 병렬·대향 배치의 이격조건을 그림으로 비교해 근접센서 설치 판단을 보조한다.",
  },
  {
    id: "visual-coverage-drive-unit-exploded-assembly-order",
    conceptIds: ["PCON-007", "PCON-028"],
    examCardIds: ["PWEC-DRIVE-UNIT-ASSEMBLY-PROCESS"],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-drive-unit-exploded-assembly-order"],
    status: "ready",
    rationale:
      "축·베어링·기어·키·오일실·하우징의 결합 위치와 전체 조립 관계를 한 장에서 비교할 수 있다.",
  },
  {
    id: "visual-coverage-height-gauge-up-down-measurement",
    conceptIds: ["PCON-031"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-height-gauge-up-down-measurement"],
    status: "ready",
    rationale:
      "하향 측정과 게이지 블록을 이용한 상향 측정의 접촉 방향과 기준면 차이를 직접 비교한다.",
  },
  {
    id: "visual-coverage-cylindricity-measurement-methods",
    conceptIds: ["PCON-031", "PCON-SUP-026"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-cylindricity-measurement-methods"],
    status: "ready",
    rationale:
      "V블록·다이얼 지시 방식과 외측 마이크로미터 방식을 비교해 여러 위치·방향의 반복 측정 원리를 보여 준다.",
  },
  {
    id: "visual-coverage-bearing-damage-identification",
    conceptIds: ["PCON-SUP-035"],
    examCardIds: ["PWEC-BEARING-DAMAGE-IDENTIFICATION"],
    questionIds: ["EXP-VIS-BEARING-DAMAGE-01"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-bearing-damage-identification"],
    status: "ready",
    rationale:
      "NCS 손상 사진에서 정답 문구를 제외하고 손상 형상만 분리해 사진 식별 문제와 원인·대책 학습에 연결한다.",
  },
  {
    id: "visual-coverage-rt-film-defect-identification",
    conceptIds: ["PCON-044", "PCON-045"],
    examCardIds: ["PWEC-RT-FILM-DEFECT-IDENTIFICATION"],
    questionIds: ["EXP-VIS-RT-FILM-01"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-rt-film-defect-identification"],
    status: "ready",
    rationale:
      "RT 필름만 분리하고 결함명·도식·출처 문구를 제거해 제출 전 정답이 노출되지 않는 결함 판독 문제로 사용한다.",
  },
  {
    id: "visual-coverage-brake-condition-examples",
    conceptIds: ["PCON-SUP-030"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-brake-condition-examples"],
    status: "ready",
    rationale:
      "상태명 라벨을 제거한 NCS 사진으로 디스크·드럼·라이닝·작동유의 이상 징후를 비교하되, 시험문항이나 보편적 교체 기준으로 사용하지 않는다.",
  },
  {
    id: "visual-coverage-brake-pad-lining-inspection",
    conceptIds: ["PCON-SUP-030"],
    examCardIds: ["PWEC-BRAKE-PAD-LINING-INSPECTION"],
    questionIds: ["EXP-VIS-BRAKE-PAD-LINING-01"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-brake-pad-lining-inspection"],
    status: "ready",
    rationale:
      "브레이크액·패드 표면·패드 두께·라이닝 치수 사진은 고정 순서가 아니라 점검 위치와 측정항목을 구분하는 사진 식별형으로 사용한다.",
  },
  ...PRACTICAL_TASK_SEQUENCE_SEEDS.map(
    (sequence): PracticalVisualCoverageItem => ({
      id: `visual-coverage-${sequence.id.replace(/^ncs-/, "")}`,
      conceptIds: sequence.conceptIds,
      examCardIds: [sequence.examCardId],
      questionIds: [sequence.questionId],
      sequenceStepIds: sequence.frames.map(
        (_, index) => `${sequence.examCardId}-STEP-${index + 1}`,
      ),
      visualRequirement: "V2",
      visualAidIds: [sequence.id],
      status: "ready",
      rationale:
        "NCS 원문의 작업사진과 도해를 단계별로 분리해 작업순서 학습과 순서형 문제에 함께 사용한다.",
    }),
  ),
  {
    id: "visual-coverage-autonomous-maintenance",
    conceptIds: ["PCON-020"],
    examCardIds: ["PWEC-TPM-AUTONOMOUS-MAINTENANCE"],
    questionIds: ["P-2025-3-Q03"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["diagram-autonomous-maintenance-7-steps"],
    status: "ready",
    rationale: "7단계의 선후관계를 한 번에 복원하는 자체 흐름도가 유효하다.",
  },
  {
    id: "visual-coverage-oee-losses",
    conceptIds: ["PCON-030"],
    examCardIds: ["PWEC-OEE-CALCULATION"],
    questionIds: ["P-2026-1-Q05", "EXP-C03"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["diagram-oee-six-losses"],
    status: "ready",
    rationale: "OEE 세 요소와 6대 로스의 대응관계를 시각적으로 구분한다.",
  },
  {
    id: "visual-coverage-vibration-hva",
    conceptIds: ["PCON-SUP-033"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["diagram-vibration-hva-directions"],
    status: "ready",
    rationale: "축 기준 수평·수직·축방향은 방향도가 가장 짧은 설명이다.",
  },
];

export function visualAidIdsForSubjectSummary(subjectId: string) {
  if (subjectId === "subject-2") {
    return ["ncs-rt-film-defect-identification"];
  }
  if (subjectId === "subject-3") {
    return [
      "ncs-bearing-four-types",
      "ncs-bearing-heating",
      "ncs-bearing-damage-identification",
    ];
  }
  if (subjectId === "subject-4") {
    return [
      "diagram-autonomous-maintenance-7-steps",
      "diagram-oee-six-losses",
      "diagram-vibration-hva-directions",
    ];
  }
  return [];
}
