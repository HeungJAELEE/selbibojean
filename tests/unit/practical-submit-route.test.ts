import { describe, expect, it } from "vitest";

import { formatPracticalSourcePage } from "@/lib/content/practical-source-page";

describe("practical submit source page labels", () => {
  it("uses the verified printed NCS page when a PDF page is unavailable", async () => {
    const page = formatPracticalSourcePage({
      sourceKind: "ncs",
      ncsCode: "1502010504",
      documentTitle: "기본측정기 사용",
      version: "20v3",
      pdfPage: null,
      printedPage: 17,
      figureNumber: null,
      performanceCriteria: "2-1 측정기 및 필요한 보조 기구의 선정",
      sourceFileHash: "test-hash",
      sourceUrl: "https://example.test/source",
    });

    expect(page).toBe("인쇄 p.17");
    expect(page).not.toContain("확인 중");
  });
});
