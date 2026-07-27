import React from 'react';
import EntryLogin from '../components/EntryLogin';

function EntryLoginPage({setIsAuthenticated, setAdminId}) {
    return (
      <div>
          <EntryLogin/>
      </div>
    )
  }
  
  export default EntryLoginPage