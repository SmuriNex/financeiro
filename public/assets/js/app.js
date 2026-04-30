const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDcM0slOOlhAzi03qHwdJcygPKPWfu6GM0',
    authDomain: 'meu-financeiro-ec5be.firebaseapp.com',
    projectId: 'meu-financeiro-ec5be',
    storageBucket: 'meu-financeiro-ec5be.firebasestorage.app',
    messagingSenderId: '413446678037',
    appId: '1:413446678037:web:cfe13bc088dc5bcbc5901c',
    measurementId: 'G-HT1K6G809Q'
};

const AUTH_MODE_STORAGE_KEY = 'finance_panel_auth_mode_v1';
const APP_VERSION = '1.2.0';
const SCHEMA_VERSION = 2;
const RUNNING_FROM_FILE = window.location.protocol === 'file:';
const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const LOCAL_AUTH_ALLOWED = RUNNING_FROM_FILE || LOCAL_DEV_HOSTS.has(window.location.hostname);
const AUTH_ENABLED = resolveAuthEnabled();
const DEV_ACCESS = {
    uid: 'local-adm',
    email: 'adm',
    password: 'adm'
};
const LOCAL_APP_URL = 'http://localhost:8010/dinheiro.html';
const LOCAL_TEST_AUTH_KEY = 'finance_panel_local_test_auth_v1';
let analyticsInstance = null;
let firebaseAppModule = null;
let firebaseAnalyticsModule = null;
let firebaseAuthModule = null;
let firebaseFirestoreModule = null;
let FIREBASE_APP = null;
let FIREBASE_AUTH = null;
let FIREBASE_DB = null;

const STORAGE_KEYS = {
    transactions: 'finance_panel_transactions_v2',
    profile: 'finance_panel_profile_v1',
    reserves: 'finance_panel_reserves_v1',
    plannedBills: 'finance_panel_planned_bills_v1',
    investments: 'finance_panel_investments_v1',
    cards: 'finance_panel_cards_v1',
    goals: 'finance_panel_goals_v1',
    prefs: 'finance_panel_preferences_v1',
    meta: 'finance_panel_sync_meta_v1',
    backups: 'finance_panel_backup_history_v1'
};

const CATEGORY_LABELS = {
    moradia: 'Moradia',
    mercado: 'Mercado',
    alimentacao: 'Delivery e restaurantes',
    transporte: 'Transporte',
    saude: 'Saúde',
    educacao: 'Educação',
    assinaturas: 'Assinaturas',
    cartao: 'Cartão de crédito',
    dividas: 'Dívidas e empréstimos',
    lazer: 'Lazer',
    trabalho: 'Trabalho',
    outros: 'Outros'
};

const OBJECTIVE_LABELS = {
    organizar: 'Organizar contas',
    economizar: 'Economizar mais',
    quitar: 'Quitar dívidas',
    reserva: 'Juntar reserva',
    investir: 'Investir todo mês'
};

const OBJECTIVE_STRATEGIES = {
    organizar: {
        essentialShare: 0.55,
        flexibleShare: 0.2,
        goalShare: 0.25,
        goalLabel: 'Folga estratégica',
        summary: 'Primeiro estabilize o mês e crie espaço para sobrar dinheiro.'
    },
    economizar: {
        essentialShare: 0.5,
        flexibleShare: 0.15,
        goalShare: 0.35,
        goalLabel: 'Economia mensal',
        summary: 'O foco agora é ampliar sobra, reduzir desejos e preservar caixa.'
    },
    quitar: {
        essentialShare: 0.55,
        flexibleShare: 0.1,
        goalShare: 0.35,
        goalLabel: 'Amortização',
        summary: 'Seu plano precisa abrir caixa para atacar dívidas com consistência.'
    },
    reserva: {
        essentialShare: 0.5,
        flexibleShare: 0.15,
        goalShare: 0.35,
        goalLabel: 'Reserva mensal',
        summary: 'A prioridade é construir colchão financeiro sem sufocar o dia a dia.'
    },
    investir: {
        essentialShare: 0.5,
        flexibleShare: 0.15,
        goalShare: 0.35,
        goalLabel: 'Aporte mensal',
        summary: 'Mantenha a vida financeira enxuta para investir com disciplina.'
    }
};

const REVIEW_MOMENT_LABELS = {
    start: 'Inicio do mes',
    middle: 'Meio do mes',
    end: 'Fim do mes'
};

const REVIEW_MOMENT_DAYS = {
    start: 5,
    middle: 15,
    end: 25
};

const RESERVE_LEVELS = {
    basic: {
        label: 'Basica',
        months: 1
    },
    safe: {
        label: 'Segura',
        months: 3
    },
    strong: {
        label: 'Forte',
        months: 6
    }
};

const INVESTMENT_TYPE_LABELS = {
    currency: 'Moeda estrangeira',
    crypto: 'Criptomoeda',
    savings: 'Poupança',
    fixed_income: 'Renda fixa',
    other: 'Outro investimento'
};

const INVESTMENT_MARKET_CACHE_MS = 5 * 60 * 1000;
const AWESOMEAPI_BASE_URL = 'https://economia.awesomeapi.com.br';

const INVESTMENT_MARKET_PRESETS = {
    currency: [
        { code: 'USD', name: 'Dólar americano', note: 'Estados Unidos' },
        { code: 'EUR', name: 'Euro', note: 'Zona do euro' },
        { code: 'GBP', name: 'Libra esterlina', note: 'Reino Unido' },
        { code: 'JPY', name: 'Iene japonês', note: 'Japão' },
        { code: 'CHF', name: 'Franco suíço', note: 'Suíça' },
        { code: 'CAD', name: 'Dólar canadense', note: 'Canadá' },
        { code: 'AUD', name: 'Dólar australiano', note: 'Austrália' },
        { code: 'CNY', name: 'Yuan chinês', note: 'China' }
    ],
    crypto: [
        { code: 'BTC', name: 'Bitcoin', note: 'Reserva digital' },
        { code: 'ETH', name: 'Ethereum', note: 'Ecossistema de contratos' },
        { code: 'LTC', name: 'Litecoin', note: 'Pagamento rápido' },
        { code: 'XRP', name: 'XRP', note: 'Transferências globais' },
        { code: 'DOGE', name: 'Dogecoin', note: 'Comunidade e liquidez' },
        { code: 'SOL', name: 'Solana', note: 'Alta velocidade' }
    ]
};

const DEFAULT_PROFILE = {
    name: '',
    type: 'pessoal',
    expectedIncome: 0,
    objective: 'organizar',
    reviewMoment: 'middle',
    mainReserveId: '',
    payday: null,
    monthlySavingsGoal: 0,
    reserveLevel: 'strong',
    maxCommitment: 80
};

const AUTO_RULES = [
    { words: ['salario', 'salário', 'pix recebido', 'freela', 'bonus', 'bônus', 'comissao', 'comissão'], type: 'income', category: null, necessity: null },
    { words: ['uber', '99', 'gasolina', 'combustivel', 'combustível', 'onibus', 'ônibus', 'metro', 'metrô'], type: 'expense', category: 'transporte', necessity: 'essential' },
    { words: ['mercado', 'supermercado', 'atacadao', 'atacadão', 'carrefour', 'assai', 'assaí'], type: 'expense', category: 'mercado', necessity: 'essential' },
    { words: ['ifood', 'restaurante', 'lanche', 'delivery', 'pizza', 'hamburguer'], type: 'expense', category: 'alimentacao', necessity: 'desire' },
    { words: ['netflix', 'spotify', 'prime', 'disney', 'hbo', 'assinatura'], type: 'expense', category: 'assinaturas', necessity: 'desire' },
    { words: ['farmacia', 'farmácia', 'remedio', 'remédio', 'consulta', 'dentista', 'médico', 'medico'], type: 'expense', category: 'saude', necessity: 'essential' },
    { words: ['aluguel', 'condominio', 'condomínio', 'luz', 'agua', 'água', 'internet'], type: 'expense', category: 'moradia', necessity: 'essential' },
    { words: ['faculdade', 'curso', 'livro', 'escola'], type: 'expense', category: 'educacao', necessity: 'essential' },
    { words: ['cartao', 'cartão', 'fatura'], type: 'expense', category: 'cartao', necessity: 'essential' },
    { words: ['emprestimo', 'empréstimo', 'divida', 'dívida', 'financiamento'], type: 'expense', category: 'dividas', necessity: 'essential' },
    { words: ['cinema', 'bar', 'jogo', 'game', 'lazer', 'show'], type: 'expense', category: 'lazer', necessity: 'desire' }
];

const state = {
    transactions: [],
    profile: { ...DEFAULT_PROFILE },
    reserves: [],
    plannedBills: [],
    investments: [],
    cards: [],
    goals: [],
    selectedMonth: '',
    activeTab: 'dashboard',
    investmentEntryMode: 'market',
    editingId: null,
    editingReserveId: null,
    editingPlannedId: null,
    editingInvestmentId: null,
    editingCardId: null,
    categoryTouched: false,
    theme: 'light',
    toastTimer: null,
    user: null,
    authMode: 'login',
    authReady: false,
    cloudSyncTimer: null,
    cloudSyncPending: false,
    cloudSyncState: 'checking',
    cloudSyncMessage: 'Verificando conta',
    lastSyncedAt: 0,
    applyingCloudState: false,
    dataVersion: 0,
    localDataOwner: null,
    investmentMarketData: {},
    investmentMarketStatus: 'idle',
    investmentMarketError: '',
    investmentMarketFetchedAt: 0,
    investmentMarketRequestKey: ''
};

const dom = {};

function resolveAuthEnabled() {
    const params = new URLSearchParams(window.location.search);
    const authMode = params.get('auth');
    const appMode = params.get('app');
    try {
        if (authMode === 'firebase' || authMode === 'local') {
            const resolvedMode = authMode === 'local' && !LOCAL_AUTH_ALLOWED ? 'firebase' : authMode;
            localStorage.setItem(AUTH_MODE_STORAGE_KEY, resolvedMode);
            return resolvedMode === 'firebase';
        }
        if (appMode === 'pc' || appMode === 'iphone') {
            localStorage.setItem(AUTH_MODE_STORAGE_KEY, 'firebase');
            return true;
        }
        const savedMode = localStorage.getItem(AUTH_MODE_STORAGE_KEY);
        if (savedMode === 'local' && !LOCAL_AUTH_ALLOWED) {
            localStorage.setItem(AUTH_MODE_STORAGE_KEY, 'firebase');
            return true;
        }
        return savedMode === 'firebase';
    } catch (error) {
        if (authMode === 'local' && LOCAL_AUTH_ALLOWED) return false;
        return authMode === 'firebase' || appMode === 'pc' || appMode === 'iphone' || !LOCAL_AUTH_ALLOWED;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        configureInstalledAppShell();
        registerServiceWorker();
        init();
    } catch (error) {
        handleStartupError(error);
    }
});

function configureInstalledAppShell() {
    const params = new URLSearchParams(window.location.search);
    const appMode = params.get('app');
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest && appMode === 'iphone') {
        manifest.setAttribute('href', 'manifest-iphone.webmanifest');
    }
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (RUNNING_FROM_FILE) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((error) => {
            console.warn('Service worker indisponível:', error);
        });
    });
}

function init() {
    cacheDom();
    bindAuthEvents();
    renderAuthUi();
    initializeAuthSession();

    loadState();
    state.selectedMonth = getMonthKey(getTodayDate());
    dom.monthFilter.value = state.selectedMonth;
    dom.date.value = getTodayDate();
    applyTheme();
    bindAppEvents();
    hydrateForms();
    setActiveTab(state.activeTab, false);
    syncPlannedForMonth(state.selectedMonth, true);
    toggleTransactionFields();
    render();
    initializeAnalytics();
}

function cacheDom() {
    [
        'month-filter',
        'theme-toggle',
        'export-json',
        'export-backup',
        'restore-backup',
        'integrity-check',
        'global-search',
        'export-csv',
        'close-month',
        'import-json',
        'clear-data',
        'transaction-form',
        'transaction-id',
        'form-title',
        'desc',
        'tags',
        'amount',
        'type',
        'category',
        'necessity',
        'card-select',
        'card-payment-mode',
        'installments',
        'recurring',
        'recurrence-months',
        'date',
        'paid',
        'reserve-link-field',
        'reserve-link-select',
        'expense-fields',
        'card-payment-field',
        'installment-fields',
        'repeat-field',
        'recurrence-options',
        'amount-label',
        'date-label',
        'submit-button',
        'cancel-edit',
        'auto-category-hint',
        'total-income',
        'total-expense',
        'total-balance',
        'cash-balance',
        'income-subtitle',
        'expense-subtitle',
        'balance-subtitle',
        'cash-subtitle',
        'health-score',
        'health-subtitle',
        'income-alert',
        'income-alert-title',
        'income-alert-text',
        'health-badge',
        'diagnostic-main',
        'diagnostic-list',
        'commitment-rate',
        'cut-potential',
        'reserve-suggestion',
        'income-usage-chart',
        'category-chart',
        'reserve-chart',
        'forecast-list',
        'essential-total',
        'desire-total',
        'essential-bar',
        'desire-bar',
        'cut-list',
        'card-overview',
        'search-filter',
        'type-filter',
        'status-filter',
        'category-filter',
        'necessity-filter',
        'card-filter',
        'tag-filter',
        'min-filter',
        'max-filter',
        'date-start-filter',
        'date-end-filter',
        'reset-filters',
        'transaction-count',
        'empty-state',
        'transaction-list',
        'profile-form',
        'profile-name',
        'profile-income',
        'profile-objective',
        'profile-review-moment',
        'profile-main-reserve',
        'profile-summary',
        'profile-payday',
        'profile-savings-goal',
        'profile-max-commitment',
        'profile-reserve-level',
        'profile-hero',
        'profile-budget-plan',
        'profile-cycle',
        'profile-action-plan',
        'reserve-form',
        'reserve-id',
        'reserve-name',
        'reserve-target',
        'reserve-saved',
        'reserve-monthly',
        'reserve-submit',
        'reserve-cancel',
        'reserve-deposit-form',
        'reserve-deposit-select',
        'reserve-deposit-amount',
        'reserve-list',
        'investment-form',
        'investment-id',
        'investment-form-caption',
        'investment-entry-market',
        'investment-entry-manual',
        'investment-type-label',
        'investment-name',
        'investment-type',
        'investment-asset-preset',
        'investment-market-fields',
        'investment-manual-fields',
        'investment-market-preview',
        'investment-code',
        'investment-quantity',
        'investment-quantity-row',
        'investment-amount',
        'investment-monthly',
        'investment-rate',
        'investment-rate-row',
        'investment-start-date',
        'investment-notes',
        'investment-submit',
        'investment-cancel',
        'investment-summary',
        'investment-portfolio-chart',
        'investment-list',
        'planned-form',
        'planned-id',
        'planned-name',
        'planned-amount',
        'planned-due-date',
        'planned-category',
        'planned-necessity',
        'planned-card-select',
        'planned-active',
        'planned-repeat',
        'planned-submit',
        'planned-cancel',
        'sync-planned',
        'pay-month-bills',
        'planned-list',
        'card-form',
        'card-id',
        'card-name',
        'card-limit',
        'card-closing',
        'card-due',
        'card-color',
        'card-submit',
        'card-cancel',
        'card-list',
        'planning-summary',
        'planning-list',
        'goal-form',
        'goal-name',
        'goal-target',
        'goal-saved',
        'goal-submit',
        'goal-list',
        'simulator-form',
        'scenario-type',
        'scenario-amount',
        'scenario-installments',
        'scenario-installments-field',
        'scenario-result',
        'mobile-add-button',
        'overview-status',
        'month-overview-title',
        'month-overview-subtitle',
        'overview-next-due',
        'overview-card-bill',
        'overview-reserve',
        'amount-hint',
        'toast',
        'sync-status',
        'auth-user-email',
        'auth-sign-out',
        'auth-modal',
        'auth-loading',
        'auth-form',
        'auth-mode-title',
        'auth-mode-subtitle',
        'auth-email',
        'auth-password',
        'auth-confirm-row',
        'auth-confirm-password',
        'auth-submit',
        'auth-toggle-mode',
        'auth-error'
    ].forEach((id) => {
        dom[toCamel(id)] = document.getElementById(id);
    });

    dom.tabButtons = Array.from(document.querySelectorAll('[data-tab]'));
    dom.tabPanels = Array.from(document.querySelectorAll('[data-panel]'));
}

function bindAuthEvents() {
    dom.authForm.addEventListener('submit', handleAuthSubmit);
    dom.authToggleMode.addEventListener('click', toggleAuthMode);
    dom.authSignOut.addEventListener('click', handleSignOut);
}

function bindAppEvents() {
    dom.tabButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });

    document.querySelectorAll('[data-quick-tab]').forEach((button) => {
        button.addEventListener('click', () => {
            setActiveTab(button.dataset.quickTab);
            if (button.dataset.focus) {
                const target = document.getElementById(button.dataset.focus);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    dom.monthFilter.addEventListener('change', () => {
        state.selectedMonth = dom.monthFilter.value || getMonthKey(getTodayDate());
        syncPlannedForMonth(state.selectedMonth, true);
        render();
    });

    dom.themeToggle.addEventListener('click', toggleTheme);
    dom.exportJson.addEventListener('click', exportData);
    dom.exportBackup.addEventListener('click', exportBackup);
    dom.restoreBackup.addEventListener('click', restoreLatestBackup);
    dom.integrityCheck.addEventListener('click', showDataIntegrityReport);
    dom.globalSearch.addEventListener('click', runGlobalSearch);
    dom.exportCsv.addEventListener('click', exportCsv);
    dom.closeMonth.addEventListener('click', showMonthClosingReport);
    dom.importJson.addEventListener('change', importData);
    dom.clearData.addEventListener('click', clearData);

    dom.type.addEventListener('change', toggleTransactionFields);
    dom.cardSelect.addEventListener('change', toggleTransactionFields);
    dom.cardPaymentMode.addEventListener('change', toggleTransactionFields);
    dom.desc.addEventListener('input', applyAutoClassification);
    dom.category.addEventListener('change', () => {
        state.categoryTouched = true;
    });

    dom.recurring.addEventListener('change', () => {
        dom.recurrenceOptions.classList.toggle('hidden', !dom.recurring.checked);
        toggleTransactionFields();
    });

    dom.transactionForm.addEventListener('submit', handleTransactionSubmit);
    dom.cancelEdit.addEventListener('click', resetTransactionForm);
    dom.transactionList.addEventListener('click', handleTransactionClick);

    [
        dom.searchFilter,
        dom.typeFilter,
        dom.statusFilter,
        dom.categoryFilter,
        dom.necessityFilter,
        dom.cardFilter,
        dom.tagFilter,
        dom.minFilter,
        dom.maxFilter,
        dom.dateStartFilter,
        dom.dateEndFilter
    ].forEach((input) => {
        input.addEventListener('input', renderHistory);
        input.addEventListener('change', renderHistory);
    });
    dom.resetFilters.addEventListener('click', resetFilters);

    dom.profileForm.addEventListener('submit', handleProfileSubmit);

    dom.reserveForm.addEventListener('submit', handleReserveSubmit);
    dom.reserveCancel.addEventListener('click', resetReserveForm);
    dom.reserveDepositForm.addEventListener('submit', handleReserveDeposit);
    dom.reserveList.addEventListener('click', handleReserveClick);

    dom.investmentEntryMarket.addEventListener('click', () => setInvestmentEntryMode('market'));
    dom.investmentEntryManual.addEventListener('click', () => setInvestmentEntryMode('manual'));
    dom.investmentType.addEventListener('change', () => {
        populateInvestmentAssetPresets();
        updateInvestmentModeUi();
    });
    dom.investmentAssetPreset.addEventListener('change', updateSelectedInvestmentAsset);
    dom.investmentQuantity.addEventListener('input', renderInvestmentMarketPreview);
    dom.investmentForm.addEventListener('submit', handleInvestmentSubmit);
    dom.investmentCancel.addEventListener('click', resetInvestmentForm);
    dom.investmentList.addEventListener('click', handleInvestmentClick);

    dom.plannedForm.addEventListener('submit', handlePlannedSubmit);
    dom.plannedCancel.addEventListener('click', resetPlannedForm);
    dom.syncPlanned.addEventListener('click', () => {
        const created = syncPlannedForMonth(state.selectedMonth, false);
        render();
        if (!created) showToast('As contas previstas deste mês já estão atualizadas.');
    });
    dom.payMonthBills.addEventListener('click', markSelectedMonthBillsPaid);
    dom.plannedList.addEventListener('click', handlePlannedClick);

    dom.cardForm.addEventListener('submit', handleCardSubmit);
    dom.cardCancel.addEventListener('click', resetCardForm);
    dom.cardList.addEventListener('click', handleCardClick);
    dom.goalForm.addEventListener('submit', handleGoalSubmit);
    dom.goalList.addEventListener('click', handleGoalClick);

    dom.scenarioType.addEventListener('change', () => {
        dom.scenarioInstallmentsField.classList.toggle('hidden', dom.scenarioType.value !== 'installment');
        runScenario();
    });
    dom.simulatorForm.addEventListener('submit', (event) => {
        event.preventDefault();
        runScenario();
    });
    [dom.scenarioAmount, dom.scenarioInstallments].forEach((input) => {
        input.addEventListener('input', runScenario);
    });

    dom.mobileAddButton.addEventListener('click', () => {
        setActiveTab('dashboard');
        dom.transactionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        dom.desc.focus();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushCloudSync();
    });

    window.addEventListener('pagehide', () => {
        flushCloudSync();
    });
}

function handleStartupError(error) {
    console.error('Falha ao iniciar o painel:', error);

    try {
        cacheDom();
        state.authReady = true;
        dom.authLoading.classList.add('hidden');
        dom.authForm.classList.remove('hidden');
        dom.authModal.classList.remove('hidden');
        showAuthError(`Erro ao iniciar o painel: ${error.message || error}`);
    } catch (innerError) {
        console.error('Falha adicional ao exibir erro de inicializacao:', innerError);
    }
}

async function ensureFirebaseApp() {
    if (FIREBASE_APP) return FIREBASE_APP;

    if (!firebaseAppModule) {
        firebaseAppModule = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js');
    }

    FIREBASE_APP = firebaseAppModule.initializeApp(FIREBASE_CONFIG);
    return FIREBASE_APP;
}

async function ensureFirebaseAnalytics() {
    const app = await ensureFirebaseApp();

    if (!firebaseAnalyticsModule) {
        firebaseAnalyticsModule = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js');
    }

    return { app, analytics: firebaseAnalyticsModule };
}

async function ensureFirebaseAuthServices() {
    const app = await ensureFirebaseApp();

    if (!firebaseAuthModule) {
        firebaseAuthModule = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js');
    }

    if (!firebaseFirestoreModule) {
        firebaseFirestoreModule = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js');
    }

    FIREBASE_AUTH = FIREBASE_AUTH || firebaseAuthModule.getAuth(app);
    FIREBASE_DB = FIREBASE_DB || firebaseFirestoreModule.getFirestore(app);

    return {
        app,
        auth: FIREBASE_AUTH,
        db: FIREBASE_DB,
        authModule: firebaseAuthModule,
        firestoreModule: firebaseFirestoreModule
    };
}

async function initializeAuthSession() {
    if (!AUTH_ENABLED) {
        state.authReady = true;
        state.authMode = 'login';
        hideAuthError();
        state.user = hasLocalTestSession() ? { ...DEV_ACCESS } : null;
        state.localDataOwner = DEV_ACCESS.uid;
        setSyncState(state.user ? 'Modo local/teste ativo' : 'Modo local/teste ativo', 'offline');
        renderAuthUi();
        return;
    }

    if (RUNNING_FROM_FILE) {
        state.authReady = true;
        setSyncState('Abra pelo localhost', 'error');
        renderAuthUi();
        showAuthError(`Abra o painel em ${LOCAL_APP_URL}. O Firebase precisa de http:// ou https:// para autenticar.`);
        return;
    }

    setSyncState('Verificando conta', 'checking');
    renderAuthUi();

    try {
        const { auth, authModule } = await ensureFirebaseAuthServices();
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
    } catch (error) {
        console.error('Falha ao configurar persistencia do login:', error);
    }

    const { auth, authModule } = await ensureFirebaseAuthServices();
    authModule.onAuthStateChanged(auth, async (user) => {
        await handleAuthStateChange(user);
    });
}

async function initializeAnalytics() {
    if (RUNNING_FROM_FILE) return;

    try {
        const { app, analytics } = await ensureFirebaseAnalytics();
        const supported = await analytics.isSupported();
        if (!supported) return;

        analyticsInstance = analytics.getAnalytics(app);
        trackAnalyticsEvent('panel_opened', {
            app_mode: AUTH_ENABLED ? 'firebase_auth' : 'local_dev',
            current_tab: state.activeTab
        });
    } catch (error) {
        console.warn('Analytics indisponivel neste ambiente:', error);
    }
}

async function handleAuthStateChange(user) {
    state.user = user;
    state.authReady = true;
    hideAuthError();

    if (!user) {
        state.authMode = 'login';
        resetFinanceState();
        setSyncState('Entre para sincronizar', 'offline');
        hydrateForms();
        toggleTransactionFields();
        render();
        renderAuthUi();
        return;
    }

    state.authMode = 'login';
    setSyncState('Carregando dados da nuvem', 'checking');
    renderAuthUi();

    try {
        await loadCloudStateForUser(user.uid);
        setSyncState('Sincronizado', 'synced');
    } catch (error) {
        console.error('Falha ao carregar dados do Firestore:', error);
        setSyncState('Erro ao carregar dados', 'error');
        showToast('Nao foi possivel carregar seus dados da nuvem.');
    }

    renderAuthUi();
}

function renderAuthUi() {
    const waitingAuth = !state.authReady;
    const loggedIn = Boolean(state.user);
    const registerMode = state.authMode === 'signup';

    if (!AUTH_ENABLED) {
        dom.authEmail.type = 'text';
        dom.authEmail.inputMode = 'text';
        dom.authEmail.placeholder = 'adm';
        dom.authPassword.placeholder = 'adm';
        dom.authConfirmPassword.placeholder = 'adm';

        if (!loggedIn) {
            dom.authEmail.value = DEV_ACCESS.email;
            dom.authPassword.value = DEV_ACCESS.password;
            dom.authConfirmPassword.value = DEV_ACCESS.password;
        }

        dom.authModal.classList.toggle('hidden', loggedIn && state.authReady);
        dom.authLoading.classList.add('hidden');
        dom.authForm.classList.remove('hidden');
        dom.authToggleMode.classList.add('hidden');
        dom.authConfirmRow.classList.add('hidden');
        dom.authUserEmail.classList.toggle('hidden', !loggedIn);
        dom.authSignOut.classList.toggle('hidden', !loggedIn);
        dom.authUserEmail.textContent = loggedIn ? `${DEV_ACCESS.email} (teste)` : '';
        dom.authModeTitle.textContent = 'Modo local/teste ativo';
        dom.authModeSubtitle.textContent = 'Use login adm e senha adm apenas no localhost. Em producao, o app usa Firebase.';
        dom.authSubmit.disabled = false;
        dom.authSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i><span>Entrar com adm</span>';
        updateSyncStatusElement();
        return;
    }

    dom.authEmail.type = 'email';
    dom.authEmail.inputMode = 'email';
    dom.authEmail.placeholder = 'voce@email.com';
    dom.authPassword.placeholder = 'Sua senha';
    dom.authConfirmPassword.placeholder = 'Repita a senha';

    dom.authModal.classList.toggle('hidden', loggedIn && state.authReady);
    dom.authLoading.classList.toggle('hidden', !waitingAuth);
    dom.authForm.classList.toggle('hidden', waitingAuth);
    dom.authToggleMode.classList.toggle('hidden', waitingAuth);
    dom.authConfirmRow.classList.toggle('hidden', !registerMode);

    dom.authUserEmail.classList.toggle('hidden', !loggedIn);
    dom.authSignOut.classList.toggle('hidden', !loggedIn);

    if (loggedIn) {
        dom.authUserEmail.textContent = state.user.email || 'Conta conectada';
    } else {
        dom.authUserEmail.textContent = '';
    }

    if (RUNNING_FROM_FILE) {
        dom.authModeTitle.textContent = 'Abra o painel pelo localhost';
        dom.authModeSubtitle.textContent = `Voce abriu o painel direto do arquivo local. Para entrar ou criar conta, use ${LOCAL_APP_URL}.`;
        dom.authSubmit.innerHTML = '<i class="fa-solid fa-lock"></i><span>Login indisponivel neste modo</span>';
        dom.authSubmit.disabled = true;
        dom.authToggleMode.classList.add('hidden');
        updateSyncStatusElement();
        return;
    }

    dom.authSubmit.disabled = false;

    dom.authModeTitle.textContent = registerMode ? 'Criar sua conta' : 'Entrar na sua conta';
    dom.authModeSubtitle.textContent = registerMode
        ? 'Crie uma conta para guardar seus dados com seguranca e sincronizar em qualquer dispositivo.'
        : 'Use seu email e senha para acessar e sincronizar seu painel entre PC e celular.';
    dom.authSubmit.innerHTML = registerMode
        ? '<i class="fa-solid fa-user-plus"></i><span>Criar conta</span>'
        : '<i class="fa-solid fa-right-to-bracket"></i><span>Entrar</span>';
    dom.authToggleMode.textContent = registerMode ? 'Ja tenho conta' : 'Criar conta nova';

    updateSyncStatusElement();
}

function toggleAuthMode() {
    state.authMode = state.authMode === 'login' ? 'signup' : 'login';
    hideAuthError();
    dom.authForm.reset();
    renderAuthUi();
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    hideAuthError();

    if (!AUTH_ENABLED) {
        const email = String(dom.authEmail.value || '').trim();
        const password = dom.authPassword.value || '';

        if (email !== DEV_ACCESS.email || password !== DEV_ACCESS.password) {
            showAuthError('Use login adm e senha adm para os testes.');
            setSyncState('Login de teste invalido', 'error');
            renderAuthUi();
            return;
        }

        persistLocalTestSession(true);
        state.user = { ...DEV_ACCESS };
        state.authReady = true;
        state.authMode = 'login';
        state.localDataOwner = DEV_ACCESS.uid;
        setSyncState('Modo local/teste ativo', 'offline');
        renderAuthUi();
        showToast('Login de teste liberado.');
        return;
    }

    const email = String(dom.authEmail.value || '').trim();
    const password = dom.authPassword.value || '';
    const confirmPassword = dom.authConfirmPassword.value || '';

    if (!email || !password) {
        showAuthError('Preencha email e senha.');
        return;
    }

    if (state.authMode === 'signup' && password !== confirmPassword) {
        showAuthError('As senhas nao conferem.');
        return;
    }

    dom.authSubmit.disabled = true;
    dom.authToggleMode.disabled = true;
    setSyncState(state.authMode === 'signup' ? 'Criando conta' : 'Entrando', 'checking');
    renderAuthUi();

    try {
        const { auth, authModule } = await ensureFirebaseAuthServices();
        if (state.authMode === 'signup') {
            await authModule.createUserWithEmailAndPassword(auth, email, password);
        } else {
            await authModule.signInWithEmailAndPassword(auth, email, password);
        }
        dom.authForm.reset();
    } catch (error) {
        console.error('Erro de autenticacao:', error);
        showAuthError(getAuthErrorMessage(error));
        setSyncState('Falha no login', 'error');
    } finally {
        dom.authSubmit.disabled = false;
        dom.authToggleMode.disabled = false;
        renderAuthUi();
    }
}

async function handleSignOut() {
    if (!AUTH_ENABLED) {
        persistLocalTestSession(false);
        state.user = null;
        state.authMode = 'login';
        hideAuthError();
        setSyncState('Modo local/teste ativo', 'offline');
        renderAuthUi();
        showToast('Sessao de teste encerrada.');
        return;
    }

    try {
        const { auth, authModule } = await ensureFirebaseAuthServices();
        await flushCloudSync();
        clearPersistedFinanceData(true);
        await authModule.signOut(auth);
        showToast('Sessao encerrada.');
    } catch (error) {
        console.error('Erro ao sair:', error);
        showToast('Nao foi possivel sair agora.');
    }
}

function getUserStateRef(uid) {
    return firebaseFirestoreModule.doc(FIREBASE_DB, 'users', uid, 'app', 'state');
}

function hasLocalTestSession() {
    return localStorage.getItem(LOCAL_TEST_AUTH_KEY) === '1';
}

function persistLocalTestSession(active) {
    if (active) {
        localStorage.setItem(LOCAL_TEST_AUTH_KEY, '1');
        return;
    }

    localStorage.removeItem(LOCAL_TEST_AUTH_KEY);
}

async function loadCloudStateForUser(uid) {
    const snapshot = await firebaseFirestoreModule.getDoc(getUserStateRef(uid));

    if (snapshot.exists()) {
        const payload = snapshot.data();
        const cloudUpdatedAt = getPayloadUpdatedAtMs(payload);
        const localIsSameAccount = !state.localDataOwner || state.localDataOwner === uid;

        if (localIsSameAccount && hasMeaningfulLocalData() && state.dataVersion > cloudUpdatedAt) {
            state.localDataOwner = uid;
            await flushCloudSync();
            persistLocalStateOnly();
            return;
        }

        applyCloudPayload(payload);
        persistLocalStateOnly();
        return;
    }

    if (hasMeaningfulLocalData() && (!state.localDataOwner || state.localDataOwner === uid)) {
        state.localDataOwner = uid;
        await flushCloudSync();
        persistLocalStateOnly();
        return;
    }

    resetFinanceState();
    state.localDataOwner = uid;
    state.dataVersion = Date.now();
    hydrateForms();
    toggleTransactionFields();
    render();
    persistLocalStateOnly();
}

function applyCloudPayload(payload) {
    const incoming = payload && typeof payload === 'object' ? payload : {};
    const prefs = incoming.prefs && typeof incoming.prefs === 'object' ? incoming.prefs : {};

    state.applyingCloudState = true;
    state.transactions = Array.isArray(incoming.transactions) ? incoming.transactions.map(normalizeTransaction).filter(Boolean) : [];
    state.profile = normalizeProfile(incoming.profile || DEFAULT_PROFILE);
    state.reserves = Array.isArray(incoming.reserves) ? incoming.reserves.map(normalizeReserve).filter(Boolean) : [];
    state.plannedBills = Array.isArray(incoming.plannedBills) ? incoming.plannedBills.map(normalizePlannedBill).filter(Boolean) : [];
    state.investments = Array.isArray(incoming.investments) ? incoming.investments.map(normalizeInvestment).filter(Boolean) : [];
    state.cards = Array.isArray(incoming.cards) ? incoming.cards.map(normalizeCard).filter(Boolean) : [];
    state.goals = Array.isArray(incoming.goals) ? incoming.goals.map(normalizeGoal).filter(Boolean) : [];
    state.theme = prefs.theme === 'dark' ? 'dark' : 'light';
    state.activeTab = prefs.activeTab || 'dashboard';
    state.selectedMonth = getMonthKey(getTodayDate());
    state.dataVersion = getPayloadUpdatedAtMs(incoming) || Date.now();
    state.localDataOwner = state.user ? state.user.uid : state.localDataOwner;
    state.cloudSyncPending = false;
    state.applyingCloudState = false;

    dom.monthFilter.value = state.selectedMonth;
    applyTheme();
    hydrateForms();
    setActiveTab(state.activeTab, false);
    syncPlannedForMonth(state.selectedMonth, true);
    toggleTransactionFields();
    render();
}

function buildCloudPayload() {
    const version = state.dataVersion || Date.now();
    state.dataVersion = version;
    return {
        appVersion: APP_VERSION,
        schemaVersion: SCHEMA_VERSION,
        updatedAtMs: version,
        transactions: state.transactions,
        profile: state.profile,
        reserves: state.reserves,
        plannedBills: state.plannedBills,
        investments: state.investments,
        cards: state.cards,
        goals: state.goals,
        prefs: {
            theme: state.theme,
            activeTab: state.activeTab
        }
    };
}

function queueCloudSync(delay = 250) {
    if (!AUTH_ENABLED) {
        setSyncState('Salvo neste navegador', 'offline');
        return;
    }

    if (!state.user || state.applyingCloudState) return;

    window.clearTimeout(state.cloudSyncTimer);
    state.cloudSyncPending = true;
    setSyncState('Salvando na nuvem', 'saving');
    state.cloudSyncTimer = window.setTimeout(() => {
        flushCloudSync();
    }, delay);
}

async function flushCloudSync() {
    if (!AUTH_ENABLED) return;
    if (!state.user || state.applyingCloudState) return;

    try {
        window.clearTimeout(state.cloudSyncTimer);
        state.cloudSyncTimer = null;
        state.localDataOwner = state.user.uid;
        await firebaseFirestoreModule.setDoc(getUserStateRef(state.user.uid), {
            ...buildCloudPayload(),
            updatedAt: firebaseFirestoreModule.serverTimestamp()
        }, { merge: true });
        state.cloudSyncPending = false;
        state.lastSyncedAt = Date.now();
        setSyncState('Sincronizado', 'synced');
    } catch (error) {
        console.error('Erro ao sincronizar com Firestore:', error);
        state.cloudSyncPending = true;
        setSyncState('Erro ao sincronizar', 'error');
    }
}

function setSyncState(message, status) {
    state.cloudSyncMessage = message;
    state.cloudSyncState = status;
    updateSyncStatusElement();
}

function trackAnalyticsEvent(name, params = {}) {
    if (!analyticsInstance || !firebaseAnalyticsModule) return;

    try {
        firebaseAnalyticsModule.logEvent(analyticsInstance, name, params);
    } catch (error) {
        console.warn(`Falha ao enviar evento ${name}:`, error);
    }
}

function updateSyncStatusElement() {
    if (!dom.syncStatus) return;
    dom.syncStatus.textContent = state.cloudSyncMessage;
    dom.syncStatus.className = `sync-pill ${state.cloudSyncState}`;
    const lastSync = state.lastSyncedAt ? `Última sincronização: ${formatDateTime(state.lastSyncedAt)}` : 'Última sincronização: ainda não realizada';
    dom.syncStatus.title = `${state.cloudSyncMessage}. ${lastSync}.`;
}

function showAuthError(message) {
    dom.authError.textContent = message;
    dom.authError.classList.remove('hidden');
}

function hideAuthError() {
    dom.authError.textContent = '';
    dom.authError.classList.add('hidden');
}

function getAuthErrorMessage(error) {
    const code = error && error.code ? error.code : '';

    if (code.includes('operation-not-supported-in-this-environment') || code.includes('web-storage-unsupported')) {
        return `Abra o painel em ${LOCAL_APP_URL}. O Firebase Auth nao funciona corretamente direto do arquivo local.`;
    }
    if (code.includes('unauthorized-domain') || code.includes('app-not-authorized')) {
        return 'Adicione localhost em Authentication > Settings > Authorized domains no Firebase.';
    }
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        return 'Email ou senha invalidos.';
    }
    if (code.includes('email-already-in-use')) {
        return 'Ja existe uma conta com esse email.';
    }
    if (code.includes('weak-password')) {
        return 'Use uma senha com pelo menos 6 caracteres.';
    }
    if (code.includes('invalid-email')) {
        return 'Digite um email valido.';
    }
    if (code.includes('too-many-requests')) {
        return 'Muitas tentativas seguidas. Aguarde um pouco e tente de novo.';
    }

    return 'Nao foi possivel concluir a autenticacao agora.';
}

function getPayloadUpdatedAtMs(payload) {
    if (!payload || typeof payload !== 'object') return 0;

    const directValue = Number(payload.updatedAtMs);
    if (Number.isFinite(directValue) && directValue > 0) return directValue;

    if (payload.updatedAt && typeof payload.updatedAt.toMillis === 'function') {
        return payload.updatedAt.toMillis();
    }

    return 0;
}

function markLocalChange() {
    state.dataVersion = Date.now();
    if (state.user) state.localDataOwner = state.user.uid;
}

function hasMeaningfulLocalData() {
    return Boolean(
        state.transactions.length
        || state.reserves.length
        || state.plannedBills.length
        || state.investments.length
        || state.cards.length
        || state.profile.name
        || state.profile.expectedIncome
    );
}

function resetFinanceState() {
    state.transactions = [];
    state.profile = { ...DEFAULT_PROFILE };
    state.reserves = [];
    state.plannedBills = [];
    state.investments = [];
    state.cards = [];
    state.goals = [];
    state.editingId = null;
    state.editingReserveId = null;
    state.editingPlannedId = null;
    state.editingInvestmentId = null;
    state.editingCardId = null;
    state.categoryTouched = false;
    state.selectedMonth = getMonthKey(getTodayDate());
    state.dataVersion = 0;
    state.localDataOwner = state.user ? state.user.uid : null;
    state.investmentMarketData = {};
    state.investmentMarketStatus = 'idle';
    state.investmentMarketError = '';
    state.investmentMarketFetchedAt = 0;
    state.investmentMarketRequestKey = '';
    dom.monthFilter.value = state.selectedMonth;
    dom.date.value = getTodayDate();
}

function persistLocalStateOnly() {
    const version = state.dataVersion || Date.now();
    const ownerUid = state.user ? state.user.uid : state.localDataOwner;

    state.dataVersion = version;
    state.localDataOwner = ownerUid || null;

    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.profile));
    localStorage.setItem(STORAGE_KEYS.reserves, JSON.stringify(state.reserves));
    localStorage.setItem(STORAGE_KEYS.plannedBills, JSON.stringify(state.plannedBills));
    localStorage.setItem(STORAGE_KEYS.investments, JSON.stringify(state.investments));
    localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(state.cards));
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(state.goals));
    localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify({
        theme: state.theme,
        activeTab: state.activeTab
    }));
    localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify({
        dataVersion: version,
        ownerUid: ownerUid || null
    }));
}

function clearPersistedFinanceData(keepPrefs = false) {
    localStorage.removeItem(STORAGE_KEYS.transactions);
    localStorage.removeItem(STORAGE_KEYS.profile);
    localStorage.removeItem(STORAGE_KEYS.reserves);
    localStorage.removeItem(STORAGE_KEYS.plannedBills);
    localStorage.removeItem(STORAGE_KEYS.investments);
    localStorage.removeItem(STORAGE_KEYS.cards);
    localStorage.removeItem(STORAGE_KEYS.goals);
    localStorage.removeItem(STORAGE_KEYS.meta);
    if (!keepPrefs) localStorage.removeItem(STORAGE_KEYS.prefs);
}

function loadState() {
    state.transactions = loadTransactions();
    state.profile = normalizeProfile(loadJson(STORAGE_KEYS.profile, DEFAULT_PROFILE));
    state.reserves = loadArray(STORAGE_KEYS.reserves).map(normalizeReserve).filter(Boolean);
    state.plannedBills = loadArray(STORAGE_KEYS.plannedBills).map(normalizePlannedBill).filter(Boolean);
    state.investments = loadArray(STORAGE_KEYS.investments).map(normalizeInvestment).filter(Boolean);
    state.cards = loadArray(STORAGE_KEYS.cards).map(normalizeCard).filter(Boolean);
    state.goals = loadArray(STORAGE_KEYS.goals).map(normalizeGoal).filter(Boolean);

    const prefs = loadJson(STORAGE_KEYS.prefs, {});
    state.theme = prefs.theme === 'dark' ? 'dark' : 'light';
    state.activeTab = prefs.activeTab || 'dashboard';

    const meta = loadJson(STORAGE_KEYS.meta, {});
    state.dataVersion = Number.isFinite(Number(meta.dataVersion)) ? Number(meta.dataVersion) : 0;
    state.localDataOwner = meta.ownerUid ? String(meta.ownerUid) : null;
}

function loadTransactions() {
    const saved = loadJson(STORAGE_KEYS.transactions, []);
    const rows = Array.isArray(saved) ? saved : saved.transactions;
    if (!Array.isArray(rows)) return [];
    return rows.map(normalizeTransaction).filter(Boolean);
}

function loadArray(key) {
    const saved = loadJson(key, []);
    return Array.isArray(saved) ? saved : [];
}

function loadJson(key, fallback) {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error(`Erro ao carregar ${key}:`, error);
        return fallback;
    }
}

function saveTransactions() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('transactions_saved', {
        item_count: state.transactions.length
    });
}

function saveProfile() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('profile_saved', {
        objective: state.profile.objective || 'organizar'
    });
}

function saveReserves() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('reserves_saved', {
        item_count: state.reserves.length
    });
}

function saveInvestments() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('investments_saved', {
        item_count: state.investments.length
    });
}

function savePlannedBills() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('planned_bills_saved', {
        item_count: state.plannedBills.length
    });
}

function saveCards() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('cards_saved', {
        item_count: state.cards.length
    });
}

function saveGoals() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
    trackAnalyticsEvent('goals_saved', {
        item_count: state.goals.length
    });
}

function savePrefs() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync();
}

function saveAll() {
    markLocalChange();
    persistLocalStateOnly();
    queueCloudSync(0);
    trackAnalyticsEvent('full_dataset_saved', {
        transaction_count: state.transactions.length,
        reserve_count: state.reserves.length,
        investment_count: state.investments.length,
        planned_count: state.plannedBills.length,
        card_count: state.cards.length,
        goal_count: state.goals.length
    });
}

function normalizeProfile(profile) {
    const incoming = profile && typeof profile === 'object' ? profile : {};
    const legacyClosingDay = Object.prototype.hasOwnProperty.call(incoming, 'closingDay')
        ? clampInteger(incoming.closingDay, 1, 31, 1)
        : null;
    const legacyReserveMonths = Object.prototype.hasOwnProperty.call(incoming, 'reserveMonthsTarget')
        ? clampInteger(incoming.reserveMonthsTarget, 1, 24, 6)
        : null;

    return {
        ...DEFAULT_PROFILE,
        name: String(incoming.name || '').trim(),
        type: 'pessoal',
        expectedIncome: normalizeMoney(incoming.expectedIncome),
        objective: OBJECTIVE_LABELS[incoming.objective] ? incoming.objective : 'organizar',
        reviewMoment: REVIEW_MOMENT_LABELS[incoming.reviewMoment]
            ? incoming.reviewMoment
            : getLegacyReviewMoment(legacyClosingDay),
        mainReserveId: incoming.mainReserveId ? String(incoming.mainReserveId) : '',
        payday: normalizeOptionalDay(incoming.payday),
        monthlySavingsGoal: normalizeMoney(incoming.monthlySavingsGoal),
        reserveLevel: RESERVE_LEVELS[incoming.reserveLevel]
            ? incoming.reserveLevel
            : getLegacyReserveLevel(legacyReserveMonths),
        maxCommitment: clampInteger(incoming.maxCommitment, 50, 100, 80)
    };
}

function getLegacyReviewMoment(day) {
    if (day >= 1 && day <= 10) return 'start';
    if (day >= 11 && day <= 20) return 'middle';
    if (day >= 21 && day <= 31) return 'end';
    return DEFAULT_PROFILE.reviewMoment;
}

function getLegacyReserveLevel(months) {
    if (months === 1) return 'basic';
    if (months >= 2 && months <= 3) return 'safe';
    if (months >= 4) return 'strong';
    return DEFAULT_PROFILE.reserveLevel;
}

function getReviewMomentLabel(moment) {
    return REVIEW_MOMENT_LABELS[moment] || REVIEW_MOMENT_LABELS[DEFAULT_PROFILE.reviewMoment];
}

function getReviewMomentDay(moment) {
    return REVIEW_MOMENT_DAYS[moment] || REVIEW_MOMENT_DAYS[DEFAULT_PROFILE.reviewMoment];
}

function getReserveLevelConfig(level) {
    return RESERVE_LEVELS[level] || RESERVE_LEVELS[DEFAULT_PROFILE.reserveLevel];
}

function normalizeReserve(reserve) {
    if (!reserve || typeof reserve !== 'object') return null;
    const target = normalizeMoney(reserve.target);
    const saved = normalizeMoney(reserve.saved);

    return {
        id: String(reserve.id || createId()),
        name: String(reserve.name || 'Reserva').trim(),
        target: target > 0 ? target : 1,
        saved: Math.min(saved, target > 0 ? target : saved),
        monthlyGoal: normalizeMoney(reserve.monthlyGoal),
        createdAt: reserve.createdAt || new Date().toISOString(),
        updatedAt: reserve.updatedAt || new Date().toISOString()
    };
}

function normalizeInvestment(investment) {
    if (!investment || typeof investment !== 'object') return null;

    const initialAmount = normalizeMoney(
        investment.initialAmount !== undefined && investment.initialAmount !== null
            ? investment.initialAmount
            : investment.amount
    );
    if (initialAmount <= 0) return null;

    const type = INVESTMENT_TYPE_LABELS[investment.type] ? investment.type : 'other';
    const quantity = normalizeQuantity(
        investment.quantity !== undefined && investment.quantity !== null
            ? investment.quantity
            : ''
    );
    const rateRaw = parseLocaleNumber(
        investment.monthlyRate !== undefined && investment.monthlyRate !== null
            ? investment.monthlyRate
            : 0
    );
    const monthlyRate = Number.isFinite(rateRaw) ? Math.max(-99.99, Math.min(999.99, Math.round(rateRaw * 100) / 100)) : 0;

    return {
        id: String(investment.id || createId()),
        name: String(investment.name || 'Investimento').trim(),
        type,
        code: String(investment.code || '').trim().toUpperCase(),
        quantity,
        initialAmount,
        monthlyContribution: normalizeMoney(
            investment.monthlyContribution !== undefined && investment.monthlyContribution !== null
                ? investment.monthlyContribution
                : investment.monthlyDeposit
        ),
        monthlyRate,
        startDate: normalizeDateInput(investment.startDate || investment.date || getTodayDate()),
        notes: String(investment.notes || '').trim(),
        createdAt: investment.createdAt || new Date().toISOString(),
        updatedAt: investment.updatedAt || new Date().toISOString()
    };
}

function normalizePlannedBill(bill) {
    if (!bill || typeof bill !== 'object') return null;
    const amount = normalizeMoney(bill.amount);
    if (amount <= 0) return null;
    const category = CATEGORY_LABELS[bill.category] ? bill.category : 'outros';
    const necessity = bill.necessity === 'desire' ? 'desire' : 'essential';
    const fallbackDueDate = bill.day ? buildBillDate(getMonthKey(getTodayDate()), clampInteger(bill.day, 1, 31, 1)) : getTodayDate();
    const dueDate = normalizeDateInput(bill.dueDate || bill.date || fallbackDueDate);
    const repeatMonthly = bill.repeatMonthly === undefined ? !bill.dueDate : Boolean(bill.repeatMonthly);

    return {
        id: String(bill.id || createId()),
        name: String(bill.name || 'Conta prevista').trim(),
        amount,
        dueDate,
        day: parseDate(dueDate).getDate(),
        repeatMonthly,
        category,
        necessity,
        cardId: bill.cardId ? String(bill.cardId) : '',
        active: bill.active === undefined ? true : Boolean(bill.active),
        createdAt: bill.createdAt || new Date().toISOString(),
        updatedAt: bill.updatedAt || new Date().toISOString()
    };
}

function normalizeCard(card) {
    if (!card || typeof card !== 'object') return null;
    const limit = normalizeMoney(card.limit);
    if (limit <= 0) return null;

    return {
        id: String(card.id || createId()),
        name: String(card.name || 'Cartão').trim(),
        limit,
        closingDay: clampInteger(card.closingDay, 1, 31, 1),
        dueDay: clampInteger(card.dueDay, 1, 31, 10),
        color: /^#[0-9a-fA-F]{6}$/.test(card.color || '') ? card.color : '#2563eb',
        createdAt: card.createdAt || new Date().toISOString(),
        updatedAt: card.updatedAt || new Date().toISOString()
    };
}

function normalizeGoal(goal) {
    if (!goal || typeof goal !== 'object') return null;
    const target = normalizeMoney(goal.target);
    if (target <= 0) return null;
    const saved = normalizeMoney(goal.saved);

    return {
        id: String(goal.id || createId()),
        name: String(goal.name || 'Meta financeira').trim(),
        target,
        saved: Math.min(saved, target),
        createdAt: goal.createdAt || new Date().toISOString(),
        updatedAt: goal.updatedAt || new Date().toISOString()
    };
}

function normalizeTags(value) {
    const raw = Array.isArray(value) ? value.join(',') : String(value || '');
    return raw
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .filter((tag, index, rows) => rows.indexOf(tag) === index)
        .slice(0, 8);
}

function normalizeTransaction(transaction) {
    if (!transaction || !transaction.desc || !transaction.date) return null;

    const amount = normalizeMoney(transaction.amount);
    if (amount <= 0) return null;

    const date = String(transaction.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const type = transaction.type === 'income' ? 'income' : 'expense';
    const category = CATEGORY_LABELS[transaction.category] ? transaction.category : 'outros';
    const necessity = transaction.necessity === 'desire' ? 'desire' : 'essential';

    return {
        id: String(transaction.id || createId()),
        desc: String(transaction.desc).trim(),
        amount,
        type,
        date,
        category: type === 'expense' ? category : null,
        necessity: type === 'expense' ? necessity : null,
        paid: transaction.paid === undefined
            ? resolvePaid({
                type,
                date,
                cardId: type === 'expense' && transaction.cardId ? String(transaction.cardId) : '',
                plannedBillId: type === 'expense' && transaction.plannedBillId ? String(transaction.plannedBillId) : '',
                installmentGroupId: transaction.installmentGroupId || null
            }, 'auto')
            : Boolean(transaction.paid),
        cardId: type === 'expense' && transaction.cardId ? String(transaction.cardId) : '',
        plannedBillId: type === 'expense' && transaction.plannedBillId ? String(transaction.plannedBillId) : '',
        reserveContributionId: type === 'expense' && transaction.reserveContributionId ? String(transaction.reserveContributionId) : '',
        tags: normalizeTags(transaction.tags),
        virtual: Boolean(transaction.virtual),
        installmentGroupId: transaction.installmentGroupId || null,
        installmentIndex: transaction.installmentIndex || null,
        installmentTotal: transaction.installmentTotal || null,
        installmentTotalAmount: transaction.installmentTotalAmount || null,
        recurringGroupId: transaction.recurringGroupId || null,
        recurringIndex: transaction.recurringIndex || null,
        recurringTotal: transaction.recurringTotal || null,
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString()
    };
}

function hydrateForms() {
    dom.profileName.value = state.profile.name;
    dom.profileIncome.value = state.profile.expectedIncome || '';
    dom.profileObjective.value = state.profile.objective;
    dom.profileReviewMoment.value = state.profile.reviewMoment;
    dom.profilePayday.value = state.profile.payday || '';
    dom.profileSavingsGoal.value = state.profile.monthlySavingsGoal || '';
    dom.profileMaxCommitment.value = state.profile.maxCommitment;
    dom.profileReserveLevel.value = state.profile.reserveLevel;
    dom.plannedDueDate.value = getTodayDate();
    dom.investmentStartDate.value = getTodayDate();
    dom.cardClosing.value = 1;
    dom.cardDue.value = 10;
    dom.scenarioInstallmentsField.classList.toggle('hidden', dom.scenarioType.value !== 'installment');
    populateDynamicSelects();
    updateInvestmentModeUi();
}

function populateDynamicSelects() {
    populateCardSelects();
    populateReserveSelects();
    populateInvestmentAssetPresets();
}

function populateCardSelects() {
    const selectedCard = dom.cardSelect.value;
    const selectedPlannedCard = dom.plannedCardSelect.value;
    const selectedFilter = dom.cardFilter.value;

    const cardOptions = [{ value: '', label: 'Sem cartão' }].concat(state.cards.map((card) => ({
        value: card.id,
        label: card.name
    })));

    fillSelect(dom.cardSelect, cardOptions);
    fillSelect(dom.plannedCardSelect, cardOptions);

    fillSelect(dom.cardFilter, [
        { value: 'all', label: 'Cartões' },
        { value: 'none', label: 'Sem cartão' }
    ].concat(state.cards.map((card) => ({
        value: card.id,
        label: card.name
    }))));

    dom.cardSelect.value = state.cards.some((card) => card.id === selectedCard) ? selectedCard : '';
    dom.plannedCardSelect.value = state.cards.some((card) => card.id === selectedPlannedCard) ? selectedPlannedCard : '';
    dom.cardFilter.value = selectedFilter === 'none' || selectedFilter === 'all' || state.cards.some((card) => card.id === selectedFilter) ? selectedFilter : 'all';
}

function populateReserveSelects() {
    const options = [{ value: '', label: 'Nenhuma reserva' }].concat(state.reserves.map((reserve) => ({
        value: reserve.id,
        label: reserve.name
    })));

    fillSelect(dom.profileMainReserve, options);
    dom.profileMainReserve.value = state.reserves.some((reserve) => reserve.id === state.profile.mainReserveId) ? state.profile.mainReserveId : '';

    fillSelect(dom.reserveDepositSelect, state.reserves.length
        ? state.reserves.map((reserve) => ({ value: reserve.id, label: reserve.name }))
        : [{ value: '', label: 'Crie uma reserva primeiro' }]);

    fillSelect(dom.reserveLinkSelect, [{ value: '', label: 'Não vincular' }].concat(state.reserves.map((reserve) => ({
        value: reserve.id,
        label: reserve.name
    }))));
}

function fillSelect(select, options) {
    const previous = select.value;
    select.innerHTML = '';
    options.forEach((option) => {
        const element = document.createElement('option');
        element.value = option.value;
        element.textContent = option.label;
        select.appendChild(element);
    });
    if (options.some((option) => option.value === previous)) {
        select.value = previous;
    }
}

function populateInvestmentAssetPresets() {
    const type = dom.investmentType.value;
    const presets = INVESTMENT_MARKET_PRESETS[type] || [];
    const selected = dom.investmentAssetPreset.value || dom.investmentCode.value;

    fillSelect(dom.investmentAssetPreset, presets.map((asset) => ({
        value: asset.code,
        label: `${asset.code} - ${asset.name}`
    })));

    if (presets.some((asset) => asset.code === selected)) {
        dom.investmentAssetPreset.value = selected;
    } else if (presets.length) {
        dom.investmentAssetPreset.value = presets[0].code;
    }

    updateSelectedInvestmentAsset();
}

function setInvestmentEntryMode(mode) {
    state.investmentEntryMode = mode === 'manual' ? 'manual' : 'market';
    updateInvestmentModeUi();
}

function updateInvestmentModeUi() {
    const marketMode = state.investmentEntryMode !== 'manual';

    dom.investmentEntryMarket.classList.toggle('active', marketMode);
    dom.investmentEntryManual.classList.toggle('active', !marketMode);
    dom.investmentEntryMarket.setAttribute('aria-pressed', String(marketMode));
    dom.investmentEntryManual.setAttribute('aria-pressed', String(!marketMode));
    dom.investmentMarketFields.classList.toggle('hidden', !marketMode);
    dom.investmentManualFields.classList.toggle('hidden', marketMode);
    dom.investmentTypeLabel.textContent = marketMode ? 'Categoria monitorada' : 'Tipo de investimento';

    fillSelect(dom.investmentType, marketMode
        ? [
            { value: 'currency', label: 'Moeda estrangeira' },
            { value: 'crypto', label: 'Criptomoeda' }
        ]
        : [
            { value: 'savings', label: 'Poupança' },
            { value: 'fixed_income', label: 'Renda fixa' },
            { value: 'other', label: 'Outro investimento' }
        ]);

    if (marketMode && !['currency', 'crypto'].includes(dom.investmentType.value)) {
        dom.investmentType.value = 'currency';
    }
    if (!marketMode && ['currency', 'crypto'].includes(dom.investmentType.value)) {
        dom.investmentType.value = 'fixed_income';
    }

    dom.investmentName.required = !marketMode;
    dom.investmentQuantity.required = marketMode;
    dom.investmentRate.required = !marketMode;

    if (marketMode) {
        populateInvestmentAssetPresets();
        return;
    }

    dom.investmentCode.value = '';
    renderInvestmentMarketPreview();
}

function getSelectedInvestmentPreset() {
    const presets = INVESTMENT_MARKET_PRESETS[dom.investmentType.value] || [];
    return presets.find((asset) => asset.code === dom.investmentAssetPreset.value) || presets[0] || null;
}

function updateSelectedInvestmentAsset() {
    const asset = getSelectedInvestmentPreset();
    if (!asset) {
        dom.investmentCode.value = '';
        renderInvestmentMarketPreview();
        return;
    }

    dom.investmentCode.value = asset.code;
    dom.investmentName.value = asset.name;
    renderInvestmentMarketPreview();
}

function renderInvestmentMarketPreview() {
    if (!dom.investmentMarketPreview) return;

    if (state.investmentEntryMode === 'manual') {
        dom.investmentMarketPreview.innerHTML = '';
        return;
    }

    const asset = getSelectedInvestmentPreset();
    if (!asset) {
        dom.investmentMarketPreview.innerHTML = '<p>Escolha um ativo para acompanhar.</p>';
        return;
    }

    const symbol = `${asset.code}-BRL`;
    const marketData = state.investmentMarketData[symbol];
    const quantity = normalizeQuantity(dom.investmentQuantity.value);
    const estimatedValue = marketData && quantity > 0 ? quantity * marketData.bid : 0;
    const quoteLabel = marketData ? formatCurrency(marketData.bid) : 'Cotação será buscada após salvar';
    const changeLabel = marketData && Number.isFinite(marketData.pctChange)
        ? formatPercent(marketData.pctChange)
        : 'Aguardando API';

    dom.investmentMarketPreview.innerHTML = `
        <div>
            <strong>${escapeHtml(asset.code)}</strong>
            <span>${escapeHtml(asset.name)}</span>
        </div>
        <div>
            <strong>${quoteLabel}</strong>
            <span>${escapeHtml(asset.note || 'Cotação em BRL pela AwesomeAPI')}</span>
        </div>
        <div>
            <strong>${changeLabel}</strong>
            <span>Variação recente</span>
        </div>
        <div>
            <strong>${estimatedValue > 0 ? formatCurrency(estimatedValue) : 'Informe a quantidade'}</strong>
            <span>Valor aproximado pela cotação atual</span>
        </div>
    `;
}

function setActiveTab(tab, persist = true) {
    state.activeTab = tab || 'dashboard';

    dom.tabButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === state.activeTab);
    });

    dom.tabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.panel === state.activeTab);
    });

    if (persist) {
        savePrefs();
        trackAnalyticsEvent('tab_changed', {
            tab_name: state.activeTab
        });
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    savePrefs();
    trackAnalyticsEvent('theme_toggled', {
        theme_mode: state.theme
    });
}

function applyTheme() {
    document.body.classList.toggle('dark-mode', state.theme === 'dark');
    dom.themeToggle.innerHTML = state.theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

function handleTransactionSubmit(event) {
    event.preventDefault();
    hideToast();

    const desc = dom.desc.value.trim();
    const amount = normalizeMoney(dom.amount.value);
    const tags = normalizeTags(dom.tags.value);
    const selectedType = dom.type.value;
    const date = dom.date.value;
    const paidMode = dom.paid.value;
    const linkedReserveId = dom.reserveLinkSelect.value;
    const isExpense = selectedType === 'expense' || selectedType === 'installment';
    const purchaseMode = getPurchaseMode(selectedType);
    const isInstallmentPurchase = shouldCreateInstallments(selectedType);

    if (!desc || !Number.isFinite(amount) || amount <= 0 || !date) {
        showToast('Preencha descrição, valor e data corretamente.');
        return;
    }

    if (purchaseMode === 'installment' && !dom.cardSelect.value) {
        showToast('Escolha um cartão para criar a compra parcelada.');
        return;
    }

    const baseTransaction = {
        desc,
        amount,
        type: selectedType === 'income' ? 'income' : 'expense',
        date,
        category: isExpense ? dom.category.value : null,
        necessity: isExpense ? dom.necessity.value : null,
        cardId: isExpense && purchaseMode !== 'booklet' ? dom.cardSelect.value : '',
        reserveContributionId: linkedReserveId || '',
        tags
    };

    if (state.editingId) {
        updateTransaction(baseTransaction, paidMode);
        return;
    }

    if (isInstallmentPurchase) {
        const created = createInstallments(baseTransaction, paidMode);
        if (!created) return;
    } else if (dom.recurring.checked) {
        createRecurringTransactions(baseTransaction, paidMode);
    } else {
        const transaction = createTransaction(baseTransaction, paidMode);
        reconcileReserveContribution(null, transaction);
        state.transactions.push(transaction);
    }

    saveTransactions();
    resetTransactionForm();
    render();
    showToast('Transação adicionada.');
}

function updateTransaction(baseTransaction, paidMode) {
    const previousTransaction = state.transactions.find((transaction) => transaction.id === state.editingId) || null;

    state.transactions = state.transactions.map((transaction) => {
        if (transaction.id !== state.editingId) return transaction;

        const nextTransaction = normalizeTransaction({
            ...transaction,
            ...baseTransaction,
            paid: resolvePaid({
                ...transaction,
                ...baseTransaction,
                installmentGroupId: transaction.installmentGroupId,
                plannedBillId: transaction.plannedBillId
            }, paidMode),
            installmentGroupId: transaction.installmentGroupId,
            installmentIndex: transaction.installmentIndex,
            installmentTotal: transaction.installmentTotal,
            installmentTotalAmount: transaction.installmentTotalAmount,
            recurringGroupId: transaction.recurringGroupId,
            recurringIndex: transaction.recurringIndex,
            recurringTotal: transaction.recurringTotal,
            plannedBillId: transaction.plannedBillId,
            updatedAt: new Date().toISOString()
        });

        reconcileReserveContribution(previousTransaction, nextTransaction);
        return nextTransaction;
    }).filter(Boolean);

    saveTransactions();
    resetTransactionForm();
    render();
    showToast('Transação atualizada.');
}

function createInstallments(baseTransaction, paidMode) {
    const installments = Number.parseInt(dom.installments.value, 10);
    if (!Number.isInteger(installments) || installments < 2) {
        showToast('Informe pelo menos 2 parcelas.');
        return false;
    }

    const groupId = createId();
    const installmentAmounts = splitInstallmentAmounts(baseTransaction.amount, installments);
    for (let index = 1; index <= installments; index += 1) {
        const installmentDate = addMonths(baseTransaction.date, index - 1);
        state.transactions.push(createTransaction({
            ...baseTransaction,
            amount: installmentAmounts[index - 1],
            date: installmentDate,
            installmentGroupId: groupId,
            installmentIndex: index,
            installmentTotal: installments,
            installmentTotalAmount: baseTransaction.amount
        }, paidMode));
    }

    return true;
}

function createRecurringTransactions(baseTransaction, paidMode) {
    const months = Number.parseInt(dom.recurrenceMonths.value, 10);
    const total = Number.isInteger(months) && months > 0 ? months : 12;
    const groupId = createId();

    for (let index = 1; index <= total; index += 1) {
        const recurringDate = addMonths(baseTransaction.date, index - 1);
        state.transactions.push(createTransaction({
            ...baseTransaction,
            date: recurringDate,
            recurringGroupId: groupId,
            recurringIndex: index,
            recurringTotal: total
        }, paidMode));
    }
}

function createTransaction(data, paidMode) {
    return normalizeTransaction({
        id: createId(),
        ...data,
        paid: resolvePaid(data, paidMode),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
}

function applyReserveTransactionLink(reserveId, newAmount, previousTransaction = null) {
    if (!reserveId || normalizeMoney(newAmount) <= 0) return;

    const previousAmount = previousTransaction && previousTransaction.reserveContributionId === reserveId
        ? normalizeMoney(previousTransaction.amount)
        : 0;
    const delta = roundMoney(normalizeMoney(newAmount) - previousAmount);

    state.reserves = state.reserves.map((reserve) => {
        if (reserve.id !== reserveId) return reserve;
        return {
            ...reserve,
            saved: roundMoney(Math.max(0, Math.min(reserve.target, reserve.saved + delta))),
            updatedAt: new Date().toISOString()
        };
    });
}

function reconcileReserveContribution(previousTransaction, nextTransaction) {
    if (previousTransaction && previousTransaction.paid && previousTransaction.reserveContributionId) {
        applyReserveTransactionLink(previousTransaction.reserveContributionId, 0, previousTransaction);
    }

    if (nextTransaction && nextTransaction.paid && nextTransaction.reserveContributionId) {
        applyReserveTransactionLink(nextTransaction.reserveContributionId, nextTransaction.amount, null);
    }
}

function resolvePaid(transactionOrDate, paidMode) {
    if (paidMode === 'paid') return true;
    if (paidMode === 'pending') return false;

    const transaction = typeof transactionOrDate === 'string'
        ? { date: transactionOrDate }
        : (transactionOrDate || {});

    if (requiresManualPaymentConfirmation(transaction)) return false;
    return transaction.date <= getTodayDate();
}

function requiresManualPaymentConfirmation(transaction) {
    return Boolean(transaction)
        && transaction.type !== 'income'
        && Boolean(transaction.cardId || transaction.installmentGroupId || transaction.plannedBillId);
}

function getPurchaseMode(selectedType = dom.type.value) {
    if (selectedType === 'income') return 'single';
    if (selectedType === 'installment' && dom.cardPaymentMode.value === 'single') return 'installment';
    return dom.cardPaymentMode.value || 'single';
}

function shouldCreateInstallments(selectedType = dom.type.value) {
    const purchaseMode = getPurchaseMode(selectedType);
    return selectedType === 'installment'
        || purchaseMode === 'installment'
        || purchaseMode === 'booklet';
}

function toggleTransactionFields() {
    const selectedType = dom.type.value;
    const isExpense = selectedType === 'expense' || selectedType === 'installment';
    const isEditing = Boolean(state.editingId);
    const showCardPaymentField = isExpense && !isEditing;

    if (selectedType === 'installment') {
        dom.cardPaymentMode.value = dom.cardPaymentMode.value === 'single' ? 'installment' : dom.cardPaymentMode.value;
    } else if (!isExpense) {
        dom.cardPaymentMode.value = 'single';
    }

    if (dom.cardPaymentMode.value === 'booklet') {
        dom.cardSelect.value = '';
    }

    const isInstallment = shouldCreateInstallments(selectedType);
    const purchaseMode = getPurchaseMode(selectedType);
    const canLinkReserve = isExpense && purchaseMode === 'single' && !dom.recurring.checked && state.reserves.length > 0;

    dom.expenseFields.classList.toggle('hidden', !isExpense);
    dom.cardPaymentField.classList.toggle('hidden', !showCardPaymentField);
    dom.installmentFields.classList.toggle('hidden', !isInstallment || isEditing);
    dom.repeatField.classList.toggle('hidden', isInstallment || isEditing);
    dom.installments.required = isInstallment && !isEditing;
    dom.reserveLinkField.classList.toggle('hidden', !canLinkReserve);
    if (!canLinkReserve) dom.reserveLinkSelect.value = '';
    dom.amountLabel.textContent = isInstallment && !isEditing ? 'Valor total da compra (R$)' : 'Valor (R$)';
    dom.amountHint.textContent = isInstallment && !isEditing ? 'O app divide em parcelas e compromete o limite total do cartão.' : '';
    dom.dateLabel.textContent = isInstallment && !isEditing ? 'Data da 1ª parcela' : 'Data';

    if (isInstallment || isEditing) {
        dom.recurring.checked = false;
        dom.recurrenceOptions.classList.add('hidden');
    }
}

function applyAutoClassification() {
    const desc = removeAccents(dom.desc.value.trim().toLowerCase());
    dom.autoCategoryHint.textContent = '';
    if (!desc) return;

    const suggestion = AUTO_RULES.find((rule) => {
        return rule.words.some((word) => desc.includes(removeAccents(word.toLowerCase())));
    });
    if (!suggestion) return;

    if (!state.editingId && suggestion.type === 'income' && dom.type.value !== 'installment') {
        dom.type.value = 'income';
        toggleTransactionFields();
        dom.autoCategoryHint.textContent = 'Classificado como receita automaticamente.';
        return;
    }

    if (suggestion.category && !state.categoryTouched) {
        if (dom.type.value === 'income') {
            dom.type.value = 'expense';
            toggleTransactionFields();
        }
        dom.category.value = suggestion.category;
        dom.necessity.value = suggestion.necessity || 'essential';
        dom.autoCategoryHint.textContent = `Sugestão: ${CATEGORY_LABELS[suggestion.category]}.`;
    }
}

function handleTransactionClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === 'toggle-paid') togglePaid(id);
    if (action === 'edit') startEdit(id);
    if (action === 'delete') deleteTransaction(id);
}

function togglePaid(id) {
    state.transactions = state.transactions.map((transaction) => {
        if (transaction.id !== id) return transaction;
        const nextTransaction = {
            ...transaction,
            paid: !transaction.paid,
            updatedAt: new Date().toISOString()
        };
        reconcileReserveContribution(transaction, nextTransaction);
        return nextTransaction;
    });

    saveTransactions();
    render();
}

function startEdit(id) {
    const transaction = state.transactions.find((item) => item.id === id);
    if (!transaction) return;

    state.editingId = id;
    state.categoryTouched = false;
    dom.transactionId.value = id;
    dom.formTitle.textContent = 'Editar Transação';
    dom.desc.value = transaction.desc;
    dom.tags.value = Array.isArray(transaction.tags) ? transaction.tags.join(', ') : '';
    dom.amount.value = transaction.amount;
    dom.type.value = transaction.type;
    dom.category.value = transaction.category || 'outros';
    dom.necessity.value = transaction.necessity || 'essential';
    dom.cardSelect.value = transaction.cardId || '';
    dom.cardPaymentMode.value = transaction.installmentGroupId
        ? (transaction.cardId ? 'installment' : 'booklet')
        : 'single';
    dom.date.value = transaction.date;
    dom.paid.value = transaction.paid ? 'paid' : 'pending';
    dom.reserveLinkSelect.value = transaction.reserveContributionId || '';
    dom.submitButton.querySelector('span').textContent = 'Salvar';
    dom.submitButton.querySelector('i').className = 'fa-solid fa-check';
    dom.cancelEdit.classList.remove('hidden');
    dom.autoCategoryHint.textContent = '';
    toggleTransactionFields();
    dom.transactionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    dom.desc.focus();
}

function deleteTransaction(id) {
    const transaction = state.transactions.find((item) => item.id === id);
    if (!transaction) return;

    const confirmed = window.confirm(`Excluir "${transaction.desc}"?`);
    if (!confirmed) return;

    reconcileReserveContribution(transaction, null);
    state.transactions = state.transactions.filter((item) => item.id !== id);
    saveTransactions();
    if (state.editingId === id) resetTransactionForm();
    render();
    showToast('Transação excluída.');
}

function resetTransactionForm() {
    state.editingId = null;
    state.categoryTouched = false;
    dom.transactionForm.reset();
    dom.transactionId.value = '';
    dom.tags.value = '';
    dom.cardPaymentMode.value = 'single';
    dom.date.value = getTodayDate();
    dom.paid.value = 'auto';
    dom.reserveLinkSelect.value = '';
    dom.formTitle.textContent = 'Nova Transação';
    dom.submitButton.querySelector('span').textContent = 'Adicionar';
    dom.submitButton.querySelector('i').className = 'fa-solid fa-plus';
    dom.cancelEdit.classList.add('hidden');
    dom.autoCategoryHint.textContent = '';
    toggleTransactionFields();
}

function syncPlannedForMonth(monthKey, silent) {
    let created = 0;

    state.plannedBills.filter((bill) => bill.active).forEach((bill) => {
        const dueDate = getBillDueDateForMonth(bill, monthKey);
        if (!dueDate) return;

        const alreadyExists = state.transactions.some((transaction) => {
            return transaction.plannedBillId === bill.id && getMonthKey(transaction.date) === monthKey;
        });
        if (alreadyExists) return;

        state.transactions.push(createTransaction({
            desc: bill.name,
            amount: bill.amount,
            type: 'expense',
            date: dueDate,
            category: bill.category,
            necessity: bill.necessity,
            cardId: bill.cardId,
            plannedBillId: bill.id
        }, 'pending'));
        created += 1;
    });

    if (created > 0) {
        saveTransactions();
        if (!silent) showToast(`${created} conta${created === 1 ? '' : 's'} prevista${created === 1 ? '' : 's'} lançada${created === 1 ? '' : 's'} no mês.`);
    }

    return created;
}

function buildVirtualPlannedTransactions(monthKey) {
    return state.plannedBills
        .filter((bill) => bill.active)
        .map((bill) => ({ bill, dueDate: getBillDueDateForMonth(bill, monthKey) }))
        .filter(({ dueDate }) => Boolean(dueDate))
        .filter(({ bill }) => !state.transactions.some((transaction) => transaction.plannedBillId === bill.id && getMonthKey(transaction.date) === monthKey))
        .map(({ bill, dueDate }) => normalizeTransaction({
            id: `planned-${bill.id}-${monthKey}`,
            desc: bill.name,
            amount: bill.amount,
            type: 'expense',
            date: dueDate,
            category: bill.category,
            necessity: bill.necessity,
            cardId: bill.cardId,
            paid: false,
            plannedBillId: bill.id,
            virtual: true
        }))
        .filter(Boolean);
}

function getTransactionsForMonth(monthKey, includeVirtual = true) {
    const rows = state.transactions.filter((transaction) => getMonthKey(transaction.date) === monthKey);
    return includeVirtual ? rows.concat(buildVirtualPlannedTransactions(monthKey)) : rows;
}

function render() {
    syncPlannedForMonth(state.selectedMonth, true);
    populateDynamicSelects();

    const stats = buildMonthStats(state.selectedMonth);
    renderSummary(stats);
    renderMonthOverview(stats);
    renderIncomeAlert(stats);
    renderDiagnostic(stats);
    renderIncomeUsage(stats);
    renderCutAnalysis(stats);
    renderForecast();
    renderCategories(stats);
    renderReserveChart();
    renderCardOverview();
    renderHistory();
    renderProfile();
    renderReserves();
    renderInvestments();
    renderPlannedBills();
    renderCards();
    renderPlanning();
    runScenario();
}

function buildMonthStats(monthKey, includeScore = true) {
    const monthTransactions = getTransactionsForMonth(monthKey, true);
    const stats = {
        monthKey,
        transactions: monthTransactions,
        incomePaid: 0,
        incomePending: 0,
        expensePaid: 0,
        expensePending: 0,
        essentialExpense: 0,
        desireExpense: 0,
        byCategory: {},
        desireByCategory: {},
        byCard: {}
    };

    monthTransactions.forEach((transaction) => {
        if (transaction.type === 'income') {
            if (transaction.paid) stats.incomePaid += transaction.amount;
            else stats.incomePending += transaction.amount;
            return;
        }

        if (transaction.paid) stats.expensePaid += transaction.amount;
        else stats.expensePending += transaction.amount;

        if (transaction.necessity === 'desire') {
            stats.desireExpense += transaction.amount;
            stats.desireByCategory[transaction.category] = (stats.desireByCategory[transaction.category] || 0) + transaction.amount;
        } else {
            stats.essentialExpense += transaction.amount;
        }

        stats.byCategory[transaction.category] = (stats.byCategory[transaction.category] || 0) + transaction.amount;
        if (transaction.cardId) {
            stats.byCard[transaction.cardId] = (stats.byCard[transaction.cardId] || 0) + transaction.amount;
        }
    });

    stats.transactionIncome = stats.incomePaid + stats.incomePending;
    stats.incomeBase = Math.max(stats.transactionIncome, state.profile.expectedIncome);
    stats.expectedIncome = stats.incomeBase;
    stats.expectedExpense = stats.expensePaid + stats.expensePending;
    stats.projectedBalance = stats.expectedIncome - stats.expectedExpense;
    stats.cashBalance = stats.incomePaid - stats.expensePaid;
    stats.pendingNet = stats.incomePending - stats.expensePending;
    stats.commitment = stats.expectedIncome > 0 ? (stats.expectedExpense / stats.expectedIncome) * 100 : 0;
    stats.cutPotential = stats.desireExpense;
    stats.reserveSuggestion = Math.max(0, Math.min(stats.projectedBalance * 0.3, stats.expectedIncome * 0.2));
    stats.healthScore = includeScore ? calculateHealthScore(stats) : 0;
    return stats;
}

function renderSummary(stats) {
    const futureMonth = stats.monthKey > getMonthKey(getTodayDate());
    dom.totalIncome.textContent = formatCurrency(stats.expectedIncome);
    dom.totalExpense.textContent = formatCurrency(stats.expectedExpense);
    dom.totalBalance.textContent = formatCurrency(stats.projectedBalance);
    dom.cashBalance.textContent = formatCurrency(stats.cashBalance);
    dom.healthScore.textContent = stats.healthScore;

    dom.incomeSubtitle.textContent = `${formatCurrency(stats.transactionIncome)} lançado | ${formatCurrency(state.profile.expectedIncome)} esperado`;
    dom.expenseSubtitle.textContent = futureMonth
        ? `${formatCurrency(stats.expectedExpense)} planejado para o mês`
        : `${formatCurrency(stats.expensePaid)} pago | ${formatCurrency(stats.expensePending)} pendente`;
    dom.balanceSubtitle.textContent = stats.projectedBalance >= 0 ? 'Sobra prevista no mês' : 'Prejuízo previsto no mês';
    dom.cashSubtitle.textContent = futureMonth
        ? 'Mês futuro: acompanhe como planejamento'
        : `${formatCurrency(stats.pendingNet)} ainda pendente`;
    dom.healthSubtitle.textContent = getHealthLabel(stats.healthScore);

    setMoneyColor(dom.totalBalance, stats.projectedBalance);
    setMoneyColor(dom.cashBalance, stats.cashBalance);
    setScoreColor(dom.healthScore, stats.healthScore);
}

function renderMonthOverview(stats) {
    const nextDue = getNextDueAccount();
    const cardBillTotal = state.cards.reduce((sum, card) => sum + getCardUsage(card, state.selectedMonth).currentBill, 0);
    const hasData = stats.transactions.length > 0 || stats.expectedIncome > 0 || state.cards.length > 0 || state.reserves.length > 0;
    const commitmentLimit = getCommitmentLimit();

    dom.monthOverviewTitle.textContent = `Resumo de ${formatMonthLabel(state.selectedMonth)}`;
    dom.overviewNextDue.textContent = nextDue ? `${nextDue.title} em ${formatDate(nextDue.date)}` : 'Nenhum';
    dom.overviewCardBill.textContent = formatCurrency(cardBillTotal);
    dom.overviewReserve.textContent = formatCurrency(getTotalReserveSaved());
    dom.overviewStatus.className = `status-badge ${getHealthClass(stats.healthScore)}`;
    dom.overviewStatus.textContent = getHealthLabel(stats.healthScore);

    if (!hasData) {
        dom.monthOverviewSubtitle.textContent = 'Comece pelo perfil, cadastre uma renda mensal e lance as primeiras contas para o painel trabalhar por você.';
        return;
    }

    if (stats.projectedBalance < 0) {
        dom.monthOverviewSubtitle.textContent = `A previsão atual está negativa em ${formatCurrency(Math.abs(stats.projectedBalance))}. Priorize contas vencendo, fatura do cartão e gastos cortáveis.`;
        return;
    }

    if (stats.commitment >= commitmentLimit) {
        dom.monthOverviewSubtitle.textContent = `O mês fecha positivo, mas ${Math.round(stats.commitment)}% da renda já está comprometida. Seu limite pessoal está em ${commitmentLimit}%.`;
        return;
    }

    dom.monthOverviewSubtitle.textContent = `Você tem sobra prevista de ${formatCurrency(stats.projectedBalance)}. O mês está respirando bem; vale reforçar a reserva.`;
}

function renderIncomeAlert(stats) {
    const commitmentLimit = getCommitmentLimit();
    const shouldWarn = stats.expectedIncome > 0 && stats.commitment >= commitmentLimit;
    dom.incomeAlert.classList.toggle('hidden', !shouldWarn);
    if (!shouldWarn) return;

    const rounded = Math.round(stats.commitment);
    dom.incomeAlertTitle.textContent = stats.commitment >= 100 ? 'Renda estourada' : 'Atenção na renda';
    dom.incomeAlertText.textContent = stats.commitment >= 100
        ? `Suas saídas já passaram da renda mensal em ${formatCurrency(Math.abs(stats.projectedBalance))}.`
        : `Você já comprometeu ${rounded}% da renda mensal. Seu limite pessoal está configurado em ${commitmentLimit}%.`;
}

function renderDiagnostic(stats) {
    const hasData = stats.transactions.length > 0 || stats.expectedIncome > 0 || state.reserves.length > 0;
    const futureRisk = buildFutureMonths(4).filter((month) => month.projectedBalance < 0).length;
    const topCategory = getTopEntry(stats.byCategory);
    const topCard = getTopEntry(stats.byCard);
    const commitmentLimit = getCommitmentLimit();

    dom.commitmentRate.textContent = `${Math.round(stats.commitment)}%`;
    dom.cutPotential.textContent = formatCurrency(stats.cutPotential);
    dom.reserveSuggestion.textContent = formatCurrency(stats.reserveSuggestion);

    dom.healthBadge.className = `status-badge ${getHealthClass(stats.healthScore)}`;
    dom.healthBadge.textContent = getHealthLabel(stats.healthScore);
    clearElement(dom.diagnosticList);

    if (!hasData) {
        dom.diagnosticMain.textContent = 'Cadastre perfil, receitas e despesas para enxergar o resultado do mês.';
        appendDiagnostic('fa-user', `Preencher a renda mensal esperada deixa o alerta de comprometimento mais preciso. Hoje seu teto pessoal está em ${commitmentLimit}%.`);
        return;
    }

    if (stats.projectedBalance < 0) {
        const gap = Math.abs(stats.projectedBalance);
        dom.diagnosticMain.textContent = stats.cutPotential >= gap
            ? `Este mês aponta prejuízo de ${formatCurrency(gap)}. Seus gastos cortáveis somam ${formatCurrency(stats.cutPotential)}, então dá para cobrir reduzindo desejos e compras não essenciais.`
            : `Este mês aponta prejuízo de ${formatCurrency(gap)}. Mesmo cortando todos os desejos cadastrados, ainda pode faltar dinheiro.`;
    } else if (stats.commitment >= commitmentLimit) {
        dom.diagnosticMain.textContent = `O mês ainda fecha positivo em ${formatCurrency(stats.projectedBalance)}, mas ${Math.round(stats.commitment)}% da renda já está comprometida frente ao seu limite de ${commitmentLimit}%.`;
    } else {
        dom.diagnosticMain.textContent = `O mês fecha com sobra prevista de ${formatCurrency(stats.projectedBalance)}. Você pode guardar até ${formatCurrency(stats.reserveSuggestion)} sem apertar demais o orçamento.`;
    }

    if (topCategory) {
        appendDiagnostic('fa-arrow-trend-up', `Seu maior gasto do mês foi ${CATEGORY_LABELS[topCategory.key] || 'Outros'}: ${formatCurrency(topCategory.value)}.`);
    }
    if (stats.desireExpense > 0 && stats.expectedIncome > 0) {
        appendDiagnostic('fa-scissors', `Desejos e gastos cortáveis consomem ${Math.round(stats.desireExpense / stats.expectedIncome * 100)}% da renda.`);
    }
    if (topCard) {
        appendDiagnostic('fa-credit-card', `O cartão com maior impacto no mês é ${getCardName(topCard.key)}: ${formatCurrency(topCard.value)}.`);
    }
    if (futureRisk > 0) {
        appendDiagnostic('fa-calendar-xmark', `${futureRisk} dos próximos 4 meses aparecem com risco de fechar negativo.`);
    }
    if (state.reserves.length > 0) {
        appendDiagnostic('fa-piggy-bank', `Reservas somam ${formatCurrency(getTotalReserveSaved())} guardados.`);
    }
}

function appendDiagnostic(icon, text) {
    const item = document.createElement('li');
    item.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(text)}</span>`;
    dom.diagnosticList.appendChild(item);
}

function calculateHealthScore(stats) {
    if (stats.expectedIncome <= 0 && stats.transactions.length === 0) return 0;

    let score = 55;
    const futureNegative = buildFutureMonths(3).filter((month) => month.projectedBalance < 0).length;
    const reserveRatio = getBestReserveRatio();

    if (stats.projectedBalance >= 0) score += Math.min(18, stats.expectedIncome > 0 ? stats.projectedBalance / stats.expectedIncome * 30 : 8);
    else score -= 25;

    if (stats.commitment < 60) score += 14;
    else if (stats.commitment < 80) score += 5;
    else if (stats.commitment < 100) score -= 14;
    else score -= 28;

    score += Math.min(14, reserveRatio * 14);
    score -= Math.min(12, stats.expensePending / Math.max(1, stats.expectedIncome) * 18);
    score -= futureNegative * 6;

    if (stats.desireExpense > stats.essentialExpense && stats.expectedExpense > 0) score -= 7;

    return clampInteger(Math.round(score), 0, 100, 0);
}

function renderIncomeUsage(stats) {
    clearElement(dom.incomeUsageChart);

    const commitment = Math.min(140, stats.commitment);
    const commitmentLimit = getCommitmentLimit();
    const barClass = stats.commitment >= 100 ? 'bg-red-500' : stats.commitment >= commitmentLimit ? 'bg-yellow-400' : 'bg-green-500';
    const incomeLabel = stats.expectedIncome > 0 ? `${Math.round(stats.commitment)}% da renda usada` : 'Renda ainda não definida';

    dom.incomeUsageChart.innerHTML = `
        <div class="chart-row">
            <div class="chart-topline">
                <span>${escapeHtml(incomeLabel)}</span>
                <strong>${formatCurrency(stats.expectedExpense)}</strong>
            </div>
            <div class="bar-track">
                <div class="bar-fill ${barClass}" style="width: ${Math.min(100, commitment)}%"></div>
            </div>
        </div>
        <div class="chart-row">
            <div class="chart-topline">
                <span>Entrada base</span>
                <strong class="text-green-700">${formatCurrency(stats.expectedIncome)}</strong>
            </div>
            <div class="chart-topline">
                <span>Saídas previstas</span>
                <strong class="text-red-700">${formatCurrency(stats.expectedExpense)}</strong>
            </div>
            <div class="chart-topline">
                <span>Sobra provável</span>
                <strong class="${stats.projectedBalance >= 0 ? 'text-green-700' : 'text-red-700'}">${formatCurrency(stats.projectedBalance)}</strong>
            </div>
        </div>
    `;
}

function renderCutAnalysis(stats) {
    dom.essentialTotal.textContent = formatCurrency(stats.essentialExpense);
    dom.desireTotal.textContent = formatCurrency(stats.desireExpense);

    const classifiedTotal = stats.essentialExpense + stats.desireExpense;
    const essentialPercent = classifiedTotal > 0 ? (stats.essentialExpense / classifiedTotal) * 100 : 0;
    const desirePercent = classifiedTotal > 0 ? (stats.desireExpense / classifiedTotal) * 100 : 0;
    dom.essentialBar.style.width = `${essentialPercent}%`;
    dom.desireBar.style.width = `${desirePercent}%`;

    clearElement(dom.cutList);

    const sortedCuts = Object.entries(stats.desireByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    if (sortedCuts.length === 0) {
        dom.cutList.appendChild(createListNote('Nenhum gasto cortável foi cadastrado neste mês.'));
        return;
    }

    sortedCuts.forEach(([category, amount]) => {
        const possibleReduction = amount * 0.3;
        const item = document.createElement('li');
        item.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div>
                    <strong class="block text-slate-800">${CATEGORY_LABELS[category] || 'Outros'}</strong>
                    <span class="text-sm text-slate-500">Reduzindo 30%, economiza ${formatCurrency(possibleReduction)}</span>
                </div>
                <span class="font-black text-red-600">${formatCurrency(amount)}</span>
            </div>
        `;
        dom.cutList.appendChild(item);
    });
}

function renderForecast() {
    clearElement(dom.forecastList);
    const months = buildFutureMonths(6);
    const maxAbsBalance = Math.max(1, ...months.map((month) => Math.abs(month.projectedBalance)));

    months.forEach((monthStats) => {
        const row = document.createElement('div');
        row.className = 'forecast-row';

        const balancePercent = Math.min(100, Math.abs(monthStats.projectedBalance) / maxAbsBalance * 100);
        const color = monthStats.projectedBalance >= 0 ? 'bg-green-500' : 'bg-red-500';

        row.innerHTML = `
            <div class="forecast-topline">
                <span>${formatMonthLabel(monthStats.monthKey)}</span>
                <strong class="${monthStats.projectedBalance >= 0 ? 'text-green-700' : 'text-red-700'}">${formatCurrency(monthStats.projectedBalance)}</strong>
            </div>
            <div class="bar-track">
                <div class="bar-fill ${color}" style="width: ${balancePercent}%"></div>
            </div>
            <div class="forecast-meta">
                <span>Entradas ${formatCurrency(monthStats.expectedIncome)}</span>
                <span>Saídas ${formatCurrency(monthStats.expectedExpense)}</span>
            </div>
        `;

        dom.forecastList.appendChild(row);
    });
}

function renderCategories(stats) {
    clearElement(dom.categoryChart);

    const categories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
    const total = categories.reduce((sum, [, amount]) => sum + amount, 0);

    if (categories.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'category-row text-sm text-slate-500';
        empty.textContent = 'Sem despesas categorizadas neste mês.';
        dom.categoryChart.appendChild(empty);
        return;
    }

    categories.forEach(([category, amount]) => {
        const percent = total > 0 ? amount / total * 100 : 0;
        const row = document.createElement('div');
        row.className = 'category-row';
        row.innerHTML = `
            <div class="category-topline">
                <span>${CATEGORY_LABELS[category] || 'Outros'}</span>
                <strong>${formatCurrency(amount)}</strong>
            </div>
            <div class="bar-track">
                <div class="bar-fill bg-purple-500" style="width: ${percent}%"></div>
            </div>
        `;
        dom.categoryChart.appendChild(row);
    });
}

function renderReserveChart() {
    clearElement(dom.reserveChart);

    if (state.reserves.length === 0) {
        dom.reserveChart.appendChild(createListNote('Nenhuma reserva criada ainda.'));
        return;
    }

    state.reserves.slice(0, 3).forEach((reserve) => {
        const percent = getReservePercent(reserve);
        const row = document.createElement('div');
        row.className = 'chart-row';
        row.innerHTML = `
            <div class="chart-topline">
                <span>${escapeHtml(reserve.name)}</span>
                <strong>${Math.round(percent)}%</strong>
            </div>
            <div class="bar-track">
                <div class="bar-fill bg-green-500" style="width: ${Math.min(100, percent)}%"></div>
            </div>
            <p class="chart-note">${formatCurrency(reserve.saved)} de ${formatCurrency(reserve.target)}</p>
        `;
        dom.reserveChart.appendChild(row);
    });
}

function renderCardOverview() {
    clearElement(dom.cardOverview);

    if (state.cards.length === 0) {
        dom.cardOverview.appendChild(createListNote('Nenhum cartão cadastrado. Compras continuam funcionando sem vínculo.'));
        return;
    }

    state.cards.forEach((card) => {
        const usage = getCardUsage(card, state.selectedMonth);
        const percent = card.limit > 0 ? Math.min(100, usage.limitUsed / card.limit * 100) : 0;
        const item = document.createElement('article');
        item.className = 'credit-card-row';
        item.style.borderColor = card.color;
        item.innerHTML = `
            <div>
                <div class="entity-title-row">
                    <strong>${escapeHtml(card.name)}</strong>
                    <span>${Math.round(percent)}% usado</span>
                </div>
                <div class="bar-track mt-3">
                    <div class="bar-fill bg-blue-500" style="width: ${percent}%"></div>
                </div>
                <div class="forecast-meta mt-3">
                    <span>Fatura ${formatCurrency(usage.currentBill)}</span>
                    <span>Limite usado ${formatCurrency(usage.limitUsed)}</span>
                    <span>Disponível ${formatCurrency(usage.available)}</span>
                    <span>Parcelas futuras ${formatCurrency(usage.futureInstallments)}</span>
                </div>
            </div>
        `;
        dom.cardOverview.appendChild(item);
    });
}

function renderHistory() {
    const search = dom.searchFilter.value.trim().toLowerCase();
    const typeFilter = dom.typeFilter.value;
    const statusFilter = dom.statusFilter.value;
    const categoryFilter = dom.categoryFilter.value;
    const necessityFilter = dom.necessityFilter.value;
    const cardFilter = dom.cardFilter.value;
    const tagFilter = dom.tagFilter.value;
    const min = parseLocaleNumber(dom.minFilter.value);
    const max = parseLocaleNumber(dom.maxFilter.value);
    const dateStart = dom.dateStartFilter.value;
    const dateEnd = dom.dateEndFilter.value;

    let rows = getTransactionsForMonth(state.selectedMonth, false);

    if (search) {
        const normalizedSearch = removeAccents(search);
        rows = rows.filter((transaction) => {
            const category = CATEGORY_LABELS[transaction.category] || '';
            const card = getCardName(transaction.cardId);
            return removeAccents(`${transaction.desc} ${category} ${card} ${(transaction.tags || []).join(' ')}`.toLowerCase()).includes(normalizedSearch);
        });
    }

    if (typeFilter !== 'all') rows = rows.filter((transaction) => transaction.type === typeFilter);
    if (statusFilter !== 'all') rows = rows.filter((transaction) => statusFilter === 'paid' ? transaction.paid : !transaction.paid);
    if (categoryFilter !== 'all') rows = rows.filter((transaction) => transaction.category === categoryFilter);
    if (necessityFilter !== 'all') rows = rows.filter((transaction) => transaction.necessity === necessityFilter);
    if (cardFilter === 'none') rows = rows.filter((transaction) => !transaction.cardId);
    else if (cardFilter !== 'all') rows = rows.filter((transaction) => transaction.cardId === cardFilter);
    if (Number.isFinite(min) && min > 0) rows = rows.filter((transaction) => transaction.amount >= min);
    if (Number.isFinite(max) && max > 0) rows = rows.filter((transaction) => transaction.amount <= max);
    if (dateStart) rows = rows.filter((transaction) => transaction.date >= dateStart);
    if (dateEnd) rows = rows.filter((transaction) => transaction.date <= dateEnd);

    if (tagFilter === 'installment') rows = rows.filter((transaction) => transaction.installmentGroupId);
    if (tagFilter === 'recurring') rows = rows.filter((transaction) => transaction.recurringGroupId);
    if (tagFilter === 'planned') rows = rows.filter((transaction) => transaction.plannedBillId);
    if (tagFilter === 'card') rows = rows.filter((transaction) => transaction.cardId);
    if (tagFilter && tagFilter.startsWith('#')) rows = rows.filter((transaction) => (transaction.tags || []).includes(tagFilter.slice(1)));

    rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

    clearElement(dom.transactionList);
    dom.emptyState.classList.toggle('hidden', rows.length > 0);
    dom.transactionCount.textContent = `${rows.length} registro${rows.length === 1 ? '' : 's'} em ${formatMonthLabel(state.selectedMonth)}`;

    rows.forEach((transaction) => {
        dom.transactionList.appendChild(createTransactionRow(transaction));
    });
}

function createTransactionRow(transaction) {
    const row = document.createElement('li');
    row.className = 'transaction-row';

    const isIncome = transaction.type === 'income';
    const paidIconClass = transaction.paid ? 'fa-solid fa-circle-check text-green-500' : 'fa-regular fa-circle text-slate-400';
    const amountClass = isIncome ? 'text-green-700' : 'text-red-700';
    const iconWrapClass = isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
    const iconClass = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';

    const main = document.createElement('div');
    main.className = 'transaction-main';

    const toggleButton = createIconButton('paid-toggle text-2xl', paidIconClass, transaction.paid ? 'Marcar como pendente' : 'Marcar como pago');
    toggleButton.dataset.action = 'toggle-paid';
    toggleButton.dataset.id = transaction.id;

    const icon = document.createElement('span');
    icon.className = `transaction-icon ${iconWrapClass}`;
    icon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

    const textWrap = document.createElement('div');
    textWrap.className = 'min-w-0';

    const title = document.createElement('p');
    title.className = 'transaction-title';
    title.textContent = transaction.desc;

    const date = document.createElement('p');
    date.className = 'transaction-date';
    date.textContent = formatDate(transaction.date);

    const badges = document.createElement('div');
    badges.className = 'badge-row';
    appendBadges(badges, transaction);

    textWrap.append(title, date, badges);
    main.append(toggleButton, icon, textWrap);

    const side = document.createElement('div');
    side.className = 'transaction-side';

    const amount = document.createElement('span');
    amount.className = `transaction-amount ${amountClass}`;
    amount.textContent = `${isIncome ? '+' : '-'} ${formatCurrency(transaction.amount)}`;

    const editButton = createIconButton('row-action text-slate-400 hover:text-brand-700', 'fa-solid fa-pen', 'Editar');
    editButton.dataset.action = 'edit';
    editButton.dataset.id = transaction.id;

    const deleteButton = createIconButton('row-action text-slate-400 hover:text-red-600', 'fa-solid fa-trash', 'Excluir');
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = transaction.id;

    side.append(amount, editButton, deleteButton);
    row.append(main, side);
    return row;
}

function appendBadges(container, transaction) {
    if (!transaction.paid && isOverdueTransaction(transaction)) container.appendChild(createBadge('Atrasada', 'bg-red-100 text-red-700'));
    else if (!transaction.paid) container.appendChild(createBadge('Pendente', 'bg-slate-200 text-slate-700'));
    if (transaction.type === 'expense' && transaction.necessity === 'desire') container.appendChild(createBadge('Cortável', 'bg-yellow-100 text-yellow-800'));
    if (transaction.installmentGroupId) container.appendChild(createBadge(`Parcela ${transaction.installmentIndex}/${transaction.installmentTotal}`, 'bg-blue-100 text-blue-800'));
    if (transaction.installmentGroupId && !transaction.cardId) container.appendChild(createBadge('Carnê', 'bg-amber-100 text-amber-800'));
    if (transaction.recurringGroupId) container.appendChild(createBadge('Recorrente', 'bg-brand-50 text-brand-700'));
    if (transaction.plannedBillId) container.appendChild(createBadge('Conta prevista', 'bg-yellow-100 text-yellow-800'));
    if (transaction.cardId) container.appendChild(createBadge(getCardName(transaction.cardId), 'bg-blue-100 text-blue-800'));
    if (transaction.type === 'expense') container.appendChild(createBadge(CATEGORY_LABELS[transaction.category] || 'Outros', 'bg-white text-slate-600 border border-slate-200'));
    (transaction.tags || []).forEach((tag) => container.appendChild(createBadge(`#${tag}`, 'bg-emerald-100 text-emerald-800')));
}

function resetFilters() {
    dom.searchFilter.value = '';
    dom.typeFilter.value = 'all';
    dom.statusFilter.value = 'all';
    dom.categoryFilter.value = 'all';
    dom.necessityFilter.value = 'all';
    dom.cardFilter.value = 'all';
    dom.tagFilter.value = 'all';
    dom.minFilter.value = '';
    dom.maxFilter.value = '';
    dom.dateStartFilter.value = '';
    dom.dateEndFilter.value = '';
    renderHistory();
}

function handleProfileSubmit(event) {
    event.preventDefault();
    state.profile = normalizeProfile({
        name: dom.profileName.value,
        expectedIncome: dom.profileIncome.value,
        objective: dom.profileObjective.value,
        reviewMoment: dom.profileReviewMoment.value,
        mainReserveId: dom.profileMainReserve.value,
        payday: dom.profilePayday.value,
        monthlySavingsGoal: dom.profileSavingsGoal.value,
        reserveLevel: dom.profileReserveLevel.value,
        maxCommitment: dom.profileMaxCommitment.value
    });
    saveProfile();
    render();
    showToast('Perfil salvo.');
}

function getObjectiveStrategy() {
    return OBJECTIVE_STRATEGIES[state.profile.objective] || OBJECTIVE_STRATEGIES.organizar;
}

function getCommitmentLimit() {
    return clampInteger(state.profile.maxCommitment, 50, 100, 80);
}

function getReservePlanningBase(stats, strategy) {
    if (stats.essentialExpense > 0) return stats.essentialExpense;
    if (stats.expectedExpense > 0) return Math.max(0, stats.expectedExpense - stats.desireExpense);
    if (stats.expectedIncome > 0) return roundMoney(stats.expectedIncome * strategy.essentialShare);
    return 0;
}

function getProfileReserveMetrics(stats, strategy) {
    const monthlyBase = getReservePlanningBase(stats, strategy);
    const targetMonths = getReserveLevelConfig(state.profile.reserveLevel).months;
    const currentAmount = getTotalReserveSaved();
    const targetAmount = roundMoney(monthlyBase * targetMonths);
    const gap = Math.max(0, targetAmount - currentAmount);
    const coverageMonths = monthlyBase > 0 ? currentAmount / monthlyBase : 0;

    return {
        monthlyBase,
        targetMonths,
        currentAmount,
        targetAmount,
        gap,
        coverageMonths
    };
}

function getNextRecurringDate(day, reference = new Date()) {
    if (!day) return null;

    const year = reference.getFullYear();
    const month = reference.getMonth();
    const today = reference.getDate();
    const currentMonthLastDay = new Date(year, month + 1, 0).getDate();
    const currentMonthDay = Math.min(day, currentMonthLastDay);

    if (today <= currentMonthDay) {
        return new Date(year, month, currentMonthDay);
    }

    const nextMonthLastDay = new Date(year, month + 2, 0).getDate();
    return new Date(year, month + 1, Math.min(day, nextMonthLastDay));
}

function getNextReviewDate(reviewMoment, reference = new Date()) {
    return getNextRecurringDate(getReviewMomentDay(reviewMoment), reference);
}

function formatDaysUntil(date) {
    if (!date) return 'sem data';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

    if (diff <= 0) return 'hoje';
    if (diff === 1) return 'amanha';
    return `em ${diff} dias`;
}

function createProfilePlanCard(item) {
    const ratio = item.recommended > 0 ? item.actual / item.recommended : 0;
    const progress = item.recommended > 0 ? Math.min(100, Math.max(6, Math.round(ratio * 100))) : 0;
    const toneClass = ratio > 1 ? 'danger' : ratio > 0.85 ? 'warning' : 'good';
    const card = document.createElement('article');
    card.className = `profile-plan-card ${toneClass}`;
    card.innerHTML = `
        <div class="profile-card-topline">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(formatCurrency(item.recommended))}</strong>
        </div>
        <p>${escapeHtml(item.description)}</p>
        <div class="profile-progress">
            <div class="profile-progress-fill ${toneClass}" style="width: ${progress}%"></div>
        </div>
        <div class="profile-card-foot">
            <span>Atual ${escapeHtml(formatCurrency(item.actual))}</span>
            <strong>${escapeHtml(item.footnote)}</strong>
        </div>
    `;
    return card;
}

function createProfileCycleCard(item) {
    const card = document.createElement('article');
    card.className = 'profile-cycle-card';
    card.innerHTML = `
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <p>${escapeHtml(item.description)}</p>
    `;
    return card;
}

function createProfileActionItem(item) {
    const card = document.createElement('article');
    card.className = `profile-action-item ${item.tone}`;
    card.innerHTML = `
        <div class="profile-action-icon">
            <i class="fa-solid ${item.icon}"></i>
        </div>
        <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
        </div>
    `;
    return card;
}

function buildProfileActions(stats, reserveMetrics) {
    const actions = [];
    const commitmentLimit = getCommitmentLimit();
    const positiveBalance = Math.max(0, stats.projectedBalance);
    const savingsGap = Math.max(0, state.profile.monthlySavingsGoal - positiveBalance);
    const reserveLevel = getReserveLevelConfig(state.profile.reserveLevel);

    if (!state.profile.expectedIncome) {
        actions.push({
            tone: 'danger',
            icon: 'fa-wallet',
            title: 'Defina a renda base',
            text: 'Sem renda esperada o painel perde precisao para prever sobra, metas e alertas.'
        });
    }

    if (stats.projectedBalance < 0) {
        actions.push({
            tone: 'danger',
            icon: 'fa-triangle-exclamation',
            title: 'Mes projetado no vermelho',
            text: `A previsao de ${formatMonthLabel(state.selectedMonth)} esta negativa em ${formatCurrency(Math.abs(stats.projectedBalance))}.`
        });
    } else if (stats.expectedIncome > 0 && stats.commitment >= commitmentLimit) {
        const idealExpense = roundMoney(stats.expectedIncome * (commitmentLimit / 100));
        const cutNeeded = Math.max(0, stats.expectedExpense - idealExpense);
        actions.push({
            tone: 'warning',
            icon: 'fa-gauge-high',
            title: 'Comprometimento acima do seu limite',
            text: `Para voltar ao teto de ${commitmentLimit}%, o ideal e cortar ou adiar ${formatCurrency(cutNeeded)}.`
        });
    } else {
        actions.push({
            tone: 'good',
            icon: 'fa-circle-check',
            title: 'Comprometimento sob controle',
            text: `O mes esta rodando dentro do teto pessoal de ${commitmentLimit}% definido no seu perfil.`
        });
    }

    if (state.profile.monthlySavingsGoal > 0) {
        if (savingsGap > 0) {
            actions.push({
                tone: 'warning',
                icon: 'fa-piggy-bank',
                title: 'Meta mensal ainda nao fecha',
                text: `A meta de guardar ${formatCurrency(state.profile.monthlySavingsGoal)} ainda pede mais ${formatCurrency(savingsGap)} de folga neste mes.`
            });
        } else {
            actions.push({
                tone: 'good',
                icon: 'fa-piggy-bank',
                title: 'Meta mensal viavel',
                text: `A sobra prevista cobre sua meta de ${formatCurrency(state.profile.monthlySavingsGoal)} para o mes atual.`
            });
        }
    }

    if (reserveMetrics.targetAmount > 0) {
        if (reserveMetrics.gap > 0) {
            actions.push({
                tone: 'info',
                icon: 'fa-shield-heart',
                title: 'Reserva ainda abaixo do alvo',
                text: `Faltam ${formatCurrency(reserveMetrics.gap)} para atingir a reserva ${reserveLevel.label.toLowerCase()} do seu plano.`
            });
        } else {
            actions.push({
                tone: 'good',
                icon: 'fa-shield-heart',
                title: 'Reserva dentro do alvo',
                text: `Sua reserva atual ja sustenta o nivel ${reserveLevel.label.toLowerCase()} definido no perfil.`
            });
        }
    }

    if (!state.profile.mainReserveId) {
        actions.push({
            tone: 'info',
            icon: 'fa-list-check',
            title: 'Escolha uma reserva principal',
            text: 'Isso ajuda o painel a destacar onde concentrar os aportes mensais.'
        });
    }

    if (!state.plannedBills.some((bill) => bill.active)) {
        actions.push({
            tone: 'info',
            icon: 'fa-calendar-check',
            title: 'Cadastre contas previstas',
            text: 'Sem contas previstas, as leituras futuras do seu perfil ficam menos confiaveis.'
        });
    }

    return actions.slice(0, 5);
}

function renderProfile() {
    clearElement(dom.profileSummary);
    clearElement(dom.profileBudgetPlan);
    clearElement(dom.profileCycle);
    clearElement(dom.profileActionPlan);

    const stats = buildMonthStats(state.selectedMonth);
    const strategy = getObjectiveStrategy();
    const mainReserve = getReserveById(state.profile.mainReserveId);
    const reserveMetrics = getProfileReserveMetrics(stats, strategy);
    const commitmentLimit = getCommitmentLimit();
    const nextPayday = getNextRecurringDate(state.profile.payday);
    const nextReviewDate = getNextReviewDate(state.profile.reviewMoment);
    const reserveLevel = getReserveLevelConfig(state.profile.reserveLevel);
    const recommendedGoal = Math.max(
        state.profile.monthlySavingsGoal,
        roundMoney(stats.expectedIncome * strategy.goalShare)
    );
    const positiveBalance = Math.max(0, stats.projectedBalance);
    const goalGap = Math.max(0, recommendedGoal - positiveBalance);

    let heroText = strategy.summary;
    if (!state.profile.expectedIncome) {
        heroText = 'Preencha a renda mensal e as metas abaixo para o painel calcular limites pessoais com mais precisao.';
    } else if (stats.projectedBalance < 0) {
        heroText = `Hoje sua rotina projeta falta de ${formatCurrency(Math.abs(stats.projectedBalance))} em ${formatMonthLabel(state.selectedMonth)}. O perfil precisa priorizar corte e reorganizacao.`;
    } else if (stats.commitment >= commitmentLimit) {
        heroText = `Seu mes ainda pode fechar positivo, mas o uso da renda passou do limite pessoal de ${commitmentLimit}% definido aqui no perfil.`;
    } else if (goalGap > 0) {
        heroText = `O orcamento esta mais saudavel, mas ainda faltam ${formatCurrency(goalGap)} para bater a meta principal do seu plano.`;
    } else {
        heroText = `O perfil atual sustenta a meta de ${strategy.goalLabel.toLowerCase()} e deixa o mes com sobra prevista de ${formatCurrency(stats.projectedBalance)}.`;
    }

    dom.profileHero.innerHTML = `
        <div class="profile-hero-copy">
            <span class="profile-hero-badge">${escapeHtml(OBJECTIVE_LABELS[state.profile.objective] || 'Plano pessoal')}</span>
            <h2>${escapeHtml(state.profile.name ? `${state.profile.name}, este e o seu plano` : 'Seu plano financeiro pessoal')}</h2>
            <p>${escapeHtml(heroText)}</p>
        </div>
        <div class="profile-hero-side">
            <div>
                <span>Saldo previsto</span>
                <strong>${escapeHtml(formatCurrency(stats.projectedBalance))}</strong>
            </div>
            <div>
                <span>Meta principal</span>
                <strong>${escapeHtml(strategy.goalLabel)}</strong>
            </div>
        </div>
    `;

    [
        { icon: 'fa-wallet', label: 'Renda base', value: formatCurrency(stats.expectedIncome) },
        { icon: 'fa-gauge-high', label: 'Teto de comprometimento', value: `${commitmentLimit}%` },
        { icon: 'fa-piggy-bank', label: 'Meta mensal', value: state.profile.monthlySavingsGoal > 0 ? formatCurrency(state.profile.monthlySavingsGoal) : 'Nao definida' },
        { icon: 'fa-calendar-check', label: 'Revisao do mes', value: getReviewMomentLabel(state.profile.reviewMoment) },
        { icon: 'fa-shield-heart', label: 'Meta da reserva', value: reserveMetrics.targetAmount > 0 ? formatCurrency(reserveMetrics.targetAmount) : 'Ainda calculando' },
        { icon: 'fa-calendar-day', label: 'Proximo recebimento', value: nextPayday ? `${formatDate(toDateInput(nextPayday))} (${formatDaysUntil(nextPayday)})` : 'Nao definido' },
        { icon: 'fa-piggy-bank', label: 'Reserva principal', value: mainReserve ? mainReserve.name : 'Nenhuma' }
    ].forEach((item) => {
        dom.profileSummary.appendChild(createInsightTile(item));
    });

    [
        {
            label: 'Custos essenciais',
            recommended: roundMoney(stats.expectedIncome * strategy.essentialShare),
            actual: stats.essentialExpense,
            description: 'Moradia, mercado, saude, contas fixas e tudo o que nao pode falhar.',
            footnote: stats.essentialExpense <= roundMoney(stats.expectedIncome * strategy.essentialShare) ? 'Dentro da faixa' : `Acima em ${formatCurrency(stats.essentialExpense - roundMoney(stats.expectedIncome * strategy.essentialShare))}`
        },
        {
            label: 'Flexivel e cortavel',
            recommended: roundMoney(stats.expectedIncome * strategy.flexibleShare),
            actual: stats.desireExpense,
            description: 'Lazer, delivery, assinaturas e gastos que o plano permite reduzir primeiro.',
            footnote: stats.desireExpense <= roundMoney(stats.expectedIncome * strategy.flexibleShare) ? 'Espaco controlado' : `Acima em ${formatCurrency(stats.desireExpense - roundMoney(stats.expectedIncome * strategy.flexibleShare))}`
        },
        {
            label: strategy.goalLabel,
            recommended: recommendedGoal,
            actual: positiveBalance,
            description: 'Quanto o seu mes esta conseguindo liberar para a meta principal escolhida.',
            footnote: goalGap > 0 ? `Faltam ${formatCurrency(goalGap)}` : `Sobra de ${formatCurrency(positiveBalance - recommendedGoal)}`
        }
    ].forEach((item) => {
        dom.profileBudgetPlan.appendChild(createProfilePlanCard(item));
    });

    [
        {
            label: 'Recebimento',
            value: state.profile.payday ? `Dia ${state.profile.payday}` : 'Nao definido',
            description: nextPayday ? `${formatDate(toDateInput(nextPayday))} | ${formatDaysUntil(nextPayday)}` : 'Defina o dia em que o dinheiro costuma entrar.'
        },
        {
            label: 'Ritmo de revisao',
            value: getReviewMomentLabel(state.profile.reviewMoment),
            description: nextReviewDate ? `${formatDate(toDateInput(nextReviewDate))} | ${formatDaysUntil(nextReviewDate)}` : 'Use esse momento para revisar contas, metas e limites.'
        },
        {
            label: 'Reserva ideal',
            value: reserveMetrics.targetAmount > 0 ? formatCurrency(reserveMetrics.targetAmount) : 'Sem base ainda',
            description: reserveMetrics.targetAmount > 0 ? `${reserveLevel.label} | cerca de ${reserveMetrics.targetMonths} meses do custo base de ${formatCurrency(reserveMetrics.monthlyBase)}` : 'Cadastre renda e despesas essenciais para calcular.'
        },
        {
            label: 'Espaco para a meta',
            value: goalGap > 0 ? `Faltam ${formatCurrency(goalGap)}` : `Livre ${formatCurrency(Math.max(0, positiveBalance - recommendedGoal))}`,
            description: goalGap > 0 ? 'Sua sobra atual ainda nao cobre a meta do plano.' : 'Depois da meta, ainda resta folga projetada.'
        }
    ].forEach((item) => {
        dom.profileCycle.appendChild(createProfileCycleCard(item));
    });

    const actions = buildProfileActions(stats, reserveMetrics);
    actions.forEach((item) => {
        dom.profileActionPlan.appendChild(createProfileActionItem(item));
    });
}

function handleReserveSubmit(event) {
    event.preventDefault();
    const currentReserve = state.reserves.find((item) => item.id === state.editingReserveId);
    const reserve = normalizeReserve({
        id: state.editingReserveId || createId(),
        name: dom.reserveName.value,
        target: dom.reserveTarget.value,
        saved: dom.reserveSaved.value,
        monthlyGoal: dom.reserveMonthly.value,
        createdAt: currentReserve ? currentReserve.createdAt : undefined,
        updatedAt: new Date().toISOString()
    });

    if (!reserve) {
        showToast('Preencha uma reserva válida.');
        return;
    }

    if (state.editingReserveId) {
        state.reserves = state.reserves.map((item) => item.id === state.editingReserveId ? reserve : item);
    } else {
        state.reserves.push(reserve);
        if (!state.profile.mainReserveId) {
            state.profile.mainReserveId = reserve.id;
            saveProfile();
        }
    }

    saveReserves();
    resetReserveForm();
    render();
    showToast('Reserva salva.');
}

function handleReserveDeposit(event) {
    event.preventDefault();
    const reserveId = dom.reserveDepositSelect.value;
    const amount = normalizeMoney(dom.reserveDepositAmount.value);
    if (!reserveId || amount <= 0) {
        showToast('Escolha uma reserva e informe o valor.');
        return;
    }

    state.reserves = state.reserves.map((reserve) => {
        if (reserve.id !== reserveId) return reserve;
        return {
            ...reserve,
            saved: roundMoney(Math.min(reserve.target, reserve.saved + amount)),
            updatedAt: new Date().toISOString()
        };
    });

    dom.reserveDepositAmount.value = '';
    saveReserves();
    render();
    showToast('Valor guardado.');
}

function handleReserveClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'edit-reserve') editReserve(id);
    if (action === 'delete-reserve') deleteReserve(id);
}

function editReserve(id) {
    const reserve = getReserveById(id);
    if (!reserve) return;
    state.editingReserveId = id;
    dom.reserveId.value = id;
    dom.reserveName.value = reserve.name;
    dom.reserveTarget.value = reserve.target;
    dom.reserveSaved.value = reserve.saved;
    dom.reserveMonthly.value = reserve.monthlyGoal;
    dom.reserveSubmit.querySelector('span').textContent = 'Salvar';
    dom.reserveSubmit.querySelector('i').className = 'fa-solid fa-check';
    dom.reserveCancel.classList.remove('hidden');
    setActiveTab('reserve');
    dom.reserveForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteReserve(id) {
    const reserve = getReserveById(id);
    if (!reserve) return;
    if (!window.confirm(`Excluir a reserva "${reserve.name}"?`)) return;
    state.reserves = state.reserves.filter((item) => item.id !== id);
    if (state.profile.mainReserveId === id) {
        state.profile.mainReserveId = '';
        saveProfile();
    }
    saveReserves();
    resetReserveForm();
    render();
    showToast('Reserva excluída.');
}

function resetReserveForm() {
    state.editingReserveId = null;
    dom.reserveForm.reset();
    dom.reserveId.value = '';
    dom.reserveSubmit.querySelector('span').textContent = 'Salvar reserva';
    dom.reserveSubmit.querySelector('i').className = 'fa-solid fa-plus';
    dom.reserveCancel.classList.add('hidden');
}

function renderReserves() {
    clearElement(dom.reserveList);
    if (state.reserves.length === 0) {
        dom.reserveList.appendChild(createEmptyBlock('Nenhuma reserva criada.'));
        return;
    }

    state.reserves.forEach((reserve) => {
        const percent = getReservePercent(reserve);
        const months = reserve.monthlyGoal > 0 ? Math.ceil(Math.max(0, reserve.target - reserve.saved) / reserve.monthlyGoal) : null;
        const row = document.createElement('article');
        row.className = 'entity-card';
        row.innerHTML = `
            <div class="entity-body">
                <div class="entity-title-row">
                    <strong>${escapeHtml(reserve.name)}</strong>
                    <span>${Math.round(percent)}%</span>
                </div>
                <div class="bar-track mt-3">
                    <div class="bar-fill bg-green-500" style="width: ${Math.min(100, percent)}%"></div>
                </div>
                <div class="forecast-meta mt-3">
                    <span>${formatCurrency(reserve.saved)} guardado</span>
                    <span>Alvo ${formatCurrency(reserve.target)}</span>
                    <span>${months ? `${months} meses no ritmo atual` : 'Sem aporte mensal'}</span>
                </div>
            </div>
            <div class="entity-actions">
                <button type="button" class="row-action" data-action="edit-reserve" data-id="${reserve.id}" aria-label="Editar reserva">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="row-action danger" data-action="delete-reserve" data-id="${reserve.id}" aria-label="Excluir reserva">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        dom.reserveList.appendChild(row);
    });
}

function handleInvestmentSubmit(event) {
    event.preventDefault();
    hideToast();

    if (state.investmentEntryMode === 'market') {
        updateSelectedInvestmentAsset();
    }

    const currentInvestment = state.investments.find((item) => item.id === state.editingInvestmentId);
    const investment = normalizeInvestment({
        id: state.editingInvestmentId || createId(),
        name: dom.investmentName.value,
        type: dom.investmentType.value,
        code: dom.investmentCode.value,
        quantity: dom.investmentQuantity.value,
        initialAmount: dom.investmentAmount.value,
        monthlyContribution: dom.investmentMonthly.value,
        monthlyRate: dom.investmentRate.value,
        startDate: dom.investmentStartDate.value,
        notes: dom.investmentNotes.value,
        createdAt: currentInvestment ? currentInvestment.createdAt : undefined,
        updatedAt: new Date().toISOString()
    });

    if (!investment) {
        showToast('Preencha nome, valor inicial e data do investimento.');
        return;
    }
    if (state.investmentEntryMode === 'market' && (!investment.code || investment.quantity <= 0)) {
        showToast('Escolha o ativo e informe a quantidade comprada.');
        return;
    }

    if (state.editingInvestmentId) {
        state.investments = state.investments.map((item) => item.id === state.editingInvestmentId ? investment : item);
    } else {
        state.investments.push(investment);
    }

    saveInvestments();
    resetInvestmentForm();
    render();
    refreshInvestmentMarketData(true);
    showToast('Investimento salvo.');
}

function handleInvestmentClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'edit-investment') editInvestment(id);
    if (action === 'delete-investment') deleteInvestment(id);
}

function editInvestment(id) {
    const investment = state.investments.find((item) => item.id === id);
    if (!investment) return;

    state.investmentEntryMode = isAutomaticMarketInvestment(investment) ? 'market' : 'manual';
    state.editingInvestmentId = id;
    dom.investmentId.value = id;
    dom.investmentName.value = investment.name;
    dom.investmentType.value = investment.type;
    dom.investmentCode.value = investment.code || '';
    dom.investmentQuantity.value = investment.quantity || '';
    dom.investmentAmount.value = investment.initialAmount;
    dom.investmentMonthly.value = investment.monthlyContribution || '';
    dom.investmentRate.value = investment.monthlyRate || '';
    dom.investmentStartDate.value = investment.startDate;
    dom.investmentNotes.value = investment.notes || '';
    dom.investmentSubmit.querySelector('span').textContent = 'Salvar';
    dom.investmentSubmit.querySelector('i').className = 'fa-solid fa-check';
    dom.investmentCancel.classList.remove('hidden');
    updateInvestmentModeUi();
    if (state.investmentEntryMode === 'market') {
        dom.investmentType.value = investment.type;
        populateInvestmentAssetPresets();
        dom.investmentAssetPreset.value = investment.code || dom.investmentAssetPreset.value;
        updateSelectedInvestmentAsset();
        dom.investmentQuantity.value = investment.quantity || '';
        renderInvestmentMarketPreview();
    }
    setActiveTab('investments');
    dom.investmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteInvestment(id) {
    const investment = state.investments.find((item) => item.id === id);
    if (!investment) return;
    if (!window.confirm(`Excluir o investimento "${investment.name}"?`)) return;

    state.investments = state.investments.filter((item) => item.id !== id);
    saveInvestments();
    resetInvestmentForm();
    render();
    showToast('Investimento excluído.');
}

function resetInvestmentForm() {
    state.editingInvestmentId = null;
    state.investmentEntryMode = 'market';
    dom.investmentForm.reset();
    dom.investmentId.value = '';
    dom.investmentType.value = 'currency';
    dom.investmentCode.value = '';
    dom.investmentStartDate.value = getTodayDate();
    dom.investmentSubmit.querySelector('span').textContent = 'Salvar investimento';
    dom.investmentSubmit.querySelector('i').className = 'fa-solid fa-plus';
    dom.investmentCancel.classList.add('hidden');
    updateInvestmentModeUi();
}

function renderInvestments() {
    refreshInvestmentMarketData();
    renderInvestmentSummary();
    clearElement(dom.investmentList);

    if (state.investments.length === 0) {
        dom.investmentList.appendChild(createEmptyBlock('Cadastre moedas, cripto, poupança ou outros investimentos para acompanhar a simulação.'));
        return;
    }

    state.investments
        .map((investment) => ({
            investment,
            marketData: getInvestmentMarketEntry(investment),
            projection: getInvestmentProjection(investment, state.selectedMonth)
        }))
        .sort((a, b) => b.projection.estimatedValue - a.projection.estimatedValue)
        .forEach(({ investment, marketData, projection }) => {
            const historyPreview = projection.history
                .slice(-4)
                .map((entry) => `<span>${formatMonthLabel(entry.monthKey)}: ${formatCurrency(entry.value)}</span>`)
                .join('');
            const effectiveRate = getInvestmentEffectiveMonthlyRate(investment, marketData);
            const marketBadges = buildInvestmentMarketBadges(investment, marketData);

            const row = document.createElement('article');
            row.className = 'entity-card';
            row.innerHTML = `
                <div class="entity-body">
                    <div class="entity-title-row">
                        <strong>${escapeHtml(investment.name)}</strong>
                        <span>${formatCurrency(projection.estimatedValue)}</span>
                    </div>
                    <div class="badge-row mt-3">
                        ${renderInvestmentBadge(INVESTMENT_TYPE_LABELS[investment.type] || 'Investimento', 'bg-emerald-100 text-emerald-800')}
                        ${investment.code ? renderInvestmentBadge(investment.code, 'bg-slate-200 text-slate-700') : ''}
                        ${investment.quantity > 0 ? renderInvestmentBadge(`${formatQuantity(investment.quantity)} unidades`, 'bg-blue-100 text-blue-800') : ''}
                        ${marketBadges}
                    </div>
                    <div class="forecast-meta mt-3">
                        <span>Aportado ${formatCurrency(projection.totalInvested)}</span>
                        <span>Lucro estimado ${formatCurrency(projection.estimatedProfit)}</span>
                        <span>Rendeu ${formatCurrency(projection.lastMonthGain)} em ${formatMonthLabel(state.selectedMonth)}</span>
                        <span>Base mensal ${formatPercent(effectiveRate)} ao mês</span>
                        <span>Aporte mensal ${formatCurrency(investment.monthlyContribution)}</span>
                        <span>Desde ${formatDate(investment.startDate)}</span>
                    </div>
                    <div class="forecast-meta mt-3">
                        ${historyPreview || '<span>A simulação começa no mês do primeiro aporte.</span>'}
                    </div>
                    ${investment.notes ? `<p class="text-sm text-slate-500 mt-3">${escapeHtml(investment.notes)}</p>` : ''}
                </div>
                <div class="entity-actions">
                    <button type="button" class="row-action" data-action="edit-investment" data-id="${investment.id}" aria-label="Editar investimento">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="row-action danger" data-action="delete-investment" data-id="${investment.id}" aria-label="Excluir investimento">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            dom.investmentList.appendChild(row);
        });
}

function renderInvestmentSummary() {
    clearElement(dom.investmentSummary);

    if (state.investments.length === 0) {
        dom.investmentSummary.appendChild(createEmptyBlock('Sem ativos ainda. Cadastre um investimento para ver a carteira simulada.'));
        return;
    }

    const projections = state.investments.map((investment) => ({
        investment,
        marketData: getInvestmentMarketEntry(investment),
        projection: getInvestmentProjection(investment, state.selectedMonth)
    }));

    const totals = projections.reduce((accumulator, item) => {
        accumulator.totalInvested += item.projection.totalInvested;
        accumulator.estimatedValue += item.projection.estimatedValue;
        accumulator.estimatedProfit += item.projection.estimatedProfit;
        accumulator.monthGain += item.projection.lastMonthGain;
        return accumulator;
    }, {
        totalInvested: 0,
        estimatedValue: 0,
        estimatedProfit: 0,
        monthGain: 0
    });

    const best = projections.reduce((currentBest, item) => {
        if (!currentBest) return item;
        return item.projection.estimatedProfit > currentBest.projection.estimatedProfit ? item : currentBest;
    }, null);

    const summaryItems = [
        { icon: 'fa-layer-group', label: 'Ativos cadastrados', value: String(state.investments.length) },
        { icon: 'fa-wallet', label: 'Total aportado', value: formatCurrency(totals.totalInvested) },
        { icon: 'fa-chart-line', label: 'Patrimônio estimado', value: formatCurrency(totals.estimatedValue) },
        { icon: 'fa-sack-dollar', label: `Lucro estimado até ${formatMonthLabel(state.selectedMonth)}`, value: formatCurrency(totals.estimatedProfit) },
        { icon: 'fa-calendar-plus', label: `Rendimento de ${formatMonthLabel(state.selectedMonth)}`, value: formatCurrency(totals.monthGain) },
        { icon: 'fa-trophy', label: 'Maior lucro estimado', value: best ? `${best.investment.name}: ${formatCurrency(best.projection.estimatedProfit)}` : 'Nenhum' }
    ];

    if (hasAutomaticMarketInvestments()) {
        if (state.investmentMarketStatus === 'loading') {
            summaryItems.push({ icon: 'fa-arrows-rotate', label: 'Mercado', value: 'Atualizando cotações automáticas' });
        } else if (state.investmentMarketStatus === 'error') {
            summaryItems.push({ icon: 'fa-triangle-exclamation', label: 'Mercado', value: 'Falha na AwesomeAPI, usando base manual' });
        } else if (state.investmentMarketFetchedAt) {
            summaryItems.push({ icon: 'fa-satellite-dish', label: 'Mercado', value: `AwesomeAPI atualizada em ${formatDateTime(state.investmentMarketFetchedAt)}` });
        }
    }

    summaryItems.forEach((item) => dom.investmentSummary.appendChild(createInsightTile(item)));
}

function getInvestmentProjection(investment, monthKey = getMonthKey(getTodayDate())) {
    const targetMonthKey = monthKey || getMonthKey(getTodayDate());
    const currentMonthKey = getMonthKey(getTodayDate());
    const startMonthKey = getMonthKey(investment.startDate);
    const monthsElapsed = getMonthDifference(startMonthKey, targetMonthKey);
    const marketData = getInvestmentMarketEntry(investment);
    const monthlyRate = getInvestmentEffectiveMonthlyRate(investment, marketData);
    const monthlyRateFactor = monthlyRate / 100;
    let currentValue = investment.initialAmount;
    let totalInvested = investment.initialAmount;

    const history = [{
        monthKey: startMonthKey,
        value: roundMoney(currentValue),
        gain: 0,
        invested: roundMoney(totalInvested)
    }];

    for (let index = 1; index <= monthsElapsed; index += 1) {
        currentValue = roundMoney(currentValue + investment.monthlyContribution);
        totalInvested = roundMoney(totalInvested + investment.monthlyContribution);
        const gain = roundMoney(currentValue * monthlyRateFactor);
        currentValue = roundMoney(currentValue + gain);
        history.push({
            monthKey: getMonthKey(addMonths(investment.startDate, index)),
            value: roundMoney(currentValue),
            gain,
            invested: roundMoney(totalInvested)
        });
    }

    if (marketData && investment.quantity > 0 && targetMonthKey === currentMonthKey) {
        const marketValue = roundMoney(investment.quantity * marketData.bid);
        const lastEntry = history[history.length - 1];
        const monthlyChangePercent = Number.isFinite(marketData.monthlyPctChange) ? marketData.monthlyPctChange : monthlyRate;
        const previousValue = monthlyChangePercent === -100
            ? 0
            : roundMoney(marketValue / (1 + (monthlyChangePercent / 100)));
        const marketGain = roundMoney(marketValue - previousValue);

        lastEntry.value = marketValue;
        lastEntry.gain = marketGain;
        lastEntry.invested = roundMoney(totalInvested);
        currentValue = marketValue;
    }

    const lastEntry = history[history.length - 1];
    return {
        monthsElapsed,
        totalInvested: roundMoney(totalInvested),
        estimatedValue: roundMoney(currentValue),
        estimatedProfit: roundMoney(currentValue - totalInvested),
        lastMonthGain: roundMoney(lastEntry ? lastEntry.gain : 0),
        history
    };
}

function getMonthDifference(startMonthKey, endMonthKey) {
    const [startYear, startMonth] = startMonthKey.split('-').map(Number);
    const [endYear, endMonth] = endMonthKey.split('-').map(Number);
    const difference = (endYear - startYear) * 12 + (endMonth - startMonth);
    return Math.max(0, difference);
}

function hasAutomaticMarketInvestments() {
    return state.investments.some((investment) => isAutomaticMarketInvestment(investment));
}

function isAutomaticMarketInvestment(investment) {
    return Boolean(investment)
        && (investment.type === 'currency' || investment.type === 'crypto')
        && Boolean(getInvestmentSymbol(investment));
}

function getInvestmentSymbol(investment) {
    const code = String(investment && investment.code ? investment.code : '').trim().toUpperCase();
    return code ? `${code}-BRL` : '';
}

function getInvestmentMarketEntry(investment) {
    const symbol = getInvestmentSymbol(investment);
    return symbol ? (state.investmentMarketData[symbol] || null) : null;
}

function getInvestmentEffectiveMonthlyRate(investment, marketData) {
    if (marketData && Number.isFinite(marketData.monthlyPctChange)) {
        return marketData.monthlyPctChange;
    }
    return Number(investment.monthlyRate || 0);
}

function buildInvestmentMarketBadges(investment, marketData) {
    if (!isAutomaticMarketInvestment(investment)) return '';
    if (!marketData) return renderInvestmentBadge('Cotação automática pendente', 'bg-yellow-100 text-yellow-800');

    let badges = renderInvestmentBadge(`Cotação ${formatCurrency(marketData.bid)}`, 'bg-brand-50 text-brand-700');
    if (Number.isFinite(marketData.pctChange)) {
        badges += renderInvestmentBadge(`24h ${formatPercent(marketData.pctChange)}`, marketData.pctChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');
    }
    if (Number.isFinite(marketData.monthlyPctChange)) {
        badges += renderInvestmentBadge(`30d ${formatPercent(marketData.monthlyPctChange)}`, marketData.monthlyPctChange >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-700');
    }
    return badges;
}

async function refreshInvestmentMarketData(force = false) {
    const symbols = Array.from(new Set(
        state.investments
            .filter((investment) => isAutomaticMarketInvestment(investment))
            .map((investment) => getInvestmentSymbol(investment))
            .filter(Boolean)
    )).sort();

    if (!symbols.length) {
        state.investmentMarketData = {};
        state.investmentMarketStatus = 'idle';
        state.investmentMarketError = '';
        state.investmentMarketFetchedAt = 0;
        state.investmentMarketRequestKey = '';
        return;
    }

    const requestKey = symbols.join(',');
    const cacheIsFresh = state.investmentMarketFetchedAt > 0
        && (Date.now() - state.investmentMarketFetchedAt) < INVESTMENT_MARKET_CACHE_MS;

    if (!force
        && state.investmentMarketRequestKey === requestKey
        && cacheIsFresh
        && (state.investmentMarketStatus === 'ready' || state.investmentMarketStatus === 'error')) {
        return;
    }

    if (state.investmentMarketRequestKey === requestKey && state.investmentMarketStatus === 'loading') {
        return;
    }

    state.investmentMarketRequestKey = requestKey;
    state.investmentMarketStatus = 'loading';
    state.investmentMarketError = '';

    try {
        const payload = await fetchInvestmentMarketPayload(symbols, requestKey);
        state.investmentMarketData = payload && payload.quotes && typeof payload.quotes === 'object' ? payload.quotes : {};
        state.investmentMarketStatus = 'ready';
        state.investmentMarketError = '';
        state.investmentMarketFetchedAt = Date.now();
    } catch (error) {
        console.error('Falha ao atualizar cotações de investimento:', error);
        state.investmentMarketStatus = 'error';
        state.investmentMarketError = error && error.message ? error.message : 'Erro ao buscar cotações';
        state.investmentMarketFetchedAt = Date.now();
    }

    renderInvestmentMarketPreview();
    renderInvestments();
}

async function fetchInvestmentMarketPayload(symbols, requestKey) {
    try {
        return await fetchAwesomeMarketPayload(symbols);
    } catch (directError) {
        console.warn('AwesomeAPI direta indisponível, tentando proxy local de cotações:', directError);
    }

    if (!RUNNING_FROM_FILE) {
        const response = await fetch(`/api/awesome/market?symbols=${encodeURIComponent(requestKey)}`);
        if (!response.ok) {
            throw new Error(`proxy HTTP ${response.status}`);
        }
        return response.json();
    }

    throw new Error('Não foi possível acessar a AwesomeAPI direto do navegador.');
}

async function fetchAwesomeMarketPayload(symbols) {
    const quotesResponse = await fetch(`${AWESOMEAPI_BASE_URL}/json/last/${encodeURIComponent(symbols.join(','))}`);
    if (!quotesResponse.ok) {
        throw new Error(`AwesomeAPI HTTP ${quotesResponse.status}`);
    }

    const quotesPayload = await quotesResponse.json();
    const quotes = {};
    const errors = {};

    await Promise.all(symbols.map(async (symbol) => {
        const key = symbol.replace('-', '');
        const quote = quotesPayload[key];
        if (!quote || typeof quote !== 'object') {
            errors[symbol] = 'Cotação não encontrada.';
            return;
        }

        const normalized = normalizeAwesomeQuote(symbol, quote);
        try {
            const dailyResponse = await fetch(`${AWESOMEAPI_BASE_URL}/json/daily/${encodeURIComponent(symbol)}/30`);
            if (!dailyResponse.ok) {
                throw new Error(`HTTP ${dailyResponse.status}`);
            }
            normalized.monthlyPctChange = computeMonthlyMarketChange(await dailyResponse.json());
        } catch (error) {
            normalized.monthlyPctChange = null;
            errors[symbol] = error && error.message ? error.message : 'Falha no histórico de 30 dias.';
        }
        quotes[symbol] = normalized;
    }));

    return {
        provider: 'awesomeapi-direct',
        fetchedAt: new Date().toISOString(),
        quotes,
        errors
    };
}

function normalizeAwesomeQuote(symbol, quote) {
    return {
        symbol,
        code: String(quote.code || '').toUpperCase(),
        codein: String(quote.codein || '').toUpperCase(),
        name: String(quote.name || symbol),
        bid: toNumber(quote.bid),
        ask: toNumber(quote.ask),
        high: toNumber(quote.high),
        low: toNumber(quote.low),
        pctChange: toNumber(quote.pctChange),
        varBid: toNumber(quote.varBid),
        timestamp: String(quote.timestamp || ''),
        createDate: String(quote.create_date || '')
    };
}

function computeMonthlyMarketChange(rows) {
    if (!Array.isArray(rows)) return null;
    const bids = rows
        .map((row) => row && typeof row === 'object' ? toNumber(row.bid) : 0)
        .filter((value) => value > 0);

    if (bids.length < 2) return null;
    const latest = bids[0];
    const oldest = bids[bids.length - 1];
    if (oldest <= 0) return null;
    return Math.round((((latest / oldest) - 1) * 100) * 100) / 100;
}

function renderInvestmentBadge(text, className) {
    return `<span class="mini-badge ${className}">${escapeHtml(text)}</span>`;
}

function handlePlannedSubmit(event) {
    event.preventDefault();
    const currentBill = state.plannedBills.find((item) => item.id === state.editingPlannedId);
    const bill = normalizePlannedBill({
        id: state.editingPlannedId || createId(),
        name: dom.plannedName.value,
        amount: dom.plannedAmount.value,
        dueDate: dom.plannedDueDate.value,
        category: dom.plannedCategory.value,
        necessity: dom.plannedNecessity.value,
        cardId: dom.plannedCardSelect.value,
        active: dom.plannedActive.checked,
        repeatMonthly: dom.plannedRepeat.checked,
        createdAt: currentBill ? currentBill.createdAt : undefined,
        updatedAt: new Date().toISOString()
    });

    if (!bill) {
        showToast('Preencha uma conta prevista válida.');
        return;
    }

    if (state.editingPlannedId) {
        state.plannedBills = state.plannedBills.map((item) => item.id === state.editingPlannedId ? bill : item);
        syncLinkedPlannedTransactions(bill, state.selectedMonth);
    } else {
        state.plannedBills.push(bill);
    }

    savePlannedBills();
    syncPlannedForMonth(state.selectedMonth, true);
    resetPlannedForm();
    render();
    showToast('Conta prevista salva.');
}

function handlePlannedClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, id, cardId } = button.dataset;
    if (action === 'toggle-card-bill-paid') toggleCardBillPaid(cardId);
    if (action === 'toggle-account-paid') togglePaid(id);
    if (action === 'edit-account-transaction') startEdit(id);
    if (action === 'delete-account-transaction') deleteTransaction(id);
    if (action === 'edit-planned') editPlanned(id);
    if (action === 'delete-planned') deletePlanned(id);
    if (action === 'toggle-planned') togglePlanned(id);
}

function editPlanned(id) {
    const bill = state.plannedBills.find((item) => item.id === id);
    if (!bill) return;
    state.editingPlannedId = id;
    dom.plannedId.value = id;
    dom.plannedName.value = bill.name;
    dom.plannedAmount.value = bill.amount;
    dom.plannedDueDate.value = bill.dueDate;
    dom.plannedCategory.value = bill.category;
    dom.plannedNecessity.value = bill.necessity;
    dom.plannedCardSelect.value = bill.cardId || '';
    dom.plannedActive.checked = bill.active;
    dom.plannedRepeat.checked = bill.repeatMonthly;
    dom.plannedSubmit.querySelector('span').textContent = 'Salvar';
    dom.plannedSubmit.querySelector('i').className = 'fa-solid fa-check';
    dom.plannedCancel.classList.remove('hidden');
    setActiveTab('planned');
    dom.plannedForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deletePlanned(id) {
    const bill = state.plannedBills.find((item) => item.id === id);
    if (!bill) return;
    if (!window.confirm(`Excluir a conta prevista "${bill.name}"?`)) return;
    state.plannedBills = state.plannedBills.filter((item) => item.id !== id);
    savePlannedBills();
    resetPlannedForm();
    render();
    showToast('Conta prevista excluída.');
}

function togglePlanned(id) {
    state.plannedBills = state.plannedBills.map((bill) => {
        if (bill.id !== id) return bill;
        return {
            ...bill,
            active: !bill.active,
            updatedAt: new Date().toISOString()
        };
    });
    savePlannedBills();
    render();
}

function resetPlannedForm() {
    state.editingPlannedId = null;
    dom.plannedForm.reset();
    dom.plannedId.value = '';
    dom.plannedDueDate.value = getTodayDate();
    dom.plannedCardSelect.value = '';
    dom.plannedActive.checked = true;
    dom.plannedRepeat.checked = false;
    dom.plannedSubmit.querySelector('span').textContent = 'Salvar conta';
    dom.plannedSubmit.querySelector('i').className = 'fa-solid fa-plus';
    dom.plannedCancel.classList.add('hidden');
}

function renderPlannedBills() {
    clearElement(dom.plannedList);

    const accountRows = getAccountAgendaRows();
    if (accountRows.length === 0 && state.plannedBills.length === 0) {
        dom.plannedList.appendChild(createEmptyBlock('Nenhuma conta ou parcela para este mês.'));
        return;
    }

    if (accountRows.length > 0) {
        const heading = document.createElement('div');
        heading.className = 'list-subheading';
        heading.textContent = 'Vencimentos do mês';
        dom.plannedList.appendChild(heading);

        accountRows.forEach((account) => {
            dom.plannedList.appendChild(createAccountAgendaRow(account));
        });
    }

    if (state.plannedBills.length > 0) {
        const heading = document.createElement('div');
        heading.className = 'list-subheading';
        heading.textContent = 'Cadastros recorrentes e previstos';
        dom.plannedList.appendChild(heading);
    }

    state.plannedBills.forEach((bill) => {
        const dueDate = getBillDueDateForMonth(bill, state.selectedMonth) || bill.dueDate;
        const generatedTransaction = state.transactions.find((transaction) => transaction.plannedBillId === bill.id && getMonthKey(transaction.date) === state.selectedMonth);
        const generated = Boolean(generatedTransaction);
        const overdue = generatedTransaction ? isOverdueTransaction(generatedTransaction) : dueDate < getTodayDate();
        const row = document.createElement('article');
        row.className = 'entity-card';
        row.innerHTML = `
            <div class="entity-body">
                <div class="entity-title-row">
                    <strong>${escapeHtml(bill.name)}</strong>
                    <span>${bill.active ? 'Ativa' : 'Pausada'}</span>
                </div>
                <div class="forecast-meta mt-2">
                    <span>${formatCurrency(bill.amount)}</span>
                    <span>Vence ${formatDate(dueDate)}</span>
                    <span>${CATEGORY_LABELS[bill.category]}</span>
                    <span>${bill.cardId ? getCardName(bill.cardId) : 'Sem cartão'}</span>
                    <span>${bill.repeatMonthly ? 'Mensal' : 'Única'}</span>
                    <span>${generated ? 'Lançada neste mês' : 'Ainda não lançada'}</span>
                    <span class="${overdue ? 'text-red-700' : 'text-slate-500'}">${overdue ? 'Atrasada' : 'No prazo'}</span>
                </div>
            </div>
            <div class="entity-actions">
                <button type="button" class="row-action" data-action="toggle-planned" data-id="${bill.id}" aria-label="Ativar ou pausar conta">
                    <i class="fa-solid ${bill.active ? 'fa-pause' : 'fa-play'}"></i>
                </button>
                <button type="button" class="row-action" data-action="edit-planned" data-id="${bill.id}" aria-label="Editar conta">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="row-action danger" data-action="delete-planned" data-id="${bill.id}" aria-label="Excluir conta">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        dom.plannedList.appendChild(row);
    });
}

function getAccountAgendaRows() {
    const cardBillRows = state.cards.map((card) => {
        const transactions = state.transactions.filter((transaction) => {
            return transaction.type === 'expense'
                && transaction.cardId === card.id
                && getMonthKey(transaction.date) === state.selectedMonth;
        });

        if (transactions.length === 0) return null;

        const amount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const paid = transactions.every((transaction) => transaction.paid);
        const dueDate = buildBillDate(state.selectedMonth, card.dueDay);

        return {
            kind: 'card-bill',
            card,
            transactions,
            amount,
            paid,
            overdue: !paid && dueDate < getTodayDate(),
            date: dueDate,
            title: `Fatura ${card.name}`
        };
    }).filter(Boolean);

    const accountRows = state.transactions
        .filter((transaction) => {
            if (transaction.type !== 'expense') return false;
            if (getMonthKey(transaction.date) !== state.selectedMonth) return false;
            if (transaction.cardId) return false;
            return Boolean(transaction.plannedBillId || transaction.installmentGroupId || transaction.recurringGroupId);
        })
        .map((transaction) => ({
            kind: 'transaction',
            transaction,
            paid: transaction.paid,
            overdue: isOverdueTransaction(transaction),
            date: transaction.date,
            title: transaction.desc
        }));

    return cardBillRows.concat(accountRows)
        .sort((a, b) => {
            if (a.paid !== b.paid) return a.paid ? 1 : -1;
            return a.date.localeCompare(b.date) || a.title.localeCompare(b.title);
        });
}

function createAccountAgendaRow(account) {
    if (account.kind === 'card-bill') {
        return createCardBillAgendaRow(account);
    }

    const { transaction } = account;
    const overdue = isOverdueTransaction(transaction);
    const cardName = transaction.cardId ? getCardName(transaction.cardId) : '';
    const origin = getAccountOriginLabel(transaction);
    const row = document.createElement('article');
    row.className = `entity-card account-agenda-row ${transaction.paid ? 'is-paid' : ''} ${overdue ? 'is-overdue' : ''}`;
    row.innerHTML = `
        <div class="entity-body">
            <div class="entity-title-row">
                <strong>${escapeHtml(transaction.desc)}</strong>
                <span>${formatCurrency(transaction.amount)}</span>
            </div>
            <div class="forecast-meta mt-2">
                <span>Vence ${formatDate(transaction.date)}</span>
                <span>${transaction.paid ? 'Paga' : overdue ? 'Atrasada' : 'Pendente'}</span>
                <span>${CATEGORY_LABELS[transaction.category] || 'Outros'}</span>
                <span>${cardName || 'Sem cartão'}</span>
                <span>${origin}</span>
            </div>
        </div>
        <div class="entity-actions">
            <button type="button" class="row-action ${transaction.paid ? '' : 'pay-action'}" data-action="toggle-account-paid" data-id="${transaction.id}" aria-label="${transaction.paid ? 'Marcar como pendente' : 'Marcar como paga'}">
                <i class="fa-solid ${transaction.paid ? 'fa-rotate-left' : 'fa-circle-check'}"></i>
            </button>
            <button type="button" class="row-action" data-action="edit-account-transaction" data-id="${transaction.id}" aria-label="Editar lançamento">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="row-action danger" data-action="delete-account-transaction" data-id="${transaction.id}" aria-label="Excluir lançamento">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    return row;
}

function createCardBillAgendaRow(account) {
    const { card, transactions, amount, paid, overdue, date } = account;
    const row = document.createElement('article');
    row.className = `entity-card account-agenda-row card-bill-row ${paid ? 'is-paid' : ''} ${overdue ? 'is-overdue' : ''}`;
    row.innerHTML = `
        <div class="entity-body">
            <div class="entity-title-row">
                <strong>${escapeHtml(account.title)}</strong>
                <span>${formatCurrency(amount)}</span>
            </div>
            <div class="forecast-meta mt-2">
                <span>Vence ${formatDate(date)}</span>
                <span>${paid ? 'Paga' : overdue ? 'Atrasada' : 'Pendente'}</span>
                <span>${transactions.length} compra${transactions.length === 1 ? '' : 's'} no cartão</span>
                <span>Limite ${formatCurrency(getCardUsage(card, state.selectedMonth).limitUsed)} usado</span>
            </div>
        </div>
        <div class="entity-actions">
            <button type="button" class="row-action ${paid ? '' : 'pay-action'}" data-action="toggle-card-bill-paid" data-card-id="${card.id}" aria-label="${paid ? 'Marcar fatura como pendente' : 'Marcar fatura como paga'}">
                <i class="fa-solid ${paid ? 'fa-rotate-left' : 'fa-circle-check'}"></i>
            </button>
        </div>
    `;
    return row;
}

function toggleCardBillPaid(cardId) {
    if (!cardId) return;

    const monthTransactions = state.transactions.filter((transaction) => {
        return transaction.type === 'expense'
            && transaction.cardId === cardId
            && getMonthKey(transaction.date) === state.selectedMonth;
    });

    if (monthTransactions.length === 0) return;

    const shouldMarkPaid = !monthTransactions.every((transaction) => transaction.paid);
    state.transactions = state.transactions.map((transaction) => {
        if (transaction.type !== 'expense' || transaction.cardId !== cardId || getMonthKey(transaction.date) !== state.selectedMonth) {
            return transaction;
        }

        const nextTransaction = {
            ...transaction,
            paid: shouldMarkPaid,
            updatedAt: new Date().toISOString()
        };
        reconcileReserveContribution(transaction, nextTransaction);
        return nextTransaction;
    });

    saveTransactions();
    render();
    showToast(shouldMarkPaid ? 'Fatura marcada como paga.' : 'Fatura voltou para pendente.');
}

function markSelectedMonthBillsPaid() {
    const rows = getAccountAgendaRows();
    const transactionIds = new Set();

    rows.forEach((account) => {
        if (account.kind === 'card-bill') {
            account.transactions.forEach((transaction) => {
                if (!transaction.paid) transactionIds.add(transaction.id);
            });
            return;
        }

        if (account.transaction && !account.transaction.paid) {
            transactionIds.add(account.transaction.id);
        }
    });

    if (transactionIds.size === 0) {
        showToast('Não há contas pendentes neste mês.');
        return;
    }

    state.transactions = state.transactions.map((transaction) => {
        if (!transactionIds.has(transaction.id)) return transaction;
        const nextTransaction = {
            ...transaction,
            paid: true,
            updatedAt: new Date().toISOString()
        };
        reconcileReserveContribution(transaction, nextTransaction);
        return nextTransaction;
    });

    saveTransactions();
    render();
    showToast(`${transactionIds.size} conta${transactionIds.size === 1 ? '' : 's'} marcada${transactionIds.size === 1 ? '' : 's'} como paga${transactionIds.size === 1 ? '' : 's'}.`);
}

function getAccountOriginLabel(transaction) {
    if (transaction.installmentGroupId) return `Parcela ${transaction.installmentIndex}/${transaction.installmentTotal}`;
    if (transaction.plannedBillId) return 'Conta prevista';
    if (transaction.recurringGroupId) return 'Recorrente';
    if (transaction.cardId) return 'Cartão';
    return 'Conta';
}

function getNextDueAccount() {
    const today = getTodayDate();
    const openRows = getAccountAgendaRows().filter((account) => !account.paid);
    const overdue = openRows
        .filter((account) => account.date < today)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (overdue) return { ...overdue, title: `Atrasado: ${overdue.title}` };

    return openRows
        .filter((account) => account.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

function handleCardSubmit(event) {
    event.preventDefault();
    const currentCard = state.cards.find((item) => item.id === state.editingCardId);
    const card = normalizeCard({
        id: state.editingCardId || createId(),
        name: dom.cardName.value,
        limit: dom.cardLimit.value,
        closingDay: dom.cardClosing.value,
        dueDay: dom.cardDue.value,
        color: dom.cardColor.value,
        createdAt: currentCard ? currentCard.createdAt : undefined,
        updatedAt: new Date().toISOString()
    });

    if (!card) {
        showToast('Preencha um cartão válido.');
        return;
    }

    if (state.editingCardId) {
        state.cards = state.cards.map((item) => item.id === state.editingCardId ? card : item);
    } else {
        state.cards.push(card);
    }

    saveCards();
    resetCardForm();
    render();
    showToast('Cartão salvo.');
}

function handleCardClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'edit-card') editCard(id);
    if (action === 'delete-card') deleteCard(id);
}

function editCard(id) {
    const card = getCardById(id);
    if (!card) return;
    state.editingCardId = id;
    dom.cardId.value = id;
    dom.cardName.value = card.name;
    dom.cardLimit.value = card.limit;
    dom.cardClosing.value = card.closingDay;
    dom.cardDue.value = card.dueDay;
    dom.cardColor.value = card.color;
    dom.cardSubmit.querySelector('span').textContent = 'Salvar';
    dom.cardSubmit.querySelector('i').className = 'fa-solid fa-check';
    dom.cardCancel.classList.remove('hidden');
    setActiveTab('cards');
    dom.cardForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteCard(id) {
    const card = getCardById(id);
    if (!card) return;
    if (!window.confirm(`Excluir o cartão "${card.name}"? As transações continuam salvas sem vínculo ao cartão.`)) return;
    state.cards = state.cards.filter((item) => item.id !== id);
    state.transactions = state.transactions.map((transaction) => transaction.cardId === id ? { ...transaction, cardId: '' } : transaction);
    state.plannedBills = state.plannedBills.map((bill) => bill.cardId === id ? { ...bill, cardId: '', updatedAt: new Date().toISOString() } : bill);
    saveCards();
    savePlannedBills();
    saveTransactions();
    resetCardForm();
    render();
    showToast('Cartão excluído.');
}

function resetCardForm() {
    state.editingCardId = null;
    dom.cardForm.reset();
    dom.cardId.value = '';
    dom.cardClosing.value = 1;
    dom.cardDue.value = 10;
    dom.cardSubmit.querySelector('span').textContent = 'Salvar cartão';
    dom.cardSubmit.querySelector('i').className = 'fa-solid fa-plus';
    dom.cardCancel.classList.add('hidden');
}

function renderCards() {
    clearElement(dom.cardList);
    if (state.cards.length === 0) {
        dom.cardList.appendChild(createEmptyBlock('Nenhum cartão cadastrado.'));
        return;
    }

    state.cards.forEach((card) => {
        const usage = getCardUsage(card, state.selectedMonth);
        const overLimit = usage.limitUsed > card.limit;
        const percent = card.limit > 0 ? Math.min(100, usage.limitUsed / card.limit * 100) : 0;
        const row = document.createElement('article');
        row.className = `entity-card card-entity ${overLimit ? 'card-over-limit' : ''}`;
        row.style.borderColor = card.color;
        row.innerHTML = `
            <div class="entity-body">
                <div class="entity-title-row">
                    <strong>${escapeHtml(card.name)}</strong>
                    <span>${formatCurrency(usage.available)} livre</span>
                </div>
                <div class="bar-track mt-3">
                    <div class="bar-fill bg-blue-500" style="width: ${percent}%"></div>
                </div>
                <div class="forecast-meta mt-3">
                    <span>Limite ${formatCurrency(card.limit)}</span>
                    <span>Fatura ${formatCurrency(usage.currentBill)}</span>
                    <span>Limite usado ${formatCurrency(usage.limitUsed)}</span>
                    <span>Fecha dia ${card.closingDay}</span>
                    <span>Vence dia ${card.dueDay}</span>
                    <span>Futuro ${formatCurrency(usage.futureInstallments)}</span>
                    ${overLimit ? `<span class="mini-badge bg-red-100 text-red-700">Limite estourado em ${formatCurrency(usage.limitUsed - card.limit)}</span>` : ''}
                </div>
            </div>
            <div class="entity-actions">
                <button type="button" class="row-action" data-action="edit-card" data-id="${card.id}" aria-label="Editar cartão">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="row-action danger" data-action="delete-card" data-id="${card.id}" aria-label="Excluir cartão">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        dom.cardList.appendChild(row);
    });
}

function renderPlanning() {
    clearElement(dom.planningSummary);
    clearElement(dom.planningList);
    renderGoals();

    const months = buildFutureMonths(12);
    const negativeMonths = months.filter((month) => month.projectedBalance < 0);
    const bestMonth = months.reduce((best, month) => month.projectedBalance > best.projectedBalance ? month : best, months[0]);
    const totalFutureBalance = months.reduce((sum, month) => sum + month.projectedBalance, 0);

    [
        { icon: 'fa-calendar-xmark', label: 'Meses em risco', value: String(negativeMonths.length) },
        { icon: 'fa-chart-line', label: 'Melhor mês', value: `${formatMonthLabel(bestMonth.monthKey)}: ${formatCurrency(bestMonth.projectedBalance)}` },
        { icon: 'fa-route', label: 'Saldo acumulado previsto', value: formatCurrency(totalFutureBalance) },
        { icon: 'fa-calendar-check', label: 'Contas previstas ativas', value: String(state.plannedBills.filter((bill) => bill.active).length) }
    ].forEach((item) => dom.planningSummary.appendChild(createInsightTile(item)));

    months.forEach((month) => {
        const row = document.createElement('article');
        row.className = `planning-card ${month.projectedBalance < 0 ? 'danger' : 'good'}`;
        row.innerHTML = `
            <div class="entity-title-row">
                <strong>${formatMonthLabel(month.monthKey)}</strong>
                <span>${formatCurrency(month.projectedBalance)}</span>
            </div>
            <div class="forecast-meta mt-3">
                <span>Entradas ${formatCurrency(month.expectedIncome)}</span>
                <span>Saídas ${formatCurrency(month.expectedExpense)}</span>
                <span>Compromisso ${Math.round(month.commitment)}%</span>
            </div>
        `;
        dom.planningList.appendChild(row);
    });
}

function handleGoalSubmit(event) {
    event.preventDefault();
    const goal = normalizeGoal({
        name: dom.goalName.value,
        target: dom.goalTarget.value,
        saved: dom.goalSaved.value
    });

    if (!goal) {
        showToast('Preencha nome e valor da meta.');
        return;
    }

    state.goals.push(goal);
    saveGoals();
    dom.goalForm.reset();
    renderPlanning();
    showToast('Meta salva.');
}

function handleGoalClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action !== 'delete-goal') return;
    state.goals = state.goals.filter((goal) => goal.id !== button.dataset.id);
    saveGoals();
    renderPlanning();
    showToast('Meta removida.');
}

function renderGoals() {
    clearElement(dom.goalList);

    if (state.goals.length === 0) {
        dom.goalList.appendChild(createEmptyBlock('Nenhuma meta criada ainda.'));
        return;
    }

    state.goals.forEach((goal) => {
        const percent = Math.min(100, goal.saved / Math.max(1, goal.target) * 100);
        const row = document.createElement('article');
        row.className = 'entity-card';
        row.innerHTML = `
            <div class="entity-body">
                <div class="entity-title-row">
                    <strong>${escapeHtml(goal.name)}</strong>
                    <span>${Math.round(percent)}%</span>
                </div>
                <div class="bar-track mt-3">
                    <div class="bar-fill bg-green-500" style="width: ${percent}%"></div>
                </div>
                <div class="forecast-meta mt-3">
                    <span>Guardado ${formatCurrency(goal.saved)}</span>
                    <span>Meta ${formatCurrency(goal.target)}</span>
                    <span>Faltam ${formatCurrency(Math.max(0, goal.target - goal.saved))}</span>
                </div>
            </div>
            <div class="entity-actions">
                <button type="button" class="row-action danger" data-action="delete-goal" data-id="${goal.id}" aria-label="Excluir meta">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        dom.goalList.appendChild(row);
    });
}

function runScenario() {
    const stats = buildMonthStats(state.selectedMonth);
    const type = dom.scenarioType.value;
    const amount = normalizeMoney(dom.scenarioAmount.value);
    const installments = clampInteger(dom.scenarioInstallments.value, 2, 120, 10);

    clearElement(dom.scenarioResult);

    if (amount <= 0) {
        dom.scenarioResult.appendChild(createEmptyBlock('Informe um valor para simular.'));
        return;
    }

    let title = '';
    let rows = [];
    let newBalance = stats.projectedBalance;

    if (type === 'cut') {
        newBalance += amount;
        title = `Cortar ${formatCurrency(amount)} melhora o mês em ${formatCurrency(amount)}.`;
        rows = [
            ['Saldo atual', formatCurrency(stats.projectedBalance)],
            ['Saldo simulado', formatCurrency(newBalance)],
            ['Nova renda comprometida', `${Math.round(Math.max(0, (stats.expectedExpense - amount) / Math.max(1, stats.expectedIncome) * 100))}%`]
        ];
    }

    if (type === 'income') {
        newBalance += amount;
        title = `Adicionar ${formatCurrency(amount)} de renda recalcula o alerta do seu limite pessoal.`;
        rows = [
            ['Renda atual', formatCurrency(stats.expectedIncome)],
            ['Renda simulada', formatCurrency(stats.expectedIncome + amount)],
            ['Comprometimento simulado', `${Math.round(stats.expectedExpense / Math.max(1, stats.expectedIncome + amount) * 100)}%`]
        ];
    }

    if (type === 'save') {
        newBalance -= amount;
        title = `Guardar ${formatCurrency(amount)} reduz a folga do mês, mas aumenta sua reserva.`;
        rows = [
            ['Saldo antes de guardar', formatCurrency(stats.projectedBalance)],
            ['Saldo depois de guardar', formatCurrency(newBalance)],
            ['Reservas atuais', formatCurrency(getTotalReserveSaved())]
        ];
    }

    if (type === 'installment') {
        const perMonth = roundMoney(amount / installments);
        newBalance -= perMonth;
        title = `Uma compra de ${formatCurrency(amount)} em ${installments}x pesa ${formatCurrency(perMonth)} por mês.`;
        rows = [
            ['Saldo deste mês', formatCurrency(stats.projectedBalance)],
            ['Saldo com a parcela', formatCurrency(newBalance)],
            ['Impacto total futuro', formatCurrency(amount)]
        ];
    }

    const card = document.createElement('article');
    card.className = 'scenario-card';
    card.innerHTML = `
        <h3>${escapeHtml(title)}</h3>
        <div class="scenario-table">
            ${rows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
        </div>
    `;
    dom.scenarioResult.appendChild(card);

    if (type === 'installment') {
        const months = [];
        for (let index = 0; index < Math.min(installments, 6); index += 1) {
            const monthKey = addMonths(`${state.selectedMonth}-01`, index).slice(0, 7);
            const month = buildMonthStats(monthKey);
            months.push([formatMonthLabel(monthKey), formatCurrency(month.projectedBalance - perMonth)]);
        }
        const list = document.createElement('div');
        list.className = 'scenario-mini-list';
        list.innerHTML = months.map(([month, value]) => `<div><span>${month}</span><strong>${value}</strong></div>`).join('');
        dom.scenarioResult.appendChild(list);
    }
}

function buildFutureMonths(count) {
    const months = [];
    for (let offset = 0; offset < count; offset += 1) {
        const monthKey = addMonths(`${state.selectedMonth}-01`, offset).slice(0, 7);
        months.push(buildMonthStats(monthKey, false));
    }
    return months;
}

function getCardUsage(card, monthKey) {
    const cardTransactions = state.transactions.filter((transaction) => {
        return transaction.type === 'expense' && transaction.cardId === card.id;
    });
    const monthEnd = `${monthKey}-31`;
    const currentBill = cardTransactions
        .filter((transaction) => getMonthKey(transaction.date) === monthKey)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    const unpaidTransactions = cardTransactions.filter((transaction) => !transaction.paid);
    const limitUsed = unpaidTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const futureInstallments = unpaidTransactions
        .filter((transaction) => transaction.installmentGroupId && transaction.date > monthEnd)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
        currentBill,
        limitUsed,
        available: Math.max(0, card.limit - limitUsed),
        futureInstallments
    };
}

function createBackupPayload(reason = 'manual') {
    return {
        appVersion: APP_VERSION,
        schemaVersion: SCHEMA_VERSION,
        version: 5,
        createdAt: new Date().toISOString(),
        exportedAt: new Date().toISOString(),
        reason,
        profile: state.profile,
        reserves: state.reserves,
        plannedBills: state.plannedBills,
        investments: state.investments,
        cards: state.cards,
        goals: state.goals,
        transactions: state.transactions
    };
}

function downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function exportData() {
    const payload = createBackupPayload('export');
    downloadJson(payload, `financas-${getTodayDate()}.json`);
    trackAnalyticsEvent('data_exported', {
        transaction_count: state.transactions.length
    });
    showToast('Arquivo exportado.');
}

function exportCsv() {
    const rows = [
        ['data', 'descricao', 'tipo', 'valor', 'categoria', 'status', 'cartao', 'tags'],
        ...state.transactions.map((transaction) => [
            transaction.date,
            transaction.desc,
            transaction.type,
            String(transaction.amount).replace('.', ','),
            transaction.category || '',
            transaction.paid ? 'pago' : 'pendente',
            getCardName(transaction.cardId),
            (transaction.tags || []).join('|')
        ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transacoes-${getTodayDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado.');
}

function exportBackup() {
    const payload = createBackupPayload('backup');
    storeLocalBackup(payload);
    downloadJson(payload, `backup-financeiro-${getTodayDate()}.json`);
    trackAnalyticsEvent('backup_exported', {
        transaction_count: state.transactions.length
    });
    showToast('Backup exportado e guardado no histórico local.');
}

function runGlobalSearch() {
    const query = window.prompt('Buscar em transações, cartões, contas, reservas, investimentos e metas:');
    const normalizedQuery = removeAccents(String(query || '').trim().toLowerCase());
    if (!normalizedQuery) return;

    const results = [];
    state.transactions.forEach((item) => {
        const text = `${item.desc} ${item.category || ''} ${(item.tags || []).join(' ')}`;
        if (removeAccents(text.toLowerCase()).includes(normalizedQuery)) results.push(`Transação: ${item.desc} (${formatDate(item.date)})`);
    });
    state.cards.forEach((item) => {
        if (removeAccents(item.name.toLowerCase()).includes(normalizedQuery)) results.push(`Cartão: ${item.name}`);
    });
    state.plannedBills.forEach((item) => {
        if (removeAccents(item.name.toLowerCase()).includes(normalizedQuery)) results.push(`Conta prevista: ${item.name}`);
    });
    state.reserves.forEach((item) => {
        if (removeAccents(item.name.toLowerCase()).includes(normalizedQuery)) results.push(`Reserva: ${item.name}`);
    });
    state.investments.forEach((item) => {
        if (removeAccents(`${item.name} ${item.code || ''}`.toLowerCase()).includes(normalizedQuery)) results.push(`Investimento: ${item.name}`);
    });
    state.goals.forEach((item) => {
        if (removeAccents(item.name.toLowerCase()).includes(normalizedQuery)) results.push(`Meta: ${item.name}`);
    });

    window.alert(results.length ? `Resultados encontrados:\n\n${results.slice(0, 20).join('\n')}` : 'Nenhum resultado encontrado.');
}

function showMonthClosingReport() {
    const stats = buildMonthStats(state.selectedMonth);
    const pending = stats.transactions.filter((transaction) => !transaction.paid);
    const cardBill = Object.values(stats.byCard).reduce((sum, value) => sum + value, 0);
    const reserveAdded = state.transactions
        .filter((transaction) => transaction.reserveContributionId && getMonthKey(transaction.date) === state.selectedMonth)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    window.alert([
        `Fechamento de ${formatMonthLabel(state.selectedMonth)}`,
        '',
        `Resultado previsto: ${formatCurrency(stats.projectedBalance)}`,
        `Resultado realizado: ${formatCurrency(stats.cashBalance)}`,
        `Contas pendentes: ${pending.length}`,
        `Faturas abertas: ${formatCurrency(cardBill)}`,
        `Reserva adicionada: ${formatCurrency(reserveAdded)}`,
        `Renda comprometida: ${Math.round(stats.commitment)}%`
    ].join('\n'));
}

function hasFinanceData() {
    return Boolean(
        state.transactions.length
        || state.reserves.length
        || state.plannedBills.length
        || state.investments.length
        || state.cards.length
        || state.profile.expectedIncome
        || state.profile.name
    );
}

function storeLocalBackup(payload) {
    const history = getLocalBackupHistory();
    history.unshift({
        id: createId(),
        createdAt: payload.createdAt || new Date().toISOString(),
        appVersion: payload.appVersion || APP_VERSION,
        schemaVersion: payload.schemaVersion || 1,
        transactionCount: Array.isArray(payload.transactions) ? payload.transactions.length : 0,
        payload
    });
    localStorage.setItem(STORAGE_KEYS.backups, JSON.stringify(history.slice(0, 5)));
}

function getLocalBackupHistory() {
    const saved = loadJson(STORAGE_KEYS.backups, []);
    return Array.isArray(saved) ? saved.filter((item) => item && item.payload) : [];
}

function validateBackupPayload(payload) {
    const incoming = migrateBackupPayload(Array.isArray(payload) ? { transactions: payload } : payload);
    if (!incoming || typeof incoming !== 'object') throw new Error('Formato inválido');
    if (incoming.schemaVersion && Number(incoming.schemaVersion) > SCHEMA_VERSION) {
        throw new Error('Backup criado em uma versão mais nova do app');
    }

    const normalized = {
        profile: incoming.profile ? normalizeProfile(incoming.profile) : { ...DEFAULT_PROFILE },
        transactions: Array.isArray(incoming.transactions) ? incoming.transactions.map(normalizeTransaction).filter(Boolean) : [],
        reserves: Array.isArray(incoming.reserves) ? incoming.reserves.map(normalizeReserve).filter(Boolean) : [],
        plannedBills: Array.isArray(incoming.plannedBills) ? incoming.plannedBills.map(normalizePlannedBill).filter(Boolean) : [],
        investments: Array.isArray(incoming.investments) ? incoming.investments.map(normalizeInvestment).filter(Boolean) : [],
        cards: Array.isArray(incoming.cards) ? incoming.cards.map(normalizeCard).filter(Boolean) : [],
        goals: Array.isArray(incoming.goals) ? incoming.goals.map(normalizeGoal).filter(Boolean) : []
    };

    if (!normalized.transactions.length && !normalized.reserves.length && !normalized.plannedBills.length && !normalized.investments.length && !normalized.cards.length && !normalized.goals.length && !normalized.profile.expectedIncome && !normalized.profile.name) {
        throw new Error('Backup sem dados financeiros válidos');
    }

    return normalized;
}

function migrateBackupPayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    const migrated = { ...payload };
    if (!migrated.schemaVersion) migrated.schemaVersion = 1;
    if (migrated.schemaVersion === 1) {
        migrated.schemaVersion = 2;
        migrated.appVersion = migrated.appVersion || migrated.version || 'legado';
        migrated.createdAt = migrated.createdAt || migrated.exportedAt || new Date().toISOString();
    }
    return migrated;
}

function applyImportedPayload(normalized, replace) {
    state.transactions = replace ? normalized.transactions : mergeById(state.transactions, normalized.transactions);
    state.reserves = replace ? normalized.reserves : mergeById(state.reserves, normalized.reserves);
    state.plannedBills = replace ? normalized.plannedBills : mergeById(state.plannedBills, normalized.plannedBills);
    state.investments = replace ? normalized.investments : mergeById(state.investments, normalized.investments);
    state.cards = replace ? normalized.cards : mergeById(state.cards, normalized.cards);
    state.goals = replace ? normalized.goals : mergeById(state.goals, normalized.goals);
    state.profile = replace ? normalized.profile : normalizeProfile({ ...state.profile, ...normalized.profile });
}

function importData(event) {
    const [file] = event.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            const normalized = validateBackupPayload(parsed);

            const replace = window.confirm('OK para substituir tudo. Cancelar para mesclar com os dados atuais.');
            if (hasFinanceData()) storeLocalBackup(createBackupPayload('before-import'));
            applyImportedPayload(normalized, replace);

            saveAll();
            hydrateForms();
            render();
            trackAnalyticsEvent('data_imported', {
                replace_mode: replace ? 'replace' : 'merge',
                transaction_count: state.transactions.length
            });
            showToast('Dados importados.');
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Não foi possível importar esse arquivo.');
        } finally {
            dom.importJson.value = '';
        }
    };
    reader.readAsText(file);
}

function restoreLatestBackup() {
    const [latest] = getLocalBackupHistory();
    if (!latest) {
        showToast('Nenhum backup local encontrado.');
        return;
    }

    const confirmation = window.prompt(`Digite RESTAURAR para voltar ao backup de ${formatDateTime(latest.createdAt)}.`);
    if (confirmation !== 'RESTAURAR') {
        showToast('Restauração cancelada.');
        return;
    }

    try {
        const normalized = validateBackupPayload(latest.payload);
        if (hasFinanceData()) storeLocalBackup(createBackupPayload('before-restore'));
        applyImportedPayload(normalized, true);
        saveAll();
        hydrateForms();
        render();
        showToast('Backup local restaurado.');
    } catch (error) {
        console.error(error);
        showToast('Não foi possível restaurar esse backup.');
    }
}

function showDataIntegrityReport() {
    const report = buildDataIntegrityReport();
    const lines = report.map((item) => `${item.label}: ${item.ok ? 'OK' : item.message}`);
    window.alert(`Integridade dos dados\n\n${lines.join('\n')}`);
}

function buildDataIntegrityReport() {
    const backups = getLocalBackupHistory();
    return [
        { label: 'Transações', ok: state.transactions.every((item) => normalizeTransaction(item)), message: 'há transações inválidas' },
        { label: 'Cartões', ok: state.cards.every((item) => normalizeCard(item)), message: 'há cartões inválidos' },
        { label: 'Contas previstas', ok: state.plannedBills.every((item) => normalizePlannedBill(item)), message: 'há contas inválidas' },
        { label: 'Reservas', ok: state.reserves.every((item) => normalizeReserve(item)), message: 'há reservas inválidas' },
        { label: 'Investimentos', ok: state.investments.every((item) => normalizeInvestment(item)), message: 'há investimentos inválidos' },
        { label: 'Metas', ok: state.goals.every((item) => normalizeGoal(item)), message: 'há metas inválidas' },
        { label: 'Backup', ok: backups.length > 0, message: 'nenhum backup local salvo' },
        { label: 'Firebase', ok: !AUTH_ENABLED || Boolean(state.user), message: 'conta não conectada' }
    ];
}

function mergeById(current, imported) {
    const byId = new Map(current.map((item) => [item.id, item]));
    imported.forEach((item) => byId.set(item.id, item));
    return Array.from(byId.values());
}

function clearData() {
    const hasData = state.transactions.length || state.reserves.length || state.plannedBills.length || state.investments.length || state.cards.length || state.profile.expectedIncome || state.profile.name;
    if (!hasData) {
        showToast('Não há dados para limpar.');
        return;
    }

    const confirmation = window.prompt(AUTH_ENABLED && state.user
        ? 'Digite APAGAR para limpar todos os dados desta conta em todos os dispositivos conectados.'
        : 'Digite APAGAR para limpar todos os dados salvos neste navegador.');
    if (confirmation !== 'APAGAR') {
        showToast('Limpeza cancelada.');
        return;
    }

    state.transactions = [];
    state.reserves = [];
    state.plannedBills = [];
    state.investments = [];
    state.cards = [];
    state.goals = [];
    state.profile = { ...DEFAULT_PROFILE };
    saveAll();
    hydrateForms();
    resetTransactionForm();
    resetReserveForm();
    resetInvestmentForm();
    resetPlannedForm();
    resetCardForm();
    render();
    trackAnalyticsEvent('data_cleared', {
        scope: AUTH_ENABLED ? 'account' : 'local_browser'
    });
    showToast('Dados limpos.');
}

function createBadge(text, className) {
    const badge = document.createElement('span');
    badge.className = `mini-badge ${className}`;
    badge.textContent = text;
    return badge;
}

function createIconButton(className, iconClass, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.innerHTML = `<i class="${iconClass}"></i>`;
    return button;
}

function createListNote(text) {
    const item = document.createElement('div');
    item.className = 'text-sm text-slate-500';
    item.textContent = text;
    return item;
}

function createEmptyBlock(text) {
    const block = document.createElement('div');
    block.className = 'empty-block';
    block.innerHTML = `<i class="fa-solid fa-circle-info"></i><span>${escapeHtml(text)}</span>`;
    return block;
}

function createInsightTile(item) {
    const tile = document.createElement('article');
    tile.className = 'insight-tile';
    tile.innerHTML = `
        <i class="fa-solid ${item.icon}"></i>
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
    `;
    return tile;
}

function getTopEntry(map) {
    const entries = Object.entries(map);
    if (!entries.length) return null;
    const [key, value] = entries.sort((a, b) => b[1] - a[1])[0];
    return { key, value };
}

function getCardById(id) {
    return state.cards.find((card) => card.id === id) || null;
}

function getCardName(id) {
    const card = getCardById(id);
    return card ? card.name : '';
}

function getReserveById(id) {
    return state.reserves.find((reserve) => reserve.id === id) || null;
}

function getReservePercent(reserve) {
    return reserve.target > 0 ? reserve.saved / reserve.target * 100 : 0;
}

function getTotalReserveSaved() {
    return state.reserves.reduce((sum, reserve) => sum + reserve.saved, 0);
}

function getBestReserveRatio() {
    if (!state.reserves.length) return 0;
    return Math.max(...state.reserves.map((reserve) => Math.min(1, reserve.saved / Math.max(1, reserve.target))));
}

function buildBillDate(monthKey, day) {
    const [year, month] = monthKey.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return `${monthKey}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

function splitInstallmentAmounts(total, installments) {
    const totalCents = Math.round((Number(total) || 0) * 100);
    const baseCents = Math.floor(totalCents / installments);
    let remainder = totalCents - (baseCents * installments);
    const amounts = [];

    for (let index = 0; index < installments; index += 1) {
        const cents = baseCents + (remainder > 0 ? 1 : 0);
        amounts.push(cents / 100);
        if (remainder > 0) remainder -= 1;
    }

    return amounts;
}

function normalizeDateInput(value) {
    const date = String(value || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return getTodayDate();
}

function getBillDueDateForMonth(bill, monthKey) {
    if (bill.repeatMonthly) return buildBillDate(monthKey, bill.day);
    return getMonthKey(bill.dueDate) === monthKey ? bill.dueDate : null;
}

function syncLinkedPlannedTransactions(bill, fromMonthKey) {
    if (!bill || !bill.id) return;

    state.transactions = state.transactions.map((transaction) => {
        if (transaction.plannedBillId !== bill.id) return transaction;
        if (transaction.paid) return transaction;
        if (getMonthKey(transaction.date) < fromMonthKey) return transaction;

        const dueDate = getBillDueDateForMonth(bill, getMonthKey(transaction.date));
        if (!dueDate) return transaction;

        return normalizeTransaction({
            ...transaction,
            desc: bill.name,
            amount: bill.amount,
            date: dueDate,
            category: bill.category,
            necessity: bill.necessity,
            cardId: bill.cardId,
            updatedAt: new Date().toISOString()
        });
    }).filter(Boolean);

    saveTransactions();
}

function getTransactionDueDate(transaction) {
    if (!transaction || !transaction.cardId) return transaction ? transaction.date : getTodayDate();

    const card = state.cards.find((item) => item.id === transaction.cardId);
    if (!card) return transaction.date;

    return buildBillDate(getMonthKey(transaction.date), card.dueDay);
}

function isOverdueTransaction(transaction) {
    return !transaction.paid && getTransactionDueDate(transaction) < getTodayDate();
}

function getHealthLabel(score) {
    if (score >= 80) return 'Saudável';
    if (score >= 60) return 'Atenção';
    if (score >= 40) return 'Risco';
    if (score > 0) return 'Crítico';
    return 'Sem dados';
}

function getHealthClass(score) {
    if (score >= 80) return 'positive';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'negative';
    if (score > 0) return 'negative';
    return 'neutral';
}

function setMoneyColor(element, value) {
    element.classList.remove('text-red-600', 'text-green-700', 'text-slate-800');
    if (value < 0) element.classList.add('text-red-600');
    else if (value > 0) element.classList.add('text-green-700');
    else element.classList.add('text-slate-800');
}

function setScoreColor(element, score) {
    element.classList.remove('text-red-600', 'text-green-700', 'text-yellow-700', 'text-slate-800');
    if (score >= 80) element.classList.add('text-green-700');
    else if (score >= 60) element.classList.add('text-yellow-700');
    else if (score > 0) element.classList.add('text-red-600');
    else element.classList.add('text-slate-800');
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function normalizeMoney(value) {
    const number = parseLocaleNumber(value);
    return Number.isFinite(number) && number > 0 ? roundMoney(number) : 0;
}

function toNumber(value) {
    const number = parseLocaleNumber(value);
    return Number.isFinite(number) ? number : 0;
}

function parseLocaleNumber(value) {
    if (typeof value === 'number') return value;
    let text = String(value === null || value === undefined ? '' : value).trim();
    if (!text) return Number.NaN;

    text = text.replace(/[^\d,.-]/g, '');
    const hasComma = text.includes(',');
    const hasDot = text.includes('.');

    if (hasComma && hasDot) {
        const lastComma = text.lastIndexOf(',');
        const lastDot = text.lastIndexOf('.');
        if (lastComma > lastDot) {
            text = text.replace(/\./g, '').replace(',', '.');
        } else {
            text = text.replace(/,/g, '');
        }
    } else if (hasComma) {
        text = text.replace(',', '.');
    }

    return Number(text);
}

function normalizeQuantity(value) {
    const number = toNumber(value);
    return Number.isFinite(number) && number > 0 ? Math.round(number * 100000000) / 100000000 : 0;
}

function roundMoney(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function clampInteger(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function normalizeOptionalDay(value) {
    if (value === null || value === undefined || value === '') return null;
    return clampInteger(value, 1, 31, null);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatPercent(value) {
    return `${Number(value || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}%`;
}

function formatQuantity(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

function formatDate(date) {
    const parsed = parseDate(date);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(parsed);
}

function formatDateTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatMonthLabel(monthKey) {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: 'numeric'
    }).format(date);
}

function getTodayDate() {
    const now = new Date();
    return toDateInput(now);
}

function toDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(date) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getMonthKey(date) {
    return date.slice(0, 7);
}

function addMonths(date, offset) {
    const parsed = parseDate(date);
    const target = new Date(parsed.getFullYear(), parsed.getMonth() + offset, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    const day = Math.min(parsed.getDate(), lastDay);
    return toDateInput(new Date(target.getFullYear(), target.getMonth(), day));
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function toCamel(id) {
    return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function showToast(message) {
    window.clearTimeout(state.toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.remove('hidden');
    state.toastTimer = window.setTimeout(() => {
        dom.toast.classList.add('hidden');
    }, 2600);
}

function hideToast() {
    window.clearTimeout(state.toastTimer);
    dom.toast.textContent = '';
    dom.toast.classList.add('hidden');
}

