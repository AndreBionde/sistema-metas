import React from "react";
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

  return (
    <div
      className={`goal-card ${isCompleted ? "goal-card-completed" : ""}`}
      style={{ borderColor: goal.color }}
    >
      <div className="goal-card-header">
        <div
          className="goal-color-dot"
          style={{ backgroundColor: goal.color }}
        ></div>
        <input
          type="text"
          value={goal.name}
          onChange={(e) => onUpdateName(goal.id, e.target.value)}
          className={`goal-name-input ${
            isCompleted ? "goal-name-completed" : ""
          }`}
        />
        <button
          onClick={() => onRemove(goal.id)}
          className="remove-goal-button"
        >
          <Trash2 className="trash-icon" />
        </button>
      </div>

      <div className="status-buttons">
        <button
          onClick={() => onUpdateStatus(goal.id, "active")}
          className={`status-button ${
            goal.status === "active" ? "status-active" : "status-inactive"
          }`}
        >
          <Clock className="status-icon-small" /> Ativa
        </button>
        <button
          onClick={() => onUpdateStatus(goal.id, "paused")}
          className={`status-button ${
            goal.status === "paused" ? "status-paused" : "status-inactive"
          }`}
        >
          <Pause className="status-icon-small" /> Pausada
        </button>
        <button
          onClick={() => onUpdateStatus(goal.id, "completed")}
          className={`status-button ${
            goal.status === "completed" ? "status-completed" : "status-inactive"
          }`}
        >
          <CheckCircle2 className="status-icon-small" /> Concluída
        </button>
      </div>

      <div className="target-amount-section">
        <label className="target-label">Meta de valor (opcional):</label>
        <input
          type="number"
          value={goal.targetAmount || ""}
          onChange={(e) => onUpdateTarget(goal.id, e.target.value)}
          placeholder="Ex: 5000.00"
          className="target-input"
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
          <div className="progress-bar-container">
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
