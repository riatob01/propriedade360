
import React from 'react';
import { MOCK_WEATHER_DATA } from '../constants';

const WeatherWidget: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Previsão do Tempo</h3>
        <div className="space-y-4">
            {MOCK_WEATHER_DATA.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <i data-lucide={day.icon} className="w-6 h-6 text-yellow-500"></i>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{day.day}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{day.condition}</p>
                        </div>
                    </div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{day.temp}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default WeatherWidget;
