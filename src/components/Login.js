import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'user':
          navigate('/sales');
          break;
        default:
          navigate('/sales');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await login(credentials.username, credentials.password);
      
      // Navigate based on role
      switch (userData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'user':
          navigate('/sales');
          break;
        default:
          navigate('/sales');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Blue Gradient Section */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">BookMaster</h1>
          <p className="text-xl text-blue-100">Point of Sale System</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 outline-none transition"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>Manager: manager / manager123</p>
            <p>User: user / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;