import {
  buildDashboardMetrics,
  buildUniqueGoalName,
  getNextAvailableYear,
  getSuggestedYearOptions,
  removeGoalFromPlan,
} from "./dashboardState";

describe("dashboard state utils", () => {
  it("builds unique goal names without duplicates", () => {
    const nextName = buildUniqueGoalName("Reserva", null, [
      { id: 1, name: "Reserva" },
      { id: 2, name: "Viagem" },
    ]);

    expect(nextName).toBe("Reserva 2");
  });

  it("finds the next available year", () => {
    expect(
      getNextAvailableYear("2026", {
        2026: {},
        2027: {},
        2028: {},
      })
    ).toBe("2029");
  });

  it("suggests missing past and future years around the current year", () => {
    expect(
      getSuggestedYearOptions("2026", {
        2026: {},
        2027: {},
      })
    ).toEqual(["2023", "2024", "2025", "2028", "2029"]);
  });

  it("removes a goal from the plan and related monthly values", () => {
    const updatedPlan = removeGoalFromPlan(
      {
        goals: [
          { id: 1, name: "Reserva" },
          { id: 2, name: "Viagem" },
        ],
        monthlyData: [{ month: 1, values: { 1: 100, 2: 50 }, observation: "" }],
      },
      1
    );

    expect(updatedPlan.goals).toHaveLength(1);
    expect(updatedPlan.monthlyData[0].values[1]).toBeUndefined();
    expect(updatedPlan.monthlyData[0].values[2]).toBe(50);
  });

  it("aggregates dashboard metrics from visible goals", () => {
    const metrics = buildDashboardMetrics({
      goals: [
        {
          id: 1,
          name: "Reserva",
          targetAmount: 100,
          plannedMonthlyAmount: 20,
          status: "active",
        },
        {
          id: 2,
          name: "Viagem",
          targetAmount: 200,
          plannedMonthlyAmount: 10,
          status: "paused",
        },
      ],
      filteredGoals: [{ id: 1, name: "Reserva" }],
      monthlyData: [
        { month: 1, values: { 1: 40, 2: 15 }, observation: "" },
        { month: 2, values: { 1: 20 }, observation: "" },
      ],
    });

    expect(metrics.goalTotalsById[1]).toBe(60);
    expect(metrics.visibleMonthTotals[0]).toBe(40);
    expect(metrics.visibleGrandTotal).toBe(60);
    expect(metrics.activeGoalsCount).toBe(1);
    expect(metrics.plannedAnnualTotal).toBe(360);
  });

  it("uses the same launched values across cards and table totals", () => {
    const metrics = buildDashboardMetrics({
      goals: [
        {
          id: 1,
          name: "Reserva",
          targetAmount: 1000,
          plannedMonthlyAmount: 0,
          status: "active",
        },
      ],
      filteredGoals: [{ id: 1, name: "Reserva" }],
      monthlyData: [
        { month: 1, values: { 1: 500 }, observation: "" },
        { month: 2, values: { 1: 200 }, observation: "" },
      ],
    });

    expect(metrics.goalTotalsById[1]).toBe(700);
    expect(metrics.tableGoalTotalsById[1]).toBe(700);
    expect(metrics.goalProgressById[1]).toBe(70);
    expect(metrics.visibleMonthTotals[1]).toBe(200);
    expect(metrics.visibleGrandTotal).toBe(700);
  });
});
