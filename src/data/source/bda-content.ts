import type {
  BdaContent,
  BdaLesson,
  BdaQuestion,
  BdaSourceRef,
} from "@/lib/domain/bda";

const SOURCE_HUB =
  "https://able-storm-b04.notion.site/31d02e78962a807fb7abe231493a2b4c";

const subjectSources: Record<string, BdaSourceRef> = {
  "bda-s1": {
    label: "제1과목 최종본 · 빅데이터 분석기획",
    url: "https://www.notion.so/33302e78962a800cbe22faa566ab2296",
    sourceType: "user_provided",
    evidenceGrade: "B",
    reviewedAt: "2026-07-24",
  },
  "bda-s2": {
    label: "제2과목 최종본 · 빅데이터 탐색",
    url: "https://www.notion.so/33302e78962a80d692e8cf26f0cd5791",
    sourceType: "user_provided",
    evidenceGrade: "B",
    reviewedAt: "2026-07-24",
  },
  "bda-s3": {
    label: "제3과목 최종본 · 빅데이터 모델링",
    url: "https://www.notion.so/33302e78962a80628fecdaf4d8f41072",
    sourceType: "user_provided",
    evidenceGrade: "B",
    reviewedAt: "2026-07-24",
  },
  "bda-s4": {
    label: "제4과목 최종본 · 빅데이터 결과 해석",
    url: "https://www.notion.so/33302e78962a807d81e4e83e08f5d735",
    sourceType: "user_provided",
    evidenceGrade: "B",
    reviewedAt: "2026-07-24",
  },
};

type LessonSeed = Omit<
  BdaLesson,
  | "sourceRefs"
  | "contentStatus"
  | "questionIds"
  | "conceptDefinition"
  | "decisionSteps"
  | "comparisonRows"
  | "examChecklist"
  | "memoryLine"
> & {
  questionIds?: string[];
};

type LessonDetail = Pick<
  BdaLesson,
  | "conceptDefinition"
  | "decisionSteps"
  | "comparisonRows"
  | "examChecklist"
  | "memoryLine"
>;

