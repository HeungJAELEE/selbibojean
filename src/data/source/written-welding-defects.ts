export type WrittenWeldingDefect = {
  id: string;
  conceptId: string;
  title: string;
  label: string;
  aliases: string[];
  category: string;
  appearance: string;
  mechanism: string;
  causes: string;
  prevention: string;
  distinction: string;
  inspection: string;
  examPattern: string;
  memory: string;
  actualQuestionIds: string[];
};

/**
 * 사용자 제2과목 Notion 원문의 결함 표를 중심으로 구성하고,
 * 용입 불량·융합 불량, 피트·기공, 은점·균열처럼 시험에서 섞어
 * 출제되는 용어만 NCS 학습자료의 구분 기준으로 보충한다.
 */
export const WRITTEN_WELDING_DEFECTS: WrittenWeldingDefect[] = [
  {
    id: "lesson-welding-defect-undercut",
    conceptId: "concept-welding-defect-undercut",
    title: "언더컷 결함",
    label: "언더컷",
    aliases: ["언더컷", "toe undercut", "비드 가장자리 홈"],
    category: "외관·형상 결함",
    appearance:
      "용접 비드의 토(toe), 즉 비드와 모재가 만나는 가장자리를 따라 모재가 도랑처럼 파였지만 용착금속으로 채워지지 않은 홈입니다.",
    mechanism:
      "아크가 비드 가장자리의 모재를 지나치게 녹인 뒤 용착금속이 그 자리를 충분히 메우지 못하면 응력집중이 생기는 홈이 남습니다.",
    causes:
      "과대한 용접전류, 높은 아크전압·긴 아크, 지나치게 빠른 진행속도, 부적절한 용접봉 각도와 과도한 위빙",
    prevention:
      "전류와 아크길이를 낮추고 진행속도·봉각·위빙 폭을 조정하여 비드 가장자리가 충분히 채워지게 합니다.",
    distinction:
      "오버랩은 금속이 모재 위로 흘러 덮이지만 융합되지 않은 돌출이고, 언더컷은 모재 가장자리가 파인 홈입니다.",
    inspection:
      "VT에서는 비드 가장자리의 연속 또는 단속 홈을 확인하고, 방사선 사진에서는 용접부 가장자리의 가늘고 긴 어두운 선으로 판독할 수 있습니다.",
    examPattern:
      "‘비드 가장자리의 홈’, ‘과대 전류·긴 아크·빠른 속도’를 제시하고 결함명을 묻거나 오버랩과 원인을 서로 바꾼 보기를 고르게 합니다.",
    memory: "가장자리가 파였으면 언더컷, 대표 원인은 고전류·긴 아크·빠른 진행",
    actualQuestionIds: ["U-931"],
  },
  {
    id: "lesson-welding-defect-overlap",
    conceptId: "concept-welding-defect-overlap",
    title: "오버랩 결함",
    label: "오버랩",
    aliases: ["오버랩", "겹침", "overlap"],
    category: "외관·융합 결함",
    appearance:
      "용착금속이 모재 표면 위로 흘러 겹쳐 덮였지만 그 경계가 모재와 충분히 융합되지 않은 돌출 형상입니다.",
    mechanism:
      "열입력이 부족하거나 용융금속이 한곳에 과도하게 쌓이면 모재 표면을 녹여 붙기 전에 금속만 옆으로 흘러 경계가 남습니다.",
    causes:
      "낮은 용접전류, 지나치게 느린 진행속도, 과도한 용착량, 짧은 아크와 부적절한 용접봉 각도",
    prevention:
      "모재가 융합될 만큼 전류와 진행속도를 맞추고 용착량·봉각·운봉 폭을 조절하여 금속이 모재 위에 덮이기만 하지 않게 합니다.",
    distinction:
      "언더컷은 모재가 파인 홈이고, 오버랩은 용착금속이 모재 위를 덮은 채 융합되지 않은 돌출입니다.",
    inspection:
      "VT에서 비드 가장자리의 돌출과 경계 융합 상태를 확인하며, 방사선 사진에서는 용접부보다 약간 밝게 보이는 경계로 나타날 수 있습니다.",
    examPattern:
      "‘모재와 융합되지 않고 겹쳐 덮임’, ‘저전류·느린 속도’를 제시해 오버랩을 고르게 하거나 언더컷 원인과 뒤바꿉니다.",
    memory: "겹쳐 덮였으면 오버랩, 대표 원인은 저전류·느린 진행",
    actualQuestionIds: ["U-931"],
  },
  {
    id: "lesson-welding-defect-porosity",
    conceptId: "concept-welding-defect-porosity",
    title: "기공·피트 결함",
    label: "기공·피트",
    aliases: ["기공", "피트", "블로홀", "porosity", "pit"],
    category: "체적·가스 결함",
    appearance:
      "용접금속이 굳는 동안 빠져나오지 못한 가스가 내부에 둥근 공극으로 남은 것이 기공이며, 표면까지 열린 작은 구멍은 피트로 구분합니다.",
    mechanism:
      "녹·기름·도료·수분이나 불안정한 차폐에서 생긴 가스가 응고 전에 배출되지 못하면 용접금속 안에 갇힙니다.",
    causes:
      "모재의 녹·유분·수분·도료, 젖은 용접봉과 플럭스, 보호가스 부족·누설·과대 유량에 의한 난류, 바람과 긴 아크",
    prevention:
      "모재를 청소·건조하고 소모재를 지정 조건으로 보관하며 가스 종류·유량·호스 누설·노즐 거리와 방풍 상태를 확인합니다.",
    distinction:
      "내부의 둥근 공극은 기공, 표면에 열린 작은 구멍은 피트이며, 슬래그 혼입은 둥근 가스공이 아니라 불규칙한 비금속 개재물입니다.",
    inspection:
      "표면 피트는 VT로 확인하고 내부 기공은 RT에서 불규칙하게 흩어진 둥근 어두운 점으로 판독하는 경우가 많습니다.",
    examPattern:
      "‘가스가 빠져나오지 못해 생긴 둥근 공극’, ‘수분·오염·차폐 불량’을 제시하고 기공 또는 피트를 구분하게 합니다.",
    memory: "둥근 가스공은 기공, 표면에 열리면 피트",
    actualQuestionIds: [],
  },
  {
    id: "lesson-welding-defect-slag",
    conceptId: "concept-welding-defect-slag",
    title: "슬래그 혼입 결함",
    label: "슬래그 혼입",
    aliases: ["슬래그 혼입", "슬래그 개재", "slag inclusion"],
    category: "내부·개재물 결함",
    appearance:
      "이전 층의 슬래그나 플럭스 잔류물이 다음 용접층에 갇혀 용접금속 내부에 불규칙한 비금속 개재물로 남은 결함입니다.",
    mechanism:
      "층간 청소가 부족하거나 홈이 좁고 운봉·봉각·전류가 부적절하면 용융 슬래그가 비드 표면으로 떠오르지 못하고 다음 층에 포획됩니다.",
    causes:
      "층간 슬래그 미제거, 좁은 개선과 불충분한 접근, 낮은 전류, 부적절한 봉각·운봉, 볼록한 앞층 비드",
    prevention:
      "매 층의 슬래그를 완전히 제거하고 홈 접근성을 확보하며 적정 전류·봉각·운봉으로 건전하고 평탄한 층을 만듭니다.",
    distinction:
      "기공은 가스가 만든 둥근 공극이고, 슬래그 혼입은 층간 잔류물이 만든 길쭉하거나 불규칙한 비금속 형상입니다.",
    inspection:
      "표면에 드러난 흔적은 VT로 보고 내부 혼입은 RT에서 불규칙한 중간 농도의 형상, UT에서 불연속 반사로 확인할 수 있습니다.",
    examPattern:
      "‘다층 용접에서 앞층 청소 미흡’, ‘불규칙한 비금속 개재물’을 제시하고 슬래그 혼입을 고르게 합니다.",
    memory: "앞층 슬래그를 안 털고 덮으면 내부에 슬래그 혼입",
    actualQuestionIds: [],
  },
  {
    id: "lesson-welding-defect-penetration-fusion",
    conceptId: "concept-welding-defect-penetration-fusion",
    title: "용입 불량·융합 불량 결함",
    label: "용입 불량·융합 불량",
    aliases: ["용입 불량", "용입 부족", "융합 불량", "불완전 용입", "불완전 융합"],
    category: "내부·접합 결함",
    appearance:
      "용입 불량은 이음의 루트까지 충분히 녹아들지 않은 상태이고, 융합 불량은 용접금속과 모재 또는 용접층 사이의 경계가 붙지 않은 상태입니다.",
    mechanism:
      "루트 간격·개선각·열입력이 부족하거나 진행이 너무 빠르면 루트가 녹지 않으며, 표면 오염·부적절한 봉각·운봉은 경계 융합을 방해합니다.",
    causes:
      "좁은 루트 간격과 개선각, 낮은 전류, 빠른 진행속도, 부적절한 봉각·운봉, 모재 또는 층간 표면의 오염",
    prevention:
      "도면과 절차에 맞춰 루트 간격·개선각을 확보하고 전류·속도·봉각을 조정하며 모재와 층간 표면을 깨끗이 합니다.",
    distinction:
      "용입 불량은 루트 깊이가 부족한 문제이고, 융합 불량은 모재 또는 층간 경계가 붙지 않은 문제입니다.",
    inspection:
      "루트 형상은 VT·매크로시험으로, 내부의 선형 불연속은 RT·UT로 확인하며 촬영 방향과 결함 방향을 함께 고려합니다.",
    examPattern:
      "‘루트까지 녹지 않음’은 용입 불량, ‘모재 또는 층 사이 경계가 붙지 않음’은 융합 불량으로 구분하게 합니다.",
    memory: "루트 깊이가 부족하면 용입 불량, 경계가 안 붙으면 융합 불량",
    actualQuestionIds: ["U-931"],
  },
  {
    id: "lesson-welding-defect-spatter",
    conceptId: "concept-welding-defect-spatter",
    title: "스패터 결함",
    label: "스패터",
    aliases: ["스패터", "비산", "spatter"],
    category: "외관·비산 결함",
    appearance:
      "아크 중 튀어나온 작은 용융금속 방울이 비드 주변 모재 표면에 붙어 거친 외관과 후처리 부담을 만드는 현상입니다.",
    mechanism:
      "아크와 금속 이행이 불안정하면 용적이 정상적으로 용융지에 들어가지 못하고 작은 방울로 비산합니다.",
    causes:
      "과대한 전류, 지나치게 긴 아크, 부적절한 극성, 젖거나 상태가 나쁜 용접봉, 불안정한 와이어 송급과 가스 조건",
    prevention:
      "전류·전압·아크길이·극성을 공정에 맞추고 용접봉을 건조하며 와이어 송급과 가스 차폐 상태를 안정시킵니다.",
    distinction:
      "스패터는 비드 주변에 붙은 작은 금속 방울이며, 피트처럼 용접금속 표면에 열린 구멍이 아닙니다.",
    inspection:
      "VT로 비드 주변의 부착 금속과 표면 손상 여부를 확인하고 승인 기준에 따라 제거·그라인딩 후 모재 손상을 재검사합니다.",
    examPattern:
      "‘고전류·긴 아크에서 비산 금속 증가’를 묻고, ‘저전류·짧은 아크가 대표 원인’이라는 반대 보기를 출제합니다.",
    memory: "주변에 금속 방울이 튀어 붙으면 스패터",
    actualQuestionIds: ["U-931"],
  },
  {
    id: "lesson-welding-defect-burn-through",
    conceptId: "concept-welding-defect-burn-through",
    title: "용락 결함",
    label: "용락",
    aliases: ["용락", "번스루", "burn-through"],
    category: "루트·형상 결함",
    appearance:
      "루트부 모재가 과도하게 녹아 용융금속을 지탱하지 못하고 빠져나가 구멍 또는 과대한 처짐이 생긴 결함입니다.",
    mechanism:
      "얇은 판이나 넓은 루트 간격에 과도한 열입력이 집중되면 루트가 응고 전에 무너져 아래쪽으로 흘러내립니다.",
    causes:
      "과대한 전류·열입력, 지나치게 느린 진행속도, 넓은 루트 간격, 얇은 판과 부족한 받침·백킹",
    prevention:
      "전류와 열입력을 낮추고 진행속도와 루트 간격을 절차에 맞추며 필요하면 받침재·백킹과 적절한 작업 순서를 사용합니다.",
    distinction:
      "용입 불량은 루트가 덜 녹은 상태이고, 용락은 반대로 루트가 지나치게 녹아 구멍이나 과대 처짐이 생긴 상태입니다.",
    inspection:
      "VT로 루트면의 구멍·과대 처짐을 확인하고 접근이 어려우면 내시경 또는 적합한 비파괴검사와 치수 검사를 병행합니다.",
    examPattern:
      "‘과대 열입력·넓은 루트 간격·얇은 판에서 루트가 뚫림’을 제시해 용입 불량과 반대로 구분하게 합니다.",
    memory: "루트가 덜 녹으면 용입 불량, 너무 녹아 뚫리면 용락",
    actualQuestionIds: [],
  },
  {
    id: "lesson-welding-defect-crack",
    conceptId: "concept-welding-defect-crack",
    title: "용접 균열·은점 결함",
    label: "균열·은점",
    aliases: ["고온균열", "저온균열", "수소균열", "지연균열", "은점", "피시아이"],
    category: "선형·파괴 결함",
    appearance:
      "균열은 용접금속 또는 열영향부가 선형으로 갈라진 결함이며, 은점·피시아이는 파단면에서 보이는 밝은 원형·타원형 흔적으로 수소 영향과 연결해 봅니다.",
    mechanism:
      "고온균열은 응고 중 저융점 성분·부적절한 비드 형상과 구속의 영향을 받고, 저온·지연균열은 확산성 수소·경화조직·인장응력이 함께 작용합니다.",
    causes:
      "젖은 소모재와 오염에 의한 수소, 큰 구속과 인장응력, 급랭·경화조직, 고온균열의 S·P 저융점 성분과 부적절한 크레이터",
    prevention:
      "저수소계 소모재를 건조·보관하고 모재를 청소하며 재질과 절차에 따라 예열·층간온도·후열·입열·구속을 관리합니다.",
    distinction:
      "은점은 정상 비드 표면 무늬가 아니라 파단면의 밝은 흔적이며, 기공처럼 둥근 빈 공간으로만 판단하지 않습니다.",
    inspection:
      "표면 균열은 VT·PT·MT, 내부 균열은 UT·RT 등을 재질과 방향에 맞춰 적용하고 지연균열은 지정 대기시간 뒤 재검사합니다.",
    examPattern:
      "고온균열과 저온·수소균열의 발생 시점·원인·대책을 바꿔 묻거나 은점을 기공과 혼동시키는 보기가 자주 나옵니다.",
    memory: "수소+경화조직+인장응력은 저온·지연균열, 응고 중 저융점 성분은 고온균열",
    actualQuestionIds: ["WELD-ACTUAL-2009-Q51", "WELD-ACTUAL-2009-Q54"],
  },
  {
    id: "lesson-welding-defect-arc-strike",
    conceptId: "concept-welding-defect-arc-strike",
    title: "아크 스트라이크 결함",
    label: "아크 스트라이크",
    aliases: ["아크 스트라이크", "아크 흔적", "arc strike"],
    category: "모재 표면·열영향 결함",
    appearance:
      "정해진 용접선 밖의 모재 표면에 전극이나 홀더가 순간 접촉해 생긴 국부 아크 흔적입니다.",
    mechanism:
      "짧고 집중된 아크열이 모재 표면을 급가열·급랭시켜 국부 경화, 미세균열과 응력집중의 시발점이 될 수 있습니다.",
    causes:
      "용접선 밖에서의 임의 아크 발생, 전극·홀더의 우발 접촉, 부적절한 접지와 작업 습관",
    prevention:
      "아크는 지정된 용접부 또는 허용된 시작판에서만 발생시키고 케이블·홀더·접지와 작업 동선을 정리합니다.",
    distinction:
      "스패터는 튄 금속 방울이 붙은 것이고, 아크 스트라이크는 모재 자체가 순간 아크열을 받은 국부 흔적입니다.",
    inspection:
      "VT로 위치와 표면 손상을 확인하고 절차에 따라 제거·연마한 뒤 필요하면 PT·MT와 경도·두께 검사를 수행합니다.",
    examPattern:
      "‘용접선 밖 모재의 아크 흔적’, ‘국부 경화와 균열 시발점’을 제시해 단순 스패터와 구분하게 합니다.",
    memory: "용접선 밖 모재에 난 아크 흔적은 아크 스트라이크",
    actualQuestionIds: [],
  },
];
