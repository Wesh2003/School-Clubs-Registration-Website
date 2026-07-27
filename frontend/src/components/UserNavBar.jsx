// NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faRegularUser, faUserCircle as faSolidUser } from '@fortawesome/free-regular-svg-icons';
import '../css/UserNavBar.css';

function UserNavBar({ isAuthenticated }) {
  return (
    <div className='user-navbar-wrapper'>
      <div className='navbar'>
        <NavLink to="/userhome" className='navbarss'>
          <h4>Home</h4>
        </NavLink>
        <NavLink to="/clubregistration" className='navbarss'>
          <h4>Club Registration Form</h4>
        </NavLink>
        <NavLink to="/help" className='navbarss'>
          <h4>Help</h4>
        </NavLink>
        <NavLink to="/userannouncements" className='navbarss'>
          <h4>Announcements</h4>
        </NavLink>
        <NavLink to="/userprofile" className='navbarss'>
          <FontAwesomeIcon className='user-icon' icon={faSolidUser} />
        </NavLink>
        {/* {isAuthenticated ? (
          <NavLink to="/userprofile">
            <FontAwesomeIcon className='user-icon' icon={faSolidUser} />
          </NavLink>
        ) : (
          <NavLink to="/login">
            <FontAwesomeIcon className='user-icon' icon={faRegularUser} />
          </NavLink>
        )} */}
      </div>
    </div>
  );
}

export default UserNavBar;