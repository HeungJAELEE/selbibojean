# CBT 시스템 실제 이식 배치 10 보고서

- 범위: 2019년 2회 Q51~Q100 + 2020년 1·2회 B형 Q01~Q100 + 2020년 3회 B형 Q01~Q50
- 총 레코드: 200
- candidate: 187
- 필수 이미지 HOLD: 10
- 정답키 충돌 HOLD: 1
- 선택지 충돌 비채점: 2
- canonical 재배정: 2
- canonical taxonomy repair: 1
- 신규 직접 이론 레슨: 0
- canonical replacement overlay: 1
- canonical 선택지 1:1 매핑 완료: 39
- variant 전용 선택지 계약 대기: 148
- 저맥락 시험기준 등록: 31
- 식·단위·대입·결과 구조: 7

## 필수 이미지 HOLD

- `2019-2-Q94`
- `2019-2-Q99`
- `2020-12B-Q05`
- `2020-12B-Q08`
- `2020-12B-Q10`
- `2020-12B-Q85`
- `2020-12B-Q87`
- `2020-3B-Q04`
- `2020-3B-Q14`
- `2020-3B-Q39`

## 선택지 충돌

- `2019-2-Q86`: SVRDY 설명과 PTP 설명이 모두 틀려 1번과 4번이 동시에 오답이다. 단일정답 채점에서 제외한다.
- `2020-12B-Q92`: 원문 최종답안 자체가 3번과 4번을 복수정답으로 처리했으므로 단일정답 채점에서 제외한다.

## 정답키 충돌

- `2020-3B-Q28`: 복원 정답은 1번이나 독립 기술 풀이에서는 4번이다. 검토 패킷도 REVISE·hold로 판정했으므로 독립 답안을 자동 적용하지 않고 `answer_key_correction_pending_runtime_validation` 상태로 격리한다.

## canonical 교정

- `2020-12B-Q75`: U-325에서 우발고장기 윤활보전 문제군 U-787로 재배정한다.
- `2020-3B-Q26`: U-060에서 속도저하로스 문제군 U-1109로 재배정한다.
- `2020-12B-Q86`: U-478의 문항·정답·기존 lesson-qnsesu는 유지하고 conceptGroup만 s1-g02에서 액추에이터 s1-g06으로 교정한다. 기존 `2007-4-Q84` 감사 레코드는 바이트 불변으로 유지하며 runtime canonical overlay가 taxonomy를 대체한다.

## 공개 경계

- 모든 배치 10 레코드는 candidate, hold 또는 choice_conflict이며 published는 0건이다.
- 이미지 HOLD 10건, 정답키 충돌 1건, 선택지 충돌 2건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 148건은 canonical 피드백을 재사용하지 않는다.
- 원본 content.json은 패키지에 포함하거나 수정하지 않는다. 저장소 통합 전 기대 SHA를 다시 확인해야 한다.
