const AUTHOR = "welding-author-part05";
const AUTHORED_AT = "2026-08-03T00:30:00.000Z";
const REVIEWER = "codex-welding-reviewer-part-05";
const REVIEWED_AT = "2026-08-02T15:42:34.050Z";

function holdCandidate(
  canonicalId: string,
  contentDigest: string,
  assessmentKind: string,
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
  } as const;
}

const WELDING_CBT_ANSWER_REVIEWS_PART_05_BASE = [
  holdCandidate(
    "wcbt-3992f95e-df2c-426a-9290-5134028d0e23",
    "332f97757a98ffb48a821ca996f6a14fefac11b5adb9470f1ad10cef7be6e334",
    "calculation",
    [
      "missing_direct_formula_evidence: 가스 안전 레슨에 산소 용기 내용적과 압력을 대기압 환산 부피로 계산하는 식이 없고 CBTBank 문제 외 직접 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-39d3434f-93e6-43af-92af-d8fa5e7b1401",
    "64699f2201e91c99034684feba5ecb4fc888f6c9af19ad86c0848d4be64517dc",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 홀더 노출부의 상대 위험도를 뒷받침하는 산업안전 공식 1차 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3b1ab86a-05b8-4009-8c18-b790ecb386f0",
    "34e74c7739bfc3edcb5d43848c9ff014377a7e5b20dbe1a153eb78e269640fe6",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 실내 용접흄 환기설비 필요성을 뒷받침하는 산업안전 공식 1차 URL이 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3b8734af-12f5-4ec0-aa98-992b504e0759",
    "595bb22e7616d4d11148ba009a17661b1b556b2454a0084ee443cf660b48c97e",
    "safety",
    [
      "safety_numeric_threshold_requires_official_source: 감전 사망위험 전류 50mA 기준의 조건·통전시간·경로를 확인할 공식 1차 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3c30431c-21a3-4d3a-8b15-35b1395798e1",
    "48ce115719dc49ea17f91801e37b3cc40d0c8da8dd52a64aac39918ecdb1c94e",
    "safety",
    [
      "missing_leaf_lesson_and_official_safety_source: 제안된 lesson-1ctkzud가 용접 CBT 공개 레슨에 없고 안전보건표지 지시색의 현행 공식 근거도 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3c9ee1f8-ee8a-49b8-84ec-350a0ee3f1c0",
    "90585c002d781d486d895e3b6230a91957c1be041de677976594c11ecc76a310",
    "safety",
    [
      "lesson_mismatch_and_official_installation_source_missing: 화재안전 레슨은 용접기 설치 온도조건을 다루지 않으며 제조사·공식 안전기준 URL도 연결되지 않았습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-3cdeac36-72b5-4967-9ed9-8cc0756c94ae",
    contentDigest:
      "b2ba63512f6494f96279412afc14120d54a318e5e26ca2436ff4359e27dd44e7",
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
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=474&callmode=normal&catimage=&eclang=ko&start=216&um=s",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=516&callmode=normal&catimage=&eclang=ko&start=204&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-3cdeac36-72b5-4967-9ed9-8cc0756c94ae",
        },
      ],
    },
    answerExplanation:
      "종이·목재·석탄처럼 연소 후 재를 남기는 일반 가연물의 화재는 A급입니다. B급은 유류·가연성 액체, C급은 전기설비, D급은 금속 화재이므로 지문의 물질군에 맞는 정답은 A급 화재입니다.",
    solutionSteps: [
      "지문의 종이·목재·석탄을 일반 가연물로 분류합니다.",
      "일반 가연물에 대응하는 A급을 선택하고 유류·전기설비·금속 화재인 B·C·D급을 제외합니다.",
    ],
    keyRule:
      "일반 가연물은 A급, 유류·가연성 액체는 B급, 전기설비는 C급, 금속은 D급 화재로 구분합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "선택지 ‘A급 화재’는 종이·목재·석탄 같은 일반 가연물 화재에 해당하므로 지문과 일치합니다.",
        plausibleReason:
          "연소 후 재를 남기는 일반 고체 가연물을 A급과 연결하면 정확히 선택할 수 있습니다.",
        incorrectPoint: null,
        keyRule: "종이·목재 등 일반 가연물의 화재는 A급입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "선택지 ‘B급 화재’는 유류·가연성 액체 화재이므로 종이·목재·석탄의 일반화재와 분류가 다릅니다.",
        plausibleReason:
          "타는 물질이라는 공통점만 보고 모든 가연물을 B급으로 묶어 오해할 수 있습니다.",
        incorrectPoint:
          "지문은 액체 연료가 아니라 재를 남기는 일반 고체 가연물을 제시했습니다.",
        keyRule:
          "B급은 유류와 가연성 액체에 적용하고 일반 고체 가연물은 A급으로 분류합니다.",
        differenceFromCorrect:
          "정답 A급은 일반 가연물이고 B급은 유류·가연성 액체입니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "선택지 ‘C급 화재’는 전기설비 화재에 해당하며 종이·목재·석탄이라는 지문 조건과 맞지 않습니다.",
        plausibleReason:
          "전기설비 주변에 종이나 목재가 탈 수 있어 원인 물질과 화재 분류 대상을 혼동할 수 있습니다.",
        incorrectPoint:
          "지문에는 통전 중 전기설비 조건이 없고 일반 가연물만 제시됐습니다.",
        keyRule: "C급은 전기설비 화재이고 일반 가연물 자체의 화재는 A급입니다.",
        differenceFromCorrect:
          "정답 A급은 연소 물질이 일반 가연물인 경우이고 C급은 전기설비가 대상입니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "선택지 ‘D급 화재’는 금속 화재이므로 종이·목재·석탄이 타는 일반화재와 구분됩니다.",
        plausibleReason:
          "보기의 석탄을 금속성 광물과 비슷한 물질로 잘못 보면 D급을 떠올릴 수 있습니다.",
        incorrectPoint:
          "석탄은 이 문항에서 금속이 아니라 일반 가연물로 제시됐습니다.",
        keyRule: "D급은 금속 화재이고 종이·목재·석탄의 일반화재는 A급입니다.",
        differenceFromCorrect:
          "정답 A급은 일반 가연물 분류이고 D급은 금속이 연소하는 경우입니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-gas-evidence-promoter-part-05",
    authoredAt: "2026-08-03T03:00:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-3d750033-f180-44cd-afea-f4b6ea2a4138",
    "75090b1e81f8bf3e6ac901f341c278309cee9c7439d472dc78d866571d910dbb",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 아크용접 재해와 가스용접 역화를 구분하는 공식 안전 근거가 연결되지 않아 보기별 판정을 공개할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3e61a952-5a82-418f-b3fa-4b2c38ee696e",
    "ef13c3a99c1a441f6d02688c98c247fe93bcd660eb6059e4e0d1298f6ce14fac",
    "calculation",
    [
      "missing_direct_formula_evidence: 산소 소비량을 내용적과 고압게이지 차압으로 계산하는 식과 압력 단위 조건이 현재 레슨에 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3ea74ecf-6f29-4beb-89c1-d20f379e46b6",
    "3e0c0ff7dce520051adbb8cb4555720836b4ac2c1cc6008b852aaeebb99af0fc",
    "application",
    [
      "missing_published_leaf_lesson: 제안된 lesson-welding-defect-porosity가 weldingCbtLeafLessons에 없어 기공 원인과 황 함유량 보기를 직접 연결할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-3f4cea85-7b37-4be2-b6bf-0d1c4e3dc41a",
    "31e9733ada70bd2bdd0dabc5a734011dd504a7d29d73cbd0ccf55e279791c06d",
    "calculation",
    [
      "missing_direct_formula_evidence: 35℃ 조건의 산소 용기 대기압 환산식과 온도 보정 적용 여부가 현재 레슨과 직접 근거에 없습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-3ff084f2-2dbd-4d0d-825a-eee98c7175ca",
    contentDigest:
      "ddaa94b8eb9f9330e24b45b47da4bf052f0cc49f4d23ca98c75055a61a9a8991",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    assessmentKind: "identification",
    primaryLeafLessonId: "lesson-welding-resistance",
    conceptBinding: {
      lessonId: "lesson-welding-resistance",
      lessonBlockId: "structure",
      assertionText:
        "점용접은 개별 점 너깃을 만들고, 심용접은 롤러 전극으로 겹치는 연속 또는 간헐 점을 만들어 기밀한 이음을 얻습니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-resistance#structure",
        },
        {
          kind: "source_question",
          ref: "wcbt-3ff084f2-2dbd-4d0d-825a-eee98c7175ca",
        },
      ],
    },
    answerExplanation:
      "원판 모양의 롤러 전극으로 두 겹의 판을 가압·통전하면서 전극을 회전시키고 점용접을 연속적으로 겹쳐 만드는 공정은 심 용접입니다.",
    solutionSteps: [
      "전극 형상이 원판상 롤러이고 용접 중 계속 회전한다는 조건을 찾습니다.",
      "개별 점이 아니라 연속적으로 겹치는 너깃을 만드는 저항용접을 심 용접으로 판정합니다.",
    ],
    keyRule:
      "회전하는 롤러 전극으로 연속 또는 간헐 점을 이어 기밀한 이음을 만드는 저항용접은 심 용접입니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "심 용접은 롤러 전극을 회전시키며 겹치는 점 너깃을 연속적으로 만드는 공정이라 지문의 모든 조건과 일치합니다.",
        plausibleReason:
          "지문에 롤러 전극, 회전, 연속 점용접이라는 심 용접의 식별 단서가 모두 제시되어 있습니다.",
        incorrectPoint: null,
        keyRule:
          "롤러 전극과 연속적인 점 너깃 형성이 함께 나오면 심 용접입니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "confused_with",
        rationale:
          "업셋 용접은 맞댄 단면에 전류와 압력을 가해 접합하는 맞대기 저항용접으로 롤러 전극을 회전시키지 않습니다.",
        plausibleReason:
          "두 공정 모두 가압과 통전을 이용하는 저항용접이라 혼동할 수 있습니다.",
        incorrectPoint:
          "업셋 용접에는 원판 롤러 전극과 연속 점용접이라는 지문의 핵심 구조가 없습니다.",
        keyRule:
          "업셋은 맞대기 단면, 심 용접은 롤러 전극으로 겹친 판의 연속 이음을 만듭니다.",
        differenceFromCorrect:
          "정답은 롤러 전극이 이동하며 점 너깃을 잇지만 업셋 용접은 맞댄 단면 전체를 가압합니다.",
      },
      {
        choiceIndex: 2,
        relation: "confused_with",
        rationale:
          "퍼커션 용접은 순간적인 아크와 충격 압력으로 맞대기 접합하는 방식이라 롤러 전극의 연속 운전과 다릅니다.",
        plausibleReason:
          "짧은 시간에 압력을 가하는 용접이라는 공통점 때문에 저항용접 종류로 오인하기 쉽습니다.",
        incorrectPoint:
          "퍼커션 용접은 회전 롤러로 두 판을 연속 점용접하는 공정이 아닙니다.",
        keyRule:
          "퍼커션은 순간 방전과 충격 압력, 심 용접은 롤러 전극과 연속 너깃이 구분 기준입니다.",
        differenceFromCorrect:
          "정답은 길이 방향 이음을 만들지만 퍼커션 용접은 주로 맞대기 단면을 순간 접합합니다.",
      },
      {
        choiceIndex: 3,
        relation: "confused_with",
        rationale:
          "프로젝션 용접은 모재의 돌기에 전류와 압력을 집중해 정해진 위치의 너깃을 만들며 롤러 전극을 사용하지 않습니다.",
        plausibleReason:
          "여러 점을 한 번에 만들 수 있어 연속 점용접과 비슷하게 느껴질 수 있습니다.",
        incorrectPoint:
          "지문에는 돌기나 국부 집중이 아니라 회전하는 원판 전극이 명시되어 있습니다.",
        keyRule:
          "돌기에 전류를 집중하면 프로젝션, 롤러 전극으로 점을 이어가면 심 용접입니다.",
        differenceFromCorrect:
          "정답은 이동하는 롤러를 쓰지만 프로젝션 용접은 고정된 돌기 위치를 이용합니다.",
      },
    ],
    essentialRank: 3,
    essentialRationale:
      "롤러 전극과 연속 점용접 단서로 심 용접을 판별하는 대표 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-40198adf-2738-4579-a773-c881390b9359",
    "b8d48596f6093ba2016b11b69a0f18da864a18b0c4b74ce6db90d0b35ef5b5f7",
    "safety",
    [
      "safety_numeric_threshold_requires_official_source: 안전모 내부수직거리 규격의 판본·적용시점을 확인할 공식 보호구 인증기준이 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4024dd7f-1b01-4c75-b45d-acb3790544bf",
    "c4571d5ebcbe530e254aa211c1c025890f8c0da0c5ed92f34d3a29259a3419dc",
    "application",
    [
      "missing_published_leaf_lesson: 제안된 lesson-welding-defect-crack가 weldingCbtLeafLessons에 없어 E 4301 용접봉의 내균열성을 직접 연결할 수 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4068b5c0-c9b8-43b2-a449-51777e52adc2",
    "1b7e764464356fcc368fe322e8315b1c6cf1b780410490aa463bac413f0f5bd2",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 절연 홀더 파손 시 즉시 보수·교체해야 한다는 공식 안전 절차와 A형·B형 홀더 조건이 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-408e679b-c056-4d0d-b726-f187e81b9d6d",
    "ddbe2dfdcc02c0712cb862ffb276b71fba0c21aaa72a5509ee69b92a688e3450",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 산소·아세틸렌 용기 보관 온도와 이격거리 선택지를 판정할 현행 공식 고압가스 안전기준이 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-40e58c7c-ed00-4479-bb95-547a99decb79",
    "71a9c85d484afa9b83e0cdc853f77162733cc900dcf21e3bdf44e582a74568ce",
    "application",
    [
      "lesson_mismatch_and_manufacturer_spec_missing: TIG 공랭식 토치의 약 200A 사용범위는 가스용기 안전 레슨과 무관하며 제조사 사양 근거가 연결되지 않았습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-40eec9f7-55e4-415c-8ece-e7a3f7a41d59",
    contentDigest:
      "e200519769998bb3e417b5a05f521af8c42d618b91a16c6ce4559a7306faf090",
    authoringDisposition: "publish_candidate",
    reviewStatus: "pending",
    assessmentKind: "safety",
    primaryLeafLessonId: "lesson-welding-safety-gas",
    conceptBinding: {
      lessonId: "lesson-welding-safety-gas",
      lessonBlockId: "principle",
      assertionText:
        "용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 전도·낙하·충격을 막습니다. 용해아세틸렌 용기는 운반·보관·사용할 때 세워 고정합니다.",
      evidenceRefs: [
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-gas#principle",
        },
        {
          kind: "lesson_block",
          ref: "lesson-welding-safety-gas#definition",
        },
        {
          kind: "official_source",
          ref: "https://www.law.go.kr/LSW/flDownload.do?flSeq=164929995",
        },
        {
          kind: "official_source",
          ref: "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=158&um=s",
        },
        {
          kind: "source_question",
          ref: "wcbt-40eec9f7-55e4-415c-8ece-e7a3f7a41d59",
        },
      ],
    },
    answerExplanation:
      "지문은 산소와 아세틸렌 용기의 올바른 취급을 묻습니다. 용기는 직사광선과 열원을 피하고 표면온도를 40℃ 이하로 유지해야 하므로 ‘산소병은 40℃ 이하 온도에서 보관한다’가 맞습니다. 직사광선 보관, 다른 가스 혼합, 아세틸렌병을 눕혀 사용하는 나머지 보기는 각각 가열·혼합·전도 방지 원칙에 어긋납니다.",
    solutionSteps: [
      "각 보기를 용기 표면온도 40℃ 이하·직사광선 회피·가스 혼합 방지·용해아세틸렌 세움 고정 규칙과 대조합니다.",
      "네 규칙 가운데 유일하게 그대로 일치하는 ‘산소병은 40℃ 이하 온도에서 보관한다’를 선택합니다.",
    ],
    keyRule:
      "가스용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 용해아세틸렌 용기는 세워 고정합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "supports",
        rationale:
          "선택지 ‘산소병은 40℃ 이하 온도에서 보관한다’는 레슨과 법령 근거의 용기 표면온도 상한과 일치합니다.",
        plausibleReason:
          "숫자 40℃와 ‘이하’의 방향을 정확히 확인하면 올바른 취급임을 판단할 수 있습니다.",
        incorrectPoint: null,
        keyRule:
          "충전용기는 직사광선과 열원을 피하고 표면온도를 40℃ 이하로 유지합니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 1,
        relation: "contradicts",
        rationale:
          "선택지 ‘직사광선이 잘 드는 곳에 보관한다’는 직사광선을 피하라는 용기 가열 방지 원칙과 반대입니다.",
        plausibleReason:
          "밝고 눈에 잘 띄는 장소가 점검에 편리하다고 생각하면 안전한 보관 장소로 오해할 수 있습니다.",
        incorrectPoint:
          "직사광선은 용기 표면온도를 높일 수 있으므로 피해야 합니다.",
        keyRule: "가스용기는 직사광선과 열원에서 떨어진 장소에 보관합니다.",
        differenceFromCorrect:
          "정답은 온도 상승을 제한하지만 이 보기는 직사광선으로 가열될 조건을 만듭니다.",
      },
      {
        choiceIndex: 2,
        relation: "contradicts",
        rationale:
          "선택지 ‘산소병 내에 다른 가스를 혼합해도 상관없다’는 가스설비에서 혼합을 방지해야 한다는 정의와 어긋납니다.",
        plausibleReason:
          "산소가 이미 기체이므로 다른 기체와 섞여도 용기 상태가 같다고 단순하게 생각할 수 있습니다.",
        incorrectPoint:
          "산소용기에 다른 가스를 임의 혼합하는 것은 허용되는 취급으로 볼 수 없습니다.",
        keyRule:
          "고압가스 용기와 연결계통은 가스별로 구분하고 임의 혼합을 방지합니다.",
        differenceFromCorrect:
          "정답은 명시된 온도 관리 기준을 지키지만 이 보기는 방지해야 할 가스 혼합을 허용합니다.",
      },
      {
        choiceIndex: 3,
        relation: "contradicts",
        rationale:
          "선택지 ‘아세틸렌병은 안전상 눕혀서 사용한다’는 용해아세틸렌 용기를 세워 고정하라는 원칙과 반대입니다.",
        plausibleReason:
          "눕히면 넘어질 높이가 낮아 안전하다고 생각할 수 있지만 용해아세틸렌 용기의 사용 자세는 세움 고정입니다.",
        incorrectPoint:
          "용해아세틸렌 용기는 눕히지 않고 세워 고정한 상태로 사용해야 합니다.",
        keyRule: "용해아세틸렌 용기는 운반·보관·사용할 때 세워 고정합니다.",
        differenceFromCorrect:
          "정답은 용기 온도 기준을 지키고 이 보기는 아세틸렌 용기의 올바른 사용 자세를 거꾸로 설명합니다.",
      },
    ],
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "codex-gas-evidence-promoter-part-05",
    authoredAt: "2026-08-03T03:00:00.000Z",
    reviewer: null,
    reviewedAt: null,
  },
  holdCandidate(
    "wcbt-41060104-877e-4bb6-97a4-98871d43ce19",
    "afc267d218f8d2ec9a2ecdab314eafa78709273af34e89d89b8cf9e6a1c4a341",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 아연도금판 용접 시 금속흄열 위험을 비교하는 공식 산업보건 1차 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-415b45d0-c3d0-43b3-8f8f-0eec7b46bdfb",
    "70d5290cd513b9e93a0e56bbb05f2189ba76d40a9c1a35d6cd91983016782e15",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 용기 혼합보관 금지·캡 운반·누설시험을 한 문항에서 판정할 공식 고압가스 안전기준이 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-41ef9ea0-1284-4e13-9490-eb556396fe02",
    "d1ffa3c18e3acb2321ebdd0ca8ea2640e62275bf16d14abbe408be4ab955626a",
    "identification",
    [
      "lesson_gap_low_temperature_stress_relief_definition_missing: 변형 레슨은 잔류응력 제거방법을 언급하지만 150~200℃ 가열 후 수냉하는 저온 응력 완화법의 직접 정의가 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-425de48f-f4b5-4af4-b15a-b9c536583d6d",
    "f7e5ddd0d1b7c6a504144d1044b60cc39530eecfd23f4801b3b4b00d123c905f",
    "calculation",
    [
      "missing_direct_formula_evidence: 고압측 압력계 지시값과 용기 내용적으로 잔류 산소량을 계산하는 환산식이 현재 레슨에 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-4346c5cd-a267-476e-8733-c5c0a5f88360",
    "d59f1431c49ef5fae44757187b5b3753ee5e62849882afd37c6804b10c182151",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 습윤 보호구 금지와 절연 홀더 즉시 보수 절차를 뒷받침하는 산업안전 공식 1차 근거가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-44be46e0-0c52-4056-ad68-bd95d9c44da4",
    "77a66830209fae16dad1adadb1485471987854930c711b81b734c8d88b0823c7",
    "principle",
    [
      "lesson_gap_arc_voltage_component_formula_missing: 전원 레슨에 양극·음극·아크 기둥 전압강하의 합으로 아크전압을 구하는 직접 식이 없습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-45159144-f12f-4a40-92fc-b58bd50eba03",
    "6cc17234d789a5edd2200ef3f68b0ea0863b8e9e496aa2538d5b95162d3e9b72",
    "safety",
    [
      "safety_numeric_threshold_requires_official_source: 25mm 이하 연강 산소절단의 차광번호 3~4를 확인할 현행 공식 보호구 기준이 연결되지 않았습니다.",
    ],
  ),
  {
    canonicalId: "wcbt-4533db22-25e9-48ab-8060-a0559a855a21",
    contentDigest:
      "c33acacc3343a909e8af7be12de5db92f83871ff808787363bd93ff5e040237c",
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
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
          kind: "calculation_derivation",
          ref: "H=ηVI×60/v=1×24V×200A×60s/min÷6cm/min=48000 J/cm",
        },
        {
          kind: "source_question",
          ref: "wcbt-4533db22-25e9-48ab-8060-a0559a855a21",
        },
      ],
    },
    answerExplanation:
      "단위 길이 입열식 H=ηVI×60/v에 문제에서 별도 효율이 제시되지 않은 조건의 η=1, V=24V, I=200A, v=6cm/min을 대입하면 H=1×24×200×60÷6=48000J/cm입니다.",
    solutionSteps: [
      "식을 H=ηVI×60/v [J/cm]로 세우고, 효율이 별도로 없으므로 η=1로 둡니다.",
      "H=1×24V×200A×60s/min÷6cm/min으로 주어진 값을 단위와 함께 대입합니다.",
      "V×A=J/s이고 60s/min과 cm/min이 소거되므로 결과 단위는 J/cm입니다.",
      "1×24×200×60÷6을 계산해 H=48000J/cm를 얻습니다.",
    ],
    keyRule:
      "속도가 cm/min이면 H=ηVI×60/v [J/cm]를 사용하고, 효율이 생략된 이 문항은 η=1로 대입합니다.",
    choiceFeedback: [
      {
        choiceIndex: 0,
        relation: "unit_error",
        rationale:
          "29000J/cm는 24×200×60÷6의 계산 결과가 아니며 초와 분의 변환 또는 나눗셈 과정이 누락된 값입니다.",
        plausibleReason:
          "전압·전류·속도를 바로 조합하면서 60초 환산을 일부만 적용하면 근접한 수치를 만들 수 있습니다.",
        incorrectPoint:
          "속도가 분당 단위인데 1분의 에너지를 정확히 구하지 않아 단위가 일치하지 않습니다.",
        keyRule:
          "cm/min 속도에는 반드시 60s/min을 곱한 뒤 분당 이동길이로 나눕니다.",
        differenceFromCorrect:
          "정답 48000J/cm는 288000J를 6cm로 나눈 값이지만 29000은 이 대입식과 일치하지 않습니다.",
      },
      {
        choiceIndex: 1,
        relation: "substitution_error",
        rationale:
          "32000J/cm는 주어진 24V, 200A, 6cm/min을 입열식에 모두 정확히 대입한 결과가 아닙니다.",
        plausibleReason:
          "속도 6을 다른 계수로 오인하거나 전압·전류 중 하나를 잘못 옮기면 선택하기 쉬운 값입니다.",
        incorrectPoint:
          "4800J/s×60s÷6cm의 마지막 몫은 48000이지 32000이 아닙니다.",
        keyRule:
          "각 숫자를 단위와 함께 대입하고 24×200×60÷6을 한 단계씩 검산합니다.",
        differenceFromCorrect:
          "정답은 1분 에너지와 1분 이동거리의 비이고 32000은 그 비를 충족하지 않습니다.",
      },
      {
        choiceIndex: 2,
        relation: "supports",
        rationale:
          "24V×200A×60s÷6cm=48000J/cm이므로 전압·전류·시간·길이 단위가 모두 맞습니다.",
        plausibleReason:
          "분당 속도를 초 단위 전력과 맞추기 위해 60을 곱하는 계산을 정확히 적용했습니다.",
        incorrectPoint: null,
        keyRule:
          "입열은 단위 길이에 공급된 에너지이므로 전력에 시간을 곱하고 용접길이로 나눕니다.",
        differenceFromCorrect: null,
      },
      {
        choiceIndex: 3,
        relation: "substitution_error",
        rationale:
          "58000J/cm는 주어진 수치로 계산한 48000J/cm보다 10000J/cm 크며 대입 또는 산술 오류입니다.",
        plausibleReason:
          "전류나 전압의 숫자를 잘못 읽거나 곱셈 결과 288000을 잘못 나누면 선택할 수 있습니다.",
        incorrectPoint:
          "주어진 모든 수치를 그대로 사용하면 분자는 288000J이고 이를 6cm로 나눈 몫은 48000입니다.",
        keyRule:
          "분자 24×200×60=288000과 최종 나눗셈 288000÷6=48000을 각각 검산합니다.",
        differenceFromCorrect:
          "정답 48000은 정확한 단위 환산값이고 58000은 어느 올바른 중간값에서도 나오지 않습니다.",
      },
    ],
    essentialRank: 4,
    essentialRationale:
      "전압·전류·용접속도를 적용해 단위 길이당 용접 입열량을 계산하는 대표 수치 문항입니다.",
    holdReasons: [],
    author: AUTHOR,
    authoredAt: AUTHORED_AT,
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
  },
  holdCandidate(
    "wcbt-4540c967-cdf8-482e-b865-a9ddd68ed5bb",
    "d8ad83186290e3050ebb1250625033ee217ed98ef773be271e0427e8aca6cf05",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 아세틸렌 용기 연결부 화재의 최초 조치를 확정할 공식 비상조치 절차가 연결되지 않았습니다.",
    ],
  ),
  holdCandidate(
    "wcbt-456f08fc-6a2a-4339-b0af-a7590eb048cb",
    "5cd61942530100b764adbaf69c2efb3308fec4473c01f2abc2ff54ad13bf1f16",
    "safety",
    [
      "safety_claim_requires_official_primary_source: 아연도금 강판 용접의 환기와 빈 용기 용접 전 점검을 함께 판정할 산업안전 공식 1차 근거가 연결되지 않았습니다.",
    ],
  ),
] as const;

