import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardPenLine,
  FileQuestion,
  Lightbulb,
  Repeat2,
} from "lucide-react";
import {
  PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS,
} from "@/data/source/practical-written-exam-cards";
import type {
  PracticalQuestion,
  PracticalVisualAid,
  PracticalWrittenExamCard,
} from "@/lib/domain/practical-types";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";

export function PracticalWrittenExamCardView({
  card,
  pastQuestions,
  predictedQuestions,
  visualAids = [],
}: {
  card: PracticalWrittenExamCard;
  pastQuestions: PracticalQuestion[];
  predictedQuestions: PracticalQuestion[];
  visualAids?: PracticalVisualAid[];
}) {
  const occurrences = pastQuestions
    .map((question) => question.occurrence)
    .filter((occurrence) => occurrence !== null)
    .sort(
      (left, right) =>
        right.year - left.year ||
        right.round - left.round ||
        (right.questionNumber ?? "").localeCompare(
          left.questionNumber ?? "",
        ),
    );
  const publicPastQuestions = pastQuestions.filter(
    (question) => question.contentStatus === "published",
  );
  const publicPredictedQuestions = predictedQuestions.filter(
    (question) => question.contentStatus === "published",
  );
  const visualFramesById = new Map(
    visualAids.flatMap((visualAid) =>
      visualAid.frames.map((frame) => [frame.id, frame] as const),
    ),
  );

  return (
    <article
      id={`exam-card-${card.id}`}
      data-testid={`practical-written-exam-card-${card.id}`}
      className="mt-8 scroll-mt-24 overflow-hidden rounded-3xl border border-[#173957]/20 bg-white shadow-[0_16px_40px_rgba(23,57,87,0.08)]"
    >
      <header className="bg-[#173957] px-6 py-6 text-white md:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-white/15 px-3 py-1">
            {PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS[card.format]}
          </span>
          {occurrences.length > 0 ? (
            occurrences.map((occurrence) => (
              <span
                key={`${occurrence.year}-${occurrence.round}-${occurrence.questionNumber}`}
                className="rounded-full bg-emerald-300/20 px-3 py-1 text-emerald-100"
              >
                {occurrence.year}년 {occurrence.round}회{" "}
                {occurrence.questionNumber}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-amber-300/20 px-3 py-1 text-amber-100">
              NCS 기반 필답 예상
            </span>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-extrabold md:text-3xl">
          {card.title}
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-200">
          {card.questionPattern}
        </p>
      </header>

      <div className="grid gap-6 p-6 md:p-8">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            먼저 답을 가리고 씁니다
          </p>
          <h3 className="mt-2 text-xl font-extrabold text-emerald-950">
            이 카드의 기출·변형 문제를 직접 풀어 보세요
          </h3>
          <p className="mt-3 text-sm leading-7 text-emerald-900">
            제출 전에는 모범답안과 채점 키워드를 보여 주지 않습니다. 답안을
            제출한 뒤 부분점수 기준과 오답 함정을 비교할 수 있습니다.
          </p>
          {publicPastQuestions[0] ?? publicPredictedQuestions[0] ? (
            <Link
              href={`/practical/written/question/${
                (publicPastQuestions[0] ?? publicPredictedQuestions[0]).id
              }`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#173957] px-5 py-3 text-sm font-extrabold text-white"
            >
              답 가리고 직접 풀기 <ArrowRight size={15} />
            </Link>
          ) : null}
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
              답안 필수어
            </p>
            <h3 className="mt-2 font-extrabold">핵심 키워드</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {card.keywordLinks.slice(0, 5).map((keyword) => (
                <Link
                  key={keyword.slug}
                  href={`/practical/written/keyword/${keyword.slug}`}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-950"
                >
                  {keyword.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">
              사진·문장 단서
            </p>
            <h3 className="mt-2 font-extrabold">판별 포인트</h3>
            <ul className="mt-4 space-y-2.5">
              {card.recognitionPoints.slice(0, 3).map((point) => (
                <li
                  key={point}
                  className="flex gap-2 text-sm leading-6 text-slate-700"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-sky-700"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {visualAids.length > 0 ? (
          <section aria-label="시험카드 판별 시각자료" className="grid gap-4">
            {visualAids.map((visualAid) => (
              <PracticalVisualAidFigure
                key={visualAid.id}
                visualAid={visualAid}
                mode="theory"
              />
            ))}
          </section>
        ) : null}

        <section
          aria-labelledby={`${card.id}-past-question`}
          className="rounded-2xl border border-slate-200 p-5 md:p-6"
        >
          <div className="flex items-center gap-2">
            <FileQuestion size={19} className="text-[#16697a]" />
            <h3
              id={`${card.id}-past-question`}
              className="text-lg font-extrabold"
            >
              실제 기출에서 이렇게 나왔습니다
            </h3>
          </div>
          {pastQuestions.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {pastQuestions.slice(0, 3).map((question) => (
                <article
                  key={question.id}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    {question.occurrence ? (
                      <span>
                        {question.occurrence.year}년{" "}
                        {question.occurrence.round}회{" "}
                        {question.occurrence.questionNumber}
                      </span>
                    ) : null}
                    <span>복원 신뢰도 {question.occurrence?.reconstructionConfidence ?? "검수"}</span>
                    {question.contentStatus !== "published" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                        원문·자산 보류
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
                    {question.stem}
                  </p>
                  {question.contentStatus === "published" ? (
                    <Link
                      href={`/practical/written/question/${question.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-[#16697a]"
                    >
                      답 가리고 직접 풀기 <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      동일 시험 원문 또는 필수 시각자료가 확보되기 전까지
                      문제풀이 링크는 공개하지 않습니다.
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              현재 확보한 복원자료에서 이 항목의 실제 회차는 확인되지
              않았습니다. 아래 예상문제는 NCS 근거와 인접 기출 유형으로
              구성했습니다.
            </p>
          )}
        </section>

        <details className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 md:p-6">
          <summary className="cursor-pointer text-lg font-extrabold text-indigo-950">
            직접 푼 뒤 답안 작성 순서 보기
          </summary>
          <div className="flex items-center gap-2">
            <ClipboardPenLine size={19} className="text-indigo-700" />
            <h3 className="mt-4 text-lg font-extrabold">답안은 이 순서로 씁니다</h3>
          </div>
          <ol className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-700">
            {card.answerSkeleton.map((line) => (
              <li key={line} className="list-decimal pl-1">
                {line}
              </li>
            ))}
          </ol>
          {card.sequenceSteps.some(
            (step) => step.visualFrameIds.length > 0,
          ) ? (
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {card.sequenceSteps.map((step, index) => {
                const frames = step.visualFrameIds
                  .map((frameId) => visualFramesById.get(frameId))
                  .filter((frame) => frame !== undefined);
                return (
                  <li
                    key={step.id}
                    className="overflow-hidden rounded-xl border border-indigo-200 bg-white"
                  >
                    {frames.map((frame) => (
                      <div
                        key={frame.id}
                        className="relative min-h-40 border-b border-indigo-100 bg-slate-50"
                      >
                        <Image
                          src={frame.path}
                          alt={frame.learningAltText}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-3"
                        />
                      </div>
                    ))}
                    <div className="p-4">
                      <p className="text-xs font-black text-indigo-700">
                        STEP {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-extrabold leading-6 text-slate-900">
                        {step.answerPhrase ?? step.label}
                      </p>
                      {step.checkpoint ? (
                        <p className="mt-2 text-xs leading-5 text-slate-600">
                          확인: {step.checkpoint}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </details>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-center gap-2">
              <Repeat2 size={18} className="text-violet-700" />
              <h3 className="font-extrabold">변형되는 부분</h3>
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
              {card.variationAxes.slice(0, 4).map((axis) => (
                <li key={axis} className="rounded-xl bg-white px-3 py-2">
                  {axis}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-700" />
              <h3 className="font-extrabold">자주 틀리는 답</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {card.commonWrongAnswers.slice(0, 3).map((answer) => (
                <li key={answer}>× {answer}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-violet-200 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Lightbulb size={19} className="text-violet-700" />
            <h3 className="text-lg font-extrabold">이렇게 바뀌어 나올 수 있습니다</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {publicPredictedQuestions.slice(0, 3).map((question) => (
              <Link
                key={question.id}
                href={`/practical/written/question/${question.id}`}
                className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm font-bold leading-6 text-violet-950 hover:border-violet-400"
              >
                {question.stem}
                <span className="mt-2 block text-xs font-extrabold text-violet-700">
                  예상문제 직접 풀기 →
                </span>
              </Link>
            ))}
            {publicPredictedQuestions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-violet-200 bg-white p-4 text-sm leading-6 text-slate-600">
                연결된 공개 예상문제를 검수 중입니다. 문장 예시만으로 완료
                처리하지 않습니다.
              </p>
            ) : null}
          </div>
        </section>

        <details className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <summary className="cursor-pointer font-extrabold text-emerald-950">
            직접 푼 뒤 핵심 답안 요약 보기
          </summary>
          <p className="mt-4 text-sm font-bold leading-7 text-emerald-950">
            {card.directAnswer}
          </p>
        </details>

        <details className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <summary className="cursor-pointer font-extrabold text-slate-800">
            왜 이런 답이 되는지 · NCS 근거 보기
          </summary>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-700">
            <ul className="space-y-2">
              {card.reasoningSummary.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
            {card.sourceRefs.length > 0 ? (
              <ul className="space-y-2 border-t border-slate-200 pt-4">
                {card.sourceRefs.map((source) => (
                  <li
                    key={`${source.ncsCode}-${source.pdfPage}-${source.figureNumber ?? "text"}`}
                  >
                    {source.documentTitle} · {source.ncsCode}
                    {source.pdfPage ? ` · PDF ${source.pdfPage}쪽` : ""}
                    {source.figureNumber ? ` · ${source.figureNumber}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-slate-200 pt-4 text-amber-800">
                현재 확보한 NCS 11권 밖의 근거가 필요한 항목입니다. 실제
                기출복원 근거와 계산 정의를 분리해 관리합니다.
              </p>
            )}
          </div>
        </details>

        {publicPastQuestions.length === 0 && pastQuestions.length > 0 ? (
          <p className="text-xs leading-5 text-slate-500">
            이 카드의 복원 회차는 Evidence에는 남아 있지만 원문·시각자료
            보류로 공개 문제 수에는 포함되지 않습니다.
          </p>
        ) : null}
      </div>
    </article>
  );
}
