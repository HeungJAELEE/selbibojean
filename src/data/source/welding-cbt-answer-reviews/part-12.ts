const RAW_WELDING_CBT_ANSWER_REVIEWS_PART_12 = [
  {
    canonicalId: "wcbt-901628ba-de3a-4f81-b9fc-76d7afb8b893",
    contentDigest:
      "e1db8fe881a3f6c46c63ceff067297b86f335a89e4e0b1ef88b40d1022b2113d",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-ppe",
    conceptBinding: {
      lessonId: "lesson-welding-safety-ppe",
      lessonBlockId: "definition",
      assertionText:
        "가스용접 불꽃에서도 강한 가시광선과 적외선이 나오고 비산물이 튈 수 있으므로 눈을 보호하는 작업에 적합한 차광 보안경 또는 용접면이 필요합니다.",
      evidenceRefs: [
        { kind: "lesson_block", ref: "lesson-welding-safety-ppe#definition" },
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
          ref: "wcbt-901628ba-de3a-4f81-b9fc-76d7afb8b893",
        },
      ],
    },
    answerExplanation:
      "가스용접 불꽃에서도 강한 가시광선과 적외선이 나오고 비산물이 튈 수 있으므로 작업에 맞는 차광 보안경 또는 용접면이 필요합니다. 따라서 ‘강한 빛이 나오지 않아 보안경이 필요 없다’는 4번이 틀린 설명입니다.",
    solutionSteps: [
      "각 보기가 추락·유해가스·화재·유해광선 중 어떤 위험을 통제하는지 구분합니다.",
      "가스용접의 불꽃과 비산물도 눈을 해칠 수 있으므로 보안경 생략 주장을 배제합니다.",
    ],
    keyRule:
      "가스용접에서도 유해광선과 비산물 위험에 맞는 차광 보안경 또는 용접면을 착용합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "고소 용접에서는 용접 위험과 별도로 추락·낙하 위험을 통제해야 하므로 안전모와 추락방지용 보호구를 갖추는 설명은 맞습니다.",
        plausibleReason:
          "용접 자체의 위험만 묻는 것으로 좁게 읽으면 고소작업 보호구가 관계없어 보일 수 있습니다.",
        incorrectPoint:
          "문제는 ‘용접작업 시 안전’ 전반을 묻고 있어 고소작업의 추락 위험도 포함합니다.",
        keyRule:
          "고소작업에서는 작업 종류와 무관하게 추락·낙하 위험을 먼저 통제합니다.",
        differenceFromCorrect:
          "1번은 실제 위험에 필요한 조치이고, 정답 4번은 눈 보호구를 불필요하다고 잘못 단정합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "용접 흄과 가스가 발생할 수 있으므로 전체환기나 국소배기 등 환기 조치를 검토해야 한다는 설명은 맞습니다.",
        plausibleReason:
          "보호구를 쓰면 환기가 없어도 된다고 오해하면 이 보기를 틀린 것으로 고르기 쉽습니다.",
        incorrectPoint:
          "호흡보호구는 환기와 같은 공학적 방호를 대신하지 않습니다.",
        keyRule:
          "용접 흄·가스는 발생원 제어와 환기를 우선하고 남는 위험에 호흡보호구를 적용합니다.",
        differenceFromCorrect:
          "2번은 유해가스 통제 원칙이고, 4번은 가스용접의 유해광선 위험을 부정합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "가연성 분진이나 화약류가 있는 장소의 화기작업은 화재·폭발 위험이 매우 크므로 금지하거나 위험물을 제거·격리해야 합니다.",
        plausibleReason:
          "소화기만 준비하면 작업할 수 있다고 생각하면 금지 조치를 과도하다고 볼 수 있습니다.",
        incorrectPoint:
          "폭발성 분위기에서는 사후 소화보다 점화원과 가연물의 접촉을 먼저 차단해야 합니다.",
        keyRule:
          "가연성 분진·폭발물 주변에서는 용접 불꽃이 점화원이 되므로 작업 전 위험 제거가 우선입니다.",
        differenceFromCorrect:
          "3번은 화재·폭발 예방의 올바른 조치이고, 4번은 눈 보호를 생략하게 만드는 잘못된 설명입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "가스용접 불꽃도 강한 가시광선·적외선과 비산물을 발생시키므로 작업에 맞는 차광 보안경 또는 용접면을 착용해야 합니다.",
        plausibleReason:
          "아크용접보다 빛이 약하다는 비교를 ‘눈 보호가 전혀 필요 없다’로 확대하면 그럴듯해 보입니다.",
        incorrectPoint: null,
        keyRule:
          "위험 강도가 상대적으로 낮다는 사실은 적합한 눈 보호구를 생략해도 된다는 뜻이 아닙니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: 1,
    essentialRationale: "가스용접에서도 눈 보호구가 필요하다는 유해광선·비산물 원칙을 묻습니다.",
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-91703a40-c539-4c1b-944f-21d1aa5ab13f",
    contentDigest:
      "c22d4ffa1de1e89b94de08c6cff3ef6c4d135b5410668bb4d06a91e4f8200e58",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "definition",
      assertionText:
        "용접 전기안전은 전원·용접기·케이블·홀더·모재와 작업자 사이에 의도하지 않은 전류가 흐르지 않도록 통제하는 것입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#definition",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-91703a40-c539-4c1b-944f-21d1aa5ab13f",
        },
      ],
    },
    answerExplanation:
      "수동 아크용접 홀더는 2차 무부하 상태에서 충전부에 접촉하면 감전될 수 있으므로 절연 상태가 나쁜 홀더를 사용해서는 안 됩니다. 따라서 낮은 전압이라는 이유로 전격 위험이 없다고 한 3번이 틀립니다.",
    solutionSteps: [
      "보기마다 유해광선·방사선·감전·화재 중 해당 위험과 예방조치가 맞는지 확인합니다.",
      "홀더는 작업자가 직접 잡는 충전부이므로 전압이 비교적 낮아도 절연 불량을 허용할 수 없습니다.",
    ],
    keyRule:
      "용접 홀더와 케이블은 사용 전 절연 상태를 확인하고 손상되거나 절연이 불량한 제품은 사용하지 않습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "아크빛의 자외선과 강렬한 가시광선은 눈을 손상시킬 수 있어 적합한 차광 보호구를 착용해야 한다는 설명은 맞습니다.",
        plausibleReason:
          "전기안전 문제라고 생각해 광선 보호를 무관한 내용으로 볼 수 있습니다.",
        incorrectPoint:
          "문제는 용접 안전 전반을 묻고 있어 아크광에 대한 눈 보호도 올바른 안전조치입니다.",
        keyRule:
          "아크 발생 작업에서는 차광 보안면 등 작업 조건에 맞는 유해광선 보호구를 사용합니다.",
        differenceFromCorrect:
          "1번은 유해광선 예방조치이고, 정답 3번은 절연 불량 홀더의 감전 위험을 부정합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "전자빔 용접 설비는 X선 등 방사선 방호가 필요한 공정이므로 누출에 주의해야 한다는 설명은 맞습니다.",
        plausibleReason:
          "전자빔을 일반 아크용접과 같은 광선 위험만 있는 공정으로 혼동할 수 있습니다.",
        incorrectPoint:
          "고에너지 전자빔 설비의 방사선 위험은 별도의 차폐와 관리 대상입니다.",
        keyRule:
          "전자빔 용접은 설비 차폐와 방사선 누출 관리 조건을 별도로 확인합니다.",
        differenceFromCorrect:
          "2번은 공정 고유의 방사선 위험을 지적하고, 3번은 홀더의 절연 불량을 허용합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "홀더의 절연이 나쁘면 충전부 접촉으로 감전될 수 있으므로 ‘전격사고 위험이 없다’는 단정이 틀립니다.",
        plausibleReason:
          "2차 전압이 1차보다 낮다는 비교만 보고 인체에 안전한 전압이라고 오해하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "상대적으로 낮은 전압이어도 접촉시간·습윤 상태·전류 경로에 따라 치명적인 감전이 발생할 수 있습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "도료·인화성 물질·가연성 가스는 용접 불꽃의 점화원이 될 수 있으므로 작업장 주변에서 제거·격리해야 합니다.",
        plausibleReason:
          "전기적 위험을 묻는 문제로 좁게 보면 화재 위험 설명이 틀린 보기처럼 보일 수 있습니다.",
        incorrectPoint:
          "용접 안전에는 감전뿐 아니라 화재·폭발 위험 통제도 포함됩니다.",
        keyRule:
          "화기작업 전에는 인화성 물질과 가연성 가스를 제거하고 폭발성 분위기를 확인합니다.",
        differenceFromCorrect:
          "4번은 올바른 화재 예방조치이고, 3번만 감전 위험을 없다고 잘못 말합니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-922e945a-a2af-4f2d-9d79-cef946bf1562",
    contentDigest:
      "ebd88e912e12d7f1b9908252471ac01a0f892bfbdf56cc347f83375d3d79134c",
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
      "lesson_gap_holder_type_A_B_C_D: 현재 감전 안전 레슨에 A형 안전홀더의 형식 구분과 구조 근거가 없습니다.",
      "official_primary_evidence_missing: A형을 정답으로 확정할 국내 공식 기술기준 원문을 직접 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-930074db-4314-4849-a66c-de84fb9d5312",
    contentDigest:
      "3663dd1f60376ee35760c885354da959b235c7bde973f4382f288b216fec8a84",
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
      "lesson_gap_exact_shade_table: 레슨은 전류에 맞는 차광번호 선택 원칙만 다루며 400A 이상에서 14번이라는 기준표가 없습니다.",
      "official_primary_evidence_missing: 해당 전류 구간과 차광도 번호를 직접 대조할 공식 표를 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-93154ef4-aea0-455d-8056-1cf2958182f3",
    contentDigest:
      "0728de1acae347ee117367d99707b38f29b11bdfcf134083dd71f7d3a13476ae",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-93154ef4-aea0-455d-8056-1cf2958182f3",
        },
      ],
    },
    answerExplanation:
      "감전 위험을 줄이려면 절연형 홀더, 완전한 단자 절연, 손상 없는 적정 굵기 케이블을 사용하고 무부하전압은 낮춰야 합니다. 따라서 무부하전압이 높은 용접기를 사용한다는 2번이 옳지 않습니다.",
    solutionSteps: [
      "각 보기가 충전부 접촉 가능성이나 고장전류 경로를 줄이는지 확인합니다.",
      "용접하지 않을 때의 무부하전압은 낮을수록 홀더 접촉 시 감전 위험을 줄이는 방향입니다.",
    ],
    keyRule:
      "교류 아크용접기의 자동전격방지장치는 비용접 시 2차 무부하전압을 안전한 수준으로 낮춥니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "절연형 홀더는 작업자가 잡는 충전부와 인체의 직접 접촉 가능성을 줄이므로 올바른 감전 예방대책입니다.",
        plausibleReason:
          "홀더보다 전원 차단 장치만 중요하다고 생각하면 절연형 홀더의 효과를 과소평가할 수 있습니다.",
        incorrectPoint:
          "절연은 전격방지기와 목적이 다르며 함께 적용하는 독립적인 방호수단입니다.",
        keyRule:
          "홀더의 절연은 충전부 노출과 직접 접촉을 막는 기본 조치입니다.",
        differenceFromCorrect:
          "1번은 감전 가능성을 낮추지만, 정답 2번은 위험한 높은 무부하전압을 선택합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "높은 2차 무부하전압은 아크가 꺼진 상태의 홀더 접촉 시 감전 위험을 키우므로 방지대책이 아닙니다.",
        plausibleReason:
          "전압이 높으면 아크 시동이 쉬워 작업성이 좋아진다는 장점만 생각하면 안전대책처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "작업성 향상과 감전 예방은 구분하며, 비작업 시 출력측 무부하전압은 낮추는 방향이 안전합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "단자와 케이블 접속부를 완전히 절연하면 충전부 노출과 우발 접촉을 줄이므로 올바른 조치입니다.",
        plausibleReason:
          "접지만 되어 있으면 단자 절연은 불필요하다고 오해할 수 있습니다.",
        incorrectPoint:
          "접지는 고장전류 경로를 만들고 절연은 직접 접촉을 막으므로 어느 하나가 다른 조치를 대신하지 않습니다.",
        keyRule:
          "용접기 단자와 케이블 접속부에는 손상 없는 절연 덮개나 절연 처리를 유지합니다.",
        differenceFromCorrect:
          "3번은 접촉 위험을 낮추지만, 2번은 무부하전압을 높여 위험을 키웁니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "손상되지 않고 부하에 맞는 굵기의 케이블은 과열과 절연 파괴를 줄이므로 올바른 안전대책입니다.",
        plausibleReason:
          "케이블 굵기를 용접 품질 문제로만 보고 감전과 무관하다고 생각할 수 있습니다.",
        incorrectPoint:
          "부적정 케이블은 과열·손상으로 절연 성능을 떨어뜨려 전기재해 위험을 높입니다.",
        keyRule:
          "용접전류에 맞는 규격과 온전한 절연 상태의 케이블을 사용합니다.",
        differenceFromCorrect:
          "4번은 케이블 고장을 예방하고, 2번은 인체 접촉 시 전격 위험을 증가시킵니다.",
      },
    ],
    essentialRank: 1,
    essentialRationale: "무부하전압을 낮춰야 감전 위험이 줄어든다는 장비 선택 규칙을 직접 묻습니다.",
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9398f220-d2e7-4e16-b52b-c594091d6dd1",
    contentDigest:
      "289426955fa7c2cb816ffca69ae4eb746ecea2d5b8caecb85cb7ec6739f7b685",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "summary",
      assertionText:
        "가스용기는 전도·충격·가열을 막고 종류별로 구분해 세워 고정합니다.",
      evidenceRefs: [
        { kind: "lesson_block", ref: "lesson-welding-safety-gas#summary" },
        {
          kind: "official_source",
          ref: "https://kosha.or.kr/kosha/data/musculoskeletalPreventionData_A.do?articleNo=423772&attachNo=239316&mode=download",
        },
        {
          kind: "source_question",
          ref: "wcbt-9398f220-d2e7-4e16-b52b-c594091d6dd1",
        },
      ],
    },
    answerExplanation:
      "용해아세틸렌 용기는 다공질 물질에 아세톤을 침윤시켜 아세틸렌을 저장하므로 눕히지 않고 세워 고정해 보관해야 합니다. 따라서 유출 방지를 위해 눕혀 보관한다는 2번이 틀립니다.",
    solutionSteps: [
      "보관 장소의 환기·방폭 조건과 용기의 자세·충격 방지 조건을 나눠 확인합니다.",
      "아세틸렌 용기는 세워 고정한다는 원칙에 반하는 ‘눕혀 보관’ 보기를 선택합니다.",
    ],
    keyRule:
      "용해아세틸렌 용기는 통풍이 되는 장소에서 열·충격을 피하고 넘어지지 않도록 세워 고정합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "아세틸렌 누설 시 가연성 분위기가 축적되지 않도록 저장 장소의 통풍을 확보하는 것은 올바른 조치입니다.",
        plausibleReason:
          "통풍이 외부 공기를 공급해 연소를 돕는다고만 생각하면 위험한 조치처럼 보일 수 있습니다.",
        incorrectPoint:
          "점화원이 통제된 저장소에서 환기는 누설 가스의 체류 농도를 낮추는 역할을 합니다.",
        keyRule:
          "가연성 가스 저장 장소는 누설 가스가 축적되지 않도록 충분히 환기합니다.",
        differenceFromCorrect:
          "1번은 누설 시 축적을 줄이고, 정답 2번은 용기를 잘못된 자세로 보관합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "아세틸렌 용기를 눕히면 내부 아세톤이 유출될 수 있으므로 세워서 고정해야 합니다.",
        plausibleReason:
          "눕히면 용기가 넘어지지 않는다는 일반 물체의 안정성만 생각하면 안전해 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "용해아세틸렌 용기의 전도 방지는 눕히는 방식이 아니라 세운 상태에서 체인 등으로 고정하는 방식입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "가연성 가스가 누설될 수 있는 저장실의 스위치와 조명은 점화원이 되지 않도록 방폭 구조를 적용해야 합니다.",
        plausibleReason:
          "평상시 누설이 없다는 전제로 일반 전기기구도 괜찮다고 생각할 수 있습니다.",
        incorrectPoint:
          "안전설계는 정상 상태뿐 아니라 누설 같은 고장 상태의 폭발성 분위기도 고려합니다.",
        keyRule:
          "가연성 가스가 축적될 가능성이 있는 장소의 전기설비는 방폭 적합성을 확인합니다.",
        differenceFromCorrect:
          "3번은 점화원 통제 조치이고, 2번은 용해아세틸렌 용기의 보관 자세를 어깁니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "아세틸렌 용기는 충격과 가열에 민감하므로 진동·낙하·충돌을 피하여 신중히 취급해야 합니다.",
        plausibleReason:
          "강철 용기라 외부 충격에 충분히 견딘다고 생각하면 과도한 주의처럼 보일 수 있습니다.",
        incorrectPoint:
          "용기 외함의 강도와 내부 가스·용제의 안전성은 별개의 문제입니다.",
        keyRule:
          "고압가스 용기는 외관이 멀쩡해도 충격·가열·전도를 예방하여 취급합니다.",
        differenceFromCorrect:
          "4번은 충격 예방 원칙이고, 2번만 아세틸렌 용기를 눕히라고 잘못 말합니다.",
      },
    ],
    essentialRank: 2,
    essentialRationale: "용해아세틸렌 용기를 세워 고정해야 하는 보관 원칙을 직접 적용합니다.",
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-93b768cb-bf55-4b99-b6de-7e1d9d471453",
    contentDigest:
      "def24b26a02d735b9e1c485714f3cdd9bbe1885b299e72ff47d1c02f8a6e135d",
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
      "classification_mismatch: 라미네이션 균열 식별 문항이 안전관리·재해예방 레슨으로 잘못 투영되어 있습니다.",
      "lesson_gap_lamination: 현재 연결 후보 레슨에는 강괴 기포·압연·설퍼 밴드에 의한 층상 결함의 직접 정의가 없습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-93d836a7-62f0-45e0-a4bd-5904119c428b",
    contentDigest:
      "56ae3339e46cc1dab7d6897895488fdcacb866a5b220d266f2613245ea6edc28",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-93d836a7-62f0-45e0-a4bd-5904119c428b",
        },
      ],
    },
    answerExplanation:
      "용접 작업이 멈춘 무부하 상태에서 출력측 전압을 낮춰 홀더 접촉에 의한 감전 위험을 줄이는 장치는 자동전격방지기입니다. 따라서 4번이 정답입니다.",
    solutionSteps: [
      "각 장치의 주된 기능이 아크 시동·자동화·원격 조작·무부하전압 저감 중 무엇인지 구분합니다.",
      "감전 예방과 직접 연결되는 무부하전압 저감 장치인 전격방지기를 선택합니다.",
    ],
    keyRule:
      "자동전격방지기는 아크가 꺼진 비작업 상태에서 용접기 2차 무부하전압을 낮추는 감전 방호장치입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "핫 스타트 장치는 아크 발생 초기에 전류를 높여 시동성을 개선하는 장치이지 감전 방지 장치가 아닙니다.",
        plausibleReason:
          "작업 시작을 안정시켜 사고를 줄인다는 넓은 의미에서 안전장치처럼 보일 수 있습니다.",
        incorrectPoint:
          "핫 스타트는 아크 시동 성능을 다루며 무부하전압을 낮추지 않습니다.",
        keyRule:
          "핫 스타트는 시동 보조, 자동전격방지기는 비작업 시 출력전압 저감으로 기능을 구분합니다.",
        differenceFromCorrect:
          "1번은 아크 시동을 돕고, 정답 4번은 감전 위험을 직접 낮춥니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "‘자동장치’는 구체적인 감전 방호 기능이 특정되지 않은 일반 명칭이므로 정답 장치가 될 수 없습니다.",
        plausibleReason:
          "자동으로 동작한다는 표현이 자동전격방지기의 ‘자동’과 같아 보여 선택하기 쉽습니다.",
        incorrectPoint:
          "장치 이름이 아니라 무부하전압을 낮추는 구체 기능으로 식별해야 합니다.",
        keyRule:
          "안전장치 식별 문제에서는 작동 대상과 감소시키는 위험을 정확히 연결합니다.",
        differenceFromCorrect:
          "2번은 기능이 불명확하지만 4번은 무부하전압 저감 기능이 명확합니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "원격제어장치는 작업 위치에서 전류 등을 조절하기 위한 편의·제어 장치로, 전격 예방이 주기능이 아닙니다.",
        plausibleReason:
          "전원부에서 멀리 떨어져 조작하면 감전 위험도 줄 것이라고 추측할 수 있습니다.",
        incorrectPoint:
          "원격 조작 여부만으로 홀더의 무부하전압과 충전부 접촉 위험이 제거되지 않습니다.",
        keyRule:
          "원격제어와 전격방지는 별도 기능이며 무부하전압 저감 여부로 판별합니다.",
        differenceFromCorrect:
          "3번은 조작 편의를 제공하고, 4번은 감전 위험의 원인인 무부하전압을 낮춥니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "전격방지기는 용접하지 않을 때 출력측 무부하전압을 낮춰 충전부 접촉 시 감전 위험을 줄입니다.",
        plausibleReason:
          "명칭이 추상적이지만 ‘전격’이 감전을 뜻한다는 점을 알면 직접 연결할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "감전 위험 방지 기기를 묻는 경우 자동전격방지기의 무부하전압 저감 기능을 확인합니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9571fa34-020d-437e-b8d1-5b1fae0de65d",
    contentDigest:
      "d9691ddf2beabfac248d5ddb4cf908f926645ba2d23d703bf4477cb0f3873645",
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
      "lesson_gap_regulator_performance: 가스 안전 레슨에 조정압력·방출압력 차이와 압력조정기 구비조건이 직접 서술되어 있지 않습니다.",
      "official_primary_evidence_missing: 아세틸렌 압력조정기의 성능 조건을 확인할 공식 기술기준 원문을 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9585836a-4e5e-4770-8365-ca5a34d328a6",
    contentDigest:
      "66553dd95633d4ba37e195c563676f75f095abf4cf10510be32523cfb59fa10c",
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
      "lesson_gap_torch_maintenance: 현재 가스 안전 레슨은 산소계통 유분 금지를 다루지만 토치 전체의 윤활 금지 근거를 직접 제시하지 않습니다.",
      "official_primary_evidence_missing: 토치에 기름·그리스를 바르지 않는다는 국내 공식 취급 지침을 직접 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-95d3678b-1e52-425f-b9ed-7e71682ddefc",
    contentDigest:
      "9d57bc92b3e0dd6b25ca3c6a7869d9e280d3beaae5e696a335642c6cf66cede5",
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
      "lesson_gap_human_current_threshold: 감전 안전 레슨에 치명 위험 전류 50~100mA라는 수치 구간이 없습니다.",
      "official_primary_evidence_missing: 전류별 인체 영향 구간을 뒷받침하는 공식 표를 직접 확인하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-96491c19-65a8-4703-bb9a-06b9ba852fee",
    contentDigest:
      "f97f8882406a7493cfb86d4d6973bd916a0a41abfef0f4498d53e9ffee9625ed",
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
      "lesson_missing: 투영된 lesson-1ctkzud가 현재 공개 용접 세부 레슨 목록에 존재하지 않습니다.",
      "lesson_gap_safety_sign_color: 지시표지의 파란색 기준을 직접 연결할 공개 레슨 블록이 없습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-969f4224-0dbf-4104-a287-810819895698",
    contentDigest:
      "5d865d3612cca4c3b35145e4c0f5351e7b04cad03e47b7c98cf9d2384f48c8b2",
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
      "lesson_gap_hot_start: 용접 전원 레슨에 아크 초기에만 전류를 크게 하는 핫스타트 장치의 정의가 없습니다.",
      "direct_assertion_missing: 현재 레슨 문장으로 핫스타트와 고주파·전격방지·원격제어를 직접 구분할 수 없습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-98a50e11-b55d-48c0-bd32-77f501a16ca9",
    contentDigest:
      "372c75e51bc7522426fc6c0722816915a44a86fddc0fae301acbc10f0dc4f0b5",
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
      "lesson_gap_exact_shade_table: 피복 아크 용접의 일반 차광도 10~11이라는 수치가 레슨에 없습니다.",
      "official_primary_evidence_missing: 공정별 일반 차광도 번호를 확인할 공식 기준표를 직접 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-990601dc-1ada-4602-a90a-77a5733a73c9",
    contentDigest:
      "ac4c67d88c2bcc302a13b184078d8d0b6440e78f63297a2f08d0265c7c63cef9",
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
      "lesson_gap_polarity_characteristics: 전원 레슨은 정극성 단자 연결만 정의하며 비드 폭·용입·전극 용융속도·적용 재료의 직접 비교표가 없습니다.",
      "direct_assertion_missing: 4번을 오답으로 가르는 박판·주철·비철금속 적용 조건이 현재 레슨에 서술되어 있지 않습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9aef99ef-f65c-4b48-aedb-4221b508eda6",
    contentDigest:
      "3d465cff28ffa1e72c672c8afeae219590de0f6714b9865d5f925869dce5b320",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-electrical",
    conceptBinding: {
      lessonId: "lesson-welding-safety-electrical",
      lessonBlockId: "structure",
      assertionText: "절연은 충전부와 인체의 직접 접촉을 막습니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-electrical#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-9aef99ef-f65c-4b48-aedb-4221b508eda6",
        },
      ],
    },
    answerExplanation:
      "피복 아크 용접용 안전홀더는 손잡이와 충전부를 절연해 작업자가 용접 전류가 흐르는 부분에 직접 접촉할 가능성을 줄입니다. 따라서 사용 이유는 작업 중 전격 예방인 4번입니다.",
    solutionSteps: [
      "안전홀더가 차단하는 위험이 광선·가스·손 보호·전기 접촉 중 무엇인지 확인합니다.",
      "홀더의 절연 기능이 충전부 접촉과 감전을 줄인다는 점에서 전격 예방을 선택합니다.",
    ],
    keyRule:
      "절연형 안전홀더는 충전부를 감싸 작업자의 직접 접촉에 의한 전격 위험을 줄이는 전기 보호장치입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "자외선과 적외선 차단은 차광 보안면과 차광필터의 역할이며 안전홀더의 기능이 아닙니다.",
        plausibleReason:
          "‘안전’이라는 이름 때문에 모든 용접 위험을 막는 종합 보호장치로 오해할 수 있습니다.",
        incorrectPoint:
          "홀더는 손으로 전극을 잡고 전류를 전달하는 부품이어서 광선 차단 기능이 없습니다.",
        keyRule:
          "유해광선은 차광 보호구, 전격은 홀더 절연과 전격방지기로 위험과 장치를 대응시킵니다.",
        differenceFromCorrect:
          "1번은 눈 보호구의 기능이고, 정답 4번은 안전홀더의 절연 기능입니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "유해가스와 흄 중독 방지는 환기와 적합한 호흡보호구의 역할로 안전홀더와 직접 관계가 없습니다.",
        plausibleReason:
          "손상 없는 홀더가 아크를 안정시켜 흄도 줄일 것이라고 막연히 연결할 수 있습니다.",
        incorrectPoint:
          "아크 안정성과 호흡 유해물질 통제는 별도이며 홀더 절연은 가스를 제거하지 않습니다.",
        keyRule:
          "흄·가스는 발생원 제어와 환기로, 전격은 전기적 절연과 전압 저감으로 통제합니다.",
        differenceFromCorrect:
          "2번은 호흡 위험 통제이고, 4번은 홀더가 직접 줄이는 감전 위험입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "안전홀더의 절연 손잡이는 손을 보호하지만 고무장갑을 대신하는 개인보호구가 아닙니다.",
        plausibleReason:
          "손잡이가 절연재로 덮여 있어 절연장갑과 같은 기능을 완전히 대체한다고 생각하기 쉽습니다.",
        incorrectPoint:
          "공학적 방호인 절연 홀더와 개인보호구인 절연장갑은 독립적으로 유지해야 합니다.",
        keyRule:
          "하나의 절연수단을 적용했다고 다른 전기 보호조치를 생략하지 않습니다.",
        differenceFromCorrect:
          "3번은 보호구 대체를 잘못 주장하고, 4번은 안전홀더의 실제 목적인 전격 예방입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "안전홀더의 절연 구조는 충전부 접촉 가능성을 줄여 용접작업 중 전격을 예방합니다.",
        plausibleReason:
          "홀더가 단순히 용접봉을 고정하는 공구라고만 보면 안전 기능을 놓칠 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "홀더 식별 문제에서는 전극 고정 기능과 함께 작업자 접촉부의 절연 기능을 확인합니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9b45ff5c-ebf4-4eba-8519-2980d1e38866",
    contentDigest:
      "5697a56349d709312e45bedf975f59f88cda59019fe46dfbf8e505d8013cbd39",
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
      "lesson_gap_human_current_threshold: 감전 레슨에 근육수축 전류 20mA라는 시험 기준 수치가 없습니다.",
      "official_primary_evidence_missing: 전류값별 인체 반응을 직접 확인할 공식 근거표를 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9b5fbee6-490d-4332-a009-eabb40fcafb5",
    contentDigest:
      "5d07065c5c82b4a0cd59afe7f537faf472a9e6fef09c396c5b44757d43baafb8",
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
      "lesson_missing: 투영된 lesson-1ctkzud가 현재 공개 용접 세부 레슨 목록에 존재하지 않습니다.",
      "standard_version_ambiguity: 주황색 안전색채의 의미는 적용 KS 판본을 명시하지 않으면 현재 기준과 혼동될 수 있습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9b70cca9-324f-419c-9ef2-eea8bda09dcf",
    contentDigest:
      "87b01850a0ea9e062cd8597dea28bddacaaaa8180b149fbfde0f9f1b07aefdfe",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-9b70cca9-324f-419c-9ef2-eea8bda09dcf",
        },
      ],
    },
    answerExplanation:
      "용접작업이 중지되면 2차 무부하전압을 낮춰 홀더 접촉에 의한 감전 위험을 줄이는 장치는 전격방지기입니다. 따라서 4번이 정답입니다.",
    solutionSteps: [
      "보기의 장치를 아크 시동·자동화·원격조작·감전방호 기능으로 각각 분류합니다.",
      "무부하전압을 낮춰 전격을 방지하는 전격방지기를 선택합니다.",
    ],
    keyRule:
      "전격방지기는 용접 중이 아닐 때 출력측 무부하전압을 낮추어 감전 가능성을 줄입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "confused_with",
        rationale:
          "핫 스타트 장치는 아크 시동 초기에 전류를 증가시키는 장치로 전격 예방 장치가 아닙니다.",
        plausibleReason:
          "아크가 빨리 안정되면 위험 노출시간도 줄 것이라는 간접 효과를 떠올릴 수 있습니다.",
        incorrectPoint:
          "핫 스타트는 무부하전압을 안전전압으로 낮추는 기능이 없습니다.",
        keyRule:
          "초기 아크 전류를 높이는 장치와 비작업 시 전압을 낮추는 장치를 구분합니다.",
        differenceFromCorrect:
          "1번은 시동성을 개선하고, 정답 4번은 감전 위험을 직접 저감합니다.",
      },
      {
        choiceIndex: 1,
        relation: "out_of_scope",
        rationale:
          "자동장치는 어떤 위험을 어떻게 줄이는지 특정되지 않은 일반 표현이라 감전 방지 기기로 식별할 수 없습니다.",
        plausibleReason:
          "전격방지기가 자동으로 작동하므로 ‘자동장치’도 같은 뜻처럼 보일 수 있습니다.",
        incorrectPoint:
          "시험에서는 자동 여부가 아니라 무부하전압 저감 기능과 정식 장치명을 요구합니다.",
        keyRule:
          "안전장치 명칭은 작동 원리와 통제 위험을 함께 확인하여 선택합니다.",
        differenceFromCorrect:
          "2번은 기능이 불명확하고, 4번은 전격방지 기능이 명시된 장치입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "원격제어장치는 떨어진 위치에서 용접조건을 조절하는 장치로 무부하전압 저감이 주기능이 아닙니다.",
        plausibleReason:
          "전원부에서 거리를 두면 감전 예방 장치라고 생각할 수 있습니다.",
        incorrectPoint:
          "원격 조작만으로 홀더와 케이블의 충전 상태가 안전전압으로 바뀌지는 않습니다.",
        keyRule:
          "조작 위치를 바꾸는 제어장치와 출력전압을 낮추는 방호장치를 구분합니다.",
        differenceFromCorrect:
          "3번은 조작 편의 장치이고, 4번은 감전 방호장치입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "전격방지기는 용접하지 않는 동안 2차 무부하전압을 낮춰 감전 위험을 줄이는 장치입니다.",
        plausibleReason:
          "전격이라는 용어가 익숙하지 않으면 아크 안정 장치와 혼동할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "전격은 전기에 의한 충격을 뜻하므로 감전 예방 기기는 전격방지기입니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9b83fd23-5e95-4ccb-bf5e-3b5f67f62ea6",
    contentDigest:
      "821dd108e14e3bf82533e7f79e1ba4bdbae8aefdf699444f174aee2ad511d0dd",
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
      "lesson_gap_exact_shade_table: 100A 이상 300A 미만에서 차광도 10~12번이라는 전류 구간표가 현재 레슨에 없습니다.",
      "official_primary_evidence_missing: 전류 범위와 차광도 번호를 대조할 공식 기준표를 직접 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9c245a77-0521-41aa-a84c-1a234141fe56",
    contentDigest:
      "fecf7eee727cfa941ff2fa89086ac59ee35861efa079b750380809b7cf4f2ff1",
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
      "lesson_gap_welder_types: 전원 레슨에 발전기형이 직류식이고 탭 전환형·가동 코일형·가동 철심형이 교류식이라는 분류표가 없습니다.",
      "direct_assertion_missing: 네 용접기 형식을 교류 여부로 직접 판별할 레슨 문장이 없습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9c5a0873-ff16-4e2b-b488-0b6dd9f1f967",
    contentDigest:
      "22a1fb31c2c8a68c96687bb80834bd1c57e5afa3115311a545a48b7cf91c6eb6",
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
      "lesson_missing: 투영된 lesson-welding-defect-porosity가 현재 공개 용접 세부 레슨 목록에 존재하지 않습니다.",
      "lesson_gap_CO2_porosity_distance: 노즐과 모재 사이 거리가 짧은 것이 기공 원인이 아니라는 직접 근거가 없습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9cde2cff-48ca-482a-a46b-bcebd4ba9780",
    contentDigest:
      "d296085f5c198809df80e86ca8c038269ab414552fd683419e8e8300252b5b81",
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
      "lesson_gap_cover_lens: 보호구 레슨에 투명 보호유리가 차광유리를 불티와 스패터로부터 보호한다는 구조 설명이 없습니다.",
      "official_primary_evidence_missing: 헬멧 앞 투명 보호판의 기능을 직접 확인할 공식 제품 기준 원문을 연결하지 못했습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9cff516f-6a55-4733-b433-983aa311c95b",
    contentDigest:
      "bf3a4310d3ab12d09897a670025a1ca9c51cb81de66f098838661a4ca3036b1d",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "structure",
      assertionText:
        "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.",
      evidenceRefs: [
        { kind: "lesson_block", ref: "lesson-welding-safety-fire#structure" },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-9cff516f-6a55-4733-b433-983aa311c95b",
        },
      ],
    },
    answerExplanation:
      "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비 화재를 뜻합니다. D급은 마그네슘·나트륨 같은 금속화재이지 A·B·C급을 합친 종합화재가 아니므로 4번이 잘못되었습니다.",
    solutionSteps: [
      "A·B·C급을 일반 가연물·유류·전기설비 화재와 차례로 대조합니다.",
      "D급을 종합화재라고 한 마지막 연결이 화재 분류와 맞지 않음을 확인합니다.",
    ],
    keyRule:
      "화재 등급은 A 일반, B 유류, C 전기, D 금속으로 위험물의 성질에 따라 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "A급은 종이·목재·섬유 같은 일반 가연물 화재이므로 올바른 연결입니다.",
        plausibleReason:
          "알파벳 순서를 소화기 종류와 혼동하면 A급의 대상을 바꿔 기억할 수 있습니다.",
        incorrectPoint:
          "A급은 유류나 전기설비가 아니라 일반 가연물의 연소에 해당합니다.",
        keyRule: "A급 화재는 연소 후 재가 남는 일반 가연물 화재로 기억합니다.",
        differenceFromCorrect:
          "1번은 올바른 분류이고, 정답 4번은 D급의 대상을 잘못 연결합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale: "B급은 가연성 액체와 유류 화재이므로 올바른 연결입니다.",
        plausibleReason:
          "B를 폭발이나 방사능의 머리글자로 잘못 연상하면 대상이 헷갈릴 수 있습니다.",
        incorrectPoint:
          "화재 등급의 문자는 영어 첫 글자와 항상 일치하는 약어가 아닙니다.",
        keyRule: "B급은 휘발유·유류 등 가연성 액체 화재로 구분합니다.",
        differenceFromCorrect:
          "2번은 유류 화재를 정확히 가리키고, 4번은 존재하지 않는 종합화재로 연결합니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale: "C급은 통전 중인 전기설비 화재이므로 올바른 연결입니다.",
        plausibleReason:
          "전기의 영문 첫 글자가 E라서 C급이 아닐 것이라고 생각할 수 있습니다.",
        incorrectPoint:
          "화재 등급은 국내 분류 체계에 따라 C급이 전기화재를 뜻합니다.",
        keyRule:
          "C급 화재에서는 통전 여부와 전기 비전도성 소화약제 적합성을 확인합니다.",
        differenceFromCorrect:
          "3번은 전기화재 분류가 맞고, 4번은 D급을 종합화재라고 오분류합니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "D급은 마그네슘·나트륨 등 금속화재를 뜻하므로 종합화재라는 연결은 틀립니다.",
        plausibleReason:
          "A·B·C를 모두 포함한 다음 단계가 D라고 순서만으로 추측하면 종합화재처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "D급은 여러 화재의 합계가 아니라 특정 금속의 연소를 다루는 금속화재입니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: 2,
    essentialRationale: "A·B·C·D급 화재와 가연물 종류를 연결하는 기본 분류 문항입니다.",
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9d5bb7dc-5042-45f0-9820-7f31a2d0d8a4",
    contentDigest:
      "952d6c318a85d4e66f6cdb0302b008193f7a1497754e21927e8e7b1d5e5e3ac8",
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
      "lesson_gap_acetylene_porous_mass: 가스 안전 레슨에 아세틸렌 용기 다공질 물질의 강도·침윤·화학적 안정 조건이 없습니다.",
      "answer_wording_requires_review: ‘가스 방전과 방출이 쉬울 것’의 원문 용어와 오답 판단 근거를 공식 자료로 재검토해야 합니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9d613c71-b324-4230-a601-ee0f52d4ad69",
    contentDigest:
      "f2dc01f1819812f7dd9a5f4e58ca01ae8a195064700da71020c3227444ec3ef8",
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
      "lesson_gap_oxygen_consumption_formula: 30×(150-100)=1500L 계산식과 압력·용기용량의 적용 전제가 현재 레슨에 없습니다.",
      "unit_text_ambiguity: 원문 압력 단위가 kgf∙cm2로 복원되어 kgf/cm²의 나눗셈 기호 누락 여부를 확인해야 합니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9dd8be73-dfdb-4c80-9139-499829c36d92",
    contentDigest:
      "443795d16789309a9c9ff013e656466a31ec6c17b6dbef7707491c2dcac690b3",
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
      "classification_mismatch: 전기적 재해 문항이 일반 안전관리 레슨으로 투영되어 직접 개념 연결이 약합니다.",
      "lesson_gap_AC_DC_shock_comparison: 교류용접기와 직류용접기의 전격 위험을 직접 비교하는 레슨 근거가 없습니다.",
    ],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
  {
    canonicalId: "wcbt-9df7e166-d00d-418a-ad97-dd441f70627c",
    contentDigest:
      "c0d287bca5f8b2ad559dc07959e9dc03072892cf0e5aea0df955fd882b922e3f",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "definition",
      assertionText:
        "산소는 조연성이 강해 기름·그리스와 접촉하면 급격한 연소 위험이 커지고, 아세틸렌은 압력·가열·충격에 민감하게 취급해야 합니다.",
      evidenceRefs: [
        { kind: "lesson_block", ref: "lesson-welding-safety-gas#definition" },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/kosha/intro/chungnamBranch_A.do?articleNo=337905&attachNo=185443&mode=download",
        },
        {
          kind: "source_question",
          ref: "wcbt-9df7e166-d00d-418a-ad97-dd441f70627c",
        },
      ],
    },
    answerExplanation:
      "산소는 기름·그리스 같은 유기물과 접촉하면 급격한 연소를 일으킬 수 있으므로 산소병 밸브·도관·취부구를 기름 묻은 천으로 닦아서는 안 됩니다. 따라서 3번이 틀린 설명입니다.",
    solutionSteps: [
      "가연물 제거·소화기 준비·산소계통 유분 금지·탱크 세척 중 각 조치의 안전 방향을 확인합니다.",
      "산소계통에 기름을 묻히는 3번이 화재·폭발 위험을 증가시키므로 오답 보기로 선택합니다.",
    ],
    keyRule:
      "산소용기 밸브·조정기·도관 등 산소계통에는 기름이나 그리스를 묻히지 않습니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "용접작업은 가연성 물질을 제거하거나 안전하게 격리한 장소에서 해야 하므로 올바른 설명입니다.",
        plausibleReason:
          "현장에서는 가연물을 완전히 없애기 어려워 비현실적인 원칙처럼 느낄 수 있습니다.",
        incorrectPoint:
          "제거가 곤란하면 불연성 덮개·격리 등 동등한 통제를 적용해야 하며 위험을 방치할 수 없습니다.",
        keyRule:
          "화기작업 전에는 불꽃이 닿을 수 있는 가연물과 인화성 물질을 제거·격리합니다.",
        differenceFromCorrect:
          "1번은 점화 전 위험 제거이고, 정답 3번은 산소계통에 유분을 묻히는 금지행위입니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "작업 중 초기 화재에 대응할 수 있도록 적합한 소화기를 준비하는 것은 올바른 화기작업 조치입니다.",
        plausibleReason:
          "소화기는 사고 후 대응이므로 예방조치가 아니라고만 생각할 수 있습니다.",
        incorrectPoint:
          "소화기 비치는 가연물 제거를 대신하지는 않지만 필수적인 비상대응 준비입니다.",
        keyRule:
          "화기작업은 가연물 통제와 함께 적합한 소화설비를 작업 전에 준비합니다.",
        differenceFromCorrect:
          "2번은 비상대응 준비이고, 3번은 산소와 유분의 접촉 위험을 만듭니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "산소병 밸브와 도관에 기름을 묻히면 고농도 산소와 유기물이 반응해 발화·폭발 위험이 커지므로 틀린 설명입니다.",
        plausibleReason:
          "기름 묻은 천이 녹과 먼지를 잘 닦아 장비를 보호한다고 생각하면 관리 방법처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "산소계통은 청결하게 유지하되 세척·취급 과정에서 유분을 절대 사용하지 않습니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "유류탱크는 잔류 유류와 증기를 제거하고 환기·개방한 뒤 안전 상태를 확인해야 하므로 보기의 방향은 맞습니다.",
        plausibleReason:
          "세척만으로는 가스농도 측정 등 절차가 모두 끝나지 않아 문장이 불완전해 보일 수 있습니다.",
        incorrectPoint:
          "현행 작업은 세척 외에도 가스농도 확인과 작업허가가 필요하지만, 제시된 조치 자체가 위험을 키우는 설명은 아닙니다.",
        keyRule:
          "탱크 화기작업 전에는 잔류물 제거·환기·가스농도 확인으로 폭발성 분위기를 제거합니다.",
        differenceFromCorrect:
          "4번은 잔류 가연성 물질을 줄이는 조치이고, 3번은 산소계통에 유분을 묻혀 위험을 높입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "Codex part-12 author",
    authoredAt: "2026-08-02T15:57:12.832Z",
    reviewer: "Codex independent reviewer part-12",
    reviewedAt: "2026-08-03T00:28:00.000Z",
  },
] as const;

const SOURCE_REVIEWED_AT = "2026-08-03T03:15:00.000Z";

const SOURCE_HOLD_REASONS: Readonly<Record<string, string>> = {
  "wcbt-901628ba-de3a-4f81-b9fc-76d7afb8b893":
    "all_choice_direct_binding_missing: 연결된 KOSHA 자료는 차광보호구·환기·가연물 격리를 각각 뒷받침하지만 고소작업 안전대까지 포함해 네 보기를 한 레슨 단언문에서 직접 구분하지 못함",
  "wcbt-91703a40-c539-4c1b-944f-21d1aa5ab13f":
    "all_choice_direct_binding_missing: 아크광·절연홀더·가연물 격리 근거는 있으나 전자빔 X선까지 포함한 네 보기 전체를 직접 연결하는 단일 레슨 근거가 없음",
  "wcbt-93154ef4-aea0-455d-8056-1cf2958182f3":
    "safety_primary_source_incomplete: 연결된 KOSHA 페이지는 절연 손상·자동전격방지기 등 일부 감전대책은 확인되지만 문항의 네 보기, 특히 ‘2차 무부하전압이 높은 용접기’ 비교를 직접 뒷받침하지 못함",
  "wcbt-93d836a7-62f0-45e0-a4bd-5904119c428b":
    "safety_primary_source_incomplete: 연결된 KOSHA 페이지에 전격방지기는 있으나 핫 스타트 아크장치·자동장치·원격제어장치와의 기능 비교가 없어 전 보기 피드백 승인 근거가 부족함",
  "wcbt-9b70cca9-324f-419c-9ef2-eea8bda09dcf":
    "safety_primary_source_incomplete: 연결된 KOSHA 페이지에 전격방지기는 있으나 핫 스타트 아크장치·자동장치·원격제어장치와의 기능 비교가 없어 전 보기 피드백 승인 근거가 부족함",
  "wcbt-9398f220-d2e7-4e16-b52b-c594091d6dd1":
    "official_source_mismatch: 연결된 KOSHA 첨부 URL은 용해아세틸렌 용기 보관 자세를 확인할 수 있는 자료가 아니므로 출처 기반 공개 조건을 충족하지 못함",
  "wcbt-9df7e166-d00d-418a-ad97-dd441f70627c":
    "official_source_unreachable: 연결된 KOSHA 지사 첨부 URL에서 산소용기 유분 금지와 유류탱크 세척 조건을 안정적으로 읽어 확인할 수 없어 공개 근거가 불완전함",
};

