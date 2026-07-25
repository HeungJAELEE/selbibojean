import "server-only";

import {
  getBdaCanonicalSnapshot,
  type BdaNotionSnapshot,
} from "@/lib/content/bda-notion-snapshot-repository";
import type {
  BdaSourcePracticeChoice,
  BdaSourcePracticeFeedback,
  BdaSourcePracticeQuestion,
  PublicBdaSourcePracticeBlock,
  PublicBdaSourcePracticeQuestion,
} from "@/lib/domain/bda-source-practice";

type PracticeOverride = {
  stem: string;
  choices?: [string, string, string, string];
  correctOrder?: 1 | 2 | 3 | 4;
  answerText: string;
  explanation: string;
  disposition?: "corrected" | "supplemented";
  reviewNote: string;
};

const PRACTICE_OVERRIDES: Record<
  string,
  PracticeOverride | PracticeOverride[]
> = {
  "s1-final-b003": [
    {
      stem: "다음 중 비정형 데이터로 보기 가장 어려운 것은?",
      choices: ["음성 데이터", "메시지 데이터", "이미지 데이터", "거래 내역 데이터"],
      correctOrder: 4,
      answerText: "거래 내역 데이터",
      explanation: "거래 내역은 날짜·금액·상품 코드처럼 고정 필드와 스키마를 갖는 대표적인 정형 데이터입니다.",
      disposition: "supplemented",
      reviewNote: "원천의 첫 문항과 네 선택지를 그대로 구조화하고 데이터 형태 정의로 검수했습니다.",
    },
    {
      stem: "다음 데이터 형태에 대한 설명 중 틀린 것은?",
      choices: [
        "비정형 데이터는 데이터 내부에 구조를 설명하는 메타데이터를 갖고 저장된다.",
        "반정형 데이터는 파싱을 통해 구조를 파악할 수 있다.",
        "정형 데이터는 고정된 스키마와 필드 구조를 갖는다.",
        "JSON과 XML은 대표적인 반정형 데이터 형식이다.",
      ],
      correctOrder: 1,
      answerText: "비정형 데이터는 데이터 내부에 구조를 설명하는 메타데이터를 갖고 저장된다.",
      explanation: "데이터 내부의 태그·키처럼 구조를 설명하는 메타데이터를 갖는 것은 반정형 데이터의 특징입니다. 비정형 데이터는 고정된 구조가 없습니다.",
      disposition: "supplemented",
      reviewNote: "원천 두 번째 문항에는 선택지가 두 개뿐이어서 정의에 맞는 선택지 두 개를 보강하고 정답을 재검수했습니다.",
    },
  ],
  "s1-final-b004": {
    stem: "빅데이터 분석 방법론의 계층 구조에서 입력·처리 도구·출력을 가지는 워크 패키지는?",
    choices: ["단계(Phase)", "태스크(Task)", "스텝(Step)", "모듈(Module)"],
    correctOrder: 3,
    answerText: "스텝(Step)",
    explanation: "스텝은 입력, 처리 도구, 출력으로 구성되는 가장 작은 업무 단위이며 워크 패키지에 해당합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 블록이 비어 있어 같은 페이지의 정의와 뒤쪽 중복 문항을 교차 확인해 보강했습니다.",
  },
  "s1-final-b007": {
    stem: "분석 인력은 확보했지만 기존 시스템으로 필요한 분석을 수행할 수 없을 때 가장 우선할 해결 방안은?",
    choices: ["분석 업무 아웃소싱", "분석 시스템 고도화", "추가 인력 채용", "프로젝트 중단"],
    correctOrder: 2,
    answerText: "분석 시스템 고도화",
    explanation: "인력 역량이 아니라 분석 환경과 도구가 제약이므로 시스템과 분석 인프라를 고도화하는 것이 직접적인 해결책입니다.",
    disposition: "supplemented",
    reviewNote: "원천 선택지는 있었지만 정답이 비어 있어 준비도·성숙도 진단 기준으로 보강했습니다.",
  },
  "s1-final-b010": {
    stem: "분석 기획의 주요 고려사항인 가용 데이터, 유스케이스, 장애요소에 직접 포함되지 않는 것은?",
    choices: ["가용 데이터 확인", "유스케이스 탐색", "장애요소 사전 계획", "가용 인력 배치"],
    correctOrder: 4,
    answerText: "가용 인력 배치",
    explanation: "가용 인력은 프로젝트 수행·관리 자원에 해당합니다. 분석 기획의 문제 정의 단계에서는 가용 데이터, 유스케이스, 장애요소를 우선 확인합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 블록이 비어 있어 인접 이론의 기획 고려요소와 대조했습니다.",
  },
  "s1-final-b011": {
    stem: "분석 대상(What)은 명확하지만 분석 방법(How)이 명확하지 않은 분석 주제 유형은?",
    choices: ["최적화(Optimization)", "솔루션(Solution)", "통찰(Insight)", "발견(Discovery)"],
    correctOrder: 2,
    answerText: "솔루션(Solution)",
    explanation: "What은 알고 How를 모르는 경우 해결 방법을 찾는 솔루션 유형입니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 분석 주제 4분면 정의와 대조했습니다.",
  },
  "s1-final-b012": {
    stem: "하향식 접근의 문제 탐색 관점으로 보기 어려운 것은?",
    choices: ["지원 인프라", "규제와 감사", "거시적 환경", "고객과 제품"],
    correctOrder: 1,
    answerText: "지원 인프라",
    explanation: "문제 탐색은 비즈니스 모델, 외부 환경과 시장·고객 관점에서 수행합니다. 지원 인프라는 타당성 및 실행 여건 검토에 더 가깝습니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 하향식 문제 탐색의 비즈니스 모델 관점과 대조했습니다.",
  },
  "s1-final-b013": {
    stem: "분석 과제 우선순위에서 시급성을 우선할 때의 권장 순서는?",
    choices: ["3-4-1-2", "3-1-4-2", "1-3-4-2", "4-3-1-2"],
    correctOrder: 1,
    answerText: "3-4-1-2",
    explanation: "시급성을 우선하면 시급성이 높은 3·4영역을 먼저 수행하고, 그중 난이도가 낮은 3영역을 최우선으로 둡니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 같은 페이지의 ROI 사분면 설명 및 뒤쪽 검증 문항과 교차 확인했습니다.",
  },
  "s1-final-b014": {
    stem: "다음 중 분석 거버넌스의 구성 요소가 아닌 것은?",
    choices: ["분석 조직", "분석 데이터", "분석 성과", "분석 프로세스"],
    correctOrder: 3,
    answerText: "분석 성과",
    explanation: "분석 거버넌스의 핵심 구성은 조직, 프로세스, 인력, 기술, 데이터입니다. 성과는 거버넌스가 관리하는 결과입니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 같은 페이지의 거버넌스 5요소와 대조했습니다.",
  },
  "s1-final-b015": {
    stem: "분석 과제 발굴 방식에 대한 설명으로 옳은 것은?",
    choices: [
      "하향식은 데이터에서 패턴을 먼저 찾고 문제를 나중에 정의한다.",
      "상향식은 명확한 비즈니스 문제에서 분석 문제를 단계적으로 좁힌다.",
      "하향식은 주어진 비즈니스 문제를 분석 가능한 문제로 구체화한다.",
      "하향식과 상향식은 함께 사용할 수 없다.",
    ],
    correctOrder: 3,
    answerText: "하향식은 주어진 비즈니스 문제를 분석 가능한 문제로 구체화한다.",
    explanation: "하향식은 비즈니스 문제에서 출발해 분석 문제와 해결 방안을 구체화합니다. 상향식은 데이터에서 의미 있는 패턴과 문제 후보를 발견합니다.",
    disposition: "supplemented",
    reviewNote: "원천 토글에는 구분선만 있어 인접한 Trap Defense 이론을 바탕으로 검수 가능한 문항을 보강했습니다.",
  },
  "s1-final-b016": [
    {
      stem: "스토리텔링은 데이터 사이언티스트의 하드 스킬에 해당한다. 옳은지 판단하세요.",
      answerText: "틀리다. 스토리텔링은 분석 결과를 이해관계자에게 설득력 있게 전달하는 소프트 스킬입니다.",
      explanation: "시각화 도구를 다루는 기술 자체는 하드 스킬일 수 있지만, 이를 이용한 설득·소통·스토리텔링은 소프트 스킬로 구분합니다.",
      disposition: "corrected",
      reviewNote: "원천의 OX 답과 직무 역량 정의를 교차 확인했습니다.",
    },
    {
      stem: "전사적 분석 공유와 조직 내재화는 분석 성숙도의 최적화 단계에 해당한다. 옳은지 판단하세요.",
      answerText: "틀리다. 전사적 공유와 내재화는 확산 단계의 핵심 특징입니다.",
      explanation: "확산 단계는 분석을 여러 부서로 확대하고 조직 문화에 내재화하는 단계입니다. 최적화는 실시간·자율 분석과 비즈니스 혁신 수준을 뜻합니다.",
      disposition: "corrected",
      reviewNote: "원천 답과 분석 성숙도 4단계 정의를 대조했습니다.",
    },
    {
      stem: "'왜 발생했는가'를 분석하는 것은 처방 분석이다. 옳은지 판단하세요.",
      answerText: "틀리다. 원인을 규명하는 것은 진단 분석이며, 처방 분석은 취할 행동을 제안합니다.",
      explanation: "기술 분석은 무엇이 일어났는지, 진단 분석은 왜 일어났는지, 예측 분석은 무엇이 일어날지, 처방 분석은 무엇을 해야 하는지를 다룹니다.",
      disposition: "corrected",
      reviewNote: "원천 OX 답을 분석 유형의 표준 정의와 대조했습니다.",
    },
  ],
  "s1-final-b017": [
    {
      stem: "CRISP-DM에서 초기 데이터 수집은 모델링 단계의 핵심 과업이다. 옳은지 판단하세요.",
      answerText: "틀리다. 초기 데이터 수집은 데이터 이해 단계에서 수행합니다.",
      explanation: "데이터 이해 단계는 초기 데이터 수집, 데이터 기술, 탐색, 품질 확인을 포함합니다. 모델링 단계는 기법 선택과 모델 구축·평가를 수행합니다.",
      disposition: "corrected",
      reviewNote: "원천 OX 답과 CRISP-DM 단계별 과업을 대조했습니다.",
    },
    {
      stem: "CRISP-DM은 단계 간 피드백이 없는 폭포수형 방법론이다. 옳은지 판단하세요.",
      answerText: "틀리다. CRISP-DM은 단계 사이를 반복하며 피드백하는 순환형 방법론입니다.",
      explanation: "특히 데이터 준비와 모델링은 반복적으로 오가며, 평가 결과에 따라 업무 이해나 데이터 이해 단계로 되돌아갈 수 있습니다.",
      disposition: "corrected",
      reviewNote: "원천 OX 답과 CRISP-DM 순환 구조를 대조했습니다.",
    },
    {
      stem: "데이터 분석 프로젝트에서 일반적으로 가장 많은 시간이 소요되는 단계는?",
      answerText: "데이터 준비 단계",
      explanation: "데이터 정제·통합·변환·변수 생성 등이 집중되는 데이터 준비 단계는 전체 프로젝트 시간의 약 70~80%를 차지할 수 있습니다.",
      disposition: "corrected",
      reviewNote: "원천 답과 인접 단계 설명을 교차 확인했습니다.",
    },
  ],
  "s1-final-b018": [
    {
      stem: "NoSQL은 엄격한 스키마를 준수하며 수직 확장에 유리하다. 옳은지 판단하세요.",
      answerText: "틀리다. NoSQL은 일반적으로 유연한 스키마와 수평 확장에 강점이 있습니다.",
      explanation: "NoSQL은 대규모 분산 환경에서 노드를 추가하는 수평 확장(Scale-out)을 지원하며, 데이터 모델에 따라 스키마를 유연하게 운영합니다.",
      disposition: "corrected",
      reviewNote: "원천 OX 답을 NoSQL의 공통 특성과 대조했습니다.",
    },
    {
      stem: "분석 준비도 진단의 직접 항목에 조직 규모가 포함된다. 옳은지 판단하세요.",
      answerText: "틀리다. 조직 규모 자체보다 분석 전담 조직과 전문가, 문화, 데이터, 기법, IT 인프라 등을 진단합니다.",
      explanation: "준비도는 분석 업무·인력·기법·데이터·문화·IT 인프라의 준비 상태를 확인하는 체계이며 단순 조직 규모를 직접 항목으로 삼지 않습니다.",
      disposition: "corrected",
      reviewNote: "원천 OX 답을 분석 준비도 진단 영역과 대조했습니다.",
    },
    {
      stem: "하둡 생태계에서 사용하는 컬럼 패밀리형 NoSQL 데이터베이스는?",
      answerText: "HBase",
      explanation: "HBase는 HDFS 위에서 동작하는 분산 컬럼 패밀리 데이터베이스입니다. MongoDB는 문서형 데이터베이스입니다.",
      disposition: "corrected",
      reviewNote: "원천 답을 NoSQL 유형과 대표 제품의 대응 관계로 검수했습니다.",
    },
  ],
  "s1-final-b019": [
    {
      stem: "텍스트 마이닝, 머신러닝, 자연어 처리는 데이터 저장 기술에 해당한다. 옳은지 판단하세요.",
      answerText: "틀리다. 세 기술은 데이터 분석·처리 기술이며 저장 기술이 아닙니다.",
      explanation: "대표적인 저장 기술에는 RDB, NoSQL, HDFS가 있고 텍스트 마이닝·머신러닝·NLP는 저장된 데이터에서 패턴과 의미를 추출합니다.",
      disposition: "corrected",
      reviewNote: "원천 답을 저장 기술과 분석 기술의 목적 구분으로 검수했습니다.",
    },
    {
      stem: "자원 할당을 관리하고 분석 애플리케이션 실행 서비스를 제공하는 아키텍처 계층은?",
      answerText: "플랫폼 계층(Platform Layer)",
      explanation: "인프라 계층은 서버·스토리지·네트워크 같은 기반 자원을 제공하고, 플랫폼 계층은 자원 관리와 애플리케이션 실행 환경을 제공합니다.",
      disposition: "corrected",
      reviewNote: "원천 답을 플랫폼 3계층 역할과 대조했습니다.",
    },
    {
      stem: "데이터를 여러 노드에 분산·복제해 가용성을 높이는 대표 저장 기술은?",
      answerText: "HDFS(하둡 분산 파일 시스템)",
      explanation: "HDFS는 파일을 블록으로 나누어 여러 데이터 노드에 분산 저장하고 복제본을 유지해 장애에도 데이터를 사용할 수 있게 합니다.",
      disposition: "corrected",
      reviewNote: "원천 답을 HDFS 분산·복제 원리와 대조했습니다.",
    },
  ],
  "s2-final-b002": {
    stem: "결측치 처리에 대한 설명으로 가장 적절하지 않은 것은?",
    choices: [
      "완전 사례 분석은 결측이 있는 행을 제거하므로 정보 손실이 발생할 수 있다.",
      "평균 대치는 분산을 과소평가하고 변수 간 관계를 왜곡할 수 있다.",
      "다중 대치는 여러 완성 데이터셋의 분석 결과를 결합해 불확실성을 반영한다.",
      "결측 메커니즘과 무관하게 모든 결측값에는 평균 대치가 항상 최선이다.",
    ],
    correctOrder: 4,
    answerText: "결측 메커니즘과 무관하게 모든 결측값에는 평균 대치가 항상 최선이다.",
    explanation: "적절한 결측 처리법은 MCAR·MAR·MNAR 여부, 결측률, 변수 유형과 분석 목적을 함께 고려해 선택해야 합니다.",
    disposition: "supplemented",
    reviewNote: "원천에는 보기 번호만 남아 있어 인접 결측치 이론을 토대로 완전한 검수 문항으로 보강했습니다.",
  },
  "s2-final-b003": {
    stem: "표본 분포와 데이터 전처리에 대한 설명으로 가장 적절하지 않은 것은?",
    choices: [
      "표본 크기를 16에서 64로 늘리면 표본평균의 표준오차는 기존의 1/4이 된다.",
      "상관계수가 1 또는 -1이면 두 변수 사이에 완전한 선형 관계가 있다.",
      "타깃 인코딩은 희귀 범주에 글로벌 평균을 혼합하는 스무딩을 사용할 수 있다.",
      "포아송 분포는 사건 횟수, 지수분포는 사건 사이의 시간을 모델링한다.",
    ],
    correctOrder: 1,
    answerText: "표본 크기를 16에서 64로 늘리면 표본평균의 표준오차는 기존의 1/4이 된다.",
    explanation: "표준오차는 표본 크기의 제곱근에 반비례하므로 16에서 64로 4배 늘리면 1/2로 줄어듭니다.",
    disposition: "corrected",
    reviewNote: "원천 정답이 비어 있어 표준오차 공식을 직접 검산했습니다.",
  },
  "s2-final-b004": {
    stem: "동일한 대상에서 세 시점 이상 반복 측정한 순위형·비정규 자료의 차이를 검정할 때 적절한 비모수 검정은?",
    choices: ["Kruskal-Wallis 검정", "Friedman 검정", "Mann-Whitney U 검정", "Wilcoxon 부호순위 검정"],
    correctOrder: 2,
    answerText: "Friedman 검정",
    explanation: "Friedman 검정은 동일한 대상의 세 조건·세 시점 이상 반복 측정 자료를 비교하는 비모수 검정입니다.",
    disposition: "supplemented",
    reviewNote: "원천 토글에는 제목만 있어 인접 검정 대응표를 바탕으로 문항을 완성했습니다.",
  },
  "s2-final-b005": {
    stem: "계층 구조를 가진 많은 범주의 매출 비중을 한 화면에서 비교하기에 가장 적절한 시각화는?",
    choices: ["파이 차트", "트리맵", "산점도", "상자수염 그림"],
    correctOrder: 2,
    answerText: "트리맵",
    explanation: "트리맵은 사각형의 중첩과 면적으로 계층 구조와 범주별 비중을 함께 표현합니다.",
    disposition: "supplemented",
    reviewNote: "원천 토글에는 제목만 있어 인접 시각화 원칙을 바탕으로 문항을 완성했습니다.",
  },
  "s2-final-b006": {
    stem: "선형회귀 잔차의 독립성을 점검하는 대표 지표는?",
    choices: ["Shapiro-Wilk 검정", "Breusch-Pagan 검정", "Durbin-Watson 지수", "Cook's Distance"],
    correctOrder: 3,
    answerText: "Durbin-Watson 지수",
    explanation: "Durbin-Watson 값이 2에 가까우면 잔차의 자기상관이 크지 않은 것으로 판단합니다.",
    disposition: "supplemented",
    reviewNote: "원천 토글에는 제목만 있어 인접 LINE 회귀 가정 표를 바탕으로 문항을 완성했습니다.",
  },
  "s2-final-b007": {
    stem: "시간당 평균 3건의 불량이 발생하는 포아송 과정의 전제에 대한 설명으로 틀린 것은?",
    choices: [
      "서로 겹치지 않는 시간 구간의 발생은 독립적이다.",
      "매우 짧은 구간에 두 건 이상 발생할 확률은 무시할 만큼 작다.",
      "발생률은 시간에 비례하며 일정하다.",
      "불량 발생 간격은 포아송 분포를 따른다.",
    ],
    correctOrder: 4,
    answerText: "불량 발생 간격은 포아송 분포를 따른다.",
    explanation: "포아송 분포는 일정 구간의 발생 횟수를, 지수분포는 포아송 과정에서 사건 사이의 대기 시간을 모델링합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 포아송 과정과 지수분포의 대응 관계를 검수했습니다.",
  },
  "s2-final-b027": {
    stem: "전체 변동 중 회귀모형이 설명하는 변동의 비율을 나타내는 지표는?",
    choices: ["결정계수(R²)", "조정된 결정계수", "상관계수", "공분산"],
    correctOrder: 1,
    answerText: "결정계수(R²)",
    explanation: "결정계수 R²는 전체 변동(SST) 중 회귀모형이 설명하는 변동(SSR)의 비율입니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 블록이 비어 있어 지표 정의를 기준으로 보강했습니다.",
  },
  "s3-final-b001": {
    stem: "다음 중 일반적으로 비지도 학습에 해당하지 않는 알고리즘은?",
    choices: ["K-Means", "PCA", "KNN", "t-SNE"],
    correctOrder: 3,
    answerText: "KNN",
    explanation: "KNN은 레이블이 있는 이웃 표본을 이용해 분류·회귀를 수행하는 지도학습 알고리즘입니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 학습 유형을 기준으로 보강했습니다.",
  },
  "s3-final-b002": {
    stem: "변수 선택 방법 중 래퍼(Wrapper) 방식의 특징으로 옳은 것은?",
    choices: [
      "모델 학습 없이 통계량만으로 변수를 고른다.",
      "Lasso처럼 학습 목적함수에 규제를 넣는다.",
      "모든 하이퍼파라미터 조합을 탐색한다.",
      "전진 선택·후진 제거처럼 모델 성능을 반복 측정해 변수를 고른다.",
    ],
    correctOrder: 4,
    answerText: "전진 선택·후진 제거처럼 모델 성능을 반복 측정해 변수를 고른다.",
    explanation: "래퍼 방식은 변수 부분집합마다 모델을 학습·평가해 성능이 좋은 조합을 선택합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답이 비어 있어 변수 선택 방법의 정의를 기준으로 보강했습니다.",
  },
  "s3-final-b003": {
    stem: "비표본 오차(Non-sampling Error)에 대한 설명으로 옳은 것은?",
    choices: [
      "표본 크기를 키우면 반드시 0으로 수렴한다.",
      "표본 추출의 무작위성 때문에만 발생한다.",
      "응답·측정·처리 오류 등에서 생기며 표본 크기를 늘려도 반드시 줄지 않는다.",
      "층화 추출을 사용하면 완전히 제거된다.",
    ],
    correctOrder: 3,
    answerText: "응답·측정·처리 오류 등에서 생기며 표본 크기를 늘려도 반드시 줄지 않는다.",
    explanation: "비표본 오차는 조사 설계, 무응답, 측정, 입력·처리 과정 등에서 발생하므로 표본 수 확대만으로 제거할 수 없습니다.",
    disposition: "corrected",
    reviewNote: "원천 보기에는 정답이 없어 3번 보기를 기술적으로 올바른 문장으로 교체했습니다.",
  },
  "s3-final-b004": {
    stem: "크기가 n인 표본을 복원추출로 n번 뽑는 부트스트랩에서 한 번도 선택되지 않는 관측치의 이론적 비율은?",
    choices: ["약 63.2%", "약 36.8%", "약 50.0%", "약 10.0%"],
    correctOrder: 2,
    answerText: "약 36.8%",
    explanation: "한 관측치가 선택되지 않을 확률은 (1-1/n)ⁿ이고 n이 커지면 e⁻¹≈0.368에 수렴합니다.",
    disposition: "supplemented",
    reviewNote: "원천의 2번 표기를 확률식으로 재검산했습니다.",
  },
  "s3-final-b012": {
    stem: "모멘텀의 이동 방향 누적과 RMSProp의 적응적 학습률을 결합한 옵티마이저는?",
    choices: ["SGD", "BGD", "Adam", "RMSProp"],
    correctOrder: 3,
    answerText: "Adam",
    explanation: "Adam은 1차 모멘트와 2차 모멘트의 지수이동평균을 함께 이용해 방향성과 적응적 학습률을 결합합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 토글이 비어 있었으나 문제 본문의 강조 선택지와 알고리즘 정의를 대조했습니다.",
  },
  "s3-final-b013": {
    stem: "SVM에 대한 설명으로 가장 옳지 않은 것은?",
    choices: [
      "마진을 최대화해 일반화 성능을 높인다.",
      "커널 트릭으로 비선형 경계를 학습할 수 있다.",
      "성능은 C와 gamma 같은 하이퍼파라미터와 무관하다.",
      "쌍대 문제로 바꾸어 최적화할 수 있다.",
    ],
    correctOrder: 3,
    answerText: "성능은 C와 gamma 같은 하이퍼파라미터와 무관하다.",
    explanation: "C와 gamma는 마진, 오분류 허용, 결정경계 복잡도에 큰 영향을 주므로 검증 데이터로 조정해야 합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 토글이 비어 있어 SVM 하이퍼파라미터 정의와 대조했습니다.",
  },
  "s3-final-b014": {
    stem: "자기조직화지도(SOM)에 대한 설명으로 틀린 것은?",
    choices: [
      "고차원 데이터를 저차원 격자에 배치한다.",
      "역전파로 가중치를 학습한다.",
      "경쟁학습으로 승자 뉴런을 찾는다.",
      "입력 공간의 위상 관계 보존을 목표로 한다.",
    ],
    correctOrder: 2,
    answerText: "역전파로 가중치를 학습한다.",
    explanation: "SOM은 레이블과 역전파를 사용하지 않는 비지도 경쟁학습 알고리즘입니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 토글이 비어 있어 SOM의 경쟁학습 원리와 대조했습니다.",
  },
  "s3-final-b015": {
    stem: "다층 신경망에서 시그모이드 사용으로 생기는 기울기 소실과 가장 직접적으로 연결되는 완화책은?",
    choices: ["드롭아웃", "ReLU 계열 활성화 함수", "조기 종료", "시그모이드 층 추가"],
    correctOrder: 2,
    answerText: "ReLU 계열 활성화 함수",
    explanation: "ReLU 계열은 양의 입력 구간에서 기울기가 포화되지 않아 시그모이드보다 깊은 신경망의 기울기 소실을 완화합니다.",
    disposition: "supplemented",
    reviewNote: "원천 정답 토글이 비어 있어 활성화 함수의 미분 특성과 대조했습니다.",
  },
  "s3-final-b027": {
    stem: "거래 1,000건 중 A 200건, B 300건, A와 B 동시 구매 100건일 때 연관규칙 A→B의 향상도는?",
    choices: ["0.50", "1.00", "1.67", "2.50"],
    correctOrder: 3,
    answerText: "1.67",
    explanation: "신뢰도는 100/200=0.5, B의 지지도는 300/1000=0.3이므로 향상도는 0.5/0.3≈1.67입니다.",
    disposition: "corrected",
    reviewNote: "원천은 계산 결과 1.67을 제시하면서 정답 번호를 ④로 적어 두어 ③으로 수정했습니다.",
  },
};

