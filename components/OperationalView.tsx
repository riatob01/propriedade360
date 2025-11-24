
import React, { useState, useMemo, useEffect } from 'react';
import { View, Task } from '../types';

interface OperationalViewProps {
    onNavigate: (view: View) => void;
    tasks: Task[];
    onUpdateStatus: (taskId: number, newStatus: string) => void;
    onDeleteTask: (taskId: number) => void;
    onEditTask: (task: Task) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'Média': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'Baixa': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface TaskCardProps {
    task: Task;
    onUpdateStatus: (taskId: number, newStatus: string) => void;
    onDelete: (taskId: number) => void;
    onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus, onDelete, onEdit }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow mb-3 flex flex-col h-full group">
    <div className="flex justify-between items-start mb-2">
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(task.prioridade)}`}>
        {task.prioridade}
      </span>
      <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <i data-lucide="calendar" className="w-3 h-3"></i> {task.data}
          </span>
          {/* Ações de Edição/Exclusão visíveis no hover ou sempre em mobile */}
          <div className="flex gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(task)} className="p-1 hover:text-blue-600 rounded">
                <i data-lucide="pencil" className="w-3 h-3"></i>
              </button>
              <button onClick={() => onDelete(task.id)} className="p-1 hover:text-red-600 rounded">
                <i data-lucide="trash-2" className="w-3 h-3"></i>
              </button>
          </div>
      </div>
    </div>
    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h4>
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
      <i data-lucide="map-pin" className="w-3 h-3 mr-1"></i>
      {task.local}
    </div>
    
    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                    {task.responsavel.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">{task.responsavel}</span>
            </div>
        </div>

        {/* Action Buttons based on Status */}
        <div className="flex gap-2">
            {task.status === 'todo' && (
                <button 
                    onClick={() => onUpdateStatus(task.id, 'in_progress')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-xs font-medium transition-colors"
                >
                    <i data-lucide="play-circle" className="w-3 h-3"></i> Iniciar
                </button>
            )}

            {task.status === 'in_progress' && (
                <>
                    <button 
                        onClick={() => onUpdateStatus(task.id, 'todo')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs font-medium transition-colors"
                        title="Voltar para A Fazer"
                    >
                        <i data-lucide="arrow-left" className="w-3 h-3"></i>
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(task.id, 'done')}
                        className="flex-[2] flex items-center justify-center gap-1.5 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded text-xs font-medium transition-colors"
                    >
                        <i data-lucide="check-circle-2" className="w-3 h-3"></i> Concluir
                    </button>
                </>
            )}

            {task.status === 'done' && (
                 <button 
                    onClick={() => onUpdateStatus(task.id, 'in_progress')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded text-xs font-medium transition-colors"
                >
                    <i data-lucide="rotate-ccw" className="w-3 h-3"></i> Reabrir
                </button>
            )}
        </div>
    </div>
  </div>
);

const OperationalView: React.FC<OperationalViewProps> = ({ onNavigate, tasks, onUpdateStatus, onDeleteTask, onEditTask }) => {

  // Forçar recarga de ícones
  useEffect(() => {
    if(window.lucide) window.lucide.createIcons();
  }, [tasks]);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterResponsible, setFilterResponsible] = useState('all');

  // Extrair lista única de responsáveis para o dropdown
  const responsibles = useMemo(() => {
    const list = tasks.map(t => t.responsavel);
    return Array.from(new Set(list));
  }, [tasks]);

  // Lógica de Filtragem
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.local.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.prioridade === filterPriority;
    const matchesResponsible = filterResponsible === 'all' || task.responsavel === filterResponsible;

    return matchesSearch && matchesPriority && matchesResponsible;
  });

  // Recalculate stats based on filtered data (optional: can be based on total tasks too)
  const todoCount = filteredTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'in_progress').length;
  const doneCount = filteredTasks.filter(t => t.status === 'done').length;
  const highPriorityCount = filteredTasks.filter(t => t.prioridade === 'Alta' && t.status !== 'done').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <i data-lucide="tractor" className="w-6 h-6 text-green-600"></i>
             Gestão Operacional
           </h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie tarefas, maquinário e equipes em tempo real.</p>
        </div>
        <button 
            onClick={() => onNavigate(View.NOVA_TAREFA)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
        >
            <i data-lucide="plus" className="w-4 h-4"></i>
            Nova Tarefa
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <i data-lucide="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"></i>
            <input 
                type="text" 
                placeholder="Buscar por tarefa ou local..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <select 
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
        >
            <option value="all">Todas Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
        </select>
        <select 
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
        >
            <option value="all">Todos Responsáveis</option>
            {responsibles.map(r => (
                <option key={r} value={r}>{r}</option>
            ))}
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tarefas (Filtro)</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredTasks.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Em Andamento</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-red-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Alta Prioridade</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{highPriorityCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Concluídas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{doneCount}</p>
          </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        
        {/* To Do Column */}
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    A Fazer
                </h3>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {todoCount}
                </span>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                {filteredTasks.filter(t => t.status === 'todo').map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onUpdateStatus={onUpdateStatus} 
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                    />
                ))}
                {todoCount === 0 && <p className="text-center text-xs text-gray-400 py-4">Nenhuma tarefa.</p>}
            </div>
            <button 
                onClick={() => onNavigate(View.NOVA_TAREFA)}
                className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-500 text-sm font-medium transition-colors"
            >
                + Adicionar Item
            </button>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Em Andamento
                </h3>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {inProgressCount}
                </span>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                {filteredTasks.filter(t => t.status === 'in_progress').map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onUpdateStatus={onUpdateStatus} 
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                    />
                ))}
                {inProgressCount === 0 && <p className="text-center text-xs text-gray-400 py-4">Nenhuma tarefa em andamento.</p>}
            </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Concluído
                </h3>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {doneCount}
                </span>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                {filteredTasks.filter(t => t.status === 'done').map(task => (
                    <div key={task.id} className="opacity-60 hover:opacity-100 transition-opacity">
                        <TaskCard 
                            task={task} 
                            onUpdateStatus={onUpdateStatus} 
                            onDelete={onDeleteTask}
                            onEdit={onEditTask}
                        />
                    </div>
                ))}
                {doneCount === 0 && <p className="text-center text-xs text-gray-400 py-4">Nenhuma tarefa concluída.</p>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default OperationalView;
