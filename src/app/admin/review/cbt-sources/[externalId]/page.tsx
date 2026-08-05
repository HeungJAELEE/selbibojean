import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdjacentCbtSourceReconstructionRecords,
  getCbtSourceReconstructionRecord,
} from "@/lib/content/cbt-source-reconstruction";

export default async function CbtSourceRecordPage({
  params,
}: {
  params: Promise<{ externalId: string }>;
}) {
  const { externalId } = await params;
  const record = getCbtSourceReconstructionRecord(externalId);
  if (!record) notFound();
  const adjacent = getAdjacentCbtSourceReconstructionRecords(externalId);
  const imageUrls = record.source
    ? [
        ...record.source.stemImageUrls,
        ...record.source.choiceImageUrls.flat(),
      ]
    : [];

  return (
    <div className="page-wrap max-w-6xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/review/cbt-sources"
          className="text-sm font-bold text-slate-500"
        >
          ← 전 회차 복원 원장
        </Link>
        <div className="flex gap-2">
          {adjacent.previous && (
            <Link
              href={`/admin/review/cbt-sources/${adjacent.previous.externalId}`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
            >
              이전
            </Link>
          )}
          {adjacent.next && (
            <Link
              href={`/admin/review/cbt-sources/${adjacent.next.externalId}`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
            >
              다음
            </Link>
          )}
        </div>
      </div>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-[#16697a]">{record.externalId}</strong>
          <Badge danger={record.publicationStatus === "hold"}>
            {record.publicationStatus.toUpperCase()}
          </Badge>
          <Badge>{record.sourceDisplayLabel}</Badge>
          <Badge>{record.sourceAuthority}</Badge>
        </div>
        <h1 className="mt-4 text-2xl font-black leading-9 text-slate-900">
          {record.source.exactStem}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {record.pageExamDate ?? record.year} · {record.sessionLabel} · 문제 {record.questionNumber}
        </p>
      </header>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="font-extrabold">원문 보기</h2>
        <ol className="mt-4 grid gap-3">
          {record.source.exactChoices.map((choice, index) => {
            const isSourceAnswer = record.source.answerIndex === index;
            return (
              <li
                key={record.variantChoiceIds[index]}
                className={`rounded-xl border p-4 ${
                  isSourceAnswer
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex gap-3">
                  <strong className="shrink-0 text-[#16697a]">{index + 1}</strong>
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap leading-7">{choice}</p>
                    <p className="mt-2 break-all text-xs text-slate-500">
                      {record.variantChoiceIds[index]}
                      {isSourceAnswer ? " · 복원 정답" : ""}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-5 md:p-6">
          <h2 className="font-extrabold">source identity</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Info label="등록 URL" value={record.registeredSourceUrl} link />
            <Info label="실제 캡처 URL" value={record.resolvedSourceUrl} link />
            <Info label="URL 해소 방식" value={record.sourceUrlResolution} />
            <Info label="페이지 제목" value={record.pageTitle} />
            <Info label="지문 SHA-256" value={record.source.stemSha256} mono />
            <Info
              label="ordered choices SHA-256"
              value={record.source.orderedChoicesSha256}
              mono
            />
            <Info
              label="회차 URL+문항번호+지문+보기 identity"
              value={record.source.registeredIdentitySha256}
              mono
            />
          </dl>
        </section>

        <section className="card p-5 md:p-6">
          <h2 className="font-extrabold">기존 시스템 연결</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Info label="canonicalId" value={record.canonicalId} mono />
            <Info
              label="lesson"
              value={
                record.theoryLink
                  ? `${record.theoryLink.lessonId}#${record.theoryLink.lessonAnchor}`
                  : "누락"
              }
              mono
            />
            <Info
              label="conceptGroup / concept"
              value={
                record.theoryLink
                  ? `${record.theoryLink.conceptGroupId} / ${record.theoryLink.conceptId}`
                  : "누락"
              }
              mono
            />
            <Info label="현재 지문 fidelity" value={record.current.stemFidelity} />
            <Info label="현재 보기 fidelity" value={record.current.choicesFidelity} />
            <Info
              label="현재 답안 vs source"
              value={String(record.current.answerMatchesSource)}
            />
            <Info
              label="canonical 지문 fidelity"
              value={record.canonical?.stemFidelity ?? "누락"}
            />
            <Info
              label="canonical 보기 fidelity"
              value={record.canonical?.orderedChoicesFidelity ?? "누락"}
            />
          </dl>
        </section>
      </div>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="font-extrabold">공개·이식 게이트</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {record.publicationHoldReasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800"
            >
              {reason}
            </span>
          ))}
        </div>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Info label="source answer index" value={String(record.source.answerIndex)} />
          <Info label="answer evidence" value={record.answerEvidence} />
          <Info label="stable choice mapping" value={record.stableChoiceMappingStatus} />
          <Info label="image requirement" value={record.imageRequirement} />
          <Info label="image status" value={record.imageStatus} />
          <Info label="source/canonical answer alignment" value={record.answerAlignmentStatus} />
        </dl>
      </section>

      {imageUrls.length > 0 && (
        <section className="card mt-6 p-5 md:p-6">
          <h2 className="font-extrabold">원문 이미지</h2>
          <div className="mt-4 grid gap-2">
            {imageUrls.map((url, index) => (
              <a
                key={`${url}:${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="break-all rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-[#16697a]"
              >
                이미지 {index + 1}: {url}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Badge({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        danger
          ? "bg-rose-50 text-rose-800"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}

function Info({
  label,
  value,
  mono = false,
  link = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd
        className={`mt-1 break-all whitespace-pre-wrap leading-6 text-slate-800 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {link ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-[#16697a] underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
