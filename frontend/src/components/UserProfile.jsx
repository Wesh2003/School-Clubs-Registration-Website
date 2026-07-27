import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/UserProfile.css';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [clubDetails, setClubDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!userResponse.ok) {
          throw new Error(`HTTP Error! Status: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's dashboard data which includes memberships
        const dashboardResponse = await fetch(`http://127.0.0.1:5000/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setMemberships(dashboardData.active_memberships || []);
          
          // Fetch club details for each membership
          const clubs = [];
          if (dashboardData.active_memberships) {
            for (const membership of dashboardData.active_memberships) {
              const clubResponse = await fetch(`http://127.0.0.1:5000/clubs/${membership.club_id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  "Content-Type": "application/json"
                },
              });
              if (clubResponse.ok) {
                const clubData = await clubResponse.json();
                clubs.push(clubData);
              }
            }
            setClubDetails(clubs);
          }
        } else {
          setMemberships([]);
          setClubDetails([]);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  // Handle navigation to club page
  const handleViewClub = (clubId) => {
    navigate(`/club/${clubId}`);
  };

  // Handle navigation to browse clubs
  const handleBrowseClubs = () => {
    navigate('/clubs');
  };

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    navigate('/userhome');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="user-profile-wrapper">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-wrapper">
        <div className="profile-error">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-wrapper">
        <div className="profile-no-data">
          <p>No user data available. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-wrapper">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </span>
          </div>
          <div className="profile-name-section">
            <h2 className="profile-name">
              {user.first_name} {user.last_name}
            </h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{user.first_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{user.last_name}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>
              {user.phone && (
                <div className="detail-item full-width">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
              )}
              {user.date_added && (
                <div className="detail-item full-width">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {new Date(user.date_added).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clubs Section */}
          <div className="detail-section">
            <h3 className="section-title">
              <span className="section-icon">🏛️</span>
              My Clubs
            </h3>
            
            {clubDetails.length === 0 ? (
              <div className="no-clubs">
                <p className="no-clubs-text">You are not a member of any club yet.</p>
                <button 
                  onClick={handleBrowseClubs}
                  className="browse-clubs-btn"
                >
                  Browse Clubs
                </button>
              </div>
            ) : (
              <div className="clubs-grid">
                {clubDetails.map((club) => (
                  <div key={club.id} className="club-card">
                    <div className="club-card-header">
                      <h4 className="club-name">{club.name}</h4>
                      {club.category && (
                        <span className="club-category">{club.category}</span>
                      )}
                    </div>
                    {club.description && (
                      <p className="club-description">
                        {club.description.length > 100 
                          ? club.description.substring(0, 100) + '...' 
                          : club.description}
                      </p>
                    )}
                    <div className="club-details">
                      {club.meeting_day && (
                        <span className="club-detail">
                          <span className="detail-icon">📅</span>
                          {club.meeting_day}
                        </span>
                      )}
                      {club.meeting_time && (
                        <span className="club-detail">
                          <span className="detail-icon">🕐</span>
                          {club.meeting_time}
                        </span>
                      )}
                      {club.meeting_location && (
                        <span className="club-detail">
                          <span className="detail-icon">📍</span>
                          {club.meeting_location}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleViewClub(club.id)}
                      className="view-club-btn"
                    >
                      View Club
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Membership Stats */}
          {memberships.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">
                <span className="section-icon">📊</span>
                Membership Summary
              </h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">{memberships.length}</span>
                  <span className="stat-label">Active Clubs</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{clubDetails.filter(c => c.is_active !== false).length}</span>
                  <span className="stat-label">Active Memberships</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button 
            onClick={handleBackToDashboard}
            className="btn-secondary"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={handleLogout}
            className="btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;