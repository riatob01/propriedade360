
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface NewTaskFormProps {
  onCancel: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  initialData?: Task;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onCancel, onSave, initialData }) => {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    title: '',
    local: '',
    prioridade: 'Média',
    status: 'todo',
    data: new Date().toISOString().split('T')[0],
    responsavel: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        local: initialData.local,
        prioridade: initialData.prioridade,
        status: initialData.status,
        data: initialData.data,
        responsavel: initialData.responsavel
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && initialData) {
      onSave({ ...formData, id: initialData.id });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-gray-500 cursor-pointer hover:text-green-600 transition-colors" onClick={onCancel}>
        <i data-lucide="arrow-left" className="w-5 h-5"></i>
        <span>Voltar ao Operacional</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <i data-lucide={isEditing ? "pencil" : "clipboard-list"} className="w-6 h-6"></i>
            {isEditing ? 'Editar Tarefa' : 'Nova Ordem de Serviço'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? 'Atualize as informações da tarefa selecionada.' : 'Crie uma nova tarefa e atribua a um responsável ou equipe.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Título da Tarefa */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título da Tarefa / Atividade
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Manutenção Preventiva Colheitadeira"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Local */}
            <div>
              <label htmlFor="local" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Local de Execução
              </label>
              <div className="relative">
                <i data-lucide="map-pin" className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"></i>
                <input
                    type="text"
                    id="local"
                    name="local"
                    required
                    value={formData.local}
                    onChange={handleChange}
                    placeholder="Ex: Talhão 05 ou Oficina"
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Responsável */}
            <div>
              <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsável
              </label>
              <div className="relative">
                <i data-lucide="user" className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"></i>
                <input
                    type="text"
                    id="responsavel"
                    name="responsavel"
                    required
                    value={formData.responsavel}
                    onChange={handleChange}
                    placeholder="Nome do funcionário ou equipe"
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nível de Prioridade
              </label>
              <select
                id="prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            {/* Data Limite / Execução */}
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Prevista
              </label>
              <input
                type="date"
                id="data"
                name="data"
                required
                value={formData.data}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Status Inicial */}
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status Atual
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="status" 
                            value="todo" 
                            checked={formData.status === 'todo'} 
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">A Fazer</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="status" 
                            value="in_progress" 
                            checked={formData.status === 'in_progress'} 
                            onChange={handleChange}
                            className="w-4 h-4 text-yellow-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Em Andamento</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="status" 
                            value="done" 
                            checked={formData.status === 'done'} 
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Concluído</span>
                    </label>
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
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all transform active:scale-95 flex items-center gap-2"
            >
              <i data-lucide="save" className="w-4 h-4"></i>
              {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskForm;
