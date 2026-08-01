"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  CheckCircle2,
  Clock3,
  Target,
  TrendingDown,
  XCircle,
} from "lucide-react";
import {
  GUEST_ATTEMPTS_CHANGED_EVENT,
  GUEST_ATTEMPTS_KEY,
} from "@/lib/learning/guest-attempt-storage";

type Attempt = {
  questionId: string;
  isCorrect: boolean;
  dueAt: string;
  attemptedAt: string;
  attemptKind?: string;
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(GUEST_ATTEMPTS_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(GUEST_ATTEMPTS_CHANGED_EVENT, callback);
  };
}

export function GuestProgress() {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(GUEST_ATTEMPTS_KEY) ?? "[]",
    () => "[]",
  );
  const attempts = safeAttempts(raw);
  const unique = new Set(attempts.map((attempt) => attempt.questionId)).size;
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  const wrong = attempts.length - correct;
  const due = attempts.filter(
    (attempt) => new Date(attempt.dueAt) <= new Date(),
  ).length;
  const recentTrend = accuracyTrend(attempts);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Target />} value={unique} label="학습한 문제" />
        <Metric icon={<CheckCircle2 />} value={correct} label="정답 시도" />
        <Metric icon={<XCircle />} value={wrong} label="오답 시도" />
        <Metric icon={<Clock3 />} value={due} label="복습 예정" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="card p-6">
          <div className="flex items-center gap-2 text-[#16697a]">
            <TrendingDown aria-hidden />
            <h2 className="font-extrabold">최근 30일 변화</h2>
          </div>
          <p className="mt-4 text-3xl font-black">
            {recentTrend.current === null
              ? "기록 없음"
              : `${recentTrend.current}%`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recentTrend.delta === null
              ? "비교할 이전 30일 기록이 아직 없습니다."
              : `직전 30일보다 ${recentTrend.delta >= 0 ? "+" : ""}${recentTrend.delta}%p`}
          </p>
        </section>

        <section className="card p-6">
          <h2 className="font-extrabold">취약 중·소주제 분석</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            어떤 중주제와 소주제의 정답률이 70% 미만인지 확인하는 상세
            분석은 계정 기록으로 제공합니다. 로그인한 뒤 현재 기기 기록을
            합치면 이어서 분석할 수 있습니다.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl border border-[#16697a] px-4 py-2.5 text-sm font-extrabold text-[#16697a]"
          >
            로그인하고 취약 영역 보기
          </Link>
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="card p-6">
      <span className="text-[#16697a]">{icon}</span>
      <p className="mt-5 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function safeAttempts(raw: string): Attempt[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is Attempt =>
        typeof item === "object" &&
        item !== null &&
        typeof item.questionId === "string" &&
        typeof item.isCorrect === "boolean" &&
        typeof item.dueAt === "string" &&
        typeof item.attemptedAt === "string",
    );
  } catch {
    return [];
  }
}

function accuracyTrend(attempts: Attempt[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const current = attempts.filter((attempt) => {
    const time = new Date(attempt.attemptedAt).getTime();
    return Number.isFinite(time) && time >= now - 30 * day;
  });
  const previous = attempts.filter((attempt) => {
    const time = new Date(attempt.attemptedAt).getTime();
    return (
      Number.isFinite(time) &&
      time < now - 30 * day &&
      time >= now - 60 * day
    );
  });
  const currentAccuracy = accuracy(current);
  const previousAccuracy = accuracy(previous);
  return {
    current: currentAccuracy,
    delta:
      currentAccuracy === null || previousAccuracy === null
        ? null
        : currentAccuracy - previousAccuracy,
  };
}

function accuracy(attempts: Attempt[]) {
  if (!attempts.length) return null;
  return Math.round(
    (attempts.filter((attempt) => attempt.isCorrect).length /
      attempts.length) *
      100,
  );
}
