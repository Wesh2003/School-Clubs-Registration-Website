// ClubMembers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClubMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [leaderClubs, setLeaderClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Get the token from localStorage
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  // Configure axios with token
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Fetch club leader's clubs and members
  useEffect(() => {
    if (token && userId) {
      fetchLeaderClubs();
    } else {
      setError('Please log in to view club members');
      setLoading(false);
    }
  }, [token, userId]);

  const fetchLeaderClubs = async () => {
    try {
      // Get the user's club leadership roles
      const response = await axios.get(`http://localhost:5000/dashboard`, axiosConfig);
      
      if (response.data.club_leader_for && response.data.club_leader_for.length > 0) {
        const clubs = response.data.club_leader_for;
        setLeaderClubs(clubs);
        
        // Auto-select the first club if available
        if (clubs.length > 0) {
          const clubId = clubs[0].club_id;
          setSelectedClub(clubId);
          await fetchClubMembers(clubId);
          await fetchClubInfo(clubId);
        }
      } else {
        setError('You are not a club leader for any club');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching leader clubs:', err);
      setError('Failed to fetch your clubs. Please try again.');
      setLoading(false);
    }
  };

  const fetchClubMembers = async (clubId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all memberships and filter by club
      const response = await axios.get(`http://localhost:5000/memberships`, axiosConfig);
      
      // Filter memberships for the selected club
      const clubMemberships = response.data.filter(
        membership => membership.club_id === clubId && membership.status === 'active'
      );
      
      // Fetch full user details for each member
      const memberPromises = clubMemberships.map(async (membership) => {
        try {
          const userResponse = await axios.get(
            `http://localhost:5000/users/${membership.user_id}`,
            axiosConfig
          );
          return {
            ...membership,
            user_details: userResponse.data
          };
        } catch (err) {
          console.error(`Error fetching user ${membership.user_id}:`, err);
          return membership;
        }
      });
      
      const membersWithDetails = await Promise.all(memberPromises);
      setMembers(membersWithDetails);
      
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to fetch members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubInfo = async (clubId) => {
    try {
      const response = await axios.get(`http://localhost:5000/clubs/${clubId}`);
      setClubInfo(response.data);
    } catch (err) {
      console.error('Error fetching club info:', err);
    }
  };

  const handleClubChange = (e) => {
    const clubId = parseInt(e.target.value);
    setSelectedClub(clubId);
    fetchClubMembers(clubId);
    fetchClubInfo(clubId);
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/memberships/${selectedMember.id}`,
        axiosConfig
      );
      
      toast.success(`Removed ${selectedMember.user_details?.first_name || 'member'} from the club successfully!`);
      
      // Refresh the members list
      await fetchClubMembers(selectedClub);
      setShowDeleteModal(false);
      setSelectedMember(null);
      
    } catch (err) {
      console.error('Error deleting member:', err);
      toast.error('Failed to remove member. Please try again.');
    }
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true;
    const fullName = member.user_details 
      ? `${member.user_details.first_name} ${member.user_details.last_name}`.toLowerCase()
      : '';
    const email = member.user_details?.email?.toLowerCase() || '';
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Club Members</h1>
        <p className="mt-2 text-gray-600">
          View and manage members of your club(s)
        </p>
      </div>

      {/* Club Selector */}
      {leaderClubs.length > 1 && (
        <div className="mb-6">
          <label htmlFor="club-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Club
          </label>
          <select
            id="club-select"
            value={selectedClub || ''}
            onChange={handleClubChange}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {leaderClubs.map((club) => (
              <option key={club.club_id} value={club.club_id}>
                {club.club?.name || `Club ${club.club_id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Club Info Card */}
      {clubInfo && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {clubInfo.name}
          </h2>
          <p className="text-gray-600">{clubInfo.description}</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Members:</span>
              <span className="ml-2 text-gray-900">{members.length}</span>
            </div>
            {clubInfo.meeting_day && (
              <div>
                <span className="font-medium text-gray-700">Meeting Day:</span>
                <span className="ml-2 text-gray-900">{clubInfo.meeting_day}</span>
              </div>
            )}
            {clubInfo.meeting_time && (
              <div>
                <span className="font-medium text-gray-700">Time:</span>
                <span className="ml-2 text-gray-900">{clubInfo.meeting_time}</span>
              </div>
            )}
            {clubInfo.faculty_advisor && (
              <div>
                <span className="font-medium text-gray-700">Advisor:</span>
                <span className="ml-2 text-gray-900">{clubInfo.faculty_advisor}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              This club doesn't have any members yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {member.user_details?.first_name?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {member.user_details 
                              ? `${member.user_details.first_name} ${member.user_details.last_name}`
                              : 'Unknown User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.user_details?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.join_date ? new Date(member.join_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'president' ? 'bg-blue-100 text-blue-800' :
                          member.role === 'vice_president' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {member.role || 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member.status === 'active' ? 'bg-green-100 text-green-800' :
                          member.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {member.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDeleteModal(member)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Remove member from club"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Remove Member
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-gray-900">
                  {selectedMember.user_details 
                    ? `${selectedMember.user_details.first_name} ${selectedMember.user_details.last_name}`
                    : 'this member'}
                </span>
                {' '}from {clubInfo?.name || 'the club'}?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubMembers;