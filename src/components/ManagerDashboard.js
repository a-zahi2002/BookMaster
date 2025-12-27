import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import AddBookModal from './AddBookModal';
import AnalyticsDashboard from './Analytics/AnalyticsDashboard';
import ReportsView from './Analytics/ReportsView';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const { books, getBooks } = useData();
  const [activeSection, setActiveSection] = useState('home');
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'inventory', label: 'Inventory Management', icon: '📚' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Books */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Inventory</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{books.length}</h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <span className="text-green-600 font-medium mr-1">↑ 12%</span>
                  from last month
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {books.filter(book => book.stock_quantity < 10).length}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-yellow-600 font-medium">
                  Needs attention immediately
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inventory Value</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      LKR {books.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <span className="text-emerald-600 font-medium mr-1">Healthy</span>
                  asset distribution
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAddBookModal(true)}
                    className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-left"
                  >
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <span className="text-blue-600 text-lg">+</span>
                    </div>
                    <span className="font-semibold text-gray-900 block">Add New Book</span>
                    <span className="text-xs text-gray-500">Update inventory catalog</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group text-left"
                  >
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <span className="text-purple-600 text-lg">📊</span>
                    </div>
                    <span className="font-semibold text-gray-900 block">View Analytics</span>
                    <span className="text-xs text-gray-500">Check sales performance</span>
                  </button>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-600 font-medium">Today's Sales</span>
                    <span className="text-lg font-bold text-gray-900">LKR 32,450</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-600 font-medium">Weekly Revenue</span>
                    <span className="text-lg font-bold text-gray-900">LKR 156,780</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-600 font-medium">Monthly Growth</span>
                    <span className="text-lg font-bold text-green-600">+15.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'inventory':
        return (
          <div className="p-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Inventory Catalog</h3>
                  <p className="text-sm text-gray-500">Manage your book collection</p>
                </div>
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-medium flex items-center"
                >
                  <span className="mr-2">+</span> Add New Book
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                          <div className="text-xs text-gray-400">{book.isbn}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.author}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock_quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {book.stock_quantity} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">LKR {book.price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                          <button className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return <ReportsView />;

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        items={sidebarItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={logout}
        title="Manager Panel"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Manager Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {showAddBookModal && (
        <AddBookModal
          onClose={() => setShowAddBookModal(false)}
          onSuccess={() => {
            setShowAddBookModal(false);
            getBooks();
          }}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;