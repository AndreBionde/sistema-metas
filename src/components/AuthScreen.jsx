import {
  Chrome,
  MoonStar,
  Palette,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TrendingUp,
} from "lucide-react";
import BrandMark from "./BrandMark";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/AuthScreen.css";

const themeIcons = {
  light: SunMedium,
  dark: MoonStar,
};

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Conta protegida",
    copy: "Login com Google e sincronização automática da sua conta.",
  },
  {
    icon: TrendingUp,
    title: "Leitura anual clara",
    copy: "Metas, evolução e projeções em um painel único.",
  },
];

const AuthScreen = ({
  onSignIn,
  isFirebaseConfigured,
  authError,
  isSigningIn = false,
}) => {
  const { themeMode, brandTheme, setThemeMode, setBrandTheme } = useTheme();
  const ThemeIcon = themeIcons[themeMode] || SunMedium;

  return (
    <main className="auth-screen">
      <section className="auth-hero">
        <div className="auth-copy">
          <div className="auth-brand-row">
            <BrandMark className="auth-brand-mark" />
            <div>
              <p className="auth-brand-name">PlanoMeta</p>
              <p className="auth-kicker">Planejamento financeiro pessoal</p>
            </div>
          </div>

          <h1 className="auth-title">
            {"Organize metas e acompanhe seu ano financeiro com clareza."}
          </h1>
          <p className="auth-description">
            {"Entre com sua conta Google para acessar um painel enxuto, sincronizado e pronto "}
            {"para acompanhar o ano financeiro sem complicação."}
          </p>
          <div className="auth-highlights">
            <p>
              <ShieldCheck className="auth-highlight-icon" aria-hidden="true" />
              Acesso seguro
            </p>
            <p>
              <TrendingUp className="auth-highlight-icon" aria-hidden="true" />
              Acompanhamento contínuo
            </p>
          </div>
          {isFirebaseConfigured ? (
            <button
              type="button"
              className="auth-button"
              onClick={onSignIn}
              disabled={isSigningIn}
            >
              <Chrome className="auth-button-icon" aria-hidden="true" />
              {isSigningIn ? "Abrindo Google..." : "Entrar com Google"}
            </button>
          ) : (
            <div className="auth-warning">
              {"O acesso ainda não está disponível neste momento. Revise a configuração "}
              {"da conta antes de liberar o login."}
            </div>
          )}
          {authError ? (
            <div className="auth-warning auth-warning-error" role="alert">
              {authError}
            </div>
          ) : null}
        </div>

        <aside className="auth-panel" aria-label="Painel de entrada do PlanoMeta">
          <div className="auth-theme-row">
            <label className="auth-theme-field">
              <span>
                <ThemeIcon className="auth-panel-icon" aria-hidden="true" />
                Modo
              </span>
              <select
                value={themeMode}
                onChange={(event) => setThemeMode(event.target.value)}
                aria-label="Modo visual"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </label>

            <label className="auth-theme-field">
              <span>
                <Palette className="auth-panel-icon" aria-hidden="true" />
                Estilo
              </span>
              <select
                value={brandTheme}
                onChange={(event) => setBrandTheme(event.target.value)}
                aria-label="Estilo visual"
              >
                <option value="classic">Clássico</option>
                <option value="executive">Executivo</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
          </div>

          <div className="auth-panel-card auth-panel-card-featured">
            <span className="auth-panel-label">Painel organizado</span>
            <strong className="auth-panel-value">
              Seu planejamento entra direto no que importa: metas, evolução, projeções e backup.
            </strong>
            <p className="auth-panel-copy">
              {"Sem telemetria externa e sem contadores públicos: apenas a rotina financeira "}
              {"da sua conta, sincronizada com clareza."}
            </p>
          </div>

          <div className="auth-panel-grid auth-panel-grid-compact">
            {featureCards.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="auth-panel-metric">
                <Icon className="auth-panel-icon" aria-hidden="true" />
                <span>{title}</span>
                <strong>{copy}</strong>
              </article>
            ))}
          </div>

          <div className="auth-panel-metric auth-panel-metric-summary">
            <Sparkles className="auth-panel-icon" aria-hidden="true" />
            <span>Planejamento</span>
            <strong>Metas personalizadas por categoria, prioridade e ano.</strong>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default AuthScreen;
