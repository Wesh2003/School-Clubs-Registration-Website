import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ClubMembers.css';

function ClubMembers() {
  const [clubLeaders, setClubLeaders] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's dashboard to get club leadership
      const dashboardResponse = await fetch('http://127.0.0.1:5000/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await dashboardResponse.json();
      
      // Get club leader info
      const leaderClubs = dashboardData.club_leader_for || [];
      
      if (leaderClubs.length === 0) {
        setError('You are not a club leader for any club.');
        setLoading(false);
        return;
      }

      setClubLeaders(leaderClubs);
      
      // Select the first club by default
      const firstClub = leaderClubs[0];
      setSelectedClub(firstClub);

      // Fetch all clubs for reference
      const clubsResponse = await fetch('http://127.0.0.1:5000/clubs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);
      }

      // Fetch members for the selected club using the new endpoint
      await fetchClubMembers(firstClub.club_id);

      // Fetch all users for adding members
      const usersResponse = await fetch('http://127.0.0.1:5000/club/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setAllUsers(usersData);
      } else {
        console.warn('Could not fetch users for adding members');
        setAllUsers([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch club members using the new endpoint
  const fetchClubMembers = async (clubId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/club/members/${clubId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data);
      
    } catch (err) {
      console.error('Error fetching members:', err);
      showNotification(err.message || 'Failed to fetch members', 'error');
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  // Handle club change
  const handleClubChange = (clubId) => {
    const club = clubLeaders.find(c => c.club_id === clubId);
    if (club) {
      setSelectedClub(club);
      fetchClubMembers(clubId);
    }
  };

  // Add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      showNotification('Please select a user to add.', 'error');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/memberships', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(selectedUser),
          club_id: selectedClub.club_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }

      showNotification('Member added successfully!');
      setShowAddModal(false);
      setSelectedUser('');
      fetchClubMembers(selectedClub.club_id);
    } catch (err) {
      console.error('Error adding member:', err);
      showNotification(err.message || 'Failed to add member', 'error');
    }
  };

  // Delete member - UPDATED to use the new endpoint
  const handleDeleteMember = async () => {
    try {
      // Use the new endpoint for club leaders to remove members
      const response = await fetch(`http://127.0.0.1:5000/club/members/${selectedMember.membership_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      showNotification('Member removed successfully!');
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchClubMembers(selectedClub.club_id);
    } catch (err) {
      console.error('Error removing member:', err);
      showNotification(err.message || 'Failed to remove member', 'error');
    }
  };

  // Get club name by ID
  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Unknown Club';
  };

  // Get user full name
  const getUserFullName = (member) => {
    return member ? `${member.first_name} ${member.last_name}` : 'Unknown User';
  };

  // Get user email
  const getUserEmail = (member) => {
    return member ? member.email : 'N/A';
  };

  // Filter members based on search
  const filteredMembers = members.filter(member => {
    const fullName = getUserFullName(member).toLowerCase();
    const email = getUserEmail(member).toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Get available users (not already members)
  const getAvailableUsers = () => {
    const memberIds = members.map(m => m.user_id);
    return allUsers.filter(user => !memberIds.includes(user.id) && user.id !== parseInt(userId));
  };

  if (loading) {
    return (
      <div className="club-members-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading club members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-members-wrapper">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error Loading Data</h3>
          <p className="error-message">{error}</p>
          <button className="error-btn" onClick={fetchData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="club-members-wrapper">
      <div className="club-members-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type === 'error' ? 'notification-error' : 'notification-success'}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="club-members-header">
          <div>
            <h1 className="club-members-title">👥 Club Members</h1>
            <p className="club-members-subtitle">Manage members of your club</p>
          </div>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            + Add Member
          </button>
        </div>

        {/* Club Selector */}
        {clubLeaders.length > 1 && (
          <div className="club-selector-wrapper">
            <label className="club-selector-label">Select Club:</label>
            <select
              value={selectedClub?.club_id || ''}
              onChange={(e) => handleClubChange(parseInt(e.target.value))}
              className="club-selector"
            >
              {clubLeaders.map((leader) => (
                <option key={leader.club_id} value={leader.club_id}>
                  {getClubName(leader.club_id)} ({leader.position})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Club Info */}
        {selectedClub && (
          <div className="club-info-card">
            <div className="club-info-header">
              <h2 className="club-info-name">{getClubName(selectedClub.club_id)}</h2>
              <span className="club-info-position">{selectedClub.position}</span>
            </div>
            <div className="club-info-stats">
              <span className="stat-item">
                <span className="stat-label">Total Members:</span>
                <span className="stat-value">{members.length}</span>
              </span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Members Table */}
        {filteredMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3 className="empty-title">No members found</h3>
            <p className="empty-text">
              {searchTerm ? 'No members match your search criteria.' : 'This club has no members yet.'}
            </p>
          </div>
        ) : (
          <div className="members-table-container">
            <table className="members-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.membership_id}>
                    <td className="member-id">#{member.membership_id}</td>
                    <td className="member-name">
                      <span className="member-initials">
                        {getUserFullName(member).split(' ').map(n => n[0]).join('')}
                      </span>
                      {getUserFullName(member)}
                    </td>
                    <td className="member-email">{getUserEmail(member)}</td>
                    <td className="member-date">
                      {member.join_date ? new Date(member.join_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`member-role ${member.role || 'member'}`}>
                        {member.role || 'Member'}
                      </span>
                    </td>
                    <td className="member-actions">
                      {member.user_id !== parseInt(userId) && (
                        <button 
                          className="btn-remove"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDeleteModal(true);
                          }}
                          title="Remove Member"
                        >
                          🗑️
                        </button>
                      )}
                      {member.user_id === parseInt(userId) && (
                        <span className="self-badge">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== ADD MEMBER MODAL ==================== */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">➕ Add Member</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Select User *</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select a user...</option>
                      {getAvailableUsers().map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                    {getAvailableUsers().length === 0 && (
                      <p className="form-hint">All users are already members of this club.</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Club</label>
                    <div className="form-static-display">
                      <span className="static-icon">🏛️</span>
                      <span>{getClubName(selectedClub.club_id)}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={getAvailableUsers().length === 0}
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== DELETE MEMBER MODAL ==================== */}
        {showDeleteModal && selectedMember && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🗑️ Remove Member</h2>
                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="delete-icon">⚠️</div>
                <p className="delete-text">
                  Are you sure you want to remove <strong>"{getUserFullName(selectedMember)}"</strong> from <strong>"{getClubName(selectedClub.club_id)}"</strong>?
                </p>
                <div className="delete-details">
                  <div className="detail-row">
                    <span className="detail-label">Member:</span>
                    <span className="detail-value">{getUserFullName(selectedMember)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{getUserEmail(selectedMember)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">
                      {selectedMember.join_date ? new Date(selectedMember.join_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{selectedMember.role || 'Member'}</span>
                  </div>
                </div>
                <p className="delete-warning">
                  This action cannot be undone. The user will lose access to this club.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn-delete-confirm" onClick={handleDeleteMember}>
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubMembers;