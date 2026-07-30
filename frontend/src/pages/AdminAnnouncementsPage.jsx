import AdminAnnouncements from "../components/AdminAnnouncements";
import AdminNavBar from "../components/AdminNavBar";
import React from 'react';
import Footer from "../components/Footer";

function AdminAnnouncementsPage({isAuthenticated}) {
  // State to track authentication status

  return (
    <div className='AdminAnnouncementsPage'>
        <AdminNavBar isAuthenticated={isAuthenticated} />
        <AdminAnnouncements isAuthenticated={isAuthenticated} />
         <Footer />
    </div>
  );
}

export default AdminAnnouncementsPage;