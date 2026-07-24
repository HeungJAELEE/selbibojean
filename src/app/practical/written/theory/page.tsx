import { PageHeading } from "@/components/page-heading";
import { PracticalTextbookSubjectPanel } from "@/components/practical-textbook-index";
import {
  getPracticalTextbookStudyTypes,
  getPracticalTextbookSubjects,
  practicalConceptsByTextbookSubject,
} from "@/lib/content/practical-repository";

export default async function PracticalTheoryPage() {
  const [subjects, studyTypes] = await Promise.all([
    getPracticalTextbookSubjects(),
    getPracticalTextbookStudyTypes(),
  ]);

  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="NCS 원문 기반 · 실기 필답형"
        title="실기 이론 목차"
        description="필기 이론 목차와 같은 방식으로 과목별 개념을 펼쳐 봅니다. 각 항목은 실제 문제의 종류가 아니라 NCS 원문을 읽고 답안을 만드는 유형으로 분류했으며, 클릭하면 원문 위치·정의·공식·순서·판독 기준을 확인할 수 있습니다."
      />

      <section className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 md:p-6">
        <h2 className="text-base font-extrabold text-teal-950">
          먼저 유형을 고르고, 그다음 NCS 원문 위치를 확인합니다
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">
          <strong>계산 공식</strong>에는 식·변수·단위·적용조건을 NCS 원문과 함께 확인한 항목만 넣습니다.
          그림이 필요한 문제는 원문 그림 번호가 확인되기 전까지 글 기반 판독 기준으로만 정리합니다.
        </p>
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
    </div>
  );
}
