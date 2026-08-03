import rawWeldingCbtBank from "../src/data/generated/welding-cbt-bank.json";
import rawProjection from "../src/data/source/welding-cbt-lesson-projection.json";
import { weldingCbtLeafLessons } from "../src/lib/content/welding-cbt-leaf-lessons";

const PART_COUNT = 19;

type BankRecord = (typeof rawWeldingCbtBank.records)[number];

function argument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(
    prefix.length,
  );
}

function parsePartNumber() {
  const raw = argument("part");
  const partNumber = raw ? Number(raw) : Number.NaN;
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > PART_COUNT) {
    throw new Error(`ANSWER_REVIEW_PART_INVALID part=${raw ?? ""}`);
  }
  return partNumber;
}

function partitionRange(total: number, partIndex: number) {
  const baseSize = Math.floor(total / PART_COUNT);
  const remainder = total % PART_COUNT;
  const start = partIndex * baseSize + Math.min(partIndex, remainder);
  const size = baseSize + (partIndex < remainder ? 1 : 0);
  return { start, size };
}

function main() {
  const partNumber = parsePartNumber();
  const requestedId = argument("id");
  const entries = [...rawProjection.entries].sort((left, right) =>
    left.canonicalId.localeCompare(right.canonicalId)
  );
  const { start, size } = partitionRange(entries.length, partNumber - 1);
  const assigned = entries.slice(start, start + size);
  const bankByCanonicalId = new Map<string, BankRecord[]>();
  for (const record of rawWeldingCbtBank.records) {
    const current = bankByCanonicalId.get(record.canonicalId) ?? [];
    current.push(record);
    bankByCanonicalId.set(record.canonicalId, current);
  }
  const lessonById = new Map(
    weldingCbtLeafLessons.map((lesson) => [lesson.id, lesson]),
  );

  const packets = assigned
    .filter((entry) => !requestedId || entry.canonicalId === requestedId)
    .map((entry) => {
      const records = bankByCanonicalId.get(entry.canonicalId) ?? [];
      const representative = [...records].sort(
        (left, right) =>
          right.examDate.localeCompare(left.examDate)
          || left.questionNumber - right.questionNumber,
      )[0];
      return {
        canonicalId: entry.canonicalId,
        contentDigest: entry.contentDigest,
        proposedLeafLessonId: entry.primaryLeafLessonId,
        representative: representative
          ? {
              stem: representative.stem,
              choices: representative.choices,
              correctIndex: representative.correctIndex,
              sourceUrl: representative.sourceUrl,
              examDate: representative.examDate,
              sessionLabel: representative.sessionLabel,
              questionNumber: representative.questionNumber,
              answerEvidence: representative.answerEvidence,
            }
          : null,
        occurrenceCount: records.length,
        sourceUrls: [...new Set(records.map((record) => record.sourceUrl))],
        lesson: entry.primaryLeafLessonId
          ? lessonById.get(entry.primaryLeafLessonId) ?? null
          : null,
      };
    });

  if (requestedId && packets.length === 0) {
    throw new Error(
      `ANSWER_REVIEW_ID_NOT_ASSIGNED part=${partNumber} canonicalId=${requestedId}`,
    );
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        partNumber,
        partCount: PART_COUNT,
        packetCount: packets.length,
        packets,
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({
      ok: false,
      code: message.split(" ")[0],
      message,
    }),
  );
  process.exit(1);
}
