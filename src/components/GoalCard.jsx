import { Trash2, Clock, Pause, CheckCircle2 } from "lucide-react";
import "../styles/GoalCard.css";

const GoalCard = ({
  goal,
  total,
  progress,
  onRemove,
  onUpdateName,
  onUpdateStatus,
  onUpdateTarget,
}) => {
  const isCompleted = goal.status === "completed";

  const handleTargetChange = (e) => {
    const value = e.target.value;
    if (value === "" || parseFloat(value) >= 0) {
      onUpdateTarget(goal.id, value);
    }
  };

  return (
    <div
      className={`goal-card ${isCompleted ? "goal-card-completed" : ""}`}
      style={{ borderColor: goal.color }}
    >
      <div className="goal-card-header">
        <div
          className="goal-color-dot"
          style={{ backgroundColor: goal.color }}
          aria-hidden="true"
        ></div>
        <input
          id={`goal-name-${goal.id}`}
          type="text"
          value={goal.name}
          onChange={(e) => onUpdateName(goal.id, e.target.value)}
          className={`goal-name-input ${
            isCompleted ? "goal-name-completed" : ""
          }`}
          aria-label={`Nome da meta: ${goal.name}`}
        />
        <button
          onClick={() => onRemove(goal.id)}
          className="remove-goal-button"
          aria-label={`Remover meta ${goal.name}`}
          type="button"
        >
          <Trash2 className="trash-icon" aria-hidden="true" />
        </button>
      </div>

      <div className="status-buttons" role="group" aria-label="Status da meta">
        <button
          type="button"
          onClick={() => onUpdateStatus(goal.id, "active")}
          className={`status-button ${
            goal.status === "active" ? "status-active" : "status-inactive"
          }`}
          aria-pressed={goal.status === "active"}
          aria-label="Marcar meta como ativa"
        >
          <Clock className="status-icon-small" aria-hidden="true" /> Ativa
        </button>
        <button
          type="button"
          onClick={() => onUpdateStatus(goal.id, "paused")}
          className={`status-button ${
            goal.status === "paused" ? "status-paused" : "status-inactive"
          }`}
          aria-pressed={goal.status === "paused"}
          aria-label="Marcar meta como pausada"
        >
          <Pause className="status-icon-small" aria-hidden="true" /> Pausada
        </button>
        <button
          type="button"
          onClick={() => onUpdateStatus(goal.id, "completed")}
          className={`status-button ${
            goal.status === "completed" ? "status-completed" : "status-inactive"
          }`}
          aria-pressed={goal.status === "completed"}
          aria-label="Marcar meta como concluída"
        >
          <CheckCircle2 className="status-icon-small" aria-hidden="true" />{" "}
          Concluída
        </button>
      </div>

      <div className="target-amount-section">
        <label htmlFor={`target-${goal.id}`} className="target-label">
          Meta de valor (opcional):
        </label>
        <input
          id={`target-${goal.id}`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={goal.targetAmount || ""}
          onChange={handleTargetChange}
          placeholder="Ex: 5000.00"
          className="target-input"
          aria-label={`Meta de valor para ${goal.name}`}
        />
      </div>

      {goal.targetAmount > 0 && (
        <div className="progress-section">
          <div className="progress-info">
            <span>Progresso: {progress.toFixed(1)}%</span>
            <span>
              R$ {total.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
            </span>
          </div>
          <div
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Progresso da meta ${goal.name}: ${progress.toFixed(
              1
            )}%`}
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: goal.color,
              }}
            ></div>
            {progress >= 100 && (
              <div className="progress-badge progress-badge-completed">
                <span>🎉 Meta atingida!</span>
              </div>
            )}
            {progress >= 80 && progress < 100 && (
              <div className="progress-badge progress-badge-almost">
                <span>⚡ Quase lá!</span>
              </div>
            )}
          </div>
        </div>
      )}

      <p className={`goal-total ${isCompleted ? "goal-total-completed" : ""}`}>
        Acumulado: R$ {total.toFixed(2)}
      </p>
    </div>
  );
};

export default GoalCard;
