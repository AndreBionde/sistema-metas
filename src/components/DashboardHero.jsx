import {
  ArrowRight,
  CalendarRange,
  Compass,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { getCategoryMeta } from "../utils/categoryMeta";
import {
  formatCurrency,
  formatCurrencyAdaptive,
  formatPercent,
} from "../utils/formatters";
import "../styles/DashboardHero.css";

const DashboardHero = ({
  currentYear,
  goals,
  monthlyData,
  totalGeral,
  completionRate,
  plannedAnnualTotal,
  onAddGoal,
}) => {
  const getGoalTotal = (goalId) =>
    monthlyData.reduce((sum, month) => sum + Number(month.values?.[goalId] || 0), 0);

  const getGoalProgress = (goal) =>
    Math.min(((getGoalTotal(goal.id) / Number(goal.targetAmount || 0)) * 100) || 0, 100);

  const activeGoals = goals.filter((goal) => goal.status !== "completed");
  const topGoal = activeGoals
    .filter((goal) => Number(goal.targetAmount) > 0)
    .sort((leftGoal, rightGoal) => {
      return getGoalProgress(rightGoal) - getGoalProgress(leftGoal);
    })[0];

  const monthsWithEntries = monthlyData.filter(
    (month) =>
      Object.values(month.values || {}).some((value) => Number(value || 0) > 0) ||
      month.observation?.trim()
  ).length;

  const topGoalMeta = getCategoryMeta(topGoal?.category);
  const TopGoalIcon = topGoalMeta.icon;
  const topGoalTotal = topGoal ? getGoalTotal(topGoal.id) : 0;
  const topGoalProgress = topGoal ? getGoalProgress(topGoal) : 0;
  const activeCategoryCount = new Set(goals.map((goal) => goal.category)).size;
  const spotlightStage = topGoal
    ? topGoalProgress >= 100
      ? "Conclu\u00edda"
      : topGoal.status === "paused"
        ? "Em espera"
        : "Em evolu\u00e7\u00e3o"
    : "";

  const heroCards = [
    {
      icon: TrendingUp,
      label: "Progresso global",
      value: formatPercent(completionRate),
      helper: `${goals.length} metas no radar`,
    },
    {
      icon: CalendarRange,
      label: "Planejado no ciclo",
      value: formatCurrencyAdaptive(plannedAnnualTotal),
      fullValue: formatCurrency(plannedAnnualTotal),
      helper: `${monthsWithEntries} meses com atividade`,
    },
    {
      icon: Compass,
      label: "Acumulado no ano",
      value: formatCurrencyAdaptive(totalGeral),
      fullValue: formatCurrency(totalGeral),
      helper: `Vis\u00e3o consolidada de ${currentYear}`,
    },
  ];

  const nextActionCopy =
    goals.length === 0
      ? "Crie sua primeira meta para estruturar este ciclo."
      : monthsWithEntries === 0
        ? "Registre o primeiro aporte do ano para ativar a leitura de evolu\u00e7\u00e3o."
        : "Ajuste aportes planejados das metas mais estrat\u00e9gicas para acelerar o ritmo.";

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <p className="dashboard-hero-kicker">
          <Sparkles className="dashboard-hero-kicker-icon" aria-hidden="true" />
          {"Vis\u00e3o executiva do ciclo"}
        </p>
        <h2 className="dashboard-hero-title">
          {goals.length > 0
            ? `Seu planejamento de ${currentYear} est\u00e1 em movimento.`
            : `Monte o plano de ${currentYear} com inten\u00e7\u00e3o e clareza.`}
        </h2>
        <p className="dashboard-hero-description">{nextActionCopy}</p>

        <div className="dashboard-hero-cards">
          {heroCards.map(({ icon: Icon, label, value, fullValue, helper }) => (
            <article key={label} className="dashboard-hero-card">
              <div className="dashboard-hero-card-top">
                <Icon className="dashboard-hero-card-icon" aria-hidden="true" />
                <span>{label}</span>
              </div>
              <strong title={fullValue || value}>{value}</strong>
              <p>{helper}</p>
            </article>
          ))}
        </div>

        <div className="dashboard-hero-signals">
          <div className="dashboard-hero-signal-card">
            <span>Categorias ativas</span>
            <strong>{activeCategoryCount || 0}</strong>
            <small>Estrutura atual do ciclo</small>
          </div>
          <div className="dashboard-hero-signal-card">
            <span>{"Cad\u00eancia"}</span>
            <strong>{`${monthsWithEntries}/12 meses`}</strong>
            <small>Meses com registro real</small>
          </div>
          <div className="dashboard-hero-signal-card">
            <span>Foco do momento</span>
            <strong>{topGoal ? topGoal.name : "Criar primeira meta"}</strong>
            <small>{topGoal ? topGoalMeta.label : "Painel aguardando objetivo inicial"}</small>
          </div>
        </div>
      </div>

      <aside className="dashboard-hero-spotlight">
        {topGoal ? (
          <div className="dashboard-hero-spotlight-card">
            <div className="dashboard-hero-spotlight-top">
              <span className="dashboard-hero-spotlight-chip">
                <TopGoalIcon className="dashboard-hero-spotlight-icon" aria-hidden="true" />
                {topGoalMeta.label}
              </span>
              <span className="dashboard-hero-spotlight-label">Meta em destaque</span>
            </div>
            <strong className="dashboard-hero-spotlight-title">{topGoal.name}</strong>
            <p className="dashboard-hero-spotlight-copy">
              {"Escolhida por ter hoje a maior taxa de conclus\u00e3o entre as metas ativas com alvo definido."}
            </p>
            <div className="dashboard-hero-spotlight-progress">
              <div className="dashboard-hero-spotlight-progress-top">
                <span>{"Crit\u00e9rio do destaque"}</span>
                <strong>{formatPercent(topGoalProgress)}</strong>
              </div>
              <div className="dashboard-hero-spotlight-progress-track" aria-hidden="true">
                <div
                  className="dashboard-hero-spotlight-progress-fill"
                  style={{ width: `${topGoalProgress}%`, backgroundColor: topGoal.color }}
                ></div>
              </div>
              <small>
                {formatCurrency(topGoalTotal)} acumulados de {formatCurrency(topGoal.targetAmount)}
              </small>
            </div>
            <div className="dashboard-hero-spotlight-footer">
              <div>
                <span>Alvo</span>
                <strong>{formatCurrency(topGoal.targetAmount)}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{topGoal.status === "paused" ? "Pausada" : "Em andamento"}</strong>
              </div>
              <div>
                <span>Acumulado</span>
                <strong>{formatCurrency(topGoalTotal)}</strong>
              </div>
              <div>
                <span>Fase</span>
                <strong>{spotlightStage}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-hero-empty">
            <Target className="dashboard-hero-empty-icon" aria-hidden="true" />
            <strong>Nenhuma meta criada ainda</strong>
            <p>
              {"Comece pelo objetivo mais relevante do ano. O painel vai construir "}
              {"proje\u00e7\u00f5es e destaques automaticamente."}
            </p>
            <button type="button" onClick={onAddGoal} className="dashboard-hero-empty-button">
              <ArrowRight className="dashboard-hero-empty-arrow" aria-hidden="true" />
              Criar primeira meta
            </button>
          </div>
        )}
      </aside>
    </section>
  );
};

export default DashboardHero;
