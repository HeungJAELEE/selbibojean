type AssessmentKind =
  | "calculation"
  | "definition"
  | "safety"
  | "identification"
  | "principle"
  | "application";

type ChoiceRelation =
  | "supports"
  | "refuted_by"
  | "contradicts"
  | "out_of_scope"
  | "unit_error"
  | "substitution_error"
  | "confused_with"
  | "missing_condition";

type ChoiceFeedback = {
  choiceIndex: number;
  relation: ChoiceRelation;
  rationale: string;
  plausibleReason: string;
  incorrectPoint: string | null;
  keyRule: string;
  differenceFromCorrect: string | null;
};

const AUTHOR = "codex-welding-author-part-19";
const AUTHORED_AT = "2026-08-02T16:08:56.837Z";
const REVIEWER = "codex-welding-reviewer-part-19";
const REVIEWED_AT = "2026-08-02T16:25:43.646Z";

function holdCandidate(
  canonicalId: string,
  contentDigest: string,
  assessmentKind: AssessmentKind,
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

function publishCandidate(input: {
  canonicalId: string;
  contentDigest: string;
  assessmentKind: AssessmentKind;
  lessonId: string;
  lessonBlockId: string;
  assertionText: string;
  answerExplanation: string;
  solutionSteps: string[];
  keyRule: string;
  choiceFeedback: ChoiceFeedback[];
  reviewHoldReasons?: string[];
  essentialRank?: number;
  essentialRationale?: string;
}) {
  if (input.reviewHoldReasons) {
    return holdCandidate(
      input.canonicalId,
      input.contentDigest,
      input.assessmentKind,
      input.reviewHoldReasons,
    );
  }

  return {
    canonicalId: input.canonicalId,
    contentDigest: input.contentDigest,
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: input.assessmentKind,
    primaryLeafLessonId: input.lessonId,
    conceptBinding: {
      lessonId: input.lessonId,
      lessonBlockId: input.lessonBlockId,
      assertionText: input.assertionText,
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: `${input.lessonId}#${input.lessonBlockId}`,
        },
        {
          kind: "source_question",
          ref: input.canonicalId,
        },
      ],
    },
    answerExplanation: input.answerExplanation,
    solutionSteps: input.solutionSteps,
    keyRule: input.keyRule,
    choiceFeedback: input.choiceFeedback,
    essentialRank: input.essentialRank ?? null,
    essentialRationale: input.essentialRationale ?? null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  };
}

const WELDING_CBT_ANSWER_REVIEWS_PART_19_AUTHORED = [
  holdCandidate(
    "wcbt-f1616695-c90c-4df1-8a16-83eab96be481",
    "4618be440761b4bd601a809f08171e38fad149f48f7aeb43e22be4d630de383d",
    "safety",
    [
      "safety_primary_official_source_not_bound: 아세틸렌 누설검사와 용기 취급 절차를 확인할 KOSHA 또는 법령의 직접 URL이 연결되지 않았습니다.",
      "lesson_block_is_not_official_evidence: 현재 레슨은 불꽃으로 누설을 검사하지 않는다는 설명을 담고 있지만 안전 문항 공개에 필요한 공식 1차 근거를 대신하지 못합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f188c6bb-300c-4827-9efd-3cfc26ffbd15",
    "db85236de87ecce2ef491cdae0d0fb5f84ae29342a85219b33873a3c8d649b81",
    "application",
    [
      "lesson_target_missing: 제안된 lesson-welding-process-smaw 레슨이 공개 레슨 목록에 없어 직류 역극성의 용입·용융 특성을 직접 연결할 수 없습니다.",
      "choice_rationale_not_grounded: 비드 폭, 모재 용입, 용접봉 용융속도와 적용 재료 네 보기를 모두 판별할 레슨 근거가 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f1a7d802-f94c-4458-9865-3e6360962150",
    "9495fa3cddb0fdab8674513b087d86adf950ee07db103da746299bfce8fb77d6",
    "safety",
    [
      "lesson_target_mismatch: 산소병 운반 문항이 양중·운반·추락 레슨으로 제안되어 가스용기 취급의 직접 개념과 일치하지 않습니다.",
      "safety_primary_official_source_not_bound: 산소용기 밸브·보호캡·유분 금지·운반 자세를 확인할 공식 1차 출처 URL이 연결되지 않았습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-f1fe152b-068c-4593-80f6-e450c4da1a55",
    contentDigest:
      "794712c4f322b502d9c6e1ffaf6430b387509e77c416b6851ae0993f2b3d986e",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "structure",
      assertionText:
        "자동전격방지장치는 용접하지 않을 때 출력측 무부하전압을 낮춰 위험을 줄입니다. 자동전격방지기는 아크 소멸 후 0.1초 이내에 출력측 무부하전압을 25V 이하로 낮추는 장치입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-f1fe152b-068c-4593-80f6-e450c4da1a55",
        },
      ],
    },
    answerExplanation:
      "피복 아크 용접에서 감전으로부터 용접사를 보호하도록 설계된 장치는 비용접 시 출력측 무부하전압을 낮추는 전격 방지 장치입니다. 원격 제어는 조작 편의, 핫 스타트는 아크 점화 보조, 고주파 발생은 아크 시동·유지 보조 기능이므로 세 번째 보기가 정답입니다.",
    solutionSteps: [
      "지문에서 보호 대상이 감전이고 공정이 피복 아크 용접임을 표시합니다.",
      "네 장치를 무부하전압 저감·원격조작·시동보조 기능으로 나눕니다.",
      "감전 위험을 직접 낮추는 전격 방지 장치를 선택합니다.",
    ],
    keyRule:
      "피복 아크 용접의 전격 방지 장치는 비용접 상태의 출력측 무부하전압을 낮추는 장치입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "원격 제어 장치는 떨어진 위치에서 용접조건을 조절하는 장치이며 출력측 무부하전압을 안전 수준으로 낮추는 전용장치가 아닙니다.",
        plausibleReason:
          "용접기에서 거리를 두고 조작하면 감전 위험도 자동으로 해결된다고 생각할 수 있습니다.",
        incorrectPoint:
          "조작 위치의 변화만으로 홀더와 전극에 남는 무부하전압이 낮아지지는 않습니다.",
        keyRule:
          "감전방지 여부는 원격성보다 비용접 시 출력전압 저감 기능으로 판별합니다.",
        differenceFromCorrect:
          "정답은 출력 전압을 낮추지만 원격 제어 장치는 설정을 멀리서 바꾸게 합니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "핫 스타트 장치는 아크를 쉽게 시작하도록 점화 순간의 출력을 보조하는 기능으로 감전방지용 장치가 아닙니다.",
        plausibleReason:
          "용접기의 전류·전압을 자동 제어한다는 공통점 때문에 안전기능으로 묶기 쉽습니다.",
        incorrectPoint:
          "아크 시동을 강화하는 기능은 비용접 시 무부하전압을 낮추는 기능과 목적이 다릅니다.",
        keyRule:
          "핫 스타트는 시동성, 전격 방지 장치는 비용접 안전성을 위한 기능입니다.",
        differenceFromCorrect:
          "정답은 아크가 없을 때 전압을 낮추지만 핫 스타트는 아크를 만들 때 출력을 돕습니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "전격 방지 장치는 아크가 꺼지면 출력측 무부하전압을 낮춰 용접사의 감전 위험을 직접 줄입니다.",
        plausibleReason:
          "장치의 명칭과 레슨의 무부하전압 저감 기능이 지문의 보호 목적에 정확히 대응합니다.",
        incorrectPoint: null,
        keyRule:
          "자동전격방지장치는 아크 소멸 후 무부하전압을 신속히 낮춥니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "고주파 발생 장치는 비접촉 아크 점화나 아크 유지에 쓰이는 기능으로 피복 아크 용접사의 감전방지 전용장치가 아닙니다.",
        plausibleReason:
          "고주파가 인체에 위험할 수 있다는 점 때문에 이를 통제하는 보호장치라고 반대로 해석할 수 있습니다.",
        incorrectPoint:
          "이 장치는 아크 발생을 보조하며 비용접 출력측 무부하전압을 낮추는 역할이 없습니다.",
        keyRule:
          "고주파 발생은 점화 보조, 전격 방지는 무부하전압 저감으로 기능을 분리합니다.",
        differenceFromCorrect:
          "정답은 감전 위험을 낮추지만 고주파 발생 장치는 용접 아크 형성을 돕습니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  publishCandidate({
    canonicalId: "wcbt-f25dcfe3-5f09-41ec-bb2c-3928bfebde9d",
    contentDigest:
      "f7cba7ddfebe88080572710dc2af4215b8092ab0dc60fbfe6219abd3df1b69c1",
    assessmentKind: "application",
    lessonId: "lesson-welding-special-processes",
    lessonBlockId: "structure",
    assertionText:
      "일렉트로슬래그는 용융 슬래그의 저항열을 이용해 두꺼운 수직 이음을 용접합니다.",
    answerExplanation:
      "일렉트로슬래그용접은 용융 슬래그의 전기저항열로 두꺼운 수직 이음을 높은 용착률로 용접하는 공정입니다. 따라서 박판을 주된 적용 대상으로 보는 설명이 틀립니다. 용융 슬래그가 열원을 덮으므로 정상 용접 중 아크는 직접 보이지 않고, 수직 통로와 수냉 동판으로 용융금속을 가두어야 하므로 복잡한 형상에는 적용이 어렵습니다.",
    solutionSteps: [
      "공정의 열원이 용융 슬래그의 저항열이라는 점을 먼저 확인합니다.",
      "적용 두께와 자세를 확인해 두꺼운 수직 이음에 쓰는 공정임을 판별합니다.",
      "박판 적용이라는 보기가 직접 반대이므로 틀린 특징으로 선택합니다.",
    ],
    keyRule:
      "일렉트로슬래그용접은 박판용 아크용접이 아니라 용융 슬래그 저항열을 이용하는 후판 수직용접입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "두꺼운 수직 이음을 연속적으로 높은 용착률로 용접하므로 일반적으로 작업속도와 생산성이 높은 편입니다.",
        plausibleReason:
          "두꺼운 판을 한 번에 용접하므로 시간이 오래 걸릴 것처럼 보일 수 있습니다.",
        incorrectPoint:
          "후판 다층 아크용접과 비교할 때 높은 용착률을 얻는다는 공정 특성을 놓쳤습니다.",
        keyRule:
          "공정 속도는 판 두께만이 아니라 용착률과 연속 용접 여부로 판단합니다.",
        differenceFromCorrect:
          "정답 보기는 적용 두께를 반대로 설명하지만 이 보기는 높은 생산성이라는 실제 특성입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "레슨은 일렉트로슬래그가 두꺼운 수직 이음을 용접한다고 명시하므로 박판에 주로 이용된다는 설명이 직접 반대입니다.",
        plausibleReason:
          "용접속도가 빠르다는 특징 때문에 얇은 판의 고속 용접에도 적합할 것처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "일렉트로슬래그의 대표 적용은 박판이 아니라 매우 두꺼운 판의 수직 이음입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "용접이 진행되면 열원은 용융 슬래그층 아래에 형성되어 아크가 외부에서 직접 보이지 않습니다.",
        plausibleReason:
          "명칭에 용접이 들어가므로 일반 아크용접처럼 아크가 계속 노출될 것으로 오해하기 쉽습니다.",
        incorrectPoint:
          "용융 슬래그층이 열원과 용융부를 덮는 공정 구조를 고려하지 않았습니다.",
        keyRule:
          "일렉트로슬래그는 용융 슬래그층 아래에서 저항열로 용접이 진행됩니다.",
        differenceFromCorrect:
          "정답은 적용 두께가 반대인 보기이고, 이 보기는 슬래그층 때문에 생기는 정상 특성입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "수직 이음에서 용융금속을 가두고 전극을 안내해야 하므로 형상이 복잡하면 장치 배치와 용접 진행이 어려워집니다.",
        plausibleReason:
          "높은 생산성을 복잡한 모든 형상에 대한 범용성으로 확대해 생각할 수 있습니다.",
        incorrectPoint:
          "수직 통로와 용융금속 유지 장치가 필요한 공정 제약을 빠뜨렸습니다.",
        keyRule:
          "고생산성 공정이라도 요구 자세와 형상 구속이 크면 복잡한 구조에는 불리합니다.",
        differenceFromCorrect:
          "정답은 후판용 공정을 박판용이라고 한 보기이고, 이 보기는 실제 형상 제약을 설명합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-f2780053-6468-4757-b3d9-1688a5f19728",
    "f43f3fc2b23e7c8326a51f8c0a1194a1b07de9f5aa0e08d7bb0e331e0d630c3c",
    "definition",
    [
      "lesson_target_missing: 제안된 lesson-welding-defect-crack 레슨이 공개 레슨 목록에 없습니다.",
      "missing_direct_defect_evidence: 설퍼 균열·라미네이션 균열·비드 밑 균열의 발생 조건을 서로 구분할 직접 레슨 근거가 없습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-f2a3cc9c-18e0-4356-bc1c-1ba865e29259",
    contentDigest:
      "c482d98c4dce9bdbeccce96c013d84aba41142a4f943d64f5362641f04780699",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-ppe",
    conceptBinding: {
      lessonId: "lesson-welding-safety-ppe",
      lessonBlockId: "structure",
      assertionText:
        "용접면·핸드실드·용접장갑·가죽 앞치마와 가죽 각반은 유해광선·열·불티로부터 신체를 보호하는 보호구이며, 집게·해머·와이어브러시 같은 작업 공구와 구분합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-ppe#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-f2a3cc9c-18e0-4356-bc1c-1ba865e29259",
        },
      ],
    },
    answerExplanation:
      "핸드 실드는 유해광선·비산물로부터 눈과 얼굴을, 용접용 장갑과 앞치마는 열·불티로부터 손과 몸통을 보호하는 보호구입니다. 치핑 해머는 용접 후 슬래그를 두드려 제거하는 작업 공구로 신체에 착용하는 보호구가 아니므로 네 번째 보기가 정답입니다.",
    solutionSteps: [
      "각 보기가 작업자의 신체를 덮거나 착용하는 보호구인지 확인합니다.",
      "핸드 실드·용접용 장갑·앞치마를 광선·열·불티 대응 보호구로 묶습니다.",
      "슬래그 제거 공구인 치핑 해머를 보호구가 아닌 항목으로 선택합니다.",
    ],
    keyRule:
      "아크 용접 보호구는 작업자의 눈·얼굴·손·몸을 보호하며 치핑 해머 같은 슬래그 제거 공구와 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "핸드 실드는 차광면으로 아크광을 줄이고 얼굴로 튀는 비산물을 막는 개인보호구입니다.",
        plausibleReason:
          "손에 들고 조작하므로 슬래그 제거 공구처럼 작업 도구로 분류하기 쉽습니다.",
        incorrectPoint:
          "핸드 실드의 직접 목적은 재료 가공이 아니라 작업자의 눈과 얼굴 방호입니다.",
        keyRule:
          "핸드 실드는 용접면과 같은 유해광선·비산물 보호구입니다.",
        differenceFromCorrect:
          "정답 치핑 해머는 슬래그를 제거하지만 핸드 실드는 눈·얼굴을 보호합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "용접용 장갑은 손을 열·불티와 전기 접촉 위험에서 보호하도록 착용하는 보호구입니다.",
        plausibleReason:
          "용접봉이나 모재를 잡는 데 쓰이므로 단순 작업 보조품이라고 오해할 수 있습니다.",
        incorrectPoint:
          "장갑은 작업물을 가공하는 공구가 아니라 작업자의 손에 착용하는 방호용품입니다.",
        keyRule:
          "손에 착용해 열과 불티 노출을 줄이면 용접 개인보호구로 분류합니다.",
        differenceFromCorrect:
          "정답은 손으로 사용하는 타격 공구이고 이 보기는 손 자체를 보호합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "앞치마는 용접 중 발생하는 열과 불티가 작업자의 몸통과 의복에 닿는 것을 줄이는 보호구입니다.",
        plausibleReason:
          "일반 작업복의 부속품처럼 보여 정식 보호구 범위에서 제외할 수 있습니다.",
        incorrectPoint:
          "가죽 앞치마는 신체를 직접 덮어 열·불티 노출을 낮추는 명시된 용접 보호구입니다.",
        keyRule:
          "앞치마와 각반은 신체 부위를 덮는 열·불티 대응 보호구입니다.",
        differenceFromCorrect:
          "정답 치핑 해머는 슬래그에 작용하지만 앞치마는 작업자의 몸통을 방호합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "치핑 해머는 용접부의 굳은 슬래그를 타격해 제거하는 작업 공구로 착용 보호구가 아닙니다.",
        plausibleReason:
          "용접 후 안전한 비드 점검에 필요하므로 용접 안전용품과 보호구를 혼동할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "해머처럼 재료나 슬래그에 힘을 가하는 물품은 작업 공구이고 신체 보호구가 아닙니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-f2c2332a-e350-4cf6-86ba-d156a035bc93",
    "17324d2f0a53edb0d80f6c3ceaf17b56262875673d9b4fee881b6af57b4561b5",
    "safety",
    [
      "safety_primary_official_source_not_bound: 프로판·이산화탄소·헬륨·산소의 화재위험 분류를 확인할 공식 1차 출처 URL이 연결되지 않았습니다.",
      "chemical_hazard_claim_requires_primary_source: 가연성·조연성·불활성의 구분은 안전 공개 경계이므로 CBT 복원 답만으로 승격하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f3483828-12c5-4cc8-8f64-15bbbd64dbdd",
    "099c88f63273068f9c95cacab70dcbecd620327a99cda5dd4b2642c932eaaf4f",
    "application",
    [
      "missing_direct_material_flame_mapping: 현재 레슨은 탄화불꽃의 혼합비만 설명하고 스테인리스강·모넬메탈 등 재료별 적용표를 제시하지 않습니다.",
      "choice_rationale_not_grounded: 네 재료 조합을 모두 판별할 직접 교재 근거 없이 복원 정답만으로 해설을 만들지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f3ea6923-ff9f-4e21-b0ce-309dc296f93b",
    "60d0a7a1ca693ddf62b6127de700bb62b6521425733068b55ad472017f767656",
    "definition",
    [
      "missing_direct_arc_blow_evidence: 연결 레슨이 아크쏠림의 비대칭 자기장 원리를 설명하지 않습니다.",
      "lesson_scope_mismatch: 용접봉·피복제 레슨만으로 핀치효과·청정작용·단락이행과 아크쏠림을 구분할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f40755ed-7d3f-4569-94c7-08971e2076fc",
    "c91d07dc9744b3cc30a53acbdb650c3ce8d3284e75838209566127dbacf87d48",
    "safety",
    [
      "safety_primary_official_source_not_bound: 아세틸렌과 구리의 폭발성 화합물 생성 조건을 확인할 공식 1차 출처 URL이 연결되지 않았습니다.",
      "material_compatibility_requires_primary_source: 배관 재료 적합성은 안전·화학 조건이므로 일반 화재 레슨만으로 공개하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f411d3f8-5a61-4360-b948-b5a5d1c7e1c9",
    "9e2f83cc660b38adf3b2ea4624547f1d1de82c1d1fe805e16ee99a640417180e",
    "principle",
    [
      "lesson_target_missing: 제안된 lesson-welding-process-gtaw 레슨이 공개 레슨 목록에 없습니다.",
      "missing_direct_high_frequency_evidence: 교류 TIG의 고주파 아크 점화·유지·전극 수명에 관한 직접 근거가 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f4c7f1aa-e109-48a9-b254-57a6c2822297",
    "a0880e795857c51585a6ec9b492a655784b7430da10dba80aac2ca2d69ee9381",
    "safety",
    [
      "safety_primary_official_source_not_bound: 공정별 용접흄 발생량 비교를 확인할 KOSHA 또는 공인 측정자료의 직접 URL이 연결되지 않았습니다.",
      "occupational_health_claim_requires_primary_source: FCAW와 다른 공정의 흄 발생량 비교는 보건 정보이므로 일반 환기 레슨만으로 승격하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f57d62cb-bb21-48ed-84d7-48921ddfe072",
    "bb49e4ca7b7f77dea1300b7b7b46c2d2562c9d8baad76ae1f7d21722b1af14b0",
    "safety",
    [
      "safety_primary_official_source_not_bound: 50mA 이상에서의 치명 위험을 확인할 공식 감전 안전자료의 직접 URL이 연결되지 않았습니다.",
      "numeric_safety_threshold_requires_primary_source: 인체 영향 수치는 경로·시간·주파수 조건에 따라 달라지므로 복원 답만으로 단정하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f5e6ee10-2de5-479a-80b0-a1a8e9f51541",
    "eeac90bd90438f62c7a5c1199a22a545ad95e0da78581836dbc5493165a0d8db",
    "safety",
    [
      "safety_primary_official_source_not_bound: 산소·아세틸렌 조정기와 호스의 교차사용 금지 근거를 확인할 공식 1차 출처 URL이 연결되지 않았습니다.",
      "gas_equipment_compatibility_requires_primary_source: 가스별 전용 부속 사용은 안전 절차이므로 레슨 설명만으로 승격하지 않습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-f6a20fe8-0880-4e2a-9878-0207e051da08",
    contentDigest:
      "db79e3d379c97a75c99eb0d93dc0abc4f44c4dac2520327a71ea8362341e2696",
    assessmentKind: "application",
    reviewHoldReasons: [
      "lesson_assertion_does_not_prove_answer: 연결 문장은 예열불꽃과 절단산소의 역할만 설명하며, 강한 예열불꽃의 네 결과 중 역화만 제외되는 이유를 직접 뒷받침하지 않습니다.",
      "choice_feedback_exceeds_bound_evidence: 모서리 용융·절단면 거칠기·슬래그 박리와 역화 원인을 모두 판별할 직접 교재 또는 공식 근거가 없어 작성된 선택지별 해설을 공개하지 않습니다.",
    ],
    lessonId: "lesson-welding-gas-cutting",
    lessonBlockId: "principle",
    assertionText:
      "예열불꽃은 절단반응을 시작하고 유지하는 온도를 만들며, 절단산소는 산화반응과 산화물 배출을 담당합니다.",
    answerExplanation:
      "예열불꽃이 지나치게 강하면 절단부 주변까지 과도하게 가열되어 윗모서리가 녹아 둥글어지고 절단면이 거칠어지며 슬래그 제거도 나빠질 수 있습니다. 반면 역화는 팁 막힘·과열·모재 접촉이나 가스 압력 이상처럼 불꽃이 팁 안으로 되돌아가는 조건과 직접 연결됩니다. 따라서 강한 예열불꽃의 일반적 결과로 보기 어려운 ‘역화를 일으키기 쉽다’가 틀린 설명입니다.",
    solutionSteps: [
      "예열불꽃의 역할을 절단 시작온도 형성과 유지로 한정합니다.",
      "불꽃이 과도할 때 생기는 과열 결과인 모서리 용융·거친 절단면·슬래그 문제를 묶습니다.",
      "팁 내부로 불꽃이 되돌아가는 역화 원인과 단순한 예열 세기 증가를 구분합니다.",
    ],
    keyRule:
      "강한 예열불꽃은 절단부 과열과 형상 불량을 만들지만 역화는 팁·압력·과열·접촉 조건을 별도로 판단합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "과도한 예열은 절단부 주변을 필요 이상으로 가열하여 절단면의 거칠기와 형상 불량을 키울 수 있습니다.",
        plausibleReason:
          "불꽃이 강하면 절단 반응이 안정되어 표면도 더 매끈해질 것처럼 보일 수 있습니다.",
        incorrectPoint:
          "적정 예열을 넘은 과열이 절단면 품질을 오히려 떨어뜨린다는 점을 놓쳤습니다.",
        keyRule:
          "절단 품질은 불꽃이 강할수록 좋아지는 것이 아니라 적정 예열 조건에서 가장 안정적입니다.",
        differenceFromCorrect:
          "정답은 역화 원인을 단순 예열 세기와 연결한 보기이고, 이 보기는 실제 과열 결과입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "역화는 불꽃이 팁 내부로 되돌아가는 현상으로 팁 막힘·과열·접촉이나 압력 이상을 우선 확인하며 강한 예열불꽃 자체의 대표 결과로 분류하지 않습니다.",
        plausibleReason:
          "불꽃이 강하면 모든 위험이 함께 커질 것이라는 직관 때문에 역화도 직접 증가한다고 생각하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "역화는 예열 세기 하나가 아니라 팁 상태와 가스 흐름·압력 조건으로 판별합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "과도한 예열은 절단선 윗부분의 금속까지 녹여 모서리를 둥글게 만들 수 있습니다.",
        plausibleReason:
          "절단산소가 주된 절단 작용을 하므로 예열불꽃은 모서리 형상에 영향이 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "예열불꽃도 절단부 표면을 직접 가열하므로 과열 시 윗모서리가 용융될 수 있습니다.",
        keyRule:
          "예열불꽃은 절단 반응의 시작온도를 만들지만 지나치면 절단 가장자리를 과열합니다.",
        differenceFromCorrect:
          "정답은 역화 원인의 오분류이고, 이 보기는 과도한 표면 가열에서 생기는 실제 형상 불량입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "예열이 지나치면 절단부와 슬래그가 과열되어 슬래그의 철 성분이 절단면에 더 강하게 달라붙어 제거가 어려워질 수 있습니다.",
        plausibleReason:
          "불꽃이 강하면 슬래그도 더 유동적이 되어 항상 쉽게 떨어질 것처럼 보일 수 있습니다.",
        incorrectPoint:
          "과도한 열로 절단면과 슬래그의 부착 상태가 악화될 수 있다는 조건을 빠뜨렸습니다.",
        keyRule:
          "슬래그 박리성은 단순 온도 상승이 아니라 적정 산화·배출 조건에서 판단합니다.",
        differenceFromCorrect:
          "정답은 역화를 대표 결과로 본 보기이고, 이 보기는 과열에 따른 실제 슬래그 문제입니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-f6e2d9cc-1c74-451a-a94b-7dd84ea556c7",
    "3d9b896f8ab5b91da7359f84fc15b78ea4c3ad32f6df6b35d0c63b76f7266184",
    "application",
    [
      "missing_direct_method_evidence: 연결 레슨에 가스용접 전진법과 후진법의 적용 판두께·속도·변형 비교가 없습니다.",
      "choice_rationale_not_grounded: 후진법의 장점 네 보기를 모두 판별할 직접 비교표나 문장이 없어 공개 후보로 만들지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f7042fb6-cd59-4f0d-8d7f-a79c6ee076be",
    "66c8e5ec0d41965952caa4bfd2353a553dcfc599638378d2afc77dac8c58bffe",
    "safety",
    [
      "lesson_target_missing: 제안된 lesson-1ctkzud 레슨이 공개 레슨 목록에 없어 안전보건표지 색상과 직접 연결할 수 없습니다.",
      "safety_primary_official_source_not_bound: 비상구·피난소·통행표지의 녹색 용도를 확인할 현행 법령 별표 또는 KOSHA 직접 URL이 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f77b67db-0542-40fa-ab23-440aecb7bfd8",
    "3778ec161a1d69c2649f6fbb101f0e673f04d95baa474f7239ccd5ac61b43e29",
    "application",
    [
      "lesson_target_missing: 제안된 lesson-welding-process-smaw 레슨이 공개 레슨 목록에 없습니다.",
      "missing_direct_electrode_classification: 고산화티탄계 피복제 함량·아크·슬래그·균열성과 적용 구조물을 판별할 직접 근거가 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f79ddd21-a686-4eb6-9aeb-63a132c59e6a",
    "5e8229b38700b0baac40e37db7cc9fca2df1a232cb17e786c245d2d7a40363d5",
    "safety",
    [
      "safety_primary_official_source_not_bound: 피복아크용접 75A에서의 차광번호를 확인할 현행 KOSHA 또는 보호구 기준의 직접 URL이 연결되지 않았습니다.",
      "numeric_ppe_table_requires_primary_source: 전류 구간별 차광번호는 수치표이므로 일반 보호구 레슨만으로 승격하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f7d0db74-b25d-49e0-892f-061828641c40",
    "c70e96f213a87237f34dbaae078d368784d63eb7d90f0ad4ad991ca627f63691",
    "safety",
    [
      "safety_primary_official_source_not_bound: 50mA 이상 감전 위험 수치를 확인할 공식 감전 안전자료의 직접 URL이 연결되지 않았습니다.",
      "numeric_safety_threshold_requires_primary_source: 전류의 인체 영향은 통전시간·경로·주파수 조건과 함께 다뤄야 하므로 복원 답만으로 공개하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f89970bc-935a-4b92-986a-1cf9a8a85e4a",
    "5944420614924297814b455e75f405598513bed7cc768b6dd8b5fad57777642a",
    "safety",
    [
      "safety_primary_official_source_not_bound: 무부하전압·절연보호구·습윤 작업복에 관한 전격 방지 기준의 공식 1차 출처 URL이 연결되지 않았습니다.",
      "publication_requires_primary_safety_evidence: 레슨의 감전 예방 요약은 유용하지만 안전 문항의 보기별 공개 판정 근거로는 충분하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f930d348-8d63-427e-9737-51fcf85526e8",
    "70f3bbd576f67fb673b1919d6c1d1e1956a7b7024b2eb94dbb5e9ffb8212bc1a",
    "identification",
    [
      "lesson_target_missing: 제안된 lesson-welding-process-smaw 레슨이 공개 레슨 목록에 없습니다.",
      "missing_direct_core_wire_evidence: 피복아크용접봉 심선의 재질을 저탄소림드강으로 판별할 직접 교재 근거가 없습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-fb87cad6-15a6-486f-8a1d-2cd427ee0e66",
    contentDigest:
      "7bd0701e801621922658289e2d959d15b17afa37b2a2a679e81daa44b7da7e6d",
    assessmentKind: "application",
    reviewHoldReasons: [
      "lesson_assertion_does_not_prove_answer: 연결 문장은 마찰열과 축방향 압력이라는 작동원리만 설명하며, 용접시간·치수 정밀도·열영향부·이종금속 적용 특성을 직접 입증하지 않습니다.",
      "choice_feedback_exceeds_bound_evidence: 네 선택지의 성능 비교를 모두 지지하는 레슨 문장 또는 별도 기술 근거가 없어 복원 정답만으로 해설을 공개하지 않습니다.",
    ],
    lessonId: "lesson-welding-foundation-brazing-pressure",
    lessonBlockId: "structure",
    assertionText:
      "저항용접은 전기저항열과 가압력을 쓰고, 마찰용접은 상대운동의 마찰열과 축방향 압력을 이용합니다.",
    answerExplanation:
      "마찰용접은 접합면의 상대운동으로 국부적인 마찰열을 만들고 축방향 압력을 가해 짧은 시간에 접합하는 압접법입니다. 열이 접합부에 집중되어 변형과 열영향부가 비교적 작고, 공정 제어가 쉬워 치수 재현성과 생산성이 높으며 적절한 재료 조합에서는 이종금속 접합도 가능합니다. 따라서 ‘용접시간이 길고 치수의 정밀도가 낮다’는 설명이 일반적 특징과 반대입니다.",
    solutionSteps: [
      "마찰용접의 에너지원이 상대운동의 마찰열이고 접합력은 축방향 압력임을 확인합니다.",
      "국부 가열과 짧은 자동 사이클이 변형·열영향부·생산성에 미치는 영향을 연결합니다.",
      "긴 용접시간과 낮은 치수 정밀도를 묶은 보기를 반대 특징으로 선택합니다.",
    ],
    keyRule:
      "마찰용접은 국부 마찰열과 축방향 압력으로 짧고 반복 정밀한 접합을 만드는 압접법입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "가열 영역과 작업시간이 제한되고 공정을 자동화하기 쉬워 생산성이 높으며 전체 변형도 비교적 작습니다.",
        plausibleReason:
          "회전·가압 장치가 필요하므로 준비시간까지 포함하면 작업능률이 낮을 것처럼 보일 수 있습니다.",
        incorrectPoint:
          "설비 준비와 실제 용접 사이클의 높은 반복 생산성을 구분하지 않았습니다.",
        keyRule:
          "마찰용접의 생산성은 짧은 접합 사이클과 자동화 가능성으로 판단합니다.",
        differenceFromCorrect:
          "정답은 시간과 정밀도를 반대로 설명하지만 이 보기는 일반적인 생산성 장점입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "마찰용접은 짧은 시간에 반복 제어가 가능하고 치수 재현성이 좋은 공정이므로 긴 시간과 낮은 정밀도라는 설명이 반대입니다.",
        plausibleReason:
          "회전·마찰·업셋의 여러 단계가 있어 전체 시간이 길고 치수도 흔들릴 것처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "마찰용접은 공정 변수를 기계적으로 제어해 짧은 사이클과 높은 반복 정밀도를 얻습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "열이 접합면에 국부적으로 발생하므로 열영향부가 좁고 전체 모재의 열변형이 작아 양호한 이음 성능을 얻을 수 있습니다.",
        plausibleReason:
          "마찰열이 매우 높다는 표현 때문에 모재 전체의 열영향부도 넓을 것으로 오해할 수 있습니다.",
        incorrectPoint:
          "발생 열량보다 열이 집중되는 위치와 가열시간이 열영향부를 좌우한다는 점을 놓쳤습니다.",
        keyRule:
          "국부 가열 공정은 전체 모재를 오래 가열하는 공정보다 열영향부와 변형을 줄이기 쉽습니다.",
        differenceFromCorrect:
          "정답은 시간·정밀도를 반대로 설명하고, 이 보기는 국부 가열의 실제 장점입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "용가재나 차폐가스 없이 기계적 조건을 제어하는 공정이며 적절한 조합에서는 서로 다른 금속도 접합할 수 있습니다.",
        plausibleReason:
          "이종금속은 융점과 성질이 달라 모든 용접법에서 접합이 불가능하다고 생각할 수 있습니다.",
        incorrectPoint:
          "모재 전체를 용융하지 않는 압접 특성이 이종금속 접합에 유리할 수 있다는 점을 빠뜨렸습니다.",
        keyRule:
          "이종금속 가능 여부는 공정이 모재를 완전 용융하는지와 금속 간 반응·형상 조건을 함께 봅니다.",
        differenceFromCorrect:
          "정답은 공정 시간과 정밀도를 거꾸로 설명하지만 이 보기는 마찰용접의 활용 장점입니다.",
      },
    ],
  }),
  {
    canonicalId: "wcbt-fcc15073-28c6-48bb-b735-8ee30957ed8b",
    contentDigest:
      "81d077acfdb63ddcb94a492b94d4756620f8353b1970e6aada36c633fdf04831",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "structure",
      assertionText:
        "용기 도색은 산소 녹색, 수소 주황색, 아세틸렌 황색, 액화염소 갈색, 액화암모니아 백색, 액화석유가스(LPG) 밝은 회색으로 구분합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-gas#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.law.go.kr/LSW/flDownload.do?flNm=%5B%EB%B3%84%ED%91%9C+24%5D+%EC%9A%A9%EA%B8%B0%EB%93%B1%EC%9D%98+%ED%91%9C%EC%8B%9C%28%EC%A0%9C41%EC%A1%B0%EC%A0%9C1%ED%95%AD+%EA%B4%80%EB%A0%A8%29%0A&flSeq=51964509",
        },
        {
          kind: "official_source",
          ref: "https://www.law.go.kr/LSW/flDownload.do?bylClsCd=110201&flSeq=157316297&gubun=",
        },
        {
          kind: "source_question",
          ref: "wcbt-fcc15073-28c6-48bb-b735-8ee30957ed8b",
        },
      ],
    },
    answerExplanation:
      "가스용기 도색은 산소 녹색, 수소 주황색, 아세틸렌 황색, LPG 밝은 회색으로 구분합니다. 따라서 아세틸렌을 청색으로 연결한 네 번째 보기가 틀렸습니다.",
    solutionSteps: [
      "문제가 틀린 가스와 용기색의 짝을 묻는 부정형임을 확인합니다.",
      "산소·수소·프로판(LPG)·아세틸렌의 지정색을 보기와 하나씩 대조합니다.",
      "황색이어야 하는 아세틸렌을 청색으로 표시한 보기를 선택합니다.",
    ],
    keyRule:
      "산소는 녹색, 수소는 주황색, 아세틸렌은 황색, LPG는 밝은 회색 용기로 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "산소 충전용기의 도색은 녹색이므로 올바르게 짝지어진 보기입니다.",
        plausibleReason:
          "산소 자체가 무색이어서 용기도 흰색이나 무색 계열일 것이라고 생각할 수 있습니다.",
        incorrectPoint:
          "용기색은 가스의 실제 색이 아니라 공식 식별 기준을 따르므로 산소-녹색은 맞습니다.",
        keyRule:
          "산소 용기는 녹색으로 식별합니다.",
        differenceFromCorrect:
          "이 보기는 공식 색상과 일치하지만, 정답은 아세틸렌의 황색을 청색으로 바꿨습니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "수소 충전용기의 도색은 주황색이므로 올바른 연결입니다.",
        plausibleReason:
          "수소 불꽃이 거의 보이지 않는다는 성질 때문에 주황색 용기와 연결하기 어려울 수 있습니다.",
        incorrectPoint:
          "수소-주황색은 공식 식별표와 일치하므로 틀린 보기가 아닙니다.",
        keyRule:
          "수소 용기는 주황색으로 구분합니다.",
        differenceFromCorrect:
          "이 보기는 수소의 지정색과 맞고, 정답은 아세틸렌의 색을 잘못 연결합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "프로판이 속하는 LPG 용기는 밝은 회색 계열로 구분하므로 보기의 회색 연결은 맞습니다.",
        plausibleReason:
          "프로판이 가연성 연료라 아세틸렌과 같은 황색 용기를 사용할 것이라고 생각할 수 있습니다.",
        incorrectPoint:
          "가연성이라는 공통 성질만으로 같은 색을 쓰지 않으며 LPG는 밝은 회색으로 구분합니다.",
        keyRule:
          "프로판 등 LPG 용기는 밝은 회색 계열로 식별합니다.",
        differenceFromCorrect:
          "이 보기는 LPG 계열의 도색과 맞지만, 정답은 아세틸렌을 청색으로 잘못 표시합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "아세틸렌 용기는 황색이어야 하므로 청색이라는 연결은 공식 도색표와 다릅니다.",
        plausibleReason:
          "산소와 함께 쓰이는 가스라 보호가스 용기의 청색 계열과 혼동할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "아세틸렌은 황색 용기로 식별하며 청색으로 연결하지 않습니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  publishCandidate({
    canonicalId: "wcbt-fd41f16c-fb1e-4943-b917-a0ab7f2c8707",
    contentDigest:
      "6283f16c44d9df9fab63ee29182695cfc6d2217814454d75c2b22bdf6c59321a",
    assessmentKind: "identification",
    reviewHoldReasons: [
      "lesson_assertion_does_not_cover_all_methods: 연결 문장은 프로젝션용접과 플래시버트용접만 직접 설명하며 업셋·퍼커션·원자수소용접의 분류까지 입증하지 않습니다.",
      "classification_requires_direct_evidence: 퍼커션용접의 저항 맞대기 계열 분류와 원자수소용접의 아크 열원에 대한 직접 교재 근거가 없어 선택지별 해설을 공개하지 않습니다.",
    ],
    lessonId: "lesson-welding-resistance",
    lessonBlockId: "structure",
    assertionText:
      "프로젝션용접은 돌기를 이용해 전류와 압력을 국부 집중시키며, 플래시버트용접은 맞대기면의 플래시 가열 후 업셋합니다.",
    answerExplanation:
      "저항용접은 접촉부에 전류를 흘려 발생한 저항열과 가압력을 이용합니다. 업셋용접과 플래시용접은 대표적인 맞대기 저항용접이며, 퍼커션용접도 매우 짧은 아크·방전 뒤 충격 가압으로 맞대어 접합하는 계열로 함께 분류됩니다. 원자수소용접은 텅스텐 전극 사이의 아크와 원자수소의 재결합열을 이용하는 아크용접이므로 저항용접법이 아닙니다.",
    solutionSteps: [
      "저항용접의 공통조건인 접촉부 전류와 가압력을 기준으로 공정명을 분류합니다.",
      "업셋·플래시·퍼커션을 맞대기 접합 계열로 묶습니다.",
      "열원이 원자수소 아크인 보기를 저항열을 쓰지 않는 공정으로 제외합니다.",
    ],
    keyRule:
      "업셋·플래시·퍼커션은 맞대기 압접 계열이고 원자수소용접은 아크열을 쓰는 별도 용접법입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "업셋용접은 맞댄 접합면에 저항열을 발생시키고 축방향 가압으로 업셋해 접합하는 저항용접입니다.",
        plausibleReason:
          "업셋이라는 용어가 용접 뒤 변형 작업만 뜻하는 것처럼 보여 별도 기계가공법으로 오해할 수 있습니다.",
        incorrectPoint:
          "가열 중에도 맞대기면에 전류와 압력이 작용하는 저항용접 원리를 빠뜨렸습니다.",
        keyRule:
          "업셋용접은 맞대기면의 저항가열과 축방향 가압을 함께 사용합니다.",
        differenceFromCorrect:
          "정답은 아크열을 쓰는 원자수소용접이고 이 보기는 저항열과 가압을 쓰는 맞대기 용접입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "퍼커션용접은 짧은 방전 직후 충격적으로 가압해 맞댄 면을 접합하는 공정으로 저항 맞대기 계열에 포함됩니다.",
        plausibleReason:
          "순간 아크가 나타난다는 특징 때문에 일반적인 융접 아크용접으로만 분류하기 쉽습니다.",
        incorrectPoint:
          "짧은 방전 뒤 즉시 가압해 접합하는 맞대기 압접 특성을 놓쳤습니다.",
        keyRule:
          "퍼커션용접은 방전 시간보다 충격 가압과 맞대기 접합 구조를 함께 봐야 합니다.",
        differenceFromCorrect:
          "정답은 아크가 주 열원인 원자수소용접이고 이 보기는 방전 후 가압하는 맞대기 공정입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "플래시용접은 맞대기면에서 플래시로 가열한 뒤 업셋 압력을 가하는 대표적인 맞대기 저항용접입니다.",
        plausibleReason:
          "플래시라는 이름 때문에 빛이나 레이저를 열원으로 쓰는 공정처럼 보일 수 있습니다.",
        incorrectPoint:
          "플래시는 맞대기면의 전기적 접촉과 저항가열 과정에서 발생한다는 점을 놓쳤습니다.",
        keyRule:
          "플래시버트용접은 플래시 가열 다음에 업셋 가압으로 접합을 완성합니다.",
        differenceFromCorrect:
          "정답은 원자수소 아크열 공정이고 이 보기는 전기저항 가열과 업셋을 쓰는 공정입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "원자수소용접은 텅스텐 전극 사이 아크에서 수소가 해리·재결합할 때의 열을 이용하므로 접촉저항열과 가압을 쓰는 저항용접이 아닙니다.",
        plausibleReason:
          "전기에너지를 사용한다는 공통점 때문에 모든 전기용접을 저항용접으로 묶기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "전기를 사용하더라도 열원이 아크인지 접촉저항열인지로 용접법을 구분합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-fffecb03-9c1c-4f9c-9caf-0821b5f0d224",
    essentialRank: 1,
    essentialRationale:
      "현상제와 표면개구 결함 단서로 침투탐상법을 식별하는 공정 판별 문항입니다.",
    contentDigest:
      "956604cd3449933ea1a0e752fd5723805a74c487a1a5acc9c0dce41d9d04b4da",
    assessmentKind: "identification",
    lessonId: "lesson-welding-inspection-ndt",
    lessonBlockId: "principle",
    assertionText:
      "PT는 침투액 적용, 침투, 표면의 과잉 침투액 제거, 현상제(개발제) 적용 순서로 진행하며, 현상제(개발제)는 표면개구 결함에 남은 침투액을 표면으로 끌어올려 지시가 보이게 합니다. 따라서 현상제(MgO, BaCO₃)로 용접부의 표면 결함을 검사한다는 단서는 침투 탐상법을 가리킵니다.",
    answerExplanation:
      "지문의 현상제(MgO, BaCO₃)와 용접부의 표면 결함은 침투 탐상법(PT)의 현상 단계 단서입니다. PT는 침투액 적용, 침투, 표면의 과잉 침투액 제거, 현상제(개발제) 적용 순서로 진행하며, 현상제는 표면개구 결함에 남은 침투액을 표면으로 끌어올려 지시가 보이게 합니다. 따라서 정답 선택지는 침투 탐상법입니다.",
    solutionSteps: [
      "현상제(MgO, BaCO₃)와 용접부의 표면 결함이라는 지문 단서를 확인합니다.",
      "침투 탐상법은 침투액 적용, 침투, 과잉 침투액 제거 뒤 현상제(개발제)를 적용합니다.",
      "현상제(개발제)가 표면개구 결함에 남은 침투액을 끌어올려 지시를 보이게 하므로 침투 탐상법을 선택합니다.",
      "자분·초음파·방사선의 서로 다른 물리 원리를 비교해 제외합니다.",
    ],
    keyRule:
      "현상제(개발제)가 표면개구 결함의 잔류 침투액을 표면으로 끌어올려 지시를 보이게 하는 검사는 침투 탐상법입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "침투 탐상법은 현상제(MgO, BaCO₃)를 적용해 표면개구 결함에 남은 침투액을 끌어올리고 지시를 보이게 하므로, 용접부 표면 결함이라는 지문 단서와 일치합니다.",
        plausibleReason:
          "현상제라는 용어가 사진 필름 현상과 비슷해 방사선투과검사로 오해할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "침투액 적용, 침투, 과잉 침투액 제거, 현상제(개발제) 적용 순서가 침투 탐상법의 직접 식별 단서입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "자분 탐상법은 강자성체의 누설자속에 자분이 모여 지시를 만들며, 현상제(MgO, BaCO₃)가 잔류 침투액을 끌어올리는 용접부 표면 결함 검사와는 다릅니다.",
        plausibleReason:
          "자분도 표면에 분말 형태로 적용될 수 있어 현상제와 겉모습이 비슷하게 느껴질 수 있습니다.",
        incorrectPoint:
          "자분 탐상법의 직접 단서는 자화·누설자속·자분이며, 지문의 현상제(개발제)와 표면개구 결함 단서는 침투 탐상법을 가리킵니다.",
        keyRule:
          "MT는 강자성체·자화·누설자속이고 PT는 침투액·현상제·표면개구 결함입니다.",
        differenceFromCorrect:
          "정답 침투 탐상법은 현상제(개발제)가 잔류 침투액을 끌어올려 지시를 보이게 하지만, 자분 탐상법은 자분이 누설자속에 모입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "초음파 탐상법은 탐촉자에서 보낸 초음파의 반사 신호를 분석하며, 현상제(MgO, BaCO₃)로 잔류 침투액을 끌어올려 용접부 표면 결함의 지시를 만드는 방법이 아닙니다.",
        plausibleReason:
          "표면에서 탐촉자를 대고 검사하므로 표면 결함 검사라는 표현과 연결하기 쉽습니다.",
        incorrectPoint:
          "초음파 탐상법의 직접 단서는 탐촉자·초음파·반사신호이고, 지문의 현상제(개발제)와 표면 결함 단서는 침투 탐상법입니다.",
        keyRule:
          "UT의 식별 단서는 탐촉자·초음파·반사에코이며 현상제가 아닙니다.",
        differenceFromCorrect:
          "정답 침투 탐상법은 현상제(개발제)로 표면개구 결함의 잔류 침투액을 끌어올리지만, 초음파 탐상법은 반사신호로 결함을 판독합니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "방사선투과검사는 X선이나 감마선의 투과량 차이를 필름 또는 검출기에 기록해 내부 건전성을 판독합니다.",
        plausibleReason:
          "필름을 사용하는 전통적 RT의 현상 과정과 문제의 ‘현상제’ 단어를 연결하기 쉽습니다.",
        incorrectPoint:
          "방사선 투과법은 방사선의 투과량 차이를 영상으로 기록하며, 지문의 현상제(MgO, BaCO₃)는 표면개구 결함의 잔류 침투액을 끌어올려 지시를 보이게 하는 침투 탐상법 재료입니다.",
        keyRule:
          "방사선 투과법의 직접 단서는 방사선원·필름·영상이고, 현상제(개발제)로 잔류 침투액을 끌어올리는 순서는 침투 탐상법입니다.",
        differenceFromCorrect:
          "정답 침투 탐상법은 현상제(개발제)로 표면개구 결함의 잔류 침투액을 끌어올리지만, 방사선 투과법은 투과량 차이의 영상으로 결함을 판독합니다.",
      },
    ],
  }),
] as const;

const PART_19_DIRECTNESS_HOLD_REASONS = new Map<string, string>([
  [
    "wcbt-f1fe152b-068c-4593-80f6-e450c4da1a55",
    "independent_directness_audit_all_choice_evidence_incomplete: 자동전격방지장치의 기능은 직접 확인되지만 원격제어·핫스타트·고주파 발생 장치를 오답으로 구분할 레슨 문장과 1차 출처가 없습니다.",
  ],
  [
    "wcbt-f25dcfe3-5f09-41ec-bb2c-3928bfebde9d",
    "independent_directness_audit_all_choice_evidence_incomplete: 일렉트로슬래그의 저항열 원리만 직접 설명하며 나머지 공정 보기의 열원과 용도를 모두 판별할 레슨 문장과 1차 출처가 결속되지 않았습니다.",
  ],
  [
    "wcbt-f2a3cc9c-18e0-4356-bc1c-1ba865e29259",
    "official_locator_directness_incomplete: KOSHA 보호구 자료가 정답 방향은 지지하지만 핸드실드·장갑·앞치마·치핑해머에 관한 현재 선택지 피드백 전체를 같은 locator가 직접 지지하지 않습니다.",
  ],
  [
    "wcbt-fcc15073-28c6-48bb-b735-8ee30957ed8b",
    "official_locator_directness_incomplete: 시험 당시와 현행 용기 색상 기준이 혼재하고 프로판을 LPG 용기색으로 판정하기 위한 직접 정의 출처가 결속되지 않아 네 보기를 모두 확정할 수 없습니다.",
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_19 =
  WELDING_CBT_ANSWER_REVIEWS_PART_19_AUTHORED.map((entry) => {
    const holdReason = PART_19_DIRECTNESS_HOLD_REASONS.get(entry.canonicalId);
    if (!holdReason) {
      return entry;
    }

    return {
      canonicalId: entry.canonicalId,
      contentDigest: entry.contentDigest,
      authoringDisposition: "hold_candidate" as const,
      reviewStatus: "hold" as const,
      assessmentKind: entry.assessmentKind,
      primaryLeafLessonId: null,
      conceptBinding: null,
      answerExplanation: null,
      solutionSteps: [],
      keyRule: null,
      choiceFeedback: null,
      essentialRank: null,
      essentialRationale: null,
      holdReasons: [holdReason],
      author: entry.author,
      authoredAt: entry.authoredAt,
      reviewer: "codex-final-directness-reviewer-parts15-19",
      reviewedAt: "2026-08-03T03:30:00.000Z",
    };
  });
