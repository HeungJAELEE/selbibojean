import { describe, expect, it } from "vitest";
import {
  PRACTICAL_CANDIDATE_SUPPLIES,
  PRACTICAL_SUPPLY_RECOMMENDATIONS,
  PRACTICAL_WELDING_TOOL_RECOMMENDATIONS,
} from "@/data/source/practical-candidate-supplies";
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
  });

  it("maps every recommendation link to its official supply row", () => {
    expect(PRACTICAL_SUPPLY_RECOMMENDATIONS).toHaveLength(14);
    expect(
      PRACTICAL_SUPPLY_RECOMMENDATIONS.every((item) =>
        item.commerceUrl.startsWith("https://link.coupang.com/a/"),
      ),
    ).toBe(true);
    expect(
      new Set(
        PRACTICAL_SUPPLY_RECOMMENDATIONS.map((item) => item.supplyId),
      ),
    ).toEqual(new Set(PRACTICAL_CANDIDATE_SUPPLIES.map((item) => item.id)));
    expect(
      PRACTICAL_SUPPLY_RECOMMENDATIONS.filter(
        (item) => item.supplyId === "welding-ppe",
      ).map((item) => item.linkLabel),
    ).toEqual([
      "보호구(용접장갑)",
      "보호구(용접앞치마)",
      "보호구(용접각반)",
      "보호구(용접토시)",
      "보호구(자동용접면)",
      "보호구(안전화)",
    ]);
    expect(
      PRACTICAL_SUPPLY_RECOMMENDATIONS.filter(
        (item) => item.status === "safety_required",
      ).map((item) => item.label),
    ).toEqual(["용접 장갑", "용접 앞치마", "안전화", "보안경"]);
    expect(
      PRACTICAL_SUPPLY_RECOMMENDATIONS.find(
        (item) => item.id === "welding-sleeves",
      )?.status,
    ).toBe("conditional");
  });

  it("keeps conditional welding tools separate from the official nine rows", () => {
    expect(PRACTICAL_WELDING_TOOL_RECOMMENDATIONS).toHaveLength(3);
    expect(
      PRACTICAL_WELDING_TOOL_RECOMMENDATIONS.map((item) => [
        item.label,
        item.commerceUrl,
      ]),
    ).toEqual([
      ["용접해머", "https://link.coupang.com/a/fJo7m3EVRA"],
      ["용접 브러쉬", "https://link.coupang.com/a/fJphjpvNLg"],
      ["플라이어", "https://link.coupang.com/a/fJppaQcwGy"],
    ]);
    expect(
      PRACTICAL_WELDING_TOOL_RECOMMENDATIONS.every(
        (item) =>
          item.status === "conditional" &&
          item.note === "시험장 제공 여부 확인 후 미제공 시 준비/구매",
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
    expect(
      PRACTICAL_QUALIFICATION_OVERVIEW.reportedTaskScoring.categories,
    ).toEqual([
      expect.objectContaining({
        label: "공압",
        totalPoints: 20,
        breakdown: [
          { label: "기본 작업·정리정돈", points: 10 },
          { label: "유지보수 1번", points: 5 },
          { label: "유지보수 2번", points: 3 },
          { label: "유지보수 3번", points: 2 },
        ],
      }),
      expect.objectContaining({
        label: "유압",
        totalPoints: 20,
      }),
    ]);
    expect(PRACTICAL_QUALIFICATION_OVERVIEW.reportedTaskScoring.notice).toContain(
      "수험자 제공",
    );
  });
});
