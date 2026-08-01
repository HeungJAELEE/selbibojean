"use client";

import Link from "next/link";
import { useState } from "react";
import {
  GUEST_ATTEMPTS_KEY,
  parseGuestLearningAttempts,
} from "@/lib/learning/guest-attempt-storage";

export function AccountForm({
  mode,
  oauthProviders,
}: {
  mode: "login" | "register";
  oauthProviders?: { google: boolean; kakao: boolean };
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const hasDeviceRecords =
        parseGuestLearningAttempts(localStorage.getItem(GUEST_ATTEMPTS_KEY))
          .length > 0;
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          passwordConfirm: confirm,
          policyAccepted: accepted,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "요청을 처리하지 못했습니다.");
        setLoading(false);
        return;
      }
      window.location.assign(
        hasDeviceRecords ? "/settings/account?merge=ready" : "/",
      );
    } catch {
      setError("연결이 중단되었습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  const showOauth =
    mode === "login" && (oauthProviders?.google || oauthProviders?.kakao);

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md p-7 md:p-9">
      <label className="grid gap-2 text-sm font-bold">
        아이디
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          autoComplete="username"
          pattern="[a-z0-9_]{4,20}"
          required
          className="rounded-xl border border-slate-300 p-3"
          placeholder="영문·숫자·밑줄 4~20자"
        />
      </label>
      <label className="mt-5 grid gap-2 text-sm font-bold">
        비밀번호
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
          type="password"
          minLength={8}
          required
          className="rounded-xl border border-slate-300 p-3"
          placeholder="8자 이상"
        />
      </label>
      {mode === "register" ? (
        <>
          <label className="mt-5 grid gap-2 text-sm font-bold">
            비밀번호 확인
            <input
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              type="password"
              minLength={8}
              required
              className="rounded-xl border border-slate-300 p-3"
            />
          </label>
          <label className="mt-6 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              required
              className="mt-1 size-4 shrink-0"
            />
            <span>
              비밀번호 복구를 제공하지 않으며, 관리자 외 계정은 마지막 로그인
              또는 학습 활동 후 7일(168시간)이 지나면 사이트 계정과 학습
              기록이 자동 삭제된다는 점을 확인했습니다.
            </span>
          </label>
        </>
      ) : null}
      {error ? (
        <p
          className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        disabled={loading}
        className="mt-7 w-full rounded-xl bg-[#173957] p-4 font-extrabold text-white disabled:opacity-50"
      >
        {loading
          ? "처리 중"
          : mode === "login"
            ? "로그인"
            : "계정 만들기"}
      </button>
      {showOauth ? (
        <div className="mt-7 border-t border-slate-200 pt-6">
          <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            관리자 외 계정은 마지막 인증·학습 활동 후 168시간이 지나면
            Google·Kakao 계정 자체가 아니라 이 사이트 계정과 학습 기록이
            삭제됩니다.
          </p>
          <div className="mt-4 grid gap-3">
            {oauthProviders?.google ? (
              <a
                href="/api/auth/oauth?provider=google&next=%2Fsettings%2Faccount%3Fmerge%3Dready"
                className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-800"
              >
                Google로 계속하기
              </a>
            ) : null}
            {oauthProviders?.kakao ? (
              <a
                href="/api/auth/oauth?provider=kakao&next=%2Fsettings%2Faccount%3Fmerge%3Dready"
                className="rounded-xl bg-[#FEE500] px-4 py-3 text-center font-bold text-[#191919]"
              >
                Kakao로 계속하기
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <p className="mt-5 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            처음이신가요?{" "}
            <Link href="/register" className="font-bold text-[#16697a]">
              가입하기
            </Link>
          </>
        ) : (
          <>
            계정이 있나요?{" "}
            <Link href="/login" className="font-bold text-[#16697a]">
              로그인
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
