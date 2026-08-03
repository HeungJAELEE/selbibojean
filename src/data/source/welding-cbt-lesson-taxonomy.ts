export const WELDING_CBT_TAXONOMY_VERSION = "welding-cbt-leaf-v2";

export const WELDING_CBT_AGGREGATE_LESSON_IDS = [
  "lesson-welding-cbt-foundation",
  "lesson-welding-cbt-arc",
  "lesson-welding-cbt-gas",
  "lesson-welding-cbt-defects",
  "lesson-welding-cbt-safety",
] as const;

export type WeldingCbtAggregateTopicKey =
  | "foundation"
  | "arc"
  | "gas"
  | "defects"
  | "safety";

export const WELDING_CBT_LEAF_TARGETS = {
  "lesson-welding-foundation-basics": {
    title: "용접 분류·이음·자세",
    groupId: "s2-g01",
  },
  "lesson-welding-foundation-electrodes": {
    title: "용접봉·피복제·용가재",
    groupId: "s2-g01",
  },
  "lesson-welding-foundation-power-heat": {
    title: "용접 전원·극성·입열",
    groupId: "s2-g01",
  },
  "lesson-welding-foundation-deformation": {
    title: "용접 변형·잔류응력",
    groupId: "s2-g01",
  },
  "lesson-welding-foundation-brazing-pressure": {
    title: "납땜·압접의 원리",
    groupId: "s2-g01",
  },
  "lesson-welding-foundation-joints-symbols": {
    title: "용접 이음·홈·기호",
    groupId: "s2-g01",
  },
  "lesson-welding-process-smaw": {
    title: "피복아크용접(SMAW)",
    groupId: "s2-g02",
  },
  "lesson-welding-process-gtaw": {
    title: "TIG용접(GTAW)",
    groupId: "s2-g02",
  },
  "lesson-welding-process-gmaw": {
    title: "MIG·MAG·CO₂용접(GMAW)",
    groupId: "s2-g02",
  },
  "lesson-welding-process-fcaw": {
    title: "플럭스코어드아크용접(FCAW)",
    groupId: "s2-g02",
  },
  "lesson-welding-process-saw": {
    title: "서브머지드아크용접(SAW)",
    groupId: "s2-g02",
  },
  "lesson-welding-process-shielding": {
    title: "아크용접 차폐 조건",
    groupId: "s2-g02",
  },
  "lesson-welding-gas-equipment-flame": {
    title: "가스용접 장치·불꽃·조건",
    groupId: "s2-g03",
  },
  "lesson-welding-gas-cutting": {
    title: "가스절단의 원리",
    groupId: "s2-g03",
  },
  "lesson-welding-resistance": {
    title: "저항용접 공정·종류",
    groupId: "s2-g03",
  },
  "lesson-welding-special-processes": {
    title: "특수용접 공정",
    groupId: "s2-g03",
  },
  "lesson-welding-defect-undercut": {
    title: "언더컷 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-overlap": {
    title: "오버랩 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-porosity": {
    title: "기공·피트 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-slag": {
    title: "슬래그 혼입 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-penetration-fusion": {
    title: "용입 불량·융합 불량",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-spatter": {
    title: "스패터 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-burn-through": {
    title: "용락 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-crack": {
    title: "용접 균열·은점",
    groupId: "s2-g04",
  },
  "lesson-welding-defect-arc-strike": {
    title: "아크 스트라이크 결함",
    groupId: "s2-g04",
  },
  "lesson-welding-inspection-ndt": {
    title: "용접검사·비파괴검사",
    groupId: "s2-g04",
  },
  "lesson-1ctkzud": {
    title: "안전보건표지",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-electrical": {
    title: "감전·전기설비 안전",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-ppe": {
    title: "용접 보호구·유해광선",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-fire": {
    title: "화재·폭발·화기작업 안전",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-gas": {
    title: "가스용기·조정기·역화 안전",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-ventilation": {
    title: "용접흄·환기·밀폐공간",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-machinery": {
    title: "기계·연삭·회전체 안전",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-lifting-fall": {
    title: "양중·운반·추락 안전",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-chemical": {
    title: "유해물질·MSDS·보건관리",
    groupId: "s2-g05",
  },
  "lesson-welding-safety-management": {
    title: "안전관리·재해예방 원칙",
    groupId: "s2-g05",
  },
} as const;

export type WeldingCbtLeafLessonId = keyof typeof WELDING_CBT_LEAF_TARGETS;

export type WeldingCbtProjectionCandidate = {
  aggregateTopicKey: WeldingCbtAggregateTopicKey;
  stem: string;
  choices: readonly string[];
};

type ProjectionRule = {
  target: WeldingCbtLeafLessonId;
  pattern: RegExp;
};

const FOUNDATION_RULES: readonly ProjectionRule[] = [
  {
    target: "lesson-welding-foundation-basics",
    pattern:
      /용접의 분류|융접에 속|압력을 가해 접합|용접.?자세|원주.?용접|자동.?용접.?기구/u,
  },
  {
    target: "lesson-welding-foundation-deformation",
    pattern:
      /변형|잔류응력|응력.?제거|역변형|후퇴법|대칭법|스킵법|수축|피닝|구속도/u,
  },
  {
    target: "lesson-welding-foundation-brazing-pressure",
    pattern:
      /납땜|브레이징|솔더링|경납|연납|압접|마찰용접|냉간압접|확산접합/u,
  },
  {
    target: "lesson-welding-foundation-electrodes",
    pattern:
      /용접봉|피복제|용가재|용가봉|심선|저수소계|일미나이트계|셀룰로오스계|철분계|건조로/u,
  },
  {
    target: "lesson-welding-foundation-power-heat",
    pattern:
      /용접기|정류기|교류|직류|정극성|역극성|극성|아크.?전압|아크.?길이|아크.?쏠림|자기.?쏠림|입열|열영향부|용접전류|무부하.?전압|사용률/u,
  },
  {
    target: "lesson-welding-foundation-joints-symbols",
    pattern:
      /용접.?기호|필릿|각장|목두께|개선|홈.?용접|맞대기|겹치기|모서리.?이음|T.?이음|현장.?용접|온둘레/u,
  },
];

const ARC_RULES: readonly ProjectionRule[] = [
  {
    target: "lesson-welding-process-gtaw",
    pattern: /TIG|GTAW|텅스텐|불활성.?가스.?텅스텐/u,
  },
  {
    target: "lesson-welding-process-fcaw",
    pattern: /FCAW|플럭스.?코어|플럭스코어/u,
  },
  {
    target: "lesson-welding-process-saw",
    pattern: /SAW|서브머지드|잠호|입상.?플럭스/u,
  },
  {
    target: "lesson-welding-process-gmaw",
    pattern: /MIG|MAG|GMAW|CO₂.?용접|탄산가스.?용접|솔리드.?와이어/u,
  },
  {
    target: "lesson-welding-process-smaw",
    pattern: /피복.?아크|피복금속|수동.?금속.?아크|SMAW|용접봉.?홀더/u,
  },
  {
    target: "lesson-welding-process-shielding",
    pattern: /보호가스|차폐|가스.?유량|노즐|아르곤|헬륨|플럭스/u,
  },
];

const GAS_RULES: readonly ProjectionRule[] = [
  {
    target: "lesson-welding-resistance",
    pattern:
      /저항.?용접|점.?용접|심.?용접|프로젝션.?용접|플래시.?버트|업셋.?용접|전극.?가압력/u,
  },
  {
    target: "lesson-welding-gas-cutting",
    pattern:
      /가스.?절단|산소.?절단|절단.?산소|예열.?불꽃|드래그|절단.?속도|절단.?팁/u,
  },
  {
    target: "lesson-welding-gas-equipment-flame",
    pattern:
      /가스.?용접|아세틸렌|중성.?불꽃|산화.?불꽃|탄화.?불꽃|산소.?불꽃|토치|팁.?번호|발생기/u,
  },
  {
    target: "lesson-welding-special-processes",
    pattern:
      /테르밋|전자빔|레이저|플라즈마|일렉트로.?슬래그|초음파.?용접|폭발.?용접|고주파.?용접|원자수소|특수.?용접/u,
  },
];

const DEFECT_RULES: readonly ProjectionRule[] = [
  {
    target: "lesson-welding-defect-undercut",
    pattern: /언더컷|용접부.?가장자리.?홈/u,
  },
  {
    target: "lesson-welding-defect-overlap",
    pattern: /오버랩|겹쳐.?덮/u,
  },
  {
    target: "lesson-welding-defect-porosity",
    pattern: /기공|피트|블로.?홀|가스.?포켓/u,
  },
  {
    target: "lesson-welding-defect-slag",
    pattern: /슬래그.?혼입|슬래그.?개재/u,
  },
  {
    target: "lesson-welding-defect-penetration-fusion",
    pattern: /용입.?불량|용입.?부족|융합.?불량|미용융|루트.?간격/u,
  },
  {
    target: "lesson-welding-defect-spatter",
    pattern: /스패터|비산/u,
  },
  {
    target: "lesson-welding-defect-burn-through",
    pattern: /용락|번스루|구멍.?결함/u,
  },
  {
    target: "lesson-welding-defect-crack",
    pattern: /균열|은점|피시아이|크레이터.?크랙|고온.?균열|저온.?균열/u,
  },
  {
    target: "lesson-welding-defect-arc-strike",
    pattern: /아크.?스트라이크/u,
  },
  {
    target: "lesson-welding-inspection-ndt",
    pattern:
      /비파괴|탐상|방사선.?투과|초음파.?탐상|자분.?탐상|침투.?탐상|와전류|육안.?검사|검사법|RT|UT|MT|PT/u,
  },
];

const SAFETY_RULES: readonly ProjectionRule[] = [
  {
    target: "lesson-1ctkzud",
    pattern:
      /안전.?보건.?표지|금지.?표지|경고.?표지|지시.?표지|안내.?표지|출입.?금지|보호구.?착용.?표지/u,
  },
  {
    target: "lesson-welding-safety-electrical",
    pattern:
      /감전|전격|전기.?재해|누전|접지|절연|전격.?방지|무부하.?전압|충전부|전선|케이블|차단기|퓨즈|전기.?설비|인체.*전류|전류.*인체|몸.*전류|심장.?마비/u,
  },
  {
    target: "lesson-welding-safety-ppe",
    pattern:
      /보호구|보호면|차광|유해.?광선|자외선|적외선|보호.?안경|안전모|안전화|귀마개|방진.?마스크|방독.?마스크|가죽.?장갑/u,
  },
  {
    target: "lesson-welding-safety-fire",
    pattern:
      /화재|폭발|소화|연소|발화|인화|화기.?작업|불티|비산|화재.?감시|가연물/u,
  },
  {
    target: "lesson-welding-safety-gas",
    pattern:
      /가스.?용기|산소.?용기|아세틸렌.?용기|압력.?조정기|역화|역류|수봉식|안전기|용기.?취급|가스.?누설|호스.?연결|가스.?도관|아세틸렌.*취급|토치.*취급|가스.*용기.*색상/u,
  },
  {
    target: "lesson-welding-safety-ventilation",
    pattern:
      /용접.?흄|환기|국소.?배기|밀폐.?공간|산소.?결핍|중독|유해.?가스|작업.?환경|공기.?정화/u,
  },
  {
    target: "lesson-welding-safety-machinery",
    pattern:
      /연삭|숫돌|회전체|기계.?방호|방호.?장치|덮개|프레스|전단기|롤러|원형.?톱|공작.?기계|비상.?정지|기계.?안전/u,
  },
  {
    target: "lesson-welding-safety-lifting-fall",
    pattern:
      /추락|낙하|비계|사다리|고소.?작업|양중|인양|크레인|와이어.?로프|운반|중량물|달기/u,
  },
  {
    target: "lesson-welding-safety-chemical",
    pattern:
      /MSDS|물질.?안전.?보건.?자료|유해.?물질|화학.?물질|중금속|납|카드뮴|크롬|망간|분진|작업.?환경.?측정|특수.?건강.?진단/u,
  },
  {
    target: "lesson-welding-safety-management",
    pattern:
      /재해|사고|위험성.?평가|안전.?관리|안전.?교육|작업.?허가|정리.?정돈|점검|안전.?수칙|산업.?안전|위험.?예방|보건.?관리/u,
  },
];

const RULES: Record<
  WeldingCbtAggregateTopicKey,
  readonly ProjectionRule[]
> = {
  foundation: FOUNDATION_RULES,
  arc: ARC_RULES,
  gas: GAS_RULES,
  defects: DEFECT_RULES,
  safety: SAFETY_RULES,
};

const GLOBAL_CORRECTION_RULES: readonly ProjectionRule[] = [
  {
    target: "lesson-1ctkzud",
    pattern:
      /안전.*색채|안전색|방사능.?표지|황적|특정행위의 지시|사실의 고지/u,
  },
  {
    target: "lesson-welding-safety-electrical",
    pattern: /인체.*전류|전류.*인체|심장.?마비|1차.?측.*퓨즈|안전.?스위치/u,
  },
  {
    target: "lesson-welding-safety-ventilation",
    pattern:
      /CO\s*2.*(?:인체|위험|농도)|탄산가스.*(?:인체|위험|농도)|밀폐된 장소|흄.*(?:인체|발생)/u,
  },
  {
    target: "lesson-welding-safety-gas",
    pattern:
      /아세틸렌.*취급|가스.?도관|호스.*주의|토치.*취급|가스.?용접.*안전사항/u,
  },
  {
    target: "lesson-welding-gas-equipment-flame",
    pattern:
      /아세틸렌.*(?:용해|용기.*무게|가스의 양|몇 리터)|산소병.*(?:내용적|내 용적|몇 시간)|가스.*용기.*색깔|수소가스.*도색|아르곤.*용기|FP,\s*TP|충전.*기압|공랭식.*토치/u,
  },
  {
    target: "lesson-welding-process-gtaw",
    pattern: /TIG.*토치/u,
  },
  {
    target: "lesson-welding-special-processes",
    pattern: /플라스마.*수소/u,
  },
  {
    target: "lesson-welding-inspection-ndt",
    pattern:
      /연성.*시험|굽힘.?시험|인장.?시험|충격.?시험|경도.?시험|금속.?시험|파괴.?시험/u,
  },
  {
    target: "lesson-welding-foundation-joints-symbols",
    pattern:
      /용접기호|용접.?기호|홈.?이음|이면.?비드|뒷면.?가우징|받침재|백킹/u,
  },
  {
    target: "lesson-welding-foundation-brazing-pressure",
    pattern: /마찰용접|냉간.?압접/u,
  },
  {
    target: "lesson-welding-foundation-power-heat",
    pattern: /아크의 특성.*전류|전류가 커지면.*전압/u,
  },
];

const FALLBACK_TARGETS: Record<
  WeldingCbtAggregateTopicKey,
  WeldingCbtLeafLessonId
> = {
  foundation: "lesson-welding-foundation-basics",
  arc: "lesson-welding-process-shielding",
  gas: "lesson-welding-special-processes",
  defects: "lesson-welding-inspection-ndt",
  safety: "lesson-welding-safety-management",
};

export function classifyWeldingCbtProjectionCandidate(
  candidate: WeldingCbtProjectionCandidate,
): {
  targetLessonId: WeldingCbtLeafLessonId;
  matchedBy: "rule" | "review-fallback";
} {
  const stemMatched =
    GLOBAL_CORRECTION_RULES.find((rule) => rule.pattern.test(candidate.stem))
    ?? RULES[candidate.aggregateTopicKey].find((rule) =>
      rule.pattern.test(candidate.stem),
    );
  const searchable = [candidate.stem, ...candidate.choices].join("\n");
  const matched =
    stemMatched
    ?? GLOBAL_CORRECTION_RULES.find((rule) => rule.pattern.test(searchable))
    ?? RULES[candidate.aggregateTopicKey].find((rule) =>
      rule.pattern.test(searchable),
    );
  return matched
    ? { targetLessonId: matched.target, matchedBy: "rule" }
    : {
        targetLessonId: FALLBACK_TARGETS[candidate.aggregateTopicKey],
        matchedBy: "review-fallback",
      };
}
