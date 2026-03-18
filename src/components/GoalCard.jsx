import { CheckCircle2, Clock, Pause, Trash2 } from "lucide-react";
import { GOAL_CATEGORIES } from "../constants/defaultData";
import {
  formatCurrency,
  formatMonthProjection,
  formatPercent,
} from "../utils/formatters";
import "../styles/GoalCard.css";

const GoalCard = ({
  goal,
  total,
  progress,
  projectedMonths,
  onRemove,
  onUpdateName,
  onCommitName,
  onUpdateCategory,
  onUpdateStatus,
  onUpdateTarget,
  onUpdatePlannedAmount,
}) => {
  const isCompleted = goal.status === "completed";

  const handleNumericChange = (callback) => (event) => {
    const nextValue = event.target.value;

    if (nextValue === "" || parseFloat(nextValue) >= 0) {
      callback(goal.id, nextValue);
    }
  };

  return (
    <article
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
          maxLength={80}
          value={goal.name}
          onChange={(event) => onUpdateName(goal.id, event.target.value)}
          onBlur={() => onCommitName(goal.id)}
          className={`goal-name-input ${
            isCompleted ? "goal-name-completed" : ""
          }`}
          aria-label={`Nome da meta ${goal.name}`}
        />
        <button
          type="button"
          className="remove-goal-button"
          onClick={() => onRemove(goal.id)}
          aria-label={`Remover meta ${goal.name}`}
        >
          <Trash2 className="trash-icon" aria-hidden="true" />
        </button>
      </div>

      <div className="goal-meta-grid">
        <label className="goal-meta-field">
          <span>Categoria</span>
          <select
            value={goal.category}
            onChange={(event) => onUpdateCategory(goal.id, event.target.value)}
          >
            {GOAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="goal-meta-field">
          <span>Aporte mensal planejado</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={goal.plannedMonthlyAmount || ""}
            onChange={handleNumericChange(onUpdatePlannedAmount)}
            placeholder="Ex: 400"
            className="target-input"
          />
        </label>
      </div>

      <div className="status-buttons" role="group" aria-label="Status da meta">
        <button
          type="button"
          onClick={() => onUpdateStatus(goal.id, "active")}
          className={`status-button ${
            goal.status === "active" ? "status-active" : "status-inactive"
          }`}
          aria-pressed={goal.status === "active"}
        >
          <Clock className="status-icon-small" aria-hidden="true" />
          Ativa
        </button>
        <button
          type="button"
          onClick={() => onUpdateStatus(goal.id, "paused")}
          className={`status-button ${
            goal.status === "paused" ? "status-paused" : "status-inactive"
          }`}
          aria-pressed={goal.status === "paused"}
        >
          <Pause className="status-icon-small" aria-hidden="true" />
          Pausada
        </button>
        <button
          type="button"
          onClick={() => onUpdateStatus(goal.id, "completed")}
          className={`status-button ${
            goal.status === "completed" ? "status-completed" : "status-inactive"
          }`}
          aria-pressed={goal.status === "completed"}
        >
          <CheckCircle2 className="status-icon-small" aria-hidden="true" />
          Concluída
        </button>
      </div>

      <div className="target-amount-section">
        <label htmlFor={`target-${goal.id}`} className="target-label">
          Meta de valor
        </label>
        <input
          id={`target-${goal.id}`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={goal.targetAmount || ""}
          onChange={handleNumericChange(onUpdateTarget)}
          placeholder="Ex: 5000.00"
          className="target-input"
        />
      </div>

      {goal.targetAmount > 0 ? (
        <div className="progress-section">
          <div className="progress-info">
            <span>Progresso: {formatPercent(progress)}</span>
            <span>
              {formatCurrency(total)} / {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Progresso da meta ${goal.name}`}
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: goal.color,
              }}
            ></div>
            {progress >= 100 ? (
              <div className="progress-badge progress-badge-completed">
                <span>Meta atingida</span>
              </div>
            ) : null}
            {progress >= 80 && progress < 100 ? (
              <div className="progress-badge progress-badge-almost">
                <span>Quase lá</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="goal-footer">
        <p className={`goal-total ${isCompleted ? "goal-total-completed" : ""}`}>
          Acumulado: {formatCurrency(total)}
        </p>
        <p className="goal-projection">
          Projeção: {formatMonthProjection(projectedMonths)}
        </p>
      </div>
    </article>
  );
};

export default GoalCard;
