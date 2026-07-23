import { describe, expect, it } from "vitest";

import {
  buildLessonReturnHref,
  safePracticeReturnTo,
} from "@/lib/domain/practice";

describe("practice-to-theory navigation", () => {
  it("places the query before the lesson anchor", () => {
    expect(
      buildLessonReturnHref(
        "/written/theory/lesson-1#formula",
        "/written/practice/U-001",
      ),
    ).toBe(
      "/written/theory/lesson-1?returnTo=%2Fwritten%2Fpractice%2FU-001#formula",
    );
  });

  it("accepts only internal written-practice return paths", () => {
    expect(safePracticeReturnTo("/written/practice/U-001")).toBe(
      "/written/practice/U-001",
    );
    expect(safePracticeReturnTo("https://example.com")).toBeNull();
    expect(safePracticeReturnTo("//example.com/written/practice/U-001")).toBeNull();
    expect(safePracticeReturnTo("/written/theory/lesson-1")).toBeNull();
  });
});
