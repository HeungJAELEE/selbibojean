import { getPracticalContent } from "@/lib/content/practical-repository";

export default async function PracticalReviewPage() {
  const content = await getPracticalContent();
  const held = content.questions.filter(
    (question) => question.contentStatus !== "published",
  );
  return (
    <div>
      <p className="eyebrow">관리자 검수</p>
      <h1 className="display mt-3 text-3xl font-bold">실기 원문·정답·이미지 보류</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["기출 공개", content.report.publication.past],
          ["예상 공개", content.report.publication.predicted],
          ["개념 공개", content.report.publication.concepts],
          ["보류", content.report.publication.held],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["문항", "구분", "보류상태", "사유·다음 조치", "NCS 근거"].map(
                (heading) => (
                  <th key={heading} className="px-4 py-3 font-extrabold">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {held.map((question) => (
              <tr key={question.id} className="border-t border-slate-200 align-top">
                <td className="px-4 py-4">
                  <strong>{question.id}</strong>
                  <span className="mt-1 block text-slate-600">{question.title}</span>
                </td>
                <td className="px-4 py-4">{question.kind}</td>
                <td className="px-4 py-4 font-bold text-red-700">
                  {question.auditDisposition}
                </td>
                <td className="max-w-md px-4 py-4 leading-6">{question.reviewNote}</td>
                <td className="px-4 py-4">
                  {question.ncsSources.length > 0
                    ? question.ncsSources
                        .map(
                          (source) =>
                            `${source.ncsCode} p.${source.pdfPage ?? "?"}`,
                        )
                        .join(", ")
                    : "원문 추가 확보 필요"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
