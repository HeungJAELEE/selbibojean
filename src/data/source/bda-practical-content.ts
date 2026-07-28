export type BdaCodeLab = {
  id: string;
  order: number;
  track: "overview" | "foundations" | "type1" | "type2" | "type3" | "submission";
  category: "환경·기초" | "유형 1" | "유형 2" | "유형 3" | "제출·검수";
  difficulty: "기초" | "핵심" | "심화";
  estimatedMinutes: number;
  title: string;
  summary: string;
  task: string;
  outputContract: string;
  concepts: string[];
  steps: string[];
  code: string;
  expected: string[];
  traps: string[];
  validation: {
    status: "pattern-reviewed";
    basis: string[];
    note: string;
  };
};

const reviewed = (
  note: string,
  basis = ["공식 체험환경 제출 규칙", "독립 작성 Python 패턴"],
): BdaCodeLab["validation"] => ({
  status: "pattern-reviewed",
  basis,
  note,
});

export const bdaCodeLabs: BdaCodeLab[] = [
  {
    id: "exam-runtime-check",
    order: 1,
    track: "overview",
    category: "환경·기초",
    difficulty: "기초",
    estimatedMinutes: 15,
    title: "시험 환경과 패키지 버전 확인",
    summary:
      "회차마다 달라질 수 있는 Python 패키지와 입력 파일을 코드 작성 전에 확인합니다.",
    task:
      "현재 Python 버전, 설치된 주요 패키지 버전, 작업 폴더의 CSV 파일 목록을 출력합니다.",
    outputContract: "화면 확인용 출력이며 답안으로 제출하지 않습니다.",
    concepts: ["sys.version", "importlib.metadata", "glob", "패키지 제약"],
    steps: [
      "Python 버전을 확인합니다.",
      "pandas·scikit-learn·scipy·statsmodels 설치 여부와 버전을 확인합니다.",
      "현재 폴더에 제공된 CSV 파일명을 확인합니다.",
      "패키지 설치 코드를 작성하지 않고 제공 환경 안에서 풀이합니다.",
    ],
    code: String.raw`import sys
from glob import glob
from importlib.metadata import PackageNotFoundError, version

print(sys.version)

for package in ["pandas", "scikit-learn", "scipy", "statsmodels"]:
    try:
        print(package, version(package))
    except PackageNotFoundError:
        print(package, "not installed")

print(sorted(glob("*.csv")))`,
    expected: [
      "현재 Python과 주요 패키지 버전을 확인할 수 있습니다.",
      "제공된 CSV 파일명을 실제 철자로 확인할 수 있습니다.",
      "없는 패키지는 오류 대신 not installed로 표시됩니다.",
    ],
    traps: [
      "평소 환경의 패키지 버전과 시험 환경이 같다고 가정하는 실수",
      "시험 중 pip install을 시도하는 실수",
      "파일명 대소문자와 확장자를 확인하지 않고 코드를 작성하는 실수",
    ],
    validation: reviewed("공식 가이드의 회차별 패키지 변동과 추가 설치 금지 조건을 반영했습니다."),
  },
  {
    id: "python-pandas-basics",
    order: 2,
    track: "foundations",
    category: "환경·기초",
    difficulty: "기초",
    estimatedMinutes: 35,
    title: "Python 자료형과 pandas 선택",
    summary:
      "리스트·딕셔너리·문자열과 DataFrame의 열·행 선택 결과 형태를 빠르게 확인합니다.",
    task:
      "data.csv를 읽고 score가 70 이상인 행에서 name과 score 열만 선택해 새 표를 만듭니다.",
    outputContract: "선택 결과의 열 순서는 name, score이며 원본은 변경하지 않습니다.",
    concepts: ["list", "dict", "DataFrame", "loc", "copy"],
    steps: [
      "CSV를 DataFrame으로 읽습니다.",
      "열 이름과 자료형을 확인합니다.",
      "불리언 조건과 loc로 행·열을 함께 선택합니다.",
      "copy로 원본과 분리하고 결과 shape를 확인합니다.",
    ],
    code: String.raw`import pandas as pd

df = pd.read_csv("data.csv")
print(df.columns.tolist())
print(df.dtypes)

selected = df.loc[df["score"] >= 70, ["name", "score"]].copy()

print(selected.shape)
print(selected.head())`,
    expected: [
      "selected는 name과 score 두 열을 가진 DataFrame입니다.",
      "원본 df의 행과 열은 변경되지 않습니다.",
      "조건을 만족한 행 수를 shape로 확인합니다.",
    ],
    traps: [
      "열 하나를 대괄호 1개로 선택해 Series가 된 사실을 놓치는 실수",
      "조건식의 괄호를 생략하는 실수",
      "원본과 뷰의 차이를 확인하지 않고 연쇄 할당하는 실수",
    ],
    validation: reviewed("pandas 선택과 결과 형태를 점검한 선수 지식 패턴입니다."),
  },
  {
    id: "pandas-eda-quality",
    order: 3,
    track: "type1",
    category: "유형 1",
    difficulty: "기초",
    estimatedMinutes: 40,
    title: "구조·결측·중복·IQR 점검",
    summary:
      "파일을 읽은 직후 스키마와 품질을 확인하고 수치형 변수의 IQR 이상값 후보를 계산합니다.",
    task:
      "train.csv의 행·열 수, 자료형, 결측 수를 확인하고 amount 열의 IQR 기준 이상값 개수를 구합니다.",
    outputContract: "최종 답은 IQR 경계 밖 관측치 수 1개입니다.",
    concepts: ["shape", "dtypes", "isna", "duplicated", "IQR"],
    steps: [
      "원본 행·열 수와 열 이름을 기록합니다.",
      "자료형·결측·중복을 열 또는 행 단위로 확인합니다.",
      "1·3사분위수와 IQR 경계를 계산합니다.",
      "경계값과 이상값 개수를 구분해 최종값만 출력합니다.",
    ],
    code: String.raw`import pandas as pd

df = pd.read_csv("train.csv")

print("shape:", df.shape)
print(df.dtypes)
print(df.isna().sum().sort_values(ascending=False))
print("duplicated:", int(df.duplicated().sum()))

q1 = df["amount"].quantile(0.25)
q3 = df["amount"].quantile(0.75)
iqr = q3 - q1
lower = q1 - 1.5 * iqr
upper = q3 + 1.5 * iqr

answer = int(((df["amount"] < lower) | (df["amount"] > upper)).sum())
print(answer)`,
    expected: [
      "원본 크기와 열별 결측 개수를 확인합니다.",
      "answer에는 IQR 경계 밖 관측치 수가 정수로 저장됩니다.",
      "이상값 후보 행을 자동 삭제하지 않습니다.",
    ],
    traps: [
      "IQR 경계값과 이상값 개수를 혼동하는 실수",
      ">=·<= 포함 여부를 문제 조건과 다르게 적용하는 실수",
      "업무 의미나 문항 지시 없이 이상값을 삭제하는 실수",
    ],
    validation: reviewed("IQR 산식과 불리언 마스크의 반환값을 검토했습니다."),
  },
  {
    id: "pandas-filter-sort",
    order: 4,
    track: "type1",
    category: "유형 1",
    difficulty: "핵심",
    estimatedMinutes: 35,
    title: "복합 필터와 다중 정렬",
    summary:
      "여러 조건을 괄호로 묶고 동률 기준까지 포함한 정렬 결과에서 요구 행을 선택합니다.",
    task:
      "age가 30 이상이고 status가 active인 행을 score 내림차순, id 오름차순으로 정렬해 상위 5개 score 평균을 구합니다.",
    outputContract: "최종 답은 소수점 둘째 자리로 반올림한 평균 1개입니다.",
    concepts: ["boolean mask", "sort_values", "head", "mean", "round"],
    steps: [
      "각 조건을 괄호로 묶어 & 연산자로 결합합니다.",
      "값과 동률 기준의 정렬 방향을 각각 지정합니다.",
      "정렬 뒤 상위 5개 행을 선택합니다.",
      "평균을 계산한 뒤 마지막에 반올림합니다.",
    ],
    code: String.raw`import pandas as pd

df = pd.read_csv("data.csv")

filtered = df.loc[
    (df["age"] >= 30) & (df["status"] == "active")
].copy()

top5 = filtered.sort_values(
    ["score", "id"],
    ascending=[False, True],
).head(5)

answer = round(float(top5["score"].mean()), 2)
print(answer)`,
    expected: [
      "두 조건을 모두 만족한 행만 남습니다.",
      "score 동률에서는 id가 작은 행이 먼저 옵니다.",
      "상위 5개 score 평균을 마지막에 한 번 반올림합니다.",
    ],
    traps: [
      "Series 조건에 Python and를 사용하는 실수",
      "정렬 전에 head를 적용하는 실수",
      "중간값을 먼저 반올림해 최종값이 달라지는 실수",
    ],
    validation: reviewed("조건 결합, 다중 정렬, 반올림 순서를 검토했습니다."),
  },
  {
    id: "groupby-date-string",
    order: 5,
    track: "type1",
    category: "유형 1",
    difficulty: "핵심",
    estimatedMinutes: 45,
    title: "날짜·문자열·그룹 집계",
    summary:
      "날짜 파생변수와 문자열 조건을 만들고 groupby 결과를 안정적으로 정렬합니다.",
    task:
      "order_date의 월을 추출하고 city에 서울이 포함된 데이터의 월별 sales 합계를 내림차순으로 출력합니다.",
    outputContract: "month, total_sales 두 열의 표이며 동률이면 month 오름차순입니다.",
    concepts: ["to_datetime", "str.contains", "groupby", "agg", "sort_values"],
    steps: [
      "날짜 열을 datetime으로 명시 변환합니다.",
      "문자열 조건에는 na=False를 사용합니다.",
      "이름 있는 집계로 결과 열 이름을 고정합니다.",
      "값과 그룹 키의 정렬 방향을 함께 지정합니다.",
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
      "날짜 변환 실패값은 NaT로 남아 별도 확인할 수 있습니다.",
    ],
    traps: [
      "문자열 날짜를 위치로 잘라 형식 변화에 취약해지는 실수",
      "결측 문자열 때문에 contains가 오류를 내는 문제",
      "as_index 결과 형태를 확인하지 않는 실수",
    ],
    validation: reviewed("날짜 파싱과 이름 있는 집계, 동률 정렬을 검토했습니다."),
  },
  {
    id: "merge-pivot-reshape",
    order: 6,
    track: "type1",
    category: "유형 1",
    difficulty: "핵심",
    estimatedMinutes: 50,
    title: "merge와 pivot_table 검산",
    summary:
      "결합 키의 중복을 확인하고 left merge 뒤 피벗 결과를 만드는 과정을 검산합니다.",
    task:
      "orders와 customers를 customer_id로 결합하고 region별·month별 sales 합계 피벗표를 만듭니다.",
    outputContract: "행은 region, 열은 month, 값은 sales 합계인 피벗표입니다.",
    concepts: ["merge", "validate", "pivot_table", "fill_value", "shape"],
    steps: [
      "오른쪽 테이블의 결합 키 중복을 확인합니다.",
      "left merge와 validate로 관계를 명시합니다.",
      "결합 전후 행 수와 region 결측을 확인합니다.",
      "pivot_table의 index·columns·values·aggfunc를 명시합니다.",
    ],
    code: String.raw`import pandas as pd

orders = pd.read_csv("orders.csv")
customers = pd.read_csv("customers.csv")

print("customer key duplicates:", customers["customer_id"].duplicated().sum())

merged = orders.merge(
    customers[["customer_id", "region"]],
    on="customer_id",
    how="left",
    validate="many_to_one",
)

assert len(merged) == len(orders)
print("missing region:", int(merged["region"].isna().sum()))

result = pd.pivot_table(
    merged,
    index="region",
    columns="month",
    values="sales",
    aggfunc="sum",
    fill_value=0,
)

print(result)`,
    expected: [
      "customers 키가 유일하면 many_to_one 검증을 통과합니다.",
      "left merge 뒤 orders 행 수가 유지됩니다.",
      "중복 조합은 sales 합계로 집계됩니다.",
    ],
    traps: [
      "다대다 결합으로 행 수가 늘어난 사실을 놓치는 실수",
      "inner merge로 원본 주문 행을 잃는 실수",
      "pivot과 pivot_table의 중복 처리 차이를 혼동하는 실수",
    ],
    validation: reviewed("merge validate와 피벗 집계 계약을 검토했습니다."),
  },
  {
    id: "classification-pipeline",
    order: 7,
    track: "type2",
    category: "유형 2",
    difficulty: "핵심",
    estimatedMinutes: 65,
    title: "이진 분류 파이프라인과 ROC-AUC",
    summary:
      "수치형·범주형 전처리를 Pipeline에 넣어 누수 없이 이진 분류 모델을 검증합니다.",
    task:
      "target을 예측하는 로지스틱 회귀 모델을 만들고 검증 ROC-AUC와 F1을 계산합니다.",
    outputContract: "검증 지표는 화면 확인용이며 최종 제출값은 문제 지시에 따른 확률 또는 라벨입니다.",
    concepts: ["ColumnTransformer", "Pipeline", "LogisticRegression", "ROC-AUC", "F1"],
    steps: [
      "X와 y를 나누고 목표 클래스 비율을 확인합니다.",
      "층화 학습·검증 분할을 만듭니다.",
      "수치형·범주형 전처리를 Pipeline 안에 둡니다.",
      "확률로 ROC-AUC, 라벨로 F1을 계산합니다.",
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
X = df.drop(columns=["target", "id"])
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
valid_pred = model.predict(X_valid)

print("ROC-AUC:", roc_auc_score(y_valid, valid_proba))
print("F1:", f1_score(y_valid, valid_pred))`,
    expected: [
      "검증 데이터는 전처리기 fit에 사용되지 않습니다.",
      "ROC-AUC에는 양성 클래스 확률을 사용합니다.",
      "F1에는 클래스 예측값을 사용합니다.",
    ],
    traps: [
      "전체 데이터로 대치·표준화한 뒤 분할하는 누수",
      "ROC-AUC에 predict 결과를 넣는 실수",
      "id 또는 목표를 암시하는 열을 입력에 남기는 실수",
    ],
    validation: reviewed("분할, 전처리 fit 범위, 지표 입력을 검토했습니다."),
  },
  {
    id: "multiclass-classification",
    order: 8,
    track: "type2",
    category: "유형 2",
    difficulty: "심화",
    estimatedMinutes: 60,
    title: "다중 분류와 클래스 순서",
    summary:
      "다중 클래스에서 macro F1을 계산하고 predict_proba 열 순서를 모델 classes_로 확인합니다.",
    task:
      "grade를 예측하는 랜덤포레스트 다중 분류 모델을 만들고 macro F1을 계산합니다.",
    outputContract: "확률 제출이면 문제에서 지정한 클래스 또는 형식만 저장합니다.",
    concepts: ["RandomForestClassifier", "f1_macro", "classes_", "predict_proba"],
    steps: [
      "클래스 개수와 빈도를 확인합니다.",
      "분류 파이프라인을 층화 분할로 검증합니다.",
      "macro F1로 클래스별 성능을 같은 비중으로 봅니다.",
      "확률 열 순서를 model.classes_로 확인합니다.",
    ],
    code: String.raw`import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

df = pd.read_csv("train.csv")
X = df.drop(columns=["grade", "id"])
y = df["grade"]

X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

numeric = X_train.select_dtypes(include="number").columns
categorical = X_train.select_dtypes(exclude="number").columns
preprocess = ColumnTransformer([
    ("num", SimpleImputer(strategy="median"), numeric),
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]), categorical),
])

