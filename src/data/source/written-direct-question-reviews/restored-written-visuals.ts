import type { WrittenDirectQuestionReview } from "./schema";

export const RESTORED_WRITTEN_VISUAL_REVIEWS = [
  {
    questionId: "U-722",
    subjectId: "subject-1",
    decision: "approve",
    correctChoiceId: "U-722-c2",
    directSolution:
      "유체동력 기호에서 속이 빈 삼각형은 공압 매체를 나타내고, 삼각형의 꼭짓점이 원 중심을 향하면 압축공기 에너지를 회전 출력으로 바꾸는 모터를 뜻한다. 따라서 제시된 기호는 공압모터이다.",
    choiceRationales: [
      {
        choiceId: "U-722-c1",
        verdict: "incorrect",
        rationale:
          "공압실린더는 피스톤과 로드를 사각형 계열로 나타내는 직선운동 액추에이터다. 원과 안쪽 방향 삼각형으로 구성된 회전형 기호와 구조가 다르다.",
      },
      {
        choiceId: "U-722-c2",
        verdict: "correct",
        rationale:
          "속이 빈 삼각형은 공압을, 원 중심을 향하는 방향은 유체 에너지를 기계적 회전으로 바꾸는 모터 작용을 나타내므로 공압모터가 맞다.",
      },
      {
        choiceId: "U-722-c3",
        verdict: "incorrect",
        rationale:
          "유압펌프는 액체를 나타내는 채운 삼각형과 원 바깥쪽을 향하는 토출 방향으로 구별한다. 제시 도해의 매체와 에너지 변환 방향이 모두 다르다.",
      },
      {
        choiceId: "U-722-c4",
        verdict: "incorrect",
        rationale:
          "에어탱크는 압축공기를 저장하는 용기이며 회전운동을 만드는 에너지 변환기가 아니다. 원 안의 방향 삼각형을 사용하는 모터 기호로 표시하지 않는다.",
      },
    ],
    misconception:
      "원형 기호만 보고 펌프와 모터를 혼동하거나, 삼각형의 채움과 방향을 함께 읽지 않는 오류이다.",
    existingLessonId: "lesson-49lr6o",
    existingBlockId: "source",
    assertionText:
      "속이 빈 삼각형이 원 중심을 향하는 기호는 압축공기를 회전 출력으로 바꾸는 공압모터를 나타낸다.",
    evidenceUrls: [
      "https://cbtbank.kr/exam/de20180428",
      "https://cbtbank.kr/exam/de20150919",
      "https://cbtbank.kr/exam/de20111002",
      "https://www.festo.com/gb/en/e/blog/in-practice/create-circuit-diagrams-with-fluiddraw-id_1517386",
    ],
    reviewedAt: "2026-08-10T18:00:00.000+09:00",
  },
] satisfies WrittenDirectQuestionReview[];
