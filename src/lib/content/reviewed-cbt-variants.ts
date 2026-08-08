import { createHash } from "node:crypto";
import rawManifest from "@/data/generated/cbt-reviewed-variants.json";
import {
  AUDIT_DISPOSITIONS,
  PUBLICATION_BLOCKERS,
  QUESTION_VERIFICATION_METHODS,
  VERIFICATION_RISK_TAGS,
  type GeneratedContent,
  type ReviewedCbtCanonicalQuestionChange,
  type ReviewedCbtVariantManifest,
  type ReviewedCbtVariantRecord,
} from "@/lib/domain/types";

export const reviewedCbtVariantManifest =
  rawManifest as ReviewedCbtVariantManifest;

export function mergeReviewedCbtVariants(
  content: GeneratedContent,
  manifest: ReviewedCbtVariantManifest = reviewedCbtVariantManifest,
): GeneratedContent {
  const effectiveContent = applyReviewedCbtTheoryAndCanonicalChanges(
    content,
    manifest,
  );
  validateReviewedCbtVariantManifestInternal(effectiveContent, manifest);

  const recordsByExternalId = new Map(
    manifest.records.map((record) => [record.externalId, record]),
  );

  return {
    ...effectiveContent,
    variants: effectiveContent.variants.map((variant) => {
      const reviewed = recordsByExternalId.get(variant.externalId);
      if (!reviewed) {
        return {
          ...variant,
          reviewState: "unreviewed" as const,
        };
      }

      const answerBearing =
        reviewed.review.runtimeStatus === "candidate" ||
        reviewed.review.runtimeStatus === "published";
      const presentation = getReviewedCbtVariantPresentation(reviewed);

      return {
        ...variant,
        canonicalId: reviewed.canonicalId,
        stem: presentation.stem,
        choices: presentation.choices,
        answer: answerBearing
          ? reviewed.reviewedAnswerText || reviewed.sourceAnswerText || ""
          : "",
        explanation: answerBearing ? reviewed.directSolution : "",
        sourceUrl: reviewed.source.registeredSourceUrl,
        reviewStatus: buildReviewStatus(reviewed),
        verificationNote: buildVerificationNote(reviewed),
        reviewState: reviewed.review.runtimeStatus,
        reviewed,
      };
    }),
  };
}

export function mapReviewedCbtVariantChoices(
  question: GeneratedContent["questions"][number],
  variant: GeneratedContent["variants"][number],
) {
  if (variant.reviewState !== "published" || !variant.reviewed) return null;
  if (variant.reviewed.variantSpecificFeedbackRequired) return null;
  if (variant.reviewed.choiceIdMapping.length !== variant.choices.length) {
    return null;
  }

  const choicesById = new Map(
    question.choices.map((choice) => [choice.id, choice]),
  );
  const mapped = variant.reviewed.choiceIdMapping.map((choiceId) =>
    choicesById.get(choiceId),
  );
  if (mapped.some((choice) => !choice)) return null;

  const complete = mapped.filter(
    (choice): choice is GeneratedContent["questions"][number]["choices"][number] =>
      Boolean(choice),
  );
  return new Set(complete.map((choice) => choice.id)).size === complete.length
    ? complete
    : null;
}

export function getReviewedCbtVariantAnswerIndex(
  variant: GeneratedContent["variants"][number],
) {
  if (variant.reviewState !== "published" || !variant.reviewed) return null;
  if (variant.reviewed.variantSpecificFeedbackRequired) return null;
  const answerIndex = variant.reviewed.reviewedAnswerIndex;
  return answerIndex !== null &&
    Number.isInteger(answerIndex) &&
    answerIndex >= 0 &&
    answerIndex < variant.choices.length
    ? answerIndex
    : null;
}

export function getReviewedCbtVariantPresentation(
  record: ReviewedCbtVariantRecord,
) {
  const normalized = record.presentationNormalization;
  return normalized
    ? {
        stem: normalized.normalizedStem,
        choices: [...normalized.normalizedChoices],
      }
    : { stem: record.stem, choices: [...record.choices] };
}

export function validateReviewedCbtVariantManifest(
  content: GeneratedContent,
  manifest: ReviewedCbtVariantManifest = reviewedCbtVariantManifest,
) {
  const effectiveContent = applyReviewedCbtTheoryAndCanonicalChanges(
    content,
    manifest,
  );
  validateReviewedCbtVariantManifestInternal(effectiveContent, manifest);
}

export function applyReviewedCbtTheoryAndCanonicalChanges(
  content: GeneratedContent,
  manifest: ReviewedCbtVariantManifest = reviewedCbtVariantManifest,
): GeneratedContent {
  const lessonAdditions = manifest.theoryLessonAdditions ?? [];
  const questionChanges = manifest.canonicalQuestionChanges ?? [];
  validateExtensionDigest(
    "theory lesson additions",
    lessonAdditions,
    manifest.theoryLessonAdditionsSha256,
  );
  validateExtensionDigest(
    "canonical question changes",
    questionChanges,
    manifest.canonicalQuestionChangesSha256,
  );
  if (lessonAdditions.length === 0 && questionChanges.length === 0) {
    return content;
  }

  const subjectIds = new Set(content.subjects.map((subject) => subject.id));
  const groupsById = new Map(
    content.conceptGroups.map((group) => [group.id, group]),
  );
  const variantsByExternalId = new Map(
    content.variants.map((variant) => [variant.externalId, variant]),
  );
  const lessons = content.lessons.map((lesson) => ({
    ...lesson,
    summary: [...lesson.summary],
    aliases: [...lesson.aliases],
    blocks: lesson.blocks.map((block) => ({ ...block })),
    relatedQuestionIds: [...lesson.relatedQuestionIds],
  }));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  for (const addition of lessonAdditions) {
    const lesson = addition.lesson;
    if (lessonIds.has(lesson.id)) {
      throw new Error(`Reviewed CBT lesson already exists: ${lesson.id}`);
    }
    const group = groupsById.get(lesson.conceptGroupId);
    if (
      !subjectIds.has(lesson.subjectId) ||
      !group ||
      group.subjectId !== lesson.subjectId ||
      addition.directExternalIds.length === 0 ||
      addition.directExternalIds.some((id) => !variantsByExternalId.has(id)) ||
      !addition.rationale.trim() ||
      lesson.blocks.length === 0 ||
      new Set(lesson.blocks.map((block) => block.id)).size !==
        lesson.blocks.length ||
      lesson.contentStatus === "published" ||
      lesson.publication?.readiness === "ready"
    ) {
      throw new Error(`Reviewed CBT lesson addition is invalid: ${lesson.id}`);
    }
    lessonIds.add(lesson.id);
    lessons.push({
      ...lesson,
      summary: [...lesson.summary],
      aliases: [...lesson.aliases],
      blocks: lesson.blocks.map((block) => ({ ...block })),
      relatedQuestionIds: [...lesson.relatedQuestionIds],
    });
  }

  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const questions = content.questions.map((question) => cloneQuestion(question));
  const questionIndexById = new Map(
    questions.map((question, index) => [question.id, index]),
  );
  const changedQuestionIds = new Set<string>();
  for (const change of questionChanges) {
    validateCanonicalQuestionChange(
      change,
      questions,
      questionIndexById,
      lessonsById,
      groupsById,
      variantsByExternalId,
    );
    const question = cloneQuestion(change.question);
    const existingIndex = questionIndexById.get(question.id);
    if (change.action === "replace" && existingIndex !== undefined) {
      questions[existingIndex] = question;
    } else {
      questionIndexById.set(question.id, questions.length);
      questions.push(question);
    }
    changedQuestionIds.add(question.id);
  }

  const targetLessonByQuestionId = new Map(
    questionChanges.map((change) => [
      change.question.id,
      change.question.lessonId,
    ]),
  );
  const normalizedLessons = lessons.map((lesson) => {
    const related = lesson.relatedQuestionIds.filter(
      (questionId) => !changedQuestionIds.has(questionId),
    );
    for (const [questionId, lessonId] of targetLessonByQuestionId) {
      if (lessonId === lesson.id && !related.includes(questionId)) {
        related.push(questionId);
      }
    }
    return { ...lesson, relatedQuestionIds: related };
  });

  return {
    ...content,
    lessons: normalizedLessons,
    questions,
  };
}

