import Image from "next/image";
import type { PracticalVisualAid } from "@/lib/domain/practical-types";

export function PracticalVisualAidFigure({
  visualAid,
  mode = "theory",
  density = "default",
}: {
  visualAid: PracticalVisualAid;
  mode?: "prompt" | "theory";
  density?: "default" | "compact";
}) {
  if (
    visualAid.publicUseStatus !== "public" ||
    visualAid.technicalReviewStatus !== "verified"
  ) {
    return null;
  }

  const isPrompt = mode === "prompt";
  const frameById = new Map(
    visualAid.frames.map((frame) => [frame.id, frame] as const),
  );
  const promptFrames = visualAid.promptFrameIds
    ?.map((frameId) => frameById.get(frameId))
    .filter((frame) => frame !== undefined);
  const frames =
    isPrompt && promptFrames?.length === visualAid.frames.length
      ? promptFrames
      : visualAid.frames;
  const useHorizontalPortraitStrip =
    visualAid.id === "ncs-drive-unit-assembly-process-sequence";

  return (
    <figure
      data-testid={`practical-visual-aid-${visualAid.id}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      {isPrompt ? (
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-sm font-extrabold text-[#173957]">
            NCS 원문 이미지
          </p>
        </div>
      ) : null}
      <ol
        aria-label={isPrompt ? "문제 이미지 순서" : undefined}
        data-layout={
          useHorizontalPortraitStrip ? "horizontal-portrait-strip" : "grid"
        }
        className={`gap-4 ${density === "compact" ? "p-3" : "p-4"} ${
          useHorizontalPortraitStrip
            ? "flex snap-x snap-mandatory overflow-x-auto"
            : `grid ${
                frames.length > 1
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                  : "grid-cols-1"
              }`
        }`}
      >
        {frames.map((frame, index) => (
          <li
            key={frame.id}
            data-testid={`practical-visual-frame-${frame.id}`}
            className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${
              useHorizontalPortraitStrip
                ? "w-[min(78vw,20rem)] flex-none snap-start md:w-72"
                : ""
            }`}
          >
            {isPrompt && visualAid.promptLabels?.[index] ? (
              <p
                data-testid={`practical-visual-label-${index + 1}`}
                className="border-b border-slate-200 bg-white px-4 py-2 text-center text-base font-black text-[#173957]"
              >
                ({visualAid.promptLabels[index]})
              </p>
            ) : null}
            <div
              className={`relative ${
                useHorizontalPortraitStrip
                  ? "aspect-[3/4] w-full"
                  : frames.length > 1
                    ? "aspect-[5/2] w-full"
                    : density === "compact"
                      ? "min-h-44"
                      : "min-h-52"
              }`}
            >
              <Image
                src={frame.path}
                alt={isPrompt ? frame.promptAltText : frame.learningAltText}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes={
                  useHorizontalPortraitStrip
                    ? "(max-width: 768px) 78vw, 18rem"
                    : frames.length > 1
                      ? "(max-width: 640px) 100vw, 50vw"
                      : "100vw"
                }
                className="object-contain p-2"
                style={{ objectFit: "contain" }}
              />
            </div>
          </li>
        ))}
      </ol>
      <figcaption
        className={`border-t border-slate-200 bg-slate-50 ${
          density === "compact" ? "px-4 py-3" : "px-5 py-4"
        }`}
      >
        {!isPrompt ? (
          <>
            <p className="font-extrabold text-[#173957]">{visualAid.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {visualAid.caption}
            </p>
          </>
        ) : null}
        {density === "default" ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            출처: {visualAid.sourceLabel}, PDF p.{visualAid.pdfPage} · 인쇄 p.
            {visualAid.printedPage} · {visualAid.figureNumber}
            {!isPrompt ? " · " : ""}
            {!isPrompt
              ? visualAid.rightsStatus === "self_authored"
                ? "자체 제작 · NCS 원문 원리 대조"
                : "교육 목적 출처 표시 사용"
              : null}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
