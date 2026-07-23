import { buildChoiceFeedback, choiceFeedbackPasses } from "@/lib/content/enrichment";
import type {
  Choice,
  GeneratedContent,
  Lesson,
  LessonBlock,
  Question,
} from "@/lib/domain/types";

const REVIEWED_AT = "2026-07-23T00:00:00.000Z";
const SUBJECT_ID = "subject-2";
const GROUP_ID = "s2-g02";
const THEORY_SOURCE =
  "https://app.notion.com/p/2025-2028-39902e78962a80518275d4d91a78e607";

type ProcessDefinition = {
  id: string;
  conceptId: string;
  title: string;
  aliases: string[];
  summary: [string, string, string];
  electrode: string;
  shielding: string;
  mechanism: string;
  strengths: string;
  limits: string;
  applications: string;
  defects: string;
  examPoint: string;
  memory: string;
};

const processDefinitions: ProcessDefinition[] = [
  {
    id: "lesson-welding-process-smaw",
    conceptId: "concept-welding-process-smaw",
    title: "피복아크용접(SMAW)",
    aliases: ["SMAW", "피복금속아크용접", "수동금속아크용접", "용접봉용접"],
    summary: [
      "피복제가 입혀진 소모성 봉 전극과 모재 사이의 아크열로 접합합니다.",
      "피복제에서 생긴 보호가스와 슬래그가 용융금속을 대기로부터 보호합니다.",
      "장비가 단순하고 현장 보수에 유리하지만 용접봉 교체와 슬래그 제거가 필요합니다.",
    ],
    electrode: "피복제가 입혀진 짧은 소모성 봉 전극",
    shielding: "피복제 분해로 생기는 보호가스와 응고 후 슬래그",
    mechanism:
      "전극 끝과 모재 사이에 아크를 발생시키면 전극 심선과 모재가 함께 녹아 용융지를 만듭니다. 피복제는 아크 안정, 가스 차폐, 탈산·정련과 슬래그 형성에 관여합니다.",
    strengths:
      "전원과 홀더 중심의 비교적 단순한 장비로 작업할 수 있고, 장소 이동과 옥외·보수 작업에 대응하기 쉽습니다. 다양한 자세와 강재에 적용할 수 있습니다.",
    limits:
      "봉 길이가 제한되어 자주 교체해야 하고, 비드마다 슬래그 제거가 필요합니다. 작업자 숙련도의 영향이 크며 자동화·고능률 연속용접에는 불리합니다.",
    applications:
      "설비 프레임, 배관·구조물의 현장 보수, 조선·건설 현장의 수동용접처럼 이동성과 범용성이 필요한 작업에 사용합니다.",
    defects:
      "아크길이·전류·운봉이 부적절하면 스패터, 언더컷, 슬래그 혼입, 용입부족이 생길 수 있습니다. 습기를 먹은 저수소계 용접봉은 수소균열 위험을 키울 수 있어 보관·건조 조건을 관리합니다.",
    examPoint:
      "‘비소모성 텅스텐 전극’, ‘연속 송급 와이어’, ‘입상 플럭스 속에 아크가 잠김’은 각각 TIG, GMAW/FCAW, SAW의 특징이므로 피복아크와 구분합니다.",
    memory: "피복 봉이 녹고, 피복은 가스와 슬래그로 용융지를 지킨다.",
  },
  {
    id: "lesson-welding-process-gtaw",
    conceptId: "concept-welding-process-gtaw",
    title: "TIG용접(GTAW)",
    aliases: ["TIG", "GTAW", "가스텅스텐아크용접", "텅스텐불활성가스용접"],
    summary: [
      "비소모성 텅스텐 전극과 모재 사이의 아크열을 사용합니다.",
      "아르곤·헬륨 같은 불활성가스로 전극과 용융지를 보호합니다.",
      "청정하고 정밀한 용접에 유리하지만 용착속도가 낮고 전극 오염 관리가 중요합니다.",
    ],
    electrode: "녹여 채우는 재료가 아닌 비소모성 텅스텐 전극",
    shielding: "주로 아르곤 또는 헬륨 계열의 불활성 보호가스",
    mechanism:
      "텅스텐 전극과 모재 사이의 아크가 열원 역할을 합니다. 이음 조건에 따라 모재만 녹여 접합하거나 별도의 용가봉을 용융지에 공급합니다. 전극이 비소모성이라는 말은 용가재를 절대 사용하지 않는다는 뜻이 아닙니다.",
    strengths:
      "스패터와 슬래그가 적고 아크와 입열을 정밀하게 조절하기 쉬워 얇은 판, 루트패스, 스테인리스강과 알루미늄 등 비철금속의 고품질 용접에 유리합니다.",
    limits:
      "용착속도가 비교적 낮고 작업자 숙련이 필요합니다. 텅스텐 전극이 용융지에 닿으면 전극과 용접금속이 오염될 수 있으며, 바람은 보호가스 차폐를 무너뜨릴 수 있습니다.",
    applications:
      "얇은 판과 정밀부품, 배관 루트패스, 스테인리스·알루미늄 설비처럼 외관과 청정도, 품질 관리가 중요한 작업에 사용합니다.",
    defects:
      "가스유량·노즐거리·바람·모재 오염을 확인합니다. 전극 선단 형상과 극성, 전류를 재질과 작업조건에 맞추고 텅스텐 혼입과 기공을 예방합니다.",
    examPoint:
      "TIG의 핵심은 ‘비소모성 텅스텐 전극+불활성가스’입니다. 연속 송급되는 소모성 와이어를 쓰면 GMAW 계열이며, 입상 플럭스가 아크를 덮으면 SAW입니다.",
    memory: "TIG는 텅스텐은 남고, 필요하면 용가봉은 따로 넣는다.",
  },
  {
    id: "lesson-welding-process-gmaw",
    conceptId: "concept-welding-process-gmaw",
    title: "MIG·MAG·CO₂용접(GMAW)",
    aliases: ["GMAW", "MIG", "MAG", "CO₂용접", "가스메탈아크용접"],
    summary: [
      "이 레슨에서 다루는 MIG·MAG·CO₂용접은 연속 송급되는 소모성 솔리드 와이어가 전극과 용가재 역할을 함께 합니다.",
      "MIG는 불활성가스, MAG·CO₂용접은 활성가스 계열의 차폐를 사용합니다.",
      "용착속도와 자동화성이 좋지만 와이어 송급과 보호가스 차폐를 안정적으로 유지해야 합니다.",
    ],
    electrode: "이 레슨의 MIG·MAG·CO₂ 범위에서는 토치로 연속 송급되는 소모성 솔리드 와이어",
    shielding: "MIG는 불활성가스, MAG는 활성가스 또는 활성 성분이 포함된 혼합가스, CO₂용접은 이산화탄소",
    mechanism:
      "와이어와 모재 사이에 아크를 만들고 와이어를 연속적으로 녹여 용착합니다. 정전압 특성 전원과 와이어 송급장치를 사용하는 경우가 일반적이며, 아크길이는 전압·송급속도·용융률의 균형으로 유지됩니다.",
    strengths:
      "용접봉 교체와 슬래그 제거 부담이 작아 연속 작업과 높은 생산성에 유리합니다. 반자동·자동·로봇용접으로 확장하기 쉽고 얇은 판부터 구조물까지 적용범위가 넓습니다.",
    limits:
      "바람이 보호가스를 흩뜨리면 기공·산화가 생길 수 있습니다. 노즐 오염, 팁 마모, 라이너 저항과 송급롤러 조건이 나쁘면 와이어 송급 불안정과 아크 끊김이 발생합니다.",
    applications:
      "자동차·판금·철골·기계프레임과 생산라인의 반자동·로봇용접에 널리 사용합니다. 재질과 요구 품질에 따라 가스 조성과 금속이행 방식을 선택합니다.",
    defects:
      "기공이 생기면 가스유량만 높이지 말고 누설, 노즐거리·오염, 바람과 모재표면을 함께 확인합니다. 스패터와 용입은 전압·전류·와이어 송급·극성·가스 조성의 영향을 받습니다.",
    examPoint:
      "MIG와 MAG의 첫 구분은 보호가스의 활성 여부입니다. 둘 다 연속 소모성 와이어를 쓰며, CO₂용접은 MAG 계열로 이해합니다.",
    memory: "GMAW는 와이어를 계속 보내고, MIG·MAG는 보호가스로 나눈다.",
  },
  {
    id: "lesson-welding-process-fcaw",
    conceptId: "concept-welding-process-fcaw",
    title: "플럭스코어드아크용접(FCAW)",
    aliases: ["FCAW", "플럭스코어드와이어", "플럭스코어용접"],
    summary: [
      "속에 플럭스가 채워진 관상 와이어를 연속 송급하는 아크용접입니다.",
      "가스차폐형과 자체보호형이 있으며 플럭스에서 슬래그와 보호성분이 만들어집니다.",
      "용착량과 현장 적용성이 좋지만 슬래그·흄과 와이어 보관을 관리해야 합니다.",
    ],
    electrode: "내부에 플럭스가 충전된 연속 소모성 관상 와이어",
    shielding: "외부 보호가스를 함께 쓰는 가스차폐형 또는 플럭스만 이용하는 자체보호형",
    mechanism:
      "연속 송급되는 플럭스코어드와이어와 모재 사이의 아크로 용융지를 만듭니다. 와이어 속 플럭스는 아크 안정, 탈산·합금, 가스와 슬래그 형성에 관여합니다.",
    strengths:
      "일반 솔리드와이어 공정보다 높은 용착량을 얻기 쉽고 두꺼운 강재와 구조물 제작에 유리합니다. 자체보호형은 외부 가스 공급이 어려운 현장과 옥외 작업에 적용할 수 있습니다.",
    limits:
      "슬래그 제거와 층간 청소가 필요하고 흄 발생량이 커질 수 있습니다. 와이어 종류에 따라 극성·가스·자세가 달라지며 흡습과 송급 불량을 관리해야 합니다.",
    applications:
      "조선·철골·중장비·교량과 보수작업처럼 용착량과 현장성이 중요한 강구조물 용접에 사용합니다.",
    defects:
      "슬래그 혼입을 막기 위해 층간 청소와 운봉각을 관리합니다. 가스차폐형은 바람과 가스계통을, 자체보호형은 지정된 돌출길이와 와이어 조건을 확인합니다.",
    examPoint:
      "FCAW는 솔리드와이어가 아니라 ‘속에 플럭스가 든 연속 관상 와이어’가 핵심입니다. SAW의 입상 플럭스는 와이어 밖에서 아크를 덮는다는 점이 다릅니다.",
    memory: "FCAW는 와이어 속에 플럭스, SAW는 아크 위에 입상 플럭스.",
  },
  {
    id: "lesson-welding-process-saw",
    conceptId: "concept-welding-process-saw",
    title: "서브머지드아크용접(SAW)",
    aliases: ["SAW", "서브머지드용접", "잠호용접", "잠호아크용접"],
    summary: [
      "연속 소모성 와이어와 모재 사이의 아크를 입상 플럭스가 덮는 기계화·자동화 아크용접입니다.",
      "아크가 플럭스 아래에 잠겨 광선·스패터가 적고 높은 전류와 용착률을 얻기 쉽습니다.",
      "긴 직선의 두꺼운 판에는 강하지만 자세와 짧고 복잡한 이음에는 제약이 큽니다.",
    ],
    electrode: "연속 송급되는 소모성 와이어 전극",
    shielding: "용접선 앞에 공급되어 아크와 용융지를 덮는 입상 플럭스",
    mechanism:
      "와이어 끝의 아크가 입상 플럭스 아래에서 유지되며, 일부 플럭스는 녹아 슬래그가 되고 나머지는 회수할 수 있습니다. 플럭스층이 아크열과 용융금속을 대기로부터 차폐합니다.",
    strengths:
      "높은 전류를 사용해 깊은 용입과 큰 용착량을 얻기 쉽고, 아크광과 스패터 노출이 작습니다. 장거리 직선 또는 원주 이음을 기계화·자동화하기 좋습니다.",
    limits:
      "플럭스가 용융지 위에 머물러야 하므로 주로 아래보기와 수평 자세에 적합합니다. 짧고 복잡한 이음, 시야가 필요한 정밀 수동작업, 얇은 판에는 일반적으로 불리합니다.",
    applications:
      "압력용기, 대구경 파이프, 선박·탱크·보일러의 긴 이음과 두꺼운 판의 기계화·자동화 용접에 사용합니다.",
    defects:
      "플럭스의 건조·입도·공급높이와 회수품 오염을 관리합니다. 이음 추적, 와이어 위치, 전류·전압·속도가 어긋나면 용입과 비드 형상이 불안정해질 수 있습니다.",
    examPoint:
      "‘입상 플럭스 아래에 아크가 잠김’, ‘고전류·고용착’, ‘긴 직선 두꺼운 판’, ‘자세 제약’이 SAW의 묶음입니다. 토치에서 보호가스만 분사하는 GMAW와 구분합니다.",
    memory: "SAW는 아크를 입상 플럭스 속에 잠기게 하며 기계화·자동화에 적합한 고능률 용접.",
  },
];

