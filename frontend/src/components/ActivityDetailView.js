import React, { useState, useEffect } from 'react';
import { ClimbingBoxLoader } from 'react-spinners';

const ActivityDetailView = ({ payload }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            if (!payload || !payload.activityId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(`/api/activity/${payload.activityId}`);
                const data = await response.json();
                setActivity(data);
            } catch (error) {
                console.error("Failed to fetch activity details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [payload]);

    if (loading) {
        return <div className="main-spinner-container"><ClimbingBoxLoader color="#ff4081" /></div>;
    }

    if (!activity) {
        return <div>Activity details not found.</div>;
    }

    return (
        <div className="activity-detail-card">
            {activity.imageUrl && (
                <img src={activity.imageUrl} alt={activity.name} className="activity-detail-image" />
            )}
            <div className="activity-detail-content">
                <h2>{activity.name}</h2>
                <p><strong>Category:</strong> {activity.category}</p>
                <p><strong>Description:</strong> {activity.description}</p>
                <p><strong>Time:</strong> {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                {activity.cost?.estimatedAmount > 0 && 
                    <p><strong>Cost:</strong> ${activity.cost.estimatedAmount.toFixed(2)} {activity.cost.currency}</p>
                }
                {activity.location?.address && 
                    <p><strong>Address:</strong> {activity.location.address}</p>
                }
                {activity.dressCode && 
                    <p><strong>Dress Code:</strong> {activity.dressCode}</p>
                }
                {activity.userNotes && 
                    <p><strong>Notes:</strong> {activity.userNotes}</p>
                }
                {activity.officialWebsite &&
                    <p><a href={activity.officialWebsite} target="_blank" rel="noopener noreferrer">Official Website</a></p>
                }
            </div>
        </div>
    );
};

export default ActivityDetailView;

