// User Login component 
import React from 'react';
import UserLogin from '../components/UserLogin';

function UserLoginPage({setIsAuthenticated, setUserId}) {
    return (
      <div>
          <UserLogin setIsAuthenticated={setIsAuthenticated} setUserId={setUserId}/>
      </div>
    )
  }
  
  export default UserLoginPage