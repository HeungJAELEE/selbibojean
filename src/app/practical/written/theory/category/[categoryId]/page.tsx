import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { PracticalQuestionList } from "@/components/practical-question-list";
import { PracticalLabelBadges } from "@/components/practical-label-badges";
import {
  getPracticalStudyCategory,
  practicalConceptsByCategory,
  publicPracticalQuestionsByCategory,
} from "@/lib/content/practical-repository";
import type {
  PracticalConcept,
  PracticalStudyCategoryId,
} from "@/lib/domain/practical-types";

const CATEGORY_IDS = new Set<PracticalStudyCategoryId>([
  "visual_identification",
  "formula_calculation",
  "theory_concept",
  "work_procedure",
]);

export default async function PracticalTheoryCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId: rawCategoryId } = await params;
  if (!CATEGORY_IDS.has(rawCategoryId as PracticalStudyCategoryId)) {
    notFound();
  }
  const categoryId = rawCategoryId as PracticalStudyCategoryId;
  const category = await getPracticalStudyCategory(categoryId);
  if (!category) notFound();

  const concepts = practicalConceptsByCategory(categoryId);
  const pastQuestions = publicPracticalQuestionsByCategory(categoryId, "past");
  const predictedQuestions = publicPracticalQuestionsByCategory(
    categoryId,
    "predicted",
  );
  const sources = uniqueSources(concepts);

  return (
    <div className="page-wrap max-w-6xl py-12">
      <PageHeading
        eyebrow={`NCS 실기 필답 · ${category.shortTitle}`}
        title={category.title}
        description={category.description}
      />

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <h2 className="text-lg font-extrabold">NCS 학습 순서</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">
            {category.ncsLearningFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-extrabold">실기에서 묻는 방식</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
            {category.examMethods.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-xs font-extrabold text-[#8f3f0a]">
          1. NCS 원문 근거
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          연결 학습모듈과 수행내용
        </h2>
        <div className="mt-5 grid gap-3">
          {sources.map((source) => (
            <a
              key={`${source.ncsCode}-${source.pdfPage}-${source.figureNumber}`}
              href={source.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#16697a]"
            >
              <strong>
                NCS {source.documentTitle} · {source.ncsCode}
              </strong>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                {source.performanceCriteria}
                {source.pdfPage ? ` · PDF p.${source.pdfPage}` : ""}
                {source.printedPage ? ` / 인쇄 p.${source.printedPage}` : ""}
                {source.figureNumber ? ` · ${source.figureNumber}` : ""}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <p className="text-xs font-extrabold text-[#8f3f0a]">
          2. 개념과 판단 기준
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          관련 실기 이론 {concepts.length}개
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {concepts.map((concept) => (
            <Link
              key={concept.id}
              href={`/practical/written/theory/${concept.id}`}
              className="card p-6 hover:border-[#16697a]"
            >
              <PracticalLabelBadges labels={concept.labels} />
              <h3 className="mt-3 text-lg font-extrabold">{concept.title}</h3>
              <p className="mt-2 text-xs font-bold text-[#8f3f0a]">
                {concept.groupLabel}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {conceptSummary(categoryId, concept)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-200 pt-10">
        <p className="text-xs font-extrabold text-[#8f3f0a]">
          3. 실제 복원으로 확인
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          기출복원 {pastQuestions.length}문제
        </h2>
        <PracticalQuestionList questions={pastQuestions} />
      </section>

      <section className="mt-12 border-t border-slate-200 pt-10">
        <p className="text-xs font-extrabold text-[#8f3f0a]">
          4. 같은 원리로 확장
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          출제예상 {predictedQuestions.length}문제
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          예상문제는 실제 회차와 출제횟수를 부여하지 않으며 기출통계에
          포함하지 않습니다.
        </p>
        <PracticalQuestionList questions={predictedQuestions} />
      </section>
    </div>
  );
}

function conceptSummary(
  categoryId: PracticalStudyCategoryId,
  concept: PracticalConcept,
) {
  if (categoryId === "visual_identification") {
    return [...concept.components, ...concept.examFormats].filter(Boolean).slice(0, 2).join(" · ") || concept.definition;
  }
  if (categoryId === "formula_calculation") {
    return concept.formula.filter(Boolean).slice(0, 2).join(" · ") || concept.principle;
  }
  if (categoryId === "work_procedure") {
    return [...concept.procedure, ...concept.safety].filter(Boolean).slice(0, 2).join(" · ") || concept.principle;
  }
  return [concept.definition, concept.principle].filter(Boolean).slice(0, 2).join(" · ");
}

function uniqueSources(concepts: PracticalConcept[]) {
  const seen = new Set<string>();
  return concepts
    .flatMap((concept) => concept.ncsSources)
    .filter((source) => {
      const key = `${source.ncsCode}-${source.pdfPage}-${source.figureNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

