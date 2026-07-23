type LessonSummary = {
  id: string;
  title: string;
};

type SubcategoryRule = {
  id: string;
  label: string;
  pattern: RegExp;
};

type GroupRuleSet = {
  rules: SubcategoryRule[];
  fallback: string;
};

export type LessonSubcategory<T extends LessonSummary = LessonSummary> = {
  id: string;
  label: string;
  lessons: T[];
};

const GROUP_RULES: Record<string, GroupRuleSet> = {
  "s1-g01": group("공유압 구성·특성", [
    rule("pressure", "압력·단위·환산", /압력|대기압|진공|SI|힘의 단위/),
    rule("fluid-law", "유체 법칙·계산", /베르누이|레이놀즈|파스칼|Darcy|연속의 법칙|비중|비체적|힘 관계/),
    rule("gas", "공기·가스 성질", /보일|샤를|압축성/),
    rule("oil", "작동유·이상 현상", /작동유|유압유|과열|에어레이션/),
  ]),
  "s1-g02": group("동력원·액추에이터 종합", [
    rule("pump", "유압펌프 종류·성능·고장", /펌프|토출|흡입|용적효율|캐비테이션/),
    rule("cylinder", "실린더 종류·선정·설치", /실린더|액추에이터/),
    rule("motor", "유압모터", /유압모터|기어모터/),
    rule("accumulator", "어큐뮬레이터", /어큐뮬레이터/),
    rule("tank", "탱크·부속기기", /탱크|부속/),
    rule("system", "동력전달 구성·순서", /동력전달/),
  ]),
  "s1-g03": group("밸브·시퀀스 응용", [
    rule("relief", "릴리프밸브", /릴리프/),
    rule("sequence-valve", "시퀀스밸브", /시퀀스밸브/),
    rule("sequence-circuit", "시퀀스 회로·제어", /시퀀스/),
  ]),
  "s1-g04": group("제어밸브 종합", [
    rule("pressure", "압력제어밸브", /압력|릴리프|카운터|언로드|클램프/),
    rule("direction", "방향제어·스풀밸브", /방향|스풀|센터|오버랩|파일럿/),
    rule("check", "체크·셔틀·논리밸브", /체크|셔틀|2압|고압우선/),
    rule("servo", "비례·서보·솔레노이드", /비례|서보|솔레노이드/),
    rule("operation", "선정·응답·고장", /선정|응답|채터링|급속배기|목적/),
  ]),
  "s1-g05": group("유량·속도제어 종합", [
    rule("meter", "미터인·미터아웃 회로", /미터인|미터아웃/),
    rule("flow", "유량·오리피스 계산", /유량|유출|오리피스/),
    rule("speed", "액추에이터·전동기 속도제어", /속도/),
  ]),
  "s1-g06": group("실린더 응용", [
    rule("type", "실린더 종류", /텔레스코프|로드리스|양로드|차동|공압실린더/),
    rule("installation", "설치·하중·밀봉", /설치|측하중|백업링/),
  ]),
  "s1-g07": group("압축공기 처리 종합", [
    rule("compressor", "공기압축기 종류·선정·운전", /공기압축기|회전식|압축기 작동/),
    rule("drying", "건조·냉각·드레인", /드라이어|건조|드레인|쿨러|냉각/),
    rule("service", "탱크·FRL·서비스유닛", /탱크|FRL|서비스/),
  ]),
  "s1-g08": group("공압 시스템 종합", [
    rule("circuit", "공압·유압 회로", /회로|캐스케이드|자기유지|플립플롭|메모리|차동/),
    rule("logic", "논리·신호·선도", /논리|신호|선도|간섭|능동소자/),
    rule("supply", "발생·저장·배관·서비스", /발생|저장|배관|서비스|윤활기/),
    rule("motor", "공압모터", /공기압모터|공압모터/),
    rule("automation", "자동조립·시스템 진단", /자동조립|고장진단|전기제어|번호체계|특징|전송/),
    rule("foundation", "공기압 기초·특성", /공기압 특성/),
  ]),
  "s1-g09": group("전기·전자 종합", [
    rule("circuit", "회로·전력·소자", /회로|전류|전하|저항|옴|전력|임피던스|수동소자|교류$/),
    rule("transformer", "변압기·계기·전선", /변압기|계기|전선|케이블|규소강판/),
    rule("induction", "유도전동기", /유도전동기|유도기전력/),
    rule("motor", "직류·동기·교류전동기", /전동기|DC모터|직류 직권/),
    rule("digital", "전자·마이크로프로세서", /마이크로프로세서|반도체/),
  ]),
  "s1-g10": group("센서·신호변환 종합", [
    rule("position", "위치·각도·회전 센서", /엔코더|인코더|회전수|속도검출|싱크로|퍼텐쇼미터|각도|자이로/),
    rule("proximity", "근접·자기 센서", /근접|자기 센서|리드스위치/),
    rule("signal", "신호변환·정류", /신호|정류/),
    rule("temperature", "온도센서", /온도/),
    rule("classification", "센서 분류·선정", /분류|목적/),
  ]),
  "s1-g11": group("자동제어 종합", [
    rule("foundation", "제어 구성·분류·정의", /구성|분류|정의|입력요소|프로세스 변수/),
    rule("loop", "개루프·폐회로·피드백", /개루프|폐회로|피드백|궤환|전달함수|시간응답/),
    rule("action", "P·I·D 제어동작", /비례|적분|미분|제어동작|편차/),
    rule("stability", "안정도·주파수응답", /나이키스트|보드선도|필터|응답지연|제어요소/),
    rule("application", "서보·프로세스·응용제어", /서보|프로세스|동기|비동기|학습|논리|2진|아날로그|압력제어/),
  ]),
  "s1-g12": group("산업자동화 종합", [
    rule("plc", "PLC·시퀀스·릴레이", /PLC|시퀀스|릴레이|접점|인터록|채터링|스파크/),
    rule("logic", "논리연산·네트워크", /논리|NOT|OR|네트워크|링형|환형|시그널 프로세서/),
    rule("robot", "로봇·티칭·보간", /로봇|티칭|플레이백|보간/),
    rule("handling", "핸들링·컨베이어·AGV", /핸들링|컨베이어|AGV|이송/),
    rule("automation", "자동화·FMS·공정", /자동화|FMS|공장자동화|가동손실|구성요소/),
    rule("motor", "스테핑모터", /스테핑|스텝모터/),
  ]),
  "s2-g01": group("용접 기초 종합", [
    rule("classification", "용접 분류·특징", /분류|특징/),
    rule("power", "아크용접기·극성", /용접기|극성/),
    rule("process", "CO₂·저항용접", /CO₂|저항용접/),
    rule("stress", "잔류응력·후처리", /잔류응력/),
  ]),
  "s2-g02": group("아크용접 종합", [
    rule("defect", "용접결함", /결함/),
    rule("arc", "아크 안정·쏠림", /아크/),
  ]),
  "s2-g03": group("특수용접 종합", [
    rule("thermit", "테르밋 용접", /테르밋/),
    rule("plasma", "플라즈마 아크용접", /플라즈마/),
  ]),
  "s2-g04": group("용접검사 종합", [
    rule("ndt", "비파괴검사", /비파괴/),
    rule("eddy", "와전류탐상", /와전류/),
  ]),
  "s2-g05": group("작업안전 종합", [
    rule("device", "기계 안전장치", /안전장치|원형톱/),
    rule("sign", "안전표지", /안전표지/),
  ]),
  "s3-g01": group("도면·측정 종합", [
    rule("drawing", "기계제도", /제도/),
    rule("measurement", "길이·변위 측정", /게이지|캘리퍼스|측정|감도/),
    rule("tolerance", "공차·끼워맞춤", /공차|끼워맞춤/),
    rule("principle", "측정 원리·판독", /아베|판독/),
  ]),
  "s3-g02": group("재료·열처리 종합", [
    rule("quench", "담금질·표면경화", /담금질|표면경화|고주파|질화|칼로라이징/),
    rule("heat", "풀림·불림·뜨임", /풀림|불림|뜨임|심랭/),
    rule("property", "재료 성질·변형", /재료|가공|팽창|스프링/),
  ]),
  "s3-g03": group("체결요소 종합", [
    rule("bolt", "볼트·너트 체결", /볼트|너트|렌치|아이볼트/),
    rule("thread", "나사 종류·표시", /나사|유니파이|미터|관용/),
    rule("locking", "풀림·고착 방지", /풀림|고착|와셔|분할핀|폴와셔/),
    rule("key", "키·핀·코터", /키|핀|코터/),
  ]),
  "s3-g04": group("축계 요소 종합", [
    rule("shaft", "축 설계·파손·중심내기", /축 |축$|축 설계|축 파손|축 중심|응력/),
    rule("coupling", "커플링·스플라인", /커플링|스플라인/),
    rule("clutch", "클러치", /클러치/),
  ]),
  "s3-g05": group("베어링 종합", [
    rule("structure", "종류·구조·규격", /구성|리테이너|번호|볼베어링|지지/),
    rule("selection", "수명·예압·설치", /수명|예압|열박음/),
    rule("diagnosis", "손상·발열·진단", /손상|발열|과열|이상음|체커/),
  ]),
  "s3-g06": group("기어·감속기 종합", [
    rule("type", "기어 종류·치형", /기어 종류|헬리컬|나사기어|웜기어|인벌류트|랙과 피니언/),
    rule("design", "제도·요목·기하", /제도|요목|간섭|언더컷|축방향/),
    rule("reducer", "감속기 종류·운전", /감속기|유성기어|사이클로이드|교차축/),
    rule("failure", "마모·피로·이상진단", /피로|피닝|마모|고장|진단|접촉조정/),
  ]),
  "s3-g07": group("동력전달요소 종합", [
    rule("belt", "벨트 전동", /벨트/),
    rule("chain", "체인·래칫", /체인|래칫/),
    rule("brake", "브레이크", /브레이크/),
    rule("friction", "마찰차·무단변속", /마찰차|무단변속/),
    rule("spring", "탄성요소", /스프링/),
  ]),
  "s3-g08": group("가공·공구 종합", [
    rule("lathe", "선반·보링·테이퍼", /선반|보링|테이퍼|척/),
    rule("drill", "드릴·탭·리머", /드릴|탭|다이스|리머|리밍/),
    rule("grinding", "연삭·래핑·정밀가공", /연삭|래핑|정밀연마|스크레이퍼/),
    rule("milling", "밀링가공", /밀링/),
    rule("hand", "수작업·금긋기·줄작업", /금긋기|줄 작업|서피스 게이지|수작업/),
    rule("tool", "절삭공구·가공조건", /공구|절삭|구성인선|공작기계/),
    rule("surface", "접착·도금", /접착|도금/),
  ]),
  "s3-g09": group("배관계통 종합", [
    rule("joint", "배관·관이음", /배관 이음|관이음|관 이음|플랜지|유니언|신축이음|나사식/),
    rule("valve", "밸브 종류·운전", /밸브|포지셔너/),
    rule("seal", "씰·패킹·O링", /씰|실 |실$|패킹|O링/),
    rule("water-hammer", "수격작용·방지", /수격/),
    rule("maintenance", "배관 설계·점검·부식", /배관|누설|응축수|부식|두께/),
  ]),
  "s3-g10": group("유체기계 종합", [
    rule("pump", "펌프 성능·진단", /펌프|NPSH|캐비테이션/),
    rule("blower", "송풍기·팬", /송풍기|팬|블로어/),
    rule("reciprocating", "왕복압축기", /왕복/),
    rule("compressor", "압축기 종류·성능·고장", /압축기/),
  ]),
  "s3-g11": group("전동기 보전 종합", [
    rule("overheat", "과열·결상·절연", /과열|결상|절연/),
    rule("failure", "기동·회전 고장", /기동|불규칙|고장/),
    rule("vibration", "진동·기계 이상", /진동|크레인/),
  ]),
  "s3-g12": group("정비작업 종합", [
    rule("inspection", "점검·체크리스트", /점검|체크/),
    rule("assembly", "조립 정밀도", /조립/),
  ]),
  "s4-g01": group("계측·신호처리 종합", [
    rule("characteristic", "계측 특성·오차·선정", /특성|오차|감도|부하효과|선정|기본입력/),
    rule("sensor", "전기·변위 센서", /센서|변류기|동전형|압전효과|정전용량|저항 측정|브리지|인코더/),
    rule("signal", "신호변환·FFT·샘플링", /신호|푸리에|FFT|샘플링|앨리어싱|A\/D|위상|파고율|RMS|시간평균|증폭기|시간상수|노이즈|접지/),
    rule("instrument", "계측기·오실로스코프", /계측기|오실로스코프/),
    rule("management", "계측관리·작업관리", /관리|계측화|합리화|개선/),
  ]),
  "s4-g02": group("진동 기초 종합", [
    rule("wave", "파동·주파수·진폭", /파동|주파수|주기|정현파|진폭|맥놀이|정재파|도플러|공명|진동 분류|규칙·불규칙/),
    rule("system", "고유진동·공진·감쇠", /고유|공진|감쇠|동배율|동적배율|자유진동|비감쇠|스프링|정적처짐|전달률/),
    rule("isolation", "방진·진동절연", /방진|절연|차단|전달경로|지지대/),
    rule("measurement", "진동 측정·센서·단위", /센서|측정|진동계|단위|실효값|진동속도|가속도|변위|레벨|3대 변수|척도|분석법|FFT|등청감/),
    rule("source", "설비 진동원·대책", /기어|캐비테이션|덕트|위험속도|진동원/),
  ]),
  "s4-g03": group("회전체 진단 종합", [
    rule("rotor", "불평형·축정렬", /언밸런스|축정렬/),
    rule("gear", "기어 결함진단", /기어/),
    rule("sensor", "가속도센서·회전수", /가속도센서|타코미터|회전수/),
    rule("analysis", "신호·축궤도 분석", /포락선|축궤도|오일휩/),
    rule("bearing", "베어링 진단", /베어링/),
  ]),
  "s4-g04": group("소음·음향 종합", [
    rule("foundation", "음파·음향 기초", /음파|음향|음압|음속|발산파|진행파|회절|굴절|구면파|선음원|점음원|잔향|공명|최소가청|소음 용어/),
    rule("measurement", "소음 측정·평가", /소음계|측정|교정|암소음|합성|청감보정|레벨|마이크/),
    rule("absorbing", "흡음·차음", /흡음|차음|차음벽|투과/),
    rule("silencer", "소음기·덕트 대책", /소음기|팽창형|반사형|덕트/),
    rule("control", "소음원 조사·저감", /발생원|방지|저감|대책|조사|기류음|공기동력|기어 소음|마스킹/),
  ]),
  "s4-g05": group("온도·압력·유량계측 종합", [
    rule("temperature", "온도계측", /온도|열전대|측온|방사온도/),
    rule("pressure", "압력계측", /압력|탄성식|스프링 변환기/),
    rule("flow", "유량계측", /유량|오리피스/),
    rule("displacement", "변위·회전수 계측", /변위|회전수|와전류/),
    rule("level", "레벨계측", /레벨/),
  ]),
  "s4-g06": group("상태감시·진단 종합", [
    rule("foundation", "설비진단 개념·체계", /개념|효과|필요성|기법|지능기술|상대판정/),
    rule("screening", "간이진단·정밀진단", /간이진단|정밀진단/),
    rule("oil", "오일분석·페로그래피", /오일|SOAP|ICP|페로그래피/),
    rule("deterioration", "열화·수리주기", /열화|수리주기/),
    rule("hydraulic", "유압펌프 상태진단", /유압펌프/),
  ]),
  "s4-g07": group("설비관리·보전 종합", [
    rule("strategy", "보전방식·전략", /예방보전|사후보전|상태기준|시간기준|일상보전|생산보전|개별사전|보전방식|보전 발전|보전전략|회사수준|종합적/),
    rule("organization", "조직·인력·업무", /조직|인력|작업자|기능분담|역할분담|외주|업무|실시기능|관리기능|부하\s*평준화/),
    rule("planning", "계획·주기·표준", /계획|주기|표준|검사흐름|빈도|성능표준|정비표준|예산/),
    rule("construction", "보전공사·견적·자재", /공사|견적|자재|구매|발주|부지/),
    rule("asset", "설비 분류·대장·코드", /설비대장|설비 분류|설비망|기호|코드|니모닉|부대설비|관리설비|기능설비|설비 범위/),
    rule("quality", "품질보전·고장재발방지", /품질보전|고장대책|재발|무결점|요인해석|현상분석/),
    rule("performance", "보전 목적·효과·지표", /목적|효과|지표|산식|가동시간|생산성/),
    rule("foundation", "설비관리 기초·체계", /설비관리|설비보전|보전예방|보전성|갱 시스템|유닛 보전/),
  ]),
  "s4-g08": group("신뢰성·보전성 종합", [
    rule("reliability", "신뢰성·고장률", /신뢰성|고장률|MTBF|척도|지표|데이터/),
    rule("maintainability", "보전성·수리율·MTTR", /보전도|보전성|수리율|MTTR/),
    rule("availability", "가용도", /가용도/),
    rule("failure-period", "고장기·고장원인", /초기고장|우발고장/),
    rule("lifecycle", "생애주기·FMECA", /생애주기|FMECA|사용신뢰성/),
  ]),
  "s4-g09": group("TPM·자주보전 종합", [
    rule("tpm", "TPM 체계·활동", /TPM/),
    rule("autonomous", "자주보전", /자주보전/),
    rule("loss", "설비 로스", /로스|정미가동시간|초기수율/),
    rule("oee", "OEE·가동률", /종합효율|가동률|OEE|성능가동률|유효가동률/),
    rule("pm", "PM분석·개별개선", /PM분석|개별개선|치명결점|품질불량|QM/),
    rule("qc", "QC 도구", /관리도|히스토그램|파레토|특성요인|QC 도구/),
  ]),
  "s4-g10": group("공장·생산계획 종합", [
    rule("layout", "공장·설비배치", /배치|CRAFT|GT 셀|공장계획/),
    rule("project", "공사·프로젝트·PERT", /공사|PERT|CPM|프로젝트|일정|진도|임계경로|공기단축/),
    rule("production", "생산성·생산계획", /생산|공정|정유|신제품/),
    rule("tooling", "치공구·검사구", /치공구|치구|검사구/),
    rule("inventory", "예비품·재고·발주", /재주문|상비|예비품|발주|ABC/),
    rule("decision", "설비계획·의사결정", /설비계획|의사결정|설계보증|유틸리티|복책법/),
  ]),
  "s4-g11": group("설비경제성 종합", [
    rule("investment", "설비투자 분류·평가", /투자|경제성평가|경제성 평가분류|경제성$/),
    rule("cost", "원가·비용", /원가|비용|간접비|ABC/),
    rule("evaluation", "경제성 계산기법", /연평균|연간비용|수익률|회수계수|MAPI/),
    rule("lcc", "생애주기·갱신", /LCC|갱신|기회손실/),
  ]),
  "s4-g12": group("에너지·열관리 종합", [
    rule("demand", "전력수요·부하관리", /부등률|부하율|수요율|전력손실/),
    rule("combustion", "연소관리", /연소/),
    rule("heat", "열전달·열관리", /열전도|열관리|슈테판|배열회수/),
    rule("wave", "에너지·파동 응용", /구면파|음의 세기/),
  ]),
  "s4-g13": group("윤활 기초 종합", [
    rule("friction", "마찰·마모·윤활상태", /마찰|마모|스코어링|유체윤활|경계윤활|극압윤활|유막|레이놀즈|트라이볼로지/),
    rule("property", "점도·물성·시험값", /점도|중화가|전산가|인화점|API|항유화|산화안정|파라핀|동점도|ISO VG/),
    rule("function", "윤활 목적·기능·작용", /목적|기능|작용|응력분산|밀봉|냉각/),
    rule("application", "기계별 윤활·선정", /베어링|기어|압축기|유압펌프|작동유|오일미스트|강제윤활|고체윤활|액상윤활/),
    rule("failure", "윤활고장·열화·대책", /고장|열화|사고|카본|슬러지/),
    rule("management", "윤활 관리·보관", /관리|보관|저장|재고|실시부서|기술자|세정주기|설계/),
    rule("form", "윤활제 형태·사용환경", /윤활제 형태|환경요인/),
  ]),
  "s4-g14": group("윤활유·그리스 종합", [
    rule("additive", "윤활유 첨가제", /첨가제|극압첨가|청정분산|소포제|산화방지제|유성향상제/),
    rule("degradation", "열화·산화·유화·오염", /열화|산화|유화|희석|탄화|오염/),
    rule("grease", "그리스 종류·특성·급유", /그리스|NLGI/),
    rule("application", "용도별 윤활유", /압축기|기어유|변압기유|절삭유|작동유|R&O|베어링|플러싱유|무단변속/),
    rule("test", "시험·판정·시료채취", /시험|판정|샘플|시료|분석|청정도|오염도|인화점|동판부식/),
    rule("property", "성상·기유·제조·선정", /물성|성질|성상|기유|석유계|광유|광물계|제조|종류 통일|기능|선정|소포성/),
  ]),
  "s4-g15": group("급유·윤활관리 종합", [
    rule("method", "급유법 종류·선정", /급유법|비말급유|유욕|전손식|순환식|강제순환|중앙집중|미끄럼베어링 급유/),
    rule("device", "급유장치·운전조건", /급유장치|유면|탱크온도|밀폐기어/),
    rule("flushing", "플러싱·오염관리", /플러싱|오염|에어브리더/),
    rule("grease", "그리스윤활", /그리스윤활/),
    rule("organization", "윤활관리 조직·업무", /조직|업무|위임|카드/),
    rule("management", "윤활관리 원칙·효과·개선", /윤활관리|급유관리|작동유 관리|압축기 윤활관리/),
  ]),
};

export function getLessonSubcategories<T extends LessonSummary>(groupId: string, lessons: T[]) {
  const ruleSet = GROUP_RULES[groupId];
  if (!ruleSet) return [{ id: "overview", label: "개념 모아보기", lessons }];

  const buckets = new Map(ruleSet.rules.map((item) => [item.id, { id: item.id, label: item.label, lessons: [] as T[] }]));
  const fallback = { id: "overview", label: ruleSet.fallback, lessons: [] as T[] };

  for (const lesson of lessons) {
    const matchedRule = ruleSet.rules.find((item) => item.pattern.test(lesson.title));
    if (matchedRule) buckets.get(matchedRule.id)?.lessons.push(lesson);
    else fallback.lessons.push(lesson);
  }

  const populated = [...buckets.values()].filter((item) => item.lessons.length > 0);
  if (fallback.lessons.length > 0) populated.push(fallback);
  return populated;
}

function group(fallback: string, rules: SubcategoryRule[]): GroupRuleSet {
  return { fallback, rules };
}

function rule(id: string, label: string, pattern: RegExp): SubcategoryRule {
  return { id, label, pattern };
}
