"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  Flame,
  Gauge,
  Info,
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

type PracticalInfoCategory = "pneumatic" | "hydraulic" | "welding" | "prep";

const tabs: Array<{
  id: PracticalInfoCategory;
  label: string;
  icon: typeof Wind;
}> = [
  { id: "pneumatic", label: "공압", icon: Wind },
  { id: "hydraulic", label: "유압", icon: Droplets },
  { id: "welding", label: "용접", icon: Flame },
  { id: "prep", label: "수험자 준비물·팁", icon: ClipboardCheck },
];

const categoryCopy = {
  pneumatic: {
    title: "공압 회로 구성과 동작 확인",
    description:
      "FRL·밸브·실린더·센서의 포트와 신호 흐름을 읽고, 초기상태에서 배관·속도조정·순차동작·고장진단까지 연습합니다.",
    points: [
      "공급압 차단과 잔압 배출 후 배관을 변경합니다.",
      "회로도 포트번호와 실제 밸브의 포트표시를 먼저 대조합니다.",
      "수동조작으로 초기상태를 확인한 뒤 자동 순차동작을 시험합니다.",
      "실린더 속도는 유량조절밸브를 조금씩 조정하며 기록합니다.",
    ],
  },
  hydraulic: {
    title: "유압 동력·압력·방향·유량 제어",
    description:
      "동력원과 탱크, 압력·방향·유량제어밸브, 액추에이터를 회로도와 실물로 연결하고 잔압·하중 위험을 통제합니다.",
    points: [
      "전원 차단 후 압력계 0과 축압기·하중측 저장에너지를 확인합니다.",
      "릴리프밸브는 낮은 설정에서 시작해 과압을 방지합니다.",
      "하중을 유압 잠금만으로 지지한 상태에서 신체를 넣지 않습니다.",
      "누유·발열·이상음은 압력·유량·오염·밸브상태와 함께 추적합니다.",
    ],
  },
  welding: {
    title: "용접 준비·수행·결함 판정",
    description:
      "WPS와 모재·용접봉 조건을 확인하고, 자세별 비드와 보수용접·결함 제거·비파괴검사 흐름을 학습합니다.",
    points: [
      "화기작업 전 가연물·잔류가스·환기·화재감시 조건을 확인합니다.",
      "모재·개선·루트간격·용접봉·전류·자세는 WPS를 우선합니다.",
      "패스 사이 슬래그와 스패터를 제거하고 층간상태를 확인합니다.",
      "결함을 덮어 용접하지 않고 제거범위·홈형상·재검사를 기록합니다.",
    ],
  },
} as const;

export function PracticalInfoTabs({
  pneumaticTasks,
  hydraulicTasks,
  weldingTasks,
}: {
  pneumaticTasks: PracticalInfoTask[];
  hydraulicTasks: PracticalInfoTask[];
  weldingTasks: PracticalInfoTask[];
}) {
  const [activeTab, setActiveTab] =
    useState<PracticalInfoCategory>("pneumatic");

  const taskMap = {
    pneumatic: pneumaticTasks,
    hydraulic: hydraulicTasks,
    welding: weldingTasks,
  };

  return (
    <div className="pb-16">
      <div
        role="tablist"
        aria-label="실기 관련 정보 분류"
        className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-2 lg:grid-cols-4"
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
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                active
                  ? "bg-[#173957] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "prep" ? (
        <PrepPanel />
      ) : (
        <TaskPanel
          category={activeTab}
          tasks={taskMap[activeTab]}
        />
      )}
    </div>
  );
}

function TaskPanel({
  category,
  tasks,
}: {
  category: Exclude<PracticalInfoCategory, "prep">;
  tasks: PracticalInfoTask[];
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
              />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">NCS 수행과제</p>
          <h2 className="mt-2 text-2xl font-extrabold">
            이론을 실제 작업순서로 연습
          </h2>
        </div>
        <Link
          href="/practical/work#video-reference-heading"
          className="text-sm font-extrabold text-[#16697a] underline"
        >
          관련 동작 영상 보기
        </Link>
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
                <Gauge size={18} />
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
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PrepPanel() {
  return (
    <section
      id="practical-info-panel-prep"
      role="tabpanel"
      aria-labelledby="practical-info-tab-prep"
      className="mt-6 grid gap-6"
    >
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={22}
            className="mt-1 shrink-0 text-amber-700"
          />
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-amber-700">
              시험 전 최신 공고 확인
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-amber-950">
              준비물은 회차별 Q-Net 공개과제·수험자 안내가 최종 기준입니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-amber-900">
              이 페이지는 학습 준비 체크리스트입니다. 시험장에서 실제로
              지참해야 할 품목·규격·허용공구는 접수 회차의 공식 안내를 확인한
              뒤 확정하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PrepCard
          title="시험 전 확인"
          items={[
            "시험일·시험장·입실시간과 신분확인 안내",
            "해당 회차 공개과제와 지급재료·지참준비물 표",
            "사용 가능 공구의 규격과 반입 제한",
            "보호구 지급 여부와 개인 준비 항목",
            "계산기·필기구 등 허용 물품",
          ]}
        />
        <PrepCard
          title="연습할 때 준비"
          items={[
            "공압·유압 회로도와 포트 연결표",
            "용접 WPS·작업조건·결함 판정표",
            "공구·측정기 사용 전 점검표",
            "안전 게이트와 작업순서 체크리스트",
            "측정값·이상원인·재시험 작업기록",
          ]}
        />
        <PrepCard
          title="실기 당일 작업 팁"
          items={[
            "작업 시작 전 도면·과제조건·안전 요구를 끝까지 읽습니다.",
            "초기상태와 에너지 차단 상태를 확인한 뒤 작업합니다.",
            "부품·포트·배선을 연결하기 전 명칭과 번호를 다시 확인합니다.",
            "측정값과 조정내용을 즉시 기록해 재현 가능한 상태로 남깁니다.",
            "이상 발생 시 무리하게 계속하지 말고 원인·조치·재시험 순서로 처리합니다.",
          ]}
        />
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <Info size={20} className="text-sky-700" />
          <h3 className="mt-4 text-xl font-extrabold text-sky-950">
            사이트에서 이어서 볼 항목
          </h3>
          <div className="mt-4 grid gap-3">
            <Link
              href="/theory?mode=practical"
              className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#16697a]"
            >
              실기·필답 이론 정리 →
            </Link>
            <Link
              href="/practical/mock"
              className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#16697a]"
            >
              필답 모의고사 →
            </Link>
            <Link
              href="/practical/work"
              className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#16697a]"
            >
              전체 NCS 수행과제 →
            </Link>
          </div>
        </div>
      </div>
    </section>
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
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
