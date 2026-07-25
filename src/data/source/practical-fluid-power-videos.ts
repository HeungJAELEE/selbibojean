export type PracticalFluidPowerVideo = {
  id: string;
  label: string;
  sourceTitle: string;
  channel: string;
  sourceUrl: string;
  accessLabel: "무료 공개 영상" | "외부 유료강의";
  embed:
    | {
        type: "video";
        videoId: string;
      }
    | {
        type: "playlist";
        playlistId: string;
      };
  learningFocus: string;
  caution: string;
  relatedLessons: readonly {
    id: string;
    title: string;
  }[];
};

export type PracticalFluidPowerVideoGroup = {
  id: string;
  title: string;
  description: string;
  videos: readonly PracticalFluidPowerVideo[];
};

const circuitLessons = [
  { id: "PCON-042", title: "방향제어밸브" },
  { id: "PCON-SUP-038", title: "공압 시퀀스 제어·변위-단계선도" },
] as const;

const pneumaticLessons = [
  { id: "PCON-SUP-004", title: "공압 유량제어와 미터인·미터아웃" },
  { id: "PCON-SUP-005", title: "공압 시퀀스·타이머·카운터" },
  { id: "PCON-SUP-038", title: "공압 시퀀스 제어·변위-단계선도" },
] as const;

const hydraulicLessons = [
  { id: "PCON-SUP-006", title: "유압 동력원과 저장탱크" },
  { id: "PCON-SUP-007", title: "압력제어밸브" },
  { id: "PCON-SUP-010", title: "유압 시퀀스·카운터밸런스회로" },
] as const;

const pneumaticIds = [
  "5dAqJzIHIGk",
  "inQKGsNqByU",
  "AGUy_VSexmQ",
  "GYovrINAkTI",
  "RoArZU8fqu4",
  "jcTmaxJ4Z2Q",
  "R6tg6T9Hbhw",
  "ojo_L6jPuVA",
] as const;

const hydraulicVideos = [
  ["U1n_JPx_RjM", "2025년도 설비보전기사 실기 유압1번 문제풀이"],
  ["Rzg61pHH7HI", "2025년도 설비보전기사 실기 유압2번 문제풀이"],
  ["djo3jp76avA", "2025년도 설비보전기사 실기 유압3번 문제풀이"],
  ["qw0PN6hrRbk", "2025년도 설비보전기사 실기 유압4번 문제풀이"],
  ["GkNmScDyzug", "2025년도 설비보전기사 실기 유압5번 문제풀이"],
  ["YffbkIbFPQA", "2025년도 설비보전기사 실기 유압6번 문제풀이"],
  ["0ceJp3FJs-U", "2025년도 설비보전기사 실기 유압7번 문제풀이"],
  ["HWk32oJHY84", "2025년도 설비보전기사 실기 유압8번 문제풀이"],
] as const;

const industrialEngineerVideos = [
  [
    "SvBD-bm_gXM",
    "유압 5",
    "Equipment Maintenance Engineer_Hydraulic Operation 5",
  ],
  ["egTqSbdtEpE", "유압 3", "설비보전산업기사_유압 3번 작업"],
  ["Owi9GODjsCs", "유압 2", "설비보전산업기사_유압 2번 작업"],
  [
    "g0zatKxCQak",
    "유압 1",
    "Equipment Maintenance Engineer_Hydraulic Operation 1",
  ],
  ["vFfCQ6lH85s", "공압 5", "설비보전산업기사_공기압 5번 작업"],
  [
    "4eO2o2tDtjI",
    "공압 3",
    "Industrial Engineer - Facility Maintenance_Pneumatics Task 3",
  ],
  ["ykBH2ab2V6Y", "공압 2", "설비보전산업기사_공기압 2번 작업"],
  ["9Mw7pHW2xvs", "공압 1", "설비보전산업기사_공기압 1번 작업"],
] as const;

