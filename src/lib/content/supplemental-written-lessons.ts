import type { Lesson, LessonBlock, LessonBlockKind } from "@/lib/domain/types";

export type SupplementalWrittenLesson = Lesson & {
  contentRole: "supplemental";
  visualAidId?: string;
};

type SupplementalLessonSeed = {
  slug: string;
  subjectId: `subject-${1 | 2 | 3 | 4}`;
  conceptGroupId: string;
  title: string;
  aliases: string[];
  summary: [string, string, string];
  visualAidId?: string;
  definition: string;
  principle: string;
  formula: string;
  comparison: string;
  examPoint: string;
  trap: string;
  sources: Array<{ label: string; url: string }>;
};

const REVIEWED_AT = "2026-07-23T00:00:00.000Z";

const seeds: SupplementalLessonSeed[] = [
  {
    slug: "bleed-off-synchronization",
    subjectId: "subject-1",
    conceptGroupId: "s1-g05",
    title: "블리드오프 회로와 복수 실린더 동기회로",
    aliases: ["블리드오프", "바이패스 유량제어", "동기회로", "유량분배"],
    visualAidId: "hydraulic-bleed-sync",
    summary: [
      "블리드오프 회로는 펌프 토출유량 일부를 탱크로 우회시켜 액추에이터 유량을 조절한다.",
      "복수 실린더 동기는 단순 병렬연결만으로 보장되지 않으며 유량분배기·기계적 결합·위치 피드백 같은 보정수단이 필요하다.",
      "시험에서는 속도제어 위치, 부하 변화의 영향, 에너지 손실 경로를 함께 판단한다.",
    ],
    definition:
      "블리드오프 회로는 주 관로에서 일부 유량을 탱크로 빼내 액추에이터에 도달하는 유량을 줄이는 속도제어 회로다. 동기회로는 두 개 이상의 액추에이터가 요구된 위치·속도 관계를 유지하도록 유량 또는 위치를 맞추는 회로다.",
    principle:
      "블리드오프에서는 조정된 우회유량이 커질수록 액추에이터로 가는 유량이 줄어든다. 복수 실린더는 마찰, 누설, 부하 차이 때문에 병렬배관만으로 행정이 일치하지 않으므로 유량분배·기계연결·센서 피드백 중 하나 이상으로 오차를 보정한다.",
    formula:
      "이상적인 정상상태에서 `Q_p = Q_a + Q_b`, `v = Q_a/A`로 본다. `Q_p`는 펌프유량, `Q_a`는 액추에이터 유량, `Q_b`는 탱크로 우회하는 유량이다. 실제 회로에서는 누설과 밸브 압력강하를 추가로 고려한다.",
    comparison:
      "미터인·미터아웃은 액추에이터 입구 또는 출구 유량을 직접 조절한다. 블리드오프는 남는 유량을 탱크로 우회하므로 회로 구성과 부하특성에 따라 발열·효율·속도안정성이 달라진다. 동기회로의 정확도는 개방루프 유량분배보다 위치센서를 사용하는 폐루프가 일반적으로 높다.",
    examPoint:
      "회로도에서 유량조절밸브가 주 관로와 탱크 사이의 우회로에 있으면 블리드오프를 먼저 의심한다. 복수 실린더 문제에서는 ‘같은 압력’과 ‘같은 속도’를 같은 뜻으로 보지 않는다.",
    trap:
      "병렬 실린더에 같은 압력이 걸린다고 유량과 행정이 자동으로 같아지는 것은 아니다. 회로별 허용압력·오염도·유량범위는 실제 부품 자료를 확인해야 하며 보강 레슨의 개념식만으로 선정하지 않는다.",
    sources: [
      {
        label: "Bosch Rexroth Academy — Hydraulic circuits and control types",
        url: "https://academy.boschrexroth.com/en_gb/mobile-hydraulics-hydraulic-circuits-and-control-types.html",
      },
    ],
  },
  {
    slug: "load-cell",
    subjectId: "subject-1",
    conceptGroupId: "s1-g10",
    title: "로드셀의 구조와 힘 측정",
    aliases: ["load cell", "스트레인게이지 로드셀", "휘트스톤 브리지", "하중센서"],
    visualAidId: "load-cell-bridge",
    summary: [
      "로드셀은 힘 또는 하중을 전기신호로 바꾸는 변환기다.",
      "스트레인게이지식은 탄성체의 미세변형을 저항변화로 바꾸고 브리지 회로로 읽는다.",
      "정격하중뿐 아니라 하중방향, 편심, 온도, 과부하, 설치강성을 함께 확인한다.",
    ],
    definition:
      "로드셀은 작용하는 힘에 의해 생긴 탄성체 변형을 측정 가능한 전기신호로 변환하는 센서다. 압축형, 인장·압축형, 굽힘보형, 전단보형 등은 힘을 탄성체에 전달하는 구조가 다르다.",
    principle:
      "탄성체에 부착된 스트레인게이지의 길이와 단면이 변하면 전기저항이 달라진다. 여러 게이지를 휘트스톤 브리지로 구성하면 작은 저항변화를 차동 전압으로 검출하면서 공통 온도영향을 줄일 수 있다.",
    formula:
      "게이지의 기본관계는 `GF = (ΔR/R)/ε`다. `GF`는 게이지율, `ΔR/R`은 상대저항변화, `ε`는 변형률이다. 실제 하중 환산에는 로드셀 정격출력과 계측증폭기의 교정값을 사용한다.",
    comparison:
      "스트레인게이지식은 정적·동적 힘 측정에 널리 쓰이고, 압전식은 빠른 동적변화에 유리하지만 정적 측정에는 별도 조건이 따른다. 압축형과 인장형은 힘의 방향과 하중도입 구조가 다르다.",
    examPoint:
      "‘하중 → 탄성체 변형 → 게이지 저항변화 → 브리지 출력’ 순서를 기억한다. 로드셀은 변위센서가 아니라 힘을 전기신호로 바꾸는 변환기라는 점이 핵심이다.",
    trap:
      "정격용량만 맞으면 된다고 보지 않는다. 편심하중·측력방향·설치면·케이블 차폐·온도범위는 오차와 파손을 좌우하며 최종 선정은 해당 모델 데이터시트를 따른다.",
    sources: [
      {
        label: "HBK — The Working Principle of a Compression Load Cell",
        url: "https://www.hbkworld.com/en/knowledge/resource-center/articles/the-working-principle-of-a-compression-load-cell",
      },
      {
        label: "HBK — Piezoelectric or Strain Gauge Based Force Transducers?",
        url: "https://www.hbkworld.com/en/knowledge/resource-center/articles/piezoelectric-or-strain-gauge-based-force-transducers",
      },
    ],
  },
  {
    slug: "sensor-selection",
    subjectId: "subject-1",
    conceptGroupId: "s1-g10",
    title: "산업용 센서 선정 기준",
    aliases: ["sensor selection", "검출거리", "응답속도", "반복정밀도", "보호등급"],
    summary: [
      "센서는 먼저 검출대상과 필요한 측정량을 정한 뒤 원리를 선택한다.",
      "거리·속도·정밀도뿐 아니라 온도, 분진, 수분, 진동, 배선방식과 출력형식을 함께 검토한다.",
      "시험에서는 유도형·광전형·초음파형·접촉식의 검출대상과 환경 차이를 묻는다.",
    ],
    definition:
      "센서 선정은 검출대상, 측정범위, 응답속도, 반복정밀도, 설치환경, 출력·전원 조건을 요구사항으로 바꾸고 적합한 검출원리와 모델을 고르는 과정이다.",
    principle:
      "유도형 근접센서는 금속 검출, 광전센서는 광량변화, 초음파센서는 음파 왕복시간, 접촉식 변위센서는 물리적 접촉변위를 이용한다. 같은 대상이라도 표면상태와 주변환경이 바뀌면 적합한 원리가 달라질 수 있다.",
    formula:
      "왕복시간식 거리측정의 기본은 `d = ct/2`다. `c`는 매질에서의 전파속도, `t`는 왕복시간이다. 실제 센서는 온도보정·사각영역·응답주기와 제조사 지정범위를 적용한다.",
    comparison:
      "비접촉식은 마모와 대상물 힘의 영향을 줄일 수 있지만 반사율·재질·주변물체 영향을 받는다. 접촉식은 기준면을 직접 따라갈 수 있으나 접촉력·마모·측정속도를 고려해야 한다.",
    examPoint:
      "대상 재질 → 검출거리 → 응답속도 → 설치환경 → 출력형식 순으로 좁히면 보기 판단이 쉽다. PNP/NPN과 NO/NC는 검출원리와 별개의 출력·접점 조건이다.",
    trap:
      "‘비접촉이면 항상 더 정확하다’ 또는 ‘검출거리만 길면 좋다’는 식의 단정은 틀리다. 정확한 보호등급·배선·온도범위는 모델별 공식 매뉴얼을 확인한다.",
    sources: [
      {
        label: "KEYENCE — Sensor Basic Guide",
        url: "https://www.keyence.com/landing/sensor/en_sensor_16-01-05.jsp",
      },
      {
        label: "KEYENCE — Sensor Basics Technical Guides",
        url: "https://www.keyence.com/ss/products/sensor/sensorbasics/spreq/download/",
      },
    ],
  },
  {
    slug: "welding-joints-symbols-heat-input",
    subjectId: "subject-2",
    conceptGroupId: "s2-g01",
    title: "용접이음·기호와 용접입열",
    aliases: ["맞대기이음", "필릿이음", "용접기호", "heat input", "용접입열"],
    visualAidId: "welding-joint-heat-input",
    summary: [
      "이음 형상은 하중전달, 접근성, 루트부 형성, 검사 가능성을 함께 고려해 선택한다.",
      "용접기호는 기준선·화살표·기본기호·치수·꼬리부 정보를 조합해 요구사항을 전달한다.",
      "입열은 전압·전류가 커질수록 증가하고 용접속도가 빨라질수록 감소한다.",
    ],
    definition:
      "용접이음은 맞대기·겹치기·T·모서리·가장자리 이음처럼 부재 배치로 구분한다. 용접기호는 이음부에서 요구하는 용접 종류, 위치, 치수와 보충정보를 도면에 표시하는 약속이다.",
    principle:
      "이음 설계와 개선형상은 용입, 수축변형, 작업자 접근, 용접량에 영향을 준다. 입열은 아크가 단위 용접길이에 전달한 에너지의 지표이며 냉각속도와 열영향부 거동을 판단할 때 사용한다.",
    formula:
      "일반적인 아크용접의 단위길이 입열은 `H = ηVI/v`로 표현한다. 단위 환산을 포함하면 식의 상수는 사용하는 단위계에 따라 달라진다. `η`는 열효율, `V`는 전압, `I`는 전류, `v`는 용접속도다.",
    comparison:
      "맞대기이음은 같은 평면의 부재를 연결하고, 필릿용접은 겹치기·T이음 등에서 삼각형에 가까운 단면을 형성한다. 기호의 화살표 쪽과 반대쪽 표시는 표준 체계에 따라 읽어야 하며 임의로 좌우를 바꾸지 않는다.",
    examPoint:
      "입열의 증감관계 `V↑, I↑ → H↑`, `v↑ → H↓`를 우선 판단한다. 기호 문제는 기본기호와 화살표 쪽/반대쪽을 분리해서 읽는다.",
    trap:
      "입열이 크면 항상 용접품질이 좋아지는 것은 아니다. 실제 허용 입열·예열·층간온도는 적용 코드, WPS와 재료조건을 따른다.",
    sources: [
      {
        label: "Lincoln Electric — D1.8 Seismic Supplement Welding Manual",
        url: "https://ch-delivery.lincolnelectric.com/api/public/content/d1b1987c68d043bab385296102443ceb",
      },
    ],
  },
  {
    slug: "wps-pqr-pwht",
    subjectId: "subject-2",
    conceptGroupId: "s2-g01",
    title: "WPS·PQR·PWHT의 역할",
    aliases: ["WPS", "PQR", "PWHT", "용접절차서", "용접후열처리"],
    summary: [
      "WPS는 현장에서 따라야 할 용접조건을 규정하는 작업문서다.",
      "PQR은 시험용접과 시험결과로 절차의 성립 근거를 기록한다.",
      "PWHT는 적용 코드·재료·두께 조건에 따라 실시하는 용접후열처리이며 모든 용접부에 자동 적용되지 않는다.",
    ],
    definition:
      "WPS(Welding Procedure Specification)는 승인된 용접변수와 작업조건을 정리한 절차서다. PQR(Procedure Qualification Record)은 해당 절차를 입증한 시험조건과 결과의 기록이다. PWHT(Post Weld Heat Treatment)는 용접 후 정해진 열이력을 부여하는 공정이다.",
    principle:
      "절차 인정 체계에서는 시험용접과 시험결과가 허용한 범위 안에서 WPS를 작성·운용한다. PWHT의 목적과 필요 여부는 재료, 두께, 구속, 사용환경과 적용 규정에 따라 달라진다.",
    formula:
      "이 레슨은 문서관계가 핵심이며 단일 보편식으로 판정하지 않는다. 입열·예열·층간온도·PWHT 온도와 유지시간은 적용 코드와 승인된 WPS/PQR의 변수로 확인한다.",
    comparison:
      "WPS는 ‘어떻게 용접할 것인가’, PQR은 ‘그 절차가 시험으로 어떻게 입증되었는가’를 답한다. PWHT는 문서가 아니라 실제 열처리 공정이며 WPS/PQR에 관련 변수가 기록될 수 있다.",
    examPoint:
      "WPS와 PQR을 작업지시서와 시험근거로 구분한다. ‘PQR을 보고 작업자가 직접 용접한다’ 또는 ‘PWHT는 모든 용접에서 필수’라는 문장은 경계한다.",
    trap:
      "코드마다 필수변수와 인정범위가 다르다. 시험 대비 정의를 특정 규격의 세부 수치로 일반화하지 말고 현장에서는 적용 코드의 최신 판과 승인 문서를 우선한다.",
    sources: [
      {
        label: "TWI — Weld Procedure and Welder",
        url: "https://www.twi-global.com/pdfs/pdfs-public/06-glenn-allen2-twi.pdf",
      },
      {
        label: "Lincoln Electric — ASME IX Heat Input Guidance",
        url: "https://ch-delivery.lincolnelectric.com/api/public/content/16193e81eadf469f8a6c1181448f3481",
      },
    ],
  },
  {
    slug: "resistance-gas-special-welding",
    subjectId: "subject-2",
    conceptGroupId: "s2-g03",
    title: "저항·가스·특수용접의 구분",
    aliases: ["저항용접", "가스용접", "테르밋용접", "플라즈마용접", "레이저용접"],
    summary: [
      "저항용접은 전류가 접합부에서 만드는 저항열과 가압을 이용한다.",
      "가스용접은 연료가스와 산소의 연소열로 모재·용가재를 가열한다.",
      "특수용접은 에너지원과 보호방식이 다르므로 장비 이름보다 결합 원리를 기준으로 분류한다.",
    ],
    definition:
      "저항용접은 접촉부에 큰 전류를 흘려 발생하는 저항열과 전극 가압으로 접합하는 공정군이다. 가스용접은 연소불꽃을 열원으로 사용한다. 테르밋·플라즈마·레이저·전자빔 등은 서로 다른 열원과 적용환경을 갖는 특수공정이다.",
    principle:
      "저항발열은 전류, 저항, 통전시간의 영향을 받는다. 가스용접은 불꽃의 화학적 성질과 열분포가 중요하다. 고에너지밀도 공정은 열원을 좁게 집중할 수 있지만 장비·차폐·안전조건이 달라진다.",
    formula:
      "저항발열의 기본관계는 `Q = I²Rt`다. `I`는 전류, `R`은 전류경로의 저항, `t`는 통전시간이다. 실제 용접품질은 전극력, 접촉상태, 재료와 열손실도 함께 좌우한다.",
    comparison:
      "점용접은 겹친 판재에 국부 용접점을 만들고, 심용접은 회전전극으로 연속 또는 중첩 용접점을 만든다. 테르밋은 화학반응열, 플라즈마·레이저·전자빔은 고에너지밀도 열원을 사용한다.",
    examPoint:
      "저항용접의 3요소를 전류·통전시간·전극가압력으로 묶어 기억한다. 테르밋은 알루미늄과 금속산화물 반응, 레이저·전자빔은 고에너지밀도 공정으로 구분한다.",
    trap:
      "가스용접과 가스절단을 같은 작업원리로 묶지 않는다. 세부 가스압력·장비설정·허용재료는 시험용 일반론이 아니라 공정절차와 제조사 지침을 따라야 한다.",
    sources: [
      {
        label: "TWI — Welding and Joining Process Knowledge",
        url: "https://www.twi-global.com/technical-knowledge/job-knowledge",
      },
    ],
  },
  {
    slug: "welding-defects-ndt",
    subjectId: "subject-2",
    conceptGroupId: "s2-g04",
    title: "용접결함과 비파괴검사 선택",
    aliases: ["NDT", "비파괴검사", "PT", "MT", "UT", "RT", "용접결함"],
    visualAidId: "welding-ndt-map",
    summary: [
      "결함은 위치·형상·발생원인을 나눠 보아야 대책과 검사법을 연결할 수 있다.",
      "표면개구 결함, 강자성체의 표면·근표면 결함, 내부 체적·평면 결함은 적합한 검사법이 다르다.",
      "검사법 하나가 모든 결함을 완전하게 찾는다고 단정하지 않는다.",
    ],
    definition:
      "용접결함은 균열, 기공, 슬래그혼입, 융합불량, 용입부족, 언더컷 등 요구품질을 저해하는 불연속이다. 비파괴검사는 시험체의 사용성을 훼손하지 않고 표면 또는 내부 불연속을 찾는 검사군이다.",
    principle:
      "PT는 표면에 열린 불연속으로 침투한 액체를 현상해 표시한다. MT는 강자성체의 자속누설을 이용한다. UT는 초음파 반사를, RT는 투과방사선의 감쇠차이를 이용한다. VT는 모든 검사 전후의 기본적인 외관확인에 쓰인다.",
    formula:
      "초음파 펄스의 왕복시간으로 깊이를 추정할 때 기본관계는 `d = ct/2`다. 실제 판정은 탐촉자, 굴절각, 교정, 표면상태와 적용 규격을 포함한다.",
    comparison:
      "PT는 비다공성 재료의 표면개구 결함에 유리하지만 내부결함은 찾지 못한다. MT는 강자성체에 제한된다. UT와 RT는 내부검사에 쓰이나 결함방향, 형상, 두께와 접근조건에 따른 검출특성이 다르다.",
    examPoint:
      "‘표면에 열림 → PT’, ‘강자성체 표면·근표면 → MT’, ‘내부 평면성 결함 → UT 검토’, ‘내부 체적성 결함 → RT 검토’처럼 1차 매칭하되 최종 판정조건을 확인한다.",
    trap:
      "검사법 이름만으로 합격·불합격을 정하지 않는다. 적용 표준의 교정·감도·합격기준이 필요하며 안전·자격요건이 있는 검사는 승인된 절차로 수행한다.",
    sources: [
      {
        label: "TWI — Non-destructive Testing Technical Knowledge",
        url: "https://www.twi-global.com/technical-knowledge/faqs/what-is-non-destructive-testing",
      },
    ],
  },
  {
    slug: "orthographic-section-views",
    subjectId: "subject-3",
    conceptGroupId: "s3-g01",
    title: "투상도와 단면도의 판독",
    aliases: ["정투상", "제1각법", "제3각법", "단면도", "절단면"],
    summary: [
      "정투상은 서로 직각인 투상면에 물체의 형상을 나타낸다.",
      "단면도는 내부형상을 명확히 보이기 위해 절단을 가정하고 절단면과 뒤쪽 형상을 표현한다.",
      "제1각법·제3각법은 배치규칙이 다르므로 기호와 도면 배치를 먼저 확인한다.",
    ],
    definition:
      "투상도는 3차원 물체를 정해진 투상법으로 2차원 도면에 나타낸 것이다. 단면도는 물체를 가상의 절단면으로 자른 뒤 내부형상을 표시하는 도법이다.",
    principle:
      "정투상에서는 정면도·평면도·측면도가 같은 점의 위치관계를 공유한다. 단면에서는 절단된 재료면을 해칭으로 구분하고, 절단되지 않은 빈 공간과 뒤쪽 윤곽은 도면 규칙에 따라 표현한다.",
    formula:
      "수치계산보다 투상면 대응이 핵심이다. 같은 점을 각 뷰로 투영할 때 높이·폭·깊이 중 공통되는 치수를 추적한다.",
    comparison:
      "제1각법과 제3각법은 물체·투상면·관찰자의 상대관계와 뷰 배치가 다르다. 전단면·반단면·부분단면은 내부를 드러내는 범위가 다르다.",
    examPoint:
      "투상법 기호를 먼저 확인하고 정면도를 기준으로 다른 뷰의 위치를 읽는다. 단면도에서 해칭선과 윤곽선, 중심선을 혼동하지 않는다.",
    trap:
      "도면 표준의 세부 선종류·해칭규칙을 임의로 기억해 적용하지 않는다. 실제 문서에서는 도면에 명시된 표준과 최신 적용규칙을 우선한다.",
    sources: [
      {
        label: "ISO 128-3:2022 — Views, sections and cuts",
        url: "https://www.iso.org/standard/83356.html",
      },
    ],
  },
  {
    slug: "cutting-tools-life-safety",
    subjectId: "subject-3",
    conceptGroupId: "s3-g08",
    title: "공구재료·공구수명과 가공안전",
    aliases: ["공구재료", "공구수명", "Taylor 식", "선반안전", "연삭안전"],
    summary: [
      "공구재료는 경도·고온경도·인성·내마모성의 균형으로 선택한다.",
      "절삭속도가 높아질수록 일반적으로 공구수명은 짧아진다.",
      "회전체·칩·숫돌·공작물 고정 위험은 가공조건과 별개로 먼저 통제한다.",
    ],
    definition:
      "공구수명은 절삭공구가 정해진 마모한계 또는 가공품질 한계에 도달할 때까지 사용할 수 있는 시간이나 가공량이다. 공구재료는 고속도강, 초경합금, 세라믹, CBN, 다이아몬드계 등으로 구분한다.",
    principle:
      "절삭열·마찰·충격과 공구-피삭재 화학적 상호작용이 마모를 진행시킨다. 공구재료는 고온에서 경도를 유지해야 하지만 취성이 너무 크면 단속절삭과 충격에 불리할 수 있다.",
    formula:
      "Taylor의 기본 공구수명식은 `VT^n = C`다. `V`는 절삭속도, `T`는 공구수명, `n`과 `C`는 공구·피삭재·조건에 따른 상수다. 시험에서는 속도와 수명의 반대 경향을 우선 판단한다.",
    comparison:
      "고속도강은 인성과 재연삭성이 좋고, 초경합금은 높은 절삭속도와 내마모성에 유리하다. 세라믹·CBN·다이아몬드계는 대상재료와 충격조건에 따라 적용성이 크게 달라진다.",
    examPoint:
      "절삭속도, 이송, 절삭깊이 중 공구수명에 가장 민감한 변수가 무엇인지 묻는 문제를 Taylor 식과 연결한다. 가공 중 측정·칩 제거·공구교환 전에 회전정지를 확인한다.",
    trap:
      "가공조건을 높이면 생산성이 항상 좋아진다는 문장은 공구마모·열·표면품질을 빠뜨린다. 숫돌 간극 같은 세부 안전수치는 적용 법규와 장비 매뉴얼을 확인한다.",
    sources: [
      {
        label: "OSHA — Machine Guarding Additional References",
        url: "https://www.osha.gov/etools/machine-guarding/additional-references/",
      },
      {
        label: "OSHA — Hand and Power Tools",
        url: "https://www.osha.gov/Publications/osha3080.pdf",
      },
    ],
  },
  {
    slug: "stress-strain-fe-c-tests",
    subjectId: "subject-3",
    conceptGroupId: "s3-g02",
    title: "응력–변형률·Fe-C 상태도와 재료시험",
    aliases: ["응력-변형률선도", "Hooke 법칙", "Fe-C", "인장시험", "경도시험", "충격시험"],
    visualAidId: "stress-strain-material-test",
    summary: [
      "응력–변형률선도는 탄성, 항복, 소성변형, 인장강도와 파단의 흐름을 보여준다.",
      "Fe-C 상태도는 탄소량과 온도에 따른 평형조직 변화를 읽는 지도이며 열처리 선도와 목적이 다르다.",
      "인장·경도·충격·피로시험은 서로 다른 재료거동을 평가한다.",
    ],
    definition:
      "공칭응력은 원단면적으로 나눈 하중, 공칭변형률은 원표점거리 대비 길이변화다. Fe-C 상태도는 철-탄소계의 온도·조성에 따른 상과 조직영역을 나타낸다. 재료시험은 강도·경도·인성·피로특성 등을 정해진 방법으로 평가한다.",
    principle:
      "탄성영역에서는 하중을 제거하면 원상태로 돌아가고, 항복 이후에는 영구변형이 남는다. 상태도는 평형 또는 준평형 변화를 설명하며 실제 냉각속도와 합금원소가 조직에 영향을 준다.",
    formula:
      "공칭응력 `σ = F/A₀`, 공칭변형률 `ε = ΔL/L₀`, 선형탄성영역에서 `σ = Eε`를 사용한다. 단위와 원단면적·원표점거리의 기준을 먼저 확인한다.",
    comparison:
      "인장시험은 항복·인장강도·연신율 등을, 경도시험은 압입 또는 반발저항을, 충격시험은 빠른 하중에서 흡수에너지를 평가한다. 피로시험은 반복응력에 따른 수명을 다룬다.",
    examPoint:
      "응력–변형률선도에서 탄성계수는 초기 직선부 기울기다. 상태도 문제는 탄소량과 온도 축을 먼저 확인하고 재료시험은 측정하려는 성질과 연결한다.",
    trap:
      "Fe-C 상태도만으로 실제 용접 열영향부의 모든 조직을 확정하지 않는다. 시험편 형상·시험속도·온도와 적용 시험표준에 따라 결과가 달라질 수 있다.",
    sources: [
      {
        label: "ASTM E8/E8M — 금속재료 인장시험",
        url: "https://store.astm.org/standards/e8",
      },
      {
        label: "ASM International — Iron-Carbon Phase Diagrams",
        url: "https://dl.asminternational.org/handbooks/edited-volume/9/chapter-abstract/114159/Iron-Carbon-Phase-Diagrams",
      },
    ],
  },
  {
    slug: "wire-rope",
    subjectId: "subject-3",
    conceptGroupId: "s3-g07",
    title: "와이어로프 구조·손상과 점검",
    aliases: ["wire rope", "소선", "스트랜드", "심강", "킹크", "버드케이지"],
    summary: [
      "와이어로프는 소선, 스트랜드, 심강으로 구성되고 꼬임과 심강 형식에 따라 특성이 달라진다.",
      "굽힘피로, 마모, 부식, 압궤, 킹크, 버드케이지와 열손상을 점검한다.",
      "폐기기준은 사용설비·로프형식·적용 법규와 제조사 기준을 확인해야 한다.",
    ],
    definition:
      "와이어로프는 여러 소선을 꼬아 스트랜드를 만들고, 여러 스트랜드를 심강 둘레에 꼬아 만든 유연한 인장요소다. 사용목적에 따라 유연성, 회전저항성, 내마모성과 강도를 조합한다.",
    principle:
      "드럼과 시브를 지날 때 반복굽힘과 접촉압력이 발생하고, 윤활상태·시브직경·장력·정렬·환경이 수명에 영향을 준다. 국부변형은 내부 손상을 동반할 수 있어 단순 외관복원으로 사용을 계속하지 않는다.",
    formula:
      "시험에서는 안전율의 개념을 `설계 또는 파단 관련 강도 / 사용하중`의 비로 이해한다. 구체적인 계수와 폐기 소선수는 적용설비와 기준이 다르므로 하나의 숫자로 일반화하지 않는다.",
    comparison:
      "섬유심은 유연성과 윤활유 저장에 유리할 수 있고 강심은 강도·내열·압궤저항에 유리할 수 있다. 보통꼬임과 랭꼬임은 소선과 스트랜드의 꼬임방향 관계 및 마모·회전성향이 다르다.",
    examPoint:
      "소선 → 스트랜드 → 로프 구조를 순서대로 기억한다. 킹크·압궤·버드케이지·심강돌출·열손상·부식을 사용 전 점검 항목으로 연결한다.",
    trap:
      "로프 외경만 같다고 호환되는 것은 아니다. 시험의 과거 수치가 모든 설비에 공통인 폐기기준은 아니며 제조사 정격과 현행 적용기준을 우선한다.",
    sources: [
      {
        label: "OSHA — Wire Rope Inspection",
        url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1413",
      },
      {
        label: "OSHA — Working Safely with Wire Rope",
        url: "https://www.osha.gov/sites/default/files/publications/SHIB011917.pdf",
      },
    ],
  },
  {
    slug: "assembly-trial-run",
    subjectId: "subject-3",
    conceptGroupId: "s3-g12",
    title: "기계 조립 기준과 시운전 절차",
    aliases: ["조립검사", "시운전", "축정렬", "체결관리", "무부하시운전"],
    summary: [
      "조립은 세척·식별·치수확인·정렬·체결·윤활·기록의 흐름으로 관리한다.",
      "시운전은 안전조건을 확인한 뒤 무부하에서 시작해 단계적으로 부하를 올린다.",
      "진동·온도·압력·전류·누설·소음의 기준값과 추세를 함께 기록한다.",
    ],
    definition:
      "조립기준은 부품의 방향, 간극, 끼워맞춤, 체결, 정렬, 윤활과 청정도 요구사항을 명확히 한 작업기준이다. 시운전은 조립한 설비가 요구기능과 안전조건을 만족하는지 단계적으로 확인하는 과정이다.",
    principle:
      "조립오류는 초기에 발열·진동·누설·과전류로 나타날 수 있다. 기준상태를 확보하고 무부하·저부하·정상부하로 범위를 넓히면 위험을 제한하면서 이상원인을 추적하기 쉽다.",
    formula:
      "단일 공통식보다 허용공차와 제조사 기준값의 대조가 핵심이다. 회전체에서는 회전속도, 진동, 베어링온도, 전동기전류를 같은 시간축으로 기록해 기준상태와 비교한다.",
    comparison:
      "정적 조립검사는 치수·체결·정렬·간섭을 확인하고, 동적 시운전은 운전 중 진동·온도·전류·압력과 기능을 확인한다. 둘 중 하나만으로 검수를 끝내지 않는다.",
    examPoint:
      "‘에너지 격리와 작업완료 확인 → 수동회전·간섭 확인 → 윤활·보호장치 확인 → 무부하 → 단계적 부하 → 기록·인계’의 큰 순서를 기억한다.",
    trap:
      "시험에 나온 경험값을 모든 설비의 합격기준으로 사용하지 않는다. 실제 체결토크·정렬공차·온도·진동한계는 도면, 제조사 매뉴얼과 승인된 시운전 절차를 따른다.",
    sources: [
      {
        label: "OSHA — Industrial Robot Systems and Automated Machinery Safety",
        url: "https://www.osha.gov/otm/section-4-safety-hazards/chapter-4",
      },
    ],
  },
  {
    slug: "lubrication-point-quantity-interval",
    subjectId: "subject-4",
    conceptGroupId: "s4-g15",
    title: "윤활개소·급유량·급유주기 결정",
    aliases: ["급유개소", "급유량", "재윤활주기", "relubrication", "윤활카드"],
    visualAidId: "lubrication-management-loop",
    summary: [
      "윤활관리는 알맞은 윤활제를 알맞은 개소에 알맞은 양과 주기로 공급하고 결과를 기록하는 활동이다.",
      "급유량과 주기는 베어링 형식·크기·속도·온도·하중·오염·밀봉·운전시간의 영향을 받는다.",
      "과소급유뿐 아니라 과다급유도 교반손실·온도상승·밀봉손상을 일으킬 수 있다.",
    ],
    definition:
      "윤활개소는 마찰면이나 윤활제가 공급되어야 하는 지점을 뜻한다. 급유량은 한 번 또는 단위시간에 공급하는 양, 급유주기는 재급유 사이의 시간 또는 운전간격이다.",
    principle:
      "윤활제는 마찰·마모를 줄이고 열과 오염물의 거동에 영향을 준다. 운전조건이 가혹하거나 오염유입이 크면 점검·재윤활 주기를 단축할 수 있지만, 무조건 많이 넣으면 내부교반과 압력이 증가할 수 있다.",
    formula:
      "급유량·주기는 장치와 제조사 계산법에 따라 결정한다. 시험에서는 ‘개소 식별 → 윤활제 선정 → 기준량·주기 설정 → 상태확인 → 기록·보정’의 관리순서를 우선 이해한다.",
    comparison:
      "오일윤활은 순환·냉각·여과에 유리할 수 있고 그리스윤활은 밀봉성과 간편한 간헐급유에 유리할 수 있다. 중앙집중식은 다수 개소를 관리하기 쉽지만 배관막힘과 분배상태 확인이 필요하다.",
    examPoint:
      "‘적정유종·적정량·적정개소·적정시기’의 취지를 개별 조건과 연결한다. 온도상승이 보이면 윤활부족뿐 아니라 과다급유·점도·정렬·하중도 함께 본다.",
    trap:
      "급유주기와 양을 설비종류 하나만으로 고정하지 않는다. 실제 값은 베어링·장치 제조사의 계산도구와 운전자료를 우선한다.",
    sources: [
      {
        label: "SKF — Bearing Maintenance Handbook",
        url: "https://www.skf.com/binaries/pub12/Images/0901d1968013be94-SKF-bearing-maintenance-handbook---10001_1-EN%281%29_tcm_12-463040.pdf",
      },
      {
        label: "SKF DialSet — Grease Quantity and Relubrication",
        url: "https://dialset.skf.com/dialsetting/",
      },
    ],
  },
  {
    slug: "tpm-eight-pillars",
    subjectId: "subject-4",
    conceptGroupId: "s4-g09",
    title: "TPM 8대 기둥과 역할 분담",
    aliases: ["TPM 8 pillars", "개별개선", "자주보전", "계획보전", "품질보전"],
    summary: [
      "TPM은 생산시스템의 손실을 줄이기 위해 전 부문·전원이 참여하는 관리체계다.",
      "8대 기둥은 개별개선, 자주보전, 계획보전, 품질보전, 교육훈련, 안전·보건·환경, 초기관리, 사무간접 부문 개선으로 정리한다.",
      "기둥은 독립 캠페인이 아니라 공통 목표와 지표 아래 서로 연결된다.",
    ],
    definition:
      "TPM(Total Productive Maintenance)은 설비와 생산시스템의 전 수명주기를 대상으로 손실을 예방하고 효율을 높이기 위해 전 부문이 참여하는 활동체계다.",
    principle:
      "개별개선은 손실 원인을 줄이고, 자주보전은 운전부문의 기본조건 유지능력을 키우며, 계획보전은 보전전략과 주기를 체계화한다. 나머지 기둥은 품질, 역량, 안전환경, 초기단계 설계, 지원업무 손실을 각각 다룬다.",
    formula:
      "TPM 성과지표의 대표 예는 `OEE = 시간가동률 × 성능가동률 × 양품률`이다. 기둥 수 자체보다 손실분석과 KPI·활동지표의 연결이 중요하다.",
    comparison:
      "자주보전은 ‘운전원이 모든 전문정비를 대신한다’는 뜻이 아니며 기본조건 유지와 이상 조기발견에 초점을 둔다. 계획보전은 전문보전의 예방·예지·개량 활동을 체계화한다.",
    examPoint:
      "8개 명칭을 암기한 뒤 각 기둥의 담당 손실과 산출물을 연결한다. 안전·보건·환경은 별도 기둥이면서 다른 모든 활동의 선행조건이다.",
    trap:
      "TPM을 보전부서만의 활동이나 단순 5S로 축소하지 않는다. 조직에 따라 명칭과 전개방식은 달라질 수 있으므로 시험에서는 공통 역할을 판단한다.",
    sources: [
      {
        label: "JIPM — TPM",
        url: "https://www.jipm.or.jp/business/tpm/",
      },
      {
        label: "JIPM — TPM Award Self-check List (8 pillars)",
        url: "https://www.jipm.or.jp/up_file/1688429825-581143.pdf",
      },
    ],
  },
];

