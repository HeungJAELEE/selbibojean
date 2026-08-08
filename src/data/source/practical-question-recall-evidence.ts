import {
  PRACTICAL_QUESTION_RECALL_AUDIT,
  type PracticalQuestionRecallAuditItem,
} from "./practical-question-recall-audit";

export type PracticalRecallEvidenceSource = {
  id: string;
  title: string;
  authority:
    | "official_law"
    | "public_ncs"
    | "official_safety"
    | "official_standard"
    | "manufacturer"
    | "open_media_repository"
    | "technical";
  url: string;
  supports: string;
  limitation: string;
};

export type PracticalRecallEvidenceReview = {
  auditId: string;
  reviewedAt: "2026-07-28";
  outcome:
    | "learning_source_verified_prompt_missing"
    | "source_search_completed_prompt_missing";
  sources: PracticalRecallEvidenceSource[];
  localSearchSummary: string;
  exactExamPromptFound: false;
  publicAnswerAuthorized: false;
  learningPoint: string | null;
  memoryTip: string | null;
};

const LOCAL_PDF_SEARCH =
  "보유한 설비보전 교재·OCR·2025 공개문제 PDF와 2026-07-18~22 수신 이미지를 대조했으나 동일한 전체 지문·보기·원그림은 찾지 못했다.";

export const PRACTICAL_RECALL_EVIDENCE_REVIEWS: PracticalRecallEvidenceReview[] =
  [
    {
      auditId: "recall:2026-round2:sems-bolt",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "NORD-LOCK-SEMS-OVERVIEW",
          title: "Nord-Lock SEMS Overview",
          authority: "manufacturer",
          url: "https://www.nord-lock.com/nl-nl/insights/bolting-tips/2012/the-experts-sems-overview/",
          supports: "와셔를 나사산 전조 전에 조립해 빠지지 않도록 만든 포획 와셔형 나사 구조",
          limitation: "실제 시험 사진 속 부품과 동일한 제품인지는 판정할 수 없다.",
        },
        {
          id: "COMMONS-BOLT-WITH-WASHER",
          title: "Wikimedia Commons — Bolt with washer",
          authority: "open_media_repository",
          url: "https://commons.wikimedia.org/wiki/File:Bolt_with_washer.jpg",
          supports:
            "평와셔와 스프링와셔가 볼트에 미리 조립된 SEMS형 구조를 실사로 판독",
          limitation:
            "CC BY-SA 동등 식별자료이며 원시험 사진과 동일한 제품·촬영각도는 아니다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "SEMS는 나사와 와셔를 한 부품처럼 취급하도록 와셔가 빠지지 않게 미리 조립된 체결품이다.",
      memoryTip:
        "SEMS는 ‘Screw에 washer가 미리 Set’된 모습으로 기억하고, 사진에서는 와셔가 나사산을 넘어 빠지지 않는지 본다.",
    },
    {
      auditId: "recall:2026-round2:drip-lubrication",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "SKF-CHAIN-DRIP-FEED",
          title: "SKF Power Transmission Products — Lubrication methods",
          authority: "manufacturer",
          url: "https://cdn.skfmediahub.skf.com/api/public/0901d19680cc91d3/pdf_preview_medium/0901d19680cc91d3_pdf_preview_medium.pdf",
          supports:
            "적하급유를 오일이 정해진 속도로 드립 노즐에 공급되는 저속용 윤활 방식으로 구분",
          limitation:
            "복원 문제의 사진·전체 선택지·선택 개수는 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "적하급유는 오일을 정해진 속도로 한 방울씩 공급하는 방식이며, 장치와 운전 속도에 맞춰 급유량을 조절한다.",
      memoryTip:
        "적하는 ‘정해진 속도로 한 방울씩’—기름에 담그는 유욕급유와 구분한다.",
    },
    {
      auditId: "recall:2026-round2:grinding-wheel",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "LAW-OSH-RULE-122",
          title: "산업안전보건기준에 관한 규칙 제122조",
          authority: "official_law",
          url: "https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0122&lsiSeq=273603&urlMode=lsScJoRltInfoR",
          supports: "작업 시작 전 1분, 교체 후 3분 시험운전과 지름 5 cm 이상 위험부의 덮개 기준",
          limitation: "복원 시험문제의 전체 문장과 보기를 제공하지는 않는다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "연삭숫돌은 작업 시작 전 1분, 교체 후 3분 이상 시험운전하고 지름 5 cm 이상이면 위험부 덮개를 갖춰야 한다.",
      memoryTip: "연삭 안전 숫자는 ‘시작 1·교체 3·지름 5’로 묶어 외운다.",
    },
    {
      auditId: "recall:2026-05-10:2",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "KOSHA-TIG-SAFETY-2011",
          title: "한국산업안전보건공단 TIG용접기 안전작업",
          authority: "official_safety",
          url: "https://www.kosha.or.kr/kosha/intro/northernGyeonggiBranch_A.do?articleNo=351884&attachNo=199374&mode=download",
          supports: "비소모성 텅스텐 전극, 아르곤·헬륨 실드가스와 비철금속·박판 적용 특성",
          limitation: "복원된 객관식 보기와 정답 번호는 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "TIG는 비소모성 텅스텐 전극과 아르곤·헬륨 같은 불활성 실드가스를 사용하는 용접 방식이다.",
      memoryTip:
        "TIG는 ‘T=텅스텐, I=불활성가스’로 연결하고 전극은 녹여 넣는 재료가 아니라는 점을 함께 기억한다.",
    },
    {
      auditId: "recall:2026-05-10:3",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "WEGLOWSKI-ARC-TEMPERATURE-2005",
          title: "Determination of GTA and GMA welding arc temperatures",
          authority: "technical",
          url: "https://doi.org/10.1533/wint.2005.3398",
          supports:
            "용접 아크 온도는 용접 변수와 실드가스에 따라 약 5,000~30,000 K 범위로 달라질 수 있음",
          limitation:
            "복원 문제에서 어느 공정·아크 위치·측정 조건을 가정했는지는 확인할 수 없다.",
        },
      ],
      localSearchSummary:
        "동일 문제의 단일 온도값은 찾지 못했지만, 전문 연구에서 공정 조건별 범위를 확인했다. " +
        LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "용접 아크 온도는 하나의 고정값이 아니라 공정, 용접 변수, 실드가스와 아크 내 측정 위치에 따라 크게 달라진다.",
      memoryTip:
        "아크 온도 숫자를 보면 먼저 ‘공정·가스·측정 위치’를 확인하고, 조건 없는 단일 숫자는 범위값과 구분한다.",
    },
    {
      auditId: "recall:2026-05-10:4",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "KOSHA-WELDING-PPE",
          title: "한국산업안전보건공단 용접작업 안전 가이드",
          authority: "official_safety",
          url: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=26&um=s",
          supports: "보안면, 방진마스크, 용접장갑, 보호복 등 용접작업 개인보호구",
          limitation: "복원 문제의 작업 온도·환경과 전체 보기를 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "용접작업에서는 눈·호흡기·손·몸을 각각 보안면, 방진마스크, 용접장갑, 보호복으로 보호한다.",
      memoryTip: "보호 부위를 ‘눈·숨·손·몸’ 네 묶음으로 외운다.",
    },
    {
      auditId: "recall:2026-05-10:5",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "TWI-LAMELLAR-TEARING-047",
          title: "TWI Defects - Lamellar Tearing",
          authority: "technical",
          url: "https://www.twi-global.com/technical-knowledge/job-knowledge/defects-lamellar-tearing-047.aspx",
          supports: "압연강판 두께방향 연성, 개재물 방향과 용접 수축변형에 따른 층상균열 특성",
          limitation: "국내 시험 원문이나 객관식 보기를 제공하는 자료는 아니다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "라멜라 테어는 압연강판의 두께 방향 연성이 부족할 때 용접 수축응력으로 층상 형태의 균열이 생기는 결함이다.",
      memoryTip:
        "압연면 안쪽이 아니라 판 두께 방향 Z축에서 ‘층층이 찢어진다’고 연결한다.",
    },
    {
      auditId: "recall:2026-05-10:7",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "NASA-NPR-8715-3B-SAFETY-FACTOR",
          title: "NASA NPR 8715.3B Appendix B — Factor of Safety",
          authority: "official_standard",
          url: "https://nodis3.gsfc.nasa.gov/displayCA.cfm?Internal_ID=N_PR_8715_003B_&page_name=AppendixB",
          supports:
            "안전율을 설계 조건과 설계 시 지정한 최대 운전 조건의 비로 정의",
          limitation:
            "복원값 1.05를 계산할 하중·재료·허용응력 조건은 제공하지 않는다.",
        },
      ],
      localSearchSummary:
        "공식 정의는 확인했지만 회상값 1.05를 결정할 하중·재료·허용응력 조건은 찾지 못했다. " +
        LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "안전율은 설계가 견디도록 정한 조건을 최대 운전 조건과 비교한 비이며, 계산값은 어떤 강도·하중을 분자와 분모에 두는지 확인해야 한다.",
      memoryTip:
        "안전율은 ‘견딜 수 있는 기준 ÷ 실제 최대 사용’으로 방향을 먼저 잡고 단위를 약분한다.",
    },
    {
      auditId: "recall:2026-05-10:8",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "KOSHA-WORK-AT-HEIGHT-PPE",
          title: "한국산업안전보건공단 고소작업 개인보호구 기준",
          authority: "official_safety",
          url: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=516&callmode=normal&catimage=&eclang=ko&start=148&um=s",
          supports: "높이 또는 깊이 2 m 이상 추락위험 장소의 안전모·안전대 지급과 착용",
          limitation: "복원 시험문제의 전체 보기와 세부 작업조건은 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "높이 또는 깊이 2 m 이상에서 추락 위험이 있으면 작업 조건에 맞는 안전모와 안전대를 지급하고 착용하게 해야 한다.",
      memoryTip: "고소작업은 ‘2 m부터 머리와 몸’으로 안전모·안전대를 묶어 외운다.",
    },
    {
      auditId: "recall:2026-05-10:9",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "ASNT-UT-INTERNAL-DEFECTS",
          title: "ASNT Ultrasonic Testing — A Versatile Method for NDT",
          authority: "technical",
          url: "https://www.asnt.org/what-is-nondestructive-testing/methods/ultrasonic-testing",
          supports:
            "UT는 내부 불연속을 탐지·측정할 수 있고 PT·MT는 표면 기반 검사라는 적용 범위",
          limitation:
            "복원 문제의 검사 대상, 균열 방향과 정확한 보기는 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "균열 깊이와 내부 불연속을 평가할 때는 초음파탐상처럼 체적검사가 가능한 방법을 우선 검토하고, 표면 개구 결함용 PT와 구분한다.",
      memoryTip:
        "표면에 열린 균열은 PT, 안쪽 깊이·거리 정보는 UT로 먼저 연결한다.",
    },
    {
      auditId: "recall:2026-05-10:10",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "FESTO-PNEUMATIC-VALVE-ACTUATION",
          title: "Festo Pneumatic valves — Operation",
          authority: "manufacturer",
          url: "https://www.festo.com/ie/en/e/blog/in-practice/pneumatic-valves-id_1517727",
          supports:
            "공압 밸브의 수동·기계·전기·공압 조작 방식은 각각 별도 기호로 표시됨",
          limitation:
            "복원 문제에 제시된 원기호와 전체 선택지는 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "공압 제어기호는 밸브 사각형 안의 유로와 바깥쪽 수동·기계·전기·공압 조작 기호를 나눠 읽는다.",
      memoryTip:
        "밸브는 ‘안은 흐름, 밖은 손·기계·전기·공기’ 순서로 판독한다.",
    },
    {
      auditId: "recall:2026-05-10:17",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "REXNORD-FALK-LIFELIGN-LUBRICATION",
          title: "Rexnord Falk Lifelign Gear Coupling Maintenance",
          authority: "manufacturer",
          url: "https://www.rexnord.com/contentitems/techlibrary/documents/couplings/cp3-012_manual",
          supports:
            "기어 커플링 윤활제와 급유량은 커플링 크기·형식·운전속도에 따라 달라짐",
          limitation:
            "복원 문제의 커플링 형식과 지정 제품은 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "기어 커플링의 그리스 종류와 급유량은 커플링 크기·형식·회전속도와 제작사 지침을 함께 확인해 정한다.",
      memoryTip:
        "커플링 윤활은 ‘크기–형식–속도–제작사표’ 네 칸을 확인한다.",
    },
    {
      auditId: "recall:2026-05-10:19",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "SKF-ROLLING-BEARINGS-GREASE-SELECTION",
          title: "SKF Rolling bearings in electric motors and generators",
          authority: "manufacturer",
          url: "https://cdn.skfmediahub.skf.com/api/public/0901d196802b0348/pdf_preview_medium/0901d196802b0348_pdf_preview_medium.pdf",
          supports:
            "그리스 선정 시 베어링 형식·크기, 온도, 하중, 속도, 진동·축방향, 냉각, 밀봉, 환경을 고려",
          limitation:
            "복원 문제의 장치와 운전조건·전체 선택지는 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "그리스는 속도·하중·온도뿐 아니라 베어링 형식, 진동, 냉각, 밀봉과 물·분진 환경까지 함께 고려해 선정한다.",
      memoryTip:
        "그리스 선정은 ‘속·하·온’에 ‘진동·밀봉·환경’을 붙여 체크한다.",
    },
    {
      auditId: "recall:2026-05-10:21",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "KHK-GEAR-DAMAGE-TECHNICAL-DATA",
          title: "KHK/KG Stock Gears Technical Data — Gear damage",
          authority: "manufacturer",
          url: "https://www.kggear.co.jp/en/wp-content/themes/bizvektor-global-edition/pdf/TechnicalData_KGSTOCKGEARS.pdf",
          supports:
            "기어 손상을 파손·마모·소성변형·치면피로·열손상 등으로 구분하고 흔적별 원인을 제시",
          limitation:
            "복원 문제의 사진·손상 위치·전체 선택지는 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "기어 손상은 파손, 마모, 소성변형, 치면피로, 열손상처럼 관찰 형태를 먼저 분류한 뒤 하중·윤활·정렬·오염 원인을 추적한다.",
      memoryTip:
        "손상 진단은 ‘모양을 이름 붙이고, 하중–윤활–정렬–오염을 역추적’한다.",
    },
    {
      auditId: "recall:2026-05-10:33",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "SKF-OIL-BATH-AND-OTHER-METHODS",
          title: "SKF Rolling bearings — Oil lubrication methods",
          authority: "manufacturer",
          url: "https://cdn.skfmediahub.skf.com/api/public/0901d196802b0348/pdf_preview_medium/0901d196802b0348_pdf_preview_medium.pdf",
          supports:
            "유욕급유는 회전부가 저장조 오일을 퍼 올리는 방식이며 순환급유는 펌프로 순환·여과·냉각하는 별도 방식",
          limitation:
            "복원 문제의 전체 선택지와 ‘아닌 것’ 판정 대상은 확인할 수 없다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "유욕급유는 회전부가 오일 저장조에 일부 잠겨 오일을 퍼 올리고, 순환·분사·적하급유는 별도 공급 장치나 경로를 사용한다.",
      memoryTip:
        "유욕은 ‘담가서 퍼 올림’, 순환·분사·적하는 ‘밖에서 보내 줌’으로 구분한다.",
    },
    {
      auditId: "recall:2026-05-10:38",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "SKF-OIL-AGEING-CONTAMINATION",
          title: "SKF Rolling bearings — Oil lubrication",
          authority: "manufacturer",
          url: "https://cdn.skfmediahub.skf.com/api/public/0901d196802b0348/pdf_preview_medium/0901d196802b0348_pdf_preview_medium.pdf",
          supports:
            "고속·고온은 오일 노화를 촉진하고 여과는 오염 수준을 낮추며, 항산화제는 베이스오일 열화를 지연",
          limitation:
            "복원 문제에서 요구한 내부·외부 분류의 전체 보기는 확인할 수 없다.",
        },
        {
          id: "SKF-BEARING-DAMAGE-MOISTURE",
          title: "SKF Bearing damage and failure analysis",
          authority: "manufacturer",
          url: "https://cdn.skfmediahub.skf.com/api/public/0901d1968064c148/pdf_preview_medium/0901d1968064c148_pdf_preview_medium.pdf",
          supports:
            "외부 유입 수분과 화학물질이 윤활유에 섞여 부식·에칭을 유발할 수 있음",
          limitation:
            "복원 문제의 정확한 오염물 목록을 제공하지는 않는다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "내부 열화는 산화·고온 노화처럼 오일 자체 성질이 변하는 현상이고, 외부 오염은 물·분진·마모분·화학물질이 유입되는 현상이다.",
      memoryTip:
        "내부는 ‘기름이 변함’, 외부는 ‘다른 것이 들어옴’으로 먼저 나눈다.",
    },
    {
      auditId: "recall:2026-05-10:35",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "MILLER-WELDING-DUTY-CYCLE",
          title: "MillerWelds Duty Cycle 안내",
          authority: "manufacturer",
          url: "https://www.millerwelds.com/en-us/resources/knowledge-hub/welding-basics/duty-cycle-what-it-is-and-why-its-important",
          supports: "용접기 사용률을 10분 주기 중 연속 운전 가능한 시간의 비율로 설명",
          limitation: "복원 문제의 전체 문장과 요구 단위를 제공하지는 않는다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "용접기 사용률은 10분 주기에서 정격 출력으로 연속 용접할 수 있는 시간의 비율이다.",
      memoryTip:
        "사용률 계산은 ‘10분 × 사용률’로 운전시간을 구하고 나머지를 냉각시간으로 본다.",
    },
    {
      auditId: "recall:2026-round2:brake-lining",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "NCS-1505010108-BRAKE-MAINTENANCE",
          title: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
          authority: "public_ncs",
          url: "https://drive.google.com/file/d/1D1mnd6vEYqnVvHy1J894vjpGv6_qoBzV/view",
          supports:
            "브레이크 라이닝·패드의 마모·균열·편마모 점검, 정비 전 안전조치와 정비 후 제동기능 확인",
          limitation:
            "복원 시험의 단계별 문장 보기와 배열은 확인되지 않아 실제 순서 정답을 확정할 수 없다.",
        },
      ],
      localSearchSummary:
        "NCS 1505010108 PDF 156·158쪽과 기존 공개 개념카드를 대조했으며, 복원된 단계별 문장 보기 전체는 찾지 못했다.",
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "브레이크 정비는 에너지 격리와 설비 고정 후 라이닝·패드의 마모·균열·오염·간극을 점검하고, 제조사 기준에 따라 조치한 뒤 제동기능을 확인한다.",
      memoryTip:
        "브레이크 정비 흐름은 ‘안전–분해·상태점검–기준조치–조립·제동확인’으로 외우되, 실제 배열 답은 제시된 문장 전체를 보고 확정한다.",
    },
    {
      auditId: "recall:2026-05-10:1",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "NCS-1601050111-WELDING-HAZ",
          title: "NCS 학습모듈 「피복아크용접 맞대기용접」",
          authority: "public_ncs",
          url: "https://drive.google.com/file/d/1EJGtPKaX9BqGGK_yaGOG0B6ZYAAyuiXO/view",
          supports: "용접 열영향부·냉각속도·예열 조건과 입열의 영향",
          limitation:
            "복원 문제의 정확한 지문과 보기를 제공하지 않아 새 기출 문항으로 만들 수 없다.",
        },
        {
          id: "TWI-WELD-DISTORTION",
          title: "TWI Preventing and Correcting Weld Material Distortion",
          authority: "technical",
          url: "https://www.twi-global.com/media-and-events/insights/preventing-and-correcting-weld-material-distortion",
          supports:
            "용접 열영향부의 가열·냉각에 따른 수축, 인장응력, 잔류응력과 변형",
          limitation: "일반 용접 원리 자료이며 복원 시험의 원문은 아니다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "용접은 국부 가열과 냉각 때문에 열영향부의 조직·성질 변화, 수축, 잔류응력과 변형을 만들 수 있다.",
      memoryTip:
        "용접 일반 성질은 ‘가열–용융–냉각–수축’ 뒤에 ‘열영향부·잔류응력·변형’이 남는다고 묶어 외운다.",
    },
    {
      auditId: "recall:2026-05-10:11",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "OSHA-POINT-SOURCE-FREE-FIELD",
          title: "OSHA Technical Manual — Noise",
          authority: "official_safety",
          url: "https://www.osha.gov/otm/section-3-health-hazards/chapter-5",
          supports:
            "자유음장에서 점원 음향 출력이 구면으로 퍼지고 거리가 두 배가 되면 음압레벨이 6 dB 감소하는 역제곱 관계",
          limitation:
            "복원 문제의 정확한 계산 조건과 보기는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "자유음장의 점원은 음향 출력이 구면으로 퍼져 세기가 거리 제곱에 반비례하고, 거리가 두 배가 되면 음압레벨은 약 6 dB 감소한다.",
      memoryTip: "점원은 ‘구면 4πr², 거리 2배면 -6 dB’로 외운다.",
    },
    {
      auditId: "recall:2026-05-10:12",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "CARR-LANE-JIG-FIXTURE",
          title: "Carr Lane Jig & Fixture Definitions",
          authority: "manufacturer",
          url: "https://www.carrlane.com/engineering-resources/technical-information/design-standards-engineering-information/workholding-definitions",
          supports:
            "지그와 픽스처 모두 공작물을 지지·고정·위치결정하지만 지그는 절삭공구를 안내한다는 구분",
          limitation: "복원 문제의 전체 지문과 보기는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "지그는 공작물을 지지·고정·위치결정하면서 부시 등으로 절삭공구의 위치와 진행을 안내한다.",
      memoryTip: "지그는 ‘고정+공구 안내’, 픽스처는 ‘고정+공구 기준’으로 구분한다.",
    },
    {
      auditId: "recall:2026-05-10:13",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "DOE-PREVENTIVE-MAINTENANCE",
          title: "U.S. DOE Operations and Maintenance Challenges and Solutions",
          authority: "official_standard",
          url: "https://www.energy.gov/cmei/femp/operations-and-maintenance-challenges-and-solutions",
          supports:
            "예방보전을 시간 기준 조치로, 사후보전을 고장 후 수리·교환으로 구분",
          limitation: "복원 문제의 정확한 선택지는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "예방보전은 고장 전 정해진 시간·주기에 따라 점검·정비하는 방식이고, 사후보전은 고장 뒤 수리·교환하는 방식이다.",
      memoryTip: "고장 전 PM, 고장 후 BM으로 시점을 먼저 가른다.",
    },
    {
      auditId: "recall:2026-05-10:14",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "LOCTITE-ANAEROBIC-THREADLOCKER",
          title: "Loctite Threadlocker 안내",
          authority: "manufacturer",
          url: "https://www.loctiteproducts.com/ideas/fix-stuff/use-pipe-sealant-to-put-an-end-to-leaks.html",
          supports:
            "밀착된 금속 표면 사이에서 공기가 차단되면 혐기성으로 경화해 나사를 고정·밀봉하는 원리",
          limitation: "복원 문제의 제품 조건과 전체 보기는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "혐기성 접착제는 밀착된 금속 부품 사이에서 공기가 차단되면 경화해 나사부를 고정하고 누설·풀림을 막는다.",
      memoryTip: "혐기성은 ‘금속 사이, 공기 없음, 경화’ 세 단어로 외운다.",
    },
    {
      auditId: "recall:2026-05-10:15",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "ATLAS-COPCO-COMPRESSOR-TYPES",
          title: "Atlas Copco Types of Air Compressors",
          authority: "manufacturer",
          url: "https://www.atlascopco.com/en-uk/compressors/compressed-air-tips/types-of-air-compressors",
          supports:
            "왕복동식은 용적형·다단 고압에 적합하고 원심식은 임펠러와 디퓨저를 사용하는 동력형·대유량 용도라는 구분",
          limitation:
            "복원 문제의 운전조건과 비교 선택지는 확인되지 않아 절대적인 우열로 단정하지 않는다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "왕복동식 압축기는 피스톤으로 체적을 줄이는 용적형으로 고압에 적합하고, 원심식은 임펠러로 속도를 준 뒤 압력으로 바꾸는 동력형으로 대유량에 적합하다.",
      memoryTip: "왕복동은 ‘피스톤·고압’, 원심은 ‘임펠러·대유량’으로 짝지어 외운다.",
    },
    {
      auditId: "recall:2026-05-10:16",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "FESTO-PNEUMATIC-ENERGY-AUDIT",
          title: "Festo Compressed Air Energy Efficiency Audit",
          authority: "manufacturer",
          url: "https://www.festo.com/ee/en/e/support/additional-services/compressed-air-energy-efficiency-audit-id_2012747",
          supports:
            "공기 누설·압력강하·과압·부적절한 배관과 부품 크기로 에너지와 비용 손실이 생길 수 있음",
          limitation: "복원 문제의 정확한 단점 선택지는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "공압은 압축공기 생성에 에너지가 들고 누설·압력강하·압축성 때문에 효율과 정밀 위치·속도 제어에 불리할 수 있다.",
      memoryTip: "공압 단점은 ‘압축비용–누설–압력강하–압축성’ 순서로 묶는다.",
    },
    {
      auditId: "recall:2026-05-10:18",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "MITUTOYO-FEELER-GAGES",
          title: "Mitutoyo Thickness/Feeler Gages",
          authority: "manufacturer",
          url: "https://dev.pim.mitutoyo.com/products/small-tool-instruments-and-data-management/instruments-and-reference-gages/reference-gages/thickness-feeler-gages/",
          supports: "필러 게이지를 간극 두께와 슬롯 치수 확인에 사용하는 용도",
          limitation:
            "복원 문제가 커플링의 면간극을 묻는지 편심·각도오차를 묻는지 전체 문장으로 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "커플링의 두 면 사이 간극은 규격 두께의 필러 게이지로 확인하고, 편심·각도오차는 다이얼 게이지 등 별도 방법으로 점검한다.",
      memoryTip: "면 사이 틈은 필러, 축 흔들림·편심은 다이얼로 구분한다.",
    },
    {
      auditId: "recall:2026-05-10:20",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "NLGI-GREASE-GLOSSARY",
          title: "NLGI Grease Glossary",
          authority: "official_standard",
          url: "https://www.nlgi.org/wp-content/uploads/2022/02/NLGI-Grease-Glossary.pdf",
          supports:
            "ASTM D217 혼화주도에 따른 NLGI 000~6의 일관성 등급과 번호가 클수록 단단해지는 순서",
          limitation:
            "NLGI 등급은 그리스의 모든 성능이나 용도 적합성을 단독으로 결정하지 않는다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "NLGI 주도번호는 그리스의 혼화주도에 따른 일관성 등급이며, 일반적으로 번호가 커질수록 더 단단한 그리스다.",
      memoryTip: "NLGI 숫자 상승은 굳기 상승, 침입 깊이는 반대로 감소한다고 외운다.",
    },
    {
      auditId: "recall:2026-05-10:34",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "NIST-HB-135-LCCA",
          title: "NIST Handbook 135e2025 — Life Cycle Costing Manual",
          authority: "official_standard",
          url: "https://nvlpubs.nist.gov/nistpubs/hb/2025/NIST.HB.135e2025.pdf",
          supports:
            "취득·운전·유지·폐기 비용을 현재가치로 합산해 같은 조건의 대안을 비교하는 생애주기비용 평가",
          limitation:
            "복원 문제의 경제성 지표·계산조건·선택지는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint:
        "설비 경제성 평가는 구입비만 보지 않고 취득·운전·유지·폐기 비용을 같은 기준일과 기간의 현재가치로 환산해 대안을 비교한다.",
      memoryTip: "경제성은 ‘사고–쓰고–고치고–버리는’ 전 생애비용을 현재가치로 묶는다.",
    },
    {
      auditId: "recall:2026-05-10:36",
      reviewedAt: "2026-07-28",
      outcome: "learning_source_verified_prompt_missing",
      sources: [
        {
          id: "BIPM-SI-ELECTRIC-CHARGE",
          title: "BIPM SI Brochure 9th edition",
          authority: "official_standard",
          url: "https://www.bipm.org/en/publications/si-brochure",
          supports: "전하의 SI 유도단위가 쿨롬(C)이고 기본단위로 A·s라는 정의",
          limitation: "복원 문제의 전체 보기는 확인되지 않았다.",
        },
      ],
      localSearchSummary: LOCAL_PDF_SEARCH,
      exactExamPromptFound: false,
      publicAnswerAuthorized: false,
      learningPoint: "전하의 SI 단위는 쿨롬(C)이며 1 C는 1 A의 전류가 1 s 동안 운반한 전하량이다.",
      memoryTip: "전하 Q는 C, 전류 I는 A이고 Q=It이므로 C=A·s로 연결한다.",
    },
  ];

