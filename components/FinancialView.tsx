
import React, { useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { MOCK_FINANCIAL_DATA, MOCK_EXPENSES_BREAKDOWN } from '../constants';
import { View, Transaction } from '../types';

interface FinancialViewProps {
  onNavigate: (view: View) => void;
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

const FinancialView: React.FC<FinancialViewProps> = ({ 
  onNavigate, 
  transactions, 
  onDeleteTransaction, 
  onEditTransaction 
}) => {

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [transactions]);

  // --- Cálculos Dinâmicos ---
  const totalReceita = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
  const totalDespesa = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
  const saldo = totalReceita - totalDespesa;
  
  // Evitar divisão por zero na margem
  const margem = totalReceita > 0 ? ((saldo / totalReceita) * 100).toFixed(1) : '0.0';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Tenta formatar YYYY-MM-DD para DD/MM/YYYY, se já não estiver formatado
    if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <i data-lucide="dollar-sign" className="w-6 h-6 text-green-600"></i>
             Gestão Financeira
           </h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Visão consolidada do fluxo de caixa e custos da safra.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onNavigate(View.RELATORIOS_FINANCEIROS)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                <i data-lucide="file-text" className="w-4 h-4"></i> Relatórios
            </button>
            <button 
                onClick={() => onNavigate(View.NOVA_COMPRA)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
            >
                <i data-lucide="shopping-cart" className="w-4 h-4"></i> Compra
            </button>
            <button 
                onClick={() => onNavigate(View.NOVA_VENDA)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
            >
                <i data-lucide="trending-up" className="w-4 h-4"></i> Venda
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-b-4 border-green-500">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receita Total</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalReceita)}</h3>
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <i data-lucide="trending-up" className="w-3 h-3 mr-1"></i> Acumulado
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-b-4 border-red-500">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas Totais</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalDespesa)}</h3>
          <p className="text-xs text-red-500 mt-1 flex items-center">
            <i data-lucide="trending-down" className="w-3 h-3 mr-1"></i> Acumulado
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-b-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual</p>
          <h3 className={`text-2xl font-bold mt-2 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(saldo)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Receitas - Despesas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-b-4 border-purple-500">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Margem</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{margem}%</h3>
          <p className="text-xs text-gray-500 mt-1">Saúde Financeira</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex-shrink-0">Fluxo de Caixa Semestral (Projeção)</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_FINANCIAL_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `R$${val/1000}k`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Expenses Breakdown Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex-shrink-0">Composição de Custos</h3>
            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={MOCK_EXPENSES_BREAKDOWN}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {MOCK_EXPENSES_BREAKDOWN.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                             contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }}
                             formatter={(value: number) => formatCurrency(value)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 flex-shrink-0 overflow-y-auto max-h-24">
                {MOCK_EXPENSES_BREAKDOWN.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Extrato de Movimentações</h3>
            <div className="text-sm text-gray-500">
                {transactions.length} registros
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Descrição</th>
                        <th scope="col" className="px-6 py-3">Categoria</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3 text-right">Valor</th>
                        <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group">
                            <td className="px-6 py-4">{formatDate(t.data)}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded-full ${t.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <i data-lucide={t.tipo === 'entrada' ? 'arrow-up-right' : 'arrow-down-right'} className="w-3 h-3"></i>
                                    </div>
                                    <div>
                                        {t.descricao}
                                        {t.entity && <p className="text-xs text-gray-400 font-normal">{t.entity}</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                                    {t.categoria}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                    ${t.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                    {t.status === 'paid' ? (t.tipo === 'entrada' ? 'Recebido' : 'Pago') : 'Pendente'}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-bold ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                                {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onEditTransaction(t)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                        title="Editar"
                                    >
                                        <i data-lucide="pencil" className="w-4 h-4"></i>
                                    </button>
                                    <button 
                                        onClick={() => onDeleteTransaction(t.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                        title="Excluir"
                                    >
                                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                Nenhuma transação registrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default FinancialView;
