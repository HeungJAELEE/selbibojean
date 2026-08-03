const AUTHOR = "welding_author_part07";
const AUTHORED_AT = "2026-08-02T15:36:35.825Z";
const REVIEWER = "welding_reviewer_part07";
const REVIEWED_AT = "2026-08-03T00:38:00.000Z";
const KOSHA_ELECTRICAL_WELDING_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s";
const KOSHA_PPE_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s";
const KOSHA_WELDING_SAFETY_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s";
const OCCUPATIONAL_SAFETY_AND_HEALTH_STANDARDS_RULES =
  "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=273603";

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
  holdReason: string,
) {
  return {
    canonicalId,
    contentDigest,
    authoringDisposition: "hold_candidate" as const,
    reviewStatus: "hold" as const,
    assessmentKind,
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [holdReason],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  };
}

function publishSafetyCandidate(input: {
  canonicalId: string;
  contentDigest: string;
  lessonId: "lesson-welding-safety-electrical" | "lesson-welding-safety-ppe";
  lessonBlockId: string;
  assertionText: string;
  answerExplanation: string;
  solutionSteps: string[];
  keyRule: string;
  choiceFeedback: {
    choiceIndex: number;
    relation:
      | "supports"
      | "refuted_by"
      | "contradicts"
      | "out_of_scope"
      | "confused_with";
    rationale: string;
    plausibleReason: string;
    incorrectPoint: string | null;
    keyRule: string;
    differenceFromCorrect: string | null;
  }[];
  additionalEvidenceRefs?: {
    kind: "lesson_block" | "official_source";
    ref: string;
  }[];
}) {
  return {
    canonicalId: input.canonicalId,
    contentDigest: input.contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "pending" as const,
    assessmentKind: "safety" as const,
    primaryLeafLessonId: input.lessonId,
    conceptBinding: {
      lessonId: input.lessonId,
      lessonBlockId: input.lessonBlockId,
      assertionText: input.assertionText,
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: `${input.lessonId}#${input.lessonBlockId}`,
        },
        {
          kind: "source_question" as const,
          ref: input.canonicalId,
        },
        {
          kind: "official_source" as const,
          ref: KOSHA_ELECTRICAL_WELDING_GUIDE,
        },
        ...(input.additionalEvidenceRefs ?? []),
      ],
    },
    answerExplanation: input.answerExplanation,
    solutionSteps: input.solutionSteps,
    keyRule: input.keyRule,
    choiceFeedback: input.choiceFeedback,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  };
}

