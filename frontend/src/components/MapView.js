import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { ClimbingBoxLoader } from 'react-spinners';

const MapView = ({ payload, apiKey, onShowDetails }) => {
    const [allActivities, setAllActivities] = useState([]);
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
                setAllActivities(activities);

                const relevantLocations = activities
                    .filter(act => payload.activityIds.includes(act.id) && act.location)
                    .map(act => ({
                        id: act.id,
                        name: act.name,
                        latitude: act.location.latitude,
                        longitude: act.location.longitude,
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
        const activity = allActivities.find(act => act.id === locationId);
        setSelectedActivity(activity);
    };

    return (
        <div className="map-view-container">
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
    );
};

export default MapView;

