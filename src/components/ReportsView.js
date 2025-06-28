import React from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';

const ReportsView = () => {
  const { books } = useData();

  const totalBooks = books.length;
  const totalStock = books.reduce((sum, book) => sum + book.stock_quantity, 0);
  const totalValue = books.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0);
  const lowStockBooks = books.filter(book => book.stock_quantity < 10);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Overview of your bookstore performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockBooks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockBooks.length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-red-600">Low Stock Alert</h3>
            <p className="text-sm text-gray-600">Books with less than 10 items in stock</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {lowStockBooks.map((book) => (
                <div key={book.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                    {book.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Books by Value */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Top Books by Inventory Value</h3>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {books
              .sort((a, b) => (b.price * b.stock_quantity) - (a.price * a.stock_quantity))
              .slice(0, 5)
              .map((book) => (
                <div key={book.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      LKR {(book.price * book.stock_quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {book.stock_quantity} × LKR {book.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;