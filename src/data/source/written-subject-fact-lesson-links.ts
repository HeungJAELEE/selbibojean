type FactLike = {
  id?: string;
  cue: string;
  detailLessonTitles?: string[];
};

type BundleLike = {
  id: string;
  facts: readonly FactLike[];
  detailLessonTitles: readonly string[];
};

type SubjectCode = 1 | 2 | 3 | 4;

export type WrittenSubjectFactEvidenceStatus =
  | "verified_assertion"
  | "linked_title_only"
  | "unlinked";

export type WrittenSubjectFactEvidenceTarget = {
  lessonId: string;
  lessonTitle: string;
  sectionId: "definition" | "principle";
  assertionId: string;
  evidenceText: string;
};

export type WrittenSubjectFactEvidenceBinding = {
  factId: string;
  status: WrittenSubjectFactEvidenceStatus;
  publicationPolicy: "inherit";
  lessonTitles: string[];
  evidenceTargets: WrittenSubjectFactEvidenceTarget[];
  reviewReason?: string;
};

const FACT_LESSON_LINKS: Record<string, readonly string[]> = {
  "1:fluid-foundation:점도와 동점도": [
    "점도·동점도와 유동 저항",
    "유압유 고점도 영향",
  ],
  "1:fluid-laws:보일의 법칙": ["보일 법칙"],
  "1:fluid-laws:샤를의 법칙": ["샤를의 법칙"],
  "1:fluid-laws:파스칼의 원리": ["파스칼 원리"],
  "1:fluid-laws:연속의 법칙": ["연속의 법칙"],
  "1:fluid-laws:베르누이 정리": ["베르누이 정리"],
  "1:fluid-laws:레이놀즈수": ["레이놀즈수"],
  "1:pneumatic-foundation:공압의 장점": ["공압 특징"],
  "1:pneumatic-foundation:공압의 한계": ["공압 특징"],
  "1:pneumatic-foundation:용적형 압축기": [
    "공기압축기 분류",
    "압축기 작동원리",
  ],
  "1:pneumatic-foundation:동력형 압축기": [
    "공기압축기 분류",
    "압축기 작동원리",
  ],
  "1:pneumatic-foundation:후부냉각·건조": [
    "애프터쿨러",
    "압축공기 건조",
  ],
  "1:pneumatic-foundation:FRL": ["FRL 서비스유닛"],
  "1:hydraulic-power:유압의 장점": ["유압장치 특징"],
  "1:hydraulic-power:작동유 역할": ["유압작동유 역할"],
  "1:hydraulic-power:용적식 펌프": ["용적식 유압펌프"],
  "1:hydraulic-power:펌프와 모터": ["용적식 유압펌프", "유압모터"],
  "1:hydraulic-power:실린더 출력": ["유압실린더 힘"],
  "1:hydraulic-power:어큐뮬레이터": ["어큐뮬레이터 기능"],
  "1:hydraulic-troubleshooting:캐비테이션": ["기어펌프 캐비테이션"],
  "1:hydraulic-troubleshooting:에어레이션": ["에어레이션"],
  "1:hydraulic-troubleshooting:서징": ["공유압 이상현상 비교"],
  "1:hydraulic-troubleshooting:채터링": [
    "공유압 이상현상 비교",
    "밸브 채터링",
  ],
  "1:hydraulic-troubleshooting:스틱슬립": ["공유압 이상현상 비교"],
  "1:hydraulic-troubleshooting:기호 판독": ["공유압 회로도"],
  "1:actuators-piping-maintenance:공기압 요소 번호": [
    "공기압 요소 번호와 액추에이터 배관",
  ],
  "1:actuators-piping-maintenance:단동·복동 실린더": [
    "공압 액추에이터",
    "공압실린더",
  ],
  "1:actuators-piping-maintenance:특수 실린더": [
    "로드리스 실린더",
    "다위치 실린더",
    "충격실린더",
  ],
  "1:actuators-piping-maintenance:쿠션·설치": [
    "공압실린더 쿠션",
    "실린더 설치",
    "실린더 측하중",
  ],
  "1:actuators-piping-maintenance:유압 액추에이터": [
    "유압실린더 선정",
    "유압모터",
  ],
  "1:actuators-piping-maintenance:공압 주배관·이음": [
    "공압 주배관",
    "공압배관 이음",
    "공압배관 문제",
  ],
  "1:electric-electronic:옴의 법칙": ["옴의 법칙"],
  "1:electric-electronic:R·L·C": ["수동소자"],
  "1:electric-electronic:수동·능동소자": ["수동소자", "회로 능동소자"],
  "1:electric-electronic:변압기": ["변압기"],
  "1:electric-electronic:유도전동기": ["유도전동기 동기속도·슬립"],
  "1:electric-electronic:직류전동기": ["직류 직권전동기"],
  "1:logic-plc:AND·OR·NOT": ["논리게이트와 드모르간 정리"],
  "1:logic-plc:드모르간": ["논리게이트와 드모르간 정리"],
  "1:logic-plc:a·b접점": ["b접점"],
  "1:logic-plc:자기유지·인터록": ["자기유지회로", "전동기 인터록"],
  "1:logic-plc:PLC 스캔": ["PLC 기능"],
  "1:logic-plc:시퀀스 제어": ["시퀀스제어 분류"],
  "1:automatic-control:개회로 제어": ["개루프 제어"],
  "1:automatic-control:폐회로 제어": ["폐회로 제어"],
  "1:automatic-control:P 제어": ["비례게인·비례대"],
  "1:automatic-control:I 제어": ["적분제어"],
  "1:automatic-control:D 제어": ["미분제어"],
  "1:automatic-control:과도응답": ["피드백 시간응답"],
  "1:sensors-signals:광전센서": [
    "산업용 압력·유량·액면·회전 센서",
    "센서 목적별 분류",
  ],
  "1:sensors-signals:압력·유량·액면 센서": [
    "산업용 압력·유량·액면·회전 센서",
  ],
  "1:sensors-signals:회전·속도 센서": [
    "산업용 압력·유량·액면·회전 센서",
    "전자식 회전수 검출",
  ],
  "1:sensors-signals:정확도·정밀도": [
    "센서 성능 용어",
    "산업용 센서 선정 기준",
  ],
  "1:sensors-signals:감도·분해능": [
    "센서 성능 용어",
    "산업용 센서 선정 기준",
  ],
  "1:industrial-communication-handling:버스형 네트워크": [
    "산업용 네트워크 토폴로지",
  ],
  "1:industrial-communication-handling:링형 네트워크": [
    "산업용 네트워크 토폴로지",
    "링형 네트워크",
    "환형 네트워크",
  ],
  "1:industrial-communication-handling:핸들링": [
    "자동화 핸들링",
    "핸들링 이송기능",
    "핸들링 자세변경",
  ],
  "1:industrial-communication-handling:산업용 로봇": [
    "서보제어 로봇",
    "로봇 운용용어",
  ],
  "1:industrial-communication-handling:통신 고장 점검": [
    "산업용 네트워크 토폴로지",
  ],

  "2:classification-joints:용접 자세": ["용접 자세와 플러그 용접"],
  "2:classification-joints:플러그 용접": ["용접 자세와 플러그 용접"],
  "2:arc-foundation-polarity:용융지와 비드": [
    "용융지·비드·용입·용착",
  ],
  "2:arc-foundation-polarity:용입과 용착": [
    "용융지·비드·용입·용착",
  ],
  "2:shielded-high-efficiency:TIG": ["TIG용접(GTAW)"],
  "2:shielded-high-efficiency:MIG": ["MIG·MAG·CO₂용접(GMAW)"],
  "2:shielded-high-efficiency:CO₂ 용접": ["CO₂ 아크용접"],
  "2:shielded-high-efficiency:FCAW": ["플럭스코어드아크용접(FCAW)"],
  "2:shielded-high-efficiency:서브머지드": ["서브머지드아크용접(SAW)"],
  "2:shielded-high-efficiency:차폐 조건": ["아크용접 차폐 조건"],
  "2:weld-defects:언더컷": ["언더컷 결함"],
  "2:weld-defects:오버랩": ["오버랩 결함"],
  "2:weld-defects:기공": ["기공·피트 결함"],
  "2:weld-defects:슬래그 혼입": ["슬래그 혼입 결함"],
  "2:weld-defects:용입 불량": ["용입 불량·융합 불량 결함"],
  "2:weld-defects:스패터": ["스패터 결함"],
  "2:weld-defects:용락": ["용락 결함"],
  "2:weld-defects:은점·균열": ["용접 균열·은점 결함"],
  "2:weld-defects:아크 스트라이크": ["아크 스트라이크 결함"],
  "2:deformation-stress:변형 원인": [
    "용접 변형 방지와 잔류응력 완화",
    "용접 잔류응력 제거",
  ],
  "2:deformation-stress:역변형법": ["용접 변형 방지와 잔류응력 완화"],
  "2:deformation-stress:억제법": ["용접 변형 방지와 잔류응력 완화"],
  "2:deformation-stress:후진법": ["용접 변형 방지와 잔류응력 완화"],
  "2:deformation-stress:스킵·대칭법": [
    "용접 변형 방지와 잔류응력 완화",
  ],
  "2:deformation-stress:용접 후 완화": [
    "용접 변형 방지와 잔류응력 완화",
    "용접 잔류응력 제거",
  ],

  "3:drawing-lines-tolerance:선의 우선순위": [
    "기계제도 선·단면·보조기호",
    "투상도와 단면도의 판독",
  ],
  "3:drawing-lines-tolerance:단면도": [
    "기계제도 선·단면·보조기호",
    "투상도와 단면도의 판독",
  ],
  "3:drawing-lines-tolerance:제도 보조기호": [
    "기계제도 선·단면·보조기호",
  ],
  "3:measurement-principles:계통오차": ["측정오차와 측정 방식"],
  "3:measurement-principles:우연오차": ["측정오차와 측정 방식"],
  "3:measurement-principles:테일러의 원리": ["테일러의 원리"],
  "3:measurement-principles:직접측정": [
    "측정오차와 측정 방식",
    "직접측정",
  ],
  "3:measurement-principles:비교·간접측정": [
    "측정오차와 측정 방식",
    "비교측정기",
    "다이얼게이지",
  ],
  "3:gauges-drawing-rules:게이지 블록": ["게이지 블록"],
  "3:gauges-drawing-rules:표면거칠기": ["표면거칠기"],
  "3:gauges-drawing-rules:재료기호": ["KS 재료기호"],
  "3:casting-plastic-materials:주조 여유": ["주조 여유와 특수주조"],
  "3:casting-plastic-materials:특수주조": ["주조 여유와 특수주조"],
  "3:casting-plastic-materials:결정격자": ["금속 결정격자와 변형"],
  "3:piping-valves-seals:유니언·플랜지": [
    "배관 이음·밸브·씰 비교",
    "유니언 이음",
  ],
  "3:piping-valves-seals:신축이음": ["신축이음"],
  "3:piping-valves-seals:게이트·글로브": [
    "배관 이음·밸브·씰 비교",
    "게이트밸브",
  ],
  "3:piping-valves-seals:체크·버터플라이": [
    "배관 이음·밸브·씰 비교",
    "버터플라이밸브",
  ],
  "3:piping-valves-seals:메커니컬실": ["메커니컬실"],
  "3:piping-valves-seals:비접촉실·접착제": [
    "배관 이음·밸브·씰 비교",
    "비접촉 씰",
  ],
  "3:fluid-machinery-troubles:캐비테이션": ["캐비테이션"],
  "3:fluid-machinery-troubles:수격작용": ["수격작용"],
  "3:fluid-machinery-troubles:서징": [
    "펌프·송풍기·압축기 분류와 이상현상",
  ],
  "3:fluid-machinery-troubles:펌프 무토출": ["펌프 흡입불량"],
  "3:fluid-machinery-troubles:송풍기": [
    "펌프·송풍기·압축기 분류와 이상현상",
    "송풍기 구성",
    "루츠블로어",
  ],
  "3:fluid-machinery-troubles:압축기": [
    "펌프·송풍기·압축기 분류와 이상현상",
    "왕복압축기",
  ],
  "3:power-transmission:기어 손상": [
    "기어 맞물림·백래시·손상",
    "기어 표면피로",
    "기어 마모원인",
  ],
  "3:power-transmission:백래시": ["기어 맞물림·백래시·손상"],

  "4:signal-measurement:정특성·동특성": ["계측 정특성·동특성"],
  "4:signal-measurement:FFT": ["푸리에 변환"],
  "4:signal-measurement:윈도우 함수": ["FFT 윈도우함수"],
  "4:signal-measurement:표본화": ["나이퀴스트 샘플링"],
  "4:signal-measurement:RMS": ["정현파 RMS 정의"],
  "4:process-measurement:열전대": ["열전대"],
  "4:process-measurement:측온저항체": ["백금 측온저항체"],
  "4:process-measurement:차압식 유량계": ["차압식 유량계"],
  "4:process-measurement:전자유량계": ["전자유량계 방향법칙"],
  "4:process-measurement:비접촉 레벨": ["마이크로파 레벨계"],
  "4:vibration-foundation:진동 3요소": [
    "진동의 질량·강성·감쇠와 3대 측정량",
    "진동계 요소",
  ],
  "4:vibration-foundation:진폭 표현": [
    "정현파 진폭용어",
    "진동 실효값",
  ],
  "4:vibration-foundation:변위·속도·가속도": [
    "진동의 질량·강성·감쇠와 3대 측정량",
    "진동 3대 변수",
  ],
  "4:vibration-foundation:공진·위험속도": ["공진과 위험속도"],
  "4:vibration-foundation:진동 절연": ["진동 절연 주파수비"],
  "4:rotating-diagnosis:언밸런스": ["회전체 언밸런스"],
  "4:rotating-diagnosis:축정렬 불량": ["축정렬 불량 진동"],
  "4:rotating-diagnosis:기어 결함": ["기어 진동진단"],
  "4:rotating-diagnosis:베어링 결함": ["포락선 분석"],
  "4:rotating-diagnosis:유막 불안정": ["오일휩 진단기법"],
  "4:noise-acoustics:회절·굴절": ["음의 회절", "음의 굴절"],
  "4:noise-acoustics:마스킹": ["소음 마스킹"],
  "4:noise-acoustics:흡음·차음": ["흡음·차음 특성"],
  "4:noise-acoustics:청감보정": ["A 청감보정"],
  "4:noise-acoustics:암소음": ["암소음", "암소음 보정"],
  "4:condition-diagnosis:설비진단 목적": [
    "설비진단 개념",
    "설비진단 필요성",
  ],
  "4:condition-diagnosis:간이진단": ["간이진단"],
  "4:condition-diagnosis:정밀진단": ["정밀진단"],
  "4:condition-diagnosis:페로그래피": ["SOAP와 페로그래피"],
  "4:condition-diagnosis:SOAP·ICP": ["SOAP 오일분석", "ICP 오일분석"],
  "4:maintenance-methods:개량보전 CM": ["상태기준보전"],
  "4:reliability-life-cycle:초기고장기": ["고장률 욕조곡선", "초기고장기"],
  "4:reliability-life-cycle:우발고장기": [
    "고장률 욕조곡선",
    "우발고장기 대책",
  ],
  "4:reliability-life-cycle:마모고장기": ["고장률 욕조곡선"],
  "4:reliability-life-cycle:MTBF·MTTR": ["MTBF", "보전도 MTTR"],
  "4:reliability-life-cycle:가용도": ["가용도"],
  "4:tpm-autonomous:TPM": ["TPM"],
  "4:tpm-autonomous:자주보전": ["자주보전"],
  "4:tpm-autonomous:7단계 흐름": ["자주보전 7스텝"],
  "4:tpm-autonomous:6대 로스": ["설비 6대 로스"],
  "4:tpm-autonomous:PM 분석": ["PM분석"],
  "4:factory-project:제품별 배치": ["설비배치 유형 비교", "제품별 배치"],
  "4:factory-project:기능별 배치": ["설비배치 유형 비교", "설비배치"],
  "4:factory-project:GT 셀 배치": ["설비배치 유형 비교", "GT 셀 배치"],
  "4:factory-project:고정위치 배치": [
    "설비배치 유형 비교",
    "제품고정형 배치",
  ],
  "4:factory-project:주공정": ["PERT 임계경로"],
  "4:economics-cost:LCC": ["설비 LCC"],
  "4:economics-cost:합리화·확장 투자": [
    "설비투자 분류",
    "확장투자",
  ],
  "4:economics-cost:방위·전략 투자": [
    "설비투자 분류",
    "방위적 투자",
  ],
  "4:economics-cost:MAPI": ["MAPI"],
  "4:economics-cost:기회손실": ["기회손실"],
  "4:energy-management:부하율": ["부하율"],
  "4:energy-management:부등률": ["부등률"],
  "4:energy-management:직접 전력손실": ["전력손실"],
  "4:energy-management:열관리": ["열관리"],
  "4:energy-management:배열회수": ["배열회수 검토"],
  "4:lubrication-foundation:윤활 기능": ["윤활 목적"],
  "4:lubrication-foundation:유체윤활": ["유체윤활"],
  "4:lubrication-foundation:경계윤활": ["경계윤활"],
  "4:lubrication-foundation:ISO VG": ["ISO VG"],
  "4:lubrication-foundation:기어손상": ["기어 스코어링"],
};

