import Image from "next/image";
import type { PracticalVisualAid } from "@/lib/domain/practical-types";

export function PracticalVisualAidFigure({
  visualAid,
  mode = "theory",
}: {
  visualAid: PracticalVisualAid;
  mode?: "prompt" | "theory";
}) {
  if (visualAid.publicUseStatus !== "public") return null;

  const isPrompt = mode === "prompt";

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
        className={`grid gap-4 p-4 ${
          visualAid.imagePaths.length > 1
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {visualAid.imagePaths.map((imagePath, index) => (
          <li
            key={imagePath}
            data-testid={`practical-visual-item-${index + 1}`}
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {isPrompt && visualAid.promptLabels?.[index] ? (
              <p
                data-testid={`practical-visual-label-${index + 1}`}
                className="border-b border-slate-200 bg-white px-4 py-2 text-center text-base font-black text-[#173957]"
              >
                ({visualAid.promptLabels[index]})
              </p>
            ) : null}
            <div className="relative min-h-52">
              <Image
                src={imagePath}
                alt={
                  isPrompt
                    ? visualAid.promptAltTexts?.[index] ??
                      `문제 이미지 ${visualAid.promptLabels?.[index] ?? index + 1}`
                    : `${visualAid.altText}${
                        visualAid.imagePaths.length > 1 ? ` ${index + 1}` : ""
                      }`
                }
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes={
                  visualAid.imagePaths.length > 1
                    ? "(max-width: 640px) 100vw, 50vw"
                    : "100vw"
                }
                className="object-contain p-3"
              />
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-4">
        {!isPrompt ? (
          <>
            <p className="font-extrabold text-[#173957]">{visualAid.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {visualAid.caption}
            </p>
          </>
        ) : null}
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
      </figcaption>
    </figure>
  );
}
