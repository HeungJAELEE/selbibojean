import Link from "next/link";
import { ArrowRight, BookOpen, Layers3 } from "lucide-react";
import {
  getPracticalTextbookPlacement,
  type PracticalTextbookStudyTypeId,
  type PracticalTextbookSubjectId,
  type PracticalTextbookSubject,
  type PracticalTextbookStudyType,
} from "@/data/source/practical-textbook-taxonomy";
import type { PracticalConcept } from "@/lib/domain/practical-types";

type PracticalTextbookSubjectPanelProps = {
  subject: PracticalTextbookSubject;
  studyTypes: readonly PracticalTextbookStudyType[];
  concepts: PracticalConcept[];
};

const SUBJECT_ACCENTS: Record<
  PracticalTextbookSubjectId,
  { color: string; label: string }
> = {
  "subject-1": { color: "#16697a", label: "공유압·자동제어" },
  "subject-2": { color: "#b45309", label: "용접·안전관리" },
  "subject-3": { color: "#4d7c0f", label: "기계설비 일반" },
  "subject-4": { color: "#6d28d9", label: "설비진단·관리" },
};

/**
 * 기존 필기 이론 목차와 같은 밀도의 과목 패널이다.
 * 실기는 문제유형 카드가 아니라, NCS 원문 위치를 같이 보여 주는 세부 개념 행으로 구성한다.
 */
export function PracticalTextbookSubjectPanel({
  subject,
  studyTypes,
  concepts,
}: PracticalTextbookSubjectPanelProps) {
  const accent = SUBJECT_ACCENTS[subject.id];
  const examLinkedConceptCount = concepts.filter(
    (concept) => concept.contentRole === "exam_linked",
  ).length;
  const supplementalConceptCount = concepts.length - examLinkedConceptCount;

  return (
    <section
      id={subject.id}
      data-testid={`practical-textbook-subject-${subject.id}`}
      className="card scroll-mt-28 overflow-hidden"
    >
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:p-8">
        <div className="flex items-center gap-4">
          <span
            className="grid size-12 place-items-center rounded-xl text-white"
            style={{ backgroundColor: accent.color }}
            aria-hidden="true"
          >
            <BookOpen size={21} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-500">{subject.code}</p>
            <h2 className="text-2xl font-extrabold">{subject.title}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          출제연결 {examLinkedConceptCount}개
          {supplementalConceptCount > 0
            ? ` · NCS 직접 보강 ${supplementalConceptCount}개`
            : ""}
          {` · 학습 항목 ${concepts.length}개 · 학습유형 ${studyTypes.length}개`}
        </p>
      </header>

      <div className="grid gap-0 md:grid-cols-2">
        {studyTypes.map((studyType, index) => {
          const typeConcepts = conceptsForStudyType(concepts, studyType.id);
          const href = `/practical/written/theory/subject/${subject.id}/${studyType.id}`;

          return (
            <div
              key={studyType.id}
              className={`border-b border-slate-200 p-5 md:p-6 ${
                index % 2 === 0 ? "md:border-r" : ""
              }`}
            >
              <Link
                href={href}
                data-testid={`practical-textbook-type-${subject.id}-${studyType.id}`}
                className="group/type flex items-center justify-between gap-3 rounded-lg py-1 text-left"
              >
                <span>
                  <span className="block text-xs font-black" style={{ color: accent.color }}>
                    {studyType.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {studyType.description}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-500">
                  세부 {typeConcepts.length}개
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="text-[#16697a] transition-transform group-hover/type:translate-x-1"
                  />
                </span>
              </Link>

              {typeConcepts.length > 0 ? (
                <ul className="mt-4 grid gap-1 border-t border-slate-100 pt-2">
                  {typeConcepts.map((concept) => (
                    <li key={concept.id}>
                      <Link
                        href={`${href}#${concept.id}`}
                        data-testid={`practical-textbook-concept-${subject.id}-${studyType.id}-${concept.id}`}
                        className="group/concept flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-[#eaf7f6] hover:text-[#16697a]"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <Layers3 size={14} aria-hidden="true" />
                            <span className="font-semibold">{concept.title}</span>
                            {concept.contentRole === "supplemental" ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                                (+보강용)
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block pl-6 text-xs text-slate-400">
                            {ncsPositionLabel(concept)}
                          </span>
                        </span>
                        <ArrowRight
                          size={14}
                          aria-hidden="true"
                          className="shrink-0 opacity-0 transition group-hover/concept:translate-x-1 group-hover/concept:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-400">
                  {studyType.id === "formula"
                    ? "NCS 원문에서 식·단위·적용조건을 함께 확인한 계산식이 아직 없습니다."
                    : "NCS 원문 위치가 확인된 세부 개념을 준비 중입니다."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function conceptsForStudyType(
  concepts: PracticalConcept[],
  studyTypeId: PracticalTextbookStudyTypeId,
) {
  return concepts
    .filter((concept) => {
      const placement = getPracticalTextbookPlacement(concept.id);
      if (!placement?.studyTypeIds.includes(studyTypeId)) return false;

      // `계산 공식`에는 등식과 단위·조건 설명이 있는 실제 계산 항목만 둔다.
      return studyTypeId !== "formula" || concept.formula.some((item) => item.includes("="));
    })
    .sort((left, right) => {
      const leftPage = left.ncsSources[0]?.pdfPage ?? Number.MAX_SAFE_INTEGER;
      const rightPage = right.ncsSources[0]?.pdfPage ?? Number.MAX_SAFE_INTEGER;
      return leftPage - rightPage || left.title.localeCompare(right.title, "ko");
    });
}

function ncsPositionLabel(concept: PracticalConcept) {
  const placement = getPracticalTextbookPlacement(concept.id);
  const source = concept.ncsSources[0];
  if (placement?.sourceEvidence === "review_required" || !source) {
    return "NCS 원문 위치 검토 필요";
  }

  const pages = [
    source.pdfPage ? `PDF p.${source.pdfPage}` : null,
    source.printedPage ? `인쇄 p.${source.printedPage}` : null,
  ].filter(Boolean);
  return `${source.documentTitle} · ${pages.join(" / ")}`;
}
