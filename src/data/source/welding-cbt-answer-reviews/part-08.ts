const AUTHOR = "agent:welding_author_part08";
const AUTHORED_AT = "2026-08-02T15:45:10.000Z";
const REVIEWER = "agent:welding_reviewer_part08";
const REVIEWED_AT = "2026-08-02T16:18:00.000Z";
const KOSHA_WELDING_GUIDE =
  "https://oshri.kosha.or.kr/kosha/data/business/occuHealthBusinessData.do?articleNo=423772&attachNo=239316&mode=download";
const KOSHA_ELECTRICAL_WELDING_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s";

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
  lessonBlockId: string;
  assertionText: string;
  answerExplanation: string;
  solutionSteps: string[];
  keyRule: string;
  choiceFeedback: ChoiceFeedback[];
  evidenceLessonBlocks?: string[];
  lessonId?: "lesson-welding-safety-gas" | "lesson-welding-safety-electrical";
  officialSourceRef?: string;
}) {
  const lessonId = input.lessonId ?? "lesson-welding-safety-gas";
  return {
    canonicalId: input.canonicalId,
    contentDigest: input.contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "pending" as const,
    assessmentKind: "safety" as const,
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
        ...(input.evidenceLessonBlocks ?? []).map((blockId) => ({
          kind: "lesson_block" as const,
          ref: `${lessonId}#${blockId}`,
        })),
        { kind: "source_question" as const, ref: input.canonicalId },
        {
          kind: "official_source" as const,
          ref: input.officialSourceRef ?? KOSHA_WELDING_GUIDE,
        },
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
  reason: string,
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
    holdReasons: [reason],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  };
}

