import type {
  StudyMode,
  UnifiedLearningConcept,
} from "@/lib/domain/unified-learning";

export const UNIFIED_LEARNING_CONCEPTS: UnifiedLearningConcept[] = [
  {
    id: "bearing",
    title: "베어링",
    summary:
      "베어링은 축을 지지하고 마찰을 줄이는 기계요소입니다. 필기에서는 형식·하중·수명·손상을 구분하고, 실기에서는 사진 식별부터 끼워맞춤·가열조립·간극·손상판정까지 연결합니다.",
    writtenLessonIds: [
      "lesson-11c19ti",
      "lesson-o2m31a",
      "lesson-14yeaeq",
      "lesson-s9sijm",
    ],
    writtenQuestionIds: ["U-322", "U-077", "U-445", "U-597", "U-878"],
    practicalConceptIds: ["PCON-004", "PCON-006"],
    practicalQuestionIds: [
      "P-2025-1-Q04",
      "P-2025-1-Q06",
      "P-2025-2-Q01-1",
      "P-2025-2-Q01-2",
      "P-2025-3-Q10",
      "EXP-B01",
      "EXP-B02",
      "EXP-B03",
      "EXP-B06",
      "EXP-D01",
    ],
    practicalTaskIds: ["P-TASK-ASSEMBLY-002", "P-TASK-MAINT-003"],
    practicalEvidenceIds: [
      "evidence:P-2025-1-Q04",
      "evidence:P-2025-1-Q06",
      "evidence:P-2025-2-Q01-1",
      "evidence:P-2025-2-Q01-2",
      "evidence:P-2025-3-Q10",
    ],
    relatedConceptIds: [
      "vernier-caliper",
      "hydraulic-pressure-control-valves",
    ],
    learningNature: [
      "understand",
      "distinguish",
      "memorize",
      "practice",
      "perform",
    ],
    defaultMode: "integrated",
    writtenFocus: [
      "볼·롤러와 레이디얼·스러스트 형식을 하중 방향으로 구분",
      "볼베어링 수명지수 3과 롤러베어링 수명지수 10/3",
      "발열·박리·마모의 원인을 윤활·정렬·끼워맞춤과 연결",
    ],
    practicalFocus: [
      "내륜·외륜·전동체·케이지를 사진과 단면에서 식별",
      "억지끼워맞춤되는 링에만 조립력을 전달",
      "가열·압입·간극조정 후 회전·소음·온도·윤활 상태를 판정",
    ],
    memoryPoints: [
      "형식은 전동체 모양뿐 아니라 받을 하중 방향과 분리 가능 여부로 구분합니다.",
      "조립력은 억지끼워맞춤되는 링에 직접 전달하고 전동체를 통과시키지 않습니다.",
      "볼베어링 수명은 L∝(C/P)³이므로 하중이 절반이면 수명은 8배입니다.",
      "가열온도와 간극은 일률값이 아니라 베어링·윤활제·제조사 조건을 우선합니다.",
    ],
  },
  {
    id: "loto",
    title: "LOTO",
    summary:
      "LOTO는 정비 중 예기치 않은 기동과 저장에너지 방출을 막는 에너지 격리 절차입니다. 직접 연결된 필기 레슨은 없으며, 실기 필답과 작업 안전에서 목적·순서·검증을 집중 학습합니다.",
    writtenLessonIds: [],
    writtenQuestionIds: [],
    practicalConceptIds: ["PCON-017"],
    practicalQuestionIds: [
      "P-2025-2-Q09",
      "EXP-S01",
      "EXP-S03",
    ],
    practicalTaskIds: [
      "P-TASK-SAFE-001",
      "P-TASK-MAINT-002",
      "P-TASK-MAINT-004",
    ],
    practicalEvidenceIds: ["evidence:P-2025-2-Q09"],
    relatedConceptIds: ["bearing", "hydraulic-pressure-control-valves"],
    learningNature: ["understand", "memorize", "practice", "perform"],
    defaultMode: "practical",
    writtenFocus: [
      "직접 연결된 필기 객관식 레슨 없음",
      "안전정비의 공통 전제인 에너지원 식별과 격리 개념으로 활용",
    ],
    practicalFocus: [
      "통보·정상정지·에너지원 격리·잠금·표찰·잔류에너지 해소·검증",
      "전기뿐 아니라 유압·공압·중력·탄성·열에너지까지 확인",
      "작업 종료 후 인원·공구·방호장치 확인과 권한 있는 복구",
    ],
    memoryPoints: [
      "정지 버튼을 누른 것만으로 에너지 격리가 완료되지는 않습니다.",
      "잠금·표찰 뒤에는 잔류에너지를 해소하고 무에너지 상태를 검증해야 합니다.",
      "잠금장치는 원칙적으로 설치한 작업자가 해제합니다.",
      "세부 절차는 승인된 사업장 절차와 현행 공식 안전지침을 우선합니다.",
    ],
  },
  {
    id: "hydraulic-pressure-control-valves",
    title: "유압 압력제어밸브",
    summary:
      "압력제어밸브는 압력의 제한·감압·순서제어·하중 낙하 방지를 담당합니다. 필기에서는 밸브별 기능과 기호를 구분하고, 실기에서는 회로 배관·설정·압력판정·고장추적까지 이어집니다.",
    writtenLessonIds: [
      "lesson-osztt8",
      "lesson-8jo4gu",
      "lesson-yrypbe",
      "lesson-6jatm",
    ],
    writtenQuestionIds: ["U-202", "U-123", "U-693", "U-1269", "U-310", "U-943"],
    practicalConceptIds: ["PCON-SUP-007"],
    practicalQuestionIds: ["EXP-SUP-007"],
    practicalTaskIds: [
      "P-TASK-HYD-001",
      "P-TASK-HYD-002",
      "P-TASK-HYD-003",
      "P-TASK-HYD-004",
    ],
    practicalEvidenceIds: ["evidence:ncs-supplement:PCON-SUP-007"],
    relatedConceptIds: ["loto", "bearing"],
    learningNature: [
      "understand",
      "distinguish",
      "memorize",
      "practice",
      "perform",
    ],
    defaultMode: "integrated",
    writtenFocus: [
      "릴리프는 최고압 제한, 감압은 분기회로의 낮은 압력 유지",
      "시퀀스는 설정압력 이후 다음 작동을 시작",
      "카운터밸런스는 하중의 자유낙하·과속을 억제",
    ],
    practicalFocus: [
      "P·T·A·B·드레인·파일럿 포트를 회로도와 실제 밸브에서 대조",
      "무부하 저압 상태에서 시작해 지정 압력계로 설정",
      "압력·유량·온도·누설을 동력원에서 액추에이터 순으로 추적",
    ],
    memoryPoints: [
      "릴리프와 감압밸브는 모두 압력을 다루지만 설치 목적과 검출 위치가 다릅니다.",
      "압력 설정 전에는 하중을 기계적으로 지지하고 잔압을 제거합니다.",
      "시퀀스밸브는 설정압력 도달과 다음 회로 작동의 선후관계를 만듭니다.",
      "설정값만 바꾸기 전에 압력계·드레인·파일럿·누설 상태를 확인합니다.",
    ],
  },
  {
    id: "vernier-caliper",
    title: "버니어캘리퍼스",
    summary:
      "버니어캘리퍼스는 외측·내측·깊이·단차를 측정하는 범용 길이 측정기입니다. 필기에서는 눈금 계산과 측정기 선택을, 실기에서는 청소·영점·자세·반복측정·공차 판정을 함께 다룹니다.",
    writtenLessonIds: ["lesson-1nygfrv"],
    writtenQuestionIds: ["U-1119"],
    practicalConceptIds: ["PCON-014"],
    practicalQuestionIds: ["P-2025-2-Q05", "EXP-M01"],
    practicalTaskIds: [
      "P-TASK-MEAS-001",
      "P-TASK-MEAS-002",
      "P-TASK-MEAS-003",
    ],
    practicalEvidenceIds: ["evidence:P-2025-2-Q05"],
    relatedConceptIds: ["bearing"],
    learningNature: [
      "understand",
      "distinguish",
      "memorize",
      "practice",
      "perform",
    ],
    defaultMode: "integrated",
    writtenFocus: [
      "버니어 0 바로 앞의 주척값과 일치눈금×최소눈금을 합산",
      "0.05 mm형과 0.02 mm형의 최소눈금을 먼저 확인",
      "정밀공차에서는 버니어와 마이크로미터의 적합성을 구분",
    ],
    practicalFocus: [
      "측정면과 공작물을 청소하고 닫힌 상태에서 영점 확인",
      "외경은 최대값, 내경은 최소값이 되는 정렬 위치 탐색",
      "반복측정값을 도면 공차와 비교하고 기록",
    ],
    memoryPoints: [
      "측정값은 주척값+(일치눈금 번호×최소눈금)입니다.",
      "버니어 0이 지난 주척값을 선택하고 그림의 최소눈금을 먼저 확인합니다.",
      "회전 중인 공작물은 측정하지 않습니다.",
      "표시 반올림 전에 원시 측정값과 영점오차를 반영해 판정합니다.",
    ],
  },
  {
    id: "welding-overlap",
    title: "용접 오버랩",
    summary:
      "오버랩은 용착금속이 모재 표면 위로 흘러나왔지만 융합되지 않은 용접결함입니다. 필기에서는 결함과 발생원인을 구분하고, 실기에서는 외관판독·제거범위·보수·재검사로 연결합니다.",
    writtenLessonIds: ["lesson-j8vt90"],
    writtenQuestionIds: ["U-931"],
    practicalConceptIds: ["PCON-044"],
    practicalQuestionIds: ["EXP-W01"],
    practicalTaskIds: [
      "P-TASK-REPAIR-001",
      "P-TASK-BUTT-002",
      "P-TASK-BUTT-003",
      "P-TASK-BUTT-004",
      "P-TASK-BUTT-005",
    ],
    practicalEvidenceIds: ["evidence:EXP-W01"],
    relatedConceptIds: [],
    learningNature: [
      "understand",
      "distinguish",
      "memorize",
      "practice",
      "perform",
    ],
    defaultMode: "integrated",
    writtenFocus: [
      "오버랩·언더컷·용입불량·스패터의 형상과 원인을 구분",
      "낮은 전류·느린 속도·부적절한 운봉과 용융지 거동을 연결",
      "부정형 객관식에서 기술적으로 옳은 원인 연결을 제거",
    ],
    practicalFocus: [
      "토우부 형상과 모재 융합 여부를 외관·단면에서 판독",
      "적용기준에 따라 허용·연삭·제거 후 재용접 경로 결정",
      "결함 제거면을 확인한 뒤 승인 절차로 보수하고 재검사",
    ],
    memoryPoints: [
      "오버랩은 용착금속이 모재와 융합되지 않은 채 겹쳐진 결함입니다.",
      "언더컷은 모재가 파인 홈이고 오버랩은 융합되지 않은 금속이 덮인 형상입니다.",
      "결함 표면을 덮어 용접하지 말고 원인과 범위를 확인한 뒤 제거합니다.",
      "허용값과 보수방법은 적용 규격·품질등급·WPS를 확인한 뒤 판정합니다.",
    ],
  },
];

const conceptById = new Map(
  UNIFIED_LEARNING_CONCEPTS.map((concept) => [concept.id, concept]),
);

export function getUnifiedLearningConcept(conceptId: string) {
  return conceptById.get(conceptId);
}

export function getUnifiedConceptForWrittenLesson(lessonId: string) {
  return UNIFIED_LEARNING_CONCEPTS.find((concept) =>
    concept.writtenLessonIds.includes(lessonId),
  );
}

export function getUnifiedConceptForPracticalConcept(conceptId: string) {
  return UNIFIED_LEARNING_CONCEPTS.find((concept) =>
    concept.practicalConceptIds.includes(conceptId),
  );
}

export function getUnifiedModeHref(
  concept: UnifiedLearningConcept,
  mode: StudyMode,
) {
  if (mode === "integrated") return `/study/${concept.id}`;
  if (mode === "written") {
    return concept.writtenLessonIds[0]
      ? `/written/theory/${concept.writtenLessonIds[0]}`
      : null;
  }
  return concept.practicalConceptIds[0]
    ? `/practical/written/theory/${concept.practicalConceptIds[0]}`
    : null;
}
