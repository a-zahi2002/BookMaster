import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import AddBookModal from './AddBookModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { books, getBooks } = useData();
  const [activeSection, setActiveSection] = useState('home');
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'inventory', label: 'Inventory Management', icon: '📚' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Books</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-gray-800">{books.length}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Low Stock Items</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-red-600">
                    {books.filter(book => book.stock_quantity < 10).length}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
                <div className="flex items-center mt-2">
                  <span className="text-3xl font-bold text-green-600">
                    LKR {books.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.stock_quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {book.price.toFixed(2)}</td>
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
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Reports & Analytics</h3>
            <p className="text-gray-600">Reports functionality will be implemented here.</p>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <p className="text-gray-600">Settings functionality will be implemented here.</p>
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