export const GOAL_STATUSES = ["active", "paused", "completed"];
export const GOAL_PRIORITIES = ["high", "medium", "low"];
export const GOAL_CATEGORIES = [
  "Essenciais",
  "Moradia",
  "Saude",
  "Educacao",
  "Viagem",
  "Familia",
  "Reserva",
  "Investimentos",
  "Carreira",
  "Negocio",
  "Lazer",
  "Patrimonio",
  "Outros",
];

export const GOAL_COLORS = [
  "#3b82f6",
  "#0f766e",
  "#e11d48",
  "#7c3aed",
  "#0ea5e9",
  "#ef8a2f",
  "#16a34a",
  "#4f46e5",
  "#b45309",
  "#059669",
  "#db2777",
  "#1d4ed8",
  "#64748b",
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
    deletedYears: [],
    activityLog: [],
    backupLog: [],
    trash: {
      goals: [],
      resets: [],
    },
  },
});
