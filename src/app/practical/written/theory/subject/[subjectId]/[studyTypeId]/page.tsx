import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { conceptGroups } from "@/lib/domain/catalog";
import {
  getPracticalTextbookPlacementForConcept,
  getPracticalTextbookStudyType,
  getPracticalTextbookSubject,
  practicalConceptsByTextbookSubjectAndType,
} from "@/lib/content/practical-repository";
import type {
  PracticalTextbookSourceEvidence,
  PracticalTextbookStudyTypeId,
  PracticalTextbookSubjectId,
} from "@/data/source/practical-textbook-taxonomy";
import type { PracticalConcept, PracticalSourceRef } from "@/lib/domain/practical-types";

const SUBJECT_IDS = new Set<PracticalTextbookSubjectId>([
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
]);
const STUDY_TYPE_IDS = new Set<PracticalTextbookStudyTypeId>([
  "definition",
  "formula",
  "procedure",
  "visual",
  "drawing",
  "diagnosis_safety",
]);

export default async function PracticalTheoryStudyTypePage({
  params,
}: {
  params: Promise<{ subjectId: string; studyTypeId: string }>;
}) {
  const { subjectId: rawSubjectId, studyTypeId: rawStudyTypeId } = await params;
  if (
    !SUBJECT_IDS.has(rawSubjectId as PracticalTextbookSubjectId) ||
    !STUDY_TYPE_IDS.has(rawStudyTypeId as PracticalTextbookStudyTypeId)
  ) {
    notFound();
  }
  const subjectId = rawSubjectId as PracticalTextbookSubjectId;
  const studyTypeId = rawStudyTypeId as PracticalTextbookStudyTypeId;
  const [subject, studyType, concepts] = await Promise.all([
    getPracticalTextbookSubject(subjectId),
    getPracticalTextbookStudyType(studyTypeId),
    practicalConceptsByTextbookSubjectAndType(subjectId, studyTypeId),
  ]);
  if (!subject || !studyType) notFound();

  return (
    <div className="page-wrap max-w-6xl py-12">
      <Link
        href={`/practical/written/theory/subject/${subjectId}`}
        className="text-sm font-extrabold text-sky-700 underline underline-offset-4"
      >
        {subject.code} {subject.title} 학습유형
      </Link>
      <PageHeading
        eyebrow={`${subject.code} · ${subject.title}`}
        title={studyType.title}
        description={
          studyTypeId === "formula"
            ? "NCS 원문에서 식·변수·단위·적용조건을 함께 확인한 계산만 정리합니다. 단순 측정·그림 식별·조건 설명은 다른 유형으로 분리했습니다."
            : `${studyType.description} 아래 내용은 그림을 먼저 붙이지 않고, NCS 원문 위치와 글 기준으로 정리한 교재입니다.`
        }
      />

      <section className="rounded-3xl border border-teal-200 bg-teal-50 p-6 md:p-8">
        <h2 className="text-xl font-extrabold">NCS 원문을 확인하는 순서</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          각 개념의 문서명과 PDF·인쇄 쪽수를 먼저 확인하고, 그 뒤 정의와 작업 기준을 읽습니다.
          그림 정답을 좌우하는 원본 그림이 아직 검증되지 않은 항목은 이미지를 추정해서 붙이지 않았습니다.
        </p>
      </section>

      {concepts.length > 0 ? (
        <div className="mt-10 grid gap-8">
          {concepts.map((concept) => (
            <ConceptTextbookEntry
              key={concept.id}
              concept={concept}
              studyTypeId={studyTypeId}
            />
          ))}
        </div>
      ) : (
        <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h2 className="font-extrabold text-slate-900">원문으로 확인된 항목을 준비 중입니다</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            이 유형에는 NCS 원문에서 식·단위·조건 또는 정답 결정 요소가 함께 확인된 개념만 공개합니다.
            관련 개념은 다른 학습 유형에서 먼저 확인할 수 있습니다.
          </p>
        </section>
      )}
    </div>
  );
}

function ConceptTextbookEntry({
  concept,
  studyTypeId,
}: {
  concept: PracticalConcept;
  studyTypeId: PracticalTextbookStudyTypeId;
}) {
  const placement = getPracticalTextbookPlacementForConcept(concept.id);
  const sourceEvidence = placement?.sourceEvidence ?? "review_required";
  const groupName =
    conceptGroups.find((group) => group.id === concept.groupLabel)?.title ??
    "NCS 세부 개념";

  return (
    <article id={concept.id} className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-extrabold text-[#8f3f0a]">{groupName}</p>
          <h2 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-extrabold">
            <span>{concept.title}</span>
            {concept.contentRole === "supplemental" ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                (+보강용)
              </span>
            ) : null}
          </h2>
        </div>
        <Link
          href={`/practical/written/theory/${concept.id}`}
          className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-extrabold text-slate-700 hover:border-[#16697a]"
        >
          개념별 상세 노트
        </Link>
      </div>

      <NcsSourcePosition
        conceptId={concept.id}
        evidence={sourceEvidence}
        sources={concept.ncsSources}
        reviewNote={concept.sourceReviewNote}
      />

      <section className="mt-7 grid gap-5 md:grid-cols-2">
        <ProseBlock title="개념 정의" body={concept.definition} />
        <ProseBlock title="핵심 원리" body={concept.principle} />
      </section>

      <StudyTypeContent concept={concept} studyTypeId={studyTypeId} />

      {concept.ncsLearningPoints.length > 0 ? (
        <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-extrabold text-emerald-900">NCS 수행내용에서 확인할 점</h3>
          <BulletList items={concept.ncsLearningPoints} />
        </section>
      ) : null}
    </article>
  );
}

function NcsSourcePosition({
  conceptId,
  evidence,
  sources,
  reviewNote,
}: {
  conceptId: string;
  evidence: PracticalTextbookSourceEvidence;
  sources: PracticalSourceRef[];
  reviewNote: string;
}) {
  const showSourcePositions = evidence !== "review_required" && sources.length > 0;
  if (!showSourcePositions) {
    return (
      <section
        data-testid={`practical-textbook-source-${conceptId}`}
        className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5"
      >
        <h3 className="font-extrabold text-amber-900">원문 위치 검토 필요</h3>
        <p className="mt-2 text-sm leading-7 text-amber-950">
          현재 확보된 NCS 원문에서 이 개념의 직접 근거 또는 정답 결정 그림 위치를 확정하지 못했습니다.
          이미지와 쪽수는 추정해서 표시하지 않습니다.
        </p>
        {reviewNote ? <p className="mt-3 text-sm leading-7 text-amber-900">검토 메모: {reviewNote}</p> : null}
      </section>
    );
  }

  const sourceLabel = evidence === "direct" ? "직접 연결된 NCS 원문 위치" : "관련 NCS 원문 위치";
  return (
    <section
      data-testid={`practical-textbook-source-${conceptId}`}
      className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5"
    >
      <h3 className="font-extrabold text-sky-950">{sourceLabel}</h3>
      <div className="mt-4 grid gap-3">
        {sources.map((source) => (
          <div
            key={`${source.ncsCode}-${source.pdfPage}-${source.printedPage}-${source.figureNumber ?? "text"}`}
            className="rounded-xl border border-sky-100 bg-white p-4"
          >
            <p className="font-bold text-slate-900">
              NCS {source.documentTitle} · {source.ncsCode}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {source.pdfPage ? `PDF p.${source.pdfPage}` : "PDF 페이지 검토 필요"}
              {source.printedPage ? ` · 인쇄 p.${source.printedPage}` : ""}
              {source.figureNumber ? ` · ${source.figureNumber}` : ""}
            </p>
            {source.performanceCriteria ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">수행내용: {source.performanceCriteria}</p>
            ) : null}
            {source.sourceUrl ? (
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-extrabold text-sky-700 underline underline-offset-4"
              >
                NCS 원문 확인
              </a>
            ) : null}
          </div>
        ))}
      </div>
      {evidence === "related" && reviewNote ? (
        <p className="mt-4 text-sm leading-7 text-sky-900">연결 메모: {reviewNote}</p>
      ) : null}
    </section>
  );
}

