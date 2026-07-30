import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminLogin.css';

function AdminLogin({ setIsAuthenticated, setAdminId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/adminlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { access_token, admin_id, role } = data;

        if (!access_token || admin_id === null || admin_id === undefined) {
          setError('Invalid response from server.');
          setLoading(false);
          return;
        }

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('admin_id', admin_id.toString());
        localStorage.setItem('user_role', role || 'admin');

        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setAdminId) setAdminId(admin_id);

        navigate('/adminhome');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-container">
        <h3 className="login-heading">Admin Login</h3>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="row">
            <div className="col-12">
              <label className="login-labels" htmlFor="email">
                Email Address
              </label>
              <input
                className={`login-inputs ${error ? 'error' : ''}`}
                type="email"
                id="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <label className="login-labels" htmlFor="password">
                Password
              </label>
              <input
                className={`login-inputs ${error ? 'error' : ''}`}
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            className="login-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login as Admin'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p style={{ marginTop: '8px' }}>
            <span className="login-link" onClick={() => navigate('/')}>
              ← Back to Home
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;