
import React, { useMemo, useEffect } from 'react';
import StatCard from './StatCard';
import FinancialChart from './FinancialChart';
import WeatherWidget from './WeatherWidget';
import { View, PropertyData, Transaction } from '../types';
import { MOCK_UPCOMING_BILLS } from '../constants';

interface DashboardViewProps {
  onNavigate: (view: View) => void;
  property: PropertyData;
  transactions?: Transaction[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, property, transactions = [] }) => {
  
  // Forçar renderização dos ícones ao carregar o componente ou mudar dados
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [property, transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value}`;
  };

  // Calculate Real Stats for Current Month
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let receitaMes = 0;
    let despesaMes = 0;

    transactions.forEach(t => {
      if (!t.data) return;
      const tDate = new Date(t.data);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.tipo === 'entrada') receitaMes += Number(t.valor);
        else despesaMes += Number(t.valor);
      }
    });

    const lucroMes = receitaMes - despesaMes;

    return {
      lucro: lucroMes,
      custo: despesaMes
    };
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Property Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-green-600">
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{property.nome}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{property.cidade}, {property.estado} • {property.area} Hectares</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <button 
                onClick={() => onNavigate(View.EDITAR_PROPRIEDADE)}
                className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
                <i data-lucide="settings" className="w-4 h-4"></i>
                Editar Propriedade
            </button>
            <button 
                onClick={() => onNavigate(View.NOVA_PROPRIEDADE)}
                className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
                <i data-lucide="plus" className="w-4 h-4"></i>
                Nova Propriedade
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          icon={<i data-lucide="line-chart" className="w-6 h-6"></i>}
          title="Lucro do Mês (Est.)"
          value={formatShortCurrency(stats.lucro)}
          change={stats.lucro >= 0 ? "+ Positivo" : "- Negativo"}
          changeType={stats.lucro >= 0 ? "increase" : "decrease"}
        />
        <StatCard 
          icon={<i data-lucide="archive" className="w-6 h-6"></i>}
          title="Produção de Grãos"
          value="3,250 sc"
          change="+5.2%"
          changeType="increase"
        />
        <StatCard 
          icon={<i data-lucide="wallet" className="w-6 h-6"></i>}
          title="Custo Operacional (Mês)"
          value={formatShortCurrency(stats.custo)}
          change="Acumulado"
          changeType="decrease"
        />
        <StatCard 
          icon={<i data-lucide="alert-triangle" className="w-6 h-6"></i>}
          title="Alertas Ativos"
          value="3"
          change="+1"
          changeType="increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FinancialChart transactions={transactions} />
          <WeatherWidget />
      </div>

      {/* Bottom Grid: Tasks and Financial Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upcoming Tasks */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <i data-lucide="list-todo" className="w-5 h-5 text-gray-500"></i>
                  Próximas Tarefas
              </h3>
              <ul className="space-y-3">
                  <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                          <p className="font-medium text-gray-900 dark:text-white">Aplicação de Herbicida - Talhão 5</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento: 3 dias</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">Média Prioridade</span>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                          <p className="font-medium text-gray-900 dark:text-white">Manutenção do Trator John Deere</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento: 5 dias</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-red-200 text-red-800 rounded-full">Alta Prioridade</span>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                          <p className="font-medium text-gray-900 dark:text-white">Compra de Sementes de Milho</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento: 12 dias</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-green-200 text-green-800 rounded-full">Baixa Prioridade</span>
                  </li>
              </ul>
          </div>

          {/* Financial Reminders */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <i data-lucide="calendar-days" className="w-5 h-5 text-gray-500"></i>
                  Agenda Financeira (Próximos 15 dias)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {/* Contas a Pagar */}
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-100 dark:border-red-900/30">
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <i data-lucide="arrow-down-circle" className="w-4 h-4"></i> A Pagar
                      </h4>
                      <div className="space-y-3">
                          {MOCK_UPCOMING_BILLS.payables.map((bill) => (
                              <div key={bill.id} className="flex justify-between items-start border-b border-red-100 dark:border-red-900/30 last:border-0 pb-2 last:pb-0">
                                  <div>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{bill.desc}</p>
                                      <p className="text-xs text-red-500 font-medium">Vence: {bill.date}</p>
                                  </div>
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatCurrency(bill.value)}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Contas a Receber */}
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-900/30">
                      <h4 className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <i data-lucide="arrow-up-circle" className="w-4 h-4"></i> A Receber
                      </h4>
                      <div className="space-y-3">
                          {MOCK_UPCOMING_BILLS.receivables.map((bill) => (
                              <div key={bill.id} className="flex justify-between items-start border-b border-green-100 dark:border-green-900/30 last:border-0 pb-2 last:pb-0">
                                  <div>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{bill.desc}</p>
                                      <p className="text-xs text-green-600 font-medium">Previsto: {bill.date}</p>
                                  </div>
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatCurrency(bill.value)}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default DashboardView;
