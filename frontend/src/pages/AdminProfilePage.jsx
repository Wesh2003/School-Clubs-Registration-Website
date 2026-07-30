import React from 'react';
import AdminNavBar from '../components/AdminNavBar';
import AdminProfile from  '../components/AdminProfile';


function AdminProfilePage({AdminId}) {
  return (
    <div>
        <AdminNavBar/>
        <AdminProfile AdminId={AdminId}/>
    
    </div>
  )
}

export default AdminProfilePage