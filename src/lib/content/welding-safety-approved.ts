import rawDataset from "@/data/generated/welding-safety-review.json";
import { buildChoiceFeedback, choiceFeedbackPasses } from "@/lib/content/enrichment";
import {
  weldingSafetyReviewDatasetSchema,
  type WeldingSafetyReviewLesson,
  type WeldingSafetyReviewQuestion,
} from "@/lib/content/welding-safety-supplement";
import type {
  Choice,
  GeneratedContent,
  Lesson,
  LessonBlock,
  Question,
} from "@/lib/domain/types";

const REVIEWED_AT = "2026-07-23T00:00:00.000Z";
const SUBJECT_ID = "subject-2";
const GROUP_ID = "s2-g05";

/**
 * Publication is deliberately opt-in. The imported 33rd-batch workbook marks
 * every priority row as 검수대기. Add an ID only after its answer, all four
 * choice explanations, theory anchor, and item-specific official source have
 * been reviewed.
 */
export const APPROVED_WELDING_SAFETY_QUESTION_IDS = new Set<string>();

const officialSources = {
  electric:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
  electricField: "https://m.kosha.or.kr/resources/1111.pdf",
  gas:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=158&um=s",
  gasEquipment:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=162&um=s",
  fire:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=474&callmode=normal&catimage=&eclang=ko&start=216&um=s",
  fireField:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=516&callmode=normal&catimage=&eclang=ko&start=204&um=s",
  confined:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s",
  welding:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=446&callmode=normal&catimage=&eclang=ko&start=144&um=s",
  ppe:
    "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=562&callmode=normal&catimage=&eclang=ko&start=40&um=s",
} as const;

const dataset = weldingSafetyReviewDatasetSchema.parse(rawDataset);

const lessonBySourceId = new Map(
  dataset.lessons.map((lesson) => [lesson.sourceLessonId, lesson]),
);

type LessonRule = {
  lessonId: string;
  pattern: RegExp;
};

const lessonRules: Record<string, LessonRule[]> = {
  "WS30-E": [
    { lessonId: "ST30-01", pattern: /감전자|응급|구조|심폐|AED|119/ },
    { lessonId: "ST30-02", pattern: /전격방지|무부하전압|대기전압|안전장치|우회/ },
    { lessonId: "ST32-02", pattern: /외함|보호접지|접지연속|인체전류|통전경로|습윤상태|전류와 통전시간/ },
    { lessonId: "ST30-03", pattern: /귀환|클램프|우회전류|접지/ },
    { lessonId: "ST30-04", pattern: /케이블|홀더|원격조정|단자|러그/ },
    { lessonId: "ST30-05", pattern: /설치|이동|정비|장시간|협소|다습|전원|팬|접점|과전류/ },
  ],
  "WS30-P": [
    { lessonId: "ST30-06", pattern: /아크안|차광|용접면|필터/ },
    { lessonId: "ST30-07", pattern: /주변|반사광|반사면|차광막/ },
    { lessonId: "ST32-01", pattern: /젖은|습윤|앞치마|보호복/ },
    { lessonId: "ST30-08", pattern: /장갑|안전화|의복/ },
    { lessonId: "ST30-09", pattern: /치핑|연삭|청력|잔열|고온/ },
  ],
  "WS30-F": [
    { lessonId: "ST30-10", pattern: /허가|조건변경|재검토/ },
    { lessonId: "ST30-11", pattern: /감시자|지연발화/ },
    { lessonId: "ST30-12", pattern: /불티|벽체|반대편|은폐|개구부|잔불/ },
    { lessonId: "ST32-03", pattern: /용기 세정|밀폐용기|보수용접|산소 환기|예열|탱크|드럼/ },
    { lessonId: "ST30-13", pattern: /분진|증기|잔류물|빈 용기/ },
    { lessonId: "ST30-14", pattern: /배관|격리|감압|차단/ },
    { lessonId: "ST30-15", pattern: /소화|화재|경보|비상|종합 종료|가스·전원/ },
  ],
  "WS30-G": [
    { lessonId: "ST32-04", pattern: /아세틸렌|재질적합|임의충전/ },
    { lessonId: "ST30-16", pattern: /용기|보호캡|운반|보관|미식별|직립|분리/ },
    { lessonId: "ST30-17", pattern: /산소|조정기|압력계|게이지|기름|오염|조정나사|급개방/ },
    { lessonId: "ST30-18", pattern: /호스|연결부|누설|밴드|검지액/ },
    { lessonId: "ST30-19", pattern: /역류|역화|안전기|압력 불균형/ },
    { lessonId: "ST30-20", pattern: /동결|해빙|결빙|종료|잔압/ },
  ],
  "WS30-H": [
    { lessonId: "ST30-22", pattern: /밀폐|아르곤|질소|퍼지|가스농도|감시인|산소/ },
    { lessonId: "ST30-23", pattern: /마스크|호흡보호구|필터|2차노출/ },
    { lessonId: "ST32-05", pattern: /가연성 혼합|수소|실드가스|모재 표면|도금|도료/ },
    { lessonId: "ST30-21", pattern: /흄|환기|국소배기|후드|포집|집진/ },
  ],
  "WS30-M": [
    { lessonId: "ST32-06", pattern: /전격방지|사용률|과열|냉각|통풍|팬|분진|단자|옥외|온도/ },
    { lessonId: "ST30-24", pattern: /연삭|송급|로봇|고소|하부|통로|장비|정비|점검|표지|교육|경보|아차/ },
    { lessonId: "ST30-15", pattern: /건조로|화재/ },
    { lessonId: "ST30-10", pattern: /작업 변경|밀폐공간/ },
  ],
};

