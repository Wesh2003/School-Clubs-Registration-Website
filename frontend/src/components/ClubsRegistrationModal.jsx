import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../css/ClubsRegistrationModal.css';

function ClubsRegistrationModal({ show, handleClose, club, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        reason_for_joining: '',
        skills: '',
        availability: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

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

        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                alert('Please log in first to apply for clubs.');
                setSubmitting(false);
                return;
            }

            const applicationData = {
                club_id: club.id,
                reason_for_joining: formData.reason_for_joining,
                skills: `${formData.skills}\nAvailability: ${formData.availability}`
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
                name: '',
                email: '',
                phone: '',
                reason_for_joining: '',
                skills: '',
                availability: ''
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!club) return null;

    // Custom styles for the modal
    const modalStyles = {
        content: {
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
        },
        header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 30px',
            borderBottom: 'none',
            borderRadius: '20px 20px 0 0'
        },
        title: {
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700'
        }
    };

    return (
        <div id="clubs-modal-root">
            <Modal show={show} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton style={modalStyles.header}>
                    <Modal.Title style={modalStyles.title}>
                        Apply to Join {club.name || club.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="club-details-section">
                        <h6 className="club-details-title">Club Details:</h6>
                        <div className="club-detail-item">
                            <strong>Description:</strong> {club.description}
                        </div>
                        <div className="club-detail-item">
                            <strong>Location:</strong> {club.meeting_location || club.location}
                        </div>
                        <div className="club-detail-item">
                            <strong>Meeting Day:</strong> {club.meeting_day || 'Not specified'}
                        </div>
                        <div className="club-detail-item">
                            <strong>Meeting Time:</strong> {club.meeting_time || 'Not specified'}
                        </div>
                        {club.max_members && (
                            <div className="club-detail-item">
                                <strong>Max Members:</strong> {club.max_members}
                            </div>
                        )}
                    </div>
                    
                    <hr className="modal-divider" />
                    
                    <Form className="modal-form" onSubmit={handleSubmit}>
                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                Full Name <span className="required-star">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                isInvalid={!!errors.name}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className="invalid-feedback">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                Email Address <span className="required-star">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                isInvalid={!!errors.email}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className="invalid-feedback">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                Phone Number <span className="required-star">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                isInvalid={!!errors.phone}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className="invalid-feedback">
                                {errors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                Why do you want to join this club? <span className="required-star">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="reason_for_joining"
                                value={formData.reason_for_joining}
                                onChange={handleChange}
                                placeholder="Tell us why you're interested in joining"
                                isInvalid={!!errors.reason_for_joining}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className="invalid-feedback">
                                {errors.reason_for_joining}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label className="form-label">Skills & Experience</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="Any relevant skills or experience you'd like to share"
                            />
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label className="form-label">Availability</Form.Label>
                            <Form.Control
                                type="text"
                                name="availability"
                                value={formData.availability}
                                onChange={handleChange}
                                placeholder="When are you available for club activities?"
                            />
                        </Form.Group>

                        <div className="modal-footer">
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ClubsRegistrationModal;