function block(
  lessonId: string,
  kind: LessonBlockKind,
  title: string,
  body: string,
  order: number,
): LessonBlock {
  return { id: `${lessonId}-${kind}-${order}`, kind, title, body, order };
}

function sourceMarkdown(sources: SupplementalLessonSeed["sources"]) {
  return sources.map((source) => `- [${source.label}](${source.url})`).join("\n");
}

function makeLesson(seed: SupplementalLessonSeed): SupplementalWrittenLesson {
  const id = `supplemental-written-${seed.slug}`;
  return {
    id,
    subjectId: seed.subjectId,
    conceptGroupId: seed.conceptGroupId,
    conceptId: `supplemental-concept-${seed.slug}`,
    title: seed.title,
    aliases: seed.aliases,
    summary: seed.summary,
    blocks: [
      block(id, "definition", "정의", seed.definition, 1),
      block(id, "principle", "원리", seed.principle, 2),
      block(id, "formula", "공식·조건", seed.formula, 3),
      block(id, "selection", "비교", seed.comparison, 4),
      block(id, "exam_point", "시험 포인트", seed.examPoint, 5),
      block(id, "trap", "오답 함정", seed.trap, 6),
      block(id, "source", "출처", sourceMarkdown(seed.sources), 7),
    ],
    relatedQuestionIds: [],
    coverageStatus: "covered",
    contentStatus: "published",
    sourceNeeded: false,
    reviewedAt: REVIEWED_AT,
    publication: { readiness: "ready", blockers: [] },
    quality: {
      tier: "standard",
      substantiveCharacters: [
        ...seed.summary,
        seed.definition,
        seed.principle,
        seed.formula,
        seed.comparison,
        seed.examPoint,
        seed.trap,
      ].join("").length,
      genericPhraseMatches: [],
      languageIssueMatches: [],
      sourceLinked: true,
      passed: true,
    },
    contentRole: "supplemental",
    ...(seed.visualAidId ? { visualAidId: seed.visualAidId } : {}),
  };
}

export const supplementalWrittenLessons = seeds.map(makeLesson);

export const supplementalWrittenLessonIds = new Set(
  supplementalWrittenLessons.map((lesson) => lesson.id),
);
