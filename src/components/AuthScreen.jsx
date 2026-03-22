import {
  BarChart3,
  Chrome,
  FileText,
  MoonStar,
  Palette,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  TrendingUp,
} from "lucide-react";
import BrandMark from "./BrandMark";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/AuthScreen.css";

const formatStatValue = (value) =>
  new Intl.NumberFormat("pt-BR", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const themeIcons = {
  light: SunMedium,
  dark: MoonStar,
};

const AuthScreen = ({
  onSignIn,
  isFirebaseConfigured,
  authError,
  isSigningIn = false,
  publicStats,
}) => {
  const { themeMode, brandTheme, setThemeMode, setBrandTheme } = useTheme();
  const ThemeIcon = themeIcons[themeMode] || SunMedium;

  const statsCards = [
    {
      icon: Target,
      label: "Metas criadas",
      value: publicStats?.goalsCreated || 0,
      tone: "teal",
    },
    {
      icon: Sparkles,
      label: "Planejamentos iniciados",
      value: publicStats?.plansStarted || 0,
      tone: "navy",
    },
    {
      icon: FileText,
      label: "Relat\u00f3rios gerados",
      value: publicStats?.reportsGenerated || 0,
      tone: "sand",
    },
    {
      icon: BarChart3,
      label: "Ciclos anuais criados",
      value: publicStats?.activeYearsCreated || 0,
      tone: "emerald",
    },
  ];

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
            {"Organize suas metas, acompanhe seus aportes e visualize sua evolu\u00e7\u00e3o."}
          </h1>
          <p className="auth-description">
            {"Entre com sua conta Google para acessar seu painel financeiro com "}
            {"seguran\u00e7a, de forma simples e pronta para o dia a dia."}
          </p>
          <div className="auth-highlights">
            <p>
              <ShieldCheck className="auth-highlight-icon" aria-hidden="true" />
              Acesso seguro
            </p>
            <p>
              <TrendingUp className="auth-highlight-icon" aria-hidden="true" />
              {"Acompanhamento cont\u00ednuo"}
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
              {"O acesso ainda n\u00e3o est\u00e1 dispon\u00edvel neste momento. Revise a configura\u00e7\u00e3o "}
              {"da conta antes de liberar o login."}
            </div>
          )}
          {authError ? (
            <div className="auth-warning auth-warning-error" role="alert">
              {authError}
            </div>
          ) : null}
        </div>

        <aside
          className="auth-panel"
          aria-label={"Estat\u00edsticas p\u00fablicas do PlanoMeta"}
        >
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
                <option value="classic">{"Cl\u00e1ssico"}</option>
                <option value="executive">Executivo</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
          </div>

          <div className="auth-panel-card auth-panel-card-featured">
            <span className="auth-panel-label">Panorama da plataforma</span>
            <strong className="auth-panel-value">
              {"Acompanhe o avan\u00e7o coletivo de quem j\u00e1 organiza metas com o PlanoMeta."}
            </strong>
            <p className="auth-panel-copy">
              {"N\u00fameros agregados da plataforma mostram como a rotina financeira vem "}
              {"ganhando tra\u00e7\u00e3o entre os usu\u00e1rios."}
            </p>
          </div>

          <div className="auth-stats-grid">
            {statsCards.map(({ icon: Icon, label, value, tone }) => (
              <article
                key={label}
                className={`auth-stat-card auth-stat-card-${tone}`}
              >
                <div className="auth-stat-top">
                  <Icon className="auth-panel-icon" aria-hidden="true" />
                  <span>{label}</span>
                </div>
                <strong className="auth-stat-value">+{formatStatValue(value)}</strong>
              </article>
            ))}
          </div>

          <div className="auth-panel-grid">
            <div className="auth-panel-metric">
              <Sparkles className="auth-panel-icon" aria-hidden="true" />
              <span>Planejamento</span>
              <strong>Metas personalizadas</strong>
            </div>
            <div className="auth-panel-metric">
              <TrendingUp className="auth-panel-icon" aria-hidden="true" />
              <span>{"Evolu\u00e7\u00e3o"}</span>
              <strong>Leitura anual consolidada</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default AuthScreen;
