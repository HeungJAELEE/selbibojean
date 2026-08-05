import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { getCbtSourceReconstructionSummary } from "@/lib/content/cbt-source-reconstruction";

export default function CbtSourceReviewPage() {
  const summary = getCbtSourceReconstructionSummary();
  const counts = summary.counts;

  return (
    <div className="page-wrap py-10">
      <PageHeading
        eyebrow="Source reconstruction"
        title="전 회차 CBT 원문 복원 원장"
        description="원문 캡처와 기존 오염 데이터를 분리해 관리합니다. 검토되지 않은 복원 문항은 학습 화면과 세션에 투입되지 않습니다."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Summary value={counts.variants} label="등록 variant" />
        <Summary value={counts.selectedQuestionsCaptured} label="원문 캡처 완료" />
        <Summary value={counts.publicationReady} label="공개 승인" />
        <Summary value={counts.publicationHolds} label="공개 HOLD" danger />
        <Summary value={counts.sourceImages} label="원문 이미지" />
        <Summary value={counts.reachableSourceImages} label="도달 가능 이미지" />
        <Summary
          value={counts.variantSpecificChoiceContractRequired}
          label="variant 선택지 계약 필요"
          danger
        />
        <Summary value={counts.sessions} label="복원 회차" />
      </div>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="font-extrabold">보존·이식 경계</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Info label="sourceAuthority" value={summary.sourceAuthority} />
          <Info label="화면 답안 표기" value={summary.answerDisplayLabel} />
          <Info label="원문 정책" value={summary.sourcePolicy} />
          <Info label="원장 생성 시각" value={summary.generatedAt} />
        </dl>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          원문 stem·ordered choices·answer index·이미지 상태는 source 계층이 소유합니다.
          기존 canonical ID·lesson·concept 연결은 유지하며, 정답·풀이·보기별 근거 검토가
          끝난 variant만 별도 승인할 수 있습니다.
        </p>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-200 p-5 md:p-6">
          <h2 className="font-extrabold">회차별 복원 상태</h2>
          <p className="mt-1 text-sm text-slate-500">
            등록 URL은 보존하고, 동일 시험일자 mirror URL을 사용한 경우 resolved URL을 별도로 기록합니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">회차</th>
                <th className="px-4 py-3">시험일</th>
                <th className="px-4 py-3">선택 문항</th>
                <th className="px-4 py-3">캡처</th>
                <th className="px-4 py-3">HOLD</th>
                <th className="px-4 py-3">원문</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.sessions.map((session) => (
                <tr key={session.registeredSourceUrl}>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {session.sessionKey}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {session.pageExamDate ?? "미확정"}
                  </td>
                  <td className="px-4 py-3">{session.expectedVariantCount}</td>
                  <td className="px-4 py-3">{session.selectedCapturedCount}</td>
                  <td className="px-4 py-3 font-bold text-rose-700">
                    {session.publicationHoldCount}
                  </td>
                  <td className="px-4 py-3">
                    {session.firstExternalId ? (
                      <Link
                        href={`/admin/review/cbt-sources/${session.firstExternalId}`}
                        className="font-bold text-[#16697a] underline-offset-4 hover:underline"
                      >
                        첫 문항 보기
                      </Link>
                    ) : (
                      <span className="text-slate-400">없음</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Link
        href="/admin/review"
        className="mt-7 inline-flex rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
      >
        기존 감사 목록으로 돌아가기
      </Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 break-all leading-6 text-slate-800">{value}</dd>
    </div>
  );
}

function Summary({
  value,
  label,
  danger = false,
}: {
  value: number;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="card p-5">
      <p className={`text-3xl font-black ${danger ? "text-rose-700" : "text-[#16697a]"}`}>
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
