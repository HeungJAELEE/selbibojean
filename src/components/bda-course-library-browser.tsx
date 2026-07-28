"use client";

import { useMemo, useState } from "react";
import {
  BookOpenText,
  Braces,
  Database,
  File,
  FileCode2,
  Files,
  FilterX,
  Search,
  ShieldAlert,
} from "lucide-react";
import type {
  BdaCourseDomain,
  BdaCourseLibraryItem,
  BdaCourseRole,
  BdaPracticalTrack,
} from "@/lib/domain/bda-course-library";

export type PublicBdaCourseResource = Pick<
  BdaCourseLibraryItem,
  | "id"
  | "relativePath"
  | "fileName"
  | "title"
  | "extension"
  | "bytes"
  | "sourceGroup"
  | "week"
  | "domain"
  | "role"
  | "practicalTrack"
  | "examRelevance"
  | "handling"
  | "reviewFlags"
  | "duplicateOf"
  | "firstMeaningfulLine"
  | "notebook"
  | "csv"
>;

const domainLabels: Record<BdaCourseDomain, string> = {
  "python-foundations": "Python 기초",
  "data-handling": "데이터 처리",
  sql: "SQL",
  statistics: "통계",
  "machine-learning": "머신러닝",
  "deep-learning": "딥러닝",
  "generative-ai": "생성형 AI",
  "data-engineering": "데이터 엔지니어링",
  project: "프로젝트",
  research: "연구",
  general: "기타",
};

const roleLabels: Record<BdaCourseRole, string> = {
  lecture: "강의자료",
  notebook: "노트북",
  code: "코드",
  dataset: "데이터셋",
  database: "데이터베이스",
  project: "프로젝트",
  report: "보고서",
  image: "이미지",
  archive: "압축파일",
  reference: "참고자료",
};

const relevanceLabels = {
  core: "시험 핵심",
  supporting: "보조 역량",
  supplementary: "확장 학습",
  "manual-review": "수동 분류",
} as const;

const practicalTrackLabels: Record<BdaPracticalTrack, string> = {
  prerequisite: "Python 선수 지식",
  type1: "유형 1 직접 대비",
  type2: "유형 2 직접 대비",
  type3: "유형 3 직접 대비",
  submission: "제출 검수",
  supplementary: "시험 밖 보충",
  "manual-review": "분류 검토 필요",
};

const relevancePriority = {
  core: 0,
  supporting: 1,
  supplementary: 2,
  "manual-review": 3,
} as const;

const rolePriority: Record<BdaCourseRole, number> = {
  notebook: 0,
  code: 1,
  lecture: 2,
  project: 3,
  report: 4,
  dataset: 5,
  database: 6,
  image: 7,
  reference: 8,
  archive: 9,
};

const INITIAL_VISIBLE = 24;

