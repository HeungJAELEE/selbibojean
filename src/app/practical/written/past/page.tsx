import { PracticalQuestionSections } from "@/components/practical-question-sections";
import { PageHeading } from "@/components/page-heading";
import { PracticalWrittenSectionNav } from "@/components/practical-written-section-nav";
import {
  getPracticalContent,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";

export default async function PracticalPastPage() {
  const content = await getPracticalContent();
  const questions = publicPracticalQuestions("past");
  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="응시자 복원 · 실기 출제"
        title="필답형 기출복원"
        description="2025년 1·2·3회와 2026년 1·2회, 총 50문항을 회차·번호·보기·그림 기준으로 복원해 풉니다."
      />
      <PracticalWrittenSectionNav activeSection="past" />
      <PracticalQuestionSections
        categories={content.studyCategories}
        questions={questions}
      />
    </div>
  );
}
