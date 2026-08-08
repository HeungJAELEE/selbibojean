# CBT 시스템 실제 이식 배치 12 보고서

- 범위: 2021년 2회 Q01~Q100 + 2021년 4회 Q01~Q20 + 2022년 선별 102문항
- 총 레코드: 222
- candidate: 210
- 필수 이미지 HOLD: 11
- 선택지 충돌 비채점: 1
- canonical 재배정: 6
- taxonomy repair 적용: 0
- taxonomy repair 대기: 2
- 신규 직접 이론 레슨: 0
- canonical replacement overlay: 0
- canonical 선택지 1:1 매핑 완료: 45
- variant 전용 선택지 계약 대기: 165
- 저맥락 시험기준 등록: 30
- 식·단위·대입·결과 구조: 11
- 누적 이식: 2384/2384

## 필수 이미지 HOLD

- `2021-2-Q01`
- `2021-2-Q06`
- `2021-2-Q27`
- `2021-2-Q97`
- `2021-4-Q05`
- `2022-1-Q75`
- `2022-1-Q80`
- `2022-2-Q13`
- `2022-2-Q14`
- `2022-2-Q22`
- `2022-2-Q27`

## 선택지 충돌

- `2021-2-Q13`: 광전식 검출법과 회전주기 측정법이 확정답안에서 함께 인정돼 단일정답형 채점을 비활성화했다.

## canonical 재배정

- `2022-1-Q02`: U-RMS-001 → U-812 (reference `2016-4-Q06`)
- `2022-1-Q31`: U-187 → U-829 (reference `2016-4-Q37`)
- `2022-1-Q43`: U-197 → U-136 (reference `2014-2-Q51`)
- `2022-1-Q70`: U-210 → U-1180 (reference `2011-4-Q87`)
- `2022-2-Q40`: U-233 → U-640 (reference `2018-4-Q23`)
- `2022-2-Q44`: U-237 → U-661 (reference `2018-2-Q47`)

## taxonomy repair 경계

- `2022-1-Q61`: 현재 재생회로 레슨은 `s1-g08`에 있으나 원자료는 “유압 유량·속도제어 계열”로 이동해야 한다고만 적고 정확한 target conceptGroup ID는 확정하지 않았다.
- `2022-2-Q65`: 현재 스토퍼실린더 고장 레슨은 `s1-g02`에 있으나 원자료는 “공압 액추에이터·방향제어 계열”로 이동해야 한다고만 적고 정확한 target conceptGroup ID는 확정하지 않았다.
- 따라서 두 건은 정답과 직접 풀이를 candidate로 이식하되 canonical taxonomy overlay를 만들지 않고 이론 공개를 차단했다.

## 최종 범위 경계

- 2,384개 source external ID가 모두 누적 manifest에 존재하며 unreviewed count는 0이다.
- 모든 레코드는 candidate, hold 또는 choice_conflict이며 published는 0건이다.
- 이미지 HOLD 11건과 선택지 충돌 1건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 165건은 canonical 피드백을 재사용하지 않는다.
- 원본 content.json은 패키지에 포함하거나 수정하지 않는다. 저장소 통합 전 기대 SHA를 다시 확인해야 한다.
