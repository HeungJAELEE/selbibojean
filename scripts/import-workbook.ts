import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
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

function feedbackForChoice({
  text,
  correct,
  explanation,
  trap,
}: {
  text: string;
  correct: boolean;
  explanation: string;
  trap: string;
}) {
  const rule = explanation || "정답의 정의와 적용 조건을 다시 확인해야 합니다.";
  if (correct) {
    return {
      rationale: `이 보기는 정답의 판단 기준과 일치합니다. ${rule}`,
      plausibleReason: "문제에서 묻는 핵심 정의와 조건을 직접 충족합니다.",
      incorrectPoint: null,
      keyRule: rule,
      differenceFromCorrect: null,
    };
  }
  return {
    rationale: `‘${text}’은(는) 정답의 핵심 조건과 일치하지 않습니다.`,
    plausibleReason: trap || "관련 용어가 포함되어 있어 정답처럼 보일 수 있습니다.",
    incorrectPoint: "정의·조건·적용 범위 중 적어도 하나가 문제의 판단 기준과 다릅니다.",
    keyRule: rule,
    differenceFromCorrect: `정답은 ‘${rule}’을 기준으로 판단하지만, 이 보기는 그 기준을 충족하지 않습니다.`,
  };
}

function publishDecision(row: Row, correctIndex: number, choices: string[]) {
  const status = asText(row["검증상태"]);
  const text = `${asText(row["문제"])} ${asText(row["근거"])} ${status}`;
  const highRisk = /법령|산업안전|안전보건|KS\b|ISO\b|규격|제조사|이미지|사진|과거 기준|현행 확인|미확인|충돌|오류|복원 필요/i.test(text);
  const complete = correctIndex >= 0 && choices.length === 4 && choices.every(Boolean) && asText(row["근거"]).length >= 15;
  const statusConfirmed = status === "확정" || status.startsWith("확정 ");
  return { publishable: complete && statusConfirmed && !highRisk, complete, highRisk, statusConfirmed };
}

function splitSummary(explanation: string, concept: string) {
  const sentences = explanation
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return [
    sentences[0] || `${concept}의 핵심 정의를 먼저 확인합니다.`,
    sentences[1] || "공식·단위·적용 조건을 함께 구분합니다.",
    sentences[2] || "보기의 절대 표현과 유사 용어를 오답 함정으로 점검합니다.",
  ];
}

async function main() {
  const sourcePath = path.resolve(process.argv[2] || process.env.SOURCE_WORKBOOK_PATH || DEFAULT_SOURCE);
  const sourceBuffer = await readFile(sourcePath);
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
    const stem = asText(row["문제"]);
    const explanation = asText(row["근거"]);
    const trap = asText(row["오답함정"]);
    const answer = asText(row["정답"]);
    if (/^[①②③④1-4]$/.test(answer)) numberOnlyAnswers += 1;
    const choiceTexts = [1, 2, 3, 4].map((index) => asText(row[`보기${["①", "②", "③", "④"][index - 1]}`]));
    const correctIndex = parseAnswerIndex(answer, choiceTexts);
    const decision = publishDecision(row, correctIndex, choiceTexts);
    const { group, confidence } = mapConceptGroup(subjectCode, concept, stem, explanation);
    const conceptId = `concept-${stableHash(`${subjectCode}:${concept}`)}`;
    const lessonId = `lesson-${stableHash(`${subjectCode}:${concept}`)}`;
    const originalIds = originalIdsByCanonical.get(sourceId) ?? [];
    const sourceUrls = originalIds
      .map((id) => asText(originalById.get(id)?.["출처URL"]))
      .filter(Boolean);
    if (correctIndex < 0) warnings.push(`${sourceId}: 정답을 보기와 연결하지 못했습니다.`);
    if (confidence === "fallback") warnings.push(`${sourceId}: 세부항목군을 키워드로 확정하지 못했습니다.`);

    const choices: Choice[] = choiceTexts.map((text, index) => ({
      id: `${sourceId}-c${index + 1}`,
      order: index + 1,
      text,
      feedback: feedbackForChoice({ text, correct: index === correctIndex, explanation, trap }),
    }));
    const contentStatus: ContentStatus = decision.publishable ? "published" : decision.complete ? "in_review" : "draft";

    return {
      id: sourceId,
      canonicalNumber: rowIndex + 1,
      subjectId: `subject-${subjectCode}`,
      conceptGroupId: group.id,
      conceptId,
      lessonId,
      lessonAnchor: decision.highRisk ? "source" : /[=×÷√]|공식|계산/.test(explanation) ? "formula" : "principle",
      stem,
      choices,
      correctChoiceId: correctIndex >= 0 ? choices[correctIndex].id : "",
      answerText: correctIndex >= 0 ? choiceTexts[correctIndex] : answer,
      explanation,
      errorReason: classifyErrorReason(stem, explanation, asText(row["검증상태"])),
      sourceLabel: sourceUrls[0] || asText(row["출제이력"]) || "27차 엑셀 정규화 자료",
      reviewStatus: asText(row["검증상태"]),
      contentStatus,
      validation: {
        answer: correctIndex >= 0,
        explanation: explanation.length >= 15,
        choiceFeedback: choices.every((choice) => choice.feedback.keyRule.length >= 15),
        theoryLink: Boolean(lessonId),
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
    const explanation = linkedQuestions.map((question) => question.explanation).filter(Boolean).sort((a, b) => b.length - a.length)[0] ?? "";
    const trap = asText(row["오답함정"]);
    const coverageStatus: CoverageStatus = explanation.length >= 30 ? "covered" : explanation ? "partial" : "missing";
    const hasPublished = linkedQuestions.some((question) => question.contentStatus === "published");
    const sourceNeeded = !hasPublished;
    const summary = splitSummary(explanation, concept);

    return {
      id: first.lessonId,
      subjectId: first.subjectId,
      conceptGroupId: first.conceptGroupId,
      conceptId,
      title: concept,
      aliases: [...new Set(linkedQuestions.map((question) => question.stem.match(/[가-힣A-Za-z0-9·-]{2,18}/)?.[0]).filter((v): v is string => Boolean(v)))].slice(0, 5),
      summary,
      blocks: [
        { id: "summary", kind: "summary", title: "핵심 3줄", body: summary.map((line, index) => `${index + 1}. ${line}`).join("\n"), order: 1 },
        { id: "definition", kind: "definition", title: "개념의 범위", body: `${concept}과 관련된 정의, 작동 원리, 적용 조건을 문제의 표현과 분리해 이해합니다.`, order: 2 },
        { id: "principle", kind: "principle", title: "작동 원리와 판단 기준", body: explanation || "정확한 근거 출처 확인 후 보강할 블록입니다.", order: 3 },
        { id: "formula", kind: "formula", title: "공식·단위·조건", body: /[=×÷√]|공식|단위|계산/.test(explanation) ? explanation : "공식이 직접 필요한 개념인지 검수 단계에서 확인합니다.", order: 4 },
        { id: "exam-point", kind: "exam_point", title: "시험 포인트", body: `관련 대표문제 ${linkedQuestions.length}개에서 반복되는 판단 기준을 먼저 찾습니다.`, order: 5 },
        { id: "trap", kind: "trap", title: "오답 함정", body: trap || "유사 용어, 절대 표현, 조건 누락을 확인합니다.", order: 6 },
        { id: "source", kind: "source", title: "출처·검토 상태", body: sourceNeeded ? "출처 추가 검수가 필요하여 자동 발행하지 않습니다." : `27차 정규화 자료의 ‘확정’ 문제 ${linkedQuestions.filter((question) => question.contentStatus === "published").length}개를 근거로 구성했습니다.`, order: 7 },
      ],
      relatedQuestionIds: linkedQuestions.map((question) => question.id),
      coverageStatus,
      contentStatus: hasPublished ? "published" : "in_review",
      sourceNeeded,
      reviewedAt: hasPublished ? new Date().toISOString() : null,
    };
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
  const generated: GeneratedContent = {
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