model = Pipeline([
    ("preprocess", preprocess),
    ("model", RandomForestClassifier(
        n_estimators=200, random_state=42, n_jobs=-1
    )),
])
model.fit(X_train, y_train)

valid_pred = model.predict(X_valid)
print("macro F1:", f1_score(y_valid, valid_pred, average="macro"))
print("class order:", model.named_steps["model"].classes_)`,
    expected: [
      "macro F1은 각 클래스 F1을 같은 비중으로 평균합니다.",
      "classes_ 순서가 확률 배열의 열 순서입니다.",
      "미지 범주는 one-hot 단계에서 오류 없이 처리됩니다.",
    ],
    traps: [
      "이진 분류처럼 확률 배열의 두 번째 열만 무조건 선택하는 실수",
      "클래스 불균형에서 accuracy만 비교하는 실수",
      "라벨 인코딩 순서를 임의로 추정하는 실수",
    ],
    validation: reviewed("다중 분류 지표와 클래스 확률 열 순서를 검토했습니다."),
  },
  {
    id: "regression-pipeline",
    order: 9,
    track: "type2",
    category: "유형 2",
    difficulty: "핵심",
    estimatedMinutes: 65,
    title: "혼합형 데이터 회귀 파이프라인",
    summary:
      "수치형·범주형 변수가 섞인 회귀 문제에서 전처리와 모델을 함께 검증합니다.",
    task:
      "price를 예측하는 랜덤포레스트 회귀 모델을 만들고 검증 RMSE를 계산합니다.",
    outputContract: "검증 RMSE는 화면 확인용이며 제출 CSV에는 예측 열만 저장합니다.",
    concepts: ["RandomForestRegressor", "ColumnTransformer", "RMSE", "random_state"],
    steps: [
      "price와 id를 입력에서 제외합니다.",
      "학습·검증 분할 뒤 열 유형을 학습 데이터에서 판별합니다.",
      "대치·원핫 인코딩과 회귀 모델을 Pipeline에 둡니다.",
      "MSE의 제곱근으로 RMSE를 직접 검산합니다.",
    ],
    code: String.raw`import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

df = pd.read_csv("train.csv")
X = df.drop(columns=["price", "id"])
y = df["price"]

X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42
)

numeric = X_train.select_dtypes(include="number").columns
categorical = X_train.select_dtypes(exclude="number").columns
preprocess = ColumnTransformer([
    ("num", SimpleImputer(strategy="median"), numeric),
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]), categorical),
])

model = Pipeline([
    ("preprocess", preprocess),
    ("model", RandomForestRegressor(
        n_estimators=200, min_samples_leaf=2,
        random_state=42, n_jobs=-1
    )),
])
model.fit(X_train, y_train)
valid_pred = model.predict(X_valid)

rmse = mean_squared_error(y_valid, valid_pred) ** 0.5
print(round(float(rmse), 4))`,
    expected: [
      "RMSE는 목표변수와 같은 단위를 가집니다.",
      "범주형 열도 동일 파이프라인에서 처리됩니다.",
      "동일 데이터와 random_state에서 분할을 재현할 수 있습니다.",
    ],
    traps: [
      "범주형 열이 남은 상태로 회귀 모델에 바로 fit하는 실수",
      "MSE와 RMSE를 혼동하는 실수",
      "목표변수 또는 id가 X에 남는 누수",
    ],
    validation: reviewed("혼합형 열 전처리와 RMSE 산식을 검토했습니다."),
  },
  {
    id: "model-metric-audit",
    order: 10,
    track: "type2",
    category: "유형 2",
    difficulty: "기초",
    estimatedMinutes: 30,
    title: "평가 지표 입력값 감사",
    summary:
      "분류 라벨·분류 확률·회귀 예측값을 지표별로 올바르게 연결합니다.",
    task:
      "이진 분류의 ROC-AUC와 F1, 회귀의 MAE와 RMSE를 각각 계산합니다.",
    outputContract: "지표 이름과 값의 대응을 확인하며 별도 제출물은 없습니다.",
    concepts: ["roc_auc_score", "f1_score", "MAE", "RMSE"],
    steps: [
      "지표가 라벨·확률·연속값 중 무엇을 받는지 적습니다.",
      "양성 클래스 확률 열을 확인합니다.",
      "회귀 오차의 단위와 방향을 확인합니다.",
      "지표 값만으로 데이터 누수 여부를 판단하지 않습니다.",
    ],
    code: String.raw`from sklearn.metrics import (
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    roc_auc_score,
)

auc = roc_auc_score(y_valid_cls, valid_proba)
f1 = f1_score(y_valid_cls, valid_label)

mae = mean_absolute_error(y_valid_reg, valid_value)
rmse = mean_squared_error(y_valid_reg, valid_value) ** 0.5

print("AUC:", auc)
print("F1:", f1)
print("MAE:", mae)
print("RMSE:", rmse)`,
    expected: [
      "ROC-AUC에는 확률, F1에는 클래스 라벨이 들어갑니다.",
      "MAE와 RMSE는 낮을수록 좋습니다.",
      "RMSE는 큰 오차에 MAE보다 민감합니다.",
    ],
    traps: [
      "ROC-AUC에 0·1 예측 라벨을 넣는 실수",
      "RMSE에서 제곱근을 빠뜨리는 실수",
      "서로 다른 단위의 목표에서 지표 숫자만 직접 비교하는 실수",
    ],
    validation: reviewed("scikit-learn 지표별 입력 계약을 검토했습니다."),
  },
  {
    id: "mean-tests",
    order: 11,
    track: "type3",
    category: "유형 3",
    difficulty: "핵심",
    estimatedMinutes: 55,
    title: "단일·대응·독립 표본 t검정",
    summary:
      "한 표본의 기준값 비교, 같은 대상의 전후 비교, 서로 다른 두 집단 비교를 구분합니다.",
    task:
      "score의 평균 70 검정, before·after 대응 검정, A·B 그룹의 Welch 독립표본 검정을 수행합니다.",
    outputContract: "각 검정의 통계량과 p값을 문제에서 지정한 순서와 자리수로 입력합니다.",
    concepts: ["ttest_1samp", "ttest_rel", "ttest_ind", "Welch", "p-value"],
    steps: [
      "귀무가설과 대립가설을 문장으로 씁니다.",
      "같은 관측 대상인지 독립된 집단인지 확인합니다.",
      "결측을 검정별 입력 열에서 제거합니다.",
      "통계량과 p값을 분리해 요구 자리수로 반올림합니다.",
    ],
    code: String.raw`import pandas as pd
