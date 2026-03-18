import { MONTH_NAMES } from "../constants/defaultData";
import { formatCurrency } from "../utils/formatters";
import "../styles/MonthlyTable.css";

const MonthlyTable = ({
  goals,
  monthlyData,
  onUpdateValue,
  onUpdateObservation,
  calculateMonthTotal,
  calculateGoalTotal,
  calculateGrandTotal,
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
            Registre o realizado por mês e acompanhe observações relevantes.
          </p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="monthly-table">
          <thead>
            <tr>
              <th className="th-month" scope="col">
                Mês
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
                      <small>{goal.category}</small>
                    </div>
                  </div>
                </th>
              ))}
              <th className="th-total" scope="col">
                Total
              </th>
              <th className="th-obs" scope="col">
                Observações
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
                          title="Mês sem valores"
                          aria-label="Mês sem valores"
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
                  <td className="td-month-total">
                    {formatCurrency(calculateMonthTotal(index))}
                  </td>
                  <td className="td-observation">
                    <label htmlFor={`obs-${index}`} className="visually-hidden">
                      Observação de {MONTH_NAMES[index]}
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
                <td key={goal.id} className="td-goal-total">
                  {formatCurrency(calculateGoalTotal(goal.id))}
                </td>
              ))}
              <td className="td-grand-total">
                {formatCurrency(calculateGrandTotal())}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MonthlyTable;
