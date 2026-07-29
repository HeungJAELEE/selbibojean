import { describe, expect, it } from "vitest";
import { getWrittenSubjectNotionBody } from "@/data/source/written-subject-notion-bodies";
import {
  replaceExactRequired,
  splitExactJoinedMarkers,
} from "@/data/source/written-subject-layout-utils";

function withoutTableRows(body: string) {
  return body
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("|"))
    .join("\n");
}

describe("written subject manual layout", () => {
  it("fails closed when an explicitly reviewed marker disappears", () => {
    expect(() =>
      splitExactJoinedMarkers("기존 본문", ["- **필수 마커**"], "테스트"),
    ).toThrow("원문 구조 마커를 찾을 수 없습니다");
    expect(() =>
      replaceExactRequired("기존 본문", "필수 문장", "교체 문장", "테스트"),
    ).toThrow("원문 구조 마커를 찾을 수 없습니다");
  });

  it("separates the first-subject concept groups without breaking table rows", () => {
    const body = getWrittenSubjectNotionBody(1)?.body ?? "";
    const nonTableBody = withoutTableRows(body);
    const compressorRow = body
      .split("\n")
      .find((line) => line.includes("초킹(Choking)"));

    expect(body).toContain(
      "### Part 2. 설비 보전 및 안전관리 연계 이론\n\n- **서보 기구 (Servo Mechanism)**:",
    );
    expect(body).toContain(
      "#### 4.2. 공기 청정화 기기 (Air Preparation) (★ 배열 순서 최빈출)\n\n공기 압축기에서",
    );
    expect(body).toContain("\n1. **스풀(Spool)형**");
    expect(body).toContain(
      "\n1. 기계적 병진 동작 완료에 따른 **위치 제어",
    );
    expect(body).toContain("\n- **과도 응답 (Transient Response)**");
    expect(body).toContain("\n- **성형 (Star)**");
    expect(nonTableBody).not.toMatch(/[^#\s]#{2,4}\s+/);
    expect(compressorRow?.trimStart()).toMatch(/^\|/);
    expect(compressorRow).toContain("- **초킹(Choking)**");
  });

  it("turns the second-subject joined welding definitions into real lists", () => {
    const body = getWrittenSubjectNotionBody(2)?.body ?? "";

    expect(body).toContain("\n* **피복 아크 용접 (SMAW)**");
    expect(body).toContain("\n* **저항 용접 (Resistance Welding)**");
    expect(body).toContain("\n* **경납땜 (Brazing)**");
    expect(body).toContain("\n* **[★ CO2 용접기 설치 조건]**");
    expect(body).toContain("\n* **언더컷 (Undercut)**");
    expect(body).toContain("\n* **아세틸렌 보관 (세움 방식)**");
    expect(withoutTableRows(body)).not.toMatch(/[^\s]\* \*\*/);
  });

  it("separates the third-subject measurement, machining, gear, and bearing blocks", () => {
    const body = getWrittenSubjectNotionBody(3)?.body ?? "";
    const nonTableBody = withoutTableRows(body);

    expect(body).toContain(
      "#### 1.4 테이퍼 절삭법 및 맨드릴\n\n- **선반의 테이퍼",
    );
    expect(body).toContain(
      "#### 1.2 밀링 가공 심화: 상향 절삭 vs 하향 절삭 (★ 필수 기출)\n\n밀링 커터",
    );
    expect(body).toContain("\n1. **버니어 캘리퍼스**");
    expect(body).toContain("\n1. 복식 공구대를 경사(선회) 시키는 방법");
    expect(body).toContain(
      "\n- **표면 피로(Surface Fatigue)에 의한 순수 손상**",
    );
    expect(body).toContain(
      "\n1. **플레이킹 / 박리 (Flaking / Peeling)**",
    );
    expect(body).toContain(
      "\n- **[★ 너트 고착(Seizure) 원인 및 방지법]**",
    );
    expect(nonTableBody).not.toMatch(/[^#\s]#{2,4}\s+/);
    expect(nonTableBody).not.toMatch(/[^\s]\* \*\*/);
    expect(nonTableBody).not.toMatch(/[^\s]- \*\*/);
  });

  it("keeps the already-separated fourth-subject body intact", () => {
    const body = getWrittenSubjectNotionBody(4)?.body ?? "";
    const nonTableBody = withoutTableRows(body);

    expect(nonTableBody).not.toMatch(/[^#\s]#{2,4}\s+/);
    expect(nonTableBody).not.toMatch(/[^\s]\* \*\*/);
    expect(nonTableBody).not.toMatch(/[^\s]- \*\*/);
    expect(body).toContain("### **4. 보전(Maintenance) 방식의 발전 단계 비교**");
    expect(body).toContain("### **4. 윤활 급유법의 분류 (Oil & Grease Supply Methods)**");
  });
});
