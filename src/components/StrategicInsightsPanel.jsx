import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  GitCompareArrows,
  Landmark,
  Trash2,
} from "lucide-react";
import {
  buildCycleProjection,
  buildHistoricalYearSeries,
  buildQuarterlyTrend,
  buildYearComparison,
} from "../utils/planningInsights";
import { formatCurrency, formatCurrencyAdaptive } from "../utils/formatters";
import "../styles/StrategicInsightsPanel.css";

const HISTORY_PREVIEW_LIMIT = 3;
const SUMMARY_PREVIEW_LIMIT = 3;

const StrategicInsightsPanel = ({
  appState,
  currentYear,
  goals,
  monthlyData,
  comparisonYear,
  comparisonOptions,
  onChangeComparisonYear,
  canDeleteYear = false,
  onDeleteYear,
}) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const comparison = useMemo(
    () => buildYearComparison(appState, currentYear, comparisonYear),
    [appState, currentYear, comparisonYear]
  );
  const yearSeries = useMemo(() => buildHistoricalYearSeries(appState), [appState]);
  const quarterlyTrend = useMemo(
    () => buildQuarterlyTrend(monthlyData, currentYear),
    [monthlyData, currentYear]
  );
  const cycleProjection = useMemo(
    () => buildCycleProjection(goals, monthlyData, currentYear),
    [goals, monthlyData, currentYear]
  );
  const projectedSupplement = Math.max(
    cycleProjection.projectedTotal - cycleProjection.actualTotal,
    0
  );

  const visibleHistory = showFullHistory
    ? yearSeries
    : yearSeries.slice(0, HISTORY_PREVIEW_LIMIT);

  const summaryHighlights = useMemo(() => {
    const topQuarter = [...quarterlyTrend].sort(
      (leftQuarter, rightQuarter) => rightQuarter.total - leftQuarter.total
    )[0];

    const currentYearSeries =
      yearSeries.find((year) => year.yearKey === String(currentYear)) || null;

    return [
      comparison.previousYear
        ? `Contra ${comparison.previousYear}, o ciclo atual acumula ${formatCurrencyAdaptive(
            comparison.delta
          )} de diferença líquida.`
        : "Assim que outro ano for selecionado, a comparação executiva fica disponível.",
      topQuarter
        ? `${topQuarter.label} concentra ${formatCurrencyAdaptive(
            topQuarter.total
          )} e sinaliza o trimestre mais forte do momento.`
        : "Os aportes trimestrais aparecerão aqui conforme o ciclo ganhar histórico.",
      cycleProjection.source === "none"
        ? "Defina aportes planejados nas metas para estimar o fechamento anual."
        : cycleProjection.gapToTarget === null
          ? `No ritmo atual, o ciclo pode encerrar em ${formatCurrencyAdaptive(
              cycleProjection.projectedTotal
            )}.`
          : cycleProjection.gapToTarget <= 0
            ? `A projeção indica fechamento acima da meta anual em ${formatCurrencyAdaptive(
                Math.abs(cycleProjection.gapToTarget)
              )}.`
            : `A projeção até dezembro estima ${formatCurrencyAdaptive(
                cycleProjection.projectedTotal
              )}, com diferença de ${formatCurrencyAdaptive(
                cycleProjection.gapToTarget
              )} para o planejado anual.`,
      currentYearSeries
        ? `${currentYearSeries.goals} metas e ${currentYearSeries.monthsWithActivity} meses ativos compõem a visão histórica do ano atual.`
        : "Os dados anuais do ciclo atual aparecem aqui conforme as metas são preenchidas.",
    ];
  }, [comparison, quarterlyTrend, yearSeries, currentYear, cycleProjection]);

  const visibleSummary = showFullSummary
    ? summaryHighlights
    : summaryHighlights.slice(0, SUMMARY_PREVIEW_LIMIT);

  return (
    <section className="strategic-panel">
      <div className="strategic-panel-header">
        <div>
          <p className="strategic-panel-kicker">Visões estratégicas</p>
          <h2>Análise executiva do portfólio</h2>
        </div>
        <p className="strategic-panel-caption">
          Compare anos, entenda o ritmo por trimestre e acompanhe a projeção do ciclo.
        </p>
      </div>

      <div className="strategic-panel-grid">
        <article className="strategic-card">
          <div className="strategic-card-top">
            <GitCompareArrows className="strategic-card-icon" aria-hidden="true" />
            <span>Comparação entre anos</span>
          </div>

          {comparisonOptions.length > 0 ? (
            <label className="strategic-card-select">
              <span>Ano de referência</span>
              <select
                value={comparisonYear}
                onChange={(event) => onChangeComparisonYear(event.target.value)}
              >
                {comparisonOptions.map((yearKey) => (
                  <option key={yearKey} value={yearKey}>
                    {yearKey}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <strong>
            {comparison.previousYear
              ? `${comparison.previousYear} → ${currentYear}`
              : "Primeiro ciclo"}
          </strong>
          <p>
            {comparison.previousYear
              ? `Diferença consolidada: ${formatCurrencyAdaptive(comparison.delta)}`
              : "Crie outro ano para liberar a leitura comparativa do ciclo."}
          </p>
          {comparison.previousYear ? (
            <div className="strategic-inline-metrics">
              <span>{formatCurrencyAdaptive(comparison.previousTotal)}</span>
              <span>{formatCurrencyAdaptive(comparison.currentTotal)}</span>
            </div>
          ) : null}
        </article>

        <article className="strategic-card">
          <div className="strategic-card-top">
            <BarChart3 className="strategic-card-icon" aria-hidden="true" />
            <span>Tendência trimestral</span>
          </div>
          <div className="strategic-quarter-grid">
            {quarterlyTrend.map((quarter) => (
              <div key={quarter.label} className="strategic-quarter-card">
                <strong>{quarter.label}</strong>
                <span>{quarter.months}</span>
                <p>{formatCurrencyAdaptive(quarter.total)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="strategic-card">
          <div className="strategic-card-top">
            <CalendarClock className="strategic-card-icon" aria-hidden="true" />
            <span>Projeção até dezembro</span>
          </div>
          <strong>{formatCurrencyAdaptive(cycleProjection.projectedTotal)}</strong>
          <p>
            {cycleProjection.source === "planned"
              ? cycleProjection.monthsProjectedFromPlan > 0
                ? `Considera os lançamentos já registrados e usa o planejado em ${cycleProjection.monthsProjectedFromPlan} ${cycleProjection.monthsProjectedFromPlan === 1 ? "mês futuro ainda vazio" : "meses futuros ainda vazios"}.`
                : "Todos os meses futuros já têm lançamento registrado ou o ciclo já foi encerrado."
              : cycleProjection.source === "average"
                ? cycleProjection.monthsProjectedFromPlan > 0
                  ? `Estimativa baseada no ritmo já realizado, aplicada em ${cycleProjection.monthsProjectedFromPlan} ${cycleProjection.monthsProjectedFromPlan === 1 ? "mês futuro ainda vazio" : "meses futuros ainda vazios"}.`
                  : "Não há meses futuros vazios para complementar com estimativa."
                : "Defina aportes planejados nas metas para projetar o fechamento anual."}
          </p>
          {cycleProjection.source !== "none" ? (
            <p className="strategic-projection-formula">
              {`Cálculo: ${formatCurrency(cycleProjection.actualTotal)} já lançados + ${formatCurrency(projectedSupplement)} projetados = ${formatCurrency(cycleProjection.projectedTotal)}.`}
            </p>
          ) : null}
          {cycleProjection.annualTarget !== null ? (
            <div className="strategic-projection-metrics">
              <div className="strategic-projection-metric">
                <small>Planejado anual</small>
                <strong>{formatCurrencyAdaptive(cycleProjection.annualTarget)}</strong>
              </div>
              <div className="strategic-projection-metric">
                <small>Já lançado</small>
                <strong>{formatCurrencyAdaptive(cycleProjection.actualTotal)}</strong>
              </div>
              <div className="strategic-projection-metric">
                <small>Estimado nos meses vazios</small>
                <strong>{formatCurrencyAdaptive(projectedSupplement)}</strong>
              </div>
              <div className="strategic-projection-metric">
                <small>Diferença para o planejado</small>
                <strong>{formatCurrencyAdaptive(cycleProjection.gapToTarget)}</strong>
              </div>
            </div>
          ) : null}
        </article>

        <article className="strategic-card strategic-card-history">
          <div className="strategic-card-top">
            <Landmark className="strategic-card-icon" aria-hidden="true" />
            <span>Painel de evolução histórica</span>
          </div>
          <div className="strategic-history-list">
            {visibleHistory.map((year) => (
              <div key={year.yearKey} className="strategic-history-item">
                <div>
                  <strong>{year.yearKey}</strong>
                  <span>
                    {year.goals} metas {"·"} {year.monthsWithActivity} meses ativos
                  </span>
                </div>
                <div className="strategic-history-actions">
                  <p>{formatCurrencyAdaptive(year.total)}</p>
                  {canDeleteYear ? (
                    <button
                      type="button"
                      className="strategic-history-delete"
                      onClick={() => onDeleteYear?.(year.yearKey)}
                      aria-label={`Excluir ano ${year.yearKey}`}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {yearSeries.length > HISTORY_PREVIEW_LIMIT ? (
            <button
              type="button"
              className="strategic-expand-button"
              onClick={() => setShowFullHistory((currentValue) => !currentValue)}
            >
              {showFullHistory ? (
                <>
                  <ChevronUp aria-hidden="true" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown aria-hidden="true" />
                  Ver mais
                </>
              )}
            </button>
          ) : null}
        </article>

        <article className="strategic-card strategic-card-summary">
          <div className="strategic-card-top">
            <Activity className="strategic-card-icon" aria-hidden="true" />
            <span>Resumo comparativo</span>
          </div>
          <div className="strategic-summary-list">
            {visibleSummary.map((summaryLine) => (
              <p key={summaryLine}>{summaryLine}</p>
            ))}
          </div>
          {summaryHighlights.length > SUMMARY_PREVIEW_LIMIT ? (
            <button
              type="button"
              className="strategic-expand-button"
              onClick={() => setShowFullSummary((currentValue) => !currentValue)}
            >
              {showFullSummary ? (
                <>
                  <ChevronUp aria-hidden="true" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown aria-hidden="true" />
                  Ver mais
                </>
              )}
            </button>
          ) : null}
        </article>
      </div>
    </section>
  );
};

export default StrategicInsightsPanel;
