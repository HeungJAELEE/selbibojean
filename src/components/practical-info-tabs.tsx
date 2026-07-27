"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Droplets,
  ExternalLink,
  Flame,
  Gauge,
  Info,
  MapPinned,
  PlayCircle,
  ShoppingCart,
  Timer,
  Trophy,
  Wind,
} from "lucide-react";

type PracticalInfoTask = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  stepCount: number;
  safetyCount: number;
};

type PracticalInfoCategory =
  | "pneumatic"
  | "hydraulic"
  | "welding"
  | "prep"
  | "centers";

type PracticalInfoVideo = {
  id: string;
  title: string;
  sourceTitle: string;
  channel: string;
  sourceUrl: string;
  embedUrl: string;
  playback: "embed" | "external";
  learningFocus: string;
  caution: string;
};

type ComparisonValue = {
  status: string;
  label: string;
  detail: string;
};

type PracticalInfoCenter = {
  id: string;
  region: string;
  name: string;
  parkingNote: string | null;
  rawFacilityNote: string;
  comparison: {
    pneumatic: ComparisonValue;
    hydraulic: ComparisonValue;
    welding: ComparisonValue;
    parking: ComparisonValue;
  };
};

type PracticalInfoSupply = {
  id: string;
  number: number;
  label: string;
  specification: string;
  unit: string;
  quantity: number;
  purpose: string;
};

type PracticalInfoSupplyRecommendation = {
  id: string;
  label: string;
  status: "safety_required" | "conditional" | "optional" | "personal_pick";
  statusLabel: string;
  note: string;
  commerceUrl: string;
};

type PracticalInfoPublicProblem = {
  id: string;
  category: "pneumatic" | "hydraulic" | "welding";
  qualification: "engineer" | "industrial_engineer";
  qualificationLabel: "설비보전기사" | "설비보전산업기사";
  taskLabel: string;
  fileName: string;
  downloadUrl: string;
  articleUrl: string;
  appliedFrom: string;
  note: string;
};

type PracticalInfoOverview = {
  operator: string;
  relatedDepartments: string;
  writtenSubjects: readonly string[];
  practicalSubject: string;
  writtenMethod: string;
  practicalMethod: string;
  writtenPass: string;
  practicalPass: string;
  qualificationUrl: string;
};

const tabs: Array<{
  id: PracticalInfoCategory;
  label: string;
  icon: typeof Wind;
}> = [
  { id: "pneumatic", label: "공압", icon: Wind },
  { id: "hydraulic", label: "유압", icon: Droplets },
  { id: "welding", label: "용접", icon: Flame },
  { id: "prep", label: "수험자 준비물·팁", icon: ClipboardCheck },
  { id: "centers", label: "시험장·장비", icon: MapPinned },
];

const categoryCopy = {
  pneumatic: {
    title: "공압 회로 구성과 동작 확인",
    description:
      "FRL·밸브·실린더·센서의 포트와 신호 흐름을 읽고, 초기상태에서 배관·속도조정·순차동작·고장진단까지 연습합니다.",
    points: [
      "공급원 차단과 잔압 배출 후 배관을 변경합니다.",
      "회로도의 포트번호와 실제 밸브 표시를 먼저 대조합니다.",
      "수동조작으로 초기상태를 확인한 뒤 자동 순차동작을 시험합니다.",
      "속도와 유량 조정값을 기록하고 동일 조건으로 재시험합니다.",
    ],
  },
  hydraulic: {
    title: "유압 동력·압력·방향·유량 제어",
    description:
      "동력원과 탱크, 압력·방향·유량제어밸브, 액추에이터를 회로도와 연결하고 유압·하중 위험을 통제합니다.",
    points: [
      "전원 차단 뒤 압력계 0과 축압기·하중 저장에너지를 확인합니다.",
      "릴리프밸브는 낮은 설정에서 시작해 과압을 방지합니다.",
      "하중을 유압 잠금만으로 지지한 상태에서 신체를 넣지 않습니다.",
      "압력·유량·온도·누유를 함께 추적해 원인구간을 좁힙니다.",
    ],
  },
  welding: {
    title: "보수 용접과 누수 시험",
    description:
      "공개문제의 지급재료와 요구치수를 확인하고, 구멍 가공·보수 용접·누수 확인·정리정돈까지 시험 순서로 연습합니다.",
    points: [
      "가연물·연료가스·환기·화재감시와 보호구를 먼저 확인합니다.",
      "연강판 각인을 확인하고 도면의 구멍 위치와 목표 치수를 표시합니다.",
      "비드 폭·높이와 용락 여부를 확인하며 임의 보충재를 넣지 않습니다.",
      "충분히 냉각한 뒤 물 또는 공기압으로 누수 여부를 확인합니다.",
    ],
  },
} as const;

