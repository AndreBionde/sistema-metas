import { FilterX, LayoutGrid, PlusCircle, Sparkles } from "lucide-react";
import GoalCard from "./GoalCard";
import "../styles/GoalsManager.css";

const GoalsManager = ({
  sectionId,
  goals,
  hasActiveFilters,
  onAddGoal,
  onRemoveGoal,
  onUpdateGoalName,
  onCommitGoalName,
  onUpdateGoalCategory,
  onUpdateGoalStatus,
  onUpdateGoalTarget,
  onUpdateGoalPlannedAmount,
  onDuplicateGoal,
  onUpdateGoalPriority,
  calculateGoalTotal,
  calculateGoalProgress,
  calculateGoalProjection,
  calculateIdealContribution,
  calculateGoalRisk,
}) => {
  return (
    <div className="goals-manager-container" id={sectionId}>
      <div className="goals-manager-header">
        <div>
          <h2 className="goals-manager-title">Gerenciar metas</h2>
          <p className="goals-manager-subtitle">
            Organize categorias, aportes planejados e status por objetivo.
          </p>
        </div>
        <button onClick={onAddGoal} className="add-goal-button" type="button">
          <PlusCircle className="add-icon" />
          <span className="add-text">Adicionar</span>
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              total={calculateGoalTotal(goal.id)}
              progress={calculateGoalProgress(goal.id)}
              projectedMonths={calculateGoalProjection(goal.id)}
              onRemove={onRemoveGoal}
              onUpdateName={onUpdateGoalName}
              onCommitName={onCommitGoalName}
              onUpdateCategory={onUpdateGoalCategory}
              onUpdateStatus={onUpdateGoalStatus}
              onUpdateTarget={onUpdateGoalTarget}
              onUpdatePlannedAmount={onUpdateGoalPlannedAmount}
              onDuplicate={onDuplicateGoal}
              onUpdatePriority={onUpdateGoalPriority}
              idealContribution={calculateIdealContribution(goal.id)}
              riskLevel={calculateGoalRisk(goal.id)}
            />
          ))}
        </div>
      ) : (
        <div className="goals-empty-state">
          <div className="goals-empty-visual" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="goals-empty-title">
            {hasActiveFilters
              ? "Nenhuma meta encontrada com os filtros atuais"
              : "Sua carteira de metas ainda est\u00e1 em branco"}
          </p>
          <p className="goals-empty-copy">
            {hasActiveFilters
              ? 'Ajuste os filtros ou volte para "Todas" e "Todos" para explorar outras metas.'
              : "Crie objetivos por categoria, distribua aportes mensais e deixe o painel construir a evolu\u00e7\u00e3o do seu ano."}
          </p>
          <div className="goals-empty-highlights">
            <span>
              {hasActiveFilters ? (
                <FilterX className="goals-empty-icon" aria-hidden="true" />
              ) : (
                <LayoutGrid className="goals-empty-icon" aria-hidden="true" />
              )}
              {hasActiveFilters ? "Filtros ativos" : "Categorias visuais"}
            </span>
            <span>
              <Sparkles className="goals-empty-icon" aria-hidden="true" />
              {"Proje\u00e7\u00f5es autom\u00e1ticas"}
            </span>
          </div>
          {!hasActiveFilters ? (
            <button onClick={onAddGoal} className="add-goal-button" type="button">
              <PlusCircle className="add-icon" />
              <span>Criar primeira meta</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GoalsManager;
