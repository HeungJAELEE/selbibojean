const AUTHOR = "welding-author-part03";
const AUTHORED_AT = "2026-08-02T15:22:04.000Z";
const REVIEWER = "welding-reviewer-part03";
const REVIEWED_AT = "2026-08-02T15:38:23.706Z";
const REMAINING_AUTHORED_AT = "2026-08-02T16:24:43.303Z";
const REMAINING_REVIEWER = "welding-reviewer-part03-remaining";
const REMAINING_REVIEWED_AT = "2026-08-02T16:32:18.435Z";

type AssessmentKind =
  | "calculation"
  | "definition"
  | "safety"
  | "identification"
  | "principle"
  | "application";

function holdCandidate(
  canonicalId: string,
  contentDigest: string,
  assessmentKind: AssessmentKind,
  holdReasons: string[],
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
    holdReasons,
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  };
}

function reviewedRemainingHoldCandidate(
  canonicalId: string,
  contentDigest: string,
  assessmentKind: AssessmentKind,
  holdReasons: string[],
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
    holdReasons,
    author: AUTHOR,
    authoredAt: REMAINING_AUTHORED_AT,
    reviewer: REMAINING_REVIEWER,
    reviewedAt: REMAINING_REVIEWED_AT,
  };
}

const WELDING_CBT_ANSWER_REVIEWS_PART_03_BASE = [
  holdCandidate(
    "wcbt-1e07655b-bf67-42c3-ad7b-a498471e4660",
    "d8b4dc0107b12a576425d7cc941561b0326bf2b22951c4949a01b43df714aefb",
    "identification",
    [
      "missing_direct_lesson_assertion: 기존 용접 기초 레슨에 터닝 롤러의 지지·회전 기능이 직접 서술되어 있지 않음",
    ],
  ),
  {
    canonicalId: "wcbt-1e33d37e-fada-4314-b5a8-696176e14297",
    contentDigest:
      "220b0338ee1a0b5088f6d6d31d1c7806b9c325e90d3fac29cd09363070a591fb",
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "pending" as const,
    assessmentKind: "safety" as const,
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "principle",
      assertionText:
        "교류 아크용접 작업자는 절연장갑을 착용하고 손상이 없는 절연형 용접봉 홀더를 사용합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: "lesson-welding-safety-electrical#principle",
        },
        {
          kind: "lesson_block" as const,
          ref: "lesson-welding-safety-electrical#source",
        },
        {
          kind: "official_source" as const,
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
        },
        {
          kind: "official_source" as const,
          ref: "https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024004607",
        },
        {
          kind: "source_question" as const,
          ref: "wcbt-1e33d37e-fada-4314-b5a8-696176e14297",
        },
      ],
    },
    answerExplanation:
      "안전홀더는 전류가 흐르는 용접봉을 절연된 손잡이로 고정해 작업자가 충전부에 직접 접촉할 가능성을 줄이는 장치입니다. 고무장갑을 대신하거나 가스·광선을 막는 장치가 아니므로, 사용 이유로 옳은 것은 3번 용접작업 중 전격예방입니다.",
    solutionSteps: [
      "안전홀더가 용접봉을 잡고 전류를 전달하는 전기회로 부품임을 확인합니다.",
      "절연 손잡이의 목적을 충전부 직접 접촉과 감전 위험의 감소로 연결합니다.",
      "호흡기·광선 보호가 아니라 전격예방을 나타낸 3번을 선택합니다.",
    ],
    keyRule:
      "손상이 없는 절연형 용접봉 홀더는 통전되는 용접봉과 작업자의 직접 접촉을 막아 전격 위험을 줄입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts" as const,
        rationale:
          "안전홀더는 용접봉을 절연해 잡는 전기 부품이며 손 전체를 덮는 절연장갑의 착용 기능을 대신하지 않습니다.",
        plausibleReason:
          "홀더 손잡이가 절연되어 있어 별도의 고무장갑이 필요 없다고 오해할 수 있습니다.",
        incorrectPoint:
          "절연홀더와 절연장갑은 서로 다른 접촉 경로를 줄이는 보완 조치이므로 대체 관계가 아닙니다.",
        keyRule:
          "절연 손잡이가 있어도 작업자는 손상이 없는 적합한 절연장갑을 함께 사용합니다.",
        differenceFromCorrect:
          "정답은 홀더 자체의 전격예방 기능이고 이 보기는 다른 보호구를 대신한다는 잘못된 주장입니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope" as const,
        rationale:
          "유해가스와 용접흄 중독은 국소배기·전체환기와 적합한 호흡보호구로 관리하는 호흡기 위험입니다.",
        plausibleReason:
          "안전홀더가 용접작업 안전장비라는 이유로 가스 위험도 줄인다고 넓게 생각할 수 있습니다.",
        incorrectPoint:
          "홀더의 절연구조는 전기적 접촉을 줄일 뿐 공기 중 가스나 흄을 제거하지 않습니다.",
        keyRule:
          "전격은 절연과 전원 통제로, 가스·흄은 환기와 호흡보호로 각각 관리합니다.",
        differenceFromCorrect:
          "정답은 전기적 접촉 위험을 다루고 이 보기는 흡입 노출이라는 별도 위험을 다룹니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports" as const,
        rationale:
          "절연형 안전홀더는 통전되는 용접봉을 고정하면서 작업자의 손이 충전부에 직접 닿는 것을 막아 전격 위험을 줄입니다.",
        plausibleReason:
          "용접봉과 손 사이의 절연 경로를 유지한다는 안전홀더의 구조와 목적이 정확히 연결됩니다.",
        incorrectPoint: null,
        keyRule:
          "용접봉 홀더의 손잡이와 충전부 사이 절연은 작업 중 전격예방을 위한 핵심 기능입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope" as const,
        rationale:
          "자외선과 적외선은 적정 차광번호의 용접면·차광필터와 주변 차광막으로 차단합니다.",
        plausibleReason:
          "홀더가 아크 발생에 관여하므로 아크광도 직접 막는 장치라고 혼동할 수 있습니다.",
        incorrectPoint:
          "홀더는 손의 전기적 접촉을 줄이지만 눈과 얼굴 앞에서 유해광선을 차폐하지 않습니다.",
        keyRule:
          "홀더는 전기 절연 장치이고 용접면과 차광막은 광선 차폐 장치입니다.",
        differenceFromCorrect:
          "정답은 홀더의 절연에 의한 전격예방이고 이 보기는 별도 차광보호구의 기능입니다.",
      },
    ],
    essentialRank: 1,
    essentialRationale:
      "절연 안전홀더의 역할을 용접봉 충전부 직접 접촉과 전격 예방으로 연결하는 핵심 안전 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-1e4d561b-49ba-48dc-9f67-966b16f968a2",
    "96f668b4f5dfddde7dfebb1bf9723b7ed05ba914c757bfa6e92d370b7a1e04a4",
    "principle",
    [
      "missing_direct_lesson_assertion: 압력조정나사를 오른쪽으로 돌릴 때 조정밸브가 열리는 구조가 레슨에 직접 서술되어 있지 않음",
    ],
  ),
  holdCandidate(
    "wcbt-1e842d89-059c-4a18-b9bd-9e1e7ea1e038",
    "d119bf3e497d2853740a425ceec4aaebeaa9e3cf544a56a986d424562ee67612",
    "safety",
    [
      "safety_official_source_missing: 이산화탄소 15% 위험 기준의 적용 범위와 시점을 확인할 공식 근거가 연결되지 않음",
      "missing_direct_numeric_evidence: 기존 환기 레슨에 15% 수치 기준이 없음",
    ],
  ),
  {
    canonicalId: "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
    contentDigest:
      "3f8d193fd093b4492ed20f25753af56ad24b8144f7606ef527166d23b36d5c18",
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind: "identification" as const,
    primaryLeafLessonId: "lesson-welding-inspection-ndt",
    conceptBinding: {
      lessonId: "lesson-welding-inspection-ndt",
      lessonBlockId: "definition",
      assertionText:
        "비파괴검사는 제품을 사용 불가능하게 파괴하지 않고 결함 또는 재료 상태를 확인합니다. 육안검사(VT), 침투탐상(PT), 자분탐상(MT), 방사선투과(RT), 초음파탐상(UT) 등이 대표적이며 적용 범위가 서로 다릅니다.",
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: "lesson-welding-inspection-ndt#definition",
        },
        {
          kind: "source_question" as const,
          ref: "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
        },
        {
          kind: "official_source" as const,
          ref: "src/data/source/notion-theory.md:2664-2684",
        },
      ],
    },
    answerExplanation:
      "비파괴검사 약호는 PT가 침투탐상검사, MT가 자분탐상검사, RT가 방사선투과검사, UT가 초음파탐상검사입니다. 따라서 약호와 명칭이 모두 일치하는 보기는 PT : 침투 탐상검사입니다.",
    solutionSteps: [
      "각 보기의 영문 약호를 PT·MT·RT·UT의 표준 검사명과 하나씩 대조합니다.",
      "약호와 검사명이 모두 일치한 PT : 침투 탐상검사를 선택합니다.",
    ],
    keyRule:
      "PT=침투, MT=자분, RT=방사선투과, UT=초음파탐상으로 약호와 검사명을 짝지어 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with" as const,
        rationale:
          "MT는 Magnetic Particle Testing의 약호로 자분탐상검사이며 방사선투과검사가 아닙니다.",
        plausibleReason:
          "M을 투과 매체를 뜻하는 글자로 잘못 연결하면 방사선 검사처럼 보일 수 있습니다.",
        incorrectPoint:
          "방사선투과검사의 약호는 RT이고 MT의 검사명이 서로 바뀌었습니다.",
        keyRule:
          "MT는 강자성체의 누설자속에 자분이 모이는 현상을 이용하는 자분탐상검사입니다.",
        differenceFromCorrect:
          "정답 PT는 침투액을 쓰는 침투탐상이고, MT는 자분을 쓰는 별개의 표면검사입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports" as const,
        rationale:
          "PT는 Penetrant Testing의 약호이며 표면에 열린 결함으로 침투액이 들어가는 침투탐상검사입니다.",
        plausibleReason:
          "약호의 P와 침투액을 뜻하는 penetrant를 연결하면 정확히 식별할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "PT는 비다공성 재료의 표면개구 결함을 침투액으로 찾는 침투탐상검사입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "confused_with" as const,
        rationale:
          "RT는 Radiographic Testing의 약호로 방사선투과검사이며 초음파탐상검사가 아닙니다.",
        plausibleReason:
          "RT와 UT가 모두 내부 결함 검사에 쓰여 두 약호를 서로 바꾸기 쉽습니다.",
        incorrectPoint:
          "초음파탐상검사의 약호는 UT이므로 RT에 초음파 명칭을 붙인 것이 틀렸습니다.",
        keyRule:
          "RT는 방사선 투과량 차이를 영상으로 기록하는 방사선투과검사입니다.",
        differenceFromCorrect:
          "정답 PT는 표면개구 결함 검사이고 RT는 방사선을 이용한 내부결함 검사입니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with" as const,
        rationale:
          "UT는 Ultrasonic Testing의 약호로 초음파탐상검사이며 와전류탐상검사가 아닙니다.",
        plausibleReason:
          "와전류탐상도 전자기적 비파괴검사라 약호를 UT와 혼동할 수 있습니다.",
        incorrectPoint:
          "와전류탐상검사는 일반적으로 ET로 나타내므로 UT와 검사명이 일치하지 않습니다.",
        keyRule: "UT는 초음파의 반사 신호를 분석하는 초음파탐상검사입니다.",
        differenceFromCorrect:
          "정답 PT는 침투액을 이용하지만 UT는 초음파를 이용하는 검사입니다.",
      },
    ],
    essentialRank: 4,
    essentialRationale:
      "PT·MT·RT·UT 약호와 검사명을 한 번에 구분하는 기본 판별 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-1f32e582-dcf1-4574-8d41-2ba612073a2d",
    "1a6b7e9670b0c74db656470ffe1abf74aeeddae75365cc121dcb4544f145d547",
    "calculation",
    [
      "answer_conflict_reported_in_source: 원문 자체에 오류 신고 안내가 있어 복원 정답을 계산 근거 없이 확정할 수 없음",
      "missing_calculation_derivation: 아세톤 흡수량과 용기 조건을 연결하는 직접 계산 근거가 레슨에 없음",
    ],
  ),
  holdCandidate(
    "wcbt-201159be-260a-4bd1-8d38-f033af276199",
    "ed315e42255b6b2aea88ba6702eb0ab1debd451f5e9f8f8916f0b472e60ee43e",
    "safety",
    [
      "safety_official_source_missing: 이산화탄소 15% 위험 기준의 공식 적용 근거가 연결되지 않음",
      "missing_direct_numeric_evidence: 기존 환기 레슨에 해당 농도 기준이 없음",
    ],
  ),
  holdCandidate(
    "wcbt-202c7319-13da-42f0-b9bf-a591436aca53",
    "d16ff8e32d179a0130290c12a7357728086491e725bc8de39b6c30ee08be4b7f",
    "safety",
    [
      "safety_official_source_missing: 용접기 내부 점검·청소의 안전 절차를 확인할 공식 근거가 연결되지 않음",
      "answer_requires_condition_scope: 전원 차단 여부가 보기 문장에 없어 무조건 부적합으로 단정하기 어려움",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-202ca0c3-bc7f-4218-bcce-e05518174611",
    "97711e57841b808281a9500f664a20f9ca4ab28dbff24ccdea5c38e6cadd0947",
    "application",
    [
      "missing_direct_lesson_assertion: 가스용접 용제가 산화물을 용해하고 융점이 모재보다 낮아야 한다는 직접 설명이 현재 가스용접 레슨에 없음",
      "choice_specific_evidence_missing: 용제의 형태·융점·연강 적용 여부를 네 보기별로 판정할 근거가 연결되지 않음",
    ],
  ),
  {
    canonicalId: "wcbt-20d47670-da3a-4ad0-927c-a4c61dc64684",
    contentDigest:
      "7958b42e129f2b6ce6b3d351671bedeef61b6386092f1c63b1e9c9c7b5354451",
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "pending" as const,
    assessmentKind: "safety" as const,
    primaryLeafLessonId: "lesson-welding-safety-ppe",
    conceptBinding: {
      lessonId: "lesson-welding-safety-ppe",
      lessonBlockId: "structure",
      assertionText:
        "차광막은 용접 작업자 개인보호구가 아니라 아크광이 주변 작업자에게 노출되는 것을 막는 방호설비입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: "lesson-welding-safety-ppe#structure",
        },
        {
          kind: "lesson_block" as const,
          ref: "lesson-welding-safety-ppe#source",
        },
        {
          kind: "official_source" as const,
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
        },
        {
          kind: "source_question" as const,
          ref: "wcbt-20d47670-da3a-4ad0-927c-a4c61dc64684",
        },
      ],
    },
    answerExplanation:
      "노천을 포함한 공동 용접작업에서는 아크의 유해광선이 다른 사람에게 직접 닿지 않도록 작업자 사이에 차광막을 설치합니다. 경계통로는 이동 구역, 환기장치는 공기 교환, 집진장치는 흄·분진 포집용이므로 광선을 차폐하는 1번 차광막이 정답입니다.",
    solutionSteps: [
      "문제가 다른 사람의 ‘유해광선’ 피해를 막는 설치물을 묻는지 확인합니다.",
      "통로·환기·집진은 각각 이동과 공기 오염을 관리하고 광선을 직접 가리지 못함을 구분합니다.",
      "용접 아크와 주변 사람 사이를 물리적으로 차폐하는 차광막을 선택합니다.",
    ],
    keyRule:
      "여러 사람이 용접할 때 주변 작업자의 유해광선 노출은 작업자 사이에 설치한 차광막으로 차단합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports" as const,
        rationale:
          "차광막은 아크와 주변 사람 사이에 설치되어 자외선·적외선과 강한 가시광선의 직접 노출 경로를 차폐합니다.",
        plausibleReason:
          "지문의 공동 작업, 다른 사람, 유해광선, 설치라는 조건이 차광막의 용도와 모두 일치합니다.",
        incorrectPoint: null,
        keyRule:
          "개인 용접면 밖의 사람을 아크광에서 보호하려면 작업 구역에 차광막을 설치합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope" as const,
        rationale:
          "경계통로는 보행자와 장비의 이동 공간을 구분해 충돌과 무단 접근을 줄이는 구역 관리 수단입니다.",
        plausibleReason:
          "사람 사이에 경계를 둔다는 공통점 때문에 광선 차폐 기능도 있다고 오해할 수 있습니다.",
        incorrectPoint:
          "통로 표시만으로는 노천 작업에서 직선으로 퍼지는 아크광을 가릴 수 없습니다.",
        keyRule:
          "통행 경계는 접근을 관리하고 불투명한 차광막은 빛의 전달 경로를 차단합니다.",
        differenceFromCorrect:
          "경계통로는 이동 동선을 분리하지만 차광막은 용접 아크와 사람 사이의 시야를 가립니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope" as const,
        rationale:
          "환기장치는 오염된 공기를 배출하고 신선한 공기를 공급해 흄과 가스의 흡입 농도를 낮춥니다.",
        plausibleReason:
          "용접 작업자의 대표적인 공학적 방호라서 모든 유해요인에 효과가 있다고 생각할 수 있습니다.",
        incorrectPoint:
          "공기 교환은 복사되는 자외선·적외선을 흡수하거나 가리는 차폐면을 만들지 않습니다.",
        keyRule: "환기는 흡입 노출을 낮추고 차광막은 광선 노출을 막습니다.",
        differenceFromCorrect:
          "환기장치는 공기의 흐름을 바꾸지만 차광막은 유해광선이 지나가는 시선을 차단합니다.",
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope" as const,
        rationale:
          "집진장치는 발생한 용접흄과 분진을 흡입·포집해 공기 중 입자 농도를 낮추는 설비입니다.",
        plausibleReason:
          "다른 작업자의 노출을 줄이는 장치라는 넓은 의미만 보면 차광막과 혼동할 수 있습니다.",
        incorrectPoint:
          "흄을 포집해도 아크에서 방출되는 광선은 그대로 전달되므로 지문의 피해를 직접 막지 못합니다.",
        keyRule:
          "집진의 대상은 입자상 물질이고 차광의 대상은 아크의 유해광선입니다.",
        differenceFromCorrect:
          "집진장치는 공기 중 흄을 제거하고 차광막은 주변 사람에게 향하는 빛을 가립니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: REMAINING_AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  reviewedRemainingHoldCandidate(
    "wcbt-20fb4989-b844-44bb-b0a5-36ce895c7c88",
    "a6a1250757bea0165c8857c140f25394a59fddb9a8e742206c451ba7475c1ebc",
    "safety",
    [
      "safety_official_source_missing: 아세틸렌과 구리·압력·산소의 폭발 위험 및 아세톤의 용해용제 역할을 대조할 공식 근거가 연결되지 않음",
      "missing_direct_lesson_assertion: 현재 화재안전 레슨에 아세틸렌의 물질별 반응과 아세톤의 역할이 직접 서술되어 있지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-21b9a47c-5a3c-4f43-8c77-35f063233fc6",
    "215ea0373abc734d3aafabe55262cba242bff050aa06aa6ecf17849c0eb88e29",
    "application",
    [
      "missing_direct_lesson_assertion: 프로젝션용접의 작업능률·외관·전극수명·제품 신뢰도를 비교하는 직접 문장이 현재 저항용접 레슨에 없음",
      "answer_scope_exceeds_bound_concept: 돌기로 전류와 압력을 집중한다는 원리만으로 네 품질·생산성 보기를 확정할 수 없음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-21c03b1e-efc8-4451-beb0-281436267893",
    "8cd6c341ea8a9a79c68a1c0a6485be99a6050b2591996b2fde05fe249d34d8c9",
    "identification",
    [
      "missing_direct_numeric_evidence: AW 300 교류 아크용접기의 2차 전류 조정범위 60~330A가 현재 전원 레슨에 없음",
      "manufacturer_or_standard_source_missing: 기종 명칭과 정격범위를 확인할 제조사 또는 규격 근거가 연결되지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-2393580f-61a7-428f-a6ed-e14bc97251ed",
    "7d8f4e7ef74fe123aa6c182322649fe921d8e2edf30e967d505912c703a2d724",
    "principle",
    [
      "missing_direct_lesson_assertion: 마찰용접의 용접시간·치수정밀도·변형·열영향부·이종재 접합성을 보기별로 비교하는 직접 설명이 없음",
      "answer_scope_exceeds_bound_concept: 마찰열과 축방향 압력을 이용한다는 원리만으로 특징의 옳고 그름을 모두 확정할 수 없음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-23f24ea7-7a99-4ec5-9703-062408900936",
    "0b4effee9168ec2bd04e4eb95952110685131fb6454c0ba0cf33eb1ff3ecb13c",
    "safety",
    [
      "safety_official_source_missing: 산소·아세틸렌 용기의 보관온도·운반·동결해소·누설검사 조건을 확인할 공식 근거가 연결되지 않음",
      "mixed_choice_conditions_unverified: 정답 보기는 현재 레슨과 방향은 일치하지만 다른 보기의 구체 온도조건까지 검증되지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-24e8b1eb-ca30-463b-b6e8-ec7843f5a94e",
    "aa22ce0df8cecb69d3c471b8ece8988410a8309d47fa4553c620307719d47fe1",
    "safety",
    [
      "safety_official_source_missing: 150A 이상 300A 미만 작업의 차광도 번호 10~12를 확인할 공식 보호구 기준 URL이 연결되지 않음",
      "missing_direct_numeric_evidence: 현재 보호구 레슨은 전류별 차광도 선택 원칙만 있고 해당 수치표가 없음",
    ],
  ),
  {
    canonicalId: "wcbt-25599af8-aa0e-47e3-9b8b-51dc27f60bc8",
    contentDigest:
      "bcf627336ba438f84c6cea2a97652587ade6d9744b2f9d6fdcbda2c0b1d0aebe",
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind: "principle" as const,
    primaryLeafLessonId: "lesson-welding-foundation-power-heat",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-power-heat",
      lessonBlockId: "summary",
      assertionText: "입열은 전압과 전류에 비례하고 용접속도에 반비례합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: "lesson-welding-foundation-power-heat#summary",
        },
        {
          kind: "source_question" as const,
          ref: "wcbt-25599af8-aa0e-47e3-9b8b-51dc27f60bc8",
        },
      ],
    },
    answerExplanation:
      "‘용접 입열과 관련된 설명’에서 입열은 전압과 전류에 비례하고 용접 속도에 반비례하므로, 정답은 ‘용접 속도가 빠르면 용접 입열은 감소한다.’인 4번입니다.",
    solutionSteps: [
      "입열의 방향 관계를 전압·전류에는 비례, 용접속도에는 반비례로 정리합니다.",
      "각 보기를 이 관계에 대입하면 속도가 빨라질수록 입열이 감소한다는 4번만 일치합니다.",
    ],
    keyRule:
      "다른 조건이 같다면 전압·전류가 커질수록 입열은 증가하고, 용접속도가 빨라질수록 단위 길이 입열은 감소합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts" as const,
        rationale:
          "아크 전류가 커지면 공급 전력이 커지는 방향이므로 다른 조건이 같을 때 용접 입열은 증가합니다.",
        plausibleReason:
          "전류 증가가 용접속도 증가와 함께 일어나는 현장 상황을 한 변수의 직접 관계로 혼동할 수 있습니다.",
        incorrectPoint: "전류와 입열의 비례관계를 감소로 뒤집었습니다.",
        keyRule: "입열은 전압과 전류에 비례하고 용접속도에 반비례합니다.",
        differenceFromCorrect:
          "정답은 속도 증가의 반비례 효과를 말하지만 이 보기는 전류 증가의 비례 효과를 반대로 설명합니다.",
      },
      {
        choiceIndex: 1,
        relation: "contradicts" as const,
        rationale:
          "입열이 증가하면 모재에 전달되는 열이 줄어드는 것이 아니라 증가하는 방향이며, 과도한 입열은 변형과 조직 변화의 원인이 될 수 있습니다.",
        plausibleReason:
          "입열이 지나치면 품질이 나빠질 수 있다는 사실을 모재가 아예 녹지 않는다는 뜻으로 과장하기 쉽습니다.",
        incorrectPoint:
          "과대 입열의 품질 문제를 용융 자체가 일어나지 않는 현상으로 잘못 바꾸었습니다.",
        keyRule:
          "입열 증가는 모재에 공급되는 단위 길이당 열에너지의 증가를 뜻합니다.",
        differenceFromCorrect:
          "정답은 속도와 입열의 방향관계를 정확히 설명하지만 이 보기는 입열의 물리적 의미를 반대로 서술합니다.",
      },
      {
        choiceIndex: 2,
        relation: "missing_condition" as const,
        rationale:
          "모재에 실제 흡수되는 열의 비율은 공정과 열효율 조건을 함께 봐야 하며 모든 용접에서 약 10%라고 고정할 수 없습니다.",
        plausibleReason:
          "입열 계산에서 효율계수를 적용한다는 사실 때문에 하나의 고정 백분율이 있는 것처럼 보일 수 있습니다.",
        incorrectPoint:
          "공정별 열효율과 주어진 조건 없이 흡수열을 10%로 단정했습니다.",
        keyRule:
          "열효율은 공정과 조건에 따라 적용하며 문제에서 주어지지 않은 고정값을 임의로 사용하지 않습니다.",
        differenceFromCorrect:
          "정답은 조건이 같을 때 성립하는 속도의 반비례 관계이고, 이 보기는 근거 없는 고정 효율을 제시합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports" as const,
        rationale:
          "용접속도가 빨라지면 단위 길이를 통과하는 시간이 짧아져 다른 조건이 같을 때 단위 길이당 입열이 감소합니다.",
        plausibleReason:
          "입열식에서 용접속도가 분모에 놓인다는 관계를 기억하면 바로 판단할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "입열은 용접속도에 반비례하므로 속도가 증가하면 입열은 감소합니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: 3,
    essentialRationale:
      "입열이 전압·전류에 비례하고 속도에 반비례한다는 핵심 규칙을 직접 묻습니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: REMAINING_AUTHORED_AT,
    reviewer: REMAINING_REVIEWER,
    reviewedAt: REMAINING_REVIEWED_AT,
  },
  reviewedRemainingHoldCandidate(
    "wcbt-25851d65-116c-47bf-8163-92f85ee758c9",
    "045898ce7ed7c1cf7e5d3a26b10df1b9146c1a64f0200401ac05c757441d0b91",
    "safety",
    [
      "safety_official_source_missing: 아세틸렌 용기의 내압시험압력 기준을 확인할 공식 고압가스 기준 URL이 연결되지 않음",
      "missing_direct_numeric_evidence: 현재 가스안전 레슨에 15℃·15kgf/cm²와 3배 기준이 없음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-25867beb-2201-4b4f-9cc6-61568ba0c04d",
    "98d5c19173c13cb0dff360f712c6c58db9773cedee77a6aa5597312a94beb02c",
    "safety",
    [
      "safety_official_source_missing: 가스호스 결빙·이음·내부청소 방법을 확인할 공식 취급기준 URL이 연결되지 않음",
      "missing_direct_lesson_assertion: 현재 가스안전 레슨에 고압 수소를 이용한 호스 청소 금지와 보기별 취급법이 직접 서술되어 있지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-25a3805f-8958-4063-92fb-6174146b9eda",
    "2f6586a724b4bdf599c3bc83c5e868600226c22c10cbf8226706110e30e747ab",
    "identification",
    [
      "missing_direct_lesson_assertion: 석회석·규산칼륨·산화티탄의 아크 안정 작용과 니크롬선의 비해당성을 비교하는 직접 설명이 없음",
      "choice_specific_evidence_missing: 피복 배합제의 성분별 기능표가 현재 용접봉 레슨에 연결되지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-25ffa5ee-c042-41e6-a6be-b9be023a448b",
    "beec57f22ab1099b48b0a29858070819d22608be789e0ea0e624acc4b18afd3d",
    "principle",
    [
      "missing_direct_lesson_assertion: 교류·직류 용접기의 구조 복잡도·전격위험·역률·무부하전압을 항목별로 비교하는 직접 설명이 없음",
      "answer_scope_exceeds_bound_concept: 현재 레슨의 교류·직류 일반 특성만으로 역률 보기의 오류를 확정할 수 없음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-2755f539-00e8-4a13-9690-fa53051f10c1",
    "a020aff6e31b1b7cef3def1ddfcc6c132da5c744b0f107b4b2a36ff326dab43a",
    "identification",
    [
      "missing_direct_numeric_evidence: 수소·메탄·아세틸렌·프로판의 산소불꽃 온도 비교표가 현재 가스용접 레슨에 없음",
      "choice_specific_evidence_missing: 메탄이 가장 낮다는 복원 정답을 네 연료가스의 온도로 대조할 근거가 연결되지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-280eb4b6-07e0-4368-b378-3b822a3458ca",
    "2d26d45bb8f40d0c9505dcabe63e5e5e3bf792cf030549009070b570a401483b",
    "safety",
    [
      "safety_official_source_missing: 안전보건관리책임자 선임 대상 인원 기준의 적용 법령·업종·기준시점을 확인할 공식 URL이 연결되지 않음",
      "time_sensitive_legal_threshold: 2012년 복원 문항의 100명 기준을 현재 일반 기준처럼 공개할 수 없음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-28eb12d3-6637-403e-abf1-559000b17934",
    "f107bba71c79dc8b227d76a5d9c718d2b40ac6cf280eac1ab58f29bd35460e18",
    "application",
    [
      "missing_direct_formula_evidence: 판두께 10mm에서 가스용접봉 지름 6.0mm를 선택하는 경험식 또는 선정표가 현재 레슨에 없음",
      "choice_specific_evidence_missing: 1.0·2.4·3.2·6.0mm 보기를 판두께와 대조할 직접 근거가 연결되지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-2923b324-12e7-4dca-85ff-d92bee9ea3d6",
    "3b1398023f25a430d0c395d04bd6ba8b534d970a4f1d947c377a3909302db6ef",
    "safety",
    [
      "safety_official_source_missing: 자동전격방지기의 2차 무부하전압 20~30V 이하 기준을 확인할 공식 안전기준 URL이 연결되지 않음",
      "missing_direct_numeric_evidence: 현재 전기안전 레슨은 무부하전압 저감 목적만 설명하고 구체 전압범위는 제시하지 않음",
    ],
  ),
  reviewedRemainingHoldCandidate(
    "wcbt-2a04d461-5398-4093-b028-3c7f8bd0c456",
    "73f99088c7db0005a4672daecbdc4bcbb6423731bb67c88417f6e7b036a192c3",
    "safety",
    [
      "lesson_target_missing: 투영된 lesson-1ctkzud에 실제 레슨 블록이 없어 안전색 개념을 직접 연결할 수 없음",
      "safety_official_source_missing: 금지·화재안전 표지의 빨강색 의미를 확인할 현행 KS 또는 정부 공식 URL이 연결되지 않음",
    ],
  ),
  {
    canonicalId: "wcbt-2a6eb622-806f-48d7-b05d-4f1df2d9c0a4",
    contentDigest:
      "6651c6a9e1513065f7831540740dd07b6d6cff189d1fdc29f8c3d79249dced4f",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "exam-point",
      assertionText:
        "용기 각인의 W는 용기 질량, FP는 최고충전압력, TP는 내압시험압력을 뜻합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-gas#exam-point",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-2a6eb622-806f-48d7-b05d-4f1df2d9c0a4",
        },
      ],
    },
    answerExplanation:
      "지문은 산소용기 각인 중 용기중량을 나타내는 기호를 묻습니다. 레슨은 W를 용기 질량, FP를 최고충전압력, TP를 내압시험압력으로 직접 구분하므로 정답은 W입니다. V·FP·TP는 W가 아니므로 용기중량 기호가 될 수 없습니다.",
    solutionSteps: [
      "지문의 판별 대상인 ‘용기중량’을 레슨의 각인 뜻과 대조합니다.",
      "용기 질량에 직접 대응하는 W를 선택하고 압력 기호인 FP·TP와 나머지 V를 제외합니다.",
    ],
    keyRule:
      "용기 각인에서 W는 용기 질량, FP는 최고충전압력, TP는 내압시험압력을 뜻합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "선택지 ‘V’는 레슨에서 용기 질량에 대응한다고 명시된 W가 아니므로 용기중량 기호로 선택할 수 없습니다.",
        plausibleReason:
          "V가 용기의 물리량을 나타내는 기호처럼 보여 중량 표시와 혼동할 수 있습니다.",
        incorrectPoint: "용기중량을 나타내는 직접 기호는 V가 아니라 W입니다.",
        keyRule: "중량·질량을 묻는 문항에서는 W를 먼저 대응시킵니다.",
        differenceFromCorrect:
          "정답 W는 레슨에서 용기 질량으로 직접 정의되지만 V에는 그 정의가 없습니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "선택지 ‘W’는 레슨에서 용기 질량을 뜻한다고 직접 정의한 각인이므로 지문의 용기중량과 일치합니다.",
        plausibleReason:
          "W를 weight와 연결하면 용기중량 기호를 정확히 기억할 수 있습니다.",
        incorrectPoint: null,
        keyRule: "W는 용기 자체의 질량을 나타내는 각인입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "선택지 ‘FP’는 최고충전압력을 뜻하는 각인이므로 용기중량과 다른 물리량입니다.",
        plausibleReason:
          "용기에 함께 찍힌 관리 기호라서 중량 표기와 혼동할 수 있습니다.",
        incorrectPoint: "FP는 질량이 아니라 최고충전압력을 나타냅니다.",
        keyRule: "FP는 최고충전압력, W는 용기 질량으로 구분합니다.",
        differenceFromCorrect: "정답 W는 질량 기호이고 FP는 압력 기호입니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "선택지 ‘TP’는 내압시험압력을 뜻하므로 용기중량을 나타내지 않습니다.",
        plausibleReason:
          "용기의 시험 정보라는 점 때문에 기본 용기정보인 중량과 섞어 외울 수 있습니다.",
        incorrectPoint: "TP는 질량이 아니라 내압시험압력 표시입니다.",
        keyRule: "TP는 내압시험압력, W는 용기 질량으로 구분합니다.",
        differenceFromCorrect:
          "정답 W는 용기 자체의 질량이고 TP는 용기의 압력시험 기준입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-gas-evidence-promoter-part-03",
    authoredAt: "2026-08-03T03:00:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  reviewedRemainingHoldCandidate(
    "wcbt-2ad10a34-960a-4b6a-ac16-6a2dce691492",
    "6d32db40d668b4f97e3c1b95b1504ce7f84dd99dc5a6345a09dec8178ce2be65",
    "identification",
    [
      "missing_direct_lesson_assertion: 가변저항 조정과 원격제어가 가포화 리액터형의 특징이라는 직접 설명이 현재 전원 레슨에 없음",
      "choice_specific_evidence_missing: 탭전환형·가동코일형·가동철심형·가포화리액터형의 전류조정 방식을 비교하는 근거가 연결되지 않음",
    ],
  ),
] as const;

const FINAL_REVIEWER = "codex-welding-reviewer-final-parts01-05";
const FINAL_REVIEWED_AT = "2026-08-03T04:30:00.000Z";

export const WELDING_CBT_ANSWER_REVIEWS_PART_03 =
  WELDING_CBT_ANSWER_REVIEWS_PART_03_BASE.map((entry) => {
    if (entry.canonicalId === "wcbt-25867beb-2201-4b4f-9cc6-61568ba0c04d") {
      return {
        ...entry,
        authoringDisposition: "publish_candidate" as const,
        reviewStatus: "pending" as const,
        primaryLeafLessonId: "lesson-welding-safety-gas",
        conceptBinding: {
          lessonId: "lesson-welding-safety-gas",
          lessonBlockId: "source",
          assertionText:
            "문제와 보기는 CBTBank에 남아 있는 과거 공개 시험의 원문 복원·대조 자료를 의미 변경 없이 사용합니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-gas#source",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=273603",
            },
            { kind: "source_question" as const, ref: entry.canonicalId },
          ],
        },
        answerExplanation:
          "가스도관(호스) 취급에서 틀린 보기는 ‘호스의 내부 청소는 고압 수소를 사용할 것’입니다. KOSHA 안내서는 호스 연결부를 전용 조임기구로 체결하고 처음 쓰는 호스의 이물질을 제거하도록 안내합니다. 수소처럼 인화성 가스를 고압으로 흘려 청소하는 행동은 안전한 호스 청소 방법이 아니라 점화원을 추가하는 위험한 주장입니다.",
        solutionSteps: [
          "문항이 ‘틀린 것’을 묻는지 확인합니다.",
          "KOSHA 안내의 전용 밴드 체결과 최초 사용 전 이물질 제거를 기준으로 봅니다.",
          "인화성 수소를 고압으로 쓰라는 4번을 배제합니다.",
        ],
        keyRule:
          "가스호스는 전용 밴드로 체결하고, 최초 사용 전 이물질은 안전한 방법으로 제거하며 인화성 가스를 고압 청소용으로 사용하지 않습니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale:
              "충격은 고무호스의 손상과 누설 가능성을 키우므로 피해야 합니다.",
            plausibleReason:
              "고무가 유연해 충격을 견딜 것처럼 보일 수 있습니다.",
            incorrectPoint:
              "충격 금지는 안전한 취급 원칙이므로 틀린 보기가 아닙니다.",
            keyRule: "호스는 눌림·충격·마모를 막아 건전성을 유지합니다.",
            differenceFromCorrect:
              "1번은 손상을 예방하지만 4번은 인화성 가스를 청소에 사용합니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale:
              "연결부의 전용 밴드는 가스 누설을 막는 공식 안내와 일치합니다.",
            plausibleReason:
              "단순 부품처럼 보여 체결 방식이 중요하지 않다고 오해할 수 있습니다.",
            incorrectPoint:
              "밴드 사용은 잘못된 연결이 아니라 누설 방지 조치입니다.",
            keyRule: "호스 연결부는 전용 조임기구로 고정합니다.",
            differenceFromCorrect:
              "2번은 연결부 누설을 줄이고 4번은 새로운 화재 위험을 만듭니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale:
              "냉각된 호스는 유연성이 낮아지므로 열로 녹이는 방식은 결빙 상태를 풀려는 취급 조치입니다.",
            plausibleReason:
              "열을 가하면 호스가 상할 수 있다는 점만 떠올릴 수 있습니다.",
            incorrectPoint:
              "문항의 오답은 청소용 수소 사용이며, 이 보기는 그 주장과 다릅니다.",
            keyRule:
              "호스는 손상 없이 유연성과 기밀성을 유지하도록 취급합니다.",
            differenceFromCorrect:
              "3번은 결빙 대응이고 4번은 인화성 가스 사용입니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale:
              "고압 수소는 인화성 가스이므로 호스 내부 청소에 쓰면 누설·점화 위험을 키웁니다.",
            plausibleReason:
              "고압 가스가 이물질을 잘 날릴 것처럼 보일 수 있습니다.",
            incorrectPoint: null,
            keyRule: "인화성 가스를 청소용 고압 분사에 사용하지 않습니다.",
            differenceFromCorrect: null,
          },
        ],
        holdReasons: [],
        author: "codex-safety-author-part03",
        authoredAt: "2026-08-03T08:00:00.000Z",
        reviewer: null,
        reviewedAt: null,
      };
    }
    if (entry.canonicalId === "wcbt-1e33d37e-fada-4314-b5a8-696176e14297") {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "절연형 용접봉 홀더는 통전되는 용접봉을 절연 손잡이로 고정해 전격을 예방하며, 절연장갑을 대신하지 않고 유해가스용 환기장치나 자외선·적외선용 눈·얼굴 보호구의 역할도 하지 않습니다.",
        },
        holdReasons: [],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    if (entry.canonicalId === "wcbt-20d47670-da3a-4ad0-927c-a4c61dc64684") {
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
    if (entry.canonicalId === "wcbt-25599af8-aa0e-47e3-9b8b-51dc27f60bc8") {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          lessonBlockId: "principle",
          assertionText:
            "따라서 다른 조건이 같을 때 전류 증가는 입열을 늘리고 속도 증가는 입열을 줄이며, 입열 증가는 모재에 공급되는 열에너지 증가이지 모재가 녹지 않는다는 뜻이 아닙니다. 모재에 흡수되는 열의 비율은 공정별 열효율 η에 따라 달라지므로 모든 용접에서 10%로 고정하지 않습니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-foundation-power-heat#principle",
            },
            {
              kind: "source_question" as const,
              ref: "wcbt-25599af8-aa0e-47e3-9b8b-51dc27f60bc8",
            },
          ],
        },
        holdReasons: [],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (entry.canonicalId === "wcbt-2a6eb622-806f-48d7-b05d-4f1df2d9c0a4") {
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
          "official_marking_locator_incomplete: W·FP·TP 뜻을 뒷받침하는 KOSHA 자료는 확인했지만 V를 포함한 네 보기 전체와 정확한 페이지 위치를 직접 대조하지 못해 공개하지 않습니다.",
        ],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    return entry;
  });
