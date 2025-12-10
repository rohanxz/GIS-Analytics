import React, { useState, useEffect, useMemo } from 'react';
import { ClimbingBoxLoader } from 'react-spinners';

const MoodBoardView = ({ payload, onShowDetails }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndFilterActivities = async () => {
            setLoading(true);
            if (payload && payload.activityIds && payload.activityIds.length > 0) {
                try {
                    const response = await fetch('/api/itinerary');
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    const fullItineraryData = await response.json();
                    const requiredIds = new Set(payload.activityIds);
                    const filteredActivities = fullItineraryData.itinerary
                        .flatMap(day => day.activities)
                        .filter(activity => requiredIds.has(activity.id));
                    setActivities(filteredActivities);
                } catch (error) {
                    console.error("Failed to fetch or process activities for mood board:", error);
                    setActivities([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setActivities([]);
                setLoading(false);
            }
        };

        fetchAndFilterActivities();
    }, [payload]);

    const { cardPositions, clusterCenters } = useMemo(() => {
        if (!activities || activities.length === 0) {
            return { cardPositions: {}, clusterCenters: [] };
        }

        const categories = [...new Set(activities.map(a => a.category))].filter(c => c !== 'Travel');
        const positions = {};
        const centers = [];
        const canvasSize = { width: 3000, height: 2000 };
        const numCategories = categories.length;
        const angleStep = (2 * Math.PI) / (numCategories || 1);
        
        const mainRadius = Math.min(canvasSize.width, canvasSize.height) * 0.42;

        categories.forEach((category, i) => {
            const clusterAngle = angleStep * i;
            const clusterCenterX = canvasSize.width / 2 + mainRadius * Math.cos(clusterAngle);
            const clusterCenterY = canvasSize.height / 2 + mainRadius * Math.sin(clusterAngle);

            centers.push({ category, x: clusterCenterX, y: clusterCenterY });

            const activitiesInCategory = activities.filter(a => a.category === category);
            const numActivities = activitiesInCategory.length;
            const activityAngleStep = (2 * Math.PI) / (numActivities || 1);
            
            const cardWidthWithPadding = 320;
            const requiredCircumference = numActivities * cardWidthWithPadding;
            const calculatedRadius = requiredCircumference / (2 * Math.PI);
            const clusterRadius = Math.max(250, calculatedRadius);

            activitiesInCategory.forEach((act, j) => {
                const activityAngle = activityAngleStep * j;
                const x = clusterCenterX + clusterRadius * Math.cos(activityAngle);
                const y = clusterCenterY + clusterRadius * Math.sin(activityAngle);
                positions[act.id] = { x, y };
            });
        });

        return { cardPositions: positions, clusterCenters: centers };
    }, [activities]);

    if (loading) {
        return <div className="main-spinner-container"><ClimbingBoxLoader color="#f06292" /></div>;
    }
    
    if (activities.length === 0) {
        return <div className="welcome-message"><h2>No activities to display.</h2></div>;
    }

    return (
        <div className="moodboard-content-wrapper">
            {clusterCenters.map(center => (
                <div
                    key={center.category}
                    className="sticky-note"
                    style={{
                        position: 'absolute',
                        left: `${center.x}px`,
                        top: `${center.y}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {center.category}
                </div>
            ))}
            
            {/* --- FIXED: Filter out 'Travel' activities before rendering --- */}
            {activities.filter(activity => activity.category !== 'Travel').map(activity => {
                // Now, only activities with a calculated position will be rendered.
                const position = cardPositions[activity.id];
                // Since we filter beforehand, a fallback to (0,0) is no longer a risk.
                if (!position) return null;

                return (
                    <div
                        key={activity.id}
                        className="moodboard-card"
                        style={{
                            position: 'absolute',
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        onDoubleClick={() => onShowDetails(activity.id)}
                    >
                        <img src={activity.imageUrl} alt={activity.name} className="card-image" />
                        <div className="card-content">
                            <h4>{activity.name}</h4>
                            <p>{activity.description.substring(0, 70)}...</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MoodBoardView;