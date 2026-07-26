"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Shuffle,
} from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export type PracticalMockQuestionSummary = {
  id: string;
  title: string;
  kind: "past" | "predicted";
  categoryId: string;
};

type PracticalMockSession = {
  id: string;
  createdAt: string;
  sourceMode: "mixed" | "past" | "predicted";
  questionIds: string[];
};

const SESSION_PREFIX = "seolbi:practical-mock:";

export function PracticalMockSetup({
  questions,
  categories,
}: {
  questions: PracticalMockQuestionSummary[];
  categories: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const isHydrated = useHydrated();
  const [sourceMode, setSourceMode] = useState<
    PracticalMockSession["sourceMode"]
  >("mixed");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() =>
    categories.map((category) => category.id),
  );
  const [requestedCount, setRequestedCount] = useState(20);
  const [error, setError] = useState("");

  const availableQuestions = useMemo(
    () =>
      questions.filter(
        (question) =>
          selectedCategoryIds.includes(question.categoryId) &&
          (sourceMode === "mixed" || question.kind === sourceMode),
      ),
    [questions, selectedCategoryIds, sourceMode],
  );

  const count = Math.min(requestedCount, availableQuestions.length);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  function startMock() {
    if (availableQuestions.length === 0 || count === 0) {
      setError("한 개 이상의 문제 유형을 선택해 주세요.");
      return;
    }
    const shuffled = [...availableQuestions];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }
    const session: PracticalMockSession = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      sourceMode,
      questionIds: shuffled.slice(0, count).map((question) => question.id),
    };
    window.localStorage.setItem(
      `${SESSION_PREFIX}${session.id}`,
      JSON.stringify(session),
    );
    router.push(
      `/practical/written/question/${session.questionIds[0]}?mock=${session.id}&index=0`,
    );
  }

  return (
    <div className="grid gap-6 pb-16">
      <section className="overflow-hidden rounded-3xl bg-[#173957] text-white">
        <div className="grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-teal-200">
              Written practical mock
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">
              기출복원과 NCS 예상문제로 구성
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              실제 기출복원은 출처가 확인된 문제이며, 예상문제는 NCS 수행내용과
              유사 출제형식을 조합한 연습문제입니다. 답안은 제출하기 전까지
              공개되지 않습니다.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-5 text-center">
            <p className="text-4xl font-black">{count}</p>
            <p className="mt-1 text-xs font-bold text-slate-200">
              선택된 문제 수
            </p>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="mock-source-title">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
            <ClipboardList size={20} />
          </span>
          <div>
            <p className="eyebrow">1단계</p>
            <h2 id="mock-source-title" className="mt-1 text-2xl font-extrabold">
              문제 근거 선택
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["mixed", "기출 + 예상 혼합", "실전 대비 기본 구성"],
            ["past", "기출복원만", "실제 복원문제 집중"],
            ["predicted", "NCS 예상만", "비슷한 유형 확장"],
          ].map(([id, label, description]) => (
            <button
              key={id}
              type="button"
              disabled={!isHydrated}
              onClick={() =>
                setSourceMode(id as PracticalMockSession["sourceMode"])
              }
              className={`rounded-2xl border p-5 text-left ${
                sourceMode === id
                  ? "border-[#16697a] bg-[#f0fbfa]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <strong className="flex items-center gap-2">
                {sourceMode === id ? <CheckCircle2 size={17} /> : null}
                {label}
              </strong>
              <span className="mt-2 block text-sm text-slate-500">
                {description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="mock-type-title">
        <p className="eyebrow">2단계</p>
        <h2 id="mock-type-title" className="mt-1 text-2xl font-extrabold">
          출제 유형과 문제 수
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {categories.map((category) => {
            const selected = selectedCategoryIds.includes(category.id);
            const categoryCount = questions.filter(
              (question) =>
                question.categoryId === category.id &&
                (sourceMode === "mixed" || question.kind === sourceMode),
            ).length;
            return (
              <label
                key={category.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                  selected
                    ? "border-[#6fb5b1] bg-[#f2fbfa]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!isHydrated}
                  onChange={() => toggleCategory(category.id)}
                  className="mt-1 size-5 accent-[#16697a]"
                />
                <span>
                  <strong className="block">{category.title}</strong>
                  <span className="mt-1 block text-xs text-slate-500">
                    선택 조건에서 {categoryCount}문제
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <label className="mt-6 grid max-w-sm gap-2 text-sm font-extrabold">
          모의고사 문제 수
          <select
            value={requestedCount}
            disabled={!isHydrated}
            onChange={(event) => setRequestedCount(Number(event.target.value))}
            className="rounded-xl border border-slate-300 bg-white p-3"
          >
            {[10, 20, 30, 40, 60].map((value) => (
              <option key={value} value={value}>
                최대 {value}문제
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!isHydrated || count === 0}
        onClick={startMock}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#8f3f0a] px-6 py-5 text-lg font-extrabold text-white disabled:opacity-50"
      >
        <Shuffle size={20} />
        {count}문제 모의고사 시작
        <ArrowRight size={20} />
      </button>

      <div className="grid gap-3 md:grid-cols-2">
        <MockNotice
          icon={<BookOpenCheck size={18} />}
          title="문제 전 이론 연결"
          text="각 문제에서 관련 NCS 이론을 먼저 확인할 수 있습니다."
        />
        <MockNotice
          icon={<ClipboardList size={18} />}
          title="문제별 자기채점"
          text="서술형 답안을 작성한 뒤 모범답안과 키워드로 평가합니다."
        />
      </div>
    </div>
  );
}

function MockNotice({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <span className="text-[#16697a]">{icon}</span>
      <strong className="mt-3 block">{title}</strong>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
