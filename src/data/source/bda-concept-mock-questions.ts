import { bdaIntegratedConceptTheories } from "@/data/source/bda-integrated-concept-theory";
import { bdaLessonConceptMap } from "@/data/source/bda-lesson-concept-map";
import qbank from "@/data/source/bda-qbank-v04.json";
import type { BdaQuestion } from "@/lib/domain/bda";

const MOCKS_PER_CONCEPT = 5;
const choiceIds = ["a", "b", "c", "d"] as const;
const mockFocusPhrases = [
  "핵심 정의·구성으로",
  "구분·적용 원리로",
  "판단 순서·검수 기준으로",
  "대표 시험 함정으로",
  "추가 주의사항으로",
] as const;
const conceptById = new Map(
  qbank.concepts.map((concept) => [concept.id, concept]),
);

const practicalLessonByConcept: Record<string, string> = {
  C037: "bda-s2-scales-preprocessing",
  C038: "bda-s3-ensemble-evaluation",
  C039: "bda-s2-hypothesis-anova",
  C040: "bda-s4-crossvalidation-overfit",
};

function conceptBand(conceptId: string) {
  const order = Number(conceptId.slice(1));
  if (order <= 9) return 1;
  if (order <= 19) return 2;
  if (order <= 30) return 3;
  if (order <= 36) return 4;
  return 5;
}

function getLessonId(conceptId: string) {
  const practicalLesson = practicalLessonByConcept[conceptId];
  if (practicalLesson) return practicalLesson;

  const subjectNo = conceptById.get(conceptId)?.subjectNo;
  const preferredPrefix = subjectNo ? `bda-s${subjectNo}-` : "";
  const candidates = Object.entries(bdaLessonConceptMap)
    .filter(([, conceptIds]) => conceptIds.includes(conceptId))
    .map(([lessonId]) => lessonId);

  return (
    candidates.find((lessonId) => lessonId.startsWith(preferredPrefix)) ??
    candidates[0] ??
    "bda-s4-visualization-deployment"
  );
}

function getDistractors(
  conceptId: string,
  slot: number,
  kind: "rule" | "trap",
  excludedText: string,
) {
  const directCandidates = bdaIntegratedConceptTheories.filter(
    (theory) =>
      theory.conceptId !== conceptId &&
      conceptBand(theory.conceptId) === conceptBand(conceptId),
  );
  const fallbackCandidates = bdaIntegratedConceptTheories.filter(
    (theory) => theory.conceptId !== conceptId,
  );
  const candidates = [...directCandidates, ...fallbackCandidates];
  const seen = new Set<string>([excludedText]);
  const results: Array<{ text: string; conceptName: string }> = [];

  for (const theory of candidates) {
    const statements = kind === "rule" ? theory.mustKnow : theory.examTraps;
    const text = statements[slot % statements.length];
    if (!text || seen.has(text)) continue;
    seen.add(text);
    results.push({
      text,
      conceptName:
        conceptById.get(theory.conceptId)?.name ?? theory.conceptId,
    });
    if (results.length === 3) break;
  }

  if (results.length !== 3) {
    throw new Error(
      `Could not build three mock-question distractors for ${conceptId}.`,
    );
  }
  return results;
}

function buildSupplementQuestion(
  conceptId: string,
  slot: number,
): BdaQuestion {
  const theory = bdaIntegratedConceptTheories.find(
    (item) => item.conceptId === conceptId,
  );
  const concept = conceptById.get(conceptId);
  if (!theory || !concept) {
    throw new Error(`Missing concept theory for ${conceptId}.`);
  }

  const kind = slot < 3 ? "rule" : "trap";
  const sourceIndex = kind === "rule" ? slot : slot - 3;
  const sourceStatements =
    kind === "rule" ? theory.mustKnow : theory.examTraps;
  const correctText = sourceStatements[sourceIndex];
  if (!correctText) {
    throw new Error(`Missing ${kind} statement ${sourceIndex} for ${conceptId}.`);
  }

  const distractors = getDistractors(conceptId, slot, kind, correctText);
  const correctPosition = (Number(conceptId.slice(1)) + slot) % 4;
  const optionSeeds: Array<{
    text: string;
    isCorrect: boolean;
    conceptName: string;
  }> = distractors.map((distractor) => ({
    ...distractor,
    isCorrect: false,
  }));
  optionSeeds.splice(correctPosition, 0, {
    text: correctText,
    isCorrect: true,
    conceptName: concept.name,
  });

  const choices = optionSeeds.map((option, index) => ({
    id: choiceIds[index],
    order: index + 1,
    text: option.text,
    feedback: option.isCorrect
      ? kind === "rule"
        ? `${concept.name}의 통합 이론에서 직접 확인한 핵심 규칙입니다.`
        : `${concept.name} 문제에서 직접 확인해야 할 대표 주의사항입니다.`
      : `이 설명은 ‘${option.conceptName}’에 직접 연결되는 내용입니다. 현재 문항의 ‘${concept.name}’ 판단 범위와 구분해야 합니다.`,
  }));
  const correctChoice = choices[correctPosition];
  const lessonId = getLessonId(conceptId);

  return {
    id: `bda-${conceptId.toLowerCase()}-mock-${slot + 1}`,
    subjectId: lessonId.slice(0, 6),
    lessonId,
    stem: `다음 중 ‘${concept.name}’의 ${mockFocusPhrases[slot]} 가장 적절한 것은?`,
    choices,
    correctChoiceId: correctChoice.id,
    explanation:
      kind === "rule"
        ? `${concept.name}에서는 “${correctText}”를 직접 판단 기준으로 사용합니다. 다른 보기는 같은 과목의 인접 개념에 적용되는 규칙입니다.`
        : `“${correctText}”는 ${concept.name} 문항에서 직접 확인해야 할 대표 주의사항입니다. 용어가 비슷해도 적용 대상과 판단 조건을 끝까지 확인해야 합니다.`,
    sourceLabel: "통합 개념서 검수 이론 기반 자체 제작 모의문제",
    sourceType: "self_authored",
    evidenceGrade: "B",
    reviewStatus: "verified",
    contentStatus: "published",
  };
}

export const bdaGeneratedConceptMockQuestions: BdaQuestion[] =
  bdaIntegratedConceptTheories.flatMap((theory) => {
    return Array.from(
      { length: MOCKS_PER_CONCEPT },
      (_, index) => buildSupplementQuestion(theory.conceptId, index),
    );
  });

export function getBdaConceptMockQuestions(conceptId: string) {
  const theory = bdaIntegratedConceptTheories.find(
    (item) => item.conceptId === conceptId,
  );
  if (!theory) return [];

  const generated = bdaGeneratedConceptMockQuestions.filter((question) =>
    question.id.startsWith(`bda-${conceptId.toLowerCase()}-mock-`),
  );

  return generated;
}
