"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";

const SESSION_PREFIX = "seolbi:practical-mock:";

type PracticalMockSession = {
  id: string;
  questionIds: string[];
};

export function PracticalMockNavigator({
  sessionId,
  index,
  currentQuestionId,
}: {
  sessionId: string;
  index: number;
  currentQuestionId: string;
}) {
  const rawSession = useSyncExternalStore(
    subscribeToStorage,
    () => window.localStorage.getItem(`${SESSION_PREFIX}${sessionId}`),
    () => null,
  );
  const session = useMemo(() => parseSession(rawSession), [rawSession]);

  if (
    !session ||
    session.id !== sessionId ||
    session.questionIds[index] !== currentQuestionId
  ) {
    return null;
  }

  const previousId = session.questionIds[index - 1];
  const nextId = session.questionIds[index + 1];
  const questionHref = (questionId: string, targetIndex: number) =>
    `/practical/written/question/${questionId}?mock=${sessionId}&index=${targetIndex}`;

  return (
    <nav
      aria-label="필답 모의고사 문제 이동"
      className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#8f3f0a]">
            필답 모의고사
          </p>
          <p className="mt-1 font-extrabold">
            {index + 1} / {session.questionIds.length}문제
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {previousId ? (
            <Link
              href={questionHref(previousId, index - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold"
            >
              <ArrowLeft size={15} /> 이전
            </Link>
          ) : null}
          {nextId ? (
            <Link
              href={questionHref(nextId, index + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#173957] px-4 py-2 text-sm font-bold text-white"
            >
              다음 <ArrowRight size={15} />
            </Link>
          ) : (
            <Link
              href="/practical/mock"
              className="inline-flex items-center gap-2 rounded-xl bg-[#8f3f0a] px-4 py-2 text-sm font-bold text-white"
            >
              모의고사 종료 <Flag size={15} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function parseSession(rawSession: string | null): PracticalMockSession | null {
  if (!rawSession) return null;
  try {
    const value = JSON.parse(rawSession) as Partial<PracticalMockSession>;
    return typeof value.id === "string" &&
      Array.isArray(value.questionIds) &&
      value.questionIds.every((id) => typeof id === "string")
      ? { id: value.id, questionIds: value.questionIds }
      : null;
  } catch {
    return null;
  }
}
