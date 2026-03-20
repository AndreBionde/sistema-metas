export const GOAL_STATUSES = ["active", "paused", "completed"];
export const GOAL_CATEGORIES = [
  "Essenciais",
  "Reserva",
  "Investimentos",
  "Lazer",
  "Educacao",
  "Patrimonio",
  "Outros",
];

export const GOAL_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

export const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const getCurrentYearKey = () => String(new Date().getFullYear());

export const buildEmptyMonthlyData = () =>
  Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    values: {},
    observation: "",
  }));

// Cada nova conta comeca vazia para que o usuario estruture as proprias metas.
export const buildDefaultYearPlan = () => ({
  goals: [],
  monthlyData: buildEmptyMonthlyData(),
});

export const buildDefaultAppState = (yearKey = getCurrentYearKey()) => ({
  currentYear: String(yearKey),
  years: {
    [String(yearKey)]: buildDefaultYearPlan(),
  },
  metadata: {
    onboardingCompleted: false,
    lastExportAt: "",
    lastImportAt: "",
    publicMetrics: {
      planStartedTracked: false,
    },
  },
});
