import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  GitCompareArrows,
  Landmark,
} from "lucide-react";
import {
  buildCycleProjection,
  buildHistoricalYearSeries,
  buildQuarterlyTrend,
  buildYearComparison,
} from "../utils/planningInsights";
import { formatCurrencyAdaptive, formatMonthProjection } from "../utils/formatters";
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
}) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const comparison = useMemo(
    () => buildYearComparison(appState, currentYear, comparisonYear),
    [appState, currentYear, comparisonYear]
  );
  const yearSeries = useMemo(() => buildHistoricalYearSeries(appState), [appState]);
  const quarterlyTrend = useMemo(() => buildQuarterlyTrend(monthlyData), [monthlyData]);
  const cycleProjection = useMemo(
    () => buildCycleProjection(goals, monthlyData),
    [goals, monthlyData]
  );

  const visibleHistory = showFullHistory
    ? yearSeries
    : yearSeries.slice(0, HISTORY_PREVIEW_LIMIT);

  const summaryHighlights = useMemo(() => {
    const topQuarter = [...quarterlyTrend].sort((leftQuarter, rightQuarter) =>
      rightQuarter.total - leftQuarter.total
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
      cycleProjection.projectedMonths === null
        ? "Ainda não existe um ritmo recorrente suficiente para estimar o fechamento do ciclo."
        : `A projeção indica ${formatMonthProjection(
            cycleProjection.projectedMonths
          ).toLowerCase()} para fechar a meta anual consolidada.`,
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
            <span>Projeção do ciclo</span>
          </div>
          <strong>{formatMonthProjection(cycleProjection.projectedMonths)}</strong>
          <p>
            {cycleProjection.projectedMonths === null
              ? "Ainda não há ritmo suficiente para projetar o fechamento do ciclo."
              : `Meta anual estimada em ${formatCurrencyAdaptive(cycleProjection.projectedTotal)}.`}
          </p>
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
                    {year.goals} metas · {year.monthsWithActivity} meses ativos
                  </span>
                </div>
                <p>{formatCurrencyAdaptive(year.total)}</p>
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
