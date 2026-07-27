import React, { useEffect, useState } from 'react';

function AdminProfile({ userId }) {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!userId || !token) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserData();
  }, [userId, token]);

  return (
    <div>
      {user ? (
        <div>
          <h2>User Profile</h2>
          <p><strong>First Name:</strong> {user.first_name}</p>
          <p><strong>Last Name:</strong> {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {/* {user.phone && <p><strong>Phone:</strong> {user.phone}</p>} */}
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
    </div>
  );
}

export default UserProfile;