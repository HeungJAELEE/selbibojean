const AUTHOR = "Codex welding review part 14 author";
const AUTHORED_AT = "2026-08-02T15:59:23.652Z";
const REVIEWER = "Codex welding review part 14 independent reviewer";
const REVIEWED_AT = "2026-08-03T00:18:00.000Z";

function holdCandidate(
  canonicalId: string,
  contentDigest: string,
  assessmentKind: string,
  holdReasons: string[],
) {
  return {
    canonicalId,
    contentDigest,
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind,
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons,
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  };
}

function publishCandidate(entry: {
  canonicalId: string;
  contentDigest: string;
  assessmentKind: string;
  lessonId: string;
  lessonBlockId: string;
  assertionText: string;
  answerExplanation: string;
  solutionSteps: string[];
  keyRule: string;
  choiceFeedback: Array<{
    choiceIndex: number;
    relation:
      | "supports"
      | "refuted_by"
      | "contradicts"
      | "out_of_scope"
      | "unit_error"
      | "substitution_error"
      | "confused_with"
      | "missing_condition";
    rationale: string;
    plausibleReason: string;
    incorrectPoint: string | null;
    keyRule: string;
    differenceFromCorrect: string | null;
  }>;
  derivationRef?: string;
  essentialRank?: number;
  essentialRationale?: string;
}) {
  const evidenceRefs = [
    {
      kind: "lesson_block",
      ref: `${entry.lessonId}#${entry.lessonBlockId}`,
    },
    {
      kind: "source_question",
      ref: entry.canonicalId,
    },
    ...(entry.derivationRef
      ? [{ kind: "calculation_derivation", ref: entry.derivationRef }]
      : []),
  ];
  return {
    canonicalId: entry.canonicalId,
    contentDigest: entry.contentDigest,
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: entry.assessmentKind,
    primaryLeafLessonId: entry.lessonId,
    conceptBinding: {
      lessonId: entry.lessonId,
      lessonBlockId: entry.lessonBlockId,
      assertionText: entry.assertionText,
      evidenceRefs,
    },
    answerExplanation: entry.answerExplanation,
    solutionSteps: entry.solutionSteps,
    keyRule: entry.keyRule,
    choiceFeedback: entry.choiceFeedback,
    essentialRank: entry.essentialRank ?? null,
    essentialRationale: entry.essentialRationale ?? null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  };
}

const RAW_WELDING_CBT_ANSWER_REVIEWS_PART_14 = [
  holdCandidate(
    "wcbt-ad55f62c-3029-46ef-a02a-c73c140e2c61",
    "00610a6c3189c228fe0941f3776ed3f0a00cecc0d2d9b674503d062ef14239ef",
    "safety",
    [
      "lesson_target_missing: 제안된 lesson-1ctkzud가 공개 레슨에 존재하지 않아 안전색 의미를 직접 연결할 수 없음",
      "safety_primary_official_source_not_bound: KS 안전색의 황적 의미를 확인할 공식 원문 URL이 연결되지 않음",
    ],
  ),
  holdCandidate(
    "wcbt-ae988bf0-4135-4bbd-96ee-57cb2f6183bf",
    "bf7e978c718741e365d9e5954bfa97e7ce5cc00cd1ad4523ff4b8443aaada26d",
    "calculation",
    [
      "missing_direct_formula_evidence: 산소용기 저장량과 프랑스식 300번 팁 소비량을 결합하는 계산식이 레슨에 없음",
      "safety_primary_official_source_not_bound: 가스용기 계산 조건을 확인할 공식 원문 URL이 연결되지 않음",
    ],
  ),
  holdCandidate(
    "wcbt-aede6970-76cc-4837-8c2a-f10bc6d140c4",
    "5e91e40eb2dcb2cfae36a4cd4dfddb175838e2783287843a5aa7a3597c0b3dca",
    "safety",
    [
      "missing_direct_lesson_evidence: 20~50mA 통전 시 근육 수축과 호흡 곤란이라는 구간별 인체 영향표가 레슨에 없음",
      "safety_primary_official_source_not_bound: 감전 전류별 인체 영향의 공식 원문 URL이 연결되지 않음",
    ],
  ),
  holdCandidate(
    "wcbt-aefa06ce-0765-4430-bc80-804aa0759444",
    "ddc364fcbd6dd5933391487d2e45528e311016fc3767ce99357eb2616fb9337f",
    "safety",
    [
      "safety_primary_official_source_not_bound: 가스용접 보호구 착용 기준을 확인할 공식 원문 URL이 연결되지 않음",
      "choice_scope_needs_official_review: 유해가스 조건에서 방독면을 단정한 보기는 산소농도와 물질별 보호구 조건 확인이 필요함",
    ],
  ),
  {
    canonicalId: "wcbt-b022cfe8-5cff-47a6-8ba2-7acc8999cfa1",
    contentDigest:
      "d2b6dcbefac69132b7b33be58a7c613157876b2a47dc64bb3eeaacf130b0467d",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "structure",
      assertionText:
        "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-fire#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-b022cfe8-5cff-47a6-8ba2-7acc8999cfa1",
        },
      ],
    },
    answerExplanation:
      "B급 화재는 유류와 가연성 액체에 의한 화재입니다. 네 보기 중 이 분류에 해당하는 것은 두 번째 보기인 유류 화재입니다.",
    solutionSteps: [
      "레슨의 화재 등급표에서 B급을 유류·가연성 액체 화재와 연결합니다.",
      "일반·전기·금속 화재는 각각 A·C·D급이므로 두 번째 보기만 남깁니다.",
    ],
    keyRule:
      "화재 등급은 A급 일반 가연물, B급 유류·가연성 액체, C급 전기설비, D급 금속으로 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "일반 화재는 종이·목재·섬유 같은 일반 가연물이 타는 A급 화재입니다.",
        plausibleReason:
          "가장 흔한 화재라서 B급까지 포함하는 상위 분류처럼 보일 수 있습니다.",
        incorrectPoint:
          "일반 가연물 화재를 유류·가연성 액체 화재인 B급으로 잘못 분류했습니다.",
        keyRule: "일반 가연물이 타는 화재는 A급으로 판정합니다.",
        differenceFromCorrect:
          "정답은 액체 연료가 타는 B급이고, 이 보기는 고체 일반 가연물이 타는 A급입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "유류 화재는 휘발유·등유 등 가연성 액체가 연소하는 B급 화재입니다.",
        plausibleReason:
          "레슨의 B급 정의인 유류·가연성 액체와 보기의 표현이 직접 일치합니다.",
        incorrectPoint: null,
        keyRule: "유류와 가연성 액체의 화재는 B급입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "통전 중인 전기설비에서 발생한 전기 화재는 C급으로 구분합니다.",
        plausibleReason:
          "절연유가 쓰이는 전기설비를 떠올리면 유류 화재와 혼동할 수 있습니다.",
        incorrectPoint:
          "전기설비 화재의 등급 C를 유류 화재의 등급 B와 바꾸었습니다.",
        keyRule: "전기설비 화재는 통전 여부를 확인하고 C급으로 분류합니다.",
        differenceFromCorrect:
          "정답은 가연성 액체의 B급이고, 이 보기는 전기설비의 C급입니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "마그네슘·나트륨 같은 금속의 연소는 D급 금속 화재에 해당합니다.",
        plausibleReason:
          "유류와 금속 모두 일반 물로 진화하기 곤란하다는 공통점 때문에 섞일 수 있습니다.",
        incorrectPoint:
          "금속 화재의 D급을 유류·가연성 액체 화재의 B급으로 잘못 연결했습니다.",
        keyRule: "금속 자체가 타는 화재는 D급으로 구분합니다.",
        differenceFromCorrect:
          "정답은 유류가 타는 B급이고, 이 보기는 금속이 타는 D급입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-b02d3b54-c7f1-4f3a-8c0d-5b0709a998e2",
    "205c57dfea52ea745fef681c92e44c2b0e2d66766e994a4767c6f6de79494064",
    "calculation",
    [
      "missing_direct_formula_evidence: 아크출력 30V×300A와 내부손실 4kW로 효율을 구하는 식이 레슨에 직접 제시되지 않음",
      "input_condition_ambiguity: 무부하전압 80V가 계산에 사용되지 않는 이유를 설명할 직접 근거가 필요함",
    ],
  ),
  holdCandidate(
    "wcbt-b0dfbe58-d993-41c4-823c-44ad59114dea",
    "a76c6f58632cd469fad0f15c02a3e4b671fbf1ece0c787d1e103f3cd2fc32b1a",
    "safety",
    [
      "safety_primary_official_source_not_bound: 아세틸렌의 폭발·화합물 위험을 확인할 공식 원문 URL이 연결되지 않음",
      "missing_direct_lesson_evidence: 구리·수은 접촉과 충격 위험의 세부 조건이 레슨에 직접 적혀 있지 않음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-b19d69fb-e9b7-4444-8621-4b96f2315549",
    contentDigest:
      "eb33d4bc49482a54a494fef1e2745c77ecfaa406cdf5e5e8a30dd9cca286407e",
    assessmentKind: "identification",
    lessonId: "lesson-welding-inspection-ndt",
    lessonBlockId: "principle",
    assertionText:
      "RT는 방사선 투과량 차이를 영상으로 만들고, UT는 초음파가 경계면에서 반사되는 신호를 분석합니다.",
    answerExplanation:
      "X선이나 γ선을 시험체에 투과시키고 결함에 따른 투과량 차이를 필름 영상의 농도 차이로 기록하는 방법은 방사선투과검사(RT)입니다. 따라서 네 번째 보기인 방사선 투과 검사가 정답입니다.",
    solutionSteps: [
      "지문에서 X선·γ선, 투과, 사진 필름 감광이라는 세 단서를 찾습니다.",
      "방사선의 투과량 차이를 영상으로 기록하는 RT의 원리와 대조합니다.",
      "표면개구·누설자속·초음파 반사 원리를 쓰는 다른 탐상법을 제외합니다.",
    ],
    keyRule:
      "X선 또는 γ선의 투과량 차이를 필름이나 검출기에 영상화하면 방사선투과검사(RT)입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "자분탐상검사는 강자성체를 자화했을 때 결함 부근의 누설자속에 자분이 모이는 현상을 이용합니다.",
        plausibleReason:
          "내부 결함을 찾는 검사라는 넓은 인상 때문에 방사선 검사와 혼동할 수 있습니다.",
        incorrectPoint:
          "X선·γ선과 필름 감광을 사용하지 않고 자화와 자분 지시를 사용합니다.",
        keyRule:
          "MT의 직접 단서는 강자성체, 자화, 누설자속, 자분입니다.",
        differenceFromCorrect:
          "정답 RT는 방사선 투과 영상을 만들지만 MT는 누설자속의 자분 지시를 관찰합니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "침투탐상검사는 표면에 열린 결함 속으로 침투액이 스며드는 모세관 현상을 이용합니다.",
        plausibleReason:
          "결함을 눈으로 나타낸다는 공통점 때문에 필름에 나타내는 RT와 섞일 수 있습니다.",
        incorrectPoint:
          "PT는 표면개구 결함용이며 방사선과 투과 사진을 사용하지 않습니다.",
        keyRule:
          "PT의 직접 단서는 침투액, 현상제, 표면에 열린 결함입니다.",
        differenceFromCorrect:
          "정답 RT는 시험체를 통과한 방사선을 기록하지만 PT는 표면 침투액의 지시를 봅니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "초음파탐상검사는 초음파 펄스가 결함 경계에서 반사되거나 투과되는 신호를 분석합니다.",
        plausibleReason:
          "시험체를 통과하는 에너지를 이용한다는 점 때문에 방사선 투과와 헷갈릴 수 있습니다.",
        incorrectPoint:
          "UT는 초음파와 탐촉자 신호를 사용하며 X선·γ선 필름 감광법이 아닙니다.",
        keyRule:
          "UT의 직접 단서는 초음파, 탐촉자, 에코 또는 반사 신호입니다.",
        differenceFromCorrect:
          "정답 RT는 방사선 영상의 농도 차이를 사용하고 UT는 음향 반사 신호를 사용합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "방사선투과검사는 X선 또는 γ선의 투과량 차이를 필름이나 검출기에 영상으로 기록합니다.",
        plausibleReason:
          "지문의 방사선 종류와 필름 감광이라는 두 단서가 RT의 정의와 정확히 일치합니다.",
        incorrectPoint: null,
        keyRule:
          "방사선 투과량 차이를 영상화하는 비파괴검사는 RT로 판정합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-b21592e6-d7fb-4390-85f3-6ff9855b9209",
    "6c905ac2df6a2436e250bb255154a65b6998cb8e46529482e44b6195ebb5b8cd",
    "application",
    [
      "lesson_target_missing: 제안된 lesson-welding-defect-spatter가 공개 레슨에 존재하지 않음",
      "answer_condition_needs_review: 짧은 아크와 스패터의 관계를 전류·극성·용접봉 조건별로 검증할 직접 근거가 필요함",
    ],
  ),
  holdCandidate(
    "wcbt-b2b00455-83d5-4f41-ad50-44912757fb0c",
    "a143a45cb3d5cf77cead999928c2e0073273d096ba053c260c4220d0faaad9ab",
    "safety",
    [
      "safety_primary_official_source_not_bound: 산소용기 각인 항목을 확인할 고압가스 공식 원문 URL이 연결되지 않음",
      "terminology_version_needs_review: 최저 충전압력과 각인 항목의 적용 법령·표준 시점 확인이 필요함",
    ],
  ),
  holdCandidate(
    "wcbt-b34a687d-d4ee-48b1-95d8-68dd905a351b",
    "e6f97f033310b0a80925ce36e2cd932224fd73abb8bed3aef080b86d9bbbf69b",
    "principle",
    [
      "missing_direct_lesson_evidence: 전류 증가 시 아크 저항과 전압이 낮아지는 부저항 특성이 레슨에 직접 서술되지 않음",
      "choice_definition_gap: 상승·수하·정전압·부저항 특성의 같은 기준 비교표가 필요함",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-b37a80db-aab9-4a62-bcd3-c06e960f18b8",
    essentialRank: 1,
    essentialRationale:
      "전류·저항·통전시간으로 줄열을 계산하고 cal로 환산하는 핵심 계산 문항입니다.",
    contentDigest:
      "84d4e863f4a8ea75f8480cf44fd730f16a90d9d12d2a533f0cdb79a492f67ede",
    assessmentKind: "calculation",
    lessonId: "lesson-welding-resistance",
    lessonBlockId: "definition",
    assertionText:
      "줄열의 표준 관계는 Q=I²Rt [J]입니다. 여기서 I는 전류[A], R은 저항[Ω], t는 통전시간[s]입니다. 1 cal=4.186 J이므로 J에서 cal로 바꿀 때는 4.186으로 나누고, cal에서 J로 바꿀 때는 4.186을 곱합니다.",
    derivationRef:
      "Q(cal)=I^2Rt/4.186=(25^2×20×10)/4.186≈29,861cal≈30,000cal",
    answerExplanation:
      "저항용접의 줄열은 J 단위로 I²Rt이고, cal로 바꾸려면 4.186으로 나눕니다. 25²×20×10÷4.186은 약 29,861cal이므로 가장 가까운 30,000cal이 정답입니다.",
    solutionSteps: [
      "계산식은 Q=I²Rt [J]이고 Q[cal]=Q[J]÷4.186입니다.",
      "값을 대입하면 Q=(25A)²×20Ω×10s=125,000J이고, 이 값을 4.186으로 나눕니다.",
      "계산 결과는 29,861cal이므로 보기 중 가장 가까운 네 번째를 선택합니다.",
    ],
    keyRule:
      "저항용접 발열량은 Q(J)=I²Rt이며 cal로 묻는 경우 4.186으로 나눕니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "substitution_error",
        rationale:
          "300cal은 전류 제곱과 통전시간을 모두 반영한 계산값 29,861cal보다 약 100배 작습니다.",
        plausibleReason:
          "25×20을 먼저 계산한 뒤 제곱이나 시간 10초를 빠뜨리면 작은 값에 끌릴 수 있습니다.",
        incorrectPoint:
          "저항 발열식에서 전류는 1승이 아니라 제곱으로 들어가고 통전시간도 곱해야 합니다.",
        keyRule:
          "I²와 t를 모두 표시한 뒤 단위 환산을 마지막에 수행합니다.",
        differenceFromCorrect:
          "정답 30,000cal은 I²Rt 전체를 계산한 값이고 300cal은 필수 인자를 누락한 규모입니다.",
      },
      {
        choiceIndex: 1,
        relation: "substitution_error",
        rationale:
          "1,200cal은 125,000J을 올바르게 cal로 환산한 약 29,861cal과 일치하지 않습니다.",
        plausibleReason:
          "전류 25A를 제곱하지 않거나 환산계수를 중간에 잘못 적용하면 이 범위의 값이 나올 수 있습니다.",
        incorrectPoint:
          "I² 대신 I를 쓰면 전류의 제곱 비례 관계를 잃습니다.",
        keyRule:
          "전류가 두 배면 발열량은 네 배가 되므로 반드시 제곱합니다.",
        differenceFromCorrect:
          "정답은 전류 제곱을 반영해 약 3만 cal이고 1,200cal은 발열량을 크게 과소평가합니다.",
      },
      {
        choiceIndex: 2,
        relation: "unit_error",
        rationale:
          "6,000cal은 J와 cal의 환산 또는 저항·시간 곱셈 과정이 맞지 않은 값입니다.",
        plausibleReason:
          "4.186을 잘못 곱하거나 일부 값만 환산하면 중간 크기의 보기가 그럴듯해 보입니다.",
        incorrectPoint:
          "125,000J은 4.186으로 나누어 약 29,861cal이 되어야 합니다.",
        keyRule:
          "J에서 cal로 바꿀 때 1cal=4.186J이므로 J값을 4.186으로 나눕니다.",
        differenceFromCorrect:
          "정답 30,000cal은 올바른 에너지 환산값이고 6,000cal은 약 5분의 1 수준입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "25²×20×10÷4.186은 약 29,861cal로 계산되어 30,000cal에 가장 가깝습니다.",
        plausibleReason:
          "전류 제곱, 저항, 시간과 J→cal 환산을 모두 적용하면 이 값이 직접 나옵니다.",
        incorrectPoint: null,
        keyRule:
          "Q(cal)=I²Rt/4.186을 순서대로 대입해 최종 보기와 반올림 비교합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-b3994f0f-2d47-4b78-bfa3-f31e17193ca0",
    "d6dad0ca9d5841e4d8d15b142f0bc0b017dea709be6fb98e4940764f3a341aec",
    "definition",
    [
      "missing_direct_lesson_evidence: UT의 펄스반사법·투과법·공진법 분류와 관통법 제외 근거가 레슨에 없음",
      "choice_taxonomy_gap: 초음파탐상 세부 방법의 같은 분류 기준을 먼저 보강해야 함",
    ],
  ),
  holdCandidate(
    "wcbt-b44c6391-c091-4a30-86f4-4db7cc66e042",
    "c86b1ec6c4db85b11dffd237585c67cc37f04955f0b421759a2a2c610f771b14",
    "safety",
    [
      "safety_primary_official_source_not_bound: 아크용접 재해 유형을 확인할 공식 원문 URL이 연결되지 않음",
      "term_scope_ambiguity: 전도를 넘어짐 재해로 읽을지 전기 전도 현상으로 읽을지 원문 용어 확인이 필요함",
    ],
  ),
  holdCandidate(
    "wcbt-b51a0d4b-4ffa-42a6-9541-d67601f6991d",
    "11a158c2e2b972d1c73456333c0e21b94ed0a72258e32ea7477487f92149396b",
    "definition",
    [
      "lesson_target_missing: 제안된 lesson-welding-defect-undercut가 공개 레슨에 존재하지 않음",
      "classification_scope_gap: 구조상 결함과 용접 후 변형을 구분하는 직접 정의가 필요함",
    ],
  ),
  holdCandidate(
    "wcbt-b5db8dcc-598a-43ae-abff-96661bcf2707",
    "07ab6b23ce71a2763f2dcf587b194da5a5612648f7736f22cf69d05abb77aa68",
    "definition",
    [
      "missing_direct_lesson_evidence: 용접봉 용융속도를 단위시간당 소비 길이로 정의한 문장이 레슨에 없음",
      "measurement_definition_gap: 비드 진행속도·입열·전류와 구분하는 직접 기준을 보강해야 함",
    ],
  ),
  holdCandidate(
    "wcbt-b5e2cfc4-48d4-4371-ab60-ad0c33cf9554",
    "be118670ed472fa85edc95098e6c66c3e661dad949cc7f89e1a601f87a1b7f12",
    "safety",
    [
      "safety_primary_official_source_not_bound: 자동전격방지장치 설치·점검 기준의 공식 원문 URL이 연결되지 않음",
      "absolute_statement_needs_review: 홀더 절연이 충분하면 전격방지장치가 불필요하다는 단정의 적용 조건 확인이 필요함",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-b6170b72-ebf1-423e-a924-1ab656c039ba",
    contentDigest:
      "6c1968b1c7e8d7ca105bfa3f755ccbb6243a412a02a8e660052ebfb5271315ed",
    assessmentKind: "definition",
    lessonId: "lesson-welding-inspection-ndt",
    lessonBlockId: "definition",
    assertionText:
      "비파괴검사는 제품을 사용 불가능하게 파괴하지 않고 결함 또는 재료 상태를 확인합니다.",
    answerExplanation:
      "자분탐상, 침투탐상, 초음파탐상은 시험체를 사용 불가능하게 파괴하지 않고 결함을 찾는 비파괴검사입니다. 샤르피충격시험은 노치 시편을 충격 파단시켜 흡수에너지를 측정하는 파괴시험이므로 세 번째 보기가 정답입니다.",
    solutionSteps: [
      "각 보기가 시험체를 파괴하지 않고 결함을 찾는 탐상법인지 확인합니다.",
      "자분·침투·초음파 탐상은 비파괴검사 묶음으로 분류합니다.",
      "시편을 충격으로 파단하는 샤르피충격시험을 비파괴검사가 아닌 항목으로 선택합니다.",
    ],
    keyRule:
      "샤르피충격시험은 시편을 파단하는 기계적 성질 시험이고 MT·PT·UT는 비파괴탐상입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "자기탐상시험은 강자성체를 자화하고 누설자속에 모이는 자분으로 결함을 찾는 비파괴검사입니다.",
        plausibleReason:
          "자기장을 가하는 과정이 재료에 영향을 준다고 생각해 파괴시험으로 오해할 수 있습니다.",
        incorrectPoint:
          "자화는 시험체를 사용 불가능하게 파괴하는 절차가 아닙니다.",
        keyRule:
          "자분탐상(MT)은 대표적인 표면·근표면 비파괴검사입니다.",
        differenceFromCorrect:
          "정답 샤르피시험은 시편을 실제 파단하지만 자기탐상은 파괴 없이 지시를 관찰합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "침투탐상시험은 표면개구 결함에 침투한 액을 현상해 지시를 보는 비파괴검사입니다.",
        plausibleReason:
          "세척제와 침투액을 사용하는 여러 단계 때문에 재료를 손상시키는 시험처럼 느낄 수 있습니다.",
        incorrectPoint:
          "적정 절차의 침투탐상은 시편을 파단해 성질을 측정하는 시험이 아닙니다.",
        keyRule:
          "침투액·세척·현상으로 표면개구 결함을 찾으면 PT입니다.",
        differenceFromCorrect:
          "정답은 충격 파단 시험이지만 PT는 표면에 나타난 침투액 지시를 확인합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "샤르피충격시험은 노치 시편을 충격으로 파단해 흡수에너지와 충격인성을 측정합니다.",
        plausibleReason:
          "시편을 실제 파단한다는 절차가 비파괴검사가 아니라는 판정의 직접 근거입니다.",
        incorrectPoint: null,
        keyRule:
          "시험 후 시편이 파단되는 샤르피충격시험은 파괴시험으로 분류합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "초음파탐상시험은 결함 경계에서 반사되는 초음파 신호를 분석하는 비파괴검사입니다.",
        plausibleReason:
          "고주파 에너지를 시험체에 넣는다는 표현 때문에 손상 시험으로 오인할 수 있습니다.",
        incorrectPoint:
          "UT는 탐촉자의 음향 신호를 분석하며 시편을 충격 파단하지 않습니다.",
        keyRule:
          "초음파와 반사 에코가 단서이면 비파괴검사 UT입니다.",
        differenceFromCorrect:
          "정답 샤르피시험은 파단 후 에너지를 재지만 UT는 파괴 없이 반사 신호를 판독합니다.",
      },
    ],
  }),
  {
    canonicalId: "wcbt-b66c9d94-9ade-4311-8b95-e6fc5eba2264",
    contentDigest:
      "0ac7f2cf6cc9767be29cc4abb9e618f11c0dd9a96b204eb08f0396b676a1d253",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "structure",
      assertionText:
        "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-fire#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-b66c9d94-9ade-4311-8b95-e6fc5eba2264",
        },
      ],
    },
    answerExplanation:
      "D급은 금속 자체가 연소하는 금속 화재를 뜻합니다. 따라서 네 번째 보기인 금속 화재가 D급에 해당합니다.",
    solutionSteps: [
      "레슨의 A·B·C·D급 대응에서 D급의 대상을 확인합니다.",
      "목재·종이, 유류, 전기는 각각 A·B·C급이므로 네 번째 금속 화재를 선택합니다.",
    ],
    keyRule:
      "D급은 일반 가연물·유류·전기설비가 아니라 금속 자체의 연소를 다루는 금속 화재입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "목재와 종이는 연소 후 재가 남는 대표적인 일반 가연물로 A급 화재에 속합니다.",
        plausibleReason:
          "목재가 고체라는 점만 보고 금속도 고체이므로 같은 등급이라고 오인할 수 있습니다.",
        incorrectPoint:
          "일반 가연물의 A급을 금속 연소의 D급과 혼동했습니다.",
        keyRule: "목재·종이·섬유 같은 일반 가연물 화재는 A급입니다.",
        differenceFromCorrect:
          "정답은 금속 자체가 타는 D급이고, 이 보기는 목재·종이가 타는 A급입니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "휘발유·등유 같은 유류와 가연성 액체의 화재는 B급으로 분류합니다.",
        plausibleReason:
          "금속 화재와 유류 화재 모두 물 사용이 부적합할 수 있어 같은 등급처럼 느껴질 수 있습니다.",
        incorrectPoint:
          "유류·가연성 액체의 B급을 금속 화재의 D급으로 잘못 분류했습니다.",
        keyRule: "유류가 연소하는 화재는 B급으로 판정합니다.",
        differenceFromCorrect:
          "정답은 금속의 D급이고, 이 보기는 액체 연료의 B급입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "통전된 배선·전기기기 등 전기설비 화재는 C급 화재입니다.",
        plausibleReason:
          "금속 외함을 가진 전기기기를 떠올리면 금속 화재로 잘못 볼 수 있습니다.",
        incorrectPoint:
          "전기설비가 타는 C급과 금속 자체가 연소하는 D급을 구분하지 않았습니다.",
        keyRule:
          "전기기기의 금속 외함이 아니라 통전 중 전기설비가 위험원이면 C급입니다.",
        differenceFromCorrect:
          "정답은 금속 자체의 연소이고, 이 보기는 통전 전기설비의 화재입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "마그네슘·나트륨 등 가연성 금속이 타는 화재가 D급 금속 화재입니다.",
        plausibleReason:
          "레슨의 D급 정의와 보기의 ‘금속 화재’가 그대로 대응합니다.",
        incorrectPoint: null,
        keyRule: "금속 자체의 연소는 D급 화재로 분류합니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-b6dcab8c-097d-4aa9-9e5d-e589400ed107",
    "3d2d70cdb26975fa7d178afbaf9294531f0fad9fe12e733375c98779931ae02b",
    "safety",
    [
      "safety_primary_official_source_not_bound: 산소용기 보관·취급 기준의 공식 원문 URL이 연결되지 않음",
      "choice_wording_issue: ‘웁혀서’로 복원된 보기의 원문 오탈자 여부도 함께 확인해야 함",
    ],
  ),
  holdCandidate(
    "wcbt-b6ec049a-3023-487c-b28a-cac96dec3e9d",
    "b904de3755d1fd13aebdb5eeff5dd6b225f9d6058148bc9979efcdfeccf0a68c",
    "safety",
    [
      "safety_primary_official_source_not_bound: 자동전격방지장치의 무부하전압 기준을 확인할 공식 원문 URL이 연결되지 않음",
      "lesson_mismatch: 제안 레슨은 용접봉·피복제이고 문항의 직접 개념은 감전 방지 전기안전임",
    ],
  ),
  holdCandidate(
    "wcbt-b7446bb2-a6d3-4e8d-bd4c-37cc2d15f6b8",
    "faba6ff929f6abf25df8f4e3a59228ec58adec1e7d92ecc4b14c97e6b7795164",
    "principle",
    [
      "missing_direct_lesson_evidence: 직류 용접기와 고주파 발생장치 병용 시 아크 발생이 쉬워진다는 설명이 레슨에 없음",
      "device_effect_gap: 고주파의 점호 역할과 전격·무부하전압 선택지를 구분할 근거를 보강해야 함",
    ],
  ),
  holdCandidate(
    "wcbt-b8eed5d3-45f3-4817-ae0c-16b24edc2aef",
    "65108a6214e0eaba9858c44ccc4d5958c4bf519284322df13fd9cf1b810bd4aa",
    "calculation",
    [
      "missing_direct_formula_evidence: 용해 아세틸렌 1kg당 약 905L 환산 근거가 레슨에 없음",
      "calculation_derivation_hold: 충전량 3kg×905L/kg=2715L을 공개하려면 직접 근거가 필요함",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-b98bb4f6-b005-4c3e-8d05-a7ffc7529ed3",
    essentialRank: 2,
    essentialRationale:
      "역변형법을 잔류응력 제거가 아닌 용접 전 변형 제어법으로 구분하는 문항입니다.",
    contentDigest:
      "46e4c913094638f77a00412af197203934e0b619afb3af17eba633ef9e00738f",
    assessmentKind: "application",
    lessonId: "lesson-welding-foundation-deformation",
    lessonBlockId: "structure",
    assertionText:
      "역변형법은 예상 수축 방향의 반대로 미리 변형시켜 냉각 후 목표 형상에 접근하게 합니다.",
    answerExplanation:
      "저온응력완화법, 노내풀림법, 피닝법은 잔류응력을 완화하는 방법으로 다뤄집니다. 역변형법은 냉각 수축을 예상해 반대 방향으로 미리 변형시키는 변형 방지·교정 방법이므로 잔류응력 제거 방법이 아닌 네 번째 보기가 정답입니다.",
    solutionSteps: [
      "문제가 잔류응력 제거 방법이 아닌 항목을 찾는 부정형임을 표시합니다.",
      "저온응력완화·노내풀림·피닝을 응력 완화 방법으로 분류합니다.",
      "미리 반대 변형을 주어 최종 형상을 맞추는 역변형법을 변형 제어법으로 구분합니다.",
    ],
    keyRule:
      "역변형법은 예상 수축의 반대 방향으로 미리 형상을 주는 변형 제어법이지 잔류응력 제거법이 아닙니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "저온응력완화법은 비교적 낮은 온도의 국부 가열 등을 이용해 잔류응력을 완화하는 방법으로 분류됩니다.",
        plausibleReason:
          "명칭에 저온이 들어가 완전한 응력 제거가 아니라고 생각해 제외 항목으로 고를 수 있습니다.",
        incorrectPoint:
          "문항의 분류에서는 저온응력완화법 자체가 잔류응력 완화 방법에 포함됩니다.",
        keyRule:
          "응력완화라는 목적이 명시된 방법과 형상 보정 방법을 구분합니다.",
        differenceFromCorrect:
          "정답 역변형법은 형상을 미리 바꾸지만 저온응력완화법은 응력 완화를 직접 목적으로 합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "노내풀림법은 용접물을 노에서 가열·유지·냉각해 잔류응력을 줄이는 대표 열처리 방법입니다.",
        plausibleReason:
          "풀림을 재료 연화만을 위한 처리로 기억하면 잔류응력과의 연결을 놓칠 수 있습니다.",
        incorrectPoint:
          "응력제거 풀림은 용접 후 잔류응력 완화에 직접 사용됩니다.",
        keyRule:
          "노내 가열·유지·서냉은 대표적인 응력제거 열처리 흐름입니다.",
        differenceFromCorrect:
          "정답은 변형을 상쇄하는 기하학적 방법이고 노내풀림은 열처리로 응력을 줄입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "피닝법은 용접부 표면을 타격해 소성변형을 주어 인장 잔류응력을 완화하는 기계적 방법입니다.",
        plausibleReason:
          "타격 작업이 비드 형상 교정처럼 보여 변형 방지법으로만 오해할 수 있습니다.",
        incorrectPoint:
          "피닝의 핵심 목적 중 하나는 인장 잔류응력의 완화입니다.",
        keyRule:
          "피닝은 타격에 의한 소성변형으로 잔류응력을 조절하는 방법입니다.",
        differenceFromCorrect:
          "정답 역변형법은 용접 전에 반대 형상을 주고 피닝은 용접부를 타격해 응력을 완화합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "역변형법은 용접 수축으로 생길 변형을 예상해 그 반대 방향으로 미리 변형시키는 방법입니다.",
        plausibleReason:
          "레슨의 직접 정의가 잔류응력 제거가 아니라 냉각 후 목표 형상 확보에 초점을 둡니다.",
        incorrectPoint: null,
        keyRule:
          "미리 반대 형상을 주는 방법은 변형 제어법으로 분류합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-ba5ac236-873f-47be-813b-1823dc99b131",
    "f26fde3bdb150a0ab2b22d7a057bb7fcaf1339d3c0965e3f7f9675ebed6e8c80",
    "safety",
    [
      "safety_primary_official_source_not_bound: 아세틸렌 자연발화·폭발 혼합비·금속화합물 조건의 공식 원문 URL이 연결되지 않음",
      "numeric_claims_need_primary_review: 406~408℃와 90%·10%, 120℃ 수치의 적용 조건을 직접 검증해야 함",
    ],
  ),
  holdCandidate(
    "wcbt-bb1a153a-4e87-4af7-91df-b63f27b3cc39",
    "cb5fe7c42750e8a7cdbf1322fa08a9f5a3fc170e60af7c99e14734e979e67d4c",
    "safety",
    [
      "safety_primary_official_source_not_bound: MIG 차광도 12~13의 적용 전류 조건을 확인할 공식 원문 URL이 연결되지 않음",
      "missing_operating_condition: 차광도는 공정뿐 아니라 전류 범위에 따라 달라져 지문의 조건이 부족할 수 있음",
    ],
  ),
  holdCandidate(
    "wcbt-bb46e1d0-c14a-41f2-8cb8-609b004f1b9f",
    "c3fb02111a18e9c4db129d545a655d039a6f5e39549c4acf12e447daa7530714",
    "definition",
    [
      "missing_direct_lesson_evidence: 스터드 용접이 압접이 아니라 아크 융접 계열이라는 직접 문장이 레슨에 없음",
      "choice_taxonomy_gap: 저항·마찰·초음파 압접과 스터드 용접의 분류표를 먼저 보강해야 함",
    ],
  ),
] as const;

const FIRE_REVIEWED_AT = "2026-08-03T03:15:00.000Z";
const FIRE_CLASS_SOURCE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s";
const FIRE_CLASS_ASSERTION =
  "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.";

const FINAL_SOURCE_HOLD_REASONS: Readonly<Record<string, string>> = {
  "wcbt-b022cfe8-5cff-47a6-8ba2-7acc8999cfa1":
    "official_source_partial: KOSHA 화재등급표는 B급의 유류·가연성 액체 분류는 확인하지만 현재 선택지와 해설의 휘발유·유기용제·가연성가스 등 세부 대상을 모두 직접 지지하지 못합니다.",
  "wcbt-b19d69fb-e9b7-4444-8621-4b96f2315549":
    "all_choice_direct_binding_missing: 레슨 단언문은 RT와 UT만 직접 비교하며 MT·PT까지 포함한 네 보기의 검사 원리를 같은 수준으로 뒷받침하지 못합니다.",
  "wcbt-b6170b72-ebf1-423e-a924-1ab656c039ba":
    "all_choice_direct_binding_missing: 비파괴검사의 일반 정의만으로는 MT·PT·UT와 샤르피 충격시험의 시험체 파단 여부를 네 보기 전체에 직접 연결할 수 없습니다.",
  "wcbt-b66c9d94-9ade-4311-8b95-e6fc5eba2264":
    "official_source_partial: KOSHA 화재등급표는 D급 금속 화재 분류는 확인하지만 현재 선택지와 해설의 통전 중 설비·마그네슘·나트륨 등 세부 대상을 모두 직접 지지하지 못합니다.",
  "wcbt-b98bb4f6-b005-4c3e-8d05-a7ffc7529ed3":
    "all_choice_direct_binding_missing: 역변형법의 정의는 직접 확인되지만 저온응력완화법·노내풀림법·피닝법을 잔류응력 완화법으로 분류하는 나머지 세 보기를 같은 source locator에서 모두 확인하지 못합니다.",
};

