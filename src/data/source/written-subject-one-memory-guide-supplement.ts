import type { SubjectOneMemoryBundle } from "@/data/source/written-subject-one-memory-guide";

export const WRITTEN_SUBJECT_ONE_MEMORY_GUIDE_SUPPLEMENT: SubjectOneMemoryBundle[] =
  [
    {
      id: "fluid-calculation-extended",
      part: "공유압 기초",
      title: "복합 기체법칙·유출·동력·펌프효율",
      memoryLine:
        "법칙의 일정 조건과 단위를 먼저 확인하고, 유량·압력·효율을 같은 단위계로 맞춘 뒤 계산합니다.",
      facts: [
        {
          id: "s1-fluid-calculation-extended-combined-gas-law",
          cue: "보일-샤를 법칙",
          answer:
            "같은 양의 기체에서 압력·체적·절대온도가 함께 변하면 P₁V₁/T₁=P₂V₂/T₂를 적용하며 압력과 온도는 절대값을 씁니다.",
          detailLessonTitles: ["보일 법칙", "샤를의 법칙"],
        },
        {
          id: "s1-fluid-calculation-extended-torricelli",
          cue: "토리첼리 정리",
          answer:
            "큰 수조의 작은 구멍에서 이상 유출속도는 v=√(2gh)이며 실제 유량은 유량계수와 구멍 면적을 함께 적용합니다.",
          detailLessonTitles: ["베르누이 정리"],
        },
        {
          id: "s1-fluid-calculation-extended-hydraulic-power",
          cue: "유압 동력",
          answer:
            "SI 단위에서는 수동력 P=pQ이고 입력 축동력은 손실을 고려해 수동력을 전체효율로 나눕니다.",
          detailLessonTitles: ["유압펌프 용적효율"],
        },
        {
          id: "s1-fluid-calculation-extended-pump-efficiency",
          cue: "펌프 3효율",
          answer:
            "용적효율은 누설에 따른 실제유량, 기계효율은 마찰·토크손실, 전효율은 두 효율의 곱으로 구분합니다.",
          detailLessonTitles: ["유압펌프 용적효율"],
        },
        {
          id: "s1-fluid-calculation-extended-displacement-flow",
          cue: "행정체적·토출량",
          answer:
            "행정체적은 1회전당 이론 배제체적이고 이론유량은 행정체적×회전수, 실제유량은 여기에 용적효율을 곱합니다.",
          detailLessonTitles: ["유압펌프 토출용적"],
        },
      ],
      formulas: [
        {
          label: "복합 기체법칙",
          formula: "P₁V₁/T₁ = P₂V₂/T₂",
          note: "절대압력과 절대온도를 사용합니다.",
        },
        {
          label: "펌프 실제유량",
          formula: "Q = q·n·ηᵥ",
          note: "q의 회전당 체적 단위와 n의 시간 단위를 맞춥니다.",
        },
      ],
      traps: [
        {
          statement: "보일-샤를 계산에는 게이지압력과 섭씨온도를 그대로 넣는다.",
          correction:
            "비율식에는 절대압력과 절대온도를 사용해야 합니다.",
        },
        {
          statement: "내부누설이 증가하면 펌프 용적효율이 증가한다.",
          correction:
            "같은 이론유량에서 실제 토출량이 줄어 용적효율이 낮아집니다.",
        },
        {
          statement: "펌프 전효율은 용적효율과 기계효율을 더한 값이다.",
          correction:
            "전효율은 두 효율을 같은 비율 체계로 맞춰 곱합니다.",
        },
      ],
      detailLessonTitles: [
        "보일 법칙",
        "샤를의 법칙",
        "베르누이 정리",
        "유압펌프 용적효율",
        "유압펌프 토출용적",
      ],
    },
    {
      id: "compressor-air-treatment-details",
      part: "공유압 기기·회로",
      title: "압축기 세분류·다단압축·건조기",
      memoryLine:
        "용적형과 동력형을 작동원리로 나눈 뒤 냉각·저장·분리·건조의 처리 순서를 연결합니다.",
      facts: [
        {
          id: "s1-compressor-air-treatment-details-reciprocating-rotary",
          cue: "왕복식·회전식",
          answer:
            "왕복식은 피스톤·다이어프램의 왕복으로 체적을 줄이고, 회전식은 스크루·베인·루츠 등의 회전으로 연속 압축합니다.",
          detailLessonTitles: ["공기압축기 분류", "회전식 공기압축기"],
        },
        {
          id: "s1-compressor-air-treatment-details-turbo",
          cue: "원심식·축류식",
          answer:
            "원심식과 축류식은 임펠러·익렬에서 얻은 속도에너지를 디퓨저 등에서 압력에너지로 바꾸는 동력형입니다.",
          detailLessonTitles: ["공기압축기 분류", "압축기 작동원리"],
        },
        {
          id: "s1-compressor-air-treatment-details-multistage",
          cue: "다단압축·인터쿨러",
          answer:
            "단 사이에서 공기를 냉각하면 다음 단의 비체적과 압축일이 줄고 토출온도 상승도 억제됩니다.",
          detailLessonTitles: ["압축기 작동원리", "공기압축기"],
        },
        {
          id: "s1-compressor-air-treatment-details-treatment-order",
          cue: "압축공기 처리 순서",
          answer:
            "일반 흐름은 압축기→후부냉각기→공기탱크→주관로 필터·건조기→기기 앞 FRL이며 응축수 배출점을 함께 둡니다.",
          detailLessonTitles: ["애프터쿨러", "공기탱크 부속", "FRL 서비스유닛"],
        },
        {
          id: "s1-compressor-air-treatment-details-dryer-types",
          cue: "냉각·흡수·흡착 건조",
          answer:
            "냉각식은 노점 이하 냉각·응축, 흡수식은 조해성 약제, 흡착식은 실리카겔·활성알루미나 같은 다공질 고체 표면을 이용합니다.",
          detailLessonTitles: ["압축공기 건조", "에어드라이어 형식", "흡착식 에어드라이어"],
        },
      ],
      traps: [
        {
          statement: "원심식과 축류식 압축기는 갇힌 체적을 줄이는 용적형이다.",
          correction:
            "두 형식은 속도에너지를 압력에너지로 바꾸는 동력형입니다.",
        },
        {
          statement: "흡착식 건조기는 조해성 약제가 물에 녹는 원리만 사용한다.",
          correction:
            "다공질 고체 표면에 수분이 달라붙는 흡착을 이용하며 흡수식과 구분합니다.",
        },
        {
          statement: "후부냉각기는 액추에이터 뒤에서 배기공기를 냉각한다.",
          correction:
            "압축기 토출 직후의 고온 공기를 냉각해 수분 분리를 돕습니다.",
        },
      ],
      detailLessonTitles: [
        "공기압축기 분류",
        "회전식 공기압축기",
        "압축기 작동원리",
        "공기압축기",
        "애프터쿨러",
        "공기탱크 부속",
        "FRL 서비스유닛",
        "압축공기 건조",
        "에어드라이어 형식",
        "흡착식 에어드라이어",
      ],
    },
    {
      id: "hydraulic-pumps-motors-details",
      part: "공유압 기기·회로",
      title: "기어·베인·피스톤·트로코이드 펌프",
      memoryLine:
        "구조·용량가변 여부·압력범위·맥동을 비교하고 모터는 에너지 흐름을 반대로 읽습니다.",
      facts: [
        {
          id: "s1-hydraulic-pumps-motors-details-gear",
          cue: "기어펌프",
          answer:
            "구조가 단순하고 정용량형으로 쓰기 쉬우나 이 맞물림에 따른 맥동·소음과 내부누설을 관리합니다.",
          detailLessonTitles: ["용적식 유압펌프", "기어펌프 캐비테이션"],
        },
        {
          id: "s1-hydraulic-pumps-motors-details-vane",
          cue: "베인펌프",
          answer:
            "로터 슬롯의 베인이 캠링에 밀착해 용적을 만들며 비교적 저맥동·저소음이고 편심량 조절로 가변용량화할 수 있습니다.",
          detailLessonTitles: ["베인펌프 특성"],
        },
        {
          id: "s1-hydraulic-pumps-motors-details-piston",
          cue: "피스톤펌프",
          answer:
            "축방향·반경방향 피스톤의 왕복으로 토출하며 고압·고효율용에 적합하고 사판각 등으로 토출량을 바꿀 수 있습니다.",
          detailLessonTitles: ["피스톤펌프", "가변용량 피스톤펌프"],
        },
        {
          id: "s1-hydraulic-pumps-motors-details-trochoid",
          cue: "트로코이드펌프",
          answer:
            "내접 로터가 편심 회전하며 외측로터 잇수가 내측보다 하나 많고 윤활유 공급 등 비교적 저압 회로에 사용됩니다.",
          detailLessonTitles: ["트로코이드펌프"],
        },
        {
          id: "s1-hydraulic-pumps-motors-details-motor-types",
          cue: "유압모터 분류",
          answer:
            "대표 유압모터는 기어·베인·피스톤형이며 유압에너지를 연속 회전과 토크로 변환합니다.",
          detailLessonTitles: ["유압모터", "유압모터 분류"],
        },
      ],
      traps: [
        {
          statement: "벌류트펌프는 고압 유압회로의 대표 용적형 펌프다.",
          correction:
            "벌류트펌프는 대표적인 원심형 비용적식 펌프입니다.",
        },
        {
          statement: "트로코이드펌프는 외측로터의 잇수가 내측보다 하나 적다.",
          correction:
            "외측로터의 잇수가 내측로터보다 하나 많습니다.",
        },
        {
          statement: "유압모터는 회전 기계에너지를 유압에너지로 바꾸는 발생장치다.",
          correction:
            "그 설명은 펌프이며 모터는 유압에너지를 회전 기계에너지로 바꿉니다.",
        },
      ],
      detailLessonTitles: [
        "용적식 유압펌프",
        "기어펌프 캐비테이션",
        "베인펌프 특성",
        "피스톤펌프",
        "가변용량 피스톤펌프",
        "트로코이드펌프",
        "유압모터",
        "유압모터 분류",
      ],
    },
    {
      id: "valves-centers-special-circuits",
      part: "공유압 기기·회로",
      title: "압력밸브·중립센터·논리밸브·속도회로",
      memoryLine:
        "압력제어 기능, 중앙위치의 포트 연결, 논리 출력조건, 교축 위치를 차례로 판독합니다.",
      facts: [
        {
          id: "s1-valves-centers-special-circuits-pressure-valves",
          cue: "압력밸브 5종",
          answer:
            "릴리프는 최고압력 제한, 감압은 2차측 저압 유지, 시퀀스는 순서, 언로드는 펌프 무부하, 카운터밸런스는 자중하중 제어에 사용합니다.",
          detailLessonTitles: ["압력제어밸브 분류", "릴리프밸브", "감압밸브와 릴리프밸브", "시퀀스밸브", "언로드밸브 회로", "카운터밸런스밸브"],
        },
        {
          id: "s1-valves-centers-special-circuits-centers",
          cue: "4/3 중립센터",
          answer:
            "오픈은 전 포트 연통, 클로즈드는 전 포트 차단, 탠덤은 P-T 연결·A/B 차단, 플로트는 P 차단·A/B-T 연결입니다.",
          detailLessonTitles: ["클로즈드센터 밸브", "방향제어밸브 기호"],
        },
        {
          id: "s1-valves-centers-special-circuits-logic-valves",
          cue: "셔틀·2압·급속배기",
          answer:
            "셔틀은 어느 한 입력의 OR, 2압밸브는 두 입력 모두의 AND, 급속배기는 실린더 배기를 대기로 직접 빼 속도를 높입니다.",
          detailLessonTitles: ["셔틀밸브", "2압밸브", "급속배기밸브"],
        },
        {
          id: "s1-valves-centers-special-circuits-speed-control",
          cue: "미터인·미터아웃·블리드오프",
          answer:
            "미터인은 입구, 미터아웃은 출구를 교축하고 블리드오프는 공급유 일부를 탱크로 우회해 속도를 조절합니다.",
          detailLessonTitles: ["미터인 회로", "미터아웃 회로", "블리드오프 회로와 복수 실린더 동기회로"],
        },
        {
          id: "s1-valves-centers-special-circuits-lock-brake",
          cue: "로크·브레이크 회로",
          answer:
            "로크회로는 부하 위치를 유지하고 브레이크회로는 관성 회전하는 유압모터가 펌프작용하며 생기는 캐비테이션·과속을 억제합니다.",
          detailLessonTitles: ["유압 로크회로", "유압모터 브레이크회로"],
        },
      ],
      traps: [
        {
          statement: "탠덤센터는 P·A·B·T를 모두 막아 펌프에도 계속 부하를 건다.",
          correction:
            "탠덤센터는 P와 T를 연결해 펌프를 무부하시키고 A·B는 막습니다.",
        },
        {
          statement: "셔틀밸브는 두 입력이 동시에 들어와야 출력되는 AND 밸브다.",
          correction:
            "셔틀은 OR, 두 입력을 모두 요구하는 것은 2압밸브입니다.",
        },
        {
          statement: "미터아웃은 실린더로 들어가는 공급유량만 교축한다.",
          correction:
            "실린더에서 나가는 유량을 교축해 배압을 형성합니다.",
        },
      ],
      detailLessonTitles: [
        "압력제어밸브 분류",
        "릴리프밸브",
        "감압밸브와 릴리프밸브",
        "시퀀스밸브",
        "언로드밸브 회로",
        "카운터밸런스밸브",
        "클로즈드센터 밸브",
        "방향제어밸브 기호",
        "셔틀밸브",
        "2압밸브",
        "급속배기밸브",
        "미터인 회로",
        "미터아웃 회로",
        "블리드오프 회로와 복수 실린더 동기회로",
        "유압 로크회로",
        "유압모터 브레이크회로",
      ],
    },
    {
      id: "actuator-types-piping-details",
      part: "공유압 기기·회로",
      title: "특수 실린더·쿠션·주배관",
      memoryLine:
        "힘·행정·설치공간·양방향 면적을 기준으로 실린더를 고르고 배관은 드레인 흐름과 압력손실을 봅니다.",
      facts: [
        {
          id: "s1-actuator-types-piping-details-double-rod",
          cue: "양로드 실린더",
          answer:
            "양쪽 로드 지름이 같으면 전진·후진 유효면적이 같아 같은 압력과 유량에서 힘과 속도가 같습니다.",
          detailLessonTitles: ["양로드 실린더"],
        },
        {
          id: "s1-actuator-types-piping-details-telescopic",
          cue: "텔레스코프 실린더",
          answer:
            "여러 단의 튜브가 순차로 펴져 짧은 설치길이로 긴 행정을 얻지만 각 단의 면적 차로 힘과 속도가 달라질 수 있습니다.",
          detailLessonTitles: ["텔레스코프 실린더"],
        },
        {
          id: "s1-actuator-types-piping-details-rodless",
          cue: "로드리스·다위치",
          answer:
            "로드리스는 긴 로드 돌출공간을 줄이고, 다위치는 실린더 행정 조합으로 둘 이상의 정지 위치를 만듭니다.",
          detailLessonTitles: ["로드리스 실린더", "다위치 실린더"],
        },
        {
          id: "s1-actuator-types-piping-details-ram-impact",
          cue: "램형·충격실린더",
          answer:
            "램형은 큰 단면의 램으로 한 방향 큰 힘을 내고, 충격실린더는 저장된 공기와 급가속으로 짧은 타격력을 냅니다.",
          detailLessonTitles: ["램형 실린더", "충격실린더"],
        },
        {
          id: "s1-actuator-types-piping-details-main-pipe",
          cue: "공압 주배관",
          answer:
            "주배관은 흐름방향으로 완만한 경사를 주고 최저점에 드레인을 두며 분기관은 응축수가 들어가지 않도록 상부에서 취출합니다.",
          detailLessonTitles: ["공압 주배관", "공압배관 문제"],
        },
      ],
      traps: [
        {
          statement: "양로드 실린더는 후진 유효면적이 항상 더 작다.",
          correction:
            "양쪽 로드 지름이 같으면 양방향 유효면적도 같습니다.",
        },
        {
          statement: "텔레스코프 실린더는 짧은 행정과 긴 설치길이가 필요할 때 사용한다.",
          correction:
            "짧은 설치길이에서 긴 행정을 얻는 것이 핵심입니다.",
        },
        {
          statement: "공압 주배관의 분기관은 응축수를 함께 보내기 위해 아래쪽에서 뽑는다.",
          correction:
            "응축수 유입을 줄이도록 일반적으로 주관 상부에서 취출합니다.",
        },
      ],
      detailLessonTitles: [
        "양로드 실린더",
        "텔레스코프 실린더",
        "로드리스 실린더",
        "다위치 실린더",
        "램형 실린더",
        "충격실린더",
        "공압 주배관",
        "공압배관 문제",
      ],
    },
    {
      id: "electronics-components-measurement",
      part: "전기·전자",
      title: "반도체·정류·연산증폭기·계측",
      memoryLine:
        "소자의 에너지 기능과 단자·극성·측정 연결법을 구분해 회로 보기의 함정을 제거합니다.",
      facts: [
        {
          id: "s1-electronics-components-measurement-diode-zener",
          cue: "다이오드·제너",
          answer:
            "일반 다이오드는 순방향 도통과 정류에, 제너다이오드는 역방향 항복영역의 일정 전압을 이용한 전압 안정화에 씁니다.",
          detailLessonTitles: ["타이머 릴레이 다이오드", "전파정류"],
        },
        {
          id: "s1-electronics-components-measurement-transistor",
          cue: "BJT·FET",
          answer:
            "BJT는 베이스 전류로 컬렉터 전류를 제어하고, FET는 게이트 전압으로 드레인 전류를 제어해 입력임피던스가 높습니다.",
          detailLessonTitles: ["회로 능동소자"],
        },
        {
          id: "s1-electronics-components-measurement-opamp",
          cue: "연산증폭기",
          answer:
            "이상적 연산증폭기는 입력임피던스와 개루프이득을 매우 크게, 출력임피던스를 0으로 보며 음귀환 선형영역에서 가상단락을 적용합니다.",
          detailLessonTitles: ["회로 능동소자"],
        },
        {
          id: "s1-electronics-components-measurement-rectifier",
          cue: "반파·전파정류",
          answer:
            "반파정류는 한 반주기만, 전파정류는 양·음 반주기를 같은 극성으로 바꾸며 브리지 전파정류는 다이오드 4개를 사용합니다.",
          detailLessonTitles: ["전파정류"],
        },
        {
          id: "s1-electronics-components-measurement-meter-connection",
          cue: "전압계·전류계 연결",
          answer:
            "전압계는 부하와 병렬로 연결해 내부저항을 크게, 전류계는 회로에 직렬로 연결해 내부저항을 작게 설계합니다.",
          detailLessonTitles: ["옴의 법칙", "도체 저항"],
        },
      ],
      traps: [
        {
          statement: "제너다이오드는 순방향 항복영역만 이용해 전압을 일정하게 한다.",
          correction:
            "역방향 항복전압 영역을 이용하는 전압 안정화 소자입니다.",
        },
        {
          statement: "이상적 연산증폭기의 입력임피던스는 0이고 출력임피던스는 무한대다.",
          correction:
            "이상 모델은 입력임피던스 무한대, 출력임피던스 0으로 봅니다.",
        },
        {
          statement: "전류계는 측정 대상 양단에 병렬로 연결한다.",
          correction:
            "전류가 흐르는 경로에 직렬로 연결하며 병렬 연결은 위험할 수 있습니다.",
        },
      ],
      detailLessonTitles: [
        "타이머 릴레이 다이오드",
        "전파정류",
        "회로 능동소자",
        "옴의 법칙",
        "도체 저항",
      ],
    },
    {
      id: "motors-starting-servo-stepper",
      part: "전기·전자",
      title: "직류·유도·동기·서보·스테핑 전동기",
      memoryLine:
        "전원 종류, 회전자 속도, 피드백 유무, 펄스 입력과 기동특성을 비교합니다.",
      facts: [
        {
          id: "s1-motors-starting-servo-stepper-dc",
          cue: "직류전동기",
          answer:
            "직권전동기는 기동토크가 크지만 무부하 과속에 주의하고 회전방향은 계자 또는 전기자 중 한쪽 접속만 바꿉니다.",
          detailLessonTitles: ["직류 직권전동기", "직류전동기 속도제어"],
        },
        {
          id: "s1-motors-starting-servo-stepper-induction",
          cue: "3상 유도전동기",
          answer:
            "동기속도 Ns=120f/p보다 회전자 속도가 느려 슬립이 생기고, 임의의 두 상을 바꾸면 회전방향이 반전됩니다.",
          detailLessonTitles: ["유도전동기 동기속도·슬립", "전동기 인터록"],
        },
        {
          id: "s1-motors-starting-servo-stepper-synchronous",
          cue: "동기전동기",
          answer:
            "정상 운전속도가 동기속도와 같아 부하가 변해도 속도가 일정하지만 보통 별도의 기동수단이 필요합니다.",
          detailLessonTitles: ["동기전동기"],
        },
        {
          id: "s1-motors-starting-servo-stepper-servo",
          cue: "서보모터",
          answer:
            "위치·속도 피드백을 이용해 명령을 빠르고 정밀하게 추종하며 낮은 관성·높은 응답성과 작은 토크리플이 요구됩니다.",
          detailLessonTitles: ["서보모터 구비조건", "서보모터 속도검출"],
        },
        {
          id: "s1-motors-starting-servo-stepper-stepper",
          cue: "스테핑모터",
          answer:
            "입력 펄스 수에 비례한 각도만큼 단계적으로 회전하고 정지 여자 시 홀딩토크를 가지지만 공진·탈조에 주의합니다.",
          detailLessonTitles: ["스테핑모터"],
        },
      ],
      formulas: [
        {
          label: "동기속도·슬립",
          formula: "Nₛ=120f/p,  s=(Nₛ-N)/Nₛ",
          note: "슬립을 %로 묻는 경우 100을 곱합니다.",
        },
      ],
      traps: [
        {
          statement: "직권전동기는 무부하에서 안전하게 정속 운전한다.",
          correction:
            "무부하 과속 위험이 커서 무부하 운전을 피해야 합니다.",
        },
        {
          statement: "동기전동기는 부하가 늘면 정상속도가 슬립만큼 계속 낮아진다.",
          correction:
            "동기 범위에서는 동기속도로 운전하며 유도전동기와 구분합니다.",
        },
        {
          statement: "스테핑모터는 입력 펄스 수와 회전각이 무관하다.",
          correction:
            "회전각은 기본 스텝각과 입력 펄스 수에 직접 연결됩니다.",
        },
      ],
      detailLessonTitles: [
        "직류 직권전동기",
        "직류전동기 속도제어",
        "유도전동기 동기속도·슬립",
        "전동기 인터록",
        "동기전동기",
        "서보모터 구비조건",
        "서보모터 속도검출",
        "스테핑모터",
      ],
    },
    {
      id: "logic-plc-sequence-advanced",
      part: "PLC·자동제어",
      title: "확장 논리·PLC 구조·시퀀스 표현",
      memoryLine:
        "진리표와 접점 등가관계를 먼저 확인하고 PLC 스캔과 시퀀스 전이조건을 연결합니다.",
      facts: [
        {
          id: "s1-logic-plc-sequence-advanced-expanded-logic",
          cue: "XOR·NAND·NOR",
          answer:
            "XOR는 두 입력이 다를 때, NAND는 AND의 부정, NOR는 OR의 부정이며 NOR는 두 입력이 모두 0일 때만 1입니다.",
          detailLessonTitles: ["논리게이트와 드모르간 정리", "공압 NOR 논리"],
        },
        {
          id: "s1-logic-plc-sequence-advanced-demorgan",
          cue: "드모르간 접점변환",
          answer:
            "전체 부정을 분배하면 AND와 OR가 서로 바뀌고 각 입력도 반전되어 직렬·병렬 접점의 등가변환에 사용됩니다.",
          detailLessonTitles: ["논리게이트와 드모르간 정리"],
        },
        {
          id: "s1-logic-plc-sequence-advanced-plc-structure",
          cue: "PLC 구성·스캔",
          answer:
            "전원·CPU·메모리·입력·출력부로 구성되며 일반 스캔은 입력이미지 갱신→프로그램 연산→출력이미지 갱신 순으로 반복합니다.",
          detailLessonTitles: ["PLC 기능", "PLC 입출력"],
        },
        {
          id: "s1-logic-plc-sequence-advanced-sequence-types",
          cue: "시퀀스 3분류",
          answer:
            "작동 진행기준에 따라 시간종속, 위치·이벤트종속, 조건·논리종속 시퀀스로 구분합니다.",
          detailLessonTitles: ["시퀀스제어 분류", "위치종속 시퀀스"],
        },
        {
          id: "s1-logic-plc-sequence-advanced-representation",
          cue: "시퀀스 표현법",
          answer:
            "타임차트는 시간관계, 디시전테이블은 조건-조작 조합, 플로차트·단계선도는 순서와 전이조건을 나타냅니다.",
          detailLessonTitles: ["시퀀스 표현", "시퀀스 회로설계"],
        },
      ],
      traps: [
        {
          statement: "XOR는 두 입력이 모두 1일 때만 출력이 1이다.",
          correction:
            "두 입력이 서로 다를 때만 1이며 둘 다 같으면 0입니다.",
        },
        {
          statement: "PLC는 출력부터 갱신한 뒤 입력을 읽고 프로그램을 연산한다.",
          correction:
            "일반적인 스캔은 입력 읽기→프로그램 연산→출력 갱신 순입니다.",
        },
        {
          statement: "디시전테이블은 시간축에 따른 파형만 그리는 표현법이다.",
          correction:
            "조건과 그 조건에 대응하는 조작을 표 형태로 정리합니다.",
        },
      ],
      detailLessonTitles: [
        "논리게이트와 드모르간 정리",
        "공압 NOR 논리",
        "PLC 기능",
        "PLC 입출력",
        "시퀀스제어 분류",
        "위치종속 시퀀스",
        "시퀀스 표현",
        "시퀀스 회로설계",
      ],
    },
    {
      id: "measurement-sampling-errors",
      part: "PLC·자동제어",
      title: "센서 원리·4–20 mA·샘플링·오차",
      memoryLine:
        "검출 물리량과 변환원리를 짝지은 뒤 전송·표본화·오차의 발생단계를 구분합니다.",
      facts: [
        {
          id: "s1-measurement-sampling-errors-sensor-principles",
          cue: "유도·정전용량·광전·리드",
          answer:
            "유도형은 금속의 와전류, 정전용량형은 유전율 변화, 광전형은 빛의 차단·반사, 리드스위치는 자계를 검출합니다.",
          detailLessonTitles: ["근접센서 분류", "유도형 근접센서", "센서 목적별 분류"],
        },
        {
          id: "s1-measurement-sampling-errors-process-sensors",
          cue: "온도·압력·유량 센서",
          answer:
            "열전대는 제베크효과, 부르동관은 탄성변형, 전자유량계는 패러데이법칙, 로터미터는 가변면적을 이용합니다.",
          detailLessonTitles: ["온도센서", "산업용 압력·유량·액면·회전 센서"],
        },
        {
          id: "s1-measurement-sampling-errors-current-ad",
          cue: "4–20 mA·A/D",
          answer:
            "4–20 mA의 4 mA는 살아 있는 영점이고 A/D 변환은 표본화→양자화→부호화 과정을 거칩니다.",
          detailLessonTitles: ["신호변환기", "아날로그 신호"],
        },
        {
          id: "s1-measurement-sampling-errors-nyquist",
          cue: "나이퀴스트·에일리어싱",
          answer:
            "표본화주파수는 분석 최고주파수의 2배보다 커야 하며 부족하면 낮은 가짜주파수로 겹쳐 보이는 에일리어싱이 생깁니다.",
          detailLessonTitles: ["로우패스 필터", "센서 성능 용어"],
        },
        {
          id: "s1-measurement-sampling-errors-error-loading",
          cue: "계통·우연오차·부하효과",
          answer:
            "계통오차는 방향성 원인을 보정하고 우연오차는 반복·통계 처리하며, 부하효과는 계측기 연결이 원 회로값을 바꾸는 현상입니다.",
          detailLessonTitles: ["센서 성능 용어", "산업용 센서 선정 기준"],
        },
      ],
      traps: [
        {
          statement: "4–20 mA에서 4 mA는 항상 단선을 뜻한다.",
          correction:
            "4 mA는 측정 하한의 라이브 제로이고 0 mA가 단선 판단에 쓰일 수 있습니다.",
        },
        {
          statement: "최고주파수와 같은 주파수로 표본화하면 원 신호가 항상 복원된다.",
          correction:
            "나이퀴스트 조건상 최소 두 배보다 큰 표본화주파수와 실제 여유가 필요합니다.",
        },
        {
          statement: "우연오차는 일정한 보정값 하나로 완전히 제거한다.",
          correction:
            "방향이 일정하지 않아 반복측정과 통계적 처리로 줄입니다.",
        },
      ],
      detailLessonTitles: [
        "근접센서 분류",
        "유도형 근접센서",
        "센서 목적별 분류",
        "온도센서",
        "산업용 압력·유량·액면·회전 센서",
        "신호변환기",
        "아날로그 신호",
        "로우패스 필터",
        "센서 성능 용어",
        "산업용 센서 선정 기준",
      ],
    },
    {
      id: "control-servo-transients",
      part: "PLC·자동제어",
      title: "서보기구·ON/OFF·PID·시간응답",
      memoryLine:
        "피드백 대상과 조작동작을 구분하고 목표값에 도달하는 시간응답 용어를 순서대로 읽습니다.",
      facts: [
        {
          id: "s1-control-servo-transients-servo",
          cue: "서보기구",
          answer:
            "위치·각도·자세 같은 기계량을 목표값에 추종시키는 폐회로 제어계로 검출기·비교기·증폭기·서보모터를 연결합니다.",
          detailLessonTitles: ["서보제어", "서보제어 로봇"],
        },
        {
          id: "s1-control-servo-transients-on-off",
          cue: "ON/OFF 제어",
          answer:
            "설정값을 경계로 출력을 켜고 끄며 단순하지만 히스테리시스가 없거나 작으면 잦은 스위칭·헌팅이 생길 수 있습니다.",
          detailLessonTitles: ["개루프 제어", "폐회로 제어"],
        },
        {
          id: "s1-control-servo-transients-pid",
          cue: "P·I·D 역할",
          answer:
            "P는 현재편차, I는 편차 누적으로 정상편차 제거, D는 편차 변화율로 급변을 억제하며 실제 조합은 대상 동특성에 맞춥니다.",
          detailLessonTitles: ["비례게인·비례대", "적분제어", "미분제어"],
        },
        {
          id: "s1-control-servo-transients-first-order",
          cue: "1차 지연·시정수",
          answer:
            "단위계단 입력의 1차 지연응답은 한 시정수에서 최종값의 약 63.2%에 도달합니다.",
          detailLessonTitles: ["피드백 시간응답"],
        },
        {
          id: "s1-control-servo-transients-response-terms",
          cue: "지연·상승·정착·오버슈트",
          answer:
            "지연시간은 초기 도달, 상승시간은 저수준에서 고수준까지의 상승, 정착시간은 허용범위 안 안정, 오버슈트는 목표값 초과 최대량입니다.",
          detailLessonTitles: ["피드백 시간응답"],
        },
      ],
      traps: [
        {
          statement: "적분동작은 오차 변화율을 예측해 급격한 변화를 억제한다.",
          correction:
            "변화율은 미분동작이고 적분동작은 오차를 누적해 정상편차를 줄입니다.",
        },
        {
          statement: "오버슈트는 출력이 목표값에 처음 도달하기 전까지의 지연시간이다.",
          correction:
            "목표값을 초과한 최대량이며 지연시간과 구분합니다.",
        },
        {
          statement: "서보기구는 출력 검출 없이 정해진 순서만 수행하는 개회로다.",
          correction:
            "위치·속도 등의 피드백을 이용해 목표를 추종하는 폐회로가 핵심입니다.",
        },
      ],
      detailLessonTitles: [
        "서보제어",
        "서보제어 로봇",
        "개루프 제어",
        "폐회로 제어",
        "비례게인·비례대",
        "적분제어",
        "미분제어",
        "피드백 시간응답",
      ],
    },
    {
      id: "network-topology-handling-details",
      part: "PLC·자동제어",
      title: "성형·버스·링·망형과 핸들링",
      memoryLine:
        "연결 형태별 장애범위와 배선량을 비교하고 핸들링은 가공이 아닌 이송·파지·자세변경으로 판단합니다.",
      facts: [
        {
          id: "s1-network-topology-handling-details-star",
          cue: "성형",
          answer:
            "모든 노드가 중앙장치에 개별 연결되어 단말 고장 격리는 쉽지만 중앙장치 고장이 전체에 영향을 줍니다.",
          detailLessonTitles: ["산업용 네트워크 토폴로지"],
        },
        {
          id: "s1-network-topology-handling-details-bus",
          cue: "버스형",
          answer:
            "하나의 공통 간선에 노드를 연결해 배선량은 적지만 간선 단선·종단 불량이 여러 노드 통신에 영향을 줄 수 있습니다.",
          detailLessonTitles: ["산업용 네트워크 토폴로지"],
        },
        {
          id: "s1-network-topology-handling-details-ring-mesh",
          cue: "링형·망형",
          answer:
            "링형은 이웃 노드가 고리를 이루고, 망형은 여러 경로로 연결해 신뢰성은 높지만 배선과 관리가 복잡합니다.",
          detailLessonTitles: ["산업용 네트워크 토폴로지", "링형 네트워크", "환형 네트워크"],
        },
        {
          id: "s1-network-topology-handling-details-handling",
          cue: "핸들링 기능·제한",
          answer:
            "핸들링은 이송·운반·공급·파지·저장·자세변경이며 기계적 제한은 형상·치수·중량·재질 등을 보고 단순 색상은 보통 직접 제한으로 보지 않습니다.",
          detailLessonTitles: ["자동화 핸들링", "핸들링", "핸들링 이송기능", "핸들링 자세변경"],
        },
        {
          id: "s1-network-topology-handling-details-robot",
          cue: "티칭·학습제어 로봇",
          answer:
            "티칭 플레이백은 작업자가 가르친 위치·동작을 반복하고, 학습제어는 작업결과를 반영해 제어규칙을 개선합니다.",
          detailLessonTitles: ["로봇 운용용어", "학습제어 로봇"],
        },
      ],
      traps: [
        {
          statement: "성형 네트워크는 중앙장치가 고장나도 모든 단말 통신이 그대로 유지된다.",
          correction:
            "중앙장치 장애가 전체 통신에 영향을 줄 수 있는 것이 핵심 약점입니다.",
        },
        {
          statement: "망형은 단일 간선만 사용하므로 배선이 가장 단순하다.",
          correction:
            "여러 경로를 확보해 신뢰성은 높지만 배선과 관리가 복잡합니다.",
        },
        {
          statement: "핸들링은 절삭으로 재료 형상을 바꾸는 가공 자체를 뜻한다.",
          correction:
            "물체를 가공하지 않고 이송·공급·파지·자세변경하는 기능입니다.",
        },
      ],
      detailLessonTitles: [
        "산업용 네트워크 토폴로지",
        "링형 네트워크",
        "환형 네트워크",
        "자동화 핸들링",
        "핸들링",
        "핸들링 이송기능",
        "핸들링 자세변경",
        "로봇 운용용어",
        "학습제어 로봇",
      ],
    },
  ];
