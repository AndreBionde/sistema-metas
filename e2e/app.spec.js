const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();
});

test("faz login, cadastra meta e mantém persistência após recarregar", async ({
  page,
}) => {
  await expect(page.getByRole("button", { name: "Entrar com Google" })).toBeVisible();

  await page.getByRole("button", { name: "Entrar com Google" }).click();

  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

  const dismissOnboarding = page.getByRole("button", { name: "Entendi" });
  if (await dismissOnboarding.isVisible()) {
    await dismissOnboarding.click();
  }

  await page
    .getByRole("button", { name: /Criar primeira meta|Adicionar/ })
    .first()
    .click();

  const goalNameInput = page.getByLabel(/Nome da meta/i).first();
  await goalNameInput.fill("Reserva anual");
  await goalNameInput.blur();

  await page.getByLabel("Meta de valor").fill("5000");
  await page.getByLabel("Valor de Reserva anual em Jan").fill("300");
  await page.getByLabel("Observação de Jan").fill("Primeiro aporte");

  await expect
    .poll(
      async () =>
        page.evaluate(() => window.localStorage.getItem("planometa.mock.plan.mock-user")),
      { timeout: 15000 }
    )
    .toContain("Reserva anual");
  await expect(page.getByText(/Nuvem em dia/i)).toBeVisible({ timeout: 15000 });

  await page.reload();

  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({
    timeout: 15000,
  });
  await expect
    .poll(
      async () =>
        page.evaluate(() => window.localStorage.getItem("planometa.mock.plan.mock-user")),
      { timeout: 15000 }
    )
    .toContain("Reserva anual");
  await expect
    .poll(
      async () =>
        page.evaluate(() => window.localStorage.getItem("planometa.mock.plan.mock-user")),
      { timeout: 15000 }
    )
    .toContain("Primeiro aporte");
});

test("exporta e restaura backup json", async ({ page }) => {
  await page.getByRole("button", { name: "Entrar com Google" }).click();

  const dismissOnboarding = page.getByRole("button", { name: "Entendi" });
  if (await dismissOnboarding.isVisible()) {
    await dismissOnboarding.click();
  }

  await page
    .getByRole("button", { name: /Criar primeira meta|Adicionar/ })
    .first()
    .click();

  const goalNameInput = page.getByLabel(/Nome da meta/i).first();
  await goalNameInput.fill("Meta backup");
  await goalNameInput.blur();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Backup JSON" }).click(),
  ]);

  await page.getByRole("button", { name: "Resetar tudo" }).click();
  await page.getByRole("button", { name: "Resetar conta" }).click();

  await expect(page.getByText(/Sua carteira de metas ainda está em branco/i)).toBeVisible();

  const restoreInput = page.locator('input[type="file"][accept="application/json,.json"]');
  await restoreInput.setInputFiles(await download.path());
  await page.getByRole("button", { name: "Restaurar agora" }).click();

  await expect(page.locator('input[value="Meta backup"]')).toBeVisible({
    timeout: 15000,
  });
});
