import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const RevenueChart = ({ data, title = "Revenue Analysis" }) => {
  const formatCurrency = (value) => `LKR ${value.toLocaleString()}`;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value), name]}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#16a34a" 
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="profit" 
              fill="#2563eb" 
              name="Profit"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;