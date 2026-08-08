# CBT 시스템 실제 이식 배치 04 완료 보고서

## 1. 범위

- 대상 회차: 2012년 4회 100문항, 2013년 4회 100문항
- 총 대상: 200문항
- 기존 `externalId`, 회차 URL, 문항번호 보존
- 원본 `src/data/generated/content.json` 직접 수정 없음
- 검수된 지문·보기·정답·풀이·보기별 근거·직접 이론 연결을 reviewed overlay에 누적
- 운영 자동 공개 없음

## 2. 최종 상태

| 상태 | 수량 | 처리 |
|---|---:|---|
| `candidate` | 193 | 명시적 `published` 승격 전에는 학습자 출제·채점 차단 |
| `choice_conflict` | 1 | 충돌 근거를 보존하되 활성 정답·채점 비활성화 |
| `hold` | 6 | 필수 이미지 판독 전 활성 정답·choice mapping 비활성화 |
| `published` | 0 | 자동 공개 없음 |

누적 상태는 800문항이며 `candidate 759`, `choice_conflict 9`, `hold 32`이다.

## 3. 핵심 교정

### 3.1 `2013-4-Q48` 송풍기 축동력

- 복원 정답: 1번 `터보 팬`
- 독립 검수 정답: 3번 `다익 팬`
- 처리:
  - 복원 정답 인덱스 `0`을 출처 기록으로 보존
  - 검수 정답 인덱스 `2`를 reviewed candidate와 canonical overlay에 반영
  - 기존 canonical ID `U-1072` 유지
  - 신규 직접 레슨 `lesson-cbt-forward-curved-fan-power-curve` 연결
  - 선택지 4개와 canonical choice ID를 1:1 매핑
  - 운영 공개는 하지 않음

기술 근거는 전향곡선형 다익 팬의 동력 요구가 풍량 증가에 따라 크게 증가하고, 후향형 팬은 비과부하 특성을 보이는 일반 팬 곡선이다.

### 3.2 `2013-4-Q84` 공압 시퀀스 고장대처

보기 1~3은 고장단계와 신호를 추적하는 정상 진단절차이며, 4번의 전기·압축공기 격리도 정비 전 안전조치다. 따라서 부적절한 보기가 없어 단일정답이 성립하지 않는다.

- 상태: `choice_conflict`
- 채점: 비활성화
- 직접 이론: `lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict`
- 개념군: `s1-g08 공압 회로·시스템`

### 3.3 `2012-4-Q08` dry-run 재배정 취소

Dry-run에서 제안된 `U-308` 통합은 선택지와 정답 계약이 일치하지 않았다. 실제 신뢰성 척도 보기와 직접 이론을 소유한 기존 `U-1099`를 유지했다.

- mapping class: `DRY_RUN_REASSIGNMENT_OVERRIDDEN_BY_DIRECT_CANONICAL_REVIEW`
- variant 전용 선택지 계약 전까지 공개 차단

### 3.4 HOLD 활성 정답 우회 차단

음성 테스트에서 HOLD 레코드에 `reviewedAnswerIndex`와 `reviewedAnswerText`를 임의로 넣어도 기존 validator가 거부하지 않는 계약 공백을 발견했다. `validateHoldRecord`를 추가해 다음을 강제했다.

- `reviewedAnswerIndex === null`
- `reviewedAnswerText === ""`
- `choiceIdMapping.length === 0`
- `review.verdict === "HOLD"`
- `review.issueLabel === "필수 이미지 확인"`
- `review.scoringDisposition === "excluded_required_image"`
- `required_source_image_review` blocker 존재
- HOLD 사유 1개 이상 존재

`2012-4-Q36` 변조 fixture가 이제 `Reviewed CBT image hold is invalid` 오류로 차단된다.

## 4. 신규 직접 이론·canonical overlay

- 신규 이론 레슨 2건
  - `lesson-cbt-forward-curved-fan-power-curve`
  - `lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict`
- canonical overlay 2건
  - `U-1072`
  - `U-1089`
- 모두 `contentStatus: in_review`, `publication.readiness: blocked`

## 5. 필수 이미지 HOLD

- `2012-4-Q36`
- `2012-4-Q43`
- `2012-4-Q57`
- `2012-4-Q93`
- `2013-4-Q17`
- `2013-4-Q46`

원문 이미지·해시·독립 풀이 근거는 보존했으나 정답 번호를 임의 승인하지 않았다.

## 6. 선택지 계약

- canonical 선택지 1:1 매핑 완료: 35
- variant 전용 선택지 계약 대기: 158

variant 전용 계약 대기 문항은 canonical 문자 유사도 fallback을 사용하지 않으며 `variant_specific_choice_contract_pending` blocker가 제거되기 전에는 공개할 수 없다.

## 7. 검증

통과:

- 200문항 exact-set·원문 해시·직접 이론 연결
- 누적 800문항 ID 중복 및 상태 집계
- generator idempotency
- 독립 Python 검증
- TypeScript 구문검사
- 보조 대상 범위 TypeScript 검사
- 보조 런타임 공개·채점 게이트 시뮬레이션
- Supabase reviewed 800행 전체 `draft`
- 제출 전 payload 금지 답안 필드 0건
- 변조 음성 테스트 7종
- 보조 reviewed-CBT verifier

공식 PASS로 보고하지 않음:

- Node.js 24 전체 typecheck
- Vitest
- ESLint
- 공식 `verify-no-answer-leak`
- SQL migration 테스트
- 로그인·게스트 브라우저 통합 흐름

현재 환경은 Node.js v22.16.0이고 프로젝트 의존성이 설치되지 않았다.

## 8. 보존·Git 상태

- 원본 `content.json` SHA-256: `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`
- reviewed manifest SHA-256: `5c643f7361d617d454289fa04dbbdebd3fcb2ebc4cc9c7eac8542d4dd5b808f1`
- Git commit 없음
- push·PR·deploy 없음
