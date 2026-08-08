# CBT 시스템 실제 이식 배치 08 완료 보고서

## 범위

- 2017년 2회 Q51~Q100
- 2018년 2회 Q01~Q100
- 2018년 4회 Q01~Q50
- 총 200문항
- 기존 external ID·회차 URL·문항번호 보존
- 원본 `src/data/generated/content.json` 무변경 원칙 유지

## 이식 결과

| 상태 | 수량 | 처리 |
|---|---:|---|
| candidate | 191 | 원문·독립 정답·풀이·보기별 근거·직접 이론 연결 완료, 명시 공개 전 |
| choice_conflict | 1 | 선택지 집합으로 단일정답이 성립하지 않아 채점 비활성화 |
| hold | 8 | 필수 이미지 확인 전 활성 정답·채점·choice mapping 비활성화 |
| published | 0 | 자동 공개 없음 |

누적 reviewed overlay는 **1,570문항**입니다. 누적 상태는 candidate 1,496, choice_conflict 15, HOLD 59이며 아직 미이식 문항은 **814개**입니다.

## 핵심 교정

### 2018-4-Q19 — canonical 재배정

- 기존 `U-026` 연결에서 차압식 유량계 문제군 `U-997`로 재배정
- 직접 이론 `lesson-lqjgxa`, `principle`, `s4-g05`, `concept-lqjgxa` 연결
- 원문 선택지 순서에 맞춰 `U-997-c2`, `U-997-c1`, `U-997-c4`, `U-997-c3`으로 1:1 매핑
- 정답은 4번 로터미터이며, external ID·회차 URL·문항번호는 보존

### 2018-4-Q35 — U-649 의미·이론 교정

- 기존 U-649의 ‘보전작업자 팀 조직’ 의미를 이 문항의 ‘공정별 동일기종 집단배치’ 의미로 교정
- 신규 overlay 레슨 `lesson-cbt-gang-system-process-layout` 추가
- 같은 지문을 공유하는 `2015-2-Q23`도 canonical overlay 영향대상으로 명시
- 이전 1,370개 감사 레코드는 바이트 불변으로 유지하고 runtime canonical 의미만 overlay가 대체
- 권위 출처가 확보되지 않았으므로 `lesson_source_needed`와 `pending_runtime_integration` 차단을 유지

이 교정은 검토 패킷에서 직접 확인된 지문·독립 풀이 범위만 재구성한 것입니다. 권위 출처와 전체 런타임 검증 전에는 공개하지 않습니다.

## 선택지 충돌 1건

`2018-2-Q10`은 전위차계·가변저항기·저항온도계·스트레인게이지 네 보기가 모두 저항 또는 저항비 변화를 이용하므로, 복원 선택지만으로 ‘저항 변환 방식과 가장 거리가 먼 것’을 하나로 정할 수 없습니다. `choice_conflict / non_scoring`으로 등록하고 복원 정답은 출처 기록으로만 보존했습니다.

## 필수 이미지 HOLD 8건

- `2017-2-Q60`: 지문의 ‘이 부분’이 가리키는 기어 손상 그림 누락
- `2018-2-Q05`: 스프링 배치 그림과 3·4번 수식 이미지 미판독
- `2018-2-Q21`: 설비관리 조직도 보고선·책임축 미판독
- `2018-2-Q45`: 공·유압 기호 픽셀 미판독
- `2018-2-Q83`: 공압 메모리 회로의 밸브·파일럿 연결 미판독
- `2018-4-Q15`: 진동변위·속도 관계식 선택지 이미지 미판독
- `2018-4-Q18`: 팽창식 체임버 면적비 선택지 이미지 미판독
- `2018-4-Q37`: 설비보전 효과 측정식 선택지 이미지 미판독

여덟 문항은 독립 풀이 원리와 source 기록을 보존했지만 실제 픽셀 판독 전에는 정답 번호·풀이 활성화·choice ID mapping을 승인하지 않습니다.

## 이론·계산·저맥락 경계

| 항목 | 수량 |
|---|---:|
| 직접 이론 연결 | 200/200 |
| 기존 직접 이론 유지 | 198 |
| 기존 canonical·이론 재연결 | 1 |
| 신규 source-gated 이론 레슨 | 1 |
| canonical question overlay 교정 | 1 |
| 식·단위·대입·결과 구조 | 8 |
| 저맥락 시험기준 등록 | 30 |

저맥락 30건은 과거 교재 분류·시험용 단순화·용어 다의성과 현대 실무 기준의 경계를 `riskNote`와 공개 차단 조건에 보존했습니다.

## 선택지 계약

| 구분 | 수량 |
|---|---:|
| canonical 선택지 1:1 매핑 완료 | 38 |
| variant 전용 선택지 계약 대기 | 153 |

variant 전용 선택지 계약 대기 문항은 canonical의 다른 선택지 피드백을 재사용하지 않습니다. 계약이 완료되기 전에는 `published`로 승격할 수 없습니다.

## 검증

통과한 독립·보조 검사:

- 200문항 exact-set·순서·지문/보기/source identity SHA
- 누적 1,570문항 external ID 중복 0건
- 이전 1,370문항 compact SHA 불변
- 직접 lesson·anchor·conceptGroup·concept 200/200 연결
- 이미지 HOLD 8건 비채점 계약
- 선택지 충돌 1건 비채점 계약
- candidate/HOLD/choice_conflict 및 미이식 814건 공개 게이트
- canonical 선택지 38건 정답 choice ID 정합성
- variant 전용 계약 153건 fallback 차단
- Q19 canonical 재배정 계약
- Q35 canonical·이론 교정 및 source-needed 공개 차단
- 저맥락 30건 정책 보존
- 변조 차단 10종 전부 탐지
- 생성기 재실행 결과 24개 소유 산출물 바이트 동일
- Python 생성기·독립검증기·negative validator 문법 검사
- 변경 TypeScript 2개 파일 syntax 검사
- 정답 누출 방지 정적 projection 검사

배치 계약 검증은 **PASS**입니다. manifest SHA-256은 `5bd1b38459c1bc15f3e7426023b5a91e3cc8e75883113a530b22d67dc5666803`이고 records SHA-256은 `058f348998cabc060faa93180071611e05d417acc2e3b729363a28ae5f113c5a`입니다.

## 남은 저장소 최종 검증

현재 실행 환경은 Node.js v22.16.0이고 저장소 요구 버전은 Node.js 24.x입니다. 또한 이 전달 ZIP은 전체 저장소가 아닌 누적 overlay 중심의 부분 스냅샷으로, `content.json`, `scripts/verify-node-runtime.mjs`, 전체 런타임 소스와 설치된 프로젝트 의존성을 포함하지 않습니다.

따라서 다음 항목은 PASS로 보고하지 않습니다.

- Node.js 24 전체 typecheck
- Vitest
- ESLint
- 공식 `verify:reviewed-cbt`
- 공식 `verify:no-answer-leak`
- 실제 `buildRuntimeContent` 및 Supabase materialization
- SQL migration test
- 로그인·게스트·병합·제출 브라우저 흐름

`content.json`은 이번 패키지에서 직접 재해시하지 않았습니다. 배치 07 검증 SHA와 배치 08 dry-run 바인딩 SHA가 모두 `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`로 일치하는 계약만 확인했습니다. 실제 저장소 통합 시 같은 SHA를 선행조건으로 다시 검증해야 합니다.

## Git·배포 상태

- Git 메타데이터 없는 작업 스냅샷
- commit 없음
- push 없음
- PR 없음
- deploy 없음
