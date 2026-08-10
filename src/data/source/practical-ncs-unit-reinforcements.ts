import type {
  PracticalConcept,
  PracticalStudyCategoryId,
  PracticalWrittenExamCardFormat,
} from "@/lib/domain/practical-types";
import {
  PRACTICAL_NCS_UNIT_CANDIDATES,
  PRACTICAL_NCS_UNIT_REGISTRY,
} from "./practical-written-source-sweep";
import { NCS_SOURCE_REGISTRY } from "./practical-source-registry";

type TextbookStudyTypeId =
  | "definition"
  | "formula"
  | "procedure"
  | "visual"
  | "drawing"
  | "diagnosis_safety";

type ReinforcementEditorial = {
  candidateId: string;
  conceptId: string;
  subjectLabel: "subject-1" | "subject-2" | "subject-3" | "subject-4";
  groupLabel: string;
  studyTypeIds: TextbookStudyTypeId[];
  primaryStudyCategoryId: PracticalStudyCategoryId;
  examFormat: PracticalWrittenExamCardFormat;
  formatLabel: string;
  definition: string;
  background: string;
  components: string[];
  procedure: string[];
  diagnosis: string[];
  safety: string[];
  traps: string[];
  stem: string;
  modelAnswer: string;
  answerDefinition: string;
  memoryTip: string;
  rubricLabels: string[];
};

export type PracticalNcsUnitQuestionEditorial = Pick<
  ReinforcementEditorial,
  | "primaryStudyCategoryId"
  | "examFormat"
  | "formatLabel"
  | "stem"
  | "modelAnswer"
  | "answerDefinition"
  | "memoryTip"
  | "rubricLabels"
>;

