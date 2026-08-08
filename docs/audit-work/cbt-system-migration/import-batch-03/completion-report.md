# CBT 시스템 실제 이식 배치 03 완료 보고서

## 1. 범위

- 대상 회차: 2010년 4회 100문항, 2011년 4회 100문항
- 총 대상: 200문항
- 기존 `externalId`, 회차 URL, 문항번호 보존
- 원본 `src/data/generated/content.json` 직접 수정 없음
- 검수된 지문·보기·정답·풀이·보기별 근거·이론 연결은 reviewed overlay에 누적
- 운영 자동 공개 없음

## 2. 최종 상태

| 상태 | 수량 | 처리 |
|---|---:|---|
| `candidate` | 190 | 검수 내용을 보존하되 명시적 `published` 승격 전에는 학습자 출제·채점 차단 |
| `choice_conflict` | 2 | 충돌 이유와 보기별 해설을 보존하되 정답·채점 비활성화 |
| `hold` | 8 | 필수 이미지 판독 전 정답·풀이·choice mapping 비활성화 |
| `published` | 0 | 자동 공개 없음 |

누적 상태는 600문항이며 `candidate 566`, `choice_conflict 8`, `hold 26`이다.

## 3. 핵심 교정

### 3.1 `2010-4-Q59` 안전밸브 심머링

- 복원 정답: 1번 `상부 조정 링의 상향 조정`
- 독립 검수 정답: 3번 `하부 조정 링의 상향 조정`
- 처리:
  - 복원 정답 인덱스 `0`은 출처 기록으로 보존
  - 검수 정답 인덱스 `2`는 reviewed candidate와 canonical overlay에 반영
  - 기존 canonical ID `U-1215` 유지
  - 신규 직접 레슨 `lesson-cbt-safety-valve-simmering-correction` 연결
  - 선택지 4개와 canonical choice ID를 1:1 매핑
  - 운영 공개는 하지 않음

직접 근거는 Baker Hughes Consolidated 1811 제품·정비자료의 심머링 조정 절차를 사용했다. 제조사 절차는 하부 조정 링을 단계적으로 위로 올리는 방향을 제시한다. 실제 현장 조정은 밸브 형식별 OEM 매뉴얼과 승인 절차를 우선해야 한다.

- 제품 자료: https://valves.bakerhughes.com/consolidated/safety-valves/type-1811-safety-valve
- 정비 절차 미러: https://manualzz.com/doc/70891025

### 3.2 선택지 충돌 2건

#### `2011-4-Q42` 캐비테이션 방지조건

제시된 네 조치는 모두 캐비테이션을 줄이는 방향이다.

1. `NPSHa > NPSHr` 확보
2. 흡입 실양정 감소
3. 양흡입 구조 적용
4. 회전수 저하

따라서 “잘못된 것”이 없으며 단일정답이 성립하지 않는다. `choice_conflict`·비채점으로 등록했다.

#### `2011-4-Q59` 기어 언더컷

- 3번은 언더컷이 잇수가 적을 때 발생한다는 원리와 반대이므로 틀리다.
- 2번도 전위 방향을 한정하지 않고 표준기어가 전위기어보다 항상 강하다고 단정하므로 일반적으로 틀리다.

두 개의 틀린 보기가 존재하므로 `choice_conflict`·비채점으로 등록했다.

### 3.3 canonical 재배정 2건

| 문항 | 변경 전 | 변경 후 | 이유 |
|---|---|---|---|
| `2010-4-Q92` 공압 특징 | `U-561` | `U-1342` | 공압 장점·특징을 직접 설명하는 기존 canonical 사용 |
| `2011-4-Q65` 베어링 윤활 선정 | `U-849` | `U-736` | 속도·하중·점도와 침전가를 직접 비교하는 기존 canonical 사용 |

## 4. 신규 이론과 canonical overlay

### 신규 직접 이론 레슨 3건

- `lesson-cbt-safety-valve-simmering-correction`
- `lesson-cbt-cavitation-choice-conflict`
- `lesson-cbt-gear-undercut-choice-conflict`

모두 `contentStatus: in_review`, `publication.readiness: blocked` 상태다.

### canonical 변경 3건

- `U-1215` — 안전밸브 심머링 정답키 교정
- `U-1161` — 캐비테이션 선택지 충돌 구조 보존
- `U-1166` — 기어 언더컷 선택지 충돌 구조 보존

## 5. 필수 이미지 HOLD 8건

```text
2010-4-Q08
2010-4-Q09
2010-4-Q81
2010-4-Q89
2011-4-Q24
2011-4-Q54
2011-4-Q75
2011-4-Q85
```

각 문항은 원문 지문·문자 보기·이미지 URL·해시·독립 판단근거를 보존했다. 이미지가 정답 번호나 기호 판정에 필수이므로 픽셀 확인 전에는 정답·풀이·선택지 매핑을 활성화하지 않는다.

## 6. 선택지 계약

| 구분 | 수량 |
|---|---:|
| canonical 선택지 1:1 매핑 완료 | 23 |
| variant 전용 선택지 계약 대기 | 167 |

variant 전용 계약 대기 문항에는 다음 blocker가 유지된다.

```text
pending_runtime_integration
variant_specific_choice_contract_pending
```

기존 canonical 문구와 원문 선택지가 다를 때 문자 유사도 fallback으로 잘못된 선택지 피드백을 재사용하지 않는다.

## 7. 누적 카운트 오류 수정

초기 반복 생성 과정에서 이전 배치의 HOLD 정책 수가 중복 가산되어 다음처럼 잘못 집계되는 문제를 발견했다.

```text
잘못된 중간값: 이미지 34 / 정규화 8 / 선택지 충돌 10
정확한 exact-set: 이미지 26 / 정규화 5 / 선택지 충돌 8
```

생성기를 이전 값에 더하는 방식에서 전체 배치 exact-set을 다시 합산하는 방식으로 변경했다. 이후 두 번 연속 생성한 15개 소유 산출물의 바이트와 SHA가 모두 동일해 멱등성을 확인했다.

## 8. 검증

### PASS

- 200문항 exact-set 및 순서
- 누적 600문항 external ID 고유성
- 지문 SHA-256·ordered choices SHA-256·source identity 재계산
- 200문항 직접 이론 연결
- 신규 레슨·canonical overlay digest
- candidate 190 / conflict 2 / hold 8 상태 계약
- Q59 복원답 보존과 검수답 교정
- 선택지 충돌 2건 비채점 계약
- 필수 이미지 8건 격리
- 선택지 1:1 매핑 23건
- variant 전용 선택지 계약 대기 167건 공개 차단
- 보조 TypeScript 대상 범위 타입검사
- 변경 TypeScript 구문검사
- 보조 reviewed-CBT 검증기
- 보조 런타임 공개 승격 모의검사
- Supabase reviewed 600행 전체 `draft`
- 사전 제출 payload 금지 답안 필드 0건
- 변조 차단 음성 테스트 6종
- 생성기 2회 멱등성
- 원본 `content.json` SHA 불변

### BLOCKED / NOT RUN

현재 환경은 Node.js `v22.16.0`이며 저장소 요구사항은 `>=24.0.0 <25`이다. 프로젝트 의존성도 설치되어 있지 않아 다음을 공식 PASS로 보고하지 않는다.

- Node.js 24 저장소 전체 typecheck
- Vitest
- ESLint
- 공식 `verify-no-answer-leak`
- 전체 `verify:reviewed-cbt` 실행: `zod` 미설치로 중단
- SQL migration 테스트
- 로그인·게스트 브라우저 통합 흐름

## 9. 변경 경계

배치 02 작업본과 비교한 제품 파일 변경은 다음 3개뿐이다.

- `src/data/generated/cbt-reviewed-variants.json`
- `scripts/verify-reviewed-cbt-variants.ts`
- `tests/unit/reviewed-cbt-variants.test.ts`

그 밖의 신규 파일은 모두 `docs/audit-work/cbt-system-migration/import-batch-03/`의 감사·생성·검증 산출물이다.

Git commit, push, PR, deploy는 수행하지 않았다.
