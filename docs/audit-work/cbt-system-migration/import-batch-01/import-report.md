# CBT 시스템 이식 배치 01 — HOLD 재분류 보고서

## 범위

- 대상: `2006-4-Q01~Q100`, `2007-4-Q01~Q100` 총 200문항
- 사용자가 지정한 정책에 따라 기존 HOLD 23건을 재분류했다.
- 원본 `src/data/generated/content.json`, external ID, 회차 URL, 문항번호는 변경하지 않았다.

## 최종 상태

| 상태 | 수량 | 처리 |
|---|---:|---|
| `candidate` | 187 | 검수된 정답·풀이·보기별 근거·이론 연결을 등록했으나 명시적 공개 전까지 학습자 비노출 |
| `choice_conflict` | 6 | `선택지 충돌`로 등록, 충돌 이유를 해설에 보존, 정답·채점 비활성 |
| `hold` | 7 | 필수 이미지 확인 큐로 분리, 이미지 판독 전 정답·채점 비활성 |
| `published` | 0 | 이번 단계에서 공개 승격하지 않음 |
| `unreviewed` | 2,184 | 후속 이식 전 기존 변형 문항의 재출제 차단 |

## 사용자 결정 반영

### 필수 이미지 확인 7건

`2006-4-Q17`, `2006-4-Q37`, `2006-4-Q88`, `2006-4-Q91`, `2007-4-Q02`, `2007-4-Q10`, `2007-4-Q93`

별도 `image-verification-queue.jsonl`에 원문, 이미지 URL·해시, 독립 풀이 범위, 해제조건을 보존했다.

### 원문 손상 최소 정규화 후 등록 5건

`2006-4-Q09`, `2006-4-Q15`, `2006-4-Q84`, `2006-4-Q89`, `2007-4-Q40`

각 레코드는 raw 지문·보기와 원문 SHA를 그대로 유지한다. 학습자 표시에는 사용자 승인 정규화 문구를 사용하며, normalized 지문·보기의 별도 SHA와 교정 사유를 기록했다.

### 선택지 충돌 비채점 등록 6건

`2006-4-Q34`, `2006-4-Q49`, `2006-4-Q60`, `2006-4-Q93`, `2007-4-Q49`, `2007-4-Q66`

각 문항의 `directSolution`은 `선택지 충돌:`로 시작하며, 충돌 선택지 인덱스, 복수·무정답 가능성, 복원 정답 처리방식을 구조화해 기록했다. 정답 인덱스와 choice ID 매핑은 비활성이다.

### 저맥락 시험범위 등록 5건

`2006-4-Q11`, `2007-4-Q36`, `2007-4-Q50`, `2007-4-Q61`, `2007-4-Q82`

당시 교재의 좁은 출제범위에서 복원 정답을 인정하고, 현대 실무의 예외는 `answerConflictOrMultipleAnswerRisk`와 직접 풀이에 별도로 남겼다.

## 안전 게이트

- `candidate`, `choice_conflict`, `hold`, `unreviewed`는 모두 `published`가 아니므로 학습자용 과거 기출·원문 출제 후보에서 제외된다.
- `choice_conflict`와 `hold`는 런타임 `answer`·`explanation`을 빈 값으로 강제한다.
- Supabase 공개상태는 `published`일 때만 허용하는 기존 게이트를 유지한다.
- raw 원문과 정규화 표시문구를 분리해 원문 감사 가능성을 보존했다.

## 정적 검증

- 200 external ID exact-set·중복 검사
- 상태 집계 `187 / 6 / 7`
- raw 지문·ordered choices SHA 재계산
- 정규화 5건 raw·normalized SHA 재계산
- candidate 187건 정답 choice ID 매핑
- 보기별 근거와 표시 선택지 1:1 정렬
- 선택지 충돌 6건 비채점 계약
- 이미지 HOLD 7건 별도 큐·공개 차단
- 이론 `lessonId / lessonAnchor / conceptGroupId / conceptId` 연결
- 원본 `content.json` SHA 무변경

정적 독립 검증 결과는 `hold-resolution-validation.json`에서 PASS다. 추가로 Node.js 22.16.0 환경에서 다음 보조 검사를 통과했다.

- 변경 TypeScript 9개 파일 구문 transpile
- `types.ts`와 reviewed overlay helper의 부분 타입검사
- reviewed overlay helper 실제 실행: `187 candidate / 6 choice_conflict / 7 hold / 2,184 unreviewed`
- Supabase 투영 모의검사: reviewed 200행 전부 draft, 정답·풀이 필드 미포함

이 보조 검사는 Node.js 24 전체 프로젝트 검사를 대체하지 않는다.

## 아직 실행하지 않은 필수 검사

현재 실행환경은 Node.js 22.16.0이고 프로젝트 의존성이 설치돼 있지 않다. 따라서 다음은 PASS로 보고하지 않는다.

- Node.js 24 전체 typecheck
- 관련 Vitest
- 변경 파일 ESLint
- `verify-no-answer-leak`
- 로그인·게스트·세션 병합·제출 통합 흐름
- SQL migration 정적 검사 및 migration 테스트

## Git 상태

- commit 없음
- push·PR·deploy 없음
- 후속 이식 배치에 누적할 로컬 작업본

## 해시

- 원본 content: `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`
- reviewed overlay: `0f1a94956b4aefdc0350262a0e1943251097f4cf3d27862ab9e739e08fb311f3`
- reviewed records: `9f1bd7284cd7cec502d121381b75ce8ad06a0b49d3cc67e989f8cc92df08c934`
