import { ChevronDown, FileQuestion, ShieldCheck } from "lucide-react";
import { BdaLearningItemPractice } from "@/components/bda-learning-item-practice";
import { BdaPracticeQuestion } from "@/components/bda-practice-question";
import type { PublicBdaQuestion } from "@/lib/domain/bda";
import type { PublicBdaQbankLearningItem } from "@/lib/domain/bda-qbank";

export function BdaLinkedPracticeSet({
  verifiedQuestions,
  learningItems,
  heldLearningCount = 0,
}: {
  verifiedQuestions: PublicBdaQuestion[];
  learningItems: PublicBdaQbankLearningItem[];
  heldLearningCount?: number;
}) {
  const totalCount = verifiedQuestions.length + learningItems.length;

  if (totalCount === 0) {
    return (
      <p className="mt-6 rounded-xl bg-white/10 p-5 text-sm text-slate-200">
        {heldLearningCount
          ? `연결 항목 ${heldLearningCount}건은 재검수 HOLD 상태입니다. 정답 검수가 끝난 문제만 이 위치에 공개됩니다.`
          : "이 레슨의 연결 문제는 검수 후 순차적으로 공개됩니다."}
      </p>
    );
  }

  return (
    <details className="group mt-6" data-testid="bda-linked-practice-set">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-white/15 bg-white/10 p-5 font-black text-white transition hover:bg-white/15 [&::-webkit-details-marker]:hidden">
        <span>
          연결 문제 {totalCount}개 펼쳐서 풀기
          <small className="mt-1 block font-medium text-slate-300">
            검증 객관식 {verifiedQuestions.length}개 · 복원 기반 학습문제{" "}
            {learningItems.length}개
          </small>
        </span>
        <ChevronDown className="shrink-0 transition group-open:rotate-180" />
      </summary>

      <div className="mt-4 space-y-6 rounded-2xl bg-slate-50 p-4 text-slate-900 sm:p-6">
        {verifiedQuestions.length ? (
          <section>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />
              <div>
                <h3 className="font-black text-[#142f4b]">
                  검증 완료 객관식
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  선택지를 제출한 뒤에만 정답과 보기별 근거가 표시됩니다.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {verifiedQuestions.map((question, index) => (
                <details
                  key={question.id}
                  className="rounded-2xl border border-slate-200 bg-white"
                >
                  <summary className="cursor-pointer list-none px-4 py-4 font-black text-[#142f4b] [&::-webkit-details-marker]:hidden">
                    객관식 {index + 1}. {question.stem}
                  </summary>
                  <div className="border-t border-slate-200 p-3 sm:p-4">
                    <BdaPracticeQuestion question={question} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {learningItems.length ? (
          <section>
            <div className="flex items-start gap-3">
              <FileQuestion className="mt-0.5 shrink-0 text-[#0f766e]" />
              <div>
                <h3 className="font-black text-[#142f4b]">
                  공개 복원·교재 기반 실전형 4지선다
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  질문 본문과 보기 4개를 모두 제공합니다. 보기를 선택해
                  제출한 뒤에만 정답과 해설이 표시됩니다.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {learningItems.map((item, index) => (
                <details
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white"
                >
                  <summary className="cursor-pointer list-none px-4 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="text-xs font-black text-[#0f766e]">
                      학습문제 {index + 1} · {item.id}
                    </span>
                    <strong className="mt-1 block leading-7 text-[#142f4b]">
                      {item.topicSummary}
                    </strong>
                  </summary>
                  <div className="border-t border-slate-200 p-4">
                    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      <span>{item.platform}</span>
                      <span>{item.examRound}</span>
                      <span>{item.questionMode}</span>
                      <span>근거등급 {item.evidenceGrade ?? "C"}</span>
                    </div>
                    <BdaLearningItemPractice item={item} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}
        {heldLearningCount ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            재검수 대기 {heldLearningCount}건은 출처·개념 연결만 보존하고
            있습니다. 정답·선택지 검수가 끝나기 전에는 채점형 문제로
            공개하지 않습니다.
          </p>
        ) : null}
      </div>
    </details>
  );
}