const FINAL_REVIEWER = "codex-welding-reviewer-final-parts01-05";
const FINAL_REVIEWED_AT = "2026-08-03T04:30:00.000Z";

export const WELDING_CBT_ANSWER_REVIEWS_PART_05 =
  WELDING_CBT_ANSWER_REVIEWS_PART_05_BASE.map((entry) => {
    if (entry.canonicalId === "wcbt-3b1ab86a-05b8-4009-8c18-b790ecb386f0")
      return {
        ...entry,
        authoringDisposition: "publish_candidate" as const,
        reviewStatus: "pending" as const,
        primaryLeafLessonId: "lesson-welding-safety-ventilation",
        conceptBinding: {
          lessonId: "lesson-welding-safety-ventilation",
          lessonBlockId: "definition",
          assertionText:
            "환기는 작업자의 호흡영역으로 오기 전에 오염물질을 포집·희석해 노출을 줄이는 공학적 대책입니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-ventilation#definition",
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
          "용접 흄(fume)에 관한 올바른 보기는 ‘실내 용접 작업에서는 환기설비가 필요하다.’입니다. 용접흄은 인체에 무해하지 않으며 KOSHA도 용접 작업 중 지속적인 환기·배기로 노출을 줄이도록 안내합니다.",
        solutionSteps: [
          "흄의 건강영향을 부정한 보기를 먼저 제외합니다.",
          "실내 작업의 공학적 대책인 환기설비를 찾습니다.",
          "방진마스크만으로 충분하다는 주장을 배제합니다.",
        ],
        keyRule:
          "용접흄은 환기·배기로 먼저 제어하고, 필요 시 호흡보호구를 보완합니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "contradicts" as const,
            rationale: "흄은 호흡기 노출을 관리해야 하는 유해인자입니다.",
            plausibleReason:
              "눈에 잘 보이지 않아 무해하다고 오해할 수 있습니다.",
            incorrectPoint: "무해하다는 전제가 틀렸습니다.",
            keyRule: "흄 노출은 환기로 낮춥니다.",
            differenceFromCorrect:
              "1번은 위험을 부정하고 2번은 노출을 제어합니다.",
          },
          {
            choiceIndex: 1,
            relation: "supports" as const,
            rationale:
              "실내에서는 환기설비가 흄의 체류를 줄이는 공학적 대책입니다.",
            plausibleReason:
              "작업 장소가 넓으면 자연환기만으로 충분하다고 생각할 수 있습니다.",
            incorrectPoint: null,
            keyRule: "실내 용접은 환기설비를 갖춥니다.",
            differenceFromCorrect: null,
          },
          {
            choiceIndex: 2,
            relation: "contradicts" as const,
            rationale:
              "용접봉 성분과 공정에 따라 흄의 조성과 노출 위험이 달라집니다.",
            plausibleReason: "모든 흄을 같은 먼지로 단순화하기 쉽습니다.",
            incorrectPoint: "위험이 전혀 없다는 단정이 틀렸습니다.",
            keyRule: "발생원과 공정에 따라 노출을 평가합니다.",
            differenceFromCorrect:
              "3번은 위험을 무시하고 2번은 설비로 관리합니다.",
          },
          {
            choiceIndex: 3,
            relation: "contradicts" as const,
            rationale:
              "가제마스크는 환기설비나 적정 호흡보호구를 대신하지 못합니다.",
            plausibleReason:
              "얼굴을 가리면 모든 입자를 막는다고 오해할 수 있습니다.",
            incorrectPoint: "보호수단의 성능과 흄 노출관리를 과장했습니다.",
            keyRule: "공학적 환기를 개인용 단순 마스크로 대체하지 않습니다.",
            differenceFromCorrect:
              "4번은 불충분한 보호를 주장하고 2번은 발생환경을 제어합니다.",
          },
        ],
        essentialRank: null,
        essentialRationale: null,
        holdReasons: [],
        author: "codex-safety-author-part05",
        authoredAt: "2026-08-03T08:00:00.000Z",
        reviewer: null,
        reviewedAt: null,
      };
    if (entry.canonicalId === "wcbt-4068b5c0-c9b8-43b2-a449-51777e52adc2")
      return {
        ...entry,
        authoringDisposition: "publish_candidate" as const,
        reviewStatus: "pending" as const,
        primaryLeafLessonId: "lesson-welding-safety-electrical",
        conceptBinding: {
          lessonId: "lesson-welding-safety-electrical",
          lessonBlockId: "principle",
          assertionText:
            "피복이 손상된 케이블과 절연이 파손된 홀더는 사용하지 않고 적정 규격으로 보수·교체한 뒤 사용합니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-electrical#principle",
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
          "용접 작업 안전에서 틀린 보기는 ‘절연 홀더의 절연 부분 파손 시 작업 완료 후 보수하거나 교체한다.’입니다. 절연부가 파손된 홀더는 작업 완료 뒤가 아니라 즉시 사용을 중단하고 보수·교체해야 합니다. 자동전격방지기의 현행 법적 설치 의무는 특정 고위험 장소에 적용되고 그 밖의 장소에서는 일반 안전 권고와 구분합니다. A형 홀더의 우선 사용은 교육적 안전 권고로 설명하며, 현행 B형 홀더 전체를 불법·표준 부적합·사용금지로 보지 않습니다.",
        solutionSteps: [
          "전격 위험을 줄이는 조치인지 확인하고 법적 의무와 일반 안전 권고를 구분합니다.",
          "젖은 보호구와 손상된 절연부는 위험을 키우며, 파손 홀더는 즉시 사용 중지 대상임을 적용합니다.",
          "보수를 작업 완료 뒤로 미루는 4번을 선택하고 A형·B형 홀더의 현행 표준 지위를 이 답과 혼동하지 않습니다.",
        ],
        keyRule:
          "절연 홀더 파손은 사용 중지 사유이며 보수·교체 후에만 다시 사용합니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "refuted_by" as const,
            rationale:
              "전격방지기는 용접하지 않을 때 무부하전압 위험을 낮추는 안전장치입니다. 현행 법적 의무가 적용되는 작업장소와 그 밖의 일반 설치 권고는 구분해야 합니다.",
            plausibleReason:
              "아크가 켜진 상태에서는 효과가 없다고 생각할 수 있습니다.",
            incorrectPoint:
              "전격방지기 부착은 감전 저감 안전조치이므로 틀린 보기가 아닙니다. 다만 모든 교류아크용접기에 대한 보편적 법적 의무라고 확대하지 않습니다.",
            keyRule: "전격방지기의 일반 안전 기능과 현행 법적 설치 의무범위를 분리합니다.",
            differenceFromCorrect:
              "1번은 전기 위험을 줄이고 4번은 절연 결함을 방치합니다.",
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale:
              "A형 홀더를 우선하는 것은 충전부 접근방호를 강화하는 교육적 안전 권고로 읽을 수 있습니다.",
            plausibleReason:
              "홀더 형식 차이가 작업성만 좌우한다고 볼 수 있습니다.",
            incorrectPoint: "A형 사용 권고는 위험을 증가시키는 행동이 아닙니다. 현행 B형 홀더 전체를 불법·표준 부적합·사용금지로 단정해서도 안 됩니다.",
            keyRule: "A형 우선 권고와 A형·B형의 현행 표준상 허용 여부를 분리합니다.",
            differenceFromCorrect:
              "2번은 보호 형식을 선택하고 4번은 보호 성능 저하를 방치합니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale:
              "젖은 작업복·장갑·작업화는 인체 저항을 낮춰 감전 위험을 키웁니다.",
            plausibleReason:
              "작업 편의를 위해 젖은 장비를 계속 쓰고 싶을 수 있습니다.",
            incorrectPoint: "젖은 보호구를 피하는 것은 올바른 예방조치입니다.",
            keyRule: "습윤 상태에서는 절연 보호 성능을 신뢰하지 않습니다.",
            differenceFromCorrect:
              "3번은 감전 경로를 줄이고 4번은 충전부 노출을 남깁니다.",
          },
          {
            choiceIndex: 3,
            relation: "supports" as const,
            rationale:
              "파손된 절연부는 충전부 접촉 위험을 만들므로 즉시 사용을 중지해야 합니다.",
            plausibleReason:
              "작업이 얼마 남지 않았으면 나중에 고쳐도 된다고 생각할 수 있습니다.",
            incorrectPoint: null,
            keyRule: "절연 파손은 즉시 보수·교체합니다.",
            differenceFromCorrect: null,
          },
        ],
        essentialRank: null,
        essentialRationale: null,
        holdReasons: [],
        author: "codex-safety-author-part05",
        authoredAt: "2026-08-03T08:00:00.000Z",
        reviewer: null,
        reviewedAt: null,
      };
    if (entry.canonicalId === "wcbt-4346c5cd-a267-476e-8733-c5c0a5f88360")
      return {
        ...entry,
        authoringDisposition: "publish_candidate" as const,
        reviewStatus: "pending" as const,
        primaryLeafLessonId: "lesson-welding-safety-electrical",
        conceptBinding: {
          lessonId: "lesson-welding-safety-electrical",
          lessonBlockId: "definition",
          assertionText:
            "젖은 장소, 땀에 젖은 보호구, 손상된 절연, 협소한 도전성 구조물은 인체 저항을 낮추거나 접촉 가능성을 높여 감전 위험을 키웁니다.",
          evidenceRefs: [
            {
              kind: "lesson_block" as const,
              ref: "lesson-welding-safety-electrical#definition",
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
          "전격의 방지대책에서 틀린 보기는 ‘땀, 물 등에 의해 습기찬 작업복, 장갑, 구두 등을 착용해도 된다.’입니다. 습기로 젖은 보호구는 절연 신뢰성을 낮춰 감전 위험을 키웁니다. 반면 맨손 취급 금지, 용접기 내부 비접촉, 손상 홀더의 즉시 보수·교체는 모두 올바른 전격 방지 대책입니다.",
        solutionSteps: [
          "전격 방지 대책을 묻는 부정형 문항임을 확인합니다.",
          "습윤 보호구가 감전 경로를 줄이는지 검토합니다.",
          "젖은 보호구 착용을 허용한 1번을 고릅니다.",
        ],
        keyRule:
          "물기와 손상된 절연은 감전 위험을 키우므로 건조한 보호구와 건전한 절연홀더를 유지합니다.",
        choiceFeedback: [
          {
            choiceIndex: 0,
            relation: "supports" as const,
            rationale:
              "땀·물로 젖은 작업복과 장갑·구두는 절연 성능을 떨어뜨립니다.",
            plausibleReason:
              "보호구를 착용했으니 젖어도 보호된다고 생각할 수 있습니다.",
            incorrectPoint: null,
            keyRule: "습윤 보호구는 사용하지 않습니다.",
            differenceFromCorrect: null,
          },
          {
            choiceIndex: 1,
            relation: "refuted_by" as const,
            rationale: "맨손 취급 금지는 통전부와의 직접 접촉을 막습니다.",
            plausibleReason:
              "용접봉을 짧게 만지면 괜찮다고 오해할 수 있습니다.",
            incorrectPoint: "맨손 취급 금지는 올바른 대책입니다.",
            keyRule: "통전 가능 부품은 절연 보호구와 홀더로 다룹니다.",
            differenceFromCorrect:
              "2번은 접촉을 막고 1번은 습윤 경로를 허용합니다.",
          },
          {
            choiceIndex: 2,
            relation: "refuted_by" as const,
            rationale:
              "용접기 내부의 충전부에는 함부로 손대지 않는 것이 기본 전기안전 조치입니다.",
            plausibleReason:
              "간단한 점검은 전원을 끄지 않고 해도 된다고 생각할 수 있습니다.",
            incorrectPoint: "내부 접촉 금지는 안전한 행동입니다.",
            keyRule: "점검·정비 전에는 전원을 분리합니다.",
            differenceFromCorrect:
              "3번은 충전부 접촉을 피하고 1번은 절연 저하를 허용합니다.",
          },
          {
            choiceIndex: 3,
            relation: "refuted_by" as const,
            rationale:
              "절연부 파손은 충전부 노출을 만들 수 있어 즉시 보수·교체해야 합니다.",
            plausibleReason:
              "작은 균열은 다음 정비 때 처리해도 된다고 생각할 수 있습니다.",
            incorrectPoint: "즉시 보수·교체는 올바른 전격 방지 조치입니다.",
            keyRule: "파손된 절연홀더는 사용을 중단합니다.",
            differenceFromCorrect:
              "4번은 결함을 제거하고 1번은 감전 가능성을 높입니다.",
          },
        ],
        essentialRank: null,
        essentialRationale: null,
        holdReasons: [],
        author: "codex-safety-author-part05",
        authoredAt: "2026-08-03T08:00:00.000Z",
        reviewer: null,
        reviewedAt: null,
      };
    if (entry.canonicalId === "wcbt-3ff084f2-2dbd-4d0d-825a-eee98c7175ca") {
      return {
        ...entry,
        reviewStatus: "approved" as const,
        conceptBinding: {
          ...entry.conceptBinding,
          assertionText:
            "롤러 전극으로 연속 너깃을 만들면 심용접이고, 맞댄 단면을 가압하면 업셋용접, 짧은 아크와 순간 충격압력을 쓰면 퍼커션용접, 돌기에 전류와 압력을 집중하면 프로젝션용접입니다.",
        },
        holdReasons: [],
        reviewer: "codex-welding-directness-reviewer-parts01-05",
        reviewedAt: "2026-08-03T06:20:00.000Z",
      };
    }
    if (entry.canonicalId === "wcbt-3cdeac36-72b5-4967-9ed9-8cc0756c94ae") {
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
          "official_fire_class_mapping_incomplete: 연결된 1차 근거에서 A·B·C·D급의 네 분류를 문제 보기 전체와 같은 범위로 직접 확인하지 못해 공개하지 않습니다.",
        ],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    if (entry.canonicalId === "wcbt-40eec9f7-55e4-415c-8ece-e7a3f7a41d59") {
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
          "official_choice_scope_incomplete: 용기 40℃ 이하·직사광선 회피·다른 가스 혼합 금지·아세틸렌 용기 세움의 네 보기를 모두 직접 대조할 1차 근거가 연결되지 않아 공개하지 않습니다.",
        ],
        reviewer: FINAL_REVIEWER,
        reviewedAt: FINAL_REVIEWED_AT,
      };
    }
    return entry;
  });
