export function splitExactJoinedMarkers(
  body: string,
  markers: readonly string[],
  subjectLabel: string,
) {
  let structured = body;

  for (const marker of markers) {
    let cursor = 0;
    let found = false;

    while (cursor < structured.length) {
      const index = structured.indexOf(marker, cursor);
      if (index < 0) break;
      found = true;

      const previousCharacter = structured[index - 1];
      const lineStart = structured.lastIndexOf("\n", index - 1) + 1;
      const isTableRow = structured
        .slice(lineStart, index)
        .trimStart()
        .startsWith("|");
      if (
        previousCharacter &&
        !/\s/.test(previousCharacter) &&
        !isTableRow
      ) {
        structured = `${structured.slice(0, index)}\n${structured.slice(index)}`;
        cursor = index + marker.length + 1;
      } else {
        cursor = index + marker.length;
      }
    }

    if (!found) {
      throw new Error(
        `${subjectLabel} 원문 구조 마커를 찾을 수 없습니다: ${marker}`,
      );
    }
  }

  return structured;
}

export function replaceExactRequired(
  body: string,
  marker: string,
  replacement: string,
  subjectLabel: string,
) {
  if (!body.includes(marker)) {
    throw new Error(
      `${subjectLabel} 원문 구조 마커를 찾을 수 없습니다: ${marker}`,
    );
  }

  return body.replace(marker, replacement);
}
