import {
  buildMonthlyTotalsSeries,
  calculateActiveGoalsCount,
  calculateCompletionRate,
  calculateFilledMonthsCount,
  calculateGoalProgress,
  calculateGoalTotal,
  calculateGrandTotal,
  calculateMonthTotal,
  calculateMonthlyAverage,
  calculatePlannedAnnualTotal,
  calculateProjectionMonths,
} from "./calculations";

const goals = [
  {
    id: 1,
    targetAmount: 1000,
    status: "active",
    plannedMonthlyAmount: 300,
  },
  {
    id: 2,
    targetAmount: 500,
    status: "completed",
    plannedMonthlyAmount: 100,
  },
];

const monthlyData = [
  { month: 1, values: { 1: 200, 2: 500 }, observation: "" },
  { month: 2, values: { 1: 300 }, observation: "Receita extra" },
  { month: 3, values: {}, observation: "" },
];

describe("financial calculations", () => {
  it("calculates totals and averages", () => {
    expect(calculateMonthTotal(monthlyData, 0)).toBe(700);
    expect(calculateGoalTotal(monthlyData, 1)).toBe(500);
    expect(calculateGrandTotal(monthlyData)).toBe(1000);
    expect(calculateMonthlyAverage(monthlyData)).toBe(500);
  });

  it("calculates progress, projections and counters", () => {
    expect(calculateGoalProgress(goals, monthlyData, 1)).toBe(50);
    expect(calculateGoalProgress(goals, monthlyData, 2)).toBe(100);
    expect(calculateProjectionMonths(goals[0], monthlyData)).toBe(2);
    expect(calculateActiveGoalsCount(goals)).toBe(1);
    expect(calculateFilledMonthsCount(monthlyData)).toBe(2);
    expect(calculateCompletionRate(goals, monthlyData)).toBe(50);
    expect(calculatePlannedAnnualTotal(goals)).toBe(4800);
    expect(buildMonthlyTotalsSeries(monthlyData)).toHaveLength(12);
  });
});
