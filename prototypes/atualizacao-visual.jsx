import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, LayoutDashboard, User, BarChart3, Settings, Bell, Search, CreditCard } from 'lucide-react';

export default function App() {
  // Estado para armazenar a lista de transações (iniciando com alguns exemplos)
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Salário Mensal', amount: 3500.00, type: 'income', date: new Date().toLocaleDateString('pt-BR') },
    { id: 2, description: 'Rendimento de Investimentos', amount: 150.00, type: 'income', date: new Date().toLocaleDateString('pt-BR') },
  ]);

  // Estados para o formulário de nova transação
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');

  // Cálculos de totais usando useMemo para performance
  const { income, expense, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'income') {
          acc.income += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.expense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  // Função para formatar valores em Reais (BRL)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para adicionar uma nova transação
  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    if (!description.trim() || !amount) return;

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Limpar o formulário
    setDescription('');
    setAmount('');
  };

  // Função para remover uma transação
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* Menu Lateral (Desktop) - Sofisticado */}
      <aside className="hidden lg:flex w-64 bg-[#0B1120] text-slate-400 flex-col justify-between border-r border-slate-800/50">
        <div>
          <div className="p-8 text-lg font-semibold text-white flex items-center gap-3 tracking-wide">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Wallet size={18} className="text-white" />
            </div>
            Finanças
          </div>
          <nav className="px-4 space-y-1 mt-2">
            <a href="#" className="flex items-center gap-3 bg-white/10 text-white px-4 py-3.5 rounded-2xl font-medium transition-all shadow-sm">
              <LayoutDashboard size={18} />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3.5 rounded-2xl font-medium transition-all">
              <BarChart3 size={18} />
              Estatísticas
            </a>
            <a href="#" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3.5 rounded-2xl font-medium transition-all">
              <CreditCard size={18} />
              Meus Cartões
            </a>
            <a href="#" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3.5 rounded-2xl font-medium transition-all">
              <Settings size={18} />
              Ajustes
            </a>
          </nav>
        </div>
        
        {/* Perfil no Menu */}
        <div className="p-6 border-t border-slate-800/50 m-4 rounded-3xl bg-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-white font-medium shadow-inner">
            <User size={18} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Meu Perfil</p>
            <p className="text-xs text-slate-500 truncate">Gerenciar conta</p>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        
        {/* Cabeçalho do Dashboard - Limpo e Minimalista */}
        <header className="bg-[#F8FAFC]/80 backdrop-blur-xl px-8 py-6 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 lg:hidden flex items-center gap-2">
              <Wallet size={24} className="text-indigo-600" />
              Finanças
            </h1>
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Acompanhe seu patrimônio e movimentações.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 bg-white border border-slate-200/60 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all">
              <Search size={18} />
            </button>
            <button className="w-10 h-10 bg-white border border-slate-200/60 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all relative">
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              <Bell size={18} />
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 lg:px-10 lg:py-6 max-w-[1600px] mx-auto w-full space-y-8">
          
          {/* Cartões de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cartão de Saldo Atual - Estilo Premium Black Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-3xl p-7 shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between group">
              {/* Efeitos de luz sutis no fundo do cartão */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-semibold text-[11px] tracking-[0.2em] uppercase mb-2">Saldo Total</p>
                  <h2 className="text-4xl font-semibold tracking-tight">{formatCurrency(balance)}</h2>
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                  <Wallet size={18} className="text-slate-200" />
                </div>
              </div>
              
              <div className="relative z-10 mt-8 flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                Atualizado agora
              </div>
            </div>

            {/* Cartão de Receitas - Sofisticado e Claro */}
            <div className="bg-white rounded-3xl p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-500 font-semibold text-[11px] tracking-[0.15em] uppercase">Entradas</p>
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <ArrowUpRight size={20} className="text-emerald-500" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{formatCurrency(income)}</h2>
            </div>

            {/* Cartão de Despesas - Sofisticado e Claro */}
            <div className="bg-white rounded-3xl p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-500 font-semibold text-[11px] tracking-[0.15em] uppercase">Saídas</p>
                <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
                  <ArrowDownRight size={20} className="text-rose-500" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{formatCurrency(expense)}</h2>
            </div>

          </div>

          {/* Área de Conteúdo Inferior */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Lista de Transações (Maior destaque) */}
            <div className="xl:col-span-8 bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100/80 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Histórico de Movimentações</h2>
                  <p className="text-sm text-slate-500 mt-1">Suas atividades mais recentes</p>
                </div>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Ver tudo</button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Wallet size={32} className="text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-600">Nenhum registro encontrado</p>
                  <p className="text-sm mt-1">Comece adicionando uma nova transação.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 -mx-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                      
                      <div className="flex items-center gap-4">
                        {/* Ícone Minimalista */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.type === 'income' ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownRight size={22} strokeWidth={2.5} />}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-slate-900 text-[15px]">{t.description}</p>
                          <p className="text-[13px] text-slate-500 font-medium mt-0.5">{t.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <p className={`font-semibold text-[15px] ${t.type === 'income' ? 'text-slate-900' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </p>
                        
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário de Nova Transação (Estilo Widget Elegante) */}
            <div className="xl:col-span-4 bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100/80 h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Novo Registro</h2>
              <p className="text-sm text-slate-500 mb-6">Adicione uma entrada ou saída</p>
              
              <form onSubmit={handleAddTransaction} className="space-y-6">
                
                {/* Segmented Control para Tipo */}
                <div className="bg-slate-100/70 p-1 rounded-2xl flex gap-1">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      type === 'income' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${type === 'income' ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      type === 'expense' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${type === 'expense' ? 'bg-rose-500' : 'bg-transparent'}`}></div>
                    Saída
                  </button>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Descrição</label>
                    <input
                      type="text"
                      placeholder="Ex: Conta de Luz, Salário..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50/50 px-4 py-3.5 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">Valor (R$)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-medium">R$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-50/50 pl-12 pr-4 py-3.5 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-lg text-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-2 shadow-lg shadow-slate-900/20"
                >
                  <Plus size={20} />
                  Salvar Registro
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}