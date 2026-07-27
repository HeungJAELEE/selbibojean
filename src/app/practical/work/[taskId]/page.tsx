import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Hammer,
  HeartPulse,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { PracticalTaskRunner } from "@/components/practical-task-runner";
import {
  getPracticalWorkTask,
  PRACTICAL_WORK_TASKS,
} from "@/data/source/practical-work-tasks";
import { getPublicPracticalConcept } from "@/lib/content/practical-repository";

export function generateStaticParams() {
  return PRACTICAL_WORK_TASKS.map((task) => ({ taskId: task.slug }));
}

export default async function PracticalWorkTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = getPracticalWorkTask(taskId);
  if (!task) notFound();
  const linkedConcepts = (
    await Promise.all(
      task.conceptIds.map((conceptId) => getPublicPracticalConcept(conceptId)),
    )
  ).filter((concept) => concept !== undefined);

  return (
    <div className="page-wrap pb-16">
      <PageHeading
        eyebrow={`${task.documentTitle} · ${task.ncsCode}`}
        title={task.title}
        description={task.summary}
        action={
          <Link
            href="/practical/work"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-700"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            교재별 과제
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-4" aria-label="과제 정보">
        <TaskMetric
          icon={<BookOpen size={19} />}
          label="난이도"
          value={difficultyLabel(task.difficulty)}
        />
        <TaskMetric
          icon={<ClipboardList size={19} />}
          label="예상시간"
          value={`${task.estimatedMinutes}분`}
        />
        <TaskMetric
          icon={<ShieldCheck size={19} />}
          label="안전 게이트"
          value={`${task.safetyChecks.length}개`}
        />
        <TaskMetric
          icon={<Gauge size={19} />}
          label="측정·판정"
          value={`${task.measurements.length}개`}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#dff3f2] text-[#16697a]">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-extrabold">보강 이론과 학습목표</h2>
          </div>
          <h3 className="mt-6 font-extrabold">학습목표</h3>
          <BulletList items={task.learningObjectives} />
          <h3 className="mt-7 font-extrabold">이 과제에서 채우는 이론</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {task.theoryTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-[#eaf7f6] px-3 py-2 text-sm font-bold text-[#16697a]"
              >
                {topic}
              </span>
            ))}
          </div>
          <h3 className="mt-7 font-extrabold">선행학습</h3>
          <BulletList items={task.prerequisites} />
        </div>

        <div className="space-y-6">
          <ResourceCard icon={<Wrench size={20} />} title="공구·측정기" items={task.tools} />
          <ResourceCard icon={<Hammer size={20} />} title="재료·부품" items={task.materials} empty="별도 소모재 없음" />
          <ResourceCard icon={<ShieldCheck size={20} />} title="보호구" items={task.protectiveEquipment} />
        </div>
      </section>

      <section
        className="mt-8 card p-6 md:p-8"
        aria-labelledby="linked-theory-heading"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-800">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="linked-theory-heading" className="text-xl font-extrabold">
              연결 이론 교재
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              명칭 암기에서 끝나지 않도록 정의·원리·공식·작업순서·진단·안전
              설명을 과제와 함께 확인합니다.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {linkedConcepts.map((concept) => (
            <Link
              key={concept.id}
              href={`/practical/written/theory/${concept.id}`}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#16697a] hover:bg-[#eaf7f6]"
            >
              <p className="text-xs font-black text-[#16697a]">{concept.id}</p>
              <h3 className="mt-1 font-extrabold">{concept.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {concept.definition}
              </p>
              <span className="mt-3 inline-flex text-xs font-extrabold text-[#16697a]">
                통합 이론 보기 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={20} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-extrabold">완료 판정 체크</h2>
          </div>
          <BulletList items={task.acceptanceChecks} />
        </div>
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle size={20} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-extrabold">기준·출처 검수 메모</h2>
          </div>
          <BulletList items={task.reviewNotes} />
        </div>
      </section>

      <section className="mt-8 card p-6 md:p-8" aria-labelledby="diagnosis-heading">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-800">
            <HeartPulse size={20} aria-hidden="true" />
          </span>
          <h2 id="diagnosis-heading" className="text-xl font-extrabold">
            이상현상 → 원인 → 점검 → 조치 → 재시험
          </h2>
        </div>
        <div className="mt-6 grid gap-4">
          {task.diagnostics.map((diagnostic) => (
            <article
              key={diagnostic.symptom}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="font-extrabold text-red-800">
                증상: {diagnostic.symptom}
              </h3>
              <DiagnosticRow label="가능 원인" items={diagnostic.probableCauses} />
              <DiagnosticRow label="확인" items={diagnostic.checks} />
              <DiagnosticRow label="조치" items={diagnostic.actions} />
              <p className="mt-3 text-sm leading-6 text-slate-700">
                <strong>재시험:</strong> {diagnostic.retest}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PracticalTaskRunner task={task} />

      <section className="mt-8 card p-6 text-sm leading-6 text-slate-600 md:p-8">
        <h2 className="font-extrabold text-slate-900">근거 연결</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {task.sourceRefs.map((sourceRef) => (
            <li key={sourceRef}>
              {sourceRef.startsWith("http") ? (
                <a
                  href={sourceRef}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#16697a] underline"
                >
                  NCS 원문 파일
                </a>
              ) : (
                sourceRef
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TaskMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <span className="text-[#16697a]" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-3 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
    </div>
  );
}

function ResourceCard({
  icon,
  title,
  items,
  empty = "없음",
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="text-[#16697a]" aria-hidden="true">
          {icon}
        </span>
        <h2 className="font-extrabold">{title}</h2>
      </div>
      <BulletList items={items.length ? items : [empty]} />
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function DiagnosticRow({ label, items }: { label: string; items: string[] }) {
  return (
    <p className="mt-3 text-sm leading-6 text-slate-700">
      <strong>{label}:</strong> {items.join(" · ")}
    </p>
  );
}

function difficultyLabel(
  difficulty: (typeof PRACTICAL_WORK_TASKS)[number]["difficulty"],
) {
  const labels = {
    foundation: "기초",
    intermediate: "중급",
    advanced: "심화",
  } as const;
  return labels[difficulty];
}
