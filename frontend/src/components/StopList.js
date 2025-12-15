import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faBox, faClock, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

const StopList = ({ stops, onSelect, selectedId }) => {
    // Determine which item is expanded. If selectedId is passed, expand that one, otherwise local state.
    // However, usually accordion allows manual toggle.
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(prev => (prev === id ? null : id));
        if (onSelect && id !== expandedId) {
            onSelect(id);
        }
    };

    // React to external selection (map marker click)
    React.useEffect(() => {
        if (selectedId) {
            setExpandedId(selectedId);
        }
    }, [selectedId]);

    if (!stops || stops.length === 0) {
        return <div className="stop-list-empty">No stops found.</div>;
    }

    return (
        <div className="stop-list-sidebar">
            <div className="stop-list-header">
                <h3>Stops ({stops.length})</h3>
            </div>
            <div className="stop-list-content">
                {stops.map((stop, index) => {
                    const isExpanded = expandedId === stop.id;
                    return (
                        <div
                            key={stop.id}
                            className={`stop-item ${isExpanded ? 'expanded' : ''} ${selectedId === stop.id ? 'selected' : ''}`}
                        >
                            <div className="stop-header" onClick={() => toggleExpand(stop.id)}>
                                <div className="stop-index-bubble">{index + 1}</div>
                                <div className="stop-info-summary">
                                    <div className="stop-customer-name">{stop.name}</div>
                                    <div className="stop-address-preview">{stop.location?.address || "Address not available"}</div>
                                </div>
                                <div className="stop-expand-icon">
                                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="stop-details">
                                    <div className="detail-row">
                                        <div className="detail-icon"><FontAwesomeIcon icon={faUser} /></div>
                                        <div className="detail-text">
                                            <span className="label">Customer:</span> {stop.name}
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></div>
                                        <div className="detail-text">
                                            <span className="label">Address:</span> {stop.location?.address || "N/A"}
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-icon"><FontAwesomeIcon icon={faBox} /></div>
                                        <div className="detail-text">
                                            <span className="label">Packages:</span> {stop.packages || "1 Item"}
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-icon"><FontAwesomeIcon icon={faClock} /></div>
                                        <div className="detail-text">
                                            <span className="label">ETA:</span> {stop.eta || "Pending"}
                                        </div>
                                    </div>
                                    <div className="detail-status">
                                        <span className={`status-badge ${stop.status?.toLowerCase() || 'pending'}`}>
                                            {stop.status || "Pending"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StopList;
