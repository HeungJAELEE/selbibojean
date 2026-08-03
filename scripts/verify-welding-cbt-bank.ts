import weldingCbtBank from "../src/data/generated/welding-cbt-bank.json";

const EXPECTED = {
  occurrences: 3280,
  approved: 3042,
  held: 238,
  imageRightsHold: 238,
  canonical: 3240,
} as const;

const errors: string[] = [];
const records = weldingCbtBank.records;
const approved = records.filter(
  (record) => record.auditResolution === "approved",
);
const held = records.filter((record) => record.auditResolution === "hold");
const imageRightsHold = records.filter(
  (record) => record.assetStatus === "rights_hold",
);

if (records.length !== EXPECTED.occurrences) {
  errors.push(`occurrence count ${records.length}/${EXPECTED.occurrences}`);
}
if (approved.length !== EXPECTED.approved) {
  errors.push(`approved count ${approved.length}/${EXPECTED.approved}`);
}
if (held.length !== EXPECTED.held) {
  errors.push(`held count ${held.length}/${EXPECTED.held}`);
}
if (imageRightsHold.length !== EXPECTED.imageRightsHold) {
  errors.push(
    `image rights HOLD count ${imageRightsHold.length}/${EXPECTED.imageRightsHold}`,
  );
}
if (
  new Set(records.map((record) => record.canonicalId)).size !==
  EXPECTED.canonical
) {
  errors.push("canonical question count mismatch");
}

for (const record of records) {
  if (
    !record.sourceUrl.startsWith("https://cbtbank.kr/exam/") ||
    record.sourcePageSha256.length !== 64
  ) {
    errors.push(`${record.externalId}: invalid source observation`);
  }
  if (
    record.correctIndex !== null &&
    (record.correctIndex < 0 || record.correctIndex >= record.choices.length)
  ) {
    errors.push(`${record.externalId}: answer index mismatch`);
  }
  if (
    record.auditResolution === "approved" &&
    (record.contentFidelity !== "exact" ||
      record.answerEvidence !== "single_capture_uncontested" ||
      record.assetStatus !== "not_required" ||
      record.correctIndex === null ||
      record.sourceImageUrls.length > 0)
  ) {
    errors.push(`${record.externalId}: unsafe approval`);
  }
  if (
    record.assetStatus === "rights_hold" &&
    (!record.holdReasons.includes("external_image_rights") ||
      record.auditResolution !== "hold")
  ) {
    errors.push(`${record.externalId}: image HOLD gate mismatch`);
  }
}

for (const [label, values] of [
  ["externalId", records.map((record) => record.externalId)],
  [
    "occurrence",
    records.map(
      (record) =>
        `${record.trackKey}:${record.examDate}:${record.questionNumber}`,
    ),
  ],
] as const) {
  if (new Set(values).size !== values.length) {
    errors.push(`${label} contains duplicates`);
  }
}

if (errors.length > 0) {
  console.error(errors.slice(0, 50).join("\n"));
  process.exit(1);
}

console.log(
  `WELDING_CBT_BANK_OK occurrences=${records.length} approved=${approved.length} held=${held.length} imageRightsHold=${imageRightsHold.length}`,
);
