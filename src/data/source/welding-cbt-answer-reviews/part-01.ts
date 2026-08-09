const WELDING_CBT_ANSWER_REVIEWS_PART_01_BASE = [
  {
    canonicalId: "wcbt-00f9f1f5-27ba-4964-9c98-b36ed75b659b",
    contentDigest:
      "322f4bcf836143a522c41222e4c4026c352b245e75fefd2e28ab930cf2762e61",
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
      "review_rejected_mojibake: 작성된 풀이·선택지별 피드백·개념 인용문이 문자 인코딩 손상으로 학습자가 읽을 수 없습니다.",
      "direct_classification_evidence_missing: 현재 연결 레슨은 피복제의 일반 기능만 설명하며 E4326의 철분 30~50% 저수소계 분류를 직접 뒷받침하지 않습니다.",
    ],
    author: "codex-welding-author-part-01",
    authoredAt: "2026-08-03T00:00:00.000Z",
    reviewer: "codex-welding-reviewer-part-01",
    reviewedAt: "2026-08-03T00:30:00.000Z",
  },
  {
    canonicalId: "wcbt-01ce7f13-9f5b-43c2-8765-8040bd7dcb54",
    contentDigest:
      "8829902da61e3aab3cbc0b708ad36ad387223c9add98148debab9b24b4a8bddc",
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
      "review_rejected_mojibake: 작성된 풀이·선택지별 피드백·개념 인용문이 문자 인코딩 손상으로 학습자가 읽을 수 없습니다.",
      "direct_feature_evidence_missing: 현재 연결 레슨의 정의만으로 점용접의 작업속도와 용접변형 비교를 직접 검증할 수 없습니다.",
    ],
    author: "codex-welding-author-part-01",
    authoredAt: "2026-08-03T00:00:00.000Z",
    reviewer: "codex-welding-reviewer-part-01",
    reviewedAt: "2026-08-03T00:30:00.000Z",
  },
  {
    canonicalId: "wcbt-01fc477e-07c3-415a-b6fd-7b9b6272ec56",
    contentDigest:
      "0bb7d82e1838a40d498b3c0b4fc38c8eb0f6e7fe3e82d521f729aac94b9f1b76",
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
      "safety_primary_official_source_missing: 50 mA 인체 영향, 공정별 차광번호, 오존 노출, 안구 응급조치 네 주장에 대한 KOSHA·법령·고용노동부 등 직접 공식 근거가 묶여 있지 않습니다.",
      "mixed_safety_claims_need_independent_verification: 복원 정답 하나만으로 나머지 안전 보기를 확정 공개하지 않고 각 보기의 조건을 별도 검증해야 합니다.",
    ],
    author: "codex-welding-author-part-01",
    authoredAt: "2026-08-03T00:00:00.000Z",
    reviewer: "codex-welding-reviewer-part-01",
    reviewedAt: "2026-08-03T00:30:00.000Z",
  },
  {
    canonicalId: "wcbt-0211af37-8db1-464d-8dcf-eb1b4bf39e78",
    contentDigest:
      "3db8edcc68c161b8ec4743df11cfcf87696017905bde2792023c1e125ff775d4",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-ppe",
    conceptBinding: {
      lessonId: "lesson-welding-safety-ppe",
      lessonBlockId: "structure",
      assertionText:
        "차광막은 용접 작업자 개인보호구가 아니라 아크광이 주변 작업자에게 노출되는 것을 막는 방호설비입니다. 용접면·핸드실드·용접장갑·가죽 앞치마와 가죽 각반은 유해광선·열·불티로부터 신체를 보호하는 보호구이며, 집게·해머·와이어브러시 같은 작업 공구와 구분합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-ppe#structure",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-ppe#source",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-0211af37-8db1-464d-8dcf-eb1b4bf39e78",
        },
      ],
    },
    answerExplanation:
      "용접장갑·용접헬멧·가죽 앞치마는 작업자가 몸에 착용해 손, 눈·얼굴, 몸통을 보호하는 개인보호구입니다. 용접 차광막은 작업자 사이에 설치해 주변 사람에게 아크광이 노출되는 것을 막는 작업장 방호설비이므로, 착용하는 보호구가 아닌 3번이 정답입니다.",
    solutionSteps: [
      "지문이 ‘착용하는 보호구가 아닌 것’을 묻는 부정형임을 확인합니다.",
      "장갑·헬멧·앞치마는 몸에 착용하고, 차광막은 작업자 사이에 설치한다는 사용 위치를 구분합니다.",
      "개인이 착용하지 않는 작업장 방호설비인 용접 차광막을 선택합니다.",
    ],
    keyRule:
      "몸에 착용해 신체를 보호하면 개인보호구이고, 작업자 사이에 설치해 주변 사람의 아크광 노출을 막으면 차광막 같은 방호설비입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "용접장갑은 작업자가 손에 착용해 열, 불티, 뜨거운 금속과 전기적 접촉 위험을 줄이는 개인보호구입니다.",
        plausibleReason:
          "장갑이 용접기 조작을 돕는 작업도구처럼 보여 보호구 분류를 놓칠 수 있습니다.",
        incorrectPoint:
          "손에 직접 착용해 신체를 보호하므로 ‘착용하는 보호구가 아닌 것’에 해당하지 않습니다.",
        keyRule:
          "용접장갑은 손을 덮어 열과 불티로부터 보호하는 착용형 보호구입니다.",
        differenceFromCorrect:
          "용접장갑은 개인이 손에 착용하지만 차광막은 작업자 사이 공간에 설치합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "용접헬멧은 차광필터와 얼굴 덮개로 아크광과 비산물에서 작업자의 눈과 얼굴을 보호하는 개인보호구입니다.",
        plausibleReason:
          "헬멧이라는 이름 때문에 낙하물용 안전모만 떠올려 용접 보호구가 아니라고 오인할 수 있습니다.",
        incorrectPoint:
          "작업자가 머리와 얼굴에 착용하는 보호구이므로 제외 대상이 아닙니다.",
        keyRule:
          "용접헬멧은 작업자 눈·얼굴의 유해광선과 비산물 노출을 줄이는 착용형 보호구입니다.",
        differenceFromCorrect:
          "용접헬멧은 작업자 한 사람의 눈과 얼굴을 보호하고 차광막은 주변 작업자의 시야를 차폐합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "용접 차광막은 몸에 착용하지 않고 용접 구역과 주변 작업자 사이에 설치해 아크광의 확산을 막는 방호설비입니다.",
        plausibleReason:
          "유해광선을 막는 기능은 용접헬멧과 같아 넓은 뜻의 보호용품으로 묶기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "차광막은 개인보호구가 아니라 주변 사람의 유해광선 노출을 줄이는 설치형 방호설비입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "가죽 앞치마는 작업자가 몸통 앞쪽에 착용해 복사열, 불티와 뜨거운 금속 비산물로부터 신체를 보호합니다.",
        plausibleReason:
          "일반 작업복의 부속품처럼 보여 별도의 개인보호구가 아니라고 생각할 수 있습니다.",
        incorrectPoint:
          "몸에 직접 착용해 열과 불티를 막는 보호구이므로 정답이 아닙니다.",
        keyRule:
          "가죽 앞치마는 용접 열과 불티로부터 몸통을 보호하는 착용형 보호구입니다.",
        differenceFromCorrect:
          "가죽 앞치마는 작업자의 몸통에 착용하고 차광막은 용접 구역 경계에 설치합니다.",
      },
    ],
    essentialRank: 1,
    essentialRationale: "용접장갑·헬멧·앞치마와 차광막의 착용·설치 차이를 구분하는 핵심 보호구 문항입니다.",
    holdReasons: [],
    author: "codex-welding-author-part-01",
    authoredAt: "2026-08-03T00:00:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-0293bcfc-32a3-4950-94e2-8dcca6ff46cc",
    contentDigest:
      "cb41c66ac34e8758b48911942c6bb6a867a4af6acc67e2ae36fb7feb27278496",
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
      "direct_choice_classification_evidence_missing: 현재 레슨은 압접의 일반 원리를 설명하지만 정답 보기인 단접을 압접 공정으로 직접 분류하는 문장을 포함하지 않습니다.",
      "choice_level_explanation_not_yet_source_bound: 단접·가스용접·전자빔용접·피복아크용접을 융접·압접으로 나누는 직접 근거를 연결한 뒤 공개해야 합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-029e820d-c90c-40c6-a3ff-ccdf1d0fbfef",
    contentDigest:
      "115e228742cb83c879d7cc72394338ba12492be159daaad8b51d8fdd8dd42069",
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
      "safety_primary_official_source_missing: 실내 용접의 환기설비 필요성과 용접흄 유해성을 직접 뒷받침하는 KOSHA·법령·고용노동부 공식 URL이 이 문항에 묶여 있지 않습니다.",
      "mixed_absolute_safety_choices_need_verification: 인체 영향 없음·용접봉과 무관·가제마스크로 충분하다는 세 절대 표현을 선택지별 공식 근거로 검증해야 합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-02fc6a25-5680-4abf-b234-204bac57d39b",
    contentDigest:
      "855ca16c0156b1d60f0c8b2ffc1b7237341a509bc3b78257b91c00e3d27a2829",
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
      "gas_color_standard_evidence_missing: 아세틸렌 용기 황색과 호스 적색의 조합은 현재 레슨에 직접 적혀 있지 않고 적용 시점의 공식 색상 기준 URL도 연결되지 않았습니다.",
      "jurisdiction_and_revision_check_required: 용기 도색과 호스 색상은 국가·시기·규격에 따라 달라질 수 있어 복원 보기만으로 확정 공개하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-038889cd-c77e-47f5-ba84-eeb3d2d2d4df",
    contentDigest:
      "112b593570ff33f4863208c189cfd5f5e800fa4571c257389d3339b964ea18c0",
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
      "law_primary_source_missing: 특정행위의 지시 및 사실의 고지를 파란색으로 정한 시행규칙 별표의 직접 법령 URL과 적용 시점이 연결되지 않았습니다.",
      "lesson_block_unavailable: 제안 레슨 lesson-1ctkzud가 현재 용접 CBT 레슨 묶음에서 직접 인용 가능한 블록을 제공하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-03c235a1-5e6a-4656-b55f-7879dec479fe",
    contentDigest:
      "2ccbd342346af9b885cde9cf29b95c9757df6f5abe5e8a7b609730bb51f59c5a",
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
      "safety_primary_official_source_missing: 용접기 덮개를 열기 전 전원 차단, 접지, 절연, 단자 점검을 직접 규정한 공식 안전 자료 URL이 이 문항에 묶여 있지 않습니다.",
      "equipment_procedure_requires_primary_verification: TIG 전원장치 정비 절차는 제조사 지침과 공식 산업안전 절차를 함께 대조해야 하므로 일반 레슨만으로 공개하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-041fdd04-e807-41a0-bc35-dfc295b788a2",
    contentDigest:
      "9f38426e8747cf2c1a36dc4f756935d3cb02d2014b817381af445bbe8aab3995",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "definition",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "direct_characteristic_definition_missing: 현재 전원 레슨은 정전류·정전압 특성을 설명하지만 부하전류 증가 시 단자전압이 높아지는 상승특성을 직접 정의하지 않습니다.",
      "choice_boundary_evidence_missing: 상승·수하·정전류·정전압 특성의 전압-전류 관계를 같은 기준으로 비교하는 직접 근거가 필요합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-05b21a8d-8ddb-4096-a592-824ee9437641",
    contentDigest:
      "53e413001a207f55cc06695e3e31c5b1277981275962efd2e955ec85430285ad",
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
      "flashback_cause_primary_evidence_missing: 팁 접촉·스패터 막힘·토치 내부 이물과 아세틸렌 압력 조건을 역화 원인 여부로 직접 구분하는 공식 안전 자료가 연결되지 않았습니다.",
      "pressure_condition_is_ambiguous: 아세틸렌 압력이 높다는 보기의 조건 범위가 생략되어 현재 레슨의 일반 역화 설명만으로 오답을 확정할 수 없습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-06ac3679-b7e4-4f8d-a5cc-bff50093481f",
    contentDigest:
      "65ca6fdfa14c2d8cba15e77e8c51a06649135dfe4c52804a58295a3e2dff4dc5",
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
      "safety_primary_official_source_missing: 산소계통 유분 금지, 용기 고정·화기 이격, 누설검사를 직접 뒷받침하는 공식 안전 URL이 이 문항에 묶여 있지 않습니다.",
      "lesson_support_is_not_publication_authority: 레슨에는 유분 금지가 적혀 있지만 안전 선택지를 공개하려면 별도의 공식 1차 근거가 필요합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-084a3868-12bd-410c-84d0-23717d4861b4",
    contentDigest:
      "f1e03ccc67ffe705b079abb01a30d32f2c2300eaf0121d116048c251e3c6d5b1",
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
      "calculation_derivation_missing: 40 L와 140 kgf/cm²로 산소량을 계산한 뒤 350번 팁의 시간당 소비량으로 나누는 직접 풀이식이 데이터에 없습니다.",
      "tip_consumption_table_missing: 350번 팁의 표준 산소 소비량을 확인할 수 있는 공식·교재 표가 연결되지 않아 16시간을 재현할 수 없습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-090f8987-d07c-4aae-8a13-bfbcba5bdc4b",
    contentDigest:
      "39b964aef6ad59c83c02a4b9e1606cc3d0648164cdadb89796476ca8179275c3",
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
      "safety_primary_official_source_missing: 가스용접 장갑·차광보안경·도금재 흄·가연물 이격을 선택지별로 직접 뒷받침하는 공식 안전 URL이 없습니다.",
      "glove_material_claim_requires_verification: 면장갑이 부적절하다는 복원 정답을 난연성·가죽 보호장갑 요구와 대조할 1차 근거가 필요합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0a74b2b3-ed80-4674-a92b-5e740f6614c4",
    contentDigest:
      "c4e55eb1b2387a0fa92007e046e9a19099178eec84db94600d83f73827df70f7",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "principle",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "rectifier_feature_evidence_missing: 현재 전원 레슨에는 정류기형 직류 용접기의 소음·보수·정류기 파손·맥동 직류 특성이 직접 정리되어 있지 않습니다.",
      "absolute_direct_current_wording_needs_source: 완전한 직류를 얻는다는 보기의 틀린 이유를 정류 리플과 연결하는 직접 교재·제조사 근거가 필요합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0af025b3-8c15-4822-adad-0969bda0f633",
    contentDigest:
      "e24ffb4872507b7499f290c2d72c4b7646978ad9eaf0c6d9c578f7dd0fc38756",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-ppe",
    conceptBinding: {
      lessonId: "lesson-welding-safety-ppe",
      lessonBlockId: "structure",
      assertionText:
        "차광막은 용접 작업자 개인보호구가 아니라 아크광이 주변 작업자에게 노출되는 것을 막는 방호설비입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-ppe#structure",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-ppe#source",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-0af025b3-8c15-4822-adad-0969bda0f633",
        },
      ],
    },
    answerExplanation:
      "공동 용접작업에서 주변 사람이 받는 아크의 유해광선은 작업자 사이에 설치한 차광막으로 차폐합니다. 경계통로는 이동 구역을 구분하고, 환기장치와 집진장치는 공기 중 흄·가스·분진을 제어하므로 유해광선을 직접 차단하는 1번 차광막이 정답입니다.",
    solutionSteps: [
      "지문의 위험요인이 흄이나 통행 충돌이 아니라 ‘유해광선’임을 표시합니다.",
      "각 보기의 주기능을 광선 차폐, 통로 구분, 환기, 분진 포집으로 나눕니다.",
      "작업자 사이에서 아크광을 물리적으로 가리는 차광막을 선택합니다.",
    ],
    keyRule:
      "공동 용접작업의 아크광은 작업자 사이에 차광막을 설치해 차폐하며, 환기·집진 설비는 공기 중 유해물질 제어용입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "차광막은 용접 구역과 주변 사람 사이에 설치해 아크의 자외선·적외선·강한 가시광선이 직접 노출되는 것을 막습니다.",
        plausibleReason:
          "지문이 ‘설치’와 ‘유해광선’을 함께 제시해 차광막의 위치와 기능이 정확히 일치합니다.",
        incorrectPoint: null,
        keyRule:
          "주변 작업자의 아크광 노출을 막는 설치형 방호설비는 차광막입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "경계통로는 사람과 장비의 이동 경로 또는 작업구역의 경계를 구분하는 시설이지 빛을 차폐하는 불투명 장벽이 아닙니다.",
        plausibleReason:
          "작업자 사이를 분리한다는 표현만 보고 구역 경계가 유해광선도 막는다고 생각할 수 있습니다.",
        incorrectPoint:
          "통행 구역을 표시해도 아크광의 직선 노출은 차단되지 않으므로 지문의 위험을 제거하지 못합니다.",
        keyRule:
          "경계 표시와 광선 차폐는 기능이 다르며, 유해광선에는 시선을 가리는 차광막이 필요합니다.",
        differenceFromCorrect:
          "경계통로는 이동 영역을 나누고 차광막은 불투명한 차폐면으로 아크광을 막습니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "환기장치는 작업장 공기를 공급·배출해 용접흄과 가스 농도를 낮추는 설비입니다.",
        plausibleReason:
          "용접 유해요인을 줄이는 대표 설비라서 광선 위험에도 적용된다고 넓게 해석할 수 있습니다.",
        incorrectPoint:
          "공기 흐름을 만들어도 자외선·적외선의 직선 노출을 물리적으로 차단하지 못합니다.",
        keyRule:
          "환기는 공기 오염물질을 제어하고 차광막은 복사되는 유해광선을 차폐합니다.",
        differenceFromCorrect:
          "환기장치는 흄·가스를 희석하거나 배출하지만 차광막은 작업자 사이의 광선을 가립니다.",
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope",
        rationale:
          "집진장치는 발생원에서 용접흄과 입자상 물질을 포집하는 설비입니다.",
        plausibleReason:
          "용접 시 발생하는 유해물질을 제거하므로 모든 주변 작업자 위험을 막는다고 오해할 수 있습니다.",
        incorrectPoint:
          "입자를 포집하는 흡입 설비는 아크에서 방출되는 자외선과 적외선을 가리지 못합니다.",
        keyRule:
          "집진은 입자상 오염물질 포집이고 차광은 유해광선 차폐입니다.",
        differenceFromCorrect:
          "집진장치는 흄을 흡입하고 차광막은 빛이 주변 작업자에게 직접 닿는 경로를 막습니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-0b53ad90-99d3-4cbf-acb9-4b86c387e340",
    contentDigest:
      "e2e6bc05245719578fe752194999ebefb91cc18b4fbffff1faa36536363211b5",
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
      "operating_pressure_source_missing: 보통 작업에서 산소 조정압을 3~4 kgf/cm² 이하로 보는 직접 표·교재·제조사 근거가 연결되지 않았습니다.",
      "unit_and_tip_condition_missing: 적정 산소압력은 팁과 작업조건에 따라 달라질 수 있는데 지문에는 그 조건이 없어 수치 선택지를 확정 설명할 수 없습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0b629617-b26c-4feb-b1be-27152697c7e7",
    contentDigest:
      "27a009033b08cb88294d9a51bfbacf72d7b171e6135032e57fb7dae11d346a0c",
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
      "specific_flux_chemistry_evidence_missing: 현재 납땜 레슨은 플럭스의 일반 역할만 설명하며 염화아연과 염화암모늄 혼합물의 흡수성·내식성·스테인리스 적용을 직접 다루지 않습니다.",
      "choice_material_properties_not_source_bound: 인산·알칼리·목재수지·염화아연의 용도와 성질을 선택지별로 검증할 직접 재료 근거가 필요합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0b7a714a-9344-4b9a-a829-65c331b8be4b",
    contentDigest:
      "6ca1ed58e8af826ebc2e72a78ea29dc758463167881d2e8c79d85d2f12f92143",
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
      "cylinder_filling_standard_missing: 산소용기 충전 조건 35℃·15 MPa를 직접 규정한 적용 시점의 공식 고압가스 기준 URL이 연결되지 않았습니다.",
      "time_sensitive_safety_value_requires_current_source: 온도와 충전압력은 규격·표준상 조건값이므로 과거 복원 정답만으로 현재 안전정보로 공개하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0ba3351b-e547-470b-bc19-b46189743d35",
    contentDigest:
      "ada4c3ee08a09b9cbd8ad2cd828a59485d2b4118c16cbccbd05fbed37421ccb1",
    authoringDisposition: "hold_candidate",
    reviewStatus: "hold",
    assessmentKind: "principle",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [
      "electrical_resistance_flux_condition_missing: 현재 레슨은 산화막 제거·젖음성·유동성은 설명하지만 전기저항 납땜용 용제가 부도체여야 한다는 보기의 오류를 직접 설명하지 않습니다.",
      "source_text_typo_and_term_review_required: 보기의 ‘간화 피막’ 표현이 복원 오탈자인지 확인하고 용제의 전기적 성질을 직접 근거와 대조해야 합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0d1cf0de-4a52-460c-b0af-afe67bdc4643",
    contentDigest:
      "738c71f88a64d1a3f4654749d517cfe435c611d80ca4d1e3235958e246a5371e",
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
      "acetylene_handling_official_source_missing: 용해아세틸렌 보관온도, 방폭 전기설비, 충전구 해빙수 온도를 직접 규정한 공식 안전 URL이 연결되지 않았습니다.",
      "numeric_temperature_limits_need_verification: 45℃ 보관과 35℃ 이하 온수라는 두 수치 조건을 적용 시점의 고압가스 기준과 대조해야 합니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0d47eb38-a356-41d7-baea-ff97a95513d1",
    contentDigest:
      "f7c6cd8778dec9bada26800246cff2af17db00a872bef795d7cd5935f5ec9d44",
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
      "projection_lesson_mismatch: 이 문항은 냉간압접의 정의를 묻지만 현재 제안 레슨은 용접변형·잔류응력으로 직접 주제가 일치하지 않습니다.",
      "cold_pressure_definition_missing: 상온에서 경계면을 국부 소성변형시켜 접합하는 냉간압접의 직접 정의가 공개 레슨 블록에 없습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0d7d54d0-4f3c-4747-9c38-ff0e9e6d3dd7",
    contentDigest:
      "0b11f50427ea79f9bbdeba7eb17cb08cc021bf5c11fb195d3fe130eed1cddeb0",
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
      "shade_table_official_source_missing: 300 A 이상 아크용접·절단에 차광도 13~14를 적용하는 공식 차광번호 표 URL이 연결되지 않았습니다.",
      "numeric_ppe_rule_not_in_lesson: 현재 보호구 레슨은 공정과 전류에 맞는 차광번호 선택만 설명하고 정확한 전류 구간별 번호는 제공하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0de820bc-24a5-452e-a72f-4363d0f37404",
    contentDigest:
      "b8e9de49e3cd29e4708a3b3f7887b0402098d441ed39d6b0e2acaa0675a47a41",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "principle",
      assertionText:
        "용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 전도·낙하·충격을 막습니다. 용해아세틸렌 용기는 운반·보관·사용할 때 세워 고정합니다. 산소 밸브와 조정기 등 산소계통에는 기름·그리스를 묻히지 않고 밸브는 서서히 엽니다. 가스별 전용 호스·연결구를 사용하고 이름표 등으로 오접속을 방지하며, 누설은 비눗물 등 승인된 검지액으로 확인하고 불꽃을 사용하지 않습니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-gas#principle",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=158&um=s",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-0de820bc-24a5-452e-a72f-4363d0f37404",
        },
      ],
    },
    answerExplanation:
      "지문은 산소용기 취급 중 잘못된 것을 묻습니다. 산소계통에는 기름·그리스를 묻히면 안 되므로 ‘밸브와 조정기를 기름천으로 닦는다’는 1번 보기가 금지 원칙을 정면으로 위반합니다. 충격 방지, 밸브의 서서히 개방, 비눗물 누설점검은 모두 레슨의 올바른 취급 절차와 일치합니다.",
    solutionSteps: [
      "지문의 부정형 표현인 ‘잘못된 것’을 먼저 표시하고 각 보기를 산소계통 유분 금지·충격 방지·서서히 개방·비눗물 점검 규칙과 대조합니다.",
      "유분을 산소계통에 직접 접촉시키는 1번만 금지 원칙을 위반하므로 정답으로 선택합니다.",
    ],
    keyRule:
      "산소 밸브와 압력조정기에는 유분을 묻히지 않고, 밸브는 서서히 열며 누설은 비눗물 등 승인된 검지액으로 확인합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "‘산소용기 밸브, 조정기 등을 기름천으로 잘 닦는다’는 기름을 산소계통에 접촉시키므로 유분 금지 원칙을 위반합니다.",
        plausibleReason:
          "‘잘 닦는다’는 표현만 보면 청결한 관리처럼 보이지만, 닦는 천에 기름이 묻어 있다는 조건이 위험을 만듭니다.",
        incorrectPoint: null,
        keyRule:
          "산소계통의 밸브·조정기에는 기름이나 그리스를 사용하거나 묻히지 않습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "‘산소용기 운반 시에는 충격을 주어서는 안 된다’는 전도·낙하·충격 방지 원칙에 맞는 올바른 취급입니다.",
        plausibleReason:
          "운반 중 작은 충격은 불가피하다고 가볍게 볼 수 있지만 고압용기는 충격 자체를 예방해야 합니다.",
        incorrectPoint:
          "올바른 충격 방지 조치이므로 ‘잘못된 것’을 묻는 지문의 정답이 아닙니다.",
        keyRule:
          "고압가스 용기는 운반과 사용 과정에서 전도·낙하·충격을 방지합니다.",
        differenceFromCorrect:
          "정답 보기는 금지된 유분을 접촉시키지만, 이 보기는 필요한 충격 방지를 요구합니다.",
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "‘산소 밸브의 개폐는 천천히 해야 한다’는 산소 밸브를 서서히 열라는 원칙과 일치합니다.",
        plausibleReason:
          "작업을 빨리 시작하려고 밸브를 한 번에 열고 싶을 수 있으나 급개방은 올바른 취급이 아닙니다.",
        incorrectPoint:
          "서서히 개방하라는 안전 절차를 정확히 설명하므로 잘못된 보기가 아닙니다.",
        keyRule: "산소 밸브는 급격히 열지 말고 서서히 개방합니다.",
        differenceFromCorrect:
          "정답은 유분 접촉이라는 금지행위이고, 이 보기는 압력계통을 안전하게 여는 절차입니다.",
      },
      {
        choiceIndex: 3,
        relation: "contradicts",
        rationale:
          "‘가스 누설의 점검은 비눗물로 한다’는 승인된 검지액으로 누설을 확인하고 불꽃을 쓰지 않는 원칙에 맞습니다.",
        plausibleReason:
          "비눗물이 단순한 생활용품처럼 보여 점검 방법으로 부적절하다고 오해할 수 있습니다.",
        incorrectPoint:
          "비눗물 누설점검은 레슨에 명시된 올바른 확인 방법이므로 정답이 아닙니다.",
        keyRule:
          "가스 누설은 비눗물 등 승인된 검지액으로 확인하고 불꽃으로 검사하지 않습니다.",
        differenceFromCorrect:
          "정답은 산소계통에 유분을 묻히는 행위이고, 이 보기는 누설을 안전하게 찾는 방법입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-gas-evidence-promoter-part-01",
    authoredAt: "2026-08-03T03:00:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-0e3b73b7-d9d9-4c21-8a62-772fb8a4236a",
    contentDigest:
      "3b7f56c02423489663e4cbe1f3d2310bb76352f303d34513829156378d405431",
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
      "defect_cause_evidence_missing: 라미네이션이 모재 내부의 층상 결함이고 언더컷·용입불량·크레이터 균열과 발생 주체가 다르다는 직접 결함 원인표가 연결되지 않았습니다.",
      "lesson_block_unavailable: 제안 레슨 lesson-welding-defect-undercut가 현재 용접 CBT 레슨 묶음에서 직접 인용 가능한 블록을 제공하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0f40ba52-7383-4ac5-9d67-554c051fdfdd",
    contentDigest:
      "7e28a2af3a6b5b6bd40907217d86eb814e52be23a1849b203d1fe6d07d8155cc",
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
      "shade_table_official_source_missing: 100 A 이상 300 A 미만 작업에 차광도 10~12를 적용하는 공식 차광번호 표 URL이 연결되지 않았습니다.",
      "numeric_ppe_rule_not_in_lesson: 현재 레슨은 차광번호가 공정과 전류에 맞아야 한다는 원칙만 제공하므로 이 수치 정답을 직접 재현할 수 없습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4",
    contentDigest:
      "070b339ab92f8cee8224cd62a2d7209077f5da6a6c4fa194074863b871f928b3",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-resistance",
    conceptBinding: {
      lessonId: "lesson-welding-resistance",
      lessonBlockId: "structure",
      assertionText:
        "점용접은 개별 점 너깃을 만들고, 심용접은 롤러 전극으로 겹치는 연속 또는 간헐 점을 만들어 기밀한 이음을 얻습니다. 프로젝션용접은 돌기를 이용해 전류와 압력을 국부 집중시키며, 플래시버트용접은 맞대기면의 플래시 가열 후 업셋합니다.",
      evidenceRefs: [
        {
          kind: "source_question",
          ref: "wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-resistance#structure",
        },
      ],
    },
    answerExplanation:
      "이음 형상을 기준으로 보면 플래시 용접은 두 모재의 끝면을 맞댄 상태에서 플래시 가열 후 업셋하여 접합하는 맞대기 저항용접입니다. 점 용접·심 용접·프로젝션 용접은 대표적으로 겹친 판재의 국부를 접합하는 방식이므로 정답은 플래시 용접입니다.",
    solutionSteps: [
      "문제가 열원이나 전극 모양이 아니라 ‘이음 형상에 따른 분류’를 묻는지 먼저 확인합니다.",
      "점 용접과 심 용접은 겹친 판재에 너깃을 만들고, 프로젝션 용접은 돌기에 전류와 압력을 집중시키는 방식으로 구분합니다.",
      "플래시 용접은 맞댄 단면을 플래시로 가열한 뒤 업셋하므로 맞대기 용접에 해당한다고 판단합니다.",
    ],
    keyRule:
      "저항용접을 이음 형상으로 나눌 때 플래시버트용접은 맞대기형이고, 점·심·프로젝션용접은 주로 겹치기형으로 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "점 용접은 전극 사이에 겹친 판재를 가압하고 통전하여 개별 점 너깃을 만드는 저항용접입니다.",
        plausibleReason:
          "점 용접도 대표적인 저항용접이라서 저항용접의 종류만 기억하면 정답처럼 보일 수 있습니다.",
        incorrectPoint:
          "문제는 저항용접 여부가 아니라 맞대기 이음에 속하는 공정을 묻는데, 점 용접은 주로 겹치기 이음입니다.",
        keyRule:
          "점 용접은 겹친 판재에 개별 너깃을 만드는 방식으로 구분합니다.",
        differenceFromCorrect:
          "플래시 용접은 맞댄 끝면 전체를 가열·업셋하지만 점 용접은 겹친 판재의 국부 점을 접합합니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "심 용접은 롤러 전극으로 겹친 판재에 연속 또는 간헐적인 너깃 열을 만드는 저항용접입니다.",
        plausibleReason:
          "연속 이음을 만들어 기밀성을 얻는 특징 때문에 맞대기 이음으로 오해하기 쉽습니다.",
        incorrectPoint:
          "연속성이 있어도 기본 접합 형상은 겹친 판재이며 맞댄 단면을 업셋하는 공정이 아닙니다.",
        keyRule: "심 용접은 롤러 전극과 겹치기 이음을 함께 기억합니다.",
        differenceFromCorrect:
          "플래시 용접은 끝면을 맞대어 업셋하고, 심 용접은 겹친 판재를 롤러 전극으로 연속 접합합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "플래시 용접은 맞댄 모재 끝면에 플래시를 발생시켜 가열한 뒤 축방향으로 업셋하여 접합하는 맞대기 저항용접입니다.",
        plausibleReason:
          "명칭에 버트가 생략되어 있어도 플래시 가열과 업셋이라는 작동 과정이 맞대기 이음을 직접 가리킵니다.",
        incorrectPoint: null,
        keyRule:
          "플래시버트용접은 맞댄 단면을 플래시 가열한 뒤 업셋하는 공정입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "프로젝션 용접은 모재의 돌기에 전류와 압력을 집중하여 하나 또는 여러 개의 국부 접합부를 만드는 저항용접입니다.",
        plausibleReason:
          "돌기를 눌러 접합한다는 점 때문에 맞댄 면 전체를 압접하는 방식으로 혼동할 수 있습니다.",
        incorrectPoint:
          "프로젝션 용접의 분류 기준은 돌기에 집중되는 국부 접합이며, 맞댄 끝면을 플래시 가열·업셋하는 방식이 아닙니다.",
        keyRule:
          "프로젝션 용접은 돌기 집중, 플래시 용접은 맞댄 끝면의 플래시와 업셋으로 구분합니다.",
        differenceFromCorrect:
          "플래시 용접은 맞대기면 전체를 업셋하지만 프로젝션 용접은 돌기 위치에 전류와 압력을 집중합니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
  {
    canonicalId: "wcbt-10679df5-5977-4fc4-8651-24e0d6412dbb",
    contentDigest:
      "3e97167fdeb7bad73ea412b8bdbec7e4a47f2e7e6528645df88aa78cfbe8441c",
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
      "acetylene_explosion_chemistry_evidence_missing: 구리계 아세틸라이드, 압력에 따른 분해폭발, 산소와의 폭발성 혼합물, 아세톤의 용해 역할을 직접 비교하는 공식·교재 근거가 없습니다.",
      "projection_lesson_is_too_general: 화재·폭발 레슨은 연소 3요소와 화기작업을 설명하지만 아세틸렌과 네 보기의 화학적 관계를 직접 뒷받침하지 않습니다.",
    ],
    author: "codex-welding-author-part-01-remaining",
    authoredAt: "2026-08-03T01:30:00.000Z",
    reviewer: "codex-welding-reviewer-part-01-remaining",
    reviewedAt: "2026-08-03T02:00:00.000Z",
  },
] as const;

