import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import type { PracticalVisualAid } from "@/lib/domain/practical-types";
import type { Lesson } from "@/lib/domain/types";

export type WrittenSpecialDiagramId =
  | "abbe-principle"
  | "magneto-bearing-comparison"
  | "pintle-chain-construction"
  | "screw-load-brake"
  | "maintenance-strategy-map";

type KeywordVisualRule = {
  terms: string[];
  visualAidIds?: string[];
  diagramIds?: WrittenSpecialDiagramId[];
};

export type WrittenVisualSelection = {
  visualAids: PracticalVisualAid[];
  diagramIds: WrittenSpecialDiagramId[];
};

const VISUAL_AID_BY_ID = new Map(
  PRACTICAL_VISUAL_AIDS.map((visualAid) => [visualAid.id, visualAid] as const),
);

const KEYWORD_VISUAL_RULES: KeywordVisualRule[] = [
  {
    terms: ["마그네토", "마그네틱 볼베어링"],
    visualAidIds: ["ncs-bearing-types"],
    diagramIds: ["magneto-bearing-comparison"],
  },
  {
    terms: ["구름베어링 구성", "베어링 종류", "베어링 형식", "베어링 안지름"],
    visualAidIds: ["ncs-bearing-types", "diagram-bearing-components"],
  },
  {
    terms: ["구름베어링 손상", "베어링 손상", "베어링 결함"],
    visualAidIds: ["ncs-bearing-damage-identification"],
  },
  {
    terms: ["테이퍼 롤러베어링", "베어링 예압", "베어링 간극"],
    visualAidIds: [
      "ncs-tapered-bearing-assembly-sequence",
      "diagram-tapered-endplay",
    ],
  },
  {
    terms: ["베어링 열박음", "베어링 가열", "유도가열"],
    visualAidIds: [
      "ncs-bearing-heating",
      "diagram-bearing-induction-heating-sequence",
    ],
  },
  {
    terms: ["핀틀체인"],
    diagramIds: ["pintle-chain-construction"],
  },
  {
    terms: ["나사브레이크"],
    diagramIds: ["screw-load-brake"],
  },
  {
    terms: ["아베 원리", "아베의 원리"],
    diagramIds: ["abbe-principle"],
  },
  {
    terms: ["사후보전", "예방보전", "예지보전", "개량보전", "보전예방", "TBM", "CBM"],
    diagramIds: ["maintenance-strategy-map"],
  },
  {
    terms: ["어큐뮬레이터", "축압기"],
    visualAidIds: ["ncs-accumulator-safety-circuit"],
  },
  {
    terms: ["파스칼"],
    visualAidIds: ["diagram-pascal-force"],
  },
  {
    terms: ["복동실린더", "실린더 유효면적"],
    visualAidIds: ["diagram-double-acting-cylinder"],
  },
  {
    terms: ["광전스위치", "광전 센서", "광전센서"],
    visualAidIds: ["ncs-photoelectric-switch-example"],
  },
  {
    terms: ["근접센서", "근접 센서"],
    visualAidIds: [
      "ncs-proximity-sensor-installation-spacing",
      "diagram-sensor-directions",
    ],
  },
  {
    terms: ["버니어"],
    visualAidIds: ["ncs-vernier-measurement-sequence", "ncs-vernier-reading"],
  },
  {
    terms: ["마이크로미터"],
    visualAidIds: [
      "ncs-outside-micrometer-zero-adjustment-sequence",
      "diagram-micrometer-12-73",
    ],
  },
  {
    terms: ["다이얼 게이지", "다이얼게이지", "원통도"],
    visualAidIds: ["ncs-cylindricity-measurement-methods", "diagram-dial-vblock"],
  },
  {
    terms: ["하이트 게이지", "하이트게이지"],
    visualAidIds: ["ncs-height-gauge-up-down-measurement"],
  },
  {
    terms: ["게이지블록"],
    visualAidIds: [
      "ncs-gauge-block-thin-wringing-sequence",
      "ncs-gauge-block-thick-wringing-sequence",
    ],
  },
  {
    terms: ["축정렬", "축 정렬", "미스얼라인먼트"],
    visualAidIds: ["ncs-shaft-alignment-sequence", "diagram-shaft-misalignment-three"],
  },
  {
    terms: ["기어 손상", "기어 피팅", "기어 스폴링", "기어 스코어링"],
    visualAidIds: ["diagram-gear-damage"],
  },
  {
    terms: ["기어 커플링"],
    visualAidIds: ["ncs-gear-coupling-sequence"],
  },
  {
    terms: ["유니버설 조인트", "십자저널"],
    visualAidIds: ["ncs-universal-joint-overhaul-sequence"],
  },
  {
    terms: ["타이어 커플링"],
    visualAidIds: ["ncs-tire-coupling-assembly-sequence"],
  },
  {
    terms: ["그리드 커플링"],
    visualAidIds: ["ncs-grid-coupling-assembly-sequence"],
  },
  {
    terms: ["마그네틱 커플링", "자기 커플링"],
    visualAidIds: ["ncs-magnetic-coupling-assembly-sequence"],
  },
  {
    terms: ["브레이크 마찰재", "브레이크 라이닝", "브레이크 패드"],
    visualAidIds: ["ncs-brake-pad-lining-inspection"],
  },
  {
    terms: ["디스크브레이크", "드럼브레이크", "브레이크 보전"],
    visualAidIds: ["ncs-brake-condition-examples"],
  },
  {
    terms: ["용접결함", "용접 결함", "방사선투과", "RT 필름"],
    visualAidIds: ["ncs-rt-film-defect-identification"],
  },
  {
    terms: ["보수용접", "균열 보수", "균열보수"],
    visualAidIds: ["ncs-crack-repair-sequence", "ncs-air-arc-gouging-sequence"],
  },
  {
    terms: ["진동 측정방향", "수평 수직 축방향", "HVA"],
    visualAidIds: ["diagram-vibration-hva-directions"],
  },
  {
    terms: ["자주보전 7단계", "자주보전"],
    visualAidIds: ["diagram-autonomous-maintenance-7-steps"],
  },
  {
    terms: ["OEE", "6대 로스", "설비종합효율"],
    visualAidIds: ["diagram-oee-six-losses"],
  },
];

const GROUP_VISUAL_POOLS: Record<string, string[]> = {
  "s1-g01": ["diagram-pascal-force"],
  "s1-g02": ["ncs-accumulator-safety-circuit"],
  "s1-g03": ["ncs-accumulator-safety-circuit"],
  "s1-g04": ["diagram-double-acting-cylinder"],
  "s1-g05": ["diagram-double-acting-cylinder"],
  "s1-g06": ["diagram-double-acting-cylinder"],
  "s1-g07": ["diagram-sensor-directions"],
  "s1-g08": ["diagram-double-acting-cylinder"],
  "s1-g09": ["diagram-sensor-directions"],
  "s1-g10": [
    "ncs-photoelectric-switch-example",
    "ncs-proximity-sensor-installation-spacing",
    "diagram-sensor-directions",
  ],
  "s1-g11": ["diagram-sensor-directions"],
  "s1-g12": ["ncs-drive-unit-exploded-assembly-order"],
  "s2-g01": ["ncs-butt-welding-1g-sequence"],
  "s2-g02": [
    "ncs-butt-welding-1g-sequence",
    "ncs-butt-welding-2g-sequence",
    "ncs-butt-welding-3g-sequence",
    "ncs-butt-welding-4g-sequence",
  ],
  "s2-g03": ["ncs-air-arc-gouging-sequence"],
  "s2-g04": [
    "ncs-rt-film-defect-identification",
    "ncs-crack-repair-sequence",
  ],
  "s2-g05": ["ncs-butt-welding-1g-sequence"],
  "s3-g01": [
    "diagram-measurement-instruments",
    "diagram-measurement-tools",
    "ncs-cylinder-gauge-measurement-sequence",
    "ncs-sine-center-taper-measurement-sequence",
    "ncs-three-wire-holder-preparation-sequence",
    "ncs-dovetail-roller-measurement-sequence",
    "ncs-internal-taper-ball-measurement-sequence",
  ],
  "s3-g02": ["diagram-bearing-components"],
  "s3-g03": ["diagram-thread-profiles"],
  "s3-g04": [
    "ncs-gear-coupling-sequence",
    "ncs-universal-joint-overhaul-sequence",
    "ncs-tire-coupling-assembly-sequence",
    "ncs-grid-coupling-assembly-sequence",
    "ncs-magnetic-coupling-assembly-sequence",
    "diagram-shaft-misalignment",
  ],
  "s3-g05": [
    "ncs-bearing-four-types",
    "ncs-bearing-types",
    "ncs-bearing-heating",
    "ncs-bearing-damage-identification",
    "ncs-tapered-bearing-disassembly",
    "ncs-tapered-bearing-assembly-sequence",
    "ncs-bearing-puller-sequence",
    "ncs-bearing-press-assembly-sequence",
    "diagram-bearing-components",
    "diagram-spherical-roller-bearing",
    "diagram-bearing-four-exam",
    "diagram-tapered-endplay",
  ],
  "s3-g06": [
    "diagram-gear-damage",
    "diagram-gear-tooth-curves",
    "ncs-gearbox-disassembly-sequence",
  ],
  "s3-g07": [
    "ncs-drive-unit-exploded-assembly-order",
    "ncs-drive-unit-assembly-process-sequence",
  ],
  "s3-g08": ["diagram-maintenance-tools", "diagram-maintenance-tools-five"],
  "s3-g09": ["diagram-maintenance-tools"],
  "s3-g10": ["ncs-drive-unit-exploded-assembly-order"],
  "s3-g11": ["ncs-drive-unit-assembly-process-sequence"],
  "s3-g12": [
    "diagram-maintenance-tools",
    "ncs-drive-unit-assembly-process-sequence",
  ],
  "s4-g01": ["diagram-sensor-directions"],
  "s4-g02": ["diagram-vibration-hva-directions"],
  "s4-g03": ["diagram-vibration-hva-directions", "diagram-shaft-misalignment-three"],
  "s4-g04": ["diagram-sensor-directions"],
  "s4-g05": ["diagram-measurement-instruments"],
  "s4-g06": ["diagram-vibration-hva-directions"],
  "s4-g07": ["diagram-autonomous-maintenance-7-steps"],
  "s4-g08": ["diagram-oee-six-losses"],
  "s4-g09": [
    "diagram-autonomous-maintenance-7-steps",
    "diagram-oee-six-losses",
  ],
  "s4-g10": ["diagram-oee-six-losses"],
  "s4-g11": ["diagram-oee-six-losses"],
  "s4-g12": ["diagram-oee-six-losses"],
  "s4-g13": ["diagram-bearing-components"],
  "s4-g14": ["ncs-gear-coupling-sequence"],
  "s4-g15": ["ncs-gear-coupling-sequence"],
};