const FACT_EVIDENCE_TARGETS: Record<
  string,
  readonly WrittenSubjectFactEvidenceTarget[]
> = {
  "s3-drawing-lines-tolerance-dimensional-tolerance": [
    {
      lessonId: "notion-gap-dimensional-tolerance-fit-calculation",
      lessonTitle: "치수공차와 끼워맞춤 계산",
      sectionId: "principle",
      assertionId:
        "notion-gap-dimensional-tolerance-fit-calculation-principle-2",
      evidenceText:
        "최대 틈새 Cmax=Dmax-dmin, 최소 틈새 Cmin=Dmin-dmax다.",
    },
  ],
  "s3-drawing-lines-tolerance-hole-basis-system": [
    {
      lessonId: "notion-gap-dimensional-tolerance-fit-calculation",
      lessonTitle: "치수공차와 끼워맞춤 계산",
      sectionId: "principle",
      assertionId:
        "notion-gap-dimensional-tolerance-fit-calculation-principle-2",
      evidenceText:
        "중간 끼워맞춤은 이 부호가 조합에 따라 바뀔 수 있다.",
    },
  ],
  "s3-drawing-lines-tolerance-fit-types": [
    {
      lessonId: "notion-gap-dimensional-tolerance-fit-calculation",
      lessonTitle: "치수공차와 끼워맞춤 계산",
      sectionId: "principle",
      assertionId:
        "notion-gap-dimensional-tolerance-fit-calculation-principle-2",
      evidenceText:
        "Cmin이 음수이면 그 조합에서는 틈새 대신 죔새가 생기고",
    },
  ],
  "s3-machine-tools-cutting-up-milling": [
    {
      lessonId: "notion-gap-milling-directions-chip-types",
      lessonTitle: "상향·하향절삭과 칩 형상",
      sectionId: "principle",
      assertionId:
        "notion-gap-milling-directions-chip-types-principle-2",
      evidenceText:
        "상향절삭은 날이 미끄러지며 물리기 시작해 점차 두꺼운 칩을 만들고",
    },
  ],
  "s3-machine-tools-cutting-down-milling": [
    {
      lessonId: "notion-gap-milling-directions-chip-types",
      lessonTitle: "상향·하향절삭과 칩 형상",
      sectionId: "principle",
      assertionId:
        "notion-gap-milling-directions-chip-types-principle-2",
      evidenceText:
        "하향절삭은 처음부터 두꺼운 칩을 깎아 공작물을 테이블 쪽으로 누른다.",
    },
  ],
  "s3-chips-tools-finishing-continuous-chip": [
    {
      lessonId: "notion-gap-milling-directions-chip-types",
      lessonTitle: "상향·하향절삭과 칩 형상",
      sectionId: "principle",
      assertionId:
        "notion-gap-milling-directions-chip-types-principle-2",
      evidenceText:
        "유동형 칩은 연속성이 높아 표면은 좋지만 길게 이어지면 안전한 칩 처리가 필요하다.",
    },
  ],
  "s3-casting-plastic-materials-hot-working": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-principle-2",
      evidenceText:
        "열간가공은 재결정온도 이상에서 이루어져 큰 변형에 유리하지만 산화와 치수정밀도에 불리하다.",
    },
  ],
  "s3-casting-plastic-materials-cold-working": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-principle-2",
      evidenceText:
        "냉간가공은 재결정온도 이하에서 가공경화가 생기며 표면과 치수정밀도가 좋다.",
    },
  ],
  "s3-casting-plastic-materials-malleability": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-principle-2",
      evidenceText:
        "전성은 압축·타격으로 판이 되는 성질",
    },
  ],
  "s3-casting-plastic-materials-ductility": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-principle-2",
      evidenceText:
        "연성은 인장으로 선이 되는 성질이다.",
    },
  ],
  "s3-casting-plastic-materials-specific-gravity": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "definition",
      assertionId:
        "notion-gap-metal-working-properties-elements-definition-1",
      evidenceText:
        "시험상의 관용 분류에서는 비중 4.5를 경계로 경금속과 중금속을 나누며",
    },
  ],
  "s3-casting-plastic-materials-steel-five-elements": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-principle-2",
      evidenceText:
        "강의 5대 원소는 C·Si·Mn·P·S이며 Fe는 바탕 금속이지 이 다섯 원소에 포함하지 않는다.",
    },
  ],
  "s3-casting-plastic-materials-phosphorus-shortness": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-selection-3",
      evidenceText:
        "| P | 상온취성(냉간취성) 증가 |",
    },
  ],
  "s3-casting-plastic-materials-sulfur-shortness": [
    {
      lessonId: "notion-gap-metal-working-properties-elements",
      lessonTitle: "금속의 가공온도·성질·5대 원소",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-working-properties-elements-selection-3",
      evidenceText:
        "| S | 적열취성(열간취성) 증가 |",
    },
  ],
  "s3-assembly-fasteners-jig": [
    {
      lessonId: "notion-gap-jigs-fixtures-maintenance-tools",
      lessonTitle: "지그·고정구와 보전 수공구",
      sectionId: "principle",
      assertionId:
        "notion-gap-jigs-fixtures-maintenance-tools-principle-2",
      evidenceText:
        "지그는 드릴 부시처럼 공구를 안내하는 요소가 있지만",
    },
  ],
  "s3-assembly-fasteners-fixture": [
    {
      lessonId: "notion-gap-jigs-fixtures-maintenance-tools",
      lessonTitle: "지그·고정구와 보전 수공구",
      sectionId: "principle",
      assertionId:
        "notion-gap-jigs-fixtures-maintenance-tools-principle-2",
      evidenceText:
        "고정구는 공작물을 지지·고정하는 데 중심이 있다.",
    },
  ],
  "s3-assembly-fasteners-screw-self-locking": [
    {
      lessonId: "notion-gap-screw-self-locking",
      lessonTitle: "나사 자립 조건",
      sectionId: "principle",
      assertionId: "notion-gap-screw-self-locking-principle-2",
      evidenceText:
        "λ<φ, 즉 tanλ<μ이면 하중이 내리는 방향으로 만들어내는 회전효과보다 마찰저항이 커서 자립한다.",
    },
  ],
  "s3-shaft-coupling-bearing-oldham-coupling": [
    {
      lessonId: "notion-gap-oldham-coupling",
      lessonTitle: "올덤 커플링",
      sectionId: "principle",
      assertionId: "notion-gap-oldham-coupling-principle-2",
      evidenceText:
        "중간 원판의 양면 돌기가 각 홈에서 왕복 미끄럼하면서 두 축 중심의 평행 오프셋을 흡수하고 회전을 전달한다.",
    },
  ],
  "s3-power-transmission-brake-fade": [
    {
      lessonId: "notion-gap-brake-fade-vapor-lock",
      lessonTitle: "브레이크 페이드와 베이퍼록",
      sectionId: "principle",
      assertionId: "notion-gap-brake-fade-vapor-lock-principle-2",
      evidenceText:
        "마찰계수가 낮아져 페이드가 생길 수 있다.",
    },
  ],
  "s3-power-transmission-brake-vapor-lock": [
    {
      lessonId: "notion-gap-brake-fade-vapor-lock",
      lessonTitle: "브레이크 페이드와 베이퍼록",
      sectionId: "principle",
      assertionId: "notion-gap-brake-fade-vapor-lock-principle-2",
      evidenceText:
        "브레이크액이 과열되어 증기 기포가 생기면",
    },
  ],
  "s3-piping-valves-seals-union": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "유니언은 관을 돌리지 않고 분해하기 쉽고",
    },
  ],
  "s3-piping-valves-seals-flange": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "플랜지는 큰 관경과 반복 정비에 유리하다.",
    },
  ],
  "s3-piping-valves-seals-expansion-joint": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "신축이음은 벨로즈·슬리브·스위블·루프형 구조로 열팽창과 변위를 흡수한다.",
    },
  ],
  "s3-piping-valves-seals-gate-valve": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "게이트밸브는 완전 개방 때 유로가 비교적 곧지만 중간 개도로 조절하면 시트가 손상될 수 있다.",
    },
  ],
  "s3-piping-valves-seals-globe-valve": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "글로브밸브는 흐름이 꺾여 손실은 크지만 조절성이 좋다.",
    },
  ],
  "s3-piping-valves-seals-check-valve": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "체크밸브는 압력차로 자동 작동해 역류를 막는다.",
    },
  ],
  "s3-piping-valves-seals-butterfly-valve": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "버터플라이밸브는 원판을 약 90도 회전시켜 대구경 관로를 빠르게 개폐·조절한다.",
    },
  ],
  "s3-piping-valves-seals-mechanical-seal": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "메커니컬실은 회전축과 고정부의 정밀한 접촉면으로 누설을 줄이고",
    },
  ],
  "s3-piping-valves-seals-labyrinth-seal": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-selection-3",
      evidenceText:
        "| 래버린스실 | 비접촉 누설 억제 |",
    },
  ],
  "s3-piping-valves-seals-anaerobic-adhesive": [
    {
      lessonId: "notion-gap-pipe-joints-valves-seals",
      lessonTitle: "배관 이음·밸브·씰 비교",
      sectionId: "principle",
      assertionId: "notion-gap-pipe-joints-valves-seals-principle-2",
      evidenceText:
        "혐기성 접착제는 금속 틈에서 공기가 차단되면 경화한다.",
    },
  ],
  "s3-fluid-machinery-troubles-positive-displacement-compressor": [
    {
      lessonId:
        "notion-gap-fluid-machinery-classification-troubles",
      lessonTitle: "펌프·송풍기·압축기 분류와 이상현상",
      sectionId: "principle",
      assertionId:
        "notion-gap-fluid-machinery-classification-troubles-principle-2",
      evidenceText:
        "왕복·스크루·루츠형은 일정 체적의 기체를 가두어 이동하거나 체적을 줄인다.",
    },
  ],
  "s3-fluid-machinery-troubles-turbo-compressor": [
    {
      lessonId:
        "notion-gap-fluid-machinery-classification-troubles",
      lessonTitle: "펌프·송풍기·압축기 분류와 이상현상",
      sectionId: "principle",
      assertionId:
        "notion-gap-fluid-machinery-classification-troubles-principle-2",
      evidenceText:
        "원심·축류형은 연속 흐름에 속도에너지를 주고 디퓨저 등에서 압력으로 바꾼다.",
    },
  ],
  "s3-maintenance-tools-lubrication-five-functions": [
    {
      lessonId: "notion-gap-lubricant-five-functions",
      lessonTitle: "윤활유 5대 기능",
      sectionId: "principle",
      assertionId: "notion-gap-lubricant-five-functions-principle-2",
      evidenceText:
        "유막은 금속 직접접촉을 줄여 마모를 낮춘다.",
    },
  ],
  "s3-maintenance-tools-lubrication-spanner": [
    {
      lessonId: "notion-gap-jigs-fixtures-maintenance-tools",
      lessonTitle: "지그·고정구와 보전 수공구",
      sectionId: "principle",
      assertionId:
        "notion-gap-jigs-fixtures-maintenance-tools-principle-2",
      evidenceText:
        "스패너는 미끄러졌을 때 몸의 균형을 잃지 않도록 맞는 치수를 사용해 몸 쪽으로 당긴다.",
    },
  ],
  "s3-maintenance-tools-lubrication-hammer": [
    {
      lessonId: "notion-gap-jigs-fixtures-maintenance-tools",
      lessonTitle: "지그·고정구와 보전 수공구",
      sectionId: "principle",
      assertionId:
        "notion-gap-jigs-fixtures-maintenance-tools-principle-2",
      evidenceText:
        "해머는 자루와 쐐기, 머리 균열을 확인하고 타격면을 깨끗하고 건조하게 유지한다.",
    },
  ],
  "s3-maintenance-tools-lubrication-chisel": [
    {
      lessonId: "notion-gap-jigs-fixtures-maintenance-tools",
      lessonTitle: "지그·고정구와 보전 수공구",
      sectionId: "principle",
      assertionId:
        "notion-gap-jigs-fixtures-maintenance-tools-principle-2",
      evidenceText:
        "정은 퍼진 머리를 다듬고 보안경 등 필요한 보호구를 착용한다.",
    },
  ],
  "s3-maintenance-tools-lubrication-file": [
    {
      lessonId: "notion-gap-jigs-fixtures-maintenance-tools",
      lessonTitle: "지그·고정구와 보전 수공구",
      sectionId: "principle",
      assertionId:
        "notion-gap-jigs-fixtures-maintenance-tools-principle-2",
      evidenceText:
        "줄은 손잡이를 단단히 끼우고 거친 눈에서 고운 눈 순으로 사용하며, 쇳가루를 입으로 불지 않고 줄솔로 제거한다.",
    },
  ],
  "s3-casting-plastic-materials-crystal-lattices": [
    {
      lessonId: "notion-gap-metal-crystal-lattices-deformation",
      lessonTitle: "금속 결정격자와 변형",
      sectionId: "principle",
      assertionId:
        "notion-gap-metal-crystal-lattices-deformation-principle-2",
      evidenceText:
        "FCC는 조밀충진된 {111}면의 슬립이 비교적 쉽게 활성화되어 일반적으로 전연성이 좋은 편이다.",
    },
  ],
  "s4-maintenance-methods-improvement-maintenance-cm": [
    {
      lessonId: "lesson-1d16t6u",
      lessonTitle: "상태기준보전",
      sectionId: "definition",
      assertionId: "definition",
      evidenceText:
        "개량보전(CM): 구조와 부품을 개선해 신뢰성·보전성·안전성을 높임.",
    },
  ],
};

