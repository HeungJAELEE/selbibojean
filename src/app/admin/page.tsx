import Link from "next/link";
import { AlertOctagon, AlertTriangle, CheckCircle2, Database, FileSpreadsheet } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import { getWeldingSafetyReviewDataset } from "@/lib/content/welding-safety-review-repository";
import { isPublishableQuestion } from "@/lib/domain/practice";

export default async function AdminPage() {
  const content = await getContent();
  const { report } = content;
  const audited = content.questions.filter((question) => question.audit);
  const heldAudit = audited.filter((question) =>
    question.audit?.auditDisposition.startsWith("held_"),
  );
  const publishedQuestions = content.questions.filter(isPublishableQuestion);
  const weldingSafety = getWeldingSafetyReviewDataset();
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Owner admin"
        title="콘텐츠 검수 대시보드"
        description="정답·이론·분류·출처 조건을 모두 통과한 콘텐츠만 공개합니다. 검토와 차단 항목은 사유별로 분리해 관리합니다."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<Database />} value={content.questions.length} label="통합 대표 문제" />
        <Metric icon={<CheckCircle2 />} value={publishedQuestions.length} label="공개 완료" tone="success" />
        <Metric icon={<AlertTriangle />} value={audited.length - heldAudit.length} label="감사 승인" tone="warning" />
        <Metric icon={<AlertOctagon />} value={heldAudit.length} label="출처·위험 차단" tone="danger" />
        <Metric icon={<FileSpreadsheet />} value={report.rows.backlog} label="잔여 백로그" />
      </div>
      <div className="card mt-6 p-7">
        <h2 className="text-xl font-extrabold">최근 이관 대사</h2>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
          <div><dt className="text-slate-500">원본 체크섬</dt><dd className="mt-1 break-all font-mono">{report.sourceSha256}</dd></div>
          <div><dt className="text-slate-500">수량 대사</dt><dd className="mt-1 font-bold text-emerald-700">{report.exactMatch ? "일치" : "불일치 — 발행 차단"}</dd></div>
          <div><dt className="text-slate-500">원문 개념 별칭</dt><dd className="mt-1 font-bold">{report.uniqueConcepts.toLocaleString()}</dd></div>
          <div><dt className="text-slate-500">정규 개념</dt><dd className="mt-1 font-bold">{report.canonicalConcepts.toLocaleString()}</dd></div>
        </dl>
        <Link href="/admin/imports" className="mt-6 inline-block rounded-xl bg-[#173957] px-5 py-3 font-bold text-white">이관·검수 상세</Link>
        <Link href="/admin/review" className="ml-3 mt-6 inline-block rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700">근거 확인 대기 {heldAudit.length.toLocaleString()}건</Link>
        <Link href="/admin/review/welding-safety" className="ml-3 mt-6 inline-block rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-900">
          용접 안전 29~33차 {weldingSafety.status === "source_missing" ? "원본 대기" : `${weldingSafety.counts.importedQuestions}문항`}
        </Link>
      </div>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
  tone = "default",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const colors = {
    default: "text-[#16697a]",
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-rose-700",
  };
  return <div className="card p-6"><span className={colors[tone]}>{icon}</span><p className="mt-5 text-3xl font-black">{value.toLocaleString()}</p><p className="text-sm text-slate-500">{label}</p></div>;
}
