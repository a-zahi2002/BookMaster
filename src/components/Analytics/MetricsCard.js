import React from 'react';

const MetricsCard = ({ title, value, change, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';
  const changeIcon = change >= 0 ? '↗' : '↘';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-transparent dark:border-slate-800 p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${changeColor} dark:text-opacity-90 flex items-center mt-1`}>
              <span className="mr-1">{changeIcon}</span>
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} dark:bg-opacity-20`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;