import {
  replaceExactRequired,
  splitExactJoinedMarkers,
} from "@/data/source/written-subject-layout-utils";

const JOINED_BULLETS = [
  "* **로드 패킹 / 피스톤 패킹**",
  "* **종류**",
  "- **초킹(Choking)**",
  "- **누설 손실부**",
  "- **순서 (★)**",
  "- **[★ 회로도 판독 시 주의사항]**",
  "- **자기 유지 회로 (Self-holding)**",
  "- **인터록 회로 (Interlock)**",
  "- **역상 제동 (Plugging)**",
  "- **발전 제동**",
  "- **회생 제동**",
  "- **블록선도 (Block Diagram)**",
  "- **시퀀스 제어의 3대 분류 요소 (★)**",
  "- **[★ 신호 간섭(Signal Overlap) 현상 제거]**",
  "- **과도 응답 (Transient Response)**",
  "- **지연 시간 (Delay Time)**",
  "- **상승 시간 (Rise Time)**",
  "- **정정 시간 (Settling Time)**",
  "- **오버슈트 (Overshoot)**",
  "- **성형 (Star)**",
  "- **환형 (Ring) (★ 빈출)**",
  "- **버스형 (Bus)**",
  "- **망형 (Mesh)**",
] as const;

const JOINED_NUMBERED_ITEMS = [
  "1. **스풀(Spool)형**",
  "2. **포핏(Poppet)형**",
  "3. **로터리(Rotary)형**",
  "1. **AND의 전체 부정 **",
  "2. **OR의 전체 부정 **",
  "2. **거울(미러) 반사형**",
  "3. **직접(확산) 반사형**",
  "1. 기계적 병진 동작 완료에 따른 **위치 제어 (이벤트 제어, Event)**",
  "2. 시간에 종속적인 **시간 제어 (타임 스케줄 카운트, Time Schedule)**",
  "3. 특정 조합에 따른 **조건 제어 (논리 제어, Logic)**",
  "- (※ **오답 함정: “기억 제어(Memory)”는 작동 형태에 따른 시퀀스 대분류 항목이 아닙니다**).",
] as const;

export function structureSubjectOneLayout(body: string) {
  let structured = replaceExactRequired(
    body,
    "#### 4.2. 공기 청정화 기기 (Air Preparation) (★ 배열 순서 최빈출)공기 압축기에서 나온 뜨겁고 수분이 많은 공기를 깨끗하고 시원하게 만드는 과정입니다.",
    "#### 4.2. 공기 청정화 기기 (Air Preparation) (★ 배열 순서 최빈출)\n\n공기 압축기에서 나온 뜨겁고 수분이 많은 공기를 깨끗하고 시원하게 만드는 과정입니다.",
    "제1과목",
  );

  structured = replaceExactRequired(
    structured,
    "### Part 2. 설비 보전 및 안전관리 연계 이론(Servo Mechanism)**:",
    "### Part 2. 설비 보전 및 안전관리 연계 이론\n\n- **서보 기구 (Servo Mechanism)**:",
    "제1과목",
  );

  structured = splitExactJoinedMarkers(
    structured,
    [
      "#### Part 2. 유압 기기 (Hydraulic Systems)",
      "#### 4.2. 공기 청정화 기기 (Air Preparation) (★ 배열 순서 최빈출)",
      ...JOINED_BULLETS,
      ...JOINED_NUMBERED_ITEMS,
    ],
    "제1과목",
  );

  return structured;
}
