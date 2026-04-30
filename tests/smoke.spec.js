const { test, expect } = require('@playwright/test');

async function loginLocal(page) {
  await page.goto('/dinheiro.html?auth=local');
  await page.fill('#auth-email', 'adm');
  await page.fill('#auth-password', 'adm');
  await page.click('#auth-submit');
  await expect(page.locator('#auth-modal')).toHaveClass(/hidden/);
}

async function addIncome(page, desc = 'Receita teste') {
  await page.fill('#desc', desc);
  await page.fill('#amount', '1000');
  await page.selectOption('#type', 'income');
  await page.fill('#date', '2026-04-10');
  await page.click('#submit-button');
}

async function addExpense(page, desc = 'Despesa teste') {
  await page.fill('#desc', desc);
  await page.fill('#amount', '120');
  await page.selectOption('#type', 'expense');
  await page.selectOption('#category', 'mercado');
  await page.selectOption('#necessity', 'essential');
  await page.fill('#date', '2026-04-11');
  await page.selectOption('#paid', 'pending');
  await page.click('#submit-button');
}

async function addCard(page) {
  await page.click('.tab-button[data-tab="cards"]');
  await page.fill('#card-name', 'Cartao Teste');
  await page.fill('#card-limit', '3000');
  await page.fill('#card-closing', '10');
  await page.fill('#card-due', '20');
  await page.click('#card-submit');
  await expect(page.locator('#card-list')).toContainText('Cartao Teste');
}

async function selectCardByText(page, selectId, text) {
  const value = await page.locator(`${selectId} option`, { hasText: text }).first().getAttribute('value');
  expect(value).toBeTruthy();
  await page.selectOption(selectId, value);
}

test('abre o app e entra no modo local', async ({ page }) => {
  await loginLocal(page);
  await expect(page.locator('#sync-status')).toContainText('Modo local/teste ativo');
  await expect(page.locator('.tab-button[data-tab="dashboard"]')).toBeVisible();
});

test('cadastra uma receita local', async ({ page }) => {
  await loginLocal(page);
  await addIncome(page);
  await expect(page.locator('#transaction-list')).toContainText('Receita teste');
});

test('cadastra despesa e usa filtros do histórico', async ({ page }) => {
  await loginLocal(page);
  await addExpense(page, 'Mercado filtro');
  await expect(page.locator('#transaction-list')).toContainText('Mercado filtro');
  await page.fill('#search-filter', 'Mercado filtro');
  await expect(page.locator('#transaction-list')).toContainText('Mercado filtro');
  await page.selectOption('#type-filter', 'income');
  await expect(page.locator('#empty-state')).not.toHaveClass(/hidden/);
});

test('cria cartão e compra no cartão', async ({ page }) => {
  await loginLocal(page);
  await addCard(page);
  await page.click('.tab-button[data-tab="dashboard"]');
  await page.fill('#desc', 'Compra no cartão');
  await page.fill('#amount', '250');
  await page.selectOption('#type', 'expense');
  await page.selectOption('#category', 'cartao');
  await selectCardByText(page, '#card-select', 'Cartao Teste');
  await page.fill('#date', '2026-04-12');
  await page.click('#submit-button');
  await expect(page.locator('#transaction-list')).toContainText('Compra no cartão');
});

test('cria compra parcelada', async ({ page }) => {
  await loginLocal(page);
  await addCard(page);
  await page.click('.tab-button[data-tab="dashboard"]');
  await page.fill('#desc', 'Notebook parcelado');
  await page.fill('#amount', '1200');
  await page.selectOption('#type', 'installment');
  await page.selectOption('#category', 'trabalho');
  await selectCardByText(page, '#card-select', 'Cartao Teste');
  await page.selectOption('#card-payment-mode', 'installment');
  await page.fill('#installments', '3');
  await page.fill('#date', '2026-04-12');
  await page.click('#submit-button');
  await expect(page.locator('#transaction-list')).toContainText('Notebook parcelado');
});

test('cria conta prevista mensal e marca como paga', async ({ page }) => {
  await loginLocal(page);
  await page.click('.tab-button[data-tab="planned"]');
  await page.fill('#planned-name', 'Internet teste');
  await page.fill('#planned-amount', '99');
  await page.fill('#planned-due-date', '2026-04-15');
  await page.check('#planned-repeat');
  await page.click('#planned-submit');
  await expect(page.locator('#planned-list')).toContainText('Internet teste');
  await page.click('#pay-month-bills');
  await expect(page.locator('#toast')).toContainText(/marcada|marcadas|pendentes/);
});

test('cria reserva financeira', async ({ page }) => {
  await loginLocal(page);
  await page.click('.tab-button[data-tab="reserve"]');
  await page.fill('#reserve-name', 'Emergência');
  await page.fill('#reserve-target', '5000');
  await page.fill('#reserve-saved', '1000');
  await page.fill('#reserve-monthly', '300');
  await page.click('#reserve-submit');
  await expect(page.locator('#reserve-list')).toContainText('Emergência');
});

test('cria investimento manual', async ({ page }) => {
  await loginLocal(page);
  await page.click('.tab-button[data-tab="investments"]');
  await page.click('#investment-entry-manual');
  await page.fill('#investment-name', 'CDB teste');
  await page.fill('#investment-rate', '0,85');
  await page.fill('#investment-amount', '1000');
  await page.fill('#investment-monthly', '100');
  await page.fill('#investment-start-date', '2026-04-01');
  await page.click('#investment-submit');
  await expect(page.locator('#investment-list')).toContainText('CDB teste');
});

test('exporta backup, importa JSON e restaura backup local', async ({ page }) => {
  await loginLocal(page);
  await addIncome(page, 'Receita backup');
  const downloadPromise = page.waitForEvent('download');
  await page.click('#export-backup');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/backup-financeiro-\d{4}-\d{2}-\d{2}\.json/);

  page.once('dialog', (dialog) => dialog.accept());
  await page.setInputFiles('#import-json', {
    name: 'import.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      schemaVersion: 2,
      transactions: [{ id: 'import-1', desc: 'Importada', amount: 50, type: 'income', date: '2026-04-20', paid: true }]
    }))
  });
  await expect(page.locator('#transaction-list')).toContainText('Importada');

  page.once('dialog', (dialog) => dialog.accept('RESTAURAR'));
  await page.click('#restore-backup');
  await expect(page.locator('#transaction-list')).toContainText('Receita backup');
});

test('limpa dados somente com confirmação forte', async ({ page }) => {
  await loginLocal(page);
  await addIncome(page, 'Receita para apagar');
  page.once('dialog', (dialog) => dialog.accept('CANCELAR'));
  await page.click('#clear-data');
  await expect(page.locator('#transaction-list')).toContainText('Receita para apagar');
  page.once('dialog', (dialog) => dialog.accept('APAGAR'));
  await page.click('#clear-data');
  await expect(page.locator('#empty-state')).not.toHaveClass(/hidden/);
});

test('troca tema claro e escuro', async ({ page }) => {
  await loginLocal(page);
  await page.click('#theme-toggle');
  await expect(page.locator('body')).toHaveClass(/dark-mode/);
});

test('registra service worker do PWA', async ({ page, context }) => {
  await loginLocal(page);
  await page.waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.getRegistrations);
  const registrations = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
  expect(registrations).toBeGreaterThanOrEqual(1);
  await context.clearCookies();
});

test('cria meta, usa tags, busca global, CSV e fechamento mensal', async ({ page }) => {
  await loginLocal(page);
  await page.fill('#desc', 'Compra com tag');
  await page.fill('#tags', 'casa, urgente');
  await page.fill('#amount', '75');
  await page.selectOption('#type', 'expense');
  await page.selectOption('#category', 'moradia');
  await page.fill('#date', '2026-04-18');
  await page.click('#submit-button');
  await expect(page.locator('#transaction-list')).toContainText('#casa');

  await page.click('.tab-button[data-tab="planning"]');
  await page.fill('#goal-name', 'Quitar dívida');
  await page.fill('#goal-target', '5000');
  await page.fill('#goal-saved', '800');
  await page.click('#goal-submit');
  await expect(page.locator('#goal-list')).toContainText('Quitar dívida');

  await page.evaluate(() => {
    window.__lastAlert = '';
    window.prompt = () => 'Quitar';
    window.alert = (message) => { window.__lastAlert = String(message); };
  });
  await page.click('#global-search');
  await expect.poll(() => page.evaluate(() => window.__lastAlert)).toContain('Meta: Quitar dívida');

  const downloadPromise = page.waitForEvent('download');
  await page.click('#export-csv');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/transacoes-\d{4}-\d{2}-\d{2}\.csv/);

  await page.click('#close-month');
  await expect.poll(() => page.evaluate(() => window.__lastAlert)).toContain('Fechamento');
});

