import React from 'react';

import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Book,
  User,
  Users,
  Cloud,
  Home,
  FileText
} from 'lucide-react';
import BookMasterLogo from './BookMasterLogo';

const Sidebar = ({ items, activeSection, onSectionChange, title, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const getIcon = (iconName) => {
    const iconMap = {
      '🏠': Home,
      '📚': Package,
      '👥': Users,
      '☁️': Cloud,
      '📊': BarChart3,
      '📋': FileText,
      '⚙️': Settings,
      '💰': ShoppingCart
    };

    const IconComponent = iconMap[iconName] || Package;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
            <BookMasterLogo size="default" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">BookMaster</h1>
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{title}</p>
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
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => onSectionChange(item.id)}
              className={`w-full group flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ease-out ${activeSection === item.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }`}
            >
              <div className={`transition-transform duration-200 ${activeSection === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {getIcon(item.icon)}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
              {activeSection === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;