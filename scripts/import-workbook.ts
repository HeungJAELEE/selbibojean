import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import {
  assessLessonQuality,
  buildChoiceFeedback,
  buildEvidenceLesson,
  choiceFeedbackPasses,
  GENERIC_CONTENT_PATTERNS,
  lessonAnchorForQuestion,
} from "../src/lib/content/enrichment";
import { GOLDEN_LESSONS, GOLDEN_QUESTION_FEEDBACK } from "../src/data/source/golden-content";
import { findKoreanLanguageIssues } from "../src/lib/content/korean";
import { conceptGroups, mapConceptGroup, subjects } from "../src/lib/domain/catalog";
import type {
  Choice,
  ContentStatus,
  CoverageStatus,
  ErrorReason,
  GeneratedContent,
  Lesson,
  Question,
} from "../src/lib/domain/types";
import { stableHash } from "../src/lib/utils";

const EXPECTED = { originals: 2384, canonicalQuestions: 1396, mappings: 2384, backlog: 276 };
const DEFAULT_SOURCE =
  "C:/Users/JaeheungLee/Downloads/설비보전기사_전회차_중복제거_마스터_27차_웹앱설계.xlsx";
const OUTPUT = path.join(process.cwd(), "src", "data", "generated", "content.json");
const THEORY_SOURCE = path.join(process.cwd(), "src", "data", "source", "notion-theory.md");

type Row = Record<string, string | number | null>;

type CellValue = string | number | boolean | Date | null;

function valueToPrimitive(value: CellValue): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function rowsToRecords(sheetRows: CellValue[][]) {
  const headers = (sheetRows[0] ?? []).map((value) => String(valueToPrimitive(value) ?? "").trim());
  const rows: Row[] = [];
  sheetRows.slice(1).forEach((row) => {
    const record: Row = {};
    let hasValue = false;
    headers.forEach((header, column) => {
      if (!header) return;
      const value = valueToPrimitive(row[column] ?? null);
      record[header] = value;
      if (value !== null && value !== "") hasValue = true;
    });
    if (hasValue) rows.push(record);
  });
  return rows;
}

function asText(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function polishTechnicalKorean(value: string) {
  return value
    .replace(/잔류공기/g, "잔류 공기")
    .replace(/응답지연/g, "응답 지연")
    .replace(/발열장치/g, "발열 장치")
    .replace(/에어\s*빼기(?:를)?\s*한다/g, "공기를 제거해야 한다")
    .replace(/판단근거/g, "판단 근거")
    .replace(/적용조건/g, "적용 조건")
    .replace(/작동조건/g, "작동 조건");
}

function parseSubjectCode(value: string) {
  return Number(value.match(/제\s*([1-4])\s*과목/)?.[1] ?? value.match(/[1-4]/)?.[0] ?? 4);
}

function parseAnswerIndex(answer: string, choiceTexts: string[]) {
  const circled = ["①", "②", "③", "④"];
  const bySymbol = circled.findIndex((symbol) => answer.startsWith(symbol) || answer === symbol);
  if (bySymbol >= 0) return bySymbol;
  const numberMatch = answer.match(/^([1-4])/);
  if (numberMatch) return Number(numberMatch[1]) - 1;
  const normalized = answer.replace(/^[①②③④1-4][.)]?\s*/, "").trim();
  const byText = choiceTexts.findIndex(
    (choice) => choice === normalized || choice.includes(normalized) || normalized.includes(choice),
  );
  return byText;
}

function classifyErrorReason(stem: string, explanation: string, reviewStatus: string): ErrorReason {
  const text = `${stem} ${explanation}`;
  if (/옳지 않은|아닌 것은|틀린 것은|잘못된/.test(stem)) return "부정형 문장";
  if (/단위|mm|cm|m\/s|Pa|MPa|Hz|dB|℃|°C|rpm|N·m|kW/i.test(text)) return "단위 오류";
  if (/[=×÷√]|공식|계산|산출/.test(text)) return "공식 적용";
  if (/과거|구기준|개정|현행|폐지/.test(`${text} ${reviewStatus}`)) return "과거 기준";
  if (/조건|경우|이상|이하|초과|미만/.test(text)) return "조건 누락";
  if (/용어|정의|명칭|의미/.test(text)) return "용어 혼동";
  return "개념 혼동";
}

