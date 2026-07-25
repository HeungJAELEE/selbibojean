import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { PracticalTextbookSubjectPanel } from "@/components/practical-textbook-index";
import {
  getPracticalContent,
  getPracticalNcsCoverage,
  getPracticalTextbookStudyTypes,
  getPracticalTextbookSubjects,
  practicalConceptsByTextbookSubject,
} from "@/lib/content/practical-repository";
import type {
  PracticalConcept,
  PracticalNcsCoverage,
} from "@/lib/domain/practical-types";

export default async function PracticalTheoryPage() {
  const [subjects, studyTypes, ncsCoverage, practicalContent] = await Promise.all([
    getPracticalTextbookSubjects(),
    getPracticalTextbookStudyTypes(),
    getPracticalNcsCoverage(),
    getPracticalContent(),
  ]);
  const conceptsById = new Map(
    practicalContent.concepts.map((concept) => [concept.id, concept]),
  );

  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="실기 필답형 · NCS 기반 학습 목차"
        title="실기 이론 목차"
        description="필기 이론 목차처럼 과목과 세부 개념군을 먼저 고르고, 각 개념의 통합 학습에서 전체를 이해한 뒤 개념 정의·계산 공식·순서 맞추기·그림 맞추기·도면·기호 맞추기·기타 유형을 확인합니다. 빈 행은 아직 NCS 원문으로 확인해 등록한 학습 항목이 없는 유형입니다."
      />

      <section
        data-testid="practical-textbook-learning-types"
        className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 md:p-6"
      >
        <h2 className="text-base font-extrabold text-teal-950">
          과목별로 공부할 출제 유형
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">
          실제 실기 필답형은 같은 개념을 정의·계산·작업순서·사진·도면·안전 판단으로 바꾸어 묻습니다. 아래에서는 세부 개념군과 개념을 먼저 찾고, 그 아래에 같은 여섯 유형을 고정해 두었습니다.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {studyTypes.map((studyType) => (
            <div
              key={studyType.id}
              className="rounded-xl border border-teal-100 bg-white px-3 py-3"
            >
              <p className="text-sm font-extrabold text-teal-950">
                {studyType.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {studyType.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 space-y-8">
        {subjects.map((subject) => (
          <PracticalTextbookSubjectPanel
            key={subject.id}
            subject={subject}
            studyTypes={studyTypes}
            concepts={practicalConceptsByTextbookSubject(subject.id)}
          />
        ))}
      </div>

      <NcsSourceAudit coverage={ncsCoverage} conceptsById={conceptsById} />
    </div>
  );
}

function NcsSourceAudit({
  coverage,
  conceptsById,
}: {
  coverage: PracticalNcsCoverage;
  conceptsById: Map<string, PracticalConcept>;
}) {
  return (
    <details
      data-testid="practical-ncs-source-audit"
      className="group mt-10 rounded-2xl border border-sky-200 bg-white p-5 shadow-sm md:p-6"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 marker:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-sky-700">
            NCS SOURCE COVERAGE
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">
            근거 확인용: NCS 원문 11종 대조 현황
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            학습 목차는 위에서 먼저 확인하고, 문서별 반영 범위·보류 사유·원문 링크가 필요할 때만 이 참고표를 펼치세요.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs sm:min-w-56">
          <div className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-900">
            <span className="block text-lg">
              {coverage.summary.accountedDocuments}/{coverage.summary.totalDocuments}
            </span>
            원문 대조
          </div>
          <div className="rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-800">
            <span className="block text-lg">
              {coverage.summary.uniqueLessonCount}
            </span>
            연결 레슨
          </div>
        </div>
      </summary>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {coverage.documents.map((document) => (
          <article
            key={document.ncsCode}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{document.documentTitle}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {document.ncsCode} · {document.version}
                </p>
              </div>
              <span
                className={
                  document.status === "covered"
                    ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                    : document.status === "covered_with_holds"
                      ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"
                      : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700"
                }
              >
                {document.status === "covered"
                  ? "학습 반영"
                  : document.status === "covered_with_holds"
                    ? "반영·일부 보류"
                    : "보류"}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              연결 레슨 <strong>{document.conceptIds.length}개</strong> · 원문 참조{" "}
              <strong>{document.sourceReferenceCount}건</strong>
            </p>
            <a
              className="mt-3 inline-flex text-sm font-bold text-sky-700 underline underline-offset-4"
              href={document.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              NCS 원문 위치 확인
            </a>
            {document.conceptIds.length > 0 ? (
              <details className="mt-3 rounded-lg border border-sky-200 bg-white px-3 py-2">
                <summary className="cursor-pointer text-sm font-bold text-sky-950">
                  이 문서에서 반영한 레슨 {document.conceptIds.length}개 보기
                </summary>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {document.conceptIds.map((conceptId) => {
                    const concept = conceptsById.get(conceptId);
                    if (!concept) return null;
                    return (
                      <li key={conceptId}>
                        <Link
                          href={`/practical/written/theory/${concept.id}`}
                          className="block rounded-md border border-sky-100 bg-sky-50 px-2.5 py-2 font-medium text-sky-950 transition hover:border-sky-300 hover:bg-sky-100"
                        >
                          <span className="block truncate">{concept.title}</span>
                          <span className="mt-0.5 block text-xs text-sky-700">
                            {concept.contentRole === "supplemental"
                              ? "NCS 보강용"
                              : "실기 출제 연결"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ) : null}
            {document.heldItems.length > 0 ? (
              <details className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <summary className="cursor-pointer text-sm font-bold text-amber-950">
                  공개 보류 {document.heldItems.length}건 보기
                </summary>
                <ul className="mt-3 space-y-3 text-sm text-amber-950">
                  {document.heldItems.map((item) => (
                    <li key={item.id}>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5">
                        PDF {item.pdfPages} / 인쇄 {item.printedPages}
                      </p>
                      <p className="mt-1 leading-6">{item.rationale}</p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        다음 조치: {item.nextAction}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </article>
        ))}
      </div>
    </details>
  );
}
