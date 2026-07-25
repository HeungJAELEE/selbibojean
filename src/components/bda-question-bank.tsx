"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Filter, SearchX } from "lucide-react";
import type {
  BdaQbankConcept,
  BdaQbankLearningItem,
} from "@/lib/domain/bda-qbank";

type Props = {
  items: BdaQbankLearningItem[];
  concepts: BdaQbankConcept[];
  initialConceptId?: string;
};

export function BdaQuestionBank({ items, concepts, initialConceptId }: Props) {
  const [subjectNo, setSubjectNo] = useState("all");
  const [conceptId, setConceptId] = useState(initialConceptId ?? "all");
  const [platform, setPlatform] = useState("all");
  const [validation, setValidation] = useState("all");

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (subjectNo !== "all" && item.subjectNo !== Number(subjectNo)) return false;
        if (conceptId !== "all" && !item.conceptIds.includes(conceptId)) return false;
        if (platform !== "all" && item.platform !== platform) return false;
        return validation === "all" || item.technicalValidationStatus === validation;
      }),
    [conceptId, items, platform, subjectNo, validation],
  );

  const subjectOptions = [...new Set(items.map((item) => item.subjectNo).filter(Boolean))].sort();
  const platformOptions = [...new Set(items.map((item) => item.platform).filter(Boolean))].sort();
  const validationOptions = [
    ...new Set(items.map((item) => item.technicalValidationStatus).filter(Boolean)),
  ].sort();
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));

  return (
    <>
      <section className="card p-4 sm:p-5" aria-label="문제은행 필터">
        <div className="flex items-center gap-2 text-sm font-black text-[#142f4b]">
          <Filter size={17} className="text-[#0f766e]" /> 탐색 필터
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="과목" value={subjectNo} onChange={setSubjectNo}>
            <option value="all">전체 과목</option>
            {subjectOptions.map((value) => (
              <option key={value} value={value}>{value}과목</option>
            ))}
          </FilterSelect>
          <FilterSelect label="개념" value={conceptId} onChange={setConceptId}>
            <option value="all">전체 개념</option>
            {concepts.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.id} · {concept.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="자료" value={platform} onChange={setPlatform}>
            <option value="all">전체 자료</option>
            {platformOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </FilterSelect>
          <FilterSelect label="기술 검토" value={validation} onChange={setValidation}>
            <option value="all">전체 상태</option>
            {validationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </FilterSelect>
        </div>
      </section>

      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="text-sm text-slate-600">
          <strong className="text-[#142f4b]">{filtered.length}</strong>개 학습 재구성 항목
        </p>
        <p className="text-xs text-slate-500">원문·선지 복제가 아닌 학습용 재구성만 표시합니다.</p>
      </div>

      {filtered.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/bda/bank/${item.id}`}
              className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-500">
                    {item.subjectNo}과목 · {item.subjectName} · {item.platform}
                  </p>
                  <h2 className="mt-2 text-lg font-black text-[#142f4b]">{item.topicSummary}</h2>
                </div>
                <ArrowRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                {item.paraphrasedLearningPrompt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.conceptIds.map((id) => (
                  <span key={id} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                    {id} {conceptsById.get(id)?.name}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                  {item.questionMode}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                  {item.technicalValidationStatus}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <SearchX className="text-slate-400" /> 조건에 맞는 학습 항목이 없습니다. 필터를 조정해 보세요.
        </div>
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-[#142f4b]"
      >
        {children}
      </select>
    </label>
  );
}
