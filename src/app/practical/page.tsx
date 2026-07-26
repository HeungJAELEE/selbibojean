import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import {
  getPracticalContent,
  publicPracticalQuestions,
} from "@/lib/content/practical-repository";
import {
  PRACTICAL_WORK_MODULES,
  PRACTICAL_WORK_TASKS,
} from "@/data/source/practical-work-tasks";

export default async function PracticalPage() {
  const content = await getPracticalContent();
  const pastCount = publicPracticalQuestions("past").length;
  const predictedCount = publicPracticalQuestions("predicted").length;
  const sourceConceptCount = content.report.publication.concepts;
  const supplementalConceptCount = content.report.publication.supplementalConcepts;
  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="Practical"
        title="실기 학습"
        description="필답형 기출복원·출제예상·NCS 원문 개념과 실제 작업형 과제를 분리해 학습합니다."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <PracticalCard
          href="/practical/written/theory"
          icon={<GraduationCap />}
          title="필답형 실기 이론"
          text={`출제복원에 연결된 ${sourceConceptCount}개와 NCS 원문을 직접 대조한 ${supplementalConceptCount}개 보강 개념을 정의·공식·순서·판독 기준으로 학습합니다.`}
          label={`출제연결 ${sourceConceptCount}개 · NCS 보강 ${supplementalConceptCount}개`}
        />
        <PracticalCard
          href="/practical/written/past"
          icon={<ClipboardCheck />}
          title="필답형 기출복원"
          text={`응시자 복원 중 NCS 원문과 정답 근거가 확인된 ${pastCount}문제를 공개합니다.`}
          label={`${pastCount}문제`}
        />
        <PracticalCard
          href="/practical/written/predicted"
          icon={<BookOpen />}
          title="필답형 출제예상"
          text="최근 출제형식과 NCS 수행내용을 결합한 예상문제입니다. 실제 기출통계에는 포함하지 않습니다."
          label={`${predictedCount}/${content.report.rows.predicted} 공개`}
        />
        <PracticalCard
          href="/practical/work"
          icon={<Wrench />}
          title="작업형"
          text="NCS 11권의 누락 이론을 실제 준비·안전·수행·측정·판정·진단·기록 과제로 연결해 학습합니다."
          label={`${PRACTICAL_WORK_MODULES.length}권 · ${PRACTICAL_WORK_TASKS.length}과제`}
        />
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        보류 문제 {content.report.publication.held}개는 정답 충돌, 원문 이미지
        누락 또는 근거 부족 사유가 해소될 때까지 검색·문제풀이·통계에서
        제외됩니다.
      </div>
    </div>
  );
}

function PracticalCard({
  href,
  icon,
  title,
  text,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="card group p-7 transition hover:-translate-y-1 hover:border-[#16697a]"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
        {icon}
      </span>
      <p className="mt-6 text-xs font-extrabold text-[#8f3f0a]">{label}</p>
      <h2 className="mt-2 text-xl font-extrabold">{title}</h2>
      <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
        시작하기 <ArrowRight size={16} />
      </span>
    </Link>
  );
}
