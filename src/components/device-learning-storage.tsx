"use client";

import Link from "next/link";
import { CloudUpload, HardDrive, ShieldCheck } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
  GUEST_ATTEMPTS_CHANGED_EVENT,
  GUEST_ATTEMPTS_KEY,
  notifyGuestAttemptsChanged,
  parseGuestLearningAttempts,
} from "@/lib/learning/guest-attempt-storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(GUEST_ATTEMPTS_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(GUEST_ATTEMPTS_CHANGED_EVENT, callback);
  };
}

export function DeviceLearningStorage({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(GUEST_ATTEMPTS_KEY) ?? "[]",
    () => "[]",
  );
  const attempts = parseGuestLearningAttempts(raw);
  const [merging, setMerging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function mergeRecords() {
    if (!attempts.length || merging) return;
    setMerging(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempts }),
      });
      const result = (await response.json()) as {
        error?: string;
        merged?: number;
      };
      if (!response.ok || result.merged !== attempts.length) {
        throw new Error(
          result.error ??
            "기기 기록 전체를 병합하지 못했습니다. 기록은 이 기기에 유지했습니다.",
        );
      }

      localStorage.removeItem(GUEST_ATTEMPTS_KEY);
      notifyGuestAttemptsChanged();
      setMessage(`${result.merged}개 학습 기록을 계정에 병합했습니다.`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "기기 기록을 병합하지 못했습니다.",
      );
    } finally {
      setMerging(false);
    }
  }

  return (
    <section
      className="rounded-2xl border border-[#8dc9c5] bg-[#f2fbfa] p-5"
      aria-labelledby="device-storage-title"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#16697a]">
          {authenticated ? (
            <CloudUpload aria-hidden size={20} />
          ) : (
            <HardDrive aria-hidden size={20} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="device-storage-title" className="font-extrabold text-[#173957]">
            {authenticated
              ? "현재 기기 학습기록"
              : "비로그인 · 이 기기에만 저장 중"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {authenticated
              ? attempts.length
                ? `계정에 아직 합치지 않은 기록 ${attempts.length}개가 이 기기에 있습니다.`
                : "계정에 합칠 별도 기기 기록이 없습니다."
              : `학습 기록 ${attempts.length}개가 현재 브라우저에만 저장됩니다. 브라우저 데이터 삭제나 다른 기기에서는 이어볼 수 없습니다.`}
          </p>
        </div>
      </div>

      {authenticated ? (
        attempts.length ? (
          <button
            type="button"
            onClick={mergeRecords}
            disabled={merging}
            className="mt-4 w-full rounded-xl bg-[#173957] px-5 py-3 font-extrabold text-white disabled:opacity-50 sm:w-auto"
          >
            {merging ? "기록을 병합하는 중…" : "현재 기기 기록을 계정에 합치기"}
          </button>
        ) : (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#16697a]">
            <ShieldCheck aria-hidden size={17} />
            계정 학습기록을 사용 중입니다.
          </p>
        )
      ) : (
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-xl bg-[#173957] px-5 py-3 font-extrabold text-white"
        >
          로그인하고 기록 합치기
        </Link>
      )}

      <div className="mt-3 text-sm" aria-live="polite">
        {message ? <p className="font-bold text-[#16697a]">{message}</p> : null}
        {error ? <p className="font-bold text-red-700">{error}</p> : null}
      </div>
    </section>
  );
}
