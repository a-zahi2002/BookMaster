import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const InventoryChart = ({ data, title = "Inventory Status" }) => {
  const getBarColor = (stock) => {
    if (stock < 5) return '#dc2626'; // Red for low stock
    if (stock < 20) return '#ca8a04'; // Yellow for medium stock
    return '#16a34a'; // Green for good stock
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              type="category" 
              dataKey="title" 
              tick={{ fontSize: 10 }}
              width={120}
            />
            <Tooltip 
              formatter={(value) => [value, 'Stock']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.stock)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryChart;