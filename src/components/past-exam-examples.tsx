import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, History } from "lucide-react";
import type { PastExamExample, PastExamFormat } from "@/lib/content/past-exam-examples";

const CHOICE_MARKS = ["①", "②", "③", "④", "⑤"];
const FORMAT_LABELS: Record<PastExamFormat, string> = {
  calculation: "계산·적용형",
  diagnosis: "사례·진단형",
  negative: "부정형 판별",
  concept: "개념·구분형",
};

export function PastExamExamples({ examples }: { examples: PastExamExample[] }) {
  if (examples.length === 0) return null;

  return (
    <section id="past-exams" className="mt-9 scroll-mt-28 rounded-2xl border border-[#b9d9d7] bg-[#f2fbfa] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#16697a] text-white">
          <History size={19} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">Step 2 · CBT original questions</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">실제 기출 원문으로 확인하기</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            방금 익힌 개념이 실제 시험에서 어떻게 묻혔는지 확인하세요. 계산·진단·부정형 문항을 우선 배치했고,
            스스로 판단할 수 있도록 정답은 먼저 노출하지 않습니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {examples.map((example, index) => (
          <details
            key={example.externalId}
            open={index === 0}
            data-testid={`past-exam-${example.externalId}`}
            className="group rounded-xl border border-slate-200 bg-white px-4 py-3 open:border-[#6fb5b1]"
          >
            <summary className="cursor-pointer list-none marker:hidden">
              <span className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-[#173957] px-2.5 py-1 text-white">실제 기출</span>
                <span className="rounded-full bg-[#fff2e8] px-2.5 py-1 text-[#8f3f0a]">{FORMAT_LABELS[example.format]}</span>
                <span className="text-slate-500">{formatExamLabel(example)}</span>
              </span>
              <span className="mt-3 block pr-5 font-extrabold leading-7 text-[#173957]">{example.stem}</span>
              <span className="mt-2 block text-xs font-bold text-[#16697a] group-open:hidden">보기 펼치기</span>
            </summary>

            <ol className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
              {example.choices.map((choice, choiceIndex) => (
                <li key={`${example.externalId}-${choiceIndex}`} className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                  <span className="font-bold text-[#16697a]">{CHOICE_MARKS[choiceIndex] ?? choiceIndex + 1}</span>
                  <span>{choice}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <a
                href={example.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#16697a]"
              >
                원문 출처 <ArrowUpRight size={13} />
              </a>
              <Link
                href={`/written/practice/${example.canonicalId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#173957] px-3 py-2 text-xs font-extrabold text-white"
              >
                <BookOpenCheck size={14} /> 이 개념 실전 문제 풀기
              </Link>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function formatExamLabel(example: PastExamExample) {
  const number = example.questionNumber ? ` · ${example.questionNumber}번` : "";
  return `${example.year}년 ${example.sessionLabel}${number}`;
}
