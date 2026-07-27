// Admin Login component 
import React from 'react';
import AdminLogin from '../components/AdminLogin';

function AdminLoginPage({setIsAuthenticated, setAdminId}) {
    return (
      <div>
          <AdminLogin setIsAuthenticated={setIsAuthenticated} setAdminId={setAdminId}/>
      </div>
    )
  }
  
  export default AdminLoginPage