import { PracticalQuestionSections } from "@/components/practical-question-sections";
import { PracticalRecallRegistry } from "@/components/practical-recall-registry";
import { PageHeading } from "@/components/page-heading";
import { getPublicPracticalRecallRegistry } from "@/data/source/practical-question-recall-evidence";
import {
  getPracticalContent,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";

export default async function PracticalPastPage() {
  const content = await getPracticalContent();
  const questions = publicPracticalQuestions("past");
  const recallRegistry = getPublicPracticalRecallRegistry();
  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="응시자 복원 · 실기 출제"
        title="필답형 기출복원"
        description="NCS 이론과 판단 기준을 먼저 확인한 뒤 네 출제유형별로 검증된 복원문제를 풉니다."
      />
      <PracticalRecallRegistry entries={recallRegistry} />
      <PracticalQuestionSections
        categories={content.studyCategories}
        questions={questions}
      />
    </div>
  );
}
