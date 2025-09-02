import React from 'react';

const InventoryChart = ({ data, title = "Inventory Status" }) => {
  const maxStock = Math.max(...data.map(item => item.stock));
  
  const getBarColor = (stock) => {
    if (stock < 5) return '#dc2626'; // Red for low stock
    if (stock < 20) return '#ca8a04'; // Yellow for medium stock
    return '#16a34a'; // Green for good stock
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-xs text-gray-600 truncate">{item.title}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <div
                className="h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.stock / maxStock) * 100}%`,
                  backgroundColor: getBarColor(item.stock)
                }}
              />
            </div>
            <div className="w-12 text-xs text-gray-600 text-right">{item.stock}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryChart;