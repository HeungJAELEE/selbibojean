import { describe, expect, it } from "vitest";
import {
  buildCourseReviewFlags,
  classifyCourseDomain,
  classifyCourseHandling,
  classifyCourseRole,
  classifyCourseSourceGroup,
  classifyExamRelevance,
  classifyPracticalTrack,
  cleanCourseTitle,
  extractCourseWeek,
  makeCourseItemId,
  normalizeCoursePath,
} from "@/lib/domain/bda-course-library";

describe("BDA AI 교육자료 인벤토리 규칙", () => {
  it("절대경로가 아닌 NFC 상대경로와 안정 ID를 사용한다", () => {
    const relativePath =
      "AI실무기본_2주차\\03_머신러닝적용을위한데이터처리_I\\시계열강의안.pdf";
    expect(normalizeCoursePath(relativePath)).toBe(
      "AI실무기본_2주차/03_머신러닝적용을위한데이터처리_I/시계열강의안.pdf",
    );
    expect(makeCourseItemId(relativePath)).toBe(makeCourseItemId(relativePath));
    expect(makeCourseItemId(relativePath)).toMatch(/^course_[a-f0-9]{16}$/);
  });

  it("주차·트랙·도메인·역할을 파일 경로에서 분류한다", () => {
    const sql = "2주차/04_SQL시작하기/Day01_dml_lecture.sql";
    expect(classifyCourseSourceGroup(sql)).toBe("foundation-course");
    expect(extractCourseWeek(sql)).toBe(2);
    expect(classifyCourseDomain(sql)).toBe("sql");
    expect(classifyCourseRole(sql, ".sql")).toBe("code");

    const notebook =
      "AI실무기본_3주차/04_머신러닝심화V/민원유형텍스트분류.ipynb";
    expect(classifyCourseDomain(notebook)).toBe("machine-learning");
    expect(classifyCourseRole(notebook, ".ipynb")).toBe("notebook");
    expect(
      classifyPracticalTrack(notebook, "machine-learning", "notebook"),
    ).toBe("type2");
  });

  it("시험 밖 자료를 실기 핵심으로 분류하지 않는다", () => {
    const sql = "2주차/04_SQL시작하기/Day01_dml_lecture.sql";
    const sqlTrack = classifyPracticalTrack(sql, "sql", "code");
    expect(sqlTrack).toBe("supplementary");
    expect(classifyExamRelevance(sqlTrack, "code")).toBe("supplementary");

    const type3 =
      "4주차/04_확률과통계적추론/작업형_제3유형/9회/9_question.ipynb";
    expect(classifyPracticalTrack(type3, "statistics", "notebook")).toBe(
      "type3",
    );
  });

  it("원본 제목을 복제하지 않고 탐색 가능한 표시 제목으로 정리한다", () => {
    expect(cleanCourseTitle("[강의자료] 빅데이터와_파이썬.pdf")).toBe(
      "빅데이터와 파이썬",
    );
  });

  it("데이터 파일은 개인정보와 누수 검토 없이는 실행 자산이 되지 않는다", () => {
    expect(classifyCourseHandling("dataset", ".csv")).toBe("review-before-use");
    expect(
      buildCourseReviewFlags({
        role: "dataset",
        extension: ".csv",
        bytes: 1_000,
      }),
    ).toEqual(["data-leakage-review", "privacy-review"]);
  });
});
