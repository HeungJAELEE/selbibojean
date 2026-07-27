import Image from "next/image";
import Link from "next/link";
import type {
  ExamEvidenceDisplayKind,
  PracticalExamRepresentativeQuestion,
} from "@/lib/domain/practical-types";

export type { PracticalExamRepresentativeQuestion } from "@/lib/domain/practical-types";

const evidenceLabelByKind: Record<ExamEvidenceDisplayKind, string> = {
  practical_past: "필답 기출",
  practical_variant: "필답 기출 변형",
  practical_predicted: "필답 예상",
  written_frequent: "필기 빈출",
  ncs_supplement: "NCS 보강",
};

export function PracticalExamRepresentativeQuestions({
  questions,
}: {
  questions: PracticalExamRepresentativeQuestion[];
}) {
  const visibleQuestions = questions.slice(0, 3);
  if (visibleQuestions.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
      data-testid="practical-exam-representative-questions"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.14em] text-[#16697a]">
            대표 문제
          </p>
          <h3 className="mt-1 text-xl font-extrabold">
            요약을 읽고 바로 확인
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {visibleQuestions.length}문제
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {visibleQuestions.map((question) => (
          <Link
            key={question.id}
            href={`/practical/written/question/${question.id}`}
            className="rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#16697a] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16697a] focus-visible:ring-offset-2"
          >
            <span className="flex flex-wrap gap-1.5">
              {question.evidenceKinds.map((kind) => (
                <span
                  key={kind}
                  className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-extrabold text-[#16697a]"
                >
                  {evidenceLabelByKind[kind]}
                </span>
              ))}
              {question.occurrence ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {question.occurrence.year}년 {question.occurrence.round}회
                </span>
              ) : null}
            </span>
            <span
              className={
                question.visual
                  ? "mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center"
                  : "mt-3 block"
              }
            >
              <span>
                <strong className="block">{question.title}</strong>
                <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-600">
                  {question.stem}
                </span>
              </span>
              {question.visual ? (
                <span
                  className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1"
                  aria-label={`${question.visual.title} 미리보기`}
                >
                  {question.visual.imagePaths.slice(0, 4).map((imagePath, index) => (
                    <Image
                      key={imagePath}
                      src={imagePath}
                      alt={`${question.visual?.altText ?? question.title} ${index + 1}`}
                      width={120}
                      height={80}
                      loading="eager"
                      className="h-16 w-full rounded object-contain"
                    />
                  ))}
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
