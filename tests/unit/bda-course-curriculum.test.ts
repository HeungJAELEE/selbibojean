import { describe, expect, it } from "vitest";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import {
  bdaCourseCurriculum,
  getBdaCourseModulesByTab,
} from "@/data/source/bda-course-curriculum";
import { bdaPracticalTabs } from "@/lib/domain/bda-course-curriculum";

describe("BDA 시험 중심 AI 실무 커리큘럼", () => {
  it("모든 실기 탭을 채우고 최소 8개 모듈을 제공한다", () => {
    expect(bdaCourseCurriculum.length).toBeGreaterThanOrEqual(8);
    for (const tab of bdaPracticalTabs) {
      expect(getBdaCourseModulesByTab(tab).length).toBeGreaterThan(0);
    }
  });

  it("각 모듈은 개념, 판단 기준, 실행 순서를 함께 제공한다", () => {
    for (const courseModule of bdaCourseCurriculum) {
      expect(courseModule.conceptIds.length).toBeGreaterThan(0);
      expect(courseModule.examDecisions.length).toBeGreaterThanOrEqual(3);
      expect(courseModule.workflow.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("연결 코드 레슨 ID가 모두 실제 레슨을 가리킨다", () => {
    const labIds = new Set(bdaCodeLabs.map((lab) => lab.id));
    for (const courseModule of bdaCourseCurriculum) {
      for (const labId of courseModule.codeLabIds) {
        expect(labIds.has(labId)).toBe(true);
      }
    }
  });
});