from scipy.stats import ttest_1samp, ttest_ind, ttest_rel

df = pd.read_csv("data.csv")

one = df["score"].dropna()
one_stat, one_p = ttest_1samp(one, popmean=70)

paired = df[["before", "after"]].dropna()
pair_stat, pair_p = ttest_rel(paired["before"], paired["after"])

group_a = df.loc[df["group"] == "A", "score"].dropna()
group_b = df.loc[df["group"] == "B", "score"].dropna()
ind_stat, ind_p = ttest_ind(group_a, group_b, equal_var=False)

print(round(float(one_stat), 4), round(float(one_p), 4))
print(round(float(pair_stat), 4), round(float(pair_p), 4))
print(round(float(ind_stat), 4), round(float(ind_p), 4))`,
    expected: [
      "단일표본은 표본 평균과 기준값 70을 비교합니다.",
      "대응표본은 같은 행의 before·after 차이를 사용합니다.",
      "Welch 검정은 두 독립집단의 등분산을 가정하지 않습니다.",
    ],
    traps: [
      "같은 사람의 전후 자료를 독립표본으로 처리하는 실수",
      "차이의 방향 때문에 통계량 부호가 바뀌는 점을 놓치는 실수",
      "p값을 귀무가설이 참일 확률로 해석하는 실수",
    ],
    validation: reviewed("SciPy 함수별 입력 구조와 반환 순서를 검토했습니다."),
  },
  {
    id: "anova-tests",
    order: 12,
    track: "type3",
    category: "유형 3",
    difficulty: "심화",
    estimatedMinutes: 60,
    title: "일원·이원 분산분석",
    summary:
      "세 집단 이상의 평균 차이와 두 요인의 주효과·상호작용을 구분합니다.",
    task:
      "group별 score의 일원 ANOVA와 method·region의 이원 ANOVA를 수행합니다.",
    outputContract: "요구된 F 통계량 또는 p값을 ANOVA 표의 정확한 행에서 선택합니다.",
    concepts: ["f_oneway", "OLS formula", "anova_lm", "interaction"],
    steps: [
      "일원인지 이원인지 요인 수를 확인합니다.",
      "각 그룹 표본을 분리하거나 formula를 구성합니다.",
      "이원 ANOVA에서 주효과와 상호작용 행을 구분합니다.",
      "유의 결과 뒤 그룹별 차이는 별도 사후검정 문제인지 확인합니다.",
    ],
    code: String.raw`import pandas as pd
