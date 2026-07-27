import React from 'react';
import UserNavBar from '../components/UserNavBar';
import Footer from '../components/Footer';
import ClubsTable from '../components/ClubsTable';

function UserHomePage({ isAuthenticated ,userId}) {
  return (
    <div className='mainpage'>
      <UserNavBar isAuthenticated={isAuthenticated}  />
      <ClubsTable userId={userId}/>
      <Footer />
    </div>
  );
}

export default UserHomePage;