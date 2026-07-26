"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleStop,
  ClipboardCheck,
  Play,
  Printer,
  RotateCcw,
  Save,
} from "lucide-react";
import type {
  PracticalSafetyCheckState,
  PracticalTaskContent,
  PracticalWorkStatus,
} from "@/lib/domain/practical-execution-types";
import {
  deletePracticalWorkRecord,
  loadPracticalWorkRecord,
  practicalWorkRecordKey,
  savePracticalWorkRecord,
  type StoredPracticalSafetyCheck,
  type StoredPracticalWorkRecord,
} from "@/lib/client/practical-work-store";

type Props = {
  task: PracticalTaskContent;
};

const statusLabels: Record<PracticalWorkStatus, string> = {
  not_started: "시작 전",
  in_progress: "수행 중",
  completed: "완료",
  abandoned: "중단",
};

export function PracticalTaskRunner({ task }: Props) {
  const [record, setRecord] = useState(() => createEmptyRecord(task));
  const [hydrated, setHydrated] = useState(false);
  const [storageMessage, setStorageMessage] = useState("기록 불러오는 중");

  useEffect(() => {
    let active = true;
    loadPracticalWorkRecord(task.id, task.version)
      .then((saved) => {
        if (!active) return;
        setRecord(saved ?? createEmptyRecord(task));
        setStorageMessage(saved ? "이 기기에 저장된 기록을 복구했습니다." : "새 작업기록입니다.");
      })
      .catch(() => {
        if (!active) return;
        setStorageMessage("이 기기에서 기록 저장소를 사용할 수 없습니다.");
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [task]);

  const safetyReady = useMemo(
    () =>
      task.safetyChecks.every((check) => {
        const saved = record.safetyChecks[check.id];
        if (saved?.state === "pass") return true;
        return (
          saved?.state === "not_applicable" &&
          check.allowNotApplicable &&
          saved.reason.trim().length > 0
        );
      }),
    [record.safetyChecks, task.safetyChecks],
  );
  const allStepsComplete = task.steps.every((step) =>
    record.completedStepIds.includes(step.id),
  );
  const allMeasurementsComplete = task.measurements.every(
    (measurement) => record.measurementValues[measurement.id]?.trim(),
  );
  const allRequiredRecordFieldsComplete = task.recordFields
    .filter((field) => field.required)
    .every((field) => record.recordFieldValues?.[field.id]?.trim());
  const canComplete =
    record.status === "in_progress" &&
    allStepsComplete &&
    allMeasurementsComplete &&
    allRequiredRecordFieldsComplete &&
    record.selfAssessment !== "";

  function updateSafety(
    safetyCheckId: string,
    state: PracticalSafetyCheckState,
  ) {
    const next: StoredPracticalSafetyCheck = {
      state,
      reason:
        state === "not_applicable"
          ? record.safetyChecks[safetyCheckId]?.reason ?? ""
          : "",
      checkedAt: state === "unchecked" ? null : new Date().toISOString(),
    };
    setRecord((current) => ({
      ...current,
      safetyChecks: { ...current.safetyChecks, [safetyCheckId]: next },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateSafetyReason(safetyCheckId: string, reason: string) {
    setRecord((current) => ({
      ...current,
      safetyChecks: {
        ...current.safetyChecks,
        [safetyCheckId]: {
          ...(current.safetyChecks[safetyCheckId] ?? {
            state: "not_applicable" as const,
            checkedAt: new Date().toISOString(),
          }),
          reason,
        },
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function changeStatus(status: PracticalWorkStatus) {
    const now = new Date().toISOString();
    setRecord((current) => ({
      ...current,
      status,
      startedAt:
        status === "in_progress" ? current.startedAt ?? now : current.startedAt,
      completedAt: status === "completed" ? now : current.completedAt,
      abandonedAt: status === "abandoned" ? now : current.abandonedAt,
      updatedAt: now,
    }));
  }

  async function save() {
    const next = { ...record, updatedAt: new Date().toISOString() };
    setRecord(next);
    try {
      await savePracticalWorkRecord(next);
      setStorageMessage(`저장됨 · ${new Date().toLocaleTimeString("ko-KR")}`);
    } catch {
      setStorageMessage("저장하지 못했습니다. 브라우저 저장 권한을 확인해 주세요.");
    }
  }

  async function reset() {
    if (!window.confirm("이 기기에 저장된 현재 과제 기록을 초기화할까요?")) return;
    await deletePracticalWorkRecord(task.id, task.version).catch(() => undefined);
    setRecord(createEmptyRecord(task));
    setStorageMessage("기록을 초기화했습니다.");
  }

  return (
    <section
      data-testid="practical-task-runner"
      className="mt-10 space-y-6 print:space-y-4"
      aria-labelledby="task-runner-heading"
    >
      <div className="card flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div>
          <p className="eyebrow">Local work record</p>
          <h2 id="task-runner-heading" className="mt-2 text-2xl font-extrabold">
            수행 체크와 작업기록
          </h2>
          <p className="mt-2 text-sm text-slate-600" aria-live="polite">
            상태: <strong>{statusLabels[record.status]}</strong> · {storageMessage}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={save}
            disabled={!hydrated}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173957] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
          >
            <Save size={17} aria-hidden="true" />
            이 기기에 저장
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold"
          >
            <Printer size={17} aria-hidden="true" />
            인쇄
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-600"
          >
            <RotateCcw size={17} aria-hidden="true" />
            초기화
          </button>
        </div>
      </div>

      <section
        data-testid="practical-task-safety-gate"
        className="card p-6 md:p-8"
        aria-labelledby="safety-gate-heading"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 id="safety-gate-heading" className="text-xl font-extrabold">
              안전 게이트
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              모든 필수 항목이 적합이어야 수행을 시작할 수 있습니다. 부적합이나
              미확인은 작업 시작을 차단합니다.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {task.safetyChecks.map((check) => {
            const saved = record.safetyChecks[check.id];
            return (
              <fieldset
                key={check.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <legend className="px-1 font-extrabold">{check.label}</legend>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {check.guidance}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(
                    [
                      ["pass", "적합"],
                      ["fail", "부적합"],
                      ["unchecked", "미확인"],
                      ...(check.allowNotApplicable
                        ? ([["not_applicable", "해당 없음"]] as const)
                        : []),
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={check.id}
                        value={value}
                        disabled={!hydrated || record.status === "completed"}
                        checked={(saved?.state ?? "unchecked") === value}
                        onChange={() => updateSafety(check.id, value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {saved?.state === "not_applicable" ? (
                  <label className="mt-3 block text-sm font-bold">
                    해당 없음 사유
                    <input
                      value={saved.reason}
                      disabled={!hydrated || record.status === "completed"}
                      onChange={(event) =>
                        updateSafetyReason(check.id, event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
                      required
                    />
                  </label>
                ) : null}
              </fieldset>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {record.status === "not_started" ? (
            <button
              type="button"
              data-testid="practical-task-start"
              disabled={!safetyReady}
              onClick={() => changeStatus("in_progress")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16697a] px-5 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play size={18} aria-hidden="true" />
              안전 확인 후 수행 시작
            </button>
          ) : null}
          {record.status === "abandoned" ? (
            <button
              type="button"
              disabled={!safetyReady}
              onClick={() => changeStatus("in_progress")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16697a] px-5 py-3 font-extrabold text-white disabled:opacity-40"
            >
              <Play size={18} aria-hidden="true" />
              안전 재확인 후 재개
            </button>
          ) : null}
          <span
            className={`text-sm font-bold ${safetyReady ? "text-emerald-700" : "text-amber-800"}`}
          >
            {safetyReady ? "안전 게이트 통과" : "미확인·부적합 항목을 해결하세요."}
          </span>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="work-steps-heading">
        <h3 id="work-steps-heading" className="text-xl font-extrabold">
          단계별 수행
        </h3>
        <div className="mt-6 space-y-4">
          {task.steps.map((step, index) => {
            const complete = record.completedStepIds.includes(step.id);
            return (
              <label
                key={step.id}
                className={`flex gap-4 rounded-xl border p-4 ${
                  complete
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0"
                  disabled={record.status !== "in_progress"}
                  checked={complete}
                  onChange={(event) =>
                    setRecord((current) => ({
                      ...current,
                      completedStepIds: event.target.checked
                        ? [...current.completedStepIds, step.id]
                        : current.completedStepIds.filter((id) => id !== step.id),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <span>
                  <span className="text-xs font-black uppercase tracking-[.12em] text-[#16697a]">
                    {index + 1}. {phaseLabel(step.phase)}
                  </span>
                  <strong className="mt-1 block">{step.title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {step.instruction}
                  </span>
                  <span className="mt-2 block text-xs font-bold text-slate-500">
                    완료 증거: {step.completionEvidence}
                  </span>
                  {step.warning ? (
                    <span className="mt-2 block text-xs font-bold text-red-700">
                      주의: {step.warning}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="measurements-heading">
        <h3 id="measurements-heading" className="text-xl font-extrabold">
          측정·판정 기록
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          자동 정답값이 아니라 과제·도면·WPS·제작사 기준을 확인한 실제 값을
          기록합니다.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {task.measurements.map((measurement) => (
            <label
              key={measurement.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-extrabold"
            >
              {measurement.label}
              <span className="mt-1 block font-normal leading-6 text-slate-600">
                {measurement.method}
              </span>
              {measurement.allowedValues.length ? (
                <select
                  disabled={record.status !== "in_progress"}
                  value={record.measurementValues[measurement.id] ?? ""}
                  onChange={(event) =>
                    setRecord((current) => ({
                      ...current,
                      measurementValues: {
                        ...current.measurementValues,
                        [measurement.id]: event.target.value,
                      },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                  className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
                >
                  <option value="">선택</option>
                  {measurement.allowedValues.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type={measurement.valueType === "number" ? "number" : "text"}
                    step="any"
                    disabled={record.status !== "in_progress"}
                    value={record.measurementValues[measurement.id] ?? ""}
                    onChange={(event) =>
                      setRecord((current) => ({
                        ...current,
                        measurementValues: {
                          ...current.measurementValues,
                          [measurement.id]: event.target.value,
                        },
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-3 font-normal"
                  />
                  {measurement.canonicalUnit ? (
                    <span>{measurement.canonicalUnit}</span>
                  ) : null}
                </div>
              )}
              <span className="mt-3 block text-xs leading-5 text-slate-500">
                판정: {measurement.acceptanceCriteria}
                <br />
                기준 우선순위: {measurement.sourceCondition}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="finish-heading">
        <h3 id="finish-heading" className="text-xl font-extrabold">
          수행평가와 종료
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {task.recordFields.map((field) => (
            <label key={field.id} className="text-sm font-extrabold">
              {field.label}
              {field.required ? (
                <span className="ml-1 text-red-700" aria-label="필수">
                  *
                </span>
              ) : null}
              {field.inputType === "choice" ? (
                <select
                  disabled={record.status !== "in_progress"}
                  value={record.recordFieldValues?.[field.id] ?? ""}
                  onChange={(event) =>
                    setRecord((current) => ({
                      ...current,
                      recordFieldValues: {
                        ...(current.recordFieldValues ?? {}),
                        [field.id]: event.target.value,
                      },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal"
                >
                  <option value="">선택</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={
                    field.inputType === "date"
                      ? "date"
                      : field.inputType === "number"
                        ? "number"
                        : "text"
                  }
                  disabled={record.status !== "in_progress"}
                  value={record.recordFieldValues?.[field.id] ?? ""}
                  onChange={(event) =>
                    setRecord((current) => ({
                      ...current,
                      recordFieldValues: {
                        ...(current.recordFieldValues ?? {}),
                        [field.id]: event.target.value,
                      },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal"
                />
              )}
              <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                {field.guidance}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-extrabold">
            자기평가
            <select
              disabled={record.status !== "in_progress"}
              value={record.selfAssessment}
              onChange={(event) =>
                setRecord((current) => ({
                  ...current,
                  selfAssessment: event.target
                    .value as StoredPracticalWorkRecord["selfAssessment"],
                  updatedAt: new Date().toISOString(),
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal"
            >
              <option value="">선택</option>
              <option value="independent">독립 수행 가능</option>
              <option value="assisted">도움이 필요함</option>
              <option value="retry">재연습 필요</option>
            </select>
          </label>
          <label className="text-sm font-extrabold">
            이상·재작업·재시험 메모
            <textarea
              disabled={record.status !== "in_progress"}
              value={record.notes}
              onChange={(event) =>
                setRecord((current) => ({
                  ...current,
                  notes: event.target.value,
                  updatedAt: new Date().toISOString(),
                }))
              }
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          {record.status === "in_progress" ? (
            <>
              <button
                type="button"
                data-testid="practical-task-complete"
                disabled={!canComplete}
                onClick={() => changeStatus("completed")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-extrabold text-white disabled:opacity-40"
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                수행 완료
              </button>
              <button
                type="button"
                onClick={() => changeStatus("abandoned")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-extrabold text-slate-700"
              >
                <CircleStop size={18} aria-hidden="true" />
                중단
              </button>
            </>
          ) : null}
          {record.status === "completed" ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 font-extrabold text-emerald-800">
              <ClipboardCheck size={18} aria-hidden="true" />
              모든 필수 수행·측정·자기평가 완료
            </span>
          ) : null}
        </div>
        {!canComplete && record.status === "in_progress" ? (
          <p className="mt-4 text-sm font-bold text-amber-800">
            단계 {record.completedStepIds.length}/{task.steps.length} · 측정{" "}
            {
              task.measurements.filter(
                (item) => record.measurementValues[item.id]?.trim(),
              ).length
            }
            /{task.measurements.length} · 자기평가를 모두 완료해야 종료할 수
            있습니다. 필수 기록란도 모두 작성해야 합니다.
          </p>
        ) : null}
      </section>
    </section>
  );
}

function createEmptyRecord(task: PracticalTaskContent): StoredPracticalWorkRecord {
  return {
    key: practicalWorkRecordKey(task.id, task.version),
    taskId: task.id,
    taskVersion: task.version,
    acceptanceRuleVersion: task.acceptanceRuleVersion,
    safetyGateVersion: task.safetyGateVersion,
    status: "not_started",
    safetyChecks: Object.fromEntries(
      task.safetyChecks.map((check) => [
        check.id,
        { state: "unchecked", reason: "", checkedAt: null },
      ]),
    ),
    completedStepIds: [],
    measurementValues: {},
    recordFieldValues: {},
    selfAssessment: "",
    notes: "",
    startedAt: null,
    completedAt: null,
    abandonedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function phaseLabel(phase: PracticalTaskContent["steps"][number]["phase"]) {
  const labels: Record<typeof phase, string> = {
    prepare: "준비",
    isolate: "에너지 격리",
    execute: "수행",
    measure: "측정",
    judge: "판정",
    diagnose: "진단",
    restore: "복구",
    record: "기록",
  };
  return labels[phase];
}