export const practicalFluidPowerVideoGroups: readonly PracticalFluidPowerVideoGroup[] = [
  {
    id: "circuit-memorization",
    title: "공유압 도면 암기",
    description:
      "회로 기호를 외우는 데서 끝내지 않고, 입력·밸브·액추에이터의 연결과 작동순서를 함께 확인합니다.",
    videos: [
      {
        id: "circuit-strategy",
        label: "공유압 회로도 단순암기법",
        sourceTitle: "설비보전기사 실기 합격전략 및 회로도 단순암기법",
        channel: "설비마스터",
        sourceUrl: "https://www.youtube.com/watch?v=LY9NF_d7O1o",
        accessLabel: "무료 공개 영상",
        embed: { type: "video", videoId: "LY9NF_d7O1o" },
        learningFocus:
          "공압·유압 회로의 공통 골격과 기호를 묶어서 기억하는 방법을 관찰합니다.",
        caution:
          "암기법은 보조수단입니다. 실제 답안과 배선·배관은 해당 형의 Q-Net 공개문제, NCS 기호와 작동조건을 우선합니다.",
        relatedLessons: circuitLessons,
      },
      {
        id: "pneumatic-one-sheet",
        label: "공압 회로도 한 장 정리",
        sourceTitle: "설비보전기사 2025년 공압회로도 수정 한장출력",
        channel: "다솔변샘",
        sourceUrl: "https://www.youtube.com/watch?v=-_ggKyxn7_0",
        accessLabel: "무료 공개 영상",
        embed: { type: "video", videoId: "-_ggKyxn7_0" },
        learningFocus:
          "공압 1~8형 회로에서 반복되는 밸브·실린더·신호선을 한 장에서 비교합니다.",
        caution:
          "영상의 한 장 도식은 학습용 정리입니다. 시험에서는 배포된 공개문제의 형별 회로와 요구동작을 다시 확인하세요.",
        relatedLessons: pneumaticLessons,
      },
      {
        id: "hydraulic-one-sheet",
        label: "유압 회로도 한 장 정리",
        sourceTitle: "2025년 유압회로도 수정 한장출력",
        channel: "다솔변샘",
        sourceUrl: "https://www.youtube.com/watch?v=sov67LtLYeY",
        accessLabel: "무료 공개 영상",
        embed: { type: "video", videoId: "sov67LtLYeY" },
        learningFocus:
          "유압 1~8형에 반복되는 동력원·압력제어·방향제어·액추에이터 연결을 비교합니다.",
        caution:
          "회로 압력과 밸브 설정은 형별 조건에 따라 달라집니다. 영상의 설정값을 다른 형에 그대로 적용하지 마세요.",
        relatedLessons: hydraulicLessons,
      },
    ],
  },
  {
    id: "pneumatic-1-to-8",
    title: "공압 공개문제 1~8형",
    description:
      "각 형의 회로 구성, 기본동작, 신호 흐름과 유지보수 판단 지점을 순서대로 확인합니다.",
    videos: pneumaticIds.map((videoId, index) => ({
      id: `pneumatic-${index + 1}`,
      label: `공압 ${index + 1}번`,
      sourceTitle: `2025년도 설비보전기사 실기 공압${index + 1}번 문제풀이`,
      channel: "달라자격증",
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      accessLabel: "무료 공개 영상" as const,
      embed: { type: "video" as const, videoId },
      learningFocus: `공압 ${index + 1}번 회로의 구성요소, 실린더 작동순서와 점검 지점을 관찰합니다.`,
      caution:
        "영상은 외부 풀이입니다. 실제 조립·배관·조정 순서는 해당 연도의 Q-Net 공개문제와 시험장 지시를 우선합니다.",
      relatedLessons: pneumaticLessons,
    })),
  },
  {
    id: "hydraulic-1-to-8",
    title: "유압 공개문제 1~8형",
    description:
      "사용자가 제공한 재생목록의 8개 영상을 형별로 분리해 바로 선택할 수 있게 정리했습니다.",
    videos: hydraulicVideos.map(([videoId, sourceTitle], index) => ({
      id: `hydraulic-${index + 1}`,
      label: `유압 ${index + 1}번`,
      sourceTitle,
      channel: "달라자격증",
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}&list=PL4WXICmAwRJCOpIm815ryv8APgtvppOFb&index=${index + 1}`,
      accessLabel: "무료 공개 영상" as const,
      embed: { type: "video" as const, videoId },
      learningFocus: `유압 ${index + 1}번 회로의 압력·방향·유량 제어와 액추에이터 작동순서를 관찰합니다.`,
      caution:
        "유압은 잔압과 낙하 위험이 있습니다. 실제 작업 전 무압 확인과 안전조치를 시행하고 형별 설정조건을 따르세요.",
      relatedLessons: hydraulicLessons,
    })),
  },
  {
    id: "industrial-engineer-busan",
    title: "설비보전산업기사 작업형 · [부산공고 설비와 동일]",
    description:
      "외부 보조 학습자료입니다. 윤교수의 공유압실 재생목록에 공개된 설비보전산업기사 작업 영상을 부산공고와 동일한 설비 기준으로 유압 5·3·2·1, 공압 5·3·2·1 순서로 정리했습니다.",
    videos: industrialEngineerVideos.map(
      ([videoId, exerciseLabel, sourceTitle], index) => {
        const isHydraulic = exerciseLabel.startsWith("유압");

        return {
          id: `industrial-engineer-${isHydraulic ? "hydraulic" : "pneumatic"}-${exerciseLabel.split(" ")[1]}`,
          label: `산업기사 ${exerciseLabel}`,
          sourceTitle,
          channel: "윤교수의 공유압실",
          sourceUrl: `https://www.youtube.com/watch?v=${videoId}&list=PLiXN5YZgvh-EWfFwP0rWWgRigufoKjuK8&index=${index + 1}`,
          accessLabel: "무료 공개 영상" as const,
          embed: { type: "video" as const, videoId },
          learningFocus: isHydraulic
            ? `설비보전산업기사 ${exerciseLabel} 작업에서 유압 회로 구성, 압력·방향·유량 제어와 액추에이터 동작 순서를 관찰합니다.`
            : `설비보전산업기사 ${exerciseLabel} 작업에서 공압 회로 구성, 신호 흐름, 실린더 작동 순서와 조정 지점을 관찰합니다.`,
          caution:
            "이 영상은 설비보전산업기사 및 부산공고와 동일한 설비의 작업 이해를 위한 보조자료입니다. 설비보전기사 공개문제와 형식·지급부품·요구동작이 다를 수 있으므로 기사 시험에 그대로 대입하지 말고, 응시 종목의 Q-Net 공개문제를 최종 기준으로 확인하세요.",
          relatedLessons: isHydraulic ? hydraulicLessons : pneumaticLessons,
        };
      },
    ),
  },
  {
    id: "paid-course",
    title: "외부 유료강의",
    description:
      "추가 설명이 필요한 학습자를 위한 외부 강의 재생목록입니다. 결제·수강조건은 제공자 페이지에서 확인합니다.",
    videos: [
      {
        id: "paid-v-amt-course",
        label: "2026 설비보전기사 공개문제 풀이",
        sourceTitle: "공압·유압 기본동작 및 유지보수 강의 재생목록",
        channel: "허책임의 책임 있는 강의",
        sourceUrl:
          "https://www.youtube.com/watch?v=Z0Bm5Xqdcyo&list=PL2xmFQlX28AE_MZt3okK0k9fCvwGZ1EvT",
        accessLabel: "외부 유료강의",
        embed: {
          type: "playlist",
          playlistId: "PL2xmFQlX28AE_MZt3okK0k9fCvwGZ1EvT",
        },
        learningFocus:
          "공압·유압 공개문제의 기본동작과 유지보수 과정을 재생목록 순서로 학습합니다.",
        caution:
          "본 사이트와 무관한 외부 제공 강의입니다. 가격·공개범위·수강기간은 변경될 수 있으며 공식 Q-Net·NCS 자료를 대체하지 않습니다.",
        relatedLessons: [...pneumaticLessons, ...hydraulicLessons],
      },
    ],
  },
] as const;

export function getFluidPowerYouTubeEmbedUrl(
  embed: PracticalFluidPowerVideo["embed"],
) {
  if (embed.type === "playlist") {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${embed.playlistId}&rel=0`;
  }

  return `https://www.youtube-nocookie.com/embed/${embed.videoId}?rel=0`;
}