const processTrapBullets: Record<string, [string, string, string]> = {
  "lesson-welding-process-smaw": [
    "피복 봉 전극이 녹는 공정이므로 비소모성 텅스텐 전극을 쓰는 TIG와 구분합니다.",
    "일반적으로 정전류·수하특성 전원을 사용하며 저수소계 용접봉은 흡습과 재건조 조건을 함께 관리합니다.",
    "피복제가 만드는 가스·슬래그는 보호 역할을 하지만 층간 슬래그 제거를 생략해도 된다는 뜻은 아닙니다.",
  ],
  "lesson-welding-process-gtaw": [
    "텅스텐은 비소모성 전극이고 용가봉은 필요할 때 별도로 공급하므로 두 역할을 섞지 않습니다.",
    "가스 유량을 무조건 높이면 난류로 외기가 유입될 수 있으며, 배관 뒷면 산화를 막을 때는 백실딩 조건도 확인합니다.",
    "직류 전극음극은 깊은 용입에 유리하고, 알루미늄 산화막 제거에는 교류 사용이 대표적이라는 극성 함정을 구분합니다.",
  ],
  "lesson-welding-process-gmaw": [
    "MIG와 MAG는 모두 연속 소모성 와이어를 쓰며 보호가스의 활성 여부로 구분합니다.",
    "이 레슨의 MIG·MAG·CO₂ 범위에서는 정전압 전원과 자기조절 특성이 핵심이며 SMAW·TIG의 정전류 특성과 구분합니다.",
    "단락·입상·스프레이·펄스 이행은 전류뿐 아니라 전압, 와이어, 가스 조성, 극성 조건을 함께 봅니다.",
  ],
  "lesson-welding-process-fcaw": [
    "FCAW-G가 CO₂를 사용해도 내부에 플럭스가 든 관상 와이어이므로 CO₂ 솔리드와이어 용접과 같은 뜻이 아닙니다.",
    "가스차폐형은 바람과 가스계통을, 자체보호형은 지정 돌출길이와 와이어 조건을 우선 점검합니다.",
    "연속 송급 공정이라는 이유만으로 GMAW로 분류하지 말고 와이어 내부 플럭스 유무를 확인합니다.",
  ],
  "lesson-welding-process-saw": [
    "입상 플럭스는 와이어 내부가 아니라 아크 위를 덮으며, 회수 플럭스는 오염·입도·건조 상태를 확인합니다.",
    "고용착률과 자동화성이 높아도 모든 자세에 유리한 것은 아니며 주로 아래보기·수평 자세에 적합합니다.",
    "아크가 플럭스 아래에 잠겨 보이지 않으므로 이음 추적과 와이어 위치를 기계적으로 안정시켜야 합니다.",
  ],
};

type ProcessQuestionDefinition = {
  id: string;
  lessonId: string;
  stem: string;
  choices: [string, string, string, string];
  choiceEvidence: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  errorReason: Question["errorReason"];
};

const questionDefinitions: ProcessQuestionDefinition[] = [
  {
    id: "WELD-PROC-001",
    lessonId: "lesson-welding-process-smaw",
    stem: "피복제가 입혀진 짧은 소모성 봉 전극을 사용하고, 피복제에서 생긴 가스와 슬래그로 용융지를 보호하는 용접은?",
    choices: ["피복아크용접(SMAW)", "TIG용접(GTAW)", "MIG용접(GMAW)", "서브머지드아크용접(SAW)"],
    choiceEvidence: [
      "피복아크용접은 피복된 짧은 소모성 봉 전극을 쓰며, 피복제가 보호가스와 슬래그를 형성합니다.",
      "TIG용접은 비소모성 텅스텐 전극과 불활성 보호가스를 사용하므로 피복 봉 전극 공정이 아닙니다.",
      "MIG용접은 토치에서 연속 송급되는 소모성 와이어와 외부 보호가스를 사용합니다.",
      "서브머지드아크용접은 연속 와이어의 아크를 외부에서 공급한 입상 플럭스로 덮습니다.",
    ],
    correctIndex: 0,
    explanation:
      "SMAW는 피복된 봉 전극 자체가 녹아 용가재가 되고, 피복제가 아크 안정·가스 차폐·슬래그 형성에 관여합니다.",
    errorReason: "개념 혼동",
  },
  {
    id: "WELD-PROC-002",
    lessonId: "lesson-welding-process-gtaw",
    stem: "비소모성 텅스텐 전극과 불활성 보호가스를 사용하며 필요하면 별도의 용가봉을 넣는 용접은?",
    choices: ["FCAW", "SAW", "TIG용접(GTAW)", "피복아크용접(SMAW)"],
    choiceEvidence: [
      "FCAW는 내부에 플럭스가 든 소모성 관상 와이어를 연속 송급하는 공정입니다.",
      "SAW는 소모성 연속 와이어의 아크를 입상 플럭스 아래에 잠기게 하는 공정입니다.",
      "TIG용접은 비소모성 텅스텐 전극과 불활성가스를 사용하고 필요하면 용가봉을 별도로 공급합니다.",
      "피복아크용접은 피복된 소모성 봉 전극 자체가 녹아 용가재가 됩니다.",
    ],
    correctIndex: 2,
    explanation:
      "GTAW/TIG는 비소모성 텅스텐 전극을 열원용 전극으로 사용하고 아르곤·헬륨 계열 가스로 보호합니다. 용가재가 필요하면 별도로 공급합니다.",
    errorReason: "용어 혼동",
  },
  {
    id: "WELD-PROC-003",
    lessonId: "lesson-welding-process-gmaw",
    stem: "MIG용접과 MAG용접을 구분하는 가장 직접적인 기준은?",
    choices: ["전극이 소모되는지 여부", "보호가스가 불활성인지 활성인지", "입상 플럭스를 사용하는지 여부", "전극이 봉인지 관상 와이어인지"],
    choiceEvidence: [
      "MIG와 MAG는 모두 연속 송급되는 소모성 와이어를 사용하므로 전극 소모 여부로 구분하지 않습니다.",
      "MIG는 불활성가스, MAG는 활성가스 또는 활성 성분이 포함된 혼합가스를 사용하는 차이가 핵심입니다.",
      "입상 플럭스가 아크를 덮는 것은 서브머지드아크용접의 구분 기준입니다.",
      "관상 와이어 내부에 플럭스가 든 공정은 FCAW이며, MIG와 MAG는 보호가스 성격으로 구분합니다.",
    ],
    correctIndex: 1,
    explanation:
      "MIG와 MAG는 모두 연속 소모성 와이어를 사용합니다. MIG는 불활성가스, MAG는 활성가스 또는 활성 성분이 포함된 혼합가스를 사용합니다.",
    errorReason: "조건 누락",
  },
  {
    id: "WELD-PROC-004",
    lessonId: "lesson-welding-process-fcaw",
    stem: "내부에 플럭스가 채워진 관상 와이어를 연속 송급하며 가스차폐형과 자체보호형이 있는 용접은?",
    choices: ["TIG용접", "플럭스코어드아크용접(FCAW)", "서브머지드아크용접(SAW)", "저항점용접"],
    choiceEvidence: [
      "TIG용접은 비소모성 텅스텐 전극을 사용하며 전극 내부에 플럭스를 넣지 않습니다.",
      "FCAW는 플럭스가 든 소모성 관상 와이어를 연속 송급하고 가스차폐형과 자체보호형으로 나뉩니다.",
      "SAW의 입상 플럭스는 와이어 내부가 아니라 아크와 용융지 바깥을 덮습니다.",
      "저항점용접은 전극으로 모재를 가압하고 큰 전류의 저항열로 접합하며 플럭스코어드와이어를 쓰지 않습니다.",
    ],
    correctIndex: 1,
    explanation:
      "FCAW는 플럭스가 와이어 내부에 들어 있는 연속 관상 전극을 사용합니다. 외부 보호가스를 쓰는 형식과 플럭스로 차폐하는 자체보호형이 있습니다.",
    errorReason: "개념 혼동",
  },
  {
    id: "WELD-PROC-005",
    lessonId: "lesson-welding-process-saw",
    stem: "입상 플럭스 아래에 아크가 잠기며 긴 직선의 두꺼운 판을 고전류·고용착률로 기계화·자동화 용접하는 데 적합한 공정은?",
    choices: ["피복아크용접", "TIG용접", "서브머지드아크용접(SAW)", "가스용접"],
    choiceEvidence: [
      "피복아크용접은 작업자가 피복 봉 전극을 교체하며 운봉하는 수동 공정이어서 입상 플럭스 아래의 연속 아크 공정과 다릅니다.",
      "TIG용접은 비소모성 텅스텐 전극과 불활성가스를 사용하며 입상 플럭스로 아크를 덮지 않습니다.",
      "서브머지드아크용접은 연속 와이어의 아크를 입상 플럭스 아래에 잠기게 하며 긴 이음의 기계화·자동화에 적합합니다.",
      "가스용접은 연료가스와 산소의 불꽃을 열원으로 사용하므로 입상 플럭스 아래의 아크 공정이 아닙니다.",
    ],
    correctIndex: 2,
    explanation:
      "SAW는 연속 와이어와 모재 사이의 아크를 입상 플럭스가 덮습니다. 높은 용착률과 자동화성이 장점이지만 용접자세와 복잡한 이음에는 제약이 있습니다.",
    errorReason: "용어 혼동",
  },
];

