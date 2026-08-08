# CBT 시스템 실제 이식 배치 02 — 이론 보강·직접 연결 보고서

- 범위: 2008년 4회 100문항 + 2009년 4회 100문항
- candidate: 189
- 필수 이미지 HOLD: 11
- 신규 직접 이론 레슨: 14
- canonical 추가·교체 overlay: 12
- canonical 선택지와 안전하게 1:1 매핑: 24
- variant 전용 선택지 계약 대기: 165

## 처리 원칙

1. 원본 `content.json`은 수정하지 않는다.
2. 원문 지문·보기·회차·external ID를 보존한다.
3. 2009년 Q01~Q50은 기존 연결을 재사용하지 않고 직접 판단근거로 재분류한다.
4. 누락 이론은 `in_review` 레슨으로 추가하고 자동 공개하지 않는다.
5. 기존 canonical 선택지와 원문 선택지를 안전하게 1:1 대응할 수 없는 문항은 `variantSpecificFeedbackRequired`로 차단한다.
6. 이미지 의존 11건은 정답·채점을 활성화하지 않는다.

## 추가한 이론

- `lesson-cbt-bimetal-temperature` — 바이메탈 온도검출 원리 (2009-4-Q07)
- `lesson-cbt-basic-multimeter` — 기본 회로시험계의 측정범위 (2009-4-Q16)
- `lesson-cbt-average-load` — 평균부하와 전력량·시간 관계 (2009-4-Q21)
- `lesson-cbt-aipe-duties` — AIPE 설비기술자 임무 분류 (2009-4-Q30)
- `lesson-cbt-basic-maintenance-duties` — 기본 보전업무의 범위 (2009-4-Q31)
- `lesson-cbt-tpm-exam-formula` — TPM의 시험식 표현과 실제 범위 (2009-4-Q32)
- `lesson-cbt-actual-data-standard-time` — 실적자료법에 의한 표준시간 설정 (2009-4-Q36)
- `lesson-cbt-cbn-tool-material` — CBN·PCBN 공구재료 (2009-4-Q41)
- `lesson-cbt-shaper-cutting-speed` — 세이퍼 절삭속도 계산 (2009-4-Q46)
- `lesson-cbt-valve-crawl` — 고압증기 밸브의 crawl 현상 (2009-4-Q47)
- `lesson-cbt-ultrasonic-condition-monitoring` — 초음파 상태감시의 적용범위 (2009-4-Q13)
- `lesson-cbt-shaft-assembly-failure` — 축 고장의 조립·정비 원인 (2009-4-Q54)
- `lesson-cbt-shaft-drawing-rules` — 축의 도시방법 (2009-4-Q56)
- `lesson-cbt-poppet-valve-components` — 포핏밸브 폐쇄요소와 스풀밸브 구분 (2009-4-Q84)

## canonical overlay

- `U-1241` — replace — 2009-4-Q07
- `U-1245` — replace — 2009-4-Q16
- `U-1397` — add — 2009-4-Q21
- `U-1395` — add — 2009-4-Q30
- `U-1398` — add — 2009-4-Q31
- `U-1399` — add — 2009-4-Q32
- `U-1252` — replace — 2009-4-Q36
- `U-1253` — replace — 2009-4-Q41
- `U-1396` — add — 2009-4-Q47
- `U-1257` — replace — 2009-4-Q54
- `U-1394` — add — 2009-4-Q56
- `U-1400` — add — 2009-4-Q84

## 공개 경계

- 모든 배치 02 레코드는 `candidate` 또는 `hold`이며 `published`는 0건이다.
- 신규 레슨과 canonical은 모두 `in_review`·`blocked`이다.
- variant 전용 선택지 계약이 필요한 문항은 `variant_specific_choice_contract_pending` blocker를 가진다.
- 필수 이미지 문항은 `required_source_image_review` blocker를 가진다.

## 추가 직접 연결 교정

- `2009-4-Q84`는 기존 `U-754 / 스풀밸브` 연결을 제거하고, 신규 `U-1400 / lesson-cbt-poppet-valve-components`로 교정했다.
- 원문 선택지 `디스크·원추·볼·스풀`과 신규 canonical 선택지 ID를 1:1로 매핑했다.
- 후보 상태에서는 기존과 동일하게 비공개이며, 명시적인 published 승격 모의검사에서 4번 `스풀`이 canonical 정답과 일치함을 확인했다.

## 이미지 때문에 canonical 재구성을 유예한 직접 이론 연결

- `2009-4-Q13`: 초음파 상태감시 레슨을 직접 연결했으나 결함 목록 이미지 판독 전 canonical 교체와 채점을 보류한다.
- `2009-4-Q46`: 세이퍼 절삭속도 식과 단위를 직접 연결했으나 수식 선택지 이미지 판독 전 canonical 선택지 재구성을 보류한다.

## 검증 경계

- 정적 exact-set·해시·직접 연결·공개 게이트, 보조 TypeScript 검사, Node 22 보조 런타임·Supabase 누출 검사는 통과했다.
- 프로젝트가 요구하는 Node.js 24를 현재 환경에서 사용할 수 없어 전체 typecheck, Vitest, ESLint, 공식 `verify-no-answer-leak`는 실행하지 않았다.
