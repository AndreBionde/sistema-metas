import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import DashboardHero from "./components/DashboardHero";
import StatsCards from "./components/StatsCards";
import GoalsManager from "./components/GoalsManager";
import MonthlyTable from "./components/MonthlyTable";
import QuickActionsBar from "./components/QuickActionsBar";
import StrategicInsightsPanel from "./components/StrategicInsightsPanel";
import PlanningIntelligencePanel from "./components/PlanningIntelligencePanel";
import GovernancePanel from "./components/GovernancePanel";
import ConfirmDialog from "./components/ConfirmDialog";
import ToastViewport from "./components/ToastViewport";
import Tips from "./components/Tips";
import PWAInstructions from "./components/PWAInstructions";
import DataActions from "./components/DataActions";
import PlanningToolbar from "./components/PlanningToolbar";
import InsightsPanel from "./components/InsightsPanel";
import OnboardingPanel from "./components/OnboardingPanel";
import AuthScreen from "./components/AuthScreen";
import LoadingScreen from "./components/LoadingScreen";
import { useAuth } from "./contexts/AuthContext";
import { appConfig } from "./config/appConfig";
import { getDistinctCategories, getYearPlan } from "./utils/calculations";
import {
  downloadTextFile,
  exportCsv,
  exportDocxSummaryFile,
  exportPdfFile,
  exportWorkbookFile,
} from "./utils/exporters";
import { useCloudPlanState } from "./hooks/useCloudPlanState";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import {
  MAX_GOAL_NAME_LENGTH,
  buildDashboardMetrics,
  buildGoalDraft,
  buildResetState,
  buildUniqueGoalName,
  buildYearFromCurrentPlan,
  duplicateGoalInPlan,
  getSuggestedYearOptions,
  removeGoalFromPlan,
} from "./utils/dashboardState";
import { cloneAppState, parseImportedAppState } from "./utils/storage";
import {
  buildPlanningAlerts,
  sortGoalsByPriority,
} from "./utils/planningInsights";
import "./App.css";