/**
 * Subject 3 facts whose wording or scope was explicitly corrected against the
 * reviewed source boundary. Keep this list separate from title-only lesson
 * links so tests can fail closed when a correction loses its exact assertion.
 */
export const SUBJECT_THREE_REQUIRED_EVIDENCE_FACT_IDS = [
  "s3-drawing-lines-tolerance-dimensional-tolerance",
  "s3-drawing-lines-tolerance-hole-basis-system",
  "s3-drawing-lines-tolerance-fit-types",
  "s3-machine-tools-cutting-up-milling",
  "s3-machine-tools-cutting-down-milling",
  "s3-chips-tools-finishing-continuous-chip",
  "s3-casting-plastic-materials-hot-working",
  "s3-casting-plastic-materials-cold-working",
  "s3-casting-plastic-materials-malleability",
  "s3-casting-plastic-materials-ductility",
  "s3-casting-plastic-materials-specific-gravity",
  "s3-casting-plastic-materials-steel-five-elements",
  "s3-casting-plastic-materials-phosphorus-shortness",
  "s3-casting-plastic-materials-sulfur-shortness",
  "s3-assembly-fasteners-jig",
  "s3-assembly-fasteners-fixture",
  "s3-assembly-fasteners-screw-self-locking",
  "s3-shaft-coupling-bearing-oldham-coupling",
  "s3-power-transmission-brake-fade",
  "s3-power-transmission-brake-vapor-lock",
  "s3-piping-valves-seals-union",
  "s3-piping-valves-seals-flange",
  "s3-piping-valves-seals-expansion-joint",
  "s3-piping-valves-seals-gate-valve",
  "s3-piping-valves-seals-globe-valve",
  "s3-piping-valves-seals-check-valve",
  "s3-piping-valves-seals-butterfly-valve",
  "s3-piping-valves-seals-mechanical-seal",
  "s3-piping-valves-seals-labyrinth-seal",
  "s3-piping-valves-seals-anaerobic-adhesive",
  "s3-fluid-machinery-troubles-positive-displacement-compressor",
  "s3-fluid-machinery-troubles-turbo-compressor",
  "s3-maintenance-tools-lubrication-five-functions",
  "s3-maintenance-tools-lubrication-spanner",
  "s3-maintenance-tools-lubrication-hammer",
  "s3-maintenance-tools-lubrication-chisel",
  "s3-maintenance-tools-lubrication-file",
  "s3-casting-plastic-materials-crystal-lattices",
] as const;

