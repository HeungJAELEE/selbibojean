export type PracticalTestCenterMediaCategory =
  | "electrical_control"
  | "pneumatic"
  | "hydraulic"
  | "welding";

export type PracticalTestCenterMediaItem = {
  id: string;
  src: string;
  fullSrc?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  category: PracticalTestCenterMediaCategory;
  evidenceNote?: string;
};

export type PracticalTestCenterMediaGroup = {
  centerId: string;
  receivedAt: string;
  sourceLabel: string;
  sourceUrl?: string;
  summary: string;
  items: PracticalTestCenterMediaItem[];
};

const INCHON_CAFE_SOURCE =
  "https://cafe.naver.com/f-e/cafes/29094056/articles/14301?referrerAllArticles=true&inCafeSearch=true&query=%EC%9D%B8%EC%B2%9C%20%EC%8B%9C%ED%97%98%EC%9E%A5&page=2";

export const PRACTICAL_TEST_CENTER_MEDIA_GROUPS: PracticalTestCenterMediaGroup[] =
  [
    {
      centerId: "incheon-kopo-industry",
      receivedAt: "2026-07-28",
      sourceLabel: "사용자 제공 현장 사진",
      sourceUrl: INCHON_CAFE_SOURCE,
      summary:
        "산학협력관 실습대의 전기제어 모듈, 공압 밸브·센서 배치와 구형 다이얼식 KT-300AC 용접기를 확인할 수 있습니다.",
      items: [
        {
          id: "incheon-control-power-switch",
          src: "/practical/test-centers/incheon-kopo-industry/control-power-switch-modules.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 실습대의 직류 전원공급기와 스위치 모듈",
          caption: "직류 전원공급기·비상정지·스위치 모듈",
          category: "electrical_control",
        },
        {
          id: "incheon-relay-timer",
          src: "/practical/test-centers/incheon-kopo-industry/relay-timer-modules.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 실습대의 릴레이와 온딜레이 타이머 모듈",
          caption: "릴레이·온딜레이 타이머 모듈",
          category: "electrical_control",
        },
        {
          id: "incheon-valve-bank",
          src: "/practical/test-centers/incheon-kopo-industry/pneumatic-valve-bank-overview.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 공압 실습대의 밸브 뱅크 전경",
          caption: "공압 밸브 뱅크 전경",
          category: "pneumatic",
        },
        {
          id: "incheon-solenoid-valves",
          src: "/practical/test-centers/incheon-kopo-industry/solenoid-valves-closeup.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 공압 실습대의 솔레노이드 밸브 근접 사진",
          caption: "단동·복동 솔레노이드 밸브 배치",
          category: "pneumatic",
        },
        {
          id: "incheon-mechanical-valve-sensor",
          src: "/practical/test-centers/incheon-kopo-industry/mechanical-valve-and-sensor.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 공압 실습대의 기계식 밸브와 센서 모듈",
          caption: "기계식 밸브·센서 모듈",
          category: "pneumatic",
        },
        {
          id: "incheon-sensor-module",
          src: "/practical/test-centers/incheon-kopo-industry/sensor-module-closeup.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 실습대 센서 모듈의 근접 사진",
          caption: "센서 모듈과 단자 배치",
          category: "electrical_control",
        },
        {
          id: "incheon-valves-closeup-01",
          src: "/practical/test-centers/incheon-kopo-industry/pneumatic-valves-closeup-01.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 공압 실습대 밸브의 첫 번째 근접 사진",
          caption: "공압 밸브 포트·기호 근접 보기 1",
          category: "pneumatic",
        },
        {
          id: "incheon-valves-closeup-02",
          src: "/practical/test-centers/incheon-kopo-industry/pneumatic-valves-closeup-02.webp",
          width: 1800,
          height: 1013,
          alt: "인천캠퍼스 공압 실습대 밸브의 두 번째 근접 사진",
          caption: "공압 밸브 포트·기호 근접 보기 2",
          category: "pneumatic",
        },
        {
          id: "incheon-kt-300ac-welder",
          src: "/practical/test-centers/incheon-kopo-industry/kt-300ac-welder.webp",
          width: 1600,
          height: 1578,
          alt: "인천폴리텍 산학협력관의 KT-300AC 구형 다이얼식 교류 아크용접기 전면",
          caption: "KT-300AC 구형 다이얼식 교류 아크용접기",
          category: "welding",
          evidenceNote:
            "사용자 제공 사진에서 KT-300AC 명판, 전류 조절 다이얼과 디지털 A 표시창을 확인했습니다. 실제 출력 설정은 현장 감독관 안내와 시험편 상태를 기준으로 판단하세요.",
        },
      ],
    },
    {
      centerId: "jeonnam-suncheon-kopo",
      receivedAt: "2026-07-27",
      sourceLabel: "사용자 제공 현장 사진",
      summary:
        "유압·공압 실습대의 회로 구성 장면과 시설표에 적힌 CW-3M 용접기 전면을 확인할 수 있습니다.",
      items: [
        {
          id: "suncheon-hydraulic-bench-01",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/training-bench-overview-01.webp",
          width: 1026,
          height: 1800,
          alt: "순천캠퍼스 유압 실습대 장비 전경 첫 번째 사진",
          caption: "유압 실습대·호스·제어모듈 전경 1",
          category: "hydraulic",
        },
        {
          id: "suncheon-hydraulic-bench-02",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/training-bench-overview-02.webp",
          width: 1350,
          height: 1800,
          alt: "순천캠퍼스 유압 실습대 장비 전경 두 번째 사진",
          caption: "유압 실습대·액추에이터 전경 2",
          category: "hydraulic",
        },
        {
          id: "suncheon-hydraulic-bench-03",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/training-bench-overview-03.webp",
          width: 1026,
          height: 1800,
          alt: "순천캠퍼스 유압 실습대 장비 전경 세 번째 사진",
          caption: "유압 실습대·호스 연결 전경 3",
          category: "hydraulic",
        },
        {
          id: "suncheon-pneumatic-circuit-01",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/pneumatic-circuit-bench-01.webp",
          width: 1800,
          height: 1350,
          alt: "순천캠퍼스 공압 실습대의 튜브 연결 장면 첫 번째 사진",
          caption: "공압 회로 구성 장면 1",
          category: "pneumatic",
        },
        {
          id: "suncheon-pneumatic-circuit-02",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/pneumatic-circuit-bench-02.webp",
          width: 1800,
          height: 1350,
          alt: "순천캠퍼스 공압 실습대의 튜브 연결 장면 두 번째 사진",
          caption: "공압 회로 구성 장면 2",
          category: "pneumatic",
        },
        {
          id: "suncheon-pneumatic-circuit-03",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/pneumatic-circuit-bench-03.webp",
          width: 1800,
          height: 1350,
          alt: "순천캠퍼스 공압 실습대의 튜브 연결 장면 세 번째 사진",
          caption: "공압 회로 구성 장면 3",
          category: "pneumatic",
        },
        {
          id: "suncheon-cw-3m-welder",
          src: "/practical/test-centers/jeonnam-suncheon-kopo/cw-3m-welder-screen-detail.webp",
          fullSrc:
            "/practical/test-centers/jeonnam-suncheon-kopo/cw-3m-welder-screen-full.webp",
          width: 1080,
          height: 1498,
          alt: "순천캠퍼스 CW-3M 복합 용접기 전면",
          caption: "CW-3M 용접기 전면",
          category: "welding",
          evidenceNote:
            "사진에서 CW-3M 표기는 확인되지만 CW-CTA3M과의 동일 모델 여부는 명판 전체 확인 전까지 유력으로 유지합니다.",
        },
      ],
    },
    {
      centerId: "ulsan-kopo",
      receivedAt: "2026-07-27",
      sourceLabel: "사용자 제공 현장 사진",
      summary:
        "현장 사진에서는 KT-300AC 교류 아크용접기 표기가 확인됩니다.",
      items: [
        {
          id: "ulsan-kt-300ac-welder",
          src: "/practical/test-centers/ulsan-kopo/kt-300ac-welder-front.webp",
          width: 1800,
          height: 1549,
          alt: "울산캠퍼스 KT-300AC 교류 아크용접기 전면",
          caption: "KT-300AC 교류 아크용접기 전면",
          category: "welding",
          evidenceNote:
            "공식 시설표의 CW-WA300E 표기와 사진의 KT-300AC 표기가 다릅니다. 장비 교체·복수 장비·촬영시점 차이 가능성이 있어 두 근거를 분리해 표시합니다.",
        },
      ],
    },
  ];

export const practicalTestCenterMediaByCenter = new Map(
  PRACTICAL_TEST_CENTER_MEDIA_GROUPS.map((group) => [group.centerId, group]),
);
