# CBT 시스템 실제 이식 배치 07 완료 보고서

## 범위

- 2016년 2회 Q01~Q20
- 2016년 4회 Q01~Q100
- 2017년 2회 Q01~Q50
- 총 170문항
- 기존 external ID·회차 URL·문항번호 보존
- 원본 `src/data/generated/content.json` 무변경 원칙 유지

## 이식 결과

| 상태 | 수량 | 처리 |
|---|---:|---|
| candidate | 165 | 원문·독립 정답·풀이·보기별 근거·직접 이론 연결 완료, 명시 공개 전 |
| choice_conflict | 0 | 신규 충돌 없음 |
| hold | 5 | 필수 이미지 확인 전 활성 정답·채점 비활성화 |
| published | 0 | 자동 공개 없음 |

누적 reviewed overlay는 **1,370문항**입니다. 누적 상태는 candidate 1,305, choice_conflict 14, HOLD 51이며 아직 미이식 문항은 **1,014개**입니다.

## 필수 이미지 HOLD 5건

- `2016-4-Q10`: 고유진동수 수식 선택지 이미지
- `2016-4-Q26`: 제품종류·생산량 배치영역 그래프
- `2016-4-Q58`: 기하공차 도시 도면
- `2017-2-Q32`: 계측관리 공정명세표 기호
- `2017-2-Q33`: 최적수리주기 도표

다섯 문항은 source URL·image URL·도달 기록·SHA-256·독립 풀이 원리를 원자료에 보존했습니다. 실제 픽셀 판독 전에는 정답 번호·풀이 활성화·choice ID mapping을 승인하지 않습니다.

## 이미지 누락이지만 candidate인 4건

`2016-4-Q70`, `2016-4-Q83`, `2016-4-Q90`, `2017-2-Q43`은 원장에 이미지 누락 또는 그림 관련 메모가 있으나, 지문·보기·그림 설명만으로 판단 계약이 완결됩니다. 이 네 건은 근거와 경계를 `riskNote`에 보존한 뒤 candidate로 등록했습니다.

## 이론·계산·저맥락 경계

| 항목 | 수량 |
|---|---:|
| 직접 이론 연결 | 170/170 |
| 기존 직접 이론 유지 | 170 |
| canonical 재배정 | 0 |
| 신규 이론 레슨 | 0 |
| 신규 canonical overlay | 0 |
| 식·단위·대입·결과 구조 | 8 |
| 저맥락 시험기준 등록 | 32 |

32개 저맥락 문항은 과거 교재·역사적 분류·시험용 단순화와 현대 실무 기준의 차이를 `riskNote`에 남겼습니다. 정답 자체는 독립 풀이와 복원 정답이 일치하지만, 해당 문구를 일반 실무 규칙으로 확대하지 않습니다.

## 선택지 계약

| 구분 | 수량 |
|---|---:|
| canonical 선택지 1:1 매핑 완료 | 29 |
| variant 전용 선택지 계약 대기 | 136 |

variant 전용 선택지 계약 대기 문항은 canonical의 다른 선택지 피드백을 재사용하지 않습니다. 계약이 완료되기 전에는 `published`로 승격할 수 없습니다.

## 검증

통과한 독립·보조 검사:

- 170문항 exact-set·순서·지문/보기/source identity SHA
- 누적 1,370문항 external ID 중복 0건
- 이전 1,200문항 compact SHA 불변
- 직접 lesson·anchor·conceptGroup·concept 연결
- 이미지 HOLD 5건의 비채점 계약
- candidate/HOLD 및 미이식 1,014건 공개 게이트
- canonical 선택지 29건 정답 choice ID 정합성
- variant 전용 계약 136건 fallback 차단
- 저맥락 32건 riskNote·theory status 보존
- 변조 차단 9종 전부 탐지
- 생성기 재실행 결과 22개 소유 산출물 바이트 동일
- Python 생성기·독립검증기·negative validator 문법 검사
- 변경 TypeScript 2개 파일 syntax 검사
- 정답 누출 방지 정적 projection 검사

배치 계약 검증은 **PASS**입니다. manifest SHA-256은 `554131acc5dd2aa67c73eb97ce7336ea542f7c76bbdf92fc57adab42b4472144`이고 records SHA-256은 `b71a7a6567ccc0f4d8fb02d0cb82d0708fe1b4a9b5b82403c3d5849158c5f196`입니다.

## 남은 저장소 최종 검증

현재 실행 환경은 Node.js v22.16.0이고 저장소 요구 버전은 Node.js 24.x입니다. 또한 이 전달 ZIP은 전체 저장소가 아닌 누적 overlay 중심의 부분 스냅샷으로, `content.json`과 설치된 프로젝트 의존성을 포함하지 않습니다.

따라서 다음 항목은 PASS로 보고하지 않습니다.

- Node.js 24 전체 typecheck
- Vitest
- ESLint
- 공식 `verify:reviewed-cbt`
- 공식 `verify:no-answer-leak`
- 실제 `buildRuntimeContent` 및 Supabase materialization
- SQL migration test
- 로그인·게스트·병합·제출 브라우저 흐름

`content.json`은 이번 패키지에서 직접 재해시하지 않았습니다. 대신 배치 06 검증 SHA와 배치 07 dry-run 입력 SHA가 모두 `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`로 일치함을 확인했습니다. 실제 저장소 통합 시 같은 SHA를 선행조건으로 다시 검증해야 합니다.

## Git·배포 상태

- Git 메타데이터 없는 작업 스냅샷
- commit 없음
- push 없음
- PR 없음
- deploy 없음
