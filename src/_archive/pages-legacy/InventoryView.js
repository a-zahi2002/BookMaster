import React, { useState } from 'react';
import { useBooks } from '../contexts/BookContext';
import { Plus, Search, Edit, Trash2, Package, PackagePlus } from 'lucide-react';
import RegisterBookModal from '../components/modals/RegisterBookModal';
import RestockModal from '../components/modals/RestockModal';
import EditBookModal from '../components/modals/EditBookModal';

const InventoryView = () => {
  /* State */
  const { books, deleteBook } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register', 'update', 'edit'
  const [editingBook, setEditingBook] = useState(null);

  /* Filtered books logic */
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  /* Handlers */
  const handleRegisterNewBook = () => {
    setEditingBook(null);
    setModalMode('register');
    setShowModal(true);
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleUpdateStock = (book) => {
    setEditingBook(book);
    setModalMode('update');
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
    setModalMode('register');
  };

  const lowStockBooks = books.filter(book => book.stock_quantity < 10);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => handleUpdateStock(null)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center shadow-sm"
            >
              <PackagePlus className="h-4 w-4 mr-2 text-blue-600" />
              Update Stock
            </button>
            <button
              onClick={handleRegisterNewBook}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register New Book
            </button>
          </div>
        </div>

        {/* ... stats ... */}
        {/* ... search ... */}

        {/* I'll skip re-writing stats/search unless necessary, focusing on Table Actions and Modal call */}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          {/* ... other cards (Total Stock, Low Stock) ... */}
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
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full max-w-md"
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.isbn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {book.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${book.stock_quantity < 10 ? 'bg-red-100 text-red-800' :
                      book.stock_quantity < 20 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {book.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Update Stock Button */}
                      <button onClick={() => handleUpdateStock(book)} className="text-green-600 hover:text-green-900" title="Update Stock">
                        <Plus className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(book)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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

      {showModal && modalMode === 'register' && (
        <RegisterBookModal
          onClose={handleModalClose}
        />
      )}
      {showModal && modalMode === 'update' && (
        <RestockModal
          book={editingBook}
          onClose={handleModalClose}
        />
      )}
      {showModal && modalMode === 'edit' && (
        <EditBookModal
          book={editingBook}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default InventoryView;