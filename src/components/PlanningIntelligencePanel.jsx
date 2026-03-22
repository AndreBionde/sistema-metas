import { AlertOctagon, Gauge, Sparkles, TriangleAlert } from "lucide-react";
import { PRIORITY_LABELS, buildPlanningAlerts, sortGoalsByPriority } from "../utils/planningInsights";
import { formatCurrencyAdaptive } from "../utils/formatters";
import "../styles/PlanningIntelligencePanel.css";

const riskLabels = {
  healthy: "Saudável",
  watch: "Acompanhar",
  warning: "Risco de atraso",
  critical: "Sem ritmo",
};

const PlanningIntelligencePanel = ({ goals, monthlyData, currentYear }) => {
  const alerts = buildPlanningAlerts(goals, monthlyData, currentYear);
  const highlightedGoals = sortGoalsByPriority(goals).slice(0, 4);
  const staleGoals = alerts.filter((entry) => entry.stagnationMonths >= 3).slice(0, 3);

  return (
    <section className="planning-intelligence">
      <div className="planning-intelligence-header">
        <div>
          <p className="planning-intelligence-kicker">Inteligência do planejamento</p>
          <h2>Alertas, prioridades e ritmo ideal</h2>
        </div>
        <p className="planning-intelligence-caption">
          O painel destaca metas estagnadas, prioridade atual e aporte sugerido por objetivo.
        </p>
      </div>

      <div className="planning-intelligence-grid">
        <article className="planning-intelligence-card">
          <div className="planning-intelligence-card-top">
            <TriangleAlert className="planning-intelligence-icon" aria-hidden="true" />
            <span>Alertas de meta parada</span>
          </div>
          {staleGoals.length > 0 ? (
            <div className="planning-intelligence-list">
              {staleGoals.map(({ goal, stagnationMonths }) => (
                <div key={goal.id} className="planning-intelligence-item">
                  <strong>{goal.name}</strong>
                  <p>{stagnationMonths} meses sem aporte registrado.</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="planning-intelligence-empty">
              Nenhuma meta ativa passou longos períodos sem movimento recente.
            </p>
          )}
        </article>

        <article className="planning-intelligence-card">
          <div className="planning-intelligence-card-top">
            <Sparkles className="planning-intelligence-icon" aria-hidden="true" />
            <span>Sugestão de aporte ideal</span>
          </div>
          <div className="planning-intelligence-list">
            {alerts.slice(0, 4).map(({ goal, idealMonthlyContribution }) => (
              <div key={goal.id} className="planning-intelligence-item">
                <strong>{goal.name}</strong>
                <p>{formatCurrencyAdaptive(idealMonthlyContribution)} por mês para manter o ciclo competitivo.</p>
              </div>
            ))}
          </div>
        </article>

        <article className="planning-intelligence-card">
          <div className="planning-intelligence-card-top">
            <Gauge className="planning-intelligence-icon" aria-hidden="true" />
            <span>Indicador de risco e prioridade</span>
          </div>
          <div className="planning-intelligence-list">
            {highlightedGoals.map((goal) => {
              const goalInsight = alerts.find((entry) => entry.goal.id === goal.id);
              return (
                <div key={goal.id} className="planning-intelligence-item">
                  <strong>{goal.name}</strong>
                  <p>
                    Prioridade {PRIORITY_LABELS[goal.priority] || "Média"} ·{" "}
                    {riskLabels[goalInsight?.riskLevel] || "Saudável"} ·{" "}
                    {goalInsight?.stagnationMonths >= 3
                      ? `${goalInsight.stagnationMonths} meses sem aporte`
                      : "Movimento recente"}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="planning-intelligence-card">
          <div className="planning-intelligence-card-top">
            <AlertOctagon className="planning-intelligence-icon" aria-hidden="true" />
            <span>Meta com prioridade</span>
          </div>
          <div className="planning-priority-grid">
            {highlightedGoals.map((goal) => (
              <div key={goal.id} className="planning-priority-pill">
                <strong>{goal.name}</strong>
                <span>{PRIORITY_LABELS[goal.priority] || "Média"}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};

export default PlanningIntelligencePanel;
