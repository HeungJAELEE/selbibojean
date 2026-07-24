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
  "sourceRefs" | "contentStatus" | "questionIds"
> & {
  questionIds?: string[];
};

function lesson(seed: LessonSeed): BdaLesson {
  return {
    ...seed,
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
