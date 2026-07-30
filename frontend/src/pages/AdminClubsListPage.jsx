import React from 'react';
import Footer from '../components/Footer';
import AdminNavBar from '../components/AdminNavBar';
import AdminClubsList from '../components/AdminClubsList';

function AdminClubsListPage({ isAuthenticated, adminId }) {
  return (
    <div className='mainpage'>
      <AdminNavBar isAuthenticated={isAuthenticated} />
      <AdminClubsList adminId={adminId} />
      <Footer />
    </div>
  );
}

export default AdminClubsListPage;