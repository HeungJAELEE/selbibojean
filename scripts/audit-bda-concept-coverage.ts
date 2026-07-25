import qbank from "../src/data/source/bda-qbank-v04.json" with { type: "json" };
import { bdaConceptEnrichments } from "../src/data/source/bda-concept-enrichment";

const conceptIds = new Set(qbank.concepts.map((concept) => concept.id));
const enrichmentIds = new Set(bdaConceptEnrichments.map((concept) => concept.conceptId));
const errors: string[] = [];

if (qbank.concepts.length !== 40) errors.push(`Expected 40 concepts, got ${qbank.concepts.length}.`);
if (bdaConceptEnrichments.length !== 40)
  errors.push(`Expected 40 enrichments, got ${bdaConceptEnrichments.length}.`);

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
}

for (const enrichment of bdaConceptEnrichments) {
  if (!conceptIds.has(enrichment.conceptId))
    errors.push(`Enrichment references an unknown concept: ${enrichment.conceptId}`);
}

for (const item of qbank.learningItems) {
  if (!item.conceptIds.length) errors.push(`Learning item has no concept: ${item.id}`);
  for (const conceptId of item.conceptIds) {
    if (!conceptIds.has(conceptId)) errors.push(`Unknown concept ${conceptId} on ${item.id}`);
  }
}

if (enrichmentIds.size !== bdaConceptEnrichments.length)
  errors.push("Duplicate concept enrichment IDs.");

if (errors.length) {
  throw new Error(`BDA concept coverage audit failed:\n- ${errors.join("\n- ")}`);
}

console.log(
  `BDA concept coverage PASS: ${qbank.learningItems.length} learning items → ${qbank.concepts.length} concepts → ${bdaConceptEnrichments.length} expanded modules.`,
);
