# 빅데이터분석기사 통합 학습 플랫폼

빅데이터분석기사 필기 개념, 학습용 재구성 문제, 실기 과제, 검증 코드,
출처·신뢰등급을 한 흐름으로 연결하는 독립 Next.js 플랫폼입니다.

설비보전기사 사이트와 저장소·경로·콘텐츠를 분리하며, 설비·용접·안전 콘텐츠를
빅데이터 학습 원천으로 사용하지 않습니다.

## 현재 BDA 범위

- 필기 4과목, C001~C040 개념 지도와 통합 이론
- 587개 필기 출처 인벤토리와 183개 학습용 재구성
- 58개 실기 과제와 유형별 Python 코드 레슨 16개
- 제출 전 정답·해설·선택지 피드백 비노출
- 개념 ↔ 문제 ↔ 실기 과제 ↔ 출처 메타데이터 연결
- Notion 이론 스냅샷의 로컬 이관본
- 로컬 교육자료 539개 전수 메타데이터와 실기 직접성 분류

공식 시험문제·답안·채점기준을 확보했다고 주장하지 않습니다. 회차 복원자료와
제3자 학습자료는 출처·신뢰등급·검수상태를 유지합니다.

## 실기 원본 자료 이관

원본 교육자료 바이너리는 저장소에 복제하지 않습니다. 아래 명령은 로컬 폴더를
스트리밍으로 읽어 SHA-256, 상대경로, 주차, 학습영역, 파일 역할, 중복,
개인정보·데이터누수·권리 검수 플래그를 생성합니다.

```powershell
npm run import:bda-course-library -- "C:\path\to\course-files"
```

생성 파일:

```text
src/data/generated/bda-course-library.json
```

생성 JSON에는 절대경로, 원본 바이너리, 원문 강의자료가 포함되지 않습니다.
CSV는 열 메타데이터와 대략적 행 수, Jupyter Notebook은 셀 수와 첫 제목만
저장합니다. 데이터셋과 DB는 검수 전 실행 자산으로 사용하지 않습니다.

## 주요 화면

```text
/bda
/bda/written
/bda/textbook
/bda/concepts
/bda/bank
/bda/practical?tab=overview
/bda/practical?tab=foundations
/bda/practical?tab=type1
/bda/practical?tab=type2
/bda/practical?tab=type3
/bda/practical?tab=submission
/bda/practical?tab=course-library
/bda/sources
```

실기 허브는 Python 기초 → 유형 1 → 유형 2 → 유형 3 → 제출 감사 순서로
구성합니다. SQL·딥러닝·생성형 AI·미니프로젝트는 시험 핵심과 구분한
보충자료입니다.

## 요구 환경

- Node.js 22 이상
- npm 10 이상
- 선택: Supabase CLI와 Docker Desktop

## 로컬 실행

```powershell
npm install
npm run dev
```

## 검증

```powershell
npm run verify:data
npm run typecheck
npm run lint
npm run test
npm run build
```

전체 검증은 `npm run check`로 실행합니다. 외부 배포, Supabase 마이그레이션,
Git push는 별도 승인 전 수행하지 않습니다.

## 공개·보안 기준

- 제출 전 API/클라이언트 응답에 정답·해설·선택지 피드백을 넣지 않습니다.
- 개인정보·가명정보·데이터 누수 후보는 검수 전 자동 발행하지 않습니다.
- 외부 PDF·슬라이드·이미지는 권리 검토 전 공개하지 않습니다.
- 원본 엑셀, 교육자료 바이너리, 데이터셋, 자격 증명을 커밋하지 않습니다.
- 생성 인벤토리는 로컬 외부 원본의 존재를 설명할 뿐 다운로드 경로를 제공하지 않습니다.
