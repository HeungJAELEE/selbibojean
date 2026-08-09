const AUTHOR = "welding-author-part10";
const AUTHORED_AT = "2026-08-03T00:45:00.000Z";
const REVIEWER = "welding-reviewer-part10";
const REVIEWED_AT = "2026-08-03T02:10:00.000Z";

const KOSHA_WELDING_GUIDE =
  "https://oshri.kosha.or.kr/kosha/data/business/occuHealthBusinessData.do?articleNo=423772&attachNo=239316&mode=download";
const KOSHA_HOT_WORK_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=612&callmode=normal&catimage=&eclang=ko&start=2&um=s";
const KOSHA_ELECTRIC_FIRST_AID =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=446&callmode=normal&catimage=&eclang=ko&start=184&um=s";
const KOSHA_CONFINED_SPACE_GUIDE =
  "https://www.kosha.or.kr/kosha/intro/easternGangwonBranch_A.do?articleNo=442727&attachNo=249620&mode=download";

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

type EvidenceRef = {
  kind:
    | "lesson_block"
    | "official_source"
    | "calculation_derivation"
    | "source_question";
  ref: string;
};

function publishCandidate(input: {
  canonicalId: string;
  contentDigest: string;
  assessmentKind: AssessmentKind;
  lessonId: string;
  lessonBlockId: string;
  assertionText: string;
  evidenceRefs?: EvidenceRef[];
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
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind: input.assessmentKind,
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
        ...(input.evidenceRefs ?? []),
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

const WELDING_CBT_ANSWER_REVIEWS_PART_10_AUTHORED = [
  publishCandidate({
    canonicalId: "wcbt-71abac61-0c5f-463c-8d97-1e0ab952971d",
    essentialRank: 1,
    essentialRationale:
      "산소계통의 유분 접촉 금지 원칙을 실제 취급 보기에서 직접 판별하는 문항입니다.",
    contentDigest:
      "d327d01af500671aebde0aaf16d0c00faf4b67e6b049f1ff880e07490d47a65d",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-gas",
    lessonBlockId: "summary",
    assertionText:
      "산소계통에는 유분을 묻히지 않고 누설은 승인된 방법으로 확인합니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_WELDING_GUIDE }],
    answerExplanation:
      "산소는 조연성이 매우 강하므로 산소 용기의 밸브나 압력조정기에 기름이 묻으면 급격한 연소·폭발 위험이 커집니다. 따라서 기름천으로 닦는다는 설명이 잘못된 취급입니다.",
    solutionSteps: [
      "문제가 잘못된 취급을 묻는 부정형임을 먼저 확인합니다.",
      "각 보기를 유분 금지, 충격 방지, 밸브의 서서히 개폐, 누설 점검 기준과 대조합니다.",
      "산소계통에 유분을 접촉시키는 기름천 사용 보기를 선택합니다.",
    ],
    keyRule:
      "산소 용기와 밸브·압력조정기에는 기름이나 그리스를 절대로 접촉시키지 않습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "기름천은 산소계통에 유분을 묻힐 수 있어 급격한 연소 위험을 키우므로 잘못된 취급입니다.",
        plausibleReason:
          "기름천이 먼지와 녹을 잘 닦는 청소도구처럼 보여 안전한 관리로 착각하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "산소와 접촉하는 밸브·조정기에는 세척 목적이라도 유분을 사용하지 않습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "고압가스 용기는 충격을 받으면 밸브 파손이나 용기 손상으로 큰 사고가 날 수 있어 충격을 피해야 합니다.",
        plausibleReason:
          "튼튼한 금속 용기라는 외형 때문에 일상적인 운반 충격은 괜찮다고 생각할 수 있습니다.",
        incorrectPoint:
          "이 보기는 실제로 지켜야 할 올바른 운반 주의사항이므로 정답이 아닙니다.",
        keyRule:
          "고압가스 용기는 캡을 씌우고 전도와 충격을 방지하여 운반합니다.",
        differenceFromCorrect:
          "정답 보기는 위험한 유분 접촉이고, 이 보기는 위험을 줄이는 충격 방지 조치입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "용기 밸브를 천천히 열면 급격한 압력 상승과 단열압축에 따른 위험을 줄일 수 있습니다.",
        plausibleReason:
          "시험 중 시간을 줄이려면 밸브를 빠르게 열어도 된다고 오해할 수 있습니다.",
        incorrectPoint:
          "천천히 개폐한다는 내용은 올바른 안전수칙이므로 잘못된 설명이 아닙니다.",
        keyRule:
          "고압가스 용기 밸브는 작업자의 몸을 피한 위치에서 서서히 개방합니다.",
        differenceFromCorrect:
          "정답은 금지되는 유분 접촉이고, 이 보기는 권장되는 서서히 개방 절차입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "가스 누설은 불꽃이 아니라 비눗물이나 승인된 검지액을 사용해 기포 발생으로 확인합니다.",
        plausibleReason:
          "비눗물이 임시적인 방법처럼 보여 전문 계측기만 허용된다고 생각할 수 있습니다.",
        incorrectPoint:
          "비눗물 점검은 불꽃 점검을 피하는 올바른 누설 확인 방법이므로 정답이 아닙니다.",
        keyRule: "누설 점검에는 불꽃을 쓰지 않고 승인된 검지액을 사용합니다.",
        differenceFromCorrect:
          "정답은 산소계통에 기름을 묻히는 행위이고, 이 보기는 안전한 누설 점검입니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-71df4419-2eb7-4839-b826-5dbd4aa6d22e",
    "ae4e13f5c90884922902738735d26e1486a02416c90e49245d2fc39b20fea9bf",
    "definition",
    [
      "missing_direct_lesson_assertion: 기존 전극·용접봉 레슨에 단락형·글로뷸러형·스프레이형 용적 이행과 철심형의 구분이 직접 서술되어 있지 않음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-722146cd-c070-464b-9743-47ee073680dd",
    essentialRank: 2,
    essentialRationale:
      "전극 교체 전 전원 차단이라는 작업 순서를 직접 적용하게 하는 전기안전 문항입니다.",
    contentDigest:
      "37e1e0ff4a318674919bc14b6569f476bfbf61c8cc0696dfdf58f793b5448619",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "summary",
    assertionText:
      "전원 차단·격리·접지·절연·전격방지와 건조한 작업환경을 함께 적용합니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_HOT_WORK_GUIDE }],
    answerExplanation:
      "텅스텐 전극을 교체할 때는 토치의 충전부에 접촉할 수 있으므로 전원을 먼저 차단해야 합니다. 전원을 차단하지 않고 교체한다는 첫 번째 보기가 전격 방지대책으로 올바르지 않습니다.",
    solutionSteps: [
      "각 보기가 감전 위험을 낮추는지 또는 오히려 충전부 접촉을 허용하는지 구분합니다.",
      "전극 교체·보수처럼 손이 전기부품에 접근하는 작업은 전원 차단이 먼저임을 적용합니다.",
      "전원을 켠 채 텅스텐 봉을 교체한다는 보기를 고릅니다.",
    ],
    keyRule:
      "전극·홀더·토치의 교체나 보수 전에는 전원을 차단하고 무전압 상태를 확인합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "텅스텐 봉 교체 중에는 토치의 전기부품에 손이 가까워지므로 전원을 차단하지 않으면 감전될 수 있습니다.",
        plausibleReason:
          "TIG 전극이 비소모성이라는 특징을 전기적으로 안전하다는 뜻으로 잘못 확대하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "비소모성 전극이라도 교체 작업 전에는 반드시 전원을 차단해야 합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "습한 장갑과 작업복은 인체와 주변의 저항을 낮춰 감전 위험을 높이므로 사용하지 않아야 합니다.",
        plausibleReason:
          "장갑 자체가 있으니 젖어도 맨손보다는 안전하다고 생각할 수 있습니다.",
        incorrectPoint:
          "습윤 상태의 위험을 경고하는 올바른 주의사항이므로 틀린 방지대책이 아닙니다.",
        keyRule:
          "용접 전기작업에는 건조하고 손상되지 않은 보호구와 작업환경이 필요합니다.",
        differenceFromCorrect:
          "정답은 전원을 켠 채 부품을 교체하는 행위이고, 이 보기는 습윤 위험을 피하라는 조치입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "절연홀더의 균열이나 파손은 충전부 노출로 이어질 수 있어 즉시 보수하거나 교체해야 합니다.",
        plausibleReason:
          "작은 균열이면 절연 성능에 영향이 없다고 가볍게 볼 수 있습니다.",
        incorrectPoint:
          "손상된 절연부를 바로 조치하는 내용은 올바른 방지대책입니다.",
        keyRule:
          "홀더·케이블·토치의 절연 손상은 사용 전에 발견해 교체 또는 적정 보수합니다.",
        differenceFromCorrect:
          "정답은 차단 없는 교체이고, 이 보기는 손상 절연을 제거하는 예방조치입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "작업 종료나 장시간 중지 시 전원을 차단하면 무부하 상태의 불필요한 전격 위험을 없앨 수 있습니다.",
        plausibleReason:
          "다시 작업할 가능성이 있으면 스위치를 계속 켜 두는 편이 효율적이라고 생각할 수 있습니다.",
        incorrectPoint:
          "중지 시 스위치를 차단한다는 내용은 올바른 전격 방지대책입니다.",
        keyRule:
          "용접을 하지 않는 동안에는 전원을 차단해 우발적인 통전을 막습니다.",
        differenceFromCorrect:
          "정답은 통전 상태에서 교체하는 행위이고, 이 보기는 불필요한 통전을 제거합니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-733fbcae-d2c2-46c4-9f35-02eddba9997b",
    contentDigest:
      "486062e94de32fb493667e3180428b59166fca558dc09ce60467453838cf0781",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-gas",
    lessonBlockId: "principle",
    assertionText:
      "용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 전도·낙하·충격을 막습니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_WELDING_GUIDE }],
    answerExplanation:
      "산소 용기는 통풍 여부와 관계없이 직사광선과 열원에 노출시키지 않아야 합니다. 따라서 통풍이 잘되는 야외라면 직사광선에 노출시켜야 한다는 설명이 틀렸습니다.",
    solutionSteps: [
      "문제가 틀린 취급을 묻는지 확인합니다.",
      "유분 금지, 열원 회피, 안전한 해빙, 누설 점검의 네 기준으로 보기를 대조합니다.",
      "통풍 조건을 내세워 직사광선 노출을 허용한 보기를 선택합니다.",
    ],
    keyRule:
      "고압가스 용기는 통풍이 되더라도 직사광선과 열원으로부터 보호해야 합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "산소계통은 기름·그리스와 접촉하면 급격한 연소 위험이 커지므로 오염된 손이나 장갑으로 다루지 않습니다.",
        plausibleReason:
          "장갑을 끼면 피부 접촉이 없으므로 기름 오염도 괜찮다고 오해할 수 있습니다.",
        incorrectPoint:
          "유분이 묻은 손과 장갑을 피하라는 내용은 올바른 주의사항입니다.",
        keyRule: "산소 용기와 부속품은 유분이 없는 깨끗한 상태로 취급합니다.",
        differenceFromCorrect:
          "정답은 직사광선 노출을 허용하지만, 이 보기는 유분 접촉을 금지합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "직사광선은 용기 온도와 내부 압력을 높일 수 있으므로 통풍이 잘되더라도 노출시켜서는 안 됩니다.",
        plausibleReason:
          "야외의 통풍이 가스 누적을 막는다는 점 때문에 햇빛의 가열 위험까지 없어지는 것으로 착각하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "가스용기는 통풍과 별개로 직사광선·화기·고온을 피하여 보관합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "얼어붙은 밸브는 화염으로 가열하지 않고 따뜻한 물처럼 점화원이 없는 방법으로 서서히 녹입니다.",
        plausibleReason:
          "물과 금속 장치를 함께 쓰면 부식이나 재결빙 때문에 모두 금지된다고 생각할 수 있습니다.",
        incorrectPoint:
          "따뜻한 물을 사용하는 것은 직접 화염 가열을 피하는 올바른 해빙 방법입니다.",
        keyRule: "동결된 가스 부속품은 화염이나 과열로 녹이지 않습니다.",
        differenceFromCorrect:
          "정답은 열 노출을 허용한 보기이고, 이 보기는 화염 없는 안전한 해빙 방법입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "비눗물 등 승인된 검지액은 가스가 새는 곳에서 기포가 생겨 불꽃 없이 누설을 확인하게 합니다.",
        plausibleReason:
          "산소는 연료가스가 아니므로 누설 점검이 덜 중요하다고 생각할 수 있습니다.",
        incorrectPoint:
          "사용 전 누설을 확인하는 것은 올바른 점검 절차이므로 정답이 아닙니다.",
        keyRule: "가스 누설은 불꽃이 아니라 승인된 검지액으로 확인합니다.",
        differenceFromCorrect:
          "정답은 용기를 가열하는 잘못이고, 이 보기는 누설을 미리 찾는 예방조치입니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-7464fb6c-ed91-480e-b2d4-df7cf83ba538",
    "03fb0d8a84fa29f95fd305a677f4d06eb21689c3ba8799465c9e95019896d3e7",
    "safety",
    [
      "missing_direct_lesson_assertion: 전기안전 레슨에 주석·아연 도금 피막 제거와 용접흄 관리 조건이 직접 서술되어 있지 않음",
      "source_text_typo_review_needed: 보기의 ‘아여 도금’이 ‘아연 도금’의 원문 오탈자인지 별도 대조가 필요함",
    ],
  ),
  holdCandidate(
    "wcbt-748c6048-140c-4585-99b2-1ba6b0389fc0",
    "615d1bdc01d723e023b0be2a66b4e1a590928594ce25dbabf144e042258f8469",
    "identification",
    [
      "missing_lesson: 제안된 고온균열 레슨이 현재 공개 레슨 집합에 없어 피스코 균열시험의 직접 개념 앵커를 확인할 수 없음",
    ],
  ),
  holdCandidate(
    "wcbt-74f42564-e007-4f81-949b-e9cf09db5cd6",
    "74d2408780dd8b900f7fd7deda74492f6d1e1811efe91413e7cd205e4721d5a8",
    "safety",
    [
      "answer_conflict_risk: 전격 위험을 용접전류 설정 하나로 단정한 복원 정답은 전압·접촉경로·습윤·절연 상태를 함께 보는 안전 원리와 충돌 가능성이 있음",
      "missing_direct_lesson_assertion: 전기안전 레슨에 ‘용접전류가 많을 때 전격을 가장 받기 쉽다’는 직접 근거가 없음",
    ],
  ),
  holdCandidate(
    "wcbt-74f658b2-544b-498c-9fd6-c8f240721933",
    "42bb8988e7d699e917a174fcb3acef285f14dc6b9f850fe9c27ac353946e0111",
    "safety",
    [
      "missing_direct_lesson_assertion: 전기안전 레슨에 포말·이산화탄소·무상강화액·할로겐화합물 소화기의 통전 설비 적용 구분이 없음",
      "safety_official_source_missing: 네 소화기 종류의 전기설비 화재 적합성을 동일 기준으로 직접 대조한 공식 1차 근거가 아직 연결되지 않음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-7549a259-99cd-4fe0-8c3e-4e1b5a4f665f",
    essentialRank: 2,
    essentialRationale:
      "파괴시험과 비파괴검사를 짝으로 비교해 검사 범주를 판별하는 대표 문항입니다.",
    contentDigest:
      "50a7d173e185e008b639f53a688f4aa03df401dea2bea0b78eeb593c377d5a1e",
    assessmentKind: "identification",
    lessonId: "lesson-welding-inspection-ndt",
    lessonBlockId: "summary",
    assertionText:
      "VT·PT·MT는 표면 중심, RT·UT는 내부 결함 판독에 주로 활용합니다.",
    answerExplanation:
      "초음파시험(UT)과 방사선투과시험(RT)은 모두 시험체를 파괴하지 않고 내부 결함을 확인하는 비파괴검사입니다. 나머지 보기에는 인장·피로·충격 같은 파괴시험이 하나씩 포함되어 있습니다.",
    solutionSteps: [
      "각 검사명을 파괴시험과 비파괴검사로 하나씩 분류합니다.",
      "한 쌍의 두 검사 모두 비파괴검사인지 확인합니다.",
      "초음파시험과 방사선투과시험으로만 구성된 보기를 선택합니다.",
    ],
    keyRule:
      "인장·피로·충격시험은 시편을 파괴하는 시험이고, UT와 RT는 대표적인 내부 비파괴검사입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts",
        rationale:
          "외관시험은 비파괴검사이지만 인장시험은 시편을 당겨 파단까지 평가하는 파괴시험입니다.",
        plausibleReason:
          "외관시험이 비파괴검사라는 사실만 보고 한 쌍 전체를 비파괴로 판단하기 쉽습니다.",
        incorrectPoint:
          "인장시험이 포함되어 있어 비파괴검사로만 짝지어진 보기가 아닙니다.",
        keyRule:
          "한 쌍 문제는 두 항목을 모두 분류해야 하며 하나라도 파괴시험이면 탈락합니다.",
        differenceFromCorrect:
          "정답은 UT와 RT가 모두 비파괴검사지만, 이 보기는 인장시험이 파괴시험입니다.",
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "누설시험은 비파괴검사에 속할 수 있지만 피로시험은 반복하중으로 파손 특성을 평가하는 파괴시험입니다.",
        plausibleReason:
          "누설시험의 비파괴 성격이 앞의 피로시험까지 비파괴처럼 보이게 할 수 있습니다.",
        incorrectPoint:
          "피로시험이 포함되어 있으므로 두 검사 모두 비파괴라는 조건을 충족하지 못합니다.",
        keyRule:
          "피로·인장·충격시험은 재료의 기계적 성질을 파괴적으로 평가합니다.",
        differenceFromCorrect:
          "정답은 두 검사 모두 내부 비파괴검사이고, 이 보기는 피로시험이 파괴시험입니다.",
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "형광침투 계열 검사는 비파괴이지만 충격시험은 시편을 파단시켜 흡수에너지를 구하는 파괴시험입니다.",
        plausibleReason:
          "형광시험이 비파괴라는 기억만으로 충격시험의 성격을 확인하지 않을 수 있습니다.",
        incorrectPoint: "충격시험이 포함되어 비파괴검사만의 짝이 아닙니다.",
        keyRule: "샤르피 등 충격시험은 시편을 파괴해 인성을 평가합니다.",
        differenceFromCorrect:
          "정답의 UT·RT와 달리 이 보기에는 파괴시험인 충격시험이 포함됩니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "초음파시험은 초음파 반사를, 방사선투과시험은 방사선 투과량 차이를 이용해 내부 결함을 비파괴로 확인합니다.",
        plausibleReason:
          "두 검사가 서로 다른 물리 원리를 쓰지만 모두 내부 비파괴검사라는 공통점이 분명합니다.",
        incorrectPoint: null,
        keyRule:
          "UT와 RT는 시험체를 절단하지 않고 내부 결함을 탐상하는 대표적인 비파괴검사입니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-75d4bef1-9728-4ca6-95c3-0a84cbf1e096",
    "f78f2e1134e1d9374a6aa2bd0b75d17d758824e1f46f594b975b5cbc7094e4f3",
    "safety",
    [
      "missing_direct_numeric_evidence: 보호구 레슨에 TIG·MIG·CO2 아크용접의 차광렌즈 번호 12~13 기준이 직접 서술되어 있지 않음",
      "safety_official_source_missing: 공정과 전류범위를 포함해 차광번호 12~13을 직접 뒷받침하는 현행 공식 표가 연결되지 않음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-76197828-9f05-496a-94a8-403ea045bdb8",
    essentialRank: 4,
    essentialRationale:
      "감전 재해 구조 시 전원 차단과 2차 감전 방지를 우선하는 순서를 직접 묻습니다.",
    contentDigest:
      "cf933d869f1e4933208922bcf0bce3ec1d3800b4885f305bbe6ed7df916b75b0",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "principle",
    assertionText:
      "위험을 발견하면 먼저 전원을 차단하고 잠금·표지 등으로 재투입을 방지한 뒤 무전압을 확인합니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_ELECTRIC_FIRST_AID }],
    answerExplanation:
      "감전자를 맨손으로 잡으면 구조자도 같은 전류 경로에 들어가 2차 감전을 당할 수 있습니다. 사고 전원을 먼저 차단한 뒤 안전하게 분리하고 상태 확인·신고·응급처치를 해야 하므로 첫 번째 조치가 맞지 않습니다.",
    solutionSteps: [
      "구조자가 충전부 또는 감전자와 직접 접촉하는 보기인지 먼저 확인합니다.",
      "공식 순서인 사고 전원 차단, 재해자 구출과 상태 확인, 신고, 응급조치를 적용합니다.",
      "전원 차단 전에 맨손으로 감전자를 잡아당긴다는 보기를 선택합니다.",
    ],
    keyRule:
      "감전 사고에서는 구조자의 2차 감전을 막기 위해 전원 차단이 직접 접촉보다 먼저입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "통전 상태의 감전자를 맨손으로 잡으면 구조자에게도 전류가 흘러 2차 감전이 발생할 수 있습니다.",
        plausibleReason:
          "재해자를 빨리 떼어내야 한다는 긴급성 때문에 전원 차단보다 직접 구조를 먼저 해야 한다고 생각하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "감전자에게 직접 접촉하기 전에 사고 전원을 차단하거나 안전한 절연수단을 확보합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "전원을 끄면 재해자와 구조자에게 계속 흐를 수 있는 전류를 제거하므로 가장 먼저 취할 핵심 조치입니다.",
        plausibleReason:
          "차단기 위치를 찾는 시간이 구조를 늦춘다고 느껴 후순위로 오해할 수 있습니다.",
        incorrectPoint:
          "사고 전원 차단은 공식 응급조치 순서의 첫 단계이므로 맞는 조치입니다.",
        keyRule: "감전 구조는 사고 전원 차단 후 재해자 구출 순서로 진행합니다.",
        differenceFromCorrect:
          "정답은 전원 차단 전 맨손 접촉이고, 이 보기는 그 위험을 제거하는 선행조치입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "안전하게 분리한 뒤 호흡과 의식 상태를 확인하고 필요하면 심폐소생술 등 응급처치를 시행합니다.",
        plausibleReason:
          "의료인이 아닌 작업자가 인공호흡이나 상처 처치를 하면 안 된다고 생각할 수 있습니다.",
        incorrectPoint:
          "상태 확인 후 필요한 응급처치를 하는 것은 올바른 대응이므로 맞지 않는 조치가 아닙니다.",
        keyRule:
          "전원 차단과 안전한 구출 후에는 신고와 함께 호흡·의식 확인 및 필요한 응급처치를 합니다.",
        differenceFromCorrect:
          "정답은 구조자를 위험에 빠뜨리는 직접 접촉이고, 이 보기는 안전 확보 후의 응급처치입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "응급처치와 동시에 전문 구조·의료 지원을 요청해야 후속 치료와 이송이 지연되지 않습니다.",
        plausibleReason:
          "응급처치를 했으면 현장에서 회복 여부를 더 기다려도 된다고 생각할 수 있습니다.",
        incorrectPoint:
          "전문가에게 즉시 연락하는 것은 올바른 후속 조치이므로 정답이 아닙니다.",
        keyRule:
          "현장 응급처치는 119 신고와 전문 의료 인계를 대신하지 않습니다.",
        differenceFromCorrect:
          "정답은 통전 상태의 직접 접촉이고, 이 보기는 전문 구조를 연결하는 안전한 조치입니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-764e8511-5d60-4b47-bf08-203d771097b8",
    "9728a7401ad4c2f982c03c2797e0b067e0ac37cc427944a0e4b42ecee07afdef",
    "principle",
    [
      "missing_direct_lesson_assertion: 특수용접 레슨에 초음파용접의 박판·필름 적용, 낮은 가압 변형, 이종금속 접합 가능성을 직접 대조한 서술이 없음",
    ],
  ),
  holdCandidate(
    "wcbt-76a22788-0490-409d-807e-b4151a3b2eba",
    "5644e510e519179f21cb40a72c16184d7d31df31991c5e614e64b25e55de3492",
    "application",
    [
      "lesson_scope_mismatch: CO2 가스아크용접의 팁-모재 거리 문항이 산소-연료가스 장치·불꽃 레슨에 연결되어 있어 직접 개념 관계가 없음",
      "missing_direct_numeric_evidence: 약 200A 이상에서 15~25mm라는 수치 근거가 현재 레슨에 없음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-77c96178-7761-4243-9762-d85f730d8676",
    essentialRank: 3,
    essentialRationale:
      "팁 내부 폭발음과 불꽃 재출현 단서로 역화를 식별하는 대표 실제 기출입니다.",
    contentDigest:
      "ec24760a030cb53ba55b5de46c012af5cb1edae178662e23b08095a94f6e458d",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-gas",
    lessonBlockId: "structure",
    assertionText:
      "역류는 한 가스가 반대쪽 호스로 흘러가는 현상이고, 역화는 불꽃이 팁 또는 토치 내부로 들어가는 현상입니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_WELDING_GUIDE }],
    answerExplanation:
      "팁이 순간 막히거나 과열되어 팁 안에서 짧은 폭발음이 나고 불꽃이 꺼졌다가 다시 나타나는 현상은 역화(back fire)입니다. 가스가 반대 호스로 흐르는 역류와 구분해야 합니다.",
    solutionSteps: [
      "현상이 가스 흐름의 반전인지, 불꽃이 팁 안으로 들어가는 현상인지 구분합니다.",
      "팁 막힘과 폭발음 뒤 불꽃이 다시 나타난다는 단서를 확인합니다.",
      "짧게 팁 안으로 불꽃이 되돌아가는 역화를 선택합니다.",
    ],
    keyRule:
      "팁 내부에서 폭발음과 함께 불꽃이 순간 꺼졌다 다시 나타나면 역화로 판별합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "인화는 가연성 물질에 불이 붙는 일반적인 점화 현상으로, 팁 내부의 순간 폭발 현상 명칭이 아닙니다.",
        plausibleReason:
          "불꽃이 다시 나타난다는 표현 때문에 단순히 불이 붙는 인화로 연결하기 쉽습니다.",
        incorrectPoint:
          "지문은 팁 내부에서 폭발음이 나는 용접 토치의 이상 현상을 묻고 있습니다.",
        keyRule: "가스용접 토치의 역화·역류 용어와 일반적인 인화를 구분합니다.",
        differenceFromCorrect:
          "정답 역화는 팁 내부로 불꽃이 되돌아가지만, 인화는 물질에 불이 붙는 현상입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "팁이 막히거나 과열되면 불꽃이 팁 안으로 순간 들어가 폭발음을 내고 다시 나타날 수 있으며 이를 역화라고 합니다.",
        plausibleReason:
          "팁의 막힘·과열·부적절한 압력이라는 전형적인 역화 단서가 모두 제시되어 있습니다.",
        incorrectPoint: null,
        keyRule:
          "폭발음과 함께 팁 안으로 순간 불꽃이 들어갔다 되살아나는 현상은 역화입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "역류는 산소 또는 연료가스가 압력 차이 때문에 반대쪽 호스로 흐르는 현상입니다.",
        plausibleReason:
          "역화와 역류가 함께 원인·방지장치 문제로 출제되어 용어가 비슷하게 느껴집니다.",
        incorrectPoint:
          "지문에는 가스의 반대 방향 흐름이 아니라 팁 안의 폭발음과 불꽃 소실이 제시되었습니다.",
        keyRule:
          "역류는 가스의 흐름 문제이고 역화는 불꽃의 토치 내부 침입 문제입니다.",
        differenceFromCorrect:
          "정답 역화는 불꽃이 팁으로 들어가지만, 역류는 한 가스가 다른 가스 호스로 흐릅니다.",
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope",
        rationale:
          "선화는 지문에 묘사된 팁 내부의 순간 폭발과 불꽃 재점화 현상을 뜻하는 표준 선택지가 아닙니다.",
        plausibleReason:
          "불꽃의 선명한 모양이나 선 형태를 설명하는 전문용어처럼 보여 선택할 수 있습니다.",
        incorrectPoint:
          "팁 막힘·과열·폭발음이라는 역화의 핵심 조건을 설명하지 못합니다.",
        keyRule:
          "용어가 낯설어도 현상의 위치와 동작을 기준으로 역화와 역류를 먼저 판별합니다.",
        differenceFromCorrect:
          "정답 역화는 팁 내부 폭발음과 불꽃 재출현을 직접 설명하지만 선화는 그렇지 않습니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-77d74eb7-43d2-421e-91a6-66405189f1f2",
    contentDigest:
      "75d0fc4471e38e34f02dc3bc1a8f7dafd59470af2dfa0c1ac02d84c1e9878740",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-gas",
    lessonBlockId: "structure",
    assertionText:
      "역류는 한 가스가 반대쪽 호스로 흘러가는 현상이고, 역화는 불꽃이 팁 또는 토치 내부로 들어가는 현상입니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_WELDING_GUIDE }],
    answerExplanation:
      "팁의 접촉·과열·가스압력 부적정으로 팁 안에서 폭발음이 나고 불꽃이 꺼졌다 다시 나타나는 현상은 역화(back fire)입니다. 지속적으로 호스나 조정기 쪽까지 화염이 진행하는 인화와 구분합니다.",
    solutionSteps: [
      "팁 내부에서 순간적으로 끝나는지 또는 화염이 더 안쪽으로 진행하는지 확인합니다.",
      "폭발음 후 불꽃이 꺼졌다 다시 나타난다는 표현을 역화의 단서로 잡습니다.",
      "보기 중 back fire로 병기된 역화를 선택합니다.",
    ],
    keyRule:
      "팁 안의 순간 폭발 뒤 불꽃이 재출현하면 역화이며, 가스의 반대 흐름인 역류와 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "역류는 한 가스가 압력 차이로 다른 가스의 호스나 계통 쪽으로 거꾸로 흐르는 현상입니다.",
        plausibleReason:
          "역류가 역화의 원인이 될 수 있어 두 현상을 같은 말로 기억하기 쉽습니다.",
        incorrectPoint:
          "지문은 가스 흐름이 아니라 팁 안에서 폭발음과 함께 불꽃이 사라졌다 재출현하는 현상입니다.",
        keyRule:
          "역류는 가스 방향, 역화는 불꽃이 팁 또는 토치 내부로 들어가는 현상으로 구분합니다.",
        differenceFromCorrect:
          "정답 역화는 불꽃의 내부 침입이고, 역류는 가스의 반대 방향 이동입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "팁 막힘·과열·부적절한 압력 때문에 팁 안에서 순간 폭발음이 나고 불꽃이 다시 나타나는 현상이 역화입니다.",
        plausibleReason:
          "보기의 영문 back fire가 지문의 순간적인 팁 내부 폭발과 정확히 대응합니다.",
        incorrectPoint: null,
        keyRule:
          "팁 안에서 폭발음이 나며 불꽃이 꺼졌다 다시 나타나는 것은 역화입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "이 문항의 용어 체계에서 인화(flash back)는 화염이 토치나 호스 안쪽으로 계속 진행하는 더 위험한 현상과 구분됩니다.",
        plausibleReason:
          "flash back이라는 영문을 역화의 일반 번역으로 알고 있으면 back fire와 혼동할 수 있습니다.",
        incorrectPoint:
          "지문은 팁 안의 순간 폭발 뒤 불꽃이 다시 나타나는 back fire의 특징을 제시합니다.",
        keyRule:
          "이 시험 문맥에서는 순간적인 back fire와 지속 진행하는 flash back을 구분합니다.",
        differenceFromCorrect:
          "정답 역화는 팁에서 순간 발생하고, 인화는 화염이 더 깊은 계통으로 진행하는 상태입니다.",
      },
      {
        choiceIndex: 3,
        relation: "out_of_scope",
        rationale:
          "점화는 토치에 처음 불꽃을 붙이는 정상 작업이며, 운전 중 팁 내부에서 폭발음이 나는 이상 현상이 아닙니다.",
        plausibleReason:
          "불꽃이 꺼졌다 다시 나타난다는 표현을 재점화로 해석할 수 있습니다.",
        incorrectPoint:
          "지문은 작업자의 점화 동작이 아니라 팁 막힘과 과열로 발생한 이상 현상을 설명합니다.",
        keyRule:
          "정상적인 점화 절차와 운전 중 발생하는 역화 현상을 분리합니다.",
        differenceFromCorrect:
          "정답 역화는 이상 현상이고, 점화는 작업 시작 시 의도적으로 불꽃을 만드는 절차입니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-77fe689b-73dd-4b7f-80fd-4d794d468b8f",
    essentialRank: 3,
    essentialRationale:
      "용접의 열·불티 보호와 회전기계의 장갑 말림 위험을 비교하는 적용 문항입니다.",
    contentDigest:
      "ae3f6b3d07a7f474a233fabe72a77f24e2441f2c60cd30bf6410e583c6afb320",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-ppe",
    lessonBlockId: "definition",
    assertionText: "장갑·앞치마·안전화는 열과 불티를 줄입니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_HOT_WORK_GUIDE }],
    answerExplanation:
      "가죽장갑은 용접의 열·불티와 날카로운 모서리로부터 손을 보호하는 데 사용합니다. 반면 드릴·선반·밀링처럼 회전부에 손이 가까운 작업에서는 장갑이 말려 들어갈 수 있으므로 해당 보기들은 적합하지 않습니다.",
    solutionSteps: [
      "각 작업에 회전하는 스핀들·척·공구가 노출되는지 확인합니다.",
      "장갑의 보호효과와 회전부 말림 위험을 함께 비교합니다.",
      "회전부 말림보다 열과 불티 보호가 필요한 용접 작업을 선택합니다.",
    ],
    keyRule:
      "가죽장갑은 용접의 열과 불티 보호에는 적합하지만 회전기계 조작 중에는 말림 위험 때문에 사용하지 않습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "contradicts",
        rationale:
          "드릴링 작업 중 장갑이 회전하는 드릴이나 척에 걸리면 손이 함께 말려 들어갈 수 있습니다.",
        plausibleReason:
          "절삭유와 날카로운 칩으로부터 손을 보호하려면 두꺼운 장갑이 유리해 보입니다.",
        incorrectPoint:
          "회전부 근처의 장갑은 보호보다 말림 위험을 키우므로 적합한 작업이 아닙니다.",
        keyRule:
          "회전하는 드릴·척 주변에서는 손이 말려들 수 있는 장갑을 착용하지 않습니다.",
        differenceFromCorrect:
          "정답 용접은 불티 보호가 주목적이지만 드릴링은 회전부 말림 위험이 지배적입니다.",
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "선반의 척과 회전하는 공작물에 장갑이 닿으면 장갑째 손이 감길 수 있습니다.",
        plausibleReason:
          "거친 공작물과 칩을 만지는 작업이라 가죽장갑이 손베임을 막을 것처럼 보입니다.",
        incorrectPoint:
          "선반 가동 중에는 장갑의 말림 위험 때문에 안전한 사용 대상이 아닙니다.",
        keyRule: "선반의 회전 척·공작물 근처에서는 장갑 착용을 피합니다.",
        differenceFromCorrect:
          "정답 용접은 비회전 열작업이고, 선반은 회전 공작물이 장갑을 끌어당길 수 있습니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "용접 작업의 고온 금속과 불티에 손이 노출되므로 내열성 가죽장갑이 화상 위험을 줄입니다.",
        plausibleReason:
          "가죽이 불티와 복사열에 견디고 손목까지 덮어 용접 보호구의 역할과 직접 맞습니다.",
        incorrectPoint: null,
        keyRule:
          "용접에는 건조하고 손상되지 않은 용접용 가죽장갑을 사용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "contradicts",
        rationale:
          "밀링 작업은 회전 커터가 장갑을 잡아당길 수 있어 가동 중 손을 가까이하거나 장갑을 사용하면 위험합니다.",
        plausibleReason:
          "날카로운 밀링 칩 때문에 손 보호구가 반드시 필요하다고 생각하기 쉽습니다.",
        incorrectPoint:
          "회전 커터의 말림 위험 때문에 가죽장갑을 안전하게 사용할 작업으로 볼 수 없습니다.",
        keyRule:
          "밀링의 칩 제거는 기계를 정지한 뒤 브러시 등 전용 도구로 수행합니다.",
        differenceFromCorrect:
          "정답 용접은 열·불티로부터의 보호가 필요하지만 밀링은 회전 커터 말림을 우선 방지합니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-786dc116-eed5-4aed-b41f-2fd4def06920",
    essentialRank: 4,
    essentialRationale:
      "가스용기 가열 방지와 보관 온도 기준을 수치 오답에서 직접 판별하는 문항입니다.",
    contentDigest:
      "d9e58c49140cbc0f58ad56f9dbdc1f283e1f78f2533cc2828c541ad8b2682b17",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-gas",
    lessonBlockId: "principle",
    assertionText:
      "용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 전도·낙하·충격을 막습니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_WELDING_GUIDE }],
    answerExplanation:
      "안전보건공단 자료는 고압가스 용기의 표면온도를 40℃ 이하로 유지하도록 제시합니다. 따라서 산소용기를 60℃ 이하에서 보관하면 된다는 첫 번째 보기는 허용온도를 너무 높게 잡아 틀렸습니다.",
    solutionSteps: [
      "문제가 틀린 취급을 묻는 부정형임을 확인합니다.",
      "온도 기준, 아세틸렌 용기 자세, 운반 캡, 누설 점검을 공식 안전수칙과 대조합니다.",
      "공식 40℃ 이하 기준을 60℃ 이하로 바꾼 보기를 선택합니다.",
    ],
    keyRule:
      "고압가스 용기는 직사광선과 열원을 피하고 표면온도를 40℃ 이하로 유지합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "공식 안전수칙의 용기 표면온도 기준은 40℃ 이하이므로 60℃ 이하라는 수치는 위험 범위를 허용합니다.",
        plausibleReason:
          "60℃도 끓는점보다 낮고 ‘이하’라고 표현되어 충분히 보수적인 기준처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "용기 온도 문제에서는 60℃가 아니라 40℃ 이하 기준을 적용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "아세틸렌 용기는 내부의 용제와 다공성 물질 상태를 유지하도록 세워 사용하는 것이 원칙입니다.",
        plausibleReason:
          "가스만 꺼내 쓰는 용기라면 눕혀도 압력에는 차이가 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "아세틸렌 용기를 세워 사용한다는 내용은 올바른 주의사항입니다.",
        keyRule:
          "아세틸렌 용기는 운반·보관·사용 시 세운 상태와 전도 방지를 확인합니다.",
        differenceFromCorrect:
          "정답은 잘못된 온도 기준이고, 이 보기는 아세틸렌 용기의 올바른 사용 자세입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "운반 중 밸브가 충격으로 파손되는 것을 막기 위해 보호캡을 씌워 이동합니다.",
        plausibleReason:
          "짧은 거리라면 손잡이나 밸브만 조심해도 된다고 생각할 수 있습니다.",
        incorrectPoint: "운반 시 보호캡을 씌우는 것은 올바른 안전조치입니다.",
        keyRule: "고압가스 용기 운반 전에는 밸브 보호캡의 체결을 확인합니다.",
        differenceFromCorrect:
          "정답은 허용온도를 잘못 높였고, 이 보기는 밸브 충격을 막는 보호조치입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "비눗물 등 승인된 검지액으로 누설을 수시 확인하면 화염을 사용하지 않고 새는 지점을 찾을 수 있습니다.",
        plausibleReason:
          "수시 점검이라는 표현이 지나치게 빈번한 요구처럼 보일 수 있습니다.",
        incorrectPoint:
          "누설을 승인된 검지액으로 확인하는 것은 올바른 관리 방법입니다.",
        keyRule:
          "가스 누설은 비눗물·검지액으로 확인하고 불꽃으로 시험하지 않습니다.",
        differenceFromCorrect:
          "정답은 온도 수치가 틀렸지만, 이 보기는 올바른 누설 점검 방법입니다.",
      },
    ],
  }),
  holdCandidate(
    "wcbt-799be6ca-ad4f-487b-872c-68392459797f",
    "dbada633c0f039ad164b788d7b3931e99448a53a18d52baed9fa174c8748bca3",
    "safety",
    [
      "missing_direct_lesson_assertion: 가스안전 레슨에 수봉식 안전기의 수위·토치 연결 수·동결 해빙 절차가 직접 서술되어 있지 않음",
      "safety_official_source_missing: 수봉식 안전기 동결 시 가스토치 사용 금지를 직접 확인할 현행 공식 자료가 연결되지 않음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-79f3f7f3-4827-4d41-bd5f-c7cdfc2eb35b",
    essentialRank: 3,
    essentialRationale:
      "수냉 토치 누수 시 작업 중지와 절연 점검을 적용하는 전기안전 문항입니다.",
    contentDigest:
      "3aaedb63f2f2ab21751c52e88effaa5e55ab543174fb3f1cdc55ab62c751fead",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-electrical",
    lessonBlockId: "definition",
    assertionText:
      "젖은 장소, 땀에 젖은 보호구, 손상된 절연, 협소한 도전성 구조물은 인체 저항을 낮추거나 접촉 가능성을 높여 감전 위험을 키웁니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_HOT_WORK_GUIDE }],
    answerExplanation:
      "수냉식 TIG 토치에서 냉각수가 새면 물이 전기부품과 작업자 쪽으로 퍼져 감전·장비손상 위험을 높입니다. 물만 보충하며 작업을 계속할 것이 아니라 즉시 전원을 차단하고 누수 원인을 보수해야 합니다.",
    solutionSteps: [
      "각 보기가 감전원과의 접촉을 줄이는지 또는 습윤 위험을 새로 만드는지 구분합니다.",
      "누수는 냉각수 부족만의 문제가 아니라 전기 절연과 작업환경의 습윤 문제임을 적용합니다.",
      "누수를 방치한 채 냉각수만 보충하며 계속 용접한다는 보기를 선택합니다.",
    ],
    keyRule:
      "수냉식 토치의 누수를 발견하면 작업과 전원을 중지하고 누수·절연 상태를 점검한 뒤 재사용합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "용접기 내부에는 충전부가 있으므로 자격과 안전절차 없이 손을 대지 않는 것이 올바른 방지대책입니다.",
        plausibleReason:
          "간단한 먼지 제거와 점검 정도는 가동 중에도 가능하다고 생각할 수 있습니다.",
        incorrectPoint:
          "용접기 내부에 함부로 손대지 않는다는 내용은 감전 예방에 적합합니다.",
        keyRule:
          "용접기 내부 점검·보수는 전원 차단과 무전압 확인 후 자격 있는 사람이 수행합니다.",
        differenceFromCorrect:
          "정답은 누수를 방치하고 계속 작업하지만, 이 보기는 충전부 접근을 제한합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "맨손으로 홀더나 용접봉을 잡으면 절연 이상이나 습윤 상태에서 전류 경로가 형성될 수 있습니다.",
        plausibleReason:
          "용접봉이 소모품이라 평상시에는 전기가 흐르지 않는 금속 막대처럼 보일 수 있습니다.",
        incorrectPoint:
          "맨손 취급을 금지하는 내용은 올바른 전격 방지대책입니다.",
        keyRule:
          "홀더와 용접봉은 건조한 절연 보호구를 갖춘 상태에서 취급합니다.",
        differenceFromCorrect:
          "정답은 냉각수 누수를 방치하지만, 이 보기는 직접 접촉을 줄입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "작업 종료나 장시간 중지 시 스위치를 끄면 불필요한 무부하전압과 우발 통전 위험을 제거합니다.",
        plausibleReason:
          "잠시 후 재개할 작업이라면 전원을 유지하는 편이 효율적이라고 생각할 수 있습니다.",
        incorrectPoint: "중지 시 전원을 차단하는 것은 올바른 안전조치입니다.",
        keyRule:
          "용접하지 않는 동안에는 전원을 차단하고 작업장을 안전한 상태로 둡니다.",
        differenceFromCorrect:
          "정답은 누수 상태의 지속 작업이고, 이 보기는 위험한 통전 상태를 제거합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "냉각수 누수는 습윤에 의한 감전과 토치 손상의 원인이므로 보충만 하며 작업을 계속해서는 안 됩니다.",
        plausibleReason:
          "냉각 성능만 유지하면 토치 과열은 막을 수 있어 계속 작업해도 된다고 생각할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "누수 발견 시 즉시 작업과 전원을 멈추고 토치·호스·절연 상태를 보수합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-7a095646-c8af-460d-ae55-23c8a4e14805",
    "7782153feae6e2b46a3c05c6ffb48a8203df0d251533d1a236974fcd2f2ba6b1",
    "identification",
    [
      "missing_lesson: 제안된 피복아크용접 레슨이 현재 공개 레슨 집합에 없어 E4311 가스실드계·유기물 20~30%의 직접 개념 앵커를 확인할 수 없음",
      "missing_direct_numeric_evidence: 용접봉 피복제 유기물 20~30% 수치의 직접 근거가 연결되지 않음",
    ],
  ),
  holdCandidate(
    "wcbt-7a2a008d-bc95-4b06-b520-5c5e8b75a408",
    "8d8d69dfa5e4cc039ba791e5577d8b9e7d97b7fc578d2e7247d148c10bc4bf00",
    "safety",
    [
      "answer_conflict_risk: 용해 아세틸렌 용기의 용제인 아세톤과 폭발 위험의 관계를 ‘관계 없음’으로 단정한 복원 정답은 조건 검토가 필요함",
      "missing_direct_lesson_assertion: 화재안전 레슨에 아세틸렌 폭발과 압력·온도·구리합금·아세톤의 관계가 직접 서술되어 있지 않음",
    ],
  ),
  holdCandidate(
    "wcbt-7a4b416c-da37-4c7b-ab99-08b322d65700",
    "3d625d58e0d7c9ca90cac04d21345f281a937e267e3d59062dcd6fa557190473",
    "application",
    [
      "missing_direct_numeric_evidence: 변형·잔류응력 레슨에 노내 풀림 725±50℃ 및 판두께 25mm당 유지시간 조건이 직접 서술되어 있지 않음",
      "answer_condition_review_needed: 복원 정답 보기의 유지시간 5시간 조건은 적용 재료·두께·규격을 포함한 출처 대조가 필요함",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-7adf06d7-5cc9-4ee1-b138-1bbd4cb63f5e",
    essentialRank: 1,
    essentialRationale:
      "밀폐공간의 환기·농도측정·감시인 배치와 단독작업 금지를 종합 판별합니다.",
    contentDigest:
      "13ece2c34e15b168e862afef5a1e12f745c117efbb9f34c953820c9e065083e8",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-ventilation",
    lessonBlockId: "principle",
    assertionText:
      "밀폐공간은 산소와 유해·가연성 가스 농도를 측정하고 지속 환기하며 외부 감시자와 구조수단을 준비합니다.",
    evidenceRefs: [
      { kind: "official_source", ref: KOSHA_CONFINED_SPACE_GUIDE },
    ],
    answerExplanation:
      "밀폐공간 용접은 환기, 산소·유해·가연성가스 측정, 외부 감시인과 연락·구조계획이 함께 필요합니다. 혼자 작업하면 이상 발생 시 감지와 구조가 지연되므로 ‘혼자서 용접한다’는 보기가 적합하지 않습니다.",
    solutionSteps: [
      "밀폐공간의 핵심 위험인 산소결핍·중독·화재폭발과 구조 지연을 확인합니다.",
      "환기, 농도측정, 감시인 배치가 각각 위험을 줄이는 조치인지 판단합니다.",
      "감시와 구조체계를 없애는 단독 작업 보기를 선택합니다.",
    ],
    keyRule:
      "밀폐공간 용접은 작업 전·중 환기와 농도측정, 외부 감시인, 연락·구조계획을 갖추고 수행합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "환기는 산소결핍과 유해·가연성가스 축적을 줄이는 밀폐공간의 핵심 공학적 조치입니다.",
        plausibleReason:
          "용접 아크가 산소를 크게 소비하지 않는다고 생각하면 환기의 필요성을 낮게 볼 수 있습니다.",
        incorrectPoint:
          "환기에 주의한다는 내용은 올바른 안전조치이므로 적합하지 않은 보기가 아닙니다.",
        keyRule:
          "밀폐공간은 작업 전뿐 아니라 작업 중에도 적정공기 상태를 유지하도록 환기합니다.",
        differenceFromCorrect:
          "정답은 감시 없이 혼자 작업하는 것이고, 이 보기는 위험한 공기를 제어합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "외부 감시인은 작업자 상태를 확인하고 이상 시 연락·구조 절차를 시작하는 역할을 합니다.",
        plausibleReason:
          "작업자가 숙련자라면 감시인이 없어도 스스로 대응할 수 있다고 생각할 수 있습니다.",
        incorrectPoint:
          "감시원을 배치하는 것은 공식 밀폐공간 안전절차에 포함되는 올바른 조치입니다.",
        keyRule:
          "밀폐공간 외부에는 감시인을 두고 작업자와 지속적으로 연락할 수 있어야 합니다.",
        differenceFromCorrect:
          "정답은 단독 작업이고, 이 보기는 사고 대응을 위한 외부 감시를 마련합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "작업 전 산소와 유해·가연성가스 농도를 확인해야 질식·중독·폭발 위험을 판단할 수 있습니다.",
        plausibleReason:
          "환기팬을 켰다면 별도의 가스측정은 필요 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "유해·폭발가스 발생 여부 확인은 반드시 필요한 사전·작업 중 점검입니다.",
        keyRule:
          "환기 여부와 별개로 산소 및 유해·가연성가스 농도를 측정합니다.",
        differenceFromCorrect:
          "정답은 사고 시 고립되는 단독 작업이고, 이 보기는 위험 분위기를 사전에 확인합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "혼자 밀폐공간에 들어가면 의식 소실이나 화재 발생 시 외부에서 즉시 발견하고 구조할 사람이 없습니다.",
        plausibleReason:
          "위험하니 다른 사람의 노출을 줄이기 위해 한 명만 들어가는 편이 낫다고 잘못 생각할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "밀폐공간은 단독 작업하지 않고 외부 감시·연락·구조체계를 갖춥니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-7afa6e4e-4671-4bce-b61a-5d632c452259",
    essentialRank: 2,
    essentialRationale:
      "발생원 포집·환기와 호흡보호구를 함께 적용해야 한다는 흄 관리 문항입니다.",
    contentDigest:
      "acfd0d8ac561187aecfb4e73d3f51f2bb9535b349b0af56ade9803693c821ce9",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-ventilation",
    lessonBlockId: "structure",
    assertionText:
      "발생원 포집·환기와 별개로 노출평가와 공정·밀폐조건에 따라 적정 호흡보호구를 병행하며, 환기를 했다는 이유만으로 호흡보호구가 자동으로 불필요해지는 것은 아닙니다.",
    evidenceRefs: [
      { kind: "official_source", ref: KOSHA_CONFINED_SPACE_GUIDE },
    ],
    answerExplanation:
      "환기는 흄·가스 노출을 줄이는 우선적인 공학적 대책이지만, 환기했다는 사실만으로 호흡보호구가 언제나 불필요해지는 것은 아닙니다. 실제 노출농도와 공정·공간 조건을 평가해 필요한 보호구를 함께 사용해야 하므로 네 번째 보기가 틀렸습니다.",
    solutionSteps: [
      "각 보기가 발생원 포집, 전체환기, 작업자 위치, 호흡보호구 중 무엇을 다루는지 나눕니다.",
      "한 가지 조치를 했다고 다른 보호조치가 자동으로 불필요해진다는 단정인지 확인합니다.",
      "환기만 되면 방독마스크가 필요 없다고 단정한 보기를 선택합니다.",
    ],
    keyRule:
      "환기는 호흡보호구의 필요성을 자동으로 없애지 않으며 노출평가와 작업조건에 따라 병행합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "흄 회수장치는 발생원 가까이에서 오염물질을 포집해 작업자의 호흡영역으로 퍼지는 양을 줄입니다.",
        plausibleReason:
          "‘전동 회수장치’라는 표현이 표준 국소배기장치와 다른 임의 장비처럼 보일 수 있습니다.",
        incorrectPoint:
          "발생원 포집 장치를 설치하는 것은 흄 노출을 줄이는 적절한 공학적 대책입니다.",
        keyRule: "용접흄은 가능하면 발생원 가까이에서 국소배기로 포집합니다.",
        differenceFromCorrect:
          "정답은 환기만으로 보호구를 배제하지만, 이 보기는 발생원에서 흄을 제거합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "작업장 환기는 축적된 흄과 가스를 희석·배출하고 신선한 공기를 공급하는 기본 대책입니다.",
        plausibleReason:
          "보호가스가 흩어질 수 있다는 이유로 모든 환기가 용접 품질을 해친다고 생각할 수 있습니다.",
        incorrectPoint:
          "기류를 적절히 설계한 환기장치는 중독 방지에 필요한 조치입니다.",
        keyRule:
          "환기는 보호가스를 과도하게 교란하지 않도록 위치와 풍량을 조절해 실시합니다.",
        differenceFromCorrect:
          "정답은 보호구 불필요를 단정하지만, 이 보기는 공기 중 오염물질을 줄입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "실외에서는 바람이 흄을 작업자의 얼굴 쪽으로 보내지 않도록 몸의 위치를 정해 호흡영역 노출을 줄입니다.",
        plausibleReason:
          "‘바람을 등진다’는 표현이 바람을 등 뒤에서 맞아 흄이 얼굴로 간다는 의미로 해석될 여지가 있습니다.",
        incorrectPoint:
          "복원 문항의 의도는 흄이 호흡영역으로 오지 않도록 풍향을 고려하라는 올바른 조치입니다.",
        keyRule:
          "실외 작업은 풍향을 확인해 흄이 얼굴을 지나가지 않는 위치를 선택합니다.",
        differenceFromCorrect:
          "정답은 환기 후 보호구를 무조건 생략하지만, 이 보기는 자연기류에서 노출 위치를 조절합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "환기 여부만으로 잔류 유해가스 농도와 호흡보호구 필요성을 판단할 수 없으므로 무조건 미착용해도 된다는 단정은 틀립니다.",
        plausibleReason:
          "환기장치를 켜면 오염물질이 모두 제거된다고 생각해 보호구를 중복 조치로 볼 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "환기 후에도 노출농도와 작업조건을 평가해 적합한 호흡보호구 사용 여부를 결정합니다.",
        differenceFromCorrect: null,
      },
    ],
  }),
  holdCandidate(
    "wcbt-7cbc2b96-1c2a-4e8f-a3df-8375e14ce9de",
    "f02abaefa1dabfb8bfd106ec102fe419ac007bff8f57edb6a2bcb23a832621ce",
    "principle",
    [
      "missing_direct_lesson_assertion: 가스안전 레슨에 용기 압력 변화와 무관한 조정압력 유지 조건이 직접 서술되어 있지 않음",
      "missing_direct_component_evidence: 압력조정기의 동작·방출압력 차이·빙결 조건을 선택지별로 대조할 직접 근거가 없음",
    ],
  ),
  holdCandidate(
    "wcbt-7d2aba6c-7ddf-4559-bfcb-b535c53c7d21",
    "a49bff3767e92e7cf0b4f85d195e1e0902dcb391efffd0040ac4e6ffa15813e7",
    "principle",
    [
      "missing_lesson: 제안된 GMAW 레슨이 현재 공개 레슨 집합에 없어 MIG 전류밀도·전원특성·자동화 범위를 직접 연결할 수 없음",
      "missing_direct_numeric_evidence: 피복아크용접 대비 전류밀도 약 6배라는 수치 근거가 연결되지 않음",
    ],
  ),
  publishCandidate({
    canonicalId: "wcbt-7d98f9f8-8c72-49cc-b81a-6c1b13d5ae2b",
    essentialRank: 2,
    essentialRationale: "프로젝션용접은 겹치기 이음, 플래시용접은 맞대기 이음이라는 저항용접 분류를 구분하는 대표 문항입니다.",
    contentDigest:
      "02291acbf12be5d67d8500a03a65f429fc527c9d568756848129f907870a83eb",
    assessmentKind: "identification",
    lessonId: "lesson-welding-resistance",
    lessonBlockId: "structure",
    assertionText:
      "프로젝션용접은 돌기를 이용해 전류와 압력을 국부 집중시키며, 플래시버트용접은 맞대기면의 플래시 가열 후 업셋합니다.",
    answerExplanation:
      "저항용접은 이음 형상에 따라 겹치기 계열과 맞대기 계열로 나눌 수 있습니다. 플래시용접은 두 모재의 단면을 맞대고 플래시 가열 후 업셋하므로 맞대기 용접에 속합니다.",
    solutionSteps: [
      "각 공정이 판을 겹쳐 접합하는지 또는 단면을 맞대어 접합하는지 구분합니다.",
      "점·심·프로젝션은 대표적인 겹치기 계열이고 플래시용접은 맞대기면을 가열·업셋함을 적용합니다.",
      "맞대기 용접에 속하는 플래시 용접을 선택합니다.",
    ],
    keyRule:
      "플래시용접은 맞댄 단면에서 플래시를 발생시킨 뒤 업셋하는 맞대기 저항용접입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "점용접은 겹친 판재를 전극으로 가압해 개별 너깃을 만드는 겹치기 저항용접입니다.",
        plausibleReason:
          "두 판을 서로 접합한다는 일반적 의미 때문에 맞대기 접합으로 넓게 해석할 수 있습니다.",
        incorrectPoint:
          "판의 단면을 맞대는 것이 아니라 겹친 부분에 점 너깃을 만들므로 맞대기 분류가 아닙니다.",
        keyRule: "점용접은 겹치기 이음에 개별 점 너깃을 형성합니다.",
        differenceFromCorrect:
          "정답 플래시용접은 단면을 맞대지만 점용접은 판을 겹쳐 전극 사이에서 가압합니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "심용접은 롤러 전극으로 겹친 판에 연속 또는 간헐적인 너깃 열을 만드는 공정입니다.",
        plausibleReason:
          "연속된 용접선이 맞대기 이음의 직선 용접부처럼 보일 수 있습니다.",
        incorrectPoint:
          "심용접은 기본적으로 겹친 판을 롤러 전극 사이에서 접합하므로 맞대기 용접이 아닙니다.",
        keyRule:
          "심용접은 점용접의 점들이 겹치도록 이어진 겹치기 저항용접입니다.",
        differenceFromCorrect:
          "정답은 단면 맞대기와 업셋을 쓰고, 심용접은 겹친 판과 롤러 전극을 씁니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "플래시용접은 두 모재의 단면을 맞댄 뒤 플래시로 가열하고 축방향으로 업셋하여 접합합니다.",
        plausibleReason:
          "‘플래시버트’의 버트(butt)가 맞대기 이음을 뜻하므로 분류를 직접 확인할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "플래시용접은 대표적인 맞대기 저항용접으로 플래시 가열과 업셋을 이용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "프로젝션용접은 겹친 모재의 돌기에 전류와 압력을 집중시켜 여러 너깃을 만드는 공정입니다.",
        plausibleReason:
          "돌출부끼리 접촉한다는 모습이 두 단면을 맞대는 것처럼 느껴질 수 있습니다.",
        incorrectPoint:
          "돌기를 이용한 국부 겹치기 접합이므로 맞대기 용접 분류가 아닙니다.",
        keyRule:
          "프로젝션용접은 모재의 돌기로 전류와 가압력을 집중하는 겹치기 저항용접입니다.",
        differenceFromCorrect:
          "정답 플래시용접은 맞댄 단면 전체를 가열·업셋하지만 프로젝션용접은 돌기에 집중합니다.",
      },
    ],
  }),
  publishCandidate({
    canonicalId: "wcbt-7f217133-abbe-4aa7-ad38-ab2aba2d869c",
    essentialRank: 2,
    essentialRationale:
      "열·불티·비산물·유해가스별 보호구를 작업 불편과 구분해 판단하는 문항입니다.",
    contentDigest:
      "565b7db19ddc2390b542306262df277d7a6c656a3418f1d6ad585d56b425f196",
    assessmentKind: "safety",
    lessonId: "lesson-welding-safety-ppe",
    lessonBlockId: "definition",
    assertionText: "장갑·앞치마·안전화는 열과 불티를 줄입니다.",
    evidenceRefs: [{ kind: "official_source", ref: KOSHA_HOT_WORK_GUIDE }],
    answerExplanation:
      "가스용접에서도 불꽃·고온 금속·슬래그가 팔과 몸에 닿을 수 있으므로 앞치마와 팔덮개 같은 보호구를 착용해야 합니다. 작업이 불편하다는 이유로 생략해도 된다는 첫 번째 보기가 틀렸습니다.",
    solutionSteps: [
      "각 보호구가 막는 위험원을 화상, 비산물, 유해가스로 나누어 확인합니다.",
      "불편함을 이유로 필요한 보호구를 생략하도록 허용하는 보기인지 찾습니다.",
      "앞치마와 팔덮개를 착용하지 않아도 된다는 보기를 선택합니다.",
    ],
    keyRule:
      "용접 보호구는 편의가 아니라 열·불티·비산물·유해물질의 실제 위험에 맞춰 선택하고 착용합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "앞치마와 팔덮개는 불티와 고온 금속으로 인한 몸통·팔의 화상을 줄이므로 불편하다는 이유로 생략할 수 없습니다.",
        plausibleReason:
          "가스용접의 불꽃이 아크용접보다 부드러워 두꺼운 보호구가 과도해 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "가스용접에도 불꽃과 고온 금속 비산 위험이 있으므로 신체 보호구를 착용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "보호장갑은 토치·가열된 모재·용가봉과 불티로 인한 손 화상 위험을 줄입니다.",
        plausibleReason:
          "장갑이 손 감각을 떨어뜨려 토치 조절에 방해될 수 있다고 생각할 수 있습니다.",
        incorrectPoint:
          "화상 방지를 위해 보호장갑을 착용한다는 내용은 올바른 설명입니다.",
        keyRule:
          "용접용 장갑은 건조하고 손상되지 않은 내열성 제품을 사용합니다.",
        differenceFromCorrect:
          "정답은 필요한 신체 보호구를 생략하지만, 이 보기는 손의 화상 위험을 줄입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "보호안경은 불꽃과 슬래그·금속 입자가 눈에 들어가는 것을 줄이는 기본 눈 보호구입니다.",
        plausibleReason:
          "가스용접은 아크광이 아니므로 눈 보호가 필요 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "비산물로부터 눈을 보호한다는 설명은 올바르므로 틀린 보기가 아닙니다.",
        keyRule:
          "가스용접에는 공정에 맞는 차광과 비산물 보호 기능을 갖춘 눈 보호구를 사용합니다.",
        differenceFromCorrect:
          "정답은 앞치마·팔덮개를 생략하지만, 이 보기는 눈의 비산물 위험을 차단합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "유해가스 발생 우려가 있으면 환기와 노출평가를 우선하고 위험물질에 맞는 적합한 호흡보호구를 사용해야 합니다.",
        plausibleReason:
          "모든 유해물질에 같은 방독면을 쓰면 된다는 표현은 지나치게 단순해 보여 틀린 보기로 느껴질 수 있습니다.",
        incorrectPoint:
          "문항의 취지는 유해가스 우려 시 호흡보호구가 필요하다는 것으로, 보호구 자체를 생략하는 설명이 아닙니다.",
        keyRule:
          "호흡보호구는 가스 종류·농도·산소 상태에 맞춰 선택하고 환기의 대체물로 보지 않습니다.",
        differenceFromCorrect:
          "정답은 열·불티 보호구를 불편함 때문에 생략하지만, 이 보기는 유해가스 위험에 대응합니다.",
      },
    ],
  }),
] as const;

