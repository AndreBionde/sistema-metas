import { useState, useEffect } from "react";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import GoalsManager from "./components/GoalsManager";
import MonthlyTable from "./components/MonthlyTable";
import Tips from "./components/Tips";
import PWAInstructions from "./components/PWAInstructions";
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

  const addGoal = () => {
    const colors = [
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
      "#f97316",
    ];
    const newGoal = {
      id: Date.now(),
      name: `Meta ${goals.length + 1}`,
      color: colors[goals.length % colors.length],
      status: "active",
      targetAmount: 0,
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (id) => {
    if (window.confirm("Tem certeza que deseja remover esta meta?")) {
      setGoals(goals.filter((g) => g.id !== id));
      const newData = monthlyData.map((month) => {
        const { [id]: removed, ...rest } = month.values;
        return { ...month, values: rest };
      });
      setMonthlyData(newData);
    }
  };

  const updateGoalName = (id, newName) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, name: newName } : g)));
  };

  const updateGoalStatus = (id, newStatus) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, status: newStatus } : g)));
  };

  const updateGoalTarget = (id, target) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, targetAmount: parseFloat(target) || 0 } : g
      )
    );
  };

  const updateValue = (monthIndex, goalId, value) => {
    const newData = [...monthlyData];
    newData[monthIndex].values[goalId] = parseFloat(value) || 0;
    setMonthlyData(newData);
  };

  const updateObservation = (monthIndex, obs) => {
    const newData = [...monthlyData];
    newData[monthIndex].observation = obs;
    setMonthlyData(newData);
  };

  const calculateMonthTotal = (monthIndex) => {
    return Object.values(monthlyData[monthIndex].values).reduce(
      (sum, val) => sum + val,
      0
    );
  };

  const calculateGoalTotal = (goalId) => {
    return monthlyData.reduce(
      (sum, month) => sum + (month.values[goalId] || 0),
      0
    );
  };

  const calculateGoalProgress = (goalId) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.targetAmount === 0) return 0;
    const total = calculateGoalTotal(goalId);
    return Math.min((total / goal.targetAmount) * 100, 100);
  };

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

        <GoalsManager
          goals={goals}
          onAddGoal={addGoal}
          onRemoveGoal={removeGoal}
          onUpdateGoalName={updateGoalName}
          onUpdateGoalStatus={updateGoalStatus}
          onUpdateGoalTarget={updateGoalTarget}
          calculateGoalTotal={calculateGoalTotal}
          calculateGoalProgress={calculateGoalProgress}
        />

        <MonthlyTable
          goals={goals}
          monthlyData={monthlyData}
          onUpdateValue={updateValue}
          onUpdateObservation={updateObservation}
          calculateMonthTotal={calculateMonthTotal}
          calculateGoalTotal={calculateGoalTotal}
          calculateGrandTotal={calculateGrandTotal}
        />

        <Tips />
        <PWAInstructions />
      </div>
    </div>
  );
};

export default App;
