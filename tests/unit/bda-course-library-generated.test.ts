import { describe, expect, it } from "vitest";
import rawLibrary from "@/data/generated/bda-course-library.json";
import { bdaCourseLibrarySchema } from "@/lib/domain/bda-course-library";

describe("생성된 BDA AI 교육자료 인벤토리", () => {
  const library = bdaCourseLibrarySchema.parse(rawLibrary);

  it("원본 539개 파일을 모두 메타데이터 행으로 보존한다", () => {
    expect(library.stats.totalFiles).toBe(539);
    expect(library.items).toHaveLength(539);
    expect(library.stats.totalBytes).toBeGreaterThan(2_000_000_000);
    expect(library.stats.duplicateFiles).toBeGreaterThan(0);
  });

  it("절대경로와 원본 바이너리를 생성 스냅샷에 넣지 않는다", () => {
    const serialized = JSON.stringify(library);
    expect(serialized).not.toMatch(/[A-Z]:\\\\/);
    expect(serialized).not.toContain("C:/Users/");
    expect(library.policy).toEqual({
      sourceBinariesIncluded: false,
      absolutePathsIncluded: false,
      publicDownloadEnabled: false,
      storageMode: "metadata-only",
    });
  });

  it("모든 데이터 자산은 개인정보와 누수 검토 대상으로 유지한다", () => {
    const dataAssets = library.items.filter((item) =>
      ["dataset", "database"].includes(item.role),
    );
    expect(dataAssets.length).toBeGreaterThan(0);
    expect(
      dataAssets.every(
        (item) =>
          item.handling === "review-before-use" &&
          item.reviewFlags.includes("privacy-review") &&
          item.reviewFlags.includes("data-leakage-review"),
      ),
    ).toBe(true);
  });

  it("확장 자료를 시험 핵심으로 위장하지 않는다", () => {
    expect(
      library.items
        .filter((item) =>
          ["deep-learning", "generative-ai", "research"].includes(item.domain),
        )
        .every((item) => item.examRelevance === "supplementary"),
    ).toBe(true);
  });

  it("539개 자료를 실기 직접 대비·선수 지식·보충으로 빠짐없이 분류한다", () => {
    const classified = Object.values(library.stats.byPracticalTrack).reduce(
      (sum, count) => sum + count,
      0,
    );
    expect(classified).toBe(library.stats.totalFiles);
    expect(library.stats.byPracticalTrack.type1).toBeGreaterThan(0);
    expect(library.stats.byPracticalTrack.type2).toBeGreaterThan(0);
    expect(library.stats.byPracticalTrack.type3).toBeGreaterThan(0);
    expect(library.stats.byPracticalTrack.supplementary).toBeGreaterThan(
      library.stats.byPracticalTrack.type1,
    );
  });

  it("중복 파일은 같은 해시의 선행 항목을 canonical로 가리킨다", () => {
    const byId = new Map(library.items.map((item) => [item.id, item]));
    const duplicates = library.items.filter((item) => item.duplicateOf);
    const duplicateGroups = new Set(
      duplicates.map((item) => item.duplicateOf),
    );

    expect(duplicates).toHaveLength(library.stats.duplicateFiles);
    expect(duplicateGroups.size).toBe(22);
    for (const duplicate of duplicates) {
      const canonical = byId.get(duplicate.duplicateOf!);
      expect(canonical).toBeDefined();
      expect(canonical?.sha256).toBe(duplicate.sha256);
      expect(canonical?.duplicateOf).toBeUndefined();
    }
  });
});
