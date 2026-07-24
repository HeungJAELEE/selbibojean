export type BdaCodeLab = {
  id: string;
  order: number;
  category: "데이터 작업" | "모델링" | "통계 검정" | "제출·검수";
  title: string;
  summary: string;
  task: string;
  concepts: string[];
  steps: string[];
  code: string;
  expected: string[];
  traps: string[];
};

export const bdaCodeLabs: BdaCodeLab[] = [
  {
    id: "pandas-eda-quality",
    order: 1,
    category: "데이터 작업",
    title: "pandas로 구조·결측·이상값 점검",
    summary:
      "파일을 읽은 직후 스키마와 품질을 확인하고, 수치형 변수의 IQR 이상값 후보를 계산합니다.",
    task:
      "train.csv를 읽어 행·열 수, 자료형, 결측 수를 확인하고 amount 열의 IQR 기준 이상값 개수를 구합니다.",
    concepts: ["shape", "dtypes", "isna", "describe", "IQR"],
    steps: [
      "파일을 읽고 원본 행·열 수를 먼저 기록합니다.",
      "자료형과 결측 수를 열별로 확인합니다.",
      "IQR 경계를 계산하되 이상값 후보를 자동 삭제하지 않습니다.",
      "문항의 반올림·출력 형식에 맞춰 최종값만 출력합니다.",
    ],
    code: String.raw`import pandas as pd

df = pd.read_csv("train.csv")

print("shape:", df.shape)
print(df.dtypes)
print(df.isna().sum().sort_values(ascending=False))

q1 = df["amount"].quantile(0.25)
q3 = df["amount"].quantile(0.75)
iqr = q3 - q1
lower = q1 - 1.5 * iqr
upper = q3 + 1.5 * iqr

outlier_mask = (df["amount"] < lower) | (df["amount"] > upper)
answer = int(outlier_mask.sum())
print(answer)`,
    expected: [
      "shape로 데이터 크기를 확인합니다.",
      "열별 결측 개수와 자료형을 확인합니다.",
      "answer에는 IQR 경계 밖 관측치 수가 정수로 저장됩니다.",
    ],
    traps: [
      "CSV를 읽자마자 열 이름과 자료형을 확인하지 않고 계산식을 작성하는 실수",
      "IQR 경계값과 이상값 개수를 혼동하는 실수",
      "업무 의미 확인 없이 이상값 행을 삭제하는 실수",
    ],
  },
  {
    id: "groupby-date-string",
    order: 2,
    category: "데이터 작업",
    title: "날짜·문자열·그룹 집계",
    summary:
      "날짜 파생변수와 문자열 조건을 만들고 groupby 결과를 안정적으로 정렬합니다.",
    task:
      "order_date의 월을 추출하고 city가 '서울'인 데이터만 골라 월별 sales 합계를 내림차순으로 출력합니다.",
    concepts: ["to_datetime", "str", "groupby", "agg", "sort_values"],
    steps: [
      "날짜 열을 datetime으로 명시 변환합니다.",
      "문자열 조건은 결측값을 고려해 na=False를 사용합니다.",
      "집계 열 이름을 명시하고 정렬 기준을 분명히 합니다.",
      "Series가 아닌 표 형태가 필요하면 reset_index를 적용합니다.",
    ],
    code: String.raw`import pandas as pd

df = pd.read_csv("data.csv")
df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
df["month"] = df["order_date"].dt.month

seoul = df[df["city"].str.contains("서울", na=False)]

result = (
    seoul.groupby("month", as_index=False)
    .agg(total_sales=("sales", "sum"))
    .sort_values(["total_sales", "month"], ascending=[False, True])
)

print(result)`,
    expected: [
      "month와 total_sales 두 열을 가진 표가 생성됩니다.",
      "매출 합계가 큰 월부터 정렬됩니다.",
      "동률이면 month가 작은 값부터 정렬됩니다.",
    ],
    traps: [
      "문자열 날짜에서 월을 슬라이싱해 형식 변화에 취약해지는 실수",
      "결측 문자열 때문에 contains가 오류를 내는 문제",
      "동률 정렬 기준을 지정하지 않아 결과 순서가 달라지는 문제",
    ],
  },
  {
    id: "classification-pipeline",
    order: 3,
    category: "모델링",
    title: "분류 파이프라인과 ROC-AUC",
    summary:
      "수치형·범주형 전처리를 Pipeline 안에 넣어 데이터 누수 없이 이진 분류 모델을 학습합니다.",
    task:
      "target을 예측하는 로지스틱 회귀 모델을 만들고 검증 ROC-AUC와 F1을 계산합니다.",
    concepts: ["train_test_split", "ColumnTransformer", "Pipeline", "ROC-AUC", "F1"],
    steps: [
      "X와 y를 나눈 뒤 층화 분할합니다.",
      "수치형 대치·표준화와 범주형 대치·원핫 인코딩을 정의합니다.",
      "전처리기와 모델을 하나의 Pipeline으로 묶습니다.",
      "확률은 ROC-AUC, 클래스는 F1 계산에 사용합니다.",
    ],
    code: String.raw`import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.read_csv("train.csv")
X = df.drop(columns="target")
y = df["target"]

X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

numeric = X_train.select_dtypes(include="number").columns
categorical = X_train.select_dtypes(exclude="number").columns

numeric_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])
categorical_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore")),
])

preprocess = ColumnTransformer([
    ("num", numeric_pipe, numeric),
    ("cat", categorical_pipe, categorical),
])

model = Pipeline([
    ("preprocess", preprocess),
    ("model", LogisticRegression(max_iter=1000, random_state=42)),
])

model.fit(X_train, y_train)
valid_proba = model.predict_proba(X_valid)[:, 1]
valid_pred = (valid_proba >= 0.5).astype(int)

print("ROC-AUC:", roc_auc_score(y_valid, valid_proba))
print("F1:", f1_score(y_valid, valid_pred))`,
    expected: [
      "검증 데이터는 전처리기 fit에 사용되지 않습니다.",
      "ROC-AUC에는 1 클래스 확률을 사용합니다.",
      "F1에는 임계값으로 만든 클래스 예측을 사용합니다.",
    ],
    traps: [
      "전체 데이터로 대치·표준화한 뒤 분할해 검증 정보가 누수되는 실수",
      "ROC-AUC에 predict 클래스 값을 넣는 실수",
      "분류 불균형인데 stratify 없이 무작위 분할하는 실수",
    ],
  },
  {
    id: "regression-rmse",
    order: 4,
    category: "모델링",
    title: "회귀 모델과 RMSE 검증",
    summary:
      "랜덤포레스트 회귀 모델을 학습하고 RMSE를 직접 계산해 버전 차이에 덜 의존하도록 구성합니다.",
    task:
      "price를 예측하는 회귀 모델을 만들고 검증 RMSE를 계산합니다.",
    concepts: ["RandomForestRegressor", "mean_squared_error", "RMSE", "random_state"],
    steps: [
      "목표변수와 식별자 열을 입력에서 제외합니다.",
      "학습·검증 데이터를 같은 random_state로 재현 가능하게 분할합니다.",
      "모델을 학습하고 검증 예측값을 생성합니다.",
      "MSE에 제곱근을 적용해 RMSE를 계산합니다.",
    ],
    code: String.raw`import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

df = pd.read_csv("train.csv")
X = df.drop(columns=["price", "id"])
y = df["price"]

X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=300,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)
valid_pred = model.predict(X_valid)

rmse = mean_squared_error(y_valid, valid_pred) ** 0.5
print(round(rmse, 4))`,
    expected: [
      "RMSE는 목표변수와 같은 단위를 가집니다.",
      "동일한 데이터와 random_state에서는 같은 분할과 결과를 재현합니다.",
      "식별자 id는 모델 입력에서 제외됩니다.",
    ],
    traps: [
      "MSE와 RMSE를 혼동해 제곱근을 빠뜨리는 실수",
      "목표변수 또는 정답을 암시하는 파생 열이 X에 남는 누수",
      "검증 성능을 반복 확인하며 시험 데이터를 모델 선택에 사용하는 실수",
    ],
  },
  {
    id: "statistical-tests",
    order: 5,
    category: "통계 검정",
    title: "t검정과 카이제곱 검정",
    summary:
      "변수 유형과 연구 질문에 따라 평균 차이와 범주형 독립성 검정을 구분합니다.",
    task:
      "A·B 그룹 score 평균 차이를 Welch t검정으로, segment와 purchased의 관련성을 카이제곱 검정으로 확인합니다.",
    concepts: ["ttest_ind", "chi2_contingency", "p-value", "Welch"],
    steps: [
      "평균 비교인지 범주형 독립성인지 질문을 먼저 구분합니다.",
      "결측값을 제거하되 제거 전 표본 수를 확인합니다.",
      "등분산을 가정하지 않는 Welch t검정은 equal_var=False를 사용합니다.",
      "검정통계량과 p값을 구분해 출력합니다.",
    ],
    code: String.raw`import pandas as pd
from scipy.stats import chi2_contingency, ttest_ind

df = pd.read_csv("data.csv")

group_a = df.loc[df["group"] == "A", "score"].dropna()
group_b = df.loc[df["group"] == "B", "score"].dropna()
t_stat, t_p = ttest_ind(group_a, group_b, equal_var=False)

table = pd.crosstab(df["segment"], df["purchased"])
chi2, chi_p, dof, expected = chi2_contingency(table)

print("Welch t:", round(t_stat, 4), round(t_p, 4))
print("Chi-square:", round(chi2, 4), round(chi_p, 4), dof)`,
    expected: [
      "t_stat과 t_p는 평균 차이 검정 결과입니다.",
      "chi2와 chi_p는 두 범주형 변수의 독립성 검정 결과입니다.",
      "p값은 귀무가설이 참일 확률로 해석하지 않습니다.",
    ],
    traps: [
      "대응표본과 독립표본 검정을 혼동하는 실수",
      "관측도수 대신 원자료 수치에 카이제곱 검정을 적용하는 실수",
      "유의한 결과를 효과가 크거나 인과관계라고 단정하는 실수",
    ],
  },
  {
    id: "submission-leakage-audit",
    order: 6,
    category: "제출·검수",
    title: "예측 파일 생성과 누수 점검",
    summary:
      "학습된 파이프라인으로 시험 데이터를 예측하고 요구된 열 순서로 제출 파일을 만듭니다.",
    task:
      "test.csv의 id를 보존하면서 target 확률을 예측해 result.csv로 저장합니다.",
    concepts: ["predict_proba", "DataFrame", "to_csv", "index=False", "leakage"],
    steps: [
      "시험 데이터의 id를 별도 보존합니다.",
      "학습 때 사용한 입력 열과 동일한 순서·스키마를 맞춥니다.",
      "문항이 확률과 클래스 중 무엇을 요구하는지 확인합니다.",
      "파일명·열 이름·행 수·index 포함 여부를 마지막에 검증합니다.",
    ],
    code: String.raw`import pandas as pd

test = pd.read_csv("test.csv")
test_id = test["id"].copy()
X_test = test.drop(columns="id")

# model은 학습 데이터로 fit을 완료한 Pipeline이라고 가정합니다.
target_proba = model.predict_proba(X_test)[:, 1]

submission = pd.DataFrame({
    "id": test_id,
    "target": target_proba,
})
submission.to_csv("result.csv", index=False)

check = pd.read_csv("result.csv")
assert list(check.columns) == ["id", "target"]
assert len(check) == len(test)
assert check["id"].equals(test_id)
print(check.head())`,
    expected: [
      "result.csv는 id와 target 두 열을 가집니다.",
      "행 수와 id 순서는 test.csv와 같습니다.",
      "불필요한 인덱스 열이 저장되지 않습니다.",
    ],
    traps: [
      "id를 정렬하거나 인덱스를 재설정하면서 원래 행 순서를 바꾸는 실수",
      "확률 제출 문항에 0·1 클래스를 저장하는 실수",
      "시험 데이터의 목표변수나 정답 유사 열을 학습에 사용하는 누수",
    ],
  },
];

export function getBdaCodeLab(labId: string) {
  return bdaCodeLabs.find((lab) => lab.id === labId);
}
