import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import type {
  AuditDisposition,
  Question,
  VerificationRiskTag,
} from "@/lib/domain/types";

const dispositionCopy: Record<
  AuditDisposition,
  { label: string; tone: string; defaultAction: string }
> = {
  verified: {
    label: "검증 완료",
    tone: "bg-emerald-50 text-emerald-800",
    defaultAction: "근거 개정 여부를 정기적으로 확인합니다.",
  },
  cbt_corrected: {
    label: "CBT 답안 보정",
    tone: "bg-amber-50 text-amber-900",
    defaultAction: "CBT 공개답과 검증 답을 제출 후 화면에 함께 표시합니다.",
  },
  held_answer_conflict: {
    label: "정답 충돌 보류",
    tone: "bg-rose-50 text-rose-800",
    defaultAction: "상위 근거로 정답 충돌을 해소하기 전까지 공개하지 않습니다.",
  },
  held_asset_missing: {
    label: "필수 그림 누락",
    tone: "bg-rose-50 text-rose-800",
    defaultAction: "원문 그림·도면을 확보하고 보기와 정답을 다시 대조합니다.",
  },
  held_source_missing: {
    label: "근거 부족 보류",
    tone: "bg-rose-50 text-rose-800",
    defaultAction: "공식 1차 자료 또는 독립적인 전문자료 2개를 확보합니다.",
  },
};

const riskLabels: Record<VerificationRiskTag, string> = {
  asset_required: "원문 자산 필요",
  answer_conflict: "답안 충돌",
  authoritative_source_required: "공식 출처 필요",
  historical_context: "과거 기준",
  editorial_reconstruction: "학습용 재구성",
};

const heldDispositions = new Set<AuditDisposition>([
  "held_answer_conflict",
  "held_asset_missing",
  "held_source_missing",
]);

export default async function ReviewPage() {
  const content = await getContent();
  const audited = content.questions.filter((question) => question.audit);
  const held = content.questions
    .filter(
      (question) =>
        (question.audit && heldDispositions.has(question.audit.auditDisposition)) ||
        question.publication?.readiness === "blocked",
    )
    .sort(
      (left, right) =>
        (left.audit?.auditDisposition ?? "").localeCompare(
          right.audit?.auditDisposition ?? "",
        ) || left.id.localeCompare(right.id),
    );

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Evidence queue"
        title="필기 문제 감사·보류 목록"
        description="정답 충돌, 필수 그림 누락, 신뢰 가능한 근거 부족 문제는 모든 공개 경로에서 제외됩니다. 각 카드에서 보류 사유와 다음 조치를 확인할 수 있습니다."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Summary value={audited.length} label="감사 대상" />
        <Summary
          value={audited.filter((item) => item.audit?.auditDisposition === "verified").length}
          label="검증 완료"
        />
        <Summary
          value={audited.filter((item) => item.audit?.auditDisposition === "cbt_corrected").length}
          label="CBT 보정"
        />
        <Summary
          value={held.filter((item) => item.audit?.auditDisposition === "held_asset_missing").length}
          label="그림 누락"
        />
        <Summary value={held.length} label="공개 보류" danger />
      </div>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="font-extrabold">검증 원칙</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
          <li>1. 공식 출제기관·법령·KS/ISO 등 1차 근거를 우선합니다.</li>
          <li>2. 제조사 조건은 해당 제조사의 최신 기술자료로 적용 범위를 확인합니다.</li>
          <li>3. 일반 기술개념은 독립적인 전문자료 2개가 일치할 때만 승인합니다.</li>
          <li>4. 그림이 정답에 필수인데 원문이 없으면 내용을 추정하지 않습니다.</li>
        </ol>
      </section>

      <div className="mt-6 grid gap-4">
        {held.map((question) => (
          <ReviewCard key={question.id} question={question} />
        ))}
      </div>

      <Link
        href="/admin/imports"
        className="mt-7 inline-flex rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
      >
        이관 대시보드로 돌아가기
      </Link>
    </div>
  );
}

function ReviewCard({ question }: { question: Question }) {
  const audit = question.audit;
  const disposition = audit
    ? dispositionCopy[audit.auditDisposition]
    : {
        label: "기존 발행 차단",
        tone: "bg-rose-50 text-rose-800",
        defaultAction: "기존 검증 위험 태그를 해소합니다.",
      };
  const evidenceUrls = audit?.evidenceUrls ?? question.verification?.sourceUrls ?? [];

  return (
    <article className="card p-5 md:p-6" data-testid={`audit-review-${question.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-[#16697a]">{question.id}</strong>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${disposition.tone}`}>
            {disposition.label}
          </span>
          {question.verification?.riskTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
            >
              {riskLabels[tag]}
            </span>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          자산: {audit?.assetStatus ?? "기존 상태"} · 근거: {audit?.evidenceLevel ?? "미확정"}
        </span>
      </div>

      <h2 className="mt-4 font-extrabold leading-7">{question.stem}</h2>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <Info label="CBT 공개답" value={audit?.cbtAnswer ?? question.answerText} />
        <Info label="검증된 정답" value={audit?.verifiedAnswer ?? "미확정"} />
        <Info
          label="검토 메모"
          value={audit?.reviewNote ?? question.verification?.note ?? "추가 검수가 필요합니다."}
        />
        <Info
          label="다음 조치"
          value={audit?.nextAction ?? disposition.defaultAction}
        />
      </dl>

      {evidenceUrls.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {evidenceUrls.map((url, index) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#16697a]"
            >
              근거 후보 {index + 1}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap leading-6">{value}</dd>
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