function validateReviewedCbtVariantManifestInternal(
  content: GeneratedContent,
  manifest: ReviewedCbtVariantManifest,
) {
  if (manifest.formatVersion !== 1) {
    throw new Error(
      `Unsupported reviewed CBT variant format: ${manifest.formatVersion}`,
    );
  }
  if (manifest.migrationPolicy.preSubmitAnswerExposureAllowed) {
    throw new Error("Reviewed CBT variants must not expose answers pre-submit.");
  }
  if (
    manifest.migrationPolicy.runtimePublicationRequiresStatus !== "published"
  ) {
    throw new Error("Reviewed CBT variants must require explicit publication.");
  }
  if (!manifest.migrationPolicy.normalizedPresentationPreservesRawSource) {
    throw new Error(
      "Reviewed CBT normalized presentation must preserve raw source text.",
    );
  }
  if (manifest.migrationPolicy.choiceConflictScoringAllowed) {
    throw new Error("Choice-conflict CBT variants must remain non-scoring.");
  }
  if (!manifest.migrationPolicy.imageReviewQueueRequiredForImageHolds) {
    throw new Error("Image-dependent CBT holds require a dedicated queue.");
  }
  if (
    manifest.holdResolutionPolicy.learnerPublicationStillRequiresStatus !==
    "published"
  ) {
    throw new Error(
      "Hold reclassification must not bypass explicit publication approval.",
    );
  }
  const recordsSha256 = sha256(JSON.stringify(manifest.records));
  if (recordsSha256 !== manifest.recordsSha256) {
    throw new Error(
      `Reviewed CBT record digest mismatch: ${recordsSha256} != ${manifest.recordsSha256}`,
    );
  }

  const variantsByExternalId = new Map(
    content.variants.map((variant) => [variant.externalId, variant]),
  );
  const questionsById = new Map(
    content.questions.map((question) => [question.id, question]),
  );
  const lessonsById = new Map(
    content.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const recordsByExternalId = new Map(
    manifest.records.map((record) => [record.externalId, record]),
  );
  validateReviewedCbtExtensionLinks(
    manifest,
    recordsByExternalId,
    questionsById,
    lessonsById,
  );
  const repairedConceptGroupByLessonId = new Map(
    manifest.batches.flatMap((batch) =>
      batch.canonicalTheoryRepairs.map((repair) => {
        const separatorIndex = repair.indexOf(":");
        if (separatorIndex <= 0 || separatorIndex === repair.length - 1) {
          throw new Error(`Invalid reviewed CBT taxonomy repair: ${repair}`);
        }
        return [
          repair.slice(0, separatorIndex),
          repair.slice(separatorIndex + 1),
        ] as const;
      }),
    ),
  );
  const seen = new Set<string>();

  for (const record of manifest.records) {
    if (seen.has(record.externalId)) {
      throw new Error(`Duplicate reviewed CBT variant: ${record.externalId}`);
    }
    seen.add(record.externalId);

    const sourceVariant = variantsByExternalId.get(record.externalId);
    if (!sourceVariant) {
      throw new Error(`Unknown reviewed CBT variant: ${record.externalId}`);
    }
    const canonicalQuestion = questionsById.get(record.canonicalId);
    if (!canonicalQuestion) {
      throw new Error(
        `Reviewed CBT variant ${record.externalId} references missing canonical question ${record.canonicalId}.`,
      );
    }
    if (
      sourceVariant.year !== record.year ||
      sourceVariant.sessionLabel !== record.sessionLabel ||
      sourceVariant.questionNumber !== record.questionNumber
    ) {
      throw new Error(
        `Reviewed CBT variant identity changed: ${record.externalId}`,
      );
    }
    if (
      record.source.questionNumber !== record.questionNumber ||
      record.source.registeredSourceUrl !== sourceVariant.sourceUrl
    ) {
      throw new Error(
        `Reviewed CBT source identity mismatch: ${record.externalId}`,
      );
    }
    if (sha256(record.stem) !== record.source.stemSha256) {
      throw new Error(`Reviewed CBT stem hash mismatch: ${record.externalId}`);
    }
    if (
      sha256(JSON.stringify(record.choices)) !==
      record.source.orderedChoicesSha256
    ) {
      throw new Error(
        `Reviewed CBT ordered-choice hash mismatch: ${record.externalId}`,
      );
    }
    validatePresentationNormalization(record);
    const presentation = getReviewedCbtVariantPresentation(record);
    if (
      record.choiceByChoiceReasons.length !== presentation.choices.length ||
      record.choiceByChoiceReasons.some(
        (choice, index) =>
          choice.choiceIndex !== index ||
          choice.choiceText !== presentation.choices[index],
      )
    ) {
      throw new Error(
        `Reviewed CBT choice feedback is not aligned: ${record.externalId}`,
      );
    }

    if (
      record.review.runtimeStatus === "candidate" ||
      record.review.runtimeStatus === "published"
    ) {
      validateCandidateRecord(
        record,
        canonicalQuestion,
        lessonsById,
        repairedConceptGroupByLessonId,
      );
    } else if (record.review.runtimeStatus === "choice_conflict") {
      validateChoiceConflictRecord(record);
    } else if (record.review.runtimeStatus === "hold") {
      validateHoldRecord(record);
    }
  }

  const declaredCount = manifest.batches.reduce(
    (total, batch) => total + batch.recordCount,
    0,
  );
  const declaredCandidateCount = manifest.batches.reduce(
    (total, batch) => total + batch.candidateCount,
    0,
  );
  const declaredChoiceConflictCount = manifest.batches.reduce(
    (total, batch) => total + batch.choiceConflictCount,
    0,
  );
  const declaredHoldCount = manifest.batches.reduce(
    (total, batch) => total + batch.holdCount,
    0,
  );
  const declaredVariantSpecificFeedbackCount = manifest.batches.reduce(
    (total, batch) => total + (batch.variantSpecificFeedbackCount ?? 0),
    0,
  );
  const actualCandidateCount = manifest.records.filter(
    (record) => record.review.runtimeStatus === "candidate",
  ).length;
  const actualChoiceConflictCount = manifest.records.filter(
    (record) => record.review.runtimeStatus === "choice_conflict",
  ).length;
  const actualHoldCount = manifest.records.filter(
    (record) => record.review.runtimeStatus === "hold",
  ).length;
  const actualVariantSpecificFeedbackCount = manifest.records.filter(
    (record) => record.variantSpecificFeedbackRequired,
  ).length;
  if (declaredCount !== manifest.records.length) {
    throw new Error(
      `Reviewed CBT batch count mismatch: ${declaredCount} != ${manifest.records.length}`,
    );
  }
  if (
    declaredCandidateCount !== actualCandidateCount ||
    declaredChoiceConflictCount !== actualChoiceConflictCount ||
    declaredHoldCount !== actualHoldCount ||
    declaredVariantSpecificFeedbackCount !==
      actualVariantSpecificFeedbackCount
  ) {
    throw new Error(
      `Reviewed CBT state count mismatch: candidate ${declaredCandidateCount}/${actualCandidateCount}, choice_conflict ${declaredChoiceConflictCount}/${actualChoiceConflictCount}, hold ${declaredHoldCount}/${actualHoldCount}, variant_specific ${declaredVariantSpecificFeedbackCount}/${actualVariantSpecificFeedbackCount}`,
    );
  }

  const imageQueueIds = new Set(
    manifest.batches.flatMap(
      (batch) => batch.holdResolution.imageVerificationQueue,
    ),
  );
  const normalizedIds = new Set(
    manifest.batches.flatMap(
      (batch) => batch.holdResolution.normalizedAndRegistered,
    ),
  );
  const conflictIds = new Set(
    manifest.batches.flatMap(
      (batch) => batch.holdResolution.choiceConflictNonScoring,
    ),
  );
  const lowContextIds = new Set(
    manifest.batches.flatMap(
      (batch) => batch.holdResolution.lowContextRegistered,
    ),
  );
  const answerKeyConflictIds = new Set(
    manifest.batches.flatMap(
      (batch) => batch.holdResolution.answerKeyCorrectionPending ?? [],
    ),
  );
  if (
    imageQueueIds.size !== manifest.holdResolutionPolicy.imageVerificationQueueCount ||
    normalizedIds.size !== manifest.holdResolutionPolicy.normalizedAndRegisteredCount ||
    conflictIds.size !== manifest.holdResolutionPolicy.choiceConflictNonScoringCount ||
    lowContextIds.size !== manifest.holdResolutionPolicy.lowContextRegisteredCount
  ) {
    throw new Error("Reviewed CBT hold-resolution exact sets are inconsistent.");
  }
  for (const record of manifest.records) {
    if (
      imageQueueIds.has(record.externalId) !==
      (record.review.runtimeStatus === "hold" &&
        record.review.issueLabel === "필수 이미지 확인")
    ) {
      throw new Error(
        `Reviewed CBT image queue state mismatch: ${record.externalId}`,
      );
    }
    if (
      answerKeyConflictIds.has(record.externalId) !==
      (record.review.runtimeStatus === "hold" &&
        record.review.issueLabel === "정답키 충돌")
    ) {
      throw new Error(
        `Reviewed CBT answer-key queue state mismatch: ${record.externalId}`,
      );
    }
    if (
      normalizedIds.has(record.externalId) !==
      Boolean(record.presentationNormalization)
    ) {
      throw new Error(
        `Reviewed CBT normalization set mismatch: ${record.externalId}`,
      );
    }
    if (
      conflictIds.has(record.externalId) !==
      (record.review.runtimeStatus === "choice_conflict")
    ) {
      throw new Error(
        `Reviewed CBT conflict set mismatch: ${record.externalId}`,
      );
    }
    if (
      lowContextIds.has(record.externalId) &&
      record.review.runtimeStatus !== "candidate"
    ) {
      throw new Error(
        `Reviewed CBT low-context record is not registered: ${record.externalId}`,
      );
    }
  }
}

function validateReviewedCbtExtensionLinks(
  manifest: ReviewedCbtVariantManifest,
  recordsByExternalId: Map<string, ReviewedCbtVariantRecord>,
  questionsById: Map<string, GeneratedContent["questions"][number]>,
  lessonsById: Map<string, GeneratedContent["lessons"][number]>,
) {
  const lessonAdditions = manifest.theoryLessonAdditions ?? [];
  const questionChanges = manifest.canonicalQuestionChanges ?? [];
  const declaredLessonIds = manifest.batches.flatMap(
    (batch) => batch.theoryLessonAdditionIds ?? [],
  );
  const actualLessonIds = lessonAdditions.map((addition) => addition.lesson.id);
  const declaredQuestionIds = manifest.batches.flatMap(
    (batch) => batch.canonicalQuestionChangeIds ?? [],
  );
  const actualQuestionIds = questionChanges.map(
    (change) => change.question.id,
  );
  if (
    !sameStringSet(declaredLessonIds, actualLessonIds) ||
    !sameStringSet(declaredQuestionIds, actualQuestionIds)
  ) {
    throw new Error(
      "Reviewed CBT extension declarations do not match the manifest payload.",
    );
  }

  for (const addition of lessonAdditions) {
    const lesson = lessonsById.get(addition.lesson.id);
    if (
      !lesson ||
      new Set(addition.directExternalIds).size !==
        addition.directExternalIds.length ||
      new Set(lesson.relatedQuestionIds).size !==
        lesson.relatedQuestionIds.length ||
      lesson.relatedQuestionIds.some((id) => !questionsById.has(id))
    ) {
      throw new Error(
        `Reviewed CBT direct-theory lesson is invalid: ${addition.lesson.id}`,
      );
    }
    for (const externalId of addition.directExternalIds) {
      const record = recordsByExternalId.get(externalId);
      if (
        !record?.theoryLink ||
        record.theoryLink.lessonId !== lesson.id ||
        record.theoryLink.conceptId !== lesson.conceptId ||
        record.theoryLink.conceptGroupId !== lesson.conceptGroupId ||
        !lesson.blocks.some(
          (block) => block.id === record.theoryLink?.lessonAnchor,
        )
      ) {
        throw new Error(
          `Reviewed CBT direct-theory link is inconsistent: ${externalId}`,
        );
      }
    }
  }

  for (const change of questionChanges) {
    const question = questionsById.get(change.question.id);
    if (!question) {
      throw new Error(
        `Reviewed CBT canonical overlay is missing: ${change.question.id}`,
      );
    }
    for (const externalId of change.affectedExternalIds) {
      const record = recordsByExternalId.get(externalId);
      if (
        !record ||
        record.canonicalId !== question.id ||
        (record.review.runtimeStatus !== "hold" &&
          record.theoryLink?.lessonId !== question.lessonId)
      ) {
        throw new Error(
          `Reviewed CBT canonical overlay link is inconsistent: ${externalId}`,
        );
      }
    }
  }
}

function sameStringSet(left: string[], right: string[]) {
  if (
    left.length !== right.length ||
    new Set(left).size !== left.length ||
    new Set(right).size !== right.length
  ) {
    return false;
  }
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function validatePresentationNormalization(record: ReviewedCbtVariantRecord) {
  const normalization = record.presentationNormalization;
  if (!normalization) return;
  if (
    !normalization.applied ||
    normalization.authority !== "user_approved_minimal_normalization" ||
    !normalization.sourceTextPreserved ||
    normalization.rawStem !== record.stem ||
    JSON.stringify(normalization.rawChoices) !== JSON.stringify(record.choices) ||
    normalization.rawStemSha256 !== record.source.stemSha256 ||
    normalization.rawOrderedChoicesSha256 !==
      record.source.orderedChoicesSha256 ||
    sha256(normalization.rawStem) !== normalization.rawStemSha256 ||
    sha256(JSON.stringify(normalization.rawChoices)) !==
      normalization.rawOrderedChoicesSha256 ||
    !normalization.normalizedStem.trim() ||
    normalization.normalizedChoices.length !== record.choices.length ||
    normalization.normalizedChoices.some((choice) => !choice.trim()) ||
    sha256(normalization.normalizedStem) !==
      normalization.normalizedStemSha256 ||
    sha256(JSON.stringify(normalization.normalizedChoices)) !==
      normalization.normalizedOrderedChoicesSha256 ||
    normalization.reasonCodes.length === 0 ||
    !normalization.note.trim()
  ) {
    throw new Error(
      `Reviewed CBT normalization is invalid: ${record.externalId}`,
    );
  }
}

function validateCandidateRecord(
  record: ReviewedCbtVariantRecord,
  canonicalQuestion: GeneratedContent["questions"][number],
  lessonsById: Map<string, GeneratedContent["lessons"][number]>,
  repairedConceptGroupByLessonId: Map<string, string>,
) {
  const presentation = getReviewedCbtVariantPresentation(record);
  const answerIndex = record.reviewedAnswerIndex;
  if (
    answerIndex === null ||
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex >= presentation.choices.length
  ) {
    throw new Error(
      `Reviewed CBT candidate has no valid answer: ${record.externalId}`,
    );
  }
  if (record.variantSpecificFeedbackRequired) {
    if (
      record.review.runtimeStatus === "published" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes(
        "variant_specific_choice_contract_pending",
      )
    ) {
      throw new Error(
        `Reviewed CBT variant-specific choice contract is invalid: ${record.externalId}`,
      );
    }
  } else {
    if (
      record.choiceIdMapping.length !== presentation.choices.length ||
      new Set(record.choiceIdMapping).size !== record.choiceIdMapping.length
    ) {
      throw new Error(
        `Reviewed CBT candidate choice mapping is invalid: ${record.externalId}`,
      );
    }
    const canonicalChoiceIds = new Set(
      canonicalQuestion.choices.map((choice) => choice.id),
    );
    if (
      record.choiceIdMapping.some(
        (choiceId) => !canonicalChoiceIds.has(choiceId),
      )
    ) {
      throw new Error(
        `Reviewed CBT candidate maps outside canonical choices: ${record.externalId}`,
      );
    }
    if (
      record.choiceIdMapping[answerIndex] !== canonicalQuestion.correctChoiceId
    ) {
      throw new Error(
        `Reviewed CBT candidate answer mapping is invalid: ${record.externalId}`,
      );
    }
  }
  const answerSymbol = ["①", "②", "③", "④", "⑤"][answerIndex];
  if (
    !answerSymbol ||
    record.reviewedAnswerText !==
      `${answerSymbol} ${presentation.choices[answerIndex]}`
  ) {
    throw new Error(
      `Reviewed CBT candidate answer text is invalid: ${record.externalId}`,
    );
  }
  if (!record.directSolution.trim()) {
    throw new Error(
      `Reviewed CBT candidate has no direct solution: ${record.externalId}`,
    );
  }
  const theoryLink = record.theoryLink;
  if (!theoryLink) {
    throw new Error(
      `Reviewed CBT candidate has no theory link: ${record.externalId}`,
    );
  }
  const lesson = lessonsById.get(theoryLink.lessonId);
  if (
    theoryLink.canonicalId !== record.canonicalId ||
    canonicalQuestion.lessonId !== theoryLink.lessonId ||
    canonicalQuestion.lessonAnchor !== theoryLink.lessonAnchor ||
    canonicalQuestion.conceptId !== theoryLink.conceptId ||
    canonicalQuestion.conceptGroupId !== theoryLink.conceptGroupId
  ) {
    throw new Error(
      `Reviewed CBT candidate canonical/theory link is inconsistent: ${record.externalId}`,
    );
  }
  if (
    !lesson ||
    lesson.conceptId !== theoryLink.conceptId ||
    !lesson.blocks.some((block) => block.id === theoryLink.lessonAnchor)
  ) {
    throw new Error(
      `Reviewed CBT candidate theory link is invalid: ${record.externalId}`,
    );
  }
  const effectiveLessonConceptGroupId =
    repairedConceptGroupByLessonId.get(lesson.id) ?? lesson.conceptGroupId;
  if (effectiveLessonConceptGroupId !== theoryLink.conceptGroupId) {
    throw new Error(
      `Reviewed CBT candidate theory group is invalid: ${record.externalId}`,
    );
  }
}

function validateHoldRecord(record: ReviewedCbtVariantRecord) {
  if (record.review.issueLabel === "필수 이미지 확인") {
    validateImageHoldRecord(record);
    return;
  }
  if (record.review.issueLabel === "정답키 충돌") {
    validateAnswerKeyConflictHoldRecord(record);
    return;
  }
  throw new Error(`Reviewed CBT hold type is invalid: ${record.externalId}`);
}

function validateImageHoldRecord(record: ReviewedCbtVariantRecord) {
  if (
    record.review.verdict !== "HOLD" ||
    record.review.scoringDisposition !== "excluded_required_image" ||
    record.reviewedAnswerIndex !== null ||
    record.reviewedAnswerText !== "" ||
    record.choiceIdMapping.length > 0 ||
    !record.review.publicationBlockers.includes(
      "required_source_image_review",
    ) ||
    record.review.holdReasons.length === 0
  ) {
    throw new Error(`Reviewed CBT image hold is invalid: ${record.externalId}`);
  }
}

function validateAnswerKeyConflictHoldRecord(
  record: ReviewedCbtVariantRecord,
) {
  if (
    record.review.verdict !== "REVISE" ||
    record.review.scoringDisposition !== "excluded_answer_key_conflict" ||
    record.review.sourceAnswerAgreement !== "disagrees" ||
    record.reviewedAnswerIndex !== null ||
    record.reviewedAnswerText !== "" ||
    record.choiceIdMapping.length > 0 ||
    !record.review.publicationBlockers.includes(
      "answer_key_correction_pending_runtime_validation",
    ) ||
    record.review.holdReasons.length === 0 ||
    record.migration.mappingClass !== "ANSWER_KEY_CONFLICT_HOLD" ||
    record.migration.runtimeDisposition !== "ANSWER_KEY_CORRECTION_QUEUE"
  ) {
    throw new Error(
      `Reviewed CBT answer-key conflict hold is invalid: ${record.externalId}`,
    );
  }
}

function validateChoiceConflictRecord(record: ReviewedCbtVariantRecord) {
  const conflict = record.choiceConflict;
  if (
    record.review.verdict !== "CHOICE_ISSUE" ||
    record.review.issueLabel !== "선택지 충돌" ||
    record.review.scoringDisposition !== "non_scoring_choice_conflict" ||
    record.reviewedAnswerIndex !== null ||
    record.reviewedAnswerText !== "" ||
    record.choiceIdMapping.length > 0 ||
    !record.directSolution.startsWith("선택지 충돌:") ||
    !conflict ||
    conflict.label !== "선택지 충돌" ||
    conflict.scoringPolicy !== "non_scoring" ||
    conflict.choiceIndices.length < 2 ||
    new Set(conflict.choiceIndices).size !== conflict.choiceIndices.length ||
    conflict.choiceIndices.some(
      (index) =>
        !Number.isInteger(index) || index < 0 || index >= record.choices.length,
    ) ||
    !conflict.reason.trim() ||
    !conflict.sourceAnswerTreatment.trim()
  ) {
    throw new Error(
      `Reviewed CBT choice conflict is invalid: ${record.externalId}`,
    );
  }
}

function buildReviewStatus(record: ReviewedCbtVariantRecord) {
  switch (record.review.runtimeStatus) {
    case "candidate":
      if (record.variantSpecificFeedbackRequired) {
        return "독립 검수 완료 · variant 전용 선택지 계약 대기";
      }
      return record.presentationNormalization
        ? "원문 정규화 검수 완료 · 런타임 통합 대기"
        : `독립 검수 ${record.review.verdict} · 런타임 통합 대기`;
    case "published":
      return `독립 검수 ${record.review.verdict} · 공개 승인`;
    case "choice_conflict":
      return "선택지 충돌 · 비채점 등록";
    case "hold":
      return `${record.review.issueLabel ?? `독립 검수 ${record.review.verdict}`} · 공개/채점 보류`;
  }
}

function buildVerificationNote(record: ReviewedCbtVariantRecord) {
  const status = record.review.runtimeStatus;
  return [
    `sourceText=${record.source.textAuthority}`,
    `capture=${record.source.captureAuthority}`,
    `stemSha256=${record.source.stemSha256}`,
    `orderedChoicesSha256=${record.source.orderedChoicesSha256}`,
    `runtimeStatus=${status}`,
    ...(record.presentationNormalization
      ? [
          "presentationNormalization=applied",
          `rawStemSha256=${record.presentationNormalization.rawStemSha256}`,
          `rawOrderedChoicesSha256=${record.presentationNormalization.rawOrderedChoicesSha256}`,
          `normalizedStemSha256=${record.presentationNormalization.normalizedStemSha256}`,
          `normalizedOrderedChoicesSha256=${record.presentationNormalization.normalizedOrderedChoicesSha256}`,
        ]
      : []),
    ...(record.choiceConflict ? ["choiceConflict=non_scoring"] : []),
    ...(record.variantSpecificFeedbackRequired
      ? ["variantSpecificFeedbackRequired=true"]
      : []),
    ...(record.review.issueLabel
      ? [`issueLabel=${record.review.issueLabel}`]
      : []),
  ].join("; ");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validateExtensionDigest(
  label: string,
  value: unknown[],
  expectedDigest: string | undefined,
) {
  if (value.length === 0 && expectedDigest === undefined) return;
  const actualDigest = sha256(JSON.stringify(value));
  if (!expectedDigest || actualDigest !== expectedDigest) {
    throw new Error(
      `Reviewed CBT ${label} digest mismatch: ${actualDigest} != ${expectedDigest ?? "missing"}`,
    );
  }
}

function validateCanonicalQuestionChange(
  change: ReviewedCbtCanonicalQuestionChange,
  questions: GeneratedContent["questions"],
  questionIndexById: Map<string, number>,
  lessonsById: Map<string, GeneratedContent["lessons"][number]>,
  groupsById: Map<string, GeneratedContent["conceptGroups"][number]>,
  variantsByExternalId: Map<
    string,
    GeneratedContent["variants"][number]
  >,
) {
  const question = change.question;
  const existingIndex = questionIndexById.get(question.id);
  const existing =
    existingIndex === undefined ? undefined : questions[existingIndex];
  if (
    (change.action === "add" && existing) ||
    (change.action === "replace" && !existing) ||
    change.affectedExternalIds.length === 0 ||
    change.affectedExternalIds.some((id) => !variantsByExternalId.has(id)) ||
    !change.rationale.trim()
  ) {
    throw new Error(
      `Reviewed CBT canonical change identity is invalid: ${question.id}`,
    );
  }
  if (change.action === "replace") {
    const actualDigest = sha256(JSON.stringify(existing));
    if (
      !change.previousQuestionSha256 ||
      actualDigest !== change.previousQuestionSha256
    ) {
      throw new Error(
        `Reviewed CBT canonical replacement digest mismatch: ${question.id}`,
      );
    }
  } else if (change.previousQuestionSha256 !== null) {
    throw new Error(
      `Reviewed CBT canonical addition must not declare a previous digest: ${question.id}`,
    );
  }
  validateCanonicalQuestionReviewContract(question);
  const lesson = lessonsById.get(question.lessonId);
  const group = groupsById.get(question.conceptGroupId);
  const choiceIds = question.choices.map((choice) => choice.id);
  if (
    !lesson ||
    !group ||
    lesson.subjectId !== question.subjectId ||
    lesson.conceptGroupId !== question.conceptGroupId ||
    lesson.conceptId !== question.conceptId ||
    !lesson.blocks.some((block) => block.id === question.lessonAnchor) ||
    question.choices.length < 2 ||
    new Set(choiceIds).size !== choiceIds.length ||
    !choiceIds.includes(question.correctChoiceId) ||
    question.contentStatus === "published" ||
    question.publication?.readiness === "ready"
  ) {
    throw new Error(
      `Reviewed CBT canonical question change is invalid: ${question.id}`,
    );
  }
}


function validateCanonicalQuestionReviewContract(
  question: GeneratedContent["questions"][number],
) {
  const publicationBlockers = new Set<string>(PUBLICATION_BLOCKERS);
  const verificationMethods = new Set<string>(QUESTION_VERIFICATION_METHODS);
  const verificationRiskTags = new Set<string>(VERIFICATION_RISK_TAGS);
  const auditDispositions = new Set<string>(AUDIT_DISPOSITIONS);

  const publication = question.publication;
  if (
    !publication ||
    !["ready", "review", "blocked"].includes(publication.readiness) ||
    publication.blockers.some((blocker) => !publicationBlockers.has(blocker))
  ) {
    throw new Error(
      `Reviewed CBT canonical publication contract is invalid: ${question.id}`,
    );
  }

  const verification = question.verification;
  if (
    !verification ||
    !["verified", "blocked"].includes(verification.status) ||
    !verificationMethods.has(verification.method) ||
    !Number.isInteger(verification.variantCount) ||
    verification.variantCount < 0 ||
    verification.sourceUrls.some((url) => !url.trim()) ||
    verification.riskTags.some((tag) => !verificationRiskTags.has(tag)) ||
    !verification.note.trim() ||
    !verification.reviewedAt.trim()
  ) {
    throw new Error(
      `Reviewed CBT canonical verification contract is invalid: ${question.id}`,
    );
  }

  const audit = question.audit;
  if (!audit) return;
  if (
    audit.questionId !== question.id ||
    !auditDispositions.has(audit.auditDisposition) ||
    !audit.reviewNote.trim() ||
    !audit.nextAction.trim()
  ) {
    throw new Error(
      `Reviewed CBT canonical audit contract is invalid: ${question.id}`,
    );
  }

  const feedback = audit.reviewChoiceFeedback;
  if (!feedback) return;
  const choiceIds = new Set(question.choices.map((choice) => choice.id));
  const feedbackIds = feedback.map((item) => item.choiceId);
  const correct = feedback.filter((item) => item.verdict === "correct");
  if (
    feedback.length !== question.choices.length ||
    new Set(feedbackIds).size !== feedbackIds.length ||
    feedback.some(
      (item) =>
        !choiceIds.has(item.choiceId) ||
        !["correct", "incorrect"].includes(item.verdict) ||
        !item.rationale.trim(),
    ) ||
    correct.length !== 1 ||
    correct[0]?.choiceId !== question.correctChoiceId
  ) {
    throw new Error(
      `Reviewed CBT canonical audit feedback is invalid: ${question.id}`,
    );
  }
}

function cloneQuestion(
  question: GeneratedContent["questions"][number],
): GeneratedContent["questions"][number] {
  return {
    ...question,
    choices: question.choices.map((choice) => ({
      ...choice,
      feedback: { ...choice.feedback },
    })),
    publication: question.publication
      ? {
          ...question.publication,
          blockers: [...question.publication.blockers],
        }
      : undefined,
    verification: question.verification
      ? {
          ...question.verification,
          sourceUrls: [...question.verification.sourceUrls],
          riskTags: [...question.verification.riskTags],
        }
      : undefined,
    audit: question.audit
      ? {
          ...question.audit,
          evidenceUrls: [...question.audit.evidenceUrls],
          reviewChoiceFeedback: question.audit.reviewChoiceFeedback?.map(
            (feedback) => ({ ...feedback }),
          ),
        }
      : undefined,
    validation: { ...question.validation },
  };
}
