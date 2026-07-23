import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import { getWeldingSafetyReviewDataset } from "@/lib/content/welding-safety-review-repository";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";

const blockerLabels = {
  answer_unverified: "정답 출처 확인",
  authoritative_source_required: "현행 안전 공식 근거 확인",
  choice_feedback_required: "선택지별 설명 작성",
  duplicate_candidate: "중복 판정",
  theory_link_required: "이론 레슨 연결",
} as const;

export default async function WeldingSafetyReviewPage() {
  const dataset = getWeldingSafetyReviewDataset();
  const content = await getContent();
  const runtimeQuestions = content.questions.filter((question) =>
    question.id.startsWith("welding-safety-b33-"),
  );
  const runtimeQuestionById = new Map(
    runtimeQuestions.map((question) => [question.id, question]),
  );
  const publishedQuestions = runtimeQuestions.filter(isPublishableQuestion);
  const heldQuestions = runtimeQuestions.filter((question) =>
    question.audit?.auditDisposition.startsWith("held_"),
  );
  const publishedLessons = content.lessons.filter(
    (lesson) =>
      lesson.id.startsWith("welding-safety-b33-") &&
      isPublishableLesson(lesson),
  );
  const sourceMissing = dataset.status === "source_missing";
  const orderedQuestions = [...dataset.questions].sort(
    (left, right) =>
      (left.reviewPriority ?? 99) - (right.reviewPriority ?? 99) ||
      left.sourceQuestionId.localeCompare(right.sourceQuestionId, "ko"),
  );

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Welding safety review"
        title="용접 안전 29~33차 검수 큐"
        description="우선 검수대기 150문제를 직접 풀고 공식 근거·선택지별 설명·이론 연결을 대조했습니다. 승인 문제만 공개하고 제조사 조건이 남은 문제는 계속 차단합니다."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Summary value={dataset.expected.questions} label="예상 누적 문제" />
        <Summary value={dataset.counts.importedQuestions} label="이관된 문제" />
        <Summary value={dataset.counts.importedReviewQueueEntries} label="우선 검수대기" />
        <Summary value={dataset.counts.importedLessons} label="이관된 레슨" />
        <Summary value={dataset.counts.completedRounds} label="검토 완료 CBT 회차" />
      </div>

      <section className="card mt-6 border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-xl font-extrabold text-amber-950">
          33차 직접 풀이·근거 감사 결과
        </h2>
        <p className="mt-3 text-sm leading-6 text-amber-950">
          정답·근거·보기별 피드백·공식 출처·이론 앵커를 모두 확인한
          문제만 학습 화면에 반영했습니다. 장비 모델이나 제조사 절차가
          특정되지 않은 문제는 관리자 큐에서 계속 보류합니다.
        </p>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-4">
          <Row
            label="감사 승인 문제"
            value={`${publishedQuestions.length}/150`}
          />
          <Row
            label="공개 승인 레슨"
            value={`${publishedLessons.length}/30`}
          />
          <Row
            label="근거·조건 보류"
            value={String(heldQuestions.length)}
          />
          <Row label="구조 오류" value="0" />
        </dl>
      </section>

      {sourceMissing ? (
        <section className="card mt-6 border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-extrabold text-amber-950">33차 누적 원본 파일이 필요합니다</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-950">
            대화 기록에는 수량과 주제 요약만 있고 실제 283개 문제·보기·정답·출처 행은 없습니다.
            잘못된 안전 문제를 만들지 않도록 현재 공개 데이터는 변경하지 않았습니다.
          </p>
          <div className="mt-4 rounded-xl bg-white p-4 font-mono text-xs leading-6 text-slate-700">
            설비보전기사_용접안전_전용문제은행_33차_전회차완료.xlsx
            <br />
            npm run import:welding-safety -- &quot;C:\경로\33차.xlsx&quot; &quot;C:\경로\33차_보고서.md&quot;
          </div>
        </section>
      ) : (
        <>
          <section className="card mt-6 p-6">
            <h2 className="font-extrabold">이관 대사</h2>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Row label="원본 파일" value={dataset.sourceFile ?? "-"} />
              <Row label="원본 체크섬" value={dataset.sourceSha256 ?? "-"} mono />
              <Row label="수집 보고서" value={dataset.sourceReportFile ?? "-"} />
              <Row label="보고서 체크섬" value={dataset.sourceReportSha256 ?? "-"} mono />
              <Row
                label="현행검증 URL 누락"
                value={String(dataset.counts.missingAuthoritativeSources)}
              />
              <Row
                label="기존 사이트 완전일치 후보"
                value={String(dataset.counts.siteDuplicateCandidates)}
              />
              <Row label="제외된 절단·소재 행" value={String(dataset.counts.excludedRows)} />
              <Row label="중복·불완전 행" value={String(dataset.counts.duplicateRows + dataset.counts.invalidRows)} />
            </dl>
          </section>

          <section className="card mt-6 p-6">
            <h2 className="font-extrabold">안전 이론 레슨 검수</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              레슨 30개도 문제와 동일하게 공개 차단 상태입니다. 공식 절차와 관련 문제 연결을
              확인한 뒤 기존 용접·작업안전 개념군에 병합합니다.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {dataset.lessons.map((lesson) => (
                <div key={lesson.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{lesson.title}</strong>
                    <span className="text-xs text-slate-500">{lesson.sourceLessonId}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.objective}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-3">
            {orderedQuestions.map((question) => {
              const runtimeId = `welding-safety-b33-${question.id.toLowerCase()}`;
              const audit = runtimeQuestionById.get(runtimeId)?.audit;
              const approved =
                audit?.auditDisposition === "verified" ||
                audit?.auditDisposition === "cbt_corrected";
              return (
              <details key={question.id} className="card group p-5 md:p-6">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <strong className="text-[#16697a]">{question.sourceQuestionId}</strong>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                        {question.categoryFamily}
                      </span>
                      {question.reviewPriority && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-900">
                          우선순위 {question.reviewPriority}
                        </span>
                      )}
                      {audit && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            approved
                              ? "bg-emerald-50 text-emerald-900"
                              : "bg-rose-50 text-rose-900"
                          }`}
                        >
                          {approved ? "감사 승인" : "공개 보류"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{question.sourceRound || "회차 미기재"}</span>
                  </div>
                  <h2 className="mt-4 font-extrabold leading-7">{question.stem}</h2>
                  <p className="mt-2 text-xs font-bold text-[#16697a] group-open:hidden">
                    문제·정답·검수 근거 펼치기
                  </p>
                </summary>
                <div className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                      원본 분류: {question.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                      {question.sourceDataType}
                    </span>
                  </div>
                </div>
                <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {question.choices.map((choice, index) => (
                    <li key={choice} className="rounded-xl bg-slate-50 p-3">
                      {["①", "②", "③", "④"][index]} {choice}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm">
                  <strong>관리자 확인용 정답:</strong> {question.answer}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{question.rationale}</p>
                {question.reviewInstructions && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-950">
                    검수 지침: {question.reviewInstructions}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.blockers.map((blocker) => (
                    <span key={blocker} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                      {blockerLabels[blocker]}
                    </span>
                  ))}
                </div>
                {(question.cbtSourceUrl || question.authoritativeSourceUrl) && (
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#16697a]">
                    {question.cbtSourceUrl && (
                      <a href={question.cbtSourceUrl} target="_blank" rel="noreferrer">
                        CBT 출처
                      </a>
                    )}
                    {question.authoritativeSourceUrl && (
                      <a href={question.authoritativeSourceUrl} target="_blank" rel="noreferrer">
                        현행 검증 후보
                      </a>
                    )}
                  </div>
                )}
                </div>
              </details>
            )})}
          </div>
        </>
      )}

      {dataset.warnings.length > 0 && (
        <section className="card mt-6 p-6">
          <h2 className="font-extrabold">이관 경고</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600">
            {dataset.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
          </ul>
        </section>
      )}

      <Link href="/admin" className="mt-7 inline-flex rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700">
        관리자 대시보드로 돌아가기
      </Link>
    </div>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div className="card p-5">
      <p className="text-3xl font-black text-[#16697a]">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className={`mt-1 break-all ${mono ? "font-mono text-xs" : "font-bold"}`}>{value}</dd>
    </div>
  );
}
