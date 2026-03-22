import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import "../styles/ToastViewport.css";

const toneIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

const ToastViewport = ({ toasts, onDismiss }) => (
  <div className="toast-viewport" aria-live="polite" aria-atomic="true">
    {toasts.map((toast) => {
      const Icon = toneIcons[toast.tone] || Info;

      return (
        <article key={toast.id} className={`toast-item toast-${toast.tone}`}>
          <div className="toast-copy">
            <Icon className="toast-icon" aria-hidden="true" />
            <div>
              <strong>{toast.title}</strong>
              {toast.message ? <p>{toast.message}</p> : null}
            </div>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fechar alerta"
          >
            <X className="toast-close-icon" aria-hidden="true" />
          </button>
        </article>
      );
    })}
  </div>
);

export default ToastViewport;
