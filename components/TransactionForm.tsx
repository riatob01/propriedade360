import React, { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { Transaction } from '../types';

interface TransactionFormProps {
  type: 'purchase' | 'sale';
  onCancel: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  initialData?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, onCancel, onSave, initialData }) => {
  const isPurchase = type === 'purchase';
  const isEditing = !!initialData;
  const categories = isPurchase ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    entity: '', // Fornecedor ou Cliente
    value: '',
    date: new Date().toISOString().split('T')[0], // Hoje como padrão
    status: 'paid' // paid or pending
  });

  useEffect(() => {
    if (initialData) {
        setFormData({
            description: initialData.descricao,
            category: initialData.categoria,
            entity: initialData.entity || '',
            value: initialData.valor.toString(),
            date: initialData.data,
            status: initialData.status
        });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Objeto base compatível com a interface Transaction
    const transactionData = {
        descricao: formData.description,
        categoria: formData.category,
        entity: formData.entity,
        valor: parseFloat(formData.value) || 0, // Fallback para 0 se vazio
        data: formData.date,
        tipo: isPurchase ? 'saida' : 'entrada' as 'entrada' | 'saida',
        status: formData.status as 'paid' | 'pending'
    };

    if (isEditing && initialData) {
        // Se editando, incluir o ID existente
        onSave({ ...transactionData, id: initialData.id } as Transaction);
    } else {
        // Se criando, enviar sem ID (o App.tsx gera o ID)
        onSave(transactionData as Omit<Transaction, 'id'>);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-gray-500 cursor-pointer hover:text-green-600 transition-colors" onClick={onCancel}>
        <i data-lucide="arrow-left" className="w-5 h-5"></i>
        <span>Voltar ao Financeiro</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${isPurchase ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isPurchase ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
            <i data-lucide={isPurchase ? "shopping-cart" : "trending-up"} className="w-6 h-6"></i>
            {isEditing 
                ? (isPurchase ? 'Editar Compra' : 'Editar Venda')
                : (isPurchase ? 'Registrar Nova Compra' : 'Registrar Venda')
            }
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isPurchase 
              ? 'Insira os detalhes da despesa para controle de fluxo de caixa.' 
              : 'Registre as receitas provenientes da produção ou serviços.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Descrição */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição do Produto/Serviço
              </label>
              <input
                type="text"
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder={isPurchase ? "Ex: Adubo NPK 20-05-20" : "Ex: Venda Soja Lote 14"}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Total (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">R$</span>
                <input
                    type="number"
                    id="value"
                    name="value"
                    required
                    step="0.01"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder="0,00"
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Fornecedor / Cliente */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="entity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isPurchase ? 'Fornecedor' : 'Cliente/Comprador'}
              </label>
              <div className="relative">
                <i data-lucide="building-2" className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"></i>
                <input
                    type="text"
                    id="entity"
                    name="entity"
                    required
                    value={formData.entity}
                    onChange={handleChange}
                    placeholder={isPurchase ? "Ex: AgroComercial Ltda" : "Ex: Cooperativa Local"}
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data do {isPurchase ? 'Pagamento' : 'Recebimento'}
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status da Transação
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: 'paid' }))}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                            formData.status === 'paid' 
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {isPurchase ? 'Pago' : 'Recebido'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                            formData.status === 'pending' 
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        Agendado
                    </button>
                </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white rounded-lg font-medium shadow-md transition-all transform active:scale-95 flex items-center gap-2
                ${isPurchase ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <i data-lucide="check-circle" className="w-4 h-4"></i>
              {isEditing ? 'Salvar Alterações' : (isPurchase ? 'Confirmar Compra' : 'Confirmar Venda')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;