export type PracticalRecallAnswerDecision = {
  auditId: string;
  reviewedAt: "2026-07-28";
  resolution:
    | "8 mm, 9 mm"
    | "약 12.53 hp"
    | "종단부 균열(크레이터 균열)"
    | "윤활유의 유막강도가 충분히 증가한다"
    | "침투성이 좋다";
  confidence: "high" | "medium";
  basis: string;
  sourceLinks: Array<{ title: string; url: string }>;
  reconstructedChoiceBoundary: string;
};

export const PRACTICAL_RECALL_ANSWER_DECISIONS: PracticalRecallAnswerDecision[] =
  [
    {
      auditId: "recall:2026-round2:m18-drawing",
      reviewedAt: "2026-07-28",
      resolution: "8 mm, 9 mm",
      confidence: "medium",
      basis:
        "복원 보기 7/9, 8/9, 16/18 중 M18×2의 바깥지름 반지름은 9 mm이고 기본 안지름 15.835 mm의 반지름은 약 7.92 mm이므로 mm 단위 보기에서는 8 mm가 성립한다.",
      sourceLinks: [
        {
          title: "M18×2 기본 나사 치수표",
          url: "https://www.machiningdoctor.com/threadinfo/?tid=2033",
        },
      ],
      reconstructedChoiceBoundary:
        "원도면의 A·B 지시선은 없으므로 A=안지름 반지름, B=바깥지름 반지름으로 읽는 복원 조건에 한정한다.",
    },
    {
      auditId: "recall:2026-round2:blower-power",
      reviewedAt: "2026-07-28",
      resolution: "약 12.53 hp",
      confidence: "high",
      basis:
        "같은 송풍기에서 공기밀도와 효율이 같고 회전수만 380 rpm에서 500 rpm으로 변하면 동력은 회전수비의 세제곱에 비례하므로 5.5×(500/380)^3≈12.53 hp이다.",
      sourceLinks: [
        {
          title: "AMETEK Rotron Fan Laws",
          url: "https://www.rotron.com/tech-corn/fanlaws",
        },
      ],
      reconstructedChoiceBoundary:
        "문제에 토크 일정 조건이 명시된 별도 보기가 있었다면 단순 비례값이 될 수 있으나, 복원된 보기에는 같은 송풍기의 회전수 변경이 남아 있어 상사법칙을 적용한다.",
    },
    {
      auditId: "recall:2026-05-10:6",
      reviewedAt: "2026-07-28",
      resolution: "종단부 균열(크레이터 균열)",
      confidence: "medium",
      basis:
        "보기의 핵심 단서가 반복하중이 아니라 용접 끝부분이므로 피로균열보다 용접 종료부에 생기는 크레이터 균열이 직접 대응한다.",
      sourceLinks: [
        {
          title: "American Welding Society - What is Weld Cracking",
          url: "https://www.aws.org/magazines-and-media/inspection-trends/2024/may/it-may-24-feature-02-weld-cracks/",
        },
      ],
      reconstructedChoiceBoundary:
        "‘종단균열’은 복원 표현이므로 공개 설명에서는 AWS 용어인 크레이터 균열을 함께 쓴다.",
    },
    {
      auditId: "recall:2026-05-10:22",
      reviewedAt: "2026-07-28",
      resolution: "윤활유의 유막강도가 충분히 증가한다",
      confidence: "medium",
      basis:
        "‘그리스 부족’은 금속접촉을 늘려 손상 원인이 되므로 원인이 아닌 것으로 고를 수 없다. 기존 검증 문항 U-1207의 동등 판단 보기처럼 충분한 유막강도 증가는 마모를 억제하는 방향이다.",
      sourceLinks: [
        {
          title: "기존 검증 문항 U-1207의 원문 대조",
          url: "https://cbtbank.kr/exam/de20100905",
        },
      ],
      reconstructedChoiceBoundary:
        "원래 전체 보기가 남아 있지 않아, 복원 답을 폐기하고 기술적으로 성립하는 동등 보기로 교정한 답안이다.",
    },
    {
      auditId: "recall:2026-05-10:37",
      reviewedAt: "2026-07-28",
      resolution: "침투성이 좋다",
      confidence: "medium",
      basis:
        "남아 있는 복원 보기에서 침투성은 정답으로 표시되고 휘발성은 오답으로 표시되어 있다. 냉각 기여 가능성과 별개로 해당 복원 보기의 선택 답은 침투성으로 정리한다.",
      sourceLinks: [
        {
          title: "기존 검증 문항 U-107의 원문 대조",
          url: "https://www.comcbt.com/xe/webhaesul/9630928",
        },
      ],
      reconstructedChoiceBoundary:
        "냉각 기여 자체를 거짓으로 일반화하지 않고, 이 복원 문제에서 선택한 답만 기록한다.",
    },
  ];

export type PracticalRecallStudyGuide = {
  learningPoint: string;
  memoryTip: string;
  basis:
    | "answer_decision"
    | "existing_public_content"
    | "reference_visual";
};

export const PRACTICAL_RECALL_STUDY_GUIDES: Record<
  string,
  PracticalRecallStudyGuide
> = {
  "recall:2026-round2:m18-drawing": {
    learningPoint:
      "미터나사 도면은 호칭지름·피치와 기본 치수표를 연결한 뒤, 지시선이 지름인지 반지름인지 구분해 계산한다.",
    memoryTip:
      "M값은 호칭지름, × 뒤 숫자는 피치다. 보기 계산 전에는 ‘지름을 묻나, 반지름을 묻나’를 먼저 확인한다.",
    basis: "answer_decision",
  },
  "recall:2026-round2:blower-power": {
    learningPoint:
      "같은 송풍기와 같은 유체 조건에서는 풍량은 회전수, 압력은 회전수의 제곱, 동력은 회전수의 세제곱에 비례한다.",
    memoryTip: "팬 법칙은 ‘풍 1·압 2·동 3’으로 지수를 묶어 외운다.",
    basis: "answer_decision",
  },
  "recall:2026-round2:brake-lining": {
    learningPoint:
      "브레이크 라이닝 작업은 안전 확보, 분해, 마모·손상 점검, 제조사 기준에 따른 교환·조정, 작동 확인의 흐름으로 검토한다.",
    memoryTip:
      "사진 순서는 ‘안전–분해–점검–조정–확인’ 틀에 넣되, 실제 부품별 체결 순서는 원그림과 제조사 절차를 우선한다.",
    basis: "existing_public_content",
  },
  "recall:2026-round2:drip-lubrication": {
    learningPoint:
      "적하급유기는 저장부의 윤활유를 한 방울씩 떨어뜨리고 조절부로 급유량을 맞추는 방식이다.",
    memoryTip: "적하는 ‘한 방울씩 눈으로 확인하고 조절’한다고 기억한다.",
    basis: "reference_visual",
  },
  "recall:2026-05-10:1": {
    learningPoint:
      "용접의 성질은 국부 가열·용융·응고 과정과 그에 따른 변형·잔류응력·열영향부를 함께 구분한다.",
    memoryTip: "용접은 ‘녹여 붙이고, 식으면서 변형된다’는 원인과 결과로 기억한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:6": {
    learningPoint:
      "용접 균열 문제는 하중 종류만 보지 말고 균열이 시작된 위치와 용접 종료부 같은 공간 단서를 우선한다.",
    memoryTip:
      "균열 이름을 고를 때는 ‘언제’보다 ‘어디서 시작했나’를 먼저 표시한다.",
    basis: "answer_decision",
  },
  "recall:2026-05-10:9": {
    learningPoint:
      "비파괴검사는 표면 결함과 내부 결함, 결함 방향, 재료의 자성 여부에 따라 적합한 방법이 달라진다.",
    memoryTip: "표면은 PT·MT, 내부 깊이는 UT·RT를 먼저 떠올린 뒤 재료 조건으로 좁힌다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:10": {
    learningPoint:
      "유체 제어기호에서 사각형 안은 유로 상태를, 사각형 바깥에 붙은 기호는 버튼·레버 같은 조작 방식을 나타낸다.",
    memoryTip: "밸브 ‘안은 흐름, 밖은 조작’으로 먼저 나눠 읽는다.",
    basis: "reference_visual",
  },
  "recall:2026-05-10:11": {
    learningPoint:
      "점원은 크기가 매우 작아 한 점에서 모든 방향으로 에너지가 퍼지는 이상화된 발생원이다.",
    memoryTip: "점 0차원, 선 1차원, 면 2차원으로 차원을 올려가며 구분한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:12": {
    learningPoint:
      "지그는 공작물을 고정할 뿐 아니라 공구의 위치와 이동 방향까지 안내하는 장치다.",
    memoryTip: "지그는 ‘고정+안내’, 픽스처는 ‘고정 중심’으로 구분한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:13": {
    learningPoint:
      "예방보전은 고장이 나기 전에 점검·정비해 고장 가능성과 정지시간을 줄이는 활동이다.",
    memoryTip: "고장 전 PM, 고장 후 BM으로 시점을 대비한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:14": {
    learningPoint:
      "혐기성 접착제는 금속 부품 사이에서 공기가 차단될 때 경화되어 나사 풀림 방지와 밀봉에 쓰인다.",
    memoryTip: "혐기성은 ‘공기가 싫다’—금속 사이에 갇히면 굳는다고 기억한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:15": {
    learningPoint:
      "왕복동식 압축기는 비교적 고압·소유량, 원심식 압축기는 연속적인 대유량 운전에 적합한 특성이 있다.",
    memoryTip: "왕복은 ‘꾹꾹 고압’, 원심은 ‘빙빙 대량’으로 대비한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:16": {
    learningPoint:
      "공기는 압축되므로 공압 장치는 유압보다 정밀한 위치·속도 제어와 일정한 출력 유지에 불리할 수 있다.",
    memoryTip: "공압의 약점은 ‘공기가 눌린다’에서 정밀도 저하를 연결한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:17": {
    learningPoint:
      "커플링 윤활은 형식·회전수·하중·온도와 제작사 지정 윤활제를 함께 확인해야 한다.",
    memoryTip: "커플링 윤활은 부품 이름만 보고 고르지 말고 ‘형식–속도–하중–온도’를 확인한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:18": {
    learningPoint:
      "커플링 점검 공구는 면 흔들림, 축정렬, 간극 중 무엇을 측정하는지에 따라 달라진다.",
    memoryTip: "공구 이름보다 먼저 ‘면·축·틈 중 무엇을 재나’를 표시한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:19": {
    learningPoint:
      "그리스는 속도, 하중, 온도, 물·분진 같은 환경과 급유 방식을 함께 고려해 선정한다.",
    memoryTip: "그리스 선정은 ‘속·하·온·환경’ 네 조건으로 체크한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:20": {
    learningPoint:
      "NLGI 주도 번호는 그리스의 단단한 정도를 나타내며 숫자가 커질수록 더 단단해진다.",
    memoryTip: "NLGI 숫자 상승은 굳기 상승으로 같은 방향이라고 기억한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:21": {
    learningPoint:
      "설비 손상은 관찰된 마모 형태와 위치를 먼저 기록하고 하중·윤활·정렬·오염 원인을 역추적한다.",
    memoryTip: "진단 순서는 ‘흔적–위치–원인’으로 거꾸로 추적한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:22": {
    learningPoint:
      "기어 손상 원인은 윤활 부족처럼 유막을 약하게 만드는 조건과, 충분한 유막처럼 손상을 줄이는 조건을 반대로 구분한다.",
    memoryTip: "‘원인이 아닌 것’ 문제에서는 보호 방향인 보기를 먼저 찾는다.",
    basis: "answer_decision",
  },
  "recall:2026-05-10:33": {
    learningPoint:
      "유욕급유는 회전부 일부가 오일에 잠겨 회전하면서 윤활유를 퍼 올려 공급하는 방식이다.",
    memoryTip: "유욕은 글자 그대로 ‘기계 일부가 기름 목욕을 한다’고 기억한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:34": {
    learningPoint:
      "설비 경제성은 구입비만이 아니라 운전비·보전비·수명·잔존가치까지 같은 기준시점으로 환산해 비교한다.",
    memoryTip: "경제성은 ‘사고–쓰고–고치고–남긴다’의 전 수명비용으로 본다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:36": {
    learningPoint: "전하량의 SI 단위는 쿨롱이며 기호는 C로 쓴다.",
    memoryTip: "전하량 Q는 쿨롱 C, 전류 I는 암페어 A로 짝지어 구분한다.",
    basis: "existing_public_content",
  },
  "recall:2026-05-10:37": {
    learningPoint:
      "분무급유는 윤활유를 미세한 입자로 운반해 필요한 마찰면에 넓고 고르게 공급하는 방식이다.",
    memoryTip: "분무는 ‘잘게 나눠 멀리 퍼뜨린다’는 공급 모습을 떠올린다.",
    basis: "answer_decision",
  },
  "recall:2026-05-10:38": {
    learningPoint:
      "윤활유 내부 열화는 산화·열분해처럼 오일 자체가 변하는 현상이고, 외부 오염은 물·분진·마모분이 들어오는 현상이다.",
    memoryTip: "내부는 ‘기름이 변함’, 외부는 ‘다른 것이 들어옴’으로 분류한다.",
    basis: "existing_public_content",
  },
};

export type PracticalRecallReferenceVisual = {
  src: string;
  alt: string;
  caption: string;
  sourceTitle: string;
  sourceUrl: string;
  license: string;
  sha256: string;
  modificationNote: string | null;
  usageBoundary: string;
};

export const PRACTICAL_RECALL_REFERENCE_VISUALS: Record<
  string,
  PracticalRecallReferenceVisual
> = {
  "recall:2026-round2:m18-drawing": {
    src: "/practical/recall-reference/iso-metric-thread.svg",
    alt: "ISO 미터나사의 피치와 기본 치수를 설명하는 단면 도해",
    caption: "ISO 미터나사 기본 형상 학습용 도해",
    sourceTitle: "ISO-metric-thread.svg — Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:ISO-metric-thread.svg",
    license: "Public Domain",
    sha256:
      "B7E92A17DA2E2F105FDE9C13974C6CA16E513E4C38C9CB4108D27C4B96060FE8",
    modificationNote: null,
    usageBoundary:
      "M18×2.0의 개념 학습용 참고 도해이며 복원 문제의 A·B 지시선 원본은 아니다.",
  },
  "recall:2026-round2:sems-bolt": {
    src: "/practical/recall-reference/sems-captive-washer-reference.webp",
    alt: "나사와 빠지지 않는 와셔의 조립 구조를 보인 미국 특허 도면",
    caption: "포획 와셔형 나사 구조 학습용 특허 도면",
    sourceTitle: "US2672069A Screw and washer assembly",
    sourceUrl: "https://patents.google.com/patent/US2672069A/en",
    license: "미국 특허공보 원문 인용",
    sha256:
      "A6CAD43991F2B052B22555586D7D2F102E7E15B9392510EA732935157DC649B9",
    modificationNote: "원공보 도면에서 나사·와셔 조립 부분을 잘라 웹용으로 변환",
    usageBoundary:
      "SEMS와 같은 포획 와셔 구조를 이해하기 위한 참고 도면이며 실제 시험 제품 사진은 아니다.",
  },
  "recall:2026-round2:drip-lubrication": {
    src: "/practical/recall-reference/drip-oiler-section.svg",
    alt: "적하 급유기의 저장부와 조절부를 나타낸 단면 도해",
    caption: "적하 급유기 구조 학습용 단면 도해",
    sourceTitle: "Drip oiler-drawing.svg — Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Drip_oiler-drawing.svg",
    license: "MatthiasDD · CC BY 4.0",
    sha256:
      "A48DE75502F3B5114D5A1A533FB771005DAF28519190D2BC2F767FB41C0EE1C2",
    modificationNote: null,
    usageBoundary:
      "적하급유법의 구조 학습용 참고 이미지이며 복원 문제의 사진·선택지는 아니다.",
  },
  "recall:2026-05-10:10": {
    src: "/practical/recall-reference/manual-operation-symbol.svg",
    alt: "ISO 1219 계열의 수동 조작 유체 제어기호",
    caption: "수동 조작 기호 학습용 예시",
    sourceTitle:
      "Symbol Manual operation on Vent.svg — Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Symbol_Manual_operation_on_Vent.svg",
    license: "Public Domain",
    sha256:
      "0B63FF250EC67F4026BE0BE7E02086AC902226CFC7E9FD70D0F3521C27B776A7",
    modificationNote: null,
    usageBoundary:
      "수동 조작 기호의 한 예시이며 복원 문제에 제시된 원기호는 아니다.",
  },
};

export type PublicPracticalRecallRegistryEntry = {
  id: string;
  occurrenceLabel: string;
  questionLabel: string | null;
  topic: string;
  status:
    | "linked_existing"
    | "learning_verified"
    | "evidence_reviewed"
    | "answer_resolved"
    | "answer_conflict"
    | "asset_required";
  statusLabel: string;
  evidenceLabels: string[];
  sourceLinks: Array<{
    title: string;
    url: string;
    authorityLabel: string;
    supports: string | null;
  }>;
  limitation: string;
  learningPoint: string | null;
  memoryTip: string | null;
  referenceVisual: PracticalRecallReferenceVisual | null;
};

const reviewByAuditId = new Map(
  PRACTICAL_RECALL_EVIDENCE_REVIEWS.map((review) => [review.auditId, review]),
);
const answerDecisionByAuditId = new Map(
  PRACTICAL_RECALL_ANSWER_DECISIONS.map((decision) => [
    decision.auditId,
    decision,
  ]),
);

const evidenceAuthorityLabels: Record<
  PracticalRecallEvidenceSource["authority"],
  string
> = {
  public_ncs: "공식 NCS 학습모듈",
  official_law: "현행 법령",
  official_safety: "공식 안전자료",
  official_standard: "공식 기술기준",
  manufacturer: "제조사 기술자료",
  open_media_repository: "공개 미디어 저장소",
  technical: "전문 기술자료",
};

function registryStatus(item: PracticalQuestionRecallAuditItem) {
  if (item.classification === "answer_resolved_reconstructed") {
    return {
      status: "answer_resolved" as const,
      statusLabel: "정답 교정 완료",
      limitation:
        "복원 보기와 독립 근거를 대조해 답을 교정했습니다. 공식 원문 정답이 아니라 복원 조건에 한정한 판정입니다.",
    };
  }
  if (item.blockers.includes("held_answer_conflict")) {
    return {
      status: "answer_conflict" as const,
      statusLabel: "정답 충돌",
      limitation:
        "출제 이력은 복원 기출로 등록했지만 조건·정답이 충돌하여 하나의 정답으로 확정하지 않습니다.",
    };
  }
  const review = reviewByAuditId.get(item.id);
  if (review?.outcome === "learning_source_verified_prompt_missing") {
    return {
      status: "learning_verified" as const,
      statusLabel: "공식 근거 학습 승격",
      limitation: item.blockers.includes("held_asset_missing")
        ? "개념·구조 학습 근거와 외부 참고 이미지는 확인했습니다. 실제 시험 원사진과 전체 보기는 없으므로 사진형 정답 문제 공개만 보류합니다."
        : "독립된 법령·공식·전문 근거로 학습 내용을 승격했습니다. 복원 원문과 보기는 불완전하므로 공식 기출 원문으로 표시하지 않습니다.",
    };
  }
  if (item.blockers.includes("held_asset_missing")) {
    return {
      status: "asset_required" as const,
      statusLabel: "원그림 필요",
      limitation:
        "출제 이력은 복원 기출로 등록했지만 원그림·전체 보기가 없어 답안형 문제 공개는 보류합니다.",
    };
  }
  if (
    item.classification === "duplicate_no_add" ||
    item.classification === "adjacent_existing_hold"
  ) {
    return {
      status: "linked_existing" as const,
      statusLabel: "기존문항 연결",
      limitation:
        "같거나 인접한 공개 학습문항에 출제 이력만 연결하고 중복 문제 ID는 만들지 않습니다.",
    };
  }
  return {
    status: "evidence_reviewed" as const,
    statusLabel: "근거 검토 완료",
    limitation:
      "독립 근거로 학습 기준을 보강했지만 복원 원문과 보기는 불완전하므로 공식 원문으로 표시하지 않습니다.",
  };
}

export function getPublicPracticalRecallRegistry(): PublicPracticalRecallRegistryEntry[] {
  return PRACTICAL_QUESTION_RECALL_AUDIT.map((item) => {
    const review = reviewByAuditId.get(item.id);
    const answerDecision = answerDecisionByAuditId.get(item.id);
    const studyGuide = PRACTICAL_RECALL_STUDY_GUIDES[item.id];
    const status = registryStatus(item);
    const evidenceLabels = ["응시자 복원 기록"];

    if (item.relatedContentIds.length > 0) {
      evidenceLabels.push("기존 공개 학습문항 대조");
    }
    for (const source of review?.sources ?? []) {
      evidenceLabels.push(source.title);
    }
    if (answerDecision) {
      evidenceLabels.push("복원 보기 대조", "독립 근거로 정답 교정");
    }
    if (review && review.sources.length === 0) {
      evidenceLabels.push("보유 교재·공개자료 검색 완료");
    }

    return {
      id: item.id,
      occurrenceLabel:
        item.group === "may_10_2026"
          ? "2026년 5월 10일 복원"
          : "2026년 제2회 복원",
      questionLabel:
        item.id === "recall:2026-round2:m18-drawing"
          ? "필답 2번"
          : item.recallNumber === null
            ? null
            : `${item.recallNumber}번`,
      topic: item.topic,
      ...status,
      evidenceLabels,
      sourceLinks: [
        ...(review?.sources ?? []).map((source) => ({
          title: source.title,
          url: source.url,
          authorityLabel: evidenceAuthorityLabels[source.authority],
          supports: source.supports,
        })),
        ...(answerDecision?.sourceLinks ?? []).map((source) => ({
          ...source,
          authorityLabel: "독립 기술 근거",
          supports: null,
        })),
      ],
      learningPoint: review?.learningPoint ?? studyGuide?.learningPoint ?? null,
      memoryTip: review?.memoryTip ?? studyGuide?.memoryTip ?? null,
      referenceVisual: PRACTICAL_RECALL_REFERENCE_VISUALS[item.id] ?? null,
    };
  });
}