const lessonDetails: Record<string, LessonDetail> = {
  "bda-s1-data-dikw": {
    conceptDefinition: [
      "데이터는 관찰된 사실 자체이고, 정보는 목적에 맞게 정리되어 의미를 얻은 데이터입니다. 지식은 정보 사이의 규칙을 설명하며, 지혜는 그 지식을 실제 판단과 행동에 적용합니다.",
      "시험에서는 같은 사례가 어느 단계에 속하는지를 묻습니다. 계산·집계만 했는지, 원인을 설명했는지, 의사결정까지 제안했는지를 순서대로 확인합니다.",
    ],
    decisionSteps: [
      { label: "원재료 확인", description: "맥락 없는 수치·문자·관측값이면 데이터로 봅니다." },
      { label: "의미 부여 확인", description: "분류·집계·비교로 질문에 답할 수 있으면 정보입니다." },
      { label: "판단 수준 확인", description: "규칙을 설명하면 지식, 행동을 선택하면 지혜입니다." },
    ],
    comparisonRows: [
      { label: "데이터 vs 정보", core: "관찰값과 의미가 부여된 결과의 차이", use: "집계표·대시보드 사례 분류", trap: "숫자가 가공되었다고 모두 지식은 아닙니다." },
      { label: "지식 vs 지혜", core: "규칙 이해와 의사결정 적용의 차이", use: "예측 결과를 실제 정책에 적용하는 사례", trap: "모델 결과 자체는 지혜가 아니라 정보 또는 지식일 수 있습니다." },
    ],
    examChecklist: ["사례에 맥락이 붙었는가", "규칙이나 원인을 설명하는가", "행동·판단까지 이어지는가"],
    memoryLine: "데이터는 사실, 정보는 의미, 지식은 규칙, 지혜는 행동이다.",
  },
  "bda-s1-bigdata-value": {
    conceptDefinition: [
      "빅데이터는 단순히 큰 데이터가 아니라 기존 방식으로 수집·저장·처리하기 어려운 규모·다양성·속도를 가진 데이터 환경을 뜻합니다.",
      "3V는 기본 판단틀이며, 신뢰성과 가치가 추가될 때는 데이터 품질과 활용 성과까지 함께 봅니다.",
    ],
    decisionSteps: [
      { label: "기본 3V", description: "규모, 다양성, 생성·처리 속도를 먼저 구분합니다." },
      { label: "확장 특성", description: "신뢰성, 가치 등 문항에서 요구하는 확장 V를 확인합니다." },
      { label: "가치 조건", description: "데이터 품질·법적 제약·분석 역량이 실제 성과를 좌우합니다." },
    ],
    comparisonRows: [
      { label: "Volume", core: "저장·처리해야 하는 데이터 양", use: "분산 저장과 확장성 판단", trap: "큰 파일 하나만으로 모든 빅데이터 특성이 충족되지는 않습니다." },
      { label: "Variety·Velocity", core: "형태의 다양성과 발생·처리 속도", use: "로그·센서·문서 혼합과 실시간 처리", trap: "다양성과 속도를 규모와 같은 의미로 보지 않습니다." },
    ],
    examChecklist: ["문항이 3V인지 5V인지 확인", "각 V의 영문과 의미 연결", "데이터 양과 가치 창출을 분리"],
    memoryLine: "빅데이터의 크기는 조건이고, 가치는 품질과 활용에서 결정된다.",
  },
  "bda-s1-governance-quality": {
    conceptDefinition: [
      "데이터 거버넌스는 데이터의 소유권, 표준, 품질, 보안과 활용 책임을 조직 차원에서 정하는 운영 체계입니다.",
      "품질은 정확성·완전성·일관성·적시성·유효성처럼 여러 관점으로 측정하며, 개인정보 보호는 별도의 법적·기술적 통제를 요구합니다.",
    ],
    decisionSteps: [
      { label: "책임 확인", description: "소유자·관리자·사용자의 역할과 승인 경계를 봅니다." },
      { label: "품질 차원 선택", description: "오류 유형이 정확성, 완전성, 일관성 중 무엇인지 판단합니다." },
      { label: "보호 기법 선택", description: "암호화·가명처리·익명성 기법의 목적을 구분합니다." },
    ],
    comparisonRows: [
      { label: "메타데이터·MDM", core: "데이터 의미·구조 설명과 기준정보 통합", use: "데이터 사전·고객 기준정보 관리", trap: "메타데이터는 업무 데이터 자체가 아닙니다." },
      { label: "k-익명성·l-다양성", core: "준식별자 집단 크기와 민감값 다양성", use: "재식별 위험 완화", trap: "k-익명성만으로 동질성 공격을 모두 막지 못합니다." },
    ],
    examChecklist: ["거버넌스와 단순 IT 운영 구분", "품질 차원 이름과 사례 연결", "익명성 기법의 공격 방어 범위 확인"],
    memoryLine: "거버넌스는 책임의 체계, 품질은 데이터의 상태, 보호는 사용 경계다.",
  },
  "bda-s1-methodology-planning": {
    conceptDefinition: [
      "분석 방법론은 문제 정의부터 데이터 이해·준비, 모델링, 평가와 전개까지의 반복 가능한 절차입니다.",
      "분석 과제는 정확도보다 먼저 업무 목표, 실행 가능성, 기대 효과와 위험을 명시해야 합니다.",
    ],
    decisionSteps: [
      { label: "업무 문제", description: "누가 어떤 결정을 개선하려는지 정의합니다." },
      { label: "분석 설계", description: "필요 데이터, 지표, 방법과 검증 기준을 정합니다." },
      { label: "전개 판단", description: "모델 성능과 운영 가능성을 함께 평가합니다." },
    ],
    comparisonRows: [
      { label: "CRISP-DM·KDD", core: "업무 중심 전체 수명주기와 지식발견 절차", use: "분석 단계 순서 문제", trap: "단계는 한 번만 진행되는 직선 과정이 아닙니다." },
      { label: "하향식·상향식", core: "업무 문제 출발과 데이터 패턴 출발", use: "과제 발굴 방식 선택", trap: "둘 중 하나만 사용해야 하는 것은 아닙니다." },
    ],
    examChecklist: ["문제 정의가 먼저인지 확인", "평가와 전개를 혼동하지 않기", "우선순위에 효과와 실행 가능성 모두 반영"],
    memoryLine: "좋은 분석은 모델이 아니라 업무 문제와 검증 기준에서 시작한다.",
  },
  "bda-s1-collection-storage": {
    conceptDefinition: [
      "데이터 수집은 목적·갱신주기·권한에 맞는 방식으로 원천 데이터를 확보하는 과정이고, 저장은 이후 처리와 재사용을 고려해 구조를 선택하는 과정입니다.",
      "ETL과 ELT는 변환 시점이 다르며, 분산 파일 시스템은 데이터를 블록으로 나누어 확장성과 장애 대응을 확보합니다.",
    ],
    decisionSteps: [
      { label: "원천 특성", description: "정형·반정형·비정형과 배치·스트림을 구분합니다." },
      { label: "변환 시점", description: "적재 전 변환이면 ETL, 적재 후 변환이면 ELT입니다." },
      { label: "저장 구조", description: "조회·분석·보존 목적에 맞춰 웨어하우스와 레이크를 선택합니다." },
    ],
    comparisonRows: [
      { label: "ETL·ELT", core: "적재 전 변환과 적재 후 변환", use: "데이터 파이프라인 설계", trap: "두 방식의 추출과 적재 순서를 혼동하지 않습니다." },
      { label: "DW·데이터 레이크", core: "정제된 분석 데이터와 원시·다형식 데이터", use: "정형 리포팅과 탐색 분석", trap: "레이크도 메타데이터·품질 관리가 필요합니다." },
    ],
    examChecklist: ["수집 권한과 로봇 정책 확인", "배치·실시간 요구 구분", "저장소와 처리엔진 역할 분리"],
    memoryLine: "수집은 목적과 권한, 저장은 형식과 활용, 처리는 확장성과 재현성이다.",
  },
  "bda-s2-scales-preprocessing": {
    conceptDefinition: [
      "측정척도는 값에 허용되는 연산을 결정합니다. 명목은 구분, 서열은 순서, 등간은 동일 간격, 비율은 절대적 0과 비율 해석까지 허용합니다.",
      "전처리는 모델이 숫자를 올바르게 해석하도록 결측·범주·스케일을 변환하는 과정이며 반드시 학습 데이터 기준으로 적합합니다.",
    ],
    decisionSteps: [
      { label: "척도 판별", description: "순서·간격·절대적 0의 존재를 차례로 확인합니다." },
      { label: "변환 선택", description: "범주 인코딩과 수치 스케일링을 변수 의미에 맞게 정합니다." },
      { label: "누수 차단", description: "전처리 통계량은 학습 데이터에서만 계산합니다." },
    ],
    comparisonRows: [
      { label: "표준화·정규화", core: "평균 0·표준편차 1과 지정 범위 변환", use: "거리·경사 기반 모델 전처리", trap: "트리 모델에 항상 필수인 것은 아닙니다." },
      { label: "라벨·원핫 인코딩", core: "범주를 정수 또는 독립 열로 표현", use: "서열 유무에 따른 범주 처리", trap: "명목형 정수 인코딩에 가짜 순서가 생길 수 있습니다." },
    ],
    examChecklist: ["절대적 0 존재 여부", "범주 순서가 실제 의미인지 확인", "fit은 학습 데이터에서만 수행"],
    memoryLine: "척도가 연산을 정하고, 전처리는 그 의미를 모델 입력으로 보존한다.",
  },
  "bda-s2-missing-outlier": {
    conceptDefinition: [
      "결측은 발생 메커니즘에 따라 MCAR·MAR·MNAR로 구분하며, 같은 결측률이라도 원인에 따라 적절한 처리법이 달라집니다.",
      "이상값은 오류일 수도 있지만 중요한 희귀 사건일 수도 있으므로 탐지와 제거를 같은 단계로 보지 않습니다.",
    ],
    decisionSteps: [
      { label: "원인 확인", description: "결측·이상값이 측정 오류인지 실제 현상인지 확인합니다." },
      { label: "영향 평가", description: "분포·모델·업무 판단에 미치는 영향을 비교합니다." },
      { label: "처리 검증", description: "삭제·대치·변환 후 결과 민감도를 재검증합니다." },
    ],
    comparisonRows: [
      { label: "MCAR·MAR·MNAR", core: "결측 여부와 관측·미관측 값의 관계", use: "대치 가능성 및 편향 판단", trap: "결측률만으로 메커니즘을 확정할 수 없습니다." },
      { label: "IQR·z-score", core: "사분위 범위와 평균·표준편차 기준", use: "분포 특성에 따른 이상값 후보 탐지", trap: "탐지된 값을 자동 삭제하지 않습니다." },
    ],
    examChecklist: ["결측 원인을 먼저 확인", "이상값의 업무 의미 검토", "대치·스케일링 통계량 누수 차단"],
    memoryLine: "결측과 이상값은 지우는 대상이 아니라 원인과 영향을 판단하는 대상이다.",
  },
  "bda-s2-sampling-pca": {
    conceptDefinition: [
      "표본추출은 모집단을 대표하도록 관측치를 선택하는 설계이고, 차원축소는 변수 정보를 더 적은 축으로 요약하는 변환입니다.",
      "PCA는 목표변수를 사용하지 않고 분산을 최대화하는 직교축을 찾으므로 예측력 자체를 보장하지 않습니다.",
    ],
    decisionSteps: [
      { label: "표본 단위", description: "개체·층·군집 중 실제 추출 단위를 확인합니다." },
      { label: "대표성", description: "각 집단이 표본에 포함될 확률과 편향을 점검합니다." },
      { label: "분산 구조", description: "PCA 전 스케일과 누적 설명분산을 확인합니다." },
    ],
    comparisonRows: [
      { label: "층화·군집추출", core: "모든 층에서 추출과 일부 군집 선택", use: "소수집단 보장과 조사비용 절감", trap: "층과 군집의 내부 동질성 가정을 뒤바꾸지 않습니다." },
      { label: "PCA·변수선택", core: "새 축 생성과 기존 변수 일부 유지", use: "압축·시각화와 해석 가능성 확보", trap: "주성분은 원래 변수 하나와 같지 않습니다." },
    ],
    examChecklist: ["추출 단위와 모집단 구조 확인", "표본 편향 점검", "PCA 전 표준화와 설명분산 확인"],
    memoryLine: "표본추출은 행을 고르고, PCA는 열을 새 축으로 요약한다.",
  },
  "bda-s2-statistics-distributions": {
    conceptDefinition: [
      "기술통계는 데이터의 중심·산포·형태를 요약하고, 확률분포는 가능한 값과 그 확률을 수학적으로 표현합니다.",
      "분포 선택은 값의 형태, 시행의 독립성, 발생률 안정성 같은 조건을 먼저 확인한 뒤 결정합니다.",
    ],
    decisionSteps: [
      { label: "값 형태", description: "연속값인지 횟수·성공 여부인지 구분합니다." },
      { label: "분포 조건", description: "독립성, 시행 횟수, 발생률과 범위를 확인합니다." },
      { label: "요약 통계", description: "왜도와 극단값에 맞춰 평균·중앙값과 산포를 선택합니다." },
    ],
    comparisonRows: [
      { label: "평균·중앙값", core: "모든 값 반영과 순서 중심값", use: "대칭 분포와 왜도·극단값 분포 요약", trap: "극단값이 큰 분포에서 평균만 보지 않습니다." },
      { label: "이항·포아송", core: "고정 시행 성공 횟수와 구간 사건 횟수", use: "불량 개수와 시간당 도착 건수", trap: "포아송은 고정된 시행 횟수를 전제하지 않습니다." },
    ],
    examChecklist: ["변수가 이산인지 연속인지", "표본분산 분모 n-1 확인", "상관 0과 독립을 동일시하지 않기"],
    memoryLine: "통계량은 데이터를 요약하고, 분포는 데이터가 생기는 확률 구조를 설명한다.",
  },
  "bda-s2-hypothesis-anova": {
    conceptDefinition: [
      "가설검정은 귀무가설이 참이라는 전제에서 관측 결과가 얼마나 이례적인지 계산해 기각 여부를 판단하는 절차입니다.",
      "p값은 귀무가설이 참일 확률이 아니며, 유의성은 효과 크기나 실무 중요성과 별도로 해석해야 합니다.",
    ],
    decisionSteps: [
      { label: "가설 설정", description: "모수와 비교 방향을 명확히 정합니다." },
      { label: "검정 선택", description: "변수 유형·집단 수·독립성과 가정을 확인합니다." },
      { label: "결과 해석", description: "p값, 신뢰구간, 효과 크기를 함께 봅니다." },
    ],
    comparisonRows: [
      { label: "t검정·ANOVA", core: "두 집단 평균과 세 집단 이상 평균 비교", use: "연속형 결과의 집단 차이", trap: "ANOVA 유의 후 집단 쌍은 사후검정이 필요합니다." },
      { label: "카이제곱·상관", core: "범주형 독립성과 수치형 선형 관계", use: "빈도표와 두 연속변수 관계", trap: "상관은 인과를 의미하지 않습니다." },
    ],
    examChecklist: ["귀무·대립가설 방향", "변수 유형과 집단 수", "p값과 효과 크기 분리"],
    memoryLine: "p값은 가설의 확률이 아니라 귀무가설 아래 데이터의 이례성이다.",
  },
  "bda-s3-model-variable": {
    conceptDefinition: [
      "모델 설계는 목표변수의 형태와 업무 목적에 따라 분류·회귀·비지도 문제를 정하고, 검증 가능한 데이터 분할과 평가 지표를 설계하는 과정입니다.",
      "변수 선택은 불필요한 입력을 줄이지만 반드시 학습 데이터 내부에서 수행해야 하며, 시험 데이터로 반복 선택하면 누수가 발생합니다.",
    ],
    decisionSteps: [
      { label: "문제 유형", description: "목표변수 유무와 연속·범주 형태를 확인합니다." },
      { label: "분할 설계", description: "시간·그룹 구조를 보존하며 학습·검증·시험을 나눕니다." },
      { label: "변수 선택", description: "필터·래퍼·임베디드 방법을 학습 데이터에 적용합니다." },
    ],
    comparisonRows: [
      { label: "분류·회귀", core: "범주 예측과 연속값 예측", use: "이탈 여부와 매출액 예측", trap: "숫자로 인코딩된 범주를 회귀로 보지 않습니다." },
      { label: "필터·래퍼·임베디드", core: "통계량, 후보 모델 성능, 학습 과정 기반 선택", use: "비용과 성능·해석 균형", trap: "전체 데이터로 선택한 뒤 검증하면 누수입니다." },
    ],
    examChecklist: ["목표변수 형태", "시간·그룹 분할 필요성", "전처리와 변수선택 fit 범위"],
    memoryLine: "문제 유형은 목표가 정하고, 검증 설계는 데이터 생성 구조가 정한다.",
  },
  "bda-s3-logistic-tree": {
    conceptDefinition: [
      "로지스틱 회귀는 설명변수의 선형결합을 로짓으로 표현해 사건 확률을 예측하고, 의사결정나무는 변수와 임계값으로 공간을 반복 분할합니다.",
      "로지스틱 회귀는 계수와 오즈비 해석이 강점이고, 나무는 비선형 상호작용과 규칙 표현이 쉽지만 깊어질수록 과적합하기 쉽습니다.",
    ],
    decisionSteps: [
      { label: "출력 해석", description: "확률·오즈·클래스 중 문항이 묻는 값을 구분합니다." },
      { label: "분할 기준", description: "지니·엔트로피 등 불순도 감소를 확인합니다." },
      { label: "복잡도 제어", description: "규제와 가지치기·깊이 제한으로 과적합을 줄입니다." },
    ],
    comparisonRows: [
      { label: "로지스틱 회귀", core: "로그오즈의 선형 모형", use: "확률과 계수 해석이 중요한 분류", trap: "종속변수가 범주여도 출력은 확률입니다." },
      { label: "의사결정나무", core: "규칙 기반 재귀 분할", use: "비선형·상호작용과 설명 가능한 규칙", trap: "깊은 나무는 훈련 데이터에 쉽게 과적합합니다." },
    ],
    examChecklist: ["시그모이드 출력 범위", "오즈비 exp(계수) 해석", "나무 불순도와 가지치기 목적"],
    memoryLine: "로지스틱은 확률을 식으로, 나무는 판단을 규칙으로 표현한다.",
  },
  "bda-s3-svm-ann": {
    conceptDefinition: [
      "SVM은 클래스 사이 마진을 최대화하는 결정경계를 찾고, 커널을 통해 비선형 경계를 구성할 수 있습니다.",
      "신경망은 층별 선형결합과 비선형 활성화를 반복하며, 손실함수의 기울기를 역전파해 가중치를 학습합니다.",
    ],
    decisionSteps: [
      { label: "경계 구성", description: "선형 분리 가능성과 커널 필요성을 판단합니다." },
      { label: "규제 조정", description: "C·감마 또는 학습률·가중치 감소를 조정합니다." },
      { label: "일반화 확인", description: "검증 성능과 복잡도·학습 안정성을 함께 봅니다." },
    ],
    comparisonRows: [
      { label: "SVM", core: "서포트 벡터가 만드는 최대 마진 경계", use: "중소 규모 고차원 분류", trap: "C가 클수록 규제가 강해진다고 뒤집어 외우지 않습니다." },
      { label: "신경망", core: "다층 비선형 함수 근사", use: "복잡한 패턴과 대규모 데이터", trap: "활성화가 모두 선형이면 깊이의 비선형 이점이 사라집니다." },
    ],
    examChecklist: ["마진과 서포트 벡터 관계", "커널의 목적", "순전파·손실·역전파 순서"],
    memoryLine: "SVM은 경계의 여백을, 신경망은 손실의 기울기를 학습한다.",
  },
  "bda-s3-ensemble-evaluation": {
    conceptDefinition: [
      "앙상블은 여러 모델의 예측을 결합해 단일 모델보다 안정적이거나 정확한 결과를 만드는 방법입니다.",
      "배깅은 표본과 모델의 다양성으로 분산을 줄이고, 부스팅은 앞선 오류를 순차적으로 보완해 편향을 줄이는 데 초점을 둡니다.",
    ],
    decisionSteps: [
      { label: "학습 순서", description: "모델들이 독립·병렬인지 오류 의존·순차인지 봅니다." },
      { label: "다양성 원천", description: "표본·변수·가중치가 어떻게 달라지는지 확인합니다." },
      { label: "평가 설계", description: "검증 데이터와 적절한 지표로 일반화 성능을 비교합니다." },
    ],
    comparisonRows: [
      { label: "배깅·랜덤포레스트", core: "부트스트랩과 변수 후보 무작위화", use: "분산 감소와 강건한 트리 앙상블", trap: "랜덤포레스트는 단순히 나무를 많이 만드는 것만이 아닙니다." },
      { label: "부스팅", core: "앞선 오류를 보완하는 순차 결합", use: "높은 예측 성능과 약한 학습기 결합", trap: "노이즈와 설정에 따라 과적합할 수 있습니다." },
    ],
    examChecklist: ["병렬·순차 구분", "표본·변수 무작위화 구분", "훈련 성능이 아닌 검증 성능으로 비교"],
    memoryLine: "배깅은 다르게 뽑아 평균내고, 부스팅은 틀린 것을 이어서 고친다.",
  },
  "bda-s3-cluster-timeseries": {
    conceptDefinition: [
      "군집과 연관분석은 목표변수 없이 데이터의 구조와 동시 발생 패턴을 찾고, 시계열 분석은 시간 순서와 자기의존성을 모델링합니다.",
      "세 기법은 목적과 데이터 구조가 다르므로 거리·빈도·시간이라는 핵심 단서를 먼저 구분해야 합니다.",
    ],
    decisionSteps: [
      { label: "구조 단서", description: "거리 기반 집단, 항목 동시발생, 시간 순서 중 무엇인지 봅니다." },
      { label: "핵심 지표", description: "군집내 거리, 지지도·신뢰도·향상도, 자기상관을 확인합니다." },
      { label: "가정 점검", description: "스케일·초기값·정상성과 시간 누수를 점검합니다." },
    ],
    comparisonRows: [
      { label: "k-평균·계층군집", core: "중심 반복 갱신과 병합·분할 덴드로그램", use: "구형 군집과 군집 관계 탐색", trap: "k-평균은 범주형·이상값에 그대로 쓰기 어렵습니다." },
      { label: "연관·시계열", core: "항목 동시발생과 시간 의존성", use: "장바구니 규칙과 수요 예측", trap: "시간 데이터는 무작위 분할로 미래가 섞이지 않게 합니다." },
    ],
    examChecklist: ["향상도 1의 의미", "k-평균 스케일 영향", "시계열 정상성과 시간 순서 보존"],
    memoryLine: "군집은 거리, 연관은 동시발생, 시계열은 시간 의존성을 본다.",
  },
  "bda-s4-regression-classification-metrics": {
    conceptDefinition: [
      "평가지표는 모델의 목적과 오류 비용을 숫자로 표현합니다. 회귀는 예측 오차의 크기, 분류는 혼동행렬과 임계값에 따른 오류를 봅니다.",
      "불균형 데이터에서는 정확도만 보지 않고 정밀도·재현율·F1과 PR-AUC 등을 업무 비용에 맞게 선택합니다.",
    ],
    decisionSteps: [
      { label: "문제 유형", description: "연속값 회귀인지 범주 분류인지 먼저 구분합니다." },
      { label: "오류 비용", description: "거짓양성과 거짓음성 중 어느 비용이 큰지 정합니다." },
      { label: "지표 해석", description: "단위, 임계값, 클래스 불균형을 함께 확인합니다." },
    ],
    comparisonRows: [
      { label: "MAE·RMSE", core: "절대오차 평균과 큰 오차에 민감한 제곱근 오차", use: "일반 오차와 큰 실패 비용 비교", trap: "서로 다른 단위·스케일의 문제를 값만으로 비교하지 않습니다." },
      { label: "정밀도·재현율", core: "예측 양성의 정확성과 실제 양성의 탐지율", use: "스팸 차단과 질병 선별", trap: "임계값을 바꾸면 두 지표가 함께 변합니다." },
    ],
    examChecklist: ["지표가 높을수록 좋은지 낮을수록 좋은지", "분모를 혼동하지 않기", "불균형과 임계값 영향 확인"],
    memoryLine: "정밀도는 잡은 것의 정확성, 재현율은 잡아야 할 것을 잡은 비율이다.",
  },
  "bda-s4-crossvalidation-overfit": {
    conceptDefinition: [
      "교차검증은 제한된 데이터를 여러 학습·검증 조합으로 반복 사용해 모델 선택의 안정성을 평가합니다.",
      "과적합은 훈련 데이터의 우연한 패턴까지 학습해 새로운 데이터 성능이 떨어지는 상태이며, 누수는 검증·시험 정보가 학습에 들어간 더 직접적인 오류입니다.",
    ],
    decisionSteps: [
      { label: "분할 단위", description: "행·사람·시간 중 독립성을 보장하는 단위를 정합니다." },
      { label: "파이프라인", description: "각 폴드의 학습 부분에서만 전처리와 선택을 적합합니다." },
      { label: "최종 평가", description: "모델 선택 후 잠근 시험 세트에서 한 번 평가합니다." },
    ],
    comparisonRows: [
      { label: "k-fold·시계열 분할", core: "무작위 폴드 반복과 과거→미래 순차 검증", use: "독립 표본과 시간 의존 데이터", trap: "시계열에 일반 셔플 k-fold를 적용하지 않습니다." },
      { label: "과적합·누수", core: "복잡도 문제와 평가 정보 유입 문제", use: "성능 격차 진단과 파이프라인 감사", trap: "규제만으로 데이터 누수를 해결할 수 없습니다." },
    ],
    examChecklist: ["같은 대상의 중복 행이 폴드에 분산되는지", "전처리 fit 범위", "시험 세트 재사용 여부"],
    memoryLine: "교차검증의 핵심은 반복보다 분리이며, 시험 세트는 마지막에 한 번만 연다.",
  },
  "bda-s4-regularization-optimization": {
    conceptDefinition: [
      "규제는 손실함수에 계수 크기 패널티를 더해 모델 복잡도를 제어하고, 초매개변수 탐색은 규제 강도·깊이·학습률 같은 설정을 검증 데이터로 선택합니다.",
      "최적화는 주어진 목적함수를 줄이는 매개변수를 찾는 과정이며, 모델 선택과 최종 성능 평가는 서로 다른 데이터 역할을 가져야 합니다.",
    ],
    decisionSteps: [
      { label: "복잡도 원인", description: "계수 크기, 변수 수, 깊이와 반복 횟수를 확인합니다." },
      { label: "규제 선택", description: "희소성이 필요하면 L1, 안정적 축소가 필요하면 L2를 고려합니다." },
      { label: "탐색 검증", description: "교차검증 안에서 초매개변수를 비교하고 시험 세트는 잠급니다." },
    ],
    comparisonRows: [
      { label: "L1·L2", core: "절댓값 패널티와 제곱 패널티", use: "희소 선택과 계수 안정화", trap: "규제가 클수록 항상 성능이 좋아지는 것은 아닙니다." },
      { label: "그리드·랜덤 탐색", core: "정해진 조합 전수와 확률적 조합 표본", use: "작은 탐색공간과 큰 탐색공간", trap: "시험 세트로 조합을 선택하지 않습니다." },
    ],
    examChecklist: ["매개변수와 초매개변수 구분", "규제 강도와 과소적합 관계", "탐색이 교차검증 안에서 수행되는지"],
    memoryLine: "L1은 0을 만들고, L2는 크게 튀는 계수를 부드럽게 줄인다.",
  },
  "bda-s4-xai": {
    conceptDefinition: [
      "설명가능한 AI는 모델 전체의 행동 또는 개별 예측의 근거를 사람이 이해할 수 있는 형태로 제시하는 방법입니다.",
      "설명은 모델의 연관 구조를 보여줄 뿐 자동으로 인과관계를 증명하지 않으며, 상관된 변수에서는 기여도 분배가 불안정할 수 있습니다.",
    ],
    decisionSteps: [
      { label: "설명 범위", description: "전역 패턴인지 개별 예측인지 정합니다." },
      { label: "기법 선택", description: "중요도·PDP·LIME·SHAP의 출력과 가정을 비교합니다." },
      { label: "해석 검증", description: "상관·데이터 분포·반복 안정성과 업무 타당성을 확인합니다." },
    ],
    comparisonRows: [
      { label: "전역·국소 설명", core: "전체 모델 행동과 한 관측치 예측 근거", use: "모델 감사와 고객별 설명", trap: "국소 설명 하나를 전체 모델 특성으로 일반화하지 않습니다." },
      { label: "SHAP·PDP", core: "예측 기여도 배분과 평균 예측 변화", use: "개별·전역 기여와 변수 효과 탐색", trap: "기여도와 인과효과를 동일시하지 않습니다." },
    ],
    examChecklist: ["설명 대상이 전체인지 개별인지", "상관 변수 영향", "설명과 인과 추론 구분"],
    memoryLine: "설명은 모델이 그렇게 예측한 이유이지 현실의 원인을 자동 증명하지 않는다.",
  },
  "bda-s4-visualization-deployment": {
    conceptDefinition: [
      "시각화는 비교·분포·관계·구성이라는 전달 목적에 맞는 표현을 선택하는 과정이고, 배포는 분석 결과를 실제 업무 흐름에서 재현 가능하게 제공하는 과정입니다.",
      "운영 중에는 입력 품질, 데이터·개념 드리프트, 성능, 지연시간과 오류율을 함께 감시해야 합니다.",
    ],
    decisionSteps: [
      { label: "메시지 선택", description: "비교·추세·분포·관계 중 전달할 질문을 정합니다." },
      { label: "운영 계약", description: "입력 스키마, 버전, 지연시간과 실패 처리를 정의합니다." },
      { label: "모니터링", description: "입력 변화와 실제 성능 저하를 구분해 경보를 설계합니다." },
    ],
    comparisonRows: [
      { label: "데이터·개념 드리프트", core: "입력 분포 변화와 입력-목표 관계 변화", use: "재학습 원인 진단", trap: "입력 분포가 같아도 개념 드리프트가 생길 수 있습니다." },
      { label: "막대·선·산점도", core: "범주 비교, 시간 추세, 두 수치 관계", use: "목적에 맞는 기본 차트 선택", trap: "잘린 축과 이중 축으로 차이를 과장하지 않습니다." },
    ],
    examChecklist: ["축·단위·분모 표시", "데이터와 모델 버전 기록", "드리프트와 성능 저하를 함께 확인"],
    memoryLine: "시각화는 질문을 보여주고, 배포는 재현을 보장하며, 모니터링은 변화를 감시한다.",
  },
};

