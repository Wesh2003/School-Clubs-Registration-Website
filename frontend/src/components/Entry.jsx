import React from 'react'
// import { Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import '../css/EntryPage.css'


function Entry() {
    
  return (
    <div className = 'entry-page'>
        <img className = 'entry-image' src='https://i.pinimg.com/736x/af/ef/26/afef26d06ddd2f5aec50e00e42e1215c.jpg' alt='Customer care'/>
        <div className = 'entry-text'>
            <h1>Club Registration Website</h1>
            <br></br>
            <h3>
            Pick and register for your favourite school clubs with ease! Whether you're a student looking to join a club or an admin managing club registrations, our website has got you covered.
            </h3>
            <br></br>
            <p>
            If you're a student, join our website and discover a world of opportunities to engage in activities that match your interests!
            </p>
            <br></br>
            <button className='entry-login-btn'><Link to={`/entrylogin`} className="link">Join the Site</Link></button>
        </div>

    </div>
  )
}

export default Entry