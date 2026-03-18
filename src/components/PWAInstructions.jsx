import "../styles/PWAInstructions.css";

const PWAInstructions = ({
  canInstall,
  installStatus,
  onInstall,
  pwaEnabled,
}) => {
  return (
    <section className="pwa-container">
      <p className="pwa-title">Uso como aplicativo</p>

      {!pwaEnabled ? (
        <p className="pwa-status">
          O modo aplicativo está desativado nesta configuração do sistema.
        </p>
      ) : null}

      {pwaEnabled && installStatus === "installed" ? (
        <p className="pwa-status pwa-status-success">
          Aplicativo instalado neste dispositivo.
        </p>
      ) : null}

      {pwaEnabled && canInstall ? (
        <button type="button" className="pwa-install-button" onClick={onInstall}>
          Instalar aplicativo
        </button>
      ) : null}

      <div className="pwa-content">
        <div className="pwa-section">
          <strong>iPhone/iPad</strong>
          <ol className="pwa-list">
            <li>Abra o sistema no Safari.</li>
            <li>Toque no ícone de compartilhar.</li>
            <li>Selecione "Adicionar à Tela Inicial".</li>
          </ol>
        </div>
        <div className="pwa-section">
          <strong>Android</strong>
          <ol className="pwa-list">
            <li>Abra o sistema no Chrome.</li>
            <li>Use o menu do navegador.</li>
            <li>Selecione "Instalar app" ou "Adicionar à tela inicial".</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default PWAInstructions;
