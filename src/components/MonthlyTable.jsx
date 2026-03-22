import { ArrowRight, CalendarDays } from "lucide-react";
import { MONTH_NAMES } from "../constants/defaultData";
import { getCategoryMeta } from "../utils/categoryMeta";
import { formatCurrency, formatCurrencyAdaptive } from "../utils/formatters";
import "../styles/MonthlyTable.css";

const MonthlyTable = ({
  goals,
  monthlyData,
  onUpdateValue,
  onUpdateObservation,
  calculateMonthTotal,
  calculateGoalTotal,
  calculateGrandTotal,
  onAddGoal,
}) => {
  const handleValueChange = (monthIndex, goalId, nextValue) => {
    if (nextValue === "" || parseFloat(nextValue) >= 0) {
      onUpdateValue(monthIndex, goalId, nextValue);
    }
  };

  return (
    <section className="monthly-table-container">
      <div className="monthly-table-header">
        <div>
          <h2 className="monthly-table-title">Planejamento mensal</h2>
          <p className="monthly-table-subtitle">
            {"Registre o realizado por m\u00eas e acompanhe observa\u00e7\u00f5es relevantes."}
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="monthly-table-empty">
          <div className="monthly-table-empty-visual" aria-hidden="true">
            <CalendarDays className="monthly-table-empty-icon" />
          </div>
          <strong>Ative a leitura mensal criando sua primeira meta</strong>
          <p>
            {"Assim que existir pelo menos um objetivo, esta grade passa a comparar "}
            {"aportes, totais e observa\u00e7\u00f5es de cada m\u00eas."}
          </p>
          <button type="button" className="monthly-table-empty-button" onClick={onAddGoal}>
            <ArrowRight className="monthly-table-empty-arrow" aria-hidden="true" />
            {"Criar meta e come\u00e7ar"}
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="monthly-table">
            <thead>
              <tr>
                <th className="th-month" scope="col">
                  {"M\u00eas"}
                </th>
                {goals.map((goal) => (
                  <th key={goal.id} className="th-goal" scope="col">
                    <div className="th-goal-content">
                      <div
                        className="th-goal-dot"
                        style={{ backgroundColor: goal.color }}
                        aria-hidden="true"
                      ></div>
                      <div>
                        <span className="th-goal-name">{goal.name}</span>
                        <small>{getCategoryMeta(goal.category).label}</small>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="th-total" scope="col">
                  Total
                </th>
                <th className="th-obs" scope="col">
                  {"Observa\u00e7\u00f5es"}
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => {
                const isEmpty = Object.values(month.values).every(
                  (value) => !value || value === 0
                );

                return (
                  <tr key={month.month} className={isEmpty ? "row-empty" : ""}>
                    <th
                      scope="row"
                      className={`td-month ${index % 2 === 0 ? "td-even" : "td-odd"}`}
                    >
                      <div className="month-cell">
                        {isEmpty ? (
                          <span
                            className="warning-icon"
                            title={"M\u00eas sem valores"}
                            aria-label={"M\u00eas sem valores"}
                          >
                            !
                          </span>
                        ) : null}
                        {MONTH_NAMES[index]}
                      </div>
                    </th>
                    {goals.map((goal) => (
                      <td key={goal.id} className="td-value">
                        <label
                          htmlFor={`value-${index}-${goal.id}`}
                          className="visually-hidden"
                        >
                          Valor de {goal.name} em {MONTH_NAMES[index]}
                        </label>
                        <input
                          id={`value-${index}-${goal.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={month.values[goal.id] ?? ""}
                          onChange={(event) =>
                            handleValueChange(index, goal.id, event.target.value)
                          }
                          placeholder="0.00"
                          className="value-input"
                        />
                      </td>
                    ))}
                    <td
                      className="td-month-total"
                      title={formatCurrency(calculateMonthTotal(index))}
                    >
                      {formatCurrencyAdaptive(calculateMonthTotal(index))}
                    </td>
                    <td className="td-observation">
                      <label htmlFor={`obs-${index}`} className="visually-hidden">
                        {"Observa\u00e7\u00e3o de"} {MONTH_NAMES[index]}
                      </label>
                      <input
                        id={`obs-${index}`}
                        type="text"
                        value={month.observation}
                        onChange={(event) =>
                          onUpdateObservation(index, event.target.value)
                        }
                        placeholder="Adicione uma nota..."
                        className="observation-input"
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="row-total">
                <th scope="row" className="td-total-label">
                  TOTAL
                </th>
                {goals.map((goal) => (
                  <td
                    key={goal.id}
                    className="td-goal-total"
                    title={formatCurrency(calculateGoalTotal(goal.id))}
                  >
                    {formatCurrencyAdaptive(calculateGoalTotal(goal.id))}
                  </td>
                ))}
                <td
                  className="td-grand-total"
                  title={formatCurrency(calculateGrandTotal())}
                >
                  {formatCurrencyAdaptive(calculateGrandTotal())}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default MonthlyTable;
