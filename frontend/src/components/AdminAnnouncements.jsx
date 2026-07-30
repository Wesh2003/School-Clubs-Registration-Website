import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminAnnouncements.css';

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    club_id: '',
    is_global: false,
    is_pinned: false
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const adminId = localStorage.getItem('admin_id');

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
      
      // Fetch announcements
      const announcementsResponse = await fetch('http://127.0.0.1:5000/announcements', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!announcementsResponse.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const announcementsData = await announcementsResponse.json();
      setAnnouncements(announcementsData);

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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      club_id: '',
      is_global: false,
      is_pinned: false
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      club_id: announcement.club_id || '',
      is_global: announcement.is_global || false,
      is_pinned: announcement.is_pinned || false
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedAnnouncement(null);
    resetForm();
  };

  // Create announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        is_global: formData.is_global,
        is_pinned: formData.is_pinned
      };

      // If not global, include club_id
      if (!formData.is_global && formData.club_id) {
        payload.club_id = parseInt(formData.club_id);
      }

      const response = await fetch('http://127.0.0.1:5000/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create announcement');
      }

      showNotification('Announcement created successfully!');
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error creating announcement:', err);
      showNotification(err.message || 'Failed to create announcement', 'error');
    }
  };

  // Update announcement
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        is_global: formData.is_global,
        is_pinned: formData.is_pinned
      };

      // If not global, include club_id
      if (!formData.is_global && formData.club_id) {
        payload.club_id = parseInt(formData.club_id);
      }

      console.log('Updating announcement with payload:', payload);

      const response = await fetch(`http://127.0.0.1:5000/announcements/${selectedAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to update announcement');
        } catch (parseError) {
          throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      console.log('Update successful:', data);

      showNotification('Announcement updated successfully!');
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error updating announcement:', err);
      showNotification(err.message || 'Failed to update announcement', 'error');
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/announcements/${selectedAnnouncement.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete announcement');
      }

      showNotification('Announcement deleted successfully!');
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      showNotification(err.message || 'Failed to delete announcement', 'error');
    }
  };

  // Get club name by ID
  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Unknown Club';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.club_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'global' && announcement.is_global) ||
                       (filterType === 'club' && !announcement.is_global);
    
    return matchesSearch && matchesType;
  });

  // Get stats
  const stats = {
    total: announcements.length,
    global: announcements.filter(a => a.is_global).length,
    club: announcements.filter(a => !a.is_global).length,
    pinned: announcements.filter(a => a.is_pinned).length
  };

  if (loading) {
    return (
      <div className="admin-announcements-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-announcements-wrapper">
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
    <div className="admin-announcements-wrapper">
      <div className="admin-announcements-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type === 'error' ? 'notification-error' : 'notification-success'}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-announcements-header">
          <div>
            <h1 className="admin-announcements-title">📢 Manage Announcements</h1>
            <p className="admin-announcements-subtitle">Create and manage global and club-specific announcements</p>
          </div>
          <button className="btn-create" onClick={openCreateModal}>
            + Create Announcement
          </button>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Announcements</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.global}</span>
            <span className="stat-label">Global</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.club}</span>
            <span className="stat-label">Club Specific</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.pinned}</span>
            <span className="stat-label">Pinned</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filter-wrapper">
            <label className="filter-label">Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="global">Global Only</option>
              <option value="club">Club Specific</option>
            </select>
          </div>
        </div>

        {/* Announcements Grid */}
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No announcements found</h3>
            <p className="empty-text">
              {searchTerm ? 'No announcements match your search criteria.' : 'Create your first announcement to get started.'}
            </p>
            {!searchTerm && (
              <button className="btn-create-empty" onClick={openCreateModal}>
                Create Announcement
              </button>
            )}
          </div>
        ) : (
          <div className="announcements-grid">
            {filteredAnnouncements.map((announcement) => (
              <div 
                key={announcement.id} 
                className={`announcement-card ${announcement.is_pinned ? 'card-pinned' : ''}`}
              >
                <div className="announcement-card-header">
                  <div className="announcement-title-section">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <div className="announcement-badges">
                      <span className={`badge ${announcement.is_global ? 'badge-global' : 'badge-club'}`}>
                        {announcement.is_global ? '🌍 Global' : '🏛️ Club'}
                      </span>
                      {announcement.is_pinned && (
                        <span className="badge badge-pinned">📌 Pinned</span>
                      )}
                      {!announcement.is_global && announcement.club_name && (
                        <span className="badge badge-club-name">{announcement.club_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => openEditModal(announcement)}
                      title="Edit Announcement"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => openDeleteModal(announcement)}
                      title="Delete Announcement"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="announcement-content">{announcement.content}</p>
                <div className="announcement-meta">
                  <span>
                    <span className="meta-label">Posted by:</span>
                    {announcement.posted_by_name || 'Admin'}
                  </span>
                  <span>
                    <span className="meta-label">Date:</span>
                    {formatDate(announcement.posted_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== CREATE MODAL ==================== */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">✏️ Create Announcement</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleCreateAnnouncement}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Content *</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      className="form-textarea"
                      required
                      rows="5"
                      placeholder="Enter announcement content"
                    />
                  </div>

                  <div className="form-checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        name="is_global"
                        checked={formData.is_global}
                        onChange={handleInputChange}
                        className="form-checkbox"
                        id="is_global"
                      />
                      <label className="checkbox-label" htmlFor="is_global">
                        🌍 Global Announcement (visible to all users)
                      </label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        name="is_pinned"
                        checked={formData.is_pinned}
                        onChange={handleInputChange}
                        className="form-checkbox"
                        id="is_pinned"
                      />
                      <label className="checkbox-label" htmlFor="is_pinned">
                        📌 Pin Announcement
                      </label>
                    </div>
                  </div>

                  {!formData.is_global && (
                    <div className="form-group">
                      <label className="form-label">Select Club *</label>
                      <select
                        name="club_id"
                        value={formData.club_id}
                        onChange={handleInputChange}
                        className="form-select"
                        required={!formData.is_global}
                      >
                        <option value="">Select a club...</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Create Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== EDIT MODAL ==================== */}
        {showEditModal && selectedAnnouncement && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">✏️ Edit Announcement</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleUpdateAnnouncement}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Content *</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      className="form-textarea"
                      required
                      rows="5"
                      placeholder="Enter announcement content"
                    />
                  </div>

                  <div className="form-checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        name="is_global"
                        checked={formData.is_global}
                        onChange={handleInputChange}
                        className="form-checkbox"
                        id="edit_is_global"
                      />
                      <label className="checkbox-label" htmlFor="edit_is_global">
                        🌍 Global Announcement (visible to all users)
                      </label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        name="is_pinned"
                        checked={formData.is_pinned}
                        onChange={handleInputChange}
                        className="form-checkbox"
                        id="edit_is_pinned"
                      />
                      <label className="checkbox-label" htmlFor="edit_is_pinned">
                        📌 Pin Announcement
                      </label>
                    </div>
                  </div>

                  {!formData.is_global && (
                    <div className="form-group">
                      <label className="form-label">Select Club *</label>
                      <select
                        name="club_id"
                        value={formData.club_id}
                        onChange={handleInputChange}
                        className="form-select"
                        required={!formData.is_global}
                      >
                        <option value="">Select a club...</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedAnnouncement.is_global && (
                    <div className="form-static-info">
                      <span className="static-icon">ℹ️</span>
                      <span>This is a global announcement. It will be visible to all users.</span>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Update Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== DELETE MODAL ==================== */}
        {showDeleteModal && selectedAnnouncement && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🗑️ Delete Announcement</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <div className="delete-icon">⚠️</div>
                <p className="delete-text">
                  Are you sure you want to delete the announcement <strong>"{selectedAnnouncement.title}"</strong>?
                </p>
                <div className="delete-details">
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {selectedAnnouncement.is_global ? '🌍 Global' : '🏛️ Club Specific'}
                    </span>
                  </div>
                  {!selectedAnnouncement.is_global && selectedAnnouncement.club_name && (
                    <div className="detail-row">
                      <span className="detail-label">Club:</span>
                      <span className="detail-value">{selectedAnnouncement.club_name}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Pinned:</span>
                    <span className="detail-value">{selectedAnnouncement.is_pinned ? '📌 Yes' : 'No'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Posted:</span>
                    <span className="detail-value">{formatDate(selectedAnnouncement.posted_date)}</span>
                  </div>
                </div>
                <p className="delete-warning">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Cancel
                </button>
                <button type="button" className="btn-delete-confirm" onClick={handleDeleteAnnouncement}>
                  Delete Announcement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnnouncements;