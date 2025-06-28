import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  BookOpen,
  User,
  Users,
  Cloud,
  Home,
  FileText
} from 'lucide-react';

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
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">BookMaster</h1>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getIcon(item.icon)}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;