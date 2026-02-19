import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BookContext';
import Sidebar from '../common/Sidebar';
import EnhancedInventory from '../EnhancedInventory';
import AddBookModal from '../modals/AddBookModal';
import AnalyticsDashboard from '../Analytics/AnalyticsDashboard';
import BackupManagement from '../BackupManagement';
import ReportsView from '../Analytics/ReportsView';
import AIInsightsPanel from '../AI/AIInsightsPanel';
import { Menu } from 'lucide-react';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const { books, getBooks } = useBooks();
  const [activeSection, setActiveSection] = useState('home');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'inventory', label: 'Inventory Management', icon: '📚' },
    { id: 'backup', label: 'Backup & Cloud', icon: '☁️' },
    { id: 'ai', label: 'AI Insights', icon: '🧠' },
    { id: 'reports', label: 'Reports & Exports', icon: '📋' }
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

      case 'backup':
        return <BackupManagement />;

      case 'ai':
        return <AIInsightsPanel />;

      case 'inventory':
        return <EnhancedInventory />;

      case 'reports':
        return <ReportsView onNavigate={setActiveSection} />;

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
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Manager Portal</p>
            </div>
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