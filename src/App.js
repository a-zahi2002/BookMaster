import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import SalesDashboard from './components/SalesDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'user']}>
                    <SalesDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;