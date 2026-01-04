import React from 'react';

const RevenueChart = ({ data, title = "Revenue Analysis" }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.revenue, item.profit)));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-transparent dark:border-slate-800 p-6 transition-colors">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="h-80 flex items-end space-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex space-x-1">
              <div
                className="flex-1 bg-green-500 rounded-t"
                style={{
                  height: `${(item.revenue / maxValue) * 250}px`,
                  minHeight: '4px'
                }}
              />
              <div
                className="flex-1 bg-blue-500 rounded-t"
                style={{
                  height: `${(item.profit / maxValue) * 250}px`,
                  minHeight: '4px'
                }}
              />
            </div>
            <div className="text-xs text-gray-600 dark:text-slate-400 mt-2 text-center">
              <div>{item.period}</div>
              <div className="text-green-600 dark:text-green-400">R: {item.revenue.toLocaleString()}</div>
              <div className="text-blue-600 dark:text-blue-400">P: {item.profit.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-slate-400">Revenue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-slate-400">Profit</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;