import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { PracticalLabelBadges } from "@/components/practical-label-badges";
import { PracticalQuestionList } from "@/components/practical-question-list";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";
import { getPracticalWorkTasksForConcept } from "@/data/source/practical-work-tasks";
import { conceptGroups, subjects } from "@/lib/domain/catalog";
import type { PracticalConcept } from "@/lib/domain/practical-types";
import {
  getPracticalConcept,
  getPracticalTextbookPlacementForConcept,
  getPracticalTextbookSubject,
  getPublicPracticalVisualAid,
  getPublicPracticalQuestion,
  practicalConceptsByTextbookSubject,
} from "@/lib/content/practical-repository";

export default async function PracticalConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const concept = await getPracticalConcept(conceptId);
  if (!concept || concept.contentStatus !== "published") notFound();
  const relatedWorkTasks = getPracticalWorkTasksForConcept(concept.id);
  const publicVisualAids = (
    await Promise.all(
      concept.visualAidIds.map((visualAidId) =>
        getPublicPracticalVisualAid(visualAidId, "theory"),
      ),
    )
  ).filter(
    (visualAid): visualAid is NonNullable<typeof visualAid> =>
      Boolean(visualAid),
  );
  const relatedQuestionIds = [
    ...concept.relatedPastQuestionIds,
    ...concept.relatedPredictedQuestionIds,
  ];
  const publicRelatedQuestions = (
    await Promise.all(
      relatedQuestionIds.map(async (questionId) =>
        (await getPublicPracticalQuestion(questionId)) ?? null,
      ),
    )
  ).filter(
    (question): question is NonNullable<typeof question> =>
      Boolean(question),
  );
  const pastQuestions = publicRelatedQuestions.filter(
    (question) => question.kind === "past",
  );
  const predictedQuestions = publicRelatedQuestions.filter(
    (question) => question.kind === "predicted",
  );
  const subject = subjects.find((item) => item.id === concept.subjectLabel);
  const group = conceptGroups.find((item) => item.id === concept.groupLabel);
  const subjectName = subject
    ? `제${subject.code}과목 ${subject.title}`
    : concept.subjectLabel;
  const groupName = group?.title ?? concept.groupLabel;
  const textbookPlacement = getPracticalTextbookPlacementForConcept(concept.id);
  const textbookSubject = textbookPlacement
    ? getPracticalTextbookSubject(textbookPlacement.subjectId)
    : undefined;
  const siblingConcepts = textbookPlacement
    ? practicalConceptsByTextbookSubject(textbookPlacement.subjectId)
    : [];
  const siblingIndex = siblingConcepts.findIndex((item) => item.id === concept.id);
  const previousConcept =
    siblingIndex > 0 ? siblingConcepts[siblingIndex - 1] : null;
  const nextConcept =
    siblingIndex >= 0 && siblingIndex < siblingConcepts.length - 1
      ? siblingConcepts[siblingIndex + 1]
      : null;
  const navigation = textbookPlacement
    ? {
        subjectId: textbookPlacement.subjectId,
        subjectTitle: textbookSubject?.title ?? subjectName,
        groupTitle: groupName,
        previousConcept,
        nextConcept,
      }
    : null;

  return (
    <div
      data-testid="practical-textbook-concept-integrated-sheet"
      className="page-wrap max-w-5xl py-12"
    >
      <div className="flex flex-wrap items-center gap-2">
        <PracticalLabelBadges labels={concept.labels} />
        {concept.contentRole === "supplemental" ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
            (+보강용)
          </span>
        ) : null}
      </div>
      <h1 className="display mt-4 text-4xl font-bold">{concept.title}</h1>
      <p className="mt-3 text-sm font-bold text-[#8f3f0a]">
        {subjectName} · {groupName}
      </p>
      <ConceptNavigation
        navigation={navigation}
        pastQuestionCount={pastQuestions.length}
        predictedQuestionCount={predictedQuestions.length}
      />
      <section className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
          이 레슨에서 익힐 것
        </p>
        <ul className="mt-4 grid gap-2 text-sm leading-7 text-slate-700 md:grid-cols-2">
          {concept.learningGoals.map((goal) => (
            <li key={goal} className="flex gap-2">
              <span aria-hidden="true" className="font-black text-sky-600">✓</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </section>

      {publicVisualAids.length > 0 ? (
        <section
          className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-6 md:p-8"
          aria-labelledby="concept-visual-aids-heading"
        >
          <SectionEyebrow>원문·검수 시각자료</SectionEyebrow>
          <h2
            id="concept-visual-aids-heading"
            className="mt-2 text-2xl font-extrabold"
          >
            구조와 작업 위치를 그림으로 확인
          </h2>
          <div className="mt-6 grid gap-5">
            {publicVisualAids.map((visualAid) => (
              <PracticalVisualAidFigure
                key={visualAid.id}
                visualAid={visualAid}
                mode="theory"
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <SectionEyebrow>개념 이해</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-extrabold">무엇이며, 어떻게 작동하는가</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ProseBlock title="정의" body={concept.definition} />
            <ProseBlock title="핵심 원리" body={concept.principle} />
          </div>
          <CompactList title="구성요소와 역할" items={concept.components} />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <SectionEyebrow>현장 적용</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-extrabold">
            작동·조립·점검은 어떤 순서로 하는가
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            선후관계가 있는 동작과 작업만 번호 순서로 정리합니다. 서로
            병렬인 구성요소·종류에는 임의 순번을 붙이지 않습니다.
          </p>
          <TheoryList items={concept.procedure} ordered />
          <CompactList title="계산·판정 기준" items={concept.formula} />
          <CompactList title="이상 현상과 원인·대책" items={concept.diagnosis} />
        </section>

        {concept.safety.length > 0 ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 md:p-8">
            <SectionEyebrow tone="danger">안전</SectionEyebrow>
            <h2 className="mt-2 text-2xl font-extrabold">작업 전 반드시 확인할 사항</h2>
            <TheoryList items={concept.safety} />
          </section>
        ) : null}

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <SectionEyebrow tone="warning">시험 답안 정리</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-extrabold">실기에서는 이렇게 묻습니다</h2>
          <CompactList title="출제 형태" items={concept.examFormats} />
          <KeywordList items={concept.requiredKeywords} />
          <CompactList title="오답 함정" items={concept.traps} />
        </section>

        {concept.ncsLearningPoints.length > 0 ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
            <SectionEyebrow tone="source">NCS 원문 정리</SectionEyebrow>
            <h2 className="mt-2 text-2xl font-extrabold">원문에서 확인한 학습 포인트</h2>
            <TheoryList items={concept.ncsLearningPoints} />
          </section>
        ) : null}
      </div>
      {relatedWorkTasks.length > 0 ? (
        <section
          id="related-practical-work"
          className="mt-10 rounded-3xl border border-teal-200 bg-teal-50 p-6 md:p-8"
        >
          <SectionEyebrow>이론을 실제 작업으로 연결하기</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-extrabold">
            이 개념이 사용되는 수행과제
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            정의를 읽는 데서 끝내지 않고 안전 확인, 작업순서, 측정,
            판정, 고장진단과 기록까지 이어서 연습합니다.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {relatedWorkTasks.map((task) => (
              <Link
                key={task.id}
                href={`/practical/work/${task.slug}`}
                className="rounded-2xl border border-teal-200 bg-white p-5 transition hover:border-teal-600"
              >
                <p className="text-xs font-extrabold text-teal-700">
                  {task.documentTitle} · {task.ncsCode}
                </p>
                <h3 className="mt-2 font-extrabold text-slate-900">
                  {task.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {task.summary}
                </p>
                <span className="mt-4 inline-flex text-sm font-extrabold text-teal-700">
                  수행과제 시작 →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {pastQuestions.length > 0 ? (
        <section
          id="practical-past-questions"
          className="mt-10 scroll-mt-24 border-t border-slate-200 pt-8"
        >
          <h2 className="text-2xl font-extrabold">
            기출복원 · (실기 출제)
          </h2>
          <PracticalQuestionList questions={pastQuestions} />
        </section>
      ) : null}
      {predictedQuestions.length > 0 ? (
        <section
          id="practical-predicted-questions"
          className="mt-10 scroll-mt-24 border-t border-slate-200 pt-8"
        >
          <h2 className="text-2xl font-extrabold">
            출제예상 · (출제 예상)
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            실제 회차와 기출빈도에는 포함하지 않습니다.
          </p>
          <PracticalQuestionList questions={predictedQuestions} />
        </section>
      ) : null}

      <section className="mt-12 border-t border-slate-200 pt-8">
        <SectionEyebrow tone="source">근거와 검수</SectionEyebrow>
        <h2 className="mt-2 text-2xl font-extrabold">NCS 원문 근거</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          아래 자료는 학습 본문의 출발점이 아니라, 정리된 내용을 다시 확인하기 위한
          근거입니다. 페이지가 직접 개념을 뒷받침하지 않는 경우에는 검수 메모에
          한계를 표시했습니다.
        </p>
        {concept.ncsSources.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {concept.ncsSources.map((source) => (
              <article
                key={`${source.ncsCode}-${source.pdfPage}-${source.figureNumber ?? "text"}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                    {source.ncsCode}
                  </span>
                  <strong>{source.documentTitle}</strong>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {source.pdfPage ? `PDF ${source.pdfPage}쪽` : "PDF 쪽수 재검수"}
                  {source.printedPage ? ` · 인쇄 ${source.printedPage}쪽` : ""}
                  {source.figureNumber ? ` · ${source.figureNumber}` : ""}
                </p>
                {source.performanceCriteria ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    수행내용: {source.performanceCriteria}
                  </p>
                ) : null}
                {source.sourceUrl ? (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-extrabold text-sky-700 underline underline-offset-4"
                  >
                    NCS 원문 확인
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            현재 확보한 NCS 원문에서 이 개념을 직접 설명하는 페이지를 확인하지
            못했습니다. 별도 공식·전문 근거 검수가 필요합니다.
          </p>
        )}
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-extrabold">원문 대조 메모</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {concept.sourceReviewNote}
          </p>
        </div>
      </section>
      <ConceptNavigation
        navigation={navigation}
        pastQuestionCount={pastQuestions.length}
        predictedQuestionCount={predictedQuestions.length}
        position="bottom"
      />
    </div>
  );
}

type ConceptNavigationModel = {
  subjectId: string;
  subjectTitle: string;
  groupTitle: string;
  previousConcept: PracticalConcept | null;
  nextConcept: PracticalConcept | null;
} | null;

function ConceptNavigation({
  navigation,
  pastQuestionCount,
  predictedQuestionCount,
  position = "top",
}: {
  navigation: ConceptNavigationModel;
  pastQuestionCount: number;
  predictedQuestionCount: number;
  position?: "top" | "bottom";
}) {
  if (!navigation) return null;

  if (position === "bottom") {
    return (
      <nav
        aria-label="실기 개념 이전 다음 이동"
        className="mt-10 border-t border-slate-200 pt-6"
      >
        <Link
          href={`/practical/written/theory/subject/${navigation.subjectId}`}
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:border-[#16697a] hover:text-[#16697a]"
        >
          ↑ {navigation.subjectTitle} 목록으로
        </Link>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {navigation.previousConcept ? (
            <Link
              href={`/practical/written/theory/${navigation.previousConcept.id}`}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:border-[#16697a]"
            >
              <span className="block text-xs font-bold text-slate-500">
                이전 개념
              </span>
              <strong className="mt-1 block">
                ← {navigation.previousConcept.title}
              </strong>
            </Link>
          ) : (
            <span className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
              이전 개념 없음
            </span>
          )}
          {navigation.nextConcept ? (
            <Link
              href={`/practical/written/theory/${navigation.nextConcept.id}`}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-700 hover:border-[#16697a]"
            >
              <span className="block text-xs font-bold text-slate-500">
                다음 개념
              </span>
              <strong className="mt-1 block">
                {navigation.nextConcept.title} →
              </strong>
            </Link>
          ) : (
            <span className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-right text-sm text-slate-400">
              다음 개념 없음
            </span>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav
      data-testid="practical-concept-navigation"
      aria-label="실기 개념 빠른 이동"
      className="mt-6 border-y border-slate-200 py-3"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
        <Link
          href="/practical/written/theory"
          className="font-extrabold text-[#16697a] hover:underline"
        >
          실기 이론 목차
        </Link>
        <span aria-hidden="true" className="text-slate-300">›</span>
        <Link
          href={`/practical/written/theory/subject/${navigation.subjectId}`}
          className="font-bold text-slate-700 hover:text-[#16697a] hover:underline"
        >
          {navigation.subjectTitle}
        </Link>
        <span aria-hidden="true" className="text-slate-300">›</span>
        <span className="font-bold text-slate-500">
          {navigation.groupTitle}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/practical/written/past"
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 hover:border-emerald-500"
        >
          기출복원 전체
        </Link>
        <Link
          href="/practical/written/predicted"
          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800 hover:border-amber-500"
        >
          출제예상 전체
        </Link>
        {pastQuestionCount > 0 ? (
          <Link
            href="#practical-past-questions"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:border-[#16697a]"
          >
            이 개념 기출 {pastQuestionCount}개 ↓
          </Link>
        ) : null}
        {predictedQuestionCount > 0 ? (
          <Link
            href="#practical-predicted-questions"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:border-[#16697a]"
          >
            이 개념 예상 {predictedQuestionCount}개 ↓
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

function SectionEyebrow({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "danger" | "warning" | "source";
}) {
  const color =
    tone === "danger"
      ? "text-red-700"
      : tone === "warning"
        ? "text-amber-700"
        : tone === "source"
          ? "text-emerald-700"
          : "text-sky-700";
  return (
    <p className={`text-xs font-extrabold uppercase tracking-[0.18em] ${color}`}>
      {children}
    </p>
  );
}

function ProseBlock({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <h3 className="font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function TheoryList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const cleanItems = items.filter(Boolean);
  if (cleanItems.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`mt-6 space-y-3 pl-5 text-sm leading-7 text-slate-700 ${ordered ? "list-decimal" : "list-disc"}`}>
      {cleanItems.map((item) => <li key={item}>{item}</li>)}
    </List>
  );
}

function CompactList({ title, items }: { title: string; items: string[] }) {
  const cleanItems = items.filter(Boolean);
  if (cleanItems.length === 0) return null;
  return (
    <div className="mt-7 border-t border-slate-200 pt-6">
      <h3 className="font-extrabold">{title}</h3>
      <TheoryList items={cleanItems} />
    </div>
  );
}

function KeywordList({ items }: { items: string[] }) {
  const cleanItems = items.filter(Boolean);
  if (cleanItems.length === 0) return null;
  return (
    <div className="mt-7 border-t border-amber-200 pt-6">
      <h3 className="font-extrabold">필수 답안 키워드</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {cleanItems.map((item) => (
          <span key={item} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
