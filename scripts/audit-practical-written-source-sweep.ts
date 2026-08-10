import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  PRACTICAL_NCS_UNIT_CANDIDATES,
  PRACTICAL_NCS_UNIT_REGISTRY,
  PRACTICAL_RESTORED_SOURCE_SWEEP,
  PRACTICAL_WRITTEN_SOURCE_SWEEP_VERSION,
  type PracticalNcsUnitPriority,
} from "../src/data/source/practical-written-source-sweep";
import { PRACTICAL_NCS_UNIT_PROMOTIONS } from "../src/data/source/practical-ncs-unit-reinforcements";
import type {
  PracticalContent,
  PracticalQuestion,
} from "../src/lib/domain/practical-types";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "src",
  "data",
  "generated",
  "practical-content.json",
);
const outputPath = path.join(
  root,
  "src",
  "data",
  "generated",
  "practical-written-source-sweep.json",
);

type UnitCoverage = {
  conceptIds: Set<string>;
  pastQuestionIds: Set<string>;
  predictedQuestionIds: Set<string>;
  sourceReferenceCount: number;
  documentLeadInSourceReferenceCount: number;
};

const args = new Set(process.argv.slice(2));
const writeMode = args.has("--write");
const checkMode = args.has("--check");

if (writeMode === checkMode) {
  throw new Error("--write 또는 --check 중 하나만 지정해야 합니다.");
}

function sorted(values: Iterable<string>) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return sorted(duplicates);
}

function questionById(
  questions: PracticalQuestion[],
  questionId: string,
) {
  return questions.find((question) => question.id === questionId);
}

const content = JSON.parse(await readFile(sourcePath, "utf8")) as PracticalContent;
const errors: string[] = [];
const unitIds = PRACTICAL_NCS_UNIT_REGISTRY.map((item) => item.id);
const candidateIds = PRACTICAL_NCS_UNIT_CANDIDATES.map((item) => item.id);
const candidateUnitKeys = PRACTICAL_NCS_UNIT_CANDIDATES.map(
  (item) => `${item.ncsCode}:${item.unitId}`,
);
const registryCodes = sorted(
  new Set(PRACTICAL_NCS_UNIT_REGISTRY.map((item) => item.ncsCode)),
);
const contentCodes = sorted(
  new Set(content.ncsCoverage.documents.map((item) => item.ncsCode)),
);

for (const [label, duplicates] of [
  ["NCS 학습단위 ID", duplicateValues(unitIds)],
  ["후보 ID", duplicateValues(candidateIds)],
  ["후보 학습단위", duplicateValues(candidateUnitKeys)],
  [
    "복원 출처 URL",
    duplicateValues(PRACTICAL_RESTORED_SOURCE_SWEEP.map((item) => item.url)),
  ],
] as const) {
  if (duplicates.length > 0) {
    errors.push(`${label} 중복: ${duplicates.join(", ")}`);
  }
}

if (JSON.stringify(registryCodes) !== JSON.stringify(contentCodes)) {
  errors.push(
    `NCS 문서 집합 불일치: registry=${registryCodes.join(",")} content=${contentCodes.join(",")}`,
  );
}

for (const ncsCode of registryCodes) {
  const units = PRACTICAL_NCS_UNIT_REGISTRY.filter(
    (item) => item.ncsCode === ncsCode,
  );
  for (const [index, current] of units.entries()) {
    if (current.printedPageStart < 1) {
      errors.push(`${current.id}: 시작 쪽수가 올바르지 않습니다.`);
    }
    if (
      current.printedPageEnd !== null &&
      current.printedPageEnd < current.printedPageStart
    ) {
      errors.push(`${current.id}: 끝 쪽수가 시작 쪽수보다 작습니다.`);
    }
    if (current.printedPageEnd === null && index !== units.length - 1) {
      errors.push(`${current.id}: 마지막이 아닌 단위의 끝 쪽수가 열려 있습니다.`);
    }
    const previous = units[index - 1];
    if (
      previous &&
      (previous.printedPageEnd === null ||
        current.printedPageStart !== previous.printedPageEnd + 1)
    ) {
      errors.push(`${current.id}: 앞 단위와 인쇄 쪽수 범위가 연속되지 않습니다.`);
    }
  }
}

const coverageByUnitId = new Map<string, UnitCoverage>(
  PRACTICAL_NCS_UNIT_REGISTRY.map((item) => [
    item.id,
    {
      conceptIds: new Set<string>(),
      pastQuestionIds: new Set<string>(),
      predictedQuestionIds: new Set<string>(),
      sourceReferenceCount: 0,
      documentLeadInSourceReferenceCount: 0,
    },
  ]),
);
const registryCodeSet = new Set(registryCodes);
let ncsSourceReferenceCount = 0;

for (const concept of content.concepts) {
  for (const source of concept.ncsSources) {
    if (!registryCodeSet.has(source.ncsCode)) continue;
    ncsSourceReferenceCount += 1;
    let matches = PRACTICAL_NCS_UNIT_REGISTRY.filter(
      (item) =>
        item.ncsCode === source.ncsCode &&
        source.printedPage !== null &&
        source.printedPage >= item.printedPageStart &&
        (item.printedPageEnd === null ||
          source.printedPage <= item.printedPageEnd),
    );
    let documentLeadInMatch = false;
    if (matches.length === 0 && source.printedPage !== null) {
      const firstUnit = PRACTICAL_NCS_UNIT_REGISTRY.find(
        (item) => item.ncsCode === source.ncsCode,
      );
      if (
        firstUnit &&
        source.printedPage >= 1 &&
        source.printedPage < firstUnit.printedPageStart
      ) {
        matches = [firstUnit];
        documentLeadInMatch = true;
      }
    }
    if (matches.length !== 1) {
      errors.push(
        `${concept.id}: ${source.ncsCode} 인쇄 ${String(source.printedPage)}쪽이 ${matches.length}개 학습단위에 연결됩니다.`,
      );
      continue;
    }
    const coverage = coverageByUnitId.get(matches[0].id);
    if (!coverage) {
      errors.push(`${matches[0].id}: Coverage 누적기가 없습니다.`);
      continue;
    }
    coverage.sourceReferenceCount += 1;
    if (documentLeadInMatch) {
      coverage.documentLeadInSourceReferenceCount += 1;
    }
    coverage.conceptIds.add(concept.id);
    concept.relatedPastQuestionIds.forEach((id) =>
      coverage.pastQuestionIds.add(id),
    );
    concept.relatedPredictedQuestionIds.forEach((id) =>
      coverage.predictedQuestionIds.add(id),
    );
  }
}

const conceptIdSet = new Set(content.concepts.map((item) => item.id));
const questionIdSet = new Set(content.questions.map((item) => item.id));
const conceptById = new Map(content.concepts.map((item) => [item.id, item]));
const candidateByUnitKey = new Map(
  PRACTICAL_NCS_UNIT_CANDIDATES.map((item) => [
    `${item.ncsCode}:${item.unitId}`,
    item,
  ]),
);
const promotionByCandidateId = new Map(
  PRACTICAL_NCS_UNIT_PROMOTIONS.map((item) => [item.candidateId, item]),
);

if (promotionByCandidateId.size !== PRACTICAL_NCS_UNIT_CANDIDATES.length) {
  errors.push(
    `NCS 후보 승격 수량 불일치: candidates=${PRACTICAL_NCS_UNIT_CANDIDATES.length} promotions=${promotionByCandidateId.size}`,
  );
}

