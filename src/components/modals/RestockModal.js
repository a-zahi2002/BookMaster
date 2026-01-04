import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { X, PackagePlus } from 'lucide-react';

const RestockModal = ({ book, onClose }) => {
    const { restockBook } = useBooks();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        quantity: '',
        costPrice: book?.price ? (book.price * 0.7).toFixed(2) : '',
        sellingPrice: book?.price || '',
        supplier: '',
        expiryDate: '',
        notes: ''
    });

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
            await restockBook({
                bookId: book.id,
                quantity: parseInt(formData.quantity),
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                supplier: formData.supplier,
                expiryDate: formData.expiryDate,
                notes: formData.notes
            });
            onClose();
        } catch (error) {
            console.error('Error restocking book:', error);
            alert(error.message || 'Failed to restock book.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Restock Inventory</h3>
                        <p className="text-sm text-gray-500">Add new batch for existing book</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Read-Only Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500 block">Book Title</span>
                                <span className="font-semibold text-gray-900">{book.title}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Author</span>
                                <span className="font-semibold text-gray-900">{book.author}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Current Stock</span>
                                <span className="font-semibold text-gray-900">{book.stock_quantity} units</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Current Price</span>
                                <span className="font-semibold text-gray-900">LKR {book.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Add Quantity *</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="input w-full" placeholder="e.g. 50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                            <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="input w-full" placeholder="Supplier Name" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost Price</label>
                            <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" className="input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                            <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required step="0.01" className="input w-full" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Batch ID</label>
                        <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="input w-full" placeholder="Optional notes for this batch" />
                    </div>

                    <div className="flex space-x-3 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center">
                            <PackagePlus className="h-4 w-4 mr-2" />
                            {loading ? 'Updating...' : 'Confirm Restock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestockModal;
