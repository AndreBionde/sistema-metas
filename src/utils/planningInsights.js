import { MONTH_NAMES } from "../constants/defaultData";
import {
  calculateCyclePlannedAnnualTotal,
  calculateCyclePlannedMonthlyTarget,
  calculateGrandTotal,
  getElapsedMonthlyData,
  getRemainingMonthsInCycle,
  calculateMonthlyAverage,
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
        planned: calculateCyclePlannedAnnualTotal(yearPlan.goals),
        goals: yearPlan.goals.length,
        monthsWithActivity: yearPlan.monthlyData.filter((month) =>
          Object.values(month.values || {}).some((value) => Number(value || 0) > 0)
        ).length,
      };
    });

export const buildQuarterlyTrend = (monthlyData = [], currentYear) =>
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
  const previousTotal = previousPlan
    ? calculateGrandTotal(previousPlan.monthlyData)
    : 0;
  const delta = currentTotal - previousTotal;

  return {
    previousYear,
    currentTotal,
    previousTotal,
    delta,
  };
};

export const calculateMonthsWithoutContribution = (
  goal,
  monthlyData = [],
  currentYear,
  now = new Date()
) => {
  const elapsedMonthlyData = getElapsedMonthlyData(monthlyData, currentYear, now);
  let gap = 0;

  for (let index = elapsedMonthlyData.length - 1; index >= 0; index -= 1) {
    const monthValue = Number(elapsedMonthlyData[index]?.values?.[goal.id] || 0);

    if (monthValue > 0) {
      break;
    }

    gap += 1;
  }

  return gap;
};

export const getDelayRisk = (goal, monthlyData = [], currentYear, now = new Date()) => {
  if (Number(goal?.targetAmount || 0) <= 0 || goal?.status === "completed") {
    return "healthy";
  }

  const projectedMonths = calculateProjectionMonths(goal, monthlyData);

  if (projectedMonths === null) {
    return "critical";
  }

  const remainingMonths = getRemainingMonthsInCycle(monthlyData, currentYear, now);

  if (projectedMonths > remainingMonths) {
    return "warning";
  }

  return projectedMonths <= Math.max(remainingMonths / 2, 1) ? "healthy" : "watch";
};

export const buildPlanningAlerts = (goals = [], monthlyData = [], currentYear, now = new Date()) =>
  sortGoalsByPriority(goals)
    .filter((goal) => goal.status !== "completed")
    .map((goal) => {
      const stagnationMonths = calculateMonthsWithoutContribution(
        goal,
        monthlyData,
        currentYear,
        now
      );
      const riskLevel = getDelayRisk(goal, monthlyData, currentYear, now);

      return {
        goal,
        stagnationMonths,
        riskLevel,
      };
    });

const calculateRecordedMonthTotal = (month) =>
  Object.values(month?.values || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

export const buildCycleProjection = (
  goals = [],
  monthlyData = [],
  currentYear,
  now = new Date()
) => {
  const selectedYear = Number(currentYear);
  const actualTotal = calculateGrandTotal(monthlyData);
  const monthlyTarget = calculateCyclePlannedMonthlyTarget(goals);
  const currentYearNumber = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const projectCycleTotal = (fallbackMonthlyValue) => {
    let monthsProjectedFromPlan = 0;

    // Regra da projeção: respeitamos tudo que já foi lançado no mês e só
    // completamos com estimativa os meses futuros ainda vazios.
    const projectedTotal = monthlyData.reduce((sum, month, monthIndex) => {
      const recordedTotal = calculateRecordedMonthTotal(month);

      if (recordedTotal > 0) {
        return sum + recordedTotal;
      }

      if (!Number.isFinite(selectedYear) || selectedYear > currentYearNumber) {
        monthsProjectedFromPlan += 1;
        return sum + fallbackMonthlyValue;
      }

      if (selectedYear < currentYearNumber) {
        return sum;
      }

      if (monthIndex > currentMonthIndex) {
        monthsProjectedFromPlan += 1;
        return sum + fallbackMonthlyValue;
      }

      return sum;
    }, 0);

    return {
      projectedTotal,
      monthsProjectedFromPlan,
    };
  };

  if (monthlyTarget > 0) {
    const annualTarget = calculateCyclePlannedAnnualTotal(goals);
    const { projectedTotal, monthsProjectedFromPlan } = projectCycleTotal(monthlyTarget);

    return {
      source: "planned",
      actualTotal,
      monthlyTarget,
      annualTarget,
      remainingMonths: getRemainingMonthsInCycle(monthlyData, currentYear, now),
      monthsProjectedFromPlan,
      projectedTotal,
      gapToTarget: annualTarget - projectedTotal,
    };
  }

  const monthlyAverage = calculateMonthlyAverage(monthlyData);

  if (monthlyAverage > 0) {
    const { projectedTotal, monthsProjectedFromPlan } = projectCycleTotal(monthlyAverage);

    return {
      source: "average",
      actualTotal,
      monthlyTarget: monthlyAverage,
      annualTarget: null,
      remainingMonths: getRemainingMonthsInCycle(monthlyData, currentYear, now),
      monthsProjectedFromPlan,
      projectedTotal,
      gapToTarget: null,
    };
  }

  return {
    source: "none",
    actualTotal,
    monthlyTarget: 0,
    annualTarget: null,
    remainingMonths: getRemainingMonthsInCycle(monthlyData, currentYear, now),
    monthsProjectedFromPlan: 0,
    projectedTotal: actualTotal,
    gapToTarget: null,
  };
};