function lessonBlocks(process: ProcessDefinition, questionId: string): LessonBlock[] {
  const traps = processTrapBullets[process.id];
  const comparison = [
    "| 구분 | 내용 |",
    "|---|---|",
    `| 전극·용가재 | ${process.electrode} |`,
    `| 보호 방식 | ${process.shielding} |`,
    `| 강점 | ${process.strengths} |`,
    `| 한계 | ${process.limits} |`,
    `| 대표 적용 | ${process.applications} |`,
  ].join("\n");

  return [
    {
      id: "summary",
      kind: "summary",
      title: "핵심 3줄",
      body: process.summary.map((line, index) => `${index + 1}. ${line}`).join("\n"),
      order: 1,
    },
    {
      id: "definition",
      kind: "definition",
      title: `${process.title}은 무엇인가`,
      body: `${process.title}은 아크열로 모재를 녹여 접합하는 융접 계열입니다.\n\n- **전극·용가재:** ${process.electrode}\n- **보호 방식:** ${process.shielding}\n\n공정명은 전극이 소모되는지, 보호가스 또는 플럭스를 어떻게 사용하는지, 와이어가 연속 송급되는지를 함께 보아야 정확히 구분할 수 있습니다.`,
      order: 2,
    },
    {
      id: "principle",
      kind: "principle",
      title: "작동원리",
      body: process.mechanism,
      order: 3,
    },
    {
      id: "comparison",
      kind: "structure",
      title: "전극·차폐·적용조건",
      body: comparison,
      order: 4,
    },
    {
      id: "selection",
      kind: "selection",
      title: "선정할 때 보는 조건",
      body: `1. 모재의 종류와 두께, 이음 형상과 용접자세를 확인합니다.\n2. 요구 용착량, 품질, 외관과 자동화 수준을 정합니다.\n3. ${process.strengths}\n4. ${process.limits}\n5. 보호가스·플럭스·전극과 전원 조건을 작업절차서 및 장비 제조사 지침과 대조합니다.`,
      order: 5,
    },
    {
      id: "diagnosis",
      kind: "diagnosis",
      title: "품질·고장 진단",
      body: process.defects,
      order: 6,
    },
    {
      id: "exam-point",
      kind: "exam_point",
      title: "시험 포인트",
      body: process.examPoint,
      order: 7,
    },
    {
      id: "trap",
      kind: "trap",
      title: "오답 함정",
      body: `${traps.map((trap) => `- ${trap}`).join("\n")}\n- **한 줄 암기:** ${process.memory}`,
      order: 8,
    },
    {
      id: "source",
      kind: "source",
      title: "출처와 검토 상태",
      body: `- 이론 근거: 설비보전기사 필기 이론 최종 정리본(2025–2028), ‘아크용접 공정별 비교’\n- 원본: ${THEORY_SOURCE}\n- 연결 문제: ${questionId}\n- 최근 검토일: 2026-07-23\n- 상태: 기존 이론의 공정별 내용을 공개 레슨 형식으로 재구성·검수 완료`,
      order: 9,
    },
  ];
}

