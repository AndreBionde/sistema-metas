import {
  GOAL_CATEGORIES,
  GOAL_COLORS,
  GOAL_PRIORITIES,
  GOAL_STATUSES,
  buildDefaultAppState,
  buildDefaultYearPlan,
  buildEmptyMonthlyData,
  getCurrentYearKey,
} from "../constants/defaultData";

const MAX_OBSERVATION_LENGTH = 240;
const MAX_GOAL_NAME_LENGTH = 80;
const MAX_ACTIVITY_LOG_ITEMS = 80;
const MAX_BACKUP_LOG_ITEMS = 40;
const MAX_TRASH_GOAL_ITEMS = 24;
const MAX_TRASH_RESET_ITEMS = 6;

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
  priority: GOAL_PRIORITIES.includes(goal?.priority) ? goal.priority : "medium",
  targetAmount: sanitizeNumber(goal?.targetAmount),
  plannedMonthlyAmount: sanitizeNumber(goal?.plannedMonthlyAmount),
});

const sanitizeLogEntry = (entry, index) => ({
  id:
    typeof entry?.id === "string" && entry.id
      ? entry.id
      : `log-${Date.now()}-${index}`,
  type: typeof entry?.type === "string" ? entry.type : "activity",
  title: typeof entry?.title === "string" ? entry.title.slice(0, 120) : "Ação registrada",
  description:
    typeof entry?.description === "string" ? entry.description.slice(0, 240) : "",
  yearKey: typeof entry?.yearKey === "string" ? entry.yearKey : "",
  occurredAt:
    typeof entry?.occurredAt === "string" && entry.occurredAt
      ? entry.occurredAt
      : new Date().toISOString(),
});

const sanitizeTrashGoal = (entry, index) => ({
  id:
    typeof entry?.id === "string" && entry.id
      ? entry.id
      : `trash-goal-${Date.now()}-${index}`,
  yearKey: typeof entry?.yearKey === "string" ? entry.yearKey : getCurrentYearKey(),
  goal: sanitizeGoal(entry?.goal, index),
  values: sanitizeMonthlyValues(entry?.values),
  deletedAt:
    typeof entry?.deletedAt === "string" && entry.deletedAt
      ? entry.deletedAt
      : new Date().toISOString(),
});

const sanitizeSnapshotState = (snapshot) => {
  const normalizedSnapshot = normalizeAppState(snapshot);

  return {
    ...normalizedSnapshot,
    metadata: {
      ...normalizedSnapshot.metadata,
      trash: {
        goals: [],
        resets: [],
      },
      activityLog: [],
      backupLog: [],
    },
  };
};

const sanitizeTrashReset = (entry, index) => ({
  id:
    typeof entry?.id === "string" && entry.id
      ? entry.id
      : `trash-reset-${Date.now()}-${index}`,
  snapshot: sanitizeSnapshotState(entry?.snapshot),
  deletedAt:
    typeof entry?.deletedAt === "string" && entry.deletedAt
      ? entry.deletedAt
      : new Date().toISOString(),
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

const sanitizeMetadata = (metadata) => ({
  onboardingCompleted: Boolean(metadata?.onboardingCompleted),
  lastExportAt:
    typeof metadata?.lastExportAt === "string" ? metadata.lastExportAt : "",
  lastImportAt:
    typeof metadata?.lastImportAt === "string" ? metadata.lastImportAt : "",
  publicMetrics: {
    planStartedTracked: Boolean(metadata?.publicMetrics?.planStartedTracked),
  },
  deletedYears: Array.isArray(metadata?.deletedYears)
    ? metadata.deletedYears.filter((yearKey) => typeof yearKey === "string").slice(0, 48)
    : [],
  activityLog: Array.isArray(metadata?.activityLog)
    ? metadata.activityLog
        .map(sanitizeLogEntry)
        .sort((leftEntry, rightEntry) => new Date(rightEntry.occurredAt) - new Date(leftEntry.occurredAt))
        .slice(0, MAX_ACTIVITY_LOG_ITEMS)
    : [],
  backupLog: Array.isArray(metadata?.backupLog)
    ? metadata.backupLog
        .map(sanitizeLogEntry)
        .sort((leftEntry, rightEntry) => new Date(rightEntry.occurredAt) - new Date(leftEntry.occurredAt))
        .slice(0, MAX_BACKUP_LOG_ITEMS)
    : [],
  trash: {
    goals: Array.isArray(metadata?.trash?.goals)
      ? metadata.trash.goals
          .map(sanitizeTrashGoal)
          .sort((leftEntry, rightEntry) => new Date(rightEntry.deletedAt) - new Date(leftEntry.deletedAt))
          .slice(0, MAX_TRASH_GOAL_ITEMS)
      : [],
    resets: Array.isArray(metadata?.trash?.resets)
      ? metadata.trash.resets
          .map(sanitizeTrashReset)
          .sort((leftEntry, rightEntry) => new Date(rightEntry.deletedAt) - new Date(leftEntry.deletedAt))
          .slice(0, MAX_TRASH_RESET_ITEMS)
      : [],
  },
});

const normalizeModernAppState = (state) => {
  const metadata = sanitizeMetadata(state?.metadata);
  const currentYear = String(state?.currentYear || getCurrentYearKey());
  const sourceYears =
    state?.years && typeof state.years === "object" ? state.years : {};
  const yearsEntries = Object.entries(sourceYears);
  const years =
    yearsEntries.length > 0
      ? yearsEntries.reduce((normalizedYears, [yearKey, plan]) => {
          if (metadata.deletedYears.includes(String(yearKey))) {
            return normalizedYears;
          }

          normalizedYears[String(yearKey)] = sanitizeYearPlan(plan);
          return normalizedYears;
        }, {})
      : { [currentYear]: buildDefaultYearPlan() };

  const resolvedCurrentYear = years[currentYear]
    ? currentYear
    : Object.keys(years).sort((leftYear, rightYear) => Number(rightYear) - Number(leftYear))[0] ||
      currentYear;

  if (!years[resolvedCurrentYear]) {
    years[resolvedCurrentYear] = buildDefaultYearPlan();
  }

  return {
    currentYear: resolvedCurrentYear,
    years,
    metadata,
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

export const cloneAppState = (state) =>
  JSON.parse(JSON.stringify(normalizeAppState(state)));

export const parseImportedAppState = (rawContent) =>
  normalizeAppState(JSON.parse(rawContent));

const mergeLogsById = (...collections) =>
  Array.from(
    collections
      .flat()
      .map(sanitizeLogEntry)
      .reduce((entryMap, entry) => {
        if (!entryMap.has(entry.id)) {
          entryMap.set(entry.id, entry);
        }
        return entryMap;
      }, new Map())
      .values()
  );

const mergeTrashGoalsById = (...collections) =>
  Array.from(
    collections
      .flat()
      .map(sanitizeTrashGoal)
      .reduce((entryMap, entry) => {
        if (!entryMap.has(entry.id)) {
          entryMap.set(entry.id, entry);
        }
        return entryMap;
      }, new Map())
      .values()
  );

const mergeTrashResetsById = (...collections) =>
  Array.from(
    collections
      .flat()
      .map(sanitizeTrashReset)
      .reduce((entryMap, entry) => {
        if (!entryMap.has(entry.id)) {
          entryMap.set(entry.id, entry);
        }
        return entryMap;
      }, new Map())
      .values()
  );

const areEqual = (leftValue, rightValue) =>
  JSON.stringify(leftValue ?? null) === JSON.stringify(rightValue ?? null);

const chooseTimestamp = (...values) =>
  values
    .filter((value) => typeof value === "string" && value)
    .sort((leftValue, rightValue) => new Date(rightValue) - new Date(leftValue))[0] || "";

const mergeScalar = ({ baseValue, remoteValue, localValue, preferLocalOnConflict = true }) => {
  if (areEqual(localValue, remoteValue)) {
    return { value: localValue, conflict: false };
  }

  const localChanged = !areEqual(localValue, baseValue);
  const remoteChanged = !areEqual(remoteValue, baseValue);

  if (localChanged && !remoteChanged) {
    return { value: localValue, conflict: false };
  }

  if (remoteChanged && !localChanged) {
    return { value: remoteValue, conflict: false };
  }

  if (!localChanged && !remoteChanged) {
    return { value: remoteValue, conflict: false };
  }

  return {
    value: preferLocalOnConflict ? localValue : remoteValue ?? localValue,
    conflict: true,
  };
};

const mergeGoalEntity = (baseGoal, remoteGoal, localGoal) => {
  if (!baseGoal && !remoteGoal && !localGoal) {
    return { goal: null, conflictCount: 0 };
  }

  if (!remoteGoal && localGoal && !baseGoal) {
    return { goal: sanitizeGoal(localGoal, 0), conflictCount: 0 };
  }

  if (!localGoal && remoteGoal && !baseGoal) {
    return { goal: sanitizeGoal(remoteGoal, 0), conflictCount: 0 };
  }

  const localChanged = !areEqual(localGoal, baseGoal);
  const remoteChanged = !areEqual(remoteGoal, baseGoal);

  if (localChanged && !remoteChanged) {
    return {
      goal: localGoal ? sanitizeGoal(localGoal, 0) : null,
      conflictCount: 0,
    };
  }

  if (remoteChanged && !localChanged) {
    return {
      goal: remoteGoal ? sanitizeGoal(remoteGoal, 0) : null,
      conflictCount: 0,
    };
  }

  if (!localChanged && !remoteChanged) {
    return {
      goal: remoteGoal ? sanitizeGoal(remoteGoal, 0) : localGoal ? sanitizeGoal(localGoal, 0) : null,
      conflictCount: 0,
    };
  }

  if (!localGoal || !remoteGoal) {
    return {
      goal: sanitizeGoal(localGoal || remoteGoal, 0),
      conflictCount: 1,
    };
  }

  let conflictCount = 0;
  const mergedGoal = {};

  ["id", "name", "category", "color", "status", "targetAmount", "plannedMonthlyAmount"].forEach(
    (field) => {
      const result = mergeScalar({
        baseValue: baseGoal?.[field],
        remoteValue: remoteGoal?.[field],
        localValue: localGoal?.[field],
      });
      mergedGoal[field] = result.value;
      conflictCount += result.conflict ? 1 : 0;
    }
  );

  return {
    goal: sanitizeGoal(mergedGoal, 0),
    conflictCount,
  };
};

const mergeGoals = (baseGoals, remoteGoals, localGoals) => {
  const baseMap = new Map((baseGoals || []).map((goal) => [String(goal.id), goal]));
  const remoteMap = new Map((remoteGoals || []).map((goal) => [String(goal.id), goal]));
  const localMap = new Map((localGoals || []).map((goal) => [String(goal.id), goal]));
  const orderedIds = [
    ...new Set([
      ...(localGoals || []).map((goal) => String(goal.id)),
      ...(remoteGoals || []).map((goal) => String(goal.id)),
      ...(baseGoals || []).map((goal) => String(goal.id)),
    ]),
  ];

  let conflictCount = 0;

  const goals = orderedIds
    .map((goalId, index) => {
      const result = mergeGoalEntity(
        baseMap.get(goalId),
        remoteMap.get(goalId),
        localMap.get(goalId)
      );
      conflictCount += result.conflictCount;
      return result.goal ? sanitizeGoal(result.goal, index) : null;
    })
    .filter(Boolean);

  return { goals, conflictCount };
};

const mergeMonth = (baseMonth, remoteMonth, localMonth, monthIndex) => {
  const valueIds = [
    ...new Set([
      ...Object.keys(baseMonth?.values || {}),
      ...Object.keys(remoteMonth?.values || {}),
      ...Object.keys(localMonth?.values || {}),
    ]),
  ];

  let conflictCount = 0;
  const mergedValues = valueIds.reduce((values, goalId) => {
    const result = mergeScalar({
      baseValue: baseMonth?.values?.[goalId] ?? 0,
      remoteValue: remoteMonth?.values?.[goalId] ?? 0,
      localValue: localMonth?.values?.[goalId] ?? 0,
    });

    if (Number(result.value) > 0) {
      values[goalId] = sanitizeNumber(result.value);
    }

    conflictCount += result.conflict ? 1 : 0;
    return values;
  }, {});

  const observationResult = mergeScalar({
    baseValue: baseMonth?.observation ?? "",
    remoteValue: remoteMonth?.observation ?? "",
    localValue: localMonth?.observation ?? "",
  });
  conflictCount += observationResult.conflict ? 1 : 0;

  return {
    month: {
      month: monthIndex + 1,
      values: mergedValues,
      observation: typeof observationResult.value === "string"
        ? observationResult.value.slice(0, MAX_OBSERVATION_LENGTH)
        : "",
    },
    conflictCount,
  };
};

const mergeYearPlan = (basePlan, remotePlan, localPlan) => {
  const normalizedBasePlan = sanitizeYearPlan(basePlan);
  const normalizedRemotePlan = sanitizeYearPlan(remotePlan);
  const normalizedLocalPlan = sanitizeYearPlan(localPlan);

  const goalsResult = mergeGoals(
    normalizedBasePlan.goals,
    normalizedRemotePlan.goals,
    normalizedLocalPlan.goals
  );

  let conflictCount = goalsResult.conflictCount;
  const monthlyData = buildEmptyMonthlyData().map((_, monthIndex) => {
    const result = mergeMonth(
      normalizedBasePlan.monthlyData[monthIndex],
      normalizedRemotePlan.monthlyData[monthIndex],
      normalizedLocalPlan.monthlyData[monthIndex],
      monthIndex
    );
    conflictCount += result.conflictCount;
    return result.month;
  });

  return {
    plan: {
      goals: goalsResult.goals,
      monthlyData,
    },
    conflictCount,
  };
};

export const mergeAppStates = ({ baseState, remoteState, localState }) => {
  const normalizedBaseState = normalizeAppState(baseState);
  const normalizedRemoteState = normalizeAppState(remoteState);
  const normalizedLocalState = normalizeAppState(localState);
  const deletedYearKeys = [
    ...new Set([
      ...(normalizedBaseState.metadata?.deletedYears || []),
      ...(normalizedRemoteState.metadata?.deletedYears || []),
      ...(normalizedLocalState.metadata?.deletedYears || []),
    ]),
  ];

  const yearKeys = [
    ...new Set([
      ...Object.keys(normalizedBaseState.years || {}),
      ...Object.keys(normalizedRemoteState.years || {}),
      ...Object.keys(normalizedLocalState.years || {}),
    ]),
  ].filter((yearKey) => !deletedYearKeys.includes(yearKey));

  let conflictCount = 0;
  const years = yearKeys.reduce((nextYears, yearKey) => {
    const result = mergeYearPlan(
      normalizedBaseState.years?.[yearKey],
      normalizedRemoteState.years?.[yearKey],
      normalizedLocalState.years?.[yearKey]
    );
    conflictCount += result.conflictCount;
    nextYears[yearKey] = result.plan;
    return nextYears;
  }, {});

  const metadata = sanitizeMetadata({
    onboardingCompleted:
      normalizedLocalState.metadata?.onboardingCompleted ||
      normalizedRemoteState.metadata?.onboardingCompleted,
    lastExportAt: chooseTimestamp(
      normalizedLocalState.metadata?.lastExportAt,
      normalizedRemoteState.metadata?.lastExportAt,
      normalizedBaseState.metadata?.lastExportAt
    ),
    lastImportAt: chooseTimestamp(
      normalizedLocalState.metadata?.lastImportAt,
      normalizedRemoteState.metadata?.lastImportAt,
      normalizedBaseState.metadata?.lastImportAt
    ),
    publicMetrics: {
      planStartedTracked:
        normalizedLocalState.metadata?.publicMetrics?.planStartedTracked ||
        normalizedRemoteState.metadata?.publicMetrics?.planStartedTracked ||
        normalizedBaseState.metadata?.publicMetrics?.planStartedTracked,
    },
    deletedYears: deletedYearKeys,
    activityLog: mergeLogsById(
      normalizedBaseState.metadata?.activityLog || [],
      normalizedRemoteState.metadata?.activityLog || [],
      normalizedLocalState.metadata?.activityLog || []
    ),
    backupLog: mergeLogsById(
      normalizedBaseState.metadata?.backupLog || [],
      normalizedRemoteState.metadata?.backupLog || [],
      normalizedLocalState.metadata?.backupLog || []
    ),
    trash: {
      goals: mergeTrashGoalsById(
        normalizedBaseState.metadata?.trash?.goals || [],
        normalizedRemoteState.metadata?.trash?.goals || [],
        normalizedLocalState.metadata?.trash?.goals || []
      ),
      resets: mergeTrashResetsById(
        normalizedBaseState.metadata?.trash?.resets || [],
        normalizedRemoteState.metadata?.trash?.resets || [],
        normalizedLocalState.metadata?.trash?.resets || []
      ),
    },
  });

  const currentYearResult = mergeScalar({
    baseValue: normalizedBaseState.currentYear,
    remoteValue: normalizedRemoteState.currentYear,
    localValue: normalizedLocalState.currentYear,
  });
  conflictCount += currentYearResult.conflict ? 1 : 0;

  const resolvedCurrentYear =
    currentYearResult.value && years[currentYearResult.value]
      ? currentYearResult.value
      : Object.keys(years).sort((leftYear, rightYear) => Number(rightYear) - Number(leftYear))[0] ||
        normalizedLocalState.currentYear;

  return {
    state: normalizeModernAppState({
      currentYear: resolvedCurrentYear,
      years,
      metadata,
    }),
    conflictCount,
  };
};
