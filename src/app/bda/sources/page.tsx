import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, FileCheck2, ShieldAlert } from "lucide-react";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";

export const metadata: Metadata = {
  title: "수집·검수 현황",
  description: "v0.4 문제은행의 회차, 출처, 커버리지, 검수 대기 상태를 확인합니다.",
};

export default function BdaSourcesPage() {
  const qbank = getBdaQbank();
  const sortedRounds = [...qbank.rounds].sort((a, b) => a.id.localeCompare(b.id));
  const coverageByStatus = qbank.coverage.reduce<Record<string, number>>((result, item) => {
    const key = item.coverageStatus ?? "미분류";
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});

  return (
    <main className="page-wrap pb-16">
      <header className="py-10 sm:py-14">
        <p className="eyebrow">Provenance and review</p>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-black text-[#142f4b]">
          <Database className="text-[#0f766e]" /> 수집·검수 현황
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          이 페이지는 수집량을 완성도와 혼동하지 않기 위한 관리 화면입니다. 출처 위치, 회차 단위 상태,
          재구성 범위, 신뢰등급, 검수 대기를 분리해 기록합니다.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <Stat value={qbank.stats.sourceInventoryCount} label="출처 인벤토리" />
        <Stat value={qbank.stats.linkedInventoryCount} label="학습항목 연결" />
        <Stat
          value={qbank.stats.heldInventoryCount}
          label="주제 미확보 HOLD"
          tone="amber"
        />
        <Stat value={qbank.stats.learningItemCount} label="학습 재구성" />
        <Stat value={qbank.stats.conceptCount} label="정규화 개념" />
        <Stat value={qbank.stats.practicalTaskCount} label="실기 과제" />
        <Stat value={qbank.stats.reviewPriorityCount} label="우선 검수" tone="amber" />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="card p-6">
          <p className="eyebrow">Written inventory</p>
          <h2 className="mt-2 text-2xl font-black text-[#142f4b]">필기 원시 인벤토리 587건</h2>
          <p className="mt-3 leading-7 text-slate-600">
            NewBT 제2~8회 등록 위치와 영진 CBT 모의69의 위치를 회차·문항번호·출처 URL 중심으로 보관합니다.
            원문과 선지를 복제하지 않았으며, 상세 주제·학습 재구성 여부는 개별 행의 상태로 분리했습니다.
            183건은 학습항목과 연결했고, 404건은 원문·주제가 없어 임의 분류하지
            않고 HOLD 사유를 기록했습니다.
          </p>
          <Link href="/bda/sources/inventory" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173957] px-4 py-3 text-sm font-black text-white">
            인벤토리 열기 <ArrowRight size={16} />
          </Link>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <ShieldAlert className="text-amber-700" />
          <h2 className="mt-4 text-xl font-black text-amber-950">공식성·정답 표기 원칙</h2>
          <p className="mt-3 text-sm leading-7 text-amber-950">
            원자료가 공식 시험문제·공식 답안을 의미하지 않는다는 원칙을 유지합니다. 항목별 `source_type`,
            `evidence_grade`, 답안·기술 검토 상태가 불명확하면 초안 또는 검수 필요 상태로 남겨 둡니다.
          </p>
        </article>
      </section>

      <section className="mt-8 card overflow-hidden">
        <header className="border-b border-slate-200 p-6">
          <p className="eyebrow">Round ledger</p>
          <h2 className="mt-2 text-2xl font-black text-[#142f4b]">회차별 수집 대장</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black text-slate-600">
              <tr>
                <th className="px-5 py-4">회차·구분</th>
                <th className="px-5 py-4">시행 상태</th>
                <th className="px-5 py-4">필기 인벤토리</th>
                <th className="px-5 py-4">재구성 항목</th>
                <th className="px-5 py-4">최고 근거</th>
                <th className="px-5 py-4">다음 조치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRounds.map((round) => (
                <tr key={round.id} className="align-top text-slate-700">
                  <td className="px-5 py-4 font-bold text-[#142f4b]">{round.examRound} {round.examStage}<br /><span className="text-xs font-normal text-slate-500">{round.examDate}</span></td>
                  <td className="px-5 py-4">{round.roundStatus}<br /><span className="text-xs text-slate-500">{round.collectionStatus}</span></td>
                  <td className="px-5 py-4">{round.writtenSourceInventoryCount ?? 0}</td>
                  <td className="px-5 py-4">{round.reconstructedItemCount ?? 0}</td>
                  <td className="px-5 py-4">{round.bestEvidenceGrade ?? "-"}</td>
                  <td className="max-w-xs px-5 py-4 leading-6">{round.nextAction ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="card p-6">
          <p className="eyebrow">Concept coverage</p>
          <h2 className="mt-2 text-2xl font-black text-[#142f4b]">40개 개념의 커버리지</h2>
          <div className="mt-5 grid gap-3">
            {Object.entries(coverageByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-bold text-slate-700">{status}</span>
                <strong className="text-[#142f4b]">{count}개</strong>
              </div>
            ))}
          </div>
          <Link href="/bda/concepts" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0f766e] hover:underline">
            개념 지도 보기 <ArrowRight size={15} />
          </Link>
        </article>
        <article className="card p-6">
          <p className="eyebrow">Review queue</p>
          <h2 className="mt-2 text-2xl font-black text-[#142f4b]">우선 검수 {qbank.stats.reviewPriorityCount}건</h2>
          <div className="mt-5 grid gap-3">
            {qbank.reviewQueue.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-bold text-[#142f4b]">{item.id} · {item.topicSummary}</p>
                <p className="mt-1 leading-5 text-slate-600">{item.neededReview ?? item.technicalValidationStatus}</p>
              </div>
            ))}
          </div>
          <Link href="/bda/bank" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0f766e] hover:underline">
            학습 문제은행에서 상태 확인 <ArrowRight size={15} />
          </Link>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
        <FileCheck2 className="mr-2 inline-block align-text-bottom" size={17} />
        원본 워크북 SHA-256: <code className="font-bold">{qbank.sourceWorkbook.sha256}</code>
      </section>
    </main>
  );
}

function Stat({ value, label, tone = "teal" }: { value: number; label: string; tone?: "teal" | "amber" }) {
  return (
    <div className={`rounded-2xl p-5 ${tone === "amber" ? "bg-amber-50 text-amber-950" : "bg-[#173957] text-white"}`}>
      <strong className="text-3xl font-black">{value}</strong>
      <span className="mt-1 block text-sm font-bold opacity-80">{label}</span>
    </div>
  );
}
