// Club Leader Login component 
import React from 'react';
import ClubLeaderLogin from '../components/ClubLeaderLogin';

function ClubLeaderLoginPage({setIsAuthenticated, setClubLeaderId}) {
    return (
      <div>
          <ClubLeaderLogin setIsAuthenticated={setIsAuthenticated} setClubLeaderId={setClubLeaderId}/>
      </div>
    )
  }
  
  export default ClubLeaderLoginPage