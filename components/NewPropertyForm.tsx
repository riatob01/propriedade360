
import React, { useState, useEffect } from 'react';
import { View, PropertyData, FieldData } from '../types';

interface NewPropertyFormProps {
  onCancel: () => void;
  onSave: (data: PropertyData) => void;
  mode?: 'create' | 'edit';
  initialData?: PropertyData;
}

const NewPropertyForm: React.FC<NewPropertyFormProps> = ({ onCancel, onSave, mode = 'create', initialData }) => {
  const isEditing = mode === 'edit';

  // State for Property Form
  const [formData, setFormData] = useState({
    nome: '',
    proprietario: '',
    cidade: '',
    estado: '',
    cep: '',
    area: '',
  });

  // State for Fields (Talhões) Management
  const [showFieldsSection, setShowFieldsSection] = useState(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [isFieldFormOpen, setIsFieldFormOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  
  // State for current field being added/edited
  const [currentField, setCurrentField] = useState<FieldData>({
    id: '',
    name: '',
    area: '',
    culture: ''
  });

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        nome: initialData.nome,
        proprietario: initialData.proprietario,
        cidade: initialData.cidade,
        estado: initialData.estado,
        cep: initialData.cep,
        area: initialData.area,
      });
      setFields(initialData.talhoes || []);
      setShowFieldsSection(true);
    }
  }, [isEditing, initialData]);

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Field Management Logic ---

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentField(prev => ({ ...prev, [name]: value }));
  };

  const openNewFieldForm = () => {
    setCurrentField({ id: '', name: '', area: '', culture: '' });
    setEditingFieldId(null);
    setIsFieldFormOpen(true);
  };

  const handleEditField = (field: FieldData) => {
    setCurrentField(field);
    setEditingFieldId(field.id);
    setIsFieldFormOpen(true);
  };

  const handleDeleteField = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este talhão?')) {
      setFields(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSaveField = () => {
    if (!currentField.name || !currentField.area || !currentField.culture) {
      alert("Por favor, preencha todos os campos do talhão.");
      return;
    }

    if (editingFieldId) {
      // Update existing
      setFields(prev => prev.map(f => f.id === editingFieldId ? { ...currentField, id: editingFieldId } : f));
    } else {
      // Add new
      const newField = { ...currentField, id: Date.now().toString() };
      setFields(prev => [...prev, newField]);
    }

    // Reset and close
    setIsFieldFormOpen(false);
    setEditingFieldId(null);
    setCurrentField({ id: '', name: '', area: '', culture: '' });
  };

  const cancelFieldForm = () => {
    setIsFieldFormOpen(false);
    setEditingFieldId(null);
  };

  // --- Main Submit ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: PropertyData = {
        ...formData,
        talhoes: fields
    };
    onSave(finalData);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-gray-500 cursor-pointer hover:text-green-600 transition-colors" onClick={onCancel}>
        <i data-lucide="arrow-left" className="w-5 h-5"></i>
        <span>Voltar ao Dashboard</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-gray-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i data-lucide={isEditing ? "pencil" : "plus-circle"} className="text-green-600"></i>
            {isEditing ? 'Editar Propriedade' : 'Cadastrar Nova Propriedade'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing 
              ? 'Atualize as informações da sua fazenda e gerencie seus talhões.' 
              : 'Preencha as informações básicas para iniciar o gerenciamento da fazenda.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nome da Propriedade */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da Propriedade
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handlePropertyChange}
                placeholder="Ex: Fazenda Santa Inês"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* Proprietário */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="proprietario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Proprietário
              </label>
              <input
                type="text"
                id="proprietario"
                name="proprietario"
                required
                value={formData.proprietario}
                onChange={handlePropertyChange}
                placeholder="Nome completo ou Razão Social"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* CEP */}
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handlePropertyChange}
                placeholder="00000-000"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado (UF)
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handlePropertyChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              >
                <option value="">Selecione...</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="PR">Paraná</option>
                <option value="GO">Goiás</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="SP">São Paulo</option>
                <option value="MG">Minas Gerais</option>
                <option value="BA">Bahia</option>
                <option value="MA">Maranhão</option>
                <option value="PI">Piauí</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>

            {/* Cidade */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handlePropertyChange}
                placeholder="Ex: Sorriso"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* Área e Botão de Talhões */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área Total da Propriedade (Hectares)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="number"
                        id="area"
                        name="area"
                        required
                        value={formData.area}
                        onChange={handlePropertyChange}
                        placeholder="0.00"
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-12"
                    />
                    <span className="absolute right-4 top-2.5 text-gray-500 dark:text-gray-400 font-medium">ha</span>
                </div>
                <button
                    type="button"
                    onClick={() => setShowFieldsSection(!showFieldsSection)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap
                        ${showFieldsSection ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    <i data-lucide="map" className="w-4 h-4"></i>
                    {showFieldsSection ? 'Ocultar Talhões' : 'Gerenciar Talhões'}
                </button>
              </div>
            </div>
            
            {/* --- SEÇÃO DE TALHÕES --- */}
            {showFieldsSection && (
                <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-700/30 p-5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 animate-fade-in">
                    
                    {/* Header da Seção */}
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                           <i data-lucide="layout-grid" className="w-4 h-4"></i>
                           Talhões Cadastrados
                        </h4>
                        {!isFieldFormOpen && (
                            <button 
                                type="button" 
                                onClick={openNewFieldForm}
                                className="text-sm flex items-center gap-1 text-green-600 hover:text-green-700 font-medium px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                            >
                                <i data-lucide="plus" className="w-3 h-3"></i> Adicionar Talhão
                            </button>
                        )}
                    </div>

                    {/* Formulário de Adição/Edição de Talhão */}
                    {isFieldFormOpen && (
                        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-green-200 dark:border-green-900">
                             <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                {editingFieldId ? 'Editar Talhão' : 'Novo Talhão'}
                             </h5>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nome do Talhão</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={currentField.name}
                                        onChange={handleFieldChange}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Ex: Talhão A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Área (ha)</label>
                                    <input 
                                        type="number" 
                                        name="area"
                                        value={currentField.area}
                                        onChange={handleFieldChange}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cultura</label>
                                    <input 
                                        type="text" 
                                        name="culture"
                                        value={currentField.culture}
                                        onChange={handleFieldChange}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Ex: Soja, Milho"
                                    />
                                </div>
                             </div>
                             <div className="flex justify-end gap-2 mt-4">
                                 <button 
                                    type="button" 
                                    onClick={cancelFieldForm}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                 >
                                    Cancelar
                                 </button>
                                 <button 
                                    type="button" 
                                    onClick={handleSaveField}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                 >
                                    {editingFieldId ? 'Atualizar Talhão' : 'Salvar Talhão'}
                                 </button>
                             </div>
                        </div>
                    )}
                    
                    {/* Lista de Talhões */}
                    <div className="space-y-2">
                        {fields.length > 0 ? (
                             fields.map((field) => (
                                <div key={field.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                        <span className="font-medium text-gray-800 dark:text-white">{field.name}</span>
                                        <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                <i data-lucide="maximize" className="w-3 h-3"></i> {field.area} ha
                                            </span>
                                            <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded flex items-center gap-1">
                                                <i data-lucide="sprout" className="w-3 h-3"></i> {field.culture}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            type="button" 
                                            onClick={() => handleEditField(field)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <i data-lucide="edit-2" className="w-4 h-4"></i>
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteField(field.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                            title="Remover"
                                        >
                                            <i data-lucide="trash-2" className="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>
                             ))
                        ) : (
                            !isFieldFormOpen && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <i data-lucide="map-pin" className="w-8 h-8 mx-auto mb-2 opacity-30"></i>
                                    <p className="text-sm">Nenhum talhão registrado.</p>
                                    <p className="text-xs mt-1">Clique em "Adicionar Talhão" para começar.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

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
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all transform active:scale-95"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Propriedade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPropertyForm;