const DashboardApp = ({ user, onSignOut }) => {
  const {
    appState,
    setAppState,
    statusNotice,
    setStatusNotice,
    saveError,
    lastSavedAt,
    saveStatus,
    syncStatus,
    lastSyncedAt,
    cloudReady,
    loadingStage,
  } = useCloudPlanState(user);

  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    cancelLabel: "Cancelar",
    tone: "default",
    onConfirm: null,
  });
  const [toasts, setToasts] = useState([]);

  const { canInstall, installStatus, handleInstallApp } = useInstallPrompt({
    enablePwa: appConfig.enablePwa,
    onInstalled: () =>
      setStatusNotice("Aplicativo instalado com sucesso neste dispositivo."),
  });

  const deletedYears = appState.metadata?.deletedYears || [];
  const currentYear = appState.currentYear;
  const currentPlan = getYearPlan(appState, currentYear);
  const goals = currentPlan.goals;
  const monthlyData = currentPlan.monthlyData;
  const availableYears = Object.keys(appState.years)
    .filter((yearKey) => !deletedYears.includes(yearKey))
    .sort((leftYear, rightYear) => Number(rightYear) - Number(leftYear));
  const creatableYears = useMemo(
    () => getSuggestedYearOptions(currentYear, appState.years),
    [currentYear, appState.years]
  );
  const [pendingYear, setPendingYear] = useState("");
  const [comparisonYear, setComparisonYear] = useState("");
  const availableCategories = getDistinctCategories(goals);
  const sortedGoals = useMemo(() => sortGoalsByPriority(goals), [goals]);
  const planningAlerts = useMemo(
    () => buildPlanningAlerts(sortedGoals, monthlyData, currentYear),
    [sortedGoals, monthlyData, currentYear]
  );
  const comparisonOptions = useMemo(
    () => availableYears.filter((yearKey) => yearKey !== currentYear),
    [availableYears, currentYear]
  );

  const filteredGoals = useMemo(
    () =>
      sortGoalsByPriority(goals).filter((goal) => {
        const matchesCategory =
          categoryFilter === "Todas" || goal.category === categoryFilter;
        const matchesStatus =
          statusFilter === "all" ? true : goal.status === statusFilter;
        return matchesCategory && matchesStatus;
      }),
    [goals, categoryFilter, statusFilter]
  );

  const hasActiveFilters = categoryFilter !== "Todas" || statusFilter !== "all";

  const dashboardMetrics = useMemo(
    () =>
      buildDashboardMetrics({
        goals,
        monthlyData,
        filteredGoals,
      }),
    [goals, monthlyData, filteredGoals]
  );

  useEffect(() => {
    if (!availableCategories.includes(categoryFilter)) {
      setCategoryFilter("Todas");
    }
  }, [availableCategories, categoryFilter]);

  useEffect(() => {
    if (!creatableYears.length) {
      setPendingYear("");
      return;
    }

    setPendingYear((currentValue) =>
      currentValue && creatableYears.includes(currentValue)
        ? currentValue
        : creatableYears[0]
    );
  }, [creatableYears]);

  useEffect(() => {
    setComparisonYear((currentValue) =>
      currentValue && comparisonOptions.includes(currentValue)
        ? currentValue
        : comparisonOptions[0] || ""
    );
  }, [comparisonOptions]);

  useEffect(() => {
    document.title = appConfig.appName;
  }, []);

  const pushToast = useCallback((title, message = "", tone = "info") => {
    const toastId = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((currentToasts) => [
      ...currentToasts,
      { id: toastId, title, message, tone },
    ]);
    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
    }, 4200);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const openConfirmDialog = ({
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    tone = "default",
    onConfirm,
  }) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      tone,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((currentDialog) => ({
      ...currentDialog,
      open: false,
      onConfirm: null,
    }));
  };

  const updateMetadata = (updater) => {
    setAppState((currentState) => ({
      ...currentState,
      metadata: updater(currentState.metadata || {}),
    }));
  };

  const appendActivityLog = (entry) => {
    updateMetadata((metadata) => ({
      ...metadata,
      activityLog: [
        {
          id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          occurredAt: new Date().toISOString(),
          ...entry,
        },
        ...(metadata.activityLog || []),
      ].slice(0, 80),
    }));
  };

  const appendBackupLog = (entry) => {
    updateMetadata((metadata) => ({
      ...metadata,
      backupLog: [
        {
          id: `backup-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          occurredAt: new Date().toISOString(),
          ...entry,
        },
        ...(metadata.backupLog || []),
      ].slice(0, 40),
    }));
  };

  const buildRecoverySnapshot = (state) => {
    const snapshot = cloneAppState(state);
    return {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        activityLog: [],
        backupLog: [],
        trash: {
          goals: [],
          resets: [],
        },
      },
    };
  };

  const updateCurrentPlan = (updater) => {
    setAppState((currentState) => ({
      ...currentState,
      years: {
        ...currentState.years,
        [currentState.currentYear]: updater(
          getYearPlan(currentState, currentState.currentYear)
        ),
      },
    }));
  };

  const addGoal = () => {
    updateCurrentPlan((plan) => ({
      ...plan,
      goals: [...plan.goals, buildGoalDraft(plan.goals)],
    }));
    setStatusNotice("Nova meta adicionada.");
    pushToast("Meta criada", "O ciclo j\u00e1 pode ser preenchido com aportes e proje\u00e7\u00f5es.", "success");
    appendActivityLog({
      type: "goal_add",
      title: "Meta criada",
      description: `Uma nova meta foi adicionada ao ano ${currentYear}.`,
      yearKey: currentYear,
    });
  };

  const removeGoal = (goalId) => {
    const targetGoal = goals.find((goal) => goal.id === goalId);

    if (!targetGoal) {
      return;
    }

    openConfirmDialog({
      title: "Remover meta",
      message: `A meta ${targetGoal.name} ser\u00e1 enviada para a lixeira e poder\u00e1 ser restaurada depois.`,
      confirmLabel: "Enviar para lixeira",
      tone: "danger",
      onConfirm: () => {
        updateMetadata((metadata) => ({
          ...metadata,
          trash: {
            ...(metadata.trash || {}),
            goals: [
              {
                id: `trash-goal-${Date.now()}`,
                yearKey: currentYear,
                goal: targetGoal,
                values: monthlyData.reduce((valuesMap, month) => {
                  const value = month.values?.[goalId] || 0;
                  if (Number(value) > 0) {
                    valuesMap[month.month] = value;
                  }
                  return valuesMap;
                }, {}),
                deletedAt: new Date().toISOString(),
              },
              ...((metadata.trash && metadata.trash.goals) || []),
            ].slice(0, 24),
          },
        }));
        updateCurrentPlan((plan) => removeGoalFromPlan(plan, goalId));
        setStatusNotice("Meta enviada para a lixeira.");
        pushToast("Meta removida", "Voc\u00ea pode recuperar esta meta no painel de governan\u00e7a.", "warning");
        appendActivityLog({
          type: "goal_remove",
          title: "Meta removida",
          description: `${targetGoal.name} foi enviada para a lixeira no ano ${currentYear}.`,
          yearKey: currentYear,
        });
        closeConfirmDialog();
      },
    });
  };

  const duplicateGoal = (goalId) => {
    updateCurrentPlan((plan) => duplicateGoalInPlan(plan, goalId));
    const sourceGoal = goals.find((goal) => goal.id === goalId);
    setStatusNotice("Meta duplicada com sucesso.");
    pushToast("Meta duplicada", "A c\u00f3pia herdou dados e pode ser ajustada livremente.", "success");
    appendActivityLog({
      type: "goal_duplicate",
      title: "Meta duplicada",
      description: `${sourceGoal?.name || "Meta"} foi duplicada no ano ${currentYear}.`,
      yearKey: currentYear,
    });
  };

  const updateGoalField = (goalId, updater) => {
    setStatusNotice("");

    updateCurrentPlan((plan) => ({
      ...plan,
      goals: plan.goals.map((goal) =>
        goal.id === goalId ? { ...goal, ...updater(goal, plan.goals) } : goal
      ),
    }));
  };

  const updateGoalName = (goalId, nextName) => {
    updateGoalField(goalId, () => ({
      name: nextName.slice(0, MAX_GOAL_NAME_LENGTH),
    }));
  };

  const commitGoalName = (goalId) => {
    updateCurrentPlan((plan) => ({
      ...plan,
      goals: plan.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              name: buildUniqueGoalName(goal.name, goalId, plan.goals),
            }
          : goal
      ),
    }));
  };

  const updateGoalCategory = (goalId, nextCategory) => {
    updateGoalField(goalId, () => ({ category: nextCategory }));
  };

  const updateGoalStatus = (goalId, nextStatus) => {
    updateGoalField(goalId, () => ({ status: nextStatus }));
  };

  const updateGoalPriority = (goalId, nextPriority) => {
    updateGoalField(goalId, () => ({ priority: nextPriority }));
  };

  const updateGoalTarget = (goalId, nextTarget) => {
    updateGoalField(goalId, () => ({
      targetAmount: parseFloat(nextTarget) || 0,
    }));
  };

  const updateGoalPlannedAmount = (goalId, nextValue) => {
    updateGoalField(goalId, () => ({
      plannedMonthlyAmount: parseFloat(nextValue) || 0,
    }));
  };

  const updateValue = (monthIndex, goalId, nextValue) => {
    setStatusNotice("");

    updateCurrentPlan((plan) => ({
      ...plan,
      monthlyData: plan.monthlyData.map((month, index) =>
        index === monthIndex
          ? {
              ...month,
              values: {
                ...month.values,
                [goalId]: parseFloat(nextValue) || 0,
              },
            }
          : month
      ),
    }));
  };

  const updateObservation = (monthIndex, nextObservation) => {
    setStatusNotice("");

    updateCurrentPlan((plan) => ({
      ...plan,
      monthlyData: plan.monthlyData.map((month, index) =>
        index === monthIndex
          ? { ...month, observation: nextObservation.slice(0, 240) }
          : month
      ),
    }));
  };

  const handleExportStamp = () => {
    updateMetadata((metadata) => ({
      ...metadata,
      lastExportAt: new Date().toISOString(),
    }));
  };

  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadTextFile(
      `planometa-${currentYear}-${timestamp}.csv`,
      exportCsv(appState, currentYear),
      "text/csv;charset=utf-8"
    );
    handleExportStamp();
    setStatusNotice(`CSV do ano ${currentYear} exportado com sucesso.`);
    pushToast("CSV exportado", `O arquivo do ano ${currentYear} j\u00e1 est\u00e1 dispon\u00edvel.`, "success");
    appendBackupLog({
      type: "export_csv",
      title: "CSV exportado",
      description: `Relat\u00f3rio CSV do ano ${currentYear} gerado.`,
      yearKey: currentYear,
    });
  };

  const handleExportXlsx = async () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    await exportWorkbookFile(
      appState,
      currentYear,
      `planometa-${currentYear}-${timestamp}.xlsx`
    );
    handleExportStamp();
    setStatusNotice(`Planilha XLSX do ano ${currentYear} exportada com sucesso.`);
    pushToast(
      "Planilha exportada",
      `O XLSX do ano ${currentYear} foi gerado com sucesso.`,
      "success"
    );
    appendBackupLog({
      type: "export_xlsx",
      title: "Planilha XLSX exportada",
      description: "Arquivo de planilha consolidado gerado.",
      yearKey: currentYear,
    });
  };

  const handleExportPdf = async () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    await exportPdfFile(
      appState,
      currentYear,
      `relatorio-planometa-${currentYear}-${timestamp}.pdf`
    );
    handleExportStamp();
    setStatusNotice(`Relat\u00f3rio PDF do ano ${currentYear} exportado com sucesso.`);
    pushToast(
      "PDF exportado",
      `O relat\u00f3rio do ano ${currentYear} foi gerado com sucesso.`,
      "success"
    );
    appendBackupLog({
      type: "export_pdf",
      title: "PDF exportado",
      description: "Relat\u00f3rio detalhado em PDF gerado.",
      yearKey: currentYear,
    });
  };

  const handleExportSummary = async () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    await exportDocxSummaryFile(
      appState,
      currentYear,
      `planometa-resumo-${currentYear}-${timestamp}.docx`
    );
    handleExportStamp();
    setStatusNotice(`Resumo do ano ${currentYear} exportado em DOCX com sucesso.`);
    pushToast(
      "Resumo exportado",
      `O resumo do ano ${currentYear} foi gerado em DOCX.`,
      "success"
    );
    appendBackupLog({
      type: "export_summary",
      title: "Resumo estrat\u00e9gico exportado",
      description: `Resumo em DOCX do ano ${currentYear} gerado.`,
      yearKey: currentYear,
    });
  };
  const handleExportJson = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadTextFile(
      `planometa-backup-conta-${timestamp}.json`,
      JSON.stringify(cloneAppState(appState), null, 2),
      "application/json;charset=utf-8"
    );
    handleExportStamp();
    setStatusNotice("Backup JSON completo da conta exportado com sucesso.");
    pushToast(
      "Backup exportado",
      "O JSON inclui todos os anos da conta para restaura\u00e7\u00e3o completa.",
      "success"
    );
    appendBackupLog({
      type: "export_json",
      title: "Backup JSON exportado",
      description: "Snapshot restaur\u00e1vel da conta gerado com sucesso.",
      yearKey: currentYear,
    });
  };

  const handleImportJson = async (file) => {
    if (!file) {
      return;
    }

    openConfirmDialog({
      title: "Restaurar backup",
      message:
        "A restaura\u00e7\u00e3o vai substituir o planejamento atual da conta. O estado anterior continuar\u00e1 salvo na lixeira de resets.",
      confirmLabel: "Restaurar agora",
      tone: "warning",
      onConfirm: async () => {
        try {
          const rawContent = await file.text();
          const importedState = parseImportedAppState(rawContent);
          setAppState({
            ...importedState,
            metadata: {
              ...importedState.metadata,
              lastImportAt: new Date().toISOString(),
              trash: {
                ...importedState.metadata?.trash,
                resets: [
                  {
                    id: `trash-reset-${Date.now()}`,
                    snapshot: buildRecoverySnapshot(appState),
                    deletedAt: new Date().toISOString(),
                  },
                  ...((importedState.metadata?.trash && importedState.metadata.trash.resets) || []),
                ].slice(0, 6),
              },
              backupLog: [
                {
                  id: `backup-${Date.now()}`,
                  type: "import_json",
                  title: "Backup restaurado",
                  description: "A conta foi restaurada a partir de um arquivo JSON.",
                  yearKey: currentYear,
                  occurredAt: new Date().toISOString(),
                },
                ...((importedState.metadata?.backupLog || []).slice(0, 39)),
              ],
            },
          });
          setStatusNotice("Backup importado com sucesso. A nuvem ser\u00e1 atualizada.");
          pushToast("Backup restaurado", "O snapshot anterior foi guardado na lixeira de resets.", "success");
        } catch (error) {
          setStatusNotice(
            "N\u00e3o foi poss\u00edvel importar o backup. Verifique o arquivo JSON."
          );
          pushToast("Falha na restaura\u00e7\u00e3o", "O arquivo JSON n\u00e3o p\u00f4de ser interpretado.", "danger");
        } finally {
          closeConfirmDialog();
        }
      },
    });
  };

  const resetAllData = () => {
    openConfirmDialog({
      title: "Resetar conta",
      message: `Os dados ser\u00e3o redefinidos e o planejamento do ano ${currentYear} ser\u00e1 recriado vazio. Um snapshot da conta ficar\u00e1 salvo para recupera\u00e7\u00e3o.`,
      confirmLabel: "Resetar conta",
      tone: "danger",
      onConfirm: () => {
        setAppState((currentState) => {
          const nextState = buildResetState(currentYear);
          return {
            ...nextState,
            metadata: {
              ...nextState.metadata,
              trash: {
                ...nextState.metadata.trash,
                resets: [
                  {
                    id: `trash-reset-${Date.now()}`,
                    snapshot: buildRecoverySnapshot(currentState),
                    deletedAt: new Date().toISOString(),
                  },
                  ...((currentState.metadata?.trash && currentState.metadata.trash.resets) || []),
                ].slice(0, 6),
              },
              activityLog: currentState.metadata?.activityLog || [],
              backupLog: currentState.metadata?.backupLog || [],
            },
          };
        });
        setStatusNotice("Conta resetada para o estado inicial. A nuvem ser\u00e1 atualizada.");
        pushToast("Conta resetada", "O snapshot anterior foi preservado para recupera\u00e7\u00e3o.", "warning");
        appendBackupLog({
          type: "reset_account",
          title: "Conta resetada",
          description: `Reset completo executado no ano ${currentYear}.`,
          yearKey: currentYear,
        });
        appendActivityLog({
          type: "reset_account",
          title: "Reset completo",
          description: `A conta foi redefinida e o ciclo ${currentYear} foi recriado vazio.`,
          yearKey: currentYear,
        });
        closeConfirmDialog();
      },
    });
  };

  const handleCreateYear = () => {
    if (!pendingYear) {
      return;
    }

    setAppState((currentState) => ({
      ...currentState,
      currentYear: pendingYear,
      years: {
        ...currentState.years,
        [pendingYear]: buildYearFromCurrentPlan(
          getYearPlan(currentState, currentState.currentYear)
        ),
      },
      metadata: {
        ...currentState.metadata,
        deletedYears: (currentState.metadata?.deletedYears || []).filter(
          (yearKey) => yearKey !== pendingYear
        ),
      },
    }));
    setStatusNotice(`Ano ${pendingYear} criado com a estrutura do ano atual.`);
    pushToast("Ano criado", `O ciclo ${pendingYear} j\u00e1 est\u00e1 dispon\u00edvel no painel.`, "success");
    appendActivityLog({
      type: "create_year",
      title: "Ano criado",
      description: `O ciclo ${pendingYear} foi criado a partir da estrutura de ${currentYear}.`,
      yearKey: pendingYear,
    });
  };

  const handleDeleteYear = (yearKeyToDelete) => {
    if (availableYears.length <= 1) {
      setStatusNotice("\u00c9 preciso manter pelo menos um ano no painel.");
      pushToast(
        "Exclus\u00e3o indispon\u00edvel",
        "Crie outro ciclo antes de remover o \u00fanico ano restante da conta.",
        "warning"
      );
      return;
    }

    openConfirmDialog({
      title: `Excluir ano ${yearKeyToDelete}`,
      message:
        "Este ciclo ser\u00e1 removido da lista com todas as metas, aportes e observa\u00e7\u00f5es vinculadas. A exclus\u00e3o apaga os dados desse ano da conta.",
      confirmLabel: "Excluir ano",
      tone: "danger",
      onConfirm: () => {
        setAppState((currentState) => {
          const nextYears = { ...currentState.years };
          delete nextYears[yearKeyToDelete];

          return cloneAppState({
            ...currentState,
            years: nextYears,
            metadata: {
              ...currentState.metadata,
              deletedYears: [
                yearKeyToDelete,
                ...((currentState.metadata?.deletedYears || []).filter(
                  (yearKey) => yearKey !== yearKeyToDelete
                )),
              ].slice(0, 48),
            },
          });
        });

        setStatusNotice(`Ano ${yearKeyToDelete} removido da conta.`);
        pushToast(
          "Ano exclu\u00eddo",
          `O ciclo ${yearKeyToDelete} saiu da lista com todos os dados vinculados.`,
          "warning"
        );
        appendActivityLog({
          type: "delete_year",
          title: "Ano exclu\u00eddo",
          description: `O ciclo ${yearKeyToDelete} foi removido da conta com seus dados associados.`,
          yearKey: yearKeyToDelete,
        });
        closeConfirmDialog();
      },
    });
  };

  const restoreGoalFromTrash = (trashEntryId) => {
    const trashEntry = appState.metadata?.trash?.goals?.find((entry) => entry.id === trashEntryId);

    if (!trashEntry) {
      return;
    }

    const restoreYear = trashEntry.yearKey;
    const restoredGoalId = Date.now();

    setAppState((currentState) => {
      const targetPlan = getYearPlan(currentState, restoreYear);
      const nextPlan = {
        ...targetPlan,
        goals: [
          ...targetPlan.goals,
          {
            ...trashEntry.goal,
            id: restoredGoalId,
            name: buildUniqueGoalName(trashEntry.goal.name, null, targetPlan.goals),
          },
        ],
        monthlyData: targetPlan.monthlyData.map((month) => ({
          ...month,
          values: {
            ...month.values,
            [restoredGoalId]: Number(trashEntry.values?.[month.month] || 0),
          },
        })),
      };

      return {
        ...currentState,
        currentYear: restoreYear,
        years: {
          ...currentState.years,
          [restoreYear]: nextPlan,
        },
        metadata: {
          ...currentState.metadata,
          trash: {
            ...currentState.metadata?.trash,
            goals: (currentState.metadata?.trash?.goals || []).filter(
              (entry) => entry.id !== trashEntryId
            ),
          },
        },
      };
    });

    setStatusNotice(`Meta restaurada no ano ${restoreYear}.`);
    pushToast("Meta restaurada", "A meta voltou para o planejamento com os valores registrados.", "success");
    appendActivityLog({
      type: "restore_goal",
      title: "Meta restaurada",
      description: `${trashEntry.goal.name} voltou para o ciclo ${restoreYear}.`,
      yearKey: restoreYear,
    });
  };

  const restoreResetSnapshot = (snapshotId) => {
    const snapshotEntry = appState.metadata?.trash?.resets?.find((entry) => entry.id === snapshotId);

    if (!snapshotEntry) {
      return;
    }

    setAppState(snapshotEntry.snapshot);
    setStatusNotice("Snapshot restaurado com sucesso.");
    pushToast("Snapshot restaurado", "O estado anterior da conta voltou para o painel.", "success");
    appendBackupLog({
      type: "restore_snapshot",
      title: "Snapshot restaurado",
      description: "Um estado salvo antes de reset foi recuperado.",
      yearKey: currentYear,
    });
  };

  const handleChangeYear = (nextYear) => {
    setAppState((currentState) => ({
      ...currentState,
      currentYear: nextYear,
    }));
  };

  const handleDismissOnboarding = () => {
    updateMetadata((metadata) => ({
      ...metadata,
      onboardingCompleted: true,
    }));
  };

  const scrollToGoalsManager = () => {
    document
      .getElementById("goals-manager-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChangeCategoryFilter = (nextCategory) => {
    setCategoryFilter(nextCategory);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToGoalsManager();
      });
    });
  };

  const scrollToGovernance = () => {
    document
      .getElementById("governance-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleHeroCreateFirstGoal = () => {
    addGoal();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToGoalsManager();
      });
    });
  };

  if (!cloudReady) {
    return (
      <LoadingScreen
        title="Sincronizando seu painel financeiro..."
        subtitle={
          loadingStage === "sync"
            ? "Estamos validando sua sess\u00e3o e carregando os dados da sua conta."
            : "Preparando o ambiente inicial do sistema."
        }
        actionLabel="Trocar conta"
        onAction={onSignOut}
      />
    );
  }

  return (
    <div className="app-container">
      <a className="skip-link" href="#app-main-content">
        {"Pular para o conte\u00fado principal"}
      </a>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        tone={confirmDialog.tone}
        onCancel={closeConfirmDialog}
        onConfirm={() => confirmDialog.onConfirm?.()}
      />
      <main className="app-content" id="app-main-content">
        <Header
          lastSavedAt={lastSavedAt}
          saveError={saveError}
          saveStatus={saveStatus}
          user={user}
          onSignOut={onSignOut}
          syncStatus={syncStatus}
          lastSyncedAt={lastSyncedAt}
          isCloudEnabled
        />

        {!appState.metadata?.onboardingCompleted ? (
          <OnboardingPanel onDismiss={handleDismissOnboarding} />
        ) : null}

        <DashboardHero
          currentYear={currentYear}
          goals={goals}
          monthlyData={monthlyData}
          totalGeral={dashboardMetrics.grandTotal}
          completionRate={dashboardMetrics.completionRate}
          plannedAnnualTotal={dashboardMetrics.plannedAnnualTotal}
          onAddGoal={handleHeroCreateFirstGoal}
        />

        <QuickActionsBar
          canDeleteYear={availableYears.length > 1}
          onAddGoal={handleHeroCreateFirstGoal}
          onDeleteYear={() => handleDeleteYear(currentYear)}
          onOpenGovernance={scrollToGovernance}
        />

        <PlanningToolbar
          availableYears={availableYears}
          currentYear={currentYear}
          onChangeYear={handleChangeYear}
          creatableYears={creatableYears}
          pendingYear={pendingYear}
          onChangePendingYear={setPendingYear}
          onCreateYear={handleCreateYear}
          availableCategories={availableCategories}
          categoryFilter={categoryFilter}
          onChangeCategoryFilter={handleChangeCategoryFilter}
          statusFilter={statusFilter}
          onChangeStatus={setStatusFilter}
        />

        <DataActions
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
          onExportPdf={handleExportPdf}
          onExportSummary={handleExportSummary}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onReset={resetAllData}
          notice={statusNotice}
          lastExportAt={appState.metadata?.lastExportAt}
          lastImportAt={appState.metadata?.lastImportAt}
        />

        <StatsCards
          totalGeral={dashboardMetrics.grandTotal}
          activeGoals={dashboardMetrics.activeGoalsCount}
          monthlyAverage={dashboardMetrics.monthlyAverage}
          filledMonths={dashboardMetrics.filledMonthsCount}
          completionRate={dashboardMetrics.completionRate}
          plannedAnnualTotal={dashboardMetrics.plannedAnnualTotal}
        />

        <InsightsPanel goals={goals} monthlyData={monthlyData} />

        <StrategicInsightsPanel
          appState={appState}
          currentYear={currentYear}
          goals={goals}
          monthlyData={monthlyData}
          comparisonYear={comparisonYear}
          comparisonOptions={comparisonOptions}
          onChangeComparisonYear={setComparisonYear}
          canDeleteYear={availableYears.length > 1}
          onDeleteYear={handleDeleteYear}
        />

        <PlanningIntelligencePanel
          goals={goals}
          monthlyData={monthlyData}
          currentYear={currentYear}
        />

        <GoalsManager
          sectionId="goals-manager-section"
          goals={filteredGoals}
          hasActiveFilters={hasActiveFilters}
          onAddGoal={addGoal}
          onRemoveGoal={removeGoal}
          onUpdateGoalName={updateGoalName}
          onCommitGoalName={commitGoalName}
          onUpdateGoalCategory={updateGoalCategory}
          onUpdateGoalStatus={updateGoalStatus}
          onUpdateGoalTarget={updateGoalTarget}
          onUpdateGoalPlannedAmount={updateGoalPlannedAmount}
          onDuplicateGoal={duplicateGoal}
          onUpdateGoalPriority={updateGoalPriority}
          calculateGoalTotal={(goalId) => dashboardMetrics.goalTotalsById[goalId] || 0}
          calculateGoalProgress={(goalId) =>
            dashboardMetrics.goalProgressById[goalId] || 0
          }
          calculateGoalProjection={(goalId) =>
            dashboardMetrics.goalProjectionById[goalId] ?? null
          }
          calculateGoalRisk={(goalId) =>
            planningAlerts.find((entry) => entry.goal.id === goalId)?.riskLevel || "healthy"
          }
        />

        <MonthlyTable
          goals={filteredGoals}
          monthlyData={monthlyData}
          onUpdateValue={updateValue}
          onUpdateObservation={updateObservation}
          onAddGoal={addGoal}
          calculateMonthTotal={(monthIndex) =>
            dashboardMetrics.visibleMonthTotals[monthIndex] || 0
          }
          calculateGoalTotal={(goalId) =>
            dashboardMetrics.tableGoalTotalsById[goalId] || 0
          }
          calculateGrandTotal={() => dashboardMetrics.visibleGrandTotal}
        />

        <Tips />
        <PWAInstructions
          canInstall={canInstall}
          installStatus={installStatus}
          onInstall={handleInstallApp}
          pwaEnabled={appConfig.enablePwa}
        />
        <GovernancePanel
          activityLog={appState.metadata?.activityLog || []}
          backupLog={appState.metadata?.backupLog || []}
          trash={appState.metadata?.trash || { goals: [], resets: [] }}
          onRestoreGoal={restoreGoalFromTrash}
          onRestoreReset={restoreResetSnapshot}
        />
      </main>
    </div>
  );
};

const App = () => {
  const {
    user,
    isLoading,
    isFirebaseConfigured,
    authError,
    isSigningIn,
    signInWithGoogle,
    signOutUser,
    cancelAuthLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <LoadingScreen
        title={"Verificando sua sess\u00e3o..."}
        subtitle={
          "O Firebase est\u00e1 restaurando a autentica\u00e7\u00e3o do Google neste navegador."
        }
        actionLabel="Ir para login"
        onAction={cancelAuthLoading}
      />
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSignIn={signInWithGoogle}
        isFirebaseConfigured={isFirebaseConfigured}
        authError={authError}
        isSigningIn={isSigningIn}
      />
    );
  }

  return <DashboardApp user={user} onSignOut={signOutUser} />;
};

export default App;


