import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import type { Question, VerificationRiskTag } from "@/lib/domain/types";

const riskCopy: Record<VerificationRiskTag, { label: string; action: string }> = {
  asset_required: {
    label: "원문 자산 필요",
    action: "원문 이미지·도표·수식을 확보한 뒤 보기와 정답을 다시 대조합니다.",
  },
  answer_conflict: {
    label: "답안 충돌",
    action: "복수정답 또는 원문·공개답안 충돌을 확인하고 단일 정답 여부를 검수합니다.",
  },
  authoritative_source_required: {
    label: "공식 출처 필요",
    action: "현행 법령·표준·제조사 문서의 적용 범위와 조건을 확인합니다.",
  },
  historical_context: {
    label: "과거 시험 맥락",
    action: "시험 당시 기준과 현재 적용 기준을 구분해 표시합니다.",
  },
  editorial_reconstruction: {
    label: "학습용 재구성",
    action: "원문 의미와 정답 조건이 바뀌지 않았는지 대조합니다.",
  },
};

const officialSources = [
  {
    label: "Q-Net 설비보전기사 출제기준(2025–2028)",
    url: "https://www.q-net.or.kr/cst006.do?artlSeq=5212779&brdId=Q006&code=1202&gId=&gSite=Q&id=cst00602",
  },
  {
    label: "Q-Net 설비보전기사 종목 정보",
    url: "https://www.q-net.or.kr/crf005.do?gId=&gSite=Q&id=crf00503s01&jmCd=1837&jmInfoDivCcd=A0",
  },
  {
    label: "Q-Net KS 기계제도 규격 안내(2025)",
    url: "https://www.q-net.or.kr/man004.do?ARTL_SEQ=5228324&BOARD_ID=Q001&gSite=Q&id=man00402&notiType=40",
  },
  {
    label: "국가법령정보센터 산업안전보건법",
    url: "https://www.law.go.kr/법령/산업안전보건법",
  },
  {
    label: "NCS 국가직무능력표준 자료실",
    url: "https://www.ncs.go.kr/th06/bbs_lib_list.do?libDstinCd=47",
  },
];

function primaryRisk(question: Question) {
  const risks = question.verification?.riskTags ?? [];
  return (["asset_required", "answer_conflict", "authoritative_source_required"] as const)
    .find((risk) => risks.includes(risk)) ?? risks[0];
}

export default async function ReviewPage() {
  const content = await getContent();
  const blocked = content.questions
    .filter((question) => question.publication?.readiness === "blocked")
    .sort((a, b) => (primaryRisk(a) ?? "").localeCompare(primaryRisk(b) ?? "") || a.id.localeCompare(b.id));

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Evidence queue"
        title="공식 출처·원문 자산 검수 대기"
        description="일반 문제 정리는 완료했습니다. 추측해서 공개할 수 없는 문제만 원문 자산, 답안 충돌, 현행 공식 기준으로 나누어 남겼습니다."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary value={blocked.filter((question) => question.verification?.riskTags.includes("asset_required")).length} label="원문 자산" />
        <Summary value={blocked.filter((question) => question.verification?.riskTags.includes("answer_conflict")).length} label="답안 충돌" />
        <Summary value={blocked.filter((question) => question.verification?.riskTags.includes("authoritative_source_required")).length} label="공식 출처" />
      </div>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="font-extrabold">공식 검수 기준</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">현재 시험 범위와 제도 규격은 Q-Net, 안전 조문은 국가법령정보센터, 직무 범위는 NCS를 우선합니다. 제품별 수치와 운전조건은 해당 제조사의 최신 기술문서를 추가로 확인합니다.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {officialSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#16697a]">{source.label}</a>)}
        </div>
      </section>

      <div className="mt-6 grid gap-4">
        {blocked.map((question) => {
          const risk = primaryRisk(question);
          const copy = risk ? riskCopy[risk] : null;
          return (
            <article key={question.id} className="card p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-[#16697a]">{question.id}</strong>
                  {question.verification?.riskTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800">
                      {riskCopy[tag].label}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-slate-500">원문 {question.verification?.variantCount ?? 0}건</span>
              </div>
              <h2 className="mt-4 font-extrabold leading-7">{question.stem}</h2>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4"><dt className="font-bold text-slate-500">현재 정답 후보</dt><dd className="mt-1">{question.answerText}</dd></div>
                <div className="rounded-xl bg-slate-50 p-4"><dt className="font-bold text-slate-500">다음 검수 행동</dt><dd className="mt-1">{copy?.action ?? "원문 근거를 다시 확인합니다."}</dd></div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-slate-600">{question.explanation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {question.verification?.sourceUrls.map((url, index) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#16697a]">
                    원문 출처 {index + 1}
                  </a>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <Link href="/admin/imports" className="mt-7 inline-flex rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700">
        이관 대시보드로 돌아가기
      </Link>
    </div>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return <div className="card p-5"><p className="text-3xl font-black text-rose-700">{value.toLocaleString()}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>;
}
