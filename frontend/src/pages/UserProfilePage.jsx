


// Nav Bar
// User Table component 


import React from 'react';
import UserNavBar from '../components/UserNavBar';
import UserProfile from  '../components/UserProfile';


function UserProfilePage({userId}) {
  return (
    <div>
        <UserNavBar/>
        <UserProfile userId={userId}/>
    
    </div>
  )
}

export default UserProfilePage