export function getWrittenSubjectFactId(
  subjectCode: SubjectCode,
  bundle: BundleLike,
  fact: FactLike,
) {
  return fact.id ?? `legacy:${subjectCode}:${bundle.id}:${fact.cue}`;
}

export function getWrittenSubjectFactLessonTitles(
  subjectCode: SubjectCode,
  bundle: BundleLike,
  fact: FactLike,
) {
  const reviewedTitles =
    FACT_LESSON_LINKS[
      `${subjectCode}:${bundle.id}:${fact.cue}`
    ];
  if (reviewedTitles?.length) return [...reviewedTitles];
  if (fact.detailLessonTitles?.length) return [...fact.detailLessonTitles];
  return [];
}

export function getWrittenSubjectFactEvidenceBinding(
  subjectCode: SubjectCode,
  bundle: BundleLike,
  fact: FactLike,
): WrittenSubjectFactEvidenceBinding {
  const factId = getWrittenSubjectFactId(
    subjectCode,
    bundle,
    fact,
  );
  const lessonTitles = getWrittenSubjectFactLessonTitles(
    subjectCode,
    bundle,
    fact,
  );
  const evidenceTargets = FACT_EVIDENCE_TARGETS[factId] ?? [];

  if (evidenceTargets.length > 0) {
    return {
      factId,
      status: "verified_assertion",
      publicationPolicy: "inherit",
      lessonTitles,
      evidenceTargets: [...evidenceTargets],
    };
  }
  if (lessonTitles.length > 0) {
    return {
      factId,
      status: "linked_title_only",
      publicationPolicy: "inherit",
      lessonTitles,
      evidenceTargets: [],
    };
  }
  return {
    factId,
    status: "unlinked",
    publicationPolicy: "inherit",
    lessonTitles: [],
    evidenceTargets: [],
    reviewReason: "학습자 공개 레슨의 직접 근거 연결 검수 전",
  };
}

export function getWrittenSubjectBundleLessonTitles(
  subjectCode: SubjectCode,
  bundle: BundleLike,
) {
  return [
    ...new Set([
      ...bundle.detailLessonTitles,
      ...bundle.facts.flatMap((fact) =>
        getWrittenSubjectFactLessonTitles(subjectCode, bundle, fact),
      ),
    ]),
  ];
}
