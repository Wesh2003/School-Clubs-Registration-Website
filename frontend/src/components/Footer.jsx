import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Footer.css';

function Footer() {
  const initiateChat = () => {
    console.log("Chat initiated");
  };

  return (
    <div>
      <div className="footer">
        <div className="contact-support">
          <h2>Contact Customer Support</h2>
          <p>Please choose your preferred method of contact:</p>
          <ul>
            <li>
              <strong>Chat:</strong> Click the chat icon below to start a conversation with our support team.
              <button onClick={initiateChat}>Start Chat</button>
            </li>
            <li>
              <strong>Email:</strong> Send an email to <a href="mailto:clubsupport@registration.com">clubsupport@registration.com</a>.
            </li>
            <li>
              <strong>Phone:</strong> Call our support hotline at <a href="tel:+1234567890">+(254) 07 000 000</a>.
            </li>
          </ul>
        </div>

        <div className="social-icons">
          <a href="https://facebook.com">
            <FontAwesomeIcon icon={faFacebook} /> Facebook
          </a>
          <a href="https://twitter.com">
            <FontAwesomeIcon icon={faTwitter} /> Twitter
          </a>
          <a href="https://instagram.com">
            <FontAwesomeIcon icon={faInstagram} /> Instagram
          </a>
          <a href="https://linkedin.com">
            <FontAwesomeIcon icon={faLinkedin} /> Linkedin
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;