function resolveVisualAids(ids: string[]) {
  return ids
    .map((id) => VISUAL_AID_BY_ID.get(id))
    .filter(
      (visualAid): visualAid is PracticalVisualAid =>
        visualAid?.publicUseStatus === "public" &&
        visualAid.technicalReviewStatus === "verified",
    );
}

export function getWrittenVisualSelection(lesson: Lesson): WrittenVisualSelection {
  const searchable = [lesson.title, ...lesson.aliases].join(" ").toLocaleLowerCase("ko-KR");
  const matchedRules = KEYWORD_VISUAL_RULES.filter((rule) =>
    rule.terms.some((term) => searchable.includes(term.toLocaleLowerCase("ko-KR"))),
  );
  const matchedVisualAidIds = matchedRules.flatMap((rule) => rule.visualAidIds ?? []);
  const matchedDiagramIds = matchedRules.flatMap((rule) => rule.diagramIds ?? []);

  return {
    visualAids: resolveVisualAids(
      [...new Set(matchedVisualAidIds)].slice(0, 2),
    ),
    diagramIds: [...new Set(matchedDiagramIds)],
  };
}

export const WRITTEN_VISUAL_COVERED_GROUP_IDS = new Set(
  Object.keys(GROUP_VISUAL_POOLS),
);

export const WRITTEN_VISUAL_REGISTERED_AID_IDS = new Set(
  KEYWORD_VISUAL_RULES.flatMap((rule) => rule.visualAidIds ?? []),
);
