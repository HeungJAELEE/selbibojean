import { notFound } from "next/navigation";
import Link from "next/link";
import { SingleQuestion } from "@/components/single-question";
import { getQuestion } from "@/lib/content/repository";
import { isPublishableQuestion, toPublicQuestion } from "@/lib/domain/practice";

export default async function QuestionPage({params}:{params:Promise<{questionId:string}>}) { const {questionId}=await params; const question=await getQuestion(questionId); if(!question||!isPublishableQuestion(question)) notFound(); return <div className="page-wrap max-w-4xl py-10"><Link href="/written/practice" className="text-sm font-bold text-slate-500">← 문제풀이 홈</Link><div className="mt-6"><SingleQuestion question={toPublicQuestion(question)}/></div></div>; }

