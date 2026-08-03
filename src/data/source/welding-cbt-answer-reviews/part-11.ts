const AUTHOR = "codex-welding-author-part-11";
const AUTHORED_AT = "2026-08-02T15:55:36.653Z";
const REVIEWER = "codex-welding-reviewer-part-11";
const REVIEWED_AT = "2026-08-02T16:13:59.089Z";

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
  holdReason: string,
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
    holdReasons: [holdReason],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  } as const;
}

const RAW_WELDING_CBT_ANSWER_REVIEWS_PART_11 = [
  holdCandidate(
    "wcbt-7f774cbd-2064-4e3d-a315-eff2f15d2e85",
    "08b49f91f72ecd411a8c20908d76a1331ee3c8b36e7391af8aeff3871c3a00e1",
    "definition",
    "lesson_gap: 지정된 MIG 레슨이 존재하지 않아 burn back time과 크레이터 처리 기능을 직접 연결할 수 없음",
  ),
  holdCandidate(
    "wcbt-80706c8a-dcaa-46b3-b224-5b0be9571ad1",
    "17a469c42d2cf875b0d875b40293662ee54c7dda352ea13cd4fd7ae7b6542d72",
    "safety",
    "safety_primary_source_missing: 가스 폭발 예방의 최우선 조치를 확인할 KOSHA·법령 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-8110b161-2486-4565-af02-fe35b463d8d5",
    "e5602788cdb84a0161fde1021a8e267fe913567364f97092afc199cbea83e9da",
    "safety",
    "safety_primary_source_missing: 가연성 가스용기 세워 보관 기준을 확인할 KOSHA·법령 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-8136767c-e891-4be3-b146-2262eb3b1609",
    "78cee8d9fd0d7e76ef09e0d99eb6bdfb35cb0595356f8202874c183275fae67c",
    "calculation",
    "missing_direct_formula_evidence: 산소량 40.7×100과 프랑스식 100번 팁의 시간당 소비량을 연결하는 계산 근거가 레슨에 없음",
  ),
  holdCandidate(
    "wcbt-8256a6bc-6d25-4444-aee5-433e254cc50a",
    "c3ced16c75494148266e493b2a9439990ff12df23f48b273a53afbdc809f7c53",
    "safety",
    "safety_primary_source_missing: 가연성 물질 인접 용접 금지와 고온 작업복 기준을 확인할 공식 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-82d1138e-598e-4c93-abd5-3cf8336e9f79",
    "8b785a105e6f543efa5140591f21b5464173ca4d148d17f8db4a6a1e206df382",
    "definition",
    "lesson_gap: 교류 아크 용접기의 전류 조정범위 20~110% 수치를 직접 뒷받침하는 레슨 문장이 없음",
  ),
  holdCandidate(
    "wcbt-82dc3102-37c3-4776-87d6-687fd59c644b",
    "8c9cddfa76fb7b1811347dd6fc6463937f41bda718f198b273b5631605f0ed4e",
    "safety",
    "safety_primary_source_missing: 산소용기 각인 FP의 공식 정의를 확인할 고압가스 용기 기준 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-8300ec36-b2c5-46ab-ba1c-2d0dbfe2e0f3",
    "a5dfa64f73a1f4081de8a549e75f291b59323264c6b2b7f330443e3395970261",
    "definition",
    "lesson_gap: 정류기형 직류 용접기의 맥류 특성과 발전기형 대비 특성을 직접 설명하는 레슨 문장이 없음",
  ),
  {
    canonicalId: "wcbt-84152a71-d25a-4012-867d-fec93e3b54c7",
    contentDigest:
      "bb8d23d4ce246737b6316903c6b7b489589bd9767defc8984167132ced20ec2f",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "definition",
      assertionText:
        "자동전격방지기는 교류 아크용접기의 감전 방지를 목적으로 합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#definition",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#structure",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-84152a71-d25a-4012-867d-fec93e3b54c7",
        },
      ],
    },
    answerExplanation:
      "자동전격방지장치는 교류 아크용접을 하지 않을 때 출력측 무부하전압을 낮춰 홀더와 전극 접촉에 따른 감전 위험을 줄이는 장치입니다. 따라서 감전방지 목적에 직접 맞는 4번이 정답입니다.",
    solutionSteps: [
      "각 보기가 작업자의 전기 접촉 위험이나 용접기 출력측 무부하전압을 직접 통제하는 장치인지 구분합니다.",
      "아크가 꺼진 뒤 무부하전압을 낮추는 자동전격방지장치를 감전방지 장치로 선택합니다.",
    ],
    keyRule:
      "자동전격방지장치는 교류 아크용접기의 비작업 시 출력측 무부하전압을 낮춰 감전 위험을 줄입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "헬멧은 머리의 낙하·비래 위험을 줄이는 개인보호구이지만 용접기 출력측 무부하전압을 낮추는 전기 방호장치는 아닙니다.",
        plausibleReason:
          "안전 보호구라는 공통점만 보고 감전방지 장치로 넓게 판단하면 선택하기 쉽습니다.",
        incorrectPoint:
          "헬멧은 홀더·전극의 통전 경로나 용접기의 무부하전압을 직접 제어하지 않습니다.",
        keyRule:
          "문항이 묻는 것은 일반 보호구가 아니라 용접기의 감전 위험을 직접 낮추는 전기 방호장치입니다.",
        differenceFromCorrect:
          "1번은 머리 보호구이고, 정답 4번은 출력측 무부하전압을 자동으로 낮추는 장치입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "리미트 스위치는 기계의 위치나 이동 한계를 검출하는 제어부품으로, 용접기의 무부하전압을 낮추는 전격방지장치가 아닙니다.",
        plausibleReason:
          "이름에 스위치가 있어 전원을 자동 차단하는 감전방지 장치처럼 보일 수 있습니다.",
        incorrectPoint:
          "리미트 스위치의 위치 검출 기능은 홀더·전극 접촉 시의 출력측 전격 위험을 직접 줄이지 않습니다.",
        keyRule:
          "장치 이름보다 어떤 전압과 접촉 경로를 통제하는지를 기준으로 감전방지 기능을 판단합니다.",
        differenceFromCorrect:
          "2번은 위치 검출용 제어부품이고, 정답 4번은 비작업 시 용접기 출력전압을 낮춥니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "2차 권선장치는 용접 변압기의 출력 전압·전류를 만드는 구성부이지, 비작업 시 무부하전압을 자동 저감하는 보호장치 자체가 아닙니다.",
        plausibleReason:
          "출력측과 관련된 부품이므로 전격 위험도 자동으로 제어할 것이라고 혼동할 수 있습니다.",
        incorrectPoint:
          "출력을 만드는 2차 권선과 무부하전압을 안전한 수준으로 낮추는 전격방지 기능은 역할이 다릅니다.",
        keyRule:
          "용접기 구성부와 감전 위험을 줄이도록 설계된 보호장치를 기능으로 구분합니다.",
        differenceFromCorrect:
          "3번은 출력측 구성부이고, 정답 4번은 아크가 꺼진 뒤 무부하전압을 낮추는 보호장치입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "자동전격방지장치는 교류 아크용접을 하지 않을 때 출력측 무부하전압을 낮춰 감전 위험을 줄이므로 문항의 목적에 직접 맞습니다.",
        plausibleReason:
          "장치 이름만 외우면 아크 중 전압까지 항상 0으로 만드는 장치라고 과도하게 이해할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "자동전격방지장치는 비작업 상태의 무부하전압을 저감하는 장치이며 다른 절연·접지 조치를 대신하지 않습니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-84763bc0-9648-4942-a4e5-4e9ef4659b74",
    contentDigest:
      "b20998e1fae1fec599d57b8cbad9f560c512471867345347ca921eca70f0ba9f",
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
          ref: "lesson-welding-safety-electrical#structure",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#definition",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#principle",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-84763bc0-9648-4942-a4e5-4e9ef4659b74",
        },
      ],
    },
    answerExplanation:
      "전격 위험은 접촉 전압이 높고 인체·작업환경의 저항이 낮을수록 커집니다. 젖은 몸, 땀, 파손된 케이블 피복은 위험을 키우지만 낮은 무부하전압은 감전을 일으킬 전압을 줄이므로 네 보기 중 3번의 위험성이 가장 작습니다.",
    solutionSteps: [
      "젖은 몸·땀·파손된 절연이 인체 저항과 충전부 접촉 가능성에 미치는 영향을 확인합니다.",
      "무부하전압을 낮추는 조치는 위험을 없애지는 않지만 다른 세 보기와 달리 전격 위험을 줄인다고 판단합니다.",
    ],
    keyRule:
      "습윤과 절연 손상은 감전 위험을 높이고, 출력측 무부하전압 저감은 비작업 시 감전 위험을 낮춥니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "젖은 몸에 전류가 흐를 수 있는 홀더가 닿으면 피부와 보호구의 저항이 낮아져 인체를 통한 통전 위험이 커집니다.",
        plausibleReason:
          "홀더 외피가 항상 완전 절연되어 있다고 가정하면 젖은 상태의 영향을 작게 볼 수 있습니다.",
        incorrectPoint:
          "습윤 상태는 인체 저항을 낮추므로 전격 위험이 가장 적은 조건이 아니라 위험을 높이는 조건입니다.",
        keyRule:
          "젖은 인체와 전기용접 홀더의 접촉은 감전 전류가 흐를 가능성을 키웁니다.",
        differenceFromCorrect:
          "1번은 습윤으로 위험이 커지고, 정답 3번은 무부하전압 자체를 낮춰 위험을 줄입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "땀을 흘리면 피부와 장갑·의복이 젖어 인체 저항이 낮아질 수 있으므로 전기용접 중 감전 위험이 커집니다.",
        plausibleReason:
          "땀을 작업 피로 문제로만 보고 전기 저항과의 관계를 놓치면 위험이 작다고 오판할 수 있습니다.",
        incorrectPoint:
          "땀으로 인한 습윤은 전류가 인체를 통과하기 쉬운 조건을 만들므로 저위험 조건이 아닙니다.",
        keyRule:
          "땀이나 물에 젖은 상태에서는 작업을 중지하고 건조·절연 상태를 회복한 뒤 용접합니다.",
        differenceFromCorrect:
          "2번은 인체 저항을 낮추는 조건이고, 정답 3번은 감전 구동 전압을 낮추는 조건입니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "무부하전압이 낮으면 용접하지 않을 때 홀더와 전극에 노출되는 접촉 전압이 줄어 네 조건 중 전격 위험이 상대적으로 가장 작습니다.",
        plausibleReason:
          "전압이 낮아도 감전 가능성이 완전히 사라지는 것은 아니어서 정답이 아니라고 망설일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "위험이 가장 적다는 비교는 무위험을 뜻하지 않으며 낮은 무부하전압도 절연·접지와 함께 관리합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "케이블 피복이 파괴되면 충전부가 노출되거나 누설 통전 경로가 생겨 작업자가 전류에 접촉할 가능성이 커집니다.",
        plausibleReason:
          "도체가 완전히 끊어져 전류가 흐르지 않는 상황으로 잘못 가정하면 위험이 낮아 보일 수 있습니다.",
        incorrectPoint:
          "피복 파괴는 절연 성능을 떨어뜨리는 결함이므로 사용을 중지하고 적정 규격으로 수리·교체해야 합니다.",
        keyRule:
          "손상된 용접 케이블은 감전과 발열 위험을 높이므로 그대로 사용하지 않습니다.",
        differenceFromCorrect:
          "4번은 절연 손상으로 위험이 커지고, 정답 3번은 무부하전압이 낮아 위험이 상대적으로 작습니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-84f775a0-c945-40ff-a349-f48457be3752",
    "e02d2374c89af48276ff3a68b9c02085df26b6750767ddd89035209ca69869fe",
    "identification",
    "classification_mismatch: 애드미럴티 황동 조성 문제인데 환기 레슨으로 분류되어 재료 조성의 직접 근거가 없음",
  ),
  holdCandidate(
    "wcbt-85708e17-4943-4867-acd6-9dd53ab04a3e",
    "2c54e27e88cb8b379181de04c3dd47d7bf11433c37c7da09196574cdda844ccf",
    "definition",
    "lesson_gap: 비파괴검사 레슨이 누설시험·피로시험의 분류와 피로시험의 반복하중·파괴 특성을 직접 설명하지 않아 모든 보기의 판단근거를 검증할 수 없음",
  ),
  holdCandidate(
    "wcbt-85957333-1657-4bf9-beb9-2e6e7ef627bf",
    "1d09cc5315d0b56533c7b2641b248d2fda15a12ca8d52f9b7d9a170b8a3b1306",
    "safety",
    "safety_primary_source_missing: 산소용기 최고 충전압력 FP 각인을 확인할 고압가스 용기 기준 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-85f146ae-1ef7-4a74-994d-af4975753cfd",
    "bffecd2f87d6e6fa7ebc94860d698ec60e8af770c98b890b134c6d71e683ca2b",
    "safety",
    "safety_primary_source_missing: 종이·목재·석탄 화재의 A급 분류를 확인할 소방 관련 공식 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-868cd16d-a8be-406d-90d9-30db9b7fcf2d",
    "ddd05349d36a0dfd8feb33b4950ade43b3836b8a0cff3d5c902a613648611dc3",
    "calculation",
    "missing_direct_formula_evidence: 산소량 33×100과 프랑스식 300번 팁 소비량을 연결하는 계산 근거가 레슨에 없음",
  ),
  holdCandidate(
    "wcbt-86ef214a-a8b8-4b1d-8eb2-67d88b6920c1",
    "a9f34752a664653c59d9cd2c7ac2b836bf7a98a50e92eb7b6e0ce80d3b205bd1",
    "definition",
    "classification_mismatch: 냉간압접 공정 정의 문제인데 용접 변형·잔류응력 레슨에는 냉간압접의 직접 정의가 없음",
  ),
  holdCandidate(
    "wcbt-889870ba-3d06-4112-aae8-9975e6f8d278",
    "2c8490efdcf5b363091af743532229266352185d081b38a9bb33a8ed72e3dded",
    "safety",
    "safety_primary_source_missing: 점용접 보호안경·접지·유분 제거 기준을 확인할 공식 안전 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-88ee8d21-9fe9-45cc-8dc7-3578cba39e55",
    "2a36c28d0bf392592b6876804b5f6c2001a5c447d6a4ab6cfce9a9246e6eeef7",
    "safety",
    "safety_primary_source_missing: 3.2mm 이하 가스용접 차광번호 4~5를 확인할 공식 보호구 기준 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128",
    "cbbcbd9d410c7ed56474ec2fd3e0e59168bd94dd4f73df927f67063ef85496ab",
    "safety",
    "lesson_gap_and_primary_source_missing: 안전보건 지시표지의 파란색 기준 레슨이 없고 공식 원문 URL도 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-8b411328-b443-462d-b541-04b20f0d1009",
    "91c1bcfda2637383178dc06ab3a58cf1e246047f2498a4c253e7cbdb8e99f701",
    "definition",
    "lesson_gap: 가스절단 레슨에 프로판의 공기 대비 비중·증발잠열·액화성에 대한 직접 설명이 없음",
  ),
  holdCandidate(
    "wcbt-8b917311-40fb-4ad0-83e4-f4defa8993e2",
    "9f4e97878c995c36ccfb9b9e4d814eb237d5aaf7e7589b3f170d2b741ac77559",
    "safety",
    "safety_primary_source_missing: 금속흄열의 증상과 혈액 변화 판단을 확인할 KOSHA·보건 공식 원문 URL이 연결되지 않음",
  ),
  holdCandidate(
    "wcbt-8bd32a13-a544-4238-8cf9-7b73632b9ed2",
    "b632b910b3e225859e3210442177cf9c138d0445f9aeff3c13fe4f8b29e5aec3",
    "principle",
    "lesson_gap: 동일 입열에서 스테인리스강의 냉각속도가 가장 느린 이유를 열전도율로 비교하는 직접 근거가 없음",
  ),
  holdCandidate(
    "wcbt-8c6297e5-7253-427d-8e7d-d69da076df9b",
    "a07a0defca69a8a1e7739863547bb5416093b41d22848e7f61c608573d54901b",
    "definition",
    "lesson_gap: 비파괴검사 레슨이 크리프시험과 맴돌이전류시험의 정의·분류를 직접 설명하지 않아 모든 보기의 판단근거를 검증할 수 없음",
  ),
  holdCandidate(
    "wcbt-8d95af75-7382-4895-a637-dd79dea99d64",
    "3f961d0c1ff0584cb149921313b106594838b71c4a097db00b52431bdbbb0835",
    "definition",
    "lesson_gap: 규산나트륨·규산칼륨이 피복제를 심선에 붙이는 고착제라는 직접 근거가 레슨에 없음",
  ),
  {
    canonicalId: "wcbt-8dc15426-0548-4953-aa70-cd2ff217b9fa",
    contentDigest:
      "eb4751ecc1b2c6e3e112a555f0b43fcd05119730feb23fe8fa7b05c4fa0f739d",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "definition",
      assertionText:
        "도전성이 높은 밀폐공간 또는 습윤 장소는 인체 저항을 낮추거나 접촉 가능성을 높여 감전 위험을 키웁니다.",
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
          ref: "lesson-welding-safety-ppe#definition",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=521&callmode=normal&catimage=&eclang=ko&start=26&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-8dc15426-0548-4953-aa70-cd2ff217b9fa",
        },
      ],
    },
    answerExplanation:
      "땀이 많이 나는 좁은 장소는 습윤과 도전성 구조물 접촉 때문에 인체 저항이 낮아지고 접촉 가능성이 커지는 고위험 조건입니다. 이런 곳에서 신체를 노출해도 된다는 4번은 전격방지 원칙과 반대이므로 틀린 주의사항입니다.",
    solutionSteps: [
      "전원 차단·무부하전압 저감·보호구 착용처럼 위험을 줄이는 조치와 위험을 키우는 행동을 구분합니다.",
      "협소하고 땀이 나는 장소에서 신체를 노출한다는 4번이 습윤·접촉 위험을 동시에 높인다고 판단합니다.",
    ],
    keyRule:
      "협소·습윤 장소에서는 신체 노출을 피하고 전원 차단, 절연 상태 확인과 적합한 보호구를 함께 적용합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "작업을 장시간 중지할 때 전원 스위치를 차단하면 무부하 상태의 홀더·전극에 불필요하게 전압이 남는 상황을 막을 수 있습니다.",
        plausibleReason:
          "용접하지 않으면 전류가 흐르지 않는다고 생각해 스위치 차단이 불필요해 보일 수 있습니다.",
        incorrectPoint:
          "아크가 꺼져도 전원이 켜져 있으면 출력측 무부하전압이 존재할 수 있으므로 장시간 중지 시 차단이 필요합니다.",
        keyRule:
          "용접을 계속하지 않을 때는 전원을 차단해 비작업 상태의 우발 접촉 위험을 제거합니다.",
        differenceFromCorrect:
          "1번은 전원을 제거하는 올바른 조치이고, 정답 4번은 습윤한 협소 장소에서 접촉 위험을 높입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "필요 이상으로 높은 무부하전압은 비작업 시 접촉 전압을 키우므로 적정 전압의 용접기와 전격방지장치를 사용하는 것이 맞습니다.",
        plausibleReason:
          "아크 점화에는 전압이 필요하므로 높을수록 작업에 유리하다고만 생각하면 이 조치를 틀렸다고 볼 수 있습니다.",
        incorrectPoint:
          "아크 점화 성능과 작업자에게 노출되는 무부하전압의 감전 위험을 구분해야 합니다.",
        keyRule:
          "무부하전압은 아크 점화에 필요하지만 비작업 시에는 전격방지장치로 낮춰 관리합니다.",
        differenceFromCorrect:
          "2번은 접촉 전압을 줄이는 올바른 조치이고, 정답 4번은 신체 노출로 통전 가능성을 키웁니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "가죽장갑·앞치마·발 덮개 같은 규정된 용접 보호구는 손·몸·발을 열과 불티 및 작업 중 접촉 위험으로부터 보호하므로 착용 지시는 맞습니다.",
        plausibleReason:
          "보호구가 전원 차단이나 절연을 대신할 수 없다는 사실을 ‘보호구가 필요 없다’는 뜻으로 오해할 수 있습니다.",
        incorrectPoint:
          "보호구만으로 전격방지가 끝나는 것은 아니지만, 적합한 보호구 착용 자체는 생략해서는 안 되는 기본 조치입니다.",
        keyRule:
          "용접 보호구는 전원 차단·절연과 병행하며 공학적 방호를 대신하지 않습니다.",
        differenceFromCorrect:
          "3번은 규정된 보호구를 착용하는 조치이고, 정답 4번은 고위험 환경에서 신체를 노출하라고 합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "땀이 많이 나는 좁은 장소에서 신체를 노출하면 인체 저항이 낮아지고 주변 도전성 구조물과의 접촉 가능성이 커져 감전 위험이 증가합니다.",
        plausibleReason:
          "통풍을 위해 피부를 노출하면 땀이 줄어 안전할 것이라고 단순하게 생각하면 그럴듯해 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "협소·습윤 장소에서는 노출을 늘리는 대신 건조·절연 상태와 전원 차단을 확보해야 합니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-8e49c987-7eae-400b-a310-44c7b1243175",
    "f50e8fa0cc69e9e6e0ff26d6ff335fabf2e55a09c412b3df5dfceb33678b4bed",
    "safety",
    "safety_primary_source_missing: 작업 종료·장시간 중지 시 전원 차단 기준을 확인할 KOSHA·법령 원문 URL이 연결되지 않음",
  ),
  {
    canonicalId: "wcbt-8eeaa651-8843-46ee-a866-cf3f942db146",
    contentDigest:
      "e719ec9dc58c978bec63750a5c6be6bea3f85cfafc5794afba231376cbf7ab53",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
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
          kind: "lesson_block",
          ref: "lesson-welding-safety-ppe#definition",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=521&callmode=normal&catimage=&eclang=ko&start=26&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-8eeaa651-8843-46ee-a866-cf3f942db146",
        },
      ],
    },
    answerExplanation:
      "안전화·용접장갑·핸드실드는 각각 발, 손, 눈과 얼굴을 열·불티·유해광선으로부터 보호하기 위해 착용하는 보호구입니다. 핸드 그라인더는 재료를 연삭하는 전동 작업 공구이므로 보호구가 아닌 4번이 정답입니다.",
    solutionSteps: [
      "각 보기를 작업자가 신체에 착용하는 보호구인지 재료에 작업을 가하는 공구인지 나눕니다.",
      "안전화·장갑·핸드실드와 달리 연삭 작업에 사용하는 핸드 그라인더를 보호구가 아닌 것으로 선택합니다.",
    ],
    keyRule:
      "용접 보호구는 위험으로부터 신체를 보호하기 위해 착용하고, 핸드 그라인더 같은 전동공구는 작업 대상에 힘을 가하는 장비입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "안전화는 발을 불티·열과 작업 중 충격 위험으로부터 보호하기 위해 착용하는 개인보호구입니다.",
        plausibleReason:
          "용접면이나 장갑보다 용접 공정과의 연결이 약해 보여 일반 작업화로 오인할 수 있습니다.",
        incorrectPoint:
          "안전화는 작업자가 발에 착용해 위험을 줄이는 장비이므로 보호구 분류에 포함됩니다.",
        keyRule:
          "용접 작업은 눈·얼굴뿐 아니라 손과 발에 맞는 보호구도 함께 선택합니다.",
        differenceFromCorrect:
          "1번은 발에 착용하는 보호구이고, 정답 4번은 재료를 연삭하는 전동공구입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "용접장갑은 손을 고온, 불티와 뜨거운 금속 접촉으로부터 보호하기 위해 착용하는 보호구입니다.",
        plausibleReason:
          "장갑을 용접봉이나 소재를 잡는 작업 도구로만 보면 보호구라는 본래 기능을 놓칠 수 있습니다.",
        incorrectPoint:
          "용접장갑은 손에 착용해 열·불티 노출을 줄이므로 작업 공구가 아니라 보호구입니다.",
        keyRule:
          "용접장갑은 손의 열·불티 위험에 맞춰 선택하고 손상·젖음 상태를 사용 전에 확인합니다.",
        differenceFromCorrect:
          "2번은 손 보호구이고, 정답 4번은 회전 숫돌로 연삭하는 작업 공구입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "핸드실드는 차광필터와 얼굴 가림부로 용접광선과 비산물로부터 눈·얼굴을 보호하는 보호구입니다.",
        plausibleReason:
          "손에 들고 사용한다는 형태 때문에 손공구로 분류하기 쉽습니다.",
        incorrectPoint:
          "핸드실드는 작업물을 가공하는 도구가 아니라 작업자의 눈과 얼굴 앞에 두는 차광 보호구입니다.",
        keyRule:
          "손으로 잡는지보다 신체를 보호하는지 작업 대상에 힘을 가하는지로 보호구와 공구를 구분합니다.",
        differenceFromCorrect:
          "3번은 눈·얼굴 보호구이고, 정답 4번은 작업 대상의 표면을 연삭하는 공구입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "핸드 그라인더는 회전 숫돌로 용접부나 재료 표면을 연삭하는 전동공구이며 작업자가 착용하는 보호구가 아닙니다.",
        plausibleReason:
          "용접 전후 작업에 자주 필요한 장비라는 사실을 ‘용접 시 필요한 보호구’와 혼동할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "용접에 필요한 장비라도 신체 보호를 위해 착용하지 않으면 개인보호구로 분류하지 않습니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-8f2a8bdf-84c2-4d6c-a18e-bf9095360aaf",
    "0d88e2efa32f9feed8ab8fdbabf8fde0a8a1ae2cd2f7d1bb58e67a4839651a85",
    "safety",
    "safety_primary_source_missing: 가스 누설을 불꽃으로 검사하면 안 된다는 기준을 확인할 공식 가스안전 원문 URL이 연결되지 않음",
  ),
] as const;

const FINAL_REVIEWED_AT = "2026-08-03T03:15:00.000Z";

const FINAL_SOURCE_HOLD_REASONS: Readonly<Record<string, string>> = {
  "wcbt-84152a71-d25a-4012-867d-fec93e3b54c7":
    "official_source_partial: KOSHA 자료는 자동전격방지장치의 무부하전압 저감 기능은 직접 확인하지만 헬멧·리미트 스위치·2차 권선의 기능을 같은 source locator에서 모두 대조하지 못해 네 보기 전체를 승인할 수 없습니다.",
  "wcbt-84763bc0-9648-4942-a4e5-4e9ef4659b74":
    "official_source_partial: KOSHA 자료는 습윤·절연 손상과 자동전격방지 대책은 확인하지만 ‘무부하전압이 낮은 용접기’와 나머지 세 조건의 상대 위험을 네 보기 전체로 직접 비교하지 못합니다.",
  "wcbt-8eeaa651-8843-46ee-a866-cf3f942db146":
    "official_source_partial: KOSHA 자료는 안전화·용접장갑·핸드실드의 보호구 용도는 확인하지만 핸드그라인더를 연삭 전동공구로 직접 분류하는 같은 수준의 source locator가 없어 네 보기 전체를 승인할 수 없습니다.",
};

