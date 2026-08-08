# CBT 시스템 실제 이식 배치 05 완료 보고서

## 범위

- 2014년 2회 Q01~Q100
- 2014년 4회 Q01~Q100
- 총 200문항
- 기존 external ID·회차 URL·문항번호 보존
- 원본 `src/data/generated/content.json` 무변경

## 이식 결과

| 상태 | 수량 | 처리 |
|---|---:|---|
| candidate | 191 | 원문·독립 정답·풀이·보기별 근거·직접 이론 연결 완료, 명시 공개 전 |
| choice_conflict | 1 | 충돌 이유 보존, 활성 정답·채점 비활성화 |
| hold | 8 | 필수 이미지 확인 전 활성 정답·채점 비활성화 |
| published | 0 | 자동 공개 없음 |

누적 reviewed overlay는 1,000문항이며 candidate 950, 선택지 충돌 10, 이미지 HOLD 40입니다. 아직 미이식 문항은 1,384개입니다.

## 핵심 교정

### 2014-4-Q87 — 스크루압축기 정답키 교정

- 복원 정답: 4번
- 독립 검토 정답: 2번
- 기존 canonical `U-990`과 기존 이론 `lesson-117o0xo` 유지
- 원문 보기 순서와 canonical 보기 순서가 달라 `U-990-c2, U-990-c3, U-990-c1, U-990-c4`로 명시 매핑
- candidate 상태에서는 차단되며, 명시적 published 모의검사에서 canonical 정답키와 일치함을 확인

### 2014-2-Q40 — 선택지 충돌

- 2번과 3번이 함께 틀려 단일정답이 성립하지 않음
- `choice_conflict / non_scoring`으로 등록
- 내부 해설과 충돌 인덱스 `[1,2]`는 보존하고 학습자용 답안·풀이·선택지 매핑은 비활성화

### 2014-4-Q51 — canonical 의미 재배정

- 기존 `U-100`에서 동일 원문 canonical `U-362`로 재배정
- 직접 이론 `lesson-w8vtqs`, `s3-g06` 연결
- canonical 선택지와 원문 선택지의 1:1 계약이 없으므로 `variant_specific_choice_contract_pending` 유지

## 이론 연결

- 직접 이론 연결: 200/200
- 기존 직접 이론 유지: 199
- 기존 이론 재연결: 1
- 신규 이론 레슨: 0
- 신규 canonical overlay: 0
- 남은 직접 이론 공백: 0

기존 이론이 직접 판단근거를 이미 제공하는 경우 중복 이론을 만들지 않았습니다.

## 계산형 구조

| 문항 | 식·판정 |
|---|---|
| 2014-2-Q26 | `t_e=(a+4m+b)/6`; 선택지 수식 이미지 확인 전 번호 HOLD |
| 2014-2-Q96 | 단위 부궤환 `C/R=G/(1+G)`; 블록선도 부호 확인 전 HOLD |
| 2014-4-Q57 | `L10=(C/P)^3`, 하중 1/2이면 수명 `2^3=8배`, 3번 |
| 2014-4-Q97 | `S=h·a/360`; 수식 이미지 확인 전 번호 HOLD |

네 문항 모두 식·단위·대입·결과 필드를 완성했습니다.

## 필수 이미지 HOLD 8건

`2014-2-Q26`, `2014-2-Q50`, `2014-2-Q90`, `2014-2-Q96`, `2014-4-Q54`, `2014-4-Q90`, `2014-4-Q91`, `2014-4-Q97`

이미지 URL·해시·텍스트 근거는 보존하되, 정답 번호나 기호 판정에 필수인 픽셀을 확인하기 전에는 활성 정답과 채점을 허용하지 않습니다.

## 선택지 계약

| 구분 | 수량 |
|---|---:|
| canonical 선택지 1:1 매핑 완료 | 37 |
| 그중 수동 검증 매핑 | 1 |
| variant 전용 선택지 계약 대기 | 154 |

variant 전용 선택지 계약 대기 문항은 canonical 문자 유사도 fallback을 사용하지 않으며 계약 완성 전에는 공개할 수 없습니다.

## 검증

통과한 독립·보조 검사:

- 200문항 exact-set·순서·지문/보기/source identity SHA
- 누적 1,000문항 external ID 중복 0건, 이전 800문항 불변
- 직접 lesson·anchor·conceptGroup·concept 연결
- 정답키 교정·선택지 충돌·canonical 재배정 계약
- candidate/choice_conflict/HOLD 공개 게이트
- Supabase reviewed 1,000행 전체 draft 및 사전 DTO 금지 답안 필드 0건
- source 범위 보조 답안 누출 검사
- 변조 차단 7종
- TypeScript 구문검사와 보조 대상 범위 typecheck
- 생성기 2회 실행 결과 17개 생성 산출물 바이트 동일

공식 저장소 명령은 실제로 실행을 시도했으나 현재 Node.js가 v22.16.0이고 저장소는 Node.js 24.x를 요구하며 프로젝트 의존성이 설치되지 않아 차단됐습니다. Node.js 24 전체 typecheck, Vitest, ESLint, 공식 `verify:reviewed-cbt`, 공식 `verify:no-answer-leak`은 PASS로 보고하지 않습니다.

## Git·배포 상태

- 현재 작업본은 Git 메타데이터가 없는 저장소 스냅샷
- Git commit 없음
- push 없음
- PR 없음
- deploy 없음