export const WELDING_CBT_ANSWER_REVIEWS_PART_12 =
  RAW_WELDING_CBT_ANSWER_REVIEWS_PART_12.map((entry) => {
    if (
      entry.canonicalId ===
      "wcbt-9aef99ef-f65c-4b48-aedb-4221b508eda6"
    ) {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        primaryLeafLessonId: "lesson-welding-safety-electrical",
        conceptBinding: {
          lessonId: "lesson-welding-safety-electrical",
          lessonBlockId: "principle",
          assertionText:
            "절연형 용접봉 홀더는 통전되는 용접봉을 절연 손잡이로 고정해 전격을 예방하며, 절연장갑을 대신하지 않고 유해가스용 환기장치나 자외선·적외선용 눈·얼굴 보호구의 역할도 하지 않습니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-electrical#principle",
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
          "안전홀더는 통전되는 용접봉을 절연 손잡이로 잡아 작업자가 충전부에 직접 접촉할 가능성을 낮추므로 전격 예방에 사용합니다. 따라서 4번이 정답입니다.",
        solutionSteps: [
          "홀더가 직접 다루는 대상이 통전되는 용접봉이라는 점을 확인합니다.",
          "자외선·적외선은 차광보호구, 유해가스는 환기·호흡보호구, 손 보호는 절연장갑의 역할로 분리합니다.",
          "용접봉을 절연해 감전 위험을 줄이는 4번 전격 예방을 선택합니다.",
        ],
        keyRule:
          "절연형 안전홀더의 직접 목적은 통전부 접촉을 줄여 전격을 예방하는 것입니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale:
              "자외선과 적외선은 차광보안경·용접보안면 같은 차광보호구로 차단합니다.",
            plausibleReason:
              "홀더도 용접 안전장비이므로 아크광까지 막는다고 범위를 넓히기 쉽습니다.",
            incorrectPoint:
              "안전홀더는 손과 용접봉 사이를 절연할 뿐 눈·얼굴에 도달하는 광선을 차단하지 않습니다.",
            keyRule:
              "유해광선은 차광보호구, 통전부 접촉은 절연홀더가 담당합니다.",
            differenceFromCorrect:
              "1번은 광학적 위험 제어이고 정답은 전기적 접촉 위험 제어입니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale:
              "유해가스 중독은 발생원 포집·환기와 적정 호흡보호구로 예방합니다.",
            plausibleReason:
              "안전홀더를 쓰면 작업자가 아크에서 멀어진다고 생각해 흄 노출도 줄어든다고 오인할 수 있습니다.",
            incorrectPoint:
              "홀더의 절연 기능은 공기 중 흄·가스 농도를 낮추거나 호흡기를 보호하지 않습니다.",
            keyRule:
              "흡입 위험은 환기·호흡보호, 감전 위험은 절연·전격방지로 구분합니다.",
            differenceFromCorrect:
              "2번은 유해물질 흡입 예방이고 정답은 감전 예방입니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale:
              "안전홀더는 용접봉을 잡는 절연형 장치이지만 손에 착용하는 절연장갑을 대신하지 않습니다.",
            plausibleReason:
              "절연 손잡이가 손을 감싸 보호하므로 장갑과 같은 역할을 한다고 보기 쉽습니다.",
            incorrectPoint:
              "홀더와 절연장갑은 서로 다른 접촉경로를 줄이는 별도 안전수단입니다.",
            keyRule:
              "절연홀더를 사용해도 규정된 절연장갑과 보호구를 함께 적용합니다.",
            differenceFromCorrect:
              "3번은 다른 보호구를 대체한다는 잘못된 주장이고 정답은 홀더 자체의 전격 예방 목적입니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale:
              "절연형 홀더는 통전되는 용접봉을 절연 손잡이로 고정해 작업자의 전격 위험을 줄입니다.",
            plausibleReason:
              "문항의 장치와 KOSHA 자료의 감전 예방 목적이 직접 일치합니다.",
            incorrectPoint: null,
            keyRule:
              "절연형 안전홀더는 용접작업 중 전격 예방을 위한 장치입니다.",
            differenceFromCorrect: null,
          },
        ],
        holdReasons: [],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: SOURCE_REVIEWED_AT,
      };
    }

    if (
      entry.canonicalId ===
      "wcbt-9cff516f-6a55-4733-b433-983aa311c95b"
    ) {
      const classes = [
        {
          label: "A급 일반 가연물 화재",
          rationale:
            "A급 화재는 나무·종이 등 일반 가연물이 타는 화재입니다.",
        },
        {
          label: "B급 유류 화재",
          rationale:
            "B급 화재는 식용유·알코올 등 유류와 가연성 액체가 타는 화재입니다.",
        },
        {
          label: "C급 전기 화재",
          rationale:
            "C급 화재는 통전 중인 전기설비에서 발생한 화재입니다.",
        },
        {
          label: "D급 종합화재",
          rationale:
            "D급은 종합화재가 아니라 마그네슘·나트륨 등 가연성 금속의 화재입니다.",
        },
      ] as const;
      return {
        ...entry,
        reviewStatus: "approved" as const,
        primaryLeafLessonId: "lesson-welding-safety-fire",
        conceptBinding: {
          lessonId: "lesson-welding-safety-fire",
          lessonBlockId: "structure",
          assertionText:
            "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-fire#structure",
            },
            {
              kind: "official_source" as const,
              ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s",
            },
            {
              kind: "source_question" as const,
              ref: entry.canonicalId,
            },
          ],
        },
        answerExplanation:
          "A급 일반 가연물, B급 유류, C급 전기설비의 연결은 맞습니다. D급은 종합화재가 아니라 금속 화재이므로 잘못 연결된 4번이 정답입니다.",
        solutionSteps: [
          "각 보기의 등급과 연소 대상 연결을 하나씩 확인합니다.",
          "A-일반 가연물, B-유류·가연성 액체, C-전기설비까지는 올바른 연결로 남깁니다.",
          "D급을 금속 화재가 아닌 종합화재로 연결한 4번을 선택합니다.",
        ],
        keyRule:
          "A급은 일반 가연물, B급은 유류, C급은 전기설비, D급은 금속 화재입니다.",
        choiceFeedback: classes.map((choice, choiceIndex) => {
          const supports = choiceIndex === 3;
          return {
            choiceIndex,
            relation: supports
              ? ("supports" as const)
              : ("refuted_by" as const),
            rationale: choice.rationale,
            plausibleReason: supports
              ? "‘종합’이라는 포괄적인 표현이 실제 등급명처럼 보일 수 있습니다."
              : `${choice.label}은 KOSHA 화재등급표의 올바른 연결입니다.`,
            incorrectPoint: supports
              ? null
              : choiceIndex === 0
                ? "A급-일반 가연물은 올바른 연결이므로 잘못 연결된 보기가 아닙니다."
                : choiceIndex === 1
                  ? "B급-유류는 올바른 연결이므로 잘못 연결된 보기가 아닙니다."
                  : "C급-전기설비는 올바른 연결이므로 잘못 연결된 보기가 아닙니다.",
            keyRule:
              choiceIndex === 0
                ? "나무·종이 등 일반 가연물은 A급입니다."
                : choiceIndex === 1
                  ? "유류·가연성 액체는 B급입니다."
                  : choiceIndex === 2
                    ? "통전 중 전기설비는 C급입니다."
                    : "D급은 종합화재가 아니라 금속 화재입니다.",
            differenceFromCorrect: supports
              ? null
              : `${choice.label}은 올바른 연결이지만 정답인 D급-종합화재는 D급의 대상을 잘못 연결했습니다.`,
          };
        }),
        holdReasons: [],
        reviewer: "Codex source-and-binding reviewer parts-11-14",
        reviewedAt: SOURCE_REVIEWED_AT,
      };
    }

    const holdReason = SOURCE_HOLD_REASONS[entry.canonicalId];
    if (!holdReason) {
      return entry;
    }

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
      holdReasons: [holdReason],
      reviewer: "Codex source-and-binding reviewer parts-11-14",
      reviewedAt: SOURCE_REVIEWED_AT,
    };
  }).map((entry) => {
    if (entry.canonicalId === "wcbt-9aef99ef-f65c-4b48-aedb-4221b508eda6") {
      return {
        ...entry,
        answerExplanation:
          "피복 아크 용접에서 안전홀더는 통전되는 용접봉을 절연 손잡이로 고정해 손이 충전부에 닿는 경로를 줄입니다. 따라서 정답 선택지인 ‘용접작업 중 전격예방’이 안전홀더를 사용하는 직접 이유입니다.",
        solutionSteps: [
          "문제의 ‘피복 아크 용접시 안전홀더’가 용접봉을 잡는 장치이며, 용접봉이 통전부라는 점을 짚습니다.",
          "자외선·적외선은 차광보호구, 유해가스는 환기·호흡보호구, 고무장갑은 별도 개인보호구의 역할로 구분합니다.",
          "안전홀더의 절연 손잡이가 줄이는 것은 충전부 접촉에 따른 전격이므로 ‘용접작업 중 전격예방’을 고릅니다.",
        ],
        keyRule:
          "피복 아크 용접용 안전홀더는 통전되는 용접봉과 작업자의 손 사이를 절연하여 전격을 예방하고, 광선 차단·가스 중독 방지·고무장갑 대용 기능은 수행하지 않습니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale: "‘자외선과 적외선 차단’은 아크광을 막는 차광보안경·용접보안면의 기능이며 안전홀더의 절연 손잡이가 처리하는 위험이 아닙니다.",
            plausibleReason: "홀더도 용접 안전장비이므로 아크광까지 막는다고 범위를 넓히기 쉽습니다.",
            incorrectPoint: "안전홀더는 손과 용접봉 사이를 절연할 뿐 눈·얼굴에 도달하는 광선을 차단하지 않습니다.",
            keyRule: "유해광선은 차광보호구, 통전부 접촉은 절연홀더가 담당합니다.",
            differenceFromCorrect: "1번은 아크광 차단을 말하지만, ‘용접작업 중 전격예방’은 안전홀더가 통전 용접봉 접촉을 줄여 직접 달성합니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale: "‘유해가스 중독 방지’는 흄·가스를 포집·환기하거나 호흡보호구로 막아야 하며, 안전홀더는 공기 중 유해물질 농도를 바꾸지 않습니다.",
            plausibleReason: "안전홀더를 쓰면 작업자가 아크에서 멀어진다고 생각해 흄 노출도 줄어든다고 오인할 수 있습니다.",
            incorrectPoint: "홀더의 절연 기능은 공기 중 흄·가스 농도를 낮추거나 호흡기를 보호하지 않습니다.",
            keyRule: "흡입 위험은 환기·호흡보호, 감전 위험은 절연·전격방지로 구분합니다.",
            differenceFromCorrect: "2번은 흄·가스 흡입 위험을 다루고, ‘용접작업 중 전격예방’은 통전부 접촉이라는 전기 위험을 다룹니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale: "‘고무장갑 대용’은 틀립니다. 안전홀더는 용접봉을 잡는 절연형 장치일 뿐 손에 착용해 보호하는 고무장갑을 대체하지 않습니다.",
            plausibleReason: "절연 손잡이가 손을 감싸 보호하므로 장갑과 같은 역할을 한다고 보기 쉽습니다.",
            incorrectPoint: "홀더와 절연장갑은 서로 다른 접촉경로를 줄이는 별도 안전수단입니다.",
            keyRule: "절연홀더를 사용해도 규정된 절연장갑과 보호구를 함께 적용합니다.",
            differenceFromCorrect: "3번은 절연장갑을 생략해도 된다는 주장이고, ‘용접작업 중 전격예방’은 장갑과 별개로 안전홀더가 수행하는 역할입니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale: "‘용접작업 중 전격예방’이 맞습니다. 안전홀더의 절연 손잡이가 통전되는 용접봉과 작업자의 손 사이의 직접 접촉 가능성을 줄이기 때문입니다.",
            plausibleReason: "홀더가 단순히 용접봉을 고정하는 공구라고만 보면 안전 기능을 놓칠 수 있습니다.",
            incorrectPoint: null,
            keyRule: "피복 아크 용접의 안전홀더는 통전 용접봉의 접촉 경로를 절연해 전격을 예방하는 장치입니다.",
            differenceFromCorrect: null,
          },
        ],
      };
    }

    if (entry.canonicalId === "wcbt-9cff516f-6a55-4733-b433-983aa311c95b") {
      return {
        ...entry,
        answerExplanation:
          "문제에서 잘못 연결된 선택지는 ‘D급 화재 - 종합화재’입니다. A급은 일반 가연물, B급은 유류, C급은 전기설비 화재이지만 D급은 마그네슘·나트륨처럼 가연성 금속이 타는 금속화재이므로 4번의 ‘종합화재’ 연결이 틀립니다.",
        solutionSteps: [
          "화재 등급을 연소 대상으로 대조해 A급은 나무·종이 등의 일반 가연물, B급은 유류, C급은 통전 전기설비임을 확인합니다.",
          "D급은 여러 화재를 합친 ‘종합화재’가 아니라 마그네슘·나트륨 등의 가연성 금속 화재라는 고유 분류를 적용합니다.",
          "따라서 ‘D급 화재 - 종합화재’라고 쓴 4번만 D급의 실제 대상을 바꾸었으므로 정답으로 선택합니다.",
        ],
        keyRule:
          "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 통전 전기설비, D급은 마그네슘·나트륨 등의 금속 화재로 구분합니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale: "‘A급 화재 - 일반 가연물화재’는 나무·종이·섬유처럼 재가 남는 일반 가연물의 화재를 가리키므로 올바른 연결입니다.",
            plausibleReason: "A급을 소화기 표기나 알파벳 약어로만 외우면 일반 가연물이라는 연소 대상을 놓치기 쉽습니다.",
            incorrectPoint: "A급은 D급 금속화재나 B급 유류화재가 아니라 일반 가연물화재이므로 이 선택지는 잘못 연결된 항목이 아닙니다.",
            keyRule: "나무·종이·섬유 등의 일반 가연물화재는 A급입니다.",
            differenceFromCorrect: "1번은 A급의 실제 대상인 일반 가연물을 맞게 썼고, 정답 4번은 D급의 실제 대상인 금속을 ‘종합’으로 바꾸었습니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale: "‘B급 화재 - 유류화재’는 휘발유·알코올 같은 유류와 가연성 액체가 타는 화재를 뜻하므로 올바른 연결입니다.",
            plausibleReason: "B급의 문자와 유류의 명칭을 연결하지 못하면 가연성 액체 분류를 다른 등급과 바꾸어 기억할 수 있습니다.",
            incorrectPoint: "B급은 유류·가연성 액체 화재로 정해져 있으므로 이 선택지는 D급을 오분류한 보기처럼 틀리지 않습니다.",
            keyRule: "휘발유·알코올 등 유류와 가연성 액체의 화재는 B급입니다.",
            differenceFromCorrect: "2번은 B급의 유류화재 연결이 맞고, 정답 4번만 D급 금속화재를 ‘종합화재’로 잘못 적었습니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale: "‘C급 화재 - 전기화재’는 통전 중인 전기설비에서 발생한 화재를 가리키므로 올바른 연결입니다.",
            plausibleReason: "전기의 영문 첫 글자와 등급 문자를 대응시키려 하면 C급 전기화재 분류를 낯설게 느낄 수 있습니다.",
            incorrectPoint: "C급은 전기설비 화재를 뜻하므로 이 선택지는 D급의 금속화재 정의를 바꾼 4번과 달리 올바릅니다.",
            keyRule: "통전 중인 전기설비 화재는 C급으로 분류합니다.",
            differenceFromCorrect: "3번은 C급의 전기화재 대상을 정확히 말하고, 정답 4번은 D급의 금속화재 대상을 틀리게 말합니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale: "‘D급 화재 - 종합화재’는 틀립니다. D급은 마그네슘·나트륨 같은 가연성 금속이 연소하는 금속화재이지 여러 종류를 합친 종합화재가 아닙니다.",
            plausibleReason: "A·B·C 다음의 D를 포괄 등급처럼 추측하면 ‘종합화재’가 실제 분류명처럼 보일 수 있습니다.",
            incorrectPoint: null,
            keyRule: "D급은 마그네슘·나트륨 등 가연성 금속의 화재이며 ‘종합화재’라는 화재 등급은 없습니다.",
            differenceFromCorrect: null,
          },
        ],
      };
    }

    return entry;
  });
