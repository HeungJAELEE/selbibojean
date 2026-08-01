import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("vinext development wrapper", () => {
  it("forwards Playwright hostname and port arguments to vinext", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts", "run-vinext-dev.ts"),
      "utf8",
    );

    expect(source).toContain("const vinextArgs = process.argv.slice(2)");
    expect(source).toContain('[vinextCli, "dev", ...vinextArgs]');
  });
});
