const WELDING_CBT_ANSWER_REVIEWS_PART_04_BASE = [
  {
    canonicalId: "wcbt-2b0493d5-8097-4815-860c-032096d15435",
    contentDigest:
      "79d1fb4d2eec25292a22089178db52851f79f80e1733d1687abd4a51bbea62e7",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "oxygen_cylinder_storage_temperature_requires_current_legal_verification",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2c2cef8e-ca25-4816-9d01-676e1b3fba11",
    contentDigest:
      "6763e40cb9f9ee128054e032fd0bec08c913b082f1bc7d34cbb4cf9493a6ace2",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "application",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "direct_lesson_assertion_missing_for_shrinkage_order",
      "riveting_and_welding_sequence_requires_primary_procedure_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2c3a5d4f-ab6b-456e-b51f-f3c1d5c30f5e",
    contentDigest:
      "c5813de78295e092bf807ee32ead51073550fcda8faf5621b32aef1601f5be6c",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "gas_cylinder_color_code_requires_current_legal_verification",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2cf7cb1b-c71c-4563-904c-7d1c9ec9c674",
    contentDigest:
      "d450eec467849b3853fab0a6ee9d89129e7fcb73008ab4352e75761f5c9b795e",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "explosive_mixture_ratio_requires_primary_combustion_evidence",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2e3af0f9-d9ee-4606-887b-a305525d6e79",
    contentDigest:
      "8c37aa34b66a5b4136a7b5f823bbf11e3730b2cee4b0005107b722b68d8c9036",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-resistance",
    conceptBinding: {
      lessonId: "lesson-welding-resistance",
      lessonBlockId: "structure",
      assertionText: "플래시버트용접은 맞대기면의 플래시 가열 후 업셋합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-resistance#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-2e3af0f9-d9ee-4606-887b-a305525d6e79",
        },
      ],
    },
    answerExplanation:
      "플래시 용접은 맞댄 단면 사이에 플래시를 발생시켜 가열한 뒤 업셋 압력을 가하는 맞대기 저항용접입니다. 따라서 보기 중 맞대기 용접에 해당하는 것은 플래시 용접입니다.",
    solutionSteps: [
      "문제가 저항용접의 이음 형상 중 맞대기 형식을 묻는지 확인합니다.",
      "점·심·프로젝션 용접은 겹친 판재의 접촉부를 국부 가열하는 형식으로 구분합니다.",
      "맞댄 단면을 플래시 가열한 뒤 업셋하는 플래시 용접을 선택합니다.",
    ],
    keyRule:
      "맞댄 단면의 플래시 가열과 업셋이 제시되면 플래시버트 맞대기 저항용접입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "심 용접은 롤러 전극으로 겹친 판재에 연속 또는 간헐 너깃을 만드는 겹치기 저항용접입니다.",
        plausibleReason:
          "심 용접도 저항열과 가압력을 쓰므로 같은 상위 분류의 답처럼 보일 수 있습니다.",
        incorrectPoint:
          "맞댄 단면을 플래시 가열하고 업셋하는 공정이 아니라 겹친 판재를 롤러 전극으로 접합합니다.",
        keyRule:
          "롤러 전극으로 겹친 판재를 이어 붙이면 심 용접이며 맞대기 형식이 아닙니다.",
        differenceFromCorrect:
          "플래시 용접은 맞댄 단면을 업셋하지만 심 용접은 겹친 판재에 연속 너깃을 만듭니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "스폿 용접은 겹친 판재를 전극 사이에서 가압하고 개별 점 너깃을 만드는 겹치기 저항용접입니다.",
        plausibleReason:
          "스폿 용접은 가장 대표적인 저항용접이라 상위 분류만 보고 고르기 쉽습니다.",
        incorrectPoint:
          "개별 점 너깃을 만드는 겹치기 형식이며 맞댄 단면을 연결하는 플래시버트 형식이 아닙니다.",
        keyRule:
          "개별 점 너깃은 스폿 용접이고 맞댄 단면의 업셋은 플래시 용접입니다.",
        differenceFromCorrect:
          "스폿은 겹친 판재에 점 너깃을 만들고 플래시는 맞댄 단면을 가열·업셋합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "플래시 용접은 맞댄 단면을 플래시로 가열하고 업셋 압력을 가해 접합하는 맞대기 저항용접입니다.",
        plausibleReason:
          "플래시와 업셋이라는 공정 특징이 맞대기면 접합과 직접 연결됩니다.",
        incorrectPoint: null,
        keyRule: "플래시 가열 뒤 업셋하는 맞대기 접합은 플래시버트용접입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "프로젝션 용접은 돌기에 전류와 압력을 집중해 겹친 부품을 국부 접합하는 저항용접입니다.",
        plausibleReason:
          "프로젝션 용접도 가압력을 쓰는 저항용접이므로 이음 형상 구분을 놓치기 쉽습니다.",
        incorrectPoint:
          "돌기를 이용한 국부 겹치기 접합이며 맞댄 단면의 플래시 가열·업셋 공정이 아닙니다.",
        keyRule:
          "돌기에 전류를 집중하면 프로젝션, 맞댄 단면에 플래시와 업셋을 쓰면 플래시 용접입니다.",
        differenceFromCorrect:
          "프로젝션은 돌기 집중형 겹치기 접합이고 플래시는 맞댄 단면의 업셋 접합입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2ea02ec8-7f9c-45fb-88fb-826d95c12bd9",
    contentDigest:
      "cbfa7e2cdb91faee8c4ab93e43324a4b9263ebe84db1084861686a6ae9457fba",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "identification",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "target_lesson_not_materialized_in_runtime_leaf_lessons",
      "specific_coating_ingredient_function_requires_primary_material_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2ef9cf26-068e-4f4b-9929-028edc8aeb4f",
    contentDigest:
      "d3004b286fb0b2041d9ca4d4c99e94df1bb208377f529200817a635acc1c0559",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "identification",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "direct_lesson_assertion_missing_for_ultrasonic_method_types",
      "choice_classification_requires_primary_ndt_standard_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2efa9ccf-bd1e-4e92-9c68-54c38d3aae4c",
    contentDigest:
      "5fb12bbd82f22e127bdb457875d6789a5485d8d1c4c963d388a94975de77d585",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "identification",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "direct_lesson_assertion_missing_for_overlap_resistance_classification",
      "projection_welding_joint_shape_requires_primary_process_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2f66b68c-c5f6-44b6-983f-6a612cbff472",
    contentDigest:
      "507b536cfdca35c7eef09306b0bebfb472497a9a480c92b0a453df56e6ecb4f1",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "calculation",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "calculation_formula_missing_from_bound_lesson",
      "pressure_and_temperature_conversion_requires_primary_formula_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2feeada0-bfa4-42b9-9382-f911a106c445",
    contentDigest:
      "bc21d4932790f12c5f67188a74d8678ef0d7573101f33e45cd9d3bb1c26da8e8",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "application",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "target_lesson_not_materialized_in_runtime_leaf_lessons",
      "defect_cause_assertion_cannot_be_bound_to_public_lesson_block",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-2ffcceed-fcf3-4c1b-942b-7d2ca6906480",
    contentDigest:
      "87d7e7a336ab17d2afdb73218e5f140db5c53d1bc52b6b05e60a9c2458732d40",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "application",
    primaryLeafLessonId: "lesson-welding-foundation-brazing-pressure",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-brazing-pressure",
      lessonBlockId: "principle",
      assertionText:
        "납땜에서는 깨끗한 접합면, 적절한 틈, 젖음성과 모세관 작용, 플럭스의 산화막 제거가 중요합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-brazing-pressure#principle",
        },
        {
          kind: "source_question",
          ref: "wcbt-2ffcceed-fcf3-4c1b-942b-7d2ca6906480",
        },
      ],
    },
    answerExplanation:
      "납땜용 플럭스는 접합면의 산화막을 제거하고 재산화를 억제하여 용가재가 모재에 잘 젖고 틈으로 흐르도록 도와야 합니다. 따라서 모재와의 젖음성을 높이고 유동성이 좋아야 한다는 보기가 가장 적합합니다.",
    solutionSteps: [
      "플럭스가 납땜 중 접합면을 깨끗하게 유지하고 산화막을 제거하는 역할임을 확인합니다.",
      "용가재가 모재에 젖고 모세관 작용으로 틈을 흐르려면 적절한 유동성이 필요함을 연결합니다.",
      "산화를 촉진하거나 잔류물 제거를 어렵게 하는 조건을 제외하고 네 번째 보기를 선택합니다.",
    ],
    keyRule:
      "납땜 플럭스는 산화막을 제거하고 젖음성과 유동을 도와야 하며 산화를 촉진해서는 안 됩니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts",
        rationale:
          "납땜 뒤 잔류 플럭스와 슬래그는 접합부를 부식시키거나 검사와 후처리를 방해할 수 있어 제거가 쉬운 편이 바람직합니다.",
        plausibleReason:
          "슬래그가 용융금속을 보호한다는 기능 때문에 제거가 어려워야 보호가 강하다고 오해할 수 있습니다.",
        incorrectPoint:
          "플럭스 잔류물의 제거가 어려운 것은 필요한 성능이 아니라 후처리와 부식 관리에 불리한 조건입니다.",
        keyRule:
          "플럭스는 작업 중 산화막을 제거하되 작업 뒤 잔류물은 적절히 제거할 수 있어야 합니다.",
        differenceFromCorrect:
          "정답은 젖음성과 유동을 돕는 조건이고 이 보기는 후처리를 어렵게 하는 불리한 조건입니다.",
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "플럭스는 청정한 금속면의 산화를 촉진하는 것이 아니라 산화막을 제거하고 재산화를 억제해야 합니다.",
        plausibleReason:
          "가열 중 화학반응이 일어난다는 사실을 산화를 촉진하는 역할로 잘못 연결하기 쉽습니다.",
        incorrectPoint:
          "산화를 촉진하면 젖음성과 접합성이 떨어지므로 플럭스의 목적과 반대입니다.",
        keyRule:
          "플럭스의 핵심은 산화 촉진이 아니라 산화막 제거와 청정면 유지입니다.",
        differenceFromCorrect:
          "정답은 젖음과 유동을 높이지만 이 보기는 접합면 산화를 늘려 젖음을 방해합니다.",
      },
      {
        choiceIndex: 2,
        relation: "missing_condition",
        rationale:
          "침지납땜용 플럭스에 수분을 반드시 포함해야 한다는 조건은 모든 플럭스에 적용되는 일반 성능 요건이 아닙니다.",
        plausibleReason:
          "수용성 플럭스가 존재하므로 특정 제품의 조성을 일반 조건으로 확대하기 쉽습니다.",
        incorrectPoint:
          "플럭스 종류와 공정 조건을 제시하지 않은 채 수분 함유를 필수 조건으로 단정했습니다.",
        keyRule:
          "특정 플럭스의 용매 조성을 납땜용 플럭스 전체의 필수 조건으로 일반화하지 않습니다.",
        differenceFromCorrect:
          "정답은 공정 전반에 필요한 젖음·유동 성능이고 수분 함유는 특정 조성에 한정될 수 있습니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "모재와의 젖음성을 높이고 유동성이 좋아야 용가재가 깨끗한 접합면과 적절한 틈으로 퍼질 수 있습니다.",
        plausibleReason:
          "플럭스의 산화막 제거, 젖음성과 모세관 작용을 하나의 흐름으로 정확히 연결한 보기입니다.",
        incorrectPoint: null,
        keyRule:
          "산화막 제거와 좋은 젖음·유동성은 납땜용 플럭스의 핵심 조건입니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: 2,
    essentialRationale:
      "납땜 플럭스의 산화막 제거·젖음·유동성 역할을 적용해 판단하는 문항입니다.",
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-308565c8-acf6-4138-b4de-3b05b9276a10",
    contentDigest:
      "ddc7a66149d72e0568d5d85644b0eb49ed1f25ce17e2aab69ea7ce9c1f328097",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "oxygen_oil_contamination_rule_needs_current_official_binding",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-31235cf2-ae0b-4fb7-b1a3-8a507831f8b2",
    contentDigest:
      "8f7782b0b77a6cf87438b41da9f3205da0e0f685f11baed1cb795d67ddb8e973",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "identification",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "target_lesson_not_materialized_in_runtime_leaf_lessons",
      "electrode_core_composition_requires_primary_material_specification",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-32fa0fc6-1a9f-471c-b844-71262d223288",
    contentDigest:
      "138d088a7f9de314d6468bc461080d8286e49037b573fd9a2e777cdf97944773",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "definition",
      assertionText:
        "화재의 3요소는 가연물·산소공급원·점화원이며, 예방은 이 요소 중 하나 이상을 제거하거나 서로 접촉하지 않게 하는 방향으로 수행합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-fire#definition",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=474&callmode=normal&catimage=&eclang=ko&start=216&um=s",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=516&callmode=normal&catimage=&eclang=ko&start=204&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-32fa0fc6-1a9f-471c-b844-71262d223288",
        },
      ],
    },
    answerExplanation:
      "화재의 3요소는 점화원, 산소공급원, 가연물입니다. 보기 중 이 세 요소를 모두 포함한 것은 ‘점화원, 산소, 가연성 물질’뿐입니다. 탄소는 산소공급원을 대신하지 못하고, 인화점·발화점은 온도 특성이지 점화원 자체를 구성요소로 적은 표현이 아닙니다.",
    solutionSteps: [
      "각 보기에서 가연물·산소공급원·점화원이 모두 포함됐는지 확인합니다.",
      "세 요소가 하나도 바뀌지 않은 ‘점화원, 산소, 가연성 물질’을 선택합니다.",
    ],
    keyRule:
      "화재의 3요소는 가연물, 산소공급원, 점화원이며 세 요소를 모두 갖춘 보기만 정답입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "missing_condition",
        rationale:
          "선택지 ‘점화원, 탄소, 가연성 물질’은 산소공급원 대신 탄소를 넣어 화재 3요소를 완성하지 못합니다.",
        plausibleReason:
          "많은 가연물에 탄소가 들어 있어 탄소 자체를 필수 구성요소로 오해할 수 있습니다.",
        incorrectPoint: "화재 3요소에는 탄소가 아니라 산소공급원이 필요합니다.",
        keyRule:
          "가연물의 재료 성분과 화재 성립에 필요한 산소공급원을 구분합니다.",
        differenceFromCorrect:
          "정답 보기는 산소를 포함하지만 이 보기는 그 자리를 탄소로 바꿨습니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "선택지 ‘인화점, 산소, 가연성 물질’은 점화원 자리에 액체가 증기를 내어 불붙을 수 있는 온도 특성인 인화점을 넣었습니다.",
        plausibleReason:
          "인화점이 불이 붙는 조건과 관계있어 점화원 그 자체처럼 보일 수 있습니다.",
        incorrectPoint:
          "필요한 구성요소는 인화점이라는 온도값이 아니라 실제 점화원입니다.",
        keyRule:
          "인화점·발화점 같은 온도 특성과 불꽃·열 같은 점화원을 구분합니다.",
        differenceFromCorrect:
          "정답은 점화원을 직접 포함하지만 이 보기는 점화원을 인화점으로 바꿨습니다.",
      },
      {
        choiceIndex: 2,
        relation: "missing_condition",
        rationale:
          "선택지 ‘발화점, 질소, 가연성 물질’은 점화원 대신 발화점을, 산소공급원 대신 질소를 넣어 두 요소가 모두 어긋납니다.",
        plausibleReason:
          "발화라는 단어와 공기 중 질소라는 익숙한 조합 때문에 화재 조건처럼 보일 수 있습니다.",
        incorrectPoint:
          "발화점은 온도 특성이고 질소는 이 문항의 산소공급원을 대신하지 못합니다.",
        keyRule: "세 요소는 점화원·산소공급원·가연물로 그대로 대응해야 합니다.",
        differenceFromCorrect:
          "정답은 점화원과 산소를 모두 갖지만 이 보기는 둘을 발화점과 질소로 바꿨습니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "선택지 ‘점화원, 산소, 가연성 물질’은 점화원·산소공급원·가연물의 세 요소를 모두 정확히 포함합니다.",
        plausibleReason:
          "레슨의 세 요소를 용어 그대로 일대일 대응하면 선택할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "점화원, 산소공급원, 가연물이 함께 있어야 화재의 3요소가 완성됩니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-gas-evidence-promoter-part-04",
    authoredAt: "2026-08-03T03:00:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-33a4b109-3213-4ec0-95a6-af2e77ff915a",
    contentDigest:
      "e02328fe94dff1793a3ab0ba68725bd7de04f75811ebb5813af9fbc70dde3da9",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "confined_space_shock_prevention_requires_current_official_binding",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-340e4444-990f-49a9-af98-1017d5f9d2d3",
    contentDigest:
      "5d25a9effbb0a5b45f0061df150e695b5bce1c84504d0f21434b6fa2599aabd8",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "cylinder_stamping_requirements_need_current_legal_verification",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-349a0edd-c1da-4c2c-8fa5-000958a6e137",
    contentDigest:
      "03ea0e44117a65ac08a2cc9d4bee4bc50f231f3e2915830fb68972d97a2ff56d",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "confined_space_fuel_gas_density_claim_requires_primary_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-353e2c66-db3e-41e5-935b-8dd443ef736a",
    contentDigest:
      "bc3def67e92d4ce288df992cfcc692045a3a2e140daa92ef3df46b9118a62101",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-foundation-brazing-pressure",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-brazing-pressure",
      lessonBlockId: "structure",
      assertionText:
        "저항용접은 전기저항열과 가압력을 쓰고, 마찰용접은 상대운동의 마찰열과 축방향 압력을 이용합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-brazing-pressure#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-353e2c66-db3e-41e5-935b-8dd443ef736a",
        },
      ],
    },
    answerExplanation:
      "마찰 용접은 두 접합면의 상대운동으로 마찰열을 만들고 축방향 압력을 가해 접합하는 압접입니다. 가스 용접, 스터드 용접, 피복 아크 용접은 모재를 아크 또는 불꽃으로 용융하는 융접 계열이므로 정답은 마찰 용접입니다.",
    solutionSteps: [
      "분류 기준을 열원의 이름이 아니라 모재 용융 여부와 접합 압력의 역할로 잡습니다.",
      "상대운동의 마찰열과 축방향 압력을 함께 쓰는 공정을 찾습니다.",
      "가스·스터드·피복아크의 융접 보기를 제외하고 마찰 용접을 선택합니다.",
    ],
    keyRule:
      "상대운동의 마찰열과 축방향 압력으로 접합하면 마찰용접이며 압접으로 분류합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "가스 용접은 산소와 연료가스의 연소열로 모재를 녹여 접합하는 융접입니다.",
        plausibleReason:
          "열을 가해 붙인다는 공통점만 보면 압접과 같은 분류로 오해할 수 있습니다.",
        incorrectPoint:
          "접합면에 압력을 가하는 것이 핵심이 아니라 불꽃으로 모재를 용융하는 공정입니다.",
        keyRule:
          "불꽃으로 모재를 녹이면 가스 융접이고 마찰열과 축압으로 붙이면 마찰 압접입니다.",
        differenceFromCorrect:
          "가스 용접은 연소열에 의한 융접이고 정답은 마찰열과 축방향 압력에 의한 압접입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "마찰 용접은 상대운동에서 생긴 마찰열로 접합면을 가열하고 축방향 압력을 가하는 압접입니다.",
        plausibleReason:
          "마찰열과 축방향 압력이라는 두 핵심 조건이 압접의 정의에 직접 부합합니다.",
        incorrectPoint: null,
        keyRule:
          "마찰열과 축방향 압력의 조합은 마찰용접을 가리키며 압접에 속합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "스터드 용접은 스터드 끝과 모재 사이의 아크열로 접합부를 용융한 뒤 가압하는 아크 융접 계열입니다.",
        plausibleReason:
          "마지막에 스터드를 눌러 붙이는 동작 때문에 압접처럼 보일 수 있습니다.",
        incorrectPoint:
          "주된 열원과 접합 형성은 아크에 의한 용융이며 마찰열을 이용하는 압접이 아닙니다.",
        keyRule:
          "가압 동작이 있어도 아크로 접합부를 용융하면 마찰 압접으로 분류하지 않습니다.",
        differenceFromCorrect:
          "스터드 용접은 아크 용융을 쓰지만 정답은 상대운동의 마찰열을 씁니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "피복 아크 용접은 피복봉과 모재 사이의 아크열로 심선과 모재를 녹이는 융접입니다.",
        plausibleReason:
          "대표적인 용접법이어서 상위 분류를 확인하지 않고 선택하기 쉽습니다.",
        incorrectPoint:
          "접합면 압력보다 아크열과 모재 용융이 핵심이므로 압접이 아닙니다.",
        keyRule:
          "아크로 모재와 용접봉을 녹이면 피복아크 융접이고 압접 분류가 아닙니다.",
        differenceFromCorrect:
          "피복아크는 아크열에 의한 융접이고 마찰용접은 마찰열·축압에 의한 압접입니다.",
      },
    ],
    essentialRank: 1,
    essentialRationale:
      "마찰열과 가압력을 쓰는 압접 공정을 직접 식별하게 하는 문항입니다.",
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-3556b232-c404-4097-8462-c6a66e0b219f",
    contentDigest:
      "03d27cce1e24e5632919eb2fc8ccbfd2d33e9dd00e8792e789e6ef7f169796de",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "application",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "target_lesson_not_materialized_in_runtime_leaf_lessons",
      "gtaw_accessibility_assertion_cannot_be_bound_to_public_lesson_block",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-35636d4d-7974-4b9c-8a82-2500bd58ed41",
    contentDigest:
      "8eb388d264210764ce64b52f9d8c133a107291deb73c110b9c767846762d78a5",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "safety",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "hydrogen_cylinder_color_code_requires_current_legal_verification",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-35b1b5d8-8d7b-4758-a45e-80a1b8419344",
    contentDigest:
      "c96da986e9d5d7f3be849bbccfff17043c69edd75113f397bee52326f1505201",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "calculation",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "safety_rule_requires_official_primary_source",
      "fuse_sizing_rule_and_calculation_derivation_missing_from_lesson",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-35e1f60e-ecd2-4df0-8734-4d5ee777df02",
    contentDigest:
      "d107bc3cc1a9a57e23c8176dfea444dd5ebecb97e47420e612484761870efd48",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "application",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "direct_lesson_assertion_missing_for_spot_heating_temperature",
      "time_temperature_pair_requires_primary_procedure_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-3609db8e-2100-4ee1-a538-c0e5eb220a14",
    contentDigest:
      "84f35962848940ad5a1024329562676f421a8d727b5a235fe3b2819c23535476",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "structure",
      assertionText:
        "자동전격방지장치는 용접하지 않을 때 출력측 무부하전압을 낮춰 위험을 줄입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#definition",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#principle",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#structure",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#source",
        },
        {
          kind: "official_source",
          ref: "https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024004607",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-3609db8e-2100-4ee1-a538-c0e5eb220a14",
        },
      ],
    },
    answerExplanation:
      "전격 위험은 접촉 전압이 높고 인체 저항이 낮을수록 커집니다. 피복 파손, 땀, 젖은 몸과 홀더의 접촉은 절연 또는 인체 저항을 낮추지만, 정답 선택지인 ‘무부하 전압이 낮은 용접기를 사용할 때’는 비작업 중 접촉전압을 낮추므로 네 보기 중 위험성이 가장 적습니다.",
    solutionSteps: [
      "각 보기가 전압을 낮추는지, 절연 또는 인체 저항을 낮추는지 구분합니다.",
      "피복 파손·땀·젖은 접촉은 감전 경로를 강화하고 무부하전압 저하는 접촉 위험을 줄임을 비교합니다.",
      "네 조건 중 위험을 증가시키지 않는 무부하전압이 낮은 용접기를 선택합니다.",
    ],
    keyRule:
      "피복 손상과 습윤은 감전 위험을 높이고, 낮은 무부하전압은 아크가 없는 동안의 접촉전압을 낮춰 위험을 줄입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "케이블 피복이 파괴되면 충전도체가 노출되거나 누설전류 경로가 생겨 인체가 전기회로에 접촉할 가능성이 커집니다.",
        plausibleReason:
          "피복 손상을 단순한 케이블 수명 문제로 보고 전격 위험과 직접 연결하지 못할 수 있습니다.",
        incorrectPoint:
          "절연 상태가 나빠진 조건은 위험을 줄이는 것이 아니라 직접 접촉과 누전 가능성을 높입니다.",
        keyRule:
          "피복이 손상된 케이블은 사용하지 말고 적정 규격으로 보수·교체한 뒤 사용합니다.",
        differenceFromCorrect:
          "피복 파손은 절연 장벽을 약화하지만 정답의 낮은 무부하전압은 접촉전압 자체를 낮춥니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "무부하전압이 낮으면 아크가 꺼져 있는 동안 홀더나 용접봉에 접촉했을 때 인체에 걸릴 수 있는 전압이 더 낮습니다.",
        plausibleReason:
          "전격방지장치가 무부하 상태의 출력전압을 낮추는 목적과 보기의 조건이 일치합니다.",
        incorrectPoint: null,
        keyRule:
          "자동전격방지장치는 비용접 시 출력측 무부하전압을 낮춰 전격 위험을 줄입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "땀에 젖은 피부와 보호구는 건조한 상태보다 인체와 접촉부의 전기저항을 낮춰 전류가 흐르기 쉬운 조건을 만듭니다.",
        plausibleReason:
          "땀을 작업 피로 문제로만 보고 전기적 저항 변화는 놓칠 수 있습니다.",
        incorrectPoint:
          "인체 저항을 낮추는 습윤 조건이므로 전격 위험성이 가장 적은 상황이 아닙니다.",
        keyRule:
          "땀과 습기는 인체 저항을 낮추므로 건조한 보호구와 작업환경을 유지해야 합니다.",
        differenceFromCorrect:
          "땀은 같은 전압에서 인체전류를 키울 수 있지만 정답은 접촉 가능한 전압을 낮춥니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "젖은 몸에 통전 가능한 홀더가 닿으면 낮아진 인체 저항과 직접 접촉이 겹쳐 감전전류가 흐르기 쉬워집니다.",
        plausibleReason:
          "홀더 손잡이가 원래 절연된다는 사실 때문에 젖은 상태에서도 안전하다고 오해할 수 있습니다.",
        incorrectPoint:
          "습윤한 인체와 홀더의 접촉은 대표적인 고위험 조건이며 보기 중 위험이 적은 조건이 아닙니다.",
        keyRule:
          "젖은 몸·장갑·장소에서는 홀더 접촉 위험이 커지므로 전원 차단과 건조·절연 조치가 필요합니다.",
        differenceFromCorrect:
          "젖은 접촉은 저항을 낮추고 전류 경로를 만들지만 정답은 무부하 상태의 전압을 낮춥니다.",
      },
    ],
    essentialRank: 3,
    essentialRationale: "전압·접촉 상태·절연 조건을 비교해 전격 위험이 가장 낮은 상황을 판별하는 안전 문항입니다.",
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c",
    contentDigest:
      "45cbb05647bf245d909dc22081a9b940c3eedca40e66dfcebadadfd57bb75fbf",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "structure",
      assertionText:
        "자동전격방지기는 아크 소멸 후 0.1초 이내에 출력측 무부하전압을 25V 이하로 낮추는 장치입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#structure",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#source",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "official_source",
          ref: "https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024004607",
        },
        {
          kind: "source_question",
          ref: "wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c",
        },
      ],
    },
    answerExplanation:
      "이 문항은 복원된 출제 당시 교류 아크용접용 자동전격방지기의 조건을 묻습니다. 그 역사 기출 조건에서는 아크가 소멸한 뒤 0.1초 이내에 출력측 무부하전압을 25V 이하로 낮추므로, 제시된 전압 중 기준 상한과 일치하는 1번 25V가 정답입니다. 현행 설비에 적용할 값은 모든 장치에 일률 적용하지 말고 장치 형식과 적용 기준의 시점을 확인해야 합니다.",
    solutionSteps: [
      "지문의 ‘출력측 무부하전압’이 복원된 역사 기출에서 아크 소멸 후 전격방지 상태의 전압임을 확인합니다.",
      "출제 당시 조건인 ‘0.1초 이내, 25V 이하’를 보기와 대조합니다.",
      "역사 기출 조건의 상한과 일치하는 25V를 선택하고, 현행 적용값은 장치 형식과 기준시점을 별도로 확인합니다.",
    ],
    keyRule:
      "복원된 역사 기출에서는 교류 아크용접용 자동전격방지기의 출력측 무부하전압을 아크 소멸 후 0.1초 이내에 25V 이하로 낮추는 조건을 적용했으며, 현행값은 장치 형식과 기준시점 확인이 필요합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "25V는 자동전격방지기가 아크 소멸 후 낮춰야 하는 출력측 무부하전압의 상한과 정확히 일치합니다.",
        plausibleReason:
          "레슨의 ‘0.1초 이내, 25V 이하’ 수치에서 전압 상한을 그대로 찾을 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "수치형 안전문제에서는 상태와 단위를 함께 묶어 ‘아크 소멸 후 출력측 25V 이하’로 기억합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "40V는 규정된 출력측 무부하전압 상한 25V보다 15V 높아 전격방지 상태의 기준값이 아닙니다.",
        plausibleReason:
          "일반적인 저전압 숫자와 전격방지장치의 특정 출력 기준을 혼동하면 선택할 수 있습니다.",
        incorrectPoint:
          "‘25V 이하’ 조건을 초과하므로 자동전격방지기의 저감 후 출력 상한으로 사용할 수 없습니다.",
        keyRule:
          "전격방지기의 수치 기준은 막연한 저전압이 아니라 출력측 무부하전압 25V 이하입니다.",
        differenceFromCorrect:
          "정답 25V는 기준 상한이고 40V는 그 상한보다 15V 높습니다.",
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "50V는 출력측 무부하전압 기준 25V의 두 배로, 아크 소멸 후 전격방지 상태의 허용 상한을 넘습니다.",
        plausibleReason:
          "다른 전기안전 문맥에서 본 50V라는 수치를 이 장치의 출력 기준으로 잘못 옮길 수 있습니다.",
        incorrectPoint:
          "자동전격방지기의 직접 기준은 25V 이하이므로 50V를 상한으로 선택할 수 없습니다.",
        keyRule:
          "서로 다른 전기설비의 전압 기준을 섞지 말고 교류 아크용접 자동전격방지기의 25V를 적용합니다.",
        differenceFromCorrect:
          "정답 25V와 달리 50V는 허용 상한을 25V 초과합니다.",
      },
      {
        choiceIndex: 3,
        relation: "contradicts",
        rationale:
          "60V는 25V 이하로 낮춰야 한다는 전격방지장치의 출력측 무부하전압 기준보다 35V 높습니다.",
        plausibleReason:
          "용접기의 정상 아크 또는 일반 무부하전압 범위와 전격방지 후 저감전압을 혼동할 수 있습니다.",
        incorrectPoint:
          "지문은 전격방지장치가 낮춘 출력측 전압을 묻기 때문에 60V는 해당 상한을 만족하지 않습니다.",
        keyRule:
          "용접 중 전압과 아크 소멸 후 전격방지 출력전압을 구분하고 후자는 25V 이하로 판단합니다.",
        differenceFromCorrect:
          "정답은 저감 기준 25V이고 60V는 그보다 35V 높아 기준 밖입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-36b8f694-21f0-4aec-ba94-de4ffe516780",
    contentDigest:
      "7250b4bdab8ec3e0a94babf3b5fde50514f3eea8566a08cb8d869f6b5b93147f",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "calculation",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "calculation_formula_missing_from_bound_lesson",
      "source_choice_contains_suspected_typographical_error",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c",
    contentDigest:
      "236efd254b852183e6af2f0572b6cfe1278b476e27b50c1b5d05a324afc1f7cb",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-inspection-ndt",
    conceptBinding: {
      lessonId: "lesson-welding-inspection-ndt",
      lessonBlockId: "principle",
      assertionText:
        "시험체 한쪽 면에서 초음파 펄스를 송신하고 결함에서 되돌아온 반사 에코를 분석하는 방식은 펄스반사법입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-inspection-ndt#principle",
        },
        {
          kind: "source_question",
          ref: "wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c",
        },
      ],
    },
    answerExplanation:
      "시험체 한쪽 면에서 짧은 초음파 펄스를 보내고 결함 경계에서 되돌아온 에코의 위치와 세기를 분석하는 방법은 펄스 반사법입니다. 따라서 결함에코의 형태로 판정한다는 조건에 맞는 정답은 펄스 반사법입니다.",
    solutionSteps: [
      "초음파를 시험체 한쪽 면에서 송신한다는 조건을 표시합니다.",
      "반대편 수신량이 아니라 결함에서 되돌아온 에코를 분석한다는 점을 확인합니다.",
      "반사 에코를 이용하는 펄스 반사법을 선택합니다.",
    ],
    keyRule:
      "한쪽 면에서 펄스를 보내 결함 반사 에코를 분석하면 초음파 펄스 반사법입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "투과법은 시험체를 통과한 초음파의 세기 변화를 송신부 반대쪽에서 비교하는 방식입니다.",
        plausibleReason:
          "초음파가 시험체 내부를 지나간다는 공통점 때문에 반사법과 혼동하기 쉽습니다.",
        incorrectPoint:
          "문제는 반대편 투과량이 아니라 결함에서 되돌아온 에코의 형태를 판정한다고 했습니다.",
        keyRule:
          "반대편 수신은 투과법이고 같은 쪽에서 돌아온 결함 에코는 펄스 반사법입니다.",
        differenceFromCorrect:
          "투과법은 통과 신호를 보고 정답은 결함에서 되돌아온 반사 에코를 봅니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "공진법은 시험체 두께와 초음파 파장의 공진 조건을 이용하는 방식으로 결함 에코의 시간 위치를 직접 읽는 방법과 다릅니다.",
        plausibleReason:
          "공진법도 초음파를 이용하므로 방법 이름만으로 정답처럼 보일 수 있습니다.",
        incorrectPoint:
          "문제의 핵심인 펄스 송신과 결함 반사 에코 판정 조건에 맞지 않습니다.",
        keyRule:
          "공진 조건을 이용하면 공진법이고 개별 결함의 반사 에코를 읽으면 펄스 반사법입니다.",
        differenceFromCorrect:
          "공진법은 공진 조건을 이용하지만 정답은 펄스의 반사 에코를 이용합니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "침투법은 표면에 열린 결함으로 침투액이 스며드는 현상을 이용하는 액체침투탐상법입니다.",
        plausibleReason:
          "침투라는 말이 초음파가 재료 내부로 들어가는 현상처럼 들려 혼동할 수 있습니다.",
        incorrectPoint:
          "초음파 에코를 사용하는 방법이 아니라 표면개구 결함을 찾는 별도의 비파괴검사입니다.",
        keyRule:
          "침투액을 쓰면 PT이고 초음파 반사 에코를 쓰면 UT 펄스 반사법입니다.",
        differenceFromCorrect:
          "침투법은 액체와 표면개구 결함을 이용하고 정답은 초음파 반사 신호를 이용합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "펄스 반사법은 시험체 한쪽에서 초음파 펄스를 보내고 결함에서 돌아온 에코를 분석합니다.",
        plausibleReason:
          "문제의 한쪽 면 송신, 결함에코, 에코 형태 판정이라는 세 조건이 모두 일치합니다.",
        incorrectPoint: null,
        keyRule: "한쪽 면 송신과 결함 반사 에코의 조합은 펄스 반사법입니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: 2,
    essentialRationale:
      "반사 에코로 결함을 찾는 초음파 펄스 반사법을 직접 식별합니다.",
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-374983d5-71eb-46a0-a16e-752cf4033418",
    contentDigest:
      "bc7353415d60ca4265d6cb1c6ea8df595707a46a4614c4c3e412e86d0121ee7c",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "calculation",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "calculation_formula_missing_from_bound_lesson",
      "pressure_and_temperature_conversion_requires_primary_formula_source",
    ],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
  {
    canonicalId: "wcbt-3908bf15-c3ed-4f85-982e-7ad5902e70ab",
    contentDigest:
      "fa6425fa102cc93a7c32a72d10bacd90c0c885b045e4dd59928ad57c93049baf",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-inspection-ndt",
    conceptBinding: {
      lessonId: "lesson-welding-inspection-ndt",
      lessonBlockId: "definition",
      assertionText:
        "육안검사(VT), 침투탐상(PT), 자분탐상(MT), 방사선투과(RT), 초음파탐상(UT) 등이 대표적이며 적용 범위가 서로 다릅니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-inspection-ndt#definition",
        },
        {
          kind: "source_question",
          ref: "wcbt-3908bf15-c3ed-4f85-982e-7ad5902e70ab",
        },
      ],
    },
    answerExplanation:
      "침투 탐상 시험은 제품을 파괴하지 않고 표면에 열린 결함으로 침투액이 스며드는 현상을 이용하는 비파괴검사입니다. 피로·화학분석·용접균열 시험은 시험편을 손상하거나 채취·파단하는 시험이므로 정답은 침투 탐상 시험입니다.",
    solutionSteps: [
      "문제가 용접부 검사 중 제품을 사용 불가능하게 파괴하지 않는 시험을 묻는지 확인합니다.",
      "각 보기에서 시험편 파단·채취·균열 발생 등 파괴 여부를 구분합니다.",
      "표면개구 결함을 침투액으로 찾는 침투 탐상 시험을 선택합니다.",
    ],
    keyRule:
      "침투탐상 PT는 표면에 열린 결함을 침투액으로 찾는 대표적인 비파괴검사입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "피로 시험은 반복하중을 가해 시험편의 수명이나 파괴 거동을 확인하는 기계적 파괴시험입니다.",
        plausibleReason:
          "용접부의 건전성을 평가한다는 목적은 같아 검사방법이라는 큰 범주에서 혼동할 수 있습니다.",
        incorrectPoint:
          "반복하중으로 시험편을 손상·파괴할 수 있으므로 비파괴시험이 아닙니다.",
        keyRule:
          "시험편에 반복하중을 가해 파괴 거동을 보는 피로 시험은 파괴시험입니다.",
        differenceFromCorrect:
          "피로 시험은 하중으로 시험편을 손상시키지만 침투탐상은 표면에 침투액을 적용해 검사합니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "화학분석 시험은 재료 시료의 성분을 분석하는 시험으로 일반적인 용접부 비파괴탐상법의 분류가 아닙니다.",
        plausibleReason:
          "재료 품질을 확인하는 시험이므로 용접검사와 같은 범주로 보일 수 있습니다.",
        incorrectPoint:
          "표면이나 내부 결함을 제품을 보존한 채 탐상하는 VT·PT·MT·RT·UT 계열이 아닙니다.",
        keyRule:
          "성분 분석과 결함 탐상은 목적과 방법이 다르며 PT는 결함을 찾는 비파괴탐상입니다.",
        differenceFromCorrect:
          "화학분석은 성분을 확인하고 정답인 침투탐상은 표면개구 결함을 확인합니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "용접균열 시험은 균열 감수성을 확인하기 위해 시험편에 구속이나 하중을 주고 균열 발생을 평가하는 파괴시험 계열입니다.",
        plausibleReason:
          "용접균열을 찾는다는 표현 때문에 기존 용접부의 균열을 비파괴적으로 검사하는 방법처럼 보일 수 있습니다.",
        incorrectPoint:
          "이미 존재하는 제품을 보존해 탐상하는 것이 아니라 시험편에 균열이 생기는지를 평가합니다.",
        keyRule:
          "균열 감수성 시험과 완성품 결함을 찾는 비파괴탐상은 구분해야 합니다.",
        differenceFromCorrect:
          "용접균열 시험은 시험편의 균열 발생을 평가하고 침투탐상은 기존 표면개구 결함을 찾습니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "침투 탐상 시험은 표면에 열린 불연속으로 침투액이 스며드는 현상을 이용하며 제품을 파괴하지 않습니다.",
        plausibleReason:
          "침투탐상 PT가 대표적인 표면 비파괴검사라는 정의에 정확히 부합합니다.",
        incorrectPoint: null,
        keyRule:
          "표면개구 결함을 침투액으로 찾는 PT는 대표적인 비파괴검사입니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part04",
    authoredAt: "2026-08-02T15:35:00.000Z",
    reviewer: "welding-reviewer-part04",
    reviewedAt: "2026-08-02T16:05:00.000Z",
  },
] as const;

