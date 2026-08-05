import { readFile } from "node:fs/promises";

const dataset = JSON.parse(await readFile("src/data/generated/cbt-source-reconstruction.json", "utf8"));
const fixtures = JSON.parse(await readFile("tests/fixtures/cbt-source-format-regression.json", "utf8"));
const recordsById = new Map(dataset.records.map((record) => [record.externalId, record]));
const failures = [];

for (const fixture of fixtures) {
  const record = recordsById.get(fixture.externalId);
  if (!record?.source) {
    failures.push(`${fixture.externalId}: reconstructed source record missing`);
    continue;
  }
  if (record.source.exactStem !== fixture.sourceExactStem) {
    failures.push(`${fixture.externalId}: exact stem formatting changed`);
  }
  if (JSON.stringify(record.source.exactChoices) !== JSON.stringify(fixture.sourceExactChoices)) {
    failures.push(`${fixture.externalId}: exact choice formatting changed`);
  }
  if (record.source.answerIndex !== fixture.sourceAnswerIndex) {
    failures.push(`${fixture.externalId}: source answer index changed`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`CBT source format regression verified: ${fixtures.length} records`);
