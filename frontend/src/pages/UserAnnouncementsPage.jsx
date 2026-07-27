import AnnouncementsTable from "../components/AnnouncementsTable";
import UserNavBar from "../components/UserNavBar";
import React from 'react';
import Footer from "../components/Footer";

function UserAnnouncementsPage({isAuthenticated}) {
  // State to track authentication status

  return (
    <div className='UserAnnouncementsPage'>
        <UserNavBar isAuthenticated={isAuthenticated} />
        <AnnouncementsTable isAuthenticated={isAuthenticated} />
         <Footer />
    </div>
  );
}

export default UserAnnouncementsPage;