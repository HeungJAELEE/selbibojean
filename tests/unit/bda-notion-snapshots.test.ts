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

  it("renders tables and diagrams while replacing source answer blocks with reviewed practice markers", () => {
    for (const subject of bdaTextbookSubjects) {
      const canonical = getBdaCanonicalSnapshot(subject.id);
      expect(canonical).toBeDefined();
      const migrated = sanitizeNotionSnapshot(canonical!);
      expect(migrated.content.length).toBeGreaterThan(25000);
      expect(migrated.content).not.toContain("<table");
      expect(migrated.content).not.toContain("<details");
      expect(migrated.content).not.toContain("> **정답");
      expect(migrated.content).toContain("[[BDA_SOURCE_PRACTICE:");
      expect(migrated.hiddenExerciseCount).toBeGreaterThanOrEqual(0);
    }

    const allMigrated = bdaTextbookSubjects
      .map((subject) => sanitizeNotionSnapshot(getBdaCanonicalSnapshot(subject.id)!).content)
      .join("\n");
    expect(allMigrated).toContain("| ---");
    expect(allMigrated).toContain("```mermaid");
    expect(
      allMigrated.match(/\[\[BDA_SOURCE_PRACTICE:[^\]]+\]\]/g),
    ).toHaveLength(100);
  });

  it("normalizes common Notion equation and divider artifacts before rendering", () => {
    const migrated = sanitizeNotionSnapshot(getBdaCanonicalSnapshot("bda-s1")!);
    expect(migrated.content).toContain("$10^{21}$");
    expect(migrated.content).toContain("$2^{50}$");
    expect(migrated.content).not.toContain("10211021");
    expect(migrated.content).not.toContain("250250");
    expect(migrated.content).not.toContain("판단합니다. ---");
    expect(migrated.content).toContain("A[비즈니스 이해] <--> B[데이터 이해]");
    expect(migrated.content).toContain("$Value(W) \\\\gg Value(K) > Value(I) > Value(D)$");
    expect(migrated.content).not.toContain("Value*Value*");
  });

  it("keeps every canonical Mermaid diagram syntactically valid after migration", async () => {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
    let diagramCount = 0;

    for (const subject of bdaTextbookSubjects) {
      const migrated = sanitizeNotionSnapshot(getBdaCanonicalSnapshot(subject.id)!);
      const diagrams = [
        ...migrated.content.matchAll(/```mermaid\s*\n([\s\S]*?)```/g),
      ].map((match) => match[1].trim());

      diagramCount += diagrams.length;
      for (const [index, diagram] of diagrams.entries()) {
        await expect(
          mermaid.parse(diagram),
          `${subject.id} Mermaid ${index + 1}`,
        ).resolves.toBeTruthy();
      }
    }

    expect(diagramCount).toBeGreaterThan(0);
  });
});
