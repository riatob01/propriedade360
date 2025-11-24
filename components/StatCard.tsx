
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
  const changeIcon = isIncrease ? <i data-lucide="arrow-up-right" className="w-4 h-4"></i> : <i data-lucide="arrow-down-right" className="w-4 h-4"></i>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="text-green-500">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        <div className={`flex items-center text-sm mt-1 ${changeColor}`}>
          {changeIcon}
          <span className="ml-1">{change}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">em relação ao mês passado</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
