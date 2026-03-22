import { useMemo } from "react";
import {
  calculateCompletionRate,
  calculateGoalHealthSummary,
  calculatePlannedMonthlyTotal,
  calculatePlannedVsActual,
  buildMonthlyTotalsSeries,
} from "../utils/calculations";
import {
  formatAmountShort,
  formatCurrency,
  formatCurrencyAdaptive,
  formatMonthProjection,
  formatPercent,
} from "../utils/formatters";
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
  const plannedMonthlyTarget = useMemo(
    () => calculatePlannedMonthlyTotal(goals),
    [goals]
  );
  const goalHealthSummary = useMemo(
    () => calculateGoalHealthSummary(goals, monthlyData).slice(0, 3),
    [goals, monthlyData]
  );
  const strongestMonth = useMemo(
    () =>
      monthlySeries.reduce(
        (bestMonth, currentMonth) =>
          currentMonth.total > bestMonth.total ? currentMonth : bestMonth,
        monthlySeries[0] || { label: "-", total: 0 }
      ),
    [monthlySeries]
  );

  return (
    <section className="insights-panel">
      <div className="insights-card insights-card-chart">
        <div className="insights-header">
          <div>
            <p className="insights-kicker">{"Evolu\u00e7\u00e3o mensal"}</p>
            <h2 className="insights-title">Aportes realizados</h2>
          </div>
          <p className="insights-caption">{"Comparativo visual por m\u00eas"}</p>
        </div>

        {monthlySeries.some((month) => month.total > 0) ? (
          <>
            <div className="insights-bars" aria-label={"Gr\u00e1fico de aportes mensais"}>
              {monthlySeries.map((month) => {
                return (
                  <div key={month.label} className="insights-bar-column">
                    <div className="insights-bar-track">
                      {plannedMonthlyTarget > 0 ? (
                        <div
                          className="insights-bar-plan"
                          style={{
                            height: `${(Math.min(plannedMonthlyTarget, highestValue) / highestValue) * 100}%`,
                          }}
                        ></div>
                      ) : null}
                      <div
                        className="insights-bar-fill"
                        style={{ height: `${(month.total / highestValue) * 100}%` }}
                      ></div>
                    </div>
                    <span className="insights-bar-label">{month.label}</span>
                    <span
                      className="insights-bar-value"
                      title={formatCurrency(month.total)}
                    >
                      {formatAmountShort(month.total, { currency: true })}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="insights-chart-footer">
              <div>
                <span>{"Melhor m\u00eas"}</span>
                <strong>
                  {strongestMonth.label} {"\u00b7"} {formatCurrency(strongestMonth.total)}
                </strong>
              </div>
              <div>
                <span>Meta mensal planejada</span>
                <strong>{formatCurrency(plannedMonthlyTarget)}</strong>
              </div>
            </div>
            <p className="insights-chart-legend">
              {"Barras mostram o realizado por m\u00eas. A marca clara indica a meta mensal "}
              {"planejada."}
            </p>
          </>
        ) : (
          <div className="insights-empty-state">
            <div className="insights-empty-bars" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="insights-empty">
              {"Registre os primeiros aportes para ativar a leitura de tend\u00eancia mensal."}
            </p>
          </div>
        )}
      </div>

      <div className="insights-card">
        <div className="insights-header">
          <div>
            <p className="insights-kicker">Indicadores</p>
            <h2 className="insights-title">{"Sa\u00fade das metas"}</h2>
          </div>
        </div>

        <div className="insights-metrics">
          <div>
            <span>{"Taxa de conclus\u00e3o"}</span>
            <strong>{formatPercent(completionRate)}</strong>
          </div>
          <div>
            <span>Planejado no ano</span>
            <strong title={formatCurrency(plannedVsActual.planned)}>
              {formatCurrencyAdaptive(plannedVsActual.planned)}
            </strong>
          </div>
          <div>
            <span>Realizado no ano</span>
            <strong title={formatCurrency(plannedVsActual.actual)}>
              {formatCurrencyAdaptive(plannedVsActual.actual)}
            </strong>
          </div>
          <div>
            <span>Desvio</span>
            <strong
              title={formatCurrency(plannedVsActual.actual - plannedVsActual.planned)}
            >
              {formatCurrencyAdaptive(
                plannedVsActual.actual - plannedVsActual.planned
              )}
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
            <div className="insights-empty-state insights-empty-state-compact">
              <div className="insights-empty-bars" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="insights-empty">
                {"Cadastre metas para visualizar proje\u00e7\u00f5es, prioridades e ritmo de conclus\u00e3o."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InsightsPanel;
