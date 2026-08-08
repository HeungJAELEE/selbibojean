# CBT 시스템 배치 13 — 저장소 통합 교정 완료 보고서

## 판정

- **배치 계약:** PASS
- **Node 24 런타임 통합 verifier:** PASS (호환 로더 사용)
- **저장소 공식 최종 검증:** BLOCKED — 프로젝트 의존성 미설치
- **신규 문항 이식:** 0건
- **누적 문항:** 2,384/2,384

## 배치 13의 성격

배치 13은 새로운 기출문항을 추가하는 배치가 아니다. 배치 01~12의 누적 overlay를 실제 `content.json`과 런타임 합성 순서에 연결했을 때 발견된 **배치 간 계약 불일치**를 교정한다.

## 교정 내용

1. `U-649`, `U-478` canonical replacement의 이전 질문 digest를 dry-run 재구성값에서 실제 `content.json` 질문 객체 digest로 재결속했다.
2. 뒤 배치의 canonical 교정이 앞 배치 레코드에 전파되지 않았던 `2015-2-Q23`, `2007-4-Q84`의 직접 이론 연결을 수정했다. 기존 배치 06 감사 matrix는 변경하지 않고 배치 13 supersession ledger로 이력을 보존했다.
3. `2018-2-Q10`, `2019-2-Q32`, `2019-2-Q86`, `2020-12B-Q92`, `2021-2-Q13`의 선택지 충돌 필드를 공통 비채점 계약으로 정규화했다.
4. 런타임 HOLD validator가 이미지 HOLD뿐 아니라 `2020-3B-Q28`의 정답키 충돌 HOLD도 검증하도록 분기했다.
5. 과거 written-question audit가 최신 `choice_conflict_non_scoring` canonical gate를 덮어쓰지 못하도록 `U-1161`, `U-1089`의 공개 우선순위를 교정했다.
6. 누적 패키지 조립 과정에서 빠졌던 배치 02~05 source review JSONL 16개를 manifest SHA와 정확히 일치하는 원본으로 복원했다.
7. import-01의 오래된 `lesson-qnsesu:s1-g02` machine repair를 import-13의 `lesson-qnsesu:s1-g06`으로 명시적으로 supersede했다.

## 누적 상태

| 상태 | 수량 |
|---|---:|
| candidate | 2,267 |
| hold | 98 |
| choice_conflict | 19 |
| published | 0 |
| unreviewed | 0 |

100%는 원자료 2,384건이 모두 manifest에 포함됐다는 뜻이다. 98개 HOLD와 19개 선택지 충돌이 남아 있으므로 전 문항 공개·채점 완료를 의미하지 않는다.

## 통과한 검증

- 실제 `content.json` SHA 결속
- 2,384 external ID exact-set 및 중복 0건
- records SHA 및 canonical overlay SHA
- 13개 배치 record offset·상태 수량·source file SHA
- Node.js 24.11.1 런타임 계약
- Node 24 전체 reviewed-CBT verifier
- runtime content 및 Supabase projection 계약
- 소스 범위 답안 유출 검사
- 변경 TypeScript 6개 파일 구문 검사
- Python 독립 검증
- 변조·부정계약 15/15 탐지
- 과거 배치 06 감사 matrix 불변

## 공식 최종 검증 경계

저장소 스냅샷에는 `node_modules`가 없다. 실제 `tsx`, Vitest, ESLint, Next/Vite/Supabase/Playwright 타입 선언도 설치돼 있지 않다. 따라서 다음을 PASS로 보고하지 않는다.

- 의존성 기반 전체 TypeScript typecheck
- Vitest
- ESLint
- production build
- build 결과물 대상 answer-leak 검사
- SQL migration test
- 로그인·게스트·병합·제출 브라우저 통합 흐름

Node 24 자체는 확보돼 `verify:node-runtime`이 PASS했다. CBT verifier와 소스 범위 answer-leak은 로컬 TypeScript 호환 로더로 동일 스크립트 논리를 실행해 PASS했으며, 이 결과는 공식 `tsx` 설치 환경과 구분해 기록했다.

## Git·배포 상태

- commit 없음
- push 없음
- PR 없음
- deploy 없음
