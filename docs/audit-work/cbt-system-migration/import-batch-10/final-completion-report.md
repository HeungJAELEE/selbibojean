# CBT 시스템 실제 이식 배치 10 완료 보고서

## 범위

- 2019년 2회 Q51~Q100
- 2020년 1·2회 통합 B형 Q01~Q100
- 2020년 3회 B형 Q01~Q50
- 총 200문항
- 기존 external ID·회차 URL·문항번호 보존
- 원본 `src/data/generated/content.json` 무변경 원칙 유지

## 이식 결과

| 상태 | 수량 | 처리 |
|---|---:|---|
| candidate | 187 | 원문·독립 정답·풀이·보기별 근거·직접 이론 연결 완료, 명시 공개 전 |
| choice_conflict | 2 | 선택지 집합으로 단일정답이 성립하지 않아 채점 비활성화 |
| hold | 11 | 필수 이미지 10건과 정답키 충돌 1건의 정답·채점·choice mapping 비활성화 |
| published | 0 | 자동 공개 없음 |

누적 reviewed overlay는 **1,970문항**입니다. 누적 상태는 candidate 1,875, choice_conflict 18, HOLD 77이며 아직 미이식 문항은 **414개**입니다.

## 선택지 충돌 2건

- `2019-2-Q86`: SVRDY는 준비완료 상태신호이지 ±10 V 속도명령이 아니며, PTP도 중간 궤적을 원으로 만드는 제어가 아닙니다. 1번과 4번이 동시에 틀려 단일정답이 성립하지 않습니다.
- `2020-12B-Q92`: 실린더 정지추력은 `F=pA`로 계산하므로 행정거리가 필요하지 않고, 원문도 최종답안에서 3번과 4번을 복수정답 처리했다고 명시합니다. 단일정답 채점이 불가능합니다.

두 문항은 `choice_conflict / non_scoring`으로 격리하고 복원 정답은 출처 기록으로만 보존합니다.

## 정답키 충돌 HOLD 1건

`2020-3B-Q28`의 복원 정답은 1번이지만 독립 기술 풀이에서는 4번입니다. 집중보전은 관리감독, 특수기능자 활용, 대형작업 인원동원에 유리하고, 긴급작업의 신속성은 분산보전 쪽 장점에 가깝습니다. 검토 패킷도 `REVISE`로 판정했으므로 독립 답안을 자동 적용하지 않고 다음 상태로 격리했습니다.

```text
runtimeStatus: hold
issueLabel: 정답키 충돌
reviewedAnswerIndex: null
choiceIdMapping: []
publicationGate: answer_key_correction_pending_runtime_validation
```

## 필수 이미지 HOLD 10건

- `2019-2-Q94`: 선형 스텝모터 이송거리 수식 선택지 이미지 미판독
- `2019-2-Q99`: 유압 회로도 미판독
- `2020-12B-Q05`: 정류 회로와 파형 이미지 미판독
- `2020-12B-Q08`: 비감쇠 고유진동수 수식 선택지의 복원 누락·불완전
- `2020-12B-Q10`: 진동 가속도 수식 선택지 3개 미복원
- `2020-12B-Q85`: 공압 밸브 간략기호 선택지 미판독
- `2020-12B-Q87`: 법칙 설명 본문 이미지 미판독
- `2020-3B-Q04`: 물리효과 설명 본문 이미지 미판독
- `2020-3B-Q14`: 토리첼리 유량식 선택지 이미지 미판독
- `2020-3B-Q39`: 설비 분류 판단용 보기 이미지 미판독

열 문항은 독립 풀이 원리와 source 기록을 보존했지만 실제 픽셀 판독 전에는 정답 번호·풀이 활성화·choice ID mapping을 승인하지 않습니다.

## canonical 재배정 2건

### `2020-12B-Q75`

```text
U-325 → U-787
중복 근거: 2017-2-Q64
직접 이론: lesson-1kx5x2w / trap / s4-g08
```

우발고장기간의 윤활보전 문제군으로 재배정했습니다. 원문 선택지와 canonical 선택지의 1:1 계약은 아직 없어 `variant_specific_choice_contract_pending`을 유지합니다.

### `2020-3B-Q26`

```text
U-060 → U-1109
중복 근거: 2012-4-Q40
직접 이론: lesson-c16ieq / principle / s4-g09
```

속도저하로스 문제군으로 재배정했으며 canonical choice ID 1:1 매핑까지 완료했습니다.

## U-478 canonical taxonomy 교정

