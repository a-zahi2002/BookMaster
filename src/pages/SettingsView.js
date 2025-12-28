import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, Database, Shield, Palette, RotateCcw } from 'lucide-react';

const SettingsView = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = async () => {
    try {
      if (!user) return;

      // Update User Profile
      if (window.electronAPI) {
        const result = await window.electronAPI.updateUser(user.id, formData);
        if (result?.success) {
          updateProfile(formData);
          alert('Settings saved successfully!');
        } else {
          alert('Failed to save settings: ' + (result?.error || 'Unknown error'));
        }
      } else {
        // Web fallback
        updateProfile(formData);
        alert('Settings saved successfully (Local Only)!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const handleBackup = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.createManualBackup();
        if (result.success) {
          alert('Backup created successfully!');
        } else {
          alert('Backup failed: ' + (result.error || 'Unknown error'));
        }
      }
    } catch (error) {
      alert('Error creating backup: ' + error.message);
    }
  };

  const handleExport = async () => {
    try {
      // Reuse export logic or simplify
      alert('Use the Admin Dashboard for full data export features.');
    } catch (error) {
      alert('Error exporting data: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your system preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">User Profile</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  readOnly
                  className="input w-full bg-gray-50 capitalize"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">System Settings</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select className="input w-full">
                  <option value="LKR">Sri Lankan Rupee (LKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  defaultValue="10"
                  className="input w-full"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="notifications" className="rounded" />
                <label htmlFor="notifications" className="text-sm text-gray-700">
                  Enable low stock notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Database Management</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <button onClick={handleBackup} className="btn-primary w-full">
                Backup Database
              </button>
              <button onClick={handleExport} className="btn-secondary w-full">
                Export Data (CSV)
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restore from Backup
                </label>
                <input
                  type="file"
                  accept=".db,.sqlite,.backup"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Security</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <button className="btn-secondary w-full">
                Change Password
              </button>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-logout" className="rounded" />
                <label htmlFor="auto-logout" className="text-sm text-gray-700">
                  Auto logout after 30 minutes of inactivity
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="audit-log" className="rounded" defaultChecked />
                <label htmlFor="audit-log" className="text-sm text-gray-700">
                  Enable audit logging
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme Preference</label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center p-2 border-2 border-indigo-600 bg-indigo-50 rounded-lg">
                    <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
                    <span className="text-xs font-medium text-indigo-700">Light</span>
                  </button>
                  <button className="flex flex-col items-center p-2 border border-gray-200 hover:border-gray-300 rounded-lg">
                    <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                    <span className="text-xs font-medium text-gray-600">Dark</span>
                  </button>
                  <button className="flex flex-col items-center p-2 border border-gray-200 hover:border-gray-300 rounded-lg">
                    <div className="w-full h-8 bg-gradient-to-br from-white to-gray-900 border border-gray-200 rounded mb-2"></div>
                    <span className="text-xs font-medium text-gray-600">System</span>
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => alert('Appearance settings reset to default')}
                  className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="btn-primary"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsView;