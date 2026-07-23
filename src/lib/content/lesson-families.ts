import { getGroupGuide } from "@/lib/content/group-guides";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";
import type { GeneratedContent, Lesson, Question } from "@/lib/domain/types";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";

export type FamilyComparison = {
  term: string;
  input: string;
  role: string;
  effect: string;
  caution: string;
};

export type FamilyFieldCase = {
  issue: string;
  focus: string;
  action: string;
  caution: string;
};

export type LessonFamily = {
  id: string;
  groupId: string;
  label: string;
  lessons: Lesson[];
  relatedTerms: string[];
  scope: string;
  mechanism: string;
  comparison: FamilyComparison[];
  fieldCases: FamilyFieldCase[];
  decisionSteps: string[];
  trapQuestions: Question[];
};

type FamilyOverride = {
  relatedTerms: string[];
  scope: string;
  mechanism: string;
  lessonOrder: string[];
  comparison: FamilyComparison[];
  fieldCases: FamilyFieldCase[];
  trapQuestionIds: string[];
};

const FAMILY_OVERRIDES: Record<string, FamilyOverride> = {
  "s1-g02:accumulator": {
    relatedTerms: [
      "어큐뮬레이터",
      "봉입가스",
      "건조 질소",
      "맥동·서지압",
      "비상동력",
      "인라인형",
      "체크밸브",
    ],
    scope:
      "어큐뮬레이터는 압축 가능한 가스와 거의 압축되지 않는 작동유의 성질 차이를 이용해 유압에너지를 저장한다. 시험에서는 기능, 충전가스, 충격원과의 설치 위치, 인라인형의 용도를 서로 바꾸어 제시하므로 한 계통으로 묶어 판단해야 한다.",
    mechanism:
      "계통 압력이 봉입가스 압력보다 높아지면 작동유가 들어가 가스를 압축하고 에너지가 저장된다. 계통 압력이 낮아지면 압축된 가스가 팽창하며 작동유를 회로로 돌려보낸다. 이 과정으로 압력맥동과 충격을 완화하고, 누설을 보상하거나 비상시에 짧은 시간 동력을 공급한다. 실제 봉입압력은 용도와 제조사 절차에 따라 정하며 학습용 상대 비교값을 현장 설정값으로 사용하지 않는다.",
    lessonOrder: ["어큐뮬레이터 기능", "어큐뮬레이터 안전", "인라인 어큐뮬레이터"],
    comparison: [
      {
        term: "기능·용도",
        input: "에너지 저장, 맥동·서지압 흡수, 누설 보상, 비상동력",
        role: "가스를 압축해 받은 유압에너지를 필요할 때 다시 회로로 내보낸다.",
        effect: "기능 혼동형: ‘회로압 증대’를 어큐뮬레이터의 기능처럼 제시해 증압기와 혼동하게 한다.",
        caution: "‘회로압 증대’는 증압기의 역할이다. 어큐뮬레이터 자체가 설정압력보다 높은 압력을 만들어 내는 장치는 아니다.",
      },
      {
        term: "충전가스",
        input: "유압유와 반응하지 않는 제조사 지정 건조 질소",
        role: "압축·팽창하면서 에너지를 저장하되 작동유와 안전하게 분리되어야 한다.",
        effect: "안전조건 판별형: 산소와 건조 질소의 역할을 바꾸어 충전가스의 안전 조건을 묻는다.",
        caution: "산소와 압축공기는 사용하지 않는다. ‘불활성가스’라는 표현만 보고 임의 가스를 선택하지 말고 제조사 지정 조건을 확인한다.",
      },
      {
        term: "충격 흡수 위치",
        input: "충격파가 생기는 밸브·배관의 유효한 가까운 위치",
        role: "충격파가 배관 전체로 퍼지기 전에 압력 변동을 받아들인다.",
        effect: "위치 반전형: ‘충격발생점에서 가능한 멀리’처럼 설치 위치를 반대로 제시한다.",
        caution: "고압 용기에 용접·천공 등 임의가공을 하지 않고, 펌프 측 역류를 막기 위한 체크밸브를 회로 조건에 맞게 검토한다.",
      },
      {
        term: "인라인형",
        input: "배관에 직접 연결되는 고무튜브형 구조",
        role: "배관을 따라 전달되는 압력맥동과 충격을 가까운 위치에서 흡수한다.",
        effect: "용도 구분형: 인라인형의 맥동 흡수 기능을 에너지 저장·온도 유지 기능과 섞어 제시한다.",
        caution: "대용량 에너지 저장만을 위한 장치나 온도 유지 장치로 바꾸어 제시하는 보기에 주의한다.",
      },
    ],
    fieldCases: [
      {
        issue: "밸브가 급폐될 때 배관이 흔들리고 압력계 지침이 순간적으로 크게 튄다.",
        focus: "충격 흡수용 어큐뮬레이터의 위치와 봉입 상태",
        action: "충격발생점과 어큐뮬레이터 사이의 거리·분기·차단밸브 상태를 확인하고 제조사 절차에 따라 봉입 상태를 점검한다.",
        caution: "충격원에서 멀리 옮기거나 봉입압력을 임의로 조정하면 흡수 효과가 떨어질 수 있다.",
      },
      {
        issue: "펌프가 잠시 정지하면 회로 압력이 곧바로 떨어지고 액추에이터가 유지되지 않는다.",
        focus: "저장에너지, 누설, 체크밸브",
        action: "어큐뮬레이터의 저장 기능과 함께 외부·내부 누설, 역류 경로, 차단밸브 상태를 순서대로 확인한다.",
        caution: "어큐뮬레이터만 교체하기 전에 회로의 누설과 역류 원인을 분리한다.",
      },
      {
        issue: "정비를 위해 압력계를 0으로 만들었지만 배관 분리 작업이 남아 있다.",
        focus: "잔류 저장에너지",
        action: "펌프를 정지하고 회로를 격리한 뒤 승인된 절차로 유압과 가스 측 저장에너지가 해제됐는지 확인한다.",
        caution: "압력계 0만으로 무압을 단정하지 않는다. 고압 용기 분해·충전은 전용 장비와 제조사 작업절차를 따른다.",
      },
    ],
    trapQuestionIds: ["U-253", "U-334", "U-490", "U-554", "U-620"],
  },
  "s1-g11:action": {
    relatedTerms: [
      "P·비례동작",
      "I·적분동작",
      "D·미분동작",
      "PI·PID 제어",
      "제어편차 e(t)",
      "비례게인 Kp·비례대 PB",
    ],
    scope:
      "P·I·D는 서로 떨어진 세 개의 암기 항목이 아니라, 제어편차를 어떤 방식으로 조작량에 반영할지 정하는 한 묶음이다. P는 현재 편차, I는 지금까지 누적된 편차, D는 편차가 변하는 속도를 사용한다.",
    mechanism:
      "제어편차를 $e(t)=r(t)-y(t)$라고 하면 PID 제어기의 조작량은 $u(t)=K_p e(t)+K_i\\int e(t)dt+K_d\\frac{de(t)}{dt}$로 표현할 수 있다. 실제 조정에서는 응답속도·정상상태 편차·오버슈트·진동·측정 잡음을 함께 보며 세 항의 비중을 맞춘다.",
    lessonOrder: ["제어동작", "적분제어", "미분제어", "제어편차", "비례게인·비례대"],
    comparison: [
      {
        term: "P 제어",
        input: "현재 편차 e(t)",
        role: "지금 벌어진 오차에 즉시 비례해 조작량을 만든다.",
        effect: "응답을 빠르게 만들고 기본적인 추종 능력을 만든다.",
        caution: "P만으로는 정상상태 편차가 남을 수 있고, 게인이 지나치면 진동·오버슈트가 커진다.",
      },
      {
        term: "I 제어",
        input: "편차의 시간 누적",
        role: "작게 남아 있는 편차도 계속 누적해 조작량을 보탠다.",
        effect: "P 제어 뒤에 남는 정상상태 편차를 제거한다.",
        caution: "적분이 지나치면 응답이 느려지고 오버슈트·적분 와인드업이 커질 수 있다.",
      },
      {
        term: "D 제어",
        input: "편차의 변화율 de(t)/dt",
        role: "오차가 빠르게 변하는 방향을 미리 보고 제동 성분을 만든다.",
        effect: "급격한 변화와 오버슈트를 줄이고 감쇠·안정성을 보완한다.",
        caution: "측정 잡음을 크게 증폭할 수 있어 필터와 함께 쓰며, 보통 D 단독보다 PD·PID로 사용한다.",
      },
      {
        term: "PI·PID",
        input: "현재값+누적값(+변화율)",
        role: "P를 기본으로 I와 D의 장점을 필요한 만큼 결합한다.",
        effect: "빠른 응답, 편차 제거, 진동 억제 사이의 균형을 맞춘다.",
        caution: "모든 항을 크게 하면 좋아지는 것이 아니며 공정 지연·센서 잡음·액추에이터 한계를 반영해 조정한다.",
      },
    ],
    fieldCases: [
      {
        issue: "설정값을 바꿨는데 현재값이 너무 느리게 따라온다.",
        focus: "P 제어",
        action: "현재 편차에 대한 비례 응답을 확인하고, 진동이 생기지 않는 범위에서 비례게인을 조정한다.",
        caution: "게인을 무조건 높이지 말고 밸브 포화·공정 지연·오버슈트를 함께 본다.",
      },
      {
        issue: "응답은 안정됐지만 목표값과 실제값 사이에 작은 편차가 계속 남는다.",
        focus: "I 제어",
        action: "남은 편차를 누적해 없애도록 적분동작을 보강하고 정상상태 편차의 감소 추세를 확인한다.",
        caution: "액추에이터 포화 중 적분값이 계속 쌓이는 와인드업과 긴 정착시간을 확인한다.",
      },
      {
        issue: "부하가 급변할 때 오버슈트와 진동이 커지고 목표값을 여러 번 넘나든다.",
        focus: "D 제어",
        action: "편차 변화율에 대한 제동 성분을 보강해 급격한 움직임과 오버슈트를 줄인다.",
        caution: "센서 신호에 고주파 잡음이 많으면 D가 잡음까지 증폭하므로 필터·샘플링 상태를 먼저 점검한다.",
      },
    ],
    trapQuestionIds: ["U-030", "U-683", "U-556"],
  },
  "s2-g01:classification": {
    relatedTerms: [
      "융접",
      "압접",
      "납땜",
      "모재 용융",
      "가압력",
      "용가재",
      "열영향부",
      "잔류응력",
    ],
    scope:
      "용접법은 장비 이름보다 모재가 녹는지, 압력이 주된 결합 수단인지, 낮은 융점의 용가재만 녹는지를 먼저 보아야 한다. 분류를 마친 뒤에는 열변형·잔류응력·보호가스·전류와 가압장치 같은 공정별 품질 조건을 확인한다.",
    mechanism:
      "융접은 접합부의 모재를 녹여 응고시키고, 압접은 접촉부에 열과 압력을 가해 결합시키며, 납땜은 모재를 녹이지 않고 용가재의 젖음과 모세관 작용을 이용한다. 따라서 ‘전기를 쓴다’, ‘열이 발생한다’ 같은 공통점만으로 분류하면 저항용접처럼 열과 압력을 함께 쓰는 공정을 틀리기 쉽다.",
    lessonOrder: ["용접 분류", "용접 특징"],
    comparison: [
      {
        term: "융접·압접 구분",
        input: "모재 용융과 가압력 중 무엇이 결합의 주된 수단인가",
        role: "TIG·피복아크·서브머지드아크는 융접, 저항용접은 접촉저항열과 가압을 쓰는 압접으로 구분한다.",
        effect: "분류 함정형: 저항용접을 아크용접과 함께 제시해 열원의 공통점만 보고 융접으로 고르게 한다.",
        caution: "전기를 사용하고 접합부가 가열된다는 이유만으로 저항용접을 융접으로 분류하지 않는다.",
      },
      {
        term: "일반 용접 특징",
        input: "국부 가열과 냉각이 재료·형상·품질에 미치는 영향",
        role: "열변형, 수축, 잔류응력, 조직변화와 작업자 기량의 영향을 함께 본다.",
        effect: "부정형 판별: ‘저온취성 우려가 없다’처럼 실제 용접의 열영향을 부정한 보기를 찾게 한다.",
        caution: "용접은 이음 효율과 기밀성이 좋을 수 있지만 열영향에 따른 취성·변형 위험까지 사라지는 것은 아니다.",
      },
      {
        term: "CO₂ 아크용접 개요",
        input: "보호가스, 전류밀도, 용입·속도, 옥외 바람",
        role: "CO₂ 보호가스로 대기를 차단하는 GMAW 계열의 개요이며, 공정별 상세 비교는 아크용접 공정 레슨에서 다룬다.",
        effect: "조건 누락형: 보호가스를 사용하면서도 바람의 영향과 방풍 조건은 없다고 제시한다.",
        caution: "바람이 보호가스를 흩뜨리면 기공과 산화 위험이 커지므로 옥외 작업에서는 방풍을 검토한다.",
      },
      {
        term: "저항용접",
        input: "접촉저항열, 대전류, 전극 가압력",
        role: "겹친 모재 사이에 순간적으로 대전류를 흘리고 압력을 가해 접합한다.",
        effect: "장치 특성형: 자동화 장점과 대전류·가압장치가 필요한 설비 특성을 함께 구분하게 한다.",
        caution: "반드시 용가재를 쓰는 공정으로 보거나 작은 전류를 사용하는 수동 공정으로 바꾸어 제시하는 보기에 주의한다.",
      },
    ],
    fieldCases: [
      {
        issue: "공정명이 생소해 융접인지 압접인지 바로 판단하기 어렵다.",
        focus: "모재 용융과 가압력",
        action: "열원의 종류보다 모재가 녹아 응고하는지, 전극·롤러·마찰력으로 가압하는지를 먼저 확인한다.",
        caution: "‘아크’, ‘가스’, ‘전기’처럼 장비나 에너지원 이름만으로 분류하지 않는다.",
      },
      {
        issue: "CO₂ 용접부에서 기공이 늘고 아크 주변 보호 상태가 불안정하다.",
        focus: "보호가스 차폐",
        action: "가스 유량뿐 아니라 바람, 노즐 오염·거리, 호스 누설과 모재 표면 오염을 함께 확인한다.",
        caution: "유량만 과도하게 높이면 난류가 생겨 오히려 외기를 끌어들일 수 있으므로 승인된 조건을 따른다.",
      },
      {
        issue: "저항점용접의 너깃 크기와 강도가 위치마다 달라진다.",
        focus: "전류·통전시간·가압력·전극 상태",
        action: "전극 팁 마모와 정렬, 접촉면 오염, 전류와 통전시간, 가압력을 작업표준과 대조한다.",
        caution: "전류만 높이면 표면 날림과 전극 손상이 커질 수 있어 세 조건을 함께 관리한다.",
      },
    ],
    trapQuestionIds: ["U-081", "U-364", "U-453", "U-520"],
  },
  "s2-g02:process": {
    relatedTerms: [
      "피복아크·SMAW",
      "TIG·GTAW",
      "MIG·MAG·CO₂·GMAW",
      "플럭스코어드·FCAW",
      "서브머지드·SAW",
      "소모성·비소모성 전극",
      "보호가스·플럭스",
    ],
    scope:
      "아크용접의 종류는 공정 이름만 외우기보다 전극이 소모되는지, 와이어가 연속 송급되는지, 보호가스와 플럭스를 어디에서 어떻게 사용하는지로 구분해야 한다. 피복아크·TIG·GMAW·FCAW·SAW는 모두 아크열을 사용하지만 전극·차폐·생산성·자세와 적용설비가 서로 다르다. CO₂용접은 GMAW의 MAG 계열로 통합해 설명하고, 기존 용접 기초 레슨은 공정 개요와 출제 이력을 보존한다.",
    mechanism:
      "피복아크는 피복된 봉 전극, TIG는 비소모성 텅스텐 전극, GMAW는 연속 솔리드와이어, FCAW는 속에 플럭스가 든 관상 와이어, SAW는 입상 플럭스 아래의 연속 와이어를 사용한다. 따라서 ‘가스를 쓴다’, ‘플럭스를 쓴다’, ‘와이어를 쓴다’ 같은 한 단서만 보지 말고 전극형식과 차폐방식을 한 쌍으로 확인한다.",
    lessonOrder: [
      "피복아크용접(SMAW)",
      "TIG용접(GTAW)",
      "MIG·MAG·CO₂용접(GMAW)",
      "플럭스코어드아크용접(FCAW)",
      "서브머지드아크용접(SAW)",
    ],
    comparison: [
      {
        term: "피복아크·SMAW",
        input: "피복된 짧은 소모성 봉 전극",
        role: "전극 심선이 용가재가 되고 피복제가 보호가스와 슬래그를 만든다.",
        effect: "현장 식별형: 장비가 단순하고 이동·보수에 유리하지만 봉 교체와 슬래그 제거가 필요하다.",
        caution: "비소모성 전극 또는 연속 송급 와이어로 바꾸어 제시한 보기에 주의한다.",
      },
      {
        term: "TIG·GTAW",
        input: "비소모성 텅스텐 전극+불활성가스",
        role: "전극은 아크 열원 역할을 하며 용가재가 필요하면 별도 용가봉을 넣는다.",
        effect: "전극 구분형: 얇은 판·비철금속·정밀용접의 청정성과 낮은 용착속도를 함께 묻는다.",
        caution: "‘비소모성’은 용가재를 절대 사용하지 않는다는 뜻이 아니다.",
      },
      {
        term: "MIG·MAG·CO₂·GMAW",
        input: "이 레슨 범위의 연속 소모성 솔리드와이어+보호가스",
        role: "MIG는 불활성가스, MAG·CO₂는 활성가스 또는 활성 성분이 포함된 혼합가스를 사용한다.",
        effect: "보호가스 구분형: 연속 작업·자동화 장점과 바람·노즐·송급 불량을 함께 묻는다.",
        caution: "MIG와 MAG를 전극 소모 여부로 나누지 않는다. 둘 다 소모성 와이어를 쓴다.",
      },
      {
        term: "FCAW",
        input: "플럭스가 든 연속 관상 와이어",
        role: "와이어 내부 플럭스가 차폐·탈산·합금·슬래그 형성에 관여한다.",
        effect: "구조 구분형: 가스차폐형과 자체보호형, 높은 용착량과 슬래그·흄 관리를 묻는다.",
        caution: "SAW는 플럭스가 와이어 속이 아니라 아크 위의 입상층으로 공급된다.",
      },
      {
        term: "서브머지드·SAW",
        input: "연속 와이어+아크를 덮는 입상 플럭스",
        role: "플럭스 아래에 아크를 잠기게 해 고전류·고용착의 기계화·자동화 용접을 한다.",
        effect: "적용 구분형: 긴 직선·원주 이음과 두꺼운 판에는 유리하고 복잡한 자세에는 불리하다.",
        caution: "플럭스가 용융지 위에 머물러야 하므로 모든 자세와 짧은 복잡 이음에 적합하다고 보지 않는다.",
      },
    ],
    fieldCases: [
      {
        issue: "현장 보수에서 장비 이동이 잦고 짧은 구간을 여러 자세로 용접해야 한다.",
        focus: "피복아크의 이동성·자세 대응",
        action: "모재와 자세에 맞는 용접봉·전류·극성을 정하고 층간 슬래그를 제거한다.",
        caution: "생산성만 높이려고 연속와이어 공정을 선택하기 전에 보호가스와 송급장비 설치 가능성을 확인한다.",
      },
      {
        issue: "스테인리스 얇은 배관의 루트패스에서 청정도와 용융지 제어가 중요하다.",
        focus: "TIG의 비소모성 전극과 불활성가스 차폐",
        action: "텅스텐 선단·가스차폐·퍼지와 모재 청정도를 확인하고 필요하면 용가봉을 별도 공급한다.",
        caution: "텅스텐이 용융지에 닿으면 오염될 수 있으므로 전극을 재정비한 뒤 작업조건을 복구한다.",
      },
      {
        issue: "두꺼운 판의 긴 직선 이음을 반복 생산하며 높은 용착률이 필요하다.",
        focus: "SAW의 자동주행·입상 플럭스",
        action: "이음 추적, 와이어 위치, 전류·전압·속도와 플럭스 건조·공급상태를 작업절차와 대조한다.",
        caution: "짧고 복잡한 이음이나 플럭스가 흘러내리는 자세에는 그대로 적용하지 않는다.",
      },
    ],
    trapQuestionIds: [
      "WELD-PROC-001",
      "WELD-PROC-002",
      "WELD-PROC-003",
      "WELD-PROC-004",
      "WELD-PROC-005",
    ],
  },
};

export function getLessonFamilies(content: GeneratedContent, groupId: string): LessonFamily[] {
  const lessons = content.lessons.filter(
    (lesson) =>
      isPublishableLesson(lesson) && lesson.conceptGroupId === groupId,
  );

  return getLessonSubcategories(groupId, lessons).map((subcategory) => {
    const key = familyKey(groupId, subcategory.id);
    const override = FAMILY_OVERRIDES[key];
    const orderedLessons = override
      ? [...subcategory.lessons].sort((left, right) =>
        orderIndex(override.lessonOrder, left.title) - orderIndex(override.lessonOrder, right.title)
        || left.title.localeCompare(right.title, "ko"))
      : [...subcategory.lessons].sort((left, right) => left.title.localeCompare(right.title, "ko"));
    const guide = getGroupGuide(groupId);

    return {
      id: subcategory.id,
      groupId,
      label: subcategory.label,
      lessons: orderedLessons,
      relatedTerms: override?.relatedTerms ?? orderedLessons.map((lesson) => lesson.title),
      scope: override?.scope ?? `${subcategory.label}은(는) ${guide.scope}`,
      mechanism: override?.mechanism ?? guide.mechanism,
      comparison: override?.comparison ?? orderedLessons.map((lesson) => toGenericComparison(content, lesson)),
      fieldCases: override?.fieldCases ?? [],
      decisionSteps: guide.decisionSteps,
      trapQuestions: selectTrapQuestions(content, orderedLessons, override?.trapQuestionIds),
    };
  });
}

export function getLessonFamily(content: GeneratedContent, groupId: string, familyId: string) {
  return getLessonFamilies(content, groupId).find((family) => family.id === familyId);
}

export function getLessonFamilyForLesson(content: GeneratedContent, lessonId: string) {
  const lesson = content.lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson || !isPublishableLesson(lesson)) return undefined;
  return getLessonFamilies(content, lesson.conceptGroupId)
    .find((family) => family.lessons.some((candidate) => candidate.id === lessonId));
}

export function getLessonFamilyHref(groupId: string, familyId: string) {
  return `/written/theory/family/${groupId}/${familyId}`;
}

export function getLessonTrapQuestions(content: GeneratedContent, lessonId: string, limit = 1) {
  return content.questions
    .filter((question) => question.lessonId === lessonId && isPublishableQuestion(question))
    .slice(0, limit);
}

export function shouldReplaceWithFamilySection(block: Lesson["blocks"][number]) {
  return block.id === "field-case"
    || (block.id === "trap" && block.title === "시험에서 자주 나오는 실제 함정 보기");
}

export function isPidFamily(groupId: string, familyId: string) {
  return familyKey(groupId, familyId) === "s1-g11:action";
}

function selectTrapQuestions(content: GeneratedContent, lessons: Lesson[], preferredIds?: string[]) {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const candidates = content.questions.filter(
    (question) => lessonIds.has(question.lessonId) && isPublishableQuestion(question),
  );
  const selected: Question[] = [];

  for (const id of preferredIds ?? []) {
    const question = candidates.find((candidate) => candidate.id === id);
    if (question) selected.push(question);
  }
  for (const lesson of lessons) {
    if (selected.length >= 5) break;
    const question = candidates.find(
      (candidate) => candidate.lessonId === lesson.id && !selected.some((item) => item.id === candidate.id),
    );
    if (question) selected.push(question);
  }

  return selected.slice(0, 5);
}

function toGenericComparison(content: GeneratedContent, lesson: Lesson): FamilyComparison {
  const question = content.questions.find(
    (candidate) => candidate.lessonId === lesson.id && isPublishableQuestion(candidate),
  );
  const wrongChoice = question?.choices.find((choice) => choice.id !== question.correctChoiceId);
  const trapChoice = extractFirstTrapChoice(lesson);

  return {
    term: lesson.title,
    input: question
      ? shorten(`“${question.stem}”에서 요구하는 조건`, 92)
      : `${lesson.title}의 정의·적용 대상`,
    role: shorten(lesson.summary[0] ?? `${lesson.title}의 정의와 기능을 확인한다.`, 125),
    effect: question
      ? buildExamJudgment(question)
      : "연결된 공개 기출이 없어 세부 레슨에서 정의·적용 조건을 직접 확인합니다.",
    caution: question && wrongChoice
      ? buildExamCaution(question, wrongChoice.text)
      : trapChoice
        ? `실제 문항에서는 “${trapChoice}”을(를) 헷갈리는 보기로 제시합니다. 정의뿐 아니라 적용 조건까지 대조합니다.`
        : shorten(
          lesson.summary[2]
            ?? `${lesson.title}의 대상과 적용 조건을 비슷한 용어와 바꾸어 제시하는 보기에 주의합니다.`,
          135,
        ),
  };
}

function buildExamCaution(question: Question, wrongChoice: string) {
  if (isNegativeStem(question.stem)) {
    return shorten(
      `부정형 함정 보기: “${wrongChoice}”. 이 보기는 실제로 성립하므로 제외하면 안 됩니다. 정답(제외 대상)은 “${question.answerText}”입니다.`,
      170,
    );
  }

  return shorten(
    `실제 함정 보기: “${wrongChoice}”. 이 보기를 정답과 바꿔 제시합니다. 판단 기준: ${question.explanation}`,
    170,
  );
}

function buildExamJudgment(question: Question) {
  if (/분류|해당/u.test(question.stem)) {
    return isNegativeStem(question.stem)
      ? "분류·제외형: 같은 계열처럼 보이는 항목 중 분류 기준에서 벗어나는 보기를 찾는다."
      : "분류형: 명칭보다 재료·작동 방식·적용 대상을 기준으로 같은 계열을 고른다.";
  }
  if (/선정|조건|고려|거리가\s*먼|필요가\s*(?:가장\s*)?적/u.test(question.stem)) {
    return isNegativeStem(question.stem)
      ? "선정조건 부정형: 실제 선정 기준과 직접 관련이 적거나 반대되는 조건을 찾는다."
      : "선정조건형: 운전 조건과 요구 성능에 맞는 선정 기준을 고른다.";
  }
  if (/성질|성능|요구/u.test(question.stem)) {
    return isNegativeStem(question.stem)
      ? "요구성능 부정형: 필요한 성질 사이에 불필요하거나 반대되는 성능을 섞어 제시한다."
      : "요구성능형: 용도에서 필요한 성질과 기대 효과가 함께 맞는 보기를 고른다.";
  }
  if (isNegativeStem(question.stem)) {
    return "부정형 판별: 실제로 성립하는 설명과 제외할 보기를 구분한다.";
  }
  if (/계산|구하|얼마|값은|회전수|유량|압력|동력/u.test(question.stem)) {
    return "계산·적용형: 제시된 조건과 단위를 식에 적용해 결과를 판정한다.";
  }
  if (/원인|대책|고장|점검|조치|이상/u.test(question.stem)) {
    return "사례·진단형: 증상과 조건에서 직접 원인 또는 다음 조치를 구분한다.";
  }
  if (/용도|기능|특징|종류|분류|방식/u.test(question.stem)) {
    return "개념 구분형: 대상의 기능·특징·분류 기준을 비교한다.";
  }
  return "조건 판별형: 질문의 대상·조건·기능이 모두 맞는 보기를 고른다.";
}

function isNegativeStem(stem: string) {
  return /아닌|아니|옳지\s*않|않는|않은|되지\s*않|보기\s*어려운|거리가\s*먼|부적절|잘못된|가장\s*적은|제외|없는/u.test(stem);
}

function extractFirstTrapChoice(lesson: Lesson) {
  const trapBody = lesson.blocks.find((block) => block.id === "trap")?.body;
  return trapBody?.match(/>\s*\*\*[“"]([^”"]+)[”"]\*\*/u)?.[1];
}

function shorten(value: string, limit: number) {
  const normalized = value
    .replace(/[*_#>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1).trim()}…` : normalized;
}

function familyKey(groupId: string, familyId: string) {
  return `${groupId}:${familyId}`;
}

function orderIndex(order: string[], title: string) {
  const index = order.indexOf(title);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
