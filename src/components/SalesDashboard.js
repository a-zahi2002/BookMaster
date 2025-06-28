import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import POSView from './POSView';
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
        return <POSView />;

      case 'books':
        return (
          <div className="p-6">
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
          </div>
        );

      case 'sales':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Dashboard</h3>
              <p className="text-gray-600">Sales analytics will be implemented here.</p>
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

        <div className="flex-1 overflow-y-auto">
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