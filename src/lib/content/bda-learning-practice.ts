import type {
  BdaQbankLearningChoice,
  BdaQbankLearningItem,
  PublicBdaQbankLearningItem,
} from "@/lib/domain/bda-qbank";

export type BdaGeneratedLearningPractice = {
  publicItem: PublicBdaQbankLearningItem;
  correctChoiceId: string;
  explanationOverride?: string;
  choiceRationales: Record<string, string>;
};

const UNVERIFIED_ANSWER_PATTERN = /미확정|그림 미확보|확인 필요/;
const GRADEABLE_TECHNICAL_STATUSES = new Set(["개념일치", "수치검산완료"]);

export type BdaLearningItemPublicationDecision =
  | {
      status: "gradeable";
      reason: "개념·정답 핵심·독립 해설 검토 통과";
    }
  | {
      status: "hold";
      reason: string;
    };

export function getBdaLearningItemPublicationDecision(
  item: BdaQbankLearningItem,
): BdaLearningItemPublicationDecision {
  if (
    !item.paraphrasedLearningPrompt?.trim() ||
    !item.answerCore?.trim() ||
    !item.independentExplanation?.trim()
  ) {
    return {
      status: "hold",
      reason: "질문·정답 핵심·독립 해설 중 누락된 항목이 있습니다.",
    };
  }
  if (UNVERIFIED_ANSWER_PATTERN.test(item.answerCore)) {
    return {
      status: "hold",
      reason: "정답 핵심에 미확정 또는 원자료 누락 표시가 남아 있습니다.",
    };
  }
  if (!GRADEABLE_TECHNICAL_STATUSES.has(item.technicalValidationStatus ?? "")) {
    return {
      status: "hold",
      reason: `${item.technicalValidationStatus ?? "미검수"} 상태의 추가 검수가 필요합니다.`,
    };
  }
  return {
    status: "gradeable",
    reason: "개념·정답 핵심·독립 해설 검토 통과",
  };
}

export function isBdaLearningItemGradeable(item: BdaQbankLearningItem) {
  return getBdaLearningItemPublicationDecision(item).status === "gradeable";
}

type PracticeOverride = {
  stem: string;
  correctAnswer: string;
  distractors: [string, string, string];
  explanation: string;
};

