import { PlusCircle } from "lucide-react";
import GoalCard from "./GoalCard";
import "../styles/GoalsManager.css";

const GoalsManager = ({
  goals,
  onAddGoal,
  onRemoveGoal,
  onUpdateGoalName,
  onUpdateGoalStatus,
  onUpdateGoalTarget,
  calculateGoalTotal,
  calculateGoalProgress,
}) => {
  return (
    <div className="goals-manager-container">
      <div className="goals-manager-header">
        <h2 className="goals-manager-title">Gerenciar Metas</h2>
        <button onClick={onAddGoal} className="add-goal-button">
          <PlusCircle className="add-icon" />
          <span className="add-text">Adicionar</span>
        </button>
      </div>

      <div className="goals-grid">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            total={calculateGoalTotal(goal.id)}
            progress={calculateGoalProgress(goal.id)}
            onRemove={onRemoveGoal}
            onUpdateName={onUpdateGoalName}
            onUpdateStatus={onUpdateGoalStatus}
            onUpdateTarget={onUpdateGoalTarget}
          />
        ))}
      </div>
    </div>
  );
};

export default GoalsManager;
