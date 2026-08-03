import Link from "next/link";
import { ArrowRight, ClipboardList, Shuffle } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { DeviceLearningStorage } from "@/components/device-learning-storage";
import { WrittenMockSetup } from "@/components/written-mock-setup";
import { getContent } from "@/lib/content/repository";
import { getSafeOriginalsByQuestion } from "@/lib/content/practice-presentations";
import { getWeldingCbtProjectionCandidates } from "@/lib/content/welding-cbt-approved";
import { isPublishableQuestion } from "@/lib/domain/practice";
import { isReleaseFeatureEnabled } from "@/lib/release-features";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function WrittenMockPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const content = await getContent();
  const choiceShuffleEnabled = isReleaseFeatureEnabled(
    "mock_choice_shuffle",
  );
  const availableBySubject = Object.fromEntries(
    content.subjects.map((subject) => [
      subject.id,
      new Set(content.questions.filter((question) => question.subjectId === subject.id && isPublishableQuestion(question)).map((question) => question.id)).size,
    ]),
  );
  const sourceBankBySubject = Object.fromEntries(
    content.subjects.map((subject) => [
      subject.id,
      content.questions.filter(
        (question) =>
          question.subjectId === subject.id && question.id.startsWith("U-"),
      ).length +
        (subject.id === "subject-2"
          ? getWeldingCbtProjectionCandidates().length
          : 0),
    ]),
  );
  const safeOriginals = getSafeOriginalsByQuestion(
    content.questions.filter(isPublishableQuestion),
    content.variants,
  );
  const availableYears = [
    ...new Set(
      [...safeOriginals.values()]
        .flat()
        .map((variant) => variant.year)
        .filter((year): year is number => year !== null),
    ),
  ].sort((left, right) => left - right);
  const questionById = new Map(
    content.questions.map((question) => [question.id, question]),
  );
  const availableByYearRange: Record<string, Record<string, number>> = {};
  for (const from of availableYears) {
    for (const to of availableYears) {
      if (from > to) continue;
      const idsBySubject = new Map<string, Set<string>>();
      for (const [questionId, variants] of safeOriginals) {
        if (
          !variants.some(
            (variant) =>
              variant.year !== null &&
              variant.year >= from &&
              variant.year <= to,
          )
        ) {
          continue;
        }
        const subjectId = questionById.get(questionId)?.subjectId;
        if (!subjectId) continue;
        const ids = idsBySubject.get(subjectId) ?? new Set<string>();
        ids.add(questionId);
        idsBySubject.set(subjectId, ids);
      }
      availableByYearRange[`${from}-${to}`] = Object.fromEntries(
        content.subjects.map((subject) => [
          subject.id,
          idsBySubject.get(subject.id)?.size ?? 0,
        ]),
      );
    }
  }
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Written mock exam"
        title="필기 모의고사"
        description="실전형은 4과목에서 각각 20문제씩 총 80문제를 출제합니다. 커스텀 모드에서는 과목·문제 수·실제 기출 비율을 바꿀 수 있습니다."
      />
      <div className="mb-6">
        <DeviceLearningStorage authenticated={Boolean(auth.user)} />
      </div>
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
      <WrittenMockSetup
        subjects={content.subjects}
        availableBySubject={availableBySubject}
        sourceBankBySubject={sourceBankBySubject}
        availableYears={availableYears}
        availableByYearRange={availableByYearRange}
        choiceShuffleEnabled={choiceShuffleEnabled}
      />
    </div>
  );
}
