import React from 'react';
import ClubRegistrationForm from '../components/ClubRegistrationForm';
import Footer from '../components/Footer';
import UserNavBar from '../components/UserNavBar';

function ClubsRegistrationPage() {
  return (
    <div className='mainpage'>
    <UserNavBar />
      <ClubRegistrationForm />
      <Footer />
    </div>
  );
}

export default ClubsRegistrationPage;