import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { PracticalWrittenCardLink } from "@/components/practical-written-card-link";
import {
  getPracticalWrittenExamCards,
  getPracticalWrittenKeywordIndex,
  getPublicPracticalQuestion,
} from "@/lib/content/practical-repository";

export default async function PracticalWrittenKeywordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [index, cards] = await Promise.all([
    getPracticalWrittenKeywordIndex(),
    getPracticalWrittenExamCards(),
  ]);
  const keyword = index.find(
    (item) => item.slug === slug || decodeURIComponent(item.slug) === decodeURIComponent(slug),
  );
  if (!keyword) notFound();
  const linkedCards = cards.filter((card) => keyword.cardIds.includes(card.id));
  const questions = (
    await Promise.all(
      keyword.questionIds.map((questionId) =>
        getPublicPracticalQuestion(questionId),
      ),
    )
  ).filter(
    (question): question is NonNullable<typeof question> => Boolean(question),
  );

  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="실기 필답형 · 키워드 역색인"
        title={keyword.label}
        description="이 키워드가 답안에 필요한 기출카드와 공개 문제를 한곳에서 다시 풉니다."
      />
      <Link
        href="/practical/written/theory?view=exam-type"
        className="mt-5 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-extrabold text-[#16697a]"
      >
        기출 유형별 목차
      </Link>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold">연결 풀이카드</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {linkedCards.map((card) => (
            <PracticalWrittenCardLink key={card.id} card={card} />
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold">바로 풀 수 있는 문제</h2>
        <div className="mt-5 grid gap-3">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/practical/written/question/${question.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#16697a]"
            >
              <span className="text-xs font-extrabold text-[#16697a]">
                {question.kind === "past" ? "기출복원" : "기출변형·필답예상"}
              </span>
              <strong className="mt-2 block">{question.title}</strong>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                {question.stem}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