export function PracticalInfoTabs({
  overview,
  pneumaticTasks,
  hydraulicTasks,
  weldingTasks,
  videos,
  publicProblems,
  centers,
  supplies,
  supplyRecommendations,
  suppliesOfficialUrl,
  initialTab = "pneumatic",
}: {
  overview: PracticalInfoOverview;
  pneumaticTasks: PracticalInfoTask[];
  hydraulicTasks: PracticalInfoTask[];
  weldingTasks: PracticalInfoTask[];
  videos: Record<
    Exclude<PracticalInfoCategory, "prep" | "centers">,
    PracticalInfoVideo[]
  >;
  publicProblems: readonly PracticalInfoPublicProblem[];
  centers: PracticalInfoCenter[];
  supplies: PracticalInfoSupply[];
  supplyRecommendations: PracticalInfoSupplyRecommendation[];
  suppliesOfficialUrl: string;
  initialTab?: PracticalInfoCategory;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<PracticalInfoCategory>(initialTab);
  const taskMap = {
    pneumatic: pneumaticTasks,
    hydraulic: hydraulicTasks,
    welding: weldingTasks,
  };

  return (
    <div className="pb-16">
      <ExamOverview overview={overview} />

      <div
        role="tablist"
        aria-label="실기 관련 정보 분류"
        className="mt-8 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-2 lg:grid-cols-5"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`practical-info-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`practical-info-panel-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                router.replace(`/practical/info?tab=${tab.id}`, {
                  scroll: false,
                });
              }}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                active
                  ? "bg-[#173957] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "prep" ? (
        <PrepPanel
          supplies={supplies}
          recommendations={supplyRecommendations}
          suppliesOfficialUrl={suppliesOfficialUrl}
        />
      ) : activeTab === "centers" ? (
        <ExamVenuePanel centers={centers} />
      ) : (
        <TaskPanel
          key={activeTab}
          category={activeTab}
          tasks={taskMap[activeTab]}
          videos={videos[activeTab]}
          publicProblems={publicProblems.filter(
            (problem) => problem.category === activeTab,
          )}
        />
      )}
    </div>
  );
}

