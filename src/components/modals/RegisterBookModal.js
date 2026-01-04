import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { X, Save } from 'lucide-react';

const RegisterBookModal = ({ onClose }) => {
    const { registerBook } = useBooks();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: '',
        price: '',
        stock_quantity: '',
        costPrice: '',
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
            await registerBook({
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                costPrice: parseFloat(formData.costPrice || 0)
            });
            onClose();
        } catch (error) {
            console.error('Error registering book:', error);
            alert(error.message || 'Failed to register book.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Register New Book</h3>
                        <p className="text-sm text-gray-500">Add a new book to the inventory catalogue</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Metadata */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input w-full" placeholder="e.g. The Great Gatsby" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Author *</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} required className="input w-full" placeholder="e.g. F. Scott Fitzgerald" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="input w-full" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="input w-full" placeholder="e.g. Fiction" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                        <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="input w-full" />
                    </div>

                    {/* Initial Stock & Pricing */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">Initial Stock & Pricing</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Qty *</label>
                                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required min="0" className="input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (Optional)</label>
                                <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} min="0" step="0.01" className="input w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center">
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Registering...' : 'Register Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterBookModal;