export function BdaCourseLibraryBrowser({
  items,
}: {
  items: PublicBdaCourseResource[];
}) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<"all" | BdaCourseDomain>("all");
  const [role, setRole] = useState<"all" | BdaCourseRole>("all");
  const [track, setTrack] = useState<"all" | BdaPracticalTrack>("all");
  const [relevance, setRelevance] = useState<
    "all" | BdaCourseLibraryItem["examRelevance"]
  >("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const browseableItems = useMemo(
    () =>
      items
        .filter((item) => item.handling !== "exclude-runtime")
        .toSorted(
          (left, right) =>
            relevancePriority[left.examRelevance] -
              relevancePriority[right.examRelevance] ||
            rolePriority[left.role] - rolePriority[right.role] ||
            Number(Boolean(left.duplicateOf)) -
              Number(Boolean(right.duplicateOf)) ||
            left.title.localeCompare(right.title, "ko"),
        ),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko");
    return browseableItems.filter((item) => {
      if (domain !== "all" && item.domain !== domain) return false;
      if (role !== "all" && item.role !== role) return false;
      if (track !== "all" && item.practicalTrack !== track) return false;
      if (relevance !== "all" && item.examRelevance !== relevance) return false;
      if (!normalizedQuery) return true;
      return `${item.title} ${item.relativePath} ${item.extension}`
        .toLocaleLowerCase("ko")
        .includes(normalizedQuery);
    });
  }, [browseableItems, domain, query, relevance, role, track]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasFilters =
    query.length > 0 ||
    domain !== "all" ||
    role !== "all" ||
    track !== "all" ||
    relevance !== "all";

  function resetFilters() {
    setQuery("");
    setDomain("all");
    setRole("all");
    setTrack("all");
    setRelevance("all");
    setVisibleCount(INITIAL_VISIBLE);
  }

  return (
    <section aria-labelledby="course-library-browser-title">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">원본 자료 인덱스</p>
          <h2
            id="course-library-browser-title"
            className="mt-2 text-2xl font-black text-[#142f4b]"
          >
            실기 대비 원본 자료 찾기
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            원본 파일은 외부 로컬 폴더에 그대로 두고, 이 화면에는 학습 분류와
            검수 메타데이터만 표시합니다. 다운로드와 공개 배포는 비활성화했습니다.
          </p>
        </div>
        <p
          className="shrink-0 text-sm font-black text-[#0f766e]"
          aria-live="polite"
        >
          {filteredItems.length.toLocaleString("ko-KR")}개 자료
        </p>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(15rem,1fr)_11rem_11rem_11rem_11rem_auto]">
        <label className="relative block">
          <span className="sr-only">자료 검색</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(INITIAL_VISIBLE);
            }}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-800"
            placeholder="파일명·경로·확장자 검색"
          />
        </label>
        <FilterSelect
          value={domain}
          onChange={(value) => {
            setDomain(value as "all" | BdaCourseDomain);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          label="학습 영역"
          options={Object.entries(domainLabels)}
        />
        <FilterSelect
          value={role}
          onChange={(value) => {
            setRole(value as "all" | BdaCourseRole);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          label="자료 형식"
          options={Object.entries(roleLabels)}
        />
        <FilterSelect
          value={track}
          onChange={(value) => {
            setTrack(value as "all" | BdaPracticalTrack);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          label="실기 트랙"
          options={Object.entries(practicalTrackLabels)}
        />
        <FilterSelect
          value={relevance}
          onChange={(value) => {
            setRelevance(
              value as "all" | BdaCourseLibraryItem["examRelevance"],
            );
            setVisibleCount(INITIAL_VISIBLE);
          }}
          label="시험 연관성"
          options={Object.entries(relevanceLabels)}
        />
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasFilters}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FilterX size={17} /> 초기화
        </button>
      </div>

      {visibleItems.length > 0 ? (
        <>
          <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {visibleItems.map((item) => (
              <CourseResourceRow key={item.id} item={item} />
            ))}
          </div>
          {visibleCount < filteredItems.length ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}
              className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl border border-[#0f766e] bg-white px-5 text-sm font-black text-[#0f766e] hover:bg-teal-50"
            >
              다음 {Math.min(INITIAL_VISIBLE, filteredItems.length - visibleCount)}개
              더 보기
            </button>
          ) : null}
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Files className="mx-auto text-slate-400" />
          <h3 className="mt-4 font-black text-[#142f4b]">일치하는 자료가 없습니다.</h3>
          <p className="mt-2 text-sm text-slate-600">
            검색어를 줄이거나 필터를 초기화해 보세요.
          </p>
        </div>
      )}
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: Array<[string, string]>;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700"
        aria-label={label}
      >
        <option value="all">{label} 전체</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CourseResourceRow({ item }: { item: PublicBdaCourseResource }) {
  return (
    <article className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[2.5rem_minmax(0,1fr)_auto] lg:items-start">
      <span className="grid size-10 place-items-center rounded-xl bg-[#edf8f5] text-[#0f766e]">
        <CourseRoleIcon role={item.role} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-black text-[#142f4b]">{item.title}</h3>
          {item.duplicateOf ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600">
              중복본
            </span>
          ) : null}
        </div>
        <p className="mt-1 break-all text-xs leading-5 text-slate-500">
          {item.relativePath}
        </p>
        {item.firstMeaningfulLine ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {item.firstMeaningfulLine}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-800">
            {domainLabels[item.domain]}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">
            {roleLabels[item.role]}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
            {relevanceLabels[item.examRelevance]}
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
            {practicalTrackLabels[item.practicalTrack]}
          </span>
          {item.week ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              {item.week}주차
            </span>
          ) : null}
        </div>
        {item.notebook ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            노트북 셀 {item.notebook.totalCells.toLocaleString("ko-KR")}개 · 코드{" "}
            {item.notebook.codeCells.toLocaleString("ko-KR")} · 마크다운{" "}
            {item.notebook.markdownCells.toLocaleString("ko-KR")}
          </p>
        ) : null}
        {item.csv ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            열 {item.csv.columnCount.toLocaleString("ko-KR")}개 · 약{" "}
            {item.csv.approximateLineCount.toLocaleString("ko-KR")}개 데이터 행
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3 lg:flex-col lg:items-end">
        <span className="whitespace-nowrap text-xs font-bold text-slate-500">
          {formatBytes(item.bytes)}
        </span>
        {item.reviewFlags.length > 0 ? (
          <span
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-800"
            title={item.reviewFlags.join(", ")}
          >
            <ShieldAlert size={13} /> 검수 {item.reviewFlags.length}
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-800">
            메타 확인
          </span>
        )}
      </div>
    </article>
  );
}

function CourseRoleIcon({ role }: { role: BdaCourseRole }) {
  const props = { size: 19, "aria-hidden": true } as const;
  if (role === "notebook") return <Braces {...props} />;
  if (role === "code") return <FileCode2 {...props} />;
  if (role === "dataset" || role === "database") {
    return <Database {...props} />;
  }
  if (role === "lecture" || role === "report") {
    return <BookOpenText {...props} />;
  }
  return <File {...props} />;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
