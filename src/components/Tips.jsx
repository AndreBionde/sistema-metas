import "../styles/Tips.css";

const Tips = () => {
  return (
    <div className="tips-container">
      <p className="tips-title">
        <strong>Boas práticas:</strong>
      </p>
      <ul className="tips-list">
        <li>Renomeie as metas para refletir objetivos reais.</li>
        <li>Defina uma meta de valor para acompanhar percentual de conclusão.</li>
        <li>Planeje um aporte mensal para facilitar projeções de conclusão.</li>
        <li>Gere relatórios antes de compartilhar seu planejamento com outras pessoas.</li>
        <li>Use observações mensais para registrar contextos importantes.</li>
        <li>Crie um novo ano ao iniciar um novo ciclo de planejamento.</li>
      </ul>
    </div>
  );
};

export default Tips;
