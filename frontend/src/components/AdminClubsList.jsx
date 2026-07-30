import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminClubsListPage.css';

function AdminClubsList() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meeting_day: '',
    meeting_time: '',
    meeting_location: '',
    email: '',
    faculty_advisor: '',
    max_members: 100
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const adminId = localStorage.getItem('admin_id');

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch clubs
  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:5000/clubs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const data = await response.json();
      setClubs(data);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError('Failed to load clubs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !adminId) {
      navigate('/adminlogin');
      return;
    }
    fetchClubs();
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
      name: '',
      description: '',
      meeting_day: '',
      meeting_time: '',
      meeting_location: '',
      email: '',
      faculty_advisor: '',
      max_members: 100
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (club) => {
    setSelectedClub(club);
    setFormData({
      name: club.name || '',
      description: club.description || '',
      meeting_day: club.meeting_day || '',
      meeting_time: club.meeting_time || '',
      meeting_location: club.meeting_location || '',
      email: club.email || '',
      faculty_advisor: club.faculty_advisor || '',
      max_members: club.max_members || 100
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (club) => {
    setSelectedClub(club);
    setShowDeleteModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedClub(null);
    resetForm();
  };

  // Create club
  const handleCreateClub = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:5000/clubs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create club');
      }

      showNotification('Club created successfully!');
      closeModals();
      fetchClubs();
    } catch (err) {
      console.error('Error creating club:', err);
      showNotification(err.message || 'Failed to create club', 'error');
    }
  };

  // Update club
  const handleUpdateClub = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/clubs/${selectedClub.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update club');
      }

      showNotification('Club updated successfully!');
      closeModals();
      fetchClubs();
    } catch (err) {
      console.error('Error updating club:', err);
      showNotification(err.message || 'Failed to update club', 'error');
    }
  };

  // Delete club
  const handleDeleteClub = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/clubs/${selectedClub.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete club');
      }

      showNotification('Club deleted successfully!');
      closeModals();
      fetchClubs();
    } catch (err) {
      console.error('Error deleting club:', err);
      showNotification(err.message || 'Failed to delete club', 'error');
    }
  };

  // Filter clubs based on search
  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.faculty_advisor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-clubs-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-clubs-wrapper">
      <div className="admin-clubs-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type === 'error' ? 'notification-error' : 'notification-success'}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-clubs-header">
          <div>
            <h1 className="admin-clubs-title">🏛️ Manage Clubs</h1>
            <p className="admin-clubs-subtitle">Create, edit, and manage all clubs on the platform</p>
          </div>
          <button className="btn-create" onClick={openCreateModal}>
            + Create New Club
          </button>
        </div>

        {/* Search Bar */}
        <div className="admin-clubs-search">
          <input
            type="text"
            placeholder="Search clubs by name, description, or advisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No clubs found</h3>
            <p className="empty-text">
              {searchTerm ? 'No clubs match your search criteria.' : 'Create your first club to get started.'}
            </p>
            {!searchTerm && (
              <button className="btn-create-empty" onClick={openCreateModal}>
                Create Club
              </button>
            )}
          </div>
        ) : (
          <div className="clubs-grid">
            {filteredClubs.map((club) => (
              <div key={club.id} className="club-card">
                <div className="club-card-header">
                  <h3 className="club-name">{club.name}</h3>
                  <div className="club-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => openEditModal(club)}
                      title="Edit Club"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => openDeleteModal(club)}
                      title="Delete Club"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="club-description">
                  {club.description?.length > 150 
                    ? club.description.substring(0, 150) + '...' 
                    : club.description || 'No description available'}
                </p>
                <div className="club-details">
                  {club.faculty_advisor && (
                    <span className="club-detail">
                      <span className="detail-icon">👨‍🏫</span>
                      {club.faculty_advisor}
                    </span>
                  )}
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
                  {club.max_members && (
                    <span className="club-detail">
                      <span className="detail-icon">👥</span>
                      Max: {club.max_members}
                    </span>
                  )}
                  <span className={`club-status ${club.is_active ? 'status-active' : 'status-inactive'}`}>
                    {club.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {showCreateModal ? 'Create New Club' : 'Edit Club'}
                </h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={showCreateModal ? handleCreateClub : handleUpdateClub}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Club Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Enter club name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      required
                      rows="3"
                      placeholder="Enter club description"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Meeting Day</label>
                      <select
                        name="meeting_day"
                        value={formData.meeting_day}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Meeting Time</label>
                      <input
                        type="text"
                        name="meeting_time"
                        value={formData.meeting_time}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 4:00 PM - 6:00 PM"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Meeting Location</label>
                    <input
                      type="text"
                      name="meeting_location"
                      value={formData.meeting_location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter meeting location"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="club@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Faculty Advisor</label>
                      <input
                        type="text"
                        name="faculty_advisor"
                        value={formData.faculty_advisor}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter advisor name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Members</label>
                    <input
                      type="number"
                      name="max_members"
                      value={formData.max_members}
                      onChange={handleInputChange}
                      className="form-input"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {showCreateModal ? 'Create Club' : 'Update Club'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedClub && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Delete Club</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <div className="delete-icon">⚠️</div>
                <p className="delete-text">
                  Are you sure you want to delete <strong>"{selectedClub.name}"</strong>?
                </p>
                <p className="delete-warning">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Cancel
                </button>
                <button type="button" className="btn-delete-confirm" onClick={handleDeleteClub}>
                  Delete Club
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClubsList;