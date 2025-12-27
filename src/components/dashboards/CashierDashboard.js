import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
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
import BookMasterLogo from '../common/BookMasterLogo';

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
    (book.isbn && book.isbn.includes(searchTerm)) ||
    (book.publisher && book.publisher.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-300 group relative overflow-hidden flex flex-col ${book.stock_quantity === 0
                      ? 'opacity-60 cursor-not-allowed grayscale'
                      : 'hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-slate-50/50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${book.stock_quantity > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        book.stock_quantity > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                      {book.stock_quantity > 0 ? `${book.stock_quantity} left` : 'Out of Stock'}
                    </span>
                    {book.stock_quantity < 5 && book.stock_quantity > 0 && (
                      <span className="animate-pulse text-amber-500 font-bold text-xs" title="Low Stock">⚠️</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 font-medium">{book.author}</p>
                    <p className="text-xs text-gray-400 bg-gray-100/50 inline-block px-2 py-0.5 rounded border border-gray-100 truncate max-w-full">
                      ISBN: {book.isbn}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-5 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
                      <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                        <span className="text-xs font-medium text-gray-500 align-top mr-1 top-1 relative">LKR</span>
                        {book.price.toLocaleString()}
                      </span>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${book.stock_quantity > 0
                        ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-200'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      <Plus className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-20 relative">
          {/* Receipt Header Style */}
          <div className="p-6 border-b border-gray-100 bg-gray-50 pattern-bg-dots">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
              </div>
              <span className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                #{Math.floor(Date.now() / 1000).toString().slice(-6)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-500 font-mono bg-white p-2 rounded border border-gray-100">
              <span>{new Date().toLocaleDateString()}</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 bg-white relative">
            {/* Subtle receipt line pattern */}
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-500">Cart Empty</p>
                <p className="text-sm">Scan items or select from catalog</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.bookId} className="group flex flex-col p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all shadow-sm hover:shadow-md bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{item.author}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.bookId)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartItem(item.bookId, item.quantity - 1)}
                          className="h-6 w-6 rounded-md bg-white text-gray-600 shadow-sm flex items-center justify-center hover:text-indigo-600 transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-8 text-center tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.bookId, item.quantity + 1)}
                          className="h-6 w-6 rounded-md bg-white text-gray-600 shadow-sm flex items-center justify-center hover:text-indigo-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">
                          {item.quantity} x {item.price.toLocaleString()}
                        </p>
                        <p className="text-sm font-bold text-indigo-700">
                          {item.price * item.quantity < 1000000
                            ? `LKR ${(item.price * item.quantity).toLocaleString()}`
                            : `${((item.price * item.quantity) / 1000).toFixed(1)}k`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="bg-white border-t border-gray-200 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>LKR {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax (0%)</span>
                <span>LKR 0</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Payable</span>
                <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                  <span className="text-xs font-semibold text-gray-400 mr-1 align-top relative top-1">LKR</span>
                  {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="col-span-1 flex flex-col items-center justify-center py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Clear Cart"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                className="col-span-3 flex items-center justify-center space-x-2 py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-bold">{isProcessing ? 'Processing' : 'Charge'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl scale-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                <p className="text-sm text-gray-500">Select method to close transaction</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <span className="text-lg">✕</span>
                </div>
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">Items ({cartItemCount})</span>
                <span className="text-sm font-bold text-gray-900">LKR {cartTotal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 h-px my-3" />
              <div className="flex justify-between items-center text-xl font-extrabold">
                <span className="text-gray-800">Total</span>
                <span className="text-indigo-600">LKR {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'cash', label: 'Cash', icon: DollarSign },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'mobile', label: 'Mobile', icon: Calculator }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 ${paymentMethod === id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm transform scale-105'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                      }`}
                  >
                    <Icon className={`h-6 w-6 mb-1 ${paymentMethod === id ? 'fill-indigo-200' : ''}`} />
                    <span className="text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === 'cash' && (
              <div className="mb-6 animate-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Cash Received
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">LKR</span>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 transition-colors"
                    step="0.01"
                    min={cartTotal}
                  />
                </div>

                {cashReceived && (
                  <div className={`mt-3 p-3 rounded-xl flex items-center justify-between ${change >= 0 ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'
                    }`}>
                    <span className="text-sm font-medium">{change >= 0 ? 'Change to Return:' : 'Insufficient Amount:'}</span>
                    <span className="font-bold font-mono text-lg">LKR {Math.abs(change).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={isProcessing || (paymentMethod === 'cash' && (!cashReceived || change < 0))}
                className="flex-1 px-4 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
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