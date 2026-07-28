import { ConceptVisualAid } from "@/components/concept-visual-aid";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";
import { WrittenSpecialDiagram } from "@/components/written-special-diagram";
import { getWrittenVisualSelection } from "@/data/source/written-visual-coverage";
import type { LessonFamily } from "@/lib/content/lesson-families";
import type { Lesson } from "@/lib/domain/types";

export function WrittenLessonVisuals({
  lesson,
  family,
}: {
  lesson: Lesson;
  family: LessonFamily | undefined;
}) {
  const selection = getWrittenVisualSelection(lesson);
  const hasVisuals =
    Boolean(family) ||
    selection.diagramIds.length > 0 ||
    selection.visualAids.length > 0;

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
        실물 식별에는 검증된 NCS 사진을, 내부 구조와 작동 원리에는 자체 제작 도식을 사용했습니다.
      </p>

      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
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
        {family ? <ConceptVisualAid family={family} /> : null}
      </div>
    </section>
  );
}
