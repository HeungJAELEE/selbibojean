import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Layers3 } from "lucide-react";
import { conceptGroups } from "@/lib/domain/catalog";
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

export type PracticalTextbookConceptFamily = {
  id: string;
  title: string;
  order: number;
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
 * 실기 필답형 목차는 필기 교재처럼 개념을 먼저 고른다.
 * 과목 → 세부 개념군 → 개념 → 고정 학습유형 6개 순서로 보여 주므로,
 * 같은 개념의 정의·계산·순서·그림·도면·판정 항목이 흩어지지 않는다.
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
  const conceptFamilies = getPracticalTextbookConceptFamilies(concepts);

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
          출제 연결 {examLinkedConceptCount}개
          {supplementalConceptCount > 0
            ? ` · NCS 보강 ${supplementalConceptCount}개`
            : ""}
          {` · 학습 항목 ${concepts.length}개 · 학습유형 ${studyTypes.length}개`}
        </p>
      </header>

      <div className="grid gap-0 md:grid-cols-2">
        {conceptFamilies.map((family, index) => (
          <PracticalTextbookConceptFamilyPanel
            key={family.id}
            subject={subject}
            studyTypes={studyTypes}
            family={family}
            defaultOpen={index < 2}
            className={index % 2 === 0 ? "md:border-r" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export function PracticalTextbookConceptFamilyPanel({
  subject,
  studyTypes,
  family,
  defaultOpen = false,
  className,
}: {
  subject: PracticalTextbookSubject;
  studyTypes: readonly PracticalTextbookStudyType[];
  family: PracticalTextbookConceptFamily;
  defaultOpen?: boolean;
  className?: string;
}) {
  const accent = SUBJECT_ACCENTS[subject.id];

  return (
    <details
      data-testid={`practical-textbook-family-${subject.id}-${family.id}`}
      className={`group/family border-b border-slate-200 bg-white open:bg-slate-50 ${className ?? ""}`}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-5 marker:hidden md:p-6">
        <div>
          <p className="text-xs font-black" style={{ color: accent.color }}>
            세부 개념군
          </p>
          <h3 className="mt-1 text-base font-extrabold text-slate-900">
            {family.title}
          </h3>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-500">
          개념 {family.concepts.length}개
          <ChevronDown
            size={15}
            aria-hidden="true"
            className="transition group-open/family:rotate-180"
          />
        </span>
      </summary>

      <div className="border-t border-slate-200 p-5 md:p-6">
        <div className="space-y-3">
          {family.concepts.map((concept) => (
            <ConceptStudyTypeSlots
              key={concept.id}
              accentColor={accent.color}
              subjectId={subject.id}
              familyId={family.id}
              studyTypes={studyTypes}
              concept={concept}
            />
          ))}
        </div>
      </div>
    </details>
  );
}

function ConceptStudyTypeSlots({
  accentColor,
  subjectId,
  familyId,
  studyTypes,
  concept,
}: {
  accentColor: string;
  subjectId: PracticalTextbookSubjectId;
  familyId: string;
  studyTypes: readonly PracticalTextbookStudyType[];
  concept: PracticalConcept;
}) {
  const availableStudyTypeCount = studyTypes.filter((studyType) =>
    conceptSupportsStudyType(concept, studyType.id),
  ).length;

  return (
    <article
      data-testid={`practical-textbook-concept-card-${subjectId}-${familyId}-${concept.id}`}
      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
    >
      <Link
        href={`/practical/written/theory/${concept.id}`}
        data-testid={`practical-textbook-concept-link-${subjectId}-${familyId}-${concept.id}`}
        className="group/integrated flex items-start gap-3 rounded-xl bg-[#eaf7f6] p-4 text-[#173957] transition hover:bg-[#dff2f0]"
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg text-white"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        >
          <Layers3 size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-xs font-black uppercase tracking-[.12em]"
            style={{ color: accentColor }}
          >
            통합 학습
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <strong className="text-base text-slate-900">
              {concept.title} 묶어서 이해하기
            </strong>
            {concept.contentRole === "supplemental" ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                (+보강용)
              </span>
            ) : null}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-600">
            개념 정의 → 핵심 원리 → 계산·작업 순서 → 그림·도면 → 실무·시험 판단
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {ncsPositionLabel(concept)}
          </span>
        </span>
        <span className="mt-2 flex shrink-0 items-center gap-2 text-xs font-bold text-slate-500">
          유형 {availableStudyTypeCount}/{studyTypes.length}
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="text-[#16697a] transition group-hover/integrated:translate-x-1"
          />
        </span>
      </Link>

      <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-2">
        {studyTypes.map((studyType) => {
          const hasContent = conceptSupportsStudyType(concept, studyType.id);
          const testId = `practical-textbook-concept-type-${subjectId}-${familyId}-${concept.id}-${studyType.id}`;

          if (!hasContent) {
            return (
              <div
                key={studyType.id}
                data-testid={testId}
                aria-disabled="true"
                className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 text-sm text-slate-400"
              >
                <span>{studyType.title}</span>
                <span aria-hidden="true">—</span>
              </div>
            );
          }

          return (
            <Link
              key={studyType.id}
              href={`/practical/written/theory/subject/${subjectId}/${studyType.id}#${concept.id}`}
              data-testid={testId}
              className="group/type-slot flex min-h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-[#16697a] hover:bg-[#eaf7f6] hover:text-[#16697a]"
            >
              <span>{studyType.title}</span>
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="shrink-0 text-[#16697a] transition-transform group-hover/type-slot:translate-x-1"
              />
            </Link>
          );
        })}
      </div>
    </article>
  );
}

function conceptSupportsStudyType(
  concept: PracticalConcept,
  studyTypeId: PracticalTextbookStudyTypeId,
) {
  const placement = getPracticalTextbookPlacement(concept.id);
  if (!placement?.studyTypeIds.includes(studyTypeId)) return false;

  // 계산 공식에는 실제 식과 단위·적용조건을 설명할 수 있는 항목만 둔다.
  return studyTypeId !== "formula" || concept.formula.some((item) => item.includes("="));
}

export function getPracticalTextbookConceptFamilies(
  concepts: PracticalConcept[],
): PracticalTextbookConceptFamily[] {
  const families = new Map<string, PracticalTextbookConceptFamily>();

  for (const concept of concepts) {
    const group = conceptGroups.find((candidate) => candidate.id === concept.groupLabel);
    const id = group?.id ?? concept.groupLabel ?? "ncs-common";
    const title = group?.title ?? concept.groupLabel ?? "NCS 공통 개념";
    const order = group?.order ?? Number.MAX_SAFE_INTEGER;
    const family = families.get(id) ?? { id, title, order, concepts: [] };
    family.concepts.push(concept);
    families.set(id, family);
  }

  return [...families.values()]
    .map((family) => ({
      ...family,
      concepts: [...family.concepts].sort((left, right) => {
        const leftPage = left.ncsSources[0]?.pdfPage ?? Number.MAX_SAFE_INTEGER;
        const rightPage = right.ncsSources[0]?.pdfPage ?? Number.MAX_SAFE_INTEGER;
        return leftPage - rightPage || left.title.localeCompare(right.title, "ko");
      }),
    }))
    .sort((left, right) =>
      left.order - right.order || left.title.localeCompare(right.title, "ko"),
    );
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
