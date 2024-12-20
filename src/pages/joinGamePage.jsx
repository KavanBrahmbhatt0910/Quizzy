import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinGamePage = () => {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const request = {
        'roomCode': gameCode,
        'participantName': playerName
      };

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/join-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      if (response.ok && data.statusCode === 200) {
        navigate('/player-lobby', { state: { gameCode, playerName, ...data } });
      } else {
        setError(data.message || 'Failed to join game');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Join Quiz</h1>
        
        {error && (
          <div className="mb-6 text-red-600 text-center font-semibold bg-red-50 p-4 rounded-lg border-2 border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleJoinGame}>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Game Code</label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 6-digit game code"
              maxLength="6"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinGamePage;
