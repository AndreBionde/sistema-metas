import { Chrome, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import BrandMark from "./BrandMark";
import "../styles/AuthScreen.css";

const AuthScreen = ({
  onSignIn,
  isFirebaseConfigured,
  authError,
  isSigningIn = false,
}) => {
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

        <aside className="auth-panel" aria-label="Benefícios do painel">
          <div className="auth-panel-card auth-panel-card-featured">
            <span className="auth-panel-label">Visão executiva</span>
            <strong className="auth-panel-value">
              Um painel claro para acompanhar metas, evolução e próximos passos.
            </strong>
            <p className="auth-panel-copy">
              Cadastre objetivos conforme sua realidade e acompanhe aportes ao longo
              dos meses com leitura rápida e organizada.
            </p>
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
            <div className="auth-panel-metric">
              <ShieldCheck className="auth-panel-icon" aria-hidden="true" />
              <span>Segurança</span>
              <strong>Conta individual protegida</strong>
            </div>
            <div className="auth-panel-metric">
              <Chrome className="auth-panel-icon" aria-hidden="true" />
              <span>Praticidade</span>
              <strong>Login rápido com Google</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default AuthScreen;
