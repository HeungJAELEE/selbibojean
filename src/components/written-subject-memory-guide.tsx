import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  ChevronDown,
  Sigma,
} from "lucide-react";
import { InlineQuestionToggle } from "@/components/single-question";
import {
  getWrittenSubjectBundleLessonTitles,
  getWrittenSubjectFactLessonTitles,
} from "@/data/source/written-subject-fact-lesson-links";
import type { PublicQuestion } from "@/lib/domain/types";

type LessonLink = {
  id: string;
  title: string;
  conceptGroupId?: string;
};

type MemoryFormula = {
  label: string;
  formula: string;
  note: string;
};

type MemoryBundle = {
  id: string;
  part: string;
  title: string;
  memoryLine: string;
  facts: Array<{
    cue: string;
    answer: string;
    detailLessonTitles?: string[];
  }>;
  formulas?: MemoryFormula[];
  traps: Array<{ statement: string; correction: string }>;
  detailLessonTitles: string[];
  cbtStatusNote?: string;
};

type MemoryPart = {
  id: string;
  label: string;
};

type WrittenSubjectMemoryGuideProps = {
  subjectCode: 1 | 2 | 3 | 4;
  heading: string;
  description: string;
  parts: readonly MemoryPart[];
  bundles: readonly MemoryBundle[];
  lessons: LessonLink[];
  questions: PublicQuestion[];
  sourceBoundaryNote?: string;
};

const GENERIC_MOCK_TOKENS = new Set([
  "관련",
  "구분",
  "기본",
  "기계",
  "문제",
  "방법",
  "설비",
  "안전",
  "용접",
  "일반",
  "작업",
  "특성",
]);

function getMockMatchTokens(bundle: MemoryBundle) {
  return [
    bundle.title,
    ...bundle.facts.map((fact) => fact.cue),
    ...bundle.detailLessonTitles,
  ]
    .flatMap((value) => value.split(/[\s·,()[\]/–—]+/))
    .map((value) => value.trim())
    .filter(
      (value) => value.length >= 2 && !GENERIC_MOCK_TOKENS.has(value),
    );
}

function getMockMatchScore(
  question: PublicQuestion,
  lessonTitle: string,
  tokens: string[],
) {
  const normalizedTitle = lessonTitle.toLocaleLowerCase("ko");
  const normalizedStem = question.stem.toLocaleLowerCase("ko");
  return tokens.reduce((score, token) => {
    const normalizedToken = token.toLocaleLowerCase("ko");
    if (normalizedTitle.includes(normalizedToken)) return score + 5;
    if (normalizedStem.includes(normalizedToken)) return score + 1;
    return score;
  }, 0);
}

