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
  const monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const handleValueChange = (monthIndex, goalId, value) => {
    if (value === "" || parseFloat(value) >= 0) {
      onUpdateValue(monthIndex, goalId, value);
    }
  };

  return (
    <div className="monthly-table-container">
      <div className="monthly-table-header">
        <h2 className="monthly-table-title">Planejamento Mensal</h2>
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
                    <span className="th-goal-name">{goal.name}</span>
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
            {monthlyData.map((month, idx) => {
              const isEmpty = Object.values(month.values).every(
                (v) => !v || v === 0
              );

              return (
                <tr
                  key={month.month}
                  className={`${isEmpty ? "row-empty" : ""}`}
                >
                  <th
                    scope="row"
                    className={`td-month ${
                      idx % 2 === 0 ? "td-even" : "td-odd"
                    }`}
                  >
                    <div className="month-cell">
                      {isEmpty && (
                        <span
                          className="warning-icon"
                          title="Mês sem valores"
                          aria-label="Aviso: Mês sem valores"
                        >
                          ⚠️
                        </span>
                      )}
                      {monthNames[idx]}
                    </div>
                  </th>
                  {goals.map((goal) => (
                    <td key={goal.id} className="td-value">
                      <label
                        htmlFor={`value-${idx}-${goal.id}`}
                        className="visually-hidden"
                      >
                        Valor de {goal.name} em {monthNames[idx]}
                      </label>
                      <input
                        id={`value-${idx}-${goal.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={month.values[goal.id] || ""}
                        onChange={(e) =>
                          handleValueChange(idx, goal.id, e.target.value)
                        }
                        placeholder="0.00"
                        className="value-input"
                        aria-label={`Valor de ${goal.name} em ${monthNames[idx]}`}
                      />
                    </td>
                  ))}
                  <td className="td-month-total">
                    R$ {calculateMonthTotal(idx).toFixed(2)}
                  </td>
                  <td className="td-observation">
                    <label htmlFor={`obs-${idx}`} className="visually-hidden">
                      Observação de {monthNames[idx]}
                    </label>
                    <input
                      id={`obs-${idx}`}
                      type="text"
                      value={month.observation}
                      onChange={(e) => onUpdateObservation(idx, e.target.value)}
                      placeholder="Adicione uma nota..."
                      className="observation-input"
                      aria-label={`Observação de ${monthNames[idx]}`}
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
                  R$ {calculateGoalTotal(goal.id).toFixed(2)}
                </td>
              ))}
              <td className="td-grand-total">
                R$ {calculateGrandTotal().toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyTable;