const EDITORIAL: ReinforcementEditorial[] = [
  {
    candidateId: "NCS-CAND-MEASURE-SELECT",
    conceptId: "PCON-NCS-MEASURE-SELECT",
    subjectLabel: "subject-3",
    groupLabel: "s3-g01",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "측정기·보조기구 선정",
    definition:
      "측정기 선정은 측정 대상의 형상, 측정범위, 허용공차와 필요한 분해능을 확인한 뒤 그 조건을 만족하는 측정기와 보조기구를 고르는 작업이다.",
    background:
      "외경·내경·높이·흔들림처럼 측정요소가 달라지면 접촉 위치와 기준면도 달라진다. 같은 치수라도 재질, 수량, 작업환경과 접촉 허용 여부에 따라 비교측정기·한계게이지·비접촉 측정기를 선택할 수 있다.",
    components: [
      "외경: 외측 마이크로미터",
      "내경: 내측 마이크로미터 또는 실린더 게이지",
      "높이: 정반과 하이트 게이지",
      "원주 흔들림: V블록 또는 센터와 다이얼 게이지",
      "기준 길이 설정: 게이지블록",
    ],
    procedure: [
      "도면에서 측정요소와 허용공차를 확인한다.",
      "예상 측정범위와 필요한 분해능을 정한다.",
      "재질·형상·수량·환경을 고려해 접촉식 또는 비접촉식을 고른다.",
      "기준면과 측정자세를 재현할 보조기구를 함께 선정한다.",
      "영점·교정상태를 확인한 뒤 반복 측정한다.",
    ],
    diagnosis: [
      "공차보다 거친 분해능의 측정기는 합격·불합격 경계를 안정적으로 판정하기 어렵다.",
      "연질 공작물은 측정력에 의한 변형, 대량검사는 반복성과 판정속도를 함께 고려한다.",
    ],
    safety: ["원통형 측정물은 V블록이나 고정구로 굴림과 낙하를 방지한다."],
    traps: [
      "측정범위에 들어간다는 이유만으로 분해능과 공차를 확인하지 않고 선정하지 않는다.",
      "원주 흔들림을 측정할 때 회전 기준과 지지방법을 생략하지 않는다.",
    ],
    stem:
      "외경·내경·높이·원주 흔들림 측정에 알맞은 측정기와 보조기구를 각각 쓰고, 측정기 선정 기준 4가지를 쓰시오.",
    modelAnswer:
      "외경은 외측 마이크로미터, 내경은 내측 마이크로미터 또는 실린더 게이지, 높이는 정반과 하이트 게이지, 원주 흔들림은 V블록 또는 센터와 다이얼 게이지로 측정한다. 선정 시 형상, 측정범위, 허용공차에 필요한 분해능, 재질과 접촉 여부, 측정 수량과 환경을 확인한다.",
    answerDefinition:
      "측정기와 보조기구는 형상·범위·공차·분해능·재질·환경을 함께 보고 선정한다.",
    memoryTip: "무엇을, 얼마까지, 얼마나 정밀하게, 어떤 자세로 잴지 먼저 정한다.",
    rubricLabels: [
      "외경·내경 측정기 연결",
      "높이·원주 흔들림 측정기와 보조구 연결",
      "측정범위·허용공차·분해능",
      "재질·접촉·수량·환경 고려",
    ],
  },
  {
    candidateId: "NCS-CAND-DRAWING-REVISION",
    conceptId: "PCON-NCS-DRAWING-REVISION",
    subjectLabel: "subject-3",
    groupLabel: "s3-g01",
    studyTypeIds: ["drawing", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "도면 개정 확인 순서",
    definition:
      "도면 개정관리는 변경된 설계내용이 승인된 최신 도면, 작업지시서와 검사기준서에 동일하게 반영되었는지를 확인하고 이력을 추적하는 활동이다.",
    background:
      "개정번호만 같다고 끝나는 것이 아니라 개정사유·개정부위·승인자·통보대상과 배포본 회수 여부를 함께 확인해야 구도면 사용을 막을 수 있다.",
    components: [
      "개정번호와 개정일",
      "개정사유와 개정부위",
      "작성·검토·승인 이력",
      "관련 부서 통보와 배포본",
      "작업지시서·검사기준서의 개정상태",
    ],
    procedure: [
      "작업에 사용할 도면의 도면번호와 개정번호를 확인한다.",
      "개정표에서 개정사유·개정부위·승인이력을 확인한다.",
      "작업지시서와 검사기준서가 같은 개정상태인지 대조한다.",
      "관련 부서에 변경내용을 통보하고 구본을 회수·식별한다.",
      "최신 승인본으로 작업을 재개한다.",
    ],
    diagnosis: [
      "문서 사이의 개정번호가 다르면 임의로 하나를 선택하지 말고 작업을 보류해 승인된 최신본을 확인한다.",
    ],
    safety: ["설계변경이 안전치수나 방호조건에 영향을 줄 수 있으므로 불일치 상태에서 작업하지 않는다."],
    traps: [
      "파일 수정일만 보고 최신 승인본이라고 판단하지 않는다.",
      "도면만 바꾸고 작업지시서와 검사기준서의 개정을 누락하지 않는다.",
    ],
    stem:
      "도면이 개정되었을 때 확인해야 할 항목과 관련 문서·부서에 반영하는 순서를 쓰시오. 작업지시서와 도면의 개정번호가 다를 때의 우선조치도 쓰시오.",
    modelAnswer:
      "도면번호·개정번호를 확인하고, 개정사유·개정부위와 작성·검토·승인 이력을 확인한다. 이어 작업지시서와 검사기준서의 개정상태를 대조하고 관련 부서에 통보하며 구본을 회수·식별한 뒤 최신 승인본으로 작업한다. 문서의 개정번호가 다르면 작업을 보류하고 승인된 최신본을 확인한다.",
    answerDefinition:
      "개정번호·사유·부위·승인·통보·관련 문서 일치를 확인한 뒤 최신본으로 작업한다.",
    memoryTip: "번호-사유-부위-승인-통보-구본회수.",
    rubricLabels: [
      "개정번호·개정사유·개정부위 확인",
      "작성·검토·승인 이력 확인",
      "작업지시서·검사기준서 일치 확인",
      "불일치 시 작업보류와 최신본 확인",
    ],
  },
  {
    candidateId: "NCS-CAND-DRAWING-MEASUREMENT-ELEMENTS",
    conceptId: "PCON-NCS-DRAWING-MEASUREMENT-ELEMENTS",
    subjectLabel: "subject-3",
    groupLabel: "s3-g01",
    studyTypeIds: ["drawing", "visual", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "drawing",
    formatLabel: "도면 측정요소 판독",
    definition:
      "도면의 측정요소 판독은 데이텀과 측정치수, 개별·일반공차, 재질·표면처리·주기사항을 찾아 실제 측정대상과 판정기준을 정하는 작업이다.",
    background:
      "개별공차가 표시된 치수에는 그 공차를 적용하고, 별도 공차가 없는 치수에는 도면이 지정한 일반공차를 적용한다. 데이텀과 부품 특성은 측정자세와 고정방법을 결정한다.",
    components: [
      "데이텀 기준면·기준축",
      "측정치수와 개별공차",
      "표제란 또는 주기의 일반공차",
      "재질·열처리·표면처리",
      "표면거칠기와 기타 부가기호",
    ],
    procedure: [
      "도면번호·개정상태와 표제란을 확인한다.",
      "데이텀과 측정할 형상·치수를 표시한다.",
      "개별공차 유무를 확인하고 없으면 일반공차를 적용한다.",
      "재질·표면처리·거칠기·주기사항을 확인한다.",
      "기준과 공차에 맞는 측정기·고정방법을 정한다.",
    ],
    diagnosis: ["데이텀이 다르면 같은 치수라도 측정값의 재현성과 기하공차 판정이 달라질 수 있다."],
    safety: ["대형·회전체 부품은 측정 전에 정지·고정하고 기준면의 이물질을 제거한다."],
    traps: [
      "개별공차가 있는 치수에 일반공차를 중복 적용하지 않는다.",
      "재질과 표면처리 요구를 치수검사와 무관한 정보로 버리지 않는다.",
    ],
    stem:
      "도면에서 측정 전에 확인해야 할 요소 6가지를 쓰고, 일반공차와 개별공차가 함께 있을 때의 적용원칙을 설명하시오.",
    modelAnswer:
      "데이텀, 측정치수, 개별공차, 일반공차, 재질·열처리·표면처리, 표면거칠기와 주기사항을 확인한다. 개별공차가 표시된 치수에는 개별공차를 우선 적용하고, 별도 공차가 없는 치수에는 도면이 지정한 일반공차를 적용한다.",
    answerDefinition:
      "데이텀과 치수·공차·부품특성을 먼저 확정해야 측정기와 판정기준을 정할 수 있다.",
    memoryTip: "기준-치수-공차-재질-표면-주기.",
    rubricLabels: [
      "데이텀·측정치수 확인",
      "개별공차·일반공차 확인",
      "재질·표면처리·주기사항 확인",
      "개별공차 우선 적용원칙",
    ],
  },
  {
    candidateId: "NCS-CAND-BRAKE-CHARACTERISTICS",
    conceptId: "PCON-NCS-BRAKE-CHARACTERISTICS",
    subjectLabel: "subject-3",
    groupLabel: "s3-g07",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "브레이크 종류·원리 비교",
    definition:
      "브레이크는 회전체의 속도를 줄이거나 정지·유지하기 위해 주로 마찰력을 이용해 제동력을 만드는 장치이다.",
    background:
      "포지티브 브레이크는 작동시켜 제동하고, 네거티브 브레이크는 중립·무동력 상태에서 제동되며 작동 신호로 해제된다. 디스크식은 패드와 디스크, 드럼식은 슈·라이닝과 드럼이 접촉한다.",
    components: [
      "포지티브 브레이크",
      "네거티브 브레이크",
      "디스크와 패드",
      "드럼과 슈·라이닝",
      "유압식 마스터실린더와 휠실린더",
    ],
    procedure: [
      "정비지침서에서 브레이크 형식과 정상상태를 확인한다.",
      "무동력 상태의 제동·해제 상태를 확인한다.",
      "마찰재·작동부·복귀부와 유압 누설을 점검한다.",
      "조정 후 무부하에서 제동과 해제를 확인한다.",
    ],
    diagnosis: [
      "네거티브 브레이크가 무동력에서 풀려 있으면 스프링·링크·해제기구의 이상을 의심한다.",
      "오염·편마모·누설은 제동력 저하와 끌림의 원인이 될 수 있다.",
    ],
    safety: ["중량물을 지지하는 브레이크는 기계적 지지 없이 해제하거나 분해하지 않는다."],
    traps: [
      "네거티브 브레이크를 역회전용 브레이크로 설명하지 않는다.",
      "디스크와 드럼의 마찰 접촉부를 바꾸어 쓰지 않는다.",
    ],
    stem:
      "포지티브 브레이크와 네거티브 브레이크의 중립·무동력 상태를 비교하고, 디스크식과 드럼식의 마찰 접촉부를 각각 쓰시오.",
    modelAnswer:
      "포지티브 브레이크는 작동 신호를 주어 제동하고 중립 상태에서는 해제되는 방식이다. 네거티브 브레이크는 중립·무동력 상태에서 제동되고 작동 신호로 해제된다. 디스크식은 패드와 디스크, 드럼식은 슈의 라이닝과 드럼이 마찰한다. 유압식은 작동압을 통해 조작력을 전달한다.",
    answerDefinition:
      "포지티브는 작동 시 제동, 네거티브는 무동력 시 제동이다.",
    memoryTip: "네거티브는 전원이 없어도 잡힌다.",
    rubricLabels: [
      "포지티브 브레이크 상태 설명",
      "네거티브 브레이크 상태 설명",
      "디스크-패드 연결",
      "드럼-슈·라이닝 연결",
    ],
  },
  {
    candidateId: "NCS-CAND-WELD-DEFECT-ESTIMATION",
    conceptId: "PCON-NCS-WELD-DEFECT-ESTIMATION",
    subjectLabel: "subject-2",
    groupLabel: "s2-g02",
    studyTypeIds: ["definition", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "diagnosis",
    formatLabel: "용접결함 원인·예방",
    definition:
      "용접 중 결함 추정은 결함의 형상과 발생위치를 보고 오염·습기·전류·아크길이·운봉·층간청소 같은 원인 후보를 구분하는 작업이다.",
    background:
      "기공은 모재 오염과 습기, 용접봉 건조불량, 긴 아크 등 가스 보호를 해치는 조건과 연결된다. 슬래그 혼입은 전층 슬래그 제거불량, 부적절한 전류·속도·운봉과 개선부 접근성 부족에서 생기기 쉽다.",
    components: [
      "기공·피트",
      "슬래그 혼입",
      "모재 청결과 용접봉 건조",
      "전류·아크길이·용접속도",
      "운봉·봉각도와 층간청소",
    ],
    procedure: [
      "결함의 종류와 발생위치를 확인한다.",
      "모재 청결·습기와 용접재료 보관상태를 확인한다.",
      "WPS의 전류·극성·아크길이·속도와 실제 조건을 대조한다.",
      "운봉·봉각도와 전층 슬래그 제거상태를 확인한다.",
      "원인별 조치 후 재용접·검사한다.",
    ],
    diagnosis: [
      "기공은 청소·건조·짧고 안정된 아크와 적정 속도를 우선 확인한다.",
      "슬래그 혼입은 층간청소·적정 전류·용융풀 관찰·운봉과 개선각을 확인한다.",
    ],
    safety: ["결함 제거와 재용접 전 가연물·환기·보호구와 전원상태를 확인한다."],
    traps: [
      "모든 기공을 전류 하나의 원인으로 단정하지 않는다.",
      "슬래그를 남긴 채 다음 패스를 진행하지 않는다.",
    ],
    stem:
      "기공과 슬래그 혼입의 주요 원인과 예방대책을 각각 3가지 이상 쓰시오.",
    modelAnswer:
      "기공의 원인은 모재의 오염·습기, 용접봉 건조불량, 긴 아크와 부적정한 용접속도 등이며, 모재 청소·건조, 규정된 용접봉 건조·보관, 적정 전류와 짧은 아크·속도 유지로 예방한다. 슬래그 혼입은 전층 슬래그 청소불량, 전류 부족, 부적절한 운봉·봉각도·속도가 원인이며, 층간청소, 적정 전류, 용융풀을 확인하는 운봉과 각도 조정으로 예방한다.",
    answerDefinition:
      "기공은 청결·건조·아크조건, 슬래그 혼입은 층간청소·전류·운봉을 먼저 본다.",
    memoryTip: "기공은 가스길, 슬래그는 청소길을 막은 결함.",
    rubricLabels: [
      "기공 원인 3가지",
      "기공 예방대책",
      "슬래그 혼입 원인 3가지",
      "슬래그 혼입 예방대책",
    ],
  },
  {
    candidateId: "NCS-CAND-WELD-REPAIR",
    conceptId: "PCON-NCS-WELD-REPAIR",
    subjectLabel: "subject-2",
    groupLabel: "s2-g02",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "보수용접 작업순서",
    definition:
      "보수용접은 결함부를 확인·제거한 뒤 적용 WPS와 보수시방에 따라 재용접하고 비파괴검사로 완료 여부를 확인하는 작업이다.",
    background:
      "결함을 덮어 용접하지 않고 건전한 금속이 나올 때까지 제거해야 한다. 균열은 필요 시 끝단 진행방지 조치를 하고 완전 제거 여부를 확인한 뒤 재용접한다.",
    components: [
      "결함 위치와 범위 표시",
      "가우징·연삭·절삭 제거",
      "균열 정지구멍과 제거 확인",
      "WPS·보수용접시방",
      "예열·층간·후열 조건",
      "보수 후 비파괴검사",
    ],
    procedure: [
      "작업장 안전·가연물·환기·보호구를 확인한다.",
      "결함 종류·위치·범위를 표시한다.",
      "가우징·연삭 등 지정 방법으로 결함을 완전히 제거한다.",
      "MT·PT 등 적절한 방법으로 제거 완료를 확인한다.",
      "WPS와 보수시방에 따라 예열·보수용접·후처리를 한다.",
      "외관 및 지정 비파괴검사로 재검사하고 기록한다.",
    ],
    diagnosis: ["균열이 남았거나 가우징부가 오염되면 재균열과 융합불량이 발생할 수 있다."],
    safety: ["예열·후열의 구체 수치는 모재·두께·용접재료와 적용 WPS를 따른다."],
    traps: [
      "균열 위를 그대로 덧살 용접하지 않는다.",
      "NCS 예시의 예열·후열 수치를 모든 재질에 고정 적용하지 않는다.",
    ],
    stem:
      "용접결함부 보수용접의 작업순서를 결함 확인부터 보수 후 검사까지 쓰고, 균열 보수 시 추가로 확인할 사항을 쓰시오.",
    modelAnswer:
      "안전·작업공간을 확보한 뒤 결함의 종류·위치·범위를 표시한다. 가우징·연삭 등으로 건전한 금속이 나올 때까지 결함을 제거하고 MT·PT 등으로 제거 완료를 확인한다. 이후 WPS와 보수시방에 따라 예열·보수용접·후처리를 하고 외관 및 지정 비파괴검사로 재검사한다. 균열은 필요 시 양 끝단 진행방지 조치를 하고 완전 제거 여부를 반드시 확인한다.",
    answerDefinition:
      "확인-표시-완전제거-제거검사-WPS 보수용접-후검사 순이다.",
    memoryTip: "결함을 덮지 말고 없앤 뒤 다시 용접한다.",
    rubricLabels: [
      "안전확보와 결함 위치·범위 확인",
      "가우징·연삭에 의한 완전 제거",
      "WPS에 따른 보수용접",
      "균열 진행방지와 보수 후 검사",
    ],
  },
  {
    candidateId: "NCS-CAND-WELD-NDT",
    conceptId: "PCON-NCS-WELD-NDT",
    subjectLabel: "subject-2",
    groupLabel: "s2-g04",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "비파괴검사법 선택",
    definition:
      "비파괴검사는 용접부를 파괴하지 않고 표면 또는 내부 결함의 존재와 위치를 확인하는 검사이다.",
    background:
      "VT는 외관, PT는 비다공성 재료의 표면 개구결함, MT는 강자성체의 표면·표면근처 결함, RT와 UT는 내부 결함 확인에 주로 사용한다.",
    components: [
      "VT 육안검사",
      "PT 침투탐상검사",
      "MT 자분탐상검사",
      "RT 방사선투과검사",
      "UT 초음파탐상검사",
    ],
    procedure: [
      "예상 결함이 표면인지 내부인지 구분한다.",
      "재질의 자성·다공성, 두께와 형상을 확인한다.",
      "적용 가능한 검사법을 선정하고 표면을 전처리한다.",
      "검사를 수행해 지시를 관찰·판독한다.",
      "보수 완료 여부를 판정하고 기록한다.",
    ],
    diagnosis: [
      "PT는 전처리→침투액 적용→침투시간→잉여 침투액 제거→현상→관찰→후처리 순으로 수행한다.",
      "MT는 강자성체에 적용하며 RT·UT는 결함 방향·두께·접근성에 따라 선택한다.",
    ],
    safety: ["RT는 방사선 안전구역과 자격·절차를 준수하고, 모든 검사는 적용 표준과 검사절차서를 따른다."],
    traps: [
      "PT를 다공성 표면이나 내부결함 검사법으로 쓰지 않는다.",
      "MT를 비자성 재료에 적용한다고 쓰지 않는다.",
    ],
    stem:
      "VT·PT·MT·RT·UT를 주로 검출하는 결함 위치와 적용조건에 맞게 연결하고, PT의 기본 작업순서를 쓰시오.",
    modelAnswer:
      "VT는 외관·표면 형상, PT는 비다공성 재료의 표면 개구결함, MT는 강자성체의 표면 및 표면근처 결함, RT와 UT는 내부 결함 확인에 사용한다. PT는 전처리·세척 → 침투액 적용 → 침투시간 유지 → 잉여 침투액 제거 → 현상제 적용 → 관찰·판독 → 후처리 순으로 한다.",
    answerDefinition:
      "표면은 VT·PT·MT, 내부는 RT·UT를 중심으로 재질과 형상에 맞춰 선정한다.",
    memoryTip: "PT는 열린 표면, MT는 자성체, RT·UT는 내부.",
    rubricLabels: [
      "VT·PT의 적용대상",
      "MT의 강자성체 조건",
      "RT·UT의 내부결함 연결",
      "PT 작업순서",
    ],
  },
  {
    candidateId: "NCS-CAND-HYDRAULIC-VALVE-SELECTION",
    conceptId: "PCON-NCS-HYDRAULIC-VALVE-SELECTION",
    subjectLabel: "subject-1",
    groupLabel: "s1-g03",
    studyTypeIds: ["definition", "drawing", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "유압밸브 기능 매칭",
    definition:
      "유압제어밸브는 회로의 압력, 유체 흐름방향과 유량을 제어하여 액추에이터의 힘·방향·속도를 조절하는 요소이다.",
    background:
      "릴리프밸브는 최고압력을 제한하고, 감압밸브는 분기회로 압력을 낮게 유지하며, 방향제어밸브는 유로를 전환하고, 유량제어밸브는 액추에이터 속도를 조절한다.",
    components: [
      "압력제어밸브: 릴리프·감압·시퀀스",
      "방향제어밸브: 유로 전환·단속",
      "유량제어밸브: 교축·유량조정",
      "체크밸브: 역류 방지",
    ],
    procedure: [
      "회로가 요구하는 최고압력·분기압·속도·작동방향을 구분한다.",
      "정격압력·유량과 포트·조작방식을 확인한다.",
      "기호와 실물의 연결구를 대조한다.",
      "무부하에서 설정 후 부하조건에서 동작을 확인한다.",
    ],
    diagnosis: ["최고압력은 릴리프밸브, 속도는 유량제어밸브, 분기저압은 감압밸브로 조정한다."],
    safety: ["압력 설정 전 압력계와 릴리프 경로를 확인하고 하중을 기계적으로 지지한다."],
    traps: [
      "릴리프밸브와 감압밸브의 목적을 바꾸지 않는다.",
      "속도를 압력제어밸브만으로 조정한다고 쓰지 않는다.",
    ],
    stem:
      "릴리프·감압·시퀀스·방향제어·유량제어밸브의 기능을 각각 쓰고, 실린더 속도와 회로 최고압력을 조정할 밸브를 쓰시오.",
    modelAnswer:
      "릴리프밸브는 회로 최고압력을 제한하고, 감압밸브는 분기회로의 압력을 낮게 유지하며, 시퀀스밸브는 설정압력에 도달한 뒤 다음 동작을 허용한다. 방향제어밸브는 유로를 전환·단속하고 유량제어밸브는 유량을 조절해 액추에이터 속도를 제어한다. 실린더 속도는 유량제어밸브, 회로 최고압력은 릴리프밸브로 조정한다.",
    answerDefinition:
      "압력·방향·유량 중 무엇을 제어할지에 맞춰 밸브를 선정한다.",
    memoryTip: "힘은 압력, 길은 방향, 속도는 유량.",
    rubricLabels: [
      "릴리프·감압 기능",
      "시퀀스 기능",
      "방향·유량제어 기능",
      "속도와 최고압력 조정밸브 선정",
    ],
  },
  {
    candidateId: "NCS-CAND-ELECTROHYDRAULIC-CIRCUIT",
    conceptId: "PCON-NCS-ELECTROHYDRAULIC-CIRCUIT",
    subjectLabel: "subject-1",
    groupLabel: "s1-g04",
    studyTypeIds: ["drawing", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "symbol",
    formatLabel: "전기유압 신호흐름",
    definition:
      "전기유압 회로는 전기 입력과 릴레이 논리로 솔레노이드를 구동하고, 방향제어밸브를 전환하여 유압 액추에이터를 움직이는 시스템이다.",
    background:
      "회로는 입력스위치·센서 → 릴레이·인터록 → 솔레노이드 → 방향제어밸브 → 액추에이터 순으로 읽는다. 두 입력이 모두 필요한 AND 조건은 직렬 접점 등으로 구성한다.",
    components: [
      "입력: 스위치·센서",
      "신호처리: 릴레이·접점·인터록",
      "출력: 솔레노이드 코일",
      "유압제어: 방향제어밸브",
      "구동: 실린더·유압모터",
    ],
    procedure: [
      "전원과 유압을 차단하고 잔압을 제거한다.",
      "회로도에서 입력·논리·출력과 포트를 구분한다.",
      "전기 배선과 유압 배관을 도면대로 구성한다.",
      "N/O·N/C 접점과 AND·OR·인터록 조건을 확인한다.",
      "단계별로 통전·가압해 입력부터 액추에이터까지 추적한다.",
    ],
    diagnosis: ["입력은 정상인데 움직이지 않으면 릴레이 출력·솔레노이드 통전·밸브 스풀과 유압공급을 순서대로 본다."],
    safety: ["배선과 배관 변경 전 전원차단·잔압제거를 하고 예기치 않은 액추에이터 움직임을 막는다."],
    traps: [
      "전기 입력과 유압 동력의 두 계통을 한 회로처럼 섞어 설명하지 않는다.",
      "AND 조건에서 어느 한 접점만 닫혀도 동작한다고 쓰지 않는다.",
    ],
    stem:
      "전기유압 회로의 신호 흐름을 입력부터 액추에이터까지 순서대로 쓰고, 두 스위치가 모두 눌려야 작동하는 논리와 배선 원칙을 쓰시오.",
    modelAnswer:
      "입력스위치·센서 → 릴레이 논리와 인터록 → 솔레노이드 코일 → 방향제어밸브 → 유압실린더·모터 순으로 신호와 동력이 전달된다. 두 스위치가 모두 눌려야 하는 조건은 AND 논리이며 두 N/O 접점을 직렬로 구성한다. 배선·배관 전에는 전원과 유압을 차단하고 잔압을 제거한다.",
    answerDefinition:
      "전기 입력·논리·출력이 유압밸브를 전환하여 액추에이터를 구동한다.",
    memoryTip: "입력-판단-솔레노이드-밸브-실린더.",
    rubricLabels: [
      "입력·릴레이 논리",
      "솔레노이드·방향제어밸브",
      "액추에이터까지의 순서",
      "AND 논리와 직렬접점·전원차단",
    ],
  },
  {
    candidateId: "NCS-CAND-HYDRAULIC-SYSTEM-BUILD",
    conceptId: "PCON-NCS-HYDRAULIC-SYSTEM-BUILD",
    subjectLabel: "subject-1",
    groupLabel: "s1-g02",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "유압시스템 구축 순서",
    definition:
      "유압시스템 구축은 요구기능을 회로도와 부품목록으로 구체화하고, 안전하게 설치한 뒤 낮은 위험조건에서 시운전하여 기능을 확인하는 과정이다.",
    background:
      "설치보다 먼저 필요한 힘·압력·속도와 동작순서를 정해야 하며, 최초 기동 전 오일량·오염·배관·전동기 회전방향·밸브 초기값을 확인한다.",
    components: [
      "요구기능·힘·압력·속도",
      "동작선도·유압회로도",
      "부품목록·배관목록",
      "동력원·밸브·액추에이터",
      "초기 설정과 시험기록",
    ],
    procedure: [
      "요구기능과 힘·압력·속도·동작순서를 정한다.",
      "동작선도·회로도와 부품목록을 작성한다.",
      "안전수칙과 정해진 순서에 따라 부품·배관·배선을 설치한다.",
      "오일량·오염·회전방향·밸브 초기값과 누설을 확인한다.",
      "저압·무부하에서 시작해 단계적으로 기능을 시험하고 기록한다.",
    ],
    diagnosis: ["최초 기동 시 소음·캐비테이션·과압이 발생하면 즉시 정지하고 흡입측·회전방향·밸브 설정을 확인한다."],
    safety: ["릴리프 경로와 비상정지 기능을 확인하고, 고압 누설은 손으로 찾지 않는다."],
    traps: [
      "회로검토 없이 부품부터 연결하지 않는다.",
      "최초 기동을 정격압력·최대부하에서 시작하지 않는다.",
    ],
    stem:
      "유압시스템 구축 과정을 요구사항 확인부터 시운전까지 4단계 이상으로 쓰고, 최초 기동 전에 확인할 사항 4가지를 쓰시오.",
    modelAnswer:
      "요구기능·힘·압력·속도 확인 → 동작선도·회로도·부품목록 작성 → 안전수칙에 따른 설치·배관·배선 → 최초 기동 전 점검 → 저압·무부하 시운전과 기록 순으로 구축한다. 최초 기동 전에는 작동유의 양과 오염상태, 배관·포트와 누설, 전동기 회전방향, 밸브의 초기 설정과 릴리프 경로를 확인한다.",
    answerDefinition:
      "요구사항-설계-설치-사전점검-저압시험의 순서로 구축한다.",
    memoryTip: "기능을 정하고, 그리고, 설치하고, 낮게 시험한다.",
    rubricLabels: [
      "요구기능·힘·압력·속도 확인",
      "회로도·부품목록 작성",
      "안전한 설치·사전점검",
      "저압·무부하 시험과 기록",
    ],
  },
  {
    candidateId: "NCS-CAND-HYDRAULIC-AUXILIARY-CONTROLS",
    conceptId: "PCON-NCS-HYDRAULIC-AUXILIARY-CONTROLS",
    subjectLabel: "subject-1",
    groupLabel: "s1-g04",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "부가조건 스위치 기능",
    definition:
      "유압 부가조건 회로는 기본 1사이클 동작에 운전모드, 시작·정지·리셋과 비상정지 같은 안전·편의 조건을 추가한 제어회로이다.",
    background:
      "메인스위치는 동력을 격리하고, 시동은 선택된 모드에서 운전을 시작하며, 리셋은 고장·정지 후 초기조건을 복구한다. 비상정지는 장치의 에너지 특성에 맞는 안전상태를 만들어야 한다.",
    components: [
      "메인스위치",
      "시동·정지 스위치",
      "리셋 스위치",
      "자동·수동 선택",
      "단속·연속 선택",
      "비상정지와 인터록",
    ],
    procedure: [
      "기본 1사이클 동작과 안전상태를 정한다.",
      "자동·수동과 단속·연속의 선택조건을 구성한다.",
      "시동·정지·리셋·비상정지 접점을 배치한다.",
      "단일동작에서 각 스위치 기능을 시험한다.",
      "비상정지 후 재시동이 자동으로 일어나지 않는지 확인한다.",
    ],
    diagnosis: ["리셋은 고장원인을 없애지 않고 강제로 운전시키는 기능이 아니라 재시작 가능한 초기상태를 만드는 기능이다."],
    safety: ["비상정지 해제만으로 자동 재기동되지 않도록 별도의 시동동작과 안전조건을 확인한다."],
    traps: [
      "정지와 비상정지를 같은 기능으로 설명하지 않는다.",
      "리셋을 안전인터록 무효화 기능으로 사용하지 않는다.",
    ],
    stem:
      "메인·시동·정지·리셋·비상정지 스위치의 역할을 각각 쓰고, 자동/수동 및 단속/연속 선택회로의 목적을 설명하시오.",
    modelAnswer:
      "메인스위치는 시스템 동력을 연결·격리하고, 시동은 선택된 운전모드를 시작하며, 정지는 정상 운전을 멈춘다. 리셋은 고장·정지 후 초기조건을 복구하고, 비상정지는 위험 시 장치를 안전상태로 정지시킨다. 자동/수동 선택은 제어 주체를, 단속/연속 선택은 한 사이클 운전과 반복 운전을 구분한다. 비상정지 해제 후에는 자동 재기동되지 않아야 한다.",
    answerDefinition:
      "부가조건은 기본 동작에 운전모드와 안전한 시작·정지·복귀 조건을 더한다.",
    memoryTip: "선택하고-시작하고-멈추고-초기화하고-위험하면 비상정지.",
    rubricLabels: [
      "메인·시동·정지 역할",
      "리셋 역할",
      "비상정지와 재기동 방지",
      "자동/수동·단속/연속 구분",
    ],
  },
  {
    candidateId: "NCS-CAND-PNEUMATIC-LOGIC",
    conceptId: "PCON-NCS-PNEUMATIC-LOGIC",
    subjectLabel: "subject-1",
    groupLabel: "s1-g08",
    studyTypeIds: ["definition", "drawing"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "공압 논리요소 매칭",
    definition:
      "공압 논리제어는 압축공기 신호의 유무를 이용하여 YES·NOT·AND·OR 조건을 만들고 액추에이터의 동작허가를 결정하는 방식이다.",
    background:
      "정상닫힘 3/2밸브는 입력에 따라 출력하는 YES, 정상열림 3/2밸브는 입력을 반전하는 NOT에 대응한다. 2압밸브는 두 입력이 모두 필요한 AND, 셔틀밸브는 어느 한 입력으로 출력하는 OR 기능을 한다.",
    components: [
      "정상닫힘 3/2밸브: YES",
      "정상열림 3/2밸브: NOT",
      "2압밸브: AND",
      "셔틀밸브: OR",
    ],
    procedure: [
      "원하는 출력조건을 진리표로 정한다.",
      "YES·NOT·AND·OR 중 필요한 논리를 고른다.",
      "밸브의 정상상태와 포트·신호방향을 확인한다.",
      "입력 조합별 출력상태를 시험한다.",
    ],
    diagnosis: ["AND 출력이 없으면 두 입력압력과 2압밸브의 연결을, OR 역류가 있으면 셔틀밸브 내부와 포트를 점검한다."],
    safety: ["회로 변경 전 공급공기를 차단하고 잔압을 제거한다."],
    traps: [
      "2압밸브를 두 압력 중 높은 값을 선택하는 밸브로 설명하지 않는다.",
      "셔틀밸브를 두 입력이 동시에 있어야 출력하는 AND로 쓰지 않는다.",
    ],
    stem:
      "YES·NOT·AND·OR 논리기능에 대응하는 공압밸브를 각각 쓰고, 2압밸브와 셔틀밸브의 출력조건을 설명하시오.",
    modelAnswer:
      "YES는 정상닫힘 3/2밸브, NOT은 정상열림 3/2밸브, AND는 2압밸브, OR은 셔틀밸브에 대응한다. 2압밸브는 두 입력이 모두 있을 때 출력하고, 셔틀밸브는 두 입력 중 어느 하나가 있으면 출력한다.",
    answerDefinition:
      "2압밸브는 AND, 셔틀밸브는 OR이다.",
    memoryTip: "두 개 모두는 2압, 둘 중 하나는 셔틀.",
    rubricLabels: [
      "YES·NOT 대응밸브",
      "AND-2압밸브",
      "OR-셔틀밸브",
      "두 밸브의 출력조건 설명",
    ],
  },
  {
    candidateId: "NCS-CAND-PNEUMATIC-CIRCUIT-ASSEMBLY",
    conceptId: "PCON-NCS-PNEUMATIC-CIRCUIT-ASSEMBLY",
    subjectLabel: "subject-1",
    groupLabel: "s1-g08",
    studyTypeIds: ["drawing", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "공압회로 구성순서",
    definition:
      "공압회로 구성은 회로도에서 부품과 부속품을 목록화하고, 간섭이 없게 배치한 뒤 배관·배선·누설검사를 거쳐 동작을 확인하는 작업이다.",
    background:
      "도면에는 피팅·소음기·배관지지·가동부 여유 같은 설치 부속품이 생략될 수 있다. 실제 구성에서는 호스 꺾임, 전선 단락, 가동부 간섭과 배기방향을 함께 확인한다.",
    components: [
      "공압부품·전기부품 목록",
      "호스·피팅·분배기",
      "소음기·배관지지",
      "전선·단자·보호기기",
      "가동부 여유와 간섭방지",
    ],
    procedure: [
      "회로도에서 부품명·수량·규격과 부속품을 목록화한다.",
      "조작·점검성과 가동부 간섭을 고려해 배치한다.",
      "공급을 차단한 상태에서 배관하고 필요 시 전기배선한다.",
      "호스 꺾임·피팅 체결·배선 단락과 접지를 확인한다.",
      "저압에서 누설검사 후 단계별 동작시험을 한다.",
    ],
    diagnosis: ["실린더가 느리면 호스 꺾임·피팅 구경·소음기 막힘·누설을, 솔레노이드 무응답은 전원·접점을 확인한다."],
    safety: ["배관·배선 작업 전 공급공기와 전원을 차단하고 잔압을 제거한다."],
    traps: [
      "회로도에 그려진 주부품만 준비하고 피팅·호스·소음기를 누락하지 않는다.",
      "가압상태에서 호스를 다시 체결하지 않는다.",
    ],
    stem:
      "공압제어 회로를 구성하는 준비·배치·배관·배선·시험 순서를 쓰고, 회로도에서 생략되기 쉬운 실제 설치 부속품 4가지를 쓰시오.",
    modelAnswer:
      "회로도에서 부품명·수량·규격을 목록화하고, 점검성과 간섭을 고려해 배치한다. 공급공기와 전원을 차단하고 잔압을 제거한 뒤 배관하고 배선한다. 피팅 체결·호스 꺾임·배선 단락을 확인하고 저압 누설검사 후 단계별 동작시험을 한다. 생략되기 쉬운 부속품은 호스, 피팅, 소음기, 배관지지대·분배기·단자류 등이다.",
    answerDefinition:
      "목록-배치-차단-배관·배선-누설·동작시험 순으로 구성한다.",
    memoryTip: "도면 밖의 피팅·호스·소음기까지 챙긴다.",
    rubricLabels: [
      "부품목록과 배치",
      "공급차단·잔압제거",
      "배관·배선과 간섭확인",
      "부속품과 누설·동작시험",
    ],
  },
  {
    candidateId: "NCS-CAND-PNEUMATIC-COMMISSIONING",
    conceptId: "PCON-NCS-PNEUMATIC-COMMISSIONING",
    subjectLabel: "subject-1",
    groupLabel: "s1-g05",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "공압 시운전·조정",
    definition:
      "공압 시운전은 회로의 초기상태를 확인한 뒤 낮은 위험조건에서 작동시키며 압력·유량·쿠션을 부하특성에 맞게 조정하는 작업이다.",
    background:
      "압력은 실린더 힘, 유량은 속도에 주로 영향을 주고 쿠션은 행정 끝단의 충격을 줄인다. 한 번에 하나씩 조정하고 전진·후진 결과를 기록해야 원인을 구분할 수 있다.",
    components: [
      "초기위치·안전구간",
      "레귤레이터와 압력계",
      "유량제어밸브",
      "실린더 쿠션",
      "속도·힘·충격 기록",
    ],
    procedure: [
      "액추에이터 초기위치와 이동구간의 안전을 확인한다.",
      "낮은 압력과 충분히 열린 유량조건에서 시작한다.",
      "요구 힘에 맞춰 압력을 조정한다.",
      "전진·후진 속도에 맞춰 유량을 조정한다.",
      "행정 끝단 충격에 맞춰 쿠션을 조정하고 결과를 기록한다.",
    ],
    diagnosis: [
      "힘 부족은 공급압·누설·부하·마찰을, 속도 저하는 유량·배기저항·밸브·호스를 점검한다.",
    ],
    safety: ["시운전 중 액추에이터의 협착구역에 접근하지 않고 비상정지 수단을 확보한다."],
    traps: [
      "속도를 높이기 위해 압력만 과도하게 올리지 않는다.",
      "쿠션을 완전히 잠가 행정 끝 동작을 막지 않는다.",
    ],
    stem:
      "공압실린더 시운전 시 압력·유량·쿠션을 조정하는 순서를 쓰고, 힘 부족과 속도 저하의 점검항목을 구분하시오.",
    modelAnswer:
      "초기위치와 안전구간을 확인하고 낮은 압력·충분히 열린 유량조건에서 시작한다. 요구 힘에 맞춰 압력을 조정하고, 전진·후진 속도에 맞춰 유량제어밸브를 조정한 뒤 행정 끝단 충격에 맞춰 쿠션을 조정하고 기록한다. 힘 부족은 공급압·누설·부하·마찰을, 속도 저하는 유량·배기저항·밸브와 호스 상태를 점검한다.",
    answerDefinition:
      "압력은 힘, 유량은 속도, 쿠션은 끝단 충격을 조정한다.",
    memoryTip: "낮게 시작해 힘-속도-충격 순으로 맞춘다.",
    rubricLabels: [
      "초기위치·저압 시작",
      "압력-힘 조정",
      "유량-속도 조정",
      "쿠션·기록과 고장점검 구분",
    ],
  },
  {
    candidateId: "NCS-CAND-PNEUMATIC-TROUBLESHOOTING",
    conceptId: "PCON-NCS-PNEUMATIC-TROUBLESHOOTING",
    subjectLabel: "subject-1",
    groupLabel: "s1-g07",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "diagnosis",
    formatLabel: "공압 이상 추적",
    definition:
      "공압 고장추적은 공급에너지와 누설을 먼저 확인하고 입력·논리·출력·액추에이터 순으로 신호를 따라가며 이상구간을 좁히는 작업이다.",
    background:
      "공압기기는 압축공기 공급부, 제어요소와 액추에이터가 서로 영향을 준다. 따라서 부품을 임의 교체하기보다 압력·유량·누설과 신호 유무를 단계별로 확인한다.",
    components: [
      "공급압력·유량·누설",
      "입력스위치·센서",
      "릴레이·공압논리",
      "솔레노이드·방향제어밸브",
      "실린더·부하",
    ],
    procedure: [
      "공급압력·유량과 누설을 확인한다.",
      "입력스위치·센서 신호를 확인한다.",
      "릴레이·논리부의 출력조건을 확인한다.",
      "솔레노이드 통전과 밸브 전환을 확인한다.",
      "액추에이터·부하·기계적 걸림을 확인한다.",
      "한 가지 원인만 조치하고 같은 조건으로 재시험한다.",
    ],
    diagnosis: [
      "압력 과대는 충격과 누설위험, 압력 과소는 힘 부족과 밸브 오동작을 만들 수 있다.",
      "유량 부족은 속도 저하, 과대유량은 과속과 끝단충격을 만들 수 있다.",
    ],
    safety: ["점검 중 회로를 변경할 때마다 공급을 차단하고 잔압을 제거한다."],
    traps: [
      "여러 부품을 동시에 조정해 원인을 알 수 없게 만들지 않는다.",
      "압력계만 보고 국부 누설과 배기막힘을 생략하지 않는다.",
    ],
    stem:
      "공압실린더가 움직이지 않을 때 공급부부터 액추에이터까지 점검순서를 쓰고, 압력·유량의 과대와 과소가 만드는 대표 현상을 쓰시오.",
    modelAnswer:
      "공급압력·유량·누설 → 입력스위치·센서 → 릴레이·논리 → 솔레노이드·방향제어밸브 → 액추에이터와 기계부하 순으로 점검한다. 압력 과대는 충격·누설위험, 압력 과소는 힘 부족·밸브 오동작을 만들 수 있다. 유량 부족은 속도 저하, 과대유량은 과속·끝단충격을 만든다. 한 번에 한 원인만 조치하고 재시험한다.",
    answerDefinition:
      "공급-입력-논리-출력-구동 순으로 한 단계씩 추적한다.",
    memoryTip: "공입논출구, 한 번에 하나.",
    rubricLabels: [
      "압력·유량·누설 확인",
      "입력·논리 확인",
      "솔레노이드·밸브·액추에이터 확인",
      "과대·과소 현상과 단일원인 재시험",
    ],
  },
  {
    candidateId: "NCS-CAND-SENSOR-RELAY-CIRCUIT",
    conceptId: "PCON-NCS-SENSOR-RELAY-CIRCUIT",
    subjectLabel: "subject-1",
    groupLabel: "s1-g10",
    studyTypeIds: ["drawing", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "symbol",
    formatLabel: "센서·릴레이 회로 판독",
    definition:
      "센서 릴레이제어회로는 센서의 검출신호를 접점논리로 처리해 솔레노이드 등 출력기기를 구동하는 회로이다.",
    background:
      "센서 전원과 출력형식, N/O·N/C 접점의 정상상태를 확인하고 변위-단계선도의 완료신호와 실제 입출력 순서를 대조해야 한다.",
    components: [
      "센서 전원·출력신호",
      "N/O·N/C 접점",
      "릴레이 코일·접점",
      "솔레노이드 출력",
      "변위-단계선도와 완료센서",
    ],
    procedure: [
      "변위-단계선도에서 필요한 입력과 출력순서를 정한다.",
      "센서 전원·출력형식과 N/O·N/C 상태를 확인한다.",
      "릴레이 코일과 접점논리를 구성한다.",
      "솔레노이드 출력과 액추에이터를 연결한다.",
      "입력을 단계별로 변화시키며 실제 입출력을 기록한다.",
    ],
    diagnosis: ["센서 표시등은 켜지지만 릴레이가 동작하지 않으면 출력형식·공통선·전압과 접점배선을 확인한다."],
    safety: ["배선 변경 전 전원을 차단하고 출력 액추에이터의 예기치 않은 움직임을 방지한다."],
    traps: [
      "N/O와 N/C를 현재 동작상태가 아니라 무조작 정상상태로 구분한다.",
      "센서 출력의 허용전류를 확인하지 않고 부하를 직접 구동하지 않는다.",
    ],
    stem:
      "센서·릴레이·솔레노이드·액추에이터로 이어지는 제어 신호 흐름을 쓰고, N/O와 N/C 접점의 구분기준을 설명하시오.",
    modelAnswer:
      "센서가 물체를 검출하면 출력신호가 릴레이 코일 또는 제어입력으로 전달되고, 릴레이의 N/O·N/C 접점논리가 솔레노이드에 출력을 보내 밸브와 액추에이터를 구동한다. N/O와 N/C는 전원이 꺼지고 조작되지 않은 정상상태에서 접점이 열려 있는지 닫혀 있는지로 구분한다. 센서 전원·출력형식과 변위-단계선도의 순서를 함께 확인한다.",
    answerDefinition:
      "센서 입력을 릴레이 논리로 처리해 솔레노이드와 액추에이터를 구동한다.",
    memoryTip: "정상상태로 NO·NC를 읽고 입력-논리-출력을 따른다.",
    rubricLabels: [
      "센서 입력신호",
      "릴레이 코일·접점논리",
      "솔레노이드·액추에이터 출력",
      "N/O·N/C 정상상태 구분",
    ],
  },
  {
    candidateId: "NCS-CAND-SENSOR-MAINTENANCE",
    conceptId: "PCON-NCS-SENSOR-MAINTENANCE",
    subjectLabel: "subject-1",
    groupLabel: "s1-g10",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "diagnosis",
    formatLabel: "센서 점검·이상조치",
    definition:
      "센서 유지관리는 설치·검출·배선·전원·출력상태를 주기적으로 확인하고 이상 원인을 입력부터 출력까지 구분해 조치하는 활동이다.",
    background:
      "검출거리와 대상 재질·크기, 오염, 체결력, 케이블 손상과 전기노이즈는 센서 오동작의 대표 원인이다. 동력선·고압선과 분리 배선하면 유도노이즈에 의한 오동작을 줄일 수 있다.",
    components: [
      "설치방향·체결상태",
      "검출거리·검출물",
      "오염·충격·온도",
      "케이블·커넥터",
      "전원전압·출력신호",
    ],
    procedure: [
      "외관·설치·검출면과 검출물 상태를 확인한다.",
      "검출거리와 정렬을 확인한다.",
      "케이블·커넥터·전원전압을 확인한다.",
      "검출물 변화에 따른 입력과 출력신호를 측정한다.",
      "원인을 조치한 뒤 같은 조건으로 재시험하고 기록한다.",
    ],
    diagnosis: ["불규칙 동작은 검출거리 경계, 오염, 케이블 접촉불량, 전원변동과 동력선 노이즈를 우선 확인한다."],
    safety: ["센서 위치를 조정할 때 설비를 정지·격리하고 움직이는 부품과의 충돌을 방지한다."],
    traps: [
      "출력 표시등만 보고 실제 제어기 입력까지 정상이라고 단정하지 않는다.",
      "센서를 과도한 힘으로 체결하거나 케이블을 잡아당기지 않는다.",
    ],
    stem:
      "근접센서가 불규칙하게 동작할 때 점검항목 6가지를 쓰고, 센서 배선을 동력선·고압선과 분리하는 이유를 설명하시오.",
    modelAnswer:
      "설치방향과 체결상태, 검출거리, 검출물의 재질·크기, 검출면 오염, 케이블·커넥터, 전원전압과 출력신호를 확인한다. 또한 충격·주변온도와 입력신호 변화를 확인한다. 센서선을 동력선·고압선과 같은 덕트·전선관에 넣으면 유도노이즈로 오동작할 수 있으므로 분리 배선한다.",
    answerDefinition:
      "설치·거리·대상·오염·배선·전원·출력을 순서대로 점검한다.",
    memoryTip: "설거리대오배전출.",
    rubricLabels: [
      "설치상태·검출거리",
      "검출물·오염",
      "케이블·전원·출력신호",
      "동력선 분리와 노이즈 이유",
    ],
  },
  {
    candidateId: "NCS-CAND-SYSTEM-GROUPING",
    conceptId: "PCON-NCS-SYSTEM-GROUPING",
    subjectLabel: "subject-4",
    groupLabel: "s4-g07",
    studyTypeIds: ["definition", "drawing", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "기계시스템 기능별 그룹화",
    definition:
      "기계시스템 그룹화는 하드웨어 구성요소를 구조·기능·공정·에너지 방식별 단위로 나누고 상호 인터페이스를 모델로 표현하는 작업이다.",
    background:
      "구조물·구동부·액추에이터·센서·제어기·에너지공급부로 나누면 각 요소의 정격·제어방식·연결관계와 책임범위를 명확히 할 수 있다.",
    components: [
      "구조물·가이드·프레임",
      "모터·감속기·전달기구",
      "공압·유압·전동 액추에이터",
      "센서·스위치",
      "PLC·릴레이·드라이브",
      "전기·공압·유압 공급부",
    ],
    procedure: [
      "공정과 요구기능을 구분한다.",
      "구성요소를 구조·기능·에너지원별로 그룹화한다.",
      "각 요소의 종류·형식·모델·정격·제어방식을 기록한다.",
      "기계·전기·유체 인터페이스를 표시한다.",
      "블록도·목록·모델로 표현해 공유한다.",
    ],
    diagnosis: ["그룹 경계와 인터페이스가 빠지면 부품은 나열되어도 신호·동력 전달관계를 검증하기 어렵다."],
    safety: ["에너지원과 위험구역을 별도 그룹으로 표시해 격리점과 안전인터록을 확인한다."],
    traps: [
      "부품명만 나열하고 기능·에너지원·인터페이스를 생략하지 않는다.",
      "센서와 제어기, 액추에이터를 같은 기능으로 묶지 않는다.",
    ],
    stem:
      "자동화 설비의 구성요소를 기능별로 6개 그룹으로 나누고, 그룹별 부품목록에 기록할 사양항목 5가지를 쓰시오.",
    modelAnswer:
      "구조물, 구동부, 액추에이터, 센서, 제어기, 에너지공급부로 그룹화한다. 각 그룹에는 부품명, 종류·형식, 모델명, 정격·용량, 제어방식, 고정·설치방법과 기계·전기·유체 인터페이스를 기록한다.",
    answerDefinition:
      "구조·기능·에너지원별로 나누고 정격·제어·인터페이스를 기록한다.",
    memoryTip: "구-구-액-센-제-에.",
    rubricLabels: [
      "구조물·구동부",
      "액추에이터·센서",
      "제어기·에너지공급부",
      "모델·정격·제어·인터페이스 기록",
    ],
  },
  {
    candidateId: "NCS-CAND-PPE-SELECTION",
    conceptId: "PCON-NCS-PPE-SELECTION",
    subjectLabel: "subject-2",
    groupLabel: "s2-g03",
    studyTypeIds: ["definition", "visual", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "matching",
    formatLabel: "위험요인·보호구 매칭",
    definition:
      "보호구 선정은 작업의 비산·분진·유해가스·소음·감전·낙하·용접광 위험을 확인하고 노출경로와 수준에 맞는 보호구를 고르는 과정이다.",
    background:
      "보호구는 위험 제거·격리·환기·방호 같은 공학적·관리적 대책을 보완하는 최후 방어수단이다. 사용 전 손상·오염·유효상태·밀착과 작업 적합성을 확인한다.",
    components: [
      "비산: 보안경·안면보호구",
      "분진·유해가스: 위험성평가에 맞는 호흡보호구",
      "소음: 청력보호구",
      "감전: 절연용 보호구",
      "낙하: 안전모·필요 시 추락방호",
      "용접광·불티: 용접면·보호복·장갑",
    ],
    procedure: [
      "작업과 물질의 위험요인·노출경로를 확인한다.",
      "제거·격리·환기·방호대책을 먼저 적용한다.",
      "남은 위험에 맞는 인증·적합 보호구를 선정한다.",
      "손상·오염·밀착·유효상태를 점검한다.",
      "위험노출 전에 착용하고 사용 후 세척·보관한다.",
    ],
    diagnosis: ["호흡보호구는 물질 종류·농도·산소상태에 따라 형식이 달라지므로 외형만 보고 선정하지 않는다."],
    safety: ["법정 등급·교체주기와 필터 선택은 현행 공식기준·위험성평가·제조사 지침을 따른다."],
    traps: [
      "보호구 착용만으로 위험원이 제거되었다고 보지 않는다.",
      "모든 분진·가스에 같은 마스크를 사용한다고 쓰지 않는다.",
    ],
    stem:
      "비산·분진 또는 유해가스·소음·감전·낙하·용접광 위험에 알맞은 보호구를 연결하고, 보호구 사용 전 확인사항 4가지를 쓰시오.",
    modelAnswer:
      "비산에는 보안경·안면보호구, 분진·유해가스에는 위험성평가와 물질·농도에 맞는 호흡보호구, 소음에는 청력보호구, 감전에는 절연용 보호구, 낙하에는 안전모와 필요한 추락방호구, 용접광·불티에는 용접면·보호복·장갑을 사용한다. 사용 전 손상, 오염, 유효상태, 밀착과 작업 적합성을 확인하고 위험노출 전에 착용한다. 보호구보다 위험 제거·격리·환기·방호대책을 우선한다.",
    answerDefinition:
      "위험요인과 노출경로에 맞춰 선정하고 손상·유효상태·밀착을 확인한다.",
    memoryTip: "위험을 먼저 줄이고 남은 위험을 보호구로 막는다.",
    rubricLabels: [
      "비산·호흡 위험 보호구",
      "소음·감전·낙하·용접광 보호구",
      "사용 전 손상·유효상태·밀착 점검",
      "공학적 대책 우선원칙",
    ],
  },
  {
    candidateId: "NCS-CAND-SAFETY-PREVENTION",
    conceptId: "PCON-NCS-SAFETY-PREVENTION",
    subjectLabel: "subject-2",
    groupLabel: "s2-g03",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "작업 전 안전점검·이상조치",
    definition:
      "작업 전 안전점검은 위험요인과 에너지원, 방호장치·작업통로·표지·비상대응 상태를 확인해 사고를 예방하는 활동이다.",
    background:
      "이상 발견 시 작업을 계속하며 관찰하지 않고 즉시 정지한 뒤 에너지를 격리하고 보고·시정·재확인한다. 작업 재개는 원인과 방호상태를 확인한 뒤 승인된 절차에 따른다.",
    components: [
      "위험요인·작업절차",
      "전기·압력·중력 등 에너지원",
      "방호장치·비상정지",
      "통로·조명·정리정돈",
      "안전표지·비상연락",
      "작업중지·격리·보고·재발방지",
    ],
    procedure: [
      "작업내용과 위험요인을 확인한다.",
      "에너지원과 격리점·잔류에너지를 확인한다.",
      "방호장치·비상정지·공구·통로·표지를 점검한다.",
      "이상 발견 시 작업을 중지하고 격리·보고한다.",
      "원인을 시정하고 안전기능을 재확인한다.",
      "승인 후 작업을 재개하고 재발방지 기록을 남긴다.",
    ],
    diagnosis: ["방호장치가 해제되었거나 에너지 격리가 불완전하면 작업을 시작하지 않는다."],
    safety: ["재해보고 기한 등 법령 수치는 최신 공식근거 확인 없이 답안으로 고정하지 않는다."],
    traps: [
      "이상 발견 후 원인 확인 없이 리셋하여 재가동하지 않는다.",
      "작업중지와 보고만 하고 시정·재확인을 생략하지 않는다.",
    ],
    stem:
      "기계조립 작업 전 안전점검 항목 6가지를 쓰고, 이상 발견부터 작업 재개까지의 조치 순서를 쓰시오.",
    modelAnswer:
      "작업절차와 위험요인, 전기·압력·중력 등 에너지원과 격리점, 방호장치·비상정지, 공구와 체결상태, 통로·조명·정리정돈, 안전표지와 비상연락을 확인한다. 이상 발견 시 작업중지 → 에너지 격리·위험구역 통제 → 보고 → 원인 시정 → 방호·안전기능 재확인 → 승인 후 재개 → 재발방지 기록 순으로 조치한다.",
    answerDefinition:
      "위험과 에너지를 먼저 확인하고 이상 시 중지-격리-보고-시정-확인-재개한다.",
    memoryTip: "중격보시확재.",
    rubricLabels: [
      "위험요인·에너지원",
      "방호·비상정지·통로·표지",
      "작업중지·격리·보고",
      "시정·재확인·승인·재발방지",
    ],
  },
  {
    candidateId: "NCS-CAND-JIG-FIXTURE",
    conceptId: "PCON-NCS-JIG-FIXTURE",
    subjectLabel: "subject-3",
    groupLabel: "s3-g07",
    studyTypeIds: ["definition", "visual"],
    primaryStudyCategoryId: "theory_concept",
    examFormat: "definition",
    formatLabel: "지그·고정구 정의 비교",
    definition:
      "지그와 고정구는 공작물의 위치를 정하고 지지·고정하여 작업 재현성을 높이는 치공구이며, 지그는 공구 안내 기능까지 갖는다는 점이 다르다.",
    background:
      "두 치공구 모두 위치결정·지지·클램핑과 작업공간 확보가 기본이지만, 드릴 부시처럼 절삭공구의 경로를 직접 안내하면 지그로 구분한다.",
    components: [
      "위치결정구",
      "지지구",
      "클램프",
      "공구 안내부시",
      "몸체와 기준면",
    ],
    procedure: [
      "도면과 조립순서에서 기준면·위치를 확인한다.",
      "공작물을 안정적으로 지지·위치결정한다.",
      "변형 없이 필요한 힘으로 클램핑한다.",
      "공구·부품·작업자의 간섭과 접근성을 확인한다.",
    ],
    diagnosis: ["위치결정이 불완전하면 반복정밀도가 나빠지고 과도한 클램핑은 공작물 변형을 만든다."],
    safety: ["치공구와 공작물의 체결상태를 확인한 뒤 공구를 작동한다."],
    traps: [
      "지그와 고정구를 모두 공구를 안내하는 장치라고 쓰지 않는다.",
      "클램핑만 하고 위치결정·지지를 생략하지 않는다.",
    ],
    stem:
      "지그와 고정구의 공통 기능과 차이점을 공구 안내 여부를 포함해 설명하고, 치공구의 기본 기능 3가지를 쓰시오.",
    modelAnswer:
      "지그와 고정구는 모두 공작물을 위치결정·지지·고정한다. 지그는 드릴 부시 등으로 공구를 직접 안내하지만 고정구는 공작물을 위치·고정할 뿐 공구를 안내하지 않는다. 치공구의 기본 기능은 위치결정, 지지, 클램핑이며 공구와 작업공간의 간섭도 확인한다.",
    answerDefinition:
      "지그는 위치·고정과 공구 안내, 고정구는 위치·고정만 한다.",
    memoryTip: "지그에는 공구 길잡이가 있다.",
    rubricLabels: [
      "공통 기능: 위치결정·지지·고정",
      "지그의 공구안내",
      "고정구의 비안내 특성",
      "간섭·작업공간 확인",
    ],
  },
  {
    candidateId: "NCS-CAND-DRIVE-PART-INSPECTION",
    conceptId: "PCON-NCS-DRIVE-PART-INSPECTION",
    subjectLabel: "subject-3",
    groupLabel: "s3-g05",
    studyTypeIds: ["drawing", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "visual_identification",
    examFormat: "drawing",
    formatLabel: "구동부품 도면검사",
    definition:
      "구동부품 검사는 도면의 치수·기하공차, 표면거칠기와 끼워맞춤 요구를 측정값과 비교하여 조립 적합성을 판정하는 작업이다.",
    background:
      "축 외경, 베어링 구멍, 원주 흔들림과 표면상태는 각각 다른 측정기와 기준이 필요하다. 측정값은 도면·검사기준에 따라 합격·불합격으로 판정하고 측정기와 조건을 함께 기록한다.",
    components: [
      "치수공차·기하공차",
      "표면거칠기",
      "축·구멍 끼워맞춤",
      "외측·내측 측정기",
      "다이얼게이지와 V블록",
      "검사성적서",
    ],
    procedure: [
      "도면번호·개정과 검사대상 치수·공차를 확인한다.",
      "측정범위·분해능에 맞는 측정기와 보조구를 선정한다.",
      "영점과 측정면 청결을 확인하고 반복 측정한다.",
      "도면공차·끼워맞춤·거칠기 요구와 비교해 합부를 판정한다.",
      "측정값·측정기·조건·판정을 기록한다.",
    ],
    diagnosis: ["축 외경은 외측 마이크로미터, 구멍은 내측 마이크로미터·실린더 게이지, 흔들림은 다이얼게이지를 사용한다."],
    safety: ["회전체는 정지·고정하고 무거운 부품은 낙하방지 후 측정한다."],
    traps: [
      "치수만 맞으면 기하공차와 표면거칠기도 합격이라고 판단하지 않는다.",
      "측정값만 기록하고 도면 개정·측정기 번호를 누락하지 않는다.",
    ],
    stem:
      "축과 베어링 끼워맞춤부를 검사할 때 확인할 도면정보와 측정기를 쓰고, 측정값으로 합격·불합격을 판정하는 순서를 쓰시오.",
    modelAnswer:
      "도면에서 축·구멍의 치수공차와 끼워맞춤, 기하공차, 표면거칠기, 데이텀을 확인한다. 축 외경은 외측 마이크로미터, 베어링 구멍은 내측 마이크로미터 또는 실린더 게이지, 원주 흔들림은 V블록과 다이얼게이지로 측정한다. 도면·개정 확인 → 측정기 선정·영점 → 반복측정 → 공차와 비교 → 합부판정 → 기록 순으로 수행한다.",
    answerDefinition:
      "도면 요구-측정기 선정-영점-측정-공차비교-판정·기록 순이다.",
    memoryTip: "치기거끼를 보고 외내흔을 잰다.",
    rubricLabels: [
      "치수·기하공차·거칠기·끼워맞춤",
      "축·구멍 측정기 선정",
      "흔들림 측정기와 보조구",
      "측정·비교·합부판정·기록 순서",
    ],
  },
  {
    candidateId: "NCS-CAND-ASSEMBLY-STATE",
    conceptId: "PCON-NCS-ASSEMBLY-STATE",
    subjectLabel: "subject-3",
    groupLabel: "s3-g05",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "구동장치 조립상태 점검",
    definition:
      "구동장치 조립상태 검사는 시운전 전에 조립도와 공정순서대로 부품이 청결하고 올바른 방향·끼워맞춤·간극·정렬·윤활상태로 조립되었는지 확인하는 작업이다.",
    background:
      "베어링 압입력은 끼워맞추는 링에 직접 가해야 하며 전동체를 거쳐 전달하면 궤도와 전동체를 손상시킬 수 있다.",
    components: [
      "부품 방향·청결",
      "끼워맞춤·베어링 압입",
      "볼트 체결·풀림방지",
      "간극·엔드플레이",
      "축정렬·원활한 회전",
      "윤활유·그리스 상태",
    ],
    procedure: [
      "조립도·부품표·공정순서를 대조한다.",
      "부품 방향·청결과 끼워맞춤·압입부를 확인한다.",
      "체결토크와 풀림방지 상태를 확인한다.",
      "간극·엔드플레이·축정렬을 측정한다.",
      "윤활과 수동회전 상태를 확인하고 기록한다.",
    ],
    diagnosis: ["베어링은 축에 끼울 때 내륜, 하우징에 끼울 때 외륜에 압입력을 가해 전동체를 통과시키지 않는다."],
    safety: ["시운전 전 방호커버와 체결상태를 확인하고 회전체에 공구가 남지 않게 한다."],
    traps: [
      "베어링 반대쪽 링을 두드려 전동체로 압입력을 전달하지 않는다.",
      "조립 완료를 외관만 보고 간극·정렬·윤활 확인 없이 판정하지 않는다.",
    ],
    stem:
      "구동장치 시운전 전 조립상태 점검항목 6가지를 쓰고, 베어링 압입 시 전동체에 하중이 전달되지 않게 하는 원칙을 설명하시오.",
    modelAnswer:
      "조립도와 공정순서, 부품 방향·청결, 끼워맞춤과 베어링 압입부, 볼트 체결·풀림방지, 간극·엔드플레이, 축정렬, 윤활상태와 수동회전을 확인한다. 베어링은 축에 끼울 때 내륜, 하우징에 끼울 때 외륜에 압입력을 가하고 전동체를 통해 힘을 전달하지 않는다.",
    answerDefinition:
      "방향·청결·끼워맞춤·체결·간극·정렬·윤활을 시운전 전에 확인한다.",
    memoryTip: "끼우는 링에만 힘을 건다.",
    rubricLabels: [
      "조립도·방향·청결",
      "끼워맞춤·체결",
      "간극·정렬·윤활",
      "베어링 압입력 적용링 원칙",
    ],
  },
  {
    candidateId: "NCS-CAND-DYNAMIC-CHECK",
    conceptId: "PCON-NCS-DYNAMIC-CHECK",
    subjectLabel: "subject-4",
    groupLabel: "s4-g06",
    studyTypeIds: ["procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "work_procedure",
    examFormat: "sequence",
    formatLabel: "구동장치 최초 시운전",
    definition:
      "구동장치 동작검사는 조립 후 무부하·저속에서 회전방향과 소음·진동·온도·누설·전류를 확인하고 기준과 비교하는 시운전이다.",
    background:
      "소형장치는 수동회전으로 걸림을 먼저 확인하고, 대형장치는 무부하로 짧게 기동해 회전상태와 간섭을 확인한 뒤 단계적으로 운전한다.",
    components: [
      "수동회전·무부하·저속",
      "회전방향",
      "이상음·진동",
      "베어링·하우징 온도",
      "오일·공기·유압 누설",
      "전동기 전류·체결상태",
    ],
    procedure: [
      "방호·윤활·체결·공구제거와 수동회전을 확인한다.",
      "무부하·저속 또는 짧은 기동으로 회전방향을 확인한다.",
      "이상음·진동·간섭·누설·전류를 확인한다.",
      "정해진 시간 동안 온도와 상태변화를 기록한다.",
      "이상 시 정지·에너지차단 후 원인을 수정하고 같은 조건으로 재시험한다.",
    ],
    diagnosis: ["진동과 발열 증가는 정렬불량·간섭·윤활불량·과도한 체결·베어링 손상 등을 의심한다."],
    safety: ["회전체 방호를 설치하고 이상 발생 시 측정하려고 접근하기보다 먼저 정지·격리한다."],
    traps: [
      "최초부터 정격부하·최고속도로 운전하지 않는다.",
      "이상음이 있어도 운전하며 체결부를 조정하지 않는다.",
    ],
    stem:
      "구동장치 최초 시운전의 점검순서를 쓰고, 시운전 중 진동과 발열이 증가할 때의 우선조치와 원인 후보를 쓰시오.",
    modelAnswer:
      "방호·윤활·체결과 수동회전을 확인한 뒤 무부하·저속으로 시작해 회전방향, 이상음·진동, 온도, 누설, 전류와 체결상태를 확인·기록한다. 진동과 발열이 증가하면 즉시 정지하고 에너지를 차단한 뒤 축정렬, 간섭, 윤활상태, 베어링 손상과 체결상태를 점검·수정하고 같은 조건으로 재시험한다.",
    answerDefinition:
      "무부하·저속으로 시작해 방향-음·진동-온도-누설-전류를 본다.",
    memoryTip: "무저방음진온누전.",
    rubricLabels: [
      "방호·윤활·수동회전",
      "무부하·저속과 회전방향",
      "소음·진동·온도·누설·전류",
      "이상 시 정지·차단·원인수정·재시험",
    ],
  },
  {
    candidateId: "NCS-CAND-WELD-VERTICAL",
    conceptId: "PCON-NCS-WELD-VERTICAL",
    subjectLabel: "subject-2",
    groupLabel: "s2-g02",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "theory_concept",
    examFormat: "definition",
    formatLabel: "수직 자세 용접조건",
    definition:
      "수직 자세 맞대기용접은 용접선이 수직으로 놓인 상태에서 중력에 의한 용융지 처짐을 제어하며 수행하는 맞대기용접이다.",
    background:
      "WPS에서 모재·이음·용접재료·극성·자세·패스·예열과 층간조건을 확인하고, 아크길이·봉각도·운봉폭·속도를 조절해 용융지를 지지한다.",
    components: [
      "WPS와 자세·진행방향",
      "모재·이음·용접봉·극성",
      "루트·충전·마감 패스",
      "아크길이·봉각도·운봉·속도",
      "층간청소와 온도관리",
    ],
    procedure: [
      "WPS의 재료·이음·자세·전기조건을 확인한다.",
      "모재를 고정하고 루트간격·가용접 상태를 확인한다.",
      "짧고 안정된 아크와 적절한 봉각도·운봉으로 용융지를 제어한다.",
      "각 패스 후 슬래그를 제거하고 층간조건을 확인한다.",
      "외관과 요구검사를 수행한다.",
    ],
    diagnosis: ["용융지 처짐·오버랩은 과도한 용융지, 부적절한 각도·운봉·속도를 점검한다."],
    safety: ["구체 전류·예열·층간온도는 모재·두께·용접봉과 적용 WPS를 따른다."],
    traps: [
      "아래보기 조건의 전류·운봉을 수직자세에 그대로 적용하지 않는다.",
      "용융지 처짐을 막기 위해 아크를 과도하게 길게 하지 않는다.",
    ],
    stem:
      "수직 자세 맞대기용접 전에 WPS에서 확인할 항목 6가지를 쓰고, 용융지 처짐을 줄이기 위해 조정할 요소를 쓰시오.",
    modelAnswer:
      "WPS에서 모재·두께, 이음형상과 루트조건, 용접봉·지름, 전원·극성, 자세와 진행방향, 패스순서, 예열·층간·후처리 조건을 확인한다. 용융지 처짐을 줄이려면 짧고 안정된 아크를 유지하고 봉각도, 운봉폭, 용접속도와 한 번에 만드는 용융지 크기를 조정하며 패스간 청소를 한다. 구체 수치는 WPS를 따른다.",
    answerDefinition:
      "수직 자세는 WPS를 확인하고 아크·각도·운봉·속도로 용융지 처짐을 제어한다.",
    memoryTip: "수직은 용융지를 작고 안정되게 지지한다.",
    rubricLabels: [
      "모재·이음·용접재료",
      "전원·극성·자세·패스",
      "예열·층간·후처리의 WPS 조건",
      "아크·봉각도·운봉·속도 조정",
    ],
  },
  {
    candidateId: "NCS-CAND-WELD-HORIZONTAL",
    conceptId: "PCON-NCS-WELD-HORIZONTAL",
    subjectLabel: "subject-2",
    groupLabel: "s2-g02",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "theory_concept",
    examFormat: "definition",
    formatLabel: "수평 자세 용접조건",
    definition:
      "수평 자세 맞대기용접은 용접축이 수평이고 용접면이 수직에 가까운 상태에서 아래쪽으로 쏠리는 용융금속을 제어하며 수행하는 용접이다.",
    background:
      "봉각도·운봉폭·속도와 패스배치를 조절해 상부 언더컷과 하부 오버랩·처짐을 예방한다. 작업조건은 WPS, 절차의 적정성은 PQR, 작업자 자격은 WPQ로 구분한다.",
    components: [
      "WPS 작업 용접조건",
      "PQR 절차인정 시험기록",
      "WPQ 용접사 자격기록",
      "봉각도·운봉폭·속도",
      "상부 언더컷·하부 오버랩",
    ],
    procedure: [
      "WPS의 이음·재료·자세와 전기조건을 확인한다.",
      "모재를 수평자세로 고정하고 가용접·루트상태를 확인한다.",
      "중력 방향을 고려해 봉각도·운봉폭·속도를 조절한다.",
      "패스간 슬래그를 제거하고 상·하부 비드형상을 확인한다.",
      "외관과 요구검사를 수행한다.",
    ],
    diagnosis: ["상부 언더컷은 아크·각도·속도를, 하부 오버랩은 용융지 과대와 진행속도를 확인한다."],
    safety: ["용접조건 수치는 적용 WPS를 따르고 작업물 고정·환기·화재방호를 확인한다."],
    traps: [
      "WPS·PQR·WPQ를 모두 같은 작업지시서라고 쓰지 않는다.",
      "비드 쏠림을 전류 하나만으로 조정하지 않는다.",
    ],
    stem:
      "수평 자세 용접에서 비드 쏠림을 줄이는 조정요소를 쓰고, WPS·PQR·WPQ의 역할을 각각 구분하시오.",
    modelAnswer:
      "수평 자세에서는 봉각도, 운봉폭, 용접속도, 패스배치와 용융지 크기를 조정하고 패스간 슬래그를 제거해 상부 언더컷과 하부 오버랩을 줄인다. WPS는 실제 작업에 적용할 용접조건을 정한 절차서, PQR은 그 절차가 적정함을 시험·기록한 절차인정 기록, WPQ는 용접사의 해당 작업 자격을 확인한 기록이다.",
    answerDefinition:
      "수평 자세는 중력에 따른 비드 쏠림을 각도·운봉·속도·패스로 제어한다.",
    memoryTip: "WPS는 방법, PQR은 방법검증, WPQ는 사람검증.",
    rubricLabels: [
      "봉각도·운봉폭·속도·패스",
      "WPS 역할",
      "PQR 역할",
      "WPQ 역할",
    ],
  },
  {
    candidateId: "NCS-CAND-WELD-OVERHEAD",
    conceptId: "PCON-NCS-WELD-OVERHEAD",
    subjectLabel: "subject-2",
    groupLabel: "s2-g02",
    studyTypeIds: ["definition", "procedure", "diagnosis_safety"],
    primaryStudyCategoryId: "theory_concept",
    examFormat: "definition",
    formatLabel: "위보기 자세 용접조건",
    definition:
      "위보기 자세 맞대기용접은 작업자 위쪽의 이음부를 용접하면서 중력에 의한 용융금속 낙하와 전기·화상 위험을 통제하는 용접이다.",
    background:
      "짧고 안정된 아크와 과도하지 않은 용융지 크기로 낙하를 줄이고, 얼굴·목·상체 보호와 절연·상부 낙하구역 통제가 중요하다. 구체 조건은 WPS를 따른다.",
    components: [
      "WPS와 위보기 자세기호",
      "짧은 아크·작은 용융지",
      "봉각도·운봉·속도",
      "용접면·보호복·장갑·목 보호",
      "절연·환기·낙하구역 통제",
    ],
    procedure: [
      "WPS와 이음·재료·자세·전기조건을 확인한다.",
      "작업발판·모재고정·절연과 낙하구역을 점검한다.",
      "얼굴·목·상체를 포함한 보호구를 착용한다.",
      "짧은 아크와 작은 용융지를 유지하며 패스한다.",
      "층간청소 후 외관과 요구검사를 수행한다.",
    ],
    diagnosis: ["용락·낙하는 과도한 용융지·긴 아크·부적절한 속도와 이음조건을 확인한다."],
    safety: ["젖은 장소·손상 케이블을 피하고 상부 용융금속의 낙하범위에 사람과 가연물이 없게 한다."],
    traps: [
      "위보기에서 큰 용융지를 한 번에 만들지 않는다.",
      "얼굴만 가리고 목·몸통·주변 낙하구역 보호를 생략하지 않는다.",
    ],
    stem:
      "위보기 자세 용접의 주요 위험 3가지와 보호조치를 쓰고, 아크길이와 용융지 크기를 작게 관리하는 이유를 설명하시오.",
    modelAnswer:
      "주요 위험은 용융금속·슬래그 낙하에 의한 화상, 아크광과 흄 노출, 케이블·홀더에 의한 감전 및 화재이다. 용접면·장갑·보호복과 목·상체 보호, 절연상태·환기·가연물 제거, 낙하구역 통제를 실시한다. 짧고 안정된 아크와 과도하지 않은 용융지를 유지하면 중력에 의한 용락·낙하와 비드 불안을 줄일 수 있다. 구체 전류·온도는 WPS를 따른다.",
    answerDefinition:
      "위보기는 짧은 아크·작은 용융지와 낙하·절연 방호가 핵심이다.",
    memoryTip: "위보기는 위에서 떨어지는 열과 전기를 함께 막는다.",
    rubricLabels: [
      "낙하·화상 위험과 보호",
      "아크광·흄·감전·화재 방호",
      "짧은 아크의 이유",
      "작은 용융지와 WPS 조건",
    ],
  },
];

const candidateById = new Map(
  PRACTICAL_NCS_UNIT_CANDIDATES.map((candidate) => [candidate.id, candidate]),
);
const unitByKey = new Map(
  PRACTICAL_NCS_UNIT_REGISTRY.map((unit) => [
    `${unit.ncsCode}:${unit.unitId}`,
    unit,
  ]),
);

function candidateFor(editorial: ReinforcementEditorial) {
  const candidate = candidateById.get(editorial.candidateId);
  if (!candidate) {
    throw new Error(`NCS 보강 후보가 없습니다: ${editorial.candidateId}`);
  }
  return candidate;
}

function sourceFor(editorial: ReinforcementEditorial) {
  const candidate = candidateFor(editorial);
  const unit = unitByKey.get(`${candidate.ncsCode}:${candidate.unitId}`);
  if (!unit) {
    throw new Error(
      `NCS 보강 학습단위가 없습니다: ${candidate.ncsCode}:${candidate.unitId}`,
    );
  }
  const registry =
    NCS_SOURCE_REGISTRY[
      candidate.ncsCode as keyof typeof NCS_SOURCE_REGISTRY
    ];
  if (!registry) {
    throw new Error(`NCS 출처 레지스트리가 없습니다: ${candidate.ncsCode}`);
  }
  return {
    sourceKind: "ncs" as const,
    ncsCode: candidate.ncsCode,
    documentTitle: registry.title,
    version: registry.version,
    pdfPage: null,
    printedPage: unit.printedPageStart,
    figureNumber: null,
    performanceCriteria: `${unit.unitId} ${unit.title}: ${candidate.title}의 정의·판단·작업절차`,
    sourceFileHash: registry.hash,
    sourceUrl: registry.sourceUrl,
  };
}

export const PRACTICAL_NCS_UNIT_REINFORCEMENT_CONCEPTS: PracticalConcept[] =
  EDITORIAL.map((editorial) => {
    const candidate = candidateFor(editorial);
    const source = sourceFor(editorial);
    return {
      id: editorial.conceptId,
      title: candidate.title,
      contentRole: "supplemental",
      labels: [],
      subjectLabel: editorial.subjectLabel,
      groupLabel: editorial.groupLabel,
      learningGoals: [
        `${candidate.title}의 핵심 원리와 필수 답안어를 설명한다.`,
        `${candidate.title}의 선정·점검·작업순서를 필답형 답안으로 구성한다.`,
      ],
      definition: editorial.definition,
      principle: `${candidate.memoryCapsule} ${editorial.background}`,
      components: editorial.components,
      procedure: editorial.procedure,
      formula: [],
      diagnosis: editorial.diagnosis,
      safety: editorial.safety,
      examFormats: candidate.predictedPromptSeeds,
      requiredKeywords: candidate.requiredKeywords,
      traps: editorial.traps,
      relatedPastQuestionIds: [],
      relatedPredictedQuestionIds: [],
      existingLessonId: null,
      theoryTreatment: "NCS 세부학습단위 직접 보강 레슨 (+NCS 보강)",
      visualAidIds: [],
      ncsSources: [source],
      ncsLearningPoints: [candidate.memoryCapsule, editorial.background],
      sourceReviewNote:
        `NCS ${candidate.ncsCode} 인쇄 ${source.printedPage}쪽에서 시작하는 ${candidate.unitId} 학습단위를 직접 대조했다. ` +
        "문제는 NCS 원문을 그대로 복제하지 않고 텍스트만으로 답안조건이 완결되도록 자체 구성했다. 법령·표준·제조사·WPS별 수치는 고정 답안으로 사용하지 않는다.",
      contentStatus: "published",
    };
  });

export const PRACTICAL_NCS_UNIT_QUESTION_EDITORIAL_BY_CONCEPT_ID: Readonly<
  Record<string, PracticalNcsUnitQuestionEditorial>
> = Object.fromEntries(
  EDITORIAL.map((editorial) => [
    editorial.conceptId,
    {
      primaryStudyCategoryId: editorial.primaryStudyCategoryId,
      examFormat: editorial.examFormat,
      formatLabel: editorial.formatLabel,
      stem: editorial.stem,
      modelAnswer: editorial.modelAnswer,
      answerDefinition: editorial.answerDefinition,
      memoryTip: editorial.memoryTip,
      rubricLabels: editorial.rubricLabels,
    },
  ]),
);

export const PRACTICAL_NCS_UNIT_PROMOTIONS = EDITORIAL.map((editorial) => {
  const candidate = candidateFor(editorial);
  return {
    candidateId: candidate.id,
    ncsCode: candidate.ncsCode,
    unitId: candidate.unitId,
    conceptId: editorial.conceptId,
    questionId: `EXP-${editorial.conceptId.replace("PCON-", "")}`,
    publicationStatus: "published" as const,
    evidenceStatus: "ncs_supplement" as const,
  };
});

export const PRACTICAL_NCS_UNIT_TEXTBOOK_PLACEMENTS = Object.fromEntries(
  EDITORIAL.map((editorial) => [
    editorial.conceptId,
    {
      subjectId: editorial.subjectLabel,
      studyTypeIds: editorial.studyTypeIds,
      sourceEvidence: "direct" as const,
    },
  ]),
);

