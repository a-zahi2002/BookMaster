import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import Cart from './Cart';

const SalesDashboard = () => {
  const { user, logout } = useAuth();
  const { books, cart, getBooks, addToCart } = useData();
  const [activeSection, setActiveSection] = useState('pos');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const sidebarItems = [
    { id: 'pos', label: 'Point of Sale', icon: '💰' },
    { id: 'books', label: 'View Books', icon: '📚' },
    { id: 'sales', label: 'Sales Dashboard', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Available Books</h3>
              <button
                onClick={() => setShowCart(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cart ({cart.length})
              </button>
            </div>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.filter(book => book.stock_quantity > 0).map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">LKR {book.price.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.stock_quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => addToCart(book.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'books':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">All Books</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
              {books.map((book) => (
                <div key={book.id} className="book-card">
                  <h3>{book.title}</h3>
                  <p>Author: {book.author}</p>
                  <p>Price: LKR {book.price.toLocaleString()}</p>
                  <p>Stock: {book.stock_quantity}</p>
                  <button
                    onClick={() => addToCart(book.id)}
                    disabled={book.stock_quantity === 0}
                  >
                    {book.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Dashboard</h3>
            <p className="text-gray-600">Sales analytics will be implemented here.</p>
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
        title="Sales Panel"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
          <button
            onClick={() => setShowCart(true)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cart ({cart.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>

      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}
    </div>
  );
};

export default SalesDashboard;