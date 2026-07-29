type FactLike = {
  cue: string;
  detailLessonTitles?: string[];
};

type BundleLike = {
  id: string;
  facts: readonly FactLike[];
  detailLessonTitles: readonly string[];
};

type SubjectCode = 1 | 2 | 3 | 4;

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

function factKey(subjectCode: SubjectCode, bundleId: string, cue: string) {
  return `${subjectCode}:${bundleId}:${cue}`;
}

export function getWrittenSubjectFactLessonTitles(
  subjectCode: SubjectCode,
  bundle: BundleLike,
  fact: FactLike,
) {
  const reviewedTitles =
    FACT_LESSON_LINKS[factKey(subjectCode, bundle.id, fact.cue)];
  if (reviewedTitles?.length) return [...reviewedTitles];
  if (fact.detailLessonTitles?.length) return [...fact.detailLessonTitles];
  return [];
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
