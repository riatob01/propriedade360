import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';

interface FinancialChartProps {
    transactions?: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions = [] }) => {
    const formatYAxis = (tickItem: number) => `R$${(tickItem / 1000)}k`;

    // Process transactions into monthly data
    const monthlyData = useMemo(() => {
        const last6Months = [];
        const today = new Date();
        
        // Generate last 6 month keys (e.g., 'Ago', 'Set', 'Out')
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('pt-BR', { month: 'short' });
            // Capitalize first letter
            const name = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            
            last6Months.push({
                name,
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                receita: 0,
                despesa: 0
            });
        }

        // Aggregate data
        transactions.forEach(t => {
            if (!t.data) return;

            const tDate = new Date(t.data);
            
            // Validate Date
            if (isNaN(tDate.getTime())) return;

            // Use UTC methods to avoid timezone shifts when dealing with YYYY-MM-DD strings
            const monthIndex = tDate.getUTCMonth();
            const year = tDate.getUTCFullYear();
            
            // Find matching month in our range
            const monthEntry = last6Months.find(m => 
                m.monthIndex === monthIndex && m.year === year
            );

            if (monthEntry) {
                if (t.tipo === 'entrada') {
                    monthEntry.receita += Number(t.valor);
                } else {
                    monthEntry.despesa += Number(t.valor);
                }
            }
        });

        return last6Months;
    }, [transactions]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2 h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex-shrink-0">Visão Financeira Semestral</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fill: '#9ca3af' }} />
                        <YAxis tickFormatter={formatYAxis} tick={{ fill: '#9ca3af' }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                                borderColor: '#4b5563',
                                borderRadius: '0.5rem'
                            }}
                            labelStyle={{ color: '#f9fafb' }}
                            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                        />
                        <Legend wrapperStyle={{paddingTop: '10px'}} />
                        <Bar dataKey="receita" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="despesa" fill="#ef4444" name="Despesa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FinancialChart;