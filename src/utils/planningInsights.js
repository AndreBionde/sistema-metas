import { MONTH_NAMES } from "../constants/defaultData";
import {
  calculateGoalTotal,
  calculateGrandTotal,
  calculateMonthlyAverage,
  calculatePlannedAnnualTotal,
  calculateProjectionMonths,
  getYearPlan,
} from "./calculations";

export const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_LABELS = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export const sortGoalsByPriority = (goals = []) =>
  [...goals].sort((leftGoal, rightGoal) => {
    const priorityGap =
      (PRIORITY_ORDER[leftGoal.priority] ?? PRIORITY_ORDER.medium) -
      (PRIORITY_ORDER[rightGoal.priority] ?? PRIORITY_ORDER.medium);

    if (priorityGap !== 0) {
      return priorityGap;
    }

    return String(leftGoal.name || "").localeCompare(String(rightGoal.name || ""), "pt-BR");
  });

export const getComparableYears = (appState, currentYear) =>
  Object.keys(appState?.years || {})
    .filter((yearKey) => String(yearKey) !== String(currentYear))
    .sort((leftYear, rightYear) => Number(rightYear) - Number(leftYear));

export const buildHistoricalYearSeries = (appState) =>
  Object.keys(appState?.years || {})
    .sort((leftYear, rightYear) => Number(leftYear) - Number(rightYear))
    .map((yearKey) => {
      const yearPlan = getYearPlan(appState, yearKey);
      return {
        yearKey,
        total: calculateGrandTotal(yearPlan.monthlyData),
        planned: calculatePlannedAnnualTotal(yearPlan.goals),
        goals: yearPlan.goals.length,
        monthsWithActivity: yearPlan.monthlyData.filter((month) =>
          Object.values(month.values || {}).some((value) => Number(value || 0) > 0)
        ).length,
      };
    });

export const buildQuarterlyTrend = (monthlyData = []) =>
  [0, 1, 2, 3].map((quarterIndex) => {
    const startMonth = quarterIndex * 3;
    const months = monthlyData.slice(startMonth, startMonth + 3);
    const total = months.reduce(
      (sum, month) =>
        sum +
        Object.values(month.values || {}).reduce(
          (monthSum, value) => monthSum + Number(value || 0),
          0
        ),
      0
    );

    return {
      label: `T${quarterIndex + 1}`,
      months: MONTH_NAMES.slice(startMonth, startMonth + 3).join(" · "),
      total,
    };
  });

export const buildYearComparison = (appState, currentYear, comparisonYear) => {
  const previousYear = comparisonYear
    ? String(comparisonYear)
    : getComparableYears(appState, currentYear)[0] || "";
  const currentPlan = getYearPlan(appState, currentYear);
  const previousPlan = previousYear ? getYearPlan(appState, previousYear) : null;
  const currentTotal = calculateGrandTotal(currentPlan.monthlyData);
  const previousTotal = previousPlan ? calculateGrandTotal(previousPlan.monthlyData) : 0;
  const delta = currentTotal - previousTotal;

  return {
    previousYear,
    currentTotal,
    previousTotal,
    delta,
  };
};

export const calculateMonthsWithoutContribution = (goal, monthlyData = []) => {
  let gap = 0;

  for (let index = monthlyData.length - 1; index >= 0; index -= 1) {
    const monthValue = Number(monthlyData[index]?.values?.[goal.id] || 0);

    if (monthValue > 0) {
      break;
    }

    gap += 1;
  }

  return gap;
};

export const calculateIdealMonthlyContribution = (goal, monthlyData = [], currentYear) => {
  const target = Number(goal?.targetAmount || 0);
  const total = calculateGoalTotal(monthlyData, goal?.id);
  const remaining = Math.max(target - total, 0);

  if (target <= 0 || remaining <= 0) {
    return 0;
  }

  const now = new Date();
  const selectedYear = Number(currentYear);
  const currentMonthIndex = now.getFullYear() === selectedYear ? now.getMonth() : 0;
  const remainingMonths = Math.max(12 - currentMonthIndex, 1);

  return remaining / remainingMonths;
};

export const getDelayRisk = (goal, monthlyData = [], currentYear) => {
  if (Number(goal?.targetAmount || 0) <= 0 || goal?.status === "completed") {
    return "healthy";
  }

  const projectedMonths = calculateProjectionMonths(goal, monthlyData);

  if (projectedMonths === null) {
    return "critical";
  }

  const now = new Date();
  const selectedYear = Number(currentYear);
  const currentMonthIndex = now.getFullYear() === selectedYear ? now.getMonth() : 0;
  const remainingMonths = Math.max(12 - currentMonthIndex, 1);

  if (projectedMonths > remainingMonths) {
    return "warning";
  }

  return projectedMonths <= Math.max(remainingMonths / 2, 1) ? "healthy" : "watch";
};

export const buildPlanningAlerts = (goals = [], monthlyData = [], currentYear) =>
  sortGoalsByPriority(goals)
    .filter((goal) => goal.status !== "completed")
    .map((goal) => {
      const stagnationMonths = calculateMonthsWithoutContribution(goal, monthlyData);
      const idealMonthlyContribution = calculateIdealMonthlyContribution(
        goal,
        monthlyData,
        currentYear
      );
      const riskLevel = getDelayRisk(goal, monthlyData, currentYear);

      return {
        goal,
        stagnationMonths,
        idealMonthlyContribution,
        riskLevel,
      };
    });

export const buildCycleProjection = (goals = [], monthlyData = []) => {
  const annualPlan = calculatePlannedAnnualTotal(goals);
  const actualTotal = calculateGrandTotal(monthlyData);
  const monthlyAverage = calculateMonthlyAverage(monthlyData);

  if (annualPlan <= 0) {
    return {
      projectedMonths: null,
      projectedTotal: actualTotal,
    };
  }

  if (actualTotal >= annualPlan) {
    return {
      projectedMonths: 0,
      projectedTotal: actualTotal,
    };
  }

  if (monthlyAverage <= 0) {
    return {
      projectedMonths: null,
      projectedTotal: actualTotal,
    };
  }

  return {
    projectedMonths: Math.ceil((annualPlan - actualTotal) / monthlyAverage),
    projectedTotal: annualPlan,
  };
};