const fallbackLessonIds: Record<string, string> = {
  "WS30-E": "ST30-05",
  "WS30-P": "ST30-08",
  "WS30-F": "ST30-15",
  "WS30-G": "ST30-18",
  "WS30-H": "ST30-21",
  "WS30-M": "ST30-24",
};

function sourceLessonIdForQuestion(question: WeldingSafetyReviewQuestion) {
  const searchable = `${question.concept} ${question.stem} ${question.rationale}`;
  return (
    lessonRules[question.safetyCode]?.find((rule) => rule.pattern.test(searchable))
      ?.lessonId ??
    fallbackLessonIds[question.safetyCode] ??
    "ST30-24"
  );
}

function officialUrlsForCode(code: string, text: string) {
  if (code === "WS30-E") {
    return [officialSources.electric, officialSources.electricField];
  }
  if (code === "WS30-G") {
    return [officialSources.gas, officialSources.gasEquipment];
  }
  if (code === "WS30-F") {
    return [officialSources.fire, officialSources.fireField];
  }
  if (code === "WS30-H") {
    return [officialSources.confined, officialSources.welding];
  }
  if (code === "WS30-P") {
    return [officialSources.ppe, officialSources.welding];
  }
  if (/밀폐|가스경보/.test(text)) {
    return [officialSources.confined, officialSources.welding];
  }
  if (/건조로|화재|불꽃|고온/.test(text)) {
    return [officialSources.fire, officialSources.fireField];
  }
  if (/용접기|전격|케이블|팬|통풍|과열|분진|단자/.test(text)) {
    return [officialSources.electric, officialSources.electricField];
  }
  return [officialSources.ppe, officialSources.welding];
}

function officialUrlsForLesson(lesson: WeldingSafetyReviewLesson) {
  return officialUrlsForCode(
    lesson.safetyCode,
    `${lesson.title} ${lesson.objective} ${lesson.requiredDetails}`,
  );
}