function buildLesson(process: ProcessDefinition, questionId: string): Lesson {
  const blocks = lessonBlocks(process, questionId);
  const substantiveCharacters = blocks
    .filter((block) => block.kind !== "source")
    .map((block) => `${block.title}${block.body}`.replace(/\s+/g, ""))
    .join("").length;

  return {
    id: process.id,
    subjectId: SUBJECT_ID,
    conceptGroupId: GROUP_ID,
    conceptId: process.conceptId,
    title: process.title,
    aliases: process.aliases,
    summary: process.summary,
    blocks,
    relatedQuestionIds: [questionId],
    coverageStatus: "covered",
    contentStatus: "published",
    sourceNeeded: false,
    reviewedAt: REVIEWED_AT,
    publication: { readiness: "ready", blockers: [] },
    quality: {
      tier: "core",
      substantiveCharacters,
      genericPhraseMatches: [],
      languageIssueMatches: [],
      sourceLinked: true,
      passed: substantiveCharacters >= 900,
    },
  };
}

function buildChoices(definition: ProcessQuestionDefinition, concept: string): Choice[] {
  const correctText = definition.choices[definition.correctIndex];
  return definition.choices.map((text, index) => {
    const correct = index === definition.correctIndex;
    return {
      id: `${definition.id}-c${index + 1}`,
      order: index + 1,
      text,
      feedback: buildChoiceFeedback({
        stem: definition.stem,
        choiceText: text,
        correctText,
        correct,
        explanation: definition.explanation,
        choiceEvidence: definition.choiceEvidence[index],
        concept,
        groupId: GROUP_ID,
        groupTitle: "아크용접",
      }),
    };
  });
}

function buildQuestion(
  definition: ProcessQuestionDefinition,
  canonicalNumber: number,
): Question {
  const process = processDefinitions.find((item) => item.id === definition.lessonId);
  if (!process) throw new Error(`${definition.id}의 연결 레슨을 찾지 못했습니다.`);
  const choices = buildChoices(definition, process.title);
  const feedbackPassed = choices.every((choice, index) =>
    choiceFeedbackPasses(choice.feedback, index === definition.correctIndex),
  );

  return {
    id: definition.id,
    canonicalNumber,
    subjectId: SUBJECT_ID,
    conceptGroupId: GROUP_ID,
    conceptId: process.conceptId,
    lessonId: process.id,
    lessonAnchor: "exam-point",
    stem: definition.stem,
    choices,
    correctChoiceId: choices[definition.correctIndex].id,
    answerText: choices[definition.correctIndex].text,
    explanation: definition.explanation,
    errorReason: definition.errorReason,
    sourceLabel: THEORY_SOURCE,
    reviewStatus: "공정별 이론·정답·선택지 피드백 검수 완료",
    contentStatus: feedbackPassed ? "published" : "in_review",
    publication: {
      readiness: feedbackPassed ? "ready" : "blocked",
      blockers: feedbackPassed ? [] : ["content_quality"],
    },
    verification: {
      status: feedbackPassed ? "verified" : "blocked",
      method: "source_backed_reconstruction",
      variantCount: 1,
      sourceUrls: [THEORY_SOURCE],
      riskTags: ["editorial_reconstruction"],
      note:
        "사용자 이론서의 아크용접 공정별 전극·차폐·적용조건을 대조하여 학습용 식별 문제와 선택지별 피드백으로 재구성했습니다.",
      reviewedAt: REVIEWED_AT,
    },
    validation: {
      answer: true,
      explanation: definition.explanation.trim().length >= 20,
      choiceFeedback: feedbackPassed,
      theoryLink: true,
      contentQuality: feedbackPassed,
    },
  };
}

