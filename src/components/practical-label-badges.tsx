import type { PracticalLabel } from "@/lib/domain/practical-types";

export function PracticalLabelBadges({
  labels,
}: {
  labels: PracticalLabel[];
}) {
  return (
    <span className="inline-flex flex-wrap gap-2">
      {labels.includes("practical_exam") ? (
        <span className="rounded-full bg-[#e8f6ef] px-3 py-1 text-xs font-extrabold text-[#17633b]">
          (실기 출제)
        </span>
      ) : null}
      {labels.includes("predicted_exam") ? (
        <span className="rounded-full bg-[#fff1e6] px-3 py-1 text-xs font-extrabold text-[#98480f]">
          (출제 예상)
        </span>
      ) : null}
    </span>
  );
}
