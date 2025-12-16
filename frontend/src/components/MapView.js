import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { ClimbingBoxLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronRight,
    faSearch,
    faBars,
    faTimes,
    faStore,
    faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

const MapView = ({ payload, apiKey, onShowDetails }) => {
    const [allActivities, setAllActivities] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedCities, setExpandedCities] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMapData = async () => {
            if (!payload.activityIds || payload.activityIds.length === 0) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch('/api/itinerary');
                const data = await response.json();
                const activities = data.itinerary.flatMap(day => day.activities);
                setAllActivities(activities);

                const relevantLocations = activities
                    .filter(act => payload.activityIds.includes(act.id) && act.location)
                    .map(act => ({
                        id: act.id,
                        name: act.name,
                        latitude: act.location.latitude,
                        longitude: act.location.longitude,
                        address: act.location.address || "",
                        // Simple logic to derive a "City" or area name.
                        city: getCityFromAddress(act.location.address)
                    }));
                setLocations(relevantLocations);

                // Default expand all cities
                setExpandedCities({ "Singapore": true });

            } catch (error) {
                console.error("Failed to fetch map data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMapData();
    }, [payload]);

    // Group locations by City
    const groupedLocations = useMemo(() => {
        const groups = {};
        locations.forEach(loc => {
            const city = loc.city;
            if (!groups[city]) groups[city] = [];
            groups[city].push(loc);
        });
        return groups;
    }, [locations]);

    // Filter based on search term
    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groupedLocations;
        const lowerTerm = searchTerm.toLowerCase();

        const filtered = {};
        Object.keys(groupedLocations).forEach(city => {
            const locationsInCity = groupedLocations[city];
            // Check if city matches OR if any store in city matches
            const cityMatches = city.toLowerCase().includes(lowerTerm);
            const matchingLocations = locationsInCity.filter(loc =>
                loc.name.toLowerCase().includes(lowerTerm)
            );

            if (cityMatches) {
                filtered[city] = locationsInCity; // Show all if city matches
            } else if (matchingLocations.length > 0) {
                filtered[city] = matchingLocations; // Show only matching stores
            }
        });
        return filtered;
    }, [groupedLocations, searchTerm]);

    const toggleCity = (city) => {
        setExpandedCities(prev => ({
            ...prev,
            [city]: !prev[city]
        }));
    };

    // Helper to extract city/area from address
    const getCityFromAddress = (address) => {
        if (!address) return "Unknown Location";
        // If it's Sentosa, group it separately for better UX in this context
        if (address.toLowerCase().includes('sentosa')) return "Sentosa";
        // For Singapore addresses, they usually end with "Singapore <zip>"
        // We could treat "Singapore" as the city for all, but let's try to be flexible.
        if (address.toLowerCase().includes('singapore')) return "Singapore";

        // Fallback: take the last meaningful part
        const parts = address.split(',');
        if (parts.length > 1) {
            return parts[parts.length - 2].trim();
        }
        return "Other";
    };

    const handleMarkerClick = (locationId) => {
        const activity = allActivities.find(act => act.id === locationId);
        setSelectedActivity(activity);
    };

    const handleSidebarItemClick = (locationId) => {
        handleMarkerClick(locationId);
        // Ideally pan map to location, but we need map ref for that.
        // For now, selecting the marker is good.
    };

    if (loading) {
        return <div className="main-spinner-container"><ClimbingBoxLoader color="#ff4081" /></div>;
    }

    if (!locations || locations.length === 0) {
        return <div>No locations to display on the map.</div>;
    }

    const center = locations.reduce((acc, loc) => ({
        lat: acc.lat + loc.latitude / locations.length,
        lng: acc.lng + loc.longitude / locations.length
    }), { lat: 0, lng: 0 });

    // Styles for the glassmorphism sidebar
    const styles = {
        container: {
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
        },
        sidebar: {
            width: sidebarOpen ? '320px' : '0',
            maxWidth: '100%', // Ensure responsiveness on small screens
            height: '100%',
            background: 'rgba(30, 25, 53, 0.6)',
            backdropFilter: 'blur(15px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
            whiteSpace: 'nowrap' // Prevent text wrap during collapse animation
        },
        sidebarHeader: {
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        },
        headerTop: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        titleWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        title: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#fff',
        },
        closeBtn: {
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '5px'
        },
        searchContainer: {
            position: 'relative',
        },
        searchInput: {
            width: '100%',
            padding: '10px 15px 10px 35px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(0, 0, 0, 0.2)',
            color: '#fff',
            outline: 'none',
            fontSize: '14px'
        },
        searchIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px'
        },
        listContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '10px 0'
        },
        cityGroup: {
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        },
        cityHeader: {
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.02)',
            transition: 'background 0.2s'
        },
        cityName: {
            fontWeight: 500,
            color: '#e0e0e6',
            fontSize: '15px'
        },
        storeCount: {
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginRight: '10px'
        },
        storeList: {
            background: 'rgba(0, 0, 0, 0.1)',
        },
        storeItem: {
            padding: '12px 20px 12px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background 0.2s',
            color: '#d1d1d6',
            fontSize: '14px',
            borderLeft: '3px solid transparent',
            whiteSpace: 'normal' // Allow store names to wrap
        },
        storeItemActive: {
            background: 'rgba(240, 98, 146, 0.1)',
            color: '#fff',
            borderLeft: '3px solid #f06292'
        },
        openBtn: {
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 20,
            background: 'rgba(30, 25, 53, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(5px)'
        }
    };

    return (
        <div className="map-view-container" style={styles.container}>
            {/* Left Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.headerTop}>
                        <div style={styles.titleWrapper}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{color: '#f06292'}} />
                            <span style={styles.title}>City/Village List</span>
                        </div>
                        {/* Close Button inside sidebar for better mobile UX */}
                        <div style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                    </div>

                    <div style={styles.searchContainer}>
                        <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search City..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.listContainer}>
                    {Object.keys(filteredGroups).length === 0 && (
                        <div style={{padding: '20px', color: '#999', textAlign: 'center'}}>
                            No locations found.
                        </div>
                    )}
                    {Object.keys(filteredGroups).map(city => {
                        const cityStores = filteredGroups[city];
                        const isExpanded = expandedCities[city];

                        return (
                            <div key={city} style={styles.cityGroup}>
                                <div
                                    style={styles.cityHeader}
                                    onClick={() => toggleCity(city)}
                                >
                                    <div>
                                        <span style={styles.cityName}>{city}</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <span style={styles.storeCount}>{cityStores.length} {cityStores.length === 1 ? 'Store' : 'Stores'}</span>
                                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} style={{fontSize: '12px', color: '#999'}} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={styles.storeList}>
                                        {cityStores.map(loc => (
                                            <div
                                                key={loc.id}
                                                style={selectedActivity?.id === loc.id ? styles.storeItemActive : styles.storeItem}
                                                onClick={() => handleSidebarItemClick(loc.id)}
                                                onMouseEnter={(e) => {
                                                    if (selectedActivity?.id !== loc.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedActivity?.id !== loc.id) e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faStore} style={{fontSize: '12px', opacity: 0.7}} />
                                                <span>{loc.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Open Button (only visible when sidebar is closed) */}
            {!sidebarOpen && (
                <div style={styles.openBtn} onClick={() => setSidebarOpen(true)}>
                    <FontAwesomeIcon icon={faBars} />
                </div>
            )}

            {/* Map Area */}
            <div style={{flex: 1, position: 'relative', height: '100%'}}>
                <APIProvider apiKey={apiKey}>
                    <Map
                        defaultCenter={center}
                        defaultZoom={12}
                        mapId="e9a37a726335122f"
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        onClick={() => setSelectedActivity(null)}
                    >
                        {locations.map(loc => (
                            <AdvancedMarker
                                key={loc.id}
                                position={{ lat: loc.latitude, lng: loc.longitude }}
                                onClick={() => handleMarkerClick(loc.id)}
                            />
                        ))}

                        {selectedActivity && (
                            <InfoWindow
                                position={{ lat: selectedActivity.location.latitude, lng: selectedActivity.location.longitude }}
                                onCloseClick={() => setSelectedActivity(null)}
                            >
                                <div className="map-infowindow-content">
                                    <img src={selectedActivity.imageUrl} alt={selectedActivity.name} />
                                    <h4>{selectedActivity.name}</h4>
                                    <p>{selectedActivity.description.substring(0, 100)}...</p>
                                    <button className="details-button" onClick={() => onShowDetails(selectedActivity.id)}>
                                        View Details
                                    </button>
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
};

export default MapView;
