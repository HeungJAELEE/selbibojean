import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Layers3 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getLessonFamilyHref } from "@/lib/content/lesson-families";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";
import { getContent } from "@/lib/content/repository";

export const metadata: Metadata = { title: "필기 이론" };

type LessonSummary = {
  id: string;
  title: string;
};

export default async function TheoryIndexPage() {
  const content = await getContent();
  const publicLessons = content.lessons.filter((lesson) => lesson.contentStatus === "published");

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Written theory"
        title="필기 이론 목차"
        description="현행과목 → 44개 세부항목군 → 통합 개념 묶음 → 세부 레슨 순서로 학습합니다. 함께 판단해야 하는 용어는 한 화면에서 비교하고, 오답 복귀용 개별 레슨은 그대로 유지합니다."
        action={(
          <Link href="/search" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold">
            이론 검색
          </Link>
        )}
      />

      <div className="grid gap-8 pb-8">
        {content.subjects.map((subject) => {
          const subjectGroups = content.conceptGroups.filter((group) => group.subjectId === subject.id);
          const count = publicLessons.filter((lesson) => lesson.subjectId === subject.id).length;
          const familyCount = subjectGroups.reduce((total, group) => {
            const lessons = publicLessons.filter((lesson) => lesson.conceptGroupId === group.id);
            return total + getLessonSubcategories(group.id, lessons).length;
          }, 0);

          return (
            <section key={subject.id} className="card overflow-hidden">
              <header className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:p-8">
                <div className="flex items-center gap-4">
                  <span
                    className="grid size-12 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    <BookOpen size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-500">제{subject.code}과목</p>
                    <h2 className="text-2xl font-extrabold">{subject.title}</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-500">통합 묶음 {familyCount}개 · 세부 레슨 {count}개</p>
              </header>

              <div className="grid gap-0 md:grid-cols-2">
                {subjectGroups.map((group) => {
                  const lessons = publicLessons.filter((lesson) => lesson.conceptGroupId === group.id);
                  const subcategories = getLessonSubcategories(group.id, lessons);

                  return (
                    <div key={group.id} className="border-b border-slate-200 p-6 md:border-r">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black text-[#16697a]">
                            {String(group.order).padStart(2, "0")}
                          </p>
                          <h3 className="mt-2 font-extrabold">{group.title}</h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          묶음 {subcategories.length} · 세부 {lessons.length}
                        </span>
                      </div>

                      <SubcategoryList groupId={group.id} subcategories={subcategories} />
                      {lessons.length === 0 && <p className="mt-4 text-sm text-slate-600">검수 대기 중</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SubcategoryList({
  groupId,
  subcategories,
}: {
  groupId: string;
  subcategories: Array<{ id: string; label: string; lessons: LessonSummary[] }>;
}) {
  return (
    <div data-testid={`lesson-categories-${groupId}`} className="mt-4 grid gap-2">
      {subcategories.map((subcategory) => (
        <details
          key={subcategory.id}
          data-testid={`lesson-category-${groupId}-${subcategory.id}`}
          className="group/category rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 open:bg-white"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 text-sm font-bold text-slate-700 marker:hidden">
            <span>{subcategory.label}</span>
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              세부 {subcategory.lessons.length}개
              <span aria-hidden="true" className="text-[#16697a] transition-transform group-open/category:rotate-90">
                ▶
              </span>
            </span>
          </summary>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <Link
              data-testid={`lesson-family-link-${groupId}-${subcategory.id}`}
              href={getLessonFamilyHref(groupId, subcategory.id)}
              className="group/family flex items-start gap-3 rounded-xl bg-[#eaf7f6] p-4 text-[#173957] transition hover:bg-[#dff2f0]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#16697a] text-white">
                <Layers3 size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black uppercase tracking-[.12em] text-[#16697a]">통합 학습</span>
                <strong className="mt-1 block">{subcategory.label} 묶어서 이해하기</strong>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  관련 용어 → 포괄 원리 → 개념별 차이 → 실무 적용 → 실제 문항 함정
                </span>
              </span>
              <ArrowRight size={16} className="mt-2 shrink-0 transition group-hover/family:translate-x-1" />
            </Link>
            <details className="mt-2 rounded-lg bg-slate-50 px-2 py-1">
              <summary className="cursor-pointer list-none px-2 py-2 text-xs font-bold text-slate-500 marker:hidden">
                세부 개념 {subcategory.lessons.length}개 바로가기
              </summary>
              <LessonList lessons={subcategory.lessons} />
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}

function LessonList({ lessons }: { lessons: LessonSummary[] }) {
  return (
    <ul className="grid gap-1 border-t border-slate-100 pt-2">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <Link
            href={`/written/theory/${lesson.id}`}
            className="group/lesson flex items-center justify-between rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-[#eaf7f6] hover:text-[#16697a]"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} />
              {lesson.title}
            </span>
            <ArrowRight size={14} className="opacity-0 group-hover/lesson:opacity-100" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
