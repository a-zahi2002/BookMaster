import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, Database, Shield } from 'lucide-react';

const SettingsView = () => {
  const { user } = useAuth();

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
                  value={user?.name || ''}
                  readOnly
                  className="input w-full bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  readOnly
                  className="input w-full bg-gray-50"
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
              <button className="btn-primary w-full">
                Backup Database
              </button>
              <button className="btn-secondary w-full">
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
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button className="btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsView;