import { createHash } from "node:crypto";

export type WeldingCbtTrackKey =
  | "welding-engineer"
  | "welding-industrial-engineer"
  | "welding-craftsman";

export type WeldingCbtSourceRecord = {
  trackKey: WeldingCbtTrackKey;
  pageTitle: string;
  examDate: string;
  year: number;
  sessionLabel: string;
  questionNumber: number;
  subjectOrdinal: number | null;
  subjectTitle: string;
  stem: string;
  choices: string[];
  correctIndex: number | null;
  sourceUrl: string;
  sourcePageSha256: string;
  sourceImageUrls: string[];
  contentFidelity: "exact" | "mismatch";
  answerEvidence:
    | "single_capture_uncontested"
    | "conflict"
    | "unknown";
  assetStatus: "not_required" | "rights_hold";
  auditResolution: "approved" | "hold";
  holdReasons: string[];
};

export type WeldingCbtTrackManifest = {
  key: WeldingCbtTrackKey;
  title: string;
  categoryUrl: string;
  examPathPrefix: string;
  includeSubjectTitles: RegExp[];
  includeAllSubjects?: boolean;
};

const MULTIPLE_ANSWER_PATTERN =
  /복수\s*정답|복수정답|확정\s*답안|확정답안|가답안|문제\s*오류|모두\s*정답/i;

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function decodeHtmlEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, token: string) => {
      if (token.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(token.slice(2), 16));
      }
      if (token.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(token.slice(1), 10));
      }
      return named[token.toLowerCase()] ?? entity;
    },
  );
}

