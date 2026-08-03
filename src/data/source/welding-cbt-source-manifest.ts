import type { WeldingCbtTrackManifest } from "@/lib/content/welding-cbt-parser";

export const WELDING_CBT_TRACK_MANIFESTS: WeldingCbtTrackManifest[] = [
  {
    key: "welding-craftsman",
    title: "용접기능사",
    categoryUrl:
      "https://cbtbank.kr/category/%EC%9A%A9%EC%A0%91%EA%B8%B0%EB%8A%A5%EC%82%AC",
    examPathPrefix: "jr",
    includeAllSubjects: true,
    includeSubjectTitles: [
      /아크용접/i,
      /용접재료/i,
      /기계제도|도면해독/i,
      /가스절단|기타\s*용접|용접안전/i,
    ],
  },
  {
    key: "welding-industrial-engineer",
    title: "용접산업기사",
    categoryUrl:
      "https://cbtbank.kr/category/%EC%9A%A9%EC%A0%91%EC%82%B0%EC%97%85%EA%B8%B0%EC%82%AC",
    examPathPrefix: "bx",
    includeSubjectTitles: [/용접일반\s*및\s*안전관리/i],
  },
  {
    key: "welding-engineer",
    title: "용접기사",
    categoryUrl:
      "https://cbtbank.kr/category/%EC%9A%A9%EC%A0%91%EA%B8%B0%EC%82%AC",
    examPathPrefix: "np",
    includeSubjectTitles: [/용접일반\s*및\s*안전관리/i],
  },
];
