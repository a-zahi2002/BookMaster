import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign,
  Package,
  Clock,
  User,
  Receipt,
  Calculator,
  Scan
} from 'lucide-react';

const CashierDashboard = () => {
  const { user, logout } = useAuth();
  const { books, cart, addToCart, updateCartItem, removeFromCart, clearCart, processCheckout } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [todayStats, setTodayStats] = useState({
    totalSales: 0,
    transactionCount: 0,
    averageTransaction: 0
  });

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm) ||
    book.publisher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const change = cashReceived ? parseFloat(cashReceived) - cartTotal : 0;

  useEffect(() => {
    // Load today's stats and recent sales
    loadTodayStats();
    loadRecentSales();
  }, []);

  const loadTodayStats = () => {
    // Mock data - in real app, this would come from the database
    setTodayStats({
      totalSales: 45230,
      transactionCount: 23,
      averageTransaction: 1966
    });
  };

  const loadRecentSales = () => {
    // Mock data - in real app, this would come from the database
    setRecentSales([
      { id: 1, time: '14:30', items: 2, total: 2850, method: 'Cash' },
      { id: 2, time: '14:15', items: 1, total: 1500, method: 'Card' },
      { id: 3, time: '13:45', items: 3, total: 4200, method: 'Cash' }
    ]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (paymentMethod === 'cash' && parseFloat(cashReceived) < cartTotal) {
      alert('Insufficient cash amount');
      return;
    }

    setIsProcessing(true);
    try {
      await processCheckout(paymentMethod);
      
      // Add to recent sales
      const newSale = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        items: cartItemCount,
        total: cartTotal,
        method: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'Mobile'
      };
      setRecentSales(prev => [newSale, ...prev.slice(0, 4)]);
      
      // Update today's stats
      setTodayStats(prev => ({
        totalSales: prev.totalSales + cartTotal,
        transactionCount: prev.transactionCount + 1,
        averageTransaction: Math.round((prev.totalSales + cartTotal) / (prev.transactionCount + 1))
      }));

      setShowPaymentModal(false);
      setCashReceived('');
      setPaymentMethod('cash');
      
      alert('Sale completed successfully!');
    } catch (error) {
      alert('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAddToCart = (book) => {
    addToCart(book.id);
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">BookMaster POS</h1>
              <p className="text-sm text-blue-100">Cashier Terminal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Sales</span>
              <span className="text-sm font-semibold text-green-600">
                LKR {todayStats.totalSales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Transactions</span>
              <span className="text-sm font-semibold text-blue-600">
                {todayStats.transactionCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Avg. Transaction</span>
              <span className="text-sm font-semibold text-purple-600">
                LKR {todayStats.averageTransaction.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="p-4 border-b border-gray-200 flex-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Sales</h3>
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">{sale.time}</span>
                  <span className="text-xs font-medium text-gray-700">{sale.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{sale.items} items</span>
                  <span className="text-sm font-semibold text-gray-900">
                    LKR {sale.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="text-sm font-medium">End Session</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col p-6 min-w-0">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{books.length} products available</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, ISBN, or publisher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Scan className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-gray-600 mb-1">by {book.author}</p>
                      <p className="text-xs text-gray-500">{book.publisher}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-blue-600">
                        LKR {book.price.toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        book.stock_quantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : book.stock_quantity > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.stock_quantity > 0 ? `${book.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => quickAddToCart(book)}
                      disabled={book.stock_quantity === 0}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        book.stock_quantity === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>{book.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {cartItemCount}
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Cart is empty</p>
                <p className="text-sm">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.bookId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-gray-600 truncate">{item.author}</p>
                        <p className="text-xs text-blue-600 font-medium">LKR {item.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.bookId)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItem(item.bookId, item.quantity - 1)}
                          className="h-7 w-7 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.bookId, item.quantity + 1)}
                          className="h-7 w-7 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">LKR {cartTotal.toLocaleString()}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>{isProcessing ? 'Processing...' : 'Checkout'}</span>
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Items ({cartItemCount})</span>
                <span className="text-sm font-medium">LKR {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">LKR {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'Cash', icon: DollarSign },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'mobile', label: 'Mobile', icon: Calculator }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-1" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash Received
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Enter amount received"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  step="0.01"
                  min={cartTotal}
                />
                {cashReceived && change >= 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-sm text-green-800">
                      Change: <span className="font-semibold">LKR {change.toLocaleString()}</span>
                    </span>
                  </div>
                )}
                {cashReceived && change < 0 && (
                  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    <span className="text-sm text-red-800">
                      Insufficient amount
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={isProcessing || (paymentMethod === 'cash' && (!cashReceived || change < 0))}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;