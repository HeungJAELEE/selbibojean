import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";

type PromotionSpec = {
  canonicalId: string;
  lessonId: string;
  officialSource: string;
  assertionText: string;
  answerExplanation: string;
  solutionSteps: readonly string[];
  keyRule: string;
  choiceRationales: readonly [string, string, string, string];
};

const AUTHOR = "subject-2-final-five-promotion";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const KOSHA_ELECTRICAL_WELDING_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=483&callmode=normal&catimage=&eclang=ko&start=154&um=s";
const KOSHA_WELDING_SAFETY_GUIDE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s";

const PROMOTION_SPECS: readonly PromotionSpec[] = [
  {
    canonicalId: "wcbt-01fc477e-07c3-415a-b6fd-7b9b6272ec56",
    lessonId: "lesson-welding-safety-electrical",
    officialSource: KOSHA_ELECTRICAL_WELDING_GUIDE,
    assertionText:
      "인체에 흐르는 전류가 커질수록 근육 경직, 호흡 곤란, 심실세동 위험이 증가하므로 50 mA를 위험이 없다고 판단해서는 안 됩니다.",
    answerExplanation:
      "틀린 안전 문장은 3번입니다. 인체 통전 전류 50 mA는 근육 경직과 호흡 곤란, 심장 이상을 일으킬 수 있는 위험 영역이므로 ‘위험을 수반하지 않는다’는 표현이 성립하지 않습니다.",
    solutionSteps: [
      "지문이 안전 사항 중 틀린 문장을 찾는 부정형 문제임을 먼저 확인합니다.",
      "각 보기의 핵심 위험원을 차광, 오존, 감전 전류, 아크광에 의한 안구 손상으로 나눕니다.",
      "50 mA 통전 상태를 안전하다고 단정한 3번은 인체 전류 위험 원칙과 반대이므로 정답으로 선택합니다.",
    ],
    keyRule:
      "감전 문제에서는 전류가 커질수록 인체 위해가 증가하며, 50 mA를 위험이 없는 전류로 보지 않습니다.",
    choiceRationales: [
      "1번은 TIG 아크광에 대응하는 높은 차광도 범위를 제시한 시험은행의 안전 문장으로, 50 mA의 인체 위해 여부를 틀리게 말한 보기가 아닙니다.",
      "2번은 MIG 아크의 강한 자외선이 용접점에서 떨어진 공기 중에도 오존을 생성할 수 있다는 안전 설명이므로 틀린 보기로 분류하지 않습니다.",
      "3번은 50 mA가 인체에 위험을 수반하지 않는다고 단정하지만, 이 정도 통전 전류는 근육 경직·호흡 곤란·심장 이상 위험이 있어 틀린 문장입니다.",
      "4번은 이 문항이 복원된 당시 시험은행에서 제시한 아크광 안구 염증의 응급처치 문장입니다. 현재 실제 사고 시에는 충분히 세척하고 의료진의 지시를 우선합니다.",
    ],
  },
  {
    canonicalId: "wcbt-39d3434f-93e6-43af-92af-d8fa5e7b1401",
    lessonId: "lesson-welding-safety-electrical",
    officialSource: KOSHA_ELECTRICAL_WELDING_GUIDE,
    assertionText:
      "아크 용접봉 홀더의 충전부가 노출되면 작업자가 손으로 직접 접촉하기 쉬워 감전 위험이 가장 직접적으로 커집니다.",
    answerExplanation:
      "정답은 2번 용접봉 홀더 노출부입니다. 홀더는 작업자가 계속 손에 쥐고 용접봉을 교체하는 부위이므로 절연이 손상되어 충전부가 노출되면 직접 접촉에 의한 감전 위험이 가장 큽니다.",
    solutionSteps: [
      "문제가 일반적인 설비 명칭이 아니라 작업자에게 가장 직접적인 감전 접촉점을 묻는다는 점을 확인합니다.",
      "배전판·용접기·케이블은 정상적인 외함과 절연 상태를 전제로 하고, 홀더 노출부는 손이 닿는 충전부라는 차이를 구분합니다.",
      "작업자가 손으로 쥐는 부위에서 충전부가 노출된 2번을 가장 위험한 부분으로 선택합니다.",
    ],
    keyRule:
      "용접 감전 위험은 전압원 자체보다 작업자가 직접 잡거나 닿는 홀더·케이블의 노출 충전부에서 우선 확인합니다.",
    choiceRationales: [
      "1번 배전판도 전기 위험 설비이지만 정상적으로 문이 닫히고 충전부가 차폐된 상태에서는 작업자가 계속 직접 쥐는 홀더 노출부보다 접촉 가능성이 낮습니다.",
      "2번 용접봉 홀더 노출부는 작업자가 손에 쥐는 부위의 충전부가 드러난 상태이므로 직접 접촉 감전 가능성이 가장 커 정답입니다.",
      "3번 용접기는 전원의 근원이지만 정상적인 외함과 접지를 갖춘 기기 전체를 홀더 노출부보다 더 위험한 직접 접촉점으로 보지는 않습니다.",
      "4번 케이블은 피복 손상이 있으면 위험하지만 보기에는 손상이나 도체 노출 조건이 없으므로, 노출이 명시된 홀더보다 우선하지 않습니다.",
    ],
  },
  {
    canonicalId: "wcbt-5ab4d74f-bf01-4d1b-8c95-8f31f086cf0d",
    lessonId: "lesson-welding-safety-gas",
    officialSource: KOSHA_WELDING_SAFETY_GUIDE,
    assertionText:
      "아세틸렌 용기 주변에 화염이 발생하면 먼저 적합한 소화기로 화염을 진압하고, 밸브 개방이나 무리한 용기 이동으로 가스 공급과 폭발 위험을 키우지 않습니다.",
    answerExplanation:
      "정답은 2번 소화기로 소화한다입니다. 아세틸렌 용기에 화염이 발생한 상태에서 밸브를 더 열거나 용기를 옮기면 누출과 폭발 위험이 커지므로, 우선 적합한 소화기로 화염을 진압해야 합니다.",
    solutionSteps: [
      "아세틸렌은 가연성 가스이므로 화염 확대와 용기 가열을 동시에 막아야 하는 상황임을 확인합니다.",
      "밸브 개방과 용기 이동은 가스 공급 또는 충격 위험을 높이고, 젖은 거적으로 덮는 방법은 용기 화재의 우선 조치가 아님을 구분합니다.",
      "불길을 먼저 억제하는 2번 소화기 사용을 선택하고 즉시 주변 대피와 관계 기관 신고를 병행합니다.",
    ],
    keyRule:
      "가연성 가스 용기 화재에서는 가스를 추가 방출하거나 용기를 무리하게 옮기지 말고, 적합한 소화수단으로 화염을 우선 진압합니다.",
    choiceRationales: [
      "1번 젖은 거적으로 덮는 조치는 작은 고체 가연물 화재에서 쓰는 질식소화 방식에 가깝고, 가압된 아세틸렌 용기 화재의 우선 조치로 적합하지 않습니다.",
      "2번 적합한 소화기로 화염을 먼저 진압하면 용기 가열과 화염 확대를 줄일 수 있으므로 이 시험 문항의 정답입니다.",
      "3번 불이 붙은 용기를 실외로 옮기면 이동 중 충격·전도·화염 확산으로 위험이 커질 수 있어 최초 조치로 선택하지 않습니다.",
      "4번 아세틸렌 밸브를 열면 가연성 가스 공급량이 증가해 화염과 폭발 위험을 키우므로 금지해야 할 행동입니다.",
    ],
  },
  {
    canonicalId: "wcbt-67c9f16f-e263-42bd-b3c5-e63836025fbe",
    lessonId: "lesson-welding-safety-ppe",
    officialSource: KOSHA_WELDING_SAFETY_GUIDE,
    assertionText:
      "탄산가스 아크 용접은 용접전류가 높아질수록 아크광이 강해지므로 400 A 이상에서는 보기 중 가장 높은 차광도 번호 14를 적용합니다.",
    answerExplanation:
      "정답은 4번 차광도 번호 14입니다. 탄산가스 아크 용접 전류가 400 A 이상이면 강한 자외선·가시광선·적외선으로부터 눈을 보호하기 위해 보기 중 가장 높은 차광도 번호를 선택합니다.",
    solutionSteps: [
      "공정이 탄산가스 아크 용접이고 전류 조건이 400 A 이상임을 표시합니다.",
      "용접전류가 증가하면 아크광 세기가 커져 더 높은 차광도 번호가 필요하다는 방향을 적용합니다.",
      "보기 8·10·5·14 중 가장 높은 보호 등급인 14를 선택합니다.",
    ],
    keyRule:
      "아크 용접의 차광도는 전류가 높을수록 큰 번호를 적용하며, 탄산가스 아크 용접 400 A 이상은 14를 선택합니다.",
    choiceRationales: [
      "1번 차광도 8은 400 A 이상의 강한 탄산가스 아크광을 차단하기에는 낮은 등급이므로 정답이 아닙니다.",
      "2번 차광도 10도 중간 전류 범위에서 고려할 수 있으나 400 A 이상 조건에는 보호 등급이 부족합니다.",
      "3번 차광도 5는 가스용접·절단 등 비교적 약한 광원에서 쓰는 낮은 등급으로 고전류 아크 용접 조건과 맞지 않습니다.",
      "4번 차광도 14는 보기 중 가장 높은 등급이며 400 A 이상의 강한 탄산가스 아크광 조건에 대응하므로 정답입니다.",
    ],
  },
  {
    canonicalId: "wcbt-ccf97e42-9263-4a09-acef-32df7eb9b34c",
    lessonId: "lesson-welding-safety-ventilation",
    officialSource: KOSHA_WELDING_SAFETY_GUIDE,
    assertionText:
      "이산화탄소는 공기 중 농도가 높아지면 산소를 밀어내 질식을 일으키며, 시험은행 분류에서 30% 이상은 극히 위험한 농도로 판단합니다.",
    answerExplanation:
      "정답은 2번 30% 이상입니다. CO₂는 산소를 치환하는 질식성 가스이며 농도가 매우 높아지면 짧은 시간에도 의식 소실과 생명 위험이 커집니다. 이 문항의 시험은행 기준에서 ‘극히 위험상태’는 30% 이상으로 구분합니다.",
    solutionSteps: [
      "CO₂가 독성가스라기보다 공기 중 산소를 밀어내는 질식 위험을 만든다는 점을 확인합니다.",
      "문제가 단순 주의 농도가 아니라 ‘극히 위험상태’의 농도 구간을 묻는다는 표현을 구분합니다.",
      "보기 중 시험은행의 극히 위험상태 기준인 30% 이상을 선택합니다.",
    ],
    keyRule:
      "CO₂ 농도 문제에서는 낮은 농도의 주의·작업환경 기준과 생명을 위협하는 고농도 구간을 구분하며, 이 문항의 극히 위험상태 답은 30% 이상입니다.",
    choiceRationales: [
      "1번 0.4% 이상은 정상 대기보다 높은 농도이지만 이 문항이 묻는 즉각적인 ‘극히 위험상태’ 구간으로 분류하지 않습니다.",
      "2번 30% 이상은 산소 치환과 고농도 CO₂ 영향으로 단시간에 생명을 위협할 수 있는 극히 위험한 구간이므로 정답입니다.",
      "3번 20% 이상도 매우 위험하므로 즉시 대피해야 하지만, 이 시험은행 문항이 구분한 ‘극히 위험상태’의 정답 수치는 30% 이상입니다.",
      "4번 10% 이상 역시 의식 소실 등 중대한 위험이 가능한 농도이나, 보기 간 시험 분류에서 요구한 최고 위험 구간 수치와는 다릅니다.",
    ],
  },
] as const;

const sourceById = new Map(
  rawWeldingCbtBank.records
    .filter((record) => record.correctIndex !== null)
    .map((record) => [record.canonicalId, record]),
);
const projectionById = new Map(
  WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
    entry.canonicalId,
    entry,
  ]),
);

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_10 =
  PROMOTION_SPECS.map((spec) => {
    const source = sourceById.get(spec.canonicalId);
    const projection = projectionById.get(spec.canonicalId);
    if (!source || source.correctIndex === null || !projection) {
      throw new Error(
        `SUBJECT_2_GPT_HOLD_BATCH_10_SOURCE_MISSING:${spec.canonicalId}`,
      );
    }
    if (
      source.choices.length !== 4 ||
      spec.choiceRationales.length !== source.choices.length ||
      projection.primaryLeafLessonId !== spec.lessonId
    ) {
      throw new Error(
        `SUBJECT_2_GPT_HOLD_BATCH_10_CONTRACT_MISMATCH:${spec.canonicalId}`,
      );
    }

    return {
      canonicalId: spec.canonicalId,
      contentDigest: projection.contentDigest,
      authoringDisposition: "publish_candidate" as const,
      reviewStatus: "approved" as const,
      assessmentKind: "safety" as const,
      primaryLeafLessonId: spec.lessonId,
      conceptBinding: {
        lessonId: spec.lessonId,
        lessonBlockId: "principle",
        assertionText: spec.assertionText,
        evidenceRefs: [
          { kind: "lesson_block" as const, ref: `${spec.lessonId}#principle` },
          { kind: "source_question" as const, ref: spec.canonicalId },
          { kind: "official_source" as const, ref: spec.officialSource },
        ],
      },
      answerExplanation: spec.answerExplanation,
      solutionSteps: [...spec.solutionSteps],
      keyRule: spec.keyRule,
      choiceFeedback: spec.choiceRationales.map((rationale, choiceIndex) => {
        const correct = choiceIndex === source.correctIndex;
        return {
          choiceIndex,
          relation: correct ? ("supports" as const) : ("refuted_by" as const),
          rationale,
          plausibleReason: correct
            ? `${source.choices[choiceIndex]}은 문제의 조건과 안전 판단 기준을 직접 충족하므로 정답으로 선택할 수 있습니다.`
            : `${source.choices[choiceIndex]}은 같은 안전 분야의 용어와 수치를 사용해 정답처럼 보이지만, 지문의 직접 조건과는 맞지 않습니다.`,
          incorrectPoint: correct
            ? null
            : `${source.choices[choiceIndex]}은 이 문항에서 요구한 안전 기준과 맞지 않으며, 정답인 ${source.choices[source.correctIndex]}와 구분해야 합니다.`,
          keyRule: `${source.choices[choiceIndex]}을 판단할 때는 다음 원칙을 적용합니다. ${spec.keyRule}`,
          differenceFromCorrect: correct
            ? null
            : `정답은 ${source.choices[source.correctIndex]}이며, 이 보기는 문제에서 요구한 직접 기준을 충족하지 않습니다.`,
        };
      }),
      essentialRank: null,
      essentialRationale: null,
      holdReasons: [],
      author: AUTHOR,
      authoredAt: REVIEWED_AT,
      reviewer: AUTHOR,
      reviewedAt: REVIEWED_AT,
    };
  });
