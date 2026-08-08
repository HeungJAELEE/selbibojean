# CBT 시스템 실제 이식 배치 12 완료 보고서

## 판정

```text
BATCH_CONTRACT_STATUS: PASS
REPOSITORY_FINAL_VALIDATION_STATUS: NOT_RUN
```

배치 12는 세션 45~48 독립 검토 자료를 배치 11 누적 overlay에 이식한 최종 범위 배치다. 이번 PASS는 **배치 산출물·불변성·공개 차단 계약**에 대한 판정이며, Node.js 24 전체 저장소 검증이나 실제 배포 완료를 의미하지 않는다.

## 처리 범위

| 회차 | 범위 | 문항 수 |
|---|---:|---:|
| 2021년 2회 | Q01~Q100 | 100 |
| 2021년 4회 | Q01~Q20 | 20 |
| 2022년 | 독립 검토 완료 선별 문항 | 102 |
| **합계** |  | **222** |

기존 external ID, 등록 회차 URL, 문항번호를 보존했다.

## 배치 12 결과

| 상태 | 수량 | 의미 |
|---|---:|---|
| `candidate` | **210** | 정답·직접 풀이를 보존한 공개 전 상태 |
| `hold` | **11** | 필수 이미지 판독 전 정답·채점·choice mapping 차단 |
| `choice_conflict` | **1** | 복수정답 확인으로 단일정답 채점 차단 |
| `published` | **0** | 자동 공개 없음 |

원자료의 publication candidate는 208건이다. 나머지 candidate 2건은 정답은 확정됐지만 taxonomy가 잘못 연결되어 있어 이론 공개를 별도로 차단한 `2022-1-Q61`, `2022-2-Q65`다.

- 직접 이론 연결: **222/222**
- canonical 선택지 1:1 매핑: **45**
- variant 전용 선택지 계약 대기: **165**
- 저맥락 시험기준 등록: **30**
- 식·단위·대입·결과 구조: **11**
- canonical 재배정: **6**
- 신규 이론 레슨: **0**
- canonical replacement overlay: **0**
- 정답키 교정·충돌: **0**

## 필수 이미지 HOLD 11건

| 문항 | 독립 확인 전 차단한 요소 |
|---|---|
| `2021-2-Q01` | 지문과 선택지의 진동 관계식 이미지 |
| `2021-2-Q06` | 베어링 결함주파수 수식 이미지 |
| `2021-2-Q27` | 설비 네트워크 계통도 |
| `2021-2-Q97` | 방향제어밸브 조작 기호 |
| `2021-4-Q05` | RMS 수식 선택지 이미지 |
| `2022-1-Q75` | 유압 기호 지문·선택지 이미지 |
| `2022-1-Q80` | 베르누이 관계식 선택지 이미지 |
| `2022-2-Q13` | 파형 라벨 도식 |
| `2022-2-Q14` | 스프링 관계식 선택지 이미지 |
| `2022-2-Q22` | 수리율 관계식 선택지 이미지 |
| `2022-2-Q27` | 품질보전 단계 원문 이미지 |

11건 모두 복원 답 번호와 독립 풀이 원리를 감사 기록으로만 보존했다. 실제 픽셀 판독 전에는 `reviewedAnswerIndex`, `reviewedAnswerText`, `choiceIdMapping`, active scoring, publication eligibility를 활성화하지 않는다.

## 선택지 충돌 1건

### `2021-2-Q13`

반사테이프와 광원을 이용한 회전수 측정 문항은 확정답안에서 **1번 광전식 검출법과 4번 회전주기 측정법이 함께 인정**됐다. 따라서 다음 계약으로 격리했다.

```text
runtimeStatus: choice_conflict
scoringDisposition: non_scoring
acceptedChoiceIndices: [0, 3]
reviewedAnswerIndex: null
choiceIdMapping: []
```

가답안 4번을 단일정답으로 자동 채택하지 않는다.

## canonical 재배정 6건

| 문항 | 기존 | 변경 | 직접 비교 기준 |
|---|---|---|---|
| `2022-1-Q02` | `U-RMS-001` | `U-812` | `2016-4-Q06` |
| `2022-1-Q31` | `U-187` | `U-829` | `2016-4-Q37` |
| `2022-1-Q43` | `U-197` | `U-136` | `2014-2-Q51` |
| `2022-1-Q70` | `U-210` | `U-1180` | `2011-4-Q87` |
| `2022-2-Q40` | `U-233` | `U-640` | `2018-4-Q23` |
| `2022-2-Q44` | `U-237` | `U-661` | `2018-2-Q47` |

