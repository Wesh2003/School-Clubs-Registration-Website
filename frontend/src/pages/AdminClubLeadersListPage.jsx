import React from 'react';
import Footer from '../components/Footer';
import AdminNavBar from '../components/AdminNavBar';
import AdminClubLeaders from '../components/AdminClubLeaders';

function AdminClubLeadersListPage({ isAuthenticated, adminId }) {
  return (
    <div className='mainpage'>
      <AdminNavBar isAuthenticated={isAuthenticated} />
      <AdminClubLeaders adminId={adminId} />
      <Footer />
    </div>
  );
}

export default AdminClubLeadersListPage;