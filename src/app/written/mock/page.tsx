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
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#173957] bg-[#173957] p-6 text-white">
          <ClipboardList size={21} className="text-teal-200" />
          <h2 className="mt-4 text-xl font-extrabold">전체 실전 모의고사</h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            아래 실전형 설정에서 4과목 각 20문제, 총 80문제로 시험을
            시작합니다.
          </p>
        </div>
        <Link
          href="/written/practice/random"
          className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#16697a]"
        >
          <Shuffle size={21} className="text-[#16697a]" />
          <h2 className="mt-4 text-xl font-extrabold">랜덤 문제풀기</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            과목·개념군·문제 수를 선택해 중복 없는 랜덤 세션을 구성합니다.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
            랜덤 설정 열기 <ArrowRight size={14} />
          </span>
        </Link>
      </section>
      <WrittenMockSetup subjects={content.subjects} availableBySubject={availableBySubject} />
    </div>
  );
}
import Link from "next/link";
import { ArrowRight, ClipboardList, Shuffle } from "lucide-react";
