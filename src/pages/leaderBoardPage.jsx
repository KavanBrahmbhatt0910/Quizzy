import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomCode } = location.state || {}; // Ensure you use roomCode here
  const [leaderboard, setLeaderboard] = useState([]);
  const [socket, setSocket] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!roomCode) { // Make sure roomCode is being used
      navigate('/');
      return;
    }

    // Establish WebSocket connection
    const socketConnection = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?roomCode=${roomCode}&userType=host`);
    setSocket(socketConnection);

    socketConnection.onopen = () => console.log('Connected to WebSocket');

    // Listen for WebSocket messages
    socketConnection.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.action === 'scoreUpdate') {
        setLeaderboard((prev) => [...prev, { name: message.playerName, score: message.score }]);
      }
    };

    socketConnection.onclose = () => console.log('WebSocket disconnected');
    socketConnection.onerror = (error) => console.error('WebSocket error:', error);
    
    return () => {
      socketConnection.close();
    }
  }, [roomCode, navigate]);

  const handleSendEmail = async () => {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }
  
    if (leaderboard.length === 0) {
      alert("No leaderboard data to send.");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendEmail",
          roomCode,
          email,
          leaderboard,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        setEmailSent(true);
        alert("Leaderboard results sent successfully!");
      } else {
        console.error("Error sending email:", result.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <p className="text-white text-2xl">Invalid Room Access</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg text-center">
        <h2 className="text-4xl font-bold mb-4 text-green-600">Leaderboard</h2>
        <p className="text-lg mb-6">Room Code: {roomCode}</p>

        {leaderboard.length === 0 ? (
          <p className="text-gray-700">No scores yet. Waiting for players to submit answers...</p>
        ) : (
          <ul className="space-y-4">
            {leaderboard.map((entry, index) => (
              <li key={index} className="bg-blue-100 p-4 rounded-lg flex justify-between">
                <span>{entry.name}</span>
                <span className="font-bold">{entry.score}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <input
            type="email"
            className="border p-2 rounded w-full mb-4"
            placeholder="Enter your email to get results"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleSendEmail}
          >
            Send Results
          </button>
          {emailSent && <p className="text-green-700 mt-4">Email sent successfully!</p>}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
