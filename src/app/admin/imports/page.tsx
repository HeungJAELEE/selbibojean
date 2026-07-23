import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import type { PublicationBlocker } from "@/lib/domain/types";

const blockerLabels: Record<PublicationBlocker, string> = {
  incomplete: "정답·보기·근거 미완성",
  answer_unverified: "정답 검수 필요",
  mapping_unverified: "세부항목군 분류 필요",
  high_risk_source: "법령·안전·표준 등 권위 출처 필요",
  content_quality: "이론·해설 품질 미달",
  lesson_source_needed: "독립 이론 근거 필요",
};

export default async function ImportsPage() {
  const { report } = await getContent();
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Import batches"
        title="엑셀 이관·검수"
        description="비공개 업로드 → 대사 → 이론·선택지 설명 생성 → 위험도 분류 → 검수 → 승인 발행 순서로 관리합니다."
      />
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-extrabold">27차 웹앱설계.xlsx</h2>
          <p className="mt-1 text-sm text-slate-500">{new Date(report.generatedAt).toLocaleString("ko-KR")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-slate-50"><tr><th className="p-4">대상</th><th className="p-4">기준</th><th className="p-4">실제</th><th className="p-4">상태</th></tr></thead>
            <tbody>{Object.entries(report.rows).map(([key, value]) => <tr key={key} className="border-t border-slate-100"><td className="p-4 font-bold">{key}</td><td className="p-4">{report.expected[key as keyof typeof report.expected]}</td><td className="p-4">{value}</td><td className="p-4 font-bold text-emerald-700">일치</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="font-extrabold">공개 범위</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Status value={report.publication.ready} label="공개 완료" className="bg-emerald-50 text-emerald-800" />
          <Status value={report.publication.review} label="내용 검토" className="bg-amber-50 text-amber-800" />
          <Status value={report.publication.blocked} label="출처·위험 차단" className="bg-rose-50 text-rose-800" />
        </div>
        <h3 className="mt-7 font-bold">검토·차단 사유</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          {(Object.entries(report.publication.blockerCounts) as Array<[PublicationBlocker, number]>).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><dt>{blockerLabels[key]}</dt><dd className="font-extrabold">{value.toLocaleString()}</dd></div>
          ))}
        </dl>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="font-extrabold">세부항목군 분류 검수</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">자동분류 경고는 검토 매핑으로 확정했으며, 이후 키워드가 바뀌어도 같은 원문 개념은 검토된 세부항목군을 유지합니다.</p>
        <p className={`mt-3 font-bold ${report.warnings.length === 0 ? "text-emerald-700" : "text-amber-700"}`}>남은 분류 경고 {report.warnings.length}건</p>
      </section>
    </div>
  );
}

function Status({ value, label, className }: { value: number; label: string; className: string }) {
  return <div className={`rounded-2xl p-5 ${className}`}><p className="text-3xl font-black">{value.toLocaleString()}</p><p className="mt-1 text-sm font-bold">{label}</p></div>;
}
