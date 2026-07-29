import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { PracticalWrittenSectionNav } from "@/components/practical-written-section-nav";
import {
  getPracticalContent,
  getPracticalTextbookSubjects,
  practicalConceptsByTextbookSubject,
  publicPracticalQuestions,
  publicPracticalQuestionsByCategory,
} from "@/lib/content/practical-repository";

export default async function PracticalWrittenPage() {
  const [content, subjects] = await Promise.all([
    getPracticalContent(),
    getPracticalTextbookSubjects(),
  ]);
  const pastCount = publicPracticalQuestions("past").length;
  const predictedCount = publicPracticalQuestions("predicted").length;

  return (
    <div className="page-wrap py-12" data-testid="practical-written-hub">
      <PageHeading
        eyebrow="Practical written"
        title="필답 학습"
        description="과목별 NCS 개념을 익힌 뒤 기출복원, 유형별 문제, 예상문제와 모의고사까지 한 흐름으로 학습합니다."
      />
      <PracticalWrittenSectionNav activeSection="home" />

      <section
        className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]"
        aria-labelledby="practical-written-start-title"
      >
        <h2 id="practical-written-start-title" className="sr-only">
          필답 학습 시작
        </h2>
        <Link
          href="/practical/written/theory"
          className="rounded-3xl bg-[#173957] p-7 text-white transition hover:bg-[#214d70]"
        >
          <p className="text-xs font-extrabold text-teal-200">
            먼저 개념을 정리할 때
          </p>
          <h3 className="mt-2 text-2xl font-extrabold">NCS·과목별 학습</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100">
            4과목의 정의, 공식, 작업순서, 식별, 도면과 진단 기준을
            과목별로 묶어 확인합니다.
          </p>
          <span className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#173957]">
            과목별 학습 시작
          </span>
        </Link>
        <Link
          href="/practical/written/past"
          className="card p-7 transition hover:border-[#16697a]"
        >
          <p className="text-xs font-extrabold text-[#8f3f0a]">
            공개 기출복원 {pastCount}문제
          </p>
          <h3 className="mt-2 text-2xl font-extrabold">기출복원 풀기</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            회차와 복원 근거가 확인된 문제를 실제 답안 형식으로
            작성하고 제출 후 채점합니다.
          </p>
          <span className="mt-5 inline-flex rounded-xl border border-[#16697a] px-5 py-3 text-sm font-extrabold text-[#16697a]">
            기출복원으로 이동
          </span>
        </Link>
      </section>

      <section className="mt-10">
        <p className="text-xs font-extrabold text-[#8f3f0a]">
          과목별 NCS 학습
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          4과목에서 필요한 개념 찾기
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          과목마다 공개된 개념만 연결하며, 세부 학습에서는 NCS 근거와
          관련 필답 문제를 함께 확인할 수 있습니다.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => {
            const count = practicalConceptsByTextbookSubject(subject.id).length;
            return (
              <Link
                key={subject.id}
                href={`/practical/written/theory/subject/${subject.id}`}
                className="card p-6 hover:border-[#16697a]"
              >
                <p className="text-xs font-extrabold text-[#8f3f0a]">
                  {subject.code} · 세부 {count}개
                </p>
                <h3 className="mt-2 text-xl font-extrabold">{subject.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {subject.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-200 pt-10">
        <p className="text-xs font-extrabold text-[#8f3f0a]">문제 유형별 학습</p>
        <h2 className="mt-2 text-2xl font-extrabold">
          출제 방식에 맞춰 답안 작성하기
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {content.studyCategories.map((category) => {
            const past = publicPracticalQuestionsByCategory(
              category.id,
              "past",
            ).length;
            const predicted = publicPracticalQuestionsByCategory(
              category.id,
              "predicted",
            ).length;
            return (
              <Link
                key={category.id}
                href={`/practical/written/theory/category/${category.id}`}
                className="card p-6 hover:border-[#16697a]"
              >
                <p className="text-xs font-extrabold text-[#8f3f0a]">
                  기출복원 {past} · 출제예상 {predicted}
                </p>
                <h3 className="mt-2 text-xl font-extrabold">{category.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        className="mt-12"
        aria-labelledby="practical-written-practice-title"
      >
        <p className="text-xs font-extrabold text-[#8f3f0a]">문제풀이 경로</p>
        <h2
          id="practical-written-practice-title"
          className="mt-2 text-2xl font-extrabold"
        >
          학습 상태에 맞춰 이어서 풀기
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr_1fr]">
          <Link
            href="/practical/written/past"
            className="card border-teal-300 p-7 transition hover:border-[#16697a]"
          >
            <p className="text-xs font-extrabold text-[#8f3f0a]">
              {pastCount}문제
            </p>
            <h3 className="mt-2 text-xl font-extrabold">기출복원</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              실제 응시자 복원 출처와 정답 근거가 확인된 문제를
              자기채점으로 풉니다.
            </p>
          </Link>
          <Link
            href="/practical/written/predicted"
            className="card p-7 transition hover:border-[#16697a]"
          >
            <p className="text-xs font-extrabold text-[#8f3f0a]">
              {predictedCount}문제
            </p>
            <h3 className="mt-2 text-xl font-extrabold">예상문제</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              NCS 수행내용을 바탕으로 만든 예상문제이며, 실제 기출
              통계에는 포함하지 않습니다.
            </p>
          </Link>
          <Link
            href="/practical/mock"
            className="card p-7 transition hover:border-[#16697a]"
          >
            <p className="text-xs font-extrabold text-[#8f3f0a]">
              기출복원 + 예상문제
            </p>
            <h3 className="mt-2 text-xl font-extrabold">필답 모의고사</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              공개 가능한 문제만 골라 문항 수와 유형을 설정한 뒤
              연속으로 풉니다.
            </p>
          </Link>
        </div>
      </section>

      <section
        className="mt-12 rounded-2xl border border-slate-200 bg-white p-6"
        aria-labelledby="practical-written-evidence-title"
      >
        <p className="text-xs font-extrabold text-[#16697a]">자료 상태 안내</p>
        <h2
          id="practical-written-evidence-title"
          className="mt-2 text-xl font-extrabold"
        >
          기출과 학습 보강 자료를 구분합니다
        </h2>
        <dl className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <dt className="font-extrabold text-[#173957]">기출복원</dt>
            <dd className="mt-2 text-sm leading-6 text-slate-600">
              회차와 복원 근거를 확인한 문제입니다.
            </dd>
          </div>
          <div>
            <dt className="font-extrabold text-[#173957]">기출변형·예상</dt>
            <dd className="mt-2 text-sm leading-6 text-slate-600">
              확인된 출제 유형이나 검증 이론을 바탕으로 구성하며 실제
              기출 횟수에는 포함하지 않습니다.
            </dd>
          </div>
          <div>
            <dt className="font-extrabold text-[#173957]">NCS 보강</dt>
            <dd className="mt-2 text-sm leading-6 text-slate-600">
              개념 이해를 돕는 학습 자료이며 기출로 표시하지 않습니다.
            </dd>
          </div>
        </dl>
        <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
          출처가 부족하거나 정답이 충돌하거나 필수 시각자료가 없는 항목은
          문제 목록, 검색과 모의고사에서 제외합니다.
        </p>
      </section>
    </div>
  );
}
