import React from 'react'
// import { Button } from 'react-bootstrap';
import { Link } from "react-router-dom";


function EntryLogin() {
    
  return (
    <div className = 'entry-page'>
        <div className = 'entry-text'>
            <button className='entry-login-btn'><Link to={`/userlogin`} className="link">Login as a User</Link></button>
            <br></br>
            <br></br>
            <em>Don't have an account ? <span ><Link to={`/userregister`} className="span-link">Sign up as a User</Link></span> </em>
            <br></br>
            <button className='entry-login-btn'><Link to={`/adminlogin`} className="link">Login as an Admin</Link></button>
            <br></br>
            <br></br>
            <em>Don't have an account ? <span ><Link to={`/adminregister`} className="span-link">Sign up as an Admin</Link></span> </em>
            <br></br>
            <button className='entry-login-btn'><Link to={`/clubleaderlogin`} className="link">Login as a Club Leader</Link></button>
            <br></br>
            <br></br>
            <em>Don't have an account ? <span ><Link to={`/clubleaderregister`} className="span-link">Sign up as a Club Leader</Link></span> </em>
            <br></br>
            
        </div>

    </div>
  )
}

export default EntryLogin;