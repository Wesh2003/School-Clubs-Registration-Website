// ClubLeaderLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Container, Button } from 'react-bootstrap';
import '../css/UserLogin.css';

function ClubLeaderLogin({ setIsAuthenticated, setClubLeaderId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email });

      const response = await fetch('http://127.0.0.1:5000/clubleaderlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        const { access_token, user_id, role, clubs } = data;

        if (!access_token || !user_id) {
          setError('Invalid response from server. Missing token or user ID.');
          return;
        }

        // Store user data in localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_id', user_id.toString());
        localStorage.setItem('user_role', role || 'club_leader');
        localStorage.setItem('clubs', JSON.stringify(clubs || []));

        // Update parent component state
        setIsAuthenticated(true);
        setClubLeaderId(user_id);

        // Redirect to club leader home
        navigate('/clubleaderhome');
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (response.status === 403) {
          setError('You are not registered as a club leader. Please contact an administrator.');
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-wrapper">
      <Container className="login-container">
        <h3 className="login-heading">Club Leader Login</h3>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Form onSubmit={handleLogin} className="login-form">
          <Row>
            <Col>
              <Form.Group controlId="formEmail">
                <Form.Label className="login-labels">Email:</Form.Label>
                <Form.Control
                  className="login-inputs"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="formPassword">
                <Form.Label className="login-labels">Password:</Form.Label>
                <Form.Control
                  className="login-inputs"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button 
            variant="primary" 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default ClubLeaderLogin;