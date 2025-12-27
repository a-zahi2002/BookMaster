import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Sidebar from '../common/Sidebar';
import EnhancedInventory from '../EnhancedInventory';
import UserManagement from '../UserManagement';
import BackupManagement from '../BackupManagement';
import AnalyticsDashboard from '../Analytics/AnalyticsDashboard';
import ReportsView from '../Analytics/ReportsView';
import AIInsightsPanel from '../AI/AIInsightsPanel';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { books, getBooks } = useData();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'System Overview', icon: '🏠' },
    { id: 'inventory', label: 'Inventory Management', icon: '📚' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'backup', label: 'Backup & Cloud', icon: '☁️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'ai', label: 'AI Insights', icon: '🧠' },
    { id: 'reports', label: 'Reports & Export', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inventory':
        return <EnhancedInventory />;

      case 'users':
        return <UserManagement />;

      case 'backup':
        return <BackupManagement />;

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'ai':
        return <AIInsightsPanel />;

      case 'reports':
        return <ReportsView onNavigate={setActiveSection} />;

      case 'home':
        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
              <p className="text-gray-500 mt-2">Monitor your store's performance and system health.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1 bg-green-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Status</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">Operational</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="text-green-600 font-medium mr-2">✓ 100%</span>
                  Uptime today
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Database</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">Connected</h3>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-lg">💾</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="text-blue-600 font-medium mr-2">Synced</span>
                  Local SQLite DB
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1 bg-purple-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Backup</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">2h Ago</h3>
                  </div>
                  <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 text-lg">☁️</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="text-purple-600 font-medium mr-2">Next:</span>
                  Scheduled in 22h
                </p>
              </div>
            </div>

            {/* Detailed System Health */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">System Health Monitor</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">All Systems Normal</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mr-4 text-xl">
                      ⚡
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">Performance</h4>
                        <span className="text-green-600 font-bold">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mr-4 text-xl">
                      🛡️
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">Security</h4>
                        <span className="text-blue-600 font-bold">Protected</span>
                      </div>
                      <p className="text-xs text-gray-500">Firewall active, SSL enabled</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Active Services</h4>
                  {[
                    { name: 'Database Engine', status: 'Running', color: 'green' },
                    { name: 'Backup Service', status: 'Idle', color: 'blue' },
                    { name: 'Update Manager', status: 'Checking', color: 'yellow' },
                    { name: 'User Authentication', status: 'Active', color: 'green' }
                  ].map((service, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700 font-medium">{service.name}</span>
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full bg-${service.color}-500 mr-2`}></span>
                        <span className="text-sm text-gray-600">{service.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
              <p className="text-gray-500 mt-2">Configure your BookMaster POS preferences and system behavior</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Notifications & Alerts */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🔔</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Notifications & Alerts</h3>
                        <p className="text-sm text-gray-600">Manage how you receive system notifications</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Email Notifications', desc: 'Receive updates via email', checked: true },
                      { label: 'Low Stock Alerts', desc: 'Get notified when inventory is low', checked: true },
                      { label: 'Sales Reports', desc: 'Daily sales summary emails', checked: false },
                      { label: 'System Updates', desc: 'Notifications about new features', checked: true }
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{setting.label}</p>
                          <p className="text-sm text-gray-500">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automation Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">⚡</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Automation</h3>
                        <p className="text-sm text-gray-600">Automate routine tasks and processes</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Auto Backup', desc: 'Automatically backup database daily', checked: false },
                      { label: 'Auto Restock Alerts', desc: 'Suggest reorder when stock is low', checked: true },
                      { label: 'End of Day Reports', desc: 'Generate reports automatically at closing', checked: true }
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{setting.label}</p>
                          <p className="text-sm text-gray-500">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                {/* Data Management */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">💾</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Data Management</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <button className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">📦</span>
                        <span className="font-semibold">Backup Database</span>
                      </span>
                      <span className="text-sm opacity-75">→</span>
                    </button>
                    <button className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg">
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">📊</span>
                        <span className="font-semibold">Export All Data</span>
                      </span>
                      <span className="text-sm opacity-75">→</span>
                    </button>
                    <button className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-xl hover:from-orange-700 hover:to-amber-800 transition-all shadow-md hover:shadow-lg">
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">🔧</span>
                        <span className="font-semibold">System Maintenance</span>
                      </span>
                      <span className="text-sm opacity-75">→</span>
                    </button>
                  </div>
                </div>

                {/* System Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">System Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Version</span>
                      <span className="text-sm font-semibold text-gray-900">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="text-sm font-semibold text-gray-900">SQLite</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm font-semibold text-gray-900">Today</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl">⚠️</span>
                    <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">Danger Zone</h3>
                  </div>
                  <button className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-md hover:shadow-lg">
                    Reset All Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

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
        title="Admin Panel"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
              <span className="text-xl">🔔</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;