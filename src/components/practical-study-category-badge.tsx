import type { PracticalStudyCategoryId } from "@/lib/domain/practical-types";

const LABELS: Record<PracticalStudyCategoryId, string> = {
  visual_identification: "그림·사진 식별",
  formula_calculation: "공식·계산",
  theory_concept: "이론·개념",
  work_procedure: "작업·절차형(필답)",
};

export function PracticalStudyCategoryBadge({
  categoryId,
}: {
  categoryId: PracticalStudyCategoryId;
}) {
  return (
    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
      {LABELS[categoryId]}
    </span>
  );
}

