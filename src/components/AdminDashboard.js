import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import AddBookModal from './AddBookModal';
import AnalyticsDashboard from './Analytics/AnalyticsDashboard';
import ReportsView from './Analytics/ReportsView';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { books, getBooks } = useData();
  const [activeSection, setActiveSection] = useState('inventory'); // Changed default to inventory
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'inventory', label: 'Inventory Management', icon: '📚' }, // Moved inventory to first position
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'reports', label: 'Reports & Export', icon: '📋' },
    { id: 'home', label: 'System Overview', icon: '🏠' }, // Renamed and moved to last
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inventory':
        return (
          <div className="space-y-6">
            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Books</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-blue-600">{books.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Items in inventory</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Low Stock Items</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-red-600">
                    {books.filter(book => book.stock_quantity < 10).length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Need restocking</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-green-600">
                    LKR {books.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Inventory worth</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Average Price</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-purple-600">
                    LKR {books.length > 0 ? Math.round(books.reduce((sum, book) => sum + book.price, 0) / books.length).toLocaleString() : '0'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Per book</p>
              </div>
            </div>

            {/* Quick Actions for Inventory */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="text-blue-600 text-2xl mb-2">➕</div>
                  <div className="text-sm font-medium text-blue-900">Add New Book</div>
                </button>
                <button
                  onClick={() => {/* Add bulk import functionality */}}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="text-green-600 text-2xl mb-2">📥</div>
                  <div className="text-sm font-medium text-green-900">Bulk Import</div>
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="text-purple-600 text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-purple-900">Export Report</div>
                </button>
                <button
                  onClick={() => {/* Add low stock filter */}}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="text-red-600 text-2xl mb-2">⚠️</div>
                  <div className="text-sm font-medium text-red-900">Low Stock Alert</div>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold">Book Inventory</h3>
                  <p className="text-sm text-gray-600">Manage your book collection</p>
                </div>
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add New Book
                </button>
              </div>
              <div className="overflow-auto" style={{ maxHeight: '500px' }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">by {book.author}</div>
                            <div className="text-xs text-gray-400">{book.publisher}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.isbn}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            book.stock_quantity < 5 ? 'text-red-600' : 
                            book.stock_quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {book.stock_quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {book.price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            book.stock_quantity > 20 ? 'bg-green-100 text-green-800' :
                            book.stock_quantity > 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {book.stock_quantity > 20 ? 'In Stock' : book.stock_quantity > 5 ? 'Low Stock' : 'Critical'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">Edit</button>
                            <button className="text-green-600 hover:text-green-900">Restock</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'reports':
        return <ReportsView />;

      case 'home':
        return (
          <div className="space-y-6">
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

        <div className="flex-1 overflow-y-auto p-6">
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

export default AdminDashboard;