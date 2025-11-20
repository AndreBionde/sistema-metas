import { DollarSign, Target, TrendingUp } from "lucide-react";
import "../styles/StatsCards.css";

const StatsCards = ({ totalGeral, activeGoals, monthlyAverage }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-card-blue">
        <div className="stat-card-header">
          <DollarSign className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Total Geral</span>
        </div>
        <p
          className="stat-value"
          aria-label={`Total geral: ${totalGeral.toFixed(2)} reais`}
        >
          R$ {totalGeral.toFixed(2)}
        </p>
      </div>

      <div className="stat-card stat-card-purple">
        <div className="stat-card-header">
          <Target className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Metas Ativas</span>
        </div>
        <p className="stat-value" aria-label={`${activeGoals} metas ativas`}>
          {activeGoals}
        </p>
      </div>

      <div className="stat-card stat-card-green">
        <div className="stat-card-header">
          <TrendingUp className="stat-icon" aria-hidden="true" />
          <span className="stat-label">Média Mensal</span>
        </div>
        <p
          className="stat-value"
          aria-label={`Média mensal: ${monthlyAverage.toFixed(2)} reais`}
        >
          R$ {monthlyAverage.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
