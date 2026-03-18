import {
  GOAL_CATEGORIES,
  GOAL_COLORS,
  buildDefaultAppState,
  buildEmptyMonthlyData,
} from "../constants/defaultData";
import {
  calculateActiveGoalsCount,
  calculateCompletionRate,
  calculateFilledMonthsCount,
  calculateGoalProgress,
  calculateGoalTotal,
  calculateGrandTotal,
  calculateMonthlyAverage,
  calculatePlannedAnnualTotal,
  calculateProjectionMonths,
} from "./calculations";

export const MAX_GOAL_NAME_LENGTH = 80;

export const buildYearFromCurrentPlan = (plan) => ({
  goals: plan.goals.map((goal) => ({
    ...goal,
    status: goal.status === "completed" ? "active" : goal.status,
  })),
  monthlyData: buildEmptyMonthlyData(),
});

export const getNextAvailableYear = (currentYear, years) => {
  let nextYear = String(Number(currentYear) + 1);

  while (years[nextYear]) {
    nextYear = String(Number(nextYear) + 1);
  }

  return nextYear;
};

export const buildUniqueGoalName = (name, goalId, targetGoals) => {
  const trimmedName = (name.trim() || "Meta").slice(0, MAX_GOAL_NAME_LENGTH);
  const takenNames = new Set(
    targetGoals
      .filter((goal) => goal.id !== goalId)
      .map((goal) => goal.name.trim().toLowerCase())
  );

  if (!takenNames.has(trimmedName.toLowerCase())) {
    return trimmedName;
  }

  let index = 2;
  let candidateName = `${trimmedName} ${index}`;

  while (takenNames.has(candidateName.toLowerCase())) {
    index += 1;
    candidateName = `${trimmedName} ${index}`;
  }

  return candidateName.slice(0, MAX_GOAL_NAME_LENGTH);
};

export const buildGoalDraft = (targetGoals) => ({
  id: Date.now(),
  name: buildUniqueGoalName(`Meta ${targetGoals.length + 1}`, null, targetGoals),
  category: GOAL_CATEGORIES[0],
  color: GOAL_COLORS[targetGoals.length % GOAL_COLORS.length],
  status: "active",
  targetAmount: 0,
  plannedMonthlyAmount: 0,
});

export const removeGoalFromPlan = (plan, goalId) => ({
  goals: plan.goals.filter((goal) => goal.id !== goalId),
  monthlyData: plan.monthlyData.map((month) => {
    const remainingValues = { ...(month.values || {}) };
    delete remainingValues[goalId];
    return { ...month, values: remainingValues };
  }),
});

export const buildDashboardMetrics = ({ goals, monthlyData, filteredGoals }) => {
  const visibleGoalIds = new Set(filteredGoals.map((goal) => String(goal.id)));
  const goalTotalsById = goals.reduce((totals, goal) => {
    totals[goal.id] = calculateGoalTotal(monthlyData, goal.id);
    return totals;
  }, {});

  const goalProgressById = goals.reduce((progressMap, goal) => {
    progressMap[goal.id] = calculateGoalProgress(goals, monthlyData, goal.id);
    return progressMap;
  }, {});

  const goalProjectionById = goals.reduce((projectionMap, goal) => {
    projectionMap[goal.id] = calculateProjectionMonths(goal, monthlyData);
    return projectionMap;
  }, {});

  const visibleMonthTotals = monthlyData.map((month) =>
    Object.entries(month.values || {}).reduce(
      (sum, [goalId, value]) =>
        visibleGoalIds.has(String(goalId)) ? sum + Number(value || 0) : sum,
      0
    )
  );

  return {
    goalTotalsById,
    goalProgressById,
    goalProjectionById,
    visibleMonthTotals,
    visibleGrandTotal: visibleMonthTotals.reduce((sum, value) => sum + value, 0),
    grandTotal: calculateGrandTotal(monthlyData),
    activeGoalsCount: calculateActiveGoalsCount(goals),
    monthlyAverage: calculateMonthlyAverage(monthlyData),
    filledMonthsCount: calculateFilledMonthsCount(monthlyData),
    completionRate: calculateCompletionRate(goals, monthlyData),
    plannedAnnualTotal: calculatePlannedAnnualTotal(goals),
  };
};

export const buildResetState = () => buildDefaultAppState();
