import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { X } from 'lucide-react';

const BookModal = ({ book, mode = 'create', onClose }) => {
  const { registerBook, updateBookDetails, restockBook } = useBooks();

  // Initial state logic
  const getInitialState = () => {
    if (mode === 'restock') {
      return {
        ...book, // keep book details for display
        quantity: '',
        costPrice: book?.price ? (book.price * 0.7) : '', // estimate cost
        sellingPrice: book?.price || '',
        supplier: '',
        expiryDate: '',
        notes: ''
      };
    }
    return {
      title: book?.title || '',
      author: book?.author || '',
      isbn: book?.isbn || '',
      price: book?.price || '',
      costPrice: '',
      stock_quantity: book?.stock_quantity || '',
      publisher: book?.publisher || '',
      category: book?.category || '',
      notes: ''
    };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        await registerBook({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          costPrice: parseFloat(formData.costPrice || 0)
        });
      } else if (mode === 'edit') {
        await updateBookDetails({
          id: book.id,
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          publisher: formData.publisher,
          category: formData.category
        });
      } else if (mode === 'restock') {
        await restockBook({
          bookId: book.id,
          quantity: parseInt(formData.quantity),
          costPrice: parseFloat(formData.costPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          supplier: formData.supplier,
          expiryDate: formData.expiryDate,
          notes: formData.notes
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'edit': return 'Edit Book Details';
      case 'restock': return 'Add Stock (Restock)';
      default: return 'Register New Book';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Read-Only Info for Restock */}
          {mode === 'restock' && (
            <div className="bg-gray-50 p-3 rounded text-sm mb-4">
              <p><strong>Book:</strong> {book.title}</p>
              <p><strong>Current Stock:</strong> {book.stock_quantity}</p>
            </div>
          )}

          {/* Metadata Fields (Create/Edit) */}
          {(mode === 'create' || mode === 'edit') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input type="text" name="author" value={formData.author} onChange={handleChange} required className="input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="input w-full" />
                </div>
              </div>
            </>
          )}

          {/* Initial Stock Fields (Create) */}
          {mode === 'create' && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Qty *</label>
                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required min="0" className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="input w-full" />
              </div>
            </div>
          )}

          {/* Restock Fields (Restock Only) */}
          {mode === 'restock' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Quantity *</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Selling Price *</label>
                  <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required step="0.01" className="input w-full" />
                  <p className="text-xs text-gray-500 mt-1">This will be the price for this batch.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="input w-full" placeholder="Batch notes..." />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : mode === 'create' ? 'Register Book' : mode === 'restock' ? 'Add Stock' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;