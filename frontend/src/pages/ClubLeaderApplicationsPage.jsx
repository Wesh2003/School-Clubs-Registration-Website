
import React from 'react';
import ClubLeaderNavBar from '../components/ClubLeaderNavBar';
import Footer from '../components/Footer';
import ClubApplications from '../components/ClubApplications';


function ClubLeaderApplicationsPage({ isAuthenticated, ClubLeaderId }) {
  return (
    <div className='mainpage'>
      <ClubLeaderNavBar isAuthenticated={isAuthenticated} />
      <ClubApplications ClubLeaderId={ClubLeaderId} />
      <Footer />
    </div>
  );
}

export default ClubLeaderApplicationsPage;