const FIRE_CLASS_CHOICES = [
  {
    label: "A급 일반 화재",
    rationale:
      "A급은 나무·종이 등 일반 가연물이 연소하는 일반 화재입니다.",
    keyRule: "일반 가연물이 타는 화재는 A급으로 분류합니다.",
  },
  {
    label: "B급 유류 화재",
    rationale:
      "B급은 식용유·알코올 등 유류와 가연성 액체가 연소하는 화재입니다.",
    keyRule: "유류·가연성 액체 화재는 B급으로 분류합니다.",
  },
  {
    label: "C급 전기 화재",
    rationale:
      "C급은 통전 중인 전기설비에서 발생한 전기 화재입니다.",
    keyRule: "통전 중 전기설비의 화재는 C급으로 분류합니다.",
  },
  {
    label: "D급 금속 화재",
    rationale:
      "D급은 마그네슘·나트륨 등 가연성 금속 자체가 연소하는 금속 화재입니다.",
    keyRule: "가연성 금속 자체가 타는 화재는 D급으로 분류합니다.",
  },
] as const;

export const WELDING_CBT_ANSWER_REVIEWS_PART_14 =
  RAW_WELDING_CBT_ANSWER_REVIEWS_PART_14.map((entry) => {
    const finalHoldReason = FINAL_SOURCE_HOLD_REASONS[entry.canonicalId];
    if (finalHoldReason) {
      return {
        ...entry,
        authoringDisposition: "hold_candidate" as const,
        reviewStatus: "hold" as const,
        primaryLeafLessonId: null,
        conceptBinding: null,
        answerExplanation: null,
        solutionSteps: [],
        keyRule: null,
        choiceFeedback: null,
        essentialRank: null,
        essentialRationale: null,
        holdReasons: [finalHoldReason],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: FIRE_REVIEWED_AT,
      };
    }

    const correctIndex =
      entry.canonicalId ===
      "wcbt-b022cfe8-5cff-47a6-8ba2-7acc8999cfa1"
        ? 1
        : entry.canonicalId ===
            "wcbt-b66c9d94-9ade-4311-8b95-e6fc5eba2264"
          ? 3
          : null;

    if (correctIndex === null) {
      return entry;
    }

    const isBClass = correctIndex === 1;
    return {
      ...entry,
      reviewStatus: "approved" as const,
      primaryLeafLessonId: "lesson-welding-safety-fire",
      conceptBinding: {
        lessonId: "lesson-welding-safety-fire",
        lessonBlockId: "structure",
        assertionText: FIRE_CLASS_ASSERTION,
        evidenceRefs: [
          {
            kind: "lesson_block" as const,
            ref: "lesson-welding-safety-fire#structure",
          },
          {
            kind: "official_source" as const,
            ref: FIRE_CLASS_SOURCE,
          },
          {
            kind: "source_question" as const,
            ref: entry.canonicalId,
          },
        ],
      },
      answerExplanation: isBClass
        ? "B급 화재는 유류·가연성 액체가 연소하는 화재입니다. 일반 화재는 A급, 전기 화재는 C급, 금속 화재는 D급이므로 2번 유류 화재가 정답입니다."
        : "D급 화재는 가연성 금속 자체가 연소하는 화재입니다. 목재·종이는 A급, 유류는 B급, 전기 화재는 C급이므로 4번 금속 화재가 정답입니다.",
      solutionSteps: isBClass
        ? [
            "질문에서 요구한 화재 등급이 B급임을 표시합니다.",
            "A급 일반 가연물, B급 유류·가연성 액체, C급 전기설비, D급 금속의 대응표를 적용합니다.",
            "유류 화재를 나타낸 2번을 선택합니다.",
          ]
        : [
            "질문에서 요구한 화재 등급이 D급임을 표시합니다.",
            "A급 일반 가연물, B급 유류·가연성 액체, C급 전기설비, D급 금속의 대응표를 적용합니다.",
            "금속 화재를 나타낸 4번을 선택합니다.",
          ],
      keyRule: FIRE_CLASS_ASSERTION,
      choiceFeedback: FIRE_CLASS_CHOICES.map((choice, choiceIndex) => {
        const supports = choiceIndex === correctIndex;
        return {
          choiceIndex,
          relation: supports
            ? ("supports" as const)
            : ("confused_with" as const),
          rationale: choice.rationale,
          plausibleReason: supports
            ? `${choice.label}의 정의가 문항에서 요구한 등급과 직접 일치합니다.`
            : `${choice.label}도 소화기 표기에 함께 쓰이는 화재 등급이라 요구 등급과 혼동하기 쉽습니다.`,
          incorrectPoint: supports
            ? null
            : `${choice.label}을 ${
                isBClass ? "B급 유류 화재" : "D급 금속 화재"
              }와 혼동했습니다.`,
          keyRule: choice.keyRule,
          differenceFromCorrect: supports
            ? null
            : `${choice.label}과 정답인 ${
                isBClass ? "B급 유류 화재" : "D급 금속 화재"
              }는 연소하는 물질이 다릅니다.`,
        };
      }),
      holdReasons: [],
      reviewer: "Codex source-and-binding reviewer parts-11-14",
      reviewedAt: FIRE_REVIEWED_AT,
    };
  });