for (const candidate of PRACTICAL_NCS_UNIT_CANDIDATES) {
  const unitKey = `${candidate.ncsCode}:${candidate.unitId}`;
  const registryUnit = PRACTICAL_NCS_UNIT_REGISTRY.find(
    (item) => `${item.ncsCode}:${item.unitId}` === unitKey,
  );
  if (!registryUnit) {
    errors.push(`${candidate.id}: 존재하지 않는 NCS 학습단위 ${unitKey}입니다.`);
    continue;
  }
  const coverage = coverageByUnitId.get(registryUnit.id);
  const promotion = promotionByCandidateId.get(candidate.id);
  if (
    candidate.memoryCapsule.trim().length < 40 ||
    candidate.requiredKeywords.length < 3 ||
    candidate.questionFormats.length === 0 ||
    candidate.predictedPromptSeeds.length < 2
  ) {
    errors.push(`${candidate.id}: 시험형 후보의 필수 학습 필드가 부족합니다.`);
  }
  if (candidate.publicationStatus !== "editorial_hold") {
    errors.push(`${candidate.id}: 출처 검증 전 후보는 editorial_hold여야 합니다.`);
  }
  for (const conceptId of candidate.neighborConceptIds) {
    if (!conceptIdSet.has(conceptId)) {
      errors.push(`${candidate.id}: 존재하지 않는 인접 개념 ${conceptId}입니다.`);
    }
  }
  if (!promotion) {
    errors.push(`${candidate.id}: 검수 완료 승격 레코드가 없습니다.`);
    continue;
  }
  if (
    promotion.ncsCode !== candidate.ncsCode ||
    promotion.unitId !== candidate.unitId
  ) {
    errors.push(`${candidate.id}: 승격 레코드의 NCS 학습단위가 다릅니다.`);
  }
  const promotedConcept = conceptById.get(promotion.conceptId);
  const promotedQuestion = questionById(content.questions, promotion.questionId);
  if (!promotedConcept) {
    errors.push(`${candidate.id}: 승격 개념 ${promotion.conceptId}이 없습니다.`);
  } else {
    if (
      promotedConcept.contentRole !== "supplemental" ||
      promotedConcept.contentStatus !== "published" ||
      !promotedConcept.relatedPredictedQuestionIds.includes(
        promotion.questionId,
      ) ||
      !promotedConcept.ncsSources.some(
        (source) =>
          source.ncsCode === candidate.ncsCode &&
          source.printedPage !== null &&
          source.printedPage >= registryUnit.printedPageStart &&
          (registryUnit.printedPageEnd === null ||
            source.printedPage <= registryUnit.printedPageEnd),
      )
    ) {
      errors.push(`${candidate.id}: 승격 개념의 공개·문항·원문 연결이 불완전합니다.`);
    }
  }
  if (!promotedQuestion) {
    errors.push(`${candidate.id}: 승격 문제 ${promotion.questionId}가 없습니다.`);
  } else if (
    promotedQuestion.kind !== "predicted" ||
    promotedQuestion.label !== "predicted_exam" ||
    promotedQuestion.auditDisposition !== "verified" ||
    promotedQuestion.contentStatus !== "published" ||
    promotedQuestion.occurrence !== null ||
    promotedQuestion.examEvidenceStatus !== "ncs_supplement" ||
    !promotedQuestion.conceptIds.includes(promotion.conceptId) ||
    !promotedQuestion.modelAnswer ||
    promotedQuestion.requiredKeywords.length < 3 ||
    promotedQuestion.rubric.length === 0 ||
    promotedQuestion.ncsSources.length === 0
  ) {
    errors.push(`${candidate.id}: 승격 예상문제의 공개·답안·채점·근거가 불완전합니다.`);
  }
  if (!coverage?.conceptIds.has(promotion.conceptId)) {
    errors.push(`${candidate.id}: 승격 개념이 해당 학습단위 Coverage에 없습니다.`);
  }
}