import statsmodels.api as sm
from scipy.stats import f_oneway
from statsmodels.formula.api import ols

df = pd.read_csv("data.csv")

groups = [
    part["score"].dropna().to_numpy()
    for _, part in df.groupby("group")
]
f_stat, one_p = f_oneway(*groups)
print("one-way:", round(float(f_stat), 4), round(float(one_p), 4))

two_way = df[["score", "method", "region"]].dropna()
model = ols("score ~ C(method) * C(region)", data=two_way).fit()
anova_table = sm.stats.anova_lm(model, typ=2)
print(anova_table)`,
    expected: [
      "일원 ANOVA는 그룹 간 평균 차이의 전체 검정을 제공합니다.",
      "이원 ANOVA 표에는 두 주효과와 상호작용이 따로 표시됩니다.",
      "유의한 전체 검정만으로 특정 두 집단 차이를 확정하지 않습니다.",
    ],
    traps: [
      "그룹이 3개 이상인데 t검정을 반복해 1종 오류를 키우는 실수",
      "상호작용 p값과 주효과 p값을 바꿔 읽는 실수",
      "statsmodels 설치 여부를 확인하지 않는 실수",
    ],
    validation: reviewed("SciPy 일원 ANOVA와 statsmodels 이원 ANOVA 반환 구조를 검토했습니다."),
  },
  {
    id: "chi-square-tests",
    order: 13,
    track: "type3",
    category: "유형 3",
    difficulty: "핵심",
    estimatedMinutes: 50,
    title: "카이제곱 적합도와 독립성 검정",
    summary:
      "관측 분포의 기대 비율 비교와 두 범주형 변수의 관련성 검정을 구분합니다.",
    task:
      "category 관측도수의 지정 기대비율 적합도와 segment·purchased 독립성 검정을 수행합니다.",
    outputContract: "통계량, p값, 자유도 또는 기대도수 중 문제에서 요구한 값만 입력합니다.",
    concepts: ["chisquare", "crosstab", "chi2_contingency", "expected frequency"],
    steps: [
      "적합도인지 독립성인지 질문을 분류합니다.",
      "범주 순서와 관측도수를 확인합니다.",
      "기대도수 합이 관측도수 합과 같은지 확인합니다.",
      "독립성 검정에서는 통계량·p값·자유도·기대도수를 분리합니다.",
    ],
    code: String.raw`import pandas as pd
