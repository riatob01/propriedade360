
import React from 'react';
import { View, WeatherCurrent, WeatherHourly, WeatherDaily } from './types';

interface NavItem {
  view: View;
  label: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    view: View.DASHBOARD,
    label: 'Dashboard',
    icon: <i data-lucide="layout-dashboard" className="w-5 h-5"></i>,
  },
  {
    view: View.FINANCEIRO,
    label: 'Financeiro',
    icon: <i data-lucide="dollar-sign" className="w-5 h-5"></i>,
  },
  {
    view: View.OPERACIONAL,
    label: 'Operacional',
    icon: <i data-lucide="tractor" className="w-5 h-5"></i>,
  },
  {
    view: View.PRODUTIVIDADE,
    label: 'Produtividade',
    icon: <i data-lucide="bar-chart-3" className="w-5 h-5"></i>,
  },
  {
    view: View.CLIMA,
    label: 'Clima',
    icon: <i data-lucide="cloud-sun" className="w-5 h-5"></i>,
  },
  {
    view: View.ANALISTA_IA,
    label: 'Analista IA',
    icon: <i data-lucide="brain-circuit" className="w-5 h-5"></i>,
  },
];

export const EXPENSE_CATEGORIES = [
  'Ração',
  'Fertilizantes',
  'Sementes',
  'Defensivos Agrícolas',
  'Combustível',
  'Maquinário & Peças',
  'Manutenção',
  'Mão de Obra',
  'Infraestrutura',
  'Administrativo',
  'Impostos & Taxas',
  'Outros'
];

export const INCOME_CATEGORIES = [
  'Venda de Soja',
  'Venda de Milho',
  'Venda de Algodão',
  'Venda de Sorgo',
  'Venda de Animais',
  'Prestação de Serviços',
  'Aluguel de Máquinas',
  'Royalties',
  'Outros'
];

export const MOCK_FINANCIAL_DATA = [
  { name: 'Jan', receita: 40000, despesa: 24000 },
  { name: 'Fev', receita: 30000, despesa: 13980 },
  { name: 'Mar', receita: 20000, despesa: 98000 }, // Compra de Insumos
  { name: 'Abr', receita: 27800, despesa: 39080 },
  { name: 'Mai', receita: 18900, despesa: 48000 },
  { name: 'Jun', receita: 63900, despesa: 38000 }, // Colheita
];

export const MOCK_EXPENSES_BREAKDOWN = [
  { name: 'Insumos (Sementes/Químicos)', value: 145000, color: '#10b981' },
  { name: 'Maquinário & Combustível', value: 85000, color: '#3b82f6' },
  { name: 'Mão de Obra', value: 45000, color: '#f59e0b' },
  { name: 'Infraestrutura', value: 25000, color: '#6366f1' },
  { name: 'Administrativo', value: 12000, color: '#8b5cf6' },
];

export const MOCK_TRANSACTIONS = [
  { id: 1, descricao: 'Venda de Soja (Lote A)', categoria: 'Receita', valor: 45000, data: '28/10/2023', tipo: 'entrada', status: 'concluido' },
  { id: 2, descricao: 'Manutenção Colheitadeira', categoria: 'Maquinário', valor: 3500, data: '27/10/2023', tipo: 'saida', status: 'concluido' },
  { id: 3, descricao: 'Compra de Defensivos', categoria: 'Insumos', valor: 12800, data: '25/10/2023', tipo: 'saida', status: 'pendente' },
  { id: 4, descricao: 'Pagamento Funcionários', categoria: 'Mão de Obra', valor: 8500, data: '05/11/2023', tipo: 'saida', status: 'agendado' },
  { id: 5, descricao: 'Venda de Milho Futuro', categoria: 'Receita', valor: 22000, data: '15/11/2023', tipo: 'entrada', status: 'agendado' },
];

export const MOCK_UPCOMING_BILLS = {
  payables: [
    { id: 1, desc: 'Parcela Trator John Deere', date: '10/11', value: 12500 },
    { id: 2, desc: 'Conta de Energia (Irrigação)', date: '12/11', value: 3450 },
    { id: 3, desc: 'Folha de Pagamento', date: '05/11', value: 28000 },
  ],
  receivables: [
    { id: 1, desc: 'Contrato Soja #402', date: '15/11', value: 45000 },
    { id: 2, desc: 'Aluguel Pastagem', date: '20/11', value: 5000 },
  ]
};

// Dados Simples para Widget do Dashboard
export const MOCK_WEATHER_DATA = [
    { day: 'Hoje', temp: '28°C', icon: 'sun', condition: 'Ensolarado' },
    { day: 'Amanhã', temp: '25°C', icon: 'cloud-sun', condition: 'Parcialmente Nublado' },
    { day: 'Qua', temp: '22°C', icon: 'cloud-drizzle', condition: 'Chuvisco' },
    { day: 'Qui', temp: '23°C', icon: 'cloud-rain', condition: 'Chuva' },
    { day: 'Sex', temp: '26°C', icon: 'sun', condition: 'Ensolarado' },
];

