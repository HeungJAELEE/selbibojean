import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE_SUPPLEMENT } from "@/data/source/written-subject-two-memory-guide-supplement";

export type SubjectTwoMemoryFact = {
  id?: string;
  cue: string;
  answer: string;
  detailLessonTitles?: string[];
};

export type SubjectTwoTrap = {
  statement: string;
  correction: string;
};

export type SubjectTwoMemoryBundle = {
  id: string;
  part: "용접 기초" | "아크·특수용접" | "결함·검사·이음" | "산업안전";
  title: string;
  memoryLine: string;
  facts: SubjectTwoMemoryFact[];
  traps: SubjectTwoTrap[];
  detailLessonTitles: string[];
  cbtStatusNote?: string;
};

export const WRITTEN_SUBJECT_TWO_SOURCE_BOUNDARY =
  "법령·안전·표준의 세부 수치와 작업 절차는 통합본의 암기 흐름만 참고합니다. 모아보기에서는 공식 근거가 다시 확인되지 않은 숫자를 단정하지 않았으며, 실제 작업과 최신 수치 판단에는 현행 법령·승인 작업표준·제조사 자료를 우선해야 합니다.";

export const WRITTEN_SUBJECT_TWO_MEMORY_GUIDE: SubjectTwoMemoryBundle[] = [
  {
    id: "classification-joints",
    part: "용접 기초",
    title: "융접·압접·납땜과 이음의 기본",
    memoryLine: "열원의 이름보다 모재 용융 여부, 압력 사용 여부, 용가재만 녹는지를 먼저 봅니다.",
    facts: [
      { cue: "융접", answer: "접합부의 모재를 녹여 응고시키며 필요하면 용가재를 더하는 방식입니다.", detailLessonTitles: ["용접 분류"] },
      { cue: "압접", answer: "접합면에 압력을 주된 수단으로 사용하며, 저항열·마찰열 등으로 가열하기도 합니다.", detailLessonTitles: ["용접 분류"] },
      { cue: "납땜", answer: "모재는 녹이지 않고 낮은 융점의 용가재만 녹여 젖음과 모세관 작용으로 접합합니다.", detailLessonTitles: ["용접 분류"] },
      { cue: "용접 이음", answer: "이음 효율과 기밀·수밀성이 좋고 구조를 단순화할 수 있지만, 분해가 어렵고 열변형·잔류응력 관리가 필요합니다.", detailLessonTitles: ["용접 특징"] },
      { cue: "용접 자세", answer: "아래보기 F, 수직 V, 수평 H, 위보기 OH로 구분하며 공정과 모재 조건에 맞는 자세를 선택합니다.", detailLessonTitles: [] },
      { cue: "플러그 용접", answer: "겹친 부재 한쪽에 구멍을 만들고 용접금속으로 채워 두 부재를 접합합니다.", detailLessonTitles: [] },
    ],
    traps: [
      { statement: "전기를 열원으로 사용하면 모두 융접으로 분류한다.", correction: "함정입니다. 저항용접은 전류와 가압력을 함께 사용하는 압접 계열로 분류합니다." },
      { statement: "납땜은 모재와 용가재를 모두 녹여 섞는 접합법이다.", correction: "함정입니다. 모재는 녹이지 않고 용가재만 녹이는 것이 판단 기준입니다." },
      { statement: "용접 이음은 리벳 이음보다 구조가 복잡하고 기밀성이 낮다.", correction: "문맥을 반대로 바꾼 함정입니다. 용접 이음은 보통 구조를 단순화하고 기밀·수밀성을 얻기 쉽습니다." },
    ],
    detailLessonTitles: ["용접 분류", "용접 특징"],
  },
  {
    id: "arc-foundation-polarity",
    part: "용접 기초",
    title: "아크 기초·용접기·직류 극성",
    memoryLine: "아크열로 모재와 용가재가 어떻게 녹는지 본 뒤 전원 특성과 전극·모재의 극성을 구분합니다.",
    facts: [
      { cue: "아크 용접", answer: "전극과 모재 사이의 방전으로 생긴 고온 아크열을 이용해 접합부를 용융합니다.", detailLessonTitles: ["교류·직류 아크용접기"] },
      { cue: "용융지와 비드", answer: "용융지는 녹은 금속 웅덩이이고, 비드는 그 금속이 응고해 형성한 용접 자국입니다.", detailLessonTitles: [] },
      { cue: "용입과 용착", answer: "용입은 모재 안쪽까지 녹아든 깊이, 용착은 용가재가 녹아 용접부에 붙는 현상입니다.", detailLessonTitles: [] },
      { cue: "교류 용접기", answer: "가동철심형·가동코일형·탭전환형처럼 전압 조정 구조를 기준으로 구분합니다.", detailLessonTitles: ["교류아크용접기 종류"] },
      { cue: "직류 정극성", answer: "DCEN은 전극이 음극, 모재가 양극인 연결이며 DCEP와 열분포·용입 특성이 다릅니다.", detailLessonTitles: ["직류용접 극성"] },
      { cue: "전원 선정", answer: "교류·직류와 정전류·정전압 특성을 공정의 전극 방식과 송급 방식에 맞춰 구분합니다.", detailLessonTitles: ["교류·직류 아크용접기"] },
    ],
    traps: [
      { statement: "엔진구동형은 전압 조정 구조에 따른 교류아크용접기 형식이다.", correction: "함정입니다. 엔진구동형은 전원의 구동원에 따른 분류로 가동철심형·가동코일형·탭전환형과 기준이 다릅니다." },
      { statement: "직류 정극성에서는 전극이 양극이고 모재가 음극이다.", correction: "함정입니다. DCEN은 전극 음극, 모재 양극입니다." },
      { statement: "용입은 용접봉이 녹아 모재 표면에 붙는 양을 뜻한다.", correction: "함정입니다. 그 설명은 용착에 가깝고, 용입은 모재 내부로 녹아든 깊이입니다." },
    ],
    detailLessonTitles: ["교류·직류 아크용접기", "교류아크용접기 종류", "직류용접 극성"],
  },
  {
    id: "electrodes-arc-blow",
    part: "용접 기초",
    title: "피복 용접봉·저수소계·아크 쏠림",
    memoryLine: "용접봉 표시는 강도·피복계통·사용 전원·치수를 나누어 읽고, 직류 자기장 불균형은 아크 쏠림으로 연결합니다.",
    facts: [
      { cue: "피복제 역할", answer: "보호가스와 슬래그를 형성해 용융금속을 대기로부터 보호하고 아크 안정과 용접금속 성질을 보완합니다.", detailLessonTitles: ["피복아크용접(SMAW)"] },
      { cue: "저수소계", answer: "확산성 수소를 줄여 균열에 민감한 후판·고장력강·구속이 큰 이음에 적용하며 건조 관리가 중요합니다.", detailLessonTitles: ["피복아크용접(SMAW)"] },
      { cue: "용접봉 표시", answer: "문자와 숫자를 인장강도, 피복계통·자세·전류 조건, 봉 지름과 길이처럼 항목별로 분리해 읽습니다.", detailLessonTitles: ["피복아크용접(SMAW)"] },
      { cue: "아크 쏠림", answer: "용접 전류가 만든 자기장이 불균형해져 아크가 한쪽으로 치우치는 현상으로 직류 용접에서 두드러집니다.", detailLessonTitles: ["아크쏠림 방지"] },
      { cue: "쏠림 대책", answer: "교류 사용, 접지 위치 변경, 짧은 아크, 후퇴 용접, 전극 기울기와 엔드 탭 등으로 자기장과 진행 조건을 조정합니다.", detailLessonTitles: ["아크쏠림 방지"] },
    ],
    traps: [
      { statement: "저수소계 용접봉은 습기에 강하므로 별도 건조가 필요 없다.", correction: "함정입니다. 수분 관리가 핵심이며 사용 전 건조와 보관 조건을 확인해야 합니다." },
      { statement: "아크 쏠림을 줄이려면 접지점을 용접부에 항상 최대한 가깝게 둔다.", correction: "원문의 반대 보기입니다. 접지 위치를 바꾸거나 용접부에서 떨어뜨려 자기장 불균형을 줄이는 방법을 검토합니다." },
      { statement: "아크 쏠림은 보호가스가 바람에 날려 생기는 현상과 같은 뜻이다.", correction: "함정입니다. 아크 쏠림은 자기장 불균형, 보호가스 교란은 바람과 가스 차폐 조건의 문제입니다." },
    ],
    detailLessonTitles: ["피복아크용접(SMAW)", "아크쏠림 방지"],
  },
  {
    id: "shielded-high-efficiency",
    part: "아크·특수용접",
    title: "TIG·MIG·CO₂·서브머지드 비교",
    memoryLine: "전극이 소모되는지, 무엇으로 차폐하는지, 어떤 재질·두께·자세에 유리한지를 한 표처럼 비교합니다.",
    facts: [
      { cue: "TIG", answer: "비소모성 텅스텐 전극과 불활성가스를 사용하며 박판·비철금속·스테인리스의 정밀 용접에 유리합니다." },
      { cue: "MIG", answer: "소모성 와이어와 불활성가스를 사용하며 와이어를 연속 송급해 생산성이 높습니다." },
      { cue: "CO₂ 용접", answer: "CO₂ 계열 차폐가스와 연속 와이어를 사용하며 철강 구조물의 고능률 용접에 널리 적용됩니다." },
      { cue: "FCAW", answer: "와이어 내부의 플럭스로 아크 안정과 용접금속 성질을 보완하며 슬래그·스패터 관리를 함께 봅니다." },
      { cue: "서브머지드", answer: "입상 플럭스 아래에서 아크를 발생시켜 후판·긴 직선 용접에 높은 용착률과 깊은 용입을 얻습니다." },
      { cue: "차폐 조건", answer: "가스 차폐 공정은 바람과 누설에 민감하고, 서브머지드는 플럭스 공급·회수와 용접선 추적 조건을 확인합니다." },
    ],
    traps: [
      { statement: "TIG는 텅스텐 전극 자체가 녹아 용가재가 된다.", correction: "함정입니다. TIG 전극은 비소모성이며 필요하면 별도의 용가봉을 사용합니다." },
      { statement: "MIG는 피복 용접봉처럼 매번 봉을 갈아 끼우는 수동 공정이다.", correction: "함정입니다. 소모성 와이어를 연속 송급합니다." },
      { statement: "서브머지드 용접은 분말 플럭스 밖에서 아크가 노출되므로 육안 추적이 쉽다.", correction: "함정입니다. 아크가 플럭스 아래에 묻혀 직접 보이지 않는 것이 특징입니다." },
      { statement: "CO₂ 용접은 차폐가스 공정이므로 바람의 영향을 고려할 필요가 없다.", correction: "함정입니다. 차폐가스가 흐트러지면 기공과 산화 위험이 커지므로 방풍 조건을 확인합니다." },
    ],
    detailLessonTitles: [
      "TIG용접(GTAW)",
      "MIG·MAG·CO₂용접(GMAW)",
      "CO₂ 아크용접",
      "플럭스코어드아크용접(FCAW)",
      "서브머지드아크용접(SAW)",
      "아크용접 차폐 조건",
    ],
  },
  {
    id: "pressure-gas-special",
    part: "아크·특수용접",
    title: "저항·가스·플라즈마·테르밋 용접",
    memoryLine: "접촉저항열과 가압력, 가스 연소열, 고밀도 아크, 화학 반응열처럼 열원이 무엇인지로 구분합니다.",
    facts: [
      { cue: "저항용접 3요소", answer: "전류, 통전시간, 가압력을 함께 제어하며 점·심·프로젝션·맞대기 용접으로 나뉩니다.", detailLessonTitles: ["저항용접"] },
      { cue: "점·심 용접", answer: "점 용접은 너깃을 만들고, 심 용접은 롤러 전극으로 연속 점을 겹쳐 기밀·수밀 이음에 적용합니다.", detailLessonTitles: ["저항용접"] },
      { cue: "가스 용접", answer: "산소와 연료가스의 연소열을 이용하며 전원 없이 작업할 수 있지만 가스와 역화 안전관리가 필요합니다.", detailLessonTitles: ["저항·가스·특수용접의 구분"] },
      { cue: "플라즈마 아크", answer: "수축된 고온·고에너지밀도 아크를 이용해 용접·절단하며 토치와 가스 조건을 함께 관리합니다.", detailLessonTitles: ["플라즈마 아크용접"] },
      { cue: "테르밋 용접", answer: "산화철과 알루미늄의 화학 반응열을 이용하며 레일과 같은 큰 단면의 현장 접합에 쓰입니다.", detailLessonTitles: ["테르밋 용접"] },
      { cue: "기타 특수용접", answer: "전자빔은 진공 전자충돌열, 일렉트로슬래그는 용융 슬래그의 저항열을 이용합니다.", detailLessonTitles: ["저항·가스·특수용접의 구분"] },
    ],
    traps: [
      { statement: "저항용접은 접촉저항열만 사용하므로 가압력은 품질과 관계없다.", correction: "함정입니다. 전류·시간·가압력이 함께 품질을 결정합니다." },
      { statement: "테르밋 용접은 반드시 외부 전기 아크를 계속 공급해야 반응한다.", correction: "함정입니다. 주된 열원은 산화철과 알루미늄의 화학 반응열입니다." },
      { statement: "플라즈마 아크는 전류밀도가 낮은 저온 열원이다.", correction: "원문의 의미를 바로잡은 함정입니다. 수축된 고에너지밀도 아크가 핵심입니다." },
    ],
    detailLessonTitles: ["저항용접", "저항·가스·특수용접의 구분", "테르밋 용접", "플라즈마 아크용접"],
  },
  {
    id: "weld-defects",
    part: "결함·검사·이음",
    title: "용접결함 식별 종합",
    memoryLine: "겉모양 결함과 내부 결함을 나누고, 전류·속도·청소·수소 조건을 원인과 대책으로 짝지어 봅니다.",
    facts: [
      { cue: "언더컷", answer: "비드 가장자리의 모재가 도랑처럼 패인 형상으로 과대 전류·긴 아크·빠른 속도 등을 확인합니다." },
      { cue: "오버랩", answer: "용착금속이 모재와 충분히 융합되지 않은 채 겹쳐 덮이는 형상으로 낮은 열입력·느린 진행 등을 확인합니다." },
      { cue: "기공", answer: "오염·습기·차폐 불량 등으로 발생한 가스가 용접금속 안에 갇혀 구멍을 형성한 결함입니다." },
      { cue: "슬래그 혼입", answer: "층간 청소가 부족하거나 운봉·전류 조건이 맞지 않아 슬래그가 용접금속 안에 남은 내부 결함입니다." },
      { cue: "용입 불량", answer: "루트까지 충분히 녹아들지 못한 상태로 루트 간격·개선각·전류·진행속도를 확인합니다." },
      { cue: "스패터", answer: "아크 중 튄 작은 용융금속 방울이 비드 주변 모재 표면에 붙은 형상으로 전류·아크 길이·극성·가스 조건을 확인합니다." },
      { cue: "용락", answer: "루트부가 과도하게 녹아 용융금속이 지탱되지 못하고 빠져나간 결함으로 과대 전류·느린 속도·넓은 루트 간격을 확인합니다." },
      { cue: "은점·균열", answer: "은점과 지연균열은 수소 영향을, 고온균열은 재료 성분과 응고 조건을 함께 점검합니다." },
      { cue: "아크 스트라이크", answer: "용접부 밖 모재에 발생한 아크 흔적으로 국부 경화와 균열 시발점이 될 수 있어 결함으로 관리합니다." },
    ],
    traps: [
      { statement: "언더컷은 전류가 너무 낮고 용접속도가 너무 느릴 때만 생긴다.", correction: "대표 반대 보기입니다. 언더컷은 과대 전류·긴 아크·빠른 진행과 연결해 판단합니다." },
      { statement: "오버랩은 용착금속이 모재 깊숙이 지나치게 침투한 상태이다.", correction: "함정입니다. 모재와 충분히 융합되지 못한 금속이 표면을 덮는 형상입니다." },
      { statement: "다층 용접에서는 이전 층 슬래그를 남겨야 다음 층을 보호한다.", correction: "함정입니다. 층간 슬래그를 제거하지 않으면 슬래그 혼입의 원인이 됩니다." },
      { statement: "기공과 은점은 모두 전류가 높아서만 발생하므로 수분 관리는 관계없다.", correction: "함정입니다. 습기와 수소 관리는 기공·은점·저온균열 판단에서 중요한 조건입니다." },
    ],
    detailLessonTitles: [
      "언더컷 결함",
      "오버랩 결함",
      "기공·피트 결함",
      "슬래그 혼입 결함",
      "용입 불량·융합 불량 결함",
      "스패터 결함",
      "용락 결함",
      "용접 균열·은점 결함",
      "아크 스트라이크 결함",
    ],
  },
  {
    id: "deformation-stress",
    part: "결함·검사·이음",
    title: "변형·잔류응력과 용착 순서",
    memoryLine: "용접 전에는 설계·구속·역변형, 용접 중에는 순서·분산, 용접 후에는 열처리·교정을 적용합니다.",
    facts: [
      { cue: "변형 원인", answer: "국부 급가열과 냉각 수축이 불균일해지면서 가로·세로 수축, 각변형, 굽힘·좌굴·비틀림이 생깁니다.", detailLessonTitles: ["용접 변형 방지와 잔류응력 완화", "용접 잔류응력 제거"] },
      { cue: "역변형법", answer: "완성 후 생길 변형을 예상해 반대 방향의 변형을 미리 주는 방법입니다.", detailLessonTitles: ["용접 변형 방지와 잔류응력 완화"] },
      { cue: "억제법", answer: "지그와 클램프로 변형을 막지만 구속이 커질수록 잔류응력과 균열 위험을 함께 확인합니다.", detailLessonTitles: ["용접 변형 방지와 잔류응력 완화"] },
      { cue: "후진법", answer: "개별 용착 방향을 전체 진행 방향과 반대로 해 열과 수축을 분산합니다.", detailLessonTitles: ["용접 변형 방지와 잔류응력 완화"] },
      { cue: "스킵·대칭법", answer: "구간을 건너뛰거나 중심에서 좌우 대칭으로 진행해 열집중과 수축 모멘트를 줄입니다.", detailLessonTitles: ["용접 변형 방지와 잔류응력 완화"] },
      { cue: "용접 후 완화", answer: "응력 제거 열처리·국부 가열교정·피닝 등을 재질과 용접층 조건에 맞춰 적용합니다.", detailLessonTitles: ["용접 변형 방지와 잔류응력 완화", "용접 잔류응력 제거"] },
    ],
    traps: [
      { statement: "변형을 줄이려면 용착금속량과 용접선 집중을 가능한 한 늘린다.", correction: "함정입니다. 불필요한 용착량과 용접선 집중을 줄이고 대칭 이음을 우선 검토합니다." },
      { statement: "후진법은 개별 용착 방향과 전체 진행 방향이 같은 방법이다.", correction: "함정입니다. 두 방향을 반대로 하는 것이 핵심입니다." },
      { statement: "지그로 강하게 구속하면 변형과 잔류응력이 모두 자동으로 사라진다.", correction: "함정입니다. 외형 변형은 억제해도 내부 잔류응력이 커질 수 있습니다." },
    ],
    detailLessonTitles: ["용접 변형 방지와 잔류응력 완화", "용접 잔류응력 제거"],
  },
  {
    id: "inspection",
    part: "결함·검사·이음",
    title: "VT·PT·MT·ET·UT·RT와 파괴검사",
    memoryLine: "표면 개구, 강자성체, 전도체, 내부 깊이, 기록성처럼 검사법마다 검출 조건을 분리합니다.",
    facts: [
      { cue: "VT", answer: "표면과 조립 상태를 눈과 게이지로 확인하며 다음 공정 전에 외관·치수 불량을 찾습니다.", detailLessonTitles: ["용접결함과 비파괴검사 선택"] },
      { cue: "PT", answer: "모세관 현상으로 비다공성 재료의 표면에 열린 미세 결함을 검출합니다.", detailLessonTitles: ["비파괴검사", "용접결함과 비파괴검사 선택"] },
      { cue: "MT", answer: "강자성체를 자화했을 때 결함부의 누설자속에 자분이 모이는 원리를 이용합니다.", detailLessonTitles: ["비파괴검사", "용접결함과 비파괴검사 선택"] },
      { cue: "ET", answer: "전도체에 유도된 와전류의 변화를 이용해 표면·근표면 결함과 재질 변화를 비접촉으로 검사합니다.", detailLessonTitles: ["와전류탐상"] },
      { cue: "UT", answer: "초음파의 반사·투과 특성으로 내부 결함의 위치와 깊이를 평가하며 접촉매질과 결함 방향을 고려합니다.", detailLessonTitles: ["비파괴검사", "용접결함과 비파괴검사 선택"] },
      { cue: "RT", answer: "X선·감마선의 투과량 차이를 영상으로 기록해 기공·개재물 같은 체적 결함 판독에 유리합니다.", detailLessonTitles: ["비파괴검사", "용접결함과 비파괴검사 선택"] },
      { cue: "파괴검사", answer: "인장·충격·굽힘시험처럼 시편에 하중을 가해 강도·인성·연성 등 기계적 성질을 확인합니다.", detailLessonTitles: ["용접결함과 비파괴검사 선택"] },
    ],
    traps: [
      { statement: "침투탐상은 표면에 열리지 않은 깊은 내부 결함까지 검출한다.", correction: "함정입니다. 침투액이 들어갈 수 있는 표면 개구 결함이 대상입니다." },
      { statement: "자분탐상은 알루미늄·세라믹을 포함한 모든 재료에 적용할 수 있다.", correction: "함정입니다. 강자성체가 기본 적용 대상입니다." },
      { statement: "방사선 사진 한 장만으로 결함의 실제 입체 깊이를 정확히 결정한다.", correction: "함정입니다. 투영 영상이므로 방향과 촬영 조건에 따른 추가 판단이 필요합니다." },
      { statement: "와전류탐상은 비전도체 내부의 깊은 결함 검사에 가장 적합하다.", correction: "함정입니다. 전도체의 표면·근표면 검사에 강점이 있습니다." },
    ],
    detailLessonTitles: ["비파괴검사", "와전류탐상", "용접결함과 비파괴검사 선택"],
  },
  {
    id: "grooves-symbols",
    part: "결함·검사·이음",
    title: "개선 홈·필릿 치수·용접 기호",
    memoryLine: "판 두께와 양면 작업 가능 여부로 홈을 고르고, 기호의 기준선·꼬리·치수를 순서대로 읽습니다.",
    facts: [
      { cue: "I·V형 홈", answer: "I형은 얇은 판과 적은 용착량에, V형은 편면 작업이 필요한 일반 맞대기 이음에 적용합니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
      { cue: "X형 홈", answer: "양면 작업이 가능한 후판에서 용착량과 각변형을 줄이는 대칭 개선입니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
      { cue: "U·H형 홈", answer: "가공은 복잡하지만 매우 두꺼운 판에서 채워 넣을 용착금속량을 줄이는 데 유리합니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
      { cue: "필릿 각장 Z", answer: "필릿 용접의 두 다리 길이를 나타내며 목두께와 같은 값으로 읽지 않습니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
      { cue: "목두께 a", answer: "필릿 용접의 유효 단면을 판단하는 이론적 두께로 각장과 구분합니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
      { cue: "길이·피치", answer: "l은 용접 길이, n×l(e)는 단속 용접의 개수·길이·간격 조건을 함께 나타냅니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
      { cue: "보조기호", answer: "현장 용접은 깃발, 온둘레 용접은 기준선과 화살표가 만나는 곳의 원으로 표시합니다.", detailLessonTitles: ["용접이음·기호와 용접입열"] },
    ],
    traps: [
      { statement: "필릿 용접의 Z와 a는 언제나 같은 길이를 뜻한다.", correction: "함정입니다. Z는 각장, a는 목두께로 서로 다른 치수입니다." },
      { statement: "X형 홈은 V형보다 항상 용착량과 각변형이 더 크다.", correction: "함정입니다. 대칭 양면 개선으로 용착량과 각변형을 줄이는 데 유리합니다." },
      { statement: "온둘레 용접은 용접 기호의 꼬리에 깃발을 그려 표시한다.", correction: "함정입니다. 깃발은 현장 용접, 원은 온둘레 용접을 뜻합니다." },
    ],
    detailLessonTitles: ["용접이음·기호와 용접입열"],
    cbtStatusNote:
      "개선 홈·필릿 치수·용접 기호에 직접 대응하는 공개·검수 완료 CBT 문항은 아직 없습니다. 관계없는 용접 문항을 대신 붙이지 않고 원문·정답·해설을 확인한 뒤 연결합니다.",
  },
  {
    id: "ppe-signs-fire",
    part: "산업안전",
    title: "보호구·안전표지·화재 구분",
    memoryLine: "위험 제거와 방호를 먼저 적용하고, 남은 위험에 맞는 보호구·표지·적응 소화설비를 고릅니다.",
    facts: [
      { cue: "보호구 원칙", answer: "제거·격리·공학적 방호를 우선하고 남는 위험에 적합한 보호구를 선택해 올바르게 착용합니다.", detailLessonTitles: ["소음·열·보호구 호환성"] },
      { cue: "용접 보호구", answer: "차광면·보안경, 용접용 장갑, 앞치마, 안전화 등은 광선·비산물·열·감전 위험에 맞춰 선택합니다.", detailLessonTitles: ["용접면·차광필터 선정", "습윤 보호구와 용접 보호복"] },
      { cue: "공구와 보호구", answer: "치핑 해머와 와이어 브러시는 슬래그 제거 공구이며 보호구와 구분합니다.", detailLessonTitles: ["소음·열·보호구 호환성"] },
      { cue: "안전표지 색", answer: "빨강은 금지·화재, 노랑은 경고, 파랑은 지시, 녹색은 안내·비상 관련 의미로 묶어 봅니다.", detailLessonTitles: ["안전표지"] },
      { cue: "화재 등급", answer: "A 일반, B 유류·인화성 액체, C 전기, D 금속 화재로 대상물을 먼저 구분합니다.", detailLessonTitles: ["소화·비상정지·잔류위험"] },
      { cue: "소화기 선정", answer: "화재 대상과 통전 여부를 확인한 뒤 표시된 적응 화재 등급에 맞는 소화기를 사용합니다.", detailLessonTitles: ["소화·비상정지·잔류위험"] },
    ],
    traps: [
      { statement: "보호구를 착용하면 환기·방호장치·에너지 차단을 생략해도 된다.", correction: "함정입니다. 보호구는 상위 위험 통제수단을 대신하지 못합니다." },
      { statement: "치핑 해머는 머리를 보호하는 개인용 보호구이다.", correction: "함정입니다. 응고 슬래그를 제거하는 작업 공구입니다." },
      { statement: "전기 화재는 통전 여부와 관계없이 물을 먼저 뿌린다.", correction: "위험한 함정입니다. 전원을 차단하고 적응성이 표시된 소화설비를 사용해야 합니다." },
    ],
    detailLessonTitles: ["소음·열·보호구 호환성", "용접면·차광필터 선정", "습윤 보호구와 용접 보호복", "안전표지", "소화·비상정지·잔류위험"],
    cbtStatusNote:
      "보호구·안전표지·화재·소화기와 직접 대응하는 용접 CBT 원문을 대조해 연결했습니다. 최대 5문제만 대표로 보이며 전체 안전 문항은 모의고사 문제은행에서 출제됩니다.",
  },
  {
    id: "gas-electrical-machine-safety",
    part: "산업안전",
    title: "가스·감전·회전체·압력설비 안전",
    memoryLine: "가연성·조연성·역류·감전·말림·과압처럼 에너지와 사고 경로를 먼저 식별합니다.",
    facts: [
      { cue: "산소", answer: "스스로 타는 연료가 아니라 연소를 돕는 조연성 가스이며 밸브와 배관에 기름이 닿지 않게 관리합니다.", detailLessonTitles: ["산소계통 청정과 조정기"] },
      { cue: "아세틸렌", answer: "가연성 가스로 용기를 세워 취급하고 누설·구리계 재료·역화 위험을 작업표준에 따라 관리합니다.", detailLessonTitles: ["아세틸렌 누설·동결·재질적합성"] },
      { cue: "역류·역화·인화", answer: "역류는 가스가 반대 호스로 흐르는 현상, 역화는 팁 쪽의 순간적 불꽃 복귀, 인화는 불꽃이 호스·혼합실 안쪽까지 진행하는 위험 상태입니다.", detailLessonTitles: ["가스호스·연결부·누설"] },
      { cue: "감전 방지", answer: "절연된 홀더와 케이블, 자동전격방지기, 건조한 보호구와 전원 차단 절차를 함께 확인합니다.", detailLessonTitles: ["자동전격방지장치", "보호접지와 귀환경로"] },
      { cue: "회전체", answer: "선반·드릴·밀링 등은 장갑과 헐거운 복장이 말려들 수 있으므로 정지·격리 후 브러시 등 지정 공구로 칩을 제거합니다.", detailLessonTitles: ["연삭·자동화설비·작업장 관리"] },
      { cue: "원형톱 방호", answer: "날접촉예방 덮개와 반발예방장치는 위험 대상이 다르므로 접촉과 킥백을 구분해 선택합니다.", detailLessonTitles: ["원형톱 안전장치"] },
      { cue: "압력설비", answer: "보일러·압력용기의 방출장치는 최고사용압력과 현행 법령·검사기준에 맞춰 설정·점검합니다.", detailLessonTitles: ["보일러 안전밸브"] },
    ],
    traps: [
      { statement: "산소는 가연성 가스이므로 산소 자체가 연료처럼 탄다.", correction: "함정입니다. 산소는 연소를 강하게 돕는 조연성 가스입니다." },
      { statement: "회전체 작업은 손을 보호하기 위해 헐거운 장갑을 끼는 것이 안전하다.", correction: "위험한 함정입니다. 장갑과 헐거운 복장은 말림·협착 위험을 키울 수 있습니다." },
      { statement: "원형톱의 날접촉예방 덮개와 반발예방장치는 같은 위험만 막는다.", correction: "함정입니다. 하나는 톱날 접촉, 다른 하나는 재료의 되튐 위험을 주로 막습니다." },
      { statement: "압력방출장치 설정값은 오래된 암기 수치만 알면 현장 확인 없이 결정할 수 있다.", correction: "함정입니다. 현행 법령·검사기준과 설비의 최고사용압력을 반드시 확인해야 합니다." },
    ],
    detailLessonTitles: ["산소계통 청정과 조정기", "아세틸렌 누설·동결·재질적합성", "가스호스·연결부·누설", "자동전격방지장치", "보호접지와 귀환경로", "연삭·자동화설비·작업장 관리", "원형톱 안전장치", "보일러 안전밸브"],
  },
  ...WRITTEN_SUBJECT_TWO_MEMORY_GUIDE_SUPPLEMENT,
];

export function getSubjectTwoMemoryGuideLessonTitles() {
  return [
    ...new Set(
      WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.flatMap(
        (bundle) => bundle.detailLessonTitles,
      ),
    ),
  ];
}
