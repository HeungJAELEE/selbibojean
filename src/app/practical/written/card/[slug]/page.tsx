import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticalWrittenExamCardView } from "@/components/practical-written-exam-card";
import {
  getPracticalQuestion,
  getPracticalWrittenExamCardBySlug,
  getPublicPracticalVisualAid,
} from "@/lib/content/practical-repository";

export default async function PracticalWrittenCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = await getPracticalWrittenExamCardBySlug(slug);
  if (!card || card.contentStatus !== "published") notFound();

  const [pastQuestions, predictedQuestions, visualAids] = await Promise.all([
    Promise.all(card.pastQuestionIds.map((id) => getPracticalQuestion(id))),
    Promise.all(
      [...new Set([...card.variantQuestionIds, ...card.predictedQuestionIds])].map(
        (id) => getPracticalQuestion(id),
      ),
    ),
    Promise.all(
      card.visualAidIds.map((id) =>
        getPublicPracticalVisualAid(id, "theory"),
      ),
    ),
  ]);

  return (
    <div className="page-wrap max-w-5xl py-12">
      <nav className="flex flex-wrap gap-2 text-sm font-extrabold">
        <Link
          href="/practical/written/theory?view=exam-type"
          className="rounded-lg border border-slate-200 px-4 py-2 text-[#16697a]"
        >
          기출 유형별 학습
        </Link>
        <Link
          href={`/practical/written/theory/type/${card.primaryFormat}`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-[#16697a]"
        >
          같은 유형 더 풀기
        </Link>
      </nav>
      <PracticalWrittenExamCardView
        card={card}
        pastQuestions={pastQuestions.filter(
          (question): question is NonNullable<typeof question> =>
            Boolean(question),
        )}
        predictedQuestions={predictedQuestions.filter(
          (question): question is NonNullable<typeof question> =>
            Boolean(question),
        )}
        visualAids={visualAids.filter(
          (visualAid): visualAid is NonNullable<typeof visualAid> =>
            Boolean(visualAid),
        )}
      />
    </div>
  );
}
