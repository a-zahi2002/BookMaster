import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useBooks } from './BookContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isElectron, user } = useAuth();
    const { books, getBooks } = useBooks();
    const [cart, setCart] = useState([]);

    const addToCart = (bookId, quantity = 1) => {
        const book = books.find(b => b.id === bookId);
        if (!book) return; // Book not found

        // Check stock
        if (book.stock_quantity < quantity) {
            alert(`Insufficient stock. Only ${book.stock_quantity} available.`);
            return;
        }

        const existingItem = cart.find(item => item.bookId === bookId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity <= book.stock_quantity) {
                setCart(prev => prev.map(item =>
                    item.bookId === bookId
                        ? { ...item, quantity: newQuantity }
                        : item
                ));
            } else {
                alert(`Cannot add more. Stock limit of ${book.stock_quantity} reached.`);
            }
        } else {
            setCart(prev => [...prev, {
                bookId: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                quantity: quantity
            }]);
        }
    };

    const updateCartItem = (bookId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(bookId);
            return;
        }

        const book = books.find(b => b.id === bookId);
        if (!book) return;

        if (quantity <= book.stock_quantity) {
            setCart(prev => prev.map(item =>
                item.bookId === bookId
                    ? { ...item, quantity }
                    : item
            ));
        } else {
            alert(`Cannot set quantity to ${quantity}. Only ${book.stock_quantity} in stock.`);
        }
    };

    const removeFromCart = (bookId) => {
        setCart(prev => prev.filter(item => item.bookId !== bookId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const processCheckout = async (paymentMethod = 'cash', cashReceived = 0) => {
        try {
            if (cart.length === 0) throw new Error('Cart is empty');

            if (isElectron && window.electronAPI?.processSale) {
                // Prepare sale data
                const saleItems = cart.map(item => ({
                    bookId: item.bookId,
                    title: item.title,
                    author: item.author,
                    quantity: item.quantity,
                    price: item.price
                }));

                const result = await window.electronAPI.processSale({
                    items: saleItems,
                    paymentMethod,
                    cashReceived: parseFloat(cashReceived) || 0,
                    cashierId: user?.id || 1
                });

                if (result.success) {
                    clearCart();
                    await getBooks(); // Refresh inventory to reflect stock changes
                    return result;
                } else {
                    throw new Error(result.error || 'Checkout failed');
                }
            } else {
                // Fallback simulation for non-electron environment
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
                clearCart();
                return { success: true, total, paymentMethod, change: parseFloat(cashReceived) - total };
            }
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    };

    const value = {
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        processCheckout
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
