import React from 'react';
import ClubLeaderNavBar from '../components/ClubLeaderNavBar';
import Footer from '../components/Footer';
import AnnouncementsTable from '../components/AnnouncementsTable';

function ClubLeaderMainPage({ isAuthenticated, ClubLeaderId }) {
  return (
    <div className='mainpage'>
      <ClubLeaderNavBar isAuthenticated={isAuthenticated} />
      <AnnouncementsTable ClubLeaderId={ClubLeaderId} />
      <Footer />
    </div>
  );
}

export default ClubLeaderMainPage;