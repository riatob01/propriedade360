
import React, { useState, useEffect } from 'react';
import { MOCK_TRANSACTIONS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

interface FinancialReportViewProps {
  onCancel: () => void;
}

const FinancialReportView: React.FC<FinancialReportViewProps> = ({ onCancel }) => {
  // Filtros
  const [filters, setFilters] = useState({
    startDate: '2023-10-01',
    endDate: '2023-11-30',
    type: 'all', // all, entrada, saida
    category: 'all',
  });

  const [filteredData, setFilteredData] = useState(MOCK_TRANSACTIONS);
  const [isGenerating, setIsGenerating] = useState(false);

  // Aplica filtros sempre que o estado muda
  useEffect(() => {
    let result = MOCK_TRANSACTIONS;

    // Filtro de Tipo
    if (filters.type !== 'all') {
      result = result.filter(t => t.tipo === filters.type);
    }

    // Filtro de Categoria
    if (filters.category !== 'all') {
      result = result.filter(t => t.categoria === filters.category);
    }

    // Simulação de filtro de data (usando string comparison simples para o mock)
    // Em produção usaríamos new Date(t.data)
    // Como o mock usa DD/MM/YYYY e o input YYYY-MM-DD, vamos ignorar a data exata no mock
    // e focar na funcionalidade visual de filtragem de tipo/categoria para a demo.
    
    setFilteredData(result);
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = (format: 'PDF' | 'Excel') => {
    setIsGenerating(true);
    // Simula tempo de processamento
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Relatório em ${format} gerado com sucesso! O download iniciará em breve.`);
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Totais do Relatório
  const totalReceita = filteredData.filter(t => t.tipo === 'entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalDespesa = filteredData.filter(t => t.tipo === 'saida').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoPeriodo = totalReceita - totalDespesa;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-green-600 transition-colors mb-4" onClick={onCancel}>
        <i data-lucide="arrow-left" className="w-5 h-5"></i>
        <span>Voltar ao Financeiro</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <i data-lucide="file-text" className="w-6 h-6 text-green-600"></i>
             Central de Relatórios
           </h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gere extratos personalizados para contabilidade e gestão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar de Filtros */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md h-fit">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <i data-lucide="filter" className="w-4 h-4"></i> Filtros do Relatório
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data Inicial</label>
                    <input 
                        type="date" 
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data Final</label>
                    <input 
                        type="date" 
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                
                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo de Transação</label>
                    <select 
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">Todas</option>
                        <option value="entrada">Receitas (Entradas)</option>
                        <option value="saida">Despesas (Saídas)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
                    <select 
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">Todas as Categorias</option>
                        <optgroup label="Despesas">
                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                        <optgroup label="Receitas">
                            {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                    </select>
                </div>
            </div>
        </div>

        {/* Área de Preview e Ação */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Cards de Resumo da Seleção */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase">Total Receitas</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalReceita)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase">Total Despesas</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalDespesa)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Saldo do Período</p>
                    <p className={`text-xl font-bold mt-1 ${saldoPeriodo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldoPeriodo)}</p>
                </div>
            </div>

            {/* Tabela de Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Pré-visualização do Documento</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{filteredData.length} registros encontrados</span>
                </div>
                
                {filteredData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Descrição</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((t) => (
                                    <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-3 text-xs">{t.data}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{t.descricao}</td>
                                        <td className="px-6 py-3 text-xs">{t.categoria}</td>
                                        <td className={`px-6 py-3 text-right font-bold ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                                            {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <i data-lucide="search-x" className="w-12 h-12 mb-2"></i>
                        <p>Nenhum dado encontrado com os filtros atuais.</p>
                    </div>
                )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => handleExport('Excel')}
                    disabled={isGenerating || filteredData.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i data-lucide="sheet" className="w-5 h-5 text-green-600"></i>
                    Exportar Excel (.csv)
                </button>
                <button 
                    onClick={() => handleExport('PDF')}
                    disabled={isGenerating || filteredData.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Gerando PDF...
                        </>
                    ) : (
                        <>
                            <i data-lucide="file-down" className="w-5 h-5"></i>
                            Baixar Relatório PDF
                        </>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default FinancialReportView;