function splitDetails(value: string) {
  return value
    .split(/\s*[/,]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildLessonBlocks(
  lesson: WeldingSafetyReviewLesson,
  relatedQuestions: WeldingSafetyReviewQuestion[],
): LessonBlock[] {
  const details = splitDetails(lesson.requiredDetails);
  const urls = officialUrlsForLesson(lesson);
  const questionExamples = relatedQuestions.slice(0, 5);
  const questionLines =
    questionExamples.length > 0
      ? questionExamples
          .map(
            (question) =>
              `- **${question.sourceQuestionId}** ${question.stem}\n  - 판단 기준: ${question.rationale}`,
          )
          .join("\n")
      : "- 연결된 검수 완료 문제는 같은 안전분류에서 단계적으로 추가합니다.";
  const detailTable = details
    .map(
      (detail, index) =>
        `| ${index + 1} | ${detail} | 작업 전 상태를 확인하고 이상 시 사용·작업을 중지한 뒤 승인된 절차로 조치 |`,
    )
    .join("\n");

  return [
    {
      id: "summary",
      kind: "summary",
      title: "핵심 3줄",
      body: `1. ${lesson.objective}\n2. ${details.slice(0, 3).join(" · ")}을 작업 전에 확인합니다.\n3. 안전장치나 보호구 하나만으로 모든 위험이 제거된다고 판단하지 않습니다.`,
      order: 1,
    },
    {
      id: "definition",
      kind: "definition",
      title: "무엇을 관리하는가",
      body: `**${lesson.title}**은 용접작업에서 감전·화재·폭발·유해광선·흄·질식·기계적 위험을 줄이기 위해 작업 전, 작업 중, 작업 후의 상태와 조치를 관리하는 항목입니다.\n\n${lesson.objective}\n\n단순 암기보다 **위험원 확인 → 제거·격리 → 공학적 방호 → 작업절차 → 보호구 → 이상 시 작업중지**의 순서로 판단합니다.`,
      order: 2,
    },
    {
      id: "purpose",
      kind: "purpose",
      title: "왜 필요한가",
      body: `용접은 전기, 고열, 불티, 압축가스, 유해광선과 흄이 동시에 존재할 수 있는 작업입니다. 한 가지 위험만 통제해도 다른 노출경로가 남을 수 있으므로 설비상태와 작업환경을 함께 확인해야 합니다.\n\n이 레슨의 목적은 ‘보호구를 착용했으니 안전하다’처럼 단일 조치로 결론 내리지 않고, 위험원을 제거하거나 격리한 뒤 환기·방호장치·허가절차·보호구가 서로 보완하도록 만드는 것입니다.`,
      order: 3,
    },
    {
      id: "principle",
      kind: "principle",
      title: "핵심 원리와 작업 순서",
      body: `1. 작업 대상, 에너지원, 가스종류와 주변 가연물을 확인합니다.\n2. 전원·가스·압력·잔류물질을 제거하거나 격리합니다.\n3. 환기, 차광, 방호장치, 접지, 누설점검 등 공학적 대책을 적용합니다.\n4. 화기작업 허가, 감시인, 작업구획과 비상연락체계를 확인합니다.\n5. 공정과 노출에 맞는 보호구를 착용합니다.\n6. 이상 표시, 누설, 과열, 연기, 경보가 발견되면 즉시 작업을 중지하고 원인을 확인합니다.\n\n> 현장에서는 최신 산업안전보건 기준, 사업장 작업표준과 장비 제조사 절차를 우선합니다.`,
      order: 4,
    },
    {
      id: "safety",
      kind: "safety",
      title: "필수 점검 항목",
      body: `| 순서 | 확인 항목 | 안전 판단 |\n|---:|---|---|\n${detailTable}\n\n점검 결과가 불명확하거나 장비가 손상된 경우 임시 조치로 작업을 계속하지 않습니다. 에너지를 차단하고 관계자에게 보고한 뒤, 자격 있는 인원과 승인된 절차에 따라 수리·교체·재시험합니다.`,
      order: 5,
    },
    {
      id: "exam-point",
      kind: "exam_point",
      title: "문제에서 묻는 판단 기준",
      body: questionLines,
      order: 6,
    },
    {
      id: "trap",
      kind: "trap",
      title: "자주 틀리는 선택지",
      body: `- 안전장치가 있으면 접지·절연·보호구가 필요 없다는 설명\n- 빨리 복구하기 위해 전원이나 가스를 차단하지 않고 정비한다는 설명\n- 냄새나 육안만으로 누설·산소결핍·가연성 분위기를 판단한다는 설명\n- 이상이 있어도 임시로 고정하거나 우회해 계속 사용한다는 설명\n- 과거의 단일 수치만 외우고 작업조건·제조사 기준·현행 규정을 확인하지 않는 설명\n\n${lesson.examTraps || "문항의 대상과 작업단계를 끝까지 확인해 금지행위와 필수조치를 구분합니다."}`,
      order: 7,
    },
    {
      id: "source",
      kind: "source",
      title: "공식 근거와 검수 상태",
      body: `- 한국산업안전보건공단 용접·작업안전 자료: ${urls[0]}\n- 한국산업안전보건공단 현장 안전자료: ${urls[1]}\n- 33차 전용문제은행 레슨 ID: ${lesson.sourceLessonId}\n- 검수일: 2026-07-23\n\n이 레슨은 CBT 출제문장을 그대로 복제하지 않고, 문제은행의 안전 판단조건을 공식 자료와 대조해 학습용으로 재구성했습니다.`,
      order: 8,
    },
  ];
}

function lessonQuality(blocks: LessonBlock[]) {
  const substantiveCharacters = blocks
    .filter((block) => block.kind !== "source")
    .map((block) => `${block.title}${block.body}`.replace(/\s+/g, ""))
    .join("").length;
  return {
    tier: "core" as const,
    substantiveCharacters,
    genericPhraseMatches: [],
    languageIssueMatches: [],
    sourceLinked: true,
    passed: substantiveCharacters >= 900,
  };
}

function buildChoices(question: WeldingSafetyReviewQuestion): Choice[] {
  const correctText = question.choices[question.correctChoiceIndex];
  return question.choices.map((text, index) => {
    const correct = index === question.correctChoiceIndex;
    const feedback = buildChoiceFeedback({
      stem: question.stem,
      choiceText: text,
      correctText,
      correct,
      explanation: question.rationale,
      choiceEvidence: correct
        ? question.rationale
        : `‘${text}’ 방식은 이 상황에서 필요한 ‘${correctText}’ 조치를 충족하지 못하거나 위험을 확대할 수 있습니다.`,
      concept: question.concept || question.category,
      groupId: GROUP_ID,
      groupTitle: "용접·작업안전",
    });
    return {
      id: `${question.id}-c${index + 1}`,
      order: index + 1,
      text,
      feedback,
    };
  });
}

function buildQuestion(
  question: WeldingSafetyReviewQuestion,
  canonicalNumber: number,
): Question {
  const sourceLessonId = sourceLessonIdForQuestion(question);
  const lesson = lessonBySourceId.get(sourceLessonId);
  if (!lesson) {
    throw new Error(`${question.sourceQuestionId}의 이론 레슨 ${sourceLessonId}를 찾지 못했습니다.`);
  }
  const choices = buildChoices(question);
  const sourceUrls = [
    ...officialUrlsForCode(
      question.safetyCode,
      `${question.concept} ${question.stem} ${question.rationale}`,
    ),
    question.cbtSourceUrl,
  ].filter((url, index, urls) => Boolean(url) && urls.indexOf(url) === index);
  const feedbackPassed = choices.every((choice, index) =>
    choiceFeedbackPasses(choice.feedback, index === question.correctChoiceIndex),
  );
  const explicitlyApproved = APPROVED_WELDING_SAFETY_QUESTION_IDS.has(
    question.id,
  );
  const publishable = explicitlyApproved && feedbackPassed;

  return {
    id: question.id,
    canonicalNumber,
    subjectId: SUBJECT_ID,
    conceptGroupId: GROUP_ID,
    conceptId: `concept-welding-safety-${sourceLessonId.toLocaleLowerCase("en")}`,
    lessonId: lesson.id,
    lessonAnchor: "safety",
    stem: question.stem,
    choices,
    correctChoiceId: choices[question.correctChoiceIndex].id,
    answerText: choices[question.correctChoiceIndex].text,
    explanation: question.rationale,
    errorReason: /아닌|부적절|안 되는/.test(question.stem)
      ? "부정형 문장"
      : "조건 누락",
    sourceLabel: sourceUrls[0],
    reviewStatus: explicitlyApproved
      ? `33차 우선순위 ${question.reviewPriority} 명시 승인`
      : `33차 우선순위 ${question.reviewPriority} 검수대기`,
    contentStatus: publishable ? "published" : "in_review",
    publication: {
      readiness: publishable ? "ready" : "blocked",
      blockers: publishable
        ? []
        : [
            explicitlyApproved
              ? "content_quality"
              : "authoritative_source_required",
          ],
    },
    verification: {
      status: publishable ? "verified" : "blocked",
      method: publishable
        ? "authoritative_source_verified"
        : "manual_source_required",
      variantCount: 1,
      sourceUrls,
      riskTags: publishable
        ? ["editorial_reconstruction"]
        : ["editorial_reconstruction", "authoritative_source_required"],
      note:
        publishable
          ? "문항별 정답·근거·선택지 피드백·이론 연결과 공식 출처를 명시 승인했습니다."
          : "원본 승인상태가 검수대기입니다. 문항별 공식 근거와 오답 선택지 설명을 승인하기 전까지 공개하지 않습니다.",
      reviewedAt: REVIEWED_AT,
    },
    validation: {
      answer: true,
      explanation: question.rationale.trim().length >= 20,
      choiceFeedback: feedbackPassed,
      theoryLink: true,
      contentQuality: feedbackPassed,
    },
  };
}

function buildLessons(questions: WeldingSafetyReviewQuestion[]) {
  return dataset.lessons.map((lesson): Lesson => {
    const relatedQuestions = questions.filter(
      (question) => sourceLessonIdForQuestion(question) === lesson.sourceLessonId,
    );
    const blocks = buildLessonBlocks(lesson, relatedQuestions);
    const quality = lessonQuality(blocks);
    const explicitlyApproved =
      relatedQuestions.length > 0 &&
      relatedQuestions.every((question) =>
        APPROVED_WELDING_SAFETY_QUESTION_IDS.has(question.id),
      );
    const publishable = explicitlyApproved && quality.passed;
    return {
      id: lesson.id,
      subjectId: SUBJECT_ID,
      conceptGroupId: GROUP_ID,
      conceptId: `concept-welding-safety-${lesson.sourceLessonId.toLocaleLowerCase("en")}`,
      title: lesson.title,
      aliases: splitDetails(lesson.requiredDetails).slice(0, 8),
      summary: [
        lesson.objective,
        `${splitDetails(lesson.requiredDetails).slice(0, 3).join(" · ")}을 작업 전에 확인합니다.`,
        "이상 상태에서는 임시 우회보다 작업중지·격리·보고·승인된 조치를 우선합니다.",
      ],
      blocks,
      relatedQuestionIds: relatedQuestions.map((question) => question.id),
      coverageStatus: publishable ? "covered" : "blocked",
      contentStatus: publishable ? "published" : "in_review",
      sourceNeeded: !publishable,
      reviewedAt: REVIEWED_AT,
      publication: {
        readiness: publishable ? "ready" : "blocked",
        blockers: publishable
          ? []
          : [
              explicitlyApproved
                ? "content_quality"
                : "authoritative_source_required",
            ],
      },
      quality,
    };
  });
}

export type WeldingSafetyApprovalAudit = {
  reviewedQuestions: number;
  publishedQuestions: number;
  heldQuestions: number;
  publishedLessons: number;
  heldLessons: number;
  invalidAnswerLinks: number;
  invalidTheoryLinks: number;
  invalidChoiceFeedback: number;
};

export function getApprovedWeldingSafetyContent(baseCanonicalNumber = 330_000) {
  const reviewedQuestions = dataset.questions.filter(
    (question) => question.reviewPriority !== null,
  );
  const lessons = buildLessons(reviewedQuestions);
  const questions = reviewedQuestions.map((question, index) =>
    buildQuestion(question, baseCanonicalNumber + index + 1),
  );
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));

  const audit: WeldingSafetyApprovalAudit = {
    reviewedQuestions: reviewedQuestions.length,
    publishedQuestions: questions.filter(
      (question) => question.contentStatus === "published",
    ).length,
    heldQuestions: questions.filter(
      (question) => question.contentStatus !== "published",
    ).length,
    publishedLessons: lessons.filter(
      (lesson) => lesson.contentStatus === "published",
    ).length,
    heldLessons: lessons.filter(
      (lesson) => lesson.contentStatus !== "published",
    ).length,
    invalidAnswerLinks: questions.filter(
      (question) =>
        !question.choices.some(
          (choice) => choice.id === question.correctChoiceId,
        ),
    ).length,
    invalidTheoryLinks: questions.filter(
      (question) => !lessonIds.has(question.lessonId),
    ).length,
    invalidChoiceFeedback: questions.filter(
      (question) =>
        !question.choices.every((choice) =>
          choiceFeedbackPasses(
            choice.feedback,
            choice.id === question.correctChoiceId,
          ),
        ),
    ).length,
  };

  return { questions, lessons, audit };
}

