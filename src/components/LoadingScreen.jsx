import "../styles/LoadingScreen.css";

const LoadingScreen = ({
  title = "Preparando seu painel financeiro...",
  subtitle = "",
  actionLabel = "",
  onAction,
}) => {
  return (
    <main className="loading-screen">
      <div className="loading-card">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p className="loading-title">{title}</p>
        {subtitle ? <p className="loading-subtitle">{subtitle}</p> : null}
        {actionLabel && onAction ? (
          <button type="button" className="loading-action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </main>
  );
};

export default LoadingScreen;
