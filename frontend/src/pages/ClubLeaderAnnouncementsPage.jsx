import AnnouncementsTable from "../components/AnnouncementsTable";
import ClubLeaderNavBar from "../components/ClubLeaderNavBar";
import React from 'react';
import Footer from "../components/Footer";

function ClubLeaderAnnouncementsPage({isAuthenticated}) {
  // State to track authentication status

  return (
    <div className='ClubLeaderAnnouncementsPage'>
        <ClubLeaderNavBar isAuthenticated={isAuthenticated} />
        <AnnouncementsTable isAuthenticated={isAuthenticated} />
         <Footer />
    </div>
  );
}

export default ClubLeaderAnnouncementsPage;