import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vite development wrapper", () => {
  it("forwards preview host and port arguments directly to Vite", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts", "run-vinext-dev.ts"),
      "utf8",
    );

    expect(source).toContain("const vinextArgs = process.argv.slice(2)");
    expect(source).toContain("[viteCli, ...vinextArgs]");
  });
});
