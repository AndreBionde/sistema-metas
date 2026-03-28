import {
  buildCycleProjection,
  calculateMonthsWithoutContribution,
} from "./planningInsights";

describe("planning insights", () => {
  const now = new Date("2026-03-27T12:00:00Z");

  it("counts stagnation only up to the current month of the selected year", () => {
    const goal = { id: 1 };
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      values: index === 0 ? { 1: 200 } : {},
      observation: "",
    }));

    expect(calculateMonthsWithoutContribution(goal, monthlyData, "2026", now)).toBe(2);
  });

  it("does not mark future years as stalled before the cycle starts", () => {
    const goal = { id: 1 };
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      values: {},
      observation: "",
    }));

    expect(calculateMonthsWithoutContribution(goal, monthlyData, "2027", now)).toBe(0);
  });

  it("projects the cycle to december using the planned monthly target", () => {
    const goals = [{ id: 1, plannedMonthlyAmount: 500 }];
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      values:
        index === 0
          ? { 1: 0 }
          : index === 1
            ? { 1: 0 }
            : index === 2
              ? { 1: 500 }
              : index === 3
                ? { 1: 200 }
                : {},
      observation: "",
    }));

    const projection = buildCycleProjection(goals, monthlyData, "2026", now);

    expect(projection.source).toBe("planned");
    expect(projection.actualTotal).toBe(700);
    expect(projection.projectedTotal).toBe(4700);
    expect(projection.annualTarget).toBe(6000);
    expect(projection.gapToTarget).toBe(1300);
    expect(projection.monthsProjectedFromPlan).toBe(8);
  });

  it("does not add planned values over future months that already have launches", () => {
    const goals = [{ id: 1, plannedMonthlyAmount: 500 }];
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      values:
        index === 2
          ? { 1: 500 }
          : index === 3
            ? { 1: 100 }
            : index === 4
              ? { 1: 100 }
              : index === 5
                ? { 1: 100 }
                : {},
      observation: "",
    }));

    const projection = buildCycleProjection(goals, monthlyData, "2026", now);

    expect(projection.projectedTotal).toBe(3800);
    expect(projection.gapToTarget).toBe(2200);
    expect(projection.monthsProjectedFromPlan).toBe(6);
  });
});