from scipy.stats import chi2_contingency, chisquare

df = pd.read_csv("data.csv")

observed = (
    df["category"]
    .value_counts()
    .reindex(["A", "B", "C"], fill_value=0)
)
expected_ratio = [0.5, 0.3, 0.2]
expected = observed.sum() * pd.Series(expected_ratio, index=observed.index)
fit_stat, fit_p = chisquare(observed, f_exp=expected)

table = pd.crosstab(df["segment"], df["purchased"])
chi2, indep_p, dof, expected_table = chi2_contingency(table)

print("goodness:", round(float(fit_stat), 4), round(float(fit_p), 4))
print("independence:", round(float(chi2), 4), round(float(indep_p), 4), dof)
print(expected_table)`,
    expected: [
      "적합도 검정은 한 범주의 관측·기대 분포를 비교합니다.",
      "독립성 검정은 두 범주형 변수의 교차표를 사용합니다.",
      "expected_table은 귀무가설 아래 기대도수입니다.",
    ],
    traps: [
      "기대비율의 합이 1인지 확인하지 않는 실수",
      "원자료 수치 열을 chi2_contingency에 바로 넣는 실수",
      "통계적 관련성을 인과관계라고 표현하는 실수",
    ],
    validation: reviewed("적합도와 독립성 검정의 입력 및 반환값을 검토했습니다."),
  },
  {
    id: "linear-regression-inference",
    order: 14,
    track: "type3",
    category: "유형 3",
    difficulty: "심화",
    estimatedMinutes: 60,
    title: "다중 선형회귀 계수와 유의성",
    summary:
      "절편을 포함한 OLS 모형에서 회귀계수, p값, 결정계수를 정확히 추출합니다.",
    task:
      "sales를 price와 ad_cost로 설명하는 다중 선형회귀를 적합하고 ad_cost 계수·p값과 R²를 구합니다.",
    outputContract: "요구 변수의 계수, p값, R²를 지정한 순서와 자리수로 입력합니다.",
    concepts: ["add_constant", "OLS", "params", "pvalues", "rsquared"],
    steps: [
      "목표와 설명변수의 결측 행을 함께 제거합니다.",
      "statsmodels 설계행렬에 절편을 추가합니다.",
      "params와 pvalues에서 같은 변수명을 사용합니다.",
      "R²와 조정 R² 중 문제에서 요구한 값을 구분합니다.",
    ],
    code: String.raw`import pandas as pd
import statsmodels.api as sm

df = pd.read_csv("data.csv")
model_df = df[["sales", "price", "ad_cost"]].dropna()

y = model_df["sales"]
X = sm.add_constant(model_df[["price", "ad_cost"]])
model = sm.OLS(y, X).fit()

answer = {
    "ad_cost_coef": model.params["ad_cost"],
    "ad_cost_p": model.pvalues["ad_cost"],
    "r_squared": model.rsquared,
}
print({key: round(float(value), 4) for key, value in answer.items()})`,
    expected: [
      "const가 절편으로 포함됩니다.",
      "ad_cost 계수와 p값을 같은 변수명으로 추출합니다.",
      "model.rsquared는 결정계수입니다.",
    ],
    traps: [
      "절편을 빠뜨려 계수와 적합도가 달라지는 실수",
      "coef 행과 p값 행을 바꿔 읽는 실수",
      "R²와 조정 R²를 혼동하는 실수",
    ],
    validation: reviewed("statsmodels OLS의 절편·계수·p값·R² 추출을 검토했습니다."),
  },
  {
    id: "logistic-regression-odds",
    order: 15,
    track: "type3",
    category: "유형 3",
    difficulty: "심화",
    estimatedMinutes: 65,
    title: "로지스틱 회귀와 오즈비",
    summary:
      "로짓 계수를 지수화해 오즈비를 구하고 지정 관측치의 사건 확률을 예측합니다.",
    task:
      "purchased를 age와 income으로 설명하는 로지스틱 회귀를 적합하고 income 오즈비와 지정값의 예측확률을 구합니다.",
    outputContract: "오즈비와 예측확률을 문제에서 요구한 순서와 자리수로 입력합니다.",
    concepts: ["Logit", "log-odds", "odds ratio", "exp", "predict"],
    steps: [
      "목표가 0·1인지 확인합니다.",
      "설계행렬에 절편을 추가해 Logit을 적합합니다.",
      "계수를 exp로 변환해 오즈비를 계산합니다.",
      "예측 행도 학습 설계행렬과 같은 열 순서로 만듭니다.",
    ],
    code: String.raw`import numpy as np
