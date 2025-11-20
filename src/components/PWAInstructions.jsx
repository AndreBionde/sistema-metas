import "../styles/PWAInstructions.css";

const PWAInstructions = () => {
  return (
    <div className="pwa-container">
      <p className="pwa-title">📱 Como instalar como aplicativo no celular:</p>
      <div className="pwa-content">
        <div className="pwa-section">
          <strong>iPhone/iPad:</strong>
          <ol className="pwa-list">
            <li>1. Abra no Safari</li>
            <li>2. Toque no ícone de compartilhar (quadrado com seta)</li>
            <li>3. Role e toque em "Adicionar à Tela Inicial"</li>
            <li>4. Confirme e pronto!</li>
          </ol>
        </div>
        <div className="pwa-section">
          <strong>Android:</strong>
          <ol className="pwa-list">
            <li>1. Abra no Chrome</li>
            <li>2. Toque nos 3 pontinhos (menu)</li>
            <li>3. Toque em "Adicionar à tela inicial" ou "Instalar app"</li>
            <li>4. Confirme e pronto!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PWAInstructions;
