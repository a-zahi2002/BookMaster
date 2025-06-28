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

  // Check if running in Electron
  const isElectron = window.require && window.require('electron');

  useEffect(() => {
    // Check for existing user session
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
        // Use Electron IPC for desktop app
        const { ipcRenderer } = window.require('electron');
        userData = await ipcRenderer.invoke('login', { username, password });
      } else {
        // Use web-based authentication
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
    // Simulate authentication for web version
    const users = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
      { id: 2, username: 'manager', password: 'manager123', role: 'manager' },
      { id: 3, username: 'user', password: 'user123', role: 'user' }
    ];

    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid credentials');
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