function lesson(seed: LessonSeed): BdaLesson {
  const detail = lessonDetails[seed.id];
  if (!detail) {
    throw new Error(`학습 상세 구성이 누락되었습니다: ${seed.id}`);
  }
  return {
    ...seed,
    ...detail,
    sourceRefs: [subjectSources[seed.subjectId]],
    questionIds: seed.questionIds ?? [],
    contentStatus: "published",
  };
}

const lessons: BdaLesson[] = [
  lesson({
    id: "bda-s1-data-dikw",
    subjectId: "bda-s1",
    order: 1,
    title: "데이터·정보·지식과 DIKW",
    summary:
      "데이터가 맥락과 해석을 거쳐 의사결정에 쓰이는 지혜로 발전하는 흐름을 구분합니다.",
    learningGoals: [
      "정성·정량 데이터와 데이터 유형을 구분한다.",
      "DIKW 각 단계의 역할을 사례에 적용한다.",
    ],
    keyPoints: [
      "Data는 관찰된 사실이나 값이며 아직 맥락이 충분하지 않은 원재료다.",
      "Information은 데이터를 목적에 맞게 가공해 의미를 부여한 결과다.",
      "Knowledge는 정보에서 규칙과 패턴을 이해한 상태이고 Wisdom은 이를 판단과 행동에 적용하는 단계다.",
    ],
    examTraps: [
      "단순 집계값에 의미가 붙었다면 데이터보다 정보에 가깝다.",
      "DIKW는 데이터 → 정보 → 지식 → 지혜 순서다.",
    ],
    relatedTerms: ["정성 데이터", "정량 데이터", "DIKW", "암묵지"],
    questionIds: ["bda-q001"],
  }),
  lesson({
    id: "bda-s1-bigdata-value",
    subjectId: "bda-s1",
    order: 2,
    title: "빅데이터의 특성과 가치",
    summary:
      "3V에서 확장된 빅데이터 특성과 데이터 가치 창출의 조건을 정리합니다.",
    learningGoals: [
      "빅데이터의 핵심 특성을 설명한다.",
      "데이터 가치와 활용 장벽을 연결한다.",
    ],
    keyPoints: [
      "3V는 규모(Volume), 다양성(Variety), 속도(Velocity)를 뜻한다.",
      "확장 정의에서는 신뢰성(Veracity)과 가치(Value) 등이 더해진다.",
      "데이터는 결합과 재사용이 가능하지만 품질·법적 제약·분석역량에 따라 실제 가치가 달라진다.",
    ],
    examTraps: [
      "V로 시작하는 용어라도 모든 문헌에서 동일한 확장 요소를 쓰지는 않는다.",
      "데이터의 양이 많다는 사실만으로 분석 가치가 보장되지는 않는다.",
    ],
    relatedTerms: ["3V", "5V", "데이터 경제", "데이터 가치사슬"],
  }),
  lesson({
    id: "bda-s1-governance-quality",
    subjectId: "bda-s1",
    order: 3,
    title: "데이터 거버넌스와 품질",
    summary:
      "표준·메타데이터·품질·보안 책임을 조직 차원에서 통제하는 체계를 학습합니다.",
    learningGoals: [
      "데이터 거버넌스의 구성요소를 구분한다.",
      "품질 특성과 개인정보 보호 기법의 목적을 설명한다.",
    ],
    keyPoints: [
      "데이터 거버넌스는 원칙, 조직, 절차와 책임을 통해 데이터 전 생애주기를 관리한다.",
      "정확성·완전성·일관성·적시성·유효성은 대표적인 데이터 품질 관점이다.",
      "k-익명성은 준식별자 조합이 같은 레코드를 최소 k개 이상 확보하도록 일반화하거나 억제한다.",
    ],
    examTraps: [
      "k-익명성만으로 민감값의 다양성이나 유사성 공격이 모두 해결되지는 않는다.",
      "데이터 사전과 메타데이터는 원천 데이터 자체가 아니라 의미와 구조를 설명한다.",
    ],
    relatedTerms: ["메타데이터", "MDM", "k-익명성", "데이터 품질"],
    questionIds: ["bda-q002"],
  }),
  lesson({
    id: "bda-s1-methodology-planning",
    subjectId: "bda-s1",
    order: 4,
    title: "분석 방법론과 과제 기획",
    summary:
      "문제 정의부터 분석·전개까지의 방법론과 타당성 평가 기준을 연결합니다.",
    learningGoals: [
      "대표 분석 방법론의 단계를 비교한다.",
      "분석 과제 우선순위와 위험을 평가한다.",
    ],
    keyPoints: [
      "CRISP-DM은 업무 이해, 데이터 이해, 데이터 준비, 모델링, 평가, 전개의 반복적 과정이다.",
      "분석 과제는 전략적 중요도, 실행 가능성, 기대 효과와 시급성을 함께 본다.",
      "하향식 접근은 비즈니스 문제에서 출발하고 상향식 접근은 데이터에서 의미 있는 패턴을 탐색한다.",
    ],
    examTraps: [
      "방법론 단계는 일방향으로 한 번만 수행되는 것이 아니라 반복될 수 있다.",
      "정확도가 높은 모델이라도 업무 목적과 배포 조건을 충족하지 못하면 성공한 과제가 아니다.",
    ],
    relatedTerms: ["CRISP-DM", "KDD", "분석 마스터플랜", "ROI"],
  }),
  lesson({
    id: "bda-s1-collection-storage",
    subjectId: "bda-s1",
    order: 5,
    title: "데이터 수집과 저장",
    summary:
      "정형·반정형·비정형 데이터의 수집 방식과 분산 저장 구조를 구분합니다.",
    learningGoals: [
      "수집 방식과 데이터 형태를 연결한다.",
      "분산 저장·처리 구조의 역할을 설명한다.",
    ],
    keyPoints: [
      "API, 로그 수집, 크롤링, 센서 스트림 등은 목적과 갱신 주기에 맞게 선택한다.",
      "ETL은 추출 후 변환해 적재하고 ELT는 먼저 적재한 뒤 대상 시스템에서 변환한다.",
      "분산 파일 시스템은 큰 파일을 블록으로 나누어 여러 노드에 저장하고 복제해 장애에 대비한다.",
    ],
    examTraps: [
      "웹에서 접근 가능하다는 사실이 무제한 수집과 재사용 권한을 뜻하지는 않는다.",
      "데이터 레이크는 원시 데이터를 보관할 수 있지만 메타데이터와 품질 관리가 없으면 활용성이 떨어진다.",
    ],
    relatedTerms: ["ETL", "ELT", "HDFS", "데이터 레이크"],
  }),
  lesson({
    id: "bda-s2-scales-preprocessing",
    subjectId: "bda-s2",
    order: 1,
    title: "측정척도와 전처리",
    summary:
      "명목·서열·등간·비율척도와 분석 전 데이터 변환의 기본을 익힙니다.",
    learningGoals: [
      "네 가지 측정척도를 구분한다.",
      "표준화와 정규화의 목적을 설명한다.",
    ],
    keyPoints: [
      "명목척도는 범주 구분만 가능하고 서열척도는 순서 정보까지 가진다.",
      "등간척도는 간격이 의미 있지만 절대적 0이 없고 비율척도는 절대적 0을 가진다.",
      "표준화는 평균 0, 표준편차 1로 변환하며 거리 기반 모델의 스케일 영향을 줄인다.",
    ],
    examTraps: [
      "등간척도 값의 비율은 의미가 없으므로 섭씨 20도가 10도의 두 배로 뜨겁다고 할 수 없다.",
      "범주형 변수를 숫자로 치환했다고 자동으로 연속형 변수가 되는 것은 아니다.",
    ],
    relatedTerms: ["명목척도", "서열척도", "표준화", "원-핫 인코딩"],
    questionIds: ["bda-q003"],
  }),
  lesson({
    id: "bda-s2-missing-outlier",
    subjectId: "bda-s2",
    order: 2,
    title: "결측값과 이상값",
    summary:
      "결측 메커니즘과 이상값 탐지·처리 선택이 분석에 미치는 영향을 정리합니다.",
    learningGoals: [
      "MCAR·MAR·MNAR을 구분한다.",
      "이상값 탐지와 처리 방법의 장단점을 평가한다.",
    ],
    keyPoints: [
      "MCAR은 결측 여부가 관측·미관측 값과 무관하고 MAR은 관측된 변수로 설명될 수 있다.",
      "IQR 규칙은 Q1-1.5×IQR 미만 또는 Q3+1.5×IQR 초과를 잠재 이상값으로 본다.",
      "삭제·대치·강건한 모델 선택은 결측 원인과 업무 의미를 확인한 뒤 결정해야 한다.",
    ],
    examTraps: [
      "이상값은 오류가 아니라 중요한 희귀 사건일 수도 있다.",
      "전체 데이터로 대치값을 계산한 뒤 분할하면 검증 데이터 정보가 학습에 누수된다.",
    ],
    relatedTerms: ["MCAR", "MAR", "MNAR", "IQR"],
  }),
  lesson({
    id: "bda-s2-sampling-pca",
    subjectId: "bda-s2",
    order: 3,
    title: "표본추출과 차원축소",
    summary:
      "확률표본추출과 주성분분석의 목적·가정을 구분합니다.",
    learningGoals: [
      "표본추출 방법을 상황에 맞게 선택한다.",
      "PCA의 주성분과 설명분산을 해석한다.",
    ],
    keyPoints: [
      "층화추출은 모집단을 동질적 층으로 나눈 뒤 각 층에서 표본을 추출한다.",
      "군집추출은 모집단을 군집으로 나누고 일부 군집을 선택해 조사한다.",
      "PCA는 서로 직교하며 분산을 최대화하는 새로운 축으로 데이터를 투영한다.",
    ],
    examTraps: [
      "PCA는 비지도 차원축소이므로 목표변수와의 관련성을 직접 최대화하지 않는다.",
      "변수 단위가 크게 다르면 PCA 전에 표준화를 고려해야 한다.",
    ],
    relatedTerms: ["층화추출", "군집추출", "PCA", "설명분산"],
  }),
  lesson({
    id: "bda-s2-statistics-distributions",
    subjectId: "bda-s2",
    order: 4,
    title: "기술통계와 확률분포",
    summary:
      "중심·산포 통계량과 대표 이산·연속 확률분포를 연결합니다.",
    learningGoals: [
      "분포에 맞는 기술통계량을 선택한다.",
      "대표 확률분포의 적용 조건을 설명한다.",
    ],
    keyPoints: [
      "평균은 모든 값의 영향을 받고 중앙값은 극단값에 상대적으로 강건하다.",
      "분산은 편차 제곱의 평균이며 표준편차는 원자료와 같은 단위를 가진다.",
      "이항분포는 독립적인 베르누이 시행의 성공 횟수, 포아송분포는 일정 구간의 사건 횟수를 모델링한다.",
    ],
    examTraps: [
      "표본분산에서 불편추정량을 구할 때는 보통 n이 아니라 n-1로 나눈다.",
      "상관관계가 0이어도 비선형 관계가 존재할 수 있다.",
    ],
    relatedTerms: ["중앙값", "분산", "이항분포", "정규분포"],
  }),
  lesson({
    id: "bda-s2-hypothesis-anova",
    subjectId: "bda-s2",
    order: 5,
    title: "가설검정과 분산분석",
    summary:
      "유의수준·p값·오류와 평균 차이 검정의 올바른 해석을 학습합니다.",
    learningGoals: [
      "가설검정의 의사결정 구조를 설명한다.",
      "t검정·카이제곱검정·ANOVA의 적용 대상을 구분한다.",
    ],
    keyPoints: [
      "제1종 오류는 참인 귀무가설을 기각하는 오류이며 그 최대 허용 확률을 유의수준으로 둔다.",
      "p값은 귀무가설이 참일 때 관측 결과 이상으로 극단적인 결과가 나올 확률이다.",
      "일원분산분석은 세 집단 이상 평균의 동일성을 한 번에 검정한다.",
    ],
    examTraps: [
      "p값은 귀무가설이 참일 확률이 아니다.",
      "ANOVA가 유의해도 어느 집단 사이가 다른지는 사후검정이 필요하다.",
    ],
    relatedTerms: ["유의수준", "p값", "제1종 오류", "ANOVA"],
    questionIds: ["bda-q004"],
  }),
  lesson({
    id: "bda-s3-model-variable",
    subjectId: "bda-s3",
    order: 1,
    title: "모델 설계와 변수 선택",
    summary:
      "분석 목적에 맞는 문제 유형·검증 설계·변수 선택 원칙을 정리합니다.",
    learningGoals: [
      "분류·회귀·군집 문제를 구분한다.",
      "변수 선택과 데이터 분할 시 누수를 예방한다.",
    ],
    keyPoints: [
      "지도학습은 목표변수를 이용하고 비지도학습은 목표변수 없이 구조를 탐색한다.",
      "필터법은 모델과 독립적인 통계량, 래퍼법은 후보 부분집합의 성능, 임베디드법은 학습 과정에서 변수를 선택한다.",
      "전처리와 변수 선택은 학습 데이터에서 적합한 뒤 검증·시험 데이터에 동일하게 적용한다.",
    ],
    examTraps: [
      "시험 데이터 성능을 보고 변수를 반복 선택하면 시험 세트가 검증 세트처럼 사용된다.",
      "변수 수가 많다고 항상 예측력이 높아지는 것은 아니다.",
    ],
    relatedTerms: ["지도학습", "필터법", "래퍼법", "데이터 누수"],
  }),
  lesson({
    id: "bda-s3-logistic-tree",
    subjectId: "bda-s3",
    order: 2,
    title: "로지스틱 회귀와 의사결정나무",
    summary:
      "분류 확률을 만드는 로지스틱 회귀와 규칙 기반 나무 모델을 비교합니다.",
    learningGoals: [
      "로지스틱 회귀계수와 오즈비를 해석한다.",
      "나무의 분할 기준과 가지치기 목적을 설명한다.",
    ],
    keyPoints: [
      "이항 로지스틱 회귀는 선형 예측자를 로지스틱 함수에 통과시켜 0과 1 사이 확률을 만든다.",
      "계수의 지수값은 다른 변수가 일정할 때 설명변수 한 단위 증가에 따른 오즈비다.",
      "의사결정나무는 지니 불순도·엔트로피 등의 감소가 큰 분할을 선택하며 가지치기로 복잡도를 제어한다.",
    ],
    examTraps: [
      "로지스틱 회귀의 원시 선형결합 값 자체가 확률은 아니다.",
      "깊은 나무는 훈련 데이터에 과적합하기 쉽다.",
    ],
    relatedTerms: ["로짓", "오즈비", "지니 불순도", "가지치기"],
    questionIds: ["bda-q005"],
  }),
  lesson({
    id: "bda-s3-svm-ann",
    subjectId: "bda-s3",
    order: 3,
    title: "SVM과 인공신경망",
    summary:
      "마진 최대화 분류와 다층 신경망 학습의 핵심 원리를 이해합니다.",
    learningGoals: [
      "SVM의 마진·커널 개념을 설명한다.",
      "신경망의 활성화함수와 역전파 역할을 설명한다.",
    ],
    keyPoints: [
      "SVM은 결정경계와 가장 가까운 표본인 서포트 벡터 사이의 마진을 최대화한다.",
      "커널 트릭은 원공간에서 직접 고차원 좌표를 계산하지 않고 비선형 경계를 구성하게 한다.",
      "신경망은 순전파로 출력을 만들고 손실의 기울기를 역전파해 가중치를 갱신한다.",
    ],
    examTraps: [
      "커널 선택과 C, 감마 같은 초매개변수는 성능과 과적합에 영향을 준다.",
      "은닉층에 선형 활성화함수만 반복하면 깊은 비선형 표현력이 생기지 않는다.",
    ],
    relatedTerms: ["서포트 벡터", "커널", "역전파", "활성화함수"],
  }),
  lesson({
    id: "bda-s3-ensemble-evaluation",
    subjectId: "bda-s3",
    order: 4,
    title: "앙상블과 모델 평가",
    summary:
      "배깅·부스팅·랜덤포레스트의 차이와 일반화 성능 평가를 연결합니다.",
    learningGoals: [
      "배깅과 부스팅의 학습 방식을 비교한다.",
      "검증 데이터를 이용한 모델 선택 원칙을 설명한다.",
    ],
    keyPoints: [
      "배깅은 부트스트랩 표본으로 여러 모델을 병렬 학습해 평균 또는 투표한다.",
      "부스팅은 앞선 모델의 오류를 보완하도록 약한 학습기를 순차적으로 결합한다.",
      "랜덤포레스트는 배깅에 노드 분할 시 무작위 변수 후보 선택을 결합해 나무 간 상관을 낮춘다.",
    ],
    examTraps: [
      "부스팅은 이전 오차에 연속적으로 의존하므로 일반적인 배깅처럼 완전 병렬 학습하지 않는다.",
      "훈련 정확도만으로 서로 다른 복잡도의 모델을 선택하면 일반화 성능을 과대평가할 수 있다.",
    ],
    relatedTerms: ["배깅", "부스팅", "랜덤포레스트", "일반화"],
    questionIds: ["bda-q006"],
  }),
  lesson({
    id: "bda-s3-cluster-timeseries",
    subjectId: "bda-s3",
    order: 5,
    title: "군집·연관·시계열 분석",
    summary:
      "비지도 패턴 탐색과 시간 의존성을 다루는 대표 기법을 비교합니다.",
    learningGoals: [
      "군집과 연관분석 지표를 해석한다.",
      "시계열 정상성과 자기상관의 의미를 설명한다.",
    ],
    keyPoints: [
      "k-평균은 군집 내 제곱거리 합을 줄이도록 중심과 할당을 반복 갱신한다.",
      "연관규칙의 지지도는 동시 발생 비율, 신뢰도는 조건부 확률, 향상도는 독립 대비 결합 강도를 나타낸다.",
      "정상 시계열은 평균·분산과 자기공분산 구조가 시간에 따라 안정적이라는 가정과 관련된다.",
    ],
    examTraps: [
      "k-평균은 초기 중심과 변수 스케일, 이상값에 영향을 받는다.",
      "향상도가 1에 가까우면 두 항목의 발생이 독립에 가깝다.",
    ],
    relatedTerms: ["k-평균", "향상도", "정상성", "자기상관"],
  }),
  lesson({
    id: "bda-s4-regression-classification-metrics",
    subjectId: "bda-s4",
    order: 1,
    title: "회귀·분류 평가지표",
    summary:
      "문제와 오류 비용에 맞는 회귀·분류 평가지표를 선택합니다.",
    learningGoals: [
      "MAE·MSE·RMSE의 차이를 설명한다.",
      "정밀도·재현율·F1·AUC를 상황에 맞게 선택한다.",
    ],
    keyPoints: [
      "MAE는 절대오차 평균, MSE는 제곱오차 평균, RMSE는 MSE의 제곱근이다.",
      "정밀도는 양성 예측 중 실제 양성 비율이고 재현율은 실제 양성 중 찾아낸 비율이다.",
      "ROC-AUC는 여러 임계값에서 거짓양성률 대비 참양성률의 순위 구분 능력을 요약한다.",
    ],
    examTraps: [
      "불균형 데이터에서는 정확도 하나만으로 모델을 평가하면 중요한 오류를 가릴 수 있다.",
      "RMSE와 MAE는 모두 낮을수록 좋지만 RMSE가 큰 오차에 더 민감하다.",
    ],
    relatedTerms: ["RMSE", "정밀도", "재현율", "ROC-AUC"],
    questionIds: ["bda-q007"],
  }),
  lesson({
    id: "bda-s4-crossvalidation-overfit",
    subjectId: "bda-s4",
    order: 2,
    title: "교차검증과 과적합",
    summary:
      "훈련·검증·시험 데이터의 역할과 편향-분산 균형을 학습합니다.",
    learningGoals: [
      "k-겹 교차검증 절차를 설명한다.",
      "과적합의 징후와 완화 방법을 진단한다.",
    ],
    keyPoints: [
      "k-겹 교차검증은 데이터를 k개 폴드로 나누어 각 폴드를 한 번씩 검증에 사용한다.",
      "훈련 성능은 매우 좋고 검증 성능이 나쁘면 높은 분산과 과적합을 의심한다.",
      "시험 세트는 모델과 초매개변수 선택이 끝난 뒤 최종 일반화 성능을 한 번 평가하는 데 사용한다.",
    ],
    examTraps: [
      "시간 순서가 있는 데이터에 일반 무작위 k-겹을 적용하면 미래 정보가 과거 학습에 들어갈 수 있다.",
      "교차검증 전에 전체 데이터로 스케일링하면 폴드 간 정보 누수가 생긴다.",
    ],
    relatedTerms: ["k-겹 교차검증", "과적합", "편향-분산", "시험 세트"],
    questionIds: ["bda-q008"],
  }),
  lesson({
    id: "bda-s4-regularization-optimization",
    subjectId: "bda-s4",
    order: 3,
    title: "규제·초매개변수·최적화",
    summary:
      "모델 복잡도 제어와 탐색·최적화의 역할을 구분합니다.",
    learningGoals: [
      "L1·L2 규제의 효과를 비교한다.",
      "모델 매개변수와 초매개변수를 구분한다.",
    ],
    keyPoints: [
      "L1 규제는 절댓값 패널티로 일부 계수를 정확히 0으로 만들 수 있다.",
      "L2 규제는 제곱 패널티로 큰 계수를 줄이며 상관된 변수의 영향을 분산하는 경향이 있다.",
      "학습률·나무 깊이·규제 강도는 학습 전에 정해 탐색하는 초매개변수다.",
    ],
    examTraps: [
      "규제 강도가 지나치게 크면 과소적합이 발생할 수 있다.",
      "시험 세트 성능을 기준으로 초매개변수를 선택하면 최종 성능 추정이 낙관적으로 편향된다.",
    ],
    relatedTerms: ["L1", "L2", "그리드 탐색", "학습률"],
  }),
  lesson({
    id: "bda-s4-xai",
    subjectId: "bda-s4",
    order: 4,
    title: "설명가능한 AI",
    summary:
      "전역·국소 설명과 변수 중요도 해석 시 주의점을 학습합니다.",
    learningGoals: [
      "전역 설명과 개별 예측 설명을 구분한다.",
      "SHAP·LIME·PDP의 해석 범위를 설명한다.",
    ],
    keyPoints: [
      "전역 설명은 모델 전체 행동을, 국소 설명은 특정 관측치의 예측 근거를 다룬다.",
      "SHAP은 협력게임의 샤플리값을 바탕으로 예측과 기준값의 차이를 변수 기여도로 배분한다.",
      "PDP는 다른 변수에 대해 평균화하며 특정 변수 변화에 따른 평균 예측 변화를 보여준다.",
    ],
    examTraps: [
      "변수 중요도와 인과효과는 같은 개념이 아니다.",
      "강하게 상관된 변수에서는 개별 중요도나 PDP 해석이 왜곡될 수 있다.",
    ],
    relatedTerms: ["SHAP", "LIME", "PDP", "전역 설명"],
  }),
  lesson({
    id: "bda-s4-visualization-deployment",
    subjectId: "bda-s4",
    order: 5,
    title: "시각화·배포·모니터링",
    summary:
      "분석 결과 전달부터 운영 중 성능·데이터 변화 감시까지 연결합니다.",
    learningGoals: [
      "데이터 유형에 맞는 시각화를 선택한다.",
      "배포 후 드리프트와 성능 저하를 구분해 감시한다.",
    ],
    keyPoints: [
      "시각화는 비교·분포·관계·구성 등 전달 목적에 맞게 선택하고 축과 단위를 명확히 표시한다.",
      "데이터 드리프트는 입력 분포 변화, 개념 드리프트는 입력과 목표 사이 관계 변화를 뜻한다.",
      "운영 모델은 입력 품질, 예측 분포, 실제 성능, 지연시간과 오류율을 함께 모니터링한다.",
    ],
    examTraps: [
      "이중 축이나 잘린 축은 차이를 과장할 수 있으므로 해석 맥락을 명확히 해야 한다.",
      "입력 분포가 변하지 않아도 목표와의 관계가 달라지면 개념 드리프트가 발생할 수 있다.",
    ],
    relatedTerms: ["데이터 드리프트", "개념 드리프트", "대시보드", "모델 모니터링"],
  }),
];

