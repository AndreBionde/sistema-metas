import { useState, useEffect } from "react";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import "./App.css";

const App = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Ajuda em Casa",
      color: "#8b5cf6",
      status: "active",
      targetAmount: 0,
    },
    {
      id: 2,
      name: "Emergência",
      color: "#ef4444",
      status: "active",
      targetAmount: 0,
    },
    {
      id: 3,
      name: "Guardar Futuro",
      color: "#10b981",
      status: "active",
      targetAmount: 0,
    },
  ]);

  const [monthlyData, setMonthlyData] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      values: {},
      observation: "",
    }))
  );

  useEffect(() => {
    const savedGoals = localStorage.getItem("financialGoals");
    const savedMonthlyData = localStorage.getItem("financialMonthlyData");

    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMonthlyData) setMonthlyData(JSON.parse(savedMonthlyData));
  }, []);

  useEffect(() => {
    localStorage.setItem("financialGoals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("financialMonthlyData", JSON.stringify(monthlyData));
  }, [monthlyData]);

  const calculateGrandTotal = () => {
    return monthlyData.reduce(
      (sum, month) =>
        sum + Object.values(month.values).reduce((s, v) => s + v, 0),
      0
    );
  };

  const resetAllData = () => {
    if (window.confirm("⚠️ Isso vai apagar TODOS os dados. Tem certeza?")) {
      localStorage.removeItem("financialGoals");
      localStorage.removeItem("financialMonthlyData");
      setGoals([
        {
          id: 1,
          name: "Meta 1",
          color: "#8b5cf6",
          status: "active",
          targetAmount: 0,
        },
      ]);
      setMonthlyData(
        Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          values: {},
          observation: "",
        }))
      );
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <Header onReset={resetAllData} />

        <StatsCards
          totalGeral={calculateGrandTotal()}
          activeGoals={goals.filter((g) => g.status === "active").length}
          monthlyAverage={calculateGrandTotal() / 12}
        />
      </div>
    </div>
  );
};

export default App;