function normalizeText(value: string) {
  return decodeHtmlEntities(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC");
}

function absoluteSourceUrl(sourceUrl: string, candidate: string) {
  try {
    return new URL(candidate, sourceUrl).toString();
  } catch {
    return candidate;
  }
}

function extractImageUrls(html: string, sourceUrl: string) {
  const urls = new Set<string>();
  for (const match of html.matchAll(
    /<img\b[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*>/gi,
  )) {
    urls.add(absoluteSourceUrl(sourceUrl, decodeHtmlEntities(match[1])));
  }
  return [...urls];
}

function htmlToText(html: string) {
  return normalizeText(
    html
      .replace(/<img\b[^>]*>/gi, " [이미지] ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function extractExamUrls(
  categoryHtml: string,
  categoryUrl: string,
  examPathPrefix: string,
) {
  const urls = new Set<string>();
  const escapedPrefix = examPathPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `href=["']([^"']*\\/exam\\/${escapedPrefix}\\d{8}[^"']*)["']`,
    "gi",
  );
  for (const match of categoryHtml.matchAll(pattern)) {
    const url = new URL(decodeHtmlEntities(match[1]), categoryUrl);
    url.hash = "";
    url.search = "";
    urls.add(url.toString());
  }
  return [...urls].sort();
}

type SubjectHeading = {
  index: number;
  ordinal: number | null;
  title: string;
};

function extractSubjectHeadings(html: string): SubjectHeading[] {
  const headings: SubjectHeading[] = [];
  for (const match of html.matchAll(
    /<div class=["'][^"']*exam-class-title[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/div>\s*<\/div>/gi,
  )) {
    const text = htmlToText(match[1]);
    const parsed = text.match(/^(\d+)과목\s*:\s*(.+)$/);
    headings.push({
      index: match.index ?? 0,
      ordinal: parsed ? Number(parsed[1]) : null,
      title: normalizeText(parsed?.[2] ?? text),
    });
  }
  return headings;
}

function subjectForIndex(headings: SubjectHeading[], index: number) {
  let selected: SubjectHeading | null = null;
  for (const heading of headings) {
    if (heading.index > index) break;
    selected = heading;
  }
  return selected;
}

function pageTitleFromHtml(html: string) {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return htmlToText(heading ?? title ?? "");
}

function examDateFromHtml(html: string, sourceUrl: string) {
  const canonicalDate =
    sourceUrl.match(/(\d{4})(\d{2})(\d{2})(?:\D|$)/)?.slice(1, 4) ?? [];
  if (canonicalDate.length === 3) {
    return canonicalDate.join("-");
  }
  const textDate = pageTitleFromHtml(html).match(
    /(19|20)\d{2}[-.]\d{2}[-.]\d{2}/,
  )?.[0];
  return textDate?.replace(/\./g, "-") ?? "";
}

function questionSlices(html: string) {
  const markers = [
    ...html.matchAll(
      /question-id=["']([^"']+)["'][^>]*question-num=["'](\d+)["']/gi,
    ),
  ];
  return markers.map((marker, index) => ({
    marker,
    start: marker.index ?? 0,
    end: markers[index + 1]?.index ?? html.length,
  }));
}

export function parseWeldingCbtExamPage(
  html: string,
  sourceUrl: string,
  manifest: WeldingCbtTrackManifest,
): WeldingCbtSourceRecord[] {
  const pageTitle = pageTitleFromHtml(html);
  const examDate = examDateFromHtml(html, sourceUrl);
  const year = Number(examDate.slice(0, 4));
  const pageSha256 = sha256(html);
  const headings = extractSubjectHeadings(html);

  return questionSlices(html)
    .map(({ marker, start, end }) => {
      const questionNumber = Number(marker[2]);
      const segment = html.slice(start, end);
      const promptArea = segment.split(
        /<div class=["']reply collapse["']/i,
        1,
      )[0];
      const subject = subjectForIndex(headings, start);
      const subjectTitle = subject?.title ?? "";
      const included =
        manifest.includeAllSubjects ||
        manifest.includeSubjectTitles.some((pattern) =>
          pattern.test(subjectTitle),
        );
      if (!included) return null;

      const stemHtml =
        promptArea.match(
          /<p class=["'][^"']*exam-title[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
        )?.[1] ?? "";
      const stem = htmlToText(
        stemHtml.replace(
          /<span class=["'][^"']*exam-number[^"']*["'][^>]*>[\s\S]*?<\/span>\s*\.?/i,
          "",
        ),
      );
      const choiceMatch = promptArea.match(
        /<ol\b([^>]*)\bcorrect=["'](\d+)["']([^>]*)>([\s\S]*?)<\/ol>/i,
      );
      const choicesHtml = choiceMatch?.[4] ?? "";
      const choiceItems = [
        ...choicesHtml.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi),
      ];
      const choices = choiceItems.map((choice) => htmlToText(choice[2]));
      const correctFromAttribute = choiceMatch
        ? Number(choiceMatch[2]) - 1
        : null;
      const correctFromClass = choiceItems.findIndex((choice) =>
        /\bcorrect\b/i.test(choice[1]),
      );
      const sourceImageUrls = extractImageUrls(promptArea, sourceUrl);
      const holdReasons: string[] = [];

      if (!stem || choices.length < 2) {
        holdReasons.push("prompt_or_choices_missing");
      }
      if (
        correctFromAttribute === null ||
        correctFromAttribute < 0 ||
        correctFromAttribute >= choices.length
      ) {
        holdReasons.push("answer_missing");
      }
      if (
        correctFromClass >= 0 &&
        correctFromAttribute !== correctFromClass
      ) {
        holdReasons.push("answer_conflict");
      }
      if (MULTIPLE_ANSWER_PATTERN.test(stem)) {
        holdReasons.push("multiple_or_corrected_answer");
      }
      if (sourceImageUrls.length > 0) {
        holdReasons.push("external_image_rights");
      }

      const answerConflict = holdReasons.some((reason) =>
        ["answer_conflict", "multiple_or_corrected_answer"].includes(reason),
      );
      const answerMissing = holdReasons.includes("answer_missing");

      return {
        trackKey: manifest.key,
        pageTitle,
        examDate,
        year,
        sessionLabel: `${examDate} 필기`,
        questionNumber,
        subjectOrdinal: subject?.ordinal ?? null,
        subjectTitle,
        stem,
        choices,
        correctIndex: correctFromAttribute,
        sourceUrl,
        sourcePageSha256: pageSha256,
        sourceImageUrls,
        contentFidelity:
          stem && choices.length >= 2 ? "exact" : "mismatch",
        answerEvidence: answerConflict
          ? "conflict"
          : answerMissing
            ? "unknown"
            : "single_capture_uncontested",
        assetStatus:
          sourceImageUrls.length > 0 ? "rights_hold" : "not_required",
        auditResolution: holdReasons.length > 0 ? "hold" : "approved",
        holdReasons,
      } satisfies WeldingCbtSourceRecord;
    })
    .filter((record): record is WeldingCbtSourceRecord => record !== null);
}
