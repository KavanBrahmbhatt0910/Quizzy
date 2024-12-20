import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PlayerLobbyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, playerName } = location.state || {};
  const [playerStatus, setPlayerStatus] = useState('Waiting');
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    if (!gameCode || !playerName) return;

    // Connect to the WebSocket
    const socket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?roomCode=${gameCode}&userType=player`);

    // Set the WebSocket instance
    setWebSocket(socket);

    // Event: On Connection Open
    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    // Event: On Message Received
    socket.onmessage = (event) => {
      console.log('Message received:', event.data);
      const message = JSON.parse(event.data);

      if (message.action === 'startQuiz') {
        setPlayerStatus('Game Started');
        navigate('/quiz-game', { state: { gameCode, playerName } });
      }
    };

    // Event: On Connection Close
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Event: On Connection Error
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Clean up on component unmount
    return () => {
      // socket.close();
    };
  }, [gameCode, playerName, navigate]);

  if (!gameCode || !playerName) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <p className="text-white text-2xl">Invalid Game Access</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4 text-center">Waiting Room</h2>
        
        <div className="mb-6 text-center">
          <p className="text-lg">Game Code</p>
          <p className="text-4xl font-bold text-blue-600 tracking-widest mb-2">{gameCode}</p>
          <p className="text-xl">Welcome, {playerName}!</p>
        </div>

        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-gray-700">Game Status</p>
          <div className="flex justify-center items-center mt-2">
            <div className={`w-4 h-4 rounded-full mr-2 ${playerStatus === 'Waiting' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <p className="text-gray-600">{playerStatus === 'Waiting' ? 'Waiting for game to start...' : 'Game has started!'}</p>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <p className="text-yellow-700">
            Please keep this screen open. The game will begin shortly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerLobbyPage;
