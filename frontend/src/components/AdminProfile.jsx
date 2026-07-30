import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminProfile.css';

function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const adminId = localStorage.getItem('admin_id');

  // Fetch admin data
  useEffect(() => {
    if (!token || !adminId) {
      navigate('/adminlogin');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://127.0.0.1:5000/admin/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch admin profile');
        }

        const data = await response.json();
        setAdmin(data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message || 'Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token, adminId, navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('user_role');
    navigate('/adminlogin');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-profile-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-profile-wrapper">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error Loading Profile</h3>
          <p className="error-message">{error}</p>
          <button className="error-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="admin-profile-wrapper">
        <div className="no-data-container">
          <div className="no-data-icon">👤</div>
          <h3 className="no-data-title">No Profile Data</h3>
          <p className="no-data-message">Unable to load profile information. Please try again.</p>
          <button className="no-data-btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-wrapper">
      <div className="admin-profile-container">
        {/* Header */}
        <div className="admin-profile-header">
          <h1 className="admin-profile-title">👤 Admin Profile</h1>
          <p className="admin-profile-subtitle">View and manage your profile information</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Card Header - Avatar Section */}
          <div className="profile-card-header">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                <span className="avatar-text">
                  {admin.first_name?.[0]}{admin.last_name?.[0]}
                </span>
              </div>
              <div className="avatar-status">
                <span className="status-dot"></span>
                <span className="status-text">Active</span>
              </div>
            </div>
            <div className="profile-name-section">
              <h2 className="profile-full-name">
                {admin.first_name} {admin.last_name}
              </h2>
              <span className="profile-role-badge">
                {admin.is_super_admin ? '👑 Super Admin' : '🛡️ Admin'}
              </span>
            </div>
          </div>

          {/* Card Body - Profile Details */}
          <div className="profile-card-body">
            <div className="profile-details-grid">
              {/* Personal Information Section */}
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">📋</span>
                  Personal Information
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">First Name</span>
                    <span className="detail-value">{admin.first_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Name</span>
                    <span className="detail-value">{admin.last_name}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value email-value">{admin.email}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Admin ID</span>
                    <span className="detail-value id-value">#{admin.id}</span>
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">🔐</span>
                  Account Information
                </h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">
                      {formatDate(admin.date_added)}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Account Status</span>
                    <span className="detail-value">
                      <span className="status-badge status-active">
                        🟢 Active
                      </span>
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">
                      <span className={`role-badge ${admin.is_super_admin ? 'role-super' : 'role-admin'}`}>
                        {admin.is_super_admin ? 'Super Administrator' : 'Administrator'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">📊</span>
                  Quick Stats
                </h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">👥</span>
                    <span className="stat-label">Users Managed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">🏛️</span>
                    <span className="stat-label">Clubs Oversee</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">📢</span>
                    <span className="stat-label">Announcements</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              <button 
                className="btn-back"
                onClick={() => navigate('/adminhome')}
              >
                ← Back to Dashboard
              </button>
              <button 
                className="btn-logout"
                onClick={() => setShowLogoutModal(true)}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🚪 Logout</h2>
                <button className="modal-close" onClick={() => setShowLogoutModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="logout-icon">👋</div>
                <p className="logout-text">
                  Are you sure you want to logout?
                </p>
                <p className="logout-subtext">
                  You will need to login again to access the admin dashboard.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-logout-confirm" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;