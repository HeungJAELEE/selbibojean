# 배포 준비·운영 인수 체크리스트

이 문서는 현재 저장소를 배포 직전 상태로 검증하고, 사용자 승인 후 기존 Sites 프로젝트에
안전하게 새 버전을 저장·배포하기 위한 기준이다. 이 절차 자체는 배포를 수행하지 않는다.

## 현재 기준선

| 항목 | 현재 값 |
|---|---:|
| 이론 레슨 | 1,258 |
| 공개 레슨 | 1,190 |
| 대표 문제 | 1,396 |
| 공개 문제 | 1,314 |
| 원문 변형 | 2,384 |
| 잔여 백로그 | 276 |
| 용접 안전 33차 검수 문제 | 283 |
| 용접 안전 33차 검수 레슨 | 30 |
| 우선 검수 큐 | 150 |
| CBT 완료 회차 | 25/25 |
| 권위 출처 URL 누락 | 33 |

용접 안전 33차 문제 283개는 모두 `blocked` 상태다. 현재 공개 범위의 배포 준비와 별개로,
정답·해설·선택지별 피드백·정확한 이론 연결·권위 출처가 완료되기 전까지 공개할 수 없다.

## 승인된 호스팅 대상

- 기존 Sites project ID: `appgprj_6a5cf5715fe4819189a1843f8cd3f749`
- 사이트 제목: `설비보전 마스터북`
- 감사 시점 최신 저장 버전: 15
- 현재 접근 정책: public
- 새 사이트를 만들지 말고 위 project ID를 그대로 재사용한다.

## 필요한 런타임

- Node.js 22 이상
- npm 10 이상
- 현재 안정적인 검증 런타임: Node.js 24

Node.js 20에서는 `vinext`가 사용하는 `node:fs/promises.glob`을 제공하지 않아 빌드할 수 없다.

## 환경 변수

