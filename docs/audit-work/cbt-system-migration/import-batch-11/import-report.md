# CBT 시스템 실제 이식 배치 11 보고서

- 범위: 2020년 3회 B형 Q51~Q100 + 2020년 4회 Q01~Q100 + 2021년 1회 선별 42문항
- 총 레코드: 192
- candidate: 182
- 필수 이미지 HOLD: 10
- 선택지 충돌 비채점: 0
- 정답키 충돌 HOLD: 0
- canonical 재배정: 1
- 신규 직접 이론 레슨: 0
- canonical replacement overlay: 0
- canonical 선택지 1:1 매핑 완료: 48
- variant 전용 선택지 계약 대기: 134
- 저맥락 시험기준 등록: 25
- 식·단위·대입·결과 구조: 4

## 필수 이미지 HOLD

- `2020-3B-Q62`
- `2020-3B-Q81`
- `2020-3B-Q97`
- `2020-4-Q02`
- `2020-4-Q37`
- `2020-4-Q53`
- `2020-4-Q89`
- `2020-4-Q91`
- `2021-1-Q27`
- `2021-1-Q30`

## canonical 재배정

- `2021-1-Q100`: 현재 U-170은 전기 릴레이·전자접촉기 채터링 문맥이지만 실제 원문은 밸브 시트 타격과 진동·소음을 묻는다. 밸브 채터링 문제군 `U-1236`, `lesson-10hvc85`, `s1-g04`, `concept-10hvc85`로 재배정한다.
- 원문 선택지와 target canonical 선택지가 완전한 1:1 계약은 아니므로 `variant_specific_choice_contract_pending`을 유지한다.

## 공개 경계

- 모든 배치 11 레코드는 candidate 또는 hold이며 published는 0건이다.
- 이미지 HOLD 10건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 134건은 canonical 피드백을 재사용하지 않는다.
- 원본 content.json은 패키지에 포함하거나 수정하지 않는다. 저장소 통합 전 기대 SHA를 다시 확인해야 한다.
