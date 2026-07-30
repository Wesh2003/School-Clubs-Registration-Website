import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import UserNavBar from './components/UserNavBar';
import UserProfile from "./components/UserProfile";
import UserHomePage from './pages/UserHomePage';
import HelpPage from './pages/HelpPage';
import EntryPage from './pages/EntryPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserProfilePage from './pages/UserProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSignUpPage from './pages/AdminSignUpPage';
import ClubLeaderLoginPage from './pages/ClubLeaderLoginPage';
import ClubLeaderSignUpPage from './pages/ClubLeaderSignUpPage';
import AdminMainPage from './pages/AdminMainPage';
import ClubLeaderMainPage from './pages/ClubLeaderMainPage';
import AdminClubsListPage from './pages/AdminClubsListPage';
import AdminUsersListPage from './pages/AdminUsersListPage';
import AdminClubLeadersListPage from './pages/AdminClubLeadersListPage';
import ClubLeaderProfilePage from './pages/ClubLeaderProfilePage';
import AdminProfilePage from './pages/AdminProfilePage';
import EntryLoginPage from './pages/EntryLoginPage';
import UserLoginPage from './pages/UserLoginPage';
import UserSignUpPage from './pages/UserSignUpPage';
import ClubsRegistrationPage from './pages/ClubsRegistrationPage';
import ClubMembers from './components/ClubMembers';
import ClubApplications from './components/ClubApplications';
import ClubLeaderMembersPage from './pages/ClubLeaderMembersPage';
import ClubLeaderApplicationsPage from './pages/ClubLeaderApplicationsPage';
import UserAnnouncementsPage from './pages/UserAnnouncementsPage';
import ClubLeaderAnnouncementsPage from './pages/ClubLeaderAnnouncementsPage';
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage';
import ClubLeaderClubsRegistrationPage from './pages/ClubLeaderClubsRegistrationPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [ClubLeaderId, setClubLeaderId] = useState('');
  const [AdminId, setAdminId] = useState('');

  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/userhome" element={<UserHomePage isAuthenticated={isAuthenticated} userId={userId} />} />
          <Route exact path="/adminhome" element={<AdminMainPage isAuthenticated={isAuthenticated} AdminId={AdminId} />} />
          <Route exact path="/clubleaderhome" element={<ClubLeaderMainPage isAuthenticated={isAuthenticated} ClubLeaderId={ClubLeaderId} />} />
          <Route exact path="/" element={<EntryPage />} />
          <Route exact path="/entrylogin" element={<EntryLoginPage setIsAuthenticated={setIsAuthenticated} setAdminId={setAdminId} />} />
          <Route exact path="/userlogin" element={<UserLoginPage setIsAuthenticated={setIsAuthenticated} setUserId={setUserId} />} />
          <Route exact path="/userregister" element={<UserSignUpPage />} />
          <Route exact path="/adminlogin" element={<AdminLoginPage setIsAuthenticated={setIsAuthenticated} setAdminId={setAdminId} />} />
          <Route exact path="/adminregister" element={<AdminSignUpPage />} />
          <Route exact path="/clubleaderlogin" element={<ClubLeaderLoginPage setIsAuthenticated={setIsAuthenticated} setClubLeaderId={setClubLeaderId} />} />
          <Route exact path="/clubleaderregister" element={<ClubLeaderSignUpPage />} />
          <Route exact path="/userprofile" element={<UserProfilePage userId={userId}/>} />
          <Route exact path="/adminprofile" element={<AdminProfilePage AdminId={AdminId}/>} />
          <Route exact path="/clubleaderprofile" element={<ClubLeaderProfilePage ClubLeaderId={ClubLeaderId}/>} />
          <Route exact path="/adminclubs" element={<AdminClubsListPage />} />
          <Route exact path="/adminclubleaders" element={<AdminClubLeadersListPage />} />
          <Route exact path="/adminusers" element={<AdminUsersListPage />} />
          <Route exact path="/help" element={<HelpPage />} />
          <Route exact path="/clubregistration" element={<ClubsRegistrationPage />} />
          <Route exact path="/clubleaderclubregistration" element={<ClubLeaderClubsRegistrationPage />} />
          <Route path="/clubmembers" element={<ClubLeaderMembersPage/>} />
          <Route path="/clubapplications" element={<ClubLeaderApplicationsPage/>} />
          <Route path="/userannouncements" element={<UserAnnouncementsPage />} />
          <Route path="/clubleaderannouncements" element={<ClubLeaderAnnouncementsPage isAuthenticated={isAuthenticated} />} />
          <Route path="/adminannouncements" element={<AdminAnnouncementsPage isAuthenticated={isAuthenticated} />} />
          <Route path="/adminusers" element={<AdminUsersListPage />} />
          <Route path="/adminclubleaders" element={<AdminClubLeadersListPage />} />
          <Route path="/adminclubs" element={<AdminClubsListPage />} />


        </Routes>
        
        {/* Components that are outside of Routes */}
        {/* <UserNavBar /> */}
        {/* <UserProfile userId={userId} /> */}
      </div>
    </Router>
  );
}

export default App;