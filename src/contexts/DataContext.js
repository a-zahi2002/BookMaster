import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { isElectron } = useAuth();
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);

  // Mock data for web version
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
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        const booksData = await ipcRenderer.invoke('get-inventory');
        setBooks(booksData);
        return booksData;
      } else {
        // Use mock data for web version
        setBooks(mockBooks);
        return mockBooks;
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      // Fallback to mock data
      setBooks(mockBooks);
      return mockBooks;
    }
  };

  const addBook = async (bookData) => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('add-book', bookData);
        if (result.success) {
          await getBooks(); // Refresh books list
        }
        return result;
      } else {
        // Simulate adding book for web version
        const newBook = {
          id: Date.now(),
          ...bookData
        };
        setBooks(prev => [...prev, newBook]);
        return { success: true, id: newBook.id };
      }
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const addToCart = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.stock_quantity > 0) {
      const existingItem = cart.find(item => item.bookId === bookId);
      if (existingItem) {
        setCart(prev => prev.map(item => 
          item.bookId === bookId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart(prev => [...prev, {
          bookId: book.id,
          title: book.title,
          price: book.price,
          quantity: 1
        }]);
      }
    }
  };

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item.bookId !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    books,
    cart,
    getBooks,
    addBook,
    addToCart,
    removeFromCart,
    clearCart
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};