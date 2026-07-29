import type { GeneratedContent, Lesson, LessonBlock } from "@/lib/domain/types";

const GENERIC_PRINCIPLE_TITLE = "작동 원리와 판단 기준";
const DIRECT_EVIDENCE_MARKER = "**이 문제군의 직접 근거**";

type BackgroundMode = "mechanism" | "quantity" | "sequence" | "diagnosis" | "concept";

const LESSON_BACKGROUND_OVERRIDES: Record<
  string,
  { title: string; body: string }
> = {
  비중: {
    title: "의미·용도와 계산 배경",
    body:
      "**비중이 무엇인가**\n\n비중은 물질의 밀도를 기준물질의 밀도로 나눈 비다. 액체와 고체는 보통 물의 밀도를 기준으로 삼으며, 같은 차원의 양을 나누므로 단위가 없다.\n\n**언제 사용하는가**\n\n재료나 작동유가 기준물질보다 가벼운지 무거운지 빠르게 비교하고, 비중에서 밀도·비중량을 환산하거나 유종을 구분할 때 사용한다. `밀도 = 비중 × 기준밀도`, `비중량 = 밀도 × 중력가속도`의 연결을 함께 본다.\n\n**특징과 대표 오답 연결**\n\n비중은 무차원이고 밀도는 kg/m³ 같은 단위를 갖는다. ‘비중의 단위는 kg/m³이다’, ‘비중과 비중량은 같은 값이다’, ‘비중이 크면 점도도 반드시 크다’는 보기는 서로 다른 물성을 섞은 오답이다.",
  },
  "공압 특징": {
    title: "공기의 성질이 장단점으로 이어지는 배경",
    body:
      "**왜 공압이 빠르고 취급하기 쉬운가**\n\n공기는 비가연성이고 주변에서 쉽게 얻어 사용 뒤 대기로 배출할 수 있으며, 압축해 탱크에 에너지를 저장할 수 있다. 따라서 화재·폭발 위험이 비교적 작고 액추에이터를 빠르게 움직이는 장치에 유리하다.\n\n**왜 정밀 제어에는 불리한가**\n\n공기는 압축되므로 부하가 바뀌면 체적과 속도가 함께 달라지고, 저속에서 일정한 속도와 정확한 중간 위치를 유지하기 어렵다. 압축·누설·배기 과정의 에너지 손실과 배기소음, 수분 관리도 필요하다.\n\n**선정과 대표 오답 연결**\n\n빠른 반복동작·청결·간단한 배기가 중요하면 공압을 검토하고, 큰 힘·저속 안정성·정밀 위치제어가 중요하면 유압이나 전동 방식을 비교한다. ‘공압은 비압축성이라 위치정밀도가 높다’, ‘유압보다 큰 힘을 내기 쉽다’는 보기는 장단점을 뒤바꾼 오답이다.",
  },
  "아베 원리": {
    title: "측정축을 일치시키는 이유와 오차 배경",
    body:
      "**아베의 원리가 말하는 것**\n\n측정하려는 치수선과 눈금 또는 기준선은 가능한 한 같은 직선 위에 놓아야 한다. 두 선이 거리 `h`만큼 떨어진 상태에서 작은 각도 오차 `θ`가 생기면 약 `h·tanθ`의 확대오차가 더해진다.\n\n**언제 적용하는가**\n\n마이크로미터처럼 측정축과 눈금축이 거의 일치하는 구조가 유리하고, 버니어캘리퍼스처럼 눈금이 측정선에서 떨어진 구조는 안내면의 기울기와 측정압 관리가 중요하다.\n\n**대표 오답 연결**\n\n아베의 원리는 눈금 간격을 더 잘게 만드는 분해능 원리가 아니며, 모든 오차를 없애는 법칙도 아니다. 기준선의 오프셋과 각도 오차가 결합해 커지는 것을 줄이는 배치 원리다.",
  },
};

function backgroundMode(lesson: Lesson): BackgroundMode {
  const text = `${lesson.title} ${lesson.aliases.join(" ")}`;
  if (
    /고장|결함|손상|불량|누설|마모|진단|캐비테이션|서징|채터링|스틱슬립/.test(
      text,
    )
  ) {
    return "diagnosis";
  }
  if (/순서|과정|단계|절차|시퀀스|사이클|공정/.test(text)) {
    return "sequence";
  }
  if (
    /비중|비율|율$|계수|지수|공차|압력|유량|속도|시간|주파수|RMS|MTBF|MTTR|가용도|LCC|MAPI|단위|정확도|정밀도|감도|분해능/.test(
      text,
    )
  ) {
    return "quantity";
  }
  if (
    /밸브|펌프|압축기|송풍기|모터|실린더|센서|계기|브레이크|클러치|커플링|베어링|기어|회로|장치|기구|용접/.test(
      text,
    )
  ) {
    return "mechanism";
  }
  return "concept";
}

