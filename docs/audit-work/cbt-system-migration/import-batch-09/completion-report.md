# CBT 시스템 실제 이식 배치 09 완료 보고서

## 범위

- 2018년 4회 Q51~Q100
- 2019년 1회 Q01~Q100
- 2019년 2회 Q01~Q50
- 총 200문항
- 기존 external ID·회차 URL·문항번호 보존
- 원본 `src/data/generated/content.json` 무변경 원칙 유지

## 이식 결과

| 상태 | 수량 | 처리 |
|---|---:|---|
| candidate | 192 | 원문·독립 정답·풀이·보기별 근거·직접 이론 연결 완료, 명시 공개 전 |
| choice_conflict | 1 | 선택지 집합으로 단일정답이 성립하지 않아 채점 비활성화 |
| hold | 7 | 필수 이미지 확인 전 활성 정답·채점·choice mapping 비활성화 |
| published | 0 | 자동 공개 없음 |

누적 reviewed overlay는 **1,770문항**입니다. 누적 상태는 candidate 1,688, choice_conflict 16, HOLD 66이며 아직 미이식 문항은 **614개**입니다.

## 선택지 충돌 1건

`2019-2-Q32`는 복원된 보기 2번과 3번이 모두 일반적인 설비관리 조직원칙에 어긋나 단일정답이 성립하지 않습니다. 목적 달성을 해치지 않는 범위에서 조직은 불필요하게 전문화하기보다 단순화해야 하며, 사람을 수단으로만 취급해서도 안 된다는 독립 검토 결과를 보존했습니다. 이 문항은 `choice_conflict / non_scoring`으로 격리하고 복원 정답은 출처 기록으로만 유지합니다.

## 필수 이미지 HOLD 7건

- `2018-4-Q89`: 정·역회전 전동기 회로의 K1·K2 접점과 인터록 배치 이미지 미판독
- `2019-1-Q01`: 실효값(RMS) 수식 선택지 4개 이미지 미판독
- `2019-1-Q91`: 압력제어밸브 기호의 포트·스프링·드레인·파일럿 연결 미판독
- `2019-1-Q92`: 압력밸브 특성 설명 이미지 미판독
- `2019-1-Q98`: 자기유지 래더 회로의 리셋 우선·접점·코일 연결 미판독
- `2019-2-Q21`: MTTR 수식 선택지 4개 이미지 미판독
- `2019-2-Q35`: OEE 수식 선택지 4개 이미지 미판독

일곱 문항은 독립 풀이 원리와 source 기록을 보존했지만 실제 픽셀 판독 전에는 정답 번호·풀이 활성화·choice ID mapping을 승인하지 않습니다.

## 이론·계산·저맥락 경계

| 항목 | 수량 |
|---|---:|
| 직접 이론 연결 | 200/200 |
| 기존 직접 이론 유지 | 200 |
| canonical 재배정 | 0 |
| canonical 의미·이론 교정 | 0 |
| 신규 이론 레슨 | 0 |
| 식·단위·대입·결과 구조 | 12 |
| 저맥락 시험기준 등록 | 26 |

200문항 모두 검토 패킷의 lesson·anchor·conceptGroup·concept가 dry-run target canonical 이론과 일치했습니다. 저맥락 26건은 과거 교재 분류, 시험용 단순화 또는 실무 경계를 `riskNote`와 직접 이론 연결 상태에 보존했습니다.

## 선택지 계약

| 구분 | 수량 |
|---|---:|
| canonical 선택지 1:1 매핑 완료 | 28 |
| variant 전용 선택지 계약 대기 | 164 |

variant 전용 선택지 계약 대기 문항은 canonical의 다른 선택지 피드백을 재사용하지 않습니다. 계약이 완료되기 전에는 `published`로 승격할 수 없습니다.

## 검증

통과한 독립·보조 검사:

- 200문항 exact-set·순서·지문/보기/source identity SHA
- 누적 1,770문항 external ID 중복 0건
- 이전 1,570문항 compact SHA 불변
- 직접 lesson·anchor·conceptGroup·concept 200/200 연결
- 이미지 HOLD 7건 비채점 계약
- 선택지 충돌 1건 비채점 계약과 충돌 보기 인덱스 `[1, 2]` 보존
- candidate/HOLD/choice_conflict 및 미이식 614건 공개 게이트
- canonical 선택지 28건 정답 choice ID 정합성
- variant 전용 계약 164건 fallback 차단
- canonical 재배정·신규 이론·canonical overlay 없음 확인
- 저맥락 26건 정책 보존
- 변조 차단 10종 전부 탐지
- 생성기 재실행 결과 24개 관리 산출물 바이트 동일
- Python 생성기·독립검증기·negative validator 문법 검사
- 변경 TypeScript 2개 파일 syntax 검사
- 정답 누출 방지 정적 projection 검사

배치 계약 검증은 **PASS**입니다. manifest SHA-256은 `6deeb56ea7bca091eb33bf7f3fe5c582c66d438e5df42ded9a90854074da0d4a`이고 records SHA-256은 `3e10c692103b8e5e3297b3fec0e6f20f45ef061f21f8b0b21e15e13b5dbe168a`입니다.

## 남은 저장소 최종 검증

현재 실행 환경은 Node.js v22.16.0이고 저장소 요구 범위는 Node.js 24.x입니다. 또한 이 전달 ZIP은 전체 저장소가 아닌 누적 overlay 중심의 부분 스냅샷으로 `content.json`, `scripts/verify-node-runtime.mjs`, 전체 런타임 소스와 설치된 프로젝트 의존성을 포함하지 않습니다.

따라서 다음 항목은 PASS로 보고하지 않습니다.

- Node.js 24 전체 typecheck
- Vitest
- ESLint
- 공식 `verify:reviewed-cbt`
- 공식 `verify:no-answer-leak`
- 실제 `buildRuntimeContent` 및 Supabase materialization
- SQL migration test
- 로그인·게스트·병합·제출 브라우저 흐름

`content.json`은 이번 패키지에서 직접 재해시하지 않았습니다. 배치 08 검증 SHA와 배치 09 dry-run 바인딩 SHA가 모두 `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`로 일치하는 계약만 확인했습니다. 실제 저장소 통합 시 같은 SHA를 선행조건으로 다시 검증해야 합니다.

## Git·배포 상태

- Git 메타데이터 없는 작업 스냅샷
- commit 없음
- push 없음
- PR 없음
- deploy 없음
