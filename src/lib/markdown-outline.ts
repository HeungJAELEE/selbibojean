export type MarkdownOutlineItem = {
  id: string;
  label: string;
};

export function markdownHeadingId(lineIndex: number) {
  return `textbook-section-${lineIndex}`;
}

export function stripMarkdownDecoration(value: string) {
  return value
    .replace(/\s*\{(?:toggle|color)="[^"]+"\}\s*$/g, "")
    .replace(/\\([*_[\]()>#])/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractMarkdownOutline(content: string, limit = 24): MarkdownOutlineItem[] {
  const headings = content
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line, lineIndex) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (!match) return null;
      const label = stripMarkdownDecoration(match[2]);
      return {
        id: markdownHeadingId(lineIndex),
        label,
        level: match[1].length,
      };
    })
    .filter((item): item is MarkdownOutlineItem & { level: number } => Boolean(item));

  const chapterHeadings = headings.filter((item) =>
    /^(?:part|chapter)\s*\d*/i.test(item.label),
  );
  const selected = chapterHeadings.length >= 2
    ? chapterHeadings
    : headings.filter((item) => item.level <= 2);

  return selected.slice(0, limit).map(({ id, label }) => ({ id, label }));
}
