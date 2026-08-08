# CBT 시스템 실제 이식 배치 11 완료 보고서

## 판정

- 배치 계약: **PASS**
- 저장소 전체 최종 검증: **NOT_RUN**
- 공식 저장소 명령은 실행을 시도했으나 Node.js 24·전체 저장소·의존성 부재로 차단됨

## 범위

| 회차 | 범위 | 문항 수 |
|---|---:|---:|
| 2020년 3회 B형 | Q51~Q100 | 50 |
| 2020년 4회 | Q01~Q100 | 100 |
| 2021년 1회 | 독립 검토 완료 선택 42문항 | 42 |
| **합계** |  | **192** |

기존 external ID·회차 URL·문항번호를 보존했다. 배치 10의 누적 1,970문항을 그대로 유지하고 신규 192문항을 뒤에 추가했다.

## 이식 결과

| 상태 | 수량 | 처리 |
|---|---:|---|
| candidate | 182 | 독립 정답·직접 풀이·보기별 근거·직접 이론 연결 완료, 명시 공개 전 |
| hold | 10 | 필수 이미지 확인 전 활성 정답·채점·choice mapping 비활성화 |
| choice_conflict | 0 | 신규 충돌 없음 |
| published | 0 | 자동 공개 없음 |

누적 reviewed overlay는 2,162문항이며 candidate 2,057, HOLD 87, choice_conflict 18이다. 아직 미이식 문항은 222개다.

## 핵심 교정

### 2021-1-Q100 — 밸브 채터링 canonical 재배정

- 기존 연결: `U-170`
- 대상 연결: `U-1236`
- 중복 근거 문항: `2010-4-Q99`
- 직접 이론: `lesson-10hvc85 / principle / s1-g04 / concept-10hvc85`
- 원문 선택지와 canonical 선택지가 완전한 1:1 계약이 아니므로 `variant_specific_choice_contract_pending` 유지
- candidate 상태에서 공개·canonical 선택지 피드백 재사용 차단

배치 11에는 신규 canonical replacement overlay나 신규 이론 레슨을 만들지 않았다.

## 필수 이미지 HOLD 10건

| 문항 | 확인이 필요한 정보 |
|---|---|
| `2020-3B-Q62` | 그리스 시험방법 정의가 들어 있는 빈칸 이미지 |
| `2020-3B-Q81` | 유압 회로의 ⓐ 기호와 배관 연결 |
| `2020-3B-Q97` | 공압 논리회로의 밸브 연결과 정상상태 |
| `2020-4-Q02` | 안정도 판별 문장의 위상조건 이미지 |
| `2020-4-Q37` | 제품종류·생산량 배치도 구역 번호와 경계 |
| `2020-4-Q53` | 지문의 “이 부분”을 가리키는 기어 손상 그림 — 복원 원장에도 이미지 없음 |
| `2020-4-Q89` | 공압 방향제어밸브 기호의 포트·위치·조작방식 |
| `2020-4-Q91` | 물리법칙 설명이 들어 있는 원문 이미지 |
| `2021-1-Q27` | 가용도 공식 선택지 GIF 4개 |
| `2021-1-Q30` | 설비보전 조직도의 지휘선·부서배치 |

이들 문항은 원자료의 복원 답 번호와 독립 풀이 원리를 감사 기록으로 보존했지만 실제 픽셀 판독 전에는 다음 항목을 승인하지 않았다.

- `reviewedAnswerIndex`
- `reviewedAnswerText`
- `choiceIdMapping`
- 활성 채점
- 공개 적격성

## 이론·계산·선택지 계약

| 항목 | 수량 |
|---|---:|
| 직접 이론 연결 | 192/192 |
| 기존 이론 유지 | 191 |
| 대상 canonical 직접 이론으로 재연결 | 1 |
| 신규 이론 레슨 | 0 |
| 신규 canonical overlay | 0 |
| canonical 선택지 1:1 매핑 완료 | 48 |
| variant 전용 선택지 계약 대기 | 134 |
| 저맥락 시험기준 등록 | 25 |
| 식·단위·대입·결과 구조 | 4 |

variant 전용 선택지 계약 대기 문항은 기존 canonical의 다른 보기 피드백을 재사용하지 않는다. 계약 완료 전에는 `published`로 승격할 수 없다.

## 누적 상태

| 항목 | 수량 |
|---|---:|
| 전체 대상 | 2,384 |
| 누적 이식 | 2,162 |
| 미이식 | 222 |
| candidate | 2,057 |
| hold | 87 |
| choice_conflict | 18 |

- 이전 1,970 records SHA-256: `e3f9b46efe3f48d1560508eb38d769863486755cf59f060803b4dfd89d7ddd3c`
- 현재 2,162 records SHA-256: `36f0ba1340ae854d10015eef0aacc5f0445248c809a270f569f07e8d0a8cd0e8`
- 현재 manifest SHA-256: `a2687df8675bb101ce574131ddae5b53abcc4250cb31a8d786e0bd671d7718e9`

## 검증

다음 검사는 통과했다.

- 신규 192문항 exact-set·순서·external ID 고유성
- 지문·보기·source identity SHA 재계산
- 이전 1,970문항 불변
- candidate 182건의 정답·풀이·공개 게이트
- 이미지 HOLD 10건의 비채점·비공개 계약
- 직접 lesson·anchor·conceptGroup·concept 연결 192/192
- canonical 선택지 1:1 매핑 48건 정합성
- variant 전용 계약 134건의 canonical 피드백 차단
- `2021-1-Q100` canonical 재배정
- 저맥락 25건 risk policy
- 식·단위·대입·결과 구조 4건
- 변조 시나리오 12/12 탐지
- 생성기 재실행 관리 산출물 29개 바이트 동일
- Python 생성기·독립 검증기·부정계약 검증기 구문 검사
- 변경 TypeScript 2개 파일 구문 검사
- 정적 publication gate 및 pre-submit answer-leak 검사

## 저장소 전체 검증 경계

공식 명령은 실제 실행을 시도했으나 다음 조건으로 차단됐다.

- 현재 Node.js: `v22.16.0`
- 저장소 요구 범위: `>=24.0.0 <25`
- 전달본은 전체 저장소가 아닌 부분 스냅샷
- `scripts/verify-node-runtime.mjs` 미포함
- `node_modules` 및 `tsx` 미설치
- `src/data/generated/content.json` 미포함

따라서 Node.js 24 전체 typecheck, Vitest, ESLint, 공식 `verify:reviewed-cbt`, 공식 `verify:no-answer-leak`, `buildRuntimeContent`, Supabase materialization, SQL migration test, 로그인·게스트 브라우저 통합 흐름은 PASS로 보고하지 않는다.

실제 저장소 통합 전에는 `content.json`이 다음 SHA와 일치하는지 먼저 확인해야 한다.

`7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`

## 시간 메타데이터 주의

전달받은 배치 10 스냅샷의 `generatedAt`이 배치 11 실행 시각보다 뒤로 기록돼 있다. 따라서 배치 순서는 timestamp가 아니라 `batchId`, 레코드 오프셋, 이전 records SHA로 검증했다. 배치 11은 실제 실행 시각 기준 값을 보존했다.

## Git·배포 상태

- Git commit 없음
- push 없음
- PR 없음
- deploy 없음
