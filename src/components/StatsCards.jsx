import { CalendarClock, DollarSign, Target, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  formatCurrencyAdaptive,
  formatPercent,
} from "../utils/formatters";
import "../styles/StatsCards.css";

const StatsCards = ({
  totalGeral,
  activeGoals,
  monthlyAverage,
  filledMonths,
  completionRate,
  plannedAnnualTotal,
}) => {
  const cards = [
    {
      icon: DollarSign,
      label: "Total geral",
      value: formatCurrencyAdaptive(totalGeral),
      fullValue: formatCurrency(totalGeral),
      helper: "Acumulado em todas as metas",
      accent: "blue",
    },
    {
      icon: Target,
      label: "Metas ativas",
      value: String(activeGoals),
      fullValue: String(activeGoals),
      helper: `Conclus\u00e3o: ${formatPercent(completionRate)}`,
      accent: "orange",
    },
    {
      icon: TrendingUp,
      label: "Ritmo mensal",
      value: formatCurrencyAdaptive(monthlyAverage),
      fullValue: formatCurrency(monthlyAverage),
      helper: `Base atual: ${filledMonths} ${filledMonths === 1 ? "m\u00eas" : "meses"}`,
      accent: "green",
    },
    {
      icon: CalendarClock,
      label: "Planejamento anual",
      value: formatCurrencyAdaptive(plannedAnnualTotal),
      fullValue: formatCurrency(plannedAnnualTotal),
      helper: "Soma dos aportes planejados",
      accent: "slate",
    },
  ];

  return (
    <section className="stats-grid" aria-label="Resumo das metas">
      {cards.map(({ icon: Icon, label, value, fullValue, helper, accent }) => (
        <article key={label} className={`stat-card stat-card-${accent}`}>
          <div className="stat-card-orbit" aria-hidden="true"></div>
          <div className="stat-card-header">
            <div className="stat-icon-wrapper">
              <Icon className="stat-icon" aria-hidden="true" />
            </div>
            <div>
              <span className="stat-label">{label}</span>
              <p className="stat-helper">{helper}</p>
            </div>
          </div>
          <div className="stat-card-footer">
            <p className="stat-value" title={fullValue}>
              {value}
            </p>
            <span className="stat-chip">Painel vivo</span>
          </div>
        </article>
      ))}
    </section>
  );
};

export default StatsCards;
