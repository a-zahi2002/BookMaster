import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Edit, Trash2, Shield, Eye, EyeOff, Key, Activity, Search, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'cashier',
    name: '',
    email: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await window.electronAPI?.getUsers() || [];
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async (userId = null) => {
    try {
      const logs = await window.electronAPI?.getUserActivityLogs(userId) || [];
      setActivityLogs(logs);
      setShowLogs(true);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI?.createUser(newUser);
      if (result.success) {
        setShowCreateModal(false);
        setNewUser({ username: '', password: '', role: 'cashier', name: '', email: '' });
        loadUsers();
        alert('User created successfully!');
      }
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI?.updateUser(selectedUser.id, selectedUser);
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        loadUsers();
        alert('User updated successfully!');
      }
    } catch (error) {
      alert('Error updating user: ' + error.message);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const result = await window.electronAPI?.toggleUserStatus(userId);
      if (result.success) {
        loadUsers();
        alert(`User ${result.newStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      alert('Error toggling user status: ' + error.message);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    try {
      const result = await window.electronAPI?.resetPassword(userId, newPassword);
      if (result.success) {
        alert('Password reset successfully!');
      }
    } catch (error) {
      alert('Error resetting password: ' + error.message);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cashier': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-800">Only administrators and managers have permission to view system users.</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass.bg} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center tracking-tight">
            <Users className="w-8 h-8 mr-3 text-indigo-600" />
            User Management
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Manage access, roles, and security permissions.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => loadActivityLogs()}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <Activity className="h-4 w-4 mr-2 text-gray-500" />
            View Logs
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={users.length}
          icon={Users}
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <StatCard
          label="Admins"
          value={users.filter(u => u.role === 'admin').length}
          icon={Shield}
          colorClass={{ bg: 'bg-red-50', text: 'text-red-600' }}
        />
        <StatCard
          label="Managers"
          value={users.filter(u => u.role === 'manager').length}
          icon={Activity}
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
        <StatCard
          label="Cashiers"
          value={users.filter(u => u.role === 'cashier').length}
          icon={Users}
          colorClass={{ bg: 'bg-green-50', text: 'text-green-600' }}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
          <h3 className="font-bold text-gray-900 text-lg">System Users Directory</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider">Role & Permissions</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                        {userItem.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-bold text-gray-900">{userItem.name}</div>
                        <div className="text-xs text-gray-500">{userItem.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeColor(userItem.role)}`}>
                      {userItem.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {userItem.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {userItem.is_active ?
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> :
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      }
                      <span className={`text-sm ${userItem.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                        {userItem.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {userItem.last_login
                      ? new Date(userItem.last_login).toLocaleDateString()
                      : <span className="text-gray-400 italic">Never</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => { setSelectedUser(userItem); setShowEditModal(true); }}
                            className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(userItem.id)}
                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(userItem.id)}
                            className={`p-2 rounded-lg transition-colors ${userItem.is_active ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                            title={userItem.is_active ? "Deactivate" : "Activate"}
                          >
                            {userItem.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => loadActivityLogs(userItem.id)}
                        className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                        title="View Logs"
                      >
                        <Activity className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal - Simplified implementation for brevity, assuming standard styling */}
      {/* ... Keeping existing modal logic but improving classes ... */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Form fields with improved styling */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input type="text" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (similarly styled) */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              {/* Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={selectedUser.name} onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input type="text" value={selectedUser.username} onChange={e => setSelectedUser({ ...selectedUser, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={selectedUser.email || ''} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select value={selectedUser.role} onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex items-center pt-2">
                <input type="checkbox" id="is_active" checked={selectedUser.is_active} onChange={e => setSelectedUser({ ...selectedUser, is_active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">Active Account</label>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Activity Audit Log</h3>
              <button onClick={() => setShowLogs(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 text-xs uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{log.user_name}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200">{log.action}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{log.details}</td>
                      <td className="px-6 py-3 text-sm text-gray-400 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {activityLogs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No activity logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;