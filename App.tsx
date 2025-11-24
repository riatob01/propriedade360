
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AIAssistant from './components/AIAssistant';
import ProductivityView from './components/ProductivityView';
import NewPropertyForm from './components/NewPropertyForm';
import OperationalView from './components/OperationalView';
import FinancialView from './components/FinancialView';
import TransactionForm from './components/TransactionForm';
import FinancialReportView from './components/FinancialReportView';
import NewTaskForm from './components/NewTaskForm';
import WeatherView from './components/WeatherView';
import { View, PropertyData, Task, Transaction, FieldData, ProductivityHistoryItem } from './types';
import { MOCK_TASKS, MOCK_TRANSACTIONS, MOCK_PRODUCTIVITY_HISTORY } from './constants';

// Dados iniciais padrão (Fallback caso não tenha nada salvo)
const INITIAL_PROPERTY_DATA: PropertyData = {
  nome: 'Fazenda Santa Inês',
  proprietario: 'João da Silva',
  cidade: 'Lucas do Rio Verde',
  estado: 'MT',
  cep: '78455-000',
  area: '1250',
  talhoes: [
    { 
      id: '1', 
      name: 'Talhão da Sede', 
      area: '120', 
      culture: 'Soja', 
      status: 'Colhido', 
      progresso: 100, 
      rendimento: 72,
      historicoSolo: [
        {
            id: 'old_1',
            dataAnalise: '2022-09-10',
            laboratorio: 'SoloLab',
            amostraId: '102030',
            ph: 5.8,
            materiaOrganica: 2.4,
            argila: 26.0,
            areia: 56.0,
            silte: 18.0,
            saturacaoBase: 48,
            fosforo: 18,
            potassio: 0.30,
            calcio: 2.1,
            magnesio: 0.9,
            ctc: 6.8,
            aluminio: 0.2,
            hAl: 4.1
        },
        {
            id: 'new_1',
            dataAnalise: '2023-09-15',
            laboratorio: 'SoloLab',
            amostraId: '246160',
            ph: 6.2,
            materiaOrganica: 2.6,
            argila: 26.5,
            areia: 55.8,
            silte: 17.7,
            saturacaoBase: 55,
            fosforo: 25,
            potassio: 0.39,
            calcio: 2.6,
            magnesio: 1.1,
            ctc: 7.5,
            aluminio: 0,
            hAl: 3.4
        }
      ]
    },
    { id: '2', name: 'Talhão do Rio', area: '85', culture: 'Milho', status: 'Desenvolvimento', progresso: 45, rendimento: 0, historicoSolo: [] },
    { id: '3', name: 'Encosta Norte', area: '150', culture: 'Algodão', status: 'Plantio', progresso: 100, rendimento: 0, historicoSolo: [] },
  ]
};

// Helper para normalizar datas para YYYY-MM-DD de forma segura
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
};

// Adaptar Mock Transactions para o formato da interface nova
const INITIAL_TRANSACTIONS: Transaction[] = MOCK_TRANSACTIONS.map(t => ({
  ...t,
  entity: 'Não informado',
  data: normalizeDate(t.data),
  tipo: t.tipo as 'entrada' | 'saida',
  status: (t.status === 'concluido' ? 'paid' : 'pending') as 'paid' | 'pending'
}));

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado centralizado da Propriedade com Persistência Segura
  const [property, setProperty] = useState<PropertyData>(() => {
    const savedData = localStorage.getItem('property360_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Validação simples para garantir que o objeto tem a forma correta
        if (parsed && parsed.nome && Array.isArray(parsed.talhoes)) {
          // Migração Segura: Se tiver 'solo' antigo mas não 'historicoSolo', converte.
          const talhoesMigrados = parsed.talhoes.map((t: FieldData) => {
             if (!t.historicoSolo) {
                 return {
                     ...t,
                     historicoSolo: t.solo ? [{...t.solo, id: Date.now().toString()}] : []
                 };
             }
             return t;
          });
          return { ...parsed, talhoes: talhoesMigrados };
        }
      } catch (e) {
        console.error("Erro ao ler dados da propriedade, usando padrão.", e);
      }
    }
    return INITIAL_PROPERTY_DATA;
  });

  // Estado centralizado de Tarefas com Persistência Segura
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('property360_tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Erro ao ler tarefas locais", e);
      }
    }
    return MOCK_TASKS;
  });

  // Estado centralizado de Transações Financeiras com Persistência Segura
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTrans = localStorage.getItem('property360_transactions');
    if (savedTrans) {
      try {
        const parsed = JSON.parse(savedTrans);
        if (Array.isArray(parsed)) {
            // Garantir que datas antigas também sejam normalizadas ao carregar
            return parsed.map((t: any) => ({
                ...t,
                data: normalizeDate(t.data),
                valor: Number(t.valor) // Garantir que valor é número
            }));
        }
      } catch (e) {
        console.error("Erro ao ler transações locais", e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Estado de Histórico de Produtividade (Safra)
  const [productivityHistory, setProductivityHistory] = useState<ProductivityHistoryItem[]>(() => {
    const savedHist = localStorage.getItem('property360_prod_history');
    if (savedHist) {
        try { return JSON.parse(savedHist); } catch(e) {}
    }
    return MOCK_PRODUCTIVITY_HISTORY;
  });

  // Estados de Edição
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [activeView, isSidebarOpen, tasks, transactions, property]);

  // --- Handlers Propriedade ---
  const handleSaveProperty = (data: PropertyData) => {
    setProperty(data);
    localStorage.setItem('property360_data', JSON.stringify(data));
    setActiveView(View.DASHBOARD);
  };

  const handleUpdateFieldStatus = (fieldId: string, updates: Partial<FieldData>) => {
    const updatedTalhoes = property.talhoes.map(t => 
      t.id === fieldId ? { ...t, ...updates } : t
    );
    const updatedProperty = { ...property, talhoes: updatedTalhoes };
    setProperty(updatedProperty);
    localStorage.setItem('property360_data', JSON.stringify(updatedProperty));
  };

  const handleAddField = (newField: FieldData) => {
    const updatedTalhoes = [...(property.talhoes || []), newField];
    const updatedProperty = { ...property, talhoes: updatedTalhoes };
    setProperty(updatedProperty);
    localStorage.setItem('property360_data', JSON.stringify(updatedProperty));
  };

  const handleCloseCycle = (fieldId: string, finalYield: number, safraLabel: string) => {
    const field = property.talhoes.find(t => t.id === fieldId);
    if (!field) return;

    // 1. Atualizar Histórico
    const newHistory = [...productivityHistory];
    const existingSafraIndex = newHistory.findIndex(h => h.safra === safraLabel);

    if (existingSafraIndex >= 0) {
        const item = newHistory[existingSafraIndex];
        const culturaKey = field.culture.toLowerCase().includes('soja') ? 'soja' : field.culture.toLowerCase().includes('milho') ? 'milho' : 'outros';
        
        newHistory[existingSafraIndex] = {
            ...item,
            [culturaKey]: finalYield 
        };
    } else {
        // Nova Safra
        const culturaKey = field.culture.toLowerCase().includes('soja') ? 'soja' : field.culture.toLowerCase().includes('milho') ? 'milho' : 'outros';
        const newItem: ProductivityHistoryItem = {
            safra: safraLabel,
            soja: 0,
            milho: 0,
            [culturaKey]: finalYield
        };
        newHistory.push(newItem);
    }

    setProductivityHistory(newHistory);
    localStorage.setItem('property360_prod_history', JSON.stringify(newHistory));

    // 2. Resetar Talhão
    handleUpdateFieldStatus(fieldId, {
        status: 'Aguardando',
        progresso: 0,
        rendimento: 0
    });
  };

  // --- Handlers Tarefas ---
  const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
    let updatedTasks;
    if ('id' in taskData) {
      updatedTasks = tasks.map(t => t.id === taskData.id ? taskData : t);
    } else {
      const newTask: Task = { ...taskData, id: Date.now() };
      updatedTasks = [...tasks, newTask];
    }
    setTasks(updatedTasks);
    localStorage.setItem('property360_tasks', JSON.stringify(updatedTasks));
    setEditingTask(null);
    setActiveView(View.OPERACIONAL);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('property360_tasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem('property360_tasks', JSON.stringify(updatedTasks));
    }
  };

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setActiveView(View.EDITAR_TAREFA);
  };

  // --- Handlers Financeiro ---
  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
    let updatedTransactions;
    if ('id' in transactionData) {
      updatedTransactions = transactions.map(t => t.id === transactionData.id ? transactionData : t);
    } else {
      // Cast explícito para garantir compatibilidade
      const newTrans: Transaction = { ...(transactionData as Transaction), id: Date.now() };
      updatedTransactions = [newTrans, ...transactions];
    }
    setTransactions(updatedTransactions);
    localStorage.setItem('property360_transactions', JSON.stringify(updatedTransactions));
    setEditingTransaction(null);
    setActiveView(View.FINANCEIRO);
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('property360_transactions', JSON.stringify(updated));
    }
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveView(View.EDITAR_TRANSACAO);
  };

  // --- Roteamento ---
  const renderView = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return (
          <DashboardView 
            onNavigate={setActiveView} 
            property={property} 
            transactions={transactions} 
          />
        );
      case View.NOVA_PROPRIEDADE:
        return (
          <NewPropertyForm 
            mode="create"
            onCancel={() => setActiveView(View.DASHBOARD)} 
            onSave={handleSaveProperty} 
          />
        );
      case View.EDITAR_PROPRIEDADE:
        return (
          <NewPropertyForm 
            mode="edit"
            initialData={property}
            onCancel={() => setActiveView(View.DASHBOARD)} 
            onSave={handleSaveProperty} 
          />
        );
      case View.PRODUTIVIDADE:
        return (
          <ProductivityView 
             property={property}
             productivityHistory={productivityHistory}
             onUpdateField={handleUpdateFieldStatus}
             onAddField={handleAddField}
             onCloseCycle={handleCloseCycle}
          />
        );
      case View.OPERACIONAL:
        return (
          <OperationalView 
            onNavigate={setActiveView} 
            tasks={tasks} 
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTaskClick}
          />
        );
      case View.FINANCEIRO:
        return (
          <FinancialView 
            onNavigate={setActiveView} 
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransactionClick}
          />
        );
      case View.NOVA_COMPRA:
        return (
          <TransactionForm 
            type="purchase" 
            onCancel={() => setActiveView(View.FINANCEIRO)} 
            onSave={handleSaveTransaction} 
          />
        );
      case View.NOVA_VENDA:
        return (
          <TransactionForm 
            type="sale" 
            onCancel={() => setActiveView(View.FINANCEIRO)} 
            onSave={handleSaveTransaction} 
          />
        );
      case View.EDITAR_TRANSACAO:
        return (
          <TransactionForm 
            type={editingTransaction?.tipo === 'entrada' ? 'sale' : 'purchase'}
            initialData={editingTransaction || undefined}
            onCancel={() => {
              setEditingTransaction(null);
              setActiveView(View.FINANCEIRO);
            }} 
            onSave={handleSaveTransaction} 
          />
        );
      case View.RELATORIOS_FINANCEIROS:
        return <FinancialReportView onCancel={() => setActiveView(View.FINANCEIRO)} />;
      case View.NOVA_TAREFA:
        return (
          <NewTaskForm 
            onCancel={() => setActiveView(View.OPERACIONAL)} 
            onSave={handleSaveTask} 
          />
        );
      case View.EDITAR_TAREFA:
        return (
          <NewTaskForm 
            initialData={editingTask || undefined}
            onCancel={() => {
              setEditingTask(null);
              setActiveView(View.OPERACIONAL);
            }} 
            onSave={handleSaveTask} 
          />
        );
      case View.ANALISTA_IA:
        return <AIAssistant />;
      case View.CLIMA:
        return <WeatherView property={property} />;
      default:
        return (
          <DashboardView 
            onNavigate={setActiveView} 
            property={property} 
            transactions={transactions} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeView={activeView} toggleSidebar={toggleSidebar} />
        <main ref={mainContentRef} className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

declare global {
    interface Window {
        lucide: any;
    }
}

export default App;
