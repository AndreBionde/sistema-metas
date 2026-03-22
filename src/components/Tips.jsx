import "../styles/Tips.css";

const Tips = () => {
  return (
    <div className="tips-container">
      <p className="tips-title">
        <strong>{"Boas pr\u00e1ticas:"}</strong>
      </p>
      <ul className="tips-list">
        <li>Renomeie as metas para refletir objetivos reais.</li>
        <li>{"Defina uma meta de valor para acompanhar percentual de conclus\u00e3o."}</li>
        <li>{"Planeje um aporte mensal para facilitar proje\u00e7\u00f5es de conclus\u00e3o."}</li>
        <li>{"Gere relat\u00f3rios antes de compartilhar seu planejamento com outras pessoas."}</li>
        <li>{"Use observa\u00e7\u00f5es mensais para registrar contextos importantes."}</li>
        <li>Crie um novo ano ao iniciar um novo ciclo de planejamento.</li>
      </ul>
    </div>
  );
};

export default Tips;
