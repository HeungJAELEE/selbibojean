# 필기 문제 직접 풀이·근거 감사 최종 보고서

검수일: 2026-07-23T15:32:52.175Z

## 결과

| 항목 | 수량 |
|---|---:|
| 고정 감사목록 | 281 |
| 기존 검수대기 | 257 |
| 고위험 공개문제 재감사 | 24 |
| 검증 완료 | 186 |
| CBT 정답 보정 | 0 |
| 공개 보류 | 95 |
| 런타임 공개 문제 | 1456 |
| 런타임 공개 레슨 | 1245 |
| 용접안전 공개/보류 | 133 / 17 |

| 과목 | 감사대상 | 검증완료 | CBT 보정 | 정답충돌 | 이미지누락 | 근거부족 |
|---|---:|---:|---:|---:|---:|---:|
| 제1과목 공유압 및 자동제어 | 24 | 15 | 0 | 2 | 5 | 2 |
| 제2과목 용접 및 안전관리 | 152 | 135 | 0 | 0 | 0 | 17 |
| 제3과목 기계설비 일반 | 36 | 3 | 0 | 3 | 1 | 29 |
| 제4과목 설비진단 및 관리 | 69 | 33 | 0 | 4 | 4 | 28 |

## 적용 원칙

- 저장소에 실제 존재하는 문제·보기만 검수했다.
- 정답, 전체 풀이, 네 선택지별 판정, 이론 연결, 근거 URL이 모두 확인된 문제만 공개했다.
- 그림·도면이 답에 필수인데 원본이 없으면 추정하지 않았다.
- 법령·표준·제조사 조건은 적용 범위를 확정하지 못하면 보류했다.
- 보류 문제는 검색·랜덤·모의고사·직접 문제 경로에서 차단한다.
- 답안과 해설은 제출 전 API 응답에 포함하지 않는다.

## 보류 상세

### 정답 충돌 보류 · 9문제

- `U-045` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.
- `U-312` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.
- `U-484` — 기술답은 ③·④ 복수이지만 현재 런타임이 단일정답형이므로 공개 보류가 필요합니다. 다음 조치: 문제유형을 multi_choice로 전환하고 ③·④를 모두 정답으로 저장하거나, 단일 정답이 되도록 지문을 재작성한 뒤 재검수합니다.
- `U-662` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.
- `U-1042` — CBT 공개답과 일반 1차계 기술근거가 충돌하며 지문에 대상 시스템 정의가 없습니다. 다음 조치: 원문에서 대상 시스템과 기준 주파수 정의를 확보합니다. 확보 전에는 보류하고 보드선도 이론에는 -3 dB·-45°를 명시합니다.
- `U-1204` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.
- `U-1212` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.
- `U-1322` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.
- `U-1331` — CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다. 다음 조치: Keep unpublished until an official final answer or higher-level independent evidence resolves the single/multiple-answer conflict.

### 필수 이미지 누락 · 10문제

- `U-035` — 원문 그림·도면이 없어 보기와 CBT 공개답을 독립적으로 확정할 수 없습니다. 다음 조치: Obtain the original asset and re-audit every visual option before publication.
- `U-040` — 원문 그림·도면이 없어 보기와 CBT 공개답을 독립적으로 확정할 수 없습니다. 다음 조치: Obtain the original asset and re-audit every visual option before publication.
- `U-129` — 원문 이미지가 확보되기 전에는 CBT 답안 번호만으로 문항을 공개하면 안 됩니다. 다음 조치: 정식 원문 그림을 확보해 포트·기호·보기 배열을 대조하고, 정확히 복원 가능한 경우에만 자체 SVG를 제작합니다.
- `U-319` — 원문 그림·도면이 없어 보기와 CBT 공개답을 독립적으로 확정할 수 없습니다. 다음 조치: Obtain the original asset and re-audit every visual option before publication.
- `U-332` — 원문 이미지가 확보되기 전에는 CBT 답안 번호만으로 문항을 공개하면 안 됩니다. 다음 조치: 정식 원문 그림을 확보해 포트·기호·보기 배열을 대조하고, 정확히 복원 가능한 경우에만 자체 SVG를 제작합니다.
- `U-477` — 원문 이미지가 확보되기 전에는 CBT 답안 번호만으로 문항을 공개하면 안 됩니다. 다음 조치: 정식 원문 그림을 확보해 포트·기호·보기 배열을 대조하고, 정확히 복원 가능한 경우에만 자체 SVG를 제작합니다.
- `U-722` — 원문 이미지가 확보되기 전에는 CBT 답안 번호만으로 문항을 공개하면 안 됩니다. 다음 조치: 정식 원문 그림을 확보해 포트·기호·보기 배열을 대조하고, 정확히 복원 가능한 경우에만 자체 SVG를 제작합니다.
- `U-772` — 원문 그림·도면이 없어 보기와 CBT 공개답을 독립적으로 확정할 수 없습니다. 다음 조치: Obtain the original asset and re-audit every visual option before publication.
- `U-1014` — 원문 그림·도면이 없어 보기와 CBT 공개답을 독립적으로 확정할 수 없습니다. 다음 조치: Obtain the original asset and re-audit every visual option before publication.
- `U-1345` — 원문 이미지가 확보되기 전에는 CBT 답안 번호만으로 문항을 공개하면 안 됩니다. 다음 조치: 정식 원문 그림을 확보해 포트·기호·보기 배열을 대조하고, 정확히 복원 가능한 경우에만 자체 SVG를 제작합니다.

### 공식·제조사 근거 부족 · 76문제

- `U-267` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-275` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-292` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-363` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-378` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-422` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-450` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-451` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-472` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-510` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-524` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-540` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-541` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-597` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-615` — 현재 확보한 제조사 자료만으로 과거 교재의 보편 수치·구조 명제를 확정할 수 없습니다. 다음 조치: 원문 적용 규격 또는 실린더 제조사 설계기준에서 해당 안전계수 범위를 직접 확인할 때까지 보류합니다.
- `U-666` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-728` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-741` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-819` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-831` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-841` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-867` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-885` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-887` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-892` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-894` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-906` — 현재 확보한 제조사 자료만으로 과거 교재의 보편 수치·구조 명제를 확정할 수 없습니다. 다음 조치: 원문이 가정한 실린더 구조·규격을 확보하고 제조사 설계자료와 대조할 때까지 보류합니다.
- `U-929` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-933` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-962` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-975` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-984` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-987` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1023` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1058` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1077` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1113` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1117` — 정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1120` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1132` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1168` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1169` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1172` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1197` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1202` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1211` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1213` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1215` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1272` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1285` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1318` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1323` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1326` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1327` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1330` — 법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1362` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1363` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1364` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `U-1365` — 법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다. 다음 조치: Obtain the exact standard edition, equipment model manual, or official classification table and re-audit.
- `welding-safety-b33-ws31-q002` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws31-q007` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws31-q013` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws31-q026` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws31-q043` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws32-q014` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws32-q021` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws32-q023` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws32-q025` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws32-q030` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws32-q034` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws33-q015` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws33-q016` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws33-q027` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws33-q042` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws33-q056` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
- `welding-safety-b33-ws33-q057` — Keep unpublished. Do not generalize a model-specific instruction into a universal welding-safety rule. 다음 조치: Identify the equipment manufacturer and model, obtain the current operating or maintenance manual, and repeat the option-by-option audit.
