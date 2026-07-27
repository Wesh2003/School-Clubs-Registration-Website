// ClubApplications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/ClubApplications.css';  // Add this import

const ClubApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [leaderClubs, setLeaderClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState('');

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchLeaderClubs();
    } else {
      setError('Please log in to view applications');
      setLoading(false);
    }
  }, [token, userId]);

  const fetchLeaderClubs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/dashboard`, axiosConfig);
      
      if (response.data.club_leader_for && response.data.club_leader_for.length > 0) {
        const clubs = response.data.club_leader_for;
        setLeaderClubs(clubs);
        
        if (clubs.length > 0) {
          const clubId = clubs[0].club_id;
          setSelectedClub(clubId);
          await fetchApplications(clubId);
        }
      } else {
        setError('You are not a club leader for any club');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching leader clubs:', err);
      setError('Failed to fetch your clubs. Please try again.');
      setLoading(false);
    }
  };

  const fetchApplications = async (clubId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/clubapplications`, axiosConfig);
      
      const clubApplications = response.data.filter(
        app => app.club_id === clubId
      );
      
      const sortedApplications = clubApplications.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.application_date) - new Date(a.application_date);
      });
      
      setApplications(sortedApplications);
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClubChange = (e) => {
    const clubId = parseInt(e.target.value);
    setSelectedClub(clubId);
    fetchApplications(clubId);
  };

  const handleReviewApplication = async () => {
    if (!selectedApplication || !reviewAction) {
      toast.warning('Please select an action');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/clubapplications/${selectedApplication.id}/review`,
        {
          status: reviewAction,
          review_notes: reviewNotes || `Application ${reviewAction} by club leader.`
        },
        axiosConfig
      );
      
      toast.success(`Application ${reviewAction} successfully!`);
      await fetchApplications(selectedClub);
      setShowReviewModal(false);
      setSelectedApplication(null);
      setReviewNotes('');
      setReviewAction('');
      
    } catch (err) {
      console.error('Error reviewing application:', err);
      toast.error('Failed to review application. Please try again.');
    }
  };

  const openReviewModal = (application, action) => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedApplication(null);
    setReviewNotes('');
    setReviewAction('');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.reason_for_joining?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'status-badge-pending',
      approved: 'status-badge-approved',
      rejected: 'status-badge-rejected'
    };
    return statusMap[status] || 'status-badge-pending';
  };

  if (loading) {
    return (
      <div className="club-applications-wrapper">
        <div className="applications-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-applications-wrapper">
        <div className="applications-container">
          <div className="error-container">
            <h4 className="error-title">Error</h4>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="club-applications-wrapper">
      <div className="applications-container">
        {/* Header Section */}
        <div className="applications-header">
          <h1 className="applications-title">📋 Club Applications</h1>
          <p className="applications-subtitle">
            Review and manage club registration applications
          </p>
        </div>

        {/* Club Selector */}
        {leaderClubs.length > 1 && (
          <div className="club-selector-wrapper">
            <label htmlFor="club-select" className="club-selector-label">
              Select Club
            </label>
            <select
              id="club-select"
              value={selectedClub || ''}
              onChange={handleClubChange}
              className="club-selector"
            >
              {leaderClubs.map((club) => (
                <option key={club.club_id} value={club.club_id}>
                  {club.club?.name || `Club ${club.club_id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Statistics Cards */}
        {applications.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card stat-card-total">
              <p className="stat-label stat-label-total">Total Applications</p>
              <p className="stat-value stat-value-total">{stats.total}</p>
            </div>
            <div className="stat-card stat-card-pending">
              <p className="stat-label stat-label-pending">Pending</p>
              <p className="stat-value stat-value-pending">{stats.pending}</p>
            </div>
            <div className="stat-card stat-card-approved">
              <p className="stat-label stat-label-approved">Approved</p>
              <p className="stat-value stat-value-approved">{stats.approved}</p>
            </div>
            <div className="stat-card stat-card-rejected">
              <p className="stat-label stat-label-rejected">Rejected</p>
              <p className="stat-value stat-value-rejected">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="search-filter-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by applicant name, skills, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-wrapper">
            <label htmlFor="status-filter" className="filter-label">
              Status:
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="empty-title">No applications</h3>
            <p className="empty-text">
              No one has applied to this club yet.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No applications match your search criteria.</p>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-card-header">
                  <h3 className="applicant-name">
                    {application.applicant_name || 'Unknown Applicant'}
                  </h3>
                  <span className={`status-badge ${getStatusBadge(application.status)}`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="application-details">
                  <div className="application-detail-item">
                    <strong>Applied:</strong>
                    <span style={{ marginLeft: '8px', color: '#666' }}>
                      {formatDate(application.application_date)}
                    </span>
                  </div>
                  
                  {application.reason_for_joining && (
                    <div>
                      <strong style={{ color: '#444', fontSize: '0.95rem' }}>Reason for joining:</strong>
                      <div className="application-reason">
                        {application.reason_for_joining}
                      </div>
                    </div>
                  )}
                  
                  {application.skills && (
                    <div>
                      <strong style={{ color: '#444', fontSize: '0.95rem' }}>Skills/Experience:</strong>
                      <div className="application-skills">
                        {application.skills}
                      </div>
                    </div>
                  )}
                  
                  {application.status !== 'pending' && (
                    <div className="application-review-section">
                      <div className="application-review-notes">
                        <strong>Review Notes:</strong>
                        <span style={{ marginLeft: '8px', color: '#555' }}>
                          {application.review_notes || 'No notes provided'}
                        </span>
                      </div>
                      {application.review_date && (
                        <div className="application-review-date">
                          Reviewed on: {formatDate(application.review_date)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {application.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      onClick={() => openReviewModal(application, 'approved')}
                      className="btn-accept"
                    >
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </button>
                    <button
                      onClick={() => openReviewModal(application, 'rejected')}
                      className="btn-reject"
                    >
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">
                {reviewAction === 'approved' ? '✅ Accept' : '❌ Reject'} Application
              </h3>
              <p className="modal-subtitle">
                Review application from{' '}
                <span className="modal-applicant-name">
                  {selectedApplication.applicant_name}
                </span>
              </p>

              <div className="modal-details-box">
                <div className="modal-detail-label">Reason for joining:</div>
                <div className="modal-detail-text">
                  {selectedApplication.reason_for_joining || 'Not provided'}
                </div>
                {selectedApplication.skills && (
                  <>
                    <div className="modal-detail-label" style={{ marginTop: '12px' }}>Skills:</div>
                    <div className="modal-detail-text">
                      {selectedApplication.skills}
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="review-notes" style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '6px', fontSize: '0.95rem' }}>
                  Review Notes <span style={{ color: '#aaa', fontWeight: '400' }}>(optional)</span>
                </label>
                <textarea
                  id="review-notes"
                  rows="3"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  className="modal-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={closeReviewModal}
                  className="modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewApplication}
                  className={reviewAction === 'approved' ? 'modal-btn-accept' : 'modal-btn-reject'}
                >
                  {reviewAction === 'approved' ? 'Accept Application' : 'Reject Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubApplications;