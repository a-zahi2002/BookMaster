import React, { useState, useEffect } from 'react';
import { useBooks } from '../../contexts/BookContext';
import {
  FileText, TrendingUp, Package, Users, DollarSign, Calendar,
  Download, Printer, ChevronDown, CheckCircle, BarChart3,
  ArrowRight
} from 'lucide-react';

const ReportsView = ({ onNavigate }) => {
  const { books } = useBooks();
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const loadSalesData = async () => {
    try {
      const data = await window.electronAPI?.getDetailedSalesReport({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setSalesData(data || []);
    } catch (error) {
      console.error('Error loading sales report:', error);
    }
  };

  const handleExport = () => {
    if (salesData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Item', 'Category', 'Quantity', 'Total Amount', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...salesData.map(row => [
        `"${new Date(row.date).toLocaleDateString()}"`,
        `"${row.item.replace(/"/g, '""')}"`,
        `"${row.category || 'Uncategorized'}"`,
        row.qty,
        row.total,
        row.payment_method
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to delete ALL sales data? This cannot be undone.')) {
      try {
        const result = await window.electronAPI?.deleteAllSales();
        if (result?.success) {
          alert('Data cleared successfully');
          loadSalesData();
        } else {
          alert('Failed to clear data');
        }
      } catch (error) {
        console.error(error);
        alert('Error clearing data');
      }
    }
  };

  const mockInventory = books.map(book => ({
    ...book,
    value: book.price * book.stock_quantity,
    status: book.stock_quantity < 5 ? 'Critical' : book.stock_quantity < 10 ? 'Low' : 'Healthy'
  }));

  const tabs = [
    { id: 'sales', label: 'Sales Performance', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'inventory', label: 'Inventory Status', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'profit', label: 'Profit & Loss', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'customer', label: 'Customer Insights', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const StatCard = ({ label, value, subtext, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass.bg}`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} />
        </div>
      </div>
      {subtext && <p className="text-sm text-gray-600">{subtext}</p>}
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto p-2">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-indigo-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">Export detailed reports for your business records.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetData}
            className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
          >
            Reset Data
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${activeTab === tab.id
                ? 'bg-white shadow-md border border-gray-100 ring-1 ring-black/5'
                : 'hover:bg-white/50 hover:shadow-sm text-gray-600'
                }`}
            >
              <div className={`p-2 rounded-lg mr-3 ${tab.bg}`}>
                <tab.icon className={`w-5 h-5 ${tab.color}`} />
              </div>
              <div className="text-left">
                <span className={`block font-semibold ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                  {tab.label}
                </span>
                <span className="text-xs text-gray-400 block mt-0.5">View & Export</span>
              </div>
              {activeTab === tab.id && (
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
              )}
            </button>
          ))}

          <div className="p-4 bg-indigo-600 rounded-xl mt-6 text-white text-center shadow-lg shadow-indigo-200">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-indigo-200" />
            <h4 className="font-bold mb-1">Need specific insights?</h4>
            <p className="text-xs text-indigo-100 mb-3 opacity-90">Ask our AI Assistant for custom analysis.</p>
            <button
              onClick={() => onNavigate && onNavigate('ai')}
              className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-50 w-full transition-colors"
            >
              Open AI Chat
            </button>
          </div>
        </div>

        {/* Report Content Panel */}
        <div className="flex-1 space-y-6">

          {/* Sales View */}
          {activeTab === 'sales' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label="Total Sales"
                  value={`LKR ${salesData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}`}
                  subtext={`${new Set(salesData.map(s => s.transaction_id)).size} Transactions`}
                  icon={TrendingUp}
                  colorClass={{ text: 'text-green-600', bg: 'bg-green-50' }}
                />
                <StatCard
                  label="Items Sold"
                  value={salesData.reduce((acc, curr) => acc + curr.qty, 0)}
                  subtext="Total quantity"
                  icon={FileText}
                  colorClass={{ text: 'text-blue-600', bg: 'bg-blue-50' }}
                />
                <StatCard
                  label="Top Category"
                  value={(Object.entries(salesData.reduce((acc, curr) => {
                    acc[curr.category || 'Other'] = (acc[curr.category || 'Other'] || 0) + curr.total;
                    return acc;
                  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]) || 'N/A'}
                  subtext="By revenue"
                  icon={Package}
                  colorClass={{ text: 'text-purple-600', bg: 'bg-purple-50' }}
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Detailed Transaction Log</h3>
                  <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Item Details</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {salesData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No sales transactions found for this period.</td>
                      </tr>
                    ) : (
                      salesData.map((sale, idx) => (
                        <tr key={sale.transaction_id + '-' + idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-600">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{sale.item}</div>
                            <div className="text-xs text-gray-500">Qty: {sale.qty}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                              {sale.category || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            LKR {sale.total.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Inventory View */}
          {activeTab === 'inventory' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label="Total Stock Value"
                  value={`LKR ${mockInventory.reduce((a, b) => a + b.value, 0).toLocaleString()}`}
                  subtext={`${books.length} Unique Titles`}
                  icon={DollarSign}
                  colorClass={{ text: 'text-green-600', bg: 'bg-green-50' }}
                />
                <StatCard
                  label="Low Stock Items"
                  value={mockInventory.filter(i => i.status === 'Low' || i.status === 'Critical').length}
                  subtext="Needs attention immediately"
                  icon={Package}
                  colorClass={{ text: 'text-red-600', bg: 'bg-red-50' }}
                />
                <StatCard
                  label="Inventory Health"
                  value="94%"
                  subtext="Stock availability rate"
                  icon={CheckCircle}
                  colorClass={{ text: 'text-blue-600', bg: 'bg-blue-50' }}
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Current Stock Levels</h3>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-md">Critical</span>
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-md">Low</span>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-md">Healthy</span>
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Book Title</th>
                      <th className="px-6 py-3">Author</th>
                      <th className="px-6 py-3">Stock Level</th>
                      <th className="px-6 py-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockInventory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.title}
                          <div className="text-xs text-gray-400 mt-0.5">{item.isbn}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.author}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${item.status === 'Critical' ? 'bg-red-500' :
                              item.status === 'Low' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></span>
                            <span className="font-semibold text-gray-700">{item.stock_quantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">LKR {item.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Placeholders for other tabs */}
          {(activeTab === 'profit' || activeTab === 'customer') && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Advanced {activeTab} analytics are currently being processed by our AI engine. Check back shortly.
              </p>
            </div>
          )}

        </div>
      </div>
    </div >
  );
};

export default ReportsView;