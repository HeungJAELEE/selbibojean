import type {
  GeneratedContent,
  Lesson,
  LessonBlock,
} from "@/lib/domain/types";

const DOE_SOURCE_URL =
  "https://www.energy.gov/sites/default/files/2016/03/f30/Improving%20Compressed%20Air%20Sourcebook%20version%203.pdf";

const COMPRESSOR_LESSON_IDS = new Set(["lesson-1jbssv6", "lesson-37xkxo"]);

const classificationDefinition = `압축기는 기체에 에너지를 주어 압력을 높이는 기계입니다. 압력을 만드는 원리에 따라 크게 **용적형**과 **동력형(터보형)**으로 구분합니다.

### 1. 용적형 압축기

일정량의 기체를 작업실 안에 가둔 뒤 **체적을 감소**시켜 압력을 높입니다.

| 세분류 | 대표 형식 | 정의·특징 |
|---|---|---|
| 왕복동식 | 피스톤식(단동·복동) | 실린더 안에서 피스톤이 왕복하며 흡입·압축·토출합니다. 비교적 소유량·고압에 유리하지만 맥동과 진동을 관리해야 합니다. |
| 회전식 | 스크루식 | 맞물리는 두 로터 사이에 포획된 기체의 공간을 연속적으로 줄입니다. |
| 회전식 | 베인식 | 편심 로터의 홈에서 출입하는 베인이 작업실을 만들고 회전에 따라 체적을 줄입니다. |
| 회전식 | 루츠식·로브식 | 서로 맞물리지 않는 로브가 일정량의 기체를 흡입측에서 토출측으로 운반합니다. 송풍기 형식으로도 자주 다룹니다. |
| 회전식 | 스크롤식 | 고정 스크롤과 선회 스크롤 사이의 기체 공간이 중심으로 이동하며 작아집니다. |
| 회전식 | 액봉식 | 케이싱 안의 액체 고리가 회전자와 함께 작업실을 형성해 기체를 압축합니다. |

### 2. 동력형(터보형) 압축기

회전차가 기체에 **속도에너지**를 준 뒤 디퓨저나 고정익에서 그 에너지를 압력으로 바꿉니다.

| 세분류 | 흐름 방향과 핵심 |
|---|---|
| 원심식 | 기체가 반경 방향으로 나가며 임펠러와 디퓨저를 거칩니다. 대유량에 유리합니다. |
| 축류식 | 기체가 축 방향으로 흐르며 여러 단의 동익·정익을 지나 압력이 상승합니다. |
| 사류식 | 원심 방향과 축 방향 성분을 함께 이용하는 혼합 흐름 방식입니다. |

> **용어 주의:** ‘용량형’이 아니라 **용적형**이 정확한 분류명입니다. 베인식은 압축기와 유압 펌프 양쪽에서 볼 수 있지만, **기어형은 이 압축기 분류의 대표 형식이 아니라 유압 용적식 펌프에서 주로 분류**합니다.`;

const compressorPrinciple = `### 형식별 작동 순서

1. **왕복식:** 흡입밸브 열림·피스톤 하강 → 기체 흡입 → 흡입밸브 닫힘·피스톤 상승 → 체적 감소와 압축 → 토출압 도달 → 토출밸브 열림·배출
2. **스크루·베인·스크롤 등 회전 용적식:** 흡입 → 작업실에 기체 포획 → 회전에 따라 작업실 체적 감소 → 압력 상승 → 토출
3. **원심·축류 등 동력형:** 흡입 → 임펠러·로터가 기체 가속 → 디퓨저·고정익에서 속도에너지를 압력으로 변환 → 토출

### 시험에서 구분하는 기준

- **체적을 줄인다**는 설명이면 용적형을 먼저 판단합니다.
- **임펠러·동익이 속도에너지를 준다**는 설명이면 동력형을 먼저 판단합니다.
- 왕복식은 비교적 소유량·고압, 원심식은 대유량 운전과 연결해 비교합니다.
- 스크루·베인·루츠·스크롤은 회전 용적식이며, 원심식·축류식·사류식은 동력형입니다.
- 다단압축의 중간냉각은 다음 단으로 들어가기 전 기체 온도를 낮춰 압축일과 토출온도를 줄이는 데 유리합니다.`;

function replaceBlock(
  blocks: LessonBlock[],
  blockId: "definition" | "principle" | "source",
  replacement: Pick<LessonBlock, "title" | "body">,
) {
  return blocks.map((block) =>
    block.id === blockId ? { ...block, ...replacement } : block,
  );
}

function mergeCompressorLesson(lesson: Lesson): Lesson {
  if (!COMPRESSOR_LESSON_IDS.has(lesson.id)) return lesson;

  const isReciprocatingLesson = lesson.id === "lesson-37xkxo";
  const summary = isReciprocatingLesson
    ? [
        "왕복식은 피스톤으로 기체의 체적을 줄이는 용적형 압축기입니다.",
        "작동 순서는 흡입 → 압축 → 토출이며 비교적 소유량·고압에 유리합니다.",
        "스크루·베인 등 회전 용적식과 원심·축류 등 동력형을 구분합니다.",
      ]
    : [
        "압축기는 체적을 줄이는 용적형과 속도에너지를 압력으로 바꾸는 동력형으로 구분합니다.",
        "용적형은 왕복동식과 회전식, 동력형은 원심식·축류식·사류식으로 세분합니다.",
        "형식별 작동 순서를 흡입부터 토출까지 연결해 판단합니다.",
      ];

  let blocks = replaceBlock(lesson.blocks, "definition", {
    title: "정의와 압축기 세분류",
    body: classificationDefinition,
  });
  blocks = replaceBlock(blocks, "principle", {
    title: "작동 원리와 순서",
    body: compressorPrinciple,
  });
  blocks = replaceBlock(blocks, "source", {
    title: "출처와 검토 상태",
    body: `${lesson.blocks.find((block) => block.id === "source")?.body ?? ""}
- 분류·원리 대조: 미국 에너지부, Improving Compressed Air System Performance: A Sourcebook for Industry — ${DOE_SOURCE_URL}
- 검토 메모: 기존 시험자료의 용적형·동력형 구분을 유지하고, 하위 형식과 작동 순서를 공식 기술자료에 맞춰 보강했습니다.`,
  });

  return {
    ...lesson,
    aliases: [
      ...new Set([
        ...lesson.aliases,
        "공기압축기 분류",
        "용적형 압축기",
        "동력형 압축기",
        "터보형 압축기",
      ]),
    ],
    summary,
    blocks: blocks.map((block) =>
      block.id === "summary"
        ? {
            ...block,
            body: summary.map((line, index) => `${index + 1}. ${line}`).join("\n"),
          }
        : block,
    ),
  };
}

export function mergeApprovedCompressorContent(
  content: GeneratedContent,
): GeneratedContent {
  return {
    ...content,
    lessons: content.lessons.map(mergeCompressorLesson),
  };
}
