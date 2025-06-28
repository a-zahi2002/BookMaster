import React from 'react';

const Sidebar = ({ items, activeSection, onSectionChange, user, onLogout, title }) => {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-600">{user?.username}</p>
      </div>
      <nav className="mt-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
              activeSection === item.id ? 'bg-gray-100 border-r-2 border-blue-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="text-gray-700">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-6 py-3 text-left text-red-600 hover:bg-red-50"
        >
          <span className="mr-3">🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;