import pandas as pd
import statsmodels.api as sm

df = pd.read_csv("data.csv")
model_df = df[["purchased", "age", "income"]].dropna()

y = model_df["purchased"]
X = sm.add_constant(model_df[["age", "income"]])
model = sm.Logit(y, X).fit(disp=False)

income_odds_ratio = np.exp(model.params["income"])

new_x = pd.DataFrame({
    "const": [1.0],
    "age": [40],
    "income": [5000],
})
probability = model.predict(new_x)[0]

print(round(float(income_odds_ratio), 4))
print(round(float(probability), 4))`,
    expected: [
      "income 오즈비는 exp(income 계수)입니다.",
      "예측확률은 0과 1 사이입니다.",
      "new_x 열은 학습 설계행렬과 같은 이름과 순서를 가집니다.",
    ],
    traps: [
      "로짓 계수를 그대로 확률이나 오즈비로 해석하는 실수",
      "연속변수 1단위의 의미를 확인하지 않는 실수",
      "범주형 변수가 있을 때 기준 범주를 확인하지 않는 실수",
    ],
    validation: reviewed("Logit 계수의 지수변환과 예측 설계행렬을 검토했습니다."),
  },
  {
    id: "submission-single-column-audit",
    order: 16,
    track: "submission",
    category: "제출·검수",
    difficulty: "핵심",
    estimatedMinutes: 35,
    title: "단일 예측 열 CSV 생성과 재검증",
    summary:
      "유형 2 체험환경 규칙에 맞춰 요구된 예측 열 1개만 저장하고 파일을 다시 읽어 검사합니다.",
    task:
      "test.csv의 원래 행 순서를 유지해 target 확률을 예측하고 result.csv에 target 열 1개만 저장합니다.",
    outputContract: "result.csv, target 열 1개, index 없음, test와 같은 행 수와 순서입니다.",
    concepts: ["predict_proba", "DataFrame", "to_csv", "index=False", "leakage"],
    steps: [
      "학습 때 사용한 입력 열과 같은 열을 test에서 선택합니다.",
      "문제가 확률과 라벨 중 무엇을 요구하는지 확인합니다.",
      "요구된 예측 열 1개로 DataFrame을 만듭니다.",
      "저장 파일을 다시 읽어 열·행·결측을 검사합니다.",
    ],
    code: String.raw`import pandas as pd

test = pd.read_csv("test.csv")
X_test = test.drop(columns=["id"])

# model은 train 데이터로 fit을 끝낸 Pipeline이라고 가정합니다.
target_prediction = model.predict_proba(X_test)[:, 1]

submission = pd.DataFrame({
    "target": target_prediction,
})
submission.to_csv("result.csv", index=False)

check = pd.read_csv("result.csv")
assert list(check.columns) == ["target"]
assert len(check) == len(test)
assert not check["target"].isna().any()
print(check.head())`,
    expected: [
      "result.csv는 target 열 1개만 가집니다.",
      "행 수와 행 순서는 test.csv와 같습니다.",
      "자동 생성 인덱스 열과 결측 예측값이 없습니다.",
    ],
    traps: [
      "id를 제출 열에 함께 넣어 2열 파일을 만드는 실수",
      "확률 제출 문항에 0·1 라벨을 저장하는 실수",
      "파일명·열 이름·index=False 중 하나를 빠뜨리는 실수",
    ],
    validation: reviewed(
      "공식 체험환경의 단일 예측 열, index 제외, 지정 파일명 규칙을 반영했습니다.",
      ["공식 실기 체험환경 가이드 유형 2", "독립 작성 Python 패턴"],
    ),
  },
];

export function getBdaCodeLab(labId: string) {
  return bdaCodeLabs.find((lab) => lab.id === labId);
}
