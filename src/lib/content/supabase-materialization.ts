import { createHash } from "node:crypto";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const UUID_NAMESPACE = "74aa78a5-e855-4f47-bfd4-1a954279e87c";

type ContentStatus = "draft" | "published";

export type SupabaseMaterializationPlan = ReturnType<
  typeof buildSupabaseMaterialization
>;

function uuidBytes(value: string) {
  return Buffer.from(value.replaceAll("-", ""), "hex");
}

export function stableContentUuid(scope: string, externalId: string) {
  const digest = createHash("sha1")
    .update(uuidBytes(UUID_NAMESPACE))
    .update(`${scope}\u0000${externalId}`, "utf8")
    .digest()
    .subarray(0, 16);
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = digest.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function status(value: boolean): ContentStatus {
  return value ? "published" : "draft";
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} contains duplicate stable identities.`);
  }
}

export function buildSupabaseMaterialization(
  content: GeneratedContent,
  examTrackId: string,
) {
  const examModeId = stableContentUuid(
    "exam-mode",
    "facility-maintenance-engineer-current:written",
  );
  const syllabusVersionId = stableContentUuid(
    "syllabus-version",
    "facility-maintenance-engineer-current:written-current",
  );
  const subjectIds = new Map(
    content.subjects.map((subject) => [
      subject.id,
      stableContentUuid("subject", subject.id),
    ]),
  );
  const groupIds = new Map(
    content.conceptGroups.map((group) => [
      group.id,
      stableContentUuid("concept-group", group.id),
    ]),
  );
  const lessonsByConceptId = new Map(
    content.lessons.map((lesson) => [lesson.conceptId, lesson]),
  );
  const publishableQuestionIds = new Set(
    content.questions
      .filter(isPublishableQuestion)
      .map((question) => question.id),
  );
  const conceptSource = new Map<
    string,
    {
      conceptGroupId: string;
      canonicalName: string;
      definition: string;
      published: boolean;
    }
  >();

  for (const question of content.questions) {
    const lesson = lessonsByConceptId.get(question.conceptId);
    if (!lesson) {
      throw new Error(
        `Question ${question.id} references missing concept lesson ${question.conceptId}.`,
      );
    }
    const existing = conceptSource.get(question.conceptId);
    if (
      existing &&
      (existing.conceptGroupId !== question.conceptGroupId ||
        existing.canonicalName !== lesson.title)
    ) {
      throw new Error(`Concept ${question.conceptId} has conflicting taxonomy.`);
    }
    const definition =
      lesson.blocks.find((block) => block.kind === "definition")?.body ??
      lesson.summary.join("\n");
    conceptSource.set(question.conceptId, {
      conceptGroupId: question.conceptGroupId,
      canonicalName: lesson.title,
      definition,
      published:
        lesson.contentStatus === "published" &&
        !lesson.sourceNeeded &&
        lesson.quality.passed,
    });
  }

  const conceptIds = new Map(
    [...conceptSource.keys()].map((conceptId) => [
      conceptId,
      stableContentUuid("concept", conceptId),
    ]),
  );
  const questionIds = new Map(
    content.questions.map((question) => [
      question.id,
      stableContentUuid("question", question.id),
    ]),
  );
  const choiceIds = new Map(
    content.questions.flatMap((question) =>
      question.choices.map((choice) => [
        choice.id,
        stableContentUuid("choice", choice.id),
      ] as const),
    ),
  );

  const subjects = content.subjects.map((subject) => ({
    id: subjectIds.get(subject.id)!,
    syllabus_version_id: syllabusVersionId,
    code: subject.code,
    title: subject.title,
    short_title: subject.shortTitle,
    description: subject.description,
    sort_order: subject.code,
    status: "published" as const,
  }));
  const conceptGroups = content.conceptGroups.map((group) => ({
    id: groupIds.get(group.id)!,
    subject_id: subjectIds.get(group.subjectId)!,
    chapter_id: null,
    external_key: group.id,
    title: group.title,
    keywords: group.keywords,
    sort_order: group.order,
    status: "published" as const,
  }));
  const concepts = [...conceptSource.entries()].map(
    ([externalId, concept]) => ({
      id: conceptIds.get(externalId)!,
      concept_group_id: groupIds.get(concept.conceptGroupId)!,
      canonical_name: concept.canonicalName,
      definition: concept.definition,
      status: status(concept.published),
    }),
  );
  const questions = content.questions.map((question) => {
    const published = publishableQuestionIds.has(question.id);
    return {
      id: questionIds.get(question.id)!,
      external_id: question.id,
      exam_track_id: examTrackId,
      exam_mode_id: examModeId,
      subject_id: subjectIds.get(question.subjectId)!,
      stem: question.stem,
      // Explanations remain in the server runtime and private answer tables.
      // The public questions RLS policy grants row access, not column masking.
      explanation: "",
      source_label: question.sourceLabel,
      review_status_raw: question.reviewStatus,
      status: status(published),
      answer_validated: question.validation.answer,
      explanation_validated: question.validation.explanation,
      choice_feedback_validated: question.validation.choiceFeedback,
      theory_link_validated:
        question.validation.theoryLink &&
        question.validation.contentQuality,
    };
  });
  const choices = content.questions.flatMap((question) =>
    question.choices.map((choice) => ({
      id: choiceIds.get(choice.id)!,
      external_id: choice.id,
      question_id: questionIds.get(question.id)!,
      label: String(choice.order),
      body: choice.text,
      sort_order: choice.order,
    })),
  );
  const choiceFeedback = content.questions.flatMap((question) =>
    question.choices.map((choice) => ({
      choice_id: choiceIds.get(choice.id)!,
      rationale: choice.feedback.rationale,
      plausible_reason: choice.feedback.plausibleReason,
      incorrect_point: choice.feedback.incorrectPoint,
      key_rule: choice.feedback.keyRule,
      difference_from_correct: choice.feedback.differenceFromCorrect,
      validated: question.validation.choiceFeedback,
      validated_at: question.validation.choiceFeedback
        ? question.verification?.reviewedAt ?? null
        : null,
    })),
  );
  const answerKeys = content.questions.map((question) => {
    const correctChoiceId = choiceIds.get(question.correctChoiceId);
    if (!correctChoiceId) {
      throw new Error(
        `Question ${question.id} has an unknown correct choice ${question.correctChoiceId}.`,
      );
    }
    return {
      question_id: questionIds.get(question.id)!,
      correct_choice_id: correctChoiceId,
      answer_text: question.answerText,
      rationale: question.explanation,
      validated: question.validation.answer,
      validated_at: question.validation.answer
        ? question.verification?.reviewedAt ?? null
        : null,
    };
  });
  const questionConcepts = content.questions.map((question) => ({
    question_id: questionIds.get(question.id)!,
    concept_id: conceptIds.get(question.conceptId)!,
    role: "primary" as const,
    lesson_anchor: question.lessonAnchor,
  }));
  const questionVariants = content.variants.map((variant) => {
    const canonicalQuestionId = questionIds.get(variant.canonicalId);
    if (!canonicalQuestionId) {
      throw new Error(
        `Variant ${variant.externalId} references missing question ${variant.canonicalId}.`,
      );
    }
    const reviewedPublicationAllowed =
      variant.reviewState === undefined
        ? true
        : variant.reviewState === "published";
    const published = variant.reviewed
      ? reviewedPublicationAllowed
      : publishableQuestionIds.has(variant.canonicalId);
    const reviewedPayload = variant.reviewed
      ? {
          reviewState: variant.reviewState,
          reviewVerdict: variant.reviewed.review.verdict,
          issueLabel: variant.reviewed.review.issueLabel ?? null,
          normalizationApplied: Boolean(
            variant.reviewed.presentationNormalization,
          ),
          choiceConflict: variant.reviewState === "choice_conflict",
          choices: variant.choices,
          variantSpecificFeedbackRequired: Boolean(
            variant.reviewed.variantSpecificFeedbackRequired,
          ),
          choiceContractReady: variant.reviewState === "published",
          sourceTextAuthority:
            variant.reviewed.source.textAuthority,
          sourceCaptureAuthority:
            variant.reviewed.source.captureAuthority,
          sourceDisplayLabel: variant.reviewed.source.displayLabel,
          resolvedSourceUrl:
            variant.reviewed.source.resolvedSourceUrl,
          stemSha256: variant.reviewed.source.stemSha256,
          orderedChoicesSha256:
            variant.reviewed.source.orderedChoicesSha256,
        }
      : null;
    return {
      id: stableContentUuid("question-variant", variant.externalId),
      canonical_question_id: canonicalQuestionId,
      external_id: variant.externalId,
      year: variant.year,
      session_label: variant.sessionLabel,
      question_number: variant.questionNumber,
      original_stem: variant.stem,
      payload: {
        relationship: variant.relationship,
        subjectCode: variant.subjectCode,
        conceptAlias: variant.conceptAlias,
        ...(reviewedPayload ? { reviewed: reviewedPayload } : {}),
      },
      source_id: null,
      verification_note: variant.reviewed
        ? variant.verificationNote
        : "",
      status: status(published),
      shuffle_policy: variant.shufflePolicy ?? "all",
    };
  });

  assertUnique(questions.map((row) => row.external_id), "questions");
  assertUnique(choices.map((row) => row.external_id), "choices");
  assertUnique(
    questionVariants.map((row) => row.external_id),
    "question variants",
  );
  assertUnique(
    concepts.map(
      (row) => `${row.concept_group_id}\u0000${row.canonical_name}`,
    ),
    "concepts",
  );

  const digest = createHash("sha256")
    .update(
      JSON.stringify({
        examTrackId,
        subjects,
        conceptGroups,
        concepts,
        questions,
        choices,
        answerKeys,
        questionConcepts,
        questionVariants,
      }),
    )
    .digest("hex");

  return {
    identity: {
      examTrackId,
      examModeId,
      syllabusVersionId,
    },
    examModes: [
      {
        id: examModeId,
        exam_track_id: examTrackId,
        code: "written",
        title: "필기",
        status: "published" as const,
      },
    ],
    syllabusVersions: [
      {
        id: syllabusVersionId,
        exam_track_id: examTrackId,
        title: "설비보전기사 필기 통합본",
        effective_from: null,
        effective_to: null,
        source_url: null,
        status: "published" as const,
      },
    ],
    subjects,
    conceptGroups,
    concepts,
    questions,
    choices,
    choiceFeedback,
    answerKeys,
    questionConcepts,
    questionVariants,
    digest,
    counts: {
      subjects: subjects.length,
      conceptGroups: conceptGroups.length,
      concepts: concepts.length,
      questions: questions.length,
      publishedQuestions: questions.filter(
        (row) => row.status === "published",
      ).length,
      choices: choices.length,
      publishedChoices: content.questions
        .filter((question) => publishableQuestionIds.has(question.id))
        .reduce((total, question) => total + question.choices.length, 0),
      choiceFeedback: choiceFeedback.length,
      answerKeys: answerKeys.length,
      questionConcepts: questionConcepts.length,
      questionVariants: questionVariants.length,
      publishedQuestionVariants: questionVariants.filter(
        (row) => row.status === "published",
      ).length,
    },
  };
}