6건은 target canonical의 직접 이론 계약으로 재연결했다. 그중 원문 선택지가 canonical 선택지와 완전히 일치하지 않는 문항은 `variant_specific_choice_contract_pending`을 유지한다.

## taxonomy 교정 대기 2건

| 문항 | 현재 연결 | 원자료가 지시한 범위 | 처리 |
|---|---|---|---|
| `2022-1-Q61` | `U-208`, `s1-g08` | 유압 유량·속도제어 계열 | 정확한 target conceptGroup ID 미확정, overlay 미적용 |
| `2022-2-Q65` | `U-250`, `s1-g02` | 공압 액추에이터·방향제어 계열 | 정확한 target conceptGroup ID 미확정, overlay 미적용 |

원자료는 두 taxonomy 오연결을 확인하지만 유일한 replacement conceptGroup ID까지 확정하지 않는다. 따라서 임의로 `s1-g05` 또는 `s1-g08`을 적용하지 않았다. 정답·직접 풀이는 candidate로 보존하되 다음 게이트를 유지한다.

```text
canonical_theory_repair_exact_target_pending
pending_runtime_integration
variant_specific_choice_contract_pending
```

## 누적 최종 범위

| 항목 | 배치 11까지 | 배치 12 완료 후 |
|---|---:|---:|
| 누적 이식 | 2,162 | **2,384** |
| `candidate` | 2,057 | **2,267** |
| `hold` | 87 | **98** |
| `choice_conflict` | 18 | **19** |
| 미이식 | 222 | **0** |

```text
이전 2,162 records SHA-256
36f0ba1340ae854d10015eef0aacc5f0445248c809a270f569f07e8d0a8cd0e8

현재 2,384 records SHA-256
6abd78b3582d8a05c01c715cbd8379db48ee99ea473f60102c69fd33b1cc9d42

현재 manifest 파일 SHA-256
b2a614eb26faadad231c30bb7eb69e55c18dfc9c28f8350515f7a50d6a4cfac5
```

2,384개 source external ID가 모두 누적 manifest에 존재한다. 다만 이식 완료와 공개 완료는 다르다. 전체 reviewed 레코드의 `published` 상태는 0건이며, 학습자 노출에는 별도 승인과 런타임 검증이 필요하다.

## 검증 결과

다음 검사는 PASS다.

- 배치 222문항 exact-set·순서 및 누적 2,384 external ID 고유성
- 지문·ordered choices·등록/해결 source identity SHA 재계산
- 이전 2,162 레코드 compact SHA 불변
- 배치 상태 `candidate 210 / hold 11 / choice_conflict 1`
- 누적 상태 `candidate 2,267 / hold 98 / choice_conflict 19`
- 직접 lesson·anchor·conceptGroup·concept 연결 222/222
- 이미지 HOLD 11건과 선택지 충돌 1건의 비채점 계약
- canonical 선택지 1:1 매핑 45건
- variant 전용 계약 165건의 canonical 피드백 fallback 차단
- canonical 재배정 6건
- unresolved taxonomy 2건의 임의 overlay 방지
- 저맥락 30건과 계산 구조 11건
- 독립 Python 재검증
- 변조 시나리오 **14/14 탐지**
- 생성기 재실행 관리 산출물 **30개 바이트 동일**
- Python 구문 검사
- 변경 TypeScript 2개 파일의 Node strip-types 및 TypeScript parser 구문 검사
- 정적 publication gate 및 pre-submit answer-leak 검사

## 저장소 전체 공식 검증 경계

공식 명령은 실제 실행을 시도했지만 PASS로 판정하지 않았다.

```text
현재 Node.js: v22.16.0
저장소 요구 범위: >=24.0.0 <25
```

부분 전달본에는 전체 저장소, `content.json`, `scripts/verify-node-runtime.mjs`, `node_modules`, `tsx`, 전체 TypeScript·ESLint 실행 환경이 없다.

- typecheck, Vitest, ESLint: pre-script에 필요한 `verify-node-runtime.mjs` 부재와 Node 버전 경계로 차단
- `verify:reviewed-cbt`, `verify:no-answer-leak`: `tsx` 부재로 차단
- `buildRuntimeContent`, Supabase materialization, SQL migration, 로그인·게스트·브라우저 흐름: 미실행

저장소 통합 전 `src/data/generated/content.json`은 다음 SHA와 일치해야 한다.

```text
7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4
```

## Git·배포 상태

```text
commit: 없음
push: 없음
pull request: 없음
deploy: 없음
```
