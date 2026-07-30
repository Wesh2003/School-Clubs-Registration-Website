import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminSiteUsers.css';

function AdminSiteUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusAction, setStatusAction] = useState(''); // 'activate' or 'deactivate'
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const adminId = localStorage.getItem('admin_id');

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:5000/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users:', data); // Debug log
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !adminId) {
      navigate('/adminlogin');
      return;
    }
    fetchUsers();
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
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Open status modal
  const openStatusModal = (user, action) => {
    console.log('Opening status modal:', { user, action });
    setSelectedUser(user);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setShowStatusModal(false);
    setSelectedUser(null);
    setStatusAction('');
    resetForm();
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (formData.password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/userregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      showNotification('User created successfully!');
      closeModals();
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      showNotification(err.message || 'Failed to create user', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      showNotification('User deleted successfully!');
      closeModals();
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };

  // Toggle user status (activate/deactivate)
  const handleToggleStatus = async () => {
    try {
      console.log('Status Action:', statusAction);
      console.log('Selected User:', selectedUser);
      
      const endpoint = statusAction === 'activate' 
        ? `http://127.0.0.1:5000/admin/users/${selectedUser.id}/activate`
        : `http://127.0.0.1:5000/admin/users/${selectedUser.id}/deactivate`;

      console.log('Endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${statusAction} user`);
      }

      showNotification(`User ${statusAction}d successfully!`);
      closeModals();
      
      // Force refresh the user list after a small delay
      setTimeout(() => {
        fetchUsers();
      }, 500);
      
    } catch (err) {
      console.error('Error toggling user status:', err);
      showNotification(err.message || `Failed to ${statusAction} user`, 'error');
    }
  };

  // Debug function to check user status
  const debugUserStatus = (user) => {
    console.log('Debug User Data:', {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      is_active: user.is_active,
      is_active_type: typeof user.is_active,
      full_user: user
    });
    alert(`User: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nStatus: ${user.is_active !== false ? '🟢 Active' : '🔴 Inactive'}\nis_active value: ${user.is_active}`);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-users-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-wrapper">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error Loading Users</h3>
          <p className="error-message">{error}</p>
          <button className="error-btn" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-wrapper">
      <div className="admin-users-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type === 'error' ? 'notification-error' : 'notification-success'}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-users-header">
          <div>
            <h1 className="admin-users-title">👥 Manage Users</h1>
            <p className="admin-users-subtitle">View, create, and manage all users on the platform</p>
          </div>
          <button className="btn-create" onClick={openCreateModal}>
            + Create New User
          </button>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.is_active !== false).length}</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.is_active === false).length}</span>
            <span className="stat-label">Inactive Users</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="admin-users-search">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3 className="empty-title">No users found</h3>
            <p className="empty-text">
              {searchTerm ? 'No users match your search criteria.' : 'Create your first user to get started.'}
            </p>
            {!searchTerm && (
              <button className="btn-create-empty" onClick={openCreateModal}>
                Create User
              </button>
            )}
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Member Since</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={user.is_active === false ? 'user-inactive-row' : ''}>
                    <td className="user-id">#{user.id}</td>
                    <td className="user-name">
                      <span className={`user-initials ${user.is_active === false ? 'initials-inactive' : ''}`}>
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                      {user.first_name} {user.last_name}
                      {user.is_active === false && (
                        <span className="inactive-badge">Inactive</span>
                      )}
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-date">
                      {user.date_added ? new Date(user.date_added).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`user-status ${user.is_active !== false ? 'status-active' : 'status-inactive'}`}>
                        {user.is_active !== false ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td className="user-actions">
                      {user.id !== parseInt(adminId) && (
                        <>
                          {/* Debug Button */}
                          {/* <button 
                            className="btn-debug"
                            onClick={() => debugUserStatus(user)}
                            title="Debug User Status"
                          >
                            🐛
                          </button> */}
                          
                          {user.is_active !== false ? (
                            <button 
                              className="btn-deactivate"
                              onClick={() => openStatusModal(user, 'deactivate')}
                              title="Deactivate User"
                            >
                              🔒
                            </button>
                          ) : (
                            <button 
                              className="btn-activate"
                              onClick={() => openStatusModal(user, 'activate')}
                              title="Activate User"
                            >
                              🔓
                            </button>
                          )}
                          <button 
                            className="btn-delete"
                            onClick={() => openDeleteModal(user)}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      {user.id === parseInt(adminId) && (
                        <span className="self-badge">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New User</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Min 6 characters"
                      minLength="6"
                    />
                    <span className="form-hint">Password must be at least 6 characters long</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedUser && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Delete User</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <div className="delete-icon">⚠️</div>
                <p className="delete-text">
                  Are you sure you want to delete user <strong>"{selectedUser.first_name} {selectedUser.last_name}"</strong>?
                </p>
                <p className="delete-warning">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Cancel
                </button>
                <button type="button" className="btn-delete-confirm" onClick={handleDeleteUser}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Toggle Modal */}
        {showStatusModal && selectedUser && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {statusAction === 'activate' ? 'Activate' : 'Deactivate'} User
                </h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <div className="status-icon">
                  {statusAction === 'activate' ? '✅' : '🔒'}
                </div>
                <p className="status-text">
                  Are you sure you want to <strong>{statusAction}</strong> user <strong>"{selectedUser.first_name} {selectedUser.last_name}"</strong>?
                </p>
                <p className="status-warning">
                  {statusAction === 'activate' 
                    ? 'This will allow the user to log in and access the platform.' 
                    : 'This will prevent the user from logging in and accessing the platform.'}
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
                  {statusAction === 'activate' ? 'Activate User' : 'Deactivate User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSiteUsers;