import {
  BarChart3,
  Chrome,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import BrandMark from "./BrandMark";
import "../styles/AuthScreen.css";

const formatStatValue = (value) =>
  new Intl.NumberFormat("pt-BR", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const AuthScreen = ({
  onSignIn,
  isFirebaseConfigured,
  authError,
  isSigningIn = false,
  publicStats,
}) => {
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
      label: "Relatórios gerados",
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
            Organize suas metas, acompanhe seus aportes e visualize sua evolução.
          </h1>
          <p className="auth-description">
            Entre com sua conta Google para acessar seu painel financeiro com
            segurança, de forma simples e pronta para o dia a dia.
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
              O acesso ainda não está disponível neste momento. Revise a configuração
              da conta antes de liberar o login.
            </div>
          )}
          {authError ? (
            <div className="auth-warning auth-warning-error" role="alert">
              {authError}
            </div>
          ) : null}
        </div>

        <aside className="auth-panel" aria-label="Estatísticas públicas do PlanoMeta">
          <div className="auth-panel-card auth-panel-card-featured">
            <span className="auth-panel-label">Panorama da plataforma</span>
            <strong className="auth-panel-value">
              Acompanhe o avanço coletivo de quem já organiza metas com o PlanoMeta.
            </strong>
            <p className="auth-panel-copy">
              Números agregados da plataforma mostram como a rotina financeira vem
              ganhando tração entre os usuários.
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
              <span>Evolução</span>
              <strong>Leitura anual consolidada</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default AuthScreen;