function publishDecision(row: Row, correctIndex: number, choices: string[]) {
  const status = asText(row["검증상태"]);
  const text = `${asText(row["문제"])} ${asText(row["근거"])} ${status}`;
  const highRisk = /법령|산업안전|안전보건|KS\b|ISO\b|규격|제조사|이미지|사진|과거 기준|현행 확인|미확인|충돌|오류|복원 필요/i.test(text);
  const complete = correctIndex >= 0 && choices.length === 4 && choices.every(Boolean) && asText(row["근거"]).length >= 15;
  const statusConfirmed = status === "확정" || status.startsWith("확정 ");
  return { publishable: complete && statusConfirmed && !highRisk, complete, highRisk, statusConfirmed };
}

type TheorySection = {
  title: string;
  level: number;
  start: number;
  end: number;
  body: string;
  normalizedTitle: string;
  normalizedBody: string;
};

function normalizeTheoryText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/^[★⭐📷🔧⚠️📌\s]+/g, "")
    .replace(/^(최근\s*기출|기출\s*예상|NCS\s*(실무\s*)?(보강|추가)?|웹\s*실사\s*보강|원문\s*실사)\s*[｜|·:-]\s*/i, "")
    .replace(/^제?\d+(?:\.\d+)*[장절편과목)]?\s*/g, "")
    .replace(/^\d+\)\s*/g, "")
    .replace(/[^가-힣a-z0-9]+/gi, "")
    .toLowerCase();
}

function cleanTheoryMarkdown(value: string) {
  return value
    .replace(/<mention-page[^>]*\/>/g, "")
    .replace(/<image[^>]*\/>/g, "[관련 도해는 원본 이론서에서 확인]")
    .replace(/<table[^>]*>/g, "")
    .replace(/<\/table>/g, "")
    .replace(/<tr[^>]*>/g, "")
    .replace(/<\/tr>/g, "\n")
    .replace(/<td[^>]*>/g, " · ")
    .replace(/<\/td>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*+/g, "")
    .replace(/(?:대조\s*)?원문\s*:\s*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\|?\s*:?-{3,}.*$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseTheorySections(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const mainStart = lines.findIndex((line) => /^# 제1편\s/.test(line));
  const headings = lines
    .map((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      return match && index >= Math.max(mainStart, 0)
        ? { index, level: match[1].length, title: cleanTheoryMarkdown(match[2]) }
        : null;
    })
    .filter((item): item is { index: number; level: number; title: string } => Boolean(item));

  return headings.map<TheorySection>((heading, index) => {
    const next = headings.slice(index + 1).find((candidate) => candidate.level <= heading.level);
    const end = next?.index ?? lines.length;
    const body = cleanTheoryMarkdown(lines.slice(heading.index + 1, end).join("\n"));
    return {
      title: heading.title,
      level: heading.level,
      start: heading.index,
      end,
      body,
      normalizedTitle: normalizeTheoryText(heading.title),
      normalizedBody: normalizeTheoryText(body.slice(0, 12000)),
    };
  });
}

function theoryMatchScore(concept: string, groupTitle: string, section: TheorySection) {
  const conceptKey = normalizeTheoryText(concept);
  const groupKey = normalizeTheoryText(groupTitle);
  if (!conceptKey || section.body.length < 80) return 0;
  let score = section.level * 3;
  if (section.normalizedTitle === conceptKey) score += 1200;
  else if (conceptKey.length >= 3 && section.normalizedTitle.includes(conceptKey)) score += 950 + conceptKey.length;
  else if (section.normalizedTitle.length >= 3 && conceptKey.includes(section.normalizedTitle)) score += 720;
  const tokens = concept
    .replace(/[()·/,:-]/g, " ")
    .split(/\s+/)
    .map(normalizeTheoryText)
    .filter((token) => token.length >= 2);
  const overlap = tokens.filter((token) => section.normalizedTitle.includes(token)).length;
  if (tokens.length && overlap) score += Math.round((overlap / tokens.length) * 500);
  if (conceptKey.length >= 4 && section.normalizedBody.includes(conceptKey)) score += 560;
  if (groupKey.length >= 3 && section.normalizedTitle.includes(groupKey)) score += 180;
  return score;
}

function findTheorySection(concept: string, groupTitle: string, sections: TheorySection[]) {
  const ranked = sections
    .map((section) => ({ section, score: theoryMatchScore(concept, groupTitle, section) }))
    .filter((item) => item.score >= 560)
    .sort((a, b) => b.score - a.score || a.section.body.length - b.section.body.length);
  return ranked[0] ?? null;
}

async function main() {
  const sourcePath = path.resolve(process.argv[2] || process.env.SOURCE_WORKBOOK_PATH || DEFAULT_SOURCE);
  const sourceBuffer = await readFile(sourcePath);
  const theoryMarkdown = await readFile(THEORY_SOURCE, "utf8");
  const theorySections = parseTheorySections(theoryMarkdown);
  const sourceSha256 = createHash("sha256").update(sourceBuffer).digest("hex");
  const [canonicalSheet, originalSheet, mappingSheet, backlogSheet] = await Promise.all([
    readSheet(sourceBuffer, "고유문제_통합_26차"),
    readSheet(sourceBuffer, "원문문항_통합_26차"),
    readSheet(sourceBuffer, "중복매핑_통합_26차"),
    readSheet(sourceBuffer, "부분완료_최종잔여_26차"),
  ]);
  const canonicalRows = rowsToRecords(canonicalSheet as CellValue[][]);
  const originalRows = rowsToRecords(originalSheet as CellValue[][]);
  const mappingRows = rowsToRecords(mappingSheet as CellValue[][]);
  const backlogRows = rowsToRecords(backlogSheet as CellValue[][]);
  const originalById = new Map(originalRows.map((row) => [asText(row["원문ID"]), row]));
  const mappingByOriginalId = new Map(mappingRows.map((row) => [asText(row["원문ID"]), row]));
  const originalIdsByCanonical = new Map<string, string[]>();
  mappingRows.forEach((row) => {
    const canonicalId = asText(row["고유ID"]);
    const originalId = asText(row["원문ID"]);
    originalIdsByCanonical.set(canonicalId, [...(originalIdsByCanonical.get(canonicalId) ?? []), originalId]);
  });

  let numberOnlyAnswers = 0;
  const warnings: string[] = [];
  const questions: Question[] = canonicalRows.map((row, rowIndex) => {
    const sourceId = asText(row["고유ID"]) || `U-${String(rowIndex + 1).padStart(3, "0")}`;
    const concept = asText(row["개념군"]) || "미분류 개념";
    const subjectCode = parseSubjectCode(asText(row["현행과목"]));
    const stem = polishTechnicalKorean(asText(row["문제"]));
    const explanation = polishTechnicalKorean(asText(row["근거"]));
    const answer = polishTechnicalKorean(asText(row["정답"]));
    if (/^[①②③④1-4]$/.test(answer)) numberOnlyAnswers += 1;
    const choiceTexts = [1, 2, 3, 4].map((index) =>
      polishTechnicalKorean(asText(row[`보기${["①", "②", "③", "④"][index - 1]}`])),
    );
    const correctIndex = parseAnswerIndex(answer, choiceTexts);
    const decision = publishDecision(row, correctIndex, choiceTexts);
    const { group, confidence, score, margin } = mapConceptGroup(subjectCode, concept, stem, explanation, choiceTexts.join(" "));
    const conceptId = `concept-${stableHash(`${subjectCode}:${concept}`)}`;
    const lessonId = `lesson-${stableHash(`${subjectCode}:${concept}`)}`;
    const originalIds = originalIdsByCanonical.get(sourceId) ?? [];
    const sourceUrls = originalIds
      .map((id) => asText(originalById.get(id)?.["출처URL"]))
      .filter(Boolean);
    if (correctIndex < 0) warnings.push(`${sourceId}: 정답을 보기와 연결하지 못했습니다.`);
    if (confidence === "fallback" || confidence === "weak") {
      warnings.push(`${sourceId}: 세부항목군 분류 검토 필요(${confidence}, score=${score}, margin=${margin}).`);
    }

    const errorReason = classifyErrorReason(stem, explanation, asText(row["검증상태"]));
    const correctText = correctIndex >= 0 ? choiceTexts[correctIndex] : answer;
    const groupTitle = group.title;
    const goldenFeedback = GOLDEN_QUESTION_FEEDBACK[sourceId];
    const choices: Choice[] = choiceTexts.map((text, index) => ({
      id: `${sourceId}-c${index + 1}`,
      order: index + 1,
      text,
      feedback:
        goldenFeedback?.[index + 1] ??
        buildChoiceFeedback({
          stem,
          choiceText: text,
          correctText,
          correct: index === correctIndex,
          explanation,
          concept,
          groupId: group.id,
          groupTitle,
        }),
    }));
    const choiceFeedbackValid = choices.every((choice, index) =>
      choiceFeedbackPasses(choice.feedback, index === correctIndex),
    );
    const mappingReliable = confidence === "override" || confidence === "keyword";
    const contentStatus: ContentStatus = decision.publishable && mappingReliable
      ? "published"
      : decision.complete
        ? "in_review"
        : "draft";
    const lessonAnchor = decision.highRisk
      ? "source"
      : lessonAnchorForQuestion({ stem, errorReason, conceptGroupId: group.id });

    return {
      id: sourceId,
      canonicalNumber: rowIndex + 1,
      subjectId: `subject-${subjectCode}`,
      conceptGroupId: group.id,
      conceptId,
      lessonId,
      lessonAnchor,
      stem,
      choices,
      correctChoiceId: correctIndex >= 0 ? choices[correctIndex].id : "",
      answerText: correctText,
      explanation,
      errorReason,
      sourceLabel: sourceUrls[0] || asText(row["출제이력"]) || "27차 엑셀 정규화 자료",
      reviewStatus: asText(row["검증상태"]),
      contentStatus,
      validation: {
        answer: correctIndex >= 0,
        explanation: explanation.length >= 15,
        choiceFeedback: choiceFeedbackValid,
        theoryLink: Boolean(lessonId),
        contentQuality: choiceFeedbackValid,
      },
    };
  });

  const questionsByConcept = new Map<string, Question[]>();
  questions.forEach((question) =>
    questionsByConcept.set(question.conceptId, [...(questionsByConcept.get(question.conceptId) ?? []), question]),
  );
  const conceptRowById = new Map<string, Row>();
  canonicalRows.forEach((row) => {
    const subjectCode = parseSubjectCode(asText(row["현행과목"]));
    conceptRowById.set(`concept-${stableHash(`${subjectCode}:${asText(row["개념군"]) || "미분류 개념"}`)}`, row);
  });

  const lessons: Lesson[] = [...questionsByConcept.entries()].map(([conceptId, linkedQuestions]) => {
    const first = linkedQuestions[0];
    const row = conceptRowById.get(conceptId)!;
    const concept = asText(row["개념군"]) || "미분류 개념";
    const explanation = linkedQuestions
      .map((question) => question.explanation)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] ?? "";
    const coverageStatus: CoverageStatus = explanation.length >= 30 ? "covered" : explanation ? "partial" : "missing";
    const hasPublished = linkedQuestions.some((question) => question.contentStatus === "published");
    const groupTitle = conceptGroups.find((group) => group.id === first.conceptGroupId)?.title ?? "";
    const theoryMatch = findTheorySection(concept, groupTitle, theorySections);
    const theoryEvidence = theoryMatch
      ? { title: theoryMatch.section.title, body: theoryMatch.section.body, score: theoryMatch.score }
      : null;
    const golden = GOLDEN_LESSONS[concept];
    const sourceNeeded = !golden && !theoryEvidence && !hasPublished;
    const generatedLesson = golden
      ? {
          summary: [...golden.summary],
          blocks: golden.blocks,
          quality: assessLessonQuality(golden.blocks, [...golden.summary], "core", true),
        }
      : buildEvidenceLesson({
          concept,
          groupId: first.conceptGroupId,
          groupTitle,
          questions: linkedQuestions,
          theoryEvidence,
          sourceNeeded,
        });
    const baseAliases = linkedQuestions
      .map((question) => question.stem.match(/[가-힣A-Za-z0-9·-]{2,18}/)?.[0])
      .filter((value): value is string => Boolean(value));
    const terminologyAliases = /오일휩|오일휠/.test(concept) ? ["오일월", "오일휠", "oil whirl", "oil whip"] : [];
    const contentStatus: ContentStatus = hasPublished && generatedLesson.quality.passed ? "published" : "in_review";

    return {
      id: first.lessonId,
      subjectId: first.subjectId,
      conceptGroupId: first.conceptGroupId,
      conceptId,
      title: concept,
      aliases: [...new Set([...baseAliases, ...terminologyAliases])].slice(0, 8),
      summary: generatedLesson.summary,
      blocks: generatedLesson.blocks,
      relatedQuestionIds: linkedQuestions.map((question) => question.id),
      coverageStatus: golden || theoryEvidence ? "covered" : coverageStatus,
      contentStatus,
      sourceNeeded,
      reviewedAt: contentStatus === "published" ? "2026-07-23T00:00:00.000Z" : null,
      quality: generatedLesson.quality,
    };
  });

  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  questions.forEach((question) => {
    const lesson = lessonsById.get(question.lessonId);
    const anchorExists = Boolean(lesson?.blocks.some((block) => block.id === question.lessonAnchor));
    question.validation.theoryLink = anchorExists;
    question.validation.contentQuality = question.validation.choiceFeedback && Boolean(lesson?.quality.passed);
    if (question.contentStatus === "published" && (!anchorExists || !question.validation.contentQuality)) {
      question.contentStatus = "in_review";
    }
  });

  const rows = {
    originals: originalRows.length,
    canonicalQuestions: canonicalRows.length,
    mappings: mappingRows.length,
    backlog: backlogRows.length,
  };
  const exactMatch = Object.entries(EXPECTED).every(([key, value]) => rows[key as keyof typeof rows] === value);
  if (!exactMatch) warnings.unshift(`기준 수량과 불일치: ${JSON.stringify(rows)}`);
  const coverage = lessons.reduce<Record<CoverageStatus, number>>(
    (result, lesson) => ({ ...result, [lesson.coverageStatus]: result[lesson.coverageStatus] + 1 }),
    { covered: 0, partial: 0, missing: 0, blocked: 0 },
  );
  const feedbackResults = questions.flatMap((question) =>
    question.choices.map((choice) => choiceFeedbackPasses(choice.feedback, choice.id === question.correctChoiceId)),
  );
  const feedbackText = questions
    .flatMap((question) => question.choices)
    .map((choice) => Object.values(choice.feedback).filter(Boolean).join(" "))
    .join("\n");
  const genericPhraseMatches =
    lessons.reduce((total, lesson) => total + lesson.quality.genericPhraseMatches.length, 0) +
    GENERIC_CONTENT_PATTERNS.filter((pattern) => feedbackText.includes(pattern)).length;
  const languageIssueMatches =
    lessons.reduce((total, lesson) => total + lesson.quality.languageIssueMatches.length, 0) +
    findKoreanLanguageIssues(feedbackText).length;
  const groupQuality = conceptGroups.map((group) => {
    const groupLessons = lessons.filter((lesson) => lesson.conceptGroupId === group.id);
    const groupQuestions = questions.filter((question) => question.conceptGroupId === group.id);
    const groupChoices = groupQuestions.flatMap((question) =>
      question.choices.map((choice) => ({
        choice,
        correct: choice.id === question.correctChoiceId,
      })),
    );
    return {
      groupId: group.id,
      title: group.title,
      lessonCount: groupLessons.length,
      lessonPassed: groupLessons.filter((lesson) => lesson.quality.passed).length,
      publishedLessonCount: groupLessons.filter((lesson) => lesson.contentStatus === "published").length,
      publishedLessonPassed: groupLessons.filter((lesson) => lesson.contentStatus === "published" && lesson.quality.passed).length,
      questionCount: groupQuestions.length,
      publishedQuestionCount: groupQuestions.filter((question) => question.contentStatus === "published").length,
      choiceFeedbackCount: groupChoices.length,
      choiceFeedbackPassed: groupChoices.filter(({ choice, correct }) => choiceFeedbackPasses(choice.feedback, correct)).length,
    };
  });
  const generated: GeneratedContent = {
    formatVersion: 2,
    subjects,
    conceptGroups,
    questions,
    lessons,
    variants: originalRows.map((row) => {
      const externalId = asText(row["원문ID"]);
      const mapping = mappingByOriginalId.get(externalId);
      return {
        externalId,
        canonicalId: asText(mapping?.["고유ID"]),
        relationship: asText(mapping?.["관계"]),
        year: typeof row["연도"] === "number" ? row["연도"] : Number(row["연도"]) || null,
        sessionLabel: asText(row["회차"]),
        questionNumber: typeof row["문항"] === "number" ? row["문항"] : Number(row["문항"]) || null,
        conceptAlias: asText(row["개념군"]),
        subjectCode: parseSubjectCode(asText(row["현행과목"])),
        stem: asText(row["문제"]),
        choices: ["①", "②", "③", "④"].map((label) => asText(row[`보기${label}`])),
        answer: asText(row["정답"]),
        explanation: asText(row["근거"]),
        sourceUrl: asText(row["출처URL"]),
        reviewStatus: asText(row["검증상태"]),
        verificationNote: asText(mapping?.["판정 메모"]),
      };
    }),
    backlog: backlogRows,
    report: {
      generatedAt: new Date().toISOString(),
      sourceFile: path.basename(sourcePath),
      sourceSha256,
      rows,
      expected: EXPECTED,
      exactMatch,
      uniqueConcepts: new Set(canonicalRows.map((row) => asText(row["개념군"]))).size,
      canonicalConcepts: lessons.length,
      numberOnlyAnswers,
      reviewStatusCount: new Set(canonicalRows.map((row) => asText(row["검증상태"]))).size,
      publishedQuestionCount: questions.filter((question) => question.contentStatus === "published").length,
      reviewQuestionCount: questions.filter((question) => question.contentStatus === "in_review").length,
      blockedQuestionCount: questions.filter((question) => question.contentStatus === "draft").length,
      coverage,
      quality: {
        lessonPassed: lessons.filter((lesson) => lesson.quality.passed).length,
        lessonFailed: lessons.filter((lesson) => !lesson.quality.passed).length,
        choiceFeedbackPassed: feedbackResults.filter(Boolean).length,
        choiceFeedbackFailed: feedbackResults.filter((passed) => !passed).length,
        genericPhraseMatches,
        languageIssueMatches,
      },
      groupQuality,
      warnings: warnings.slice(0, 500),
    },
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(generated));
  console.log(JSON.stringify(generated.report, null, 2));
  if (!exactMatch) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
