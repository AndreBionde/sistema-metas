import { CheckCircle2, Download, Sparkles } from "lucide-react";
import "../styles/OnboardingPanel.css";

const OnboardingPanel = ({ onDismiss }) => {
  return (
    <section className="onboarding-panel">
      <div>
        <p className="onboarding-kicker">
          <Sparkles className="onboarding-icon" aria-hidden="true" />
          {"Come\u00e7o r\u00e1pido"}
        </p>
        <h2 className="onboarding-title">Monte sua rotina financeira em 3 passos</h2>
      </div>

      <div className="onboarding-steps">
        <p>
          <CheckCircle2 className="onboarding-step-icon" aria-hidden="true" />
          Crie metas com categoria, valor alvo e aporte mensal planejado.
        </p>
        <p>
          <CheckCircle2 className="onboarding-step-icon" aria-hidden="true" />
          {"Atualize os meses realizados para acompanhar progresso e proje\u00e7\u00f5es."}
        </p>
        <p>
          <Download className="onboarding-step-icon" aria-hidden="true" />
          {"Gere relat\u00f3rios em PDF, CSV ou XLSX sempre que quiser um resumo detalhado."}
        </p>
      </div>

      <button type="button" className="onboarding-button" onClick={onDismiss}>
        Entendi
      </button>
    </section>
  );
};

export default OnboardingPanel;