function question(
  value: Omit<
    BdaQuestion,
    "sourceLabel" | "sourceType" | "evidenceGrade" | "reviewStatus" | "contentStatus"
  >,
): BdaQuestion {
  return {
    ...value,
    sourceLabel: "Notion 이론 기반 자체 제작 개념 확인문제",
    sourceType: "self_authored",
    evidenceGrade: "B",
    reviewStatus: "verified",
    contentStatus: "published",
  };
}

const questions: BdaQuestion[] = [
  question({
    id: "bda-q001",
    subjectId: "bda-s1",
    lessonId: "bda-s1-data-dikw",
    stem: "DIKW 계층을 낮은 단계에서 높은 단계 순으로 바르게 나열한 것은?",
    choices: [
      { id: "a", order: 1, text: "데이터 → 정보 → 지식 → 지혜", feedback: "관찰값에 맥락과 규칙, 판단이 더해지는 올바른 순서입니다." },
      { id: "b", order: 2, text: "정보 → 데이터 → 지혜 → 지식", feedback: "정보는 원시 데이터에 의미를 부여한 뒤의 단계입니다." },
      { id: "c", order: 3, text: "지식 → 정보 → 데이터 → 지혜", feedback: "지식은 정보에서 규칙과 패턴을 이해한 단계입니다." },
      { id: "d", order: 4, text: "데이터 → 지식 → 정보 → 지혜", feedback: "데이터와 지식 사이에는 의미가 부여된 정보 단계가 놓입니다." },
    ],
    correctChoiceId: "a",
    explanation: "DIKW는 Data, Information, Knowledge, Wisdom의 순서로 데이터가 의사결정 가능한 지혜로 발전하는 구조입니다.",
  }),
  question({
    id: "bda-q002",
    subjectId: "bda-s1",
    lessonId: "bda-s1-governance-quality",
    stem: "k-익명성에 대한 설명으로 가장 적절한 것은?",
    choices: [
      { id: "a", order: 1, text: "모든 민감값을 암호화한다.", feedback: "암호화와 k-익명성은 목적과 방법이 다릅니다." },
      { id: "b", order: 2, text: "준식별자 조합이 같은 레코드를 최소 k개 확보한다.", feedback: "일반화·억제로 재식별 가능성을 낮추는 핵심 조건입니다." },
      { id: "c", order: 3, text: "각 집단의 민감값을 반드시 서로 다르게 만든다.", feedback: "이는 민감값 다양성을 다루는 l-다양성과 더 가깝습니다." },
      { id: "d", order: 4, text: "원본 데이터와의 통계적 차이를 0으로 만든다.", feedback: "익명화는 정보 손실과 보호 수준 사이의 균형을 고려합니다." },
    ],
    correctChoiceId: "b",
    explanation: "k-익명성은 준식별자 속성 조합만으로 한 개인을 k명 미만으로 좁히기 어렵게 만듭니다.",
  }),
  question({
    id: "bda-q003",
    subjectId: "bda-s2",
    lessonId: "bda-s2-scales-preprocessing",
    stem: "범주를 구분할 수 있지만 순서 정보는 없는 측정척도는?",
    choices: [
      { id: "a", order: 1, text: "명목척도", feedback: "이름이나 범주만 구분하며 대소·순서를 정의하지 않습니다." },
      { id: "b", order: 2, text: "서열척도", feedback: "서열척도에는 범주 사이의 순서 정보가 있습니다." },
      { id: "c", order: 3, text: "등간척도", feedback: "등간척도는 순서와 동일 간격 정보를 가집니다." },
      { id: "d", order: 4, text: "비율척도", feedback: "비율척도는 절대적 0과 비율 해석이 가능합니다." },
    ],
    correctChoiceId: "a",
    explanation: "명목척도는 성별, 혈액형처럼 범주만 식별하며 순서나 간격에는 의미가 없습니다.",
  }),
  question({
    id: "bda-q004",
    subjectId: "bda-s2",
    lessonId: "bda-s2-hypothesis-anova",
    stem: "가설검정의 p값에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", order: 1, text: "귀무가설이 참일 확률이다.", feedback: "p값은 가설 자체의 사후확률이 아닙니다." },
      { id: "b", order: 2, text: "대립가설이 틀릴 확률이다.", feedback: "대립가설의 진위를 직접 확률로 표현하지 않습니다." },
      { id: "c", order: 3, text: "귀무가설이 참일 때 관측값 이상으로 극단적인 결과가 나올 확률이다.", feedback: "검정통계량의 꼬리확률에 관한 올바른 해석입니다." },
      { id: "d", order: 4, text: "표본이 모집단을 대표하지 않을 확률이다.", feedback: "표본 대표성은 표집 설계의 문제이며 p값 정의가 아닙니다." },
    ],
    correctChoiceId: "c",
    explanation: "p값이 유의수준보다 작으면 귀무가설 아래에서 관측 결과가 충분히 이례적이라고 보고 귀무가설을 기각합니다.",
  }),
  question({
    id: "bda-q005",
    subjectId: "bda-s3",
    lessonId: "bda-s3-logistic-tree",
    stem: "이항 로지스틱 회귀가 기본적으로 예측하는 값의 범위는?",
    choices: [
      { id: "a", order: 1, text: "음의 무한대부터 양의 무한대", feedback: "이는 로짓 변환 전 선형 예측자의 범위입니다." },
      { id: "b", order: 2, text: "0 이상 1 이하", feedback: "로지스틱 함수를 거쳐 사건 발생 확률로 해석합니다." },
      { id: "c", order: 3, text: "0 이상의 모든 실수", feedback: "확률은 1을 초과할 수 없습니다." },
      { id: "d", order: 4, text: "-1 이상 1 이하", feedback: "상관계수와 혼동한 범위입니다." },
    ],
    correctChoiceId: "b",
    explanation: "로지스틱 함수는 임의의 실수인 선형 예측자를 0과 1 사이 값으로 변환합니다.",
  }),
  question({
    id: "bda-q006",
    subjectId: "bda-s3",
    lessonId: "bda-s3-ensemble-evaluation",
    stem: "배깅과 부스팅의 차이에 대한 설명으로 가장 적절한 것은?",
    choices: [
      { id: "a", order: 1, text: "배깅은 보통 병렬 학습, 부스팅은 앞선 오류를 보완하는 순차 학습이다.", feedback: "두 앙상블의 대표적인 학습 구조 차이입니다." },
      { id: "b", order: 2, text: "배깅만 여러 모델을 결합한다.", feedback: "부스팅도 여러 약한 학습기를 결합합니다." },
      { id: "c", order: 3, text: "부스팅은 항상 과적합이 발생하지 않는다.", feedback: "부스팅도 설정과 데이터에 따라 과적합할 수 있습니다." },
      { id: "d", order: 4, text: "두 방법 모두 같은 학습 표본과 같은 가중치를 반드시 사용한다.", feedback: "표본화와 가중 방식이 서로 다릅니다." },
    ],
    correctChoiceId: "a",
    explanation: "배깅은 부트스트랩 표본의 독립적 모델을 결합해 분산을 줄이고, 부스팅은 앞선 오류에 집중하며 순차적으로 모델을 더합니다.",
  }),
  question({
    id: "bda-q007",
    subjectId: "bda-s4",
    lessonId: "bda-s4-regression-classification-metrics",
    stem: "실제 양성 사례를 가능한 한 놓치지 않는 것이 가장 중요한 경우 우선 확인할 지표는?",
    choices: [
      { id: "a", order: 1, text: "재현율", feedback: "실제 양성 중 모델이 양성으로 찾아낸 비율입니다." },
      { id: "b", order: 2, text: "정밀도", feedback: "정밀도는 양성으로 예측한 사례의 정확성을 봅니다." },
      { id: "c", order: 3, text: "특이도", feedback: "특이도는 실제 음성을 음성으로 판별한 비율입니다." },
      { id: "d", order: 4, text: "결정계수", feedback: "결정계수는 주로 회귀모형의 설명력을 나타냅니다." },
    ],
    correctChoiceId: "a",
    explanation: "거짓음성의 비용이 큰 문제에서는 실제 양성을 얼마나 많이 찾아냈는지 나타내는 재현율을 중요하게 봅니다.",
  }),
  question({
    id: "bda-q008",
    subjectId: "bda-s4",
    lessonId: "bda-s4-crossvalidation-overfit",
    stem: "교차검증에서 정보 누수를 막는 올바른 전처리 방법은?",
    choices: [
      { id: "a", order: 1, text: "전체 데이터의 평균과 표준편차로 먼저 표준화한다.", feedback: "검증 폴드의 분포 정보가 학습 전처리에 들어갑니다." },
      { id: "b", order: 2, text: "각 반복의 학습 폴드로 전처리기를 적합하고 검증 폴드에는 변환만 적용한다.", feedback: "검증 폴드의 정보를 학습 과정에서 차단하는 올바른 방식입니다." },
      { id: "c", order: 3, text: "검증 폴드로 결측 대치값을 계산해 학습 폴드에 적용한다.", feedback: "검증 정보가 학습 폴드에 역으로 누수됩니다." },
      { id: "d", order: 4, text: "시험 세트 성능이 가장 좋아질 때까지 전처리를 반복 조정한다.", feedback: "시험 세트를 모델 선택에 사용하면 최종 평가가 편향됩니다." },
    ],
    correctChoiceId: "b",
    explanation: "스케일링·대치·변수 선택은 각 교차검증 반복의 학습 폴드에서만 적합하고 검증 폴드에는 학습된 변환을 적용해야 합니다.",
  }),
];

export const bdaContent: BdaContent = {
  formatVersion: 1,
  generatedAt: "2026-07-24T22:30:00+09:00",
  sourceHubUrl: SOURCE_HUB,
  subjects: [
    {
      id: "bda-s1",
      order: 1,
      title: "빅데이터 분석기획",
      shortTitle: "분석기획",
      description: "데이터와 빅데이터의 이해부터 거버넌스, 분석 과제, 수집·저장까지 다룹니다.",
      accent: "#0f766e",
      sourceRefs: [subjectSources["bda-s1"]],
    },
    {
      id: "bda-s2",
      order: 2,
      title: "빅데이터 탐색",
      shortTitle: "탐색",
      description: "전처리, 표본추출, 기술통계, 확률분포와 가설검정의 기초를 다룹니다.",
      accent: "#2563eb",
      sourceRefs: [subjectSources["bda-s2"]],
    },
    {
      id: "bda-s3",
      order: 3,
      title: "빅데이터 모델링",
      shortTitle: "모델링",
      description: "모델 설계, 지도·비지도학습, 앙상블과 시계열 분석을 다룹니다.",
      accent: "#7c3aed",
      sourceRefs: [subjectSources["bda-s3"]],
    },
    {
      id: "bda-s4",
      order: 4,
      title: "빅데이터 결과 해석",
      shortTitle: "결과 해석",
      description: "평가지표, 교차검증, 규제, 설명가능성, 배포와 모니터링을 다룹니다.",
      accent: "#c2410c",
      sourceRefs: [subjectSources["bda-s4"]],
    },
  ],
  lessons,
  questions,
  notes: [
    "이 MVP는 사용자 제공 Notion 이론을 학습용으로 구조화한 베타 콘텐츠입니다.",
    "문제는 공식 기출이 아니라 이론 이해를 확인하기 위해 자체 제작했습니다.",
    "기존 대화에서 언급된 엑셀 문제은행 원본은 현재 작업공간에서 확인되지 않아 포함하지 않았습니다.",
  ],
};
