import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Sidebar from '../components/Sidebar';
import POSView from '../components/POSView';
import InventoryView from '../components/InventoryView';
import ReportsView from '../components/ReportsView';
import SettingsView from '../components/SettingsView';

const Dashboard = () => {
  const { user } = useAuth();
  const { getBooks } = useData();
  const [activeView, setActiveView] = useState('pos');

  useEffect(() => {
    getBooks();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'pos':
        return <POSView />;
      case 'inventory':
        return <InventoryView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <POSView />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        userRole={user?.role}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;