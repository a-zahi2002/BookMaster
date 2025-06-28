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
  const [activeSection, setActiveSection] = useState('home');
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'inventory', label: 'Inventory Management', icon: '📚' },
    { id: 'reports', label: 'Reports & Export', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Books</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-gray-800">{books.length}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Active inventory items</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Low Stock Items</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-red-600">
                    {books.filter(book => book.stock_quantity < 10).length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Require restocking</p>
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
                <h3 className="text-gray-500 text-sm font-medium">Today's Sales</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-blue-600">LKR 45,230</span>
                </div>
                <p className="text-sm text-green-600 mt-1">+12% from yesterday</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="text-blue-600 text-2xl mb-2">📚</div>
                  <div className="text-sm font-medium text-blue-900">Add New Book</div>
                </button>
                <button
                  onClick={() => setActiveSection('analytics')}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="text-green-600 text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-green-900">View Analytics</div>
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="text-purple-600 text-2xl mb-2">📋</div>
                  <div className="text-sm font-medium text-purple-900">Generate Report</div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">💰</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sale completed</p>
                      <p className="text-xs text-gray-500">The Great Gatsby - LKR 1,500</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">📚</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">New book added</p>
                      <p className="text-xs text-gray-500">1984 by George Orwell</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">15 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Low stock alert</p>
                      <p className="text-xs text-gray-500">To Kill a Mockingbird - 3 remaining</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'inventory':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Inventory Management</h3>
              <button
                onClick={() => setShowAddBookModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add New Book
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.stock_quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {book.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          book.stock_quantity > 20 ? 'bg-green-100 text-green-800' :
                          book.stock_quantity > 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {book.stock_quantity > 20 ? 'Good' : book.stock_quantity > 5 ? 'Low' : 'Critical'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'reports':
        return <ReportsView />;

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={logout}
        title="Admin Panel"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
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

        <div className="flex-1 overflow-auto p-6">
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