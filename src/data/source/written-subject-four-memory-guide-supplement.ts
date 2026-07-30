import type { SubjectFourMemoryBundle } from "@/data/source/written-subject-four-memory-guide";

/**
 * The original integrated notes contain these examinable sections outside the
 * first 16 memory bundles.  They stay in a separate source file so the
 * source-gap audit can distinguish added coverage from the preserved core.
 */
export const WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE_SUPPLEMENT: SubjectFourMemoryBundle[] =
  [
    {
      id: "diagnosis-methods-sensors",
      part: "계측·진단",
      title: "진단기법·회전수·진동센서",
      memoryLine:
        "진단 대상에 따라 진동·오일·비파괴·응력 측정을 고르고, 회전수와 센서의 접촉·비접촉 원리를 구분합니다.",
      facts: [
        {
          id: "s4-diagnosis-methods-sensors-diagnosis-methods",
          cue: "진단기법 4계열",
          answer:
            "대표 진단기법은 진동법, 오일분석법, 비파괴검사, 응력측정법으로 나눕니다. 회전기계 상태는 진동법, 마모입자는 오일분석법이 중심입니다.",
          detailLessonTitles: ["설비진단 기법"],
        },
        {
          id: "s4-diagnosis-methods-sensors-stroboscope",
          cue: "스트로보스코프",
          answer:
            "주기적으로 점멸하는 빛으로 회전체가 정지한 것처럼 보이게 하여 비접촉으로 회전수를 확인합니다.",
          detailLessonTitles: ["회전수 측정"],
        },
        {
          id: "s4-diagnosis-methods-sensors-sensor-classification",
          cue: "진동센서 분류",
          answer:
            "변위센서는 저주파 축거동, 속도센서는 설비의 종합 진동, 가속도센서는 고주파 충격과 베어링·기어 결함에 유리합니다.",
          detailLessonTitles: ["진동 센서"],
        },
        {
          id: "s4-diagnosis-methods-sensors-piezo-accelerometer",
          cue: "압전형 가속도센서",
          answer:
            "질량에 작용하는 관성력으로 압전소자에 전하가 생기는 원리를 이용하며 고주파·충격 진동 측정에 적합합니다.",
          detailLessonTitles: ["압전형 진동센서"],
        },
        {
          id: "s4-diagnosis-methods-sensors-eddy-current",
          cue: "와전류 변위센서",
          answer:
            "도전성 회전체와 프로브 사이의 간극 변화에 따른 와전류 변화를 전압으로 바꾸어 축 변위와 축중심 위치를 비접촉 측정합니다.",
          detailLessonTitles: ["와전류 변위센서"],
        },
      ],
      traps: [
        {
          statement: "스트로보스코프는 회전체에 직접 접촉해 회전수를 잰다.",
          correction:
            "점멸광을 이용하는 비접촉식 광학 측정입니다. 별도의 안전거리와 회전체 방호는 지켜야 합니다.",
        },
        {
          statement: "가속도센서는 저주파 축변위 측정에 가장 적합하다.",
          correction:
            "저주파 축거동은 변위센서, 고주파 충격은 가속도센서가 일반적으로 유리합니다.",
        },
        {
          statement: "와전류 변위센서는 비도전성 재료의 내부 결함을 투과 촬영한다.",
          correction:
            "도전성 회전체와 프로브 사이 간극 변화를 비접촉으로 측정하는 센서이며 방사선 투과검사와 다릅니다.",
        },
      ],
      detailLessonTitles: [
        "설비진단 기법",
        "회전수 측정",
        "진동 센서",
        "압전형 진동센서",
        "와전류 변위센서",
      ],
    },
    {
      id: "noise-calculation-control",
      part: "진동·소음",
      title: "음파·데시벨 합성·소음기·동특성",
      memoryLine:
        "음원 형태와 dB 계산을 먼저 구분하고, 고주파는 흡음형·저주파는 팽창형 소음기를 우선 연결합니다.",
      facts: [
        {
          id: "s4-noise-calculation-control-plane-spherical-wave",
          cue: "평면파·구면파",
          answer:
            "평면파는 파면이 진행방향에 수직인 평면으로 나란히 진행하고, 구면파는 점음원에서 모든 방향으로 퍼져 세기가 거리의 제곱에 반비례합니다.",
          detailLessonTitles: ["구면파"],
        },
        {
          id: "s4-noise-calculation-control-db-sum",
          cue: "소음레벨 합성",
          answer:
            "dB는 로그량이므로 산술합을 하지 않습니다. 같은 크기의 독립 소음원 두 개가 합쳐지면 3 dB 증가합니다.",
          detailLessonTitles: ["소음레벨 합성"],
        },
        {
          id: "s4-noise-calculation-control-mass-law",
          cue: "차음 질량법칙",
          answer:
            "같은 조건에서 차음재의 면밀도 또는 주파수가 커질수록 투과손실이 증가합니다. 질량이 두 배가 되면 이상적인 단일벽에서 약 6 dB 증가합니다.",
          detailLessonTitles: ["저주파 소음 차음"],
        },
        {
          id: "s4-noise-calculation-control-silencer",
          cue: "소음기 분류",
          answer:
            "흡음형은 다공질 흡음재로 고주파에, 팽창·공명형은 단면변화와 공명으로 저주파에 주로 적용합니다.",
          detailLessonTitles: ["소음기", "팽창형 소음기"],
        },
        {
          id: "s4-noise-calculation-control-fast-slow",
          cue: "소음계 Fast·Slow",
          answer:
            "Fast는 변동이 빠른 소음을 빠르게 추종하고, Slow는 변동을 완화해 비교적 안정된 지시값을 읽을 때 사용합니다.",
          detailLessonTitles: ["소음계 동특성"],
        },
      ],
      traps: [
        {
          statement: "90 dB 소음원 두 개의 합은 180 dB이다.",
          correction:
            "동일한 독립 소음원 두 개의 합은 에너지가 두 배가 되어 93 dB입니다.",
        },
        {
          statement: "변동이 큰 소음은 Slow, 일정한 소음은 Fast로 읽는다.",
          correction:
            "일반적인 시험 판단에서는 빠른 변동을 Fast로 추종하고, 안정된 평균 지시는 Slow로 읽습니다.",
        },
        {
          statement: "흡음형 소음기는 저주파, 팽창형 소음기는 고주파 소음에만 적합하다.",
          correction:
            "대표적인 연결은 흡음형-고주파, 팽창·공명형-저주파입니다.",
        },
      ],
      detailLessonTitles: [
        "구면파",
        "소음레벨 합성",
        "저주파 소음 차음",
        "소음기",
        "팽창형 소음기",
        "소음계 동특성",
      ],
    },
    {
      id: "maintenance-foundation-standards",
      part: "보전·신뢰성",
      title: "설비분류·보전 3요소·표준·공사완급",
      memoryLine:
        "설비의 역할을 분류한 뒤 열화 방지·측정·회복으로 보전 활동을 나누고, 표준과 공사 우선순위로 실행합니다.",
      facts: [
        {
          id: "s4-maintenance-foundation-standards-facility-classification",
          cue: "설비 기능별 분류",
          answer:
            "생산설비는 생산에 직접 관여하고, 유틸리티설비는 전력·용수·증기·압축공기 등을 공급하며, 관리·판매설비는 간접 지원과 판매 서비스를 담당합니다.",
          detailLessonTitles: ["유틸리티설비"],
        },
        {
          id: "s4-maintenance-foundation-standards-three-elements",
          cue: "보전 3요소",
          answer:
            "설비보전의 기본 활동은 열화 방지, 열화 측정, 열화 회복입니다. 일상점검·진단·수리를 각각 연결해 구분합니다.",
          detailLessonTitles: ["설비보전 요소"],
        },
        {
          id: "s4-maintenance-foundation-standards-maintenance-standards",
          cue: "보전표준",
          answer:
            "설비 성능·점검·정비·수리 기준과 방법을 문서화해 작업자와 시점이 달라도 같은 판정과 작업이 가능하게 합니다.",
          detailLessonTitles: ["설비보전 표준", "정비표준"],
        },
        {
          id: "s4-maintenance-foundation-standards-planned-emergency",
          cue: "계획공사·긴급공사",
          answer:
            "계획공사는 여유기간 안에 일정과 자원을 배정해 시행하고, 긴급공사는 생산·안전에 중대한 영향을 주는 고장을 즉시 처리합니다.",
          detailLessonTitles: ["계획공사", "긴급공사"],
        },
        {
          id: "s4-maintenance-foundation-standards-urgency",
          cue: "공사 완급도",
          answer:
            "안전·생산 영향, 고장 확대 가능성, 납기와 자원 조건을 함께 보고 긴급도와 착공 순서를 정합니다.",
          detailLessonTitles: ["공사 완급도", "공사 완급순위"],
        },
      ],
      traps: [
        {
          statement: "압축공기와 용수 공급설비는 제품을 직접 가공하므로 생산설비다.",
          correction:
            "생산을 지원하는 동력원 공급 기능이므로 일반적으로 유틸리티설비로 분류합니다.",
        },
        {
          statement: "열화 지연이 설비보전 3요소의 정식 명칭이다.",
          correction:
            "정식 구분은 열화 방지·열화 측정·열화 회복입니다.",
        },
        {
          statement: "긴급공사는 예산이 남을 때 다음 정기정비까지 미루는 공사다.",
          correction:
            "생산·안전 영향이 크거나 고장 확대 우려가 있어 즉시 처리해야 하는 공사입니다.",
        },
      ],
      detailLessonTitles: [
        "유틸리티설비",
        "설비보전 요소",
        "설비보전 표준",
        "정비표준",
        "계획공사",
        "긴급공사",
        "공사 완급도",
        "공사 완급순위",
      ],
    },
    {
      id: "reliability-oee-calculation",
      part: "보전·신뢰성",
      title: "고장률·수리율·OEE 계산",
      memoryLine:
        "신뢰성은 고장까지의 시간, 보전성은 복구시간으로 보고 OEE는 시간가동률·성능가동률·양품률을 곱합니다.",
      facts: [
        {
          id: "s4-reliability-oee-calculation-failure-repair-rate",
          cue: "고장률·수리율",
          answer:
            "지수분포 가정에서 고장률 λ는 평균고장간격의 역수, 수리율 μ는 평균수리시간 MTTR의 역수로 봅니다.",
          detailLessonTitles: ["고장률", "수리율"],
        },
        {
          id: "s4-reliability-oee-calculation-time-availability",
          cue: "시간가동률",
          answer:
            "부하시간에서 정지로스를 뺀 가동시간을 부하시간으로 나눈 비율입니다.",
          detailLessonTitles: ["시간가동률", "OEE 시간가동률"],
        },
        {
          id: "s4-reliability-oee-calculation-performance",
          cue: "성능가동률",
          answer:
            "실제 생산속도가 이론 또는 기준속도에 얼마나 가까운지 나타내며 속도저하와 공회전·순간정지를 반영합니다.",
          detailLessonTitles: ["성능가동률 계산"],
        },
        {
          id: "s4-reliability-oee-calculation-quality",
          cue: "양품률",
          answer:
            "총생산량 중 양품수량의 비율로 불량과 재작업 로스를 반영합니다.",
          detailLessonTitles: ["설비 유효가동률"],
        },
        {
          id: "s4-reliability-oee-calculation-oee",
          cue: "OEE",
          answer:
            "설비종합효율 OEE는 시간가동률×성능가동률×양품률이며 세 비율은 같은 백분율 체계로 환산해 곱합니다.",
          detailLessonTitles: ["OEE 시간가동률", "성능가동률 계산"],
        },
      ],
      formulas: [
        {
          label: "고장률·수리율",
          formula: "λ = 1 / MTBF, μ = 1 / MTTR",
          note: "지수분포를 전제로 한 기본 관계입니다.",
        },
        {
          label: "설비종합효율",
          formula: "OEE = 시간가동률 × 성능가동률 × 양품률",
          note: "각 항목을 소수 또는 동일한 백분율 체계로 맞춰 계산합니다.",
        },
      ],
      traps: [
        {
          statement: "OEE는 시간가동률만 높이면 언제나 높아진다.",
          correction:
            "성능가동률이나 양품률이 낮으면 전체 곱도 낮아집니다.",
        },
        {
          statement: "MTTR이 길수록 수리율이 높다.",
          correction:
            "지수분포 가정에서 μ=1/MTTR이므로 MTTR이 길면 수리율은 낮아집니다.",
        },
        {
          statement: "시간가동률·성능가동률·양품률은 백분율 숫자를 그대로 곱한다.",
          correction:
            "각 비율을 소수로 바꾸어 곱한 뒤 필요하면 백분율로 환산해야 합니다.",
        },
      ],
      detailLessonTitles: [
        "고장률",
        "수리율",
        "시간가동률",
        "OEE 시간가동률",
        "성능가동률 계산",
        "설비 유효가동률",
      ],
    },
    {
      id: "lubrication-properties-deterioration",
      part: "윤활관리",
      title: "윤활유 물성·열화·수분·오염",
      memoryLine:
        "저온 유동성·고온 안전성·물 분리성·오염도를 따로 판정하고, 숫자는 장비와 유종 조건이 확인된 경우에만 적용합니다.",
      facts: [
        {
          id: "s4-lubrication-properties-deterioration-flash-point",
          cue: "인화점",
          answer:
            "윤활유 증기에 외부 불꽃을 접근시켰을 때 순간적으로 불이 붙는 최저온도로, 연소가 계속되는 연소점과 구분합니다.",
          detailLessonTitles: ["인화점"],
        },
        {
          id: "s4-lubrication-properties-deterioration-oxidation",
          cue: "산화·열화",
          answer:
            "열·산소·금속촉매·수분은 산화를 촉진해 점도와 산가를 높이고 슬러지·바니시를 만들 수 있습니다.",
          detailLessonTitles: ["윤활유 열화", "윤활유 산화"],
        },
        {
          id: "s4-lubrication-properties-deterioration-demulsibility",
          cue: "항유화성",
          answer:
            "물과 섞인 윤활유가 다시 물과 기름으로 분리되는 성질이며 수분과 접촉하는 순환계에서 중요합니다.",
          detailLessonTitles: ["항유화성"],
        },
        {
          id: "s4-lubrication-properties-deterioration-contamination",
          cue: "오염도",
          answer:
            "입자 크기별 개수를 계수해 청정도를 관리하며, 유압계통에서는 밸브 고착과 마모를 막기 위해 여과와 샘플링 위치를 함께 관리합니다.",
          detailLessonTitles: ["윤활유 오염도", "윤활유 청정도"],
        },
        {
          id: "s4-lubrication-properties-deterioration-field-check",
          cue: "현장 열화판정",
          answer:
            "색·냄새·침전·수분의 간이점검은 이상 징후를 찾는 선별검사이며, 교환 판정은 유종별 시험기준과 분석결과로 확정합니다.",
          detailLessonTitles: ["윤활유 열화 간이판정", "윤활유 시험판정"],
        },
      ],
      traps: [
        {
          statement: "인화점은 불을 붙인 뒤 연소가 계속되는 최저온도다.",
          correction:
            "순간 점화는 인화점, 점화 후 연소 지속은 연소점입니다.",
        },
        {
          statement: "현장 색상 확인만으로 모든 윤활유의 교환시기를 확정할 수 있다.",
          correction:
            "간이점검은 이상 선별용이며 유종·장비별 시험기준과 분석값이 필요합니다.",
        },
        {
          statement: "항유화성이 좋다는 것은 물과 기름이 오래 안정적으로 섞인다는 뜻이다.",
          correction:
            "윤활유의 항유화성은 혼입된 물과 기름이 잘 분리되는 성질입니다.",
        },
      ],
      detailLessonTitles: [
        "인화점",
        "윤활유 열화",
        "윤활유 산화",
        "항유화성",
        "윤활유 오염도",
        "윤활유 청정도",
        "윤활유 열화 간이판정",
        "윤활유 시험판정",
      ],
    },
    {
      id: "grease-thickeners-tests",
      part: "윤활관리",
      title: "그리스 증주제·이유·안정성",
      memoryLine:
        "그리스는 기유와 증주제 조합으로 판단하며 내열·내수성과 혼용 가능 여부를 증주제 종류와 시험값으로 확인합니다.",
      facts: [
        {
          id: "s4-grease-thickeners-tests-lithium",
          cue: "리튬계 그리스",
          answer:
            "내열성·내수성·기계적 안정성이 비교적 균형 잡혀 일반 산업용으로 널리 사용됩니다.",
          detailLessonTitles: ["그리스 선정"],
        },
        {
          id: "s4-grease-thickeners-tests-sodium",
          cue: "나트륨계 그리스",
          answer:
            "내열성은 비교적 좋지만 내수성이 약해 물과 접촉하는 개소에는 부적합합니다.",
          detailLessonTitles: ["나트륨계 그리스"],
        },
        {
          id: "s4-grease-thickeners-tests-calcium",
          cue: "칼슘계 그리스",
          answer:
            "내수성은 좋지만 전통적 칼슘비누 그리스는 높은 온도에 불리하므로 사용온도 조건을 확인합니다.",
          detailLessonTitles: ["그리스 선정"],
        },
        {
          id: "s4-grease-thickeners-tests-compatibility",
          cue: "증주제·혼용",
          answer:
            "서로 다른 증주제의 그리스를 섞으면 구조가 무너져 연화·경화·이유가 생길 수 있으므로 호환성과 제조사 지침을 먼저 확인합니다.",
          detailLessonTitles: ["그리스 혼용"],
        },
        {
          id: "s4-grease-thickeners-tests-bleeding-stability",
          cue: "이유도·전단안정성",
          answer:
            "이유도는 그리스에서 기유가 분리되는 정도이고, 혼화·전단안정성은 반복 전단 뒤 주도가 얼마나 유지되는지를 봅니다.",
          detailLessonTitles: ["그리스 이유도", "그리스 혼화안정도"],
        },
      ],
      traps: [
        {
          statement: "나트륨계 그리스는 내수성이 좋아 물 접촉부에 가장 적합하다.",
          correction:
            "나트륨계는 내수성이 약한 것이 대표 함정입니다.",
        },
        {
          statement: "증주제가 다른 그리스도 주도번호만 같으면 바로 혼합해도 된다.",
          correction:
            "증주제와 첨가제의 호환성을 먼저 확인해야 합니다.",
        },
        {
          statement: "이유도와 혼화안정도는 모두 그리스의 적점만 측정하는 시험이다.",
          correction:
            "이유도는 기유 분리, 혼화안정도는 반복 전단 뒤 주도 변화를 보는 서로 다른 지표입니다.",
        },
      ],
      detailLessonTitles: [
        "그리스 선정",
        "나트륨계 그리스",
        "그리스 혼용",
        "그리스 이유도",
        "그리스 혼화안정도",
      ],
    },
    {
      id: "machine-element-lubrication-analysis",
      part: "윤활관리",
      title: "오일분석·압축기·유압·베어링 윤활",
      memoryLine:
        "분석법은 검출대상으로, 윤활유 선정은 기계요소의 속도·하중·온도·오염 조건으로 구분합니다.",
      facts: [
        {
          id: "s4-machine-element-lubrication-analysis-oil-analysis",
          cue: "오일분석법",
          answer:
            "페로그래피는 자력으로 마모입자를 분리해 크기·형상을 보고, SOAP·ICP는 금속원소의 발광·흡광 스펙트럼을 분석합니다.",
          detailLessonTitles: ["오일분석 진단", "SOAP와 페로그래피"],
        },
        {
          id: "s4-machine-element-lubrication-analysis-reciprocating-compressor",
          cue: "왕복동 압축기 윤활",
          answer:
            "실린더부와 크랭크부의 윤활조건을 구분하고 탄소퇴적, 밸브오염, 토출온도와 윤활유 공급상태를 점검합니다.",
          detailLessonTitles: ["왕복동 압축기 윤활", "왕복압축기 윤활유"],
        },
        {
          id: "s4-machine-element-lubrication-analysis-turbo-compressor",
          cue: "터보압축기 윤활",
          answer:
            "고속 회전체 베어링의 냉각·청정도·산화안정성과 강제순환계의 압력·유량·필터 상태가 중요합니다.",
          detailLessonTitles: ["터보압축기 윤활"],
        },
        {
          id: "s4-machine-element-lubrication-analysis-hydraulic-oil",
          cue: "유압유 오염관리",
          answer:
            "입자와 수분은 밸브 고착·마모·산화를 일으키므로 현행 청정도 등급, 필터, 탱크 호흡기와 샘플링 위치를 함께 관리합니다.",
          detailLessonTitles: ["윤활유 오염도", "유압유 열화원인"],
        },
        {
          id: "s4-machine-element-lubrication-analysis-bearing-grease",
          cue: "베어링 그리스 충전",
          answer:
            "과다 충전은 교반저항과 온도상승을 만들 수 있으므로 베어링 구조·속도·하중·하우징 공간과 제조사 기준에 따라 충전합니다.",
          detailLessonTitles: ["구름베어링 그리스 충전"],
        },
      ],
      traps: [
        {
          statement: "SOAP는 자석으로 큰 철분입자의 형상을 직접 관찰하는 분석법이다.",
          correction:
            "자력 분리와 입자 형상 관찰은 페로그래피, 원소분석은 SOAP·ICP 계열입니다.",
        },
        {
          statement: "구름베어링은 빈 공간을 그리스로 가득 채울수록 좋다.",
          correction:
            "과다 충전은 발열을 일으킬 수 있어 구조와 운전조건에 맞는 충전량을 지켜야 합니다.",
        },
        {
          statement: "왕복동 압축기와 터보압축기는 같은 윤활조건만 확인하면 된다.",
          correction:
            "왕복동은 실린더·크랭크부와 퇴적을, 터보는 고속 베어링과 강제순환계의 냉각·청정도를 구분해 봅니다.",
        },
      ],
      detailLessonTitles: [
        "오일분석 진단",
        "SOAP와 페로그래피",
        "왕복동 압축기 윤활",
        "왕복압축기 윤활유",
        "터보압축기 윤활",
        "윤활유 오염도",
        "유압유 열화원인",
        "구름베어링 그리스 충전",
      ],
    },
    {
      id: "gear-damage-types",
      part: "윤활관리",
      title: "기어 손상 판독",
      memoryLine:
        "윤활막 파괴 손상과 반복 접촉피로 손상을 분리하고, 치면에 나타난 홈·박리·용착 흔적을 이름과 연결합니다.",
      facts: [
        {
          id: "s4-gear-damage-types-scoring",
          cue: "스코어링",
          answer:
            "고하중·고속에서 윤활막이 파괴되어 치면이 순간 용착되고 미끄럼방향으로 뜯긴 자국이 생기는 손상입니다.",
          detailLessonTitles: ["기어 스코어링"],
        },
        {
          id: "s4-gear-damage-types-pitting",
          cue: "피팅",
          answer:
            "반복 접촉응력으로 치면에 작은 구멍 모양의 박리가 생기는 표면피로 손상입니다.",
          detailLessonTitles: ["기어 피팅"],
        },
        {
          id: "s4-gear-damage-types-spalling",
          cue: "스폴링",
          answer:
            "피팅보다 크고 불규칙한 조각이 떨어져 나가는 진행된 표면피로 박리입니다.",
          detailLessonTitles: ["기어 스폴링"],
        },
        {
          id: "s4-gear-damage-types-ridging",
          cue: "리징",
          answer:
            "치면에 진행방향과 나란한 가는 능선이나 홈이 줄지어 나타나는 손상입니다.",
          detailLessonTitles: ["기어 리징"],
        },
        {
          id: "s4-gear-damage-types-device-boundary",
          cue: "판정 조건",
          answer:
            "손상명은 치면 형상만이 아니라 하중·속도·점도·극압성·정렬과 재질 조건을 함께 확인해 판정합니다.",
          detailLessonTitles: ["기어 윤활대책", "기어윤활 영향인자"],
        },
      ],
      traps: [
        {
          statement: "피팅은 윤활막 파괴로 치면이 순간 용착되어 길게 뜯긴 손상이다.",
          correction:
            "그 설명은 스코어링에 가깝고, 피팅은 반복 접촉피로로 생기는 작은 점상 박리입니다.",
        },
        {
          statement: "스폴링은 피팅보다 작고 얕은 초기 점상 손상이다.",
          correction:
            "스폴링은 비교적 큰 조각이 불규칙하게 떨어지는 진행된 박리입니다.",
        },
        {
          statement: "치면에 길게 뜯긴 흔적이 있으면 하중·점도·정렬 조건과 무관하게 모두 피팅이다.",
          correction:
            "길게 긁히고 용착된 흔적은 스코어링 가능성이 크며 운전·윤활 조건을 함께 확인해야 합니다.",
        },
      ],
      detailLessonTitles: [
        "기어 스코어링",
        "기어 피팅",
        "기어 스폴링",
        "기어 리징",
        "기어 윤활대책",
        "기어윤활 영향인자",
      ],
    },
  ];
