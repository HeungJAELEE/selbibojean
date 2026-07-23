"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import type { ConceptGroup, PracticeFeedback, PublicQuestion, Subject } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { PracticeFeedbackPanel } from "@/components/practice-feedback";

type Session = {
  sessionId: string;
  storage: "guest" | "account";
  availableCount: number;
  limited: boolean;
  originalRatio?: number;
  actualOriginalCount?: number;
  focus?: {
    fallback: boolean;
    groups: Array<{ id: string; title: string; mistakes: number }>;
  } | null;
  questions: PublicQuestion[];
};

const SESSION_PREFIX = "seolbi:practice:";
const ATTEMPTS_KEY = "seolbi:guest-attempts";

export function RandomPractice({ subjects, groups }: { subjects: Subject[]; groups: ConceptGroup[] }) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") ?? "all");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [groupId, setGroupId] = useState("");
  const [count, setCount] = useState<"10" | "20" | "50" | "all">("20");
  const [originalRatio, setOriginalRatio] = useState<0 | 25 | 50 | 75 | 100>(50);
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === "undefined") return null;
    const resume = searchParams.get("resume");
    const raw = resume ? localStorage.getItem(`${SESSION_PREFIX}${resume}`) : null;
    return raw ? (JSON.parse(raw) as Session) : null;
  });
  const [index, setIndex] = useState(() => Number(searchParams.get("index") ?? 0));
  const [selectedChoiceId, setSelectedChoiceId] = useState("");
  const [selfRating, setSelfRating] = useState<"unknown" | "unsure" | "known">("unsure");
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [isRetry, setIsRetry] = useState(() => Boolean(searchParams.get("retry")));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableGroups = useMemo(() => groups.filter((group) => group.subjectId === subjectId), [groups, subjectId]);
  const question = session?.questions[index];

  async function startSession() {
    setLoading(true);
    setError("");
    const guestAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? "[]") as Array<{ questionId: string; isCorrect: boolean; dueAt: string }>;
    const guestQuestionIds =
      mode === "wrong" || mode === "weak"
        ? guestAttempts.filter((attempt) => !attempt.isCorrect).map((attempt) => attempt.questionId)
        : mode === "due"
          ? guestAttempts.filter((attempt) => new Date(attempt.dueAt) <= new Date()).map((attempt) => attempt.questionId)
          : undefined;
    try {
      const response = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, subjectId, conceptGroupId: groupId, count: count === "all" ? "all" : Number(count), originalRatio, guestQuestionIds }),
      });
      const result = await response.json() as Session & { error?: string };
      if (!response.ok) throw new Error(result.error);
      setSession(result);
      setIndex(0);
      setFeedback(null);
      setSelectedChoiceId("");
      setResults({});
      setCompleted(false);
      localStorage.setItem(`${SESSION_PREFIX}${result.sessionId}`, JSON.stringify({ ...result, index: 0 }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "문제 세션을 만들지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(attemptKind: "initial" | "retry" = "initial") {
    if (!question || !selectedChoiceId || !session) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, choiceId: selectedChoiceId, selfRating, sessionId: session.sessionId, attemptKind }),
      });
      const result = await response.json() as PracticeFeedback & { error?: string };
      if (!response.ok) throw new Error(result.error);
      setFeedback(result);
      setResults((current) => ({ ...current, [question.id]: result.isCorrect }));
      if (session.storage === "guest") {
        const attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? "[]") as unknown[];
        const dueAt = new Date();
        dueAt.setMinutes(dueAt.getMinutes() + (result.isCorrect ? selfRating === "known" ? 7 * 1440 : selfRating === "unsure" ? 3 * 1440 : 1440 : 10));
        attempts.push({ questionId: question.id, selectedChoiceId, isCorrect: result.isCorrect, selfRating, dueAt: dueAt.toISOString(), attemptKind, attemptedAt: new Date().toISOString() });
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "채점하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function move(nextIndex: number) {
    if (!session) return;
    setIndex(nextIndex);
    setSelectedChoiceId("");
    setFeedback(null);
    setIsRetry(false);
    setCompleted(false);
    localStorage.setItem(`${SESSION_PREFIX}${session.sessionId}`, JSON.stringify({ ...session, index: nextIndex }));
  }

  function retry() {
    setSelectedChoiceId("");
    setFeedback(null);
    setIsRetry(true);
  }

  if (!session) {
    return (
      <section className="card p-6 md:p-8" aria-labelledby="random-options">
        <h2 id="random-options" className="text-xl font-extrabold">출제 범위 설정</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">범위
            <select aria-label="범위" className="rounded-xl border border-slate-300 bg-white p-3" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="all">전체 공개 문제</option><option value="subject">과목</option><option value="group">44개 세부항목군</option><option value="weak">취약 영역 집중</option><option value="wrong">내 오답만</option><option value="due">복습 예정</option>
            </select>
          </label>
          {(mode === "subject" || mode === "group" || mode === "weak") && <label className="grid gap-2 text-sm font-bold">과목<select aria-label="과목" className="rounded-xl border border-slate-300 bg-white p-3" value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setGroupId(""); }}>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.shortTitle}</option>)}</select></label>}
          {mode === "group" && <label className="grid gap-2 text-sm font-bold">세부항목군<select aria-label="세부항목군" className="rounded-xl border border-slate-300 bg-white p-3" value={groupId} onChange={(event) => setGroupId(event.target.value)}><option value="">선택하세요</option>{availableGroups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>}
          <label className="grid gap-2 text-sm font-bold">문제 수<select aria-label="문제 수" className="rounded-xl border border-slate-300 bg-white p-3" value={count} onChange={(event) => setCount(event.target.value as typeof count)}><option value="10">10문제</option><option value="20">20문제</option><option value="50">50문제</option><option value="all">가능한 문제 전체</option></select></label>
          <label className="grid gap-2 text-sm font-bold">실제 기출 비율<select aria-label="실제 기출 비율" className="rounded-xl border border-slate-300 bg-white p-3" value={originalRatio} onChange={(event) => setOriginalRatio(Number(event.target.value) as typeof originalRatio)}><option value="0">0% · 개념 문제만</option><option value="25">25% · 개념 중심</option><option value="50">50% · 균형 혼합</option><option value="75">75% · 기출 중심</option><option value="100">100% · 가능한 기출 전체</option></select></label>
        </div>
        <p className="mt-4 rounded-xl bg-[#eaf7f6] p-3 text-sm leading-6 text-[#135c69]">{mode === "weak" ? "선택 과목의 오답 기록을 세부항목군별로 집계해 많이 틀린 최대 3개 영역의 다른 문제까지 출제합니다. 오답 기록이 없으면 선택 과목 전체에서 시작합니다." : "기출 비율을 직접 정할 수 있습니다."} 원문과 정답·보기가 정확히 대조되지 않은 문제는 실제 기출 출제에서 제외됩니다.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <button onClick={startSession} disabled={loading || (mode === "group" && !groupId)} className="mt-7 w-full rounded-xl bg-[#173957] px-5 py-4 font-extrabold text-white disabled:opacity-50">{loading ? "문제를 고르는 중…" : "중복 없이 시작하기"}</button>
      </section>
    );
  }

  if (completed) {
    const correctCount = Object.values(results).filter(Boolean).length;
    return (
      <section className="card p-8 text-center md:p-12" aria-live="polite">
        <p className="eyebrow">Session complete</p>
        <h2 className="mt-3 text-3xl font-extrabold">문제 세션을 마쳤습니다.</h2>
        <p className="mt-4 text-lg text-slate-600">
          최초·재도전의 마지막 기록 기준 {session.questions.length}문제 중{" "}
          <strong className="text-[#16697a]">{correctCount}문제 정답</strong>
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => move(0)}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold"
          >
            처음부터 다시 보기
          </button>
          <button
            onClick={() => {
              setSession(null);
              setResults({});
              setCompleted(false);
            }}
            className="rounded-xl bg-[#173957] px-5 py-3 font-bold text-white"
          >
            새 범위 선택
          </button>
        </div>
      </section>
    );
  }

  if (!question) {
    return <section className="card p-10 text-center"><h2 className="text-2xl font-extrabold">조건에 맞는 공개 문제가 없습니다.</h2><p className="mt-3 text-slate-600">검수 완료된 문제만 출제됩니다. 범위를 바꿔 다시 시도해 주세요.</p><button onClick={() => setSession(null)} className="mt-6 rounded-xl bg-[#173957] px-5 py-3 font-bold text-white">범위 다시 선택</button></section>;
  }

  const returnTo = `/written/practice/random?resume=${session.sessionId}&index=${index}&retry=${question.id}`;
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_290px]">
      <div className="card p-6 md:p-9">
        <div className="text-sm text-slate-500">문제 {index + 1} / {session.questions.length}</div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#16697a]" style={{ width: `${((index + 1) / session.questions.length) * 100}%` }} /></div>
        {session.limited && index === 0 && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">요청한 수보다 공개 가능 문제가 적어 {session.questions.length}문제를 한 번씩 출제합니다.</p>}
        {session.focus && index === 0 && <div className="mt-4 rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-900"><strong className="block">취약 영역 집중 결과</strong>{session.focus.fallback ? <span>저장된 오답이 없어 선택 과목 전체 문제로 시작합니다.</span> : <span>{session.focus.groups.map((group) => `${group.title} ${group.mistakes}회`).join(" · ")} 오답을 기준으로 관련 문제를 우선 출제합니다.</span>}</div>}
        {(question.provenance.original || question.provenance.reconstructed || question.provenance.historical) && <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">{question.provenance.original && question.provenance.exam && <><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">실제 기출 원문</span><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{formatExamLabel(question.provenance.exam)}</span><a href={question.provenance.exam.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-slate-600">원문 출처 <ArrowUpRight size={12} /></a></>}{question.provenance.reconstructed && <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">원문 근거 학습용 재구성</span>}{question.provenance.historical && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">과거 시험 맥락</span>}</div>}
        <h2 className="mt-8 text-xl font-extrabold leading-relaxed md:text-2xl">{question.stem}</h2>
        <div className="mt-7 grid gap-3">
          {question.choices.map((choice) => <button key={choice.id} disabled={Boolean(feedback)} aria-pressed={selectedChoiceId === choice.id} onClick={() => setSelectedChoiceId(choice.id)} className={cn("flex gap-4 rounded-2xl border p-4 text-left transition", selectedChoiceId === choice.id ? "border-[#16697a] bg-[#eaf7f6] ring-1 ring-[#16697a]" : "border-slate-200 hover:border-slate-400", feedback && choice.id === feedback.correctChoice.id && "border-emerald-500 bg-emerald-50")}><span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-sm font-extrabold">{choice.order}</span><span>{choice.text}</span></button>)}
        </div>
        {!feedback && <div className="mt-7 flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-end md:justify-between"><fieldset><legend className="text-sm font-bold">지금 이 개념은?</legend><div className="mt-2 flex gap-2">{([['unknown','모름'],['unsure','헷갈림'],['known','앎']] as const).map(([value,label]) => <label key={value} className={cn("cursor-pointer rounded-lg border px-3 py-2 text-sm",selfRating===value&&"border-[#16697a] bg-[#eaf7f6]")}><input type="radio" className="sr-only" checked={selfRating===value} onChange={() => setSelfRating(value)} />{label}</label>)}</div></fieldset><button onClick={() => submitAnswer(isRetry ? "retry" : "initial")} disabled={!selectedChoiceId || loading} className="rounded-xl bg-[#173957] px-8 py-3.5 font-extrabold text-white disabled:opacity-40">{loading ? "채점 중…" : "답안 제출"}</button></div>}
        {feedback && <PracticeFeedbackPanel feedback={feedback} lessonHref={`/written/theory/${feedback.lesson.id}?returnTo=${encodeURIComponent(returnTo)}#${feedback.lesson.anchor}`} />}
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        {feedback && <div className="mt-6 flex flex-wrap justify-between gap-3"><button onClick={retry} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold"><RotateCcw size={17} />정답 숨기고 재도전</button><button onClick={() => index + 1 === session.questions.length ? setCompleted(true) : move(index + 1)} className="flex items-center gap-2 rounded-xl bg-[#16697a] px-5 py-3 font-bold text-white">{index + 1 === session.questions.length ? "결과 보기" : "다음 문제"}<ArrowRight size={17} /></button></div>}
      </div>
      <aside className="card h-fit p-5"><h3 className="font-extrabold">세션 진행</h3><p className="mt-2 text-sm text-slate-500">한 세션에서는 같은 문제를 다시 뽑지 않습니다.</p>{typeof session.actualOriginalCount === "number" && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">실제 기출 {session.actualOriginalCount} / {session.questions.length}문제</p>}<div className="mt-5 grid grid-cols-5 gap-2">{session.questions.map((item, itemIndex) => <button key={item.id} onClick={() => move(itemIndex)} aria-label={`${itemIndex + 1}번 문제로 이동`} className={cn("aspect-square rounded-lg text-sm font-bold",itemIndex===index?"bg-[#173957] text-white":"bg-slate-100")}>{itemIndex+1}</button>)}</div><button onClick={() => setSession(null)} className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={16} />새 범위로 시작</button></aside>
    </section>
  );
}

function formatExamLabel(exam: NonNullable<PublicQuestion["provenance"]["exam"]>) {
  const number = exam.questionNumber ? ` · ${exam.questionNumber}번` : "";
  return `${exam.year}년 ${exam.sessionLabel}${number}`;
}
