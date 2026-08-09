const WELDING_CBT_ANSWER_REVIEWS_PART_17_AUTHORED = [
  {
    canonicalId: "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb",
    contentDigest:
      "e558ca761060e46058b0f898e431b4e7576af4f0bbdb572988e51f4c8132d386",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "calculation",
    primaryLeafLessonId: "lesson-welding-foundation-power-heat",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-power-heat",
      lessonBlockId: "principle",
      assertionText:
        "용접속도 v가 cm/min이면 단위 길이 입열은 H=ηVI×60/v [J/cm]입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-power-heat#principle",
        },
        {
          kind: "source_question",
          ref: "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb",
        },
        {
          kind: "calculation_derivation",
          ref: "H=ηVI×60/v, 따라서 I=Hv/(60ηV); 효율은 별도 제시가 없어 η=1로 적용",
        },
      ],
    },
    answerExplanation:
      "단위 길이 입열식 H=ηVI×60/v를 사용합니다. 효율이 별도로 제시되지 않아 η=1로 두고 H=18000 J/cm, V=30 V, v=15 cm/min을 대입하면 I=(18000×15)/(60×1×30)=150 A입니다. 무부하전압 90 V는 이 계산에 쓰는 아크전압이 아닙니다.",
    solutionSteps: [
      "용접속도가 cm/min일 때 입열식은 H=ηVI×60/v [J/cm]이며, 전류식은 I=Hv/(60ηV)입니다.",
      "값을 대입하면 I=(18000J/cm×15cm/min)/(60s/min×1×30V)입니다.",
      "계산 결과는 150A이므로 두 번째 보기를 선택합니다.",
    ],
    keyRule:
      "입열 계산에는 무부하전압이 아니라 아크전압을 사용하고, cm/min의 시간 단위를 60으로 환산합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "substitution_error",
        rationale:
          "100 A를 대입하면 입열은 60×30×100/15=12000 J/cm로 문제의 18000 J/cm보다 작습니다.",
        plausibleReason:
          "아크전압과 용접속도를 대략 비교하면 그럴듯해 보일 수 있습니다.",
        incorrectPoint:
          "입열식에 수치를 정확히 대입한 결과가 150 A가 아닙니다.",
        keyRule:
          "후보 전류를 입열식에 역대입해 주어진 18000 J/cm와 일치하는지 확인합니다.",
        differenceFromCorrect:
          "정답 150 A보다 50 A 작아 요구 입열을 만들지 못합니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "I=(18000×15)/(60×30)=150 A로 주어진 입열·아크전압·용접속도를 모두 만족합니다.",
        plausibleReason:
          "공식의 시간 환산과 아크전압을 정확히 적용한 계산값입니다.",
        incorrectPoint: null,
        keyRule: "H=60VI/v를 전류에 대해 정리하면 I=Hv/(60V)입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "substitution_error",
        rationale:
          "200 A를 대입하면 입열은 24000 J/cm가 되어 문제에서 제시한 18000 J/cm를 초과합니다.",
        plausibleReason:
          "속도 15를 분모에서 잘못 처리하면 큰 값이 나올 수 있습니다.",
        incorrectPoint: "용접속도와 60초 환산을 적용한 전류 계산값보다 큽니다.",
        keyRule:
          "전류가 커질수록 입열은 비례해 커지므로 역대입값이 제시 입열을 넘는지 봅니다.",
        differenceFromCorrect:
          "정답 150 A보다 50 A 커서 입열이 6000 J/cm 더 큽니다.",
      },
      {
        choiceIndex: 3,
        relation: "substitution_error",
        rationale:
          "220 A라면 입열은 26400 J/cm로 계산되어 주어진 18000 J/cm와 맞지 않습니다.",
        plausibleReason:
          "무부하전압 90 V를 계산 조건에 섞으면 과대값을 고를 수 있습니다.",
        incorrectPoint:
          "문제의 아크전압 30 V 대신 관련 없는 무부하전압을 의식한 과대 선택입니다.",
        keyRule:
          "입열식의 전압은 용접 중 아크전압이며 무부하전압은 제외합니다.",
        differenceFromCorrect:
          "정답 150 A보다 70 A 크고 역대입 입열도 8400 J/cm 초과합니다.",
      },
    ],
    essentialRank: 1,
    essentialRationale: "무부하전압을 배제하고 아크전압으로 전류를 역산하는 입열 계산 문항입니다.",
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-d812451f-ba08-4667-86bb-c5ba6442fd20",
    contentDigest:
      "c58b8992a183d473f96c0d1a07b08ea11210807391ef9595a5c3c83520442343",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 전격방지기 설치 시 무부하전압 20~30 V 수치의 현행 공식 근거 URL이 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-d8b661b3-8b34-46ac-8107-5e584d0bc27e",
    contentDigest:
      "ad241594b11f5590e96abea805df1844544d48e598177951a9754506165bd093",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 아세틸렌 용기 밸브를 0.5회전 여는 수치의 제조사 또는 산업안전 공식 근거 URL이 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-d90bc15e-4578-41ca-9a90-a32fd2c8f6cc",
    contentDigest:
      "4bcff77094e64ae7bceda0e42e80ac0a8dd15a9895126b0fbb4eaef7eb79cfc9",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 암모니아 충전용기 도색을 백색으로 보는 기준의 현행 법령·고시 공식 URL과 적용 시점이 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-d9548928-3ee2-4f2a-90d3-f50820142e3f",
    contentDigest:
      "7bab6547e1650ff9a13b79dcce959b92a2704ce30264b38d92d332468ee68e9a",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 가스용접 보호안경 착용 의무를 직접 뒷받침하는 산업안전 공식 URL이 문항에 결속되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-da2e3518-f489-417d-9957-0e74ef173857",
    contentDigest:
      "7a05fd47eb9fb024cc03fe5fa934f772d61d98ca53fa28caf4407b53057740b5",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 25 kVA·200 V 용접기 1차측 퓨즈를 125 A로 선정하는 안전기준의 공식 URL이 연결되지 않았습니다.",
      "lesson_direct_rule_missing: 연결 레슨에는 1차 입력을 전압으로 나누어 퓨즈 정격을 정하는 직접 계산 규칙이 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dabf8f68-5efa-4f04-b9d7-c748ef21bebc",
    contentDigest:
      "73f7356f4b85025162280a5dd63eba4460ba227cbef3abc6bbbd5c14b0b4f693",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 가스 토치에 기름·그리스를 바르지 않는 취급 규칙의 제조사 또는 산업안전 공식 URL이 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dc264edc-738f-4d92-9667-c15597b14bd0",
    contentDigest:
      "972a300ec516a220bffff1297ccd7e24c76db131f0506500a3a01ae5facd13c9",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 아연도금 강판 용접 시 환기를 차단하면 안 된다는 공식 산업안전 근거 URL이 문항에 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dc4ee99f-f73c-4c24-adf6-460d2d45463d",
    contentDigest:
      "887bf69b2a56e1804863676558014ecc82d68964d1dcf8e88e04a04fd3994abd",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 아연도금·불화물·밀폐공간과 교량 구조물의 환기 필요도를 비교할 공식 산업안전 URL이 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dcc31c72-925e-4fca-a334-e1bef1c4c2cf",
    contentDigest:
      "5579e362e642e684d7573e868a3a5e1256de374a302542ffd930e3792d9a66c0",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "structure",
      assertionText:
        "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-fire#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-dcc31c72-925e-4fca-a334-e1bef1c4c2cf",
        },
      ],
    },
    answerExplanation:
      "화재 등급은 A급 일반 가연물, B급 유류·가연성 액체, C급 전기설비, D급 금속으로 구분합니다. 따라서 C급 화재에 해당하는 것은 전기 화재입니다.",
    solutionSteps: [
      "지문이 C급 화재의 대상을 묻는 긍정형임을 확인합니다.",
      "A·B·C·D급을 일반·유류·전기·금속 화재와 차례로 대응합니다.",
      "C급과 직접 연결되는 전기 화재를 선택합니다.",
    ],
    keyRule:
      "C급은 통전 중인 전기설비 화재이며, A급 일반·B급 유류·D급 금속 화재와 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "C급은 통전 중인 전기설비에서 발생한 전기 화재를 뜻하므로 정답입니다.",
        plausibleReason:
          "화재 등급 문자가 대상의 영문 첫 글자와 일치하지 않아 C급과 전기를 바로 연결하기 어려울 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "전기설비가 통전 중이면 C급 화재로 보고 비전도성 소화약제의 적합성을 확인합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "마그네슘·나트륨 같은 금속의 연소는 C급이 아니라 D급 금속 화재입니다.",
        plausibleReason:
          "금속 설비에 전기가 공급되는 상황을 떠올리면 금속 화재와 전기 화재가 겹쳐 보일 수 있습니다.",
        incorrectPoint:
          "등급은 연소하는 위험물의 종류와 통전 상태로 구분하며 금속 자체의 연소는 D급입니다.",
        keyRule:
          "D급은 반응성 금속의 연소를 다루며 일반 전기설비 화재인 C급과 구분합니다.",
        differenceFromCorrect:
          "정답은 통전 전기설비이고, 이 보기는 금속 자체가 타는 D급 대상입니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "가연성 가스의 연소는 지문의 C급 전기설비 분류와 일치하지 않습니다.",
        plausibleReason:
          "가스용접 안전 문맥 때문에 가스 화재가 별도의 C급일 것이라고 연상할 수 있습니다.",
        incorrectPoint:
          "C급의 판별 기준은 가스가 아니라 통전 중인 전기설비입니다.",
        keyRule:
          "화재 등급 문제에서는 연료 이름보다 공식 분류의 대상물과 통전 여부를 확인합니다.",
        differenceFromCorrect:
          "정답은 전기설비 화재이고, 이 보기는 가연성 가스가 연소하는 다른 위험입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "종이·목재·섬유 같은 일반 가연물 화재는 C급이 아니라 A급입니다.",
        plausibleReason:
          "가장 흔한 화재가 가운데 등급인 C급일 것이라고 순서만으로 추측할 수 있습니다.",
        incorrectPoint:
          "일반 가연물은 연소 후 재가 남는 A급 대상이므로 C급이 아닙니다.",
        keyRule:
          "A급은 일반 가연물, C급은 전기설비로 대상물을 직접 대응해 기억합니다.",
        differenceFromCorrect:
          "정답은 전기설비이고, 이 보기는 A급 일반 가연물입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dd389161-8ff4-4984-8b5f-dc86347413e8",
    contentDigest:
      "968fb9ee4f4f590a3729ddc74371a8900862f3a79127c12e3ee7b0bb914aef9b",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: 제안된 피복아크용접 레슨이 공개 레슨 집합에 없고 페로티탄·규산칼륨·산화티탄·탄산칼슘의 아크 안정제 분류 근거도 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dd5ec301-3faf-4cee-81b4-fdcecbe8dbf4",
    contentDigest:
      "5093a0c5e695b1957c1c3c1fc32cf1d0b31ddf5d5f97acc0c12d463760c93e8f",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "summary",
      assertionText:
        "가스용기는 전도·충격·가열을 막고 표면온도를 40℃ 이하로 유지합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-gas#summary",
        },
        {
          kind: "official_source",
          ref: "https://law.go.kr/LSW/flDownload.do?flSeq=164929995",
        },
        {
          kind: "source_question",
          ref: "wcbt-dd5ec301-3faf-4cee-81b4-fdcecbe8dbf4",
        },
      ],
    },
    answerExplanation:
      "고압가스 용기는 직사광선과 열원을 피하고 표면온도를 40℃ 이하로 유지해야 합니다. 70℃ 이하로만 유지하면 된다는 첫 번째 보기는 공식 상한보다 30℃ 높은 온도까지 허용하므로 틀렸습니다.",
    solutionSteps: [
      "문제가 틀린 산소용기 취급을 묻는 부정형임을 확인합니다.",
      "온도 상한·충격 방지·산소계통 유분 금지·직사광선 회피를 공식 취급기준과 대조합니다.",
      "40℃ 이하 기준을 70℃ 이하로 바꾼 첫 번째 보기를 선택합니다.",
    ],
    keyRule:
      "고압가스 용기의 표면온도는 40℃ 이하로 유지하며 충격·직사광선·산소계통의 유분을 피합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "용기 표면온도 상한은 40℃ 이하이므로 70℃ 이하라는 기준은 과도한 가열을 허용합니다.",
        plausibleReason:
          "70℃도 물의 끓는점보다 낮고 ‘이하’라는 표현이 있어 보수적인 제한처럼 보일 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "가스용기 온도 문제에서는 70℃가 아니라 표면온도 40℃ 이하를 적용합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "용기에 충격을 주지 않으면 밸브 손상·전도·용기 외함의 손상을 예방할 수 있으므로 올바른 취급입니다.",
        plausibleReason:
          "고압가스 용기는 두꺼운 강재로 제작되어 일반 운반 충격에는 영향이 없다고 생각할 수 있습니다.",
        incorrectPoint:
          "용기 강도와 밸브·부속의 충격 취약성은 별개이므로 충격 예방은 맞는 주의사항입니다.",
        keyRule:
          "고압가스 용기는 낙하·충돌·구름 운반을 피하고 밸브와 몸체를 보호합니다.",
        differenceFromCorrect:
          "이 보기는 충격을 예방하지만, 정답은 허용온도를 공식 기준보다 높게 잡습니다.",
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "산소 밸브와 부속에 기름이 묻으면 산소의 강한 조연성 때문에 급격한 연소 위험이 커지므로 유분 금지는 올바릅니다.",
        plausibleReason:
          "밸브의 원활한 작동을 위해 다른 기계처럼 윤활유가 필요하다고 생각할 수 있습니다.",
        incorrectPoint:
          "산소계통에는 일반 윤활유를 임의 사용하지 않으므로 잘못된 보기가 아닙니다.",
        keyRule:
          "산소 용기의 밸브·조정기·연결구에는 기름과 그리스를 접촉시키지 않습니다.",
        differenceFromCorrect:
          "이 보기는 산소계통 화재를 예방하고, 정답은 용기 온도 상한을 잘못 제시합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "직사광선을 피하면 용기 표면온도 상승과 내부 압력 증가를 줄일 수 있으므로 올바른 취급입니다.",
        plausibleReason:
          "실외용 강철 용기이므로 햇빛 정도는 설계 범위라고 생각할 수 있습니다.",
        incorrectPoint:
          "직사광선과 열원 회피는 40℃ 이하 유지에 필요한 기본조치입니다.",
        keyRule:
          "가스용기는 그늘지고 통풍되는 곳에 두어 외부 가열을 막습니다.",
        differenceFromCorrect:
          "이 보기는 가열을 예방하지만, 정답은 70℃까지 가열을 허용합니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-dd8f606c-ec88-4b08-83d2-6dbc9830b3fe",
    contentDigest:
      "2834ebc44c2a0e5960fbd25f17b455b1a1e4d41f7a119f109c6aa0a7acc2acbd",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 저압전기도 안심할 수 없다는 감전 안전 판단의 공식 산업안전 URL이 문항에 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-de3c3b0a-d038-4e5e-a1b5-84af45c5083f",
    contentDigest:
      "ff2167f2128ddacc0ba5512fad5f23516f409004a68a224b28968b683c9e109b",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: 지름 3.2 mm 용접봉과 판두께 4.4 mm의 경험식 또는 선정표가 연결 레슨 본문에 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-de3d5b54-b1ff-488a-a622-444b949df0bb",
    contentDigest:
      "9ab376035330f1bb1f1b916cf5ef56390c06e025e9a28726f7a82fbf665376ff",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
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
          ref: "wcbt-de3d5b54-b1ff-488a-a622-444b949df0bb",
        },
      ],
    },
    answerExplanation:
      "아크 용접기의 감전 위험을 직접 낮추는 장치는 용접하지 않을 때 출력측 무부하전압을 낮추는 자동전격방지장치입니다. 헬멧은 광선·비산물 보호구이고, 리미트 스위치는 위치 검출·제한용이며, 2차 권선은 변압기 구성요소이므로 감전방지 전용 장치가 아닙니다. 따라서 네 번째 보기가 가장 적당합니다.",
    solutionSteps: [
      "지문이 일반 보호구가 아니라 아크 용접기의 감전방지 장치를 묻는다고 구분합니다.",
      "각 보기가 출력측 무부하전압을 낮추는 기능을 갖는지 대조합니다.",
      "그 기능이 명시된 자동전격방지장치인 네 번째 보기를 선택합니다.",
    ],
    keyRule:
      "자동전격방지장치는 아크가 꺼진 뒤 출력측 무부하전압을 신속히 낮춰 교류 아크용접기의 감전 위험을 줄입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "out_of_scope",
        rationale:
          "헬멧은 아크광과 비산물로부터 눈·얼굴을 보호하지만 용접기 출력측 무부하전압을 낮추지는 않습니다.",
        plausibleReason:
          "용접사의 대표 보호구이므로 감전까지 막는 장치로 범위를 넓혀 생각하기 쉽습니다.",
        incorrectPoint:
          "헬멧의 방호 대상은 광선과 비산물이며 전기회로의 무부하전압이 아닙니다.",
        keyRule:
          "보호구의 신체 방호와 전격방지장치의 전압 저감 기능을 구분합니다.",
        differenceFromCorrect:
          "정답은 용접기 출력 전압을 낮추지만 헬멧은 작업자가 착용하는 광선 보호구입니다.",
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "리미트 스위치는 기계의 위치나 이동 한계를 검출하는 제어부품으로 아크용접기의 감전방지 전용 장치가 아닙니다.",
        plausibleReason:
          "한계 위치에서 전기회로를 끊는다는 일반 기능 때문에 전격도 차단한다고 오해할 수 있습니다.",
        incorrectPoint:
          "이 보기에는 아크 소멸 후 출력측 무부하전압을 낮추는 기능이 없습니다.",
        keyRule:
          "장치명보다 용접기 2차측 무부하전압을 실제로 낮추는지를 기준으로 판별합니다.",
        differenceFromCorrect:
          "자동전격방지장치는 용접 전원 출력에 작용하지만 리미트 스위치는 위치 제어에 쓰입니다.",
      },
      {
        choiceIndex: 2,
        relation: "missing_condition",
        rationale:
          "2차 권선은 용접변압기의 전압을 공급하는 구성요소일 뿐 그 자체가 자동으로 무부하전압을 안전 수준까지 낮추는 장치는 아닙니다.",
        plausibleReason:
          "용접기 출력측과 직접 연결된 명칭이라 감전방지 기능도 포함할 것으로 추측하기 쉽습니다.",
        incorrectPoint:
          "단순 권선 구성에는 아크 소멸을 검출해 출력 전압을 낮추는 자동 동작 조건이 없습니다.",
        keyRule:
          "전원 구성요소와 위험 상태에서 동작하는 안전장치를 동일하게 보지 않습니다.",
        differenceFromCorrect:
          "정답은 아크가 없을 때 전압을 저감하지만 2차 권선은 출력 전력을 전달하는 부품입니다.",
      },
      {
        choiceIndex: 3,
        relation: "supports",
        rationale:
          "자동전격방지장치는 용접하지 않을 때 출력측 무부하전압을 낮추므로 지문의 감전방지 목적에 직접 일치합니다.",
        plausibleReason:
          "공식 명칭에 전격방지가 들어 있고 실제 기능도 무부하전압 저감으로 확인됩니다.",
        incorrectPoint: null,
        keyRule:
          "아크 소멸 후 무부하전압을 낮추는 장치가 자동전격방지장치입니다.",
        differenceFromCorrect: null,
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-de7f12c8-0081-4c24-8da4-ba7879e463a8",
    contentDigest:
      "e7e838d49c48749678b15389a264a1b846a470172f36759d81de2c06d9b428dc",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: F·H·V·O 자세기호 중 F가 아래보기라는 직접 대응표가 연결 레슨 본문에 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-decc4b6d-72ae-403c-b61d-21c664cdfd73",
    contentDigest:
      "2661b36f924ff00270ff1032f5d51f33c43507b96565ce02e59c54975cf9a305",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: 자분탐상시험의 자화방법으로 극간법을 분류하는 직접 목록이 연결 레슨 본문에 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-df5595a1-87d5-43fe-87d7-efce22bbf671",
    contentDigest:
      "786c2fb1ea6792aabb4a4da7781dd61ea994f43520b1775ac830fda88d389e52",
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
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=486&callmode=normal&catimage=&eclang=ko&start=162&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-df5595a1-87d5-43fe-87d7-efce22bbf671",
        },
      ],
    },
    answerExplanation:
      "핸드 실드와 용접 헬멧은 아크광·비산물로부터 눈과 얼굴을 보호하고, 팔 덮게는 열과 불티로부터 팔을 가리는 착용 보호구입니다. 케이블 커넥터는 용접 케이블을 전기적으로 연결하는 기구로 작업자가 신체 보호를 위해 착용하는 보호구가 아니므로 두 번째 보기가 정답입니다.",
    solutionSteps: [
      "각 보기가 작업자가 착용해 신체를 보호하는 물품인지 먼저 확인합니다.",
      "핸드 실드·용접 헬멧·팔 덮게를 광선·열·불티 대응 보호구로 분류합니다.",
      "전기 연결용 기구인 케이블 커넥터를 보호구가 아닌 항목으로 선택합니다.",
    ],
    keyRule:
      "보호구는 작업자가 착용해 신체의 위험 노출을 줄이는 물품이며 케이블 커넥터 같은 설비 연결부품과 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "핸드 실드는 손으로 들어 눈과 얼굴을 아크광과 비산물에서 가리는 용접 보호구입니다.",
        plausibleReason:
          "손에 들고 사용하는 기구라는 형태 때문에 작업 공구로 분류할 수 있습니다.",
        incorrectPoint:
          "사용 방식이 손잡이형이어도 직접 목적은 가공이 아니라 작업자의 눈·얼굴 보호입니다.",
        keyRule:
          "핸드 실드는 용접면과 같은 광선·비산물 방호 계열의 개인보호구입니다.",
        differenceFromCorrect:
          "정답 케이블 커넥터는 전기 연결부품이지만 핸드 실드는 작업자가 사용하는 얼굴 보호구입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "케이블 커넥터는 용접 케이블 사이를 연결해 전류 경로를 구성하는 부품이지 신체에 착용하는 보호구가 아닙니다.",
        plausibleReason:
          "안전한 절연 연결에 관여하므로 이름만 보고 안전보호구로 묶을 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "안전에 기여하는 설비부품이라도 작업자가 착용하는 신체 보호용품이 아니면 개인보호구가 아닙니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "용접 헬멧은 용접면의 한 형태로 눈과 얼굴을 유해광선과 비산물에서 보호합니다.",
        plausibleReason:
          "헬멧을 낙하물용 안전모와 같은 머리 보호구로만 좁게 이해하면 용접 보호 기능을 놓칠 수 있습니다.",
        incorrectPoint:
          "용접 헬멧의 차광면과 얼굴 가림 구조는 아크용접 보호구의 직접 기능입니다.",
        keyRule:
          "용접 헬멧은 차광필터를 통해 아크광을 줄이고 얼굴의 비산물 노출도 낮춥니다.",
        differenceFromCorrect:
          "정답은 케이블 연결 기능을 하지만 용접 헬멧은 작업자가 착용하는 눈·얼굴 보호구입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "팔 덮게는 용접 중 생기는 열·불티가 팔 피부와 작업복에 직접 닿는 것을 줄이는 착용 보호구입니다.",
        plausibleReason:
          "레슨의 대표 목록에 가죽 앞치마와 각반이 먼저 보여 팔 보호품을 별도 작업용품으로 오해할 수 있습니다.",
        incorrectPoint:
          "팔 덮게는 연결·가공 기능이 아니라 신체 부위를 덮어 열과 불티를 막는 역할을 합니다.",
        keyRule:
          "앞치마·각반·팔 덮게처럼 신체를 덮는 용품은 열·불티 위험에 대응하는 보호구입니다.",
        differenceFromCorrect:
          "정답 케이블 커넥터는 장비부품이고 팔 덮게는 작업자의 팔을 직접 가리는 보호구입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e0c8202c-2ec8-4d42-bc1a-01a4daab8fd6",
    contentDigest:
      "618ff8841d400b6387ea8f79cf239c00a7ad16c5e0b6a2f972ad3f4b972614f7",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-fire",
    conceptBinding: {
      lessonId: "lesson-welding-safety-fire",
      lessonBlockId: "structure",
      assertionText:
        "A급은 일반 가연물, B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재입니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-fire#structure",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=507&callmode=normal&catimage=&eclang=ko&start=10&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-e0c8202c-2ec8-4d42-bc1a-01a4daab8fd6",
        },
      ],
    },
    answerExplanation:
      "전기설비 화재는 C급으로 분류합니다. A급은 일반 가연물, B급은 유류·가연성 액체, D급은 금속 화재이므로 세 번째 보기인 C급 화재가 정답입니다.",
    solutionSteps: [
      "지문이 전기화재의 등급을 묻는 긍정형임을 확인합니다.",
      "A·B·C·D급을 일반·유류·전기·금속 화재에 대응합니다.",
      "전기설비와 직접 연결되는 C급을 선택합니다.",
    ],
    keyRule:
      "통전 중인 전기설비 화재는 C급이며 A급 일반·B급 유류·D급 금속과 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "A급은 종이·목재·섬유 등 일반 가연물의 화재이므로 전기화재의 등급이 아닙니다.",
        plausibleReason:
          "위험도가 높은 전기화재가 첫 번째 등급일 것이라고 순서만으로 추측할 수 있습니다.",
        incorrectPoint:
          "A급의 분류 기준은 일반 가연물이며 통전 전기설비가 아닙니다.",
        keyRule:
          "A급은 연소 후 재가 남는 일반 가연물 화재로 기억합니다.",
        differenceFromCorrect:
          "정답 C급은 전기설비이고, 이 보기는 일반 가연물을 뜻합니다.",
      },
      {
        choiceIndex: 1,
        relation: "refuted_by",
        rationale:
          "B급은 휘발유·유기용제 같은 유류·가연성 액체 화재이므로 전기화재와 다릅니다.",
        plausibleReason:
          "전기설비의 절연유가 타는 사례를 떠올리면 모든 전기화재를 B급으로 생각할 수 있습니다.",
        incorrectPoint:
          "지문은 연료가 유류인지가 아니라 전기화재의 공식 등급을 묻고 있으므로 B급이 아닙니다.",
        keyRule:
          "B급은 가연성 액체, C급은 통전 전기설비로 구분합니다.",
        differenceFromCorrect:
          "정답 C급은 통전 상태를 기준으로 하고, 이 보기는 유류·가연성 액체를 기준으로 합니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "C급은 통전 중인 전기설비 화재를 뜻하므로 지문의 전기화재 분류와 정확히 일치합니다.",
        plausibleReason:
          "전기의 영문 첫 글자 E와 등급 문자가 달라 암기하지 않으면 다른 등급으로 고르기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "전기설비가 통전 중이면 C급으로 보고 비전도성 소화약제를 선택합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "D급은 마그네슘·나트륨 같은 금속 자체의 연소를 다루므로 일반 전기화재가 아닙니다.",
        plausibleReason:
          "전기설비가 금속으로 만들어졌다는 점 때문에 금속화재와 혼동할 수 있습니다.",
        incorrectPoint:
          "설비 재질이 금속이라는 사실과 금속 자체가 연소하는 D급 화재는 다른 판별 기준입니다.",
        keyRule:
          "D급은 금속의 연소, C급은 통전 전기설비 화재입니다.",
        differenceFromCorrect:
          "정답 C급은 통전 여부가 핵심이고, 이 보기는 반응성 금속 자체의 연소입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e0fa3fb4-694f-4e55-9678-33015de507e3",
    contentDigest:
      "514253820652108dc3e943d9da7358760389e1090f66d7dfc9841f6d0ea756a9",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: 저수소계가 티탄계·고산화티탄계·고셀룰로스계보다 염기도가 높다는 직접 비교 근거가 연결 레슨 본문에 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e13a6159-7287-49bd-84e2-2f5f201c9394",
    contentDigest:
      "443118850eedd914acbc7d85af6aeb0ed5f06ba9c06b8ef73bd9db35e53be21f",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
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
          ref: "wcbt-e13a6159-7287-49bd-84e2-2f5f201c9394",
        },
      ],
    },
    answerExplanation:
      "피복아크용접에서 용접봉을 갈아 끼울 때 맨손으로 홀더와 용접봉을 만지면 충전부 접촉 경로가 생겨 전격 예방과 반대입니다. 전격방지기 부착, 용접기 내부 임의 접촉 금지, 절연성이 좋은 장갑 사용은 서로 다른 감전 경로를 줄이는 조치이므로 틀린 방법은 두 번째 보기입니다.",
    solutionSteps: [
      "부정형 지문에서 전격 위험을 키우는 행동 하나를 찾습니다.",
      "장치·설비 접근·개인보호구의 각 보기를 감전 경로 차단 원칙과 대조합니다.",
      "절연 없이 맨손으로 용접봉을 교체하는 두 번째 행동을 틀린 방법으로 선택합니다.",
    ],
    keyRule:
      "용접봉 교체 때는 맨손 접촉을 피하고 손상 없는 절연형 홀더와 절연장갑을 사용해야 합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "전격방지기는 아크가 없을 때 출력측 무부하전압을 낮춰 감전 위험을 줄이는 안전장치입니다.",
        plausibleReason:
          "전격방지기만으로 모든 감전 위험을 없앨 수 없다는 점 때문에 장치 자체도 틀린 방법으로 오해할 수 있습니다.",
        incorrectPoint:
          "하나의 조치가 완전하지 않다는 사실과 그 조치가 예방에 유효하지 않다는 판단은 다릅니다.",
        keyRule:
          "전격방지기는 접지·절연·보호구와 함께 사용하는 유효한 공학적 방호입니다.",
        differenceFromCorrect:
          "정답의 맨손 교체는 위험을 늘리지만 전격방지기 부착은 무부하전압 위험을 줄입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "맨손으로 홀더의 용접봉을 교체하면 절연장갑 없이 전기 접촉 가능성을 높이므로 전격 예방 방법이 아닙니다.",
        plausibleReason:
          "아크가 잠시 꺼졌으면 전류가 전혀 흐르지 않는다고 생각해 빠른 교체를 허용하기 쉽습니다.",
        incorrectPoint: null,
        keyRule:
          "아크가 꺼진 상태도 무부하전압이 존재할 수 있으므로 용접봉 교체에는 절연 보호가 필요합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "용접기 내부에는 충전부와 고전압 부분이 있을 수 있으므로 임의로 손을 대지 않는 것은 직접 접촉을 피하는 예방조치입니다.",
        plausibleReason:
          "외함이 닫혀 있으면 내부도 일반 사용자가 점검해도 된다고 생각할 수 있습니다.",
        incorrectPoint:
          "전기설비 내부 접근을 제한하는 조치는 위험 노출을 줄이므로 틀린 예방 방법이 아닙니다.",
        keyRule:
          "용접기 내부 점검·수리는 전원 격리 후 자격과 절차를 갖춘 사람이 수행해야 합니다.",
        differenceFromCorrect:
          "정답은 충전 가능 부품을 맨손으로 다루지만 이 보기는 내부 접촉 자체를 피합니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "절연성이 좋은 장갑은 손을 통한 직접 접촉 경로의 저항을 유지하는 개인보호 조치입니다.",
        plausibleReason:
          "장갑만으로 충분하지 않다는 원칙을 장갑이 전혀 필요 없다는 뜻으로 잘못 확대할 수 있습니다.",
        incorrectPoint:
          "보호구가 공학적 방호를 대신하지는 않지만 손상 없는 절연장갑 사용은 여전히 필요한 예방조치입니다.",
        keyRule:
          "절연장갑은 전원 차단·전격방지·손상 없는 홀더와 함께 감전 위험을 낮춥니다.",
        differenceFromCorrect:
          "정답은 맨손 노출이고 이 보기는 그 노출을 줄이는 절연 보호구 사용입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e18a8e80-3b6d-449d-9c9e-a19d718fe8d8",
    contentDigest:
      "5a33d33bc198d31585b6e1a5264cce44e10df45bb852a93bc75a7d9c2ffdb32b",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 탱크 내부 단독작업 금지와 밀폐공간 통풍·감시 절차의 공식 산업안전 URL이 연결되지 않았습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e2236840-c559-460c-8891-4b1456d3e72b",
    contentDigest:
      "14174a6b159565489249158b0ab46da4b418a593c51f5c2dfba874eef7313ed1",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: 위빙 폭을 용접봉 지름의 2~3배로 제한하는 직접 규칙이 연결 레슨 본문에 없습니다.",
      "source_text_quality_issue: 원문 지문에 '위빌비드·위빙 촉·용접봉 지금·몇 재'와 같은 복원 오탈자가 있어 의미 확인이 필요합니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e322b722-f1e1-432c-872f-97476518af6d",
    contentDigest:
      "02f9ab5915f2a260c90d24311c46e2582ac81412134aee55af639ea1f96483f0",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "safety_primary_official_url_missing: 25 kVA·200 V 용접기 1차측 안전스위치 퓨즈를 125 A로 선정하는 공식 기준 URL이 연결되지 않았습니다.",
      "lesson_direct_rule_missing: 연결 레슨에는 1차 입력·전압으로 퓨즈 정격을 산정하는 직접 계산식이 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e34e9863-3071-4160-badd-429e396e7c1c",
    contentDigest:
      "7da2921733ae8df26690c643f2bb5e7131491dba9512a963c28ee91a39fbccfd",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: 제안된 피복아크용접 레슨이 공개 레슨 집합에 없고 페로실리콘을 탈산제로 분류하는 직접 근거도 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e35ba685-ecc1-49da-99db-77b53525e58a",
    contentDigest:
      "b1cb3ad51b2ce1a8557449a44a426a5b708c3a1e39d9bb32f03d10fbd1c18d54",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "definition",
    primaryLeafLessonId: "lesson-welding-foundation-brazing-pressure",
    conceptBinding: {
      lessonId: "lesson-welding-foundation-brazing-pressure",
      lessonBlockId: "structure",
      assertionText: "마찰용접은 상대운동의 마찰열과 축방향 압력을 이용합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-foundation-brazing-pressure#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-e35ba685-ecc1-49da-99db-77b53525e58a",
        },
      ],
    },
    answerExplanation:
      "경납땜은 모재를 녹이지 않고 용가재를 녹여 접합하는 납땜이며 가스·노내·저항 가열 방식이 있습니다. 마찰용접은 상대운동의 마찰열과 축방향 압력을 이용하는 압접이므로 경납땜의 종류가 아닙니다.",
    solutionSteps: [
      "각 보기가 납땜의 가열 방식인지 압력을 핵심으로 하는 접합 공정인지 구분합니다.",
      "마찰용접은 마찰열과 축방향 압력을 이용하는 압접임을 확인합니다.",
      "가스·노내·저항 납땜과 달리 마찰 납땜은 경납땜 분류가 아니므로 두 번째 보기를 고릅니다.",
    ],
    keyRule:
      "공정명에 열원이 포함되어도 모재 용융 여부와 압력 사용 여부로 납땜과 압접을 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "refuted_by",
        rationale:
          "가스 납땜은 가스 불꽃을 열원으로 용가재를 녹이는 경납땜 방식이므로 제외 대상이 아닙니다.",
        plausibleReason: "가스용접과 명칭이 비슷해 융접으로 혼동하기 쉽습니다.",
        incorrectPoint: "가스라는 열원 이름만 보고 납땜 분류에서 제외했습니다.",
        keyRule: "가스 불꽃을 사용해도 모재가 아니라 납재를 녹이면 납땜입니다.",
        differenceFromCorrect:
          "마찰용접과 달리 가스 납땜은 압접이 아니라 경납땜의 가열 방식입니다.",
      },
      {
        choiceIndex: 1,
        relation: "supports",
        rationale:
          "마찰용접은 상대운동으로 생긴 마찰열과 축방향 압력으로 접합하는 압접이므로 경납땜에 속하지 않습니다.",
        plausibleReason: "연결 레슨의 압접 구분과 직접 일치하는 선택지입니다.",
        incorrectPoint: null,
        keyRule:
          "마찰열과 축방향 압력을 핵심으로 하면 납땜이 아니라 마찰용접인 압접입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 2,
        relation: "refuted_by",
        rationale:
          "노내 납땜은 로 안에서 접합부와 납재를 가열하는 경납땜 방식이므로 올바른 분류입니다.",
        plausibleReason:
          "노 전체를 가열하므로 모재까지 녹이는 융접처럼 보일 수 있습니다.",
        incorrectPoint: "가열 설비의 규모를 모재 용융 여부와 혼동했습니다.",
        keyRule: "노내 가열이어도 낮은 융점의 납재로 접합하면 경납땜입니다.",
        differenceFromCorrect:
          "마찰용접은 압력을 이용하지만 노내 납땜은 납재를 가열하는 경납땜입니다.",
      },
      {
        choiceIndex: 3,
        relation: "refuted_by",
        rationale:
          "저항 납땜은 전기저항열을 이용해 납재를 녹이는 경납땜 방식이므로 제외 대상이 아닙니다.",
        plausibleReason:
          "저항용접과 이름이 비슷해 압접으로 오인할 수 있습니다.",
        incorrectPoint:
          "저항 납땜과 전극 가압을 이용하는 저항용접을 같은 공정으로 보았습니다.",
        keyRule:
          "저항열을 사용하더라도 납재를 녹이면 저항 납땜으로 분류합니다.",
        differenceFromCorrect:
          "마찰용접은 마찰열·축압을 쓰는 압접이고 저항 납땜은 납재를 쓰는 경납땜입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
  {
    canonicalId: "wcbt-e3dcf843-d5b6-404d-a09a-ac7c419e0e26",
    contentDigest:
      "f0653ee704d35a9d533a1fe40a3ed17538b29683ea4383eb72c1b2e7619cf803",
    authoringDisposition: "hold_candidate",
    reviewStatus: "pending",
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
      "lesson_direct_rule_missing: F·H·V·O 자세기호 가운데 H가 수평 자세라는 직접 대응표가 연결 레슨 본문에 없습니다.",
    ],
    author: "welding-author-part17",
    authoredAt: "2026-08-02T16:02:20.851Z",
    reviewer: null,
    reviewedAt: null,
  },
] as const;

const PART_17_REVIEWER = "welding-reviewer-part17";
const PART_17_REVIEWED_AT = "2026-08-02T16:14:21.935Z";

const PART_17_DIRECTNESS_HOLD_REASONS = new Map<string, string>([
  [
    "wcbt-dcc31c72-925e-4fca-a334-e1bef1c4c2cf",
    "official_locator_directness_incomplete: KOSHA 화재등급표는 C급 전기화재의 기본 분류는 지지하지만 현재 선택지 피드백의 금속·가스·일반 화재 부가 예시 전체를 직접 지지하지 않습니다.",
  ],
  [
    "wcbt-dd5ec301-3faf-4cee-81b4-fdcecbe8dbf4",
    "independent_directness_audit_all_choice_evidence_incomplete: 법령 근거는 40℃ 이하·직사광선 회피·충격 방지를 확인하지만 산소용기 밸브의 기름 금지까지 네 보기를 모두 직접 결속하지 못합니다.",
  ],
  [
    "wcbt-de3d5b54-b1ff-488a-a622-444b949df0bb",
    "independent_directness_audit_all_choice_evidence_incomplete: 자동전격방지장치의 기능은 직접 확인되지만 헬멧·리미트스위치·2차권선장치를 오답으로 구분할 레슨 문장과 1차 출처가 없습니다.",
  ],
  [
    "wcbt-df5595a1-87d5-43fe-87d7-efce22bbf671",
    "independent_directness_audit_all_choice_evidence_incomplete: 핸드실드·헬멧·팔덮개 보호구는 확인되지만 케이블 커넥터를 보호구가 아닌 전기 접속기구로 분류하는 직접 레슨 문장과 1차 출처가 결속되지 않았습니다.",
  ],
  [
    "wcbt-e0c8202c-2ec8-4d42-bc1a-01a4daab8fd6",
    "official_locator_directness_incomplete: KOSHA 화재등급표는 전기화재가 C급이라는 정답 방향은 지지하지만 현재 A·B·D급 선택지 피드백의 부가 설명 전체를 직접 지지하지 않습니다.",
  ],
  [
    "wcbt-e13a6159-7287-49bd-84e2-2f5f201c9394",
    "independent_directness_audit_all_choice_evidence_incomplete: 절연장갑과 절연형 홀더만 직접 설명하며 전격방지기·용접기 내부 접근까지 네 보기를 모두 판별하는 레슨 문장과 1차 출처가 결속되지 않았습니다.",
  ],
]);

export const WELDING_CBT_ANSWER_REVIEWS_PART_17 =
  WELDING_CBT_ANSWER_REVIEWS_PART_17_AUTHORED.map((entry) => {
    const directnessHoldReason = PART_17_DIRECTNESS_HOLD_REASONS.get(
      entry.canonicalId,
    );
    if (directnessHoldReason) {
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
        holdReasons: [directnessHoldReason],
        author: entry.author,
        authoredAt: entry.authoredAt,
        reviewer: "codex-final-directness-reviewer-parts15-19",
        reviewedAt: "2026-08-03T03:30:00.000Z",
      };
    }

    if (entry.canonicalId === "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb") {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        essentialRank: 1,
        essentialRationale:
          "무부하전압을 배제하고 아크전압으로 전류를 역산하는 입열 계산 문항입니다.",
        reviewer: PART_17_REVIEWER,
        reviewedAt: PART_17_REVIEWED_AT,
      };
    }

    if (entry.canonicalId === "wcbt-e35ba685-ecc1-49da-99db-77b53525e58a") {
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
        holdReasons: [
          "independent_review_direct_evidence_incomplete: 연결 레슨은 마찰용접의 압접 원리만 직접 뒷받침하며, 가스·노내·저항 납땜을 모두 경납땜으로 분류하는 문항별 근거가 결속되지 않았습니다.",
        ],
        author: entry.author,
        authoredAt: entry.authoredAt,
        reviewer: PART_17_REVIEWER,
        reviewedAt: PART_17_REVIEWED_AT,
      };
    }

    return {
      ...entry,
      reviewStatus: "hold" as const,
      essentialRank: null,
      essentialRationale: null,
      reviewer: PART_17_REVIEWER,
      reviewedAt: PART_17_REVIEWED_AT,
    };
  });
