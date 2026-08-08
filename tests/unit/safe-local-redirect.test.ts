import { describe, expect, it } from "vitest";
import { safeLocalRedirect } from "@/lib/auth/safe-local-redirect";

describe("safeLocalRedirect", () => {
  it("keeps same-origin paths with query and hash", () => {
    expect(safeLocalRedirect("/written/mock?mode=all#start")).toBe(
      "/written/mock?mode=all#start",
    );
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%5Cevil.example",
    "/%2F%2Fevil.example",
    "/%5cevil.example",
  ])("rejects cross-origin and backslash redirect %s", (candidate) => {
    expect(safeLocalRedirect(candidate)).toBe("/");
  });

  it("rejects malformed URL encoding", () => {
    expect(safeLocalRedirect("/%E0%A4%A")).toBe("/");
  });
});
