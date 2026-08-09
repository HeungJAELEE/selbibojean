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

const AUTHOR = "codex-part-18-author";
const AUTHORED_AT = "2026-08-03T00:00:00.000Z";
const REVIEWER = "codex-part-18-reviewer";
const REVIEWED_AT = "2026-08-02T16:19:53.150Z";

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
  essentialRank?: number;
  essentialRationale?: string;
}) {
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

const WELDING_CBT_ANSWER_REVIEWS_PART_18_AUTHORED = [
  holdCandidate(
    "wcbt-e46283d7-7ceb-42c6-b9f0-7683f2de75a1",
    "c99b2a8412c5bd9d726fb8526f0a7b06749aaa28f31c0f95718060737b130f88",
    "safety",
    [
      "산소계통의 유분 금지는 기존 레슨과 일치하지만 현재 검토 묶음에는 KOSHA·법령 등 확인된 1차 안전 출처 URL이 연결되어 있지 않습니다.",
      "공식 안전 근거를 연결하기 전에는 보기별 취급 절차를 공개 풀이로 승격하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e4813b7a-2b14-4acf-8f30-22abdc152a54",
    "e45034929a86696d7ca2cc0627712551899820f8b2cd2c479623eb72297ec60d",
    "safety",
    [
      "압력조정기 취급과 산소계통 유분 금지는 안전 절차이므로 검증된 KOSHA·법령 1차 출처가 필요합니다.",
      "현재 레슨 문장만으로는 압력계 설치 방향과 밸브 개방 절차의 전체 보기를 공식 안전 근거로 대조할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e5699573-06f7-4875-ad2f-cede0184ab99",
    "1ed96c4b42102c35765904560c5ff0810117caa192ae98231f1c4cbee2d26766",
    "calculation",
    [
      "기존 레슨에 산소용기 대기압 환산식 V=용기내용적×충전압력의 직접 공식과 적용 전제가 없습니다.",
      "46.7×150=7005리터 계산을 뒷받침하는 계산 유도 근거를 레슨에 연결하기 전에는 공개 풀이로 승격하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e5eb93a6-1f16-4d8c-ac02-1c4ddc75a4df",
    "f7b72b38003df52d4cbfe6c07b342577b00dc1c2e8a9a7220db98b8ae9b8b979",
    "definition",
    [
      "전원 레슨에는 정류기형 직류용접기의 소음·점검·취급 난이도·맥동 직류 특성이 직접 정리되어 있지 않습니다.",
      "정답 보기인 '사용이나 취급이 복잡하고 가격이 비싸다'를 배제할 직접 교재 근거가 없어 레슨 보강 전까지 보류합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e6235e1b-7977-454b-8d2c-b9028bcc494e",
    "0e59e1dc465403ee8003e4a15076f4b876281ecd44e805933c30c50e1af087fe",
    "safety",
    [
      "산소용기와 가연성가스의 분리 저장은 안전관리 사항이므로 확인된 KOSHA·법령 1차 출처가 필요합니다.",
      "현재 검토 데이터에 분리 저장 기준의 공식 URL이 없어 보기별 안전성을 공개 풀이로 확정하지 않습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-e630bc06-fe6f-4eb4-9f04-77e97ceb8d4a",
    essentialRank: 1,
    essentialRationale:
      "피복제의 차폐·아크 안정·정련 기능과 비기능을 직접 구분하는 대표 문항입니다.",
    contentDigest:
      "0f3d011b02dc78fdfa27275e74d47d83b992f69ee95be474ddb2cdd4ad4a1c82",
    assessmentKind: "application",
    lessonId: "lesson-welding-foundation-electrodes",
    lessonBlockId: "definition",
    assertionText:
      "피복제는 아크 안정, 보호가스와 슬래그 형성, 탈산·정련, 합금원소 보충과 비드 형상 조절에 관여합니다.",
    answerExplanation:
      "피복제는 아크를 안정시키고 보호가스·슬래그를 형성해 용융금속의 산화와 질화를 줄이며, 탈산·정련과 합금 보충으로 용착금속의 성질을 조절합니다. 따라서 '전기절연을 방지한다'는 설명은 피복제의 역할에 해당하지 않습니다.",
    solutionSteps: [
      "각 보기를 피복제의 차폐·아크 안정·탈산·정련·합금 보충 기능과 하나씩 대조합니다.",
      "산화·질화 방지, 아크 안정, 용착금속 성질 개선은 직접 기능에 포함됩니다.",
      "기능 목록에 없는 전기절연 방지를 역할이 아닌 보기로 선택합니다.",
    ],
    keyRule:
      "피복제의 핵심은 아크 안정과 용융금속 차폐·정련이며 전기절연 방지는 목적이 아닙니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "피복제가 전기절연을 방지한다는 기능은 차폐·슬래그 형성·탈산·아크 안정 역할에 포함되지 않으므로 역할이 아닌 정답입니다.",
        plausibleReason:
          "피복이라는 말에서 전기 절연재를 연상하면 실제 용접 피복제의 야금적 기능과 혼동하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "용접봉 피복제는 절연 방지재가 아니라 아크와 용융금속을 보호·정련하는 재료입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "피복제에서 생긴 보호가스와 슬래그는 대기와의 접촉을 줄여 용융금속의 산화와 질화를 억제합니다.",
        plausibleReason:
          "산화·질화가 피복제 자체의 화학반응이라고만 보면 차폐 기능과 분리해 오판할 수 있습니다.",
        incorrectPoint:
          "산화와 질화 방지는 피복제의 대표적인 차폐 기능이므로 역할이 아닌 보기가 아닙니다.",
        keyRule:
          "보호가스와 슬래그가 용융금속을 대기로부터 가리는 것이 피복제의 핵심 역할입니다.",
        differenceFromCorrect:
          "정답 보기는 실제 기능 목록에 없지만 이 보기는 보호가스·슬래그 형성으로 직접 설명됩니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "피복 성분은 이온화를 돕고 아크가 끊기지 않도록 해 아크 안정성을 높이는 역할을 합니다.",
        plausibleReason:
          "아크 안정은 용접기 전원만 결정한다고 생각하면 피복 성분의 이온화 작용을 놓칠 수 있습니다.",
        incorrectPoint:
          "아크 안정성 향상은 피복제의 직접 기능이므로 역할이 아닌 답으로 고를 수 없습니다.",
        keyRule:
          "피복제의 아크 안정 작용은 점화와 아크 유지가 쉬워지는 방향으로 나타납니다.",
        differenceFromCorrect:
          "정답과 달리 이 보기는 레슨의 '아크 안정' 기능에 명시적으로 포함됩니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "탈산·정련과 합금원소 보충은 용착금속의 조직과 기계적 성질을 개선하는 데 관여합니다.",
        plausibleReason:
          "기계적 성질은 심선과 모재만 좌우한다고 단순화하면 피복제의 정련·합금 보충을 빠뜨리게 됩니다.",
        incorrectPoint:
          "용착금속의 기계적 성질 개선은 피복제의 야금적 역할이므로 오답 보기입니다.",
        keyRule:
          "피복제는 차폐뿐 아니라 탈산·정련과 합금 보충으로 용착금속 성질에도 영향을 줍니다.",
        differenceFromCorrect:
          "정답은 피복제와 무관한 기능이고 이 보기는 정련·합금 보충이라는 직접 근거가 있습니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-e77fd21a-737f-4407-a9fd-7fbcfae27f8d",
    "4df0d1676b0a81d82db76b7345071f95a65fca89843dbd84083f7b31d486e1f8",
    "identification",
    [
      "가스절단 레슨에 수소·메탄·프로판·아세틸렌의 체적당 발열량 비교표와 기준 상태가 없습니다.",
      "수소가 가장 낮다는 수치 근거를 직접 연결할 수 없어 연료가스 발열량 표 보강 전까지 보류합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e785ee2b-56ac-45e1-8ed0-ddb4abb9af47",
    "65aec8c0ed23d7f75bdba5f3fd5b2ec9bf26f48a3b735bcfc5b11bea919264be",
    "identification",
    [
      "전원 레슨에는 탭전환형 교류용접기의 권선 탭에 따른 전류 조정 구조가 직접 정리되어 있지 않습니다.",
      "무부하전압 특성과 형식별 조정 원리를 연결하는 구조 설명이 없어 장치 식별 풀이를 보류합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e7d0a421-44c3-4f07-b260-94b85969805b",
    "85cb4cd85b20168b6247e3e1525a960f073a561c657912de7614cc2420223020",
    "safety",
    [
      "고압가스 용기 도색은 법령·표준의 적용 시점과 가스 종류를 확인해야 하는 안전 표지 사항입니다.",
      "수소 용기 색상 등 보기 전체를 대조할 최신 공식 1차 출처 URL이 없어 공개 풀이로 승격하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e8035ef5-ce6e-49f8-acd4-45aa6c0d916d",
    "af2e5a26bbd9dd9b24a53d07b8b784861344c607a18160910cecba31a202ab84",
    "safety",
    [
      "송기식 호흡보호구의 명칭과 적용 조건은 산업안전 보호구 기준에 해당하므로 검증된 KOSHA·법령 출처가 필요합니다.",
      "현재 레슨에는 호스마스크와 방진·방독마스크의 공기 공급 방식 비교가 직접 포함되어 있지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e82f878f-d67c-47cc-9afe-5f06f05207e4",
    "f5d700f9d07f0e7ffc0628a87ff646920a5dd36c0dca5007a11ca30f5d83a33d",
    "safety",
    [
      "안전·보건표지 색채는 산업안전보건법령의 표지 종류별 색상 규정과 직접 대조해야 합니다.",
      "화학물질 유해·위험 경고의 빨간색 판정을 뒷받침할 검증된 공식 법령 URL이 현재 검토 묶음에 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e84ebfbd-e848-48e5-85f2-b66383042a0c",
    "26fb03ea16a635dddb9de5548c4515b183677705875fa87beb9922b773e0c1e7",
    "identification",
    [
      "용접봉 홀더 200호와 케이블 도체 공칭단면적 38제곱밀리미터의 대응표가 기존 레슨에 없습니다.",
      "규격 번호별 허용 케이블 단면적을 확인할 표준 근거를 연결하기 전에는 정답 수치를 공개하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e9180f4c-f793-453d-a08e-e6e55c993354",
    "668a19a90b7c05cafc0d561134f0632305ec30aa8ca020545a1f7ae70769b180",
    "calculation",
    [
      "가스용접 장치 레슨에 산소용기 대기압 환산식과 압력 단위 적용 전제가 직접 제시되어 있지 않습니다.",
      "33.7×120=4044리터 계산을 설명할 계산 유도 근거가 없어 공식 보강 전까지 보류합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-e95eb7e9-5395-47d5-a327-deea591263c2",
    "53fc06fce5a9cf14d1cf26f9793a2ed61cff120cb4fb4e79d894bc3eb264b925",
    "identification",
    [
      "압접 레슨은 압력에 의한 결합을 설명하지만 냉간압접의 '상온·국부 소성변형' 조건을 직접 정의하지 않습니다.",
      "가스압접·초음파용접과 구분하는 냉간압접 고유 정의를 보강하기 전에는 식별 풀이를 승격하지 않습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-ea9d7b6f-0e26-42e7-bec6-4a1af51504ce",
    contentDigest:
      "b583ac73977ff6f03e3f26549079fd0e6d418f416605d0cd5090177155c65a2e",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "principle",
      assertionText:
        "교류 아크용접 작업자는 절연장갑을 착용하고 손상이 없는 절연형 용접봉 홀더를 사용합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#principle",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-ea9d7b6f-0e26-42e7-bec6-4a1af51504ce",
        },
      ],
    },
    answerExplanation:
      "아크용접 중 용접봉을 맨손으로 갈아 끼우면 절연장갑 없이 홀더와 전극에 접촉해 감전 경로를 만들 수 있으므로 전격 예방 방법이 아닙니다. 전격방지기 부착, 용접기 내부 임의 접촉 금지, 절연성이 좋은 장갑 사용은 각각 전압·접촉·보호구 측면의 예방조치이므로 틀린 보기는 두 번째입니다.",
    solutionSteps: [
      "전격 예방 방법 중 틀린 행동을 묻는 부정형임을 표시합니다.",
      "네 보기를 무부하전압 저감·충전부 접근 제한·절연 보호 원칙과 대조합니다.",
      "절연 없이 맨손으로 전극을 교체하는 두 번째 보기를 고릅니다.",
    ],
    keyRule:
      "용접봉은 맨손으로 교체하지 않고 절연장갑과 손상 없는 절연형 홀더를 사용합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "전격방지기 부착은 아크가 없을 때 용접기 출력측 무부하전압을 낮추는 유효한 감전 예방조치입니다.",
        plausibleReason:
          "장치가 모든 감전 원인을 제거하지 못하므로 설치 자체도 불완전한 방법이라고 오해할 수 있습니다.",
        incorrectPoint:
          "복수 대책이 필요하다는 사실은 전격방지기의 전압 저감 기능을 부정하지 않습니다.",
        keyRule:
          "전격방지장치는 절연·접지·보호구와 병행하는 공학적 감전 방호입니다.",
        differenceFromCorrect:
          "정답은 맨손 접촉으로 위험을 키우지만 이 보기는 출력 전압 위험을 줄입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "용접홀더의 용접봉을 맨손으로 갈아 끼우면 절연 보호가 없어 전격 위험을 높이므로 예방 방법으로 틀렸습니다.",
        plausibleReason:
          "아크가 꺼진 순간에는 전원이 완전히 사라진다고 생각해 짧은 맨손 접촉을 허용하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "무부하 상태에도 전압이 존재할 수 있으므로 전극 교체 시 손의 절연을 유지합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "용접기 내부에 함부로 손을 대지 않는 것은 충전부와 고전압 부품의 직접 접촉을 피하는 예방행동입니다.",
        plausibleReason:
          "외함 내부가 작업자에게도 일반 점검 영역이라고 생각하면 이 제한을 불필요하게 볼 수 있습니다.",
        incorrectPoint:
          "내부 접근 제한은 노출 가능성을 낮추므로 전격 예방과 같은 방향의 조치입니다.",
        keyRule:
          "전기설비 내부는 전원 격리와 적정 자격·절차 없이 접근하지 않습니다.",
        differenceFromCorrect:
          "정답은 전극을 맨손으로 다루지만 이 보기는 위험한 내부 접촉을 피합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "절연성이 좋은 장갑은 손을 통한 전류 경로의 직접 접촉 가능성을 줄이는 개인보호구입니다.",
        plausibleReason:
          "장갑이 전원 차단을 대신하지 못한다는 원칙을 장갑이 쓸모없다는 뜻으로 오해할 수 있습니다.",
        incorrectPoint:
          "보호구 단독 사용은 충분하지 않지만 손상 없는 절연장갑은 필요한 보조 예방조치입니다.",
        keyRule:
          "절연장갑은 전격방지장치와 손상 없는 홀더 등 다른 방호수단과 함께 사용합니다.",
        differenceFromCorrect:
          "정답은 절연을 제거한 맨손 접촉이고 이 보기는 손의 절연을 보강합니다.",
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
  {
    canonicalId: "wcbt-eae3f4e9-688f-43f2-b3e8-bf68969e4331",
    contentDigest:
      "b0d354f0f9185885de8960d629c905bd4d56d7984c3294760ae52a19a0f40e60",
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
          ref: "wcbt-eae3f4e9-688f-43f2-b3e8-bf68969e4331",
        },
      ],
    },
    answerExplanation:
      "교류 아크용접기의 감전사고를 줄이기 위해 설치하는 것은 아크가 꺼진 뒤 출력측 무부하전압을 낮추는 자동전격방지장치입니다. 2차권선은 전원 구성요소이고, 원격제어장치는 조작 위치를 바꾸며, 핫 스타트 장치는 아크 시동을 돕는 기능이므로 첫 번째 보기가 정답입니다.",
    solutionSteps: [
      "지문이 교류 아크용접기의 감전사고 방지용 설치장치를 묻는다고 확인합니다.",
      "각 장치가 무부하전압 저감·권선·원격조작·아크시동 중 어느 기능인지 구분합니다.",
      "출력측 무부하전압을 낮추는 전격방지 장치를 선택합니다.",
    ],
    keyRule:
      "자동전격방지장치는 아크 소멸 뒤 교류 용접기의 출력측 무부하전압을 안전 수준으로 낮춥니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "전격방지 장치는 아크가 없을 때 출력측 무부하전압을 낮추므로 감전사고 방지 목적과 직접 일치합니다.",
        plausibleReason:
          "장치 이름과 실제 무부하전압 저감 기능이 모두 지문의 요구와 맞습니다.",
        incorrectPoint: null,
        keyRule:
          "감전방지 설치장치는 자동전격방지장치이며 아크 소멸 뒤 전압을 낮춥니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "missing_condition",
        rationale:
          "2차권선은 용접변압기에서 출력 전력을 전달하는 부분으로 아크 소멸을 감지해 전압을 낮추는 안전장치가 아닙니다.",
        plausibleReason:
          "용접기 2차측에서 감전 위험이 생기므로 2차권선 자체가 방지장치라고 연상할 수 있습니다.",
        incorrectPoint:
          "권선에는 무부하 상태에서 출력전압을 자동 저감하는 동작 조건이 없습니다.",
        keyRule:
          "출력 구성부품과 출력 위험을 제어하는 안전장치는 역할이 다릅니다.",
        differenceFromCorrect:
          "정답은 무부하전압을 능동적으로 낮추지만 2차권선은 전력을 전달합니다.",
      },
      {
        choiceIndex: 2,
        relation: "out_of_scope",
        rationale:
          "원격제어 장치는 작업 위치에서 전류 등 설정을 조작하기 위한 장치로 감전방지 목적의 무부하전압 저감장치가 아닙니다.",
        plausibleReason:
          "용접기 본체와 거리를 두게 해 접촉 위험도 줄어든다고 생각할 수 있습니다.",
        incorrectPoint:
          "원격 조작 편의와 아크 소멸 후 출력 전압을 자동으로 낮추는 기능은 별개입니다.",
        keyRule:
          "지문은 간접적 거리 확보가 아니라 전격을 막도록 설계된 전용장치를 묻습니다.",
        differenceFromCorrect:
          "자동전격방지장치는 출력전압을 제어하지만 원격제어장치는 조작 위치를 바꿉니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "핫 스타트 장치는 아크 시작 순간의 점화를 돕는 기능으로 용접하지 않을 때 무부하전압을 낮추는 장치가 아닙니다.",
        plausibleReason:
          "시작 순간 전기상태를 제어하므로 안전장치라고 오해할 수 있습니다.",
        incorrectPoint:
          "아크 시동 보조는 작업성 기능이며 감전방지용 전압 저감 기능과 방향이 다릅니다.",
        keyRule:
          "핫 스타트는 점화 보조, 자동전격방지장치는 무부하전압 저감으로 구분합니다.",
        differenceFromCorrect:
          "정답은 비용접 시 전압을 낮추지만 핫 스타트는 용접 개시를 쉽게 합니다.",
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
    "wcbt-ebf2676a-c3bf-4638-aab9-cccf1a5e9b9e",
    "e7b1631c4c481c225c8473b874234c86955e5f208361ce19a5e9e6badc951502",
    "safety",
    [
      "홀더·용접봉 맨손 취급 금지와 습윤 보호구 사용 금지는 전격 예방 안전기준입니다.",
      "KOSHA·법령의 검증된 1차 출처가 연결되지 않아 보기별 안전 풀이를 공개하지 않습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-edacdead-4c69-4bdf-a2bb-0712e26e48c2",
    "3b684546671070d158b214d8954a191441e0efcd4b6b7ca0963b7204181c5fb7",
    "application",
    [
      "납땜 레슨에 18-8 스테인리스강의 모재 가열온도 500~700도 범위가 직접 수록되어 있지 않습니다.",
      "합금·납재·플럭스 조건에 따른 온도 범위를 확인할 표준 또는 교재 표가 없어 수치 정답을 보류합니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-edfc5be7-c962-4213-a46d-1d207583c478",
    essentialRank: 1,
    essentialRationale:
      "변형을 구속하면 잔류응력이 커질 수 있다는 상충 원리를 직접 묻는 문항입니다.",
    contentDigest:
      "d74b8a8139a92ace038fa96d5065c960951f97ccb75507db2d4303e48f3dc3ae",
    assessmentKind: "principle",
    lessonId: "lesson-welding-foundation-deformation",
    lessonBlockId: "structure",
    assertionText:
      "강한 구속은 작업 중 변형을 줄일 수 있지만 잔류응력과 균열 위험을 키울 수 있어 무조건적인 해결책이 아닙니다.",
    answerExplanation:
      "부재를 강하게 구속하면 용접 중 자유로운 변형은 억제되지만 냉각 수축도 억제되어 내부에 더 큰 탄성·소성 구속응력이 남습니다. 따라서 구속용접은 변형을 줄이는 대신 잔류응력을 크게 만드는 방향입니다.",
    solutionSteps: [
      "구속이 작업 중 형상 변화와 냉각 수축에 각각 어떤 영향을 주는지 나누어 봅니다.",
      "형상 변화는 줄지만 수축이 자유롭지 못해 내부 응력이 축적된다는 점을 확인합니다.",
      "잔류응력이 크게 발생한다는 보기를 선택합니다.",
    ],
    keyRule:
      "구속은 변형 억제와 잔류응력 감소를 동시에 보장하지 않으며 강한 구속은 잔류응력을 키울 수 있습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts",
        rationale:
          "구속은 냉각 수축을 막아 내부 응력을 축적하므로 잔류응력이 작게 발생한다는 설명은 반대입니다.",
        plausibleReason:
          "눈에 보이는 변형이 줄어든 것을 내부 응력까지 줄어든 것으로 동일시하면 이 보기를 고르기 쉽습니다.",
        incorrectPoint:
          "외형 변형 억제와 내부 잔류응력 감소는 같은 결과가 아니며 강한 구속은 후자를 키울 수 있습니다.",
        keyRule:
          "변형이 작게 보인다는 사실만으로 잔류응력도 작다고 판단하면 안 됩니다.",
        differenceFromCorrect:
          "정답은 구속 때문에 수축응력이 축적된다고 보지만 이 보기는 응력이 감소한다고 거꾸로 설명합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "강한 구속은 작업 중 변형을 억제하는 대신 냉각 수축을 방해해 잔류응력을 크게 만드는 방향이므로 정답입니다.",
        plausibleReason:
          "변형과 응력의 교환관계를 이해하면 구속이 항상 유리하지 않다는 점에서 바로 판별할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "구속이 강할수록 자유수축이 어려워져 잔류응력이 커질 수 있다는 관계를 적용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "구속 조건은 냉각 중 수축 자유도를 바꾸므로 잔류응력에 영향을 주며 변함없다고 볼 수 없습니다.",
        plausibleReason:
          "잔류응력을 재료와 입열만의 결과로 보면 지그·고정구에 의한 구속 효과를 빠뜨리게 됩니다.",
        incorrectPoint:
          "구속 정도가 잔류응력 형성의 주요 조건인데도 변화가 없다고 한 점이 틀렸습니다.",
        keyRule:
          "잔류응력은 열이력뿐 아니라 부재가 얼마나 자유롭게 수축할 수 있는지에도 좌우됩니다.",
        differenceFromCorrect:
          "정답은 구속으로 응력이 증가한다고 판단하지만 이 보기는 구속 효과 자체를 부정합니다.",
      },
      {
        choiceIndex: 3,
        relation: "contradicts",
        rationale:
          "구속용접은 변형과 잔류응력의 분배를 직접 바꾸므로 둘이 관계없다는 설명은 틀립니다.",
        plausibleReason:
          "구속을 단순한 치수 고정 수단으로만 보면 금속 내부의 수축응력과 연결하지 못할 수 있습니다.",
        incorrectPoint:
          "구속이 냉각 수축을 제한하므로 잔류응력과 명확한 관계가 있다는 점을 누락했습니다.",
        keyRule:
          "고정구와 구속 조건은 용접변형 대책인 동시에 잔류응력 증가 요인이 될 수 있습니다.",
        differenceFromCorrect:
          "정답은 구속과 잔류응력의 인과관계를 인정하지만 이 보기는 관계가 없다고 단정합니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-eed26a0a-e7e0-40b4-92ad-768820b0448c",
    essentialRank: 2,
    essentialRationale:
      "비접촉·저변형·정밀가공 단서로 레이저용접 특성을 판별하는 문항입니다.",
    contentDigest:
      "2939837b7672c0caaa05c00f897ec5a322f2f144c58bce7c8e47084b5f0cbae3",
    assessmentKind: "identification",
    lessonId: "lesson-welding-special-processes",
    lessonBlockId: "principle",
    assertionText:
      "전자빔은 고속 전자의 운동에너지를 열로 바꾸며 일반적으로 진공 조건이 중요하고, 레이저는 집속한 빛으로 높은 에너지밀도를 얻습니다.",
    answerExplanation:
      "레이저용접은 집속한 빛 에너지를 모재에 전달하는 비접촉식 공정입니다. 열원이 물리적으로 모재와 접촉해야 하는 방식이 아니므로 '접촉식 용접방법이다'가 틀린 설명입니다.",
    solutionSteps: [
      "레이저용접의 에너지원이 집속한 빛이라는 점을 먼저 확인합니다.",
      "빛 에너지 전달에는 전극이나 공구의 기계적 접촉이 필요하지 않음을 적용합니다.",
      "접촉식이라는 보기를 레이저용접 설명으로 틀린 항목으로 고릅니다.",
    ],
    keyRule:
      "레이저용접은 집속광의 높은 에너지밀도를 이용하는 비접촉식 열원 공정입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "레이저는 집속한 빛을 열원으로 사용하므로 모재와 도구가 접촉해야 하는 용접법이 아니어서 틀린 설명입니다.",
        plausibleReason:
          "레이저 헤드가 용접부 가까이 이동하는 모습을 기계적 접촉으로 오해하면 이 보기가 맞아 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "빛을 전달하는 광학계의 접근과 공구가 모재에 접촉하는 것은 서로 다른 개념입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "집속광은 좁은 영역에 높은 에너지밀도를 주므로 열영향부와 전체 열변형을 작게 제어하는 데 유리합니다.",
        plausibleReason:
          "높은 에너지는 곧 넓은 가열이라고 생각하면 레이저의 국부 집속 특성을 놓칠 수 있습니다.",
        incorrectPoint:
          "열변형이 비교적 작다는 것은 레이저용접의 대표 장점이므로 틀린 설명이 아닙니다.",
        keyRule:
          "레이저의 높은 에너지밀도는 넓은 가열이 아니라 빠르고 국부적인 입열을 가능하게 합니다.",
        differenceFromCorrect:
          "정답은 열원 전달 방식을 잘못 말하지만 이 보기는 국부 입열에 따른 장점을 설명합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "레이저의 정밀한 국부 가열과 공정 제어는 조건을 맞춘 여러 이종재 조합의 접합에 활용될 수 있습니다.",
        plausibleReason:
          "이종금속은 용융점과 열팽창 차이가 커서 전부 불가능하다고 과도하게 일반화하기 쉽습니다.",
        incorrectPoint:
          "이종금속 용접 가능성은 공정 장점에 해당하며 무조건 불가능하다고 볼 수 없습니다.",
        keyRule:
          "이종재 용접은 재료 조합과 조건의 제약은 있지만 레이저 공정의 적용 가능 범위에 포함됩니다.",
        differenceFromCorrect:
          "정답은 접촉 여부를 반대로 말한 것이고 이 보기는 조건부 적용 가능한 재료 범위를 말합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "작은 초점과 정밀한 에너지 제어가 가능하므로 미세부품과 정밀 이음에 레이저용접을 적용할 수 있습니다.",
        plausibleReason:
          "산업용 레이저의 높은 출력만 떠올리면 미세가공에 쓰이는 집속·제어 능력을 놓칠 수 있습니다.",
        incorrectPoint:
          "미세하고 정밀한 용접이 가능하다는 설명은 레이저용접의 특성과 일치합니다.",
        keyRule:
          "레이저 공정은 출력 크기뿐 아니라 초점 크기와 조사시간을 정밀하게 제어할 수 있습니다.",
        differenceFromCorrect:
          "정답은 비접촉 공정을 접촉식이라 했지만 이 보기는 집속광의 정밀가공 장점을 정확히 말합니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-ef348cef-a492-4e38-bce0-0e88807a2947",
    "a28441d3e5a3e485d0e49264f72b73010e58fe75f200842122ca11d19b71995b",
    "safety",
    [
      "실내 용접작업의 환기설비와 흄 노출 관리는 산업안전 보건조치이므로 KOSHA·법령 1차 출처가 필요합니다.",
      "현재 레슨 내용과 정답 방향은 일치하지만 검증된 공식 안전 URL이 없어 공개 풀이 승격을 보류합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-efa35849-446d-46ff-bbfb-67a9c20befd4",
    "0ab1effba506e90013470815a3ac5cedd7a033b1a4792972a8625591eb21c5bc",
    "application",
    [
      "용접봉 레슨에 위빙 폭을 용접봉 지름의 2~3배로 제한하는 직접 수치 기준이 없습니다.",
      "공정·자세별 적용 조건을 포함한 교재 또는 절차 근거를 연결하기 전에는 수치 풀이를 승격하지 않습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-f010c9fd-72f1-46a1-9d54-3240600fb2e7",
    contentDigest:
      "2d38c8a0a62ed76043e323533d2f5b6f467e868b5aedd80e43a7f81aa775b0c8",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "structure",
      assertionText:
        "공기 중 수소의 폭발범위는 부피 기준 약 4~75%로 넓으므로, 빈 드럼이나 탱크도 잔류 가스·증기가 있으면 ‘비어 있다’는 사실만으로 안전하지 않습니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-fire#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/kosha/data/seriousAccident.do?articleNo=274084&attachNo=146749&mode=download",
        },
        {
          kind: "source_question",
          ref: "wcbt-f010c9fd-72f1-46a1-9d54-3240600fb2e7",
        },
      ],
    },
    answerExplanation:
      "공기 중 수소의 폭발범위는 부피 기준 약 4~75%입니다. 네 보기 모두 하한이 4%이므로 상한이 75%인 네 번째 보기가 정확합니다.",
    solutionSteps: [
      "지문이 수소의 공기 중 폭발범위를 묻는 수치형임을 확인합니다.",
      "공식 범위의 하한 4%와 상한 75%를 각각 확인합니다.",
      "두 경계값을 모두 포함한 4~75%를 선택합니다.",
    ],
    keyRule:
      "수소의 공기 중 폭발범위는 부피 기준 약 4~75%입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "4~5%는 공식 하한 부근만 포함하고 폭발 가능한 넓은 상한 영역을 누락합니다.",
        plausibleReason:
          "폭발범위가 매우 좁아 하한을 조금 넘으면 곧 상한에 도달한다고 생각할 수 있습니다.",
        incorrectPoint:
          "수소의 폭발상한은 5%가 아니라 약 75%이므로 범위가 지나치게 좁습니다.",
        keyRule:
          "수소는 폭발하한 4%뿐 아니라 상한 75%까지 함께 기억합니다.",
        differenceFromCorrect:
          "정답은 상한 75%까지 포함하지만, 이 보기는 상한을 5%로 잘못 줄였습니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "4~15%는 하한은 맞지만 수소가 폭발할 수 있는 15% 초과의 농도 구간을 제외합니다.",
        plausibleReason:
          "다른 가연성 가스의 비교적 좁은 폭발범위를 수소에 적용하면 15%가 그럴듯해 보입니다.",
        incorrectPoint:
          "수소의 상한은 약 75%이므로 15%로 제한한 범위는 틀립니다.",
        keyRule:
          "수소는 다른 연료가스보다 폭발범위가 매우 넓다는 점을 함께 기억합니다.",
        differenceFromCorrect:
          "정답은 상한 75%이고, 이 보기는 상한을 15%로 낮췄습니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "4~35% 역시 하한만 맞고 공식 상한인 약 75%까지의 폭발 가능 구간을 포함하지 못합니다.",
        plausibleReason:
          "35%도 매우 높은 농도라 넓은 폭발범위를 충분히 나타낸다고 느낄 수 있습니다.",
        incorrectPoint:
          "수소는 35%를 넘어 약 75%까지 폭발 가능한 혼합기가 형성됩니다.",
        keyRule:
          "하한만 같은 보기에서는 상한 75%를 정확히 대조합니다.",
        differenceFromCorrect:
          "정답은 상한 75%를 사용하지만, 이 보기는 35%에서 범위를 잘못 끝냅니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "4~75%는 공기 중 수소의 폭발하한과 폭발상한을 모두 정확히 나타냅니다.",
        plausibleReason:
          "상한 75%가 지나치게 높아 산소가 부족한 고농도에서는 불가능할 것처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "공기 중 수소는 부피 기준 약 4%에서 75% 사이에서 폭발할 수 있습니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: 1,
    essentialRationale: "수소의 폭발하한과 상한을 함께 기억해 4~75% 폭발범위를 식별하는 안전 수치 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-f035c47d-d873-4913-9ab5-c59531e934e8",
    "41fe0a716839f88c4024b7fcdea39536552fba78d5bd7aaebff0e2e0c09553c0",
    "safety",
    [
      "압력조정기의 조정압력·사용압력 차이와 빙결 방지 조건은 가스설비 안전 성능 기준입니다.",
      "보기 전체를 대조할 공식 규격 또는 KOSHA 1차 출처가 현재 연결되지 않아 공개 풀이를 보류합니다.",
    ],
  ),
  holdCandidate(
    "wcbt-f06c129c-e5ec-4723-9b0d-75464898dafb",
    "c64c9d372405ea4d117e91dfe5dc579d1b38036d1160ef01d00d8053f8078f03",
    "principle",
    [
      "압접 레슨에는 냉간압접의 가공경화·공구 단순성·전기저항 특성이 직접 정리되어 있지 않습니다.",
      "열영향이 없다는 냉간압접 고유 조건과 각 보기의 기술적 근거를 보강하기 전에는 공개 풀이로 승격하지 않습니다.",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-f11e5087-d570-483e-8bdf-dafcfee28744",
    contentDigest:
      "c999c0947ecf913e0fab588542dc21b4219f6d8ad80a30fafa8059e5304af32a",
    assessmentKind: "identification",
    lessonId: "lesson-welding-inspection-ndt",
    lessonBlockId: "principle",
    assertionText:
      "RT는 방사선 투과량 차이를 영상으로 만들고, UT는 초음파가 경계면에서 반사되는 신호를 분석합니다.",
    answerExplanation:
      "감마선이나 엑스선을 대상물에 투과시킨 뒤 투과량 차이를 필름 또는 영상으로 판독하는 방법은 방사선투과검사(RT)입니다. 초음파·침투·와전류 검사는 사용하는 물리 현상과 표시 방식이 다릅니다.",
    solutionSteps: [
      "지문에서 감마선·엑스선이라는 방사선원과 투과라는 작용을 표시합니다.",
      "필름에 나타난 상으로 내부 결함을 판독한다는 기록 방식을 확인합니다.",
      "방사선 투과량 차이를 영상화하는 RT를 선택합니다.",
    ],
    keyRule:
      "감마선·엑스선의 투과량 차이를 필름이나 영상으로 판독하면 방사선투과검사입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "초음파탐상검사는 탐촉자에서 보낸 초음파가 결함 경계에서 반사되는 신호를 분석하며 방사선 필름을 사용하지 않습니다.",
        plausibleReason:
          "두 검사 모두 내부 결함 검사에 쓰이므로 에너지원과 표시 방식을 보지 않으면 혼동하기 쉽습니다.",
        incorrectPoint:
          "지문은 초음파 반사 신호가 아니라 감마선·엑스선 투과와 필름 상을 제시했습니다.",
        keyRule:
          "UT는 음파 반사 신호이고 RT는 방사선 투과 영상이라는 차이로 구분합니다.",
        differenceFromCorrect:
          "정답은 방사선 투과 영상을 사용하지만 이 보기는 초음파의 반사파를 사용합니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "침투탐상검사는 표면에 열린 결함으로 침투액이 스며드는 현상을 이용하며 내부 투과 영상을 만들지 않습니다.",
        plausibleReason:
          "검사 후 눈에 보이는 지시가 나타난다는 공통점 때문에 필름 상과 침투 지시를 같은 것으로 볼 수 있습니다.",
        incorrectPoint:
          "PT는 표면개구 결함 검사이고 감마선·엑스선이나 투과 필름을 사용하지 않습니다.",
        keyRule:
          "침투액이 들어가는 표면 결함은 PT, 방사선이 통과한 영상을 읽는 내부 검사는 RT입니다.",
        differenceFromCorrect:
          "정답은 방사선이 재료를 통과하지만 이 보기는 액체가 표면 결함에 침투하는 방식입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "와전류탐상검사는 교류 자기장으로 도전재에 유도된 와전류의 변화를 측정하며 방사선 필름과 관계없습니다.",
        plausibleReason:
          "둘 다 비접촉 검사가 가능하다는 인상 때문에 사용 에너지의 종류를 확인하지 않으면 헷갈릴 수 있습니다.",
        incorrectPoint:
          "ET는 전자기 유도 변화를 검출하고 지문의 방사선 투과·필름 영상 조건을 충족하지 못합니다.",
        keyRule:
          "와전류는 전자기 유도 변화, 방사선투과는 감마선·엑스선의 투과량 차이를 사용합니다.",
        differenceFromCorrect:
          "정답은 방사선 투과량을 기록하지만 이 보기는 도전재 내부의 와전류 변화를 측정합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "감마선·엑스선을 투과시켜 투과량 차이를 필름 상으로 판독한다는 조건이 방사선투과검사 원리와 정확히 일치합니다.",
        plausibleReason:
          "방사선원, 투과, 필름이라는 세 단서를 함께 묶으면 다른 비파괴검사와 명확히 구분됩니다.",
        incorrectPoint: null,
        keyRule:
          "방사선원과 투과 영상 또는 필름이 함께 제시되면 RT로 식별합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-f129cd98-0a8c-4d40-9d9a-8c2db7129cde",
    "9f63576fde2f09135cc527cb5cc070b1ba144160cd942e781a6e3a9fd5d36b14",
    "application",
    [
      "변형·잔류응력 레슨에 연강·저합금강의 노내 응력제거 풀림 온도 550~650도 범위가 직접 수록되어 있지 않습니다.",
      "재질과 두께에 따른 열처리 온도 조건을 확인할 표준 근거가 없어 수치 정답을 공개 풀이로 승격하지 않습니다.",
    ],
  ),
] as const;

const PART_18_DIRECTNESS_HOLD_REASONS = new Map<string, string>([
  [
    "wcbt-ea9d7b6f-0e26-42e7-bec6-4a1af51504ce",
    "independent_directness_audit_all_choice_evidence_incomplete: 연결 근거는 절연장갑과 절연형 홀더만 직접 설명하며 전격방지기·용접기 내부 접근까지 네 보기를 모두 판별하는 문장과 1차 출처가 결속되지 않았습니다.",
  ],
  [
    "wcbt-eae3f4e9-688f-43f2-b3e8-bf68969e4331",
    "independent_directness_audit_all_choice_evidence_incomplete: 자동전격방지장치의 기능은 직접 확인되지만 2차권선·원격제어·핫스타트 장치를 오답으로 구분할 레슨 문장과 1차 출처가 없습니다.",
  ],
  [
    "wcbt-eed26a0a-e7e0-40b4-92ad-768820b0448c",
    "independent_directness_audit_all_choice_evidence_incomplete: 전자빔·레이저 원리만 직접 설명하며 나머지 특수용접 보기의 조건을 모두 대조할 레슨 문장과 1차 출처가 결속되지 않았습니다.",
  ],
  [
    "wcbt-f11e5087-d570-483e-8bdf-dafcfee28744",
    "independent_directness_audit_all_choice_evidence_incomplete: RT와 UT 원리만 직접 설명하며 침투탐상·와전류탐상의 보기까지 모두 판별할 레슨 문장과 1차 출처가 결속되지 않았습니다.",
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_18 =
  WELDING_CBT_ANSWER_REVIEWS_PART_18_AUTHORED.map((entry) => {
    const holdReason = PART_18_DIRECTNESS_HOLD_REASONS.get(entry.canonicalId);
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