function directEvidence(block: LessonBlock, lesson: Lesson) {
  const markerIndex = block.body.indexOf(DIRECT_EVIDENCE_MARKER);
  if (markerIndex < 0) return lesson.summary[0];
  const evidence = block.body
    .slice(markerIndex + DIRECT_EVIDENCE_MARKER.length)
    .replace(/^\s*-\s*/gm, "")
    .trim();
  return evidence || lesson.summary[0];
}

function backgroundCopy(
  mode: BackgroundMode,
  lesson: Lesson,
  groupTitle: string,
  evidence: string,
) {
  const override = LESSON_BACKGROUND_OVERRIDES[lesson.title];
  if (override) return override;

  if (mode === "mechanism") {
    return {
      title: "동작 원리와 이해 배경",
      body: `**무엇이 어떻게 작동하는가**\n\n${evidence}\n\n**언제 이 원리를 쓰는가**\n\n${lesson.title} 문제에서는 입력·에너지가 어떤 부품과 경로를 거쳐 출력·운동·측정값으로 바뀌는지 확인합니다. ${groupTitle} 안에서 구조, 작동조건과 적용 대상을 함께 비교해야 이름이 비슷한 기구를 구분할 수 있습니다.\n\n**특징과 오답을 가르는 연결**\n\n입력 → 변환부 → 출력의 순서로 실제 에너지와 힘의 흐름을 그린 뒤, 해당 기구가 할 수 없는 기능을 붙인 보기를 제거합니다.`,
    };
  }

  if (mode === "quantity") {
    return {
      title: "의미·용도와 계산 배경",
      body: `**이 값이 뜻하는 것**\n\n${evidence}\n\n**언제 사용하는가**\n\n${lesson.title}은 ${groupTitle}에서 상태를 비교하거나 계산 결과의 의미를 판정할 때 사용합니다. 식을 적용하기 전에 기준값과 분모·분자, 단위 유무, 측정조건을 먼저 확인해야 합니다.\n\n**특징과 오답을 가르는 연결**\n\n값이 커질 때 실제 물리량이 증가하는지 감소하는지 확인하고, 단위·기준상태·절대값과 비율을 바꾸어 낸 보기를 제거합니다.`,
    };
  }

  if (mode === "sequence") {
    return {
      title: "진행 순서와 단계별 이유",
      body: `**전체 흐름**\n\n${evidence}\n\n**왜 순서를 지키는가**\n\n${lesson.title}은 앞 단계의 결과가 다음 단계의 시작조건이 되는 과정입니다. ${groupTitle} 문제에서는 시작상태, 단계별 입력·출력, 완료조건과 복귀조건을 순서대로 추적합니다.\n\n**특징과 오답을 가르는 연결**\n\n선행조건이 충족되기 전에 다음 단계를 실행하거나 검사·안전확인 단계를 생략한 보기를 우선 제거합니다.`,
    };
  }

  if (mode === "diagnosis") {
    return {
      title: "발생 배경과 진단 연결",
      body: `**어떤 현상인가**\n\n${evidence}\n\n**언제 이 지식을 쓰는가**\n\n${lesson.title}은 ${groupTitle}에서 보이는 증상과 직접 원인을 구분할 때 사용합니다. 발생 위치, 운전조건, 반복 주기와 함께 나타나는 징후를 확인한 뒤 비슷한 고장명과 비교합니다.\n\n**특징과 오답을 가르는 연결**\n\n증상 → 직접 원인 → 확인방법 → 대책 순으로 연결하고, 결과만 비슷하지만 발생원리가 다른 고장명을 붙인 보기를 제거합니다.`,
    };
  }

  return {
    title: "정의를 이해하기 위한 배경",
    body: `**핵심 의미**\n\n${evidence}\n\n**어디에 연결되는가**\n\n${lesson.title}은 ${groupTitle}에서 대상의 특징·용도·적용조건을 구분하는 기준입니다. 정의만 외우지 말고 어떤 대상에 언제 쓰는지, 비슷한 용어와 무엇이 다른지를 함께 확인합니다.\n\n**특징과 오답을 가르는 연결**\n\n정의의 대상·기능·조건을 세 칸으로 나누고, 비슷한 용어의 기능이나 반대 특성을 붙인 보기를 제거합니다.`,
  };
}

export function refineLessonUnderstandingBackground(
  content: GeneratedContent,
): GeneratedContent {
  const groupTitles = new Map(
    content.conceptGroups.map((group) => [group.id, group.title]),
  );

  return {
    ...content,
    lessons: content.lessons.map((lesson) => {
      const genericPrinciple = lesson.blocks.find(
        (block) =>
          block.kind === "principle" &&
          block.title === GENERIC_PRINCIPLE_TITLE,
      );
      if (!genericPrinciple) return lesson;

      const background = backgroundCopy(
        backgroundMode(lesson),
        lesson,
        groupTitles.get(lesson.conceptGroupId) ?? "이 과목",
        directEvidence(genericPrinciple, lesson),
      );

      return {
        ...lesson,
        blocks: lesson.blocks.map((block) =>
          block.id === genericPrinciple.id
            ? {
                ...block,
                title: background.title,
                body: background.body,
              }
            : block,
        ),
      };
    }),
  };
}
