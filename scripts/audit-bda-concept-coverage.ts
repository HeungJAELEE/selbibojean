import qbank from "../src/data/source/bda-qbank-v04.json" with { type: "json" };
import {
  bdaGeneratedConceptMockQuestions,
  getBdaConceptMockQuestions,
} from "../src/data/source/bda-concept-mock-questions";
import { bdaConceptEnrichments } from "../src/data/source/bda-concept-enrichment";
import { bdaIntegratedConceptTheories } from "../src/data/source/bda-integrated-concept-theory";
import {
  bdaCodeLabs,
  getBdaCodeLabsForTask,
} from "../src/data/source/bda-practical-content";
import {
  getBdaLearningItemPublicationDecision,
  isBdaLearningItemGradeable,
} from "../src/lib/content/bda-learning-practice";

const conceptIds = new Set(qbank.concepts.map((concept) => concept.id));
const enrichmentIds = new Set(bdaConceptEnrichments.map((concept) => concept.conceptId));
const integratedTheoryIds = new Set(
  bdaIntegratedConceptTheories.map((theory) => theory.conceptId),
);
const errors: string[] = [];
const linkedInventory = qbank.inventory.filter(
  (item) => item.inventoryStatus === "linked_learning_item",
);
const heldInventory = qbank.inventory.filter(
  (item) => item.inventoryStatus === "held_topic_unavailable",
);
const gradeableLearningItems = qbank.learningItems.filter(
  isBdaLearningItemGradeable,
);
const heldLearningItems = qbank.learningItems.filter(
  (item) => !isBdaLearningItemGradeable(item),
);

if (qbank.concepts.length !== 40) errors.push(`Expected 40 concepts, got ${qbank.concepts.length}.`);
if (bdaConceptEnrichments.length !== 40)
  errors.push(`Expected 40 enrichments, got ${bdaConceptEnrichments.length}.`);
if (qbank.inventory.length !== 587)
  errors.push(`Expected 587 inventory rows, got ${qbank.inventory.length}.`);
if (linkedInventory.length !== 183)
  errors.push(`Expected 183 linked inventory rows, got ${linkedInventory.length}.`);
if (heldInventory.length !== 404)
  errors.push(`Expected 404 held inventory rows, got ${heldInventory.length}.`);
if (gradeableLearningItems.length !== 115)
  errors.push(
    `Expected 115 gradeable learning items, got ${gradeableLearningItems.length}.`,
  );
if (heldLearningItems.length !== 68)
  errors.push(`Expected 68 held learning items, got ${heldLearningItems.length}.`);
if (qbank.practicalTasks.length !== 58)
  errors.push(`Expected 58 practical tasks, got ${qbank.practicalTasks.length}.`);
if (bdaCodeLabs.length < 16)
  errors.push(`Expected at least 16 code labs, got ${bdaCodeLabs.length}.`);
if (bdaGeneratedConceptMockQuestions.length < 1)
  errors.push("Expected generated concept mock-question supplements.");
if (bdaIntegratedConceptTheories.length !== 40)
  errors.push(
    `Expected 40 integrated concept theories, got ${bdaIntegratedConceptTheories.length}.`,
  );

for (const [label, ids] of [
  ["concept", qbank.concepts.map((item) => item.id)],
  ["inventory", qbank.inventory.map((item) => item.id)],
  ["learning item", qbank.learningItems.map((item) => item.id)],
  ["practical task", qbank.practicalTasks.map((item) => item.id)],
  ["code lab", bdaCodeLabs.map((item) => item.id)],
  [
    "generated concept mock question",
    bdaGeneratedConceptMockQuestions.map((item) => item.id),
  ],
] as const) {
  if (new Set(ids).size !== ids.length) {
    errors.push(`Duplicate ${label} IDs.`);
  }
}

for (const item of linkedInventory) {
  if (
    item.publicationStatus !== "metadata_only" ||
    item.rightsStatus !== "metadata_only" ||
    !item.transformTargetId ||
    !item.conceptIds.length ||
    item.holdReason
  ) {
    errors.push(`Invalid linked inventory governance: ${item.id}`);
  }
}

for (const item of heldInventory) {
  if (
    item.publicationStatus !== "held" ||
    item.rightsStatus !== "metadata_only" ||
    !item.holdReason ||
    item.transformTargetId ||
    item.conceptIds.length
  ) {
    errors.push(`Invalid held inventory governance: ${item.id}`);
  }
}

