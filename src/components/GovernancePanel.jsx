import { useState } from "react";
import {
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  History,
  LifeBuoy,
  RotateCcw,
  Shield,
  Trash2,
} from "lucide-react";
import { formatDateTime } from "../utils/formatters";
import "../styles/PlanningIntelligencePanel.css";

const PREVIEW_LIMITS = {
  activity: 3,
  backup: 3,
  goals: 3,
  resets: 3,
};

const GovernancePanel = ({
  activityLog,
  backupLog,
  trash,
  onRestoreGoal,
  onRestoreReset,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    activity: false,
    backup: false,
    goals: false,
    resets: false,
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections((currentSections) => ({
      ...currentSections,
      [sectionKey]: !currentSections[sectionKey],
    }));
  };

  const visibleActivity = expandedSections.activity
    ? activityLog
    : activityLog.slice(0, PREVIEW_LIMITS.activity);
  const visibleBackup = expandedSections.backup
    ? backupLog
    : backupLog.slice(0, PREVIEW_LIMITS.backup);
  const visibleTrashGoals = expandedSections.goals
    ? trash.goals
    : trash.goals.slice(0, PREVIEW_LIMITS.goals);
  const visibleResetSnapshots = expandedSections.resets
    ? trash.resets
    : trash.resets.slice(0, PREVIEW_LIMITS.resets);

  const renderExpandButton = (sectionKey, totalItems, limit) => {
    if (totalItems <= limit) {
      return null;
    }

    const isExpanded = expandedSections[sectionKey];

    return (
      <button
        type="button"
        className="governance-expand-button"
        onClick={() => toggleSection(sectionKey)}
      >
        {isExpanded ? (
          <>
            <ChevronUp aria-hidden="true" />
            Ver menos
          </>
        ) : (
          <>
            <ChevronDown aria-hidden="true" />
            Ver mais
          </>
        )}
      </button>
    );
  };

  return (
    <section className="governance-panel" id="governance-panel">
      <div className="governance-header">
        <div>
          <p className="governance-kicker">Governança e confiança</p>
          <h2>Histórico, lixeira e rastreabilidade</h2>
        </div>
        <p className="governance-caption">
          Aqui ficam os registros do que mudou, os eventos de backup e a recuperação segura.
        </p>
      </div>

      <div className="governance-grid">
        <article className="governance-card">
          <div className="governance-card-top">
            <History className="governance-icon" aria-hidden="true" />
            <span>Histórico de alterações</span>
          </div>
          <div className="governance-list">
            {activityLog.length > 0 ? (
              visibleActivity.map((entry) => (
                <div key={entry.id} className="governance-item">
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                  <small>{formatDateTime(entry.occurredAt)}</small>
                </div>
              ))
            ) : (
              <p className="governance-empty">As próximas ações da conta aparecerão aqui.</p>
            )}
          </div>
          {renderExpandButton("activity", activityLog.length, PREVIEW_LIMITS.activity)}
        </article>

        <article className="governance-card">
          <div className="governance-card-top">
            <Shield className="governance-icon" aria-hidden="true" />
            <span>Logs de backup e restauração</span>
          </div>
          <div className="governance-list">
            {backupLog.length > 0 ? (
              visibleBackup.map((entry) => (
                <div key={entry.id} className="governance-item">
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                  <small>{formatDateTime(entry.occurredAt)}</small>
                </div>
              ))
            ) : (
              <p className="governance-empty">
                Exports, backups e restaurações ficarão registrados aqui.
              </p>
            )}
          </div>
          {renderExpandButton("backup", backupLog.length, PREVIEW_LIMITS.backup)}
        </article>

        <article className="governance-card">
          <div className="governance-card-top">
            <Trash2 className="governance-icon" aria-hidden="true" />
            <span>Lixeira de metas</span>
          </div>
          <div className="governance-list">
            {trash.goals.length > 0 ? (
              visibleTrashGoals.map((entry) => (
                <div key={entry.id} className="governance-item governance-item-action">
                  <div>
                    <strong>{entry.goal.name}</strong>
                    <p>Ano {entry.yearKey} · removida em {formatDateTime(entry.deletedAt)}</p>
                  </div>
                  <button type="button" onClick={() => onRestoreGoal(entry.id)}>
                    <ArchiveRestore className="governance-action-icon" aria-hidden="true" />
                    Restaurar
                  </button>
                </div>
              ))
            ) : (
              <p className="governance-empty">Nenhuma meta removida recentemente.</p>
            )}
          </div>
          {renderExpandButton("goals", trash.goals.length, PREVIEW_LIMITS.goals)}
        </article>

        <article className="governance-card">
          <div className="governance-card-top">
            <RotateCcw className="governance-icon" aria-hidden="true" />
            <span>Recuperação antes de reset</span>
          </div>
          <div className="governance-list">
            {trash.resets.length > 0 ? (
              visibleResetSnapshots.map((entry) => (
                <div key={entry.id} className="governance-item governance-item-action">
                  <div>
                    <strong>Snapshot de conta</strong>
                    <p>{formatDateTime(entry.deletedAt)}</p>
                  </div>
                  <button type="button" onClick={() => onRestoreReset(entry.id)}>
                    <LifeBuoy className="governance-action-icon" aria-hidden="true" />
                    Recuperar
                  </button>
                </div>
              ))
            ) : (
              <p className="governance-empty">
                Quando um reset acontecer, o snapshot ficará disponível aqui.
              </p>
            )}
          </div>
          {renderExpandButton("resets", trash.resets.length, PREVIEW_LIMITS.resets)}
        </article>
      </div>
    </section>
  );
};

export default GovernancePanel;
