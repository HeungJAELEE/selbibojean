import { getGroupGuide } from "@/lib/content/group-guides";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";
import type { GeneratedContent, Lesson, Question } from "@/lib/domain/types";
import { isPublishableQuestion } from "@/lib/domain/practice";

export type FamilyComparison = {
  term: string;
  input: string;
  role: string;
  effect: string;
  caution: string;
};

export type FamilyFieldCase = {
  issue: string;
  focus: string;
  action: string;
  caution: string;
};

export type LessonFamily = {
  id: string;
  groupId: string;
  label: string;
  lessons: Lesson[];
  relatedTerms: string[];
  scope: string;
  mechanism: string;
  comparison: FamilyComparison[];
  fieldCases: FamilyFieldCase[];
  decisionSteps: string[];
  trapQuestions: Question[];
};

type FamilyOverride = {
  relatedTerms: string[];
  scope: string;
  mechanism: string;
  lessonOrder: string[];
  comparison: FamilyComparison[];
  fieldCases: FamilyFieldCase[];
  trapQuestionIds: string[];
};

const FAMILY_OVERRIDES: Record<string, FamilyOverride> = {
  "s1-g11:action": {
    relatedTerms: [
      "P·비례동작",
      "I·적분동작",
      "D·미분동작",
      "PI·PID 제어",
      "제어편차 e(t)",
      "비례게인 Kp·비례대 PB",
    ],
    scope:
      "P·I·D는 서로 떨어진 세 개의 암기 항목이 아니라, 제어편차를 어떤 방식으로 조작량에 반영할지 정하는 한 묶음이다. P는 현재 편차, I는 지금까지 누적된 편차, D는 편차가 변하는 속도를 사용한다.",
    mechanism:
      "제어편차를 $e(t)=r(t)-y(t)$라고 하면 PID 제어기의 조작량은 $u(t)=K_p e(t)+K_i\\int e(t)dt+K_d\\frac{de(t)}{dt}$로 표현할 수 있다. 실제 조정에서는 응답속도·정상상태 편차·오버슈트·진동·측정 잡음을 함께 보며 세 항의 비중을 맞춘다.",
    lessonOrder: ["제어동작", "적분제어", "미분제어", "제어편차", "비례게인·비례대"],
    comparison: [
      {
        term: "P 제어",
        input: "현재 편차 e(t)",
        role: "지금 벌어진 오차에 즉시 비례해 조작량을 만든다.",
        effect: "응답을 빠르게 만들고 기본적인 추종 능력을 만든다.",
        caution: "P만으로는 정상상태 편차가 남을 수 있고, 게인이 지나치면 진동·오버슈트가 커진다.",
      },
      {
        term: "I 제어",
        input: "편차의 시간 누적",
        role: "작게 남아 있는 편차도 계속 누적해 조작량을 보탠다.",
        effect: "P 제어 뒤에 남는 정상상태 편차를 제거한다.",
        caution: "적분이 지나치면 응답이 느려지고 오버슈트·적분 와인드업이 커질 수 있다.",
      },
      {
        term: "D 제어",
        input: "편차의 변화율 de(t)/dt",
        role: "오차가 빠르게 변하는 방향을 미리 보고 제동 성분을 만든다.",
        effect: "급격한 변화와 오버슈트를 줄이고 감쇠·안정성을 보완한다.",
        caution: "측정 잡음을 크게 증폭할 수 있어 필터와 함께 쓰며, 보통 D 단독보다 PD·PID로 사용한다.",
      },
      {
        term: "PI·PID",
        input: "현재값+누적값(+변화율)",
        role: "P를 기본으로 I와 D의 장점을 필요한 만큼 결합한다.",
        effect: "빠른 응답, 편차 제거, 진동 억제 사이의 균형을 맞춘다.",
        caution: "모든 항을 크게 하면 좋아지는 것이 아니며 공정 지연·센서 잡음·액추에이터 한계를 반영해 조정한다.",
      },
    ],
    fieldCases: [
      {
        issue: "설정값을 바꿨는데 현재값이 너무 느리게 따라온다.",
        focus: "P 제어",
        action: "현재 편차에 대한 비례 응답을 확인하고, 진동이 생기지 않는 범위에서 비례게인을 조정한다.",
        caution: "게인을 무조건 높이지 말고 밸브 포화·공정 지연·오버슈트를 함께 본다.",
      },
      {
        issue: "응답은 안정됐지만 목표값과 실제값 사이에 작은 편차가 계속 남는다.",
        focus: "I 제어",
        action: "남은 편차를 누적해 없애도록 적분동작을 보강하고 정상상태 편차의 감소 추세를 확인한다.",
        caution: "액추에이터 포화 중 적분값이 계속 쌓이는 와인드업과 긴 정착시간을 확인한다.",
      },
      {
        issue: "부하가 급변할 때 오버슈트와 진동이 커지고 목표값을 여러 번 넘나든다.",
        focus: "D 제어",
        action: "편차 변화율에 대한 제동 성분을 보강해 급격한 움직임과 오버슈트를 줄인다.",
        caution: "센서 신호에 고주파 잡음이 많으면 D가 잡음까지 증폭하므로 필터·샘플링 상태를 먼저 점검한다.",
      },
    ],
    trapQuestionIds: ["U-030", "U-683", "U-556"],
  },
};

export function getLessonFamilies(content: GeneratedContent, groupId: string): LessonFamily[] {
  const lessons = content.lessons.filter(
    (lesson) => lesson.contentStatus === "published" && lesson.conceptGroupId === groupId,
  );

  return getLessonSubcategories(groupId, lessons).map((subcategory) => {
    const key = familyKey(groupId, subcategory.id);
    const override = FAMILY_OVERRIDES[key];
    const orderedLessons = override
      ? [...subcategory.lessons].sort((left, right) =>
        orderIndex(override.lessonOrder, left.title) - orderIndex(override.lessonOrder, right.title)
        || left.title.localeCompare(right.title, "ko"))
      : [...subcategory.lessons].sort((left, right) => left.title.localeCompare(right.title, "ko"));
    const guide = getGroupGuide(groupId);

    return {
      id: subcategory.id,
      groupId,
      label: subcategory.label,
      lessons: orderedLessons,
      relatedTerms: override?.relatedTerms ?? orderedLessons.map((lesson) => lesson.title),
      scope: override?.scope ?? `${subcategory.label}은(는) ${guide.scope}`,
      mechanism: override?.mechanism ?? guide.mechanism,
      comparison: override?.comparison ?? orderedLessons.map(toGenericComparison),
      fieldCases: override?.fieldCases ?? [],
      decisionSteps: guide.decisionSteps,
      trapQuestions: selectTrapQuestions(content, orderedLessons, override?.trapQuestionIds),
    };
  });
}

export function getLessonFamily(content: GeneratedContent, groupId: string, familyId: string) {
  return getLessonFamilies(content, groupId).find((family) => family.id === familyId);
}

export function getLessonFamilyForLesson(content: GeneratedContent, lessonId: string) {
  const lesson = content.lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson || lesson.contentStatus !== "published") return undefined;
  return getLessonFamilies(content, lesson.conceptGroupId)
    .find((family) => family.lessons.some((candidate) => candidate.id === lessonId));
}

export function getLessonFamilyHref(groupId: string, familyId: string) {
  return `/written/theory/family/${groupId}/${familyId}`;
}

export function getLessonTrapQuestions(content: GeneratedContent, lessonId: string, limit = 1) {
  return content.questions
    .filter((question) => question.lessonId === lessonId && isPublishableQuestion(question))
    .slice(0, limit);
}

export function shouldReplaceWithFamilySection(block: Lesson["blocks"][number]) {
  return block.id === "field-case"
    || (block.id === "trap" && block.title === "시험에서 자주 나오는 실제 함정 보기");
}

export function isPidFamily(groupId: string, familyId: string) {
  return familyKey(groupId, familyId) === "s1-g11:action";
}

function selectTrapQuestions(content: GeneratedContent, lessons: Lesson[], preferredIds?: string[]) {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const candidates = content.questions.filter(
    (question) => lessonIds.has(question.lessonId) && isPublishableQuestion(question),
  );
  const selected: Question[] = [];

  for (const id of preferredIds ?? []) {
    const question = candidates.find((candidate) => candidate.id === id);
    if (question) selected.push(question);
  }
  for (const lesson of lessons) {
    if (selected.length >= 3) break;
    const question = candidates.find(
      (candidate) => candidate.lessonId === lesson.id && !selected.some((item) => item.id === candidate.id),
    );
    if (question) selected.push(question);
  }

  return selected.slice(0, 3);
}

function toGenericComparison(lesson: Lesson): FamilyComparison {
  return {
    term: lesson.title,
    input: "문항의 대상·조건",
    role: lesson.summary[0] ?? `${lesson.title}의 정의와 기능을 확인한다.`,
    effect: lesson.summary[1] ?? "상위 개념 안에서 고유한 기능과 적용 조건을 구분한다.",
    caution: "명칭만으로 판단하지 말고 대상·조건·기능이 모두 맞는지 확인한다.",
  };
}

function familyKey(groupId: string, familyId: string) {
  return `${groupId}:${familyId}`;
}

function orderIndex(order: string[], title: string) {
  const index = order.indexOf(title);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
