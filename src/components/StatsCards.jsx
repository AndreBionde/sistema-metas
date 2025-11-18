import React from "react";
import { DollarSign, Target, TrendingUp } from "lucide-react";
import "../styles/StatsCards.css";

const StatsCards = ({ totalGeral, activeGoals, monthlyAverage }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-card-blue">
        <div className="stat-card-header">
          <DollarSign className="stat-icon" />
          <span className="stat-label">Total Geral</span>
        </div>
        <p className="stat-value">R$ {totalGeral.toFixed(2)}</p>
      </div>
      <div className="stat-card stat-card-purple">
        <div className="stat-card-header">
          <Target className="stat-icon" />
          <span className="stat-label">Metas Ativas</span>
        </div>
        <p className="stat-value">{activeGoals}</p>
      </div>

      <div className="stat-card stat-card-green">
        <div className="stat-card-header">
          <TrendingUp className="stat-icon" />
          <span className="stat-label">Média Mensal</span>
        </div>
        <p className="stat-value">R$ {monthlyAverage.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default StatsCards;
