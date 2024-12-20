import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, playerName, score, totalQuestions } = location.state || {};
  const [socket, setSocket] = useState(null);

  const handlePlayAgain = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!gameCode || !playerName || totalQuestions === undefined) return;

    // Establish WebSocket connection
    const socketConnection = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?roomCode=${gameCode}&userType=player`);
    setSocket(socketConnection);

    socketConnection.onopen = () => {
      console.log('WebSocket connected');

      // Send the result to the leaderboard
      const percentageScore = ((score / totalQuestions) * 100).toFixed(2);
      socketConnection.send(
        JSON.stringify({
          action: 'scoreUpdate',
          roomCode: gameCode,
          playerName: playerName,
          score: percentageScore,
        })
      );
    };

    socketConnection.onclose = () => console.log('WebSocket disconnected');
    socketConnection.onerror = (error) => console.error('WebSocket error:', error);

    return () => {
      socketConnection.close();
    };
  }, [gameCode, playerName, score, totalQuestions]);

  if (!gameCode || !playerName || totalQuestions === undefined) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <p className="text-white text-2xl">Invalid Result Access</p>
      </div>
    );
  }

  const percentageScore = ((score / totalQuestions) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-4xl font-bold mb-4 text-green-600">Game Over!</h2>
        
        <div className="mb-6">
          <p className="text-2xl font-semibold">Player: {playerName}</p>
          <p className="text-lg text-gray-600">Game Code: {gameCode}</p>
        </div>

        <div className="bg-blue-100 rounded-lg p-6 mb-6">
          <p className="text-3xl font-bold text-blue-700">Your Score</p>
          <p className="text-5xl font-extrabold text-green-600 mt-2">
            {percentageScore}%
          </p>
          <p className="text-xl mt-2 text-gray-700">
            ({score} out of {totalQuestions})
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePlayAgain}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/join-game')}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Join Another Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
