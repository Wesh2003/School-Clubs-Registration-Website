// ClubLeaderProfile.jsx
import React, { useEffect, useState } from 'react';
import '../css/ClubLeaderProfile.css';  // Add this import

function ClubLeaderProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId || !token) {
      setError('Please log in to view your profile');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('You are not authorized to view this profile.');
          } else if (response.status === 404) {
            throw new Error('User not found.');
          } else {
            throw new Error(`Error ${response.status}: Failed to fetch user data`);
          }
        }

        const data = await response.json();
        setUser(data);
        
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  if (loading) {
    return (
      <div className="club-leader-profile-wrapper">
        <div className="profile-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-leader-profile-wrapper">
        <div className="profile-container">
          <div className="error-container">
            <h4 className="error-title">Error</h4>
            <p className="error-message">{error}</p>
            {error.includes('log in') && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="error-btn"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="club-leader-profile-wrapper">
        <div className="profile-container">
          <div className="no-data-container">
            <div className="no-data-icon">👤</div>
            <h3 className="no-data-title">No User Data</h3>
            <p className="no-data-message">No user data available. Please try logging in again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="club-leader-profile-wrapper">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">👤 Club Leader Profile</h1>
          <p className="profile-subtitle">View your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Card Header - Gradient Section */}
          <div className="profile-card-header">
            <div className="profile-user-info">
              <div className="profile-avatar">
                <span className="profile-avatar-text">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div className="profile-name-section">
                <h2 className="profile-full-name">
                  {user.first_name} {user.last_name}
                </h2>
                <span className="profile-role-badge">🏅 Club Leader</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="profile-card-body">
            {/* Name Section */}
            <div className="profile-detail-section">
              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <span className="profile-detail-label">First Name</span>
                  <span className="profile-detail-value">{user.first_name}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Last Name</span>
                  <span className="profile-detail-value">{user.last_name}</span>
                </div>
              </div>
            </div>

            {/* Email Section */}
            <div className="profile-detail-section">
              <div className="profile-detail-item profile-detail-item-full">
                <span className="profile-detail-label">Email Address</span>
                <span className="profile-detail-value profile-detail-value-mono">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Member Since */}
            {user.date_added && (
              <div className="profile-detail-section">
                <div className="profile-member-since">
                  <span className="profile-member-icon">📅</span>
                  <span className="profile-member-text">
                    <strong>Member Since:</strong>{' '}
                    {new Date(user.date_added).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="profile-actions">
              <button 
                onClick={() => window.location.href = '/clubleaderhome'}
                className="profile-btn profile-btn-secondary"
              >
                ← Back to Dashboard
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_id');
                  window.location.href = '/';
                }}
                className="profile-btn profile-btn-danger"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubLeaderProfile;