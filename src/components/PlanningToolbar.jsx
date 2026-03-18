import { CalendarRange, Filter, Layers3, Plus } from "lucide-react";
import "../styles/PlanningToolbar.css";

const PlanningToolbar = ({
  availableYears,
  currentYear,
  onChangeYear,
  onCreateYear,
  availableCategories,
  categoryFilter,
  onChangeCategory,
  statusFilter,
  onChangeStatus,
}) => {
  return (
    <section className="planning-toolbar">
      <div className="planning-toolbar-group">
        <label className="planning-toolbar-field">
          <span>
            <CalendarRange className="planning-toolbar-icon" aria-hidden="true" />
            Ano
          </span>
          <select value={currentYear} onChange={(event) => onChangeYear(event.target.value)}>
            {availableYears.map((yearKey) => (
              <option key={yearKey} value={yearKey}>
                {yearKey}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="planning-toolbar-button" onClick={onCreateYear}>
          <Plus className="planning-toolbar-icon" aria-hidden="true" />
          Novo ano
        </button>
      </div>

      <div className="planning-toolbar-group">
        <label className="planning-toolbar-field">
          <span>
            <Layers3 className="planning-toolbar-icon" aria-hidden="true" />
            Categoria
          </span>
          <select
            value={categoryFilter}
            onChange={(event) => onChangeCategory(event.target.value)}
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="planning-toolbar-field">
          <span>
            <Filter className="planning-toolbar-icon" aria-hidden="true" />
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(event) => onChangeStatus(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="active">Ativas</option>
            <option value="paused">Pausadas</option>
            <option value="completed">Concluídas</option>
          </select>
        </label>
      </div>
    </section>
  );
};

export default PlanningToolbar;
