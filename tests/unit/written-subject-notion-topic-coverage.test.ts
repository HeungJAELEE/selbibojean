import { describe, expect, it } from "vitest";
import subjectOneSource from "@/data/source/written-subject-one-notion-body.json";
import subjectTwoSource from "@/data/source/written-subject-two-notion-body.json";
import subjectThreeSource from "@/data/source/written-subject-three-notion-body.json";
import subjectFourSource from "@/data/source/written-subject-four-notion-body.json";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE } from "@/data/source/written-subject-two-memory-guide";
import { WRITTEN_SUBJECT_THREE_MEMORY_GUIDE } from "@/data/source/written-subject-three-memory-guide";
import { WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE } from "@/data/source/written-subject-four-memory-guide";
import { getWrittenSubjectFactLessonTitles } from "@/data/source/written-subject-fact-lesson-links";

type CoverageAnchor = {
  sourceText: string;
  bundleId: string;
  cue: string;
};

const SUBJECTS = [
  {
    code: 1 as const,
    body: subjectOneSource.body,
    bundles: WRITTEN_SUBJECT_ONE_MEMORY_GUIDE,
    anchors: [
      { sourceText: "공기압 요소 번호 부여 방식", bundleId: "actuators-piping-maintenance", cue: "공기압 요소 번호" },
      { sourceText: "공압 액추에이터", bundleId: "actuators-piping-maintenance", cue: "단동·복동 실린더" },
      { sourceText: "네트워크 구성 형태", bundleId: "industrial-communication-handling", cue: "버스형 네트워크" },
      { sourceText: "공장 자동화 컴포넌트 핸들링", bundleId: "industrial-communication-handling", cue: "핸들링" },
      { sourceText: "센서의 성능 평가 용어", bundleId: "sensors-signals", cue: "정확도·정밀도" },
      { sourceText: "점도", bundleId: "fluid-foundation", cue: "점도와 동점도" },
    ] satisfies CoverageAnchor[],
  },
  {
    code: 2 as const,
    body: subjectTwoSource.body,
    bundles: WRITTEN_SUBJECT_TWO_MEMORY_GUIDE,
    anchors: [
      { sourceText: "용접 자세", bundleId: "classification-joints", cue: "용접 자세" },
      { sourceText: "용융지", bundleId: "arc-foundation-polarity", cue: "용융지와 비드" },
      { sourceText: "용접 결함 통합 요약표", bundleId: "weld-defects", cue: "언더컷" },
      { sourceText: "용접 변형과 잔류 응력", bundleId: "deformation-stress", cue: "변형 원인" },
      { sourceText: "용접 중 대책", bundleId: "deformation-stress", cue: "후진법" },
      { sourceText: "비파괴 검사", bundleId: "inspection", cue: "PT" },
    ] satisfies CoverageAnchor[],
  },
  {
    code: 3 as const,
    body: subjectThreeSource.body,
    bundles: WRITTEN_SUBJECT_THREE_MEMORY_GUIDE,
    anchors: [
      { sourceText: "선의 종류와 용도", bundleId: "drawing-lines-tolerance", cue: "선의 우선순위" },
      { sourceText: "단면도", bundleId: "drawing-lines-tolerance", cue: "단면도" },
      { sourceText: "측정 오차", bundleId: "measurement-principles", cue: "계통오차" },
      { sourceText: "측정 방식의 분류", bundleId: "measurement-principles", cue: "비교·간접측정" },
      { sourceText: "표면 거칠기", bundleId: "gauges-drawing-rules", cue: "표면거칠기" },
      { sourceText: "기어(Gear)의 손상", bundleId: "power-transmission", cue: "기어 손상" },
      { sourceText: "밸브 (Valve)", bundleId: "piping-valves-seals", cue: "게이트·글로브" },
    ] satisfies CoverageAnchor[],
  },
  {
    code: 4 as const,
    body: subjectFourSource.body,
    bundles: WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE,
    anchors: [
      { sourceText: "설비 보전 조직과 분업 체계", bundleId: "maintenance-organization-resources-qc", cue: "보전조직" },
      { sourceText: "보전 예산 관리", bundleId: "maintenance-organization-resources-qc", cue: "보전예산·원가" },
      { sourceText: "자재품 통제 및 데이터 분석", bundleId: "maintenance-organization-resources-qc", cue: "보전자재·재고" },
      { sourceText: "QC Tools", bundleId: "maintenance-organization-resources-qc", cue: "PDCA·QC 도구" },
      { sourceText: "고장 곡선", bundleId: "reliability-life-cycle", cue: "초기고장기" },
      { sourceText: "윤활 급유법의 분류", bundleId: "oil-supply-management", cue: "전손식" },
    ] satisfies CoverageAnchor[],
  },
];

describe("Notion original topic to subtopic coverage", () => {
  it.each(SUBJECTS)(
    "keeps subject $code source anchors as linked small-topic facts",
    ({ code, body, bundles, anchors }) => {
      for (const anchor of anchors) {
        expect(body, anchor.sourceText).toContain(anchor.sourceText);

        const bundle = bundles.find((candidate) => candidate.id === anchor.bundleId);
        expect(bundle, anchor.bundleId).toBeDefined();

        const fact = bundle?.facts.find((candidate) => candidate.cue === anchor.cue);
        expect(fact, `${anchor.bundleId}:${anchor.cue}`).toBeDefined();
        expect(
          fact
            ? getWrittenSubjectFactLessonTitles(code, bundle!, fact)
            : [],
          `${anchor.bundleId}:${anchor.cue}`,
        ).not.toEqual([]);
      }
    },
  );
});
