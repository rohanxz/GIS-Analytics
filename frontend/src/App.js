import React, { useState, useEffect, useRef } from 'react';
import { RiseLoader, ClimbingBoxLoader } from 'react-spinners';
import './App.css';

import MoodBoardView from './components/MoodBoardView';
import CalendarView from './components/CalendarView';
import MapView from './components/MapView';
import BudgetDashboardView from './components/BudgetDashboardView';
import ActivityDetailView from './components/ActivityDetailView';

// --- Reusable Modal Component ---
const Modal = ({ children, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <div className="modal-content-inner">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentView, setCurrentView] = useState({ viewType: null, payload: null, responseSummary: '', chatResponse: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [mapsApiKey, setMapsApiKey] = useState(null);
  const [appState, setAppState] = useState('initial');
  const chatHistoryRef = useRef(null);
  
  const [chatPosition, setChatPosition] = useState({ x: window.innerWidth - 420, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const [modalActivityId, setModalActivityId] = useState(null); // <-- State for the modal

  const suggestedQuestions = [
    "Show me a mood board of my trip.",
    "What's my schedule for the first day?",
    "Where are we going on Day 3?",
    "How much will this trip cost?",
  ];

  useEffect(() => {
    const fetchMapsKey = async () => {
      try {
        const response = await fetch('/api/maps-key');
        if (response.ok) {
          const data = await response.json();
          setMapsApiKey(data.apiKey);
        } else {
          console.error("Failed to fetch Google Maps API key.");
        }
      } catch (error) {
        console.error("Error fetching Google Maps API key:", error);
      }
    };
    fetchMapsKey();
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsClick(true);
    setDragStart({
        x: e.clientX - chatPosition.x,
        y: e.clientY - chatPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    setIsClick(false);
    if (isDragging) {
        setChatPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if(isClick) {
        setIsChatMinimized(!isChatMinimized);
    }
  };
  
  useEffect(() => {
      if(isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
  }, [isDragging, dragStart])


  const handleSendMessage = async (message) => {
    const userMessage = message.trim();
    if (!userMessage) return;

    if (appState === 'initial') {
      setAppState('active');
    }

    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setUserInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_123',
          session_id: sessionId,
          new_message: { parts: [{ text: userMessage }], role: 'user' },
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lastEventData = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.substring(6));
              if (eventData.session_id) setSessionId(eventData.session_id);
              else lastEventData = eventData;
            } catch(e) {
              console.error("Failed to parse SSE data chunk", line)
            }
          }
        }
      }

      if (lastEventData) {
        setCurrentView(lastEventData);
        setChatHistory(prev => [...prev, { role: 'assistant', content: lastEventData.chatResponse }]);
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, an error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDetails = (activityId) => {
    setModalActivityId(activityId);
  };
  
  const renderView = () => {
    if (isLoading && !currentView.viewType) {
        return <div className="main-spinner-container"><ClimbingBoxLoader color="#ff4081" /></div>;
    }
    if (!currentView.viewType) return <div className="welcome-message">Ask a question to start planning your trip!</div>;
    
    switch (currentView.viewType) {
      case 'mood_board_view': return <MoodBoardView payload={currentView.payload} onShowDetails={handleShowDetails} />;
      case 'calendar_view': return <CalendarView payload={currentView.payload} />;
      case 'map_view':
        if (!mapsApiKey) return <div>Map is unavailable. API key is missing.</div>;
        return <MapView payload={currentView.payload} apiKey={mapsApiKey} onShowDetails={handleShowDetails}/>;
      case 'budget_view': return <BudgetDashboardView payload={currentView.payload} />;
      case 'activity_detail_view': return <ActivityDetailView payload={currentView.payload} />;
      default: return <div><p>{currentView.chatResponse}</p></div>
    }
  };
  
  const handleSuggestionClick = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className={`app-container ${appState}`}>
      {appState === 'initial' ? (
        <div className="initial-view">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }} className="initial-form">
            <input
              type="text"
              className="initial-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a follow-up question..."
            />
          </form>
           <div className="suggestion-container">
            {suggestedQuestions.map((q, i) => (
              <button key={i} className="suggestion-bubble" onClick={() => handleSuggestionClick(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <main className="main-view">
            <h1 className="view-title">{currentView.responseSummary}</h1>
            {renderView()}
          </main>
          <aside 
            className={`chat-panel ${isChatMinimized ? 'minimized' : ''}`}
            style={{ top: `${chatPosition.y}px`, left: `${chatPosition.x}px` }}
          >
            <div className="chat-panel-header" onMouseDown={handleMouseDown}>
                <div className="drag-handle"></div>
            </div>
            <div className="chat-history" ref={chatHistoryRef}>
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>{msg.content}</div>
              ))}
               <div className="suggestion-container">
                {chatHistory.length > 0 && !isLoading && suggestedQuestions.map((q, i) => (
                  <button key={i} className="suggestion-bubble" onClick={() => handleSuggestionClick(q)}>
                    {q}
                  </button>
                ))}
              </div>
              {isLoading && <div className="chat-spinner-container"><RiseLoader color="#ff4081" size={8}/></div>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }} className="chat-form">
              <input
                type="text"
                className="chat-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a follow-up question..."
              />
            </form>
          </aside>
           {modalActivityId && (
                <Modal onClose={() => setModalActivityId(null)}>
                    <ActivityDetailView payload={{ activityId: modalActivityId }} />
                </Modal>
            )}
        </>
      )}
    </div>
  );
}


export default App;

