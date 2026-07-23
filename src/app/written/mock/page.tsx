import { PageHeading } from "@/components/page-heading";
import { WrittenMockSetup } from "@/components/written-mock-setup";
import { getContent } from "@/lib/content/repository";
import { isPublishableQuestion } from "@/lib/domain/practice";

export default async function WrittenMockPage() {
  const content = await getContent();
  const availableBySubject = Object.fromEntries(
    content.subjects.map((subject) => [
      subject.id,
      new Set(content.questions.filter((question) => question.subjectId === subject.id && isPublishableQuestion(question)).map((question) => question.id)).size,
    ]),
  );
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Written mock exam"
        title="필기 모의고사"
        description="실전형은 4과목에서 각각 20문제씩 총 80문제를 출제합니다. 커스텀 모드에서는 과목·문제 수·실제 기출 비율을 바꿀 수 있습니다."
      />
      <WrittenMockSetup subjects={content.subjects} availableBySubject={availableBySubject} />
    </div>
  );
}
