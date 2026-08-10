import type { PracticalSourceRef } from "@/lib/domain/practical-types";

export function formatPracticalSourcePage(source: PracticalSourceRef) {
  if (source.sourceKind === "written_question_bank") {
    return "필기 기출·해설 근거";
  }

  return (
    [
      source.sourceKind === "official_reference" ? "공식 근거" : null,
      source.pdfPage ? `PDF p.${source.pdfPage}` : null,
      source.printedPage ? `인쇄 p.${source.printedPage}` : null,
      source.figureNumber,
    ]
      .filter((item): item is string => Boolean(item))
      .join(" · ") || "원문 위치 확인 중"
  );
}
