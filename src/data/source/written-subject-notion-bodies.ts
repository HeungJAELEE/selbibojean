import subjectFour from "@/data/source/written-subject-four-notion-body.json";
import { structureSubjectOneLayout } from "@/data/source/written-subject-one-layout";
import subjectOne from "@/data/source/written-subject-one-notion-body.json";
import { structureSubjectThreeLayout } from "@/data/source/written-subject-three-layout";
import subjectThree from "@/data/source/written-subject-three-notion-body.json";
import { structureSubjectTwoLayout } from "@/data/source/written-subject-two-layout";
import subjectTwo from "@/data/source/written-subject-two-notion-body.json";

export type WrittenSubjectCode = 1 | 2 | 3 | 4;

type NotionBody = {
  subjectCode: number;
  title: string;
  sourceUrl: string;
  retrievedAt: string;
  body: string;
};

const subjectOneStructured = {
  ...subjectOne,
  body: structureSubjectOneLayout(structureSubjectOneBody(subjectOne.body)),
};

const subjectTwoStructured = {
  ...subjectTwo,
  body: structureSubjectTwoLayout(structureSubjectTwoArcWelding(subjectTwo.body)),
};

const subjectThreeStructured = {
  ...subjectThree,
  body: structureSubjectThreeLayout(subjectThree.body),
};

const SUBJECT_BODIES: Record<WrittenSubjectCode, NotionBody> = {
  1: subjectOneStructured,
  2: subjectTwoStructured,
  3: subjectThreeStructured,
  4: subjectFour,
};

const SUBJECT_REVIEW_NOTES: Record<WrittenSubjectCode, string[]> = {
  1: [
    "압력·유량·동력 공식은 단위계를 먼저 맞춘 뒤 적용해야 합니다.",
    "밸브 설정값과 장비별 허용치는 실제 장비 매뉴얼과 승인 작업표준을 우선합니다.",
  ],
  2: [
    "보호구·안전표지·가스 취급 수치는 현행 법령과 승인 작업표준을 우선합니다.",
    "KS 기호와 검사 판정은 적용 규격과 도면 조건을 확인해야 합니다.",
  ],
  3: [
    "KS 재료기호·끼워맞춤·허용온도·체결값은 적용 규격과 장비 매뉴얼을 우선합니다.",
    "원문에 남은 시험 함정 문장은 정답 문장이 아니라 비교·판별용 보기로 읽어야 합니다.",
  ],
  4: [
    "원문 안에서 소음계 Fast·Slow 설명이 서로 반대로 적힌 부분은 충돌 상태로 보존했습니다. 측정 규격과 계기 사용설명서를 우선합니다.",
    "유압유 수분·NAS 등급·탱크 유면·그리스 충전량처럼 장비 조건에 따라 달라지는 수치는 절대 기준으로 사용하지 않습니다.",
    "회전속도 약 0.42~0.48X 설명은 오일 와류와 오일 휩을 구분해 판단해야 합니다.",
  ],
};

export function getWrittenSubjectNotionBody(subjectCode: number) {
  if (subjectCode < 1 || subjectCode > 4) return null;
  const code = subjectCode as WrittenSubjectCode;
  return {
    ...SUBJECT_BODIES[code],
    reviewNotes: SUBJECT_REVIEW_NOTES[code],
  };
}

