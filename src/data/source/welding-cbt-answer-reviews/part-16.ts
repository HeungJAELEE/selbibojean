const PART_16_AUTHOR = "codex-part16-author";
const PART_16_AUTHORED_AT = "2026-08-02T16:00:24.114Z";
const PART_16_REVIEWER = "codex-part16-reviewer";
const PART_16_REVIEWED_AT = "2026-08-02T16:11:35.3910466Z";

function holdCandidate(
  canonicalId: string,
  contentDigest: string,
  assessmentKind:
    | "calculation"
    | "definition"
    | "safety"
    | "identification"
    | "principle"
    | "application",
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
    author: PART_16_AUTHOR,
    authoredAt: PART_16_AUTHORED_AT,
    reviewer: PART_16_REVIEWER,
    reviewedAt: PART_16_REVIEWED_AT,
  } as const;
}

const WELDING_CBT_ANSWER_REVIEWS_PART_16_AUTHORED = [
  holdCandidate(
    "wcbt-c8afd1af-91f1-4cde-947c-26d530c5c95b",
    "aa8beff9fc90f79303e771afd0f5aee9a909277bcc875fd228a3071ee62a05ef",
    "application",
    [
      "lesson_missing_direct_medium_pressure_torch_acetylene_range_0.007_to_0.13_mpa",
    ],
  ),
  holdCandidate(
    "wcbt-c8dc3368-3fcd-4383-9aa0-02961d337997",
    "70bb27de18f9fb1b65eb98fb4f3c443613dccc61b7fa5391043728a9c4ba8f6c",
    "identification",
    [
      "lesson_explains_resistance_heat_and_pressure_but_does_not_name_upset_welding",
    ],
  ),
  holdCandidate(
    "wcbt-c8f1fe36-7712-43c1-b228-eaa20988e52e",
    "2e3d26b4d00338bdb0498661e41865aa4c9615a6869965a0cb78749093fcdd07",
    "definition",
    [
      "lesson_missing_direct_definition_of_electrode_melting_rate_as_consumed_length_per_time",
    ],
  ),
  holdCandidate(
    "wcbt-c9940318-4550-4ce9-bf71-c7f810861fd0",
    "5e7f6d58a9f5cb6436eb059a19078cad5cf821cb290fc341c20c03080fa1909f",
    "safety",
    [
      "safety_primary_official_source_missing",
      "lesson_missing_direct_regulator_release_pressure_difference_requirement",
    ],
  ),
  holdCandidate(
    "wcbt-c9de7d4d-db9b-4956-9af7-a312bd3e7d4e",
    "b2791426e145aeeb2ae12145368fee1002d26778c23f78c2a859400b238077bc",
    "safety",
    [
      "safety_primary_official_source_missing",
      "lesson_missing_direct_regulator_screw_clockwise_valve_opening_mechanism",
    ],
  ),
  holdCandidate(
    "wcbt-ca5a48ae-2ed9-477c-b4c9-896abfc18ee2",
    "016eed1c19584b4aa3f7da500450c23764b5455c6a2e67bc6411f73272523a81",
    "safety",
    [
      "safety_primary_official_source_missing",
      "shade_number_depends_on_process_current_and_standard_not_present_in_lesson",
    ],
  ),
  holdCandidate(
    "wcbt-cbe1febc-3857-4d07-9925-14da803dbaac",
    "4f57f33f7787e3c9489307b2da8ba1717192284046ab1db55cabe100d2eeb98f",
    "application",
    [
      "lesson_requires_manufacturer_drying_procedure_but_does_not_support_fixed_300_to_350_celsius",
    ],
  ),
  holdCandidate(
    "wcbt-cbfb7700-fd7f-4fe7-b262-bcbf544fa0a6",
    "2eef2097dadcabc320e73089122957ddaabdfdc57a17533443143d9483d0c80d",
    "safety",
    [
      "safety_primary_official_source_missing",
      "stem_contains_legacy_electron_beam_typo_requiring_source_review",
    ],
  ),
  holdCandidate(
    "wcbt-cc962377-fe06-436e-8fa0-895042a3684e",
    "a287a50e6337ff1f3d47642c7ff5853c1fd4068d34ea456835989e4918c596a4",
    "safety",
    ["safety_primary_official_source_missing"],
  ),
  holdCandidate(
    "wcbt-ccf97e42-9263-4a09-acef-32df7eb9b34c",
    "30c0f07a3daeeed1cca9399c2ae9fcb43b221e3c57dabb1d8f3d305ba6907831",
    "safety",
    [
      "safety_primary_official_source_missing",
      "lesson_missing_direct_co2_30_percent_extreme_hazard_threshold",
    ],
  ),
  holdCandidate(
    "wcbt-cd02234a-2201-4e0d-b017-526e5f875999",
    "272b398795866e669f1021f331348b042036d333fe1c46190be4c2922da70703",
    "safety",
    ["safety_primary_official_source_missing"],
  ),
  holdCandidate(
    "wcbt-cd4322fb-71f8-43ff-88ba-3f94b4faa7b2",
    "22142e54454942cb5e93d7a50b6ffe69210d9691fefe8396ce5c4a9ec331d237",
    "safety",
    [
      "safety_primary_official_source_missing",
      "lesson_missing_direct_cylinder_stamp_symbol_v_and_liter_unit",
    ],
  ),
  holdCandidate(
    "wcbt-cded0304-db1f-43f3-b6b7-058b579531e0",
    "326b684c1e36e70564c1aad1fad065c5be10a0bfaebf6aa66644e0fdd8d32aab",
    "application",
    [
      "lesson_missing_direct_rectifier_dc_welder_maintenance_comparison_with_generator_type",
    ],
  ),
  holdCandidate(
    "wcbt-ce5568b4-be67-4f2e-a451-09a07459ff81",
    "2b8f17e2d1e6007896cd6ee067e9a336b0305704bda37b1bc71e0614ade18d74",
    "identification",
    [
      "lesson_missing_direct_e4316_classification_and_start_end_porosity_characteristic",
    ],
  ),
  holdCandidate(
    "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe",
    "aad621d69701c1a136c0d5f0ddda44305ad875781571933a8a596b006dc646e6",
    "calculation",
    [
      "calculation_condition_ambiguous: 보일의 법칙에는 절대압이 필요하지만 지문의 120kgf/cm²가 게이지압인지 절대압인지 명시되지 않아 4,044L와 약 4,078L 중 하나를 확정할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-cf46554d-76b0-4f70-b7d5-d5e117ac105d",
    "221470e442d7424c42f24c27c0a9ee03afde3bb01cd1c5d45bee3343f12e1e7e",
    "identification",
    [
      "lesson_explains_ut_reflection_but_does_not_directly_classify_gap_method_as_non_ut",
    ],
  ),
  holdCandidate(
    "wcbt-cfe0d4c7-a8db-42d1-9759-c25a03def708",
    "ef528aca64fe94ae69dbee2a0c63880bb9f6d5a18b34969b5011c83ad5bca3d3",
    "safety",
    [
      "safety_primary_official_source_missing",
      "lesson_missing_direct_oxygen_acetylene_85_to_15_maximum_explosion_ratio",
    ],
  ),
  {
    canonicalId: "wcbt-d016bfad-2d67-4140-862e-2e56492d797e",
    contentDigest:
      "ed495048cfaa3561bcc861aa66864acfab44f0205ce30a2690abaef807c01580",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "definition",
    primaryLeafLessonId: "lesson-welding-inspection-ndt",
    conceptBinding: {
      lessonId: "lesson-welding-inspection-ndt",
      lessonBlockId: "definition",
      assertionText:
        "비파괴검사는 제품을 사용 불가능하게 파괴하지 않고 결함 또는 재료 상태를 확인합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-inspection-ndt#definition",
        },
        {
          kind: "source_question",
          ref: "wcbt-d016bfad-2d67-4140-862e-2e56492d797e",
        },
      ],
    },
    answerExplanation:
      "X선 투과시험, 형광침투시험, 초음파시험은 제품을 파괴하지 않고 결함을 확인하는 비파괴검사다. 피로시험은 반복하중을 가해 피로강도나 수명을 평가하며 시험편이 손상·파단될 수 있는 파괴시험이므로 정답이다.",
    solutionSteps: [
      "각 보기가 제품을 사용 불가능하게 파괴하지 않고 검사하는 방법인지 구분한다.",
      "RT·PT·UT는 비파괴검사이고 피로시험은 반복하중을 이용하는 재료시험임을 확인한다.",
      "비파괴검사법이 아닌 세 번째 보기 피로시험을 고른다.",
    ],
    keyRule:
      "검사 후 제품의 사용 가능성을 보존하는 RT·PT·UT와 파단까지 반복하중을 줄 수 있는 피로시험을 구분한다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "X선 투과시험은 투과량 차이로 내부 결함을 확인하는 대표적인 방사선 비파괴검사다.",
        plausibleReason:
          "방사선을 사용하므로 시험체를 손상시키는 검사처럼 느낄 수 있다.",
        incorrectPoint:
          "방사선 사용 여부와 시험체 파괴 여부를 혼동했다.",
        keyRule:
          "RT는 방사선을 투과시키지만 시험체를 절단하거나 파단하지 않는다.",
        differenceFromCorrect:
          "피로시험은 반복하중으로 시험편을 손상시킬 수 있지만 RT는 비파괴검사다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "형광침투시험은 표면에 열린 결함으로 침투액이 스며드는 현상을 이용하는 PT 계열 비파괴검사다.",
        plausibleReason:
          "세척과 현상 과정이 있어 표면을 훼손하는 검사로 오해할 수 있다.",
        incorrectPoint:
          "표면 처리 과정과 제품을 파괴하는 재료시험을 같은 것으로 보았다.",
        keyRule:
          "PT는 비다공성 재료의 표면개구 결함을 파괴 없이 찾는다.",
        differenceFromCorrect:
          "피로시험은 기계적 반복하중을 가하지만 형광침투시험은 표면 결함을 비파괴로 확인한다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "피로시험은 반복하중으로 피로강도와 수명을 평가하며 시험편의 균열 성장이나 파단을 수반할 수 있는 파괴시험이다.",
        plausibleReason:
          "용접부의 건전성을 평가한다는 공통점 때문에 검사법 목록에 함께 보일 수 있다.",
        incorrectPoint: null,
        keyRule:
          "반복하중을 가해 시험편의 수명·파단을 평가하는 피로시험은 비파괴검사가 아니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "초음파시험은 경계면에서 반사되는 초음파 신호를 분석하는 대표적인 비파괴검사다.",
        plausibleReason:
          "탐촉자가 접촉하고 에너지를 입사하므로 시험체를 손상시킨다고 착각할 수 있다.",
        incorrectPoint:
          "초음파 에너지의 입사와 재료의 파괴를 혼동했다.",
        keyRule:
          "UT는 반사 신호로 내부 상태를 확인하며 시험체를 파단하지 않는다.",
        differenceFromCorrect:
          "피로시험은 반복하중에 따른 손상을 평가하지만 UT는 초음파 반사로 비파괴 검사한다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: PART_16_AUTHOR,
    authoredAt: PART_16_AUTHORED_AT,
    reviewer: PART_16_REVIEWER,
    reviewedAt: PART_16_REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-d04cf3b7-0874-44d3-9438-a066fc26bdc8",
    "5a8f71105e5a0d760334d781455494da18f1f60799ee4c5570c3826008118669",
    "safety",
    [
      "source_stem_explicitly_reports_answer_error",
      "safety_primary_official_source_missing",
    ],
  ),
  holdCandidate(
    "wcbt-d10ddb45-60d1-424f-8b14-7430a7158464",
    "1ba52a8d148e1cf5c07484d42cb9d9985101ebba8efc05583925e7df34af7dbd",
    "calculation",
    [
      "lesson_missing_direct_consumed_gas_formula_using_pressure_drop_80_minus_10",
    ],
  ),
  {
    canonicalId: "wcbt-d1cc6867-006c-4d7f-bfad-2c48d66fca53",
    contentDigest:
      "42bc034a376e7954908380892fc81b8694291016978fa2760dab614e96665e24",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "application",
    primaryLeafLessonId: "lesson-welding-foundation-deformation",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-deformation",
      lessonBlockId: "structure",
      assertionText:
        "역변형법은 예상 수축 방향의 반대로 미리 변형시켜 냉각 후 목표 형상에 접근하게 합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-deformation#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-d1cc6867-006c-4d7f-bfad-2c48d66fca53",
        },
      ],
    },
    answerExplanation:
      "가열법·가압법·절단 후 재용접은 이미 생긴 변형을 물리적으로 바로잡는 교정 방법이다. 역변형법은 용접 전에 예상 수축의 반대 방향으로 미리 변형시키는 예방 방법이므로 교정 방법이 아닌 네 번째 보기다.",
    solutionSteps: [
      "문제가 용접 전 예방이 아니라 용접 후 변형 교정 방법을 묻는지 확인한다.",
      "가열·가압·절단 후 재용접은 발생한 변형을 바로잡는 방법으로 분류한다.",
      "용접 전에 반대 방향 변형을 주는 역변형법을 제외 항목으로 고른다.",
    ],
    keyRule:
      "역변형법은 예상 수축을 상쇄하도록 용접 전에 형상을 반대로 주는 예방책이지 용접 후 교정법이 아니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "가열법은 변형 부위를 국부 가열하고 수축을 유도해 이미 생긴 변형을 교정하는 방법이다.",
        plausibleReason:
          "열을 다시 가하므로 변형을 더 만드는 방법처럼 보일 수 있다.",
        incorrectPoint:
          "통제된 교정 가열과 용접 입열에 의한 변형 발생을 구분하지 않았다.",
        keyRule:
          "재질과 온도를 관리한 국부 가열은 변형 교정에 사용할 수 있다.",
        differenceFromCorrect:
          "역변형법은 용접 전 예방이고 가열법은 발생한 변형을 바로잡는 교정이다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "가압법은 프레스나 잭 등으로 기계적 힘을 가해 변형된 부재의 형상을 교정한다.",
        plausibleReason:
          "용접 전 구속 지그로 가압하는 경우와 혼동하기 쉽다.",
        incorrectPoint:
          "교정 목적의 기계적 가압과 용접 전 조립 구속을 같은 것으로 보았다.",
        keyRule:
          "발생한 형상 오차에 반대 방향의 기계적 힘을 주는 것은 교정법이다.",
        differenceFromCorrect:
          "가압법은 변형 후 형상 복원이고 역변형법은 변형 발생 전 보상이다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "심한 변형 부위를 절단해 정형한 뒤 다시 용접하는 방법은 실제 형상을 복구하는 교정 방법이다.",
        plausibleReason:
          "재용접이 다시 변형을 만들 수 있어 교정 방법이 아니라고 생각할 수 있다.",
        incorrectPoint:
          "재변형 위험과 해당 작업의 교정 목적을 혼동했다.",
        keyRule:
          "절단·정형·재용접은 절차 관리가 필요하지만 변형 교정 방법으로 분류된다.",
        differenceFromCorrect:
          "절단 후 재용접은 생긴 변형을 수정하지만 역변형법은 사전 예방이다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "역변형법은 예상 수축의 반대 방향으로 미리 변형해 냉각 후 목표 형상에 맞추는 사전 예방 방법이다.",
        plausibleReason:
          "최종 형상을 바로잡는다는 결과만 보면 교정법처럼 느껴질 수 있다.",
        incorrectPoint: null,
        keyRule:
          "작업 시점이 용접 전이면 역변형 예방, 용접 후면 가열·가압 등의 교정으로 구분한다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: PART_16_AUTHOR,
    authoredAt: PART_16_AUTHORED_AT,
    reviewer: PART_16_REVIEWER,
    reviewedAt: PART_16_REVIEWED_AT,
  },
  {
    canonicalId: "wcbt-d1f709cb-3717-42ad-9551-8c19e93643bb",
    contentDigest:
      "e845e3fd04806dffb283939b8c0a69f34abdacefbd66e7517c92e24ef9dae126",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "application",
    primaryLeafLessonId: "lesson-welding-foundation-electrodes",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-electrodes",
      lessonBlockId: "principle",
      assertionText:
        "저수소계 용접봉은 확산성 수소를 줄이는 데 유리하지만 습기를 먹으면 목적을 잃으므로 제조사와 절차서의 건조·보온 조건을 지켜야 합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-electrodes#principle",
        },
        {
          kind: "source_question",
          ref: "wcbt-d1f709cb-3717-42ad-9551-8c19e93643bb",
        },
      ],
    },
    answerExplanation:
      "저수소계 용접봉은 흡습하면 확산성 수소 저감 성능이 떨어지므로 제조사·절차서에 따른 건조와 보온이 필요하다. 따라서 ‘저수소계 용접봉은 건조를 하지 않는다’가 틀린 첫 번째 보기다.",
    solutionSteps: [
      "문제가 저장·취급상 주의사항 중 틀린 설명을 찾는 것임을 표시한다.",
      "저수소계 용접봉은 흡습 방지를 위해 건조·보온 관리가 필요함을 적용한다.",
      "건조하지 않는다고 단정한 첫 번째 보기를 고른다.",
    ],
    keyRule:
      "저수소계 용접봉은 습기를 차단하고 절차서에 맞게 건조·보온해야 확산성 수소 저감 목적을 유지한다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "저수소계 용접봉은 흡습 시 성능을 잃을 수 있어 건조·보온 관리가 필요하므로 ‘건조하지 않는다’는 설명이 틀리다.",
        plausibleReason:
          "이름에 ‘저수소’가 있어 원래 습기 영향을 받지 않는 용접봉처럼 오해할 수 있다.",
        incorrectPoint: null,
        keyRule:
          "저수소 성능은 자동으로 유지되는 것이 아니라 건조·보온 관리로 지켜야 한다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "충분히 건조된 장소에 보관하는 것은 용접봉 피복제의 흡습을 막는 올바른 주의사항이다.",
        plausibleReason:
          "사용 전에 다시 건조할 수 있으니 보관 장소는 중요하지 않다고 생각할 수 있다.",
        incorrectPoint:
          "재건조가 모든 흡습 손상과 성능 저하를 무조건 복구한다고 보았다.",
        keyRule:
          "재건조보다 먼저 건조한 보관 환경으로 흡습 자체를 예방해야 한다.",
        differenceFromCorrect:
          "이 보기는 올바른 보관법이고 정답 보기는 저수소계 건조를 부정한다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "수분을 흡수한 용접봉은 해당 봉의 제조사·절차서가 허용하는 조건에서 재건조해 사용할 수 있다는 취지다.",
        plausibleReason:
          "모든 흡습 용접봉은 즉시 폐기해야 한다고 단정하면 틀린 보기처럼 보일 수 있다.",
        incorrectPoint:
          "절차에 따른 재건조 가능성과 무조건 재사용을 구분하지 않았다.",
        keyRule:
          "재건조 여부와 조건은 용접봉 종류와 제조사·절차서 기준으로 결정한다.",
        differenceFromCorrect:
          "이 보기는 조건부 재건조 취지이고 정답 보기는 필요한 건조 자체를 부정한다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "피복제가 벗겨지면 차폐·아크 안정·슬래그 형성 기능이 손상되므로 피복 손상을 막는 취급이 맞다.",
        plausibleReason:
          "심선만 전류를 전달한다고 생각하면 피복의 기계적 손상을 가볍게 볼 수 있다.",
        incorrectPoint:
          "피복제가 용접 품질과 아크 특성에 관여한다는 기능을 무시했다.",
        keyRule:
          "피복아크용접봉은 심선뿐 아니라 피복제의 건전성도 유지해야 한다.",
        differenceFromCorrect:
          "이 보기는 올바른 취급법이고 정답 보기는 저수소계 봉의 핵심 건조 관리를 거꾸로 말했다.",
      },
    ],
    essentialRank: 2,
    essentialRationale: "저수소계 용접봉의 건조·보온·흡습 방지 원칙을 취급 보기에서 판별합니다.",
    holdReasons: [],
    author: PART_16_AUTHOR,
    authoredAt: PART_16_AUTHORED_AT,
    reviewer: PART_16_REVIEWER,
    reviewedAt: PART_16_REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-d2a0c21c-d30c-40c0-8a6c-940ea27a8387",
    "819d21d0d4fa8a5c8dc857e656a12b09e02b53d8962bc6903101c4403fe04961",
    "safety",
    ["safety_primary_official_source_missing"],
  ),
  holdCandidate(
    "wcbt-d2d4d97a-7fe8-4e35-a83b-35b4294d79df",
    "2d164fdbb0b0fb1b4c84525d0efbf11e4d68a560cf46c221886f1bd737c17d27",
    "safety",
    ["safety_primary_official_source_missing"],
  ),
  holdCandidate(
    "wcbt-d3f71696-6187-4b10-b7af-3284f188d883",
    "fc7238d9b936b32176524f87604c5553da901fd529b2c2169f724ba9637a9789",
    "identification",
    [
      "lesson_explains_gas_cutting_but_does_not_name_powder_cutting_for_cast_iron_and_stainless",
    ],
  ),
  holdCandidate(
    "wcbt-d588064c-625b-4689-8b7d-6e832b2c0f57",
    "d08863e3d0bf048297dfe42062e84ceed8c66e4c3d5c6ede4583b90e7f2e646a",
    "application",
    [
      "lesson_missing_direct_rule_that_large_shrinkage_joints_precede_small_shrinkage_joints",
    ],
  ),
  holdCandidate(
    "wcbt-d6115815-1f6b-4057-8e47-544623efa126",
    "27b6f3ff46e283dfd36ccd0cc1e4556c4305c3e432476751e92274766caf5aeb",
    "safety",
    [
      "safety_primary_official_source_missing",
      "legacy_numeric_ignition_explosion_and_mixture_claims_require_primary_source_reconciliation",
    ],
  ),
] as const;

