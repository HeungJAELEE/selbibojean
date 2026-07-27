import Link from "next/link";
import { ArrowRight, FilePenLine } from "lucide-react";
import { PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS } from "@/data/source/practical-written-exam-cards";
import type { PracticalWrittenExamCard } from "@/lib/domain/practical-types";

export function PracticalWrittenCardLink({
  card,
}: {
  card: PracticalWrittenExamCard;
}) {
  return (
    <Link
      href={`/practical/written/card/${card.slug}`}
      className="card group flex h-full flex-col p-5 hover:border-[#16697a]"
      data-testid={`practical-written-card-link-${card.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#eaf7f6] px-3 py-1 text-xs font-extrabold text-[#16697a]">
          {PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS[card.primaryFormat]}
        </span>
        <FilePenLine size={18} className="text-slate-400" />
      </div>
      <h3 className="mt-4 text-lg font-extrabold">{card.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {card.questionPattern}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {card.keywordLinks.slice(0, 3).map((keyword) => (
          <span
            key={keyword.slug}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
          >
            {keyword.label}
          </span>
        ))}
      </div>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-[#16697a]">
        기출부터 직접 풀기 <ArrowRight size={14} />
      </span>
    </Link>
  );
}
