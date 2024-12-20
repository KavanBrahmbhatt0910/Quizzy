import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-blue-800 mb-12 text-center">Quizzy</h1>
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <div className="space-y-6">
          <Link 
            to="/create-quiz" 
            className="block w-full bg-blue-500 text-white py-4 text-center rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-semibold"
          >
            Create Quiz
          </Link>
          <Link 
            to="/join-game" 
            className="block w-full bg-green-500 text-white py-4 text-center rounded-lg hover:bg-green-600 transition duration-300 text-lg font-semibold"
          >
            Join Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;