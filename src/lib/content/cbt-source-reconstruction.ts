import "server-only";

import rawReconstruction from "@/data/generated/cbt-source-reconstruction.json";

type Fidelity = "exact" | "normalized_exact" | "mismatch" | "unreachable";
type Resolution = "restored_candidate" | "hold";
type PublicationStatus = "hold" | "approved";

export type CbtSourceImageObservation = {
  url: string;
  finalUrl: string | null;
  status: number | null;
  reachable: boolean;
  contentType: string | null;
  contentLength: number;
  sha256: string | null;
  error?: string;
};

export type CbtSourceReconstructionRecord = {
  externalId: string;
  canonicalId: string;
  relationship: string;
  year: number | null;
  sessionLabel: string;
  questionNumber: number | null;
  registeredSourceUrl: string;
  resolvedSourceUrl: string;
  sourceUrlResolution: string;
  sourceAuthority: "mirror_capture";
  sourceDisplayLabel: "복원 정답";
  pageTitle: string;
  pageExamDate: string | null;
  examTrackKey: string | null;
  trackIdentityStatus: string;
  observedAt: string;
  sourcePageSha256: string;
  sourceCaptureStatus: "captured" | "missing";
  source: {
    exactStem: string;
    exactChoices: string[];
    answerIndex: number | null;
    answerIndicesObserved: number[];
    stemImageUrls: string[];
    choiceImageUrls: string[][];
    imageObservations?: CbtSourceImageObservation[];
    stemSha256: string;
    orderedChoicesSha256: string;
    sourceIdentitySha256: string;
    registeredIdentitySha256: string;
  };
  current: {
    stemSha256: string;
    orderedChoicesSha256: string;
    answerIndex: number | null;
    stemFidelity: Fidelity;
    choicesFidelity: Fidelity;
    answerMatchesSource: boolean | null;
  };
  stableChoiceIds: string[] | null;
  stableChoiceMappingStatus: string;
  variantChoiceIds: string[];
  canonicalCorrectChoiceId: string | null;
  sourceAnswerChoiceId: string | null;
  answerAlignmentStatus: "match" | "conflict" | "unknown";
  answerEvidence: "unknown" | "confirmed" | "likely" | "conflict";
  imageRequirement: "none" | "required" | "source_image_missing";
  imageStatus: string;
  resolution: Resolution;
  holdReasons: string[];
  theoryLink: {
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    conceptId: string;
  } | null;
  canonical: {
    stemFidelity: Fidelity;
    orderedChoicesFidelity: Fidelity;
    answerChoiceId: string;
  } | null;
  publicationStatus: PublicationStatus;
  publicationHoldReasons: string[];
};

export type CbtSourceReconstructionSession = {
  sessionKey: string;
  registeredSourceUrl: string;
  resolvedSourceUrl: string;
  sourceUrlResolution: string;
  sourceAuthority: "mirror_capture";
  pageTitle: string;
  pageExamDate: string | null;
  examTrackKey: string | null;
  observedAt: string;
  sourcePageSha256: string;
  expectedVariantCount: number;
  sourceQuestionCount: number;
  selectedQuestionNumbers: number[];
  duplicateSelectedQuestionNumbers: number[];
  missingSelectedQuestionNumbers: number[];
  selectedCapturedCount: number;
  restoredCandidateCount: number;
  holdCount: number;
};

type Dataset = {
  formatVersion: 1;
  generatedAt: string;
  sourcePolicy: string;
  sourceAuthority: "mirror_capture";
  answerDisplayLabel: "복원 정답";
  sourceCounts: {
    canonicalQuestions: number;
    variants: number;
    sessions: number;
    registeredSourceUrls: number;
    resolvedSourceUrls: number;
    sourceQuestionsCaptured: number;
    selectedQuestionsCaptured: number;
    restoredCandidates: number;
    holds: number;
    sourceImages: number;
    reachableSourceImages: number;
    publicationReady: number;
    publicationHolds: number;
    variantSpecificChoiceContractRequired: number;
    canonicalStemExact: number;
    canonicalStemNormalizedExact: number;
    canonicalChoicesExact: number;
    canonicalChoicesNormalizedExact: number;
  };
  sessions: CbtSourceReconstructionSession[];
  records: CbtSourceReconstructionRecord[];
};

const dataset = rawReconstruction as unknown as Dataset;
const recordsById = new Map(
  dataset.records.map((record) => [record.externalId, record]),
);
const recordIndexById = new Map(
  dataset.records.map((record, index) => [record.externalId, index]),
);

export function getCbtSourceReconstructionSummary() {
  return {
    formatVersion: dataset.formatVersion,
    generatedAt: dataset.generatedAt,
    sourcePolicy: dataset.sourcePolicy,
    sourceAuthority: dataset.sourceAuthority,
    answerDisplayLabel: dataset.answerDisplayLabel,
    counts: dataset.sourceCounts,
    sessions: dataset.sessions.map((session) => {
      const sessionRecords = dataset.records.filter(
        (record) => record.registeredSourceUrl === session.registeredSourceUrl,
      );
      return {
        ...session,
        firstExternalId: sessionRecords[0]?.externalId ?? null,
        publicationHoldCount: sessionRecords.filter(
          (record) => record.publicationStatus === "hold",
        ).length,
      };
    }),
  };
}

export function getCbtSourceReconstructionRecord(externalId: string) {
  return recordsById.get(externalId) ?? null;
}

export function getAdjacentCbtSourceReconstructionRecords(externalId: string) {
  const index = recordIndexById.get(externalId);
  if (index === undefined) return { previous: null, next: null };
  return {
    previous: dataset.records[index - 1] ?? null,
    next: dataset.records[index + 1] ?? null,
  };
}

export function getApprovedCbtSourceReconstructionRecords() {
  return dataset.records.filter(
    (record) => record.publicationStatus === "approved",
  );
}