export function WrittenSubjectMemoryGuide({
  subjectCode,
  heading,
  description,
  parts,
  bundles,
  lessons,
  questions,
  sourceBoundaryNote,
}: WrittenSubjectMemoryGuideProps) {
  const subjectSlug =
    subjectCode === 1
      ? "one"
      : subjectCode === 2
        ? "two"
        : subjectCode === 3
          ? "three"
          : "four";
  const lessonsByTitle = new Map(lessons.map((lesson) => [lesson.title, lesson]));
  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  return (
    <div
      className="bg-white"
      data-testid={`written-subject-${subjectSlug}-memory-guide`}
    >
      <section className="bg-[#173957] px-6 py-7 text-white md:px-8 md:py-9">
        <p className="text-xs font-black tracking-[.16em] text-teal-200">
          제{subjectCode}과목 통합 암기본
        </p>
        <h3 className="mt-2 text-2xl font-extrabold text-balance md:text-3xl">
          {heading}
        </h3>
        <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-balance text-slate-100">
          {description}
        </p>
        <nav
          aria-label={`제${subjectCode}과목 통합 암기본 바로가기`}
          className="mt-5 flex flex-wrap gap-2"
        >
          {parts.map((part) => (
            <a
              key={part.id}
              href={`#subject-${subjectSlug}-${part.id}`}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
            >
              {part.label}
            </a>
          ))}
        </nav>
      </section>

      <div className="px-5 py-6 md:px-8 md:py-8">
        <aside className="mb-7 border-l-4 border-sky-500 bg-sky-50 px-4 py-4">
          <p className="text-xs font-black tracking-[.14em] text-sky-800">
            NCS 용어·정의 보충
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-sky-950">
            검토된 기출 주제가 학습 범위의 기준입니다. 아래 묶음은 NCS에서
            사용하는 정확한 용어와 검수된 상세 개념으로 오류를 바로잡고 시험
            함정을 빠르게 복습하도록 보충합니다.
          </p>
        </aside>
        {parts.map((part, partIndex) => {
          const partBundles = bundles.filter(
            (bundle) => bundle.part === part.label,
          );

          return (
            <details
              id={`subject-${subjectSlug}-${part.id}`}
              key={part.id}
              open={partIndex === 0}
              className="group/major scroll-mt-28 border-t border-slate-300 first:border-t-0"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16697a] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block text-xs font-black tracking-[.15em] text-[#16697a]">
                    대주제 {String(partIndex + 1).padStart(2, "0")} · NCS 용어 우선
                  </span>
                  <strong className="mt-1 block text-xl font-extrabold text-balance text-[#173957]">
                    {part.label}
                  </strong>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-500">
                  중주제 {partBundles.length}개
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="text-[#16697a] transition-transform group-open/major:rotate-180"
                  />
                </span>
              </summary>

              <div className="grid gap-8 border-t border-slate-200 pb-8 pt-6">
                {partBundles.map((bundle, bundleIndex) => {
                  const bundleLessonTitles =
                    getWrittenSubjectBundleLessonTitles(subjectCode, bundle);
                  const detailLessons = bundleLessonTitles
                    .map((title) => lessonsByTitle.get(title))
                    .filter((lesson): lesson is LessonLink => Boolean(lesson));
                  const detailLessonIds = new Set(
                    detailLessons.map((lesson) => lesson.id),
                  );
                  const detailConceptGroupIds = new Set(
                    detailLessons
                      .map((lesson) => lesson.conceptGroupId)
                      .filter((groupId): groupId is string => Boolean(groupId)),
                  );
                  const directQuestions = questions.filter((question) =>
                    detailLessonIds.has(question.lessonId),
                  );
                  const directOriginalQuestions = directQuestions.filter(
                    (question) => question.provenance.original,
                  );
                  const originalQuestionIds = new Set(
                    directOriginalQuestions.map((question) => question.id),
                  );
                  const practiceQuestions = directOriginalQuestions
                    .sort((left, right) => {
                      const leftYear = left.provenance.exam?.year ?? 0;
                      const rightYear = right.provenance.exam?.year ?? 0;
                      return rightYear - leftYear;
                    })
                    .slice(0, 5);
                  const mockMatchTokens = getMockMatchTokens(bundle);
                  const mockQuestions = questions
                    .filter(
                      (question) =>
                        !question.provenance.original &&
                        !originalQuestionIds.has(question.id) &&
                        (detailLessonIds.has(question.lessonId) ||
                          detailConceptGroupIds.has(
                            lessonsById.get(question.lessonId)?.conceptGroupId ??
                              "",
                          )),
                    )
                    .map((question) => ({
                      question,
                      score: getMockMatchScore(
                        question,
                        lessonsById.get(question.lessonId)?.title ?? "",
                        mockMatchTokens,
                      ),
                    }))
                    .filter(({ score }) => score > 0)
                    .sort(
                      (left, right) =>
                        right.score - left.score ||
                        left.question.id.localeCompare(right.question.id),
                    )
                    .slice(0, 5);
                  const hasFactLessonLinks = bundle.facts.some(
                    (fact) =>
                      getWrittenSubjectFactLessonTitles(
                        subjectCode,
                        bundle,
                        fact,
                      ).some((title) =>
                        lessonsByTitle.has(title),
                      ),
                  );

                  return (
                    <details
                      key={bundle.id}
                      id={`subject-${subjectSlug}-${bundle.id}`}
                      open={bundleIndex === 0}
                      className="group/middle scroll-mt-28 border-l-4 border-[#16697a] pl-4"
                      data-testid={`subject-${subjectSlug}-bundle-${bundle.id}`}
                    >
                      <summary className="flex min-h-16 cursor-pointer list-none items-start justify-between gap-4 py-3 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16697a] [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0">
                          <span className="block text-xs font-black text-[#8f3f0a]">
                            중주제 {String(bundleIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="mt-1 block text-lg font-extrabold text-balance text-slate-950 md:text-xl">
                            {bundle.title}
                          </span>
                          <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600">
                            {bundle.memoryLine}
                          </span>
                        </span>
                        <ChevronDown
                          size={18}
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-[#16697a] transition-transform group-open/middle:rotate-180"
                        />
                      </summary>

                      <div className="pb-2">
                        <section
                          aria-label={`${bundle.title} 중주제 종합 정리`}
                          className="mt-3"
                        >
                        <p className="mb-2 text-xs font-black tracking-[.12em] text-slate-500">
                          중주제 종합 정리
                        </p>
                        <div className="overflow-x-auto border-y border-slate-200">
                          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                            <thead className="bg-slate-100 text-[#173957]">
                              <tr>
                                <th scope="col" className="w-44 px-4 py-3 font-extrabold">
                                  구분
                                </th>
                                <th scope="col" className="px-4 py-3 font-extrabold">
                                  핵심 정리
                                </th>
                                {hasFactLessonLinks ? (
                                  <th
                                    scope="col"
                                    className="w-36 px-4 py-3 text-center font-extrabold"
                                  >
                                    상세 학습
                                  </th>
                                ) : null}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {bundle.facts.map((fact) => {
                                const factLessons =
                                  getWrittenSubjectFactLessonTitles(
                                  subjectCode,
                                  bundle,
                                  fact,
                                )
                                  .map((title) => lessonsByTitle.get(title))
                                  .filter(
                                    (lesson): lesson is LessonLink =>
                                      Boolean(lesson),
                                  );

                                return (
                                <tr key={fact.cue}>
                                  <th
                                    scope="row"
                                    className="px-4 py-3 align-top font-extrabold text-[#16697a]"
                                  >
                                    {fact.cue}
                                  </th>
                                  <td className="px-4 py-3 align-top font-medium leading-6 text-slate-700">
                                    {fact.answer}
                                  </td>
                                  {hasFactLessonLinks ? (
                                    <td className="px-4 py-3 align-top text-center">
                                      {factLessons.length ? (
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                          {factLessons.map((lesson) => (
                                            <Link
                                              key={lesson.id}
                                              href={`/written/theory/${lesson.id}`}
                                              className="inline-flex min-h-9 max-w-44 items-center justify-center gap-1 rounded-lg border border-[#16697a]/30 bg-[#f2fbfa] px-2.5 py-1.5 text-center text-xs font-extrabold leading-5 text-[#145f69] transition hover:border-[#16697a] hover:bg-[#dff4f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16697a]"
                                            >
                                              {lesson.title}
                                              <ArrowRight
                                                size={12}
                                                className="shrink-0"
                                                aria-hidden="true"
                                              />
                                            </Link>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-xs font-semibold text-slate-400">
                                          연결 검수 중
                                        </span>
                                      )}
                                    </td>
                                  ) : null}
                                </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        </section>

                      {bundle.formulas?.length ? (
                        <section
                          aria-label={`${bundle.title} 필수 공식`}
                          className="mt-4 border-l-4 border-sky-500 bg-sky-50 px-4 py-3"
                        >
                          <div className="flex items-center gap-2 text-sky-900">
                            <Sigma size={17} aria-hidden="true" />
                            <h6 className="text-sm font-extrabold">필수 공식</h6>
                          </div>
                          <div className="mt-3 grid gap-3 lg:grid-cols-3">
                            {bundle.formulas.map((formula) => (
                              <div key={formula.label}>
                                <strong className="text-xs text-sky-950">
                                  {formula.label}
                                </strong>
                                <code className="mt-1 block whitespace-normal text-sm font-black leading-6 text-slate-950">
                                  {formula.formula}
                                </code>
                                <span className="mt-1 block text-xs leading-5 text-slate-600">
                                  {formula.note}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {detailLessons.length ? (
                        <section
                          data-testid={`subject-${subjectSlug}-subtopics-${bundle.id}`}
                          className="mt-4"
                        >
                          <p className="flex items-center gap-2 text-xs font-black tracking-[.12em] text-slate-500">
                            <BookOpenCheck size={15} aria-hidden="true" />
                            소주제 선택
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {detailLessons.map((lesson) => (
                              <Link
                                key={lesson.id}
                                href={`/written/theory/${lesson.id}`}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-[#173957] transition hover:border-[#16697a] hover:bg-[#f2fbfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16697a]"
                              >
                                <span className="text-[10px] font-black tracking-[.1em] text-[#16697a]">
                                  소주제
                                </span>
                                {lesson.title}
                                <ArrowRight size={13} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      <details
                        className="group/traps mt-4 border-y border-amber-200 bg-amber-50/70"
                        data-testid={`subject-${subjectSlug}-traps-${bundle.id}`}
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-extrabold text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 [&::-webkit-details-marker]:hidden">
                          <span className="flex items-center gap-2">
                            <AlertTriangle
                              size={17}
                              aria-hidden="true"
                              className="text-amber-700"
                            />
                            자주 나오는 함정 보기 · 문맥 교정{" "}
                            {bundle.traps.length}개
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-amber-800 transition-transform group-open/traps:rotate-90"
                          >
                            ▶
                          </span>
                        </summary>
                        <ul className="border-t border-amber-200 px-4 py-3">
                          {bundle.traps.map((trap) => (
                            <li
                              key={trap.statement}
                              className="grid gap-1 border-b border-amber-200 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] sm:gap-5"
                            >
                              <span className="text-sm font-bold leading-6 text-amber-950">
                                “{trap.statement}”
                              </span>
                              <span className="text-sm leading-6 text-slate-700">
                                {trap.correction}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>

                      {practiceQuestions.length ? (
                        <details
                          data-testid={`subject-${subjectSlug}-cbt-${bundle.id}`}
                          className="group/cbt mt-4 bg-[#173957] text-white"
                        >
                          <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200 [&::-webkit-details-marker]:hidden">
                            <div>
                              <p className="text-xs font-black tracking-[.12em] text-teal-200">
                                관련 실제 CBT 원문
                              </p>
                              <h6 className="mt-1 text-sm font-extrabold">
                                방금 본 중주제를 문제에서 확인하기
                              </h6>
                            </div>
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-300">
                              원문 확인 {practiceQuestions.length}문제
                              <ChevronDown
                                size={17}
                                aria-hidden="true"
                                className="transition-transform group-open/cbt:rotate-180"
                              />
                            </span>
                          </summary>
                          <div className="border-t border-white/15 px-4 pb-4">
                            <div className="mt-3 grid gap-2">
                              {practiceQuestions.map((question, index) => (
                                <InlineQuestionToggle
                                  key={question.id}
                                  question={question}
                                  index={index}
                                />
                              ))}
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-300">
                              정답과 해설은 선택지를 제출한 뒤에만 표시됩니다.
                            </p>
                          </div>
                        </details>
                      ) : bundle.cbtStatusNote ? (
                        <section
                          data-testid={`subject-${subjectSlug}-cbt-pending-${bundle.id}`}
                          className="mt-4 border-l-4 border-slate-400 bg-slate-100 px-4 py-4"
                        >
                          <p className="text-xs font-black tracking-[.12em] text-slate-600">
                            실제 CBT 연결 검수 중
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                            {bundle.cbtStatusNote}
                          </p>
                        </section>
                      ) : null}

                      {mockQuestions.length ? (
                        <details
                          data-testid={`subject-${subjectSlug}-mock-${bundle.id}`}
                          className="group/mock mt-4 bg-[#7c2d12] text-white"
                        >
                          <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-200 [&::-webkit-details-marker]:hidden">
                            <div>
                              <p className="text-xs font-black tracking-[.12em] text-orange-200">
                                관련 모의고사
                              </p>
                              <h6 className="mt-1 text-sm font-extrabold">
                                중주제 실전 유사 문제 풀기
                              </h6>
                            </div>
                            <span className="flex items-center gap-2 text-xs font-bold text-orange-100">
                              모의 확인 {mockQuestions.length}문제
                              <ChevronDown
                                size={17}
                                aria-hidden="true"
                                className="transition-transform group-open/mock:rotate-180"
                              />
                            </span>
                          </summary>
                          <div className="border-t border-white/15 px-4 pb-4">
                            <div className="mt-3 grid gap-2">
                              {mockQuestions.map(({ question }, index) => (
                                <InlineQuestionToggle
                                  key={question.id}
                                  question={question}
                                  index={index}
                                />
                              ))}
                            </div>
                            <p className="mt-3 text-xs leading-5 text-orange-100">
                              모의문제도 선택지를 제출한 뒤에만 정답과 해설이
                              표시됩니다.
                            </p>
                          </div>
                        </details>
                      ) : null}

                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}

        <footer className="border-t border-slate-300 pt-5">
          <p className="text-sm leading-6 text-slate-600">
            이 화면은 검토된 기출 주제와 NCS 용어를 공개 학습용 구조로
            재정리한 자료입니다. 상세 레슨은 정의·작동 배경·시험 함정·관련
            CBT를 연결해 복습할 수 있도록 구성했습니다.
          </p>
          {sourceBoundaryNote ? (
            <p className="mt-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-950">
              {sourceBoundaryNote}
            </p>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