// Dados Completos para a Tela de Clima
export const MOCK_FULL_WEATHER_DATA: { current: WeatherCurrent; hourly: WeatherHourly[]; daily: WeatherDaily[] } = {
    current: {
        temp: 29,
        feelsLike: 32,
        humidity: 58,
        windSpeed: 14,
        windDirection: 'NE',
        condition: 'Parcialmente Nublado',
        icon: 'cloud-sun',
        description: 'Possibilidade de chuva isolada no final da tarde.',
        soilMoisture: 45
    },
    hourly: [
        { time: '13:00', temp: 30, rainProb: 10, icon: 'sun' },
        { time: '14:00', temp: 31, rainProb: 20, icon: 'cloud-sun' },
        { time: '15:00', temp: 30, rainProb: 45, icon: 'cloud-sun-rain' },
        { time: '16:00', temp: 28, rainProb: 60, icon: 'cloud-rain' },
        { time: '17:00', temp: 27, rainProb: 40, icon: 'cloud-drizzle' },
        { time: '18:00', temp: 26, rainProb: 20, icon: 'cloud' },
        { time: '19:00', temp: 25, rainProb: 10, icon: 'moon' },
    ],
    daily: [
        { date: 'Hoje', min: 22, max: 31, rainMm: 5, rainProb: 60, condition: 'Chuva Tarde', icon: 'cloud-rain' },
        { date: 'Amanhã', min: 21, max: 28, rainMm: 12, rainProb: 80, condition: 'Chuvoso', icon: 'cloud-lightning' },
        { date: 'Quarta', min: 20, max: 26, rainMm: 2, rainProb: 30, condition: 'Nublado', icon: 'cloud' },
        { date: 'Quinta', min: 19, max: 27, rainMm: 0, rainProb: 10, condition: 'Parc. Nublado', icon: 'cloud-sun' },
        { date: 'Sexta', min: 20, max: 30, rainMm: 0, rainProb: 0, condition: 'Ensolarado', icon: 'sun' },
        { date: 'Sábado', min: 22, max: 32, rainMm: 0, rainProb: 0, condition: 'Ensolarado', icon: 'sun' },
        { date: 'Domingo', min: 23, max: 33, rainMm: 0, rainProb: 10, condition: 'Ensolarado', icon: 'sun' },
    ]
};

export const MOCK_PRODUCTIVITY_HISTORY = [
  { safra: '19/20', soja: 58, milho: 105 },
  { safra: '20/21', soja: 62, milho: 112 },
  { safra: '21/22', soja: 54, milho: 98 }, // Quebra de safra
  { safra: '22/23', soja: 68, milho: 125 },
  { safra: '23/24', soja: 72, milho: 132 },
];

export const MOCK_FIELDS_STATUS = [
  { id: 'T01', nome: 'Talhão da Sede', cultura: 'Soja', area: 120, status: 'Colhido', progresso: 100, rendimento: 75 },
  { id: 'T02', nome: 'Talhão do Rio', cultura: 'Soja', area: 85, status: 'Colhendo', progresso: 65, rendimento: 71 },
  { id: 'T03', nome: 'Encosta Norte', cultura: 'Milho Safrinha', area: 150, status: 'Desenvolvimento', progresso: 30, rendimento: 0 },
  { id: 'T04', nome: 'Área Nova', cultura: 'Soja', area: 200, status: 'Aguardando Colheita', progresso: 0, rendimento: 0 },
  { id: 'T05', nome: 'Baixada', cultura: 'Milho', area: 90, status: 'Plantio', progresso: 100, rendimento: 0 },
];

export const MOCK_TASKS = [
  { id: 1, title: 'Aplicação de Fungicida', local: 'Talhão da Sede', prioridade: 'Alta', status: 'todo', data: '25/10', responsavel: 'Carlos' },
  { id: 2, title: 'Manutenção Plantadeira', local: 'Oficina', prioridade: 'Média', status: 'in_progress', data: '24/10', responsavel: 'Roberto' },
  { id: 3, title: 'Abastecimento Tanques', local: 'Sede', prioridade: 'Baixa', status: 'todo', data: '26/10', responsavel: 'José' },
  { id: 4, title: 'Colheita Experimental', local: 'Talhão do Rio', prioridade: 'Alta', status: 'done', data: '20/10', responsavel: 'Equipe A' },
  { id: 5, title: 'Monitoramento de Pragas', local: 'Encosta Norte', prioridade: 'Média', status: 'in_progress', data: 'Hoje', responsavel: 'Ana' },
  { id: 6, title: 'Compra de Diesel', local: 'Escritório', prioridade: 'Alta', status: 'todo', data: '27/10', responsavel: 'Adm' },
];