for (const concept of qbank.concepts) {
  const enrichment = bdaConceptEnrichments.find((item) => item.conceptId === concept.id);
  if (!enrichment) {
    errors.push(`Missing enrichment: ${concept.id}`);
    continue;
  }
  if (enrichment.examFocus.length < 2) errors.push(`Exam focus too short: ${concept.id}`);
  if (enrichment.decisionSteps.length < 3) errors.push(`Decision steps too short: ${concept.id}`);
  if (enrichment.comparisonRows.length < 3) errors.push(`Comparison rows too short: ${concept.id}`);
  if (enrichment.practicalSteps.length < 2) errors.push(`Practical steps too short: ${concept.id}`);
  if (enrichment.finalChecklist.length < 2) errors.push(`Checklist too short: ${concept.id}`);

  const itemCount = qbank.learningItems.filter((item) => item.conceptIds.includes(concept.id)).length;
  const practicalCount = qbank.practicalTasks.filter((task) => task.conceptIds.includes(concept.id)).length;
  if (itemCount + practicalCount === 0)
    errors.push(`No linked learning item or practical task: ${concept.id}`);

  const theory = bdaIntegratedConceptTheories.find(
    (item) => item.conceptId === concept.id,
  );
  if (!theory) {
    errors.push(`Missing integrated theory: ${concept.id}`);
  } else {
    if (theory.learningSummary.length < 60)
      errors.push(`Integrated theory summary too short: ${concept.id}`);
    if (theory.mustKnow.length < 3)
      errors.push(`Integrated theory rules too short: ${concept.id}`);
    if (theory.examTraps.length < 2)
      errors.push(`Integrated theory traps too short: ${concept.id}`);
  }

  const conceptCodeLabs = bdaCodeLabs.filter((lab) =>
    lab.conceptIds.includes(concept.id),
  );
  if (!conceptCodeLabs.length)
    errors.push(`No linked practical code lab: ${concept.id}`);

  const gradeableCount = qbank.learningItems.filter(
    (item) =>
      item.conceptIds.includes(concept.id) &&
      isBdaLearningItemGradeable(item),
  ).length;
  const heldCount = qbank.learningItems.filter(
    (item) =>
      item.conceptIds.includes(concept.id) &&
      !isBdaLearningItemGradeable(item),
  ).length;
  if (!gradeableCount && !heldCount && concept.subjectNo) {
    errors.push(`No gradeable or explicitly held written practice: ${concept.id}`);
  }

  const conceptMockQuestions = getBdaConceptMockQuestions(concept.id);
  if (conceptMockQuestions.length !== 5) {
    errors.push(
      `Expected five self-authored mock questions for ${concept.id}, got ${conceptMockQuestions.length}.`,
    );
  }
  for (const question of conceptMockQuestions) {
    if (
      question.choices.length !== 4 ||
      new Set(question.choices.map((choice) => choice.text)).size !== 4 ||
      !question.choices.some(
        (choice) => choice.id === question.correctChoiceId,
      )
    ) {
      errors.push(`Invalid concept mock question contract: ${question.id}`);
    }
  }
}

for (const enrichment of bdaConceptEnrichments) {
  if (!conceptIds.has(enrichment.conceptId))
    errors.push(`Enrichment references an unknown concept: ${enrichment.conceptId}`);
}
for (const theory of bdaIntegratedConceptTheories) {
  if (!conceptIds.has(theory.conceptId))
    errors.push(`Integrated theory references an unknown concept: ${theory.conceptId}`);
}

for (const item of qbank.learningItems) {
  if (!item.conceptIds.length) errors.push(`Learning item has no concept: ${item.id}`);
  for (const conceptId of item.conceptIds) {
    if (!conceptIds.has(conceptId)) errors.push(`Unknown concept ${conceptId} on ${item.id}`);
  }
}

for (const item of heldLearningItems) {
  const decision = getBdaLearningItemPublicationDecision(item);
  if (decision.status !== "hold" || !decision.reason) {
    errors.push(`Held learning item lacks an explicit reason: ${item.id}`);
  }
}

for (const task of qbank.practicalTasks) {
  if (!task.conceptIds.length)
    errors.push(`Practical task has no concept: ${task.id}`);
  const linkedLabs = getBdaCodeLabsForTask(
    task.practicalType,
    task.conceptIds,
  );
  if (!linkedLabs.length)
    errors.push(`Practical task has no type-matched code lab: ${task.id}`);
}

if (enrichmentIds.size !== bdaConceptEnrichments.length)
  errors.push("Duplicate concept enrichment IDs.");
if (integratedTheoryIds.size !== bdaIntegratedConceptTheories.length)
  errors.push("Duplicate integrated concept theory IDs.");

if (errors.length) {
  throw new Error(`BDA concept coverage audit failed:\n- ${errors.join("\n- ")}`);
}

console.log(
  `BDA coverage PASS: ${qbank.inventory.length} inventory (${linkedInventory.length} linked, ${heldInventory.length} held), ${qbank.learningItems.length} learning items (${gradeableLearningItems.length} gradeable, ${heldLearningItems.length} held), ${qbank.concepts.length} concepts with ${bdaGeneratedConceptMockQuestions.length} generated mock questions, ${qbank.practicalTasks.length} practical tasks, ${bdaCodeLabs.length} code labs.`,
);
