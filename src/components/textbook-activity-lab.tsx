"use client";

import { useState } from "react";
import { ArrowDown, Beaker, ChevronDown, RotateCcw } from "lucide-react";
import type { TextbookActivity } from "@/lib/content/textbook-activities";
import { cn } from "@/lib/utils";

export function TextbookActivityLab({ activity }: { activity: TextbookActivity }) {
  const [hintLevel, setHintLevel] = useState(0);

  return (
    <section
      id="concept-lab"
      data-testid={`textbook-activity-${activity.type}`}
      className="mt-10 scroll-mt-28 overflow-hidden rounded-2xl border border-[#8bc7c4] bg-[#f2fbfa]"
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#16697a] text-white">
            <Beaker size={19} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">
              Concept lab
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#173957]">직접 바꾸며 원리 확인하기</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">학습 목표</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#173957]">{activity.goal}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">해볼 일</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#173957]">{activity.prompt}</p>
          </div>
        </div>

        <div className="mt-5">
          {activity.type === "accumulator-pressure" && <AccumulatorExplorer activity={activity} />}
          {activity.type === "pid-effects" && <PidExplorer activity={activity} />}
          {activity.type === "welding-classification" && <WeldingExplorer activity={activity} />}
        </div>

        <div className="mt-5 rounded-xl border border-[#b9d9d7] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-[#173957]">막히면 힌트를 한 단계씩 확인하세요</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">힌트는 정답 대신 관찰 지점과 판단 규칙을 알려줍니다.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setHintLevel((level) => level >= activity.hints.length ? 0 : level + 1)
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#6fb5b1] px-3 py-2 text-sm font-extrabold text-[#16697a]"
            >
              {hintLevel >= activity.hints.length ? (
                <>
                  <RotateCcw size={15} /> 힌트 접기
                </>
              ) : (
                <>
                  <ChevronDown size={15} /> 힌트 {hintLevel + 1} 보기
                </>
              )}
            </button>
          </div>
          <ol className="mt-3 grid gap-2" aria-live="polite">
            {activity.hints.slice(0, hintLevel).map((hint, index) => (
              <li key={hint} className="flex gap-3 rounded-lg bg-[#eaf7f6] p-3 text-sm font-semibold leading-6 text-[#294a58]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#16697a] text-xs text-white">
                  {index + 1}
                </span>
                {hint}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#b9d9d7] pt-5">
          <p className="text-xs leading-5 text-slate-500">
            이 활동은 개념의 방향을 비교하는 탐색 도구이며 현장 설정값이나 정량 설계 결과를 제공하지 않습니다.
          </p>
          <a href="#practice-set" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#16697a]">
            같은 판단을 연습하는 연결 문제 {activity.questionIds.length}개 풀기 <ArrowDown size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

function AccumulatorExplorer({
  activity,
}: {
  activity: Extract<TextbookActivity, { type: "accumulator-pressure" }>;
}) {
  const { minRatio, maxRatio, initialRatio, step } = activity.config;
  const [ratio, setRatio] = useState(initialRatio);
  const relation = Math.abs(ratio - 1) < 0.001
    ? {
      key: "equal",
      formula: "p₀ = pₛ",
      title: "압력차가 없는 경계 상태",
      body: "가스와 계통 압력이 같아 작동유를 밀어 넣는 순압력이 거의 없습니다.",
    }
    : ratio < 1
      ? {
        key: "lower",
        formula: "p₀ < pₛ",
        title: "계통 압력이 가스를 압축하는 상태",
        body: "작동유가 어큐뮬레이터로 들어가 가스를 압축하고 유압에너지가 저장됩니다.",
      }
      : {
        key: "higher",
        formula: "p₀ > pₛ",
        title: "봉입가스 압력이 더 높은 상태",
        body: "가스가 작동유 측을 밀어내므로 현재 계통 압력만으로는 작동유가 들어가기 어렵습니다.",
      };

  const gasPercent = Math.round((ratio / maxRatio) * 100);
  const systemPercent = Math.round((1 / maxRatio) * 100);

  return (
    <div className="rounded-xl bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label htmlFor={activity.id} className="font-extrabold text-[#173957]">
            봉입압력비 p₀ ÷ pₛ
          </label>
          <p id={`${activity.id}-help`} className="mt-1 text-xs leading-5 text-slate-500">
            계통 압력 pₛ를 1로 놓은 학습용 상대값입니다.
          </p>
        </div>
        <output htmlFor={activity.id} className="rounded-lg bg-[#173957] px-3 py-2 text-lg font-black text-white">
          {ratio.toFixed(2)}
        </output>
      </div>
      <input
        id={activity.id}
        aria-describedby={`${activity.id}-help`}
        type="range"
        min={minRatio}
        max={maxRatio}
        step={step}
        value={ratio}
        onChange={(event) => setRatio(Number(event.target.value))}
        className="mt-4 w-full accent-[#16697a]"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PressureBar label="봉입가스 p₀" percent={gasPercent} value={ratio.toFixed(2)} />
        <PressureBar label="계통 압력 pₛ" percent={systemPercent} value="1.00" />
      </div>
      <div
        data-testid="accumulator-relation"
        data-relation={relation.key}
        className="mt-4 rounded-xl border border-[#b9d9d7] bg-[#eaf7f6] p-4"
        aria-live="polite"
      >
        <p className="text-sm font-black text-[#16697a]">{relation.formula}</p>
        <p className="mt-1 font-extrabold text-[#173957]">{relation.title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{relation.body}</p>
      </div>
    </div>
  );
}

function PressureBar({ label, percent, value }: { label: string; percent: number; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex justify-between gap-3 text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#2b8c88]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function PidExplorer({
  activity,
}: {
  activity: Extract<TextbookActivity, { type: "pid-effects" }>;
}) {
  const { min, max, step, initial } = activity.config;
  const [kp, setKp] = useState(initial.kp);
  const [ki, setKi] = useState(initial.ki);
  const [kd, setKd] = useState(initial.kd);
  const overshootLoad = Math.max(0, Math.min(100, kp * 0.55 + ki * 0.35 - kd * 0.35));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-xl bg-white p-4 md:p-5">
        <PidSlider id={`${activity.id}-kp`} label="P · 현재 편차 반응" value={kp} min={min} max={max} step={step} onChange={setKp} />
        <PidSlider id={`${activity.id}-ki`} label="I · 누적 편차 보정" value={ki} min={min} max={max} step={step} onChange={setKi} />
        <PidSlider id={`${activity.id}-kd`} label="D · 변화율 제동" value={kd} min={min} max={max} step={step} onChange={setKd} />
        <p className="mt-3 text-xs leading-5 text-slate-500">
          막대값은 제어기 튜닝값이 아니라 각 항의 상대적인 영향만 비교하는 교육용 지표입니다.
        </p>
      </div>
      <div className="grid gap-3" aria-live="polite">
        <TendencyCard
          title="응답속도"
          level={level(kp)}
          body="P를 키우면 현재 편차에 더 강하게 반응하지만 지나치면 진동과 오버슈트가 커질 수 있습니다."
        />
        <TendencyCard
          title="정상편차 제거"
          level={level(ki)}
          body="I가 남은 편차를 누적해 제거하지만 과도하면 적분 포화와 긴 정착시간을 만들 수 있습니다."
        />
        <TendencyCard
          title="급변 제동"
          level={level(kd)}
          body="D가 변화율을 보고 제동을 보태지만 측정 잡음에도 민감해집니다."
        />
        <TendencyCard
          title="오버슈트 경향"
          level={level(overshootLoad)}
          body="P·I의 공격적인 반응과 D의 제동 사이에서 정성적으로 비교한 값입니다."
          tone="caution"
        />
      </div>
    </div>
  );
}

function PidSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-extrabold text-[#173957]">{label}</label>
        <output htmlFor={id} className="text-sm font-black text-[#16697a]">{value}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-[#16697a]"
      />
    </div>
  );
}

function TendencyCard({
  title,
  level: tendency,
  body,
  tone = "normal",
}: {
  title: string;
  level: "낮음" | "중간" | "높음";
  body: string;
  tone?: "normal" | "caution";
}) {
  return (
    <article className={cn(
      "rounded-xl border p-4",
      tone === "caution" ? "border-amber-200 bg-amber-50" : "border-[#b9d9d7] bg-white",
    )}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-[#173957]">{title}</h3>
        <span className={cn(
          "rounded-full px-2.5 py-1 text-xs font-black",
          tendency === "높음" && "bg-[#8f3f0a] text-white",
          tendency === "중간" && "bg-amber-100 text-amber-900",
          tendency === "낮음" && "bg-slate-100 text-slate-600",
        )}>{tendency}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{body}</p>
    </article>
  );
}

function WeldingExplorer({
  activity,
}: {
  activity: Extract<TextbookActivity, { type: "welding-classification" }>;
}) {
  const [selectedId, setSelectedId] = useState(activity.config.initialOptionId);
  const selected = activity.config.options.find((option) => option.id === selectedId)
    ?? activity.config.options[0];

  return (
    <div className="rounded-xl bg-white p-4 md:p-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="용접 분류 선택">
        {activity.config.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected.id === option.id}
            onClick={() => setSelectedId(option.id)}
            className={cn(
              "rounded-lg border px-3 py-3 text-sm font-extrabold",
              selected.id === option.id
                ? "border-[#16697a] bg-[#16697a] text-white"
                : "border-slate-200 bg-white text-[#173957]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div
        id={`${activity.id}-panel`}
        data-testid="welding-classification-panel"
        className="mt-4 rounded-xl border border-[#b9d9d7] bg-[#f2fbfa] p-4"
      >
        <h3 className="text-lg font-extrabold text-[#173957]">{selected.label} 판단 기준</h3>
        <dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-[100px_1fr]">
          <dt className="font-extrabold text-[#16697a]">모재</dt>
          <dd>{selected.baseMetal}</dd>
          <dt className="font-extrabold text-[#16697a]">압력</dt>
          <dd>{selected.pressure}</dd>
          <dt className="font-extrabold text-[#16697a]">용가재</dt>
          <dd>{selected.filler}</dd>
          <dt className="font-extrabold text-[#16697a]">결합 원리</dt>
          <dd>{selected.principle}</dd>
          <dt className="font-extrabold text-[#16697a]">대표 공정</dt>
          <dd>{selected.examples.join(" · ")}</dd>
        </dl>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
          <strong>실제 시험 함정:</strong> {selected.examTrap}
        </div>
      </div>
    </div>
  );
}

function level(value: number): "낮음" | "중간" | "높음" {
  if (value < 34) return "낮음";
  if (value < 67) return "중간";
  return "높음";
}