export const WELDING_CBT_ANSWER_REVIEWS_PART_11 =
  RAW_WELDING_CBT_ANSWER_REVIEWS_PART_11.map((entry) => {
    const finalHoldReason = FINAL_SOURCE_HOLD_REASONS[entry.canonicalId];
    if (finalHoldReason) {
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
        holdReasons: [finalHoldReason],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }

    if (
      entry.canonicalId ===
      "wcbt-84152a71-d25a-4012-867d-fec93e3b54c7"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        primaryLeafLessonId: "lesson-welding-safety-electrical",
        conceptBinding: {
          lessonId: "lesson-welding-safety-electrical",
          lessonBlockId: "structure",
          assertionText:
            "헬멧은 광선·비산물용 보호구, 리미트 스위치는 위치·한계 검출용 제어부품, 2차 권선은 용접기 전원 구성부품이므로 자동전격방지장치와 기능이 다릅니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-electrical#structure",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
            },
            {
              kind: "source_question" as const,
              ref: entry.canonicalId,
            },
          ],
        },
        answerExplanation:
          "아크가 꺼진 비작업 상태에서 교류 아크용접기의 출력측 무부하전압을 신속히 낮춰 감전 위험을 줄이는 장치는 자동전격방지장치입니다. 따라서 4번이 정답입니다.",
        solutionSteps: [
          "문항이 요구하는 기능을 ‘아크가 없을 때 출력측 무부하전압 저하’로 바꿔 읽습니다.",
          "헬멧은 광선·비산물 보호, 리미트 스위치는 위치 검출, 2차 권선은 전원 구성부품이므로 제외합니다.",
          "감전 예방을 위해 무부하전압을 낮추는 자동전격방지장치를 선택합니다.",
        ],
        keyRule:
          "자동전격방지장치는 아크 정지 후 교류 아크용접기의 출력측 무부하전압을 0.1초 이내 25V 이하로 낮춥니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale:
              "헬멧은 아크광과 비산물로부터 머리·눈·얼굴을 보호하는 개인보호구입니다.",
            plausibleReason:
              "용접 안전장비라는 공통점 때문에 감전방지장치처럼 보일 수 있습니다.",
            incorrectPoint:
              "헬멧은 용접기의 출력측 무부하전압을 낮추거나 전기회로를 차단하지 않습니다.",
            keyRule:
              "광선·비산물용 보호구와 전기적 감전방지장치를 기능으로 구분합니다.",
            differenceFromCorrect:
              "헬멧은 착용형 보호구이고 자동전격방지장치는 용접기 회로의 무부하전압을 낮추는 장치입니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale:
              "리미트 스위치는 기계의 위치나 이동 한계를 검출하는 제어부품입니다.",
            plausibleReason:
              "조건이 되면 자동으로 동작하는 스위치라는 점이 전격방지장치와 비슷해 보일 수 있습니다.",
            incorrectPoint:
              "리미트 스위치는 아크 정지 상태의 용접기 출력전압을 안전전압으로 낮추는 전용장치가 아닙니다.",
            keyRule:
              "위치 검출용 제어부품과 용접기 전기안전장치를 구분합니다.",
            differenceFromCorrect:
              "리미트 스위치는 위치 신호를 만들지만 자동전격방지장치는 무부하전압을 저하시킵니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale:
              "2차 권선은 용접에 필요한 출력 전압과 전류를 만드는 변압기 구성부품입니다.",
            plausibleReason:
              "출력측에 위치하므로 감전 위험을 자동으로 제어하는 부품처럼 오인하기 쉽습니다.",
            incorrectPoint:
              "2차 권선 자체에는 비작업 시 무부하전압을 자동으로 안전전압까지 낮추는 기능이 없습니다.",
            keyRule:
              "전원 구성부품과 별도의 보호장치를 역할로 구분합니다.",
            differenceFromCorrect:
              "2차 권선은 출력을 만들고 자동전격방지장치는 비작업 시 그 무부하전압을 낮춥니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale:
              "자동전격방지장치는 용접하지 않을 때 출력측 무부하전압을 안전전압으로 낮춰 감전 위험을 줄입니다.",
            plausibleReason:
              "문항의 ‘아크 용접기의 감전방지’라는 기능과 장치의 목적이 직접 일치합니다.",
            incorrectPoint: null,
            keyRule:
              "아크 정지 후 무부하전압 저하가 핵심 기능이면 자동전격방지장치입니다.",
            differenceFromCorrect: null,
          },
        ],
        holdReasons: [],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }

    if (
      entry.canonicalId ===
      "wcbt-84763bc0-9648-4942-a4e5-4e9ef4659b74"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        primaryLeafLessonId: "lesson-welding-safety-electrical",
        conceptBinding: {
          lessonId: "lesson-welding-safety-electrical",
          lessonBlockId: "structure",
          assertionText:
            "젖은 몸에 홀더가 닿는 경우, 땀을 흘리는 상태, 케이블 피복 파괴는 전격 위험을 키우지만 무부하전압이 낮은 용접기는 네 조건 중 위험이 가장 적습니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-electrical#structure",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s",
            },
            {
              kind: "source_question" as const,
              ref: entry.canonicalId,
            },
          ],
        },
        answerExplanation:
          "젖은 몸·땀·손상된 케이블 절연은 인체 통전 가능성을 높이지만, 무부하전압이 낮으면 같은 조건에서 감전 구동전압이 작아집니다. 네 보기 중 전격 위험이 가장 적은 것은 3번입니다.",
        solutionSteps: [
          "‘위험성이 가장 적은 것’을 찾는 부정 비교형 문항임을 표시합니다.",
          "젖음과 땀은 인체 저항을 낮추고, 케이블 피복 파괴는 충전부 접촉 가능성을 높이는 위험요인으로 분류합니다.",
          "위험을 키우는 세 보기와 달리 무부하전압을 낮춘 3번을 선택합니다.",
        ],
        keyRule:
          "전격 위험 비교에서는 습윤·절연 손상은 위험 증가, 낮은 무부하전압은 위험 감소 방향으로 판단합니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale:
              "젖은 몸은 인체의 전기저항을 낮춰 홀더 접촉 시 통전 위험을 높입니다.",
            plausibleReason:
              "‘홀더가 닿았다’는 접촉만 보고 다른 보기와 위험 정도가 같다고 생각할 수 있습니다.",
            incorrectPoint:
              "젖은 상태가 인체 저항을 낮춘다는 추가 위험조건을 놓쳤습니다.",
            keyRule:
              "습윤 상태는 감전 위험을 낮추는 조건이 아니라 높이는 조건입니다.",
            differenceFromCorrect:
              "1번은 습윤으로 위험이 커지지만 3번은 무부하전압이 낮아 위험이 상대적으로 작습니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale:
              "땀은 피부를 습윤하게 만들어 인체 저항을 낮추고 감전 위험을 높입니다.",
            plausibleReason:
              "땀을 단순한 작업 불편으로만 보면 전기적 위험과 연결하지 못할 수 있습니다.",
            incorrectPoint:
              "땀이 피부의 전기저항과 접촉조건에 미치는 영향을 빠뜨렸습니다.",
            keyRule:
              "땀·물·습기는 인체 통전 가능성을 높이는 대표 조건입니다.",
            differenceFromCorrect:
              "2번은 작업자의 저항을 낮추지만 3번은 용접기의 무부하전압 자체가 낮습니다.",
          },
          {
            choiceIndex: 2,
            relation: "supports" as const,
            rationale:
              "무부하전압이 낮은 용접기는 비작업 상태에서 충전부 접촉 시 인체에 걸릴 수 있는 전압이 상대적으로 작습니다.",
            plausibleReason:
              "나머지 보기가 모두 명백한 위험 증가 조건이므로 비교 결과가 직접 드러납니다.",
            incorrectPoint: null,
            keyRule:
              "같은 접촉조건이라면 무부하전압이 낮을수록 전격 위험은 상대적으로 작습니다.",
            differenceFromCorrect: null,
          },
          {
            choiceIndex: 3,
            relation: "refuted_by" as const,
            rationale:
              "케이블 피복 파괴는 충전부 노출과 누설전류 가능성을 높여 감전 위험을 키웁니다.",
            plausibleReason:
              "케이블이 모재 쪽 회로라는 이유로 작업자 감전과 직접 관계없다고 오해할 수 있습니다.",
            incorrectPoint:
              "절연 파괴가 접촉 가능성을 높이는 핵심 위험요인임을 반대로 판단했습니다.",
            keyRule:
              "피복 손상 케이블과 절연 파손 홀더는 사용하지 않고 보수·교체합니다.",
            differenceFromCorrect:
              "4번은 절연 파괴로 위험이 커지지만 3번은 낮은 무부하전압으로 위험이 상대적으로 작습니다.",
          },
        ],
        holdReasons: [],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }

    if (
      entry.canonicalId ===
      "wcbt-8dc15426-0548-4953-aa70-cd2ff217b9fa"
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
          "safety_primary_source_incomplete: 연결된 KOSHA 자료는 절연장갑·앞치마·발덮개와 낮은 무부하전압의 방향은 뒷받침하지만, ‘장시간 중지 시 스위치 차단’ 조건을 직접 확인할 근거가 없어 네 보기 전체를 승인할 수 없음",
        ],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }

    if (
      entry.canonicalId ===
      "wcbt-8eeaa651-8843-46ee-a866-cf3f942db146"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        primaryLeafLessonId: "lesson-welding-safety-ppe",
        conceptBinding: {
          lessonId: "lesson-welding-safety-ppe",
          lessonBlockId: "structure",
          assertionText:
            "안전화·용접장갑·핸드실드는 각각 발·손·눈과 얼굴을 보호하는 보호구이지만 핸드그라인더는 재료를 연삭하는 전동공구입니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-ppe#structure",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=473&callmode=normal&catimage=&eclang=ko&start=162&um=s",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=521&callmode=normal&catimage=&eclang=ko&start=26&um=s",
            },
            {
              kind: "source_question" as const,
              ref: entry.canonicalId,
            },
          ],
        },
        answerExplanation:
          "안전화·용접장갑·핸드실드는 작업자가 착용해 신체를 보호하는 개인보호구입니다. 핸드그라인더는 재료 표면을 연삭하는 전동공구이므로 안전 보호구가 아닌 4번이 정답입니다.",
        solutionSteps: [
          "각 보기가 작업자가 ‘착용하는 보호구’인지 재료를 가공하는 ‘작업공구’인지 구분합니다.",
          "안전화는 발, 용접장갑은 손, 핸드실드는 눈과 얼굴을 보호하므로 보호구로 남깁니다.",
          "회전 숫돌로 재료를 연삭하는 핸드그라인더를 보호구가 아닌 항목으로 선택합니다.",
        ],
        keyRule:
          "신체에 착용해 위험을 줄이는 장비는 보호구이고, 재료를 절단·연삭·가공하는 장비는 작업공구입니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale:
              "안전화는 낙하·충격·찔림 등 작업장의 발 부위 위험을 줄이기 위해 착용하는 보호구입니다.",
            plausibleReason:
              "일반 작업화와 모양이 비슷해 단순 복장으로 볼 수 있습니다.",
            incorrectPoint:
              "작업조건에 맞는 인증 안전화는 발을 보호하는 개인보호구입니다.",
            keyRule:
              "안전화는 작업조건과 등급에 맞춰 선택하는 발 보호구입니다.",
            differenceFromCorrect:
              "안전화는 착용형 보호구이고 핸드그라인더는 재료를 가공하는 전동공구입니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale:
              "용접장갑은 고열·불티와 전기적 접촉 위험으로부터 손을 보호하기 위해 착용합니다.",
            plausibleReason:
              "용접봉을 잡는 보조도구처럼 이름을 이해하면 공구로 오인할 수 있습니다.",
            incorrectPoint:
              "용접장갑은 손에 착용하는 개인보호구이며 재료를 가공하는 도구가 아닙니다.",
            keyRule:
              "장갑은 손 부위 화상과 접촉위험을 줄이는 착용형 보호구입니다.",
            differenceFromCorrect:
              "용접장갑은 손 보호구이고 핸드그라인더는 회전공구입니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale:
              "핸드실드는 용접 아크의 유해광선과 비산물로부터 눈과 얼굴을 가리는 보호구입니다.",
            plausibleReason:
              "손으로 들고 사용한다는 점 때문에 손공구로 분류하기 쉽습니다.",
            incorrectPoint:
              "사용 방식이 손잡이형이어도 목적은 눈과 얼굴 보호이므로 개인보호구입니다.",
            keyRule:
              "분류는 잡는 방식이 아니라 보호 대상과 기능으로 판단합니다.",
            differenceFromCorrect:
              "핸드실드는 눈·얼굴 보호구이고 핸드그라인더는 재료 연삭용 공구입니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale:
              "핸드그라인더는 회전 숫돌로 용접부나 재료 표면을 연삭하는 전동공구입니다.",
            plausibleReason:
              "용접 작업에 자주 함께 쓰이므로 용접 안전장비와 같은 범주로 묶기 쉽습니다.",
            incorrectPoint: null,
            keyRule:
              "용접에 필요한 장비라도 신체에 착용해 보호하지 않으면 개인보호구가 아닙니다.",
            differenceFromCorrect: null,
          },
        ],
        holdReasons: [],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }

    return entry;
  });
