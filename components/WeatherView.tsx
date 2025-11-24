
import React, { useEffect, useMemo } from 'react';
import { MOCK_FULL_WEATHER_DATA } from '../constants';
import { PropertyData } from '../types';

interface WeatherViewProps {
    property?: PropertyData;
}

const WeatherView: React.FC<WeatherViewProps> = ({ property }) => {
    
    // Forçar carregamento dos ícones Lucide
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    const data = MOCK_FULL_WEATHER_DATA;
    const current = data.current;

    // Lógica do Semáforo de Pulverização
    const sprayingStatus = useMemo(() => {
        const temp = current.temp;
        const wind = current.windSpeed;
        const humidity = current.humidity;

        // Regras Gerais de Agronomia para Pulverização
        // Ideal: Vento 3-10 km/h, Temp < 30°C, Umidade > 55%
        
        let status = 'recommended'; // recommended, warning, prohibited
        let message = 'Condições ideais para aplicação.';
        let color = 'bg-green-500';
        let icon = 'check-circle';

        if (wind > 15) {
            status = 'prohibited';
            message = 'ALERTA: Vento muito forte. Risco severo de deriva.';
            color = 'bg-red-500';
            icon = 'alert-octagon';
        } else if (wind < 3) {
            status = 'warning';
            message = 'Cuidado: Vento muito calmo. Risco de inversão térmica.';
            color = 'bg-yellow-500';
            icon = 'alert-triangle';
        } else if (temp > 32) {
            status = 'warning';
            message = 'Temperatura elevada. Alta taxa de evaporação.';
            color = 'bg-yellow-500';
            icon = 'thermometer-sun';
        } else if (humidity < 50) {
            status = 'warning';
            message = 'Umidade relativa baixa. Evaporação rápida da gota.';
            color = 'bg-yellow-500';
            icon = 'droplets';
        } else if (current.condition.toLowerCase().includes('chuva') || current.condition.toLowerCase().includes('lightning')) {
             status = 'prohibited';
             message = 'Chuva ou tempestade em andamento.';
             color = 'bg-red-500';
             icon = 'cloud-lightning';
        }

        return { status, message, color, icon };
    }, [current]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="cloud-sun" className="w-6 h-6 text-blue-500"></i>
                        Central Meteorológica
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Monitoramento local para {property?.nome || 'Fazenda Santa Inês'} - {property?.cidade}/{property?.estado}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Atualizado: 12:45</p>
                </div>
            </div>

            {/* Main Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Current Weather Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-white opacity-10"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-medium opacity-90">{current.condition}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-4 my-2">
                                <i data-lucide={current.icon} className="w-20 h-20"></i>
                                <span className="text-7xl font-bold">{current.temp}°</span>
                            </div>
                            <p className="text-sm opacity-90">{current.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-6 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <i data-lucide="droplets" className="w-5 h-5 text-blue-200"></i>
                                <div>
                                    <p className="text-xs opacity-70">Umidade</p>
                                    <p className="font-semibold">{current.humidity}%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <i data-lucide="wind" className="w-5 h-5 text-blue-200"></i>
                                <div>
                                    <p className="text-xs opacity-70">Vento</p>
                                    <p className="font-semibold">{current.windSpeed} km/h <span className="text-xs font-normal">{current.windDirection}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <i data-lucide="thermometer" className="w-5 h-5 text-blue-200"></i>
                                <div>
                                    <p className="text-xs opacity-70">Sensação</p>
                                    <p className="font-semibold">{current.feelsLike}°</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <i data-lucide="sprout" className="w-5 h-5 text-blue-200"></i>
                                <div>
                                    <p className="text-xs opacity-70">Solo (Umidade)</p>
                                    <p className="font-semibold">{current.soilMoisture}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spraying Status Card (Traffic Light) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col justify-between border border-gray-100 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                            <i data-lucide="spray-can" className="w-5 h-5 text-gray-500"></i>
                            Condições de Pulverização
                        </h3>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg ${sprayingStatus.color}`}>
                                <i data-lucide={sprayingStatus.icon} className="w-8 h-8"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {sprayingStatus.status === 'recommended' ? 'LIBERADO' : 
                                     sprayingStatus.status === 'warning' ? 'ATENÇÃO' : 'NÃO RECOMENDADO'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                                    {sprayingStatus.message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="text-gray-600 dark:text-gray-400">Delta T (Estimado)</span>
                            <span className="font-bold text-gray-800 dark:text-white">4.5°C</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="text-gray-600 dark:text-gray-400">Risco de Chuva (1h)</span>
                            <span className="font-bold text-gray-800 dark:text-white">10%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <i data-lucide="clock" className="w-4 h-4 text-gray-500"></i> Previsão Horária
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {data.hourly.map((hour, idx) => (
                        <div key={idx} className="flex flex-col items-center min-w-[80px] p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{hour.time}</span>
                            <i data-lucide={hour.icon} className="w-8 h-8 my-3 text-blue-500"></i>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{hour.temp}°</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-500 font-medium">
                                <i data-lucide="umbrella" className="w-3 h-3"></i> {hour.rainProb}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7 Day Forecast */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <i data-lucide="calendar-days" className="w-4 h-4 text-gray-500"></i> Próximos 7 Dias
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.daily.map((day, idx) => (
                        <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 px-2 rounded transition-colors">
                            <div className="w-24">
                                <p className="font-medium text-gray-900 dark:text-white">{day.date}</p>
                            </div>
                            
                            <div className="flex items-center gap-3 w-32">
                                <i data-lucide={day.icon} className="w-6 h-6 text-yellow-500"></i>
                                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{day.condition}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end w-20">
                                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                        <i data-lucide="cloud-rain" className="w-3 h-3 mr-1"></i>
                                        {day.rainProb}%
                                    </div>
                                    {day.rainMm > 0 && <span className="text-xs text-gray-400 mt-0.5">{day.rainMm}mm</span>}
                                </div>

                                <div className="flex items-center gap-4 w-32 justify-end">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">{day.min}°</span>
                                    
                                    {/* Visual Temperature Bar */}
                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                                        <div 
                                            className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-red-400 opacity-70"
                                            style={{ 
                                                left: '10%', 
                                                right: '10%' 
                                            }}
                                        ></div>
                                    </div>

                                    <span className="text-gray-900 dark:text-white font-bold">{day.max}°</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default WeatherView;
