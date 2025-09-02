import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Package, History, DollarSign } from 'lucide-react';
import BookModal from './BookModal';

const EnhancedInventory = () => {
  const { user } = useAuth();
  const { books, deleteBook, updateBook } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [selectedBookHistory, setSelectedBookHistory] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockUpdateBook, setStockUpdateBook] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(id);
      } catch (error) {
        alert('Failed to delete book');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBook(null);
  };

  const handleStockUpdate = (book) => {
    setStockUpdateBook(book);
    setStockQuantity(book.stock_quantity.toString());
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const newQuantity = parseInt(stockQuantity);
      await updateBook(stockUpdateBook.id, {
        ...stockUpdateBook,
        stock_quantity: newQuantity
      });
      
      // Log stock change activity
      await window.electronAPI?.logActivity(
        user.id,
        'STOCK_UPDATE',
        `Updated stock for "${stockUpdateBook.title}" from ${stockUpdateBook.stock_quantity} to ${newQuantity}`
      );
      
      setShowStockModal(false);
      setStockUpdateBook(null);
      setStockQuantity('');
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  const handlePriceHistory = async (book) => {
    try {
      const history = await window.electronAPI?.getPriceHistory(book.id) || [];
      setSelectedBookHistory(history);
      setShowPriceHistory(true);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const lowStockBooks = books.filter(book => book.stock_quantity < 10);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Inventory Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-2xl font-bold text-gray-900">{books.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {books.reduce((sum, book) => sum + book.stock_quantity, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockBooks.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    LKR {books.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full max-w-md"
          />
        </div>

        {/* Low Stock Alert */}
        {lowStockBooks.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Low Stock Alert</h3>
            <p className="text-yellow-700 mb-3">
              {lowStockBooks.length} book(s) have low stock levels (less than 10 items).
            </p>
            <div className="space-y-2">
              {lowStockBooks.slice(0, 3).map(book => (
                <div key={book.id} className="flex justify-between items-center bg-yellow-100 p-2 rounded">
                  <span className="text-sm font-medium">{book.title}</span>
                  <span className="text-sm text-yellow-800">{book.stock_quantity} remaining</span>
                </div>
              ))}
              {lowStockBooks.length > 3 && (
                <p className="text-sm text-yellow-700">...and {lowStockBooks.length - 3} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Books Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">by {book.author}</div>
                      <div className="text-xs text-gray-400">{book.publisher}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.isbn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {book.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      book.stock_quantity < 5 ? 'text-red-600' : 
                      book.stock_quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {book.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {(book.price * book.stock_quantity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      book.stock_quantity < 5 
                        ? 'bg-red-100 text-red-800' 
                        : book.stock_quantity < 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {book.stock_quantity < 5 ? 'Critical' : book.stock_quantity < 10 ? 'Low' : 'Good'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Book"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStockUpdate(book)}
                        className="text-green-600 hover:text-green-900"
                        title="Update Stock"
                      >
                        <Package className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePriceHistory(book)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Price History"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      {showModal && (
        <BookModal
          book={editingBook}
          onClose={handleModalClose}
        />
      )}

      {/* Stock Update Modal */}
      {showStockModal && stockUpdateBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Update Stock</h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{stockUpdateBook.title}</h4>
              <p className="text-sm text-gray-600">by {stockUpdateBook.author}</p>
              <p className="text-sm text-gray-500">Current stock: {stockUpdateBook.stock_quantity}</p>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Stock Quantity
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  min="0"
                  required
                  className="input w-full"
                  placeholder="Enter new stock quantity"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Price History</h3>
              <button
                onClick={() => setShowPriceHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Old Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      New Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Changed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedBookHistory.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.old_price ? `LKR ${record.old_price.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {record.new_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.changed_by_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.change_reason || 'No reason provided'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInventory;