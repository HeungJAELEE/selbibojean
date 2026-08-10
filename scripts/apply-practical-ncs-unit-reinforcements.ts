import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PRACTICAL_NCS_UNIT_PROMOTIONS } from "../src/data/source/practical-ncs-unit-reinforcements";
import { PRACTICAL_SUPPLEMENTAL_PREDICTED_QUESTIONS } from "../src/data/source/practical-supplemental-predicted-questions";
import { PRACTICAL_SUPPLEMENTAL_CONCEPTS } from "../src/data/source/practical-supplemental-concepts";
import { PRACTICAL_WRITTEN_SOURCE_SWEEP_VERSION } from "../src/data/source/practical-written-source-sweep";
import { isLearnerVisiblePracticalQuestion } from "../src/lib/content/learner-visibility";
import { isPublishablePracticalQuestion } from "../src/lib/domain/practical";
import type {
  PracticalConcept,
  PracticalContent,
  PracticalImportReport,
  PracticalNcsCoverage,
  PracticalQuestion,
  PracticalStudyCategory,
} from "../src/lib/domain/practical-types";

const root = process.cwd();
const contentPath = path.join(
  root,
  "src",
  "data",
  "generated",
  "practical-content.json",
);
const reportPath = path.join(
  root,
  "src",
  "data",
  "generated",
  "practical-import-report.json",
);
const generatedAt = `${PRACTICAL_WRITTEN_SOURCE_SWEEP_VERSION}T00:00:00.000Z`;
const warning =
  "NCS 11종의 세부학습단위 대조에서 직접 연결이 비어 있던 27개 단원에 자체 보강 이론과 예상문제를 1개씩 추가했다.";

const args = new Set(process.argv.slice(2));
const writeMode = args.has("--write");
const checkMode = args.has("--check");

if (writeMode === checkMode) {
  throw new Error("--write 또는 --check 중 하나만 지정해야 합니다.");
}

function sorted(values: Iterable<string>) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function duplicateIds(items: Array<{ id: string }>) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }
  return sorted(duplicates);
}

function buildStudyCategories(
  definitions: PracticalStudyCategory[],
  questions: PracticalQuestion[],
  concepts: PracticalConcept[],
): PracticalStudyCategory[] {
  return definitions.map((category) => {
    const questionIds = questions
      .filter(
        (question) => question.primaryStudyCategoryId === category.id,
      )
      .map((question) => question.id);
    const questionIdSet = new Set(questionIds);
    const conceptIds = concepts
      .filter((concept) =>
        [
          ...concept.relatedPastQuestionIds,
          ...concept.relatedPredictedQuestionIds,
        ].some((questionId) => questionIdSet.has(questionId)),
      )
      .map((concept) => concept.id);
    return { ...category, questionIds, conceptIds };
  });
}

function buildNcsCoverage(
  previous: PracticalNcsCoverage,
  concepts: PracticalConcept[],
): PracticalNcsCoverage {
  const documents = previous.documents.map((document) => {
    const linkedConcepts = concepts.filter((concept) =>
      concept.ncsSources.some(
        (source) => source.ncsCode === document.ncsCode,
      ),
    );
    const conceptIds = sorted(linkedConcepts.map((concept) => concept.id));
    const sourceReferenceCount = linkedConcepts.reduce(
      (count, concept) =>
        count +
        concept.ncsSources.filter(
          (source) => source.ncsCode === document.ncsCode,
        ).length,
      0,
    );
    return {
      ...document,
      conceptIds,
      sourceReferenceCount,
      status:
        conceptIds.length > 0 && document.heldItems.length > 0
          ? ("covered_with_holds" as const)
          : conceptIds.length > 0
            ? ("covered" as const)
            : ("held" as const),
    };
  });
  const uniqueLessonIds = new Set(
    documents.flatMap((document) => document.conceptIds),
  );
  return {
    summary: {
      totalDocuments: documents.length,
      accountedDocuments: documents.filter(
        (document) =>
          document.conceptIds.length > 0 || document.heldItems.length > 0,
      ).length,
      uniqueLessonCount: uniqueLessonIds.size,
      sourceReferenceCount: documents.reduce(
        (count, document) => count + document.sourceReferenceCount,
        0,
      ),
      heldItems: documents.reduce(
        (count, document) => count + document.heldItems.length,
        0,
      ),
    },
    documents,
  };
}

const inputText = await readFile(contentPath, "utf8");
const input = JSON.parse(inputText) as PracticalContent;
const promotedConceptIds = new Set(
  PRACTICAL_NCS_UNIT_PROMOTIONS.map((item) => item.conceptId),
);
const promotedQuestionIds = new Set(
  PRACTICAL_NCS_UNIT_PROMOTIONS.map((item) => item.questionId),
);
const reinforcementConcepts = PRACTICAL_SUPPLEMENTAL_CONCEPTS.filter(
  (concept) => promotedConceptIds.has(concept.id),
);
const reinforcementQuestions =
  PRACTICAL_SUPPLEMENTAL_PREDICTED_QUESTIONS.filter((question) =>
    promotedQuestionIds.has(question.id),
  );

if (
  reinforcementConcepts.length !== PRACTICAL_NCS_UNIT_PROMOTIONS.length ||
  reinforcementQuestions.length !== PRACTICAL_NCS_UNIT_PROMOTIONS.length
) {
  throw new Error(
    `NCS 보강 원본 수량 불일치: promotions=${PRACTICAL_NCS_UNIT_PROMOTIONS.length}, concepts=${reinforcementConcepts.length}, questions=${reinforcementQuestions.length}`,
  );
}

const questionByConceptId = new Map(
  reinforcementQuestions.flatMap((question) =>
    question.conceptIds.map((conceptId) => [conceptId, question] as const),
  ),
);
const concepts: PracticalConcept[] = [
  ...input.concepts.filter((concept) => !promotedConceptIds.has(concept.id)),
  ...reinforcementConcepts.map((concept) => {
    const question = questionByConceptId.get(concept.id);
    if (!question) {
      throw new Error(`NCS 보강 개념의 예상문제가 없습니다: ${concept.id}`);
    }
    return {
      ...concept,
      labels: ["predicted_exam" as const],
      relatedPastQuestionIds: [],
      relatedPredictedQuestionIds: [question.id],
    };
  }),
];
const questions: PracticalQuestion[] = [
  ...input.questions.filter(
    (question) => !promotedQuestionIds.has(question.id),
  ),
  ...reinforcementQuestions,
];

const duplicateConceptIdList = duplicateIds(concepts);
const duplicateQuestionIdList = duplicateIds(questions);
if (duplicateConceptIdList.length > 0 || duplicateQuestionIdList.length > 0) {
  throw new Error(
    `NCS 보강 후 ID 중복: concepts=${duplicateConceptIdList.join(",")}, questions=${duplicateQuestionIdList.join(",")}`,
  );
}

const studyCategories = buildStudyCategories(
  input.studyCategories,
  questions,
  concepts,
);
const ncsCoverage = buildNcsCoverage(input.ncsCoverage, concepts);
const pastQuestions = questions.filter((question) => question.kind === "past");
const predictedQuestions = questions.filter(
  (question) => question.kind === "predicted",
);
const publicQuestions = questions.filter(
  (question) =>
    isPublishablePracticalQuestion(question) &&
    isLearnerVisiblePracticalQuestion(question),
);
const heldQuestions = questions.filter(
  (question) =>
    question.auditDisposition !== "verified" &&
    question.auditDisposition !== "cbt_corrected",
);
const heldByDisposition = heldQuestions.reduce<Record<string, number>>(
  (counts, question) => {
    counts[question.auditDisposition] =
      (counts[question.auditDisposition] ?? 0) + 1;
    return counts;
  },
  {},
);
const authoredPredicted =
  predictedQuestions.length -
  input.report.rows.workbookPredicted -
  input.report.rows.balancedPredicted;
const report: PracticalImportReport = {
  ...input.report,
  generatedAt,
  rows: {
    ...input.report.rows,
    past: pastQuestions.length,
    predicted: predictedQuestions.length,
    authoredPredicted,
    supplementalConcepts: PRACTICAL_SUPPLEMENTAL_CONCEPTS.length,
  },
  publication: {
    ...input.report.publication,
    past: publicQuestions.filter((question) => question.kind === "past")
      .length,
    predicted: publicQuestions.filter(
      (question) => question.kind === "predicted",
    ).length,
    supplementalConcepts: PRACTICAL_SUPPLEMENTAL_CONCEPTS.filter(
      (concept) => concept.contentStatus === "published",
    ).length,
    held: heldQuestions.length,
    heldByDisposition,
  },
  ncsCoverage: ncsCoverage.summary,
  exactMatch:
    pastQuestions.length === 51 &&
    predictedQuestions.length === 212 &&
    input.report.rows.workbookPredicted === 41 &&
    authoredPredicted === 104 &&
    input.report.rows.balancedPredicted === 67 &&
    input.report.rows.concepts === 46 &&
    PRACTICAL_SUPPLEMENTAL_CONCEPTS.length === 70 &&
    input.report.rows.ncsDocuments === 11 &&
    ncsCoverage.summary.totalDocuments === 11 &&
    ncsCoverage.summary.accountedDocuments === 11,
  warnings: [...input.report.warnings.filter((item) => item !== warning), warning],
};
const content: PracticalContent = {
  ...input,
  generatedAt,
  questions,
  concepts,
  studyCategories,
  ncsCoverage,
  report,
};
const contentText = `${JSON.stringify(content, null, 2)}\n`;
const reportText = `${JSON.stringify(report, null, 2)}\n`;

if (checkMode) {
  const currentReportText = await readFile(reportPath, "utf8");
  if (inputText !== contentText || currentReportText !== reportText) {
    throw new Error(
      "NCS 세부학습단위 보강 생성물이 최신 소스와 일치하지 않습니다. --write로 다시 생성하세요.",
    );
  }
} else {
  await Promise.all([
    writeFile(contentPath, contentText, "utf8"),
    writeFile(reportPath, reportText, "utf8"),
  ]);
}

console.log(
  `PASS: NCS 세부학습단위 보강 이론 ${reinforcementConcepts.length}개와 예상문제 ${reinforcementQuestions.length}개를 ${writeMode ? "반영" : "검증"}했습니다.`,
);
