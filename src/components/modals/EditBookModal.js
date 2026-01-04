import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { X, Edit } from 'lucide-react';

const EditBookModal = ({ book, onClose }) => {
    const { updateBookDetails } = useBooks();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: book?.title || '',
        author: book?.author || '',
        isbn: book?.isbn || '',
        publisher: book?.publisher || '',
        category: book?.category || ''
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
            await updateBookDetails({
                id: book.id,
                ...formData
            });
            onClose();
        } catch (error) {
            console.error('Error updating book:', error);
            alert(error.message || 'Failed to update book.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Edit Book Details</h3>
                        <p className="text-sm text-gray-500">Update catalogue information</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="input w-full" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                        <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="input w-full" />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-100">
                        Note: To update stock quantities or pricing, please use the "Restock" or "Adjustment" functions.
                    </div>

                    <div className="flex space-x-3 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookModal;