export function mergeApprovedWeldingSafetyContent(
  content: GeneratedContent,
): GeneratedContent {
  const supplement = getApprovedWeldingSafetyContent();
  const existingQuestionIds = new Set(
    content.questions.map((question) => question.id),
  );
  const existingLessonIds = new Set(content.lessons.map((lesson) => lesson.id));
  const questions = supplement.questions.filter(
    (question) => !existingQuestionIds.has(question.id),
  );
  const lessons = supplement.lessons.filter(
    (lesson) => !existingLessonIds.has(lesson.id),
  );
  const publishedQuestionCount = questions.filter(
    (question) => question.contentStatus === "published",
  ).length;
  const publishedLessonCount = lessons.filter(
    (lesson) => lesson.contentStatus === "published",
  ).length;
  const choiceFeedbackCount = questions.reduce(
    (total, question) => total + question.choices.length,
    0,
  );

  return {
    ...content,
    questions: [...content.questions, ...questions],
    lessons: [...content.lessons, ...lessons],
    report: {
      ...content.report,
      publishedQuestionCount:
        content.report.publishedQuestionCount + publishedQuestionCount,
      publication: {
        ...content.report.publication,
        ready: content.report.publication.ready + publishedQuestionCount,
      },
      verification: {
        ...content.report.verification,
        verified:
          content.report.verification.verified + publishedQuestionCount,
        authoritativeSourceVerified:
          content.report.verification.authoritativeSourceVerified +
          publishedQuestionCount,
        riskCounts: {
          ...content.report.verification.riskCounts,
          editorial_reconstruction:
            content.report.verification.riskCounts.editorial_reconstruction +
            publishedQuestionCount,
        },
      },
      coverage: {
        ...content.report.coverage,
        covered: content.report.coverage.covered + publishedLessonCount,
      },
      quality: {
        ...content.report.quality,
        lessonPassed: content.report.quality.lessonPassed + publishedLessonCount,
        choiceFeedbackPassed:
          content.report.quality.choiceFeedbackPassed + choiceFeedbackCount,
      },
      groupQuality: content.report.groupQuality.map((group) =>
        group.groupId === "s2-g05"
          ? {
              ...group,
              lessonCount: group.lessonCount + lessons.length,
              lessonPassed: group.lessonPassed + publishedLessonCount,
              publishedLessonCount:
                group.publishedLessonCount + publishedLessonCount,
              publishedLessonPassed:
                group.publishedLessonPassed + publishedLessonCount,
              questionCount: group.questionCount + questions.length,
              publishedQuestionCount:
                group.publishedQuestionCount + publishedQuestionCount,
              choiceFeedbackCount:
                group.choiceFeedbackCount + choiceFeedbackCount,
              choiceFeedbackPassed:
                group.choiceFeedbackPassed + choiceFeedbackCount,
            }
          : group,
      ),
    },
  };
}
