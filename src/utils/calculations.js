import { MONTH_NAMES } from "../constants/defaultData";

const safeNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const getElapsedMonthlyData = (monthlyData = [], yearKey, now = new Date()) => {
  const selectedYear = Number(yearKey);

  if (!Number.isFinite(selectedYear)) {
    return monthlyData;
  }

  if (selectedYear > now.getFullYear()) {
    return [];
  }

  if (selectedYear < now.getFullYear()) {
    return monthlyData;
  }

  return monthlyData.slice(0, Math.min(now.getMonth() + 1, monthlyData.length));
};

export const getRemainingMonthsInCycle = (monthlyData = [], yearKey, now = new Date()) => {
  const selectedYear = Number(yearKey);

  if (!Number.isFinite(selectedYear) || selectedYear !== now.getFullYear()) {
    return Math.max(monthlyData.length || 12, 1);
  }

  return Math.max((monthlyData.length || 12) - now.getMonth(), 1);
};

export const getYearPlan = (appState, yearKey) =>
  appState?.years?.[String(yearKey)] || { goals: [], monthlyData: [] };

export const calculateMonthTotal = (monthlyData, monthIndex) =>
  Object.values(monthlyData[monthIndex]?.values || {}).reduce(
    (sum, value) => sum + safeNumber(value),
    0
  );

export const calculateGoalTotal = (monthlyData, goalId) =>
  monthlyData.reduce(
    (sum, month) => sum + safeNumber(month.values?.[goalId] || 0),
    0
  );

export const calculateGoalActiveMonthsCount = (monthlyData, goalId) =>
  monthlyData.filter((month) => safeNumber(month.values?.[goalId] || 0) > 0).length;

export const calculateGrandTotal = (monthlyData) =>
  monthlyData.reduce(
    (sum, month) =>
      sum +
      Object.values(month.values || {}).reduce(
        (monthTotal, value) => monthTotal + safeNumber(value),
        0
      ),
    0
  );

export const calculateGoalProgress = (goals, monthlyData, goalId) => {
  const currentGoal = goals.find((goal) => goal.id === goalId);

  if (!currentGoal || safeNumber(currentGoal.targetAmount) <= 0) {
    return 0;
  }

  const goalTotal = calculateGoalTotal(monthlyData, goalId);
  return Math.min((goalTotal / currentGoal.targetAmount) * 100, 100);
};

export const calculateActiveGoalsCount = (goals) =>
  goals.filter((goal) => goal.status === "active").length;

export const calculateFilledMonthsCount = (monthlyData) =>
  monthlyData.filter(
    (month) =>
      Object.values(month.values || {}).some((value) => safeNumber(value) > 0) ||
      month.observation?.trim()
  ).length;

export const calculateMonthlyAverage = (monthlyData) => {
  const filledMonthsCount = calculateFilledMonthsCount(monthlyData);
  if (filledMonthsCount === 0) {
    return 0;
  }

  return calculateGrandTotal(monthlyData) / filledMonthsCount;
};

export const calculateCompletionRate = (goals, monthlyData) => {
  const goalsWithTarget = goals.filter((goal) => safeNumber(goal.targetAmount) > 0);

  if (goalsWithTarget.length === 0) {
    return 0;
  }

  const completedGoals = goalsWithTarget.filter(
    (goal) => calculateGoalProgress(goals, monthlyData, goal.id) >= 100
  );

  return (completedGoals.length / goalsWithTarget.length) * 100;
};

export const calculatePlannedMonthlyTotal = (goals) =>
  goals.reduce(
    (sum, goal) => sum + safeNumber(goal.plannedMonthlyAmount || 0),
    0
  );

export const calculatePlannedAnnualTotal = (goals) =>
  calculatePlannedMonthlyTotal(goals) * 12;

export const calculateCyclePlannedMonthlyTarget = (goals) =>
  calculatePlannedMonthlyTotal(goals);

export const calculateCyclePlannedAnnualTotal = (goals) =>
  calculateCyclePlannedMonthlyTarget(goals) * 12;

export const calculatePlannedVsActual = (goals, monthlyData) => ({
  planned: calculateCyclePlannedAnnualTotal(goals),
  actual: calculateGrandTotal(monthlyData),
});

export const calculateProjectionMonths = (goal, monthlyData) => {
  const goalTotal = calculateGoalTotal(monthlyData, goal.id);
  const remainingAmount = safeNumber(goal.targetAmount) - goalTotal;

  if (safeNumber(goal.targetAmount) <= 0 || remainingAmount <= 0) {
    return 0;
  }

  const goalActiveMonthsCount = calculateGoalActiveMonthsCount(monthlyData, goal.id);
  const monthlyAverage = Math.max(
    goalTotal / Math.max(goalActiveMonthsCount, 1),
    safeNumber(goal.plannedMonthlyAmount)
  );

  if (monthlyAverage <= 0) {
    return null;
  }

  return Math.ceil(remainingAmount / monthlyAverage);
};

export const getDistinctCategories = (goals) => {
  const categories = new Set(goals.map((goal) => goal.category || "Outros"));
  return ["Todas", ...Array.from(categories)];
};

export const buildMonthlyTotalsSeries = (monthlyData) =>
  MONTH_NAMES.map((label, index) => ({
    label,
    total: calculateMonthTotal(monthlyData, index),
  }));

export const calculateGoalHealthSummary = (goals, monthlyData) => {
  const activeGoals = goals.filter((goal) => goal.status !== "completed");
  const projectedGoals = activeGoals.map((goal) => ({
    ...goal,
    monthsToGoal: calculateProjectionMonths(goal, monthlyData),
    total: calculateGoalTotal(monthlyData, goal.id),
  }));

  return projectedGoals.sort((leftGoal, rightGoal) => {
    const leftValue = leftGoal.monthsToGoal ?? Number.POSITIVE_INFINITY;
    const rightValue = rightGoal.monthsToGoal ?? Number.POSITIVE_INFINITY;
    return leftValue - rightValue;
  });
};
