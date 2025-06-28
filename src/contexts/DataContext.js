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
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0-14-143951-8",
      price: 1100,
      stock_quantity: 22,
      publisher: "Penguin Classics"
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "978-0-316-76948-0",
      price: 1400,
      stock_quantity: 15,
      publisher: "Little, Brown and Company"
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
        setBooks(mockBooks);
        return mockBooks;
      }
    } catch (error) {
      console.error('Error fetching books:', error);
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
          await getBooks();
        }
        return result;
      } else {
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

  const updateBook = async (id, bookData) => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('update-book', id, bookData);
        if (result.success) {
          await getBooks();
        }
        return result;
      } else {
        setBooks(prev => prev.map(book => 
          book.id === id ? { ...book, ...bookData } : book
        ));
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (id) => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('delete-book', id);
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

  const addToCart = (bookId, quantity = 1) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.stock_quantity >= quantity) {
      const existingItem = cart.find(item => item.bookId === bookId);
      if (existingItem) {
        setCart(prev => prev.map(item => 
          item.bookId === bookId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart(prev => [...prev, {
          bookId: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          quantity: quantity
        }]);
      }
    }
  };

  const updateCartItem = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
    } else {
      setCart(prev => prev.map(item => 
        item.bookId === bookId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item.bookId !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const processCheckout = async (paymentMethod = 'cash') => {
    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stock quantities
      for (const item of cart) {
        const book = books.find(b => b.id === item.bookId);
        if (book) {
          await updateBook(item.bookId, {
            ...book,
            stock_quantity: book.stock_quantity - item.quantity
          });
        }
      }
      
      clearCart();
      return { success: true, total, paymentMethod };
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  const value = {
    books,
    cart,
    getBooks,
    addBook,
    updateBook,
    deleteBook,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    processCheckout
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};