export type PracticalRepairWeldingVideo = {
  id: string;
  label: string;
  sourceTitle: string;
  channel: string;
  videoId: string;
  sourceUrl: string;
  learningFocus: string;
  caution: string;
  relatedLessons: readonly {
    id: string;
    title: string;
  }[];
};

export const practicalRepairWeldingVideos = [
  {
    id: "hole-filling",
    label: "홀 메우기",
    sourceTitle: "쇳물로 구멍 가득 메우는 방법",
    channel: "알마공방 DIY",
    videoId: "jgTCtTlQjro",
    sourceUrl: "https://www.youtube.com/shorts/jgTCtTlQjro",
    learningFocus:
      "국부 손상부를 메우는 과정에서 용융지와 비드 형상이 어떻게 변하는지 관찰합니다.",
    caution:
      "실제 보수용접은 결함을 덮어 메우는 작업이 아닙니다. 결함 원인·범위 확인, 승인된 제거 방법, 제거면 재검사와 WPS 조건을 먼저 적용합니다.",
    relatedLessons: [
      { id: "PCON-044", title: "용접결함과 제거·재용접" },
      { id: "PCON-046", title: "보수용접 표준흐름" },
    ],
  },
  {
    id: "circumference-tack",
    label: "온둘레 가접",
    sourceTitle: "플랜지용접 가접방법",
    channel: "에듀강닷컴TV",
    videoId: "5ae44u6P9sE",
    sourceUrl: "https://youtu.be/5ae44u6P9sE?si=Fhtqkv_TRnUbDJgy",
    learningFocus:
      "본용접 전에 가접으로 위치·간격·변형을 관리하는 동작을 관찰합니다.",
    caution:
      "가접 위치·길이·용접조건은 이음 형상과 WPS에 따라 달라집니다. 영상의 수치나 설정을 시험·현장 조건으로 그대로 옮기지 않습니다.",
    relatedLessons: [
      { id: "PCON-SUP-016", title: "용접절차서(WPS)와 작업조건" },
      { id: "PCON-SUP-020", title: "맞대기 이음부 홈·개선 형상" },
    ],
  },
  {
    id: "circumference-straight",
    label: "온둘레 스트레이트",
    sourceTitle: "플랜지용접(스트레이트/E4313)",
    channel: "에듀강닷컴TV",
    videoId: "V06hKuKermc",
    sourceUrl: "https://www.youtube.com/watch?v=V06hKuKermc",
    learningFocus:
      "직선 운봉에서 아크길이·이동속도·비드 폭을 함께 관찰하는 보조 영상입니다.",
    caution:
      "용접봉 종류와 전류·전압·극성·자세는 모재와 WPS에 따라 정합니다. 비드 외관만 보고 용입이나 품질을 단정하지 않습니다.",
    relatedLessons: [
      { id: "PCON-SUP-021", title: "아크길이·비드 형성·용접봉 운용" },
      { id: "PCON-SUP-018", title: "용접 입열" },
    ],
  },
  {
    id: "circumference-weaving",
    label: "온둘레 위빙",
    sourceTitle: "플랜지용접(위빙/E4313)",
    channel: "에듀강닷컴TV",
    videoId: "VwtceMYlGOo",
    sourceUrl: "https://www.youtube.com/watch?v=VwtceMYlGOo",
    learningFocus:
      "위빙 운봉의 폭·겹침과 패스 사이 관리가 비드 형상에 미치는 모습을 관찰합니다.",
    caution:
      "위빙 폭과 체류시간을 임의로 크게 하면 과도한 입열·처짐·결함 위험이 생길 수 있습니다. 실제 조건은 WPS와 작업표준을 우선합니다.",
    relatedLessons: [
      { id: "PCON-SUP-021", title: "아크길이·비드 형성·용접봉 운용" },
      { id: "PCON-SUP-042", title: "다층용접·패스간 청소·층간관리" },
    ],
  },
  {
    id: "full-repair-welding",
    label: "전체 실습",
    sourceTitle: "설비보전기사 보수용접 및 누수시험 실습",
    channel: "충남산업기술교육원",
    videoId: "z6oQEGsvl10",
    sourceUrl: "https://www.youtube.com/watch?v=z6oQEGsvl10",
    learningFocus:
      "보수용접과 누수시험의 작업 흐름을 전체적으로 복습하기 위한 보조 영상입니다.",
    caution:
      "이 영상은 공식 공개과제나 NCS 원문을 대체하지 않습니다. 시험의 지급재료·세부 순서·안전 조건은 해당 회차의 Q-Net 공개문제, 작업지시와 적용 WPS를 우선합니다.",
    relatedLessons: [
      { id: "PCON-043", title: "용접안전" },
      { id: "PCON-045", title: "비파괴검사와 최종검사" },
      { id: "PCON-046", title: "보수용접 표준흐름" },
    ],
  },
  {
    id: "industrial-engineer-task-3-drawing-1",
    label: "설비보전산업기사 3과제 용접 · 1번 도면",
    sourceTitle: "2026년 설비보전산업기사 실기 3과제 용접 시연 영상 (1번도면)",
    channel: "동루미늄",
    videoId: "9xxk6SPZ0yI",
    sourceUrl: "https://www.youtube.com/watch?v=9xxk6SPZ0yI",
    learningFocus:
      "설비보전산업기사 실기 3과제의 1번 도면을 기준으로 용접 시연의 전체 순서와 작업 동작을 관찰합니다.",
    caution:
      "설비보전산업기사용 외부 보조 영상입니다. 설비보전기사와 과제 조건이 다를 수 있으므로 응시 종목의 Q-Net 공개문제, 지급재료, 작업지시와 적용 WPS를 최종 기준으로 확인합니다.",
    relatedLessons: [
      { id: "PCON-SUP-016", title: "용접절차서(WPS)와 작업조건" },
      { id: "PCON-043", title: "용접안전" },
      { id: "PCON-046", title: "보수용접 표준흐름" },
    ],
  },
] as const satisfies readonly PracticalRepairWeldingVideo[];

export function getYouTubeNoCookieEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}
