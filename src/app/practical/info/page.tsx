import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PracticalInfoTabs } from "@/components/practical-info-tabs";
import { PRACTICAL_WORK_TASKS } from "@/data/source/practical-work-tasks";
import {
  getPracticalCenterComparison,
  getPracticalCenterEvidenceLabel,
  PRACTICAL_HISTORICAL_CANDIDATE_CENTERS,
  PRACTICAL_MAIN_TEST_CENTERS,
} from "@/data/source/practical-test-centers";
import {
  PRACTICAL_CANDIDATE_SUPPLIES,
  PRACTICAL_SUPPLY_RECOMMENDATIONS,
  PRACTICAL_WELDING_TOOL_RECOMMENDATIONS,
} from "@/data/source/practical-candidate-supplies";
import {
  PRACTICAL_PUBLIC_PROBLEMS,
  PRACTICAL_QUALIFICATION_OVERVIEW,
  PRACTICAL_SUPPLIES_OFFICIAL_URL,
} from "@/data/source/practical-exam-reference";
import {
  getFluidPowerYouTubeEmbedUrl,
  practicalFluidPowerVideoGroups,
} from "@/data/source/practical-fluid-power-videos";
import {
  getYouTubeNoCookieEmbedUrl,
  practicalRepairWeldingVideos,
} from "@/data/source/practical-repair-welding-videos";
import {
  getHistoricalPracticalTrainingResources,
  getPublicPracticalTrainingResources,
} from "@/data/source/practical-training-resources";
import { getPracticalFaqsForTab } from "@/data/source/practical-faqs";

const PRACTICAL_TRAINING_RESOURCES_AS_OF = "2026-07-28";

export const metadata: Metadata = {
  title: "실기 관련 정보",
  description:
    "설비보전기사 공압·유압·용접 수행과제와 수험 준비 체크리스트를 확인합니다.",
};

export default async function PracticalInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = [
    "pneumatic",
    "hydraulic",
    "welding",
    "prep",
    "centers",
  ].includes(tab ?? "")
    ? (tab as "pneumatic" | "hydraulic" | "welding" | "prep" | "centers")
    : "pneumatic";
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Practical information"
        title="실기 관련 정보"
        description="시험 점수·시간·실격기준부터 공압·유압·용접 영상과 공식 공개문제, 지참준비물, 시험장 장비 차이까지 한곳에서 확인합니다."
      />
      <PracticalInfoTabs
        overview={PRACTICAL_QUALIFICATION_OVERVIEW}
        pneumaticTasks={taskSummaries("1503010215")}
        hydraulicTasks={taskSummaries("1503010216")}
        weldingTasks={PRACTICAL_WORK_TASKS.filter((task) =>
          task.ncsCode.startsWith("160105"),
        ).map(toSummary)}
        videos={practicalInfoVideos()}
        publicProblems={PRACTICAL_PUBLIC_PROBLEMS}
        centers={PRACTICAL_MAIN_TEST_CENTERS.map((center) => ({
          ...center,
          evidenceLabel: getPracticalCenterEvidenceLabel(center),
          comparison: getPracticalCenterComparison(center),
        }))}
        candidateCenters={PRACTICAL_HISTORICAL_CANDIDATE_CENTERS.map(
          (center) => ({
            ...center,
            evidenceLabel: getPracticalCenterEvidenceLabel(center),
            comparison: getPracticalCenterComparison(center),
          }),
        )}
        supplies={PRACTICAL_CANDIDATE_SUPPLIES}
        supplyRecommendations={PRACTICAL_SUPPLY_RECOMMENDATIONS}
        weldingToolRecommendations={PRACTICAL_WELDING_TOOL_RECOMMENDATIONS}
        suppliesOfficialUrl={PRACTICAL_SUPPLIES_OFFICIAL_URL}
        trainingResources={getPublicPracticalTrainingResources(
          PRACTICAL_TRAINING_RESOURCES_AS_OF,
        )}
        historicalTrainingResources={getHistoricalPracticalTrainingResources(
          PRACTICAL_TRAINING_RESOURCES_AS_OF,
        )}
        trainingResourcesAsOf={PRACTICAL_TRAINING_RESOURCES_AS_OF}
        faqs={[
          ...getPracticalFaqsForTab("prep"),
          ...getPracticalFaqsForTab("centers"),
        ]}
        initialTab={initialTab}
      />
    </div>
  );
}

function taskSummaries(ncsCode: string) {
  return PRACTICAL_WORK_TASKS.filter(
    (task) => task.ncsCode === ncsCode,
  ).map(toSummary);
}

function toSummary(task: (typeof PRACTICAL_WORK_TASKS)[number]) {
  return {
    id: task.id,
    slug: task.slug,
    title: task.title,
    summary: task.summary,
    estimatedMinutes: task.estimatedMinutes,
    stepCount: task.steps.length,
    safetyCount: task.safetyChecks.length,
  };
}

function practicalInfoVideos() {
  const circuitGroup = practicalFluidPowerVideoGroups.find(
    (group) => group.id === "circuit-memorization",
  );
  const pneumaticGroup = practicalFluidPowerVideoGroups.find(
    (group) => group.id === "pneumatic-1-to-8",
  );
  const hydraulicGroup = practicalFluidPowerVideoGroups.find(
    (group) => group.id === "hydraulic-1-to-8",
  );
  const circuitStrategy = circuitGroup?.videos.find(
    (video) => video.id === "circuit-strategy",
  );
  const pneumaticOneSheet = circuitGroup?.videos.find(
    (video) => video.id === "pneumatic-one-sheet",
  );
  const hydraulicOneSheet = circuitGroup?.videos.find(
    (video) => video.id === "hydraulic-one-sheet",
  );

  if (
    !pneumaticGroup ||
    !hydraulicGroup ||
    !circuitStrategy ||
    !pneumaticOneSheet ||
    !hydraulicOneSheet
  ) {
    throw new Error("실기 관련 정보용 종목별 영상이 누락되었습니다.");
  }

  return {
    pneumatic: [
      ...pneumaticGroup.videos.map(toFluidInfoVideo),
      toFluidInfoVideo(circuitStrategy),
      toFluidInfoVideo(pneumaticOneSheet),
    ],
    hydraulic: [
      ...hydraulicGroup.videos.map(toFluidInfoVideo),
      toFluidInfoVideo(circuitStrategy),
      toFluidInfoVideo(hydraulicOneSheet),
    ],
    welding: practicalRepairWeldingVideos.map((video) => ({
      id: video.id,
      title: video.label,
      sourceTitle: video.sourceTitle,
      channel: video.channel,
      sourceUrl: video.sourceUrl,
      embedUrl: getYouTubeNoCookieEmbedUrl(video.videoId),
      playback: "embed" as const,
      learningFocus: video.learningFocus,
      caution: video.caution,
    })),
  };
}

function toFluidInfoVideo(
  video: (typeof practicalFluidPowerVideoGroups)[number]["videos"][number],
) {
  return {
    id: video.id,
    title: video.label,
    sourceTitle: video.sourceTitle,
    channel: video.channel,
    sourceUrl: video.sourceUrl,
    embedUrl: getFluidPowerYouTubeEmbedUrl(video.embed),
    playback:
      video.id === "pneumatic-one-sheet"
        ? ("external" as const)
        : ("embed" as const),
    learningFocus: video.learningFocus,
    caution: video.caution,
  };
}
