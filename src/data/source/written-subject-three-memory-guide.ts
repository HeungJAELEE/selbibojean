export type SubjectThreeMemoryFact = {
  id: string;
  cue: string;
  answer: string;
  detailLessonTitles?: string[];
};

export type SubjectThreeFormula = {
  label: string;
  formula: string;
  note: string;
};

export type SubjectThreeTrap = {
  statement: string;
  correction: string;
};

export type SubjectThreeMemoryBundle = {
  id: string;
  part:
    | "도면·측정"
    | "가공·재료"
    | "조립·기계요소"
    | "배관·유체기계"
    | "구동설비 보전";
  title: string;
  memoryLine: string;
  facts: SubjectThreeMemoryFact[];
  formulas?: SubjectThreeFormula[];
  traps: SubjectThreeTrap[];
  detailLessonTitles: string[];
};

export const WRITTEN_SUBJECT_THREE_SOURCE_BOUNDARY =
  "통합본의 출제 흐름과 암기 문장은 최대한 유지했습니다. 다만 KS·장비별 제한값·허용 온도·체결력처럼 적용 조건에 따라 달라지는 숫자는 공식 규격이나 제조사 자료가 다시 확인되지 않으면 단정하지 않았습니다. 실제 정비 작업에서는 승인 작업표준과 해당 장비 매뉴얼을 우선해야 합니다.";

export const WRITTEN_SUBJECT_THREE_MEMORY_GUIDE: SubjectThreeMemoryBundle[] = [
  {
    id: "drawing-lines-tolerance",
    part: "도면·측정",
    title: "선·단면도·치수공차·끼워맞춤",
    memoryLine: "보이는가, 잘라 보이는가, 기준에서 얼마나 벗어나는가, 조립 후 틈새가 남는가의 순서로 판독합니다.",
    facts: [
      { id: "s3-drawing-lines-tolerance-line-priority", cue: "선의 우선순위", answer: "외형선, 숨은선, 절단선, 중심선, 무게중심선, 치수선 순으로 겹친 선을 판독합니다.", detailLessonTitles: ["기계제도 선·단면·보조기호", "투상도와 단면도의 판독"] },
      { id: "s3-drawing-lines-tolerance-section-view", cue: "단면도", answer: "온 단면도는 전체를 절단하고, 한쪽 단면도는 대칭 물체의 내부와 외부를 절반씩 함께 보여 줍니다.", detailLessonTitles: ["기계제도 선·단면·보조기호", "투상도와 단면도의 판독"] },
      { id: "s3-drawing-lines-tolerance-dimensional-tolerance", cue: "치수공차", answer: "최대 허용치수와 최소 허용치수의 차이이며, 허용차는 각 한계치수에서 기준치수를 뺀 값입니다.", detailLessonTitles: ["치수공차와 끼워맞춤 계산"] },
      { id: "s3-drawing-lines-tolerance-hole-basis-system", cue: "구멍 기준식", answer: "구멍의 아래치수허용차가 0인 H 공차역을 기준으로 두고 축의 공차 위치를 바꾸어 끼워맞춤을 정하는 방식입니다.", detailLessonTitles: ["치수공차와 끼워맞춤 계산"] },
      { id: "s3-drawing-lines-tolerance-fit-types", cue: "끼워맞춤", answer: "헐거운 끼워맞춤은 항상 틈새, 억지 끼워맞춤은 항상 죔새, 중간 끼워맞춤은 실제 치수 조합에 따라 틈새 또는 죔새가 생깁니다.", detailLessonTitles: ["치수공차와 끼워맞춤 계산"] },
      { id: "s3-drawing-lines-tolerance-drawing-symbols", cue: "제도 보조기호", answer: "지름은 ⌀, 반지름은 R, 구의 반지름은 SR, 두께는 t, 45도 모따기는 C로 표시합니다.", detailLessonTitles: ["기계제도 선·단면·보조기호"] },
    ],
    formulas: [
      { label: "공차", formula: "공차 = 최대 허용치수 - 최소 허용치수", note: "공차는 항상 양의 범위값으로 봅니다." },
      { label: "최대 틈새", formula: "구멍 최대치수 - 축 최소치수", note: "가장 큰 구멍과 가장 작은 축을 조합합니다." },
      { label: "최소 틈새", formula: "구멍 최소치수 - 축 최대치수", note: "음수이면 그 조합에서는 틈새가 아니라 죔새가 생깁니다." },
      { label: "최대 죔새", formula: "축 최대치수 - 구멍 최소치수", note: "가장 큰 축과 가장 작은 구멍을 조합합니다." },
      { label: "최소 죔새", formula: "축 최소치수 - 구멍 최대치수", note: "음수이면 그 조합에서는 죔새가 아니라 틈새가 생깁니다." },
    ],
    traps: [
      { statement: "한쪽 단면도는 대칭 물체의 절반을 완전히 제거해 내부만 표시한다.", correction: "내부와 외부 형상을 한 화면에서 함께 보여 주는 것이 핵심입니다." },
      { statement: "중간 끼워맞춤은 조립하면 언제나 작은 틈새가 생긴다.", correction: "실제 치수 조합에 따라 틈새 또는 죔새가 생길 수 있습니다." },
      { statement: "네모 상자 안의 치수는 가공자가 자유롭게 참고하는 참고치수다.", correction: "네모 상자 치수는 이론적으로 정확한 치수이며, 괄호 치수가 참고치수입니다." },
    ],
    detailLessonTitles: ["기계제도 선·단면·보조기호", "투상도와 단면도의 판독", "치수공차와 끼워맞춤 계산", "기하공차 판독", "베어링 끼워맞춤", "스프링 제도"],
  },
  {
    id: "measurement-principles",
    part: "도면·측정",
    title: "측정오차·아베의 원리·측정 방식",
    memoryLine: "참값에 가까운가는 정확도, 반복값끼리 모이는가는 정밀도이며 측정축의 일치 여부가 아베 오차를 좌우합니다.",
    facts: [
      { id: "s3-measurement-principles-systematic-error", cue: "계통오차", answer: "기기 영점, 환경, 관측 습관처럼 원인이 비교적 분명하여 보정할 수 있는 오차입니다.", detailLessonTitles: ["측정오차와 측정 방식"] },
      { id: "s3-measurement-principles-random-error", cue: "우연오차", answer: "미세 진동처럼 불규칙하게 나타나므로 반복 측정과 통계 처리로 영향을 줄입니다.", detailLessonTitles: ["측정오차와 측정 방식"] },
      { id: "s3-measurement-principles-abbe-principle", cue: "아베의 원리", answer: "측정 대상의 치수선과 측정 눈금의 기준선을 같은 직선 위에 두어 각도 오차의 확대를 막는 원리입니다.", detailLessonTitles: ["아베 원리"] },
      { id: "s3-measurement-principles-taylor-principle", cue: "테일러의 원리", answer: "통과측은 관련 치수를 동시에 검사하고 정지측은 각 요소를 개별적으로 검사하도록 한 한계게이지 원리입니다.", detailLessonTitles: ["테일러의 원리"] },
      { id: "s3-measurement-principles-direct-measurement", cue: "직접측정", answer: "버니어캘리퍼스와 마이크로미터처럼 기기의 눈금에서 치수를 바로 읽습니다.", detailLessonTitles: ["측정오차와 측정 방식", "직접측정"] },
      { id: "s3-measurement-principles-comparative-indirect-measurement", cue: "비교·간접측정", answer: "비교측정은 기준과의 차이를 읽고, 간접측정은 사인바나 삼침법처럼 다른 측정값과 계산으로 목적값을 구합니다.", detailLessonTitles: ["측정오차와 측정 방식", "비교측정기", "다이얼게이지"] },
    ],
    formulas: [
      { label: "측정오차", formula: "오차 = 측정값 - 참값", note: "기구오차의 부호를 포함해 보정 방향을 판단합니다." },
    ],
    traps: [
      { statement: "정밀도가 높은 측정기는 항상 참값에도 가깝다.", correction: "반복값이 잘 모여도 영점이 틀리면 정확도는 낮을 수 있습니다." },
      { statement: "버니어캘리퍼스는 측정선과 눈금선이 일치하므로 아베의 원리를 준수한다.", correction: "구조상 측정선과 눈금선이 어긋나므로 아베의 원리를 위배하는 대표 기기입니다." },
      { statement: "우연오차는 원인을 찾아 한 번 보정하면 완전히 제거할 수 있다.", correction: "불규칙한 산포이므로 반복 측정과 평균 처리로 영향을 줄입니다." },
    ],
    detailLessonTitles: ["측정오차와 측정 방식", "아베 원리", "직접측정", "비교측정기", "다이얼게이지"],
  },
  {
    id: "gauges-drawing-rules",
    part: "도면·측정",
    title: "게이지·표면거칠기·기계요소 제도",
    memoryLine: "게이지는 합격 판정인지 수치 측정인지부터 구분하고, 기어와 스프링은 외형선·기준선·단면 원칙을 함께 외웁니다.",
    facts: [
      { id: "s3-gauges-drawing-rules-limit-gauge", cue: "한계게이지", answer: "대량 생산 부품을 통과측과 정지측으로 빠르게 합격·불합격 판정하는 검사구입니다.", detailLessonTitles: ["한계게이지"] },
      { id: "s3-gauges-drawing-rules-gauge-block", cue: "게이지 블록", answer: "길이 기준을 조합하는 기준기로, 밀착을 이용해 필요한 치수를 만듭니다.", detailLessonTitles: ["게이지 블록"] },
      { id: "s3-gauges-drawing-rules-feeler-gauge", cue: "틈새게이지", answer: "여러 두께의 얇은 판을 조합해 조립부 간극이나 기어 틈새를 확인합니다.", detailLessonTitles: ["틈새게이지"] },
      { id: "s3-gauges-drawing-rules-gear-drawing", cue: "기어 제도", answer: "이끝원은 굵은 실선, 피치원은 가는 1점쇄선, 일반 투상의 이뿌리원은 가는 실선으로 그립니다.", detailLessonTitles: ["기어 제도", "기어 요목표"] },
      { id: "s3-gauges-drawing-rules-surface-roughness", cue: "표면거칠기", answer: "Ra는 산술평균거칠기, Rz는 최대높이거칠기이며 수준기는 거칠기 측정기가 아닙니다.", detailLessonTitles: ["표면거칠기"] },
      { id: "s3-gauges-drawing-rules-material-symbols", cue: "재료기호", answer: "SM45C는 기계구조용 탄소강처럼 재질·용도·종류 정보를 묶어 판독합니다.", detailLessonTitles: ["KS 재료기호"] },
    ],
    formulas: [
      { label: "피치원 지름", formula: "d = m × Z", note: "m은 모듈, Z는 잇수입니다." },
    ],
    traps: [
      { statement: "기어 피치원은 실제 외형이므로 굵은 실선으로 그린다.", correction: "설계 기준이 되는 가상선이므로 가는 1점쇄선으로 표시합니다." },
      { statement: "표면거칠기는 수준기의 기포 이동으로 측정한다.", correction: "수준기는 수평과 기울기를 확인하며 거칠기는 촉침식 측정기나 비교 표준편 등을 사용합니다." },
      { statement: "한계게이지는 실제 치수값을 정밀하게 읽어 기록하는 직접측정기다.", correction: "주목적은 규정 범위의 통과·정지 판정이며 수치 자체를 읽는 기기가 아닙니다." },
    ],
    detailLessonTitles: ["한계게이지", "틈새게이지", "기어 제도", "기어 요목표"],
  },
  {
    id: "machine-tools-cutting",
    part: "가공·재료",
    title: "선반·밀링·드릴·절삭 운동",
    memoryLine: "무엇이 회전하고 무엇이 이송하는지를 먼저 잡으면 공작기계와 가공 형상이 함께 정리됩니다.",
    facts: [
      { id: "s3-machine-tools-cutting-lathe", cue: "선반", answer: "공작물이 회전하고 바이트가 이송하며 외경·단면·나사·테이퍼·널링을 가공합니다.", detailLessonTitles: ["선반 회전수"] },
      { id: "s3-machine-tools-cutting-milling", cue: "밀링", answer: "여러 날을 가진 커터가 회전하고 공작물이 이송하며 평면·홈·기어 형상을 가공합니다.", detailLessonTitles: ["밀링머신 운동"] },
      { id: "s3-machine-tools-cutting-up-milling", cue: "상향절삭", answer: "커터의 절삭방향과 공작물 이송방향이 반대이며, 절삭 두께가 0에서 시작해 점차 커집니다.", detailLessonTitles: ["상향·하향절삭과 칩 형상"] },
      { id: "s3-machine-tools-cutting-down-milling", cue: "하향절삭", answer: "커터의 절삭방향과 공작물 이송방향이 같고 가공면이 좋지만 이송계의 백래시 관리가 필요합니다.", detailLessonTitles: ["상향·하향절삭과 칩 형상"] },
      { id: "s3-machine-tools-cutting-drilling-boring-reaming", cue: "드릴·보링·리밍", answer: "드릴링은 구멍 생성, 보링은 기존 구멍 확대·정밀화, 리밍은 최종 치수와 표면을 다듬는 작업입니다.", detailLessonTitles: ["드릴링머신 작업", "보링", "리밍"] },
      { id: "s3-machine-tools-cutting-taper-machining", cue: "테이퍼 가공", answer: "복식 공구대 선회, 심압대 편위, 테이퍼 장치, 총형 바이트 등을 사용합니다.", detailLessonTitles: ["테이퍼 가공"] },
    ],
    traps: [
      { statement: "선반은 바이트가 회전하고 공작물이 직선 이송하는 공작기계다.", correction: "일반적인 선반은 공작물이 회전하고 바이트가 이송합니다." },
      { statement: "하향절삭은 이송 나사의 백래시 영향을 거의 받지 않는다.", correction: "커터가 공작물을 끌어당기므로 백래시 제거 장치와 충분한 강성이 중요합니다." },
      { statement: "척의 조를 편위시키는 방법은 대표적인 테이퍼 절삭법이다.", correction: "척 조 편위는 편심 가공에 가깝고 일반적인 테이퍼 절삭법으로 보지 않습니다." },
    ],
    detailLessonTitles: ["선반 회전수", "밀링머신 운동", "상향·하향절삭과 칩 형상", "드릴링머신 작업", "보링", "리밍", "테이퍼 가공"],
  },
  {
    id: "chips-tools-finishing",
    part: "가공·재료",
    title: "칩·구성인선·연삭·정밀 다듬질",
    memoryLine: "칩 모양은 재료와 절삭조건의 결과이고, 숫돌과 정밀가공은 표면을 새롭게 드러내거나 미세하게 바로잡는 과정입니다.",
    facts: [
      { id: "s3-chips-tools-finishing-continuous-chip", cue: "유동형 칩", answer: "연성재료를 적절한 고속·큰 경사각으로 절삭할 때 연속적으로 생기며 가공면이 비교적 좋습니다.", detailLessonTitles: ["상향·하향절삭과 칩 형상"] },
      { id: "s3-chips-tools-finishing-built-up-edge", cue: "구성인선", answer: "칩 일부가 공구 날끝에 눌어붙었다 떨어지며 가공면과 치수 정밀도를 나쁘게 하는 현상입니다.", detailLessonTitles: ["구성인선"] },
      { id: "s3-chips-tools-finishing-tapping", cue: "탭 작업", answer: "밑구멍과 피치를 확인하고 탭을 직각으로 세우며, 칩을 배출해 파손을 막습니다.", detailLessonTitles: ["탭·다이스 가공", "탭 파손"] },
      { id: "s3-chips-tools-finishing-wheel-loading-glazing", cue: "눈메움·무딤", answer: "눈메움은 숫돌 기공에 칩이 끼는 현상, 무딤은 입자 날이 둥글게 닳아 절삭력이 떨어지는 현상입니다.", detailLessonTitles: ["연삭숫돌 드레싱"] },
      { id: "s3-chips-tools-finishing-dressing", cue: "드레싱", answer: "막히거나 무뎌진 숫돌 표면을 제거해 새로운 날카로운 입자를 드러내고 절삭성을 회복합니다.", detailLessonTitles: ["연삭숫돌 드레싱"] },
      { id: "s3-chips-tools-finishing-truing", cue: "트루잉", answer: "숫돌의 외형과 진원을 바로잡아 회전축에 대해 정확한 형상을 만드는 작업입니다.", detailLessonTitles: ["연삭숫돌 드레싱"] },
      { id: "s3-chips-tools-finishing-lapping", cue: "래핑", answer: "랩과 미세 연마제를 사이에 두고 상대운동시켜 높은 치수·형상 정밀도와 매끈한 표면을 얻습니다.", detailLessonTitles: ["래핑"] },
      { id: "s3-chips-tools-finishing-honing", cue: "호닝", answer: "내경에서 여러 숫돌을 회전·왕복시켜 교차무늬를 만들고 원통도와 표면을 정밀하게 다듬습니다.", detailLessonTitles: ["정밀연마가공"] },
    ],
    traps: [
      { statement: "구성인선을 줄이려면 절삭속도를 낮추고 공구 경사각을 작게 한다.", correction: "일반적으로 절삭속도와 경사각을 높이고 적절한 절삭유를 사용해 부착을 줄입니다." },
      { statement: "드레싱은 숫돌 전체 형상을 진원으로 되돌리는 작업만을 뜻한다.", correction: "드레싱은 막히거나 무뎌진 표면에서 새 입자를 드러내며, 형상 교정은 트루잉과 구분합니다." },
      { statement: "줄은 뒤로 당길 때 절삭되므로 당기는 방향에 힘을 준다.", correction: "일반적인 줄은 앞으로 밀 때 절삭하므로 되돌릴 때 힘을 빼는 것이 원칙입니다." },
    ],
    detailLessonTitles: ["상향·하향절삭과 칩 형상", "절삭공구", "구성인선", "탭·다이스 가공", "탭 파손", "연삭숫돌 드레싱", "래핑", "정밀연마가공"],
  },
  {
    id: "casting-plastic-materials",
    part: "가공·재료",
    title: "주조·소성가공·금속의 성질",
    memoryLine: "녹여 붓는가, 재결정온도 기준으로 변형하는가, 결정구조가 변형성을 좌우하는가로 구분합니다.",
    facts: [
      { id: "s3-casting-plastic-materials-casting-allowances", cue: "주조 여유", answer: "수축여유·가공여유·빼기구배를 두어 냉각수축, 후가공, 모형 인출을 보상합니다.", detailLessonTitles: ["주조 여유와 특수주조"] },
      { id: "s3-casting-plastic-materials-special-casting", cue: "특수주조", answer: "다이캐스팅은 정밀 양산, 인베스트먼트는 복잡 형상, 원심주조는 관형 제품에 유리합니다.", detailLessonTitles: ["주조 여유와 특수주조"] },
      { id: "s3-casting-plastic-materials-hot-working", cue: "열간가공", answer: "재결정온도 이상에서 변형저항이 작고 큰 변형이 가능하지만 산화와 치수 정밀도에 불리합니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
      { id: "s3-casting-plastic-materials-cold-working", cue: "냉간가공", answer: "재결정온도 이하에서 가공경화가 생기며 표면과 치수 정밀도가 좋지만 큰 힘이 필요합니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소", "냉간가공 성질"] },
      { id: "s3-casting-plastic-materials-malleability", cue: "전성", answer: "압축력이나 타격을 받아 얇은 판으로 퍼지는 성질입니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
      { id: "s3-casting-plastic-materials-ductility", cue: "연성", answer: "인장력을 받아 가는 선으로 길게 늘어나는 성질입니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
      { id: "s3-casting-plastic-materials-crystal-lattices", cue: "결정격자", answer: "FCC는 조밀충진 슬립면에서 전위 이동이 비교적 쉬워 전연성이 좋고, BCC와 HCP는 온도·결정방향과 활성 슬립 조건의 영향을 더 크게 받습니다.", detailLessonTitles: ["금속 결정격자와 변형"] },
      { id: "s3-casting-plastic-materials-specific-gravity", cue: "비중에 따른 재료 분류", answer: "시험상의 관용 분류에서는 비중 4.5를 경계로 그보다 작으면 경금속, 크면 중금속으로 구분합니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
      { id: "s3-casting-plastic-materials-steel-five-elements", cue: "강의 5대 원소", answer: "강의 기본 5대 원소는 C·Si·Mn·P·S이며 Fe는 강의 바탕 금속이므로 이 다섯 원소에 포함하지 않습니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
      { id: "s3-casting-plastic-materials-phosphorus-shortness", cue: "P의 취성 영향", answer: "인은 상온에서 취성을 증가시키는 상온취성(냉간취성)과 연결해 외웁니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
      { id: "s3-casting-plastic-materials-sulfur-shortness", cue: "S의 취성 영향", answer: "황은 고온가공 때 균열이 쉬워지는 적열취성(열간취성)과 연결해 외웁니다.", detailLessonTitles: ["금속의 가공온도·성질·5대 원소"] },
    ],
    traps: [
      { statement: "냉간가공은 재결정온도 이상에서 하므로 가공경화가 생기지 않는다.", correction: "재결정온도 이하에서 수행하며 가공경화와 높은 치수 정밀도가 대표 특징입니다." },
      { statement: "주물자는 목재 모형의 재질을 기준으로 수축량을 정한다.", correction: "응고·냉각되는 주물 금속의 재질과 수축 특성을 기준으로 선택합니다." },
      { statement: "전성은 재료를 잡아당겨 가는 선으로 만드는 성질이다.", correction: "잡아당겨 선으로 늘어나는 성질은 연성이고, 전성은 얇은 판으로 펴지는 성질입니다." },
    ],
    detailLessonTitles: ["주조 여유와 특수주조", "금속의 가공온도·성질·5대 원소", "냉간가공 성질", "금속 결정격자와 변형"],
  },
  {
    id: "heat-treatment-testing",
    part: "가공·재료",
    title: "열처리·표면경화·재료시험",
    memoryLine: "담금질로 단단하게, 뜨임으로 질기게, 풀림으로 부드럽게, 불림으로 조직을 고르게 만든다고 연결합니다.",
    facts: [
      { id: "s3-heat-treatment-testing-quenching", cue: "담금질", answer: "가열 후 급랭하여 경도와 강도를 높이지만 취성과 변형 위험이 커질 수 있습니다.", detailLessonTitles: ["담금질"] },
      { id: "s3-heat-treatment-testing-tempering", cue: "뜨임", answer: "담금질한 강을 재가열해 취성을 줄이고 필요한 인성과 경도를 조정하는 처리입니다.", detailLessonTitles: ["뜨임"] },
      { id: "s3-heat-treatment-testing-annealing", cue: "풀림", answer: "재료를 연화하고 가공성을 높이며 잔류응력을 줄이기 위해 가열 후 서서히 냉각합니다.", detailLessonTitles: ["풀림 열처리"] },
      { id: "s3-heat-treatment-testing-normalizing", cue: "불림", answer: "강을 적정 온도로 가열한 뒤 공기 중에서 냉각해 조직을 미세화·표준화합니다.", detailLessonTitles: ["불림"] },
      { id: "s3-heat-treatment-testing-carburizing", cue: "침탄", answer: "저탄소강 표면에 탄소를 확산시킨 뒤 경화해 표면은 단단하고 중심은 질기게 만듭니다.", detailLessonTitles: ["표면경화 열처리"] },
      { id: "s3-heat-treatment-testing-nitriding", cue: "질화", answer: "질소를 표면에 확산시켜 높은 표면경도와 내마모성을 얻으며 처리 뒤 별도 담금질이 필요하지 않습니다.", detailLessonTitles: ["질화처리"] },
      { id: "s3-heat-treatment-testing-induction-hardening", cue: "고주파경화", answer: "유도전류로 표면을 빠르게 가열한 뒤 급랭해 필요한 부분만 경화합니다.", detailLessonTitles: ["고주파 담금질"] },
      { id: "s3-heat-treatment-testing-flame-hardening", cue: "화염경화", answer: "화염으로 표면을 가열한 뒤 급랭해 큰 부품이나 국부 표면을 경화합니다.", detailLessonTitles: ["표면경화 열처리"] },
      { id: "s3-heat-treatment-testing-metal-diffusion", cue: "금속침투", answer: "칼로라이징은 Al, 세라다이징은 Zn, 크로마이징은 Cr, 실리코나이징은 Si를 침투시킵니다.", detailLessonTitles: ["칼로라이징"] },
      { id: "s3-heat-treatment-testing-material-testing", cue: "재료시험", answer: "인장시험은 강도와 연신, 충격시험은 인성, 경도시험은 압입·반발 저항, 피로시험은 반복하중 수명을 봅니다.", detailLessonTitles: ["응력–변형률·Fe-C 상태도와 재료시험"] },
    ],
    traps: [
      { statement: "뜨임은 소둔이라고 부르며 풀림과 같은 열처리다.", correction: "뜨임은 소려 또는 템퍼링이고, 소둔은 풀림을 뜻하므로 목적과 냉각과정이 다릅니다." },
      { statement: "질화처리는 경화 뒤 반드시 담금질해야 하므로 변형이 큰 편이다.", correction: "질화층을 형성한 뒤 별도 담금질이 필요하지 않아 변형이 비교적 작은 것이 장점입니다." },
      { statement: "인은 적열취성, 황은 상온취성을 일으키는 대표 원소다.", correction: "인은 상온취성, 황은 적열취성과 연결해 구분합니다." },
    ],
    detailLessonTitles: ["담금질", "뜨임", "풀림 열처리", "불림", "표면경화 열처리", "질화처리", "고주파 담금질", "칼로라이징", "응력–변형률·Fe-C 상태도와 재료시험"],
  },
  {
    id: "assembly-fasteners",
    part: "조립·기계요소",
    title: "지그·체결공구·나사·키·핀",
    memoryLine: "안내까지 하면 지그, 고정만 하면 고정구이며 체결요소는 토크·풀림·전단·위치결정 역할로 나눕니다.",
    facts: [
      { id: "s3-assembly-fasteners-jig", cue: "지그", answer: "공작물을 고정하면서 드릴 부시 등으로 공구의 위치와 경로까지 안내합니다.", detailLessonTitles: ["지그·고정구와 보전 수공구"] },
      { id: "s3-assembly-fasteners-fixture", cue: "고정구", answer: "공작물을 정해진 자세로 지지·고정하지만 공구 경로를 직접 안내하지는 않습니다.", detailLessonTitles: ["지그·고정구와 보전 수공구"] },
      { id: "s3-assembly-fasteners-torque-wrench", cue: "토크렌치", answer: "규정 토크로 볼트 축력을 균일하게 만들어 과체결과 체결 편차를 줄입니다.", detailLessonTitles: ["볼트 체결", "볼트 체결토크"] },
      { id: "s3-assembly-fasteners-screw-extractor", cue: "스크루 엑스트렉터", answer: "파손된 볼트 중심에 구멍을 내고 역나사 공구를 물려 잔여 볼트를 빼냅니다.", detailLessonTitles: ["고착볼트 제거"] },
      { id: "s3-assembly-fasteners-fastener-locking", cue: "풀림방지", answer: "이중너트·분할핀·혀붙이와셔·와이어링·혐기성 접착제처럼 회전이나 축방향 이동을 막는 방법을 씁니다.", detailLessonTitles: ["나사 풀림방지", "분할핀"] },
      { id: "s3-assembly-fasteners-key", cue: "키", answer: "축과 보스 사이에서 토크를 전달하며 키홈은 축 중심선과 평행하게 가공합니다.", detailLessonTitles: ["키 맞춤"] },
      { id: "s3-assembly-fasteners-pin", cue: "핀", answer: "부품의 위치를 정하거나 두 부품을 연결하며 일반적으로 전단하중을 받습니다.", detailLessonTitles: ["분할핀"] },
      { id: "s3-assembly-fasteners-cotter", cue: "코터", answer: "두께가 일정하고 폭 방향으로 테이퍼진 쐐기형 요소로 축방향 결합과 조정에 씁니다.", detailLessonTitles: ["코터"] },
      { id: "s3-assembly-fasteners-screw-self-locking", cue: "나사 자립 조건", answer: "이상적인 사각나사에서 리드각 λ가 마찰각 φ보다 작으면 하중이 스스로 나사를 역회전시키기 어려워 자립합니다.", detailLessonTitles: ["나사 자립 조건"] },
    ],
    formulas: [
      { label: "체결 토크", formula: "T = F × l", note: "힘의 작용선까지 거리와 힘의 곱이며 단위를 함께 확인합니다." },
    ],
    traps: [
      { statement: "고정구는 공작물을 고정하고 동시에 드릴의 이동 경로까지 안내한다.", correction: "공구 안내 기능까지 포함하면 지그이며 고정구는 주로 공작물 고정만 담당합니다." },
      { statement: "캡너트와 평와셔는 대표적인 회전 풀림 방지 전용 부품이다.", correction: "캡너트는 끝단 보호·기밀, 평와셔는 면압 분산 목적이 중심이며 별도 풀림방지 수단과 구분합니다." },
      { statement: "키홈은 축을 가로질러 직각으로 가공해야 토크 전달력이 커진다.", correction: "일반 키홈은 축 중심선과 평행하게 가공하며 직각 홈은 축 단면을 약화시킵니다." },
    ],
    detailLessonTitles: ["지그·고정구와 보전 수공구", "공구 정의", "볼트 체결", "볼트 체결토크", "나사 풀림방지", "나사 자립 조건", "키 맞춤", "분할핀", "코터", "고착볼트 제거"],
  },
  {
    id: "shaft-coupling-bearing",
    part: "조립·기계요소",
    title: "축정렬·커플링·클러치·베어링",
    memoryLine: "운전 중 끊을 수 있는가, 어긋남을 얼마나 허용하는가, 회전체를 어떤 접촉으로 지지하는가로 구분합니다.",
    facts: [
      { id: "s3-shaft-coupling-bearing-coupling", cue: "커플링", answer: "두 축을 지속적으로 연결해 동력을 전달하며 운전 중 임의 분리용 장치가 아닙니다.", detailLessonTitles: ["머프 커플링"] },
      { id: "s3-shaft-coupling-bearing-clutch", cue: "클러치", answer: "운전 중에도 필요에 따라 동력을 연결하거나 차단할 수 있습니다.", detailLessonTitles: ["습식다판 클러치"] },
      { id: "s3-shaft-coupling-bearing-rigid-flexible-couplings", cue: "고정·가요 커플링", answer: "고정형은 정렬이 정확한 축에, 가요성은 작은 편심·각도오차와 충격을 흡수해야 하는 축계에 씁니다.", detailLessonTitles: ["머프 커플링", "플렉시블 커플링"] },
      { id: "s3-shaft-coupling-bearing-oldham-coupling", cue: "올덤 커플링", answer: "평행하지만 중심이 어긋난 두 축 사이에서 중간 원판의 두 직각 홈이 미끄러지며 회전을 전달합니다.", detailLessonTitles: ["올덤 커플링"] },
      { id: "s3-shaft-coupling-bearing-shaft-alignment", cue: "축정렬", answer: "다이얼게이지와 심을 사용해 평행·각도 오차를 줄이며 진동, 베어링 과열, 커플링 조기손상을 예방합니다.", detailLessonTitles: ["축 중심내기"] },
      { id: "s3-shaft-coupling-bearing-bearing-damage", cue: "베어링 손상", answer: "피로 박리는 플레이킹, 미끄럼 손상은 스미어링, 열 고착은 소착, 헐거운 끼워맞춤의 헛돎은 크리프입니다.", detailLessonTitles: ["구름베어링 손상"] },
      { id: "s3-shaft-coupling-bearing-bearing-assembly", cue: "베어링 조립", answer: "회전하중을 받는 링은 보통 더 단단한 끼워맞춤이 필요하며, 힘은 끼우는 링에 직접 전달합니다.", detailLessonTitles: ["베어링 열박음", "구름베어링 구성"] },
    ],
    traps: [
      { statement: "플렉시블 커플링은 어긋남을 흡수하므로 설치할 때 중심내기가 필요 없다.", correction: "허용 오차가 있어도 초기 축정렬을 해야 진동과 탄성부품의 조기마모를 줄일 수 있습니다." },
      { statement: "클러치는 운전 중 분리할 수 없는 영구 축이음이다.", correction: "운전 중 동력을 연결·차단하는 요소가 클러치이고 지속 연결 요소가 커플링입니다." },
      { statement: "베어링 크리프는 끼워맞춤이 지나치게 빡빡해 링이 축과 함께 고착되는 현상이다.", correction: "끼워맞춤이 헐거워 링과 축 또는 하우징 사이에서 상대 미끄럼이 생기는 현상입니다." },
    ],
    detailLessonTitles: ["축 중심내기", "올덤 커플링", "플렉시블 커플링", "머프 커플링", "습식다판 클러치", "구름베어링 손상", "베어링 열박음", "구름베어링 구성"],
  },
  {
    id: "power-transmission",
    part: "조립·기계요소",
    title: "기어·벨트·체인·브레이크·스프링",
    memoryLine: "맞물림, 마찰, 링크, 제동, 탄성의 다섯 전달 원리를 손상 원인과 함께 외웁니다.",
    facts: [
      { id: "s3-power-transmission-gear-damage", cue: "기어 손상", answer: "피팅·스폴링은 접촉피로, 스코어링·스커핑은 유막 파괴와 미끄럼열에 의한 손상입니다.", detailLessonTitles: ["기어 맞물림·백래시·손상", "기어 표면피로", "기어 마모원인"] },
      { id: "s3-power-transmission-backlash", cue: "백래시", answer: "맞물린 치면 사이의 틈새로 윤활과 열팽창을 허용하지만 과대하면 충격·소음·정밀도 저하가 생깁니다.", detailLessonTitles: ["기어 맞물림·백래시·손상"] },
      { id: "s3-power-transmission-v-belt", cue: "V벨트", answer: "홈의 쐐기효과로 큰 마찰력을 얻으며 장력·접촉각·마찰계수가 전달능력에 영향을 줍니다.", detailLessonTitles: ["V벨트", "V벨트 장력"] },
      { id: "s3-power-transmission-chain", cue: "체인", answer: "스프로킷과 맞물려 큰 미끄럼 없이 전달하지만 적절한 처짐과 윤활, 정렬 관리가 필요합니다.", detailLessonTitles: ["체인 설치", "체인 처짐", "핀틀체인"] },
      { id: "s3-power-transmission-brake-fade", cue: "브레이크 페이드", answer: "반복 제동으로 마찰재 온도가 올라 마찰계수가 낮아지고 제동력이 떨어지는 현상입니다.", detailLessonTitles: ["브레이크 페이드와 베이퍼록"] },
      { id: "s3-power-transmission-brake-vapor-lock", cue: "베이퍼록", answer: "브레이크액이 과열·기화해 압축 가능한 기포가 생기면서 유압 전달과 제동력이 약해지는 현상입니다.", detailLessonTitles: ["브레이크 페이드와 베이퍼록"] },
      { id: "s3-power-transmission-rubber-spring", cue: "고무스프링", answer: "압축 변형과 감쇠에는 유리하지만 오일·열·인장하중에 취약할 수 있습니다.", detailLessonTitles: ["고무스프링"] },
    ],
    formulas: [
      { label: "직렬 스프링", formula: "k = (k₁ × k₂) / (k₁ + k₂)", note: "직렬로 연결하면 전체 강성은 각 스프링보다 작아집니다." },
    ],
    traps: [
      { statement: "스코어링은 반복 접촉응력으로 치면에 작은 구멍이 생기는 표면피로다.", correction: "작은 점식 피로손상은 피팅이고, 스코어링은 유막 파괴와 마찰열로 생기는 긁힘·융착 손상입니다." },
      { statement: "V벨트는 맞물림 전동이므로 운전 중 미끄럼이 전혀 발생하지 않는다.", correction: "마찰 전동이므로 크리프와 미끄럼이 생길 수 있으며 장력과 홈 상태를 관리해야 합니다." },
      { statement: "브레이크 마찰면에는 방청유를 발라야 제동력이 오래 유지된다.", correction: "마찰면의 유분은 마찰계수를 떨어뜨리므로 오염을 제거하고 규정 상태를 유지해야 합니다." },
    ],
    detailLessonTitles: ["기어 맞물림·백래시·손상", "기어 표면피로", "기어 마모원인", "V벨트", "V벨트 장력", "체인 설치", "체인 처짐", "핀틀체인", "브레이크 페이드와 베이퍼록", "브레이크", "브레이크 마찰재", "디스크브레이크 누유", "고무스프링"],
  },
  {
    id: "piping-valves-seals",
    part: "배관·유체기계",
    title: "관이음·밸브·씰·접착제",
    memoryLine: "분해 정비성, 열팽창 흡수, 유량·방향 제어, 접촉 여부의 순서로 배관 부품을 구분합니다.",
    facts: [
      { id: "s3-piping-valves-seals-union", cue: "유니언", answer: "배관을 회전시키지 않고도 분해할 수 있어 소구경 나사배관과 기기 주변 정비에 유리합니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교", "유니언 이음"] },
      { id: "s3-piping-valves-seals-flange", cue: "플랜지", answer: "원판형 플랜지를 볼트·너트와 개스킷으로 결합하며 대구경·고압 배관의 분해 정비에 유리합니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교"] },
      { id: "s3-piping-valves-seals-expansion-joint", cue: "신축이음", answer: "벨로즈·슬리브·스위블·루프형처럼 배관의 열팽창과 변위를 흡수합니다.", detailLessonTitles: ["신축이음"] },
      { id: "s3-piping-valves-seals-gate-valve", cue: "게이트밸브", answer: "완전 개방 때 유로가 곧아 압력손실이 작으므로 전개·전폐에 적합하고 미세 유량조절에는 부적합합니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교", "게이트밸브"] },
      { id: "s3-piping-valves-seals-globe-valve", cue: "글로브밸브", answer: "유로가 굽어 압력손실은 크지만 밸브 개도에 따른 유량 조절에 적합합니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교"] },
      { id: "s3-piping-valves-seals-check-valve", cue: "체크밸브", answer: "유체가 한 방향으로만 흐르게 하여 배관의 역류를 자동으로 막습니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교"] },
      { id: "s3-piping-valves-seals-butterfly-valve", cue: "버터플라이밸브", answer: "원판을 약 90도 회전시켜 대구경 관로를 빠르게 개폐·조절합니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교", "버터플라이밸브"] },
      { id: "s3-piping-valves-seals-mechanical-seal", cue: "메커니컬실", answer: "회전링과 고정링의 정밀 접촉면으로 회전축 누설을 줄이며 냉각·윤활·정렬 관리가 필요합니다.", detailLessonTitles: ["메커니컬실"] },
      { id: "s3-piping-valves-seals-labyrinth-seal", cue: "래버린스실", answer: "축과 직접 접촉하지 않는 미로형 좁은 틈에서 유체 저항을 반복시켜 누설을 줄입니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교", "비접촉 씰"] },
      { id: "s3-piping-valves-seals-anaerobic-adhesive", cue: "혐기성 접착제", answer: "금속 사이의 좁은 틈에서 공기가 차단되면 경화해 나사 고정과 틈새 밀봉에 쓰입니다.", detailLessonTitles: ["배관 이음·밸브·씰 비교"] },
    ],
    traps: [
      { statement: "플랜지이음은 배관의 열팽창을 흡수하는 대표적인 신축이음이다.", correction: "플랜지는 분해 가능한 고정 접속이고 열팽창 흡수는 벨로즈·루프형 같은 신축이음이 담당합니다." },
      { statement: "게이트밸브는 디스크를 조금만 열어 미세 유량을 조절할 때 가장 적합하다.", correction: "부분 개방 운전은 시트와 디스크를 손상시킬 수 있어 전개·전폐 운전이 기본입니다." },
      { statement: "메커니컬실은 접촉면이 없으므로 무급유·무냉각 상태에서도 사용할 수 있다.", correction: "정밀 접촉면을 사용하므로 운전 조건에 맞는 윤활·냉각과 정렬이 필요합니다." },
    ],
    detailLessonTitles: ["배관 이음·밸브·씰 비교", "유니언 이음", "신축이음", "게이트밸브", "버터플라이밸브", "메커니컬실", "비접촉 씰"],
  },
  {
    id: "fluid-machinery-troubles",
    part: "배관·유체기계",
    title: "캐비테이션·수격·서징·펌프·송풍기·압축기",
    memoryLine: "기포 붕괴, 물기둥 충격, 주기적 맥동을 구분한 뒤 흡입·회전방향·배관저항·회전체 균형을 점검합니다.",
    facts: [
      { id: "s3-fluid-machinery-troubles-cavitation", cue: "캐비테이션", answer: "국부 압력이 증기압 아래로 내려가 기포가 생기고 고압부에서 붕괴해 소음·진동·침식을 일으킵니다.", detailLessonTitles: ["캐비테이션"] },
      { id: "s3-fluid-machinery-troubles-water-hammer", cue: "수격작용", answer: "흐르던 유체를 급격히 차단할 때 압력파가 관로를 왕복하며 충격과 진동을 일으킵니다.", detailLessonTitles: ["수격작용"] },
      { id: "s3-fluid-machinery-troubles-surging", cue: "서징", answer: "펌프·압축기·송풍기와 관로의 특성이 맞지 않아 압력과 유량이 주기적으로 크게 변동하는 불안정 현상입니다.", detailLessonTitles: ["펌프·송풍기·압축기 분류와 이상현상"] },
      { id: "s3-fluid-machinery-troubles-pump-no-discharge", cue: "펌프 무토출", answer: "마중물 부족, 흡입측 공기 유입·막힘, 과대한 흡입양정, 잘못된 회전방향을 먼저 확인합니다.", detailLessonTitles: ["펌프 흡입불량"] },
      { id: "s3-fluid-machinery-troubles-blower", cue: "송풍기", answer: "터보형은 임펠러로 속도에너지를 주고, 루츠블로어는 로터 사이 체적을 이동시키는 용적형입니다.", detailLessonTitles: ["펌프·송풍기·압축기 분류와 이상현상", "송풍기 구성", "루츠블로어"] },
      { id: "s3-fluid-machinery-troubles-positive-displacement-compressor", cue: "용적형 압축기", answer: "왕복·스크루·베인·루츠형처럼 일정 체적의 기체를 가둔 뒤 체적을 줄이거나 이송해 압력을 높입니다.", detailLessonTitles: ["펌프·송풍기·압축기 분류와 이상현상", "왕복압축기"] },
      { id: "s3-fluid-machinery-troubles-turbo-compressor", cue: "터보형 압축기", answer: "원심·축류형처럼 임펠러로 기체에 속도에너지를 준 뒤 디퓨저 등에서 압력에너지로 바꿉니다.", detailLessonTitles: ["펌프·송풍기·압축기 분류와 이상현상"] },
    ],
    traps: [
      { statement: "캐비테이션은 펌프 토출압력이 너무 높아 기포가 흡입관으로 들어오는 현상이다.", correction: "흡입측 국부 압력이 증기압 아래로 떨어져 액체 자체가 기화하고 기포가 붕괴하는 현상입니다." },
      { statement: "수격작용을 줄이려면 밸브를 가능한 한 빠르게 닫아 유체를 즉시 멈춘다.", correction: "급폐가 압력파를 키우므로 밸브를 서서히 조작하고 완충·우회·체크 장치를 검토합니다." },
      { statement: "루츠블로어는 임펠러가 공기에 속도에너지를 주는 대표 터보형 송풍기다.", correction: "맞물리지 않는 로터가 일정 체적의 공기를 이동시키는 용적형 송풍기입니다." },
    ],
    detailLessonTitles: ["캐비테이션", "수격작용", "펌프 흡입불량", "송풍기 구성", "루츠블로어", "왕복압축기"],
  },
  {
    id: "motor-startup-maintenance",
    part: "구동설비 보전",
    title: "전동기·축정렬·시운전·점검",
    memoryLine: "분해 전 표시, 조립 중 청결·교차체결, 시운전 전 무부하 확인, 운전 중 전류·온도·진동·소음 기록으로 이어갑니다.",
    facts: [
      { id: "s3-motor-startup-maintenance-disassembly-assembly", cue: "분해·조립", answer: "배선과 부품 위치를 표시하고 분해 순서를 기록한 뒤 청결을 유지하며 역순으로 조립합니다.", detailLessonTitles: ["기계 조립 기준과 시운전 절차"] },
      { id: "s3-motor-startup-maintenance-cross-tightening", cue: "교차체결", answer: "플랜지와 커버 볼트는 가조립 후 대각선 순서로 조금씩 조여 면압을 고르게 합니다.", detailLessonTitles: ["기계 조립 기준과 시운전 절차"] },
      { id: "s3-motor-startup-maintenance-no-load-test", cue: "무부하시운전", answer: "회전방향, 이상음, 진동, 베어링 온도, 무부하 전류, 누유·누설을 확인한 뒤 부하를 올립니다.", detailLessonTitles: ["기계 조립 기준과 시운전 절차"] },
      { id: "s3-motor-startup-maintenance-three-phase-loss", cue: "3상 결상", answer: "한 상이 끊기면 남은 상 전류가 증가하고 토크가 떨어져 과열·기동불량·소손 위험이 커집니다.", detailLessonTitles: ["3상전동기 결상"] },
      { id: "s3-motor-startup-maintenance-motor-overheating", cue: "전동기 과열", answer: "과부하, 잦은 기동, 전압 불평형·결상, 냉각불량, 베어링 이상을 전기와 기계 양쪽에서 확인합니다.", detailLessonTitles: ["전동기 과열", "전동기 고장진단"] },
      { id: "s3-motor-startup-maintenance-inspection-record", cue: "점검 기록", answer: "측정 위치·운전조건·기준값·관찰값·조치 결과를 같은 형식으로 남겨 추세를 비교합니다.", detailLessonTitles: ["점검 체크리스트"] },
    ],
    traps: [
      { statement: "3상 전동기의 한 상이 끊겨도 나머지 두 상이 정상 전압이면 계속 정격 운전할 수 있다.", correction: "결상 운전은 전류 불평형과 과열을 일으키므로 즉시 정지하고 전원·보호계전·단자를 점검해야 합니다." },
      { statement: "플랜지 볼트는 한쪽을 먼저 최종 토크까지 조인 뒤 반대쪽을 조인다.", correction: "가조립 후 대각선 순서로 단계적으로 조여 면압과 중심을 고르게 맞춥니다." },
      { statement: "무부하시운전은 부하가 없으므로 진동·전류·베어링 온도를 기록할 필요가 없다.", correction: "기준 상태를 확보해야 부하운전의 변화를 비교할 수 있으므로 기본 운전값을 기록합니다." },
    ],
    detailLessonTitles: ["기계 조립 기준과 시운전 절차", "3상전동기 결상", "전동기 과열", "전동기 고장진단", "점검 체크리스트"],
  },
  {
    id: "maintenance-tools-lubrication",
    part: "구동설비 보전",
    title: "윤활 기능·보전 수공구",
    memoryLine: "윤활유는 마찰 저감·냉각·방청·밀봉·세정으로 나누고, 수공구는 용도와 안전한 힘의 방향을 함께 외웁니다.",
    facts: [
      { id: "s3-maintenance-tools-lubrication-five-functions", cue: "윤활유 5대 기능", answer: "마찰·마모 저감, 냉각, 방청, 밀봉, 세정·분산의 다섯 기능으로 정리합니다.", detailLessonTitles: ["윤활유 5대 기능"] },
      { id: "s3-maintenance-tools-lubrication-spanner", cue: "스패너", answer: "볼트·너트의 맞는 치수를 사용하고 몸 쪽으로 당겨 작업하며, 파이프를 끼워 임의로 길이를 늘리지 않습니다.", detailLessonTitles: ["지그·고정구와 보전 수공구"] },
      { id: "s3-maintenance-tools-lubrication-hammer", cue: "해머", answer: "사용 전 머리의 균열·버섯머리, 자루의 갈라짐과 쐐기 고정을 확인하고 타격면을 깨끗하고 건조하게 유지합니다.", detailLessonTitles: ["지그·고정구와 보전 수공구"] },
      { id: "s3-maintenance-tools-lubrication-chisel", cue: "정", answer: "금속을 절단·깎는 타격 공구이며 버섯처럼 퍼진 머리는 다듬고 보안경 등 필요한 보호구를 착용합니다.", detailLessonTitles: ["지그·고정구와 보전 수공구"] },
      { id: "s3-maintenance-tools-lubrication-file", cue: "줄", answer: "손잡이를 단단히 끼운 뒤 거친 눈에서 고운 눈 순으로 사용하고, 쇳가루는 입으로 불지 말고 줄솔로 제거합니다.", detailLessonTitles: ["지그·고정구와 보전 수공구"] },
    ],
    traps: [
      { statement: "스패너가 짧으면 파이프를 끼워 길이를 늘려 더 큰 토크를 준다.", correction: "공구 파손과 미끄러짐 위험이 있으므로 맞는 규격의 렌치나 토크 공구를 사용합니다." },
      { statement: "해머 타격면에는 미끄럼을 줄이기 위해 기름을 충분히 바른다.", correction: "타격면의 기름은 미끄러짐과 비산 위험을 키우므로 깨끗하고 건조하게 유지합니다." },
      { statement: "윤활유는 마찰만 줄이므로 냉각·방청·밀봉·세정과는 관계없다.", correction: "윤활유는 운전 조건에 따라 열과 오염물질을 옮기고 부식과 누설도 줄이는 복합 기능을 합니다." },
    ],
    detailLessonTitles: ["윤활유 5대 기능", "지그·고정구와 보전 수공구"],
  },
];

export function getSubjectThreeMemoryGuideLessonTitles() {
  return [
    ...new Set(
      WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.flatMap(
        (bundle) => bundle.detailLessonTitles,
      ),
    ),
  ];
}
