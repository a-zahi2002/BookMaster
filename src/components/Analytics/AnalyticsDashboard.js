import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import SalesChart from './SalesChart';
import RevenueChart from './RevenueChart';
import TopProductsChart from './TopProductsChart';
import InventoryChart from './InventoryChart';
import MetricsCard from './MetricsCard';

const AnalyticsDashboard = () => {
  const { books } = useData();
  const [timeRange, setTimeRange] = useState('7d');
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    generateMockData();
  }, [books, timeRange]);

  const generateMockData = () => {
    // Generate mock sales data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const mockSalesData = [];
    const mockRevenueData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      const sales = Math.floor(Math.random() * 50000) + 10000;
      mockSalesData.push({
        date: dateStr,
        sales: sales
      });
    }

    // Generate revenue data by period
    const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    periods.forEach(period => {
      const revenue = Math.floor(Math.random() * 200000) + 50000;
      const profit = Math.floor(revenue * 0.3);
      mockRevenueData.push({
        period,
        revenue,
        profit
      });
    });

    // Generate top products data
    const mockTopProducts = books.slice(0, 5).map((book, index) => ({
      name: book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title,
      value: Math.floor(Math.random() * 100) + 20 - (index * 5)
    }));

    // Generate inventory data
    const mockInventoryData = books.slice(0, 10).map(book => ({
      title: book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title,
      stock: book.stock_quantity
    }));

    // Calculate metrics
    const totalSales = mockSalesData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = mockRevenueData.reduce((sum, item) => sum + item.profit, 0);
    const lowStockItems = books.filter(book => book.stock_quantity < 10).length;

    setSalesData(mockSalesData);
    setRevenueData(mockRevenueData);
    setTopProducts(mockTopProducts);
    setInventoryData(mockInventoryData);
    setMetrics({
      totalSales,
      totalRevenue,
      totalProfit,
      lowStockItems,
      totalBooks: books.length,
      averageOrderValue: totalSales / mockSalesData.length
    });
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Sales"
          value={`LKR ${metrics.totalSales?.toLocaleString() || '0'}`}
          change={12.5}
          icon="💰"
          color="green"
        />
        <MetricsCard
          title="Total Revenue"
          value={`LKR ${metrics.totalRevenue?.toLocaleString() || '0'}`}
          change={8.2}
          icon="📈"
          color="blue"
        />
        <MetricsCard
          title="Total Profit"
          value={`LKR ${metrics.totalProfit?.toLocaleString() || '0'}`}
          change={15.3}
          icon="💎"
          color="purple"
        />
        <MetricsCard
          title="Low Stock Items"
          value={metrics.lowStockItems || 0}
          change={-5.1}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} title={`Sales Trend (${timeRange})`} />
        <RevenueChart data={revenueData} title="Revenue vs Profit" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart data={topProducts} title="Top Selling Books" />
        <InventoryChart data={inventoryData} title="Current Stock Levels" />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold">LKR {metrics.averageOrderValue?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Books</span>
              <span className="font-semibold">{metrics.totalBooks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">3.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">In Stock</span>
              <span className="font-semibold text-green-600">
                {books.filter(book => book.stock_quantity > 10).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-semibold text-yellow-600">
                {books.filter(book => book.stock_quantity <= 10 && book.stock_quantity > 0).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-semibold text-red-600">
                {books.filter(book => book.stock_quantity === 0).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Export Sales Report
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Generate Invoice
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Inventory Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;