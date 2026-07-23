# 설비보전기사 마스터북

설비보전기사 이론, 랜덤 문제, 오답 이해, 복습과 진도를 한 흐름으로 연결하는 신규 Next.js 플랫폼입니다. 기존 사이트 코드는 재사용하지 않았습니다.

## 현재 구현

- 27차 원본 엑셀 ETL과 체크섬·수량 대사
- 현행 4과목 → 44개 세부항목군 → 정규 개념 레슨 1,258개(공개 1,190개)
- 대표문제 1,396개, 원문 변형 2,384개, 잔여 백로그 276개 보존
- 공개 검증을 통과한 문제만 사용하는 전체·과목·세부항목군·오답·복습 랜덤 세션과 실제 기출·개념 문제 혼합 출제
- 실제 기출 비율 0·25·50·75·100% 선택과 과목별 반복 오답 세부항목군 집중 출제
- 필기 4과목×20문제(총 80문제) 실전 형식과 과목별 체크·문제 수 커스텀 모의고사(현재 검수 공개 범위 최대 78문제)
- 실기 10문제형 모의고사를 위한 필답형·작업형 준비 화면
- 세션 내 중복 방지와 제출 전 정답·해설 비노출
- 오답 원인, 선택지별 설명, 이론 앵커 이동, 복귀·재도전
- 게스트 브라우저 기록과 아이디·비밀번호 계정 API
- 168시간 비활동 삭제 Edge Function과 03:00 KST 예약 예시
- 관리자 Magic Link·allowlist, import staging, RLS, 검수·승인 데이터 모델
- 필답형·작업형 확장 경로

## 요구 환경

- Node.js 22 이상
- npm 10 이상
- 선택: Supabase CLI와 실행 중인 Docker Desktop(RLS 로컬 테스트)

## 로컬 실행

```bash
npm install
npm run import:workbook -- "C:/path/to/27차_웹앱설계.xlsx"
npm run dev
```

원본 기본 경로는 현재 작업 환경의 Downloads 파일로 설정되어 있지만, 다른 환경에서는 인자 또는 `SOURCE_WORKBOOK_PATH`를 사용하세요. 원본 파일은 커밋하지 않습니다.

## 검증

```bash
npm run verify:data
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

Supabase CLI와 Docker가 준비되면 `npm run test:rls`로 정책 테스트를 실행합니다.

## Supabase 연결

1. `.env.example`을 기준으로 로컬 환경 변수를 설정합니다.
2. `supabase/migrations`를 새 프로젝트에 적용합니다.
3. `npm run stage:supabase`로 생성 스냅샷을 비공개 staging 배치에 올립니다.
4. 관리자 검수·승인 후 materialization/발행 단계를 수행합니다.
5. `purge-inactive-accounts` Edge Function을 배포하고 `supabase/cron.sql.example`의 자리표시자를 Vault 비밀로 교체합니다.

현재 저장소에서는 외부 Supabase 프로젝트 생성·마이그레이션 적용·Vercel 배포를 실행하지 않았습니다. 이는 자격 증명과 사용자 승인이 필요한 별도 단계입니다.

## 콘텐츠 출처와 공개 기준

- 원본 데이터: `설비보전기사_전회차_중복제거_마스터_27차_웹앱설계.xlsx`
- 2025–2028 출제기준: [Q-Net](https://www.q-net.or.kr/cst006.do?artlSeq=5212779&brdId=Q006&code=1202&id=cst00602)
- 2026 작업형 공개문제: [Q-Net](https://www.q-net.or.kr/cst006.do?artlSeq=5209398&brdId=Q006&gSite=Q&id=cst00602)

자동 분류 또는 근거가 부족한 문제와 레슨은 `in_review`로 유지됩니다. 법령·안전·KS/ISO·제조사 조건은 권위 있는 출처 검수 전 공개하지 않습니다.
