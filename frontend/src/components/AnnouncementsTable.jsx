// AnnouncementsTable.jsx
import React, { useState, useEffect } from 'react';
import '../css/AnnouncementsTable.css';  // Add this import

const AnnouncementsTable = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [notification, setNotification] = useState(null);

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('user_role');

  const fetchWithAuth = async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!token) {
      setError('Please log in to view announcements');
      setLoading(false);
      return;
    }
    fetchAnnouncements();
  }, [token]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWithAuth(`http://localhost:5000/announcements`);
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to fetch announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      const response = await fetch(
        `http://localhost:5000/announcements/${selectedAnnouncement.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }
      
      showNotification('Announcement deleted successfully!');
      await fetchAnnouncements();
      setShowDeleteModal(false);
      setSelectedAnnouncement(null);
      
    } catch (err) {
      console.error('Error deleting announcement:', err);
      showNotification('Failed to delete announcement. Please try again.', 'error');
    }
  };

  const openDeleteModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedAnnouncement(null);
  };

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

  const getTypeBadge = (isGlobal, isPinned) => {
    if (isGlobal) return 'badge-global';
    return isPinned ? 'badge-pinned' : 'badge-normal';
  };

  const getTypeLabel = (isGlobal, isPinned) => {
    if (isGlobal) return 'Global';
    return isPinned ? 'Pinned' : 'Club';
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.posted_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'global' && announcement.is_global) ||
                       (filterType === 'club' && !announcement.is_global);
    
    return matchesSearch && matchesType;
  });

  const canDelete = (announcement) => {
    if (userRole === 'admin') return true;
    return announcement.posted_by === parseInt(userId);
  };

  if (loading) {
    return (
      <div className="announcements-wrapper">
        <div className="announcements-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcements-wrapper">
        <div className="announcements-container">
          <div className="error-container">
            <h4 className="error-title">Error</h4>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-wrapper">
      <div className="announcements-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${
            notification.type === 'error' ? 'notification-error' : 'notification-success'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Header Section */}
        <div className="announcements-header">
          <h1 className="announcements-title">📢 Announcements</h1>
          <p className="announcements-subtitle">
            View all announcements from clubs and administrators
          </p>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search announcements by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-wrapper">
            <label htmlFor="type-filter" className="filter-label">
              Type:
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="global">Global</option>
              <option value="club">Club Specific</option>
            </select>
          </div>
        </div>

        {/* Announcements Grid */}
        {announcements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="empty-title">No announcements</h3>
            <p className="empty-text">
              No announcements have been posted yet.
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No announcements match your search criteria.</p>
          </div>
        ) : (
          <div className="announcements-grid">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`announcement-card ${
                  announcement.is_pinned ? 'announcement-card-pinned' : ''
                }`}
              >
                <div className="announcement-card-header">
                  <div className="announcement-title-section">
                    <h3 className="announcement-title">
                      {announcement.title}
                    </h3>
                    <div className="announcement-badges">
                      <span className={`badge ${getTypeBadge(announcement.is_global, announcement.is_pinned)}`}>
                        {getTypeLabel(announcement.is_global, announcement.is_pinned)}
                      </span>
                      {announcement.is_pinned && !announcement.is_global && (
                        <span className="badge badge-pinned">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {canDelete(announcement) && (
                    <div className="announcement-actions">
                      <button
                        onClick={() => openDeleteModal(announcement)}
                        className="delete-btn"
                        title="Delete announcement"
                      >
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="announcement-content">
                  {announcement.content}
                </div>
                
                <div className="announcement-meta">
                  {announcement.club_name && (
                    <span className="announcement-meta-item">
                      <strong>Club:</strong>
                      {announcement.club_name}
                    </span>
                  )}
                  <span className="announcement-meta-item">
                    <strong>Posted by:</strong>
                    {announcement.posted_by_name || 'Unknown'}
                  </span>
                  <span className="announcement-meta-item">
                    <strong>Date:</strong>
                    {formatDate(announcement.posted_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedAnnouncement && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-icon-wrapper">
                <svg
                  className="modal-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="modal-title">Delete Announcement</h3>
              <p className="modal-text">
                Are you sure you want to delete the announcement "{selectedAnnouncement.title}"?
              </p>
              <p className="modal-text modal-text-danger">
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={closeDeleteModal}
                  className="modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAnnouncement}
                  className="modal-btn-delete"
                >
                  Delete Announcement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsTable;