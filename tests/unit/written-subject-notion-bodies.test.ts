import { describe, expect, it } from "vitest";
import {
  getWrittenSubjectNotionBody,
  getWrittenSubjectNotionBodyStats,
  type WrittenSubjectCode,
} from "@/data/source/written-subject-notion-bodies";

const EXPECTED_STATS: Record<
  WrittenSubjectCode,
  { headings: number; minCharacters: number }
> = {
  1: { headings: 82, minCharacters: 50_000 },
  2: { headings: 44, minCharacters: 26_000 },
  3: { headings: 61, minCharacters: 37_000 },
  4: { headings: 40, minCharacters: 44_000 },
};

describe("written subject Notion bodies", () => {
  it("preserves the complete normalized body for all four subjects", () => {
    for (const subjectCode of [1, 2, 3, 4] as const) {
      const source = getWrittenSubjectNotionBody(subjectCode);
      const stats = getWrittenSubjectNotionBodyStats(subjectCode);

      expect(source).not.toBeNull();
      expect(source?.body.length).toBeGreaterThanOrEqual(
        EXPECTED_STATS[subjectCode].minCharacters,
      );
      expect(stats.headings).toBe(EXPECTED_STATS[subjectCode].headings);
      expect(stats.tables).toBeGreaterThan(10);
      expect(source?.body).not.toContain("<table");
      expect(source?.sourceUrl).toBe("private");
    }
  });

  it("keeps representative concepts that were absent from the short summaries", () => {
    expect(getWrittenSubjectNotionBody(1)?.body).toContain(
      "공기압 요소 번호 부여 방식",
    );
    expect(getWrittenSubjectNotionBody(1)?.body).toContain(
      "네트워크 구성 형태",
    );
    expect(getWrittenSubjectNotionBody(2)?.body).toContain(
      "용접 이음과 리벳 이음의 특징 비교",
    );
    expect(getWrittenSubjectNotionBody(2)?.body).toContain(
      "역화(Backfire) / 인화(Flashback) / 역류(Reverse)",
    );
    expect(getWrittenSubjectNotionBody(3)?.body).toContain(
      "재료 기호 (KS 규격) 해독",
    );
    expect(getWrittenSubjectNotionBody(3)?.body).toContain(
      "다듬질 수공구 핵심 규칙",
    );
    expect(getWrittenSubjectNotionBody(4)?.body).toContain(
      "설비 관리 \"절대 수치\" 한계선 암기 노트",
    );
    expect(getWrittenSubjectNotionBody(4)?.body).toContain(
      "자주 보전 (Self-Maintenance) 전개 7단계",
    );
  });

  it("groups the four major arc-welding processes directly after their comparison table", () => {
    const body = getWrittenSubjectNotionBody(2)?.body ?? "";
    const comparison = body.indexOf("### 3.1 용접 종류 핵심 비교표");
    const tig = body.indexOf("### 3.2 TIG 용접 (GTAW)");
    const mig = body.indexOf("### 3.3 MIG 용접 (GMAW)");
    const co2 = body.indexOf("### 3.4 이산화탄소 (CO2) 아크 용접");
    const submerged = body.indexOf("### 3.5 서브머지드 아크 용접");
    const otherProcesses = body.indexOf(
      "### 3.6 가스/기타 아크 및 특수 열원 용접",
    );
    const fundamentals = body.indexOf(
      "### 3.7 아크 발생 원리와 기초 용어",
    );
    const positions = [
      comparison,
      tig,
      mig,
      co2,
      submerged,
      otherProcesses,
      fundamentals,
    ];

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right),
    );
  });

  it("separates the sensor families and restores their learning order", () => {
    const body = getWrittenSubjectNotionBody(1)?.body ?? "";
    const headings = [
      "### 2.1 센서의 기본 분류",
      "### 2.2 위치 및 유무 검출 센서",
      "### 2.3 온도 센서 및 변환기 특징",
      "### 2.4 압력 센서 및 압력계",
      "### 2.5 유량 및 액면(수위) 센서",
      "### 2.6 회전·각도·변위 센서",
      "### 3.1 신호 변환 및 전송",
      "### 3.2 노이즈 발생 원인별 제거/필터링 대책",
      "### 3.3 센서의 성능 평가 용어",
      "### 3.4 센서의 측정 데이터 특성과 샘플링 이론",
      "### 3.5 네트워크 구성 형태",
      "### 3.6 공장 자동화 컴포넌트 핸들링",
    ];
    const positions = headings.map((heading) => body.indexOf(heading));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right),
    );
  });

  it("formats the flow-control valve lesson into readable concept blocks", () => {
    const body = getWrittenSubjectNotionBody(1)?.body ?? "";
    const sectionStart = body.indexOf(
      "### 2.4 유량 제어 밸브 (속도 제어 밸브)",
    );
    const sectionEnd = body.indexOf(
      "### 7.3 밸브 제어 및 관로 용어",
      sectionStart,
    );
    const section = body.slice(sectionStart, sectionEnd);

    expect(section).toContain("#### 주요 유량 제어 밸브");
    expect(section).toContain("#### 속도 제어 회로 3가지");
    expect(section).toContain("\n1. **미터 인 (Meter-in)**");
    expect(section).toContain("\n2. **미터 아웃 (Meter-out)**");
    expect(section).toContain("\n3. **블리드 오프 (Bleed-off)**");
    expect(section).toContain("#### 가속·감속 밸브");
    expect(section).toContain("‘항상 무조건 일정하다’는 절대 표현은 피합니다");
    expect(section).not.toContain("조합.1.");
    expect(section).not.toContain(")**.2.");
  });

  it("publishes conflict notes instead of presenting preserved source text as verified criteria", () => {
    const subjectFour = getWrittenSubjectNotionBody(4);

    expect(subjectFour?.reviewNotes.join(" ")).toContain("Fast·Slow");
    expect(subjectFour?.reviewNotes.join(" ")).toContain("장비");
    expect(subjectFour?.reviewNotes.join(" ")).toContain("오일 와류");
    expect(getWrittenSubjectNotionBody(5)).toBeNull();
  });
});