const PRACTICE_OVERRIDES: Record<string, PracticeOverride> = {
  YJ69_017: {
    stem: "빅데이터 확산 전후의 분석 패러다임 변화로 가장 적절한 것은?",
    correctAnswer: "표본조사 중심에서 전수분석 가능성 확대로 변화",
    distractors: [
      "전수분석 중심에서 표본조사만 허용하는 방향으로 변화",
      "정형데이터 중심에서 정형데이터만 더 제한하는 방향으로 변화",
      "상관관계 탐색에서 모든 분석을 사전 인과모형으로만 제한하는 방향으로 변화",
    ],
    explanation: "저장·처리 역량이 확대되면서 표본 중심 분석에서 더 넓은 범위의 전수분석 가능성이 커졌다.",
  },
  NB_R02_009: {
    stem: "발생한 현상의 원인을 파악해 ‘왜 이런 일이 일어났는가’를 설명하는 분석 유형은?",
    correctAnswer: "진단 분석",
    distractors: ["기술 분석", "예측 분석", "처방 분석"],
    explanation: "진단 분석은 결과가 발생한 원인과 영향 요인을 찾아 설명한다.",
  },
  NB_R02_010: {
    stem: "센서 이벤트가 계속 발생하고 도착 즉시 처리해야 할 때 가장 적절한 수집 방식은?",
    correctAnswer: "스트리밍 수집",
    distractors: ["주기적 배치 수집", "수동 파일 업로드", "일회성 설문조사"],
    explanation: "연속적으로 발생하는 센서·로그 이벤트는 스트리밍 방식이 실시간 처리 요구에 적합하다.",
  },
  NB_R02_011: {
    stem: "조직의 분석 역량을 진단할 때 준비도와 성숙도를 함께 보는 이유로 가장 적절한 것은?",
    correctAnswer: "현재 자원·역량과 분석 운영 수준을 함께 평가하기 위해서",
    distractors: [
      "데이터 양만으로 분석 성공 여부를 확정하기 위해서",
      "모든 조직에 동일한 분석 모델을 적용하기 위해서",
      "기술 인프라 검토를 완전히 생략하기 위해서",
    ],
    explanation: "준비도는 자원과 역량을, 성숙도는 조직의 분석 활용·운영 수준을 점검한다.",
  },
  NB_R02_013: {
    stem: "업무 프로세스에서 분석 기회를 도출하는 순서로 가장 적절한 것은?",
    correctAnswer: "프로세스 식별→핵심활동 분석→분석 기회 도출",
    distractors: [
      "분석 기회 도출→프로세스 식별→핵심활동 분석",
      "핵심활동 분석→분석 기회 도출→프로세스 식별",
      "프로세스 식별→분석 기회 도출→핵심활동 분석",
    ],
    explanation: "먼저 업무 프로세스를 식별하고 핵심활동을 분석한 뒤 개선·분석 기회를 도출한다.",
  },
  NB_R02_015: {
    stem: "데이터 표준·품질·소유권·활용정책을 조직 차원에서 통합 관리하는 체계는?",
    correctAnswer: "데이터 거버넌스",
    distractors: ["데이터 마이닝", "데이터 시각화", "메타휴리스틱"],
    explanation: "데이터 거버넌스는 데이터 관련 권한·책임·표준·품질·활용정책을 통합 관리한다.",
  },
  NB_R02_016: {
    stem: "다층 신경망을 이용해 데이터의 표현을 자동 학습하는 기법은?",
    correctAnswer: "딥러닝",
    distractors: ["단순 임의추출", "계층적 군집", "주성분분석"],
    explanation: "딥러닝은 여러 은닉층을 가진 신경망으로 비선형 표현을 계층적으로 학습한다.",
  },
  NB_R02_017: {
    stem: "빅데이터 3V 중 데이터가 생성·유입되고 처리되는 속도를 의미하는 것은?",
    correctAnswer: "Velocity",
    distractors: ["Volume", "Variety", "Value"],
    explanation: "Velocity는 데이터의 생성·유입·처리 속도를 뜻한다.",
  },
  NB_R02_018: {
    stem: "평균·분산·분위수로 관측 자료의 특성을 요약하는 통계 영역은?",
    correctAnswer: "기술통계",
    distractors: ["추론통계", "강화학습", "연관규칙"],
    explanation: "기술통계는 수집된 자료의 중심·산포·분포 특성을 요약하고 설명한다.",
  },
  NB_R02_019: {
    stem: "가설이나 모형을 확정하기 전에 분포·이상값·변수 관계를 탐색하는 활동은?",
    correctAnswer: "탐색적 데이터 분석(EDA)",
    distractors: ["확증적 요인분석", "운영 배포", "모델 서빙"],
    explanation: "EDA는 시각화와 기술통계를 이용해 데이터 구조와 패턴을 사전에 탐색한다.",
  },
  NB_R02_020: {
    stem: "분석 데이터를 이용해 후보 모형을 선택하고 학습·검증하는 활동은 어느 단계에 해당하는가?",
    correctAnswer: "분석 모형 구축·평가 단계",
    distractors: ["데이터 수집 계약 단계", "요구사항 폐기 단계", "서비스 종료 단계"],
    explanation: "모형 선택, 학습, 검증과 평가는 분석 모형을 구축하고 성능을 확인하는 핵심 활동이다.",
  },
  NB_R02_021: {
    stem: "이상값을 발견했을 때의 처리 원칙으로 가장 적절한 것은?",
    correctAnswer: "입력오류·측정오류·자연변동 여부를 확인한 뒤 처리한다.",
    distractors: [
      "극단값은 모두 오류이므로 즉시 삭제한다.",
      "이상값 여부와 관계없이 평균으로 바꾼다.",
      "원인 확인 없이 학습 데이터에만 남긴다.",
    ],
    explanation: "이상값은 오류일 수도 있지만 실제 희귀 현상일 수도 있으므로 원인과 업무 의미를 먼저 확인한다.",
  },
  NB_R02_025: {
    stem: "기존 변수로 파생변수를 만들 때 가장 우선적으로 확인할 사항은?",
    correctAnswer: "업무 타당성과 목표정보 누수 여부",
    distractors: ["변수명의 길이", "열의 화면 표시 순서", "파일 확장자만의 일치 여부"],
    explanation: "파생변수는 업무적으로 설명 가능해야 하며 예측 시점 이후의 정보가 섞이는 누수를 막아야 한다.",
  },
  NB_R02_026: {
    stem: "사전확률과 우도를 이용해 사후확률을 구하는 베이즈 정리의 형태는?",
    correctAnswer: "사후확률=사전확률×우도/증거확률",
    distractors: [
      "사후확률=증거확률×우도/사전확률",
      "사후확률=사전확률+우도+증거확률",
      "사후확률=우도/사전확률×증거확률",
    ],
    explanation: "베이즈 정리는 사전확률에 우도를 곱하고 증거확률로 정규화해 사후확률을 계산한다.",
  },
  NB_R02_027: {
    stem: "정규모집단 평균의 신뢰구간을 구할 때 z분포와 t분포를 선택하는 핵심 기준은?",
    correctAnswer: "모분산을 알고 있는지와 표본 조건",
    distractors: ["변수명의 한글 여부", "행 번호의 홀짝", "데이터 파일의 저장 위치"],
    explanation: "일반적으로 모분산을 알면 z, 모분산을 모르고 표본표준편차를 사용하면 t를 고려한다.",
  },
  NB_R02_063: {
    stem: "NoSQL의 대표적인 데이터 모델 조합으로 가장 적절한 것은?",
    correctAnswer: "키-값형·문서형·열지향형·그래프형",
    distractors: [
      "회귀형·분류형·군집형·강화형",
      "평균형·분산형·왜도형·첨도형",
      "막대형·선형·원형·산점형",
    ],
    explanation: "NoSQL은 대표적으로 키-값, 문서, 열지향, 그래프 데이터 모델로 구분한다.",
  },
  NB_R02_071: {
    stem: "로지스틱 회귀에서 다른 조건이 같을 때 계수의 지수값 exp(β)가 의미하는 것은?",
    correctAnswer: "해당 독립변수 1단위 증가에 따른 오즈비",
    distractors: ["결정계수", "평균제곱오차", "군집 내 제곱합"],
    explanation: "로지스틱 회귀계수를 지수화하면 다른 변수가 일정할 때의 오즈비로 해석할 수 있다.",
  },
  NB_R02_090: {
    stem: "비정형 텍스트의 내용·관계·정서를 분석할 때 활용할 수 있는 기법 조합은?",
    correctAnswer: "텍스트마이닝·네트워크분석·감성분석",
    distractors: [
      "단순 임의추출·계통추출·층화추출",
      "정규화·표준화·로그변환만",
      "평균·중앙값·최빈값만",
    ],
    explanation: "텍스트의 주제와 패턴은 텍스트마이닝, 관계는 네트워크분석, 정서는 감성분석으로 탐색할 수 있다.",
  },
  NB_R06_001: {
    stem: "정형·반정형·비정형처럼 데이터 형태가 다양한 특성을 의미하는 빅데이터의 V는?",
    correctAnswer: "Variety",
    distractors: ["Volume", "Velocity", "Veracity"],
    explanation: "Variety는 구조와 형식이 서로 다른 다양한 데이터 유형을 의미한다.",
  },
  NB_R08_001: {
    stem: "빅데이터 5V 중 데이터의 생성·유입·처리 속도와 직접 연결되는 특성은?",
    correctAnswer: "Velocity",
    distractors: ["Volume", "Variety", "Value"],
    explanation: "Velocity는 데이터가 발생하고 이동하며 처리되는 속도를 뜻한다.",
  },
  NB_R03_063: {
    stem: "NoSQL을 선택하는 대표적인 이유로 가장 적절한 것은?",
    correctAnswer: "수평 확장성과 유연한 스키마",
    distractors: [
      "모든 데이터에 고정 스키마와 단일 서버만 강제하기 위해서",
      "비정형 데이터를 저장하지 않기 위해서",
      "분산처리를 원천적으로 차단하기 위해서",
    ],
    explanation: "NoSQL은 대규모 분산 환경의 수평 확장과 유연한 스키마가 필요한 경우에 활용된다.",
  },
  NB_R07_047: {
    stem: "원 그림이 확보되지 않은 인코딩 식별 문항을 검수할 때 가장 적절한 조치는?",
    correctAnswer: "원 그림과 보기 원문을 확보한 뒤 정답을 재검증한다.",
    distractors: [
      "문항 제목만 보고 정답을 확정한다.",
      "가장 자주 등장한 인코딩을 임의로 정답 처리한다.",
      "이미지 없이 모든 보기를 정답으로 승인한다.",
    ],
    explanation: "그림을 보고 인코딩 방식을 식별하는 문항은 원 그림 없이는 정답을 신뢰성 있게 확정할 수 없다.",
  },
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeChoice(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("ko");
}

function buildQuestionStem(item: BdaQbankLearningItem) {
  const override = PRACTICE_OVERRIDES[item.id];
  if (override) return override.stem;
  if (UNVERIFIED_ANSWER_PATTERN.test(item.answerCore ?? "")) {
    return `${item.topicSummary ?? "이 문항"}을 신뢰성 있게 판단하기 위해 가장 먼저 필요한 조치는?`;
  }

  if (item.questionMode === "절차판별") {
    return `${item.topicSummary ?? "분석 절차"}의 올바른 순서로 가장 적절한 것은?`;
  }
  if (item.questionMode === "계산형") {
    return `${item.topicSummary ?? "계산 문제"}에 적용할 식 또는 판단 결과로 가장 적절한 것은?`;
  }
  if (item.questionMode === "사례적용") {
    return `${item.topicSummary ?? "제시된 사례"}에 대한 판단으로 가장 적절한 것은?`;
  }
  if (item.questionMode?.includes("시각")) {
    return `${item.topicSummary ?? "시각화"}에 관한 설명으로 가장 적절한 것은?`;
  }
  return `${item.topicSummary ?? "이 개념"}에 관한 설명으로 가장 적절한 것은?`;
}

function buildSequenceDistractors(answer: string) {
  const delimiter = answer.includes("→") ? "→" : undefined;
  if (!delimiter) return [];

  const parts = answer
    .split(delimiter)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 3) return [];

  const swapped = [...parts];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const middleSwapped = [...parts];
  const middleIndex = Math.max(1, Math.floor(parts.length / 2) - 1);
  [middleSwapped[middleIndex], middleSwapped[middleIndex + 1]] = [
    middleSwapped[middleIndex + 1],
    middleSwapped[middleIndex],
  ];

  return [
    [...parts].reverse().join(delimiter),
    swapped.join(delimiter),
    middleSwapped.join(delimiter),
  ];
}

