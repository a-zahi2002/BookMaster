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
import BookMasterLogo from './BookMasterLogo';

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
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 text-white shadow-2xl flex flex-col z-20">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
              <BookMasterLogo size="default" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">POS Terminal</h1>
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Cashier Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 mx-4 mt-6 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-600">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">
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
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Today's Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center group">
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Total Sales</span>
              <span className="text-base font-bold text-emerald-400">
                LKR {todayStats.totalSales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Transactions</span>
              <span className="text-base font-bold text-blue-400">
                {todayStats.transactionCount}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-px my-2" />
            <div className="flex justify-between items-center group">
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Avg. Value</span>
              <span className="text-base font-bold text-indigo-400">
                LKR {todayStats.averageTransaction.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="p-6 border-b border-slate-800 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Sales</h3>
            <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">View All</span>
          </div>
          <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{sale.time}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] font-medium text-slate-300">{sale.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{sale.items} items</span>
                  <span className="text-sm font-bold text-white">
                    LKR {sale.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all duration-200 group"
          >
            <span className="text-sm font-medium">Close Terminal</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Catalog Section */}
        <div className="flex-1 flex flex-col p-8 min-w-0 bg-slate-50/50">
          {/* Header */}
          <div className="mb-8 flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product Catalog</h1>
                <p className="text-gray-500 mt-1">Select items to add to the current transaction</p>
              </div>
              <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600 border-r border-gray-200 pr-4">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{books.length}</span> <span className="text-gray-400">products</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search inventory by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 border-none rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:shadow-md transition-all text-lg placeholder-gray-400"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                  <Scan className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => book.stock_quantity > 0 && quickAddToCart(book)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 group relative overflow-hidden ${book.stock_quantity === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:border-blue-100 hover:-translate-y-1 cursor-pointer'
                    }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${book.stock_quantity > 10 ? 'bg-green-50 text-green-600' :
                          book.stock_quantity > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                          }`}>
                          {book.stock_quantity > 0 ? `${book.stock_quantity} in stock` : 'Sold Out'}
                        </span>
                        <span className="font-serif italic text-xs text-gray-400">Book</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase">Price</span>
                        <span className="text-xl font-bold text-gray-900">
                          <span className="text-sm text-gray-500 align-top mr-0.5">LKR</span>
                          {book.price.toLocaleString()}
                        </span>
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${book.stock_quantity > 0 ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                        <Plus className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10">
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
              </div>
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {cartItemCount} items
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
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${paymentMethod === id
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