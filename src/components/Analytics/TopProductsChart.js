import React from 'react';

const TopProductsChart = ({ data, title = "Top Selling Products" }) => {
  const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2'];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-transparent dark:border-slate-800 p-6 transition-colors">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="h-80 flex items-center justify-center">
        <div className="w-64 h-64 relative">
          {/* Simple pie chart representation */}
          <div className="w-full h-full rounded-full border-8 border-gray-200 dark:border-slate-800 relative overflow-hidden transition-colors">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${COLORS[index % COLORS.length]} ${percentage}%, transparent ${percentage}%)`,
                    transform: `rotate(${data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0)}deg)`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-600 dark:text-slate-400">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">{item.value} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsChart;