import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { PracticalTextbookSubjectPanel } from "@/components/practical-textbook-index";
import {
  getPracticalTextbookStudyTypes,
  getPracticalTextbookSubject,
  practicalConceptsByTextbookSubject,
} from "@/lib/content/practical-repository";
import type { PracticalTextbookSubjectId } from "@/data/source/practical-textbook-taxonomy";

const SUBJECT_IDS = new Set<PracticalTextbookSubjectId>([
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
]);

export default async function PracticalTheorySubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId: rawSubjectId } = await params;
  if (!SUBJECT_IDS.has(rawSubjectId as PracticalTextbookSubjectId)) notFound();
  const subjectId = rawSubjectId as PracticalTextbookSubjectId;
  const [subject, studyTypes, concepts] = await Promise.all([
    getPracticalTextbookSubject(subjectId),
    getPracticalTextbookStudyTypes(),
    practicalConceptsByTextbookSubject(subjectId),
  ]);
  if (!subject) notFound();

  return (
    <div className="page-wrap py-12">
      <Link
        href="/practical/written/theory"
        className="text-sm font-extrabold text-sky-700 underline underline-offset-4"
      >
        실기 이론 목차
      </Link>
      <PageHeading
        eyebrow={`${subject.code} · NCS 기반 실기 필답형`}
        title={subject.title}
        description="필기 이론 목차와 같은 2열 세부 묶음입니다. 실제 계산식은 계산 공식에만, 그림·도면·작업절차는 각각의 유형에 분리해 두었습니다."
      />

      <PracticalTextbookSubjectPanel
        subject={subject}
        studyTypes={studyTypes}
        concepts={concepts}
      />
    </div>
  );
}
