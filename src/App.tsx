import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import QuestionsScreen from './components/QuestionsScreen';
import ResultsScreen from './components/ResultsScreen';
import CreateQuestionScreen from './components/CreateQuestionScreen';
import socketService from './services/socketService';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [userSocketId, setUserSocketId] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const socket = await socketService.connect();
        setIsConnected(true);
        setUserSocketId(socket.id || '');
        setConnectionError(null);
        
        socketService.onUserJoined((data) => {
          console.log('User joined:', data);
        });
        
      } catch (error) {
        console.error('Failed to connect to server:', error);
        setConnectionError('Failed to connect to server. Please check if the server is running.');
        setIsConnected(false);
      }
    };

    initializeConnection();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && isConnected) {
      socketService.joinUser(username.trim());
      setShowUsernameModal(false);
    }
  };

  const handleRetryConnection = () => {
    setConnectionError(null);
    window.location.reload();
  };

  if (connectionError) {
    return (
      <div className="app">
        <div className="connection-error">
          <div className="error-content">
            <h2>🔌 Connection Error</h2>
            <p>{connectionError}</p>
            <div className="error-actions">
              <button onClick={handleRetryConnection} className="retry-btn">
                🔄 Retry Connection
              </button>
            </div>
            <div className="server-instructions">
              <h4>To start the server:</h4>
              <ol>
                <li>Navigate to the backend folder</li>
                <li>Run: <code>npm install</code></li>
                <li>Run: <code>npm run dev</code></li>
                <li>Make sure MongoDB is running</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showUsernameModal || !username) {
    return (
      <div className="app">
        <div className="username-modal">
          <div className="modal-content">
            <h2>🎯 Welcome to Live Polling</h2>
            <p>Enter your name to start voting and creating questions</p>
            
            <form onSubmit={handleUsernameSubmit} className="username-form">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                maxLength={50}
                autoFocus
                required
              />
              <button 
                type="submit" 
                disabled={!username.trim() || !isConnected}
              >
                {!isConnected ? 'Connecting...' : 'Join Polling'}
              </button>
            </form>
            
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Router>
        <nav className="main-nav">
          <div className="nav-brand">
            <h1>🎯 Live Polling</h1>
            <div className="user-info">
              <span className="username">👤 {username}</span>
              <span className="connection-status">
                {isConnected ? '🟢' : '🔴'}
              </span>
            </div>
          </div>
          
          <div className="nav-links">
            <NavLink 
              to="/questions" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              🗳️ Vote
            </NavLink>
            <NavLink 
              to="/results" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              📊 Results
            </NavLink>
            <NavLink 
              to="/create" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              ➕ Create
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<QuestionsScreen userSocketId={userSocketId} />} />
            <Route path="/questions" element={<QuestionsScreen userSocketId={userSocketId} />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/create" element={<CreateQuestionScreen />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;