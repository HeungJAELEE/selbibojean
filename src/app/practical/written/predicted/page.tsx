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
      {content.report.rows.authoredPredicted > 0 ? (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          이 목록에는 원본 준비 워크북 {content.report.rows.workbookPredicted}개와
          NCS 원문 근거를 붙여 별도 구성한 {content.report.rows.authoredPredicted}개가
          함께 있습니다. 별도 구성 문항도 실제 회차·기출빈도에는 포함하지 않습니다.
        </div>
      ) : null}
      <PracticalQuestionSections
        categories={content.studyCategories}
        questions={questions}
      />
    </div>
  );
}
