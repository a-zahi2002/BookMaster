import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import EnhancedInventory from './EnhancedInventory';
import UserManagement from './UserManagement';
import BackupManagement from './BackupManagement';
import AnalyticsDashboard from './Analytics/AnalyticsDashboard';
import ReportsView from './Analytics/ReportsView';

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

      case 'reports':
        return <ReportsView />;

      case 'home':
        return (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">System Status</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-green-600">Online</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">All systems operational</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Database</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-blue-600">Active</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Connected and synced</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Last Backup</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-purple-600">2h</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Ago - Scheduled</p>
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Database Connection</p>
                      <p className="text-xs text-gray-500">SQLite database operational</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">📊</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Analytics Engine</p>
                      <p className="text-xs text-gray-500">Processing inventory data</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 text-sm">💾</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Auto Backup</p>
                      <p className="text-xs text-gray-500">Next backup in 22 hours</p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">System Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">General Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Stock Alerts</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto Backup</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Data Management</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Backup Database
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      Export All Data
                    </button>
                    <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
                      System Maintenance
                    </button>
                  </div>
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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar
        items={sidebarItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={logout}
        title="Admin Panel"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
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

export default AdminDashboard;