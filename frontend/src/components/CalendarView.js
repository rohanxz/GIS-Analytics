import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ClimbingBoxLoader } from 'react-spinners';

const CalendarView = ({ payload }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalendarData = async () => {
            // --- ROBUSTNESS FIX ---
            // If the payload is empty or dayNumbers is not a valid array, default to all days.
            const daysToFetch = (payload && Array.isArray(payload.dayNumbers) && payload.dayNumbers.length > 0)
                ? payload.dayNumbers
                : [1, 2, 3, 4, 5, 6, 7]; // Default to all 7 days as a fallback

            setLoading(true);
            try {
                const dayDataPromises = daysToFetch.map(dayNum =>
                    fetch(`/api/day/${dayNum}`).then(res => res.json())
                );
                
                const daysData = await Promise.all(dayDataPromises);

                const calendarEvents = daysData.flatMap(day =>
                    (day.activities || []).map(act => ({
                        id: act.id,
                        title: act.name,
                        start: act.startTime,
                        end: act.endTime,
                    }))
                );
                setEvents(calendarEvents);
            } catch (error) {
                console.error("Failed to fetch calendar data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendarData();
    }, [payload]);

    if (loading) {
        return <div className="main-spinner-container"><ClimbingBoxLoader color="#ff4081" /></div>;
    }

    return (
        <div className="calendar-container">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                initialDate="2025-09-01"
                events={events}
                height="auto"
                allDaySlot={false}
                eventColor="rgba(255, 64, 129, 0.7)"
                slotMinTime="06:00:00"
                slotMaxTime="24:00:00"
                 headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
            />
        </div>
    );
};

export default CalendarView;

