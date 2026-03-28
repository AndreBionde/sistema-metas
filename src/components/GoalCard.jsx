import { ArrowDownWideNarrow, CheckCircle2, Clock, CopyPlus, Pause, Trash2 } from "lucide-react";
import { GOAL_CATEGORIES } from "../constants/defaultData";
import { getCategoryMeta } from "../utils/categoryMeta";
import { PRIORITY_LABELS } from "../utils/planningInsights";
import {
  formatCurrency,
  formatMonthProjection,
  formatPercent,
} from "../utils/formatters";
import DecimalInput from "./DecimalInput";
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
  onDuplicate,
  onUpdatePriority,
  riskLevel,
}) => {
  const isCompleted = goal.status === "completed";
  const categoryMeta = getCategoryMeta(goal.category);
  const CategoryIcon = categoryMeta.icon;

  return (
    <article
      className={`goal-card goal-card-${categoryMeta.className} ${
        isCompleted ? "goal-card-completed" : ""
      }`}
      style={{ "--goal-color": goal.color }}
    >
      <div className="goal-card-shell">
        <div className="goal-card-topline">
          <span className="goal-category-chip">
            <CategoryIcon className="goal-chip-icon" aria-hidden="true" />
            {categoryMeta.label}
          </span>
          <div className="goal-card-topline-actions">
            <span className="goal-progress-inline">
              {`${formatPercent(progress)} concluído`}
            </span>
            <button
              type="button"
              className="goal-inline-action"
              onClick={() => onDuplicate(goal.id)}
              aria-label={`Duplicar meta ${goal.name}`}
            >
              <CopyPlus className="goal-inline-icon" aria-hidden="true" />
            </button>
          </div>
        </div>

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
            <span>
              <ArrowDownWideNarrow className="goal-inline-icon" aria-hidden="true" />
              Prioridade
            </span>
            <select
              value={goal.priority || "medium"}
              onChange={(event) => onUpdatePriority(goal.id, event.target.value)}
            >
              <option value="high">{PRIORITY_LABELS.high}</option>
              <option value="medium">{PRIORITY_LABELS.medium}</option>
              <option value="low">{PRIORITY_LABELS.low}</option>
            </select>
          </label>

          <label className="goal-meta-field">
            <span>Categoria</span>
            <select
              value={goal.category}
              onChange={(event) => onUpdateCategory(goal.id, event.target.value)}
            >
              {GOAL_CATEGORIES.map((category) => {
                const optionMeta = getCategoryMeta(category);
                return (
                  <option key={category} value={category}>
                    {optionMeta.label}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="goal-meta-field">
            <span>Aporte mensal planejado</span>
            <DecimalInput
              value={goal.plannedMonthlyAmount || ""}
              onCommit={(nextValue) => onUpdatePlannedAmount(goal.id, nextValue)}
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
          <DecimalInput
            id={`target-${goal.id}`}
            value={goal.targetAmount || ""}
            onCommit={(nextValue) => onUpdateTarget(goal.id, nextValue)}
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
              <div className="progress-bar-glow" aria-hidden="true"></div>
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
          <p className="goal-projection">Projeção: {formatMonthProjection(projectedMonths)}</p>
        </div>
        <div className="goal-insight-strip">
          <span>
            Planejado/mês: <strong>{formatCurrency(goal.plannedMonthlyAmount || 0)}</strong>
          </span>
          <span className={`goal-risk goal-risk-${riskLevel || "healthy"}`}>
            {riskLevel === "critical"
              ? "Sem ritmo"
              : riskLevel === "warning"
                ? "Risco de atraso"
                : riskLevel === "watch"
                  ? "Acompanhar"
                  : "Saudável"}
          </span>
        </div>
      </div>
    </article>
  );
};

export default GoalCard;
