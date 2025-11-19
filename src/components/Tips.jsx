import "../styles/Tips.css";

const Tips = () => {
  return (
    <div className="tips-container">
      <p className="tips-title">
        💡 <strong>Dicas:</strong>
      </p>
      <ul className="tips-list">
        <li>• Clique nos nomes das metas para editá-los</li>
        <li>• Defina uma meta de valor para ver o progresso em porcentagem</li>
        <li>
          • Use os status para organizar suas metas (Ativa, Pausada, Concluída)
        </li>
        <li>• Seus dados são salvos automaticamente no navegador</li>
        <li>• Meses vazios aparecem com ⚠️ amarelo</li>
        <li>• Metas concluídas ficam com visual diferenciado</li>
      </ul>
    </div>
  );
};

export default Tips;
