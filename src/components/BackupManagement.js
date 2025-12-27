import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, Download, Upload, Trash2, RefreshCw, HardDrive, Wifi, WifiOff, X, Shield, Lock, Database } from 'lucide-react';

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

  const StatCard = ({ label, value, subtext, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${colorClass.bg}`}>
        <Icon className={`w-6 h-6 ${colorClass.text}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${colorClass.text || 'text-gray-900'}`}>{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center tracking-tight">
            <Database className="w-8 h-8 mr-3 text-indigo-600" />
            Backup Center
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Secure your business data with local and cloud backups.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadBackups}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          {canCreateBackup && (
            <button
              onClick={handleCreateBackup}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Backup
            </button>
          )}
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Connection"
          value={isOnline ? 'Online' : 'Offline'}
          icon={isOnline ? Wifi : WifiOff}
          colorClass={{ bg: isOnline ? 'bg-green-50' : 'bg-red-50', text: isOnline ? 'text-green-600' : 'text-red-600' }}
        />
        <StatCard
          label="Google Drive"
          value={googleDriveStatus.isConnected ? 'Connected' : 'Unlinked'}
          icon={Cloud}
          colorClass={{ bg: googleDriveStatus.isConnected ? 'bg-blue-50' : 'bg-gray-100', text: googleDriveStatus.isConnected ? 'text-blue-600' : 'text-gray-500' }}
        />
        <StatCard
          label="Local Files"
          value={backups.local.length}
          subtext="Stored on this device"
          icon={HardDrive}
          colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
        />
        <StatCard
          label="Cloud Files"
          value={backups.cloud.length}
          subtext="Safe in the cloud"
          icon={Shield}
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
      </div>

      {/* Drive Connection Banner */}
      {!googleDriveStatus.isConnected && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-blue-900 flex items-center">
              <Cloud className="w-5 h-5 mr-2" />
              Enable Cloud Protection
            </h3>
            <p className="text-blue-700 mt-1">Connect your Google Drive to automatically secure your data off-site.</p>
          </div>
          <button
            onClick={handleConnectGoogleDrive}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-sm hover:shadow-md transition-all border border-blue-100 flex items-center"
          >
            <Lock className="w-4 h-4 mr-2" />
            Connect Drive
          </button>
        </div>
      )}

      {/* Pending Uploads */}
      {backups.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center shadow-sm">
          <Upload className="h-5 w-5 text-yellow-600 mr-3 animate-bounce" />
          <p className="text-yellow-800 font-medium">
            {backups.pending} backup(s) pending upload. Synching will resume automatically when online.
          </p>
        </div>
      )}

      {/* Local Backups Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-lg flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-gray-500" />
            Local Repository
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Filename</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.local.map((backup) => (
                <tr key={backup.filename} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-700">{backup.filename}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${backup.type === 'automatic' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(backup.size)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(backup.created).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {canDeleteBackup && (
                      <button
                        onClick={() => handleDeleteBackup(backup, false)}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Backup"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {backups.local.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No local backups found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Backups Table */}
      {googleDriveStatus.isConnected && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-500" />
              Cloud Repository
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backups.cloud.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">{backup.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {backup.size ? formatFileSize(parseInt(backup.size)) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(backup.createdTime).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(backup.modifiedTime).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {canDeleteBackup && (
                          <button
                            onClick={() => handleDeleteBackup(backup, true)}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {backups.cloud.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">No cloud backups found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Authorize Google Drive</h3>
              <button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                1. A browser window has opened for you to sign in.<br />
                2. Copy the code provided by Google.<br />
                3. Paste the code below to finish setup.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Authorization Code</label>
                <input
                  type="text"
                  id="authCode"
                  placeholder="Paste code starting with 4/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const authCode = document.getElementById('authCode').value;
                    if (authCode) handleAuthCode(authCode);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Link Account
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