import Image from "next/image";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";
import { WrittenSpecialDiagram } from "@/components/written-special-diagram";
import {
  getWrittenVisualSelection,
  type WrittenExternalVisual,
} from "@/data/source/written-visual-coverage";
import type { Lesson } from "@/lib/domain/types";

export function WrittenLessonVisuals({
  lesson,
}: {
  lesson: Lesson;
}) {
  const selection = getWrittenVisualSelection(lesson);
  const hasVisuals =
    selection.diagramIds.length > 0 ||
    selection.visualAids.length > 0 ||
    selection.externalVisuals.length > 0;

  if (!hasVisuals) return null;

  return (
    <section
      aria-labelledby="written-lesson-visuals-title"
      className="mt-7 scroll-mt-28"
      data-testid="written-lesson-visuals"
    >
      <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">
        Visual learning
      </p>
      <h2
        id="written-lesson-visuals-title"
        className="mt-1 text-xl font-extrabold text-[#173957]"
      >
        사진·그림으로 구조 먼저 이해하기
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        검증된 NCS 사진과 외부 공개 자료를 우선 사용하고, 적합한 자료가 없을 때만
        자체 제작 도식을 사용합니다.
      </p>

      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
        {selection.externalVisuals.map((visual) => (
          <ExternalWrittenVisualFigure key={visual.id} visual={visual} />
        ))}
        {selection.diagramIds.map((diagramId) => (
          <WrittenSpecialDiagram key={diagramId} diagramId={diagramId} />
        ))}
        {selection.visualAids.map((visualAid) => (
          <PracticalVisualAidFigure
            key={visualAid.id}
            visualAid={visualAid}
            mode="theory"
          />
        ))}
      </div>
    </section>
  );
}

function ExternalWrittenVisualFigure({
  visual,
}: {
  visual: WrittenExternalVisual;
}) {
  return (
    <figure
      id={visual.anchorId}
      data-testid={`written-external-visual-${visual.id}`}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="relative min-h-56 bg-slate-50 sm:min-h-72">
        <Image
          src={visual.imagePath}
          alt={visual.altText}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-contain p-3"
        />
      </div>
      <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-4">
        <p className="font-extrabold text-[#173957]">{visual.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{visual.caption}</p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          출처:{" "}
          <a
            href={visual.sourcePageUrl}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#16697a] underline underline-offset-2"
          >
            Wikimedia Commons 원본 정보
          </a>
          {" · "}
          <a
            href={visual.originalFileUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            원본 파일
          </a>
          {" · "}
          {visual.author} ·{" "}
          <a
            href={visual.licenseUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {visual.licenseLabel}
          </a>
        </p>
      </figcaption>
    </figure>
  );
}
