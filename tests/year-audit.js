const { chromium } = require('playwright');

function pad(value) {
  return String(value).padStart(2, '0');
}

function buildYearData() {
  const transactions = [];
  const cards = [
    { id: 'card-nubank', name: 'Nubank', limit: 4500, closingDay: 20, dueDay: 28, color: '#7c3aed' },
    { id: 'card-inter', name: 'Inter', limit: 3000, closingDay: 5, dueDay: 12, color: '#dc2626' }
  ];

  const plannedBills = [
    { id: 'bill-aluguel', name: 'Aluguel', amount: 1200, dueDate: '2026-01-05', category: 'moradia', necessity: 'essential', repeatMonthly: true, active: true },
    { id: 'bill-internet', name: 'Internet', amount: 110, dueDate: '2026-01-10', category: 'moradia', necessity: 'essential', repeatMonthly: true, active: true },
    { id: 'bill-faculdade', name: 'Curso online', amount: 180, dueDate: '2026-01-15', category: 'educacao', necessity: 'essential', repeatMonthly: true, active: true }
  ];

  for (let month = 1; month <= 12; month += 1) {
    const ym = `2026-${pad(month)}`;
    transactions.push({ id: `income-${month}`, desc: 'Salario mensal', amount: 4200 + (month % 3) * 150, type: 'income', date: `${ym}-05`, paid: true });
    if (month % 2) transactions.push({ id: `freela-${month}`, desc: 'Freela eventual', amount: 350, type: 'income', date: `${ym}-18`, paid: true });

    [
      ['Aluguel', 1200, 'moradia', 'essential', 5, ''],
      ['Luz', 180 + month * 3, 'moradia', 'essential', 8, ''],
      ['Agua', 85, 'moradia', 'essential', 9, ''],
      ['Internet', 110, 'moradia', 'essential', 10, ''],
      ['Mercado', 620 + month * 8, 'mercado', 'essential', 12, ''],
      ['Transporte', 260, 'transporte', 'essential', 14, ''],
      ['Farmacia', 90 + (month % 4) * 20, 'saude', 'essential', 16, ''],
      ['Netflix e Spotify', 74.8, 'assinaturas', 'desire', 17, 'card-nubank'],
      ['Restaurante', 160 + (month % 5) * 25, 'alimentacao', 'desire', 20, 'card-nubank'],
      ['Lazer', 120 + (month % 3) * 35, 'lazer', 'desire', 22, 'card-inter'],
      ['Reserva de emergencia', 300, 'outros', 'essential', 25, '']
    ].forEach(([desc, amount, category, necessity, day, cardId], index) => {
      transactions.push({
        id: `exp-${month}-${index}`,
        desc,
        amount,
        type: 'expense',
        date: `${ym}-${pad(day)}`,
        category,
        necessity,
        cardId,
        paid: month < 12 || day < 20
      });
    });
  }

  return {
    version: 5,
    exportedAt: new Date().toISOString(),
    profile: {
      name: 'Adm Teste',
      type: 'pessoal',
      expectedIncome: 4200,
      objective: 'organizar',
      reviewMoment: 'middle',
      mainReserveId: 'res-emergencia',
      payday: 5,
      monthlySavingsGoal: 400,
      reserveLevel: 'strong',
      maxCommitment: 80
    },
    reserves: [
      { id: 'res-emergencia', name: 'Reserva de emergencia', target: 15000, saved: 5200, monthlyGoal: 400 },
      { id: 'res-viagem', name: 'Viagem', target: 5000, saved: 1200, monthlyGoal: 250 }
    ],
    investments: [
      { id: 'inv-cdb', name: 'CDB liquidez diaria', type: 'fixed_income', initialAmount: 3000, monthlyContribution: 250, monthlyRate: 0.85, startDate: '2026-01-10', notes: 'Teste anual' },
      { id: 'inv-usd', name: 'Dolar', type: 'currency', code: 'USD-BRL', quantity: 200, initialAmount: 1000, monthlyContribution: 50, monthlyRate: 0, startDate: '2026-02-10' }
    ],
    cards,
    plannedBills,
    transactions
  };
}

async function waitLogged(page) {
  await page.waitForFunction(() => document.querySelector('#auth-modal')?.classList.contains('hidden'), null, { timeout: 30000 });
}

async function login(page) {
  await page.goto('http://localhost:8010/app-pc.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#auth-email', { timeout: 30000 });
  await page.fill('#auth-email', 'adm@teste.com');
  await page.fill('#auth-password', 'admteste123');
  await page.click('#auth-submit');
  await waitLogged(page);
}

async function auditViewport(browser, viewport, name) {
  const page = await browser.newPage({ viewport, isMobile: viewport.width < 700 });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await login(page);
  await page.fill('#month-filter', '2026-04');
  await page.dispatchEvent('#month-filter', 'change');
  for (const tab of ['dashboard', 'profile', 'reserve', 'planned', 'cards', 'investments', 'planning', 'simulator']) {
    await page.click(`.tab-button[data-tab="${tab}"]`);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.setActiveTab('dashboard', false));
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    topbarHeight: Math.round(document.querySelector('.topbar')?.getBoundingClientRect().height || 0),
    selectedMonth: document.querySelector('#month-filter')?.value || '',
    transactionRows: document.querySelectorAll('#transaction-list .transaction-row').length,
    plannedRows: document.querySelectorAll('#planned-list article').length,
    cardRows: document.querySelectorAll('#card-list article').length,
    investmentRows: document.querySelectorAll('#investment-list article').length,
    sync: document.querySelector('#sync-status')?.textContent || ''
  }));

  await page.close();
  return { name, metrics, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await login(page);
  await page.evaluate(() => {
    window.confirm = () => true;
  });
  await page.setInputFiles('#import-json', {
    name: 'ano-teste.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(buildYearData(), null, 2))
  });
  await page.waitForTimeout(1000);
  const localCounts = await page.evaluate(() => ({
    transactions: JSON.parse(localStorage.getItem('finance_panel_transactions_v2') || '[]').length,
    cards: JSON.parse(localStorage.getItem('finance_panel_cards_v1') || '[]').length,
    planned: JSON.parse(localStorage.getItem('finance_panel_planned_bills_v1') || '[]').length
  }));
  console.log('local-after-import:', JSON.stringify(localCounts));
  await page.waitForFunction(() => document.querySelector('#sync-status')?.textContent?.includes('Sincronizado'), null, { timeout: 30000 }).catch(() => {});
  console.log('import-sync:', await page.locator('#sync-status').innerText());

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitLogged(page);
  await page.fill('#month-filter', '2026-04');
  await page.dispatchEvent('#month-filter', 'change');
  await page.evaluate(() => window.setActiveTab('dashboard', false));
  const countAfterReload = await page.evaluate(() => document.querySelectorAll('#transaction-list .transaction-row').length);
  console.log('rows-after-reload:', countAfterReload);
  await page.close();

  const desktop = await auditViewport(browser, { width: 1440, height: 1000 }, 'desktop');
  const mobile = await auditViewport(browser, { width: 390, height: 844 }, 'mobile');
  console.log('audit:', JSON.stringify({ desktop, mobile }, null, 2));
  await browser.close();
})();