const FORCED_HOLD_REASONS = new Map<string, string[]>([
  [
    "wcbt-7549a259-99cd-4fe0-8c3e-4e1b5a4f665f",
    [
      "choice_distinction_incomplete: UT·RT가 비파괴검사라는 직접 근거는 있으나 인장·피로·충격 시험을 파괴시험으로 각각 분류하는 레슨 assertion이 연결되지 않아 네 보기 전체를 검증하지 못함",
    ],
  ],
  [
    "wcbt-71abac61-0c5f-463c-8d97-1e0ab952971d",
    [
      "official_source_unverified: 연결된 안전 근거에서 이 문항의 정답과 네 선택지 전체를 직접 확인하지 못했습니다.",
    ],
  ],
  [
    "wcbt-722146cd-c070-464b-9743-47ee073680dd",
    [
      "official_source_partial: 연결된 안전 근거가 일부 원칙만 지지하고 문항의 네 선택지를 모두 직접 판정하지 못합니다.",
    ],
  ],
  [
    "wcbt-733fbcae-d2c2-46c4-9f35-02eddba9997b",
    [
      "official_source_unverified: 연결된 안전 근거에서 이 문항의 정답과 선택지별 판단을 직접 확인하지 못했습니다.",
    ],
  ],
  [
    "wcbt-76197828-9f05-496a-94a8-403ea045bdb8",
    [
      "official_source_insufficient: 연결된 잠금·표지 자료만으로 이 문항의 작업 순서와 선택지 전체를 직접 검증할 수 없습니다.",
    ],
  ],
  [
    "wcbt-77c96178-7761-4243-9762-d85f730d8676",
    [
      "official_source_unverified: 연결된 안전 근거에서 이 문항의 정답과 네 선택지 전체를 직접 확인하지 못했습니다.",
    ],
  ],
  [
    "wcbt-77d74eb7-43d2-421e-91a6-66405189f1f2",
    [
      "official_source_unverified: 연결된 안전 근거에서 이 문항의 정답과 선택지별 판단을 직접 확인하지 못했습니다.",
    ],
  ],
  [
    "wcbt-77fe689b-73dd-4b7f-80fd-4d794d468b8f",
    [
      "official_source_partial: 연결된 안전 근거가 일부 원칙만 지지하고 문항의 네 선택지를 모두 직접 판정하지 못합니다.",
    ],
  ],
  [
    "wcbt-786dc116-eed5-4aed-b41f-2fd4def06920",
    [
      "official_source_unverified: 연결된 자료에서 용기 40℃ 기준과 나머지 선택지의 취급 조건을 모두 직접 확인하지 못했습니다.",
    ],
  ],
  [
    "wcbt-79f3f7f3-4827-4d41-bd5f-c7cdfc2eb35b",
    [
      "official_source_partial: 연결된 안전 근거가 일부 전기안전 원칙만 지지하고 문항의 네 선택지를 모두 직접 판정하지 못합니다.",
    ],
  ],
  [
    "wcbt-7adf06d7-5cc9-4ee1-b138-1bbd4cb63f5e",
    [
      "official_source_unreachable: 연결된 공식 자료가 내용 대신 SPA 셸만 반환해 문항의 선택지별 판단을 검증할 수 없습니다.",
    ],
  ],
  [
    "wcbt-7afa6e4e-4671-4bce-b61a-5d632c452259",
    [
      "official_source_unreachable: 연결된 첨부가 문서 내용 대신 SPA 셸만 반환해 환기·호흡보호구 선택지를 직접 검증할 수 없습니다.",
    ],
  ],
  [
    "wcbt-7f217133-abbe-4aa7-ad38-ab2aba2d869c",
    [
      "official_source_partial: 연결된 안전 근거가 일부 원칙만 지지하고 문항의 정답과 네 선택지 전체를 직접 판정하지 못합니다.",
    ],
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_10 =
  WELDING_CBT_ANSWER_REVIEWS_PART_10_AUTHORED.map((entry) => {
    const forcedHoldReasons = FORCED_HOLD_REASONS.get(entry.canonicalId);
    if (!forcedHoldReasons) return entry;
    return holdCandidate(
      entry.canonicalId,
      entry.contentDigest,
      entry.assessmentKind,
      forcedHoldReasons,
    );
  });
