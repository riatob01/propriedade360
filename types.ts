
export enum View {
  DASHBOARD = 'DASHBOARD',
  FINANCEIRO = 'FINANCEIRO',
  OPERACIONAL = 'OPERACIONAL',
  PRODUTIVIDADE = 'PRODUTIVIDADE',
  CLIMA = 'CLIMA',
  ANALISTA_IA = 'ANALISTA_IA',
  NOVA_PROPRIEDADE = 'NOVA_PROPRIEDADE',
  EDITAR_PROPRIEDADE = 'EDITAR_PROPRIEDADE',
  NOVA_COMPRA = 'NOVA_COMPRA',
  NOVA_VENDA = 'NOVA_VENDA',
  EDITAR_TRANSACAO = 'EDITAR_TRANSACAO',
  RELATORIOS_FINANCEIROS = 'RELATORIOS_FINANCEIROS',
  NOVA_TAREFA = 'NOVA_TAREFA',
  EDITAR_TAREFA = 'EDITAR_TAREFA',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SoilData {
  id?: string; // Identificador único para a análise na lista
  // Identificação
  dataAnalise: string;
  laboratorio?: string;
  amostraId?: string;

  // Reação do Solo e Índices
  ph: number; // pH CaCl2 ou H2O (padrão principal)
  phSmp?: number; // pH SMP
  saturacaoBase: number; // V%
  saturacaoAluminio?: number; // m%
  ctc?: number; // CTC a pH 7.0
  materiaOrganica: number; // g/dm3 ou %

  // Características Físicas (Textura)
  argila: number; // % ou g/kg
  areia?: number;
  silte?: number;

  // Macronutrientes
  fosforo?: number; // P (mg/dm3)
  potassio?: number; // K (cmol/dm3 ou mg/dm3)
  calcio?: number; // Ca (cmol/dm3)
  magnesio?: number; // Mg (cmol/dm3)
  enxofre?: number; // S (mg/dm3)
  aluminio?: number; // Al (cmol/dm3)
  hAl?: number; // H+Al (Acidez Potencial)

  // Micronutrientes
  boro?: number;
  cobre?: number;
  ferro?: number;
  manganes?: number;
  zinco?: number;

  observacoes?: string;
}

export interface FieldData {
  id: string;
  name: string;
  area: string;
  culture: string;
  // Campos de Produtividade
  status?: 'Plantio' | 'Desenvolvimento' | 'Maturação' | 'Colhendo' | 'Colhido' | 'Aguardando';
  progresso?: number; // 0 a 100
  rendimento?: number; // sacas por hectare
  // Campos de Solo
  solo?: SoilData; // Mantido para retrocompatibilidade, mas o principal agora é historicoSolo
  historicoSolo?: SoilData[]; // Lista de análises
}

export interface PropertyData {
  nome: string;
  proprietario: string;
  cidade: string;
  estado: string;
  cep: string;
  area: string;
  talhoes: FieldData[];
}

export interface Task {
  id: number;
  title: string;
  local: string;
  prioridade: string;
  status: string;
  data: string;
  responsavel: string;
}

export interface Transaction {
  id: number;
  descricao: string;
  categoria: string;
  entity: string; // Fornecedor ou Cliente
  valor: number;
  data: string;
  tipo: 'entrada' | 'saida';
  status: 'paid' | 'pending'; // pago/recebido ou pendente
}

export interface ProductivityHistoryItem {
    safra: string;
    soja: number;
    milho: number;
    algodao?: number;
    outros?: number;
}

// Interfaces de Clima
export interface WeatherCurrent {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number; // km/h
    windDirection: string;
    condition: string;
    icon: string; // lucide icon name
    description: string;
    soilMoisture: number; // %
}

export interface WeatherHourly {
    time: string;
    temp: number;
    rainProb: number; // %
    icon: string;
}

export interface WeatherDaily {
    date: string; // Day of week
    min: number;
    max: number;
    rainMm: number;
    rainProb: number;
    condition: string;
    icon: string;
}
