export const CBT_EXAM_TRACKS = [
  {
    key: "facility-maintenance-engineer-current",
    title: "설비보전기사(신)",
    titleAliases: ["설비보전기사"],
  },
  {
    key: "facility-maintenance-engineer-legacy",
    title: "설비보전기사(구)",
    titleAliases: ["설비보전기사"],
  },
  {
    key: "facility-maintenance-industrial-current",
    title: "설비보전산업기사(신)",
    titleAliases: ["설비보전산업기사"],
  },
  {
    key: "mechanical-maintenance-industrial-legacy",
    title: "기계정비산업기사·설비보전산업기사(구)",
    titleAliases: ["기계정비산업기사", "설비보전산업기사"],
  },
  {
    key: "welding-engineer",
    title: "용접기사",
    titleAliases: ["용접기사"],
  },
  {
    key: "welding-industrial-engineer",
    title: "용접산업기사",
    titleAliases: ["용접산업기사"],
  },
  {
    key: "welding-craftsman",
    title: "용접기능사",
    titleAliases: ["용접기능사"],
  },
] as const;

export type CbtExamTrackKey = (typeof CBT_EXAM_TRACKS)[number]["key"];

export const cbtExamTracksByKey = new Map(
  CBT_EXAM_TRACKS.map((track) => [track.key, track]),
);

export function matchCbtExamTrackByPageTitle(pageTitle: string) {
  const normalizedTitle = pageTitle.normalize("NFC").replace(/\s+/g, "");
  const matches = CBT_EXAM_TRACKS.filter((track) =>
    track.titleAliases.some((alias) =>
      normalizedTitle.includes(alias.replace(/\s+/g, "")),
    ),
  );

  return matches.length === 1 ? matches[0] : null;
}
