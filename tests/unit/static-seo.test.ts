import { describe, expect, it } from "vitest";
import {
  getPublicSitemapPaths,
  normalizeSiteUrl,
  renderRobotsTxt,
  renderSitemapXml,
} from "@/lib/seo/static-seo";

describe("static SEO artifacts", () => {
  const written = {
    lessons: [
      { id: "published lesson", contentStatus: "published" },
      { id: "draft-lesson", contentStatus: "draft" },
    ],
    questions: [{ id: "U-001", contentStatus: "published" }],
  };
  const practical = {
    concepts: [
      { id: "PCON-001", contentStatus: "published" },
      { id: "PCON-SUP-018", contentStatus: "published" },
    ],
    questions: [
      { id: "P-001", contentStatus: "published" },
      { id: "EXP-SUP-018", contentStatus: "published" },
      { id: "P-draft", contentStatus: "review" },
    ],
    studyCategories: [{ id: "formula_calculation" }],
  };
  it("includes only published content and excludes account and admin routes", () => {
    const paths = getPublicSitemapPaths(written, practical).map(
      (entry) => entry.path,
    );

    expect(paths).toContain("/theory");
    expect(paths).toContain("/practical/info");
    expect(paths).toContain("/written/theory/published%20lesson");
    expect(paths).toContain("/practical/written/question/P-001");
    expect(paths).not.toContain("/written/theory/draft-lesson");
    expect(paths).not.toContain("/practical/written/question/P-draft");
    expect(paths).not.toContain(
      "/practical/written/theory/PCON-SUP-018",
    );
    expect(paths).not.toContain(
      "/practical/written/question/EXP-SUP-018",
    );
    expect(paths.some((path) => path.startsWith("/admin") || path.startsWith("/login"))).toBe(false);
  });

  it("renders absolute sitemap and robots URLs from the configured origin", () => {
    const siteUrl = normalizeSiteUrl("https://seolbi.pages.dev");
    const sitemap = renderSitemapXml(
      siteUrl,
      getPublicSitemapPaths(written, practical),
    );

    expect(sitemap).toContain("https://seolbi.pages.dev/theory");
    expect(sitemap).toContain("https://seolbi.pages.dev/written/theory/published%20lesson");
    expect(renderRobotsTxt(siteUrl)).toBe("User-agent: *\nAllow: /\n\nSitemap: https://seolbi.pages.dev/sitemap.xml\n");
  });

  it("rejects a site URL that would create incorrect sitemap URLs", () => {
    expect(() => normalizeSiteUrl("https://seolbi.pages.dev/subdirectory")).toThrow("origin only");
    expect(() => normalizeSiteUrl("ftp://seolbi.pages.dev")).toThrow("http:// or https://");
  });
});
