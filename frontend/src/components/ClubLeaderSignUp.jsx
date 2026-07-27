// ClubLeaderSignUp.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ClubLeaderSignUp.css';  // Add this import

function ClubLeaderSignUp() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    club_id: '',
    position: 'President'
  });
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch available clubs for the dropdown
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };
    fetchClubs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Register the user as a regular user
      const userResponse = await fetch('http://127.0.0.1:5000/userregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password
        })
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to register user');
      }

      // Step 2: Login to get a token
      const loginResponse = await fetch('http://127.0.0.1:5000/userlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Failed to login');
      }

      const token = loginData.access_token;
      const userId = loginData.user_id;

      // Step 3: Register as a club leader with the token
      const leaderResponse = await fetch('http://127.0.0.1:5000/clubleaderregister', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          club_id: parseInt(formData.club_id),
          position: formData.position
        })
      });

      const leaderData = await leaderResponse.json();

      if (!leaderResponse.ok) {
        throw new Error(leaderData.error || 'Failed to register as club leader');
      }

      setSuccess('Club leader registered successfully!');
      
      // Store the token and user info for auto-login
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_role', 'club_leader');

      // Redirect to club leader home after 2 seconds
      setTimeout(() => {
        navigate('/clubleaderhome');
      }, 2000);

    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="club-leader-signup-wrapper">
      <div className="club-leader-container">
        <h2 className="club-leader-heading">Club Leader Sign Up</h2>
        
        {error && (
          <div className="club-leader-alert club-leader-alert-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="club-leader-alert club-leader-alert-success">
            {success}
          </div>
        )}

        <form className="club-leader-form" onSubmit={handleSubmit}>
          <div className="club-leader-form-group">
            <label className="club-leader-label" htmlFor="first_name">
              First Name:
            </label>
            <input
              className="club-leader-input"
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="club-leader-form-group">
            <label className="club-leader-label" htmlFor="last_name">
              Last Name:
            </label>
            <input
              className="club-leader-input"
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="club-leader-form-group">
            <label className="club-leader-label" htmlFor="email">
              Email:
            </label>
            <input
              className="club-leader-input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="club-leader-form-group">
            <label className="club-leader-label" htmlFor="password">
              Password:
            </label>
            <input
              className="club-leader-input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="club-leader-form-group">
            <label className="club-leader-label" htmlFor="club_id">
              Select Club to Lead:
            </label>
            <select
              className="club-leader-select"
              id="club_id"
              name="club_id"
              value={formData.club_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a club...</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className="club-leader-form-group">
            <label className="club-leader-label" htmlFor="position">
              Position:
            </label>
            <select
              className="club-leader-select"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            >
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
            </select>
          </div>

          <button
            className="club-leader-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up as Club Leader'}
          </button>
        </form>

        <div className="club-leader-login-link">
          Already have an account?{' '}
          <a href="/clubleaderlogin">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}

export default ClubLeaderSignUp;