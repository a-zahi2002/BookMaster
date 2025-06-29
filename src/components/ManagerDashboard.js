import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import EnhancedInventory from './EnhancedInventory';
import AnalyticsDashboard from './Analytics/AnalyticsDashboard';
import ReportsView from './Analytics/ReportsView';
import BackupManagement from './BackupManagement';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const { books, getBooks } = useData();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard Overview', icon: '🏠' },
    { id: 'inventory', label: 'Inventory Management', icon: '📚' },
    { id: 'analytics', label: 'Analytics & Insights', icon: '📊' },
    { id: 'reports', label: 'Reports & Export', icon: '📋' },
    { id: 'backup', label: 'Backup Management', icon: '☁️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inventory':
        return <EnhancedInventory />;
      
      case 'analytics':
        return <AnalyticsDashboard />;

      case 'reports':
        return <ReportsView />;

      case 'backup':
        return <BackupManagement />;

      case 'home':
        return (
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
                  <p className="text-blue-100 mt-1">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Manager Dashboard</p>
                  <p className="text-xl font-semibold">BookMaster POS</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Books</p>
                    <p className="text-2xl font-bold text-gray-900">{books.length}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-medium">+12%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {books.reduce((sum, book) => sum + book.stock_quantity, 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-medium">+8%</span>
                    <span className="text-gray-500 ml-1">from last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {books.filter(book => book.stock_quantity < 10).length}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-600 font-medium">Needs attention</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      LKR {books.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-purple-600 font-medium">Total value</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-xl mr-2">⚡</span>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveSection('inventory')}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <div className="font-medium text-gray-900">Manage Inventory</div>
                    <div className="text-sm text-gray-600">Add, edit, or update books</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium text-gray-900">View Analytics</div>
                    <div className="text-sm text-gray-600">Sales and performance data</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('reports')}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-medium text-gray-900">Generate Reports</div>
                    <div className="text-sm text-gray-600">Export data and insights</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('backup')}
                    className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">☁️</div>
                    <div className="font-medium text-gray-900">Backup Data</div>
                    <div className="text-sm text-gray-600">Create and manage backups</div>
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-xl mr-2">🔧</span>
                  System Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Inventory System</p>
                        <p className="text-xs text-gray-500">All systems operational</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm">📊</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Analytics Engine</p>
                        <p className="text-xs text-gray-500">Processing data</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-yellow-600 text-sm">💾</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Backup System</p>
                        <p className="text-xs text-gray-500">Last backup: 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-600 font-medium">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-xl mr-2">📈</span>
                Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-600">Books Added This Month</div>
                  <div className="text-xs text-green-600 mt-1">+23% from last month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-gray-600">Inventory Accuracy</div>
                  <div className="text-xs text-green-600 mt-1">+5% improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">4.2</div>
                  <div className="text-sm text-gray-600">Avg. Stock Turnover</div>
                  <div className="text-xs text-blue-600 mt-1">Optimal range</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <span className="text-xl mr-2">⚙️</span>
                Manager Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <span className="text-lg mr-2">🔧</span>
                    Inventory Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Stock Alerts</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-reorder Notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Price Change Tracking</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <span className="text-lg mr-2">📊</span>
                    Reporting Preferences
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weekly Reports</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Analytics</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Export Notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-4 flex items-center">
                  <span className="text-lg mr-2">🎨</span>
                  Display Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency Display
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <option value="LKR">Sri Lankan Rupee (LKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar
        items={sidebarItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={logout}
        title="Manager Panel"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>System Online</span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;