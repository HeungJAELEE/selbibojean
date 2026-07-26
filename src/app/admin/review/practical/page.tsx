import { getPracticalContent } from "@/lib/content/practical-repository";
import {
  PRACTICAL_WORK_MODULES,
  PRACTICAL_WORK_TASKS,
} from "@/data/source/practical-work-tasks";

export default async function PracticalReviewPage() {
  const content = await getPracticalContent();
  const held = content.questions.filter(
    (question) => question.contentStatus !== "published",
  );
  const totalSteps = PRACTICAL_WORK_TASKS.reduce(
    (sum, task) => sum + task.steps.length,
    0,
  );
  const totalMeasurements = PRACTICAL_WORK_TASKS.reduce(
    (sum, task) => sum + task.measurements.length,
    0,
  );
  return (
    <div>
      <p className="eyebrow">관리자 검수</p>
      <h1 className="display mt-3 text-3xl font-bold">
        실기 콘텐츠·원문·정답·이미지 검수
      </h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          ["기출 공개", content.report.publication.past],
          ["예상 공개", content.report.publication.predicted],
          ["개념 공개", content.report.publication.concepts],
          ["작업형 교재", PRACTICAL_WORK_MODULES.length],
          ["수행과제", PRACTICAL_WORK_TASKS.length],
          ["보류", content.report.publication.held],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 card p-6" aria-labelledby="work-coverage-heading">
        <h2 id="work-coverage-heading" className="text-xl font-extrabold">
          NCS 11권 작업형 구축 현황
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          필답 전용 Coverage의 task·record 제외 상태와 별개로, 아래 모듈은 실제
          수행과제·안전·단계·측정·판정·진단·기록 산출물에 연결됩니다.
        </p>
        <p className="mt-3 text-sm font-extrabold text-[#16697a]">
          {PRACTICAL_WORK_MODULES.length}/11권 · {PRACTICAL_WORK_TASKS.length}
          과제 · {totalSteps}단계 · {totalMeasurements}측정
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["NCS", "교재", "과제", "이론 연결", "기록"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-extrabold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRACTICAL_WORK_MODULES.map((module) => (
                <tr key={module.ncsCode} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-bold">{module.ncsCode}</td>
                  <td className="px-4 py-3">{module.documentTitle}</td>
                  <td className="px-4 py-3">{module.taskIds.length}개</td>
                  <td className="px-4 py-3">{module.conceptIds.length}개</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">
                    기기 저장·인쇄
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
