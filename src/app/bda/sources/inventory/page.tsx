import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "필기 출처 인벤토리",
  description: "v0.4에서 관리하는 587개 필기 출처 위치와 이관 상태입니다.",
};

export default function BdaInventoryPage() {
  const qbank = getBdaQbank();

  return (
    <main className="page-wrap pb-16 pt-8">
      <Link href="/bda/sources" className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] hover:underline">
        <ArrowLeft size={16} /> 수집·검수 현황으로
      </Link>
      <header className="py-7">
        <p className="eyebrow">Source locations only</p>
        <h1 className="mt-3 text-3xl font-black text-[#142f4b]">필기 출처 인벤토리</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          총 {qbank.stats.sourceInventoryCount}행입니다. 원문·선지·제3자 해설을 복제하지 않고, 회차·문항번호·출처
          위치·재구성 상태·검수 상태만 보관합니다. 상세 주제가 확인된 경우에도 학습용 요약만 표시합니다.
        </p>
      </header>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black text-slate-600">
              <tr>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">플랫폼·회차</th>
                <th className="px-4 py-4">문항 위치</th>
                <th className="px-4 py-4">학습 주제</th>
                <th className="px-4 py-4">재구성·검수</th>
                <th className="px-4 py-4">판정</th>
                <th className="px-4 py-4">출처</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qbank.inventory.map((item) => (
                <tr key={item.id} className="align-top text-slate-700">
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-bold text-[#142f4b]">{item.platform}<br /><span className="text-xs font-normal text-slate-500">{item.examRoundLabel ?? item.sourceSetType}</span></td>
                  <td className="px-4 py-3">{item.sourceItemNo}<br /><span className="text-xs text-slate-500">{item.subjectNameInferred}</span></td>
                  <td className="max-w-sm px-4 py-3 leading-6">{item.topicSummary ?? "주제 추출 대기"}</td>
                  <td className="px-4 py-3 text-xs leading-5">{item.reconstructionStatus}<br />{item.technicalValidationStatus ?? item.answerStatus}</td>
                  <td className="max-w-xs px-4 py-3 text-xs leading-5">
                    <strong
                      className={
                        item.publicationStatus === "held"
                          ? "text-amber-800"
                          : "text-emerald-800"
                      }
                    >
                      {item.publicationStatus === "held"
                        ? "HOLD"
                        : "학습항목 연결"}
                    </strong>
                    {item.holdReason ? (
                      <span className="mt-1 block text-slate-500">
                        {item.holdReason}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {item.sourcePageUrl ? <a href={item.sourcePageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#0f766e] hover:underline">위치 열기 <ExternalLink size={13} /></a> : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
