// NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faRegularUser, faUserCircle as faSolidUser } from '@fortawesome/free-regular-svg-icons';
import '../css/UserNavBar.css';

function ClubLeaderNavBar({ isAuthenticated }) {
  return (
    <div className='user-navbar-wrapper'>
      <div className='navbar'>
        <NavLink to="/clubleaderhome" className='navbarss'>
          <h4>Home</h4>
        </NavLink>
        <NavLink to="/clubleaderclubregistration" className='navbarss'>
          <h4>Club Registration Form</h4>
        </NavLink>
        <NavLink to="/clubmembers" className='navbarss'>
          <h4>Club Members</h4>
        </NavLink>
              <NavLink to="/clubapplications" className='navbarss'>
          <h4>New Members Club Applications</h4>
        </NavLink>
        <NavLink to="/clubleaderannouncements" className='navbarss'>
          <h4>Announcements</h4>
        </NavLink>
        <NavLink to="/clubleaderprofile" className='navbarss'>
          <FontAwesomeIcon className='user-icon' icon={faSolidUser} />
        </NavLink>
        {/* {isAuthenticated ? (
          <NavLink to="/clubleaderprofile">
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

export default ClubLeaderNavBar;