import type { WrittenSubjectCode } from "@/data/source/written-subject-notion-bodies";

export type WrittenSubjectSourceSection = {
  id: string;
  label: string;
  body: string;
};

export type WrittenSubjectSourceTopic = {
  id: string;
  label: string;
  body: string;
};

export type WrittenSubjectSourceOutline = {
  intro: string;
  topics: WrittenSubjectSourceTopic[];
};

const SUBJECT_INTRO_LABELS: Record<WrittenSubjectCode, string> = {
  1: "Part 1. 공유압 기초 법칙과 특성",
  2: "Part 1. 용접 일반 이론",
  3: "Part 1. 도면 해독 및 측정",
  4: "Part 1. 설비 진동 및 소음",
};

const PART_HEADING = /^(?:##|####)\s+\**Part\s+(\d+)\.\s*(.*)$/i;
const TOPIC_HEADING = /^#{3,4}\s+(?!\**Part\s+\d+\.)/i;

export function splitWrittenSubjectSourceBody(
  subjectCode: WrittenSubjectCode,
  body: string,
): WrittenSubjectSourceSection[] {
  const normalizedBody = body.replace(
    /([^#\n])(#{2,4}\s+Part\s+\d+\.)/gi,
    "$1\n$2",
  );
  const lines = normalizedBody.split("\n");
  const sections: WrittenSubjectSourceSection[] = [];
  let current: string[] = [];
  let currentLabel = SUBJECT_INTRO_LABELS[subjectCode];

  function pushCurrent() {
    const sectionBody = current.join("\n").trim();
    if (!sectionBody) return;
    sections.push({
      id: `source-part-${sections.length + 1}`,
      label: currentLabel,
      body: sectionBody,
    });
  }

  for (const line of lines) {
    const match = line.match(PART_HEADING);
    if (!match) {
      current.push(line);
      continue;
    }

    const partNumber = Number(match[1]);
    if (sections.length === 0 && partNumber === 1) {
      currentLabel = cleanPartLabel(line);
      current.push(line);
      continue;
    }

    pushCurrent();
    current = [line];
    currentLabel = cleanPartLabel(line);
  }

  pushCurrent();
  return sections;
}

function cleanPartLabel(heading: string) {
  return heading
    .replace(/^#{2,4}\s+/, "")
    .replaceAll("**", "")
    .trim();
}

export function splitWrittenSubjectSourceTopics(
  sectionId: string,
  body: string,
): WrittenSubjectSourceOutline {
  const normalizedBody = body.replace(
    /([^#\n])(#{3,4}\s+(?!\**Part\s+\d+\.))/gi,
    "$1\n$2",
  );
  const lines = normalizedBody.split("\n");
  const intro: string[] = [];
  const topics: WrittenSubjectSourceTopic[] = [];
  let current: string[] = [];
  let currentLabel = "";

  function pushCurrent() {
    const topicBody = current.join("\n").trim();
    if (!topicBody) return;
    topics.push({
      id: `${sectionId}-topic-${topics.length + 1}`,
      label: currentLabel,
      body: topicBody,
    });
  }

  for (const line of lines) {
    if (!TOPIC_HEADING.test(line)) {
      if (current.length > 0) current.push(line);
      else intro.push(line);
      continue;
    }

    pushCurrent();
    current = [line];
    currentLabel = cleanPartLabel(line);
  }

  pushCurrent();
  return {
    intro: intro.join("\n").trim(),
    topics,
  };
}
