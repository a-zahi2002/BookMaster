import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isElectron = window.require && window.require('electron');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      let userData;
      
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        userData = await ipcRenderer.invoke('login', { username, password });
      } else {
        userData = await webLogin(username, password);
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const webLogin = async (username, password) => {
    const users = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
      { id: 2, username: 'manager', password: 'manager123', role: 'manager', name: 'Manager' },
      { id: 3, username: 'cashier', password: 'cashier123', role: 'cashier', name: 'Cashier' }
    ];

    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid username or password');
    }

    const { password: _, ...userData } = foundUser;
    return userData;
  };

  const logout = async () => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('logout');
      }
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isElectron
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};