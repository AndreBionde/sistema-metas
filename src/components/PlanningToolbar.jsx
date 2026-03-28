import { CalendarRange, Filter, Layers3, Plus } from "lucide-react";
import { getCategoryMeta } from "../utils/categoryMeta";
import "../styles/PlanningToolbar.css";

const PlanningToolbar = ({
  availableYears,
  currentYear,
  onChangeYear,
  creatableYears,
  pendingYear,
  onChangePendingYear,
  onCreateYear,
  availableCategories,
  categoryFilter,
  onChangeCategoryFilter,
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

        <label className="planning-toolbar-field">
          <span>
            <Plus className="planning-toolbar-icon" aria-hidden="true" />
            Adicionar ano
          </span>
          <select
            value={pendingYear}
            onChange={(event) => onChangePendingYear(event.target.value)}
            disabled={creatableYears.length === 0}
          >
            {creatableYears.length > 0 ? (
              creatableYears.map((yearKey) => (
                <option key={yearKey} value={yearKey}>
                  {yearKey}
                </option>
              ))
            ) : (
              <option value="">Sem anos disponíveis</option>
            )}
          </select>
        </label>

        <button
          type="button"
          className="planning-toolbar-button"
          onClick={onCreateYear}
          disabled={!pendingYear}
        >
          <Plus className="planning-toolbar-icon" aria-hidden="true" />
          Criar ano
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
            onChange={(event) => onChangeCategoryFilter(event.target.value)}
          >
            {availableCategories.map((category) => {
              const categoryLabel =
                category === "Todas" ? "Todas" : getCategoryMeta(category).label;

              return (
                <option key={category} value={category}>
                  {categoryLabel}
                </option>
              );
            })}
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
            <option value="completed">{"Conclu\u00eddas"}</option>
          </select>
        </label>
      </div>
    </section>
  );
};

export default PlanningToolbar;
