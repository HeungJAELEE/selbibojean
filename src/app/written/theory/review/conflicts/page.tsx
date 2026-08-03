import Link from "next/link";

import { ConflictTheoryReview } from "@/components/conflict-theory-review";
import { PageHeading } from "@/components/page-heading";
import { selectConflictTheoryReviewItems } from "@/lib/content/conflict-theory-review";
import { getContent } from "@/lib/content/repository";

const SUBJECT_IDS = [
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
] as const;

type SubjectId = (typeof SUBJECT_IDS)[number];

export default async function ConflictTheoryReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string; page?: string }>;
}) {
  const params = await searchParams;
  const subjectId = SUBJECT_IDS.includes(params.subjectId as SubjectId)
    ? (params.subjectId as SubjectId)
    : "subject-1";
  const content = await getContent();
  const subject = content.subjects.find((candidate) => candidate.id === subjectId);
  const allItems = selectConflictTheoryReviewItems(content, { subjectId });
  const pageSize = 30;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(allItems.length / pageSize));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const items = allItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="Ungraded review"
        title="조건부 참고·비채점 문항"
        description="공식 근거를 조회한 뒤에도 네 선택지를 모두 확정하기 어려운 법령·안전 문항과 정답 이견·필수 조건 누락 문항을 참고용으로 확인합니다. 모의고사 점수와 오답 통계에는 포함하지 않습니다."
        action={(
          <Link
            href={`/written/theory/subject/${subjectId}#${subjectId}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold"
          >
            {subject?.code ?? "선택"}과목 이론으로
          </Link>
        )}
      />

      <nav
        aria-label="검토 문항 과목 선택"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 md:grid-cols-4"
      >
        {content.subjects.map((candidate) => {
          const current = candidate.id === subjectId;
          return (
            <Link
              key={candidate.id}
              href={`/written/theory/review/conflicts?subjectId=${candidate.id}`}
              aria-current={current ? "page" : undefined}
              className={`rounded-xl px-3 py-3 text-center text-sm font-extrabold ${
                current
                  ? "bg-[#173957] text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-[#eaf7f6]"
              }`}
            >
              {candidate.code}과목
            </Link>
          );
        })}
      </nav>

      {items.length > 0 ? (
        <>
          <p className="mt-6 text-sm font-bold text-slate-600">
            조건부 참고 문항 {allItems.length}개 · {currentPage}/{pageCount}쪽
          </p>
          <ConflictTheoryReview items={items} />
          {pageCount > 1 && (
            <nav
              aria-label="조건부 참고 문항 페이지"
              className="mt-6 flex items-center justify-between gap-3"
            >
              {currentPage > 1 ? (
                <Link
                  href={`/written/theory/review/conflicts?subjectId=${subjectId}&page=${currentPage - 1}`}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold"
                >
                  이전 30문항
                </Link>
              ) : <span />}
              {currentPage < pageCount ? (
                <Link
                  href={`/written/theory/review/conflicts?subjectId=${subjectId}&page=${currentPage + 1}`}
                  className="rounded-xl bg-[#173957] px-4 py-3 font-bold text-white"
                >
                  다음 30문항
                </Link>
              ) : <span />}
            </nav>
          )}
        </>
      ) : (
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="font-extrabold text-emerald-900">
            현재 공개할 조건부 참고 문항이 없습니다.
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900/80">
            그림 누락, 답안 누출 위험, 근거가 전혀 없는 문항은 이 화면에도
            노출하지 않고 계속 HOLD합니다.
          </p>
        </section>
      )}
    </main>
  );
}
