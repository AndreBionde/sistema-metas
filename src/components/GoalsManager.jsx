import { PlusCircle } from "lucide-react";
import GoalCard from "./GoalCard";
import "../styles/GoalsManager.css";

const GoalsManager = ({
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
  calculateGoalTotal,
  calculateGoalProgress,
  calculateGoalProjection,
}) => {
  return (
    <div className="goals-manager-container">
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
            />
          ))}
        </div>
      ) : (
        <div className="goals-empty-state">
          <p className="goals-empty-title">
            {hasActiveFilters
              ? "Nenhuma meta encontrada com os filtros atuais"
              : "Sua carteira de metas começa vazia"}
          </p>
          <p className="goals-empty-copy">
            {hasActiveFilters
              ? 'Ajuste os filtros ou volte para "Todas" e "Todos" para visualizar outras metas.'
              : "Adicione sua primeira meta para começar a registrar objetivos, aportes e evolução mensal."}
          </p>
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