function ExamOverview({ overview }: { overview: PracticalInfoOverview }) {
  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="practical-exam-overview-heading"
    >
      <div className="bg-[#173957] p-6 text-white md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-teal-200">
              Official exam structure
            </p>
            <h2
              id="practical-exam-overview-heading"
              className="mt-2 text-3xl font-extrabold"
            >
              설비보전기사 시험 구성
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              시행처 {overview.operator} · 관련학과 {overview.relatedDepartments}
            </p>
          </div>
          <a
            href={overview.qualificationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#173957]"
          >
            Q-Net 종목 안내
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCell
          icon={BookOpenCheck}
          label="필기"
          value="4과목 · 80문항"
          detail={overview.writtenMethod}
        />
        <OverviewCell
          icon={Timer}
          label="실기"
          value="필답 1시간 + 작업 2시간 40분"
          detail={overview.practicalMethod}
        />
        <OverviewCell
          icon={Trophy}
          label="필기 합격"
          value="과목 40점 · 평균 60점"
          detail={overview.writtenPass}
        />
        <OverviewCell
          icon={AlertTriangle}
          label="실기 합격"
          value="60점 이상 · 실격 주의"
          detail={overview.practicalPass}
        />
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div>
          <p className="eyebrow">필기 시험과목</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {overview.writtenSubjects.map((subject, index) => (
              <li
                key={subject}
                className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
              >
                {index + 1}. {subject}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-teal-200 bg-[#eaf7f6] p-5">
          <p className="eyebrow text-[#16697a]">실기 시험과목</p>
          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {overview.practicalSubject}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            필답형 40점과 공압·유압·용접 각 20점을 합산합니다. 작업형은
            한 과제라도 실격조건에 해당하면 전체 실격될 수 있으므로 각 탭의
            안전·완료조건을 먼저 확인하세요.
          </p>
        </div>
      </div>
    </section>
  );
}

function OverviewCell({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-white p-5">
      <div className="flex items-center gap-2 text-[#16697a]">
        <Icon size={18} aria-hidden="true" />
        <span className="text-xs font-black uppercase tracking-[.12em]">
          {label}
        </span>
      </div>
      <p className="mt-3 font-extrabold text-slate-900">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function TaskPanel({
  category,
  tasks,
  videos,
  publicProblems,
}: {
  category: Exclude<PracticalInfoCategory, "prep" | "centers">;
  tasks: PracticalInfoTask[];
  videos: PracticalInfoVideo[];
  publicProblems: PracticalInfoPublicProblem[];
}) {
  const copy = categoryCopy[category];
  return (
    <section
      id={`practical-info-panel-${category}`}
      role="tabpanel"
      aria-labelledby={`practical-info-tab-${category}`}
      className="mt-6"
    >
      <div className="rounded-3xl bg-[#f3f8fb] p-6 md:p-8">
        <p className="eyebrow">작업 전 핵심 정리</p>
        <h2 className="mt-2 text-3xl font-extrabold">{copy.title}</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
          {copy.description}
        </p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {copy.points.map((point) => (
            <li
              key={point}
              className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700"
            >
              <CheckCircle2
                size={17}
                className="mt-1 shrink-0 text-[#16697a]"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <TaskVideoLibrary videos={videos} />
      <PublicProblemSection problems={publicProblems} />

      <div className="mt-10">
        <p className="eyebrow">NCS 수행과제</p>
        <h2 className="mt-2 text-2xl font-extrabold">
          영상을 본 뒤 실제 작업순서로 연습
        </h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/practical/work/${task.slug}`}
            className="card group p-6 hover:border-[#16697a]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
                <Gauge size={18} aria-hidden="true" />
              </span>
              <span className="text-xs font-extrabold text-slate-500">
                약 {task.estimatedMinutes}분
              </span>
            </div>
            <h3 className="mt-5 font-extrabold">{task.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {task.summary}
            </p>
            <p className="mt-4 text-xs font-bold text-slate-500">
              수행 {task.stepCount}단계 · 안전 확인 {task.safetyCount}개
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
              작업과제 열기
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TaskVideoLibrary({ videos }: { videos: PracticalInfoVideo[] }) {
  const [activeVideoId, setActiveVideoId] = useState(videos[0]?.id ?? "");
  const video =
    videos.find((candidate) => candidate.id === activeVideoId) ?? videos[0];

  if (!video) {
    return null;
  }

  return (
    <section
      className="mt-8 overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm"
      aria-labelledby="practical-info-video-library-heading"
    >
      <div className="border-b border-sky-100 bg-sky-50 px-6 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sky-800">
              <PlayCircle size={18} aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-[.12em]">
                작업 전 번호별 영상
              </p>
            </div>
            <h3
              id="practical-info-video-library-heading"
              className="mt-2 text-2xl font-extrabold text-slate-900"
            >
              번호별·세부 학습 영상 {videos.length}개
            </h3>
          </div>
          <p className="text-xs font-bold text-slate-500">
            한 번에 하나씩 선택해 시청
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="p-4 md:p-6">
          {video.playback === "embed" ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950">
              <iframe
                key={video.id}
                className="size-full"
                src={video.embedUrl}
                title={`${video.title} 유튜브 보조 영상`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="grid aspect-video place-items-center rounded-2xl bg-slate-950 p-6 text-center text-white">
              <div>
                <PlayCircle className="mx-auto size-12 text-sky-300" aria-hidden="true" />
                <p className="mt-4 text-xl font-extrabold">
                  제작자가 외부 사이트 재생을 제한한 영상입니다
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  목록에는 그대로 유지하며, 아래 버튼으로 원본 YouTube 영상을
                  시청할 수 있습니다.
                </p>
                <a
                  href={video.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900"
                >
                  YouTube에서 재생
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
          <h3
            id={`practical-info-video-heading-${video.id}`}
            className="mt-5 text-2xl font-extrabold text-slate-900"
          >
            {video.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            YouTube · {video.channel} · {video.sourceTitle}
          </p>
          <p className="mt-5 text-sm leading-7 text-slate-700">
            {video.learningFocus}
          </p>
          <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">
            {video.caution}
          </p>
          <a
            href={video.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a] underline"
          >
            YouTube에서 열기
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-4 xl:border-l xl:border-t-0">
          <p className="px-2 pb-3 text-xs font-black uppercase tracking-[.12em] text-slate-500">
            영상 선택
          </p>
          <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
            {videos.map((candidate, index) => {
              const active = candidate.id === video.id;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveVideoId(candidate.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[#16697a] bg-white shadow-sm"
                      : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-black ${
                      active
                        ? "bg-[#16697a] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-extrabold text-slate-900">
                      {candidate.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
                      {candidate.sourceTitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicProblemSection({
  problems,
}: {
  problems: PracticalInfoPublicProblem[];
}) {
  const engineer = problems.find(
    (problem) => problem.qualification === "engineer",
  );
  const reference = problems.find(
    (problem) => problem.qualification === "industrial_engineer",
  );

  if (!engineer) {
    return null;
  }

  return (
    <section className="mt-8" aria-labelledby="public-problem-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Q-Net 공식 공개문제</p>
          <h2 id="public-problem-heading" className="mt-2 text-2xl font-extrabold">
            문제지를 먼저 열고 작업조건 확인
          </h2>
        </div>
        <a
          href={engineer.articleUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-extrabold text-[#16697a] underline"
        >
          공식 게시글 보기
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ProblemCard problem={engineer} primary />
        {reference ? <ProblemCard problem={reference} /> : null}
      </div>
    </section>
  );
}

function ProblemCard({
  problem,
  primary = false,
}: {
  problem: PracticalInfoPublicProblem;
  primary?: boolean;
}) {
  return (
    <article
      className={`rounded-3xl border p-6 ${
        primary
          ? "border-teal-200 bg-[#eaf7f6]"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
            primary
              ? "bg-[#16697a] text-white"
              : "bg-amber-200 text-amber-950"
          }`}
        >
          {primary ? "기사 응시자 우선" : "산업기사 참고"}
        </span>
        <span className="text-xs font-bold text-slate-500">
          {problem.appliedFrom}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-slate-900">
        {problem.taskLabel}
      </h3>
      <p className="mt-2 break-words text-xs leading-5 text-slate-500">
        {problem.fileName}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-700">{problem.note}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={problem.downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#173957] px-4 py-3 text-sm font-extrabold text-white"
        >
          <Download size={15} aria-hidden="true" />
          PDF 보기·다운로드
        </a>
        <a
          href={problem.articleUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-700"
        >
          게시글
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function PrepPanel({
  supplies,
  recommendations,
  suppliesOfficialUrl,
}: {
  supplies: PracticalInfoSupply[];
  recommendations: PracticalInfoSupplyRecommendation[];
  suppliesOfficialUrl: string;
}) {
  return (
    <section
      id="practical-info-panel-prep"
      role="tabpanel"
      aria-labelledby="practical-info-tab-prep"
      className="mt-6"
    >
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.14em] text-amber-700">
              Official candidate supplies
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-amber-950">
              Q-Net 공식 지참준비물 {supplies.length}종
            </h2>
            <p className="mt-3 text-sm leading-7 text-amber-900">
              연습용 추천품을 섞지 않고 공식 표에 등록된 품목만 표시합니다.
              링크의 연도·회차 조건을 확인하고 실제 응시 회차의 최신 안내를
              최종 기준으로 사용하세요.
            </p>
          </div>
          <a
            href={suppliesOfficialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-3 text-sm font-extrabold text-white"
          >
            Q-Net 준비물 원문
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">번호</th>
                <th className="px-5 py-4">품목</th>
                <th className="px-5 py-4">규격</th>
                <th className="px-5 py-4">수량</th>
                <th className="px-5 py-4">용도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplies.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-extrabold text-[#16697a]">
                    {item.number}
                  </td>
                  <td className="px-5 py-4 font-extrabold text-slate-900">
                    {item.label}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {item.specification}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {supplies.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#16697a]">
                    준비물 {item.number}
                  </p>
                  <h3 className="mt-1 font-extrabold text-slate-900">
                    {item.label}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 font-bold text-slate-500">규격</dt>
                  <dd className="text-slate-700">{item.specification}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 font-bold text-slate-500">용도</dt>
                  <dd className="text-slate-700">{item.purpose}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>

      <SupplyRecommendationSection recommendations={recommendations} />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <PrepCard
          title="공식 안내의 주의사항"
          items={[
            "복장은 불티가 피부에 직접 닿지 않도록 되도록 얇은 긴팔을 착용합니다.",
            "안전화는 반드시 착용하고, 용접 장갑·앞치마·용접면·보안경 등 작업에 맞는 보호구를 준비합니다.",
            "예비품을 빌릴 수 있어도 준비 부족으로 생기는 불이익은 수험자 책임입니다.",
            "수험자 지참목록 외에도 작업에 필요한 공구는 허용범위 안에서 준비할 수 있습니다.",
            "자가 제작 지그와 용접 지그 사용은 금지됩니다.",
            "안전수칙·작업복장·정리정돈도 평가에 반영됩니다.",
          ]}
        />
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <Info size={20} className="text-sky-700" aria-hidden="true" />
          <h3 className="mt-4 text-xl font-extrabold text-sky-950">
            시험 직전 함께 확인
          </h3>
          <div className="mt-4 grid gap-3">
            <Link
              href="/theory?mode=practical"
              className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#16697a]"
            >
              실기·필답 이론 정리
            </Link>
            <Link
              href="/practical/mock"
              className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#16697a]"
            >
              필답 모의고사
            </Link>
            <Link
              href="/practical/work"
              className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#16697a]"
            >
              전체 NCS 수행과제
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupplyRecommendationSection({
  recommendations,
}: {
  recommendations: PracticalInfoSupplyRecommendation[];
}) {
  return (
    <section className="mt-8" aria-labelledby="supply-recommendation-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">준비물 추천 링크</p>
          <h2
            id="supply-recommendation-heading"
            className="mt-2 text-2xl font-extrabold text-slate-900"
          >
            안전 보호구 우선 · 선택 공구는 시험장 확인 후
          </h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-slate-500">
          선택사항은 시험장에 구비된 경우가 많습니다. 시험장 안내를 먼저
          확인하고 중복 구매를 피하세요.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((item) => (
          <article
            key={item.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-extrabold text-slate-900">{item.label}</h3>
              <RecommendationStatus item={item} />
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
              {item.note}
            </p>
            <a
              href={item.commerceUrl}
              target="_blank"
              rel="sponsored noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#173957] px-4 py-3 text-sm font-extrabold text-white"
            >
              <ShoppingCart size={15} aria-hidden="true" />
              쿠팡에서 상품 보기
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <p className="font-extrabold">복장·구매 안내</p>
        <p className="mt-1">
          얇은 긴팔 작업복을 권장하며 안전화는 필수입니다. 반팔이라면 용접
          토시를 반드시 준비하세요. 상품 가격·재고·사양은 변경될 수 있고,
          실제 반입 가능 품목은 해당 회차 Q-Net 안내와 시험장 공지를
          우선합니다. 위 링크는 상품 선택을 돕기 위한 참고 링크이며, 일부
          링크를 통한 구매 시 운영자에게 수수료가 지급될 수 있습니다.
        </p>
      </div>
    </section>
  );
}

function RecommendationStatus({
  item,
}: {
  item: PracticalInfoSupplyRecommendation;
}) {
  const tone =
    item.status === "safety_required"
      ? "bg-rose-100 text-rose-800"
      : item.status === "conditional"
        ? "bg-amber-100 text-amber-900"
        : item.status === "personal_pick"
          ? "bg-sky-100 text-sky-900"
          : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}
    >
      {item.statusLabel}
    </span>
  );
}

function ExamVenuePanel({ centers }: { centers: PracticalInfoCenter[] }) {
  return (
    <section
      id="practical-info-panel-centers"
      role="tabpanel"
      aria-labelledby="practical-info-tab-centers"
      className="mt-6 grid gap-6"
    >
      <div className="rounded-3xl bg-[#173957] p-6 text-white md:p-8">
        <p className="text-xs font-black uppercase tracking-[.14em] text-teal-200">
          V-AMT baseline comparison
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">
          V-AMT 학습환경과 시험장 장비를 구분해 확인
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200">
          V-AMT는 학습용 시뮬레이터입니다. 공식 시설표에 공압·유압 모델이
          공개되지 않은 시험장은 같은 장비라고 추정하지 않습니다. 용접은
          시설표에서 확인 가능한 교류·직류 정보만 표시하고, 주차는 명시된
          경우에만 확정합니다.
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">2026 기사 2회 공식 시설현황</p>
            <h2 className="mt-2 text-2xl font-extrabold">
              설비보전기사 작업형 시험장 {centers.length}곳
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-500">
            시설현황 6.19. 18시 기준
          </p>
        </div>

        <div className="mt-5 hidden overflow-x-auto rounded-3xl border border-slate-200 bg-white lg:block">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">시험장</th>
                <th className="px-5 py-4">공압</th>
                <th className="px-5 py-4">유압</th>
                <th className="px-5 py-4">용접</th>
                <th className="px-5 py-4">주차</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {centers.map((center) => (
                <tr key={center.id} className="align-top">
                  <td className="px-5 py-5">
                    <Link
                      href={`/practical/info/centers/${center.id}`}
                      className="font-extrabold text-slate-900 hover:text-[#16697a]"
                    >
                      {center.name}
                    </Link>
                    <p className="mt-1 text-xs font-bold text-[#16697a]">
                      {center.region}
                    </p>
                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                      {center.rawFacilityNote}
                    </p>
                  </td>
                  <ComparisonCell value={center.comparison.pneumatic} />
                  <ComparisonCell value={center.comparison.hydraulic} />
                  <ComparisonCell value={center.comparison.welding} />
                  <ComparisonCell value={center.comparison.parking} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 lg:hidden">
          {centers.map((center) => (
            <article
              key={center.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-[#16697a]">
                    {center.region}
                  </p>
                  <h3 className="mt-1 font-extrabold text-slate-900">
                    {center.name}
                  </h3>
                </div>
                <Link
                  href={`/practical/info/centers/${center.id}`}
                  className="shrink-0 text-xs font-extrabold text-[#16697a] underline"
                >
                  상세
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MobileComparison
                  label="공압"
                  value={center.comparison.pneumatic}
                />
                <MobileComparison
                  label="유압"
                  value={center.comparison.hydraulic}
                />
                <MobileComparison
                  label="용접"
                  value={center.comparison.welding}
                />
                <MobileComparison
                  label="주차"
                  value={center.comparison.parking}
                />
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {center.rawFacilityNote}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonCell({ value }: { value: ComparisonValue }) {
  return (
    <td className="px-5 py-5">
      <StatusBadge value={value} />
      <p className="mt-2 max-w-[190px] text-xs leading-5 text-slate-500">
        {value.detail}
      </p>
    </td>
  );
}

function MobileComparison({
  label,
  value,
}: {
  label: string;
  value: ComparisonValue;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-black text-slate-500">{label}</p>
      <div className="mt-2">
        <StatusBadge value={value} />
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: ComparisonValue }) {
  const tone =
    value.status === "same"
      ? "bg-emerald-100 text-emerald-800"
      : value.status === "partially_different" ||
          value.status === "parking_limited"
        ? "bg-amber-100 text-amber-900"
        : value.status === "parking_unavailable"
          ? "bg-rose-100 text-rose-800"
          : value.status === "ac" ||
              value.status === "dc" ||
              value.status === "ac_or_dc"
            ? "bg-sky-100 text-sky-900"
            : "bg-slate-100 text-slate-600";

  return (
    <span
      title={value.detail}
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${tone}`}
    >
      {value.label}
    </span>
  );
}

function PrepCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-extrabold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
            <CheckCircle2
              size={16}
              className="mt-1 shrink-0 text-[#16697a]"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
