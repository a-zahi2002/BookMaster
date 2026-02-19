import React, { useState, useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';
import { useCart } from '../contexts/CartContext';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

const POSView = () => {
  const { books } = useBooks(); // Fallback source
  const { cart, addToCart, updateCartItem, removeFromCart, clearCart, processCheckout } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [posBooks, setPosBooks] = useState([]);

  // Fetch specialized POS inventory (batches) or fallback to basic books
  useEffect(() => {
    const fetchMethods = async () => {
      if (window.electronAPI && window.electronAPI.getPosInventory) {
        try {
          const inventory = await window.electronAPI.getPosInventory();
          setPosBooks(inventory);
        } catch (error) {
          console.error("Failed to load POS inventory", error);
          mapBooksToPos();
        }
      } else {
        mapBooksToPos();
      }
    };

    const mapBooksToPos = () => {
      // Fallback: Use basic book list (one price per book)
      setPosBooks(books.map(b => ({
        id: `${b.id}-${b.price}`,
        bookId: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        price: b.price,
        stock_quantity: b.stock_quantity,
        category: b.category
      })));
    };

    fetchMethods();

    // Refresh interval or event listener could be added here for real-time updates
    // For now, relies on re-render or manual triggers
  }, [books]);

  const filteredBooks = posBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      await processCheckout();
      alert('Sale completed successfully!');
      // Refresh inventory after sale
      if (window.electronAPI && window.electronAPI.getPosInventory) {
        const inventory = await window.electronAPI.getPosInventory();
        setPosBooks(inventory);
      }
    } catch (error) {
      alert('Checkout failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Products Section */}
      <div className="flex-1 flex flex-col p-6 min-w-0">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Point of Sale</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full max-w-md"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="card hover:shadow-md transition-shadow">
                <div className="card-content p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      LKR {book.price.toLocaleString()}
                    </span>
                    <span className={`text-sm ${book.stock_quantity === 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      Stock: {book.stock_quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(book.bookId, 1, book.price, book.stock_quantity)}
                    disabled={book.stock_quantity === 0}
                    className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {book.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cart ({cart.length})</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={`${item.bookId}-${item.price}`} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600">{item.author}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">@ LKR {item.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.bookId, item.price)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItem(item.bookId, item.quantity - 1, item.price)}
                        className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.bookId, item.quantity + 1, item.price)}
                        className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                LKR {cartTotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Checkout'}
              </button>

              <button
                onClick={clearCart}
                className="btn-secondary w-full"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSView;