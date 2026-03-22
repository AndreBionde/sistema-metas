import {
  Cloud,
  LogOut,
  MoonStar,
  Palette,
  ShieldCheck,
  SunMedium,
  UserCircle2,
} from "lucide-react";
import BrandMark from "./BrandMark";
import { useTheme } from "../contexts/ThemeContext";
import { formatDateTime } from "../utils/formatters";
import "../styles/Header.css";

const themeIcons = {
  light: SunMedium,
  dark: MoonStar,
};

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
  const { themeMode, brandTheme, setThemeMode, setBrandTheme } = useTheme();
  const ThemeIcon = themeIcons[themeMode] || SunMedium;

  const statusCopy =
    saveStatus === "saving"
      ? "Salvando na nuvem..."
      : "\u00daltima atualiza\u00e7\u00e3o:";

  const syncCopy = {
    syncing: "Sincronizando",
    synced: `Nuvem em dia: ${formatDateTime(lastSyncedAt)}`,
    error: "Falha na sincroniza\u00e7\u00e3o",
    idle: "Aguardando sincroniza\u00e7\u00e3o",
    disabled: "Nuvem indispon\u00edvel",
  };

  const brandThemeLabel =
    {
      classic: "Cl\u00e1ssico",
      executive: "Executivo",
      minimal: "Minimal",
    }[brandTheme] || "Cl\u00e1ssico";

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-copy">
          <div className="header-title-row">
            <BrandMark className="header-brand-mark" />
            <div>
              <h1 className="header-title">PlanoMeta</h1>
              <p className="header-kicker">
                {"Seu painel financeiro com temas din\u00e2micos"}
              </p>
            </div>
          </div>
          <p className="header-subtitle">
            {"Organize metas com clareza, acompanhe aportes ao longo do ano e mantenha "}
            {"sua conta sincronizada com seguran\u00e7a."}
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
          <div className="header-feature-grid">
            <div className="header-feature-card">
              <span>Conta</span>
              <strong>{user ? "Protegida" : "Pendente"}</strong>
            </div>
            <div className="header-feature-card">
              <span>{"Sincroniza\u00e7\u00e3o"}</span>
              <strong>{syncStatus === "synced" ? "Est\u00e1vel" : "Monitorada"}</strong>
            </div>
            <div className="header-feature-card">
              <span>Tema ativo</span>
              <strong>{brandThemeLabel}</strong>
            </div>
          </div>
        </div>

        <div className="header-side">
          <div className="header-theme-card">
            <div className="header-theme-field">
              <span className="header-theme-label">
                <ThemeIcon className="header-theme-icon" aria-hidden="true" />
                Modo
              </span>
              <select
                value={themeMode}
                onChange={(event) => setThemeMode(event.target.value)}
                aria-label="Modo de tema"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>

            <div className="header-theme-field">
              <span className="header-theme-label">
                <Palette className="header-theme-icon" aria-hidden="true" />
                Estilo
              </span>
              <select
                value={brandTheme}
                onChange={(event) => setBrandTheme(event.target.value)}
                aria-label="Estilo visual"
              >
                <option value="classic">{"Cl\u00e1ssico"}</option>
                <option value="executive">Executivo</option>
                <option value="minimal">Minimal</option>
              </select>
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
                  {user?.email || "Autentica\u00e7\u00e3o necess\u00e1ria"}
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
      </div>
    </header>
  );
};

export default Header;
