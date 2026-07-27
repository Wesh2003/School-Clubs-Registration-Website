import React from 'react';
import ClubRegistrationForm from '../components/ClubRegistrationForm';
import Footer from '../components/Footer';
import ClubLeaderNavBar from '../components/ClubLeaderNavBar';

function ClubLeaderClubsRegistrationPage() {
  return (
    <div className='mainpage'>
    <ClubLeaderNavBar />
      <ClubRegistrationForm />
      <Footer />
    </div>
  );
}

export default ClubLeaderClubsRegistrationPage;