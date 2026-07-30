import React from 'react';
import AdminNavBar from '../components/AdminNavBar';
import Footer from '../components/Footer';
import AnnouncementsTable from '../components/AnnouncementsTable';

function AdminMainPage({ isAuthenticated, adminId }) {
  return (
    <div className='mainpage'>
      <AdminNavBar isAuthenticated={isAuthenticated} />
      <AnnouncementsTable adminId={adminId} />
      <Footer />
    </div>
  );
}

export default AdminMainPage;