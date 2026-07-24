import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BdaPracticeQuestion } from "@/components/bda-practice-question";
import {
  getBdaContent,
  getBdaQuestion,
  getBdaSubject,
} from "@/lib/content/bda-repository";
import { toPublicBdaQuestion } from "@/lib/domain/bda";

type Props = { params: Promise<{ questionId: string }> };

export function generateStaticParams() {
  return getBdaContent().questions.map((question) => ({
    questionId: question.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { questionId } = await params;
  const question = getBdaQuestion(questionId);
  return {
    title: question ? `${question.id} 개념문제` : "개념문제",
  };
}

export default async function BdaQuestionPage({ params }: Props) {
  const { questionId } = await params;
  const question = getBdaQuestion(questionId);
  if (!question) notFound();
  const subject = getBdaSubject(question.subjectId);

  return (
    <main className="page-wrap pb-16">
      <div className="py-8">
        <Link
          href="/bda/written/practice"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0f766e]"
        >
          <ArrowLeft size={16} /> 문제 목록
        </Link>
      </div>
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-black text-[#0f766e]">
          제{subject?.order}과목 · {subject?.title}
        </p>
        <BdaPracticeQuestion question={toPublicBdaQuestion(question)} />
      </div>
    </main>
  );
}
