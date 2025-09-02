import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';

const ReportsView = () => {
  const { books } = useData();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const generateReport = () => {
    // Mock report generation
    alert(`Generating ${reportType} report for ${dateRange.start} to ${dateRange.end}`);
  };

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}`);
  };

  const mockSalesData = [
    { date: '2024-01-01', book: 'The Great Gatsby', quantity: 5, revenue: 7500 },
    { date: '2024-01-02', book: 'To Kill a Mockingbird', quantity: 3, revenue: 3600 },
    { date: '2024-01-03', book: '1984', quantity: 8, revenue: 10800 },
    { date: '2024-01-04', book: 'The Great Gatsby', quantity: 2, revenue: 3000 },
    { date: '2024-01-05', book: 'To Kill a Mockingbird', quantity: 6, revenue: 7200 }
  ];

  const mockInventoryReport = books.map(book => ({
    ...book,
    value: book.price * book.stock_quantity,
    status: book.stock_quantity < 5 ? 'Low' : book.stock_quantity < 20 ? 'Medium' : 'Good'
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
        
        {/* Report Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="profit">Profit Analysis</option>
              <option value="customer">Customer Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Export CSV
          </button>
        </div>

        {/* Report Content */}
        <div className="border-t pt-6">
          {reportType === 'sales' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockSalesData.map((sale, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.book}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {sale.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'inventory' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Inventory Report</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockInventoryReport.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.author}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stock_quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {item.value.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'Good' ? 'bg-green-100 text-green-800' :
                            item.status === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'profit' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700">Total Revenue</h4>
                  <p className="text-2xl font-bold text-green-600">LKR 450,000</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700">Total Cost</h4>
                  <p className="text-2xl font-bold text-red-600">LKR 315,000</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700">Net Profit</h4>
                  <p className="text-2xl font-bold text-blue-600">LKR 135,000</p>
                </div>
              </div>
            </div>
          )}

          {reportType === 'customer' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700">Total Customers</h4>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700">Repeat Customers</h4>
                  <p className="text-2xl font-bold text-green-600">423</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;