import type { Lesson } from "@/lib/domain/types";

export function ContentRoleBadge({
  contentRole,
  className = "",
}: {
  contentRole?: Lesson["contentRole"];
  className?: string;
}) {
  if (contentRole !== "supplemental") return null;

  return (
    <span
      data-testid="supplemental-lesson-badge"
      className={`inline-flex shrink-0 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-extrabold text-sky-800 ${className}`}
    >
      +보강용
    </span>
  );
}
