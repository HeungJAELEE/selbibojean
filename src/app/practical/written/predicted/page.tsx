import { PracticalQuestionSections } from "@/components/practical-question-sections";
import { PageHeading } from "@/components/page-heading";
import {
  getPracticalContent,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";

export default async function PracticalPredictedPage() {
  const questions = publicPracticalQuestions("predicted");
  const content = await getPracticalContent();
  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="NCS 수행내용 · 출제 예상"
        title="필답형 출제예상"
        description="예상문제에는 실제 회차와 출제횟수를 부여하지 않으며 기출통계에서도 제외합니다."
      />
      {questions.length < content.report.rows.predicted ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          전체 {content.report.rows.predicted}개 초안 중 {questions.length}개를
          공개했습니다. OEE 계산 1문제는 현재 확보한 NCS 원문 밖의 근거가
          필요해 검수 대기 중입니다.
        </div>
      ) : null}
      <PracticalQuestionSections
        categories={content.studyCategories}
        questions={questions}
      />
    </div>
  );
}
