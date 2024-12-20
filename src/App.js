import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all the pages
import LandingPage from './pages/lodingPage';
import CreateQuizPage from './pages/createQuizPage';
import JoinGamePage from './pages/joinGamePage';
import PlayerLobbyPage from './pages/playerLobbyPage';
import QuizGamePage from './pages/quizGamePage';
import QuizResultPage from './pages/quizResultPage';
import LeaderboardPage from './pages/leaderBoardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-quiz" element={<CreateQuizPage />} />
        <Route path="/join-game" element={<JoinGamePage />} />
        <Route path="/player-lobby" element={<PlayerLobbyPage />} />
        <Route path="/quiz-game" element={<QuizGamePage />} />
        <Route path="/quiz-result" element={<QuizResultPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;