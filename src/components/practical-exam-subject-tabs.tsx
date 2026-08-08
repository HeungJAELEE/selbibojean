import Link from "next/link";
import type {
  PracticalTextbookSubject,
  PracticalTextbookSubjectId,
} from "@/data/source/practical-textbook-taxonomy";

export function PracticalExamSubjectTabs({
  subjects,
  selectedSubjectId,
  basePath = "/practical/written/theory",
  mode = false,
}: {
  subjects: readonly PracticalTextbookSubject[];
  selectedSubjectId: PracticalTextbookSubjectId;
  basePath?: string;
  mode?: boolean;
}) {
  return (
    <nav
      aria-label="필답 과목별 핵심요약"
      className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 lg:grid-cols-4"
      data-testid="practical-exam-subject-tabs"
    >
      {subjects.map((subject) => {
        const selected = subject.id === selectedSubjectId;
        const params = new URLSearchParams({
          ...(mode ? { mode: "practical" } : {}),
          view: "subject-summary",
          subject: subject.id,
        });
        return (
          <Link
            key={subject.id}
            href={`${basePath}?${params.toString()}`}
            aria-current={selected ? "page" : undefined}
            className={`rounded-xl px-3 py-3 text-center text-sm font-extrabold transition ${
              selected
                ? "bg-[#173957] text-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="block text-xs font-bold opacity-75">
              {subject.code}
            </span>
            <span className="mt-1 block">{subject.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
