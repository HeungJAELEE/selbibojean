import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PracticalInfoTabs } from "@/components/practical-info-tabs";
import { PRACTICAL_WORK_TASKS } from "@/data/source/practical-work-tasks";

export const metadata: Metadata = {
  title: "실기 관련 정보",
  description:
    "설비보전기사 공압·유압·용접 수행과제와 수험 준비 체크리스트를 확인합니다.",
};

export default function PracticalInfoPage() {
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Practical information"
        title="실기 관련 정보"
        description="공압·유압·용접은 NCS 이론과 수행과제로 연결하고, 준비물·팁은 시험 전 확인사항과 작업 순서 중심으로 정리합니다."
      />
      <PracticalInfoTabs
        pneumaticTasks={taskSummaries("1503010215")}
        hydraulicTasks={taskSummaries("1503010216")}
        weldingTasks={PRACTICAL_WORK_TASKS.filter((task) =>
          task.ncsCode.startsWith("160105"),
        ).map(toSummary)}
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
