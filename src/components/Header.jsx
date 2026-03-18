import { Cloud, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import BrandMark from "./BrandMark";
import { formatDateTime } from "../utils/formatters";
import "../styles/Header.css";

const Header = ({
  lastSavedAt,
  saveError,
  saveStatus,
  user,
  onSignOut,
  syncStatus,
  lastSyncedAt,
  isCloudEnabled,
}) => {
  const statusCopy =
    saveStatus === "saving" ? "Salvando na nuvem..." : "Última atualização:";
  const syncCopy = {
    syncing: "Sincronizando",
    synced: `Nuvem em dia: ${formatDateTime(lastSyncedAt)}`,
    error: "Falha na sincronização",
    idle: "Aguardando sincronização",
    disabled: "Nuvem indisponível",
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-copy">
          <div className="header-title-row">
            <BrandMark className="header-brand-mark" />
            <h1 className="header-title">PlanoMeta</h1>
          </div>
          <p className="header-subtitle">
            Organize metas com clareza, acompanhe aportes ao longo do ano e mantenha
            sua conta sincronizada com segurança.
          </p>
          <div className="header-status-row">
            <p
              className={`header-saved ${
                saveStatus === "saving" ? "header-saved-pending" : ""
              }`}
            >
              <ShieldCheck className="header-status-icon" aria-hidden="true" />
              {statusCopy} {formatDateTime(lastSavedAt)}
            </p>
            <p className="header-sync">
              <Cloud className="header-status-icon" aria-hidden="true" />
              {isCloudEnabled ? syncCopy[syncStatus] || syncCopy.idle : syncCopy.disabled}
            </p>
            {saveError ? (
              <p className="header-error" role="alert">
                {saveError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="header-account">
          <div className="header-account-card">
            <UserCircle2 className="header-account-icon" aria-hidden="true" />
            <div>
              <p className="header-account-name">
                {user?.displayName || "Conta Google"}
              </p>
              <p className="header-account-email">
                {user?.email || "Autenticação necessária"}
              </p>
            </div>
          </div>
          {user ? (
            <button type="button" className="header-signout" onClick={onSignOut}>
              <LogOut className="header-status-icon" aria-hidden="true" />
              Sair
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
