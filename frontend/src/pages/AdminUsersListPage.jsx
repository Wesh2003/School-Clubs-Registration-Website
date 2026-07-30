import React from 'react';
import Footer from '../components/Footer';
import AdminNavBar from '../components/AdminNavBar';
import AdminSiteUsers from '../components/AdminSiteUsers';

function AdminUsersListPage({ isAuthenticated, adminId }) {
  return (
    <div className='mainpage'>
      <AdminNavBar isAuthenticated={isAuthenticated} />
      <AdminSiteUsers adminId={adminId} />
      <Footer />
    </div>
  );
}

export default AdminUsersListPage;