const FINAL_REVIEWER = "codex-welding-reviewer-final-parts01-05";
const FINAL_REVIEWED_AT = "2026-08-03T04:30:00.000Z";

export const WELDING_CBT_ANSWER_REVIEWS_PART_04 =
  WELDING_CBT_ANSWER_REVIEWS_PART_04_BASE.map((entry) => {
    if (
      entry.canonicalId
      === "wcbt-2e3af0f9-d9ee-4606-887b-a305525d6e79"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "점·심·프로젝션용접은 겹친 판재의 국부 접합으로, 플래시버트용접은 맞댄 단면을 연결하는 맞대기 저항용접으로 구분합니다.",
        },
        holdReasons: [],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (
      entry.canonicalId
      === "wcbt-2ffcceed-fcf3-4c1b-942b-7d2ca6906480"
    ) {
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
        holdReasons: [
          "direct_choice_evidence_incomplete: 현재 검증된 플럭스 레슨은 산화막 제거·젖음성·유동성은 설명하지만, 잔류물 제거성 및 침지납땜 플럭스의 수분 조건까지 네 보기를 모두 직접 대조할 근거가 없어 공개하지 않습니다.",
        ],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (
      entry.canonicalId
      === "wcbt-353e2c66-db3e-41e5-935b-8dd443ef736a"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "마찰용접은 상대운동의 마찰열과 축방향 압력을 이용하는 압접입니다. 가스용접·스터드용접·피복아크용접은 불꽃이나 아크열로 모재를 용융하는 융접이므로 마찰용접과 분류가 다릅니다.",
        },
        holdReasons: [],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (
      entry.canonicalId
      === "wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "UT 방식에서 투과법은 반대쪽 수신 신호를, 공진법은 공진 조건을 이용하며, 한쪽 면에서 송신한 펄스의 결함 반사 에코로 판정하는 방법은 펄스반사법입니다. 침투법은 초음파 방식이 아니라 표면개구 결함을 확인하는 PT입니다.",
        },
        holdReasons: [],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (
      entry.canonicalId
      === "wcbt-3908bf15-c3ed-4f85-982e-7ad5902e70ab"
    ) {
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
        holdReasons: [
          "direct_choice_evidence_incomplete: 현재 검증된 비파괴검사 레슨은 침투탐상 PT의 정의는 확인하지만, 피로시험·화학분석시험·용접균열시험의 시험 성격까지 네 보기를 모두 직접 대조할 근거가 없어 공개하지 않습니다.",
        ],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (
      entry.canonicalId
      === "wcbt-32fa0fc6-1a9f-471c-b844-71262d223288"
    ) {
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
        holdReasons: [
          "official_fire_triangle_definition_missing: 연결된 1차 근거에서 점화원·산소공급원·가연물의 세 요소를 문제 보기와 같은 범위로 직접 확인하지 못해 공개하지 않습니다.",
        ],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    if (
      entry.canonicalId
      === "wcbt-3609db8e-2100-4ee1-a538-c0e5eb220a14"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "젖은 몸에 홀더가 닿는 경우, 땀을 흘리는 상태, 케이블 피복 파괴는 전격 위험을 키우지만 무부하전압이 낮은 용접기는 네 조건 중 위험이 가장 적습니다.",
        },
        holdReasons: [],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    if (
      entry.canonicalId
      === "wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "자동전격방지기는 아크 소멸 후 0.1초 이내에 출력측 무부하전압을 25V 이하로 낮추는 장치입니다.",
        },
        holdReasons: [],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    return entry;
  });
