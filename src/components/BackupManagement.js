import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, Download, Upload, Trash2, RefreshCw, HardDrive, Wifi, WifiOff } from 'lucide-react';

const BackupManagement = () => {
  const { user } = useAuth();
  const [backups, setBackups] = useState({ local: [], cloud: [], pending: 0 });
  const [googleDriveStatus, setGoogleDriveStatus] = useState({ isConnected: false, hasAuth: false });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    loadBackups();
    checkGoogleDriveStatus();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupHistory = await window.electronAPI?.getBackupHistory() || { local: [], cloud: [], pending: 0 };
      setBackups(backupHistory);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleDriveStatus = async () => {
    try {
      const status = await window.electronAPI?.getGoogleDriveStatus() || { isConnected: false, hasAuth: false };
      setGoogleDriveStatus(status);
    } catch (error) {
      console.error('Error checking Google Drive status:', error);
    }
  };

  const handleConnectGoogleDrive = async () => {
    try {
      const result = await window.electronAPI?.connectGoogleDrive();
      if (result.authUrl) {
        // Open auth URL in browser
        window.open(result.authUrl, '_blank');
        setShowConnectModal(true);
      }
    } catch (error) {
      alert('Error connecting to Google Drive: ' + error.message);
    }
  };

  const handleAuthCode = async (authCode) => {
    try {
      const result = await window.electronAPI?.setGoogleDriveTokens(authCode);
      if (result.success) {
        setShowConnectModal(false);
        checkGoogleDriveStatus();
        alert('Google Drive connected successfully!');
      }
    } catch (error) {
      alert('Error setting up Google Drive: ' + error.message);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI?.createManualBackup();
      if (result.success) {
        loadBackups();
        alert('Backup created successfully!');
      }
    } catch (error) {
      alert('Error creating backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backup, isCloud = false) => {
    if (user?.role !== 'admin') {
      alert('Only administrators can delete backups');
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete this backup? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      let result;
      if (isCloud) {
        result = await window.electronAPI?.deleteCloudBackup(backup.id);
      } else {
        result = await window.electronAPI?.deleteLocalBackup(backup.filename);
      }
      
      if (result.success) {
        loadBackups();
        alert('Backup deleted successfully!');
      }
    } catch (error) {
      alert('Error deleting backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      setLoading(true);
      const result = await window.electronAPI?.downloadBackup(backup.id, backup.name);
      if (result.success) {
        alert(`Backup downloaded to: ${result.path}`);
      }
    } catch (error) {
      alert('Error downloading backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canCreateBackup = user?.role === 'admin' || user?.role === 'manager';
  const canDeleteBackup = user?.role === 'admin';

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backup Management</h1>
            <p className="text-gray-600">Manage your data backups and Google Drive integration</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadBackups}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canCreateBackup && (
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="btn-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Create Backup
              </button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isOnline ? <Wifi className="h-6 w-6 text-green-600" /> : <WifiOff className="h-6 w-6 text-red-600" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Connection</p>
                  <p className={`text-lg font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${googleDriveStatus.isConnected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Cloud className={`h-6 w-6 ${googleDriveStatus.isConnected ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Google Drive</p>
                  <p className={`text-lg font-bold ${googleDriveStatus.isConnected ? 'text-blue-600' : 'text-gray-600'}`}>
                    {googleDriveStatus.isConnected ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Local Backups</p>
                  <p className="text-2xl font-bold text-gray-900">{backups.local.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center">
                <Cloud className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cloud Backups</p>
                  <p className="text-2xl font-bold text-gray-900">{backups.cloud.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Drive Connection */}
        {!googleDriveStatus.isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Connect Google Drive</h3>
                <p className="text-blue-700">Enable automatic cloud backups by connecting your Google Drive account.</p>
              </div>
              <button
                onClick={handleConnectGoogleDrive}
                className="btn-primary"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Connect
              </button>
            </div>
          </div>
        )}

        {/* Pending Backups Alert */}
        {backups.pending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Upload className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">
                {backups.pending} backup(s) pending upload. They will be uploaded automatically when internet connection is restored.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Backups */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Local Backups</h3>
          <p className="text-sm text-gray-600">Backups stored on your local device</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.local.map((backup) => (
                <tr key={backup.filename} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {backup.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      backup.type === 'automatic' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(backup.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.created).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canDeleteBackup && (
                        <button
                          onClick={() => handleDeleteBackup(backup, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Backups */}
      {googleDriveStatus.isConnected && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Cloud Backups (Google Drive)</h3>
            <p className="text-sm text-gray-600">Backups stored in your Google Drive</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.cloud.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {backup.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.size ? formatFileSize(parseInt(backup.size)) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.createdTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.modifiedTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {canDeleteBackup && (
                          <button
                            onClick={() => handleDeleteBackup(backup, true)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Google Drive Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Complete Google Drive Setup</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                After authorizing in the browser, copy the authorization code and paste it below:
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authorization Code
                </label>
                <input
                  type="text"
                  id="authCode"
                  placeholder="Paste authorization code here"
                  className="input w-full"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const authCode = document.getElementById('authCode').value;
                    if (authCode) {
                      handleAuthCode(authCode);
                    }
                  }}
                  className="btn-primary flex-1"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManagement;