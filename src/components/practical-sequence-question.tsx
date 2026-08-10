"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  PracticalReveal,
  PublicPracticalSequenceVisualAid,
  PublicPracticalQuestion,
} from "@/lib/domain/practical-types";
import { moveSequenceItem, shuffleSequence } from "@/lib/practical-sequence";

export function PracticalSequenceQuestion({
  question,
  visualAid,
  initialFrameIds,
}: {
  question: PublicPracticalQuestion;
  visualAid: PublicPracticalSequenceVisualAid;
  initialFrameIds: string[];
}) {
  const [order, setOrder] = useState(initialFrameIds);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<PracticalReveal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedFrameIds, setLoadedFrameIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [unavailableFrameIds, setUnavailableFrameIds] = useState<Set<string>>(
    () => new Set(),
  );
  const framesById = new Map(
    (visualAid.frames ?? []).map((frame) => [frame.id, frame]),
  );
  const frameFeedbackById = new Map(
    feedback?.sequenceResult?.frameFeedback.map((frame) => [
      frame.frameId,
      frame,
    ]) ?? [],
  );
  const useHorizontalPortraitStrip =
    visualAid.layout === "horizontal-portrait-strip";
  const hasUnavailableFrame = unavailableFrameIds.size > 0;
  const allFramesLoaded =
    visualAid.frames.length > 0 &&
    visualAid.frames.every((frame) => loadedFrameIds.has(frame.id));

  function markFrameLoaded(frameId: string) {
    setLoadedFrameIds((current) => {
      if (current.has(frameId)) return current;
      const next = new Set(current);
      next.add(frameId);
      return next;
    });
  }

  function markFrameUnavailable(frameId: string) {
    setLoadedFrameIds((current) => {
      if (!current.has(frameId)) return current;
      const next = new Set(current);
      next.delete(frameId);
      return next;
    });
    setUnavailableFrameIds((current) => {
      if (current.has(frameId)) return current;
      const next = new Set(current);
      next.add(frameId);
      return next;
    });
  }

  function move(fromIndex: number, toIndex: number) {
    if (feedback) return;
    setOrder((current) => moveSequenceItem(current, fromIndex, toIndex));
  }

  function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId || feedback) return;
    setOrder((current) => {
      const fromIndex = current.indexOf(draggedId);
      const toIndex = current.indexOf(targetId);
      return moveSequenceItem(current, fromIndex, toIndex);
    });
    setDraggedId(null);
  }

  async function submit() {
    if (!allFramesLoaded || hasUnavailableFrame) {
      setError(
        hasUnavailableFrame
          ? "이미지를 불러오지 못한 카드가 있어 정답을 제출할 수 없습니다. 페이지를 새로고침해 주세요."
          : "모든 작업 이미지를 불러온 뒤 정답을 제출해 주세요.",
      );
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch("/api/practical/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        answer: note.trim() || `sequence:${order.join("|")}`,
        sequenceFrameIds: order,
        selfRating: "unknown",
      }),
    });
    const payload = (await response.json().catch(() => null)) as
      PracticalReveal | { error?: string } | null;
    setLoading(false);
    if (!response.ok || !payload || !("modelAnswer" in payload)) {
      setError(
        payload && "error" in payload
          ? (payload.error ?? "정답을 확인하지 못했습니다.")
          : "정답을 확인하지 못했습니다.",
      );
      return;
    }
    setFeedback(payload);
  }

  function retry() {
    const frameTokens = (visualAid.frames ?? []).map((frame) => frame.id);
    setOrder(shuffleSequence(frameTokens));
    setNote("");
    setFeedback(null);
    setError("");
  }

  return (
    <section className="card p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-[#16697a]">
            사진 순서 맞추기
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-[#173957]">
            카드를 올바른 작업 순서로 정렬하세요
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            카드를 끌어 놓거나, 각 카드의 앞·뒤 이동 버튼을 사용합니다.
          </p>
        </div>
        {!feedback ? (
          <button
            type="button"
            onClick={() =>
              setOrder(
                shuffleSequence(
                  (visualAid.frames ?? []).map((frame) => frame.id),
                ),
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
          >
            다시 섞기
          </button>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
        <p className="text-xs font-extrabold text-[#16697a]">정렬할 작업</p>
        <p className="mt-1 font-extrabold text-[#173957]">{question.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          각 사진 아래의 행동 설명을 읽고, 실제 작업이 진행되는 순서대로 카드를
          배치하세요.
        </p>
      </div>

      <ol
        data-layout={
          useHorizontalPortraitStrip ? "horizontal-portrait-strip" : "grid"
        }
        className={
          useHorizontalPortraitStrip
            ? "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
            : "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
        aria-label="현재 작업 순서"
      >
        {order.map((frameId, index) => {
          const frame = framesById.get(frameId);
          if (!frame) return null;
          const revealedFrame = frameFeedbackById.get(frameId);
          const actionDescription = feedback
            ? (revealedFrame?.captionAfterAnswer ??
              revealedFrame?.learningAltText ??
              frame.promptAltText)
            : (frame.captionBeforeAnswer ?? frame.promptAltText);
          const correctIndex =
            feedback?.sequenceResult?.correctFrameIds.indexOf(frameId);
          const isCorrectPosition =
            feedback && correctIndex !== undefined
              ? correctIndex === index
              : false;
          const isFrameUnavailable = unavailableFrameIds.has(frame.id);
          return (
            <li
              key={frame.id}
              draggable={!feedback}
              onDragStart={() => setDraggedId(frame.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(frame.id)}
              data-testid="sequence-order-item"
              className={`overflow-hidden rounded-2xl border-2 bg-white ${
                useHorizontalPortraitStrip
                  ? "w-[min(78vw,20rem)] flex-none snap-start md:w-72 "
                  : ""
              }${
                feedback
                  ? isCorrectPosition
                    ? "border-emerald-400"
                    : "border-rose-300"
                  : "cursor-grab border-slate-200 active:cursor-grabbing"
              }`}
            >
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                <strong className="text-sm text-[#173957]">
                  현재 {index + 1}단계
                </strong>
                {feedback ? (
                  <span
                    className={`text-xs font-extrabold ${
                      isCorrectPosition ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {isCorrectPosition
                      ? "위치 정답"
                      : `정답 ${Number(correctIndex) + 1}단계`}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">
                    끌어서 이동
                  </span>
                )}
              </div>
              <div
                className={`relative bg-white ${
                  useHorizontalPortraitStrip ? "aspect-[3/4]" : "aspect-[5/2]"
                }`}
              >
                <Image
                  src={frame.imageUrl}
                  alt={frame.promptAltText}
                  fill
                  unoptimized
                  sizes={
                    useHorizontalPortraitStrip
                      ? "(max-width: 768px) 78vw, 18rem"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-contain p-2"
                  style={{ objectFit: "contain" }}
                  onLoad={() => markFrameLoaded(frame.id)}
                  onError={() => markFrameUnavailable(frame.id)}
                />
                {isFrameUnavailable ? (
                  <div
                    className="absolute inset-2 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-bold leading-6 text-rose-800"
                    data-testid="sequence-frame-unavailable"
                    role="alert"
                  >
                    이미지를 불러오지 못했습니다. 페이지를 새로고침해 주세요.
                  </div>
                ) : null}
              </div>
              <p
                data-testid="sequence-action-description"
                className="min-h-20 border-t border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700"
              >
                {actionDescription}
              </p>
              {!feedback ? (
                <div className="grid grid-cols-2 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`${index + 1}단계 카드를 앞으로 이동`}
                    className="border-r border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:text-slate-300"
                  >
                    ← 앞으로
                  </button>
                  <button
                    type="button"
                    disabled={index === order.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`${index + 1}단계 카드를 뒤로 이동`}
                    className="px-3 py-2 text-sm font-bold text-slate-700 disabled:text-slate-300"
                  >
                    뒤로 →
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!feedback ? (
        <>
          <label
            htmlFor="sequence-note"
            className="mt-6 block text-sm font-extrabold text-[#173957]"
          >
            단계별 핵심행동 메모 <span className="font-normal">(선택)</span>
          </label>
          <textarea
            id="sequence-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="예: 간격 측정 → 중심 맞춤 → 조립·체결 → 그리스 주입"
            className="mt-2 w-full rounded-xl border border-slate-300 p-4 leading-7 outline-none focus:border-[#16697a] focus:ring-2 focus:ring-[#16697a]/20"
          />
          <button
            type="button"
            disabled={loading || !allFramesLoaded || hasUnavailableFrame}
            onClick={submit}
            className="mt-4 rounded-xl bg-[#173957] px-6 py-3 font-extrabold text-white disabled:opacity-50"
          >
            {loading
              ? "순서 확인 중…"
              : hasUnavailableFrame
                ? "이미지 확인 필요"
                : !allFramesLoaded
                  ? "이미지 불러오는 중…"
                  : "이 순서로 정답 확인"}
          </button>
          {hasUnavailableFrame ? (
            <p className="mt-3 text-sm font-bold text-rose-700" role="alert">
              이미지를 불러오지 못한 카드가 있어 정답 제출을 막았습니다.
            </p>
          ) : null}
        </>
      ) : (
        <div
          data-testid="sequence-answer-feedback"
          className={`mt-6 rounded-2xl border p-5 ${
            feedback.sequenceResult?.isCorrect
              ? "border-emerald-300 bg-emerald-50"
              : "border-rose-300 bg-rose-50"
          }`}
        >
          <p className="text-lg font-extrabold text-[#173957]">
            {feedback.sequenceResult?.isCorrect
              ? "정답입니다."
              : "순서가 다릅니다. 카드별 정답 위치를 확인하세요."}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {feedback.modelAnswer}
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-lg border border-[#173957] bg-white px-4 py-2 text-sm font-extrabold text-[#173957]"
          >
            다시 섞어서 풀기
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
