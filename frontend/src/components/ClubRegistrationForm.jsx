import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/ClubsRegistrationForm.css'; // Updated import

function ClubRegistrationForm() {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        club_id: '',
        name: '',
        email: '',
        phone: '',
        reason_for_joining: '',
        skills: '',
        availability: '',
        experience: ''
    });
    const [errors, setErrors] = useState({});

    // Fetch clubs for dropdown
    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/clubs');
            if (!response.ok) {
                throw new Error('Failed to fetch clubs');
            }
            const data = await response.json();
            setClubs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching clubs:', error);
            setError('Failed to load clubs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.club_id) newErrors.club_id = 'Please select a club';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.reason_for_joining.trim()) newErrors.reason_for_joining = 'Please tell us why you want to join';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setError('Please log in first to apply for clubs.');
                setSubmitting(false);
                return;
            }

            const applicationData = {
                club_id: parseInt(formData.club_id),
                reason_for_joining: formData.reason_for_joining,
                skills: `Phone: ${formData.phone}\nAvailability: ${formData.availability}\nExperience: ${formData.experience}`
            };

            const response = await fetch('http://127.0.0.1:5000/clubapplications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(applicationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit application');
            }

            const result = await response.json();
            console.log('Application submitted:', result);
            
            setFormData({
                club_id: '',
                name: '',
                email: '',
                phone: '',
                reason_for_joining: '',
                skills: '',
                availability: '',
                experience: ''
            });
            
            setSuccessMessage('Your application has been submitted successfully! You will be notified once it is reviewed.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error submitting application:', error);
            setError(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedClub = clubs.find(club => club.id === parseInt(formData.club_id));

    return (
        <div className="club-registration-wrapper">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="registration-card card shadow-sm">
                            <div className="card-header">
                                <h2 className="mb-0">Club Registration Form</h2>
                                <p className="mb-0 small">Join a club and become part of our community</p>
                            </div>
                            
                            <div className="card-body p-4">
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                                        <h5 className="alert-heading">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            Application Submitted!
                                        </h5>
                                        <p>{successMessage}</p>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setSuccessMessage('')}
                                        ></button>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <h5 className="alert-heading">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            Error
                                        </h5>
                                        <p>{error}</p>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setError(null)}
                                        ></button>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p className="loading-text">Loading available clubs...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {/* Club Selection */}
                                        <div className="mb-4">
                                            <h5 className="section-header">Select a Club</h5>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">Choose a Club *</Form.Label>
                                                <select
                                                    className={`form-select form-select-lg ${errors.club_id ? 'is-invalid' : ''}`}
                                                    name="club_id"
                                                    value={formData.club_id}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">-- Select a club --</option>
                                                    {clubs.map(club => (
                                                        <option key={club.id} value={club.id}>
                                                            {club.name} {club.category ? `(${club.category})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.club_id && (
                                                    <div className="invalid-feedback">{errors.club_id}</div>
                                                )}
                                            </Form.Group>

                                            {/* Show selected club details */}
                                            {selectedClub && (
                                                <div className="club-details-preview">
                                                    <h6 className="card-title">{selectedClub.name}</h6>
                                                    <p className="card-text">
                                                        <strong>Description:</strong> {selectedClub.description}
                                                    </p>
                                                    <div className="detail-row">
                                                        <div className="detail-item">
                                                            <strong>Meeting Day:</strong> {selectedClub.meeting_day || 'Not specified'}
                                                        </div>
                                                        <div className="detail-item">
                                                            <strong>Meeting Time:</strong> {selectedClub.meeting_time || 'Not specified'}
                                                        </div>
                                                        <div className="detail-item">
                                                            <strong>Location:</strong> {selectedClub.meeting_location || 'Not specified'}
                                                        </div>
                                                        <div className="detail-item">
                                                            <strong>Faculty Advisor:</strong> {selectedClub.faculty_advisor || 'Not specified'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <hr className="form-divider" />

                                        {/* Personal Information */}
                                        <h5 className="section-header">Personal Information</h5>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Full Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                isInvalid={!!errors.name}
                                                className="form-control-lg"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Email Address *</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="Enter your email"
                                                        isInvalid={!!errors.email}
                                                        className="form-control-lg"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Phone Number *</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Enter your phone number"
                                                        isInvalid={!!errors.phone}
                                                        className="form-control-lg"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <hr className="form-divider" />

                                        {/* Application Details */}
                                        <h5 className="section-header">Application Details</h5>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Why do you want to join this club? *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                name="reason_for_joining"
                                                value={formData.reason_for_joining}
                                                onChange={handleChange}
                                                placeholder="Tell us why you're interested in joining this club..."
                                                isInvalid={!!errors.reason_for_joining}
                                                className="form-control-lg"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.reason_for_joining}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Relevant Skills & Experience</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="skills"
                                                value={formData.skills}
                                                onChange={handleChange}
                                                placeholder="What skills or experience would you bring to the club?"
                                                className="form-control-lg"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Availability</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="availability"
                                                value={formData.availability}
                                                onChange={handleChange}
                                                placeholder="When are you available for club activities? (e.g., Weekends, Evenings, etc.)"
                                                className="form-control-lg"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Additional Experience (Optional)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                placeholder="Any other relevant experience or information you'd like to share"
                                                className="form-control-lg"
                                            />
                                        </Form.Group>

                                        {/* Submit Buttons */}
                                        <div className="button-group">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Application'
                                                )}
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary btn-lg"
                                                onClick={() => navigate('/userhome')}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <p className="terms-text">
                                            <i className="bi bi-info-circle me-1"></i>
                                            By submitting this application, you agree to the club's terms and conditions.
                                            You will be notified via email about the status of your application.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    );
}

export default ClubRegistrationForm;