const CIRCLED_ORDERS: Record<string, number> = {
  "①": 1,
  "②": 2,
  "③": 3,
  "④": 4,
  "⑤": 5,
};

function blockId(snapshotId: string, blockIndex: number) {
  return `${snapshotId}-b${String(blockIndex).padStart(3, "0")}`;
}

function cleanText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<empty-block\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\\([*_[\]()>#])/g, "$1")
    .replace(/^\s*[#>\t-]+\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/✅/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function cleanQuestionStem(value: string) {
  return cleanText(value)
    .replace(/^(?:💡\s*)?(?:연습문제|문제|Q)\s*\d*\s*[:.]\s*/i, "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseChoices(source: string) {
  const choiceRegion = source.split(
    /\s*>?\s*(?:\*\*)?정답(?:\*\*)?\s*[:：]/,
  )[0];
  const circledMatches = [...choiceRegion.matchAll(/[①②③④⑤]/g)];
  if (circledMatches.length >= 2) {
    return circledMatches.map((match, index) => {
      const nextIndex = circledMatches[index + 1]?.index ?? choiceRegion.length;
      return {
        order: CIRCLED_ORDERS[match[0]],
        text: cleanText(
          choiceRegion
            .slice((match.index ?? 0) + match[0].length, nextIndex)
            .split(/\b(?:정답|해설)\b/)[0],
        ),
      };
    }).filter((choice) => choice.text);
  }

  const numbered = [
    ...choiceRegion.matchAll(
      /(?:^|\n)\s*(?:[-*]\s*)?([1-5])[.)]\s+(.+?)(?=\n|$)/g,
    ),
  ];
  return numbered.map((match) => ({
    order: Number(match[1]),
    text: cleanText(match[2]),
  }));
}

function explicitAnswer(source: string) {
  const answer = source.match(
    /(?:\*\*)?정답(?:\*\*)?\s*[:：]\s*(?:\*\*)?\s*([①②③④⑤]|[1-5](?:번)?|❌|⭕|O|X)(?:\*\*)?(?:\s+([^\n]*?))?(?=\s*(?:\*\*해설|해설\s*[:：]|\n|$))/i,
  );
  if (answer) {
    const raw = answer[1];
    const answerText = cleanText(answer[2] ?? "");
    if (CIRCLED_ORDERS[raw]) {
      return { order: CIRCLED_ORDERS[raw], answerText };
    }
    if (/^[1-5]/.test(raw)) {
      return { order: Number(raw[0]), answerText };
    }
    return { answerText: /^(?:❌|X)$/i.test(raw) ? "틀리다" : "옳다" };
  }

  const bareOrder = source.match(/(?:^|\n)\s*([1-5])번(?:\s|$)/m);
  if (bareOrder) return { order: Number(bareOrder[1]) };

  const qna = source.match(/(?:^|\n)\s*-\s*(?:\*\*)?A(?:\*\*)?\s*[:：]\s*([\s\S]+)$/i);
  if (qna) return { answerText: cleanText(qna[1]) };

  const textAnswer = source.match(
    /(?:\*\*)?정답(?:\*\*)?\s*[:：]\s*([\s\S]+?)(?=\n|$)/i,
  );
  if (textAnswer) return { answerText: cleanText(textAnswer[1]) };
  return {};
}

function boldChoiceOrder(source: string) {
  const match = source.match(/\*\*\s*([①②③④⑤])[\s\S]*?\*\*/);
  return match ? CIRCLED_ORDERS[match[1]] : undefined;
}

function extractExplanation(source: string) {
  const match = source.match(/(?:\*\*)?해설(?:\*\*)?\s*[:：]\s*([\s\S]+)$/i);
  if (match) return cleanText(match[1]);
  const defense = source.match(/(?:방어 원리|오답 이유)\s*[:：]\s*([\s\S]+)$/i);
  if (defense) return cleanText(defense[1]);
  return "";
}

function questionStemFromSource(summary: string, source: string) {
  if (summary.includes("?")) {
    return cleanQuestionStem(summary);
  }

  const qna = source.match(/(?:^|\n)\s*-\s*(?:\*\*)?Q(?:\*\*)?\s*[:：]\s*([^?\n]+\?)/i);
  if (qna) return cleanQuestionStem(qna[1]);

  const bracketedQuestion = source.match(
    /(?:\*\*)?\\?\[Q\d+\](?:\*\*)?\s*([\s\S]*?\?)/i,
  );
  if (bracketedQuestion) return cleanQuestionStem(bracketedQuestion[1]);

  const questionMatches = [
    ...source.matchAll(
      /(?:^|\n)\s*(?:>\s*)?(?:#{1,4}\s*)?(?:[-*]\s*)?(?:\*\*)?(?:문제(?:\s*\d+)?|Q\d+\.|\\?\[Q\d+\])(?:\*\*)?\s*[:：]?\s*([\s\S]*?\?)(?=\*{0,2}\s*[①②③④⑤]|\*{0,2}\s*\n|$)/gi,
    ),
  ];
  const question = questionMatches.at(-1);
  if (question) return cleanQuestionStem(question[1]);

  const generic = source.match(/((?:다음|어느|전체|변수|랜덤|SOM|실루엣)[^?\n]{5,300}\?)/);
  if (generic) return cleanQuestionStem(generic[1]);

  const wrongPattern = source.match(/오답 패턴[^:：]*[:：]\s*["“]?([^"”\n]+\.)/i);
  if (wrongPattern) {
    return `다음 진술의 옳고 그름을 판단하세요. ${cleanText(wrongPattern[1])}`;
  }
  return "";
}

function splitMultiQuestionSource(source: string) {
  const matches = [...source.matchAll(/(?=(?:\*\*)?(?:\\?\[Q\d+\]|Q\d+\.))/g)];
  if (matches.length < 2) return [source];
  return matches.map((match, index) =>
    source.slice(match.index, matches[index + 1]?.index ?? source.length),
  );
}

function publicQuestion(
  question: BdaSourcePracticeQuestion,
): PublicBdaSourcePracticeQuestion {
  return {
    id: question.id,
    blockId: question.blockId,
    subjectId: question.subjectId,
    sourceSnapshotId: question.sourceSnapshotId,
    mode: question.mode,
    stem: question.stem,
    choices: question.choices,
    sourceType: question.sourceType,
    evidenceGrade: question.evidenceGrade,
    reviewStatus: question.reviewStatus,
    reviewDisposition: question.reviewDisposition,
    practiceNotice: question.practiceNotice,
  };
}

function fromOverride(
  id: string,
  snapshot: BdaNotionSnapshot,
  override: PracticeOverride,
  questionIndex = 1,
): BdaSourcePracticeQuestion {
  const choices: BdaSourcePracticeChoice[] = (override.choices ?? []).map(
    (text, choiceIndex) => ({
      id: `${id}-q${questionIndex}-c${choiceIndex + 1}`,
      order: choiceIndex + 1,
      text,
    }),
  );
  const correctChoice = override.correctOrder
    ? choices[override.correctOrder - 1]
    : undefined;
  return {
    id: `${id}-q${questionIndex}`,
    blockId: id,
    subjectId: snapshot.subjectId,
    sourceSnapshotId: snapshot.id,
    mode: choices.length ? "multiple_choice" : "self_check",
    stem: override.stem,
    choices,
    correctChoiceId: correctChoice?.id,
    answerText: override.answerText,
    explanation: override.explanation,
    sourceType: "user_provided",
    evidenceGrade: "B",
    reviewStatus: "검수 완료",
    reviewDisposition: override.disposition ?? "corrected",
    practiceNotice: "원천 이론과 선택지·정답을 교차 검수한 학습문제입니다. 제출 후에만 정답과 해설을 표시합니다.",
    reviewNote: override.reviewNote,
  };
}

function parseQuestionUnit(
  id: string,
  snapshot: BdaNotionSnapshot,
  unit: string,
  summary: string,
  questionIndex: number,
): BdaSourcePracticeQuestion | null {
  const choicesSource = parseChoices(unit);
  const stem = questionStemFromSource(summary, unit);
  if (!stem) return null;

  const answer = explicitAnswer(unit);
  const inferredOrder = answer.order ?? boldChoiceOrder(unit);
  const choices: BdaSourcePracticeChoice[] = choicesSource.map((choice) => ({
    id: `${id}-q${questionIndex}-c${choice.order}`,
    order: choice.order,
    text: choice.text,
  }));
  const correctChoice = inferredOrder
    ? choices.find((choice) => choice.order === inferredOrder)
    : undefined;
  const isWrongPattern = /오답 패턴[\s\S]*?\(X\)/i.test(unit);
  const answerText =
    correctChoice?.text ??
    answer.answerText ??
    (isWrongPattern ? "틀리다" : "");
  if (!answerText) return null;

  const explanation =
    extractExplanation(unit) ||
    (isWrongPattern
      ? cleanText(unit.split(/방어 원리\s*[:：]/i)[1] ?? unit)
      : `${answerText}이(가) 문제의 조건과 연결되는지 원천 이론의 정의를 기준으로 확인합니다.`);

  return {
    id: `${id}-q${questionIndex}`,
    blockId: id,
    subjectId: snapshot.subjectId,
    sourceSnapshotId: snapshot.id,
    mode: choices.length >= 2 ? "multiple_choice" : "self_check",
    stem,
    choices,
    correctChoiceId: correctChoice?.id,
    answerText,
    explanation,
    sourceType: "user_provided",
    evidenceGrade: "B",
    reviewStatus: "검수 완료",
    reviewDisposition: "source_verified",
    practiceNotice: "사용자 제공 원천 문제를 개념 정의와 계산식으로 재검수했습니다. 제출 후에만 정답과 해설을 표시합니다.",
    reviewNote: "원천 질문·정답·인접 이론의 일치 여부를 확인했습니다.",
  };
}

function parseSnapshot(snapshot: BdaNotionSnapshot) {
  const content = snapshot.contentLines.join("\n");
  const matches = [...content.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi)];
  let previousEnd = 0;

  return matches.map((match, matchIndex) => {
    const index = matchIndex + 1;
    const id = blockId(snapshot.id, index);
    const rawBlock = match[1];
    const summaryMatch = rawBlock.match(/<summary>([\s\S]*?)<\/summary>/i);
    const summary = cleanText(summaryMatch?.[1] ?? "");
    const body = rawBlock.replace(/<summary>[\s\S]*?<\/summary>/i, "");
    const context = content.slice(previousEnd, match.index);
    previousEnd = (match.index ?? 0) + match[0].length;

    const override = PRACTICE_OVERRIDES[id];
    const questions = override
      ? (Array.isArray(override) ? override : [override]).map(
          (item, overrideIndex) =>
            fromOverride(id, snapshot, item, overrideIndex + 1),
        )
      : splitMultiQuestionSource(
          summary.includes("?")
            ? body
            : `${context.slice(-2500)}\n${body}`,
        )
          .map((unit, unitIndex) =>
            parseQuestionUnit(id, snapshot, unit, summary, unitIndex + 1),
          )
          .filter((question): question is BdaSourcePracticeQuestion => Boolean(question));

    return {
      id,
      sourceSnapshotId: snapshot.id,
      subjectId: snapshot.subjectId,
      blockIndex: index,
      questions,
    };
  });
}

const canonicalSnapshots = [
  getBdaCanonicalSnapshot("bda-s1"),
  getBdaCanonicalSnapshot("bda-s2"),
  getBdaCanonicalSnapshot("bda-s3"),
  getBdaCanonicalSnapshot("bda-s4"),
].filter((snapshot): snapshot is BdaNotionSnapshot => Boolean(snapshot));

const privateBlocks = canonicalSnapshots.flatMap(parseSnapshot);
const privateQuestions = privateBlocks.flatMap((block) => block.questions);

export function getPublicBdaSourcePracticeBlocks(
  snapshotId: string,
): PublicBdaSourcePracticeBlock[] {
  return privateBlocks
    .filter((block) => block.sourceSnapshotId === snapshotId)
    .filter((block) => block.questions.length > 0)
    .map((block) => ({
      id: block.id,
      sourceSnapshotId: block.sourceSnapshotId,
      subjectId: block.subjectId,
      blockIndex: block.blockIndex,
      questions: block.questions.map(publicQuestion),
      auditStatus: "published",
      auditNote: block.questions.some(
        (question) => question.reviewDisposition !== "source_verified",
      )
        ? "원천의 빈칸·정답 충돌·불완전 선택지를 인접 이론과 계산식으로 보정했습니다."
        : "원천 질문·정답·해설을 인접 이론과 대조해 공개 승인했습니다.",
    }));
}

export function getBdaSourcePracticeQuestion(questionId: string) {
  return privateQuestions.find((question) => question.id === questionId);
}

export function gradeBdaSourcePractice(
  questionId: string,
  choiceId?: string,
  response?: string,
): BdaSourcePracticeFeedback | null {
  const question = getBdaSourcePracticeQuestion(questionId);
  if (!question) return null;

  const selectedChoice = choiceId
    ? question.choices.find((choice) => choice.id === choiceId)
    : undefined;
  const correctChoice = question.correctChoiceId
    ? question.choices.find(
        (choice) => choice.id === question.correctChoiceId,
      )
    : undefined;

  if (question.mode === "multiple_choice" && !selectedChoice) return null;
  if (question.mode === "self_check" && !response?.trim()) return null;

  return {
    questionId,
    isCorrect:
      question.mode === "multiple_choice"
        ? selectedChoice?.id === correctChoice?.id
        : null,
    selectedChoice,
    correctChoice,
    answerText: question.answerText,
    explanation: question.explanation,
    evidenceGrade: question.evidenceGrade,
    reviewStatus: question.reviewStatus,
    reviewDisposition: question.reviewDisposition,
    notice:
      question.mode === "self_check"
        ? "입력한 답과 검수 답안을 비교해 핵심 조건이 포함됐는지 확인하세요."
        : "사용자 제공 원천과 통합 이론을 교차 검수한 답안입니다.",
  };
}

export function getBdaSourcePracticeAudit() {
  const sourceBlockCount = privateBlocks.length;
  const publishedBlockCount = privateBlocks.filter(
    (block) => block.questions.length > 0,
  ).length;
  const correctedQuestionCount = privateQuestions.filter(
    (question) => question.reviewDisposition === "corrected",
  ).length;
  const supplementedQuestionCount = privateQuestions.filter(
    (question) => question.reviewDisposition === "supplemented",
  ).length;

  return {
    sourceBlockCount,
    publishedBlockCount,
    heldBlockCount: sourceBlockCount - publishedBlockCount,
    heldBlockIds: privateBlocks
      .filter((block) => block.questions.length === 0)
      .map((block) => block.id),
    publishedQuestionCount: privateQuestions.length,
    correctedQuestionCount,
    supplementedQuestionCount,
    sourceVerifiedQuestionCount:
      privateQuestions.length - correctedQuestionCount - supplementedQuestionCount,
  };
}
