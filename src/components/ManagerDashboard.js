import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import AddBookModal from './AddBookModal';

const ManagerDashboard = () => {
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
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Books</p>
                  <p className="text-2xl font-semibold">{books.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {books.filter(book => book.stock_quantity < 10).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add New Book
                </button>
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
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.stock_quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">LKR {book.price.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
            <h3 className="text-lg font-semibold mb-4">Reports</h3>
            <p className="text-gray-600">Reports functionality will be implemented here.</p>
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
        title="Manager Panel"
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

export default ManagerDashboard;