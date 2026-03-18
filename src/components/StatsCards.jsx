import { CalendarClock, DollarSign, Target, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercent } from "../utils/formatters";
import "../styles/StatsCards.css";

const StatsCards = ({
  totalGeral,
  activeGoals,
  monthlyAverage,
  filledMonths,
  completionRate,
  plannedAnnualTotal,
}) => {
  return (
    <section className="stats-grid" aria-label="Resumo das metas">
      <div className="stat-card stat-card-blue">
        <div className="stat-card-header">
          <DollarSign className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Total geral</span>
        </div>
        <p className="stat-value">{formatCurrency(totalGeral)}</p>
      </div>

      <div className="stat-card stat-card-orange">
        <div className="stat-card-header">
          <Target className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Metas ativas</span>
        </div>
        <p className="stat-value">{activeGoals}</p>
        <p className="stat-helper">Conclusão: {formatPercent(completionRate)}</p>
      </div>

      <div className="stat-card stat-card-green">
        <div className="stat-card-header">
          <TrendingUp className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Média dos meses preenchidos</span>
        </div>
        <p className="stat-value">{formatCurrency(monthlyAverage)}</p>
        <p className="stat-helper">
          Base atual: {filledMonths} {filledMonths === 1 ? "mês" : "meses"}
        </p>
      </div>

      <div className="stat-card stat-card-slate">
        <div className="stat-card-header">
          <CalendarClock className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Planejamento anual</span>
        </div>
        <p className="stat-value">{formatCurrency(plannedAnnualTotal)}</p>
        <p className="stat-helper">Soma dos aportes mensais planejados</p>
      </div>
    </section>
  );
};

export default StatsCards;
