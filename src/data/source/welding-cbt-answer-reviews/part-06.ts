const AUTHOR = "codex-welding-author-part-06";
const AUTHORED_AT = "2026-08-03T01:00:00.000Z";
const REVIEWER = "codex-welding-reviewer-part-06";
const REVIEWED_AT = "2026-08-03T03:00:00.000Z";
const KOSHA_WELDING_GUIDE =
  "https://oshri.kosha.or.kr/kosha/data/business/occuHealthBusinessData.do?articleNo=423772&attachNo=239316&mode=download";
const KOSHA_ELECTRICAL_WELDING_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s";
const KOSHA_VOLTAGE_REDUCTION_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s";
const KOSHA_ELECTRIC_SHOCK_RESCUE_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=531&callmode=normal&catimage=&eclang=ko&start=216&um=s";
const KOSHA_WELDING_SAFETY_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s";
const OCCUPATIONAL_SAFETY_AND_HEALTH_STANDARDS_RULES =
  "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=273603";

type AssessmentKind =
  | "calculation"
  | "definition"
  | "safety"
  | "identification"
  | "principle"
  | "application";

type ChoiceFeedback = {
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
};

function publishCandidate(input: {
  canonicalId: string;
  contentDigest: string;
  assessmentKind: AssessmentKind;
  lessonBlockId: string;
  assertionText: string;
  answerExplanation: string;
  solutionSteps: string[];
  keyRule: string;
  choiceFeedback: ChoiceFeedback[];
  lessonId?: "lesson-welding-safety-gas" | "lesson-welding-safety-electrical";
  officialSourceRefs?: string[];
}) {
  const lessonId = input.lessonId ?? "lesson-welding-safety-gas";
  const officialSourceRefs = input.officialSourceRefs ?? [KOSHA_WELDING_GUIDE];
  return {
    canonicalId: input.canonicalId,
    contentDigest: input.contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "pending" as const,
    assessmentKind: input.assessmentKind,
    primaryLeafLessonId: lessonId,
    conceptBinding: {
      lessonId,
      lessonBlockId: input.lessonBlockId,
      assertionText: input.assertionText,
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: `${lessonId}#${input.lessonBlockId}`,
        },
        { kind: "source_question" as const, ref: input.canonicalId },
        ...officialSourceRefs.map((ref) => ({
          kind: "official_source" as const,
          ref,
        })),
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

const WELDING_CBT_ANSWER_REVIEWS_PART_06_AUTHORED = [
  holdCandidate(
    "wcbt-461c229f-03d1-40e7-9517-38d030f73ed2",
    "f8eff06e390b13bb67a262fbdf4989f0ca8996f5096c5afb672252a6f343dd2e",
    "safety",
    [
      "safety_primary_official_source_missing: 수도 배관을 접지선으로 사용해서는 안 된다는 판단을 직접 뒷받침하는 KOSHA·법령·제조사 등 국내 공식 안전 근거가 연결되지 않았습니다.",
      "mixed_safety_claims_need_independent_verification: 절연 홀더 교환, 전원 차단, 습윤 보호구 금지와 접지 위치를 각각 공식 기준으로 대조해야 합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4721b52d-05ea-44bc-bcde-8ad01d021e41",
    "dce38a2946f6fd505f94edf83e95641d8916085ada6ee934ee6b0a42060c5828",
    "safety",
    [
      "safety_primary_official_source_missing: 산소·아세틸렌 빈 용기의 분리 보관과 누설시험 절차를 직접 확인할 국내 공식 안전 근거가 연결되지 않았습니다.",
      "mixed_safety_claims_need_independent_verification: 흡연 금지, 비눗물 누설검사, 빈 용기 구분, 토치 팁 청소 방법을 보기별로 독립 검증해야 합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4826f43f-efc4-4fc6-8231-34aa63bf210a",
    "347d681011f9ac7672aac6b5bb35794429e2a89b8d065042d6e8e24020a59190",
    "safety",
    [
      "safety_primary_official_source_missing: 산소용기 충전 조건 35℃·15 MPa를 직접 규정하는 국내 공식 고압가스 기준이 연결되지 않았습니다.",
      "direct_numeric_evidence_missing: 현재 가스용기 레슨은 일반 취급원칙만 설명하며 제시 온도와 압력 수치를 검증하지 못합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4871f59f-a27a-497b-8c63-a105360a90d9",
    "2bccc375a2745513471008f99a7e093c7af59063faf359639fc74349b0ad45f5",
    "identification",
    [
      "direct_device_definition_missing: 현재 용접 전원 레슨에 아크 발생 초기에 전류를 높이는 핫 스타트 장치의 정의가 없습니다.",
      "choice_function_evidence_missing: 원격제어·전격방지·초음파 발생 장치와 핫 스타트의 기능 차이를 직접 설명하는 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-488c5eff-5546-48ad-b252-808df7cc315d",
    "49e2d081f81142a6e44cb793605aa628e98afd1281d910f97a454a6482a0815f",
    "definition",
    [
      "direct_definition_evidence_missing: 연결된 가스절단 레슨은 팁·속도·산소 조건이 드래그에 영향을 준다고만 설명하고, 절단면의 평행 곡선이 드래그 라인이라는 정의를 직접 제시하지 않습니다.",
      "concept_assertion_insufficient: 원문 문제와 복원 정답은 드래그 라인을 가리키지만, 학습자 해설을 공개할 수 있는 독립된 개념 근거가 아직 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-48a507ff-9d5b-4d18-af0d-cafee43ff243",
    "33062dbb1a16d57db5589490ca3cc50e03beb11f475e41a3f9d310b63cc72af2",
    "safety",
    [
      "safety_primary_official_source_missing: CO₂ 15 체적% 이상을 위험 상태로 보는 노출·중독 기준의 공식 산업보건 근거가 연결되지 않았습니다.",
      "direct_numeric_evidence_missing: 현재 환기 레슨은 CO₂ 농도별 인체 영향 수치를 제시하지 않아 네 선택지를 직접 판별할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-48c678d0-c20f-4592-ae2b-d7efba6c6e45",
    "4f9466bd1a4a82e6084588e3792a8f683b6c9a428ee2c8f72f294105ae5c6e7c",
    "safety",
    [
      "lesson_mismatch: 산소병 운반·유분 금지·밸브 잠금 문제인데 현재 연결 레슨은 추락·낙하·양중 안전이라 직접 판단 근거가 아닙니다.",
      "safety_primary_official_source_missing: 산소용기를 세워 고정해 운반하는 취급기준을 직접 확인할 공식 고압가스 안전 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-48da0877-bb8c-4575-a606-b091adf83e79",
    "1936c58bbd0defbe8c6fb9c77a1a217b38e125e4f62288b3e11f2ef5b0a643f3",
    "identification",
    [
      "lesson_content_missing: 제안된 피복아크용접 레슨이 현재 공개 학습 블록에 존재하지 않아 탈산제 배합성분을 연결할 수 없습니다.",
      "direct_material_function_evidence_missing: 망간철이 탈산제로 작용하고 붕사·석회석·산화티탄의 기능이 다른 이유를 직접 검증할 자료가 없습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-4925dffa-26cb-46db-9d75-e84bd59e1e1d",
    contentDigest:
      "57b18ab7633a767635324a0f0f89a4cbc99a8b45ab54ccfa36c7dc1a57c63cb6",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "principle",
    assertionText:
      "감전자를 구조할 때도 먼저 전원을 차단한 뒤 구조하며, 즉시 차단할 수 없으면 구조자가 직접 접촉하지 않도록 절연된 도구와 보호구로 분리합니다.",
    officialSourceRefs: [
      KOSHA_ELECTRIC_SHOCK_RESCUE_GUIDE,
      KOSHA_WELDING_SAFETY_GUIDE,
      OCCUPATIONAL_SAFETY_AND_HEALTH_STANDARDS_RULES,
    ],
    answerExplanation:
      "아크 용접 작업 중 전격에 관해 옳지 않은 보기는 ‘전격 받은 사람을 발견하였을 때에는 즉시 손으로 잡아 당긴다.’입니다. 구조자가 맨손으로 접촉하면 구조자도 같은 전류 경로에 들어갈 수 있으므로, 먼저 전원을 차단하고 차단할 수 없을 때에는 절연된 도구와 보호구로 분리해야 합니다.",
    solutionSteps: [
      "문항이 전격 관련 행동 중 옳지 않은 것을 고르는 부정형임을 확인합니다.",
      "습윤 작업복·장갑 회피, 장시간 중단 시 전원 차단, 맨손이 아닌 홀더 취급은 모두 감전 경로를 줄이는 조치인지 대조합니다.",
      "감전자에게 전원이 살아 있을 수 있는 상태에서 손으로 직접 접촉시키는 세 번째 보기를 고릅니다.",
    ],
    keyRule:
      "감전 구조는 전원 차단이 우선이며, 차단 전에는 구조자가 맨손으로 감전자에게 접촉하지 않습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "습기찬 작업복과 장갑은 인체·보호구의 절연 상태를 떨어뜨릴 수 있으므로 착용하지 않는 것이 전격 예방에 맞습니다.",
        plausibleReason:
          "보호구라는 말만 보고 젖어도 보호 기능이 유지된다고 오해하기 쉽습니다.",
        incorrectPoint:
          "습기찬 작업복·장갑을 피하라는 내용은 올바른 감전 예방조치이므로 ‘옳지 않은 것’의 답이 아닙니다.",
        keyRule: "전기 작업의 보호구는 건조하고 손상되지 않은 절연 상태를 유지해야 합니다.",
        differenceFromCorrect:
          "이 보기는 인체를 통한 전류 경로를 줄이지만, 정답 보기는 구조자가 맨손으로 감전자에게 접촉해 2차 감전 경로를 만듭니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "작업을 오래 중단할 때 용접기 스위치를 끄면 홀더와 케이블에 남는 통전 위험을 제거할 수 있습니다.",
        plausibleReason:
          "잠시 쉬는 동안에는 다시 시작하기 편하게 전원을 켜 두고 싶을 수 있습니다.",
        incorrectPoint:
          "장시간 작업 중단 시 전원을 차단하는 것은 올바른 전격 예방조치이므로 ‘옳지 않은 것’의 답이 아닙니다.",
        keyRule: "일정 시간 작업을 중단하거나 용접기를 운반할 때에는 전원을 차단합니다.",
        differenceFromCorrect:
          "이 보기는 위험 에너지를 제거하지만, 정답 보기는 전원이 살아 있을 수 있는 감전자에게 맨손으로 접근하게 합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "전원이 차단되기 전에 감전자를 손으로 잡으면 구조자도 전류 경로가 되어 2차 감전될 수 있습니다.",
        plausibleReason:
          "사람을 즉시 붙잡아 떼어 내는 행동이 가장 빠른 구조처럼 보입니다.",
        incorrectPoint: null,
        keyRule: "감전 구조자는 전원을 먼저 끄고, 불가능하면 절연된 도구로 분리합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "용접 홀더는 통전되는 용접봉을 잡는 부분이므로 맨손 접촉을 피하는 것은 직접 접촉에 의한 전격 예방 조치입니다.",
        plausibleReason:
          "홀더 손잡이가 눈에 보이므로 맨손으로도 안전하다고 단정하기 쉽습니다.",
        incorrectPoint:
          "홀더를 맨손으로 취급하지 말라는 내용은 올바른 감전 예방조치이므로 ‘옳지 않은 것’의 답이 아닙니다.",
        keyRule: "홀더는 손상이 없는 절연형을 사용하고 절연장갑으로 취급합니다.",
        differenceFromCorrect:
          "이 보기는 절연된 취급을 요구하지만, 정답 보기는 구조자가 맨손으로 감전자에게 접촉하게 합니다.",
      },
    ],
  }),
  {
    canonicalId: "wcbt-493b2168-1ef8-40e4-b986-92db667cd95d",
    contentDigest:
      "4f13a14b0c5ceaa1a89cfbcf9a93c3981f4bc7fde816820b703c215425abe592",
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
          ref: "wcbt-493b2168-1ef8-40e4-b986-92db667cd95d",
        },
        {
          kind: "official_source",
          ref: "src/data/source/notion-theory.md:2679-2681",
        },
      ],
    },
    answerExplanation:
      "비파괴검사 기호 RT는 Radiographic Testing의 약자로 방사선투과시험을 뜻합니다. 방사선이 시험체를 통과한 양의 차이를 영상으로 기록하여 내부 건전성을 판단하는 검사법입니다.",
    solutionSteps: [
      "도면 보조기호 RT가 비파괴검사 방법의 영문 약자인지 확인합니다.",
      "대표 약어 UT·MT·PT·RT를 각각 초음파·자분·침투·방사선투과시험으로 대응합니다.",
      "RT에 해당하는 방사선투과시험을 선택합니다.",
    ],
    keyRule:
      "RT는 방사선투과시험, UT는 초음파탐상시험, MT는 자분탐상시험, PT는 침투탐상시험입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "초음파탐상시험의 약어는 UT이며 RT와 에너지원과 검출 방식이 다릅니다.",
        plausibleReason:
          "두 검사 모두 내부 결함 검출에 쓰여 약어를 혼동하기 쉽습니다.",
        incorrectPoint: "초음파의 반사 신호를 분석하는 검사는 UT입니다.",
        keyRule:
          "U는 Ultrasonic, R은 Radiographic으로 영문 첫 단어를 대응합니다.",
        differenceFromCorrect:
          "UT는 초음파 반사를 이용하고 RT는 방사선 투과량 차이를 영상화합니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "자기분말탐상시험은 일반적으로 MT로 표시하며 강자성체의 누설자속을 이용합니다.",
        plausibleReason:
          "표면과 표면 직하 결함을 찾는 대표 비파괴검사라 약어 묶음에서 혼동할 수 있습니다.",
        incorrectPoint: "자분을 이용하는 검사는 MT이지 RT가 아닙니다.",
        keyRule: "MT는 Magnetic Particle Testing의 약어로 기억합니다.",
        differenceFromCorrect:
          "MT는 자성과 자분을 이용하지만 RT는 방사선 투과를 이용합니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "침투탐상시험은 PT이며 표면에 열린 결함으로 침투액이 스며드는 현상을 이용합니다.",
        plausibleReason:
          "PT와 RT가 모두 T로 끝나는 두 글자 약어라 빠르게 읽으면 바뀌기 쉽습니다.",
        incorrectPoint: "침투액을 사용하는 검사는 PT입니다.",
        keyRule:
          "PT는 Penetrant Testing, RT는 Radiographic Testing으로 첫 글자를 구분합니다.",
        differenceFromCorrect:
          "PT는 표면개구 결함용 침투액 검사이고 RT는 방사선 영상 검사입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "RT는 Radiographic Testing의 약자로 방사선투과시험을 의미합니다.",
        plausibleReason:
          "레슨의 대표 비파괴검사 약어 표기와 선택지가 정확히 일치합니다.",
        incorrectPoint: null,
        keyRule: "도면의 RT 기호는 방사선투과시험으로 읽습니다.",
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
    canonicalId: "wcbt-49410040-52d0-406b-8828-d3f10a95d6fa",
    contentDigest:
      "1b71f6f62dbbc9836ea2906a841ad2e26050171571cc81986d93b26a8ff0d1e8",
    assessmentKind: "identification",
    lessonBlockId: "structure",
    assertionText:
      "용기 도색은 산소 녹색, 수소 주황색, 아세틸렌 황색, 액화염소 갈색, 액화암모니아 백색, 액화석유가스(LPG) 밝은 회색으로 구분합니다.",
    answerExplanation:
      "현재 가스안전 레슨은 아세틸렌 용기의 색상을 황색으로 구분합니다. 따라서 공업용 아세틸렌 용기의 색상을 묻는 이 문항의 정답은 1번 황색입니다.",
    solutionSteps: [
      "질문 대상이 공업용 아세틸렌 충전용기임을 확인합니다.",
      "가스안전 레슨의 용기 도색표에서 아세틸렌을 황색과 대응시킵니다.",
      "황색을 제시한 1번을 선택하고 다른 색상은 각각 다른 가스의 표지색임을 구분합니다.",
    ],
    keyRule:
      "아세틸렌 용기는 황색이며 산소는 녹색, 수소는 주황색으로 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "가스안전 레슨의 용기 도색표가 아세틸렌을 황색으로 직접 대응합니다.",
        plausibleReason:
          "문항의 가스명과 도색표의 가스명을 그대로 대응하면 확인할 수 있습니다.",
        incorrectPoint: null,
        keyRule: "아세틸렌 용기의 식별색은 황색입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale: "녹색은 가스안전 레슨에서 산소 용기의 도색으로 제시됩니다.",
        plausibleReason:
          "산소와 아세틸렌을 함께 사용하는 장비라 두 용기의 색상을 바꾸어 기억하기 쉽습니다.",
        incorrectPoint: "아세틸렌이 아니라 산소 용기의 색상을 골랐습니다.",
        keyRule: "산소는 녹색, 아세틸렌은 황색으로 구분합니다.",
        differenceFromCorrect: "정답 황색은 아세틸렌이고 녹색은 산소입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale: "백색은 레슨의 용기 도색표에서 액화암모니아에 대응합니다.",
        plausibleReason:
          "밝은 계열의 용기색을 아세틸렌의 황색과 혼동할 수 있습니다.",
        incorrectPoint: "백색은 아세틸렌의 도색이 아닙니다.",
        keyRule: "액화암모니아는 백색이고 아세틸렌은 황색입니다.",
        differenceFromCorrect:
          "정답은 황색이며 백색은 다른 가스의 식별색입니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "주황색은 가스안전 레슨에서 수소 용기의 도색으로 제시됩니다.",
        plausibleReason:
          "황색과 주황색이 인접한 색조라 명칭을 섞어 기억하기 쉽습니다.",
        incorrectPoint: "수소의 주황색을 아세틸렌 색상으로 잘못 대응했습니다.",
        keyRule: "수소는 주황색, 아세틸렌은 황색입니다.",
        differenceFromCorrect: "정답 황색보다 붉은 주황색은 수소에 대응합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-49a6b46a-d48e-4369-8005-26d7cd2dbc18",
    "18ebfa86d69909be9280bc6a977e756adced0a2a945d4e48ace059536b0fd4cc",
    "safety",
    [
      "safety_primary_official_source_missing: 안전·보건표지의 파란색이 지시를 뜻한다는 색채·용도 규정의 공식 법령 또는 KOSHA 근거가 연결되지 않았습니다.",
      "regulatory_version_binding_missing: 2010년 출제 당시 적용된 표지 색채 기준과 현재 기준의 적용시점을 구분한 근거가 없습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-49ddc1c2-05f9-454e-a01a-21440d2f4a92",
    contentDigest:
      "8358640295e9d03aee5f89d64f1c35c35c603a9b0d3ada8f6f5d5050e4a76663",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "structure",
    assertionText:
      "자동전격방지기는 아크 소멸 후 0.1초 이내에 출력측 무부하전압을 25V 이하로 낮추는 장치입니다.",
    officialSourceRefs: [KOSHA_VOLTAGE_REDUCTION_GUIDE],
    answerExplanation:
      "이 문항은 복원된 출제 당시 자동전격방지기가 설치된 용접기의 조건을 묻습니다. 그 역사 기출 조건에서는 아크가 꺼진 뒤 0.1초 이내에 출력측 무부하전압을 25V 이하로 낮추므로, 정답 선택지인 ‘25V 이하’가 적당한 무부하전압입니다. 현행 설비에 적용할 값은 모든 장치에 일률 적용하지 말고 장치 형식과 적용 기준의 시점을 확인해야 합니다.",
    solutionSteps: [
      "문제가 복원된 역사 기출에서 전격방지기 작동 뒤의 출력측 무부하전압을 묻는지 확인합니다.",
      "출제 당시 조건인 0.1초 이내의 25V 이하 기준을 보기의 네 수치와 대조합니다.",
      "역사 기출 조건과 일치하는 25V 이하를 선택하고, 현행 적용값은 장치 형식과 기준시점을 별도로 확인합니다.",
    ],
    keyRule:
      "복원된 역사 기출에서는 자동전격방지기 작동 뒤 출력측 무부하전압에 25V 이하 조건을 적용했으며, 현행값은 장치 형식과 기준시점 확인이 필요합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "25V 이하는 전격방지기가 낮춰야 하는 출력측 무부하전압의 직접 기준과 일치합니다.",
        plausibleReason:
          "전격방지기의 목적과 함께 수치 기준까지 기억하면 바로 고를 수 있는 보기입니다.",
        incorrectPoint: null,
        keyRule:
          "아크 소멸 뒤 0.1초 이내에 출력측을 25V 이하로 낮추는지를 확인합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "50V 이하는 전격방지기 작동 뒤 허용되는 25V 이하 기준보다 상한이 두 배 높습니다.",
        plausibleReason:
          "일반적인 저전압 수치와 전격방지기의 별도 출력 기준을 혼동할 수 있습니다.",
        incorrectPoint:
          "50V까지 허용하면 25V를 초과하는 무부하전압도 포함하므로 기준을 만족하지 못합니다.",
        keyRule:
          "전격방지기 문항에서는 일반 저전압이 아니라 출력측 25V 상한을 적용합니다.",
        differenceFromCorrect:
          "정답은 25V에서 상한을 닫지만 이 보기는 25V를 넘는 범위까지 허용합니다.",
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "75V 이하는 전격방지기가 낮춘 뒤의 25V 이하 기준보다 훨씬 높은 전압을 허용합니다.",
        plausibleReason:
          "용접기의 원래 무부하전압 범위와 방지장치 작동 뒤의 저감전압을 섞어 생각할 수 있습니다.",
        incorrectPoint:
          "장치 작동 뒤에도 75V까지 남겨 두는 조건은 감전위험을 낮추는 규정값과 맞지 않습니다.",
        keyRule:
          "원래 용접기 전압이 아니라 전격방지기 동작 후 남는 출력측 전압을 판별합니다.",
        differenceFromCorrect:
          "정답 25V 이하보다 이 보기의 상한은 50V 더 높습니다.",
      },
      {
        choiceIndex: 3,
        relation: "contradicts",
        rationale:
          "무부하전압은 전격방지기의 감전보호 성능을 결정하는 기준이므로 상관없다고 할 수 없습니다.",
        plausibleReason:
          "용접 중에는 작업전압이 달라지므로 무부하 상태의 수치가 중요하지 않다고 오해할 수 있습니다.",
        incorrectPoint:
          "아크가 꺼진 무부하 상태에서 전압을 낮추는 것이 바로 장치의 보호 기능입니다.",
        keyRule: "전격방지기는 무부하 상태의 출력전압을 관리하는 장치입니다.",
        differenceFromCorrect:
          "정답은 25V 상한을 적용하지만 이 보기는 필요한 상한 자체를 부정합니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-4a022b98-5d0a-4b87-a300-1e39056ff4bd",
    contentDigest:
      "7237a59ed92f699ae1ea419e234e08d28e018822d2cdfbcd5a16bb6a12f0f6ea",
    assessmentKind: "identification",
    lessonBlockId: "structure",
    assertionText:
      "용기 도색은 산소 녹색, 수소 주황색, 아세틸렌 황색, 액화염소 갈색, 액화암모니아 백색, 액화석유가스(LPG) 밝은 회색으로 구분합니다.",
    answerExplanation:
      "레슨의 용기 도색표에서 산소는 녹색, 수소는 주황색, LPG 계열은 밝은 회색, 아세틸렌은 황색입니다. 따라서 아세틸렌을 청색이라고 한 4번이 틀렸습니다.",
    solutionSteps: [
      "문제가 틀린 가스와 용기색의 조합을 묻는 부정형임을 확인합니다.",
      "산소·수소·LPG·아세틸렌을 레슨의 도색표와 하나씩 대조합니다.",
      "아세틸렌을 황색이 아닌 청색으로 제시한 4번을 선택합니다.",
    ],
    keyRule:
      "산소 녹색, 수소 주황색, LPG 밝은 회색, 아세틸렌 황색으로 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale: "산소와 녹색의 조합은 레슨의 용기 도색표와 일치합니다.",
        plausibleReason:
          "부정형 문항에서 맞는 조합도 오답처럼 보일 수 있습니다.",
        incorrectPoint:
          "산소-녹색은 틀린 조합이 아니라 표와 일치하는 조합입니다.",
        keyRule: "산소 용기의 도색은 녹색입니다.",
        differenceFromCorrect:
          "정답은 색이 불일치하는 아세틸렌-청색 조합입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale: "수소와 주황색의 조합은 레슨의 용기 도색표와 일치합니다.",
        plausibleReason:
          "주황색과 아세틸렌의 황색을 혼동하면 틀렸다고 판단하기 쉽습니다.",
        incorrectPoint: "수소-주황색은 레슨이 직접 지지하는 조합입니다.",
        keyRule: "수소 용기의 도색은 주황색입니다.",
        differenceFromCorrect:
          "정답의 아세틸렌은 황색이며 수소는 주황색입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "프로판은 LPG 계열이며 레슨은 LPG 용기를 밝은 회색으로 구분합니다.",
        plausibleReason:
          "보기의 회색과 레슨의 밝은 회색 표현 차이를 다른 색상으로 오해할 수 있습니다.",
        incorrectPoint:
          "프로판-회색은 이 문항에서 배제할 틀린 조합이 아닙니다.",
        keyRule: "LPG 계열 용기는 밝은 회색으로 구분합니다.",
        differenceFromCorrect:
          "정답은 청색으로 잘못 표시한 아세틸렌 조합입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "아세틸렌 용기의 레슨상 도색은 황색이므로 청색 표기는 틀립니다.",
        plausibleReason:
          "아세틸렌의 황색을 다른 고압가스 색상과 바꾸어 제시한 전형적인 오답입니다.",
        incorrectPoint: null,
        keyRule: "아세틸렌 용기의 도색은 황색입니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-4a42ec5a-b40c-4f60-9983-4ce4a289cf70",
    contentDigest:
      "066124440a3758f7b95eaa6231596da2f6b2c85b2d067f780b4c0080ab3d588f",
    assessmentKind: "identification",
    lessonBlockId: "exam-point",
    assertionText:
      "용기 각인의 W는 용기 질량, FP는 최고충전압력, TP는 내압시험압력을 뜻합니다.",
    answerExplanation:
      "가스안전 레슨은 산소병을 포함한 용기 각인에서 FP를 최고충전압력, TP를 내압시험압력으로 정의합니다. 두 약호를 모두 정확히 대응한 보기는 1번입니다.",
    solutionSteps: [
      "질문의 두 약호 FP와 TP를 각각 분리합니다.",
      "레슨의 각인 정의에서 FP는 최고충전압력, TP는 내압시험압력으로 대응합니다.",
      "두 정의가 모두 일치하는 1번을 선택합니다.",
    ],
    keyRule: "FP는 최고충전압력이고 TP는 내압시험압력입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "보기의 ‘FP: 최고충전압력, TP: 내압시험압력’ 조합은 두 약호를 각각 올바른 압력 항목에 대응합니다.",
        plausibleReason:
          "FP의 filling pressure와 TP의 test pressure를 용기 각인의 실제 용도와 연결하면 선택할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "FP는 충전 한계를, TP는 용기가 견디는지 확인하는 시험 압력을 표시합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale: "용기 질량은 W의 의미이며 FP나 TP의 의미가 아닙니다.",
        plausibleReason:
          "용기에 중량 정보도 각인된다는 사실 때문에 약호를 섞기 쉽습니다.",
        incorrectPoint:
          "FP를 용기 중량으로, TP를 충전 중량으로 잘못 정의했습니다.",
        keyRule: "질량은 W이고 FP와 TP는 압력 표기입니다.",
        differenceFromCorrect:
          "정답은 FP와 TP를 각각 최고충전압력과 내압시험압력으로 정의합니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "사용량과 내용적은 레슨에서 FP·TP의 정의로 제시되지 않습니다.",
        plausibleReason:
          "용기 표시에 용량 정보가 포함될 것이라는 일반적 추측으로 고르기 쉽습니다.",
        incorrectPoint: "FP와 TP를 사용량·내용적 약호로 잘못 해석했습니다.",
        keyRule: "FP와 TP는 용량이 아니라 충전·시험 압력의 약호입니다.",
        differenceFromCorrect:
          "정답은 두 약호를 모두 압력 기준으로 풀이합니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale: "사용압력과 잔량은 FP·TP의 공식 정의가 아닙니다.",
        plausibleReason:
          "현장에서 확인하는 운전 압력과 잔량을 용기 각인의 영구 표기와 혼동할 수 있습니다.",
        incorrectPoint: "FP를 사용압력, TP를 잔량으로 잘못 대응했습니다.",
        keyRule: "FP는 최고충전압력, TP는 내압시험압력으로 고정해 읽습니다.",
        differenceFromCorrect:
          "정답은 운전 중 상태가 아니라 용기의 충전·시험 한계를 나타냅니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-4b8bf34b-46fa-4435-9869-c21b3dfbea7f",
    "85b7c1a6c08becae9a61455e6c6235e24edc4806555eab6317b97912ba1e18d1",
    "application",
    [
      "direct_material_sensitivity_evidence_missing: 현재 특수용접 레슨은 플라즈마 아크의 열원만 설명하며 티탄 용접부의 수소 민감성을 직접 다루지 않습니다.",
      "choice_material_comparison_missing: 티탄·연강·니켈합금·알루미늄에 미량 수소가 미치는 영향을 같은 조건에서 비교한 근거가 연결되지 않았습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-4b9b72f8-4957-4028-bd1c-bc8157976a8e",
    contentDigest:
      "5bb85461f4bc3c5fdb7a49857169cb91340d310bd79218dd396512c88b7c9d59",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "definition",
    assertionText:
      "자동전격방지기는 교류 아크용접기의 감전 방지를 목적으로 합니다.",
    officialSourceRefs: [
      KOSHA_ELECTRICAL_WELDING_GUIDE,
      KOSHA_VOLTAGE_REDUCTION_GUIDE,
      KOSHA_WELDING_SAFETY_GUIDE,
      OCCUPATIONAL_SAFETY_AND_HEALTH_STANDARDS_RULES,
    ],
    answerExplanation:
      "교류 아크용접기에서 작업자를 감전위험으로부터 보호하기 위해 설치하는 장치는 자동전격방지장치입니다. 이 장치는 용접하지 않을 때 출력측 무부하전압을 낮추므로 두 번째 보기가 정답입니다.",
    solutionSteps: [
      "문제가 용접 품질이나 조작 편의가 아니라 감전보호 장치를 묻는지 확인합니다.",
      "각 보기의 기능을 고주파 발생·전격 방지·원격 조작·시간 제어로 분리합니다.",
      "교류 아크용접기의 감전 방지를 직접 목적으로 하는 전격 방지 장치를 선택합니다.",
    ],
    keyRule:
      "자동전격방지장치는 교류 아크용접기의 무부하전압을 낮춰 작업자를 감전위험에서 보호합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "고주파 발생 장치는 아크 점화나 안정화에 쓰일 수 있지만 교류 용접기의 무부하 감전보호 장치는 아닙니다.",
        plausibleReason:
          "고주파가 전기적 기능이므로 전격을 차단하는 장치처럼 들릴 수 있습니다.",
        incorrectPoint:
          "고주파를 발생시키는 기능은 출력측 무부하전압을 안전 수준으로 낮추지 않습니다.",
        keyRule:
          "감전보호 문항에서는 점화 보조가 아니라 무부하전압 저감 기능을 찾습니다.",
        differenceFromCorrect:
          "정답은 무부하전압을 낮추지만 고주파 장치는 아크 점화를 보조합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "전격 방지 장치는 교류 아크용접기의 무부하전압을 낮춰 작업자의 감전위험을 줄이는 장치입니다.",
        plausibleReason:
          "보기의 명칭과 문제의 감전보호 목적이 직접 대응합니다.",
        incorrectPoint: null,
        keyRule:
          "교류 용접기에서 감전 방지를 직접 담당하는 것은 자동전격방지장치입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "원격 제어 장치는 떨어진 곳에서 조작하게 하지만 출력측 무부하전압을 낮추는 보호 기능을 뜻하지 않습니다.",
        plausibleReason:
          "충전부에서 멀리 떨어져 조작하면 감전위험도 줄어들 것이라고 추측할 수 있습니다.",
        incorrectPoint:
          "조작 위치를 바꾸는 것만으로 용접봉 홀더에 남는 무부하전압 기준이 충족되지는 않습니다.",
        keyRule:
          "거리 확보와 전압 저감은 다른 대책이며 장치의 직접 기능을 구분합니다.",
        differenceFromCorrect:
          "정답은 전압 자체를 낮추지만 원격 제어는 조작 위치만 바꿉니다.",
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope",
        rationale:
          "시간 제어 장치는 동작 시간을 조절하는 기능이며 감전 방지를 위한 무부하전압 저감장치가 아닙니다.",
        plausibleReason:
          "전류가 흐르는 시간을 줄이면 감전 접촉시간도 줄 것이라고 연결해 생각할 수 있습니다.",
        incorrectPoint:
          "용접 중 동작시간 제어는 아크가 꺼진 뒤 홀더의 무부하전압을 안전값으로 낮추지 않습니다.",
        keyRule:
          "감전보호 장치는 통전시간이 아니라 무부하 출력전압을 직접 제어해야 합니다.",
        differenceFromCorrect:
          "정답은 전압을 저감하지만 시간 제어 장치는 공정 시간을 조절합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-4c6637b9-321f-40e7-be9c-9942a0c1e3db",
    "9bd74e628a35428502221b286180a4489f773c09a3fe20cc043915faafaa07b3",
    "identification",
    [
      "lesson_mismatch: 7:3 황동에 주석을 첨가한 합금 명칭 문제인데 현재 연결 레슨은 용접흄·환기라 직접 관련이 없습니다.",
      "direct_alloy_composition_evidence_missing: 애드미럴티 황동의 조성과 용도를 코슨·네이벌 황동 및 에버듀어 메탈과 비교할 재료 레슨 근거가 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4d23cb4d-867e-44fa-9848-b127a9b6d5f1",
    "3cb45f1625d0a4fbb6517956d45da9de8fc227b4cda51f4469dd03d4324f0af7",
    "safety",
    [
      "safety_primary_official_source_missing: 통행로 폭, 상부 장애물, 계단 치수와 계단참 설치 기준을 직접 확인할 공식 산업안전 규정이 연결되지 않았습니다.",
      "mixed_regulatory_numbers_need_verification: 2 m·80 cm·5 m 등 수치와 계단 단계 규칙을 적용시점별 법령으로 각각 대조해야 합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4e0628e5-cf7e-4595-94c5-7527b370464d",
    "ce29fe776535fcdf7e8e8693923c4c51a23206919f98441574dcdc2da5571469",
    "safety",
    [
      "safety_primary_official_source_missing: 산소용기의 직사광선 차단, 밸브 동결 해빙, 유분 금지와 누설검사 절차를 직접 확인할 공식 근거가 연결되지 않았습니다.",
      "mixed_safety_claims_need_independent_verification: 네 취급방법이 모두 안전규정 항목이므로 복원 정답만으로 선택지별 해설을 발행하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4ecfae36-0ec2-410e-b9dc-4e13eb8e6f1a",
    "2fd67065c5ac127d7cf0c6aa6502fa3be8d109e0e44b755cd51ed089cc147368",
    "identification",
    [
      "direct_electrode_tip_definition_missing: 현재 저항용접 레슨에는 F·R·P·E형 전극팁의 형상과 적용 위치가 없습니다.",
      "choice_geometry_evidence_missing: 앵글재처럼 접근이 나쁜 위치에 편심형 E팁을 쓰는 이유를 직접 보여주는 형상 근거가 연결되지 않았습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-50205d5a-4685-403f-9ca5-345142be4a27",
    contentDigest:
      "6240468733eb3f18eb9c9a4c14ab894a55e575b59efd7be4e294a1b3aef903c2",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "principle",
    assertionText:
      "감전자를 구조할 때도 먼저 전원을 차단한 뒤 구조하며, 즉시 차단할 수 없으면 구조자가 직접 접촉하지 않도록 절연된 도구와 보호구로 분리합니다.",
    officialSourceRefs: [KOSHA_ELECTRIC_SHOCK_RESCUE_GUIDE],
    answerExplanation:
      "감전자를 발견하면 구조자가 전류 경로에 들어가지 않도록 먼저 전원을 차단해야 합니다. 차단 전에 작업자를 맨손으로 잡아 떼면 구조자까지 감전될 수 있으므로 두 번째 조치가 적절하지 않습니다.",
    solutionSteps: [
      "문제가 적절하지 않은 구조 행동을 묻는 부정형임을 확인합니다.",
      "구조자가 감전자와 직접 접촉하기 전에 전원이 차단되는지 각 보기를 확인합니다.",
      "전원차단 전에 맨손으로 이탈시키겠다는 두 번째 보기를 선택합니다.",
    ],
    keyRule:
      "감전자 구조는 전원 차단이 먼저이며, 차단이 곤란하면 절연된 도구와 보호구로 직접 접촉 없이 분리합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "전원 스위치를 신속히 차단하면 감전자와 구조자에게 흐를 수 있는 전류 경로를 먼저 끊을 수 있습니다.",
        plausibleReason:
          "환자를 바로 잡아당기는 것보다 스위치를 찾는 시간이 지체처럼 느껴질 수 있습니다.",
        incorrectPoint:
          "전원 차단은 구조자의 2차 감전을 막는 우선 조치이므로 부적절한 행동이 아닙니다.",
        keyRule: "접촉 구조보다 먼저 전원을 차단해 통전 상태를 제거합니다.",
        differenceFromCorrect:
          "정답은 차단 전에 맨손 접촉하지만 이 보기는 먼저 전류를 끊습니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "전원을 끄기 전에 감전자를 맨손으로 잡으면 구조자 몸까지 전류 경로가 이어질 수 있어 부적절합니다.",
        plausibleReason:
          "환자를 전원에서 빨리 떼어 놓는 것이 최우선이라는 급한 판단 때문에 선택하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "차단 전에는 감전자에게 직접 손을 대지 말고 절연 수단으로 분리합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "전류에서 안전하게 분리한 뒤 의료진에게 연락해 진료를 받게 하는 것은 감전 후 손상을 평가하는 조치입니다.",
        plausibleReason:
          "가벼운 감전처럼 보여 의사 연락이 과도한 대응이라고 생각할 수 있습니다.",
        incorrectPoint:
          "감전은 외관만으로 내부 손상을 판단하기 어려우므로 의료 지원을 요청하는 조치는 적절합니다.",
        keyRule:
          "현장을 안전하게 만든 뒤 응급평가와 전문 의료 지원을 이어갑니다.",
        differenceFromCorrect:
          "정답은 구조자를 위험에 넣지만 이 보기는 분리 후 치료를 연결합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "구조 후 호흡과 반응을 확인하고 필요하면 인공호흡 등 응급처치를 시행하는 것은 생명유지 조치입니다.",
        plausibleReason:
          "전기 사고에서는 전원만 끄면 회복된다고 생각해 추가 응급처치를 불필요하게 볼 수 있습니다.",
        incorrectPoint:
          "호흡정지 등 상태에 따른 응급처치는 전원 차단과 안전한 분리 뒤 필요한 대응입니다.",
        keyRule:
          "전원 차단과 분리 뒤에는 호흡·의식을 확인하고 상태에 맞는 응급처치를 합니다.",
        differenceFromCorrect:
          "정답은 차단 전에 직접 접촉하지만 이 보기는 구조가 끝난 뒤 상태에 맞춰 처치합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-50c18982-fab2-44eb-9f47-8f8c9ea42367",
    "b8dddad66babc4d3fd5c4289203986934dddf754859469ecad098c4ff671e393",
    "safety",
    [
      "malformed_choice_text: ‘직류보다 교류를 많이 착용한다’는 선택지는 동사와 대상이 맞지 않아 원문 오탈자 여부를 확인하기 전 의미를 확정할 수 없습니다.",
      "safety_primary_official_source_missing: 교류와 직류의 감전위험 비교, 무부하전압, 절연상태에 대한 공식 전기안전 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-50dd66f0-8283-4a3f-be90-ce827cd1c768",
    "8007c04d798a5fbb0ebd8116c2eda11a0bc2587d00868aa4b6b509ad8e31e514",
    "identification",
    [
      "lesson_content_missing: 제안된 피복아크용접 레슨이 현재 공개 학습 블록에 존재하지 않아 슬래그 생성제 분류를 연결할 수 없습니다.",
      "direct_material_function_evidence_missing: 규사·산화티탄·이산화망간이 슬래그 생성에 기여하고 구리가 속하지 않는다는 직접 근거가 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-50ea9e7d-008c-45e1-a35c-21ad26b026cc",
    "4f54466bfb4186beba9141b0f2162b07e8ec477abb9009914babb57dbf4997db",
    "calculation",
    [
      "missing_direct_formula_evidence: 용해아세틸렌 질량 1 kg을 905 L로 환산하는 직접 공식 근거가 현재 레슨과 출처에 연결되지 않았습니다.",
      "calculation_derivation_unverified: 27-24=3 kg과 3×905=2715 L 계산은 복원 정답과 일치하지만 905 L/kg의 기준상태와 적용조건을 검증하기 전 공개하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-51319666-b8de-4f6e-b502-74dfffd8fe1d",
    "a12872801d2f4198f7592dbf89d61b6b654eb3d64be99e14db854999a13487b7",
    "identification",
    [
      "direct_method_definition_missing: 현재 변형·잔류응력 레슨은 잔류응력 제거법을 출제 항목으로만 언급하며 피닝법의 구면 해머 소성변형 원리를 직접 정의하지 않습니다.",
      "choice_method_comparison_missing: 노내풀림·저온응력완화·기계적응력완화와 피닝법의 차이를 보기별로 판별할 직접 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-51c79a56-2c2e-486c-9e3e-f826baccc2c8",
    "3a57ddad95991772f264f7e8e132365317acfc9d4f91fe80b0b6a4b3d81c5766",
    "safety",
    [
      "lesson_mismatch: 밀폐공간 환기·산소 사용 금지 문제인데 현재 연결 레슨은 감전·전기설비 안전으로 선택지 전체를 직접 설명하지 못합니다.",
      "safety_primary_official_source_missing: 밀폐공간을 고압산소로 청소하지 않는다는 공식 산업안전 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-53168311-74f4-4d52-ab30-822e43ba4498",
    "2559d0d4d9b49e9a91602b9b9d3a0af49d6a83d5230058750c23b03ad104d96d",
    "application",
    [
      "direct_ignition_cause_evidence_missing: 현재 가스용접 레슨은 압력·혼합비·팁 상태를 일반 원인으로만 설명하며 점화 시 폭음과 아세틸렌 순도의 관계를 직접 다루지 않습니다.",
      "choice_causality_evidence_missing: 분출속도 부족, 혼합가스 배출 불완전, 두 가스 압력 부족이 폭음 원인이 되는 조건을 보기별로 검증할 근거가 연결되지 않았습니다.",
    ],
  ),
] as const;

const APPROVED_REVIEW_IDS = new Set([
  "wcbt-49ddc1c2-05f9-454e-a01a-21440d2f4a92",
]);

const FORCED_HOLD_REASONS = new Map<string, string[]>([
  [
    "wcbt-50205d5a-4685-403f-9ca5-345142be4a27",
    [
      "official_source_partial: 연결된 감전 구조 근거는 전원 차단과 직접 접촉 금지는 지지하지만 의사 연락·치료와 인공호흡을 포함한 네 조치 전체를 같은 수준으로 검증하지 못함",
    ],
  ],
  [
    "wcbt-49410040-52d0-406b-8828-d3f10a95d6fa",
    [
      "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 이 가스용접 문항의 보기와 정답을 직접 뒷받침하지 않습니다.",
    ],
  ],
  [
    "wcbt-4a022b98-5d0a-4b87-a300-1e39056ff4bd",
    [
      "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 가스용기 도색 기준을 직접 제시하지 않습니다.",
    ],
  ],
  [
    "wcbt-4a42ec5a-b40c-4f60-9983-4ce4a289cf70",
    [
      "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 가스용접 안전기 문항의 정답과 선택지별 판단을 직접 검증할 수 없습니다.",
    ],
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_06 =
  WELDING_CBT_ANSWER_REVIEWS_PART_06_AUTHORED.map((entry) => {
    const forcedHoldReasons = FORCED_HOLD_REASONS.get(entry.canonicalId);
    if (forcedHoldReasons) {
      return holdCandidate(
        entry.canonicalId,
        entry.contentDigest,
        entry.assessmentKind,
        forcedHoldReasons,
      );
    }
    if (
      APPROVED_REVIEW_IDS.has(entry.canonicalId)
      && entry.authoringDisposition === "publish_candidate"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        essentialRank: 2,
        essentialRationale: "전격방지기의 무부하전압 저감 원리를 실제 전압 선택에 적용하는 핵심 안전 문항입니다.",
        reviewer: REVIEWER,
        reviewedAt: REVIEWED_AT,
      };
    }
    return entry;
  });
