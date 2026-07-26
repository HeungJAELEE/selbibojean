import { notFound } from "next/navigation";
import { PracticalLabelBadges } from "@/components/practical-label-badges";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";
import { PracticalWrittenQuestion } from "@/components/practical-written-question";
import { PracticalMockNavigator } from "@/components/practical-mock-navigator";
import { PracticalStudyCategoryBadge } from "@/components/practical-study-category-badge";
import Link from "next/link";
import {
  getPublicPracticalVisualAid,
  getPublicPracticalQuestion,
} from "@/lib/content/practical-repository";

export default async function PracticalQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ mock?: string; index?: string }>;
}) {
  const [{ questionId }, query] = await Promise.all([params, searchParams]);
  const question = await getPublicPracticalQuestion(questionId);
  if (!question) notFound();
  const visualAid = await getPublicPracticalVisualAid(
    question.visualAidId,
    "prompt",
  );

  return (
    <div className="page-wrap max-w-4xl py-12">
      {query.mock && Number.isInteger(Number(query.index)) ? (
        <PracticalMockNavigator
          sessionId={query.mock}
          index={Number(query.index)}
          currentQuestionId={question.id}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <PracticalLabelBadges labels={[question.label]} />
        <PracticalStudyCategoryBadge
          categoryId={question.primaryStudyCategoryId}
        />
        {question.occurrence ? (
          <span className="text-sm font-bold text-slate-500">
            {question.occurrence.year}년 {question.occurrence.round}회 ·{" "}
            {question.occurrence.questionNumber} · 응시자 복원
          </span>
        ) : (
          <span className="text-sm font-bold text-slate-500">
            실제 출제횟수에 포함하지 않음
          </span>
        )}
      </div>
      <h1 className="display mt-4 text-3xl font-bold md:text-4xl">
        {question.title}
      </h1>
      <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-slate-700">
        {question.stem}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {question.conceptIds.map((conceptId) => (
          <Link
            key={conceptId}
            href={`/practical/written/theory/${conceptId}`}
            className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-extrabold text-[#16697a]"
          >
            관련 NCS 이론 먼저 보기 →
          </Link>
        ))}
        <Link
          href={`/practical/written/theory/category/${question.primaryStudyCategoryId}`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700"
        >
          같은 유형 학습
        </Link>
      </div>
      {visualAid ? (
        <div className="mt-8">
          <PracticalVisualAidFigure visualAid={visualAid} mode="prompt" />
        </div>
      ) : null}
      <div className="mt-8">
        <PracticalWrittenQuestion question={question} />
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-extrabold">원문 근거</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          {question.ncsSources.map((source) => (
            <li key={`${source.ncsCode}-${source.pdfPage}`}>
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#16697a] underline"
              >
                NCS {source.documentTitle}
              </a>{" "}
              · {source.ncsCode} · PDF p.{source.pdfPage}
              {source.printedPage ? ` / 인쇄 p.${source.printedPage}` : ""}
              {source.figureNumber ? ` · ${source.figureNumber}` : ""}
            </li>
          ))}
          {question.ncsSources.length === 0 && question.occurrence?.sourceUrl ? (
            <li>
              <a
                href={question.occurrence.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#16697a] underline"
              >
                {question.occurrence.sourceType}
              </a>{" "}
              · {question.occurrence.year}년 {question.occurrence.round}회{" "}
              {question.occurrence.questionNumber} · 복원 확실도{" "}
              {question.occurrence.reconstructionConfidence}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
