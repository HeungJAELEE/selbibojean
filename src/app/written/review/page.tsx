import Link from "next/link";
import { Clock3, RotateCcw, Target } from "lucide-react";
import { PageHeading } from "@/components/page-heading";

const modes = {
  wrong: {
    title: "오답노트",
    description: "틀린 문제와 선택한 답을 다시 확인하고 같은 문항을 재풀이합니다.",
    icon: RotateCcw,
  },
  weak: {
    title: "취약 개념 복습",
    description: "오답이 누적된 개념군을 우선으로 묶어 다시 풉니다.",
    icon: Target,
  },
  due: {
    title: "복습 예정",
    description: "간격 반복 일정이 도래한 문제를 순서대로 다시 풉니다.",
    icon: Clock3,
  },
} as const;

type ReviewMode = keyof typeof modes;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode: ReviewMode =
    params.mode === "wrong" || params.mode === "weak" || params.mode === "due"
      ? params.mode
      : "wrong";
  const current = modes[mode];
  const Icon = current.icon;

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Review"
        title="오답·복습"
        description="오답, 취약 개념, 복습 일정을 목적에 맞게 골라 다시 풉니다."
      />
      <nav
        aria-label="오답 및 복습 유형"
        className="mb-6 flex gap-2 overflow-x-auto pb-2"
      >
        {(Object.keys(modes) as ReviewMode[]).map((key) => (
          <Link
            key={key}
            href={`/written/review?mode=${key}`}
            aria-current={key === mode ? "page" : undefined}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold ${
              key === mode
                ? "border-[#173957] bg-[#173957] text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {modes[key].title}
          </Link>
        ))}
      </nav>

      <div className="card grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <span className="grid size-12 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
            <Icon aria-hidden />
          </span>
          <h2 className="mt-6 text-2xl font-extrabold">{current.title}</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            {current.description}
          </p>
        </div>
        <Link
          href={`/written/practice/random?mode=${mode}`}
          className="rounded-xl bg-[#173957] px-6 py-4 text-center font-extrabold text-white"
        >
          {current.title} 시작
        </Link>
      </div>
    </div>
  );
}
