import React from 'react';

const SalesChart = ({ data, title = "Sales Overview" }) => {
  // Simple chart implementation without recharts dependency
  const maxValue = Math.max(...data.map(item => item.sales));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t"
              style={{ 
                height: `${(item.sales / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-600 mt-2 text-center">
              <div>{item.date}</div>
              <div className="font-semibold">LKR {item.sales.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;