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

    const addToCart = (bookId, quantity = 1, specificPrice = null, specificStock = null) => {
        const book = books.find(b => b.id === bookId);
        if (!book) return; // Book not found

        const price = specificPrice !== null ? specificPrice : book.price;
        const maxStock = specificStock !== null ? specificStock : book.stock_quantity;

        // Check stock for new quantity
        if (maxStock < quantity) {
            alert(`Insufficient stock. Only ${maxStock} available.`);
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.bookId === bookId && item.price === price);

        if (existingItemIndex > -1) {
            const existingItem = cart[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity <= maxStock) {
                const newCart = [...cart];
                newCart[existingItemIndex] = { ...existingItem, quantity: newQuantity };
                setCart(newCart);
            } else {
                alert(`Cannot add more. Stock limit of ${maxStock} reached.`);
            }
        } else {
            setCart(prev => [...prev, {
                bookId: book.id,
                title: book.title,
                author: book.author,
                price: price,
                quantity: quantity,
                maxStock: maxStock
            }]);
        }
    };

    const updateCartItem = (bookId, quantity, price) => {
        if (quantity <= 0) {
            removeFromCart(bookId, price);
            return;
        }

        const cartItem = cart.find(item => item.bookId === bookId && item.price === price);
        if (!cartItem) return;

        if (quantity <= cartItem.maxStock) {
            setCart(prev => prev.map(item =>
                (item.bookId === bookId && item.price === price)
                    ? { ...item, quantity }
                    : item
            ));
        } else {
            alert(`Cannot set quantity to ${quantity}. Only ${cartItem.maxStock} in stock.`);
        }
    };

    const removeFromCart = (bookId, price) => {
        setCart(prev => prev.filter(item => !(item.bookId === bookId && item.price === price)));
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
