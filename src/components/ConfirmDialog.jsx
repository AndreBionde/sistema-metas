import { AlertTriangle, ShieldAlert, Trash2 } from "lucide-react";
import "../styles/ConfirmDialog.css";

const toneIcons = {
  default: AlertTriangle,
  danger: Trash2,
  warning: ShieldAlert,
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }

  const Icon = toneIcons[tone] || AlertTriangle;

  return (
    <div className="confirm-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className={`confirm-dialog confirm-dialog-${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <span className="confirm-dialog-icon-shell">
            <Icon className="confirm-dialog-icon" aria-hidden="true" />
          </span>
          <div>
            <h3 id="confirm-dialog-title">{title}</h3>
            <p>{message}</p>
          </div>
        </div>

        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog-confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
