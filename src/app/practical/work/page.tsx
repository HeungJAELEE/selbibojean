import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  ClipboardList,
  Gauge,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { PracticalFluidPowerVideoGuide } from "@/components/practical-fluid-power-video-guide";
import { PracticalRepairWeldingVideoGuide } from "@/components/practical-repair-welding-video-guide";
import { practicalFluidPowerVideoGroups } from "@/data/source/practical-fluid-power-videos";
import { practicalRepairWeldingVideos } from "@/data/source/practical-repair-welding-videos";
import {
  PRACTICAL_WORK_MODULES,
  PRACTICAL_WORK_TASKS,
} from "@/data/source/practical-work-tasks";

export default function PracticalWorkPage() {
  const linkedConceptCount = new Set(
    PRACTICAL_WORK_MODULES.flatMap((module) => module.conceptIds),
  ).size;
  const totalSteps = PRACTICAL_WORK_TASKS.reduce(
    (sum, task) => sum + task.steps.length,
    0,
  );
  const totalSafetyChecks = PRACTICAL_WORK_TASKS.reduce(
    (sum, task) => sum + task.safetyChecks.length,
    0,
  );
  const totalMeasurements = PRACTICAL_WORK_TASKS.reduce(
    (sum, task) => sum + task.measurements.length,
    0,
  );

  return (
    <div className="page-wrap pb-16">
      <PageHeading
        eyebrow="Practical · work"
        title="NCS 실기 수행과제"
        description="11권의 이론을 준비 → 안전 → 수행 → 측정 → 판정 → 진단 → 복구 → 기록으로 연결했습니다. 과제별 수치와 허용값은 최신 도면·WPS·제작사 기준을 우선합니다."
      />

      <section
        data-testid="practical-work-summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"
        aria-label="실기 수행과제 요약"
      >
        <SummaryCard
          icon={<BookOpenCheck size={20} />}
          value={PRACTICAL_WORK_MODULES.length}
          label="NCS 교재"
        />
        <SummaryCard
          icon={<BookOpen size={20} />}
          value={linkedConceptCount}
          label="연결 이론"
        />
        <SummaryCard
          icon={<ClipboardList size={20} />}
          value={PRACTICAL_WORK_TASKS.length}
          label="수행과제"
        />
        <SummaryCard
          icon={<Workflow size={20} />}
          value={totalSteps}
          label="수행 단계"
        />
        <SummaryCard
          icon={<ShieldCheck size={20} />}
          value={totalSafetyChecks}
          label="안전 게이트"
        />
        <SummaryCard
          icon={<Gauge size={20} />}
          value={totalMeasurements}
          label="측정·판정 항목"
        />
      </section>

      <section className="mt-12" aria-labelledby="work-module-heading">
        <p className="eyebrow">Complete practical workflow</p>
        <h2 id="work-module-heading" className="mt-2 text-2xl font-extrabold">
          교재별 수행과제
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          기존 이론카드에 링크만 붙인 것이 아닙니다. 각 과제에는 보강 이론,
          공구·재료·보호구, 안전 게이트, 단계별 수행, 측정과 수동판정,
          이상원인·조치·재시험, 기기 저장형 작업기록이 포함됩니다.
        </p>

        <div className="mt-6 space-y-5">
          {PRACTICAL_WORK_MODULES.map((module) => {
            const tasks = module.taskIds
              .map((taskId) =>
                PRACTICAL_WORK_TASKS.find((task) => task.id === taskId),
              )
              .filter((task) => task !== undefined);

            return (
              <article
                key={module.ncsCode}
                data-testid={`practical-work-module-${module.ncsCode}`}
                className="card overflow-hidden"
              >
                <header className="border-b border-slate-200 bg-[#173957] p-6 text-white md:p-7">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.12em] text-teal-200">
                        NCS {module.ncsCode} · {module.version}
                      </p>
                      <h3 className="mt-2 text-xl font-extrabold">
                        {module.documentTitle}
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                        {module.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-teal-100">
                      수행과제 {tasks.length}개
                    </span>
                  </div>
                </header>
                <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                  {tasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/practical/work/${task.slug}`}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#16697a] hover:bg-[#f0fbfa]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.12em] text-[#16697a]">
                            {difficultyLabel(task.difficulty)} · 약{" "}
                            {task.estimatedMinutes}분
                          </p>
                          <h4 className="mt-2 font-extrabold text-slate-900">
                            {task.title}
                          </h4>
                        </div>
                        <ArrowRight
                          size={18}
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-[#16697a] transition group-hover:translate-x-1"
                        />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {task.summary}
                      </p>
                      <p className="mt-4 text-xs font-bold text-slate-500">
                        보강 이론 {task.theoryTopics.length} · 수행 단계{" "}
                        {task.steps.length} · 측정 {task.measurements.length} ·
                        진단 {task.diagnostics.length}
                      </p>
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="video-reference-heading">
        <p className="eyebrow">Supplementary video</p>
        <h2 id="video-reference-heading" className="mt-2 text-2xl font-extrabold">
          동작 관찰용 외부 영상
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          영상은 보조자료입니다. 실제 작업순서와 조건은 위 수행과제의 NCS 근거,
          최신 공개과제, 도면·WPS·제작사 절차를 우선합니다.
        </p>
      </section>

      <PracticalFluidPowerVideoGuide groups={practicalFluidPowerVideoGroups} />
      <PracticalRepairWeldingVideoGuide videos={practicalRepairWeldingVideos} />
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="card p-5">
      <span className="text-[#16697a]" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function difficultyLabel(difficulty: (typeof PRACTICAL_WORK_TASKS)[number]["difficulty"]) {
  const labels = {
    foundation: "기초",
    intermediate: "중급",
    advanced: "심화",
  } as const;
  return labels[difficulty];
}
