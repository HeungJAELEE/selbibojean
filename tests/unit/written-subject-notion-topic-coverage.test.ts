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
      { sourceText: "비중에 따른 분류", bundleId: "casting-plastic-materials", cue: "비중에 따른 재료 분류" },
      { sourceText: "철강을 이루는 기본 5대 원소", bundleId: "casting-plastic-materials", cue: "강의 5대 원소" },
      { sourceText: "상온 취성", bundleId: "casting-plastic-materials", cue: "P의 취성 영향" },
      { sourceText: "적열 취성", bundleId: "casting-plastic-materials", cue: "S의 취성 영향" },
      { sourceText: "셀프 록킹", bundleId: "assembly-fasteners", cue: "나사 자립 조건" },
      { sourceText: "올덤 커플링", bundleId: "shaft-coupling-bearing", cue: "올덤 커플링" },
      { sourceText: "글로브 밸브", bundleId: "piping-valves-seals", cue: "글로브밸브" },
      { sourceText: "나비형 밸브", bundleId: "piping-valves-seals", cue: "버터플라이밸브" },
      { sourceText: "용적형(체적형)", bundleId: "fluid-machinery-troubles", cue: "용적형 압축기" },
      { sourceText: "터보형(원심형)", bundleId: "fluid-machinery-troubles", cue: "터보형 압축기" },
      { sourceText: "윤활유 5대 기능", bundleId: "maintenance-tools-lubrication", cue: "윤활유 5대 기능" },
      { sourceText: "스패너 (Spanner)", bundleId: "maintenance-tools-lubrication", cue: "스패너" },
      { sourceText: "줄 (File)", bundleId: "maintenance-tools-lubrication", cue: "줄" },
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

describe("selected Notion structural anchors to subtopic coverage", () => {
  it("keeps the audit scope explicit at 37 selected structural anchors", () => {
    expect(SUBJECTS.flatMap((subject) => subject.anchors)).toHaveLength(37);
  });

  it.each(SUBJECTS)(
    "keeps subject $code selected source anchors as linked small-topic facts",
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
