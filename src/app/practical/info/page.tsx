import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PracticalInfoTabs } from "@/components/practical-info-tabs";
import { PRACTICAL_WORK_TASKS } from "@/data/source/practical-work-tasks";
import { PRACTICAL_TEST_CENTERS } from "@/data/source/practical-test-centers";
import { PRACTICAL_CANDIDATE_SUPPLIES } from "@/data/source/practical-candidate-supplies";

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
        description="실제 작업형 범위인 공압·유압·용접 수행과제와 준비물, 낯선 시험장 장비에 적응하는 확인 순서를 정리합니다. 필답 이론은 이 페이지에서 반복하지 않습니다."
      />
      <PracticalInfoTabs
        pneumaticTasks={taskSummaries("1503010215")}
        hydraulicTasks={taskSummaries("1503010216")}
        weldingTasks={PRACTICAL_WORK_TASKS.filter((task) =>
          task.ncsCode.startsWith("160105"),
        ).map(toSummary)}
        centers={PRACTICAL_TEST_CENTERS}
        supplies={PRACTICAL_CANDIDATE_SUPPLIES}
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
