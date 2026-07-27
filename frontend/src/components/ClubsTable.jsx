import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import ClubsRegistrationModal from './ClubsRegistrationModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/ClubsTable.css';  // Add this import

function ClubsTable() {
    const [clubs, setClubs] = useState([]);
    const [filteredClubs, setFilteredClubs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch clubs from the database
    useEffect(() => {
        fetch("http://127.0.0.1:5000/clubs")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch clubs');
                }
                return response.json();
            })
            .then((data) => {
                const clubsData = Array.isArray(data) ? data : [];
                setClubs(clubsData);
                setFilteredClubs(clubsData);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clubs:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    // Handle category filter
    useEffect(() => {
        if (!Array.isArray(clubs) || clubs.length === 0) {
            setFilteredClubs([]);
            return;
        }

        if (selectedCategory === "All Categories") {
            setFilteredClubs(clubs);
        } else {
            const filtered = clubs.filter(club => club.category === selectedCategory);
            setFilteredClubs(filtered);
        }
    }, [selectedCategory, clubs]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    // Get unique categories from clubs
    const getCategories = () => {
        if (!Array.isArray(clubs) || clubs.length === 0) {
            return ['All Categories'];
        }
        const categories = clubs
            .map(club => club.category)
            .filter(category => category && category !== '');
        return ['All Categories', ...new Set(categories)];
    };

    const categories = getCategories();

    // Handle search functionality
    const handleSearch = (searchTerm) => {
        if (!Array.isArray(clubs)) {
            setFilteredClubs([]);
            return;
        }

        if (!searchTerm || !searchTerm.trim()) {
            if (selectedCategory === "All Categories") {
                setFilteredClubs(clubs);
            } else {
                setFilteredClubs(clubs.filter(club => club.category === selectedCategory));
            }
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const searchResults = clubs.filter(club => {
            return (
                (club.name && club.name.toLowerCase().includes(searchLower)) ||
                (club.title && club.title.toLowerCase().includes(searchLower)) ||
                (club.description && club.description.toLowerCase().includes(searchLower)) ||
                (club.location && club.location.toLowerCase().includes(searchLower))
            );
        });

        if (selectedCategory !== "All Categories") {
            setFilteredClubs(searchResults.filter(club => club.category === selectedCategory));
        } else {
            setFilteredClubs(searchResults);
        }
    };

    // Handle club click - open registration modal
    const handleClubClick = (club) => {
        setSelectedClub(club);
        setShowModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedClub(null);
    };

    // Handle successful registration
    const handleRegistrationSuccess = () => {
        setShowModal(false);
        setSelectedClub(null);
        alert('Application submitted successfully!');
    };

    // Loading state
    if (loading) {
        return (
            <div className="clubs-table-wrapper">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading clubs...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="clubs-table-wrapper">
                <div className="container">
                    <div className="error-container">
                        <h4 className="error-heading">Error Loading Clubs</h4>
                        <p className="error-message">{error}</p>
                        <button 
                            className="error-button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="clubs-table-wrapper">
            <div className="container">
                <div className="clubs-header">
                    <h1 className="clubs-heading">Available Clubs</h1>
                    <p className="clubs-subtitle">Click on any club to apply for membership</p>
                    <div className="search-wrapper">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    <div className="category-wrapper">
                        <CategoryFilter 
                            categories={categories} 
                            category={selectedCategory} 
                            handleCategoryChange={handleCategoryChange} 
                        />
                    </div>
                </div>
                
                <div className="clubs-grid">
                    {!Array.isArray(filteredClubs) || filteredClubs.length === 0 ? (
                        <div className="no-clubs-message">
                            <p>No clubs found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredClubs.map((club) => (
                            <div 
                                className="club-card"
                                key={club._id || club.id || Math.random()}
                                onClick={() => handleClubClick(club)}
                            >
                                {club.image_url && (
                                    <img
                                        src={club.image_url}
                                        alt={club.name || club.title || 'Club'}
                                        className="club-card-image"
                                    />
                                )}
                                <div className="club-card-body">
                                    <h5 className="club-card-title">
                                        {club.name || club.title || 'Club Name'}
                                    </h5>
                                    {club.category && (
                                        <span className="club-card-category">{club.category}</span>
                                    )}
                                    <p className="club-card-description">
                                        <strong>Description:</strong> 
                                        {club.description ? club.description.substring(0, 100) + '...' : 'No description available'}
                                    </p>
                                    <p className="club-card-detail">
                                        <strong>Location:</strong> {club.location || 'Location not specified'}
                                    </p>
                                    {club.cost && (
                                        <p className="club-card-detail">
                                            <strong>Membership Fee:</strong> ${club.cost}
                                        </p>
                                    )}
                                    <button 
                                        className="club-card-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClubClick(club);
                                        }}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Registration Modal */}
                <ClubsRegistrationModal 
                    show={showModal}
                    handleClose={handleCloseModal}
                    club={selectedClub}
                    onSuccess={handleRegistrationSuccess}
                />
            </div>
        </div>
    );
}

export default ClubsTable;