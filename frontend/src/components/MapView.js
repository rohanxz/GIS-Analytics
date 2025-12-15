import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { ClimbingBoxLoader } from 'react-spinners';
import StopList from './StopList';

const MapView = ({ payload, apiKey, onShowDetails }) => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);

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

                const relevantLocations = activities
                    .filter(act => payload.activityIds.includes(act.id) && act.location)
                    .map(act => ({
                        id: act.id,
                        name: act.name,
                        latitude: act.location.latitude,
                        longitude: act.location.longitude,
                        location: act.location,
                        description: act.description,
                        imageUrl: act.imageUrl,
                        // Mock fields for the sidebar if they don't exist
                        packages: act.packages || `${Math.floor(Math.random() * 5) + 1} Packages`,
                        status: act.status || (Math.random() > 0.5 ? 'Delivered' : 'Pending'),
                        eta: act.eta || `${Math.floor(Math.random() * 12) + 1}:00 PM`,
                    }));
                setLocations(relevantLocations);
            } catch (error) {
                console.error("Failed to fetch map data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMapData();
    }, [payload]);

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

    const handleMarkerClick = (locationId) => {
        // Find in locations which now has the enriched data
        const activity = locations.find(loc => loc.id === locationId);
        setSelectedActivity(activity);
    };

    return (
        <div className="map-view-container">
            <StopList
                stops={locations}
                onSelect={handleMarkerClick}
                selectedId={selectedActivity?.id}
            />
            <div className="map-content-wrapper">
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
                                position={{ lat: selectedActivity.latitude, lng: selectedActivity.longitude }}
                                onCloseClick={() => setSelectedActivity(null)}
                            >
                                <div className="map-infowindow-content">
                                    <img src={selectedActivity.imageUrl} alt={selectedActivity.name} />
                                    <h4>{selectedActivity.name}</h4>
                                    <p>{selectedActivity.description ? selectedActivity.description.substring(0, 100) + '...' : ''}</p>
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
