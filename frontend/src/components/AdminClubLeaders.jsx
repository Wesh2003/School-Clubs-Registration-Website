import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminClubLeaders.css';

function AdminClubLeaders() {
  const [clubLeaders, setClubLeaders] = useState([]);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [statusAction, setStatusAction] = useState(''); // 'activate' or 'deactivate'
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    club_id: '',
    position: 'President',
    term_end: ''
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const adminId = localStorage.getItem('admin_id');

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch club leaders
      const leadersResponse = await fetch('http://127.0.0.1:5000/clubleaders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!leadersResponse.ok) {
        const errorData = await leadersResponse.json();
        throw new Error(errorData.error || 'Failed to fetch club leaders');
      }

      const leadersData = await leadersResponse.json();
      setClubLeaders(leadersData);

      // Fetch users for dropdown
      const usersResponse = await fetch('http://127.0.0.1:5000/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch clubs for dropdown
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

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !adminId) {
      navigate('/adminlogin');
      return;
    }
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      user_id: '',
      club_id: '',
      position: 'President',
      term_end: ''
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (leader) => {
    setSelectedLeader(leader);
    setFormData({
      user_id: leader.user_id,
      club_id: leader.club_id,
      position: leader.position || 'President',
      term_end: leader.term_end ? leader.term_end.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (leader) => {
    setSelectedLeader(leader);
    setShowDeleteModal(true);
  };

  // Open status modal
  const openStatusModal = (leader, action) => {
    setSelectedLeader(leader);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowStatusModal(false);
    setSelectedLeader(null);
    setStatusAction('');
    resetForm();
  };

  // Create club leader
  const handleCreateLeader = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:5000/clubleaderregister', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(formData.user_id),
          club_id: parseInt(formData.club_id),
          position: formData.position,
          term_end: formData.term_end || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create club leader');
      }

      showNotification('Club leader created successfully!');
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error creating club leader:', err);
      showNotification(err.message || 'Failed to create club leader', 'error');
    }
  };

  // Update club leader
  const handleUpdateLeader = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/clubleaders/${selectedLeader.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          position: formData.position,
          term_end: formData.term_end || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update club leader');
      }

      showNotification('Club leader updated successfully!');
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error updating club leader:', err);
      showNotification(err.message || 'Failed to update club leader', 'error');
    }
  };

  // Delete club leader
  const handleDeleteLeader = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/clubleaders/${selectedLeader.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete club leader');
      }

      showNotification('Club leader deleted successfully!');
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error deleting club leader:', err);
      showNotification(err.message || 'Failed to delete club leader', 'error');
    }
  };

  // Toggle leader status (activate/deactivate)
  const handleToggleStatus = async () => {
    try {
      const endpoint = statusAction === 'activate' 
        ? `http://127.0.0.1:5000/clubleaders/${selectedLeader.id}/activate`
        : `http://127.0.0.1:5000/clubleaders/${selectedLeader.id}/deactivate`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${statusAction} club leader`);
      }

      showNotification(`Club leader ${statusAction}d successfully!`);
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error toggling leader status:', err);
      showNotification(err.message || `Failed to ${statusAction} club leader`, 'error');
    }
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  // Get club name by ID
  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Unknown Club';
  };

  // Get user email by ID
  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'N/A';
  };

  // Filter leaders based on search
  const filteredLeaders = clubLeaders.filter(leader => {
    const userName = getUserName(leader.user_id).toLowerCase();
    const clubName = getClubName(leader.club_id).toLowerCase();
    const position = leader.position?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return userName.includes(search) || 
           clubName.includes(search) || 
           position.includes(search);
  });

  if (loading) {
    return (
      <div className="admin-leaders-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading club leaders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-leaders-wrapper">
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
    <div className="admin-leaders-wrapper">
      <div className="admin-leaders-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type === 'error' ? 'notification-error' : 'notification-success'}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-leaders-header">
          <div>
            <h1 className="admin-leaders-title">👔 Manage Club Leaders</h1>
            <p className="admin-leaders-subtitle">View, create, and manage all club leaders on the platform</p>
          </div>
          <button className="btn-create" onClick={openCreateModal}>
            + Assign Club Leader
          </button>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-number">{clubLeaders.length}</span>
            <span className="stat-label">Total Leaders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{clubLeaders.filter(l => l.is_current !== false).length}</span>
            <span className="stat-label">Active Leaders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{clubLeaders.filter(l => l.is_current === false).length}</span>
            <span className="stat-label">Inactive Leaders</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="admin-leaders-search">
          <input
            type="text"
            placeholder="Search by leader name, club, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Leaders Table */}
        {filteredLeaders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👔</div>
            <h3 className="empty-title">No club leaders found</h3>
            <p className="empty-text">
              {searchTerm ? 'No leaders match your search criteria.' : 'Assign your first club leader to get started.'}
            </p>
            {!searchTerm && (
              <button className="btn-create-empty" onClick={openCreateModal}>
                Assign Club Leader
              </button>
            )}
          </div>
        ) : (
          <div className="leaders-table-container">
            <table className="leaders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Leader</th>
                  <th>Club</th>
                  <th>Position</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaders.map((leader) => (
                  <tr key={leader.id} className={leader.is_current === false ? 'leader-inactive-row' : ''}>
                    <td className="leader-id">#{leader.id}</td>
                    <td className="leader-name">
                      <span className={`leader-initials ${leader.is_current === false ? 'initials-inactive' : ''}`}>
                        {getUserName(leader.user_id).split(' ').map(n => n[0]).join('')}
                      </span>
                      <div>
                        <div className="leader-full-name">{getUserName(leader.user_id)}</div>
                        <div className="leader-email">{getUserEmail(leader.user_id)}</div>
                      </div>
                    </td>
                    <td className="leader-club">{getClubName(leader.club_id)}</td>
                    <td className="leader-position">
                      <span className={`position-badge ${leader.position?.toLowerCase() || ''}`}>
                        {leader.position || 'N/A'}
                      </span>
                    </td>
                    <td className="leader-date">
                      {leader.assigned_date ? new Date(leader.assigned_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`leader-status ${leader.is_current !== false ? 'status-active' : 'status-inactive'}`}>
                        {leader.is_current !== false ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td className="leader-actions">
                      <>
                        <button 
                          className="btn-edit"
                          onClick={() => openEditModal(leader)}
                          title="Edit Leader"
                        >
                          ✏️
                        </button>
                        {leader.is_current !== false ? (
                          <button 
                            className="btn-deactivate"
                            onClick={() => openStatusModal(leader, 'deactivate')}
                            title="Deactivate Leader"
                          >
                            🔒
                          </button>
                        ) : (
                          <button 
                            className="btn-activate"
                            onClick={() => openStatusModal(leader, 'activate')}
                            title="Activate Leader"
                          >
                            🔓
                          </button>
                        )}
                        <button 
                          className="btn-delete"
                          onClick={() => openDeleteModal(leader)}
                          title="Delete Leader"
                        >
                          🗑️
                        </button>
                      </>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== CREATE MODAL ==================== */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">➕ Assign Club Leader</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleCreateLeader}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">User *</label>
                    <select
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a user...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Club *</label>
                    <select
                      name="club_id"
                      value={formData.club_id}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a club...</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Position *</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Term End Date</label>
                    <input
                      type="date"
                      name="term_end"
                      value={formData.term_end}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <span className="form-hint">Optional: Leave blank for no end date</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Assign Leader
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== EDIT MODAL ==================== */}
        {showEditModal && selectedLeader && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">✏️ Edit Club Leader</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleUpdateLeader}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Leader</label>
                    <div className="form-static-display">
                      <span className="static-icon">👤</span>
                      <span>{getUserName(selectedLeader.user_id)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Club</label>
                    <div className="form-static-display">
                      <span className="static-icon">🏛️</span>
                      <span>{getClubName(selectedLeader.club_id)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Position *</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Term End Date</label>
                    <input
                      type="date"
                      name="term_end"
                      value={formData.term_end}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <span className="form-hint">Optional: Leave blank for no end date</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Update Leader
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== DELETE MODAL ==================== */}
        {showDeleteModal && selectedLeader && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🗑️ Remove Club Leader</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <div className="delete-icon">⚠️</div>
                <p className="delete-text">
                  Are you sure you want to remove <strong>"{getUserName(selectedLeader.user_id)}"</strong> as a leader of <strong>"{getClubName(selectedLeader.club_id)}"</strong>?
                </p>
                <div className="delete-details">
                  <div className="detail-row">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">{selectedLeader.position || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${selectedLeader.is_current !== false ? 'text-active' : 'text-inactive'}`}>
                      {selectedLeader.is_current !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p className="delete-warning">
                  This action cannot be undone. The user will lose their leadership privileges.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Cancel
                </button>
                <button type="button" className="btn-delete-confirm" onClick={handleDeleteLeader}>
                  Remove Leader
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STATUS MODAL (Activate/Deactivate) ==================== */}
        {showStatusModal && selectedLeader && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {statusAction === 'activate' ? '🔓 Activate' : '🔒 Deactivate'} Club Leader
                </h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <div className="status-icon">
                  {statusAction === 'activate' ? '✅' : '🔒'}
                </div>
                <p className="status-text">
                  Are you sure you want to <strong>{statusAction}</strong> <strong>"{getUserName(selectedLeader.user_id)}"</strong> as a leader of <strong>"{getClubName(selectedLeader.club_id)}"</strong>?
                </p>
                <div className="status-details">
                  <div className="detail-row">
                    <span className="detail-label">Current Status:</span>
                    <span className={`detail-value ${selectedLeader.is_current !== false ? 'text-active' : 'text-inactive'}`}>
                      {selectedLeader.is_current !== false ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">{selectedLeader.position || 'N/A'}</span>
                  </div>
                </div>
                <p className="status-warning">
                  {statusAction === 'activate' 
                    ? 'This will restore the leader\'s privileges and allow them to manage the club.' 
                    : 'This will suspend the leader\'s privileges and prevent them from managing the club.'}
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={statusAction === 'activate' ? 'btn-activate-confirm' : 'btn-deactivate-confirm'} 
                  onClick={handleToggleStatus}
                >
                  {statusAction === 'activate' ? 'Activate Leader' : 'Deactivate Leader'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClubLeaders;