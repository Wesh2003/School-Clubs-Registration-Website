import AnnouncementsTable from "../components/AnnouncementsTable";
import AdminNavBar from "../components/AdminNavBar";
import React from 'react';
import Footer from "../components/Footer";

function AdminAnnouncementsPage({isAuthenticated}) {
  // State to track authentication status

  return (
    <div className='AdminAnnouncementsPage'>
        <AdminNavBar isAuthenticated={isAuthenticated} />
        <AnnouncementsTable isAuthenticated={isAuthenticated} />
         <Footer />
    </div>
  );
}

export default AdminAnnouncementsPage;