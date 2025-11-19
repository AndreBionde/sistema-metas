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

  return (
    <div className="monthly-table-container">
      <div className="monthly-table-header">
        <h2 className="monthly-table-title">Planejamento Mensal</h2>
      </div>

      <div className="table-wrapper">
        <table className="monthly-table">
          <thead>
            <tr>
              <th className="th-month">Mês</th>
              {goals.map((goal) => (
                <th key={goal.id} className="th-goal">
                  <div className="th-goal-content">
                    <div
                      className="th-goal-dot"
                      style={{ backgroundColor: goal.color }}
                    ></div>
                    <span className="th-goal-name">{goal.name}</span>
                  </div>
                </th>
              ))}
              <th className="th-total">Total</th>
              <th className="th-obs">Observações</th>
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
                  <td
                    className={`td-month ${
                      idx % 2 === 0 ? "td-even" : "td-odd"
                    }`}
                  >
                    <div className="month-cell">
                      {isEmpty && (
                        <span className="warning-icon" title="Mês sem valores">
                          ⚠️
                        </span>
                      )}
                      {monthNames[idx]}
                    </div>
                  </td>
                  {goals.map((goal) => (
                    <td key={goal.id} className="td-value">
                      <input
                        type="number"
                        value={month.values[goal.id] || ""}
                        onChange={(e) =>
                          onUpdateValue(idx, goal.id, e.target.value)
                        }
                        placeholder="0.00"
                        className="value-input"
                      />
                    </td>
                  ))}
                  <td className="td-month-total">
                    R$ {calculateMonthTotal(idx).toFixed(2)}
                  </td>
                  <td className="td-observation">
                    <input
                      type="text"
                      value={month.observation}
                      onChange={(e) => onUpdateObservation(idx, e.target.value)}
                      placeholder="Adicione uma nota..."
                      className="observation-input"
                    />
                  </td>
                </tr>
              );
            })}
            <tr className="row-total">
              <td className="td-total-label">TOTAL</td>
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