function scoreCandidate(
  item: BdaQbankLearningItem,
  candidate: BdaQbankLearningItem,
) {
  const sharedConcepts = candidate.conceptIds.filter((conceptId) =>
    item.conceptIds.includes(conceptId),
  ).length;
  const subjectScore =
    item.subjectNo !== undefined && item.subjectNo === candidate.subjectNo ? 12 : 0;
  const modeScore = item.questionMode === candidate.questionMode ? 8 : 0;
  const lengthPenalty = Math.min(
    8,
    Math.abs((item.answerCore?.length ?? 0) - (candidate.answerCore?.length ?? 0)) /
      20,
  );
  return sharedConcepts * 16 + subjectScore + modeScore - lengthPenalty;
}

function getCorrectAnswer(item: BdaQbankLearningItem) {
  if (UNVERIFIED_ANSWER_PATTERN.test(item.answerCore ?? "")) {
    return "원 그림과 보기 원문을 확보한 뒤 정답을 재검증한다.";
  }
  return item.answerCore?.trim() || "추가 근거를 확보한 뒤 정답을 확정한다.";
}

function buildChoiceTexts(
  item: BdaQbankLearningItem,
  allItems: BdaQbankLearningItem[],
) {
  const override = PRACTICE_OVERRIDES[item.id];
  const correctAnswer = override?.correctAnswer ?? getCorrectAnswer(item);
  const seen = new Set([normalizeChoice(correctAnswer)]);
  const distractors: string[] = override ? [...override.distractors] : [];

  for (const sequenceDistractor of override
    ? []
    : buildSequenceDistractors(correctAnswer)) {
    const normalized = normalizeChoice(sequenceDistractor);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      distractors.push(sequenceDistractor);
    }
  }

  const candidates = allItems
    .filter(
      (candidate) =>
        candidate.id !== item.id &&
        candidate.answerCore?.trim() &&
        !UNVERIFIED_ANSWER_PATTERN.test(candidate.answerCore),
    )
    .map((candidate) => ({
      answer: candidate.answerCore!.trim(),
      score: scoreCandidate(item, candidate),
      tieBreaker: stableHash(`${item.id}:${candidate.id}`),
    }))
    .sort(
      (left, right) =>
        right.score - left.score || left.tieBreaker - right.tieBreaker,
    );

  for (const candidate of candidates) {
    if (distractors.length >= 3) break;
    const normalized = normalizeChoice(candidate.answer);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    distractors.push(candidate.answer);
  }

  const fallbacks = [
    "관련 용어를 확인하지 않고 모든 조건에 동일하게 적용한다.",
    "표본과 모집단, 학습 데이터와 평가 데이터를 구분하지 않는다.",
    "목적과 데이터 유형에 관계없이 하나의 방법만 사용한다.",
  ];
  for (const fallback of fallbacks) {
    const normalized = normalizeChoice(fallback);
    if (!seen.has(normalized) && distractors.length < 3) {
      seen.add(normalized);
      distractors.push(fallback);
    }
  }

  const correctIndex = stableHash(item.id) % 4;
  const ordered = distractors.slice(0, 3);
  ordered.splice(correctIndex, 0, correctAnswer);
  return { ordered, correctIndex };
}

export function generateBdaLearningPractice(
  item: BdaQbankLearningItem,
  allItems: BdaQbankLearningItem[],
): BdaGeneratedLearningPractice {
  const publication = getBdaLearningItemPublicationDecision(item);
  if (publication.status !== "gradeable") {
    throw new Error(`Learning item ${item.id} is HOLD: ${publication.reason}`);
  }
  const { ordered, correctIndex } = buildChoiceTexts(item, allItems);
  const choices: BdaQbankLearningChoice[] = ordered.map((text, index) => ({
    id: `${item.id}-choice-${index + 1}`,
    order: index + 1,
    text,
  }));
  const correctExplanation =
    PRACTICE_OVERRIDES[item.id]?.explanation ??
    item.independentExplanation?.trim() ??
    `${item.topicSummary ?? "이 개념"}의 검수된 정답 핵심입니다.`;
  const correctAnswer = choices[correctIndex].text;
  const choiceRationales = Object.fromEntries(
    choices.map((choice, index) => {
      if (index === correctIndex) {
        return [choice.id, correctExplanation];
      }

      const matchedItem = allItems.find(
        (candidate) =>
          candidate.id !== item.id &&
          normalizeChoice(candidate.answerCore ?? "") ===
            normalizeChoice(choice.text),
      );
      if (matchedItem) {
        return [
          choice.id,
          `이 보기는 ‘${matchedItem.topicSummary ?? "다른 분석 개념"}’에서 쓰는 핵심입니다. 현재 문항의 ‘${item.topicSummary ?? "출제 개념"}’을 판단하는 답과는 적용 대상이 다릅니다.`,
        ];
      }
      if (choice.text.includes("→") && correctAnswer.includes("→")) {
        return [
          choice.id,
          `정답 핵심의 단계인 ‘${correctAnswer}’에서 선후 관계를 바꾼 보기입니다. 절차 문제는 시작 조건과 다음 단계의 순서를 함께 확인해야 합니다.`,
        ];
      }
      return [
        choice.id,
        `이 보기는 ‘${item.topicSummary ?? "현재 개념"}’의 검수된 핵심인 ‘${correctAnswer}’와 다른 판단 기준을 적용했습니다.`,
      ];
    }),
  );

  return {
    publicItem: {
      id: item.id,
      platform: item.platform,
      sourceSetType: item.sourceSetType,
      examRound: item.examRound,
      sourceItemNo: item.sourceItemNo,
      topicSummary: item.topicSummary,
      paraphrasedLearningPrompt: item.paraphrasedLearningPrompt,
      questionMode: item.questionMode,
      technicalValidationStatus: item.technicalValidationStatus,
      reviewStatus: item.reviewStatus,
      evidenceGrade: item.evidenceGrade,
      conceptIds: item.conceptIds,
      questionStem: buildQuestionStem(item),
      choices,
      practiceNotice: UNVERIFIED_ANSWER_PATTERN.test(item.answerCore ?? "")
        ? "원 자료가 빠진 항목이므로 정답 확정 절차를 묻는 검수형 문제로 전환했습니다."
        : item.technicalValidationStatus?.includes("정답미확정")
          ? "원 선택지의 정답번호는 미확정이므로, 확인된 주제와 개념을 바탕으로 새 객관식을 자체 제작했습니다."
        : "원문 복제가 아닌 문제은행의 학습 목표·정답 핵심을 바탕으로 만든 실전형 4지선다 재구성입니다.",
    },
    correctChoiceId: choices[correctIndex].id,
    explanationOverride: PRACTICE_OVERRIDES[item.id]?.explanation,
    choiceRationales,
  };
}