`2020-12B-Q86`은 canonical 문항과 정답 및 기존 `lesson-qnsesu`를 유지하면서 conceptGroup만 교정했습니다.

```text
canonical: U-478
기존 conceptGroup: s1-g02
교정 conceptGroup: s1-g06
lesson: lesson-qnsesu
concept: concept-qnsesu
영향 문항: 2007-4-Q84, 2020-12B-Q86
```

텔레스코프 실린더는 액추에이터 개념군에 속하므로 `s1-g06`으로 연결했습니다. 과거 1,770개 감사 레코드는 바이트 불변으로 유지하고 runtime canonical overlay가 taxonomy를 대체합니다. 전체 저장소 런타임 검증 전에는 공개하지 않도록 `canonical_theory_repair_runtime_validation` 게이트를 설정했습니다.

## 이론·계산·저맥락 경계

| 항목 | 수량 |
|---|---:|
| 직접 이론 연결 | 200/200 |
| 기존 직접 이론 유지 | 197 |
| 기존 이론 재연결 | 3 |
| canonical 재배정 | 2 |
| canonical taxonomy 교정 | 1 |
| 신규 이론 레슨 | 0 |
| canonical replacement overlay | 1 |
| 식·단위·대입·결과 구조 | 7 |
| 저맥락 시험기준 등록 | 31 |

신규 이론 레슨은 만들지 않았습니다. 모든 문항은 기존 lesson·anchor·conceptGroup·concept 또는 검증된 target canonical 계약에 직접 연결됩니다.

## 선택지 계약

| 구분 | 수량 |
|---|---:|
| canonical 선택지 1:1 매핑 완료 | 39 |
| variant 전용 선택지 계약 대기 | 148 |

variant 전용 선택지 계약 대기 문항은 canonical의 다른 선택지 피드백을 재사용하지 않습니다. 계약이 완료되기 전에는 `published`로 승격할 수 없습니다.

## 검증

통과한 독립·보조 검사:

- 200문항 exact-set·순서·지문/보기/source identity SHA
- 누적 1,970문항 external ID 중복 0건
- 이전 1,770문항 compact SHA 불변
- 직접 lesson·anchor·conceptGroup·concept 200/200 연결
- 이미지 HOLD 10건 비채점 계약
- 정답키 충돌 1건 비채점·미적용 계약
- 선택지 충돌 2건 비채점 계약과 충돌 인덱스 `[0, 3]`, `[2, 3]` 보존
- canonical 재배정 2건과 target theory 계약
- U-478 canonical taxonomy overlay와 영향 문항 계약
- canonical 선택지 39건 정답 choice ID 정합성
- variant 전용 계약 148건 fallback 차단
- 저맥락 31건 정책 보존
- 변조 차단 10종 전부 탐지
- 생성기 재실행 결과 26개 관리 산출물 바이트 동일
- Python 생성기·독립검증기·negative validator 문법 검사
- 변경 TypeScript 2개 파일 syntax 검사
- 정답 누출 방지 정적 projection 검사

배치 계약 검증은 **PASS**입니다.

```text
manifest SHA-256:
7b6d0d4cb66892976399094e433ed2f852c1aeaf11fe5e81afeeacb7b4c2b9fc

records SHA-256:
e3f9b46efe3f48d1560508eb38d769863486755cf59f060803b4dfd89d7ddd3c
```

## 남은 저장소 최종 검증

현재 실행 환경은 Node.js v22.16.0이고 저장소 요구 범위는 Node.js 24.x입니다. 또한 이 전달 ZIP은 전체 저장소가 아닌 누적 overlay 중심의 부분 스냅샷으로 `content.json`, `scripts/verify-node-runtime.mjs`, 전체 런타임 소스와 설치된 프로젝트 의존성을 포함하지 않습니다.

다음 항목은 PASS로 보고하지 않습니다.

- Node.js 24 전체 typecheck
- Vitest
- ESLint
- 공식 `verify:reviewed-cbt`
- 공식 `verify:no-answer-leak`
- 실제 `buildRuntimeContent` 및 Supabase materialization
- SQL migration test
- 로그인·게스트·병합·제출 브라우저 흐름

`content.json`은 이번 패키지에서 직접 재해시하지 않았습니다. 실제 저장소 통합 시 다음 SHA 일치를 선행조건으로 다시 검증해야 합니다.

```text
7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4
```

## Git·배포 상태

- Git 메타데이터 없는 작업 스냅샷
- commit 없음
- push 없음
- PR 없음
- deploy 없음
