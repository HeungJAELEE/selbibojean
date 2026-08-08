import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PracticalMockSetup } from "@/components/practical-mock-setup";
import { PracticalWrittenSectionNav } from "@/components/practical-written-section-nav";
import {
  getPracticalContent,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";

export const metadata: Metadata = {
  title: "필답 모의고사",
  description:
    "실기 필답형 기출복원과 NCS 기반 예상문제를 혼합해 모의고사를 구성합니다.",
};

export default async function PracticalMockPage() {
  const content = await getPracticalContent();
  const questions = publicPracticalQuestions();

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Practical written mock"
        title="필답 모의고사"
        description="실제 기출복원과 NCS에서 비슷한 유형으로 나올 가능성이 있는 예상문제를 선택해 연속으로 풉니다."
      />
      <PracticalWrittenSectionNav activeSection="mock" />
      <PracticalMockSetup
        questions={questions.map((question) => ({
          id: question.id,
          title: question.title,
          kind: question.kind,
          categoryId: question.primaryStudyCategoryId,
        }))}
        categories={content.studyCategories.map((category) => ({
          id: category.id,
          title: category.title,
        }))}
      />
    </div>
  );
}
