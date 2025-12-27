import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import CashierDashboard from '../components/dashboards/CashierDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { getBooks } = useData();

  useEffect(() => {
    getBooks();
  }, []);

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'cashier':
      case 'user':
        return <CashierDashboard />;
      default:
        return <CashierDashboard />;
    }
  };

  return renderDashboard();
};

export default Dashboard;