import { useMemo } from "react";
import {
  calculateCompletionRate,
  calculateGoalHealthSummary,
  calculatePlannedVsActual,
  buildMonthlyTotalsSeries,
} from "../utils/calculations";
import { formatCurrency, formatMonthProjection, formatPercent } from "../utils/formatters";
import "../styles/InsightsPanel.css";

const InsightsPanel = ({ goals, monthlyData }) => {
  const monthlySeries = useMemo(
    () => buildMonthlyTotalsSeries(monthlyData),
    [monthlyData]
  );
  const highestValue = useMemo(
    () => Math.max(...monthlySeries.map((month) => month.total), 1),
    [monthlySeries]
  );
  const completionRate = useMemo(
    () => calculateCompletionRate(goals, monthlyData),
    [goals, monthlyData]
  );
  const plannedVsActual = useMemo(
    () => calculatePlannedVsActual(goals, monthlyData),
    [goals, monthlyData]
  );
  const goalHealthSummary = useMemo(
    () => calculateGoalHealthSummary(goals, monthlyData).slice(0, 3),
    [goals, monthlyData]
  );

  return (
    <section className="insights-panel">
      <div className="insights-card insights-card-chart">
        <div className="insights-header">
          <div>
            <p className="insights-kicker">Evolução mensal</p>
            <h2 className="insights-title">Aportes realizados</h2>
          </div>
          <p className="insights-caption">Comparativo visual por mês</p>
        </div>

        <div className="insights-bars" aria-label="Gráfico de aportes mensais">
          {monthlySeries.map((month) => (
            <div key={month.label} className="insights-bar-column">
              <div className="insights-bar-track">
                <div
                  className="insights-bar-fill"
                  style={{ height: `${(month.total / highestValue) * 100}%` }}
                ></div>
              </div>
              <span className="insights-bar-label">{month.label}</span>
              <span className="insights-bar-value">{formatCurrency(month.total)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insights-card">
        <div className="insights-header">
          <div>
            <p className="insights-kicker">Indicadores</p>
            <h2 className="insights-title">Saúde das metas</h2>
          </div>
        </div>

        <div className="insights-metrics">
          <div>
            <span>Taxa de conclusão</span>
            <strong>{formatPercent(completionRate)}</strong>
          </div>
          <div>
            <span>Planejado no ano</span>
            <strong>{formatCurrency(plannedVsActual.planned)}</strong>
          </div>
          <div>
            <span>Realizado no ano</span>
            <strong>{formatCurrency(plannedVsActual.actual)}</strong>
          </div>
          <div>
            <span>Desvio</span>
            <strong>
              {formatCurrency(plannedVsActual.actual - plannedVsActual.planned)}
            </strong>
          </div>
        </div>

        <div className="insights-goal-list">
          {goalHealthSummary.length > 0 ? (
            goalHealthSummary.map((goal) => (
              <div key={goal.id} className="insights-goal-row">
                <div>
                  <p>{goal.name}</p>
                  <span>{goal.category}</span>
                </div>
                <strong>{formatMonthProjection(goal.monthsToGoal)}</strong>
              </div>
            ))
          ) : (
            <p className="insights-empty">
              Cadastre metas para visualizar projeções e prioridades do seu plano.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default InsightsPanel;
