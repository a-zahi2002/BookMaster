import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookContext = createContext();

export const useBooks = () => {
    const context = useContext(BookContext);
    if (!context) {
        throw new Error('useBooks must be used within a BookProvider');
    }
    return context;
};

export const BookProvider = ({ children }) => {
    const { isElectron } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for fallback
    const mockBooks = [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            isbn: "978-0-7432-7356-5",
            price: 1500,
            stock_quantity: 25,
            publisher: "Scribner"
        },
        {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            isbn: "978-0-06-112008-4",
            price: 1200,
            stock_quantity: 18,
            publisher: "J.B. Lippincott & Co."
        },
        // ... we can reduce mock data for succinctness or keep it all
        {
            id: 3,
            title: "1984",
            author: "George Orwell",
            isbn: "978-0-452-28423-4",
            price: 1350,
            stock_quantity: 30,
            publisher: "Secker & Warburg"
        }
    ];

    const getBooks = async () => {
        try {
            setLoading(true);
            if (isElectron && window.electronAPI) {
                const booksData = await window.electronAPI.getInventory();
                setBooks(booksData);
                setLoading(false);
                return booksData;
            } else {
                setBooks(mockBooks);
                setLoading(false);
                return mockBooks;
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks(mockBooks);
            setLoading(false);
            return mockBooks;
        }
    };

    const registerBook = async (bookData) => {
        try {
            if (isElectron && window.electronAPI) {
                const result = await window.electronAPI.registerBook(bookData);
                if (result.success) await getBooks();
                return result;
            } else {
                // Mock behavior
                const newBook = { id: Date.now(), ...bookData };
                setBooks(prev => [...prev, newBook]);
                return { success: true, id: newBook.id };
            }
        } catch (error) {
            console.error('Error registering book:', error);
            throw error;
        }
    };

    const restockBook = async (stockData) => {
        try {
            if (isElectron && window.electronAPI) {
                const result = await window.electronAPI.restockBook(stockData);
                if (result.success) await getBooks();
                return result;
            }
            // Mock behavior
            return { success: true };
        } catch (error) {
            console.error('Error restocking book:', error);
            throw error;
        }
    };

    const updateBookDetails = async (updateData) => {
        try {
            if (isElectron && window.electronAPI) {
                const result = await window.electronAPI.updateBookDetails(updateData);
                if (result.success) await getBooks();
                return result;
            }
            // Mock
            setBooks(prev => prev.map(book => book.id === updateData.id ? { ...book, ...updateData } : book));
            return { success: true };
        } catch (error) {
            console.error('Error updating book details:', error);
            throw error;
        }
    };

    const deleteBook = async (id) => {
        try {
            if (isElectron && window.electronAPI) {
                const result = await window.electronAPI.deleteBook(id);
                if (result.success) {
                    await getBooks();
                }
                return result;
            } else {
                setBooks(prev => prev.filter(book => book.id !== id));
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    };

    // Initial load
    useEffect(() => {
        getBooks();
    }, [isElectron]);

    const value = {
        books,
        loading,
        getBooks,
        registerBook,
        restockBook,
        updateBookDetails,
        deleteBook
    };

    return (
        <BookContext.Provider value={value}>
            {children}
        </BookContext.Provider>
    );
};