export function getWrittenSubjectNotionBodyStats(subjectCode: WrittenSubjectCode) {
  const source = SUBJECT_BODIES[subjectCode];
  return {
    characters: source.body.length,
    headings: source.body.match(/^#{2,3}\s/gm)?.length ?? 0,
    tables: source.body.match(/^\| .+ \|$/gm)?.length ?? 0,
  };
}

function structureSubjectOneBody(body: string) {
  return reorderSubjectOneSensorSignals(
    promoteSubjectOneSensorHeadings(
      formatSubjectOneFlowControlValve(body),
    ),
  );
}

function formatSubjectOneFlowControlValve(body: string) {
  const lines = body.split("\n");
  const sectionStart = findRequiredLine(
    lines,
    "### 2.4 유량 제어 밸브 (속도 제어 밸브)",
    "제1과목",
  );
  const sectionEnd = findRequiredLine(
    lines,
    "### 7.3 밸브 제어 및 관로 용어",
    "제1과목",
  );
  const formattedSection = [
    "### 2.4 유량 제어 밸브 (속도 제어 밸브)",
    "",
    "실린더나 모터에 유입·배출되는 유량을 교축(絞縮, Choke/Orifice) 방식으로 조절하여 **액추에이터의 이동 또는 회전 속도를 제어**합니다.",
    "",
    "#### 주요 유량 제어 밸브",
    "",
    "- **교축 밸브 (Throttle Valve)**: 통로의 유효 면적을 조절하여 유량을 제어합니다. 압력이 변하면 통과 유량도 달라질 수 있습니다.",
    "- **온도·압력 보상형 유량 제어 밸브**: 부하 압력이나 작동유 온도에 따른 점도 변화가 있어도 설정 유량의 변화를 줄여 속도를 비교적 일정하게 유지합니다. 정밀 공작기계의 이송 회로 등에 사용합니다.",
    "",
    "> **오답 주의:** 보상형 밸브도 정격 유량·압력·온도 범위와 설정 조건 안에서 작동합니다. ‘항상 무조건 일정하다’는 절대 표현은 피합니다.",
    "",
    "#### 속도 제어 회로 3가지",
    "",
    "1. **미터 인 (Meter-in)**: 실린더로 들어가는 입구 측 유량을 교축합니다. 저항성 부하의 속도 제어에 사용하기 쉽지만, 끌려가는 마이너스 부하에서는 액추에이터가 앞서 나가는 런어웨이가 발생할 수 있습니다. 단동 실린더에는 공급 측 미터 인을 많이 사용하지만 회로 구성·작동 방향·부하 조건에 따라 달라지므로 ‘무조건 미터 인만 사용한다’고 단정하지 않습니다.",
    "2. **미터 아웃 (Meter-out)**: 실린더에서 나가는 출구 측 유량을 교축하여 배압을 형성합니다. 마이너스 부하에서도 속도가 앞서 나가는 현상을 억제해 움직임을 안정시키므로 정밀 이송 회로에 주로 사용합니다.",
    "3. **블리드 오프 (Bleed-off)**: 공급 유량의 일부를 분기해 탱크로 되돌리고, 남은 유량으로 액추에이터 속도를 제어합니다. 불필요한 교축 손실을 줄일 수 있어 동력 효율이 좋지만 부하 변화에 따른 속도 변화에 주의해야 합니다.",
    "",
    "#### 가속·감속 밸브",
    "",
    "- **가속·감속 밸브 (Deceleration Valve)**: 기계식 캠 등의 조작으로 유로를 서서히 닫아 유량을 줄이고, 액추에이터를 충격 없이 감속·정지시킵니다.",
  ];

  return [
    ...lines.slice(0, sectionStart),
    ...formattedSection,
    ...lines.slice(sectionEnd),
  ].join("\n");
}

function promoteSubjectOneSensorHeadings(body: string) {
  return [
    [
      "**※ 광전 스위치의 세부 방식 (검출 거리 비교)**",
      "#### 2.2.1 광전 스위치의 세부 방식 (검출 거리 비교)\n",
    ],
    [
      "1. **[★ 물리량 측정 센서 비교]**",
      "> **물리량별 측정 센서 비교**",
    ],
    [
      "2. **온도 센서 및 변환기 특징**",
      "### 2.3 온도 센서 및 변환기 특징",
    ],
    ["3. **압력 센서 및 압력계**", "### 2.4 압력 센서 및 압력계"],
    [
      "4. **유량 및 액면(수위) 센서**",
      "### 2.5 유량 및 액면(수위) 센서",
    ],
    [
      "5. **회전/각도/변위 센서**",
      "### 2.6 회전·각도·변위 센서",
    ],
  ].reduce(
    (result, [marker, replacement]) =>
      replaceRequiredMarker(result, marker, replacement, "제1과목"),
    body,
  );
}

function reorderSubjectOneSensorSignals(body: string) {
  const lines = body.split("\n");
  const samplingStart = findRequiredLine(
    lines,
    "### 3.3 센서의 측정 데이터 특성과 샘플링 이론",
    "제1과목",
  );
  const performanceStart = findRequiredLine(
    lines,
    "### 3.2 센서의 성능 평가 용어",
    "제1과목",
  );
  const networkStart = findRequiredLine(
    lines,
    "### 3.4 네트워크 구성 형태",
    "제1과목",
  );
  const handlingStart = findRequiredLine(
    lines,
    "### 3.5 공장 자동화 컴포넌트 핸들링",
    "제1과목",
  );

  return [
    ...lines.slice(0, samplingStart),
    lines[performanceStart].replace("### 3.2", "### 3.3"),
    ...lines.slice(performanceStart + 1, networkStart),
    lines[samplingStart].replace("### 3.3", "### 3.4"),
    ...lines.slice(samplingStart + 1, performanceStart),
    lines[networkStart].replace("### 3.4", "### 3.5"),
    ...lines.slice(networkStart + 1, handlingStart),
    lines[handlingStart].replace("### 3.5", "### 3.6"),
    ...lines.slice(handlingStart + 1),
  ].join("\n");
}

function structureSubjectTwoArcWelding(body: string) {
  const lines = body.split("\n");
  const comparisonStart = findRequiredLine(
    lines,
    "### 3. 주요 아크 용접의 종류 및 비교",
  );
  const fundamentalsStart = findRequiredLine(
    lines,
    "### 3.2 아크 발생 원리와 기초 용어",
  );
  const defectsStart = findRequiredLine(
    lines,
    "### 1. 용접 일반 결함 및 불량 원인",
  );
  const co2Start = findRequiredLine(
    lines,
    "### 3.4 이산화탄소 (CO2) 아크 용접",
  );
  const submergedStart = findRequiredLine(
    lines,
    "### 3.5 서브머지드 아크 용접",
  );
  const otherProcessesStart = findRequiredLine(
    lines,
    "### 3.6 가스/기타 아크 및 특수 열원 용접",
  );
  const tigStart = findRequiredLine(lines, "- **TIG (GTAW)**:");
  const migStart = findRequiredLine(lines, "- **MIG (GMAW)**:");
  const remainingProcessesStart = findRequiredLine(
    lines,
    "- **일렉트로 슬래그**:",
  );
  const nextSectionStart = findRequiredLine(
    lines,
    "### 2. 아크 용접 및 가스 용접",
  );

  const reordered = [
    ...lines.slice(0, comparisonStart),
    ...lines.slice(comparisonStart, fundamentalsStart),
    "### 3.2 TIG 용접 (GTAW)",
    ...lines.slice(tigStart, migStart),
    "### 3.3 MIG 용접 (GMAW)",
    ...lines.slice(migStart, remainingProcessesStart),
    ...lines.slice(co2Start, submergedStart),
    ...lines.slice(submergedStart, otherProcessesStart),
    lines[otherProcessesStart],
    ...lines.slice(otherProcessesStart + 1, tigStart),
    ...lines.slice(remainingProcessesStart, nextSectionStart),
    "### 3.7 아크 발생 원리와 기초 용어",
    ...lines.slice(fundamentalsStart + 1, defectsStart),
    ...lines.slice(defectsStart, co2Start),
    ...lines.slice(nextSectionStart),
  ];

  return reordered.join("\n");
}

function findRequiredLine(
  lines: string[],
  prefix: string,
  subject = "제2과목",
) {
  const index = lines.findIndex((line) => line.startsWith(prefix));
  if (index < 0) {
    throw new Error(`${subject} 원문 구조 마커를 찾을 수 없습니다: ${prefix}`);
  }
  return index;
}

function replaceRequiredMarker(
  body: string,
  marker: string,
  replacement: string,
  subject: string,
) {
  if (!body.includes(marker)) {
    throw new Error(`${subject} 원문 구조 마커를 찾을 수 없습니다: ${marker}`);
  }
  return body.replace(marker, replacement);
}
