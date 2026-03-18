import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import GoalsManager from "./components/GoalsManager";
import MonthlyTable from "./components/MonthlyTable";
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
  getNextAvailableYear,
  removeGoalFromPlan,
} from "./utils/dashboardState";
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

  const { canInstall, installStatus, handleInstallApp } = useInstallPrompt({
    enablePwa: appConfig.enablePwa,
    onInstalled: () =>
      setStatusNotice("Aplicativo instalado com sucesso neste dispositivo."),
  });

  const currentYear = appState.currentYear;
  const currentPlan = getYearPlan(appState, currentYear);
  const goals = currentPlan.goals;
  const monthlyData = currentPlan.monthlyData;
  const availableYears = Object.keys(appState.years).sort(
    (leftYear, rightYear) => Number(rightYear) - Number(leftYear)
  );
  const availableCategories = getDistinctCategories(goals);

  const filteredGoals = useMemo(
    () =>
      goals.filter((goal) => {
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
    () => buildDashboardMetrics({ goals, monthlyData, filteredGoals }),
    [goals, monthlyData, filteredGoals]
  );

  useEffect(() => {
    if (!availableCategories.includes(categoryFilter)) {
      setCategoryFilter("Todas");
    }
  }, [availableCategories, categoryFilter]);

  useEffect(() => {
    document.title = appConfig.appName;
  }, []);

  const updateMetadata = (updater) => {
    setAppState((currentState) => ({
      ...currentState,
      metadata: updater(currentState.metadata || {}),
    }));
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
  };

  const removeGoal = (goalId) => {
    if (!window.confirm("Tem certeza que deseja remover esta meta?")) {
      return;
    }

    updateCurrentPlan((plan) => removeGoalFromPlan(plan, goalId));
    setStatusNotice("Meta removida com sucesso.");
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
  };

  const handleExportXlsx = async () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    await exportWorkbookFile(appState, `planometa-${timestamp}.xlsx`);
    handleExportStamp();
    setStatusNotice("Planilha XLSX exportada com sucesso.");
  };

  const handleExportPdf = async () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    await exportPdfFile(appState, `relatorio-planometa-${timestamp}.pdf`);
    handleExportStamp();
    setStatusNotice("Relatório PDF exportado com sucesso.");
  };

  const resetAllData = () => {
    if (
      !window.confirm(
        "Isto vai redefinir todas as metas da sua conta para o estado inicial vazio. Confirma o reset completo?"
      )
    ) {
      return;
    }

    setAppState(buildResetState());
    setStatusNotice("Conta resetada para o estado inicial. A nuvem será atualizada.");
  };

  const handleCreateYear = () => {
    const nextYear = getNextAvailableYear(currentYear, appState.years);

    setAppState((currentState) => ({
      ...currentState,
      currentYear: nextYear,
      years: {
        ...currentState.years,
        [nextYear]: buildYearFromCurrentPlan(
          getYearPlan(currentState, currentState.currentYear)
        ),
      },
    }));
    setStatusNotice(`Ano ${nextYear} criado com a estrutura do ano atual.`);
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

  if (!cloudReady) {
    return (
      <LoadingScreen
        title="Sincronizando seu painel financeiro..."
        subtitle={
          loadingStage === "sync"
            ? "Estamos validando sua sessão e carregando os dados da sua conta."
            : "Preparando o ambiente inicial do sistema."
        }
        actionLabel="Trocar conta"
        onAction={onSignOut}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="app-content">
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

        <PlanningToolbar
          availableYears={availableYears}
          currentYear={currentYear}
          onChangeYear={handleChangeYear}
          onCreateYear={handleCreateYear}
          availableCategories={availableCategories}
          categoryFilter={categoryFilter}
          onChangeCategory={setCategoryFilter}
          statusFilter={statusFilter}
          onChangeStatus={setStatusFilter}
        />

        <DataActions
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
          onExportPdf={handleExportPdf}
          onReset={resetAllData}
          notice={statusNotice}
          lastExportAt={appState.metadata?.lastExportAt}
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

        <GoalsManager
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
          calculateGoalTotal={(goalId) => dashboardMetrics.goalTotalsById[goalId] || 0}
          calculateGoalProgress={(goalId) =>
            dashboardMetrics.goalProgressById[goalId] || 0
          }
          calculateGoalProjection={(goalId) =>
            dashboardMetrics.goalProjectionById[goalId] ?? null
          }
        />

        <MonthlyTable
          goals={filteredGoals}
          monthlyData={monthlyData}
          onUpdateValue={updateValue}
          onUpdateObservation={updateObservation}
          calculateMonthTotal={(monthIndex) =>
            dashboardMetrics.visibleMonthTotals[monthIndex] || 0
          }
          calculateGoalTotal={(goalId) => dashboardMetrics.goalTotalsById[goalId] || 0}
          calculateGrandTotal={() => dashboardMetrics.visibleGrandTotal}
        />

        <Tips />
        <PWAInstructions
          canInstall={canInstall}
          installStatus={installStatus}
          onInstall={handleInstallApp}
          pwaEnabled={appConfig.enablePwa}
        />
      </div>
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
        title="Verificando sua sessão..."
        subtitle="O Firebase está restaurando a autenticação do Google neste navegador."
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
