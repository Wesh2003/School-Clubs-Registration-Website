
import React from 'react';
import ClubMembers from '../components/ClubMembers';
import ClubLeaderNavBar from '../components/ClubLeaderNavBar';
import Footer from '../components/Footer';


function ClubLeaderMembersPage({ isAuthenticated, ClubLeaderId }) {
  return (
    <div className='mainpage'>
      <ClubLeaderNavBar isAuthenticated={isAuthenticated} />
      <ClubMembers ClubLeaderId={ClubLeaderId} />
      <Footer />
    </div>
  );
}

export default ClubLeaderMembersPage;