const FINAL_REVIEWER = "codex-welding-reviewer-final-parts01-05";
const FINAL_REVIEWED_AT = "2026-08-03T04:30:00.000Z";

export const WELDING_CBT_ANSWER_REVIEWS_PART_01 =
  WELDING_CBT_ANSWER_REVIEWS_PART_01_BASE.map((entry) => {
    if (entry.canonicalId === "wcbt-090f8987-d07c-4aae-8a13-bfbcba5bdc4b") {
      return {
        ...entry,
        authoringDisposition: "publish_candidate" as const,
        reviewStatus: "pending" as const,
        primaryLeafLessonId: "lesson-welding-safety-ppe",
        conceptBinding: {
          lessonId: "lesson-welding-safety-ppe",
          lessonBlockId: "definition",
          assertionText:
            "용접면과 차광필터는 아크광·자외선·적외선과 비산물을, 보안경은 연삭·슬래그 제거의 입자를, 적합한 호흡보호구는 흄과 가스를, 장갑·앞치마·안전화는 열과 불티를 줄입니다.",
          evidenceRefs: [
            { kind: "lesson_block" as const, ref: "lesson-welding-safety-ppe#definition" },
            { kind: "official_source" as const, ref: "https://portal.kosha.or.kr/openapi/v1/file/down/CTC2026012909222643246624/1" },
            { kind: "official_source" as const, ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s" },
            { kind: "source_question" as const, ref: "wcbt-090f8987-d07c-4aae-8a13-bfbcba5bdc4b" },
          ],
        },
        answerExplanation:
          "가스용접 안전사항 중 틀린 것은 ‘가스용접을 할 때는 면장갑을 낀다.’입니다. 레슨은 열과 비산물에는 방열 보호구를 대응시키므로, 면장갑을 용접 장갑으로 바꾸어 읽지 말고 보기의 재질을 그대로 판별합니다.",
        solutionSteps: [
          "가스용접의 위험원을 강한 가시광선·적외선, 비산물, 열로 나누어 봅니다.",
          "차광유리 보안경은 눈·얼굴의 광선과 비산물 대응 수단인지 확인합니다.",
          "열과 비산물 대응 보호구 자리에 면장갑을 둔 1번을 틀린 안전사항으로 고릅니다.",
        ],
        keyRule:
          "가스용접에서는 눈·얼굴 보호구와 열·비산물에 맞는 방열 보호구를 위험원별로 갖추며, 면장갑을 용접용 방열 보호구처럼 취급하지 않습니다.",
        choiceFeedback: [
          {
            choiceIndex: 0, relation: "supports" as const,
            rationale: "‘면장갑’은 열과 비산물에 대응하는 방열 보호구라는 레슨의 분류와 맞지 않아 틀린 보기입니다.",
            plausibleReason: "장갑을 끼면 손을 보호한다는 일반적 인상 때문에 재질 차이를 지나치기 쉽습니다.",
            incorrectPoint: null,
            keyRule: "가스용접 손 보호는 열과 비산물 위험에 맞는 방열 보호구로 판단합니다.",
            differenceFromCorrect: null,
          },
          {
            choiceIndex: 1, relation: "refuted_by" as const,
            rationale: "차광유리가 부착된 보안경은 가스용접의 강한 가시광선·적외선과 비산물에 대한 눈 보호 취지와 맞습니다.",
            plausibleReason: "보안경은 연삭용으로만 생각하면 용접 광선 보호와의 연결을 놓칠 수 있습니다.",
            incorrectPoint: "이 보기는 눈의 광선·비산물 노출을 줄이는 안전사항이므로, 틀린 안전사항을 고르는 문제의 대상이 아닙니다.",
            keyRule: "가스용접의 눈 보호는 차광 기능과 비산물 보호를 함께 확인합니다.",
            differenceFromCorrect: "1번은 손 보호 재질이 부적합하지만, 2번은 눈의 광선·비산물 노출에 대응합니다.",
          },
          {
            choiceIndex: 2, relation: "refuted_by" as const,
            rationale: "납·아연합금 또는 도금재료 용접 때 중독 우려를 주의하라는 보기는 유해인자 노출을 경계하는 안전사항입니다.",
            plausibleReason: "보호구만 떠올리면 재료에서 생길 수 있는 유해인자 주의를 부수적인 말로 오해할 수 있습니다.",
            incorrectPoint: "이 보기는 도금재료 등에서 생길 수 있는 유해인자 노출을 주의하라는 안전사항이므로 제외됩니다.",
            keyRule: "용접 안전은 광선·열뿐 아니라 작업 재료에서 오는 유해인자도 함께 살핍니다.",
            differenceFromCorrect: "1번은 보호구 선택 자체가 틀렸고, 3번은 재료 유해인자에 대한 주의라는 별도 안전 축입니다.",
          },
          {
            choiceIndex: 3, relation: "refuted_by" as const,
            rationale: "가연성 물질이 없는 안전한 장소를 택하라는 보기는 용접 불티와 열원을 가연물에서 분리하는 화기작업 원칙과 맞습니다.",
            plausibleReason: "가스용접 문제를 개인보호구 문제로만 보면 작업장 가연물 관리까지는 생각하지 못할 수 있습니다.",
            incorrectPoint: "이 보기는 가연성 물질에서 작업 구역을 분리하는 화재 예방 조치이므로 제외됩니다.",
            keyRule: "용접 전에는 불티와 열원이 닿을 수 있는 가연성 물질을 작업 구역에서 분리합니다.",
            differenceFromCorrect: "1번은 장갑 재질이 문제이고, 4번은 작업장 화재 위험을 통제하는 조치입니다.",
          },
        ],
        essentialRank: 1,
        essentialRationale: "가스용접의 손·눈 보호와 유해인자·가연물 관리의 대상을 분리해 판별하는 안전 문항입니다.",
        holdReasons: [],
        author: "codex-welding-author-safety-01-02",
        authoredAt: "2026-08-03T00:00:00.000Z",
        reviewer: null,
        reviewedAt: null,
      };
    }
    if (
      entry.canonicalId
      === "wcbt-0211af37-8db1-464d-8dcf-eb1b4bf39e78"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "용접장갑은 손에, 용접헬멧은 눈·얼굴에, 가죽 앞치마는 몸통에 착용하는 개인보호구이고, 용접 차광막은 작업자 사이에 설치해 주변 작업자의 아크광 노출을 막는 방호설비입니다.",
        },
        answerExplanation:
          "용접장갑·용접헬멧·가죽 앞치마는 작업자가 몸에 착용하는 개인보호구입니다. 용접 차광막은 몸에 착용하지 않고 작업자 사이에 설치하는 방호설비이므로 3번이 정답입니다.",
        solutionSteps: [
          "‘착용하는 보호구가 아닌 것’을 묻는 부정형임을 확인합니다.",
          "장갑·헬멧·앞치마는 신체에 착용하고, 차광막은 작업자 사이에 설치한다는 위치 차이를 대조합니다.",
          "설치형 방호설비인 용접 차광막을 선택합니다.",
        ],
        keyRule:
          "신체에 착용하면 개인보호구이고, 작업자 사이에 설치해 아크광을 막으면 차광막 같은 방호설비입니다.",
        choiceFeedback: entry.choiceFeedback?.map((feedback) => {
          if (feedback.choiceIndex === 0) {
            return {
              ...feedback,
              rationale: "용접장갑은 작업자가 손에 착용하는 개인보호구입니다.",
              incorrectPoint:
                "몸에 착용하는 보호구이므로 ‘착용하는 보호구가 아닌 것’에 해당하지 않습니다.",
              keyRule: "용접장갑은 손에 착용하는 개인보호구입니다.",
              differenceFromCorrect:
                "용접장갑은 손에 착용하지만 차광막은 작업자 사이에 설치합니다.",
            };
          }
          if (feedback.choiceIndex === 1) {
            return {
              ...feedback,
              rationale: "용접헬멧은 작업자가 눈과 얼굴에 착용하는 개인보호구입니다.",
              incorrectPoint:
                "눈과 얼굴에 착용하는 보호구이므로 제외 대상이 아닙니다.",
              keyRule: "용접헬멧은 눈과 얼굴에 착용하는 개인보호구입니다.",
              differenceFromCorrect:
                "용접헬멧은 눈과 얼굴에 착용하지만 차광막은 작업자 사이에 설치합니다.",
            };
          }
          if (feedback.choiceIndex === 2) {
            return {
              ...feedback,
              rationale:
                "용접 차광막은 몸에 착용하지 않고 작업자 사이에 설치하는 방호설비입니다.",
              incorrectPoint: null,
              keyRule:
                "차광막은 개인보호구가 아니라 주변 작업자의 아크광 노출을 줄이는 설치형 방호설비입니다.",
              differenceFromCorrect: null,
            };
          }
          return {
            ...feedback,
            rationale: "가죽 앞치마는 작업자가 몸통에 착용하는 개인보호구입니다.",
            incorrectPoint:
              "몸통에 착용하는 보호구이므로 ‘착용하는 보호구가 아닌 것’에 해당하지 않습니다.",
            keyRule: "가죽 앞치마는 몸통에 착용하는 개인보호구입니다.",
            differenceFromCorrect:
              "가죽 앞치마는 몸통에 착용하지만 차광막은 작업자 사이에 설치합니다.",
          };
        }) ?? null,
        holdReasons: [],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    if (
      entry.canonicalId
      === "wcbt-0af025b3-8c15-4822-adad-0969bda0f633"
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
          "official_choice_scope_incomplete: 공식 자료는 차광막의 주변 작업자 광선 차폐 기능은 뒷받침하지만 경계통로·환기장치·집진장치까지 네 보기를 같은 범위에서 직접 대조하지 못해 공개하지 않습니다.",
        ],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    if (
      entry.canonicalId
      === "wcbt-0de820bc-24a5-452e-a72f-4363d0f37404"
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
          "official_source_scope_incomplete: 연결된 1차 근거에서 산소계통 유분 금지·충격 방지·서서히 개방·비눗물 누설검사 네 보기를 모두 직접 대조할 수 없으므로 공개하지 않습니다.",
        ],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    return entry;
  });
