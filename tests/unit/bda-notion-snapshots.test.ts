import { describe, expect, it, vi } from "vitest";
import {
  bdaTextbookSubjects,
  getBdaCanonicalSnapshot,
  getBdaNotionMigrationStats,
  getBdaNotionSnapshots,
  getBdaTextbookSubjectSnapshots,
  sanitizeNotionSnapshot,
} from "@/lib/content/bda-notion-snapshot-repository";

vi.mock("server-only", () => ({}));

describe("BDA Notion full migration snapshots", () => {
  it("preserves all 17 direct child pages inside the site source", () => {
    const snapshots = getBdaNotionSnapshots();
    expect(snapshots).toHaveLength(17);
    expect(new Set(snapshots.map((snapshot) => snapshot.id)).size).toBe(17);
    expect(new Set(snapshots.map((snapshot) => snapshot.notionId)).size).toBe(17);
    expect(snapshots.every((snapshot) => snapshot.contentLines.length > 20)).toBe(true);
  });

  it("matches the audited source structure", () => {
    expect(getBdaNotionMigrationStats()).toEqual({
      pageCount: 17,
      characterCount: 570403,
      tableCount: 280,
      diagramCount: 55,
      exerciseCount: 100,
      imageCount: 0,
    });
  });

  it("has one canonical final source and every historical supplement per subject", () => {
    expect(bdaTextbookSubjects).toHaveLength(4);
    for (const subject of bdaTextbookSubjects) {
      const canonical = getBdaCanonicalSnapshot(subject.id);
      expect(canonical?.revision).toBe("final");
      expect(getBdaTextbookSubjectSnapshots(subject.id).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("renders tables and diagrams while keeping unverified answer blocks off the client", () => {
    for (const subject of bdaTextbookSubjects) {
      const canonical = getBdaCanonicalSnapshot(subject.id);
      expect(canonical).toBeDefined();
      const migrated = sanitizeNotionSnapshot(canonical!);
      expect(migrated.content.length).toBeGreaterThan(25000);
      expect(migrated.content).not.toContain("<table");
      expect(migrated.content).not.toContain("<details");
      expect(migrated.content).not.toContain("> **정답");
      expect(migrated.hiddenExerciseCount).toBeGreaterThanOrEqual(0);
    }

    const allMigrated = bdaTextbookSubjects
      .map((subject) => sanitizeNotionSnapshot(getBdaCanonicalSnapshot(subject.id)!).content)
      .join("\n");
    expect(allMigrated).toContain("| ---");
    expect(allMigrated).toContain("```mermaid");
  });
});