const WELDING_CBT_ANSWER_REVIEWS_PART_08_AUTHORED = [
  holdCandidate(
    "wcbt-5e77bfab-c147-40b7-8607-86b3ccc8a254",
    "a0dca3aa4aad5c5dfcdbb8f1c9cb7a095c20c36a922163354697db246c6acc7b",
    "identification",
    "missing_direct_lesson_evidence: 현재 가스절단 레슨에 분말 절단을 가스절단으로 분류하는 직접 문장이 없어 선택지별 판정을 공개할 수 없습니다.",
  ),
  {
    canonicalId: "wcbt-5e808e7a-4a33-4f64-a868-65f133a9916a",
    contentDigest:
      "a18e6bf929cc7e5c9262ba1a159d3fd237bf85ba2d9a5dd374e9ca9e3be1e976",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "application",
    primaryLeafLessonId: "lesson-welding-inspection-ndt",
    conceptBinding: {
      lessonId: "lesson-welding-inspection-ndt",
      lessonBlockId: "structure",
      assertionText:
        "PT는 비다공성 재료의 표면개구 결함에 널리 적용하지만 내부 결함은 직접 찾지 못합니다. MT는 강자성체에 제한됩니다. RT는 체적성 내부 결함과 기록성에 유리하지만 방사선 안전과 촬영 방향을 관리해야 합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-inspection-ndt#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-5e808e7a-4a33-4f64-a868-65f133a9916a",
        },
      ],
    },
    answerExplanation:
      "방사선투과검사(RT)는 투과량 차이로 내부 상태를 영상화하므로 내부 결함 판독과 검사 기록 보존에 유리합니다. 그러나 미세한 표면개구 균열은 침투탐상검사(PT)가 직접 겨냥하는 결함이므로, 라미네이션과 미세 표면 균열을 모두 RT로 검출한다고 묶은 3번 설명이 틀린 보기입니다.",
    solutionSteps: [
      "문제가 방사선투과검사의 옳은 설명이 아니라 틀린 설명을 요구하는지 먼저 확인합니다.",
      "RT의 핵심 특성을 내부 결함 판독과 영상 기록으로 정리하고 1번과 2번을 제외합니다.",
      "표면개구 균열은 PT의 직접 적용 대상임을 대조해 서로 다른 결함을 한데 묶은 3번을 선택합니다.",
      "투과도계·계조계·증감지는 RT 촬영 품질과 영상 형성에 쓰이는 기구이므로 4번은 제외합니다.",
    ],
    keyRule:
      "검사법은 결함의 위치와 형상으로 구분하며, RT는 내부 영상화·기록성에, PT는 표면에 열린 균열 검출에 초점을 둡니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "RT는 방사선 투과량의 차이를 영상으로 만들기 때문에 내부의 체적성 결함 판독에 유리합니다.",
        plausibleReason:
          "방사선이 재료를 통과하므로 표면만 보는 검사라고 착각하면 이 문장을 틀렸다고 고르기 쉽습니다.",
        incorrectPoint:
          "이 문장은 RT의 대표 장점을 설명하므로 ‘틀린 것’에 해당하지 않습니다.",
        keyRule:
          "RT는 내부 결함 판독에 쓰이는 대표 비파괴검사라는 점을 먼저 고정합니다.",
        differenceFromCorrect:
          "정답 보기는 미세 표면 균열까지 RT의 일반 검출 대상으로 넓혔지만, 이 보기는 RT의 실제 내부검사 장점을 말합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "필름을 사용하는 방사선투과검사는 검사 영상을 남길 수 있어 결과의 기록과 재확인이 가능합니다.",
        plausibleReason:
          "현재 디지털 검사가 사용된다는 사실 때문에 필름 기록 방식 자체가 틀렸다고 오해할 수 있습니다.",
        incorrectPoint:
          "필름 기록이 가능한 RT의 특성을 올바르게 설명하므로 정답이 아닙니다.",
        keyRule:
          "검사 기술의 최신 방식과 별개로 필름 RT는 영구 기록성이 있는 검사법입니다.",
        differenceFromCorrect:
          "정답 보기는 검출 대상 범위를 잘못 넓혔고, 이 보기는 RT의 기록 방식을 정확히 설명합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "라미네이션과 미세한 표면 균열을 모두 RT로 검출한다고 단정한 부분이 잘못입니다. 특히 표면에 열린 미세 균열은 PT의 직접 적용 대상입니다.",
        plausibleReason:
          "RT가 내부를 볼 수 있다는 장점 때문에 표면 균열까지 모든 결함을 잘 검출한다고 확대 해석하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "RT는 내부 영상화에, PT는 표면개구 결함에 유리하므로 한 검사법이 모든 결함을 동일하게 검출한다고 보지 않습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "투과도계와 계조계는 촬영 품질을 확인하고 증감지는 영상 형성을 돕는 RT 관련 기구입니다.",
        plausibleReason:
          "각 기구의 세부 역할을 외우지 못하면 다른 비파괴검사 장비와 혼동할 수 있습니다.",
        incorrectPoint:
          "열거된 기구는 RT 검사 체계와 관련되므로 ‘틀린 것’에 해당하지 않습니다.",
        keyRule:
          "RT 기구는 방사선 영상의 감도·농도·형성 품질을 확인하는 방향으로 구분합니다.",
        differenceFromCorrect:
          "정답 보기는 검출 대상의 범위를 틀렸지만, 이 보기는 RT에 쓰이는 품질관리·영상 기구를 열거합니다.",
      },
    ],
    essentialRank: 4,
    essentialRationale:
      "방사선투과검사의 내부 검출·기록성·표면균열 한계를 적용해 판별합니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-5ea8373f-bd20-4ff5-92b7-b5d18e4440f0",
    "d016024005ab962b02ac3d9bdf37c6807b059d1ee1b165f8f4120282e711c0ae",
    "safety",
    "missing_official_safety_source: 아연도금·불화물 용제·밀폐용기와 교량 구조물의 환기 필요도를 직접 비교하는 공식 산업안전 근거 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-5edff901-48c1-41df-8f74-687898814049",
    "31cc755df3e7bd407c902fe87bc545d3109e202cab09d23c8da246ec3804f77f",
    "identification",
    "missing_direct_material_evidence: 현재 납땜 레슨에 연납용 대표 용가재가 주석납이라는 직접 문장이 없어 네 재료를 구분하는 해설을 공개할 수 없습니다.",
  ),
  holdCandidate(
    "wcbt-5ef44068-2ea4-434c-acc7-1d7dd58a4446",
    "0d04ba0e3290711fb9434776fe69d996d0e7b45d5ad21976ae47357b4cb93c55",
    "application",
    "missing_direct_sequence_evidence: 현재 변형 레슨은 대칭·후퇴·스킵법만 설명하며 수축량이 큰 이음과 작은 이음의 선후관계를 직접 확정하지 않습니다.",
  ),
  holdCandidate(
    "wcbt-5f1c3bdf-7069-46e7-a669-a5f30ebe7e2a",
    "d241fffc204eb3629898897d92d9234e7a7e205a97ce50420f8c9162a4b78c00",
    "safety",
    "missing_official_safety_source: 100A 이상 300A 미만에서 차광도 10~12를 요구하는 적용 표준과 판본의 공식 URL이 연결되지 않았습니다.",
  ),
  publishCandidate({
    canonicalId: "wcbt-5f34198c-db99-4d01-84d7-670440718586",
    contentDigest:
      "2df7a9ac7b0511ce87a5f801a67bc9b3cad2b2ad8295a6eb83cbc3f599de50cb",
    lessonBlockId: "definition",
    assertionText:
      "아세틸렌 용접장치의 배관과 부속기구에는 구리 또는 구리 함유량이 70% 이상인 합금을 사용하지 않습니다.",
    answerExplanation:
      "아세틸렌 용접장치의 배관과 부속기구에는 구리 또는 구리 함유량 70% 이상 합금을 사용하지 않아야 합니다. 따라서 아세틸렌 가스도관과 연결부에 구리를 사용한다는 3번 보기가 안전수칙에 어긋납니다.",
    solutionSteps: [
      "문제가 안전수칙 중 틀린 보기를 묻는지 확인합니다.",
      "아세틸렌 배관·부속기구의 재료 제한에서 구리와 구리 함유량 70% 이상 합금이 금지됨을 적용합니다.",
      "구리 사용을 지시한 3번 보기를 정답으로 선택하고, 환기와 호스 연결 확인을 말한 보기는 제외합니다.",
    ],
    keyRule:
      "아세틸렌 용접장치의 배관과 부속기구에는 구리 또는 구리 함유량 70% 이상 합금을 사용하지 않습니다.",
    evidenceLessonBlocks: ["principle"],
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "아세틸렌 가스 설비는 누출 가스가 머물지 않도록 통풍이 확보되는 장소에 두는 것이 안전 원칙에 맞습니다.",
        plausibleReason:
          "가스용기는 모두 실내의 한곳에 모아야 관리가 쉽다고 생각하면 통풍 조건을 불필요하게 볼 수 있습니다.",
        incorrectPoint:
          "통풍이 잘되는 곳에 설치한다는 내용은 누출 가스의 체류를 줄이는 안전조치이므로 틀린 보기가 아닙니다.",
        keyRule:
          "가스 설비는 누출 가능성을 전제로 환기가 확보되는 장소에서 취급합니다.",
        differenceFromCorrect:
          "정답은 금지된 구리 재료를 사용하지만, 이 보기는 필요한 환기 조건을 확보합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "자연환기가 충분하지 않은 장소에서는 기계환기 등 환기장치를 먼저 마련해야 가스 축적 위험을 낮출 수 있습니다.",
        plausibleReason:
          "용접 불꽃이 가스를 태운다고 오해하면 별도 환기장치가 필요하지 않다고 생각할 수 있습니다.",
        incorrectPoint:
          "불충분한 자연환기를 보완한 뒤 작업한다는 설명은 안전조치이므로 틀린 보기가 아닙니다.",
        keyRule:
          "환기가 부족한 작업장에서는 용접 전에 환기설비를 가동해 가스 체류를 막습니다.",
        differenceFromCorrect:
          "정답은 재료 금지 규정을 위반하지만, 이 보기는 작업 전 환기 확보 절차를 지킵니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "아세틸렌 용접장치의 배관과 연결 부속에는 구리 또는 구리 함유량 70% 이상 합금을 사용하지 않아야 하므로 구리 사용 지시는 잘못입니다.",
        plausibleReason:
          "구리가 일반 배관에서 쓰이고 가공성이 좋다는 사실 때문에 아세틸렌 배관에도 적합하다고 착각할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "아세틸렌 배관·부속기구의 구리 및 구리 함유량 70% 이상 합금 사용 금지를 기억합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "호스를 밴드로 확실히 연결하고 사용하지 않을 때 걸어 두는 확인 절차는 이탈·손상·누설 가능성을 줄입니다.",
        plausibleReason:
          "호스가 조정기와 토치에 끼워져 있으면 추가 고정이나 정리가 없어도 된다고 생각할 수 있습니다.",
        incorrectPoint:
          "호스의 연결과 보관 상태를 확인하는 내용은 안전수칙이므로 틀린 보기가 아닙니다.",
        keyRule:
          "가스 호스와 연결구는 전용 부품을 사용하고 이탈이나 누설이 없도록 확실히 고정합니다.",
        differenceFromCorrect:
          "정답은 금지 재료를 배관에 사용하지만, 이 보기는 호스 연결 상태를 안전하게 관리합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-5fd128d0-334f-4f07-96a3-1a17fcb8d2f0",
    "be35385ed7f4d01f406a42754b7197f21c792024b7e34308ce6a875352cc550d",
    "identification",
    "missing_leaf_lesson_and_code_evidence: 제안된 SMAW 소주제 레슨이 존재하지 않고 E5326의 철분 저수소계 분류를 지지하는 규격표도 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-5fe8408c-85a5-4541-8fda-8ead41bcf0ed",
    "2d94f03b33fdfdaed40f1c23422053b44da134fde1e7dfcd3aa7dd5c0eb8b69f",
    "safety",
    "missing_official_safety_source: 강한 근육수축과 호흡곤란을 20~50mA로 연결하는 인체 감전 영향표의 공식 출처 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-603d99c2-680a-4aba-93e3-550925ae2e8a",
    "859d2fc788a6d4e87ac81d664092b0dc47b3db6a151161806a0f5b5d94519304",
    "safety",
    "missing_official_safety_source: 안전보건표지 색채별 용도에서 파란색을 지시로 정하는 현행 공식 표지 기준 URL과 적용시점이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-6150ff7d-6b71-48ae-9de2-71cf5edac1c8",
    "a557d08ea6ed1ceccf316e492a7b4e7d35d3e1713ccd6566ae012f756ecc96ca",
    "safety",
    "missing_official_safety_source: 50mA 이상을 순간 사망 위험 전류로 제시하는 조건·통전시간·경로가 포함된 공식 근거 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-63ac30ef-f659-4ead-b120-9e9318a81eb5",
    "f1110682712c35954811a3693b0e5c8cb4e0be6726ea8b5c71fde492973feaad",
    "safety",
    "missing_official_safety_source: 전기화재에 포말소화기를 사용하지 않는다는 소화기 적응화재 분류의 공식 근거 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-64cec1d7-7500-40ed-9e36-8d85a849f4d7",
    "d790f85c7715c5bdb0fd97d1790bfa9397f8a4ca3ef37c48bb0a6dc87819f703",
    "identification",
    "missing_direct_flux_evidence: 현재 가스용접 레슨에 주철 용제의 성분별 적용 여부가 없어 염화나트륨을 배제하는 직접 해설을 만들 수 없습니다.",
  ),
  publishCandidate({
    canonicalId: "wcbt-655a2b3d-b60a-4614-beb3-c1f426f0b40d",
    contentDigest:
      "86342feabeb7879dd1017f2c0a3e9133da7bd8fa5165e28fd855fadc1272507a",
    lessonBlockId: "trap",
    assertionText:
      "용해아세틸렌 용기를 눕혀 사용하는 보기, 용기를 60℃ 이하로만 유지하면 된다는 보기, 산소 조정기에 윤활유를 바르는 보기, 누설을 성냥불로 찾는 보기, 역화방지기가 있으면 팁 청소와 압력조정이 불필요하다는 보기는 틀립니다.",
    answerExplanation:
      "용해아세틸렌 용기는 운반·보관·사용할 때 세워 고정해야 합니다. 그러므로 용기를 눕혀서 사용한다는 1번 보기가 잘못된 취급방법입니다.",
    solutionSteps: [
      "문제가 용해아세틸렌병 취급방법 중 잘못된 보기를 묻는지 확인합니다.",
      "용해아세틸렌 용기는 세워 고정한다는 직접 취급 원칙을 적용합니다.",
      "용기를 눕혀 사용한다는 1번을 정답으로 고르고, 충격·직사광선 방지와 소화 준비 보기는 제외합니다.",
    ],
    keyRule:
      "용해아세틸렌 용기는 운반·보관·사용할 때 눕히지 말고 세워 고정합니다.",
    evidenceLessonBlocks: ["summary", "principle"],
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "용해아세틸렌 용기는 눕혀 쓰지 않고 세워 고정해야 하므로 이 취급방법이 잘못입니다.",
        plausibleReason:
          "일반 가스용기의 방향이 사용에 영향을 주지 않는다고 생각하면 눕혀도 된다고 오해할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "용해아세틸렌 용기의 운반·보관·사용 자세는 세움과 고정이 원칙입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "가스용기는 낙하나 충격을 받지 않도록 보호해야 하므로 충격을 주지 않는다는 설명은 올바른 취급입니다.",
        plausibleReason:
          "용기 외벽이 두꺼워 작은 충격은 안전에 영향이 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "충격 방지는 용기 취급의 기본 안전조치이므로 잘못된 방법이 아닙니다.",
        keyRule:
          "가스용기는 전도·낙하·충격을 막아 밸브와 용기 손상을 예방합니다.",
        differenceFromCorrect:
          "정답은 용기를 눕혀 사용하지만, 이 보기는 용기의 충격 위험을 올바르게 통제합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "용기는 직사광선과 열원을 피하고 표면온도를 40℃ 이하로 유지해야 하므로 직사광선을 피한다는 설명은 맞습니다.",
        plausibleReason:
          "용기가 실외에서도 쓰이므로 햇빛 노출은 허용된다고 생각할 수 있습니다.",
        incorrectPoint:
          "직사광선을 피하는 것은 가열을 막는 올바른 조치이므로 잘못된 방법이 아닙니다.",
        keyRule:
          "가스용기는 직사광선과 열원에서 떨어뜨려 표면온도를 40℃ 이하로 관리합니다.",
        differenceFromCorrect:
          "정답은 사용 자세를 위반하지만, 이 보기는 용기 가열 위험을 예방합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "가연성 가스를 취급하는 장소에 적합한 소화기를 준비하는 것은 초기 화재 대응을 위한 안전조치입니다.",
        plausibleReason:
          "가스가 새면 밸브만 잠그면 되므로 소화설비는 필요하지 않다고 생각할 수 있습니다.",
        incorrectPoint:
          "주위에 소화기를 설치하는 것은 비상 대응 준비이므로 잘못된 방법이 아닙니다.",
        keyRule:
          "가연성 가스 작업장에는 누설 예방과 함께 적합한 소화설비를 준비합니다.",
        differenceFromCorrect:
          "정답은 용기를 눕혀 사용하지만, 이 보기는 사고 시 초기 대응 수단을 마련합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-656215be-28d9-4f4b-8545-c80963d6bd4d",
    "83c4f79c0dfeac41e026b367e5cf79113d6798d7a3fd099ba5e730ae12bd03f1",
    "application",
    "missing_leaf_lesson_and_causality_evidence: 제안된 스패터 소주제 레슨이 존재하지 않고 교류 리액터 탭과 CO2 용접 스패터의 인과관계를 직접 검증할 자료가 없습니다.",
  ),
  holdCandidate(
    "wcbt-65aa007e-6c83-4457-87da-227cc2814570",
    "d23a26d2ade32dbe9f046aabd9acae4fc9b231115cba023edca64d4781247402",
    "identification",
    "answer_lesson_conflict: 복원 정답은 ‘인화’이지만 현재 레슨은 막힌 팁과 과열 상태를 ‘역화’ 원인으로 설명하여 용어 판정이 충돌합니다.",
  ),
  holdCandidate(
    "wcbt-65bac955-6f24-475a-85c6-3c063e7930ec",
    "1c05f9f47e467e3af3fa672ca15c671c1c1507bfdb470b2018aa067497b4acb7",
    "safety",
    "missing_official_safety_source: 산소용기 보관온도를 60℃ 이하로 제시한 선택지의 오류를 판정할 현행 공식 취급온도 근거 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-660f8987-975b-459d-b9ed-4e0b29ab5517",
    "ebb787ac61e4ba38f3e989fc537a2b4dfd103c12e65f79aa126f44eda8e8b7c7",
    "safety",
    "missing_official_safety_source: 산소용기와 가연성가스의 분리 저장 및 유분 금지 기준을 지지하는 공식 안전 근거 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-665aa96d-358b-49b6-85ff-2a4959aeb072",
    "9b3f0ce7a26d3e4e4233bee9af544df5238d6d436eb35313006566f033a0c4a8",
    "safety",
    "missing_official_safety_source: 수소 충전용기의 도색을 주황색으로 정하는 적용 시점별 공식 용기 색상 기준 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-666809c5-1e60-4f90-af52-aaf84b843e31",
    "c901c3ce15b3f7393cb73f53bb2e3408cac001f26e03a8270ecf1e2115e2870a",
    "calculation",
    "missing_leaf_lesson_for_calculation: 제안된 SMAW 소주제 레슨이 존재하지 않아 40kVA÷200V=200A 계산을 직접 연결할 레슨 블록과 계산 근거를 묶을 수 없습니다.",
  ),
  publishCandidate({
    canonicalId: "wcbt-66ec4b00-f32e-4898-98e4-bb812a67e35c",
    contentDigest:
      "af74f3173011eef56a4ecd919b06a8c4d39b67da7d8329bce9481927ba9e459a",
    lessonBlockId: "definition",
    assertionText:
      "아세틸렌 용접장치의 배관과 부속기구에는 구리 또는 구리 함유량이 70% 이상인 합금을 사용하지 않습니다.",
    answerExplanation:
      "아세틸렌 용접장치의 배관과 부속기구에는 구리 또는 구리 함유량 70% 이상 합금을 사용하지 않습니다. 네 보기 가운데 이 금지 재료에 직접 해당하는 순구리관이 폭발성 화합물 생성 위험을 묻는 정답입니다.",
    solutionSteps: [
      "문제가 아세틸렌가스용 관에서 폭발성 화합물 생성 위험이 있는 재료를 묻는지 확인합니다.",
      "아세틸렌 배관·부속기구에는 구리와 구리 함유량 70% 이상 합금을 사용하지 않는다는 제한을 적용합니다.",
      "네 보기 중 직접 금지 대상인 순구리관을 선택합니다.",
    ],
    keyRule:
      "아세틸렌 배관과 부속기구에는 구리 또는 구리 함유량 70% 이상 합금을 사용하지 않습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "순구리관은 아세틸렌 용접장치의 배관·부속기구에 사용하지 않도록 명시된 구리 재료이므로 정답입니다.",
        plausibleReason:
          "구리가 일반 배관에서 널리 쓰이고 내식성이 있다는 사실 때문에 아세틸렌 배관에도 안전하다고 오해할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "아세틸렌과 접하는 배관 재료를 고를 때 구리 및 구리 함유량 70% 이상 합금을 먼저 배제합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "스테인리스강관은 제시된 레슨의 구리 및 고함량 구리합금 금지 대상에 해당하지 않습니다.",
        plausibleReason:
          "금속관이라는 공통점만 보고 모든 금속이 아세틸렌과 같은 위험 반응을 한다고 생각할 수 있습니다.",
        incorrectPoint:
          "이 문제에서 직접 금지된 재료는 구리이므로 스테인리스강관은 정답 판별 근거와 일치하지 않습니다.",
        keyRule:
          "재료 이름을 넓게 묶지 말고 구리 또는 구리 함유량 70% 이상인지 확인합니다.",
        differenceFromCorrect:
          "정답 순구리관은 직접 금지 재료이지만, 스테인리스강관은 해당 구리 제한에 속하지 않습니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "알루미늄합금관은 구리 또는 구리 함유량 70% 이상 합금이라는 금지 조건에 해당하지 않습니다.",
        plausibleReason:
          "합금이라는 말만 보고 고함량 구리합금 금지 규정을 모든 합금에 확대 적용할 수 있습니다.",
        incorrectPoint:
          "금지 기준은 합금 일반이 아니라 구리 함유량이 높은 합금이므로 이 보기는 정답이 아닙니다.",
        keyRule:
          "합금 여부가 아니라 금지 성분인 구리와 그 함유량 기준을 판별합니다.",
        differenceFromCorrect:
          "정답은 순구리 자체이지만, 이 보기는 알루미늄합금으로 제시되어 구리 금지 기준과 다릅니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "탄소강관은 제시된 아세틸렌 배관의 구리 및 고함량 구리합금 금지 대상이 아닙니다.",
        plausibleReason:
          "탄소강이 산화되거나 부식될 수 있다는 일반 특성을 폭발성 구리 화합물 문제와 혼동할 수 있습니다.",
        incorrectPoint:
          "탄소강의 일반 재료 특성은 이 문제에서 묻는 구리계 금지 조건을 충족하지 않습니다.",
        keyRule:
          "아세틸렌 배관의 특정 재료 위험 문제에서는 순구리와 고함량 구리합금을 식별합니다.",
        differenceFromCorrect:
          "정답 순구리관은 직접 금지 대상이고, 탄소강관은 해당 구리계 재료가 아닙니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-67c9f16f-e263-42bd-b3c5-e63836025fbe",
    "e76168ff22df136554cebc7a56ef86ae17327bde8656a1000c9eca9054e8b49c",
    "safety",
    "missing_official_safety_source: CO2 아크용접 400A 이상에서 차광도 14를 요구하는 전류별 공식 차광 표준 URL이 연결되지 않았습니다.",
  ),
  holdCandidate(
    "wcbt-67e3488a-e554-4546-a776-5464d75a2154",
    "35e754e773f1d6c5b14311aecfdfcca6c3cca825b59e773b603c96f5c93ddf07",
    "identification",
    "missing_direct_electrode_code_evidence: 현재 용접봉 레슨에 E4311의 가스실드계·자세·용입 특성을 직접 판정할 규격표가 연결되지 않았습니다.",
  ),
  publishCandidate({
    canonicalId: "wcbt-68ccd2ca-fecb-43b8-a631-c14971189e6f",
    contentDigest:
      "131b0a31aad2ff3b9486145d7e821054b215404525f80dc4419f418b37c13da8",
    lessonBlockId: "principle",
    assertionText:
      "용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 전도·낙하·충격을 막습니다. 용해아세틸렌 용기는 운반·보관·사용할 때 세워 고정합니다. 산소 밸브와 조정기 등 산소계통에는 기름·그리스를 묻히지 않고 밸브는 서서히 엽니다. 가스별 전용 호스·연결구를 사용하고 이름표 등으로 오접속을 방지하며, 누설은 비눗물 등 승인된 검지액으로 확인하고 불꽃을 사용하지 않습니다.",
    answerExplanation:
      "가스 누설은 비눗물 등 승인된 검지액으로 확인하고 불꽃을 사용해서는 안 됩니다. 따라서 아세틸렌 누설 부위에 점화라이터를 가까이해 확인한다는 2번 보기가 옳지 않은 취급방법입니다.",
    solutionSteps: [
      "문제가 용해아세틸렌의 안전 취급방법 중 옳지 않은 보기를 묻는지 확인합니다.",
      "누설검사는 비눗물 등 승인된 검지액을 사용하고 불꽃을 금지한다는 원칙을 적용합니다.",
      "점화라이터를 누설 부위에 가까이한다는 2번을 정답으로 선택합니다.",
    ],
    keyRule:
      "가스 누설은 비눗물 등 승인된 검지액으로 확인하며 성냥·라이터 같은 불꽃을 절대 사용하지 않습니다.",
    evidenceLessonBlocks: ["summary", "trap"],
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "용해아세틸렌 용기는 운반·보관·사용할 때 세워 고정해야 하므로 이 보기는 올바른 취급입니다.",
        plausibleReason:
          "용기 방향은 저장 때만 중요하고 사용할 때에는 눕혀도 된다고 생각할 수 있습니다.",
        incorrectPoint:
          "세워 사용하는 것은 직접 제시된 안전 원칙이므로 옳지 않은 보기가 아닙니다.",
        keyRule: "용해아세틸렌 용기는 모든 취급 단계에서 세워 고정합니다.",
        differenceFromCorrect:
          "정답은 누설검사에 불꽃을 사용하지만, 이 보기는 올바른 용기 자세를 유지합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "누설 부위에 점화라이터를 가까이하면 새어 나온 아세틸렌이 점화될 수 있으므로 금지된 불꽃 누설검사에 해당합니다.",
        plausibleReason:
          "불꽃이 흔들리면 누설 위치를 빠르게 찾을 수 있다는 작업 편의만 생각하면 위험성을 놓칠 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "아세틸렌 누설검사에는 불꽃이 아닌 비눗물 등 승인된 검지액을 사용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "동결된 밸브를 불꽃으로 가열하지 않고 제한된 온도의 온수로 서서히 녹이는 방법은 직접 화염을 피하는 안전한 조치입니다.",
        plausibleReason:
          "온수도 용기를 가열하므로 어떤 온수도 사용하면 안 된다고 오해할 수 있습니다.",
        incorrectPoint:
          "35℃ 이하 온수 사용은 불꽃이나 고온 가열을 피한 해빙 방법이므로 옳지 않은 보기가 아닙니다.",
        keyRule:
          "동결 부품은 화염으로 가열하지 말고 규정된 저온 온수로 서서히 해빙합니다.",
        differenceFromCorrect:
          "정답은 가연성 가스에 점화원을 접근시키지만, 이 보기는 직접 화염을 배제한 해빙 조치입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "용기에서 가스가 누출될 때 점화원을 제거하고 통풍이 잘되는 안전한 곳으로 옮기는 것은 가스 체류를 줄이는 조치입니다.",
        plausibleReason:
          "누출 용기는 움직이면 더 위험하므로 환기와 관계없이 그 자리에 두어야 한다고 생각할 수 있습니다.",
        incorrectPoint:
          "통풍이 확보된 곳에서 누출 가스의 축적을 막는 조치는 옳지 않은 취급방법이 아닙니다.",
        keyRule:
          "가스 누출 시 점화원을 차단하고 통풍을 확보해 가스가 머물지 않게 합니다.",
        differenceFromCorrect:
          "정답은 누설 확인에 점화라이터를 쓰지만, 이 보기는 누출 가스의 축적을 줄이는 대응입니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-6922ab0e-8efe-44d8-88d4-2936190714ec",
    contentDigest:
      "ce58dd42713b73fd00893eaf96d58a094493b4aa9a95a954310526aead67b17e",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "definition",
    assertionText:
      "자동전격방지기는 교류 아크용접기의 감전 방지를 목적으로 합니다.",
    officialSourceRef: KOSHA_ELECTRICAL_WELDING_GUIDE,
    answerExplanation:
      "아크용접기에 전격방지기를 설치하는 가장 큰 이유는 용접하지 않을 때 출력측 무부하전압을 낮춰 작업자를 감전 재해로부터 보호하는 것입니다. 효율·역률·과열 제어가 주목적이 아니므로 세 번째 보기가 정답입니다.",
    solutionSteps: [
      "보기가 작업자 보호와 용접기 성능 개선 중 어느 목적을 말하는지 구분합니다.",
      "전격방지기의 직접 기능이 무부하전압 저감인지 확인합니다.",
      "그 기능이 줄이는 재해인 작업자 감전을 선택합니다.",
    ],
    keyRule:
      "전격방지기의 주목적은 용접기 성능 향상이 아니라 무부하 상태의 작업자 감전 예방입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "용접기 효율은 입력전력 대비 유효 출력과 손실의 문제이며 전격방지기의 감전보호 목적과 다릅니다.",
        plausibleReason:
          "무부하 때 전압을 낮추면 불필요한 전력소모도 줄어 효율장치처럼 보일 수 있습니다.",
        incorrectPoint:
          "전격방지기는 용접 효율을 높이기 위한 장치가 아니라 노출 전압을 낮추는 보호장치입니다.",
        keyRule: "안전장치의 직접 보호대상과 부수적인 전기특성을 구분합니다.",
        differenceFromCorrect:
          "정답은 작업자 재해를 줄이지만 이 보기는 장비 에너지효율을 말합니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "역률 개선은 무효전력을 줄이는 전원 품질 문제이며 출력측 접촉 감전위험을 직접 제어하지 않습니다.",
        plausibleReason:
          "교류 용접기의 전기적 특성을 개선하는 장치라는 점에서 전격방지기와 혼동할 수 있습니다.",
        incorrectPoint:
          "전격방지기의 설치 목적은 역률 보상이 아니라 무부하전압 저감입니다.",
        keyRule:
          "역률 보상장치와 감전 방지를 위한 전압 저감장치를 기능으로 구분합니다.",
        differenceFromCorrect:
          "정답은 사람의 감전위험을 다루지만 이 보기는 전원 측 역률을 다룹니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "전격방지기는 아크가 꺼진 동안 홀더의 무부하전압을 낮춰 작업자에게 흐를 수 있는 감전전류 위험을 줄입니다.",
        plausibleReason:
          "장치 명칭의 ‘전격 방지’와 작업자 감전 재해 예방 목적이 직접 대응합니다.",
        incorrectPoint: null,
        keyRule:
          "자동전격방지기는 교류 아크용접 작업자의 감전 예방을 위한 장치입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope",
        rationale:
          "연속 사용 과열은 정격사용률과 냉각·과부하 보호의 문제이며 무부하 감전방지 기능과 다릅니다.",
        plausibleReason:
          "보호장치가 용접기를 자동 제어하므로 과열까지 막는 장치라고 생각할 수 있습니다.",
        incorrectPoint:
          "전격방지기는 장시간 용접 중의 열을 감지하거나 냉각하는 과열 보호장치가 아닙니다.",
        keyRule:
          "과열 보호는 사용률과 온도 제어, 전격 방지는 무부하전압 제어로 나눕니다.",
        differenceFromCorrect:
          "정답은 작업자 감전재해를 줄이지만 이 보기는 장비 열손상을 다룹니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-697ddc41-8c7f-4a06-a251-3dd3a0753f7d",
    "f4a702606b6b3376f9718a0b08102f5097e56bb4a00dfcb9d865c8f686450198",
    "identification",
    "missing_leaf_lesson_and_transfer_evidence: 제안된 SAW 소주제 레슨이 존재하지 않고 글로뷸러형 용적이행과 핀치효과 명칭을 직접 연결할 근거가 없습니다.",
  ),
  holdCandidate(
    "wcbt-69bf7747-7602-433d-beb5-34aa05b0bccc",
    "72e2a43912cb1490fc79fe0fcb6d9c87b7b6ee7d4c049a3c3c74f916cded3ce5",
    "identification",
    "missing_direct_composition_evidence: 현재 용접봉 레슨에 고셀룰로오스계 피복의 셀룰로오스 함량 20~30%를 직접 지지하는 규격·교재 문장이 없습니다.",
  ),
  holdCandidate(
    "wcbt-69fa37b5-9016-4e3f-9d57-7579a738c287",
    "9031793c2c97bb76c78a6708df8995f7dd6c6bbfaca01b6ade3aff5ae22c0e68",
    "safety",
    "missing_official_safety_source: 수소 용기 주황색 등 가스 종류별 용기 도색을 적용 시점과 함께 확인할 공식 기준 URL이 연결되지 않았습니다.",
  ),
] as const;

const APPROVED_REVIEW_IDS = new Set<string>();

const FORCED_HOLD_REASONS = new Map<string, string>([
  [
    "wcbt-5e808e7a-4a33-4f64-a868-65f133a9916a",
    "choice_distinction_incomplete: 현재 비파괴검사 레슨은 RT의 내부결함·기록성은 지지하지만 라미네이션·미세 표면균열과 투과도계·계조계·증감지를 포함한 네 보기 전체를 직접 판별하지 못합니다.",
  ],
  [
    "wcbt-6922ab0e-8efe-44d8-88d4-2936190714ec",
    "official_source_partial: 전격방지기의 감전방지 목적은 직접 확인되지만 효율·역률·연속사용 과열 방지라는 세 오답 기능을 동일 공식 근거가 모두 대조하지 못합니다.",
  ],
  [
    "wcbt-5f34198c-db99-4d01-84d7-670440718586",
    "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 차광도 수치 기준을 직접 뒷받침하지 않습니다.",
  ],
  [
    "wcbt-655a2b3d-b60a-4614-beb3-c1f426f0b40d",
    "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 주철 용제 성분 문항의 선택지별 판단을 직접 뒷받침하지 않습니다.",
  ],
  [
    "wcbt-66ec4b00-f32e-4898-98e4-bb812a67e35c",
    "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 용접기 입력 계산의 적용 조건을 직접 검증하지 않습니다.",
  ],
  [
    "wcbt-68ccd2ca-fecb-43b8-a631-c14971189e6f",
    "official_source_mismatch: 연결된 KOSHA 문서는 강선건조업 직업건강 가이드라인 보고서로 E4311 용접봉 분류의 선택지별 근거를 직접 제시하지 않습니다.",
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_08 =
  WELDING_CBT_ANSWER_REVIEWS_PART_08_AUTHORED.map((entry) => {
    const forcedHoldReason = FORCED_HOLD_REASONS.get(entry.canonicalId);
    if (forcedHoldReason) {
      return holdCandidate(
        entry.canonicalId,
        entry.contentDigest,
        entry.assessmentKind,
        forcedHoldReason,
      );
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
