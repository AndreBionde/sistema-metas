import { Target, RefreshCw } from "lucide-react";
import "../styles/Header.css";

const Header = ({ onReset }) => {
  return (
    <div className="header-container">
      <div className="header-content">
        <div>
          <div className="header-title-row">
            <Target className="header-icon" aria-hidden="true" />
            <h1 className="header-title">Minhas Metas Financeiras</h1>
          </div>
          <p className="header-subtitle">
            Planeje e acompanhe suas metas ao longo de 12 meses
          </p>
          <p className="header-saved">✓ Dados salvos automaticamente</p>
        </div>
        <button
          onClick={onReset}
          className="reset-button"
          aria-label="Resetar todos os dados"
        >
          <RefreshCw className="reset-icon" aria-hidden="true" />
          <span className="reset-text">Resetar</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
