
import React from 'react';
import ClubLeaderNavBar from '../components/ClubLeaderNavBar';
import ClubLeaderProfile from  '../components/ClubLeaderProfile';


function ClubLeaderProfilePage({ClubLeaderId}) {
  return (
    <div>
        <ClubLeaderNavBar/>
        <ClubLeaderProfile ClubLeaderId={ClubLeaderId}/>
    
    </div>
  )
}

export default ClubLeaderProfilePage