function StudyTypeContent({
  concept,
  studyTypeId,
}: {
  concept: PracticalConcept;
  studyTypeId: PracticalTextbookStudyTypeId;
}) {
  if (studyTypeId === "formula") {
    return (
      <section className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h3 className="font-extrabold text-indigo-950">계산식·단위·적용조건</h3>
        <BulletList items={concept.formula} />
        <CompactList title="계산 전 확인할 조건과 함정" items={concept.traps} />
      </section>
    );
  }

  if (studyTypeId === "procedure") {
    return (
      <section className="mt-7 rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <h3 className="font-extrabold text-teal-950">작업·점검 순서</h3>
        <OrderedList items={concept.procedure} emptyText="작업 순서는 개념별 상세 노트와 NCS 원문 위치를 함께 재검토합니다." />
        <CompactList title="작업 중 확인할 안전사항" items={concept.safety} />
      </section>
    );
  }

  if (studyTypeId === "visual") {
    return (
      <section className="mt-7 rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <h3 className="font-extrabold text-violet-950">그림·사진 식별 기준</h3>
        <p className="mt-3 text-sm leading-7 text-violet-950">
          현재는 원본 그림을 추정해 넣지 않고, 사진이나 도면에서 먼저 확인할 구성요소·명칭을 글로 정리합니다.
        </p>
        <CompactList title="식별할 구성요소" items={concept.components} />
        <CompactList title="답안 핵심어" items={concept.requiredKeywords} />
      </section>
    );
  }

  if (studyTypeId === "drawing") {
    return (
      <section className="mt-7 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
        <h3 className="font-extrabold text-cyan-950">도면·기호 판독 기준</h3>
        <OrderedList items={concept.procedure} emptyText="명칭, 구성요소, 기호의 역할을 위에서 아래 순서로 판독합니다." />
        <CompactList title="판독할 구성요소" items={concept.components} />
        <CompactList title="자주 틀리는 표현" items={concept.traps} />
      </section>
    );
  }

  if (studyTypeId === "diagnosis_safety") {
    return (
      <section className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h3 className="font-extrabold text-red-950">고장진단·안전·관리 기준</h3>
        <CompactList title="이상 현상·원인·대책" items={concept.diagnosis} />
        <CompactList title="안전·관리상 확인" items={concept.safety} />
      </section>
    );
  }

  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-extrabold">구성요소와 구분 기준</h3>
      <CompactList title="구성·특징" items={concept.components} />
      <CompactList title="실기 답안에서 묻는 방식" items={concept.examFormats} />
      <CompactList title="필수 답안 키워드" items={concept.requiredKeywords} />
    </section>
  );
}

function ProseBlock({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <h3 className="font-extrabold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function BulletList({
  items,
  emptyText,
}: {
  items: string[];
  emptyText?: string;
}) {
  const values = items.filter(Boolean);
  if (values.length === 0) {
    return emptyText ? <p className="mt-3 text-sm leading-7 text-slate-700">{emptyText}</p> : null;
  }
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
      {values.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function OrderedList({
  items,
  emptyText,
}: {
  items: string[];
  emptyText?: string;
}) {
  const values = items.filter(Boolean);
  if (values.length === 0) {
    return emptyText ? <p className="mt-3 text-sm leading-7 text-slate-700">{emptyText}</p> : null;
  }
  return (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">
      {values.map((item) => <li key={item}>{item}</li>)}
    </ol>
  );
}

function CompactList({ title, items }: { title: string; items: string[] }) {
  const values = items.filter(Boolean);
  if (values.length === 0) return null;
  return (
    <div className="mt-5 border-t border-current/10 pt-5">
      <h4 className="font-extrabold">{title}</h4>
      <BulletList items={values} />
    </div>
  );
}
