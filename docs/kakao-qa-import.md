# 설비보전 Q&A 대화 수집 계약

카카오톡 단체대화 TXT는 공개 원자료가 아니라 비공개 사용자 제보 수집본으로 취급한다.
원문·발화자 이름은 저장소와 공개 번들에 복제하지 않는다.

## 실행

```powershell
npx tsx scripts/import-kakao-qa-transcript.ts "C:\path\to\설비보전Q&A.txt"
```

또는 `KAKAO_QA_TRANSCRIPT_PATH` 환경 변수로 입력 경로를 지정한다. 입력은 10MB 이하
`.txt`만 허용하며 결과는 Git에서 제외된 `data/private/`에 생성된다.

- `kakao-qa-review.json`: 익명화 후보, 외부 링크, 출처 라인, 검증 차단 사유
- `kakao-qa-review.md`: 수량 대사와 승격 위치

같은 원본을 다시 실행하면 같은 후보 ID와 내용이 생성된다. 출력의 모든 후보는
`publicationStatus: "held"`이며 자동 공개 승격은 없다.

## 검토 및 승격

| 후보 | 검토 통과 후 소유 파일 |
| --- | --- |
| 시험장 제보 | `src/data/source/practical-test-centers.ts`의 과거·사용자 제보 후보 |
| 장비 제보 | `src/data/source/practical-equipment-models.ts` |
| 준비물 | `src/data/source/practical-candidate-supplies.ts` |
| 시험 복원 | `src/data/source/practical-written-exam-cards.ts` |
| 시각 순서형 복원 | `src/data/source/practical-task-sequences.ts` |
| 공식·교육 링크 | `src/data/source/practical-source-registry.ts` |
| 정답 상충 | `docs/audit-work/`에서 권위 근거 확보 전 유지 |

공개 승격 전에는 다음 Gate를 모두 통과해야 한다.

1. 직접 인용 대신 개인정보 없는 사실 중심 문장으로 다시 작성한다.
2. 정답·수치·안전·장비 주장은 Q-Net, NCS, 제조사 등 권위 출처와 대조한다.
3. 대화의 `사진`·`파일` 표시는 실제 첨부 원본과 이용 권한을 별도로 확보한다.
4. 교육 일정은 현재 공식 페이지를 확인한다.
5. 상업·채용 링크는 시험 학습 콘텐츠에서 제외한다.

## 독립 확인된 공식 자료

대화에서 발견한 링크 중 운영기관 공식 페이지를 다시 열어 확인한 항목은
`src/data/source/practical-training-resources.ts`에 별도로 기록한다. 이 파일은
대화 발췌를 포함하지 않으며, 공개 selector는 종료 과정과 `validThrough`가 지난
시한성 과정을 제외한다.