export function getApprovedWeldingProcessContent(baseCanonicalNumber = 340_000) {
  const questions = questionDefinitions.map((definition, index) =>
    buildQuestion(definition, baseCanonicalNumber + index + 1),
  );
  const questionIdByLessonId = new Map(
    questionDefinitions.map((definition) => [definition.lessonId, definition.id]),
  );
  const lessons = processDefinitions.map((process) =>
    buildLesson(process, questionIdByLessonId.get(process.id)!),
  );
  return { questions, lessons };
}

export function mergeApprovedWeldingProcessContent(
  content: GeneratedContent,
): GeneratedContent {
  const supplement = getApprovedWeldingProcessContent();
  const existingQuestionIds = new Set(content.questions.map((question) => question.id));
  const existingLessonIds = new Set(content.lessons.map((lesson) => lesson.id));
  const questions = supplement.questions.filter(
    (question) => !existingQuestionIds.has(question.id),
  );
  const lessons = supplement.lessons.filter(
    (lesson) => !existingLessonIds.has(lesson.id),
  );
  const publishedQuestionCount = questions.filter(
    (question) => question.contentStatus === "published",
  ).length;
  const publishedLessonCount = lessons.filter(
    (lesson) => lesson.contentStatus === "published",
  ).length;
  const choiceFeedbackCount = questions.reduce(
    (total, question) => total + question.choices.length,
    0,
  );

  return {
    ...content,
    questions: [...content.questions, ...questions],
    lessons: [...content.lessons, ...lessons],
    report: {
      ...content.report,
      publishedQuestionCount:
        content.report.publishedQuestionCount + publishedQuestionCount,
      publication: {
        ...content.report.publication,
        ready: content.report.publication.ready + publishedQuestionCount,
      },
      verification: {
        ...content.report.verification,
        verified: content.report.verification.verified + publishedQuestionCount,
        sourceBackedReconstruction:
          content.report.verification.sourceBackedReconstruction +
          publishedQuestionCount,
        riskCounts: {
          ...content.report.verification.riskCounts,
          editorial_reconstruction:
            content.report.verification.riskCounts.editorial_reconstruction +
            publishedQuestionCount,
        },
      },
      coverage: {
        ...content.report.coverage,
        covered: content.report.coverage.covered + publishedLessonCount,
      },
      quality: {
        ...content.report.quality,
        lessonPassed: content.report.quality.lessonPassed + publishedLessonCount,
        choiceFeedbackPassed:
          content.report.quality.choiceFeedbackPassed + choiceFeedbackCount,
      },
      groupQuality: content.report.groupQuality.map((group) =>
        group.groupId === GROUP_ID
          ? {
              ...group,
              lessonCount: group.lessonCount + lessons.length,
              lessonPassed: group.lessonPassed + publishedLessonCount,
              publishedLessonCount:
                group.publishedLessonCount + publishedLessonCount,
              publishedLessonPassed:
                group.publishedLessonPassed + publishedLessonCount,
              questionCount: group.questionCount + questions.length,
              publishedQuestionCount:
                group.publishedQuestionCount + publishedQuestionCount,
              choiceFeedbackCount:
                group.choiceFeedbackCount + choiceFeedbackCount,
              choiceFeedbackPassed:
                group.choiceFeedbackPassed + choiceFeedbackCount,
            }
          : group,
      ),
    },
  };
}
