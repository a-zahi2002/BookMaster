import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, Download, Upload, Trash2, RefreshCw, HardDrive, Wifi, WifiOff, X, Shield, Lock, Database, Search, ChevronLeft, ChevronRight, AlertTriangle, CheckSquare, FolderOpen } from 'lucide-react';

const BackupManagement = () => {
  const { user } = useAuth();
  const [backups, setBackups] = useState({ local: [], cloud: [], pending: 0 });
  const [googleDriveStatus, setGoogleDriveStatus] = useState({ isConnected: false, hasAuth: false });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('Default');

  useEffect(() => {
    window.electronAPI?.getBackupPath().then(path => path && setCurrentPath(path));
  }, []);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localPage, setLocalPage] = useState(1);
  const [cloudPage, setCloudPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, subtext: '' });
  const [selectedLocal, setSelectedLocal] = useState([]);
  const [selectedCloud, setSelectedCloud] = useState([]);
  const itemsPerPage = 10;

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

  const executeDeleteAllCloudBackups = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI?.deleteAllCloudBackups();
      if (result.success) {
        loadBackups();
        alert(`Successfully deleted ${result.count} cloud backup files.`);
      }
    } catch (error) {
      alert('Error deleting all cloud backups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllCloudBackups = () => {
    if (user?.role !== 'admin') return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Cloud Backups',
      message: 'Are you sure you want to delete ALL cloud backups?',
      subtext: 'This action cannot be undone.',
      onConfirm: executeDeleteAllCloudBackups
    });
  };

  const executeDeleteAllLocalBackups = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI?.deleteAllLocalBackups();
      if (result.success) {
        loadBackups();
        alert(`Successfully deleted ${result.count} local backup files.`);
      }
    } catch (error) {
      alert('Error deleting all backups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllLocalBackups = () => {
    if (user?.role !== 'admin') return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Local Backups',
      message: 'Are you sure you want to delete ALL local backups?',
      subtext: 'This action cannot be undone.',
      onConfirm: executeDeleteAllLocalBackups
    });
  };

  const executeDeleteBackup = async (backup, isCloud) => {
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

  const handleDeleteBackup = (backup, isCloud = false) => {
    if (user?.role !== 'admin') {
      alert('Only administrators can delete backups');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Backup',
      message: `Are you sure you want to delete "${isCloud ? backup.name : backup.filename}"?`,
      subtext: 'This action cannot be undone.',
      onConfirm: () => executeDeleteBackup(backup, isCloud)
    });
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
  const canDeleteBackup = user?.role === 'admin' || user?.role === 'manager';

  const handleSelectBackupPath = async () => {
    try {
      const result = await window.electronAPI?.selectBackupPath();
      if (result?.success) {
        alert('Backup location updated successfully to: ' + result.path);
        setCurrentPath(result.path);
        loadBackupHistory(); // Refresh to show backups in new folder
      }
    } catch (error) {
      console.error('Error setting backup path:', error);
    }
  };

  const handleSelectLocal = (filename) => {
    if (selectedLocal.includes(filename)) {
      setSelectedLocal(selectedLocal.filter(id => id !== filename));
    } else {
      setSelectedLocal([...selectedLocal, filename]);
    }
  };

  const handleSelectCloud = (id) => {
    if (selectedCloud.includes(id)) {
      setSelectedCloud(selectedCloud.filter(i => i !== id));
    } else {
      setSelectedCloud([...selectedCloud, id]);
    }
  };

  const handleSelectAllLocal = () => {
    if (selectedLocal.length === filteredLocalBackups.length) {
      setSelectedLocal([]);
    } else {
      setSelectedLocal(filteredLocalBackups.map(b => b.filename));
    }
  };

  const handleSelectAllCloud = () => {
    if (selectedCloud.length === filteredCloudBackups.length) {
      setSelectedCloud([]);
    } else {
      setSelectedCloud(filteredCloudBackups.map(b => b.id));
    }
  };

  const executeDeleteSelectedLocal = async () => {
    try {
      setLoading(true);
      let count = 0;
      for (const filename of selectedLocal) {
        await window.electronAPI?.deleteLocalBackup(filename);
        count++;
      }
      loadBackups();
      setSelectedLocal([]);
      alert(`Successfully deleted ${count} selected backups.`);
    } catch (error) {
      alert('Error deleting selected backups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteSelectedCloud = async () => {
    try {
      setLoading(true);
      let count = 0;
      for (const id of selectedCloud) {
        await window.electronAPI?.deleteCloudBackup(id);
        count++;
      }
      loadBackups();
      setSelectedCloud([]);
      alert(`Successfully deleted ${count} selected cloud backups.`);
    } catch (error) {
      alert('Error deleting selected backups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDownloadSelectedCloud = async () => {
    try {
      setLoading(true);
      let count = 0;
      for (const id of selectedCloud) {
        const backup = backups.cloud.find(b => b.id === id);
        if (backup) {
          await window.electronAPI?.downloadBackup(id, backup.name);
          count++;
        }
      }
      alert(`Successfully downloaded ${count} backups.`);
      setSelectedCloud([]);
    } catch (error) {
      alert('Error downloading backups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteSelectedLocal = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Backups',
      message: `Are you sure you want to delete ${selectedLocal.length} selected backups?`,
      subtext: 'This action cannot be undone.',
      onConfirm: executeDeleteSelectedLocal
    });
  };

  const handleDeleteSelectedCloud = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Cloud Backups',
      message: `Are you sure you want to delete ${selectedCloud.length} selected cloud backups?`,
      subtext: 'This action cannot be undone.',
      onConfirm: executeDeleteSelectedCloud
    });
  };

  const StatCard = ({ label, value, subtext, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl shrink-0 ${colorClass.bg}`}>
        <Icon className={`w-6 h-6 ${colorClass.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider truncate" title={label}>{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${colorClass.text || 'text-gray-900'} truncate`} title={value}>{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1 truncate" title={subtext}>{subtext}</p>}
      </div>
    </div>
  );

  const filteredLocalBackups = backups.local.filter(backup =>
    backup.filename.toLowerCase().includes(localSearchTerm.toLowerCase())
  );
  const filteredCloudBackups = backups.cloud.filter(backup =>
    backup.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLocalPages = Math.ceil(filteredLocalBackups.length / itemsPerPage);
  const totalCloudPages = Math.ceil(filteredCloudBackups.length / itemsPerPage);

  const paginatedLocalBackups = filteredLocalBackups.slice(
    (localPage - 1) * itemsPerPage,
    localPage * itemsPerPage
  );
  const paginatedCloudBackups = filteredCloudBackups.slice(
    (cloudPage - 1) * itemsPerPage,
    cloudPage * itemsPerPage
  );

  useEffect(() => {
    setLocalPage(1);
    setCloudPage(1);
  }, [searchTerm]);

  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

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
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search backups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-80 transition-all"
            />
          </div>
          <button
            onClick={loadBackups}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-gray-500" />
            Local Repository
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectBackupPath}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 bg-white"
              title={`Current Path: ${currentPath}`}
            >
              <FolderOpen className="h-4 w-4" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search local..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 transition-all"
              />
            </div>
            {filteredLocalBackups.length > 0 && (
              <button
                onClick={handleSelectAllLocal}
                className="text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors hover:bg-indigo-50"
              >
                <CheckSquare className="w-4 h-4 mr-1.5" />
                {selectedLocal.length === filteredLocalBackups.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
            {selectedLocal.length > 0 ? (
              <button
                onClick={handleDeleteSelectedLocal}
                className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors border border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Selected ({selectedLocal.length})
              </button>
            ) : (
              canDeleteBackup && backups.local.length > 0 && (
                <button
                  onClick={handleDeleteAllLocalBackups}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete All Local Backups"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete All
                </button>
              )
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={filteredLocalBackups.length > 0 && selectedLocal.length === filteredLocalBackups.length}
                    onChange={handleSelectAllLocal}
                  />
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Filename</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLocalBackups.map((backup) => (
                <tr key={backup.filename} className={`hover:bg-gray-50/80 transition-colors ${selectedLocal.includes(backup.filename) ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedLocal.includes(backup.filename)}
                      onChange={() => handleSelectLocal(backup.filename)}
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-700 whitespace-nowrap">{backup.filename}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${backup.type === 'automatic' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatFileSize(backup.size)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(backup.created).toLocaleString()}</td>
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
              {filteredLocalBackups.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">
                  {searchTerm ? 'No local backups found matching search.' : 'No local backups found.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={localPage}
          totalPages={totalLocalPages}
          onPageChange={setLocalPage}
        />
      </div>

      {/* Cloud Backups Table */}
      {googleDriveStatus.isConnected && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-500" />
              Cloud Repository
            </h3>
            <div className="flex items-center space-x-2">
              {filteredCloudBackups.length > 0 && (
                <button
                  onClick={handleSelectAllCloud}
                  className="text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors hover:bg-indigo-50"
                >
                  <CheckSquare className="w-4 h-4 mr-1.5" />
                  {selectedCloud.length === filteredCloudBackups.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
              {selectedCloud.length > 0 ? (
                <>
                  <button
                    onClick={executeDownloadSelectedCloud}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors border border-blue-200"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download ({selectedCloud.length})
                  </button>
                  <button
                    onClick={handleDeleteSelectedCloud}
                    className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors border border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete ({selectedCloud.length})
                  </button>
                </>
              ) : (
                canDeleteBackup && backups.cloud.length > 0 && (
                  <button
                    onClick={handleDeleteAllCloudBackups}
                    className="text-gray-500 hover:text-red-600 text-sm font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete All Cloud Backups"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete All
                  </button>
                )
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={filteredCloudBackups.length > 0 && selectedCloud.length === filteredCloudBackups.length}
                      onChange={handleSelectAllCloud}
                    />
                  </th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCloudBackups.map((backup) => (
                  <tr key={backup.id} className={`hover:bg-gray-50/80 transition-colors ${selectedCloud.includes(backup.id) ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedCloud.includes(backup.id)}
                        onChange={() => handleSelectCloud(backup.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-700 whitespace-nowrap">{backup.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {backup.size ? formatFileSize(parseInt(backup.size)) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(backup.createdTime).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(backup.modifiedTime).toLocaleString()}</td>
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
                {filteredCloudBackups.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">
                    {searchTerm ? 'No cloud backups found matching search.' : 'No cloud backups found.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={cloudPage}
            totalPages={totalCloudPages}
            onPageChange={setCloudPage}
          />
        </div>
      )}


      {/* Connect Modal */}
      {
        showConnectModal && (
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
        )
      }
    </div >
  );
};

export default BackupManagement;