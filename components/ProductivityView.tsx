
import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, LineChart, Line
} from 'recharts';
import { PropertyData, FieldData, SoilData, ProductivityHistoryItem } from '../types';

interface ProductivityViewProps {
    property: PropertyData;
    productivityHistory: ProductivityHistoryItem[];
    onUpdateField: (fieldId: string, updates: Partial<FieldData>) => void;
    onAddField: (newField: FieldData) => void;
    onCloseCycle: (fieldId: string, finalYield: number, safraLabel: string) => void;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

const ProductivityView: React.FC<ProductivityViewProps> = ({ property, productivityHistory, onUpdateField, onAddField, onCloseCycle }) => {
  const [editingField, setEditingField] = useState<FieldData | null>(null);
  
  // --- Estados do Modal de Solo ---
  const [soilModalOpen, setSoilModalOpen] = useState(false);
  const [currentSoilField, setCurrentSoilField] = useState<FieldData | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | 'new' | 'compare'>('new');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [filterCulture, setFilterCulture] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form para Edição de Safra
  const [editForm, setEditForm] = useState({
      status: '',
      progresso: 0,
      rendimento: 0
  });

  // Estado auxiliar para fechamento de safra
  const [safraLabel, setSafraLabel] = useState('24/25');

  // Form para Análise de Solo
  const DEFAULT_SOIL_FORM: SoilData = {
      dataAnalise: new Date().toISOString().split('T')[0],
      laboratorio: '',
      amostraId: '',
      ph: 0,
      materiaOrganica: 0,
      argila: 0,
      areia: 0,
      silte: 0,
      saturacaoBase: 0,
      saturacaoAluminio: 0,
      ctc: 0,
      fosforo: 0,
      potassio: 0,
      calcio: 0,
      magnesio: 0,
      enxofre: 0,
      aluminio: 0,
      hAl: 0,
      boro: 0,
      cobre: 0,
      ferro: 0,
      manganes: 0,
      zinco: 0,
      observacoes: ''
  };

  const [soilForm, setSoilForm] = useState<SoilData>(DEFAULT_SOIL_FORM);

  // Form para Adição
  const [newFieldForm, setNewFieldForm] = useState({
      name: '',
      culture: '',
      area: ''
  });

  const fields = property.talhoes || [];

  // Recarregar ícones sempre que modais abrirem ou dados mudarem
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [editingField, isAddModalOpen, soilModalOpen, selectedAnalysisId, fields, viewMode, filterCulture, filterStatus, currentSoilField]);

  // --- Lógica de Seleção de Análise ---
  useEffect(() => {
    if (selectedAnalysisId !== 'new' && selectedAnalysisId !== 'compare' && currentSoilField) {
        const analysis = currentSoilField.historicoSolo?.find(s => s.id === selectedAnalysisId);
        if (analysis) {
            setSoilForm({ ...analysis });
        }
    } else if (selectedAnalysisId === 'new') {
        setSoilForm(DEFAULT_SOIL_FORM);
    }
  }, [selectedAnalysisId, currentSoilField]);

  // --- Processamento de Dados (Filtros e Gráficos) ---
  const filteredFields = useMemo(() => {
    return fields.filter(field => {
      const matchCulture = filterCulture === 'all' || field.culture === filterCulture;
      const matchStatus = filterStatus === 'all' || (field.status || 'Aguardando') === filterStatus;
      return matchCulture && matchStatus;
    });
  }, [fields, filterCulture, filterStatus]);

  const cropDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    fields.forEach(f => {
      const area = Number(f.area) || 0;
      if (distribution[f.culture]) distribution[f.culture] += area;
      else distribution[f.culture] = area;
    });
    return Object.keys(distribution).map(key => ({ name: key, value: distribution[key] }));
  }, [fields]);

  const uniqueCultures = useMemo(() => Array.from(new Set(fields.map(f => f.culture))), [fields]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(fields.map(f => f.status || 'Aguardando'))), [fields]);

  // Dados para Gráfico de Barras (Interpretação)
  const soilBarChartData = useMemo(() => {
      return [
          { name: 'P', value: soilForm.fosforo || 0, fill: '#10b981' }, 
          { name: 'K', value: (soilForm.potassio || 0) * 100, fill: '#10b981' },
          { name: 'Ca', value: (soilForm.calcio || 0) * 10, fill: '#3b82f6' },
          { name: 'Mg', value: (soilForm.magnesio || 0) * 20, fill: '#3b82f6' },
          { name: 'V%', value: soilForm.saturacaoBase || 0, fill: '#f59e0b' },
          { name: 'M.O.', value: (soilForm.materiaOrganica || 0) * 10, fill: '#8b5cf6' },
      ];
  }, [soilForm]);

  // Dados para Gráfico de Linha (Comparação)
  const soilComparisonData = useMemo(() => {
      if (!currentSoilField?.historicoSolo) return [];
      // Ordenar por data
      const sorted = [...currentSoilField.historicoSolo].sort((a, b) => new Date(a.dataAnalise).getTime() - new Date(b.dataAnalise).getTime());
      
      return sorted.map(analysis => ({
          date: analysis.dataAnalise.split('-').reverse().slice(0, 2).join('/'), // DD/MM (aprox)
          fullDate: analysis.dataAnalise,
          ph: analysis.ph,
          v: analysis.saturacaoBase,
          p: analysis.fosforo,
          k: (analysis.potassio || 0) * 100 // Escala para visualizar junto
      }));
  }, [currentSoilField]);

  // --- KPIs Dinâmicos ---
  const kpis = useMemo(() => {
      let totalArea = 0;
      let totalAreaColhidaOuColhendo = 0;
      let somaRendimento = 0;
      let totalProducaoEstimada = 0;
      let weightedProgress = 0;

      fields.forEach(f => {
          const area = Number(f.area) || 0;
          const rend = Number(f.rendimento) || 0;
          const prog = Number(f.progresso) || 0;

          totalArea += area;
          totalProducaoEstimada += (area * rend);
          weightedProgress += (prog * area);

          if (f.status === 'Colhido' || f.status === 'Colhendo') {
              totalAreaColhidaOuColhendo += area;
              somaRendimento += rend * area;
          }
      });

      const mediaRendimento = totalAreaColhidaOuColhendo > 0 
        ? (somaRendimento / totalAreaColhidaOuColhendo).toFixed(1) 
        : '0.0';
      
      const progressoGeral = totalArea > 0 
        ? (weightedProgress / totalArea).toFixed(0) 
        : '0';

      return {
          rendimentoMedio: mediaRendimento,
          producaoTotal: totalProducaoEstimada.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
          progressoGeral: progressoGeral
      };
  }, [fields]);

  // --- Handlers ---
  const openEditModal = (field: FieldData) => {
      setEditingField(field);
      setEditForm({
          status: field.status || 'Aguardando',
          progresso: field.progresso || 0,
          rendimento: field.rendimento || 0
      });
  };

  const openSoilModal = (field: FieldData) => {
      setCurrentSoilField(field);
      // Se tiver histórico, seleciona o mais recente por padrão, senão 'new'
      // Mas para UX, se tiver histórico, melhor mostrar a lista. Vamos começar em 'new' ou na última.
      // Vamos começar em 'new' para incentivar inserção, mas usuário vê a lista.
      setSelectedAnalysisId('new'); 
      setSoilForm(DEFAULT_SOIL_FORM);
      setSoilModalOpen(true);
  };

  const handleSaveEdit = () => {
      if (editingField) {
          onUpdateField(editingField.id, {
              status: editForm.status as any, // Cast necessário para corresponder ao tipo estrito
              progresso: Number(editForm.progresso),
              rendimento: Number(editForm.rendimento)
          });
          setEditingField(null);
      }
  };

  const handleCloseHarvest = () => {
      if(editingField) {
          if(confirm(`Deseja encerrar o ciclo do talhão "${editingField.name}"? Isso salvará a produtividade de ${editForm.rendimento} sc/ha no histórico da safra ${safraLabel} e resetará o talhão.`)) {
              onCloseCycle(editingField.id, Number(editForm.rendimento), safraLabel);
              setEditingField(null);
          }
      }
  };

  const handleSaveSoil = () => {
      if (currentSoilField) {
          const history = currentSoilField.historicoSolo || [];
          let updatedHistory;

          if (selectedAnalysisId === 'new') {
              // Add new
              const newAnalysis = { ...soilForm, id: Date.now().toString() };
              updatedHistory = [...history, newAnalysis];
          } else {
              // Update existing
              updatedHistory = history.map(h => h.id === selectedAnalysisId ? { ...soilForm, id: selectedAnalysisId } : h);
          }

          // Atualizar o campo com o novo histórico
          // Também atualizamos o campo 'solo' legado para o mais recente, para manter compatibilidade com visualização rápida
          const sorted = [...updatedHistory].sort((a, b) => new Date(b.dataAnalise).getTime() - new Date(a.dataAnalise).getTime());
          
          onUpdateField(currentSoilField.id, {
              historicoSolo: updatedHistory,
              solo: sorted[0] // O mais recente vira o principal
          });

          // Reset
          setSoilModalOpen(false);
          setCurrentSoilField(null);
      }
  };

  const handleSaveNewField = () => {
      if (!newFieldForm.name || !newFieldForm.culture || !newFieldForm.area) {
          alert('Preencha os campos obrigatórios.');
          return;
      }
      onAddField({
          id: Date.now().toString(),
          name: newFieldForm.name,
          culture: newFieldForm.culture,
          area: newFieldForm.area,
          status: 'Aguardando',
          progresso: 0,
          rendimento: 0,
          historicoSolo: []
      });
      setIsAddModalOpen(false);
      setNewFieldForm({ name: '', culture: '', area: '' });
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getStatusColor = (status: string | undefined) => {
      switch(status) {
          case 'Colhido': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
          case 'Colhendo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
          case 'Desenvolvimento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
          case 'Maturação': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
          case 'Plantio': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
  };

  // Componente de Input Auxiliar com Tipagem Segura
  const SoilInput = ({ label, value, field, unit = '', step = '0.1' }: { label: string, value: number | string | undefined, field: keyof SoilData, unit?: string, step?: string }) => (
      <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
          <div className="relative">
            <input 
                type={typeof value === 'number' || !isNaN(Number(value)) ? 'number' : 'text'} 
                step={step}
                value={value ?? ''}
                onChange={(e) => {
                    const val = e.target.value;
                    // Se o campo original for número, converte. Se for string (como data/lab), mantém string.
                    const isNumberField = field !== 'laboratorio' && field !== 'amostraId' && field !== 'dataAnalise' && field !== 'observacoes';
                    
                    setSoilForm(prev => ({ 
                        ...prev, 
                        [field]: isNumberField ? (val === '' ? 0 : Number(val)) : val 
                    }));
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-green-500 outline-none"
            />
            {unit && <span className="absolute right-3 top-2 text-xs text-gray-400">{unit}</span>}
          </div>
      </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 relative">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Produtividade Média (Real)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpis.rendimentoMedio} sc/ha</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300">
              <i data-lucide="sprout" className="w-6 h-6"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Previsão Colheita Total</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpis.producaoTotal} sc</h3>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-600 dark:text-yellow-300">
              <i data-lucide="wheat" className="w-6 h-6"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Progresso Geral Safra</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpis.progressoGeral}%</h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300">
              <i data-lucide="timer" className="w-6 h-6"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-96">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Histórico de Produtividade (Safra Fechada)</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSoja" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMilho" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="safra" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }} />
                  <Legend />
                  <Area type="monotone" dataKey="soja" stroke="#10b981" fillOpacity={1} fill="url(#colorSoja)" name="Soja" />
                  <Area type="monotone" dataKey="milho" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMilho)" name="Milho" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-96">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Distribuição de Culturas (ha)</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={cropDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {cropDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value} ha`} />
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
      </div>

      {/* Gestão de Talhões */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gestão de Talhões</h3>
            <div className="flex flex-wrap items-center gap-3">
                <select value={filterCulture} onChange={(e) => setFilterCulture(e.target.value)} className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white">
                    <option value="all">Todas Culturas</option>
                    {uniqueCultures.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white">
                    <option value="all">Todos Status</option>
                    {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}><i data-lucide="list" className="w-5 h-5"></i></button>
                    <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}><i data-lucide="layout-grid" className="w-5 h-5"></i></button>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    <i data-lucide="plus" className="w-4 h-4"></i> Adicionar
                </button>
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50">
            {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Talhão</th>
                                <th className="px-6 py-3">Cultura</th>
                                <th className="px-6 py-3">Área (ha)</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Progresso</th>
                                <th className="px-6 py-3">Solo</th>
                                <th className="px-6 py-3 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFields.map((field) => (
                                <tr key={field.id} className="bg-white border-b dark:bg-gray-800">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{field.name}</td>
                                    <td className="px-6 py-4">{field.culture}</td>
                                    <td className="px-6 py-4">{field.area}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(field.status)}`}>{field.status || 'Aguardando'}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${field.progresso || 0}%` }}></div></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => openSoilModal(field)} className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors">
                                            <i data-lucide="flask-conical" className="w-4 h-4"></i>
                                            {field.historicoSolo && field.historicoSolo.length > 0 ? field.historicoSolo.length : 'Add'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openEditModal(field)} className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 mx-auto"><i data-lucide="refresh-cw" className="w-3 h-3"></i> Atualizar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFields.map((field) => (
                        <div key={field.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{field.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(field.status)}`}>{field.status || 'Aguardando'}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-3">{field.culture} • {field.area} ha</div>
                                <div className="mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${field.progresso || 0}%` }}></div></div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => openSoilModal(field)} className="flex-1 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded flex items-center justify-center gap-1 hover:bg-amber-100">
                                    <i data-lucide="flask-conical" className="w-3 h-3"></i> Solo ({field.historicoSolo?.length || 0})
                                </button>
                                <button onClick={() => openEditModal(field)} className="flex-1 py-2 bg-gray-50 text-gray-700 text-xs font-medium rounded flex items-center justify-center gap-2 hover:bg-gray-100">
                                    <i data-lucide="refresh-cw" className="w-3 h-3"></i> Safra
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- MODAL DE ANÁLISE DE SOLO (MASTER-DETAIL) --- */}
      {soilModalOpen && currentSoilField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-green-700 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <i data-lucide="file-check-2" className="w-6 h-6"></i>
                        Gestão de Solo: {currentSoilField.name}
                    </h3>
                    <button onClick={() => setSoilModalOpen(false)} className="text-white hover:bg-green-800 rounded p-1"><i data-lucide="x" className="w-6 h-6"></i></button>
                </div>

                {/* Body: Split View */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Sidebar: Lista de Análises */}
                    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
                        <div className="p-4">
                            <button 
                                onClick={() => setSelectedAnalysisId('new')}
                                className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors shadow-sm
                                    ${selectedAnalysisId === 'new' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'}`}
                            >
                                <i data-lucide="plus-circle" className="w-4 h-4"></i> Nova Análise
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-2 space-y-1">
                            {currentSoilField.historicoSolo && currentSoilField.historicoSolo.length > 0 && (
                                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Histórico</div>
                            )}
                            
                            {/* Lista de Datas */}
                            {currentSoilField.historicoSolo?.sort((a,b) => new Date(b.dataAnalise).getTime() - new Date(a.dataAnalise).getTime()).map((analysis) => (
                                <button
                                    key={analysis.id}
                                    onClick={() => setSelectedAnalysisId(analysis.id || '')}
                                    className={`w-full text-left px-3 py-3 rounded-md text-sm flex items-center justify-between group transition-colors
                                        ${selectedAnalysisId === analysis.id ? 'bg-white dark:bg-gray-700 shadow-sm border-l-4 border-green-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span>{analysis.dataAnalise.split('-').reverse().join('/')}</span>
                                    {selectedAnalysisId === analysis.id && <i data-lucide="chevron-right" className="w-4 h-4 text-green-500"></i>}
                                </button>
                            ))}
                            
                            {(!currentSoilField.historicoSolo || currentSoilField.historicoSolo.length === 0) && (
                                <div className="text-center p-4 text-xs text-gray-400">
                                    Nenhum histórico disponível.
                                </div>
                            )}
                        </div>

                        {/* Botão Comparar (só aparece se tiver 2+) */}
                        {(currentSoilField.historicoSolo?.length || 0) > 1 && (
                            <div className="p-4 border-t border-gray-200">
                                <button 
                                    onClick={() => setSelectedAnalysisId('compare')}
                                    className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors
                                        ${selectedAnalysisId === 'compare' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                >
                                    <i data-lucide="line-chart" className="w-4 h-4"></i> Comparar Safras
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-6">
                        
                        {/* MODO COMPARATIVO */}
                        {selectedAnalysisId === 'compare' ? (
                            <div className="space-y-6 animate-in fade-in">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Evolução da Fertilidade</h4>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-sm h-64 flex flex-col">
                                        <p className="text-sm font-bold text-gray-500 mb-2">pH e V% (Saturação)</p>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={soilComparisonData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis yAxisId="left" domain={[4, 8]} />
                                                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#8884d8" name="pH" strokeWidth={2} />
                                                    <Line yAxisId="right" type="monotone" dataKey="v" stroke="#82ca9d" name="V%" strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-sm h-64 flex flex-col">
                                        <p className="text-sm font-bold text-gray-500 mb-2">Fósforo (P) e Potássio (K)</p>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={soilComparisonData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="p" stroke="#f59e0b" name="Fósforo (P)" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="k" stroke="#10b981" name="Potássio (K x100)" strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 text-center italic">Comparação baseada nas datas das análises cadastradas.</p>
                            </div>
                        ) : (
                            // MODO FORMULÁRIO (Novo ou Edição)
                            <div className="space-y-6 animate-in fade-in">
                                {/* Header do Form */}
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-400">
                                        {selectedAnalysisId === 'new' ? 'Novo Laudo Laboratorial' : `Laudo de ${soilForm.dataAnalise}`}
                                    </h4>
                                    {selectedAnalysisId !== 'new' && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Modo Visualização/Edição</span>
                                    )}
                                </div>

                                {/* Seção 1: Identificação */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 md:col-span-1">
                                        <h5 className="text-xs font-bold uppercase text-gray-500 mb-3">Identificação</h5>
                                        <div className="space-y-3">
                                            <SoilInput label="Data" value={soilForm.dataAnalise} field="dataAnalise" />
                                            <SoilInput label="Laboratório" value={soilForm.laboratorio} field="laboratorio" />
                                            <SoilInput label="ID Amostra" value={soilForm.amostraId} field="amostraId" />
                                        </div>
                                    </div>
                                    
                                    {/* Gráfico de Interpretação Rápida */}
                                    <div className="md:col-span-2 bg-white border border-gray-200 p-4 rounded-lg shadow-sm h-60 flex flex-col">
                                        <p className="text-xs font-bold uppercase text-gray-500 mb-2">Interpretação Gráfica Atual</p>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={soilBarChartData} layout="horizontal">
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                                                    <Tooltip cursor={{fill: 'transparent'}} />
                                                    <Bar dataKey="value" barSize={30}>
                                                        {soilBarChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs Químicos */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <SoilInput label="pH" value={soilForm.ph} field="ph" />
                                    <SoilInput label="M.O. %" value={soilForm.materiaOrganica} field="materiaOrganica" />
                                    <SoilInput label="Argila %" value={soilForm.argila} field="argila" step="1" />
                                    <SoilInput label="V% (Base)" value={soilForm.saturacaoBase} field="saturacaoBase" step="1" />
                                    <SoilInput label="P (mg)" value={soilForm.fosforo} field="fosforo" step="1" />
                                    <SoilInput label="K (cmol)" value={soilForm.potassio} field="potassio" />
                                    <SoilInput label="Ca (cmol)" value={soilForm.calcio} field="calcio" />
                                    <SoilInput label="Mg (cmol)" value={soilForm.magnesio} field="magnesio" />
                                    <SoilInput label="S (mg)" value={soilForm.enxofre} field="enxofre" />
                                    <SoilInput label="CTC" value={soilForm.ctc} field="ctc" />
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                    <button 
                                        onClick={handleSaveSoil}
                                        className="px-6 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg shadow-md transition-colors flex items-center gap-2"
                                    >
                                        <i data-lucide="save" className="w-4 h-4"></i> 
                                        {selectedAnalysisId === 'new' ? 'Salvar Novo Laudo' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Outros Modais (Adicionar Talhão, Editar Status) */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                  <h3 className="font-bold mb-4 dark:text-white">Novo Talhão</h3>
                  <div className="space-y-4">
                      <input type="text" placeholder="Nome" className="w-full p-2 border rounded" value={newFieldForm.name} onChange={e => setNewFieldForm({...newFieldForm, name: e.target.value})} />
                      <input type="text" placeholder="Cultura" className="w-full p-2 border rounded" value={newFieldForm.culture} onChange={e => setNewFieldForm({...newFieldForm, culture: e.target.value})} />
                      <input type="number" placeholder="Área" className="w-full p-2 border rounded" value={newFieldForm.area} onChange={e => setNewFieldForm({...newFieldForm, area: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                      <button onClick={handleSaveNewField} className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>
                  </div>
              </div>
          </div>
      )}

      {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                  <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                      <i data-lucide="refresh-cw" className="w-5 h-5 text-blue-600"></i>
                      Atualizar Safra: {editingField.name}
                  </h3>
                  
                  <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status do Ciclo</label>
                        <select className="w-full p-2 border rounded" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                            <option value="Aguardando">Aguardando</option>
                            <option value="Plantio">Plantio</option>
                            <option value="Desenvolvimento">Desenvolvimento</option>
                            <option value="Maturação">Maturação</option>
                            <option value="Colhendo">Colhendo</option>
                            <option value="Colhido">Colhido (Final)</option>
                        </select>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Progresso: {editForm.progresso}%</label>
                          <input type="range" className="w-full" min="0" max="100" value={editForm.progresso} onChange={e => setEditForm({...editForm, progresso: Number(e.target.value)})} />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Rendimento (sc/ha)</label>
                        <input type="number" placeholder="Rendimento (sc/ha)" className="w-full p-2 border rounded" value={editForm.rendimento} onChange={e => setEditForm({...editForm, rendimento: Number(e.target.value)})} />
                      </div>

                      {/* Seção de Fechamento de Safra (Aparece apenas quando status é Colhido) */}
                      {editForm.status === 'Colhido' && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h5 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-1">
                                  <i data-lucide="alert-triangle" className="w-4 h-4"></i> Encerrar Ciclo?
                              </h5>
                              <p className="text-xs text-yellow-700 mb-3">
                                  Ao encerrar, os dados deste talhão serão arquivados no histórico e o status voltará para "Aguardando".
                              </p>
                              <div className="flex gap-2 mb-2">
                                  <input 
                                    type="text" 
                                    className="w-20 p-1 text-xs border rounded" 
                                    value={safraLabel} 
                                    onChange={(e) => setSafraLabel(e.target.value)} 
                                    placeholder="Safra"
                                  />
                                  <span className="text-xs flex items-center text-gray-500">Ex: 24/25</span>
                              </div>
                              <button 
                                onClick={handleCloseHarvest}
                                className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-bold transition-colors"
                              >
                                  Confirmar Fechamento e Arquivar
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                      <button onClick={() => setEditingField(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                      <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Salvar Status</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProductivityView;
