import { describe, expect, it } from "vitest";
import { PRACTICAL_CANDIDATE_SUPPLIES } from "@/data/source/practical-candidate-supplies";
import {
  PRACTICAL_PUBLIC_PROBLEMS,
  PRACTICAL_QUALIFICATION_OVERVIEW,
} from "@/data/source/practical-exam-reference";

describe("practical official exam reference", () => {
  it("keeps only the nine official candidate-supply rows", () => {
    expect(PRACTICAL_CANDIDATE_SUPPLIES).toHaveLength(9);
    expect(
      PRACTICAL_CANDIDATE_SUPPLIES.map((item) => item.number),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(
      PRACTICAL_CANDIDATE_SUPPLIES.every(
        (item) => item.commerceUrl === null,
      ),
    ).toBe(true);
  });

  it("separates engineer and industrial-engineer public problems", () => {
    expect(PRACTICAL_PUBLIC_PROBLEMS).toHaveLength(6);
    for (const category of ["pneumatic", "hydraulic", "welding"] as const) {
      const problems = PRACTICAL_PUBLIC_PROBLEMS.filter(
        (problem) => problem.category === category,
      );
      expect(problems).toHaveLength(2);
      expect(problems.map((problem) => problem.qualification).sort()).toEqual([
        "engineer",
        "industrial_engineer",
      ]);
      expect(
        problems.every((problem) =>
          problem.downloadUrl.startsWith(
            "https://www.q-net.or.kr/cst006.do?",
          ),
        ),
      ).toBe(true);
    }
  });

  it("keeps the official score structure visible to the UI", () => {
    expect(PRACTICAL_QUALIFICATION_OVERVIEW.practicalMethod).toContain(
      "필답형 40점",
    );
    expect(PRACTICAL_QUALIFICATION_OVERVIEW.practicalMethod).toContain(
      "공압 20점",
    );
    expect(PRACTICAL_QUALIFICATION_OVERVIEW.practicalPass).toContain(
      "전체 실격",
    );
  });
});
