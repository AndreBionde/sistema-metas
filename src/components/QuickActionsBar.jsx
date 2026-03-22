import { Layers3, PlusCircle, Trash2 } from "lucide-react";
import "../styles/QuickActionsBar.css";

const QuickActionsBar = ({
  canDeleteYear,
  onAddGoal,
  onDeleteYear,
  onOpenGovernance,
}) => (
  <section className="quick-actions-bar">
    <div>
      <p className="quick-actions-kicker">Ações rápidas</p>
      <h2 className="quick-actions-title">Fluxos frequentes do ciclo</h2>
      <p className="quick-actions-copy">
        Acesse ações recorrentes sem sair do painel principal.
      </p>
    </div>

    <div className="quick-actions-grid">
      <button type="button" className="quick-actions-button" onClick={onAddGoal}>
        <PlusCircle className="quick-actions-icon" aria-hidden="true" />
        <span>Criar meta</span>
        <small>Insere uma nova meta no ano atual</small>
      </button>

      <button
        type="button"
        className="quick-actions-button quick-actions-button-danger"
        onClick={onDeleteYear}
        disabled={!canDeleteYear}
      >
        <Trash2 className="quick-actions-icon" aria-hidden="true" />
        <span>Excluir ano</span>
        <small>{canDeleteYear ? "Remove o ciclo atual" : "É preciso manter 1 ano"}</small>
      </button>

      <button type="button" className="quick-actions-button" onClick={onOpenGovernance}>
        <Layers3 className="quick-actions-icon" aria-hidden="true" />
        <span>Governança</span>
        <small>Logs e lixeira</small>
      </button>
    </div>
  </section>
);

export default QuickActionsBar;
