import { CheckCircle2, CircleHelp } from "lucide-react";

import { MarkdownContent } from "@/components/markdown-content";

type ExamPoint = {
  question: string;
  criterion: string;
};

const EXAM_POINT_PATTERN =
  /^\*\*질문\*\*\n([\s\S]+?)\n\n\*\*판단 기준\*\*\n([\s\S]+)$/;

export function parseLessonExamPoints(content: string): ExamPoint[] {
  return content
    .split(/\n\n---\n\n/)
    .map((section) => section.trim().match(EXAM_POINT_PATTERN))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      question: match[1].trim(),
      criterion: match[2].trim(),
    }));
}

export function LessonExamPointCards({ content }: { content: string }) {
  const points = parseLessonExamPoints(content);

  if (points.length === 0) {
    return <MarkdownContent content={content} />;
  }

  return (
    <ol className="mt-5 grid gap-4" data-testid="lesson-exam-point-cards">
      {points.map((point, index) => (
        <li
          key={`${point.question}-${index}`}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex gap-3 px-5 py-5 md:px-6">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#173957] text-sm font-black text-white">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#16697a]">
                <CircleHelp size={15} aria-hidden="true" />
                질문
              </p>
              <div className="mt-1 font-bold text-[#173957]">
                <MarkdownContent content={point.question} compact />
              </div>
            </div>
          </div>
          <div className="border-t border-[#c9e5e2] bg-[#eef9f8] px-5 py-4 md:px-6">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#16697a]">
              <CheckCircle2 size={15} aria-hidden="true" />
              판단 기준
            </p>
            <div className="mt-1 text-[#294a58]">
              <MarkdownContent content={point.criterion} compact />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