for (const [unitId, coverage] of coverageByUnitId) {
  const unit = PRACTICAL_NCS_UNIT_REGISTRY.find((item) => item.id === unitId);
  if (!unit) continue;
  if (coverage.conceptIds.size === 0) {
    errors.push(`${unitId}: 공개 개념이 없는 누락 단위입니다.`);
  }
  for (const questionId of [
    ...coverage.pastQuestionIds,
    ...coverage.predictedQuestionIds,
  ]) {
    if (!questionIdSet.has(questionId)) {
      errors.push(`${unitId}: 존재하지 않는 연결 문항 ${questionId}입니다.`);
    }
  }
}

for (const source of PRACTICAL_RESTORED_SOURCE_SWEEP) {
  if (source.submissionCount < 1) {
    errors.push(`${source.id}: 입력 횟수는 1 이상이어야 합니다.`);
  }
  if (source.status === "source_pending_extraction") {
    if (source.occurrence !== null || source.questionIds.length > 0) {
      errors.push(`${source.id}: 미추출 출처에 회차나 문항을 추정 연결했습니다.`);
    }
    continue;
  }
  if (source.occurrence === null || source.questionIds.length === 0) {
    errors.push(`${source.id}: 기존 연결 출처에 회차 또는 문항이 없습니다.`);
    continue;
  }
  for (const questionId of source.questionIds) {
    const question = questionById(content.questions, questionId);
    if (!question) {
      errors.push(`${source.id}: 존재하지 않는 복원문항 ${questionId}입니다.`);
      continue;
    }
    if (
      question.occurrence?.year !== source.occurrence.year ||
      question.occurrence.round !== source.occurrence.round ||
      question.occurrence.sourceUrl !== source.url
    ) {
      errors.push(`${source.id}: ${questionId}의 회차·출처 URL이 일치하지 않습니다.`);
    }
  }
}

const units = PRACTICAL_NCS_UNIT_REGISTRY.map((unit) => {
  const coverage = coverageByUnitId.get(unit.id);
  if (!coverage) throw new Error(`${unit.id}: Coverage가 없습니다.`);
  const candidate = candidateByUnitKey.get(`${unit.ncsCode}:${unit.unitId}`);
  const promotion = candidate
    ? promotionByCandidateId.get(candidate.id)
    : undefined;
  const priority: PracticalNcsUnitPriority =
    coverage.pastQuestionIds.size > 0
      ? "A"
      : promotion
        ? candidate?.priority ?? "B"
        : coverage.conceptIds.size > 0
        ? "B"
        : (candidate?.priority ?? "C");
  const status =
    coverage.pastQuestionIds.size > 0
      ? "existing_past_anchored"
      : promotion
        ? "promoted_ncs_supplement"
        : coverage.conceptIds.size > 0
        ? "existing_predicted_or_adjacent"
        : "candidate_editorial_hold";
  return {
    ...unit,
    priority,
    status,
    conceptIds: sorted(coverage.conceptIds),
    pastQuestionIds: sorted(coverage.pastQuestionIds),
    predictedQuestionIds: sorted(coverage.predictedQuestionIds),
    sourceReferenceCount: coverage.sourceReferenceCount,
    documentLeadInSourceReferenceCount:
      coverage.documentLeadInSourceReferenceCount,
    candidate: candidate
      ? {
          id: candidate.id,
          title: candidate.title,
          memoryCapsule: candidate.memoryCapsule,
          requiredKeywords: candidate.requiredKeywords,
          questionFormats: candidate.questionFormats,
          predictedPromptSeeds: candidate.predictedPromptSeeds,
          neighborConceptIds: candidate.neighborConceptIds,
          sourceStatus: candidate.sourceStatus,
          publicationStatus: candidate.publicationStatus,
          holdReason: candidate.holdReason,
        }
      : null,
    promotion: promotion ?? null,
  };
});

const priorities = (priority: PracticalNcsUnitPriority) =>
  units.filter((item) => item.priority === priority).length;
const baselineExistingCoveredUnits = units.filter((item) =>
  item.status.startsWith("existing_"),
).length;
const promotedUnits = units.filter(
  (item) => item.status === "promoted_ncs_supplement",
).length;
const candidateUnits = units.filter(
  (item) => item.status === "candidate_editorial_hold",
).length;
const coveredUnits = baselineExistingCoveredUnits + promotedUnits;

const documents = registryCodes.map((ncsCode) => {
  const documentUnits = units.filter((item) => item.ncsCode === ncsCode);
  return {
    ncsCode,
    title:
      content.ncsCoverage.documents.find((item) => item.ncsCode === ncsCode)
        ?.documentTitle ?? "",
    totalUnits: documentUnits.length,
    baselineExistingCoveredUnits: documentUnits.filter((item) =>
      item.status.startsWith("existing_"),
    ).length,
    promotedUnits: documentUnits.filter(
      (item) => item.status === "promoted_ncs_supplement",
    ).length,
    coveredUnits: documentUnits.filter(
      (item) => item.status !== "candidate_editorial_hold",
    ).length,
    candidateUnits: documentUnits.filter(
      (item) => item.status === "candidate_editorial_hold",
    ).length,
    priorityA: documentUnits.filter((item) => item.priority === "A").length,
    priorityB: documentUnits.filter((item) => item.priority === "B").length,
    priorityC: documentUnits.filter((item) => item.priority === "C").length,
  };
});

const report = {
  formatVersion: 2,
  sourceSweepVersion: PRACTICAL_WRITTEN_SOURCE_SWEEP_VERSION,
  scope: "practical_written_ncs_11_books",
  summary: {
    ncsDocuments: registryCodes.length,
    ncsUnits: units.length,
    baselineExistingCoveredUnits,
    promotedUnits,
    coveredUnits,
    candidateUnits,
    priorityA: priorities("A"),
    priorityB: priorities("B"),
    priorityC: priorities("C"),
    ncsSourceReferenceCount,
    documentLeadInSourceReferenceCount: units.reduce(
      (sum, item) => sum + item.documentLeadInSourceReferenceCount,
      0,
    ),
    unmappedNcsSourceRefs: errors.filter((error) =>
      error.includes("인쇄"),
    ).length,
    unaccountedUnits: units.filter(
      (item) => item.conceptIds.length === 0 && item.candidate === null,
    ).length,
    restoredSourceSubmissions: PRACTICAL_RESTORED_SOURCE_SWEEP.reduce(
      (sum, item) => sum + item.submissionCount,
      0,
    ),
    restoredUniqueSourceUrls: PRACTICAL_RESTORED_SOURCE_SWEEP.length,
    pendingRestoredSourceUrls: PRACTICAL_RESTORED_SOURCE_SWEEP.filter(
      (item) => item.status === "source_pending_extraction",
    ).length,
  },
  documents,
  units,
  restoredSources: PRACTICAL_RESTORED_SOURCE_SWEEP,
};

if (errors.length > 0) {
  errors.forEach((error) => console.error(`FAIL: ${error}`));
  process.exit(1);
}

const serialized = `${JSON.stringify(report, null, 2)}\n`;

if (writeMode) {
  await writeFile(outputPath, serialized, "utf8");
  console.log(
    `Practical written source sweep generated: ${units.length} units, ${baselineExistingCoveredUnits} baseline existing, ${promotedUnits} promoted, ${candidateUnits} candidate HOLD.`,
  );
} else {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== serialized) {
    console.error(
      "FAIL: practical-written-source-sweep.json이 현재 원천·콘텐츠와 일치하지 않습니다. npm run generate:practical-source-sweep를 실행하세요.",
    );
    process.exit(1);
  }
  console.log(
    `PASS: 필답 원천 스윕 ${units.length}개 단위, 기존 ${baselineExistingCoveredUnits}개 + NCS 보강 ${promotedUnits}개, 후보 HOLD ${candidateUnits}개, 미귀속 0개.`,
  );
}