const WELDING_CBT_ANSWER_REVIEWS_PART_07_AUTHORED = [
  publishSafetyCandidate({
    canonicalId: "wcbt-5328eb9a-d28d-4752-9ce3-35ec0c6e2675",
    contentDigest:
      "a7b690326231042a9eb405788433db258b36901f508b1336b83dbf7af602e2ef",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "principle",
    assertionText:
      "교류 아크용접 작업자는 절연장갑을 착용하고 손상이 없는 절연형 용접봉 홀더를 사용합니다.",
    additionalEvidenceRefs: [
      { kind: "official_source", ref: KOSHA_WELDING_SAFETY_GUIDE },
      {
        kind: "official_source",
        ref: OCCUPATIONAL_SAFETY_AND_HEALTH_STANDARDS_RULES,
      },
    ],
    answerExplanation:
      "원문이 말하는 ‘비안전형 홀더’는 충전부 접근방호나 절연이 충분하지 않은 과거 교육 용어로 읽습니다. 이런 홀더는 통전부 접촉 가능성을 높이므로 가장 직접적인 재해는 전격이며 네 번째 보기가 정답입니다. 이 표현을 현행 표준의 B형 홀더와 동일시하거나 B형 전체를 사용금지품으로 해석하지 않습니다.",
    solutionSteps: [
      "문제가 홀더의 비안전형이라는 결함과 가장 직접적인 재해를 연결하는지 확인합니다.",
      "절연형 홀더와 절연장갑이 막는 위험이 충전부와 손의 접촉, 즉 전격임을 적용합니다.",
      "낙상·협착·전도와 달리 홀더의 절연 결함에서 바로 이어지는 전격 재해를 고릅니다. 여기서 전도 재해는 전기 전도 현상이 아니라 넘어짐·쓰러짐 계열의 과거 재해분류 용어입니다.",
    ],
    keyRule:
      "교류 아크용접에서는 손상 없는 절연형 홀더와 절연장갑으로 통전부의 직접 접촉을 막아 전격을 예방합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "낙상은 높은 곳·개구부·발판의 추락 위험에서 직접 발생하며, 홀더의 절연 결함 자체가 만드는 재해는 아닙니다.",
        plausibleReason:
          "감전으로 놀라 넘어질 가능성을 떠올려 낙상과 연결할 수 있습니다.",
        incorrectPoint: "문항은 2차 상황이 아니라 비안전형 홀더의 직접 재해를 묻습니다.",
        keyRule: "홀더 절연 불량은 손과 충전부의 접촉 위험을 먼저 높입니다.",
        differenceFromCorrect: "낙상은 작업장 조건의 재해이고, 정답은 통전부 접촉의 전격 재해입니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "협착은 회전부·끼임점 등 기계적 압착 위험에서 생기며, 전기가 흐르는 홀더의 절연 성능과 직접 관련이 없습니다.",
        plausibleReason:
          "홀더를 쥐는 동작을 기계에 손이 끼는 위험과 혼동할 수 있습니다.",
        incorrectPoint: "비안전형 홀더의 결함은 기계적 끼임이 아니라 절연 상실입니다.",
        keyRule: "절연 결함의 우선 위험은 충전부와 인체의 전기적 접촉입니다.",
        differenceFromCorrect: "협착은 기계 위험, 전격은 통전부·절연 결함 위험입니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "이 문항의 전도 재해는 전류가 흐르는 전기 전도가 아니라 넘어짐·쓰러짐 계열의 과거 재해분류 용어입니다. 바닥·통로·균형 상실이 직접 원인이므로 홀더 절연 결함의 1차 재해가 아닙니다.",
        plausibleReason:
          "작업 중 불편한 케이블과 홀더를 함께 떠올려 넘어짐을 고를 수 있습니다.",
        incorrectPoint: "문항의 위험원은 통로가 아니라 절연되지 않은 홀더입니다.",
        keyRule: "재해분류의 전도와 전기의 전도성을 구분하고, 홀더의 직접 위험은 충전부 접촉으로 판단합니다.",
        differenceFromCorrect: "전도는 이동 환경의 재해이고, 정답은 홀더 접촉에서 비롯되는 전격입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "원문의 비안전형 홀더는 충전부 접근방호나 절연이 충분하지 않은 상태를 가리키므로 작업자의 손이 전기에 노출될 수 있습니다. 현행 B형 홀더와 자동으로 같은 뜻으로 매핑하지 않습니다.",
        plausibleReason:
          "문제의 비안전형 홀더와 절연형 홀더 사용 원칙을 대조하면 직접 위험을 판별할 수 있습니다.",
        incorrectPoint: null,
        keyRule: "절연형 홀더와 절연장갑은 전격 예방을 위한 조합입니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  publishSafetyCandidate({
    canonicalId: "wcbt-532b89e8-28da-4a34-bafe-1d64cf7291b2",
    contentDigest:
      "fa21303a6ebb22b7cde924c48dc384d4f4d434da3d51711871d81646e71d21be",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "definition",
    assertionText:
      "자동전격방지기는 교류 아크용접기의 감전 방지를 목적으로 합니다. 도전성이 높은 밀폐공간 또는 습윤 장소는 인체 저항을 낮추거나 접촉 가능성을 높여 감전 위험을 키웁니다.",
    answerExplanation:
      "밀폐된 도전성 공간은 접촉 가능성과 감전위험이 커지므로 자동전격방지기를 사용하지 말아야 하는 장소가 아니라 적극 적용해야 할 위험 조건입니다. 따라서 세 번째 보기가 틀렸습니다.",
    solutionSteps: [
      "각 보기가 충전부 접촉과 손상된 절연을 줄이는지 확인합니다.",
      "밀폐공간이 감전위험을 낮추는 조건인지 높이는 조건인지 판별합니다.",
      "위험이 큰 밀폐공간에서 전격방지기를 사용하지 않는다는 보기를 선택합니다.",
    ],
    keyRule:
      "밀폐·습윤 장소에서는 감전위험이 커지므로 절연과 자동전격방지 등 보호조치를 강화합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "홀더 절연부가 손상되어 충전부가 드러나면 즉시 보수·교체해 직접 접촉을 막아야 합니다.",
        plausibleReason:
          "절연 테이프로 잠시 감아 계속 써도 된다고 생각하면 즉시 교체 요구가 과해 보일 수 있습니다.",
        incorrectPoint:
          "손상된 절연 홀더를 교체하는 조치는 올바른 전격 방지대책입니다.",
        keyRule:
          "절연이 파손된 홀더는 사용하지 않고 적정 규격으로 보수·교체합니다.",
        differenceFromCorrect:
          "정답은 위험장소의 방호를 빼지만 이 보기는 손상된 방호를 복구합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "홀더와 용접봉을 맨손으로 잡지 않으면 충전 가능 부위와 피부의 직접 접촉을 줄일 수 있습니다.",
        plausibleReason:
          "용접봉 자체는 소모재이므로 전류가 흐르지 않는다고 오해할 수 있습니다.",
        incorrectPoint:
          "절연장갑과 절연형 홀더를 사용하는 것은 직접 접촉을 막는 적절한 조치입니다.",
        keyRule:
          "교류 아크용접 작업자는 절연장갑과 손상 없는 절연형 홀더를 사용합니다.",
        differenceFromCorrect:
          "정답은 밀폐공간의 보호장치를 배제하지만 이 보기는 인체 접촉을 막습니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "밀폐공간은 도전성 구조물 접촉 가능성이 커 감전위험이 높은데 전격방지기를 쓰지 않는다는 지시는 위험을 키웁니다.",
        plausibleReason:
          "공간이 좁아 장치를 추가하기 어렵거나 장치가 작업을 방해한다고 생각할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "밀폐·습윤 환경일수록 무부하전압 저감과 절연 보호를 생략하지 않습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "용접기 내부에는 충전부가 있으므로 자격과 안전절차 없이 손을 대지 않는 것이 감전 예방에 맞습니다.",
        plausibleReason:
          "외부 스위치가 꺼져 있으면 내부도 언제나 무전압이라고 생각할 수 있습니다.",
        incorrectPoint:
          "내부에 함부로 접근하지 않는 조치는 충전부 접촉을 피하는 올바른 대책입니다.",
        keyRule:
          "전기기기 내부 점검은 전원 격리와 무전압 확인 뒤 적격자가 수행합니다.",
        differenceFromCorrect:
          "정답은 필요한 전격방지를 거부하지만 이 보기는 충전부 접근을 제한합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-53411a9a-bb69-4302-a7c8-b52d7b5f850c",
    "0c595aeaeaa499cf8f7bda7eacea0dcc87e288e2ca2f45a97aec88aefbf4a302",
    "safety",
    "official_primary_confined_space_source_missing_and_assigned_lesson_covers_only_electrical_risk",
  ),
  holdCandidate(
    "wcbt-53896050-0379-4bb4-82aa-82a6b5bd1188",
    "ad81bb9f1bb2bd4a91a0cb20a67735ac7c04a9d897d19d5068a49ca8669d74cc",
    "identification",
    "official_cylinder_color_rule_and_direct_argon_color_lesson_assertion_missing",
  ),
  {
    canonicalId: "wcbt-53df2750-fa2e-4fe5-8cbf-c30a6fe7aafc",
    contentDigest:
      "a4973f0d70defab37f1cf9b4b9f036b3c98ee9f4cf93f842f7e3359ca7e01ec2",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-inspection-ndt",
    conceptBinding: {
      lessonId: "lesson-welding-inspection-ndt",
      lessonBlockId: "definition",
      assertionText:
        "비파괴검사는 제품을 사용 불가능하게 파괴하지 않고 결함 또는 재료 상태를 확인합니다. 육안검사(VT), 침투탐상(PT), 자분탐상(MT), 방사선투과(RT), 초음파탐상(UT) 등이 대표적이며 적용 범위가 서로 다릅니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-inspection-ndt#definition",
        },
        {
          kind: "source_question",
          ref: "wcbt-53df2750-fa2e-4fe5-8cbf-c30a6fe7aafc",
        },
      ],
    },
    answerExplanation:
      "초음파시험은 시험체 내부로 보낸 초음파의 반사 신호를 이용해 내부 불연속을 찾는 대표적인 비파괴검사입니다. 반면 굽힘시험·현미경조직시험·파면시험은 시험편을 변형하거나 절단·파괴해 결과를 확인하므로 이 문항의 비파괴시험에 해당하지 않습니다.",
    solutionSteps: [
      "각 시험이 검사 뒤에도 제품을 사용 가능한 상태로 유지하는지 먼저 구분합니다.",
      "초음파 반사 신호로 내부 결함을 찾는 초음파시험을 비파괴검사로 선택합니다.",
    ],
    keyRule:
      "제품을 사용 불가능하게 파괴하지 않고 결함을 확인하면 비파괴검사이며, 초음파시험은 대표적인 내부 비파괴검사입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts",
        rationale:
          "굽힘시험은 시험편에 굽힘 변형을 가해 연성이나 용접부 건전성을 확인하는 파괴시험입니다.",
        plausibleReason:
          "용접부 품질을 확인하는 시험이라 비파괴검사와 같은 검사군으로 오인하기 쉽습니다.",
        incorrectPoint:
          "시험편을 실제로 굽혀 소성변형 또는 파단 상태를 관찰하므로 제품을 보존하지 않습니다.",
        keyRule:
          "굽힘·인장·충격처럼 시험편에 기계적 하중을 가하는 시험은 파괴시험으로 분류합니다.",
        differenceFromCorrect:
          "초음파시험은 신호를 투입해 내부 반사를 판독하지만 굽힘시험은 시험편 자체를 변형시킵니다.",
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "현미경조직시험은 일반적으로 시편을 절단하고 연마·부식해 금속조직을 관찰하는 파괴시험입니다.",
        plausibleReason:
          "현미경으로 표면을 보는 과정 때문에 육안검사와 비슷한 비파괴 관찰로 착각할 수 있습니다.",
        incorrectPoint:
          "관찰용 시편 제작 과정에서 원래 제품을 절단하거나 채취하므로 비파괴검사가 아닙니다.",
        keyRule:
          "조직시험은 시편 채취와 전처리가 필요한지 확인해 비파괴검사와 구분합니다.",
        differenceFromCorrect:
          "초음파시험은 제품에 손상을 남기지 않고 신호를 판독하지만 조직시험은 절단 시편이 필요합니다.",
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "파면시험은 시험편을 파단시킨 뒤 파단면의 형상과 결함을 관찰하는 파괴시험입니다.",
        plausibleReason:
          "파단면에서 결함을 직접 식별하므로 결함검사라는 공통점 때문에 비파괴검사로 혼동할 수 있습니다.",
        incorrectPoint:
          "파면을 얻으려면 시험편을 파괴해야 하므로 사용 가능한 상태를 유지하지 못합니다.",
        keyRule:
          "시험 이름에 파면이 포함되면 파단면을 만들기 위한 파괴 과정이 전제되는지 확인합니다.",
        differenceFromCorrect:
          "초음파시험은 반사파로 내부를 간접 판독하지만 파면시험은 파괴한 면을 직접 관찰합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "초음파시험은 초음파의 반사와 전달 특성을 분석해 시험체를 파괴하지 않고 내부 결함을 찾습니다.",
        plausibleReason:
          "UT가 내부 결함을 탐상하는 대표 비파괴검사라는 분류를 정확히 적용한 선택입니다.",
        incorrectPoint: null,
        keyRule:
          "UT는 초음파 반사 신호를 이용하는 내부 비파괴검사로 기억합니다.",
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
    "wcbt-54512c61-a0a5-4069-8454-408808fb6884",
    "94ff94234d2e8e50653517cd2e3faf2e9fd11d13c2bf1faa6dcc87685e79ee29",
    "safety",
    "official_primary_filter_shade_table_missing_for_100_to_300_ampere_range",
  ),
  holdCandidate(
    "wcbt-54873729-6a6e-465a-bd5c-ec4c30e53719",
    "2af60de46319f6e84284b24c64dce261b9e51a64610e4446995721e3939944f4",
    "definition",
    "direct_stress_relief_annealing_assertion_missing_from_assigned_deformation_lesson",
  ),
  {
    canonicalId: "wcbt-54b1baf9-7574-493b-b616-6caa2db72509",
    contentDigest:
      "3b86e438082d478962f9383884c81cbb87bb32e19fd17cdec30fe6764bc88a1d",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "definition",
    primaryLeafLessonId: "lesson-welding-foundation-basics",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-basics",
      lessonBlockId: "structure",
      assertionText:
        "프로젝션용접은 저항열과 가압력을 이용하는 저항압접입니다. 스터드용접·피복아크용접·서브머지드아크용접은 아크열로 접합부를 용융하는 아크 융접입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-basics#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-54b1baf9-7574-493b-b616-6caa2db72509",
        },
      ],
    },
    answerExplanation:
      "프로젝션 용접은 돌기부에 전류를 집중해 저항열을 발생시키고 전극 가압력으로 접합하는 저항압접입니다. 스터드용접, 피복아크용접, 서브머지드아크용접은 모두 아크 열로 접합부를 용융하는 융접이므로 융접에 속하지 않는 것은 프로젝션 용접입니다.",
    solutionSteps: [
      "각 공정에서 모재 용융이 핵심인지, 접촉면 가압과 저항열이 핵심인지 구분합니다.",
      "저항열과 전극 가압을 사용하는 프로젝션 용접을 압접으로 분류해 정답으로 고릅니다.",
    ],
    keyRule:
      "아크 열로 모재를 녹이면 융접이고, 저항열과 가압력으로 접합하면 저항압접입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "스터드용접은 스터드 끝과 모재 사이의 아크 열로 접합부를 녹여 붙이는 아크 융접입니다.",
        plausibleReason:
          "스터드를 눌러 붙이는 마무리 동작 때문에 압접처럼 보일 수 있습니다.",
        incorrectPoint:
          "접합을 만드는 주된 에너지는 접촉저항과 가압이 아니라 아크에 의한 모재 용융입니다.",
        keyRule:
          "공정 분류는 마지막 동작보다 접합부를 만드는 주된 열원과 모재 상태로 판단합니다.",
        differenceFromCorrect:
          "프로젝션 용접은 저항열과 가압이 핵심이지만 스터드용접은 아크 용융이 핵심입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "프로젝션 용접은 돌기에 전류를 집중해 저항열을 만들고 전극 가압력으로 접합하는 저항압접입니다.",
        plausibleReason:
          "저항용접이 압접에 속한다는 분류와 돌기부 가압 원리를 정확히 적용한 선택입니다.",
        incorrectPoint: null,
        keyRule:
          "프로젝션 용접은 저항열과 가압을 사용하는 압접으로 분류합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "피복아크용접은 전극과 모재 사이의 아크 열로 모재와 용접봉을 녹이는 대표적인 융접입니다.",
        plausibleReason:
          "피복제가 압력을 가하는 재료처럼 보이거나 고체 봉을 사용하는 점 때문에 분류를 혼동할 수 있습니다.",
        incorrectPoint:
          "피복은 차폐와 슬래그 형성을 담당하며 접합을 위한 가압력이 아니므로 압접으로 바뀌지 않습니다.",
        keyRule:
          "피복아크용접은 이름 그대로 아크 열에 의한 모재 용융 공정입니다.",
        differenceFromCorrect:
          "프로젝션 용접은 가압 저항용접이지만 피복아크용접은 아크 융접입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "서브머지드아크용접은 입상 플럭스 아래에서 발생한 아크 열로 모재와 와이어를 녹이는 융접입니다.",
        plausibleReason:
          "아크가 플럭스 아래에 가려져 보이지 않는다는 특징 때문에 비아크 공정으로 착각할 수 있습니다.",
        incorrectPoint:
          "플럭스가 아크를 덮을 뿐 접합의 주된 열원은 여전히 아크이며 모재가 용융됩니다.",
        keyRule:
          "서브머지드라는 말은 아크가 플럭스 아래에 잠긴 상태를 뜻하며 압접을 뜻하지 않습니다.",
        differenceFromCorrect:
          "프로젝션 용접은 저항열과 압력을 쓰지만 서브머지드아크용접은 플럭스 아래의 아크 열을 씁니다.",
      },
    ],
    essentialRank: 2,
    essentialRationale:
      "모재 용융과 저항열·가압력 기준으로 융접과 압접을 직접 구분하는 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  {
    canonicalId: "wcbt-54d3be8c-ff5f-4757-82e6-d78cec05728c",
    contentDigest:
      "9b032cdc8c94c408e06bff1e9672c1f9d62641164fa58b0313be9f8c1d74ba2c",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "definition",
    primaryLeafLessonId: "lesson-welding-foundation-power-heat",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-power-heat",
      lessonBlockId: "definition",
      assertionText:
        "직류 정극성은 일반적으로 전극을 음극, 모재를 양극에 연결하고, 역극성은 전극을 양극, 모재를 음극에 연결합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-power-heat#definition",
        },
        {
          kind: "source_question",
          ref: "wcbt-54d3be8c-ff5f-4757-82e6-d78cec05728c",
        },
        {
          kind: "official_source",
          ref: "src/data/source/notion-theory.md:2169-2172",
        },
      ],
    },
    answerExplanation:
      "직류 정극성(DCSP)은 용접봉을 음극(-), 모재를 양극(+)에 연결하는 극성입니다. 역극성은 이 연결이 반대이고 DCRP는 직류 역극성을 뜻하므로, 문제의 연결 조건에 맞는 것은 정극성입니다.",
    solutionSteps: [
      "용접봉이 음극이고 모재가 양극이라는 단자 연결을 먼저 표시합니다.",
      "전극(-)·모재(+)의 직류 연결을 정극성(DCSP)으로 대응시킵니다.",
    ],
    keyRule:
      "DCSP 정극성은 전극(-)·모재(+), DCRP 역극성은 전극(+)·모재(-)입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "AC는 전류의 방향과 극성이 주기적으로 바뀌는 교류이므로 고정된 전극(-)·모재(+) 연결의 명칭이 아닙니다.",
        plausibleReason:
          "아크용접 전원 종류를 묻는 문제에서 AC가 자주 등장해 극성 명칭으로 착각할 수 있습니다.",
        incorrectPoint:
          "문제는 직류에서 고정된 단자 극성의 이름을 묻고 있으며 AC에는 그 고정 연결이 유지되지 않습니다.",
        keyRule:
          "AC와 DC 전원 구분 뒤에 DC에서만 정극성·역극성 연결을 판별합니다.",
        differenceFromCorrect:
          "정극성은 고정된 직류 단자 연결이지만 AC는 극성이 교번합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "보기의 ‘정극성’은 용접봉을 음극(-), 모재를 양극(+)에 연결한 직류 조건의 정확한 명칭입니다.",
        plausibleReason:
          "문제에 제시된 두 단자 기호를 DCSP의 전극(-)·모재(+) 배열과 대조하면 선택할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "straight polarity인 정극성은 전극 쪽이 음극이고 모재 쪽이 양극인 배열입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "역극성은 전극을 양극(+), 모재를 음극(-)에 연결하므로 문제에 제시된 연결과 반대입니다.",
        plausibleReason:
          "정극성과 역극성의 전극 단자를 서로 바꾸어 외우기 쉬워 선택할 수 있습니다.",
        incorrectPoint:
          "문제의 전극(-) 조건을 역극성의 전극(+) 조건으로 뒤집었습니다.",
        keyRule:
          "역극성은 정극성의 단자 연결을 정확히 반대로 한 전극(+)·모재(-)입니다.",
        differenceFromCorrect:
          "정극성은 전극이 음극이지만 역극성은 전극이 양극입니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "DCRP는 direct current reverse polarity의 약자로 직류 역극성을 뜻합니다.",
        plausibleReason:
          "DC라는 표기가 있어 문제의 직류 조건에는 맞지만 뒤의 RP를 놓치면 정극성으로 오인할 수 있습니다.",
        incorrectPoint:
          "RP는 reverse polarity이므로 전극(+)·모재(-) 연결이며 문제 조건과 반대입니다.",
        keyRule:
          "DCRP의 RP는 역극성, DCSP의 SP는 정극성을 뜻한다고 단자와 함께 확인합니다.",
        differenceFromCorrect: "정답인 정극성은 DCSP이고 DCRP는 역극성입니다.",
      },
    ],
    essentialRank: 2,
    essentialRationale:
      "전극과 모재의 극 연결을 보고 직류 정극성을 판별하는 기본 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  publishSafetyCandidate({
    canonicalId: "wcbt-554378fb-1eac-4b69-90e3-067ab9c5faf9",
    contentDigest:
      "422a5934d015c408b604d524f3e263082995a8cab297e5985bcac730e1894901",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "definition",
    assertionText:
      "자동전격방지기는 교류 아크용접기의 감전 방지를 목적으로 합니다.",
    answerExplanation:
      "아크용접기의 감전위험을 직접 줄이는 장치는 출력측 무부하전압을 낮추는 전격 방지 장치입니다. 헬멧은 머리를 보호하고, 리밋 스위치와 2차 권선장치는 이 목적의 장치가 아니므로 네 번째 보기가 정답입니다.",
    solutionSteps: [
      "문제의 목적어가 아크용접기 감전방지임을 표시합니다.",
      "각 장치가 신체 보호구인지 위치 검출인지 전원 제어인지 구분합니다.",
      "무부하전압을 낮추는 전격 방지 장치를 선택합니다.",
    ],
    keyRule:
      "아크용접기 감전방지 장치는 작업자가 아닌 출력측 무부하전압에 직접 작용해야 합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "헬멧은 낙하·비래 등 머리 위험을 줄이는 개인보호구이며 용접기 출력전압을 낮추지 않습니다.",
        plausibleReason:
          "감전 방호형 안전모가 있으므로 헬멧 자체가 용접기 감전방지 장치라고 생각할 수 있습니다.",
        incorrectPoint:
          "착용 보호구는 용접기 내부의 무부하전압을 제어하는 설비가 아닙니다.",
        keyRule:
          "개인보호구와 용접기 전압을 제어하는 공학적 방호장치를 구분합니다.",
        differenceFromCorrect:
          "정답은 용접기 출력에 작용하지만 헬멧은 작업자의 머리에 착용합니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "리밋 스위치는 기계의 위치나 이동 한계를 검출하는 부품으로 무부하 감전전압을 낮추지 않습니다.",
        plausibleReason:
          "스위치라는 이름 때문에 위험 시 전원을 자동 차단하는 장치로 보일 수 있습니다.",
        incorrectPoint:
          "위치 한계 검출은 전격방지기의 출력측 전압 저감 기능과 다릅니다.",
        keyRule: "장치 이름보다 어떤 물리량을 감지하고 제어하는지 확인합니다.",
        differenceFromCorrect:
          "정답은 전압을 저감하지만 리밋 스위치는 기계 위치를 검출합니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "2차 권선은 용접기의 전압·전류 변환 구성요소이지만 보기처럼 별도 감전방지 장치를 뜻하지 않습니다.",
        plausibleReason:
          "작업자가 접촉할 수 있는 출력측이 2차측이므로 권선 자체를 방지장치로 오인할 수 있습니다.",
        incorrectPoint:
          "2차 권선이 존재하는 것만으로 아크 소멸 뒤 무부하전압이 안전값으로 낮아지지는 않습니다.",
        keyRule:
          "전원 구성요소와 무부하전압을 자동 저감하는 보호장치를 구분합니다.",
        differenceFromCorrect:
          "정답은 2차측 전압을 안전값으로 제어하지만 이 보기는 단순 권선 구성입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "전격 방지 장치는 아크가 꺼진 무부하 상태에서 출력전압을 낮춰 홀더 접촉 감전위험을 줄입니다.",
        plausibleReason:
          "문제의 감전방지 목적과 장치의 명칭·기능이 직접 일치합니다.",
        incorrectPoint: null,
        keyRule:
          "용접기의 감전위험을 직접 줄이는 설비는 자동전격방지장치입니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-555a0255-d277-49d8-a6ca-f256252958be",
    "86b2e61f05600714c5a1119d64c8e18468fd0492c84d1c29c8e87ce7f059e2b9",
    "safety",
    "official_primary_fire_extinguisher_classification_source_missing",
  ),
  holdCandidate(
    "wcbt-55c9a8ee-a23b-45a1-b611-931deadc3bb6",
    "aad307eebf9d15fa50a89e684988cb1d170aa928ad4317e622a1ccc25e7b6b5c",
    "safety",
    "official_primary_acetylide_material_compatibility_source_missing",
  ),
  holdCandidate(
    "wcbt-573e80f6-38c7-42e6-a61d-8f942a28f103",
    "bf3fbbff92e8b417b749018d075c6bf97b6a313aa0500af8c4afeb5fcec59a72",
    "calculation",
    "direct_formula_evidence_missing_for_905_liters_per_kilogram_acetylene_conversion",
  ),
  holdCandidate(
    "wcbt-58dc1504-10b8-4b86-888c-f8b6f89665cc",
    "aa2cccc4930dd74d6245299f42c1783568f60d324df183ef3b10d0bc899d3418",
    "safety",
    "official_primary_filter_shade_table_missing_for_carbon_arc_over_400_ampere",
  ),
  holdCandidate(
    "wcbt-59878d67-ca03-4618-9a25-73f4ddb6548e",
    "4c2a3a103fd812a21abe21c390e2a45c54d4eaa82852483555f0afc55cabadd1",
    "safety",
    "official_primary_explosion_mixture_ratio_source_missing_for_oxygen_acetylene",
  ),
  holdCandidate(
    "wcbt-5a09b1ed-bff6-453b-bf9f-dfcb3d44fa09",
    "292a9677d13618ecf95e87bc0536203a62be780e0f4d36ec3bae51fb8cae575a",
    "safety",
    "official_primary_electrical_safety_source_missing_for_bare_hand_electrode_handling",
  ),
  holdCandidate(
    "wcbt-5a2a8c7f-d685-499d-b9e7-c3bf5cffe5fc",
    "701f82debde670660b29f0f12def6ff311e5fc071a31329797865a55df03b8f7",
    "safety",
    "official_primary_filter_shade_table_missing_for_hand_shield_100_to_300_ampere",
  ),
  holdCandidate(
    "wcbt-5aa223c9-0799-4f5a-a896-30b7ddbe834c",
    "0f15982ad9d402ef3626d9f06b490f04f047c8ad53ee61192a4522564e81a3d5",
    "safety",
    "official_primary_oxygen_cylinder_storage_source_missing_for_fuel_gas_separation",
  ),
  holdCandidate(
    "wcbt-5ab4d74f-bf01-4d1b-8c95-8f31f086cf0d",
    "5bedf6f13b039763ed39b7fbdb6fa9b616789859f3d3e3bf95f4bbbef7c820f1",
    "safety",
    "official_primary_acetylene_cylinder_fire_response_source_missing",
  ),
  holdCandidate(
    "wcbt-5af601ec-c0ac-47a1-9645-2f7a3b5f1206",
    "f80041bbe7dee437d0ba2de89110c487143915779b1521fcd4b3bd96865828f9",
    "safety",
    "official_primary_safety_helmet_structure_and_dimension_source_missing",
  ),
  holdCandidate(
    "wcbt-5b488388-9a3b-4e1f-bed2-4ccdc8c3b7e6",
    "8dfd613caed4af4aa98ab2c833fb5b02140aff501628d74b7f5eabe4e0949e60",
    "safety",
    "official_primary_welding_filter_cover_lens_purpose_source_missing",
  ),
  holdCandidate(
    "wcbt-5b55eff9-b6cd-49bc-8b0c-797db0098ad0",
    "79b15bad79527fdba7fa57bec140174dfb63bfa3bc4915f5d068dea605bec195",
    "safety",
    "official_primary_safety_sign_color_rule_missing_for_blue_mandatory_instruction",
  ),
  publishSafetyCandidate({
    canonicalId: "wcbt-5b5e7db4-dcf6-4169-b73c-46e3ec7655eb",
    contentDigest:
      "759a9c7a7332855a74765c8d59991080db9e6b228e56e05d044cd806e4a2c50e",
    lessonId: "lesson-welding-safety-ppe",
    lessonBlockId: "definition",
    assertionText:
      "개인보호구는 공학적·관리적 조치 후에도 남는 유해·위험요인으로부터 작업자의 신체를 보호하는 마지막 방어선입니다.",
    additionalEvidenceRefs: [
      {
        kind: "lesson_block",
        ref: "lesson-welding-safety-electrical#principle",
      },
      { kind: "official_source", ref: KOSHA_PPE_GUIDE },
    ],
    answerExplanation:
      "숙련도는 아크광·열·불티와 감전 위험을 없애지 않으므로 숙련공도 가죽장갑과 앞치마 등 필요한 보호구를 착용해야 합니다. 보호구를 생략해도 된다는 세 번째 보기가 전격방지 대책으로 틀렸습니다.",
    solutionSteps: [
      "각 보기가 충전부 접촉, 손상 절연, 보호구, 전원 차단 중 무엇을 다루는지 구분합니다.",
      "숙련도가 위험원의 존재나 보호구 필요성을 없애는 조건인지 확인합니다.",
      "숙련공은 보호구를 착용하지 않아도 된다는 보기를 선택합니다.",
    ],
    keyRule:
      "작업 숙련도와 관계없이 남아 있는 감전·열·불티 위험에 맞는 보호구를 착용합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "용접기 내부 충전부에 함부로 손대지 않으면 직접 접촉에 의한 감전 가능성을 줄일 수 있습니다.",
        plausibleReason:
          "외함이 닫혀 있거나 스위치가 꺼져 있으면 내부 점검도 안전하다고 생각할 수 있습니다.",
        incorrectPoint: "내부 접근을 제한하는 것은 올바른 전격 방지대책입니다.",
        keyRule:
          "전기기기 내부는 격리·무전압 확인과 적격 작업 절차 없이 접근하지 않습니다.",
        differenceFromCorrect:
          "정답은 보호구를 생략하지만 이 보기는 충전부 접근을 피합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "홀더 절연부가 파손되면 충전부 노출을 막도록 보수하거나 교체한 뒤 사용해야 합니다.",
        plausibleReason:
          "작은 균열이면 장갑으로 보완해 계속 쓸 수 있다고 생각할 수 있습니다.",
        incorrectPoint:
          "손상 절연을 복구하는 것은 작업자와 전류 경로를 분리하는 올바른 조치입니다.",
        keyRule:
          "절연이 파손된 홀더는 그대로 사용하지 않고 적정 규격으로 복구합니다.",
        differenceFromCorrect:
          "정답은 개인 방호를 없애지만 이 보기는 손상된 장비 방호를 회복합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "숙련공도 아크광·열·불티와 우발 접촉에 노출되므로 가죽장갑·앞치마 같은 보호구를 생략할 수 없습니다.",
        plausibleReason:
          "숙련자는 실수를 적게 하므로 보호구 없이도 위험을 통제할 수 있다고 오해할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "보호구 적용은 기술 숙련도가 아니라 남아 있는 위험요인을 기준으로 정합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "작업 종료나 장시간 중지 때 스위치를 차단하면 무부하 상태의 불필요한 충전과 오동작 가능성을 줄입니다.",
        plausibleReason:
          "아크가 꺼져 있으면 이미 전류가 흐르지 않아 스위치 차단이 필요 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "작업을 멈출 때 전원을 차단하는 것은 올바른 감전 예방조치입니다.",
        keyRule: "작업 종료와 장시간 중지 시에는 용접기 전원을 차단합니다.",
        differenceFromCorrect:
          "정답은 보호구 생략을 허용하지만 이 보기는 에너지원을 제거합니다.",
      },
    ],
  }),
  publishSafetyCandidate({
    canonicalId: "wcbt-5bbb16c3-8be6-495b-8820-491eb4b0fec6",
    contentDigest:
      "2ee9a0cd96bc796014b7574e317ad6424e9bccbe3cb0ff59b2ac6c1ae9ef53bf",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "principle",
    assertionText:
      "피복이 손상된 케이블과 절연이 파손된 홀더는 사용하지 않고 적정 규격으로 보수·교체한 뒤 사용합니다.",
    additionalEvidenceRefs: [
      {
        kind: "lesson_block",
        ref: "lesson-welding-safety-ppe#definition",
      },
      {
        kind: "lesson_block",
        ref: "lesson-welding-safety-ventilation#principle",
      },
    ],
    answerExplanation:
      "훼손된 케이블은 사용을 마친 뒤가 아니라 사용 전에 보수·교체해야 합니다. 손상된 절연을 그대로 두고 작업하면 충전부 접촉과 누전 위험이 커지므로 두 번째 보기가 틀렸습니다.",
    solutionSteps: [
      "문제가 틀린 안전사항을 묻는 부정형임을 확인합니다.",
      "각 조치가 위험 노출 전인지 후인지 시간 순서를 확인합니다.",
      "훼손 케이블을 사용한 뒤 보수하겠다는 두 번째 보기를 선택합니다.",
    ],
    keyRule:
      "케이블 절연 손상은 작업 후 정비 항목이 아니라 사용 전 제거해야 할 즉시 사용중지 조건입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "용접면·장갑·앞치마 등 보호장구는 아크광·열·불티와 잔여 감전위험으로부터 작업자를 보호합니다.",
        plausibleReason:
          "전격방지기가 있으면 개인보호구는 중복 대책이라고 생각할 수 있습니다.",
        incorrectPoint:
          "위험에 맞는 보호장구 착용은 올바른 용접 안전사항입니다.",
        keyRule:
          "공학적 방호를 적용한 뒤에도 남는 위험에는 적합한 개인보호구를 사용합니다.",
        differenceFromCorrect:
          "정답은 손상 케이블을 먼저 사용하지만 이 보기는 작업 전 신체 방호를 갖춥니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "훼손된 케이블을 작업에 사용한 뒤 보수하면 작업 중 노출도체와 누전 위험을 그대로 허용하게 됩니다.",
        plausibleReason:
          "케이블 보수는 정기점검 때 한꺼번에 해도 된다는 유지보수 관행으로 오해할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "절연 손상 케이블은 즉시 사용을 중지하고 보수·교체한 뒤 다시 사용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "도장 탱크 내부는 유해가스와 산소결핍 가능성이 있으므로 농도 확인과 충분한 환기 뒤 작업해야 합니다.",
        plausibleReason:
          "도장이 마른 탱크라면 환기가 불필요하다고 생각할 수 있습니다.",
        incorrectPoint:
          "충분한 환기를 선행하는 것은 밀폐공간 노출을 줄이는 올바른 조치입니다.",
        keyRule: "밀폐공간은 작업 전·중 농도 측정과 지속 환기를 시행합니다.",
        differenceFromCorrect:
          "정답은 손상 절연을 방치하지만 이 보기는 작업환경 위험을 먼저 줄입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "전격방지기가 설치된 용접기는 무부하전압을 낮춰 홀더 접촉 시 감전위험을 줄입니다.",
        plausibleReason:
          "장치를 설치해도 아크 중에는 전압이 있으므로 아무 효과가 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "전격방지기 사용은 무부하 감전위험을 줄이는 올바른 전기안전 조치입니다.",
        keyRule:
          "자동전격방지기는 용접하지 않을 때 출력측 무부하전압을 낮춥니다.",
        differenceFromCorrect:
          "정답은 손상 케이블을 허용하지만 이 보기는 설비의 감전 보호기능을 사용합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-5d3568c8-289a-43fc-93cb-338dc9615629",
    "231a26ffd4698778e4273917980c09192c9799382ddcadae83f51a254d2f6d6b",
    "definition",
    "direct_electrode_crack_resistance_hierarchy_and_target_lesson_content_missing",
  ),
  holdCandidate(
    "wcbt-5d49e479-72b3-4b50-b30a-b131f28270c9",
    "37db03c8f96856651d6e5c0c6fa6d7c93d07aecd8fcf4ffb62feb02a85f87e6a",
    "safety",
    "official_primary_oxygen_cylinder_color_rule_missing_for_green_identification",
  ),
  holdCandidate(
    "wcbt-5d760de1-faeb-4672-af3a-75cf31888745",
    "a2b30778132cb8c2ebc94e40d437520e3a370c88ef06a7248567d4ba34fd8150",
    "definition",
    "direct_tap_changer_current_range_and_no_load_voltage_assertion_missing_from_power_lesson",
  ),
  holdCandidate(
    "wcbt-5def7fc5-6966-47b2-b956-3c116bde71cb",
    "ed20e01595a4377872224ae4703845e5ca9009c52293f133bc62b6b9148b3f8e",
    "definition",
    "direct_ultrasonic_welding_thickness_range_assertion_missing_from_special_process_lesson",
  ),
] as const;

const APPROVED_REVIEW_IDS = new Set<string>();

const FORCED_HOLD_REASONS = new Map<string, string[]>([
  [
    "wcbt-532b89e8-28da-4a34-bafe-1d64cf7291b2",
    [
      "choice_distinction_incomplete: 밀폐공간의 자동전격방지기 적용은 직접 지지되지만 용접기 내부 접촉 금지까지 포함한 네 보기 전체를 현재 레슨·공식 근거가 같은 수준으로 구분하지 못함",
    ],
  ],
  [
    "wcbt-53df2750-fa2e-4fe5-8cbf-c30a6fe7aafc",
    [
      "choice_distinction_incomplete: 초음파시험이 비파괴검사라는 직접 근거는 있으나 굽힘·현미경조직·파면 시험을 파괴시험으로 각각 분류하는 레슨 근거가 연결되지 않음",
    ],
  ],
  [
    "wcbt-554378fb-1eac-4b69-90e3-067ab9c5faf9",
    [
      "official_source_partial: 자동전격방지장치의 감전방지 목적은 직접 확인되지만 헬멧·리미트 스위치·2차 권선장치의 기능을 동일 공식 근거에서 모두 대조하지 못함",
    ],
  ],
  [
    "wcbt-5b5e7db4-dcf6-4169-b73c-46e3ec7655eb",
    [
      "lesson_projection_mismatch: 직접 근거와 작성 검토는 보호구 레슨을 가리키지만 현재 공개 투영표는 전기안전 레슨을 가리켜 동일 레슨·블록 계약을 충족하지 못함",
    ],
  ],
  [
    "wcbt-5bbb16c3-8be6-495b-8820-491eb4b0fec6",
    [
      "choice_distinction_incomplete: 손상 케이블의 사용 전 보수는 직접 확인되지만 보호구·도장 탱크 환기·전격방지기까지 네 보기를 한 레슨 assertion과 검증 출처가 모두 구분하지 못함",
    ],
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_07 =
  WELDING_CBT_ANSWER_REVIEWS_PART_07_AUTHORED.map((entry) => {
    const forcedHoldReasons = FORCED_HOLD_REASONS.get(entry.canonicalId);
    if (forcedHoldReasons) {
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
        holdReasons: forcedHoldReasons,
        reviewer: REVIEWER,
        reviewedAt: REVIEWED_AT,
      };
    }
    if (
      APPROVED_REVIEW_IDS.has(entry.canonicalId)
      && entry.authoringDisposition === "publish_candidate"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        reviewer: REVIEWER,
        reviewedAt: REVIEWED_AT,
      };
    }
    return entry;
  });