### 공개·계정 기능

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
USERNAME_EMAIL_DOMAIN
RATE_LIMIT_HMAC_SECRET
CRON_SECRET
ADMIN_ALLOWLIST_EMAILS
```

- Supabase가 없으면 공개 학습과 게스트 로컬 기록은 동작한다.
- 계정 로그인·동기화·삭제는 비활성화되며 API는 503을 반환한다.
- 운영 환경에서 관리자 인증 설정이 완전하지 않으면 `/admin`은 차단되어야 한다.
- `RATE_LIMIT_HMAC_SECRET`은 32자 이상의 운영 비밀을 사용한다.
- 서비스 역할 키와 비밀은 `NEXT_PUBLIC_` 접두사를 사용하지 않는다.

### 로컬 가져오기 전용

```text
SOURCE_WORKBOOK_PATH
WELDING_SAFETY_WORKBOOK_PATH
WELDING_SAFETY_REPORT_PATH
```

이 값과 원본 엑셀·HWP는 배포 환경에 넣거나 Git에 커밋하지 않는다.

## 필수 검증

```bash
npm install
npm run preflight:deploy
```

`preflight:deploy`는 다음 순서로 실행된다.

1. 생성 데이터 수량·공개 게이트 검사
2. TypeScript 검사
3. ESLint
4. Vitest 단위·통합 테스트
5. production build
6. Playwright 데스크톱·모바일 E2E
7. Sites project ID·정적 자산·민감파일·클라이언트 누출 검사

성공 결과에는 최소한 다음이 포함되어야 한다.

```text
공개 레슨 1190
공개 문제 1314
용접 안전 검수 283문제·30레슨·25회차
Sites project appgprj_6a5cf5715fe4819189a1843f8cd3f749
정답 자산 /data/* 직접 접근 차단
33차 검수대기 데이터 클라이언트 미포함
```

Supabase CLI와 Docker가 준비된 운영 후보 환경에서는 추가로 실행한다.

```bash
npm run test:rls
```

## 정답 데이터 비노출

- 공개 문제는 답안 제출 전 `correctChoiceId`, `explanation`, 선택지 피드백을 반환하지 않는다.
- 20MB 규모의 서버 런타임 콘텐츠는 `.runtime-assets/data`에서 생성하여 빌드 결과에만 복사한다.
- `public/data`에는 정답 데이터를 두지 않는다.
- Cloudflare는 `/data`와 `/data/*`를 Worker로 먼저 보내고 Worker는 항상 404·`no-store`를 반환한다.
- 서버는 `ASSETS` 바인딩을 통해서만 내부 콘텐츠를 읽는다.
- 33차 검수 원문 JSON은 서버 전용 모듈에서만 읽으며 클라이언트 산출물에 포함하지 않는다.

로컬 Cloudflare 미리보기에서 확인할 응답:

| 요청 | 기대 |
|---|---|
| `GET /` | 200 |
| `GET /data/content-manifest.json` | 404 |
| `POST /api/practice/session` | 200 |
| 세션 문제 JSON | 정답키·해설·선택지 피드백 없음 |

## 수동 스모크 테스트

### 공개 학습

1. 홈에서 필기 이론 진입
2. 과목 → 세부항목군 → 레슨 이동
3. 관련 문제 시작
4. 제출 전 정답·해설이 보이지 않는지 확인
5. 오답 제출 후 정답·근거·각 선택지 설명 확인
6. 이론 앵커로 이동 후 문제로 복귀
7. 모름·헷갈림·앎 기록과 복습 큐 확인
8. 모바일 360px 안팎에서 가로 스크롤·잘림 확인

### 콘텐츠 검수

1. 운영 관리자 설정이 없을 때 `/admin` 접근 차단 확인
2. 설정된 allowlist 계정만 관리자 진입 가능 확인
3. `/admin/review/welding-safety`에서 283문제·30레슨·150 우선 큐·25회차 확인
4. 33차 검수 문제에 공개·승인 동작이 없는지 확인

### 접근성

1. 키보드만으로 문제 선택·제출·다음 문제 이동
2. 포커스 표시
3. 버튼의 접근 가능한 이름
4. 시각 자료의 대체텍스트와 설명
5. 자동 접근성 검사에서 critical/serious 위반 없음

## 사용자 승인 후에만 수행할 배포 순서

1. 통합 diff를 검토하고 승인 범위를 확정한다.
2. 검증한 정확한 소스 상태를 커밋한다.
3. 원격 브랜치로 푸시한다.
4. 동일 커밋의 정확한 소스를 기존 Sites project ID로 전송한다.
5. 전송된 소스에서 생성한 production build와 hosting 설정을 다시 확인한다.
6. 해당 commit SHA로 새 Sites 버전을 저장한다.
7. 저장된 버전만 production에 배포한다.
8. production URL에서 위 스모크 테스트를 반복한다.
9. 오류가 있으면 직전 저장 버전으로 되돌리고 문제를 기록한다.

배포 전에 `create_site`를 호출하거나 새 project ID를 만들면 안 된다. 프로덕션 URL은 모든
Sites 배포에서 실제 공개 URL이므로, 버전 저장과 배포는 사용자 승인 후에만 수행한다.

## 고의로 남겨 둔 비공개 작업

- 용접 안전 33차 283문제의 기술·출처·선택지 피드백·이론 연결 검수
- 권위 출처 URL이 없는 33건 보완
- 27차 잔여 276문항 상세화
- Supabase 운영 프로젝트 생성과 migration 적용
- RLS 실제 프로젝트 검증
- 계정 purge Edge Function·cron 운영 설정
- production 배포와 외부 공유

이 항목들은 현재 공개 콘텐츠의 안전한 배포를 막는 코드 오류가 아니다. 다만 해당 콘텐츠나
계정 기능을 운영 범위에 포함하려면 각각 완료와 별도 승인이 필요하다.
