import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookProvider } from './contexts/BookContext';
import { CartProvider } from './contexts/CartContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </BookProvider>
    </AuthProvider>
  );
}

export default App;