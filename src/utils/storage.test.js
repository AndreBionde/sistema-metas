import { createAppStateSignature, normalizeAppState } from "./storage";

describe("storage utils", () => {
  it("returns a default state when no payload is provided", () => {
    const normalizedState = normalizeAppState(null);

    expect(normalizedState.currentYear).toBeTruthy();
    expect(normalizedState.years[normalizedState.currentYear].goals).toHaveLength(0);
  });

  it("normalizes a modern state payload", () => {
    const normalizedState = normalizeAppState({
      currentYear: "2026",
      years: {
        2026: {
          goals: [
            {
              id: 1,
              name: "Reserva",
              category: "Reserva",
              targetAmount: 1000,
              plannedMonthlyAmount: 200,
              status: "active",
            },
          ],
          monthlyData: [{ month: 1, values: { 1: 250 }, observation: "ok" }],
        },
      },
      metadata: { onboardingCompleted: true, lastExportAt: "" },
    });

    expect(normalizedState.currentYear).toBe("2026");
    expect(normalizedState.years["2026"].goals).toHaveLength(1);
    expect(normalizedState.years["2026"].monthlyData[0].values[1]).toBe(250);
  });

  it("normalizes legacy data shape", () => {
    const normalizedState = normalizeAppState({
      goals: [{ id: 1, name: "Reserva", targetAmount: 1000, status: "active" }],
      monthlyData: [{ month: 1, values: { 1: 250 }, observation: "" }],
    });

    expect(Object.keys(normalizedState.years)).toHaveLength(1);
    expect(normalizedState.years[normalizedState.currentYear].goals).toHaveLength(1);
  });

  it("sanitizes invalid categories and negative values", () => {
    const normalizedState = normalizeAppState({
      currentYear: "2026",
      years: {
        2026: {
          goals: [
            {
              id: 9,
              name: "Teste",
              category: "Categoria invalida",
              targetAmount: -10,
              plannedMonthlyAmount: -50,
              status: "status-invalido",
            },
          ],
          monthlyData: [
            {
              month: 1,
              values: { 9: -300, 10: 120 },
              observation: "a".repeat(400),
            },
          ],
        },
      },
    });

    const goal = normalizedState.years["2026"].goals[0];
    const month = normalizedState.years["2026"].monthlyData[0];

    expect(goal.category).toBe("Outros");
    expect(goal.targetAmount).toBe(0);
    expect(goal.plannedMonthlyAmount).toBe(0);
    expect(goal.status).toBe("active");
    expect(month.values[9]).toBeUndefined();
    expect(month.values[10]).toBe(120);
    expect(month.observation.length).toBeLessThanOrEqual(240);
  });

  it("limits long goal names and creates stable signatures", () => {
    const normalizedState = normalizeAppState({
      currentYear: "2026",
      years: {
        2026: {
          goals: [
            {
              id: 1,
              name: "Meta ".repeat(30),
              category: "Reserva",
              targetAmount: 100,
              plannedMonthlyAmount: 10,
              status: "active",
            },
          ],
          monthlyData: [{ month: 1, values: { 1: 20 }, observation: "" }],
        },
      },
    });

    expect(normalizedState.years["2026"].goals[0].name.length).toBeLessThanOrEqual(80);
    expect(createAppStateSignature(normalizedState)).toBe(
      createAppStateSignature(normalizedState)
    );
  });
});
