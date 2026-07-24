import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
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
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="Practical · written"
        title="실기 필답형"
        description="NCS 원문을 과목별 교재로 먼저 읽고, 이후 기출복원·출제예상 문제로 답안을 직접 작성합니다."
      />

      <section className="rounded-3xl border border-teal-200 bg-teal-50 p-7">
        <p className="text-xs font-extrabold text-[#16697a]">1단계 · NCS 이론</p>
        <h2 className="mt-2 text-2xl font-extrabold">
          과목별로 개념·공식·순서·식별·도면·진단을 먼저 정리합니다
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
          실기 필답형은 사진, 공식, 작업순서, 도면·기호를 섞어 묻습니다. 문제 목록을 바로 열기보다
          NCS 문서명과 PDF·인쇄 쪽수가 있는 과목별 교재부터 학습합니다.
        </p>
        <Link
          href="/practical/written/theory"
          className="mt-5 inline-flex rounded-xl bg-[#16697a] px-5 py-3 text-sm font-extrabold text-white"
        >
          과목별 실기 이론 열기
        </Link>
      </section>

      <section className="mt-10">
        <p className="text-xs font-extrabold text-[#8f3f0a]">과목별 교재</p>
        <h2 className="mt-2 text-2xl font-extrabold">4과목에서 시작하기</h2>
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
        <p className="text-xs font-extrabold text-[#8f3f0a]">2단계 · 문제풀이</p>
        <h2 className="mt-2 text-2xl font-extrabold">문제 유형별로 답안을 작성합니다</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {content.studyCategories.map((category) => {
            const past = publicPracticalQuestionsByCategory(category.id, "past").length;
            const predicted = publicPracticalQuestionsByCategory(category.id, "predicted").length;
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
                <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link href="/practical/written/past" className="card p-7 hover:border-[#16697a]">
          <p className="text-xs font-extrabold text-[#8f3f0a]">{pastCount}문제</p>
          <h2 className="mt-2 text-xl font-extrabold">기출복원</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            실제 응시자 복원 출처와 정답 근거가 확인된 문제를 자기채점으로 풉니다.
          </p>
        </Link>
        <Link href="/practical/written/predicted" className="card p-7 hover:border-[#16697a]">
          <p className="text-xs font-extrabold text-[#8f3f0a]">{predictedCount}문제</p>
          <h2 className="mt-2 text-xl font-extrabold">출제예상</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            NCS 수행내용을 바탕으로 만든 예상문제이며, 실제 기출 통계에는 포함하지 않습니다.
          </p>
        </Link>
      </div>
    </div>
  );
}
