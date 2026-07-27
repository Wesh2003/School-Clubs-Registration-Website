// NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faRegularUser, faUserCircle as faSolidUser } from '@fortawesome/free-regular-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUser as faRegularUser, faUserCircle as faSolidUser } from '@fortawesome/free-regular-svg-icons';

function AdminNavBar({ isAuthenticated }) {
  return (
    <div className='navbar'>
      <NavLink to="/adminhome" className='navbarss'>
        <h4>Home</h4>
      </NavLink>
      <NavLink to="/clubs" className='navbarss'>
        <h4>Clubs</h4>
      </NavLink>
      <NavLink to="/adminusers" className='navbarss'>
        <h4>Site Users</h4>
      </NavLink>
      <NavLink to="/adminclubleaders" className='navbarss'>
        <h4>Club Leaders</h4>
      </NavLink>
      <NavLink to="/adminannouncements" className='navbarss'>
        <h4>Announcements</h4>
      </NavLink>
      <NavLink to="/">
          <FontAwesomeIcon className='user-icon' icon={faSolidUser} />
      </NavLink>
      
      {/* {isAuthenticated ? (
        <NavLink to="/adminprofile">
          <FontAwesomeIcon className='user-icon' icon={faSolidUser} />
        </NavLink>
      ) : (
        <NavLink to="/adminlogin">
          <FontAwesomeIcon className='user-icon' icon={faRegularUser} />
        </NavLink>
      )} */}
    </div>
  );
}

export default AdminNavBar;