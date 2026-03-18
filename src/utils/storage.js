import {
  GOAL_CATEGORIES,
  GOAL_COLORS,
  GOAL_STATUSES,
  buildDefaultAppState,
  buildDefaultYearPlan,
  buildEmptyMonthlyData,
  getCurrentYearKey,
} from "../constants/defaultData";

const MAX_OBSERVATION_LENGTH = 240;
const MAX_GOAL_NAME_LENGTH = 80;

const sanitizeNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
};

const sanitizeGoal = (goal, index) => ({
  id: typeof goal?.id === "number" ? goal.id : Date.now() + index,
  name:
    typeof goal?.name === "string" && goal.name.trim()
      ? goal.name.trim().slice(0, MAX_GOAL_NAME_LENGTH)
      : `Meta ${index + 1}`,
  category: GOAL_CATEGORIES.includes(goal?.category)
    ? goal.category
    : "Outros",
  color:
    typeof goal?.color === "string" && goal.color
      ? goal.color
      : GOAL_COLORS[index % GOAL_COLORS.length],
  status: GOAL_STATUSES.includes(goal?.status) ? goal.status : "active",
  targetAmount: sanitizeNumber(goal?.targetAmount),
  plannedMonthlyAmount: sanitizeNumber(goal?.plannedMonthlyAmount),
});

const sanitizeMonthlyValues = (values) => {
  if (!values || typeof values !== "object") {
    return {};
  }

  return Object.entries(values).reduce((sanitizedValues, [goalId, value]) => {
    const nextValue = sanitizeNumber(value);

    if (nextValue > 0) {
      sanitizedValues[goalId] = nextValue;
    }

    return sanitizedValues;
  }, {});
};

const sanitizeMonth = (month, index) => ({
  month: index + 1,
  values: sanitizeMonthlyValues(month?.values),
  observation:
    typeof month?.observation === "string"
      ? month.observation.slice(0, MAX_OBSERVATION_LENGTH)
      : "",
});

const sanitizeYearPlan = (plan) => {
  const fallbackPlan = buildDefaultYearPlan();
  const goals =
    Array.isArray(plan?.goals) && plan.goals.length > 0
      ? plan.goals.map(sanitizeGoal)
      : fallbackPlan.goals;
  const sourceMonthlyData = Array.isArray(plan?.monthlyData) ? plan.monthlyData : [];
  const monthlyData = buildEmptyMonthlyData().map((month, index) =>
    sanitizeMonth(sourceMonthlyData[index], index)
  );

  return { goals, monthlyData };
};

const normalizeModernAppState = (state) => {
  const currentYear = String(state?.currentYear || getCurrentYearKey());
  const sourceYears =
    state?.years && typeof state.years === "object" ? state.years : {};
  const yearsEntries = Object.entries(sourceYears);
  const years =
    yearsEntries.length > 0
      ? yearsEntries.reduce((normalizedYears, [yearKey, plan]) => {
          normalizedYears[String(yearKey)] = sanitizeYearPlan(plan);
          return normalizedYears;
        }, {})
      : { [currentYear]: buildDefaultYearPlan() };

  if (!years[currentYear]) {
    years[currentYear] = buildDefaultYearPlan();
  }

  return {
    currentYear,
    years,
    metadata: {
      onboardingCompleted: Boolean(state?.metadata?.onboardingCompleted),
      lastExportAt:
        typeof state?.metadata?.lastExportAt === "string"
          ? state.metadata.lastExportAt
          : "",
    },
  };
};

const normalizeLegacyAppState = (state) => {
  const yearKey = getCurrentYearKey();
  return normalizeModernAppState({
    currentYear: yearKey,
    years: {
      [yearKey]: {
        goals: state?.goals,
        monthlyData: state?.monthlyData,
      },
    },
  });
};

export const normalizeAppState = (state) => {
  // Mantemos compatibilidade com formatos antigos para evitar que mudancas
  // de estrutura quebrem dados ja salvos por usuarios.
  if (!state) {
    return buildDefaultAppState();
  }

  if (state.years || state.currentYear || state.metadata) {
    return normalizeModernAppState(state);
  }

  if (state.goals || state.monthlyData) {
    return normalizeLegacyAppState(state);
  }

  return buildDefaultAppState();
};

export const createAppStateSignature = (state) =>
  JSON.stringify(normalizeAppState(state));
