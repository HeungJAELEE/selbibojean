import Link from "next/link";
import type {
  PublicPracticalQuestion,
  PracticalStudyCategory,
} from "@/lib/domain/practical-types";
import { PracticalQuestionList } from "./practical-question-list";

export function PracticalQuestionSections({
  categories,
  questions,
  showTheoryLink = true,
}: {
  categories: PracticalStudyCategory[];
  questions: PublicPracticalQuestion[];
  showTheoryLink?: boolean;
}) {
  return (
    <div className="mt-10 grid gap-12">
      {categories.map((category) => {
        const items = questions.filter(
          (question) =>
            question.primaryStudyCategoryId === category.id,
        );
        if (items.length === 0) return null;
        return (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-24"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-extrabold text-[#8f3f0a]">
                NCS 학습유형 · {items.length}문제
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold">{category.title}</h2>
                {showTheoryLink ? (
                  <Link
                    href={`/practical/written/theory/category/${category.id}`}
                    className="text-sm font-extrabold text-[#16697a] underline"
                  >
                    NCS 이론 먼저 보기 →
                  </Link>
                ) : null}
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                {category.description}
              </p>
            </div>
            <PracticalQuestionList questions={items} />
          </section>
        );
      })}
    </div>
  );
}