const PART_16_DIRECTNESS_HOLD_REASONS = new Map<string, string>([
  [
    "wcbt-d016bfad-2d67-4140-862e-2e56492d797e",
    "independent_directness_audit_all_choice_evidence_incomplete: 비파괴검사의 일반 정의만으로 X선·형광침투·초음파와 피로시험의 네 보기 분류를 모두 직접 판별할 수 없고 1차 출처도 결속되지 않았습니다.",
  ],
  [
    "wcbt-d1cc6867-006c-4d7f-bfad-2c48d66fca53",
    "independent_directness_audit_all_choice_evidence_incomplete: 역변형법의 사전 예방 원리만 직접 설명하며 가열법·가압법·절단 후 재용접을 교정법으로 분류하는 레슨 문장과 1차 출처가 없습니다.",
  ],
  [
    "wcbt-d1f709cb-3717-42ad-9551-8c19e93643bb",
    "independent_directness_audit_all_choice_evidence_incomplete: 저수소계 용접봉의 건조·보온 원칙만 직접 뒷받침하며 일반 보관·재건조·피복 손상에 관한 나머지 보기를 판별할 1차 출처가 결속되지 않았습니다.",
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_16 =
  WELDING_CBT_ANSWER_REVIEWS_PART_16_AUTHORED.map((entry) => {
    const holdReason = PART_16_DIRECTNESS_HOLD_REASONS.get(entry.canonicalId);
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
